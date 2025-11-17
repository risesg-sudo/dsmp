# Kubernetes Core Objects

## What You'll Learn

Kubernetes objects are the building blocks of your applications. This guide explores the essential objects every ML engineer needs: Pods (the smallest deployable units), Deployments (for managing replicas), and Services (for networking). You'll learn when to use each object and how they work together to create robust ML systems.

## Pods: The Fundamental Unit

A **Pod** is the smallest deployable unit in Kubernetes. It contains one or more containers that share networking and storage.

### Simple Pod Definition

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

### Working with Pods

```bash
# Create pod
kubectl apply -f pod.yaml

# View pods
kubectl get pods

# View detailed information
kubectl describe pod ml-model-pod

# View logs
kubectl logs ml-model-pod

# Follow logs
kubectl logs -f ml-model-pod

# Execute command in pod
kubectl exec -it ml-model-pod -- bash

# Delete pod
kubectl delete pod ml-model-pod
```

### When to Use Pods Directly

**Use Pods when:**
- Running one-off jobs
- Debugging and testing
- Learning Kubernetes

**Don't use Pods for:**
- Production deployments (use Deployments instead)
- Anything that needs to scale
- Applications requiring high availability

**Why?** Pods are ephemeral. If a Pod dies, it's gone. Deployments ensure Pods are recreated.

## Deployments: Managing Replicas

**Deployments** manage a set of identical Pods. They ensure your desired number of replicas are always running.

### Deployment Definition

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

### Deployment Components Explained

**replicas**: Number of Pod copies to run
**selector**: How Deployment finds its Pods
**template**: Pod specification (what each Pod looks like)
**livenessProbe**: Checks if container is alive (restarts if fails)
**readinessProbe**: Checks if container is ready for traffic

### Working with Deployments

```bash
# Apply deployment
kubectl apply -f deployment.yaml

# View deployments
kubectl get deployments

# View pods created by deployment
kubectl get pods -l app=ml-model

# Update image (triggers rolling update)
kubectl set image deployment/ml-model-deployment model-server=username/ml-model:v2

# Rollback to previous version
kubectl rollout undo deployment/ml-model-deployment

# View rollout history
kubectl rollout history deployment/ml-model-deployment

# View rollout status
kubectl rollout status deployment/ml-model-deployment

# Scale deployment
kubectl scale deployment ml-model-deployment --replicas=5

# Edit deployment
kubectl edit deployment ml-model-deployment
```

### Rolling Updates

Deployments update Pods gradually without downtime:

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Max 1 extra pod during update
      maxUnavailable: 0  # No pods can be unavailable
```

**Update Process:**
```
Initial: Pod1(v1), Pod2(v1), Pod3(v1)

Step 1: Create Pod4(v2)
        Pod1(v1), Pod2(v1), Pod3(v1), Pod4(v2)

Step 2: Delete Pod1 after Pod4 is ready
        Pod2(v1), Pod3(v1), Pod4(v2)

Step 3: Create Pod5(v2)
        Pod2(v1), Pod3(v1), Pod4(v2), Pod5(v2)

... continue until all pods are v2
```

## Services: Exposing Applications

**Services** expose Pods to network traffic. They provide a stable IP and DNS name even as Pods come and go.

### Service Definition

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

### Service Types

```
┌────────────────────────────────────────────────────┐
│              Service Types                         │
├────────────────────────────────────────────────────┤
│                                                    │
│  1. ClusterIP (default)                           │
│     ┌────────────────────────────────┐            │
│     │ Only accessible within cluster │            │
│     │ Internal services              │            │
│     └────────────────────────────────┘            │
│                                                    │
│  2. NodePort                                      │
│     ┌────────────────────────────────┐            │
│     │ Accessible on node IP:port     │            │
│     │ Port range: 30000-32767        │            │
│     │ Good for development           │            │
│     └────────────────────────────────┘            │
│                                                    │
│  3. LoadBalancer                                  │
│     ┌────────────────────────────────┐            │
│     │ External load balancer         │            │
│     │ (AWS ELB, GCP LB, etc.)        │            │
│     │ Production deployments         │            │
│     └────────────────────────────────┘            │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Working with Services

