# Encoding Techniques - Comparison and Decision Framework

## What You'll Learn

With multiple encoding techniques available, choosing the right one is crucial. This guide provides a comprehensive comparison framework and decision tree to help you select the optimal encoding method for your specific use case.

## Quick Comparison Table

```
┌─────────────────┬─────────────┬───────────────┬────────────┬─────────────┬──────────────┐
│ Technique       │ Cardinality │ Output Cols   │ Model Type │ Complexity  │ Leakage Risk │
├─────────────────┼─────────────┼───────────────┼────────────┼─────────────┼──────────────┤
│ One-Hot         │ Low (<10)   │ n_categories  │ All        │ Low         │ No           │
│ Ordinal         │ Any         │ 1             │ Tree-based │ Low         │ No           │
│ Target          │ High (>10)  │ 1             │ Tree-based │ High        │ Yes          │
│ Binary          │ Medium      │ log2(n)       │ All        │ Medium      │ No           │
│ Frequency       │ Any         │ 1             │ All        │ Low         │ No           │
└─────────────────┴─────────────┴───────────────┴────────────┴─────────────┴──────────────┘
```

## Decision Framework

### Step-by-Step Decision Tree

```
START: What type of categorical variable?
│
├─ ORDINAL (has natural order)
│  │
│  └─► Use ORDINAL ENCODING
│      Example: Education levels, Ratings
│
├─ NOMINAL (no natural order)
│  │
│  ├─ Low Cardinality (<10 categories)
│  │  │
│  │  ├─ Linear Model?
│  │  │  └─► Use ONE-HOT ENCODING
│  │  │
│  │  └─ Tree-based Model?
│  │     └─► Use ONE-HOT or TARGET ENCODING
│  │
│  ├─ Medium Cardinality (10-50 categories)
│  │  │
│  │  ├─ Memory constraints?
│  │  │  └─► Use BINARY ENCODING
│  │  │
│  │  └─ No constraints?
│  │     └─► Use TARGET ENCODING
│  │
│  └─ High Cardinality (>50 categories)
│     │
│     ├─ Supervised learning?
│     │  └─► Use TARGET ENCODING
│     │
│     └─ Unsupervised learning?
│        └─► Use FREQUENCY or HASH ENCODING
```

## Detailed Comparison by Use Case

### Scenario 1: E-commerce Product Categories

```python
import pandas as pd

scenario = pd.DataFrame({
    'Feature': ['product_category', 'brand', 'sku', 'size'],
    'Cardinality': [5, 50, 10000, 4],
    'Type': ['Nominal', 'Nominal', 'Nominal', 'Ordinal'],
    'Recommended': ['One-Hot', 'Binary/Target', 'Target', 'Ordinal'],
    'Reason': [
        'Low cardinality, interpretable',
        'Medium cardinality, balance needed',
        'Very high cardinality',
        'Natural order: XS<S<M<L<XL'
    ]
})

print("E-COMMERCE ENCODING STRATEGY")
print("="*80)
print(scenario.to_string(index=False))
```

### Scenario 2: Customer Demographics

```python
scenario = pd.DataFrame({
    'Feature': ['gender', 'city', 'education', 'income_bracket'],
    'Cardinality': [2, 100, 4, 5],
    'Type': ['Nominal', 'Nominal', 'Ordinal', 'Ordinal'],
    'Recommended': ['One-Hot', 'Target', 'Ordinal', 'Ordinal'],
    'Reason': [
        'Binary variable',
        'High cardinality',
        'Clear hierarchy',
        'Income ranges have order'
    ]
})

print("CUSTOMER DEMOGRAPHICS STRATEGY")
print("="*80)
print(scenario.to_string(index=False))
```

## Performance Benchmark

Real-world comparison of encoding methods on the same dataset.

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from category_encoders import TargetEncoder, BinaryEncoder
from sklearn.compose import ColumnTransformer

# Generate sample data
np.random.seed(42)
n_samples = 1000
categories = [f'Cat_{i}' for i in range(20)]

df = pd.DataFrame({
    'category': np.random.choice(categories, n_samples),
    'feature1': np.random.randn(n_samples),
    'feature2': np.random.randn(n_samples)
})

