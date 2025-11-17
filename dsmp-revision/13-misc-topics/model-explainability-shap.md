# SHAP Values - The Gold Standard

## What You'll Learn

Enter the world of game theory-based explainability with SHAP (SHapley Additive exPlanations). Considered the gold standard for model explanations, SHAP provides both global and local insights with theoretical guarantees that other methods lack. This guide will teach you how SHAP calculates fair contributions for each feature, how to create stunning visualizations that communicate insights effectively, and when the computational cost is worth the accuracy.

---

## Understanding SHAP

### What is SHAP?

**SHAP (SHapley Additive exPlanations):** A unified approach to explain model predictions based on Shapley values from cooperative game theory.

**Key Idea:** How much does each feature contribute to the prediction compared to the average prediction?

### Game Theory Foundation

```
Cooperative Game Theory Question:
How to fairly distribute "payout" among "players"?

In ML Context:
- Payout = Prediction
- Players = Features
- Fair distribution = SHAP values

Answer: Consider all possible combinations of features
        and calculate each feature's marginal contribution
```

### SHAP Value Formula

```
SHAP value for feature i = Average marginal contribution
                           across all possible feature combinations

φᵢ = Σ (contribution of feature i when added to subset S)
     across all subsets S

Weighted by: probability of subset occurring
```

---

## SHAP Properties

### Three Foundational Properties

**1. Local Accuracy:**
```
prediction = base_value + sum(SHAP values)

Example:
Base value (average prediction): 0.5
SHAP values: [+0.3, -0.1, +0.05, -0.02]
Final prediction: 0.5 + 0.3 - 0.1 + 0.05 - 0.02 = 0.73
```

**2. Consistency:**
```
If model changes so a feature contributes more,
its SHAP value must increase (or stay same)

Prevents contradictory explanations
```

**3. Missingness:**
```
Features not in model have SHAP value = 0
Missing features contribute nothing
```

### Why These Matter

These properties ensure SHAP explanations are:
- **Accurate:** Sum to actual prediction
- **Consistent:** Won't contradict themselves
- **Fair:** Each feature gets appropriate credit

---

## Types of SHAP Explainers

### Choosing the Right Explainer

```python
import shap

# 1. TreeExplainer (for tree-based models)
# Fast and exact for trees
# Use for: Random Forest, XGBoost, LightGBM, CatBoost
explainer = shap.TreeExplainer(model)

# 2. KernelExplainer (model-agnostic)
# Slower but works with any model
# Use for: Neural networks, custom models, black boxes
explainer = shap.KernelExplainer(model.predict, X_train)

# 3. LinearExplainer (for linear models)
# Fast for linear models
# Use for: Linear Regression, Logistic Regression
explainer = shap.LinearExplainer(model, X_train)

# 4. DeepExplainer (for neural networks)
# Optimized for deep learning
# Use for: TensorFlow, PyTorch models
explainer = shap.DeepExplainer(model, X_train)

# 5. GradientExplainer (for differentiable models)
# Uses gradients for explanation
# Use for: Neural networks with gradient access
explainer = shap.GradientExplainer(model, X_train)
```

### Speed Comparison

```
TreeExplainer:     0.01 seconds  ← Use when possible!
LinearExplainer:   0.05 seconds
DeepExplainer:     1-5 seconds
KernelExplainer:   10-60 seconds ← Slowest but most general
```

---

## SHAP Implementation

### Basic Setup

```python
import shap
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import numpy as np

# Load data
data = load_breast_cancer()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

# Create SHAP explainer
explainer = shap.TreeExplainer(rf)

# Calculate SHAP values
shap_values = explainer.shap_values(X_test)

# For binary classification, use class 1 (positive class)
if isinstance(shap_values, list):
    shap_values = shap_values[1]

print(f"SHAP values shape: {shap_values.shape}")
print(f"Base value: {explainer.expected_value}")
```

### Verifying Local Accuracy

```python
# Verify SHAP property: prediction = base_value + sum(SHAP values)
sample_idx = 0
prediction = rf.predict_proba(X_test[sample_idx:sample_idx+1])[0][1]
base_value = explainer.expected_value[1] if isinstance(explainer.expected_value, list) else explainer.expected_value
shap_sum = base_value + shap_values[sample_idx].sum()

print(f"Model prediction: {prediction:.4f}")
print(f"SHAP sum: {shap_sum:.4f}")
print(f"Difference: {abs(prediction - shap_sum):.6f}")  # Should be very small
```

