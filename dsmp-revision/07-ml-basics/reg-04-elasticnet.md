# ElasticNet: Best of Both Worlds

## What You'll Learn

ElasticNet combines L1 and L2 regularization, giving you feature selection like Lasso plus stability like Ridge. You'll learn why this combination solves real-world problems better than either method alone.

## Core Concept

ElasticNet adds **both L1 and L2 penalties**:

```
J(β) = MSE + λ₁Σ|β| + λ₂Σβ²

Alternative parameterization (more common):
J(β) = MSE + λ[α||β||₁ + (1-α)||β||₂²]

Where:
λ = overall regularization strength
α = L1 ratio (0 = Ridge, 1 = Lasso, 0.5 = equal mix)
```

**The magic:** Combines advantages of both methods while mitigating their weaknesses.

## Geometric Intuition

```
Ridge (Circle):      Lasso (Diamond):     ElasticNet (Rounded):
     β₂                   β₂                    β₂
      ↑                    ↑                     ↑
      | ⚪                  |    /\               |      __
      |⚪ ⚪                 |   /  \              |    /    \
      |⚪ ★ ⚪               |  / ★  \             |   |  ★   |
      | ⚪  ⚪               | /      \            |   |      |
      |  ⚪                 |/________\           |    \____/
      |___→ β₁              |_________→ β₁        |__________→ β₁

No corners           Sharp corners          Rounded corners
No selection         Unstable selection     Stable selection
All features         Random among correlated Groups features
```

**ElasticNet constraint:** Rounded diamond shape
- Has corners (can touch axes → zeros)
- But corners are rounded (more stable than Lasso)
- **Can select features AND group correlated ones**

## Why ElasticNet Solves Lasso's Problems

### Problem 1: Correlated Features

**Lasso behavior:**
```python
# X1, X2, X3 highly correlated
X1 = np.random.randn(100)
X2 = X1 + 0.01 * np.random.randn(100)
X3 = X1 + 0.01 * np.random.randn(100)
X4 = np.random.randn(100)

# True model: all correlated features contribute
y = X1 + X2 + X3 + 2*X4 + noise

# Lasso: arbitrarily picks ONE from correlated group
lasso.coef_ = [2.5, 0.0, 0.0, 1.9]  ← Dropped X2, X3!
```

**ElasticNet behavior:**
```python
# ElasticNet: keeps correlated features together
elastic.coef_ = [0.8, 0.7, 0.9, 1.9]  ← Keeps all correlated features!
```

**Why:** L2 component encourages similar coefficients for correlated features.

### Problem 2: p > n Limitation

**Lasso limitation:**
- If p > n (more features than samples)
- Lasso selects at most n features
- May miss important features beyond n

**ElasticNet solution:**
- No limit on number of selected features
- Can select more than n features
- More flexible for high-dimensional data

## Practical Example

```python
from sklearn.linear_model import Lasso, Ridge, ElasticNet
from sklearn.preprocessing import StandardScaler
import numpy as np

# Create grouped/correlated features
np.random.seed(42)
n = 100

# Group 1: Highly correlated (all important)
X1 = np.random.randn(n)
X2 = X1 + np.random.randn(n) * 0.1
X3 = X1 + np.random.randn(n) * 0.1

# Group 2: Independent feature (important)
X4 = np.random.randn(n)

# Noise features
X5 = np.random.randn(n)
X6 = np.random.randn(n)

X = np.column_stack([X1, X2, X3, X4, X5, X6])

# True model: Group 1 features all contribute
y = X1 + X2 + X3 + 2*X4 + np.random.randn(n) * 0.1

# Scale
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Compare methods
print("="*60)
print("LASSO - Randomly selects from correlated group")
print("="*60)
lasso = Lasso(alpha=0.1)
lasso.fit(X_scaled, y)
print(f"Coefficients: {lasso.coef_}")
print(f"Selected features: {np.where(lasso.coef_ != 0)[0]}")
# Output: [2.5, 0.0, 0.0, 1.9, 0.0, 0.0]
# Only X1 selected from group, X2 and X3 dropped!

print("\n" + "="*60)
print("RIDGE - Keeps all features")
print("="*60)
ridge = Ridge(alpha=0.1)
ridge.fit(X_scaled, y)
print(f"Coefficients: {ridge.coef_}")
print(f"Non-zero features: {np.sum(ridge.coef_ != 0)}")
# Output: [0.9, 0.8, 1.0, 2.0, 0.1, 0.1]
# Keeps all features including noise

print("\n" + "="*60)
print("ELASTICNET - Best of both: groups correlated, removes noise")
print("="*60)
elastic = ElasticNet(alpha=0.1, l1_ratio=0.5)
elastic.fit(X_scaled, y)
print(f"Coefficients: {elastic.coef_}")
print(f"Selected features: {np.where(elastic.coef_ != 0)[0]}")
# Output: [0.8, 0.7, 0.9, 1.9, 0.0, 0.0]
# Keeps correlated group together, removes noise!
```

## Effect of l1_ratio Parameter

The `l1_ratio` controls the mix of L1 and L2:

```
α = 0:   Pure Ridge
         No feature selection
         All features kept

α = 0.25: Mostly Ridge (75% L2)
          Slight feature selection
          Strong grouping

α = 0.5:  Equal mix (50% L1, 50% L2)
          Balanced
          Default starting point

α = 0.75: Mostly Lasso (75% L1)
          Strong feature selection
          Some grouping

α = 1:    Pure Lasso
          Maximum sparsity
          No grouping effect
```

**Visualization:**

