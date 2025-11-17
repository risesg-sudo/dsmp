# LightGBM Advanced Features - Hyperparameter Tuning and Optimization

## What You'll Learn

Master advanced LightGBM techniques including hyperparameter tuning, cross-validation, custom objectives, and performance optimization. These skills will help you squeeze maximum performance from your models.

## Hyperparameter Tuning Strategies

### Understanding the Parameter Space

LightGBM has many parameters, but most important fall into four categories:

**1. Tree Structure**: Control model complexity
**2. Learning**: Control convergence speed
**3. Regularization**: Prevent overfitting
**4. Speed**: Trade accuracy for training time

### Manual Tuning: Step-by-Step Approach

```python
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Step 1: Find optimal num_leaves (most important)
for num_leaves in [15, 31, 63, 127]:
    model = lgb.LGBMClassifier(
        num_leaves=num_leaves,
        learning_rate=0.1,
        n_estimators=100
    )
    model.fit(X_train, y_train)
    score = roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])
    print(f"num_leaves={num_leaves}: AUC={score:.4f}")

# Step 2: Tune learning_rate and n_estimators together
# Lower learning rate + more trees often better

# Step 3: Add regularization
# Try subsample, colsample_bytree, reg_alpha, reg_lambda

# Step 4: Fine-tune min_child_samples
```

### RandomizedSearchCV: Efficient Exploration

```python
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import randint, uniform

# Define parameter distributions
param_dist = {
    'num_leaves': randint(20, 100),
    'learning_rate': uniform(0.01, 0.2),
    'n_estimators': randint(100, 500),
    'min_child_samples': randint(10, 50),
    'subsample': uniform(0.6, 0.4),            # 0.6 to 1.0
    'colsample_bytree': uniform(0.6, 0.4),
    'reg_alpha': uniform(0, 1),
    'reg_lambda': uniform(0, 10)
}

# Random search
random_search = RandomizedSearchCV(
    lgb.LGBMClassifier(random_state=42, n_jobs=-1),
    param_distributions=param_dist,
    n_iter=50,                   # Number of random combinations
    cv=5,                        # 5-fold cross-validation
    scoring='roc_auc',
    random_state=42,
    n_jobs=-1,
    verbose=2
)

random_search.fit(X_train, y_train)

print("Best parameters:", random_search.best_params_)
print("Best CV score:", random_search.best_score_)
print("Test score:", random_search.score(X_test, y_test))

# Get best model
best_model = random_search.best_estimator_
```

### Optuna: Bayesian Optimization

```python
import optuna

def objective(trial):
    params = {
        'num_leaves': trial.suggest_int('num_leaves', 20, 100),
        'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3, log=True),
        'n_estimators': trial.suggest_int('n_estimators', 100, 500),
        'min_child_samples': trial.suggest_int('min_child_samples', 5, 50),
        'subsample': trial.suggest_float('subsample', 0.6, 1.0),
        'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0),
        'reg_alpha': trial.suggest_float('reg_alpha', 0, 1),
        'reg_lambda': trial.suggest_float('reg_lambda', 0, 10),
    }

    model = lgb.LGBMClassifier(**params, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict_proba(X_test)[:, 1]

    return roc_auc_score(y_test, y_pred)

# Run optimization
study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=100)

print("Best AUC:", study.best_value)
print("Best params:", study.best_params)
```

## Built-in Cross-Validation

LightGBM's native CV is faster and more feature-rich:

```python
train_data = lgb.Dataset(X_train, label=y_train)

params = {
    'objective': 'binary',
    'metric': 'auc',
    'num_leaves': 31,
    'learning_rate': 0.1,
    'verbose': -1
}

# Run k-fold cross-validation
cv_results = lgb.cv(
    params,
    train_data,
    num_boost_round=1000,
    nfold=5,                       # 5-fold CV
    stratified=True,               # Maintain class distribution
    shuffle=True,
    callbacks=[
        lgb.early_stopping(stopping_rounds=10),
        lgb.log_evaluation(period=10)
    ],
    seed=42
)

print("\nBest iteration:", len(cv_results['valid auc-mean']))
print("Best CV AUC:", max(cv_results['valid auc-mean']))
print("Std dev:", cv_results['valid auc-stdv'][len(cv_results['valid auc-mean'])-1])
```

