# CatBoost Advanced Features - Tuning, Visualization, and GPU

## What You'll Learn

Master advanced CatBoost capabilities including hyperparameter tuning, built-in visualizations, GPU training, model analysis tools, and production deployment strategies.

## Hyperparameter Tuning

### Grid Search with sklearn

```python
from catboost import CatBoostClassifier
from sklearn.model_selection import GridSearchCV

# Parameter grid
param_grid = {
    'iterations': [100, 200, 300],
    'learning_rate': [0.01, 0.1, 0.3],
    'depth': [4, 6, 8],
    'l2_leaf_reg': [1, 3, 5, 7, 9]
}

# Grid search
grid_search = GridSearchCV(
    CatBoostClassifier(random_seed=42, verbose=False),
    param_grid,
    cv=5,
    scoring='roc_auc',
    n_jobs=-1,
    verbose=2
)

grid_search.fit(X_train, y_train)

print("Best parameters:", grid_search.best_params_)
print("Best CV score:", grid_search.best_score_)
print("Test score:", grid_search.score(X_test, y_test))
```

### Built-in Grid Search

```python
# CatBoost's native grid search
from catboost import CatBoost, Pool

train_pool = Pool(X_train, y_train)

# Define parameter grid
grid = {
    'learning_rate': [0.03, 0.1],
    'depth': [4, 6, 10],
    'l2_leaf_reg': [1, 3, 5]
}

# Run grid search
grid_search_result = model.grid_search(
    grid,
    train_pool,
    cv=5,
    partition_random_seed=42,
    verbose=False
)

print("Best parameters:", grid_search_result['params'])
print("Best CV score:", grid_search_result['cv_results']['test-AUC-mean'].max())
```

### Randomized Search

```python
from catboost import CatBoostClassifier
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import randint, uniform

# Parameter distributions
param_dist = {
    'iterations': randint(100, 500),
    'learning_rate': uniform(0.01, 0.3),
    'depth': randint(4, 10),
    'l2_leaf_reg': randint(1, 10),
    'bagging_temperature': uniform(0, 1),
    'random_strength': uniform(0, 10)
}

# Randomized search
random_search = RandomizedSearchCV(
    CatBoostClassifier(random_seed=42, verbose=False),
    param_dist,
    n_iter=50,
    cv=5,
    scoring='roc_auc',
    random_state=42,
    n_jobs=-1
)

random_search.fit(X_train, y_train)
print("Best params:", random_search.best_params_)
```

## Built-in Cross-Validation

```python
from catboost import cv, Pool

# Setup pool
cv_pool = Pool(X_train, y_train, cat_features=cat_features)

# Parameters
params = {
    'iterations': 100,
    'learning_rate': 0.1,
    'depth': 6,
    'loss_function': 'Logloss',
    'eval_metric': 'AUC',
    'random_seed': 42,
    'verbose': False
}

# Run cross-validation
cv_results = cv(
    pool=cv_pool,
    params=params,
    fold_count=5,
    shuffle=True,
    partition_random_seed=42,
    plot=False,
    verbose=False
)

print("\nCV Results Summary:")
print(cv_results.tail())
print(f"\nMean AUC: {cv_results['test-AUC-mean'].max():.4f}")
print(f"Std AUC: {cv_results['test-AUC-std'].iloc[-1]:.4f}")
```

## Visualization Features

### Training Progress Plot

```python
model = CatBoostClassifier(
    iterations=100,
    learning_rate=0.1,
    depth=6,
    random_seed=42
)

# Plot training progress in Jupyter
model.fit(
    X_train, y_train,
    eval_set=(X_test, y_test),
    plot=True  # Interactive plot in Jupyter
)
```

### Feature Importance

```python
# Train model
model = CatBoostClassifier(iterations=100, random_seed=42, verbose=False)
model.fit(X_train, y_train)

# Get feature importance
importance = model.get_feature_importance()

# Prettified table
importance_df = model.get_feature_importance(prettified=True)
print(importance_df)

# Plot importance
import matplotlib.pyplot as plt

features = range(len(importance))
plt.figure(figsize=(10, 6))
plt.barh(features, importance)
plt.xlabel('Importance')
plt.ylabel('Feature Index')
plt.title('Feature Importance')
plt.tight_layout()
plt.show()
```

