# ML Algorithms (Weeks 28-33)

## Overview
Comprehensive revision notes for fundamental machine learning algorithms covering classification, regression, and dimensionality reduction techniques.

---

## Contents

1. **[KNN (K-Nearest Neighbors)](knn.md)**
   - Classification & Regression
   - Distance metrics
   - Curse of dimensionality
   - Instance-based learning

2. **[PCA (Principal Component Analysis)](pca.md)**
   - Dimensionality reduction
   - Eigenvalues & eigenvectors
   - Explained variance
   - Feature extraction

3. **[Naive Bayes](naive-bayes.md)**
   - Gaussian, Multinomial, Bernoulli
   - Probabilistic classification
   - Laplace smoothing
   - Text classification

4. **[Logistic Regression](logistic-regression.md)**
   - Binary & multiclass classification
   - Sigmoid function
   - Regularization (L1/L2)
   - Probability estimates

5. **[SVM (Support Vector Machines)](svm.md)**
   - Hard & soft margin
   - Kernel trick (RBF, polynomial)
   - Maximum margin classification
   - Non-linear boundaries

---

## Quick Comparison Table

| Algorithm | Type | Speed | Interpretability | Non-Linear | Probabilities | Best For |
|-----------|------|-------|------------------|------------|---------------|----------|
| **KNN** | Instance | Fast train, Slow predict | Low | Yes | Yes | Small data, simple baseline |
| **PCA** | Unsupervised | Fast | Medium | No* | N/A | Dimensionality reduction, visualization |
| **Naive Bayes** | Probabilistic | Very Fast | Medium | No | Yes (uncalibrated) | Text, small data, high-D |
| **Logistic Reg** | Linear | Fast | High | No** | Yes (calibrated) | Baseline, interpretability |
| **SVM** | Margin-based | Slow | Low*** | Yes (kernels) | Via Platt | Small-medium data, high-D |

\* Kernel PCA available for non-linear
\** Can use polynomial features
\*** Linear SVM is interpretable

---

## Detailed Comparison

### Classification Algorithms

| Aspect | KNN | Naive Bayes | Logistic Regression | SVM |
|--------|-----|-------------|---------------------|-----|
| **Training Time** | O(1) | O(nd) | O(nd) | O(n²) to O(n³) |
| **Prediction Time** | O(nd) | O(cd) | O(d) | O(n_sv × d) |
| **Memory** | O(nd) | O(cd) | O(d) | O(n_sv × d) |
| **Overfitting Risk** | High (low k) | Low | Medium | Medium |
| **Feature Scaling** | Required | Depends on variant | Required | CRITICAL |
| **Missing Values** | Manual | Manual | Manual | Manual |
| **Multiclass** | Native | Native | OvR/Softmax | OvO/OvR |
| **Online Learning** | No | Yes | Yes | No |
| **Feature Interactions** | Auto | No | Manual | Via kernels |
| **Outlier Sensitivity** | High | Low | Medium | Medium |

**Legend:**
- n = samples, d = features, c = classes, n_sv = support vectors
- OvR = One-vs-Rest, OvO = One-vs-One

### Strengths & Weaknesses

```
KNN
✓ Simple, no training
✓ Multi-class natural
✓ Non-linear boundaries
✗ Slow predictions
✗ Curse of dimensionality
✗ Memory intensive

Naive Bayes
✓ Very fast
✓ Works with small data
✓ Handles high dimensions
✗ Assumes independence
✗ Poor probabilities
✗ Can't learn interactions

Logistic Regression
✓ Fast and interpretable
✓ Good probabilities
✓ Low overfitting
✗ Linear only
✗ Manual feature engineering
✗ Sensitive to outliers

SVM
✓ Effective in high-D
✓ Versatile (kernels)
✓ Maximum margin
✗ Slow on large data
✗ Sensitive to scaling
✗ Hard to interpret
```

---

## Algorithm Selection Decision Tree

