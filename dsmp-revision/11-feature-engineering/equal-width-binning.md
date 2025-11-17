# Equal-Width Binning

## What You'll Learn

Master the simplest and most intuitive binning technique. You'll discover when equal-width binning excels, understand its limitations with skewed data, and learn to implement it effectively for exploratory analysis and feature engineering.

## Understanding Discretization

Converting continuous numerical variables into discrete categorical variables (bins or buckets) transforms data into more interpretable forms and can improve model performance.

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

## Why Discretize?

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

## Equal-Width Binning Concept

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

## Basic Implementation

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

## Real-World Example: Income Segmentation

```python
import pandas as pd
import numpy as np

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

## Custom Bin Edges

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

## When to Use Equal-Width Binning

Use equal-width binning when:
- Data is uniformly distributed
- Want interpretable, evenly-spaced bins
- Quick exploratory analysis
- Natural breakpoints don't exist

Don't use when:
- Data is skewed (bins will have very different counts)
- Need balanced bin sizes
- Outliers present (create wide bins with few samples)

## Quick Reference

```
Create equal-width bins:
  pd.cut(data, bins=5)

With custom labels:
  pd.cut(data, bins=5, labels=['Low', 'Med-Low', 'Med', 'Med-High', 'High'])

With custom edges:
  pd.cut(data, bins=[0, 30, 60, 100], labels=['Young', 'Middle', 'Senior'])

Always check distribution:
  binned_data.value_counts()

Key parameter:
  include_lowest=True  # Include minimum value in first bin
```

---

**Related Topics:**
- [Equal-Frequency Binning](./equal-frequency-binning.md) - Better for skewed data
- [Custom Binning](./custom-binning.md) - Domain-based approaches

**Navigate:** [Feature Engineering Home](./README.md)
