# LightGBM Implementation - Building Your First Models

## What You'll Learn

Learn how to implement LightGBM models for classification and regression tasks. You'll master both the sklearn-style API and the native LightGBM API, understand when to use each, and learn best practices for model training and evaluation.

## Installation

```bash
# Install LightGBM
pip install lightgbm

# For GPU support (optional)
pip install lightgbm --install-option=--gpu
```

## Two APIs: Which to Choose?

LightGBM offers two interfaces, each with distinct advantages:

### sklearn API: Quick and Familiar
**Use when:**
- Building quick prototypes
- Using sklearn pipelines
- Need drop-in XGBoost replacement
- Working with GridSearchCV

### Native API: Power and Control
**Use when:**
- Need early stopping with validation sets
- Want custom callbacks
- Require fine-grained control
- Working with large datasets from files

## Classification: sklearn API

### Basic Binary Classification

```python
import lightgbm as lgb
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report
import numpy as np

# Load data
data = load_breast_cancer()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Create and train model
lgb_clf = lgb.LGBMClassifier(
    n_estimators=100,           # Number of boosting rounds
    max_depth=-1,               # No depth limit (use num_leaves)
    num_leaves=31,              # Max leaves per tree
    learning_rate=0.1,          # Shrinkage rate
    min_child_samples=20,       # Min samples in leaf
    subsample=0.8,              # Row sampling ratio
    colsample_bytree=0.8,       # Column sampling ratio
    reg_alpha=0.0,              # L1 regularization
    reg_lambda=0.0,             # L2 regularization
    random_state=42,
    n_jobs=-1                   # Use all cores
)

lgb_clf.fit(X_train, y_train)

# Predictions
y_pred = lgb_clf.predict(X_test)
y_proba = lgb_clf.predict_proba(X_test)[:, 1]

# Evaluation
print("Accuracy:", accuracy_score(y_test, y_pred))
print("AUC:", roc_auc_score(y_test, y_proba))
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=data.target_names))

# Feature importance
feature_imp = lgb_clf.feature_importances_
top_features = np.argsort(feature_imp)[::-1][:5]
print("\nTop 5 Features:")
for i in top_features:
    print(f"{data.feature_names[i]}: {feature_imp[i]:.4f}")
```

### Multi-class Classification

```python
from sklearn.datasets import load_iris

# Load data
data = load_iris()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Multi-class model
lgb_clf = lgb.LGBMClassifier(
    objective='multiclass',     # Explicitly set multi-class
    num_class=3,                # Number of classes
    n_estimators=100,
    num_leaves=31,
    learning_rate=0.1
)

lgb_clf.fit(X_train, y_train)

# Predictions
y_pred = lgb_clf.predict(X_test)
y_proba = lgb_clf.predict_proba(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nPrediction probabilities shape:", y_proba.shape)  # (n_samples, 3)
```

## Classification: Native API

The native API provides more control and features:

```python
# Create LightGBM datasets
train_data = lgb.Dataset(
    X_train,
    label=y_train,
    feature_name=list(data.feature_names)
)

test_data = lgb.Dataset(
    X_test,
    label=y_test,
    feature_name=list(data.feature_names),
    reference=train_data  # Important for consistency
)

# Parameters dictionary
params = {
    'objective': 'binary',
    'metric': ['binary_logloss', 'auc'],
    'boosting_type': 'gbdt',    # 'gbdt', 'dart', 'goss', 'rf'
    'num_leaves': 31,
    'learning_rate': 0.1,
    'feature_fraction': 0.8,    # colsample_bytree
    'bagging_fraction': 0.8,    # subsample
    'bagging_freq': 5,          # Bagging every 5 iterations
    'verbose': -1,              # Suppress warnings
    'seed': 42
}

# Train with validation and callbacks
evals_result = {}
gbm = lgb.train(
    params,
    train_data,
    num_boost_round=100,
    valid_sets=[train_data, test_data],
    valid_names=['train', 'test'],
    callbacks=[
        lgb.early_stopping(stopping_rounds=10),
        lgb.log_evaluation(period=10),
        lgb.record_evaluation(evals_result)
    ]
)

# Predictions
y_pred_proba = gbm.predict(X_test, num_iteration=gbm.best_iteration)
y_pred = (y_pred_proba > 0.5).astype(int)

print("\nBest iteration:", gbm.best_iteration)
print("Test AUC:", roc_auc_score(y_test, y_pred_proba))
```

### Visualize Training Progress

```python
import matplotlib.pyplot as plt

# Plot metrics over iterations
lgb.plot_metric(evals_result, metric='auc')
plt.title('Training Progress')
plt.show()

# Plot feature importance
lgb.plot_importance(gbm, max_num_features=10, importance_type='gain')
plt.title('Top 10 Features by Gain')
plt.tight_layout()
plt.show()
```

## Regression Implementation

