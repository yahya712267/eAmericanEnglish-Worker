# Self-hosted video generation

## Decision

The Prompt-led Video Generator will use the Apache-2.0-licensed Wan2.2 model family on infrastructure controlled by eAmericanEnglish. Paid generation APIs are not part of the primary implementation.

- `Wan2.2-TI2V-5B`: prompt-to-video and prompt-plus-image generation; 720p at 24 fps; minimum 24 GB NVIDIA VRAM.
- `Wan2.2-S2V-14B`: prompt, reference image, and audio-driven generation; minimum 80 GB NVIDIA VRAM.
- `Wan2.2-Animate-14B`: reference-image plus reference-motion-video generation; plan for 80 GB NVIDIA VRAM.

The application contract lives in `src/lib/video-generation/provider.ts`. Model selection is isolated in `src/lib/video-generation/wan.ts`. The frontend remains disconnected until a real self-hosted generation completes successfully.

## GPU proof sequence

1. Provision an eAmericanEnglish-controlled Linux host with an NVIDIA GPU, 100 GB or more free SSD space, and FFmpeg. Start with a 24 GB GPU for TI2V-5B; use an 80 GB GPU for S2V-14B.
2. Install a current NVIDIA driver and compatible CUDA toolkit.
3. Create an isolated Python environment and install PyTorch 2.4 or newer with CUDA support.
4. Clone `https://github.com/Wan-Video/Wan2.2.git` at a pinned release or commit.
5. Install the repository requirements. Add `requirements_s2v.txt` only on the audio worker.
6. Download weights from the official `Wan-AI` Hugging Face organization into persistent model storage.
7. Run the official TI2V-5B command with model offloading, dtype conversion, T5 CPU offload, a short prompt, and the smallest supported test output.
8. Confirm that a playable MP4 was produced and record generation time, peak VRAM, RAM, and disk use.
9. Repeat on an 80 GB worker with S2V-14B using a short, rights-cleared WAV file and reference image.
10. Only after both proofs pass, place a private authenticated job service in front of the workers and implement `VideoGenerationProvider` against it.

## Service boundary

The future worker accepts the neutral `VideoGenerationInput` shape, stores uploads outside the web process, chooses a Wan model by capability, queues long-running work, and returns a job identifier. The web application polls job state and never receives GPU credentials or direct model-host access.

Required production controls include authenticated requests, approved-user authorization, signed upload/output URLs, strict file size and MIME validation, timeouts, concurrency limits, audit metadata, and deletion/retention rules. Model checkpoints and generated media must not be committed to this repository.

## License

Wan2.2 source code and official model repositories declare Apache License 2.0. This permits commercial use, modification, and self-hosted deployment subject to the license notices. It does not grant rights to third-party prompts, music, likenesses, trademarks, reference media, or generated content that infringes others' rights.
