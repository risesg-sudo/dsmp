# Deployment Interview Questions

## What You'll Learn

This guide covers common interview questions about ML model deployment. Understanding these questions and answers will help you explain deployment concepts clearly, compare different approaches, and demonstrate your production ML experience.

## Q1: Compare Flask and FastAPI for ML deployment

**Answer:**

Flask and FastAPI are both popular Python web frameworks for deploying ML models, but they have distinct characteristics.

### Performance Comparison

| Aspect | Flask | FastAPI |
|--------|-------|---------|
| **Performance** | ~10k req/s | ~25k req/s (async) |
| **Validation** | Manual | Automatic (Pydantic) |
| **Documentation** | Manual | Auto (Swagger/ReDoc) |
| **Learning curve** | Easy | Moderate |
| **Async support** | Limited | Native |
| **Type hints** | Optional | Required |
| **Use case** | Simple APIs, prototypes | Production, high performance |

### When to use Flask

**Choose Flask when:**
- Building quick prototypes
- Team already familiar with Flask
- Simple synchronous workloads
- Extensive plugin ecosystem needed
- Legacy system integration

**Example:**
```python
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    features = data['features']
    # Manual validation needed
    if not isinstance(features, list):
        return {'error': 'Invalid input'}, 400
    prediction = model.predict([features])
    return {'prediction': int(prediction[0])}
```

### When to use FastAPI

**Choose FastAPI when:**
- Building production systems
- High performance required
- Want automatic validation
- Need auto-generated documentation
- Async operations needed

**Example:**
```python
class PredictionRequest(BaseModel):
    features: List[float]  # Auto-validated by Pydantic

@app.post("/predict")
def predict(request: PredictionRequest):
    prediction = model.predict([request.features])
    return {'prediction': int(prediction[0])}
```

### Key Differences

1. **Validation**: FastAPI validates automatically using type hints, Flask requires manual checks
2. **Documentation**: FastAPI generates interactive docs (Swagger UI), Flask needs manual documentation
3. **Performance**: FastAPI is 2-3x faster due to async support and optimizations
4. **Developer Experience**: FastAPI catches errors at development time with type checking

---

## Q2: Explain batch vs real-time inference

**Answer:**

Batch and real-time inference serve different use cases with distinct trade-offs.

### Batch Inference

**Characteristics:**
```
Process large datasets offline
Input: CSV with 1M rows
Output: CSV with predictions
Time: Hours to days
```

**When to use batch:**
- Daily recommendation updates
- Monthly credit score calculations
- Quarterly forecasts
- Data not time-sensitive
- Large dataset processing

**Implementation:**
```python
def batch_predict(input_csv, output_csv):
    df = pd.read_csv(input_csv)
    predictions = model.predict(df[features])
    df['prediction'] = predictions
    df.to_csv(output_csv)
```

### Real-time Inference

**Characteristics:**
```
Process single requests online
Input: Single JSON request
Output: Immediate response
Time: Milliseconds
```

**When to use real-time:**
- Credit approval during application
- Search result ranking
- Chatbot responses
- Dynamic pricing
- Fraud detection

**Implementation:**
```python
@app.post("/predict")
def predict(features: list):
    prediction = model.predict([features])
    return {'prediction': int(prediction[0])}
```

### Comparison

| Aspect | Batch | Real-time |
|--------|-------|-----------|
| **Latency** | Hours-days | Milliseconds |
| **Throughput** | Very High | Low-medium |
| **Cost** | Low | Higher |
| **Complexity** | Simple | Complex |
| **Infrastructure** | Cron/Airflow | API server |

### Hybrid Approach

Often the best solution combines both:

```python
@app.post("/predict")
def predict(user_id: int):
    # Check pre-computed batch predictions
    cached = db.get_prediction(user_id)
    if cached and not_expired(cached):
        return cached

    # Fall back to real-time if not cached
    features = get_user_features(user_id)
    prediction = model.predict([features])

    # Cache for future requests
    db.store_prediction(user_id, prediction)

    return {'prediction': int(prediction[0])}
```

---

## Q3: How do you handle model versioning in production?

**Answer:**

Model versioning is critical for safe deployments, A/B testing, and rollbacks.

### Strategy 1: URL-based Versioning

Route different versions to different endpoints:

```python
# Load multiple versions
model_v1 = joblib.load('models/v1.pkl')
model_v2 = joblib.load('models/v2.pkl')

@app.post("/predict/v1")
def predict_v1(features: list):
    return model_v1.predict([features])

@app.post("/predict/v2")
def predict_v2(features: list):
    return model_v2.predict([features])
```

**Pros:** Simple, explicit
**Cons:** Requires client changes

### Strategy 2: Header-based Routing

Use request headers to specify version:

```python
@app.post("/predict")
def predict(request: Request, features: list):
    version = request.headers.get('X-Model-Version', 'v1')

    if version == 'v1':
        model = model_v1
    elif version == 'v2':
        model = model_v2
    else:
        raise HTTPException(400, "Invalid version")

    prediction = model.predict([features])
    return {'prediction': int(prediction[0]), 'version': version}
```

**Pros:** Same endpoint, flexible
**Cons:** Requires header support

### Strategy 3: A/B Testing

Randomly route traffic:

```python
import random

def get_model():
    if random.random() < 0.8:
        return model_v1, 'v1'
    return model_v2, 'v2'

@app.post("/predict")
def predict(features: list):
    model, version = get_model()
    prediction = model.predict([features])
    return {'prediction': int(prediction[0]), 'version': version}
```

**Pros:** Automatic testing
**Cons:** Non-deterministic

### Strategy 4: Canary Deployment

Gradually increase traffic to new version:

```python
def get_canary_percentage():
    """Increase from 0% to 100% over 24 hours"""
    hours_since_start = (datetime.utcnow() - START_TIME).hours
    return min(100, hours_since_start * 4)  # 4% per hour

@app.post("/predict")
def predict(features: list):
    percentage = get_canary_percentage()

    if random.random() * 100 < percentage:
        model = model_v2
    else:
        model = model_v1

    return model.predict([features])
```

**Pros:** Gradual, safe
**Cons:** More complex

### Best Practices

1. **Log version with predictions** for analysis
2. **Monitor metrics per version** separately
3. **Keep previous versions** for rollback
4. **Use feature flags** for easy toggling
5. **Shadow mode** before full deployment

---

## Q4: How do you optimize API latency?

**Answer:**

API latency directly impacts user experience. Multiple optimization techniques exist at different levels.

### 1. Model Optimization

**Quantization:**
Reduce model precision (float32 → float16 or int8):

```python
import tensorflow as tf

converter = tf.lite.TFLiteConverter.from_saved_model('model')
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()
```

**Pruning:**
Remove unnecessary weights:

```python
import tensorflow_model_optimization as tfmot

pruning_params = {
    'pruning_schedule': tfmot.sparsity.keras.PolynomialDecay(
        initial_sparsity=0.0,
        final_sparsity=0.5,
        begin_step=0,
        end_step=1000
    )
}
model = tfmot.sparsity.keras.prune_low_magnitude(model, **pruning_params)
```

**Knowledge Distillation:**
Train smaller model to mimic larger one.

### 2. Caching

Cache frequent predictions:

```python
import redis

redis_client = redis.Redis()

@app.post("/predict")
def predict(features: list):
    cache_key = hash(tuple(features))

    # Check cache
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    # Predict
    prediction = model.predict([features])
    result = {'prediction': int(prediction[0])}

    # Cache for 1 hour
    redis_client.setex(cache_key, 3600, json.dumps(result))

    return result
```

### 3. Batch Predictions

Process multiple requests together:

```python
import asyncio
from collections import defaultdict

pending_requests = defaultdict(list)

async def batch_predict():
    """Collect requests and batch predict"""
    while True:
        await asyncio.sleep(0.1)  # Wait 100ms

        if pending_requests:
            all_features = list(pending_requests.values())

            # Batch predict
            predictions = model.predict(all_features)

            # Return results
            for (req_id, features), pred in zip(pending_requests.items(), predictions):
                results[req_id] = pred

            pending_requests.clear()
```

### 4. Use Faster Frameworks

- **ONNX Runtime**: Cross-platform optimization
- **TensorRT**: GPU optimization
- **TensorFlow Serving**: Production-ready serving
- **TorchServe**: PyTorch serving

### 5. Infrastructure Optimization

- **Load balancing**: Distribute across instances
- **Horizontal scaling**: Add more servers
- **GPU acceleration**: For deep learning models
- **CDN for models**: Fast model loading

### Target Latencies

- **Real-time interactive**: < 100ms
- **User-facing**: < 500ms
- **Background tasks**: < 5 seconds
- **Batch**: Minutes to hours

---

## Q5: How do you monitor ML models in production?

