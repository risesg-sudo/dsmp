# Model Monitoring Basics

## What You'll Learn

Models that perform well in training can degrade in production. This guide explains why monitoring ML models is critical, what metrics to track, and how to detect when your model needs attention. You'll learn to build monitoring systems that catch problems before they impact your business.

## Why Monitor ML Models?

Unlike traditional software, ML models can silently degrade over time without any code changes. Data distributions shift, user behavior evolves, and relationships between features and targets change. Without monitoring, you won't know until business metrics suffer.

```
┌──────────────────────────────────────────────────┐
│     Model Performance Over Time                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  Accuracy                                        │
│    │                                             │
│0.95│ ████████                                    │
│    │         ████                                │
│0.90│             ██                              │
│    │               █                             │
│0.85│                █                            │
│    │                 █                           │
│0.80│                  ───── Model Drift!         │
│    └──────────────────────────────────▶         │
│     Deploy  Week 1  Week 2  Week 3   Time       │
│                                                  │
│  Causes:                                         │
│  • Data distribution changes                    │
│  • Concept drift (relationship changes)         │
│  • Data quality issues                          │
│  • Seasonal patterns                            │
└──────────────────────────────────────────────────┘
```

## Key Metrics to Monitor

### 1. Performance Metrics

Track how well your model performs on real production data.

```python
# monitoring.py
import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from datetime import datetime, timedelta

class ModelMonitor:
    def __init__(self):
        self.predictions = []
        self.ground_truth = []
        self.timestamps = []

    def log_prediction(self, prediction, features, timestamp=None):
        """Log a prediction"""
        self.predictions.append(prediction)
        self.timestamps.append(timestamp or datetime.utcnow())

    def log_ground_truth(self, ground_truth):
        """Log ground truth when available"""
        self.ground_truth.append(ground_truth)

    def calculate_metrics(self, window_days=7):
        """Calculate metrics for recent window"""
        cutoff_time = datetime.utcnow() - timedelta(days=window_days)

        # Filter recent predictions
        recent_indices = [
            i for i, ts in enumerate(self.timestamps)
            if ts >= cutoff_time
        ]

        if not recent_indices:
            return None

        recent_preds = [self.predictions[i] for i in recent_indices]
        recent_truth = [
            self.ground_truth[i] for i in recent_indices
            if i < len(self.ground_truth)
        ]

        if len(recent_truth) < len(recent_preds) * 0.1:
            return None  # Need at least 10% ground truth

        # Calculate metrics
        metrics = {
            'accuracy': accuracy_score(
                recent_truth,
                recent_preds[:len(recent_truth)]
            ),
            'precision': precision_score(
                recent_truth,
                recent_preds[:len(recent_truth)],
                average='weighted'
            ),
            'recall': recall_score(
                recent_truth,
                recent_preds[:len(recent_truth)],
                average='weighted'
            ),
            'f1_score': f1_score(
                recent_truth,
                recent_preds[:len(recent_truth)],
                average='weighted'
            ),
            'window_days': window_days,
            'num_predictions': len(recent_preds),
            'num_ground_truth': len(recent_truth)
        }

        return metrics

    def check_performance_degradation(
        self,
        baseline_accuracy=0.85,
        threshold=0.05
    ):
        """Alert if performance drops"""
        metrics = self.calculate_metrics()

        if metrics is None:
            return False, "Insufficient data"

        if metrics['accuracy'] < baseline_accuracy - threshold:
            return True, f"Performance degraded! Accuracy: {metrics['accuracy']:.3f}"

        return False, "Performance OK"

# Usage
monitor = ModelMonitor()

# Log predictions
monitor.log_prediction(1, [35, 50000, 720, 25000])

# Later, log ground truth when available
monitor.log_ground_truth(1)

# Check performance
degraded, message = monitor.check_performance_degradation()
print(message)
```

### 2. Business Metrics

Technical metrics don't tell the whole story. Track business impact:

```python
# business_metrics.py
from datetime import datetime

class BusinessMetricsMonitor:
    def __init__(self):
        self.conversions = []

    def log_prediction_outcome(self, prediction, converted, revenue=0):
        """Log business outcome of prediction"""
        self.conversions.append({
            'prediction': prediction,
            'converted': converted,
            'revenue': revenue,
            'timestamp': datetime.utcnow()
        })

    def calculate_conversion_rate(self, prediction_class=1):
        """Calculate conversion rate for predictions"""
        filtered = [
            c for c in self.conversions
            if c['prediction'] == prediction_class
        ]

        if not filtered:
            return 0

        converted = sum(1 for c in filtered if c['converted'])
        return converted / len(filtered)

    def calculate_revenue_impact(self):
        """Calculate revenue from model predictions"""
        positive_preds = [
            c for c in self.conversions
            if c['prediction'] == 1
        ]

        if not positive_preds:
            return {'total_revenue': 0, 'avg_revenue': 0}

        total_revenue = sum(c['revenue'] for c in positive_preds)
        avg_revenue = total_revenue / len(positive_preds)

        return {
            'total_revenue': total_revenue,
            'avg_revenue_per_positive_pred': avg_revenue,
            'num_positive_predictions': len(positive_preds)
        }

# Usage
business_monitor = BusinessMetricsMonitor()

# Log prediction outcome
business_monitor.log_prediction_outcome(
    prediction=1,
    converted=True,
    revenue=1500
)

# Calculate metrics
conversion_rate = business_monitor.calculate_conversion_rate(prediction_class=1)
revenue_impact = business_monitor.calculate_revenue_impact()

print(f"Conversion rate: {conversion_rate:.2%}")
print(f"Total revenue: ${revenue_impact['total_revenue']:,.2f}")
```

