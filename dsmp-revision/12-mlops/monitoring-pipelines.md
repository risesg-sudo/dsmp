# Monitoring & ML Pipelines

## 📋 Table of Contents
1. [Model Monitoring](#model-monitoring)
2. [Drift Detection](#drift-detection)
3. [Logging & Observability](#logging--observability)
4. [Apache Airflow for ML](#apache-airflow-for-ml)
5. [Pipeline Orchestration](#pipeline-orchestration)
6. [Best Practices](#best-practices)
7. [Common Pitfalls](#common-pitfalls)
8. [Interview Questions](#interview-questions)

---

## Model Monitoring

### Why Monitor ML Models?

```
┌──────────────────────────────────────────────────┐
│     Model Performance Over Time                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  Accuracy                                        │
│    │                                             │
│0.95│ ████████                                    │
│    │         ████                                │
│0.90│             ██                              │
│    │               █                             │
│0.85│                █                            │
│    │                 █                           │
│0.80│                  ───── Model Drift!         │
│    └──────────────────────────────────▶         │
│     Deploy  Week 1  Week 2  Week 3   Time       │
│                                                  │
│  Causes:                                         │
│  • Data distribution change                     │
│  • Concept drift (target relationship changes)  │
│  • Data quality issues                          │
│  • Seasonal patterns                            │
└──────────────────────────────────────────────────┘
```

### Key Metrics to Monitor

#### 1. Performance Metrics

```python
# monitoring.py
import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from datetime import datetime, timedelta

class ModelMonitor:
    def __init__(self):
        self.predictions = []
        self.ground_truth = []
        self.timestamps = []

    def log_prediction(self, prediction, features, timestamp=None):
        """Log a prediction"""
        self.predictions.append(prediction)
        self.timestamps.append(timestamp or datetime.utcnow())

    def log_ground_truth(self, ground_truth):
        """Log ground truth when available"""
        self.ground_truth.append(ground_truth)

    def calculate_metrics(self, window_days=7):
        """Calculate metrics for recent window"""
        cutoff_time = datetime.utcnow() - timedelta(days=window_days)

        # Filter recent predictions
        recent_indices = [
            i for i, ts in enumerate(self.timestamps)
            if ts >= cutoff_time
        ]

        if not recent_indices:
            return None

        recent_preds = [self.predictions[i] for i in recent_indices]
        recent_truth = [self.ground_truth[i] for i in recent_indices if i < len(self.ground_truth)]

        if len(recent_truth) < len(recent_preds) * 0.1:  # Need at least 10% ground truth
            return None

        # Calculate metrics
        metrics = {
            'accuracy': accuracy_score(recent_truth, recent_preds[:len(recent_truth)]),
            'precision': precision_score(recent_truth, recent_preds[:len(recent_truth)], average='weighted'),
            'recall': recall_score(recent_truth, recent_preds[:len(recent_truth)], average='weighted'),
            'f1_score': f1_score(recent_truth, recent_preds[:len(recent_truth)], average='weighted'),
            'window_days': window_days,
            'num_predictions': len(recent_preds),
            'num_ground_truth': len(recent_truth)
        }

        return metrics

    def check_performance_degradation(self, baseline_accuracy=0.85, threshold=0.05):
        """Alert if performance drops"""
        metrics = self.calculate_metrics()

        if metrics is None:
            return False, "Insufficient data"

        if metrics['accuracy'] < baseline_accuracy - threshold:
            return True, f"Performance degraded! Accuracy: {metrics['accuracy']:.3f} (baseline: {baseline_accuracy})"

        return False, "Performance OK"

# Usage
monitor = ModelMonitor()

# Log predictions
monitor.log_prediction(1, [35, 50000, 720, 25000])

# Later, log ground truth
monitor.log_ground_truth(1)

# Check performance
degraded, message = monitor.check_performance_degradation()
print(message)
```

#### 2. Business Metrics

```python
# business_metrics.py
class BusinessMetricsMonitor:
    def __init__(self):
        self.conversions = []
        self.revenues = []
        self.timestamps = []

    def log_prediction_outcome(self, prediction, converted, revenue=0):
        """Log business outcome of prediction"""
        self.conversions.append({
            'prediction': prediction,
            'converted': converted,
            'revenue': revenue,
            'timestamp': datetime.utcnow()
        })

    def calculate_conversion_rate(self, prediction_class=1):
        """Calculate conversion rate for predictions"""
        filtered = [
            c for c in self.conversions
            if c['prediction'] == prediction_class
        ]

        if not filtered:
            return 0

        converted = sum(1 for c in filtered if c['converted'])
        return converted / len(filtered)

    def calculate_revenue_impact(self):
        """Calculate revenue from model predictions"""
        positive_preds = [
            c for c in self.conversions
            if c['prediction'] == 1
        ]

        total_revenue = sum(c['revenue'] for c in positive_preds)
        avg_revenue = total_revenue / len(positive_preds) if positive_preds else 0

        return {
            'total_revenue': total_revenue,
            'avg_revenue_per_positive_pred': avg_revenue,
            'num_positive_predictions': len(positive_preds)
        }
```

#### 3. System Metrics

```python
# system_metrics.py
from prometheus_client import Counter, Histogram, Gauge, Summary
import time
import psutil

# Define metrics
prediction_requests = Counter('prediction_requests_total', 'Total prediction requests')
prediction_latency = Histogram('prediction_latency_seconds', 'Prediction latency', buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 5.0])
active_requests = Gauge('active_prediction_requests', 'Number of active requests')
model_memory_usage = Gauge('model_memory_mb', 'Model memory usage in MB')
prediction_errors = Counter('prediction_errors_total', 'Total prediction errors')

def monitor_prediction(func):
    """Decorator to monitor predictions"""
    def wrapper(*args, **kwargs):
        prediction_requests.inc()
        active_requests.inc()
        start_time = time.time()

        try:
            result = func(*args, **kwargs)
            latency = time.time() - start_time
            prediction_latency.observe(latency)
            return result
        except Exception as e:
            prediction_errors.inc()
            raise
        finally:
            active_requests.dec()

    return wrapper

@monitor_prediction
def predict(features):
    """Monitored prediction function"""
    return model.predict([features])

# Memory monitoring
def update_memory_metrics():
    """Update memory usage metrics"""
    process = psutil.Process()
    memory_mb = process.memory_info().rss / 1024 / 1024
    model_memory_usage.set(memory_mb)
```

---

## Drift Detection

### Types of Drift

```
┌──────────────────────────────────────────────────┐
│              Types of Drift                      │
├──────────────────────────────────────────────────┤
│                                                  │
│  1. Data Drift (Covariate Shift)               │
│     Input distribution changes                   │
│     P(X) changes, but P(Y|X) same              │
│                                                  │
│     Example: Age distribution shifts            │
│     Training: 25-45 years old                   │
│     Production: 18-25 years old                 │
│                                                  │
│  2. Concept Drift                               │
│     Relationship between X and Y changes        │
│     P(Y|X) changes                              │
│                                                  │
│     Example: Credit scoring                      │
│     Economic crisis → creditworthiness changes  │
│                                                  │
│  3. Label Drift (Prior Shift)                  │
│     Output distribution changes                  │
│     P(Y) changes                                │
│                                                  │
│     Example: Fraud rate increases               │
│     Training: 1% fraud                          │
│     Production: 5% fraud                        │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Data Drift Detection

#### Statistical Tests

```python
# drift_detection.py
import numpy as np
from scipy import stats
from sklearn.model_selection import train_test_split

class DriftDetector:
    def __init__(self, reference_data):
        """
        Args:
            reference_data: Training data or baseline data
        """
        self.reference_data = reference_data
        self.reference_stats = self._calculate_statistics(reference_data)

    def _calculate_statistics(self, data):
        """Calculate statistics for data"""
        return {
            'mean': np.mean(data, axis=0),
            'std': np.std(data, axis=0),
            'min': np.min(data, axis=0),
            'max': np.max(data, axis=0)
        }

    def kolmogorov_smirnov_test(self, production_data, feature_idx, alpha=0.05):
        """
        KS test for detecting distribution shift

        Returns:
            drift_detected: bool
            p_value: float
        """
        ref_feature = self.reference_data[:, feature_idx]
        prod_feature = production_data[:, feature_idx]

        statistic, p_value = stats.ks_2samp(ref_feature, prod_feature)

        drift_detected = p_value < alpha

        return drift_detected, p_value

    def population_stability_index(self, production_data, feature_idx, bins=10):
        """
        PSI (Population Stability Index) for drift detection

        PSI < 0.1: No significant drift
        0.1 <= PSI < 0.2: Moderate drift
        PSI >= 0.2: Significant drift
        """
        ref_feature = self.reference_data[:, feature_idx]
        prod_feature = production_data[:, feature_idx]

        # Create bins
        min_val = min(ref_feature.min(), prod_feature.min())
        max_val = max(ref_feature.max(), prod_feature.max())
        bin_edges = np.linspace(min_val, max_val, bins + 1)

        # Calculate distributions
        ref_hist, _ = np.histogram(ref_feature, bins=bin_edges)
        prod_hist, _ = np.histogram(prod_feature, bins=bin_edges)

        # Normalize
        ref_dist = ref_hist / len(ref_feature)
        prod_dist = prod_hist / len(prod_feature)

        # Avoid division by zero
        ref_dist = np.where(ref_dist == 0, 0.0001, ref_dist)
        prod_dist = np.where(prod_dist == 0, 0.0001, prod_dist)

        # Calculate PSI
        psi = np.sum((prod_dist - ref_dist) * np.log(prod_dist / ref_dist))

        if psi < 0.1:
            status = "No significant drift"
        elif psi < 0.2:
            status = "Moderate drift"
        else:
            status = "Significant drift"

        return psi, status

    def detect_all_features(self, production_data, method='ks'):
        """Detect drift across all features"""
        num_features = self.reference_data.shape[1]
        results = []

        for i in range(num_features):
            if method == 'ks':
                drift, p_value = self.kolmogorov_smirnov_test(production_data, i)
                results.append({
                    'feature': i,
                    'drift_detected': drift,
                    'p_value': p_value
                })
            elif method == 'psi':
                psi, status = self.population_stability_index(production_data, i)
                results.append({
                    'feature': i,
                    'psi': psi,
                    'status': status
                })

        return results

# Usage
# Training data
X_train = np.random.randn(1000, 4)

# Production data (with drift in feature 0)
X_production = np.random.randn(500, 4)
X_production[:, 0] += 2  # Shift feature 0

# Detect drift
detector = DriftDetector(X_train)
results = detector.detect_all_features(X_production, method='ks')

for result in results:
    print(f"Feature {result['feature']}: Drift={result['drift_detected']}, p-value={result['p_value']:.4f}")

# PSI
psi_results = detector.detect_all_features(X_production, method='psi')
for result in psi_results:
    print(f"Feature {result['feature']}: PSI={result['psi']:.4f}, Status={result['status']}")
```

#### Model-Based Drift Detection

```python
# model_drift_detection.py
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score

class ModelBasedDriftDetector:
    """
    Train a classifier to distinguish training data from production data.
    High accuracy indicates drift.
    """

    def __init__(self):
        self.classifier = RandomForestClassifier(n_estimators=100, random_state=42)

    def detect_drift(self, reference_data, production_data):
        """
        Detect drift using classifier approach

        Returns:
            drift_detected: bool
            auc_score: float
        """
        # Label data (0 = reference, 1 = production)
        reference_labels = np.zeros(len(reference_data))
        production_labels = np.ones(len(production_data))

        # Combine data
        X = np.vstack([reference_data, production_data])
        y = np.concatenate([reference_labels, production_labels])

        # Split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.3, random_state=42
        )

        # Train classifier
        self.classifier.fit(X_train, y_train)

        # Predict
        y_pred_proba = self.classifier.predict_proba(X_test)[:, 1]

        # Calculate AUC
        auc = roc_auc_score(y_test, y_pred_proba)

        # If AUC > 0.6, significant drift
        drift_detected = auc > 0.6

        return drift_detected, auc

# Usage
detector = ModelBasedDriftDetector()
drift, auc = detector.detect_drift(X_train, X_production)
print(f"Drift detected: {drift}, AUC: {auc:.4f}")
```

### Prediction Drift Detection

```python
# prediction_drift.py
class PredictionDriftDetector:
    def __init__(self, baseline_distribution):
        """
        Args:
            baseline_distribution: Dict with prediction class distributions
                Example: {0: 0.8, 1: 0.2}
        """
        self.baseline = baseline_distribution

    def detect_prediction_drift(self, recent_predictions, threshold=0.1):
        """
        Detect if prediction distribution has drifted

        Args:
            recent_predictions: List of recent predictions
            threshold: Maximum allowed difference in distribution
        """
        # Calculate current distribution
        unique, counts = np.unique(recent_predictions, return_counts=True)
        current_dist = dict(zip(unique, counts / len(recent_predictions)))

        # Calculate drift for each class
        drift_detected = False
        drift_info = {}

        for class_label, baseline_prob in self.baseline.items():
            current_prob = current_dist.get(class_label, 0)
            diff = abs(current_prob - baseline_prob)

            drift_info[class_label] = {
                'baseline': baseline_prob,
                'current': current_prob,
                'difference': diff
            }

            if diff > threshold:
                drift_detected = True

        return drift_detected, drift_info

# Usage
baseline = {0: 0.85, 1: 0.15}
detector = PredictionDriftDetector(baseline)

# Recent predictions
recent_preds = [0] * 650 + [1] * 350  # 65% class 0, 35% class 1 (drifted!)

drift, info = detector.detect_prediction_drift(recent_preds)
print(f"Drift detected: {drift}")
print(f"Drift info: {info}")
```

---

## Logging & Observability

### Structured Logging

```python
# structured_logging.py
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    """Format logs as JSON"""

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

        # Add extra fields
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        if hasattr(record, 'prediction'):
            log_data['prediction'] = record.prediction
        if hasattr(record, 'latency'):
            log_data['latency_ms'] = record.latency

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
    'latency': 45.2
})
```

### Comprehensive Logging Example

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
    """Log all requests"""
    request_id = str(uuid.uuid4())
    start_time = time.time()

    # Log request
    logger.info(f"Request started: {request.method} {request.url.path}", extra={
        'request_id': request_id,
        'method': request.method,
        'path': request.url.path,
        'client_ip': request.client.host
    })

    # Process request
    response = await call_next(request)

    # Log response
    duration = time.time() - start_time
    logger.info(f"Request completed: {response.status_code}", extra={
        'request_id': request_id,
        'status_code': response.status_code,
        'duration_ms': duration * 1000
    })

    return response

@app.post("/predict")
def predict(features: list):
    """Prediction with detailed logging"""
    start_time = time.time()

    try:
        # Log input
        logger.debug(f"Input features: {features}")

        # Validate
        if len(features) != 4:
            logger.warning(f"Invalid input length: {len(features)}")
            return {'error': 'Invalid input'}, 400

        # Predict
        prediction = model.predict([features])
        probability = model.predict_proba([features])[0]

        # Log prediction
        logger.info('Prediction successful', extra={
            'prediction': int(prediction[0]),
            'confidence': float(max(probability)),
            'latency_ms': (time.time() - start_time) * 1000
        })

        return {
            'prediction': int(prediction[0]),
            'confidence': float(max(probability))
        }

    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}", exc_info=True)
        return {'error': 'Internal error'}, 500
```

### ELK Stack Integration

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
            'function': record.funcName
        }

        # Add extra fields
        if hasattr(record, 'prediction'):
            log_entry['prediction'] = record.prediction
        if hasattr(record, 'latency'):
            log_entry['latency_ms'] = record.latency

        try:
            self.es_client.index(
                index=f"{self.index_name}-{datetime.utcnow().strftime('%Y.%m.%d')}",
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
    'latency': 45.2
})
```

---

## Apache Airflow for ML

### Why Airflow for ML Pipelines?

```
┌──────────────────────────────────────────────────┐
│         ML Pipeline Challenges                   │
├──────────────────────────────────────────────────┤
│                                                  │
│  • Multiple dependent steps                     │
│  • Different execution environments             │
│  • Scheduled retraining                         │
│  • Error handling & retries                     │
│  • Monitoring & alerts                          │
│  • Resource management                          │
│                                                  │
│  Airflow provides:                              │
│  ✓ DAG-based workflow                           │
│  ✓ Scheduling                                   │
│  ✓ Monitoring UI                                │
│  ✓ Retry logic                                  │
│  ✓ Dependency management                        │
└──────────────────────────────────────────────────┘
```

### Basic Airflow DAG

```python
# dags/ml_training_pipeline.py
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-science',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email': ['alerts@example.com'],
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5)
}

dag = DAG(
    'ml_training_pipeline',
    default_args=default_args,
    description='Train ML model daily',
    schedule_interval='0 2 * * *',  # Daily at 2 AM
    catchup=False,
    tags=['ml', 'training']
)

def extract_data(**context):
    """Extract data from database"""
    import pandas as pd
    from sqlalchemy import create_engine

    engine = create_engine('postgresql://user:pass@localhost/db')
    query = """
        SELECT * FROM customers
        WHERE date >= CURRENT_DATE - INTERVAL '30 days'
    """
    df = pd.read_csv(query, con=engine)

    # Save to local file
    df.to_csv('/tmp/raw_data.csv', index=False)

    # Push metadata to XCom
    context['task_instance'].xcom_push(key='data_path', value='/tmp/raw_data.csv')
    context['task_instance'].xcom_push(key='num_rows', value=len(df))

def preprocess_data(**context):
    """Preprocess data"""
    import pandas as pd
    from sklearn.preprocessing import StandardScaler

    # Pull data path from XCom
    data_path = context['task_instance'].xcom_pull(key='data_path')

    df = pd.read_csv(data_path)

    # Preprocessing
    df = df.dropna()
    df = df.drop_duplicates()

    # Feature engineering
    df['age_income_ratio'] = df['age'] / df['income']

    # Save processed data
    df.to_csv('/tmp/processed_data.csv', index=False)

    context['task_instance'].xcom_push(key='processed_data_path', value='/tmp/processed_data.csv')

def train_model(**context):
    """Train model"""
    import pandas as pd
    import joblib
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score

    # Load data
    data_path = context['task_instance'].xcom_pull(key='processed_data_path')
    df = pd.read_csv(data_path)

    # Split features and target
    X = df.drop('target', axis=1)
    y = df['target']

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Train model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate
    accuracy = model.score(X_test, y_test)

    # Save model
    model_path = f'/tmp/model_{datetime.now().strftime("%Y%m%d")}.pkl'
    joblib.dump(model, model_path)

    # Log metrics
    context['task_instance'].xcom_push(key='accuracy', value=accuracy)
    context['task_instance'].xcom_push(key='model_path', value=model_path)

    print(f"Model trained with accuracy: {accuracy:.4f}")

def evaluate_model(**context):
    """Evaluate model and decide if deployment needed"""
    accuracy = context['task_instance'].xcom_pull(key='accuracy')

    # Threshold for deployment
    DEPLOYMENT_THRESHOLD = 0.85

    if accuracy >= DEPLOYMENT_THRESHOLD:
        print(f"Model passed evaluation (accuracy: {accuracy:.4f}). Deploying...")
        return 'deploy_model'
    else:
        print(f"Model failed evaluation (accuracy: {accuracy:.4f}). Not deploying.")
        return 'send_alert'

def deploy_model(**context):
    """Deploy model to production"""
    import shutil

    model_path = context['task_instance'].xcom_pull(key='model_path')

    # Copy to production directory
    shutil.copy(model_path, '/app/models/production/model.pkl')

    print("Model deployed to production")

def send_alert(**context):
    """Send alert if model performance is poor"""
    accuracy = context['task_instance'].xcom_pull(key='accuracy')

    # Send email/Slack notification
    print(f"ALERT: Model performance below threshold: {accuracy:.4f}")

# Define tasks
extract_task = PythonOperator(
    task_id='extract_data',
    python_callable=extract_data,
    dag=dag
)

preprocess_task = PythonOperator(
    task_id='preprocess_data',
    python_callable=preprocess_data,
    dag=dag
)

train_task = PythonOperator(
    task_id='train_model',
    python_callable=train_model,
    dag=dag
)

evaluate_task = PythonOperator(
    task_id='evaluate_model',
    python_callable=evaluate_model,
    dag=dag
)

deploy_task = PythonOperator(
    task_id='deploy_model',
    python_callable=deploy_model,
    dag=dag
)

alert_task = PythonOperator(
    task_id='send_alert',
    python_callable=send_alert,
    dag=dag
)

# Define task dependencies
extract_task >> preprocess_task >> train_task >> evaluate_task
evaluate_task >> [deploy_task, alert_task]
```

**DAG Visualization:**
```
┌──────────────┐
│extract_data  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│preprocess_data│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ train_model  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│evaluate_model│
└──────┬───────┘
       │
       ├──────▶ deploy_model (if good)
       │
       └──────▶ send_alert (if bad)
```

### Advanced Airflow Patterns

#### 1. Branching

```python
from airflow.operators.python import BranchPythonOperator

def decide_branch(**context):
    """Decide which branch to take"""
    accuracy = context['task_instance'].xcom_pull(key='accuracy')

    if accuracy > 0.9:
        return 'excellent_performance'
    elif accuracy > 0.8:
        return 'good_performance'
    else:
        return 'poor_performance'

branch_task = BranchPythonOperator(
    task_id='decide_branch',
    python_callable=decide_branch,
    dag=dag
)
```

#### 2. SubDAGs

```python
from airflow.operators.subdag import SubDagOperator

def create_preprocessing_subdag(parent_dag_name, child_dag_name, args):
    """Create preprocessing subdag"""
    subdag = DAG(
        dag_id=f'{parent_dag_name}.{child_dag_name}',
        default_args=args,
        schedule_interval=None
    )

    # Define tasks in subdag
    clean_task = PythonOperator(...)
    transform_task = PythonOperator(...)

    clean_task >> transform_task

    return subdag

preprocess_subdag = SubDagOperator(
    task_id='preprocessing',
    subdag=create_preprocessing_subdag('ml_pipeline', 'preprocessing', default_args),
    dag=dag
)
```

#### 3. Dynamic Task Generation

```python
from airflow.models import Variable

# Get list of models to train
models_to_train = Variable.get("models_to_train", deserialize_json=True)
# Example: ['random_forest', 'xgboost', 'lightgbm']

for model_name in models_to_train:
    train_task = PythonOperator(
        task_id=f'train_{model_name}',
        python_callable=train_model,
        op_kwargs={'model_type': model_name},
        dag=dag
    )

    evaluate_task = PythonOperator(
        task_id=f'evaluate_{model_name}',
        python_callable=evaluate_model,
        op_kwargs={'model_type': model_name},
        dag=dag
    )

    train_task >> evaluate_task
```

---

## Pipeline Orchestration

### Complete ML Pipeline Example

```python
# complete_ml_pipeline.py
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.providers.postgres.hooks.postgres import PostgresHook
from datetime import datetime, timedelta
import pandas as pd
import joblib
import mlflow

default_args = {
    'owner': 'ml-team',
    'start_date': datetime(2024, 1, 1),
    'retries': 2,
    'retry_delay': timedelta(minutes=5)
}

dag = DAG(
    'complete_ml_pipeline',
    default_args=default_args,
    schedule_interval='@daily',
    catchup=False
)

def extract_from_database(**context):
    """Extract data from PostgreSQL"""
    pg_hook = PostgresHook(postgres_conn_id='postgres_ml')
    df = pg_hook.get_pandas_df("""
        SELECT * FROM customers
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    """)

    # Save to S3
    s3_hook = S3Hook(aws_conn_id='aws_default')
    csv_buffer = df.to_csv(index=False)
    s3_hook.load_string(
        string_data=csv_buffer,
        key=f'data/raw/customers_{context["ds"]}.csv',
        bucket_name='ml-data-bucket',
        replace=True
    )

    return f'data/raw/customers_{context["ds"]}.csv'

def preprocess_data(**context):
    """Feature engineering and preprocessing"""
    s3_hook = S3Hook(aws_conn_id='aws_default')
    raw_path = context['task_instance'].xcom_pull(task_ids='extract_data')

    # Load from S3
    obj = s3_hook.get_key(raw_path, bucket_name='ml-data-bucket')
    df = pd.read_csv(obj.get()['Body'])

    # Feature engineering
    df['age_income_ratio'] = df['age'] / df['income']
    df['credit_utilization'] = df['credit_used'] / df['credit_limit']

    # Handle missing values
    df = df.fillna(df.median())

    # Save processed data to S3
    processed_path = f'data/processed/customers_{context["ds"]}.csv'
    csv_buffer = df.to_csv(index=False)
    s3_hook.load_string(
        string_data=csv_buffer,
        key=processed_path,
        bucket_name='ml-data-bucket',
        replace=True
    )

    return processed_path

def train_model_with_mlflow(**context):
    """Train model and log with MLflow"""
    import mlflow
    import mlflow.sklearn
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, f1_score

    # Load processed data
    s3_hook = S3Hook(aws_conn_id='aws_default')
    processed_path = context['task_instance'].xcom_pull(task_ids='preprocess_data')
    obj = s3_hook.get_key(processed_path, bucket_name='ml-data-bucket')
    df = pd.read_csv(obj.get()['Body'])

    # Split data
    X = df.drop('target', axis=1)
    y = df['target']
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # MLflow tracking
    mlflow.set_experiment('customer_churn_prediction')

    with mlflow.start_run():
        # Train model
        model = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
        model.fit(X_train, y_train)

        # Evaluate
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average='weighted')

        # Log parameters
        mlflow.log_params({
            'n_estimators': 100,
            'max_depth': 6,
            'model_type': 'RandomForest'
        })

        # Log metrics
        mlflow.log_metrics({
            'accuracy': accuracy,
            'f1_score': f1
        })

        # Log model
        mlflow.sklearn.log_model(model, 'model')

        # Save model to S3
        model_path = f'models/model_{context["ds"]}.pkl'
        joblib.dump(model, f'/tmp/{model_path}')

        s3_hook.load_file(
            filename=f'/tmp/{model_path}',
            key=model_path,
            bucket_name='ml-models-bucket',
            replace=True
        )

        context['task_instance'].xcom_push(key='accuracy', value=accuracy)
        context['task_instance'].xcom_push(key='model_path', value=model_path)

