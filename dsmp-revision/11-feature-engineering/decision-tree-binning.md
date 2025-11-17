# Decision Tree Binning

## What You'll Learn

Unlock the power of supervised binning that uses your target variable to find optimal splits. You'll learn how decision trees can automatically discover the bin boundaries that best predict your outcome, creating features that directly support your modeling goals.

## Understanding Decision Tree Binning

Use decision tree to find optimal splits based on target variable - the only supervised binning method.

```
Supervised Binning:
───────────────────
Uses target variable to find best splits
Example: Predicting house price

Age → Price relationship:
  Age < 30: Low price
  30 ≤ Age < 50: Medium price
  Age ≥ 50: High price

Tree finds these splits automatically!
```

## Basic Implementation for Regression

```python
from sklearn.tree import DecisionTreeRegressor
import pandas as pd
import numpy as np

# Generate data where age affects price non-linearly
np.random.seed(42)
n = 500

age = np.random.uniform(20, 70, n)

# Price depends on age in step-wise manner
price = np.where(
    age < 30,
    150000 + np.random.normal(0, 10000, n),  # Young: ~150k
    np.where(
        age < 50,
        250000 + np.random.normal(0, 15000, n),  # Middle: ~250k
        400000 + np.random.normal(0, 20000, n)   # Senior: ~400k
    )
)

df = pd.DataFrame({'age': age, 'price': price})

print("House Price Data:")
print(df.head(10))
print("\n" + "="*60 + "\n")

# Use decision tree to find optimal age bins
tree = DecisionTreeRegressor(
    max_depth=2,  # Limit depth = limit number of bins
    min_samples_leaf=50  # Minimum samples per bin
)

tree.fit(df[['age']], df['price'])

# Get split points
tree_structure = tree.tree_

def get_split_points(tree, feature_idx=0):
    """Extract split points from decision tree"""
    splits = []

    def traverse(node=0):
        if tree.feature[node] == feature_idx:
            splits.append(tree.threshold[node])
        if tree.children_left[node] != -1:  # Not a leaf
            traverse(tree.children_left[node])
            traverse(tree.children_right[node])

    traverse()
    return sorted(splits)

split_points = get_split_points(tree_structure)

print("Decision Tree Found Optimal Splits:")
print(f"Split points: {split_points}")

# Create bins based on tree splits
bin_edges = [df['age'].min()] + split_points + [df['age'].max()]
labels = [f'Group_{i}' for i in range(len(bin_edges)-1)]

df['age_group'] = pd.cut(df['age'], bins=bin_edges, labels=labels, include_lowest=True)

print("\n" + "="*60 + "\n")
print("Statistics per Tree-Based Bin:")
print(df.groupby('age_group').agg({
    'age': ['count', 'min', 'max', 'mean'],
    'price': ['mean', 'std']
}))

print("\n" + "="*60 + "\n")
print("Interpretation:")
print("Tree found optimal age ranges that best predict price")
print("These are data-driven, not arbitrary!")
```

## Supervised Binning for Classification

```python
from sklearn.tree import DecisionTreeClassifier
import pandas as pd
import numpy as np

# Credit default prediction
np.random.seed(42)
n = 1000

credit_score = np.random.uniform(300, 850, n)

# Default probability depends on credit score
default_prob = 1 / (1 + np.exp((credit_score - 600) / 50))
defaulted = np.random.binomial(1, default_prob)

df = pd.DataFrame({
    'credit_score': credit_score,
    'defaulted': defaulted
})

print("Credit Data:")
print(df.head(10))
print(f"\nDefault Rate: {defaulted.mean():.2%}")

# Use decision tree to find optimal credit score bins
tree = DecisionTreeClassifier(
    max_depth=3,
    min_samples_leaf=100
)

tree.fit(df[['credit_score']], df['defaulted'])

# Get split points
def get_splits_classifier(tree, feature_idx=0):
    splits = []

    def traverse(node=0):
        if tree.tree_.feature[node] == feature_idx:
            splits.append(tree.tree_.threshold[node])
        if tree.tree_.children_left[node] != -1:
            traverse(tree.tree_.children_left[node])
            traverse(tree.tree_.children_right[node])

    traverse()
    return sorted(splits)

splits = get_splits_classifier(tree)

print("\n" + "="*60 + "\n")
print("Optimal Credit Score Splits:")
print(splits)

# Create risk categories
bin_edges = [300] + splits + [850]
labels = ['Very High Risk', 'High Risk', 'Medium Risk', 'Low Risk'][:len(bin_edges)-1]

df['risk_category'] = pd.cut(
    df['credit_score'],
    bins=bin_edges,
    labels=labels,
    include_lowest=True
)

print("\n" + "="*60 + "\n")
print("Risk Category Analysis:")
risk_analysis = df.groupby('risk_category').agg({
    'credit_score': ['count', 'min', 'max', 'mean'],
    'defaulted': ['sum', 'mean']
})
print(risk_analysis)

print("\n" + "="*60 + "\n")
print("Default Rate by Category:")
default_rates = df.groupby('risk_category')['defaulted'].mean()
print(default_rates)
```

## Why Decision Tree Binning Works

Decision trees find splits that maximize separation between target classes or minimize prediction error. This means the bins are optimized specifically for your prediction task.

```
Advantages:
  - Supervised (uses target)
  - Optimal for prediction
  - Finds non-obvious patterns
  - Handles non-linearity

Example: Credit Risk
Without supervised binning:
  [300-450]: Mixed risk
  [450-600]: Mixed risk
  [600-750]: Mixed risk

With decision tree:
  [300-520]: 80% default (Very High Risk)
  [520-680]: 40% default (Medium Risk)
  [680-850]: 10% default (Low Risk)

Bins align with actual default rates!
```

## When to Use Decision Tree Binning

Use decision tree binning when:
- Have target variable (supervised learning)
- Want optimal bins for prediction
- Relationship with target is complex
- Need to find non-obvious patterns

Don't use when:
- No target variable (unsupervised)
- Need interpretable bins (use domain knowledge)
- Very small dataset (overfitting risk)
- Exploratory analysis only

## Quick Reference

```
For regression:
  from sklearn.tree import DecisionTreeRegressor
  tree = DecisionTreeRegressor(max_depth=2)
  tree.fit(X, y)

For classification:
  from sklearn.tree import DecisionTreeClassifier
  tree = DecisionTreeClassifier(max_depth=3)
  tree.fit(X, y)

Extract splits:
  splits = get_split_points(tree.tree_)

Control binning:
  max_depth: Limits number of bins
  min_samples_leaf: Minimum samples per bin

Advantages:
  - Optimal for target variable
  - Finds complex patterns
  - Data-driven

Use when:
  - Supervised learning task
  - Want prediction-optimized bins
  - Complex relationships exist
```

---

**Related Topics:**
- [K-Means Binning](./kmeans-binning.md) - Unsupervised data-driven approach
- [Best Practices](./discretization-best-practices.md) - Avoiding overfitting

**Navigate:** [Feature Engineering Home](./README.md)
