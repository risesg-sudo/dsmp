# Yeo-Johnson Transformation

## Introduction

Box-Cox has one major limitation—it can't handle zeros or negative values. Yeo-Johnson solves this problem. You'll learn how it extends Box-Cox to work with any data, understand when it's essential, and see it in action with real-world financial data.

## The Concept

Like Box-Cox but works with zeros and negative values.

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

## Basic Implementation

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

## Comparison: Box-Cox vs Yeo-Johnson

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

## Real-World Example: Financial Returns

Financial data often has negative values—perfect for Yeo-Johnson.

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import PowerTransformer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

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

## When to Use Yeo-Johnson

**Use Yeo-Johnson when:**
- Data contains zeros or negative values
- Want automatic optimal transformation
- Need to handle any type of data
- Alternative to Box-Cox when data has negatives
- Examples: Financial returns, temperature data, profit/loss

**Don't use when:**
- All data is strictly positive (Box-Cox is simpler)
- Using tree-based models (don't benefit from normalization)
- Need interpretable transformations

## Key Differences Summary

```python
import pandas as pd

comparison = pd.DataFrame({
    'Aspect': ['Data Requirements', 'Formula', 'Complexity', 'Use Case'],
    'Box-Cox': [
        'x > 0 (strictly positive)',
        'Simpler',
        'Lower',
        'Positive continuous data'
    ],
    'Yeo-Johnson': [
        'Any x (positive, zero, negative)',
        'More complex',
        'Higher',
        'Any continuous data'
    ]
})

print("BOX-COX vs YEO-JOHNSON")
print("="*80)
print(comparison.to_string(index=False))
```

## Best Practices

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PowerTransformer
from sklearn.linear_model import LogisticRegression

# Check your data first
has_negatives = (X < 0).any().any()
has_zeros = (X == 0).any().any()

if has_negatives or has_zeros:
    method = 'yeo-johnson'
    print("Using Yeo-Johnson (data has zeros/negatives)")
else:
    method = 'box-cox'
    print("Using Box-Cox (data is strictly positive)")

# Create pipeline with chosen method
pipeline = Pipeline([
    ('transformer', PowerTransformer(method=method)),
    ('classifier', LogisticRegression())
])

pipeline.fit(X_train, y_train)
predictions = pipeline.predict(X_test)
```

## Summary

Yeo-Johnson is Box-Cox's versatile cousin:
- Handles any data (positive, zero, negative)
- More complex formula but same idea
- Essential for financial and temperature data
- Use when Box-Cox fails
- Always the safe choice

---

**Navigation:**
- **Previous:** [← Box-Cox](./transformations-box-cox.md)
- **Next:** [Power Transformer & Custom →](./transformations-power-custom.md)
- **Related:** [Comparison Guide](./transformations-comparison-guide.md)
