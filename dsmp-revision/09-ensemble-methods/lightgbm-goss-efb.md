# GOSS and EFB - Advanced Sampling and Bundling Techniques

## What You'll Learn

Discover two advanced techniques that further accelerate LightGBM: GOSS (Gradient-based One-Side Sampling) and EFB (Exclusive Feature Bundling). These innovations allow LightGBM to train on fewer samples and fewer features without sacrificing accuracy.

## GOSS: Gradient-based One-Side Sampling

### The Core Insight

Not all training samples are equally important. Some samples are:
- **Hard to predict** (large gradients): Very important for learning
- **Well-predicted** (small gradients): Less important, already learned

**Key Idea**: Keep all hard samples, randomly sample easy ones, and you'll get similar results with far fewer samples.

### Understanding Gradients in Gradient Boosting

**Gradient**: How much a sample's prediction needs to change.
- **Large gradient**: Model prediction is far from true value (important!)
- **Small gradient**: Model prediction is close to true value (less important)

```
Sample | True | Predicted | Gradient | Importance
-------|------|-----------|----------|------------
  1    |  1   |   0.2     |  +0.8    | HIGH
  2    |  0   |   0.1     |  -0.1    | LOW
  3    |  1   |   0.9     |  +0.1    | LOW
  4    |  0   |   0.7     |  -0.7    | HIGH
  5    |  1   |   0.4     |  +0.6    | HIGH

Keep all high gradient samples (1, 4, 5)
Random sample from low gradient samples (2, 3)
```

### The GOSS Algorithm

**Step-by-Step Process**:

1. **Sort by Gradient**: Order samples by absolute gradient value |g_i|
2. **Keep Top a%**: Retain all samples with largest gradients (e.g., a=20%)
3. **Sample Bottom (1-a)%**: Randomly sample b% from remaining samples (e.g., b=10%)
4. **Weight Small Gradients**: Multiply sampled small gradients by (1-a)/b to compensate
5. **Train Tree**: Use this subset for tree construction

### Concrete Example

```
Original Dataset: 1000 samples

After GOSS (a=20%, b=10%):

1. Top 20% = 200 samples with largest gradients
   -> Keep ALL 200 samples

2. Bottom 80% = 800 samples with small gradients
   -> Random sample 10% = 80 samples
   -> Weight by (1-0.2)/0.1 = 8x

3. Final training set: 280 samples (28% of original)
   -> 200 high gradient (weight 1x)
   -> 80 low gradient (weight 8x)

Result: 3.5x speedup with minimal accuracy loss!
```

### Visual Representation

```
GRADIENT-BASED ONE-SIDE SAMPLING (GOSS)
========================================

Original Data (sorted by |gradient|):
|████████| High gradient samples (keep all: 20%)
|████████|
|██      | Medium gradient samples
|█       | Low gradient samples
|        | Very low gradient samples

           ↓ GOSS Process ↓

Final Training Set:
|████████| All high gradient (20%)
|█       | Sampled low gradient (10% of 80% = 8%)
          Each low gradient sample weighted 8x

Total: 28% of data, but statistically representative!
```

### Why Weighting Matters

When we sample only 10% of small gradient samples, we need to **upweight** them to maintain statistical correctness:

```
Without weighting:
- Original: 800 small gradient samples
- Sampled: 80 samples
- Information loss: Underrepresents this group

With weighting (×8):
- Sampled: 80 samples with weight 8
- Effective contribution: 80 × 8 = 640
- Close to original contribution!
```

### Parameters and Tuning

```python
import lightgbm as lgb

model = lgb.LGBMClassifier(
    boosting_type='goss',     # Enable GOSS
    top_rate=0.2,             # Keep top 20% (parameter 'a')
    other_rate=0.1,           # Sample 10% of rest (parameter 'b')
    n_estimators=100
)
```

**Tuning Guidelines**:
- **top_rate**: 0.1-0.2 (higher = slower but more accurate)
- **other_rate**: 0.05-0.1 (higher = slower but more accurate)
- **Trade-off**: top_rate + other_rate = fraction of data used

### When to Use GOSS

**Perfect For**:
- Very large datasets (10M+ samples)
- Imbalanced datasets (keeps important minority samples)
- Limited training time
- When accuracy can trade 1-2% for 3-5x speedup

**Avoid When**:
- Small datasets (< 100K samples)
- Every sample is critical (e.g., small medical studies)
- Maximum accuracy is required regardless of time

## EFB: Exclusive Feature Bundling

### The Core Insight

High-dimensional sparse data often has **mutually exclusive features**:
- Features that rarely have non-zero values simultaneously
- Common in one-hot encoded categorical variables
- Common in text data (word frequencies)

**Key Idea**: Bundle mutually exclusive features together to reduce feature dimension without information loss.

### Understanding Feature Exclusivity

**Mutually Exclusive**: Two features rarely have non-zero values at the same time.

```
Examples:

One-Hot Encoding:
Feature A (is_red):   [1, 0, 0, 1, 0, 0]
Feature B (is_blue):  [0, 1, 0, 0, 1, 0]
Feature C (is_green): [0, 0, 1, 0, 0, 1]

A, B, C are mutually exclusive (only one is 1 at a time)

Sparse Features:
Feature X: [0, 3, 0, 0, 5, 0]
Feature Y: [0, 0, 2, 0, 0, 4]
Feature Z: [1, 0, 0, 3, 0, 0]

X and Y rarely overlap -> Can bundle!
```

### The EFB Algorithm

