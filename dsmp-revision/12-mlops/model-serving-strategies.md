# Model Serving Strategies

## What You'll Learn

Different applications require different serving strategies. This guide explores synchronous, asynchronous, batch, and ensemble serving approaches. You'll learn when to use each strategy and how to implement them effectively for production ML systems.

## Serving Strategy Overview

The way you serve predictions impacts your system's scalability, responsiveness, and resource utilization. Understanding these patterns helps you design systems that meet your performance requirements while managing costs.

## Synchronous Serving

The simplest approach: request comes in, prediction happens, response goes out.

```
┌────────────────────────────────────────┐
│     Synchronous Serving                │
├────────────────────────────────────────┤
│                                        │
│  Client ──Request──▶ API ──▶ Model    │
│         ◀─Response── API ◀── Result   │
│                                        │
│  • Simple                              │
│  • Suitable for low latency           │
│  • Blocks until prediction complete   │
└────────────────────────────────────────┘
```

**When to use:**
- Low-latency requirements (< 100ms)
- Simple request-response patterns
- Stateless predictions
- Interactive applications

**Implementation example:**
```python
from fastapi import FastAPI
import joblib

app = FastAPI()
model = joblib.load('models/model.pkl')

@app.post("/predict")
def predict(features: list):
    """Synchronous prediction"""
    prediction = model.predict([features])
    return {'prediction': int(prediction[0])}
```

## Asynchronous Serving

Non-blocking approach for long-running predictions or high-volume requests.

```
┌────────────────────────────────────────┐
│     Asynchronous Serving               │
├────────────────────────────────────────┤
│                                        │
│  Client ──Request──▶ API               │
│         ◀─RequestID─ API               │
│         (returns immediately)          │
│                      │                 │
│                      ▼                 │
│                   Queue ──▶ Worker     │
│                      │       │         │
│  Client ─PollStatus─▶│       │         │
│         ◀─Result────────────┘         │
│                                        │
│  • Non-blocking                        │
│  • Handles long predictions           │
│  • Scalable                            │
└────────────────────────────────────────┘
```

**When to use:**
- Long-running predictions (> 1 second)
- High-volume batch processing
- Resource-intensive models
- Need to decouple request from processing

**Implementation with Celery:**

```python
# tasks.py
from celery import Celery
import joblib
import numpy as np

app = Celery('ml_tasks', broker='redis://localhost:6379/0')

model = joblib.load('models/model.pkl')

@app.task
def predict_async(features):
    """Async prediction task"""
    features_array = np.array(features).reshape(1, -1)
    prediction = int(model.predict(features_array)[0])
    probability = model.predict_proba(features_array)[0].tolist()

    return {
        'prediction': prediction,
        'probability': probability
    }
```

```python
# main.py
from fastapi import FastAPI
from tasks import predict_async

app = FastAPI()

@app.post("/predict_async")
def predict_async_endpoint(features: list):
    """Submit async prediction"""
    task = predict_async.delay(features)

    return {
        "task_id": task.id,
        "status": "processing"
    }

@app.get("/predict_status/{task_id}")
def get_task_status(task_id: str):
    """Check task status"""
    task = predict_async.AsyncResult(task_id)

    if task.ready():
        return {
            "task_id": task_id,
            "status": "completed",
            "result": task.result
        }
    else:
        return {
            "task_id": task_id,
            "status": "processing"
        }
```

## Batch Serving

Process many predictions together for better throughput and resource efficiency.

**When to use:**
- Large number of predictions needed
- Not time-sensitive (can wait hours)
- Cost optimization important
- Regular scheduled jobs

**Implementation:**

```python
# batch_inference.py
import pandas as pd
import joblib
from datetime import datetime

def batch_predict(input_csv, output_csv):
    """Batch inference from CSV"""
    # Load data
    df = pd.read_csv(input_csv)

    # Load model
    model = joblib.load('models/model.pkl')

    # Extract features
    feature_cols = ['age', 'income', 'credit_score', 'loan_amount']
    X = df[feature_cols]

    # Predict
    predictions = model.predict(X)
    probabilities = model.predict_proba(X)[:, 1]

    # Add predictions to dataframe
    df['prediction'] = predictions
    df['probability'] = probabilities
    df['prediction_time'] = datetime.utcnow()

    # Save results
    df.to_csv(output_csv, index=False)

    print(f"Processed {len(df)} rows")
    print(f"Results saved to {output_csv}")

if __name__ == '__main__':
    batch_predict('data/input.csv', 'data/output.csv')
```

