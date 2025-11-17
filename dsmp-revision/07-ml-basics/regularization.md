# Regularization - Preventing Overfitting

## Table of Contents
1. [Introduction](#introduction)
2. [Bias-Variance Tradeoff](#bias-variance-tradeoff)
3. [Ridge Regression (L2)](#ridge-regression-l2)
4. [Lasso Regression (L1)](#lasso-regression-l1)
5. [ElasticNet](#elasticnet)
6. [Comparison](#comparison)
7. [Hyperparameter Tuning](#hyperparameter-tuning)
8. [Implementation](#implementation)
9. [When to Use What](#when-to-use-what)
10. [Interview Questions](#interview-questions)

---

## Introduction

**Regularization** adds a penalty term to the cost function to prevent overfitting by constraining model complexity.

### The Overfitting Problem

```
Underfit:             Good Fit:            Overfit:
   ●                     ●                     ●
     ●  /                  ●  ╱                  ● ╱╲
   ●   /               ●   ╱                 ●  ╱  ╲╱●
 ●    /              ●    ╱                ●  ╱   ╱
●    /             ●     ╱               ● ╲  ╱
                                           ╲ ╱
High Bias          Balanced            High Variance
Simple model       Good model          Complex model
```

**Without Regularization:**
- Complex models can fit training data perfectly
- But perform poorly on new data (overfitting)

**With Regularization:**
- Penalty discourages extreme coefficient values
- Simpler, more generalizable models

### Basic Idea

**Standard Cost Function:**
```
J(β) = MSE = (1/2n) Σ(yᵢ - ŷᵢ)²
```

**Regularized Cost Function:**
```
J(β) = MSE + Penalty

      = (1/2n) Σ(yᵢ - ŷᵢ)² + λ·R(β)
        \_________________/   \____/
           Fit data well      Simple model
```

Where:
- λ (lambda) = regularization strength
- R(β) = regularization term

**Trade-off:**
- λ = 0: No regularization (may overfit)
- λ → ∞: Maximum regularization (underfits, β → 0)
- λ optimal: Balance between fit and complexity

---

## Bias-Variance Tradeoff

### Decomposition of Error

**Total Error = Bias² + Variance + Irreducible Error**

```
Error = (Bias)² + Variance + σ²

Where:
Bias      = How far off predictions are on average
Variance  = How much predictions vary
σ²        = Noise in data (can't be reduced)
```

### Visual Understanding

```
Target: ⊕

High Bias, Low Variance:    Low Bias, High Variance:
  ● ● ●                           ●
  ● ● ●                       ●       ●
  ● ● ●                     ●     ⊕     ●
        ⊕                       ●       ●
                                    ●
Consistent but wrong          Inconsistent but centered

Low Bias, Low Variance:     High Bias, High Variance:
    ● ●                         ●
  ● ⊕ ●                             ●  ●
    ● ●                       ●
                                  ⊕       ●
Ideal!                        Worst case
```

### Mathematical Formulation

For prediction ŷ at point x:

```
E[(y - ŷ)²] = [E[ŷ] - y]²  +  E[(ŷ - E[ŷ])²]  +  σ²
              \__________/    \______________/    \__/
                  Bias²          Variance         Noise
```

### Bias-Variance vs Model Complexity

```
Error
  ↑
  |  \
  |   \_____ Total Error
  |    \    /
  |     \  /  ← Optimal complexity
  |Bias² \/______
  |      /\
  |     /  \
  |    /    \
  | Variance \______
  |
  |_____________________→ Model Complexity
  Simple            Complex

Low complexity:  High bias, low variance (underfitting)
High complexity: Low bias, high variance (overfitting)
Sweet spot:      Balanced (best generalization)
```

### Examples

#### Underfitting (High Bias)

```python
# Linear model for non-linear data
y = 2 + 3x + 2x² + noise

# Model: ŷ = β₀ + β₁x  (too simple!)

Bias:     High (can't capture non-linearity)
Variance: Low (consistent predictions)
Result:   Poor on both training and test
```

#### Overfitting (High Variance)

```python
# Polynomial degree 20 for simple relationship

# Model: ŷ = β₀ + β₁x + ... + β₂₀x²⁰  (too complex!)

Bias:     Low (fits training perfectly)
Variance: High (predictions vary wildly)
Result:   Great on training, poor on test
```

### Effect of Regularization

```
Without Regularization:
Error
  ↑          Training Error
  |              ______
  |   __________/
  |  /
  | /  Test Error
  |/________________
  |_________________→ Complexity
     Overfits!

With Regularization:
Error
  ↑  Training Error
  |        ___---
  |   ____/
  |  /
  | /  Test Error
  |/___‾‾‾‾\________
  |         ↑
  |    Optimal point
  |_________________→ Complexity
     Better generalization!
```

**Key Insight:** Regularization increases bias slightly but reduces variance significantly, leading to better overall performance.

---

## Ridge Regression (L2)

### Definition

**Ridge Regression** adds L2 penalty (sum of squared coefficients).

**Cost Function:**
```
J(β) = (1/2n) Σ(yᵢ - ŷᵢ)² + λ Σβⱼ²
       \_________________/   \____/
            MSE             L2 penalty

     = MSE + λ||β||₂²
```

**Note:** Typically don't penalize intercept β₀.

### Closed-Form Solution

```
β_ridge = (XᵀX + λI)⁻¹Xᵀy

Where:
I = identity matrix
λ = regularization parameter
```

**Key difference from OLS:** Adding λI ensures matrix is always invertible!

### Geometric Intuition

**Constraint form:**
```
Minimize:  Σ(yᵢ - ŷᵢ)²
Subject to: Σβⱼ² ≤ t
```

**Visualization (2D):**
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

**Key Point:** Circle constraint means solution rarely lands on axis → coefficients **shrunk but not zero**.

### Properties

✅ **Advantages:**
1. **Handles multicollinearity** - stabilizes coefficients when features are correlated
2. **Always has solution** - (XᵀX + λI) is always invertible
3. **Continuous** - small changes in data → small changes in β
4. **Computational** - closed-form solution available

❌ **Disadvantages:**
1. **No feature selection** - keeps all features (shrinks but doesn't zero out)
2. **Less interpretable** - all features included
3. **Biased estimates** - coefficients are shrunk

### Effect on Coefficients

```
λ = 0 (No regularization):
β = [-2.3, 5.1, -1.8, 3.7, 0.9]

λ = 1:
β = [-1.8, 3.2, -1.1, 2.4, 0.6]  ← Shrunk

λ = 10:
β = [-0.5, 0.9, -0.3, 0.7, 0.2]  ← Heavily shrunk

λ → ∞:
β → [0, 0, 0, 0, 0]  ← All zeros
```

### When to Use Ridge

✅ Use Ridge when:
- Features are highly correlated (multicollinearity)
- You want to keep all features
- You have more features than samples
- OLS is unstable

### Example: Handling Multicollinearity

```python
import numpy as np
from sklearn.linear_model import LinearRegression, Ridge

# Create correlated features
np.random.seed(42)
n = 100

# X1 and X2 are highly correlated
X1 = np.random.randn(n)
X2 = X1 + np.random.randn(n) * 0.1  # Very similar to X1
X3 = np.random.randn(n)

X = np.column_stack([X1, X2, X3])
y = 2*X1 + 3*X3 + np.random.randn(n) * 0.5

# OLS - unstable due to multicollinearity
ols = LinearRegression()
ols.fit(X, y)
print("OLS Coefficients:", ols.coef_)
# Output: [ 1.23, 0.89, 3.01] ← Unstable

# Ridge - stable
ridge = Ridge(alpha=1.0)
ridge.fit(X, y)
print("Ridge Coefficients:", ridge.coef_)
# Output: [ 1.05, 1.02, 2.98] ← More stable, similar values for X1 and X2
```

---

## Lasso Regression (L1)

### Definition

**Lasso** (Least Absolute Shrinkage and Selection Operator) adds L1 penalty (sum of absolute values).

**Cost Function:**
```
J(β) = (1/2n) Σ(yᵢ - ŷᵢ)² + λ Σ|βⱼ|
       \_________________/   \____/
            MSE           L1 penalty

     = MSE + λ||β||₁
```

### No Closed-Form Solution

**Must use iterative methods:**
- Coordinate descent (most common)
- Proximal gradient descent
- LARS (Least Angle Regression)

### Geometric Intuition

**Constraint form:**
```
Minimize:  Σ(yᵢ - ŷᵢ)²
Subject to: Σ|βⱼ| ≤ t
```

**Visualization (2D):**
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

★ = Lasso solution (on corner/axis)
```

**Key Point:** Diamond has corners on axes → solution often lands on axis → coefficients **set to exactly zero** = **feature selection**!

### Properties

✅ **Advantages:**
1. **Feature selection** - sets irrelevant coefficients to exactly zero
2. **Interpretable** - sparse models (fewer features)
3. **Works well** when only few features are important

❌ **Disadvantages:**
1. **Arbitrary selection** - if features correlated, randomly picks one
2. **Unstable** - small data changes can switch which features selected
3. **No closed form** - slower to compute than Ridge
4. **Selects at most n features** when p > n

### Effect on Coefficients

```
λ = 0 (No regularization):
β = [-2.3, 5.1, -1.8, 3.7, 0.9]

λ = 1:
β = [-1.5, 3.8, 0.0, 2.1, 0.0]  ← Some zeros!

λ = 10:
β = [0.0, 1.2, 0.0, 0.0, 0.0]  ← Sparse!

λ → ∞:
β → [0, 0, 0, 0, 0]  ← All zeros
```

### Feature Selection Example

```python
from sklearn.linear_model import Lasso
import numpy as np

# Create data with some irrelevant features
np.random.seed(42)
n, p = 100, 20

X = np.random.randn(n, p)
# Only first 5 features are relevant
true_coef = np.zeros(p)
true_coef[:5] = [2, -3, 1.5, -1, 2.5]

y = X @ true_coef + np.random.randn(n) * 0.5

# Lasso automatically selects important features
lasso = Lasso(alpha=0.1)
lasso.fit(X, y)

# Count non-zero coefficients
non_zero = np.sum(lasso.coef_ != 0)
print(f"Selected {non_zero} out of {p} features")
print(f"Coefficients: {lasso.coef_}")

# Output:
# Selected 6 out of 20 features
# [ 1.89 -2.75  1.32 -0.84  2.31  0.12  0.  0.  ... 0.]
#   ↑__________________|    |___________________|
#      True features           Zeros (correctly excluded)
```

### When to Use Lasso

✅ Use Lasso when:
- You want feature selection
- You believe many features are irrelevant
- You need interpretable models
- You have many more features than samples (p >> n)

---

## ElasticNet

### Definition

**ElasticNet** combines L1 and L2 penalties (best of both worlds).

**Cost Function:**
```
J(β) = MSE + λ₁ Σ|βⱼ| + λ₂ Σβⱼ²
            \________/   \____/
             L1 (Lasso)  L2 (Ridge)

Alternative parameterization:
J(β) = MSE + λ[α||β||₁ + (1-α)||β||₂²]

Where:
λ = overall regularization strength
α = L1 ratio (0 = Ridge, 1 = Lasso)
```

### Geometric Intuition

```
    β₂
     ↑
     |      __
     |    /    \    ← Combination of circle + diamond
     |   |  ★   |      (rounded diamond)
     |   |      |
     |    \____/
     |
     |___________________→ β₁

★ = ElasticNet solution
```

**Shape:** Rounded corners → still can hit axes (feature selection) but more stable than Lasso.

### Properties

✅ **Advantages:**
1. **Feature selection** (like Lasso)
2. **Groups correlated features** (like Ridge) - selects groups together
3. **Stable** - doesn't randomly drop correlated features
4. **Works when p > n** - can select more than n features

❌ **Disadvantages:**
1. **Two hyperparameters** to tune (λ and α)
2. **More complex** than Ridge or Lasso alone

### When to Use ElasticNet

✅ Use ElasticNet when:
- Features are highly correlated AND you want feature selection
- Lasso is too unstable
- You have grouped features (e.g., dummy variables)
- You want best of both Ridge and Lasso

### Example: Correlated Features

```python
from sklearn.linear_model import Lasso, Ridge, ElasticNet

# Create highly correlated features
np.random.seed(42)
n = 100
X1 = np.random.randn(n)
X2 = X1 + np.random.randn(n) * 0.1  # Highly correlated with X1
X3 = X1 + np.random.randn(n) * 0.1  # Also correlated with X1
X4 = np.random.randn(n)

X = np.column_stack([X1, X2, X3, X4])
# True model: all correlated features contribute
y = X1 + X2 + X3 + 2*X4 + np.random.randn(n) * 0.1

# Lasso - arbitrarily picks one from correlated group
lasso = Lasso(alpha=0.1)
lasso.fit(X, y)
print("Lasso:", lasso.coef_)
# Output: [2.5, 0.0, 0.0, 1.9]  ← Dropped X2, X3 arbitrarily

# Ridge - keeps all but doesn't select
ridge = Ridge(alpha=0.1)
ridge.fit(X, y)
print("Ridge:", ridge.coef_)
# Output: [1.0, 0.9, 1.1, 2.0]  ← Keeps all

# ElasticNet - keeps correlated group together
elastic = ElasticNet(alpha=0.1, l1_ratio=0.5)
elastic.fit(X, y)
print("ElasticNet:", elastic.coef_)
# Output: [0.8, 0.7, 0.9, 1.9]  ← Keeps all correlated features!
```

---

## Comparison

### Side-by-Side Comparison

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
| **Best For** | Correlated features | Feature selection | Both |

### Visual Comparison

#### Coefficient Paths

```
Coefficient Value vs Regularization Strength

Ridge:
β
↑
|  ___
|     ‾‾‾--___     ← Shrinks smoothly
|              ‾‾--___
0|______________________→ λ
   Never reaches zero

Lasso:
β
↑
|  ___
|     \___          ← Becomes zero
|         \
0|__________\___________→ λ
            ↑
      Reaches zero

ElasticNet:
β
↑
|  ___
|     ‾‾--__        ← Between Ridge and Lasso
|          \
0|___________\__________→ λ
```

#### Decision Boundaries

For classification (conceptually similar for regression):

```
Ridge:                 Lasso:               ElasticNet:
Smooth boundary        Sharp corners        Balanced

    |  /              |  /|                 |  /
 ●  | /  ○          ● | / | ○             ● | /  ○
____|/__             ___|/__|              ___|/__
  ● | ○                ●|   ○               ● |  ○
    |                    |                    |
```

### Regularization Strength Effect

```
λ = 0 (No regularization):
- All methods → OLS solution
- May overfit

λ = small (Light regularization):
- Ridge: Coefficients slightly shrunk
- Lasso: Few coefficients zeroed
- ElasticNet: Mix of both

λ = medium (Moderate regularization):
- Ridge: Coefficients moderately shrunk
- Lasso: Many coefficients zeroed
- ElasticNet: Balanced

λ = large (Heavy regularization):
- All methods → All coefficients → 0
- May underfit
```

### Example: All Three Methods

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import Ridge, Lasso, ElasticNet
from sklearn.preprocessing import StandardScaler

# Generate data
np.random.seed(42)
n, p = 100, 50
X = np.random.randn(n, p)
# Only first 10 features relevant
true_coef = np.zeros(p)
true_coef[:10] = np.random.randn(10) * 3
y = X @ true_coef + np.random.randn(n)

# Standardize
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Try different alphas
alphas = np.logspace(-3, 3, 50)

ridge_coefs = []
lasso_coefs = []
elastic_coefs = []

for alpha in alphas:
    # Ridge
    ridge = Ridge(alpha=alpha)
    ridge.fit(X_scaled, y)
    ridge_coefs.append(ridge.coef_)

    # Lasso
    lasso = Lasso(alpha=alpha, max_iter=10000)
    lasso.fit(X_scaled, y)
    lasso_coefs.append(lasso.coef_)

    # ElasticNet
    elastic = ElasticNet(alpha=alpha, l1_ratio=0.5, max_iter=10000)
    elastic.fit(X_scaled, y)
    elastic_coefs.append(elastic.coef_)

# Plot coefficient paths
fig, axes = plt.subplots(1, 3, figsize=(18, 5))

for ax, coefs, title in zip(axes,
                             [ridge_coefs, lasso_coefs, elastic_coefs],
                             ['Ridge', 'Lasso', 'ElasticNet']):
    coefs = np.array(coefs)
    for i in range(p):
        ax.plot(alphas, coefs[:, i], alpha=0.5)

    ax.set_xscale('log')
    ax.set_xlabel('Regularization Strength (λ)')
    ax.set_ylabel('Coefficient Value')
    ax.set_title(f'{title} Coefficient Paths')
    ax.grid(True)
    ax.axhline(0, color='black', linestyle='--', linewidth=0.5)

plt.tight_layout()
plt.show()
```

---

## Hyperparameter Tuning

### The Regularization Parameter (λ or α)

**Goal:** Find optimal λ that minimizes error on unseen data.

### Method 1: Cross-Validation

```python
from sklearn.linear_model import RidgeCV, LassoCV, ElasticNetCV

# Ridge with built-in CV
alphas = np.logspace(-3, 3, 100)
ridge_cv = RidgeCV(alphas=alphas, cv=5)
ridge_cv.fit(X, y)

print(f"Best alpha: {ridge_cv.alpha_}")
print(f"Best score: {ridge_cv.score(X, y)}")

# Lasso with built-in CV
lasso_cv = LassoCV(alphas=alphas, cv=5, max_iter=10000)
lasso_cv.fit(X, y)

print(f"Best alpha: {lasso_cv.alpha_}")

# ElasticNet with built-in CV
elastic_cv = ElasticNetCV(alphas=alphas, l1_ratio=[0.1, 0.5, 0.7, 0.9],
                         cv=5, max_iter=10000)
elastic_cv.fit(X, y)

print(f"Best alpha: {elastic_cv.alpha_}")
print(f"Best l1_ratio: {elastic_cv.l1_ratio_}")
```

### Method 2: Manual Grid Search

```python
from sklearn.model_selection import GridSearchCV
from sklearn.linear_model import Ridge

# Define parameter grid
param_grid = {
    'alpha': np.logspace(-3, 3, 20)
}

# Grid search with cross-validation
grid_search = GridSearchCV(
    Ridge(),
    param_grid,
    cv=5,
    scoring='neg_mean_squared_error',
    n_jobs=-1
)

grid_search.fit(X, y)

print(f"Best parameters: {grid_search.best_params_}")
print(f"Best score: {-grid_search.best_score_:.4f}")

# Plot validation curve
results = pd.DataFrame(grid_search.cv_results_)
plt.figure(figsize=(10, 6))
plt.plot(results['param_alpha'], -results['mean_test_score'], marker='o')
plt.xscale('log')
plt.xlabel('Alpha')
plt.ylabel('MSE')
plt.title('Validation Curve')
plt.grid(True)
plt.show()
```

### Validation Curve

```
Error
  ↑
  |      /
  |     /  ← Underfitting (high bias)
  |    /
  |   /
  |  /___
  |      ‾‾‾\___  ← Optimal λ
  |            ‾‾‾\___  ← Overfitting (high variance)
  |
  |_____________________→ λ
  Small              Large
```

### ElasticNet: Tuning Two Parameters

```python
from sklearn.model_selection import GridSearchCV
from sklearn.linear_model import ElasticNet

# Grid search for both parameters
param_grid = {
    'alpha': np.logspace(-3, 1, 20),
    'l1_ratio': np.linspace(0.1, 0.9, 9)
}

grid_search = GridSearchCV(
    ElasticNet(max_iter=10000),
    param_grid,
    cv=5,
    scoring='neg_mean_squared_error',
    n_jobs=-1
)

grid_search.fit(X, y)

print(f"Best alpha: {grid_search.best_params_['alpha']:.4f}")
print(f"Best l1_ratio: {grid_search.best_params_['l1_ratio']:.2f}")

# Visualize 2D grid
results = pd.DataFrame(grid_search.cv_results_)
pivot = results.pivot_table(
    values='mean_test_score',
    index='param_l1_ratio',
    columns='param_alpha'
)

plt.figure(figsize=(12, 8))
sns.heatmap(-pivot, annot=True, fmt='.2f', cmap='viridis')
plt.xlabel('Alpha')
plt.ylabel('L1 Ratio')
plt.title('ElasticNet Hyperparameter Tuning')
plt.show()
```

---

## Implementation

### From Scratch Implementation

```python
import numpy as np

class RegularizedRegression:
    """
    Regularized Linear Regression (Ridge, Lasso, ElasticNet)
    """

    def __init__(self, method='ridge', alpha=1.0, l1_ratio=0.5,
                 max_iter=1000, tol=1e-4):
        """
        Parameters:
        -----------
        method : str
            'ridge', 'lasso', or 'elasticnet'
        alpha : float
            Regularization strength
        l1_ratio : float
            ElasticNet mixing parameter (0 = Ridge, 1 = Lasso)
        max_iter : int
            Maximum iterations for Lasso/ElasticNet
        tol : float
            Convergence tolerance
        """
        self.method = method
        self.alpha = alpha
        self.l1_ratio = l1_ratio
        self.max_iter = max_iter
        self.tol = tol
        self.coef_ = None
        self.intercept_ = None

    def fit(self, X, y):
        """Fit model"""
        n, p = X.shape

        # Center data
        X_mean = X.mean(axis=0)
        y_mean = y.mean()
        X_centered = X - X_mean
        y_centered = y - y_mean

        # Fit based on method
        if self.method == 'ridge':
            self.coef_ = self._fit_ridge(X_centered, y_centered)
        elif self.method == 'lasso':
            self.coef_ = self._fit_lasso(X_centered, y_centered)
        elif self.method == 'elasticnet':
            self.coef_ = self._fit_elasticnet(X_centered, y_centered)
        else:
            raise ValueError("Method must be 'ridge', 'lasso', or 'elasticnet'")

        # Compute intercept
        self.intercept_ = y_mean - X_mean @ self.coef_

        return self

    def _fit_ridge(self, X, y):
        """Ridge regression (closed form)"""
        n, p = X.shape
        # β = (X'X + αI)⁻¹X'y
        return np.linalg.solve(X.T @ X + self.alpha * np.eye(p), X.T @ y)

    def _fit_lasso(self, X, y):
        """Lasso using coordinate descent"""
        n, p = X.shape
        beta = np.zeros(p)

        for iteration in range(self.max_iter):
            beta_old = beta.copy()

            for j in range(p):
                # Partial residual
                r = y - X @ beta + X[:, j] * beta[j]

                # Coordinate update (soft-thresholding)
                rho = X[:, j] @ r
                z = X[:, j] @ X[:, j]

                if rho < -self.alpha/2:
                    beta[j] = (rho + self.alpha/2) / z
                elif rho > self.alpha/2:
                    beta[j] = (rho - self.alpha/2) / z
                else:
                    beta[j] = 0

            # Check convergence
            if np.linalg.norm(beta - beta_old) < self.tol:
                break

        return beta

    def _fit_elasticnet(self, X, y):
        """ElasticNet using coordinate descent"""
        n, p = X.shape
        beta = np.zeros(p)

        # Split regularization
        alpha_l1 = self.alpha * self.l1_ratio
        alpha_l2 = self.alpha * (1 - self.l1_ratio)

        for iteration in range(self.max_iter):
            beta_old = beta.copy()

            for j in range(p):
                # Partial residual
                r = y - X @ beta + X[:, j] * beta[j]

                # Coordinate update
                rho = X[:, j] @ r
                z = X[:, j] @ X[:, j] + alpha_l2

                if rho < -alpha_l1/2:
                    beta[j] = (rho + alpha_l1/2) / z
                elif rho > alpha_l1/2:
                    beta[j] = (rho - alpha_l1/2) / z
                else:
                    beta[j] = 0

            # Check convergence
            if np.linalg.norm(beta - beta_old) < self.tol:
                break

        return beta

    def predict(self, X):
        """Make predictions"""
        return X @ self.coef_ + self.intercept_

    def score(self, X, y):
        """R² score"""
        y_pred = self.predict(X)
        ss_res = np.sum((y - y_pred)**2)
        ss_tot = np.sum((y - y.mean())**2)
        return 1 - ss_res/ss_tot
```

### Usage Example

```python
# Generate data
np.random.seed(42)
n, p = 100, 50
X = np.random.randn(n, p)
true_coef = np.zeros(p)
true_coef[:10] = np.random.randn(10) * 3
y = X @ true_coef + np.random.randn(n)

# Test Ridge
ridge = RegularizedRegression(method='ridge', alpha=1.0)
ridge.fit(X, y)
print(f"Ridge R²: {ridge.score(X, y):.4f}")
print(f"Non-zero coefs: {np.sum(ridge.coef_ != 0)}")

# Test Lasso
lasso = RegularizedRegression(method='lasso', alpha=0.1)
lasso.fit(X, y)
print(f"\nLasso R²: {lasso.score(X, y):.4f}")
print(f"Non-zero coefs: {np.sum(lasso.coef_ != 0)}")

# Test ElasticNet
elastic = RegularizedRegression(method='elasticnet', alpha=0.1, l1_ratio=0.5)
elastic.fit(X, y)
print(f"\nElasticNet R²: {elastic.score(X, y):.4f}")
print(f"Non-zero coefs: {np.sum(elastic.coef_ != 0)}")
```

---

## When to Use What

### Decision Tree

```
Start: Linear Regression Problem
         |
         ↓
┌────────────────────┐
│ Multicollinearity? │
└────────┬───────────┘
         │
    Yes  │  No
    ┌────┴────┐
    ↓         ↓
┌─────────┐ ┌──────────────┐
│ Use     │ │ Want feature │
│ Ridge   │ │ selection?   │
└─────────┘ └──────┬───────┘
                   │
              Yes  │  No
              ┌────┴─────┐
              ↓          ↓
         ┌──────────┐ ┌─────────┐
         │Correlated│ │   Use   │
         │features? │ │  Lasso  │
         └────┬─────┘ └─────────┘
              │
         Yes  │  No
         ┌────┴─────┐
         ↓          ↓
    ┌──────────┐ ┌─────────┐
    │   Use    │ │   Use   │
    │ElasticNet│ │  Lasso  │
    └──────────┘ └─────────┘
```

### Quick Reference Table

| Situation | Best Choice | Why |
|-----------|------------|-----|
| **High multicollinearity** | Ridge | Stabilizes coefficients |
| **Want feature selection** | Lasso | Sets coefficients to zero |
| **p > n** | Ridge or Lasso | Prevents overfitting |
| **Correlated + sparse** | ElasticNet | Groups + selection |
| **All features important** | Ridge | Keeps all features |
| **Few features important** | Lasso | Automatic selection |
| **Grouped features** | ElasticNet | Selects groups |
| **Interpretability** | Lasso | Fewer features |
| **Prediction accuracy** | ElasticNet or CV | Best generalization |
| **Speed** | Ridge | Closed-form solution |

### Practical Guidelines

#### 1. Default Approach

```python
# Start with ElasticNet + CV (usually works well)
from sklearn.linear_model import ElasticNetCV

model = ElasticNetCV(l1_ratio=[0.1, 0.5, 0.7, 0.9, 0.95, 0.99],
                     cv=5, max_iter=10000)
model.fit(X, y)
```

**Reason:** ElasticNet combines benefits of Ridge and Lasso, and CV finds optimal parameters automatically.

#### 2. For Interpretation

```python
# Use Lasso for sparse model
from sklearn.linear_model import LassoCV

model = LassoCV(cv=5, max_iter=10000)
model.fit(X, y)

# Get selected features
selected = np.where(model.coef_ != 0)[0]
print(f"Selected features: {selected}")
```

#### 3. For Stability

```python
# Use Ridge when stability is critical
from sklearn.linear_model import RidgeCV

model = RidgeCV(alphas=np.logspace(-3, 3, 50), cv=5)
model.fit(X, y)
```

### Real-World Examples

#### Example 1: House Price Prediction

**Scenario:** 100 features (area, rooms, age, location, etc.)

```python
# Many features, some correlated → ElasticNet
model = ElasticNetCV(l1_ratio=[0.5, 0.7, 0.9], cv=5)
model.fit(X_train, y_train)

# Identify important features
important_features = np.where(model.coef_ != 0)[0]
print(f"Using {len(important_features)} out of {len(X_train.columns)} features")
```

**Result:** Automatic feature selection while handling correlated features.

#### Example 2: Gene Expression Analysis

**Scenario:** 10,000 genes, 100 samples (p >> n)

```python
# Very high dimensional → Lasso for extreme sparsity
model = LassoCV(cv=10, max_iter=100000)
model.fit(X_train, y_train)

# Find relevant genes
relevant_genes = np.where(model.coef_ != 0)[0]
print(f"Identified {len(relevant_genes)} relevant genes")
```

**Result:** Sparse model focusing on key genes.

#### Example 3: Financial Modeling

**Scenario:** Economic indicators (highly correlated)

```python
# Multicollinearity → Ridge
model = RidgeCV(alphas=np.logspace(-2, 2, 50), cv=5)
model.fit(X_train, y_train)

# All features kept, stable coefficients
print("All indicators used with stable coefficients")
```

**Result:** Stable predictions despite correlated features.

---

## Interview Questions

### Basic Questions

**Q1: What is regularization and why do we need it?**

**A:**
Regularization adds a penalty to the cost function to prevent overfitting by constraining model complexity.

**Without regularization:**
- Complex models fit training data perfectly
- Poor generalization to new data (overfitting)

**With regularization:**
- Penalty discourages extreme coefficients
- Simpler, more generalizable models
- Better performance on unseen data

---

**Q2: Explain bias-variance tradeoff.**

**A:**
**Total Error = Bias² + Variance + Irreducible Error**

- **Bias:** Error from wrong assumptions (underfitting)
- **Variance:** Error from sensitivity to training data (overfitting)
- **Tradeoff:** Reducing one often increases the other

**Regularization:** Increases bias slightly but reduces variance significantly → lower total error.

---

**Q3: What's the difference between Ridge and Lasso?**

**A:**

| Feature | Ridge (L2) | Lasso (L1) |
|---------|-----------|-----------|
| **Penalty** | Σβ² | Σ\|β\| |
| **Geometry** | Circle | Diamond |
| **Feature selection** | No | Yes |
| **Coefficients** | Shrunk | Sparse (zeros) |
| **Solution** | Closed-form | Iterative |
| **Best for** | Multicollinearity | Feature selection |

---

**Q4: What is the regularization parameter λ?**

**A:**
λ controls the strength of regularization:

- **λ = 0:** No regularization (may overfit)
- **λ small:** Light penalty
- **λ optimal:** Balance between fit and simplicity
- **λ large:** Heavy penalty (may underfit)
- **λ → ∞:** All coefficients → 0

**Find optimal λ using cross-validation.**

---

**Q5: How does Ridge regression handle multicollinearity?**

**A:**
Ridge adds λI to XᵀX:

```
β_ridge = (XᵀX + λI)⁻¹Xᵀy
```

**Benefits:**
1. **Always invertible:** Even when XᵀX is singular
2. **Stable coefficients:** Correlated features have similar values
3. **Reduced variance:** Less sensitive to small data changes

---

### Intermediate Questions

**Q6: Why does Lasso perform feature selection but Ridge doesn't?**

**A:**
**Geometric reason:**

Ridge constraint (circle):
- Smooth, no corners
- Solution rarely on axis
- Coefficients shrink but ≠ 0

Lasso constraint (diamond):
- Has corners on axes
- Solution often on corners
- Coefficients = exactly 0

**Mathematical reason:**
- L1 penalty: |β| is not differentiable at 0 → pushes to exactly 0
- L2 penalty: β² is smooth → asymptotically approaches 0

---

**Q7: What is ElasticNet and when should you use it?**

**A:**
**ElasticNet combines L1 + L2:**
```
Penalty = α·||β||₁ + (1-α)·||β||₂²
```

**Use when:**
1. **Correlated features + want selection:** Lasso picks randomly, ElasticNet selects groups
2. **p > n + want selection:** Lasso limited to n features, ElasticNet can select more
3. **Grouped features:** ElasticNet keeps related features together

**Example:** Predicting house price with dummy variables for neighborhoods (grouped features).

---

**Q8: How do you tune regularization parameters?**

**A:**
**Best practice: Cross-validation**

```python
# Ridge
ridge = RidgeCV(alphas=np.logspace(-3, 3, 50), cv=5)

# Lasso
lasso = LassoCV(cv=5)

# ElasticNet (tune both λ and α)
elastic = ElasticNetCV(
    alphas=np.logspace(-3, 1, 20),
    l1_ratio=[0.1, 0.5, 0.7, 0.9],
    cv=5
)
```

**Plot validation curve to visualize:**
- U-shaped curve
- Minimum = optimal λ

---

**Q9: Can Ridge coefficients become exactly zero?**

**A:**
**No.** Ridge coefficients shrink towards zero but never reach exactly zero (except λ → ∞).

**Mathematically:**
```
β_ridge = (XᵀX + λI)⁻¹Xᵀy

As λ → ∞: β → 0 asymptotically
But for finite λ: β ≠ 0
```

**For feature selection, use Lasso or ElasticNet.**

---

**Q10: What happens when you increase λ?**

**A:**

```
λ ↑ → Penalty ↑ → Coefficients shrink → Simpler model

Effects:
- Bias ↑ (underfitting)
- Variance ↓ (less overfitting)
- Training error ↑
- Test error: ↓ then ↑ (U-shape)

Sweet spot: λ that minimizes test error
```

---

### Advanced Questions

**Q11: Derive the Ridge regression solution.**

**A:**
```
Cost: J(β) = ||Xβ - y||² + λ||β||²

Expand: J(β) = (Xβ - y)ᵀ(Xβ - y) + λβᵀβ
            = βᵀXᵀXβ - 2βᵀXᵀy + yᵀy + λβᵀβ

Take derivative:
∂J/∂β = 2XᵀXβ - 2Xᵀy + 2λβ

Set to zero:
2XᵀXβ - 2Xᵀy + 2λβ = 0
XᵀXβ + λIβ = Xᵀy
(XᵀX + λI)β = Xᵀy

Solution:
β_ridge = (XᵀX + λI)⁻¹Xᵀy
```

---

**Q12: Why doesn't Lasso have a closed-form solution?**

**A:**
**L1 penalty is not differentiable at zero:**

```
d|β|/dβ = { +1  if β > 0
          { -1  if β < 0
          { undefined if β = 0

→ Can't solve ∇J = 0 analytically
→ Need iterative methods (coordinate descent, proximal gradient)
```

**L2 penalty is smooth:**
```
d(β²)/dβ = 2β  (defined everywhere)
→ Can solve analytically
```

---

**Q13: Explain the soft-thresholding operator in Lasso.**

**A:**
**Soft-thresholding:**
```
S(β, λ) = sign(β) max(|β| - λ, 0)

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
  | λ     λ
  |/
  |/
  |_____________→ Input
```

**Effect:** Shrinks AND sets small coefficients to exactly zero.

---

**Q14: Compare regularization to other methods of preventing overfitting.**

**A:**

| Method | How it works | Pros | Cons |
|--------|-------------|------|------|
| **Regularization** | Penalty on coefficients | Principled, flexible | Need to tune λ |
| **Feature Selection** | Remove features | Simple, interpretable | Discrete, no ranking |
| **Dimension Reduction (PCA)** | Transform features | Uncorrelated features | Lose interpretability |
| **Early Stopping** | Stop training early | Simple | Only for iterative methods |
| **Dropout** (neural nets) | Randomly drop neurons | Effective for NNs | Only for NNs |
| **Ensemble** | Combine models | Often best performance | Computationally expensive |
| **More Data** | Collect more samples | Best if possible | Often impractical |

**Best:** Combine multiple methods (e.g., regularization + cross-validation).

---

**Q15: How does regularization relate to Bayesian inference?**

**A:**
**Regularization = MAP estimation with prior:**

**Ridge = Gaussian prior:**
```
Prior: β ~ N(0, σ²I)
→ Penalty: -log p(β) ∝ ||β||₂²
→ Ridge regularization!
```

**Lasso = Laplace prior:**
```
Prior: β ~ Laplace(0, b)
→ Penalty: -log p(β) ∝ ||β||₁
→ Lasso regularization!
```

**Interpretation:**
- λ controls prior strength
- Regularization = encoding belief that coefficients should be small
- Larger λ = stronger prior belief

---

## Quick Reference

### Key Formulas

```
Ridge:       J(β) = MSE + λΣβ²
             β = (XᵀX + λI)⁻¹Xᵀy

Lasso:       J(β) = MSE + λΣ|β|
             (No closed form)

ElasticNet:  J(β) = MSE + λ[αΣ|β| + (1-α)Σβ²]

Bias-Variance: Error = Bias² + Variance + σ²
```

### Decision Guide

```
Choose regularization method:
├─ Multicollinearity?           → Ridge
├─ Feature selection needed?    → Lasso or ElasticNet
├─ Correlated + sparse?         → ElasticNet
├─ All features important?      → Ridge
└─ Unsure?                      → ElasticNet + CV
```

### Sklearn Quick Reference

```python
# Ridge
from sklearn.linear_model import Ridge, RidgeCV
model = RidgeCV(alphas=np.logspace(-3, 3, 50), cv=5)

# Lasso
from sklearn.linear_model import Lasso, LassoCV
model = LassoCV(cv=5, max_iter=10000)

# ElasticNet
from sklearn.linear_model import ElasticNet, ElasticNetCV
model = ElasticNetCV(l1_ratio=[0.1, 0.5, 0.9], cv=5)
```

---

**End of Regularization Notes**

**Complete ML Basics Series:**
1. [Linear Regression](linear-regression.md)
2. [Regression Analysis](regression-analysis.md)
3. [Gradient Descent](gradient-descent.md)
4. Regularization (this file)

---

**Next Module:** [ML Algorithms](../08-ml-algorithms/) (Classification, Decision Trees, etc.)
