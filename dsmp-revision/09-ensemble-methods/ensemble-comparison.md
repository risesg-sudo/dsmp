# Ensemble Methods Comparison - XGBoost vs LightGBM vs CatBoost

## What You'll Learn

Understand the key differences between the three major gradient boosting libraries, when to choose each one, and how to map parameters across libraries. This guide helps you make informed decisions for your projects.

## High-Level Comparison

### Feature Matrix

| Feature | XGBoost | LightGBM | CatBoost |
|---------|---------|----------|----------|
| **Speed (small data < 1M)** | Medium | Fast | Medium-Slow |
| **Speed (large data > 10M)** | Slow | Very Fast | Fast |
| **Memory Usage** | High | Low | Medium |
| **Accuracy (default params)** | Good | Good | Excellent |
| **Accuracy (tuned)** | Excellent | Excellent | Excellent |
| **Categorical Features** | Manual encoding | Manual encoding | Automatic |
| **Missing Values** | Automatic | Automatic | Automatic |
| **Tree Growth** | Level-wise | Leaf-wise | Symmetric |
| **Overfitting Resistance** | Medium | Lower | Higher |
| **Default Parameters** | Good | Fair | Excellent |
| **GPU Support** | Yes | Yes | Yes |
| **Distributed Training** | Yes | Yes | Yes |
| **Interpretability** | Good | Good | Best |
| **Community Size** | Largest | Large | Growing |
| **Documentation** | Excellent | Good | Good |
| **Kaggle Popularity** | Very High | Very High | Growing |

## Core Algorithm Differences

### Tree Growth Strategy

```
LEVEL-WISE (XGBoost):
         [A]
       /    \
     [B]   [C]        <- Split both B and C
    /  \   /  \
  [D][E] [F][G]       <- Split all four nodes

Balanced, stable, less prone to overfitting

LEAF-WISE (LightGBM):
         [A]
       /    \
     [B]    [x]       <- Only split B (best gain)
    /  \
  [C]   [x]           <- Only split C (best gain)
 /  \
[D]  [x]              <- Only split D (best gain)

Faster convergence, deeper trees, more prone to overfitting

SYMMETRIC (CatBoost):
         [x₁ < 5]
       /        \
  [x₂ < 3]  [x₂ < 3]  <- Same split at same level!
  /  \      /  \
[L1][L2]  [L3][L4]

Balanced, fast inference, good regularization
```

### Speed Optimization Techniques

**XGBoost**:
- Approximate tree learning (histogram or sketch)
- Column block for parallel learning
- Cache-aware access
- Out-of-core computation

**LightGBM**:
- Histogram-based learning (255 bins)
- GOSS (Gradient-based One-Side Sampling)
- EFB (Exclusive Feature Bundling)
- Leaf-wise growth

**CatBoost**:
- Ordered boosting (multiple permutations)
- Symmetric trees (fast evaluation)
- Optimized categorical encoding
- GPU-specific optimizations

## Performance Benchmarks

### Training Time Comparison

```
Dataset: 1 million rows, 50 features, 10 categorical
Hardware: 8-core CPU, 32GB RAM

Default Settings:
XGBoost:  120 seconds
LightGBM: 18 seconds   (6.7x faster)
CatBoost: 45 seconds   (2.7x faster)

Memory Usage:
XGBoost:  2.8 GB
LightGBM: 0.5 GB       (5.6x less)
CatBoost: 1.2 GB       (2.3x less)

Accuracy (default parameters):
XGBoost:  0.851
LightGBM: 0.857
CatBoost: 0.864        (best defaults!)

Accuracy (after tuning):
XGBoost:  0.882
LightGBM: 0.887
CatBoost: 0.884
```

### Scalability

