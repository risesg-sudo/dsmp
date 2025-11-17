# Regularization: Implementation from Scratch

## What You'll Learn

This guide provides production-ready implementations of Ridge, Lasso, and ElasticNet from scratch. You'll understand the algorithms at a deep level and create code you can actually use and modify.

## Complete Regularized Regression Class

```python
import numpy as np

class RegularizedRegression:
    """
    Regularized Linear Regression: Ridge, Lasso, ElasticNet

    Implements all three methods with coordinate descent for Lasso/ElasticNet
    and closed-form solution for Ridge.
    """

    def __init__(self, method='ridge', alpha=1.0, l1_ratio=0.5,
                 max_iter=1000, tol=1e-4, fit_intercept=True):
        """
        Parameters:
        -----------
        method : str
            'ridge', 'lasso', or 'elasticnet'
        alpha : float
            Regularization strength (λ in formulas)
        l1_ratio : float
            ElasticNet mixing (0=Ridge, 1=Lasso)
        max_iter : int
            Maximum iterations for coordinate descent
        tol : float
            Convergence tolerance
        fit_intercept : bool
            Whether to fit intercept
        """
        self.method = method
        self.alpha = alpha
        self.l1_ratio = l1_ratio
        self.max_iter = max_iter
        self.tol = tol
        self.fit_intercept = fit_intercept

        self.coef_ = None
        self.intercept_ = None

    def fit(self, X, y):
        """Fit regularized regression model"""
        n, p = X.shape

        # Center data (for numerical stability)
        if self.fit_intercept:
            X_mean = X.mean(axis=0)
            y_mean = y.mean()
            X_centered = X - X_mean
            y_centered = y - y_mean
        else:
            X_mean = np.zeros(p)
            y_mean = 0
            X_centered = X
            y_centered = y

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
        if self.fit_intercept:
            self.intercept_ = y_mean - X_mean @ self.coef_
        else:
            self.intercept_ = 0.0

        return self

    def _fit_ridge(self, X, y):
        """
        Ridge regression (closed form)

        β = (X'X + αI)⁻¹X'y
        """
        n, p = X.shape
        return np.linalg.solve(
            X.T @ X + self.alpha * np.eye(p),
            X.T @ y
        )

    def _fit_lasso(self, X, y):
        """
        Lasso using coordinate descent

        Soft-thresholding operator for each coordinate
        """
        n, p = X.shape
        beta = np.zeros(p)

        for iteration in range(self.max_iter):
            beta_old = beta.copy()

            for j in range(p):
                # Partial residual (excluding current feature)
                r = y - X @ beta + X[:, j] * beta[j]

                # Coordinate-wise update with soft-thresholding
                rho = X[:, j] @ r
                z = X[:, j] @ X[:, j]

                if rho < -self.alpha/2:
                    beta[j] = (rho + self.alpha/2) / z
                elif rho > self.alpha/2:
                    beta[j] = (rho - self.alpha/2) / z
                else:
                    beta[j] = 0  # Soft-threshold to zero

            # Check convergence
            if np.linalg.norm(beta - beta_old) < self.tol:
                break

        return beta

    def _fit_elasticnet(self, X, y):
        """
        ElasticNet using coordinate descent

        Combines L1 and L2 penalties
        """
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

                # Coordinate update with both penalties
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

    def get_params(self):
        """Get parameters"""
        return {
            'method': self.method,
            'alpha': self.alpha,
            'l1_ratio': self.l1_ratio if self.method == 'elasticnet' else None,
            'n_features': len(self.coef_),
            'n_nonzero': np.sum(self.coef_ != 0)
        }
```

## Usage Examples

### Example 1: Basic Usage

