# Pipeline Orchestration

## What You'll Learn

Production ML pipelines integrate data extraction, preprocessing, training, evaluation, and deployment into automated workflows. This guide demonstrates end-to-end pipeline orchestration using Airflow with cloud services, MLflow tracking, and production deployment patterns.

## Complete Production Pipeline

This example shows a full ML pipeline with S3 storage, PostgreSQL data source, and MLflow tracking:

```python
# dags/complete_ml_pipeline.py
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.providers.postgres.hooks.postgres import PostgresHook
from datetime import datetime, timedelta
import pandas as pd
import joblib
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score

default_args = {
    'owner': 'ml-team',
    'start_date': datetime(2024, 1, 1),
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
    'email': ['ml-team@example.com'],
    'email_on_failure': True
}

dag = DAG(
    'complete_ml_pipeline',
    default_args=default_args,
    description='Complete ML pipeline with cloud integration',
    schedule_interval='@daily',
    catchup=False,
    tags=['ml', 'production']
)

def extract_from_database(**context):
    """Extract data from PostgreSQL"""
    pg_hook = PostgresHook(postgres_conn_id='postgres_ml')

    query = """
        SELECT * FROM customers
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    """
    df = pg_hook.get_pandas_df(query)

    # Save to S3
    s3_hook = S3Hook(aws_conn_id='aws_default')
    csv_buffer = df.to_csv(index=False)
    s3_key = f'data/raw/customers_{context["ds"]}.csv'

    s3_hook.load_string(
        string_data=csv_buffer,
        key=s3_key,
        bucket_name='ml-data-bucket',
        replace=True
    )

    context['task_instance'].xcom_push(key='raw_data_key', value=s3_key)
    print(f"Extracted {len(df)} rows to S3: {s3_key}")

    return s3_key

def preprocess_data(**context):
    """Feature engineering and preprocessing"""
    s3_hook = S3Hook(aws_conn_id='aws_default')

    # Get raw data location from previous task
    raw_key = context['task_instance'].xcom_pull(
        task_ids='extract_data',
        key='raw_data_key'
    )

    # Load from S3
    obj = s3_hook.get_key(raw_key, bucket_name='ml-data-bucket')
    df = pd.read_csv(obj.get()['Body'])

    # Feature engineering
    df['age_income_ratio'] = df['age'] / (df['income'] + 1)
    df['credit_utilization'] = df['credit_used'] / (df['credit_limit'] + 1)
    df['debt_to_income'] = df['debt'] / (df['income'] + 1)

    # Handle missing values
    df = df.fillna(df.median())

    # Remove outliers
    for col in df.select_dtypes(include=['float64', 'int64']).columns:
        q1 = df[col].quantile(0.01)
        q99 = df[col].quantile(0.99)
        df = df[(df[col] >= q1) & (df[col] <= q99)]

    # Save processed data to S3
    processed_key = f'data/processed/customers_{context["ds"]}.csv'
    csv_buffer = df.to_csv(index=False)

    s3_hook.load_string(
        string_data=csv_buffer,
        key=processed_key,
        bucket_name='ml-data-bucket',
        replace=True
    )

    context['task_instance'].xcom_push(key='processed_data_key', value=processed_key)
    print(f"Processed {len(df)} rows to S3: {processed_key}")

    return processed_key

def train_model_with_mlflow(**context):
    """Train model and log with MLflow"""
    s3_hook = S3Hook(aws_conn_id='aws_default')

    # Load processed data
    processed_key = context['task_instance'].xcom_pull(
        task_ids='preprocess_data',
        key='processed_data_key'
    )
    obj = s3_hook.get_key(processed_key, bucket_name='ml-data-bucket')
    df = pd.read_csv(obj.get()['Body'])

    # Split data
    X = df.drop('target', axis=1)
    y = df['target']
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # MLflow tracking
    mlflow.set_experiment('customer_churn_prediction')

    with mlflow.start_run():
        # Train model
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=6,
            min_samples_split=10,
            random_state=42
        )
        model.fit(X_train, y_train)

        # Evaluate
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average='weighted')

        # Log parameters
        mlflow.log_params({
            'n_estimators': 100,
            'max_depth': 6,
            'min_samples_split': 10,
            'model_type': 'RandomForest'
        })

        # Log metrics
        mlflow.log_metrics({
            'accuracy': accuracy,
            'f1_score': f1,
            'train_size': len(X_train),
            'test_size': len(X_test)
        })

        # Log model
        mlflow.sklearn.log_model(model, 'model')

        # Save model to S3
        model_key = f'models/model_{context["ds"]}.pkl'
        model_bytes = joblib.dumps(model)

        s3_hook.load_bytes(
            bytes_data=model_bytes,
            key=model_key,
            bucket_name='ml-models-bucket',
            replace=True
        )

        # Push to XCom
        context['task_instance'].xcom_push(key='accuracy', value=accuracy)
        context['task_instance'].xcom_push(key='f1_score', value=f1)
        context['task_instance'].xcom_push(key='model_key', value=model_key)

        print(f"Model trained: accuracy={accuracy:.4f}, f1={f1:.4f}")

def validate_model(**context):
    """Validate model performance"""
    accuracy = context['task_instance'].xcom_pull(
        task_ids='train_model',
        key='accuracy'
    )
    f1 = context['task_instance'].xcom_pull(
        task_ids='train_model',
        key='f1_score'
    )

    # Define thresholds
    MIN_ACCURACY = 0.85
    MIN_F1 = 0.80

    if accuracy < MIN_ACCURACY:
        raise ValueError(
            f"Model accuracy {accuracy:.4f} below threshold {MIN_ACCURACY}"
        )

    if f1 < MIN_F1:
        raise ValueError(
            f"Model F1 score {f1:.4f} below threshold {MIN_F1}"
        )

    print(f"✓ Model validated: accuracy={accuracy:.4f}, f1={f1:.4f}")

def deploy_model(**context):
    """Deploy model to production"""
    s3_hook = S3Hook(aws_conn_id='aws_default')

    model_key = context['task_instance'].xcom_pull(
        task_ids='train_model',
        key='model_key'
    )

    # Copy to production path
    production_key = 'models/production/model.pkl'

    s3_hook.copy_object(
        source_bucket_name='ml-models-bucket',
        source_bucket_key=model_key,
        dest_bucket_name='ml-models-bucket',
        dest_bucket_key=production_key
    )

    # Log deployment
    print(f"✓ Model deployed to production")
    print(f"  Source: {model_key}")
    print(f"  Destination: {production_key}")

    # Send notification (in production: email/Slack)
    accuracy = context['task_instance'].xcom_pull(
        task_ids='train_model',
        key='accuracy'
    )
    print(f"Deployment notification: New model with accuracy {accuracy:.4f}")

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

## Pipeline Architecture

```
┌─────────────────────────────────────────────────┐
│         Complete ML Pipeline Flow               │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. Extract                                     │
│     PostgreSQL → S3 (raw data)                  │
│                                                 │
│  2. Preprocess                                  │
│     S3 (raw) → Transform → S3 (processed)       │
│                                                 │
│  3. Train                                       │
│     S3 (processed) → Model → S3 (models)        │
│     └─ MLflow tracks metrics                    │
│                                                 │
│  4. Validate                                    │
│     Check accuracy/F1 thresholds                │
│                                                 │
│  5. Deploy                                      │
│     S3 (models) → S3 (production)               │
│     └─ Send notifications                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Pipeline Monitoring

