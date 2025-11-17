# Polynomial Features

## What You'll Learn

Discover how polynomial features transform linear models into powerful curve-fitting machines. You'll learn when and how to create polynomial features, understand the math behind them, and see real-world examples that demonstrate their dramatic impact on model performance.

## Understanding Polynomial Features

Creating polynomial and interaction features from existing features unlocks the ability for linear models to capture non-linear relationships. This technique is elegantly simple yet remarkably powerful.

```
Degree 2 Polynomial Features:
═════════════════════════════

Original:  [x₁, x₂]

Generated:
  1       → Intercept (if include_bias=True)
  x₁      → Original feature
  x₂      → Original feature
  x₁²     → Squared term
  x₁x₂    → Interaction
  x₂²     → Squared term

Result: [1, x₁, x₂, x₁², x₁x₂, x₂²]
```

## Why Polynomial Features?

Linear models can only fit straight lines. But with polynomial features, these same models can capture curves and complex patterns.

```
Linear Model Limitation:
────────────────────────
y = β₀ + β₁x

Can only fit straight line:
    y │
      │      •
      │    •
      │  • ── Linear fit
      │•
      └──────── x

With Polynomial Features:
─────────────────────────
y = β₀ + β₁x + β₂x²

Can fit curves:
    y │     •
      │   •
      │  •  ← Polynomial fit (curve!)
      │ •
      │•
      └──────── x
```

## Basic Implementation

```python
from sklearn.preprocessing import PolynomialFeatures
import numpy as np
import pandas as pd

# Simple example with 2 features
X = np.array([[2, 3]])

print("Original Features:")
print(f"x1 = {X[0, 0]}, x2 = {X[0, 1]}")
print("\n" + "="*60 + "\n")

# Generate degree 2 polynomial features
poly = PolynomialFeatures(degree=2, include_bias=True)
X_poly = poly.fit_transform(X)

# Get feature names
feature_names = poly.get_feature_names_out(['x1', 'x2'])

print("Polynomial Features (degree=2):")
for name, value in zip(feature_names, X_poly[0]):
    if name == '1':
        print(f"  {name:10s} = {value:6.0f}  (bias/intercept)")
    elif '^2' in name:
        print(f"  {name:10s} = {value:6.0f}  (squared)")
    elif ' ' in name:
        print(f"  {name:10s} = {value:6.0f}  (interaction)")
    else:
        print(f"  {name:10s} = {value:6.0f}  (original)")

print("\n" + "="*60 + "\n")
print("Manual Calculation:")
print(f"  1          = 1")
print(f"  x1         = 2")
print(f"  x2         = 3")
print(f"  x1²        = 2² = 4")
print(f"  x1×x2      = 2×3 = 6")
print(f"  x2²        = 3² = 9")
```

## Real-World Example: House Prices

```python
import numpy as np
import pandas as pd
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

# Generate synthetic house price data with non-linear relationship
np.random.seed(42)
n = 200

area = np.random.uniform(500, 3000, n)
# Price has quadratic relationship with area
price = 50000 + 100 * area + 0.02 * area**2 + np.random.normal(0, 50000, n)

df = pd.DataFrame({
    'area': area,
    'price': price
})

print("House Price Data:")
print(df.head(10))
print("\n" + "="*60 + "\n")

# Split data
X = df[['area']]
y = df['price']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Model 1: Linear (degree=1)
model_linear = LinearRegression()
model_linear.fit(X_train, y_train)
y_pred_linear = model_linear.predict(X_test)
rmse_linear = np.sqrt(mean_squared_error(y_test, y_pred_linear))
r2_linear = r2_score(y_test, y_pred_linear)

# Model 2: Polynomial (degree=2)
poly_features = PolynomialFeatures(degree=2, include_bias=False)
X_train_poly = poly_features.fit_transform(X_train)
X_test_poly = poly_features.transform(X_test)

model_poly = LinearRegression()
model_poly.fit(X_train_poly, y_train)
y_pred_poly = model_poly.predict(X_test_poly)
rmse_poly = np.sqrt(mean_squared_error(y_test, y_pred_poly))
r2_poly = r2_score(y_test, y_pred_poly)

print("MODEL COMPARISON:")
print("="*60)
print(f"Linear (degree=1):")
print(f"  RMSE: ${rmse_linear:,.2f}")
print(f"  R²:   {r2_linear:.4f}")
print(f"\nPolynomial (degree=2):")
print(f"  RMSE: ${rmse_poly:,.2f}")
print(f"  R²:   {r2_poly:.4f}")
print(f"  Improvement: {((rmse_linear-rmse_poly)/rmse_linear*100):.1f}%")
```

## When to Use Polynomial Features

Use polynomial features when:
- Relationship appears non-linear
- Using linear models (regression, logistic)
- Small number of features (less than 10)
- Have enough data to avoid overfitting

Don't use when:
- Using tree-based models (they handle non-linearity)
- Too many input features (explosion)
- Limited data (overfitting risk)
- Features already capture non-linearity

## Common Pitfalls

The curse of dimensionality strikes quickly with polynomial features. Watch the feature explosion as degree and input features increase.

## Quick Reference

```
Create polynomial features:
  poly = PolynomialFeatures(degree=2)
  X_poly = poly.fit_transform(X)

Best practice:
  Start with degree 2
  Only increase if cross-validation shows improvement
  Monitor feature count closely
```

---

**Related Topics:**
- [Interaction Features](./interaction-features.md) - Deep dive into feature interactions
- [Best Practices](./feature-construction-best-practices.md) - Avoiding common mistakes

**Navigate:** [Feature Engineering Home](./README.md)
