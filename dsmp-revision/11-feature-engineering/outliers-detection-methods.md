# Outlier Detection Methods

## Introduction

Outliers can make or break your model's performance. But how do you find them? You'll learn three powerful methods for detecting outliers—from simple statistical approaches to advanced machine learning techniques—and understand when to use each one.

## What Are Outliers?

Outliers are data points that significantly differ from other observations.

```
Outliers: Data points significantly different from other observations

Visual:
──────────────────────────────────────────────
Data: [10, 12, 15, 18, 20, 22, 25, 100]
                                         ↑
                                      Outlier!

Box Plot:
    │
100 ├─────────── *  ← Outlier
    │
 25 ├───────┐
 22 ├       │
 20 ├       ├──── IQR (Interquartile Range)
 18 ├       │
 15 ├───────┘
 12 ├
 10 ├
    │
```

## Method 1: Z-Score

The simplest statistical method for outlier detection.

```python
import pandas as pd
import numpy as np
from scipy import stats

# Sample data with outliers
data = pd.DataFrame({
    'values': [10, 12, 15, 18, 20, 22, 25, 100, 105, 12, 14, 16]
})

print("Original Data:")
print(data)
print("\n" + "="*60 + "\n")

# Calculate Z-scores
data['z_score'] = np.abs(stats.zscore(data['values']))

# Flag outliers (|z| > 3)
threshold = 3
data['is_outlier_z'] = data['z_score'] > threshold

print("Z-Score Analysis:")
print(data)

print("\n" + "="*60 + "\n")
print(f"Number of outliers (|z| > {threshold}): {data['is_outlier_z'].sum()}")
print("\nOutliers:")
print(data[data['is_outlier_z']])

# Explanation
print("\n" + "="*60 + "\n")
print("Z-Score Formula: z = (x - mean) / std")
print(f"Mean: {data['values'].mean():.2f}")
print(f"Std Dev: {data['values'].std():.2f}")
print(f"\nFor value = 100:")
print(f"z = (100 - {data['values'].mean():.2f}) / {data['values'].std():.2f}")
print(f"z = {(100 - data['values'].mean()) / data['values'].std():.2f}")
```

**When to use Z-Score:**
- Data is approximately normally distributed
- Need quick, simple detection
- Small to medium datasets

**Limitations:**
- Assumes normal distribution
- Sensitive to extreme outliers (they affect mean and std)
- Not suitable for skewed data

## Method 2: IQR (Interquartile Range)

More robust than Z-Score, doesn't assume normal distribution.

```python
import pandas as pd
import numpy as np

# Sample data
data = pd.DataFrame({
    'values': [10, 12, 15, 18, 20, 22, 25, 28, 100, 105]
})

print("Original Data:")
print(data)
print("\n" + "="*60 + "\n")

# Calculate IQR
Q1 = data['values'].quantile(0.25)
Q3 = data['values'].quantile(0.75)
IQR = Q3 - Q1

# Define outlier bounds
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

# Flag outliers
data['is_outlier_iqr'] = (data['values'] < lower_bound) | (data['values'] > upper_bound)

print("IQR Analysis:")
print(f"Q1 (25th percentile): {Q1}")
print(f"Q3 (75th percentile): {Q3}")
print(f"IQR: {IQR}")
print(f"Lower Bound: Q1 - 1.5×IQR = {Q1} - 1.5×{IQR} = {lower_bound}")
print(f"Upper Bound: Q3 + 1.5×IQR = {Q3} + 1.5×{IQR} = {upper_bound}")

print("\n" + "="*60 + "\n")
print("Outlier Detection Results:")
print(data)

print("\n" + "="*60 + "\n")
print(f"Number of outliers: {data['is_outlier_iqr'].sum()}")
print("\nOutliers:")
print(data[data['is_outlier_iqr']])
```

**When to use IQR:**
- Data is skewed or non-normal
- Need robust method (not affected by extreme values)
- Visualizing with box plots

**Limitations:**
- May flag too many points as outliers
- 1.5 multiplier is arbitrary (can adjust)

## Method 3: Isolation Forest

Advanced machine learning approach for complex outlier patterns.

