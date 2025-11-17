# CatBoost Implementation - Building Production-Ready Models

## What You'll Learn

Learn how to implement CatBoost models for classification and regression with categorical features. Master the Pool data structure, handle different data types, and build robust models that work in production.

## Installation

```bash
# Standard installation
pip install catboost

# With GPU support (if you have CUDA)
pip install catboost
```

## Basic Classification with Categorical Features

### The Power of Direct Categorical Handling

```python
from catboost import CatBoostClassifier, Pool
import pandas as pd
import numpy as np

# Create dataset with categorical features
df = pd.DataFrame({
    'age': [25, 30, 35, 40, 45, 50, 55, 60],
    'city': ['NYC', 'LA', 'NYC', 'SF', 'LA', 'NYC', 'SF', 'LA'],
    'gender': ['M', 'F', 'M', 'F', 'M', 'F', 'M', 'F'],
    'income': ['Low', 'High', 'Medium', 'High', 'Low', 'High', 'Medium', 'High'],
    'purchased': [0, 1, 0, 1, 0, 1, 0, 1]
})

X = df.drop('purchased', axis=1)
y = df['purchased']

# Identify categorical features
cat_features = ['city', 'gender', 'income']

# CatBoost handles strings directly - NO PREPROCESSING NEEDED!
model = CatBoostClassifier(
    iterations=100,
    learning_rate=0.1,
    depth=6,
    cat_features=cat_features,  # Just specify column names
    random_seed=42,
    verbose=False
)

# Fit with string categories
model.fit(X, y)

print("Model trained successfully with categorical features!")
print(f"Categorical features: {cat_features}")
```

### Real Dataset Example

```python
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report

# Load data
data = load_breast_cancer()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# CatBoost Classifier
cat_clf = CatBoostClassifier(
    iterations=100,            # Number of trees
    learning_rate=0.1,         # Step size
    depth=6,                   # Tree depth (max 16)
    loss_function='Logloss',   # 'Logloss', 'CrossEntropy'
    eval_metric='AUC',         # Metric to display
    random_seed=42,
    verbose=10                 # Print every 10 iterations
)

# Train with validation set
cat_clf.fit(
    X_train, y_train,
    eval_set=(X_test, y_test),
    early_stopping_rounds=10,  # Stop if no improvement
    plot=False                 # Set True for interactive plot
)

# Predictions
y_pred = cat_clf.predict(X_test)
y_proba = cat_clf.predict_proba(X_test)[:, 1]

# Evaluation
print("\nAccuracy:", accuracy_score(y_test, y_pred))
print("AUC:", roc_auc_score(y_test, y_proba))

# Feature importance
feature_imp = cat_clf.get_feature_importance()
top_features = np.argsort(feature_imp)[::-1][:5]
print("\nTop 5 Features:")
for i in top_features:
    print(f"{data.feature_names[i]}: {feature_imp[i]:.4f}")
```

## Using Pool: The Recommended Approach

### What is Pool?

Pool is CatBoost's data container that provides:
- Efficient memory usage
- Automatic categorical detection
- Feature metadata storage
- Faster training

### Creating Pools

```python
# Create train pool
train_pool = Pool(
    data=X_train,
    label=y_train,
    cat_features=cat_features,      # Specify categoricals
    feature_names=list(X.columns)   # Column names
)

# Create test pool (no label for prediction)
test_pool = Pool(
    data=X_test,
    label=y_test,
    cat_features=cat_features,
    feature_names=list(X.columns)
)

# Train with pools (faster and more features)
cat_clf = CatBoostClassifier(
    iterations=100,
    learning_rate=0.1,
    depth=6,
    random_seed=42,
    verbose=False
)

cat_clf.fit(train_pool, eval_set=test_pool)

# Predict with pool
predictions = cat_clf.predict(test_pool)
```

### Automatic Categorical Detection

```python
# Pool can auto-detect categoricals for pandas DataFrames
df_train = pd.DataFrame({
    'numeric_col': [1, 2, 3, 4, 5],
    'category_col': pd.Categorical(['A', 'B', 'A', 'C', 'B']),
    'target': [0, 1, 0, 1, 0]
})

# Automatically detects 'category_col' as categorical
train_pool = Pool(df_train.drop('target', axis=1), label=df_train['target'])
```

