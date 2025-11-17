# Docker Best Practices and Common Pitfalls

## What You'll Learn

This guide consolidates battle-tested Docker practices learned from production ML deployments. You'll discover how to avoid common mistakes that lead to bloated images, slow builds, security vulnerabilities, and failed deployments. These patterns separate reliable systems from ones that break at 3 AM.

## Dockerfile Best Practices

### 1. Use Specific Version Tags

Always pin versions to ensure reproducibility:

```dockerfile
# Good: Specific version
FROM python:3.9.15-slim

# Bad: Version changes unexpectedly
FROM python:latest

# Bad: Too broad, gets updates
FROM python:3.9

# Best: Immutable digest
FROM python:3.9.15-slim@sha256:abc123...
```

### 2. Minimize Layers

Each RUN, COPY, ADD creates a layer. Combine related commands:

```dockerfile
# Good: Single RUN command
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Bad: Multiple RUN commands create unnecessary layers
RUN apt-get update
RUN apt-get install -y build-essential
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*  # Doesn't reduce previous layer size!
```

### 3. Order Instructions by Change Frequency

Leverage Docker's layer caching:

```dockerfile
# Optimal ordering (stable → frequently changing)

FROM python:3.9-slim

# 1. System dependencies (rarely change)
RUN apt-get update && apt-get install -y build-essential

# 2. Python dependencies (change occasionally)
COPY requirements.txt .
RUN pip install -r requirements.txt

# 3. Application code (changes frequently)
COPY src/ ./src/

# Result: Code changes only rebuild the last layer
```

### 4. Use .dockerignore

Exclude unnecessary files from build context:

```
# .dockerignore
**/.git
**/__pycache__
**/.pytest_cache
*.pyc
.env
venv/
data/large_dataset.csv
notebooks/
*.md
tests/
```

This speeds up builds and reduces image size.

### 5. Run as Non-Root User

Never run containers as root:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies as root
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application
COPY src/ ./src/

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

CMD ["python", "src/serve.py"]
```

### 6. Use ENTRYPOINT and CMD Correctly

**ENTRYPOINT**: Main command that always runs
**CMD**: Default arguments (can be overridden)

```dockerfile
# Pattern 1: ENTRYPOINT + CMD (recommended)
ENTRYPOINT ["python"]
CMD ["src/serve.py"]

# Run normally
docker run ml-model  # Runs: python src/serve.py

# Override CMD
docker run ml-model src/train.py  # Runs: python src/train.py

# Pattern 2: CMD only
CMD ["python", "src/serve.py"]

# Override entire command
docker run ml-model python src/train.py
```

### 7. Add Health Checks

Enable orchestration platforms to monitor container health:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1
```

## Security Best Practices

### 1. Scan Images for Vulnerabilities

```bash
# Using Docker Scout
docker scout cves ml-model:v1

# Using Trivy
trivy image ml-model:v1

# Using Snyk
snyk container test ml-model:v1
```

### 2. Use Minimal Base Images

```dockerfile
# Good: Slim variants
FROM python:3.9-slim  # ~120 MB

# Bad: Full variants
FROM python:3.9       # ~1 GB

# Best: Distroless (when possible)
FROM gcr.io/distroless/python3  # ~50 MB
```

### 3. Don't Store Secrets in Images

```dockerfile
# Bad: Hardcoded secrets
ENV API_KEY="secret123"

# Bad: Secrets in build args (visible in history)
ARG API_KEY
ENV API_KEY=${API_KEY}

# Good: Pass at runtime
docker run -e API_KEY=${API_KEY} ml-model

# Best: Use secrets management
docker run --env-file .env.secret ml-model
```

### 4. Update Base Images Regularly

```bash
# Rebuild with latest security patches
docker pull python:3.9-slim
docker build --no-cache -t ml-model:v1 .
```

## Performance Best Practices

### 1. Leverage Build Cache

```dockerfile
# Cache pip packages
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

# Cache apt packages
RUN --mount=type=cache,target=/var/cache/apt \
    apt-get update && apt-get install -y build-essential
```

### 2. Use Multi-Stage Builds

Reduce final image size dramatically:

```dockerfile
FROM python:3.9 as builder
COPY requirements.txt .
RUN pip install --user -r requirements.txt

FROM python:3.9-slim
COPY --from=builder /root/.local /root/.local
COPY src/ ./src/
CMD ["python", "src/serve.py"]
```

### 3. Optimize Image Size

```bash
# Check image size
docker images ml-model

# Analyze layers
docker history ml-model:v1

# Remove intermediate images
docker image prune
```

