# Equal-Frequency Binning

## What You'll Learn

Discover the power of quantile-based binning for handling skewed data. You'll learn how to create balanced bins with equal sample counts, master percentile-based segmentation, and understand when this approach outperforms equal-width binning.

## Understanding Equal-Frequency Binning

Divide data so each bin has approximately equal number of observations, regardless of the range width.

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

## Implementation

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

## Real-World Example: Customer Spending Segmentation

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

## Custom Quantiles

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

## When to Use Equal-Frequency Binning

Use equal-frequency binning when:
- Data is skewed
- Want balanced sample sizes per bin
- Statistical analysis requires equal groups
- Ranking or percentile-based segmentation

Don't use when:
- Need interpretable bin edges
- Natural breakpoints exist
- Many duplicate values (can cause issues)

## Quick Reference

```
Create quartiles:
  pd.qcut(data, q=4)

With labels:
  pd.qcut(data, q=4, labels=['Q1', 'Q2', 'Q3', 'Q4'])

Custom percentiles:
  pd.qcut(data, q=[0, 0.25, 0.5, 0.75, 1.0])

Get bin edges:
  bins, edges = pd.qcut(data, q=4, retbins=True)

Handle duplicates:
  pd.qcut(data, q=4, duplicates='drop')

Why use:
  - Skewed data
  - Need balanced bins
  - Percentile-based analysis
```

---

**Related Topics:**
- [Equal-Width Binning](./equal-width-binning.md) - For uniform data
- [Custom Binning](./custom-binning.md) - Domain-driven approaches

**Navigate:** [Feature Engineering Home](./README.md)