```
START: Choose ML Algorithm
│
├─ Need dimensionality reduction?
│  │
│  └─ YES → PCA
│     ├─ Linear patterns → Standard PCA
│     ├─ Non-linear patterns → Kernel PCA / t-SNE / UMAP
│     └─ Visualization → PCA (2-3 components)
│
└─ Need classification?
   │
   ├─ What's your dataset size?
   │  │
   │  ├─ VERY LARGE (n > 100K)
   │  │  ├─ Linear separable → Logistic Regression / LinearSVC
   │  │  ├─ Non-linear → Random Forest / XGBoost
   │  │  └─ Text data → Naive Bayes (Multinomial)
   │  │
   │  ├─ LARGE (10K < n < 100K)
   │  │  ├─ Need interpretability → Logistic Regression
   │  │  ├─ Need probabilities → Logistic Regression / Calibrated NB
   │  │  ├─ Text classification → Naive Bayes
   │  │  └─ Complex patterns → Random Forest / SVM (linear)
   │  │
   │  ├─ MEDIUM (1K < n < 10K)
   │  │  ├─ Clear margin → SVM (RBF kernel)
   │  │  ├─ Text data → Naive Bayes / SVM
   │  │  ├─ Need speed → Naive Bayes / Logistic Reg
   │  │  └─ Non-linear → SVM / Random Forest
   │  │
   │  └─ SMALL (n < 1K)
   │     ├─ Text/High-D → Naive Bayes
   │     ├─ Simple baseline → KNN / Logistic Reg
   │     ├─ Few features → SVM / Logistic Reg
   │     └─ Need flexibility → KNN
   │
   ├─ What about dimensions?
   │  │
   │  ├─ HIGH DIMENSIONS (d > 100)
   │  │  ├─ Text data → Naive Bayes / Linear SVM
   │  │  ├─ Sparse features → Logistic Reg (L1) / Linear SVM
   │  │  ├─ First reduce → PCA → then classify
   │  │  └─ Avoid → KNN (curse of dimensionality)
   │  │
   │  └─ LOW DIMENSIONS (d < 20)
   │     ├─ All algorithms work
   │     └─ Choose based on other criteria
   │
   ├─ What are your priorities?
   │  │
   │  ├─ INTERPRETABILITY
   │  │  └─ Logistic Regression > Naive Bayes > Linear SVM > KNN
   │  │
   │  ├─ SPEED (training + prediction)
   │  │  └─ Naive Bayes > Logistic Reg > Linear SVM > KNN > SVM (RBF)
   │  │
   │  ├─ ACCURACY (generally)
   │  │  └─ SVM > Logistic Reg > KNN > Naive Bayes
   │  │
   │  ├─ PROBABILITY ESTIMATES
   │  │  └─ Logistic Reg > Calibrated NB > SVM (Platt) > KNN
   │  │
   │  └─ MEMORY EFFICIENCY
   │     └─ Logistic Reg > Naive Bayes > SVM > KNN
   │
   └─ What's your data like?
      │
      ├─ TEXT DATA
      │  └─ Naive Bayes > Linear SVM > Logistic Reg
      │
      ├─ IMAGES (features extracted)
      │  └─ SVM (RBF) > Logistic Reg > KNN
      │
      ├─ IMBALANCED CLASSES
      │  ├─ Use class_weight parameter
      │  └─ Logistic Reg > SVM > Naive Bayes > KNN
      │
      ├─ MISSING VALUES
      │  └─ All require imputation (none handle natively)
      │
      ├─ OUTLIERS PRESENT
      │  └─ Naive Bayes > SVM (soft margin) > Logistic Reg > KNN
      │
      └─ CORRELATED FEATURES
         ├─ Logistic Reg (L2) > SVM
         ├─ Or use PCA first
         └─ Avoid → Naive Bayes (assumes independence)
```

---

## Use Case Decision Guide

### Quick Selection by Problem Type

```
┌─────────────────────────────────────────────────────────┐
│                    PROBLEM TYPE                         │
└─────────────────────────────────────────────────────────┘

📧 EMAIL SPAM DETECTION
   → Naive Bayes (Multinomial) or Linear SVM
   Reason: Text data, high-D, need speed

🏥 MEDICAL DIAGNOSIS
   → Logistic Regression or SVM
   Reason: Interpretability, probability estimates needed

💳 CREDIT SCORING
   → Logistic Regression
   Reason: Interpretable, regulated industry, probabilities

🖼️ IMAGE CLASSIFICATION (small dataset)
   → SVM (RBF kernel)
   Reason: High-D, non-linear patterns

📰 NEWS CATEGORIZATION
   → Naive Bayes (Multinomial)
   Reason: Text, multi-class, fast

😊 SENTIMENT ANALYSIS
   → Naive Bayes or Logistic Regression
   Reason: Text data, binary/multi-class

🎬 MOVIE RECOMMENDATION
   → KNN (collaborative filtering)
   Reason: Similarity-based, "users like you"

🔍 ANOMALY DETECTION
   → One-Class SVM or Isolation Forest
   Reason: Outlier detection

📊 CUSTOMER CHURN
   → Logistic Regression or Random Forest
   Reason: Interpretability, feature importance

🧬 GENE EXPRESSION ANALYSIS
   → SVM or Regularized Logistic Regression
   Reason: High-D, small samples

📈 STOCK PRICE DIRECTION
   → SVM or Neural Networks
   Reason: Non-linear patterns

🏠 HOUSING PRICE PREDICTION
   → NOT THESE! Use Linear/Ridge/Lasso Regression
   Reason: This is regression, not classification
```