## Multi-class Classification

```python
from sklearn.datasets import load_iris

# Load data
data = load_iris()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Multi-class classifier
cat_clf_multi = CatBoostClassifier(
    iterations=100,
    learning_rate=0.1,
    depth=6,
    loss_function='MultiClass',    # For multi-class
    random_seed=42,
    verbose=False
)

cat_clf_multi.fit(X_train, y_train, eval_set=(X_test, y_test))

# Predictions
y_pred = cat_clf_multi.predict(X_test)
y_proba = cat_clf_multi.predict_proba(X_test)  # Shape: (n_samples, n_classes)

print("Accuracy:", accuracy_score(y_test, y_pred))
print("Probability shape:", y_proba.shape)
```

## Regression Implementation

```python
from catboost import CatBoostRegressor
from sklearn.datasets import make_regression
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error

# Generate data
X, y = make_regression(n_samples=1000, n_features=20, noise=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# CatBoost Regressor
cat_reg = CatBoostRegressor(
    iterations=100,
    learning_rate=0.1,
    depth=6,
    loss_function='RMSE',      # 'RMSE', 'MAE', 'Quantile', 'Huber'
    random_seed=42,
    verbose=False
)

cat_reg.fit(X_train, y_train, eval_set=(X_test, y_test))

# Predictions
y_pred = cat_reg.predict(X_test)

# Evaluation
print("R² Score:", r2_score(y_test, y_pred))
print("RMSE:", np.sqrt(mean_squared_error(y_test, y_pred)))
print("MAE:", mean_absolute_error(y_test, y_pred))
```

### Different Loss Functions

```python
# MAE (Mean Absolute Error) - robust to outliers
cat_mae = CatBoostRegressor(loss_function='MAE')

# Huber loss - combines MSE and MAE
cat_huber = CatBoostRegressor(loss_function='Huber')

# Quantile regression
cat_quantile = CatBoostRegressor(
    loss_function='Quantile:alpha=0.9'  # Predict 90th percentile
)

# MAPE (Mean Absolute Percentage Error)
cat_mape = CatBoostRegressor(loss_function='MAPE')
```

## Handling Different Data Types

### Text Features (as Categories)

```python
# Text features treated as high-cardinality categoricals
df = pd.DataFrame({
    'user_id': ['user_001', 'user_002', 'user_003'],
    'product_id': ['prod_A', 'prod_B', 'prod_A'],
    'review_text': ['Great!', 'Bad', 'Excellent'],
    'purchased_again': [1, 0, 1]
})

cat_features = ['user_id', 'product_id', 'review_text']

model = CatBoostClassifier(cat_features=cat_features, verbose=False)
model.fit(df.drop('purchased_again', axis=1), df['purchased_again'])
```

### Mixed Numeric and Categorical

```python
# Best practice: explicitly mark categoricals
df = pd.DataFrame({
    'age': [25, 30, 35],           # Numeric
    'income': [50000, 60000, 70000],  # Numeric
    'city': ['NYC', 'LA', 'SF'],   # Categorical
    'job': ['Engineer', 'Doctor', 'Teacher'],  # Categorical
    'target': [0, 1, 0]
})

cat_features = ['city', 'job']  # Only specify categoricals

model = CatBoostClassifier(
    cat_features=cat_features,
    verbose=False
)

model.fit(
    df.drop('target', axis=1),
    df['target']
)
```

### High-Cardinality Categoricals

```python
# CatBoost excels with high-cardinality features
# Example: User IDs with thousands of unique values

# Generate high-cardinality data
n_samples = 10000
n_unique_users = 5000

df = pd.DataFrame({
    'user_id': [f'user_{i % n_unique_users}' for i in range(n_samples)],
    'product_id': [f'prod_{i % 1000}' for i in range(n_samples)],
    'age': np.random.randint(18, 80, n_samples),
    'clicked': np.random.randint(0, 2, n_samples)
})

# CatBoost handles high-cardinality automatically
cat_features = ['user_id', 'product_id']

model = CatBoostClassifier(
    iterations=200,
    cat_features=cat_features,
    verbose=False
)

X = df.drop('clicked', axis=1)
y = df['clicked']

model.fit(X, y)
print(f"Trained on {n_unique_users} unique users successfully!")
```