## Common Pitfalls and Solutions

### Pitfall 1: Large Image Sizes

**Problem**: Docker image is 5+ GB

**Solutions**:
```dockerfile
# Use slim base images
FROM python:3.9-slim  # Not python:3.9

# Use multi-stage builds
# Clean up in same layer
RUN apt-get update && apt-get install -y build-essential \
    && pip install -r requirements.txt \
    && apt-get purge -y --auto-remove build-essential \
    && rm -rf /var/lib/apt/lists/*

# Don't include unnecessary files
# Add comprehensive .dockerignore
```

### Pitfall 2: Slow Builds

**Problem**: Every code change triggers 10-minute rebuild

**Solutions**:
```dockerfile
# Copy dependencies before code
COPY requirements.txt .
RUN pip install -r requirements.txt  # Cached if requirements.txt unchanged

COPY src/ ./src/  # Only this layer rebuilds on code changes
```

### Pitfall 3: Container Exits Immediately

**Problem**: `docker run` exits with error

**Debug Steps**:
```bash
# Check logs
docker logs <container-id>

# Run interactively
docker run -it ml-model bash

# Override entrypoint
docker run --entrypoint /bin/bash -it ml-model

# Check if process keeps running
docker run -d ml-model
docker exec -it <container-id> ps aux
```

### Pitfall 4: Permission Issues

**Problem**: "Permission denied" in container

**Solutions**:
```dockerfile
# Set correct ownership
COPY --chown=appuser:appuser . .

# Or fix permissions
RUN chown -R appuser:appuser /app

# Make scripts executable
COPY scripts/entrypoint.sh .
RUN chmod +x entrypoint.sh
```

### Pitfall 5: GPU Not Available

**Problem**: `torch.cuda.is_available()` returns False

**Solutions**:
```bash
# Install nvidia-docker
# Run with --gpus flag
docker run --gpus all ml-model

# Verify NVIDIA runtime
docker run --rm --gpus all nvidia/cuda:11.8.0-base nvidia-smi

# In docker-compose.yml
services:
  ml-api:
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

### Pitfall 6: Out of Memory

**Problem**: Container killed with OOMKilled

**Solutions**:
```bash
# Set memory limits
docker run -m 4g ml-model

# In docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 4G

# Monitor memory usage
docker stats
```

### Pitfall 7: Network Issues

**Problem**: Container can't reach database/API

**Solutions**:
```bash
# Use service names in docker-compose
# Not localhost, not 127.0.0.1

# Python example
DATABASE_URL = "postgresql://user:pass@db:5432/mldb"  # 'db' is service name

# Debug networking
docker network ls
docker network inspect bridge
docker exec container ping db
```

## Production Deployment Checklist

Before deploying to production:

**Security**
- [ ] Running as non-root user
- [ ] No secrets in image
- [ ] Image scanned for vulnerabilities
- [ ] Using specific version tags

**Performance**
- [ ] Image size < 1 GB (ideally < 500 MB)
- [ ] Health check configured
- [ ] Resource limits set
- [ ] Multi-stage build used

**Reliability**
- [ ] Graceful shutdown handling
- [ ] Restart policy configured
- [ ] Logging to stdout/stderr
- [ ] Monitoring endpoints exposed

**Documentation**
- [ ] README with build/run instructions
- [ ] Environment variables documented
- [ ] Port mappings documented
- [ ] Dependencies listed

## Quick Reference

```dockerfile
# Production-ready Dockerfile template

FROM python:3.9-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

FROM python:3.9-slim
WORKDIR /app

# Copy dependencies
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy application
COPY src/ ./src/

# Create non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

CMD ["python", "src/serve.py"]
```

```bash
# Essential build/run commands

# Build with cache
docker build -t ml-model:v1 .

# Build without cache
docker build --no-cache -t ml-model:v1 .

# Run with proper settings
docker run -d \
  --name ml-service \
  -p 8000:8000 \
  -m 2g \
  --restart unless-stopped \
  -e MODEL_PATH=/app/models/model.pkl \
  ml-model:v1

# Debug
docker logs -f ml-service
docker exec -it ml-service bash
docker inspect ml-service
```

---

**Navigation:**
[← Previous: Docker Compose](./docker-compose.md) | [Next: CI/CD Docker Interviews →](./cicd-docker-interviews.md)

**Related Topics:**
- [Docker Fundamentals](./docker-fundamentals.md)
- [Docker Advanced](./docker-advanced.md)
- [Kubernetes Best Practices](./kubernetes-best-practices.md)
