# Logging and Observability

## What You'll Learn

Good logging transforms debugging from guesswork to science. This guide covers structured logging, comprehensive request tracking, and integration with observability platforms like ELK Stack. You'll learn to create logging systems that help you understand what's happening in production and quickly diagnose issues.

## Why Structured Logging Matters

Traditional print statements or simple logs don't scale in production. Structured logging uses JSON format to make logs machine-readable, searchable, and analyzable at scale.

**Traditional logging:**
```
2024-01-15 10:30:45 - Prediction made for user 123
```

**Structured logging:**
```json
{
  "timestamp": "2024-01-15T10:30:45Z",
  "level": "INFO",
  "message": "Prediction made",
  "user_id": 123,
  "prediction": 1,
  "confidence": 0.89,
  "latency_ms": 45.2,
  "model_version": "v2.1"
}
```

The structured version is searchable, filterable, and aggregatable.

## Structured Logging Implementation

### JSON Formatter

Create a custom JSON formatter for Python's logging module:

```python
# structured_logging.py
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    """Format logs as JSON for better parsing"""

    def format(self, record):
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }

        # Add custom fields from extra parameter
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        if hasattr(record, 'prediction'):
            log_data['prediction'] = record.prediction
        if hasattr(record, 'latency'):
            log_data['latency_ms'] = record.latency
        if hasattr(record, 'model_version'):
            log_data['model_version'] = record.model_version

        # Add exception info if present
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)

        return json.dumps(log_data)

# Setup logger
logger = logging.getLogger('ml_api')
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Usage
logger.info('Prediction made', extra={
    'user_id': 123,
    'prediction': 1,
    'latency': 45.2,
    'model_version': 'v2.1'
})
```

## Comprehensive Request Logging

Track the entire lifecycle of each request:

```python
# comprehensive_logging.py
from fastapi import FastAPI, Request
import logging
import time
import uuid

app = FastAPI()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests with unique request ID"""
    request_id = str(uuid.uuid4())
    start_time = time.time()

    # Log request start
    logger.info(
        f"Request started: {request.method} {request.url.path}",
        extra={
            'request_id': request_id,
            'method': request.method,
            'path': request.url.path,
            'client_ip': request.client.host
        }
    )

    # Process request
    response = await call_next(request)

    # Log request completion
    duration = time.time() - start_time
    logger.info(
        f"Request completed: {response.status_code}",
        extra={
            'request_id': request_id,
            'status_code': response.status_code,
            'duration_ms': duration * 1000
        }
    )

    # Add request ID to response headers
    response.headers['X-Request-ID'] = request_id

    return response

@app.post("/predict")
def predict(features: list):
    """Prediction with detailed logging"""
    start_time = time.time()

    try:
        # Log input (be careful with PII!)
        logger.debug(f"Input features: {len(features)} values")

        # Validate
        if len(features) != 4:
            logger.warning(f"Invalid input length: {len(features)}")
            return {'error': 'Invalid input'}, 400

        # Predict
        prediction = model.predict([features])
        probability = model.predict_proba([features])[0]

        # Calculate latency
        latency_ms = (time.time() - start_time) * 1000

        # Log prediction
        logger.info('Prediction successful', extra={
            'prediction': int(prediction[0]),
            'confidence': float(max(probability)),
            'latency_ms': latency_ms
        })

        return {
            'prediction': int(prediction[0]),
            'confidence': float(max(probability))
        }

    except Exception as e:
        logger.error(
            f"Prediction failed: {str(e)}",
            exc_info=True,  # Include stack trace
            extra={'input_length': len(features)}
        )
        return {'error': 'Internal error'}, 500
```

## Log Levels and When to Use Them

Use appropriate log levels for different situations:

```python
# DEBUG: Detailed diagnostic information
logger.debug(f"Features: {features}")
logger.debug(f"Model input shape: {input_array.shape}")

# INFO: General informational messages
logger.info(f"Prediction made: {prediction}")
logger.info(f"Model loaded: {model_path}")

# WARNING: Something unexpected but handled
logger.warning(f"Feature out of range: {feature_value}")
logger.warning(f"Using default value for missing feature")

# ERROR: Error occurred, but application continues
logger.error(f"Prediction failed: {error}")
logger.error(f"Database connection failed, using cache")

# CRITICAL: Severe error, application may stop
logger.critical(f"Model file not found: {model_path}")
logger.critical(f"Out of memory, cannot load model")
```

## ELK Stack Integration

Send logs to Elasticsearch for centralized logging and analysis:

```python
# elk_logging.py
import logging
from datetime import datetime
import json

class ElasticsearchHandler(logging.Handler):
    """Send logs to Elasticsearch"""

    def __init__(self, es_client, index_name='ml-logs'):
        super().__init__()
        self.es_client = es_client
        self.index_name = index_name

    def emit(self, record):
        """Send log record to Elasticsearch"""
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'message': record.getMessage(),
            'logger': record.name,
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }

        # Add custom fields
        if hasattr(record, 'prediction'):
            log_entry['prediction'] = record.prediction
        if hasattr(record, 'latency'):
            log_entry['latency_ms'] = record.latency
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = record.user_id

        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.format_exception(record.exc_info)

        try:
            # Index to daily index
            index = f"{self.index_name}-{datetime.utcnow().strftime('%Y.%m.%d')}"
            self.es_client.index(
                index=index,
                document=log_entry
            )
        except Exception as e:
            print(f"Failed to send log to Elasticsearch: {e}")

# Usage
from elasticsearch import Elasticsearch

es = Elasticsearch(['http://localhost:9200'])
logger = logging.getLogger('ml_api')
logger.addHandler(ElasticsearchHandler(es))
logger.setLevel(logging.INFO)

logger.info('Prediction made', extra={
    'prediction': 1,
    'latency': 45.2,
    'user_id': 123
})
```

## Correlation IDs for Tracing

Track requests across multiple services:

```python
from fastapi import FastAPI, Request
import uuid

app = FastAPI()

@app.middleware("http")
async def add_correlation_id(request: Request, call_next):
    """Add correlation ID to trace requests across services"""
    # Get or generate correlation ID
    correlation_id = request.headers.get('X-Correlation-ID', str(uuid.uuid4()))

    # Store in request state
    request.state.correlation_id = correlation_id

    # Add to all logs
    logger = logging.LoggerAdapter(
        logging.getLogger(__name__),
        {'correlation_id': correlation_id}
    )

    # Process request
    response = await call_next(request)

    # Add to response
    response.headers['X-Correlation-ID'] = correlation_id

    return response

@app.post("/predict")
def predict(request: Request, features: list):
    """Use correlation ID in logs"""
    correlation_id = request.state.correlation_id

    logger.info(
        'Processing prediction',
        extra={'correlation_id': correlation_id}
    )

    # ... prediction logic ...

    return {'prediction': result}
```

## What to Log

### Essential Information

```python
# Request information
logger.info('Request received', extra={
    'method': 'POST',
    'path': '/predict',
    'client_ip': '192.168.1.1',
    'request_id': 'abc-123'
})

# Prediction details
logger.info('Prediction made', extra={
    'prediction': 1,
    'confidence': 0.89,
    'latency_ms': 45.2,
    'model_version': 'v2.1'
})

# Errors
logger.error('Prediction failed', extra={
    'error_type': 'ValueError',
    'error_message': str(e),
    'input_length': len(features)
}, exc_info=True)

# Performance metrics
logger.info('Performance metrics', extra={
    'latency_p95': 120.5,
    'requests_per_second': 1234,
    'error_rate': 0.02
})
```

### Avoid Logging

1. **Sensitive data** (PII, passwords, tokens)
2. **Full feature vectors** (log counts/stats instead)
3. **Every single prediction** (sample or aggregate)
4. **Entire model objects** (log version/path only)

## Best Practices

1. **Use structured logging** (JSON) for production
2. **Include context** (request IDs, user IDs)
3. **Log at appropriate levels** (DEBUG, INFO, WARNING, ERROR)
4. **Sanitize sensitive data** before logging
5. **Use correlation IDs** for distributed tracing
6. **Set up log rotation** to manage disk space
7. **Send to centralized system** (ELK, Splunk)
8. **Create alerts** on error patterns

## Common Pitfalls

**Logging too much:**
```python
# WRONG - Logs every prediction (millions per day)
for features in dataset:
    prediction = model.predict([features])
    logger.info(f"Prediction: {prediction}")

# RIGHT - Sample or aggregate
if random.random() < 0.01:  # 1% sampling
    logger.info(f"Sample prediction: {prediction}")
```

**Logging sensitive data:**
```python
# WRONG - Logging PII
logger.info(f"User: {user_email}, SSN: {ssn}")

# RIGHT - Log IDs only
logger.info(f"User ID: {user_id}")
```

**Not using log levels correctly:**
```python
# WRONG - Everything is INFO
logger.info("Starting process")
logger.info("Error occurred!")
logger.info("Debug variable: {x}")

# RIGHT - Appropriate levels
logger.info("Starting process")
logger.error("Error occurred!", exc_info=True)
logger.debug(f"Debug variable: {x}")
```

## Quick Reference

```python
# Setup structured logging
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)

# Log with context
logger.info('Message', extra={'key': 'value'})

# Log exceptions
logger.error('Error', exc_info=True)

# Different levels
logger.debug('Debug info')
logger.info('General info')
logger.warning('Warning')
logger.error('Error')
logger.critical('Critical error')
```

## Summary

Effective logging uses structured JSON format for machine readability, includes contextual information like request IDs and correlation IDs, uses appropriate log levels, and integrates with centralized logging systems like ELK Stack. Avoid logging sensitive data or excessive information. Good logging makes debugging faster, enables better monitoring, and helps you understand system behavior in production.

---

**Related Topics:**
- [Model Monitoring Basics](./model-monitoring-basics.md)
- [Deployment Best Practices](./deployment-best-practices.md)
- [Monitoring Best Practices](./monitoring-best-practices.md)
