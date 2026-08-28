FROM pytorch/pytorch:2.6.0-cuda12.4-cudnn9-devel

ARG WAN22_COMMIT=42bf4cfaa384bc21833865abc2f9e6c0e67233dc
ENV DEBIAN_FRONTEND=noninteractive \
    WAN22_ROOT=/opt/Wan2.2 \
    MODEL_ROOT=/runpod-volume/models/Wan2.2-TI2V-5B \
    HF_HOME=/runpod-volume/huggingface \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg git && rm -rf /var/lib/apt/lists/*
RUN git clone https://github.com/Wan-Video/Wan2.2.git ${WAN22_ROOT} \
    && cd ${WAN22_ROOT} \
    && git checkout ${WAN22_COMMIT}
RUN pip install --no-cache-dir --upgrade pip setuptools wheel ninja packaging \
    && grep -v -E '^(torch|torchvision|torchaudio|flash_attn)' ${WAN22_ROOT}/requirements.txt > /tmp/wan-requirements.txt \
    && pip install --no-cache-dir -r /tmp/wan-requirements.txt \
    && pip install --no-cache-dir flash-attn --no-build-isolation

COPY requirements.txt /tmp/worker-requirements.txt
RUN pip install --no-cache-dir -r /tmp/worker-requirements.txt
COPY handler.py /opt/worker/handler.py

WORKDIR /opt/worker
CMD ["python", "-u", "handler.py"]
