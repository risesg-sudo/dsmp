# FastAPI for ML APIs

## What You'll Learn

FastAPI is a modern, high-performance web framework designed for building APIs with Python. This guide demonstrates how FastAPI's automatic validation, async support, and built-in documentation make it superior to Flask for production ML systems. You'll learn to leverage FastAPI's type hints and Pydantic models to create robust, self-documenting ML APIs.

## Why FastAPI Over Flask?

FastAPI was built specifically for modern Python API development. Here's how it compares to Flask:

| Feature | Flask | FastAPI |
|---------|-------|---------|
| **Performance** | ~10k req/s | ~25k req/s (async) |
| **Validation** | Manual | Automatic (Pydantic) |
| **Documentation** | Manual | Auto-generated (Swagger) |
| **Type hints** | Optional | Built-in |
| **Async support** | Limited | Native |
| **Learning curve** | Easy | Moderate |

**When to use FastAPI:**
- Production systems requiring high performance
- When you want automatic request validation
- If you need auto-generated API documentation
- For applications requiring async operations
- When type safety is important

**When to stick with Flask:**
- Quick prototypes (though FastAPI is also quick)
- Team is unfamiliar with type hints
- Legacy systems already using Flask
- Very simple APIs with minimal requirements

## Basic FastAPI API

FastAPI's type hints provide automatic validation and documentation:

```python
# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, validator
import joblib
import numpy as np
from typing import List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ML Model API",
    description="API for customer churn prediction",
    version="1.0.0"
)

# Load model
model = joblib.load('models/model.pkl')
logger.info("Model loaded successfully")

# Request models
class Features(BaseModel):
    age: int = Field(..., ge=18, le=100, description="Customer age")
    income: float = Field(..., ge=0, le=1000000, description="Annual income")
    credit_score: int = Field(..., ge=300, le=850, description="Credit score")
    loan_amount: float = Field(..., ge=1000, le=100000, description="Loan amount")

    class Config:
        schema_extra = {
            "example": {
                "age": 35,
                "income": 50000,
                "credit_score": 720,
                "loan_amount": 25000
            }
        }

class PredictionRequest(BaseModel):
    features: List[float]

class PredictionResponse(BaseModel):
    prediction: int
    probability: List[float]
    confidence: float
    model_version: str

# Endpoints
@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "ML Model API",
        "version": "1.0.0",
        "endpoints": ["/docs", "/health", "/predict"]
    }

@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    """Prediction endpoint"""
    try:
        # Convert to numpy array
        features = np.array(request.features).reshape(1, -1)

        # Predict
        prediction = int(model.predict(features)[0])
        probability = model.predict_proba(features)[0].tolist()
        confidence = float(max(probability))

        return PredictionResponse(
            prediction=prediction,
            probability=probability,
            confidence=confidence,
            model_version="1.0.0"
        )
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict_dict")
def predict_dict(features: Features):
    """Prediction with named features and validation"""
    try:
        # Convert to array
        features_array = np.array([
            features.age,
            features.income,
            features.credit_score,
            features.loan_amount
        ]).reshape(1, -1)

        # Predict
        prediction = int(model.predict(features_array)[0])
        probability = model.predict_proba(features_array)[0]

        return {
            "prediction": prediction,
            "probability": {
                "no_churn": float(probability[0]),
                "churn": float(probability[1])
            },
            "input": features.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/batch_predict")
def batch_predict(features_list: List[List[float]]):
    """Batch prediction endpoint"""
    try:
        features = np.array(features_list)
        predictions = model.predict(features).tolist()

        return {
            "predictions": predictions,
            "count": len(predictions)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Advanced FastAPI with Async

FastAPI's async support enables non-blocking operations for better performance:

```python
# main.py
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import joblib
import numpy as np
import asyncio
from datetime import datetime
import logging

app = FastAPI()

# Load model
model = joblib.load('models/model.pkl')

# In-memory storage for async predictions
predictions_db = {}

class AsyncPredictionRequest(BaseModel):
    request_id: str
    features: list

class AsyncPredictionStatus(BaseModel):
    request_id: str
    status: str
    result: dict = None

async def run_prediction(request_id: str, features: list):
    """Background task for prediction"""
    try:
        # Simulate long-running prediction
        await asyncio.sleep(2)

        features_array = np.array(features).reshape(1, -1)
        prediction = int(model.predict(features_array)[0])
        probability = model.predict_proba(features_array)[0].tolist()

        predictions_db[request_id] = {
            'status': 'completed',
            'result': {
                'prediction': prediction,
                'probability': probability,
                'completed_at': datetime.utcnow().isoformat()
            }
        }
    except Exception as e:
        predictions_db[request_id] = {
            'status': 'failed',
            'error': str(e)
        }

