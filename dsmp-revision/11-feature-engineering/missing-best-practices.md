# Missing Values - Best Practices and Interview Guide

## What You'll Learn

Mastering missing value handling goes beyond knowing the techniques. Learn common mistakes to avoid, best practices to follow, and how to ace missing data interview questions.

## Common Mistakes

### Mistake 1: Imputing Before Train-Test Split

The most critical mistake causing data leakage.

```python
import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split

# WRONG: Imputing before split (DATA LEAKAGE!)
df = pd.DataFrame({
    'feature': [1, np.nan, 3, 4, np.nan, 6] * 20,
    'target': [0, 1, 0, 1, 0, 1] * 20
})

# DON'T DO THIS
imputer = SimpleImputer()
df['feature'] = imputer.fit_transform(df[['feature']])  # Uses ALL data
X_train, X_test = train_test_split(df, test_size=0.3)   # Then split

print("Problem: Test statistics leaked into training!")
print("This overestimates model performance.\n")

# CORRECT: Split first, then impute
df = pd.DataFrame({
    'feature': [1, np.nan, 3, 4, np.nan, 6] * 20,
    'target': [0, 1, 0, 1, 0, 1] * 20
})

X = df[['feature']]
y = df['target']

# Split first
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3)

# Fit on training, transform both
imputer = SimpleImputer()
X_train_imputed = imputer.fit_transform(X_train)  # Fit on train only
X_test_imputed = imputer.transform(X_test)        # Transform test

print("Correct: Encoder only sees training data!")
```

### Mistake 2: Using Mean for Skewed Data

```python
import pandas as pd
import numpy as np

# Income data (heavily right-skewed)
income = pd.DataFrame({
    'income': [30000, 35000, 40000, 32000, np.nan, 1000000, np.nan, 38000]
})

print("Original Data:")
print(income)
print(f"\nMean: ${income['income'].mean():,.0f}")
print(f"Median: ${income['income'].median():,.0f}")

# WRONG: Using mean for skewed data
from sklearn.impute import SimpleImputer
imputer_mean = SimpleImputer(strategy='mean')
income['income_mean'] = imputer_mean.fit_transform(income[['income']])

# CORRECT: Using median for skewed data
imputer_median = SimpleImputer(strategy='median')
income['income_median'] = imputer_median.fit_transform(income[['income']])

print("\nAfter Imputation:")
print(income)
print("\nMean heavily influenced by $1M outlier!")
print("Use median for skewed data.")
```

### Mistake 3: Not Handling Missing in Categorical Variables

```python
import pandas as pd
import numpy as np

# WRONG: Using mean for categorical
df = pd.DataFrame({
    'city': ['NYC', 'LA', np.nan, 'Chicago', np.nan, 'NYC']
})

# This will error!
try:
    from sklearn.impute import SimpleImputer
    imputer = SimpleImputer(strategy='mean')
    imputer.fit_transform(df)
except ValueError as e:
    print(f"Error: {e}\n")

# CORRECT: Use most_frequent for categorical
imputer = SimpleImputer(strategy='most_frequent')
df['city_imputed'] = imputer.fit_transform(df[['city']])
print("Corrected:")
print(df)
```

### Mistake 4: Ignoring Why Data is Missing

```python
# WRONG: Blindly imputing without understanding
survey_data = pd.DataFrame({
    'age': [25, 30, 35, 40, 45],
    'income': [50000, 60000, np.nan, np.nan, np.nan]
})

print("Survey Data:")
print(survey_data)
print("\nProblem: High earners refuse to answer (MNAR)")
print("Simply imputing with mean/median underestimates income!")
print("\nBETTER APPROACH:")
print("  1. Add indicator variable")
print("  2. Use domain knowledge")
print("  3. Model the missingness")

# Better approach
survey_data['income_refused'] = survey_data['income'].isnull().astype(int)
print("\nWith indicator variable:")
print(survey_data)
```

### Mistake 5: Not Scaling Before KNN

