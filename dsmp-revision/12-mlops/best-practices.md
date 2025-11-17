# MLOps Best Practices & Production Checklist

## 📋 Table of Contents
1. [Production ML Checklist](#production-ml-checklist)
2. [Code Quality](#code-quality)
3. [Testing ML Systems](#testing-ml-systems)
4. [Security Best Practices](#security-best-practices)
5. [Performance Optimization](#performance-optimization)
6. [Troubleshooting Guide](#troubleshooting-guide)
7. [Interview Preparation](#interview-preparation)

---

## Production ML Checklist

### Pre-Deployment Checklist

```
┌────────────────────────────────────────────────────┐
│         Production Readiness Checklist             │
├────────────────────────────────────────────────────┤
│                                                    │
│  ☐ Code & Model                                   │
│    ☐ Code is version controlled (Git)            │
│    ☐ Model is versioned (DVC/MLflow)             │
│    ☐ All dependencies specified (requirements.txt)│
│    ☐ Reproducible training pipeline               │
│    ☐ Model performance validated                  │
│    ☐ Edge cases tested                            │
│                                                    │
│  ☐ Data                                           │
│    ☐ Data validation implemented                  │
│    ☐ Data versioned (DVC)                         │
│    ☐ Schema validation in place                   │
│    ☐ Missing value handling                       │
│    ☐ Outlier detection                            │
│                                                    │
│  ☐ API                                            │
│    ☐ Input validation                             │
│    ☐ Error handling                               │
│    ☐ Rate limiting                                │
│    ☐ Authentication/Authorization                 │
│    ☐ API documentation (Swagger)                  │
│    ☐ Health check endpoint                        │
│                                                    │
│  ☐ Monitoring                                     │
│    ☐ Logging configured                           │
│    ☐ Metrics collection (Prometheus)              │
│    ☐ Drift detection                              │
│    ☐ Performance monitoring                       │
│    ☐ Alerting rules defined                       │
│                                                    │
│  ☐ Infrastructure                                 │
│    ☐ Docker image built and tested               │
│    ☐ Kubernetes manifests ready                   │
│    ☐ Auto-scaling configured                      │
│    ☐ Load balancer setup                          │
│    ☐ Backup and recovery plan                     │
│                                                    │
│  ☐ Testing                                        │
│    ☐ Unit tests (>80% coverage)                  │
│    ☐ Integration tests                            │
│    ☐ Load tests                                   │
│    ☐ Model tests                                  │
│    ☐ Data tests                                   │
│                                                    │
│  ☐ Documentation                                  │
│    ☐ README with setup instructions              │
│    ☐ API documentation                            │
│    ☐ Architecture diagram                         │
│    ☐ Troubleshooting guide                        │
│    ☐ Runbook for on-call                         │
│                                                    │
│  ☐ Security                                       │
│    ☐ Secrets management (Vault/Secrets Manager)  │
│    ☐ HTTPS enabled                                │
│    ☐ Input sanitization                           │
│    ☐ Dependency vulnerabilities checked           │
│    ☐ Least privilege access                       │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Deployment Stages

```
┌──────────────────────────────────────────────────┐
│         Deployment Pipeline                      │
├──────────────────────────────────────────────────┤
│                                                  │
│  1. Development                                  │
│     • Local testing                              │
│     • Unit tests pass                            │
│     • Code review                                │
│                                                  │
│  2. Staging                                      │
│     • Deploy to staging environment             │
│     • Integration tests                          │
│     • Load tests                                 │
│     • Stakeholder review                         │
│                                                  │
│  3. Canary (10% traffic)                        │
│     • Deploy to 10% of users                    │
│     • Monitor metrics closely                    │
│     • Compare with current model                 │
│     • Duration: 24-48 hours                      │
│                                                  │
│  4. Production (100% traffic)                   │
│     • Gradual rollout (20%, 50%, 100%)          │
│     • Monitor continuously                       │
│     • Rollback plan ready                        │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Code Quality

### Project Structure

```
ml-project/
├── .github/
│   └── workflows/
│       └── ci.yml                 # CI/CD pipeline
├── src/
│   ├── __init__.py
│   ├── data/
│   │   ├── __init__.py
│   │   ├── load_data.py
│   │   └── preprocess.py
│   ├── features/
│   │   ├── __init__.py
│   │   └── build_features.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── train.py
│   │   ├── predict.py
│   │   └── evaluate.py
│   └── api/
│       ├── __init__.py
│       ├── main.py               # FastAPI app
│       └── schemas.py            # Pydantic models
├── tests/
│   ├── __init__.py
│   ├── unit/
│   │   ├── test_preprocessing.py
│   │   ├── test_features.py
│   │   └── test_model.py
│   ├── integration/
│   │   └── test_api.py
│   └── data/
│       └── test_data_validation.py
├── notebooks/
│   ├── 01_eda.ipynb
│   ├── 02_modeling.ipynb
│   └── 03_evaluation.ipynb
├── data/
│   ├── raw/
│   ├── processed/
│   └── .gitkeep
├── models/
│   ├── production/
│   │   └── model.pkl
│   └── experiments/
├── config/
│   ├── config.yaml
│   └── params.yaml
├── deployment/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── k8s/
│       ├── deployment.yaml
│       └── service.yaml
├── .gitignore
├── .dockerignore
├── requirements.txt
├── setup.py
├── README.md
└── dvc.yaml                       # DVC pipeline
```

### Code Style

```python
# style_guide.py

# ✅ GOOD: Clear, documented, type-hinted

from typing import List, Tuple
import numpy as np
import pandas as pd


def preprocess_features(
    df: pd.DataFrame,
    numerical_cols: List[str],
    categorical_cols: List[str]
) -> Tuple[pd.DataFrame, dict]:
    """
    Preprocess features for model training.

    Args:
        df: Input dataframe
        numerical_cols: List of numerical column names
        categorical_cols: List of categorical column names

    Returns:
        Processed dataframe and metadata dict

    Raises:
        ValueError: If required columns are missing

    Example:
        >>> df = pd.DataFrame({'age': [25, 30], 'city': ['NYC', 'LA']})
        >>> processed_df, metadata = preprocess_features(
        ...     df, ['age'], ['city']
        ... )
    """
    # Validate columns
    missing_cols = set(numerical_cols + categorical_cols) - set(df.columns)
    if missing_cols:
        raise ValueError(f"Missing columns: {missing_cols}")

    # Handle missing values
    for col in numerical_cols:
        df[col] = df[col].fillna(df[col].median())

    # Encode categorical
    encodings = {}
    for col in categorical_cols:
        df[col], encoding = pd.factorize(df[col])
        encodings[col] = encoding

    metadata = {
        'numerical_cols': numerical_cols,
        'categorical_cols': categorical_cols,
        'encodings': encodings
    }

    return df, metadata


# ❌ BAD: No types, no docs, unclear

def preprocess(df, n, c):
    for col in n:
        df[col] = df[col].fillna(df[col].median())
    for col in c:
        df[col], _ = pd.factorize(df[col])
    return df
```

### Linting and Formatting

```bash
# Install tools
pip install black flake8 mypy isort

# Format code
black src/

# Sort imports
isort src/

# Lint
flake8 src/ --max-line-length=88

# Type checking
mypy src/
```

```toml
# pyproject.toml
[tool.black]
line-length = 88
target-version = ['py39']

[tool.isort]
profile = "black"
line_length = 88

[tool.mypy]
python_version = "3.9"
warn_return_any = true
warn_unused_configs = true
```

---

## Testing ML Systems

### 1. Unit Tests

```python
# tests/unit/test_preprocessing.py
import pytest
import pandas as pd
import numpy as np
from src.data.preprocess import preprocess_features


def test_preprocess_features_basic():
    """Test basic preprocessing"""
    df = pd.DataFrame({
        'age': [25, 30, 35],
        'city': ['NYC', 'LA', 'SF']
    })

    processed, metadata = preprocess_features(
        df, ['age'], ['city']
    )

    assert 'age' in processed.columns
    assert 'city' in processed.columns
    assert processed['city'].dtype == int


def test_preprocess_handles_missing_values():
    """Test missing value handling"""
    df = pd.DataFrame({
        'age': [25, np.nan, 35],
        'city': ['NYC', 'LA', 'SF']
    })

    processed, _ = preprocess_features(
        df, ['age'], ['city']
    )

    assert processed['age'].isna().sum() == 0


def test_preprocess_raises_on_missing_columns():
    """Test error handling for missing columns"""
    df = pd.DataFrame({
        'age': [25, 30, 35]
    })

    with pytest.raises(ValueError, match="Missing columns"):
        preprocess_features(df, ['age'], ['city'])


def test_preprocess_returns_metadata():
    """Test metadata return"""
    df = pd.DataFrame({
        'age': [25, 30, 35],
        'city': ['NYC', 'LA', 'SF']
    })

    _, metadata = preprocess_features(
        df, ['age'], ['city']
    )

    assert 'encodings' in metadata
    assert 'city' in metadata['encodings']
```

### 2. Data Tests

```python
# tests/data/test_data_validation.py
import pytest
import pandas as pd
from great_expectations.dataset import PandasDataset


def test_data_schema():
    """Test data schema"""
    df = pd.read_csv('data/raw/train.csv')

    # Check required columns
    required_cols = ['age', 'income', 'credit_score', 'target']
    assert all(col in df.columns for col in required_cols)

    # Check data types
    assert df['age'].dtype == int
    assert df['income'].dtype == float
    assert df['target'].dtype == int


def test_data_quality():
    """Test data quality"""
    df = pd.read_csv('data/raw/train.csv')

    # Check missing values
    assert df.isna().sum().sum() < len(df) * 0.1  # < 10% missing

    # Check duplicates
    assert df.duplicated().sum() == 0

    # Check value ranges
    assert df['age'].between(18, 100).all()
    assert df['credit_score'].between(300, 850).all()
    assert df['target'].isin([0, 1]).all()


def test_data_distribution():
    """Test data distribution"""
    df = pd.read_csv('data/raw/train.csv')

    # Check class balance
    target_dist = df['target'].value_counts(normalize=True)
    assert target_dist.min() > 0.01  # At least 1% of each class

    # Check for outliers
    for col in ['age', 'income']:
        q1, q3 = df[col].quantile([0.25, 0.75])
        iqr = q3 - q1
        outliers = ((df[col] < q1 - 3*iqr) | (df[col] > q3 + 3*iqr)).sum()
        assert outliers / len(df) < 0.05  # < 5% outliers


def test_data_with_great_expectations():
    """Test with Great Expectations"""
    df = pd.read_csv('data/raw/train.csv')
    ge_df = PandasDataset(df)

    # Expectations
    assert ge_df.expect_column_to_exist('age').success
    assert ge_df.expect_column_values_to_be_between('age', 18, 100).success
    assert ge_df.expect_column_values_to_not_be_null('target').success
    assert ge_df.expect_column_values_to_be_in_set('target', [0, 1]).success
```

### 3. Model Tests

```python
# tests/unit/test_model.py
import pytest
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier


@pytest.fixture
def trained_model():
    """Fixture for trained model"""
    return joblib.load('models/production/model.pkl')


def test_model_loaded(trained_model):
    """Test model loads correctly"""
    assert trained_model is not None
    assert isinstance(trained_model, RandomForestClassifier)


def test_model_prediction_shape(trained_model):
    """Test prediction shape"""
    X = np.array([[25, 50000, 720, 25000]])
    prediction = trained_model.predict(X)

    assert prediction.shape == (1,)
    assert prediction[0] in [0, 1]


def test_model_probability_shape(trained_model):
    """Test probability shape"""
    X = np.array([[25, 50000, 720, 25000]])
    proba = trained_model.predict_proba(X)

    assert proba.shape == (1, 2)
    assert np.isclose(proba.sum(axis=1), 1.0)


def test_model_performance_threshold(trained_model):
    """Test model performance on test set"""
    from sklearn.metrics import accuracy_score

    X_test = np.load('tests/fixtures/X_test.npy')
    y_test = np.load('tests/fixtures/y_test.npy')

    y_pred = trained_model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    assert accuracy >= 0.85, f"Model accuracy {accuracy:.4f} below threshold 0.85"


def test_model_inference_time(trained_model):
    """Test inference time"""
    import time

    X = np.array([[25, 50000, 720, 25000]])

    start = time.time()
    _ = trained_model.predict(X)
    inference_time = time.time() - start

    assert inference_time < 0.1, f"Inference time {inference_time:.4f}s too slow"


def test_model_handles_edge_cases(trained_model):
    """Test model with edge case inputs"""
    # Minimum values
    X_min = np.array([[18, 0, 300, 1000]])
    pred_min = trained_model.predict(X_min)
    assert pred_min[0] in [0, 1]

    # Maximum values
    X_max = np.array([[100, 1000000, 850, 100000]])
    pred_max = trained_model.predict(X_max)
    assert pred_max[0] in [0, 1]
```

### 4. Integration Tests

```python
# tests/integration/test_api.py
import pytest
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)


def test_health_endpoint():
    """Test health check"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()['status'] == 'healthy'


def test_predict_endpoint():
    """Test prediction endpoint"""
    response = client.post(
        "/predict",
        json={'features': [25, 50000, 720, 25000]}
    )

    assert response.status_code == 200
    data = response.json()
    assert 'prediction' in data
    assert 'probability' in data
    assert data['prediction'] in [0, 1]


def test_predict_validation():
    """Test input validation"""
    # Invalid input (too few features)
    response = client.post(
        "/predict",
        json={'features': [25, 50000]}
    )
    assert response.status_code in [400, 422]

    # Invalid input (wrong type)
    response = client.post(
        "/predict",
        json={'features': ['invalid', 'data']}
    )
    assert response.status_code in [400, 422]


def test_predict_performance():
    """Test API performance"""
    import time

    start = time.time()
    response = client.post(
        "/predict",
        json={'features': [25, 50000, 720, 25000]}
    )
    latency = time.time() - start

    assert response.status_code == 200
    assert latency < 1.0, f"API latency {latency:.4f}s too high"


def test_batch_predict():
    """Test batch prediction"""
    response = client.post(
        "/batch_predict",
        json={
            'features': [
                [25, 50000, 720, 25000],
                [35, 75000, 680, 30000]
            ]
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data['predictions']) == 2
```

### 5. Load Tests

```python
# tests/load/locustfile.py
from locust import HttpUser, task, between


class MLAPIUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def predict(self):
        """Test prediction endpoint"""
        self.client.post(
            "/predict",
            json={'features': [25, 50000, 720, 25000]}
        )

    @task(1)
    def health(self):
        """Test health endpoint"""
        self.client.get("/health")


# Run: locust -f tests/load/locustfile.py --host http://localhost:8000
```

---

## Security Best Practices

### 1. Authentication & Authorization

```python
# auth.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

app = FastAPI()
security = HTTPBearer()

SECRET_KEY = "your-secret-key"  # Store in environment variable!


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


@app.post("/predict")
def predict(features: list, token_payload: dict = Depends(verify_token)):
    """Protected prediction endpoint"""
    user_id = token_payload.get('user_id')

    # Log user access
    logger.info(f"User {user_id} made prediction")

    # Predict
    prediction = model.predict([features])

    return {'prediction': int(prediction[0])}
```

### 2. Rate Limiting

```python
# rate_limiting.py
from fastapi import FastAPI, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.post("/predict")
@limiter.limit("100/minute")
def predict(request: Request, features: list):
    """Rate-limited prediction endpoint"""
    prediction = model.predict([features])
    return {'prediction': int(prediction[0])}
```

### 3. Input Sanitization

```python
# input_validation.py
from pydantic import BaseModel, validator, Field
from typing import List


class PredictionRequest(BaseModel):
    features: List[float] = Field(..., min_items=4, max_items=4)

    @validator('features')
    def validate_features(cls, v):
        """Validate feature values"""
        # Age
        if not (18 <= v[0] <= 100):
            raise ValueError('Age must be between 18 and 100')

        # Income
        if not (0 <= v[1] <= 10000000):
            raise ValueError('Income must be between 0 and 10M')

        # Credit score
        if not (300 <= v[2] <= 850):
            raise ValueError('Credit score must be between 300 and 850')

        # Loan amount
        if not (1000 <= v[3] <= 1000000):
            raise ValueError('Loan amount must be between 1K and 1M')

        return v


@app.post("/predict")
def predict(request: PredictionRequest):
    """Prediction with validated input"""
    prediction = model.predict([request.features])
    return {'prediction': int(prediction[0])}
```

### 4. Secrets Management

```python
# secrets_management.py
import os
from boto3 import client


def get_secret(secret_name):
    """Get secret from AWS Secrets Manager"""
    secrets_client = client('secretsmanager')

    try:
        response = secrets_client.get_secret_value(SecretId=secret_name)
        return response['SecretString']
    except Exception as e:
        logger.error(f"Failed to get secret: {e}")
        raise


# Usage
# ❌ BAD
API_KEY = "hardcoded-api-key"

# ✅ GOOD
API_KEY = get_secret("ml-api-key")

# Or use environment variables
API_KEY = os.getenv("API_KEY")
```

---

## Performance Optimization

### 1. Model Optimization

```python
# model_optimization.py

# 1. Model Quantization (PyTorch)
import torch

model = torch.load('model.pth')
quantized_model = torch.quantization.quantize_dynamic(
    model,
    {torch.nn.Linear},
    dtype=torch.qint8
)

# 2. ONNX Conversion
import torch.onnx

dummy_input = torch.randn(1, 10)
torch.onnx.export(
    model,
    dummy_input,
    "model.onnx",
    input_names=['input'],
    output_names=['output']
)

# 3. TensorFlow Lite
import tensorflow as tf

converter = tf.lite.TFLiteConverter.from_saved_model('saved_model')
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

# 4. Model Pruning (reduce size)
import tensorflow as tf
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

### 2. Caching

```python
# caching.py
import redis
import json
import hashlib

redis_client = redis.Redis(host='localhost', port=6379)


def hash_features(features):
    """Create hash of features"""
    return hashlib.md5(json.dumps(features, sort_keys=True).encode()).hexdigest()


def predict_with_cache(features):
    """Prediction with Redis caching"""
    cache_key = f"pred:{hash_features(features)}"

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

### 3. Batch Processing

```python
# batch_processing.py
import asyncio
from collections import deque
from typing import List


class BatchPredictor:
    """Batch predictions for better throughput"""

    def __init__(self, model, batch_size=32, max_wait_ms=100):
        self.model = model
        self.batch_size = batch_size
        self.max_wait_ms = max_wait_ms
        self.queue = deque()
        self.results = {}

    async def predict(self, request_id: str, features: List[float]):
        """Add request to batch queue"""
        future = asyncio.Future()
        self.queue.append((request_id, features, future))

        # Process batch if full
        if len(self.queue) >= self.batch_size:
            await self._process_batch()

        # Wait for result
        return await future

    async def _process_batch(self):
        """Process queued requests as batch"""
        if not self.queue:
            return

        batch = []
        futures = []

        # Collect batch
        while self.queue and len(batch) < self.batch_size:
            request_id, features, future = self.queue.popleft()
            batch.append(features)
            futures.append((request_id, future))

        # Predict batch
        predictions = self.model.predict(batch)

        # Set results
        for (request_id, future), pred in zip(futures, predictions):
            future.set_result({'prediction': int(pred)})


# Usage
batch_predictor = BatchPredictor(model)

@app.post("/predict_batch")
async def predict_batch(request_id: str, features: List[float]):
    result = await batch_predictor.predict(request_id, features)
    return result
```

---

## Troubleshooting Guide

### Common Issues

#### 1. Model Prediction Errors

```
Problem: Model predictions are wrong/inconsistent

Checklist:
☐ Check feature order (same as training)
☐ Check feature scaling (apply same scaler)
☐ Check missing value handling
☐ Check categorical encoding (same mapping)
☐ Verify model version loaded correctly
☐ Check for data type mismatches

Solution:
```

```python
# Save preprocessing metadata with model
import joblib

metadata = {
    'feature_names': ['age', 'income', 'credit_score', 'loan_amount'],
    'scaler': scaler,
    'encoders': encoders
}

joblib.dump({
    'model': model,
    'metadata': metadata
}, 'model_with_metadata.pkl')

# Load and use
loaded = joblib.load('model_with_metadata.pkl')
model = loaded['model']
metadata = loaded['metadata']

# Ensure correct preprocessing
features = preprocess(raw_features, metadata['scaler'], metadata['encoders'])
prediction = model.predict(features)
```

#### 2. High Latency

```
Problem: API response time is slow (>1s)

Debug steps:
1. Profile code to find bottleneck
2. Check model loading (should be once at startup)
3. Check if using GPU when available
4. Monitor resource usage

Solutions:
```

```python
# Profile endpoint
import cProfile
import pstats

profiler = cProfile.Profile()
profiler.enable()

# ... prediction code ...

profiler.disable()
stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(10)

# Common optimizations:
# 1. Use ONNX Runtime
import onnxruntime as ort

session = ort.InferenceSession('model.onnx')
prediction = session.run(None, {'input': features})[0]

# 2. Batch predictions
# 3. Use caching
# 4. Async processing
```

#### 3. Memory Leaks

```
Problem: Memory usage increases over time

Debug:
```

```python
# Monitor memory
import psutil
import os

process = psutil.Process(os.getpid())

@app.middleware("http")
async def log_memory(request, call_next):
    memory_before = process.memory_info().rss / 1024 / 1024  # MB
    response = await call_next(request)
    memory_after = process.memory_info().rss / 1024 / 1024
    print(f"Memory: {memory_before:.2f} MB -> {memory_after:.2f} MB")
    return response

# Common causes:
# 1. Not closing file handles
# 2. Growing in-memory cache
# 3. TensorFlow/PyTorch not releasing memory

# Solutions:
# 1. Use context managers
with open('file.txt') as f:
    data = f.read()

# 2. Limit cache size
from functools import lru_cache
@lru_cache(maxsize=1000)
def cached_function():
    pass

# 3. Clear TF/PyTorch cache
import torch
torch.cuda.empty_cache()
```

#### 4. Model Drift

```
Problem: Model performance degrading over time

Detection:
```

```python
# Monitor performance metrics
def check_drift_alert():
    """Check and alert on drift"""
    recent_accuracy = get_recent_accuracy(days=7)
    baseline_accuracy = 0.92

    if recent_accuracy < baseline_accuracy - 0.05:
        send_alert(
            f"Model drift detected! "
            f"Accuracy dropped to {recent_accuracy:.4f} "
            f"(baseline: {baseline_accuracy})"
        )

        # Automatic remediation
        trigger_retraining()

# Solutions:
# 1. Retrain model with recent data
# 2. Adjust features
# 3. Switch to more robust model
# 4. Ensemble with multiple models
```

### Debugging Checklist

```
┌──────────────────────────────────────────────────┐
│         Production Debugging Checklist           │
├──────────────────────────────────────────────────┤
│                                                  │
│  □ Check logs (application, system, error)      │
│  □ Check metrics (latency, error rate, CPU)     │
│  □ Check recent deployments (rollback?)         │
│  □ Check data pipeline (data quality issues?)   │
│  □ Check external dependencies (API, DB)        │
│  □ Reproduce locally                             │
│  □ Check resource limits (memory, CPU, GPU)     │
│  □ Check model version in production            │
│  □ Check for data drift                         │
│  □ Compare with previous known-good state       │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Interview Preparation

### Top MLOps Interview Questions

#### 1. Explain your ML deployment process end-to-end.

**Answer structure:**
1. **Development**
   - Train model locally/Jupyter
   - Version with MLflow
   - Evaluate performance

2. **Packaging**
   - Create REST API (Flask/FastAPI)
   - Containerize with Docker
   - Unit and integration tests

3. **CI/CD**
   - GitHub Actions pipeline
   - Automated testing
   - Build Docker image

4. **Deployment**
   - Deploy to staging
   - Canary deployment (10% traffic)
   - Monitor metrics
   - Full rollout

5. **Monitoring**
   - Track performance metrics
   - Detect drift
   - Alert on issues
   - Trigger retraining

---

#### 2. How do you handle model versioning?

**Answer:**
- **Code**: Git
- **Data**: DVC
- **Models**: MLflow Model Registry
- **API**: Multiple endpoints or header-based routing

```python
# Example: Version-based routing
@app.post("/predict")
def predict(request: Request, features: list):
    version = request.headers.get('X-Model-Version', 'v1')

    if version == 'v1':
        model = model_v1
    elif version == 'v2':
        model = model_v2
    else:
        raise HTTPException(400, "Invalid version")

    return {'prediction': model.predict([features])[0]}
```

---

#### 3. How do you ensure model reproducibility?

**Answer:**
1. **Set random seeds**
2. **Version everything** (code, data, model, environment)
3. **Document hyperparameters**
4. **Use DVC pipelines**
5. **Container environment (Docker)**

```python
# Reproducibility setup
import random
import numpy as np
import torch

def set_seeds(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)

set_seeds(42)

# Log everything with MLflow
mlflow.log_params({'seed': 42, 'model': 'RandomForest'})
mlflow.log_artifact('requirements.txt')
```

---

#### 4. How do you handle real-time vs batch inference?

**Answer:**

**Real-time:**
- REST API (Flask/FastAPI)
- Low latency (<100ms)
- Single prediction
- Use case: User-facing apps

**Batch:**
- Scheduled jobs (Airflow)
- High throughput
- Process thousands of rows
- Use case: Daily recommendations

```python
# Batch inference
def batch_inference(input_csv, output_csv):
    df = pd.read_csv(input_csv)
    predictions = model.predict(df)
    df['prediction'] = predictions
    df.to_csv(output_csv)

# Real-time API
@app.post("/predict")
def predict(features: list):
    prediction = model.predict([features])
    return {'prediction': int(prediction[0])}
```

---

#### 5. How do you monitor ML models in production?

**Answer:**
1. **Performance metrics** (accuracy, F1)
2. **System metrics** (latency, error rate)
3. **Data drift detection**
4. **Business metrics** (conversion, revenue)
5. **Alerting** (Prometheus, PagerDuty)

```python
# Monitoring example
from prometheus_client import Counter, Histogram

predictions = Counter('predictions_total', 'Total predictions')
latency = Histogram('prediction_latency_seconds', 'Latency')

@app.post("/predict")
def predict(features: list):
    with latency.time():
        prediction = model.predict([features])
        predictions.inc()
        return {'prediction': int(prediction[0])}
```

---

### Quick Reference Card

```
┌──────────────────────────────────────────────────┐
│         MLOps Quick Reference                    │
├──────────────────────────────────────────────────┤
│                                                  │
│  Version Control:                                │
│    git, dvc, mlflow                             │
│                                                  │
│  Containerization:                               │
│    docker build -t model:v1 .                   │
│    docker run -p 8000:8000 model:v1            │
│                                                  │
│  Orchestration:                                  │
│    kubectl apply -f deployment.yaml             │
│    kubectl scale deployment model --replicas=5  │
│                                                  │
│  API:                                            │
│    uvicorn main:app --host 0.0.0.0 --port 8000 │
│                                                  │
│  Testing:                                        │
│    pytest tests/                                 │
│    locust -f loadtest.py                        │
│                                                  │
│  Monitoring:                                     │
│    prometheus, grafana                           │
│                                                  │
│  CI/CD:                                          │
│    GitHub Actions, GitLab CI                     │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

**Congratulations!** You've completed the MLOps revision notes. These notes cover everything from version control to production deployment, monitoring, and best practices.

---

[← Back to Monitoring & Pipelines](./monitoring-pipelines.md) | [Back to Main](./README.md)
