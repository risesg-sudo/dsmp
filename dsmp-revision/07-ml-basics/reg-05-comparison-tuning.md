# Regularization Methods: Comparison and Hyperparameter Tuning

## What You'll Learn

Choosing between Ridge, Lasso, and ElasticNet can be confusing. This guide provides a comprehensive comparison and teaches you how to tune regularization parameters for optimal performance.

## Side-by-Side Comparison

| Feature | Ridge (L2) | Lasso (L1) | ElasticNet |
|---------|-----------|-----------|------------|
| **Penalty** | Σβ² | Σ\|β\| | α·Σ\|β\| + (1-α)·Σβ² |
| **Geometry** | Circle | Diamond | Rounded diamond |
| **Feature Selection** | No | Yes | Yes |
| **Sparse Solution** | No | Yes | Yes |
| **Handles Multicollinearity** | Yes | No | Yes |
| **Grouped Selection** | No | No | Yes |
| **Closed Form** | Yes | No | No |
| **Computation** | Fast | Medium | Medium |
| **Stability** | High | Low | High |
| **Hyperparameters** | λ | λ | λ, α |
| **Best For** | Multicollinearity | Feature selection | Both + groups |
| **Typical Use** | Economics, finance | Text, genomics | Default choice |

## Visual Comparison

### Coefficient Paths

How coefficients shrink as λ increases:

```
Ridge - Smooth Shrinkage:
β
↑
|  ___
|     ‾‾‾--___     All coefficients shrink
|              ‾‾--___  Never reach zero
0|________________________→ λ

Lasso - Sparse Solutions:
β
↑
|  ___
|     \___          Some reach zero
|         \
0|__________\___________→ λ
            ↑ Sparse

ElasticNet - Balanced:
β
↑
|  ___
|     ‾‾--__        Between Ridge and Lasso
|          \        Grouped + sparse
0|___________\__________→ λ
```

### Feature Selection Behavior

```python
# Setup
X, y = load_correlated_data()  # X1, X2 correlated; X3, X4 independent; X5, X6 noise

# Ridge: Keeps all, shrinks all
ridge.coef_ = [0.8, 0.7, 1.2, 0.9, 0.1, 0.1]  # 6 features

# Lasso: Selects one from correlated, drops noise
lasso.coef_ = [1.5, 0.0, 1.2, 0.9, 0.0, 0.0]  # 3 features

# ElasticNet: Groups correlated, drops noise
elastic.coef_ = [0.7, 0.6, 1.1, 0.9, 0.0, 0.0]  # 4 features
```

## Hyperparameter Tuning

### Understanding λ (Regularization Strength)

**Effect of increasing λ:**

```
λ → 0:
- No regularization
- May overfit
- Complex model

λ = small (0.001-0.01):
- Light penalty
- Flexible model
- Slight regularization

λ = medium (0.1-1):
- Moderate penalty
- Balanced complexity
- Good generalization

λ = large (10-100):
- Heavy penalty
- Simple model
- May underfit

λ → ∞:
- All coefficients → 0
- Extreme underfit
- No learning
```

### Method 1: Cross-Validation (Recommended)

**Using sklearn's built-in CV:**

```python
from sklearn.linear_model import RidgeCV, LassoCV, ElasticNetCV
from sklearn.preprocessing import StandardScaler
import numpy as np

# Scale data
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Test range of alphas (log scale)
alphas = np.logspace(-3, 3, 50)  # 0.001 to 1000

# Ridge with CV
ridge_cv = RidgeCV(alphas=alphas, cv=5)
ridge_cv.fit(X_scaled, y)
print(f"Ridge - Best α: {ridge_cv.alpha_:.4f}")

# Lasso with CV
lasso_cv = LassoCV(alphas=alphas, cv=5, max_iter=10000)
lasso_cv.fit(X_scaled, y)
print(f"Lasso - Best α: {lasso_cv.alpha_:.4f}")

# ElasticNet with CV (tunes both α and l1_ratio)
elastic_cv = ElasticNetCV(
    alphas=alphas,
    l1_ratio=[0.1, 0.3, 0.5, 0.7, 0.9, 0.95, 0.99],
    cv=5,
    max_iter=10000
)
elastic_cv.fit(X_scaled, y)
print(f"ElasticNet - Best α: {elastic_cv.alpha_:.4f}")
print(f"ElasticNet - Best l1_ratio: {elastic_cv.l1_ratio_:.2f}")
```

