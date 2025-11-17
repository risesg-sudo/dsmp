# Feature Importance Techniques

## What You'll Learn

Discover how to quantify which features matter most to your machine learning models. This guide explores two powerful techniques for measuring feature importance: tree-based feature importance built into models like Random Forest, and permutation importance that works with any model. You'll learn when to use each technique, how to interpret their results, and how to avoid common pitfalls that can lead to misleading conclusions.

---

## Feature Importance in Tree-Based Models

### Concept

**Tree-Based Feature Importance:** Measures how much each feature decreases impurity (Gini or entropy) across all splits in decision trees.

**How It Works:**

```
For each feature:
  1. Calculate total decrease in impurity (Gini/entropy)
     when splitting on this feature
  2. Average across all trees (for Random Forest)
  3. Normalize to sum to 1

Example:
  Total impurity reduction from "age" splits: 0.45
  Total impurity reduction from all features: 1.00
  Feature importance for "age": 0.45
```

**Available in:**
- Decision Trees
- Random Forest
- Gradient Boosting (XGBoost, LightGBM, CatBoost)

### Implementation

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_breast_cancer
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load data
data = load_breast_cancer()
X, y = data.data, data.target
feature_names = data.feature_names

# Train model
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X, y)

# Get feature importance
importance = pd.DataFrame({
    'feature': feature_names,
    'importance': rf.feature_importances_
}).sort_values('importance', ascending=False)

print(importance.head(10))

# Visualize
plt.figure(figsize=(10, 6))
sns.barplot(x='importance', y='feature', data=importance.head(10))
plt.title('Top 10 Feature Importances')
plt.xlabel('Importance')
plt.tight_layout()
plt.savefig('feature_importance.png')
```

### Interpretation

The importance values tell you:
- **Relative contribution:** Features with higher values contribute more to predictions
- **Not direction:** Doesn't tell you if feature increases or decreases prediction
- **Average across dataset:** Overall importance, not for specific predictions

### Advantages and Limitations

| Pros | Cons |
|------|------|
| Fast computation | Biased toward high-cardinality features |
| Built into tree models | Only for tree-based models |
| Easy to interpret | Can be misleading with correlated features |
| Shows global importance | Doesn't show direction of effect |
| No additional computation needed | May inflate importance of continuous features |

### When to Use

**Use Tree-Based Feature Importance When:**
- You're using tree-based models (Random Forest, XGBoost)
- You need quick insights during development
- You want a first-pass understanding
- Features are relatively independent

**Avoid When:**
- Features are highly correlated
- You need model-agnostic approach
- You require precise importance values
- You need to understand feature effects

---

## Permutation Importance

### Concept

**Permutation Importance:** Measures how much model performance decreases when a feature's values are randomly shuffled.

**Intuition:** If a feature is important, shuffling it should hurt model performance. If it's not important, shuffling won't matter.

### Algorithm

```
1. Train model on original data → Baseline score
2. For each feature:
   a. Randomly shuffle feature values
   b. Make predictions → Get score
   c. Importance = Baseline score - Shuffled score
3. Repeat multiple times and average
```

**Visual Example:**

```
Original Data:
Feature 1: [1, 2, 3, 4, 5]  ← Important feature
Feature 2: [a, b, c, d, e]
Target:    [0, 0, 1, 1, 1]
Accuracy: 90%

After Shuffling Feature 1:
Feature 1: [3, 1, 5, 2, 4]  ← Randomized!
Feature 2: [a, b, c, d, e]
Target:    [0, 0, 1, 1, 1]
Accuracy: 60%  ← Dropped significantly!

Importance of Feature 1 = 90% - 60% = 30%

After Shuffling Feature 2:
Feature 1: [1, 2, 3, 4, 5]
Feature 2: [c, e, a, b, d]  ← Randomized!
Target:    [0, 0, 1, 1, 1]
Accuracy: 88%  ← Barely changed

Importance of Feature 2 = 90% - 88% = 2%
```

### Implementation

```python
from sklearn.inspection import permutation_importance
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_breast_cancer
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Load data
data = load_breast_cancer()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
rf = RandomForestClassifier(random_state=42)
rf.fit(X_train, y_train)

# Calculate permutation importance
perm_importance = permutation_importance(
    rf, X_test, y_test,
    n_repeats=10,  # Number of times to shuffle
    random_state=42,
    n_jobs=-1
)

# Create dataframe
importance_df = pd.DataFrame({
    'feature': data.feature_names,
    'importance_mean': perm_importance.importances_mean,
    'importance_std': perm_importance.importances_std
}).sort_values('importance_mean', ascending=False)

print(importance_df.head(10))

