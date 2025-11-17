# Logistic Regression

## Overview
Logistic Regression is a **supervised classification algorithm** that models the probability of a binary outcome using the logistic (sigmoid) function. Despite its name, it's used for **classification**, not regression.

---

## Mathematical Formulation

### Core Equations

1. **Linear Combination**
   ```
   z = w₀ + w₁x₁ + w₂x₂ + ... + wₙxₙ
   z = w^T x + b

   where:
   - w = weights (coefficients)
   - b = bias (intercept)
   - x = features
   ```

2. **Sigmoid Function**
   ```
   σ(z) = 1 / (1 + e^(-z))

   Properties:
   - Output range: (0, 1)
   - Monotonic increasing
   - σ(0) = 0.5
   - σ(∞) = 1
   - σ(-∞) = 0
   ```

3. **Probability Prediction**
   ```
   P(Y=1|X) = σ(w^T x + b)
   P(Y=0|X) = 1 - P(Y=1|X)
   ```

4. **Classification Decision**
   ```
   ŷ = 1  if  P(Y=1|X) ≥ threshold (usually 0.5)
   ŷ = 0  otherwise
   ```

### Sigmoid Function Visualization

```
P(Y=1)
  1.0 │                    ╱────────
      │                  ╱
      │                ╱
  0.5 │──────────────●          ← Decision boundary
      │            ╱
      │          ╱
  0.0 │────────╱
      └────────────────────────────→ z
          -6  -3   0   3   6

z < 0  → P(Y=1) < 0.5 → Predict 0
z = 0  → P(Y=1) = 0.5 → Decision boundary
z > 0  → P(Y=1) > 0.5 → Predict 1
```

---

## Cost Function (Log Loss)

### Why Not MSE?

```
MSE = (1/n) Σ(y - ŷ)²

Problems:
1. Non-convex for sigmoid function
2. Multiple local minima
3. Gradient descent may not converge
```

### Log Loss (Binary Cross-Entropy)

```
L(w, b) = -(1/n) Σ [y log(ŷ) + (1-y) log(1-ŷ)]

where ŷ = σ(w^T x + b)

For single sample:
- If y=1: Loss = -log(ŷ)
- If y=0: Loss = -log(1-ŷ)

Properties:
- Convex function
- Single global minimum
- Penalizes wrong predictions heavily
```

### Loss Visualization

```
Loss
  10│              y=1
    │            ╱
    │          ╱
   5│        ╱
    │      ╱
   0│────────────────
    │      ╲
   5│        ╲
    │          ╲       y=0
  10│            ╲
    └────────────────────→ ŷ
    0.0  0.5  1.0

When y=1: ŷ→0 gives high loss (bad)
When y=0: ŷ→1 gives high loss (bad)
```

---

## Gradient Descent

### Update Rule

```
Gradient:
∂L/∂w = (1/n) Σ(ŷ - y)x
∂L/∂b = (1/n) Σ(ŷ - y)

Update:
w := w - α(∂L/∂w)
b := b - α(∂L/∂b)

where α = learning rate
```

### Algorithm

```
1. Initialize w, b randomly (or zeros)
2. Repeat until convergence:
   a. Compute predictions: ŷ = σ(w^T X + b)
   b. Compute gradients: ∂L/∂w, ∂L/∂b
   c. Update parameters: w := w - α∇w, b := b - α∇b
3. Return w, b
```

---

## Multiclass Classification

### One-vs-Rest (OvR)

```
For K classes:
- Train K binary classifiers
- Classifier i: class i vs all others
- Predict: class with highest probability

Example: 3 classes (A, B, C)
Classifier 1: P(A | X)
Classifier 2: P(B | X)
Classifier 3: P(C | X)

Prediction: argmax{P(A), P(B), P(C)}
```

### Softmax Regression (Multinomial)

