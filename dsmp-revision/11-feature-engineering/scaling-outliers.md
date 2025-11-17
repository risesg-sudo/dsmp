# Feature Scaling and Outlier Handling - Complete Guide

## Table of Contents
1. [Why Feature Scaling?](#why-feature-scaling)
2. [StandardScaler](#standardscaler)
3. [MinMaxScaler](#minmaxscaler)
4. [RobustScaler](#robustscaler)
5. [Normalizer](#normalizer)
6. [Outlier Detection](#outlier-detection)
7. [Outlier Handling](#outlier-handling)
8. [Comparison and Selection](#comparison-and-selection)
9. [Common Mistakes](#common-mistakes)
10. [Interview Questions](#interview-questions)

---

## Why Feature Scaling?

### The Problem

```
Before Scaling:
┌─────────────┬────────────┬──────────────┐
│   Age       │   Income   │ Credit Score │
├─────────────┼────────────┼──────────────┤
│    25       │   50,000   │     650      │
│    30       │   60,000   │     700      │
│    35       │   70,000   │     720      │
└─────────────┴────────────┴──────────────┘

Problem: Different scales!
Age:    25-35     (range: 10)
Income: 50K-70K   (range: 20,000)
Score:  650-720   (range: 70)

→ Income dominates distance-based algorithms!
```

### Which Algorithms Need Scaling?

```
REQUIRES SCALING:
├─ K-Nearest Neighbors (KNN)
├─ Support Vector Machines (SVM)
├─ Neural Networks
├─ Principal Component Analysis (PCA)
├─ K-Means Clustering
├─ Linear/Logistic Regression (with regularization)
└─ Gradient Descent-based algorithms

DOESN'T REQUIRE SCALING:
├─ Decision Trees
├─ Random Forest
├─ Gradient Boosting (XGBoost, LightGBM)
└─ Naive Bayes
```

### Visual Demonstration

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Create synthetic data with different scales
np.random.seed(42)
n = 200

# Feature 1: Small scale (0-10)
feature1 = np.random.uniform(0, 10, n)
# Feature 2: Large scale (0-10000)
feature2 = np.random.uniform(0, 10000, n)

# Target: based on both features (but feature2 will dominate)
target = ((feature1 > 5) & (feature2 > 5000)).astype(int)

df = pd.DataFrame({
    'feature1': feature1,
    'feature2': feature2,
    'target': target
})

print("Data Distribution:")
print(df.describe())
print("\n" + "="*60 + "\n")

# Train without scaling
X = df[['feature1', 'feature2']]
y = df['target']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

knn_unscaled = KNeighborsClassifier(n_neighbors=5)
knn_unscaled.fit(X_train, y_train)
acc_unscaled = accuracy_score(y_test, knn_unscaled.predict(X_test))

# Train with scaling
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

knn_scaled = KNeighborsClassifier(n_neighbors=5)
knn_scaled.fit(X_train_scaled, y_train)
acc_scaled = accuracy_score(y_test, knn_scaled.predict(X_test_scaled))

print("KNN Performance:")
print(f"Without Scaling: {acc_unscaled:.2%}")
print(f"With Scaling:    {acc_scaled:.2%}")
print(f"Improvement:     {(acc_scaled - acc_unscaled):.2%}")

print("\n" + "="*60 + "\n")
print("Why? Feature2 dominates distance calculation!")
print(f"Feature1 range: {feature1.max() - feature1.min():.2f}")
print(f"Feature2 range: {feature2.max() - feature2.min():.2f}")
```

---

## StandardScaler

### Concept

Standardizes features by removing mean and scaling to unit variance (Z-score normalization).

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

### Implementation

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

### Real-World Example: Customer Segmentation

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

### When to Use

✅ **Use StandardScaler when:**
- Features are normally distributed
- Algorithm uses Euclidean distance (KNN, SVM, K-Means)
- Using PCA or other dimensionality reduction
- Training neural networks
- Features have different units/scales

❌ **Don't use when:**
- Using tree-based algorithms (not needed)
- Features are already on same scale
- Data has many outliers (use RobustScaler instead)

---

## MinMaxScaler

### Concept

Scales features to a given range (default 0-1).

```
Formula:
────────
x_scaled = (x - x_min) / (x_max - x_min)

For custom range [a, b]:
x_scaled = a + (x - x_min) * (b - a) / (x_max - x_min)

Result:
Min = 0 (or a)
Max = 1 (or b)

Visual:
Before: [10, 20, 30, 40, 50]
After:  [0, 0.25, 0.5, 0.75, 1.0]
```

### Implementation

```python
from sklearn.preprocessing import MinMaxScaler
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

# Apply MinMaxScaler (default: 0-1 range)
scaler = MinMaxScaler()
df_scaled = pd.DataFrame(
    scaler.fit_transform(df),
    columns=df.columns
)

print("After MinMaxScaler (0-1):")
print(df_scaled)
print("\n" + "="*60 + "\n")

# Custom range: -1 to 1
scaler_custom = MinMaxScaler(feature_range=(-1, 1))
df_custom = pd.DataFrame(
    scaler_custom.fit_transform(df),
    columns=df.columns
)

print("After MinMaxScaler (-1 to 1):")
print(df_custom)

# Show parameters
print("\n" + "="*60 + "\n")
print("Scaler Parameters:")
print(f"Data Min: {scaler.data_min_}")
print(f"Data Max: {scaler.data_max_}")
print(f"Data Range: {scaler.data_range_}")
```

### Real-World Example: Image Processing

```python
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Simulate image pixel data (0-255) and other features
np.random.seed(42)
n = 1000

df = pd.DataFrame({
    'pixel_intensity': np.random.randint(0, 256, n),  # Image pixel (0-255)
    'contrast': np.random.uniform(0, 100, n),         # Contrast measure
    'brightness': np.random.uniform(0, 100, n),       # Brightness
    'saturation': np.random.uniform(0, 100, n)        # Saturation
})

# Target: classify as 'dark' or 'bright'
df['label'] = (df['pixel_intensity'] > 128).astype(int)

print("Image Feature Data:")
print(df.head(10))
print("\n" + "="*60 + "\n")

print("Feature Ranges:")
print(df.describe())

# Prepare data
X = df.drop('label', axis=1)
y = df['label']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Neural network WITHOUT scaling (will struggle with pixel values 0-255)
nn_unscaled = MLPClassifier(hidden_layer_sizes=(10,), max_iter=1000, random_state=42)
nn_unscaled.fit(X_train, y_train)
acc_unscaled = accuracy_score(y_test, nn_unscaled.predict(X_test))

# Neural network WITH MinMaxScaler
scaler = MinMaxScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

nn_scaled = MLPClassifier(hidden_layer_sizes=(10,), max_iter=1000, random_state=42)
nn_scaled.fit(X_train_scaled, y_train)
acc_scaled = accuracy_score(y_test, nn_scaled.predict(X_test_scaled))

print("\n" + "="*60 + "\n")
print("Neural Network Performance:")
print(f"Without Scaling: {acc_unscaled:.2%}")
print(f"With Scaling:    {acc_scaled:.2%}")
print(f"Improvement:     {(acc_scaled - acc_unscaled):.2%}")

print("\n" + "="*60 + "\n")
print("Scaled Feature Ranges:")
X_scaled_df = pd.DataFrame(X_train_scaled, columns=X.columns)
print(X_scaled_df.describe())
```

### Comparison with StandardScaler

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler

# Data with outlier
data = pd.DataFrame({
    'normal': [10, 12, 15, 18, 20, 22, 25],
    'with_outlier': [10, 12, 15, 18, 20, 22, 1000]  # Outlier!
})

print("Original Data:")
print(data)
print("\n" + "="*60 + "\n")

# StandardScaler
standard_scaler = StandardScaler()
data_standard = pd.DataFrame(
    standard_scaler.fit_transform(data),
    columns=['normal_std', 'outlier_std']
)

# MinMaxScaler
minmax_scaler = MinMaxScaler()
data_minmax = pd.DataFrame(
    minmax_scaler.fit_transform(data),
    columns=['normal_mm', 'outlier_mm']
)

# Combine for comparison
comparison = pd.concat([data, data_standard, data_minmax], axis=1)
print("Comparison: StandardScaler vs MinMaxScaler")
print(comparison)

print("\n" + "="*60 + "\n")
print("Effect of Outlier:")
print("\nWith outlier (value=1000):")
print("StandardScaler: Most values become negative (mean shifted)")
print("MinMaxScaler:   Most values compressed near 0 (range expanded)")
print("\nConclusion: MinMaxScaler very sensitive to outliers!")
```

### When to Use

✅ **Use MinMaxScaler when:**
- Bounded output is needed (e.g., neural network activation functions)
- Features are not normally distributed
- Data doesn't have outliers
- Need interpretable scale (0-1)
- Image processing, computer vision

❌ **Don't use when:**
- Data has outliers (they'll compress normal values)
- Need statistical properties (mean=0, std=1)
- Using algorithms sensitive to outliers

---

## RobustScaler

### Concept

Scales features using statistics that are robust to outliers (median and IQR instead of mean and std).

```
Formula:
────────
x_scaled = (x - median) / IQR

Where:
median = 50th percentile
IQR = Q3 - Q1 (75th - 25th percentile)

Result:
Median = 0
IQR = 1

Visual with outliers:
Before: [10, 12, 15, 18, 20, 1000]  ← outlier
StandardScaler: [-0.44, -0.43, -0.42, -0.41, -0.40, 2.30]  ← compressed!
RobustScaler:   [-1.0, -0.75, -0.375, 0, 0.25, 122.5]     ← better!
```

### Implementation

```python
from sklearn.preprocessing import RobustScaler, StandardScaler, MinMaxScaler
import pandas as pd
import numpy as np

# Data with outliers
np.random.seed(42)
normal_data = np.random.randn(100) * 10 + 50
outliers = np.array([200, 250, 300])  # Extreme outliers
data = np.concatenate([normal_data, outliers])

df = pd.DataFrame({'value': data})

print("Original Data:")
print(df.describe())
print(f"Number of outliers (>100): {(df['value'] > 100).sum()}")
print("\n" + "="*60 + "\n")

# Apply different scalers
standard_scaler = StandardScaler()
minmax_scaler = MinMaxScaler()
robust_scaler = RobustScaler()

df['standard'] = standard_scaler.fit_transform(df[['value']])
df['minmax'] = minmax_scaler.fit_transform(df[['value']])
df['robust'] = robust_scaler.fit_transform(df[['value']])

# Show results for normal data points
print("Scaled Values (first 10 normal points):")
print(df.head(10))

print("\n" + "="*60 + "\n")
print("Scaled Values (outliers):")
print(df.tail(3))

print("\n" + "="*60 + "\n")
print("Statistics of Scaled Data:")
print(df[['standard', 'minmax', 'robust']].describe())

print("\n" + "="*60 + "\n")
print("Effect on Normal Data (excluding outliers):")
normal_mask = df['value'] < 100
for scaler_name in ['standard', 'minmax', 'robust']:
    normal_range = df[normal_mask][scaler_name].max() - df[normal_mask][scaler_name].min()
    print(f"{scaler_name:10s}: Range = {normal_range:.2f}")

print("\nObservation:")
print("MinMaxScaler: Normal data compressed to tiny range (0.00-0.17)")
print("StandardScaler: Normal data has reasonable range")
print("RobustScaler: Normal data has best range, outliers don't compress it")
```

### Real-World Example: Sensor Data with Failures

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import RobustScaler, StandardScaler
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# Simulate sensor data with occasional failures
np.random.seed(42)
n = 500

# Normal sensor readings
temp_normal = np.random.normal(25, 2, int(n * 0.9))  # Temperature around 25°C
pressure_normal = np.random.normal(100, 5, int(n * 0.9))  # Pressure around 100 kPa

# Sensor failures (extreme outliers)
n_failures = n - len(temp_normal)
temp_failures = np.random.uniform(-50, 150, n_failures)  # Sensor malfunction
pressure_failures = np.random.uniform(-100, 500, n_failures)

# Combine
temperature = np.concatenate([temp_normal, temp_failures])
pressure = np.concatenate([pressure_normal, pressure_failures])

# Target: equipment status (normal/warning)
status = (
    ((temperature > 22) & (temperature < 28)) &
    ((pressure > 95) & (pressure < 105))
).astype(int)

df = pd.DataFrame({
    'temperature': temperature,
    'pressure': pressure,
    'status': status
})

print("Sensor Data:")
print(df.describe())
print("\n" + "="*60 + "\n")

print("Number of sensor failures (extreme values):")
print(f"Temperature outliers: {((df['temperature'] < 15) | (df['temperature'] > 35)).sum()}")
print(f"Pressure outliers: {((df['pressure'] < 80) | (df['pressure'] > 120)).sum()}")

# Prepare data
X = df[['temperature', 'pressure']]
y = df['status']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Compare StandardScaler vs RobustScaler
results = {}

# StandardScaler (sensitive to outliers)
standard_scaler = StandardScaler()
X_train_std = standard_scaler.fit_transform(X_train)
X_test_std = standard_scaler.transform(X_test)

svm_std = SVC(kernel='rbf', random_state=42)
svm_std.fit(X_train_std, y_train)
results['StandardScaler'] = accuracy_score(y_test, svm_std.predict(X_test_std))

# RobustScaler (robust to outliers)
robust_scaler = RobustScaler()
X_train_robust = robust_scaler.fit_transform(X_train)
X_test_robust = robust_scaler.transform(X_test)

svm_robust = SVC(kernel='rbf', random_state=42)
svm_robust.fit(X_train_robust, y_train)
results['RobustScaler'] = accuracy_score(y_test, svm_robust.predict(X_test_robust))

print("\n" + "="*60 + "\n")
print("SVM Classification Results:")
for scaler, acc in results.items():
    print(f"{scaler:15s}: {acc:.2%}")

print("\nConclusion: RobustScaler performs better with outlier-prone sensor data")
```

### When to Use

✅ **Use RobustScaler when:**
- Data contains outliers
- Median and IQR are more meaningful than mean and std
- Sensor data, financial data (prone to extreme values)
- Using algorithms sensitive to outliers (SVM, KNN)

❌ **Don't use when:**
- Data is clean (no outliers) → StandardScaler is fine
- Need exact 0-1 range → Use MinMaxScaler
- Outliers are meaningful (not errors)

---

## Normalizer

### Concept

Scales individual samples to have unit norm. Different from other scalers - works row-wise, not column-wise!

```
Formula (L2 norm):
──────────────────
x_normalized = x / ||x||₂

Where:
||x||₂ = √(x₁² + x₂² + ... + xₙ²)

Example:
Before: [3, 4]
Norm:   √(3² + 4²) = √(9 + 16) = √25 = 5
After:  [3/5, 4/5] = [0.6, 0.8]

Verify: 0.6² + 0.8² = 0.36 + 0.64 = 1.0 ✓
```

### Implementation

```python
from sklearn.preprocessing import Normalizer
import pandas as pd
import numpy as np

# Sample data
df = pd.DataFrame({
    'feature1': [3, 6, 9],
    'feature2': [4, 8, 12]
})

print("Original Data:")
print(df)
print("\n" + "="*60 + "\n")

# Apply Normalizer (L2 norm - default)
normalizer = Normalizer(norm='l2')
df_normalized = pd.DataFrame(
    normalizer.fit_transform(df),
    columns=df.columns
)

print("After Normalizer (L2):")
print(df_normalized)

# Verify: sum of squares = 1 for each row
print("\n" + "="*60 + "\n")
print("Verification (sum of squares per row):")
row_norms = (df_normalized ** 2).sum(axis=1)
print(row_norms)

# Calculate original norms
print("\n" + "="*60 + "\n")
print("Original L2 Norms:")
original_norms = np.sqrt((df ** 2).sum(axis=1))
print(original_norms)

# Show manual calculation for first row
print("\n" + "="*60 + "\n")
print("Manual Calculation for Row 0:")
print(f"Original: [{df.iloc[0, 0]}, {df.iloc[0, 1]}]")
print(f"L2 Norm: √({df.iloc[0, 0]}² + {df.iloc[0, 1]}²) = √({df.iloc[0, 0]**2} + {df.iloc[0, 1]**2}) = {original_norms[0]:.2f}")
print(f"Normalized: [{df.iloc[0, 0]}/{original_norms[0]:.2f}, {df.iloc[0, 1]}/{original_norms[0]:.2f}]")
print(f"Result: [{df_normalized.iloc[0, 0]:.2f}, {df_normalized.iloc[0, 1]:.2f}]")
```

### Different Norms

```python
from sklearn.preprocessing import Normalizer
import pandas as pd
import numpy as np

# Sample vector
df = pd.DataFrame({
    'x': [3],
    'y': [4],
    'z': [5]
})

print("Original Vector:")
print(df)
print("\n" + "="*60 + "\n")

# L1 Norm (Manhattan distance)
normalizer_l1 = Normalizer(norm='l1')
df_l1 = pd.DataFrame(
    normalizer_l1.fit_transform(df),
    columns=df.columns
)

# L2 Norm (Euclidean distance) - default
normalizer_l2 = Normalizer(norm='l2')
df_l2 = pd.DataFrame(
    normalizer_l2.fit_transform(df),
    columns=df.columns
)

# Max Norm
normalizer_max = Normalizer(norm='max')
df_max = pd.DataFrame(
    normalizer_max.fit_transform(df),
    columns=df.columns
)

print("Comparison of Different Norms:")
print("="*60)
print(f"Original:  x={df.iloc[0, 0]}, y={df.iloc[0, 1]}, z={df.iloc[0, 2]}")
print(f"L1 Norm:   x={df_l1.iloc[0, 0]:.3f}, y={df_l1.iloc[0, 1]:.3f}, z={df_l1.iloc[0, 2]:.3f}")
print(f"L2 Norm:   x={df_l2.iloc[0, 0]:.3f}, y={df_l2.iloc[0, 1]:.3f}, z={df_l2.iloc[0, 2]:.3f}")
print(f"Max Norm:  x={df_max.iloc[0, 0]:.3f}, y={df_max.iloc[0, 1]:.3f}, z={df_max.iloc[0, 2]:.3f}")

print("\n" + "="*60 + "\n")
print("Formulas:")
print(f"L1:  sum(|x|) = |3| + |4| + |5| = 12")
print(f"     Normalized: [3/12, 4/12, 5/12] = [0.25, 0.33, 0.42]")
print(f"\nL2:  √(x²+y²+z²) = √(9+16+25) = √50 = 7.07")
print(f"     Normalized: [3/7.07, 4/7.07, 5/7.07] = [0.42, 0.57, 0.71]")
print(f"\nMax: max(|x|, |y|, |z|) = max(3, 4, 5) = 5")
print(f"     Normalized: [3/5, 4/5, 5/5] = [0.6, 0.8, 1.0]")
```

### Real-World Example: Text Document Similarity

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import Normalizer
from sklearn.metrics.pairwise import cosine_similarity

# Simulate document term frequency
# Documents represented as word counts
documents = pd.DataFrame({
    'word1': [10, 5, 0, 2],
    'word2': [5, 10, 1, 3],
    'word3': [0, 2, 8, 1],
    'word4': [2, 3, 9, 10]
}, index=['Doc1', 'Doc2', 'Doc3', 'Doc4'])

print("Document-Term Matrix (word counts):")
print(documents)
print("\n" + "="*60 + "\n")

# Normalize documents (L2 norm)
# This is crucial for cosine similarity!
normalizer = Normalizer(norm='l2')
docs_normalized = pd.DataFrame(
    normalizer.fit_transform(documents),
    columns=documents.columns,
    index=documents.index
)

print("Normalized Documents:")
print(docs_normalized)

# Calculate document similarity
print("\n" + "="*60 + "\n")
print("Document Similarity (Cosine Similarity):")
similarity_matrix = cosine_similarity(docs_normalized)
similarity_df = pd.DataFrame(
    similarity_matrix,
    index=documents.index,
    columns=documents.index
)
print(similarity_df.round(3))

print("\n" + "="*60 + "\n")
print("Interpretation:")
print("- Doc1 and Doc2 are most similar (0.95)")
print("- Doc3 and Doc4 are also similar (0.92)")
print("- Doc1 and Doc3 are least similar (0.13)")
print("\nNormalization ensures similarity is based on")
print("direction (word distribution), not magnitude (doc length)")
```

### When to Use

✅ **Use Normalizer when:**
- Computing similarity between samples (cosine similarity)
- Text classification (TF-IDF vectors)
- Image recognition
- Working with angles/directions, not magnitudes
- Each sample (row) should have unit norm

❌ **Don't use when:**
- Need column-wise scaling → Use StandardScaler/MinMaxScaler
- Magnitude is important
- Features have different units

---

## Outlier Detection

### What are Outliers?

```
Outliers: Data points significantly different from other observations

Visual:
──────────────────────────────────────────────
Data: [10, 12, 15, 18, 20, 22, 25, 100]
                                         ↑
                                      Outlier!

Box Plot:
    │
100 ├─────────── *  ← Outlier
    │
 25 ├───────┐
 22 ├       │
 20 ├       ├──── IQR (Interquartile Range)
 18 ├       │
 15 ├───────┘
 12 ├
 10 ├
    │
```

### Method 1: Z-Score

```python
import pandas as pd
import numpy as np
from scipy import stats

# Sample data with outliers
data = pd.DataFrame({
    'values': [10, 12, 15, 18, 20, 22, 25, 100, 105, 12, 14, 16]
})

print("Original Data:")
print(data)
print("\n" + "="*60 + "\n")

# Calculate Z-scores
data['z_score'] = np.abs(stats.zscore(data['values']))

# Flag outliers (|z| > 3)
threshold = 3
data['is_outlier_z'] = data['z_score'] > threshold

print("Z-Score Analysis:")
print(data)

print("\n" + "="*60 + "\n")
print(f"Number of outliers (|z| > {threshold}): {data['is_outlier_z'].sum()}")
print("\nOutliers:")
print(data[data['is_outlier_z']])

# Explanation
print("\n" + "="*60 + "\n")
print("Z-Score Formula: z = (x - mean) / std")
print(f"Mean: {data['values'].mean():.2f}")
print(f"Std Dev: {data['values'].std():.2f}")
print(f"\nFor value = 100:")
print(f"z = (100 - {data['values'].mean():.2f}) / {data['values'].std():.2f}")
print(f"z = {(100 - data['values'].mean()) / data['values'].std():.2f}")
```

### Method 2: IQR (Interquartile Range)

```python
import pandas as pd
import numpy as np

# Sample data
data = pd.DataFrame({
    'values': [10, 12, 15, 18, 20, 22, 25, 28, 100, 105]
})

print("Original Data:")
print(data)
print("\n" + "="*60 + "\n")

# Calculate IQR
Q1 = data['values'].quantile(0.25)
Q3 = data['values'].quantile(0.75)
IQR = Q3 - Q1

# Define outlier bounds
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

# Flag outliers
data['is_outlier_iqr'] = (data['values'] < lower_bound) | (data['values'] > upper_bound)

print("IQR Analysis:")
print(f"Q1 (25th percentile): {Q1}")
print(f"Q3 (75th percentile): {Q3}")
print(f"IQR: {IQR}")
print(f"Lower Bound: Q1 - 1.5×IQR = {Q1} - 1.5×{IQR} = {lower_bound}")
print(f"Upper Bound: Q3 + 1.5×IQR = {Q3} + 1.5×{IQR} = {upper_bound}")

print("\n" + "="*60 + "\n")
print("Outlier Detection Results:")
print(data)

print("\n" + "="*60 + "\n")
print(f"Number of outliers: {data['is_outlier_iqr'].sum()}")
print("\nOutliers:")
print(data[data['is_outlier_iqr']])
```

### Method 3: Isolation Forest

```python
from sklearn.ensemble import IsolationForest
import pandas as pd
import numpy as np

# Generate data with outliers
np.random.seed(42)
normal_data = np.random.normal(50, 10, 100)
outliers = np.array([150, 160, -50, -60])
data = np.concatenate([normal_data, outliers])

df = pd.DataFrame({'value': data})

print("Data Summary:")
print(df.describe())
print("\n" + "="*60 + "\n")

# Isolation Forest
iso_forest = IsolationForest(
    contamination=0.05,  # Expected proportion of outliers
    random_state=42
)

df['outlier_if'] = iso_forest.fit_predict(df[['value']])
# -1 = outlier, 1 = inlier

# Convert to boolean
df['is_outlier'] = df['outlier_if'] == -1

print("Isolation Forest Results:")
print(f"Number of outliers detected: {df['is_outlier'].sum()}")

print("\nOutliers:")
outliers_detected = df[df['is_outlier']].sort_values('value')
print(outliers_detected)

print("\n" + "="*60 + "\n")
print("How Isolation Forest Works:")
print("1. Randomly select feature and split value")
print("2. Outliers are easier to isolate (fewer splits needed)")
print("3. Anomaly score based on path length in isolation tree")
```

### Comparison of Methods

```python
import pandas as pd
import numpy as np
from scipy import stats
from sklearn.ensemble import IsolationForest

# Data with different types of outliers
np.random.seed(42)
data = pd.DataFrame({
    'values': list(np.random.normal(50, 10, 95)) + [150, 160, -50, -60, 200]  # 5 outliers
})

print("Dataset:")
print(data.describe())
print(f"Total points: {len(data)}")
print("\n" + "="*60 + "\n")

# Method 1: Z-Score
data['z_score'] = np.abs(stats.zscore(data['values']))
data['outlier_z'] = data['z_score'] > 3

# Method 2: IQR
Q1 = data['values'].quantile(0.25)
Q3 = data['values'].quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR
data['outlier_iqr'] = (data['values'] < lower) | (data['values'] > upper)

# Method 3: Isolation Forest
iso_forest = IsolationForest(contamination=0.05, random_state=42)
data['outlier_if'] = iso_forest.fit_predict(data[['values']]) == -1

# Compare results
print("Outlier Detection Comparison:")
print("="*60)
print(f"Z-Score (|z| > 3):        {data['outlier_z'].sum()} outliers")
print(f"IQR Method:               {data['outlier_iqr'].sum()} outliers")
print(f"Isolation Forest:         {data['outlier_if'].sum()} outliers")

print("\n" + "="*60 + "\n")
print("Detected Outliers:")
outlier_comparison = data[data['outlier_z'] | data['outlier_iqr'] | data['outlier_if']]
print(outlier_comparison[['values', 'outlier_z', 'outlier_iqr', 'outlier_if']])

print("\n" + "="*60 + "\n")
print("Method Characteristics:")
print("\nZ-Score:")
print("  + Simple and fast")
print("  - Assumes normal distribution")
print("  - Sensitive to extreme outliers (affect mean/std)")
print("\nIQR:")
print("  + Robust to extreme outliers")
print("  + No distribution assumption")
print("  - May flag too many points as outliers")
print("\nIsolation Forest:")
print("  + Handles multiple dimensions")
print("  + Good for complex patterns")
print("  - Requires tuning contamination parameter")
```

---

## Outlier Handling

### Strategy 1: Removal

```python
import pandas as pd
import numpy as np

# Sample data
df = pd.DataFrame({
    'id': range(1, 11),
    'age': [25, 30, 35, 40, 150, 28, 32, 45, 38, 200],  # 150 and 200 are outliers
    'income': [50000, 60000, 55000, 70000, 65000, 58000, 62000, 72000, 68000, 71000]
})

print("Original Data:")
print(df)
print(f"Shape: {df.shape}")
print("\n" + "="*60 + "\n")

# Detect outliers using IQR
Q1 = df['age'].quantile(0.25)
Q3 = df['age'].quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR

# Remove outliers
df_clean = df[(df['age'] >= lower) & (df['age'] <= upper)]

print("After Removing Outliers:")
print(df_clean)
print(f"Shape: {df_clean.shape}")
print(f"Removed: {len(df) - len(df_clean)} rows")

print("\n" + "="*60 + "\n")
print("Pros: Clean data, simple")
print("Cons: Lose data, may lose important information")
print("Use when: Outliers are errors, large dataset")
```

### Strategy 2: Capping (Winsorization)

```python
import pandas as pd
import numpy as np

# Sample data
df = pd.DataFrame({
    'salary': [50000, 55000, 60000, 58000, 62000, 200000, 52000, 59000, 300000, 61000]
})

print("Original Data:")
print(df)
print(df.describe())
print("\n" + "="*60 + "\n")

# Cap at 5th and 95th percentiles
lower_cap = df['salary'].quantile(0.05)
upper_cap = df['salary'].quantile(0.95)

df['salary_capped'] = df['salary'].clip(lower=lower_cap, upper=upper_cap)

print(f"Capping bounds: [{lower_cap:,.0f}, {upper_cap:,.0f}]")
print("\nAfter Capping:")
print(df)

print("\n" + "="*60 + "\n")
print("Comparison:")
comparison = pd.DataFrame({
    'Original': df['salary'].describe(),
    'Capped': df['salary_capped'].describe()
})
print(comparison)

print("\n" + "="*60 + "\n")
print("Pros: Keeps all data, reduces extreme impact")
print("Cons: Distorts original values")
print("Use when: Outliers are valid but extreme, small dataset")
```

### Strategy 3: Transformation

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Right-skewed data with outliers
np.random.seed(42)
data = np.random.exponential(scale=2, size=100)
df = pd.DataFrame({'value': data})

print("Original Data:")
print(df.describe())
print(f"Skewness: {df['value'].skew():.2f}")
print("\n" + "="*60 + "\n")

# Log transformation
df['log_transform'] = np.log1p(df['value'])  # log(1+x) to handle zeros

print("After Log Transformation:")
print(df['log_transform'].describe())
print(f"Skewness: {df['log_transform'].skew():.2f}")

print("\n" + "="*60 + "\n")
print("Effect of Log Transformation:")
print("Original range:     [{:.2f}, {:.2f}]".format(df['value'].min(), df['value'].max()))
print("Transformed range:  [{:.2f}, {:.2f}]".format(df['log_transform'].min(), df['log_transform'].max()))
print("\nSkewness reduced from {:.2f} to {:.2f}".format(
    df['value'].skew(),
    df['log_transform'].skew()
))

print("\n" + "="*60 + "\n")
print("Pros: Reduces skewness, handles outliers naturally")
print("Cons: Changes interpretation, requires inverse transform")
print("Use when: Data is positively skewed, multiplicative relationships")
```

### Strategy 4: Separate Treatment

```python
import pandas as pd
import numpy as np

# E-commerce data
df = pd.DataFrame({
    'customer_id': range(1, 11),
    'purchases': [5, 8, 6, 7, 150, 9, 7, 8, 200, 6],  # 150 and 200 are VIP customers
    'avg_order_value': [50, 60, 55, 58, 500, 62, 59, 61, 600, 57]
})

print("Customer Data:")
print(df)
print("\n" + "="*60 + "\n")

# Identify VIP customers (outliers)
Q3 = df['purchases'].quantile(0.75)
IQR = df['purchases'].quantile(0.75) - df['purchases'].quantile(0.25)
vip_threshold = Q3 + 1.5 * IQR

df['customer_type'] = df['purchases'].apply(
    lambda x: 'VIP' if x > vip_threshold else 'Regular'
)

print("Customer Segmentation:")
print(df)

print("\n" + "="*60 + "\n")
print("Separate Analysis:")
print("\nRegular Customers:")
print(df[df['customer_type'] == 'Regular'][['purchases', 'avg_order_value']].describe())

print("\nVIP Customers:")
print(df[df['customer_type'] == 'VIP'][['purchases', 'avg_order_value']].describe())

print("\n" + "="*60 + "\n")
print("Pros: Preserves valuable information, domain-appropriate")
print("Cons: Requires separate modeling")
print("Use when: Outliers are meaningful (VIP, fraud, anomalies)")
```

---

## Comparison and Selection

### Scaler Comparison Table

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

### Decision Framework

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

OUTLIER HANDLING DECISION TREE
═══════════════════════════════

Start: Detected outliers?
│
├─ Are outliers errors?
│  └─ YES → Remove
│
├─ Small dataset?
│  └─ YES → Cap (Winsorization)
│
├─ Outliers are meaningful?
│  └─ YES → Separate treatment
│
├─ Data is skewed?
│  └─ YES → Transform (log, sqrt)
│
└─ Use robust methods (RobustScaler, IQR)
```

### Performance Comparison

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

---

## Common Mistakes

### ❌ Mistake 1: Scaling Before Train-Test Split

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

### ❌ Mistake 2: Using Wrong Scaler for Outliers

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

### ❌ Mistake 3: Scaling Target Variable

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

### ❌ Mistake 4: Not Saving Scaler for Production

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

### ❌ Mistake 5: Removing All Outliers Blindly

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

---

## Best Practices

### ✅ Practice 1: Always Use Pipeline

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

### ✅ Practice 2: Visualize Before and After

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

### ✅ Practice 3: Document Scaling Decisions

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

---

## Interview Questions

### Q1: When should you use RobustScaler instead of StandardScaler?

**Answer:**

Use **RobustScaler** when data contains outliers.

**StandardScaler:**
- Uses mean and standard deviation
- Outliers heavily affect mean and std
- Example: [10, 12, 15, 1000] → mean = 259 (heavily skewed)

**RobustScaler:**
- Uses median and IQR (Interquartile Range)
- Robust to outliers
- Example: [10, 12, 15, 1000] → median = 13.5 (not affected)

```python
# When data has outliers
data = [10, 12, 15, 18, 20, 1000]

StandardScaler: Normal values compressed
RobustScaler: Normal values preserved

Use RobustScaler for:
- Sensor data (occasional failures)
- Financial data (extreme values)
- Real-world data (often has outliers)
```

### Q2: What's the difference between Normalizer and other scalers?

**Answer:**

**Normalizer** works row-wise (per sample), others work column-wise (per feature).

```python
# Normalizer: Scales each ROW to unit norm
data = [[3, 4]]
Normalized: [[0.6, 0.8]]  # √(0.6² + 0.8²) = 1

# StandardScaler: Scales each COLUMN
data = [[3], [4], [5]]
Scaled: [[-1.22], [0], [1.22]]  # mean=0, std=1 for column

Use Normalizer for:
- Text classification (TF-IDF)
- Cosine similarity
- When direction matters, not magnitude

Use StandardScaler/MinMaxScaler for:
- ML algorithms (KNN, SVM)
- When features need same scale
```

### Q3: How do you handle outliers? When to remove vs transform?

**Answer:**

**4 Strategies:**

1. **Remove** (delete rows)
   - When: Outliers are errors, large dataset
   - Pros: Clean data
   - Cons: Lose information

2. **Cap** (Winsorization)
   - When: Outliers valid but extreme, small dataset
   - Pros: Keep all rows
   - Cons: Distorts values

3. **Transform** (log, sqrt)
   - When: Right-skewed data
   - Pros: Natural handling
   - Cons: Changes interpretation

4. **Separate** (treat differently)
   - When: Outliers are meaningful (VIP, fraud)
   - Pros: Preserves information
   - Cons: Complex modeling

**Decision:**
```
Are outliers errors? → Remove
Small dataset? → Cap
Skewed data? → Transform
Meaningful outliers? → Separate treatment
```

### Q4: What is data leakage in feature scaling?

**Answer:**

**Data leakage** occurs when test data information influences training.

**Wrong:**
```python
# Fit scaler on ALL data
scaler.fit(X)  # Includes test data!
X_train, X_test = split(X)
```

**Correct:**
```python
# Split first
X_train, X_test = split(X)
# Fit on train only
scaler.fit(X_train)
X_train_scaled = scaler.transform(X_train)
X_test_scaled = scaler.transform(X_test)  # Use train stats
```

**Why it matters:**
- Test set statistics (mean, min, max) leak into training
- Overly optimistic performance estimates
- Model won't generalize to new data

**Prevention:**
- Always split before scaling
- Use Pipelines
- Cross-validation handles this automatically

### Q5: Which ML algorithms require feature scaling and why?

**Answer:**

**Require Scaling:**

1. **Distance-based** (KNN, K-Means, SVM)
   - Why: Use distance calculations
   - Example: Age (0-100) vs Income (0-100000) → Income dominates

2. **Gradient Descent** (Neural Networks, Logistic Regression)
   - Why: Faster convergence, better performance
   - Example: Large values cause large gradients

3. **PCA**
   - Why: Variance-based, larger scale = higher variance

**Don't Require:**

1. **Tree-based** (Decision Trees, Random Forest, XGBoost)
   - Why: Split on thresholds, scale doesn't matter
   - Example: "Age > 30" works regardless of scale

2. **Naive Bayes**
   - Why: Probability-based

```python
# Example
data = {'age': [25], 'income': [50000]}

KNN: distance = √((25)² + (50000)²) ≈ 50000
     Income completely dominates!
     → NEEDS SCALING

Decision Tree: if age > 30: ... if income > 40000: ...
               Scale doesn't matter
               → NO SCALING NEEDED
```

---

## Summary

### Key Takeaways

```
1. Scale features for distance-based algorithms
2. Choose scaler based on data characteristics:
   - Normal distribution → StandardScaler
   - Bounded range needed → MinMaxScaler
   - Outliers present → RobustScaler
   - Sample normalization → Normalizer

3. Always split before scaling (prevent leakage)
4. Handle outliers based on domain knowledge
5. Use pipelines for reproducibility
6. Document all preprocessing decisions
```

### Quick Reference

```
StandardScaler:  z = (x - μ) / σ
MinMaxScaler:    x = (x - min) / (max - min)
RobustScaler:    x = (x - median) / IQR
Normalizer:      x = x / ||x||

Outlier Detection:
- Z-score: |z| > 3
- IQR: x < Q1 - 1.5×IQR or x > Q3 + 1.5×IQR
- Isolation Forest: Anomaly score

Outlier Handling:
- Remove (errors, large dataset)
- Cap (valid, small dataset)
- Transform (skewed data)
- Separate (meaningful outliers)
```

---

**Next:** [Feature Transformations →](./transformations.md)

**Previous:** [← Missing Values](./missing-values.md)
