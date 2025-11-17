# Handling Missing Values - Overview

## What You'll Learn

Missing data is one of the most common challenges in real-world datasets. Understanding why values are missing and how to handle them properly can significantly impact your model's performance. This guide introduces you to the fundamentals of missing data and its implications.

## Why Do Missing Values Matter?

Most machine learning algorithms cannot handle missing values (NaN). They either throw errors or silently produce incorrect results.

```
Problem:
┌────────────────────────────────┐
│  Most ML algorithms cannot     │
│  handle missing values (NaN)   │
└────────────────────────────────┘
         ↓
Solution:
┌────────────────────────────────┐
│  1. Remove missing data        │
│  2. Impute (fill) missing data │
└────────────────────────────────┘
```

## Visual Example

```
Original Dataset:
┌─────┬─────┬────────┬─────────┐
│ Age │ Inc │ City   │ Married │
├─────┼─────┼────────┼─────────┤
│ 25  │ 50k │ NYC    │ Yes     │
│ NaN │ 60k │ LA     │ No      │
│ 35  │ NaN │ NYC    │ Yes     │
│ 40  │ 70k │ NaN    │ No      │
│ NaN │ 55k │ Chicago│ NaN     │
└─────┴─────┴────────┴─────────┘

Missing Data Summary:
Age:     40% missing
Income:  20% missing
City:    20% missing
Married: 20% missing
```

## Analyzing Missing Data

```python
import pandas as pd
import numpy as np

# Create sample data with missing values
np.random.seed(42)
df = pd.DataFrame({
    'age': [25, np.nan, 35, 40, np.nan, 28, 45, np.nan],
    'income': [50000, 60000, np.nan, 70000, 55000, np.nan, 65000, 58000],
    'score': [85, 90, 88, np.nan, 92, 87, np.nan, 91]
})

print("Dataset Overview:")
print(df)
print("\n" + "="*60 + "\n")

# Missing data statistics
print("Missing Data Analysis:")
print("-" * 60)

missing_stats = pd.DataFrame({
    'Column': df.columns,
    'Missing_Count': df.isnull().sum(),
    'Missing_Percentage': (df.isnull().sum() / len(df) * 100).round(2),
    'Data_Type': df.dtypes
})

print(missing_stats.to_string(index=False))

print("\n" + "="*60 + "\n")

# Visualize missing data pattern
print("Missing Data Heatmap (0 = Present, 1 = Missing):")
print("-" * 60)
missing_matrix = df.isnull().astype(int)
print(missing_matrix)

# Calculate correlation between missingness
print("\n" + "="*60 + "\n")
print("Correlation of Missingness Patterns:")
print(missing_matrix.corr().round(2))
```

## Impact of Missing Data

Missing data affects your analysis in multiple ways:

### 1. Reduced Sample Size

```python
import pandas as pd
import numpy as np

np.random.seed(42)
df = pd.DataFrame({
    'feature1': [1, np.nan, 3, 4, np.nan] * 20,
    'feature2': [10, 20, np.nan, 40, 50] * 20
})

print(f"Original dataset: {len(df)} rows")
print(f"Complete cases: {df.dropna().shape[0]} rows")
print(f"Data lost: {(1 - df.dropna().shape[0]/len(df)) * 100:.1f}%")
```

### 2. Biased Results

If missingness is not random, dropping or imputing incorrectly introduces bias.

```python
# Example: Income missing for younger people
np.random.seed(42)
df = pd.DataFrame({
    'age': np.random.randint(20, 70, 1000)
})
df['income'] = 30000 + (df['age'] - 20) * 1000 + np.random.randn(1000) * 5000

# Income more likely missing for young people
missing_prob = 1 / (1 + np.exp((df['age'] - 30) / 5))
df.loc[np.random.random(1000) < missing_prob * 0.3, 'income'] = np.nan

print("Missing rate by age group:")
print(df.groupby(pd.cut(df['age'], bins=[0, 30, 40, 50, 100]))['income'].apply(
    lambda x: f"{x.isnull().mean():.2%}"
))

print("\nSimply dropping or mean-imputing will bias results!")
```

### 3. Loss of Information

Each missing value represents lost information that could improve predictions.

### 4. Computational Issues

Some algorithms crash or produce errors with missing data.

## Quick Diagnostic Function