Track pipeline health and performance:

```python
from airflow.models import DagRun
from datetime import datetime, timedelta

def monitor_pipeline_health():
    """Check pipeline execution health"""
    dag_id = 'complete_ml_pipeline'

    # Get recent runs
    recent_runs = DagRun.find(
        dag_id=dag_id,
        execution_start_date=datetime.utcnow() - timedelta(days=7)
    )

    # Calculate success rate
    total_runs = len(recent_runs)
    successful_runs = len([r for r in recent_runs if r.state == 'success'])
    success_rate = successful_runs / total_runs if total_runs > 0 else 0

    print(f"Pipeline Health Report:")
    print(f"  Total runs (7 days): {total_runs}")
    print(f"  Successful: {successful_runs}")
    print(f"  Success rate: {success_rate:.1%}")

    # Alert if success rate is low
    if success_rate < 0.9:
        print(f"⚠ WARNING: Pipeline success rate below 90%")

    return {
        'total_runs': total_runs,
        'successful_runs': successful_runs,
        'success_rate': success_rate
    }
```

## Best Practices

1. **Separate concerns** - One task per responsibility
2. **Use cloud storage** - S3, GCS for data persistence
3. **Track experiments** - MLflow, Weights & Biases
4. **Validate before deploy** - Set performance thresholds
5. **Monitor pipeline health** - Success rate, duration
6. **Handle failures gracefully** - Retries, alerts
7. **Version everything** - Data, code, models
8. **Test locally first** - Before production deployment

## Common Patterns

### Parallel Model Training

Train multiple models simultaneously:

```python
from airflow.operators.python import PythonOperator

models = ['random_forest', 'xgboost', 'lightgbm']

# Create tasks dynamically
train_tasks = []
for model_name in models:
    task = PythonOperator(
        task_id=f'train_{model_name}',
        python_callable=train_model,
        op_kwargs={'model_type': model_name},
        dag=dag
    )
    train_tasks.append(task)

# All train in parallel, then compare
preprocess_task >> train_tasks >> compare_models_task
```

### Conditional Deployment

Deploy only if model improves:

```python
def should_deploy(**context):
    """Compare new model with current production model"""
    new_accuracy = context['ti'].xcom_pull(key='accuracy')
    current_accuracy = get_production_model_accuracy()

    if new_accuracy > current_accuracy + 0.02:  # 2% improvement
        return 'deploy_model'
    else:
        return 'skip_deployment'
```

## Quick Reference

```python
# Create DAG
dag = DAG('pipeline_name', schedule_interval='@daily')

# Create task
task = PythonOperator(
    task_id='task_name',
    python_callable=function_name,
    dag=dag
)

# Set dependencies
task1 >> task2 >> [task3, task4]  # Parallel after task2

# Share data
context['ti'].xcom_push(key='name', value=data)
data = context['ti'].xcom_pull(task_ids='task_name', key='name')
```

## Summary

Production ML pipeline orchestration requires coordinating data extraction, preprocessing, training, validation, and deployment. Use Airflow for workflow management, cloud storage for data persistence, and MLflow for experiment tracking. Implement proper validation gates, monitor pipeline health, and handle failures gracefully. Well-orchestrated pipelines enable reliable, repeatable model training and deployment at scale.

---

**Related Topics:**
- [Airflow for ML Basics](./airflow-ml-basics.md)
- [Model Monitoring Basics](./model-monitoring-basics.md)
- [Drift Detection](./drift-detection.md)
- [Monitoring Best Practices](./monitoring-best-practices.md)
