# Apache Airflow for ML Pipelines

## What You'll Learn

ML pipelines involve multiple dependent steps that need orchestration. This guide introduces Apache Airflow for scheduling and managing ML workflows. You'll learn to create DAGs (Directed Acyclic Graphs) that automate data extraction, preprocessing, training, and deployment.

## Why Airflow for ML?

ML pipelines have unique challenges:

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

**Airflow vs Alternatives:**
- **Kubeflow**: Kubernetes-native, more complex
- **Prefect**: Modern alternative, simpler API
- **MLflow Projects**: Lightweight, fewer features
- **Cron jobs**: Too simple, no dependency management

## Basic Airflow Concepts

### 1. DAG (Directed Acyclic Graph)

A workflow definition with tasks and their dependencies:

```python
from airflow import DAG
from datetime import datetime

dag = DAG(
    'ml_training_pipeline',
    description='Train ML model daily',
    schedule_interval='@daily',  # or '0 2 * * *' for 2 AM
    start_date=datetime(2024, 1, 1),
    catchup=False  # Don't run for past dates
)
```

### 2. Operators

Tasks that perform specific actions:

- **PythonOperator**: Run Python functions
- **BashOperator**: Run bash commands
- **EmailOperator**: Send emails
- **SlackOperator**: Send Slack notifications

### 3. Dependencies

Define task execution order:

```python
task_a >> task_b >> task_c  # Sequential
task_a >> [task_b, task_c]  # Parallel after task_a
```

## Complete ML Training Pipeline

Here's a production-ready ML pipeline:

```python
# dags/ml_training_pipeline.py
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

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
    from sqlalchemy import create_engine

    engine = create_engine('postgresql://user:pass@localhost/db')
    query = """
        SELECT * FROM customers
        WHERE date >= CURRENT_DATE - INTERVAL '30 days'
    """
    df = pd.read_sql(query, con=engine)

    # Save to local file
    output_path = '/tmp/raw_data.csv'
    df.to_csv(output_path, index=False)

    # Push metadata to XCom (cross-communication)
    context['task_instance'].xcom_push(key='data_path', value=output_path)
    context['task_instance'].xcom_push(key='num_rows', value=len(df))

    print(f"Extracted {len(df)} rows")

def preprocess_data(**context):
    """Preprocess and engineer features"""
    # Pull data path from previous task
    data_path = context['task_instance'].xcom_pull(
        task_ids='extract_data',
        key='data_path'
    )

    df = pd.read_csv(data_path)

    # Preprocessing
    df = df.dropna()
    df = df.drop_duplicates()

    # Feature engineering
    df['age_income_ratio'] = df['age'] / (df['income'] + 1)

    # Save processed data
    output_path = '/tmp/processed_data.csv'
    df.to_csv(output_path, index=False)

    context['task_instance'].xcom_push(
        key='processed_data_path',
        value=output_path
    )

    print(f"Processed {len(df)} rows")

def train_model(**context):
    """Train model"""
    # Load processed data
    data_path = context['task_instance'].xcom_pull(
        task_ids='preprocess_data',
        key='processed_data_path'
    )
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

    # Push to XCom
    context['task_instance'].xcom_push(key='accuracy', value=accuracy)
    context['task_instance'].xcom_push(key='model_path', value=model_path)

    print(f"Model trained with accuracy: {accuracy:.4f}")

def evaluate_model(**context):
    """Evaluate model and decide if deployment needed"""
    accuracy = context['task_instance'].xcom_pull(
        task_ids='train_model',
        key='accuracy'
    )

    DEPLOYMENT_THRESHOLD = 0.85

    if accuracy >= DEPLOYMENT_THRESHOLD:
        print(f"✓ Model passed evaluation (accuracy: {accuracy:.4f})")
        return 'deploy_model'  # Branch to deployment
    else:
        print(f"✗ Model failed evaluation (accuracy: {accuracy:.4f})")
        return 'send_alert'  # Branch to alert

def deploy_model(**context):
    """Deploy model to production"""
    import shutil

    model_path = context['task_instance'].xcom_pull(
        task_ids='train_model',
        key='model_path'
    )

    # Copy to production directory
    production_path = '/app/models/production/model.pkl'
    shutil.copy(model_path, production_path)

    print(f"✓ Model deployed to production")

def send_alert(**context):
    """Send alert if model performance is poor"""
    accuracy = context['task_instance'].xcom_pull(
        task_ids='train_model',
        key='accuracy'
    )

    print(f"⚠ ALERT: Model performance below threshold: {accuracy:.4f}")
    # In production: Send email/Slack notification

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

# Define dependencies
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
│preprocess    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ train_model  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ evaluate     │
└──────┬───────┘
       │
       ├──────▶ deploy (if good)
       │
       └──────▶ alert (if bad)
```