```python
from sklearn.datasets import make_regression
from sklearn.metrics import mean_squared_error, r2_score

# Generate regression data
X, y = make_regression(n_samples=1000, n_features=20, noise=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# LightGBM Regressor
lgb_reg = lgb.LGBMRegressor(
    n_estimators=100,
    num_leaves=31,
    learning_rate=0.1,
    objective='regression',     # 'regression', 'regression_l1', 'huber'
    metric='rmse',
    random_state=42,
    n_jobs=-1
)

lgb_reg.fit(X_train, y_train)

# Predictions and evaluation
y_pred = lgb_reg.predict(X_test)

print("R² Score:", r2_score(y_test, y_pred))
print("RMSE:", np.sqrt(mean_squared_error(y_test, y_pred)))
```

### Different Loss Functions

```python
# L1 Loss (MAE) - robust to outliers
lgb_l1 = lgb.LGBMRegressor(objective='regression_l1', metric='mae')

# Huber Loss - combines L1 and L2
lgb_huber = lgb.LGBMRegressor(objective='huber', metric='huber')

# Quantile Regression - predict specific quantile
lgb_quantile = lgb.LGBMRegressor(
    objective='quantile',
    alpha=0.9  # Predict 90th percentile
)
```

## Using Different Boosting Types

### GOSS: Faster Training

```python
# GOSS for large datasets
lgb_goss = lgb.LGBMClassifier(
    boosting_type='goss',
    top_rate=0.2,
    other_rate=0.1,
    n_estimators=100,
    num_leaves=31
)

lgb_goss.fit(X_train, y_train)
print("GOSS Accuracy:", lgb_goss.score(X_test, y_test))
```

### DART: Dropout Regularization

```python
# DART for better generalization
lgb_dart = lgb.LGBMClassifier(
    boosting_type='dart',
    n_estimators=100,
    num_leaves=31,
    drop_rate=0.1,          # Dropout rate
    skip_drop=0.5,          # Probability of skipping dropout
    random_state=42
)

lgb_dart.fit(X_train, y_train)
print("DART Accuracy:", lgb_dart.score(X_test, y_test))
```

## Best Practices

### 1. Always Use Validation Sets

```python
# Good: With validation for early stopping
lgb_clf.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    eval_metric='auc',
    callbacks=[lgb.early_stopping(stopping_rounds=10)]
)

# Bad: Training without validation
lgb_clf.fit(X_train, y_train)  # Risk of overfitting
```

### 2. Start with Conservative Parameters

```python
# Good starting point
default_params = {
    'num_leaves': 31,           # Conservative leaf count
    'learning_rate': 0.1,       # Standard learning rate
    'n_estimators': 100,        # Start small, increase if needed
    'min_child_samples': 20,    # Prevent tiny leaves
    'subsample': 0.8,           # Slight randomization
    'colsample_bytree': 0.8
}
```

### 3. Feature Importance Analysis

```python
# Multiple importance types
importance_gain = lgb_clf.feature_importances_  # Default: 'split'
importance_split = lgb_clf.booster_.feature_importance(importance_type='split')
importance_gain_explicit = lgb_clf.booster_.feature_importance(importance_type='gain')

# Visualize
lgb.plot_importance(lgb_clf, max_num_features=10, importance_type='gain')
plt.title('Feature Importance (Gain)')
plt.show()
```

## Common Pitfalls

### Pitfall 1: Ignoring Early Stopping
**Problem**: Training all iterations even when validation metric stops improving.
**Solution**: Always use early stopping with validation set.

### Pitfall 2: Wrong num_leaves for Dataset Size
**Problem**: num_leaves=127 on 1000 samples overfits badly.
**Solution**: Scale num_leaves with dataset size. For small data, use 15-31.

### Pitfall 3: Not Setting Random State
**Problem**: Results not reproducible.
**Solution**: Always set `random_state` for reproducibility.

### Pitfall 4: Using Default max_depth=-1 Blindly
**Problem**: Trees can grow extremely deep and overfit.
**Solution**: Set max_depth as a safety limit (6-10) even when using num_leaves.

## Quick Reference

### Essential Parameters

```python
{
    # Tree structure
    'num_leaves': 31,              # Leaf count (more = complex)
    'max_depth': -1,               # Depth limit (-1 = unlimited)
    'min_child_samples': 20,       # Min samples per leaf

    # Learning
    'learning_rate': 0.1,          # Shrinkage
    'n_estimators': 100,           # Boosting rounds

    # Regularization
    'subsample': 0.8,              # Row sampling
    'colsample_bytree': 0.8,       # Column sampling
    'reg_alpha': 0.0,              # L1
    'reg_lambda': 0.0,             # L2

    # Boosting type
    'boosting_type': 'gbdt',       # 'gbdt', 'goss', 'dart'

    # Objective
    'objective': 'binary',         # Task type
    'metric': 'auc',               # Evaluation metric
}
```

## Summary

LightGBM implementation is straightforward:
- **sklearn API**: Quick, familiar, easy integration
- **Native API**: More control, better for production
- **Both APIs**: Support classification and regression
- **Key practices**: Use validation, start conservative, analyze importance

Start with sklearn API for quick experiments, switch to native API when you need more control.

---

**Navigation:**
- **Previous**: [GOSS and EFB](./lightgbm-goss-efb.md)
- **Next**: [LightGBM Advanced Features](./lightgbm-advanced.md)
- **Related**: [LightGBM Core Concepts](./lightgbm-core-concepts.md)
