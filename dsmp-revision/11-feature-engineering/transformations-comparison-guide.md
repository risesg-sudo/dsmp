# Feature Transformations - Comparison and Best Practices

## Introduction

With multiple transformation methods available, choosing the right one is crucial. This guide compares all transformation techniques, provides decision frameworks, reveals common mistakes, and shares battle-tested best practices.

## Transformation Comparison Table

```python
import pandas as pd

comparison = pd.DataFrame({
    'Transformation': ['Log', 'Square Root', 'Box-Cox', 'Yeo-Johnson', 'Custom'],
    'Formula': [
        'log(x) or log(x+1)',
        '√x',
        '(x^λ - 1) / λ',
        'Complex (see docs)',
        'User-defined'
    ],
    'Data Requirements': [
        'x > 0 (or x ≥ 0 with +1)',
        'x ≥ 0',
        'x > 0',
        'Any x',
        'Depends'
    ],
    'Aggressiveness': [
        'High',
        'Moderate',
        'Automatic',
        'Automatic',
        'Varies'
    ],
    'Interpretability': [
        'Medium',
        'High',
        'Low',
        'Low',
        'Varies'
    ],
    'Best For': [
        'Exponential growth',
        'Count data',
        'Positive continuous',
        'Any continuous',
        'Domain-specific'
    ]
})

print("="*100)
print("TRANSFORMATION COMPARISON")
print("="*100)
print(comparison.to_string(index=False))
```

## Decision Framework

```
TRANSFORMATION SELECTION
═══════════════════════════

Step 1: Check data characteristics
│
├─ Contains negatives or zeros?
│  ├─ YES → Yeo-Johnson or Custom
│  └─ NO  → Continue to Step 2
│
Step 2: Check skewness
│
├─ Skewness > 1 (highly skewed)
│  └─ → Log transformation
│
├─ Skewness 0.5-1 (moderately skewed)
│  └─ → Square root or Box-Cox
│
└─ Skewness < 0.5 (approximately normal)
   └─ → No transformation needed

Step 3: Check if automatic is preferred
│
├─ Want automatic optimal transformation?
│  ├─ Data all positive → Box-Cox
│  └─ Data has negatives → Yeo-Johnson
│
└─ Want specific transformation?
   └─ Choose Log, Sqrt, or Custom

Step 4: Validate
│
└─ Check if skewness improved
   └─ If not, try different transformation
```

## Performance Comparison

```python
import numpy as np
import pandas as pd
from scipy import stats
from sklearn.preprocessing import PowerTransformer

# Generate highly skewed data
np.random.seed(42)
data = np.random.exponential(scale=2, size=1000)

# Original statistics
original_skew = stats.skew(data)

results = {
    'Original': {
        'skewness': original_skew,
        'data': data
    }
}

# Log transformation
log_data = np.log1p(data)
results['Log'] = {
    'skewness': stats.skew(log_data),
    'data': log_data
}

# Square root
sqrt_data = np.sqrt(data)
results['Square Root'] = {
    'skewness': stats.skew(sqrt_data),
    'data': sqrt_data
}

# Box-Cox
bc_transformer = PowerTransformer(method='box-cox')
bc_data = bc_transformer.fit_transform(data.reshape(-1, 1)).ravel()
results['Box-Cox'] = {
    'skewness': stats.skew(bc_data),
    'lambda': bc_transformer.lambdas_[0],
    'data': bc_data
}

# Yeo-Johnson
yj_transformer = PowerTransformer(method='yeo-johnson')
yj_data = yj_transformer.fit_transform(data.reshape(-1, 1)).ravel()
results['Yeo-Johnson'] = {
    'skewness': stats.skew(yj_data),
    'lambda': yj_transformer.lambdas_[0],
    'data': yj_data
}

print("TRANSFORMATION COMPARISON")
print("="*60)
print(f"Original Skewness: {original_skew:.4f}")
print("\n" + "="*60 + "\n")

for name, result in results.items():
    if name == 'Original':
        continue

    skew = result['skewness']
    improvement = ((abs(original_skew) - abs(skew)) / abs(original_skew)) * 100

    print(f"{name:15s}:")
    print(f"  Skewness:    {skew:7.4f}")
    print(f"  Improvement: {improvement:6.1f}%")

    if 'lambda' in result:
        print(f"  λ (lambda):  {result['lambda']:7.4f}")

    print()

# Find best
best_transform = min(
    [(name, abs(result['skewness'])) for name, result in results.items() if name != 'Original'],
    key=lambda x: x[1]
)

print("="*60)
print(f"Best Transformation: {best_transform[0]}")
print(f"Final Skewness: {best_transform[1]:.4f}")
```

## Common Mistakes

### Mistake 1: Transforming Already Normal Data

```python
import numpy as np
from scipy import stats

# Already normal data
normal_data = np.random.normal(50, 10, 1000)

print(f"Original Skewness: {stats.skew(normal_data):.2f}")
print("→ Close to 0, approximately normal")
print("\nDon't transform! It's already good.")

# Transforming anyway (wrong!)
log_data = np.log(normal_data)  # Will fail or distort
print("\nTransforming normal data can make it worse!")
```

