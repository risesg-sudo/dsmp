# A/B Testing and Deployment Strategies

## What You'll Learn

Deploying new ML models requires careful strategy to minimize risk. This guide covers A/B testing, canary deployments, and blue-green deployments - three essential techniques for safely rolling out model updates. You'll learn how to gradually introduce changes while maintaining the ability to quickly rollback if issues arise.

## Why Gradual Rollouts Matter

Deploying a new model all at once is risky. What if the new model performs worse on real production data? What if it has higher latency? Gradual rollout strategies let you test changes with a small percentage of traffic before committing fully.

## A/B Testing

A/B testing routes different users to different model versions, allowing you to compare performance in real-world conditions.

**Core concept:**
- Model A (control): Current production model
- Model B (treatment): New model to test
- Split traffic: 80% to A, 20% to B
- Compare metrics: Accuracy, latency, business impact

**When to use:**
- Testing new model architecture
- Comparing different feature sets
- Evaluating business impact
- Need statistical significance

**Implementation:**

```python
# ab_testing.py
from fastapi import FastAPI
import joblib
import numpy as np
import random

app = FastAPI()

# Load two model versions
model_v1 = joblib.load('models/model_v1.pkl')
model_v2 = joblib.load('models/model_v2.pkl')

# A/B split configuration
AB_SPLIT = {
    'v1': 0.8,  # 80% traffic to v1
    'v2': 0.2   # 20% traffic to v2
}

def select_model():
    """Select model based on A/B split"""
    rand = random.random()
    if rand < AB_SPLIT['v1']:
        return model_v1, 'v1'
    else:
        return model_v2, 'v2'

@app.post("/predict_ab")
def predict_ab(features: list):
    """Prediction with A/B testing"""
    # Select model
    model, version = select_model()

    # Predict
    features_array = np.array(features).reshape(1, -1)
    prediction = int(model.predict(features_array)[0])
    probability = model.predict_proba(features_array)[0].tolist()

    return {
        'prediction': prediction,
        'probability': probability,
        'model_version': version
    }
```

**Analyzing A/B test results:**
```python
# analyze_ab_test.py
import pandas as pd
from scipy import stats

def analyze_ab_test(v1_metrics, v2_metrics):
    """Compare model versions statistically"""

    # Calculate metrics
    v1_accuracy = v1_metrics['correct'] / v1_metrics['total']
    v2_accuracy = v2_metrics['correct'] / v2_metrics['total']

    # Statistical significance test
    statistic, p_value = stats.chi2_contingency([
        [v1_metrics['correct'], v1_metrics['incorrect']],
        [v2_metrics['correct'], v2_metrics['incorrect']]
    ])[:2]

    # Business metrics
    v1_revenue = v1_metrics['revenue'] / v1_metrics['total']
    v2_revenue = v2_metrics['revenue'] / v2_metrics['total']

    print(f"Model v1: Accuracy={v1_accuracy:.3f}, Revenue=${v1_revenue:.2f}")
    print(f"Model v2: Accuracy={v2_accuracy:.3f}, Revenue=${v2_revenue:.2f}")
    print(f"p-value: {p_value:.4f}")

    if p_value < 0.05 and v2_accuracy > v1_accuracy:
        print("✓ Model v2 is significantly better - recommend rollout")
    else:
        print("✗ No significant improvement - keep v1")
```

## Canary Deployment

Gradually roll out new model by slowly increasing traffic over time. Like a canary in a coal mine, it detects problems early.

**Core concept:**
- Start: 5% traffic to new model
- Monitor closely for issues
- Increase gradually: 10% → 25% → 50% → 100%
- Rollback if problems detected

**When to use:**
- Risk-averse deployments
- Want gradual validation
- Need time to monitor metrics
- Easy rollback important

**Implementation:**

```python
# canary.py
from fastapi import FastAPI
import joblib
import numpy as np
from datetime import datetime

app = FastAPI()

model_stable = joblib.load('models/stable.pkl')
model_canary = joblib.load('models/canary.pkl')

# Canary configuration
CANARY_CONFIG = {
    'enabled': True,
    'percentage': 10,  # 10% to canary
    'start_time': datetime(2024, 1, 1),
    'ramp_up_hours': 24  # Increase 10% every hour
}

def get_canary_percentage():
    """Calculate current canary percentage"""
    if not CANARY_CONFIG['enabled']:
        return 0

    hours_since_start = (datetime.utcnow() - CANARY_CONFIG['start_time']).total_seconds() / 3600

    if hours_since_start < 0:
        return 0

    # Ramp up percentage
    ramp_hours = CANARY_CONFIG['ramp_up_hours']
    if hours_since_start >= ramp_hours:
        return 100  # Full rollout

    return min(100, int((hours_since_start / ramp_hours) * 100))

@app.post("/predict_canary")
def predict_canary(features: list):
    """Prediction with canary deployment"""
    import random

    canary_pct = get_canary_percentage()

    # Route to canary or stable
    if random.random() * 100 < canary_pct:
        model, version = model_canary, 'canary'
    else:
        model, version = model_stable, 'stable'

    # Predict
    features_array = np.array(features).reshape(1, -1)
    prediction = int(model.predict(features_array)[0])

    return {
        'prediction': prediction,
        'model_version': version,
        'canary_percentage': canary_pct
    }
```

