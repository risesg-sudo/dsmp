# CI/CD and Docker Interview Questions

## What You'll Learn

This comprehensive guide prepares you for technical interviews covering CI/CD and Docker for machine learning. You'll find detailed answers to common questions, practical examples, and insights into what interviewers look for. These questions reflect real scenarios from ML engineering interviews.

## Q1: Explain the CI/CD pipeline for an ML model

**Answer:**

A typical ML CI/CD pipeline extends traditional software CI/CD to handle code, data, and models:

**Continuous Integration (CI):**

1. **Code Quality**
   - Linting (flake8, black)
   - Unit tests (pytest)
   - Code coverage measurement

2. **Data Validation**
   - Schema validation (column names, types)
   - Data quality checks (missing values, outliers)
   - Statistical tests (distribution checks)

3. **Model Training**
   - Train with fixed seed for reproducibility
   - Validate performance against thresholds
   - Log experiments with MLflow/Weights & Biases

4. **Model Testing**
   - Unit tests for model code
   - Integration tests for API
   - Performance tests (inference time, accuracy)

**Continuous Deployment (CD):**

1. **Build**
   - Create Docker image with model
   - Push to container registry

2. **Deploy to Staging**
   - Deploy to staging environment
   - Run integration tests
   - Perform A/B testing

3. **Deploy to Production**
   - Blue-green or canary deployment
   - Monitor metrics (latency, accuracy)
   - Rollback capability if issues detected

**Example GitHub Actions Workflow:**
```yaml
name: ML CI/CD

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: pytest tests/

  train:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Train model
        run: python train.py
      - name: Check performance
        run: python check_metrics.py

  deploy:
    needs: train
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker image
        run: docker build -t model:latest .
      - name: Deploy
        run: kubectl apply -f deployment.yaml
```

**Key differences from traditional CI/CD:**
- Data versioning (DVC, Git LFS)
- Model performance thresholds (not just pass/fail)
- Experiment tracking integration
- Non-deterministic behavior (random seeds)
- Longer feedback loops (training time)

## Q2: What is Docker and why use it for ML?

**Answer:**

**Docker** is a containerization platform that packages applications with their dependencies into isolated, portable containers.

**Benefits for ML:**

1. **Reproducibility**
   - Same environment everywhere (dev, staging, prod)
   - Eliminates "works on my machine" issues
   - Version control for entire environment

2. **Dependency Management**
   - Isolate conflicting dependencies
   - Pin exact library versions
   - Include system-level dependencies

3. **Portability**
   - Run anywhere: laptop, cloud, Kubernetes
   - Easy deployment across platforms
   - Consistent behavior

4. **Scalability**
   - Spin up multiple instances easily
   - Horizontal scaling
   - Load balancing

5. **Isolation**
   - Multiple models/versions on same server
   - Security boundaries
   - Resource limits

**Example:**
```dockerfile
FROM python:3.9-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY src/ ./src/
CMD ["python", "src/serve.py"]
```

```bash
# Build and run
docker build -t ml-model .
docker run -p 8000:8000 ml-model

# Works identically on any machine
```

**Alternatives:**
- Virtual machines (heavier, slower)
- Conda environments (Python-only, not portable)
- Virtual environments (limited isolation)

## Q3: Explain Docker layers and caching

**Answer:**

**Docker layers** are read-only filesystems stacked on top of each other. Each Dockerfile instruction creates a new layer.

```
┌─────────────────────┐
│   CMD ["python"]    │  ← Layer 4 (smallest)
├─────────────────────┤
│   COPY src/ ./src/  │  ← Layer 3
├─────────────────────┤
│   RUN pip install   │  ← Layer 2
├─────────────────────┤
│   FROM python:3.9   │  ← Layer 1 (largest, base)
└─────────────────────┘
```

**Caching Mechanism:**
- Docker caches each layer
- If a layer hasn't changed, Docker reuses cached version
- If a layer changes, all subsequent layers rebuild
- Cache key = instruction + file contents