```
SMALL DATA (< 100K rows):
Winner: All perform similarly
Recommendation: Use CatBoost for best defaults

MEDIUM DATA (100K - 10M rows):
Winner: LightGBM for speed, CatBoost for ease
Recommendation: LightGBM if tuning time available

LARGE DATA (> 10M rows):
Winner: LightGBM (significantly faster)
Recommendation: LightGBM with GOSS boosting

VERY LARGE DATA (> 100M rows):
Winner: LightGBM (only practical option)
Recommendation: LightGBM with careful parameter tuning
```

## Parameter Mapping

### Essential Parameters Across Libraries

```python
# Equivalent parameters for same model configuration

# Number of trees
XGBoost:  n_estimators=100
LightGBM: n_estimators=100
CatBoost: iterations=100

# Learning rate
XGBoost:  learning_rate=0.1 (or eta=0.1)
LightGBM: learning_rate=0.1
CatBoost: learning_rate=0.1

# Tree depth
XGBoost:  max_depth=6
LightGBM: max_depth=6 (or num_leaves=63)
CatBoost: depth=6

# Number of leaves (LightGBM specific)
XGBoost:  2^max_depth (implicit)
LightGBM: num_leaves=31 (explicit control)
CatBoost: 2^depth (implicit)

# Minimum samples in leaf
XGBoost:  min_child_weight=1
LightGBM: min_child_samples=20
CatBoost: min_data_in_leaf=1

# Row sampling (bootstrap)
XGBoost:  subsample=0.8
LightGBM: bagging_fraction=0.8
CatBoost: subsample=0.8

# Column sampling
XGBoost:  colsample_bytree=0.8
LightGBM: feature_fraction=0.8
CatBoost: rsm=0.8

# L1 regularization
XGBoost:  reg_alpha=0.1
LightGBM: reg_alpha=0.1
CatBoost: l1_leaf_reg=0.1

# L2 regularization
XGBoost:  reg_lambda=1.0
LightGBM: reg_lambda=1.0
CatBoost: l2_leaf_reg=3.0
```

### Complete Parameter Mapping Example

```python
# Create equivalent models

import xgboost as xgb
import lightgbm as lgb
from catboost import CatBoostClassifier

# Configuration
config = {
    'num_trees': 100,
    'learning_rate': 0.1,
    'max_depth': 6,
    'subsample': 0.8,
    'colsample': 0.8,
    'l2_reg': 1.0,
    'seed': 42
}

# XGBoost
xgb_model = xgb.XGBClassifier(
    n_estimators=config['num_trees'],
    learning_rate=config['learning_rate'],
    max_depth=config['max_depth'],
    subsample=config['subsample'],
    colsample_bytree=config['colsample'],
    reg_lambda=config['l2_reg'],
    random_state=config['seed']
)

# LightGBM
lgb_model = lgb.LGBMClassifier(
    n_estimators=config['num_trees'],
    learning_rate=config['learning_rate'],
    num_leaves=2**config['max_depth']-1,  # Approximate max_depth
    bagging_fraction=config['subsample'],
    feature_fraction=config['colsample'],
    reg_lambda=config['l2_reg'],
    random_state=config['seed']
)

# CatBoost
cat_model = CatBoostClassifier(
    iterations=config['num_trees'],
    learning_rate=config['learning_rate'],
    depth=config['max_depth'],
    subsample=config['subsample'],
    rsm=config['colsample'],
    l2_leaf_reg=config['l2_reg'],
    random_seed=config['seed'],
    verbose=False
)
```

## Decision Framework

### When to Use XGBoost

**Choose XGBoost when:**
- Medium-sized datasets (10K - 10M rows)
- Need proven, battle-tested library
- Extensive community support required
- Working with regulatory compliance
- Team has deep XGBoost expertise
- Fine-grained control over algorithm needed

**Best For:**
- Structured/tabular data competitions
- Production systems requiring stability
- Research requiring extensive literature
- Cross-platform deployment

### When to Use LightGBM

**Choose LightGBM when:**
- Large datasets (> 10M rows)
- Training speed is critical
- Memory is limited
- High-dimensional features
- Sparse data
- Willing to invest time in tuning