### Method 2: Grid Search

More control over search process:

```python
from sklearn.model_selection import GridSearchCV
from sklearn.linear_model import ElasticNet

# Define search space
param_grid = {
    'alpha': [0.001, 0.01, 0.1, 1.0, 10.0],
    'l1_ratio': [0.1, 0.5, 0.7, 0.9]
}

# Grid search
grid = GridSearchCV(
    ElasticNet(max_iter=10000),
    param_grid,
    cv=5,
    scoring='neg_mean_squared_error',
    n_jobs=-1,
    verbose=1
)

grid.fit(X_scaled, y)

print("Best parameters:", grid.best_params_)
print("Best score:", -grid.best_score_)

# Access best model
best_model = grid.best_estimator_
```

### Method 3: Validation Curve

Visualize performance across different λ values:

```python
import matplotlib.pyplot as plt
from sklearn.model_selection import validation_curve

# Generate validation curve
alphas = np.logspace(-3, 3, 20)
train_scores, val_scores = validation_curve(
    Ridge(),
    X_scaled, y,
    param_name='alpha',
    param_range=alphas,
    cv=5,
    scoring='neg_mean_squared_error'
)

# Plot
plt.figure(figsize=(10, 6))
plt.semilogx(alphas, -train_scores.mean(axis=1), label='Training')
plt.semilogx(alphas, -val_scores.mean(axis=1), label='Validation')
plt.xlabel('Alpha (λ)')
plt.ylabel('MSE')
plt.title('Validation Curve for Ridge Regression')
plt.legend()
plt.grid(True)
plt.show()

# Optimal α where validation error is minimum
optimal_idx = np.argmin(val_scores.mean(axis=1))
optimal_alpha = alphas[optimal_idx]
print(f"Optimal α: {optimal_alpha:.4f}")
```

### Typical Validation Curve Shape

```
MSE
  ↑
  |      /
  |     /  ← Underfitting (high bias)
  |    /      λ too large
  |   /
  |  /___
  |      ‾‾‾\___  ← Optimal λ
  |            ‾‾‾\___  ← Overfitting (high variance)
  |                      λ too small
  |_____________________→ λ
  Small              Large
```

## ElasticNet: Tuning Two Parameters

More complex but worth it:

### Heatmap Visualization

```python
import seaborn as sns
import pandas as pd

# Grid search results
results = pd.DataFrame(grid.cv_results_)
pivot = results.pivot_table(
    values='mean_test_score',
    index='param_l1_ratio',
    columns='param_alpha'
)

# Heatmap
plt.figure(figsize=(12, 8))
sns.heatmap(-pivot, annot=True, fmt='.3f', cmap='viridis')
plt.xlabel('Alpha (λ)')
plt.ylabel('L1 Ratio (α)')
plt.title('ElasticNet Hyperparameter Tuning\n(Lower is better)')
plt.show()
```

### Smart Search Strategy

```python
# Step 1: Coarse search
coarse_grid = {
    'alpha': [0.001, 0.01, 0.1, 1, 10],
    'l1_ratio': [0.1, 0.5, 0.9]
}

# Step 2: Fine search around best
# If best was alpha=0.1, l1_ratio=0.5:
fine_grid = {
    'alpha': [0.05, 0.1, 0.15, 0.2],
    'l1_ratio': [0.3, 0.4, 0.5, 0.6, 0.7]
}
```

## Comparing All Three Methods

Comprehensive comparison:

```python
from sklearn.model_selection import cross_val_score

methods = {
    'Ridge': RidgeCV(alphas=alphas, cv=5),
    'Lasso': LassoCV(alphas=alphas, cv=5, max_iter=10000),
    'ElasticNet': ElasticNetCV(
        alphas=alphas,
        l1_ratio=[0.1, 0.5, 0.9],
        cv=5,
        max_iter=10000
    )
}

results = {}

for name, model in methods.items():
    # Fit
    model.fit(X_scaled, y)

    # Evaluate
    scores = cross_val_score(
        model, X_scaled, y,
        cv=5,
        scoring='neg_mean_squared_error'
    )

    results[name] = {
        'mean_score': -scores.mean(),
        'std_score': scores.std(),
        'n_features': np.sum(model.coef_ != 0) if hasattr(model, 'coef_') else len(model.coef_),
        'model': model
    }

# Display results
print("\n" + "="*60)
print("COMPARISON OF REGULARIZATION METHODS")
print("="*60)

for name, res in results.items():
    print(f"\n{name}:")
    print(f"  MSE: {res['mean_score']:.4f} (±{res['std_score']:.4f})")
    print(f"  Features: {res['n_features']}")

    if hasattr(res['model'], 'alpha_'):
        print(f"  Best λ: {res['model'].alpha_:.4f}")
    if hasattr(res['model'], 'l1_ratio_'):
        print(f"  Best α: {res['model'].l1_ratio_:.2f}")

# Pick winner
best = min(results.items(), key=lambda x: x[1]['mean_score'])
print(f"\n{'='*60}")
print(f"WINNER: {best[0]}")
print(f"{'='*60}")
```

## Best Practices

**1. Always Scale Features**
```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_train)

# Remember to scale test data with same scaler
X_test_scaled = scaler.transform(X_test)
```

**2. Use Log Scale for α Search**
```python
# Good: Log scale covers wide range
alphas = np.logspace(-3, 3, 50)  # 0.001, ..., 1000

# Bad: Linear scale misses important values
alphas = np.linspace(0, 10, 50)
```

**3. Sufficient Cross-Validation Folds**
```python
# Small data (n < 100): cv=10
# Medium data (n < 1000): cv=5
# Large data (n > 1000): cv=3
```

**4. Set max_iter High Enough**
```python
# Lasso and ElasticNet need more iterations
model = LassoCV(max_iter=10000)  # Not default 1000
```

**5. Monitor Convergence**
```python
import warnings
warnings.filterwarnings('ignore', category=ConvergenceWarning)

# Or check:
if not model.converged_:
    print("Warning: Model did not converge!")
```

## Common Pitfalls

**Pitfall 1: Not scaling features**
```
Different scales → unfair penalties
Solution: Always StandardScaler
```

**Pitfall 2: Too few α values**
```
May miss optimal value
Solution: Use at least 20-50 values in log scale
```

**Pitfall 3: Using same data for tuning and final evaluation**
```
Overfitting to validation set
Solution: Split into train/val/test or nested CV
```

**Pitfall 4: Not checking convergence**
```
May get suboptimal solution
Solution: Increase max_iter, check convergence
```

## Quick Reference

**Recommended tuning approach:**
```python
# 1. Scale features
X_scaled = StandardScaler().fit_transform(X)

# 2. Use built-in CV (easiest)
model = ElasticNetCV(
    l1_ratio=[0.1, 0.5, 0.7, 0.9, 0.95],
    cv=5,
    max_iter=10000
)

# 3. Fit and evaluate
model.fit(X_scaled, y)

# 4. Get optimal parameters
print(f"Best λ: {model.alpha_}")
print(f"Best α: {model.l1_ratio_}")
```

**Typical hyperparameter ranges:**
```
Ridge alpha:      0.001 to 100
Lasso alpha:      0.001 to 10
ElasticNet alpha: 0.001 to 10
ElasticNet l1_ratio: 0.1 to 0.99
```

---

## Navigation

**Previous:** [ElasticNet](reg-04-elasticnet.md)

**Next:** [Implementation](reg-06-implementation.md)

**Series:**
- [Introduction and Bias-Variance](reg-01-introduction-bias-variance.md)
- [Ridge Regression (L2)](reg-02-ridge-regression.md)
- [Lasso Regression (L1)](reg-03-lasso-regression.md)
- [ElasticNet](reg-04-elasticnet.md)
- Comparison and Tuning (this file)
- [Implementation](reg-06-implementation.md)
- [Practical Guide](reg-07-practical-guide.md)