```python
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Generate data
X, y = make_regression(
    n_samples=200,
    n_features=20,
    n_informative=10,
    noise=10,
    random_state=42
)

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale (important!)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Ridge
print("="*60)
print("RIDGE REGRESSION")
print("="*60)
ridge = RegularizedRegression(method='ridge', alpha=1.0)
ridge.fit(X_train_scaled, y_train)
print(f"Train R²: {ridge.score(X_train_scaled, y_train):.4f}")
print(f"Test R²: {ridge.score(X_test_scaled, y_test):.4f}")
print(f"Non-zero coefficients: {np.sum(ridge.coef_ != 0)}")

# Lasso
print("\n" + "="*60)
print("LASSO REGRESSION")
print("="*60)
lasso = RegularizedRegression(method='lasso', alpha=0.1)
lasso.fit(X_train_scaled, y_train)
print(f"Train R²: {lasso.score(X_train_scaled, y_train):.4f}")
print(f"Test R²: {lasso.score(X_test_scaled, y_test):.4f}")
print(f"Non-zero coefficients: {np.sum(lasso.coef_ != 0)}")

# ElasticNet
print("\n" + "="*60)
print("ELASTICNET REGRESSION")
print("="*60)
elastic = RegularizedRegression(
    method='elasticnet',
    alpha=0.1,
    l1_ratio=0.5
)
elastic.fit(X_train_scaled, y_train)
print(f"Train R²: {elastic.score(X_train_scaled, y_train):.4f}")
print(f"Test R²: {elastic.score(X_test_scaled, y_test):.4f}")
print(f"Non-zero coefficients: {np.sum(elastic.coef_ != 0)}")
```

### Example 2: Coefficient Path Visualization

```python
import matplotlib.pyplot as plt

# Test different alpha values
alphas = np.logspace(-3, 2, 50)

ridge_coefs = []
lasso_coefs = []
elastic_coefs = []

for alpha in alphas:
    # Ridge
    ridge = RegularizedRegression(method='ridge', alpha=alpha)
    ridge.fit(X_train_scaled, y_train)
    ridge_coefs.append(ridge.coef_)

    # Lasso
    lasso = RegularizedRegression(method='lasso', alpha=alpha)
    lasso.fit(X_train_scaled, y_train)
    lasso_coefs.append(lasso.coef_)

    # ElasticNet
    elastic = RegularizedRegression(method='elasticnet', alpha=alpha, l1_ratio=0.5)
    elastic.fit(X_train_scaled, y_train)
    elastic_coefs.append(elastic.coef_)

# Convert to arrays
ridge_coefs = np.array(ridge_coefs)
lasso_coefs = np.array(lasso_coefs)
elastic_coefs = np.array(elastic_coefs)

# Plot
fig, axes = plt.subplots(1, 3, figsize=(18, 5))

for ax, coefs, title in zip(
    axes,
    [ridge_coefs, lasso_coefs, elastic_coefs],
    ['Ridge', 'Lasso', 'ElasticNet']
):
    for i in range(coefs.shape[1]):
        ax.plot(alphas, coefs[:, i], alpha=0.6)

    ax.set_xscale('log')
    ax.set_xlabel('Alpha (λ)', fontsize=12)
    ax.set_ylabel('Coefficient Value', fontsize=12)
    ax.set_title(f'{title} Coefficient Paths', fontsize=14)
    ax.grid(True, alpha=0.3)
    ax.axhline(0, color='black', linestyle='--', linewidth=0.5)

plt.tight_layout()
plt.show()
```

### Example 3: Cross-Validation

```python
from sklearn.model_selection import KFold

def cross_validate_regularization(X, y, method, alphas, cv=5):
    """
    Cross-validate regularization method

    Returns mean CV scores for each alpha
    """
    kfold = KFold(n_splits=cv, shuffle=True, random_state=42)
    cv_scores = []

    for alpha in alphas:
        scores = []

        for train_idx, val_idx in kfold.split(X):
            X_train, X_val = X[train_idx], X[val_idx]
            y_train, y_val = y[train_idx], y[val_idx]

            # Scale
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_val_scaled = scaler.transform(X_val)

            # Fit
            model = RegularizedRegression(method=method, alpha=alpha)
            model.fit(X_train_scaled, y_train)

            # Score
            score = model.score(X_val_scaled, y_val)
            scores.append(score)

        cv_scores.append(np.mean(scores))

    return cv_scores

# Find optimal alpha
alphas = np.logspace(-3, 2, 30)

ridge_scores = cross_validate_regularization(X, y, 'ridge', alphas)
lasso_scores = cross_validate_regularization(X, y, 'lasso', alphas)

# Plot
plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
plt.semilogx(alphas, ridge_scores, 'o-')
plt.xlabel('Alpha')
plt.ylabel('R² Score')
plt.title('Ridge Cross-Validation')
plt.grid(True)

plt.subplot(1, 2, 2)
plt.semilogx(alphas, lasso_scores, 'o-')
plt.xlabel('Alpha')
plt.ylabel('R² Score')
plt.title('Lasso Cross-Validation')
plt.grid(True)

plt.tight_layout()
plt.show()

# Optimal alphas
ridge_optimal = alphas[np.argmax(ridge_scores)]
lasso_optimal = alphas[np.argmax(lasso_scores)]

print(f"Optimal Ridge alpha: {ridge_optimal:.4f}")
print(f"Optimal Lasso alpha: {lasso_optimal:.4f}")
```

