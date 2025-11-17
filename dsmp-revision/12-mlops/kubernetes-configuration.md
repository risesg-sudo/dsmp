# Kubernetes Configuration and Storage

## What You'll Learn

Configuration management and persistent storage are crucial for production ML systems. This guide explores ConfigMaps for configuration data, Secrets for sensitive information, and PersistentVolumes for data that survives Pod restarts. You'll learn how to separate configuration from code and ensure your models and data persist across deployments.

## ConfigMaps: Configuration Data

**ConfigMaps** store non-sensitive configuration data as key-value pairs. They separate configuration from container images, making your deployments more flexible.

### Creating ConfigMaps

**From YAML:**
```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ml-model-config
data:
  MODEL_NAME: "customer-churn-predictor"
  LOG_LEVEL: "INFO"
  BATCH_SIZE: "32"
  config.json: |
    {
      "model_version": "v1.0",
      "threshold": 0.5,
      "features": ["age", "income", "credit_score"]
    }
```

**From command line:**
```bash
# From literal values
kubectl create configmap ml-config \
  --from-literal=MODEL_NAME=churn-predictor \
  --from-literal=LOG_LEVEL=DEBUG

# From file
kubectl create configmap ml-config \
  --from-file=config.json

# From directory
kubectl create configmap ml-config \
  --from-file=./config/
```

### Using ConfigMaps in Pods

**As environment variables:**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ml-model-pod
spec:
  containers:
  - name: model-server
    image: ml-model:v1
    env:
    - name: MODEL_NAME
      valueFrom:
        configMapKeyRef:
          name: ml-model-config
          key: MODEL_NAME
    - name: LOG_LEVEL
      valueFrom:
        configMapKeyRef:
          name: ml-model-config
          key: LOG_LEVEL
```

**As volume mounts:**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ml-model-pod
spec:
  containers:
  - name: model-server
    image: ml-model:v1
    volumeMounts:
    - name: config-volume
      mountPath: /app/config
  volumes:
  - name: config-volume
    configMap:
      name: ml-model-config
```

Then your application reads from `/app/config/config.json`.

**All ConfigMap data as environment variables:**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ml-model-pod
spec:
  containers:
  - name: model-server
    image: ml-model:v1
    envFrom:
    - configMapRef:
        name: ml-model-config
```

### Managing ConfigMaps

```bash
# Create
kubectl apply -f configmap.yaml

# View ConfigMaps
kubectl get configmaps

# Describe ConfigMap
kubectl describe configmap ml-model-config

# View ConfigMap data
kubectl get configmap ml-model-config -o yaml

# Delete
kubectl delete configmap ml-model-config
```

## Secrets: Sensitive Data

**Secrets** store sensitive information like passwords, API keys, and tokens. They're similar to ConfigMaps but designed for confidential data.

### Creating Secrets

**From YAML:**
```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: ml-model-secrets
type: Opaque
stringData:  # Will be base64 encoded automatically
  aws-access-key: AKIAIOSFODNN7EXAMPLE
  aws-secret-key: wJalrXUtnFEMI/K7MDENG/bPxRfiCY
  api-key: super-secret-key-12345
```

**From command line:**
```bash
# Create secret from literals
kubectl create secret generic ml-model-secrets \
  --from-literal=aws-access-key=AKIAIOSFODNN7EXAMPLE \
  --from-literal=aws-secret-key=wJalrXUtnFEMI

# Create secret from file
kubectl create secret generic ml-model-secrets \
  --from-file=./credentials.json

# Create Docker registry secret
kubectl create secret docker-registry regcred \
  --docker-server=your-registry \
  --docker-username=your-name \
  --docker-password=your-password
```

### Using Secrets in Pods

**As environment variables:**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ml-model-pod
spec:
  containers:
  - name: model-server
    image: ml-model:v1
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

**As volume mounts:**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ml-model-pod
spec:
  containers:
  - name: model-server
    image: ml-model:v1
    volumeMounts:
    - name: secret-volume
      mountPath: /app/secrets
      readOnly: true
  volumes:
  - name: secret-volume
    secret:
      secretName: ml-model-secrets
```

Files appear in `/app/secrets/aws-access-key` and `/app/secrets/aws-secret-key`.

### Managing Secrets

```bash
# Create
kubectl apply -f secret.yaml

# View secrets (values not shown)
kubectl get secrets

# Describe secret
kubectl describe secret ml-model-secrets

# View secret data (base64 encoded)
kubectl get secret ml-model-secrets -o yaml

# Decode secret
kubectl get secret ml-model-secrets -o jsonpath='{.data.aws-access-key}' | base64 --decode
```

### Secret Best Practices

