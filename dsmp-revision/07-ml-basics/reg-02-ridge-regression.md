# Ridge Regression (L2 Regularization)

## What You'll Learn

Ridge regression solves one of the most common problems in machine learning: multicollinearity. By adding an L2 penalty, it stabilizes coefficient estimates and produces models that generalize better. You'll understand how it works, when to use it, and master its implementation.

## Core Concept

Ridge regression adds a penalty proportional to the **sum of squared coefficients**:

```
J(β) = MSE + λ Σβⱼ²

     = (1/2n) Σ(yᵢ - ŷᵢ)² + λ||β||₂²
       \_________________/   \____/
            Fit data        L2 penalty
```

**Key insight:** Large coefficients are heavily penalized (squared), encouraging all coefficients to be small but non-zero.

## The Mathematics

### Cost Function

```
J(β) = (1/2n) Σ(yᵢ - Xᵢβ)² + λ Σβⱼ²

Note: Typically don't penalize intercept β₀
```

### Closed-Form Solution

Unlike Lasso, Ridge has a beautiful closed-form solution:

```
β_ridge = (XᵀX + λI)⁻¹Xᵀy

Where:
I = identity matrix
λ = regularization parameter
```

**Compare to OLS:**
```
β_OLS = (XᵀX)⁻¹Xᵀy

Ridge adds λI to XᵀX → always invertible!
```

This is huge: even when XᵀX is singular (non-invertible), Ridge works perfectly.

## Geometric Intuition

Ridge can be viewed as constrained optimization:

```
Minimize:  Σ(yᵢ - ŷᵢ)²
Subject to: Σβⱼ² ≤ t
```

### Visual Representation (2D)

```
    β₂
     ↑
     |     ⚪  ← L2 constraint: β₁² + β₂² ≤ t
     |   ⚪   ⚪                (circle)
     |  ⚪  ★  ⚪
     | ⚪   ↑   ⚪
     |⚪ Ridge ⚪
     |⚪ solution ⚪     ◯ ← MSE contours
     | ⚪       ⚪    ◯     (ellipses)
     |  ⚪     ⚪   ◯
     |   ⚪   ⚪  ◯
     |     ⚪
     |___________________→ β₁

★ = Ridge solution (where contour touches circle)
```

**Key observation:**
- Circle is smooth (no corners)
- Solution rarely lands exactly on axis
- Coefficients shrunk but NOT zero
- **No automatic feature selection**

## How Ridge Helps with Multicollinearity

Multicollinearity occurs when features are highly correlated:

### The Problem

```python
# Highly correlated features
X₁ = [1, 2, 3, 4, 5]
X₂ = [1.1, 2.05, 2.95, 4.1, 5.02]  # Almost identical to X₁

# OLS becomes unstable:
# Could use: β₁=100, β₂=-99
# Or:        β₁=50, β₂=-49
# Or:        β₁=1000, β₂=-999
# All fit data equally well!
```

### Ridge Solution

```
(XᵀX + λI)⁻¹

The λI term ensures matrix is well-conditioned
→ Stable, unique solution
→ Coefficients have similar, reasonable values
```

**Example:**

```python
import numpy as np
from sklearn.linear_model import LinearRegression, Ridge

# Create correlated features
X1 = np.random.randn(100)
X2 = X1 + np.random.randn(100) * 0.1  # Highly correlated
X3 = np.random.randn(100)

X = np.column_stack([X1, X2, X3])
y = 2*X1 + 3*X3 + np.random.randn(100) * 0.5

# OLS - unstable due to multicollinearity
ols = LinearRegression()
ols.fit(X, y)
print("OLS coefficients:", ols.coef_)
# Output: [ 1.23, 0.89, 3.01] ← Unstable, X1 and X2 very different

# Ridge - stable
ridge = Ridge(alpha=1.0)
ridge.fit(X, y)
print("Ridge coefficients:", ridge.coef_)
# Output: [ 1.05, 1.02, 2.98] ← More stable, X1 and X2 similar!
```

## Effect on Coefficients

Ridge shrinks coefficients proportionally:

```
λ = 0 (No regularization):
β = [-2.3, 5.1, -1.8, 3.7, 0.9]

λ = 0.1:
β = [-2.1, 4.6, -1.6, 3.3, 0.8]  ← Slightly shrunk

λ = 1:
β = [-1.8, 3.2, -1.1, 2.4, 0.6]  ← Moderately shrunk

λ = 10:
β = [-0.5, 0.9, -0.3, 0.7, 0.2]  ← Heavily shrunk

λ → ∞:
β → [0, 0, 0, 0, 0]  ← All zeros (but never exactly)
```

**Coefficient path visualization:**

```
Coefficient Value vs λ

β
↑
|  ___
|     ‾‾‾--___     ← Each coefficient shrinks smoothly
|              ‾‾--___
0|______________________→ λ
   Never reaches exactly zero
```

## Advantages of Ridge

**1. Handles Multicollinearity**
```
Stabilizes coefficients when features correlated
Prevents wild swings in estimates
More reliable predictions
```

**2. Always Has Solution**
```
(XᵀX + λI) always invertible
Works even when p > n
No singular matrix issues
```

**3. Continuous and Stable**
```
Small data changes → small coefficient changes
Smooth shrinkage
Numerically stable
```

