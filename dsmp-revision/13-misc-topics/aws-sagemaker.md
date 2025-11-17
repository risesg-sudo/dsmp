# AWS SageMaker

## 📖 Table of Contents
- [Introduction](#introduction)
- [SageMaker Components](#sagemaker-components)
- [Training Jobs](#training-jobs)
- [Hyperparameter Tuning](#hyperparameter-tuning)
- [Model Deployment](#model-deployment)
- [Built-in Algorithms](#built-in-algorithms)
- [Batch Transform](#batch-transform)
- [Monitoring & Logging](#monitoring--logging)
- [Cost Optimization](#cost-optimization)
- [Practical Examples](#practical-examples)
- [Interview Questions](#interview-questions)

---

## Introduction

**AWS SageMaker:** Fully managed machine learning service to build, train, and deploy ML models at scale

**Key Features:**
- **Managed Infrastructure:** No server management
- **Built-in Algorithms:** Pre-built ML algorithms
- **Custom Models:** Bring your own code
- **Automatic Scaling:** Scale training and inference
- **Integrated Tools:** Notebooks, training, deployment
- **MLOps:** Model monitoring, versioning, CI/CD

### SageMaker Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    AWS SageMaker                         │
└──────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   ┌─────────┐      ┌─────────┐      ┌─────────┐
   │  Data   │      │ Training│      │  Deploy │
   │  Prep   │      │         │      │         │
   └─────────┘      └─────────┘      └─────────┘
        │                 │                 │
        ▼                 ▼                 ▼
   - Studio         - Training Jobs    - Endpoints
   - Processing     - HPO              - Batch Transform
   - Ground Truth   - Built-in Algos   - Edge Deployment
```

---

## SageMaker Components

### 1. SageMaker Studio

**Integrated Development Environment (IDE) for ML**

```
SageMaker Studio:
  - Notebooks (JupyterLab)
  - Experiment tracking
  - Model registry
  - Debugging tools
  - Visual workflow builder
```

### 2. SageMaker Notebooks

**Managed Jupyter notebooks**

```python
# Running in SageMaker Notebook
import sagemaker
from sagemaker import get_execution_role

# Get IAM role
role = get_execution_role()

# Get SageMaker session
sagemaker_session = sagemaker.Session()

# Get S3 bucket
bucket = sagemaker_session.default_bucket()

print(f"SageMaker role: {role}")
print(f"Default bucket: {bucket}")
```

### 3. Data Storage

**S3 Integration:**

```
Data Flow:
  Local Data → Upload to S3 → SageMaker Training → Model Artifacts → S3
```

```python
import boto3
import pandas as pd

# Upload data to S3
s3 = boto3.client('s3')

# Upload CSV
df = pd.read_csv('train.csv')
df.to_csv('s3://my-bucket/data/train.csv', index=False)

# Or using SageMaker session
train_data = sagemaker_session.upload_data(
    path='train.csv',
    bucket=bucket,
    key_prefix='data'
)
print(f"Training data location: {train_data}")
```

---

## Training Jobs

### Basic Training Job

```python
import sagemaker
from sagemaker.sklearn import SKLearn

# Define estimator
sklearn_estimator = SKLearn(
    entry_point='train.py',         # Your training script
    role=role,                      # IAM role
    instance_type='ml.m5.xlarge',  # Training instance
    instance_count=1,               # Number of instances
    framework_version='0.23-1',     # Scikit-learn version
    py_version='py3',
    hyperparameters={
        'n_estimators': 100,
        'max_depth': 5
    }
)

# Start training
sklearn_estimator.fit({
    'train': 's3://bucket/data/train.csv',
    'test': 's3://bucket/data/test.csv'
})
```

### Training Script (train.py)

```python
# train.py
import argparse
import os
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

if __name__ == '__main__':
    # Parse arguments
    parser = argparse.ArgumentParser()
    parser.add_argument('--n_estimators', type=int, default=100)
    parser.add_argument('--max_depth', type=int, default=5)
    args, _ = parser.parse_known_args()

    # Load data
    train_data = pd.read_csv('/opt/ml/input/data/train/train.csv')
    X_train = train_data.drop('target', axis=1)
    y_train = train_data['target']

    test_data = pd.read_csv('/opt/ml/input/data/test/test.csv')
    X_test = test_data.drop('target', axis=1)
    y_test = test_data['target']

    # Train model
    model = RandomForestClassifier(
        n_estimators=args.n_estimators,
        max_depth=args.max_depth,
        random_state=42
    )
    model.fit(X_train, y_train)

    # Evaluate
    train_acc = accuracy_score(y_train, model.predict(X_train))
    test_acc = accuracy_score(y_test, model.predict(X_test))

    print(f"Training accuracy: {train_acc:.4f}")
    print(f"Test accuracy: {test_acc:.4f}")

    # Save model
    model_path = os.path.join('/opt/ml/model', 'model.joblib')
    joblib.dump(model, model_path)
```

### SageMaker Directory Structure

```
/opt/ml/
├── input/
│   ├── config/
│   │   ├── hyperparameters.json
│   │   └── resourceConfig.json
│   └── data/
│       ├── train/         ← Training data
│       └── test/          ← Test data
├── model/                 ← Save model here
├── output/                ← Training output/logs
└── code/                  ← Your training script
```

### Using Built-in Containers

```python
from sagemaker.image_uris import retrieve

# Get built-in algorithm container
container = retrieve(
    'xgboost',
    region='us-east-1',
    version='1.5-1'
)

# Create estimator
xgb_estimator = sagemaker.estimator.Estimator(
    image_uri=container,
    role=role,
    instance_count=1,
    instance_type='ml.m5.xlarge',
    output_path=f's3://{bucket}/output',
    hyperparameters={
        'objective': 'binary:logistic',
        'num_round': 100,
        'max_depth': 5
    }
)
```

---

## Hyperparameter Tuning

### Hyperparameter Tuning Job

**Concept:** Automatic hyperparameter optimization using Bayesian optimization

```python
from sagemaker.tuner import (
    IntegerParameter,
    ContinuousParameter,
    HyperparameterTuner
)

# Define hyperparameter ranges
hyperparameter_ranges = {
    'n_estimators': IntegerParameter(10, 200),
    'max_depth': IntegerParameter(3, 10),
    'min_samples_split': IntegerParameter(2, 20),
    'min_samples_leaf': IntegerParameter(1, 10)
}

# Define metric to optimize
metric_definitions = [
    {
        'Name': 'validation:accuracy',
        'Regex': 'validation accuracy: ([0-9\\.]+)'
    }
]

# Create tuner
tuner = HyperparameterTuner(
    estimator=sklearn_estimator,
    objective_metric_name='validation:accuracy',
    hyperparameter_ranges=hyperparameter_ranges,
    metric_definitions=metric_definitions,
    max_jobs=20,                    # Total tuning jobs
    max_parallel_jobs=3,            # Parallel jobs
    objective_type='Maximize'       # Maximize or Minimize
)

# Start tuning
tuner.fit({
    'train': train_data,
    'test': test_data
})

# Get best job
best_training_job = tuner.best_training_job()
print(f"Best training job: {best_training_job}")
```

### Training Script with Metrics

```python
# train.py (modified to output metrics)
import argparse
import os
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--n_estimators', type=int, default=100)
    parser.add_argument('--max_depth', type=int, default=5)
    parser.add_argument('--min_samples_split', type=int, default=2)
    parser.add_argument('--min_samples_leaf', type=int, default=1)
    args, _ = parser.parse_known_args()

    # Load data
    train_data = pd.read_csv('/opt/ml/input/data/train/train.csv')
    X_train = train_data.drop('target', axis=1)
    y_train = train_data['target']

    test_data = pd.read_csv('/opt/ml/input/data/test/test.csv')
    X_test = test_data.drop('target', axis=1)
    y_test = test_data['target']

    # Train model
    model = RandomForestClassifier(
        n_estimators=args.n_estimators,
        max_depth=args.max_depth,
        min_samples_split=args.min_samples_split,
        min_samples_leaf=args.min_samples_leaf,
        random_state=42
    )
    model.fit(X_train, y_train)

    # Evaluate
    train_acc = accuracy_score(y_train, model.predict(X_train))
    test_acc = accuracy_score(y_test, model.predict(X_test))

    # Print metrics in format that SageMaker can parse
    print(f"training accuracy: {train_acc:.4f}")
    print(f"validation accuracy: {test_acc:.4f}")  # ← SageMaker parses this

    # Save model
    model_path = os.path.join('/opt/ml/model', 'model.joblib')
    joblib.dump(model, model_path)
```

### Analyzing Tuning Results

```python
# Get tuning job analytics
from sagemaker.analytics import HyperparameterTuningJobAnalytics

analytics = HyperparameterTuningJobAnalytics(
    hyperparameter_tuning_job_name=tuner.latest_tuning_job.job_name
)

# Get dataframe with all trials
df = analytics.dataframe()
print(df.head())

# Best hyperparameters
best_params = tuner.best_estimator().hyperparameters()
print(f"Best hyperparameters: {best_params}")

# Deploy best model
best_predictor = tuner.deploy(
    initial_instance_count=1,
    instance_type='ml.t2.medium'
)
```

---

## Model Deployment

### Real-Time Endpoint

```python
# Deploy trained model
predictor = sklearn_estimator.deploy(
    initial_instance_count=1,
    instance_type='ml.t2.medium',
    endpoint_name='sklearn-endpoint'
)

# Make predictions
import numpy as np

data = np.array([[1, 2, 3, 4]])
prediction = predictor.predict(data)
print(f"Prediction: {prediction}")

# Delete endpoint when done
predictor.delete_endpoint()
```

### Custom Inference Script

```python
# inference.py
import joblib
import os

def model_fn(model_dir):
    """Load model"""
    model = joblib.load(os.path.join(model_dir, 'model.joblib'))
    return model

def input_fn(request_body, content_type='application/json'):
    """Parse input data"""
    import json
    import numpy as np

    if content_type == 'application/json':
        data = json.loads(request_body)
        return np.array(data['instances'])
    else:
        raise ValueError(f"Unsupported content type: {content_type}")

def predict_fn(input_data, model):
    """Make prediction"""
    predictions = model.predict(input_data)
    probabilities = model.predict_proba(input_data)
    return {
        'predictions': predictions.tolist(),
        'probabilities': probabilities.tolist()
    }

def output_fn(prediction, accept='application/json'):
    """Format output"""
    import json

    if accept == 'application/json':
        return json.dumps(prediction), accept
    else:
        raise ValueError(f"Unsupported accept type: {accept}")
```

### Deploy with Custom Inference

```python
from sagemaker.sklearn import SKLearnModel

model = SKLearnModel(
    model_data=sklearn_estimator.model_data,  # S3 path to model
    role=role,
    entry_point='inference.py',
    framework_version='0.23-1'
)

predictor = model.deploy(
    initial_instance_count=1,
    instance_type='ml.t2.medium'
)
```

### Endpoint Configuration

```python
# Advanced endpoint configuration
from sagemaker.model import Model
from sagemaker.predictor import Predictor

# Create model
model = Model(
    image_uri=container,
    model_data='s3://bucket/model.tar.gz',
    role=role
)

# Create endpoint configuration
endpoint_config_name = 'my-endpoint-config'
model.create(
    instance_type='ml.t2.medium',
    endpoint_name=endpoint_config_name
)

# Deploy with auto-scaling
predictor = Predictor(
    endpoint_name='my-endpoint',
    sagemaker_session=sagemaker_session
)

# Configure auto-scaling
import boto3

asg = boto3.client('application-autoscaling')

response = asg.register_scalable_target(
    ServiceNamespace='sagemaker',
    ResourceId=f'endpoint/my-endpoint/variant/AllTraffic',
    ScalableDimension='sagemaker:variant:DesiredInstanceCount',
    MinCapacity=1,
    MaxCapacity=5
)

# Define scaling policy
response = asg.put_scaling_policy(
    PolicyName='my-scaling-policy',
    ServiceNamespace='sagemaker',
    ResourceId=f'endpoint/my-endpoint/variant/AllTraffic',
    ScalableDimension='sagemaker:variant:DesiredInstanceCount',
    PolicyType='TargetTrackingScaling',
    TargetTrackingScalingPolicyConfiguration={
        'TargetValue': 70.0,  # Target 70% invocations per instance
        'PredefinedMetricSpecification': {
            'PredefinedMetricType': 'SageMakerVariantInvocationsPerInstance'
        },
        'ScaleInCooldown': 300,
        'ScaleOutCooldown': 60
    }
)
```

---

## Built-in Algorithms

### Available Algorithms

```
Supervised Learning:
  - XGBoost
  - Linear Learner
  - Factorization Machines
  - K-Nearest Neighbors (KNN)

Computer Vision:
  - Image Classification
  - Object Detection
  - Semantic Segmentation

NLP:
  - BlazingText
  - Sequence-to-Sequence

Unsupervised:
  - K-Means
  - PCA
  - Random Cut Forest (anomaly detection)

Time Series:
  - DeepAR
```

### XGBoost Example

```python
from sagemaker.image_uris import retrieve

# Get XGBoost container
container = retrieve('xgboost', region, version='1.5-1')

# Prepare data in libsvm format
import pandas as pd
from sklearn.datasets import load_breast_cancer
from io import StringIO

data = load_breast_cancer()
df = pd.DataFrame(data.data, columns=data.feature_names)
df['target'] = data.target

# Convert to libsvm format
def to_libsvm(df, label_col):
    lines = []
    for _, row in df.iterrows():
        label = row[label_col]
        features = ' '.join([f"{i+1}:{row[col]}" for i, col in enumerate(df.columns) if col != label_col])
        lines.append(f"{label} {features}")
    return '\n'.join(lines)

libsvm_data = to_libsvm(df, 'target')

# Upload to S3
train_path = f's3://{bucket}/xgboost/train.libsvm'
boto3.Session().resource('s3').Bucket(bucket).Object('xgboost/train.libsvm').put(Body=libsvm_data)

# Create estimator
xgb = sagemaker.estimator.Estimator(
    container,
    role,
    instance_count=1,
    instance_type='ml.m5.xlarge',
    output_path=f's3://{bucket}/xgboost/output',
    hyperparameters={
        'objective': 'binary:logistic',
        'num_round': 100,
        'max_depth': 5,
        'eta': 0.2,
        'subsample': 0.8,
        'colsample_bytree': 0.8
    }
)

# Train
xgb.fit({'train': train_path})

# Deploy
xgb_predictor = xgb.deploy(
    initial_instance_count=1,
    instance_type='ml.t2.medium'
)
```

### Linear Learner Example

```python
from sagemaker import LinearLearner

# Create Linear Learner
linear = LinearLearner(
    role=role,
    instance_count=1,
    instance_type='ml.m5.xlarge',
    predictor_type='binary_classifier',
    binary_classifier_model_selection_criteria='accuracy'
)

# Prepare data
from sagemaker.serializers import RecordSerializer
from sagemaker.amazon.common import write_numpy_to_dense_tensor
import io

# Convert to RecordIO format
buf = io.BytesIO()
write_numpy_to_dense_tensor(buf, X_train, y_train)
buf.seek(0)

# Upload to S3
boto3.Session().resource('s3').Bucket(bucket).Object('linear/train.data').upload_fileobj(buf)

# Train
linear.fit({'train': f's3://{bucket}/linear/train.data'})

# Deploy
linear_predictor = linear.deploy(
    initial_instance_count=1,
    instance_type='ml.t2.medium'
)
```

---

## Batch Transform

**Batch Transform:** Offline predictions for large datasets

```python
# Create transformer
transformer = sklearn_estimator.transformer(
    instance_count=1,
    instance_type='ml.m5.xlarge',
    output_path=f's3://{bucket}/batch-transform/output'
)

# Start batch transform job
transformer.transform(
    data=f's3://{bucket}/batch-transform/input.csv',
    content_type='text/csv',
    split_type='Line'
)

# Wait for completion
transformer.wait()

# Download results
import boto3

s3 = boto3.client('s3')
s3.download_file(
    bucket,
    'batch-transform/output/input.csv.out',
    'predictions.csv'
)
```

### Batch Transform with Custom Input/Output

```python
from sagemaker.transformer import Transformer

# Create transformer
transformer = Transformer(
    model_name='my-model',
    instance_count=2,  # Parallel processing
    instance_type='ml.m5.xlarge',
    output_path=f's3://{bucket}/output',
    strategy='MultiRecord',  # Process multiple records per request
    max_concurrent_transforms=4,
    max_payload=1  # MB
)

# Transform
transformer.transform(
    data=f's3://{bucket}/input',
    data_type='S3Prefix',  # Process all files in prefix
    content_type='application/json',
    split_type='Line',
    join_source='Input'  # Include input in output
)

transformer.wait()
```

---

## Monitoring & Logging

### CloudWatch Logs

```python
import boto3

logs = boto3.client('logs')

# Get log streams
response = logs.describe_log_streams(
    logGroupName='/aws/sagemaker/TrainingJobs',
    logStreamNamePrefix=training_job_name
)

# Get logs
for stream in response['logStreams']:
    events = logs.get_log_events(
        logGroupName='/aws/sagemaker/TrainingJobs',
        logStreamName=stream['logStreamName']
    )
    for event in events['events']:
        print(event['message'])
```

### CloudWatch Metrics

```python
import boto3
from datetime import datetime, timedelta

cloudwatch = boto3.client('cloudwatch')

# Get endpoint metrics
response = cloudwatch.get_metric_statistics(
    Namespace='AWS/SageMaker',
    MetricName='ModelLatency',
    Dimensions=[
        {
            'Name': 'EndpointName',
            'Value': 'my-endpoint'
        },
        {
            'Name': 'VariantName',
            'Value': 'AllTraffic'
        }
    ],
    StartTime=datetime.now() - timedelta(hours=1),
    EndTime=datetime.now(),
    Period=300,  # 5 minutes
    Statistics=['Average', 'Maximum']
)

for datapoint in response['Datapoints']:
    print(f"Time: {datapoint['Timestamp']}, Latency: {datapoint['Average']}ms")
```

### Model Monitoring

```python
from sagemaker.model_monitor import DefaultModelMonitor
from sagemaker.model_monitor import CronExpressionGenerator

# Create baseline
my_default_monitor = DefaultModelMonitor(
    role=role,
    instance_count=1,
    instance_type='ml.m5.xlarge',
    volume_size_in_gb=20,
    max_runtime_in_seconds=3600,
)

# Suggest baseline
my_default_monitor.suggest_baseline(
    baseline_dataset=f's3://{bucket}/baseline.csv',
    dataset_format='csv',
    output_s3_uri=f's3://{bucket}/baseline-results'
)

# Create monitoring schedule
my_default_monitor.create_monitoring_schedule(
    monitor_schedule_name='my-monitor-schedule',
    endpoint_input=predictor.endpoint_name,
    output_s3_uri=f's3://{bucket}/monitoring-output',
    statistics=my_default_monitor.baseline_statistics(),
    constraints=my_default_monitor.suggested_constraints(),
    schedule_cron_expression=CronExpressionGenerator.hourly(),
    enable_cloudwatch_metrics=True,
)
```

---

## Cost Optimization

### Instance Selection

```
Training Instances:
┌──────────────────────────────────────────────────────────┐
│ Instance Type    vCPU   RAM    Cost/hr    Use Case      │
├──────────────────────────────────────────────────────────┤
│ ml.t3.medium     2      4GB    $0.05      Development    │
│ ml.m5.xlarge     4      16GB   $0.23      General        │
│ ml.c5.2xlarge    8      16GB   $0.39      CPU-intensive  │
│ ml.p3.2xlarge    8      61GB   $3.82      GPU (1x V100)  │
│ ml.p3.8xlarge    32     244GB  $14.69     GPU (4x V100)  │
└──────────────────────────────────────────────────────────┘

Inference Instances:
┌──────────────────────────────────────────────────────────┐
│ ml.t2.medium     2      4GB    $0.05      Low traffic    │
│ ml.c5.large      2      4GB    $0.10      Medium traffic │
│ ml.c5.xlarge     4      8GB    $0.20      High traffic   │
└──────────────────────────────────────────────────────────┘
```

### Spot Instances

```python
# Use spot instances for training (up to 90% cost savings)
sklearn_estimator = SKLearn(
    entry_point='train.py',
    role=role,
    instance_type='ml.m5.xlarge',
    instance_count=1,
    framework_version='0.23-1',
    use_spot_instances=True,           # ← Use spot instances
    max_wait=7200,                      # Max wait time (seconds)
    max_run=3600,                       # Max run time (seconds)
    checkpoint_s3_uri=f's3://{bucket}/checkpoints'  # For resuming
)
```

### Managed Spot Training

```python
# Automatic checkpointing for spot interruptions
sklearn_estimator = SKLearn(
    entry_point='train.py',
    role=role,
    instance_type='ml.m5.xlarge',
    instance_count=1,
    framework_version='0.23-1',
    use_spot_instances=True,
    max_wait=7200,
    max_run=3600,
    checkpoint_s3_uri=f's3://{bucket}/checkpoints',
    checkpoint_local_path='/opt/ml/checkpoints'
)
```

### Cost Monitoring

```python
import boto3
from datetime import datetime, timedelta

ce = boto3.client('ce')  # Cost Explorer

# Get SageMaker costs
response = ce.get_cost_and_usage(
    TimePeriod={
        'Start': (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'),
        'End': datetime.now().strftime('%Y-%m-%d')
    },
    Granularity='DAILY',
    Filter={
        'Dimensions': {
            'Key': 'SERVICE',
            'Values': ['Amazon SageMaker']
        }
    },
    Metrics=['UnblendedCost']
)

for result in response['ResultsByTime']:
    print(f"Date: {result['TimePeriod']['Start']}, Cost: ${result['Total']['UnblendedCost']['Amount']}")
```

---

## Practical Examples

### Example 1: Complete ML Pipeline

```python
import sagemaker
from sagemaker.sklearn import SKLearn
import boto3
import pandas as pd
from sklearn.model_selection import train_test_split

# Setup
role = sagemaker.get_execution_role()
session = sagemaker.Session()
bucket = session.default_bucket()
prefix = 'sagemaker-demo'

# ========== 1. Prepare Data ==========

# Load data
from sklearn.datasets import load_breast_cancer
data = load_breast_cancer()
df = pd.DataFrame(data.data, columns=data.feature_names)
df['target'] = data.target

# Split
train_df, test_df = train_test_split(df, test_size=0.2, random_state=42)

# Upload to S3
train_path = f's3://{bucket}/{prefix}/train.csv'
test_path = f's3://{bucket}/{prefix}/test.csv'

train_df.to_csv(train_path, index=False)
test_df.to_csv(test_path, index=False)

print(f"Training data: {train_path}")
print(f"Test data: {test_path}")

# ========== 2. Create Training Script ==========

# train.py content (save locally)
train_script = """
import argparse
import os
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--n_estimators', type=int, default=100)
    parser.add_argument('--max_depth', type=int, default=5)
    args, _ = parser.parse_known_args()

    # Load data
    train_data = pd.read_csv('/opt/ml/input/data/train/train.csv')
    X_train = train_data.drop('target', axis=1)
    y_train = train_data['target']

    test_data = pd.read_csv('/opt/ml/input/data/test/test.csv')
    X_test = test_data.drop('target', axis=1)
    y_test = test_data['target']

    # Train
    model = RandomForestClassifier(
        n_estimators=args.n_estimators,
        max_depth=args.max_depth,
        random_state=42
    )
    model.fit(X_train, y_train)

    # Evaluate
    train_acc = accuracy_score(y_train, model.predict(X_train))
    test_acc = accuracy_score(y_test, model.predict(X_test))

    print(f"Training accuracy: {train_acc:.4f}")
    print(f"Test accuracy: {test_acc:.4f}")
    print(classification_report(y_test, model.predict(X_test)))

    # Save
    joblib.dump(model, os.path.join('/opt/ml/model', 'model.joblib'))
"""

with open('train.py', 'w') as f:
    f.write(train_script)

# ========== 3. Train Model ==========

sklearn_estimator = SKLearn(
    entry_point='train.py',
    role=role,
    instance_type='ml.m5.xlarge',
    instance_count=1,
    framework_version='0.23-1',
    py_version='py3',
    hyperparameters={
        'n_estimators': 100,
        'max_depth': 10
    }
)

sklearn_estimator.fit({
    'train': train_path,
    'test': test_path
})

# ========== 4. Deploy Model ==========

predictor = sklearn_estimator.deploy(
    initial_instance_count=1,
    instance_type='ml.t2.medium',
    endpoint_name='breast-cancer-classifier'
)

print(f"Endpoint: {predictor.endpoint_name}")

# ========== 5. Make Predictions ==========

# Single prediction
sample = test_df.drop('target', axis=1).iloc[0].values
prediction = predictor.predict(sample.reshape(1, -1))
print(f"Prediction: {prediction}")

# Batch prediction
samples = test_df.drop('target', axis=1).head(10).values
predictions = predictor.predict(samples)
print(f"Predictions: {predictions}")

# ========== 6. Cleanup ==========

# Delete endpoint
predictor.delete_endpoint()
print("Endpoint deleted")
```

### Example 2: Hyperparameter Tuning

```python
from sagemaker.tuner import IntegerParameter, HyperparameterTuner

# Define ranges
hyperparameter_ranges = {
    'n_estimators': IntegerParameter(50, 200),
    'max_depth': IntegerParameter(3, 15)
}

# Metric definition
metric_definitions = [
    {
        'Name': 'test:accuracy',
        'Regex': 'Test accuracy: ([0-9\\.]+)'
    }
]

# Create tuner
tuner = HyperparameterTuner(
    estimator=sklearn_estimator,
    objective_metric_name='test:accuracy',
    hyperparameter_ranges=hyperparameter_ranges,
    metric_definitions=metric_definitions,
    max_jobs=10,
    max_parallel_jobs=2,
    objective_type='Maximize'
)

# Start tuning
tuner.fit({
    'train': train_path,
    'test': test_path
})

# Get best model
best_job = tuner.best_training_job()
print(f"Best job: {best_job}")

# Deploy best model
best_predictor = tuner.deploy(
    initial_instance_count=1,
    instance_type='ml.t2.medium'
)
```

---

## Interview Questions

### Q1: What is AWS SageMaker and what are its main components?

**Answer:**

**AWS SageMaker:** Fully managed ML service for building, training, and deploying ML models at scale.

**Main Components:**

1. **SageMaker Studio:** IDE for ML development
2. **Notebooks:** Managed Jupyter notebooks
3. **Training:** Managed training infrastructure
4. **Hyperparameter Tuning:** Automatic optimization
5. **Model Registry:** Model versioning and management
6. **Endpoints:** Real-time inference
7. **Batch Transform:** Offline batch predictions
8. **Pipelines:** MLOps workflows

**Benefits:**
- ✅ No infrastructure management
- ✅ Automatic scaling
- ✅ Built-in algorithms
- ✅ Integrated with AWS ecosystem
- ✅ Pay-per-use pricing

**Use Cases:**
- Training at scale
- Model deployment
- Hyperparameter optimization
- Production ML systems

---

### Q2: How do you deploy an ML model on SageMaker?

**Answer:**

**Deployment Steps:**

**1. Train Model:**
```python
estimator = SKLearn(
    entry_point='train.py',
    role=role,
    instance_type='ml.m5.xlarge'
)
estimator.fit({'train': train_data})
```

**2. Deploy to Endpoint:**
```python
predictor = estimator.deploy(
    initial_instance_count=1,
    instance_type='ml.t2.medium',
    endpoint_name='my-endpoint'
)
```

**3. Make Predictions:**
```python
prediction = predictor.predict(data)
```

**4. Cleanup:**
```python
predictor.delete_endpoint()
```

**Deployment Options:**

| Option | Use Case | Cost |
|--------|----------|------|
| **Real-time Endpoint** | Low latency, online predictions | Always running |
| **Batch Transform** | Large datasets, offline | Pay per job |
| **Serverless Inference** | Variable traffic | Pay per request |
| **Edge Deployment** | IoT devices, offline | One-time |

**Best Practices:**
- ✅ Start with small instance for testing
- ✅ Use auto-scaling for production
- ✅ Monitor endpoint metrics
- ✅ Delete unused endpoints
- ✅ Use A/B testing for model updates

---

### Q3: Explain hyperparameter tuning in SageMaker.

**Answer:**

**Hyperparameter Tuning:** Automatic search for best hyperparameters using Bayesian optimization.

**How It Works:**

1. **Define Search Space:**
```python
hyperparameter_ranges = {
    'n_estimators': IntegerParameter(10, 200),
    'max_depth': IntegerParameter(3, 10),
    'learning_rate': ContinuousParameter(0.01, 0.3)
}
```

2. **Define Objective Metric:**
```python
metric_definitions = [
    {
        'Name': 'validation:accuracy',
        'Regex': 'validation accuracy: ([0-9\\.]+)'
    }
]
```

3. **Create Tuning Job:**
```python
tuner = HyperparameterTuner(
    estimator=estimator,
    objective_metric_name='validation:accuracy',
    hyperparameter_ranges=hyperparameter_ranges,
    max_jobs=20,
    max_parallel_jobs=3
)
```

**Strategy:**
```
Bayesian Optimization:
  1. Start with random combinations
  2. Train and evaluate
  3. Use results to pick next combination (likely to improve)
  4. Repeat until max_jobs reached
```

**Advantages:**
- ✅ Automatic optimization
- ✅ More efficient than grid search
- ✅ Parallel execution
- ✅ Integrated with training

**Cost Consideration:**
```
Total Cost = (max_jobs) × (instance_cost per hour) × (training time)

Example:
  max_jobs = 20
  instance = ml.m5.xlarge ($0.23/hr)
  training time = 10 minutes

  Cost ≈ 20 × $0.23 × (10/60) = $0.77
```

---

### Q4: What are SageMaker built-in algorithms?

**Answer:**

**Built-in Algorithms:** Pre-built, optimized algorithms provided by AWS.

**Categories:**

**1. Supervised Learning:**
- **XGBoost:** Gradient boosting (classification/regression)
- **Linear Learner:** Linear models
- **Factorization Machines:** Recommendation systems
- **KNN:** K-nearest neighbors

**2. Computer Vision:**
- **Image Classification:** CNN-based classification
- **Object Detection:** Detect objects in images
- **Semantic Segmentation:** Pixel-level segmentation

**3. NLP:**
- **BlazingText:** Text classification, word embeddings
- **Sequence-to-Sequence:** Translation, summarization

**4. Unsupervised:**
- **K-Means:** Clustering
- **PCA:** Dimensionality reduction
- **Random Cut Forest:** Anomaly detection

**5. Time Series:**
- **DeepAR:** Forecasting with RNN

**Example: Using XGBoost:**
```python
from sagemaker.image_uris import retrieve

# Get container
container = retrieve('xgboost', region, version='1.5-1')

# Create estimator
xgb = sagemaker.estimator.Estimator(
    image_uri=container,
    role=role,
    instance_count=1,
    instance_type='ml.m5.xlarge',
    hyperparameters={
        'objective': 'binary:logistic',
        'num_round': 100
    }
)

# Train
xgb.fit({'train': train_data})
```

**Advantages:**
- ✅ Optimized for performance
- ✅ No code needed (just data)
- ✅ Scalable
- ✅ Well-documented

---

### Q5: How do you optimize costs in SageMaker?

**Answer:**

**Cost Optimization Strategies:**

**1. Use Spot Instances (up to 90% savings):**
```python
estimator = SKLearn(
    entry_point='train.py',
    role=role,
    instance_type='ml.m5.xlarge',
    use_spot_instances=True,  # ← 90% cheaper
    max_wait=7200,
    max_run=3600
)
```

**2. Right-Size Instances:**
```
Don't use GPU for CPU tasks
Start small (ml.t3.medium) and scale up
Use cheaper instances for inference (ml.t2.medium)
```

**3. Delete Unused Endpoints:**
```python
# Endpoints cost $X/hour even when idle
predictor.delete_endpoint()

# Or use serverless inference for variable traffic
```

**4. Use Batch Transform Instead of Endpoints:**
```
Real-time Endpoint: Always running ($50/month)
Batch Transform: Pay per job ($5 for 100K predictions)
```

**5. Automatic Scaling:**
```python
# Scale down during low traffic
asg.register_scalable_target(
    MinCapacity=1,
    MaxCapacity=5
)
```

**6. Use S3 Lifecycle Policies:**
```
Move old training data to S3 Glacier
Delete temporary files
```

**7. Monitor Costs:**
```python
# Use Cost Explorer API
ce = boto3.client('ce')
response = ce.get_cost_and_usage(...)
```

**Cost Breakdown:**
```
Training:    $X per instance-hour
Inference:   $X per instance-hour (always running)
Storage:     $X per GB-month (S3)
Data Transfer: $X per GB out
```

**Example Cost Calculation:**
```
Training (1 hour, ml.m5.xlarge):  $0.23
Endpoint (24/7, ml.t2.medium):    $0.05 × 720 hours = $36/month
Storage (10GB on S3):             $0.023/GB × 10 = $0.23/month

Total ≈ $36.46/month
```

---

### Q6: What is the difference between real-time endpoints and batch transform?

**Answer:**

| Aspect | Real-Time Endpoint | Batch Transform |
|--------|-------------------|-----------------|
| **Latency** | Low (milliseconds) | High (minutes to hours) |
| **Use Case** | Online predictions | Offline, large datasets |
| **Cost** | Always running ($/hour) | Pay per job |
| **Scaling** | Auto-scaling available | Parallel processing |
| **Input** | Single/small batch | Large files on S3 |
| **When to Use** | Web apps, APIs | Periodic batch jobs |

**Real-Time Endpoint:**
```python
# Always running
predictor = estimator.deploy(
    instance_count=1,
    instance_type='ml.t2.medium'
)

# Predict single request
prediction = predictor.predict(data)

# Cost: $X/hour × 24 × 30 = $X/month
```

**Batch Transform:**
```python
# One-time job
transformer = estimator.transformer(
    instance_count=1,
    instance_type='ml.m5.xlarge'
)

# Process entire S3 prefix
transformer.transform('s3://bucket/data/')

# Cost: $X/hour × job_duration
```

**Decision Matrix:**
```
                Traffic Pattern
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
Continuous   Periodic   One-time
    │           │           │
    ▼           ▼           ▼
Real-time   Serverless  Batch
Endpoint    Inference   Transform
```

---

## Key Takeaways

1. **SageMaker Benefits:**
   - Fully managed ML service
   - No infrastructure management
   - Automatic scaling
   - Integrated with AWS ecosystem

2. **Training:**
   - Managed training jobs
   - Built-in algorithms
   - Custom scripts supported
   - Spot instances for cost savings

3. **Hyperparameter Tuning:**
   - Automatic optimization
   - Bayesian search
   - Parallel jobs
   - Best model selection

4. **Deployment:**
   - Real-time endpoints
   - Batch transform
   - Serverless inference
   - Auto-scaling

5. **Built-in Algorithms:**
   - XGBoost, Linear Learner
   - Image classification
   - BlazingText, DeepAR
   - Optimized and scalable

6. **Cost Optimization:**
   - Use spot instances
   - Right-size instances
   - Delete unused endpoints
   - Batch transform for offline
   - Monitor with Cost Explorer

7. **Monitoring:**
   - CloudWatch logs and metrics
   - Model monitoring
   - Endpoint metrics
   - Cost tracking

8. **Best Practices:**
   - Start small, scale up
   - Use checkpoints for spot
   - Version models
   - Monitor costs
   - Test before production
   - Delete unused resources

---

**Navigation:** [← FastAPI](./fastapi.md) | [Back to Index](./README.md)