def validate_model(**context):
    """Validate model performance"""
    accuracy = context['task_instance'].xcom_pull(task_ids='train_model', key='accuracy')

    if accuracy < 0.85:
        raise ValueError(f"Model accuracy {accuracy:.4f} below threshold 0.85")

    print(f"Model validated successfully with accuracy: {accuracy:.4f}")

def deploy_model(**context):
    """Deploy model to production"""
    s3_hook = S3Hook(aws_conn_id='aws_default')
    model_path = context['task_instance'].xcom_pull(task_ids='train_model', key='model_path')

    # Copy to production path
    s3_hook.copy_object(
        source_bucket_name='ml-models-bucket',
        source_bucket_key=model_path,
        dest_bucket_name='ml-models-bucket',
        dest_bucket_key='models/production/model.pkl'
    )

    print(f"Model deployed to production: {model_path}")

# Define tasks
extract_task = PythonOperator(
    task_id='extract_data',
    python_callable=extract_from_database,
    dag=dag
)

preprocess_task = PythonOperator(
    task_id='preprocess_data',
    python_callable=preprocess_data,
    dag=dag
)

train_task = PythonOperator(
    task_id='train_model',
    python_callable=train_model_with_mlflow,
    dag=dag
)

validate_task = PythonOperator(
    task_id='validate_model',
    python_callable=validate_model,
    dag=dag
)

