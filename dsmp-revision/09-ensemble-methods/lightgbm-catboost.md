# LightGBM and CatBoost - Comprehensive Revision Notes

## Table of Contents
1. [LightGBM Overview](#lightgbm-overview)
2. [LightGBM Core Concepts](#lightgbm-core-concepts)
3. [LightGBM Implementation](#lightgbm-implementation)
4. [CatBoost Overview](#catboost-overview)
5. [CatBoost Core Concepts](#catboost-core-concepts)
6. [CatBoost Implementation](#catboost-implementation)
7. [Comparison: XGBoost vs LightGBM vs CatBoost](#comparison-xgboost-vs-lightgbm-vs-catboost)
8. [When to Use What](#when-to-use-what)
9. [Real-World Applications](#real-world-applications)

---

## LightGBM Overview

**LightGBM (Light Gradient Boosting Machine)**: Fast, distributed, high-performance gradient boosting framework by Microsoft (2017).

### Key Features

- ⚡ **Very Fast**: 20x faster than XGBoost on large datasets
- 💾 **Memory Efficient**: 8x less memory than XGBoost
- 🎯 **High Accuracy**: Often better than XGBoost
- 📊 **Handles Large Data**: Designed for 100M+ samples
- 🌳 **Leaf-wise Growth**: Different tree growth strategy
- 🎲 **GOSS**: Gradient-based One-Side Sampling
- 🔗 **EFB**: Exclusive Feature Bundling
- 🏃 **GPU Support**: Native GPU training

### Why LightGBM?

**Problems with XGBoost:**
- Slow on very large datasets (100M+ samples)
- High memory usage
- Level-wise tree growth can be inefficient

**LightGBM Solutions:**
- Leaf-wise tree growth (faster convergence)
- Histogram-based learning (faster, less memory)
- GOSS (fewer samples needed)
- EFB (fewer features needed)

---

## LightGBM Core Concepts

### 1. Leaf-wise (Best-first) Tree Growth

**XGBoost (Level-wise):**
```
                Root
               /    \
           Split   Split     ← Level 1: Split both nodes
           /  \    /  \
          S   S   S   S      ← Level 2: Split all 4 nodes
         /\  /\  /\  /\
        S S S S S S S S     ← Level 3: Split all 8 nodes

Grows level by level (breadth-first)
More balanced but may waste splits
```

**LightGBM (Leaf-wise):**
```
                Root
               /    \
           Split    Leaf     ← Split node with max gain
           /  \
        Split  Leaf          ← Split next best node
        /  \
     Split  Leaf             ← Continue with best gains
     /  \
   Leaf Leaf

Grows leaf by leaf (best-first)
Less balanced but more efficient
Converges faster but can overfit
```

**ASCII Comparison:**

```
LEVEL-WISE (XGBoost):          LEAF-WISE (LightGBM):
Depth 0:     [A]               [A]
Depth 1:   [B] [C]             [B] [x]
Depth 2: [D][E][F][G]          [D] [x] [x] [x]
                               [H] [x] [x] [x] [x] [x] [x] [x]

Level-wise: 7 splits           Leaf-wise: 4 splits
All levels complete            Only best leaves split
More balanced                  Deeper, more accurate
```

**Key Differences:**

| Aspect | Level-wise (XGBoost) | Leaf-wise (LightGBM) |
|--------|---------------------|---------------------|
| **Strategy** | Split all nodes at same depth | Split node with max gain |
| **Tree shape** | Balanced | Unbalanced (deeper) |
| **Convergence** | Slower | Faster |
| **Accuracy** | Good | Better (if not overfitting) |
| **Overfitting** | Less prone | More prone |
| **Control** | max_depth | num_leaves, max_depth |

### 2. Histogram-based Learning

**Traditional (XGBoost exact):**
- Store exact feature values
- Consider all possible splits
- Slow for large datasets

**Histogram-based (LightGBM):**
- Bin continuous features into discrete bins (e.g., 255 bins)
- Build histogram of gradients for each bin
- Find best split by scanning histogram

**Example:**

```
Original Feature Values:
[0.1, 0.3, 0.5, 0.7, 0.9, 1.2, 1.5, 1.8, 2.1, 2.4]

After Binning (4 bins):
Bin 0: [0.1, 0.3, 0.5]     → Average: 0.3
Bin 1: [0.7, 0.9]          → Average: 0.8
Bin 2: [1.2, 1.5, 1.8]     → Average: 1.5
Bin 3: [2.1, 2.4]          → Average: 2.25

Split candidates: 4 instead of 10!
```

**Benefits:**
- **Speed**: O(#bins × #features) instead of O(#data × #features)
- **Memory**: Store bins (uint8) instead of floats (float32)
- **Cache**: Better cache hit rate

**Histogram Subtraction Trick:**

```
Gradient sum in parent = Gradient sum in left child + Gradient sum in right child

If we know parent and left child histograms:
Right child histogram = Parent histogram - Left child histogram

Saves computation!
```

### 3. GOSS (Gradient-based One-Side Sampling)

**Motivation:** Not all samples are equally important.
- Large gradients: Hard to predict, important
- Small gradients: Well-predicted, less important

**Algorithm:**

```
1. Sort instances by absolute gradient value (|gᵢ|)
2. Keep top a% with largest gradients (e.g., a=20%)
3. Randomly sample b% from remaining (e.g., b=10%)
4. Multiply small gradient samples by (1-a)/b to compensate
5. Train tree on this subset
```

**Example:**

```
Original: 1000 samples

After GOSS (a=20%, b=10%):
- Top 200 samples with large gradients (kept)
- Random 80 samples from remaining 800 (sampled)
- Total: 280 samples (28% of original)
- Small gradient samples weighted by (1-0.2)/0.1 = 8

Train on 280 samples instead of 1000 → 3.5x speedup!
```

**ASCII Visualization:**

```
GRADIENT-BASED ONE-SIDE SAMPLING (GOSS)
========================================

Original Data (sorted by |gradient|):
|██████████| High gradient samples (keep all: 20%)
|████      | Medium gradient samples
|██        | Low gradient samples
|█         | Very low gradient samples
            ↓
Random sample 10% from low gradients, upweight by 8x

Final Training Set:
|██████████| All high gradient (20%)
|█         | Sampled low gradient (10% of 80% = 8%)
Total: 28% of data, but representative!
```

### 4. EFB (Exclusive Feature Bundling)

**Motivation:** High-dimensional sparse data has many mutually exclusive features.

**Examples of Mutually Exclusive Features:**
- One-hot encoded categories: [is_red, is_blue, is_green]
- Rarely simultaneously non-zero features

**Algorithm:**

```
1. Build feature conflict graph
   - Edge between features if they conflict (both non-zero)
2. Find feature bundles (graph coloring problem)
   - Bundle features that rarely conflict
3. Merge bundled features
   - Add offset to keep them distinguishable
```

**Example:**

```
Original Features (sparse):
Feature A: [0, 3, 0, 0, 5, 0]
Feature B: [0, 0, 2, 0, 0, 4]
Feature C: [1, 0, 0, 3, 0, 0]

A and B rarely overlap → Can bundle!
A and C rarely overlap → Can bundle!

Bundle A+B+C:
Offset A: ×1,  Offset B: ×10,  Offset C: ×100
Result: [100, 3, 20, 300, 5, 40]
       (C) (A)(B) (C) (A)(B)

3 features → 1 feature!
```

**Benefits:**
- Reduces feature dimension
- Faster training
- No accuracy loss (if conflicts rare)

---

## LightGBM Implementation

### Installation

```bash
pip install lightgbm
```

### Basic Classification

```python
import lightgbm as lgb
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report
import numpy as np

# Load data
data = load_breast_cancer()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Method 1: sklearn API
lgb_clf = lgb.LGBMClassifier(
    n_estimators=100,
    max_depth=-1,              # No limit (use num_leaves instead)
    num_leaves=31,             # Max leaves per tree (default: 31)
    learning_rate=0.1,
    min_child_samples=20,      # Min samples in leaf
    subsample=0.8,             # Row sampling
    colsample_bytree=0.8,      # Column sampling
    reg_alpha=0.0,             # L1 regularization
    reg_lambda=0.0,            # L2 regularization
    random_state=42,
    n_jobs=-1
)

lgb_clf.fit(X_train, y_train)

# Predictions
y_pred = lgb_clf.predict(X_test)
y_proba = lgb_clf.predict_proba(X_test)[:, 1]

# Evaluation
print("Accuracy:", accuracy_score(y_test, y_pred))
print("AUC:", roc_auc_score(y_test, y_proba))
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=data.target_names))

# Feature importance
print("\nTop 5 Features:")
feature_imp = lgb_clf.feature_importances_
top_features = np.argsort(feature_imp)[::-1][:5]
for i in top_features:
    print(f"{data.feature_names[i]}: {feature_imp[i]:.4f}")
```

### Using Native API (More Features)

```python
# Method 2: Native LightGBM API
train_data = lgb.Dataset(X_train, label=y_train, feature_name=list(data.feature_names))
test_data = lgb.Dataset(X_test, label=y_test, feature_name=list(data.feature_names), reference=train_data)

# Parameters
params = {
    'objective': 'binary',
    'metric': ['binary_logloss', 'auc'],
    'boosting_type': 'gbdt',   # 'gbdt', 'dart', 'goss', 'rf'
    'num_leaves': 31,
    'learning_rate': 0.1,
    'feature_fraction': 0.8,   # colsample_bytree
    'bagging_fraction': 0.8,   # subsample
    'bagging_freq': 5,         # Bagging frequency
    'verbose': -1,
    'seed': 42
}

# Train with validation
evals_result = {}
gbm = lgb.train(
    params,
    train_data,
    num_boost_round=100,
    valid_sets=[train_data, test_data],
    valid_names=['train', 'test'],
    callbacks=[
        lgb.early_stopping(stopping_rounds=10),
        lgb.log_evaluation(period=10),
        lgb.record_evaluation(evals_result)
    ]
)

# Predict
y_pred_proba = gbm.predict(X_test, num_iteration=gbm.best_iteration)
y_pred = (y_pred_proba > 0.5).astype(int)

print("\nBest iteration:", gbm.best_iteration)
print("Test AUC:", roc_auc_score(y_test, y_pred_proba))

# Plot training history
import matplotlib.pyplot as plt
lgb.plot_metric(evals_result, metric='auc')
plt.show()
```

### Regression

```python
from sklearn.datasets import make_regression
from sklearn.metrics import mean_squared_error, r2_score

# Generate data
X, y = make_regression(n_samples=1000, n_features=20, noise=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# LightGBM Regressor
lgb_reg = lgb.LGBMRegressor(
    n_estimators=100,
    num_leaves=31,
    learning_rate=0.1,
    objective='regression',    # 'regression', 'regression_l1', 'huber', 'quantile'
    metric='rmse',
    random_state=42,
    n_jobs=-1
)

lgb_reg.fit(X_train, y_train)

# Predictions
y_pred = lgb_reg.predict(X_test)

# Evaluation
print("R² Score:", r2_score(y_test, y_pred))
print("RMSE:", np.sqrt(mean_squared_error(y_test, y_pred)))
```

### Hyperparameter Tuning

```python
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import randint, uniform

# Parameter distribution
param_dist = {
    'num_leaves': randint(20, 100),
    'learning_rate': uniform(0.01, 0.2),
    'n_estimators': randint(100, 500),
    'min_child_samples': randint(10, 50),
    'subsample': uniform(0.6, 0.4),
    'colsample_bytree': uniform(0.6, 0.4),
    'reg_alpha': uniform(0, 1),
    'reg_lambda': uniform(0, 10)
}

# Random search
random_search = RandomizedSearchCV(
    lgb.LGBMClassifier(random_state=42, n_jobs=-1),
    param_distributions=param_dist,
    n_iter=50,
    cv=5,
    scoring='roc_auc',
    random_state=42,
    n_jobs=-1,
    verbose=2
)

random_search.fit(X_train, y_train)
print("Best parameters:", random_search.best_params_)
print("Best CV score:", random_search.best_score_)
print("Test score:", random_search.score(X_test, y_test))
```

### Built-in Cross-Validation

```python
# LightGBM's built-in CV
train_data = lgb.Dataset(X_train, label=y_train)

params = {
    'objective': 'binary',
    'metric': 'auc',
    'num_leaves': 31,
    'learning_rate': 0.1,
    'verbose': -1
}

# Run CV
cv_results = lgb.cv(
    params,
    train_data,
    num_boost_round=1000,
    nfold=5,
    stratified=True,
    shuffle=True,
    callbacks=[
        lgb.early_stopping(stopping_rounds=10),
        lgb.log_evaluation(period=10)
    ],
    seed=42
)

print("\nBest iteration:", len(cv_results['valid auc-mean']))
print("Best CV AUC:", max(cv_results['valid auc-mean']))
```

### GOSS Boosting

```python
# Use GOSS for faster training on large datasets
lgb_goss = lgb.LGBMClassifier(
    boosting_type='goss',      # Use GOSS
    n_estimators=100,
    num_leaves=31,
    learning_rate=0.1,
    random_state=42
)

lgb_goss.fit(X_train, y_train)
print("GOSS Accuracy:", lgb_goss.score(X_test, y_test))
```

### DART Boosting

```python
# DART (Dropouts meet Multiple Additive Regression Trees)
# More robust to overfitting
lgb_dart = lgb.LGBMClassifier(
    boosting_type='dart',      # Use DART
    n_estimators=100,
    num_leaves=31,
    learning_rate=0.1,
    drop_rate=0.1,             # Dropout rate
    skip_drop=0.5,             # Probability of skipping dropout
    random_state=42
)

lgb_dart.fit(X_train, y_train)
print("DART Accuracy:", lgb_dart.score(X_test, y_test))
```

### Feature Importance Visualization

```python
import matplotlib.pyplot as plt

# Train model
lgb_model = lgb.LGBMClassifier(n_estimators=100, num_leaves=31, random_state=42)
lgb_model.fit(X_train, y_train)

# Plot feature importance
lgb.plot_importance(lgb_model, max_num_features=10, importance_type='gain')
plt.title('Feature Importance (Gain)')
plt.tight_layout()
plt.show()

# Different importance types: 'split' (count) or 'gain' (total gain)
lgb.plot_importance(lgb_model, max_num_features=10, importance_type='split')
plt.title('Feature Importance (Split Count)')
plt.tight_layout()
plt.show()
```

---

## CatBoost Overview

**CatBoost (Categorical Boosting)**: Gradient boosting library by Yandex (2017), specialized for categorical features.

### Key Features

- 🏷️ **Automatic Categorical Handling**: No preprocessing needed
- 🎯 **Ordered Boosting**: Reduces overfitting
- 🔄 **Ordered Target Encoding**: Better than one-hot or label encoding
- 🛡️ **Robust**: Less prone to overfitting
- 📈 **High Accuracy**: Often best out-of-the-box performance
- ⏱️ **Fast Inference**: Optimized model application
- 📊 **Great Visualizations**: Built-in plotting tools
- 🎓 **Easy to Use**: Best default parameters

### Why CatBoost?

**Problem:** Categorical features are everywhere
- Traditional ML: Need manual encoding (one-hot, label, target)
- XGBoost/LightGBM: Treat categoricals as integers (suboptimal)

**CatBoost Solution:**
- Automatic categorical feature handling
- Ordered target encoding (prevents overfitting)
- Ordered boosting (prediction shift prevention)

---

## CatBoost Core Concepts

### 1. Ordered Target Encoding

**Problem with Traditional Target Encoding:**

```
Traditional Target Encoding:
For category c, encode as mean(target | feature = c)

Example:
Category  | Instances | Target | Traditional Encoding
----------|-----------|--------|--------------------
Red       | [1, 2, 3] | [1,0,1]| 0.67 (all instances)
Blue      | [4, 5]    | [1,1]  | 1.00 (all instances)

Problem: Uses same instance to compute encoding and make prediction
→ Overfitting! (target leakage)
```

**CatBoost Ordered Target Encoding:**

```
Ordered Target Encoding:
For instance i with category c, encode as mean of target for instances BEFORE i

Example (ordered by time or randomly):
Instance | Category | Target | Encoding
---------|----------|--------|----------
1        | Red      | 1      | prior (no previous Red)
2        | Red      | 0      | 1.0 (from instance 1)
3        | Red      | 1      | 0.5 (from instances 1,2)
4        | Blue     | 1      | prior (no previous Blue)
5        | Blue     | 1      | 1.0 (from instance 4)

No target leakage! Each instance encoded using only past data.
```

**Formula:**

```
For instance i with category c:

encoding_i = (count_c_before_i × mean_target_before_i + prior × α) / (count_c_before_i + α)

where:
- count_c_before_i: Number of instances with category c before i
- mean_target_before_i: Mean target for category c before i
- prior: Overall mean target
- α: Regularization parameter
```

### 2. Ordered Boosting

**Problem with Traditional Boosting:**

```
Traditional Boosting:
1. Compute gradient for all samples using current model
2. Train new tree on all samples
3. Update model

Problem: Model predicts on same data used to compute gradients
→ Prediction shift (overfitting)
```

**CatBoost Ordered Boosting:**

```
Ordered Boosting:
For each instance, use model trained on previous instances only

Maintain multiple models (random permutations):
Model₁ for instances 1-100
Model₂ for instances 1-200
Model₃ for instances 1-300
...

When predicting instance i, use model trained on instances before i
```

**ASCII Visualization:**

```
ORDERED BOOSTING
================

Permutation: [4, 2, 1, 5, 3]

Model for instance 1 (4th in order):
  Train on: [4, 2, 1]  → Predict on: 5

Model for instance 2 (2nd in order):
  Train on: [4]        → Predict on: 2

Model for instance 3 (5th in order):
  Train on: [4,2,1,5]  → Predict on: 3

Each instance predicted by model NOT trained on it!
```

### 3. Symmetric Trees (Oblivious Trees)

**CatBoost uses symmetric (oblivious) decision trees:**

```
SYMMETRIC TREE:
===============

All nodes at same level use SAME splitting criterion

         [x₁ < 5]
        /        \
   [x₂ < 3]    [x₂ < 3]    ← Same split
   /    \      /    \
  L₁    L₂    L₃    L₄

Advantages:
- Faster evaluation (bitwise operations)
- Less overfitting (regularization)
- Better CPU cache usage
- Easier to analyze

Disadvantages:
- Less expressive than asymmetric trees
- May need more trees
```

### 4. Categorical Feature Handling

**Automatic Detection:**
- String columns → Categorical
- Integer with few unique values → Can be categorical
- Explicit declaration via `cat_features` parameter

**Combinations:**
- CatBoost can automatically create feature combinations
- Example: [City, Day_of_Week] → [City_Day]
- Controlled by `max_ctr_complexity` parameter

---

## CatBoost Implementation

### Installation

```bash
pip install catboost
```

### Basic Classification

```python
from catboost import CatBoostClassifier, Pool
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score
import numpy as np

# Load data
data = load_breast_cancer()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# CatBoost Classifier
cat_clf = CatBoostClassifier(
    iterations=100,            # Number of trees
    learning_rate=0.1,
    depth=6,                   # Tree depth
    loss_function='Logloss',   # 'Logloss', 'CrossEntropy'
    eval_metric='AUC',
    random_seed=42,
    verbose=10                 # Print every 10 iterations
)

cat_clf.fit(X_train, y_train, eval_set=(X_test, y_test))

# Predictions
y_pred = cat_clf.predict(X_test)
y_proba = cat_clf.predict_proba(X_test)[:, 1]

# Evaluation
print("\nAccuracy:", accuracy_score(y_test, y_pred))
print("AUC:", roc_auc_score(y_test, y_proba))

# Feature importance
print("\nTop 5 Features:")
feature_imp = cat_clf.get_feature_importance()
top_features = np.argsort(feature_imp)[::-1][:5]
for i in top_features:
    print(f"{data.feature_names[i]}: {feature_imp[i]:.4f}")
```

### Handling Categorical Features

```python
import pandas as pd

# Create dataset with categorical features
df = pd.DataFrame({
    'age': [25, 30, 35, 40, 45, 50, 55, 60],
    'city': ['NYC', 'LA', 'NYC', 'SF', 'LA', 'NYC', 'SF', 'LA'],
    'gender': ['M', 'F', 'M', 'F', 'M', 'F', 'M', 'F'],
    'income': ['Low', 'High', 'Medium', 'High', 'Low', 'High', 'Medium', 'High'],
    'target': [0, 1, 0, 1, 0, 1, 0, 1]
})

X = df.drop('target', axis=1)
y = df['target']

# Identify categorical features
cat_features = ['city', 'gender', 'income']

# CatBoost with categorical features (NO PREPROCESSING NEEDED!)
cat_model = CatBoostClassifier(
    iterations=100,
    learning_rate=0.1,
    depth=6,
    cat_features=cat_features,  # Specify categorical columns
    random_seed=42,
    verbose=False
)

cat_model.fit(X, y)

print("Model trained with categorical features!")
print("Categorical features automatically handled:")
print(cat_features)
```

### Using Pool for Better Performance

```python
# Pool: CatBoost's data structure (faster, more features)
train_pool = Pool(
    data=X_train,
    label=y_train,
    cat_features=cat_features,
    feature_names=list(X.columns)
)

test_pool = Pool(
    data=X_test,
    label=y_test,
    cat_features=cat_features,
    feature_names=list(X.columns)
)

# Train with Pool
cat_clf_pool = CatBoostClassifier(
    iterations=100,
    learning_rate=0.1,
    depth=6,
    random_seed=42,
    verbose=False
)

cat_clf_pool.fit(train_pool, eval_set=test_pool)
```

### Regression

```python
from catboost import CatBoostRegressor
from sklearn.datasets import make_regression
from sklearn.metrics import mean_squared_error, r2_score

# Generate data
X, y = make_regression(n_samples=1000, n_features=20, noise=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# CatBoost Regressor
cat_reg = CatBoostRegressor(
    iterations=100,
    learning_rate=0.1,
    depth=6,
    loss_function='RMSE',      # 'RMSE', 'MAE', 'Quantile', 'Huber'
    random_seed=42,
    verbose=False
)

cat_reg.fit(X_train, y_train, eval_set=(X_test, y_test))

# Predictions
y_pred = cat_reg.predict(X_test)

# Evaluation
print("R² Score:", r2_score(y_test, y_pred))
print("RMSE:", np.sqrt(mean_squared_error(y_test, y_pred)))
```

### Hyperparameter Tuning

```python
from catboost import CatBoostClassifier
from sklearn.model_selection import GridSearchCV

# Parameter grid
param_grid = {
    'iterations': [100, 200, 300],
    'learning_rate': [0.01, 0.1, 0.3],
    'depth': [4, 6, 8],
    'l2_leaf_reg': [1, 3, 5, 7, 9]
}

# Grid search
grid_search = GridSearchCV(
    CatBoostClassifier(random_seed=42, verbose=False),
    param_grid,
    cv=5,
    scoring='roc_auc',
    n_jobs=-1
)

grid_search.fit(X_train, y_train)
print("Best parameters:", grid_search.best_params_)
print("Best CV score:", grid_search.best_score_)
```

### Built-in Cross-Validation

```python
# CatBoost's built-in CV
from catboost import cv

# Setup pool
cv_pool = Pool(X_train, y_train)

# Parameters
params = {
    'iterations': 100,
    'learning_rate': 0.1,
    'depth': 6,
    'loss_function': 'Logloss',
    'eval_metric': 'AUC',
    'random_seed': 42,
    'verbose': False
}

# Run CV
cv_results = cv(
    pool=cv_pool,
    params=params,
    fold_count=5,
    shuffle=True,
    partition_random_seed=42,
    plot=False,
    verbose=False
)

print("\nCV Results:")
print(cv_results.tail())
print(f"\nBest AUC: {cv_results['test-AUC-mean'].max():.4f}")
```

### Visualization

```python
# CatBoost has great built-in visualizations

# 1. Training plot
cat_model = CatBoostClassifier(iterations=100, random_seed=42)
cat_model.fit(X_train, y_train, eval_set=(X_test, y_test), plot=True)

# 2. Feature importance
cat_model.get_feature_importance(prettified=True)

# 3. Tree visualization
cat_model.plot_tree(tree_idx=0, pool=train_pool)

# 4. Object importance (instance importance)
train_pool = Pool(X_train, y_train)
object_importances = cat_model.get_object_importance(
    train_pool,
    train_pool,
    top_size=10
)
print("Top 10 influential training instances:")
print(object_importances)
```

### GPU Training

```python
# Train on GPU (if available)
cat_gpu = CatBoostClassifier(
    iterations=1000,
    learning_rate=0.1,
    depth=6,
    task_type='GPU',           # Use GPU
    devices='0',               # GPU device ID
    random_seed=42
)

cat_gpu.fit(X_train, y_train)
```

---

## Comparison: XGBoost vs LightGBM vs CatBoost

### Feature Comparison

| Feature | XGBoost | LightGBM | CatBoost |
|---------|---------|----------|----------|
| **Speed (small data)** | Medium | Fast | Slow |
| **Speed (large data)** | Slow | Very Fast | Fast |
| **Memory Usage** | High | Low | Medium |
| **Accuracy** | High | Very High | Very High |
| **Categorical Features** | Manual encoding | Manual encoding | Automatic |
| **Missing Values** | Automatic | Automatic | Automatic |
| **Tree Growth** | Level-wise | Leaf-wise | Symmetric |
| **Overfitting** | Medium prone | More prone | Less prone |
| **Default Params** | Good | Needs tuning | Excellent |
| **GPU Support** | Yes | Yes | Yes |
| **Distributed** | Yes | Yes | Yes |
| **Interpretability** | Good | Good | Best |

### Performance Comparison

```python
import time
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import xgboost as xgb
import lightgbm as lgb
from catboost import CatBoostClassifier

# Generate large dataset
X, y = make_classification(n_samples=100000, n_features=50, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

results = {}

# XGBoost
start = time.time()
xgb_model = xgb.XGBClassifier(n_estimators=100, max_depth=6, learning_rate=0.1, n_jobs=-1, random_state=42)
xgb_model.fit(X_train, y_train)
xgb_time = time.time() - start
xgb_acc = xgb_model.score(X_test, y_test)
results['XGBoost'] = {'time': xgb_time, 'accuracy': xgb_acc}

# LightGBM
start = time.time()
lgb_model = lgb.LGBMClassifier(n_estimators=100, num_leaves=63, learning_rate=0.1, n_jobs=-1, random_state=42)
lgb_model.fit(X_train, y_train)
lgb_time = time.time() - start
lgb_acc = lgb_model.score(X_test, y_test)
results['LightGBM'] = {'time': lgb_time, 'accuracy': lgb_acc}

# CatBoost
start = time.time()
cat_model = CatBoostClassifier(iterations=100, depth=6, learning_rate=0.1, random_seed=42, verbose=False)
cat_model.fit(X_train, y_train)
cat_time = time.time() - start
cat_acc = cat_model.score(X_test, y_test)
results['CatBoost'] = {'time': cat_time, 'accuracy': cat_acc}

# Display results
import pandas as pd
df_results = pd.DataFrame(results).T
print("\nPerformance Comparison:")
print(df_results)
print(f"\nSpeedup over XGBoost:")
print(f"LightGBM: {xgb_time/lgb_time:.2f}x")
print(f"CatBoost: {xgb_time/cat_time:.2f}x")
```

### Hyperparameter Mapping

```python
# Equivalent parameters across libraries
PARAM_MAPPING = {
    'num_trees': {
        'XGBoost': 'n_estimators',
        'LightGBM': 'n_estimators',
        'CatBoost': 'iterations'
    },
    'learning_rate': {
        'XGBoost': 'learning_rate / eta',
        'LightGBM': 'learning_rate',
        'CatBoost': 'learning_rate'
    },
    'tree_depth': {
        'XGBoost': 'max_depth',
        'LightGBM': 'max_depth (or use num_leaves)',
        'CatBoost': 'depth'
    },
    'num_leaves': {
        'XGBoost': '2^max_depth',
        'LightGBM': 'num_leaves',
        'CatBoost': '2^depth'
    },
    'min_data_in_leaf': {
        'XGBoost': 'min_child_weight',
        'LightGBM': 'min_child_samples',
        'CatBoost': 'min_data_in_leaf'
    },
    'row_sampling': {
        'XGBoost': 'subsample',
        'LightGBM': 'bagging_fraction',
        'CatBoost': 'subsample'
    },
    'col_sampling': {
        'XGBoost': 'colsample_bytree',
        'LightGBM': 'feature_fraction',
        'CatBoost': 'rsm'
    },
    'l1_regularization': {
        'XGBoost': 'reg_alpha',
        'LightGBM': 'reg_alpha',
        'CatBoost': 'l1_leaf_reg'
    },
    'l2_regularization': {
        'XGBoost': 'reg_lambda',
        'LightGBM': 'reg_lambda',
        'CatBoost': 'l2_leaf_reg'
    }
}
```

---

## When to Use What

### Decision Guide

```
┌─────────────────────────────────┐
│  Do you have categorical        │
│  features?                      │
└────────┬────────────────────────┘
         │
    ┌────┴────┐
   YES       NO
    │         │
    v         v
┌────────┐ ┌──────────────────────┐
│CatBoost│ │  Is dataset very     │
└────────┘ │  large (100M+ rows)? │
           └────────┬─────────────┘
                    │
               ┌────┴────┐
              YES       NO
               │         │
               v         v
          ┌─────────┐ ┌──────────────────┐
          │LightGBM │ │  Need best       │
          └─────────┘ │  out-of-box      │
                      │  performance?    │
                      └────────┬─────────┘
                               │
                          ┌────┴────┐
                         YES       NO
                          │         │
                          v         v
                     ┌─────────┐ ┌────────┐
                     │CatBoost │ │XGBoost │
                     └─────────┘ └────────┘
```

### Use Cases

**Use XGBoost when:**
- ✓ Medium-sized datasets (< 10M rows)
- ✓ Need proven, stable library
- ✓ Wide community support needed
- ✓ No categorical features
- ✓ Fine-grained control needed

**Use LightGBM when:**
- ✓ Very large datasets (10M+ rows)
- ✓ Speed is critical
- ✓ Memory is limited
- ✓ High-dimensional features
- ✓ Willing to tune hyperparameters

**Use CatBoost when:**
- ✓ Many categorical features
- ✓ Want best default parameters
- ✓ Need robust model (less overfitting)
- ✓ Interpretability important
- ✓ Limited time for tuning

### Benchmark Results (Typical)

```
Dataset: 1M samples, 100 features, 10 categorical

Training Time:
XGBoost:  45 seconds
LightGBM: 15 seconds  (3x faster)
CatBoost: 30 seconds  (1.5x faster)

Memory Usage:
XGBoost:  2.5 GB
LightGBM: 0.8 GB  (3x less)
CatBoost: 1.5 GB  (1.7x less)

Accuracy (with default params):
XGBoost:  0.85
LightGBM: 0.86
CatBoost: 0.87  (best out-of-box)

Accuracy (after tuning):
XGBoost:  0.88
LightGBM: 0.89
CatBoost: 0.88

Kaggle wins (2017-2020):
XGBoost:  40%
LightGBM: 45%
CatBoost: 15%
```

---

## Real-World Applications

### 1. E-commerce Recommendation (CatBoost)

```python
# E-commerce with many categorical features
import pandas as pd
from catboost import CatBoostClassifier

# Example features
"""
user_id (categorical)
product_category (categorical)
brand (categorical)
day_of_week (categorical)
hour_of_day (numerical)
price (numerical)
discount (numerical)
user_age (numerical)
target: purchased (0/1)
"""

# Load data
# df = pd.read_csv('ecommerce.csv')

# Categorical features
cat_features = ['user_id', 'product_category', 'brand', 'day_of_week']

# CatBoost handles categoricals automatically
model = CatBoostClassifier(
    iterations=1000,
    learning_rate=0.05,
    depth=6,
    cat_features=cat_features,
    eval_metric='AUC',
    early_stopping_rounds=50,
    random_seed=42,
    verbose=100
)

# Train
# model.fit(X_train, y_train, eval_set=(X_val, y_val))

# Feature importance with categorical insights
# importance = model.get_feature_importance(prettified=True)
```

### 2. Click-Through Rate Prediction (LightGBM)

```python
# Large-scale CTR prediction
import lightgbm as lgb

# Billions of impressions, need speed
"""
Features:
- ad_id, campaign_id, advertiser_id (high cardinality)
- user_features (demographics, history)
- context_features (time, device, location)
Target: clicked (0/1)
"""

# LightGBM with GOSS for speed
params = {
    'objective': 'binary',
    'metric': 'auc',
    'boosting_type': 'goss',  # Gradient-based One-Side Sampling
    'num_leaves': 255,
    'learning_rate': 0.05,
    'feature_fraction': 0.8,
    'bagging_fraction': 0.8,
    'bagging_freq': 5,
    'max_bin': 255,
    'verbose': -1
}

# Train on large data
# train_data = lgb.Dataset('train.txt')  # Can read from file
# model = lgb.train(params, train_data, num_boost_round=1000)
```

### 3. Financial Risk Modeling (XGBoost)

```python
# Credit risk prediction with XGBoost
import xgboost as xgb

# Strict regulatory requirements, need interpretability
"""
Features:
- Credit history (continuous)
- Income, employment (continuous)
- Existing debt (continuous)
Target: default (0/1)
"""

# XGBoost with monotonic constraints
# (higher income → lower default risk)
monotone_constraints = {
    'income': -1,           # Higher income → lower risk
    'credit_score': -1,     # Higher score → lower risk
    'existing_debt': 1,     # Higher debt → higher risk
    'employment_years': -1  # More experience → lower risk
}

model = xgb.XGBClassifier(
    n_estimators=500,
    max_depth=3,           # Shallow for interpretability
    learning_rate=0.05,
    subsample=0.8,
    monotone_constraints=monotone_constraints,
    random_state=42
)

# Train
# model.fit(X_train, y_train, eval_set=(X_val, y_val))

# SHAP values for explanation
# import shap
# explainer = shap.TreeExplainer(model)
# shap_values = explainer.shap_values(X_test)
```

### 4. Ensemble of All Three

```python
# Ensemble: Combine XGBoost, LightGBM, CatBoost
from sklearn.ensemble import VotingClassifier

# Three models with different strengths
xgb_model = xgb.XGBClassifier(n_estimators=300, max_depth=5, learning_rate=0.05, random_state=42)
lgb_model = lgb.LGBMClassifier(n_estimators=300, num_leaves=31, learning_rate=0.05, random_state=42)
cat_model = CatBoostClassifier(iterations=300, depth=5, learning_rate=0.05, random_seed=42, verbose=False)

# Voting ensemble
voting = VotingClassifier(
    estimators=[
        ('xgb', xgb_model),
        ('lgb', lgb_model),
        ('cat', cat_model)
    ],
    voting='soft',  # Use probability averaging
    weights=[1, 1, 1]
)

voting.fit(X_train, y_train)
print("Ensemble Accuracy:", voting.score(X_test, y_test))

# Often better than individual models!
```

---

## Summary Checklist

### LightGBM
- [ ] Understand leaf-wise tree growth
- [ ] Explain histogram-based learning
- [ ] Know GOSS algorithm (gradient-based sampling)
- [ ] Understand EFB (exclusive feature bundling)
- [ ] Implement classification and regression
- [ ] Use GOSS and DART boosting
- [ ] Tune num_leaves vs max_depth
- [ ] Know when to use LightGBM (large data)

### CatBoost
- [ ] Understand ordered target encoding
- [ ] Explain ordered boosting
- [ ] Know symmetric (oblivious) trees
- [ ] Handle categorical features automatically
- [ ] Implement classification and regression
- [ ] Use Pool for better performance
- [ ] Visualize trees and feature importance
- [ ] Know when to use CatBoost (categorical data)

### Comparison
- [ ] Compare XGBoost, LightGBM, CatBoost
- [ ] Map hyperparameters across libraries
- [ ] Choose appropriate library for problem
- [ ] Combine multiple libraries in ensemble
- [ ] Know speed, memory, accuracy tradeoffs

---

## Quick Reference

### Installation

```bash
pip install xgboost lightgbm catboost
```

### Basic Usage

```python
# XGBoost
import xgboost as xgb
model = xgb.XGBClassifier()
model.fit(X_train, y_train)

# LightGBM
import lightgbm as lgb
model = lgb.LGBMClassifier()
model.fit(X_train, y_train)

# CatBoost
from catboost import CatBoostClassifier
model = CatBoostClassifier(verbose=False)
model.fit(X_train, y_train)
```

### Key Parameters

```python
# Equivalent parameters
config = {
    'num_trees': 100,
    'learning_rate': 0.1,
    'max_depth': 6,
    'subsample': 0.8,
    'colsample': 0.8
}

# XGBoost
xgb.XGBClassifier(
    n_estimators=config['num_trees'],
    learning_rate=config['learning_rate'],
    max_depth=config['max_depth'],
    subsample=config['subsample'],
    colsample_bytree=config['colsample']
)

# LightGBM
lgb.LGBMClassifier(
    n_estimators=config['num_trees'],
    learning_rate=config['learning_rate'],
    num_leaves=2**config['max_depth']-1,
    bagging_fraction=config['subsample'],
    feature_fraction=config['colsample']
)

# CatBoost
CatBoostClassifier(
    iterations=config['num_trees'],
    learning_rate=config['learning_rate'],
    depth=config['max_depth'],
    subsample=config['subsample'],
    rsm=config['colsample']
)
```

---

**Congratulations!** You now have comprehensive knowledge of all major ensemble methods: Decision Trees, Bagging, Random Forest, AdaBoost, Gradient Boosting, XGBoost, LightGBM, and CatBoost. These are the most important algorithms for tabular data and dominate Kaggle competitions!

**Previous:** [XGBoost](./xgboost.md) | **Start:** [Decision Trees](./decision-trees.md)