---

## SHAP Visualizations

### 1. Summary Plot (Beeswarm)

**Purpose:** Global importance with feature value context

```python
# Create summary plot
shap.summary_plot(shap_values, X_test, feature_names=data.feature_names)
```

**Interpretation:**
```
┌────────────────────────────────────────────────────┐
│ Feature                    SHAP value              │
│                                                    │
│ worst radius         ●●●●●●●●●●●●●●●●              │
│ worst perimeter      ●●●●●●●●●●●●                  │
│ mean concave points  ●●●●●●●●                      │
│ worst concave points ●●●●●●                        │
│                                                    │
│  ← Low feature value (blue)                       │
│  → High feature value (red)                       │
└────────────────────────────────────────────────────┘

Reading:
- X-axis: SHAP value (impact on prediction)
- Y-axis: Features (sorted by importance)
- Color: Feature value (red = high, blue = low)
- Each dot: One sample

Example: High "worst radius" (red dots) → High positive SHAP
         (increases probability of malignant diagnosis)
```

### 2. Bar Plot (Average Impact)

**Purpose:** Simple global importance ranking

```python
shap.summary_plot(shap_values, X_test, plot_type="bar",
                 feature_names=data.feature_names)
```

### 3. Force Plot (Single Prediction)

**Purpose:** Explain one prediction in detail

```python
# Explain first test sample
shap.force_plot(
    explainer.expected_value[1],
    shap_values[0],
    X_test[0],
    feature_names=data.feature_names,
    matplotlib=True
)
```

**Interpretation:**
```
┌────────────────────────────────────────────────────┐
│                                                    │
│  Base value: 0.5  →  [Features pushing up/down]  │
│                                                    │
│  ←─── Lower ───┤───── Higher ─────→              │
│                                                    │
│  [worst radius = high]  ──→  +0.3                │
│  [mean texture = low]   ←──  -0.1                │
│  [age = 45]            ──→   +0.05               │
│                                                    │
│  Final prediction: 0.75                          │
└────────────────────────────────────────────────────┘

Red = Pushing prediction higher
Blue = Pushing prediction lower
Width = Magnitude of impact
```

### 4. Waterfall Plot (Single Prediction)

**Purpose:** Step-by-step contribution breakdown

```python
shap.waterfall_plot(
    shap.Explanation(
        values=shap_values[0],
        base_values=explainer.expected_value[1],
        data=X_test[0],
        feature_names=data.feature_names
    )
)
```

**Interpretation:**
```
┌────────────────────────────────────────────────────┐
│                                                    │
│  E[f(x)] = 0.5  ← Base value                     │
│                                                    │
│  + worst radius = 25.3          → +0.25          │
│  + mean concave points = 0.15   → +0.15          │
│  + worst perimeter = 120        → +0.10          │
│  - mean texture = 12.5          → -0.05          │
│  + 15 other features            → +0.00          │
│                                                    │
│  = f(x) = 0.95  ← Final prediction               │
└────────────────────────────────────────────────────┘
```

### 5. Dependence Plot (Feature Interaction)

**Purpose:** Show how feature effect varies with another feature

```python
shap.dependence_plot(
    0,  # Feature index to analyze
    shap_values,
    X_test,
    feature_names=data.feature_names,
    interaction_index="auto"  # Auto-detect interaction
)
```

### 6. Decision Plot (Multiple Predictions)

**Purpose:** Compare multiple predictions

```python
shap.decision_plot(
    explainer.expected_value[1],
    shap_values[:10],
    X_test[:10],
    feature_names=data.feature_names
)
```

---

## Practical Example

### Credit Scoring with SHAP

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
import shap

# Create synthetic credit data
np.random.seed(42)
n_samples = 1000

data = pd.DataFrame({
    'credit_score': np.random.randint(300, 850, n_samples),
    'annual_income': np.random.randint(20000, 150000, n_samples),
    'age': np.random.randint(18, 70, n_samples),
    'num_credit_lines': np.random.randint(0, 20, n_samples),
    'debt_to_income': np.random.uniform(0, 1, n_samples),
    'employment_length': np.random.randint(0, 30, n_samples),
})

# Create target
data['approved'] = (
    (data['credit_score'] > 650) &
    (data['debt_to_income'] < 0.4) &
    (data['annual_income'] > 30000)
).astype(int)

