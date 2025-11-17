# MinMaxScaler - Range Normalization

## Introduction

Need your features bounded between 0 and 1? MinMaxScaler is the perfect choice. You'll learn how it rescales features to a specific range, why it's essential for neural networks and image processing, and understand its critical limitation with outliers.

## The Concept

MinMaxScaler transforms features to a specified range, typically [0, 1].

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

## Basic Implementation

Let's see how MinMaxScaler works with different ranges.

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

## Real-World Example: Image Processing

See why MinMaxScaler is preferred for neural network inputs.

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

## The Outlier Problem

MinMaxScaler's biggest weakness is sensitivity to outliers.

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

## When to Use MinMaxScaler

Choose wisely based on your data and algorithm requirements.

**Use MinMaxScaler when:**
- Bounded output is needed (e.g., neural network activation functions)
- Features are not normally distributed
- Data doesn't have outliers
- Need interpretable scale (0-1)
- Image processing, computer vision
- Features represent probabilities or percentages

**Avoid MinMaxScaler when:**
- Data has outliers (they'll compress normal values)
- Need statistical properties (mean=0, std=1)
- Using algorithms sensitive to outliers
- Don't need specific range

## Best Practices

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import MinMaxScaler
from sklearn.neural_network import MLPClassifier

# Use Pipeline for correct workflow
pipeline = Pipeline([
    ('scaler', MinMaxScaler()),
    ('classifier', MLPClassifier())
])

# Fit pipeline (scaler fits on train only)
pipeline.fit(X_train, y_train)

# Predict (scaler transforms using train stats)
predictions = pipeline.predict(X_test)
```

## Summary

MinMaxScaler is ideal when you need bounded features:
- Transforms to specified range (default [0, 1])
- Perfect for neural networks and image processing
- Very sensitive to outliers
- Always check for outliers before using
- Use with Pipeline to prevent data leakage

---

**Navigation:**
- **Previous:** [← StandardScaler](./scaling-standardscaler.md)
- **Next:** [RobustScaler →](./scaling-robustscaler.md)
- **Related:** [Outlier Detection](./outliers-detection-methods.md)
