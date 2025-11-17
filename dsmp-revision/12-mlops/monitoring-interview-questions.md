# Monitoring Interview Questions

## What You'll Learn

This guide covers essential interview questions about ML monitoring, drift detection, pipeline orchestration, and production best practices. Understanding these questions demonstrates your ability to maintain and improve ML systems in production.

## Q1: What is model drift and how do you detect it?

**Answer:**

Model drift occurs when a machine learning model's performance degrades over time due to changes in data patterns or relationships.

### Types of Drift

**1. Data Drift (Covariate Shift)**
- **What changes:** Input distribution P(X)
- **What stays same:** Relationship P(Y|X)
- **Example:** Customer age distribution shifts from 25-45 to 18-25
- **Impact:** Model works correctly but on different data distribution

**2. Concept Drift**
- **What changes:** Relationship between features and target P(Y|X)
- **What stays same:** Input distribution
- **Example:** Economic crisis changes what "creditworthy" means
- **Impact:** Model's learned patterns no longer apply (most dangerous!)

**3. Label Drift (Prior Shift)**
- **What changes:** Target distribution P(Y)
- **What stays same:** Relationships
- **Example:** Fraud rate increases from 1% to 5%
- **Impact:** Prediction distribution becomes miscalibrated

### Detection Methods

**1. Statistical Tests:**
```python
from scipy import stats

# Kolmogorov-Smirnov Test
def detect_drift(train_data, prod_data, feature_idx):
    train_feature = train_data[:, feature_idx]
    prod_feature = prod_data[:, feature_idx]

    statistic, p_value = stats.ks_2samp(train_feature, prod_feature)

    if p_value < 0.05:
        return True, "Drift detected"
    return False, "No drift"
```

**2. Population Stability Index (PSI):**
```python
# PSI Thresholds:
# < 0.1: No significant drift
# 0.1 - 0.2: Moderate drift
# > 0.2: Significant drift

psi = sum((prod_pct - train_pct) * log(prod_pct / train_pct))
```

**3. Model-Based Detection:**
```python
# Train classifier to distinguish training vs production data
# High AUC indicates drift
auc = train_classifier_to_distinguish(train_data, prod_data)
drift_detected = auc > 0.6
```

### Handling Drift

When drift is detected:
1. **Retrain model** with recent data
2. **Update features** if needed
3. **Switch to ensemble** approach
4. **Implement gradual** model updates

---

## Q2: Explain Apache Airflow and its use in ML pipelines

**Answer:**

Apache Airflow is a workflow orchestration platform that schedules and monitors data pipelines using DAGs (Directed Acyclic Graphs).

### Key Concepts

**1. DAG (Directed Acyclic Graph)**
- Defines workflow structure
- Contains tasks and dependencies
- Scheduled execution

**2. Operators**
- PythonOperator: Execute Python functions
- BashOperator: Run shell commands
- Sensors: Wait for conditions

**3. Task Dependencies**
```python
task_a >> task_b >> task_c  # Sequential
task_a >> [task_b, task_c]  # Parallel
```

### Benefits for ML

**Why use Airflow:**
- **Scheduled retraining:** Daily/weekly/monthly model updates
- **Dependency management:** Ensure correct execution order
- **Retry logic:** Automatic failure handling
- **Monitoring:** Web UI for pipeline visibility
- **Scalability:** Distributed task execution

**Example ML Pipeline:**
```python
from airflow import DAG
from airflow.operators.python import PythonOperator

dag = DAG('ml_pipeline', schedule_interval='@daily')

extract = PythonOperator(
    task_id='extract',
    python_callable=extract_data,
    dag=dag
)
train = PythonOperator(
    task_id='train',
    python_callable=train_model,
    dag=dag
)
deploy = PythonOperator(
    task_id='deploy',
    python_callable=deploy_model,
    dag=dag
)

extract >> train >> deploy
```

### When to Use

**Choose Airflow when:**
- Complex multi-step pipelines
- Need scheduling and retry logic
- Want dependency management
- Require monitoring UI

**Alternatives:**
- **Kubeflow:** Kubernetes-native, more complex
- **Prefect:** Modern alternative, better API
- **MLflow Projects:** Simpler, fewer features
- **Cron:** Too basic for ML pipelines

---

## Q3: How do you monitor ML models in production?

**Answer:**

Production monitoring requires tracking multiple dimensions to ensure model health and business value.

### Monitoring Dimensions

**1. Performance Metrics**
- Accuracy, precision, recall, F1
- AUC-ROC, log loss
- Track over time windows

