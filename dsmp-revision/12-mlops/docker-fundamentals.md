# Docker Fundamentals for Machine Learning

## What You'll Learn

Docker solves the infamous "it works on my machine" problem by packaging your entire application environment. This guide introduces Docker's core concepts and shows you how to containerize machine learning applications. You'll learn to create reproducible environments that work identically across development laptops, CI servers, and production clusters.

## Why Docker for ML?

Machine learning projects have complex dependencies: specific Python versions, ML libraries, system packages, and often GPU drivers. Docker bundles everything into a single container that runs anywhere.

```
┌─────────────────────────────────────────────────────┐
│              "It works on my machine!"              │
│                                                     │
│  Developer's Laptop    Production Server           │
│  ┌─────────────┐       ┌─────────────┐            │
│  │ Python 3.9  │       │ Python 3.8  │ ❌         │
│  │ TF 2.10     │       │ TF 2.8      │            │
│  │ CUDA 11.2   │       │ CUDA 11.0   │            │
│  └─────────────┘       └─────────────┘            │
│                                                     │
│              Docker Solution:                       │
│  ┌─────────────────────────────────────┐           │
│  │         Docker Container            │           │
│  │  ┌──────────────────────────────┐   │           │
│  │  │ Python 3.9 + TF 2.10 + CUDA  │   │ ✅        │
│  │  │ Your Application             │   │           │
│  │  └──────────────────────────────┘   │           │
│  └─────────────────────────────────────┘           │
│    Works the same everywhere!                      │
└─────────────────────────────────────────────────────┘
```

## Docker Architecture

Understanding the building blocks:

```
┌────────────────────────────────────────────────────┐
│                Docker Architecture                 │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────────────────────────────────────┐     │
│  │         Your Application Code            │     │
│  └───────────────┬──────────────────────────┘     │
│                  │                                 │
│  ┌───────────────▼──────────────────────────┐     │
│  │        Dockerfile (Build Script)         │     │
│  └───────────────┬──────────────────────────┘     │
│                  │ docker build                    │
│  ┌───────────────▼──────────────────────────┐     │
│  │      Docker Image (Read-only)            │     │
│  └───────────────┬──────────────────────────┘     │
│                  │ docker run                      │
│  ┌───────────────▼──────────────────────────┐     │
│  │    Docker Container (Running Instance)   │     │
│  └──────────────────────────────────────────┘     │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Dockerfile**: Instructions to build an image
**Image**: Template containing OS, libraries, and your code
**Container**: Running instance of an image

## Your First ML Dockerfile

Start with a simple Dockerfile for a scikit-learn model:

```dockerfile
# Dockerfile
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/
COPY models/ ./models/
COPY config/ ./config/

# Expose port
EXPOSE 8000

# Set environment variables
ENV MODEL_PATH=/app/models/model.pkl
ENV PYTHONUNBUFFERED=1

# Run application
CMD ["python", "src/serve.py"]
```

### Dockerfile Instruction Breakdown

**FROM**: Base image to build upon
```dockerfile
FROM python:3.9-slim  # Lightweight Python 3.9
```

**WORKDIR**: Sets working directory inside container
```dockerfile
WORKDIR /app  # All subsequent commands run in /app
```

**RUN**: Execute commands during build
```dockerfile
RUN pip install pandas  # Installs pandas in the image
```

**COPY**: Copy files from host to image
```dockerfile
COPY src/ ./src/  # Copy local src/ to /app/src/
```

**ENV**: Set environment variables
```dockerfile
ENV MODEL_PATH=/app/models/model.pkl
```

**EXPOSE**: Document which port the app uses
```dockerfile
EXPOSE 8000  # Informational, doesn't actually publish
```

**CMD**: Default command when container starts
```dockerfile
CMD ["python", "src/serve.py"]
```

## Building and Running Your Container

```bash
# Build image
docker build -t ml-model:v1 .

# Run container
docker run -p 8000:8000 ml-model:v1

