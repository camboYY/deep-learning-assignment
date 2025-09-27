# ---------- Stage 1: Builder ----------
FROM python:3.11-slim AS builder

# Install system dependencies for building wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    cmake \
    git \
    wget \
    curl \
    unzip \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    ffmpeg \
    patchelf \
 && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Upgrade pip and install Python packages
RUN pip install --upgrade pip \
 && pip install --no-cache-dir --prefer-binary -r requirements.txt

# Patch ONNX Runtime .so (fix execstack issue)
RUN patchelf --clear-execstack /usr/local/lib/python3.11/site-packages/onnxruntime/capi/onnxruntime_pybind11_state*.so || true

# Pre-download buffalo_l model to avoid first-run download
RUN python -c "from insightface.app import FaceAnalysis; app = FaceAnalysis(name='buffalo_l'); app.prepare(ctx_id=0)"

# ---------- Stage 2: Runtime ----------
FROM python:3.11-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    ffmpeg \
    patchelf \
 && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

# Patch ONNX Runtime in runtime image
RUN patchelf --clear-execstack /usr/local/lib/python3.11/site-packages/onnxruntime/capi/onnxruntime_pybind11_state*.so || true

# Copy application code
WORKDIR /app
COPY . /app

# Expose port and run FastAPI
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