---

## Preprocessing Requirements

| Algorithm | Feature Scaling | Handle Missing | Encode Categorical | Remove Outliers |
|-----------|----------------|----------------|-------------------|-----------------|
| **KNN** | ✅ CRITICAL | ✅ Required | ✅ Yes | ⚠️ Recommended |
| **PCA** | ✅ CRITICAL | ✅ Required | ⚠️ Use carefully | ⚠️ Recommended |
| **Naive Bayes (G)** | ⚠️ Recommended | ✅ Required | ✅ Yes | ❌ Handles well |
| **Naive Bayes (M/B)** | ❌ Not needed | ✅ Required | ✅ Yes | ❌ Handles well |
| **Logistic Reg** | ✅ Required | ✅ Required | ✅ Yes | ⚠️ Recommended |
| **SVM** | ✅ CRITICAL | ✅ Required | ✅ Yes | ⚠️ Recommended |

**Legend:**
- ✅ = Must do
- ⚠️ = Recommended
- ❌ = Not necessary
- (G) = Gaussian, (M) = Multinomial, (B) = Bernoulli

---

## Hyperparameter Tuning Priority

### Critical Parameters (Tune First)

```
KNN:
├─ n_neighbors (k): Try [3, 5, 7, 9, 11, 15, 21, 31]
├─ weights: ['uniform', 'distance']
└─ metric: ['euclidean', 'manhattan']

PCA:
├─ n_components: [0.80, 0.90, 0.95, 0.99] (variance)
└─ svd_solver: ['auto', 'full', 'randomized']

Naive Bayes:
├─ alpha: [0.01, 0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
└─ variant: [GaussianNB, MultinomialNB, BernoulliNB]

Logistic Regression:
├─ C: [0.001, 0.01, 0.1, 1, 10, 100]
├─ penalty: ['l1', 'l2', 'elasticnet']
└─ solver: Match with penalty

SVM:
├─ C: [0.1, 1, 10, 100, 1000]
├─ kernel: ['linear', 'rbf', 'poly']
└─ gamma (if RBF/poly): ['scale', 0.001, 0.01, 0.1, 1]
```

### Parameter Interaction

```
SVM: C vs Gamma (RBF kernel)
═══════════════════════════════

         γ
         ↑
   Large │ Overfit  Overfit  Overfit
         │
  Medium │ Underfit  GOOD    Overfit
         │
   Small │ Underfit Underfit  GOOD
         │
         └─────────────────────→ C
          Small   Medium  Large

Sweet spot: Medium C, Medium γ
Use GridSearch to find optimal combination
```

---

## Performance Metrics by Algorithm

### What Metrics to Use

```
Binary Classification:
├─ Balanced data
│  └─ Accuracy, F1-score, ROC AUC
├─ Imbalanced data
│  └─ Precision, Recall, F1, PR AUC (NOT accuracy!)
└─ Cost-sensitive
   └─ Precision (minimize FP) or Recall (minimize FN)

Multiclass Classification:
├─ Balanced
│  └─ Accuracy, Macro F1
└─ Imbalanced
   └─ Weighted F1, Per-class metrics

Probability Quality:
├─ Calibration curve
├─ Brier score
└─ Log loss

Ranking:
└─ ROC AUC, PR AUC
```

### Algorithm-Specific Considerations

```
KNN:
- Use accuracy for balanced
- Check confusion matrix for imbalanced
- Cross-validation essential (no train phase)

Naive Bayes:
- Don't trust raw probabilities (use calibration)
- F1-score better than accuracy
- Check per-class performance

Logistic Regression:
- ROC AUC for ranking
- Calibration curve (probabilities are good)
- Feature coefficients for interpretation

SVM:
- Accuracy/F1 for decisions
- Margin width for confidence
- Support vector count (lower = better generalization)
```

