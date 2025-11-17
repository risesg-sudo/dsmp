# FastAPI: Machine Learning Model Deployment

## What You'll Learn

Transform your trained models from Jupyter notebooks into production-ready APIs. Learn to serve predictions efficiently, handle batch requests, implement health checks, and deploy models that can scale from prototype to production seamlessly.

## Why FastAPI for ML Deployment

Machine learning models need fast, reliable APIs. FastAPI provides:
- **Low latency:** Critical for real-time predictions
- **Async support:** Handle multiple predictions concurrently
- **Automatic validation:** Ensure input data matches training schema
- **Interactive docs:** Test predictions directly in browser
- **Type safety:** Catch data mismatches before runtime

## Basic Model Serving

### Simple Classification API

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import numpy as np
from typing import List

app = FastAPI(title="ML Model API", version="1.0.0")

# Load model at startup (not per request!)
model = None

@app.on_event("startup")
async def load_model():
    global model
    try:
        model = joblib.load("model.pkl")
        print("Model loaded successfully")
    except Exception as e:
        print(f"Error loading model: {e}")
        raise

# Request model
class PredictionRequest(BaseModel):
    features: List[float] = Field(..., min_items=4, max_items=4)

    class Config:
        schema_extra = {
            "example": {
                "features": [5.1, 3.5, 1.4, 0.2]
            }
        }

# Response model
class PredictionResponse(BaseModel):
    prediction: int
    probability: List[float]
    prediction_label: str

# Prediction endpoint
@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        # Convert to numpy array
        features = np.array(request.features).reshape(1, -1)

        # Make prediction
        prediction = int(model.predict(features)[0])
        probability = model.predict_proba(features)[0].tolist()

        # Map to labels
        labels = {0: "setosa", 1: "versicolor", 2: "virginica"}

        return {
            "prediction": prediction,
            "probability": probability,
            "prediction_label": labels[prediction]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy" if model is not None else "unhealthy",
        "model_loaded": model is not None
    }
```

## Complete ML API with Preprocessing

A production-ready API handles preprocessing, validation, and error handling:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, validator
import joblib
import numpy as np
import logging
from typing import List, Dict

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Iris Classification API",
    description="Predict iris species from flower measurements",
    version="1.0.0"
)

# Global variables
model = None
scaler = None

# Input validation with Pydantic
class IrisFeatures(BaseModel):
    sepal_length: float = Field(..., ge=0, le=10, description="Sepal length in cm")
    sepal_width: float = Field(..., ge=0, le=10, description="Sepal width in cm")
    petal_length: float = Field(..., ge=0, le=10, description="Petal length in cm")
    petal_width: float = Field(..., ge=0, le=10, description="Petal width in cm")

    @validator('*')
    def check_not_nan(cls, v):
        if np.isnan(v):
            raise ValueError('Value cannot be NaN')
        return v

    class Config:
        schema_extra = {
            "example": {
                "sepal_length": 5.1,
                "sepal_width": 3.5,
                "petal_length": 1.4,
                "petal_width": 0.2
            }
        }

class PredictionResponse(BaseModel):
    species: str
    confidence: float
    probabilities: Dict[str, float]
    model_version: str = "1.0.0"

# Load models at startup
@app.on_event("startup")
async def load_models():
    global model, scaler
    try:
        model = joblib.load("models/iris_model.pkl")
        scaler = joblib.load("models/iris_scaler.pkl")
        logger.info("Models loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load models: {e}")
        raise RuntimeError(f"Model loading failed: {e}")

# Prediction endpoint
@app.post("/predict", response_model=PredictionResponse)
async def predict(features: IrisFeatures):
    """
    Predict iris species from flower measurements.

    Returns:
    - species: Predicted species name
    - confidence: Prediction confidence (0-1)
    - probabilities: Probability for each class
    """
    try:
        # Convert to numpy array
        X = np.array([[
            features.sepal_length,
            features.sepal_width,
            features.petal_length,
            features.petal_width
        ]])

        # Preprocess
        X_scaled = scaler.transform(X)

        # Predict
        prediction = model.predict(X_scaled)[0]
        probabilities = model.predict_proba(X_scaled)[0]

        # Map to species names
        species_map = {0: "setosa", 1: "versicolor", 2: "virginica"}
        species = species_map[prediction]
        confidence = float(max(probabilities))

        # Format probabilities
        prob_dict = {
            species_map[i]: float(prob)
            for i, prob in enumerate(probabilities)
        }

        logger.info(f"Prediction: {species}, Confidence: {confidence:.4f}")

        return {
            "species": species,
            "confidence": confidence,
            "probabilities": prob_dict,
            "model_version": "1.0.0"
        }

    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

# Batch prediction
class BatchRequest(BaseModel):
    samples: List[IrisFeatures]

@app.post("/predict/batch")
async def predict_batch(request: BatchRequest):
    """Predict multiple samples at once"""
    try:
        # Convert all samples to numpy array
        X = np.array([[
            sample.sepal_length,
            sample.sepal_width,
            sample.petal_length,
            sample.petal_width
        ] for sample in request.samples])

        # Preprocess and predict
        X_scaled = scaler.transform(X)
        predictions = model.predict(X_scaled)
        probabilities = model.predict_proba(X_scaled)

        # Format results
        species_map = {0: "setosa", 1: "versicolor", 2: "virginica"}
        results = []

        for i, (pred, probs) in enumerate(zip(predictions, probabilities)):
            results.append({
                "sample_index": i,
                "species": species_map[pred],
                "confidence": float(max(probs)),
                "probabilities": {
                    species_map[j]: float(prob)
                    for j, prob in enumerate(probs)
                }
            })

        return {
            "predictions": results,
            "total_samples": len(results)
        }

    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Model metadata
@app.get("/model/info")
async def model_info():
    """Get information about the deployed model"""
    return {
        "model_type": str(type(model).__name__),
        "model_version": "1.0.0",
        "features": [
            "sepal_length",
            "sepal_width",
            "petal_length",
            "petal_width"
        ],
        "target_classes": ["setosa", "versicolor", "virginica"],
        "n_features": 4,
        "n_classes": 3,
        "trained_date": "2024-01-01"
    }

# Health check
@app.get("/health")
async def health_check():
    """Check if the API is healthy"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None,
        "version": "1.0.0"
    }

# Readiness check (for Kubernetes)
@app.get("/ready")
async def readiness_check():
    """Check if the API is ready to serve requests"""
    if model is None or scaler is None:
        raise HTTPException(status_code=503, detail="Models not loaded")
    return {"status": "ready"}
```