```python
from sklearn.metrics import accuracy_score

class PerformanceMonitor:
    def calculate_metrics(self, window_days=7):
        recent_preds = self.get_recent_predictions(window_days)
        recent_truth = self.get_recent_ground_truth(window_days)

        if len(recent_truth) < 100:
            return None  # Insufficient data

        return {
            'accuracy': accuracy_score(recent_truth, recent_preds),
            'window_days': window_days,
            'num_samples': len(recent_truth)
        }
```

**2. Data Quality**
- Missing values
- Outliers
- Feature distributions
- Data drift

**3. Prediction Distribution**
- Class balance
- Confidence scores
- Prediction drift

**4. System Metrics**
- Latency (p50, p95, p99)
- Throughput (requests/sec)
- Error rate
- Memory/CPU usage

**5. Business Metrics**
- Conversion rate
- Revenue impact
- User satisfaction
- Cost of errors (false positives/negatives)

### Implementation

```python
from prometheus_client import Counter, Histogram, Gauge

# Define metrics
predictions_total = Counter('predictions_total', 'Total predictions')
prediction_latency = Histogram('prediction_latency_seconds', 'Latency')
prediction_accuracy = Gauge('prediction_accuracy', 'Accuracy')

@app.post("/predict")
def predict(features: list):
    start = time.time()

    # Predict
    prediction = model.predict([features])

    # Update metrics
    predictions_total.inc()
    prediction_latency.observe(time.time() - start)

    # Log for later accuracy calculation
    db.log_prediction(features, prediction)

    return {'prediction': int(prediction[0])}

# Background job: Update accuracy
def update_accuracy():
    recent_data = db.get_predictions_with_ground_truth(hours=24)
    if len(recent_data) > 100:
        accuracy = calculate_accuracy(recent_data)
        prediction_accuracy.set(accuracy)
```

### Monitoring Tools

- **Prometheus + Grafana:** Metrics and dashboards
- **ELK Stack:** Centralized logging
- **DataDog/New Relic:** APM
- **MLflow:** Experiment tracking
- **WhyLabs/Fiddler:** Specialized ML monitoring

---

## Q4: How do you handle model retraining in production?

**Answer:**

Model retraining requires careful strategy to maintain performance while managing costs and complexity.

### Retraining Strategies

**1. Scheduled Retraining**
- **When:** Daily/weekly/monthly
- **Pros:** Simple, predictable
- **Cons:** May retrain unnecessarily

```python
# Airflow DAG with daily schedule
dag = DAG('retrain_model', schedule_interval='@daily')
```

**2. Performance-Based**
- **Trigger:** Accuracy drops below threshold
- **Pros:** Efficient, targeted
- **Cons:** Requires ground truth

```python
if current_accuracy < baseline_accuracy - 0.05:
    trigger_retraining()
```

**3. Drift-Based**
- **Trigger:** Significant data drift detected
- **Pros:** Proactive, no ground truth needed
- **Cons:** More complex

```python
if psi > 0.2:  # Significant drift
    trigger_retraining()
```

**4. Data-Based**
- **Trigger:** After X new samples
- **Pros:** Ensures fresh data
- **Cons:** Arbitrary threshold

```python
if new_samples > 10000:
    trigger_retraining()
```

### Implementation with Airflow

```python
from airflow import DAG
from airflow.operators.python import BranchPythonOperator

def check_if_retraining_needed(**context):
    """Decide if retraining needed"""
    metrics = get_current_metrics()

    # Check multiple conditions
    if metrics['accuracy'] < 0.85:
        return 'retrain'
    elif metrics['drift_score'] > 0.2:
        return 'retrain'
    elif metrics['days_since_training'] > 30:
        return 'retrain'
    else:
        return 'skip'

check = BranchPythonOperator(
    task_id='check',
    python_callable=check_if_retraining_needed,
    dag=dag
)

retrain = PythonOperator(task_id='retrain', ...)
skip = DummyOperator(task_id='skip')

check >> [retrain, skip]
```

### Best Practices

1. **A/B test new model** before full deployment
2. **Shadow mode first** - Run both, compare
3. **Gradual rollout** - Canary deployment
4. **Keep previous versions** - Easy rollback
5. **Monitor closely** - First 24-48 hours critical
6. **Automate only if confident** - Manual approval for high-risk

---

## Q5: What metrics should you monitor for an ML API?

**Answer:**

Comprehensive ML API monitoring covers technical performance, model behavior, and business impact.

