# Partial Dependence Plots (PDP)

## What You'll Learn

Move beyond knowing which features are important to understanding how they affect predictions. Partial Dependence Plots reveal the relationship between features and model outputs, showing you whether increasing age raises or lowers predictions, and at what rate. This guide will teach you how to create, interpret, and leverage PDPs to gain deeper insights into your model's behavior and communicate findings to stakeholders.

---

## Understanding Partial Dependence Plots

### Concept

**Partial Dependence Plot (PDP):** Shows the marginal effect of one or two features on model predictions while averaging out the effects of all other features.

**Question Answered:** "How does changing feature X affect predictions, on average, holding everything else constant?"

### The Intuition

Imagine you want to know how age affects loan approval probability:

```
Without PDP:
"Age is important" ← We know from feature importance

With PDP:
"Approval probability increases from 20% to 80%
 as age goes from 18 to 40, then stays flat" ← We understand the relationship!
```

### Algorithm

```
For each value of feature X:
  1. Set feature X to that value for ALL samples
  2. Predict on modified dataset
  3. Average predictions across all samples
  4. Plot average prediction vs feature value

Example with Age:
  For age = 25:
    - Set all 1000 samples to age=25
    - Predict on these modified samples
    - Average the 1000 predictions → 0.65
    - Plot point (25, 0.65)

  Repeat for age = 26, 27, 28, ...
```

---

## Implementation

### Creating Basic PDPs

```python
from sklearn.inspection import PartialDependenceDisplay
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

# Load and split data
data = load_breast_cancer()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
gb = GradientBoostingClassifier(random_state=42)
gb.fit(X_train, y_train)

# Create PDP for top 4 features
features = [0, 1, 2, 3]  # Feature indices
fig, ax = plt.subplots(figsize=(12, 8))

PartialDependenceDisplay.from_estimator(
    gb, X_train, features,
    feature_names=data.feature_names,
    n_cols=2,
    ax=ax
)

plt.suptitle('Partial Dependence Plots')
plt.tight_layout()
plt.savefig('pdp.png')
plt.show()
```

### Creating 2D PDPs (Feature Interactions)

```python
# 2D PDP shows interaction between two features
features_2d = [(0, 1)]  # Interaction between feature 0 and 1
fig, ax = plt.subplots(figsize=(8, 6))

PartialDependenceDisplay.from_estimator(
    gb, X_train, features_2d,
    feature_names=data.feature_names,
    ax=ax
)

plt.suptitle('2D Partial Dependence Plot - Feature Interaction')
plt.tight_layout()
plt.savefig('pdp_2d.png')
plt.show()
```

### Customizing PDPs

```python
# Create PDP with more control
from sklearn.inspection import partial_dependence

# Calculate partial dependence values
pdp_results = partial_dependence(
    gb, X_train,
    features=[0],  # Feature index
    grid_resolution=50  # Number of points to evaluate
)

# Extract values
pdp_values = pdp_results['average'][0]
feature_values = pdp_results['grid_values'][0]

# Custom plot
plt.figure(figsize=(10, 6))
plt.plot(feature_values, pdp_values, linewidth=2)
plt.xlabel(data.feature_names[0])
plt.ylabel('Partial Dependence')
plt.title(f'PDP for {data.feature_names[0]}')
plt.grid(True, alpha=0.3)
plt.savefig('custom_pdp.png')
plt.show()
```

---

## Interpreting PDPs

### Reading 1D PDPs

```
Partial Dependence Plot Example:
┌──────────────────────────────────────┐
│                                      │
│  Prediction                          │
│      ↑                               │
│  0.8 │         ┌───────────          │
│      │        /                      │
│  0.5 │       /                       │
│      │      /                        │
│  0.2 │─────┘                         │
│      │                               │
│      └─────────────────────────→     │
│        0   20   40   60   80   Age  │
│                                      │
└──────────────────────────────────────┘

Interpretation:
- Below age 20: Low prediction probability (~0.2)
- Age 20-40: Sharp increase in probability
- Above age 40: Stable high probability (~0.8)

Business Insight:
- Young applicants are risky
- Middle-aged applicants preferred
- Older applicants equally preferred
```

### Different Relationship Patterns

```python
# Linear relationship
# PDP: Straight line
# Interpretation: Each unit increase has same effect

# Non-linear relationship
# PDP: Curve
# Interpretation: Effect varies with feature value

# Threshold effect
# PDP: Step function
# Interpretation: Effect changes sharply at threshold

# No relationship
# PDP: Flat line
# Interpretation: Feature has no average effect
```

### Reading 2D PDPs

```
2D PDP Example (Age vs Income):

        Income →
Age ↓   Low    Medium   High
Young   Red     Yellow   Green
Middle  Yellow  Green    Green
Old     Green   Green    Green

Red = Low approval probability
Yellow = Medium approval probability
Green = High approval probability

Interpretation:
- Young + Low Income = Lowest approval
- Any age + High Income = High approval
- Old age compensates for lower income
```

---

## When to Use PDPs

### Best Use Cases

**Understanding Feature Effects:**
```python
# Instead of "income is important"
# PDP shows: "Each $10K increase → 5% higher approval rate"
```

**Validating Business Logic:**
```python
# Check if model learned sensible patterns
# Example: Should approval increase with income? → Check PDP
```

