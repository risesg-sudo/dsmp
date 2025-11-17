# CI/CD & Docker for ML

## 📋 Table of Contents
1. [CI/CD for Machine Learning](#cicd-for-machine-learning)
2. [GitHub Actions](#github-actions)
3. [Docker Fundamentals](#docker-fundamentals)
4. [Docker Compose](#docker-compose)
5. [Best Practices](#best-practices)
6. [Common Pitfalls](#common-pitfalls)
7. [Interview Questions](#interview-questions)

---

## CI/CD for Machine Learning

### What is CI/CD for ML?

```
┌────────────────────────────────────────────────────────────┐
│                  CI/CD for ML Pipeline                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Continuous Integration (CI):                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐              │
│  │  Code    │──▶│  Test    │──▶│  Build   │              │
│  │  Commit  │   │  (Unit,  │   │  Docker  │              │
│  │          │   │  Data,   │   │  Image)  │              │
│  │          │   │  Model)  │   │          │              │
│  └──────────┘   └──────────┘   └──────────┘              │
│                                                            │
│  Continuous Delivery/Deployment (CD):                     │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐              │
│  │  Deploy  │──▶│ Staging  │──▶│Production│              │
│  │  to      │   │  Tests   │   │          │              │
│  │  Staging │   │          │   │          │              │
│  └──────────┘   └──────────┘   └──────────┘              │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### ML-Specific CI/CD Challenges

| Traditional Software | ML Systems |
|---------------------|------------|
| Code changes | Code + Data + Model changes |
| Unit tests | Unit + Data validation + Model tests |
| Deterministic | Non-deterministic (model performance) |
| Fast tests | Slow training |
| Binary pass/fail | Performance thresholds |

---

## GitHub Actions

### Basic Workflow Structure

```yaml
# .github/workflows/ci.yml
name: ML CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'

    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt

    - name: Run tests
      run: |
        pytest tests/
```

### Complete ML CI/CD Pipeline

```yaml
# .github/workflows/ml-pipeline.yml
name: ML Model CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  PYTHON_VERSION: '3.9'
  MODEL_NAME: customer-churn-predictor

jobs:
  # Job 1: Code Quality & Unit Tests
  code-quality:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ env.PYTHON_VERSION }}

    - name: Cache pip packages
      uses: actions/cache@v3
      with:
        path: ~/.cache/pip
        key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
        restore-keys: |
          ${{ runner.os }}-pip-

    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-cov black flake8

    - name: Code formatting (Black)
      run: black --check src/

    - name: Linting (Flake8)
      run: flake8 src/ --max-line-length=88

    - name: Run unit tests
      run: |
        pytest tests/unit/ --cov=src --cov-report=xml

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml

  # Job 2: Data Validation
  data-validation:
    runs-on: ubuntu-latest
    needs: code-quality
    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ env.PYTHON_VERSION }}

    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install great-expectations pandas-profiling

    - name: Download data
      run: |
        # Use DVC or download from S3
        pip install dvc dvc-s3
        dvc pull data/train.csv

    - name: Validate data schema
      run: |
        python tests/data_validation/validate_schema.py

    - name: Check data quality
      run: |
        python tests/data_validation/check_quality.py

    - name: Generate data profile report
      run: |
        python tests/data_validation/profile_data.py

  # Job 3: Model Training & Evaluation
  train-model:
    runs-on: ubuntu-latest
    needs: [code-quality, data-validation]
    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ env.PYTHON_VERSION }}

    - name: Install dependencies
      run: pip install -r requirements.txt

    - name: Pull data with DVC
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      run: |
        pip install dvc dvc-s3
        dvc pull

    - name: Train model
      run: |
        python src/train.py

    - name: Evaluate model
      run: |
        python src/evaluate.py

    - name: Check model performance
      run: |
        python tests/model_tests/check_performance.py

    - name: Upload model artifacts
      uses: actions/upload-artifact@v3
      with:
        name: model
        path: models/

  # Job 4: Build Docker Image
  build-docker:
    runs-on: ubuntu-latest
    needs: train-model
    steps:
    - uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to DockerHub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}

    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: |
          ${{ secrets.DOCKERHUB_USERNAME }}/${{ env.MODEL_NAME }}:latest
          ${{ secrets.DOCKERHUB_USERNAME }}/${{ env.MODEL_NAME }}:${{ github.sha }}
        cache-from: type=registry,ref=${{ secrets.DOCKERHUB_USERNAME }}/${{ env.MODEL_NAME }}:buildcache
        cache-to: type=registry,ref=${{ secrets.DOCKERHUB_USERNAME }}/${{ env.MODEL_NAME }}:buildcache,mode=max

  # Job 5: Deploy to Staging
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build-docker
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Deploy to staging
      run: |
        # Deploy to staging environment
        echo "Deploying to staging..."
        # Could use kubectl, AWS CLI, etc.

    - name: Run integration tests
      run: |
        # Test API endpoints
        pytest tests/integration/

    - name: Load testing
      run: |
        # Run load tests with locust or similar
        echo "Running load tests..."

  # Job 6: Deploy to Production
  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://api.example.com
    steps:
    - name: Deploy to production
      run: |
        echo "Deploying to production..."
        # Actual deployment commands

    - name: Smoke tests
      run: |
        # Quick health checks
        curl https://api.example.com/health
