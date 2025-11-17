# Square Root Transformation

## Introduction

When log transformation is too aggressive, square root transformation offers a gentler approach. You'll learn why it's perfect for count data, how it differs from log transformation, and when to choose it for your features.

## The Concept

Square root transformation provides moderate compression of large values.

```
Formula:
────────
y = √x            # For x ≥ 0
y = √(x + c)      # If x can be negative

Effect:
───────
Less aggressive than log transformation

x = 0      → √0 = 0
x = 1      → √1 = 1
x = 4      → √4 = 2
x = 100    → √100 = 10
x = 10000  → √10000 = 100

Visual Comparison:
──────────────────
Original:  [1,   4,    100,   10000]
Log:       [0,   1.4,  4.6,   9.2]    (strong compression)
Sqrt:      [1,   2,    10,    100]    (moderate compression)
```

## Basic Implementation

```python
import numpy as np
import pandas as pd

# Moderately skewed data (counts/frequencies)
np.random.seed(42)
counts = np.random.poisson(lam=10, size=1000)

df = pd.DataFrame({'count': counts})

print("Original Count Data:")
print("="*60)
print(df['count'].describe())
print(f"Skewness: {df['count'].skew():.2f}")

print("\n" + "="*60 + "\n")

# Apply square root transformation
df['count_sqrt'] = np.sqrt(df['count'])

print("After Square Root Transformation:")
print(df['count_sqrt'].describe())
print(f"Skewness: {df['count_sqrt'].skew():.2f}")

# Compare with log
df['count_log'] = np.log1p(df['count'])

print("\n" + "="*60 + "\n")
print("Skewness Comparison:")
print(f"Original:  {df['count'].skew():.2f}")
print(f"Sqrt:      {df['count_sqrt'].skew():.2f}")
print(f"Log:       {df['count_log'].skew():.2f}")

print("\n" + "="*60 + "\n")
print("Sample Transformations:")
samples = [0, 1, 4, 9, 16, 25, 100]
for val in samples:
    sqrt_val = np.sqrt(val)
    log_val = np.log1p(val)
    print(f"{val:4d} → sqrt: {sqrt_val:6.2f}, log: {log_val:6.2f}")
```

## Real-World Example: Website Analytics

Count data like page views benefit from square root transformation.

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

# Website analytics data
np.random.seed(42)
n = 1000

# Features
page_views = np.random.poisson(lam=50, n)
session_duration = np.random.exponential(scale=300, size=n)
bounce_rate = np.random.beta(2, 5, n)

# Target: conversions (count data, moderately skewed)
conversions = (
    0.05 * page_views +
    0.002 * session_duration -
    10 * bounce_rate +
    np.random.normal(0, 2, n)
).clip(min=0)

df = pd.DataFrame({
    'page_views': page_views,
    'session_duration': session_duration,
    'bounce_rate': bounce_rate,
    'conversions': conversions
})

print("Website Analytics Data:")
print("="*60)
print(df.describe())
print(f"\nConversions Skewness: {df['conversions'].skew():.2f}")

# Prepare data
X = df[['page_views', 'session_duration', 'bounce_rate']]
y = df['conversions']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Compare transformations
results = {}

# No transformation
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
results['No Transform'] = {
    'RMSE': np.sqrt(mean_squared_error(y_test, y_pred)),
    'R2': r2_score(y_test, y_pred)
}

# Square root transformation
y_train_sqrt = np.sqrt(y_train)
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train_sqrt)
y_pred_sqrt = model.predict(X_test)
y_pred = y_pred_sqrt ** 2  # Inverse transform
results['Sqrt Transform'] = {
    'RMSE': np.sqrt(mean_squared_error(y_test, y_pred)),
    'R2': r2_score(y_test, y_pred)
}

# Log transformation
y_train_log = np.log1p(y_train)
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train_log)
y_pred_log = model.predict(X_test)
y_pred = np.expm1(y_pred_log)  # Inverse transform
results['Log Transform'] = {
    'RMSE': np.sqrt(mean_squared_error(y_test, y_pred)),
    'R2': r2_score(y_test, y_pred)
}

print("\n" + "="*60 + "\n")
print("TRANSFORMATION COMPARISON:")
print("="*60)
results_df = pd.DataFrame(results).T
print(results_df)

print("\n" + "="*60 + "\n")
print("Best method:", results_df['R2'].idxmax())
```

## When to Use Square Root

**Use square root when:**
- Moderately skewed data (0.5 < skewness < 1)
- Count data (Poisson distributed)
- Data contains zeros
- Need less aggressive transformation than log
- Examples: Website visits, transaction counts, event frequencies

**Don't use when:**
- Highly skewed data (use log instead)
- Data contains negative values (without adjustment)
- Left-skewed data

## Comparison with Log

```python
import numpy as np
import pandas as pd

# Show difference in compression
values = np.array([1, 10, 100, 1000, 10000])

comparison = pd.DataFrame({
    'Original': values,
    'Sqrt': np.sqrt(values),
    'Log': np.log(values),
    'Sqrt Compression': values / np.sqrt(values),
    'Log Compression': values / np.log(values)
})

print("Compression Comparison:")
print(comparison)

print("\n" + "="*60 + "\n")
print("Key Insight:")
print("- Sqrt: Gentler compression, better for moderate skew")
print("- Log: Aggressive compression, better for high skew")
```

## Best Practices

```python
# Check if sqrt is enough
from scipy import stats

original_skew = stats.skew(data)
sqrt_skew = stats.skew(np.sqrt(data))
log_skew = stats.skew(np.log1p(data))

print(f"Original: {original_skew:.2f}")
print(f"Sqrt:     {sqrt_skew:.2f}")
print(f"Log:      {log_skew:.2f}")

# Choose based on result
if abs(sqrt_skew) < 0.5:
    print("\n→ Use sqrt (sufficient)")
elif abs(log_skew) < 0.5:
    print("\n→ Use log (needed for normality)")
else:
    print("\n→ Consider Box-Cox or other methods")

# Remember inverse transformation
y_pred_sqrt = model.predict(X)
y_pred = y_pred_sqrt ** 2  # Square to reverse
```

## Summary

Square root transformation offers balance:
- Moderate compression of large values
- Perfect for count data
- Handles zeros naturally
- Less aggressive than log
- Easy to interpret and invert

---

**Navigation:**
- **Previous:** [← Log Transform](./transformations-log.md)
- **Next:** [Box-Cox →](./transformations-box-cox.md)
- **Related:** [Comparison Guide](./transformations-comparison-guide.md)