deploy_task = PythonOperator(
    task_id='deploy_model',
    python_callable=deploy_model,
    dag=dag
)

# Task dependencies
extract_task >> preprocess_task >> train_task >> validate_task >> deploy_task
```

---

## Best Practices

### 1. Monitoring Strategy

```python
# monitoring_strategy.py
class MLMonitoringStrategy:
    """Comprehensive monitoring strategy"""

    def __init__(self):
        self.metrics = {
            'performance': [],
            'data_drift': [],
            'predictions': [],
            'system': []
        }

    def monitor_all(self, features, prediction, ground_truth=None):
        """Monitor all aspects"""

        # 1. Log prediction
        self.log_prediction(prediction, features)

        # 2. Check data drift
        drift_detected = self.check_data_drift(features)

        # 3. Monitor system metrics
        self.monitor_system_metrics()

        # 4. If ground truth available, update performance
        if ground_truth is not None:
            self.update_performance_metrics(prediction, ground_truth)

        # 5. Generate alerts if needed
        self.generate_alerts()

    def log_prediction(self, prediction, features):
        """Log prediction to database/logs"""
        pass

    def check_data_drift(self, features):
        """Check for data drift"""
        pass

    def monitor_system_metrics(self):
        """Monitor CPU, memory, latency"""
        pass

    def update_performance_metrics(self, prediction, ground_truth):
        """Update performance metrics"""
        pass

    def generate_alerts(self):
        """Generate alerts based on thresholds"""
        pass
