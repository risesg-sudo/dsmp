# Monitoring Best Practices and Common Pitfalls

## What You'll Learn

Effective monitoring requires strategy, not just tools. This guide covers comprehensive monitoring approaches, alerting rules, retraining strategies, and common mistakes to avoid. You'll learn to build monitoring systems that catch problems early and trigger appropriate responses.

## Comprehensive Monitoring Strategy

Monitor multiple dimensions to get a complete picture of model health:

```python
# monitoring_strategy.py
class MLMonitoringStrategy:
    """Comprehensive monitoring strategy for ML systems"""

    def __init__(self):
        self.metrics = {
            'performance': [],
            'data_drift': [],
            'predictions': [],
            'system': []
        }

    def monitor_all(self, features, prediction, ground_truth=None):
        """Monitor all aspects of a prediction"""

        # 1. Log prediction with timestamp
        self.log_prediction(prediction, features)

        # 2. Check data drift
        drift_detected = self.check_data_drift(features)
        if drift_detected:
            self.alert("Data drift detected")

        # 3. Monitor system metrics
        self.monitor_system_metrics()

        # 4. Update performance metrics (when ground truth available)
        if ground_truth is not None:
            self.update_performance_metrics(prediction, ground_truth)

        # 5. Check prediction distribution
        self.check_prediction_distribution(prediction)

        # 6. Generate alerts if needed
        self.generate_alerts()

    def log_prediction(self, prediction, features):
        """Log prediction to database/time series"""
        import datetime
        self.metrics['predictions'].append({
            'timestamp': datetime.datetime.utcnow(),
            'prediction': prediction,
            'features': features
        })

    def check_data_drift(self, features):
        """Check if input data has drifted"""
        # Compare against baseline distribution
        # Use KS test, PSI, etc.
        return False  # Implement actual drift detection

    def monitor_system_metrics(self):
        """Monitor CPU, memory, latency"""
        import psutil
        self.metrics['system'].append({
            'cpu_percent': psutil.cpu_percent(),
            'memory_percent': psutil.virtual_memory().percent
        })

    def update_performance_metrics(self, prediction, ground_truth):
        """Update accuracy, precision, recall"""
        self.metrics['performance'].append({
            'prediction': prediction,
            'ground_truth': ground_truth
        })

    def check_prediction_distribution(self, prediction):
        """Check if prediction distribution has changed"""
        # Compare recent predictions to baseline
        pass

    def generate_alerts(self):
        """Generate alerts based on thresholds"""
        # Check all metrics and alert if thresholds exceeded
        pass
```

## Alerting Rules

Define clear rules for when to alert:

```yaml
# alerting_rules.yml
groups:
  - name: ml_model_alerts
    interval: 1m
    rules:
      # Performance alerts
      - alert: HighLatency
        expr: prediction_latency_seconds > 1.0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High prediction latency detected"
          description: "P95 latency above 1 second for 5 minutes"

      - alert: ModelDriftDetected
        expr: data_drift_score > 0.2
        for: 1h
        labels:
          severity: critical
        annotations:
          summary: "Model drift detected - retraining needed"
          description: "PSI > 0.2 for 1 hour"

      - alert: LowAccuracy
        expr: model_accuracy < 0.8
        for: 1d
        labels:
          severity: critical
        annotations:
          summary: "Model accuracy dropped below threshold"
          description: "Accuracy < 0.80 for 24 hours"

      - alert: HighErrorRate
        expr: rate(prediction_errors_total[5m]) > 0.05
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Prediction error rate above 5%"
          description: "Error rate > 5% for 10 minutes"

      # System alerts
      - alert: HighMemoryUsage
        expr: model_memory_mb > 4096
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Model using excessive memory"
          description: "Memory usage > 4GB"

      # Business metrics alerts
      - alert: LowConversionRate
        expr: conversion_rate < 0.10
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "Conversion rate below target"
          description: "Conversion rate < 10% for 1 hour"
```

## Retraining Strategy

Decide when to trigger model retraining:

