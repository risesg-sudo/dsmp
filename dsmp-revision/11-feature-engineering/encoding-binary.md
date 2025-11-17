# Binary Encoding - Complete Guide

## What You'll Learn

Binary encoding offers a middle ground between one-hot and target encoding. It converts categories to binary digits, creating fewer columns than one-hot while maintaining better interpretability than target encoding. Discover when this technique shines.

## The Concept

Binary encoding first converts categories to integers, then represents those integers as binary digits. This creates log2(n) columns instead of n columns, dramatically reducing dimensionality.

### Visual Example

```
Original Categories:
┌────┬──────────┐
│ ID │ Category │
├────┼──────────┤
│ 1  │    A     │
│ 2  │    B     │
│ 3  │    C     │
│ 4  │    D     │
│ 5  │    E     │
└────┴──────────┘

Step 1: Ordinal Encoding:
A→0, B→1, C→2, D→3, E→4

Step 2: Binary Conversion:
0 → 000
1 → 001
2 → 010
3 → 011
4 → 100

Final Binary Encoding:
┌────┬──────────┬──────┬──────┬──────┐
│ ID │ Category │ Bit_0│ Bit_1│ Bit_2│
├────┼──────────┼──────┼──────┼──────┤
│ 1  │    A     │  0   │  0   │  0   │
│ 2  │    B     │  1   │  0   │  0   │
│ 3  │    C     │  0   │  1   │  0   │
│ 4  │    D     │  1   │  1   │  0   │
│ 5  │    E     │  0   │  0   │  1   │
└────┴──────────┴──────┴──────┴──────┘

Space Efficiency:
- 5 categories
- One-Hot: 5 columns
- Binary: 3 columns (log2(5) = 2.32 → 3)
```

## Python Implementation

```python
from category_encoders import BinaryEncoder
import pandas as pd
import numpy as np

# Sample data with moderate cardinality
df = pd.DataFrame({
    'product_id': ['P001', 'P002', 'P003', 'P004', 'P005', 'P006', 'P007', 'P008'],
    'sales': [100, 150, 200, 180, 220, 160, 190, 210]
})

print("Original Data:")
print(df)
print("\n" + "="*60 + "\n")

# Create binary encoder
encoder = BinaryEncoder(cols=['product_id'])

# Fit and transform
df_encoded = encoder.fit_transform(df)

print("After Binary Encoding:")
print(df_encoded)
print(f"\nOriginal: 1 column with {df['product_id'].nunique()} categories")
print(f"Binary: {df_encoded.shape[1] - 1} binary columns")

# Calculate efficiency
n_categories = df['product_id'].nunique()
onehot_cols = n_categories
binary_cols = int(np.ceil(np.log2(n_categories)))

print(f"\nEfficiency Comparison:")
print(f"One-Hot Encoding: {onehot_cols} columns")
print(f"Binary Encoding: {binary_cols} columns")
print(f"Space saved: {((onehot_cols - binary_cols) / onehot_cols * 100):.1f}%")
```

## Space Efficiency Calculator

```python
import numpy as np

def compare_encoding_sizes(n_categories):
    """
    Compare column counts for different encoding methods
    """
    onehot = n_categories
    binary = int(np.ceil(np.log2(n_categories))) if n_categories > 0 else 0
    target = 1

    space_saved = ((onehot - binary) / onehot * 100) if onehot > 0 else 0

    return {
        'categories': n_categories,
        'one_hot': onehot,
        'binary': binary,
        'target': target,
        'space_saved_pct': space_saved
    }

# Compare for different cardinalities
cardinalities = [5, 10, 20, 50, 100, 500, 1000]

print("ENCODING SPACE COMPARISON")
print("="*70)
print(f"{'Categories':>12} {'One-Hot':>10} {'Binary':>10} {'Target':>10} {'Space Saved':>12}")
print("-"*70)

for n in cardinalities:
    result = compare_encoding_sizes(n)
    print(f"{result['categories']:>12} {result['one_hot']:>10} {result['binary']:>10} "
          f"{result['target']:>10} {result['space_saved_pct']:>11.1f}%")
```

## Real-World Example: Product Catalog

```python
import pandas as pd
import numpy as np
from category_encoders import BinaryEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# Create product catalog with 50 products
np.random.seed(42)
products = [f'SKU_{str(i).zfill(4)}' for i in range(1, 51)]

df = pd.DataFrame({
    'product_sku': np.random.choice(products, 500),
    'price': np.random.uniform(10, 500, 500),
    'discount': np.random.uniform(0, 0.3, 500),
    'rating': np.random.uniform(3, 5, 500),
    'sales_volume': np.random.randint(10, 1000, 500)
})

print(f"Dataset shape: {df.shape}")
print(f"Number of unique products: {df['product_sku'].nunique()}")
print("\n" + "="*60 + "\n")

# Split data
X = df.drop('sales_volume', axis=1)
y = df['sales_volume']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Apply binary encoding
encoder = BinaryEncoder(cols=['product_sku'])
X_train_encoded = encoder.fit_transform(X_train)
X_test_encoded = encoder.transform(X_test)

print("Encoded Training Data:")
print(X_train_encoded.head())
print(f"\nShape: {X_train_encoded.shape}")

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train_encoded, y_train)

predictions = model.predict(X_test_encoded)
rmse = np.sqrt(mean_squared_error(y_test, predictions))

print(f"\nModel RMSE: {rmse:.2f}")
print(f"\nBinary encoding created {len([col for col in X_train_encoded.columns if 'product' in col])} columns")
print(f"One-Hot would have created {df['product_sku'].nunique()} columns!")
```

## Comparison with Other Methods