```

### 2. Alerting Rules

```yaml
# alerting_rules.yml
groups:
  - name: ml_model_alerts
    rules:
      - alert: HighLatency
        expr: prediction_latency_seconds > 1.0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High prediction latency detected"

      - alert: ModelDriftDetected
        expr: data_drift_score > 0.2
        for: 1h
        labels:
          severity: critical
        annotations:
          summary: "Model drift detected - retraining needed"

      - alert: LowAccuracy
        expr: model_accuracy < 0.8
        for: 1d
        labels:
          severity: critical
        annotations:
          summary: "Model accuracy dropped below threshold"

      - alert: HighErrorRate
        expr: rate(prediction_errors_total[5m]) > 0.05
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Prediction error rate above 5%"
```

### 3. Retraining Strategy

```python
# retraining_strategy.py
class RetrainingStrategy:
    """Determine when to retrain model"""

    def should_retrain(self, metrics):
        """Decide if retraining is needed"""

        # Condition 1: Performance degraded
        if metrics['accuracy'] < 0.85:
            return True, "Performance below threshold"

        # Condition 2: Significant drift
        if metrics['drift_score'] > 0.2:
            return True, "Significant data drift detected"

        # Condition 3: Scheduled retraining (e.g., every 30 days)
        if metrics['days_since_training'] > 30:
            return True, "Scheduled retraining"

        # Condition 4: Significant data volume increase
        if metrics['new_data_samples'] > 10000:
            return True, "Sufficient new data available"

        return False, "No retraining needed"
