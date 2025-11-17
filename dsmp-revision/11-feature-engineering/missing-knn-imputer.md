# KNN Imputer - Neighbor-Based Imputation

## What You'll Learn

KNN Imputer fills missing values by finding similar rows and using their values. It's more sophisticated than SimpleImputer, capturing relationships between features. Perfect for MAR data where features are correlated.

## The Concept

KNN Imputer finds the K nearest neighbors based on complete features, then uses their values to impute missing ones.

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

## Basic Implementation

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
print("\nExplanation: Missing values filled using 3 nearest neighbors")
```

## Choosing the K Value

```python
import pandas as pd
import numpy as np
from sklearn.impute import KNNImputer

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

print("Testing Different K Values:")
print("="*60)

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

print(f"\nBest K value: {k_values[np.argmin(errors)]}")
print("Rule of thumb: K=5 works well for most cases")
```

## Real-World Example

```python
import pandas as pd
import numpy as np
from sklearn.impute import KNNImputer, SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Create healthcare dataset with correlated features
np.random.seed(42)
n = 500

age = np.random.randint(20, 80, n)
bmi = 18 + (age - 20) * 0.15 + np.random.randn(n) * 3  # BMI correlates with age
blood_pressure = 110 + (age - 20) * 0.5 + np.random.randn(n) * 10

df = pd.DataFrame({
    'age': age,
    'bmi': bmi,
    'blood_pressure': blood_pressure,
    'cholesterol': np.random.randint(150, 300, n),
    'has_disease': ((age > 50) & (bmi > 25)) | (blood_pressure > 140)
})
df['has_disease'] = df['has_disease'].astype(int)

# Introduce missing values
for col in ['age', 'bmi', 'blood_pressure']:
    missing_idx = np.random.choice(df.index, int(n * 0.15), replace=False)
    df.loc[missing_idx, col] = np.nan

print(f"Dataset: {df.shape}")
print(f"Missing values:\n{df.isnull().sum()}\n")

# Compare Simple vs KNN Imputation
X = df.drop('has_disease', axis=1)
y = df['has_disease']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Method 1: Simple Imputation
simple_imputer = SimpleImputer(strategy='mean')
X_train_simple = simple_imputer.fit_transform(X_train)
X_test_simple = simple_imputer.transform(X_test)

model_simple = RandomForestClassifier(n_estimators=100, random_state=42)
model_simple.fit(X_train_simple, y_train)
acc_simple = accuracy_score(y_test, model_simple.predict(X_test_simple))

# Method 2: KNN Imputation
knn_imputer = KNNImputer(n_neighbors=5)
X_train_knn = knn_imputer.fit_transform(X_train)
X_test_knn = knn_imputer.transform(X_test)

model_knn = RandomForestClassifier(n_estimators=100, random_state=42)
model_knn.fit(X_train_knn, y_train)
acc_knn = accuracy_score(y_test, model_knn.predict(X_test_knn))

print("COMPARISON: Simple vs KNN Imputation")
print("="*60)
print(f"Simple Imputer Accuracy: {acc_simple:.2%}")
print(f"KNN Imputer Accuracy:    {acc_knn:.2%}")
print(f"Improvement:             {(acc_knn - acc_simple):.2%}")
```

## When to Use KNN Imputer

### Perfect For

- **MAR data** (missingness depends on observed features)
- **Correlated features** (strong relationships exist)
- **Small to medium datasets** (< 10,000 rows)
- **Accuracy over speed** is priority

### Examples

```python
good_use_cases = {
    'Healthcare Data': 'Vitals are correlated (BP, age, BMI)',
    'Customer Demographics': 'Age, income, spending correlated',
    'Sensor Networks': 'Nearby sensors have similar readings',
    'Time Series': 'Adjacent time points are similar',
    'Geographic Data': 'Nearby locations have similar values'
}

print("WHEN TO USE KNN IMPUTER:")
print("="*60)
for use_case, reason in good_use_cases.items():
    print(f"\n{use_case}:")
    print(f"  Why: {reason}")
```

## Advantages

```
✅ Captures relationships between features
✅ Better for MAR data than simple methods
✅ More sophisticated than mean/median
✅ Can handle multiple missing values
✅ Works well with correlated data
✅ No assumptions about distributions
```

## Disadvantages

```
❌ Computationally expensive (slow for large datasets)
❌ Sensitive to outliers
❌ Requires feature scaling
❌ Curse of dimensionality with many features
❌ Need to choose K (hyperparameter)
❌ Memory intensive
```

## Best Practices

### Scale Features First

```python
from sklearn.preprocessing import StandardScaler
from sklearn.impute import KNNImputer
import numpy as np

df = pd.DataFrame({
    'age': [25, np.nan, 35],
    'income': [50000, 60000, np.nan]  # Much larger scale!
})

# Without scaling: income dominates distance calculation
imputer_no_scale = KNNImputer(n_neighbors=2)
result_no_scale = imputer_no_scale.fit_transform(df)

# With scaling: both features contribute equally
scaler = StandardScaler()
df_scaled = scaler.fit_transform(df.fillna(0))  # Temporary fill for scaling
imputer = KNNImputer(n_neighbors=2)
result_scaled = imputer.fit_transform(df_scaled)
result_scaled = scaler.inverse_transform(result_scaled)

print("Always scale features before KNN imputation!")
```

### Use with Pipeline

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import KNNImputer
from sklearn.ensemble import RandomForestClassifier

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('imputer', KNNImputer(n_neighbors=5)),
    ('classifier', RandomForestClassifier())
])

pipeline.fit(X_train, y_train)
predictions = pipeline.predict(X_test)
```

## Summary

KNN Imputer is powerful for correlated data but computationally expensive. Use it when features have relationships and accuracy matters more than speed.

**Key Takeaways:**
- Use for MAR data with correlated features
- K=5 is a good default
- Always scale features first
- Better than simple methods but slower
- Perfect for small-medium datasets

---

**Navigation:**
- **Previous:** [← SimpleImputer](./missing-simple-imputer.md)
- **Next:** [Iterative Imputer →](./missing-iterative-imputer.md)
- **Related:** [Missing Data Comparison](./missing-comparison.md)