```
Number of selected features vs α

Features
   ↑
 p |___________
   |           \
   |            \___
   |                \___
   |                    \___
 0 |_________________________\
   0    0.25   0.5   0.75   1  → α
   Ridge         Mix      Lasso
```

## Advantages of ElasticNet

**1. Feature Selection + Grouping**
```
Selects features like Lasso
Groups correlated features like Ridge
Best of both worlds
```

**2. Stable with Correlated Features**
```
Doesn't arbitrarily drop correlated features
More reproducible results
Better for real-world data
```

**3. No p < n Limitation**
```
Can select more than n features
Works well for p >> n
Essential for genomics, text
```

**4. Flexible**
```
Can tune α to adjust L1/L2 mix
Adapts to different data characteristics
One method for many scenarios
```

**5. Grouped Variables**
```
Dummy variables for categories
Gene pathways
Text n-grams
Keeps related features together
```

## Disadvantages of ElasticNet

**1. Two Hyperparameters**
```
Need to tune both λ and α
More computational cost for tuning
More complex than Ridge or Lasso
```

**2. Less Sparse Than Pure Lasso**
```
Keeps more features than Lasso
May be less interpretable
Tradeoff for stability
```

**3. Computational Cost**
```
More expensive than Ridge
Similar to Lasso
Iterative optimization needed
```

## When to Use ElasticNet

**Use ElasticNet when:**

1. **Correlated features + need selection**
   - Dummy variables for categories
   - Gene expression data
   - Text features (n-grams)
   - Don't want random selection

2. **p >> n and need more than n features**
   - High-dimensional data
   - Genomics (thousands of genes)
   - Text classification (vocabulary size)

3. **Stability important**
   - Production models
   - Reproducibility needed
   - Sensitive applications

4. **Grouped features naturally**
   - One-hot encoded categories
   - Polynomial features
   - Time series lags

5. **Unsure between Ridge and Lasso**
   - Let cross-validation decide
   - ElasticNet generalizes both
   - Safe default choice

## Tuning ElasticNet

Must tune both λ (alpha in sklearn) and α (l1_ratio):

```python
from sklearn.model_selection import GridSearchCV
from sklearn.linear_model import ElasticNet

# Grid search over both parameters
param_grid = {
    'alpha': [0.001, 0.01, 0.1, 1.0, 10.0],
    'l1_ratio': [0.1, 0.3, 0.5, 0.7, 0.9]
}

elastic = ElasticNet(max_iter=10000)
grid_search = GridSearchCV(
    elastic,
    param_grid,
    cv=5,
    scoring='neg_mean_squared_error'
)

grid_search.fit(X_scaled, y)

print(f"Best alpha: {grid_search.best_params_['alpha']}")
print(f"Best l1_ratio: {grid_search.best_params_['l1_ratio']}")
print(f"Best score: {-grid_search.best_score_:.4f}")
```

Or use built-in cross-validation:

```python
from sklearn.linear_model import ElasticNetCV

# Automatically finds best parameters
elastic_cv = ElasticNetCV(
    alphas=[0.001, 0.01, 0.1, 1.0],
    l1_ratio=[0.1, 0.5, 0.7, 0.9, 0.95, 0.99],
    cv=5,
    max_iter=10000
)

elastic_cv.fit(X_scaled, y)

print(f"Optimal alpha: {elastic_cv.alpha_}")
print(f"Optimal l1_ratio: {elastic_cv.l1_ratio_}")
```

## Common Pitfalls

**Pitfall 1: Not scaling features**
```
Affects both L1 and L2 penalties
Must scale before fitting
Solution: StandardScaler always
```

**Pitfall 2: Starting with α=0.5 blindly**
```
May not be optimal
Test range of values
Solution: Use ElasticNetCV
```

**Pitfall 3: Expecting pure Lasso sparsity**
```
ElasticNet less sparse than Lasso
Keeps more features (by design)
Solution: If need max sparsity, use Lasso
```

**Pitfall 4: Not enough iterations**
```
May not converge
Default max_iter=1000 insufficient
Solution: Set max_iter=10000 or higher
```

## Quick Reference

**ElasticNet formula:**
```
J(β) = MSE + λ[α||β||₁ + (1-α)||β||₂²]

λ = regularization strength
α = L1 ratio (0=Ridge, 1=Lasso)
```

**Key properties:**
```
Geometry:       Rounded diamond
Selection:      Yes
Grouping:       Yes
Best for:       Correlated features + selection
```

**Typical usage:**
```python
from sklearn.linear_model import ElasticNet, ElasticNetCV

# Manual
model = ElasticNet(alpha=0.1, l1_ratio=0.5)

# Auto (recommended)
model = ElasticNetCV(
    l1_ratio=[0.1, 0.5, 0.7, 0.9],
    cv=5
)

model.fit(X_scaled, y)
```

**Default starting points:**
```
alpha (λ):    0.1
l1_ratio (α): 0.5 (equal L1/L2)
max_iter:     10000
```

---

## Navigation

**Previous:** [Lasso Regression (L1)](reg-03-lasso-regression.md)

**Next:** [Comparison and Tuning](reg-05-comparison-tuning.md)

**Series:**
- [Introduction and Bias-Variance](reg-01-introduction-bias-variance.md)
- [Ridge Regression (L2)](reg-02-ridge-regression.md)
- [Lasso Regression (L1)](reg-03-lasso-regression.md)
- ElasticNet (this file)
- [Comparison and Tuning](reg-05-comparison-tuning.md)
- [Implementation](reg-06-implementation.md)
- [Practical Guide](reg-07-practical-guide.md)