```

---

## Common Pitfalls

### 1. Not Monitoring in Production

```python
# ❌ BAD: No monitoring
@app.post("/predict")
def predict(features: list):
    prediction = model.predict([features])
    return {'prediction': int(prediction[0])}

# ✅ GOOD: With monitoring
@app.post("/predict")
def predict(features: list):
    start_time = time.time()

    # Monitor input distribution
    monitor_input_distribution(features)

    # Predict
    prediction = model.predict([features])[0]

    # Monitor prediction
    monitor_prediction(prediction)

    # Monitor latency
    latency = time.time() - start_time
    monitor_latency(latency)

    # Log for drift detection
    log_for_drift_detection(features, prediction)

    return {'prediction': int(prediction)}
```

### 2. Ignoring Data Drift

```python
# Solution: Regular drift checks
from apscheduler.schedulers.background import BackgroundScheduler

def check_drift_periodically():
    """Run drift detection every hour"""
    drift_detector = DriftDetector(reference_data)
    recent_data = get_recent_production_data(hours=1)

    results = drift_detector.detect_all_features(recent_data)

    for result in results:
        if result['drift_detected']:
            send_alert(f"Drift detected in feature {result['feature']}")

scheduler = BackgroundScheduler()
scheduler.add_job(check_drift_periodically, 'interval', hours=1)
scheduler.start()
```

### 3. No Rollback Plan

```python
# Solution: Keep multiple model versions
@app.post("/predict")
def predict(features: list):
    model_version = request.headers.get('X-Model-Version', 'current')

    if model_version == 'current':
        model = load_model('models/current.pkl')
    elif model_version == 'previous':
        model = load_model('models/previous.pkl')
    else:
        model = load_model('models/current.pkl')

    prediction = model.predict([features])
    return {'prediction': int(prediction[0]), 'model_version': model_version}