### Mistake 2: Not Inverse Transforming Predictions

```python
import numpy as np
from sklearn.linear_model import LinearRegression

# Train with log-transformed target
y_train_log = np.log1p(y_train)

model = LinearRegression()
model.fit(X_train, y_train_log)

# WRONG: Predict without inverse transform
predictions_log = model.predict(X_test)
# These are in log scale, not original scale!

# CORRECT: Inverse transform
predictions = np.expm1(predictions_log)  # exp(x) - 1
# Now in original scale
```

### Mistake 3: Using Log on Zero/Negative Values

```python
import numpy as np

data = [0, 1, 10, 100]

# WRONG
try:
    np.log(data)  # Error! log(0) undefined
except:
    print("Error: Can't take log of 0")

# CORRECT
np.log1p(data)  # log(1 + x), handles zeros
```

### Mistake 4: Not Checking Effect

```python
# WRONG: Apply transformation blindly
transformed = np.log1p(data)

# CORRECT: Check if it helped
from scipy import stats

print(f"Original Skewness: {stats.skew(data):.2f}")
print(f"Transformed Skewness: {stats.skew(transformed):.2f}")

if abs(stats.skew(transformed)) < abs(stats.skew(data)):
    print("✓ Transformation improved distribution")
else:
    print("✗ Transformation didn't help, try another")
```

### Mistake 5: Transforming Before Train-Test Split

```python
# WRONG
data_transformed = np.log1p(data)
train, test = split(data_transformed)

# CORRECT (for Box-Cox/Yeo-Johnson)
train, test = split(data)

transformer = PowerTransformer()
train_transformed = transformer.fit_transform(train)
test_transformed = transformer.transform(test)  # Use train params
```

## Best Practices

### Practice 1: Always Visualize

```python
import matplotlib.pyplot as plt
import numpy as np
from scipy import stats

# Before and after transformation
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

data = np.random.exponential(scale=2, size=1000)
transformed = np.log1p(data)

# Original histogram
axes[0, 0].hist(data, bins=50, edgecolor='black')
axes[0, 0].set_title(f'Original (Skew: {stats.skew(data):.2f})')

# Transformed histogram
axes[0, 1].hist(transformed, bins=50, edgecolor='black')
axes[0, 1].set_title(f'Transformed (Skew: {stats.skew(transformed):.2f})')

# Original Q-Q plot
stats.probplot(data, dist="norm", plot=axes[1, 0])
axes[1, 0].set_title('Original Q-Q Plot')

# Transformed Q-Q plot
stats.probplot(transformed, dist="norm", plot=axes[1, 1])
axes[1, 1].set_title('Transformed Q-Q Plot')

plt.tight_layout()
```

### Practice 2: Use Pipelines

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PowerTransformer
from sklearn.linear_model import LinearRegression

# Pipeline ensures correct order
pipeline = Pipeline([
    ('transform', PowerTransformer(method='yeo-johnson')),
    ('model', LinearRegression())
])

pipeline.fit(X_train, y_train)
predictions = pipeline.predict(X_test)
```

### Practice 3: Document Transformations

```python
transformation_log = {
    'sales': {
        'method': 'log',
        'reason': 'Highly right-skewed (skew=2.1)',
        'before_skew': 2.1,
        'after_skew': 0.3,
        'inverse': 'np.expm1()'
    },
    'count': {
        'method': 'sqrt',
        'reason': 'Count data, moderate skew',
        'before_skew': 0.8,
        'after_skew': 0.2,
        'inverse': 'x**2'
    }
}
```

## Quick Reference Card

```
TRANSFORMATION QUICK REFERENCE
═════════════════════════════

Log:           y = log(x + 1)
               - Highly skewed data
               - x ≥ 0

Sqrt:          y = √x
               - Moderately skewed
               - x ≥ 0
               - Count data

Box-Cox:       y = (x^λ - 1) / λ
               - Automatic optimal
               - x > 0 required

Yeo-Johnson:   Complex formula
               - Like Box-Cox
               - Works with any x

Inverse Transforms:
- Log:  np.expm1(y)
- Sqrt: y**2
- Box-Cox/YJ: transformer.inverse_transform(y)
```

## Decision Matrix

```
Data Characteristics → Transformation
════════════════════════════════════

Strictly positive + highly skewed  → Log
Strictly positive + moderate skew  → Sqrt
Strictly positive + unknown skew   → Box-Cox
Has zeros/negatives + skewed       → Yeo-Johnson
Count data                         → Sqrt or Log
Already normal                     → None
```

## Summary

Key principles for effective transformation:

1. **Check first:** Measure skewness before transforming
2. **Choose wisely:** Based on data characteristics
3. **Validate impact:** Check if it improved distribution
4. **Use pipelines:** Prevent mistakes
5. **Document:** Keep track of transformations
6. **Inverse transform:** For predictions
7. **Visualize:** Before and after

Remember: Transformation is about reshaping distribution, not just applying formulas blindly.

---

**Navigation:**
- **Previous:** [← Power Transformer](./transformations-power-custom.md)
- **Next:** [Interview Questions →](./transformations-interview-questions.md)
- **Related:** [Why Transform](./transformations-why-needed.md)