### SHAP Values Integration

```python
import shap

# Train model
model = CatBoostClassifier(iterations=100, verbose=False)
model.fit(X_train, y_train)

# Get SHAP values
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Visualize
shap.summary_plot(shap_values, X_test)
shap.force_plot(explainer.expected_value, shap_values[0], X_test.iloc[0])
```

### Tree Visualization

```python
# Visualize a specific tree
train_pool = Pool(X_train, y_train)

model.fit(train_pool)

# Plot tree structure (requires graphviz)
model.plot_tree(
    tree_idx=0,  # First tree
    pool=train_pool
)
```

### Object (Instance) Importance

```python
# Find most influential training instances
train_pool = Pool(X_train, y_train)
test_pool = Pool(X_test, y_test)

model.fit(train_pool)

# Get object importance
object_importances = model.get_object_importance(
    train_pool,
    test_pool,
    top_size=10  # Top 10 influential instances
)

print("Most influential training instances:")
print(object_importances)
```

## GPU Training

### Enable GPU Acceleration

```python
# Train on GPU
model = CatBoostClassifier(
    iterations=1000,
    learning_rate=0.1,
    depth=6,
    task_type='GPU',      # Enable GPU
    devices='0',          # GPU device ID (0 for first GPU)
    random_seed=42
)

model.fit(X_train, y_train)
```

### GPU Training Options

```python
# Advanced GPU configuration
model = CatBoostClassifier(
    task_type='GPU',
    devices='0-3',              # Use GPUs 0,1,2,3
    gpu_ram_part=0.95,          # Use 95% of GPU RAM
    pinned_memory_size=4096,    # MB of pinned memory
    gpu_cat_features_storage='GpuRam'  # Store cat features on GPU
)
```

### CPU vs GPU Performance

```python
import time

# CPU training
model_cpu = CatBoostClassifier(task_type='CPU', iterations=100, verbose=False)
start = time.time()
model_cpu.fit(X_train, y_train)
cpu_time = time.time() - start

# GPU training
model_gpu = CatBoostClassifier(task_type='GPU', iterations=100, verbose=False)
start = time.time()
model_gpu.fit(X_train, y_train)
gpu_time = time.time() - start

print(f"CPU Time: {cpu_time:.2f}s")
print(f"GPU Time: {gpu_time:.2f}s")
print(f"Speedup: {cpu_time/gpu_time:.2f}x")
```

## Advanced Features

### Custom Loss Functions

```python
# Define custom metric
class CustomF1Metric:
    def get_final_error(self, error, weight):
        return error / (weight + 1e-38)

    def is_max_optimal(self):
        return True

    def evaluate(self, approxes, target, weight):
        # Calculate F1 score
        from sklearn.metrics import f1_score
        predictions = (approxes[0] > 0).astype(int)
        score = f1_score(target, predictions)
        return score, 1.0

# Use custom metric
model = CatBoostClassifier(
    eval_metric=CustomF1Metric(),
    iterations=100
)
```

### Text Features

```python
# CatBoost can handle text directly
df = pd.DataFrame({
    'review': ['Great product!', 'Terrible service', 'Amazing quality'],
    'rating': [5, 1, 5]
})

text_features = ['review']

model = CatBoostClassifier(
    text_features=text_features,  # Specify text columns
    iterations=100,
    verbose=False
)

model.fit(df[['review']], df['rating'])
```

### Embedding Features

```python
# Use embedding features (e.g., from neural networks)
embedding_features = [0, 1, 2]  # Columns with embeddings

model = CatBoostClassifier(
    embedding_features=embedding_features,
    iterations=100
)
```

## Model Analysis

### Get Model Information

```python
# Model metadata
print("Number of trees:", model.tree_count_)
print("Feature names:", model.feature_names_)
print("Best iteration:", model.get_best_iteration())
print("Best score:", model.get_best_score())

# Feature statistics
feature_stats = model.calc_feature_statistics(
    X_train,
    y_train,
    feature=0,  # Feature index
    plot=True
)
```

