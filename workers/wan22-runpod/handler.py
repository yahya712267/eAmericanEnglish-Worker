import base64
import os
import subprocess
import tempfile
from pathlib import Path

import requests
import runpod
from huggingface_hub import snapshot_download

WAN_ROOT = Path(os.environ.get("WAN22_ROOT", "/opt/Wan2.2"))
MODEL_ROOT = Path(os.environ.get("MODEL_ROOT", "/runpod-volume/models/Wan2.2-TI2V-5B"))
CACHED_MODEL_ROOT = Path("/runpod-volume/huggingface-cache/hub/models--Wan-AI--Wan2.2-TI2V-5B/snapshots")
MAX_RESPONSE_BYTES = 7_000_000


def resolve_model() -> Path:
    cached_snapshots = sorted(CACHED_MODEL_ROOT.glob("*")) if CACHED_MODEL_ROOT.exists() else []
    if cached_snapshots:
        return cached_snapshots[-1]
    if (MODEL_ROOT / "models_t5_umt5-xxl-enc-bf16.pth").exists():
        return MODEL_ROOT
    MODEL_ROOT.mkdir(parents=True, exist_ok=True)
    snapshot_download("Wan-AI/Wan2.2-TI2V-5B", local_dir=MODEL_ROOT)
    return MODEL_ROOT


def download_reference(url: str, directory: Path) -> Path:
    target = directory / "reference-image"
    response = requests.get(url, timeout=60, stream=True)
    response.raise_for_status()
    content_type = response.headers.get("content-type", "")
    if not content_type.startswith("image/"):
        raise ValueError("Reference URL must return an image.")
    with target.open("wb") as output:
        for chunk in response.iter_content(1024 * 1024):
            output.write(chunk)
            if output.tell() > 20_000_000:
                raise ValueError("Reference image exceeds 20 MB.")
    return target


def handler(job):
    payload = job.get("input") or {}
    prompt = str(payload.get("prompt", "")).strip()
    if not prompt or len(prompt) > 5000:
        return {"error": "A prompt between 1 and 5000 characters is required."}

    size = payload.get("size", "1280*704")
    if size not in {"1280*704", "704*1280"}:
        return {"error": "The proof worker supports landscape or portrait output."}
    frame_count = int(payload.get("frame_count", 49))
    if frame_count < 25 or frame_count > 121 or (frame_count - 1) % 4:
        return {"error": "frame_count must be 4n+1 between 25 and 121."}

    model_root = resolve_model()
    runpod.serverless.progress_update(job, "Wan2.2 model is ready; generation started.")

    with tempfile.TemporaryDirectory() as temp_dir_name:
        temp_dir = Path(temp_dir_name)
        output_path = temp_dir / "wan22-proof.mp4"
        command = [
            "python", str(WAN_ROOT / "generate.py"),
            "--task", "ti2v-5B",
            "--size", size,
            "--ckpt_dir", str(model_root),
            "--offload_model", "True",
            "--convert_model_dtype",
            "--t5_cpu",
            "--frame_num", str(frame_count),
            "--base_seed", str(int(payload.get("seed", 42))),
            "--prompt", prompt,
            "--save_file", str(output_path),
        ]
        reference_url = payload.get("reference_image_url")
        if reference_url:
            command.extend(["--image", str(download_reference(reference_url, temp_dir))])

        completed = subprocess.run(command, cwd=WAN_ROOT, capture_output=True, text=True, timeout=1800)
        if completed.returncode != 0:
            return {"error": "Wan2.2 generation failed.", "details": completed.stderr[-3000:]}
        if not output_path.exists():
            return {"error": "Wan2.2 completed without producing an MP4."}
        if output_path.stat().st_size > MAX_RESPONSE_BYTES:
            return {"error": "Generated MP4 exceeds the proof response limit; external object storage is required."}

        return {
            "content_type": "video/mp4",
            "video_base64": base64.b64encode(output_path.read_bytes()).decode("ascii"),
            "bytes": output_path.stat().st_size,
            "model": "Wan2.2-TI2V-5B",
        }


if __name__ == "__main__":
    runpod.serverless.start({"handler": handler})
