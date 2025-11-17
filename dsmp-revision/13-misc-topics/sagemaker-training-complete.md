# AWS SageMaker: Training, Tuning, and Deployment

## What You'll Learn

Master the complete SageMaker workflow: training jobs, hyperparameter tuning, model deployment, built-in algorithms, batch transform, monitoring, and cost optimization. This comprehensive guide covers everything you need to productionize ML models on AWS.

## Training Jobs

### Basic Training Job

```python
import sagemaker
from sagemaker.sklearn import SKLearn

# Setup
role = sagemaker.get_execution_role()
session = sagemaker.Session()

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

### Training Script Example

```python
# train.py
import argparse
import os
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

if __name__ == '__main__':
    # Parse hyperparameters
    parser = argparse.ArgumentParser()
    parser.add_argument('--n_estimators', type=int, default=100)
    parser.add_argument('--max_depth', type=int, default=5)
    args, _ = parser.parse_known_args()

    # Load data from SageMaker paths
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

    # Save model to SageMaker path
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

## Hyperparameter Tuning

Automatic hyperparameter optimization using Bayesian methods:

```python
from sagemaker.tuner import (
    IntegerParameter,
    ContinuousParameter,
    HyperparameterTuner
)

# Define search space
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

# Deploy best model
best_predictor = tuner.deploy(
    initial_instance_count=1,
    instance_type='ml.t2.medium'
)
```

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
import json
import numpy as np

def model_fn(model_dir):
    """Load model"""
    model = joblib.load(os.path.join(model_dir, 'model.joblib'))
    return model

def input_fn(request_body, content_type='application/json'):
    """Parse input data"""
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
    if accept == 'application/json':
        return json.dumps(prediction), accept
    else:
        raise ValueError(f"Unsupported accept type: {accept}")
```

## Built-in Algorithms

SageMaker provides optimized algorithms:

**Supervised Learning:**
- XGBoost
- Linear Learner
- Factorization Machines
- K-Nearest Neighbors (KNN)

**Computer Vision:**
- Image Classification
- Object Detection
- Semantic Segmentation

**NLP:**
- BlazingText
- Sequence-to-Sequence

**Unsupervised:**
- K-Means
- PCA
- Random Cut Forest (anomaly detection)

### XGBoost Example

```python
from sagemaker.image_uris import retrieve

# Get XGBoost container
container = retrieve('xgboost', region, version='1.5-1')

