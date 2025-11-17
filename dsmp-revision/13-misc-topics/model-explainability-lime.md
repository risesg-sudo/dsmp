# LIME - Local Interpretable Model-Agnostic Explanations

## What You'll Learn

Discover how to explain any model's predictions by approximating it locally with simpler, interpretable models. LIME offers a clever approach: instead of trying to understand the entire complex model, it creates a simple linear model that mimics the complex model's behavior around specific predictions. This guide will show you how LIME generates explanations quickly, works with any data type from tabular to text to images, and when its speed advantages outweigh its instability concerns.

---

## Understanding LIME

### What is LIME?

**LIME (Local Interpretable Model-agnostic Explanations):** Explains individual predictions by approximating the complex model locally with a simple, interpretable linear model.

**Key Insight:**
```
Complex Model (Black Box)
         ↓
    [LIME Process]
         ↓
Simple Linear Model (locally around prediction)
         ↓
Easy to interpret coefficients
```

### The Core Concept

**Global Problem:** Complex models are hard to understand globally

**LIME Solution:** Don't try to understand the whole model - just understand it locally around the prediction you care about

```
Globally:
  Complex decision boundary (impossible to understand)

Locally (around one point):
  Approximately linear (easy to understand!)
```

---

## How LIME Works

### The Algorithm

```
Step 1: Select instance to explain
  Example: Customer denied loan

Step 2: Generate perturbed samples around instance
  Create 5000 slightly different versions
  [age ± 2, income ± $5K, credit_score ± 10, ...]

Step 3: Get predictions from black box model
  Pass all 5000 samples through complex model
  Get predictions for each

Step 4: Weight samples by proximity to original
  Close samples → High weight (important)
  Far samples → Low weight (less important)

Step 5: Train simple linear model on weighted samples
  prediction = β₀ + β₁(age) + β₂(income) + β₃(credit_score)

Step 6: Explain using linear model coefficients
  β₃ = 0.5  ← Credit score most important for THIS prediction
```

### Visual Example

```
Original Sample to Explain:
  [age=30, income=50K, credit_score=700]
        ↓
Generate Perturbations:
  Sample 1: [age=28, income=52K, credit_score=705]
  Sample 2: [age=32, income=48K, credit_score=695]
  Sample 3: [age=31, income=51K, credit_score=700]
  Sample 4: [age=29, income=49K, credit_score=710]
  ... (5000 total samples)
        ↓
Get Black Box Predictions:
  Sample 1 → 0.85 (approved)
  Sample 2 → 0.80 (approved)
  Sample 3 → 0.90 (approved)
  Sample 4 → 0.88 (approved)
  ...
        ↓
Weight by Distance from Original:
  Sample 1 (distance=3.5) → weight=0.95
  Sample 2 (distance=4.2) → weight=0.90
  ... (closer = higher weight)
        ↓
Train Linear Model (weighted):
  prediction = 0.1 + 0.02(age) + 0.0001(income) + 0.005(credit_score)
        ↓
Explain:
  Credit score coefficient (0.005) is highest
  → Credit score most important for THIS prediction!
```

---

## LIME Implementation

### Setup and Installation

```python
# Install LIME
# pip install lime

import lime
import lime.lime_tabular
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
import numpy as np
import matplotlib.pyplot as plt
```

### Basic LIME for Tabular Data

```python
# Load data
data = load_breast_cancer()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

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
    num_features=10,      # Explain top 10 features
    num_samples=5000      # Number of perturbed samples
)

# Show explanation
print("Prediction:", rf.predict_proba(X_test[i].reshape(1, -1)))
print("\nExplanation:")
print(exp.as_list())

# Visualize in notebook
# exp.show_in_notebook(show_table=True)

# Save as matplotlib figure
fig = exp.as_pyplot_figure()
plt.tight_layout()
plt.savefig('lime_explanation.png')

# Get feature importance dictionary
importance = dict(exp.as_list())
print("\nFeature Contributions:")
for feature, value in importance.items():
    direction = "increases" if value > 0 else "decreases"
    print(f"  {feature}: {value:+.4f} ({direction} prediction)")
```

### Understanding LIME Output

```
Example Output:

Prediction: [[0.05 0.95]]  ← 95% probability of malignant

Feature Contributions:
  worst radius > 20.0          →  +0.35  (increases malignant prob)
  mean concave points > 0.1    →  +0.25
  worst perimeter > 120        →  +0.20
  mean texture < 15            →  -0.05  (decreases malignant prob)
  worst area > 800             →  +0.15

Interpretation:
  This tumor predicted malignant because:
  - Large radius (worst radius > 20)
  - High concave points (indicates irregular shape)
  - Large perimeter

  Even though mean texture is low (slightly reducing risk),
  other factors strongly indicate malignancy.
```

### Customizing LIME

