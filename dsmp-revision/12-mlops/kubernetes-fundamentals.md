# Kubernetes Fundamentals

## What You'll Learn

Kubernetes (K8s) transforms how we deploy and manage containerized applications at scale. This guide demystifies Kubernetes by explaining why it exists, how it works, and when to use it for machine learning. You'll discover how Kubernetes automates the complex tasks of deploying, scaling, and maintaining ML models in production.

## What is Kubernetes?

**Kubernetes** is an open-source container orchestration platform that automates deployment, scaling, and management of containerized applications. Think of it as an intelligent operating system for your cluster of servers.

### The Problem Kubernetes Solves

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
│  • Load balancing challenges                           │
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
│  • Service discovery                                   │
└────────────────────────────────────────────────────────┘
```

## Why Kubernetes for Machine Learning?

ML workloads have unique requirements that Kubernetes handles elegantly:

| Challenge | K8s Solution |
|-----------|-------------|
| **Scaling** | Auto-scale based on CPU, memory, or custom metrics |
| **High Availability** | Multiple replicas, automatic failover |
| **Resource Management** | Efficient CPU/GPU allocation across nodes |
| **Deployment** | Rolling updates, canary, blue-green deployments |
| **Multi-tenancy** | Run multiple models on same cluster |
| **Cost Optimization** | Efficient resource utilization, spot instances |

### Real-World ML Scenario

```
Scenario: Prediction API with variable traffic
- Daytime: 1000 req/s
- Nighttime: 50 req/s

Without Kubernetes:
- Run 20 servers 24/7
- Cost: $2,000/month
- Wasted capacity at night

With Kubernetes:
- Auto-scale 2-20 pods based on load
- Average: 8 pods
- Cost: $800/month (60% savings!)
```

## Kubernetes Architecture

Understanding the architecture helps you deploy and troubleshoot effectively:

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

### Architecture Components

**Control Plane (Master)**
- **API Server**: Front-end for Kubernetes, all communication goes through here
- **Scheduler**: Decides which node runs which pod
- **Controller Manager**: Maintains desired state (e.g., keeps 3 replicas running)
- **etcd**: Key-value store for cluster state

**Worker Nodes**
- **kubelet**: Agent that runs on each node, manages containers
- **kube-proxy**: Handles networking and load balancing
- **Container Runtime**: Docker, containerd, or CRI-O

## Core Kubernetes Concepts

**Declarative Configuration**
You tell Kubernetes the desired state, it makes it happen:
```yaml
# You declare: "I want 3 pods"
replicas: 3

# Kubernetes ensures 3 pods always run
# If one dies, it creates a new one
```

**Self-Healing**
Kubernetes automatically replaces failed containers:
```
Pod crashes → Kubernetes detects → Creates new pod → Traffic routes to healthy pods
```

**Service Discovery**
Pods find each other automatically:
```python
# Inside a pod
DATABASE_URL = "postgresql://user:pass@db-service:5432/mldb"
# 'db-service' is automatically resolved
```

## When to Use Kubernetes for ML

**Use Kubernetes when you have:**
- Multiple models to deploy
- Variable traffic patterns
- Need high availability (99.9%+)
- Multiple environments (dev, staging, prod)
- Team collaboration requirements
- Microservices architecture

**Skip Kubernetes if you have:**
- Single model, simple deployment
- Predictable, constant traffic
- Small team with limited DevOps experience
- Budget constraints (learning curve cost)
- Simple serverless deployment works

## Kubernetes vs Alternatives

| Platform | Best For | Complexity | Cost |
|----------|----------|------------|------|
| **Kubernetes** | Multi-model, high scale | High | Medium |
| **AWS ECS** | AWS-only deployments | Medium | Low |
| **Cloud Run** | Serverless containers | Low | Low |
| **Docker Compose** | Development, single host | Low | Very Low |
| **Nomad** | Simpler than K8s | Medium | Low |

## Getting Started with Kubernetes

### Local Development

**Minikube**: Single-node cluster for learning
```bash
# Install minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Start cluster
minikube start

# Verify
kubectl get nodes
```

**Kind**: Kubernetes in Docker
```bash
kind create cluster
kubectl cluster-info
```

### Cloud Kubernetes Services

**Managed Kubernetes** (recommended for production):
- **AWS EKS**: Amazon Elastic Kubernetes Service
- **GCP GKE**: Google Kubernetes Engine
- **Azure AKS**: Azure Kubernetes Service

These handle control plane management, upgrades, and scaling.

## Essential kubectl Commands

```bash
# Cluster info
kubectl cluster-info
kubectl get nodes

# View resources
kubectl get pods
kubectl get deployments
kubectl get services

# Describe resource (detailed info)
kubectl describe pod my-pod

# View logs
kubectl logs my-pod
kubectl logs -f my-pod  # Follow

# Execute command in pod
kubectl exec -it my-pod -- bash

# Apply configuration
kubectl apply -f deployment.yaml

# Delete resource
kubectl delete pod my-pod
```

## Quick Reference

```yaml
# Kubernetes Hierarchy
Cluster
  └─ Nodes (servers)
      └─ Pods (smallest unit)
          └─ Containers (Docker containers)

# Key Objects
- Pod: One or more containers
- Deployment: Manages Pods
- Service: Exposes Pods to network
- ConfigMap: Configuration data
- Secret: Sensitive data
- PersistentVolume: Storage
```

```bash
# Essential kubectl
kubectl get <resource>
kubectl describe <resource> <name>
kubectl logs <pod-name>
kubectl exec -it <pod-name> -- bash
kubectl apply -f <file.yaml>
kubectl delete <resource> <name>
```

## Next Steps

Now that you understand Kubernetes fundamentals, you're ready to:
- Learn about core Kubernetes objects (Pods, Deployments, Services)
- Deploy your first ML model on Kubernetes
- Set up auto-scaling for variable traffic
- Implement health checks and monitoring

---

**Navigation:**
[Next: Kubernetes Core Objects →](./kubernetes-core-objects.md)

**Related Topics:**
- [Docker Fundamentals](./docker-fundamentals.md)
- [Kubernetes ML Deployment](./kubernetes-ml-deployment.md)
- [Kubernetes Scaling](./kubernetes-scaling.md)