**Best For:**
- Click-through rate prediction
- Large-scale recommendation systems
- Real-time model updates
- Resource-constrained environments

### When to Use CatBoost

**Choose CatBoost when:**
- Many categorical features
- High-cardinality categoricals
- Want best default parameters
- Need robust, production-ready models quickly
- Limited time for hyperparameter tuning
- Interpretability is important

**Best For:**
- E-commerce (user IDs, products)
- Ad click prediction
- Financial applications (transaction types)
- Any domain with rich categorical data

## Practical Comparison Code

```python
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
import time

# Generate data
X, y = make_classification(
    n_samples=100000,
    n_features=50,
    n_informative=30,
    random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

results = {}

# XGBoost
start = time.time()
xgb_model = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    n_jobs=-1,
    random_state=42
)
xgb_model.fit(X_train, y_train)
xgb_time = time.time() - start
xgb_auc = roc_auc_score(y_test, xgb_model.predict_proba(X_test)[:, 1])
results['XGBoost'] = {'time': xgb_time, 'auc': xgb_auc}

# LightGBM
start = time.time()
lgb_model = lgb.LGBMClassifier(
    n_estimators=100,
    num_leaves=63,
    learning_rate=0.1,
    n_jobs=-1,
    random_state=42
)
lgb_model.fit(X_train, y_train)
lgb_time = time.time() - start
lgb_auc = roc_auc_score(y_test, lgb_model.predict_proba(X_test)[:, 1])
results['LightGBM'] = {'time': lgb_time, 'auc': lgb_auc}

# CatBoost
start = time.time()
cat_model = CatBoostClassifier(
    iterations=100,
    depth=6,
    learning_rate=0.1,
    random_seed=42,
    verbose=False
)
cat_model.fit(X_train, y_train)
cat_time = time.time() - start
cat_auc = roc_auc_score(y_test, cat_model.predict_proba(X_test)[:, 1])
results['CatBoost'] = {'time': cat_time, 'auc': cat_auc}

# Display results
import pandas as pd
df_results = pd.DataFrame(results).T
print("\nPerformance Comparison:")
print(df_results)
print(f"\nSpeedup vs XGBoost:")
print(f"LightGBM: {xgb_time/lgb_time:.2f}x faster")
print(f"CatBoost: {xgb_time/cat_time:.2f}x faster")
```

## Strengths and Weaknesses

### XGBoost
**Strengths**: Mature, stable, excellent documentation, huge community
**Weaknesses**: Slower on large data, higher memory usage, no native categorical handling

### LightGBM
**Strengths**: Very fast, memory efficient, handles large data well
**Weaknesses**: More prone to overfitting, requires more tuning, less robust defaults

### CatBoost
**Strengths**: Best defaults, automatic categorical handling, robust, great visualizations
**Weaknesses**: Slower than LightGBM on numerical data, smaller community

## Quick Decision Tree

```
Do you have categorical features?
├─ Yes → CatBoost (automatic handling)
│
└─ No → Is dataset very large (>10M rows)?
    ├─ Yes → LightGBM (speed)
    │
    └─ No → Do you have time to tune?
        ├─ No → CatBoost (best defaults)
        │
        └─ Yes → All are good (choose by ecosystem)
```

## Summary

Choose based on your specific needs:
- **XGBoost**: Stable, proven, good all-rounder
- **LightGBM**: Speed champion for large datasets
- **CatBoost**: Ease-of-use champion, especially with categoricals

All three can achieve similar accuracy when tuned properly. The choice often comes down to:
- Dataset size and type
- Training time constraints
- Tuning time available
- Categorical feature presence
- Team expertise

---

**Navigation:**
- **Previous**: [CatBoost Advanced](./catboost-advanced.md)
- **Next**: [Ensemble Applications](./ensemble-applications.md)
- **Related**: [LightGBM Overview](./lightgbm-overview.md) | [CatBoost Overview](./catboost-overview.md)
