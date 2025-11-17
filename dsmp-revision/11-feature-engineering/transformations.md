# Feature Transformations - Complete Guide

## Table of Contents
1. [Why Transform Features?](#why-transform-features)
2. [Log Transformation](#log-transformation)
3. [Square Root Transformation](#square-root-transformation)
4. [Box-Cox Transformation](#box-cox-transformation)
5. [Yeo-Johnson Transformation](#yeo-johnson-transformation)
6. [Power Transformer](#power-transformer)
7. [Custom Transformations](#custom-transformations)
8. [Comparison and Selection](#comparison-and-selection)
9. [Common Mistakes](#common-mistakes)
10. [Interview Questions](#interview-questions)

---

## Why Transform Features?

### The Problem: Skewed Data

```
Skewed Distribution (Right-skewed example):
═══════════════════════════════════════════

Frequency
    │  █
    │  ██
    │  ███
    │  ████
    │  █████
    │  ██████
    │  ████████
    │  ███████████
    │  ████████████████
    └──────────────────────────── Value
         ↑                    ↑
        Many values        Few extreme
        at low end         values

Problems:
1. Many ML algorithms assume normal distribution
2. Outliers have disproportionate impact
3. Poor model performance
4. Difficult to interpret relationships
```

### Goals of Transformation

```
Before Transformation:          After Transformation:
═══════════════════              ═══════════════════
Skewed (0.1-1000)               Normal-like (-3 to 3)
    │  █                            │      ███
    │  ██                           │    ███████
    │  ████                         │   █████████
    │  ██████████                   │  ███████████
    └────────────                   │ █████████████
                                    └──────────────

Goals:
✓ Make distribution more normal
✓ Reduce impact of outliers
✓ Stabilize variance
✓ Improve model performance
✓ Make relationships linear
```

### When to Transform

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

# Generate right-skewed data
np.random.seed(42)
data = np.random.exponential(scale=2, size=1000)

df = pd.DataFrame({'original': data})

print("Original Data Statistics:")
print("="*60)
print(f"Mean:     {df['original'].mean():.2f}")
print(f"Median:   {df['original'].median():.2f}")
print(f"Skewness: {df['original'].skew():.2f}")
print(f"Kurtosis: {df['original'].kurtosis():.2f}")

print("\n" + "="*60 + "\n")
print("Interpretation:")
if df['original'].skew() > 1:
    print("✗ Highly skewed (> 1) → Transformation recommended")
elif df['original'].skew() > 0.5:
    print("⚠ Moderately skewed (0.5-1) → Consider transformation")
else:
    print("✓ Low skew (< 0.5) → Transformation not needed")

print("\n" + "="*60 + "\n")
print("Rule of Thumb:")
print("Skewness < 0.5:    Approximately symmetric → No transformation")
print("Skewness 0.5-1:    Moderately skewed → Consider transformation")
print("Skewness > 1:      Highly skewed → Transformation recommended")
```

---

## Log Transformation

### Concept

Natural logarithm transformation: `y = log(x + 1)` or `y = log(x)`

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

### Implementation

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

### Real-World Example: House Prices

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

### Variations

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

### When to Use

✅ **Use Log Transformation when:**
- Data is right-skewed (long tail on right)
- Exponential growth patterns
- Data spans several orders of magnitude
- Multiplicative relationships
- Examples: Income, population, web traffic, prices

❌ **Don't use when:**
- Data contains zeros or negatives (without adjustment)
- Data is already normally distributed
- Left-skewed data
- Interpretability is critical (log scale less intuitive)

---

## Square Root Transformation

### Concept

Square root transformation: `y = √x`

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

### Implementation

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

### Real-World Example: Event Counts

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

### When to Use

✅ **Use Square Root when:**
- Moderately skewed data (0.5 < skewness < 1)
- Count data (Poisson distributed)
- Data contains zeros
- Need less aggressive transformation than log
- Examples: Website visits, transaction counts, event frequencies

❌ **Don't use when:**
- Highly skewed data (use log instead)
- Data contains negative values (without adjustment)
- Left-skewed data

---

## Box-Cox Transformation

### Concept

Power transformation that finds optimal λ (lambda) parameter.

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

### Implementation

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

### Using sklearn

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

### Real-World Example: Sales Forecasting

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
seasonality = np.random.choice([1, 1.5, 2, 0.8], size=n)  # Seasonal factors
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

### When to Use

✅ **Use Box-Cox when:**
- Data is strictly positive (x > 0)
- Want automatic optimal transformation
- Need maximum normality
- Linear regression or other parametric models
- Examples: Strictly positive continuous data

❌ **Don't use when:**
- Data contains zeros or negatives
- Tree-based models (don't need normality)
- Interpretability is critical
- Need specific transformation (use Yeo-Johnson instead)

---

## Yeo-Johnson Transformation

### Concept

Like Box-Cox but handles zeros and negative values.

```
Formula (more complex than Box-Cox):
────────────────────────────────────

For x ≥ 0:
         ⎧ ((x+1)^λ - 1) / λ    if λ ≠ 0
y(λ) =   ⎨
         ⎩ log(x+1)             if λ = 0

For x < 0:
         ⎧ -((-x+1)^(2-λ) - 1) / (2-λ)    if λ ≠ 2
y(λ) =   ⎨
         ⎩ -log(-x+1)                      if λ = 2

Advantage: Works with ANY data (positive, zero, negative)
```

### Implementation

```python
from sklearn.preprocessing import PowerTransformer
import numpy as np
import pandas as pd

# Data with zeros and negatives
np.random.seed(42)
df = pd.DataFrame({
    'profit': np.random.normal(1000, 5000, 500),  # Can be negative
    'temperature': np.random.normal(0, 20, 500),  # Can be negative
    'balance': np.random.normal(5000, 10000, 500)  # Can be negative
})

print("Original Data (with negatives and zeros):")
print("="*60)
print(df.describe())
print("\nSkewness:")
print(df.skew())

print("\n" + "="*60 + "\n")

# Yeo-Johnson transformation
transformer = PowerTransformer(method='yeo-johnson', standardize=True)
df_transformed = pd.DataFrame(
    transformer.fit_transform(df),
    columns=df.columns
)

print("After Yeo-Johnson Transformation:")
print(df_transformed.describe())
print("\nSkewness:")
print(df_transformed.skew())

print("\n" + "="*60 + "\n")
print("Optimal λ (lambda) values:")
for i, col in enumerate(df.columns):
    print(f"{col:15s}: λ = {transformer.lambdas_[i]:.4f}")

# Try Box-Cox (will fail with negative values)
print("\n" + "="*60 + "\n")
print("Attempting Box-Cox on negative data...")
try:
    transformer_bc = PowerTransformer(method='box-cox')
    transformer_bc.fit_transform(df)
    print("Success!")
except ValueError as e:
    print(f"Error: {e}")
    print("→ This is why we use Yeo-Johnson for data with negatives!")
```

### Comparison: Box-Cox vs Yeo-Johnson

```python
import numpy as np
import pandas as pd
from sklearn.preprocessing import PowerTransformer
from scipy import stats

# Create two datasets
np.random.seed(42)

# Dataset 1: Strictly positive (can use both)
positive_data = np.random.gamma(shape=2, scale=2, size=500)

# Dataset 2: With zeros and negatives (only Yeo-Johnson)
mixed_data = np.random.normal(loc=10, scale=15, size=500)

print("COMPARISON: Box-Cox vs Yeo-Johnson")
print("="*60)

# Positive data
print("\n1. STRICTLY POSITIVE DATA:")
print(f"   Range: [{positive_data.min():.2f}, {positive_data.max():.2f}]")
print(f"   Original Skewness: {stats.skew(positive_data):.2f}")

# Box-Cox
bc_transformer = PowerTransformer(method='box-cox')
bc_result = bc_transformer.fit_transform(positive_data.reshape(-1, 1))
print(f"\n   Box-Cox:")
print(f"   - λ = {bc_transformer.lambdas_[0]:.4f}")
print(f"   - Skewness: {stats.skew(bc_result):.2f}")

# Yeo-Johnson
yj_transformer = PowerTransformer(method='yeo-johnson')
yj_result = yj_transformer.fit_transform(positive_data.reshape(-1, 1))
print(f"\n   Yeo-Johnson:")
print(f"   - λ = {yj_transformer.lambdas_[0]:.4f}")
print(f"   - Skewness: {stats.skew(yj_result):.2f}")

print("\n   → Both methods work well on positive data")

# Mixed data
print("\n" + "="*60)
print("\n2. DATA WITH NEGATIVES:")
print(f"   Range: [{mixed_data.min():.2f}, {mixed_data.max():.2f}]")
print(f"   Contains negatives: {(mixed_data < 0).sum()} values")
print(f"   Original Skewness: {stats.skew(mixed_data):.2f}")

# Box-Cox (will fail)
try:
    bc_result = bc_transformer.fit_transform(mixed_data.reshape(-1, 1))
    print("\n   Box-Cox: Success")
except ValueError:
    print("\n   Box-Cox: ✗ FAILED (requires all positive values)")

# Yeo-Johnson (will work)
yj_result = yj_transformer.fit_transform(mixed_data.reshape(-1, 1))
print(f"\n   Yeo-Johnson: ✓ SUCCESS")
print(f"   - λ = {yj_transformer.lambdas_[0]:.4f}")
print(f"   - Skewness: {stats.skew(yj_result):.2f}")

print("\n   → Only Yeo-Johnson works with negative values")
```

### Real-World Example: Financial Returns

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import PowerTransformer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# Stock returns data (can be positive or negative)
np.random.seed(42)
n = 1000

# Features: various financial indicators (can be negative)
daily_return = np.random.normal(0, 2, n)  # Can be negative
volume_change = np.random.normal(0, 10, n)  # Can be negative
sentiment_score = np.random.normal(0, 1, n)  # Can be negative

# Target: next day direction (up/down)
next_day_up = (daily_return + np.random.normal(0, 1, n) > 0).astype(int)

df = pd.DataFrame({
    'daily_return': daily_return,
    'volume_change': volume_change,
    'sentiment_score': sentiment_score,
    'next_day_up': next_day_up
})

print("Financial Data:")
print("="*60)
print(df.describe())
print("\nSkewness:")
print(df.drop('next_day_up', axis=1).skew())

# Prepare data
X = df.drop('next_day_up', axis=1)
y = df['next_day_up']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Model 1: Without transformation
model1 = RandomForestClassifier(n_estimators=100, random_state=42)
model1.fit(X_train, y_train)
acc1 = accuracy_score(y_test, model1.predict(X_test))

# Model 2: With Yeo-Johnson transformation
transformer = PowerTransformer(method='yeo-johnson')
X_train_transformed = transformer.fit_transform(X_train)
X_test_transformed = transformer.transform(X_test)

model2 = RandomForestClassifier(n_estimators=100, random_state=42)
model2.fit(X_train_transformed, y_train)
acc2 = accuracy_score(y_test, model2.predict(X_test_transformed))

print("\n" + "="*60 + "\n")
print("MODEL COMPARISON:")
print("="*60)
print(f"Without Transformation: {acc1:.2%}")
print(f"With Yeo-Johnson:       {acc2:.2%}")
print(f"Improvement:            {(acc2-acc1):.2%}")

print("\n" + "="*60 + "\n")
print("Transformed Skewness:")
X_train_transformed_df = pd.DataFrame(X_train_transformed, columns=X.columns)
print(X_train_transformed_df.skew())
```

### When to Use

✅ **Use Yeo-Johnson when:**
- Data contains zeros or negative values
- Want automatic optimal transformation
- Need to handle any type of data
- Alternative to Box-Cox when data has negatives
- Examples: Financial returns, temperature data, profit/loss

❌ **Don't use when:**
- All data is strictly positive (Box-Cox is simpler)
- Using tree-based models (don't benefit from normalization)
- Need interpretable transformations

---

## Power Transformer

### sklearn PowerTransformer

Unified interface for both Box-Cox and Yeo-Johnson.

```python
from sklearn.preprocessing import PowerTransformer
import numpy as np
import pandas as pd

# Sample data
np.random.seed(42)
df = pd.DataFrame({
    'positive_skewed': np.random.exponential(scale=2, size=500),
    'negative_skewed': -np.random.exponential(scale=2, size=500) + 10,
    'with_negatives': np.random.normal(0, 5, size=500)
})

print("Original Data:")
print("="*60)
print(df.describe())
print("\nSkewness:")
print(df.skew())

print("\n" + "="*60 + "\n")

# Box-Cox (only for positive data)
print("Attempting Box-Cox on all columns...")
try:
    transformer_bc = PowerTransformer(method='box-cox', standardize=True)
    df_bc = transformer_bc.fit_transform(df)
    print("Success!")
except ValueError as e:
    print(f"Failed: {e}")

print("\n" + "="*60 + "\n")

# Yeo-Johnson (works for any data)
print("Applying Yeo-Johnson on all columns...")
transformer_yj = PowerTransformer(method='yeo-johnson', standardize=True)
df_yj = pd.DataFrame(
    transformer_yj.fit_transform(df),
    columns=df.columns
)

print("After Yeo-Johnson Transformation:")
print(df_yj.describe())
print("\nSkewness:")
print(df_yj.skew())

print("\n" + "="*60 + "\n")
print("Parameters:")
for i, col in enumerate(df.columns):
    print(f"{col:20s}: λ = {transformer_yj.lambdas_[i]:7.4f}")

# Standardize option
print("\n" + "="*60 + "\n")
print("Effect of standardize=True:")
print("- Applies transformation")
print("- Then standardizes to mean=0, std=1")
print(f"Means:  {df_yj.mean().values}")
print(f"Stds:   {df_yj.std().values}")
```

---

## Custom Transformations

### Common Custom Transformations

```python
import numpy as np
import pandas as pd

# Sample data
data = pd.DataFrame({
    'value': [1, 2, 5, 10, 20, 50, 100, 200, 500]
})

print("Original Data:")
print(data)
print("\n" + "="*60 + "\n")

# 1. Cube Root
data['cube_root'] = np.cbrt(data['value'])

# 2. Reciprocal (1/x)
data['reciprocal'] = 1 / data['value']

# 3. Exponential
data['exponential'] = np.exp(data['value'] / data['value'].max())

# 4. Sigmoid
data['sigmoid'] = 1 / (1 + np.exp(-data['value'] / 100))

# 5. Rank transformation
data['rank'] = data['value'].rank()

print("Custom Transformations:")
print(data)

print("\n" + "="*60 + "\n")
print("Use Cases:")
print("Cube Root:    Less aggressive than sqrt")
print("Reciprocal:   Inverse relationship")
print("Exponential:  Amplify large values")
print("Sigmoid:      Bound between 0 and 1")
print("Rank:         Ordinal transformation")
```

### Domain-Specific Transformations

```python
import pandas as pd
import numpy as np

# E-commerce data
df = pd.DataFrame({
    'price': [10, 50, 100, 500, 1000],
    'quantity': [100, 50, 20, 5, 2],
    'days_since_purchase': [1, 7, 30, 90, 365]
})

print("Original E-commerce Data:")
print(df)
print("\n" + "="*60 + "\n")

# 1. Price per unit (interaction)
df['price_per_unit'] = df['price'] / df['quantity']

# 2. Recency score (inverse time)
df['recency_score'] = 1 / (1 + df['days_since_purchase'])

# 3. Price tier (binning)
df['price_tier'] = pd.cut(
    df['price'],
    bins=[0, 50, 200, float('inf')],
    labels=['Low', 'Medium', 'High']
)

# 4. Log of monetary value
df['log_value'] = np.log1p(df['price'] * df['quantity'])

print("After Domain-Specific Transformations:")
print(df)

print("\n" + "="*60 + "\n")
print("Transformations Applied:")
print("1. Price per unit: price / quantity")
print("2. Recency score: 1 / (1 + days)")
print("3. Price tier: Categorization")
print("4. Log value: log(price × quantity)")
```

---

## Comparison and Selection

### Transformation Comparison Table

```python
import pandas as pd

comparison = pd.DataFrame({
    'Transformation': ['Log', 'Square Root', 'Box-Cox', 'Yeo-Johnson', 'Custom'],
    'Formula': [
        'log(x) or log(x+1)',
        '√x',
        '(x^λ - 1) / λ',
        'Complex (see above)',
        'User-defined'
    ],
    'Data Requirements': [
        'x > 0 (or x ≥ 0 with +1)',
        'x ≥ 0',
        'x > 0',
        'Any x',
        'Depends'
    ],
    'Aggressiveness': [
        'High',
        'Moderate',
        'Automatic',
        'Automatic',
        'Varies'
    ],
    'Interpretability': [
        'Medium',
        'High',
        'Low',
        'Low',
        'Varies'
    ],
    'Best For': [
        'Exponential growth',
        'Count data',
        'Positive continuous',
        'Any continuous',
        'Domain-specific'
    ]
})

print("="*100)
print("TRANSFORMATION COMPARISON")
print("="*100)
print(comparison.to_string(index=False))
```

### Decision Framework

```
TRANSFORMATION SELECTION
═══════════════════════════

Step 1: Check data characteristics
│
├─ Contains negatives or zeros?
│  ├─ YES → Yeo-Johnson or Custom
│  └─ NO  → Continue to Step 2
│
Step 2: Check skewness
│
├─ Skewness > 1 (highly skewed)
│  └─ → Log transformation
│
├─ Skewness 0.5-1 (moderately skewed)
│  └─ → Square root or Box-Cox
│
└─ Skewness < 0.5 (approximately normal)
   └─ → No transformation needed

Step 3: Check if automatic is preferred
│
├─ Want automatic optimal transformation?
│  ├─ Data all positive → Box-Cox
│  └─ Data has negatives → Yeo-Johnson
│
└─ Want specific transformation?
   └─ Choose Log, Sqrt, or Custom

Step 4: Validate
│
└─ Check if skewness improved
   └─ If not, try different transformation
```

### Performance Comparison

```python
import numpy as np
import pandas as pd
from scipy import stats
from sklearn.preprocessing import PowerTransformer

# Generate highly skewed data
np.random.seed(42)
data = np.random.exponential(scale=2, size=1000)

# Original statistics
original_skew = stats.skew(data)

results = {
    'Original': {
        'skewness': original_skew,
        'data': data
    }
}

# Log transformation
log_data = np.log1p(data)
results['Log'] = {
    'skewness': stats.skew(log_data),
    'data': log_data
}

# Square root
sqrt_data = np.sqrt(data)
results['Square Root'] = {
    'skewness': stats.skew(sqrt_data),
    'data': sqrt_data
}

# Box-Cox
bc_transformer = PowerTransformer(method='box-cox')
bc_data = bc_transformer.fit_transform(data.reshape(-1, 1)).ravel()
results['Box-Cox'] = {
    'skewness': stats.skew(bc_data),
    'lambda': bc_transformer.lambdas_[0],
    'data': bc_data
}

# Yeo-Johnson
yj_transformer = PowerTransformer(method='yeo-johnson')
yj_data = yj_transformer.fit_transform(data.reshape(-1, 1)).ravel()
results['Yeo-Johnson'] = {
    'skewness': stats.skew(yj_data),
    'lambda': yj_transformer.lambdas_[0],
    'data': yj_data
}

print("TRANSFORMATION COMPARISON")
print("="*60)
print(f"Original Skewness: {original_skew:.4f}")
print("\n" + "="*60 + "\n")

for name, result in results.items():
    if name == 'Original':
        continue

    skew = result['skewness']
    improvement = ((abs(original_skew) - abs(skew)) / abs(original_skew)) * 100

    print(f"{name:15s}:")
    print(f"  Skewness:    {skew:7.4f}")
    print(f"  Improvement: {improvement:6.1f}%")

    if 'lambda' in result:
        print(f"  λ (lambda):  {result['lambda']:7.4f}")

    print()

# Find best
best_transform = min(
    [(name, abs(result['skewness'])) for name, result in results.items() if name != 'Original'],
    key=lambda x: x[1]
)

print("="*60)
print(f"Best Transformation: {best_transform[0]}")
print(f"Final Skewness: {best_transform[1]:.4f}")
```

---

## Common Mistakes

### ❌ Mistake 1: Transforming Already Normal Data

```python
import numpy as np
from scipy import stats

# Already normal data
normal_data = np.random.normal(50, 10, 1000)

print(f"Original Skewness: {stats.skew(normal_data):.2f}")
print("→ Close to 0, approximately normal")
print("\nDon't transform! It's already good.")

# Transforming anyway (wrong!)
log_data = np.log(normal_data)  # Will fail or distort
print("\nTransforming normal data can make it worse!")
```

### ❌ Mistake 2: Not Inverse Transforming Predictions

```python
import numpy as np
from sklearn.linear_model import LinearRegression

# Train with log-transformed target
y_train_log = np.log1p(y_train)

model = LinearRegression()
model.fit(X_train, y_train_log)

# WRONG: Predict without inverse transform
predictions_log = model.predict(X_test)
# These are in log scale, not original scale!

# CORRECT: Inverse transform
predictions = np.expm1(predictions_log)  # exp(x) - 1
# Now in original scale
```

### ❌ Mistake 3: Using Log on Zero/Negative Values

```python
import numpy as np

data = [0, 1, 10, 100]

# WRONG
try:
    np.log(data)  # Error! log(0) undefined
except:
    print("Error: Can't take log of 0")

# CORRECT
np.log1p(data)  # log(1 + x), handles zeros
```

### ❌ Mistake 4: Not Checking Transformation Effect

```python
# WRONG: Apply transformation blindly
transformed = np.log1p(data)

# CORRECT: Check if it helped
from scipy import stats

print(f"Original Skewness: {stats.skew(data):.2f}")
print(f"Transformed Skewness: {stats.skew(transformed):.2f}")

if abs(stats.skew(transformed)) < abs(stats.skew(data)):
    print("✓ Transformation improved distribution")
else:
    print("✗ Transformation didn't help, try another")
```

### ❌ Mistake 5: Transforming Before Train-Test Split

```python
# WRONG
data_transformed = np.log1p(data)
train, test = split(data_transformed)

# CORRECT (for Box-Cox/Yeo-Johnson)
train, test = split(data)

transformer = PowerTransformer()
train_transformed = transformer.fit_transform(train)
test_transformed = transformer.transform(test)  # Use train params
```

---

## Best Practices

### ✅ Practice 1: Always Visualize

```python
import matplotlib.pyplot as plt
import numpy as np
from scipy import stats

# Before and after transformation
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

data = np.random.exponential(scale=2, size=1000)
transformed = np.log1p(data)

# Original histogram
axes[0, 0].hist(data, bins=50, edgecolor='black')
axes[0, 0].set_title(f'Original (Skew: {stats.skew(data):.2f})')

# Transformed histogram
axes[0, 1].hist(transformed, bins=50, edgecolor='black')
axes[0, 1].set_title(f'Transformed (Skew: {stats.skew(transformed):.2f})')

# Original Q-Q plot
stats.probplot(data, dist="norm", plot=axes[1, 0])
axes[1, 0].set_title('Original Q-Q Plot')

# Transformed Q-Q plot
stats.probplot(transformed, dist="norm", plot=axes[1, 1])
axes[1, 1].set_title('Transformed Q-Q Plot')

plt.tight_layout()
```

### ✅ Practice 2: Use Pipelines

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PowerTransformer
from sklearn.linear_model import LinearRegression

# Pipeline ensures correct order
pipeline = Pipeline([
    ('transform', PowerTransformer(method='yeo-johnson')),
    ('model', LinearRegression())
])

pipeline.fit(X_train, y_train)
predictions = pipeline.predict(X_test)
```

### ✅ Practice 3: Document Transformations

```python
transformation_log = {
    'sales': {
        'method': 'log',
        'reason': 'Highly right-skewed (skew=2.1)',
        'before_skew': 2.1,
        'after_skew': 0.3,
        'inverse': 'np.expm1()'
    },
    'count': {
        'method': 'sqrt',
        'reason': 'Count data, moderate skew',
        'before_skew': 0.8,
        'after_skew': 0.2,
        'inverse': 'x**2'
    }
}
```

---

## Interview Questions

### Q1: When would you use log transformation?

**Answer:**

Use log transformation when:

1. **Data is right-skewed** (long tail on right)
2. **Exponential relationships** exist
3. **Data spans orders of magnitude** (1 to 1000000)
4. **Multiplicative effects** are present

**Example:**
```python
Income: [30K, 40K, 50K, ..., 1M, 5M]
Skewed! Log makes it more normal.

log(30K) ≈ 10.3
log(1M)  ≈ 13.8

Range compressed from 5000K to ~3.5
```

**Benefits:**
- Makes distribution more normal
- Reduces impact of outliers
- Converts multiplicative to additive relationships
- Improves model performance

**Don't use when:**
- Data has zeros (use log1p instead)
- Data has negatives (use Yeo-Johnson)
- Data is already normal
- Interpretability is critical

### Q2: What's the difference between Box-Cox and Yeo-Johnson?

**Answer:**

**Box-Cox:**
- Formula: `(x^λ - 1) / λ` if λ ≠ 0, else `log(x)`
- Requires: **x > 0** (strictly positive)
- Finds optimal λ for maximum normality
- Simpler, well-established

**Yeo-Johnson:**
- Similar to Box-Cox but more complex formula
- Works with: **any data** (positive, zero, negative)
- Also finds optimal λ
- More flexible

**Comparison:**
```python
Data: [1, 2, 5, 10, 100]
Both work! Results similar.

Data: [0, 1, 2, 5, 10]
Box-Cox: FAILS (has zero)
Yeo-Johnson: WORKS

Data: [-5, -1, 0, 1, 5]
Box-Cox: FAILS (has negatives)
Yeo-Johnson: WORKS
```

**When to use:**
- All positive data → Box-Cox (simpler)
- Has zeros/negatives → Yeo-Johnson (required)

### Q3: How do you choose between log and square root transformation?

**Answer:**

**Decision based on skewness:**

```
High Skewness (> 1):
→ Log transformation (more aggressive)

Moderate Skewness (0.5-1):
→ Square root transformation

Low Skewness (< 0.5):
→ No transformation needed
```

**Example:**
```python
# Highly skewed (exponential growth)
income = [20K, 30K, 50K, 100K, 500K, 2M]
skewness = 2.5 → Use LOG

# Moderately skewed (count data)
page_views = [10, 15, 20, 25, 50, 100]
skewness = 0.8 → Use SQRT

# Already normal
height = [160, 165, 170, 175, 180]
skewness = 0.1 → NO TRANSFORM
```

**Properties:**
- Log is more aggressive (compresses more)
- Sqrt is gentler
- Log: multiplicative → additive
- Sqrt: works well with count data (Poisson)

### Q4: What are common mistakes in feature transformation?

**Answer:**

**1. Not inverse transforming predictions:**
```python
# WRONG
y_train_log = np.log(y_train)
model.fit(X_train, y_train_log)
predictions = model.predict(X_test)  # Still in log scale!

# CORRECT
predictions_log = model.predict(X_test)
predictions = np.exp(predictions_log)  # Inverse transform
```

**2. Transforming before train-test split:**
```python
# WRONG (data leakage for Box-Cox/Yeo-Johnson)
data_transformed = transformer.fit_transform(data)
train, test = split(data_transformed)

# CORRECT
train, test = split(data)
train_transformed = transformer.fit_transform(train)
test_transformed = transformer.transform(test)
```

**3. Using log on zeros:**
```python
# WRONG
np.log([0, 1, 10])  # Error!

# CORRECT
np.log1p([0, 1, 10])  # log(1+x), handles zeros
```

**4. Transforming normal data:**
```python
# Check skewness first!
if abs(skewness) < 0.5:
    print("Don't transform, already normal!")
```

**5. Not checking if transformation helped:**
```python
# Always compare before/after
print(f"Before: {skew_before}")
print(f"After: {skew_after}")
if abs(skew_after) >= abs(skew_before):
    print("Transformation didn't help!")
```

### Q5: How do transformations affect model interpretation?

**Answer:**

**1. Log transformation:**
```python
Original model: y = β₀ + β₁x
Interpretation: 1 unit increase in x → β₁ increase in y

Log model: log(y) = β₀ + β₁x
Interpretation: 1 unit increase in x → β₁% change in y
(multiplicative effect)
```

**2. Square root:**
```python
Original: y = β₀ + β₁x
Sqrt: √y = β₀ + β₁x

Less intuitive, need to square to interpret
```

**3. Box-Cox/Yeo-Johnson:**
```python
y^λ = β₀ + β₁x

Very hard to interpret!
λ = 0.5 → somewhat like sqrt
λ = 0.0 → like log
λ = 1.0 → no transformation
```

**Trade-off:**
- Original scale: Easy to interpret
- Transformed: Better model performance but harder to interpret

**Best practice:**
- Use transformation for modeling
- Convert back to original scale for presentation
- Document the transformation clearly
- Provide examples in original scale

---

## Summary

### Quick Reference

```
Log:           y = log(x + 1)
               - Highly skewed data
               - x ≥ 0

Sqrt:          y = √x
               - Moderately skewed
               - x ≥ 0
               - Count data

Box-Cox:       y = (x^λ - 1) / λ
               - Automatic optimal
               - x > 0 required

Yeo-Johnson:   Complex formula
               - Like Box-Cox
               - Works with any x

Inverse Transforms:
- Log:  np.expm1(y)
- Sqrt: y**2
- Box-Cox/YJ: transformer.inverse_transform(y)
```

### Decision Matrix

```
Data Characteristics → Transformation
════════════════════════════════════

Strictly positive + highly skewed  → Log
Strictly positive + moderate skew  → Sqrt
Strictly positive + unknown skew   → Box-Cox
Has zeros/negatives + skewed       → Yeo-Johnson
Count data                         → Sqrt or Log
Already normal                     → None
```

---

**Next:** [Feature Construction →](./feature-construction.md)

**Previous:** [← Scaling and Outliers](./scaling-outliers.md)