```
For K classes:

z_k = w_k^T x + b_k  (for each class k)

P(Y=k|X) = exp(z_k) / Σ exp(z_j)
           j=1 to K

Example: 3 classes
z = [2.0, 1.0, 0.1]

P(class 0) = e^2.0 / (e^2.0 + e^1.0 + e^0.1) = 0.659
P(class 1) = e^1.0 / (e^2.0 + e^1.0 + e^0.1) = 0.242
P(class 2) = e^0.1 / (e^2.0 + e^1.0 + e^0.1) = 0.099

Predict: class 0 (highest probability)
```

### Cost Function for Multiclass

```
Cross-Entropy Loss:

L = -(1/n) Σ Σ y_ik log(ŷ_ik)
         i  k

where:
- y_ik = 1 if sample i belongs to class k, else 0
- ŷ_ik = predicted probability for sample i, class k
```

---

## Regularization

### Why Regularize?

```
Problems without regularization:
1. Overfitting on high-dimensional data
2. Large coefficients for correlated features
3. Unstable predictions
```

### L1 Regularization (Lasso)

```
Cost = Log Loss + λ Σ|w_j|
                    j

Effects:
- Drives some weights to exactly 0
- Automatic feature selection
- Sparse model
- Works well with many irrelevant features

Penalty visualization:
   w₂
    │
    │    ╱│╲
    │  ╱  │  ╲
────┼──────────── w₁
    │╲    │    ╱
    │  ╲ │ ╱
    │    ╲│╱

Diamond shape → Sharp corners → Some w_j = 0
```

### L2 Regularization (Ridge)

```
Cost = Log Loss + λ Σw_j²
                    j

Effects:
- Shrinks weights toward 0 (but not to 0)
- Handles multicollinearity
- Smooth model
- All features contribute

Penalty visualization:
   w₂
    │
    │   ╱─╲
    │  │   │
────┼──┼───┼──── w₁
    │  │   │
    │   ╲─╱
    │

Circular shape → Smooth → w_j ≠ 0
```

### Elastic Net

```
Cost = Log Loss + λ₁ Σ|w_j| + λ₂ Σw_j²
                     j         j

Combination of L1 and L2:
- Feature selection (L1)
- Coefficient shrinkage (L2)
- Best of both worlds
```

### Choosing Regularization Strength

```
λ (or C = 1/λ in sklearn)

λ → 0 (C → ∞):
- No regularization
- Complex model
- Risk of overfitting

λ → ∞ (C → 0):
- Heavy regularization
- Simple model (w ≈ 0)
- Risk of underfitting

Optimal: Use cross-validation
```

---

## Intuition

### The Decision Boundary Analogy

```
Imagine a line separating two regions:

         ○ ○ ○ ○
       ○ ○ ○ ○ ○
     ○ ○ ○ ○ ○ ○
   ━━━━━━━━━━━━━━━  ← Decision boundary
     ● ● ● ● ● ●
       ● ● ● ● ●
         ● ● ● ●

Above line: High probability of class ○
On line: P(○) = P(●) = 0.5
Below line: High probability of class ●

Logistic regression finds the best line!
```

### The Probability Slope

```
Distance from boundary affects confidence:

Far from boundary → High confidence (P ≈ 0.99 or 0.01)
Near boundary → Low confidence (P ≈ 0.5)

      ○ ○ ○ ○  (P ≈ 0.9)
    ○ ○ ○ ○ ○  (P ≈ 0.7)
  ○ ○ ○ ○ ○ ○  (P ≈ 0.6)
───────────────  (P = 0.5) ← Boundary
  ● ● ● ● ● ●  (P ≈ 0.4)
    ● ● ● ● ●  (P ≈ 0.3)
      ● ● ● ●  (P ≈ 0.1)
```

### Key Insights

1. **Linear decision boundary** (in feature space)
2. **Outputs probabilities** (not just labels)
3. **Interpretable coefficients** (feature importance)
4. **Works best with linearly separable data**
5. **Can be extended to non-linear** (polynomial features)

---

## Decision Boundary Visualization

### Binary Classification (2D)