```python
import pandas as pd
import numpy as np
from sklearn.impute import KNNImputer
from sklearn.preprocessing import StandardScaler

df = pd.DataFrame({
    'age': [25, np.nan, 35, 40, np.nan],
    'income': [50000, 60000, np.nan, 70000, 55000]  # Much larger scale!
})

print("WRONG: KNN without scaling")
print("Problem: Income dominates distance calculation")

# CORRECT: Scale first
scaler = StandardScaler()
df_scaled = pd.DataFrame(
    scaler.fit_transform(df.fillna(0)),  # Temporary fill for scaling
    columns=df.columns
)
df_scaled[df.isnull()] = np.nan  # Restore NaN

imputer = KNNImputer(n_neighbors=2)
result_scaled = imputer.fit_transform(df_scaled)
result_final = scaler.inverse_transform(result_scaled)

print("\nCORRECT: Scale before KNN imputation")
```

## Best Practices

### Practice 1: Analyze Before Imputing

```python
import pandas as pd
import numpy as np

def analyze_missing_data(df):
    """
    Comprehensive missing data analysis before imputation
    """
    print("="*70)
    print("MISSING DATA ANALYSIS")
    print("="*70)

    # 1. Summary statistics
    missing_summary = pd.DataFrame({
        'Column': df.columns,
        'Missing_Count': df.isnull().sum(),
        'Missing_Percentage': (df.isnull().sum() / len(df) * 100).round(2),
        'Dtype': df.dtypes
    })
    missing_summary = missing_summary[missing_summary['Missing_Count'] > 0]

    print("\n1. Missing Value Summary:")
    if len(missing_summary) == 0:
        print("No missing values found!")
    else:
        print(missing_summary.to_string(index=False))

    # 2. Missing patterns
    print("\n2. Missing Data Patterns:")
    missing_patterns = df.isnull().sum(axis=1).value_counts().sort_index()
    for n_missing, count in missing_patterns.items():
        print(f"  {n_missing} missing values: {count} rows")

    # 3. Correlation of missingness
    if len(missing_summary) > 1:
        print("\n3. Correlation of Missingness:")
        missing_corr = df.isnull().corr()
        print(missing_corr.round(2))

    return missing_summary

# Example
np.random.seed(42)
df = pd.DataFrame({
    'age': [25, np.nan, 35, 40, np.nan] * 20,
    'income': [50000, 60000, np.nan, 70000, 55000] * 20,
    'score': [650, np.nan, 680, np.nan, 660] * 20
})

analyze_missing_data(df)
```

### Practice 2: Use Pipelines

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer, KNNImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier

# Define preprocessing for different column types
numeric_features = ['age', 'income', 'credit_score']
categorical_features = ['city', 'employment']

numeric_transformer = Pipeline(steps=[
    ('imputer', KNNImputer(n_neighbors=5)),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, categorical_features)
    ])

# Full pipeline
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier())
])

# Fit and predict (no leakage!)
pipeline.fit(X_train, y_train)
predictions = pipeline.predict(X_test)

print("Pipeline ensures no data leakage and reproducibility!")
```

### Practice 3: Document Imputation Choices

```python
import pandas as pd

# Keep track of imputation decisions
imputation_log = {
    'age': {
        'method': 'median',
        'reason': 'Right-skewed distribution',
        'missing_pct': 15.5,
        'imputed_value': 35
    },
    'income': {
        'method': 'KNN (k=5)',
        'reason': 'Strong correlation with age and employment',
        'missing_pct': 20.3,
        'imputed_value': 'varies'
    },
    'city': {
        'method': 'most_frequent',
        'reason': 'Categorical variable',
        'missing_pct': 8.2,
        'imputed_value': 'NYC'
    }
}

