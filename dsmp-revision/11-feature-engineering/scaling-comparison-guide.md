# Feature Scaling - Comparison and Best Practices

## Introduction

With so many scaling options, how do you choose? This comprehensive guide compares all scaling methods, provides decision frameworks, reveals common mistakes, and shares best practices that will save you hours of debugging.

## Scaler Comparison Table

```python
import pandas as pd

comparison = pd.DataFrame({
    'Scaler': ['StandardScaler', 'MinMaxScaler', 'RobustScaler', 'Normalizer'],
    'Formula': [
        '(x - μ) / σ',
        '(x - min) / (max - min)',
        '(x - median) / IQR',
        'x / ||x||'
    ],
    'Range': ['No fixed range', '[0, 1]', 'No fixed range', '||x|| = 1'],
    'Outlier Sensitivity': ['High', 'Very High', 'Low', 'Medium'],
    'Use Case': [
        'Normally distributed',
        'Bounded output needed',
        'Data with outliers',
        'Sample normalization'
    ],
    'Best For': [
        'KNN, SVM, Neural Nets',
        'Neural Nets, Image data',
        'Robust algorithms',
        'Text, Cosine similarity'
    ]
})

print("="*100)
print("SCALER COMPARISON")
print("="*100)
print(comparison.to_string(index=False))
```

## Decision Framework

```
FEATURE SCALING DECISION TREE
═════════════════════════════

Start: Need to scale features?
│
├─ Using tree-based model?
│  └─ NO → No scaling needed
│
├─ Data has outliers?
│  ├─ YES → RobustScaler
│  └─ NO  → Continue
│
├─ Need bounded range (0-1)?
│  ├─ YES → MinMaxScaler
│  └─ NO  → Continue
│
├─ Computing sample similarity?
│  ├─ YES → Normalizer
│  └─ NO  → Continue
│
└─ Default → StandardScaler
```

## Performance Comparison

Real-world comparison on data with outliers.

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score

# Generate data with outliers
np.random.seed(42)
n = 500

# Normal data
X_normal = np.random.randn(int(n * 0.9), 2) * 10 + 50

# Outliers
X_outliers = np.random.uniform(-100, 200, (int(n * 0.1), 2))

X = np.vstack([X_normal, X_outliers])
y = np.concatenate([
    np.zeros(int(n * 0.9)),
    np.ones(int(n * 0.1))
])

# Shuffle
shuffle_idx = np.random.permutation(len(X))
X = X[shuffle_idx]
y = y[shuffle_idx]

print(f"Dataset: {X.shape}")
print(f"Outliers: {(y == 1).sum()} ({(y == 1).mean():.1%})")
print("\n" + "="*60 + "\n")

# Test different scalers
scalers = {
    'No Scaling': None,
    'StandardScaler': StandardScaler(),
    'MinMaxScaler': MinMaxScaler(),
    'RobustScaler': RobustScaler()
}

results = []

for name, scaler in scalers.items():
    if scaler is None:
        X_scaled = X
    else:
        X_scaled = scaler.fit_transform(X)

    knn = KNeighborsClassifier(n_neighbors=5)
    scores = cross_val_score(knn, X_scaled, y, cv=5)

    results.append({
        'Scaler': name,
        'Mean CV Score': scores.mean(),
        'Std CV Score': scores.std()
    })

    print(f"{name:20s}: {scores.mean():.4f} (+/- {scores.std():.4f})")

print("\n" + "="*60 + "\n")
results_df = pd.DataFrame(results).sort_values('Mean CV Score', ascending=False)
print("Best Scaler:", results_df.iloc[0]['Scaler'])
```

## Common Mistakes

### Mistake 1: Scaling Before Train-Test Split

This causes data leakage and overly optimistic performance.

```python
# WRONG: Scaling before split (DATA LEAKAGE!)
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

# DON'T DO THIS
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)  # Fit on ALL data!
X_train, X_test = train_test_split(X_scaled, y)

# CORRECT: Split first, then scale
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)  # Fit on train only
X_test_scaled = scaler.transform(X_test)  # Transform test using train stats
```

**Why it matters:**
- Test set statistics leak into training
- Overly optimistic performance estimates
- Model won't generalize to new data

### Mistake 2: Using Wrong Scaler for Outliers

MinMaxScaler compresses normal values when outliers are present.

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, RobustScaler

# Data with outlier
data = pd.DataFrame({
    'values': [10, 12, 15, 18, 20, 1000]  # 1000 is outlier
})

# WRONG: MinMaxScaler with outliers
minmax = MinMaxScaler()
data['minmax'] = minmax.fit_transform(data[['values']])

# CORRECT: RobustScaler for outliers
robust = RobustScaler()
data['robust'] = robust.fit_transform(data[['values']])

print(data)
print("\nMinMaxScaler: Normal values compressed to ~0")
print("RobustScaler: Better handling of outlier")
```

### Mistake 3: Scaling Target Variable in Classification

Don't scale categorical targets!

```python
# WRONG: Scaling target in classification
from sklearn.preprocessing import StandardScaler

# DON'T scale classification targets (0, 1, 2, ...)
scaler = StandardScaler()
y_scaled = scaler.fit_transform(y.reshape(-1, 1))  # WRONG!

# CORRECT: Only scale features
X_scaled = scaler.fit_transform(X)
# y remains [0, 1, 2, ...] for classification

# Note: For regression, you CAN scale target
# but remember to inverse_transform predictions!
```

