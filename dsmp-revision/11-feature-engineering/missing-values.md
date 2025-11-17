# Handling Missing Values - Complete Guide

## Table of Contents
1. [Understanding Missing Data](#understanding-missing-data)
2. [Types of Missing Data](#types-of-missing-data)
3. [SimpleImputer](#simpleimputer)
4. [KNN Imputer](#knn-imputer)
5. [Iterative Imputer](#iterative-imputer)
6. [Advanced Techniques](#advanced-techniques)
7. [Comparison and Selection](#comparison-and-selection)
8. [Common Mistakes](#common-mistakes)
9. [Interview Questions](#interview-questions)

---

## Understanding Missing Data

### Why Do Missing Values Matter?

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

### Visual Example

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

### Impact of Missing Data

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

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

---

## Types of Missing Data

### 1. MCAR (Missing Completely At Random)

**Definition**: Missingness is completely random and independent of any data.

```
Example: Survey responses lost due to technical glitch
┌─────────────────────────────────────┐
│  Missing Age values are random,     │
│  not related to Age itself or       │
│  any other variable                 │
└─────────────────────────────────────┘

Visual:
Age: [25, NaN, 35, NaN, 45, 28, NaN]
     Random pattern - no bias
```

**Characteristics:**
- No systematic pattern
- Missing values don't depend on observed or unobserved data
- Least problematic type
- Can be handled with simple imputation

**Test for MCAR:**
```python
import pandas as pd
import numpy as np
from scipy import stats

def test_mcar(df, col_with_missing, other_col):
    """
    Test if missing values in one column are related to another column
    """
    # Create binary indicator for missingness
    df['is_missing'] = df[col_with_missing].isnull().astype(int)

    # Compare distribution of other_col for missing vs non-missing
    missing_group = df[df['is_missing'] == 1][other_col].dropna()
    present_group = df[df['is_missing'] == 0][other_col].dropna()

    # T-test to check if means are different
    t_stat, p_value = stats.ttest_ind(missing_group, present_group)

    print(f"Testing MCAR for '{col_with_missing}' against '{other_col}'")
    print(f"Missing group mean: {missing_group.mean():.2f}")
    print(f"Present group mean: {present_group.mean():.2f}")
    print(f"P-value: {p_value:.4f}")

    if p_value > 0.05:
        print("✓ Likely MCAR (no significant difference)")
    else:
        print("✗ Not MCAR (significant difference detected)")

    return p_value

# Example
df = pd.DataFrame({
    'age': [25, np.nan, 35, 40, np.nan, 28, 45, 50],
    'income': [50000, 60000, 55000, 70000, 65000, 58000, 72000, 68000]
})

p_val = test_mcar(df, 'age', 'income')
```

### 2. MAR (Missing At Random)

**Definition**: Missingness depends on observed data, but not on the missing values themselves.

```
Example: Young people less likely to report income
┌─────────────────────────────────────┐
│  Income missing for people under 30 │
│  (related to Age, which we observe) │
└─────────────────────────────────────┘

Visual:
Age:    [25, 28, 35, 40, 45]
Income: [NaN, NaN, 55k, 70k, 65k]
        Missing depends on Age!
```

**Characteristics:**
- Missingness can be explained by other variables
- Can be predicted from observed data
- Requires advanced imputation (KNN, Iterative)

**Example:**
```python
import pandas as pd
import numpy as np

# MAR example: Income missing for younger people
np.random.seed(42)
n = 1000

df = pd.DataFrame({
    'age': np.random.randint(20, 70, n),
    'income': np.random.randint(30000, 150000, n)
})

# Income more likely to be missing for younger people
missing_prob = 1 / (1 + np.exp((df['age'] - 30) / 5))  # Sigmoid
df.loc[np.random.random(n) < missing_prob, 'income'] = np.nan

print("MAR Pattern Analysis:")
print("="*60)
print(f"Overall missing rate: {df['income'].isnull().mean():.2%}")
print(f"\nMissing rate by age group:")
print(df.groupby(pd.cut(df['age'], bins=[0, 30, 40, 50, 100]))['income'].apply(
    lambda x: x.isnull().mean()
))

# Visualize
import matplotlib.pyplot as plt
fig, axes = plt.subplots(1, 2, figsize=(12, 4))

# Distribution of age for missing vs non-missing income
df['income_missing'] = df['income'].isnull()
df[df['income_missing'] == True]['age'].hist(ax=axes[0], bins=20, alpha=0.7, label='Missing')
df[df['income_missing'] == False]['age'].hist(ax=axes[0], bins=20, alpha=0.7, label='Not Missing')
axes[0].set_xlabel('Age')
axes[0].set_ylabel('Frequency')
axes[0].set_title('Age Distribution by Income Missingness')
axes[0].legend()

# Missing rate by age
age_bins = pd.cut(df['age'], bins=10)
missing_rate = df.groupby(age_bins)['income'].apply(lambda x: x.isnull().mean())
missing_rate.plot(kind='bar', ax=axes[1])
axes[1].set_xlabel('Age Group')
axes[1].set_ylabel('Missing Rate')
axes[1].set_title('Income Missing Rate by Age')

plt.tight_layout()
```

### 3. MNAR (Missing Not At Random)

**Definition**: Missingness depends on the unobserved values themselves.

```
Example: High earners refuse to report income
┌─────────────────────────────────────┐
│  Income missing because it's high   │
│  (depends on Income itself)         │
└─────────────────────────────────────┘

Visual:
Income: [50k, NaN, 45k, NaN, 48k, NaN]
        Missing values are high incomes!
        Can't predict from other variables
```

**Characteristics:**
- Most problematic type
- Can't be predicted from observed data
- Requires domain knowledge
- May need to model the missingness

**Example:**
```python
import pandas as pd
import numpy as np

# MNAR example: High income people don't report
np.random.seed(42)
n = 1000

df = pd.DataFrame({
    'age': np.random.randint(20, 70, n),
    'income': np.random.randint(30000, 200000, n)
})

# High earners more likely to have missing income
missing_prob = (df['income'] - df['income'].min()) / (df['income'].max() - df['income'].min())
df.loc[np.random.random(n) < missing_prob * 0.5, 'income'] = np.nan

print("MNAR Pattern Analysis:")
print("="*60)

# Can't directly verify MNAR (data is missing!)
# But we can compare available data
print(f"Overall missing rate: {df['income'].isnull().mean():.2%}")

# Check if age predicts missingness
print("\nDoes age predict missingness?")
print(df.groupby(pd.cut(df['age'], bins=5))['income'].apply(
    lambda x: x.isnull().mean()
))
# Similar rates suggest age doesn't predict it
# But we know high income causes it (MNAR)
```

### Comparison Table

```
┌──────────┬─────────────────────┬──────────────────────┬─────────────────────┐
│ Type     │ Definition          │ Can Predict?         │ Best Approach       │
├──────────┼─────────────────────┼──────────────────────┼─────────────────────┤
│ MCAR     │ Completely random   │ No need              │ Any imputation      │
│          │                     │                      │ Simple methods OK   │
├──────────┼─────────────────────┼──────────────────────┼─────────────────────┤
│ MAR      │ Depends on observed │ Yes, from other vars │ KNN, Iterative      │
│          │ data                │                      │ Multiple imputation │
├──────────┼─────────────────────┼──────────────────────┼─────────────────────┤
│ MNAR     │ Depends on missing  │ No                   │ Domain knowledge    │
│          │ values themselves   │                      │ Model missingness   │
└──────────┴─────────────────────┴──────────────────────┴─────────────────────┘
```

---

## SimpleImputer

### Overview

SimpleImputer fills missing values with simple statistics: mean, median, mode, or constant.

```
Strategy Options:
┌─────────────────────────────────────┐
│ mean     → Average of column        │
│ median   → Middle value             │
│ most_frequent → Mode (most common)  │
│ constant → Fixed value              │
└─────────────────────────────────────┘
```

### Implementation

#### Basic Usage

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

### Different Strategies

```python
import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer

# Create dataset
np.random.seed(42)
df = pd.DataFrame({
    'salary': [50000, 60000, np.nan, 70000, 55000, np.nan, 65000, 58000, np.nan, 62000]
})

print("Original Data:")
print(df['salary'])
print(f"Missing: {df['salary'].isnull().sum()} values")
print("\n" + "="*60 + "\n")

# Strategy 1: Mean
imputer_mean = SimpleImputer(strategy='mean')
df['salary_mean'] = imputer_mean.fit_transform(df[['salary']])

# Strategy 2: Median
imputer_median = SimpleImputer(strategy='median')
df['salary_median'] = imputer_median.fit_transform(df[['salary']])

# Strategy 3: Constant
imputer_constant = SimpleImputer(strategy='constant', fill_value=50000)
df['salary_constant'] = imputer_constant.fit_transform(df[['salary']])

print("Comparison of Strategies:")
print(df)
print("\n" + "="*60 + "\n")

print("Statistics:")
print(f"Mean:     {imputer_mean.statistics_[0]:,.2f}")
print(f"Median:   {imputer_median.statistics_[0]:,.2f}")
print(f"Constant: 50,000.00")
```

### Real-World Example: Customer Data

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
print("="*60)
print(df.head(10))
print("\n" + "="*60 + "\n")

print("Missing Value Summary:")
print(df.isnull().sum())
print("\n" + "="*60 + "\n")

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

print("After Imputation:")
print("Training set missing values:", X_train_imputed.isnull().sum().sum())
print("Test set missing values:", X_test_imputed.isnull().sum().sum())

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train_imputed, y_train)

# Evaluate
predictions = model.predict(X_test_imputed)
accuracy = accuracy_score(y_test, predictions)

print(f"\nModel Accuracy: {accuracy:.2%}")
print("\nImputed Statistics:")
for i, col in enumerate(X_train.columns):
    print(f"{col}: {imputer.statistics_[i]:.2f}")
```

### When to Use Each Strategy

```python
import pandas as pd
import numpy as np

# Demonstration of when to use different strategies

# 1. Mean - Normal distribution, no outliers
normal_data = pd.DataFrame({
    'test_scores': [85, 90, 88, np.nan, 92, 87, np.nan, 91, 86, 89]
})

# 2. Median - Skewed distribution or outliers present
income_data = pd.DataFrame({
    'income': [50000, 55000, np.nan, 52000, 1000000, np.nan, 51000, 53000]  # One outlier
})

# 3. Most Frequent - Categorical data
category_data = pd.DataFrame({
    'city': ['NYC', 'NYC', np.nan, 'LA', 'NYC', np.nan, 'NYC', 'Chicago']
})

# 4. Constant - Domain knowledge suggests specific value
temperature_data = pd.DataFrame({
    'sensor_temp': [20.5, 21.0, np.nan, 20.8, np.nan, 21.2]  # Room temp ≈ 20°C
})

print("STRATEGY SELECTION GUIDE")
print("="*60)

# Mean
print("\n1. MEAN - Use for normally distributed data without outliers")
print("   Example: Test scores")
print("   Mean:", normal_data['test_scores'].mean())
print("   Median:", normal_data['test_scores'].median())
print("   → Mean and median are close, use mean")

# Median
print("\n2. MEDIAN - Use for skewed data or with outliers")
print("   Example: Income (with $1M outlier)")
print("   Mean:", income_data['income'].mean())
print("   Median:", income_data['income'].median())
print("   → Mean heavily affected by outlier, use median")

# Most Frequent
print("\n3. MOST FREQUENT - Use for categorical variables")
print("   Example: City")
print("   Mode:", category_data['city'].mode()[0])
print("   → Use most frequent category")

# Constant
print("\n4. CONSTANT - Use when you have domain knowledge")
print("   Example: Temperature sensor (failed sensors read ~20°C)")
print("   → Use domain-specific constant")
```

### Advantages & Disadvantages

**Advantages:**
✅ Simple and fast
✅ Works well for MCAR data
✅ Easy to understand and implement
✅ Maintains sample size

**Disadvantages:**
❌ Reduces variance
❌ Can introduce bias
❌ Ignores relationships between features
❌ Not suitable for MAR/MNAR

---

## KNN Imputer

### Concept

KNN Imputer fills missing values using K-Nearest Neighbors. It finds similar rows and uses their values.

```
How KNN Imputation Works:
────────────────────────────────────

Step 1: Find K nearest neighbors
        (based on complete features)

Row with missing Age:
[?, 50000, 700]  ← Need to impute age
    ↓
Find similar rows based on Income & Credit Score:
[25, 48000, 680]  ← Neighbor 1
[30, 52000, 720]  ← Neighbor 2
[28, 51000, 710]  ← Neighbor 3

Step 2: Average their values
Imputed Age = (25 + 30 + 28) / 3 = 27.67
```

### Implementation

```python
from sklearn.impute import KNNImputer
import pandas as pd
import numpy as np

# Sample data
df = pd.DataFrame({
    'age': [25, np.nan, 35, 40, np.nan, 28],
    'income': [50000, 60000, 55000, 70000, 58000, 52000],
    'credit_score': [650, 700, 680, 750, 690, 660]
})

print("Original Data:")
print(df)
print("\n" + "="*60 + "\n")

# KNN Imputation
imputer = KNNImputer(n_neighbors=3)
df_imputed = pd.DataFrame(
    imputer.fit_transform(df),
    columns=df.columns
)

print("After KNN Imputation (k=3):")
print(df_imputed)

# Show which neighbors were used
print("\n" + "="*60 + "\n")
print("Explanation:")
print("Row 1 had missing age. Its nearest neighbors based on income & credit_score:")
print("- Row 0: age=25, income=50000, credit_score=650")
print("- Row 5: age=28, income=52000, credit_score=660")
print("- Row 2: age=35, income=55000, credit_score=680")
print(f"Imputed age ≈ {df_imputed.loc[1, 'age']:.2f}")
```

### Choosing K Value

```python
import pandas as pd
import numpy as np
from sklearn.impute import KNNImputer
import matplotlib.pyplot as plt

# Create dataset with known values
np.random.seed(42)
n = 100
df_complete = pd.DataFrame({
    'age': np.random.randint(20, 70, n),
    'income': np.random.randint(30000, 150000, n),
    'score': np.random.randint(300, 850, n)
})

# Randomly remove some values
df_missing = df_complete.copy()
missing_indices = np.random.choice(df_missing.index, 20, replace=False)
true_values = df_missing.loc[missing_indices, 'age'].copy()
df_missing.loc[missing_indices, 'age'] = np.nan

# Test different K values
k_values = [1, 3, 5, 7, 10, 15, 20]
errors = []

for k in k_values:
    imputer = KNNImputer(n_neighbors=k)
    df_imputed = pd.DataFrame(
        imputer.fit_transform(df_missing),
        columns=df_missing.columns
    )

    # Calculate error
    imputed_values = df_imputed.loc[missing_indices, 'age']
    error = np.mean(np.abs(imputed_values - true_values))
    errors.append(error)

    print(f"K={k:2d}: Mean Absolute Error = {error:.2f}")

print("\n" + "="*60 + "\n")
print(f"Best K value: {k_values[np.argmin(errors)]}")

# Visualize
plt.figure(figsize=(10, 6))
plt.plot(k_values, errors, marker='o', linewidth=2, markersize=8)
plt.xlabel('K Value', fontsize=12)
plt.ylabel('Mean Absolute Error', fontsize=12)
plt.title('KNN Imputer: Error vs K Value', fontsize=14)
plt.grid(True, alpha=0.3)
plt.axvline(k_values[np.argmin(errors)], color='red', linestyle='--', label='Best K')
plt.legend()
```

### Real-World Example: Healthcare Data

```python
import pandas as pd
import numpy as np
from sklearn.impute import KNNImputer, SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# Create healthcare dataset
np.random.seed(42)
n = 500

# Generate correlated features
age = np.random.randint(20, 80, n)
bmi = 18 + (age - 20) * 0.15 + np.random.randn(n) * 3  # BMI correlates with age
blood_pressure = 110 + (age - 20) * 0.5 + np.random.randn(n) * 10

df = pd.DataFrame({
    'age': age,
    'bmi': bmi,
    'blood_pressure': blood_pressure,
    'cholesterol': np.random.randint(150, 300, n),
    'has_disease': (age > 50).astype(int) & (bmi > 25).astype(int) | (blood_pressure > 140).astype(int)
})

# Introduce MAR missing values (BP missing for older people)
missing_prob_bp = 1 / (1 + np.exp((50 - age) / 10))
df.loc[np.random.random(n) < missing_prob_bp * 0.3, 'blood_pressure'] = np.nan

# Random missing values in other columns
for col in ['age', 'bmi', 'cholesterol']:
    missing_idx = np.random.choice(df.index, int(n * 0.1), replace=False)
    df.loc[missing_idx, col] = np.nan

print("Healthcare Dataset with Missing Values:")
print("="*60)
print(df.head(10))
print("\n" + "="*60 + "\n")

print("Missing Value Summary:")
missing_summary = pd.DataFrame({
    'Column': df.columns,
    'Missing': df.isnull().sum(),
    'Percentage': (df.isnull().sum() / len(df) * 100).round(2)
})
print(missing_summary.to_string(index=False))

# Compare Simple vs KNN Imputation
X = df.drop('has_disease', axis=1)
y = df['has_disease']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Method 1: Simple Imputation
simple_imputer = SimpleImputer(strategy='mean')
X_train_simple = pd.DataFrame(
    simple_imputer.fit_transform(X_train),
    columns=X_train.columns
)
X_test_simple = pd.DataFrame(
    simple_imputer.transform(X_test),
    columns=X_test.columns
)

model_simple = RandomForestClassifier(n_estimators=100, random_state=42)
model_simple.fit(X_train_simple, y_train)
acc_simple = accuracy_score(y_test, model_simple.predict(X_test_simple))

# Method 2: KNN Imputation
knn_imputer = KNNImputer(n_neighbors=5)
X_train_knn = pd.DataFrame(
    knn_imputer.fit_transform(X_train),
    columns=X_train.columns
)
X_test_knn = pd.DataFrame(
    knn_imputer.transform(X_test),
    columns=X_test.columns
)

model_knn = RandomForestClassifier(n_estimators=100, random_state=42)
model_knn.fit(X_train_knn, y_train)
acc_knn = accuracy_score(y_test, model_knn.predict(X_test_knn))

print("\n" + "="*60 + "\n")
print("COMPARISON: Simple vs KNN Imputation")
print("="*60)
print(f"Simple Imputer Accuracy: {acc_simple:.2%}")
print(f"KNN Imputer Accuracy:    {acc_knn:.2%}")
print(f"Improvement:             {(acc_knn - acc_simple):.2%}")
```

### Advantages & Disadvantages

**Advantages:**
✅ Captures relationships between features
✅ Better for MAR data
✅ More sophisticated than mean/median
✅ Can handle multiple missing values

**Disadvantages:**
❌ Computationally expensive (slow for large datasets)
❌ Sensitive to outliers
❌ Requires scaling of features
❌ Curse of dimensionality with many features

### When to Use
- **Data Type**: MAR (Missing At Random)
- **Data Size**: Small to medium datasets
- **Feature Relationships**: Strong correlations exist
- **Use Cases**: Healthcare, customer data with related features

---

## Iterative Imputer

### Concept

Iterative Imputer (MICE - Multiple Imputation by Chained Equations) models each feature with missing values as a function of other features.

```
How Iterative Imputation Works:
────────────────────────────────

Iteration 1:
Age = f(Income, Score)     ← Predict missing Age
Income = f(Age, Score)     ← Predict missing Income
Score = f(Age, Income)     ← Predict missing Score

Iteration 2:
Use updated values to improve predictions

Iteration 3:
Continue until convergence

Result: Better estimates that capture complex relationships
```

### Implementation

```python
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
import pandas as pd
import numpy as np

# Sample data with missing values
np.random.seed(42)
df = pd.DataFrame({
    'age': [25, np.nan, 35, 40, np.nan, 28, 45, np.nan],
    'income': [50000, 60000, np.nan, 70000, 55000, np.nan, 65000, 58000],
    'credit_score': [650, np.nan, 680, 750, np.nan, 660, 720, np.nan]
})

print("Original Data:")
print(df)
print("\n" + "="*60 + "\n")

# Iterative Imputation
iterative_imputer = IterativeImputer(
    max_iter=10,
    random_state=42,
    verbose=0
)

df_imputed = pd.DataFrame(
    iterative_imputer.fit_transform(df),
    columns=df.columns
)

print("After Iterative Imputation:")
print(df_imputed)

# Compare with SimpleImputer
from sklearn.impute import SimpleImputer

simple_imputer = SimpleImputer(strategy='mean')
df_simple = pd.DataFrame(
    simple_imputer.fit_transform(df),
    columns=df.columns
)

print("\n" + "="*60 + "\n")
print("Comparison: Iterative vs Simple")
print("="*60)

comparison = pd.DataFrame({
    'Original': df['age'],
    'Iterative': df_imputed['age'],
    'Simple (Mean)': df_simple['age']
})
print(comparison)
```

### Advanced Configuration

```python
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import BayesianRidge
import pandas as pd
import numpy as np

# Create dataset with complex relationships
np.random.seed(42)
n = 100

# Generate correlated features
age = np.random.randint(20, 70, n)
income = 20000 + age * 1000 + np.random.randn(n) * 5000
savings = income * 0.1 * (age / 50) + np.random.randn(n) * 5000
credit = 300 + income * 0.003 + savings * 0.001 + np.random.randn(n) * 50

df = pd.DataFrame({
    'age': age,
    'income': income,
    'savings': savings,
    'credit_score': credit
})

# Introduce missing values
for col in df.columns:
    missing_idx = np.random.choice(df.index, 15, replace=False)
    df.loc[missing_idx, col] = np.nan

print("Dataset with Missing Values:")
print(df.head(10))
print("\nMissing per column:")
print(df.isnull().sum())
print("\n" + "="*60 + "\n")

# Method 1: Default (BayesianRidge)
imputer_default = IterativeImputer(random_state=42)
df_default = pd.DataFrame(
    imputer_default.fit_transform(df),
    columns=df.columns
)

# Method 2: Random Forest estimator
imputer_rf = IterativeImputer(
    estimator=RandomForestRegressor(n_estimators=10, random_state=42),
    random_state=42
)
df_rf = pd.DataFrame(
    imputer_rf.fit_transform(df),
    columns=df.columns
)

# Method 3: With parameters
imputer_custom = IterativeImputer(
    max_iter=20,                    # More iterations
    tol=1e-4,                       # Convergence threshold
    imputation_order='ascending',   # Order of imputation
    random_state=42
)
df_custom = pd.DataFrame(
    imputer_custom.fit_transform(df),
    columns=df.columns
)

print("Different Estimators Comparison:")
print("="*60)
print(f"Method 1 (Bayesian): {df_default.head(3)['income'].values}")
print(f"Method 2 (RF):       {df_rf.head(3)['income'].values}")
print(f"Method 3 (Custom):   {df_custom.head(3)['income'].values}")
```

### Real-World Example: Financial Data

```python
import pandas as pd
import numpy as np
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer, SimpleImputer, KNNImputer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score, roc_auc_score

# Generate realistic financial data with relationships
np.random.seed(42)
n = 1000

age = np.random.randint(22, 70, n)
income = 25000 + (age - 22) * 1500 + np.random.randn(n) * 15000
years_employed = np.minimum(age - 22, np.random.randint(0, 30, n))
debt = income * np.random.uniform(0.1, 0.5, n)
monthly_payment = debt * 0.05 + np.random.randn(n) * 100

df = pd.DataFrame({
    'age': age,
    'annual_income': income,
    'years_employed': years_employed,
    'total_debt': debt,
    'monthly_payment': monthly_payment
})

# Create target: loan default
default_prob = 1 / (1 + np.exp(-(
    (debt / income - 0.3) * 10 +
    (45 - age) * 0.05 +
    (5 - years_employed) * 0.1
)))
df['defaulted'] = (np.random.random(n) < default_prob).astype(int)

# Introduce MAR missing values
# Income missing for younger people
missing_income = 1 / (1 + np.exp((age - 30) / 5))
df.loc[np.random.random(n) < missing_income * 0.2, 'annual_income'] = np.nan

# Employment missing randomly
missing_idx = np.random.choice(df.index, int(n * 0.15), replace=False)
df.loc[missing_idx, 'years_employed'] = np.nan

# Monthly payment missing when debt is missing
missing_debt = np.random.choice(df.index, int(n * 0.1), replace=False)
df.loc[missing_debt, 'total_debt'] = np.nan
df.loc[missing_debt, 'monthly_payment'] = np.nan

print("Financial Dataset:")
print("="*60)
print(df.head(10))
print("\n" + "="*60 + "\n")

print("Missing Value Analysis:")
print(df.isnull().sum())
print(f"\nDefault Rate: {df['defaulted'].mean():.2%}")

# Prepare data
X = df.drop('defaulted', axis=1)
y = df['defaulted']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Compare imputation methods
results = {}

# 1. Simple Imputation
simple_imp = SimpleImputer(strategy='median')
X_train_simple = simple_imp.fit_transform(X_train)
X_test_simple = simple_imp.transform(X_test)

model = GradientBoostingClassifier(random_state=42)
model.fit(X_train_simple, y_train)
y_pred = model.predict(X_test_simple)
results['Simple (Median)'] = {
    'accuracy': accuracy_score(y_test, y_pred),
    'auc': roc_auc_score(y_test, model.predict_proba(X_test_simple)[:, 1])
}

# 2. KNN Imputation
knn_imp = KNNImputer(n_neighbors=5)
X_train_knn = knn_imp.fit_transform(X_train)
X_test_knn = knn_imp.transform(X_test)

model = GradientBoostingClassifier(random_state=42)
model.fit(X_train_knn, y_train)
y_pred = model.predict(X_test_knn)
results['KNN (k=5)'] = {
    'accuracy': accuracy_score(y_test, y_pred),
    'auc': roc_auc_score(y_test, model.predict_proba(X_test_knn)[:, 1])
}

# 3. Iterative Imputation
iter_imp = IterativeImputer(max_iter=10, random_state=42)
X_train_iter = iter_imp.fit_transform(X_train)
X_test_iter = iter_imp.transform(X_test)

model = GradientBoostingClassifier(random_state=42)
model.fit(X_train_iter, y_train)
y_pred = model.predict(X_test_iter)
results['Iterative'] = {
    'accuracy': accuracy_score(y_test, y_pred),
    'auc': roc_auc_score(y_test, model.predict_proba(X_test_iter)[:, 1])
}

# Display results
print("\n" + "="*60 + "\n")
print("IMPUTATION METHODS COMPARISON")
print("="*60)

results_df = pd.DataFrame(results).T
print(results_df)

print("\n" + "="*60 + "\n")
print("Winner:", results_df['auc'].idxmax())
print(f"Best AUC: {results_df['auc'].max():.4f}")
```

### Advantages & Disadvantages

**Advantages:**
✅ Handles complex relationships
✅ Better for MAR data
✅ Can impute multiple features simultaneously
✅ Theoretical foundation (MICE)
✅ Often most accurate

**Disadvantages:**
❌ Computationally intensive
❌ Can be slow for large datasets
❌ Requires more memory
❌ May not converge
❌ More complex to understand

---

## Advanced Techniques

### 1. Indicator Variable Method

Add a binary column indicating whether a value was missing.

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

# This helps model learn that missingness itself is informative
```

### 2. Forward Fill / Backward Fill (Time Series)

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
```

### 3. Multiple Imputation

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
    'age': [25, np.nan, 35, 40, np.nan, 28],
    'income': [50, 60, np.nan, 70, 55, np.nan]
})

print("Original Data:")
print(df)
print("\n" + "="*60 + "\n")

df_final, all_imputations = multiple_imputation(df, n_imputations=5)

print("After Multiple Imputation (Average of 5):")
print(df_final)

print("\n" + "="*60 + "\n")
print("Variance across imputations (uncertainty):")
print(pd.concat(all_imputations).groupby(level=0).std())
```

### 4. Domain-Specific Imputation

```python
import pandas as pd
import numpy as np

# E-commerce dataset
df = pd.DataFrame({
    'product_views': [10, 20, np.nan, 15, 0, np.nan],
    'cart_adds': [2, 5, np.nan, 3, 0, np.nan],
    'purchases': [1, 2, 0, 1, 0, 0],
    'revenue': [100, 200, 0, 150, 0, 0]
})

print("Original E-commerce Data:")
print(df)
print("\n" + "="*60 + "\n")

# Domain knowledge: If purchases=0, likely views and cart_adds are also 0
mask = (df['purchases'] == 0) & (df['product_views'].isnull())
df.loc[mask, 'product_views'] = 0
df.loc[mask, 'cart_adds'] = 0

# For other missing values, use median
df.fillna(df.median(), inplace=True)

print("After Domain-Specific Imputation:")
print(df)
```

---

## Comparison and Selection

### Comparison Table

```python
import pandas as pd

comparison = pd.DataFrame({
    'Method': ['SimpleImputer', 'KNNImputer', 'IterativeImputer', 'Indicator', 'Drop'],
    'Speed': ['Fast', 'Slow', 'Very Slow', 'Fast', 'Instant'],
    'Accuracy': ['Low', 'Medium', 'High', 'Low', 'N/A'],
    'Best For': ['MCAR', 'MAR', 'MAR/MNAR', 'MNAR', 'MCAR (<5%)'],
    'Complexity': ['Low', 'Medium', 'High', 'Low', 'Low'],
    'Memory': ['Low', 'Medium', 'High', 'Low', 'Low']
})

print("IMPUTATION METHODS COMPARISON")
print("="*80)
print(comparison.to_string(index=False))
```

### Decision Framework

```
How to Choose Imputation Method?
═══════════════════════════════════════════════════════════

Step 1: Check missing percentage
│
├─ < 5% → Consider DROPPING rows
├─ 5-20% → IMPUTE
└─ > 20% → INVESTIGATE why so much missing data

Step 2: Identify missing data type
│
├─ MCAR → SimpleImputer is sufficient
├─ MAR → KNNImputer or IterativeImputer
└─ MNAR → Domain knowledge + Indicator variable

Step 3: Consider dataset size
│
├─ Small (< 1000 rows) → Any method
├─ Medium (1000-10000) → KNNImputer or IterativeImputer
└─ Large (> 10000) → SimpleImputer (for speed)

Step 4: Check feature relationships
│
├─ Strong correlations → KNN or Iterative
└─ Weak correlations → SimpleImputer

Step 5: Model type
│
├─ Tree-based → Less sensitive, SimpleImputer OK
└─ Linear/Neural → Use advanced methods
```

### Performance Benchmark

```python
import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer, KNNImputer
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
import time

# Create large dataset
np.random.seed(42)
n = 10000
df = pd.DataFrame({
    f'feature_{i}': np.random.randn(n) for i in range(10)
})

# Add missing values
for col in df.columns:
    missing_idx = np.random.choice(df.index, int(n * 0.15), replace=False)
    df.loc[missing_idx, col] = np.nan

print(f"Dataset: {df.shape}")
print(f"Total missing: {df.isnull().sum().sum():,}")
print("\n" + "="*60 + "\n")

# Benchmark
methods = {
    'Simple (Mean)': SimpleImputer(strategy='mean'),
    'Simple (Median)': SimpleImputer(strategy='median'),
    'KNN (k=3)': KNNImputer(n_neighbors=3),
    'KNN (k=5)': KNNImputer(n_neighbors=5),
    'Iterative': IterativeImputer(max_iter=5, random_state=42)
}

results = []

for name, imputer in methods.items():
    start_time = time.time()
    imputed = imputer.fit_transform(df)
    elapsed = time.time() - start_time

    results.append({
        'Method': name,
        'Time (seconds)': round(elapsed, 3),
        'Memory (MB)': round(imputed.nbytes / 1024**2, 2)
    })

    print(f"{name:20s}: {elapsed:6.3f}s")

print("\n" + "="*60 + "\n")
results_df = pd.DataFrame(results)
print(results_df.to_string(index=False))
```

---

## Common Mistakes

### ❌ Mistake 1: Imputing Before Train-Test Split

```python
import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split

# WRONG: Imputing before split (DATA LEAKAGE!)
df = pd.DataFrame({
    'feature': [1, np.nan, 3, 4, np.nan, 6],
    'target': [0, 1, 0, 1, 0, 1]
})

# DON'T DO THIS
imputer = SimpleImputer()
df['feature'] = imputer.fit_transform(df[['feature']])  # Uses ALL data
X_train, X_test = train_test_split(df, test_size=0.3)   # Then split

# CORRECT: Split first, then impute
df = pd.DataFrame({
    'feature': [1, np.nan, 3, 4, np.nan, 6],
    'target': [0, 1, 0, 1, 0, 1]
})

X = df[['feature']]
y = df['target']

# Split first
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3)

# Fit on training, transform both
imputer = SimpleImputer()
X_train_imputed = imputer.fit_transform(X_train)  # Fit on train only
X_test_imputed = imputer.transform(X_test)        # Transform test
```

### ❌ Mistake 2: Using Mean for Skewed Data

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
print("\nMean is heavily influenced by $1M outlier!")
```

### ❌ Mistake 3: Not Handling Missing in Categorical Variables

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
    print(f"Error: {e}")

# CORRECT: Use most_frequent for categorical
imputer = SimpleImputer(strategy='most_frequent')
df['city_imputed'] = imputer.fit_transform(df[['city']])
print("\nCorrected:")
print(df)
```

### ❌ Mistake 4: Ignoring Why Data is Missing

```python
# WRONG: Blindly imputing without understanding
survey_data = pd.DataFrame({
    'age': [25, 30, 35, 40, 45],
    'income': [50000, 60000, np.nan, np.nan, np.nan]  # High earners refuse to answer
})

# Simply imputing with mean/median misses the MNAR pattern!
# High earners are missing, so imputed values will be UNDERESTIMATES

# BETTER: Create indicator variable
survey_data['income_refused'] = survey_data['income'].isnull().astype(int)
# Then impute, knowing the indicator carries information
```

### ❌ Mistake 5: Not Scaling Before KNN

```python
import pandas as pd
import numpy as np
from sklearn.impute import KNNImputer
from sklearn.preprocessing import StandardScaler

df = pd.DataFrame({
    'age': [25, np.nan, 35, 40, np.nan],
    'income': [50000, 60000, np.nan, 70000, 55000]  # Much larger scale!
})

# WRONG: KNN without scaling
# Income will dominate distance calculation
imputer = KNNImputer(n_neighbors=2)
result_wrong = imputer.fit_transform(df)

# CORRECT: Scale first
scaler = StandardScaler()
df_scaled = scaler.fit_transform(df)
imputer = KNNImputer(n_neighbors=2)
result_correct = imputer.fit_transform(df_scaled)
result_correct = scaler.inverse_transform(result_correct)

print("Without scaling (wrong):")
print(result_wrong)
print("\nWith scaling (correct):")
print(result_correct)
```

---

## Best Practices

### ✅ Practice 1: Analyze Before Imputing

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

def analyze_missing_data(df):
    """
    Comprehensive missing data analysis
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
    print(missing_summary.to_string(index=False))

    # 2. Missing patterns
    print("\n2. Missing Data Patterns:")
    missing_patterns = df.isnull().groupby(df.isnull().sum(axis=1)).size()
    print(missing_patterns)

    # 3. Correlation of missingness
    print("\n3. Correlation of Missingness:")
    missing_corr = df.isnull().corr()
    print(missing_corr.round(2))

    return missing_summary

# Example usage
df = pd.DataFrame({
    'age': [25, np.nan, 35, 40, np.nan] * 20,
    'income': [50000, 60000, np.nan, 70000, 55000] * 20,
    'score': [650, np.nan, 680, np.nan, 660] * 20
})

analyze_missing_data(df)
```

### ✅ Practice 2: Use Pipelines

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer, KNNImputer
from sklearn.preprocessing import StandardScaler
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
```

### ✅ Practice 3: Document Imputation Choices

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
print(log_df)
```

---

## Interview Questions

### Q1: What are the three types of missing data mechanisms?

**Answer:**

**1. MCAR (Missing Completely At Random)**
- Missingness is completely random
- No relationship to any variables
- Example: Data lost due to system crash
- Can use any imputation method

**2. MAR (Missing At Random)**
- Missingness depends on observed data
- Can be predicted from other variables
- Example: Young people less likely to report income
- Use advanced methods (KNN, Iterative)

**3. MNAR (Missing Not At Random)**
- Missingness depends on unobserved values
- Cannot be predicted from available data
- Example: High earners refuse to report income
- Requires domain knowledge and indicator variables

### Q2: When would you use KNN Imputer over Simple Imputer?

**Answer:**

Use **KNN Imputer** when:

1. **Strong feature correlations** exist
2. **MAR** data (missingness depends on observed features)
3. **Dataset is small-medium** (< 10,000 rows)
4. **Accuracy is prioritized** over speed

Use **Simple Imputer** when:

1. **MCAR** data (completely random)
2. **Large datasets** (speed matters)
3. **Weak feature correlations**
4. **Quick baseline** needed

**Example:**
```python
# Healthcare data - vitals are correlated
# Blood pressure correlates with age, BMI
# → Use KNN Imputer

# Survey data - random non-responses
# No correlation between features
# → Use Simple Imputer (faster)
```

### Q3: How do you prevent data leakage when imputing?

**Answer:**

**Data leakage** occurs when information from test set influences training.

**Prevention:**

```python
# 1. Split BEFORE imputing
X_train, X_test, y_train, y_test = train_test_split(X, y)

# 2. Fit imputer on training data ONLY
imputer = SimpleImputer()
X_train_imputed = imputer.fit_transform(X_train)  # Fit on train

# 3. Transform test data using training statistics
X_test_imputed = imputer.transform(X_test)  # Don't fit on test!

# 4. Use pipelines to ensure correct order
from sklearn.pipeline import Pipeline

pipeline = Pipeline([
    ('imputer', SimpleImputer()),
    ('scaler', StandardScaler()),
    ('model', RandomForestClassifier())
])

pipeline.fit(X_train, y_train)  # All steps fit on train only
predictions = pipeline.predict(X_test)  # All steps transform test
```

### Q4: What is Multiple Imputation and when is it useful?

**Answer:**

**Multiple Imputation** creates several imputed datasets, analyzes each separately, and combines results.

**Process:**
1. Impute missing values M times (e.g., M=5)
2. Train model on each imputed dataset
3. Combine predictions (average for regression, vote for classification)

**Benefits:**
- Captures uncertainty in imputation
- More robust than single imputation
- Better for MNAR data

**When to use:**
- High missing data percentage (> 20%)
- Important decisions (medical, financial)
- When uncertainty matters

```python
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer

# Create 5 imputed datasets
imputed_datasets = []
for i in range(5):
    imputer = IterativeImputer(random_state=i)
    imputed_datasets.append(imputer.fit_transform(df))

# Train model on each
models = []
for data in imputed_datasets:
    model = RandomForestClassifier()
    model.fit(data, y)
    models.append(model)

# Combine predictions
predictions = np.mean([model.predict_proba(X_test) for model in models], axis=0)
```

### Q5: How do you handle missing values in time series data?

**Answer:**

Time series requires special handling due to temporal dependency.

**Methods:**

1. **Forward Fill (ffill)**
```python
df['temperature'].fillna(method='ffill')
# Use last valid observation
```

2. **Backward Fill (bfill)**
```python
df['temperature'].fillna(method='bfill')
# Use next valid observation
```

3. **Interpolation**
```python
# Linear interpolation
df['temperature'].interpolate()

# Polynomial
df['temperature'].interpolate(method='polynomial', order=2)

# Time-aware
df['temperature'].interpolate(method='time')
```

4. **Seasonal Decomposition**
```python
from statsmodels.tsa.seasonal import seasonal_decompose

# Decompose into trend, seasonal, residual
decomposition = seasonal_decompose(df['sales'], model='additive', period=12)

# Impute using seasonal patterns
```

**Best Practice:**
- Use forward fill for real-time data
- Use interpolation for smooth variables (temperature, stock prices)
- Avoid using future data (no backward fill in production)

---

## Summary

### Key Takeaways

```
1. Always analyze missing data BEFORE imputing
2. Split data BEFORE imputation (prevent leakage)
3. Use appropriate method based on missing data type
4. Document imputation decisions
5. Consider adding missing indicators
6. Use pipelines for reproducibility
```

### Quick Reference

```
MCAR → SimpleImputer
MAR → KNNImputer or IterativeImputer
MNAR → Domain knowledge + Indicator variables

Numerical (normal) → mean
Numerical (skewed) → median
Categorical → most_frequent
Time Series → ffill, interpolate

Small dataset → Any method
Large dataset → SimpleImputer (speed)
Correlated features → KNN or Iterative
```

---

**Next:** [Scaling and Outlier Handling →](./scaling-outliers.md)

**Previous:** [← Encoding Techniques](./encoding-techniques.md)
