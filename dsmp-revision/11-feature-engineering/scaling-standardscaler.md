# StandardScaler - Z-Score Normalization

## Introduction

StandardScaler is the most commonly used scaling technique in machine learning. You'll learn how it transforms features to have zero mean and unit variance, why this matters for algorithms, and how to apply it effectively in real-world scenarios.

## The Concept

StandardScaler standardizes features by removing the mean and scaling to unit variance, also known as Z-score normalization.

```
Formula:
────────
z = (x - μ) / σ

Where:
μ = mean of feature
σ = standard deviation

Result:
Mean = 0
Std Dev = 1

Visual:
Before: [10, 20, 30, 40, 50]  (mean=30, std=14.14)
After:  [-1.41, -0.71, 0, 0.71, 1.41]  (mean=0, std=1)
```

## Basic Implementation

Let's see StandardScaler in action with a simple example.

```python
from sklearn.preprocessing import StandardScaler
import pandas as pd
import numpy as np

# Sample data
df = pd.DataFrame({
    'age': [25, 30, 35, 40, 45, 50],
    'income': [50000, 60000, 70000, 80000, 90000, 100000],
    'credit_score': [650, 700, 720, 750, 680, 730]
})

print("Original Data:")
print(df)
print("\n" + "="*60 + "\n")

print("Original Statistics:")
print(df.describe())
print("\n" + "="*60 + "\n")

# Apply StandardScaler
scaler = StandardScaler()
df_scaled = pd.DataFrame(
    scaler.fit_transform(df),
    columns=df.columns
)

print("After StandardScaler:")
print(df_scaled)
print("\n" + "="*60 + "\n")

print("Scaled Statistics:")
print(df_scaled.describe())

# Verify mean ≈ 0 and std ≈ 1
print("\n" + "="*60 + "\n")
print("Verification:")
for col in df_scaled.columns:
    print(f"{col:15s}: mean = {df_scaled[col].mean():7.4f}, std = {df_scaled[col].std():7.4f}")

# Show transformation parameters
print("\n" + "="*60 + "\n")
print("Scaler Parameters:")
print(f"Means: {scaler.mean_}")
print(f"Std Deviations: {scaler.scale_}")
```

## Real-World Example: Customer Segmentation

See how StandardScaler dramatically improves clustering performance.

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt

# Generate customer data
np.random.seed(42)
n = 300

df = pd.DataFrame({
    'age': np.random.randint(18, 70, n),
    'annual_income': np.random.randint(20000, 150000, n),
    'spending_score': np.random.randint(1, 100, n),
    'years_customer': np.random.randint(0, 15, n)
})

print("Customer Data:")
print(df.head(10))
print("\n" + "="*60 + "\n")

print("Data Statistics:")
print(df.describe())
print("\n" + "="*60 + "\n")

# Clustering WITHOUT scaling
kmeans_unscaled = KMeans(n_clusters=3, random_state=42)
clusters_unscaled = kmeans_unscaled.fit_predict(df)
silhouette_unscaled = silhouette_score(df, clusters_unscaled)

# Clustering WITH scaling
scaler = StandardScaler()
df_scaled = scaler.fit_transform(df)

kmeans_scaled = KMeans(n_clusters=3, random_state=42)
clusters_scaled = kmeans_scaled.fit_predict(df_scaled)
silhouette_scaled = silhouette_score(df_scaled, clusters_scaled)

print("K-Means Clustering Results:")
print(f"Without Scaling - Silhouette Score: {silhouette_unscaled:.4f}")
print(f"With Scaling    - Silhouette Score: {silhouette_scaled:.4f}")
print(f"Improvement:                         {(silhouette_scaled - silhouette_unscaled):.4f}")

print("\n" + "="*60 + "\n")
print("Cluster Sizes:")
print(f"Without Scaling: {np.bincount(clusters_unscaled)}")
print(f"With Scaling:    {np.bincount(clusters_scaled)}")
```

## When to Use StandardScaler

Making the right choice saves time and improves results.

**Use StandardScaler when:**
- Features are normally distributed
- Algorithm uses Euclidean distance (KNN, SVM, K-Means)
- Using PCA or other dimensionality reduction
- Training neural networks
- Features have different units or scales

**Avoid StandardScaler when:**
- Using tree-based algorithms (not needed)
- Features are already on the same scale
- Data has many outliers (use RobustScaler instead)
- Need bounded output (use MinMaxScaler)

## Best Practices

Follow these practices to avoid common pitfalls:

```python
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# CORRECT: Split first, then scale
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)  # Fit on train only
X_test_scaled = scaler.transform(X_test)  # Transform test using train stats

# Save scaler for production
import pickle
with open('scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)
```

## Common Pitfalls to Avoid

**Data Leakage:**
```python
# WRONG: Scaling before split
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)  # Fit on ALL data!
X_train, X_test = train_test_split(X_scaled, y)

# CORRECT: Split first
X_train, X_test = train_test_split(X, y)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
```

## Summary

StandardScaler is your go-to scaling method for most scenarios:
- Transforms features to mean=0, std=1
- Essential for distance-based algorithms
- Works best with normally distributed data
- Always fit on training data only
- Save the scaler for production use

---

**Navigation:**
- **Previous:** [← Why Scaling Matters](./scaling-why-important.md)
- **Next:** [MinMaxScaler →](./scaling-minmaxscaler.md)
- **Related:** [Comparison Guide](./scaling-comparison-guide.md)