# Add noise
noise_idx = np.random.choice(n_samples, size=int(0.1 * n_samples), replace=False)
data.loc[noise_idx, 'approved'] = 1 - data.loc[noise_idx, 'approved']

# Split data
X = data.drop('approved', axis=1)
y = data['approved']
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = GradientBoostingClassifier(random_state=42)
model.fit(X_train, y_train)
print(f"Model Accuracy: {model.score(X_test, y_test):.3f}")

# SHAP Analysis
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Global importance
print("\nGlobal Feature Importance:")
print("=" * 50)
shap_importance = pd.DataFrame({
    'feature': X.columns,
    'importance': np.abs(shap_values).mean(axis=0)
}).sort_values('importance', ascending=False)
print(shap_importance)

# Explain a denied application
denied_idx = np.where(model.predict(X_test) == 0)[0][0]
applicant = X_test.iloc[denied_idx]
prediction = model.predict_proba(X_test.iloc[denied_idx:denied_idx+1])

print("\n" + "=" * 50)
print("Explaining Denied Application")
print("=" * 50)
print(f"Applicant Details:\n{applicant}")
print(f"\nPrediction: DENIED")
print(f"Approval Probability: {prediction[0][1]:.2%}")

# SHAP explanation
shap_exp = shap_values[denied_idx]
print(f"\nSHAP Contribution to Denial:")
for feature, value in zip(X.columns, shap_exp):
    direction = "increases approval" if value > 0 else "decreases approval"
    print(f"  {feature:20s}: {value:+.4f} ({direction})")

# Top reasons for denial
shap_df = pd.DataFrame({
    'feature': X.columns,
    'value': applicant.values,
    'shap': shap_exp
}).sort_values('shap')

print(f"\nTop 3 Reasons for Denial:")
for _, row in shap_df.head(3).iterrows():
    print(f"  {row['feature']}: {row['value']:.2f} (SHAP: {row['shap']:.4f})")
```

---

## SHAP vs Other Methods

### Comparison Table

| Aspect | SHAP | Feature Importance | LIME |
|--------|------|-------------------|------|
| Theory | Game theory (Shapley) | Information gain | Local linear approx |
| Scope | Global + Local | Global only | Local only |
| Consistency | Always | Not guaranteed | Not guaranteed |
| Accuracy | Very high | Medium | Medium |
| Speed | Slow | Very fast | Medium |
| Model Support | Any (with right explainer) | Tree-based | Any |

### When to Use SHAP

**Use SHAP When:**
- Need theoretically sound explanations
- Explaining high-stakes decisions (medical, legal)
- Want both global and local insights
- Can afford computational cost
- Need publication-quality visualizations

**Use Alternatives When:**
- Need real-time explanations
- Working with very large datasets
- Quick exploration is sufficient
- Computational resources limited

---

## Common Pitfalls

### 1. Misinterpreting Absolute Values

```python
# Wrong interpretation
"SHAP value = 0.5 means 50% probability"

# Correct interpretation
"SHAP value = +0.5 means this feature increases
 prediction by 0.5 compared to average"
```

### 2. Forgetting Base Value

```python
# Always include base value
final_prediction = base_value + sum(shap_values)

# Not just
final_prediction = sum(shap_values)  # Wrong!
```

### 3. Using Wrong SHAP Values for Classification

```python
# Binary classification returns list of arrays
shap_values = explainer.shap_values(X)

# Use class 1 (positive class) for explanation
if isinstance(shap_values, list):
    shap_values_positive = shap_values[1]
else:
    shap_values_positive = shap_values
```

---

## Quick Reference

### SHAP Cheat Sheet

```python
# Setup
import shap
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Global importance
shap.summary_plot(shap_values, X_test)

# Local explanation
shap.waterfall_plot(shap.Explanation(
    values=shap_values[0],
    base_values=explainer.expected_value,
    data=X_test[0]
))
```

### Pros and Cons

| Pros | Cons |
|------|------|
| Theoretically sound (Shapley values) | Computationally expensive (KernelSHAP) |
| Consistent and accurate | Can be slow for large datasets |
| Both global and local | Requires understanding of game theory |
| Beautiful visualizations | May be complex for non-technical users |
| Model-agnostic options | TreeExplainer only for tree models |

---

## Navigation

[← Previous: Partial Dependence Plots](./model-explainability-pdp.md) | [Back to Index](./README.md) | [Next: LIME →](./model-explainability-lime.md)