# Create target with some relationship to category
cat_effect = {cat: np.random.uniform(-1, 1) for cat in categories}
df['target'] = (
    df['category'].map(cat_effect) +
    df['feature1'] * 0.5 +
    df['feature2'] * 0.3 +
    np.random.randn(n_samples) * 0.1
) > 0
df['target'] = df['target'].astype(int)

X = df[['category', 'feature1', 'feature2']]
y = df['target']

results = {}

# Test different encodings
print("ENCODING PERFORMANCE COMPARISON")
print("="*70)
print(f"Dataset: {n_samples} samples, {len(categories)} categories")
print()

# 1. One-Hot Encoding
onehot_transformer = ColumnTransformer(
    [('onehot', OneHotEncoder(drop='first'), ['category'])],
    remainder='passthrough'
)
X_onehot = onehot_transformer.fit_transform(X)
score_onehot = cross_val_score(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X_onehot, y, cv=5
).mean()
results['One-Hot'] = {
    'score': score_onehot,
    'columns': X_onehot.shape[1]
}
print(f"One-Hot Encoding:")
print(f"  CV Score: {score_onehot:.4f}")
print(f"  Columns: {X_onehot.shape[1]}\n")

# 2. Target Encoding
X_target = X.copy()
target_enc = TargetEncoder()
X_target['category'] = target_enc.fit_transform(X_target['category'], y)
score_target = cross_val_score(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X_target, y, cv=5
).mean()
results['Target'] = {
    'score': score_target,
    'columns': X_target.shape[1]
}
print(f"Target Encoding:")
print(f"  CV Score: {score_target:.4f}")
print(f"  Columns: {X_target.shape[1]}\n")

# 3. Binary Encoding
binary_enc = BinaryEncoder()
X_binary = binary_enc.fit_transform(X)
score_binary = cross_val_score(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X_binary, y, cv=5
).mean()
results['Binary'] = {
    'score': score_binary,
    'columns': X_binary.shape[1]
}
print(f"Binary Encoding:")
print(f"  CV Score: {score_binary:.4f}")
print(f"  Columns: {X_binary.shape[1]}\n")

# 4. Frequency Encoding
X_freq = X.copy()
freq_map = X_freq['category'].value_counts().to_dict()
X_freq['category'] = X_freq['category'].map(freq_map)
score_freq = cross_val_score(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X_freq, y, cv=5
).mean()
results['Frequency'] = {
    'score': score_freq,
    'columns': X_freq.shape[1]
}
print(f"Frequency Encoding:")
print(f"  CV Score: {score_freq:.4f}")
print(f"  Columns: {X_freq.shape[1]}\n")

# Summary
print("="*70)
print("SUMMARY")
print("="*70)
results_df = pd.DataFrame(results).T
print(results_df.sort_values('score', ascending=False))
```

## Detailed Decision Table

```python
import pandas as pd

decision_table = pd.DataFrame({
    'Scenario': [
        'Gender (M/F)',
        'Country (5 countries)',
        'City (100 cities)',
        'User ID (millions)',
        'Size (S/M/L/XL)',
        'Rating (1-5 stars)',
        'Color (10 colors)',
        'ZIP Code (thousands)',
        'Product SKU (500)',
        'Department (20)'
    ],
    'Variable_Type': [
        'Nominal',
        'Nominal',
        'Nominal',
        'Nominal',
        'Ordinal',
        'Ordinal',
        'Nominal',
        'Nominal',
        'Nominal',
        'Nominal'
    ],
    'Cardinality': [
        'Very Low (2)',
        'Low (5)',
        'High (100)',
        'Very High (1M+)',
        'Low (4)',
        'Low (5)',
        'Medium (10)',
        'Very High (1000+)',
        'High (500)',
        'Medium (20)'
    ],
    'Best_Choice': [
        'One-Hot',
        'One-Hot',
        'Target',
        'Target/Hash',
        'Ordinal',
        'Ordinal',
        'One-Hot',
        'Target',
        'Binary/Target',
        'Binary'
    ],
    'Alternative': [
        'Binary',
        'Binary',
        'Frequency',
        'Embedding',
        'One-Hot',
        'One-Hot',
        'Binary',
        'Frequency',
        'Target',
        'One-Hot'
    ]
})