## Advanced Features

### Custom Evaluation Metrics

```python
def custom_f1_eval(y_pred, train_data):
    """Custom F1 score metric"""
    from sklearn.metrics import f1_score

    y_true = train_data.get_label()
    y_pred_binary = (y_pred > 0.5).astype(int)
    f1 = f1_score(y_true, y_pred_binary)

    # Return metric_name, metric_value, is_higher_better
    return 'f1', f1, True

# Use custom metric
model = lgb.train(
    params,
    train_data,
    num_boost_round=100,
    valid_sets=[test_data],
    feval=custom_f1_eval
)
```

### Custom Loss Functions

```python
def custom_focal_loss(y_pred, train_data):
    """Focal loss for imbalanced datasets"""
    y_true = train_data.get_label()
    gamma = 2.0
    alpha = 0.25

    p = 1 / (1 + np.exp(-y_pred))  # sigmoid
    grad = alpha * (y_true - p) * ((1 - p) ** gamma) * p * (1 - p)
    hess = alpha * ((1 - p) ** gamma) * p * (1 - p) * (
        (gamma * (2 * p - 1) * (y_true - p)) + (1 - gamma) * p * (1 - p)
    )

    return grad, hess

# Use custom objective
params = {
    'objective': custom_focal_loss,  # Custom objective function
    'metric': 'auc'
}
```

### Feature Interaction Constraints

```python
# Define feature groups that can interact
interaction_constraints = [
    [0, 1, 2],      # Features 0, 1, 2 can interact
    [3, 4],         # Features 3, 4 can interact
    [5, 6, 7, 8]    # Features 5-8 can interact
]

model = lgb.LGBMClassifier(
    interaction_constraints=interaction_constraints
)
```

### Monotonic Constraints

```python
# Ensure monotonic relationships
# 1 = increasing, -1 = decreasing, 0 = no constraint

monotone_constraints = [1, -1, 0, 1, 0]  # For 5 features

# Higher feature 0 → higher prediction
# Higher feature 1 → lower prediction
# Features 2, 4 unconstrained

model = lgb.LGBMClassifier(
    monotone_constraints=monotone_constraints
)
```

## Performance Optimization

### Memory Optimization

```python
# For very large datasets
params = {
    'max_bin': 127,              # Reduce from 255 (less memory)
    'feature_fraction': 0.8,     # Use subset of features
    'bagging_fraction': 0.8,     # Use subset of data
    'bagging_freq': 5,
    'min_data_in_leaf': 50,      # Larger leaves (faster)
    'verbose': -1
}

# Train from file (avoid loading all data in memory)
train_data = lgb.Dataset('train.txt')  # Read from file
model = lgb.train(params, train_data)
```

### Speed Optimization

```python
# Maximum speed settings
params = {
    'boosting_type': 'goss',     # Faster boosting
    'num_leaves': 15,            # Smaller trees
    'max_bin': 127,              # Fewer bins
    'feature_fraction': 0.8,     # Feature subsampling
    'min_data_in_leaf': 50,      # Larger leaves
    'n_jobs': -1                 # All CPU cores
}
```

### GPU Acceleration

```python
# GPU training (requires GPU-enabled LightGBM)
model = lgb.LGBMClassifier(
    device='gpu',
    gpu_platform_id=0,
    gpu_device_id=0,
    n_estimators=100
)

# Or with params dict
params = {
    'device': 'gpu',
    'gpu_platform_id': 0,
    'gpu_device_id': 0
}
```

## Model Persistence

### Save and Load Models