```python
# More control over explanation
exp = explainer.explain_instance(
    X_test[i],
    rf.predict_proba,
    num_features=10,
    num_samples=5000,
    distance_metric='euclidean',  # How to measure similarity
    model_regressor=None          # Linear model type (default: Ridge)
)

# Get explanation as different formats
exp_list = exp.as_list()           # List of (feature, weight) tuples
exp_map = exp.as_map()             # Dict mapping class to explanations
exp_html = exp.as_html()           # HTML representation

# Get intercept and local prediction
intercept = exp.intercept[1]       # Base prediction
local_pred = exp.local_pred[0]     # Linear model's prediction
```

---

## LIME for Text Classification

### Text Example

```python
from lime.lime_text import LimeTextExplainer
from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Sample text classification data
texts = [
    "This movie is great! I loved it.",
    "Terrible film, complete waste of time.",
    "Amazing performance by the actors.",
    "Boring and predictable plot.",
    "Fantastic cinematography and story.",
    "Worst movie I've ever seen."
]
labels = [1, 0, 1, 0, 1, 0]  # 1 = positive, 0 = negative

# Create and train pipeline
vectorizer = TfidfVectorizer()
classifier = LogisticRegression()
pipeline = make_pipeline(vectorizer, classifier)
pipeline.fit(texts, labels)

# Create LIME text explainer
explainer = LimeTextExplainer(class_names=['negative', 'positive'])

# Explain prediction
text_to_explain = "This movie is absolutely fantastic and amazing!"
exp = explainer.explain_instance(
    text_to_explain,
    pipeline.predict_proba,
    num_features=6,
    num_samples=2000
)

print("Text:", text_to_explain)
print("Prediction:", pipeline.predict_proba([text_to_explain]))
print("\nWord Contributions:")
for word, contribution in exp.as_list():
    print(f"  '{word}': {contribution:+.4f}")

# Example output:
# 'fantastic': +0.45  ← Strong positive indicator
# 'amazing': +0.35    ← Strong positive indicator
# 'movie': +0.10      ← Slightly positive context
# 'absolutely': +0.08
```

### Understanding Text Explanations

```
Original text: "This movie is absolutely fantastic and amazing!"

LIME process:
1. Remove words randomly to create variants:
   - "This movie is fantastic amazing!"
   - "This is absolutely fantastic and amazing!"
   - "This movie is absolutely and amazing!"
   - ... (2000 variants)

2. Get predictions for all variants
3. Train linear model on which words present → prediction
4. Words with high coefficients are important

Result:
  "fantastic" and "amazing" drive positive prediction
  Removing them would flip to negative
```

---

## LIME for Images

### Image Classification Example

```python
from lime import lime_image
from skimage.segmentation import mark_boundaries
import numpy as np

# Assume we have:
# - model: trained image classifier
# - image: input image to explain

# Create image explainer
explainer = lime_image.LimeImageExplainer()

# Explain prediction
explanation = explainer.explain_instance(
    image,
    model.predict_proba,
    top_labels=5,
    hide_color=0,
    num_samples=1000
)

# Get explanation for top predicted class
temp, mask = explanation.get_image_and_mask(
    explanation.top_labels[0],
    positive_only=True,
    num_features=5,
    hide_rest=False
)

# Visualize
plt.imshow(mark_boundaries(temp, mask))
plt.title('LIME Explanation - Positive Regions')
plt.savefig('lime_image_explanation.png')
```

**Interpretation:** Highlighted regions are what the model "looks at" to make its prediction.

---

## Practical Example: Credit Scoring

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
import lime.lime_tabular

# Create synthetic credit data
np.random.seed(42)
n_samples = 1000

data = pd.DataFrame({
    'credit_score': np.random.randint(300, 850, n_samples),
    'annual_income': np.random.randint(20000, 150000, n_samples),
    'age': np.random.randint(18, 70, n_samples),
    'debt_to_income': np.random.uniform(0, 1, n_samples),
    'employment_years': np.random.randint(0, 30, n_samples),
})

data['approved'] = (
    (data['credit_score'] > 650) &
    (data['debt_to_income'] < 0.4) &
    (data['annual_income'] > 30000)
).astype(int)

# Split and train
X = data.drop('approved', axis=1)
y = data['approved']
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = GradientBoostingClassifier(random_state=42)
model.fit(X_train, y_train)

# Create LIME explainer
explainer = lime.lime_tabular.LimeTabularExplainer(
    X_train.values,
    feature_names=X.columns.tolist(),
    class_names=['denied', 'approved'],
    mode='classification'
)

# Find a denied application to explain
denied_idx = np.where(model.predict(X_test) == 0)[0][0]
denied_applicant = X_test.iloc[denied_idx]

print("Explaining Denied Application")
print("=" * 60)
print("\nApplicant Profile:")
for feature, value in denied_applicant.items():
    print(f"  {feature:20s}: {value:.2f}")

