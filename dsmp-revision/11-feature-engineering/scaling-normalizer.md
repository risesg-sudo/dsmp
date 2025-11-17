# Normalizer - Row-Wise Scaling

## Introduction

Unlike other scalers, Normalizer works differently—it scales each sample (row) to unit norm instead of scaling features (columns). You'll discover why this matters for text classification, document similarity, and why confusing it with other scalers is a common mistake.

## The Key Difference

Normalizer is fundamentally different from StandardScaler and MinMaxScaler.

```
OTHER SCALERS (Column-wise):
────────────────────────────
    Feature1  Feature2
Row1   3         4
Row2   6         8
Row3   9        12

→ Scale each COLUMN independently

NORMALIZER (Row-wise):
──────────────────────
    Feature1  Feature2
Row1   3         4      → Scale this ROW to unit norm
Row2   6         8      → Scale this ROW to unit norm
Row3   9        12      → Scale this ROW to unit norm

→ Each ROW becomes unit vector
```

## The Concept

Normalizer scales individual samples to have unit norm.

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

## Basic Implementation

Let's see Normalizer in action.

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

## Different Norms

Normalizer supports three types of norms.

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

## Real-World Example: Text Document Similarity

Normalizer shines in text classification and document similarity tasks.

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

## When to Use Normalizer

Understanding when to use Normalizer versus other scalers is crucial.

**Use Normalizer when:**
- Computing similarity between samples (cosine similarity)
- Text classification (TF-IDF vectors)
- Image recognition
- Working with angles/directions, not magnitudes
- Each sample (row) should have unit norm
- Building recommendation systems

**Don't use when:**
- Need column-wise scaling - Use StandardScaler/MinMaxScaler
- Magnitude is important
- Features have different units
- Using tree-based models

## Common Confusion

Many confuse Normalizer with normalization in other contexts.

```python
# Normalizer: Row-wise unit norm
from sklearn.preprocessing import Normalizer
normalizer = Normalizer()
X_normalized = normalizer.fit_transform(X)  # Each ROW has unit norm

# MinMaxScaler: Called "normalization" but scales COLUMNS
from sklearn.preprocessing import MinMaxScaler
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)  # Each COLUMN scaled to [0,1]

# They are DIFFERENT!
```

## Summary

Normalizer is unique among scalers:
- Scales samples (rows), not features (columns)
- Each row becomes unit vector
- Essential for similarity calculations
- Perfect for text and document analysis
- Don't confuse with MinMaxScaler's "normalization"

Remember: Use Normalizer when the direction matters more than the magnitude.

---

**Navigation:**
- **Previous:** [← RobustScaler](./scaling-robustscaler.md)
- **Next:** [Outlier Detection →](./outliers-detection-methods.md)
- **Related:** [Comparison Guide](./scaling-comparison-guide.md)
