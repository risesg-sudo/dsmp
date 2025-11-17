# Lasso Regression (L1 Regularization)

## What You'll Learn

Lasso regression performs automatic feature selection by setting irrelevant coefficients to exactly zero. This creates sparse, interpretable models. You'll learn how L1 regularization achieves this magic, when to use it, and handle its quirks.

## Core Concept

Lasso adds a penalty proportional to the **sum of absolute values** of coefficients:

```
J(β) = MSE + λ Σ|βⱼ|

     = (1/2n) Σ(yᵢ - ŷᵢ)² + λ||β||₁
       \_________________/   \____/
            Fit data        L1 penalty
```

**Key difference from Ridge:** Absolute value (|β|) instead of squared (β²).

This small change has profound consequences: **Lasso zeros out coefficients**.

## The Mathematics

### Cost Function

```
J(β) = (1/2n) Σ(yᵢ - Xᵢβ)² + λ Σ|βⱼ|
```

### No Closed-Form Solution

Unlike Ridge, Lasso has no closed-form solution due to the absolute value:

```
d|β|/dβ = { +1  if β > 0
          { -1  if β < 0
          { undefined at β = 0

→ Must use iterative methods:
  - Coordinate descent (most common)
  - Proximal gradient descent
  - LARS (Least Angle Regression)
```

## Geometric Intuition

Lasso as constrained optimization:

```
Minimize:  Σ(yᵢ - ŷᵢ)²
Subject to: Σ|βⱼ| ≤ t
```

### Visual Representation (2D)

```
    β₂
     ↑
     |       /\    ← L1 constraint: |β₁| + |β₂| ≤ t
     |      /  \                     (diamond)
     |     /    \
     |    /  ★   \    ◯ ← MSE contours
     |   / Lasso  \  ◯
     |  /  solution\ ◯
     | /____________\
     |/              \
     |___________________→ β₁

★ = Lasso solution (often on corner/axis)
```

**Critical observation:**
- Diamond has sharp corners on axes
- MSE contours likely touch diamond at corners
- Corner on axis means one coefficient = 0
- **Automatic feature selection!**

## Why Lasso Creates Sparse Solutions

The geometric reason:

```
Ridge (Circle):           Lasso (Diamond):
     β₂                        β₂
      ↑                         ↑
      | ⚪                       |    /\
      |⚪ ⚪                      |   /★ \  ← Corner!
      |⚪ ★ ⚪    ◯              |  /    \
      | ⚪  ⚪  ◯                | /______\
      |  ⚪  ◯                  |/        \
      |___→ β₁                 |__________→ β₁

Touches at interior       Touches at corner
β₁ ≠ 0, β₂ ≠ 0           β₁ = 0, β₂ ≠ 0
No selection              Feature selection!
```

With more dimensions, Lasso's polytope has even more corners on axes, increasing likelihood of zero coefficients.

## Feature Selection in Action

```
λ = 0 (No regularization):
β = [-2.3, 5.1, -1.8, 3.7, 0.9, -1.2, 2.4]
All 7 features

λ = 0.1 (Light penalty):
β = [-2.0, 4.5, 0.0, 3.2, 0.0, -1.0, 2.1]
        ↑ Zero    ↑ Zero
5 features selected

λ = 1 (Moderate penalty):
β = [-1.5, 3.8, 0.0, 2.1, 0.0, 0.0, 0.0]
3 features selected

λ = 10 (Heavy penalty):
β = [0.0, 1.2, 0.0, 0.0, 0.0, 0.0, 0.0]
Only 1 feature!

λ → ∞:
β → [0, 0, 0, 0, 0, 0, 0]
No features (underfit)
```

**Coefficient path:**

```
β value vs λ

β
↑
|  ___
|     \___          ← Reaches exactly zero
|         \
0|__________\___________→ λ
            ↑
      Becomes sparse
```

## Practical Example: Automatic Feature Selection

```python
from sklearn.linear_model import Lasso
import numpy as np
import matplotlib.pyplot as plt

# Create data with many irrelevant features
np.random.seed(42)
n, p = 100, 50  # 100 samples, 50 features

X = np.random.randn(n, p)

# Only first 5 features are relevant
true_coef = np.zeros(p)
true_coef[:5] = [2, -3, 1.5, -1, 2.5]

y = X @ true_coef + np.random.randn(n) * 0.5

# Fit Lasso
lasso = Lasso(alpha=0.1)
lasso.fit(X, y)

# Count non-zero coefficients
non_zero = np.sum(lasso.coef_ != 0)
print(f"Selected {non_zero} out of {p} features")

# Which features selected?
selected_indices = np.where(lasso.coef_ != 0)[0]
print(f"Selected features: {selected_indices}")
print(f"True relevant features: [0, 1, 2, 3, 4]")

# Compare coefficients
print(f"\nTrue coefficients (first 10): {true_coef[:10]}")
print(f"Lasso coefficients (first 10): {lasso.coef_[:10]}")

# Visualize
plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
plt.stem(range(10), true_coef[:10], basefmt=' ')
plt.xlabel('Feature')
plt.ylabel('Coefficient')
plt.title('True Coefficients (first 10)')
plt.grid(True)

plt.subplot(1, 2, 2)
plt.stem(range(10), lasso.coef_[:10], basefmt=' ')
plt.xlabel('Feature')
plt.ylabel('Coefficient')
plt.title('Lasso Coefficients (first 10)')
plt.grid(True)

plt.tight_layout()
plt.show()
```

Output:
```
Selected 6 out of 50 features
Selected features: [0 1 2 3 4 7]  # Correctly found first 5, one false positive
True relevant features: [0, 1, 2, 3, 4]
```