```python
# retraining_strategy.py
from datetime import datetime, timedelta

class RetrainingStrategy:
    """Determine when to retrain model"""

    def __init__(self):
        self.thresholds = {
            'accuracy_drop': 0.05,      # 5% accuracy drop
            'drift_score': 0.2,         # Significant drift (PSI)
            'days_since_training': 30,  # Monthly retraining
            'new_samples': 10000,       # Sufficient new data
            'error_rate': 0.05          # 5% error rate
        }

    def should_retrain(self, metrics):
        """
        Decide if retraining is needed

        Args:
            metrics: Dict with current metrics

        Returns:
            should_retrain: bool
            reason: str
            priority: str (low, medium, high)
        """
        reasons = []

        # Condition 1: Performance degradation (HIGH PRIORITY)
        if metrics.get('accuracy', 1.0) < metrics.get('baseline_accuracy', 0.9) - self.thresholds['accuracy_drop']:
            return True, "Performance degraded below threshold", "high"

        # Condition 2: Significant drift (HIGH PRIORITY)
        if metrics.get('drift_score', 0) > self.thresholds['drift_score']:
            return True, "Significant data drift detected", "high"

        # Condition 3: High error rate (MEDIUM PRIORITY)
        if metrics.get('error_rate', 0) > self.thresholds['error_rate']:
            return True, "High prediction error rate", "medium"

        # Condition 4: Scheduled retraining (LOW PRIORITY)
        days_since = metrics.get('days_since_training', 0)
        if days_since > self.thresholds['days_since_training']:
            return True, "Scheduled retraining due", "low"

        # Condition 5: Sufficient new data (LOW PRIORITY)
        if metrics.get('new_samples', 0) > self.thresholds['new_samples']:
            return True, "Sufficient new data available", "low"

        return False, "No retraining needed", None

    def get_retraining_schedule(self, priority):
        """Get retraining schedule based on priority"""
        schedules = {
            'high': 'immediate',        # Within 1 hour
            'medium': 'within_24h',     # Within 24 hours
            'low': 'next_scheduled'     # Next scheduled run
        }
        return schedules.get(priority, 'next_scheduled')

# Usage
strategy = RetrainingStrategy()
metrics = {
    'accuracy': 0.82,
    'baseline_accuracy': 0.90,
    'drift_score': 0.15,
    'error_rate': 0.02,
    'days_since_training': 15,
    'new_samples': 5000
}

should_retrain, reason, priority = strategy.should_retrain(metrics)
if should_retrain:
    schedule = strategy.get_retraining_schedule(priority)
    print(f"Retraining needed: {reason}")
    print(f"Priority: {priority}")
    print(f"Schedule: {schedule}")
```

## Monitoring Dashboard Design

Create effective dashboards that show key metrics at a glance:

```
┌─────────────────────────────────────────────┐
│         ML Model Dashboard                  │
├─────────────────────────────────────────────┤
│                                             │
│  API Health                                 │
│  ├─ Request Rate: 1,234 req/sec           │
│  ├─ Latency P50: 45ms                     │
│  ├─ Latency P95: 125ms                    │
│  └─ Error Rate: 0.2%                      │
│                                             │
│  Model Performance (24h)                    │
│  ├─ Accuracy: 0.89 ⚠ (baseline: 0.92)     │
│  ├─ Precision: 0.87                        │
│  ├─ Recall: 0.91                          │
│  └─ F1 Score: 0.89                        │
│                                             │
│  Data Quality                               │
│  ├─ Missing Values: 0.5%                  │
│  ├─ Drift Score (PSI): 0.15               │
│  └─ Outliers: 2.3%                        │
│                                             │
│  Prediction Distribution                    │
│  ├─ Class 0: 78% (baseline: 80%)          │
│  └─ Class 1: 22% (baseline: 20%)          │
│                                             │
│  Business Impact                            │
│  ├─ Conversion Rate: 12%                   │
│  ├─ Revenue (24h): $45,232                 │
│  └─ False Positive Cost: $1,234           │
│                                             │
│  System Resources                           │
│  ├─ CPU: 65%                               │
│  ├─ Memory: 72%                            │
│  ├─ GPU: 88%                               │
│  └─ Disk I/O: 45%                         │
│                                             │
│  [Last Updated: 2024-01-15 10:30:45 UTC]  │
└─────────────────────────────────────────────┘
```

## Best Practices

### 1. Start Simple, Add Complexity

