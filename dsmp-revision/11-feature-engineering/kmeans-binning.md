# K-Means Binning

## What You'll Learn

Discover how to let your data tell you where the bins should be. You'll learn to use K-Means clustering to find natural groupings in your data, creating bins that align with actual data patterns rather than arbitrary divisions.

## Understanding K-Means Binning

Use K-Means clustering to find optimal bin boundaries based on data distribution.

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

## Basic Implementation

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

## Real-World Example: Customer Age Segmentation

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

## Encoding Options

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

## When to Use K-Means Binning

Use K-Means binning when:
- Data has natural clusters
- Want data-driven boundaries
- Distribution is multi-modal
- Don't have domain knowledge for custom bins

Don't use when:
- Need interpretable boundaries
- Domain knowledge exists (use custom bins)
- Supervised task (use decision tree binning)
- Single mode distribution (other methods may be simpler)

## Quick Reference

```
K-Means binning:
  from sklearn.preprocessing import KBinsDiscretizer
  discretizer = KBinsDiscretizer(n_bins=3, strategy='kmeans')
  binned = discretizer.fit_transform(X)

Available strategies:
  'kmeans'   - K-Means clustering (data-driven)
  'uniform'  - Equal-width
  'quantile' - Equal-frequency

Encoding options:
  'ordinal'      - [0, 1, 2, ...]
  'onehot'       - [[1,0,0], [0,1,0], ...]
  'onehot-dense' - Same as onehot, dense array

Get bin edges:
  discretizer.bin_edges_

Advantages:
  - Data-driven
  - Finds natural groupings
  - Handles multi-modal data

Use when:
  - Natural clusters exist
  - Want automatic binning
```

---

**Related Topics:**
- [Decision Tree Binning](./decision-tree-binning.md) - Supervised approach
- [Equal-Frequency Binning](./equal-frequency-binning.md) - Alternative for skewed data

**Navigate:** [Feature Engineering Home](./README.md)