## Advantages of Lasso

**1. Automatic Feature Selection**
```
Sets irrelevant coefficients to exactly zero
Creates sparse, interpretable models
No manual feature selection needed
```

**2. Handles High-Dimensional Data**
```
Works when p >> n
Essential for genomics, text analysis
Identifies important features automatically
```

**3. Interpretability**
```
Sparse models easier to understand
Clear which features matter
Facilitates communication
```

**4. Reduces Overfitting**
```
Fewer features → simpler model
Better generalization
Lower variance
```

**5. Computational Benefits**
```
Sparse models faster to evaluate
Less memory for predictions
Efficient for deployment
```

## Disadvantages of Lasso

**1. Arbitrary Selection Among Correlated Features**
```
If X₁ and X₂ highly correlated:
- Lasso picks one randomly
- Drops the other
- Unstable across different samples
```

Example:
```python
# Highly correlated features
X1 = np.random.randn(100)
X2 = X1 + 0.01 * np.random.randn(100)  # Almost identical
X3 = np.random.randn(100)

X = np.column_stack([X1, X2, X3])
y = X1 + X2 + 2*X3 + np.random.randn(100) * 0.1

lasso = Lasso(alpha=0.1)
lasso.fit(X, y)
print(lasso.coef_)
# Output: [1.8, 0.0, 2.0]  ← Dropped X2 arbitrarily
# Or:     [0.0, 1.9, 2.0]  ← Might drop X1 instead!
```

**2. Limited to n Features (when p > n)**
```
If p > n, Lasso selects at most n features
May miss important features
Limitation of L1 penalty
```

**3. No Closed-Form Solution**
```
Requires iterative optimization
Slower than Ridge
Convergence can be tricky
```

**4. Unstable**
```
Small data changes can change selected features
Less stable than Ridge
Multiple solutions possible
```

**5. May Not Group Correlated Features**
```
Drops some from correlated group
May lose information
ElasticNet handles this better
```

## When to Use Lasso

**Use Lasso when:**

1. **Feature selection needed**
   - Want sparse model
   - Need interpretability
   - Too many features to interpret all

2. **Believe many features irrelevant**
   - High-dimensional data
   - Most features are noise
   - Want automatic pruning

3. **p >> n (many more features than samples)**
   - Text classification
   - Genomics
   - Web data

4. **Model deployment constraints**
   - Need fast predictions
   - Limited memory
   - Sparse model beneficial

5. **Exploratory analysis**
   - Identify important features
   - Understand relationships
   - Guide further investigation

**Don't use Lasso when:**

1. **All features important**
   - Known domain knowledge
   - Every feature contributes
   - Use Ridge instead

2. **Highly correlated features**
   - Unstable selection
   - May drop important features
   - Use ElasticNet instead

3. **Need stability**
   - Results must be reproducible
   - Sensitive application
   - Consider Ridge

## Soft-Thresholding Operator

The mathematical secret behind Lasso:

```
Soft-threshold: S(β, λ) = sign(β) max(|β| - λ, 0)

                = { β - λ   if β > λ
                  { 0       if |β| ≤ λ
                  { β + λ   if β < -λ
```

**Visual:**

```
Output
  ↑
  |      /
  |     /
  |    / ← Shifted line
  |___/_____
  | λ     λ   ← Dead zone (zeros)
  |/
  |/
  |_____________→ Input
```

This operator:
- Shrinks values toward zero
- Sets small values exactly to zero
- Preserves large values (with shrinkage)

## Common Pitfalls

**Pitfall 1: Not scaling features**
```
Penalty depends on coefficient magnitude
Unscaled features penalized unfairly
Solution: Always StandardScaler first
```

**Pitfall 2: Expecting stable selection**
```
Correlated features selected arbitrarily
Different runs → different features
Solution: Use ElasticNet or stability selection
```

**Pitfall 3: Over-sparsifying**
```
α too large → too many zeros → underfit
Monitor validation performance
Solution: Use cross-validation for α
```

**Pitfall 4: Ignoring grouped features**
```
Lasso may break up natural groups
Domain knowledge suggests features together
Solution: Use ElasticNet or group Lasso
```

## Quick Reference

**Lasso formula:**
```
J(β) = MSE + λ||β||₁

No closed form → iterative methods
```

**Key properties:**
```
Geometry:       Diamond constraint
Effect:         Sets coefficients to zero
Selection:      Yes (automatic)
Solution:       Iterative
Best for:       Feature selection, sparse models
```

**Typical usage:**
```python
from sklearn.linear_model import Lasso

model = Lasso(alpha=0.1)    # λ in math = alpha in sklearn
model.fit(X_scaled, y)       # Always scale!

# Get selected features
selected = np.where(model.coef_ != 0)[0]
```

**Sklearn parameters:**
```
alpha:       Regularization strength (default=1.0)
max_iter:    Maximum iterations (default=1000)
tol:         Convergence tolerance (default=1e-4)
```

---

## Navigation

**Previous:** [Ridge Regression (L2)](reg-02-ridge-regression.md)

**Next:** [ElasticNet](reg-04-elasticnet.md)

**Series:**
- [Introduction and Bias-Variance](reg-01-introduction-bias-variance.md)
- [Ridge Regression (L2)](reg-02-ridge-regression.md)
- Lasso Regression (L1) (this file)
- [ElasticNet](reg-04-elasticnet.md)
- [Comparison and Tuning](reg-05-comparison-tuning.md)
- [Implementation](reg-06-implementation.md)
- [Practical Guide](reg-07-practical-guide.md)
