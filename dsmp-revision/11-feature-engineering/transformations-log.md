# Log Transformation

## Introduction

Log transformation is the most powerful tool for handling right-skewed data. You'll learn why it compresses extreme values, how to handle zeros and negatives, and see dramatic improvements in model performance through practical examples.

## The Concept

Natural logarithm transformation compresses large values more than small values.

```
Formula:
────────
y = log(x)        # If x > 0
y = log(x + 1)    # If x ≥ 0 (handles zeros)
y = log(x + c)    # If x can be negative

Effect on Different Values:
───────────────────────────
x = 1      → log(1) = 0
x = 10     → log(10) = 2.30
x = 100    → log(100) = 4.61
x = 1000   → log(1000) = 6.91

Notice: Large values compressed more!

Visual:
───────
Before: [1,  10,  100,  1000]  (range: 999)
After:  [0, 2.3,  4.6,   6.9]  (range: 6.9)
```

## Basic Implementation

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Right-skewed data (income example)
np.random.seed(42)
income = np.random.exponential(scale=50000, size=1000)

df = pd.DataFrame({'income': income})

print("Original Income Data:")
print("="*60)
print(df['income'].describe())
print(f"Skewness: {df['income'].skew():.2f}")

print("\n" + "="*60 + "\n")

# Apply log transformation
df['income_log'] = np.log1p(df['income'])  # log(1 + x)

print("After Log Transformation:")
print(df['income_log'].describe())
print(f"Skewness: {df['income_log'].skew():.2f}")

print("\n" + "="*60 + "\n")
print("Comparison:")
comparison = pd.DataFrame({
    'Metric': ['Mean', 'Median', 'Std Dev', 'Min', 'Max', 'Skewness'],
    'Original': [
        df['income'].mean(),
        df['income'].median(),
        df['income'].std(),
        df['income'].min(),
        df['income'].max(),
        df['income'].skew()
    ],
    'Log Transformed': [
        df['income_log'].mean(),
        df['income_log'].median(),
        df['income_log'].std(),
        df['income_log'].min(),
        df['income_log'].max(),
        df['income_log'].skew()
    ]
})
print(comparison.to_string(index=False))

# Show transformation for sample values
print("\n" + "="*60 + "\n")
print("Sample Transformations:")
samples = df['income'].quantile([0.25, 0.50, 0.75, 0.95])
for q, val in samples.items():
    transformed = np.log1p(val)
    print(f"{q*100:5.0f}th percentile: ${val:10,.2f} → {transformed:6.2f}")
```

## Real-World Example: House Prices

See dramatic improvement in linear regression with log transformation.

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# Generate synthetic house price data (right-skewed)
np.random.seed(42)
n = 1000

# Features
area = np.random.normal(1500, 500, n)
bedrooms = np.random.randint(1, 6, n)
age = np.random.uniform(0, 50, n)

# Price is exponentially related to features (realistic!)
price = np.exp(
    10 +
    0.0005 * area +
    0.1 * bedrooms -
    0.01 * age +
    np.random.normal(0, 0.3, n)
)

df = pd.DataFrame({
    'area': area,
    'bedrooms': bedrooms,
    'age': age,
    'price': price
})

print("House Price Data:")
print("="*60)
print(df.describe())
print(f"\nPrice Skewness: {df['price'].skew():.2f}")

# Prepare data
X = df[['area', 'bedrooms', 'age']]
y = df['price']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Model 1: Without transformation
model1 = LinearRegression()
model1.fit(X_train, y_train)
y_pred1 = model1.predict(X_test)
rmse1 = np.sqrt(mean_squared_error(y_test, y_pred1))
r2_1 = r2_score(y_test, y_pred1)

# Model 2: With log transformation
y_train_log = np.log(y_train)
y_test_log = np.log(y_test)

model2 = LinearRegression()
model2.fit(X_train, y_train_log)
y_pred2_log = model2.predict(X_test)
y_pred2 = np.exp(y_pred2_log)  # Inverse transform
rmse2 = np.sqrt(mean_squared_error(y_test, y_pred2))
r2_2 = r2_score(y_test, y_pred2)

print("\n" + "="*60 + "\n")
print("MODEL COMPARISON:")
print("="*60)
print(f"Without Log Transform:")
print(f"  RMSE: ${rmse1:,.2f}")
print(f"  R²:   {r2_1:.4f}")
print(f"\nWith Log Transform:")
print(f"  RMSE: ${rmse2:,.2f}")
print(f"  R²:   {r2_2:.4f}")
print(f"\nImprovement:")
print(f"  RMSE: {((rmse1-rmse2)/rmse1*100):.1f}% better")
print(f"  R²:   {((r2_2-r2_1)):.4f} increase")
```

## Handling Different Data Types

Learn which log variant to use for your data.

```python
import numpy as np
import pandas as pd

# Sample data with different characteristics
df = pd.DataFrame({
    'positive_only': [1, 10, 100, 1000, 10000],
    'with_zeros': [0, 10, 100, 1000, 10000],
    'with_negatives': [-10, 0, 10, 100, 1000]
})

print("Original Data:")
print(df)
print("\n" + "="*60 + "\n")

# 1. Natural log (only for positive values)
try:
    df['log_natural'] = np.log(df['positive_only'])
    print("Natural Log (np.log):")
    print(df[['positive_only', 'log_natural']])
except:
    print("Error: Can't use np.log with zeros/negatives")

print("\n" + "="*60 + "\n")

# 2. Log with 1 added (handles zeros)
df['log1p'] = np.log1p(df['with_zeros'])
print("Log(1+x) - np.log1p (handles zeros):")
print(df[['with_zeros', 'log1p']])

print("\n" + "="*60 + "\n")

# 3. Log with constant (handles negatives)
constant = abs(df['with_negatives'].min()) + 1
df['log_constant'] = np.log(df['with_negatives'] + constant)
print(f"Log(x + {constant}) - handles negatives:")
print(df[['with_negatives', 'log_constant']])

print("\n" + "="*60 + "\n")
print("Summary:")
print("np.log(x):          For x > 0 only")
print("np.log1p(x):        For x ≥ 0 (handles zeros)")
print("np.log(x + c):      For any x (choose c appropriately)")
```

## When to Use Log Transformation

**Use log transformation when:**
- Data is right-skewed (long tail on right)
- Exponential growth patterns
- Data spans several orders of magnitude
- Multiplicative relationships
- Examples: Income, population, web traffic, prices

**Don't use when:**
- Data contains zeros or negatives (without adjustment)
- Data is already normally distributed
- Left-skewed data
- Interpretability is critical (log scale less intuitive)

## Best Practices

```python
# Always check skewness before and after
from scipy import stats

original_skew = stats.skew(data)
transformed_skew = stats.skew(np.log1p(data))

print(f"Original skewness: {original_skew:.2f}")
print(f"Transformed skewness: {transformed_skew:.2f}")

if abs(transformed_skew) < abs(original_skew):
    print("✓ Transformation improved distribution")
else:
    print("✗ Transformation didn't help")

# Remember to inverse transform predictions
y_pred_log = model.predict(X_test)
y_pred = np.expm1(y_pred_log)  # Inverse of log1p
```

## Summary

Log transformation is your go-to for right-skewed data:
- Compresses large values
- Makes distribution more normal
- Improves model performance
- Use `log1p` for data with zeros
- Remember inverse transformation for predictions

---

**Navigation:**
- **Previous:** [← Why Transform](./transformations-why-needed.md)
- **Next:** [Square Root →](./transformations-square-root.md)
- **Related:** [Box-Cox](./transformations-box-cox.md)
