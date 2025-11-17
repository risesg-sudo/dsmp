# Outlier Handling Strategies

## Introduction

You've detected outliers—now what? Removing them isn't always the answer. You'll learn four strategic approaches to handling outliers, understand when to use each, and avoid costly mistakes that could lose valuable information.

## Strategy 1: Removal

The simplest approach—delete rows containing outliers.

```python
import pandas as pd
import numpy as np

# Sample data
df = pd.DataFrame({
    'id': range(1, 11),
    'age': [25, 30, 35, 40, 150, 28, 32, 45, 38, 200],  # 150 and 200 are outliers
    'income': [50000, 60000, 55000, 70000, 65000, 58000, 62000, 72000, 68000, 71000]
})

print("Original Data:")
print(df)
print(f"Shape: {df.shape}")
print("\n" + "="*60 + "\n")

# Detect outliers using IQR
Q1 = df['age'].quantile(0.25)
Q3 = df['age'].quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR

# Remove outliers
df_clean = df[(df['age'] >= lower) & (df['age'] <= upper)]

print("After Removing Outliers:")
print(df_clean)
print(f"Shape: {df_clean.shape}")
print(f"Removed: {len(df) - len(df_clean)} rows")

print("\n" + "="*60 + "\n")
print("Pros: Clean data, simple")
print("Cons: Lose data, may lose important information")
print("Use when: Outliers are errors, large dataset")
```

**When to Remove:**
- Outliers are data entry errors
- Large dataset (losing data acceptable)
- Outliers are measurement errors
- Model performance improves significantly

**When NOT to Remove:**
- Small dataset
- Outliers are valid data points
- Outliers represent important cases
- Domain requires keeping all data

## Strategy 2: Capping (Winsorization)

Limit extreme values to specified percentiles.

```python
import pandas as pd
import numpy as np

# Sample data
df = pd.DataFrame({
    'salary': [50000, 55000, 60000, 58000, 62000, 200000, 52000, 59000, 300000, 61000]
})

print("Original Data:")
print(df)
print(df.describe())
print("\n" + "="*60 + "\n")

# Cap at 5th and 95th percentiles
lower_cap = df['salary'].quantile(0.05)
upper_cap = df['salary'].quantile(0.95)

df['salary_capped'] = df['salary'].clip(lower=lower_cap, upper=upper_cap)

print(f"Capping bounds: [{lower_cap:,.0f}, {upper_cap:,.0f}]")
print("\nAfter Capping:")
print(df)

print("\n" + "="*60 + "\n")
print("Comparison:")
comparison = pd.DataFrame({
    'Original': df['salary'].describe(),
    'Capped': df['salary_capped'].describe()
})
print(comparison)

print("\n" + "="*60 + "\n")
print("Pros: Keeps all data, reduces extreme impact")
print("Cons: Distorts original values")
print("Use when: Outliers are valid but extreme, small dataset")
```