# Get prediction
prob = model.predict_proba(denied_applicant.values.reshape(1, -1))[0]
print(f"\nPrediction: DENIED (approval probability: {prob[1]:.2%})")

# Explain with LIME
exp = explainer.explain_instance(
    denied_applicant.values,
    model.predict_proba,
    num_features=5
)

print("\nLIME Explanation - Top 5 Factors:")
print("-" * 60)
for feature_rule, contribution in exp.as_list():
    direction = "favors approval" if contribution > 0 else "leads to denial"
    print(f"  {feature_rule:40s}: {contribution:+.4f} ({direction})")

# Generate recommendation
print("\nRecommendations to Improve Approval Chances:")
print("-" * 60)
for feature_rule, contribution in exp.as_list():
    if contribution < -0.1:  # Significant negative impact
        print(f"  - {feature_rule} is hurting your application")
        print(f"    Consider improving this factor\n")
```

---

## LIME Limitations

### Instability

```python
# Problem: Different runs can give different explanations
exp1 = explainer.explain_instance(X_test[0], model.predict_proba)
exp2 = explainer.explain_instance(X_test[0], model.predict_proba)

# exp1 and exp2 might differ due to random sampling!

# Solution: Use more samples for stability
exp = explainer.explain_instance(
    X_test[0],
    model.predict_proba,
    num_samples=10000  # More samples = more stable
)
```

### Linear Approximation Limitations

```
Complex Model Boundary:     LIME Approximation:
    ╱╲                         ╱
   ╱  ╲                       ╱
  ╱    ╲                     ╱
 ╱      ╲                   ╱
──────────                ──────────

LIME assumes locally linear → may miss complex patterns
```

### Feature Independence Assumption

```
LIME perturbs features independently
Problem: Features are often correlated

Example:
  Age=25, Income=$200K ← LIME might create this
  (Unrealistic combination for most datasets)

Impact: Explanations might be based on unrealistic scenarios
```

---

## LIME vs SHAP

### Quick Comparison

| Aspect | LIME | SHAP |
|--------|------|------|
| **Speed** | Faster | Slower (except TreeSHAP) |
| **Stability** | Unstable | Stable |
| **Theory** | Heuristic | Game theory |
| **Scope** | Local only | Global + Local |
| **Accuracy** | Approximate | Exact (for TreeSHAP) |
| **Use Case** | Quick insights | Rigorous analysis |

### When to Use LIME

**Use LIME When:**
- Need quick explanations
- Can tolerate some variance
- Working with images or text
- Want model-agnostic approach
- Computational resources limited

**Use SHAP When:**
- Need exact explanations
- High-stakes decisions
- Want both global and local insights
- Can afford computation time
- Need theoretical guarantees

---

## Best Practices

### Ensuring Stability

```python
# Run multiple times and aggregate
explanations = []
for _ in range(10):
    exp = explainer.explain_instance(
        X_test[0],
        model.predict_proba,
        num_samples=5000
    )
    explanations.append(dict(exp.as_list()))

# Check consistency
# If results vary significantly → increase num_samples
```

### Choosing num_samples

```python
# Trade-off: Speed vs Accuracy
num_samples=1000   # Fast but less stable
num_samples=5000   # Balanced (recommended)
num_samples=10000  # Slow but very stable
```

### Validating Explanations

```python
# Check if LIME's linear approximation is good
# Compare LIME's predicted probability with model's
lime_pred = exp.local_pred[0]
model_pred = model.predict_proba(X_test[i].reshape(1, -1))[0][1]

print(f"LIME prediction: {lime_pred:.4f}")
print(f"Model prediction: {model_pred:.4f}")
print(f"Difference: {abs(lime_pred - model_pred):.4f}")

# Small difference → Good approximation
# Large difference → Linear assumption violated
```

---

## Quick Reference

### LIME Cheat Sheet

```python
import lime.lime_tabular

# Create explainer
explainer = lime.lime_tabular.LimeTabularExplainer(
    X_train, feature_names=features, mode='classification'
)

# Explain prediction
exp = explainer.explain_instance(
    X_test[0], model.predict_proba, num_features=10
)

# Get results
exp.as_list()  # Feature contributions
exp.show_in_notebook()  # Visual
```

### Pros and Cons

| Pros | Cons |
|------|------|
| Model-agnostic (any model) | Unstable (sampling variance) |
| Intuitive explanations | Local only (no global insights) |
| Works with any data type | Linear approximation limits |
| Faster than SHAP | Choice of perturbation affects results |
| Easy to explain to stakeholders | Less theoretically rigorous |

---

## Navigation

[← Previous: SHAP Values](./model-explainability-shap.md) | [Back to Index](./README.md) | [Next: Interview Questions →](./model-explainability-interview.md)