**1. Use External Secret Management**
For production, use:
- AWS Secrets Manager
- Azure Key Vault
- Google Secret Manager
- HashiCorp Vault

**2. Enable Encryption at Rest**
```bash
# Verify encryption
kubectl get secrets -o yaml | grep encryption
```

**3. Limit Access with RBAC**
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: secret-reader
rules:
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "list"]
```

## PersistentVolumes: Storage

**PersistentVolumes (PV)** and **PersistentVolumeClaims (PVC)** provide storage that persists beyond Pod lifecycles.

### PersistentVolumeClaim

```yaml
# pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: model-storage
spec:
  accessModes:
  - ReadWriteOnce  # Single node read/write
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard
```

**Access Modes:**
- **ReadWriteOnce (RWO)**: Single node read/write
- **ReadOnlyMany (ROX)**: Multiple nodes read-only
- **ReadWriteMany (RWX)**: Multiple nodes read/write

### Using PVC in Pods

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ml-model-pod
spec:
  containers:
  - name: model-server
    image: ml-model:v1
    volumeMounts:
    - name: model-storage
      mountPath: /app/models
  volumes:
  - name: model-storage
    persistentVolumeClaim:
      claimName: model-storage
```

### Dynamic Provisioning

Most cloud providers support dynamic provisioning:

```yaml
# AWS EBS
storageClassName: gp2

# GCP Persistent Disk
storageClassName: standard

# Azure Disk
storageClassName: managed-premium
```

Kubernetes automatically creates the volume when you create the PVC.

### Managing Persistent Storage

```bash
# Create PVC
kubectl apply -f pvc.yaml

# View PVCs
kubectl get pvc

# View PVs
kubectl get pv

# Describe PVC
kubectl describe pvc model-storage

# Delete PVC (may also delete PV depending on policy)
kubectl delete pvc model-storage
```

## Complete Example: ML Deployment with Configuration

```yaml
# deployment-complete.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-model
spec:
  replicas: 3
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

        # ConfigMap as environment variables
        env:
        - name: MODEL_NAME
          valueFrom:
            configMapKeyRef:
              name: ml-model-config
              key: MODEL_NAME
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: ml-model-config
              key: LOG_LEVEL

        # Secrets as environment variables
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

        # ConfigMap as volume
        volumeMounts:
        - name: config-volume
          mountPath: /app/config

        # PVC for model storage
        - name: model-storage
          mountPath: /app/models

      volumes:
      - name: config-volume
        configMap:
          name: ml-model-config
      - name: model-storage
        persistentVolumeClaim:
          claimName: model-storage
```

Deploy everything:
```bash
# 1. Create ConfigMap
kubectl apply -f configmap.yaml

# 2. Create Secret
kubectl apply -f secret.yaml

# 3. Create PVC
kubectl apply -f pvc.yaml

# 4. Create Deployment
kubectl apply -f deployment-complete.yaml

# Verify
kubectl get pods
kubectl exec -it <pod-name> -- env | grep MODEL_NAME
kubectl exec -it <pod-name> -- ls /app/config
kubectl exec -it <pod-name> -- ls /app/models
```

## When to Use Each

**ConfigMaps:**
- Application settings
- Feature flags
- Configuration files
- Non-sensitive data

**Secrets:**
- API keys
- Database passwords
- TLS certificates
- Any sensitive data

**PersistentVolumes:**
- Model files
- Datasets
- Logs
- Any data that must survive Pod restarts

## Best Practices

**1. Externalize Configuration**
Never hardcode configuration in images.

**2. Use Secrets for Sensitive Data**
Even if base64 encoding isn't encryption, it's better than plain text.

**3. Version Your ConfigMaps**
```yaml
name: ml-model-config-v2
```
This allows zero-downtime updates.

**4. Set Storage Quotas**
```yaml
resources:
  requests:
    storage: 10Gi
  limits:
    storage: 20Gi
```

**5. Backup PersistentVolumes**
Critical data should be backed up regularly.

## Quick Reference

```bash
# ConfigMap
kubectl create configmap name --from-literal=key=value
kubectl get configmap name -o yaml

# Secret
kubectl create secret generic name --from-literal=key=value
kubectl get secret name -o jsonpath='{.data.key}' | base64 --decode

# PVC
kubectl apply -f pvc.yaml
kubectl get pvc
kubectl describe pvc name
```

---

**Navigation:**
[← Previous: Kubernetes Core Objects](./kubernetes-core-objects.md) | [Next: Kubernetes ML Deployment →](./kubernetes-ml-deployment.md)

**Related Topics:**
- [Kubernetes Fundamentals](./kubernetes-fundamentals.md)
- [Kubernetes Best Practices](./kubernetes-best-practices.md)
