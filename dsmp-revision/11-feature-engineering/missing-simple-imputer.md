# SimpleImputer - Basic Missing Value Handling

## What You'll Learn

SimpleImputer is your starting point for handling missing data. It fills missing values with simple statistics: mean, median, mode, or a constant. While basic, it's fast, reliable, and often sufficient for MCAR data.

## The Concept

SimpleImputer replaces missing values with statistical measures calculated from the available data.

```
Strategy Options:
┌─────────────────────────────────────┐
│ mean     → Average of column        │
│ median   → Middle value             │
│ most_frequent → Mode (most common)  │
│ constant → Fixed value              │
└─────────────────────────────────────┘
```

## Basic Usage

```python
from sklearn.impute import SimpleImputer
import pandas as pd
import numpy as np

# Sample data with missing values
df = pd.DataFrame({
    'age': [25, np.nan, 35, 40, np.nan, 28, 45],
    'income': [50000, 60000, np.nan, 70000, 55000, np.nan, 65000],
    'city': ['NYC', 'LA', np.nan, 'Chicago', 'NYC', 'LA', np.nan]
})

print("Original Data:")
print(df)
print("\n" + "="*60 + "\n")

# Numerical columns - Mean imputation
num_imputer = SimpleImputer(strategy='mean')
df[['age', 'income']] = num_imputer.fit_transform(df[['age', 'income']])

# Categorical columns - Most frequent imputation
cat_imputer = SimpleImputer(strategy='most_frequent')
df[['city']] = cat_imputer.fit_transform(df[['city']])

print("After Imputation:")
print(df)

print("\n" + "="*60 + "\n")
print("Imputed Values:")
print(f"Age mean: {num_imputer.statistics_[0]:.2f}")
print(f"Income mean: {num_imputer.statistics_[1]:.2f}")
print(f"Most frequent city: {cat_imputer.statistics_[0]}")
```

## Strategy Comparison

### Mean Strategy

Best for normally distributed data without outliers.

```python
import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer

# Normal distribution data
df = pd.DataFrame({
    'test_scores': [85, 90, 88, np.nan, 92, 87, np.nan, 91, 86, 89]
})

imputer = SimpleImputer(strategy='mean')
df['scores_mean'] = imputer.fit_transform(df[['test_scores']])

print("Mean Imputation (Normal Distribution):")
print(df)
print(f"\nImputed value: {imputer.statistics_[0]:.2f}")
print("Use when: Data is normally distributed, no outliers")
```

### Median Strategy

Best for skewed data or data with outliers.

```python
# Skewed data with outlier
df = pd.DataFrame({
    'income': [50000, 55000, np.nan, 52000, 1000000, np.nan, 51000, 53000]
})

# Compare mean vs median
mean_imp = SimpleImputer(strategy='mean')
median_imp = SimpleImputer(strategy='median')

df['income_mean'] = mean_imp.fit_transform(df[['income']])
df['income_median'] = median_imp.fit_transform(df[['income']])

print("Mean vs Median (with Outlier):")
print(df)
print(f"\nMean: ${mean_imp.statistics_[0]:,.0f} (affected by $1M outlier)")
print(f"Median: ${median_imp.statistics_[0]:,.0f} (robust to outlier)")
print("\nUse median when: Data is skewed or has outliers")
```

### Most Frequent Strategy

Best for categorical variables.

```python
# Categorical data
df = pd.DataFrame({
    'city': ['NYC', 'NYC', np.nan, 'LA', 'NYC', np.nan, 'NYC', 'Chicago']
})

imputer = SimpleImputer(strategy='most_frequent')
df['city_imputed'] = imputer.fit_transform(df[['city']])

print("Most Frequent Imputation:")
print(df)
print(f"\nMost frequent: {imputer.statistics_[0]}")
print("Use when: Categorical variables")
```

### Constant Strategy

Best when you have domain knowledge.

```python
# Temperature sensor data
df = pd.DataFrame({
    'sensor_temp': [20.5, 21.0, np.nan, 20.8, np.nan, 21.2]
})

# Room temperature is typically ~20°C
imputer = SimpleImputer(strategy='constant', fill_value=20.0)
df['temp_imputed'] = imputer.fit_transform(df[['sensor_temp']])

print("Constant Imputation:")
print(df)
print(f"\nConstant value: 20.0°C")
print("Use when: You have domain knowledge about expected values")
```

## Real-World Example

