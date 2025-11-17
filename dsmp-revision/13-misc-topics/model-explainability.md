# Model Explainability & Interpretability

## 📖 Table of Contents
- [Introduction](#introduction)
- [Why Model Explainability Matters](#why-model-explainability-matters)
- [Global vs Local Interpretability](#global-vs-local-interpretability)
- [Feature Importance](#feature-importance)
- [Permutation Importance](#permutation-importance)
- [Partial Dependence Plots](#partial-dependence-plots)
- [SHAP Values](#shap-values)
- [LIME](#lime)
- [Comparison of Techniques](#comparison-of-techniques)
- [Practical Examples](#practical-examples)
- [Interview Questions](#interview-questions)

---

## Introduction

**Model Explainability:** Ability to understand and explain how ML models make predictions.

**Why It's Important:**
- **Trust:** Stakeholders need to trust model decisions
- **Debugging:** Identify errors and biases
- **Compliance:** Regulatory requirements (GDPR, fair lending)
- **Business Insights:** Understand what drives predictions
- **Model Improvement:** Identify features to engineer

### The Black Box Problem

```
Input Features → [Black Box Model] → Prediction
       ↓              ❓               ↓
   [age, income,     Why this      [Approved]
    credit score]   prediction?
```

**Goal:** Open the black box and understand the "why"

---

## Why Model Explainability Matters

### Real-World Scenarios

**1. Credit Scoring:**
```
Customer denied loan
Question: "Why was I denied?"
Need: Explain which factors led to denial
```

**2. Medical Diagnosis:**
```
Patient diagnosed with disease
Question: "What symptoms indicated this?"
Need: Doctors need to trust and verify predictions
```

**3. Hiring Decisions:**
```
Candidate rejected by AI system
Question: "Was there bias in the decision?"
Need: Ensure fair, non-discriminatory hiring
```

**4. Fraud Detection:**
```
Transaction flagged as fraud
Question: "Why is this suspicious?"
Need: Explain to customer and investigate
```

### Regulatory Requirements

```
┌──────────────────────────────────────────────────────┐
│               Regulations Requiring                  │
│              Model Explainability                    │
└──────────────────────────────────────────────────────┘

GDPR (Europe)
  → Right to explanation for automated decisions

Fair Lending Laws (US)
  → Must explain credit denials

FCRA (Fair Credit Reporting Act)
  → Adverse action notices

Model Risk Management (Banking)
  → Regulators require model documentation
```

---

## Global vs Local Interpretability

### Global Interpretability

**What:** Understanding overall model behavior

**Questions Answered:**
- Which features are most important overall?
- How does each feature affect predictions on average?
- What are the general patterns the model learned?

**Techniques:**
- Feature importance
- Partial Dependence Plots (PDP)
- Global SHAP values

### Local Interpretability

**What:** Understanding individual predictions

**Questions Answered:**
- Why did the model make THIS specific prediction?
- Which features contributed most to THIS decision?
- How would changing specific features affect THIS prediction?

**Techniques:**
- LIME (Local Interpretable Model-agnostic Explanations)
- SHAP values for individual predictions
- Individual Conditional Expectation (ICE) plots

### Visual Comparison

```
Global Interpretability:
┌─────────────────────────────────────┐
│   Overall Feature Importance        │
│                                     │
│   Credit Score: ████████████ 45%   │
│   Income:       ████████     30%   │
│   Age:          ████         15%   │
│   Debt:         ███          10%   │
└─────────────────────────────────────┘
"Credit score is most important overall"

Local Interpretability:
┌─────────────────────────────────────┐
│   Why was John's loan denied?       │
│                                     │
│   Credit Score (550): -0.8 ← Low!  │
│   Income ($80K):       +0.3         │
│   Age (25):           -0.2 ← Young │
│   Debt ($15K):        -0.1          │
│                                     │
│   Total Impact: DENIED              │
└─────────────────────────────────────┘
"Low credit score was main reason for denial"
```

---

## Feature Importance

### Tree-Based Feature Importance

**Concept:** How much each feature decreases impurity across all splits

**Available in:**
- Decision Trees
- Random Forest
- Gradient Boosting (XGBoost, LightGBM)

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_breast_cancer
import pandas as pd
import matplotlib.pyplot as plt

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
import seaborn as sns
plt.figure(figsize=(10, 6))
sns.barplot(x='importance', y='feature', data=importance.head(10))
plt.title('Top 10 Feature Importances')
plt.xlabel('Importance')
plt.tight_layout()
plt.savefig('feature_importance.png')
```

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

**Pros & Cons:**

| Pros | Cons |
|------|------|
| ✅ Fast computation | ❌ Biased toward high-cardinality features |
| ✅ Built into tree models | ❌ Only for tree-based models |
| ✅ Easy to interpret | ❌ Can be misleading with correlated features |
| ✅ Shows global importance | ❌ Doesn't show direction of effect |

---

## Permutation Importance

### Concept

**Idea:** Measure how much model performance decreases when a feature is randomly shuffled

**Algorithm:**
```
1. Train model on original data → Baseline score
2. For each feature:
   a. Randomly shuffle feature values
   b. Make predictions → Get score
   c. Importance = Baseline score - Shuffled score
3. Repeat multiple times and average
```

**Visual:**

```
Original Data:
Feature 1: [1, 2, 3, 4, 5]  ← Important feature
Feature 2: [a, b, c, d, e]

After Shuffling Feature 1:
Feature 1: [3, 1, 5, 2, 4]  ← Randomized!
Feature 2: [a, b, c, d, e]

If accuracy drops significantly → Feature 1 is important
If accuracy stays same → Feature 1 is not important
```

### Implementation

```python
from sklearn.inspection import permutation_importance
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_breast_cancer
import numpy as np
import pandas as pd

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
import matplotlib.pyplot as plt

top_features = importance_df.head(10)
plt.figure(figsize=(10, 6))
plt.barh(top_features['feature'], top_features['importance_mean'])
plt.xerr(top_features['importance_std'], fmt='o', color='red')
plt.xlabel('Permutation Importance')
plt.title('Top 10 Features by Permutation Importance')
plt.tight_layout()
plt.savefig('permutation_importance.png')
```

**Pros & Cons:**

| Pros | Cons |
|------|------|
| ✅ Model-agnostic (works with any model) | ❌ Computationally expensive |
| ✅ Accounts for feature interactions | ❌ Can be unstable with small datasets |
| ✅ Not biased by feature cardinality | ❌ Requires fitted model |
| ✅ Shows actual impact on performance | ❌ Can be affected by correlated features |

---

## Partial Dependence Plots

### Concept

**PDP:** Shows the marginal effect of a feature on predictions

**Question Answered:** "How does changing feature X affect predictions, on average?"

**Algorithm:**
```
For each value of feature X:
  1. Set feature X to that value for all samples
  2. Predict on modified dataset
  3. Average predictions
  4. Plot average prediction vs feature value
```

### Implementation

```python
from sklearn.inspection import PartialDependenceDisplay
from sklearn.ensemble import GradientBoostingClassifier
import matplotlib.pyplot as plt

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

# 2D PDP (interaction between two features)
features_2d = [(0, 1)]  # Interaction between feature 0 and 1
fig, ax = plt.subplots(figsize=(8, 6))

PartialDependenceDisplay.from_estimator(
    gb, X_train, features_2d,
    feature_names=data.feature_names,
    ax=ax
)

plt.suptitle('2D Partial Dependence Plot')
plt.tight_layout()
plt.savefig('pdp_2d.png')
```

### Interpreting PDPs

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
- Below age 20: Low prediction probability
- Age 20-40: Sharp increase in probability
- Above age 40: Stable high probability
```

**Pros & Cons:**

| Pros | Cons |
|------|------|
| ✅ Easy to interpret | ❌ Assumes feature independence |
| ✅ Shows relationship direction | ❌ Can be misleading with correlated features |
| ✅ Works with any model | ❌ Only shows average effect |
| ✅ Can show interactions (2D PDP) | ❌ Computationally expensive for large datasets |

---

## SHAP Values

### What is SHAP?

**SHAP (SHapley Additive exPlanations):** Unified approach to explain predictions based on game theory

**Key Idea:** How much does each feature contribute to the prediction compared to the average prediction?

**Based on Shapley Values from Game Theory:**
```
How to fairly distribute "payout" (prediction) among "players" (features)?

Answer: Consider all possible combinations of features
        and calculate marginal contribution
```

### SHAP Value Formula

```
SHAP value for feature i = Average marginal contribution
                           across all possible feature combinations

φᵢ = Σ (contribution of feature i when added to subset S)
     across all subsets S
```

### SHAP Value Properties

1. **Local Accuracy:**
   ```
   prediction = base_value + sum(SHAP values)
   ```

2. **Consistency:** If model changes so feature contributes more, SHAP value increases

3. **Missingness:** Features not in model have SHAP value = 0

### Types of SHAP Explainers

```python
import shap

# 1. TreeExplainer (for tree-based models)
# Fast and exact for trees
explainer = shap.TreeExplainer(model)

# 2. KernelExplainer (model-agnostic)
# Slower but works with any model
explainer = shap.KernelExplainer(model.predict, X_train)

# 3. LinearExplainer (for linear models)
# Fast for linear models
explainer = shap.LinearExplainer(model, X_train)

# 4. DeepExplainer (for neural networks)
# For deep learning models
explainer = shap.DeepExplainer(model, X_train)
```

### SHAP Implementation

```python
import shap
from sklearn.ensemble import RandomForestClassifier
import matplotlib.pyplot as plt

# Train model
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

# Create SHAP explainer
explainer = shap.TreeExplainer(rf)

# Calculate SHAP values
shap_values = explainer.shap_values(X_test)

# For binary classification, use class 1
if isinstance(shap_values, list):
    shap_values = shap_values[1]

# ========== Visualizations ==========

# 1. Summary Plot (Global Importance)
shap.summary_plot(shap_values, X_test, feature_names=data.feature_names)

# 2. Bar Plot (Average Impact)
shap.summary_plot(shap_values, X_test, plot_type="bar",
                 feature_names=data.feature_names)

# 3. Force Plot (Single Prediction)
# Explain first test sample
shap.force_plot(
    explainer.expected_value[1],
    shap_values[0],
    X_test[0],
    feature_names=data.feature_names,
    matplotlib=True
)

# 4. Waterfall Plot (Single Prediction)
shap.waterfall_plot(
    shap.Explanation(
        values=shap_values[0],
        base_values=explainer.expected_value[1],
        data=X_test[0],
        feature_names=data.feature_names
    )
)

# 5. Dependence Plot (Feature Interaction)
shap.dependence_plot(
    0,  # Feature index
    shap_values,
    X_test,
    feature_names=data.feature_names
)

# 6. Decision Plot (Multiple Predictions)
shap.decision_plot(
    explainer.expected_value[1],
    shap_values[:10],
    X_test[:10],
    feature_names=data.feature_names
)
```

### SHAP Visualizations Explained

**1. Summary Plot (Beeswarm):**

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

Interpretation:
- X-axis: SHAP value (impact on prediction)
- Y-axis: Features (sorted by importance)
- Color: Feature value (red = high, blue = low)
- Each dot: One sample

Example: High "worst radius" (red dots) → High positive SHAP
         (increases probability of malignant)
```

**2. Force Plot (Individual Prediction):**

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
```

**3. Waterfall Plot:**

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  E[f(x)] = 0.5  ← Base value                     │
│                                                    │
│  + worst radius = 25.3          → +0.25          │
│  + mean concave points = 0.15   → +0.15          │
│  + worst perimeter = 120        → +0.10          │
│  - mean texture = 12.5          → -0.05          │
│                                                    │
│  = f(x) = 0.95  ← Final prediction               │
└────────────────────────────────────────────────────┘
```

### SHAP Pros & Cons

| Pros | Cons |
|------|------|
| ✅ Theoretically sound (Shapley values) | ❌ Computationally expensive (especially KernelSHAP) |
| ✅ Consistent and accurate | ❌ Can be slow for large datasets |
| ✅ Both global and local explanations | ❌ Requires understanding of game theory |
| ✅ Beautiful visualizations | ❌ May be difficult to explain to non-technical stakeholders |
| ✅ Model-agnostic options available | ❌ TreeExplainer only for tree models |

---

## LIME

### What is LIME?

**LIME (Local Interpretable Model-agnostic Explanations):** Explains individual predictions by approximating the model locally with an interpretable model

**Key Idea:**
```
Complex Model (Black Box)
         ↓
    [LIME Process]
         ↓
Simple Linear Model (locally)
```

### How LIME Works

```
Algorithm:
1. Select instance to explain
2. Generate perturbed samples around instance
3. Get predictions from black box model
4. Weight samples by proximity to instance
5. Train simple model (linear) on weighted samples
6. Explain using simple model's coefficients
```

**Visual:**

```
Original Sample:
  [age=30, income=50K, credit_score=700]
        ↓
Generate Perturbations:
  [age=28, income=52K, credit_score=705]
  [age=32, income=48K, credit_score=695]
  [age=31, income=51K, credit_score=700]
  ... (1000+ samples)
        ↓
Get Black Box Predictions:
  Sample 1 → 0.85
  Sample 2 → 0.80
  Sample 3 → 0.90
  ...
        ↓
Weight by Distance from Original:
  Close samples → High weight
  Far samples → Low weight
        ↓
Train Linear Model:
  prediction = β₀ + β₁(age) + β₂(income) + β₃(credit_score)
        ↓
Explain:
  β₃ = 0.5  ← Credit score most important for THIS prediction
```

### LIME Implementation

```python
import lime
import lime.lime_tabular
from sklearn.ensemble import RandomForestClassifier
import numpy as np

# Train model
rf = RandomForestClassifier(random_state=42)
rf.fit(X_train, y_train)

# Create LIME explainer
explainer = lime.lime_tabular.LimeTabularExplainer(
    X_train,
    feature_names=data.feature_names,
    class_names=['benign', 'malignant'],
    mode='classification'
)

# Explain a single prediction
i = 0  # Explain first test sample
exp = explainer.explain_instance(
    X_test[i],
    rf.predict_proba,
    num_features=10,
    num_samples=5000  # Number of perturbed samples
)

# Show explanation
print("Prediction:", rf.predict_proba(X_test[i].reshape(1, -1)))
print("\nExplanation:")
print(exp.as_list())

# Visualize
exp.show_in_notebook(show_table=True)

# As matplotlib figure
fig = exp.as_pyplot_figure()
plt.tight_layout()
plt.savefig('lime_explanation.png')

# Get feature importance
importance = dict(exp.as_list())
print("\nFeature Contributions:")
for feature, value in importance.items():
    print(f"  {feature}: {value:+.4f}")
```

### LIME Output Example

```
Instance Prediction: Malignant (0.95)

Top Features:
  worst radius > 20.0          →  +0.35  (increases malignant prob)
  mean concave points > 0.1    →  +0.25
  worst perimeter > 120        →  +0.20
  mean texture < 15            →  -0.05  (decreases malignant prob)
  worst area > 800             →  +0.15

Interpretation:
  This tumor predicted malignant because:
  - Large radius (worst radius > 20)
  - High concave points
  - Large perimeter
```

### LIME for Text

```python
from lime.lime_text import LimeTextExplainer
from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Sample text classification
texts = [
    "This movie is great! I loved it.",
    "Terrible film, waste of time.",
    "Amazing performance by the actors.",
    "Boring and predictable plot."
]
labels = [1, 0, 1, 0]  # 1 = positive, 0 = negative

# Create pipeline
vectorizer = TfidfVectorizer()
classifier = LogisticRegression()
pipeline = make_pipeline(vectorizer, classifier)
pipeline.fit(texts, labels)

# Create LIME explainer for text
explainer = LimeTextExplainer(class_names=['negative', 'positive'])

# Explain prediction
text_to_explain = "This movie is absolutely fantastic!"
exp = explainer.explain_instance(
    text_to_explain,
    pipeline.predict_proba,
    num_features=6
)

print("Prediction:", pipeline.predict_proba([text_to_explain]))
print("\nWord Contributions:")
for word, contribution in exp.as_list():
    print(f"  '{word}': {contribution:+.4f}")

# Output:
# 'fantastic': +0.45  ← Strong positive indicator
# 'movie': +0.10
# 'absolutely': +0.35
```

### LIME Pros & Cons

| Pros | Cons |
|------|------|
| ✅ Model-agnostic (any model) | ❌ Unstable (different runs → different explanations) |
| ✅ Intuitive explanations | ❌ Sampling-based (computationally expensive) |
| ✅ Works for any data type (tabular, text, images) | ❌ Local only (not global insights) |
| ✅ Fast compared to SHAP | ❌ Choice of perturbation affects results |
| ✅ Easy to explain to stakeholders | ❌ Linear approximation may not capture complex relationships |

---

## Comparison of Techniques

### Summary Table

| Technique | Scope | Model Type | Speed | Accuracy | Use Case |
|-----------|-------|------------|-------|----------|----------|
| **Feature Importance** | Global | Tree-based | ⚡⚡⚡ Fast | ⭐⭐ Medium | Quick overview |
| **Permutation Importance** | Global | Any | ⚡⚡ Medium | ⭐⭐⭐ High | Reliable global importance |
| **PDP** | Global | Any | ⚡⚡ Medium | ⭐⭐⭐ High | Understand feature effects |
| **SHAP** | Both | Any | ⚡ Slow | ⭐⭐⭐⭐ Very High | Detailed analysis |
| **LIME** | Local | Any | ⚡⚡ Medium | ⭐⭐ Medium | Quick local explanations |

### When to Use What?

```
Decision Tree:

Need global understanding?
  │
  ├─ Yes → Quick overview?
  │         │
  │         ├─ Yes → Feature Importance
  │         └─ No  → SHAP Summary Plot
  │
  └─ No (local) → Need exact values?
               │
               ├─ Yes → SHAP Force Plot
               └─ No  → LIME
```

### Combining Techniques

**Best Practice:** Use multiple techniques for comprehensive understanding

```python
# Workflow for a new model

# 1. Global Understanding
# Feature Importance (quick check)
importance = model.feature_importances_

# Permutation Importance (verify)
perm_imp = permutation_importance(model, X_test, y_test)

# PDP (understand relationships)
PartialDependenceDisplay.from_estimator(model, X_test, [0, 1, 2])

# SHAP Summary (detailed global view)
shap.summary_plot(shap_values, X_test)

# 2. Local Understanding (for specific predictions)
# SHAP Force Plot (accurate local explanation)
shap.force_plot(base_value, shap_values[i], X_test[i])

# LIME (alternative view)
lime_exp = explainer.explain_instance(X_test[i], model.predict_proba)

# 3. Debugging & Validation
# Check if explanations make sense
# Verify with domain experts
# Test on edge cases
```

---

## Practical Examples

### Example 1: Credit Scoring Explanation

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

# Create target (approved/denied) with logic
data['approved'] = (
    (data['credit_score'] > 650) &
    (data['debt_to_income'] < 0.4) &
    (data['annual_income'] > 30000)
).astype(int)

# Add some noise
noise_indices = np.random.choice(n_samples, size=int(0.1 * n_samples), replace=False)
data.loc[noise_indices, 'approved'] = 1 - data.loc[noise_indices, 'approved']

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

# ========== Explainability Analysis ==========

# 1. Feature Importance
print("\n" + "="*50)
print("Feature Importance")
print("="*50)
importance_df = pd.DataFrame({
    'feature': X.columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)
print(importance_df)

# 2. SHAP Analysis
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Global importance
print("\n" + "="*50)
print("SHAP Global Importance")
print("="*50)
shap_importance = pd.DataFrame({
    'feature': X.columns,
    'shap_importance': np.abs(shap_values).mean(axis=0)
}).sort_values('shap_importance', ascending=False)
print(shap_importance)

# 3. Explain Denial
print("\n" + "="*50)
print("Explaining a Denied Application")
print("="*50)

# Find a denied application
denied_idx = np.where(model.predict(X_test) == 0)[0][0]
applicant = X_test.iloc[denied_idx]
prediction = model.predict_proba(X_test.iloc[denied_idx:denied_idx+1])

print(f"\nApplicant Details:")
print(applicant)
print(f"\nPrediction: {'DENIED' if prediction[0][1] < 0.5 else 'APPROVED'}")
print(f"Approval Probability: {prediction[0][1]:.2%}")

# SHAP explanation
print(f"\nSHAP Explanation:")
shap_exp = shap_values[denied_idx]
for feature, value in zip(X.columns, shap_exp):
    print(f"  {feature:20s}: {value:+.4f}")

# Identify main reasons for denial
shap_df = pd.DataFrame({
    'feature': X.columns,
    'value': applicant.values,
    'shap': shap_exp
}).sort_values('shap')

print(f"\nTop Reasons for Denial:")
for _, row in shap_df.head(3).iterrows():
    print(f"  {row['feature']}: {row['value']:.2f} (SHAP: {row['shap']:.4f})")

# 4. What-If Analysis
print("\n" + "="*50)
print("What-If Analysis")
print("="*50)

# Create modified applicant
modified = applicant.copy()
modified['credit_score'] = 720  # Improve credit score

modified_pred = model.predict_proba(modified.values.reshape(1, -1))
print(f"\nIf credit score improved to 720:")
print(f"  New Approval Probability: {modified_pred[0][1]:.2%}")
print(f"  Change: {modified_pred[0][1] - prediction[0][1]:+.2%}")
```

### Example 2: Medical Diagnosis Explanation

```python
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
import shap
import lime.lime_tabular

# Load breast cancer dataset
data = load_breast_cancer()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

print(f"Model Accuracy: {model.score(X_test, y_test):.3f}")

# ========== Explain a Malignant Diagnosis ==========

# Find malignant case
malignant_idx = np.where(y_test == 1)[0][0]
patient = X_test[malignant_idx]
prediction = model.predict_proba(patient.reshape(1, -1))

print("\n" + "="*50)
print("Patient Diagnosis Explanation")
print("="*50)
print(f"Prediction: {'MALIGNANT' if prediction[0][1] > 0.5 else 'BENIGN'}")
print(f"Malignant Probability: {prediction[0][1]:.2%}")

# SHAP Explanation
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(patient.reshape(1, -1))

# For binary classification
if isinstance(shap_values, list):
    shap_values_class1 = shap_values[1][0]
else:
    shap_values_class1 = shap_values[0]

print("\nTop Features Contributing to Malignant Diagnosis:")
shap_df = pd.DataFrame({
    'feature': data.feature_names,
    'value': patient,
    'shap': shap_values_class1
}).sort_values('shap', ascending=False)

for _, row in shap_df.head(5).iterrows():
    print(f"  {row['feature']:30s}: {row['value']:.2f} (SHAP: {row['shap']:+.4f})")

# LIME Explanation
lime_explainer = lime.lime_tabular.LimeTabularExplainer(
    X_train,
    feature_names=data.feature_names,
    class_names=['benign', 'malignant'],
    mode='classification'
)

lime_exp = lime_explainer.explain_instance(
    patient,
    model.predict_proba,
    num_features=5
)

print("\nLIME Explanation:")
for feature, contribution in lime_exp.as_list():
    print(f"  {feature}: {contribution:+.4f}")

# Clinical Interpretation
print("\n" + "="*50)
print("Clinical Interpretation")
print("="*50)
print("Based on the model explanation:")
print("1. The tumor exhibits characteristics typical of malignancy")
print("2. Key indicators:")

for _, row in shap_df.head(3).iterrows():
    if row['shap'] > 0:
        print(f"   - Elevated {row['feature']}")
    else:
        print(f"   - Reduced {row['feature']}")

print("\n3. Recommendation: Further diagnostic tests and biopsy")
```

### Example 3: Customer Churn Prediction

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import shap

# Create synthetic churn data
np.random.seed(42)
n_customers = 1000

data = pd.DataFrame({
    'tenure': np.random.randint(1, 72, n_customers),  # months
    'monthly_charges': np.random.uniform(20, 120, n_customers),
    'total_charges': np.random.uniform(100, 8000, n_customers),
    'num_support_calls': np.random.randint(0, 10, n_customers),
    'contract_type': np.random.choice([0, 1, 2], n_customers),  # 0=month-to-month, 1=1yr, 2=2yr
    'satisfaction_score': np.random.randint(1, 6, n_customers),  # 1-5
})

# Create churn label with logic
churn_prob = (
    (data['tenure'] < 12) * 0.3 +
    (data['num_support_calls'] > 5) * 0.3 +
    (data['contract_type'] == 0) * 0.2 +
    (data['satisfaction_score'] < 3) * 0.3
)
data['churned'] = (np.random.random(n_customers) < churn_prob).astype(int)

# Split data
X = data.drop('churned', axis=1)
y = data['churned']
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

print(f"Model Accuracy: {model.score(X_test, y_test):.3f}")
print(f"Churn Rate: {y.mean():.2%}")

# ========== Identify At-Risk Customers ==========

# Predict churn probability
churn_probs = model.predict_proba(X_test)[:, 1]

# Find high-risk customers
high_risk_threshold = 0.7
high_risk_idx = np.where(churn_probs > high_risk_threshold)[0]

print(f"\n{len(high_risk_idx)} high-risk customers identified")

# SHAP Analysis
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# For binary classification
if isinstance(shap_values, list):
    shap_values_churn = shap_values[1]
else:
    shap_values_churn = shap_values

# Analyze first high-risk customer
if len(high_risk_idx) > 0:
    customer_idx = high_risk_idx[0]
    customer = X_test.iloc[customer_idx]
    churn_prob = churn_probs[customer_idx]

    print("\n" + "="*50)
    print("High-Risk Customer Analysis")
    print("="*50)
    print(f"Customer Details:")
    print(customer)
    print(f"\nChurn Probability: {churn_prob:.2%}")

    # SHAP explanation
    customer_shap = shap_values_churn[customer_idx]

    print("\nFactors Contributing to Churn Risk:")
    factor_df = pd.DataFrame({
        'factor': X.columns,
        'value': customer.values,
        'impact': customer_shap
    }).sort_values('impact', ascending=False)

    for _, row in factor_df.head(5).iterrows():
        direction = "increases" if row['impact'] > 0 else "decreases"
        print(f"  {row['factor']:20s}: {row['value']:6.2f} ({direction} risk by {abs(row['impact']):.4f})")

    # Retention Strategy
    print("\n" + "="*50)
    print("Retention Strategy Recommendations")
    print("="*50)

    top_risk_factors = factor_df.head(3)
    for _, row in top_risk_factors.iterrows():
        if row['factor'] == 'tenure' and row['value'] < 12:
            print("- Target: New customer (low tenure)")
            print("  Action: Offer onboarding discount or incentive")
        elif row['factor'] == 'num_support_calls' and row['value'] > 3:
            print("- Issue: High support calls")
            print("  Action: Proactive outreach to resolve issues")
        elif row['factor'] == 'satisfaction_score' and row['value'] < 3:
            print("- Issue: Low satisfaction")
            print("  Action: Customer success team intervention")
        elif row['factor'] == 'contract_type' and row['value'] == 0:
            print("- Issue: Month-to-month contract")
            print("  Action: Offer discount for annual commitment")
```

---

## Interview Questions

### Q1: What is model explainability and why is it important?

**Answer:**

**Model Explainability:** The ability to understand and explain how ML models make predictions.

**Why It's Important:**

1. **Trust & Adoption:**
   - Stakeholders need to trust model decisions
   - Users more likely to adopt explainable systems

2. **Debugging:**
   - Identify model errors and biases
   - Understand when model fails

3. **Compliance & Regulations:**
   - GDPR: Right to explanation
   - Fair lending laws: Must explain denials
   - Medical: Doctors need to verify diagnoses

4. **Business Insights:**
   - Understand what drives predictions
   - Discover patterns for business strategy

5. **Model Improvement:**
   - Identify important features
   - Guide feature engineering

**Example:**
```
Credit Denial Without Explanation:
"Your loan application was denied."
→ Customer frustrated, files complaint

Credit Denial With Explanation:
"Denied due to:
 - Credit score: 580 (below 650 threshold)
 - Debt-to-income ratio: 45% (above 40% limit)"
→ Customer understands, works on improving credit
```

---

### Q2: Explain the difference between global and local interpretability.

**Answer:**

| Aspect | Global Interpretability | Local Interpretability |
|--------|-------------------------|------------------------|
| **Scope** | Entire model behavior | Single prediction |
| **Question** | "What does the model learn overall?" | "Why this specific prediction?" |
| **Techniques** | Feature importance, PDP, Global SHAP | LIME, Local SHAP, Force plots |
| **Use Case** | Understanding model patterns | Explaining individual decisions |

**Examples:**

**Global:**
```
"Credit score is the most important feature overall
 (45% of model's decisions based on credit score)"

Useful for:
- Understanding model strategy
- Feature selection
- Model validation
```

**Local:**
```
"John's loan was denied because:
 - His credit score (550) contributed -0.8 to denial
 - His income ($80K) contributed +0.3 to approval
 - Net effect: Denial"

Useful for:
- Explaining decisions to customers
- Debugging specific cases
- Identifying edge cases
```

**When to Use:**
- **Global:** Model development, feature engineering, overall validation
- **Local:** Customer explanations, debugging individual predictions, appeals

---

### Q3: What is SHAP and how does it differ from LIME?

**Answer:**

**SHAP (SHapley Additive exPlanations):**
- Based on game theory (Shapley values)
- Assigns each feature a contribution value
- Theoretically sound and consistent

**LIME (Local Interpretable Model-agnostic Explanations):**
- Approximates model locally with simple linear model
- Samples around instance and fits linear approximation
- Faster but less stable

**Comparison:**

| Aspect | SHAP | LIME |
|--------|------|------|
| **Theory** | Game theory (Shapley values) | Local linear approximation |
| **Consistency** | Always consistent | Can be inconsistent |
| **Stability** | Stable (same input → same output) | Unstable (sampling variance) |
| **Speed** | Slow (especially KernelSHAP) | Faster |
| **Accuracy** | Very accurate | Approximate |
| **Scope** | Global + Local | Local only |
| **Model Types** | Any (TreeExplainer fast for trees) | Any |

**Example:**

```python
# SHAP
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)
# Exact, consistent, but slower

# LIME
explainer = lime.lime_tabular.LimeTabularExplainer(X_train)
exp = explainer.explain_instance(X_test[0], model.predict_proba)
# Faster, but may vary between runs
```

**When to Use:**
- **SHAP:** When you need accurate, consistent explanations and can afford computation time
- **LIME:** When you need quick explanations and can tolerate some variance

**Best Practice:** Use both and compare for validation

---

### Q4: How do you explain feature importance to non-technical stakeholders?

**Answer:**

**Approach:**

1. **Use Simple Language:**
   ```
   ❌ "This feature has a Gini importance of 0.45"
   ✅ "Credit score influences 45% of loan decisions"
   ```

2. **Visual Representations:**
   ```
   Show bar charts or tables:

   Feature              Impact
   ────────────────────────────
   Credit Score         ████████████  45%
   Annual Income        ████████      30%
   Debt Ratio           ███           15%
   Employment Length    ██            10%
   ```

3. **Real Examples:**
   ```
   "Let's look at John's application:

   John was denied because:
   1. Credit score: 550 (below our 650 threshold)
      → This alone reduced approval chance by 80%

   2. High debt ratio: 45% (we prefer < 40%)
      → This reduced approval chance by 10%

   3. Short employment: 6 months (we prefer 2+ years)
      → Minor impact, reduced by 5%"
   ```

4. **Business Impact:**
   ```
   "By focusing on credit score:
   - We correctly identify 95% of risky loans
   - We reduce default rate by 30%
   - We save $2M annually in bad loans"
   ```

5. **Actionable Insights:**
   ```
   "To improve your chances:
   1. Raise credit score above 650
   2. Pay down debt to reduce debt-to-income ratio
   3. Wait until 2+ years employment"
   ```

**Framework:**
```
1. What: "Credit score is most important"
2. Why: "Because it predicts repayment ability"
3. How Much: "Influences 45% of decisions"
4. Example: "John denied due to 550 score"
5. Action: "Raise score above 650 to qualify"
```

---

### Q5: What are the limitations of current explainability techniques?

**Answer:**

**General Limitations:**

1. **Correlation vs Causation:**
   ```
   Feature importance shows correlation, not causation

   Example:
   "Ice cream sales" highly important for "drowning deaths"
   → Both caused by summer weather (confounding variable)
   → Doesn't mean ice cream causes drowning!
   ```

2. **Simplification:**
   ```
   Complex models reduced to simple explanations
   → May miss nuanced interactions
   → Linear approximations of non-linear relationships
   ```

3. **Computational Cost:**
   ```
   SHAP: O(2^n) for exact calculation
   → Slow for many features
   → Need approximations for large datasets
   ```

**Technique-Specific:**

**Feature Importance:**
- ❌ Biased toward high-cardinality features
- ❌ Doesn't show direction of effect
- ❌ Can be misleading with correlated features

**Permutation Importance:**
- ❌ Expensive computation
- ❌ Unstable with small datasets
- ❌ Affected by feature correlations

**PDP:**
- ❌ Assumes feature independence
- ❌ Misleading with correlated features
- ❌ Only shows average effect

**SHAP:**
- ❌ Computationally expensive
- ❌ Difficult to explain to non-technical users
- ❌ KernelSHAP approximation errors

**LIME:**
- ❌ Unstable (different runs → different results)
- ❌ Linear approximation may miss complexity
- ❌ Choice of perturbation affects results

**What-If Analysis:**
- ❌ Can't explore all possibilities
- ❌ Ignores feature dependencies

**Mitigation Strategies:**

1. **Use Multiple Techniques:**
   ```python
   # Compare results
   feature_imp = model.feature_importances_
   perm_imp = permutation_importance(model, X, y)
   shap_imp = np.abs(shap_values).mean(axis=0)

   # Look for consensus
   ```

2. **Validate with Domain Experts:**
   ```
   "Does this explanation make sense from business perspective?"
   ```

3. **Test on Known Cases:**
   ```
   Use cases where you know the answer
   Verify explanations match expectations
   ```

4. **Be Transparent:**
   ```
   "This explanation is an approximation"
   "Results may vary slightly between runs"
   ```

---

### Q6: How would you implement model explainability in a production system?

**Answer:**

**Architecture:**

```
Production System with Explainability:

User Request
    │
    ▼
┌─────────────────────┐
│  API Gateway        │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  Prediction Service │
│  - Load model       │
│  - Make prediction  │
└─────────────────────┘
    │
    ├──────────────────────┐
    │                      │
    ▼                      ▼
┌─────────────────┐  ┌──────────────────┐
│  Return         │  │  Explanation     │
│  Prediction     │  │  Service         │
└─────────────────┘  │  - SHAP/LIME     │
                     │  - Cache results │
                     └──────────────────┘
                            │
                            ▼
                     ┌──────────────────┐
                     │  Store           │
                     │  Explanations    │
                     └──────────────────┘
```

**Implementation Steps:**

**1. Pre-compute When Possible:**
```python
# Pre-compute SHAP explainer
import shap
import joblib

# Train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Create and save explainer
explainer = shap.TreeExplainer(model)
joblib.dump(explainer, 'explainer.pkl')
joblib.dump(model, 'model.pkl')
```

**2. API Endpoint:**
```python
from fastapi import FastAPI
import joblib
import shap
import numpy as np

app = FastAPI()

# Load model and explainer at startup
model = joblib.load('model.pkl')
explainer = joblib.load('explainer.pkl')

@app.post("/predict")
async def predict_with_explanation(data: dict):
    # Extract features
    features = np.array([data['features']])

    # Prediction
    prediction = model.predict_proba(features)[0]

    # Explanation
    shap_values = explainer.shap_values(features)
    if isinstance(shap_values, list):
        shap_values = shap_values[1][0]
    else:
        shap_values = shap_values[0]

    # Format response
    explanation = {
        'prediction': {
            'class': int(prediction.argmax()),
            'probability': float(prediction.max())
        },
        'explanation': {
            'feature_contributions': [
                {
                    'feature': name,
                    'value': float(val),
                    'shap': float(shap_val)
                }
                for name, val, shap_val in zip(
                    data['feature_names'],
                    features[0],
                    shap_values
                )
            ],
            'top_factors': sorted([
                {
                    'feature': name,
                    'impact': float(shap_val)
                }
                for name, shap_val in zip(data['feature_names'], shap_values)
            ], key=lambda x: abs(x['impact']), reverse=True)[:5]
        }
    }

    return explanation
```

**3. Caching:**
```python
from functools import lru_cache
import hashlib

def hash_features(features):
    """Create hash of features for caching"""
    return hashlib.md5(str(features).encode()).hexdigest()

# In-memory cache
explanation_cache = {}

def get_explanation(features):
    feature_hash = hash_features(features)

    if feature_hash in explanation_cache:
        return explanation_cache[feature_hash]

    # Compute explanation
    explanation = compute_shap_explanation(features)

    # Cache result
    explanation_cache[feature_hash] = explanation

    return explanation
```

**4. Monitoring:**
```python
import logging

logger = logging.getLogger(__name__)

@app.post("/predict")
async def predict_with_explanation(data: dict):
    try:
        # Log request
        logger.info(f"Prediction request: {data}")

        # Make prediction
        result = model.predict(features)

        # Compute explanation
        explanation = get_explanation(features)

        # Log explanation
        logger.info(f"Explanation: {explanation['top_factors']}")

        return {
            'prediction': result,
            'explanation': explanation
        }

    except Exception as e:
        logger.error(f"Error in prediction: {e}")
        raise
```

**5. Testing:**
```python
import pytest

def test_explanation_consistency():
    """Test that same input gives same explanation"""
    features = np.array([[1, 2, 3, 4, 5]])

    exp1 = get_explanation(features)
    exp2 = get_explanation(features)

    assert exp1 == exp2

def test_explanation_validity():
    """Test that SHAP values sum to prediction difference"""
    features = np.array([[1, 2, 3, 4, 5]])

    shap_values = explainer.shap_values(features)[0]
    base_value = explainer.expected_value
    prediction = model.predict_proba(features)[0][1]

    # SHAP property: prediction = base_value + sum(shap_values)
    assert np.isclose(
        prediction,
        base_value + shap_values.sum(),
        rtol=0.01
    )
```

**Best Practices:**

1. **Separate Explainability Service:** Don't slow down predictions
2. **Cache Results:** Explanations for same input
3. **Async Processing:** Compute explanations in background
4. **Monitor Performance:** Track explanation computation time
5. **Version Control:** Track explainer versions with models
6. **Documentation:** Explain to users how to interpret results

---

## Key Takeaways

1. **Explainability is Critical:**
   - Trust, compliance, debugging, insights
   - Required for high-stakes decisions (credit, medical, hiring)

2. **Global vs Local:**
   - Global: Overall model behavior
   - Local: Individual predictions

3. **Main Techniques:**
   - Feature Importance: Quick overview (tree-based)
   - Permutation Importance: Reliable global importance (any model)
   - PDP: Understand feature effects
   - SHAP: Accurate global + local (any model)
   - LIME: Fast local approximations (any model)

4. **SHAP is Gold Standard:**
   - Theoretically sound (Shapley values)
   - Consistent and accurate
   - Beautiful visualizations
   - Computationally expensive

5. **LIME for Speed:**
   - Fast local explanations
   - Good for quick insights
   - Less stable than SHAP

6. **Use Multiple Techniques:**
   - Validate explanations
   - Different perspectives
   - Build confidence

7. **Production Considerations:**
   - Pre-compute when possible
   - Cache results
   - Monitor performance
   - Test consistency

---

**Navigation:** [← NoSQL/MongoDB](./nosql-mongodb.md) | [Back to Index](./README.md) | [Next: FastAPI →](./fastapi.md)
