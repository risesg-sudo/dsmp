# Iterative Imputer - Advanced MICE Method

## What You'll Learn

Iterative Imputer uses MICE (Multiple Imputation by Chained Equations) to model each feature with missing values as a function of other features. It's the most sophisticated imputation method, perfect for complex relationships in MAR data.

## The Concept

Iterative Imputer models each feature with missing values using other features, iterating until convergence.

```
How Iterative Imputation Works:
────────────────────────────────

Iteration 1:
Age = f(Income, Score)     ← Predict missing Age
Income = f(Age, Score)     ← Predict missing Income
Score = f(Age, Income)     ← Predict missing Score

Iteration 2:
Use updated values to improve predictions

Iteration 3+:
Continue until convergence

Result: Better estimates capturing complex relationships
```

## Basic Implementation

```python
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
import pandas as pd
import numpy as np

# Sample data
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
```

## Advanced Configuration

```python
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import BayesianRidge
import pandas as pd
import numpy as np

# Generate correlated features
np.random.seed(42)
n = 100

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

print(f"Dataset: {df.shape}")
print(f"Missing per column:\n{df.isnull().sum()}\n")

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

# Method 3: Custom parameters
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
print("All methods produce similar results but with different computational costs")
```

## Real-World Example

```python
import pandas as pd
import numpy as np
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer, SimpleImputer, KNNImputer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score, roc_auc_score

# Generate realistic financial data
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
missing_income = 1 / (1 + np.exp((age - 30) / 5))
df.loc[np.random.random(n) < missing_income * 0.2, 'annual_income'] = np.nan

missing_idx = np.random.choice(df.index, int(n * 0.15), replace=False)
df.loc[missing_idx, 'years_employed'] = np.nan

print(f"Dataset: {df.shape}")
print(f"Missing values:\n{df.isnull().sum()}\n")

# Prepare data
X = df.drop('defaulted', axis=1)
y = df['defaulted']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Compare methods
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
print("IMPUTATION METHODS COMPARISON")
print("="*60)
results_df = pd.DataFrame(results).T
print(results_df)
print(f"\nBest method: {results_df['auc'].idxmax()}")
print(f"Best AUC: {results_df['auc'].max():.4f}")
```

## When to Use

### Perfect For

- **MAR data** with complex relationships
- **Multiple features** with missing values
- **Correlated features**
- **High accuracy** requirements
- **Medium-sized datasets**

### Examples

```python
use_cases = {
    'Medical Research': 'Multiple vitals with complex relationships',
    'Economic Data': 'Interconnected financial indicators',
    'Survey Data': 'Questions with logical dependencies',
    'Sensor Networks': 'Multiple correlated measurements'
}

print("WHEN TO USE ITERATIVE IMPUTER:")
print("="*60)
for case, description in use_cases.items():
    print(f"\n{case}:")
    print(f"  {description}")
```

## Advantages

```
✅ Handles complex relationships
✅ Best for MAR data
✅ Can impute multiple features simultaneously
✅ Theoretical foundation (MICE)
✅ Often most accurate
✅ Flexible (can use different estimators)
```

## Disadvantages

```
❌ Computationally intensive
❌ Slow for large datasets
❌ Requires more memory
❌ May not converge
❌ More complex to understand
❌ Requires sklearn experimental import
```

## Best Practices

### Monitor Convergence

```python
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer

# Set verbose to see convergence
imputer = IterativeImputer(
    max_iter=20,
    verbose=2,
    random_state=42
)

df_imputed = imputer.fit_transform(df)
print("Check that imputation converged!")
```

### Choose Appropriate Estimator

```python
# For linear relationships
from sklearn.linear_model import BayesianRidge
imputer = IterativeImputer(estimator=BayesianRidge())

# For non-linear relationships
from sklearn.ensemble import RandomForestRegressor
imputer = IterativeImputer(estimator=RandomForestRegressor(n_estimators=10))

# For speed
from sklearn.linear_model import Ridge
imputer = IterativeImputer(estimator=Ridge())
```

## Summary

Iterative Imputer is the most sophisticated method, perfect for complex MAR data. It's slower but often more accurate than simpler methods.

**Key Takeaways:**
- Use for complex, correlated data
- Best accuracy for MAR data
- Computationally expensive
- Monitor convergence
- Choose appropriate estimator
- Use when accuracy > speed

---

**Navigation:**
- **Previous:** [← KNN Imputer](./missing-knn-imputer.md)
- **Next:** [Advanced Techniques →](./missing-advanced-techniques.md)
- **Related:** [Missing Data Comparison](./missing-comparison.md)
