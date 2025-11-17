# Complete ML Model Deployment on Kubernetes

## What You'll Learn

This practical guide walks you through deploying a production-ready ML model on Kubernetes. You'll see how all the pieces - Deployments, Services, ConfigMaps, Secrets - work together to create a robust, scalable ML serving system.

## Project Structure

```
ml-kubernetes/
├── Dockerfile
├── requirements.txt
├── src/
│   └── serve.py
├── k8s/
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── deployment.yaml
│   └── service.yaml
└── models/
    └── model.pkl
```

## Step 1: Dockerfile for ML Model

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

CMD ["python", "src/serve.py"]
```

## Step 2: FastAPI Model Server

```python
# src/serve.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import logging
import os

logging.basicConfig(level=os.getenv('LOG_LEVEL', 'INFO'))
logger = logging.getLogger(__name__)

app = FastAPI()

# Load model
MODEL_PATH = os.getenv('MODEL_PATH', '/app/models/model.pkl')
model = joblib.load(MODEL_PATH)
logger.info(f"Model loaded from {MODEL_PATH}")

class PredictionRequest(BaseModel):
    features: list

class PredictionResponse(BaseModel):
    prediction: int
    probability: float

@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/ready")
def ready():
    """Readiness check endpoint"""
    try:
        # Verify model works
        _ = model.predict([[0] * 10])
        return {"status": "ready"}
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return {"status": "not ready"}, 503

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    """Prediction endpoint"""
    try:
        features = np.array(request.features).reshape(1, -1)
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0][1]

        logger.info(f"Prediction: {prediction}, Probability: {probability:.4f}")

        return PredictionResponse(
            prediction=int(prediction),
            probability=float(probability)
        )
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        return {"error": str(e)}, 500

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Step 3: Kubernetes Manifests

### ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ml-model-config
data:
  LOG_LEVEL: "INFO"
  MODEL_VERSION: "v1.0"
  MODEL_PATH: "/app/models/model.pkl"
```

### Secret

```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: ml-model-secrets
type: Opaque
stringData:
  AWS_ACCESS_KEY_ID: "your-access-key"
  AWS_SECRET_ACCESS_KEY: "your-secret-key"
```

### Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-model
  labels:
    app: ml-model
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ml-model
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: ml-model
        version: v1
    spec:
      containers:
      - name: model-server
        image: username/ml-model:v1
        imagePullPolicy: Always
        ports:
        - containerPort: 8000
          name: http
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        envFrom:
        - configMapRef:
            name: ml-model-config
        - secretRef:
            name: ml-model-secrets
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
```

### Service

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: ml-model-service
  labels:
    app: ml-model
spec:
  type: LoadBalancer
  selector:
    app: ml-model
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
    name: http
```

## Step 4: Deploy to Kubernetes

```bash
# 1. Build and push Docker image
docker build -t username/ml-model:v1 .
docker push username/ml-model:v1

# 2. Apply Kubernetes manifests
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# 3. Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services

# 4. View logs
kubectl logs -l app=ml-model -f

# 5. Test the service
export SERVICE_IP=$(kubectl get service ml-model-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
curl -X POST http://$SERVICE_IP/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}'
```

## Step 5: Monitor and Verify

```bash
# Watch pod status
kubectl get pods -l app=ml-model -w

# Check pod details
kubectl describe pod <pod-name>

# View logs from all pods
kubectl logs -l app=ml-model --tail=100

# Check service endpoints
kubectl get endpoints ml-model-service

# Port forward for local testing
kubectl port-forward service/ml-model-service 8080:80
curl http://localhost:8080/health
```

## Step 6: Update Deployment

```bash
# Update image
kubectl set image deployment/ml-model model-server=username/ml-model:v2

# Watch rollout
kubectl rollout status deployment/ml-model

# Rollback if needed
kubectl rollout undo deployment/ml-model
```

## Troubleshooting Common Issues

**Pods not starting:**
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

**Service not accessible:**
```bash
kubectl get endpoints ml-model-service
kubectl describe service ml-model-service
```

**Image pull errors:**
```bash
# For private registries, create secret
kubectl create secret docker-registry regcred \
  --docker-server=registry.example.com \
  --docker-username=user \
  --docker-password=pass

# Add to deployment
spec:
  imagePullSecrets:
  - name: regcred
```

## Production Checklist

- [ ] Health and readiness probes configured
- [ ] Resource limits set
- [ ] Multiple replicas for high availability
- [ ] Secrets used for sensitive data
- [ ] Logging to stdout/stderr
- [ ] Monitoring configured
- [ ] Backup strategy for persistent data
- [ ] Rollback plan tested

---

**Navigation:**
[← Previous: Kubernetes Configuration](./kubernetes-configuration.md) | [Next: Kubernetes Scaling →](./kubernetes-scaling.md)

**Related Topics:**
- [Docker Fundamentals](./docker-fundamentals.md)
- [Kubernetes Best Practices](./kubernetes-best-practices.md)
