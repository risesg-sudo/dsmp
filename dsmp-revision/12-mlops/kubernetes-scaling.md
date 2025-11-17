# Kubernetes Scaling and Load Balancing

## What You'll Learn

Learn how to scale ML models automatically based on traffic, CPU, memory, or custom metrics. This guide covers manual scaling, Horizontal Pod Autoscaler (HPA), and load balancing strategies.

## Manual Scaling

```bash
# Scale to 5 replicas
kubectl scale deployment ml-model --replicas=5

# Verify
kubectl get pods -l app=ml-model
```

## Horizontal Pod Autoscaler (HPA)

HPA automatically scales based on observed metrics:

```yaml
# hpa.yaml
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

## How HPA Works

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

### Scaling Calculation Example

```
Current state:
- 3 replicas running
- Average CPU: 90%
- Target CPU: 70%

Desired replicas = 3 * (90/70) = 3.86 ≈ 4

Action: Scale up to 4 replicas
```

## Managing HPA

```bash
# Apply HPA
kubectl apply -f hpa.yaml

# View HPA status
kubectl get hpa

# Describe HPA
kubectl describe hpa ml-model-hpa

# Watch HPA (auto-refresh)
kubectl get hpa -w
```

## Load Balancing

Kubernetes Service automatically load balances traffic:

```
┌────────────────────────────────────────────┐
│           Load Balancing Flow              │
├────────────────────────────────────────────┤
│                                            │
│        External Request                    │
│              │                             │
│              ▼                             │
│     ┌────────────────┐                     │
│     │    Service     │                     │
│     │  (LoadBalancer)│                     │
│     └────────┬───────┘                     │
│              │                             │
│        Round Robin                         │
│              │                             │
│      ┌───────┼───────┐                     │
│      │       │       │                     │
│      ▼       ▼       ▼                     │
│   ┌───┐   ┌───┐   ┌───┐                   │
│   │Pod│   │Pod│   │Pod│                   │
│   │ 1 │   │ 2 │   │ 3 │                   │
│   └───┘   └───┘   └───┘                   │
│                                            │
└────────────────────────────────────────────┘
```

## Custom Metrics Autoscaling

Scale based on application-specific metrics:

```yaml
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
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "1000"
  - type: Pods
    pods:
      metric:
        name: prediction_latency_ms
      target:
        type: AverageValue
        averageValue: "100"
```

Requires Prometheus Adapter or similar for custom metrics.

## Testing Autoscaling

```bash
# Generate load
kubectl run -it --rm load-generator --image=busybox /bin/sh

# Inside the pod, generate requests
while true; do wget -q -O- http://ml-model-service/predict; done

# Watch scaling in another terminal
kubectl get hpa -w
kubectl get pods -l app=ml-model -w
```

## Best Practices

1. **Set Appropriate Thresholds**: 70-80% CPU utilization is typical
2. **Use Stabilization Windows**: Prevent flapping (rapid scale up/down)
3. **Set min/max Replicas**: Ensure baseline capacity and cost limits
4. **Monitor Scaling Events**: `kubectl describe hpa` shows scaling decisions
5. **Test Under Load**: Verify scaling behavior before production

## Quick Reference

```bash
# Manual scaling
kubectl scale deployment name --replicas=N

# HPA
kubectl autoscale deployment name --min=2 --max=10 --cpu-percent=70
kubectl get hpa
kubectl describe hpa name

# Monitor
kubectl get pods -w
kubectl top pods
kubectl top nodes
```

---

**Navigation:**
[← Previous: Kubernetes ML Deployment](./kubernetes-ml-deployment.md) | [Next: Kubernetes Best Practices →](./kubernetes-best-practices.md)
