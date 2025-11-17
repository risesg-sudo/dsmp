# Power Transformer and Custom Transformations

## Introduction

Beyond standard transformations, you'll often need custom solutions for domain-specific problems. Learn how to use sklearn's unified PowerTransformer interface and create custom transformations that capture unique patterns in your data.

## PowerTransformer: Unified Interface

sklearn provides a single interface for both Box-Cox and Yeo-Johnson.

```python
from sklearn.preprocessing import PowerTransformer
import numpy as np
import pandas as pd

# Sample data
np.random.seed(42)
df = pd.DataFrame({
    'positive_skewed': np.random.exponential(scale=2, size=500),
    'negative_skewed': -np.random.exponential(scale=2, size=500) + 10,
    'with_negatives': np.random.normal(0, 5, size=500)
})

print("Original Data:")
print("="*60)
print(df.describe())
print("\nSkewness:")
print(df.skew())

print("\n" + "="*60 + "\n")

# Box-Cox (only for positive data)
print("Attempting Box-Cox on all columns...")
try:
    transformer_bc = PowerTransformer(method='box-cox', standardize=True)
    df_bc = transformer_bc.fit_transform(df)
    print("Success!")
except ValueError as e:
    print(f"Failed: {e}")

print("\n" + "="*60 + "\n")

# Yeo-Johnson (works for any data)
print("Applying Yeo-Johnson on all columns...")
transformer_yj = PowerTransformer(method='yeo-johnson', standardize=True)
df_yj = pd.DataFrame(
    transformer_yj.fit_transform(df),
    columns=df.columns
)

print("After Yeo-Johnson Transformation:")
print(df_yj.describe())
print("\nSkewness:")
print(df_yj.skew())

print("\n" + "="*60 + "\n")
print("Parameters:")
for i, col in enumerate(df.columns):
    print(f"{col:20s}: λ = {transformer_yj.lambdas_[i]:7.4f}")

# Standardize option
print("\n" + "="*60 + "\n")
print("Effect of standardize=True:")
print("- Applies transformation")
print("- Then standardizes to mean=0, std=1")
print(f"Means:  {df_yj.mean().values}")
print(f"Stds:   {df_yj.std().values}")
```

## Common Custom Transformations

Beyond standard methods, create transformations for specific needs.

```python
import numpy as np
import pandas as pd

# Sample data
data = pd.DataFrame({
    'value': [1, 2, 5, 10, 20, 50, 100, 200, 500]
})

print("Original Data:")
print(data)
print("\n" + "="*60 + "\n")

# 1. Cube Root
data['cube_root'] = np.cbrt(data['value'])

# 2. Reciprocal (1/x)
data['reciprocal'] = 1 / data['value']

# 3. Exponential
data['exponential'] = np.exp(data['value'] / data['value'].max())

# 4. Sigmoid
data['sigmoid'] = 1 / (1 + np.exp(-data['value'] / 100))

# 5. Rank transformation
data['rank'] = data['value'].rank()

print("Custom Transformations:")
print(data)

print("\n" + "="*60 + "\n")
print("Use Cases:")
print("Cube Root:    Less aggressive than sqrt")
print("Reciprocal:   Inverse relationship")
print("Exponential:  Amplify large values")
print("Sigmoid:      Bound between 0 and 1")
print("Rank:         Ordinal transformation")
```

## Domain-Specific Transformations

Create transformations that capture business logic.

```python
import pandas as pd
import numpy as np

# E-commerce data
df = pd.DataFrame({
    'price': [10, 50, 100, 500, 1000],
    'quantity': [100, 50, 20, 5, 2],
    'days_since_purchase': [1, 7, 30, 90, 365]
})

print("Original E-commerce Data:")
print(df)
print("\n" + "="*60 + "\n")

# 1. Price per unit (interaction)
df['price_per_unit'] = df['price'] / df['quantity']

# 2. Recency score (inverse time)
df['recency_score'] = 1 / (1 + df['days_since_purchase'])

# 3. Price tier (binning)
df['price_tier'] = pd.cut(
    df['price'],
    bins=[0, 50, 200, float('inf')],
    labels=['Low', 'Medium', 'High']
)

# 4. Log of monetary value
df['log_value'] = np.log1p(df['price'] * df['quantity'])

print("After Domain-Specific Transformations:")
print(df)

print("\n" + "="*60 + "\n")
print("Transformations Applied:")
print("1. Price per unit: price / quantity")
print("2. Recency score: 1 / (1 + days)")
print("3. Price tier: Categorization")
print("4. Log value: log(price × quantity)")
```