### Prediction Analysis

```python
# Get prediction stages (after each tree)
predictions_stages = model.staged_predict_proba(X_test)

# Useful for analyzing learning curve
for i, pred in enumerate(predictions_stages):
    if i % 10 == 0:
        auc = roc_auc_score(y_test, pred[:, 1])
        print(f"After {i} trees: AUC = {auc:.4f}")
```

## Model Persistence

### Save and Load Models

```python
# Save model
model.save_model('catboost_model.cbm')

# Load model
from catboost import CatBoostClassifier
loaded_model = CatBoostClassifier()
loaded_model.load_model('catboost_model.cbm')

# Make predictions
predictions = loaded_model.predict(X_test)
```

### Export to Different Formats

```python
# Export to JSON
model.save_model('model.json', format='json')

# Export to ONNX (for deployment)
model.save_model('model.onnx', format='onnx')

# Export to CoreML (for iOS)
model.save_model('model.mlmodel', format='coreml', export_parameters={'prediction_type': 'probability'})

# Export to Python code
model.save_model('model.py', format='python')
```

## Production Deployment

### Fast Prediction Mode

```python
# Compile model for faster inference
model.save_model('model_cpp', format='cpp')

# Use optimized C++ evaluator (requires compilation)
```

### Batch Prediction

```python
# Efficient batch prediction
predictions = model.predict(X_large_batch, thread_count=8)

# With probabilities
probas = model.predict_proba(X_large_batch, thread_count=8)
```

## Best Practices

### Tuning Priority

```python
# Order of parameter importance:
# 1. iterations + learning_rate (most important)
# 2. depth (tree complexity)
# 3. l2_leaf_reg (regularization)
# 4. bagging_temperature (randomness)
# 5. random_strength (split randomness)

# Recommended starting point
default_params = {
    'iterations': 100,
    'learning_rate': 0.1,
    'depth': 6,
    'l2_leaf_reg': 3,
    'random_seed': 42
}
```

## Common Pitfalls

### Pitfall 1: Not Using GPU for Large Datasets
**Problem**: Training takes hours on CPU.
**Solution**: Use GPU for datasets > 100K rows.

### Pitfall 2: Excessive Depth
**Problem**: Setting depth > 10 without validation.
**Solution**: Start with depth 6, increase only if validation improves.

### Pitfall 3: Ignoring Built-in Tools
**Problem**: Using external tools for visualization.
**Solution**: Leverage CatBoost's built-in plotting and analysis.

### Pitfall 4: Not Saving Best Iteration
**Problem**: Using final model instead of best iteration.
**Solution**: Use `get_best_iteration()` for early stopped models.

## Quick Reference

### Visualization Commands

```python
# Training plot
model.fit(X_train, y_train, eval_set=(X_val, y_val), plot=True)

# Feature importance
model.get_feature_importance(prettified=True)

# Tree visualization
model.plot_tree(tree_idx=0, pool=train_pool)

# Object importance
model.get_object_importance(train_pool, test_pool, top_size=10)
```

### Export Formats

```python
# Different export formats
model.save_model('model.cbm')      # CatBoost binary
model.save_model('model.json', format='json')
model.save_model('model.onnx', format='onnx')
model.save_model('model.pmml', format='pmml')
model.save_model('model.cpp', format='cpp')
model.save_model('model.py', format='python')
```

## Summary

CatBoost advanced features enable:
- **Efficient tuning**: Grid search, random search, Bayesian optimization
- **Rich visualizations**: Training curves, feature importance, SHAP values
- **GPU acceleration**: 5-10x speedup on large datasets
- **Production deployment**: Multiple export formats, optimized inference
- **Model analysis**: Object importance, prediction stages, feature statistics

Master these tools to build production-ready CatBoost models efficiently.

---

**Navigation:**
- **Previous**: [CatBoost Implementation](./catboost-implementation.md)
- **Next**: [Ensemble Methods Comparison](./ensemble-comparison.md)
- **Related**: [LightGBM Advanced](./lightgbm-advanced.md)
