# Gradient Boosting - Comprehensive Revision Notes

## Table of Contents
1. [Introduction to Boosting](#introduction-to-boosting)
2. [AdaBoost](#adaboost)
3. [Gradient Boosting Intuition](#gradient-boosting-intuition)
4. [Gradient Boosting Mathematics](#gradient-boosting-mathematics)
5. [Gradient Boosting Implementation](#gradient-boosting-implementation)
6. [Hyperparameter Tuning](#hyperparameter-tuning)
7. [Practical Tips](#practical-tips)

---

## Introduction to Boosting

### Core Concept

**Boosting**: Sequential ensemble method that combines weak learners to create a strong learner.

**Key Idea:**
```
Train models sequentially, each correcting mistakes of previous ones
```

### Bagging vs Boosting (Revisited)

```
BAGGING (Parallel):
Model 1 ──┐
Model 2 ──┼──> Average/Vote ──> Prediction
Model 3 ──┘
(Independent, equal weight)

BOOSTING (Sequential):
Data ──> Model 1 ──> Reweight ──> Model 2 ──> Reweight ──> Model 3 ──> Weighted Sum ──> Prediction
         (focus on hard examples)      (focus on harder examples)
```

### ASCII Visualization

```
BOOSTING PROCESS
================

Round 1: All samples equal weight
● ● ● ● ● ● ● ● ●
Train Model 1 → Some mistakes: ● ● ✗ ● ✗ ● ● ✗ ●

Round 2: Increase weight on mistakes
● ● ●● ● ●● ● ●● ●
Train Model 2 → Some mistakes: ● ● ● ● ✗ ● ● ● ✗

Round 3: Further increase weight on mistakes
● ● ● ● ●● ● ● ● ●●
Train Model 3 → Fewer mistakes

Final Model = α₁·Model₁ + α₂·Model₂ + α₃·Model₃
```

### Types of Boosting

| Algorithm | Year | Key Idea | Base Learner |
|-----------|------|----------|--------------|
| **AdaBoost** | 1996 | Reweight samples | Decision stumps |
| **Gradient Boosting** | 1999 | Fit residuals | Shallow trees |
| **XGBoost** | 2014 | Regularized GB + optimizations | Trees |
| **LightGBM** | 2017 | Leaf-wise growth, GOSS | Trees |
| **CatBoost** | 2017 | Ordered boosting, categorical | Trees |

---

## AdaBoost

### Algorithm Intuition

**AdaBoost (Adaptive Boosting):**
1. Start with equal sample weights
2. Train weak learner (e.g., decision stump)
3. Increase weights for misclassified samples
4. Train next learner on reweighted data
5. Repeat, combine with weighted voting

### Mathematical Formulation

**Initialization:**
```
w₁(i) = 1/n  for i = 1, ..., n
(equal weights for all samples)
```

**For t = 1 to T:**

**1. Train weak learner hₜ:**
```
hₜ = argmin Σ wₜ(i) · 1[yᵢ ≠ h(xᵢ)]
```

**2. Compute weighted error:**
```
εₜ = Σ wₜ(i) · 1[yᵢ ≠ hₜ(xᵢ)] / Σ wₜ(i)
```

**3. Compute model weight:**
```
αₜ = 0.5 · ln((1 - εₜ) / εₜ)
```

**4. Update sample weights:**
```
wₜ₊₁(i) = wₜ(i) · exp(-αₜ · yᵢ · hₜ(xᵢ))
```

**5. Normalize weights:**
```
wₜ₊₁(i) = wₜ₊₁(i) / Σ wₜ₊₁(j)
```

**Final Model:**
```
H(x) = sign(Σ αₜ · hₜ(x))
```

### Step-by-Step Example

**Dataset:**
```
X = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
y = [1, 1, 1, -1, -1, -1, 1, 1, 1, -1]
```

**Round 1:**

```
Initial weights: w₁ = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]

Train stump: h₁(x) = 1 if x < 2.5 else -1

Predictions: h₁ = [1, 1, -1, -1, -1, -1, -1, -1, -1, -1]
True labels: y  = [1, 1,  1, -1, -1, -1,  1,  1,  1, -1]
Mistakes:           ✓  ✓  ✗   ✓   ✓   ✓  ✗  ✗  ✗   ✓

Weighted error: ε₁ = (0.1 + 0.1 + 0.1 + 0.1) / 1.0 = 0.4

Model weight: α₁ = 0.5 · ln((1 - 0.4) / 0.4) = 0.5 · ln(1.5) ≈ 0.203

Update weights for mistakes (multiply by exp(α₁)):
w₂(3) = 0.1 · exp(0.203) ≈ 0.122
w₂(7) = 0.1 · exp(0.203) ≈ 0.122
w₂(8) = 0.1 · exp(0.203) ≈ 0.122
w₂(9) = 0.1 · exp(0.203) ≈ 0.122

Update weights for correct (multiply by exp(-α₁)):
Others ≈ 0.082

Normalize: w₂ = [0.082, 0.082, 0.122, 0.082, 0.082, 0.082, 0.122, 0.122, 0.122, 0.082]
```

**Round 2:**

```
Weights: w₂ = [0.082, 0.082, 0.122, 0.082, 0.082, 0.082, 0.122, 0.122, 0.122, 0.082]
(More weight on samples 3, 7, 8, 9)

Train stump: h₂(x) = 1 if x < 8.5 else -1

Predictions: h₂ = [1, 1, 1, 1, 1, 1, 1, 1, -1, -1]
True labels: y  = [1, 1, 1, -1, -1, -1, 1, 1, 1, -1]
Mistakes:           ✓  ✓  ✓  ✗  ✗  ✗  ✓  ✓  ✗   ✓

Weighted error: ε₂ = (0.082 + 0.082 + 0.082 + 0.122) / 1.0 ≈ 0.368

Model weight: α₂ ≈ 0.264

... Continue for more rounds
```

**Final Prediction:**
```
H(x) = sign(α₁·h₁(x) + α₂·h₂(x) + α₃·h₃(x) + ...)
     = sign(0.203·h₁(x) + 0.264·h₂(x) + ...)
```

### ASCII Decision Stumps

```
ADABOOST STUMPS EXAMPLE
=======================

Stump 1:           Stump 2:           Stump 3:
  [x < 2.5]         [x < 8.5]         [x < 5.5]
   /    \            /    \            /    \
  +1    -1          +1    -1          -1    +1
(α=0.20)          (α=0.26)          (α=0.31)

Final: Combine all stumps with weights
```

### Implementation

```python
from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import numpy as np
import matplotlib.pyplot as plt

# Generate data
X, y = make_classification(n_samples=1000, n_features=20, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# AdaBoost with decision stumps
ada_clf = AdaBoostClassifier(
    estimator=DecisionTreeClassifier(max_depth=1),  # Decision stump
    n_estimators=50,           # Number of weak learners
    learning_rate=1.0,          # Shrinkage parameter
    algorithm='SAMME.R',        # SAMME.R (real) or SAMME (discrete)
    random_state=42
)

ada_clf.fit(X_train, y_train)

# Predictions
y_pred = ada_clf.predict(X_test)
print("Accuracy:", ada_clf.score(X_test, y_test))

# Estimator weights (αₜ)
print("\nEstimator Weights (first 10):")
print(ada_clf.estimator_weights_[:10])

# Estimator errors (εₜ)
print("\nEstimator Errors (first 10):")
print(ada_clf.estimator_errors_[:10])

# Feature importance
print("\nFeature Importance:")
print(ada_clf.feature_importances_[:5])
```

### Visualizing AdaBoost Learning

```python
# Track performance over iterations
train_scores = []
test_scores = []

for i in range(1, 101):
    ada = AdaBoostClassifier(
        estimator=DecisionTreeClassifier(max_depth=1),
        n_estimators=i,
        learning_rate=1.0,
        random_state=42
    )
    ada.fit(X_train, y_train)
    train_scores.append(ada.score(X_train, y_train))
    test_scores.append(ada.score(X_test, y_test))

# Plot
plt.figure(figsize=(10, 6))
plt.plot(range(1, 101), train_scores, label='Train')
plt.plot(range(1, 101), test_scores, label='Test')
plt.xlabel('Number of Estimators')
plt.ylabel('Accuracy')
plt.title('AdaBoost: Accuracy vs Number of Estimators')
plt.legend()
plt.grid(True)
plt.show()
```

### AdaBoost for Regression

```python
from sklearn.ensemble import AdaBoostRegressor
from sklearn.metrics import mean_squared_error, r2_score

# Generate regression data
X, y = make_regression(n_samples=1000, n_features=20, noise=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# AdaBoost Regressor
ada_reg = AdaBoostRegressor(
    estimator=DecisionTreeRegressor(max_depth=3),
    n_estimators=50,
    learning_rate=1.0,
    loss='linear',  # 'linear', 'square', 'exponential'
    random_state=42
)

ada_reg.fit(X_train, y_train)
y_pred = ada_reg.predict(X_test)

print("R² Score:", r2_score(y_test, y_pred))
print("RMSE:", np.sqrt(mean_squared_error(y_test, y_pred)))
```

---

## Gradient Boosting Intuition

### Core Idea

**Gradient Boosting**: Fit new models to the **residual errors** of the ensemble.

**Key Insight:**
- AdaBoost: Reweights samples
- Gradient Boosting: Fits residuals directly

### Intuitive Example

**Regression Problem:**

```
True values: y = [100, 150, 200, 250, 300]
```

**Round 1: Train first tree**
```
Predictions: ŷ₁ = [90, 140, 210, 240, 310]
Residuals: r₁ = y - ŷ₁ = [10, 10, -10, 10, -10]
```

**Round 2: Train tree to predict residuals**
```
Train on residuals: r₁
Predictions: ŷ₂ = [8, 12, -8, 9, -12]
Updated: ŷ = ŷ₁ + η·ŷ₂ = [98, 152, 202, 249, 298]
New residuals: r₂ = [2, -2, -2, 1, 2]
```

**Round 3: Train tree to predict new residuals**
```
Train on residuals: r₂
Predictions: ŷ₃ = [1.8, -1.9, -2.1, 1.1, 1.9]
Updated: ŷ = ŷ₁ + η·ŷ₂ + η·ŷ₃ = [99.8, 150.1, 199.9, 250.1, 299.9]
```

### ASCII Visualization

```
GRADIENT BOOSTING REGRESSION
=============================

Initial Model (Tree 1):
        [Predict: mean(y)]
         Residuals: r₁

Add Tree 2:
        [Fit to r₁]
         F₂ = F₁ + η·h₂
         Residuals: r₂

Add Tree 3:
        [Fit to r₂]
         F₃ = F₂ + η·h₃
         Residuals: r₃

...

Final Model:
F(x) = F₀ + η·h₁(x) + η·h₂(x) + ... + η·hₜ(x)
```

### Why "Gradient"?

**Fitting residuals = Gradient descent in function space**

Loss function: L(y, F(x))

Residual: -∂L/∂F (negative gradient)

Each tree: Step in direction of negative gradient

Learning rate η: Step size

---

## Gradient Boosting Mathematics

### Algorithm (Regression)

**Objective:** Minimize loss function
```
L(y, F(x)) = Σ loss(yᵢ, F(xᵢ))
```

**Algorithm:**

1. **Initialize** with constant:
```
F₀(x) = argmin_γ Σ loss(yᵢ, γ)

For squared loss: F₀(x) = mean(y)
```

2. **For t = 1 to T:**

   a. **Compute pseudo-residuals:**
   ```
   rᵢₜ = -[∂loss(yᵢ, F(xᵢ))/∂F(xᵢ)]|F=Fₜ₋₁

   For squared loss: rᵢₜ = yᵢ - Fₜ₋₁(xᵢ)
   ```

   b. **Fit tree hₜ to residuals:**
   ```
   hₜ = fit_tree({(xᵢ, rᵢₜ)})
   ```

   c. **For each leaf j, compute optimal value:**
   ```
   γⱼₜ = argmin_γ Σ loss(yᵢ, Fₜ₋₁(xᵢ) + γ)
              xᵢ ∈ Rⱼₜ

   For squared loss: γⱼₜ = mean(rᵢₜ) in leaf j
   ```

   d. **Update model:**
   ```
   Fₜ(x) = Fₜ₋₁(x) + η · hₜ(x)
   ```

3. **Output:**
```
F(x) = F₀(x) + η · Σ hₜ(x)
```

### Loss Functions

**Regression:**

1. **Mean Squared Error (L2):**
```
loss(y, F) = (y - F)²
Residual: r = y - F
```

2. **Mean Absolute Error (L1, Huber):**
```
loss(y, F) = |y - F|
Residual: r = sign(y - F)
```

3. **Huber:**
```
loss(y, F) = {
    0.5(y - F)²        if |y - F| ≤ δ
    δ|y - F| - 0.5δ²   otherwise
}
```

**Classification (Binary):**

**Logistic Loss (Deviance):**
```
loss(y, F) = log(1 + exp(-2yF))    y ∈ {-1, +1}

Residual: r = y / (1 + exp(yF))

Probability: p = 1 / (1 + exp(-2F))
```

**Classification (Multiclass):**

**Multinomial Deviance:**
```
loss(y, F) = -Σ yₖ log(pₖ)

pₖ = exp(Fₖ) / Σ exp(Fⱼ)
```

### Complete Example (Squared Loss)

**Data:**
```
X = [1, 2, 3, 4, 5]
y = [2, 4, 6, 8, 10]
```

**Step 1: Initialize**
```
F₀(x) = mean(y) = 6
```

**Step 2: Iteration 1**

Compute residuals:
```
r₁ = y - F₀ = [2-6, 4-6, 6-6, 8-6, 10-6] = [-4, -2, 0, 2, 4]
```

Fit tree h₁ to predict residuals (simple tree with one split at x=3):
```
h₁(x) = {
    -3  if x ≤ 3
     3  if x > 3
}
```

Update model (η = 0.1):
```
F₁(x) = F₀(x) + 0.1 · h₁(x)
      = 6 + 0.1 · h₁(x)
```

Predictions:
```
F₁([1,2,3,4,5]) = [5.7, 5.7, 5.7, 6.3, 6.3]
```

**Step 3: Iteration 2**

New residuals:
```
r₂ = y - F₁ = [2-5.7, 4-5.7, 6-5.7, 8-6.3, 10-6.3]
            = [-3.7, -1.7, 0.3, 1.7, 3.7]
```

Fit tree h₂ to predict r₂:
```
h₂(x) = {
    -2.6  if x ≤ 3
     2.6  if x > 3
}
```

Update:
```
F₂(x) = F₁(x) + 0.1 · h₂(x)
```

Predictions:
```
F₂([1,2,3,4,5]) = [5.44, 5.44, 5.44, 6.56, 6.56]
```

Continue iterations...

### Regularization in Gradient Boosting

**1. Learning Rate (η):**
```
F(x) = F₀ + η · Σ hₜ(x)

Small η: More iterations needed, better generalization
Large η: Fewer iterations, risk of overfitting

Typical: η ∈ [0.01, 0.3]
```

**2. Subsampling:**
```
Use random subsample of data for each tree

Stochastic Gradient Boosting
Typical: 50-80% of data
```

**3. Tree Complexity:**
```
max_depth: Limit tree depth (3-8 typical)
min_samples_split: Minimum samples for split
min_samples_leaf: Minimum samples in leaf
```

**4. Early Stopping:**
```
Monitor validation error
Stop when it stops improving
```

---

## Gradient Boosting Implementation

### Classification

```python
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
import numpy as np

# Generate data
X, y = make_classification(n_samples=1000, n_features=20, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Gradient Boosting Classifier
gb_clf = GradientBoostingClassifier(
    n_estimators=100,           # Number of boosting stages
    learning_rate=0.1,          # Shrinkage parameter
    max_depth=3,                # Maximum depth of trees
    min_samples_split=20,       # Minimum samples to split
    min_samples_leaf=10,        # Minimum samples in leaf
    subsample=0.8,              # Fraction of samples for each tree
    max_features='sqrt',        # Features to consider for split
    loss='log_loss',            # Loss function (log_loss, exponential)
    random_state=42,
    verbose=0                   # Print progress
)

gb_clf.fit(X_train, y_train)

# Predictions
y_pred = gb_clf.predict(X_test)
y_proba = gb_clf.predict_proba(X_test)[:, 1]

# Evaluation
print("Accuracy:", gb_clf.score(X_test, y_test))
print("AUC:", roc_auc_score(y_test, y_proba))
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Feature importance
feature_importance = gb_clf.feature_importances_
print("\nTop 5 Features:")
print(np.argsort(feature_importance)[::-1][:5])

# Training progress
print("\nTrain Score History (first 10 iterations):")
print(gb_clf.train_score_[:10])
```

### Regression

```python
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.datasets import make_regression
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error

# Generate data
X, y = make_regression(n_samples=1000, n_features=20, noise=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Gradient Boosting Regressor
gb_reg = GradientBoostingRegressor(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=3,
    min_samples_split=20,
    min_samples_leaf=10,
    subsample=0.8,
    max_features='sqrt',
    loss='squared_error',      # 'squared_error', 'absolute_error', 'huber', 'quantile'
    alpha=0.9,                  # For quantile loss
    random_state=42,
    verbose=0
)

gb_reg.fit(X_train, y_train)

# Predictions
y_pred = gb_reg.predict(X_test)

# Evaluation
print("R² Score:", r2_score(y_test, y_pred))
print("RMSE:", np.sqrt(mean_squared_error(y_test, y_pred)))
print("MAE:", mean_absolute_error(y_test, y_pred))

# Staged predictions (predictions at each boosting stage)
staged_preds = list(gb_reg.staged_predict(X_test))
staged_scores = [r2_score(y_test, pred) for pred in staged_preds]

print("\nR² at different stages:")
print(f"Stage 10: {staged_scores[9]:.4f}")
print(f"Stage 50: {staged_scores[49]:.4f}")
print(f"Stage 100: {staged_scores[99]:.4f}")
```

### Early Stopping

```python
from sklearn.ensemble import GradientBoostingClassifier

# Split data into train/validation/test
X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=0.2, random_state=42)

# Train with monitoring
gb_early = GradientBoostingClassifier(
    n_estimators=1000,          # Max iterations
    learning_rate=0.1,
    max_depth=3,
    subsample=0.8,
    validation_fraction=0.2,    # Use 20% for early stopping
    n_iter_no_change=10,        # Stop if no improvement for 10 rounds
    tol=1e-4,                   # Minimum improvement
    random_state=42,
    verbose=1
)

gb_early.fit(X_train, y_train)

print(f"\nBest iteration: {gb_early.n_estimators_}")
print(f"Test Accuracy: {gb_early.score(X_test, y_test):.4f}")
```

### Staged Predictions (Watch Learning Progress)

```python
import matplotlib.pyplot as plt

# Compute scores at each stage
train_scores = []
test_scores = []

for i, (train_pred, test_pred) in enumerate(
    zip(
        gb_clf.staged_predict_proba(X_train),
        gb_clf.staged_predict_proba(X_test)
    )
):
    train_scores.append(roc_auc_score(y_train, train_pred[:, 1]))
    test_scores.append(roc_auc_score(y_test, test_pred[:, 1]))

# Plot
plt.figure(figsize=(10, 6))
plt.plot(train_scores, label='Train AUC')
plt.plot(test_scores, label='Test AUC')
plt.xlabel('Boosting Iteration')
plt.ylabel('AUC')
plt.title('Gradient Boosting: Learning Progress')
plt.legend()
plt.grid(True)
plt.show()

# Find best iteration
best_iter = np.argmax(test_scores)
print(f"Best iteration: {best_iter + 1}")
print(f"Best test AUC: {test_scores[best_iter]:.4f}")
```

### Loss Functions Comparison

```python
# Compare different loss functions for regression
losses = ['squared_error', 'absolute_error', 'huber']
results = {}

for loss in losses:
    gb = GradientBoostingRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=3,
        loss=loss,
        random_state=42
    )
    gb.fit(X_train, y_train)
    y_pred = gb.predict(X_test)

    results[loss] = {
        'RMSE': np.sqrt(mean_squared_error(y_test, y_pred)),
        'MAE': mean_absolute_error(y_test, y_pred),
        'R²': r2_score(y_test, y_pred)
    }

# Display results
import pandas as pd
df_results = pd.DataFrame(results).T
print(df_results)
```

---

## Hyperparameter Tuning

### Key Hyperparameters

```python
# Hyperparameter impact summary
HYPERPARAMETERS = {
    'n_estimators': {
        'description': 'Number of boosting stages',
        'effect': 'More → Better fit (to a point), slower training',
        'typical': '100-1000',
        'tuning': 'Use early stopping to find optimal'
    },
    'learning_rate': {
        'description': 'Shrinkage parameter (η)',
        'effect': 'Lower → Need more trees, better generalization',
        'typical': '0.01-0.3',
        'tuning': 'Lower is better with enough trees'
    },
    'max_depth': {
        'description': 'Maximum depth of trees',
        'effect': 'Higher → More complex, risk overfitting',
        'typical': '3-8',
        'tuning': 'Start with 3, increase if underfitting'
    },
    'min_samples_split': {
        'description': 'Minimum samples to split',
        'effect': 'Higher → Simpler trees, regularization',
        'typical': '10-50',
        'tuning': 'Increase if overfitting'
    },
    'min_samples_leaf': {
        'description': 'Minimum samples in leaf',
        'effect': 'Higher → Smoother predictions',
        'typical': '5-20',
        'tuning': 'Increase for regularization'
    },
    'subsample': {
        'description': 'Fraction of samples per tree',
        'effect': 'Lower → More randomness, faster, regularization',
        'typical': '0.5-1.0',
        'tuning': '0.8 is good default'
    },
    'max_features': {
        'description': 'Features to consider per split',
        'effect': 'Lower → More randomness, decorrelation',
        'typical': "'sqrt', 'log2', None",
        'tuning': 'sqrt for classification, None/3 for regression'
    }
}
```

### Learning Rate vs Number of Estimators

**Tradeoff:**
```
Low learning rate + Many trees = Best generalization, slow
High learning rate + Few trees = Fast, worse generalization

Rule: n_estimators ∝ 1 / learning_rate
```

```python
# Compare learning rate configurations
configs = [
    {'learning_rate': 0.01, 'n_estimators': 1000},
    {'learning_rate': 0.1, 'n_estimators': 100},
    {'learning_rate': 0.3, 'n_estimators': 33}
]

for config in configs:
    gb = GradientBoostingClassifier(**config, max_depth=3, random_state=42)
    gb.fit(X_train, y_train)
    score = gb.score(X_test, y_test)
    print(f"LR={config['learning_rate']}, n_est={config['n_estimators']}: {score:.4f}")
```

### Grid Search

```python
from sklearn.model_selection import GridSearchCV

# Define parameter grid (coarse search first)
param_grid_coarse = {
    'learning_rate': [0.01, 0.1, 0.3],
    'n_estimators': [100, 200],
    'max_depth': [3, 5, 7],
    'subsample': [0.8, 1.0]
}

# Coarse search
grid_search_coarse = GridSearchCV(
    GradientBoostingClassifier(random_state=42),
    param_grid_coarse,
    cv=5,
    scoring='accuracy',
    n_jobs=-1,
    verbose=2
)

grid_search_coarse.fit(X_train, y_train)
print("Best parameters (coarse):", grid_search_coarse.best_params_)

# Fine search around best parameters
best_lr = grid_search_coarse.best_params_['learning_rate']
best_depth = grid_search_coarse.best_params_['max_depth']

param_grid_fine = {
    'learning_rate': [best_lr * 0.5, best_lr, best_lr * 2],
    'n_estimators': [100, 200, 300, 500],
    'max_depth': [best_depth - 1, best_depth, best_depth + 1],
    'min_samples_split': [10, 20, 30],
    'min_samples_leaf': [5, 10, 15]
}

grid_search_fine = GridSearchCV(
    GradientBoostingClassifier(random_state=42),
    param_grid_fine,
    cv=5,
    scoring='accuracy',
    n_jobs=-1
)

grid_search_fine.fit(X_train, y_train)
print("Best parameters (fine):", grid_search_fine.best_params_)
print("Best CV score:", grid_search_fine.best_score_)
print("Test score:", grid_search_fine.score(X_test, y_test))
```

### Manual Tuning Strategy

```python
def tune_gradient_boosting(X_train, y_train, X_val, y_val):
    """
    Systematic hyperparameter tuning
    """
    from sklearn.ensemble import GradientBoostingClassifier

    # Step 1: Fix learning_rate, tune n_estimators with early stopping
    print("Step 1: Tuning n_estimators...")
    gb = GradientBoostingClassifier(
        learning_rate=0.1,
        max_depth=3,
        n_estimators=1000,
        validation_fraction=0.2,
        n_iter_no_change=50,
        random_state=42
    )
    gb.fit(X_train, y_train)
    best_n_estimators = gb.n_estimators_
    print(f"Best n_estimators: {best_n_estimators}")

    # Step 2: Tune tree-specific parameters
    print("\nStep 2: Tuning tree parameters...")
    param_test = {
        'max_depth': [3, 5, 7, 9],
        'min_samples_split': [10, 20, 30, 50]
    }

    grid = GridSearchCV(
        GradientBoostingClassifier(
            learning_rate=0.1,
            n_estimators=best_n_estimators,
            random_state=42
        ),
        param_test,
        cv=5,
        scoring='accuracy'
    )
    grid.fit(X_train, y_train)
    print(f"Best tree params: {grid.best_params_}")

    # Step 3: Tune subsample and max_features
    print("\nStep 3: Tuning subsample and max_features...")
    param_test2 = {
        'subsample': [0.6, 0.7, 0.8, 0.9, 1.0],
        'max_features': ['sqrt', 'log2', None]
    }

    grid2 = GridSearchCV(
        GradientBoostingClassifier(
            learning_rate=0.1,
            n_estimators=best_n_estimators,
            **grid.best_params_,
            random_state=42
        ),
        param_test2,
        cv=5,
        scoring='accuracy'
    )
    grid2.fit(X_train, y_train)
    print(f"Best sampling params: {grid2.best_params_}")

    # Step 4: Lower learning rate, increase n_estimators
    print("\nStep 4: Fine-tuning learning rate...")
    final_model = GradientBoostingClassifier(
        learning_rate=0.01,  # Lower learning rate
        n_estimators=best_n_estimators * 10,  # Proportionally more trees
        **grid.best_params_,
        **grid2.best_params_,
        validation_fraction=0.2,
        n_iter_no_change=50,
        random_state=42
    )
    final_model.fit(X_train, y_train)

    # Evaluate
    train_score = final_model.score(X_train, y_train)
    val_score = final_model.score(X_val, y_val)

    print(f"\nFinal Model:")
    print(f"  Training Accuracy: {train_score:.4f}")
    print(f"  Validation Accuracy: {val_score:.4f}")
    print(f"  Number of estimators used: {final_model.n_estimators_}")

    return final_model

# Usage
# best_model = tune_gradient_boosting(X_train, y_train, X_val, y_val)
```

---

## Practical Tips

### 1. Feature Importance

```python
# Feature importance from gradient boosting
feature_importance = gb_clf.feature_importances_

# Plot
import matplotlib.pyplot as plt
import pandas as pd

# Create DataFrame
importance_df = pd.DataFrame({
    'feature': [f'feature_{i}' for i in range(len(feature_importance))],
    'importance': feature_importance
}).sort_values('importance', ascending=False)

# Plot top 10
plt.figure(figsize=(10, 6))
plt.barh(importance_df['feature'][:10], importance_df['importance'][:10])
plt.xlabel('Importance')
plt.title('Top 10 Feature Importances')
plt.gca().invert_yaxis()
plt.show()

# Cumulative importance
importance_df['cumulative'] = importance_df['importance'].cumsum()
n_features_80 = (importance_df['cumulative'] <= 0.8).sum()
print(f"Features for 80% importance: {n_features_80}")
```

### 2. Partial Dependence Plots

```python
from sklearn.inspection import partial_dependence, PartialDependenceDisplay

# Compute partial dependence
fig, ax = plt.subplots(figsize=(12, 4), ncols=3)
display = PartialDependenceDisplay.from_estimator(
    gb_clf,
    X_train,
    features=[0, 1, 2],  # Top 3 features
    ax=ax
)
plt.suptitle('Partial Dependence Plots')
plt.tight_layout()
plt.show()
```

### 3. Handling Imbalanced Data

```python
# Use sample_weight or class_weight
from sklearn.utils.class_weight import compute_sample_weight

# Compute sample weights
sample_weights = compute_sample_weight('balanced', y_train)

# Train with weights
gb_balanced = GradientBoostingClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=3,
    random_state=42
)

gb_balanced.fit(X_train, y_train, sample_weight=sample_weights)

# Or use scale_pos_weight in XGBoost (covered later)
```

### 4. Memory and Speed Optimization

```python
# Reduce memory usage
gb_small = GradientBoostingClassifier(
    n_estimators=100,
    max_depth=3,           # Shallower trees
    max_features='sqrt',   # Use subset of features
    subsample=0.8,         # Use subset of samples
    max_leaf_nodes=10,     # Limit number of leaves
    random_state=42
)

# For very large datasets, consider:
# - Subsampling
# - Feature selection
# - LightGBM or XGBoost (more memory efficient)
```

### 5. Prediction Uncertainty (for Regression)

```python
# Use quantile loss for prediction intervals
gb_quantile_lower = GradientBoostingRegressor(
    loss='quantile',
    alpha=0.1,  # 10th percentile
    n_estimators=100,
    max_depth=3,
    random_state=42
)

gb_quantile_upper = GradientBoostingRegressor(
    loss='quantile',
    alpha=0.9,  # 90th percentile
    n_estimators=100,
    max_depth=3,
    random_state=42
)

gb_median = GradientBoostingRegressor(
    loss='quantile',
    alpha=0.5,  # Median
    n_estimators=100,
    max_depth=3,
    random_state=42
)

# Train all
gb_quantile_lower.fit(X_train, y_train)
gb_quantile_upper.fit(X_train, y_train)
gb_median.fit(X_train, y_train)

# Predict with intervals
y_lower = gb_quantile_lower.predict(X_test)
y_upper = gb_quantile_upper.predict(X_test)
y_median = gb_median.predict(X_test)

# Visualize
plt.figure(figsize=(10, 6))
plt.scatter(range(len(y_test)), y_test, alpha=0.5, label='True')
plt.plot(y_median, 'r-', label='Median prediction')
plt.fill_between(range(len(y_test)), y_lower, y_upper, alpha=0.3, label='80% interval')
plt.legend()
plt.title('Gradient Boosting Prediction Intervals')
plt.show()
```

---

## Comparison: AdaBoost vs Gradient Boosting

| Aspect | AdaBoost | Gradient Boosting |
|--------|----------|-------------------|
| **Base Learner** | Typically stumps | Typically shallow trees (depth 3-8) |
| **Focus** | Reweight samples | Fit residuals |
| **Loss** | Exponential | Flexible (MSE, log-loss, etc.) |
| **Learning** | Weights samples | Gradient descent in function space |
| **Speed** | Faster (simpler trees) | Slower (deeper trees) |
| **Robustness** | Sensitive to outliers | More robust (choice of loss) |
| **Flexibility** | Less flexible | Very flexible |
| **Use Case** | Simple problems | Complex problems, production |

---

## Summary Checklist

- [ ] Understand boosting concept (sequential learning)
- [ ] Explain AdaBoost algorithm and math
- [ ] Calculate sample weights and model weights in AdaBoost
- [ ] Understand gradient boosting intuition (fitting residuals)
- [ ] Derive gradient boosting for squared loss
- [ ] Know different loss functions (MSE, log-loss, huber)
- [ ] Implement classification and regression with GradientBoostingClassifier/Regressor
- [ ] Tune hyperparameters (learning_rate, n_estimators, max_depth)
- [ ] Use early stopping for optimal n_estimators
- [ ] Interpret feature importance
- [ ] Create partial dependence plots
- [ ] Handle imbalanced data
- [ ] Understand learning_rate vs n_estimators tradeoff

---

**Next:** [XGBoost](./xgboost.md)