```

---

## Interview Questions

### Q1: What is model drift and how do you detect it?

**Answer:**

**Model drift** occurs when model performance degrades over time due to changes in data distribution or relationships.

**Types:**

1. **Data drift (Covariate shift)**: Input distribution changes
2. **Concept drift**: Relationship between input and output changes
3. **Label drift**: Output distribution changes

**Detection methods:**

1. **Statistical tests**
   - Kolmogorov-Smirnov test
   - Chi-squared test
   - Population Stability Index (PSI)

2. **Model-based detection**
   - Train classifier to distinguish training vs production data
   - High accuracy → drift

3. **Performance monitoring**
   - Track accuracy, precision, recall over time
   - Alert if drops below threshold

**Implementation:**
```python
from scipy import stats

def detect_drift(train_data, prod_data, feature_idx):
    train_feature = train_data[:, feature_idx]
    prod_feature = prod_data[:, feature_idx]

    # KS test
    statistic, p_value = stats.ks_2samp(train_feature, prod_feature)

    if p_value < 0.05:
        return True, "Drift detected"
    return False, "No drift"
```

**Handling drift:**
- Retrain model with recent data
- Update features
- Switch to ensemble approach
- Gradual model updates

---

### Q2: Explain Apache Airflow and its use in ML pipelines.

**Answer:**

**Apache Airflow** is a workflow orchestration platform for scheduling and monitoring data pipelines.

**Key concepts:**

1. **DAG (Directed Acyclic Graph)**: Workflow definition
2. **Operators**: Tasks to execute
3. **Scheduler**: Triggers DAGs
4. **Executor**: Runs tasks
5. **Metadata Database**: Stores state

**Benefits for ML:**

- **Scheduled retraining**: Daily/weekly model updates
- **Dependency management**: Ensure tasks run in order
- **Retry logic**: Handle failures
- **Monitoring**: Track pipeline status
- **Scalability**: Distribute tasks

**Example ML pipeline:**
```python
from airflow import DAG
from airflow.operators.python import PythonOperator