### Mistake 4: Not Saving Scaler for Production

Save your scaler or production predictions will be wrong.

```python
import pickle
from sklearn.preprocessing import StandardScaler

# CORRECT: Save scaler for production use
scaler = StandardScaler()
scaler.fit(X_train)

# Save scaler
with open('scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)

# Later, in production
with open('scaler.pkl', 'rb') as f:
    loaded_scaler = pickle.load(f)

X_new_scaled = loaded_scaler.transform(X_new)
```

### Mistake 5: Removing All Outliers Blindly

Some outliers are your most valuable data!

```python
# WRONG: Removing outliers without understanding
# Some "outliers" might be important!

# Example: Fraud detection
# Fraudulent transactions are outliers but are the TARGET!

# CORRECT: Understand domain first
# - Medical data: Outliers might be critical cases
# - Fraud detection: Outliers are what we want to find
# - Sensor data: Outliers might indicate failures
```

## Best Practices

### Practice 1: Always Use Pipeline

Pipelines prevent mistakes and ensure correct order.

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import RobustScaler
from sklearn.svm import SVC

# Pipeline ensures correct order and no data leakage
pipeline = Pipeline([
    ('scaler', RobustScaler()),
    ('classifier', SVC())
])

# Fit pipeline (scaler fits on train only)
pipeline.fit(X_train, y_train)

# Predict (scaler transforms using train stats)
predictions = pipeline.predict(X_test)
```

### Practice 2: Visualize Before and After

Always visualize to verify scaling worked as expected.

```python
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

# Before scaling
fig, axes = plt.subplots(1, 2, figsize=(12, 4))

df = pd.DataFrame({
    'age': np.random.randint(20, 70, 100),
    'income': np.random.randint(20000, 150000, 100)
})

# Before
df.plot(kind='box', ax=axes[0])
axes[0].set_title('Before Scaling')
axes[0].set_ylabel('Value')

# After
scaler = StandardScaler()
df_scaled = pd.DataFrame(
    scaler.fit_transform(df),
    columns=df.columns
)
df_scaled.plot(kind='box', ax=axes[1])
axes[1].set_title('After StandardScaler')
axes[1].set_ylabel('Standardized Value')

plt.tight_layout()
```

### Practice 3: Document Scaling Decisions

Keep track of preprocessing for reproducibility.

```python
import pandas as pd

# Keep track of preprocessing decisions
preprocessing_log = {
    'age': {
        'scaler': 'StandardScaler',
        'reason': 'Normally distributed, used in distance-based algorithm',
        'outliers_handled': False
    },
    'income': {
        'scaler': 'RobustScaler',
        'reason': 'Has outliers (high earners)',
        'outliers_handled': True
    },
    'credit_score': {
        'scaler': 'MinMaxScaler',
        'reason': 'Need 0-1 range for neural network',
        'outliers_handled': False
    }
}

log_df = pd.DataFrame(preprocessing_log).T
print("Preprocessing Documentation:")
print(log_df)
```

### Practice 4: Validate Scaling Impact

Always check if scaling improved your model.

```python
from sklearn.model_selection import cross_val_score
from sklearn.neighbors import KNeighborsClassifier

# Without scaling
knn = KNeighborsClassifier()
scores_unscaled = cross_val_score(knn, X_train, y_train, cv=5)

# With scaling
knn = KNeighborsClassifier()
scores_scaled = cross_val_score(knn, X_train_scaled, y_train, cv=5)

print(f"Without scaling: {scores_unscaled.mean():.4f} (+/- {scores_unscaled.std():.4f})")
print(f"With scaling:    {scores_scaled.mean():.4f} (+/- {scores_scaled.std():.4f})")
print(f"Improvement:     {(scores_scaled.mean() - scores_unscaled.mean()):.4f}")
```

## Quick Reference Card

```
SCALER SELECTION CHEAT SHEET
═════════════════════════════

StandardScaler:  z = (x - μ) / σ
  → Normal distribution, distance-based algorithms

MinMaxScaler:    x = (x - min) / (max - min)
  → Need [0,1] range, no outliers

RobustScaler:    x = (x - median) / IQR
  → Has outliers, robust statistics needed

Normalizer:      x = x / ||x||
  → Sample similarity, text classification

Outlier Detection:
  Z-score: |z| > 3
  IQR: x < Q1 - 1.5×IQR or x > Q3 + 1.5×IQR
  Isolation Forest: Anomaly score

Outlier Handling:
  Remove:    Errors, large dataset
  Cap:       Valid extremes, small dataset
  Transform: Skewed data
  Separate:  Meaningful outliers (VIP, fraud)
```

## Summary

Key principles for effective feature scaling:

1. **Choose the right scaler:** Based on data characteristics
2. **Always split first:** Prevent data leakage
3. **Use pipelines:** Ensure correct workflow
4. **Visualize results:** Verify scaling worked
5. **Document decisions:** Enable reproducibility
6. **Validate impact:** Check model performance
7. **Save for production:** Don't forget the scaler

Most importantly: Understand your data before choosing a scaling method. One size does not fit all.

---

**Navigation:**
- **Previous:** [← Outlier Handling](./outliers-handling-strategies.md)
- **Next:** [Interview Questions →](./scaling-interview-questions.md)
- **Related:** [Why Scaling Matters](./scaling-why-important.md)