```python
import pandas as pd
import numpy as np
from category_encoders import BinaryEncoder, OneHotEncoder, TargetEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

# Generate data with 30 categories
np.random.seed(42)
n_samples = 1000
n_categories = 30

X = pd.DataFrame({
    'category': [f'Cat_{i}' for i in np.random.randint(0, n_categories, n_samples)]
})
y = (np.random.randn(n_samples) > 0).astype(int)

print("Testing Different Encoding Methods")
print("="*60)
print(f"Data: {n_samples} samples, {n_categories} categories\n")

# One-Hot Encoding
onehot_encoder = OneHotEncoder()
X_onehot = onehot_encoder.fit_transform(X)
score_onehot = cross_val_score(
    RandomForestClassifier(n_estimators=50, random_state=42),
    X_onehot, y, cv=3
).mean()

print(f"One-Hot Encoding:")
print(f"  Columns: {X_onehot.shape[1]}")
print(f"  CV Score: {score_onehot:.4f}\n")

# Binary Encoding
binary_encoder = BinaryEncoder()
X_binary = binary_encoder.fit_transform(X)
score_binary = cross_val_score(
    RandomForestClassifier(n_estimators=50, random_state=42),
    X_binary, y, cv=3
).mean()

print(f"Binary Encoding:")
print(f"  Columns: {X_binary.shape[1]}")
print(f"  CV Score: {score_binary:.4f}\n")

# Target Encoding
target_encoder = TargetEncoder()
X_target = target_encoder.fit_transform(X, y)
score_target = cross_val_score(
    RandomForestClassifier(n_estimators=50, random_state=42),
    X_target, y, cv=3
).mean()

print(f"Target Encoding:")
print(f"  Columns: {X_target.shape[1]}")
print(f"  CV Score: {score_target:.4f}")
```

## When to Use Binary Encoding

### Perfect For

- **Moderate cardinality** (10-100 categories)
- **Memory constraints**
- **Need to avoid curse of dimensionality**
- **Both tree-based and linear models**

### Sweet Spot

```python
cardinality_ranges = {
    'Low (2-10)': {
        'recommendation': 'Use One-Hot',
        'reason': 'Simple and interpretable'
    },
    'Medium (10-50)': {
        'recommendation': 'Use Binary',
        'reason': 'Good balance of efficiency and performance'
    },
    'High (50-100)': {
        'recommendation': 'Use Binary or Target',
        'reason': 'Significant space savings'
    },
    'Very High (100+)': {
        'recommendation': 'Use Target or Frequency',
        'reason': 'Binary still creates many columns'
    }
}

print("WHEN TO USE BINARY ENCODING")
print("="*60)
for cardinality, info in cardinality_ranges.items():
    print(f"\n{cardinality}:")
    print(f"  → {info['recommendation']}")
    print(f"  Reason: {info['reason']}")
```

## Advantages

```
✅ More compact than one-hot (log2 reduction)
✅ Handles moderate cardinality well
✅ Less sparse than one-hot
✅ Works with both tree and linear models
✅ No information about target needed
✅ Deterministic (no randomness)
✅ Handles new categories consistently
```

## Disadvantages

```
❌ Creates artificial bit-based relationship
❌ Less interpretable than one-hot
❌ Not always better than other methods
❌ Still creates multiple columns for high cardinality
❌ Binary patterns may not be meaningful
❌ Requires external library (category_encoders)
```

## Common Use Cases

```python
use_cases = {
    'Department Codes': {
        'cardinality': 25,
        'why_binary': '25 one-hot cols → 5 binary cols (80% reduction)',
        'example': ['DEPT_001', 'DEPT_002', ..., 'DEPT_025']
    },
    'Store IDs': {
        'cardinality': 40,
        'why_binary': '40 one-hot cols → 6 binary cols (85% reduction)',
        'example': ['STORE_A', 'STORE_B', ..., 'STORE_ZZ']
    },
    'Product SKUs': {
        'cardinality': 64,
        'why_binary': '64 one-hot cols → 6 binary cols (90% reduction)',
        'example': ['SKU_0001', 'SKU_0002', ..., 'SKU_0064']
    }
}

print("BINARY ENCODING USE CASES")
print("="*70)
for feature, details in use_cases.items():
    print(f"\n{feature} (Cardinality: {details['cardinality']})")
    print(f"  Benefit: {details['why_binary']}")
```

## Best Practices

### Combine with Other Features

```python
from category_encoders import BinaryEncoder
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler

# Mix binary encoding with other preprocessing
preprocessor = ColumnTransformer([
    ('binary', BinaryEncoder(), ['product_id', 'store_id']),
    ('scale', StandardScaler(), ['price', 'quantity'])
])

X_transformed = preprocessor.fit_transform(X_train)
```

### Monitor Performance

```python
import time

# Compare encoding times
start = time.time()
X_onehot = pd.get_dummies(X)
time_onehot = time.time() - start

start = time.time()
X_binary = BinaryEncoder().fit_transform(X)
time_binary = time.time() - start

print(f"One-Hot Time: {time_onehot:.4f}s")
print(f"Binary Time: {time_binary:.4f}s")
print(f"\nOne-Hot Shape: {X_onehot.shape}")
print(f"Binary Shape: {X_binary.shape}")
```

## Summary

Binary encoding is an excellent middle-ground solution for moderate-cardinality categorical variables. It provides significant space savings compared to one-hot encoding while being more interpretable than target encoding.

**Key Takeaways:**
- Use for 10-100 categories
- Creates log2(n) columns
- Works with all model types
- No target variable needed
- Good balance of efficiency and performance
- Especially useful with memory constraints

---

**Navigation:**
- **Previous:** [← Target Encoding](./encoding-target.md)
- **Next:** [Frequency Encoding →](./encoding-frequency.md)
- **Related:** [Encoding Comparison](./encoding-comparison.md)