```python
import pandas as pd
import numpy as np

def diagnose_missing_data(df):
    """
    Comprehensive missing data diagnostic
    """
    print("="*70)
    print("MISSING DATA DIAGNOSTIC REPORT")
    print("="*70)

    # Overall statistics
    total_cells = np.product(df.shape)
    total_missing = df.isnull().sum().sum()
    missing_pct = (total_missing / total_cells) * 100

    print(f"\nDataset Shape: {df.shape[0]} rows × {df.shape[1]} columns")
    print(f"Total Cells: {total_cells:,}")
    print(f"Missing Cells: {total_missing:,} ({missing_pct:.2f}%)")

    # Per-column analysis
    print("\n" + "-"*70)
    print("PER-COLUMN ANALYSIS")
    print("-"*70)

    missing_summary = pd.DataFrame({
        'Column': df.columns,
        'Missing_Count': df.isnull().sum(),
        'Missing_Pct': (df.isnull().sum() / len(df) * 100).round(2),
        'Dtype': df.dtypes,
        'Unique_Values': [df[col].nunique() for col in df.columns]
    })

    missing_summary = missing_summary[missing_summary['Missing_Count'] > 0]

    if len(missing_summary) == 0:
        print("No missing values found!")
    else:
        print(missing_summary.to_string(index=False))

    # Patterns
    print("\n" + "-"*70)
    print("MISSING DATA PATTERNS")
    print("-"*70)

    missing_counts = df.isnull().sum(axis=1).value_counts().sort_index()
    print("\nRows by number of missing values:")
    for n_missing, count in missing_counts.items():
        pct = (count / len(df)) * 100
        print(f"  {n_missing} missing: {count} rows ({pct:.1f}%)")

    # Recommendations
    print("\n" + "-"*70)
    print("RECOMMENDATIONS")
    print("-"*70)

    if len(missing_summary) > 0:
        for _, row in missing_summary.iterrows():
            col = row['Column']
            pct = row['Missing_Pct']

            if pct < 5:
                print(f"  {col}: {pct}% missing → Consider dropping rows")
            elif pct < 20:
                print(f"  {col}: {pct}% missing → Use imputation")
            else:
                print(f"  {col}: {pct}% missing → Investigate why! Consider dropping column")

# Example usage
np.random.seed(42)
df = pd.DataFrame({
    'age': [25, np.nan, 35, 40, np.nan, 28, 45, np.nan] * 10,
    'income': [50, 60, np.nan, 70, 55, np.nan, 65, 58] * 10,
    'city': ['NYC', 'LA', np.nan, 'Chicago', 'NYC', 'LA', np.nan, 'Houston'] * 10
})

diagnose_missing_data(df)
```

## Decision Framework: Handle or Impute?

```
How much data is missing?
│
├─ < 5% → DROP rows with missing values
│          (minimal information loss)
│
├─ 5-20% → IMPUTE missing values
│          (standard approach)
│
├─ 20-50% → INVESTIGATE why so much missing
│           Then decide: impute or drop column
│
└─ > 50% → Consider DROPPING the column
           (too much missing data)
```

## Missing Data Patterns

Understanding patterns helps choose the right imputation strategy.

```python
import pandas as pd
import numpy as np

# Example: Different missing patterns
np.random.seed(42)

# Pattern 1: Random missingness
df1 = pd.DataFrame({
    'feature': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
})
df1.loc[[1, 5, 8], 'feature'] = np.nan
print("Pattern 1: Random Missing (MCAR)")
print(df1)

# Pattern 2: Systematic missingness
df2 = pd.DataFrame({
    'age': [20, 25, 30, 35, 40, 45, 50, 55, 60, 65],
    'income': [30, 35, 40, 45, np.nan, np.nan, np.nan, np.nan, np.nan, np.nan]
})
print("\nPattern 2: Age-related Missing (MAR)")
print(df2)
print("Income missing for older people")

# Pattern 3: Self-censoring
df3 = pd.DataFrame({
    'reported_salary': [30000, 45000, 50000, np.nan, 55000, np.nan, 60000, np.nan]
})
print("\nPattern 3: High earners don't report (MNAR)")
print(df3)
print("Missing values are high salaries!")
```

## Summary

Missing data requires careful attention:

**Key Points:**
1. Missing data is common in real-world datasets
2. Can't ignore it - algorithms will fail or produce bad results
3. Must analyze WHY data is missing before deciding how to handle it
4. Different strategies work for different missing data types
5. Wrong handling can introduce bias

**Next Steps:**
- Learn about types of missing data (MCAR, MAR, MNAR)
- Understand different imputation methods
- Choose the right strategy for your data

---

**Navigation:**
- **Next:** [Types of Missing Data →](./missing-types.md)
- **Related:** [SimpleImputer Guide](./missing-simple-imputer.md)
- **Back to:** [Feature Engineering Index](./README.md)