```python
import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Create realistic customer dataset
np.random.seed(42)
n = 1000

df = pd.DataFrame({
    'age': np.random.randint(18, 80, n),
    'income': np.random.randint(20000, 150000, n),
    'credit_score': np.random.randint(300, 850, n),
    'years_customer': np.random.randint(0, 20, n),
    'purchased': np.random.binomial(1, 0.3, n)
})

# Introduce missing values (MCAR)
missing_rate = 0.15
for col in ['age', 'income', 'credit_score']:
    missing_idx = np.random.choice(df.index, int(len(df) * missing_rate), replace=False)
    df.loc[missing_idx, col] = np.nan

print("Dataset with Missing Values:")
print(df.head())
print(f"\nMissing values:\n{df.isnull().sum()}")

# Split data
X = df.drop('purchased', axis=1)
y = df['purchased']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Impute missing values
imputer = SimpleImputer(strategy='median')
X_train_imputed = pd.DataFrame(
    imputer.fit_transform(X_train),
    columns=X_train.columns,
    index=X_train.index
)
X_test_imputed = pd.DataFrame(
    imputer.transform(X_test),
    columns=X_test.columns,
    index=X_test.index
)

print(f"\nAfter Imputation:")
print(f"Training missing: {X_train_imputed.isnull().sum().sum()}")
print(f"Test missing: {X_test_imputed.isnull().sum().sum()}")

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train_imputed, y_train)

# Evaluate
predictions = model.predict(X_test_imputed)
accuracy = accuracy_score(y_test, predictions)

print(f"\nModel Accuracy: {accuracy:.2%}")
```

## When to Use Each Strategy

```python
strategy_guide = {
    'Mean': {
        'use_when': [
            'Data is normally distributed',
            'No outliers present',
            'Continuous numerical data',
            'Need interpretability'
        ],
        'examples': ['Test scores', 'Height', 'Temperature readings']
    },
    'Median': {
        'use_when': [
            'Data is skewed',
            'Outliers present',
            'Non-normal distribution',
            'Robust imputation needed'
        ],
        'examples': ['Income', 'House prices', 'Response times']
    },
    'Most Frequent': {
        'use_when': [
            'Categorical variables',
            'Discrete values',
            'Mode is meaningful',
            'Small number of categories'
        ],
        'examples': ['City', 'Gender', 'Product category']
    },
    'Constant': {
        'use_when': [
            'Domain knowledge available',
            'Specific default makes sense',
            'Missing indicates something',
            'Need explicit marker'
        ],
        'examples': ['Default settings', 'Baseline values', 'Zero for counts']
    }
}

print("STRATEGY SELECTION GUIDE")
print("="*70)
for strategy, details in strategy_guide.items():
    print(f"\n{strategy.upper()}:")
    print("  Use when:")
    for condition in details['use_when']:
        print(f"    - {condition}")
    print(f"  Examples: {', '.join(details['examples'])}")
```

## Advantages

```
✅ Simple and fast
✅ Works well for MCAR data
✅ Easy to understand and implement
✅ Maintains sample size
✅ No risk of data leakage
✅ Computationally efficient
✅ Good baseline method
```

## Disadvantages

```
❌ Reduces variance in data
❌ Can introduce bias
❌ Ignores relationships between features
❌ Not suitable for MAR/MNAR
❌ Doesn't capture uncertainty
❌ May not reflect true distribution
```

## Best Practices

### Always Split Before Imputing

```python
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer

# CORRECT: Split first
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Fit on training data only
imputer = SimpleImputer(strategy='mean')
X_train_imputed = imputer.fit_transform(X_train)
X_test_imputed = imputer.transform(X_test)  # Use training statistics

print("No data leakage! Test set statistics not used in training.")
```

### Use Pipelines

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

# Create pipeline
pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler()),
    ('classifier', RandomForestClassifier())
])

# Fit and predict
pipeline.fit(X_train, y_train)
predictions = pipeline.predict(X_test)

print("Pipeline ensures correct order and no leakage!")
```

## Summary

SimpleImputer is perfect for quick, reliable missing value handling, especially for MCAR data. While basic, it's often sufficient and serves as an excellent baseline.

**Key Takeaways:**
- Use mean for normal data, median for skewed data
- Use most_frequent for categorical variables
- Always split data before imputing
- Good for MCAR, limited for MAR/MNAR
- Fast and simple baseline method

---

**Navigation:**
- **Previous:** [← Types of Missing Data](./missing-types.md)
- **Next:** [KNN Imputer →](./missing-knn-imputer.md)
- **Related:** [Missing Data Comparison](./missing-comparison.md)