```bash
# Create service
kubectl apply -f service.yaml

# View services
kubectl get services

# Get service details
kubectl describe service ml-model-service

# Get external IP (for LoadBalancer)
kubectl get service ml-model-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

# Test service from inside cluster
kubectl run test-pod --rm -it --image=curlimages/curl -- sh
curl http://ml-model-service/health
```

### How Services Work

Services use **selectors** to find Pods:

```yaml
# Service
selector:
  app: ml-model

# Pods (from Deployment)
labels:
  app: ml-model

# Service automatically routes to all matching Pods
```

The Service maintains a list of Pod IPs (called Endpoints):

```bash
# View endpoints
kubectl get endpoints ml-model-service

# Should show all Pod IPs
NAME               ENDPOINTS
ml-model-service   10.1.0.5:8000,10.1.0.6:8000,10.1.0.7:8000
```

## Putting It All Together

Here's how Pods, Deployments, and Services interact:

```
Service (ml-model-service)
   │
   │ Routes traffic to
   ▼
Deployment (ml-model-deployment)
   │
   │ Manages
   ▼
Pods (ml-model-pod-xxx1, ml-model-pod-xxx2, ml-model-pod-xxx3)
   │
   │ Run containers
   ▼
Docker Containers (username/ml-model:v1)
```

### Complete Example

```bash
# 1. Create deployment
kubectl apply -f deployment.yaml

# 2. Verify pods are running
kubectl get pods
# ml-model-deployment-abc123  1/1  Running
# ml-model-deployment-def456  1/1  Running
# ml-model-deployment-ghi789  1/1  Running

# 3. Create service
kubectl apply -f service.yaml

# 4. Get external IP
kubectl get service ml-model-service
# NAME               TYPE           EXTERNAL-IP    PORT
# ml-model-service   LoadBalancer   34.123.45.67   80:32456/TCP

# 5. Test the service
curl http://34.123.45.67/predict -X POST -d '{"features": [1,2,3]}'
```

## Resource Requests and Limits

Control resource allocation for your Pods:

```yaml
resources:
  requests:     # Guaranteed resources
    memory: "1Gi"
    cpu: "500m"
  limits:       # Maximum resources
    memory: "2Gi"
    cpu: "1000m"
```

**CPU Units:**
- `1` = 1 CPU core
- `500m` = 0.5 CPU core (500 millicores)
- `100m` = 0.1 CPU core

**Memory Units:**
- `1Gi` = 1 Gibibyte (1024 MiB)
- `512Mi` = 512 Mebibytes
- `1G` = 1 Gigabyte (1000 MB)

## Health Checks

**Liveness Probe**: Detects if container is alive (restarts if fails)
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10
```

**Readiness Probe**: Detects if container is ready for traffic
```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 5
```

**Startup Probe**: For slow-starting containers
```yaml
startupProbe:
  httpGet:
    path: /health
    port: 8000
  failureThreshold: 30
  periodSeconds: 10
```

## Best Practices

**1. Always Use Deployments**
Don't create Pods directly in production.

**2. Set Resource Requests/Limits**
Prevents one Pod from consuming all resources.

**3. Use Readiness Probes**
Ensures traffic only goes to ready Pods.

**4. Label Everything**
Makes resource management easier:
```yaml
labels:
  app: ml-model
  version: v1
  tier: backend
  environment: production
```

**5. Use Services for Communication**
Never hardcode Pod IPs.

## Quick Reference

```yaml
# Pod
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: container
    image: image:tag

# Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    # Pod spec here

# Service
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer
```

---

**Navigation:**
[← Previous: Kubernetes Fundamentals](./kubernetes-fundamentals.md) | [Next: Kubernetes Configuration →](./kubernetes-configuration.md)

**Related Topics:**
- [Kubernetes ML Deployment](./kubernetes-ml-deployment.md)
- [Kubernetes Scaling](./kubernetes-scaling.md)