---

## Common Pitfalls Across Algorithms

### 1. Feature Scaling

```python
# ⚠️ CRITICAL for: KNN, PCA, Logistic Reg, SVM
# ❌ Not needed for: Tree-based, Naive Bayes (M/B)

# WRONG
model.fit(X_train, y_train)

# CORRECT
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
model.fit(X_train_scaled, y_train)
```

### 2. Data Leakage

```python
# WRONG: Fitting on all data
scaler.fit(X)  # Includes test data!
pca.fit(X)

# CORRECT: Fit on training only
scaler.fit(X_train)
X_train_scaled = scaler.transform(X_train)
X_test_scaled = scaler.transform(X_test)
```

### 3. Not Using Pipelines

```python
# BETTER: Use Pipeline to avoid leakage
from sklearn.pipeline import Pipeline

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('pca', PCA(n_components=0.95)),
    ('classifier', SVC(kernel='rbf', C=1.0))
])

# Automatically handles fit/transform correctly
pipeline.fit(X_train, y_train)
y_pred = pipeline.predict(X_test)
```

### 4. Ignoring Class Imbalance

```python
# For 90-10 imbalanced data

# WRONG: Default parameters
model.fit(X, y)  # Predicts majority class always!

# CORRECT: Use class weights
from sklearn.linear_model import LogisticRegression
model = LogisticRegression(class_weight='balanced')

# OR resample
from imblearn.over_sampling import SMOTE
smote = SMOTE()
X_resampled, y_resampled = smote.fit_resample(X, y)
```

### 5. Not Tuning Hyperparameters

```python
# WRONG: Using defaults
model = SVC()  # C=1.0, gamma='scale' may be suboptimal

# CORRECT: Use GridSearch/RandomizedSearch
from sklearn.model_selection import GridSearchCV

param_grid = {'C': [0.1, 1, 10], 'gamma': [0.001, 0.01, 0.1]}
grid = GridSearchCV(SVC(), param_grid, cv=5)
grid.fit(X_train, y_train)
best_model = grid.best_estimator_
```

---

## Workflow: Choosing and Training

### Step-by-Step Process

```
1. UNDERSTAND THE PROBLEM
   ├─ Classification or regression?
   ├─ Binary or multiclass?
   ├─ What matters? Speed, accuracy, interpretability?
   └─ Evaluate metrics needed?

2. EXPLORE THE DATA
   ├─ How many samples? (n)
   ├─ How many features? (d)
   ├─ Feature types? (continuous, categorical, text)
   ├─ Missing values?
   ├─ Class distribution? (balanced, imbalanced)
   └─ Outliers present?

3. PREPROCESSING
   ├─ Handle missing values (imputation)
   ├─ Encode categorical variables
   ├─ Scale features (if needed)
   ├─ Handle outliers (if needed)
   └─ Create train/test split

4. CHOOSE ALGORITHMS (2-3 candidates)
   ├─ Start with simple baseline (Logistic Reg, Naive Bayes)
   ├─ Try more complex (SVM, ensemble)
   └─ Use decision tree from this guide

5. TRAIN AND EVALUATE
   ├─ Cross-validation for robust estimates
   ├─ Compare multiple algorithms
   ├─ Check overfitting (train vs validation)
   └─ Tune hyperparameters

6. FINAL EVALUATION
   ├─ Test on held-out test set (only once!)
   ├─ Analyze errors (confusion matrix)
   ├─ Check feature importance
   └─ Validate assumptions

7. DEPLOYMENT
   ├─ Retrain on all data (train + validation)
   ├─ Save model and preprocessors
   ├─ Monitor performance
   └─ Update when needed
```

---

## Code Templates

### Template 1: Simple Classification

```python
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report

# Choose algorithm based on problem
from sklearn.linear_model import LogisticRegression
# from sklearn.svm import SVC
# from sklearn.naive_bayes import GaussianNB
# from sklearn.neighbors import KNeighborsClassifier

# 1. Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 2. Scale features (if needed)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 3. Train model
model = LogisticRegression(max_iter=1000)
model.fit(X_train_scaled, y_train)

# 4. Cross-validation
cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
print(f"CV Score: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

# 5. Evaluate on test set
y_pred = model.predict(X_test_scaled)
print(classification_report(y_test, y_pred))
```

### Template 2: With Hyperparameter Tuning