@app.post("/predict_async")
async def predict_async(
    request: AsyncPredictionRequest,
    background_tasks: BackgroundTasks
):
    """Async prediction endpoint"""
    predictions_db[request.request_id] = {'status': 'processing'}

    background_tasks.add_task(
        run_prediction,
        request.request_id,
        request.features
    )

    return {
        "request_id": request.request_id,
        "status": "processing",
        "check_status_url": f"/predict_status/{request.request_id}"
    }

@app.get("/predict_status/{request_id}")
async def get_prediction_status(request_id: str):
    """Check prediction status"""
    if request_id not in predictions_db:
        raise HTTPException(status_code=404, detail="Request not found")

    return predictions_db[request_id]
```

## FastAPI with Caching

Caching frequently requested predictions improves performance:

```python
# main.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
from functools import lru_cache
import hashlib
import json

app = FastAPI()

model = joblib.load('models/model.pkl')

# Simple cache using dict
prediction_cache = {}

def hash_features(features):
    """Create hash of features for caching"""
    return hashlib.md5(
        json.dumps(features, sort_keys=True).encode()
    ).hexdigest()

@app.post("/predict_cached")
def predict_cached(features: list):
    """Prediction with caching"""
    # Check cache
    cache_key = hash_features(features)
    if cache_key in prediction_cache:
        return {
            **prediction_cache[cache_key],
            'cached': True
        }

    # Predict
    features_array = np.array(features).reshape(1, -1)
    prediction = int(model.predict(features_array)[0])
    probability = model.predict_proba(features_array)[0].tolist()

    result = {
        'prediction': prediction,
        'probability': probability,
        'cached': False
    }

    # Store in cache
    prediction_cache[cache_key] = result

    return result
```

## Running FastAPI

```bash
# Install uvicorn
pip install uvicorn

# Run development server with auto-reload
uvicorn main:app --reload

# Run production server
uvicorn main:app --host 0.0.0.0 --port 8000

# Multiple workers for production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Access interactive API docs
# Swagger UI: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

## Testing FastAPI

FastAPI makes testing straightforward:

```python
# test_api.py
import requests

BASE_URL = 'http://localhost:8000'

# Test with requests
response = requests.post(
    f'{BASE_URL}/predict',
    json={'features': [35, 50000, 720, 25000]}
)
print(response.json())

# Test with httpx (async)
import httpx
import asyncio

async def test_async():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f'{BASE_URL}/predict',
            json={'features': [35, 50000, 720, 25000]}
        )
        print(response.json())

asyncio.run(test_async())
```

## Best Practices

1. **Use Pydantic models** for automatic validation
2. **Define response models** for consistent API contracts
3. **Add field descriptions** for better documentation
4. **Use dependency injection** for shared resources
5. **Implement proper error handling** with HTTPException
6. **Use async/await** for I/O-bound operations
7. **Add API versioning** for backward compatibility

## Common Pitfalls

**Not using type hints:**
```python
# WRONG - No validation
@app.post("/predict")
def predict(features):
    return model.predict([features])

# RIGHT - Automatic validation
@app.post("/predict")
def predict(features: List[float]):
    return model.predict([features])
```

**Blocking operations in async endpoints:**
```python
# WRONG - Blocks event loop
@app.post("/predict")
async def predict(features: list):
    result = model.predict([features])  # Blocking!
    return result

# RIGHT - Use sync endpoint or run_in_executor
@app.post("/predict")
def predict(features: list):  # Not async
    result = model.predict([features])
    return result
```

## Quick Reference

```bash
# Start FastAPI
uvicorn main:app --reload

# With multiple workers
uvicorn main:app --workers 4

# View API docs
# http://localhost:8000/docs
# http://localhost:8000/redoc
```

## Summary

FastAPI offers significant advantages for production ML APIs: automatic validation through Pydantic, native async support, and built-in interactive documentation. While it requires understanding type hints, the benefits in code quality, performance, and developer experience make it the superior choice for most modern ML API projects. The auto-generated documentation alone saves countless hours of manual API documentation work.

---

**Related Topics:**
- [Flask ML APIs](./flask-ml-apis.md)
- [Model Serving Strategies](./model-serving-strategies.md)
- [Deployment Best Practices](./deployment-best-practices.md)