**Step 1: Build Conflict Graph**
- Create graph where nodes = features
- Add edge if features conflict (both non-zero)
- Edge weight = number of conflicts

**Step 2: Graph Coloring (Bundle Assignment)**
- Features with same color = bundled together
- Features in bundle rarely conflict
- This is NP-hard, so use greedy approximation

**Step 3: Merge Features**
- Add offset to distinguish bundled features
- Merge into single feature

### Concrete Example

```
Original Features (sparse):
Feature A: [0, 3, 0, 0, 5, 0]
Feature B: [0, 0, 2, 0, 0, 4]
Feature C: [1, 0, 0, 3, 0, 0]

Conflict Analysis:
A conflicts with B: 0 times (never both non-zero)
A conflicts with C: 0 times
B conflicts with C: 0 times

All three can be bundled!

Bundling Strategy:
Offset A: multiply by 1
Offset B: multiply by 10
Offset C: multiply by 100

Bundled Feature:
[100, 3, 20, 300, 5, 40]
 (C) (A)(B) (C) (A)(B)

Original: 3 features
After EFB: 1 feature
Speedup: 3x for this feature!
```

### How Offsets Work

```
Value Encoding with Offsets:

Original values:
A = 3, B = 2, C = 1

With offsets:
A_bundled = 3 × 1    = 3
B_bundled = 2 × 10   = 20
C_bundled = 1 × 100  = 100

In bundle: can recover original by division:
Bundled = 123
A = (123 mod 10)         = 3
B = (123 mod 100) / 10   = 2
C = 123 / 100            = 1
```

### Parameters and Control

```python
model = lgb.LGBMClassifier(
    max_bin=255,              # Affects bundling granularity
    feature_fraction=1.0,      # Use all features (EFB handles reduction)
)
```

**Note**: EFB is **automatic** in LightGBM. You don't need to enable it explicitly. It activates when detecting sparse features.

### Performance Impact

```
Example: 1000 features, 800 are one-hot encoded (80 categories × 10 variables)

Without EFB:
- Features: 1000
- Training considers all 1000

With EFB:
- Original features: 1000
- After bundling 800 into 10: 210 effective features
- Speedup: ~4.7x for feature scanning!
```

### When EFB Helps Most

**High Impact Scenarios**:
- One-hot encoded categorical features
- Sparse text data (TF-IDF features)
- Multi-hot encoded variables
- High-dimensional sparse features

**Low Impact Scenarios**:
- Dense continuous features
- Features with high correlation (not exclusivity)
- Small number of features (< 50)

## Combining GOSS and EFB

LightGBM can use both techniques simultaneously:
- **GOSS**: Reduces number of samples
- **EFB**: Reduces number of features

```
Original Problem:
1M samples × 1000 features

With GOSS (30% samples):
300K samples × 1000 features

With GOSS + EFB (1000 -> 250 features):
300K samples × 250 features

Speedup: ~13x with minimal accuracy loss!
```

## Practical Implementation

### Using GOSS

```python
import lightgbm as lgb
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=100000, n_features=50)

# Standard GBDT
model_standard = lgb.LGBMClassifier(boosting_type='gbdt')
# GOSS
model_goss = lgb.LGBMClassifier(
    boosting_type='goss',
    top_rate=0.2,
    other_rate=0.1
)

# Compare training time
import time

start = time.time()
model_standard.fit(X, y)
time_standard = time.time() - start

start = time.time()
model_goss.fit(X, y)
time_goss = time.time() - start

print(f"Standard: {time_standard:.2f}s")
print(f"GOSS: {time_goss:.2f}s")
print(f"Speedup: {time_standard/time_goss:.2f}x")
```

### EFB is Automatic

```python
# EFB activates automatically for sparse data
import pandas as pd
from scipy.sparse import csr_matrix

# Create sparse data (one-hot encoded)
df = pd.get_dummies(data, columns=['cat1', 'cat2', 'cat3'])

# LightGBM automatically detects sparsity and applies EFB
model = lgb.LGBMClassifier()
model.fit(df, y)  # EFB happens automatically!
```

## Common Pitfalls

### Pitfall 1: Using GOSS on Tiny Datasets
**Problem**: Sampling 30% of 1000 samples = 300 samples. Too few!
**Solution**: Only use GOSS when you have > 100K samples.

### Pitfall 2: Expecting EFB on Dense Data
**Problem**: EFB only helps with sparse, exclusive features.
**Solution**: Check sparsity. If features are dense, EFB won't help.

### Pitfall 3: Over-aggressive GOSS Parameters
**Problem**: top_rate=0.05, other_rate=0.05 = only 10% of data.
**Solution**: Start conservative (top_rate=0.2, other_rate=0.1).

## Summary

**GOSS (Gradient-based One-Side Sampling)**:
- Keeps all large gradient samples (hard to predict)
- Randomly samples small gradient samples (well predicted)
- Achieves 3-5x speedup with < 1% accuracy loss
- Best for large datasets (10M+ samples)

**EFB (Exclusive Feature Bundling)**:
- Bundles mutually exclusive features
- Common in one-hot encoded data
- Reduces effective feature count
- Happens automatically, no configuration needed

**Combined Impact**:
- GOSS reduces samples
- EFB reduces features
- Together: 10-20x speedup on large, sparse data

---

**Navigation:**
- **Previous**: [LightGBM Core Concepts](./lightgbm-core-concepts.md)
- **Next**: [LightGBM Implementation](./lightgbm-implementation.md)
- **Related**: [LightGBM Advanced](./lightgbm-advanced.md)