```python
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import Pipeline

# 1. Create pipeline
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('classifier', SVC())
])

# 2. Define parameter grid
param_grid = {
    'classifier__C': [0.1, 1, 10, 100],
    'classifier__kernel': ['rbf', 'linear'],
    'classifier__gamma': ['scale', 0.01, 0.1, 1]
}

# 3. Grid search
grid_search = GridSearchCV(
    pipeline,
    param_grid,
    cv=5,
    scoring='f1_weighted',
    n_jobs=-1,
    verbose=1
)

grid_search.fit(X_train, y_train)

# 4. Best model
print(f"Best parameters: {grid_search.best_params_}")
print(f"Best CV score: {grid_search.best_score_:.4f}")

# 5. Evaluate
best_model = grid_search.best_estimator_
y_pred = best_model.predict(X_test)
```

### Template 3: Compare Multiple Algorithms

```python
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier

# Define models
models = {
    'Logistic Regression': LogisticRegression(max_iter=1000),
    'SVM (RBF)': SVC(kernel='rbf', C=1.0),
    'SVM (Linear)': SVC(kernel='linear', C=1.0),
    'Naive Bayes': GaussianNB(),
    'KNN': KNeighborsClassifier(n_neighbors=5),
    'Random Forest': RandomForestClassifier(n_estimators=100)
}

# Scale data
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Compare
results = {}
for name, model in models.items():
    # Cross-validation
    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='f1_weighted')

    # Train and test
    model.fit(X_train_scaled, y_train)
    test_score = f1_score(y_test, model.predict(X_test_scaled), average='weighted')

    results[name] = {
        'CV Mean': cv_scores.mean(),
        'CV Std': cv_scores.std(),
        'Test Score': test_score
    }

# Display results
import pandas as pd
results_df = pd.DataFrame(results).T.sort_values('Test Score', ascending=False)
print(results_df)
```

---

## Study Guide

### Must-Know Concepts

#### KNN
- [ ] How distance metrics work
- [ ] Effect of k on bias-variance
- [ ] Curse of dimensionality
- [ ] Weighted vs uniform voting

#### PCA
- [ ] Eigenvectors = directions, eigenvalues = variance
- [ ] Explained variance ratio
- [ ] When to use PCA vs feature selection
- [ ] Reconstruction error

#### Naive Bayes
- [ ] Bayes theorem
- [ ] Why "naive"? (independence assumption)
- [ ] When to use Gaussian vs Multinomial vs Bernoulli
- [ ] Laplace smoothing

#### Logistic Regression
- [ ] Sigmoid function
- [ ] Log loss vs MSE
- [ ] L1 vs L2 regularization
- [ ] One-vs-Rest vs Multinomial

#### SVM
- [ ] Maximum margin concept
- [ ] Support vectors
- [ ] Hard vs soft margin (role of C)
- [ ] Kernel trick
- [ ] Effect of gamma in RBF kernel

### Practice Problems

1. **Algorithm Selection**
   - Given: 100K samples, 10K features, text data, need speed
   - Answer: Naive Bayes (Multinomial) or Linear SVM

2. **Hyperparameter Tuning**
   - SVM overfitting: Decrease C or decrease gamma
   - Logistic Reg underfitting: Increase C or add polynomial features

3. **Debugging**
   - KNN poor performance: Check if features are scaled
   - SVM very slow: Use LinearSVC or reduce sample size
   - Naive Bayes zero probabilities: Add smoothing (alpha > 0)

4. **Trade-offs**
   - Speed vs Accuracy: Naive Bayes vs SVM
   - Interpretability vs Performance: Logistic Reg vs SVM (RBF)
   - Memory vs Speed: KNN vs Logistic Reg

---

## Interview Questions Summary

### Conceptual

1. **Explain the bias-variance tradeoff for KNN.**
   - Low k: Low bias, high variance (overfitting)
   - High k: High bias, low variance (underfitting)

2. **What's the difference between PCA and feature selection?**
   - PCA: Creates new features (combinations)
   - Feature selection: Chooses subset of original features

3. **Why is Naive Bayes called "naive"?**
   - Assumes features are conditionally independent
   - Rarely true in practice, but often works well anyway

4. **Explain the decision boundary of logistic regression.**
   - Linear in feature space
   - Can be non-linear with polynomial features
   - Probabilistic (soft boundary)

5. **What is the kernel trick in SVM?**
   - Compute dot products in high-D without explicit mapping
   - Enables efficient non-linear classification

