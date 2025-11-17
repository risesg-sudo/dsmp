# Advanced Missing Value Techniques

## What You'll Learn

Beyond basic imputation methods, several advanced techniques can improve results in specific scenarios. Learn about indicator variables, time series methods, multiple imputation, and domain-specific approaches.

## 1. Indicator Variable Method

Add a binary column indicating whether a value was missing, preserving information about missingness.

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    'age': [25, np.nan, 35, 40, np.nan],
    'income': [50000, 60000, 55000, 70000, 65000]
})

print("Original Data:")
print(df)
print("\n" + "="*60 + "\n")

# Create indicator for missing age
df['age_was_missing'] = df['age'].isnull().astype(int)

# Impute missing values
df['age'].fillna(df['age'].median(), inplace=True)

print("With Missing Indicator:")
print(df)
print("\nBenefit: Model learns that missingness itself is informative")
```

### When Missingness is Informative (MNAR)

```python
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Example: Income missing for high earners (MNAR)
np.random.seed(42)
n = 1000

df = pd.DataFrame({
    'age': np.random.randint(25, 65, n),
    'income': np.random.randint(30000, 200000, n)
})

# High income people don't report
missing_prob = (df['income'] - 30000) / (200000 - 30000)
df.loc[np.random.random(n) < missing_prob * 0.4, 'income'] = np.nan

# Target: job satisfaction
df['satisfied'] = ((df['income'].fillna(df['income'].mean()) > 80000) & (df['age'] < 50)).astype(int)

# Method 1: Without indicator
df1 = df.copy()
df1['income'] = df1['income'].fillna(df1['income'].median())

X1 = df1[['age', 'income']]
y1 = df1['satisfied']
X_train, X_test, y_train, y_test = train_test_split(X1, y1, test_size=0.2)

model1 = RandomForestClassifier(random_state=42)
model1.fit(X_train, y_train)
acc1 = accuracy_score(y_test, model1.predict(X_test))

# Method 2: With indicator
df2 = df.copy()
df2['income_missing'] = df2['income'].isnull().astype(int)
df2['income'] = df2['income'].fillna(df2['income'].median())

X2 = df2[['age', 'income', 'income_missing']]
y2 = df2['satisfied']
X_train, X_test, y_train, y_test = train_test_split(X2, y2, test_size=0.2)

model2 = RandomForestClassifier(random_state=42)
model2.fit(X_train, y_train)
acc2 = accuracy_score(y_test, model2.predict(X_test))

print("Indicator Variable Impact:")
print(f"Without indicator: {acc1:.2%}")
print(f"With indicator:    {acc2:.2%}")
print(f"Improvement:       {(acc2-acc1):.2%}")
```

## 2. Forward Fill / Backward Fill (Time Series)

For time series data, use temporal methods.

```python
import pandas as pd
import numpy as np

# Time series data
df = pd.DataFrame({
    'date': pd.date_range('2024-01-01', periods=10),
    'temperature': [20, np.nan, np.nan, 23, 24, np.nan, 25, 26, np.nan, 27]
})

print("Original Time Series:")
print(df)
print("\n" + "="*60 + "\n")

# Forward fill (use previous value)
df['temp_ffill'] = df['temperature'].fillna(method='ffill')

# Backward fill (use next value)
df['temp_bfill'] = df['temperature'].fillna(method='bfill')

# Interpolation (linear)
df['temp_interpolate'] = df['temperature'].interpolate()

print("Different Fill Methods:")
print(df)

print("\nBest for Time Series:")
print("  - Forward fill: Real-time data, sensor readings")
print("  - Interpolation: Smooth variables (temperature, stock prices)")
print("  - Avoid backward fill in production (uses future data)")
```

## 3. Multiple Imputation

Create several imputed datasets, analyze each, then combine results.

```python
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
import pandas as pd
import numpy as np

def multiple_imputation(df, n_imputations=5, random_state=42):
    """
    Perform multiple imputation and return ensemble
    """
    imputed_dfs = []

    for i in range(n_imputations):
        imputer = IterativeImputer(
            max_iter=10,
            random_state=random_state + i
        )
        df_imputed = pd.DataFrame(
            imputer.fit_transform(df),
            columns=df.columns
        )
        imputed_dfs.append(df_imputed)

    # Average across all imputations
    df_final = pd.concat(imputed_dfs).groupby(level=0).mean()

    return df_final, imputed_dfs

# Example
np.random.seed(42)
df = pd.DataFrame({
    'age': [25, np.nan, 35, 40, np.nan, 28] * 5,
    'income': [50, 60, np.nan, 70, 55, np.nan] * 5
})

print("Original Data:")
print(df.head())
print(f"Missing: {df.isnull().sum().sum()}")
print("\n" + "="*60 + "\n")

df_final, all_imputations = multiple_imputation(df, n_imputations=5)

print("After Multiple Imputation (Average of 5):")
print(df_final.head())

print("\nVariance across imputations (uncertainty):")
print(pd.concat(all_imputations).groupby(level=0).std().head())

print("\nBenefit: Captures uncertainty in imputation")
```

## 4. Domain-Specific Imputation

Use domain knowledge for smarter imputation.

```python
import pandas as pd
import numpy as np