```python
from sklearn.ensemble import IsolationForest
import pandas as pd
import numpy as np

# Generate data with outliers
np.random.seed(42)
normal_data = np.random.normal(50, 10, 100)
outliers = np.array([150, 160, -50, -60])
data = np.concatenate([normal_data, outliers])

df = pd.DataFrame({'value': data})

print("Data Summary:")
print(df.describe())
print("\n" + "="*60 + "\n")

# Isolation Forest
iso_forest = IsolationForest(
    contamination=0.05,  # Expected proportion of outliers
    random_state=42
)

df['outlier_if'] = iso_forest.fit_predict(df[['value']])
# -1 = outlier, 1 = inlier

# Convert to boolean
df['is_outlier'] = df['outlier_if'] == -1

print("Isolation Forest Results:")
print(f"Number of outliers detected: {df['is_outlier'].sum()}")

print("\nOutliers:")
outliers_detected = df[df['is_outlier']].sort_values('value')
print(outliers_detected)

print("\n" + "="*60 + "\n")
print("How Isolation Forest Works:")
print("1. Randomly select feature and split value")
print("2. Outliers are easier to isolate (fewer splits needed)")
print("3. Anomaly score based on path length in isolation tree")
```

**When to use Isolation Forest:**
- Multiple features (multivariate outliers)
- Complex outlier patterns
- Don't know contamination rate (can estimate)
- Large datasets

**Limitations:**
- Need to specify contamination parameter
- More complex than statistical methods
- Computationally expensive

## Comparison of Methods

Let's compare all three methods on the same dataset.

```python
import pandas as pd
import numpy as np
from scipy import stats
from sklearn.ensemble import IsolationForest

# Data with different types of outliers
np.random.seed(42)
data = pd.DataFrame({
    'values': list(np.random.normal(50, 10, 95)) + [150, 160, -50, -60, 200]  # 5 outliers
})

print("Dataset:")
print(data.describe())
print(f"Total points: {len(data)}")
print("\n" + "="*60 + "\n")

# Method 1: Z-Score
data['z_score'] = np.abs(stats.zscore(data['values']))
data['outlier_z'] = data['z_score'] > 3

# Method 2: IQR
Q1 = data['values'].quantile(0.25)
Q3 = data['values'].quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR
data['outlier_iqr'] = (data['values'] < lower) | (data['values'] > upper)

# Method 3: Isolation Forest
iso_forest = IsolationForest(contamination=0.05, random_state=42)
data['outlier_if'] = iso_forest.fit_predict(data[['values']]) == -1

# Compare results
print("Outlier Detection Comparison:")
print("="*60)
print(f"Z-Score (|z| > 3):        {data['outlier_z'].sum()} outliers")
print(f"IQR Method:               {data['outlier_iqr'].sum()} outliers")
print(f"Isolation Forest:         {data['outlier_if'].sum()} outliers")

print("\n" + "="*60 + "\n")
print("Detected Outliers:")
outlier_comparison = data[data['outlier_z'] | data['outlier_iqr'] | data['outlier_if']]
print(outlier_comparison[['values', 'outlier_z', 'outlier_iqr', 'outlier_if']])

print("\n" + "="*60 + "\n")
print("Method Characteristics:")
print("\nZ-Score:")
print("  + Simple and fast")
print("  - Assumes normal distribution")
print("  - Sensitive to extreme outliers (affect mean/std)")
print("\nIQR:")
print("  + Robust to extreme outliers")
print("  + No distribution assumption")
print("  - May flag too many points as outliers")
print("\nIsolation Forest:")
print("  + Handles multiple dimensions")
print("  + Good for complex patterns")
print("  - Requires tuning contamination parameter")
```

## Decision Framework

```
OUTLIER DETECTION - WHICH METHOD?
═════════════════════════════════

Step 1: Check your data
│
├─ Single feature + normal distribution?
│  └─ → Z-Score (simple and fast)
│
├─ Single feature + skewed/non-normal?
│  └─ → IQR (robust and reliable)
│
├─ Multiple features?
│  └─ → Isolation Forest
│
└─ Don't know distribution?
   └─ → Start with IQR, validate with others
```

## Best Practices

**Always visualize:**
```python
import matplotlib.pyplot as plt

# Box plot for IQR visualization
plt.figure(figsize=(10, 6))
plt.boxplot(data['values'])
plt.title('Box Plot - Visual Outlier Detection')
plt.ylabel('Value')
plt.show()
```

**Use multiple methods:**
- Combine methods for robust detection
- Outliers flagged by multiple methods are more likely true outliers

**Consider domain knowledge:**
- Not all statistical outliers are problematic
- Some may be valuable (fraud, anomalies)

## Summary

Three powerful methods for outlier detection:

1. **Z-Score:** Simple, fast, assumes normality
2. **IQR:** Robust, no assumptions, widely used
3. **Isolation Forest:** Advanced, handles complexity

Choose based on your data characteristics and computational resources. When in doubt, start with IQR and validate with other methods.

---

**Navigation:**
- **Previous:** [← Normalizer](./scaling-normalizer.md)
- **Next:** [Outlier Handling Strategies →](./outliers-handling-strategies.md)
- **Related:** [RobustScaler](./scaling-robustscaler.md)
