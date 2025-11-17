# Discretization Techniques - Complete Guide

## Table of Contents
1. [Introduction to Discretization](#introduction-to-discretization)
2. [Equal-Width Binning](#equal-width-binning)
3. [Equal-Frequency (Quantile) Binning](#equal-frequency-quantile-binning)
4. [Custom Binning](#custom-binning)
5. [K-Means Binning](#k-means-binning)
6. [Decision Tree Binning](#decision-tree-binning)
7. [Comparison and Selection](#comparison-and-selection)
8. [Common Mistakes](#common-mistakes)
9. [Interview Questions](#interview-questions)

---

## Introduction to Discretization

### What is Discretization?

Converting continuous numerical variables into discrete categorical variables (bins/buckets).

```
Before Discretization:
═══════════════════════
Age: [22, 25, 28, 35, 42, 58, 65, 71]
Continuous numerical values

After Discretization:
═══════════════════════
Age Groups: ['Young', 'Young', 'Young', 'Middle',
             'Middle', 'Senior', 'Senior', 'Senior']
Categorical labels

Or as bins:
Age Groups: [0, 0, 0, 1, 1, 2, 2, 2]
Numerical categories
```

### Why Discretize?

```
Benefits:
┌─────────────────────────────────────┐
│ 1. Handle Non-Linear Relationships  │
│    Step-wise effects easier to model│
│                                      │
│ 2. Reduce Noise                     │
│    Smooth out minor variations      │
│                                      │
│ 3. Handle Outliers                  │
│    Extreme values capped in bins    │
│                                      │
│ 4. Interpretability                 │
│    Easier to understand & explain   │
│                                      │
│ 5. Feature Engineering              │
│    Create categorical from numerical│
│                                      │
│ 6. Model Requirements               │
│    Some models need categorical data│
└─────────────────────────────────────┘

Drawbacks:
┌─────────────────────────────────────┐
│ 1. Information Loss                 │
│    Exact values → ranges            │
│                                      │
│ 2. Arbitrary Boundaries             │
│    Choice of bins affects results   │
│                                      │
│ 3. Loss of Granularity              │
│    Can't capture fine differences   │
└─────────────────────────────────────┘
```

### Visual Example

```
Continuous Age:
────────────────────────────────────────────────────
|  22  25  28   35   42      58    65   71
└────────────────────────────────────────────────────►
                    Age

Discretized into 3 bins:
────────────────────────────────────────────────────
|      Young      |   Middle   |    Senior   |
|  (18-35)        |  (36-60)   |   (61-80)   |
└────────────────────────────────────────────────────►
```

---

## Equal-Width Binning

### Concept

Divide the range into bins of equal width.

```
Formula:
────────
bin_width = (max - min) / n_bins

Example: Ages [20, 80], 3 bins
bin_width = (80 - 20) / 3 = 20

Bins:
  [20, 40)  → Young
  [40, 60)  → Middle
  [60, 80]  → Senior

Visual:
────────────────────────────────
|    20 units  |   20 units  | 20 units |
[20────────40)─[40────────60)─[60──────80]
```

### Implementation

```python
import pandas as pd
import numpy as np

# Sample age data
ages = np.array([22, 25, 28, 35, 42, 45, 58, 62, 65, 71, 75])

print("Original Ages:")
print(ages)
print(f"Range: [{ages.min()}, {ages.max()}]")
print("\n" + "="*60 + "\n")

# Method 1: pandas.cut (equal-width)
age_bins = pd.cut(ages, bins=3)

print("Equal-Width Binning (3 bins):")
print(age_bins)
print("\nBin Intervals:")
print(age_bins.categories)

# Get bin labels
age_bins_labeled = pd.cut(ages, bins=3, labels=['Young', 'Middle', 'Senior'])
print("\nWith Custom Labels:")
print(age_bins_labeled)

# Show distribution
print("\n" + "="*60 + "\n")
print("Distribution Across Bins:")
print(pd.Series(age_bins_labeled).value_counts().sort_index())

# Manual calculation
print("\n" + "="*60 + "\n")
print("Manual Calculation:")
min_age = ages.min()
max_age = ages.max()
n_bins = 3
bin_width = (max_age - min_age) / n_bins

print(f"Min: {min_age}, Max: {max_age}")
print(f"Bin Width: {bin_width:.2f}")
print(f"Bin 1: [{min_age:.0f}, {min_age + bin_width:.0f})")
print(f"Bin 2: [{min_age + bin_width:.0f}, {min_age + 2*bin_width:.0f})")
print(f"Bin 3: [{min_age + 2*bin_width:.0f}, {max_age:.0f}]")
```

### Real-World Example: Income Segmentation

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Generate income data
np.random.seed(42)
n = 1000

incomes = np.concatenate([
    np.random.normal(30000, 5000, 400),   # Low income
    np.random.normal(60000, 10000, 400),  # Middle income
    np.random.normal(120000, 20000, 200)  # High income
])

df = pd.DataFrame({'income': incomes})

print("Income Data:")
print(df.describe())
print("\n" + "="*60 + "\n")

# Equal-width binning into 5 categories
df['income_category'] = pd.cut(
    df['income'],
    bins=5,
    labels=['Very Low', 'Low', 'Medium', 'High', 'Very High']
)

# Also get bin edges
df['income_bin'] = pd.cut(df['income'], bins=5)

print("After Equal-Width Binning:")
print(df.head(10))

print("\n" + "="*60 + "\n")
print("Distribution:")
print(df['income_category'].value_counts().sort_index())

print("\n" + "="*60 + "\n")
print("Bin Edges:")
print(df['income_bin'].cat.categories)

# Show statistics per bin
print("\n" + "="*60 + "\n")
print("Statistics per Bin:")
bin_stats = df.groupby('income_category')['income'].agg(['count', 'mean', 'min', 'max'])
print(bin_stats)

print("\n" + "="*60 + "\n")
print("Observation:")
print("Equal-width bins may have uneven counts")
print("Some bins might have very few samples")
```

### Specifying Custom Edges

```python
import pandas as pd
import numpy as np

# Age data
ages = [22, 25, 28, 35, 42, 45, 58, 62, 65, 71, 75]

print("Ages:", ages)
print("\n" + "="*60 + "\n")

# Custom bin edges
custom_edges = [0, 30, 50, 70, 100]
labels = ['Young Adult', 'Middle Age', 'Senior', 'Elderly']

age_categories = pd.cut(
    ages,
    bins=custom_edges,
    labels=labels,
    include_lowest=True
)

print("Custom Bin Edges:", custom_edges)
print("Labels:", labels)
print("\nResult:")
print(age_categories)

# Create DataFrame for better view
df = pd.DataFrame({
    'age': ages,
    'category': age_categories
})
print("\n" + "="*60 + "\n")
print(df)

# Distribution
print("\n" + "="*60 + "\n")
print("Distribution:")
print(df['category'].value_counts().sort_index())
```

### When to Use

✅ **Use Equal-Width Binning when:**
- Data is uniformly distributed
- Want interpretable, evenly-spaced bins
- Quick exploratory analysis
- Natural breakpoints don't exist

❌ **Don't use when:**
- Data is skewed (bins will have very different counts)
- Need balanced bin sizes
- Outliers present (create wide bins with few samples)

---

## Equal-Frequency (Quantile) Binning

### Concept

Divide data so each bin has approximately equal number of observations.

```
Example: 12 values, 3 bins
─────────────────────────────
Values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20]

Equal-Frequency (4 in each bin):
Bin 1: [1, 2, 3, 4]      (values 1-4)
Bin 2: [5, 6, 7, 8]      (values 5-8)
Bin 3: [9, 10, 15, 20]   (values 9-20)

Notice: Bin widths are different!
Bin 1: width = 3
Bin 2: width = 3
Bin 3: width = 11 (wider to accommodate fewer large values)

Visual:
────────────────────────────────
|  4 obs  |  4 obs  |    4 obs      |
[1──────4][5──────8][9────────────20]
```

### Implementation

```python
import pandas as pd
import numpy as np

# Sample data (skewed)
np.random.seed(42)
data = np.concatenate([
    np.random.normal(50, 10, 80),   # Most data here
    np.random.normal(200, 20, 20)   # Few outliers
])

print("Data Distribution:")
print(f"Min: {data.min():.2f}")
print(f"Max: {data.max():.2f}")
print(f"Mean: {data.mean():.2f}")
print(f"Median: {np.median(data):.2f}")
print("\n" + "="*60 + "\n")

# Equal-Frequency Binning
bins_quantile = pd.qcut(data, q=4, labels=['Q1', 'Q2', 'Q3', 'Q4'])

print("Equal-Frequency Binning (4 quantiles):")
print(bins_quantile[:20])

# Count per bin
print("\n" + "="*60 + "\n")
print("Distribution (should be roughly equal):")
print(pd.Series(bins_quantile).value_counts().sort_index())

# Show bin edges
bins_quantile_intervals = pd.qcut(data, q=4)
print("\n" + "="*60 + "\n")
print("Bin Edges:")
print(bins_quantile_intervals.cat.categories)

# Compare with equal-width
bins_width = pd.cut(data, bins=4, labels=['B1', 'B2', 'B3', 'B4'])

print("\n" + "="*60 + "\n")
print("Comparison: Equal-Width vs Equal-Frequency")
print("\nEqual-Width Distribution:")
print(pd.Series(bins_width).value_counts().sort_index())
print("\nEqual-Frequency Distribution:")
print(pd.Series(bins_quantile).value_counts().sort_index())

print("\nObservation:")
print("Equal-Width: Very uneven counts (most in B1)")
print("Equal-Frequency: Roughly equal counts per bin")
```

### Real-World Example: Customer Segmentation by Spending

```python
import pandas as pd
import numpy as np

# Customer spending data (right-skewed, like real spending)
np.random.seed(42)
n = 1000

spending = np.random.exponential(scale=500, size=n) + 100

df = pd.DataFrame({'customer_id': range(1, n+1), 'total_spending': spending})

print("Customer Spending Data:")
print(df['total_spending'].describe())
print(f"Skewness: {df['total_spending'].skew():.2f}")
print("\n" + "="*60 + "\n")

# Equal-Frequency Binning (quartiles)
df['spending_quartile'] = pd.qcut(
    df['total_spending'],
    q=4,
    labels=['Low', 'Medium', 'High', 'Premium']
)

# Get detailed bin info
df['spending_bin_detail'] = pd.qcut(df['total_spending'], q=4)

print("After Quartile Binning:")
print(df.head(10))

print("\n" + "="*60 + "\n")
print("Distribution (should be equal):")
print(df['spending_quartile'].value_counts().sort_index())

print("\n" + "="*60 + "\n")
print("Bin Ranges:")
for cat in df['spending_bin_detail'].cat.categories:
    print(f"  {cat}")

# Statistics per segment
print("\n" + "="*60 + "\n")
print("Segment Statistics:")
segment_stats = df.groupby('spending_quartile')['total_spending'].agg([
    'count', 'min', 'max', 'mean', 'median'
])
print(segment_stats)

print("\n" + "="*60 + "\n")
print("Business Interpretation:")
print("Low:     Bottom 25% of spenders")
print("Medium:  25th-50th percentile")
print("High:    50th-75th percentile")
print("Premium: Top 25% of spenders")

# Compare with equal-width
df['spending_equal_width'] = pd.cut(
    df['total_spending'],
    bins=4,
    labels=['B1', 'B2', 'B3', 'B4']
)

print("\n" + "="*60 + "\n")
print("Equal-Width Distribution (for comparison):")
print(df['spending_equal_width'].value_counts().sort_index())
print("\nNotice: Most customers in B1 with equal-width!")
```

### Custom Quantiles

```python
import pandas as pd
import numpy as np

# Generate data
np.random.seed(42)
data = np.random.exponential(scale=1000, size=500)

print("Data Statistics:")
print(f"Min: {data.min():.2f}")
print(f"Max: {data.max():.2f}")
print("\n" + "="*60 + "\n")

# Custom percentiles: 10th, 25th, 50th, 75th, 90th
custom_quantiles = [0, 0.10, 0.25, 0.50, 0.75, 0.90, 1.0]
labels = ['Bottom 10%', '10-25%', '25-50%', '50-75%', '75-90%', 'Top 10%']

bins = pd.qcut(
    data,
    q=custom_quantiles,
    labels=labels,
    duplicates='drop'  # Handle duplicate bin edges
)

print("Custom Quantile Binning:")
print(bins[:20])

print("\n" + "="*60 + "\n")
print("Distribution:")
print(pd.Series(bins).value_counts().sort_index())

# Get actual quantile values
print("\n" + "="*60 + "\n")
print("Quantile Values:")
quantile_values = np.quantile(data, custom_quantiles)
for q, val in zip(custom_quantiles, quantile_values):
    print(f"{q*100:5.0f}th percentile: ${val:8.2f}")
```

### When to Use

✅ **Use Equal-Frequency Binning when:**
- Data is skewed
- Want balanced sample sizes per bin
- Statistical analysis requires equal groups
- Ranking/percentile-based segmentation

❌ **Don't use when:**
- Need interpretable bin edges
- Natural breakpoints exist
- Many duplicate values (can cause issues)

---

## Custom Binning

### Domain-Based Binning

```python
import pandas as pd
import numpy as np

# Age data
ages = np.random.randint(0, 100, 200)
df = pd.DataFrame({'age': ages})

print("Age Data:")
print(df['age'].describe())
print("\n" + "="*60 + "\n")

# Domain-knowledge based age groups
age_bins = [0, 2, 12, 18, 25, 35, 50, 65, 100]
age_labels = ['Infant', 'Child', 'Teen', 'Young Adult',
              'Adult', 'Middle Age', 'Senior', 'Elderly']

df['age_group'] = pd.cut(
    df['age'],
    bins=age_bins,
    labels=age_labels,
    include_lowest=True
)

print("Domain-Based Age Groups:")
print(df.head(20))

print("\n" + "="*60 + "\n")
print("Distribution:")
print(df['age_group'].value_counts().sort_index())

print("\n" + "="*60 + "\n")
print("Bin Edges (based on life stages):")
for i, (edge, label) in enumerate(zip(age_bins[:-1], age_labels)):
    print(f"  {label:15s}: [{age_bins[i]:3d}, {age_bins[i+1]:3d})")
```

### Medical/Clinical Bins

```python
import pandas as pd
import numpy as np

# Medical measurements
np.random.seed(42)
n = 500

df = pd.DataFrame({
    'systolic_bp': np.random.normal(130, 20, n),
    'bmi': np.random.normal(26, 5, n),
    'glucose': np.random.normal(100, 20, n)
})

print("Medical Data:")
print(df.describe())
print("\n" + "="*60 + "\n")

# Blood Pressure Categories (American Heart Association)
bp_bins = [0, 120, 130, 140, 180, 300]
bp_labels = ['Normal', 'Elevated', 'Stage 1 Hypertension',
             'Stage 2 Hypertension', 'Hypertensive Crisis']

df['bp_category'] = pd.cut(
    df['systolic_bp'],
    bins=bp_bins,
    labels=bp_labels
)

# BMI Categories (WHO)
bmi_bins = [0, 18.5, 25, 30, 35, 100]
bmi_labels = ['Underweight', 'Normal', 'Overweight', 'Obese Class I', 'Obese Class II+']

df['bmi_category'] = pd.cut(
    df['bmi'],
    bins=bmi_bins,
    labels=bmi_labels
)

# Glucose Categories (ADA)
glucose_bins = [0, 100, 126, 200, 500]
glucose_labels = ['Normal', 'Prediabetes', 'Diabetes', 'Severe']

df['glucose_category'] = pd.cut(
    df['glucose'],
    bins=glucose_bins,
    labels=glucose_labels
)

print("With Clinical Categories:")
print(df.head(10))

print("\n" + "="*60 + "\n")
print("Blood Pressure Distribution:")
print(df['bp_category'].value_counts().sort_index())

print("\n" + "="*60 + "\n")
print("BMI Distribution:")
print(df['bmi_category'].value_counts().sort_index())

print("\n" + "="*60 + "\n")
print("Glucose Distribution:")
print(df['glucose_category'].value_counts().sort_index())

# Cross-tabulation
print("\n" + "="*60 + "\n")
print("Risk Assessment (BP vs BMI):")
risk_table = pd.crosstab(df['bp_category'], df['bmi_category'])
print(risk_table)
```

### Business Rule-Based Binning

```python
import pandas as pd
import numpy as np

# E-commerce customer data
np.random.seed(42)
n = 1000

df = pd.DataFrame({
    'customer_id': range(1, n+1),
    'total_revenue': np.random.exponential(scale=500, size=n) + 50,
    'days_since_last_purchase': np.random.randint(0, 365, n),
    'total_purchases': np.random.randint(1, 50, n)
})

print("Customer Data:")
print(df.head(10))
print("\n" + "="*60 + "\n")

# RFM Segmentation (Recency, Frequency, Monetary)

# Recency bins (based on business calendar)
recency_bins = [0, 30, 90, 180, 365]
recency_labels = ['Active', 'Regular', 'Lapsed', 'Inactive']
df['recency_segment'] = pd.cut(
    df['days_since_last_purchase'],
    bins=recency_bins,
    labels=recency_labels,
    include_lowest=True
)

# Monetary bins (based on business tiers)
monetary_bins = [0, 100, 500, 1000, 5000, float('inf')]
monetary_labels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
df['monetary_segment'] = pd.cut(
    df['total_revenue'],
    bins=monetary_bins,
    labels=monetary_labels
)

# Frequency bins
frequency_bins = [0, 5, 10, 20, 50]
frequency_labels = ['Occasional', 'Regular', 'Frequent', 'Power User']
df['frequency_segment'] = pd.cut(
    df['total_purchases'],
    bins=frequency_bins,
    labels=frequency_labels,
    include_lowest=True
)

print("With Business Segments:")
print(df.head(10))

print("\n" + "="*60 + "\n")
print("Segmentation Summary:")
print("\nRecency:")
print(df['recency_segment'].value_counts().sort_index())
print("\nMonetary:")
print(df['monetary_segment'].value_counts().sort_index())
print("\nFrequency:")
print(df['frequency_segment'].value_counts().sort_index())

# Create overall customer tier
def assign_tier(row):
    score = 0
    # Recency
    if row['recency_segment'] == 'Active':
        score += 3
    elif row['recency_segment'] == 'Regular':
        score += 2

    # Monetary
    if row['monetary_segment'] in ['Platinum', 'Diamond']:
        score += 3
    elif row['monetary_segment'] == 'Gold':
        score += 2

    # Frequency
    if row['frequency_segment'] in ['Frequent', 'Power User']:
        score += 3
    elif row['frequency_segment'] == 'Regular':
        score += 2

    if score >= 8:
        return 'VIP'
    elif score >= 5:
        return 'Loyal'
    elif score >= 3:
        return 'Regular'
    else:
        return 'At Risk'

df['customer_tier'] = df.apply(assign_tier, axis=1)

print("\n" + "="*60 + "\n")
print("Customer Tier Distribution:")
print(df['customer_tier'].value_counts().sort_index())
```

---

## K-Means Binning

### Concept

Use K-Means clustering to find optimal bin boundaries.

```
Advantage: Bins are data-driven, not arbitrary
Process:
1. Run K-Means clustering on feature
2. Use cluster centroids as bin centers
3. Use cluster boundaries as bin edges

Visual:
────────────────────────────────────────
Data:    ●●●    ●●●●       ●●●●●●●
         ↓       ↓           ↓
K-Means: Cluster1 Cluster2  Cluster3
         ↓       ↓           ↓
Bins:   [Low]  [Medium]    [High]
────────────────────────────────────────
```

### Implementation

```python
from sklearn.preprocessing import KBinsDiscretizer
import pandas as pd
import numpy as np

# Sample data with natural clusters
np.random.seed(42)
data = np.concatenate([
    np.random.normal(20, 3, 100),   # Cluster 1
    np.random.normal(50, 5, 100),   # Cluster 2
    np.random.normal(80, 4, 100)    # Cluster 3
])

print("Data Statistics:")
print(f"Min: {data.min():.2f}")
print(f"Max: {data.max():.2f}")
print(f"Mean: {data.mean():.2f}")
print("\n" + "="*60 + "\n")

# K-Means Discretization
discretizer = KBinsDiscretizer(
    n_bins=3,
    encode='ordinal',
    strategy='kmeans'
)

data_reshaped = data.reshape(-1, 1)
bins_kmeans = discretizer.fit_transform(data_reshaped).ravel()

print("K-Means Binning:")
print(f"Bin 0 count: {(bins_kmeans == 0).sum()}")
print(f"Bin 1 count: {(bins_kmeans == 1).sum()}")
print(f"Bin 2 count: {(bins_kmeans == 2).sum()}")

# Get bin edges
print("\n" + "="*60 + "\n")
print("Bin Edges:")
print(discretizer.bin_edges_[0])

# Compare with equal-width
discretizer_uniform = KBinsDiscretizer(
    n_bins=3,
    encode='ordinal',
    strategy='uniform'
)
bins_uniform = discretizer_uniform.fit_transform(data_reshaped).ravel()

print("\n" + "="*60 + "\n")
print("Comparison:")
print("\nK-Means Distribution:")
print(pd.Series(bins_kmeans).value_counts().sort_index())
print("\nEqual-Width Distribution:")
print(pd.Series(bins_uniform).value_counts().sort_index())

# Show bin edges comparison
print("\n" + "="*60 + "\n")
print("Bin Edges Comparison:")
print("K-Means:")
print(discretizer.bin_edges_[0])
print("\nEqual-Width:")
print(discretizer_uniform.bin_edges_[0])
```

### Real-World Example: Customer Age Groups

```python
from sklearn.preprocessing import KBinsDiscretizer
import pandas as pd
import numpy as np

# Customer age data (with natural groupings)
np.random.seed(42)

# Simulate age distribution (young professionals, middle-aged, seniors)
ages = np.concatenate([
    np.random.normal(28, 4, 200),   # Young professionals
    np.random.normal(45, 6, 300),   # Middle-aged
    np.random.normal(68, 5, 150)    # Seniors
])

# Clip to realistic range
ages = np.clip(ages, 18, 90)

df = pd.DataFrame({'age': ages})

print("Age Distribution:")
print(df['age'].describe())
print("\n" + "="*60 + "\n")

# Method 1: K-Means binning (finds natural clusters)
discretizer_kmeans = KBinsDiscretizer(
    n_bins=3,
    encode='ordinal',
    strategy='kmeans'
)

df['age_group_kmeans'] = discretizer_kmeans.fit_transform(
    df[['age']]
).astype(int)

# Method 2: Equal-width binning
discretizer_uniform = KBinsDiscretizer(
    n_bins=3,
    encode='ordinal',
    strategy='uniform'
)

df['age_group_uniform'] = discretizer_uniform.fit_transform(
    df[['age']]
).astype(int)

# Method 3: Quantile binning
discretizer_quantile = KBinsDiscretizer(
    n_bins=3,
    encode='ordinal',
    strategy='quantile'
)

df['age_group_quantile'] = discretizer_quantile.fit_transform(
    df[['age']]
).astype(int)

print("Sample Results:")
print(df.head(20))

print("\n" + "="*60 + "\n")
print("Distribution Comparison:")
print("\nK-Means:")
print(df['age_group_kmeans'].value_counts().sort_index())
print("\nEqual-Width:")
print(df['age_group_uniform'].value_counts().sort_index())
print("\nQuantile:")
print(df['age_group_quantile'].value_counts().sort_index())

print("\n" + "="*60 + "\n")
print("Bin Edges Comparison:")
print("\nK-Means:")
print(discretizer_kmeans.bin_edges_[0])
print("\nEqual-Width:")
print(discretizer_uniform.bin_edges_[0])
print("\nQuantile:")
print(discretizer_quantile.bin_edges_[0])

# Statistics per K-Means bin
print("\n" + "="*60 + "\n")
print("K-Means Bin Statistics:")
print(df.groupby('age_group_kmeans')['age'].agg(['count', 'min', 'max', 'mean']))

print("\n" + "="*60 + "\n")
print("Interpretation:")
print("K-Means found natural age groupings:")
print("- Likely corresponds to: Young, Middle-aged, Senior")
print("- Boundaries align with data clusters, not arbitrary")
```

### Encoding Options

```python
from sklearn.preprocessing import KBinsDiscretizer
import numpy as np

# Sample data
data = np.array([1, 5, 10, 15, 20, 25, 30]).reshape(-1, 1)

print("Original Data:")
print(data.ravel())
print("\n" + "="*60 + "\n")

# Encoding: 'ordinal' (default)
discretizer_ordinal = KBinsDiscretizer(n_bins=3, encode='ordinal', strategy='uniform')
bins_ordinal = discretizer_ordinal.fit_transform(data)
print("Ordinal Encoding (0, 1, 2):")
print(bins_ordinal.ravel())

# Encoding: 'onehot'
discretizer_onehot = KBinsDiscretizer(n_bins=3, encode='onehot', strategy='uniform')
bins_onehot = discretizer_onehot.fit_transform(data)
print("\n" + "="*60 + "\n")
print("One-Hot Encoding:")
print(bins_onehot.toarray())

# Encoding: 'onehot-dense'
discretizer_dense = KBinsDiscretizer(n_bins=3, encode='onehot-dense', strategy='uniform')
bins_dense = discretizer_dense.fit_transform(data)
print("\n" + "="*60 + "\n")
print("One-Hot Dense Encoding:")
print(bins_dense)

print("\n" + "="*60 + "\n")
print("Use Cases:")
print("ordinal:      Tree-based models, ordinal relationship exists")
print("onehot:       Linear models, no ordinal relationship")
print("onehot-dense: Same as onehot but dense array (memory efficient)")
```

---

## Decision Tree Binning

### Concept

Use decision tree to find optimal splits based on target variable.

```
Supervised Binning:
───────────────────
Uses target variable to find best splits
Example: Predicting house price

Age → Price relationship:
  Age < 30: Low price
  30 ≤ Age < 50: Medium price
  Age ≥ 50: High price

Tree finds these splits automatically!
```

### Implementation

```python
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
import pandas as pd
import numpy as np

# Generate data where age affects price non-linearly
np.random.seed(42)
n = 500

age = np.random.uniform(20, 70, n)

# Price depends on age in step-wise manner
price = np.where(
    age < 30,
    150000 + np.random.normal(0, 10000, n),  # Young: ~150k
    np.where(
        age < 50,
        250000 + np.random.normal(0, 15000, n),  # Middle: ~250k
        400000 + np.random.normal(0, 20000, n)   # Senior: ~400k
    )
)

df = pd.DataFrame({'age': age, 'price': price})

print("House Price Data:")
print(df.head(10))
print("\n" + "="*60 + "\n")

# Use decision tree to find optimal age bins
tree = DecisionTreeRegressor(
    max_depth=2,  # Limit depth = limit number of bins
    min_samples_leaf=50  # Minimum samples per bin
)

tree.fit(df[['age']], df['price'])

# Get split points
tree_structure = tree.tree_

def get_split_points(tree, feature_idx=0):
    """Extract split points from decision tree"""
    splits = []

    def traverse(node=0):
        if tree.feature[node] == feature_idx:
            splits.append(tree.threshold[node])
        if tree.children_left[node] != -1:  # Not a leaf
            traverse(tree.children_left[node])
            traverse(tree.children_right[node])

    traverse()
    return sorted(splits)

split_points = get_split_points(tree_structure)

print("Decision Tree Found Optimal Splits:")
print(f"Split points: {split_points}")

# Create bins based on tree splits
bin_edges = [df['age'].min()] + split_points + [df['age'].max()]
labels = [f'Group_{i}' for i in range(len(bin_edges)-1)]

df['age_group'] = pd.cut(df['age'], bins=bin_edges, labels=labels, include_lowest=True)

print("\n" + "="*60 + "\n")
print("Statistics per Tree-Based Bin:")
print(df.groupby('age_group').agg({
    'age': ['count', 'min', 'max', 'mean'],
    'price': ['mean', 'std']
}))

print("\n" + "="*60 + "\n")
print("Interpretation:")
print("Tree found optimal age ranges that best predict price")
print("These are data-driven, not arbitrary!")
```

### Supervised Binning for Classification

```python
from sklearn.tree import DecisionTreeClassifier
import pandas as pd
import numpy as np

# Credit default prediction
np.random.seed(42)
n = 1000

credit_score = np.random.uniform(300, 850, n)

# Default probability depends on credit score
default_prob = 1 / (1 + np.exp((credit_score - 600) / 50))
defaulted = np.random.binomial(1, default_prob)

df = pd.DataFrame({
    'credit_score': credit_score,
    'defaulted': defaulted
})

print("Credit Data:")
print(df.head(10))
print(f"\nDefault Rate: {defaulted.mean():.2%}")

# Use decision tree to find optimal credit score bins
tree = DecisionTreeClassifier(
    max_depth=3,
    min_samples_leaf=100
)

tree.fit(df[['credit_score']], df['defaulted'])

# Get split points
def get_splits_classifier(tree, feature_idx=0):
    splits = []

    def traverse(node=0):
        if tree.tree_.feature[node] == feature_idx:
            splits.append(tree.tree_.threshold[node])
        if tree.tree_.children_left[node] != -1:
            traverse(tree.tree_.children_left[node])
            traverse(tree.tree_.children_right[node])

    traverse()
    return sorted(splits)

splits = get_splits_classifier(tree)

print("\n" + "="*60 + "\n")
print("Optimal Credit Score Splits:")
print(splits)

# Create risk categories
bin_edges = [300] + splits + [850]
labels = ['Very High Risk', 'High Risk', 'Medium Risk', 'Low Risk'][:len(bin_edges)-1]

df['risk_category'] = pd.cut(
    df['credit_score'],
    bins=bin_edges,
    labels=labels,
    include_lowest=True
)

print("\n" + "="*60 + "\n")
print("Risk Category Analysis:")
risk_analysis = df.groupby('risk_category').agg({
    'credit_score': ['count', 'min', 'max', 'mean'],
    'defaulted': ['sum', 'mean']
})
print(risk_analysis)

print("\n" + "="*60 + "\n")
print("Default Rate by Category:")
default_rates = df.groupby('risk_category')['defaulted'].mean()
print(default_rates)
```

---

## Comparison and Selection

### Comparison Table

```python
import pandas as pd

comparison = pd.DataFrame({
    'Method': [
        'Equal-Width',
        'Equal-Frequency',
        'Custom',
        'K-Means',
        'Decision Tree'
    ],
    'Data Distribution': [
        'Uniform',
        'Any (especially skewed)',
        'Any',
        'Clustered',
        'Any'
    ],
    'Bin Balance': [
        'Uneven counts',
        'Even counts',
        'Depends',
        'Uneven',
        'Uneven'
    ],
    'Supervised': [
        'No',
        'No',
        'No',
        'No',
        'Yes'
    ],
    'Interpretability': [
        'High',
        'Medium',
        'Very High',
        'Medium',
        'High'
    ],
    'Best For': [
        'Uniform data, quick EDA',
        'Skewed data, ranking',
        'Domain knowledge exists',
        'Natural clusters',
        'Prediction tasks'
    ]
})

print("="*100)
print("DISCRETIZATION METHODS COMPARISON")
print("="*100)
print(comparison.to_string(index=False))
```

### Decision Framework

```
DISCRETIZATION METHOD SELECTION
════════════════════════════════

Step 1: Do you have domain knowledge about bins?
├─ YES → Custom Binning (use business rules)
└─ NO  → Continue to Step 2

Step 2: Is this for supervised learning (have target)?
├─ YES → Decision Tree Binning (optimal for prediction)
└─ NO  → Continue to Step 3

Step 3: What's the data distribution?
├─ Uniform → Equal-Width
├─ Skewed → Equal-Frequency (quantile)
├─ Natural clusters → K-Means
└─ Unknown → Start with Equal-Frequency

Step 4: Need balanced bin sizes?
├─ YES → Equal-Frequency
└─ NO  → Equal-Width or K-Means

Step 5: Interpretability important?
├─ YES → Custom or Equal-Width
└─ NO  → K-Means or Decision Tree
```

### Performance Comparison

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import KBinsDiscretizer
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier

# Generate classification data
np.random.seed(42)
n = 1000

age = np.random.uniform(18, 80, n)
income = np.random.uniform(20000, 150000, n)

# Target depends on age and income
target_prob = 1 / (1 + np.exp(-(age - 40)/10 - (income - 80000)/20000))
target = np.random.binomial(1, target_prob)

X = pd.DataFrame({'age': age, 'income': income})
y = target

print("Dataset:")
print(f"Samples: {n}")
print(f"Positive class: {target.mean():.2%}")
print("\n" + "="*60 + "\n")

# Test different discretization methods
results = {}

# 1. No discretization (baseline)
model = RandomForestClassifier(n_estimators=100, random_state=42)
score = cross_val_score(model, X, y, cv=5).mean()
results['No Discretization'] = score

# 2. Equal-Width
discretizer = KBinsDiscretizer(n_bins=5, encode='ordinal', strategy='uniform')
X_uniform = discretizer.fit_transform(X)
score = cross_val_score(model, X_uniform, y, cv=5).mean()
results['Equal-Width'] = score

# 3. Equal-Frequency
discretizer = KBinsDiscretizer(n_bins=5, encode='ordinal', strategy='quantile')
X_quantile = discretizer.fit_transform(X)
score = cross_val_score(model, X_quantile, y, cv=5).mean()
results['Equal-Frequency'] = score

# 4. K-Means
discretizer = KBinsDiscretizer(n_bins=5, encode='ordinal', strategy='kmeans')
X_kmeans = discretizer.fit_transform(X)
score = cross_val_score(model, X_kmeans, y, cv=5).mean()
results['K-Means'] = score

print("CROSS-VALIDATION RESULTS:")
print("="*60)
results_df = pd.DataFrame({
    'Method': list(results.keys()),
    'CV Score': list(results.values())
}).sort_values('CV Score', ascending=False)

print(results_df.to_string(index=False))

print("\n" + "="*60 + "\n")
print("Best Method:", results_df.iloc[0]['Method'])
print(f"Score: {results_df.iloc[0]['CV Score']:.4f}")
```

---

## Common Mistakes

### ❌ Mistake 1: Too Many Bins

```python
# WRONG: Creating too many bins
bins = pd.cut(data, bins=20)  # 20 bins for 100 samples!
# Result: Many bins with few samples, overfitting

# CORRECT: Reasonable number of bins
bins = pd.cut(data, bins=5)   # 5 bins is more reasonable
# Rule of thumb: n_bins ≈ √n_samples (or less)
```

### ❌ Mistake 2: Not Handling Bin Edges Properly

```python
import pandas as pd

data = [1, 2, 3, 4, 5]

# WRONG: Minimum value not included
bins = pd.cut(data, bins=[1, 3, 5])  # 1 is excluded!
# (1, 3], (3, 5]

# CORRECT: Use include_lowest=True
bins = pd.cut(data, bins=[1, 3, 5], include_lowest=True)
# [1, 3], (3, 5]
```

### ❌ Mistake 3: Discretizing Before Train-Test Split

```python
# WRONG: Discretize entire dataset
df['age_binned'] = pd.qcut(df['age'], q=4)
train, test = split(df)
# Information from test leaked into bins!

# CORRECT: Fit discretizer on train only
train, test = split(df)

# Get bin edges from training data
bin_edges = pd.qcut(train['age'], q=4, retbins=True)[1]

# Apply same edges to train and test
train['age_binned'] = pd.cut(train['age'], bins=bin_edges, include_lowest=True)
test['age_binned'] = pd.cut(test['age'], bins=bin_edges, include_lowest=True)
```

### ❌ Mistake 4: Ignoring Domain Knowledge

```python
# WRONG: Arbitrary bins for medical data
blood_pressure_bins = pd.cut(bp_data, bins=5)  # Random bins!

# CORRECT: Use clinical guidelines
bp_bins = [0, 120, 130, 140, 180, 300]
bp_labels = ['Normal', 'Elevated', 'Stage 1 HT', 'Stage 2 HT', 'Crisis']
blood_pressure_bins = pd.cut(bp_data, bins=bp_bins, labels=bp_labels)
```

### ❌ Mistake 5: Not Checking Bin Distribution

```python
# WRONG: Don't check if binning worked
bins = pd.cut(data, bins=5)

# CORRECT: Always check distribution
bins = pd.cut(data, bins=5)
print(bins.value_counts())  # Check if bins are reasonable
# Some bins might be empty or have too few samples!
```

---

## Best Practices

### ✅ Practice 1: Start Simple

```python
# Start with equal-frequency (often works well)
bins = pd.qcut(data, q=4)

# Check if it works
print(bins.value_counts())

# If not satisfactory, try other methods
```

### ✅ Practice 2: Visualize Bins

```python
import matplotlib.pyplot as plt

# Visualize binning result
plt.figure(figsize=(12, 4))

# Original distribution
plt.subplot(1, 2, 1)
plt.hist(data, bins=50, edgecolor='black')
plt.title('Original Distribution')

# Binned
plt.subplot(1, 2, 2)
bins = pd.qcut(data, q=5)
bins.value_counts().sort_index().plot(kind='bar')
plt.title('Bin Distribution')

plt.tight_layout()
```

### ✅ Practice 3: Use Pipelines

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import KBinsDiscretizer
from sklearn.ensemble import RandomForestClassifier

# Pipeline ensures no data leakage
pipeline = Pipeline([
    ('discretizer', KBinsDiscretizer(n_bins=5, encode='ordinal', strategy='quantile')),
    ('classifier', RandomForestClassifier())
])

pipeline.fit(X_train, y_train)
predictions = pipeline.predict(X_test)
```

---

## Interview Questions

### Q1: What is discretization and why would you use it?

**Answer:**

**Discretization** converts continuous variables into discrete categories (bins).

**Why use it:**

1. **Handle Non-Linearity**
   - Linear models can't capture step-wise relationships
   - Example: Credit risk high below 600, medium 600-700, low above 700

2. **Reduce Noise**
   - Smooth out minor fluctuations
   - Example: Age 25 vs 26 not meaningfully different

3. **Handle Outliers**
   - Extreme values capped in bins
   - Example: Income $10M treated same as $1M in "High" bin

4. **Interpretability**
   - Easier to explain "High risk" than "Score: 723.45"

5. **Business Requirements**
   - Often need categorical outputs
   - Example: "Which age group to target?"

**Trade-offs:**
- Lose precision (exact values → ranges)
- Arbitrary boundaries (where to split?)
- Information loss

### Q2: When would you use equal-width vs equal-frequency binning?

**Answer:**

**Equal-Width:**
- Bins have same range size
- Use when:
  - Data is uniformly distributed
  - Need interpretable bins (0-20, 20-40, 40-60...)
  - Quick exploratory analysis
- Problem: Skewed data → uneven bin counts

**Equal-Frequency (Quantile):**
- Bins have same number of samples
- Use when:
  - Data is skewed
  - Need balanced sample sizes
  - Ranking/percentile analysis
- Problem: Bin edges less interpretable

**Example:**
```python
Income data (right-skewed):
[30K, 35K, 40K, ..., 90K, 500K, 1M]  # Few high earners

Equal-Width:
  [30-340K]:  98 people  ← Most here
  [340-650K]:  1 person
  [650-1M]:    1 person
  Unbalanced!

Equal-Frequency:
  [30-42K]:   33 people  ← Balanced
  [42-65K]:   33 people
  [65-1M]:    34 people
  Better for analysis!
```

### Q3: What is K-Means binning and when is it useful?

**Answer:**

**K-Means binning** uses K-Means clustering to find optimal bin boundaries.

**How it works:**
1. Run K-Means on the feature
2. Each cluster becomes a bin
3. Boundaries between clusters = bin edges

**Advantages:**
- Data-driven (not arbitrary)
- Finds natural groupings
- Handles multi-modal distributions

**Example:**
```python
Customer ages: [25, 27, 28, ..., 45, 47, ..., 68, 70]
             Young professionals, Middle-aged, Seniors

K-Means finds these natural groups!
Bins align with data clusters, not arbitrary splits.
```

**When to use:**
- Data has natural clusters
- Want data-driven boundaries
- Distribution is multi-modal

**When NOT to use:**
- Need interpretable boundaries
- Domain knowledge exists (use custom bins)
- Supervised task (use decision tree binning)

### Q4: How do you prevent data leakage when discretizing?

**Answer:**

**Data leakage** occurs when test information influences training.

**Wrong:**
```python
# Fit discretizer on ALL data
discretizer.fit(X)  # Includes test data!
X_train, X_test = split(X)
```

**Correct:**
```python
# Split FIRST
X_train, X_test = split(X)

# Fit on train only
discretizer.fit(X_train)
X_train_binned = discretizer.transform(X_train)
X_test_binned = discretizer.transform(X_test)  # Use train stats
```

**For quantile binning:**
```python
# Get quantiles from TRAINING data only
bin_edges = pd.qcut(X_train['age'], q=4, retbins=True)[1]

# Apply to both
X_train['age_bin'] = pd.cut(X_train['age'], bins=bin_edges)
X_test['age_bin'] = pd.cut(X_test['age'], bins=bin_edges)
```

**Use Pipelines:**
```python
from sklearn.pipeline import Pipeline

pipeline = Pipeline([
    ('discretizer', KBinsDiscretizer()),
    ('model', RandomForestClassifier())
])

pipeline.fit(X_train, y_train)  # Fit discretizer on train only
```

### Q5: What's the difference between binning and encoding?

**Answer:**

**Binning** (Discretization):
- Continuous → Categorical
- Example: Age (25) → "Young"

**Encoding:**
- Categorical → Numerical
- Example: "Young" → [1, 0, 0]

**They're often used together:**
```python
Step 1: Binning
age (continuous) → age_group (categorical)
25 → "Young"

Step 2: Encoding
age_group (categorical) → encoded (numerical)
"Young" → [1, 0, 0]  (one-hot)

Complete pipeline:
age=25 → "Young" → [1, 0, 0]
```

**Example:**
```python
from sklearn.preprocessing import KBinsDiscretizer, OneHotEncoder

# Step 1: Discretize
discretizer = KBinsDiscretizer(n_bins=3, encode='ordinal')
age_binned = discretizer.fit_transform(age)
# 25 → 0 (first bin)

# Step 2: Encode
encoder = OneHotEncoder()
age_encoded = encoder.fit_transform(age_binned)
# 0 → [1, 0, 0]
```

**When to use both:**
- Start with continuous feature
- Want categorical representation for model
- Linear models benefit from one-hot encoded bins

---

## Summary

### Quick Reference

```
Equal-Width:
  pd.cut(data, bins=5)
  Equal range size
  Use: Uniform data

Equal-Frequency:
  pd.qcut(data, q=5)
  Equal sample count
  Use: Skewed data

Custom:
  pd.cut(data, bins=[0, 30, 60, 100])
  Domain-specific edges
  Use: Business rules exist

K-Means:
  KBinsDiscretizer(strategy='kmeans')
  Data-driven clusters
  Use: Natural groupings

Decision Tree:
  Fit tree, extract splits
  Supervised, optimal for target
  Use: Prediction tasks
```

### Decision Matrix

```
Data Type          → Method
═══════════════════════════════════
Uniform            → Equal-Width
Skewed             → Equal-Frequency
Natural clusters   → K-Means
With target        → Decision Tree
Domain knowledge   → Custom

Need balanced bins → Equal-Frequency
Need interpretable → Custom or Equal-Width
Need optimal       → Decision Tree
```

---

**Previous:** [← Feature Construction](./feature-construction.md)

**Return to:** [Feature Engineering Overview](./README.md)