```

### Data Validation Tests

```python
# tests/data_validation/validate_schema.py
import pandas as pd
import json
import sys

def validate_schema():
    """Validate data schema matches expected format"""

    # Load expected schema
    with open('config/data_schema.json') as f:
        expected_schema = json.load(f)

    # Load data
    df = pd.read_csv('data/train.csv')

    # Check columns
    expected_columns = set(expected_schema['columns'])
    actual_columns = set(df.columns)

    if expected_columns != actual_columns:
        missing = expected_columns - actual_columns
        extra = actual_columns - expected_columns
        print(f"Schema mismatch!")
        print(f"Missing columns: {missing}")
        print(f"Extra columns: {extra}")
        sys.exit(1)

    # Check data types
    for col, dtype in expected_schema['dtypes'].items():
        if df[col].dtype != dtype:
            print(f"Type mismatch for {col}: expected {dtype}, got {df[col].dtype}")
            sys.exit(1)

    print("✓ Schema validation passed!")

if __name__ == '__main__':
    validate_schema()
```

```python
# tests/data_validation/check_quality.py
import pandas as pd
import sys

def check_data_quality():
    """Check data quality metrics"""

    df = pd.read_csv('data/train.csv')

    # Check for missing values
    missing_pct = df.isnull().sum() / len(df) * 100
    if (missing_pct > 10).any():
        print("❌ Too many missing values!")
        print(missing_pct[missing_pct > 10])
        sys.exit(1)

    # Check for duplicates
    dup_count = df.duplicated().sum()
    if dup_count > 0:
        print(f"❌ Found {dup_count} duplicate rows!")
        sys.exit(1)

    # Check target distribution
    target_dist = df['target'].value_counts(normalize=True)
    if target_dist.min() < 0.01:  # Less than 1% of any class
        print("❌ Severe class imbalance!")
        print(target_dist)
        sys.exit(1)

    # Check for outliers
    numeric_cols = df.select_dtypes(include=['float64', 'int64']).columns
    for col in numeric_cols:
        q1, q3 = df[col].quantile([0.25, 0.75])
        iqr = q3 - q1
        outliers = ((df[col] < q1 - 3*iqr) | (df[col] > q3 + 3*iqr)).sum()
        if outliers / len(df) > 0.05:  # More than 5% outliers
            print(f"⚠️ Warning: {col} has {outliers} outliers ({outliers/len(df)*100:.2f}%)")

    print("✓ Data quality checks passed!")

if __name__ == '__main__':
    check_data_quality()
```

### Model Performance Tests

```python
# tests/model_tests/check_performance.py
import json
import sys

def check_model_performance():
    """Check if model meets minimum performance thresholds"""

    # Load metrics
    with open('metrics/eval_metrics.json') as f:
        metrics = json.load(f)

    # Define thresholds
    thresholds = {
        'accuracy': 0.80,
        'f1_score': 0.75,
        'precision': 0.70,
        'recall': 0.70
    }

    # Check each metric
    failed = []
    for metric, threshold in thresholds.items():
        if metrics[metric] < threshold:
            failed.append(f"{metric}: {metrics[metric]:.4f} < {threshold}")

    if failed:
        print("❌ Model performance below thresholds:")
        for f in failed:
            print(f"  - {f}")
        sys.exit(1)

    print("✓ Model performance checks passed!")
    for metric, value in metrics.items():
        print(f"  {metric}: {value:.4f}")