### 3. System Metrics

Monitor API health and infrastructure:

```python
# system_metrics.py
from prometheus_client import Counter, Histogram, Gauge
import time
import psutil

# Define metrics
prediction_requests = Counter(
    'prediction_requests_total',
    'Total prediction requests'
)
prediction_latency = Histogram(
    'prediction_latency_seconds',
    'Prediction latency',
    buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 5.0]
)
active_requests = Gauge(
    'active_prediction_requests',
    'Number of active requests'
)
model_memory_usage = Gauge(
    'model_memory_mb',
    'Model memory usage in MB'
)
prediction_errors = Counter(
    'prediction_errors_total',
    'Total prediction errors'
)

def monitor_prediction(func):
    """Decorator to monitor predictions"""
    def wrapper(*args, **kwargs):
        prediction_requests.inc()
        active_requests.inc()
        start_time = time.time()

        try:
            result = func(*args, **kwargs)
            latency = time.time() - start_time
            prediction_latency.observe(latency)
            return result
        except Exception as e:
            prediction_errors.inc()
            raise
        finally:
            active_requests.dec()

    return wrapper

@monitor_prediction
def predict(features):
    """Monitored prediction function"""
    return model.predict([features])

# Memory monitoring
def update_memory_metrics():
    """Update memory usage metrics"""
    process = psutil.Process()
    memory_mb = process.memory_info().rss / 1024 / 1024
    model_memory_usage.set(memory_mb)
```

## What to Monitor

### Critical Metrics

1. **Accuracy/F1 Score** - Is the model still performing well?
2. **Prediction latency** - Are users experiencing delays?
3. **Error rate** - Are predictions failing?
4. **Input distribution** - Has data changed?
5. **Prediction distribution** - Are outputs skewed?

### Nice-to-Have Metrics

1. **Confidence scores** - How certain is the model?
2. **Feature importance** - Which features matter most?
3. **Memory usage** - Is memory growing?
4. **Request rate** - How much traffic?
5. **Cache hit rate** - Is caching effective?

## When to Alert

Set up alerts for critical degradations:

```python
class AlertManager:
    def __init__(self):
        self.thresholds = {
            'accuracy': 0.85,
            'latency_p95': 1.0,  # seconds
            'error_rate': 0.05   # 5%
        }

    def check_alerts(self, metrics):
        """Check if any metrics exceed thresholds"""
        alerts = []

        if metrics['accuracy'] < self.thresholds['accuracy']:
            alerts.append({
                'severity': 'critical',
                'message': f"Accuracy dropped to {metrics['accuracy']:.3f}"
            })

        if metrics['latency_p95'] > self.thresholds['latency_p95']:
            alerts.append({
                'severity': 'warning',
                'message': f"High latency: {metrics['latency_p95']:.2f}s"
            })

        if metrics['error_rate'] > self.thresholds['error_rate']:
            alerts.append({
                'severity': 'critical',
                'message': f"High error rate: {metrics['error_rate']:.2%}"
            })

        return alerts
```

## Best Practices

1. **Start monitoring from day one** - Don't wait for problems
2. **Track both technical and business metrics** - Complete picture
3. **Set realistic thresholds** - Based on baseline performance
4. **Monitor input distributions** - Detect drift early
5. **Keep historical data** - Analyze trends over time
6. **Automate alerting** - Don't rely on manual checks
7. **Create dashboards** - Visualize key metrics

## Common Pitfalls

**Not collecting ground truth:**
```python
# WRONG - Only logging predictions
def predict(features):
    prediction = model.predict([features])
    log_prediction(prediction)
    return prediction

# RIGHT - Collect ground truth when available
def predict(features):
    prediction = model.predict([features])
    log_prediction(prediction)
    # Later, when outcome known:
    # log_ground_truth(actual_value)
    return prediction
```

**Monitoring too late:**
```python
# WRONG - Check metrics monthly
if datetime.now().day == 1:
    check_metrics()

# RIGHT - Monitor continuously
scheduler.add_job(check_metrics, 'interval', hours=1)
```

## Quick Reference

```python
# Log prediction
monitor.log_prediction(prediction, features)

# Log ground truth (when available)
monitor.log_ground_truth(actual_value)

# Calculate metrics
metrics = monitor.calculate_metrics(window_days=7)

# Check for degradation
degraded, message = monitor.check_performance_degradation()

# System metrics
prediction_counter.inc()
latency_histogram.observe(time_taken)
```

## Summary

Effective model monitoring tracks performance metrics (accuracy, precision), business metrics (conversion rate, revenue), and system metrics (latency, errors). Start monitoring from deployment, collect ground truth when available, set appropriate alert thresholds, and maintain historical data for trend analysis. Without monitoring, you're flying blind in production.

---

**Related Topics:**
- [Drift Detection](./drift-detection.md)
- [Logging and Observability](./logging-observability.md)
- [Monitoring Best Practices](./monitoring-best-practices.md)
- [Deployment Best Practices](./deployment-best-practices.md)