```
Feature Space:

    X₂
    ↑
  4 │ ○ ○ ○ ○
    │ ○ ○ ○ ○ ○
  3 │ ○ ○ ○ ○ ○
    │  ╲  ○ ○ ○
  2 │   ╲ ○ ○ ○
    │    ╲
  1 │● ● ●╲● ●     ← Decision boundary
    │● ● ● ╲● ●      (w₁x₁ + w₂x₂ + b = 0)
  0 │● ● ● ●╲●
    └─────────────→ X₁
    0 1 2 3 4 5

Linear boundary: w₁x₁ + w₂x₂ + b = 0
```

### Non-Linear with Polynomial Features

```
Original features: [x₁, x₂]
Polynomial features: [x₁, x₂, x₁², x₂², x₁x₂]

    X₂
    ↑
  4 │ ○ ○ ○ ○
    │  ╱─╲
  3 │ ╱ ● ╲
    │○ ● ● ○
  2 │○ ● ● ○     ← Non-linear boundary
    │╲ ● ● ╱      (but linear in extended space!)
  1 │ ╲ ● ╱
    │  ╲─╱
  0 │ ○   ○
    └─────────────→ X₁
```

### Multiclass (3 classes)

```
One-vs-Rest boundaries:

    X₂
    ↑
  4 │□ □ □│○ ○
    │□ □ □│○ ○ ○
  3 │□ □ □│○ ○ ○
    │─────┼─────
  2 │● ● ●│○ ○ ○
    │● ● ●│○ ○ ○
  1 │● ● ●│○ ○
    └─────────────→ X₁

Class ●: w₁^T x + b₁ > others
Class ○: w₂^T x + b₂ > others
Class □: w₃^T x + b₃ > others
```

---

## When to Use Logistic Regression

### ✅ Good For:

1. **Binary/Multiclass Classification**
   - Email spam detection
   - Disease diagnosis (yes/no)
   - Customer churn prediction

2. **Probability Estimates Needed**
   - Risk assessment
   - Ranking by confidence
   - Decision making with thresholds

3. **Interpretable Models**
   - Need to explain predictions
   - Understand feature importance
   - Medical, legal, financial domains

4. **Linear Decision Boundaries**
   - Data is linearly separable (or close)
   - Can use polynomial features for non-linear

5. **Baseline Model**
   - Quick to train and evaluate
   - Good starting point

6. **High-Dimensional Data**
   - Works well with many features
   - Regularization prevents overfitting

### ❌ Avoid When:

1. **Highly Non-Linear Relationships**
   - Complex decision boundaries
   - Use SVM, neural nets, or tree-based methods

2. **Features are Highly Correlated**
   - Multicollinearity issues
   - Use regularization or PCA

3. **Need to Capture Interactions**
   - Must manually create interaction terms
   - Trees learn interactions automatically

4. **Imbalanced Data** (without adjustments)
   - May predict majority class always
   - Use class weights or resampling

---

## Hyperparameter Tuning

### 1. Regularization Parameter (C)

```
C = 1/λ (inverse of regularization strength)

| C Value | Effect | When to Use |
|---------|--------|-------------|
| C → 0 | Strong regularization, simple model | High-dim, many features |
| C = 0.1 | Moderate regularization | Default starting point |
| C = 1 | Balanced | Standard choice |
| C = 10 | Light regularization | Clean, separable data |
| C → ∞ | No regularization | Risk overfitting |
```

### 2. Penalty Type

```
| Penalty | Effect | Use Case |
|---------|--------|----------|
| 'l1' | Lasso, sparse weights | Feature selection needed |
| 'l2' | Ridge, all features | Default, multicollinearity |
| 'elasticnet' | L1 + L2 | Combination of both |
| 'none' | No regularization | Small datasets, few features |
```

### 3. Solver

```
| Solver | Penalty | Speed | Use Case |
|--------|---------|-------|----------|
| 'liblinear' | L1, L2 | Fast | Small datasets |
| 'lbfgs' | L2, none | Fast | Default, multiclass |
| 'newton-cg' | L2, none | Medium | Large datasets |
| 'sag' | L2, none | Fast | Large n, avg d |
| 'saga' | L1, L2, elasticnet | Fast | Large datasets, L1 |
```

