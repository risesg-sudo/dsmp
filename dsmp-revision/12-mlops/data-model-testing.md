# Data Validation and Model Testing

## What You'll Learn

In machine learning, testing goes far beyond unit tests. This guide reveals how to validate your data quality, catch schema drift, detect statistical anomalies, and ensure your models meet performance thresholds. You'll learn to build automated checks that catch issues before they corrupt your models or reach production.

## Why Data and Model Testing Matters

Bad data creates bad models. A model trained on corrupted data might pass all unit tests but fail spectacularly in production. Data and model testing acts as your early warning system, catching issues when they're cheap to fix.

## Data Schema Validation

Schema validation ensures your data structure remains consistent. A missing column or changed data type can break your entire pipeline.

### Schema Validation Script

```python
# tests/data_validation/validate_schema.py
import pandas as pd
import json
import sys

def validate_schema():
    """Validate data schema matches expected format"""

    # Load expected schema
    with open('config/data_schema.json') as f:
        expected_schema = json.load(f)

    # Load data
    df = pd.read_csv('data/train.csv')

    # Check columns
    expected_columns = set(expected_schema['columns'])
    actual_columns = set(df.columns)

    if expected_columns != actual_columns:
        missing = expected_columns - actual_columns
        extra = actual_columns - expected_columns
        print(f"Schema mismatch!")
        print(f"Missing columns: {missing}")
        print(f"Extra columns: {extra}")
        sys.exit(1)

    # Check data types
    for col, dtype in expected_schema['dtypes'].items():
        if df[col].dtype != dtype:
            print(f"Type mismatch for {col}: expected {dtype}, got {df[col].dtype}")
            sys.exit(1)

    print("Schema validation passed!")

if __name__ == '__main__':
    validate_schema()
```

### Schema Configuration

```json
{
  "columns": [
    "age", "income", "credit_score", "employment_length",
    "loan_amount", "interest_rate", "target"
  ],
  "dtypes": {
    "age": "int64",
    "income": "float64",
    "credit_score": "int64",
    "employment_length": "int64",
    "loan_amount": "float64",
    "interest_rate": "float64",
    "target": "int64"
  }
}
```

## Data Quality Checks

Quality checks go beyond schema validation to examine data content and distributions.

### Quality Check Script

```python
# tests/data_validation/check_quality.py
import pandas as pd
import sys

def check_data_quality():
    """Check data quality metrics"""

    df = pd.read_csv('data/train.csv')

    # Check for missing values
    missing_pct = df.isnull().sum() / len(df) * 100
    if (missing_pct > 10).any():
        print("Too many missing values!")
        print(missing_pct[missing_pct > 10])
        sys.exit(1)

    # Check for duplicates
    dup_count = df.duplicated().sum()
    if dup_count > 0:
        print(f"Found {dup_count} duplicate rows!")
        sys.exit(1)

    # Check target distribution
    target_dist = df['target'].value_counts(normalize=True)
    if target_dist.min() < 0.01:  # Less than 1% of any class
        print("Severe class imbalance!")
        print(target_dist)
        sys.exit(1)

    # Check for outliers
    numeric_cols = df.select_dtypes(include=['float64', 'int64']).columns
    for col in numeric_cols:
        q1, q3 = df[col].quantile([0.25, 0.75])
        iqr = q3 - q1
        outliers = ((df[col] < q1 - 3*iqr) | (df[col] > q3 + 3*iqr)).sum()
        if outliers / len(df) > 0.05:  # More than 5% outliers
            print(f"Warning: {col} has {outliers} outliers ({outliers/len(df)*100:.2f}%)")

    print("Data quality checks passed!")

if __name__ == '__main__':
    check_data_quality()
```

## Advanced Data Validation with Great Expectations

Great Expectations provides a comprehensive framework for data validation:

```python
# tests/data_validation/great_expectations_validation.py
import great_expectations as ge
import sys

def validate_with_ge():
    """Validate data using Great Expectations"""

    # Load data as GE DataFrame
    df = ge.read_csv('data/train.csv')

    # Define expectations
    results = []

    # Column existence
    results.append(df.expect_column_to_exist('age'))
    results.append(df.expect_column_to_exist('income'))

    # Value ranges
    results.append(df.expect_column_values_to_be_between('age', min_value=18, max_value=100))
    results.append(df.expect_column_values_to_be_between('credit_score', min_value=300, max_value=850))

    # Null values
    results.append(df.expect_column_values_to_not_be_null('target'))

    # Unique values
    results.append(df.expect_column_values_to_be_in_set('target', [0, 1]))

    # Statistical properties
    results.append(df.expect_column_mean_to_be_between('income', min_value=30000, max_value=150000))

    # Check if all expectations passed
    if not all(r['success'] for r in results):
        print("Data validation failed!")
        for r in results:
            if not r['success']:
                print(f"Failed: {r['expectation_config']['expectation_type']}")
        sys.exit(1)

    print("Great Expectations validation passed!")

if __name__ == '__main__':
    validate_with_ge()
```