dag = DAG('ml_pipeline', schedule_interval='@daily')

extract = PythonOperator(task_id='extract', python_callable=extract_data, dag=dag)
transform = PythonOperator(task_id='transform', python_callable=transform_data, dag=dag)
train = PythonOperator(task_id='train', python_callable=train_model, dag=dag)
deploy = PythonOperator(task_id='deploy', python_callable=deploy_model, dag=dag)

extract >> transform >> train >> deploy
```

**vs Other tools:**
- **Kubeflow**: K8s-native, more ML-focused
- **Prefect**: Modern alternative, better UI
- **MLflow Projects**: Simpler, less features

---

### Q3: How do you monitor ML models in production?

**Answer:**

**Monitoring dimensions:**

1. **Performance metrics**
   - Accuracy, precision, recall, F1
   - AUC-ROC, log loss
   - Business metrics (conversion, revenue)

2. **Data quality**
   - Missing values
   - Outliers
   - Data drift

3. **Prediction distribution**
   - Class imbalance
   - Prediction drift

4. **System metrics**
   - Latency (p50, p95, p99)
   - Throughput
   - Error rate
   - Memory/CPU usage

5. **Model behavior**
   - Confidence scores
   - Feature importance changes
   - Prediction explanations

**Implementation:**
```python
from prometheus_client import Counter, Histogram