### 4. Class Weights

```
| Weight | Effect | Use Case |
|--------|--------|----------|
| None | Equal weights | Balanced data |
| 'balanced' | Auto-adjust for imbalance | Imbalanced data |
| {0: 1, 1: 10} | Custom weights | Domain knowledge |
```

### 5. Decision Threshold

```
Default: 0.5

Adjust for:
- Cost-sensitive predictions
- Imbalanced data
- Different costs for FP vs FN

Example:
threshold = 0.3 → More liberal (catch more positives)
threshold = 0.7 → More conservative (fewer false positives)
```

---

## Preprocessing Requirements

### 1. Feature Scaling (Recommended)

```python
# Logistic Regression sensitive to feature scales
# Especially important with regularization

from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
```

### 2. Handle Missing Values

```python
from sklearn.impute import SimpleImputer

imputer = SimpleImputer(strategy='mean')  # or 'median', 'most_frequent'
X_imputed = imputer.fit_transform(X)
```

### 3. Encode Categorical Variables

```python
# One-hot encoding for categorical features
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(drop='first'), categorical_features)
    ])

X_processed = preprocessor.fit_transform(X)
```

### 4. Handle Multicollinearity

```python
# Check for highly correlated features
correlation_matrix = X.corr()

# Remove or use L2 regularization
from sklearn.linear_model import LogisticRegression
lr = LogisticRegression(penalty='l2', C=1.0)
```

---

## Real-World Applications

### 1. **Healthcare**
- Disease diagnosis (diabetes, cancer)
- Patient readmission prediction
- Drug response prediction

### 2. **Finance**
- Credit scoring (default/no default)
- Fraud detection
- Stock price direction (up/down)
- Loan approval

### 3. **Marketing**
- Customer churn prediction
- Purchase likelihood
- Email click-through rate
- Ad conversion

### 4. **E-commerce**
- Product recommendation
- Customer segmentation
- Abandoned cart prediction

### 5. **Manufacturing**
- Quality control (defect/no defect)
- Equipment failure prediction
- Warranty claim prediction

### 6. **HR**
- Employee attrition
- Candidate selection
- Performance prediction

---

## sklearn Implementation

### Basic Binary Classification

```python
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

# 1. Prepare data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 2. Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 3. Train model
lr = LogisticRegression(
    penalty='l2',        # L1, L2, elasticnet, none
    C=1.0,               # Inverse regularization strength
    solver='lbfgs',      # Optimization algorithm
    max_iter=1000,       # Maximum iterations
    random_state=42,
    class_weight=None    # or 'balanced' for imbalanced data
)

lr.fit(X_train_scaled, y_train)

# 4. Predict
y_pred = lr.predict(X_test_scaled)
y_pred_proba = lr.predict_proba(X_test_scaled)[:, 1]

# 5. Evaluate
print("Accuracy:", lr.score(X_test_scaled, y_test))
print("\nClassification Report:")
print(classification_report(y_test, y_pred))
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))
print(f"\nROC AUC: {roc_auc_score(y_test, y_pred_proba):.4f}")

# 6. Get coefficients
print(f"\nIntercept: {lr.intercept_}")
print(f"Coefficients: {lr.coef_}")

# Feature importance
feature_importance = pd.DataFrame({
    'feature': feature_names,
    'coefficient': lr.coef_[0],
    'abs_coefficient': np.abs(lr.coef_[0])
}).sort_values('abs_coefficient', ascending=False)

print("\nTop 10 Important Features:")
print(feature_importance.head(10))
```

### Multiclass Classification