**Answer:**

Production monitoring requires tracking multiple dimensions to ensure model health.

### 1. Performance Metrics

Track model accuracy over time:

```python
from sklearn.metrics import accuracy_score

class PerformanceMonitor:
    def __init__(self):
        self.predictions = []
        self.ground_truth = []

    def log_prediction(self, prediction):
        self.predictions.append(prediction)

    def log_ground_truth(self, truth):
        self.ground_truth.append(truth)

    def calculate_accuracy(self):
        if len(self.ground_truth) >= 100:
            return accuracy_score(
                self.ground_truth,
                self.predictions[:len(self.ground_truth)]
            )
        return None
```

### 2. System Metrics

Monitor API health:

```python
from prometheus_client import Counter, Histogram, Gauge

# Define metrics
predictions_total = Counter('predictions_total', 'Total predictions')
prediction_latency = Histogram('prediction_latency_seconds', 'Prediction latency')
prediction_confidence = Gauge('prediction_confidence', 'Average confidence')
prediction_distribution = Counter('prediction_distribution', 'Distribution', ['class'])

@app.post("/predict")
def predict(features: list):
    start = time.time()

    # Predict
    prediction = model.predict([features])[0]
    probability = model.predict_proba([features])[0]

    # Update metrics
    predictions_total.inc()
    prediction_latency.observe(time.time() - start)
    prediction_confidence.set(max(probability))
    prediction_distribution.labels(class_=str(prediction)).inc()

    return {'prediction': int(prediction)}
```

### 3. Data Quality

Monitor input distribution for drift:

```python
def monitor_input_distribution(features):
    """Check if input distribution has changed"""
    for i, value in enumerate(features):
        # Check against training distribution
        if value < FEATURE_MINS[i] or value > FEATURE_MAXS[i]:
            logger.warning(f"Feature {i} out of range: {value}")
```

### 4. Business Metrics

Track business impact:

```python
class BusinessMetricsMonitor:
    def log_outcome(self, prediction, converted, revenue):
        db.insert({
            'prediction': prediction,
            'converted': converted,
            'revenue': revenue,
            'timestamp': datetime.utcnow()
        })

    def calculate_conversion_rate(self):
        results = db.query("""
            SELECT prediction, AVG(converted) as conversion_rate
            FROM predictions
            WHERE timestamp > NOW() - INTERVAL '24 hours'
            GROUP BY prediction
        """)
        return results
```

### Monitoring Tools

- **Prometheus + Grafana**: Metrics and dashboards
- **ELK Stack**: Centralized logging
- **DataDog/New Relic**: APM and monitoring
- **MLflow**: ML experiment tracking
- **WhyLabs/Fiddler**: Specialized ML monitoring

### Alert Configuration

```yaml
# Prometheus alerting rules
groups:
  - name: ml_model_alerts
    rules:
      - alert: HighLatency
        expr: prediction_latency_seconds > 1.0
        for: 5m

      - alert: LowAccuracy
        expr: model_accuracy < 0.85
        for: 1h

      - alert: HighErrorRate
        expr: rate(prediction_errors_total[5m]) > 0.05
```

---

## Quick Reference

```python
# Flask vs FastAPI
flask_api = "Manual validation, mature ecosystem"
fastapi_api = "Auto validation, high performance"

# Batch vs Real-time
batch = "High throughput, low cost, high latency"
realtime = "Low latency, medium throughput, higher cost"

# Model versioning
version_header = request.headers.get('X-Model-Version')

# Latency optimization
cached_result = cache.get(key)
if not cached_result:
    result = model.predict(features)
    cache.set(key, result)

# Monitoring
counter.inc()
histogram.observe(latency)
gauge.set(accuracy)
```

## Summary

Understanding deployment concepts is crucial for ML engineering interviews. Be prepared to compare frameworks like Flask and FastAPI, explain trade-offs between batch and real-time inference, describe model versioning strategies, discuss latency optimization techniques, and outline comprehensive monitoring approaches. Practical examples and clear explanations of trade-offs demonstrate deep understanding of production ML systems.

---

**Related Topics:**
- [Flask ML APIs](./flask-ml-apis.md)
- [FastAPI ML APIs](./fastapi-ml-apis.md)
- [Model Serving Strategies](./model-serving-strategies.md)
- [A/B Testing and Deployments](./ab-testing-deployments.md)
- [Deployment Best Practices](./deployment-best-practices.md)