## Creating Custom Transformer Classes

Build reusable transformers that integrate with sklearn pipelines.

```python
from sklearn.base import BaseEstimator, TransformerMixin
import numpy as np

class LogPlusConstantTransformer(BaseEstimator, TransformerMixin):
    """
    Log transformation with automatic constant for negative values
    """
    def __init__(self):
        self.constant_ = None

    def fit(self, X, y=None):
        # Find minimum and add constant if needed
        X_min = np.min(X)
        if X_min <= 0:
            self.constant_ = abs(X_min) + 1
        else:
            self.constant_ = 0
        return self

    def transform(self, X):
        if self.constant_ is None:
            raise ValueError("Must fit before transform")
        return np.log(X + self.constant_)

    def inverse_transform(self, X):
        return np.exp(X) - self.constant_

# Usage
data = np.array([[-5], [0], [5], [10], [100]])

transformer = LogPlusConstantTransformer()
transformer.fit(data)
print(f"Constant added: {transformer.constant_}")

transformed = transformer.transform(data)
print(f"\nTransformed: {transformed.ravel()}")

inverse = transformer.inverse_transform(transformed)
print(f"Inverse: {inverse.ravel()}")
```

## Choosing the Right Transformation

Decision framework for selecting transformations.

```python
import numpy as np
from scipy import stats

def recommend_transformation(data, feature_name):
    """
    Recommend transformation based on data characteristics
    """
    print(f"\nAnalyzing: {feature_name}")
    print("="*60)

    # Check characteristics
    skewness = stats.skew(data)
    has_zeros = (data == 0).any()
    has_negatives = (data < 0).any()
    min_val = data.min()
    max_val = data.max()
    span = max_val / min_val if min_val > 0 else None

    print(f"Skewness: {skewness:.2f}")
    print(f"Range: [{min_val:.2f}, {max_val:.2f}]")
    if span:
        print(f"Spans {span:.1f}x orders of magnitude")

    # Recommendation
    print("\nRecommendation:")

    if has_negatives:
        print("→ Use Yeo-Johnson (has negatives)")
    elif has_zeros:
        print("→ Use log1p or Yeo-Johnson (has zeros)")
    elif abs(skewness) < 0.5:
        print("→ No transformation needed (low skew)")
    elif abs(skewness) < 1:
        if span and span > 100:
            print("→ Use log (moderate skew, large span)")
        else:
            print("→ Use sqrt (moderate skew)")
    else:
        print("→ Use log or Box-Cox (high skew)")

    return skewness

# Test on different data
income = np.random.exponential(scale=50000, size=1000)
recommend_transformation(income, "Income")

temperature = np.random.normal(0, 20, 1000)
recommend_transformation(temperature, "Temperature")

count = np.random.poisson(lam=10, size=1000)
recommend_transformation(count, "Count")
```

## Best Practices

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PowerTransformer, FunctionTransformer
from sklearn.linear_model import LinearRegression
import numpy as np

# Custom transformation function
def custom_transform(X):
    """Apply custom business logic"""
    return np.log1p(X) / (1 + np.exp(-X/100))

# Create pipeline with custom transformer
pipeline = Pipeline([
    ('custom', FunctionTransformer(custom_transform)),
    ('power', PowerTransformer(method='yeo-johnson')),
    ('model', LinearRegression())
])

# Or use lambda
pipeline2 = Pipeline([
    ('log', FunctionTransformer(np.log1p)),
    ('model', LinearRegression())
])

print("Custom transformers integrate seamlessly with pipelines")
```

## Summary

Power transformer and custom transformations provide flexibility:
- **PowerTransformer:** Unified interface for Box-Cox and Yeo-Johnson
- **Custom transformations:** Domain-specific needs
- **sklearn integration:** Build transformer classes
- **Best practice:** Use pipelines for reproducibility

Choose transformation based on:
1. Data characteristics (skewness, range, negatives)
2. Domain requirements
3. Model needs
4. Interpretability

---

**Navigation:**
- **Previous:** [← Yeo-Johnson](./transformations-yeo-johnson.md)
- **Next:** [Comparison Guide →](./transformations-comparison-guide.md)
- **Related:** [Box-Cox](./transformations-box-cox.md)