```python
# One-vs-Rest (default)
lr_ovr = LogisticRegression(
    multi_class='ovr',  # One-vs-Rest
    solver='liblinear',
    C=1.0
)
lr_ovr.fit(X_train_scaled, y_train)

# Multinomial (Softmax)
lr_multinomial = LogisticRegression(
    multi_class='multinomial',  # Softmax regression
    solver='lbfgs',             # Required for multinomial
    C=1.0,
    max_iter=1000
)
lr_multinomial.fit(X_train_scaled, y_train)

# Predictions
y_pred = lr_multinomial.predict(X_test_scaled)
y_pred_proba = lr_multinomial.predict_proba(X_test_scaled)

# Coefficients (K sets for K classes)
print(f"Coefficients shape: {lr_multinomial.coef_.shape}")  # (n_classes, n_features)
```

### Hyperparameter Tuning

```python
from sklearn.model_selection import GridSearchCV

# Define parameter grid
param_grid = {
    'C': [0.001, 0.01, 0.1, 1, 10, 100],
    'penalty': ['l1', 'l2'],
    'solver': ['liblinear', 'saga'],  # Both support L1
    'class_weight': [None, 'balanced']
}

# Grid search
grid_search = GridSearchCV(
    LogisticRegression(max_iter=1000, random_state=42),
    param_grid,
    cv=5,
    scoring='roc_auc',  # or 'accuracy', 'f1', etc.
    n_jobs=-1,
    verbose=1
)

grid_search.fit(X_train_scaled, y_train)

print(f"Best parameters: {grid_search.best_params_}")
print(f"Best ROC AUC: {grid_search.best_score_:.4f}")

# Use best model
best_lr = grid_search.best_estimator_
y_pred = best_lr.predict(X_test_scaled)
```

### Handling Imbalanced Data

```python
# Method 1: Class weights
lr_weighted = LogisticRegression(
    class_weight='balanced',  # Auto-adjust weights
    C=1.0,
    solver='liblinear'
)

# Method 2: Custom class weights
from sklearn.utils.class_weight import compute_class_weight

class_weights = compute_class_weight(
    'balanced',
    classes=np.unique(y_train),
    y=y_train
)
weight_dict = {0: class_weights[0], 1: class_weights[1]}

lr_custom = LogisticRegression(
    class_weight=weight_dict,
    C=1.0
)

# Method 3: SMOTE (oversampling)
from imblearn.over_sampling import SMOTE

smote = SMOTE(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X_train_scaled, y_train)

lr = LogisticRegression()
lr.fit(X_resampled, y_resampled)
```

### Polynomial Features (Non-Linear Boundaries)

```python
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import Pipeline

# Create pipeline
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('poly', PolynomialFeatures(degree=2, include_bias=False)),
    ('lr', LogisticRegression(C=1.0, max_iter=1000))
])

pipeline.fit(X_train, y_train)
y_pred = pipeline.predict(X_test)

# Note: More features → risk of overfitting → use regularization
```

### ROC Curve and Threshold Tuning

```python
from sklearn.metrics import roc_curve, roc_auc_score
import matplotlib.pyplot as plt

# Get probabilities
y_pred_proba = lr.predict_proba(X_test_scaled)[:, 1]

# Compute ROC curve
fpr, tpr, thresholds = roc_curve(y_test, y_pred_proba)
roc_auc = roc_auc_score(y_test, y_pred_proba)

# Plot
plt.figure(figsize=(8, 6))
plt.plot(fpr, tpr, label=f'ROC Curve (AUC = {roc_auc:.2f})')
plt.plot([0, 1], [0, 1], 'k--', label='Random Classifier')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve')
plt.legend()
plt.grid(True)
plt.show()

# Find optimal threshold (Youden's Index)
optimal_idx = np.argmax(tpr - fpr)
optimal_threshold = thresholds[optimal_idx]
print(f"Optimal threshold: {optimal_threshold:.4f}")

# Predict with custom threshold
y_pred_custom = (y_pred_proba >= optimal_threshold).astype(int)
```

### Feature Selection with L1