print("="*100)
print("COMPREHENSIVE ENCODING DECISION TABLE")
print("="*100)
print(decision_table.to_string(index=False))
```

## Model-Specific Recommendations

### Linear Models

```
For Logistic Regression, Linear SVM, etc:
✓ One-Hot Encoding (preferred)
✓ Binary Encoding (if high cardinality)
✗ Avoid Ordinal (unless truly ordinal)
✗ Avoid Target (creates non-linear relationships)
```

### Tree-Based Models

```
For Random Forest, XGBoost, LightGBM:
✓ Target Encoding (excellent performance)
✓ Ordinal Encoding (works well)
✓ One-Hot Encoding (works but inefficient)
✓ Binary Encoding (good alternative)
```

### Neural Networks

```
For Deep Learning:
✓ One-Hot Encoding (input layer)
✓ Embedding Layers (for high cardinality)
✓ Entity Embeddings (learned representations)
✗ Avoid simple ordinal (loses information)
```

## Memory and Speed Comparison

```python
import pandas as pd
import numpy as np
import time
from sklearn.preprocessing import OneHotEncoder
from category_encoders import BinaryEncoder, TargetEncoder

# Large dataset
np.random.seed(42)
n = 50000
n_categories = 50

X = pd.DataFrame({
    'category': [f'Cat_{i}' for i in np.random.randint(0, n_categories, n)]
})
y = np.random.randint(0, 2, n)

print(f"Dataset: {n:,} rows, {n_categories} categories")
print("="*70)
print()

results = []

# One-Hot
start = time.time()
encoder = OneHotEncoder()
X_onehot = encoder.fit_transform(X)
time_onehot = time.time() - start
memory_onehot = X_onehot.data.nbytes / 1024**2

results.append({
    'Method': 'One-Hot',
    'Time (s)': round(time_onehot, 4),
    'Memory (MB)': round(memory_onehot, 2),
    'Columns': X_onehot.shape[1]
})

# Binary
start = time.time()
encoder = BinaryEncoder()
X_binary = encoder.fit_transform(X)
time_binary = time.time() - start
memory_binary = X_binary.memory_usage().sum() / 1024**2

results.append({
    'Method': 'Binary',
    'Time (s)': round(time_binary, 4),
    'Memory (MB)': round(memory_binary, 2),
    'Columns': X_binary.shape[1]
})

# Target
start = time.time()
encoder = TargetEncoder()
X_target = encoder.fit_transform(X, y)
time_target = time.time() - start
memory_target = X_target.memory_usage().sum() / 1024**2

results.append({
    'Method': 'Target',
    'Time (s)': round(time_target, 4),
    'Memory (MB)': round(memory_target, 2),
    'Columns': X_target.shape[1]
})

# Frequency
start = time.time()
freq_map = X['category'].value_counts().to_dict()
X_freq = X['category'].map(freq_map)
time_freq = time.time() - start
memory_freq = X_freq.memory_usage() / 1024**2

results.append({
    'Method': 'Frequency',
    'Time (s)': round(time_freq, 4),
    'Memory (MB)': round(memory_freq, 2),
    'Columns': 1
})

results_df = pd.DataFrame(results)
print("MEMORY AND SPEED COMPARISON")
print("="*70)
print(results_df.to_string(index=False))
```

## Key Takeaways

### Quick Reference

```
Variable Type → Method
├─ Ordinal → Ordinal Encoding
└─ Nominal
    ├─ Cardinality <10 → One-Hot
    ├─ Cardinality 10-50 → Binary or Target
    └─ Cardinality >50 → Target or Frequency

Model Type → Preference
├─ Linear → One-Hot
├─ Tree-based → Target or Ordinal
└─ Neural Network → One-Hot or Embeddings

Priority → Method
├─ Interpretability → One-Hot
├─ Performance → Target
├─ Memory efficiency → Binary or Target
└─ Speed → Frequency
```

## Summary

Choosing the right encoding method requires considering:
1. Variable type (nominal vs ordinal)
2. Cardinality (number of unique categories)
3. Model type (linear vs tree-based)
4. Constraints (memory, speed, interpretability)
5. Data leakage risks

**Golden Rules:**
- Start with the simplest method that fits your constraints
- Use ordinal encoding only for truly ordered variables
- Be careful with target encoding (data leakage risk)
- Always validate encoding impact on model performance
- Document your encoding choices

---

**Navigation:**
- **Previous:** [← Frequency Encoding](./encoding-frequency.md)
- **Next:** [Best Practices →](./encoding-best-practices.md)
- **Related:** [Encoding Overview](./encoding-overview.md)
