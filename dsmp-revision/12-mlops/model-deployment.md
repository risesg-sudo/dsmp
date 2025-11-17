# Model Deployment & Serving

## 📋 Table of Contents
1. [Deployment Fundamentals](#deployment-fundamentals)
2. [Flask for ML APIs](#flask-for-ml-apis)
3. [FastAPI for ML APIs](#fastapi-for-ml-apis)
4. [Model Serving Strategies](#model-serving-strategies)
5. [A/B Testing & Canary Deployments](#ab-testing--canary-deployments)
6. [Best Practices](#best-practices)
7. [Common Pitfalls](#common-pitfalls)
8. [Interview Questions](#interview-questions)

---

## Deployment Fundamentals

### ML Deployment Options

```
┌────────────────────────────────────────────────────────┐
│         ML Deployment Patterns                         │
├────────────────────────────────────────────────────────┤
│                                                        │
│  1. Batch Inference                                   │
│     ┌──────────┐     ┌──────────┐     ┌──────────┐   │
│     │  Data    │────▶│  Model   │────▶│ Results  │   │
│     │  (CSV)   │     │  (Batch) │     │  (CSV)   │   │
│     └──────────┘     └──────────┘     └──────────┘   │
│     Use: Large datasets, not time-sensitive          │
│                                                        │
│  2. Real-time API                                     │
│     ┌──────────┐     ┌──────────┐     ┌──────────┐   │
│     │  Client  │────▶│   API    │────▶│ Response │   │
│     │ (Request)│◀────│  Model   │◀────│ (JSON)   │   │
│     └──────────┘     └──────────┘     └──────────┘   │
│     Use: Low latency, interactive                     │
│                                                        │
│  3. Streaming                                         │
│     ┌──────────┐     ┌──────────┐     ┌──────────┐   │
│     │  Stream  │────▶│  Model   │────▶│  Stream  │   │
│     │ (Kafka)  │     │(Real-time)│     │ (Output) │   │
│     └──────────┘     └──────────┘     └──────────┘   │
│     Use: Continuous data, fraud detection            │
│                                                        │
│  4. Edge Deployment                                   │
│     ┌──────────┐     ┌──────────┐                    │
│     │  Device  │────▶│  Model   │                    │
│     │ (Mobile) │◀────│ (Local)  │                    │
│     └──────────┘     └──────────┘                    │
│     Use: Offline, low latency, privacy              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### When to Use Each Pattern

| Pattern | Latency | Throughput | Cost | Use Case |
|---------|---------|------------|------|----------|
| **Batch** | Hours-Days | High | $ | Recommendation systems, data pipelines |
| **Real-time API** | Milliseconds | Medium | $$ | Chat, search, predictions |
| **Streaming** | Seconds | High | $$$ | Fraud detection, monitoring |
| **Edge** | Microseconds | Low | $ | Mobile apps, IoT devices |

---

## Flask for ML APIs

### Basic Flask API

```python
# app.py
from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load model at startup
model = joblib.load('models/model.pkl')

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'}), 200

@app.route('/predict', methods=['POST'])
def predict():
    """Prediction endpoint"""
    try:
        # Get JSON data
        data = request.get_json()
        features = data['features']

        # Validate input
        if not isinstance(features, list):
            return jsonify({'error': 'features must be a list'}), 400

        # Convert to numpy array
        features = np.array(features).reshape(1, -1)

        # Predict
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0].tolist()

        return jsonify({
            'prediction': int(prediction),
            'probability': probability
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/batch_predict', methods=['POST'])
def batch_predict():
    """Batch prediction endpoint"""
    try:
        data = request.get_json()
        features_list = data['features']

        # Convert to numpy array
        features = np.array(features_list)

        # Predict
        predictions = model.predict(features).tolist()

        return jsonify({
            'predictions': predictions,
            'count': len(predictions)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)
```

### Advanced Flask API with Validation

```python
# app.py
from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Load model
MODEL_PATH = 'models/model.pkl'
model = joblib.load(MODEL_PATH)
logger.info(f"Model loaded from {MODEL_PATH}")

# Load feature names (for validation)
FEATURE_NAMES = ['age', 'income', 'credit_score', 'loan_amount']
FEATURE_MINS = [18, 0, 300, 1000]
FEATURE_MAXS = [100, 1000000, 850, 100000]

def validate_features(features):
    """Validate input features"""
    if len(features) != len(FEATURE_NAMES):
        return False, f"Expected {len(FEATURE_NAMES)} features, got {len(features)}"

    for i, (feat, min_val, max_val) in enumerate(zip(features, FEATURE_MINS, FEATURE_MAXS)):
        if not (min_val <= feat <= max_val):
            return False, f"Feature {FEATURE_NAMES[i]} out of range [{min_val}, {max_val}]"

    return True, "Valid"

@app.before_request
def log_request():
    """Log all requests"""
    logger.info(f"{request.method} {request.path} from {request.remote_addr}")

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': MODEL_PATH,
        'timestamp': datetime.utcnow().isoformat()
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    """Prediction endpoint with validation"""
    start_time = datetime.utcnow()

    try:
        # Parse request
        data = request.get_json()

        if 'features' not in data:
            return jsonify({'error': 'Missing features field'}), 400

        features = data['features']

        # Validate
        is_valid, message = validate_features(features)
        if not is_valid:
            return jsonify({'error': message}), 400

        # Convert to numpy array
        features_array = np.array(features).reshape(1, -1)

        # Predict
        prediction = model.predict(features_array)[0]
        probability = model.predict_proba(features_array)[0]

        # Calculate inference time
        inference_time = (datetime.utcnow() - start_time).total_seconds() * 1000

        response = {
            'prediction': int(prediction),
            'probability': {
                'class_0': float(probability[0]),
                'class_1': float(probability[1])
            },
            'confidence': float(max(probability)),
            'inference_time_ms': round(inference_time, 2),
            'model_version': '1.0.0'
        }

        logger.info(f"Prediction: {prediction}, Time: {inference_time:.2f}ms")

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/predict_dict', methods=['POST'])
def predict_dict():
    """Prediction endpoint with named features"""
    try:
        data = request.get_json()

        # Extract features in correct order
        features = [data[name] for name in FEATURE_NAMES]

        # Validate
        is_valid, message = validate_features(features)
        if not is_valid:
            return jsonify({'error': message}), 400

        # Predict
        features_array = np.array(features).reshape(1, -1)
        prediction = model.predict(features_array)[0]

        return jsonify({
            'prediction': int(prediction),
            'input': dict(zip(FEATURE_NAMES, features))
        }), 200

    except KeyError as e:
        return jsonify({'error': f'Missing feature: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
```

### Flask with Gunicorn (Production)

```python
# wsgi.py
from app import app

if __name__ == "__main__":
    app.run()
```

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn --workers 4 --bind 0.0.0.0:8000 --timeout 120 wsgi:app

# With auto-reload (development)
gunicorn --workers 4 --bind 0.0.0.0:8000 --reload wsgi:app
```

### Testing Flask API

```python
# test_api.py
import requests
import json

BASE_URL = 'http://localhost:8000'

def test_health():
    response = requests.get(f'{BASE_URL}/health')
    print(f"Health check: {response.status_code}")
    print(response.json())

def test_predict():
    data = {
        'features': [35, 50000, 720, 25000]
    }
    response = requests.post(
        f'{BASE_URL}/predict',
        json=data,
        headers={'Content-Type': 'application/json'}
    )
    print(f"Prediction: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

def test_batch_predict():
    data = {
        'features': [
            [35, 50000, 720, 25000],
            [45, 75000, 680, 30000],
            [28, 40000, 750, 15000]
        ]
    }
    response = requests.post(f'{BASE_URL}/batch_predict', json=data)
    print(f"Batch prediction: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

if __name__ == '__main__':
    test_health()
    test_predict()
    test_batch_predict()
```

---

## FastAPI for ML APIs

### Why FastAPI over Flask?

| Feature | Flask | FastAPI |
|---------|-------|---------|
| **Performance** | Slower | Faster (async) |
| **Validation** | Manual | Automatic (Pydantic) |
| **Documentation** | Manual | Auto-generated (Swagger) |
| **Type hints** | Optional | Built-in |
| **Async support** | Limited | Native |
| **Learning curve** | Easy | Moderate |

### Basic FastAPI API

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

### Advanced FastAPI with Async

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

### FastAPI with Caching

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

### Run FastAPI

```bash
# Install uvicorn
pip install uvicorn

# Run
uvicorn main:app --host 0.0.0.0 --port 8000

# With auto-reload (development)
uvicorn main:app --reload

# Multiple workers (production)
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Access Swagger docs at: http://localhost:8000/docs
# Access ReDoc at: http://localhost:8000/redoc
```

### Testing FastAPI

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

---

## Model Serving Strategies

### 1. Synchronous Serving

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

### 2. Asynchronous Serving

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

### 3. Batch Serving

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

### 4. Model Ensemble

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

---

## A/B Testing & Canary Deployments

### A/B Testing

Route traffic to different model versions:

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

### Canary Deployment

Gradually roll out new model:

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

### Blue-Green Deployment

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

---

## Best Practices

### 1. Model Loading

```python
# ✅ GOOD: Load model once at startup
model = joblib.load('models/model.pkl')

@app.post("/predict")
def predict(features: list):
    # Use loaded model
    prediction = model.predict(features)
    return {'prediction': prediction}

# ❌ BAD: Load model on every request
@app.post("/predict")
def predict(features: list):
    model = joblib.load('models/model.pkl')  # Slow!
    prediction = model.predict(features)
    return {'prediction': prediction}
```

### 2. Input Validation

```python
from pydantic import BaseModel, Field, validator

class Features(BaseModel):
    age: int = Field(..., ge=18, le=100)
    income: float = Field(..., gt=0)

    @validator('age')
    def validate_age(cls, v):
        if v < 18:
            raise ValueError('Age must be at least 18')
        return v
```

### 3. Error Handling

```python
@app.post("/predict")
def predict(features: list):
    try:
        # Validation
        if len(features) != 4:
            raise HTTPException(
                status_code=400,
                detail="Expected 4 features"
            )

        # Prediction
        prediction = model.predict([features])
        return {'prediction': int(prediction[0])}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal error")
```

### 4. Logging

```python
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.post("/predict")
def predict(features: list):
    start_time = datetime.utcnow()

    try:
        prediction = model.predict([features])

        inference_time = (datetime.utcnow() - start_time).total_seconds()

        logger.info(f"Prediction: {prediction[0]}, Time: {inference_time:.3f}s")

        return {'prediction': int(prediction[0])}
    except Exception as e:
        logger.error(f"Error: {e}")
        raise
```

### 5. Monitoring Metrics

```python
from prometheus_client import Counter, Histogram, generate_latest
from fastapi import Response

# Metrics
prediction_counter = Counter('predictions_total', 'Total predictions')
inference_time = Histogram('inference_time_seconds', 'Inference time')
error_counter = Counter('prediction_errors_total', 'Prediction errors')

@app.post("/predict")
def predict(features: list):
    with inference_time.time():
        try:
            prediction = model.predict([features])
            prediction_counter.inc()
            return {'prediction': int(prediction[0])}
        except Exception as e:
            error_counter.inc()
            raise

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

---

## Common Pitfalls

### 1. Not Handling Missing Values

```python
# ✅ GOOD
@app.post("/predict")
def predict(features: dict):
    # Fill missing values
    default_values = {'age': 30, 'income': 50000}
    for key, default in default_values.items():
        if key not in features:
            features[key] = default

    # Convert to array
    features_array = [features['age'], features['income']]
    prediction = model.predict([features_array])
    return {'prediction': int(prediction[0])}
```

### 2. Large Model Loading Time

```python
# Solution: Load model asynchronously or use model server

from fastapi import FastAPI, BackgroundTasks

app = FastAPI()
model = None

@app.on_event("startup")
async def load_model():
    """Load model on startup"""
    global model
    import joblib
    model = joblib.load('models/large_model.pkl')
    print("Model loaded")

@app.post("/predict")
def predict(features: list):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not ready")

    prediction = model.predict([features])
    return {'prediction': int(prediction[0])}
```

### 3. Memory Leaks

```python
# ❌ BAD: Storing predictions in memory
predictions_history = []  # Grows indefinitely!

@app.post("/predict")
def predict(features: list):
    prediction = model.predict([features])
    predictions_history.append(prediction)  # Memory leak!
    return {'prediction': int(prediction[0])}

# ✅ GOOD: Use external storage or limit size
from collections import deque

predictions_history = deque(maxlen=1000)  # Keep only last 1000

# Or use Redis/database
```

### 4. Not Handling Timeout

```python
from fastapi import FastAPI, Request
import asyncio

app = FastAPI()

@app.middleware("http")
async def timeout_middleware(request: Request, call_next):
    try:
        return await asyncio.wait_for(call_next(request), timeout=5.0)
    except asyncio.TimeoutError:
        return JSONResponse(
            status_code=504,
            content={"error": "Request timeout"}
        )
```

---

## Interview Questions

### Q1: Compare Flask and FastAPI for ML deployment.

**Answer:**

| Aspect | Flask | FastAPI |
|--------|-------|---------|
| **Performance** | ~10k req/s | ~25k req/s (async) |
| **Validation** | Manual | Automatic (Pydantic) |
| **Documentation** | Manual | Auto (Swagger/ReDoc) |
| **Learning curve** | Easy | Moderate |
| **Async support** | Limited | Native |
| **Type hints** | Optional | Required |
| **Use case** | Simple APIs, prototypes | Production, high performance |

**When to use:**

**Flask:**
- Simple APIs
- Quick prototypes
- Team familiar with Flask
- Legacy systems

**FastAPI:**
- Production systems
- High performance needed
- Need automatic validation
- Want auto-generated docs
- Async operations

**Example comparison:**

Flask:
```python
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    features = data['features']
    # Manual validation
    if not isinstance(features, list):
        return {'error': 'Invalid input'}, 400
    prediction = model.predict([features])
    return {'prediction': int(prediction[0])}
```

FastAPI:
```python
class PredictionRequest(BaseModel):
    features: List[float]  # Auto-validated

@app.post("/predict")
def predict(request: PredictionRequest):
    prediction = model.predict([request.features])
    return {'prediction': int(prediction[0])}
```

---

### Q2: Explain batch vs real-time inference.

**Answer:**

**Batch Inference:**
```
Process large datasets offline
Input: CSV with 1M rows
Output: CSV with predictions
Time: Hours
```

**Real-time Inference:**
```
Process single requests online
Input: Single JSON request
Output: Immediate response
Time: Milliseconds
```

**Comparison:**

| Aspect | Batch | Real-time |
|--------|-------|-----------|
| **Latency** | Hours-days | Milliseconds |
| **Throughput** | High | Low-medium |
| **Cost** | Low | Higher |
| **Complexity** | Simple | Complex |
| **Use case** | Recommendations, reports | Chatbots, fraud detection |

**When to use:**

**Batch:**
- Daily recommendation updates
- Monthly credit score calculations
- Quarterly forecasts
- Data not time-sensitive

**Real-time:**
- Fraud detection (immediate)
- Chatbot responses
- Search results
- Dynamic pricing

**Hybrid approach:**
```python
# Pre-compute common predictions (batch)
# Store in database
# Real-time API checks cache first

@app.post("/predict")
def predict(user_id: int):
    # Check cache
    cached = db.get_prediction(user_id)
    if cached:
        return cached

    # Real-time prediction
    features = get_user_features(user_id)
    prediction = model.predict([features])

    # Cache result
    db.store_prediction(user_id, prediction)

    return {'prediction': int(prediction[0])}
```

---

### Q3: How do you handle model versioning in production?

**Answer:**

**Strategies:**

1. **Load balancer routing**
   ```
   /predict/v1 → Model v1
   /predict/v2 → Model v2
   ```

2. **Header-based routing**
   ```python
   @app.post("/predict")
   def predict(request: Request, features: list):
       version = request.headers.get('X-Model-Version', 'v1')

       if version == 'v1':
           model = model_v1
       elif version == 'v2':
           model = model_v2

       prediction = model.predict([features])
       return {'prediction': int(prediction[0])}
   ```

3. **A/B testing**
   ```python
   import random

   def get_model():
       if random.random() < 0.8:
           return model_v1, 'v1'
       return model_v2, 'v2'
   ```

4. **Canary deployment**
   ```python
   # Gradually increase traffic to v2
   if current_time < cutover_time:
       percentage = calculate_ramp_up()
       if random.random() * 100 < percentage:
           return model_v2
   return model_v1
   ```

5. **Feature flags**
   ```python
   from feature_flags import get_flag

   if get_flag('use_model_v2', user_id):
       model = model_v2
   else:
       model = model_v1
   ```

**Best practices:**
- Shadow mode (run both, compare)
- Monitor metrics per version
- Easy rollback mechanism
- Gradual rollout
- Log model version with predictions

---

### Q4: How do you optimize API latency?

**Answer:**

**Optimization techniques:**

1. **Model optimization**
   - Quantization (reduce precision)
   - Pruning (remove unnecessary weights)
   - Knowledge distillation (smaller model)

   ```python
   # Example: TensorFlow Lite for mobile
   import tensorflow as tf

   converter = tf.lite.TFLiteConverter.from_saved_model('model')
   converter.optimizations = [tf.lite.Optimize.DEFAULT]
   tflite_model = converter.convert()
   ```

2. **Caching**
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

3. **Batch predictions**
   ```python
   import asyncio
   from collections import defaultdict

   pending_requests = defaultdict(list)

   async def batch_predict():
       while True:
           await asyncio.sleep(0.1)  # Wait 100ms

           if pending_requests:
               all_features = []
               request_ids = []

               for req_id, features in pending_requests.items():
                   all_features.append(features)
                   request_ids.append(req_id)

               # Batch predict
               predictions = model.predict(all_features)

               # Return results
               for req_id, pred in zip(request_ids, predictions):
                   # Store result
                   ...

               pending_requests.clear()
   ```

4. **Use faster frameworks**
   - TensorFlow Serving
   - TorchServe
   - ONNX Runtime
   - TensorRT (GPU)

5. **Async processing**
   ```python
   @app.post("/predict_async")
   async def predict_async(features: list):
       # Non-blocking prediction
       loop = asyncio.get_event_loop()
       prediction = await loop.run_in_executor(
           None,
           model.predict,
           [features]
       )
       return {'prediction': int(prediction[0])}
   ```

6. **Load balancing**
   - Multiple API instances
   - Horizontal scaling
   - Auto-scaling based on load

**Target latencies:**
- Real-time: < 100ms
- Interactive: < 500ms
- Batch: Minutes-hours

---

### Q5: How do you monitor ML models in production?

**Answer:**

**Key metrics:**

1. **Performance metrics**
   - Latency (p50, p95, p99)
   - Throughput (requests/sec)
   - Error rate

2. **Model metrics**
   - Prediction distribution
   - Confidence scores
   - Model drift

3. **Business metrics**
   - Conversion rate
   - Revenue impact
   - User satisfaction

**Implementation:**

```python
from prometheus_client import Counter, Histogram, Gauge
import logging

# Prometheus metrics
predictions_total = Counter('predictions_total', 'Total predictions')
prediction_latency = Histogram('prediction_latency_seconds', 'Prediction latency')
prediction_confidence = Gauge('prediction_confidence', 'Average confidence')
prediction_distribution = Counter('prediction_distribution', 'Prediction distribution', ['class'])

@app.post("/predict")
def predict(features: list):
    start_time = time.time()

    try:
        # Predict
        prediction = model.predict([features])[0]
        probability = model.predict_proba([features])[0]
        confidence = max(probability)

        # Update metrics
        predictions_total.inc()
        prediction_latency.observe(time.time() - start_time)
        prediction_confidence.set(confidence)
        prediction_distribution.labels(class_=str(prediction)).inc()

        # Log prediction
        logger.info(f"Prediction: {prediction}, Confidence: {confidence:.2f}")

        # Store for analysis
        db.store_prediction({
            'features': features,
            'prediction': prediction,
            'confidence': confidence,
            'timestamp': datetime.utcnow()
        })

        return {
            'prediction': int(prediction),
            'confidence': float(confidence)
        }

    except Exception as e:
        logger.error(f"Error: {e}")
        error_counter.inc()
        raise

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

**Monitoring tools:**
- Prometheus + Grafana (metrics)
- ELK Stack (logs)
- DataDog, New Relic (APM)
- MLflow (model tracking)

**Alerts:**
```yaml
# Alert if latency > 1s
alert: HighLatency
expr: prediction_latency_seconds > 1.0
for: 5m
labels:
  severity: warning

# Alert if error rate > 5%
alert: HighErrorRate
expr: rate(prediction_errors_total[5m]) > 0.05
```

---

**Quick Reference:**

```bash
# Flask
flask run --host 0.0.0.0 --port 8000

# FastAPI
uvicorn main:app --host 0.0.0.0 --port 8000

# Gunicorn + Flask
gunicorn --workers 4 --bind 0.0.0.0:8000 wsgi:app

# Uvicorn + FastAPI (production)
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

[← Back to AWS Cloud](./cloud-aws.md) | [Next: Monitoring & Pipelines →](./monitoring-pipelines.md)