```python
# Save model
model.booster_.save_model('lgb_model.txt')

# Load model
loaded_model = lgb.Booster(model_file='lgb_model.txt')

# Predict with loaded model
predictions = loaded_model.predict(X_test)
```

### Export to JSON

```python
# Export model to JSON
model_json = model.booster_.dump_model()

import json
with open('lgb_model.json', 'w') as f:
    json.dump(model_json, f, indent=2)
```

## Best Practices for Tuning

### The 80/20 Rule

Focus on these parameters first (80% of impact):
1. **num_leaves**: Most important for accuracy
2. **learning_rate + n_estimators**: Control fitting
3. **min_child_samples**: Prevents overfitting
4. **subsample + colsample_bytree**: Adds randomization

### Tuning Order

```python
# Recommended tuning sequence:

# 1. Fix learning_rate=0.1, tune num_leaves
# 2. With best num_leaves, tune min_child_samples
# 3. Add subsample and colsample_bytree
# 4. Tune learning_rate down, increase n_estimators
# 5. Add regularization (reg_alpha, reg_lambda)
# 6. Fine-tune based on validation curve
```

## Common Pitfalls

### Pitfall 1: Overfitting with Large num_leaves
**Problem**: num_leaves=255 on 10K samples overfits.
**Solution**: Start with 31, increase only if validation improves.

### Pitfall 2: Not Using Enough Trees with Low Learning Rate
**Problem**: learning_rate=0.01, n_estimators=100 underfits.
**Solution**: Lower learning rate needs more trees. Try n_estimators=1000+.

### Pitfall 3: Tuning Too Many Parameters at Once
**Problem**: Grid search over 8 parameters takes forever.
**Solution**: Tune sequentially or use Bayesian optimization.

### Pitfall 4: Ignoring Validation Curves
**Problem**: Blindly trusting best parameters without checking curves.
**Solution**: Always plot validation curves to understand behavior.

## Quick Reference

### Essential Tuning Parameters

```python
{
    # Start here
    'num_leaves': 31,              # Try: [15, 31, 63, 127]
    'learning_rate': 0.1,          # Try: [0.01, 0.05, 0.1, 0.3]
    'n_estimators': 100,           # Increase with lower learning_rate

    # Overfitting control
    'min_child_samples': 20,       # Try: [5, 10, 20, 50]
    'subsample': 0.8,              # Try: [0.6, 0.8, 1.0]
    'colsample_bytree': 0.8,       # Try: [0.6, 0.8, 1.0]

    # Regularization
    'reg_alpha': 0.0,              # Try: [0, 0.1, 1, 10]
    'reg_lambda': 0.0,             # Try: [0, 0.1, 1, 10]

    # Speed vs accuracy
    'max_bin': 255,                # Reduce for speed
    'boosting_type': 'gbdt'        # 'goss' for speed
}
```

### Parameter Impact Summary

| Parameter | Higher Value | Lower Value |
|-----------|--------------|-------------|
| num_leaves | More complex, slower, overfits | Simpler, faster, underfits |
| learning_rate | Faster training, worse accuracy | Slower, better accuracy |
| min_child_samples | Less overfit, simpler | More complex, overfits |
| subsample | Faster, less overfit | Slower, can overfit |
| reg_alpha/lambda | Less overfit | Can overfit |

## Summary

Advanced LightGBM mastery requires:
- **Systematic tuning**: Follow a sequence, don't tune everything at once
- **Use built-in CV**: Faster and more integrated than sklearn
- **Leverage optimization tools**: Optuna > RandomSearch > GridSearch
- **Monitor validation**: Always check validation curves
- **Start conservative**: Begin with simple models, add complexity gradually

The difference between a good model and a great model often lies in careful hyperparameter tuning.

---

**Navigation:**
- **Previous**: [LightGBM Implementation](./lightgbm-implementation.md)
- **Next**: [CatBoost Overview](./catboost-overview.md)
- **Related**: [LightGBM Core Concepts](./lightgbm-core-concepts.md)