```python
# L1 regularization for feature selection
lr_l1 = LogisticRegression(
    penalty='l1',
    C=0.1,  # Stronger regularization
    solver='liblinear',
    max_iter=1000
)

lr_l1.fit(X_train_scaled, y_train)

# Get selected features (non-zero coefficients)
selected_features = np.where(lr_l1.coef_[0] != 0)[0]
print(f"Number of selected features: {len(selected_features)} / {X_train.shape[1]}")
print(f"Selected features: {selected_features}")

# Train on selected features only
X_train_selected = X_train_scaled[:, selected_features]
X_test_selected = X_test_scaled[:, selected_features]

lr_final = LogisticRegression(C=1.0, solver='lbfgs')
lr_final.fit(X_train_selected, y_train)
```

### Cross-Validation

```python
from sklearn.model_selection import cross_val_score, StratifiedKFold

# K-fold cross-validation
cv_scores = cross_val_score(
    lr,
    X_train_scaled,
    y_train,
    cv=5,
    scoring='roc_auc',
    n_jobs=-1
)

print(f"CV ROC AUC: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

# Stratified K-Fold (preserves class distribution)
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(lr, X_train_scaled, y_train, cv=skf, scoring='f1')
```

---

## Common Pitfalls

### 1. **Not Scaling Features**

```python
# WRONG: Features have different scales
lr.fit(X_train, y_train)  # Age: 20-80, Income: 20K-200K

# CORRECT
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
lr.fit(X_train_scaled, y_train)
```

### 2. **Using Wrong Solver for L1**

```python
# WRONG: lbfgs doesn't support L1
lr = LogisticRegression(penalty='l1', solver='lbfgs')  # ERROR!

# CORRECT
lr = LogisticRegression(penalty='l1', solver='liblinear')
# OR
lr = LogisticRegression(penalty='l1', solver='saga')
```

### 3. **Ignoring Convergence Warnings**

```python
# If you see: "ConvergenceWarning: lbfgs failed to converge"

# Solutions:
# 1. Increase max_iter
lr = LogisticRegression(max_iter=10000)

# 2. Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 3. Increase C (less regularization)
lr = LogisticRegression(C=10.0)
```

### 4. **Not Handling Imbalanced Data**

```python
# For 90% class 0, 10% class 1

# WRONG: Model predicts all 0s (90% accuracy!)
lr = LogisticRegression()
lr.fit(X_train, y_train)

# CORRECT
lr = LogisticRegression(class_weight='balanced')
# OR adjust threshold
y_pred = (y_pred_proba >= 0.3).astype(int)
```

### 5. **Multicollinearity Issues**

```python
# Highly correlated features → unstable coefficients

# Check correlation
corr_matrix = pd.DataFrame(X).corr()
high_corr = np.where(np.abs(corr_matrix) > 0.9)

# Solutions:
# 1. Use L2 regularization
lr = LogisticRegression(penalty='l2', C=1.0)

# 2. Remove correlated features
# 3. Use PCA
```

### 6. **Treating as Regression**

```python
# WRONG: Logistic Regression is for classification!
# Don't use for continuous outputs

# For regression, use:
from sklearn.linear_model import LinearRegression, Ridge
```

### 7. **Overfitting with Polynomial Features**

```python
# High degree polynomials → too many features

# WRONG
poly = PolynomialFeatures(degree=10)  # Huge feature space!

# CORRECT: Use regularization
poly = PolynomialFeatures(degree=2)
lr = LogisticRegression(C=0.1)  # Strong regularization
```

---

## Comparison with Other Algorithms

| Aspect | Logistic Regression | Naive Bayes | SVM | Decision Trees |
|--------|---------------------|-------------|-----|----------------|
| **Type** | Discriminative | Generative | Discriminative | Non-parametric |
| **Decision Boundary** | Linear | Linear | Linear/Non-linear | Non-linear |
| **Interpretability** | High | Medium | Low | High |
| **Probabilities** | Calibrated | Uncalibrated | Via Platt scaling | Yes |
| **Training Speed** | Fast | Very Fast | Slow | Fast |
| **Prediction Speed** | Fast | Fast | Medium | Very Fast |
| **Feature Scaling** | Required | Depends | Required | Not required |
| **Handles Non-Linear** | Via features | No | Via kernels | Yes |
| **Overfitting Risk** | Medium | Low | Medium | High |
| **Small Data** | Good | Excellent | Poor | Medium |

