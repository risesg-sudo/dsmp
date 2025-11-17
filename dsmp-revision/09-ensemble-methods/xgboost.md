# XGBoost - Comprehensive Revision Notes

## Table of Contents
1. [Introduction](#introduction)
2. [XGBoost vs Gradient Boosting](#xgboost-vs-gradient-boosting)
3. [Mathematical Foundation](#mathematical-foundation)
4. [Regularization](#regularization)
5. [System Optimizations](#system-optimizations)
6. [Handling Missing Values](#handling-missing-values)
7. [Implementation](#implementation)
8. [Hyperparameter Tuning](#hyperparameter-tuning)
9. [Advanced Features](#advanced-features)
10. [Kaggle Use Cases](#kaggle-use-cases)

---

## Introduction

**XGBoost (eXtreme Gradient Boosting)**: Optimized distributed gradient boosting library.

**Created by:** Tianqi Chen (2014)

**Why XGBoost is Popular:**
- 🏆 Dominates Kaggle competitions
- ⚡ Extremely fast and efficient
- 📈 Best performance on tabular data
- 🛠️ Rich features (regularization, missing values, custom objectives)
- 💻 Scalable (distributed training)
- 🔧 Great engineering (cache-aware, parallel, out-of-core)

### Key Innovations

1. **Regularization**: L1/L2 penalties on leaf weights
2. **Second-order approximation**: Uses both gradient and Hessian
3. **Sparsity awareness**: Automatic handling of missing values
4. **Weighted quantile sketch**: Efficient split finding
5. **Cache-aware access**: Better memory usage
6. **Out-of-core computing**: Handle data larger than RAM
7. **Distributed computing**: Multi-machine training

---

## XGBoost vs Gradient Boosting

### Comparison Table

| Feature | Gradient Boosting (sklearn) | XGBoost |
|---------|----------------------------|---------|
| **Regularization** | None (only via tree params) | L1, L2 on weights |
| **Split Finding** | Exact greedy | Approximate (weighted quantile) |
| **Missing Values** | Not handled | Automatic handling |
| **Parallel** | No (sequential trees) | Yes (feature-level) |
| **Tree Pruning** | Pre-pruning | Pre + Post pruning (max_delta_step) |
| **Built-in CV** | No | Yes (cv method) |
| **Early Stopping** | Yes | Yes (better implementation) |
| **Custom Objectives** | No | Yes |
| **Speed** | Slow | Very fast |
| **Memory** | Higher | Lower (cache-aware) |
| **Distributed** | No | Yes |

### Performance Comparison

```python
import time
from sklearn.ensemble import GradientBoostingClassifier
import xgboost as xgb
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

# Generate large dataset
X, y = make_classification(n_samples=10000, n_features=50, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# sklearn GradientBoosting
start = time.time()
gb_sklearn = GradientBoostingClassifier(n_estimators=100, max_depth=3)
gb_sklearn.fit(X_train, y_train)
sklearn_time = time.time() - start
sklearn_acc = gb_sklearn.score(X_test, y_test)

# XGBoost
start = time.time()
xgb_model = xgb.XGBClassifier(n_estimators=100, max_depth=3)
xgb_model.fit(X_train, y_train)
xgb_time = time.time() - start
xgb_acc = xgb_model.score(X_test, y_test)

print(f"sklearn GB: {sklearn_time:.2f}s, Accuracy: {sklearn_acc:.4f}")
print(f"XGBoost:    {xgb_time:.2f}s, Accuracy: {xgb_acc:.4f}")
print(f"Speedup:    {sklearn_time/xgb_time:.2f}x")
```

---

## Mathematical Foundation

### Objective Function

**Goal:** Minimize regularized objective

```
Obj = Σ loss(yᵢ, ŷᵢ) + Σ Ω(fₖ)
      i=1 to n        k=1 to K

where:
- loss: Training loss (e.g., MSE, log-loss)
- Ω: Regularization term
- fₖ: k-th tree
```

### Regularization Term

```
Ω(f) = γT + (λ/2) Σ wⱼ²
                   j=1 to T

where:
- T: Number of leaves
- wⱼ: Weight of leaf j
- γ: Penalty for number of leaves
- λ: L2 regularization on weights
```

**Interpretation:**
- γT: Complexity penalty (like min_samples_leaf)
- λΣwⱼ²: L2 regularization (prevents large weights)

### Additive Training

**At iteration t:**

```
ŷᵢ⁽ᵗ⁾ = ŷᵢ⁽ᵗ⁻¹⁾ + fₜ(xᵢ)

Objective:
Obj⁽ᵗ⁾ = Σ loss(yᵢ, ŷᵢ⁽ᵗ⁻¹⁾ + fₜ(xᵢ)) + Ω(fₜ)
         i=1 to n
```

### Second-Order Taylor Approximation

**Traditional GB:** Uses only first-order (gradient)

**XGBoost:** Uses second-order (gradient + Hessian)

**Taylor Expansion:**

```
loss(yᵢ, ŷᵢ⁽ᵗ⁻¹⁾ + fₜ(xᵢ)) ≈ loss(yᵢ, ŷᵢ⁽ᵗ⁻¹⁾) + gᵢfₜ(xᵢ) + (hᵢ/2)fₜ²(xᵢ)

where:
gᵢ = ∂loss/∂ŷ|ŷ=ŷ⁽ᵗ⁻¹⁾        (first-order gradient)
hᵢ = ∂²loss/∂ŷ²|ŷ=ŷ⁽ᵗ⁻¹⁾      (second-order Hessian)
```

**Removing constants:**

```
Obj⁽ᵗ⁾ ≈ Σ [gᵢfₜ(xᵢ) + (hᵢ/2)fₜ²(xᵢ)] + Ω(fₜ)
          i=1 to n
```

### Optimal Leaf Weights

**For a fixed tree structure:**

Define:
- Iⱼ: Set of instances in leaf j
- Gⱼ = Σ gᵢ (sum of gradients in leaf j)
- Hⱼ = Σ hᵢ (sum of hessians in leaf j)

Then:
```
fₜ(x) = wⱼ  if x ∈ leaf j

Obj⁽ᵗ⁾ = Σ [Gⱼwⱼ + (Hⱼ/2)wⱼ²] + γT + (λ/2)Σwⱼ²
         j=1 to T                      j=1 to T

       = Σ [Gⱼwⱼ + ((Hⱼ+λ)/2)wⱼ²] + γT
         j=1 to T
```

**Optimal weight for leaf j (take derivative, set to 0):**

```
wⱼ* = -Gⱼ / (Hⱼ + λ)
```

**Objective at optimal weights:**

```
Obj* = -(1/2) Σ Gⱼ²/(Hⱼ + λ) + γT
             j=1 to T
```

### Split Finding (Gain Calculation)

**For a candidate split:**

```
Before split: Leaf with I = I_L ∪ I_R
After split:  Left leaf I_L, Right leaf I_R

Gain = Obj_before - Obj_after
     = (1/2)[G_L²/(H_L + λ) + G_R²/(H_R + λ) - (G_L + G_R)²/(H_L + H_R + λ)] - γ

where:
- G_L = Σ gᵢ for i ∈ I_L
- G_R = Σ gᵢ for i ∈ I_R
- H_L = Σ hᵢ for i ∈ I_L
- H_R = Σ hᵢ for i ∈ I_R
- γ: Penalty for adding a leaf
```

**Split only if Gain > 0**

### Example: Squared Loss

**Loss function:**
```
loss(y, ŷ) = (y - ŷ)²/2
```

**Gradients:**
```
gᵢ = ∂loss/∂ŷ = ŷ - y = -(y - ŷ) = -residual
hᵢ = ∂²loss/∂ŷ² = 1
```

**Optimal weight:**
```
wⱼ* = -Gⱼ/(Hⱼ + λ)
    = -Σ(-residual)/(|Iⱼ| + λ)
    = Σ residual/(|Iⱼ| + λ)
    ≈ mean(residual)  (when λ ≈ 0)
```

This matches traditional gradient boosting!

### Example: Log Loss (Binary Classification)

**Loss function:**
```
loss(y, ŷ) = y·log(1 + e⁻ŷ) + (1-y)·log(1 + eŷ)

Probability: p = 1/(1 + e⁻ŷ)
```

**Gradients:**
```
gᵢ = ∂loss/∂ŷ = p - y
hᵢ = ∂²loss/∂ŷ² = p(1 - p)
```

**Optimal weight:**
```
wⱼ* = -Σ(p - y) / [Σp(1-p) + λ]
```

### ASCII Visualization of Split Finding

```
SPLIT FINDING WITH GAIN
========================

Current Node:
  Instances: {1,2,3,4,5,6}
  G = -2.5, H = 6.0

Candidate Split: x[0] < 3.5
  Left:  {1,2,3}    G_L = -1.0, H_L = 3.0
  Right: {4,5,6}    G_R = -1.5, H_R = 3.0

Gain = (1/2)[(-1.0)²/(3.0+1.0) + (-1.5)²/(3.0+1.0) - (-2.5)²/(6.0+1.0)] - γ
     = (1/2)[0.25 + 0.5625 - 0.893] - γ
     = -0.04 - γ

If γ = 0: Gain = -0.04 < 0  ❌ Don't split
If γ = 1: Gain = -1.04 < 0  ❌ Don't split

This split is not beneficial!
```

---

## Regularization

### Types of Regularization in XGBoost

1. **L1 Regularization (alpha)**
```
Ω(f) = γT + α Σ|wⱼ| + (λ/2)Σwⱼ²
```

2. **L2 Regularization (lambda)**
```
Ω(f) = γT + (λ/2)Σwⱼ²
```

3. **Minimum Loss Reduction (gamma)**
```
Split only if Gain > γ
```

4. **Tree Complexity**
   - max_depth: Maximum depth
   - min_child_weight: Minimum Σhᵢ in child (like min_samples_leaf)
   - max_delta_step: Maximum prediction change (helps convergence)

5. **Sampling**
   - subsample: Row sampling (fraction of samples per tree)
   - colsample_bytree: Column sampling per tree
   - colsample_bylevel: Column sampling per level
   - colsample_bynode: Column sampling per split

### Regularization Examples

```python
import xgboost as xgb

# No regularization (prone to overfit)
xgb_no_reg = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=10,
    reg_alpha=0,      # No L1
    reg_lambda=0,     # No L2
    gamma=0,          # No minimum gain
    min_child_weight=0,
    subsample=1.0,
    colsample_bytree=1.0
)

# Heavy regularization
xgb_heavy_reg = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=3,          # Shallow trees
    reg_alpha=1.0,        # L1 regularization
    reg_lambda=1.0,       # L2 regularization
    gamma=1.0,            # Minimum gain
    min_child_weight=10,  # Minimum instances
    subsample=0.8,        # 80% rows
    colsample_bytree=0.8, # 80% columns
    learning_rate=0.1
)

# Train and compare
xgb_no_reg.fit(X_train, y_train)
xgb_heavy_reg.fit(X_train, y_train)

print("No Regularization:")
print(f"  Train: {xgb_no_reg.score(X_train, y_train):.4f}")
print(f"  Test:  {xgb_no_reg.score(X_test, y_test):.4f}")

print("\nHeavy Regularization:")
print(f"  Train: {xgb_heavy_reg.score(X_train, y_train):.4f}")
print(f"  Test:  {xgb_heavy_reg.score(X_test, y_test):.4f}")
```

### Effect of Lambda (L2)

```python
import numpy as np
import matplotlib.pyplot as plt

lambdas = [0, 0.1, 0.5, 1, 5, 10, 50, 100]
train_scores = []
test_scores = []

for lam in lambdas:
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        reg_lambda=lam,
        random_state=42
    )
    model.fit(X_train, y_train)
    train_scores.append(model.score(X_train, y_train))
    test_scores.append(model.score(X_test, y_test))

plt.figure(figsize=(10, 6))
plt.semilogx(lambdas, train_scores, marker='o', label='Train')
plt.semilogx(lambdas, test_scores, marker='s', label='Test')
plt.xlabel('Lambda (L2 regularization)')
plt.ylabel('Accuracy')
plt.title('Effect of L2 Regularization')
plt.legend()
plt.grid(True)
plt.show()

best_lambda = lambdas[np.argmax(test_scores)]
print(f"Best lambda: {best_lambda}")
```

### Effect of Gamma (Minimum Gain)

```python
gammas = [0, 0.1, 0.5, 1, 2, 5, 10]
train_scores = []
test_scores = []
n_leaves = []

for gamma in gammas:
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=6,
        gamma=gamma,
        random_state=42
    )
    model.fit(X_train, y_train)
    train_scores.append(model.score(X_train, y_train))
    test_scores.append(model.score(X_test, y_test))

    # Get average number of leaves (approximate)
    booster = model.get_booster()
    trees = booster.get_dump()
    avg_leaves = np.mean([tree.count('leaf') for tree in trees])
    n_leaves.append(avg_leaves)

# Plot
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))

ax1.plot(gammas, train_scores, marker='o', label='Train')
ax1.plot(gammas, test_scores, marker='s', label='Test')
ax1.set_xlabel('Gamma')
ax1.set_ylabel('Accuracy')
ax1.set_title('Effect of Gamma on Accuracy')
ax1.legend()
ax1.grid(True)

ax2.plot(gammas, n_leaves, marker='o', color='green')
ax2.set_xlabel('Gamma')
ax2.set_ylabel('Average Number of Leaves')
ax2.set_title('Effect of Gamma on Tree Complexity')
ax2.grid(True)

plt.tight_layout()
plt.show()
```

---

## System Optimizations

### 1. Column Block for Parallel Learning

**Problem:** Finding best split requires scanning all features

**Solution:** Store data in column blocks (CSC format)

```
Row-based (slow):
Sample 1: [f1, f2, f3, f4]
Sample 2: [f1, f2, f3, f4]
Sample 3: [f1, f2, f3, f4]

Column-based (fast - parallel):
Feature 1: [s1, s2, s3]  ─┐
Feature 2: [s1, s2, s3]   ├─> Process in parallel
Feature 3: [s1, s2, s3]   │
Feature 4: [s1, s2, s3]  ─┘
```

**Benefit:** Parallel processing across features

### 2. Cache-Aware Access

**Problem:** Random memory access is slow

**Solution:**
- Pre-sort feature values
- Use cache-aware prefetching
- Block-wise computation

**Impact:** 2x-10x speedup

### 3. Blocks for Out-of-Core Computation

**Problem:** Dataset larger than RAM

**Solution:**
- Divide data into blocks
- Compress blocks
- Store on disk
- Load blocks as needed

```python
# Out-of-core training
dtrain = xgb.DMatrix('train.txt#dtrain.cache')  # Enable cache
dtest = xgb.DMatrix('test.txt#dtest.cache')

params = {
    'max_depth': 3,
    'eta': 0.1,
    'objective': 'binary:logistic'
}

bst = xgb.train(params, dtrain, num_boost_round=100)
```

### 4. Sparsity-Aware Split Finding

**Problem:** Missing values and sparse features common in real data

**Solution:** Learn default direction for missing values

```
For each split candidate:
  1. Calculate gain with missing → left
  2. Calculate gain with missing → right
  3. Choose direction with higher gain
```

**Benefit:** Automatic handling of missing values

### 5. Approximate Algorithm (Weighted Quantile Sketch)

**Problem:** Exact greedy is slow for large datasets

**Solution:** Use approximate split finding

**Algorithm:**
1. Propose candidate split points using quantiles
2. Evaluate only candidate points
3. Weight quantiles by Hessian (second-order gradient)

```
Traditional quantiles: Uniform weight
XGBoost quantiles: Weight by hᵢ (instance importance)
```

**Benefit:** Fast for large data with minimal accuracy loss

---

## Handling Missing Values

### Automatic Learning

XGBoost learns optimal direction for missing values.

**Algorithm:**
```
For each split:
  1. Calculate gain with missing → left:
     Gain_left = (G_L + G_missing)²/(H_L + H_missing)
                 + G_R²/H_R - G²/H

  2. Calculate gain with missing → right:
     Gain_right = G_L²/H_L
                  + (G_R + G_missing)²/(H_R + H_missing) - G²/H

  3. Choose direction with higher gain
```

### Example

```python
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split

# Create data with missing values
X, y = make_classification(n_samples=1000, n_features=20, random_state=42)

# Introduce missing values randomly
X_missing = X.copy()
missing_mask = np.random.random(X.shape) < 0.2  # 20% missing
X_missing[missing_mask] = np.nan

X_train, X_test, y_train, y_test = train_test_split(X_missing, y, test_size=0.2)

# XGBoost handles missing values automatically
xgb_model = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=3,
    missing=np.nan,  # Explicitly set missing value indicator
    random_state=42
)

xgb_model.fit(X_train, y_train)
print("Accuracy with missing values:", xgb_model.score(X_test, y_test))

# Compare with imputation
from sklearn.impute import SimpleImputer

imputer = SimpleImputer(strategy='mean')
X_train_imputed = imputer.fit_transform(X_train)
X_test_imputed = imputer.transform(X_test)

xgb_imputed = xgb.XGBClassifier(n_estimators=100, max_depth=3, random_state=42)
xgb_imputed.fit(X_train_imputed, y_train)
print("Accuracy with imputation:", xgb_imputed.score(X_test_imputed, y_test))
```

### Visualize Missing Value Handling

```python
# Get tree dump to see missing value directions
booster = xgb_model.get_booster()
trees = booster.get_dump()

print("First tree (showing missing value handling):")
print(trees[0][:500])  # Print first 500 chars

# Trees will show: "missing" direction for splits
# Example: [f5<3.5] yes=1,no=2,missing=1
#          This means missing values go to left child (node 1)
```

---

## Implementation

### Basic Classification

```python
import xgboost as xgb
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix

# Load data
data = load_breast_cancer()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Method 1: sklearn API
xgb_clf = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=3,
    learning_rate=0.1,
    objective='binary:logistic',
    random_state=42,
    n_jobs=-1
)

xgb_clf.fit(X_train, y_train)

# Predictions
y_pred = xgb_clf.predict(X_test)
y_proba = xgb_clf.predict_proba(X_test)[:, 1]

# Evaluation
print("Accuracy:", xgb_clf.score(X_test, y_test))
print("AUC:", roc_auc_score(y_test, y_proba))
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=data.target_names))
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# Feature importance
print("\nTop 5 Features:")
feature_imp = xgb_clf.feature_importances_
top_features = np.argsort(feature_imp)[::-1][:5]
for i in top_features:
    print(f"{data.feature_names[i]}: {feature_imp[i]:.4f}")
```

### Using Native API (More Control)

```python
# Method 2: Native XGBoost API (more features)
dtrain = xgb.DMatrix(X_train, label=y_train, feature_names=data.feature_names)
dtest = xgb.DMatrix(X_test, label=y_test, feature_names=data.feature_names)

# Parameters
params = {
    'max_depth': 3,
    'eta': 0.1,                      # learning_rate
    'objective': 'binary:logistic',
    'eval_metric': ['logloss', 'auc'],
    'seed': 42
}

# Evaluation list
evals = [(dtrain, 'train'), (dtest, 'test')]

# Train with evaluation
bst = xgb.train(
    params,
    dtrain,
    num_boost_round=100,
    evals=evals,
    early_stopping_rounds=10,
    verbose_eval=10  # Print every 10 rounds
)

# Predict
y_pred_proba = bst.predict(dtest)
y_pred = (y_pred_proba > 0.5).astype(int)

print("\nBest iteration:", bst.best_iteration)
print("Best score:", bst.best_score)
```

### Regression

```python
from sklearn.datasets import make_regression
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error

# Generate data
X, y = make_regression(n_samples=1000, n_features=20, noise=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# XGBoost Regressor
xgb_reg = xgb.XGBRegressor(
    n_estimators=100,
    max_depth=3,
    learning_rate=0.1,
    objective='reg:squarederror',  # or 'reg:absoluteerror', 'reg:pseudohubererror'
    random_state=42,
    n_jobs=-1
)

xgb_reg.fit(X_train, y_train)

# Predictions
y_pred = xgb_reg.predict(X_test)

# Evaluation
print("R² Score:", r2_score(y_test, y_pred))
print("RMSE:", np.sqrt(mean_squared_error(y_test, y_pred)))
print("MAE:", mean_absolute_error(y_test, y_pred))
```

### Multi-class Classification

```python
from sklearn.datasets import load_iris

# Load data
iris = load_iris()
X, y = iris.data, iris.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# XGBoost multi-class
xgb_multi = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=3,
    learning_rate=0.1,
    objective='multi:softprob',  # 'multi:softmax' for labels, 'multi:softprob' for probabilities
    num_class=3,                 # Number of classes (automatically detected in sklearn API)
    random_state=42
)

xgb_multi.fit(X_train, y_train)

# Predictions
y_pred = xgb_multi.predict(X_test)
y_proba = xgb_multi.predict_proba(X_test)

print("Accuracy:", xgb_multi.score(X_test, y_test))
print("\nPrediction probabilities (first 5):")
print(y_proba[:5])
```

### Early Stopping

```python
# Split into train/validation
X_train_split, X_val, y_train_split, y_val = train_test_split(
    X_train, y_train, test_size=0.2, random_state=42
)

# Train with early stopping
xgb_early = xgb.XGBClassifier(
    n_estimators=1000,     # Large number
    max_depth=3,
    learning_rate=0.1,
    early_stopping_rounds=10,
    random_state=42,
    n_jobs=-1
)

xgb_early.fit(
    X_train_split,
    y_train_split,
    eval_set=[(X_val, y_val)],
    eval_metric='logloss',
    verbose=10
)

print(f"Best iteration: {xgb_early.best_iteration}")
print(f"Best score: {xgb_early.best_score}")
print(f"Test accuracy: {xgb_early.score(X_test, y_test):.4f}")
```

---

## Hyperparameter Tuning

### Key Hyperparameters

```python
XGBOOST_PARAMS = {
    # Tree Structure
    'max_depth': {
        'description': 'Maximum depth of trees',
        'default': 6,
        'typical': [3, 5, 7, 9],
        'effect': 'Higher → More complex, risk overfit'
    },
    'min_child_weight': {
        'description': 'Minimum sum of hessian in child',
        'default': 1,
        'typical': [1, 3, 5, 10],
        'effect': 'Higher → More conservative, like min_samples_leaf'
    },
    'max_delta_step': {
        'description': 'Maximum delta step per tree',
        'default': 0,
        'typical': [0, 1, 5, 10],
        'effect': 'Used for imbalanced classification'
    },

    # Regularization
    'gamma': {
        'description': 'Minimum loss reduction for split',
        'default': 0,
        'typical': [0, 0.1, 0.5, 1, 5],
        'effect': 'Higher → More conservative splitting'
    },
    'reg_alpha': {
        'description': 'L1 regularization',
        'default': 0,
        'typical': [0, 0.1, 0.5, 1],
        'effect': 'Higher → More regularization, feature selection'
    },
    'reg_lambda': {
        'description': 'L2 regularization',
        'default': 1,
        'typical': [0, 0.1, 1, 10],
        'effect': 'Higher → More regularization'
    },

    # Boosting
    'learning_rate': {
        'description': 'Shrinkage rate (eta)',
        'default': 0.3,
        'typical': [0.01, 0.1, 0.3],
        'effect': 'Lower → Need more trees, better generalization'
    },
    'n_estimators': {
        'description': 'Number of trees',
        'default': 100,
        'typical': [100, 500, 1000],
        'effect': 'More → Better fit, use early stopping'
    },

    # Sampling
    'subsample': {
        'description': 'Row sampling fraction',
        'default': 1,
        'typical': [0.6, 0.8, 1.0],
        'effect': 'Lower → More randomness, faster, regularization'
    },
    'colsample_bytree': {
        'description': 'Column sampling per tree',
        'default': 1,
        'typical': [0.6, 0.8, 1.0],
        'effect': 'Lower → More randomness, like Random Forest'
    },
    'colsample_bylevel': {
        'description': 'Column sampling per level',
        'default': 1,
        'typical': [0.6, 0.8, 1.0],
        'effect': 'Lower → More randomness per level'
    },
    'colsample_bynode': {
        'description': 'Column sampling per split',
        'default': 1,
        'typical': [0.6, 0.8, 1.0],
        'effect': 'Lower → Most randomness'
    }
}
```

### Tuning Strategy

```python
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV
from scipy.stats import randint, uniform

# Step 1: Coarse search with Random Search
param_dist = {
    'max_depth': randint(3, 10),
    'learning_rate': uniform(0.01, 0.29),
    'n_estimators': randint(100, 500),
    'min_child_weight': randint(1, 10),
    'gamma': uniform(0, 5),
    'subsample': uniform(0.6, 0.4),
    'colsample_bytree': uniform(0.6, 0.4),
    'reg_alpha': uniform(0, 1),
    'reg_lambda': uniform(0, 10)
}

random_search = RandomizedSearchCV(
    xgb.XGBClassifier(random_state=42, n_jobs=-1),
    param_distributions=param_dist,
    n_iter=100,
    cv=5,
    scoring='roc_auc',
    random_state=42,
    n_jobs=-1,
    verbose=2
)

random_search.fit(X_train, y_train)
print("Best parameters (random):", random_search.best_params_)
print("Best CV score:", random_search.best_score_)

# Step 2: Fine-tune around best parameters
best_params = random_search.best_params_

param_grid = {
    'max_depth': [best_params['max_depth'] - 1, best_params['max_depth'], best_params['max_depth'] + 1],
    'learning_rate': [best_params['learning_rate'] * 0.5, best_params['learning_rate'], best_params['learning_rate'] * 1.5],
    'min_child_weight': [best_params['min_child_weight'] - 1, best_params['min_child_weight'], best_params['min_child_weight'] + 1],
}

grid_search = GridSearchCV(
    xgb.XGBClassifier(
        n_estimators=best_params['n_estimators'],
        gamma=best_params['gamma'],
        subsample=best_params['subsample'],
        colsample_bytree=best_params['colsample_bytree'],
        reg_alpha=best_params['reg_alpha'],
        reg_lambda=best_params['reg_lambda'],
        random_state=42,
        n_jobs=-1
    ),
    param_grid,
    cv=5,
    scoring='roc_auc',
    n_jobs=-1
)

grid_search.fit(X_train, y_train)
print("\nBest parameters (grid):", grid_search.best_params_)
print("Best CV score:", grid_search.best_score_)
print("Test score:", grid_search.score(X_test, y_test))
```

### Built-in Cross-Validation

```python
# XGBoost's built-in CV (faster than sklearn's)
dtrain = xgb.DMatrix(X_train, label=y_train)

params = {
    'max_depth': 3,
    'eta': 0.1,
    'objective': 'binary:logistic',
    'eval_metric': 'auc'
}

# Run CV
cv_results = xgb.cv(
    params,
    dtrain,
    num_boost_round=1000,
    nfold=5,
    early_stopping_rounds=10,
    metrics=['auc'],
    seed=42,
    verbose_eval=10
)

print("\nCV Results:")
print(cv_results.tail())
print(f"\nBest iteration: {cv_results['test-auc-mean'].idxmax()}")
print(f"Best CV AUC: {cv_results['test-auc-mean'].max():.4f}")
```

---

## Advanced Features

### 1. Custom Objective Function

```python
def custom_objective(y_true, y_pred):
    """
    Custom weighted log loss
    Give more weight to positive class
    """
    weight_positive = 2.0
    weight_negative = 1.0

    # Calculate gradients and hessians
    sigmoid = 1.0 / (1.0 + np.exp(-y_pred))

    grad = np.where(
        y_true == 1,
        weight_positive * (sigmoid - 1),
        weight_negative * sigmoid
    )

    hess = np.where(
        y_true == 1,
        weight_positive * sigmoid * (1 - sigmoid),
        weight_negative * sigmoid * (1 - sigmoid)
    )

    return grad, hess

# Use custom objective
dtrain = xgb.DMatrix(X_train, label=y_train)
dtest = xgb.DMatrix(X_test, label=y_test)

params = {
    'max_depth': 3,
    'eta': 0.1,
    'eval_metric': 'auc'
}

bst = xgb.train(
    params,
    dtrain,
    num_boost_round=100,
    obj=custom_objective,  # Custom objective
    evals=[(dtest, 'test')]
)
```

### 2. Custom Evaluation Metric

```python
def custom_eval(y_pred, dtrain):
    """
    Custom F1 score evaluation
    """
    y_true = dtrain.get_label()
    y_pred_binary = (y_pred > 0.5).astype(int)

    tp = np.sum((y_true == 1) & (y_pred_binary == 1))
    fp = np.sum((y_true == 0) & (y_pred_binary == 1))
    fn = np.sum((y_true == 1) & (y_pred_binary == 0))

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

    return 'f1', f1

# Use custom metric
bst = xgb.train(
    params,
    dtrain,
    num_boost_round=100,
    evals=[(dtrain, 'train'), (dtest, 'test')],
    feval=custom_eval,  # Custom evaluation
    verbose_eval=10
)
```

### 3. Feature Interaction Constraints

```python
# Constrain which features can interact
# Example: Features [0,1,2] can interact, [3,4] can interact, but not across groups

interaction_constraints = [[0, 1, 2], [3, 4]]

xgb_constrained = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=5,
    interaction_constraints=interaction_constraints,
    random_state=42
)

xgb_constrained.fit(X_train, y_train)
```

### 4. Monotonic Constraints

```python
# Force monotonic relationship
# Example: Feature 0 should have positive monotonic effect (higher feature → higher prediction)

monotone_constraints = (1, 0, -1, 0, 0)  # Feature 0: positive, Feature 2: negative, others: none

xgb_monotonic = xgb.XGBRegressor(
    n_estimators=100,
    max_depth=3,
    monotone_constraints=monotone_constraints,
    random_state=42
)

xgb_monotonic.fit(X_train, y_train)
```

### 5. Tree Methods

```python
# Different tree construction algorithms

# 1. Exact greedy (default, best accuracy)
xgb_exact = xgb.XGBClassifier(tree_method='exact')

# 2. Approximate (faster for large data)
xgb_approx = xgb.XGBClassifier(tree_method='approx')

# 3. Histogram-based (fastest, similar to LightGBM)
xgb_hist = xgb.XGBClassifier(tree_method='hist')

# 4. GPU (if available)
xgb_gpu = xgb.XGBClassifier(tree_method='gpu_hist', gpu_id=0)
```

---

## Kaggle Use Cases

### 1. Titanic Survival

```python
import pandas as pd

# Load and engineer features (example)
def prepare_titanic(df):
    df = df.copy()

    # Fill missing
    df['Age'].fillna(df['Age'].median(), inplace=True)
    df['Fare'].fillna(df['Fare'].median(), inplace=True)
    df['Embarked'].fillna(df['Embarked'].mode()[0], inplace=True)

    # Feature engineering
    df['FamilySize'] = df['SibSp'] + df['Parch'] + 1
    df['IsAlone'] = (df['FamilySize'] == 1).astype(int)
    df['Title'] = df['Name'].str.extract(' ([A-Za-z]+)\.', expand=False)

    # Encode
    df['Sex'] = (df['Sex'] == 'male').astype(int)
    df['Embarked'] = pd.Categorical(df['Embarked']).codes
    df['Title'] = pd.Categorical(df['Title']).codes

    features = ['Pclass', 'Sex', 'Age', 'Fare', 'Embarked', 'FamilySize', 'IsAlone', 'Title']
    return df[features]

# X_train = prepare_titanic(train_df)
# y_train = train_df['Survived']

# XGBoost model
xgb_titanic = xgb.XGBClassifier(
    n_estimators=500,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    gamma=0.1,
    reg_alpha=0.1,
    reg_lambda=1,
    min_child_weight=3,
    early_stopping_rounds=50,
    random_state=42
)

# Cross-validation
from sklearn.model_selection import cross_val_score
# scores = cross_val_score(xgb_titanic, X_train, y_train, cv=5, scoring='accuracy')
# print(f"CV Accuracy: {scores.mean():.4f} (+/- {scores.std():.4f})")
```

### 2. House Prices

```python
# House price prediction with XGBoost
def train_house_price_model():
    """
    Regression for house prices
    """
    xgb_house = xgb.XGBRegressor(
        n_estimators=1000,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.7,
        gamma=0,
        reg_alpha=0.5,
        reg_lambda=1,
        min_child_weight=1,
        objective='reg:squarederror',
        random_state=42,
        n_jobs=-1
    )

    return xgb_house

# Feature engineering is crucial
# - Log transform target (SalePrice)
# - Handle outliers
# - Create interaction features
# - Polynomial features for numeric
```

### 3. Imbalanced Classification (Fraud Detection)

```python
# Handle imbalanced data
from sklearn.utils.class_weight import compute_sample_weight

# Method 1: scale_pos_weight
pos_ratio = sum(y_train == 0) / sum(y_train == 1)

xgb_fraud = xgb.XGBClassifier(
    n_estimators=500,
    max_depth=3,
    learning_rate=0.1,
    scale_pos_weight=pos_ratio,  # Balance classes
    max_delta_step=1,             # Control prediction change
    subsample=0.8,
    colsample_bytree=0.8,
    gamma=0.1,
    random_state=42
)

# Method 2: sample_weight
sample_weights = compute_sample_weight('balanced', y_train)
xgb_fraud.fit(X_train, y_train, sample_weight=sample_weights)

# Method 3: Custom objective (seen earlier)
# Use weighted log loss
```

### 4. Ensemble with Stacking

```python
from sklearn.ensemble import StackingClassifier
from sklearn.linear_model import LogisticRegression

# Base models
xgb1 = xgb.XGBClassifier(max_depth=3, learning_rate=0.1, n_estimators=100)
xgb2 = xgb.XGBClassifier(max_depth=5, learning_rate=0.05, n_estimators=200)
xgb3 = xgb.XGBClassifier(max_depth=7, learning_rate=0.01, n_estimators=500)

# Stack with logistic regression
stacking = StackingClassifier(
    estimators=[
        ('xgb1', xgb1),
        ('xgb2', xgb2),
        ('xgb3', xgb3)
    ],
    final_estimator=LogisticRegression(),
    cv=5
)

stacking.fit(X_train, y_train)
print("Stacking Accuracy:", stacking.score(X_test, y_test))
```

---

## Summary Checklist

- [ ] Understand XGBoost innovations (regularization, second-order, sparsity)
- [ ] Derive optimal leaf weights from second-order Taylor expansion
- [ ] Calculate split gain with L1/L2 regularization
- [ ] Know different regularization methods (gamma, alpha, lambda, sampling)
- [ ] Understand system optimizations (column blocks, cache-aware, out-of-core)
- [ ] Explain automatic missing value handling
- [ ] Implement classification and regression
- [ ] Use both sklearn API and native API
- [ ] Apply early stopping
- [ ] Tune hyperparameters systematically
- [ ] Use built-in CV
- [ ] Create custom objectives and metrics
- [ ] Apply to imbalanced data
- [ ] Know when to use XGBoost vs other methods

---

**Next:** [LightGBM and CatBoost](./lightgbm-catboost.md)