log_df = pd.DataFrame(imputation_log).T
print("Imputation Documentation:")
print("="*70)
print(log_df)
print("\nAlways document your decisions for reproducibility!")
```

## Interview Questions

### Q1: What are the three types of missing data mechanisms?

**Answer:**

**MCAR (Missing Completely At Random):**
- Missingness is completely random
- No relationship to any variables
- Example: Data lost due to system crash
- Can use any imputation method

**MAR (Missing At Random):**
- Missingness depends on observed data
- Can be predicted from other variables
- Example: Young people less likely to report income
- Use KNN or Iterative Imputer

**MNAR (Missing Not At Random):**
- Missingness depends on unobserved values
- Cannot be predicted from available data
- Example: High earners refuse to report income
- Requires domain knowledge, use indicator variables

### Q2: When would you use KNN Imputer over Simple Imputer?

**Answer:**

Use **KNN Imputer** when:
- Strong feature correlations exist
- MAR data (missingness depends on observed features)
- Dataset is small-medium (< 10,000 rows)
- Accuracy is prioritized over speed

Use **Simple Imputer** when:
- MCAR data (completely random)
- Large datasets (speed matters)
- Weak feature correlations
- Quick baseline needed

**Example:**
- Healthcare: vitals are correlated → KNN
- Survey: random non-responses → Simple

### Q3: How do you prevent data leakage when imputing?

**Answer:**

Data leakage occurs when information from test set influences training.

**Prevention:**
1. Split BEFORE imputing
2. Fit imputer on training data ONLY
3. Transform test data using training statistics
4. Use pipelines to ensure correct order

```python
# Correct approach
X_train, X_test, y_train, y_test = train_test_split(X, y)

imputer = SimpleImputer()
X_train_imputed = imputer.fit_transform(X_train)  # Fit on train
X_test_imputed = imputer.transform(X_test)  # Don't fit on test!
```

### Q4: What is Multiple Imputation and when is it useful?

**Answer:**

Multiple Imputation creates several imputed datasets, analyzes each separately, and combines results.

**Process:**
1. Impute missing values M times (e.g., M=5)
2. Train model on each imputed dataset
3. Combine predictions (average/vote)

**Benefits:**
- Captures uncertainty in imputation
- More robust than single imputation
- Better for MNAR data

**When to use:**
- High missing percentage (> 20%)
- Important decisions (medical, financial)
- When uncertainty matters

### Q5: How do you handle missing values in time series data?

**Answer:**

Time series requires special handling due to temporal dependency.

**Methods:**

**1. Forward Fill (ffill):**
```python
df['temperature'].fillna(method='ffill')
# Use last valid observation
```

**2. Backward Fill (bfill):**
```python
df['temperature'].fillna(method='bfill')
# Use next valid observation (avoid in production!)
```

**3. Interpolation:**
```python
df['temperature'].interpolate()  # Linear
df['temperature'].interpolate(method='polynomial', order=2)
```

**Best Practice:**
- Use forward fill for real-time data
- Use interpolation for smooth variables
- Avoid backward fill in production (uses future data)

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│           MISSING VALUE HANDLING CHEAT SHEET                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DECISION RULES:                                            │
│  • < 5% missing    → Drop rows                              │
│  • 5-20% missing   → Impute                                 │
│  • > 20% missing   → Investigate, possibly drop column      │
│                                                             │
│  METHOD SELECTION:                                          │
│  • MCAR           → SimpleImputer                           │
│  • MAR            → KNN or Iterative                        │
│  • MNAR           → Indicator + Imputation                  │
│                                                             │
│  DATA TYPE:                                                 │
│  • Normal dist    → Mean                                    │
│  • Skewed         → Median                                  │
│  • Categorical    → Most Frequent                           │
│  • Time Series    → Forward Fill / Interpolate              │
│                                                             │
│  DATASET SIZE:                                              │
│  • Small          → Any method                              │
│  • Large          → SimpleImputer (speed)                   │
│  • Correlated     → KNN or Iterative                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Summary

Handling missing values correctly requires:

1. **Always analyze** WHY data is missing
2. **Split data** BEFORE imputation
3. **Use appropriate** method based on data type
4. **Document** imputation decisions
5. **Consider adding** missing indicators
6. **Use pipelines** for reproducibility

**Golden Rules:**
- Investigate before imputing
- Split before imputing
- Match method to missing type
- Document everything
- Use pipelines

---

**Navigation:**
- **Previous:** [← Missing Data Comparison](./missing-comparison.md)
- **Related:** [Encoding Best Practices](./encoding-best-practices.md)
- **Back to:** [Feature Engineering Index](./README.md)