# Visualize with error bars
top_features = importance_df.head(10)
plt.figure(figsize=(10, 6))
plt.barh(top_features['feature'], top_features['importance_mean'])
plt.xerr(top_features['importance_std'], fmt='o', color='red')
plt.xlabel('Permutation Importance')
plt.title('Top 10 Features by Permutation Importance')
plt.tight_layout()
plt.savefig('permutation_importance.png')
```

### Understanding the Results

**Importance Mean:** Average decrease in performance across shuffles
**Importance Std:** Variability in importance (high std = unstable)

```python
# Example output
     feature                importance_mean  importance_std
0    worst concave points   0.0523          0.0031
1    worst perimeter        0.0487          0.0029
2    mean concave points    0.0392          0.0024
3    worst radius           0.0301          0.0019
```

**Interpretation:**
- "worst concave points" is most important
- Shuffling it decreases accuracy by ~5.2%
- Low std (0.0031) means importance is stable

### Advantages and Limitations

| Pros | Cons |
|------|------|
| Model-agnostic (works with any model) | Computationally expensive |
| Accounts for feature interactions | Can be unstable with small datasets |
| Not biased by feature cardinality | Requires fitted model and test data |
| Shows actual impact on performance | Can be affected by correlated features |
| Provides uncertainty estimates (std) | Results may vary between runs |

### When to Use

**Use Permutation Importance When:**
- You need model-agnostic importance
- You want to verify tree-based importance
- You're using non-tree models (neural networks, linear models)
- You need reliable global importance

**Avoid When:**
- Dataset is very small
- Features are highly correlated
- Computational resources are limited
- You need real-time explanations

---

## Comparing Both Techniques

### Side-by-Side Comparison

```python
# Get both importances
tree_importance = rf.feature_importances_
perm_importance = permutation_importance(rf, X_test, y_test, n_repeats=10)

# Compare
comparison = pd.DataFrame({
    'feature': data.feature_names,
    'tree_importance': tree_importance,
    'perm_importance': perm_importance.importances_mean
}).sort_values('perm_importance', ascending=False)

print(comparison.head(10))

# Visualize comparison
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

top_10 = comparison.head(10)

ax1.barh(top_10['feature'], top_10['tree_importance'])
ax1.set_xlabel('Tree-based Importance')
ax1.set_title('Feature Importance (Built-in)')

ax2.barh(top_10['feature'], top_10['perm_importance'])
ax2.set_xlabel('Permutation Importance')
ax2.set_title('Permutation Importance')

plt.tight_layout()
plt.savefig('importance_comparison.png')
```

### When Results Disagree

If tree-based and permutation importance give different rankings:

1. **Correlated features:** Tree-based may split importance between correlated features
2. **High cardinality:** Tree-based may overvalue features with many unique values
3. **Overfitting:** Tree-based uses training data, permutation uses test data

**Resolution:** Trust permutation importance more for reliable global importance.

---

## Best Practices

### Feature Importance Workflow

```python
# Step 1: Quick check with tree-based importance
tree_imp = model.feature_importances_
print("Quick tree-based importance:")
print(pd.DataFrame({
    'feature': feature_names,
    'importance': tree_imp
}).sort_values('importance', ascending=False).head(10))

# Step 2: Verify with permutation importance
perm_imp = permutation_importance(model, X_test, y_test, n_repeats=10)
print("\nVerified permutation importance:")
print(pd.DataFrame({
    'feature': feature_names,
    'importance': perm_imp.importances_mean,
    'std': perm_imp.importances_std
}).sort_values('importance', ascending=False).head(10))

# Step 3: Compare results
# If they largely agree → Confident in results
# If they disagree → Investigate further
```

### Common Pitfalls

1. **Over-interpreting small differences**
   - Features with similar importance are roughly equally important
   - Don't obsess over 0.23 vs 0.22

2. **Ignoring feature interactions**
   - Features might be important together
   - Individual importance doesn't capture this

3. **Confusing correlation with causation**
   - High importance doesn't mean causal relationship
   - Could be proxy for true cause

4. **Not validating with domain experts**
   - Statistical importance should make business sense
   - If results seem wrong, investigate

---

## Quick Reference

### Decision Matrix

| Scenario | Use This |
|----------|----------|
| Quick exploration | Tree-based importance |
| Final validation | Permutation importance |
| Non-tree model | Permutation importance |
| Need speed | Tree-based importance |
| Need accuracy | Permutation importance |
| Correlated features | Permutation importance |

### Code Cheat Sheet

```python
# Tree-based (fast)
importance = model.feature_importances_

# Permutation (accurate)
from sklearn.inspection import permutation_importance
perm = permutation_importance(model, X_test, y_test, n_repeats=10)
importance = perm.importances_mean
```

---

## Navigation

[← Previous: Introduction](./model-explainability-intro.md) | [Back to Index](./README.md) | [Next: Partial Dependence Plots →](./model-explainability-pdp.md)
