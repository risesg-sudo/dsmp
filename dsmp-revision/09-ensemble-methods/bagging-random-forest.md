# Bagging and Random Forest - Comprehensive Revision Notes

## Table of Contents
1. [Ensemble Methods Overview](#ensemble-methods-overview)
2. [Bagging (Bootstrap Aggregating)](#bagging-bootstrap-aggregating)
3. [Random Forest](#random-forest)
4. [Hyperparameter Tuning](#hyperparameter-tuning)
5. [OOB Score](#oob-score)
6. [Implementation](#implementation)
7. [Comparison with Other Methods](#comparison-with-other-methods)

---

## Ensemble Methods Overview

**Ensemble Learning**: Combining multiple models to improve performance.

### Key Idea
```
Weak Learner + Weak Learner + ... = Strong Learner
```

### Types of Ensemble Methods

```
                    ENSEMBLE METHODS
                    /              \
                BAGGING          BOOSTING
                  |                 |
           Random Forest      AdaBoost, GBM, XGBoost
           (parallel)         (sequential)
```

### Bagging vs Boosting

| Aspect | Bagging | Boosting |
|--------|---------|----------|
| **Training** | Parallel (independent) | Sequential (dependent) |
| **Sampling** | Bootstrap (with replacement) | Weighted sampling |
| **Focus** | Reduce variance | Reduce bias |
| **Voting** | Equal weights | Weighted by performance |
| **Speed** | Fast (parallelizable) | Slower (sequential) |
| **Overfitting** | Less prone | More prone |
| **Use Case** | High variance models (deep trees) | High bias models (shallow trees) |

### ASCII Visualization

**Bagging:**
```
Original Data
     |
     |---- Bootstrap Sample 1 ---> Model 1 ---|
     |                                         |
     |---- Bootstrap Sample 2 ---> Model 2 ---|---> Average/Vote ---> Final Prediction
     |                                         |
     |---- Bootstrap Sample 3 ---> Model 3 ---|
     (parallel training)
```

**Boosting:**
```
Original Data ---> Model 1 ---> Reweight Data ---> Model 2 ---> Reweight Data ---> Model 3 ---> Weighted Vote
                   (focus on easy)  (focus on mistakes)  (focus on hard examples)
                   (sequential training)
```

---

## Bagging (Bootstrap Aggregating)

### Core Concept

**Bagging** = **B**ootstrap **Agg**regat**ing**

1. Create multiple bootstrap samples (sample with replacement)
2. Train separate model on each sample
3. Aggregate predictions (average for regression, vote for classification)

### Algorithm

```
function Bagging(data, n_models):
    models = []

    for i = 1 to n_models:
        # 1. Bootstrap sampling (with replacement)
        bootstrap_sample = sample_with_replacement(data)

        # 2. Train model
        model = train_base_model(bootstrap_sample)
        models.append(model)

    return models

function Predict(X, models):
    predictions = [model.predict(X) for model in models]

    # Aggregate
    if classification:
        return majority_vote(predictions)
    else:
        return average(predictions)
```

### Bootstrap Sampling Example

**Original Data (10 samples):**
```
[A, B, C, D, E, F, G, H, I, J]
```

**Bootstrap Sample 1:**
```
[A, A, C, E, F, F, F, H, I, J]  (some repeated, some missing)
Out-of-Bag: [B, D, G]
```

**Bootstrap Sample 2:**
```
[A, B, B, C, D, D, E, G, I, I]
Out-of-Bag: [F, H, J]
```

**Bootstrap Sample 3:**
```
[B, C, C, D, E, E, F, G, H, J]
Out-of-Bag: [A, I]
```

### Mathematical Foundation

**Probability of being selected:**

In a bootstrap sample of size n:
```
P(sample selected at least once) = 1 - (1 - 1/n)ⁿ
                                  ≈ 1 - 1/e
                                  ≈ 0.632 or 63.2%
```

**Out-of-Bag (OOB) samples:**
```
P(sample NOT selected) ≈ 1/e ≈ 0.368 or 36.8%
```

### Variance Reduction

**Why Bagging Reduces Variance:**

For n independent models with variance σ²:
```
Var(average) = σ² / n
```

For correlated models with correlation ρ:
```
Var(average) = ρσ² + (1-ρ)σ²/n
```

As n → ∞:
```
Var(average) → ρσ²
```

**Key Insight:** Bagging reduces variance most when models are uncorrelated.

### Implementation

```python
from sklearn.ensemble import BaggingClassifier, BaggingRegressor
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

# Generate data
X, y = make_classification(n_samples=1000, n_features=20, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Bagging Classifier
bagging_clf = BaggingClassifier(
    estimator=DecisionTreeClassifier(),  # base estimator
    n_estimators=100,                     # number of models
    max_samples=1.0,                      # samples per bootstrap (fraction or int)
    max_features=1.0,                     # features per bootstrap
    bootstrap=True,                       # use bootstrap sampling
    bootstrap_features=False,             # don't bootstrap features
    oob_score=True,                       # compute OOB score
    n_jobs=-1,                            # parallel training
    random_state=42
)

# Train
bagging_clf.fit(X_train, y_train)

# Evaluate
print("Training Accuracy:", bagging_clf.score(X_train, y_train))
print("Test Accuracy:", bagging_clf.score(X_test, y_test))
print("OOB Score:", bagging_clf.oob_score_)

# Individual predictions
predictions = []
for estimator in bagging_clf.estimators_:
    predictions.append(estimator.predict(X_test[:5]))

print("\nPredictions from first 5 estimators:")
print(np.array(predictions))
print("\nFinal prediction (majority vote):")
print(bagging_clf.predict(X_test[:5]))
```

### Bagging with Different Base Models

```python
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier

# Bagging with Logistic Regression
bagging_lr = BaggingClassifier(LogisticRegression(), n_estimators=50)

# Bagging with SVM
bagging_svm = BaggingClassifier(SVC(), n_estimators=50)

# Bagging with KNN
bagging_knn = BaggingClassifier(KNeighborsClassifier(), n_estimators=50)

# Train and compare
models = [bagging_lr, bagging_svm, bagging_knn]
names = ['Bagging + LR', 'Bagging + SVM', 'Bagging + KNN']

for model, name in zip(models, names):
    model.fit(X_train, y_train)
    print(f"{name}: {model.score(X_test, y_test):.4f}")
```

---

## Random Forest

### Introduction

**Random Forest** = Bagging + Decision Trees + Random Feature Selection

**Key Innovation:** Inject randomness in two ways:
1. Bootstrap sampling (like bagging)
2. Random feature subset at each split

### Algorithm

```
function RandomForest(data, n_trees, max_features):
    trees = []

    for i = 1 to n_trees:
        # 1. Bootstrap sample
        bootstrap_sample = sample_with_replacement(data)

        # 2. Build tree with random feature selection
        tree = build_tree(bootstrap_sample, max_features)
        trees.append(tree)

    return trees

function build_tree(data, max_features):
    if stopping_criterion(data):
        return LeafNode(data)

    # Randomly select subset of features
    features = randomly_select(all_features, max_features)

    # Find best split among selected features only
    best_feature, best_split = find_best_split(data, features)

    left, right = split_data(data, best_feature, best_split)

    left_tree = build_tree(left, max_features)
    right_tree = build_tree(right, max_features)

    return DecisionNode(best_feature, best_split, left_tree, right_tree)
```

### ASCII Visualization

```
RANDOM FOREST
=============

Bootstrap Sample 1     Bootstrap Sample 2     Bootstrap Sample 3
      |                      |                      |
   Tree 1                 Tree 2                 Tree 3
      |                      |                      |
Each split uses        Each split uses        Each split uses
random subset of       random subset of       random subset of
features (e.g., √p)    features (e.g., √p)    features (e.g., √p)
      |                      |                      |
      |----------------------+----------------------|
                            |
                   Aggregate Predictions
                            |
                     Final Prediction
```

### Example: Random Feature Selection

**Total Features:** 10 features [F1, F2, F3, F4, F5, F6, F7, F8, F9, F10]
**max_features:** √10 ≈ 3

**Tree 1, Split 1:** Randomly select [F2, F5, F8] → Best: F5
**Tree 1, Split 2:** Randomly select [F1, F3, F9] → Best: F1
**Tree 2, Split 1:** Randomly select [F3, F6, F7] → Best: F7
**Tree 2, Split 2:** Randomly select [F2, F4, F10] → Best: F2

This decorrelates trees, reducing variance further!

### Why Random Forests Work

**Problem with Bagging:** If one feature is very strong, all trees will use it at the root → high correlation

**Random Forest Solution:** Force trees to consider different features → lower correlation → lower variance

**Variance Reduction:**
```
Regular Bagging:     Var = ρσ² + (1-ρ)σ²/n
Random Forest:       Var = ρ'σ² + (1-ρ')σ²/n   where ρ' < ρ
```

### Key Hyperparameters

#### 1. n_estimators (Number of Trees)

**Effect:** More trees → Better performance (up to a point) → Longer training

```python
# Visualize effect of n_estimators
from sklearn.ensemble import RandomForestClassifier
import matplotlib.pyplot as plt

train_scores = []
test_scores = []
n_trees = range(1, 201, 10)

for n in n_trees:
    rf = RandomForestClassifier(n_estimators=n, random_state=42)
    rf.fit(X_train, y_train)
    train_scores.append(rf.score(X_train, y_train))
    test_scores.append(rf.score(X_test, y_test))

plt.figure(figsize=(10, 6))
plt.plot(n_trees, train_scores, label='Train')
plt.plot(n_trees, test_scores, label='Test')
plt.xlabel('Number of Trees')
plt.ylabel('Accuracy')
plt.legend()
plt.title('Effect of n_estimators')
plt.show()
```

**Rule of Thumb:**
- Start with 100-500
- More is better (but diminishing returns)
- Rarely overfit with more trees
- 1000+ for competitions

#### 2. max_features (Features per Split)

**Options:**
- `None` or `'auto'`: All features (no randomness, just bagging)
- `'sqrt'`: √(n_features) — **DEFAULT for classification**
- `'log2'`: log₂(n_features)
- `int`: Specific number
- `float`: Fraction of features

**Effect:**
- Lower → More randomness → Less correlation → Lower variance (but higher bias)
- Higher → Less randomness → More correlation → Higher variance (but lower bias)

**Guidelines:**
```
Classification: Use 'sqrt' (default)
Regression: Use n_features/3 or 'sqrt'
High-dimensional: Try 'log2'
Correlated features: Use lower values
```

#### 3. max_depth

**Effect:** Controls tree complexity

```
Low max_depth:  Underfitting (high bias)
High max_depth: Overfitting (high variance, but bagging helps)
None:           Nodes expanded until pure (default)
```

**Guidelines:**
```
Start: None (fully grown)
If overfitting: Try 10, 20, 30
Faster training needed: Limit depth
```

#### 4. min_samples_split & min_samples_leaf

**min_samples_split:** Minimum samples to split a node
**min_samples_leaf:** Minimum samples in leaf node

**Effect:**
- Higher → Simpler trees → Less overfitting → Faster training
- Lower → Complex trees → More overfitting → Slower training

**Guidelines:**
```
Default: min_samples_split=2, min_samples_leaf=1
Large dataset: Try 10-50 and 5-20
Small dataset: Keep defaults
```

#### 5. bootstrap & oob_score

**bootstrap:**
- `True`: Use bootstrap sampling (default, recommended)
- `False`: Use all data for each tree (loses bagging benefit)

**oob_score:**
- `True`: Compute out-of-bag score (free validation)
- `False`: Don't compute (default)

#### 6. Other Important Parameters

```python
RandomForestClassifier(
    n_estimators=100,              # More is better
    criterion='gini',              # 'gini' or 'entropy'
    max_depth=None,                # Tree depth limit
    min_samples_split=2,           # Min samples to split
    min_samples_leaf=1,            # Min samples in leaf
    max_features='sqrt',           # Features per split
    max_leaf_nodes=None,           # Limit number of leaves
    bootstrap=True,                # Use bootstrap
    oob_score=False,               # Compute OOB score
    n_jobs=-1,                     # Parallel processing
    random_state=None,             # Reproducibility
    class_weight=None,             # Handle imbalance
    max_samples=None,              # Samples per tree
    warm_start=False,              # Incremental training
    ccp_alpha=0.0                  # Pruning parameter
)
```

---

## OOB Score

### Concept

**Out-of-Bag (OOB) Score**: Free validation estimate using samples not in bootstrap.

**Key Idea:**
- Each sample is "out-of-bag" for ~37% of trees
- Use those trees to predict that sample
- Average across all samples → OOB score

### Algorithm

```
function compute_oob_score(trees, data):
    predictions = [None] * len(data)

    for sample_idx in range(len(data)):
        # Find trees where this sample was OOB
        oob_trees = [tree for tree in trees
                     if sample_idx not in tree.bootstrap_indices]

        # Predict using OOB trees
        oob_predictions = [tree.predict(data[sample_idx])
                          for tree in oob_trees]

        # Aggregate
        predictions[sample_idx] = majority_vote(oob_predictions)

    # Compute accuracy
    oob_score = accuracy(predictions, true_labels)
    return oob_score
```

### ASCII Visualization

```
Sample A:  OOB for Trees [2, 5, 7, 9]     → Predict using these trees
Sample B:  OOB for Trees [1, 3, 6, 8]     → Predict using these trees
Sample C:  OOB for Trees [1, 4, 7, 10]    → Predict using these trees
...

OOB Score = Accuracy of these predictions vs true labels
```

### Implementation

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

# Random Forest with OOB
rf_oob = RandomForestClassifier(
    n_estimators=100,
    oob_score=True,
    random_state=42
)

rf_oob.fit(X_train, y_train)

# Compare OOB score with other estimates
print("OOB Score:", rf_oob.oob_score_)
print("Training Score:", rf_oob.score(X_train, y_train))
print("Test Score:", rf_oob.score(X_test, y_test))
print("CV Score:", cross_val_score(rf_oob, X_train, y_train, cv=5).mean())

# OOB predictions for each sample
oob_predictions = rf_oob.oob_decision_function_  # probabilities
print("\nOOB Prediction Probabilities (first 5 samples):")
print(oob_predictions[:5])
```

### OOB vs Cross-Validation

| Aspect | OOB Score | Cross-Validation |
|--------|-----------|------------------|
| **Cost** | Free (no extra training) | Requires k × training |
| **Accuracy** | Good estimate | Better estimate |
| **When to Use** | Large datasets, many trees | Small datasets, critical |
| **Parallelization** | Built-in | Needs setup |

**Rule of Thumb:**
- Use OOB for quick validation during development
- Use CV for final model evaluation
- OOB ≈ CV score in practice

---

## Implementation

### Basic Random Forest

```python
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.datasets import load_iris, load_boston
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_squared_error
import numpy as np
import pandas as pd

# Classification Example
iris = load_iris()
X, y = iris.data, iris.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train Random Forest
rf_clf = RandomForestClassifier(
    n_estimators=100,
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    max_features='sqrt',
    bootstrap=True,
    oob_score=True,
    n_jobs=-1,
    random_state=42
)

rf_clf.fit(X_train, y_train)

# Predictions
y_pred = rf_clf.predict(X_test)
y_proba = rf_clf.predict_proba(X_test)

# Evaluation
print("Accuracy:", rf_clf.score(X_test, y_test))
print("OOB Score:", rf_clf.oob_score_)
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=iris.target_names))

# Feature Importance
feature_importance = pd.DataFrame({
    'feature': iris.feature_names,
    'importance': rf_clf.feature_importances_
}).sort_values('importance', ascending=False)
print("\nFeature Importance:")
print(feature_importance)

# Probability predictions
print("\nPrediction Probabilities (first 5 samples):")
print(y_proba[:5])
```

### Regression Example

```python
from sklearn.datasets import make_regression
from sklearn.metrics import r2_score, mean_absolute_error

# Generate data
X, y = make_regression(n_samples=1000, n_features=20, noise=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train Random Forest Regressor
rf_reg = RandomForestRegressor(
    n_estimators=100,
    max_depth=None,
    max_features='sqrt',
    bootstrap=True,
    oob_score=True,
    n_jobs=-1,
    random_state=42
)

rf_reg.fit(X_train, y_train)

# Predictions
y_pred = rf_reg.predict(X_test)

# Evaluation
print("R² Score:", r2_score(y_test, y_pred))
print("RMSE:", np.sqrt(mean_squared_error(y_test, y_pred)))
print("MAE:", mean_absolute_error(y_test, y_pred))
print("OOB Score:", rf_reg.oob_score_)

# Prediction intervals (using quantile regression forest)
from sklearn.ensemble import RandomForestQuantileRegressor  # if available
# Or calculate manually using tree predictions
predictions_per_tree = np.array([tree.predict(X_test) for tree in rf_reg.estimators_])
lower_bound = np.percentile(predictions_per_tree, 5, axis=0)
upper_bound = np.percentile(predictions_per_tree, 95, axis=0)
print("\nPrediction Intervals (90%):")
print(pd.DataFrame({
    'prediction': y_pred[:5],
    'lower': lower_bound[:5],
    'upper': upper_bound[:5]
}))
```

---

## Hyperparameter Tuning

### Grid Search

```python
from sklearn.model_selection import GridSearchCV

# Define parameter grid
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [None, 10, 20, 30],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4],
    'max_features': ['sqrt', 'log2', None],
    'bootstrap': [True],
}

# Grid Search
grid_search = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid,
    cv=5,
    scoring='accuracy',
    n_jobs=-1,
    verbose=2
)

grid_search.fit(X_train, y_train)

# Best parameters
print("Best Parameters:", grid_search.best_params_)
print("Best CV Score:", grid_search.best_score_)
print("Test Score:", grid_search.score(X_test, y_test))

# Results DataFrame
results = pd.DataFrame(grid_search.cv_results_)
print("\nTop 5 Configurations:")
print(results[['params', 'mean_test_score', 'std_test_score']].sort_values(
    'mean_test_score', ascending=False
).head())
```

### Randomized Search (Faster)

```python
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import randint, uniform

# Define parameter distributions
param_dist = {
    'n_estimators': randint(50, 500),
    'max_depth': [None] + list(randint(5, 50).rvs(10)),
    'min_samples_split': randint(2, 20),
    'min_samples_leaf': randint(1, 10),
    'max_features': ['sqrt', 'log2', None],
    'max_samples': uniform(0.5, 0.5),  # 0.5 to 1.0
}

# Randomized Search
random_search = RandomizedSearchCV(
    RandomForestClassifier(random_state=42),
    param_dist,
    n_iter=100,  # number of random combinations
    cv=5,
    scoring='accuracy',
    n_jobs=-1,
    random_state=42,
    verbose=2
)

random_search.fit(X_train, y_train)

print("Best Parameters:", random_search.best_params_)
print("Best CV Score:", random_search.best_score_)
```

### Manual Tuning Strategy

```python
# Step 1: Start with defaults, find baseline
rf_baseline = RandomForestClassifier(random_state=42)
rf_baseline.fit(X_train, y_train)
baseline_score = rf_baseline.score(X_test, y_test)
print(f"Baseline: {baseline_score:.4f}")

# Step 2: Tune n_estimators (usually more is better)
scores = []
for n in [10, 50, 100, 200, 500]:
    rf = RandomForestClassifier(n_estimators=n, random_state=42)
    rf.fit(X_train, y_train)
    scores.append(rf.score(X_test, y_test))
    print(f"n_estimators={n}: {scores[-1]:.4f}")

best_n = [10, 50, 100, 200, 500][np.argmax(scores)]

# Step 3: Tune max_features
scores = []
for feat in ['sqrt', 'log2', None, 0.3, 0.5]:
    rf = RandomForestClassifier(n_estimators=best_n, max_features=feat, random_state=42)
    rf.fit(X_train, y_train)
    scores.append(rf.score(X_test, y_test))
    print(f"max_features={feat}: {scores[-1]:.4f}")

best_feat = ['sqrt', 'log2', None, 0.3, 0.5][np.argmax(scores)]

# Step 4: Tune tree complexity
scores = []
for depth in [5, 10, 20, 30, None]:
    rf = RandomForestClassifier(
        n_estimators=best_n,
        max_features=best_feat,
        max_depth=depth,
        random_state=42
    )
    rf.fit(X_train, y_train)
    scores.append(rf.score(X_test, y_test))
    print(f"max_depth={depth}: {scores[-1]:.4f}")

# Final model
final_rf = RandomForestClassifier(
    n_estimators=best_n,
    max_features=best_feat,
    max_depth=[5, 10, 20, 30, None][np.argmax(scores)],
    random_state=42
)
final_rf.fit(X_train, y_train)
print(f"\nFinal Score: {final_rf.score(X_test, y_test):.4f}")
```

### Tuning Guide Summary

```python
# Quick tuning guide
TUNING_GUIDE = {
    'n_estimators': {
        'start': 100,
        'range': [50, 100, 200, 500],
        'note': 'More is better, but diminishing returns. 100-500 usually enough.'
    },
    'max_features': {
        'start': 'sqrt',
        'range': ['sqrt', 'log2', None, 0.3, 0.5],
        'note': 'sqrt for classification, None/3 for regression'
    },
    'max_depth': {
        'start': None,
        'range': [5, 10, 20, 30, None],
        'note': 'None = fully grown. Limit if overfitting or slow.'
    },
    'min_samples_split': {
        'start': 2,
        'range': [2, 5, 10, 20],
        'note': 'Increase if overfitting. 10-50 for large datasets.'
    },
    'min_samples_leaf': {
        'start': 1,
        'range': [1, 2, 5, 10],
        'note': 'Increase for smoother decision boundaries.'
    }
}
```

---

## Comparison with Other Methods

### Random Forest vs Single Decision Tree

```python
from sklearn.tree import DecisionTreeClassifier

# Single Decision Tree
dt = DecisionTreeClassifier(random_state=42)
dt.fit(X_train, y_train)

# Random Forest
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

print("Decision Tree:")
print(f"  Train Accuracy: {dt.score(X_train, y_train):.4f}")
print(f"  Test Accuracy: {dt.score(X_test, y_test):.4f}")
print(f"  Variance: High")

print("\nRandom Forest:")
print(f"  Train Accuracy: {rf.score(X_train, y_train):.4f}")
print(f"  Test Accuracy: {rf.score(X_test, y_test):.4f}")
print(f"  Variance: Low (ensemble averaging)")
```

### Comparison Table

| Model | Variance | Bias | Speed | Interpretability | Accuracy |
|-------|----------|------|-------|------------------|----------|
| **Single Tree** | High | Low | Fast | High | Medium |
| **Bagging** | Medium | Low | Medium | Low | Good |
| **Random Forest** | Low | Low | Medium | Low | Very Good |
| **Boosting** | Low | Very Low | Slow | Very Low | Excellent |

### When to Use What

```
Decision Tree:
✓ Need interpretability
✓ Small dataset
✓ Baseline model
✗ Production accuracy critical

Random Forest:
✓ Tabular data
✓ Don't need interpretability
✓ Reduce variance
✓ Feature importance needed
✗ Very large datasets (consider LightGBM)
✗ Text/image data (consider deep learning)

Boosting (XGBoost/LightGBM):
✓ Kaggle competitions
✓ Maximum accuracy needed
✓ Careful tuning possible
✗ Quick baseline needed
✗ Overfitting concerns
```

---

## Real-World Use Cases

### 1. Kaggle: Titanic Survival Prediction

```python
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# Load Titanic data (example)
# df = pd.read_csv('titanic.csv')

# Feature engineering
def engineer_features(df):
    df = df.copy()

    # Fill missing age with median
    df['Age'].fillna(df['Age'].median(), inplace=True)

    # Fill missing embarked with mode
    df['Embarked'].fillna(df['Embarked'].mode()[0], inplace=True)

    # Create family size
    df['FamilySize'] = df['SibSp'] + df['Parch'] + 1

    # Create is alone
    df['IsAlone'] = (df['FamilySize'] == 1).astype(int)

    # Create title from name
    df['Title'] = df['Name'].str.extract(' ([A-Za-z]+)\.', expand=False)
    df['Title'] = df['Title'].replace(['Lady', 'Countess', 'Capt', 'Col',
                                        'Don', 'Dr', 'Major', 'Rev', 'Sir',
                                        'Jonkheer', 'Dona'], 'Rare')
    df['Title'] = df['Title'].replace('Mlle', 'Miss')
    df['Title'] = df['Title'].replace('Ms', 'Miss')
    df['Title'] = df['Title'].replace('Mme', 'Mrs')

    # Encode categorical
    le = LabelEncoder()
    df['Sex'] = le.fit_transform(df['Sex'])
    df['Embarked'] = le.fit_transform(df['Embarked'])
    df['Title'] = le.fit_transform(df['Title'])

    return df

# Select features
features = ['Pclass', 'Sex', 'Age', 'Fare', 'Embarked',
            'FamilySize', 'IsAlone', 'Title']

# Model
rf_titanic = RandomForestClassifier(
    n_estimators=500,
    max_depth=10,
    min_samples_split=10,
    min_samples_leaf=5,
    max_features='sqrt',
    oob_score=True,
    random_state=42
)

# Train and evaluate
# rf_titanic.fit(X_train[features], y_train)
# print("OOB Score:", rf_titanic.oob_score_)
```

### 2. House Price Prediction

```python
from sklearn.ensemble import RandomForestRegressor

def predict_house_prices(df):
    """
    Random Forest for house price prediction
    """
    # Feature engineering
    df['TotalSF'] = df['TotalBsmtSF'] + df['1stFlrSF'] + df['2ndFlrSF']
    df['TotalBath'] = df['FullBath'] + 0.5 * df['HalfBath']
    df['Age'] = df['YrSold'] - df['YearBuilt']

    # Select numeric features
    numeric_features = df.select_dtypes(include=[np.number]).columns
    X = df[numeric_features].fillna(0)
    y = df['SalePrice']

    # Model
    rf_house = RandomForestRegressor(
        n_estimators=300,
        max_depth=20,
        min_samples_split=20,
        min_samples_leaf=10,
        max_features='sqrt',
        oob_score=True,
        n_jobs=-1,
        random_state=42
    )

    rf_house.fit(X, y)

    # Feature importance
    importance = pd.DataFrame({
        'feature': numeric_features,
        'importance': rf_house.feature_importances_
    }).sort_values('importance', ascending=False)

    return rf_house, importance

# Usage: model, importances = predict_house_prices(df)
```

### 3. Credit Default Prediction

```python
def credit_default_model(X_train, y_train, X_test):
    """
    Imbalanced classification with Random Forest
    """
    from sklearn.ensemble import RandomForestClassifier
    from imblearn.over_sampling import SMOTE

    # Handle imbalance with SMOTE
    smote = SMOTE(random_state=42)
    X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)

    # Model with class weights
    rf_credit = RandomForestClassifier(
        n_estimators=500,
        max_depth=15,
        min_samples_split=50,
        min_samples_leaf=20,
        max_features='sqrt',
        class_weight='balanced',  # Handle remaining imbalance
        oob_score=True,
        n_jobs=-1,
        random_state=42
    )

    rf_credit.fit(X_train_balanced, y_train_balanced)

    # Predict probabilities for threshold tuning
    y_proba = rf_credit.predict_proba(X_test)[:, 1]

    return rf_credit, y_proba

# Tune threshold for precision-recall tradeoff
```

---

## Advanced Techniques

### 1. Feature Selection with Random Forest

```python
from sklearn.feature_selection import SelectFromModel

# Train Random Forest
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

# Select features with importance > threshold
selector = SelectFromModel(rf, threshold='median')
X_train_selected = selector.transform(X_train)
X_test_selected = selector.transform(X_test)

# Get selected features
selected_features = X_train.columns[selector.get_support()]
print("Selected Features:", selected_features.tolist())

# Train new model with selected features
rf_selected = RandomForestClassifier(n_estimators=100, random_state=42)
rf_selected.fit(X_train_selected, y_train)
print("Score with all features:", rf.score(X_test, y_test))
print("Score with selected features:", rf_selected.score(X_test_selected, y_test))
```

### 2. Parallel Training and Prediction

```python
import joblib

# Save model
joblib.dump(rf, 'random_forest_model.pkl')

# Load model
rf_loaded = joblib.load('random_forest_model.pkl')

# Parallel prediction on large dataset
# Already parallelized in sklearn, but for custom:
def parallel_predict(rf, X, n_jobs=-1):
    from joblib import Parallel, delayed

    # Split data
    n_samples = len(X)
    n_jobs = joblib.cpu_count() if n_jobs == -1 else n_jobs
    chunk_size = n_samples // n_jobs

    # Parallel predict
    predictions = Parallel(n_jobs=n_jobs)(
        delayed(rf.predict)(X[i:i+chunk_size])
        for i in range(0, n_samples, chunk_size)
    )

    return np.concatenate(predictions)
```

### 3. Incremental Training (Warm Start)

```python
# Start with 50 trees
rf_incremental = RandomForestClassifier(
    n_estimators=50,
    warm_start=True,  # Keep existing trees
    random_state=42
)
rf_incremental.fit(X_train, y_train)
print("Score with 50 trees:", rf_incremental.score(X_test, y_test))

# Add 50 more trees
rf_incremental.n_estimators = 100
rf_incremental.fit(X_train, y_train)
print("Score with 100 trees:", rf_incremental.score(X_test, y_test))

# Add 100 more trees
rf_incremental.n_estimators = 200
rf_incremental.fit(X_train, y_train)
print("Score with 200 trees:", rf_incremental.score(X_test, y_test))
```

---

## Summary Checklist

- [ ] Understand bootstrap sampling and aggregating
- [ ] Know difference between bagging and boosting
- [ ] Explain Random Forest algorithm
- [ ] Understand random feature selection
- [ ] Know key hyperparameters (n_estimators, max_features, max_depth)
- [ ] Calculate and interpret OOB score
- [ ] Implement classification and regression
- [ ] Perform hyperparameter tuning
- [ ] Extract and visualize feature importance
- [ ] Know when to use Random Forest vs other methods
- [ ] Handle imbalanced data with class_weight
- [ ] Use RandomizedSearchCV for efficient tuning

---

**Next:** [Gradient Boosting](./gradient-boosting.md)
