# Handling Imbalanced Data

## 📖 Table of Contents
- [Introduction](#introduction)
- [Understanding Imbalanced Data](#understanding-imbalanced-data)
- [Resampling Techniques](#resampling-techniques)
- [Algorithm-Level Approaches](#algorithm-level-approaches)
- [Evaluation Metrics](#evaluation-metrics)
- [Practical Examples](#practical-examples)
- [Interview Questions](#interview-questions)

---

## Introduction

Imbalanced data occurs when one class significantly outnumbers another in a dataset. This is common in:
- **Fraud Detection:** 0.1% fraudulent transactions
- **Medical Diagnosis:** 1-5% disease prevalence
- **Churn Prediction:** 10-20% churn rate
- **Anomaly Detection:** <1% anomalies

### The Problem

```
Dataset: Credit Card Transactions
┌─────────────────────────────────────┐
│ Legitimate: 99,700 (99.7%)    ████ │
│ Fraudulent:     300 (0.3%)    █    │
└─────────────────────────────────────┘

Model predicts everything as "legitimate"
→ 99.7% accuracy but catches 0% fraud! ❌
```

---

## Understanding Imbalanced Data

### Imbalance Ratio

```python
import numpy as np
import pandas as pd
from collections import Counter

def check_imbalance(y):
    """Check class distribution"""
    counter = Counter(y)
    total = sum(counter.values())

    print("Class Distribution:")
    for cls, count in counter.items():
        percentage = (count / total) * 100
        print(f"  Class {cls}: {count:,} ({percentage:.2f}%)")

    # Imbalance ratio
    majority = max(counter.values())
    minority = min(counter.values())
    ratio = majority / minority
    print(f"\nImbalance Ratio: {ratio:.2f}:1")

    return ratio

# Example
y = np.array([0]*9900 + [1]*100)
check_imbalance(y)
```

**Output:**
```
Class Distribution:
  Class 0: 9,900 (99.00%)
  Class 1: 100 (1.00%)

Imbalance Ratio: 99.00:1
```

### Decision Tree: When is Data Imbalanced?

```
                    Start
                      │
                      ▼
            What's the ratio?
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
    < 3:1          3:1 to         > 10:1
  Balanced      10:1 Mild       Severe
                Imbalance      Imbalance
                   │               │
                   ▼               ▼
              Use class      Use resampling
              weights         techniques
```

---

## Resampling Techniques

### 1. Random Oversampling

**Concept:** Randomly duplicate minority class samples

```python
from imblearn.over_sampling import RandomOverSampler
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

# Create imbalanced dataset
X, y = make_classification(
    n_samples=10000,
    n_features=20,
    n_informative=15,
    n_redundant=5,
    n_classes=2,
    weights=[0.95, 0.05],
    random_state=42
)

print(f"Original distribution: {Counter(y)}")

# Apply Random Oversampling
ros = RandomOverSampler(random_state=42)
X_resampled, y_resampled = ros.fit_resample(X, y)

print(f"Resampled distribution: {Counter(y_resampled)}")
```

**Pros & Cons:**

| Pros | Cons |
|------|------|
| ✅ Simple to implement | ❌ Overfitting (duplicate samples) |
| ✅ No data loss | ❌ Longer training time |
| ✅ Works with any algorithm | ❌ No new information added |

---

### 2. Random Undersampling

**Concept:** Randomly remove majority class samples

```python
from imblearn.under_sampling import RandomUnderSampler

# Apply Random Undersampling
rus = RandomUnderSampler(random_state=42)
X_resampled, y_resampled = rus.fit_resample(X, y)

print(f"Original: {Counter(y)}")
print(f"Undersampled: {Counter(y_resampled)}")
```

**Visual Representation:**

```
Before Undersampling:
Majority: ████████████████████ (1000 samples)
Minority: ██ (50 samples)

After Undersampling:
Majority: ██ (50 samples) ← Removed 950 samples
Minority: ██ (50 samples)
```

**Pros & Cons:**

| Pros | Cons |
|------|------|
| ✅ Fast training | ❌ Information loss |
| ✅ Reduces overfitting | ❌ May miss important patterns |
| ✅ Balanced dataset | ❌ Not suitable for small datasets |

---

### 3. SMOTE (Synthetic Minority Over-sampling Technique)

**Concept:** Generate synthetic samples by interpolating between minority class neighbors

**Algorithm:**
```
For each minority sample:
  1. Find k nearest neighbors (k=5 default)
  2. Randomly select one neighbor
  3. Create synthetic sample:
     new_sample = sample + λ × (neighbor - sample)
     where λ ∈ [0, 1]
```

**Visual:**
```
Original Minority Samples:      SMOTE Synthetic Samples:
        ●                              ◉
                                    ●     ◉
    ●           ●                 ●    ◉    ●
                                    ◉     ◉
        ●                              ◉
```

**Implementation:**

```python
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

# Apply SMOTE
smote = SMOTE(random_state=42, k_neighbors=5)
X_smote, y_smote = smote.fit_resample(X, y)

print(f"Original: {Counter(y)}")
print(f"After SMOTE: {Counter(y_smote)}")

# Train model
X_train, X_test, y_train, y_test = train_test_split(
    X_smote, y_smote, test_size=0.2, random_state=42
)

model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print("\nClassification Report:")
print(classification_report(y_test, y_pred))
```

**SMOTE Variants:**

```python
# 1. Borderline-SMOTE (focus on border samples)
from imblearn.over_sampling import BorderlineSMOTE
bsmote = BorderlineSMOTE(random_state=42)
X_bs, y_bs = bsmote.fit_resample(X, y)

# 2. SVM-SMOTE (use SVM to find border samples)
from imblearn.over_sampling import SVMSMOTE
svmsmote = SVMSMOTE(random_state=42)
X_svm, y_svm = svmsmote.fit_resample(X, y)

# 3. ADASYN (Adaptive Synthetic Sampling)
from imblearn.over_sampling import ADASYN
adasyn = ADASYN(random_state=42)
X_ada, y_ada = adasyn.fit_resample(X, y)
```

**Pros & Cons:**

| Pros | Cons |
|------|------|
| ✅ Creates new synthetic samples | ❌ Can create unrealistic samples |
| ✅ Reduces overfitting vs duplication | ❌ Computationally expensive |
| ✅ Works well in practice | ❌ May not work well with high dimensions |
| ✅ Many variants available | ❌ Can increase noise |

---

### 4. ADASYN (Adaptive Synthetic Sampling)

**Concept:** Similar to SMOTE but generates more samples for harder-to-learn minority samples

**Key Difference from SMOTE:**
```
SMOTE:   Uniform sampling (same number for all minority samples)
ADASYN:  Adaptive sampling (more for difficult-to-learn samples)

Density-based weighting:
  Low density region (harder to learn)  → More synthetic samples
  High density region (easier to learn) → Fewer synthetic samples
```

**Implementation:**

```python
from imblearn.over_sampling import ADASYN

# Apply ADASYN
adasyn = ADASYN(random_state=42, n_neighbors=5)
X_adasyn, y_adasyn = adasyn.fit_resample(X, y)

print(f"Original: {Counter(y)}")
print(f"After ADASYN: {Counter(y_adasyn)}")
```

**When to Use:**
- Dataset has varying minority class densities
- Some minority regions are harder to classify
- You want adaptive synthetic sample generation

---

### 5. Tomek Links (Undersampling)

**Concept:** Remove majority class samples that are close to minority class (cleaning boundary)

**Algorithm:**
```
Tomek Link = Pair of samples (A, B) where:
  - A is from majority class
  - B is from minority class
  - They are each other's nearest neighbors

Remove A (majority) to clean the boundary
```

**Visual:**
```
Before:                After:
Majority: ■            Majority: ■
Minority: ●            Minority: ●

■ ● ■  → Remove ■      ●         ← Cleaner boundary
```

```python
from imblearn.under_sampling import TomekLinks

# Apply Tomek Links
tomek = TomekLinks()
X_tomek, y_tomek = tomek.fit_resample(X, y)

print(f"Removed {len(y) - len(y_tomek)} samples")
print(f"Distribution: {Counter(y_tomek)}")
```

---

### 6. Combination: SMOTE + Tomek/ENN

**Best Practice:** Combine oversampling and undersampling

```python
from imblearn.combine import SMOTETomek, SMOTEENN

# SMOTE + Tomek Links
smote_tomek = SMOTETomek(random_state=42)
X_st, y_st = smote_tomek.fit_resample(X, y)

# SMOTE + Edited Nearest Neighbors
smote_enn = SMOTEENN(random_state=42)
X_se, y_se = smote_enn.fit_resample(X, y)

print("SMOTE + Tomek:", Counter(y_st))
print("SMOTE + ENN:", Counter(y_se))
```

**Pipeline:**
```
Original Data
      │
      ▼
  Apply SMOTE (Oversample minority)
      │
      ▼
  Apply Tomek/ENN (Clean boundaries)
      │
      ▼
  Cleaned Balanced Data
```

---

## Algorithm-Level Approaches

### 1. Class Weights

**Concept:** Penalize misclassification of minority class more heavily

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.utils.class_weight import compute_class_weight

# Calculate class weights
class_weights = compute_class_weight(
    'balanced',
    classes=np.unique(y),
    y=y
)
class_weight_dict = dict(enumerate(class_weights))
print(f"Class weights: {class_weight_dict}")

# Method 1: Use 'balanced' parameter
model = RandomForestClassifier(class_weight='balanced', random_state=42)
model.fit(X_train, y_train)

# Method 2: Specify custom weights
model = LogisticRegression(class_weight={0: 1, 1: 99}, random_state=42)
model.fit(X_train, y_train)

# Method 3: Manual weights in loss function (for neural networks)
import torch.nn as nn
criterion = nn.CrossEntropyLoss(weight=torch.tensor([1.0, 99.0]))
```

**How it Works:**
```
Cost Function with Class Weights:

Without weights: Loss = Σ L(y, ŷ)
With weights:    Loss = Σ w_i × L(y_i, ŷ_i)

Example:
  Majority class (0): w = 0.5
  Minority class (1): w = 50.0

Misclassifying minority costs 100× more!
```

**Pros & Cons:**

| Pros | Cons |
|------|------|
| ✅ No data modification | ❌ May not work well with all algorithms |
| ✅ Fast (no resampling) | ❌ Requires hyperparameter tuning |
| ✅ Works with online learning | ❌ Can lead to overfitting minority |

---

### 2. Stratified Sampling

**Concept:** Maintain class distribution in train/test splits

```python
from sklearn.model_selection import StratifiedKFold, train_test_split

# Stratified train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    stratify=y,  # ← Maintains class distribution
    random_state=42
)

print("Train distribution:", Counter(y_train))
print("Test distribution:", Counter(y_test))

# Stratified K-Fold
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

for fold, (train_idx, val_idx) in enumerate(skf.split(X, y)):
    print(f"Fold {fold + 1}:")
    print(f"  Train: {Counter(y[train_idx])}")
    print(f"  Val:   {Counter(y[val_idx])}")
```

**Visual:**
```
Original Dataset: [99% Class 0, 1% Class 1]

Without Stratification:
  Train: [98% Class 0, 2% Class 1]   ← Inconsistent
  Test:  [100% Class 0, 0% Class 1]  ← No minority!

With Stratification:
  Train: [99% Class 0, 1% Class 1]   ← Consistent
  Test:  [99% Class 0, 1% Class 1]   ← Consistent
```

---

### 3. Ensemble Methods

**Balanced Random Forest:**

```python
from imblearn.ensemble import BalancedRandomForestClassifier

# Balanced Random Forest
brf = BalancedRandomForestClassifier(
    n_estimators=100,
    sampling_strategy='auto',  # Balance each bootstrap sample
    replacement=True,
    random_state=42
)
brf.fit(X_train, y_train)

y_pred = brf.predict(X_test)
print(classification_report(y_test, y_pred))
```

**Easy Ensemble:**

```python
from imblearn.ensemble import EasyEnsembleClassifier

# Easy Ensemble (multiple undersampled subsets)
eec = EasyEnsembleClassifier(
    n_estimators=10,
    random_state=42
)
eec.fit(X_train, y_train)
```

**Concept:**
```
Balanced Random Forest:
  ┌──────────────────────────────────┐
  │ For each tree:                   │
  │   1. Undersample majority class  │
  │   2. Train on balanced subset    │
  │ Aggregate predictions            │
  └──────────────────────────────────┘
```

---

## Evaluation Metrics

### ⚠️ Why Accuracy is Misleading

```python
# Example: 99% majority class
y_true = np.array([0]*990 + [1]*10)
y_pred_all_majority = np.array([0]*1000)  # Predict all as majority

from sklearn.metrics import accuracy_score
accuracy = accuracy_score(y_true, y_pred_all_majority)
print(f"Accuracy: {accuracy:.1%}")  # 99% but useless!
```

### Better Metrics

#### 1. Confusion Matrix

```python
from sklearn.metrics import confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

def plot_confusion_matrix(y_true, y_pred):
    cm = confusion_matrix(y_true, y_pred)

    print("Confusion Matrix:")
    print("                Predicted")
    print("              Neg    Pos")
    print(f"Actual Neg   {cm[0,0]:4d}  {cm[0,1]:4d}")
    print(f"       Pos   {cm[1,0]:4d}  {cm[1,1]:4d}")

    # Calculate metrics
    tn, fp, fn, tp = cm.ravel()

    print(f"\nTrue Positives (TP):  {tp}")
    print(f"True Negatives (TN):  {tn}")
    print(f"False Positives (FP): {fp}")
    print(f"False Negatives (FN): {fn}")
```

#### 2. Precision, Recall, F1-Score

```python
from sklearn.metrics import precision_recall_fscore_support, classification_report

def detailed_metrics(y_true, y_pred):
    # Classification report
    print(classification_report(y_true, y_pred,
                                target_names=['Majority', 'Minority']))

    # Manual calculation
    from sklearn.metrics import precision_score, recall_score, f1_score

    precision = precision_score(y_true, y_pred)
    recall = recall_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred)

    print(f"\nMinority Class Metrics:")
    print(f"  Precision: {precision:.3f}")
    print(f"  Recall:    {recall:.3f}")
    print(f"  F1-Score:  {f1:.3f}")
```

**Formulas:**
```
Precision = TP / (TP + FP)  → How many predicted positives are correct?
Recall    = TP / (TP + FN)  → How many actual positives were found?
F1-Score  = 2 × (Precision × Recall) / (Precision + Recall)
```

#### 3. ROC-AUC and PR-AUC

```python
from sklearn.metrics import roc_auc_score, average_precision_score
from sklearn.metrics import roc_curve, precision_recall_curve

# Get prediction probabilities
y_proba = model.predict_proba(X_test)[:, 1]

# ROC-AUC
roc_auc = roc_auc_score(y_test, y_proba)
print(f"ROC-AUC: {roc_auc:.3f}")

# PR-AUC (better for imbalanced data)
pr_auc = average_precision_score(y_test, y_proba)
print(f"PR-AUC: {pr_auc:.3f}")

# Plot curves
def plot_curves(y_true, y_proba):
    # ROC Curve
    fpr, tpr, _ = roc_curve(y_true, y_proba)

    # PR Curve
    precision, recall, _ = precision_recall_curve(y_true, y_proba)

    print("ROC Curve: Trade-off between TPR and FPR")
    print("PR Curve:  Trade-off between Precision and Recall")
    print("\nFor imbalanced data, PR-AUC is more informative!")
```

**When to Use Which:**

| Metric | Use When | Formula |
|--------|----------|---------|
| **Precision** | False positives are costly | TP/(TP+FP) |
| **Recall** | False negatives are costly | TP/(TP+FN) |
| **F1-Score** | Balance precision & recall | 2PR/(P+R) |
| **ROC-AUC** | Balanced classes | Area under ROC |
| **PR-AUC** | Imbalanced classes | Area under PR |

---

## Practical Examples

### Example 1: Credit Card Fraud Detection

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from imblearn.over_sampling import SMOTE
from imblearn.combine import SMOTETomek
from sklearn.metrics import classification_report, confusion_matrix

# Load data (simulated)
np.random.seed(42)
n_samples = 10000
n_fraud = 100

# Generate features
X = np.random.randn(n_samples, 10)
y = np.array([0]*(n_samples - n_fraud) + [1]*n_fraud)

# Add fraud patterns
fraud_indices = np.where(y == 1)[0]
X[fraud_indices] = X[fraud_indices] * 2 + np.random.randn(len(fraud_indices), 10) * 0.5

print(f"Dataset: {len(X)} transactions")
print(f"Fraud rate: {(y.sum()/len(y))*100:.2f}%")

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Approach 1: Baseline (no handling)
print("\n" + "="*50)
print("Approach 1: Baseline (No Imbalance Handling)")
print("="*50)
model_baseline = RandomForestClassifier(random_state=42)
model_baseline.fit(X_train_scaled, y_train)
y_pred_baseline = model_baseline.predict(X_test_scaled)
print(classification_report(y_test, y_pred_baseline,
                           target_names=['Legitimate', 'Fraud']))

# Approach 2: Class Weights
print("\n" + "="*50)
print("Approach 2: Class Weights")
print("="*50)
model_weighted = RandomForestClassifier(class_weight='balanced', random_state=42)
model_weighted.fit(X_train_scaled, y_train)
y_pred_weighted = model_weighted.predict(X_test_scaled)
print(classification_report(y_test, y_pred_weighted,
                           target_names=['Legitimate', 'Fraud']))

# Approach 3: SMOTE
print("\n" + "="*50)
print("Approach 3: SMOTE")
print("="*50)
smote = SMOTE(random_state=42)
X_train_smote, y_train_smote = smote.fit_resample(X_train_scaled, y_train)
print(f"After SMOTE: {Counter(y_train_smote)}")

model_smote = RandomForestClassifier(random_state=42)
model_smote.fit(X_train_smote, y_train_smote)
y_pred_smote = model_smote.predict(X_test_scaled)
print(classification_report(y_test, y_pred_smote,
                           target_names=['Legitimate', 'Fraud']))

# Approach 4: SMOTE + Tomek
print("\n" + "="*50)
print("Approach 4: SMOTE + Tomek")
print("="*50)
smote_tomek = SMOTETomek(random_state=42)
X_train_st, y_train_st = smote_tomek.fit_resample(X_train_scaled, y_train)
print(f"After SMOTE+Tomek: {Counter(y_train_st)}")

model_st = RandomForestClassifier(random_state=42)
model_st.fit(X_train_st, y_train_st)
y_pred_st = model_st.predict(X_test_scaled)
print(classification_report(y_test, y_pred_st,
                           target_names=['Legitimate', 'Fraud']))

# Compare all approaches
print("\n" + "="*50)
print("COMPARISON")
print("="*50)

def get_fraud_metrics(y_true, y_pred):
    """Get fraud detection specific metrics"""
    from sklearn.metrics import precision_score, recall_score, f1_score
    return {
        'Precision': precision_score(y_true, y_pred),
        'Recall': recall_score(y_true, y_pred),
        'F1-Score': f1_score(y_true, y_pred)
    }

results = {
    'Baseline': get_fraud_metrics(y_test, y_pred_baseline),
    'Class Weights': get_fraud_metrics(y_test, y_pred_weighted),
    'SMOTE': get_fraud_metrics(y_test, y_pred_smote),
    'SMOTE+Tomek': get_fraud_metrics(y_test, y_pred_st)
}

comparison_df = pd.DataFrame(results).T
print(comparison_df)
print("\n🏆 Winner: Highest F1-Score =", comparison_df['F1-Score'].idxmax())
```

---

### Example 2: Medical Diagnosis (Disease Prediction)

```python
# Scenario: Rare disease diagnosis (2% prevalence)
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import roc_auc_score, average_precision_score

# Generate medical data
np.random.seed(42)
n_patients = 5000
disease_rate = 0.02

# Features: age, blood_pressure, cholesterol, glucose, etc.
X = np.random.randn(n_patients, 8)
y = np.random.choice([0, 1], size=n_patients, p=[1-disease_rate, disease_rate])

# Add disease patterns
disease_indices = np.where(y == 1)[0]
X[disease_indices, :3] += 1.5  # Higher values for first 3 features

print(f"Total patients: {n_patients}")
print(f"Disease prevalence: {y.mean()*100:.1f}%")

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, stratify=y, random_state=42
)

# Compare techniques
techniques = {
    'Baseline': (X_train, y_train),
    'SMOTE': SMOTE(random_state=42).fit_resample(X_train, y_train),
    'ADASYN': ADASYN(random_state=42).fit_resample(X_train, y_train),
}

print("\n" + "="*60)
print("Medical Diagnosis Results")
print("="*60)

for name, (X_t, y_t) in techniques.items():
    model = DecisionTreeClassifier(max_depth=5, random_state=42)
    model.fit(X_t, y_t)

    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    print(f"\n{name}:")
    print(f"  Training samples: {len(y_t)} (Disease: {y_t.sum()})")

    # Metrics focused on rare disease
    from sklearn.metrics import recall_score, precision_score
    recall = recall_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    pr_auc = average_precision_score(y_test, y_proba)

    print(f"  Recall (Sensitivity):    {recall:.3f} ← Catch diseased patients")
    print(f"  Precision:               {precision:.3f} ← Avoid false alarms")
    print(f"  PR-AUC:                  {pr_auc:.3f}")

    # Confusion Matrix
    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    print(f"  False Negatives (Missed): {fn} ⚠️")
    print(f"  False Positives (False alarm): {fp}")
```

---

## Comparison Table

### Techniques Comparison

| Technique | Data Size | Training Time | Overfitting Risk | Information Loss | Best For |
|-----------|-----------|---------------|------------------|------------------|----------|
| **Random Oversampling** | Increases | High | High | None | Quick prototyping |
| **Random Undersampling** | Decreases | Low | Low | High | Large datasets |
| **SMOTE** | Increases | Medium | Medium | None | General purpose |
| **ADASYN** | Increases | Medium | Medium | None | Varying densities |
| **Tomek Links** | Slight decrease | Medium | Low | Low | Boundary cleaning |
| **SMOTE+Tomek** | Increases | High | Low | None | Best overall |
| **Class Weights** | Same | Low | Medium | None | Online learning |
| **Ensemble** | Same | High | Low | None | Production systems |

---

### Decision Matrix: Which Technique to Use?

```
┌─────────────────────────────────────────────────────────────┐
│              Decision Tree for Technique Selection          │
└─────────────────────────────────────────────────────────────┘

                    How much data?
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   Very Small         Medium            Large
   (<1000)           (1K-100K)         (>100K)
        │                 │                 │
        │                 │                 │
        ▼                 ▼                 ▼
   Class Weights    SMOTE/ADASYN    Undersampling
                         +               or
                    Tomek Links      Ensemble Methods


                   Training Time Critical?
                          │
                ┌─────────┴─────────┐
                │                   │
                ▼                   ▼
              Yes                  No
               │                    │
               ▼                    ▼
        Class Weights       SMOTE + Tomek
        or Simple             + Ensemble
        Undersampling
```

---

## Best Practices

### 1. General Guidelines

```python
# ✅ DO: Always use stratified splitting
X_train, X_test, y_train, y_test = train_test_split(
    X, y, stratify=y, test_size=0.2
)

# ✅ DO: Apply resampling only to training data
smote = SMOTE()
X_train_res, y_train_res = smote.fit_resample(X_train, y_train)
# Test set remains imbalanced (real-world distribution)

# ❌ DON'T: Apply resampling to entire dataset
# X_res, y_res = smote.fit_resample(X, y)  # WRONG!
# X_train, X_test, y_train, y_test = train_test_split(X_res, y_res)

# ✅ DO: Use appropriate metrics
from sklearn.metrics import f1_score, roc_auc_score
f1 = f1_score(y_test, y_pred)
auc = roc_auc_score(y_test, y_pred_proba)

# ❌ DON'T: Rely on accuracy alone
# accuracy = accuracy_score(y_test, y_pred)  # Misleading!
```

### 2. Pipeline Integration

```python
from imblearn.pipeline import Pipeline as ImbPipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

# Create pipeline
pipeline = ImbPipeline([
    ('scaler', StandardScaler()),
    ('sampler', SMOTE(random_state=42)),
    ('classifier', RandomForestClassifier(random_state=42))
])

# Fit and predict
pipeline.fit(X_train, y_train)
y_pred = pipeline.predict(X_test)
```

### 3. Cross-Validation

```python
from sklearn.model_selection import cross_val_score, StratifiedKFold

# Stratified K-Fold
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# Cross-validation scores
scores = cross_val_score(
    pipeline, X_train, y_train,
    cv=cv,
    scoring='f1'  # Use F1 for imbalanced data
)

print(f"F1 Scores: {scores}")
print(f"Mean F1: {scores.mean():.3f} (+/- {scores.std():.3f})")
```

---

## Interview Questions

### Q1: What is class imbalance and why is it a problem?

**Answer:**
Class imbalance occurs when one class significantly outnumbers another in a dataset.

**Problems:**
1. **Biased models:** Model learns to predict majority class
2. **Misleading accuracy:** High accuracy but poor minority detection
3. **Poor generalization:** Fails on real-world minority cases

**Example:** In fraud detection with 99.9% legitimate transactions, a model predicting everything as "legitimate" achieves 99.9% accuracy but catches 0% fraud.

**Solution approaches:**
- Data-level: Resampling (SMOTE, undersampling)
- Algorithm-level: Class weights, ensemble methods
- Evaluation: Use F1, PR-AUC instead of accuracy

---

### Q2: Explain SMOTE. What are its advantages and limitations?

**Answer:**

**SMOTE (Synthetic Minority Over-sampling Technique):**

**How it works:**
1. For each minority sample, find k nearest neighbors (default k=5)
2. Randomly select one neighbor
3. Generate synthetic sample by interpolation:
   ```
   new_sample = sample + λ × (neighbor - sample)
   where λ ∈ [0, 1]
   ```

**Advantages:**
- ✅ Creates new synthetic samples (vs duplicates)
- ✅ Reduces overfitting compared to random oversampling
- ✅ Works well in practice
- ✅ Many variants (Borderline-SMOTE, ADASYN)

**Limitations:**
- ❌ Can create unrealistic samples in feature space
- ❌ May not work well with high-dimensional data
- ❌ Generates noise if minority classes overlap
- ❌ Computationally expensive for large datasets

**Code example:**
```python
from imblearn.over_sampling import SMOTE
smote = SMOTE(k_neighbors=5, random_state=42)
X_res, y_res = smote.fit_resample(X_train, y_train)
```

---

### Q3: When would you use undersampling vs oversampling?

**Answer:**

**Use Undersampling When:**
- ✅ Very large dataset (>100K samples)
- ✅ Training time is critical
- ✅ Majority class has redundant information
- ❌ Risk: Information loss

**Use Oversampling When:**
- ✅ Small to medium dataset
- ✅ Cannot afford to lose information
- ✅ Minority class has sufficient variety
- ❌ Risk: Overfitting, longer training

**Use Both (Combination):**
- ✅ Best practice: SMOTE + Tomek/ENN
- ✅ Balance the advantages
- ✅ Clean decision boundaries

**Decision matrix:**
```
Dataset Size    Imbalance Ratio    Recommendation
──────────────────────────────────────────────────
< 10K          < 10:1              SMOTE
< 10K          > 10:1              SMOTE + Class Weights
10K - 100K     < 50:1              SMOTE + Tomek
10K - 100K     > 50:1              ADASYN + Ensemble
> 100K         Any                 Undersampling + Ensemble
```

---

### Q4: How do you evaluate a model trained on imbalanced data?

**Answer:**

**Avoid:** Accuracy (misleading!)

**Use instead:**

1. **Confusion Matrix:**
   ```
   Focus on: TP, FN (minority class detection)
   ```

2. **Precision & Recall:**
   ```
   Precision = TP / (TP + FP)  → How many predicted positives are correct?
   Recall = TP / (TP + FN)     → How many actual positives were found?
   ```

3. **F1-Score:**
   ```
   F1 = 2 × (Precision × Recall) / (Precision + Recall)
   Harmonic mean balances both metrics
   ```

4. **PR-AUC (Precision-Recall AUC):**
   ```
   Better than ROC-AUC for imbalanced data
   Shows trade-off between precision and recall
   ```

5. **Business Metrics:**
   ```
   Cost of FN vs FP
   Example: Missing fraud ($1000 loss) vs false alarm ($1 cost)
   ```

**Code:**
```python
from sklearn.metrics import classification_report, average_precision_score

print(classification_report(y_test, y_pred))
pr_auc = average_precision_score(y_test, y_pred_proba)
print(f"PR-AUC: {pr_auc:.3f}")
```

---

### Q5: What is the difference between SMOTE and ADASYN?

**Answer:**

| Aspect | SMOTE | ADASYN |
|--------|-------|--------|
| **Sampling** | Uniform (equal for all samples) | Adaptive (more for harder samples) |
| **Focus** | General oversampling | Difficult-to-learn regions |
| **Density** | Ignores density | Considers local density |
| **Synthetic Samples** | Same number for each minority sample | More in low-density regions |

**SMOTE:**
```python
# Equal synthetic samples for all minority instances
for each minority_sample:
    generate N synthetic samples
```

**ADASYN:**
```python
# Adaptive - more samples for harder-to-learn instances
for each minority_sample:
    density = calculate_local_density()
    n_samples = total_synthetic * density_weight
    generate n_samples synthetic samples
```

**When to use:**
- **SMOTE:** General purpose, simpler, faster
- **ADASYN:** When minority class has varying densities, complex boundaries

**Example:**
```python
from imblearn.over_sampling import SMOTE, ADASYN

smote = SMOTE(random_state=42)
adasyn = ADASYN(random_state=42)

X_smote, y_smote = smote.fit_resample(X, y)
X_adasyn, y_adasyn = adasyn.fit_resample(X, y)
```

---

### Q6: How would you handle a dataset with 99:1 class imbalance?

**Answer:**

**Step-by-step approach:**

1. **Understand the business context**
   ```
   - Cost of false positives vs false negatives?
   - Which error is more expensive?
   ```

2. **Baseline with stratified split**
   ```python
   X_train, X_test, y_train, y_test = train_test_split(
       X, y, stratify=y, test_size=0.2
   )
   ```

3. **Try multiple techniques (in order):**

   **a) Class Weights (fastest):**
   ```python
   model = RandomForestClassifier(class_weight='balanced')
   ```

   **b) SMOTE (if more data needed):**
   ```python
   smote = SMOTE(sampling_strategy=0.1)  # Don't go to 50:50
   X_res, y_res = smote.fit_resample(X_train, y_train)
   ```

   **c) Combination (best results):**
   ```python
   from imblearn.combine import SMOTETomek
   smt = SMOTETomek(random_state=42)
   X_res, y_res = smt.fit_resample(X_train, y_train)
   ```

   **d) Ensemble (production):**
   ```python
   from imblearn.ensemble import BalancedRandomForestClassifier
   brf = BalancedRandomForestClassifier(n_estimators=100)
   ```

4. **Evaluate with appropriate metrics:**
   ```python
   # Focus on minority class
   print(classification_report(y_test, y_pred))
   pr_auc = average_precision_score(y_test, y_pred_proba)
   ```

5. **Tune threshold:**
   ```python
   # Adjust decision threshold based on business needs
   from sklearn.metrics import precision_recall_curve

   precisions, recalls, thresholds = precision_recall_curve(
       y_test, y_pred_proba
   )
   # Choose threshold based on required precision/recall
   ```

**Final recommendation for 99:1:**
```
SMOTE (sampling_strategy=0.1) + Tomek Links + Ensemble + Threshold Tuning
```

---

## Key Takeaways

1. **Imbalanced data is common** in real-world problems (fraud, disease, churn)

2. **Accuracy is misleading** - use F1, Precision, Recall, PR-AUC

3. **Resampling techniques:**
   - SMOTE: Best general-purpose oversampling
   - ADASYN: Adaptive oversampling for complex boundaries
   - Combination: SMOTE + Tomek for best results

4. **Algorithm approaches:**
   - Class weights: Fast, no data modification
   - Ensemble methods: Production-ready

5. **Best practices:**
   - Always use stratified splitting
   - Apply resampling only to training data
   - Use appropriate evaluation metrics
   - Consider business costs (FP vs FN)

6. **Production recommendations:**
   - Start with class weights
   - Add SMOTE if needed
   - Use ensemble methods for best performance
   - Monitor with PR-AUC

---

**Navigation:** [← Back to Index](./README.md) | [Next: Regular Expressions →](./regex.md)
