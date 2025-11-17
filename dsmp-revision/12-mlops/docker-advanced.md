# Docker Advanced Topics for ML

## What You'll Learn

This guide takes your Docker skills to the next level with multi-stage builds, GPU support, and optimization techniques. You'll discover how to create production-grade images that are small, secure, and blazingly fast to build. These techniques separate amateur containerization from professional deployment.

## Multi-Stage Builds

Multi-stage builds create smaller images by separating the build environment from the runtime environment. The final image only contains what's needed to run, not build.

### The Problem with Single-Stage Builds

```dockerfile
# Single-stage: Everything in one image (LARGE)
FROM python:3.9

WORKDIR /app

# Build tools needed during installation
RUN apt-get update && apt-get install -y build-essential gcc

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "src/serve.py"]

# Result: 1.5 GB image (includes build tools you don't need at runtime)
```

### Multi-Stage Build Solution

```dockerfile
# Multi-stage Dockerfile for production
# Stage 1: Build stage
FROM python:3.9 as builder

WORKDIR /app

# Install dependencies in a virtual environment
COPY requirements.txt .
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Runtime stage
FROM python:3.9-slim

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Set environment variables
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

# Copy application
COPY src/ ./src/
COPY models/ ./models/
COPY config/ ./config/

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["python", "src/serve.py"]

# Result: 400 MB image (73% smaller!)
```

### How Multi-Stage Builds Work

```
Stage 1 (builder):
├─ Install build tools
├─ Compile dependencies
└─ Create virtual environment

Stage 2 (runtime):
├─ Use slim base image
├─ Copy only the virtual environment
├─ Copy application code
└─ Final lightweight image
```

Only the final stage becomes the image. Previous stages are discarded after extracting what you need.

## GPU-Enabled Docker Images

Deep learning requires GPU support. NVIDIA provides CUDA-enabled base images:

```dockerfile
# GPU-enabled Dockerfile
FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04

# Install Python
RUN apt-get update && apt-get install -y \
    python3.9 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install PyTorch with CUDA support
COPY requirements.txt .
RUN pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
RUN pip3 install -r requirements.txt

# Copy application
COPY . .

# Verify GPU availability
RUN python3 -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}')"

EXPOSE 8000

CMD ["python3", "src/serve.py"]
```

### Running GPU Containers

```bash
# Install nvidia-docker (one-time setup)
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update && sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker

# Run with GPU access
docker run --gpus all -it ml-model-gpu:v1

# Run with specific GPUs
docker run --gpus '"device=0,1"' ml-model-gpu:v1  # Use GPU 0 and 1

# Check GPU inside container
docker run --gpus all nvidia/cuda:11.8.0-base nvidia-smi
```

### Choosing the Right CUDA Image

| Image Tag | Size | Use Case |
|-----------|------|----------|
| `cuda:11.8.0-base` | Small | CUDA runtime only |
| `cuda:11.8.0-runtime` | Medium | Runtime + libraries |
| `cuda:11.8.0-devel` | Large | Full development environment |
| `cuda:11.8.0-cudnn8-runtime` | Medium | Runtime + cuDNN (for deep learning) |

For inference, use `runtime` or `cudnn8-runtime`.
For training, use `devel` if you need to compile extensions.

## Layer Caching Optimization

Docker caches each layer. Understanding this is key to fast builds:

```dockerfile
# Optimize for caching
FROM python:3.9-slim

# Layers that rarely change (bottom)
RUN apt-get update && apt-get install -y build-essential

# Dependencies (change occasionally)
COPY requirements.txt .
RUN pip install -r requirements.txt

# Application code (changes frequently, top)
COPY src/ ./src/

# Result: Code changes only rebuild the last layer
```

### Cache Busting

When you need to force a rebuild:

```bash
# Rebuild without cache
docker build --no-cache -t ml-model:v1 .

# Rebuild from specific layer
docker build --cache-from ml-model:v1 -t ml-model:v2 .
```