# Create estimator
xgb = sagemaker.estimator.Estimator(
    image_uri=container,
    role=role,
    instance_count=1,
    instance_type='ml.m5.xlarge',
    output_path=f's3://{bucket}/output',
    hyperparameters={
        'objective': 'binary:logistic',
        'num_round': 100,
        'max_depth': 5,
        'eta': 0.2
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

## Batch Transform

Offline predictions for large datasets:

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

# Results saved to S3
```

## Monitoring

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
        {'Name': 'EndpointName', 'Value': 'my-endpoint'},
        {'Name': 'VariantName', 'Value': 'AllTraffic'}
    ],
    StartTime=datetime.now() - timedelta(hours=1),
    EndTime=datetime.now(),
    Period=300,
    Statistics=['Average', 'Maximum']
)
```

### Model Monitoring

```python
from sagemaker.model_monitor import DefaultModelMonitor

# Create monitor
monitor = DefaultModelMonitor(
    role=role,
    instance_count=1,
    instance_type='ml.m5.xlarge'
)

# Suggest baseline
monitor.suggest_baseline(
    baseline_dataset=f's3://{bucket}/baseline.csv',
    dataset_format='csv',
    output_s3_uri=f's3://{bucket}/baseline-results'
)

# Create monitoring schedule
monitor.create_monitoring_schedule(
    monitor_schedule_name='my-monitor',
    endpoint_input=predictor.endpoint_name,
    output_s3_uri=f's3://{bucket}/monitoring-output',
    schedule_cron_expression='cron(0 * * * ? *)'  # Hourly
)
```

## Cost Optimization

### Instance Selection

```
Training Instances:
ml.t3.medium     2 vCPU,  4GB   $0.05/hr   Development
ml.m5.xlarge     4 vCPU, 16GB   $0.23/hr   General purpose
ml.c5.2xlarge    8 vCPU, 16GB   $0.39/hr   CPU-intensive
ml.p3.2xlarge    8 vCPU, 61GB   $3.82/hr   GPU (1x V100)

Inference Instances:
ml.t2.medium     2 vCPU,  4GB   $0.05/hr   Low traffic
ml.c5.large      2 vCPU,  4GB   $0.10/hr   Medium traffic
ml.c5.xlarge     4 vCPU,  8GB   $0.20/hr   High traffic
```

### Spot Instances

Save up to 90% on training:

```python
sklearn_estimator = SKLearn(
    entry_point='train.py',
    role=role,
    instance_type='ml.m5.xlarge',
    use_spot_instances=True,           # Use spot
    max_wait=7200,                      # Max wait time
    max_run=3600,                       # Max run time
    checkpoint_s3_uri=f's3://{bucket}/checkpoints'
)
```

## Interview Questions

### Q1: What is AWS SageMaker and its main components?

**Answer:**

AWS SageMaker is a fully managed ML service for building, training, and deploying ML models at scale.

**Main Components:**
1. **SageMaker Studio:** IDE for ML development
2. **Notebooks:** Managed Jupyter notebooks
3. **Training:** Managed training infrastructure
4. **Hyperparameter Tuning:** Automatic optimization
5. **Endpoints:** Real-time inference
6. **Batch Transform:** Offline batch predictions
7. **Model Registry:** Model versioning

**Benefits:**
- No infrastructure management
- Automatic scaling
- Built-in algorithms
- Pay-per-use pricing

### Q2: Explain hyperparameter tuning in SageMaker

**Answer:**

Hyperparameter tuning automatically searches for best hyperparameters using Bayesian optimization.

**How It Works:**
1. Define search space (ranges for each hyperparameter)
2. Define objective metric to optimize
3. SageMaker runs multiple training jobs
4. Uses Bayesian optimization to pick next combination
5. Returns best model

**Example:**
```python
hyperparameter_ranges = {
    'n_estimators': IntegerParameter(10, 200),
    'max_depth': IntegerParameter(3, 10)
}

tuner = HyperparameterTuner(
    estimator=estimator,
    objective_metric_name='validation:accuracy',
    hyperparameter_ranges=hyperparameter_ranges,
    max_jobs=20,
    objective_type='Maximize'
)
```

**Advantages:**
- Automatic optimization
- More efficient than grid search
- Parallel execution

### Q3: Real-time Endpoint vs Batch Transform?

**Answer:**

| Aspect | Real-Time Endpoint | Batch Transform |
|--------|-------------------|-----------------|
| Latency | Low (milliseconds) | High (minutes-hours) |
| Use Case | Online predictions | Offline, large datasets |
| Cost | Always running ($/hour) | Pay per job |
| Scaling | Auto-scaling | Parallel processing |
| When | Web apps, APIs | Periodic batch jobs |

**Real-Time:**
```python
predictor = estimator.deploy(instance_count=1)
prediction = predictor.predict(data)
# Cost: $X/hour × 24 × 30
```

**Batch Transform:**
```python
transformer = estimator.transformer(instance_count=1)
transformer.transform('s3://bucket/data/')
# Cost: $X/hour × job_duration
```

### Q4: How to optimize SageMaker costs?

**Answer:**

**Strategies:**

1. **Use Spot Instances (90% savings):**
```python
use_spot_instances=True
```

2. **Right-Size Instances:**
- Don't use GPU for CPU tasks
- Start small, scale up

3. **Delete Unused Endpoints:**
```python
predictor.delete_endpoint()
```

4. **Batch Transform vs Endpoints:**
- Batch for offline: $5 for 100K predictions
- Endpoints always running: $36/month

5. **Automatic Scaling:**
- Scale down during low traffic

## Quick Reference

```python
# Training
estimator = SKLearn(entry_point='train.py', role=role, instance_type='ml.m5.xlarge')
estimator.fit({'train': 's3://bucket/train.csv'})

# Hyperparameter Tuning
tuner = HyperparameterTuner(estimator=estimator, objective_metric_name='accuracy',
                             hyperparameter_ranges={'n_estimators': IntegerParameter(10, 200)})
tuner.fit({'train': train_data})

# Deployment
predictor = estimator.deploy(initial_instance_count=1, instance_type='ml.t2.medium')
prediction = predictor.predict(data)
predictor.delete_endpoint()

# Batch Transform
transformer = estimator.transformer(instance_count=1)
transformer.transform(data='s3://bucket/input.csv')
```

---

**Navigation:** [← SageMaker Introduction](./sagemaker-introduction.md) | [Back to Index](./README.md)