## Model Ensemble

Combine multiple models for better predictions and robustness.

**When to use:**
- Need higher accuracy
- Want to reduce variance
- Combining different model types
- A/B testing multiple models

**Implementation:**

```python
# ensemble.py
from fastapi import FastAPI
import joblib
import numpy as np

app = FastAPI()

# Load multiple models
model1 = joblib.load('models/model_rf.pkl')
model2 = joblib.load('models/model_xgb.pkl')
model3 = joblib.load('models/model_lgb.pkl')

@app.post("/predict_ensemble")
def predict_ensemble(features: list):
    """Ensemble prediction (voting)"""
    features_array = np.array(features).reshape(1, -1)

    # Get predictions from all models
    pred1 = model1.predict(features_array)[0]
    pred2 = model2.predict(features_array)[0]
    pred3 = model3.predict(features_array)[0]

    # Voting
    predictions = [pred1, pred2, pred3]
    final_prediction = max(set(predictions), key=predictions.count)

    # Get probabilities
    prob1 = model1.predict_proba(features_array)[0]
    prob2 = model2.predict_proba(features_array)[0]
    prob3 = model3.predict_proba(features_array)[0]

    # Average probabilities
    avg_probability = (prob1 + prob2 + prob3) / 3

    return {
        'prediction': int(final_prediction),
        'probability': avg_probability.tolist(),
        'individual_predictions': {
            'random_forest': int(pred1),
            'xgboost': int(pred2),
            'lightgbm': int(pred3)
        }
    }
```

## Strategy Comparison

| Strategy | Latency | Throughput | Complexity | Cost | Use Case |
|----------|---------|------------|------------|------|----------|
| **Synchronous** | Low | Medium | Low | $$ | Interactive apps |
| **Asynchronous** | High | High | High | $ | Long predictions |
| **Batch** | Very High | Very High | Low | $ | Scheduled jobs |
| **Ensemble** | Medium | Low | Medium | $$$ | High accuracy needs |

## Choosing Your Strategy

**Ask yourself:**

1. **What's your latency requirement?**
   - < 100ms: Synchronous
   - > 1s: Asynchronous
   - Hours: Batch

2. **What's your volume?**
   - Low: Synchronous
   - High: Asynchronous or Batch
   - Very High: Batch

3. **Can users wait?**
   - No: Synchronous
   - Yes: Asynchronous
   - Yes, hours: Batch

4. **Do you need highest accuracy?**
   - Yes: Ensemble
   - No: Single model

## Best Practices

1. **Start simple** - Begin with synchronous, add complexity as needed
2. **Monitor latency** - Know your p95 and p99 latencies
3. **Cache frequently requested predictions** - Reduce compute costs
4. **Use batch processing when possible** - Most cost-effective
5. **Consider hybrid approaches** - Sync for urgent, batch for rest
6. **Test under load** - Ensure your strategy scales

## Common Pitfalls

**Using synchronous for long-running tasks:**
```python
# WRONG - Blocks for minutes
@app.post("/predict")
def predict(features: list):
    result = very_slow_model.predict([features])  # Takes 2 minutes!
    return result

# RIGHT - Use async
@app.post("/predict_async")
def predict(features: list):
    task = predict_task.delay(features)
    return {"task_id": task.id}
```

**Not batching when you should:**
```python
# WRONG - One request per prediction
for features in large_dataset:
    requests.post('/predict', json={'features': features})

# RIGHT - Batch predictions
requests.post('/batch_predict', json={'features': large_dataset})
```

## Quick Reference

```python
# Synchronous
prediction = model.predict([features])

# Asynchronous (Celery)
task = predict_task.delay(features)
result = task.get()

# Batch
predictions = model.predict(features_array)

# Ensemble
prediction = majority_vote([model1.predict(x), model2.predict(x), model3.predict(x)])
```

## Summary

Choosing the right serving strategy is crucial for building efficient ML systems. Synchronous serving works for most interactive applications with low-latency requirements. Asynchronous serving handles long-running predictions and high volumes. Batch serving optimizes costs for large-scale, non-urgent predictions. Ensemble serving maximizes accuracy at the cost of increased latency and compute. Most production systems use a combination of these strategies based on their specific use cases.

---

**Related Topics:**
- [A/B Testing and Deployments](./ab-testing-deployments.md)
- [Deployment Best Practices](./deployment-best-practices.md)
- [Flask ML APIs](./flask-ml-apis.md)
- [FastAPI ML APIs](./fastapi-ml-apis.md)