# E-commerce dataset
df = pd.DataFrame({
    'product_views': [10, 20, np.nan, 15, 0, np.nan] * 10,
    'cart_adds': [2, 5, np.nan, 3, 0, np.nan] * 10,
    'purchases': [1, 2, 0, 1, 0, 0] * 10,
    'revenue': [100, 200, 0, 150, 0, 0] * 10
})

print("Original E-commerce Data:")
print(df.head())
print("\n" + "="*60 + "\n")

# Domain knowledge: If purchases=0, likely views and cart_adds are also 0
mask = (df['purchases'] == 0) & (df['product_views'].isnull())
df.loc[mask, 'product_views'] = 0
df.loc[mask, 'cart_adds'] = 0

# For other missing values, use median
df.fillna(df.median(), inplace=True)

print("After Domain-Specific Imputation:")
print(df.head())

print("\nDomain Knowledge Examples:")
print("  - Zero purchases → zero views/adds")
print("  - Missing temperature → use season average")
print("  - Missing weekday sales → use day-of-week pattern")
```

## 5. Group-Based Imputation

Impute based on group statistics.

```python
import pandas as pd
import numpy as np

# Data with groups
np.random.seed(42)
df = pd.DataFrame({
    'department': ['Sales', 'IT', 'HR', 'Sales', 'IT', 'HR'] * 10,
    'salary': [50000, 80000, 45000, np.nan, 85000, np.nan] * 10,
    'experience': [3, 5, 2, 4, np.nan, 3] * 10
})

print("Original Data with Groups:")
print(df.head(12))
print("\n" + "="*60 + "\n")

# Group-based imputation
for col in ['salary', 'experience']:
    df[col] = df.groupby('department')[col].transform(
        lambda x: x.fillna(x.median())
    )

print("After Group-Based Imputation:")
print(df.head(12))
print("\nEach department uses its own median")
```

## 6. Model-Based Imputation

Train a model to predict missing values.

```python
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor

np.random.seed(42)
n = 200

# Generate data where age predicts income
age = np.random.randint(25, 65, n)
income = 30000 + age * 800 + np.random.randn(n) * 5000

df = pd.DataFrame({
    'age': age,
    'years_exp': age - 22 + np.random.randint(-2, 3, n),
    'income': income
})

# Create missing values
missing_idx = np.random.choice(df.index, 40, replace=False)
df.loc[missing_idx, 'income'] = np.nan

print(f"Dataset: {df.shape}, Missing income: {df['income'].isnull().sum()}")

# Model-based imputation
# Split into complete and incomplete
df_complete = df[df['income'].notna()]
df_incomplete = df[df['income'].isnull()]

# Train model on complete data
X_train = df_complete[['age', 'years_exp']]
y_train = df_complete['income']

model = RandomForestRegressor(n_estimators=50, random_state=42)
model.fit(X_train, y_train)

# Predict missing values
X_missing = df_incomplete[['age', 'years_exp']]
predicted_income = model.predict(X_missing)

# Fill missing values
df.loc[df['income'].isnull(), 'income'] = predicted_income

print("\nModel-based imputation complete!")
print(f"Remaining missing: {df['income'].isnull().sum()}")
```

## Comparison of Advanced Techniques

```python
techniques = {
    'Indicator Variable': {
        'when': 'Missingness is informative (MNAR)',
        'benefit': 'Preserves missingness information',
        'drawback': 'Adds extra columns'
    },
    'Forward/Backward Fill': {
        'when': 'Time series data',
        'benefit': 'Respects temporal order',
        'drawback': 'Can propagate errors'
    },
    'Multiple Imputation': {
        'when': 'High stakes decisions',
        'benefit': 'Captures uncertainty',
        'drawback': 'Computationally expensive'
    },
    'Domain-Specific': {
        'when': 'Strong domain knowledge',
        'benefit': 'Most accurate',
        'drawback': 'Requires expertise'
    },
    'Group-Based': {
        'when': 'Clear groups in data',
        'benefit': 'Respects group structure',
        'drawback': 'Small groups problematic'
    },
    'Model-Based': {
        'when': 'Strong predictive features',
        'benefit': 'Sophisticated relationships',
        'drawback': 'Risk of overfitting'
    }
}

print("ADVANCED TECHNIQUES COMPARISON")
print("="*70)
for technique, details in techniques.items():
    print(f"\n{technique}:")
    print(f"  When: {details['when']}")
    print(f"  ✓ {details['benefit']}")
    print(f"  ✗ {details['drawback']}")
```

## Summary

Advanced techniques provide specialized solutions for specific missing data scenarios:

**Key Takeaways:**
- Use indicator variables for MNAR data
- Use temporal methods for time series
- Use multiple imputation for uncertainty
- Apply domain knowledge when available
- Group-based for clustered data
- Model-based for complex relationships

---

**Navigation:**
- **Previous:** [← Iterative Imputer](./missing-iterative-imputer.md)
- **Next:** [Comparison Guide →](./missing-comparison.md)
- **Related:** [Best Practices](./missing-best-practices.md)