predictions_total = Counter('predictions_total', 'Total predictions')
prediction_latency = Histogram('prediction_latency_seconds', 'Latency')
prediction_accuracy = Gauge('prediction_accuracy', 'Accuracy')

@app.post("/predict")
def predict(features: list):
    start = time.time()

    prediction = model.predict([features])
    predictions_total.inc()
    prediction_latency.observe(time.time() - start)

    # Log for later analysis
    db.log_prediction(features, prediction)

    return {'prediction': int(prediction[0])}

# Background job: Update accuracy
def update_accuracy():
    recent_preds = db.get_recent_predictions(hours=24)
    ground_truth = db.get_ground_truth(recent_preds)

    if len(ground_truth) > 0:
        accuracy = accuracy_score(ground_truth, recent_preds)
        prediction_accuracy.set(accuracy)

scheduler.add_job(update_accuracy, 'interval', hours=1)
```

**Tools:**
- Prometheus + Grafana
- DataDog
- ELK Stack
- MLflow
- WhyLabs, Fiddler (specialized ML monitoring)

---

### Q4: How do you handle model retraining in production?

**Answer:**

**Retraining strategies:**

1. **Scheduled retraining**
   - Daily/weekly/monthly
   - Simple, predictable
   - May retrain unnecessarily

2. **Performance-based**
   - Trigger when accuracy drops
   - More efficient
   - Requires ground truth

3. **Drift-based**
   - Trigger on data drift detection
   - Proactive
   - No ground truth needed

4. **Data-based**
   - Trigger after X new samples
   - Ensures fresh data
   - Simple logic

**Implementation with Airflow:**
```python
from airflow import DAG
from airflow.sensors.external_task import ExternalTaskSensor

# Option 1: Scheduled retraining
dag = DAG('scheduled_retraining', schedule_interval='@weekly')

# Option 2: Conditional retraining
def check_if_retraining_needed(**context):
    metrics = get_recent_metrics()

    if metrics['accuracy'] < 0.85:
        return 'retrain'
    elif metrics['drift_score'] > 0.2:
        return 'retrain'
    else:
        return 'skip'

check_task = BranchPythonOperator(
    task_id='check_retraining',
    python_callable=check_if_retraining_needed,
    dag=dag
)

retrain_task = PythonOperator(
    task_id='retrain',
    python_callable=retrain_model,
    dag=dag
)

skip_task = DummyOperator(task_id='skip', dag=dag)

check_task >> [retrain_task, skip_task]
```

**Best practices:**
- A/B test new model vs current
- Shadow mode (run both, compare)
- Gradual rollout (canary)
- Keep previous versions for rollback
- Monitor new model closely
- Automate only if confident

---

### Q5: What metrics should you monitor for an ML API?

**Answer:**

**1. API metrics:**
- Request rate (req/sec)
- Latency (p50, p95, p99)
- Error rate
- Availability/uptime

**2. Model metrics:**
- Prediction distribution
- Confidence scores
- Feature distributions
- Drift scores

**3. Business metrics:**
- Conversion rate
- Revenue impact
- User engagement
- False positive/negative costs

**4. Infrastructure metrics:**
- CPU/Memory usage
- GPU utilization
- Disk I/O
- Network traffic

**Example dashboard:**
```
┌─────────────────────────────────────────────┐
│         ML API Dashboard                    │
├─────────────────────────────────────────────┤
│                                             │
│  Request Rate: 1,234 req/sec               │
│  Latency P95: 125ms                        │
│  Error Rate: 0.2%                          │
│                                             │
│  Model Performance:                         │
│  - Accuracy: 0.89 (baseline: 0.92) ⚠️      │
│  - Prediction drift: 0.15                  │
│  - Confidence: 0.83                         │
│                                             │
│  Business Impact:                           │
│  - Conversion rate: 12%                     │
│  - Revenue: $45,232                         │
│                                             │
│  System:                                    │
│  - CPU: 65%                                 │
│  - Memory: 72%                              │
│  - GPU: 88%                                 │
└─────────────────────────────────────────────┘
```

**Alerting thresholds:**
```yaml
- Latency > 500ms → Warning
- Error rate > 1% → Critical
- Accuracy < 0.85 → Critical
- Drift score > 0.2 → Warning
- Memory > 90% → Warning
```

---

**Quick Reference:**

```python
# Drift detection
from scipy import stats
statistic, p_value = stats.ks_2samp(train_data, prod_data)

# Airflow DAG
from airflow import DAG
dag = DAG('ml_pipeline', schedule_interval='@daily')

# Monitoring
from prometheus_client import Counter, Histogram
counter = Counter('predictions', 'Total predictions')
counter.inc()

# Logging
logger.info('Prediction made', extra={'prediction': 1})
```

---

[← Back to Model Deployment](./model-deployment.md) | [Next: Best Practices →](./best-practices.md)
