# Kubernetes & Orchestration

## 📋 Table of Contents
1. [Kubernetes Fundamentals](#kubernetes-fundamentals)
2. [Core Concepts](#core-concepts)
3. [Deploying ML Models on K8s](#deploying-ml-models-on-k8s)
4. [Scaling and Load Balancing](#scaling-and-load-balancing)
5. [Best Practices](#best-practices)
6. [Common Pitfalls](#common-pitfalls)
7. [Interview Questions](#interview-questions)

---

## Kubernetes Fundamentals

### What is Kubernetes?

**Kubernetes (K8s)** is an open-source container orchestration platform that automates deployment, scaling, and management of containerized applications.

```
┌────────────────────────────────────────────────────────┐
│         Without Kubernetes (Manual)                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Server 1 │  │ Server 2 │  │ Server 3 │            │
│  │ Docker   │  │ Docker   │  │ Docker   │            │
│  │ Manual   │  │ Manual   │  │ Manual   │            │
│  │ Deploy   │  │ Deploy   │  │ Deploy   │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                        │
│  • Manual container management                         │
│  • No auto-scaling                                     │
│  • No self-healing                                     │
│  • Complex networking                                  │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│         With Kubernetes (Automated)                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│         ┌─────────────────────────────┐               │
│         │   Kubernetes Cluster        │               │
│         │   (Declarative Config)      │               │
│         └────────────┬────────────────┘               │
│                      │                                 │
│         ┌────────────┴────────────┐                   │
│         │                         │                   │
│    ┌────▼─────┐  ┌────▼─────┐  ┌▼────────┐          │
│    │  Node 1  │  │  Node 2  │  │ Node 3  │          │
│    │ ┌──────┐ │  │ ┌──────┐ │  │┌──────┐ │          │
│    │ │ Pod  │ │  │ │ Pod  │ │  ││ Pod  │ │          │
│    │ └──────┘ │  │ └──────┘ │  │└──────┘ │          │
│    └──────────┘  └──────────┘  └─────────┘          │
│                                                        │
│  • Automatic scaling                                   │
│  • Self-healing (restart failed containers)            │
│  • Load balancing                                      │
│  • Rolling updates & rollbacks                         │
└────────────────────────────────────────────────────────┘
```

### Why Kubernetes for ML?

| Challenge | K8s Solution |
|-----------|-------------|
| **Scaling** | Auto-scale based on load |
| **High Availability** | Multiple replicas, self-healing |
| **Resource Management** | Efficient CPU/GPU allocation |
| **Deployment** | Rolling updates, blue-green, canary |
| **Multi-tenancy** | Run multiple models on same cluster |
| **Cost Optimization** | Efficient resource utilization |

---

## Core Concepts

### Kubernetes Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Kubernetes Cluster                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Control Plane (Master Node)                               │
│  ┌───────────────────────────────────────────────────┐     │
│  │  • API Server (kubectl communicates here)         │     │
│  │  • Scheduler (assigns pods to nodes)              │     │
│  │  • Controller Manager (maintains desired state)   │     │
│  │  • etcd (stores cluster state)                    │     │
│  └───────────────────────────────────────────────────┘     │
│                        │                                    │
│  ──────────────────────┼────────────────────────────       │
│                        │                                    │
│  Worker Nodes                                              │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │  Node 1         │  │  Node 2         │                 │
│  │  ┌───────────┐  │  │  ┌───────────┐  │                 │
│  │  │  Pod 1    │  │  │  │  Pod 3    │  │                 │
│  │  │ ┌───────┐ │  │  │  │ ┌───────┐ │  │                 │
│  │  │ │Container│ │  │  │  │Container│ │  │                 │
│  │  │ └───────┘ │  │  │  │ └───────┘ │  │                 │
│  │  └───────────┘  │  │  └───────────┘  │                 │
│  │  ┌───────────┐  │  │  ┌───────────┐  │                 │
│  │  │  Pod 2    │  │  │  │  Pod 4    │  │                 │
│  │  │ ┌───────┐ │  │  │  │ ┌───────┐ │  │                 │
│  │  │ │Container│ │  │  │  │Container│ │  │                 │
│  │  │ └───────┘ │  │  │  │ └───────┘ │  │                 │
│  │  └───────────┘  │  │  └───────────┘  │                 │
│  │                 │  │                 │                 │
│  │  kubelet        │  │  kubelet        │                 │
│  │  kube-proxy     │  │  kube-proxy     │                 │
│  │  Container      │  │  Container      │                 │
│  │  Runtime        │  │  Runtime        │                 │
│  └─────────────────┘  └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### Key Kubernetes Objects

#### 1. Pod

The smallest deployable unit. Contains one or more containers.

```yaml
# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: ml-model-pod
  labels:
    app: ml-model
spec:
  containers:
  - name: model-server
    image: username/ml-model:v1
    ports:
    - containerPort: 8000
    resources:
      requests:
        memory: "1Gi"
        cpu: "500m"
      limits:
        memory: "2Gi"
        cpu: "1000m"
    env:
    - name: MODEL_PATH
      value: "/app/models/model.pkl"
```

```bash
# Create pod
kubectl apply -f pod.yaml

# View pods
kubectl get pods

# Describe pod
kubectl describe pod ml-model-pod

# View logs
kubectl logs ml-model-pod

# Execute command in pod
kubectl exec -it ml-model-pod -- bash

# Delete pod
kubectl delete pod ml-model-pod
```

#### 2. Deployment

Manages a set of Pods, handles updates and rollbacks.

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-model-deployment
  labels:
    app: ml-model
spec:
  replicas: 3  # Run 3 instances
  selector:
    matchLabels:
      app: ml-model
  template:
    metadata:
      labels:
        app: ml-model
    spec:
      containers:
      - name: model-server
        image: username/ml-model:v1
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
```

```bash
# Apply deployment
kubectl apply -f deployment.yaml

# View deployments
kubectl get deployments

# View pods created by deployment
kubectl get pods -l app=ml-model

# Update image (rolling update)
kubectl set image deployment/ml-model-deployment model-server=username/ml-model:v2

# Rollback to previous version
kubectl rollout undo deployment/ml-model-deployment

# View rollout history
kubectl rollout history deployment/ml-model-deployment

# Scale deployment
kubectl scale deployment ml-model-deployment --replicas=5
```

#### 3. Service

Exposes Pods to network traffic.

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: ml-model-service
spec:
  selector:
    app: ml-model
  ports:
  - protocol: TCP
    port: 80        # Service port
    targetPort: 8000  # Container port
  type: LoadBalancer  # or ClusterIP, NodePort
```

**Service Types:**

```
┌────────────────────────────────────────────────────┐
│              Service Types                         │
├────────────────────────────────────────────────────┤
│                                                    │
│  1. ClusterIP (default)                           │
│     ┌────────────────────────────────┐            │
│     │ Only accessible within cluster │            │
│     └────────────────────────────────┘            │
│                                                    │
│  2. NodePort                                      │
│     ┌────────────────────────────────┐            │
│     │ Accessible on node IP:port     │            │
│     │ Port range: 30000-32767        │            │
│     └────────────────────────────────┘            │
│                                                    │
│  3. LoadBalancer                                  │
│     ┌────────────────────────────────┐            │
│     │ External load balancer         │            │
│     │ (AWS ELB, GCP LB, etc.)        │            │
│     └────────────────────────────────┘            │
│                                                    │
└────────────────────────────────────────────────────┘
```

```bash
# Create service
kubectl apply -f service.yaml

# View services
kubectl get services

# Get service details
kubectl describe service ml-model-service

# Get external IP (for LoadBalancer)
kubectl get service ml-model-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

#### 4. ConfigMap

Store configuration data.

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ml-model-config
data:
  MODEL_NAME: "customer-churn-predictor"
  LOG_LEVEL: "INFO"
  config.json: |
    {
      "model_version": "v1.0",
      "threshold": 0.5
    }
```

```yaml
# deployment.yaml (using ConfigMap)
spec:
  containers:
  - name: model-server
    image: username/ml-model:v1
    env:
    - name: MODEL_NAME
      valueFrom:
        configMapKeyRef:
          name: ml-model-config
          key: MODEL_NAME
    volumeMounts:
    - name: config-volume
      mountPath: /app/config
  volumes:
  - name: config-volume
    configMap:
      name: ml-model-config
```

#### 5. Secret

Store sensitive data (passwords, tokens, keys).

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: ml-model-secrets
type: Opaque
data:
  # Base64 encoded values
  aws-access-key: QUtJQVlPVVJLRVk=
  aws-secret-key: eW91cnNlY3JldGtleQ==
```

```bash
# Create secret from command line
kubectl create secret generic ml-model-secrets \
  --from-literal=aws-access-key=AKIAYOURKEY \
  --from-literal=aws-secret-key=yoursecretkey
```

```yaml
# deployment.yaml (using Secret)
spec:
  containers:
  - name: model-server
    env:
    - name: AWS_ACCESS_KEY_ID
      valueFrom:
        secretKeyRef:
          name: ml-model-secrets
          key: aws-access-key
    - name: AWS_SECRET_ACCESS_KEY
      valueFrom:
        secretKeyRef:
          name: ml-model-secrets
          key: aws-secret-key
```

#### 6. PersistentVolume & PersistentVolumeClaim

Store persistent data.

```yaml
# pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: model-storage
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard
```

```yaml
# deployment.yaml (using PVC)
spec:
  containers:
  - name: model-server
    volumeMounts:
    - name: model-storage
      mountPath: /app/models
  volumes:
  - name: model-storage
    persistentVolumeClaim:
      claimName: model-storage
```

---

## Deploying ML Models on K8s

### Complete ML Deployment Example

**Project structure:**
```
ml-deployment/
├── Dockerfile
├── requirements.txt
├── src/
│   └── serve.py
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   └── hpa.yaml
└── models/
    └── model.pkl
```

**1. Dockerfile**
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

EXPOSE 8000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

CMD ["python", "src/serve.py"]
```

**2. Model Serving Application**
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
        # Check if model is loaded
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

**3. Kubernetes Manifests**

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
        env:
        - name: MODEL_PATH
          value: "/app/models/model.pkl"
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: ml-model-config
              key: LOG_LEVEL
        envFrom:
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
        volumeMounts:
        - name: model-storage
          mountPath: /app/models
      volumes:
      - name: model-storage
        persistentVolumeClaim:
          claimName: model-storage
```

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

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ml-model-config
data:
  LOG_LEVEL: "INFO"
  MODEL_VERSION: "v1.0"
```

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

**4. Deploy to Kubernetes**

```bash
# Build and push Docker image
docker build -t username/ml-model:v1 .
docker push username/ml-model:v1

# Apply Kubernetes manifests
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services

# View logs
kubectl logs -l app=ml-model -f

# Test the service
export SERVICE_IP=$(kubectl get service ml-model-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
curl -X POST http://$SERVICE_IP/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}'
```

---

## Scaling and Load Balancing

### Manual Scaling

```bash
# Scale to 5 replicas
kubectl scale deployment ml-model --replicas=5

# Check scaling
kubectl get pods -l app=ml-model
```

### Horizontal Pod Autoscaler (HPA)

Automatically scales based on CPU/memory usage.

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ml-model-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ml-model
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 15
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 2
        periodSeconds: 15
      selectPolicy: Max
```

```bash
# Apply HPA
kubectl apply -f k8s/hpa.yaml

# View HPA status
kubectl get hpa

# Describe HPA
kubectl describe hpa ml-model-hpa

# Generate load to test autoscaling
kubectl run -it --rm load-generator --image=busybox /bin/sh
# Inside the pod:
while true; do wget -q -O- http://ml-model-service/predict; done
```

### Load Balancing

Kubernetes Service automatically load balances traffic across pods:

```
┌────────────────────────────────────────────────┐
│           Load Balancing Flow                  │
├────────────────────────────────────────────────┤
│                                                │
│        External Request                        │
│              │                                 │
│              ▼                                 │
│     ┌────────────────┐                         │
│     │    Service     │                         │
│     │  (LoadBalancer)│                         │
│     └────────┬───────┘                         │
│              │                                 │
│        Round Robin                             │
│              │                                 │
│      ┌───────┼───────┐                         │
│      │       │       │                         │
│      ▼       ▼       ▼                         │
│   ┌───┐   ┌───┐   ┌───┐                       │
│   │Pod│   │Pod│   │Pod│                       │
│   │ 1 │   │ 2 │   │ 3 │                       │
│   └───┘   └───┘   └───┘                       │
│                                                │
└────────────────────────────────────────────────┘
```

---

## Best Practices

### 1. Resource Management

```yaml
# Always set resource requests and limits
resources:
  requests:  # Guaranteed resources
    memory: "1Gi"
    cpu: "500m"
  limits:    # Maximum resources
    memory: "2Gi"
    cpu: "1000m"
```

**CPU units:**
- `1` = 1 CPU core
- `500m` = 0.5 CPU core (milli-cores)

**Memory units:**
- `1Gi` = 1 Gibibyte
- `512Mi` = 512 Mebibytes

### 2. Health Checks

```yaml
# Liveness probe: restart if unhealthy
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10

# Readiness probe: don't send traffic if not ready
readinessProbe:
  httpGet:
    path: /ready
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 5
```

### 3. Rolling Updates

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1        # Max new pods during update
    maxUnavailable: 0  # Keep all pods available
```

### 4. Labels and Annotations

```yaml
metadata:
  labels:
    app: ml-model
    version: v1
    tier: backend
    environment: production
  annotations:
    description: "Customer churn prediction model"
    model-version: "1.2.3"
    last-updated: "2024-01-15"
```

### 5. Namespaces

Organize resources:

```bash
# Create namespace
kubectl create namespace ml-production

# Deploy to namespace
kubectl apply -f deployment.yaml -n ml-production

# Set default namespace
kubectl config set-context --current --namespace=ml-production
```

### 6. GPU Support

```yaml
# deployment.yaml with GPU
spec:
  containers:
  - name: model-server
    image: username/ml-model-gpu:v1
    resources:
      limits:
        nvidia.com/gpu: 1  # Request 1 GPU
```

```bash
# Requires NVIDIA device plugin
kubectl apply -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/main/nvidia-device-plugin.yml
```

---

## Common Pitfalls

### 1. Pods CrashLooping

**Problem**: Pod keeps restarting

```bash
# Check logs
kubectl logs pod-name
kubectl logs pod-name --previous  # Previous instance

# Describe pod
kubectl describe pod pod-name
```

**Common causes:**
- Application crash on startup
- Health check failing
- Insufficient resources
- Missing dependencies

### 2. ImagePullBackOff

**Problem**: Can't pull Docker image

```bash
kubectl describe pod pod-name
# Look for: Failed to pull image
```

**Solutions:**
```bash
# Check image name and tag
# Ensure image exists in registry

# For private registry, create secret
kubectl create secret docker-registry regcred \
  --docker-server=your-registry \
  --docker-username=your-name \
  --docker-password=your-pass

# Use in deployment
spec:
  imagePullSecrets:
  - name: regcred
```

### 3. Service Not Accessible

**Problem**: Can't reach service

```bash
# Check service
kubectl get services
kubectl describe service ml-model-service

# Check endpoints (should match pod IPs)
kubectl get endpoints ml-model-service

# Check if pods are ready
kubectl get pods -l app=ml-model
```

**Troubleshoot:**
```bash
# Port forward for testing
kubectl port-forward service/ml-model-service 8080:80

# Test from another pod
kubectl run test-pod --rm -it --image=curlimages/curl -- sh
curl http://ml-model-service/health
```

### 4. Out of Memory (OOMKilled)

**Problem**: Pod killed due to memory

```bash
kubectl describe pod pod-name
# Status: OOMKilled
```

**Solution:**
```yaml
# Increase memory limits
resources:
  limits:
    memory: "4Gi"  # Increase from 2Gi
```

### 5. Slow Rolling Update

**Problem**: Deployment takes too long

```yaml
# Optimize rolling update
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 2        # Deploy 2 new pods at once
    maxUnavailable: 1  # Allow 1 pod to be unavailable
```

---

## Interview Questions

### Q1: What is Kubernetes and why use it for ML?

**Answer:**

Kubernetes is a container orchestration platform that automates deployment, scaling, and management of containerized applications.

**Benefits for ML:**

1. **Automatic Scaling**
   - HPA scales based on CPU/memory
   - Handle varying prediction loads
   - Cost optimization

2. **High Availability**
   - Multiple replicas
   - Self-healing (restart failed pods)
   - Rolling updates with zero downtime

3. **Resource Management**
   - Efficient CPU/GPU allocation
   - Resource quotas and limits
   - Multi-tenancy (multiple models)

4. **Deployment Strategies**
   - Rolling updates
   - Blue-green deployment
   - Canary deployment

5. **Portability**
   - Run on any cloud (AWS, GCP, Azure)
   - On-premises or hybrid

**Example use case:**
```
Scenario: Deploy model that receives 100 req/s during day,
          10 req/s at night

Solution with K8s:
- Set HPA with min=2, max=10 replicas
- Scale based on CPU > 70%
- Automatically scales down at night (saves cost)
- Automatically scales up during peaks (handles load)
```

---

### Q2: Explain Pods, Deployments, and Services.

**Answer:**

**Pod:**
- Smallest deployable unit
- Contains one or more containers
- Shares network and storage
- Ephemeral (can be deleted/recreated)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ml-pod
spec:
  containers:
  - name: model
    image: ml-model:v1
```

**Deployment:**
- Manages a set of Pods
- Ensures desired number of replicas
- Handles updates and rollbacks
- Recommended for stateless apps

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-deployment
spec:
  replicas: 3  # Maintains 3 pods
  selector:
    matchLabels:
      app: ml-model
  template:
    # Pod template
```

**Service:**
- Exposes Pods to network
- Load balances traffic across Pods
- Provides stable IP/DNS name
- Types: ClusterIP, NodePort, LoadBalancer

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ml-service
spec:
  selector:
    app: ml-model
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer
```

**Relationship:**
```
Service (stable endpoint)
   │
   │ Load balances to
   ▼
Deployment (manages replicas)
   │
   │ Creates and manages
   ▼
Pods (running containers)
```

---

### Q3: How does Horizontal Pod Autoscaler work?

**Answer:**

HPA automatically scales the number of Pods based on observed metrics.

**How it works:**
```
┌────────────────────────────────────────────┐
│         HPA Control Loop                   │
├────────────────────────────────────────────┤
│                                            │
│  1. Metrics Server collects metrics       │
│     (CPU, memory from all pods)           │
│                                            │
│  2. HPA Controller queries metrics        │
│     every 15 seconds (default)            │
│                                            │
│  3. Calculate desired replicas:           │
│     desired = current * (current/target)  │
│                                            │
│  4. Scale Deployment if needed            │
│                                            │
│  5. Wait for stabilization window         │
│                                            │
└────────────────────────────────────────────┘
```

**Example:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ml-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ml-model
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

**Scaling calculation:**
```
Current state:
- 3 replicas running
- Average CPU: 90%
- Target CPU: 70%

Desired replicas = 3 * (90/70) = 3.86 ≈ 4

Action: Scale up to 4 replicas
```

**Custom metrics:**
```yaml
metrics:
- type: Pods
  pods:
    metric:
      name: http_requests_per_second
    target:
      type: AverageValue
      averageValue: "1000"
```

---

### Q4: Explain rolling updates and rollbacks.

**Answer:**

**Rolling Update:**
Gradually replaces old Pods with new ones without downtime.

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1        # Max 1 extra pod during update
    maxUnavailable: 0  # No pods can be unavailable
```

**Process:**
```
Initial state (v1): Pod1, Pod2, Pod3

Step 1: Create Pod4 (v2)
        Pod1(v1), Pod2(v1), Pod3(v1), Pod4(v2)
        Wait for Pod4 to be ready

Step 2: Delete Pod1
        Pod2(v1), Pod3(v1), Pod4(v2)

Step 3: Create Pod5 (v2)
        Pod2(v1), Pod3(v1), Pod4(v2), Pod5(v2)

... continue until all pods are v2
```

**Commands:**
```bash
# Update image (triggers rolling update)
kubectl set image deployment/ml-model model=ml-model:v2

# Watch rollout
kubectl rollout status deployment/ml-model

# Pause rollout
kubectl rollout pause deployment/ml-model

# Resume rollout
kubectl rollout resume deployment/ml-model

# View rollout history
kubectl rollout history deployment/ml-model

# Rollback to previous version
kubectl rollout undo deployment/ml-model

# Rollback to specific revision
kubectl rollout undo deployment/ml-model --to-revision=2
```

**Best practices:**
- Set readiness probes (ensure new pods are healthy)
- Use `maxUnavailable: 0` for zero downtime
- Monitor rollout progress
- Test in staging first

---

### Q5: How do you handle model versioning in Kubernetes?

**Answer:**

**Approach 1: Multiple Deployments (Recommended)**

```yaml
# Deployment for v1
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-model-v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ml-model
      version: v1
  template:
    metadata:
      labels:
        app: ml-model
        version: v1
    spec:
      containers:
      - name: model
        image: ml-model:v1

---
# Deployment for v2
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-model-v2
spec:
  replicas: 1  # Start with 1 replica (canary)
  selector:
    matchLabels:
      app: ml-model
      version: v2
  template:
    metadata:
      labels:
        app: ml-model
        version: v2
    spec:
      containers:
      - name: model
        image: ml-model:v2
```

```yaml
# Service load balances across both versions
apiVersion: v1
kind: Service
metadata:
  name: ml-model-service
spec:
  selector:
    app: ml-model  # Matches both v1 and v2
  ports:
  - port: 80
    targetPort: 8000
```

**Traffic split (Canary):**
- v1: 3 replicas (75% traffic)
- v2: 1 replica (25% traffic)

Gradually increase v2, decrease v1.

**Approach 2: Istio/Service Mesh**

```yaml
# VirtualService for traffic split
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: ml-model
spec:
  hosts:
  - ml-model-service
  http:
  - match:
    - headers:
        x-model-version:
          exact: "v2"
    route:
    - destination:
        host: ml-model-service
        subset: v2
  - route:  # Default route
    - destination:
        host: ml-model-service
        subset: v1
      weight: 90
    - destination:
        host: ml-model-service
        subset: v2
      weight: 10  # 10% to v2
```

**Approach 3: Different Namespaces**

```bash
# Deploy v1 to production namespace
kubectl apply -f deployment-v1.yaml -n production

# Deploy v2 to staging namespace
kubectl apply -f deployment-v2.yaml -n staging

# After testing, switch traffic by updating DNS/ingress
```

**Rollback:**
```bash
# Quick rollback by scaling
kubectl scale deployment ml-model-v2 --replicas=0
kubectl scale deployment ml-model-v1 --replicas=5
```

---

**Quick Reference:**

```bash
# Essential kubectl commands
kubectl get pods
kubectl describe pod <name>
kubectl logs <pod-name> -f
kubectl exec -it <pod-name> -- bash
kubectl apply -f <file.yaml>
kubectl delete -f <file.yaml>
kubectl scale deployment <name> --replicas=5
kubectl rollout status deployment/<name>
kubectl rollout undo deployment/<name>
```

---

[← Back to CI/CD & Docker](./cicd-docker.md) | [Next: AWS Cloud →](./cloud-aws.md)