if __name__ == '__main__':
    check_model_performance()
```

---

## Docker Fundamentals

### Why Docker for ML?

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

### Docker Architecture

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

### Basic Dockerfile for ML

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

### Multi-stage Build (Optimized)

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
```

### Dockerfile for Deep Learning (GPU)

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

### Docker Commands

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

# List images
docker images

# List running containers
docker ps

# List all containers
docker ps -a

# Inspect container
docker inspect ml-service

# Clean up
docker system prune -a  # Remove all unused containers, images
```

### .dockerignore

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

---

## Docker Compose

### Why Docker Compose?

Multi-container applications (e.g., API + Database + Redis):

```
┌─────────────────────────────────────────────────┐
│         Docker Compose Architecture             │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   FastAPI    │  │  PostgreSQL  │            │
│  │   ML Model   │◀─┤   Database   │            │
│  │   Service    │  └──────────────┘            │
│  └──────┬───────┘                               │
│         │                                       │
│         ▼                                       │
│  ┌──────────────┐                              │
│  │    Redis     │                              │
│  │    Cache     │                              │
│  └──────────────┘                              │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Basic docker-compose.yml

```yaml
# docker-compose.yml
version: '3.8'

services:
  # ML Model API
  ml-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - MODEL_PATH=/app/models/model.pkl
      - DATABASE_URL=postgresql://user:password@db:5432/mldb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./models:/app/models

  # PostgreSQL Database
  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mldb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### Advanced docker-compose.yml (ML System)

```yaml
# docker-compose.yml - Complete ML System
version: '3.8'

services:
  # Model Training Service
  trainer:
    build:
      context: .
      dockerfile: Dockerfile.trainer
    volumes:
      - ./data:/app/data
      - ./models:/app/models
      - ./mlruns:/app/mlruns
    environment:
      - MLFLOW_TRACKING_URI=http://mlflow:5000
    depends_on:
      - mlflow

  # Model Serving API
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "8000:8000"
    environment:
      - MODEL_PATH=/app/models/production/model.pkl
      - DATABASE_URL=postgresql://mlops:mlops123@db:5432/mlopsdb
      - REDIS_URL=redis://redis:6379
      - MLFLOW_TRACKING_URI=http://mlflow:5000
    depends_on:
      - db
      - redis
      - mlflow
    volumes:
      - ./models:/app/models
    restart: unless-stopped

  # MLflow Tracking Server
  mlflow:
    image: python:3.9
    command: >
      bash -c "pip install mlflow psycopg2-binary boto3 &&
               mlflow server --host 0.0.0.0 --port 5000
               --backend-store-uri postgresql://mlops:mlops123@db:5432/mlflowdb
               --default-artifact-root s3://mlflow-artifacts"
    ports:
      - "5000:5000"
    environment:
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    depends_on:
      - db

  # PostgreSQL Database
  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=mlops
      - POSTGRES_PASSWORD=mlops123
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init_db.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  # Redis for Caching
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Monitoring with Prometheus
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  # Grafana for Visualization
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
```

### Docker Compose Commands

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Build and start
docker-compose up --build

# Start specific service
docker-compose up api

# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# View logs
docker-compose logs
docker-compose logs -f api  # Follow logs for specific service

# Scale service
docker-compose up --scale api=3

# Execute command in service
docker-compose exec api bash
docker-compose exec api python test.py

# List services
docker-compose ps

# Restart service
docker-compose restart api
```

---

## Best Practices

### 1. Dockerfile Best Practices

```dockerfile
# ✅ GOOD Dockerfile

# Use specific version tags
FROM python:3.9.15-slim

# Install system dependencies in one layer
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*  # Clean up

# Copy requirements first (leverage caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy code last (changes frequently)
COPY . .

# Use non-root user
RUN useradd -m appuser
USER appuser

# Use ENTRYPOINT for fixed commands
ENTRYPOINT ["python"]
CMD ["src/serve.py"]
```

```dockerfile
# ❌ BAD Dockerfile

# Don't use 'latest' tag
FROM python:latest

# Don't run multiple RUN commands (creates layers)
RUN apt-get update
RUN apt-get install -y build-essential
RUN apt-get install -y curl

# Don't copy everything at once
COPY . .

# Don't install dependencies after copying code
RUN pip install -r requirements.txt

# Don't run as root
# USER root (default)
```