**Optimization Example:**
```dockerfile
# ❌ BAD: Rebuilds everything on code change
FROM python:3.9-slim
COPY . .
RUN pip install -r requirements.txt

# ✅ GOOD: Caches pip install
FROM python:3.9-slim
COPY requirements.txt .
RUN pip install -r requirements.txt  # Cached if requirements unchanged
COPY . .  # Only this rebuilds on code change
```

**Layer Size Optimization:**
```dockerfile
# ❌ BAD: Creates large layers
RUN apt-get update
RUN apt-get install -y build-essential
RUN rm -rf /var/lib/apt/lists/*  # Doesn't reduce previous layer size!

# ✅ GOOD: Single layer, cleanup in same command
RUN apt-get update && \
    apt-get install -y build-essential && \
    rm -rf /var/lib/apt/lists/*
```

**Best Practices:**
1. Order Dockerfile from least to most frequently changing
2. Combine commands with `&&`
3. Clean up in same layer
4. Use `.dockerignore` to exclude unnecessary files
5. Use multi-stage builds to reduce final image size

## Q4: What is Docker Compose and when to use it?

**Answer:**

**Docker Compose** is a tool for defining and running multi-container Docker applications using a YAML configuration file.

**When to Use:**
- Multiple interdependent services
- Development environment setup
- Integration testing
- Local deployment simulation
- Services need to communicate

**Example ML System:**
```yaml
version: '3.8'

services:
  # ML API
  api:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=postgresql://user:pass@db/mldb

  # Database
  db:
    image: postgres:14
    volumes:
      - db_data:/var/lib/postgresql/data

  # Cache
  redis:
    image: redis:7-alpine

volumes:
  db_data:
```

**Commands:**
```bash
docker-compose up       # Start all services
docker-compose down     # Stop and remove
docker-compose logs -f  # View logs
docker-compose exec api bash  # Execute command
```

**Benefits:**
1. **Single Command**: Start entire stack with one command
2. **Service Discovery**: Services reference each other by name
3. **Networking**: Automatic network creation
4. **Volume Management**: Persistent data
5. **Environment Management**: Separate .env files per environment

**vs Orchestration Platforms:**
- Docker Compose: Development, single host, simple setups
- Docker Swarm: Production, multi-host, simpler than K8s
- Kubernetes: Production, multi-host, enterprise features

## Q5: How do you handle model files in Docker?

**Answer:**

Several approaches, each with tradeoffs:

**1. Bake into Image (Small Models < 100 MB)**
```dockerfile
FROM python:3.9-slim
COPY models/model.pkl /app/models/
COPY src/ ./src/
CMD ["python", "src/serve.py"]
```
✅ Fast deployment, no external dependencies
❌ Large images, rebuild for model updates, versioning issues

**2. Download at Runtime (Recommended)**
```dockerfile
FROM python:3.9-slim
COPY src/ ./src/
CMD python src/download_model.py && python src/serve.py
```

```python
# src/download_model.py
import boto3
s3 = boto3.client('s3')
s3.download_file('my-bucket', 'models/v1.2.0/model.pkl', '/app/models/model.pkl')
```
✅ Small images, flexible versioning, independent updates
❌ Startup delay, requires external storage

**3. Volume Mount (Development)**
```bash
docker run -v $(pwd)/models:/app/models ml-api
```
✅ Fast iteration, easy testing
❌ Not portable, host-dependent

**4. Init Container (Kubernetes)**
```yaml
initContainers:
- name: model-fetcher
  image: amazon/aws-cli
  command: ['aws', 's3', 'cp', 's3://bucket/model.pkl', '/models/']
  volumeMounts:
  - name: model-storage
    mountPath: /models
```
✅ Separation of concerns, container orchestration native
❌ Kubernetes-specific