## Early Stopping and Overfitting Prevention

### Using Early Stopping

```python
model = CatBoostClassifier(
    iterations=1000,           # Max iterations
    learning_rate=0.05,
    depth=6,
    random_seed=42,
    verbose=50
)

# Early stopping halts training when validation stops improving
model.fit(
    X_train, y_train,
    eval_set=(X_test, y_test),
    early_stopping_rounds=20,  # Stop if no improvement for 20 rounds
    verbose=False
)

print(f"Stopped at iteration: {model.get_best_iteration()}")
print(f"Best validation score: {model.get_best_score()}")
```

## Model Evaluation Metrics

### Classification Metrics

```python
# Available loss functions for binary classification
loss_functions = [
    'Logloss',        # Cross-entropy
    'CrossEntropy',   # Same as Logloss
    'Focal:alpha=0.25:gamma=2',  # Focal loss for imbalance
]

# Evaluation metrics
eval_metrics = [
    'AUC',            # Area under ROC curve
    'Accuracy',       # Classification accuracy
    'Precision',      # Precision score
    'Recall',         # Recall score
    'F1',             # F1 score
]

model = CatBoostClassifier(
    loss_function='Logloss',
    eval_metric='AUC',
    custom_metric=['Accuracy', 'F1']  # Track multiple metrics
)
```

## Best Practices

### 1. Always Specify Categorical Features

```python
# Good: Explicit categorical declaration
cat_features = ['category_col1', 'category_col2']
model = CatBoostClassifier(cat_features=cat_features)

# Bad: Let CatBoost guess (might treat as numeric)
model = CatBoostClassifier()  # Risky!
```

### 2. Use Validation Sets

```python
# Good: Monitor validation performance
model.fit(X_train, y_train, eval_set=(X_val, y_val))

# Bad: No validation monitoring
model.fit(X_train, y_train)  # Can't detect overfitting
```

### 3. Start with Conservative Depth

```python
# Good: Start with depth 6-8
model = CatBoostClassifier(depth=6)

# Bad: Very deep trees without validation
model = CatBoostClassifier(depth=16)  # Likely overfits
```

## Common Pitfalls

### Pitfall 1: Forgetting cat_features Parameter
**Problem**: Model treats categories as numbers.
**Solution**: Always specify cat_features explicitly.

### Pitfall 2: Not Using Validation Set
**Problem**: Can't detect overfitting during training.
**Solution**: Always pass eval_set parameter.

### Pitfall 3: Wrong Feature Types in DataFrame
**Problem**: Categorical columns stored as integers.
**Solution**: Convert to strings or use cat_features parameter.

### Pitfall 4: Ignoring Best Iteration
**Problem**: Using all iterations instead of best iteration.
**Solution**: Use `model.get_best_iteration()` for predictions.

## Quick Reference

### Essential Parameters

```python
{
    # Model structure
    'iterations': 100,          # Number of trees
    'depth': 6,                 # Tree depth (1-16)
    'learning_rate': 0.1,       # Step size

    # Categorical handling
    'cat_features': [...],      # List of categorical column names/indices

    # Regularization
    'l2_leaf_reg': 3,           # L2 regularization (default: 3)
    'bagging_temperature': 1,   # Bayesian bootstrap intensity

    # Training control
    'random_seed': 42,          # Reproducibility
    'verbose': 10,              # Logging frequency

    # Loss and metrics
    'loss_function': 'Logloss', # Objective function
    'eval_metric': 'AUC',       # Evaluation metric
}
```

## Summary

CatBoost implementation is elegant and powerful:
- **Direct categorical handling**: No preprocessing needed
- **Pool data structure**: Efficient and feature-rich
- **Multiple loss functions**: Flexible for different tasks
- **Great defaults**: Works well out-of-the-box

Key takeaways:
- Always specify cat_features for categorical columns
- Use validation sets with early stopping
- Start with conservative depth (6-8)
- Use Pool for production code

---

**Navigation:**
- **Previous**: [CatBoost Core Concepts](./catboost-core-concepts.md)
- **Next**: [CatBoost Advanced Features](./catboost-advanced.md)
- **Related**: [LightGBM Implementation](./lightgbm-implementation.md)