## Blue-Green Deployment

Maintain two identical environments. Switch traffic instantly between them.

```
┌────────────────────────────────────────────────┐
│         Blue-Green Deployment                  │
├────────────────────────────────────────────────┤
│                                                │
│  Step 1: Both versions running                │
│  ┌──────────┐                                  │
│  │Load      │                                  │
│  │Balancer  │                                  │
│  └────┬─────┘                                  │
│       │                                        │
│       ├──────▶ Blue (v1) ◀── 100% traffic     │
│       │                                        │
│       └──────▶ Green (v2) ◀── 0% traffic      │
│                                                │
│  Step 2: Switch traffic                       │
│  ┌──────────┐                                  │
│  │Load      │                                  │
│  │Balancer  │                                  │
│  └────┬─────┘                                  │
│       │                                        │
│       ├──────▶ Blue (v1) ◀── 0% traffic       │
│       │                                        │
│       └──────▶ Green (v2) ◀── 100% traffic    │
│                                                │
│  • Instant rollback (switch back to blue)     │
│  • Zero downtime                               │
└────────────────────────────────────────────────┘
```

**When to use:**
- Need instant rollback capability
- Zero downtime required
- Have resources for two environments
- High-risk deployments

**Implementation with load balancer:**
```python
# blue_green.py
from fastapi import FastAPI
import joblib
import os

app = FastAPI()

# Load model based on environment variable
DEPLOYMENT_COLOR = os.getenv('DEPLOYMENT_COLOR', 'blue')

if DEPLOYMENT_COLOR == 'blue':
    model = joblib.load('models/blue_model.pkl')
elif DEPLOYMENT_COLOR == 'green':
    model = joblib.load('models/green_model.pkl')

@app.post("/predict")
def predict(features: list):
    """Prediction - model determined by deployment color"""
    prediction = model.predict([features])
    return {
        'prediction': int(prediction[0]),
        'deployment': DEPLOYMENT_COLOR
    }
```

## Strategy Comparison

| Strategy | Rollback Speed | Resource Cost | Complexity | Risk |
|----------|----------------|---------------|------------|------|
| **A/B Testing** | Medium | Low | Low | Medium |
| **Canary** | Fast | Low | Medium | Low |
| **Blue-Green** | Instant | High (2x) | Low | Very Low |

## Best Practices

1. **Monitor everything** during rollouts
   - Prediction accuracy
   - Latency (p50, p95, p99)
   - Error rates
   - Business metrics

2. **Define rollback triggers** before deployment
   - Accuracy drops > 5%
   - Latency increases > 20%
   - Error rate > 1%

3. **Start small** with canary
   - 5% → 10% → 25% → 50% → 100%
   - Wait at each stage

4. **Keep previous version** ready
   - Easy rollback crucial
   - Don't delete old models

5. **Test thoroughly** before production
   - Shadow mode first
   - Offline evaluation
   - Integration tests

## Common Pitfalls

**Not monitoring business metrics:**
```python
# WRONG - Only tracking technical metrics
monitor.track('latency', latency)
monitor.track('error_rate', errors)

# RIGHT - Track business impact too
monitor.track('latency', latency)
monitor.track('error_rate', errors)
monitor.track('conversion_rate', conversions)
monitor.track('revenue', revenue)
```

**Rolling out too fast:**
```python
# WRONG - 100% immediately
traffic_split = {'new_model': 1.0}

# RIGHT - Gradual rollout
traffic_split = {
    'hour_0': 0.05,
    'hour_6': 0.10,
    'hour_12': 0.25,
    'hour_24': 0.50,
    'hour_48': 1.00
}
```

**No rollback plan:**
```python
# WRONG - Deploy and forget
deploy_new_model()

# RIGHT - Plan for rollback
def deploy_with_rollback():
    backup_current_model()
    deploy_new_model()
    monitor_metrics()
    if metrics_degraded():
        rollback_to_backup()
```

## Quick Reference

```python
# A/B Testing
model = random.choice([model_v1, model_v2], p=[0.8, 0.2])

# Canary
percentage = calculate_canary_percentage()
model = model_canary if random.random() < percentage else model_stable

# Blue-Green
# Switch via load balancer configuration
```

## Summary

Safe model deployment requires careful strategy. A/B testing validates improvements through statistical comparison. Canary deployments gradually increase traffic while monitoring for issues. Blue-green deployments enable instant rollback with zero downtime. Choose your strategy based on risk tolerance, resource availability, and rollback requirements. Always monitor closely during rollouts and have a clear rollback plan ready.

---

**Related Topics:**
- [Model Serving Strategies](./model-serving-strategies.md)
- [Deployment Best Practices](./deployment-best-practices.md)
- [Model Monitoring Basics](./model-monitoring-basics.md)