**Best Practice for Production:**
```dockerfile
FROM python:3.9-slim

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application code (NOT model)
COPY src/ ./src/

# Download model at startup from S3/GCS
ENV MODEL_URL=s3://bucket/models/model-v1.pkl
CMD python src/download_model.py && python src/serve.py
```

**Model Versioning:**
```python
import os
model_version = os.getenv('MODEL_VERSION', 'v1.0')
model_path = f's3://bucket/models/model-{model_version}.pkl'
```

Run different versions:
```bash
docker run -e MODEL_VERSION=v1.0 ml-api
docker run -e MODEL_VERSION=v2.0 ml-api
```

## Q6: How do you optimize Docker image size?

**Answer:**

**Techniques to reduce image size:**

**1. Use Minimal Base Images**
```dockerfile
# Large: 1 GB
FROM python:3.9

# Medium: 500 MB
FROM python:3.9-slim

# Small: 150 MB (with dependencies)
FROM python:3.9-alpine

# Smallest: 50 MB (advanced)
FROM gcr.io/distroless/python3
```

**2. Multi-Stage Builds**
```dockerfile
# Build stage (large, with build tools)
FROM python:3.9 as builder
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# Runtime stage (small, runtime only)
FROM python:3.9-slim
COPY --from=builder /root/.local /root/.local
COPY src/ ./src/
CMD ["python", "src/serve.py"]

# Result: 73% smaller!
```

**3. Combine RUN Commands**
```dockerfile
# Each RUN creates a layer
RUN apt-get update && \
    apt-get install -y build-essential && \
    pip install -r requirements.txt && \
    apt-get purge -y --auto-remove build-essential && \
    rm -rf /var/lib/apt/lists/*
```

**4. Use .dockerignore**
```
data/
notebooks/
tests/
*.csv
*.md
.git
```

**5. Remove Unnecessary Files**
```dockerfile
RUN pip install --no-cache-dir -r requirements.txt
```

**6. Use Specific Package Versions**
Only install what you need:
```txt
# requirements.txt
numpy==1.24.0
scikit-learn==1.2.0
# Not: pandas[all], which includes many extras
```

**Comparison:**
```
Original: 2.5 GB
After slim base: 1.2 GB (-52%)
After multi-stage: 450 MB (-82%)
After cleanup: 380 MB (-85%)
```

## Q7: How do you handle secrets in CI/CD?

**Answer:**

**Never:**
- Hardcode in code
- Commit to Git
- Include in Docker images
- Pass in build args (visible in history)

**Best Practices:**

**1. CI/CD Platform Secrets**
```yaml
# GitHub Actions
env:
  AWS_KEY: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

**2. Environment Variables at Runtime**
```bash
docker run -e API_KEY=${API_KEY} ml-model
```

**3. Secrets Files**
```bash
docker run --env-file .env.secrets ml-model
```

**4. Secret Management Services**
```python
# AWS Secrets Manager
import boto3
secrets = boto3.client('secretsmanager')
secret = secrets.get_secret_value(SecretId='ml-api-key')
api_key = secret['SecretString']
```

**5. Kubernetes Secrets**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ml-secrets
data:
  api-key: YmFzZTY0ZW5jb2RlZA==  # base64 encoded
```

**In Docker Compose:**
```yaml
services:
  api:
    environment:
      - API_KEY=${API_KEY}  # From host environment
```

## Quick Reference

**CI/CD Pipeline:**
```
Code → Test → Validate Data → Train → Test Model → Build → Deploy
```

**Docker Commands:**
```bash
docker build -t name:tag .
docker run -p 8000:8000 name:tag
docker-compose up -d
```

**Best Practices:**
- Use specific version tags
- Multi-stage builds
- Run as non-root
- Use .dockerignore
- Health checks
- Layer caching optimization

---

**Navigation:**
[← Previous: Docker Best Practices](./docker-best-practices.md)

**Related Topics:**
- [CI/CD Concepts](./cicd-concepts.md)
- [GitHub Actions Basics](./github-actions-basics.md)
- [Docker Fundamentals](./docker-fundamentals.md)
