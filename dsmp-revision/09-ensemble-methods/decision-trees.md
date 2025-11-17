# Decision Trees - Comprehensive Revision Notes

## Table of Contents
1. [Introduction](#introduction)
2. [CART Algorithm](#cart-algorithm)
3. [Splitting Criteria](#splitting-criteria)
4. [Overfitting and Pruning](#overfitting-and-pruning)
5. [Feature Importance](#feature-importance)
6. [Implementation](#implementation)
7. [Advantages and Disadvantages](#advantages-and-disadvantages)

---

## Introduction

**Decision Trees** are non-parametric supervised learning algorithms used for classification and regression. They learn simple decision rules from data features to predict the target value.

### Key Concepts
- **Root Node**: Starting point with all data
- **Internal Nodes**: Decision points (features)
- **Leaf Nodes**: Final predictions
- **Branches**: Outcomes of decisions
- **Depth**: Longest path from root to leaf

### ASCII Tree Example
```
                [Age <= 30?]                    ROOT NODE
                /          \
              YES           NO
              /              \
        [Income <= 50k?]   [Married?]          INTERNAL NODES
         /          \       /        \
       YES          NO    YES        NO
       /            \     /          \
  [Buy: No]    [Buy: Yes] [Buy: Yes] [Buy: No] LEAF NODES
```

---

## CART Algorithm

**CART (Classification And Regression Trees)** is the most popular algorithm for building decision trees.

### Algorithm Steps

1. **Start** with all training data at root
2. **Select** best feature and split point using splitting criterion
3. **Split** data into two subsets based on condition
4. **Repeat** recursively for each subset
5. **Stop** when stopping criterion is met
6. **Assign** class label (classification) or mean value (regression) to leaf

### Pseudocode
```
function BuildTree(data, features):
    if StoppingCriterion(data):
        return LeafNode(data)

    best_feature, best_split = FindBestSplit(data, features)

    left_data = data where feature <= split
    right_data = data where feature > split

    left_tree = BuildTree(left_data, features)
    right_tree = BuildTree(right_data, features)

    return DecisionNode(best_feature, best_split, left_tree, right_tree)
```

### Stopping Criteria
- Maximum depth reached
- Minimum samples per node
- Minimum samples per leaf
- No information gain
- All samples have same label

---

## Splitting Criteria

### 1. Gini Impurity (Classification)

**Formula:**
```
Gini(D) = 1 - Σ(pᵢ)²
```
where pᵢ is the probability of class i in dataset D

**Interpretation:**
- Gini = 0: Pure node (all same class)
- Gini = 0.5: Maximum impurity (binary, 50-50 split)
- Lower is better

**Example Calculation:**

Given dataset with 100 samples: 40 Class A, 60 Class B

```
Gini = 1 - (0.4² + 0.6²)
     = 1 - (0.16 + 0.36)
     = 1 - 0.52
     = 0.48
```

**For a Split:**
```
Gini_split = (n_left/n_total) × Gini(left) + (n_right/n_total) × Gini(right)
```

**Complete Example:**

Before split: [40 A, 60 B] → Gini = 0.48

Split by Age <= 30:
- Left: [30 A, 20 B] → Gini = 1 - (0.6² + 0.4²) = 0.48
- Right: [10 A, 40 B] → Gini = 1 - (0.2² + 0.8²) = 0.32

```
Gini_split = (50/100) × 0.48 + (50/100) × 0.32 = 0.40
Information Gain = 0.48 - 0.40 = 0.08
```

### 2. Entropy and Information Gain (Classification)

**Entropy Formula:**
```
H(D) = -Σ pᵢ × log₂(pᵢ)
```

**Interpretation:**
- H = 0: Pure node
- H = 1: Maximum entropy (binary, 50-50 split)
- Lower is better

**Example Calculation:**

Dataset: [40 A, 60 B]

```
H = -(0.4 × log₂(0.4) + 0.6 × log₂(0.6))
  = -(0.4 × (-1.32) + 0.6 × (-0.74))
  = -(-0.528 - 0.444)
  = 0.972
```

**Information Gain:**
```
IG = H(parent) - Σ (nᵢ/n) × H(childᵢ)
```

**Complete Example:**

Before split: [40 A, 60 B] → H = 0.972

Split by Age <= 30:
- Left: [30 A, 20 B] → H = 0.971
- Right: [10 A, 40 B] → H = 0.722

```
IG = 0.972 - [(50/100) × 0.971 + (50/100) × 0.722]
   = 0.972 - 0.847
   = 0.125
```

### 3. Variance Reduction (Regression)

**Formula:**
```
Variance(D) = (1/n) × Σ(yᵢ - ȳ)²
```

**Variance Reduction:**
```
VR = Var(parent) - [Σ (nᵢ/n) × Var(childᵢ)]
```

**Example:**

Dataset: [2, 4, 6, 8, 10]
Mean = 6, Variance = 8

Split at x <= 5:
- Left: [2, 4] → Mean = 3, Var = 1
- Right: [6, 8, 10] → Mean = 8, Var = 2.67

```
VR = 8 - [(2/5) × 1 + (3/5) × 2.67]
   = 8 - [0.4 + 1.6]
   = 8 - 2.0
   = 6.0
```

### Comparison: Gini vs Entropy

| Aspect | Gini Impurity | Entropy |
|--------|---------------|---------|
| **Computation** | Faster (no log) | Slower (logarithm) |
| **Range** | [0, 0.5] (binary) | [0, 1] (binary) |
| **Sensitivity** | Isolates most frequent class | Produces balanced trees |
| **Default** | sklearn default | C4.5, ID3 default |
| **Performance** | Usually similar results | Usually similar results |

---

## Overfitting and Pruning

### Overfitting in Decision Trees

**Problem:** Decision trees can grow very deep, memorizing training data instead of learning patterns.

**ASCII Visualization:**
```
OVERFITTED TREE:                    PRUNED TREE:
      [Feature 1]                      [Feature 1]
      /          \                     /          \
[Feature 2]   [Feature 3]       [Feature 2]    [Predict: B]
  /      \       /      \           /      \
[F4]    [F5]   [F6]    [F7]    [Pred: A] [Pred: A]
 /\      /\     /\      /\
[..][..][..][..]....  [..] Too complex!  Much simpler!
```

### Pre-Pruning (Early Stopping)

Stop tree growth before it becomes too complex.

**Parameters:**

1. **max_depth**: Maximum tree depth
   - Too high: Overfitting
   - Too low: Underfitting
   - Typical: 3-10

2. **min_samples_split**: Minimum samples to split node
   - Default: 2
   - Typical: 10-50 for large datasets

3. **min_samples_leaf**: Minimum samples in leaf
   - Prevents tiny leaves
   - Typical: 5-20

4. **max_features**: Features to consider per split
   - None: All features
   - sqrt: √(n_features)
   - log2: log₂(n_features)

5. **max_leaf_nodes**: Maximum number of leaves
   - Limits tree size directly

### Post-Pruning (Cost Complexity Pruning)

Grow full tree, then prune back.

**Cost Complexity Formula:**
```
R_α(T) = R(T) + α × |T|
```
where:
- R(T): Error on tree T
- |T|: Number of leaf nodes
- α: Complexity parameter (tuned via CV)

**Algorithm:**
1. Grow full tree
2. For each α, find subtree that minimizes R_α(T)
3. Use cross-validation to select best α
4. Prune using selected α

**Code Example:**
```python
from sklearn.tree import DecisionTreeClassifier

# Get α path
path = clf.cost_complexity_pruning_path(X_train, y_train)
ccp_alphas = path.ccp_alphas

# Train for each α
clfs = []
for ccp_alpha in ccp_alphas:
    clf = DecisionTreeClassifier(ccp_alpha=ccp_alpha)
    clf.fit(X_train, y_train)
    clfs.append(clf)

# Select best α via validation
scores = [clf.score(X_val, y_val) for clf in clfs]
best_clf = clfs[np.argmax(scores)]
```

### Pruning Example

**Before Pruning:**
```
Training Accuracy: 100%
Validation Accuracy: 70%
Tree Depth: 20
Number of Nodes: 1000
```

**After Pruning (α = 0.01):**
```
Training Accuracy: 85%
Validation Accuracy: 82%
Tree Depth: 7
Number of Nodes: 63
```

---

## Feature Importance

### Calculation Method

**For each feature:**
1. Sum all information gains where feature is used
2. Weight by number of samples at that node
3. Normalize to sum to 1

**Formula:**
```
importance(feature) = Σ (n_node / n_total) × Δimpurity
```
where:
- n_node: samples at node
- n_total: total samples
- Δimpurity: impurity reduction at that split

### Interpretation

- Values sum to 1.0
- Higher = more important
- 0 = feature not used

### Example Calculation

**Tree Structure:**
```
              [Feature A: n=1000]
              Δimpurity = 0.2
              /                \
    [Feature B: n=400]    [Feature C: n=600]
    Δimpurity = 0.1       Δimpurity = 0.15
```

**Importance:**
```
Feature A: (1000/1000) × 0.2 = 0.20
Feature B: (400/1000) × 0.1 = 0.04
Feature C: (600/1000) × 0.15 = 0.09

Normalized:
Feature A: 0.20 / 0.33 = 0.606
Feature B: 0.04 / 0.33 = 0.121
Feature C: 0.09 / 0.33 = 0.273
```

---

## Implementation

### Classification Example

```python
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from sklearn import tree
import matplotlib.pyplot as plt

# Load data
from sklearn.datasets import load_iris
iris = load_iris()
X, y = iris.data, iris.target

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train Decision Tree
clf = DecisionTreeClassifier(
    criterion='gini',           # or 'entropy'
    max_depth=3,                # prevent overfitting
    min_samples_split=10,       # minimum samples to split
    min_samples_leaf=5,         # minimum samples in leaf
    random_state=42
)

clf.fit(X_train, y_train)

# Predictions
y_pred = clf.predict(X_test)

# Evaluation
print("Accuracy:", clf.score(X_test, y_test))
print("\nClassification Report:")
print(classification_report(y_test, y_pred))
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# Feature Importance
feature_importance = pd.DataFrame({
    'feature': iris.feature_names,
    'importance': clf.feature_importances_
}).sort_values('importance', ascending=False)
print("\nFeature Importance:")
print(feature_importance)

# Visualize tree
plt.figure(figsize=(20, 10))
tree.plot_tree(
    clf,
    feature_names=iris.feature_names,
    class_names=iris.target_names,
    filled=True,
    rounded=True,
    fontsize=10
)
plt.savefig('decision_tree.png', dpi=300, bbox_inches='tight')
plt.close()

# Export tree as text
text_representation = tree.export_text(clf, feature_names=iris.feature_names)
print("\nTree Structure:")
print(text_representation)
```

### Regression Example

```python
from sklearn.tree import DecisionTreeRegressor
from sklearn.datasets import make_regression
from sklearn.metrics import mean_squared_error, r2_score

# Generate data
X, y = make_regression(n_samples=1000, n_features=10, noise=20, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train model
reg = DecisionTreeRegressor(
    max_depth=5,
    min_samples_split=20,
    min_samples_leaf=10
)

reg.fit(X_train, y_train)

# Predictions
y_pred = reg.predict(X_test)

# Evaluation
print("R² Score:", r2_score(y_test, y_pred))
print("RMSE:", np.sqrt(mean_squared_error(y_test, y_pred)))

# Feature Importance
importances = pd.DataFrame({
    'feature': [f'feature_{i}' for i in range(X.shape[1])],
    'importance': reg.feature_importances_
}).sort_values('importance', ascending=False)
print("\nTop 5 Features:")
print(importances.head())
```

### Cross-Validation for Hyperparameter Tuning

```python
from sklearn.model_selection import GridSearchCV

# Define parameter grid
param_grid = {
    'max_depth': [3, 5, 7, 10, None],
    'min_samples_split': [2, 5, 10, 20],
    'min_samples_leaf': [1, 2, 5, 10],
    'criterion': ['gini', 'entropy']
}

# Grid search
grid_search = GridSearchCV(
    DecisionTreeClassifier(random_state=42),
    param_grid,
    cv=5,
    scoring='accuracy',
    n_jobs=-1
)

grid_search.fit(X_train, y_train)

# Best parameters
print("Best Parameters:", grid_search.best_params_)
print("Best CV Score:", grid_search.best_score_)

# Test best model
best_clf = grid_search.best_estimator_
print("Test Accuracy:", best_clf.score(X_test, y_test))
```

### Cost Complexity Pruning

```python
# Get pruning path
path = clf.cost_complexity_pruning_path(X_train, y_train)
ccp_alphas, impurities = path.ccp_alphas, path.impurities

# Train tree for each alpha
clfs = []
for ccp_alpha in ccp_alphas:
    clf = DecisionTreeClassifier(ccp_alpha=ccp_alpha, random_state=42)
    clf.fit(X_train, y_train)
    clfs.append(clf)

# Plot metrics
train_scores = [clf.score(X_train, y_train) for clf in clfs]
test_scores = [clf.score(X_test, y_test) for clf in clfs]

fig, ax = plt.subplots(figsize=(10, 6))
ax.plot(ccp_alphas, train_scores, marker='o', label="train", drawstyle="steps-post")
ax.plot(ccp_alphas, test_scores, marker='o', label="test", drawstyle="steps-post")
ax.set_xlabel("alpha")
ax.set_ylabel("accuracy")
ax.set_title("Accuracy vs alpha for training and testing sets")
ax.legend()
plt.show()

# Select best alpha
best_alpha = ccp_alphas[np.argmax(test_scores)]
print(f"Best alpha: {best_alpha}")
```

### Visualizing Decision Boundaries

```python
def plot_decision_boundary(clf, X, y, title):
    """Plot decision boundary for 2D data"""
    h = 0.02  # step size

    # Create mesh
    x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
    y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1
    xx, yy = np.meshgrid(
        np.arange(x_min, x_max, h),
        np.arange(y_min, y_max, h)
    )

    # Predict
    Z = clf.predict(np.c_[xx.ravel(), yy.ravel()])
    Z = Z.reshape(xx.shape)

    # Plot
    plt.figure(figsize=(10, 8))
    plt.contourf(xx, yy, Z, alpha=0.4)
    plt.scatter(X[:, 0], X[:, 1], c=y, alpha=0.8, edgecolors='black')
    plt.xlabel('Feature 1')
    plt.ylabel('Feature 2')
    plt.title(title)
    plt.colorbar()
    plt.show()

# Use first 2 features for visualization
X_2d = iris.data[:, :2]
clf_2d = DecisionTreeClassifier(max_depth=3)
clf_2d.fit(X_2d, iris.target)
plot_decision_boundary(clf_2d, X_2d, iris.target, "Decision Tree Boundaries")
```

---

## Advantages and Disadvantages

### Advantages ✓

1. **Easy to Understand and Interpret**
   - Visual representation
   - Non-technical explanation possible
   - White-box model

2. **No Feature Scaling Required**
   - Works with different scales
   - No normalization needed

3. **Handles Mixed Data Types**
   - Numerical and categorical
   - No encoding needed for tree

4. **Non-Linear Relationships**
   - Captures complex patterns
   - No linearity assumption

5. **Feature Importance**
   - Automatic feature selection
   - Identifies important variables

6. **Fast Predictions**
   - O(log n) prediction time
   - Efficient for deployment

7. **Handles Missing Values** (some implementations)
   - Can work with incomplete data

### Disadvantages ✗

1. **Overfitting**
   - Easily memorizes training data
   - Requires careful tuning

2. **Instability**
   - Small data changes → different tree
   - High variance

3. **Biased with Imbalanced Data**
   - Favors majority class
   - Needs balancing techniques

4. **Not Optimal**
   - Greedy algorithm
   - Local optimum, not global

5. **Axis-Aligned Splits**
   - Can't learn diagonal boundaries
   - Many splits for simple diagonal line

6. **Extrapolation Issues**
   - Can't predict beyond training range
   - Steps in predictions (regression)

### When to Use Decision Trees

**Good For:**
- Interpretability is crucial
- Mixed data types
- Feature interactions
- Non-linear relationships
- Quick baseline model

**Not Good For:**
- High-dimensional sparse data
- Need for smooth predictions
- When stability is critical
- Small datasets (prone to overfit)

**Better Alternatives:**
- Ensemble methods (Random Forest, XGBoost) → Better accuracy
- Linear models → When interpretability + simplicity needed
- Neural Networks → Complex non-linear patterns

---

## Common Pitfalls and Best Practices

### Pitfalls

1. **Not Limiting Tree Depth**
   ```python
   # BAD: Will overfit
   clf = DecisionTreeClassifier()

   # GOOD: Limit depth
   clf = DecisionTreeClassifier(max_depth=5)
   ```

2. **Ignoring Class Imbalance**
   ```python
   # GOOD: Use class weights
   clf = DecisionTreeClassifier(class_weight='balanced')
   ```

3. **Not Validating**
   ```python
   # BAD: Testing on training data
   accuracy = clf.score(X_train, y_train)

   # GOOD: Use separate test set or CV
   accuracy = cross_val_score(clf, X, y, cv=5).mean()
   ```

### Best Practices

1. **Always Use Cross-Validation**
   ```python
   from sklearn.model_selection import cross_val_score
   scores = cross_val_score(clf, X, y, cv=5)
   print(f"Accuracy: {scores.mean():.3f} (+/- {scores.std():.3f})")
   ```

2. **Tune Hyperparameters**
   ```python
   # Use GridSearchCV or RandomizedSearchCV
   param_grid = {
       'max_depth': [3, 5, 7, 10],
       'min_samples_split': [2, 5, 10],
       'min_samples_leaf': [1, 2, 5]
   }
   grid_search = GridSearchCV(clf, param_grid, cv=5)
   ```

3. **Check Feature Importance**
   ```python
   # Remove unimportant features
   importances = clf.feature_importances_
   important_features = X.columns[importances > 0.01]
   ```

4. **Visualize the Tree**
   ```python
   # Always visualize to check if it makes sense
   tree.plot_tree(clf, filled=True)
   ```

---

## Quick Reference Card

### Key Formulas

```
Gini Impurity:        Gini(D) = 1 - Σ(pᵢ)²
Entropy:              H(D) = -Σ pᵢ × log₂(pᵢ)
Information Gain:     IG = H(parent) - Σ (nᵢ/n) × H(childᵢ)
Variance:             Var(D) = (1/n) × Σ(yᵢ - ȳ)²
Feature Importance:   imp(f) = Σ (n_node/n_total) × Δimpurity
Cost Complexity:      R_α(T) = R(T) + α × |T|
```

### Key Parameters

```python
DecisionTreeClassifier(
    criterion='gini',              # 'gini' or 'entropy'
    max_depth=None,                # int or None
    min_samples_split=2,           # int or float
    min_samples_leaf=1,            # int or float
    max_features=None,             # int, float, 'sqrt', 'log2', None
    max_leaf_nodes=None,           # int or None
    class_weight=None,             # dict, 'balanced', None
    ccp_alpha=0.0,                 # float >= 0
    random_state=None              # int or None
)
```

### Typical Workflow

```python
# 1. Load and split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# 2. Create and train model
clf = DecisionTreeClassifier(max_depth=5, min_samples_leaf=10)
clf.fit(X_train, y_train)

# 3. Predict and evaluate
y_pred = clf.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))

# 4. Check feature importance
print(clf.feature_importances_)

# 5. Visualize
tree.plot_tree(clf, filled=True)
```

---

## Interview Questions

### Q1: Explain the difference between Gini impurity and Entropy.

**Answer:**
Both measure node impurity for classification trees:
- **Gini**: Probability of misclassification. Faster to compute (no log).
- **Entropy**: Information content. More sensitive to class distribution.

Mathematically:
- Gini: 1 - Σ(pᵢ)²
- Entropy: -Σ pᵢ × log₂(pᵢ)

In practice, they give similar results. Gini is default in sklearn because it's faster.

### Q2: How do you prevent overfitting in decision trees?

**Answer:**
1. **Pre-pruning**: Limit max_depth, min_samples_split, min_samples_leaf
2. **Post-pruning**: Cost complexity pruning (ccp_alpha)
3. **Validation**: Cross-validation to tune parameters
4. **Ensemble methods**: Random Forest, boosting

### Q3: Can decision trees handle missing values?

**Answer:**
- sklearn: No, requires imputation
- XGBoost: Yes, learns best direction for missing values
- LightGBM: Yes, treats missing as separate category
- Alternative: Surrogate splits (not in sklearn)

### Q4: Why are decision trees unstable?

**Answer:**
Small changes in data can produce very different trees (high variance). This is because:
- Greedy algorithm: Each split depends on previous
- No global optimization
- Hierarchical structure amplifies early mistakes

Solution: Use ensemble methods (bagging, boosting)

### Q5: What are axis-aligned splits?

**Answer:**
Decision trees split perpendicular to feature axes (x <= threshold). They can't learn diagonal boundaries efficiently.

Example: XOR problem needs many splits, while a diagonal line would solve it.

---

## Summary Checklist

- [ ] Understand CART algorithm
- [ ] Calculate Gini impurity and Entropy
- [ ] Explain Information Gain
- [ ] Know stopping criteria
- [ ] Understand pre-pruning vs post-pruning
- [ ] Calculate feature importance
- [ ] Implement classification and regression trees
- [ ] Tune hyperparameters using GridSearchCV
- [ ] Visualize tree structure
- [ ] Know advantages and disadvantages
- [ ] Understand when to use decision trees vs other models

---

**Next:** [Bagging and Random Forest](./bagging-random-forest.md)