### Metric Categories

**1. API Metrics**
```python
- Request rate (requests/second)
- Latency (p50, p95, p99)
- Error rate (%)
- Availability/uptime (%)
```

**2. Model Metrics**
```python
- Prediction distribution
- Confidence scores
- Feature distributions
- Drift scores (PSI, KS statistic)
```

**3. Business Metrics**
```python
- Conversion rate
- Revenue impact
- User engagement
- False positive/negative costs
```

**4. Infrastructure Metrics**
```python
- CPU usage (%)
- Memory usage (%)
- GPU utilization (%)
- Disk I/O
- Network traffic
```

### Example Dashboard Layout

```
┌─────────────────────────────────────────────┐
│         ML API Dashboard                    │
├─────────────────────────────────────────────┤
│                                             │
│  Real-time Metrics                          │
│  ├─ Request Rate: 1,234 req/sec           │
│  ├─ Latency P95: 125ms                    │
│  ├─ Error Rate: 0.2%                      │
│  └─ Uptime: 99.9%                         │
│                                             │
│  Model Health (24h)                         │
│  ├─ Accuracy: 0.89 ⚠ (baseline: 0.92)     │
│  ├─ Prediction Drift: 0.15                │
│  ├─ Confidence: 0.83                       │
│  └─ Data Drift (PSI): 0.12                │
│                                             │
│  Business Impact                            │
│  ├─ Conversion Rate: 12%                   │
│  ├─ Daily Revenue: $45,232                 │
│  ├─ False Positives: 23 ($690 cost)       │
│  └─ False Negatives: 8 ($2,400 cost)      │
│                                             │
│  Infrastructure                             │
│  ├─ CPU: 65%                               │
│  ├─ Memory: 72%                            │
│  ├─ GPU: 88%                               │
│  └─ Active Requests: 45                   │
└─────────────────────────────────────────────┘
```

### Alerting Thresholds

```yaml
Critical Alerts:
  - Latency > 1000ms for 5 minutes
  - Error rate > 1% for 5 minutes
  - Accuracy < 0.80 for 24 hours
  - Drift score (PSI) > 0.25
  - Memory > 95%

Warning Alerts:
  - Latency > 500ms for 10 minutes
  - Error rate > 0.5% for 10 minutes
  - Accuracy < 0.85 for 24 hours
  - Drift score (PSI) > 0.15
  - Memory > 85%
```

### Implementation

```python
from prometheus_client import Counter, Histogram, Gauge, Summary

# API metrics
request_count = Counter('api_requests_total', 'Total requests')
request_latency = Histogram('api_latency_seconds', 'Request latency')
error_count = Counter('api_errors_total', 'Total errors')

# Model metrics
prediction_confidence = Gauge('prediction_confidence', 'Avg confidence')
drift_score = Gauge('drift_score', 'Data drift score')

# Business metrics
conversion_rate = Gauge('conversion_rate', 'Conversion rate')
revenue_metric = Counter('revenue_total', 'Total revenue')

@app.post("/predict")
def predict(features: list):
    request_count.inc()
    start = time.time()

    try:
        prediction = model.predict([features])
        confidence = max(model.predict_proba([features])[0])

        # Update metrics
        request_latency.observe(time.time() - start)
        prediction_confidence.set(confidence)

        return {'prediction': int(prediction[0])}
    except Exception as e:
        error_count.inc()
        raise
```

---

## Quick Reference

```python
# Drift detection
from scipy import stats
statistic, p_value = stats.ks_2samp(train_data, prod_data)

# Airflow DAG
dag = DAG('pipeline', schedule_interval='@daily')
task1 >> task2 >> task3

# Monitoring
counter.inc()
histogram.observe(value)
gauge.set(value)

# Retraining trigger
if accuracy < threshold or drift_detected:
    retrain_model()
```

## Summary

Understanding ML monitoring and production best practices is essential for ML engineering roles. Be prepared to explain drift types and detection methods, describe Airflow's role in orchestrating ML pipelines, outline comprehensive monitoring strategies covering technical and business metrics, and discuss intelligent retraining triggers. Demonstrating knowledge of these concepts shows you can maintain and improve ML systems in production environments.

---

**Related Topics:**
- [Model Monitoring Basics](./model-monitoring-basics.md)
- [Drift Detection](./drift-detection.md)
- [Logging and Observability](./logging-observability.md)
- [Airflow for ML Basics](./airflow-ml-basics.md)
- [Monitoring Best Practices](./monitoring-best-practices.md)
