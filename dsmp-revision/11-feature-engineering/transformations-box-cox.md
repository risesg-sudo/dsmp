# Box-Cox Transformation

## Introduction

Why guess which transformation to use when Box-Cox can find the optimal one automatically? You'll learn how this powerful technique maximizes normality, understand the lambda parameter, and see when it outperforms manual transformations.

## The Concept

Box-Cox automatically finds the best power transformation parameter (lambda).

```
Formula:
────────
         ⎧ (x^λ - 1) / λ    if λ ≠ 0
y(λ) =   ⎨
         ⎩ log(x)           if λ = 0

Where λ is chosen to maximize normality

Special Cases:
──────────────
λ = 1:    y = x - 1           (no transformation)
λ = 0.5:  y = (√x - 1) / 0.5  (square root-like)
λ = 0:    y = log(x)          (log transformation)
λ = -1:   y = -1/x            (inverse)

Important: Requires x > 0 for all values!
```

## Basic Implementation

```python
from scipy import stats
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Right-skewed data
np.random.seed(42)
data = np.random.gamma(shape=2, scale=2, size=1000)

print("Original Data:")
print("="*60)
print(f"Mean:     {data.mean():.2f}")
print(f"Median:   {np.median(data):.2f}")
print(f"Skewness: {stats.skew(data):.2f}")
print(f"Min:      {data.min():.2f}")
print(f"Max:      {data.max():.2f}")

print("\n" + "="*60 + "\n")

# Box-Cox transformation
transformed_data, optimal_lambda = stats.boxcox(data)

print("After Box-Cox Transformation:")
print(f"Optimal λ (lambda): {optimal_lambda:.4f}")
print(f"Mean:     {transformed_data.mean():.2f}")
print(f"Median:   {np.median(transformed_data):.2f}")
print(f"Skewness: {stats.skew(transformed_data):.2f}")

print("\n" + "="*60 + "\n")
print("Interpretation of λ:")
if abs(optimal_lambda) < 0.1:
    print(f"λ ≈ 0 → Log transformation")
elif abs(optimal_lambda - 0.5) < 0.1:
    print(f"λ ≈ 0.5 → Square root transformation")
elif abs(optimal_lambda - 1) < 0.1:
    print(f"λ ≈ 1 → No transformation needed")
else:
    print(f"λ = {optimal_lambda:.2f} → Custom power transformation")

# Manual implementation for understanding
print("\n" + "="*60 + "\n")
print("Manual Box-Cox Calculation (first 5 values):")
for i in range(5):
    original = data[i]
    if abs(optimal_lambda) < 0.0001:
        transformed = np.log(original)
    else:
        transformed = (original**optimal_lambda - 1) / optimal_lambda

    print(f"x = {original:6.2f} → y = {transformed:6.2f}")
```

## Using sklearn

```python
from sklearn.preprocessing import PowerTransformer
import numpy as np
import pandas as pd

# Sample data
np.random.seed(42)
df = pd.DataFrame({
    'sales': np.random.gamma(shape=2, scale=1000, size=500),
    'visitors': np.random.exponential(scale=500, size=500),
    'revenue': np.random.lognormal(mean=10, sigma=1, size=500)
})

print("Original Data:")
print("="*60)
print(df.describe())
print("\nSkewness:")
print(df.skew())

print("\n" + "="*60 + "\n")

# Box-Cox transformation using sklearn
transformer = PowerTransformer(method='box-cox', standardize=True)
df_transformed = pd.DataFrame(
    transformer.fit_transform(df),
    columns=df.columns
)

print("After Box-Cox Transformation:")
print(df_transformed.describe())
print("\nSkewness:")
print(df_transformed.skew())

print("\n" + "="*60 + "\n")
print("Optimal λ (lambda) values:")
for i, col in enumerate(df.columns):
    print(f"{col:12s}: λ = {transformer.lambdas_[i]:.4f}")
```

## Real-World Example: Sales Forecasting

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import PowerTransformer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# Generate sales data (highly skewed)
np.random.seed(42)
n = 1000