## Security Best Practices

### Running as Non-Root User

```dockerfile
# Create and use non-root user
FROM python:3.9-slim

WORKDIR /app

# Install dependencies as root
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application
COPY src/ ./src/

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Change ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

CMD ["python", "src/serve.py"]
```

### Scanning for Vulnerabilities

```bash
# Scan image for vulnerabilities (requires Docker Scout or Trivy)
docker scout cves ml-model:v1

# Using Trivy
trivy image ml-model:v1
```

## Advanced Build Arguments

Pass build-time variables:

```dockerfile
# Dockerfile with build args
FROM python:3.9-slim

ARG MODEL_VERSION=v1.0
ARG ENVIRONMENT=production

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ ./src/

# Use build arg to download specific model version
RUN python src/download_model.py --version ${MODEL_VERSION}

# Set environment variable from build arg
ENV MODEL_VERSION=${MODEL_VERSION}
ENV ENVIRONMENT=${ENVIRONMENT}

CMD ["python", "src/serve.py"]
```

```bash
# Build with custom arguments
docker build \
  --build-arg MODEL_VERSION=v2.0 \
  --build-arg ENVIRONMENT=staging \
  -t ml-model:v2.0-staging .
```

## Health Checks

Add health checks to monitor container health:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ ./src/

EXPOSE 8000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

CMD ["python", "src/serve.py"]
```

```bash
# Check container health status
docker ps  # Shows health status
docker inspect ml-service | grep Health
```

## Handling Model Files

Large model files shouldn't be baked into images. Download at runtime:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt boto3

# Copy application code (NOT model)
COPY src/ ./src/

# Copy download script
COPY scripts/download_model.sh /app/

# Make script executable
RUN chmod +x /app/download_model.sh

# Download model at startup, then run app
CMD ["/bin/bash", "-c", "/app/download_model.sh && python src/serve.py"]
```

```bash
# scripts/download_model.sh
#!/bin/bash
set -e

MODEL_URL=${MODEL_URL:-"s3://my-bucket/models/model.pkl"}
MODEL_PATH=${MODEL_PATH:-"/app/models/model.pkl"}

echo "Downloading model from ${MODEL_URL}..."
aws s3 cp "${MODEL_URL}" "${MODEL_PATH}"
echo "Model downloaded successfully!"
```

## Best Practices Summary

**1. Use Multi-Stage Builds**
Reduces image size by 50-80%.

**2. Minimize Layers**
Combine related RUN commands.

**3. Order by Change Frequency**
Stable instructions first, code last.

**4. Run as Non-Root**
Essential for security.

**5. Use .dockerignore**
Exclude unnecessary files.

**6. Add Health Checks**
Enable container orchestration.

**7. Tag Specifically**
Never use `latest` in production.

## Common Pitfalls

**Building Everything in One Stage**
Results in bloated images with unnecessary build tools.

**Copying Code Before Dependencies**
Breaks caching on every code change.

**Running as Root**
Security vulnerability.

**No Health Checks**
Kubernetes can't detect if your app is healthy.

## Quick Reference

```dockerfile
# Multi-stage build template
FROM python:3.9 as builder
RUN pip install -r requirements.txt

FROM python:3.9-slim
COPY --from=builder /root/.local /root/.local
COPY src/ ./src/
CMD ["python", "src/serve.py"]

# GPU support
FROM nvidia/cuda:11.8.0-cudnn8-runtime
docker run --gpus all image

# Non-root user
RUN useradd -m appuser
USER appuser

# Health check
HEALTHCHECK --interval=30s CMD curl -f http://localhost/health || exit 1
```

---

**Navigation:**
[← Previous: Docker Fundamentals](./docker-fundamentals.md) | [Next: Docker Compose →](./docker-compose.md)

**Related Topics:**
- [Docker Best Practices](./docker-best-practices.md)
- [Kubernetes ML Deployment](./kubernetes-ml-deployment.md)