### Practical

6. **When would you use KNN over SVM?**
   - Very small dataset
   - Need simple interpretable baseline
   - Multi-modal class distributions

7. **How do you choose the number of principal components?**
   - Variance threshold (95%)
   - Scree plot (elbow method)
   - Cross-validation on downstream task

8. **What's the difference between Multinomial and Bernoulli Naive Bayes?**
   - Multinomial: Word counts (how many times)
   - Bernoulli: Word presence (yes/no)

9. **Why is feature scaling critical for SVM?**
   - SVM uses distances to find maximum margin
   - Large-scale features dominate distance calculation

10. **How do C and gamma affect SVM?**
    - C: Regularization (margin vs errors trade-off)
    - gamma: Kernel complexity (boundary complexity)

---

## Resources

### Scikit-learn Documentation
- [KNN](https://scikit-learn.org/stable/modules/neighbors.html)
- [PCA](https://scikit-learn.org/stable/modules/decomposition.html#pca)
- [Naive Bayes](https://scikit-learn.org/stable/modules/naive_bayes.html)
- [Logistic Regression](https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression)
- [SVM](https://scikit-learn.org/stable/modules/svm.html)

### Cheat Sheets
- [Scikit-learn Algorithm Cheat Sheet](https://scikit-learn.org/stable/tutorial/machine_learning_map/)
- [Choosing the Right Estimator](https://scikit-learn.org/stable/tutorial/machine_learning_map/index.html)

---

## Quick Reference Card

```
═══════════════════════════════════════════════════════════
                ML ALGORITHMS QUICK REFERENCE
═══════════════════════════════════════════════════════════

CLASSIFICATION FLOWCHART:
├─ Need interpretability? → Logistic Regression
├─ Text data? → Naive Bayes / Linear SVM
├─ Small data (< 1K)? → Naive Bayes / KNN
├─ Large data (> 100K)? → Logistic Reg / LinearSVC
├─ High dimensions? → Naive Bayes / Linear SVM / Logistic Reg
├─ Need probabilities? → Logistic Regression
├─ Non-linear + small data? → SVM (RBF)
└─ Baseline/Quick test? → Logistic Reg / Naive Bayes

DIMENSIONALITY REDUCTION:
├─ Visualization → PCA (2-3 components)
├─ Preprocessing → PCA (keep 95% variance)
├─ Feature extraction → PCA
├─ Non-linear → Kernel PCA / t-SNE / UMAP
└─ Supervised → LDA (Linear Discriminant Analysis)

CRITICAL PREPROCESSING:
├─ KNN: Scale features, handle missing values
├─ PCA: Scale features, handle missing values
├─ Naive Bayes: Choose correct variant, handle zeros
├─ Logistic Reg: Scale features, encode categoricals
└─ SVM: SCALE FEATURES (critical!), handle missing

HYPERPARAMETER PRIORITIES:
├─ KNN: k (neighbors)
├─ PCA: n_components (variance threshold)
├─ Naive Bayes: alpha (smoothing)
├─ Logistic Reg: C (regularization), penalty (L1/L2)
└─ SVM: C (regularization), kernel, gamma (if RBF)

COMMON MISTAKES TO AVOID:
✗ Not scaling for KNN/SVM/Logistic Reg
✗ Using default hyperparameters
✗ Fitting scaler on test data (data leakage)
✗ Ignoring class imbalance
✗ Not using cross-validation
✗ Using accuracy for imbalanced data
✗ Trusting Naive Bayes raw probabilities
✗ Using RBF SVM on very large datasets

═══════════════════════════════════════════════════════════
```

---

## Final Checklist

Before deploying any model, ensure:

- [ ] Chosen algorithm appropriate for problem and data size
- [ ] Features scaled (if required by algorithm)
- [ ] Missing values handled
- [ ] Categorical variables encoded
- [ ] Class imbalance addressed (if present)
- [ ] Hyperparameters tuned via cross-validation
- [ ] Model evaluated on held-out test set
- [ ] Appropriate metrics used (not just accuracy)
- [ ] Confusion matrix analyzed
- [ ] Feature importance/coefficients reviewed
- [ ] Model performance acceptable for use case
- [ ] Pipeline created to prevent data leakage
- [ ] Model and preprocessors saved
- [ ] Monitoring plan in place

---

**Good luck with your DSMP ML algorithms revision! 🚀**