# Features
marketing_spend = np.random.exponential(scale=5000, size=n)
seasonality = np.random.choice([1, 1.5, 2, 0.8], size=n)
competitors = np.random.randint(1, 10, size=n)

# Sales (multiplicative relationship, right-skewed)
sales = (
    1000 +
    2 * marketing_spend +
    3000 * seasonality -
    200 * competitors +
    np.random.normal(0, 500, n)
)
sales = np.exp(np.log(sales.clip(min=1)) + np.random.normal(0, 0.3, n))

df = pd.DataFrame({
    'marketing_spend': marketing_spend,
    'seasonality': seasonality,
    'competitors': competitors,
    'sales': sales
})

print("Sales Data:")
print("="*60)
print(df.describe())
print(f"\nSales Skewness: {df['sales'].skew():.2f}")

# Prepare data
X = df[['marketing_spend', 'seasonality', 'competitors']]
y = df['sales']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Model 1: No transformation
model1 = LinearRegression()
model1.fit(X_train, y_train)
y_pred1 = model1.predict(X_test)
rmse1 = np.sqrt(mean_squared_error(y_test, y_pred1))
r2_1 = r2_score(y_test, y_pred1)

# Model 2: Box-Cox transformation
transformer = PowerTransformer(method='box-cox')
y_train_bc = transformer.fit_transform(y_train.values.reshape(-1, 1)).ravel()

model2 = LinearRegression()
model2.fit(X_train, y_train_bc)
y_pred2_bc = model2.predict(X_test)
y_pred2 = transformer.inverse_transform(y_pred2_bc.reshape(-1, 1)).ravel()
rmse2 = np.sqrt(mean_squared_error(y_test, y_pred2))
r2_2 = r2_score(y_test, y_pred2)

print("\n" + "="*60 + "\n")
print("MODEL COMPARISON:")
print("="*60)
print(f"Without Box-Cox:")
print(f"  RMSE: ${rmse1:,.2f}")
print(f"  R²:   {r2_1:.4f}")
print(f"\nWith Box-Cox (λ = {transformer.lambdas_[0]:.4f}):")
print(f"  RMSE: ${rmse2:,.2f}")
print(f"  R²:   {r2_2:.4f}")
print(f"\nImprovement: {((rmse1-rmse2)/rmse1*100):.1f}% reduction in RMSE")
```

## When to Use Box-Cox

**Use Box-Cox when:**
- Data is strictly positive (x > 0)
- Want automatic optimal transformation
- Need maximum normality
- Linear regression or other parametric models
- Examples: Strictly positive continuous data

**Don't use when:**
- Data contains zeros or negatives
- Tree-based models (don't need normality)
- Interpretability is critical
- Need specific transformation (use Yeo-Johnson instead)

## Advantages and Limitations

**Advantages:**
- Automatically finds optimal λ
- Maximizes normality
- Scientific and principled approach
- Includes common transformations as special cases

**Limitations:**
- Requires all positive values
- Less interpretable than log or sqrt
- Computationally more expensive
- Need to save λ for inverse transformation

## Best Practices

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PowerTransformer
from sklearn.linear_model import LinearRegression

# Use in Pipeline for correct workflow
pipeline = Pipeline([
    ('transformer', PowerTransformer(method='box-cox')),
    ('model', LinearRegression())
])

# Fit (transformer learns optimal λ on training data)
pipeline.fit(X_train, y_train)

# Predict (automatically applies and inverts transformation)
predictions = pipeline.predict(X_test)

# Access learned parameters
optimal_lambda = pipeline.named_steps['transformer'].lambdas_
print(f"Optimal λ: {optimal_lambda}")
```

## Summary

Box-Cox is the automatic choice:
- Finds optimal power transformation
- Maximizes normality of data
- Requires strictly positive data
- Use sklearn's PowerTransformer for ease
- Always use with Pipeline

---

**Navigation:**
- **Previous:** [← Square Root](./transformations-square-root.md)
- **Next:** [Yeo-Johnson →](./transformations-yeo-johnson.md)
- **Related:** [Power Transformer](./transformations-power-custom.md)
