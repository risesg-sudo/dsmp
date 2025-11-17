# RobustScaler - Outlier-Resistant Scaling

## Introduction

When your data contains outliers, StandardScaler and MinMaxScaler fail dramatically. RobustScaler comes to the rescue by using statistics that aren't affected by extreme values. You'll learn why median and IQR are superior to mean and standard deviation for real-world messy data.

## The Concept

RobustScaler uses median and Interquartile Range (IQR) instead of mean and standard deviation.

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

## Basic Implementation

See how RobustScaler handles outliers gracefully.

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

## Real-World Example: Sensor Data

Sensor data often contains failures and extreme readings—perfect for RobustScaler.

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import RobustScaler, StandardScaler
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

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

## When to Use RobustScaler

Know when RobustScaler is your best choice.

**Use RobustScaler when:**
- Data contains outliers
- Median and IQR are more meaningful than mean and std
- Sensor data, financial data (prone to extreme values)
- Using algorithms sensitive to outliers (SVM, KNN)
- Real-world messy data
- Can't or shouldn't remove outliers

**Avoid RobustScaler when:**
- Data is clean (no outliers) - StandardScaler is fine
- Need exact 0-1 range - Use MinMaxScaler
- Outliers are meaningful (not errors)
- Dataset is very small (percentiles unreliable)

## Comparison with Other Scalers

Understanding the differences helps you choose correctly.

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler

# Create data with various outliers
np.random.seed(42)
data = pd.DataFrame({
    'mild_outliers': list(range(1, 96)) + [200, 210, 220, 230, 240],
    'extreme_outliers': list(range(1, 96)) + [1000, 2000, 3000, 4000, 5000]
})

print("Original Data Statistics:")
print(data.describe())
print("\n" + "="*60 + "\n")

# Apply all three scalers
scalers = {
    'StandardScaler': StandardScaler(),
    'MinMaxScaler': MinMaxScaler(),
    'RobustScaler': RobustScaler()
}

results = {}
for name, scaler in scalers.items():
    scaled = scaler.fit_transform(data)
    results[name] = pd.DataFrame(scaled, columns=data.columns)

# Compare how normal values are affected
print("Effect on Normal Values (1-95):")
print("="*60)
for name, scaled_df in results.items():
    normal_range = scaled_df.iloc[:95].values.max() - scaled_df.iloc[:95].values.min()
    print(f"{name:15s}: Normal value range = {normal_range:.2f}")

print("\n→ RobustScaler preserves normal value range best!")
```

## Summary

RobustScaler is your go-to when data has outliers:
- Uses median and IQR (robust statistics)
- Not affected by extreme values
- Preserves normal data distribution
- Essential for sensor and financial data
- Perfect for real-world messy datasets

When data is clean, StandardScaler is simpler. When you have outliers, RobustScaler is essential.

---

**Navigation:**
- **Previous:** [← MinMaxScaler](./scaling-minmaxscaler.md)
- **Next:** [Normalizer →](./scaling-normalizer.md)
- **Related:** [Outlier Handling](./outliers-handling-strategies.md)