**4. Computational Efficiency**
```
Closed-form solution available
Fast to compute
No iterative algorithms needed
```

**5. Reduces Variance**
```
Smaller coefficients → less overfitting
Better generalization
Lower variance in predictions
```

## Disadvantages of Ridge

**1. No Feature Selection**
```
All coefficients shrunk but never zero
Keeps all features in model
Less interpretable with many features
```

**2. Biased Estimates**
```
Coefficients are shrunk toward zero
Introduces bias
Tradeoff for reduced variance
```

**3. Requires λ Tuning**
```
Need cross-validation to find optimal λ
Additional computational cost
No automatic selection
```

**4. Feature Scaling Sensitive**
```
Penalty depends on coefficient magnitude
Must scale features for fair penalty
Extra preprocessing step
```

## When to Use Ridge

**Use Ridge when:**

1. **Multicollinearity present**
   - Features highly correlated
   - Unstable OLS estimates
   - Economic or financial data

2. **p > n (more features than samples)**
   - OLS impossible (XᵀX singular)
   - Ridge always works
   - Genomics, text analysis

3. **All features potentially useful**
   - Don't want to discard any
   - Believe all contribute something
   - Rather shrink than remove

4. **Prediction primary goal**
   - Don't need sparse model
   - Want best generalization
   - Interpretability less important

5. **Stable convergence needed**
   - Numerical stability critical
   - Fast computation required
   - Closed-form preferred

## Practical Example

```python
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge, LinearRegression
import matplotlib.pyplot as plt

# Generate data with multicollinearity
X, y, true_coef = make_regression(
    n_samples=100,
    n_features=20,
    n_informative=10,
    noise=10,
    coef=True,
    random_state=42
)

# Add correlated features
X[:, 1] = X[:, 0] + np.random.randn(100) * 0.1
X[:, 2] = X[:, 0] + np.random.randn(100) * 0.1

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale features (important!)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Compare OLS vs Ridge
ols = LinearRegression()
ols.fit(X_train_scaled, y_train)

ridge = Ridge(alpha=1.0)
ridge.fit(X_train_scaled, y_train)

# Evaluate
print(f"OLS - Train R²: {ols.score(X_train_scaled, y_train):.4f}")
print(f"OLS - Test R²: {ols.score(X_test_scaled, y_test):.4f}")
print(f"\nRidge - Train R²: {ridge.score(X_train_scaled, y_train):.4f}")
print(f"Ridge - Test R²: {ridge.score(X_test_scaled, y_test):.4f}")

# Compare coefficients
print(f"\nOLS coefficients range: [{ols.coef_.min():.2f}, {ols.coef_.max():.2f}]")
print(f"Ridge coefficients range: [{ridge.coef_.min():.2f}, {ridge.coef_.max():.2f}]")

# Visualize coefficients
plt.figure(figsize=(12, 5))
plt.subplot(1, 2, 1)
plt.bar(range(len(ols.coef_)), ols.coef_)
plt.xlabel('Feature')
plt.ylabel('Coefficient Value')
plt.title('OLS Coefficients')
plt.grid(True)

plt.subplot(1, 2, 2)
plt.bar(range(len(ridge.coef_)), ridge.coef_)
plt.xlabel('Feature')
plt.ylabel('Coefficient Value')
plt.title('Ridge Coefficients (α=1.0)')
plt.grid(True)

plt.tight_layout()
plt.show()
```

## Common Pitfalls

**Pitfall 1: Not scaling features**
```
Unscaled features get penalized differently
Feature on [0,1000] vs [0,1] → unfair penalty
Solution: Always use StandardScaler
```

**Pitfall 2: Penalizing intercept**
```
Intercept should fit data mean
Don't include in penalty
Solution: Most libraries handle this automatically
```

**Pitfall 3: Using α=0**
```
No regularization → defeats purpose
Same as OLS
Solution: Use α > 0, find via cross-validation
```

**Pitfall 4: Expecting sparse solutions**
```
Ridge doesn't zero out coefficients
All features retained
Solution: Use Lasso if need feature selection
```

## Quick Reference

**Ridge formula:**
```
β_ridge = (XᵀX + λI)⁻¹Xᵀy

Cost: J(β) = MSE + λ||β||₂²
```

**Key properties:**
```
Geometry:       Circle constraint
Effect:         Shrinks all coefficients
Selection:      No (keeps all features)
Solution:       Closed-form (fast)
Best for:       Multicollinearity, p>n
```

**Typical usage:**
```python
from sklearn.linear_model import Ridge

model = Ridge(alpha=1.0)  # λ in math = alpha in sklearn
model.fit(X_scaled, y)     # Always scale first!
```

---

## Navigation

**Previous:** [Introduction and Bias-Variance](reg-01-introduction-bias-variance.md)

**Next:** [Lasso Regression (L1)](reg-03-lasso-regression.md)

**Series:**
- [Introduction and Bias-Variance](reg-01-introduction-bias-variance.md)
- Ridge Regression (L2) (this file)
- [Lasso Regression (L1)](reg-03-lasso-regression.md)
- [ElasticNet](reg-04-elasticnet.md)
- [Comparison and Tuning](reg-05-comparison-tuning.md)
- [Implementation](reg-06-implementation.md)
- [Practical Guide](reg-07-practical-guide.md)