---

## Interview Questions

### Q1: Why is it called "Logistic Regression" when it's used for classification?
**A:** Historical reasons. It uses the logistic (sigmoid) function and was originally formulated as a regression problem to predict probabilities (continuous values between 0 and 1). The classification happens by thresholding these probabilities.

### Q2: What's the difference between Logistic Regression and Linear Regression?
**A:**
- **Linear Regression**: Predicts continuous values, uses MSE loss, no activation function
- **Logistic Regression**: Predicts probabilities (0-1), uses log loss, sigmoid activation

### Q3: Why use log loss instead of MSE?
**A:** MSE with sigmoid creates a non-convex optimization problem with many local minima. Log loss is convex, guaranteeing a single global minimum for gradient descent to find.

### Q4: How do you interpret coefficients?
**A:** Coefficient w_i represents the change in log-odds for a one-unit increase in feature x_i:
- Positive coefficient → Higher x_i increases probability of class 1
- Negative coefficient → Higher x_i decreases probability of class 1
- Larger |coefficient| → More important feature

### Q5: What's the difference between L1 and L2 regularization?
**A:**
- **L1 (Lasso)**: Drives coefficients to exactly 0 → feature selection, sparse model
- **L2 (Ridge)**: Shrinks coefficients toward 0 → handles multicollinearity, all features used

### Q6: How does class_weight='balanced' work?
**A:** It adjusts weights inversely proportional to class frequencies:
```
weight_for_class_i = n_samples / (n_classes × n_samples_in_class_i)
```
Gives more importance to minority class.

---

## Summary Cheatsheet

```
Logistic Regression Quick Reference
═══════════════════════════════════════════════

Purpose: Binary/multiclass classification with probability estimates

Core Equation:
P(Y=1|X) = 1 / (1 + e^(-(w^T x + b)))

Key Hyperparameters:
├─ C: Inverse regularization (higher = less regularization)
├─ penalty: 'l1', 'l2', 'elasticnet', 'none'
├─ solver: 'liblinear', 'lbfgs', 'saga', 'newton-cg'
├─ max_iter: Maximum iterations (default=100)
└─ class_weight: None or 'balanced' for imbalanced data

Must Do:
✓ Scale features (StandardScaler)
✓ Handle missing values
✓ Check for convergence
✓ Use correct solver for penalty type

Regularization Guide:
• L1 (penalty='l1'): Feature selection, sparse model
• L2 (penalty='l2'): Handle multicollinearity, default
• Elastic Net: Combination of L1 and L2
• C values: 0.001, 0.01, 0.1, 1, 10, 100 (use CV)

Strengths:
+ Fast training and prediction
+ Probability estimates
+ Highly interpretable
+ Works well with regularization
+ Good for high-dimensional data
+ Low overfitting risk

Weaknesses:
- Assumes linear decision boundary
- Sensitive to outliers
- Requires feature scaling
- Multicollinearity affects coefficients
- Can't learn feature interactions

Best For:
• Binary/multiclass classification
• Need probability estimates
• Interpretability required
• Baseline model
• High-dimensional data
• Medical, finance, marketing

Solver Guide:
• 'liblinear': Small datasets, L1/L2
• 'lbfgs': Default, multiclass, L2 only
• 'saga': Large datasets, all penalties
• 'newton-cg': Large datasets, L2 only

Multiclass:
• multi_class='ovr': One-vs-Rest (default)
• multi_class='multinomial': Softmax (better)

Common Issues:
⚠ ConvergenceWarning → Increase max_iter or scale features
⚠ Perfect separation → Use regularization (lower C)
⚠ Imbalanced data → Use class_weight='balanced'