## Advanced Patterns

### Caching Predictions

For expensive models, cache recent predictions:

```python
from functools import lru_cache
from hashlib import md5
import json

# Simple in-memory cache
prediction_cache = {}

def cache_key(features: IrisFeatures) -> str:
    """Generate cache key from features"""
    data = json.dumps(features.dict(), sort_keys=True)
    return md5(data.encode()).hexdigest()

@app.post("/predict/cached")
async def predict_cached(features: IrisFeatures):
    # Check cache
    key = cache_key(features)
    if key in prediction_cache:
        logger.info(f"Cache hit for {key}")
        return prediction_cache[key]

    # Make prediction
    result = await predict(features)

    # Cache result
    prediction_cache[key] = result
    return result
```

### Model Versioning

Support multiple model versions:

```python
from enum import Enum

class ModelVersion(str, Enum):
    v1 = "v1"
    v2 = "v2"

# Load multiple models
models = {}

@app.on_event("startup")
async def load_all_models():
    models["v1"] = joblib.load("models/model_v1.pkl")
    models["v2"] = joblib.load("models/model_v2.pkl")

@app.post("/predict/{version}")
async def predict_versioned(
    version: ModelVersion,
    features: IrisFeatures
):
    model = models.get(version.value)
    if not model:
        raise HTTPException(status_code=404, detail=f"Model {version} not found")

    # Use specific model version
    X = preprocess(features)
    prediction = model.predict(X)
    return {"prediction": prediction, "version": version}
```

### A/B Testing

Compare model performance:

```python
import random

@app.post("/predict/ab-test")
async def predict_ab_test(features: IrisFeatures):
    # Randomly choose model (50/50 split)
    model_choice = random.choice(["v1", "v2"])

    # Make prediction with chosen model
    result = await predict_versioned(model_choice, features)

    # Log for analysis
    logger.info(f"A/B test: used model {model_choice}")

    return {
        **result,
        "model_used": model_choice
    }
```

## Deployment Considerations

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/
COPY models/ ./models/

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Requirements File

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
numpy==1.24.3
scikit-learn==1.3.2
joblib==1.3.2
```

### Running in Production

```bash
# Development
uvicorn main:app --reload

# Production with multiple workers
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# With Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Best Practices

**1. Load Model Once at Startup**
```python
# Good - Load once
@app.on_event("startup")
async def load_model():
    global model
    model = joblib.load("model.pkl")

# Bad - Load per request
@app.post("/predict")
async def predict(features):
    model = joblib.load("model.pkl")  # Slow!
    return model.predict(features)
```

**2. Validate Input Thoroughly**
```python
class Features(BaseModel):
    age: int = Field(..., ge=0, le=150)
    income: float = Field(..., gt=0)

    @validator('age')
    def age_realistic(cls, v):
        if v > 120:
            raise ValueError('Age seems unrealistic')
        return v
```

**3. Include Model Metadata**
```python
@app.get("/model/info")
async def model_info():
    return {
        "version": "1.0.0",
        "trained_date": "2024-01-01",
        "features": model.feature_names_,
        "accuracy": 0.95
    }
```

**4. Implement Health Checks**
```python
@app.get("/health")
async def health():
    # Check model loaded
    if model is None:
        raise HTTPException(status_code=503)

    # Test prediction
    try:
        test_data = np.array([[1, 2, 3, 4]])
        model.predict(test_data)
        return {"status": "healthy"}
    except Exception:
        raise HTTPException(status_code=503)
```

## Common Pitfalls

**1. Not Handling Missing Models**
```python
# Bad
@app.post("/predict")
def predict(features):
    return model.predict(features)  # Crashes if model is None

# Good
@app.post("/predict")
def predict(features):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return model.predict(features)
```

**2. Ignoring Preprocessing**
```python
# Bad - Forgets scaling
prediction = model.predict(features)

# Good - Applies same preprocessing as training
features_scaled = scaler.transform(features)
prediction = model.predict(features_scaled)
```

**3. No Error Handling**
```python
# Bad
@app.post("/predict")
def predict(features):
    return model.predict(features)  # What if prediction fails?

# Good
@app.post("/predict")
def predict(features):
    try:
        return model.predict(features)
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

## Quick Reference

```python
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()
model = None

# Load model
@app.on_event("startup")
async def load_model():
    global model
    model = joblib.load("model.pkl")

# Request model
class Features(BaseModel):
    data: list[float]

# Predict
@app.post("/predict")
async def predict(features: Features):
    X = np.array(features.data).reshape(1, -1)
    prediction = model.predict(X)[0]
    return {"prediction": int(prediction)}

# Health check
@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": model is not None}
```

---

**Navigation:** [← Error Handling](./fastapi-error-handling.md) | [Back to Index](./README.md) | [Next: Practical Examples →](./fastapi-practical-examples.md)