## Advanced Airflow Patterns

### 1. Branching

Choose different paths based on conditions:

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

### 2. Dynamic Task Generation

Generate tasks programmatically:

```python
from airflow.models import Variable

# Get models to train from Airflow Variables
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

### 3. Sensors

Wait for external conditions:

```python
from airflow.sensors.filesystem import FileSensor

wait_for_data = FileSensor(
    task_id='wait_for_data',
    filepath='/data/new_data.csv',
    poke_interval=60,  # Check every 60 seconds
    timeout=3600,      # Give up after 1 hour
    dag=dag
)

wait_for_data >> extract_task
```

## Schedule Intervals

Common scheduling patterns:

```python
# Cron expressions
'0 2 * * *'      # Daily at 2 AM
'0 */4 * * *'    # Every 4 hours
'0 0 * * 0'      # Weekly on Sunday
'0 0 1 * *'      # Monthly on 1st

# Presets
'@daily'         # Once a day at midnight
'@weekly'        # Once a week at midnight Sunday
'@monthly'       # Once a month at midnight on first day
'@hourly'        # Every hour
None             # Manual trigger only
```

## Best Practices

1. **Use XCom for small data** - Not for large datasets
2. **Store large files externally** - S3, HDFS, database
3. **Set appropriate retries** - With exponential backoff
4. **Use pools** for resource management
5. **Tag DAGs** for organization
6. **Monitor DAG performance** - Execution time, success rate
7. **Test DAGs locally** before deployment

## Common Pitfalls

**Passing large data through XCom:**
```python
# WRONG - XCom not for large data
df = pd.read_csv('large_file.csv')
context['ti'].xcom_push(key='data', value=df.to_dict())

# RIGHT - Pass path, not data
df.to_csv('/tmp/data.csv')
context['ti'].xcom_push(key='data_path', value='/tmp/data.csv')
```

**Not handling task failures:**
```python
# WRONG - No retry logic
default_args = {}

# RIGHT - Configure retries
default_args = {
    'retries': 2,
    'retry_delay': timedelta(minutes=5)
}
```

## Quick Reference

```bash
# Start Airflow
airflow standalone  # Development
airflow webserver   # Production
airflow scheduler   # Production

# Trigger DAG
airflow dags trigger ml_training_pipeline

# Test task
airflow tasks test ml_training_pipeline extract_data 2024-01-01

# List DAGs
airflow dags list
```

## Summary

Apache Airflow orchestrates complex ML pipelines through DAGs, providing scheduling, dependency management, retry logic, and monitoring. Create PythonOperators for ML tasks, use XCom for small metadata passing, implement branching for conditional workflows, and leverage dynamic task generation for flexibility. Airflow's web UI provides visibility into pipeline execution and debugging capabilities essential for production ML systems.

---

**Related Topics:**
- [Pipeline Orchestration](./pipeline-orchestration.md)
- [Monitoring Best Practices](./monitoring-best-practices.md)
- [Drift Detection](./drift-detection.md)
