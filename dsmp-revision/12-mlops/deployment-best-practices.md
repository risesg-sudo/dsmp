# Deployment Best Practices and Common Pitfalls

## What You'll Learn

Building production ML APIs requires more than just wrapping a model in an endpoint. This guide covers essential best practices for model loading, input validation, error handling, logging, and monitoring. You'll learn to avoid common mistakes that lead to poor performance, crashes, and difficult-to-debug issues.

## Model Loading Best Practices

### Load Model Once at Startup

The most critical rule: never load your model on every request.

```python
# ✅ GOOD: Load model once at startup
from fastapi import FastAPI
import joblib

app = FastAPI()

# Model loaded once when server starts
model = joblib.load('models/model.pkl')

@app.post("/predict")
def predict(features: list):
    # Use pre-loaded model
    prediction = model.predict([features])
    return {'prediction': int(prediction[0])}
```

```python
# ❌ BAD: Load model on every request
@app.post("/predict")
def predict(features: list):
    # This loads the model EVERY TIME - extremely slow!
    model = joblib.load('models/model.pkl')
    prediction = model.predict([features])
    return {'prediction': int(prediction[0])}
```

**Why this matters:**
- Loading can take 100ms to several seconds
- Adds massive latency to every request
- Wastes memory with repeated loads
- Makes API unusable at scale

### Handle Large Model Loading

For models that take time to load, handle startup properly:

```python
from fastapi import FastAPI, HTTPException
import joblib

app = FastAPI()
model = None

@app.on_event("startup")
async def load_model():
    """Load model asynchronously on startup"""
    global model
    model = joblib.load('models/large_model.pkl')
    print("Model loaded successfully")

@app.post("/predict")
def predict(features: list):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not ready. Please try again."
        )

    prediction = model.predict([features])
    return {'prediction': int(prediction[0])}
```

## Input Validation

Never trust user input. Always validate before making predictions.

### Basic Validation

```python
from fastapi import FastAPI, HTTPException

@app.post("/predict")
def predict(features: list):
    # Validate input exists
    if not features:
        raise HTTPException(
            status_code=400,
            detail="Features cannot be empty"
        )

    # Validate length
    if len(features) != 4:
        raise HTTPException(
            status_code=400,
            detail=f"Expected 4 features, got {len(features)}"
        )

    # Validate types
    try:
        features = [float(f) for f in features]
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="All features must be numeric"
        )

    prediction = model.predict([features])
    return {'prediction': int(prediction[0])}
```

### Advanced Validation with Pydantic

FastAPI + Pydantic provides automatic validation:

```python
from pydantic import BaseModel, Field, validator

class Features(BaseModel):
    age: int = Field(..., ge=18, le=100, description="Customer age")
    income: float = Field(..., gt=0, le=1000000, description="Annual income")
    credit_score: int = Field(..., ge=300, le=850, description="Credit score")
    loan_amount: float = Field(..., gt=0, le=100000, description="Loan amount")

    @validator('age')
    def validate_age(cls, v):
        if v < 18:
            raise ValueError('Age must be at least 18')
        return v

    @validator('credit_score')
    def validate_credit_score(cls, v):
        if v < 300 or v > 850:
            raise ValueError('Credit score must be between 300 and 850')
        return v

@app.post("/predict")
def predict(features: Features):
    # Pydantic automatically validates!
    features_array = [features.age, features.income, features.credit_score, features.loan_amount]
    prediction = model.predict([features_array])
    return {'prediction': int(prediction[0])}
```

## Error Handling

Proper error handling prevents cryptic failures and helps with debugging.

### Comprehensive Error Handling

```python
from fastapi import FastAPI, HTTPException
import logging

logger = logging.getLogger(__name__)

@app.post("/predict")
def predict(features: list):
    try:
        # Validation
        if len(features) != 4:
            raise HTTPException(
                status_code=400,
                detail=f"Expected 4 features, got {len(features)}"
            )

        # Prediction
        prediction = model.predict([features])
        return {'prediction': int(prediction[0])}

    except ValueError as e:
        # Client error (bad input)
        logger.warning(f"ValueError: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    except HTTPException:
        # Re-raise HTTP exceptions
        raise

    except Exception as e:
        # Unexpected server error
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Internal server error. Please try again later."
        )
```

## Logging

Good logging is essential for production debugging and monitoring.

### Structured Logging

```python
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@app.post("/predict")
def predict(features: list):
    start_time = datetime.utcnow()

    try:
        # Log input (be careful with PII!)
        logger.debug(f"Prediction request: {len(features)} features")

        # Predict
        prediction = model.predict([features])

        # Calculate and log inference time
        inference_time = (datetime.utcnow() - start_time).total_seconds()
        logger.info(
            f"Prediction successful: {prediction[0]}, "
            f"Time: {inference_time:.3f}s"
        )

        return {'prediction': int(prediction[0])}

    except Exception as e:
        logger.error(f"Prediction failed: {e}", exc_info=True)
        raise
```