**When to Cap:**
- Small dataset (can't afford to lose data)
- Outliers are valid but extreme
- Need all samples
- Competition/grading constraints

**Typical Percentiles:**
- Conservative: 5th and 95th
- Moderate: 1st and 99th
- Aggressive: 10th and 90th

## Strategy 3: Transformation

Use mathematical transformations to reduce skewness and outlier impact.

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Right-skewed data with outliers
np.random.seed(42)
data = np.random.exponential(scale=2, size=100)
df = pd.DataFrame({'value': data})

print("Original Data:")
print(df.describe())
print(f"Skewness: {df['value'].skew():.2f}")
print("\n" + "="*60 + "\n")

# Log transformation
df['log_transform'] = np.log1p(df['value'])  # log(1+x) to handle zeros

print("After Log Transformation:")
print(df['log_transform'].describe())
print(f"Skewness: {df['log_transform'].skew():.2f}")

print("\n" + "="*60 + "\n")
print("Effect of Log Transformation:")
print("Original range:     [{:.2f}, {:.2f}]".format(df['value'].min(), df['value'].max()))
print("Transformed range:  [{:.2f}, {:.2f}]".format(df['log_transform'].min(), df['log_transform'].max()))
print("\nSkewness reduced from {:.2f} to {:.2f}".format(
    df['value'].skew(),
    df['log_transform'].skew()
))

print("\n" + "="*60 + "\n")
print("Pros: Reduces skewness, handles outliers naturally")
print("Cons: Changes interpretation, requires inverse transform")
print("Use when: Data is positively skewed, multiplicative relationships")
```

**Common Transformations:**
- Log: `np.log1p(x)` - For right-skewed data
- Square root: `np.sqrt(x)` - Moderate skewness
- Box-Cox: Automatic optimal transformation
- Yeo-Johnson: Works with negative values

**When to Transform:**
- Data is skewed
- Outliers are due to distribution shape
- Need to preserve relative relationships
- Using parametric models

## Strategy 4: Separate Treatment

Treat outliers as a distinct group rather than removing them.

```python
import pandas as pd
import numpy as np

# E-commerce data
df = pd.DataFrame({
    'customer_id': range(1, 11),
    'purchases': [5, 8, 6, 7, 150, 9, 7, 8, 200, 6],  # 150 and 200 are VIP customers
    'avg_order_value': [50, 60, 55, 58, 500, 62, 59, 61, 600, 57]
})

print("Customer Data:")
print(df)
print("\n" + "="*60 + "\n")

# Identify VIP customers (outliers)
Q3 = df['purchases'].quantile(0.75)
IQR = df['purchases'].quantile(0.75) - df['purchases'].quantile(0.25)
vip_threshold = Q3 + 1.5 * IQR

df['customer_type'] = df['purchases'].apply(
    lambda x: 'VIP' if x > vip_threshold else 'Regular'
)

print("Customer Segmentation:")
print(df)

print("\n" + "="*60 + "\n")
print("Separate Analysis:")
print("\nRegular Customers:")
print(df[df['customer_type'] == 'Regular'][['purchases', 'avg_order_value']].describe())

print("\nVIP Customers:")
print(df[df['customer_type'] == 'VIP'][['purchases', 'avg_order_value']].describe())

print("\n" + "="*60 + "\n")
print("Pros: Preserves valuable information, domain-appropriate")
print("Cons: Requires separate modeling")
print("Use when: Outliers are meaningful (VIP, fraud, anomalies)")
```

**When to Separate:**
- Outliers represent distinct group (VIP customers, fraud)
- Outliers have different behavior patterns
- Business value in treating differently
- Enough outliers to model separately

**Examples:**
- VIP customers in e-commerce
- Fraudulent transactions in banking
- Critical patients in healthcare
- High performers in HR analytics

## Decision Framework

```
OUTLIER HANDLING DECISION TREE
═══════════════════════════════

Start: Detected outliers
│
├─ Are outliers errors?
│  └─ YES → Remove
│
├─ Is dataset large?
│  ├─ YES → Can remove or cap
│  └─ NO  → Cap or transform
│
├─ Outliers meaningful?
│  └─ YES → Separate treatment
│
├─ Data is skewed?
│  └─ YES → Transform (log, sqrt)
│
└─ Default → Use robust methods (RobustScaler)
```

## Comparison of Strategies

```python
import pandas as pd
import numpy as np

# Create summary comparison
strategies = pd.DataFrame({
    'Strategy': ['Remove', 'Cap', 'Transform', 'Separate'],
    'Data Loss': ['Yes', 'No', 'No', 'No'],
    'Value Changed': ['Yes', 'Yes', 'Yes', 'No'],
    'Best For': [
        'Large datasets, errors',
        'Small datasets, valid extremes',
        'Skewed distributions',
        'Meaningful outliers'
    ],
    'Complexity': ['Low', 'Low', 'Medium', 'High']
})

print("="*80)
print("OUTLIER HANDLING STRATEGIES COMPARISON")
print("="*80)
print(strategies.to_string(index=False))
```

## Best Practices

**Always document your decision:**
```python
outlier_handling_log = {
    'feature': 'income',
    'method': 'capping',
    'parameters': {'lower': '5th percentile', 'upper': '95th percentile'},
    'reason': 'Small dataset, outliers valid but extreme',
    'impact': 'Reduced range from 0-1M to 0-200K'
}
```

**Validate impact:**
```python
# Before handling
model_before = train_model(X_with_outliers, y)

# After handling
model_after = train_model(X_handled, y)

# Compare
print(f"Before: {model_before.score()}")
print(f"After: {model_after.score()}")
```

**Consider domain expertise:**
- Medical data: Extreme values may be critical
- Financial data: Outliers may indicate fraud
- Sensor data: May indicate equipment failure

## Common Mistakes to Avoid

**Mistake 1: Always removing outliers**
```python
# WRONG: Blindly removing all outliers
# Some outliers are what we want to predict (fraud, disease)
```

**Mistake 2: Not checking impact**
```python
# WRONG: Handle outliers without validation
# CORRECT: Always compare before/after performance
```

**Mistake 3: Using same strategy for all features**
```python
# WRONG: One-size-fits-all approach
# CORRECT: Analyze each feature independently
```

## Summary

Four strategic approaches to handling outliers:

1. **Remove:** Clean data, loses information
2. **Cap:** Keeps data, distorts values
3. **Transform:** Natural handling, changes scale
4. **Separate:** Preserves information, more complex

Choose based on:
- Dataset size
- Outlier nature (error vs. valid)
- Business requirements
- Model sensitivity

Remember: Not all outliers are bad. Some are your most valuable data points.

---

**Navigation:**
- **Previous:** [← Outlier Detection](./outliers-detection-methods.md)
- **Next:** [Scaling Comparison Guide →](./scaling-comparison-guide.md)
- **Related:** [Transformations](./transformations-log.md)