### 2. Layer Caching

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
```

### 3. Multi-stage Builds

```dockerfile
# Reduce image size with multi-stage builds

# Stage 1: Build dependencies
FROM python:3.9 as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# Stage 2: Runtime
FROM python:3.9-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY src/ ./src/
ENV PATH=/root/.local/bin:$PATH
CMD ["python", "src/serve.py"]
```

### 4. Security Best Practices

```dockerfile
# Security-focused Dockerfile
FROM python:3.9-slim

# Update packages
RUN apt-get update && apt-get upgrade -y

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Don't expose unnecessary ports
EXPOSE 8000

# Use exec form of CMD
CMD ["python", "src/serve.py"]
```

### 5. Environment Variables

```yaml
# docker-compose.yml with env files
services:
  api:
    build: .
    env_file:
      - .env.common
      - .env.production
    environment:
      - MODEL_VERSION=v1.2.0
```

```bash
# .env.common
DATABASE_HOST=db
REDIS_HOST=redis
LOG_LEVEL=INFO

# .env.production
MODEL_PATH=/app/models/production/model.pkl
ENVIRONMENT=production
DEBUG=false
```

---

## Common Pitfalls

### 1. Large Image Sizes

**Problem**: Docker image is 5GB+

**Solution**:
```dockerfile
# Use slim base images
FROM python:3.9-slim  # Not python:3.9 (500MB vs 1GB)