# Run with environment variables
docker run -e MODEL_PATH=/app/models/best_model.pkl ml-model:v1

# Run with volume mount (for development)
docker run -v $(pwd)/models:/app/models ml-model:v1

# Run in detached mode
docker run -d -p 8000:8000 --name ml-service ml-model:v1

# View logs
docker logs ml-service
docker logs -f ml-service  # Follow logs

# Execute command in running container
docker exec -it ml-service bash
docker exec ml-service python src/test.py

# Stop and remove container
docker stop ml-service
docker rm ml-service

# Remove image
docker rmi ml-model:v1
```

## Essential Docker Commands

```bash
# List images
docker images

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Inspect container details
docker inspect ml-service

# View container resource usage
docker stats ml-service

# Clean up unused resources
docker system prune -a  # Remove all unused containers, images
```

## The .dockerignore File

Just like .gitignore, .dockerignore excludes files from your Docker build:

```
# .dockerignore
**/.git
**/.gitignore
**/.vscode
**/.idea
**/__pycache__
**/.pytest_cache
**/*.pyc
**/.DS_Store

# Large data files
data/
datasets/
*.csv
*.parquet

# Development files
notebooks/
tests/
docs/
*.md
Makefile

# Environment files
.env
.env.*
venv/
.venv/

# Model files (download separately)
models/*.pth
models/*.h5
```

This reduces build context size and speeds up builds.

## When to Use Docker for ML

**Perfect for:**
- Deploying models to production
- Ensuring reproducibility
- Sharing environments with team
- CI/CD pipelines
- Microservices architecture

**Consider alternatives for:**
- Quick local experiments (use conda)
- Interactive development (use virtual environments)
- GPU-heavy training without proper GPU support setup

## Best Practices

**1. Use Specific Tags**
```dockerfile
# Good
FROM python:3.9.15-slim

# Bad
FROM python:latest  # Version changes unexpectedly
```

**2. Minimize Layers**
```dockerfile
# Good: Single RUN command
RUN apt-get update && \
    apt-get install -y curl vim && \
    rm -rf /var/lib/apt/lists/*

# Bad: Multiple RUN commands create more layers
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y vim
```

**3. Order Instructions by Change Frequency**
Place rarely-changing instructions first:
```dockerfile
# 1. Base image (rarely changes)
FROM python:3.9-slim

# 2. System dependencies (occasionally change)
RUN apt-get update && apt-get install -y build-essential

# 3. Python dependencies (change sometimes)
COPY requirements.txt .
RUN pip install -r requirements.txt

# 4. Application code (changes frequently)
COPY src/ ./src/
```

**4. Clean Up in Same Layer**
```dockerfile
# Good: Cleanup in same command
RUN apt-get update && \
    apt-get install -y build-essential && \
    rm -rf /var/lib/apt/lists/*

# Bad: Cleanup in separate layer doesn't reduce image size
RUN apt-get update
RUN apt-get install -y build-essential
RUN rm -rf /var/lib/apt/lists/*
```

## Common Pitfalls

**Large Image Sizes**
Use slim base images and multi-stage builds (covered in Docker Advanced).

**Caching Issues**
Change ordering breaks cache. Keep stable commands first.

**Running as Root**
Always create and use a non-root user for security.

**Hardcoded Values**
Use environment variables for configuration.

## Quick Reference

```bash
# Build
docker build -t name:tag .

# Run
docker run -p host:container image
docker run -d --name container-name image
docker run -v host:container image
docker run -e VAR=value image

# Manage
docker ps                    # List running
docker stop container        # Stop
docker rm container          # Remove
docker logs container        # View logs
docker exec -it container bash  # Enter container

# Cleanup
docker system prune         # Remove unused data
docker rmi image           # Remove image
```

---

**Navigation:**
[← Previous: Data and Model Testing](./data-model-testing.md) | [Next: Docker Advanced →](./docker-advanced.md)

**Related Topics:**
- [Docker Compose](./docker-compose.md)
- [Docker Best Practices](./docker-best-practices.md)