## Monitoring Metrics

Track key metrics to understand your API's health.

### Prometheus Metrics

```python
from prometheus_client import Counter, Histogram, generate_latest
from fastapi import Response
import time

# Define metrics
prediction_counter = Counter(
    'predictions_total',
    'Total number of predictions'
)
inference_time = Histogram(
    'inference_time_seconds',
    'Time spent on inference'
)
error_counter = Counter(
    'prediction_errors_total',
    'Total prediction errors'
)

@app.post("/predict")
def predict(features: list):
    start_time = time.time()

    try:
        prediction = model.predict([features])

        # Update metrics
        prediction_counter.inc()
        inference_time.observe(time.time() - start_time)

        return {'prediction': int(prediction[0])}

    except Exception as e:
        error_counter.inc()
        raise

@app.get("/metrics")
def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type="text/plain")
```

## Common Pitfalls

### 1. Not Handling Missing Values

```python
# ❌ BAD: Crashes on missing values
@app.post("/predict")
def predict(features: dict):
    features_array = [
        features['age'],
        features['income']  # KeyError if missing!
    ]
    prediction = model.predict([features_array])
    return {'prediction': int(prediction[0])}

# ✅ GOOD: Handle missing values
@app.post("/predict")
def predict(features: dict):
    # Provide defaults for missing values
    default_values = {'age': 30, 'income': 50000}

    features_array = [
        features.get('age', default_values['age']),
        features.get('income', default_values['income'])
    ]

    prediction = model.predict([features_array])
    return {'prediction': int(prediction[0])}
```

### 2. Memory Leaks

```python
# ❌ BAD: Storing predictions in memory indefinitely
predictions_history = []  # Grows forever!

@app.post("/predict")
def predict(features: list):
    prediction = model.predict([features])
    predictions_history.append(prediction)  # Memory leak!
    return {'prediction': int(prediction[0])}

# ✅ GOOD: Limit size or use external storage
from collections import deque

# Keep only last 1000 predictions
predictions_history = deque(maxlen=1000)

@app.post("/predict")
def predict(features: list):
    prediction = model.predict([features])
    predictions_history.append(prediction)  # Limited size
    return {'prediction': int(prediction[0])}

# Better: Store in database or Redis
```

### 3. Not Handling Timeouts

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import asyncio

app = FastAPI()

@app.middleware("http")
async def timeout_middleware(request: Request, call_next):
    """Add timeout to all requests"""
    try:
        return await asyncio.wait_for(
            call_next(request),
            timeout=5.0
        )
    except asyncio.TimeoutError:
        return JSONResponse(
            status_code=504,
            content={"error": "Request timeout"}
        )
```

### 4. Exposing Sensitive Information

```python
# ❌ BAD: Exposing internal errors
@app.post("/predict")
def predict(features: list):
    try:
        prediction = model.predict([features])
        return {'prediction': int(prediction[0])}
    except Exception as e:
        # Don't expose stack traces to users!
        return {'error': str(e), 'traceback': traceback.format_exc()}

# ✅ GOOD: Generic error message to users, detailed logging internally
@app.post("/predict")
def predict(features: list):
    try:
        prediction = model.predict([features])
        return {'prediction': int(prediction[0])}
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)  # Log internally
        return {'error': 'Internal server error'}  # Generic to user
```

## Production Checklist

Before deploying to production:

- [ ] Model loaded at startup, not per request
- [ ] Input validation implemented
- [ ] Error handling for all edge cases
- [ ] Logging configured (INFO level minimum)
- [ ] Metrics collection in place
- [ ] Health check endpoint available
- [ ] Timeouts configured
- [ ] Rate limiting implemented
- [ ] Authentication/authorization if needed
- [ ] Load testing completed
- [ ] Monitoring and alerting set up
- [ ] Rollback plan documented

## Quick Reference

```python
# Model loading
model = joblib.load('model.pkl')  # At startup, not in endpoint

# Validation
if len(features) != 4:
    raise HTTPException(status_code=400, detail="Invalid input")

# Error handling
try:
    prediction = model.predict(features)
except Exception as e:
    logger.error(f"Error: {e}")
    raise HTTPException(status_code=500, detail="Internal error")

# Logging
logger.info(f"Prediction: {prediction}, Time: {time:.3f}s")

# Metrics
counter.inc()
histogram.observe(value)
```

## Summary

Production ML APIs require careful attention to model loading, validation, error handling, logging, and monitoring. Load models once at startup, validate all inputs, handle errors gracefully, log comprehensively, and track key metrics. Avoid common pitfalls like loading models per request, memory leaks, and exposing sensitive information. Following these practices ensures your ML API is performant, reliable, and maintainable.

---

**Related Topics:**
- [Flask ML APIs](./flask-ml-apis.md)
- [FastAPI ML APIs](./fastapi-ml-apis.md)
- [Model Serving Strategies](./model-serving-strategies.md)
- [Model Monitoring Basics](./model-monitoring-basics.md)