```python
# Phase 1: Basic monitoring
- Log predictions
- Track error rate
- Monitor latency

# Phase 2: Add performance monitoring
- Collect ground truth
- Calculate accuracy
- Track trends

# Phase 3: Add drift detection
- Monitor input distributions
- Check prediction distributions
- Alert on significant drift

# Phase 4: Advanced monitoring
- Business metrics
- A/B test results
- Feature importance changes
```

### 2. Set Realistic Thresholds

```python
# WRONG - Too strict
if accuracy < 0.95:  # Unrealistic
    alert()

# RIGHT - Based on baseline
baseline_accuracy = 0.88
threshold = 0.05  # Allow 5% drop
if accuracy < baseline_accuracy - threshold:
    alert()
```

### 3. Monitor Trends, Not Just Point Values

```python
# WRONG - Single point check
if accuracy < 0.85:
    alert()

# RIGHT - Check trend
recent_accuracy = calculate_moving_average(window=7)
if recent_accuracy < 0.85 and is_declining():
    alert()
```

### 4. Collect Feedback Loops

```python
class FeedbackCollector:
    """Collect user feedback on predictions"""

    def log_user_feedback(self, prediction_id, feedback):
        """Log user feedback (thumbs up/down, corrections)"""
        db.insert({
            'prediction_id': prediction_id,
            'feedback': feedback,
            'timestamp': datetime.utcnow()
        })

    def analyze_feedback(self):
        """Analyze feedback to improve model"""
        feedback_data = db.query("""
            SELECT prediction, actual, feedback
            FROM predictions
            WHERE feedback IS NOT NULL
        """)

        # Use feedback for retraining
        # Identify problematic patterns
```

## Common Pitfalls

### 1. Not Monitoring in Production

```python
# WRONG - No monitoring
@app.post("/predict")
def predict(features: list):
    prediction = model.predict([features])
    return {'prediction': int(prediction[0])}

# RIGHT - Comprehensive monitoring
@app.post("/predict")
def predict(features: list):
    start_time = time.time()

    # Monitor input
    monitor_input_distribution(features)

    # Predict
    prediction = model.predict([features])[0]

    # Monitor prediction
    monitor_prediction(prediction)

    # Monitor latency
    latency = time.time() - start_time
    monitor_latency(latency)

    # Log for drift detection
    log_for_drift_detection(features, prediction)

    return {'prediction': int(prediction)}
```

### 2. Ignoring Data Drift

```python
# WRONG - Only checking accuracy
if accuracy < threshold:
    retrain()

# RIGHT - Check drift too
if accuracy < threshold or drift_detected:
    retrain()
```

### 3. No Rollback Plan

```python
# WRONG - Deploy and forget
deploy_new_model()

# RIGHT - Keep previous version
def deploy_with_rollback():
    # Backup current model
    backup_model('models/current.pkl', 'models/previous.pkl')

    # Deploy new model
    deploy_model('models/new.pkl', 'models/current.pkl')

    # Monitor closely
    if metrics_degraded(hours=24):
        rollback_to_previous()
```

### 4. Alert Fatigue

```python
# WRONG - Too many alerts
if latency > 100ms:  # Too sensitive
    alert()

# RIGHT - Meaningful alerts
if latency > 1000ms for 5 minutes:  # Clear threshold + duration
    alert()
```

## Quick Reference

```python
# Monitor prediction
monitor.log_prediction(prediction, features)

# Check drift
drift = detector.detect_drift(prod_data)

# Check performance
metrics = monitor.calculate_metrics(window_days=7)

# Decide retraining
should_retrain = strategy.should_retrain(metrics)

# Alert
if should_retrain:
    send_alert(reason, priority)
```

## Summary

Effective monitoring requires a comprehensive strategy covering performance metrics, data drift, system health, and business impact. Set realistic alert thresholds based on baselines, monitor trends not just point values, and implement clear retraining triggers. Avoid common pitfalls like alert fatigue, ignoring drift, and deploying without rollback plans. Good monitoring catches problems early and enables data-driven decisions about model updates.

---

**Related Topics:**
- [Model Monitoring Basics](./model-monitoring-basics.md)
- [Drift Detection](./drift-detection.md)
- [Logging and Observability](./logging-observability.md)
- [Airflow for ML Basics](./airflow-ml-basics.md)