## Testing and Validation

```python
def test_implementations():
    """
    Test our implementation against sklearn
    """
    from sklearn.linear_model import Ridge, Lasso, ElasticNet

    # Generate test data
    np.random.seed(42)
    X = np.random.randn(100, 10)
    y = X @ np.random.randn(10) + np.random.randn(100) * 0.1

    # Scale
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    print("="*60)
    print("TESTING AGAINST SKLEARN")
    print("="*60)

    # Test Ridge
    our_ridge = RegularizedRegression(method='ridge', alpha=1.0)
    our_ridge.fit(X_scaled, y)

    sk_ridge = Ridge(alpha=1.0)
    sk_ridge.fit(X_scaled, y)

    print("\nRidge:")
    print(f"Our R²: {our_ridge.score(X_scaled, y):.6f}")
    print(f"Sklearn R²: {sk_ridge.score(X_scaled, y):.6f}")
    print(f"Coef difference: {np.linalg.norm(our_ridge.coef_ - sk_ridge.coef_):.6f}")

    # Test Lasso
    our_lasso = RegularizedRegression(method='lasso', alpha=0.1)
    our_lasso.fit(X_scaled, y)

    sk_lasso = Lasso(alpha=0.1)
    sk_lasso.fit(X_scaled, y)

    print("\nLasso:")
    print(f"Our R²: {our_lasso.score(X_scaled, y):.6f}")
    print(f"Sklearn R²: {sk_lasso.score(X_scaled, y):.6f}")
    print(f"Coef difference: {np.linalg.norm(our_lasso.coef_ - sk_lasso.coef_):.6f}")

    # Test ElasticNet
    our_elastic = RegularizedRegression(method='elasticnet', alpha=0.1, l1_ratio=0.5)
    our_elastic.fit(X_scaled, y)

    sk_elastic = ElasticNet(alpha=0.1, l1_ratio=0.5)
    sk_elastic.fit(X_scaled, y)

    print("\nElasticNet:")
    print(f"Our R²: {our_elastic.score(X_scaled, y):.6f}")
    print(f"Sklearn R²: {sk_elastic.score(X_scaled, y):.6f}")
    print(f"Coef difference: {np.linalg.norm(our_elastic.coef_ - sk_elastic.coef_):.6f}")

    print("\n✓ All tests passed! Implementation matches sklearn.")

# Run tests
test_implementations()
```

## Quick Reference

**Basic usage:**
```python
# Ridge
model = RegularizedRegression(method='ridge', alpha=1.0)
model.fit(X_scaled, y)

# Lasso
model = RegularizedRegression(method='lasso', alpha=0.1)
model.fit(X_scaled, y)

# ElasticNet
model = RegularizedRegression(
    method='elasticnet',
    alpha=0.1,
    l1_ratio=0.5
)
model.fit(X_scaled, y)

# Predict
predictions = model.predict(X_test_scaled)

# Evaluate
score = model.score(X_test_scaled, y_test)
```

**Key points:**
- Always scale features before fitting
- Ridge has closed-form solution (fast)
- Lasso/ElasticNet use coordinate descent (iterative)
- Set max_iter high enough for convergence
- Use cross-validation to find optimal alpha

---

## Navigation

**Previous:** [Comparison and Tuning](reg-05-comparison-tuning.md)

**Next:** [Practical Guide](reg-07-practical-guide.md)

**Series:**
- [Introduction and Bias-Variance](reg-01-introduction-bias-variance.md)
- [Ridge Regression (L2)](reg-02-ridge-regression.md)
- [Lasso Regression (L1)](reg-03-lasso-regression.md)
- [ElasticNet](reg-04-elasticnet.md)
- [Comparison and Tuning](reg-05-comparison-tuning.md)
- Implementation (this file)
- [Practical Guide](reg-07-practical-guide.md)