# Use multi-stage builds
# Clean up in same layer
RUN apt-get update && apt-get install -y build-essential \
    && pip install -r requirements.txt \
    && apt-get purge -y --auto-remove build-essential \
    && rm -rf /var/lib/apt/lists/*

# Don't include unnecessary files (.dockerignore)
```

### 2. Slow Builds

**Problem**: Every code change triggers full rebuild

**Solution**:
```dockerfile
# Copy dependencies before code
COPY requirements.txt .
RUN pip install -r requirements.txt  # Cached if requirements.txt unchanged

COPY src/ ./src/  # Only this layer rebuilds on code changes
```

### 3. Container Exits Immediately

**Problem**: `docker run` exits with error

**Debug**:
```bash
# Check logs
docker logs <container-id>

# Run interactively
docker run -it ml-model bash

# Override entrypoint
docker run --entrypoint /bin/bash -it ml-model
```

### 4. Permission Issues

**Problem**: "Permission denied" in container

**Solution**:
```dockerfile
# Set correct ownership
COPY --chown=appuser:appuser . .

# Or fix permissions
RUN chown -R appuser:appuser /app
```

### 5. GPU Not Available in Container

**Problem**: `torch.cuda.is_available()` returns False

**Solution**:
```bash
# Install nvidia-docker
# Run with --gpus flag
docker run --gpus all -it ml-model

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

---

## Interview Questions

### Q1: Explain the CI/CD pipeline for an ML model.

**Answer:**

A typical ML CI/CD pipeline includes:

**Continuous Integration (CI):**
1. **Code Quality**
   - Linting (flake8, black)
   - Unit tests (pytest)
   - Code coverage

2. **Data Validation**
   - Schema validation
   - Data quality checks
   - Statistical tests

3. **Model Training**
   - Train with fixed seed
   - Validate performance thresholds
   - Log experiments (MLflow)

4. **Model Testing**
   - Unit tests for model code
   - Integration tests
   - Performance tests (inference time)

**Continuous Deployment (CD):**
1. **Build**
   - Create Docker image
   - Push to registry

2. **Deploy to Staging**
   - Deploy to staging environment
   - Run integration tests
   - A/B testing

3. **Deploy to Production**
   - Blue-green or canary deployment
   - Monitor metrics
   - Rollback capability

**GitHub Actions Example:**
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
- Data versioning (DVC)
- Model performance thresholds
- Experiment tracking
- Non-deterministic behavior
- Longer feedback loops

---

### Q2: What is Docker and why use it for ML?

**Answer:**

**Docker** is a containerization platform that packages applications with their dependencies into isolated containers.

**Benefits for ML:**

1. **Reproducibility**
   - Same environment everywhere (dev, staging, prod)
   - Version control for environments

2. **Dependency Management**
   - No "works on my machine" issues
   - Isolate conflicting dependencies

3. **Portability**
   - Run anywhere (laptop, cloud, Kubernetes)
   - Easy deployment

4. **Scalability**
   - Spin up multiple instances
   - Horizontal scaling

5. **Isolation**
   - Multiple models/versions on same server
   - Security boundaries

**Example:**
```dockerfile
FROM python:3.9
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "serve.py"]
```

```bash
docker build -t ml-model .
docker run -p 8000:8000 ml-model
```

**Alternatives:**
- Virtual machines (heavier)
- Conda environments (not as portable)
- Virtual environments (only Python)

---

### Q3: Explain Docker layers and caching.

**Answer:**

**Docker layers** are read-only filesystems stacked on top of each other. Each instruction in Dockerfile creates a layer.

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

**Caching mechanism:**
- Docker caches each layer
- If a layer hasn't changed, Docker reuses cached version
- If a layer changes, all subsequent layers are rebuilt

**Optimization example:**
```dockerfile
# ❌ BAD: Rebuilds everything on code change
FROM python:3.9
COPY . .
RUN pip install -r requirements.txt

# ✅ GOOD: Caches pip install
FROM python:3.9
COPY requirements.txt .
RUN pip install -r requirements.txt  # Cached if requirements unchanged
COPY . .  # Only this rebuilds on code change
```

**Layer size optimization:**
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

**Best practices:**
1. Order Dockerfile from least to most frequently changing
2. Combine commands with `&&`
3. Clean up in same layer
4. Use `.dockerignore`
5. Use multi-stage builds

---

### Q4: What is Docker Compose and when to use it?

**Answer:**

**Docker Compose** is a tool for defining and running multi-container Docker applications using a YAML file.

**When to use:**
- Multiple interdependent services
- Development environment setup
- Integration testing
- Local deployment

**Example ML system:**
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
1. **Single command** to start entire stack
2. **Service discovery** (services can reference each other by name)
3. **Networking** (automatic network creation)
4. **Volume management** (persistent data)
5. **Environment management** (separate .env files)

**vs Docker Swarm/Kubernetes:**
- Docker Compose: Development, single host
- Docker Swarm: Production, multi-host (simpler)
- Kubernetes: Production, multi-host (more features)

---

### Q5: How do you handle model files in Docker?

**Answer:**

Several approaches:

**1. Bake into image (small models)**
```dockerfile
FROM python:3.9
COPY models/model.pkl /app/models/
```
✅ Fast deployment
❌ Large images, rebuild for model updates

**2. Download at runtime (recommended)**
```dockerfile
FROM python:3.9
COPY download_model.py .
CMD python download_model.py && python serve.py
```

```python
# download_model.py
import boto3
s3 = boto3.client('s3')
s3.download_file('my-bucket', 'models/model.pkl', '/app/models/model.pkl')
```
✅ Small images, version flexibility
❌ Startup delay

**3. Volume mount (development)**
```bash
docker run -v $(pwd)/models:/app/models ml-api
```
✅ Fast iteration
❌ Not portable

**4. Init container (Kubernetes)**
```yaml
initContainers:
- name: model-fetcher
  image: amazon/aws-cli
  command: ['aws', 's3', 'cp', 's3://bucket/model.pkl', '/models/']
  volumeMounts:
  - name: model-storage
    mountPath: /models
```

**Best practice for production:**
```dockerfile
FROM python:3.9

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application code (NOT model)
COPY src/ ./src/

# Download model at startup
ENV MODEL_URL=s3://bucket/models/model-v1.pkl
CMD python src/download_model.py && python src/serve.py
```

**Model versioning:**
```python
# Load model based on environment variable
import os
model_version = os.getenv('MODEL_VERSION', 'v1.0')
model_path = f's3://bucket/models/model-{model_version}.pkl'
```

---

**Quick Reference:**

```bash
# Docker
docker build -t name:tag .
docker run -p 8000:8000 name:tag
docker exec -it container bash
docker logs container

# Docker Compose
docker-compose up -d
docker-compose down
docker-compose logs -f service
docker-compose exec service bash
```

---

[← Back to Version Control](./version-control.md) | [Next: Kubernetes →](./kubernetes-orchestration.md)
