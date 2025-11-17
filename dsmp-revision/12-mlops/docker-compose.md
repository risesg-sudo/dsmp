# Docker Compose for ML Systems

## What You'll Learn

Most ML systems aren't just a single container - they need databases, caching layers, monitoring tools, and more. Docker Compose orchestrates multiple containers as a cohesive system. This guide shows you how to build complete ML stacks where services communicate seamlessly, share networks, and maintain state across restarts.

## Why Docker Compose?

Running complex applications with multiple services using `docker run` becomes unwieldy. Docker Compose solves this with a single YAML configuration file.

### The Multi-Container Challenge

```
Without Compose:
docker run -d --name db postgres
docker run -d --name redis redis
docker run -d --name api --link db --link redis ml-api
# Manual networking, hard to manage, error-prone

With Compose:
docker-compose up
# Single command starts everything correctly configured
```

## Docker Compose Architecture

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

Services automatically discover each other by name on a shared network.

## Basic docker-compose.yml

Start with a simple three-service stack:

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

### Key Components Explained

**services**: Define each container
**build**: Build from Dockerfile in current directory
**image**: Use pre-built image from Docker Hub
**ports**: Map host:container ports
**environment**: Set environment variables
**depends_on**: Start dependencies first
**volumes**: Persist data and mount host directories

## Complete ML System with Docker Compose

A production-ready ML stack with monitoring:

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

## Docker Compose Commands

```bash
# Start all services
docker-compose up

# Start in detached mode (background)
docker-compose up -d

# Build and start
docker-compose up --build

# Start specific service
docker-compose up api

# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove containers and volumes (DANGER: deletes data)
docker-compose down -v

# View logs
docker-compose logs

# Follow logs for specific service
docker-compose logs -f api

# Scale service (run multiple instances)
docker-compose up --scale api=3

# Execute command in service
docker-compose exec api bash
docker-compose exec api python test.py

# List services
docker-compose ps

# Restart specific service
docker-compose restart api

# View service configuration
docker-compose config
```

## Environment Variables

Manage configuration with `.env` files:

```yaml
# docker-compose.yml with env files
services:
  api:
    build: .
    env_file:
      - .env.common
      - .env.production
    environment:
      - MODEL_VERSION=v1.2.0  # Override from env file
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

Docker Compose loads `.env` automatically from the current directory.

## Networking

Services on the same network can communicate by service name:

```python
# Inside the api container
import psycopg2

# Connect using service name 'db'
conn = psycopg2.connect(
    host='db',  # Service name, not localhost!
    port=5432,
    database='mlopsdb'
)
```

Docker Compose creates a default network where:
- Services discover each other by name
- Containers on same network can communicate
- Ports are accessible between containers

## Volumes for Data Persistence

Two types of volumes:

**Named volumes** (managed by Docker):
```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:  # Define named volume
```

**Bind mounts** (map host directories):
```yaml
volumes:
  - ./models:/app/models  # Host ./models → Container /app/models
  - ./data:/app/data
```

## Health Checks in Compose

```yaml
services:
  api:
    build: .
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## When to Use Docker Compose

**Perfect for:**
- Development environments
- Integration testing
- Single-host deployments
- Small production deployments
- Proof-of-concept systems

**Not suitable for:**
- Large-scale production (use Kubernetes)
- Multi-host orchestration
- Auto-scaling requirements
- Complex networking needs

## Best Practices

**1. Use .env files**
Keep secrets out of docker-compose.yml

**2. Pin versions**
```yaml
image: postgres:14  # Not postgres:latest
```

**3. Use depends_on with health checks**
```yaml
depends_on:
  db:
    condition: service_healthy
```

**4. Separate Dockerfiles**
Use `Dockerfile.api`, `Dockerfile.trainer` for different services

**5. Use volumes for persistence**
Named volumes for databases, bind mounts for development

## Common Pitfalls

**Not Using Volumes**
Data lost when containers restart.

**Exposing All Ports**
Only expose what needs external access.

**No Resource Limits**
One service can consume all resources:
```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
```

**Using localhost**
Use service names, not localhost, for inter-service communication.

## Quick Reference

```yaml
# Essential docker-compose.yml structure
version: '3.8'

services:
  service-name:
    build: .              # Build from Dockerfile
    image: name:tag       # Or use existing image
    ports:
      - "host:container"
    environment:
      - KEY=value
    volumes:
      - host:container
    depends_on:
      - other-service
    restart: unless-stopped

volumes:
  volume-name:

networks:
  network-name:
```

```bash
# Essential commands
docker-compose up -d         # Start background
docker-compose down          # Stop and remove
docker-compose logs -f       # Follow logs
docker-compose ps            # List services
docker-compose exec service bash  # Enter container
```

---

**Navigation:**
[← Previous: Docker Advanced](./docker-advanced.md) | [Next: Docker Best Practices →](./docker-best-practices.md)

**Related Topics:**
- [Docker Fundamentals](./docker-fundamentals.md)
- [Kubernetes ML Deployment](./kubernetes-ml-deployment.md)
