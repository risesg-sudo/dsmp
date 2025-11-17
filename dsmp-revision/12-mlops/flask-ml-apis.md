# Flask for ML APIs

## What You'll Learn

Flask is a lightweight web framework that's perfect for quickly building ML APIs. This guide shows you how to create production-ready ML APIs with Flask, from basic endpoints to advanced patterns with validation, logging, and production deployment. You'll understand when Flask is the right choice and how to avoid common mistakes.

## Why Flask for ML?

Flask excels at simplicity and flexibility. It's the go-to choice when you need to quickly prototype an ML API or when your team is already familiar with Flask. While not as performant as FastAPI, Flask's maturity and extensive ecosystem make it reliable for many production use cases.

## Basic Flask API

Let's start with a minimal Flask API that loads a model and serves predictions:

```python
# app.py
from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load model at startup (not on every request!)
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

## Advanced Flask API with Validation

Production APIs need robust validation and error handling. Here's an enhanced version:

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

## Production Deployment with Gunicorn

Never use Flask's built-in server in production. Use Gunicorn for better performance and reliability:

```python
# wsgi.py
from app import app

if __name__ == "__main__":
    app.run()
```

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn (4 worker processes)
gunicorn --workers 4 --bind 0.0.0.0:8000 --timeout 120 wsgi:app

# With auto-reload for development
gunicorn --workers 4 --bind 0.0.0.0:8000 --reload wsgi:app
```

## Testing Your Flask API

Always test your API thoroughly before deployment:

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

## When to Use Flask

**Choose Flask when:**
- Building a quick prototype
- Your team knows Flask well
- You have simple synchronous workloads
- You need extensive plugin support
- Performance isn't critical (< 10k requests/sec)

**Avoid Flask when:**
- You need async/await support
- You want automatic request validation
- You need very high performance (> 25k requests/sec)
- You want auto-generated API documentation

## Best Practices

1. **Load model once at startup**, not on every request
2. **Always validate inputs** before making predictions
3. **Use proper error handling** with try-except blocks
4. **Log important events** for debugging and monitoring
5. **Use Gunicorn** for production deployment
6. **Set appropriate timeouts** to prevent hanging requests
7. **Include health check endpoints** for monitoring

## Common Pitfalls

**Loading model on every request:**
```python
# WRONG - Very slow!
@app.route('/predict')
def predict():
    model = joblib.load('model.pkl')  # Don't do this!
    return model.predict(features)

# RIGHT - Load once at startup
model = joblib.load('model.pkl')

@app.route('/predict')
def predict():
    return model.predict(features)
```

**Not validating inputs:**
```python
# WRONG - No validation
@app.route('/predict')
def predict():
    features = request.json['features']
    return model.predict([features])

# RIGHT - Validate first
@app.route('/predict')
def predict():
    features = request.json.get('features')
    if not features or not isinstance(features, list):
        return {'error': 'Invalid input'}, 400
    return model.predict([features])
```

## Quick Reference

```bash
# Start Flask development server
flask run --host 0.0.0.0 --port 8000

# Start with Gunicorn (production)
gunicorn --workers 4 --bind 0.0.0.0:8000 wsgi:app

# Test API
curl http://localhost:8000/health
curl -X POST http://localhost:8000/predict -H "Content-Type: application/json" -d '{"features": [35, 50000, 720, 25000]}'
```

## Summary

Flask provides a straightforward way to build ML APIs with minimal boilerplate. Its simplicity makes it ideal for prototypes and small-to-medium production systems. However, for high-performance requirements or when you need automatic validation and documentation, consider FastAPI instead. Always use Gunicorn in production, validate your inputs, and implement proper error handling to create robust ML APIs.

---

**Related Topics:**
- [FastAPI ML APIs](./fastapi-ml-apis.md)
- [Deployment Fundamentals](./deployment-fundamentals.md)
- [Deployment Best Practices](./deployment-best-practices.md)