**Finding Thresholds:**
```python
# Identify critical values
# Example: "Approval jumps at credit score 650"
```

**Detecting Non-linearity:**
```python
# Discover complex relationships
# Example: "Benefit of higher income decreases for wealthy applicants"
```

### Limitations and Assumptions

**Assumes Feature Independence:**
```
Problem: PDP assumes features are independent
Reality: Features are often correlated

Example:
- Age and income are correlated
- Setting age=20 and income=$200K is unrealistic
- PDP averages over these unrealistic combinations

Impact: PDP can be misleading if features are correlated
```

**Solution:**
```python
# Use ICE plots (Individual Conditional Expectation)
# Shows individual lines instead of average
from sklearn.inspection import PartialDependenceDisplay

PartialDependenceDisplay.from_estimator(
    model, X, [0],
    kind='both'  # Shows PDP + individual ICE lines
)
```

**Only Shows Average Effect:**
```
PDP shows: "Average effect of age"
Missing: Heterogeneous effects for different groups

Example:
- Age might matter more for low-income applicants
- PDP averages over all income levels
```

**Computationally Expensive:**
```
For each feature value:
  - Modify entire dataset
  - Make predictions
  - Average results

Cost: O(n_samples × n_grid_points)
```

---

## Advanced Techniques

### Individual Conditional Expectation (ICE) Plots

```python
from sklearn.inspection import PartialDependenceDisplay

# ICE plots show individual curves instead of average
fig, ax = plt.subplots(figsize=(10, 6))

PartialDependenceDisplay.from_estimator(
    model, X_train, [0],
    kind='both',  # Show both PDP and ICE
    centered=True,  # Center ICE plots at first value
    ax=ax
)

plt.title('ICE Plot with PDP (averaged)')
plt.savefig('ice_plot.png')
plt.show()
```

**Interpretation:**
- Each thin line: Individual sample's response
- Thick line: Average (PDP)
- Variation in lines: Heterogeneity in effects

### Centered ICE Plots

```python
# Center all curves at their starting value
# Makes it easier to see individual variations

PartialDependenceDisplay.from_estimator(
    model, X_train, [0],
    kind='individual',
    centered=True  # All curves start at 0
)
```

---

## Practical Example

### Credit Approval Analysis

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.inspection import PartialDependenceDisplay
import matplotlib.pyplot as plt

# Create synthetic credit data
np.random.seed(42)
n_samples = 1000

data = pd.DataFrame({
    'credit_score': np.random.randint(300, 850, n_samples),
    'income': np.random.randint(20000, 150000, n_samples),
    'age': np.random.randint(18, 70, n_samples),
    'debt_ratio': np.random.uniform(0, 1, n_samples)
})

# Create target with realistic logic
data['approved'] = (
    (data['credit_score'] > 650) &
    (data['debt_ratio'] < 0.4) &
    (data['income'] > 30000)
).astype(int)

# Train model
X = data.drop('approved', axis=1)
y = data['approved']

model = GradientBoostingClassifier(random_state=42)
model.fit(X, y)

# Create PDPs for all features
features = [0, 1, 2, 3]
fig, ax = plt.subplots(figsize=(14, 10))

PartialDependenceDisplay.from_estimator(
    model, X, features,
    feature_names=X.columns.tolist(),
    n_cols=2,
    ax=ax
)

plt.suptitle('Credit Approval - Partial Dependence Analysis', fontsize=16)
plt.tight_layout()
plt.savefig('credit_approval_pdp.png')

# Analyze credit score effect in detail
pdp_credit = partial_dependence(model, X, features=[0], grid_resolution=100)

print("Credit Score Analysis:")
print("=" * 50)
values = pdp_credit['grid_values'][0]
predictions = pdp_credit['average'][0]

# Find threshold where approval probability crosses 0.5
threshold_idx = np.where(predictions > 0.5)[0][0]
threshold_score = values[threshold_idx]
print(f"Approval probability crosses 50% at score: {threshold_score:.0f}")

# Find marginal effect
effect_per_100 = (predictions[-1] - predictions[0]) / (values[-1] - values[0]) * 100
print(f"Average effect per 100 points: {effect_per_100:.2%}")
```

---

## Quick Reference

### Common Patterns

| Pattern | Meaning | Example |
|---------|---------|---------|
| Upward slope | Positive effect | Higher income → Higher approval |
| Downward slope | Negative effect | Higher debt → Lower approval |
| Flat line | No effect | Hair color → No effect |
| S-curve | Threshold effect | Credit score threshold |
| U-shape | Non-monotonic | Age (too young or old = risky) |

### Pros and Cons

| Pros | Cons |
|------|------|
| Easy to interpret | Assumes feature independence |
| Shows relationship direction | Only shows average effect |
| Works with any model | Misleading with correlated features |
| Can show interactions (2D) | Computationally expensive |
| Beautiful visualizations | Hides heterogeneous effects |

### Best Practices

1. **Check for correlated features** before creating PDPs
2. **Use ICE plots** to see individual variations
3. **Create 2D PDPs** for important feature pairs
4. **Validate with domain experts** that patterns make sense
5. **Combine with feature importance** for complete picture

---

## Navigation

[← Previous: Feature Importance](./model-explainability-feature-importance.md) | [Back to Index](./README.md) | [Next: SHAP Values →](./model-explainability-shap.md)