## Model Performance Testing

Model tests ensure your trained model meets minimum performance requirements before deployment.

### Performance Check Script

```python
# tests/model_tests/check_performance.py
import json
import sys

def check_model_performance():
    """Check if model meets minimum performance thresholds"""

    # Load metrics from training/evaluation
    with open('metrics/eval_metrics.json') as f:
        metrics = json.load(f)

    # Define thresholds
    thresholds = {
        'accuracy': 0.80,
        'f1_score': 0.75,
        'precision': 0.70,
        'recall': 0.70
    }

    # Check each metric
    failed = []
    for metric, threshold in thresholds.items():
        if metrics[metric] < threshold:
            failed.append(f"{metric}: {metrics[metric]:.4f} < {threshold}")

    if failed:
        print("Model performance below thresholds:")
        for f in failed:
            print(f"  - {f}")
        sys.exit(1)

    print("Model performance checks passed!")
    for metric, value in metrics.items():
        print(f"  {metric}: {value:.4f}")

if __name__ == '__main__':
    check_model_performance()
```

### Comprehensive Model Testing

```python
# tests/model_tests/test_model.py
import pytest
import joblib
import numpy as np
import time

@pytest.fixture
def model():
    """Load trained model"""
    return joblib.load('models/model.pkl')

def test_model_loads(model):
    """Test model can be loaded"""
    assert model is not None

def test_prediction_shape(model):
    """Test prediction output shape"""
    X = np.random.randn(10, 20)  # 10 samples, 20 features
    predictions = model.predict(X)
    assert predictions.shape == (10,)

def test_prediction_values(model):
    """Test prediction values are valid"""
    X = np.random.randn(100, 20)
    predictions = model.predict(X)
    # For binary classification
    assert set(predictions).issubset({0, 1})

def test_prediction_probabilities(model):
    """Test probability predictions"""
    X = np.random.randn(10, 20)
    probas = model.predict_proba(X)
    # Check shape
    assert probas.shape == (10, 2)
    # Check probabilities sum to 1
    assert np.allclose(probas.sum(axis=1), 1.0)
    # Check range [0, 1]
    assert (probas >= 0).all() and (probas <= 1).all()

def test_inference_time(model):
    """Test inference speed"""
    X = np.random.randn(1000, 20)
    start = time.time()
    predictions = model.predict(X)
    elapsed = time.time() - start
    # Should process 1000 samples in < 1 second
    assert elapsed < 1.0

def test_model_size():
    """Test model file size"""
    import os
    size_mb = os.path.getsize('models/model.pkl') / (1024 * 1024)
    # Model should be under 100MB
    assert size_mb < 100

def test_feature_importance(model):
    """Test feature importances (for tree models)"""
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        # All importances should be non-negative
        assert (importances >= 0).all()
        # Sum should be 1.0 (approximately)
        assert np.isclose(importances.sum(), 1.0)
```

## When to Use Each Type of Test

**Schema Validation**
- Run on every data update
- Before training starts
- In CI/CD pipelines

**Quality Checks**
- During data ingestion
- Before model training
- Weekly on production data

**Great Expectations**
- Complex validation rules
- Multiple data sources
- Generating data documentation

**Model Performance Tests**
- After training completes
- Before deployment
- During A/B testing

## Best Practices

**1. Set Realistic Thresholds**
Don't expect 99% accuracy if your baseline is 75%. Set achievable thresholds that catch major degradation.

**2. Test with Representative Data**
Use sample data that reflects production distribution.

**3. Version Your Tests**
Track test expectations alongside model versions.

**4. Alert on Failures**
Integrate with Slack, email, or PagerDuty for immediate notification.

**5. Document Assumptions**
Clearly document why each threshold was chosen.

## Common Pitfalls

**Too Strict Thresholds**
If tests fail 50% of the time due to random variation, teams will ignore them.

**Testing on Training Data Only**
Always validate on hold-out validation sets.

**Ignoring Edge Cases**
Test with empty inputs, nulls, and out-of-range values.

**No Baseline Comparison**
Always compare against a baseline model (e.g., random, previous version).

## Quick Reference

```python
# Data validation checklist
✓ Schema validation (columns, types)
✓ Missing values check
✓ Duplicate detection
✓ Outlier analysis
✓ Distribution checks
✓ Class balance verification

# Model testing checklist
✓ Performance thresholds (accuracy, F1, etc.)
✓ Inference time limits
✓ Model size constraints
✓ Prediction value validation
✓ Probability calibration
✓ Feature importance sanity check
```

---

**Navigation:**
[← Previous: GitHub Actions ML Pipeline](./github-actions-ml-pipeline.md) | [Next: Docker Fundamentals →](./docker-fundamentals.md)

**Related Topics:**
- [CI/CD Concepts](./cicd-concepts.md)
- [GitHub Actions Basics](./github-actions-basics.md)
