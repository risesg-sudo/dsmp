# Support Vector Machines (SVM)

## Overview
SVM is a **supervised learning algorithm** that finds the optimal hyperplane to separate classes with maximum margin. It can handle both linear and non-linear classification using kernel functions.

---

## Mathematical Formulation

### Decision Function

```
f(x) = w^T x + b

where:
- w = weight vector (perpendicular to hyperplane)
- b = bias term
- f(x) > 0 → class +1
- f(x) < 0 → class -1
```

### Hyperplane

```
w^T x + b = 0

In 2D: w₁x₁ + w₂x₂ + b = 0  (a line)
In 3D: w₁x₁ + w₂x₂ + w₃x₃ + b = 0  (a plane)
In nD: Hyperplane
```

### Margin

```
Margin = 2 / ||w||

Goal: Maximize margin
     = Minimize ||w||
     = Minimize (1/2)||w||²
```

### Support Vectors

```
Support vectors: Training points closest to hyperplane
- Lie on margin boundaries
- w^T x + b = +1 or -1
- Determine the decision boundary
- Removing other points doesn't change boundary
```

---

## Hard Margin SVM

### Linearly Separable Data

```
Optimization Problem:

Minimize: (1/2)||w||²

Subject to: y_i(w^T x_i + b) ≥ 1  for all i

where:
- y_i ∈ {-1, +1}
- Constraint ensures all points correctly classified
- Points at least distance 1/||w|| from hyperplane
```

### Visualization

```
         Margin
         ◄─────►

    ○ ○ ○│     │● ● ●
    ○ ○ ○│     │● ● ●
  ○ ○ ○ ○│     │● ● ● ●
    ○ ○ ○│     │● ● ●
      ○ ○│     │● ●
         │     │
    Support  Decision  Support
    vectors  boundary  vectors
    (○)                  (●)

Margin = distance between dashed lines
Support vectors = circled points
```

### Limitations

```
Problems:
1. Requires perfect linear separability
2. No solution if data is not separable
3. Sensitive to outliers
4. Not robust in practice

    ○ ○ ○ ○ ○
  ○ ○ ○ ○ ○ ○
    ○ ○ ●← Noise/outlier
  ● ● ● ● ● ●
    ● ● ● ● ●

Can't find separating hyperplane!
```

---

## Soft Margin SVM

### Handling Non-Separable Data

```
Introduction: Slack variables ξ_i

Minimize: (1/2)||w||² + C Σξ_i

Subject to:
- y_i(w^T x_i + b) ≥ 1 - ξ_i
- ξ_i ≥ 0

where:
- ξ_i = slack variable (allows misclassification)
- C = regularization parameter (penalty for errors)
```

### Slack Variables

```
ξ_i interpretation:

ξ_i = 0:  Correctly classified, outside margin
ξ_i < 1:  Correctly classified, inside margin
ξ_i = 1:  On decision boundary
ξ_i > 1:  Misclassified

    ○ ○ ○│     │● ● ●
  ○ ○ ○ ○│ ○   │● ● ● ●
    ○ ○ ○│  ●  │● ● ●
      ○ ○│     │● ●
         │     │
         ↑     ↑
      ξ > 1  ξ < 1
    (error) (margin violation)
```

### Regularization Parameter C

```
C → ∞:  Hard margin (no errors allowed)
        - Narrow margin
        - Overfitting risk
        - Sensitive to outliers

C → 0:  Soft margin (many errors allowed)
        - Wide margin
        - Underfitting risk
        - Robust to outliers

Optimal C: Use cross-validation

Large C (strict):        Small C (lenient):
    ○ ○ ○│● ● ●            ○ ○ ○   ● ● ●
  ○ ○ ○ ○│● ● ● ●        ○ ○ ○ ○ ● ● ● ●
    ○ ○ ○│● ● ●            ○ ○ ○   ● ● ●
      ○ ○│● ●                ○ ○     ● ●
         │                           │
    Narrow margin              Wide margin
    Few support vectors        Many support vectors
```

---

## Kernel Trick

### Non-Linear Classification

```
Idea: Map data to higher dimension where it's linearly separable

Original space (2D):     Feature space (3D):
    ○ ○ ○ ○ ○              ○ ○ ○ ○ ○
  ○ ● ● ● ● ○                    ▲
    ● ● ● ●                      │
  ○ ● ● ● ● ○              ● ● ●│● ● ●
    ○ ○ ○ ○ ○                    │

Not linearly separable    Linearly separable!
                         (plane separates them)
```

### Kernel Function

```
Instead of:
1. Map to high dimension: Φ(x)
2. Compute dot product: Φ(x_i)^T Φ(x_j)

Use kernel function directly:
K(x_i, x_j) = Φ(x_i)^T Φ(x_j)

Benefits:
- Avoid explicit high-dimensional computation
- Efficient (compute in original space)
- Infinite dimensional features possible!
```

---

## Common Kernels

### 1. Linear Kernel

```
K(x, x') = x^T x'

Use case:
- Already linearly separable
- High-dimensional data (text)
- Fast training and prediction

Decision boundary: Linear hyperplane
```

### 2. Polynomial Kernel

```
K(x, x') = (γ x^T x' + r)^d

Parameters:
- d: degree (2, 3, 4, ...)
- γ: gamma (scaling)
- r: coefficient (default=0)

Use case:
- Moderate non-linearity
- Image classification
- Face recognition

Example (d=2):
Creates features like x₁², x₂², x₁x₂

Decision boundary:
d=2: Parabola, ellipse, hyperbola
d=3: Cubic curves
d=4+: More complex
```

### 3. RBF (Radial Basis Function) Kernel

```
K(x, x') = exp(-γ ||x - x'||²)

Parameter:
- γ (gamma): Kernel coefficient
  - Large γ: Tight fit (complex boundary, overfitting)
  - Small γ: Loose fit (simple boundary, underfitting)

Properties:
- Most popular kernel
- Infinite dimensional feature space
- Distance-based (similar points → high similarity)

Decision boundary: Can be very complex

      ○ ○ ○ ○ ○
    ○ ● ● ● ● ○    ← Non-linear boundary
      ● ● ● ●
    ○ ● ● ● ● ○      (circles, islands, etc.)
      ○ ○ ○ ○ ○
```

### 4. Sigmoid Kernel

```
K(x, x') = tanh(γ x^T x' + r)

Parameters:
- γ: gamma
- r: coefficient

Use case:
- Neural network-like behavior
- Less common
- Can be unstable
```

---

## Kernel Visualization

### Linear vs RBF

```
Linear Kernel:                RBF Kernel:
    ○ ○ ○│● ● ●                  ○ ○ ○╱╲● ● ●
  ○ ○ ○ ○│● ● ● ●              ○ ○ ○╱  ╲● ● ● ●
    ○ ○ ○│● ● ●                  ○ ○╱    ╲● ● ●
      ○ ○│● ●                      ○╱      ╲● ●
         │
    Straight line              Curved boundary

Underfits curved data         Captures non-linearity
```

### Effect of Gamma (RBF)

```
Small γ (0.01):             Medium γ (1):           Large γ (100):
  ○ ○ ○   ● ● ●              ○ ○ ○ │● ● ●            ○│○│○  ●│●│●
○ ○ ○ ○ ● ● ● ●            ○ ○ ○ ○╱● ● ● ●          ○│○│○○●│●│● ●
  ○ ○ ○   ● ● ●              ○ ○ ○╱ ● ● ●            ○│○│○  ●│●│●
    ○ ○     ● ●                 ○ ○│  ● ●               │ │    │ │

Smooth, simple              Balanced                 Highly complex
Underfitting                Good fit                 Overfitting
                                                     Memorizes data
```

---

## Intuition

### The Maximum Margin Idea

```
Question: Which line is best?

Line A:                  Line B:                  Line C (SVM):
  ○ ○ ○│● ● ●             ○ ○ ○ │● ● ●             ○ ○ ○│     │● ● ●
○ ○ ○ ○│● ● ● ●         ○ ○ ○ ○│ ● ● ● ●       ○ ○ ○ ○│     │● ● ● ●
  ○ ○ ○│● ● ●             ○ ○ ○│  ● ● ●           ○ ○ ○│     │● ● ●
    ○ ○│● ●                 ○ ○ │   ● ●              ○ ○│     │● ●
       │                        │                        │     │
                                                    ◄─margin─►
Too close to ○           Too close to ●            Maximum margin!
Less robust              Less robust               Most robust
```

### Street Analogy

```
Imagine a street separating two neighborhoods:

Narrow street:              Wide street (SVM):
○ ○│● ●                     ○ ○│     │● ●
○ ○│● ●                     ○ ○│     │● ●
○ ○│● ●                     ○ ○│     │● ●

Hard to walk through        Easy to walk through
Easily violated             Robust to new points
```

### Support Vectors = Critical Points

```
Only points near boundary matter:

  ○ ○ ○│     │● ● ●         Remove far points:
○ ○ ○ ○│     │● ● ● ●         ○ ○│     │● ●
  ○ ○ ○│     │● ● ●           ○ ○│     │● ●
    ○ ○│     │● ●               ○│     │●

Support vectors marked ●      Same boundary!
Others don't affect decision
```

---

## When to Use SVM

### ✅ Good For:

1. **Small to Medium Datasets**
   - n < 10,000 samples
   - Computational cost: O(n²) to O(n³)

2. **High-Dimensional Data**
   - Text classification (sparse, high-D)
   - Gene expression analysis
   - Image recognition

3. **Clear Margin of Separation**
   - Classes are well-separated
   - Few outliers

4. **Need Non-Linear Boundaries**
   - RBF kernel handles complex shapes
   - Polynomial for moderate non-linearity

5. **Robust to Overfitting**
   - Regularization via C parameter
   - Maximum margin principle

6. **Binary Classification**
   - SVM naturally binary
   - Can extend to multiclass

### ❌ Avoid When:

1. **Very Large Datasets**
   - Slow training (quadratic complexity)
   - Use Linear SVM or SGDClassifier instead

2. **Many Classes**
   - Multiclass SVM is slower
   - Tree-based methods may be better

3. **Need Probability Estimates**
   - SVM doesn't naturally output probabilities
   - Need Platt scaling (slower)

4. **Noisy Data with Overlapping Classes**
   - Hard to find good margin
   - Try Naive Bayes or trees

5. **Real-Time Predictions**
   - RBF kernel prediction can be slow
   - Use linear models or trees

6. **Interpretability Required**
   - Kernel SVM is black box
   - Use logistic regression or trees

---

## Hyperparameter Tuning

### 1. Regularization Parameter (C)

```
| C Value | Effect | When to Use |
|---------|--------|-------------|
| C → 0 | Wide margin, many errors | Noisy, overlapping data |
| C = 0.1 | Soft margin | Default starting point |
| C = 1 | Balanced | Standard choice |
| C = 10 | Narrow margin | Clean, separable data |
| C → ∞ | Hard margin, no errors | Risk overfitting |

Rule of thumb: Try [0.1, 1, 10, 100, 1000]
```

### 2. Kernel Choice

```
| Kernel | When to Use | Speed | Complexity |
|--------|-------------|-------|------------|
| linear | High-D, text, separable | Fast | Low |
| poly | Moderate non-linearity | Medium | Medium |
| rbf | Unknown pattern, default | Slow | High |
| sigmoid | Neural net-like | Medium | Medium |
```

### 3. Gamma (RBF/Poly Kernels)

```
| γ Value | Effect | When to Use |
|---------|--------|-------------|
| 'scale' (default) | γ = 1/(n_features × X.var()) | Balanced |
| 'auto' | γ = 1/n_features | Simple |
| γ → 0 | Simple boundary | Underfitting risk |
| γ = 1 | Medium complexity | Standard |
| γ → ∞ | Complex boundary | Overfitting risk |

Rule of thumb: Try [0.001, 0.01, 0.1, 1, 10]
```

### 4. Degree (Polynomial Kernel)

```
| Degree | Complexity | Use Case |
|--------|------------|----------|
| d = 1 | Linear | Same as linear kernel |
| d = 2 | Quadratic | Most common |
| d = 3 | Cubic | More complex |
| d ≥ 4 | High | Overfitting risk |

Start with d=2, rarely go beyond d=3
```

### 5. Class Weights

```
For imbalanced data:

class_weight='balanced': Auto-adjust
class_weight={0: 1, 1: 10}: Custom weights
```

---

## Preprocessing Requirements

### 1. Feature Scaling (CRITICAL!)

```python
# SVM is EXTREMELY sensitive to feature scales!

from sklearn.preprocessing import StandardScaler

# Bad: Features with different scales
# Age [20-80] vs Income [20K-200K]
# → SVM will be dominated by Income dimension

# Good: Scale all features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
```

### 2. Handle Missing Values

```python
from sklearn.impute import SimpleImputer

imputer = SimpleImputer(strategy='mean')
X_imputed = imputer.fit_transform(X)
```

### 3. Remove Outliers (Optional)

```python
# SVM can be sensitive to outliers (even with soft margin)

from sklearn.ensemble import IsolationForest

iso = IsolationForest(contamination=0.1)
outliers = iso.fit_predict(X)
X_clean = X[outliers == 1]
y_clean = y[outliers == 1]
```

---

## Real-World Applications

### 1. **Text Classification**
- Spam detection
- Sentiment analysis
- Document categorization
- Topic classification

### 2. **Image Recognition**
- Face detection/recognition
- Handwriting recognition (MNIST)
- Object classification
- Medical image analysis

### 3. **Bioinformatics**
- Protein classification
- Gene expression analysis
- Disease diagnosis
- Drug discovery

### 4. **Finance**
- Credit scoring
- Fraud detection
- Stock market prediction
- Risk assessment

### 5. **Medical Diagnosis**
- Cancer detection
- Disease classification
- Patient risk stratification

### 6. **Anomaly Detection**
- One-class SVM for outlier detection
- Network intrusion detection
- Manufacturing defect detection

---

## sklearn Implementation

### Binary Classification (RBF Kernel)

```python
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix

# 1. Prepare data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 2. Scale features (CRITICAL!)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 3. Train SVM
svm = SVC(
    C=1.0,                    # Regularization parameter
    kernel='rbf',             # Kernel type
    gamma='scale',            # Kernel coefficient
    class_weight=None,        # Or 'balanced' for imbalanced
    probability=False,        # Set True for probabilities (slower)
    random_state=42
)

svm.fit(X_train_scaled, y_train)

# 4. Predict
y_pred = svm.predict(X_test_scaled)

# 5. Evaluate
print("Accuracy:", svm.score(X_test_scaled, y_test))
print("\nClassification Report:")
print(classification_report(y_test, y_pred))
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# 6. Support vectors
print(f"\nNumber of support vectors: {svm.n_support_}")
print(f"Support vector indices: {svm.support_}")
print(f"Support vectors shape: {svm.support_vectors_.shape}")
```

### Linear SVM (Large Datasets)

```python
from sklearn.svm import LinearSVC

# Faster for large datasets
linear_svm = LinearSVC(
    C=1.0,
    loss='hinge',           # Or 'squared_hinge'
    penalty='l2',           # Or 'l1'
    dual=True,              # False if n_samples > n_features
    max_iter=1000,
    random_state=42
)

linear_svm.fit(X_train_scaled, y_train)
y_pred = linear_svm.predict(X_test_scaled)

# Get coefficients (like logistic regression)
print(f"Coefficients: {linear_svm.coef_}")
print(f"Intercept: {linear_svm.intercept_}")
```

### Hyperparameter Tuning

```python
from sklearn.model_selection import GridSearchCV

# Define parameter grid
param_grid = {
    'C': [0.1, 1, 10, 100],
    'gamma': ['scale', 'auto', 0.001, 0.01, 0.1, 1],
    'kernel': ['rbf', 'poly', 'sigmoid']
}

# Grid search
grid_search = GridSearchCV(
    SVC(),
    param_grid,
    cv=5,
    scoring='accuracy',
    n_jobs=-1,
    verbose=1
)

grid_search.fit(X_train_scaled, y_train)

print(f"Best parameters: {grid_search.best_params_}")
print(f"Best cross-validation score: {grid_search.best_score_:.4f}")

# Use best model
best_svm = grid_search.best_estimator_
y_pred = best_svm.predict(X_test_scaled)

# Evaluate
print(f"Test accuracy: {accuracy_score(y_test, y_pred):.4f}")
```

### Polynomial Kernel

```python
svm_poly = SVC(
    kernel='poly',
    degree=3,              # Polynomial degree
    gamma='scale',
    coef0=0.0,            # Independent term
    C=1.0
)

svm_poly.fit(X_train_scaled, y_train)
y_pred = svm_poly.predict(X_test_scaled)
```

### Probability Estimates

```python
# Enable probability estimates (slower)
svm_proba = SVC(
    kernel='rbf',
    C=1.0,
    probability=True,      # Enable probabilities
    random_state=42
)

svm_proba.fit(X_train_scaled, y_train)

# Get probabilities
y_pred_proba = svm_proba.predict_proba(X_test_scaled)

# Decision function (distance from hyperplane)
decision_scores = svm_proba.decision_function(X_test_scaled)
```

### Multiclass Classification

```python
# SVM automatically handles multiclass (One-vs-One or One-vs-Rest)

# One-vs-Rest
svm_ovr = SVC(
    decision_function_shape='ovr',  # One-vs-Rest
    kernel='rbf',
    C=1.0
)

# One-vs-One (default)
svm_ovo = SVC(
    decision_function_shape='ovo',  # One-vs-One
    kernel='rbf',
    C=1.0
)

svm_ovo.fit(X_train_scaled, y_train)
y_pred = svm_ovo.predict(X_test_scaled)
```

### Handling Imbalanced Data

```python
# Method 1: Class weights
svm_weighted = SVC(
    kernel='rbf',
    C=1.0,
    class_weight='balanced',  # Auto-adjust weights
    random_state=42
)

# Method 2: Custom weights
from sklearn.utils.class_weight import compute_class_weight

class_weights = compute_class_weight(
    'balanced',
    classes=np.unique(y_train),
    y=y_train
)
weight_dict = {i: w for i, w in enumerate(class_weights)}

svm_custom = SVC(
    kernel='rbf',
    C=1.0,
    class_weight=weight_dict
)

# Method 3: SMOTE
from imblearn.over_sampling import SMOTE

smote = SMOTE(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X_train_scaled, y_train)

svm = SVC(kernel='rbf', C=1.0)
svm.fit(X_resampled, y_resampled)
```

### Cross-Validation

```python
from sklearn.model_selection import cross_val_score

# Cross-validation scores
cv_scores = cross_val_score(
    svm,
    X_train_scaled,
    y_train,
    cv=5,
    scoring='accuracy',
    n_jobs=-1
)

print(f"CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
```

### One-Class SVM (Anomaly Detection)

```python
from sklearn.svm import OneClassSVM

# Train on normal data only
ocsvm = OneClassSVM(
    kernel='rbf',
    gamma='scale',
    nu=0.1  # Expected proportion of outliers
)

ocsvm.fit(X_train_normal_scaled)

# Predict: +1 for normal, -1 for anomaly
y_pred = ocsvm.predict(X_test_scaled)
anomalies = X_test_scaled[y_pred == -1]
```

### Visualizing Decision Boundary

```python
import numpy as np
import matplotlib.pyplot as plt

def plot_decision_boundary(model, X, y, resolution=0.02):
    # Setup marker generator and color map
    markers = ('s', 'x', 'o', '^', 'v')
    colors = ('red', 'blue', 'lightgreen', 'gray', 'cyan')
    cmap = ListedColormap(colors[:len(np.unique(y))])

    # Plot decision surface
    x1_min, x1_max = X[:, 0].min() - 1, X[:, 0].max() + 1
    x2_min, x2_max = X[:, 1].min() - 1, X[:, 1].max() + 1
    xx1, xx2 = np.meshgrid(np.arange(x1_min, x1_max, resolution),
                           np.arange(x2_min, x2_max, resolution))

    Z = model.predict(np.array([xx1.ravel(), xx2.ravel()]).T)
    Z = Z.reshape(xx1.shape)

    plt.contourf(xx1, xx2, Z, alpha=0.3, cmap=cmap)
    plt.xlim(xx1.min(), xx1.max())
    plt.ylim(xx2.min(), xx2.max())

    # Plot samples
    for idx, cl in enumerate(np.unique(y)):
        plt.scatter(x=X[y == cl, 0], y=X[y == cl, 1],
                   alpha=0.8, c=colors[idx],
                   marker=markers[idx], label=cl)

    # Plot support vectors
    plt.scatter(model.support_vectors_[:, 0],
               model.support_vectors_[:, 1],
               s=100, linewidth=1, facecolors='none',
               edgecolors='k', label='Support Vectors')

    plt.legend()
    plt.xlabel('Feature 1')
    plt.ylabel('Feature 2')
    plt.title('SVM Decision Boundary')
    plt.show()

# Use it
plot_decision_boundary(svm, X_train_scaled, y_train)
```

---

## Common Pitfalls

### 1. **Not Scaling Features** ⚠️

```python
# WRONG: SVM VERY sensitive to scales!
svm.fit(X_train, y_train)

# CORRECT
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
svm.fit(X_train_scaled, y_train)

# Impact: Feature with largest scale dominates decision
```

### 2. **Using Default Parameters**

```python
# Default C=1, gamma='scale' may not be optimal

# Always tune hyperparameters
param_grid = {
    'C': [0.1, 1, 10, 100],
    'gamma': ['scale', 0.001, 0.01, 0.1, 1]
}
grid_search = GridSearchCV(SVC(kernel='rbf'), param_grid, cv=5)
```

### 3. **Using RBF on Large Datasets**

```python
# SLOW: RBF SVM on 100K+ samples
svm = SVC(kernel='rbf')
svm.fit(X_large, y_large)  # Takes hours!

# FAST: Use Linear SVM instead
from sklearn.svm import LinearSVC
linear_svm = LinearSVC()
linear_svm.fit(X_large, y_large)  # Much faster!

# OR use SGDClassifier (linear SVM with SGD)
from sklearn.linear_model import SGDClassifier
sgd_svm = SGDClassifier(loss='hinge')  # Linear SVM
```

### 4. **Requesting Probabilities by Default**

```python
# SLOW: probability=True uses cross-validation
svm = SVC(probability=True)  # 5x slower!

# FAST: Only enable if needed
svm = SVC(probability=False)  # Default

# If you need probabilities, use:
# - CalibratedClassifierCV
# - Or accept the slowdown
```

### 5. **Ignoring Imbalanced Data**

```python
# Problem: 90% class 0, 10% class 1
# SVM may predict all class 0

# Solution: Use class weights
svm = SVC(class_weight='balanced')
```

### 6. **Wrong Kernel Choice**

```python
# Linear data with RBF kernel → Slower, no benefit
# Use linear kernel for linear data

# Check if linear works first:
svm_linear = SVC(kernel='linear')
# If good, no need for RBF

# Only use RBF if linear fails
```

### 7. **Not Handling Convergence Issues**

```python
# LinearSVC may not converge

# WRONG: Ignore warning
linear_svm = LinearSVC()

# CORRECT: Increase iterations or scale features
linear_svm = LinearSVC(max_iter=10000)
# Or scale features better
```

### 8. **Using SVC Instead of LinearSVC for Linear Kernel**

```python
# SLOW
svm = SVC(kernel='linear')  # Uses libsvm

# FAST
from sklearn.svm import LinearSVC
linear_svm = LinearSVC()  # Uses liblinear (faster!)
```

---

## Comparison with Other Algorithms

| Aspect | SVM | Logistic Regression | Random Forest | Neural Networks |
|--------|-----|---------------------|---------------|-----------------|
| **Training Speed** | Slow (O(n²)) | Fast | Medium | Slow |
| **Prediction Speed** | Medium | Fast | Fast | Fast |
| **Non-linear** | Yes (kernels) | No (need features) | Yes | Yes |
| **Interpretability** | Low (kernel) | High | Medium | Low |
| **High Dimensions** | Good | Good | Medium | Poor |
| **Large Datasets** | Poor | Good | Good | Good |
| **Overfitting** | Medium | Low | Medium | High |
| **Hyperparameters** | C, γ, kernel | C, penalty | Many | Many |
| **Probabilities** | Via Platt | Native | Native | Native |
| **Memory** | High | Low | Medium | High |

---

## Kernel Comparison

| Kernel | Linear Separability | Parameters | Speed | Overfitting Risk |
|--------|---------------------|------------|-------|------------------|
| **Linear** | Yes | C | Fast | Low |
| **Polynomial** | No | C, degree, γ | Medium | Medium |
| **RBF** | No | C, γ | Slow | High (large γ) |
| **Sigmoid** | No | C, γ | Medium | Medium |

---

## Interview Questions

### Q1: How does SVM find the optimal hyperplane?
**A:** SVM maximizes the margin (distance between hyperplane and closest points from each class). It's formulated as: minimize ||w||² subject to correct classification constraints. This becomes a quadratic programming problem solved using optimization techniques.

### Q2: What are support vectors?
**A:** Support vectors are training samples that lie on the margin boundaries (distance 1/||w|| from hyperplane). They're critical points that define the decision boundary. Removing other points doesn't change the boundary.

### Q3: What's the difference between hard and soft margin SVM?
**A:**
- **Hard Margin**: No misclassification allowed. Requires perfect linear separability. Sensitive to outliers.
- **Soft Margin**: Allows some errors via slack variables ξᵢ. Controlled by C parameter. More robust.

### Q4: Explain the kernel trick.
**A:** Instead of explicitly mapping data to high dimensions and computing dot products (expensive), we use kernel functions K(x,x') that directly compute the dot product in the transformed space. This allows infinite dimensional mappings (RBF) efficiently.

### Q5: How do you choose between kernels?
**A:**
1. Start with **linear**: Fast, works for high-D (text)
2. Try **RBF**: General purpose, handles unknown patterns
3. Use **polynomial**: Moderate non-linearity, specific domains
4. Tune with cross-validation

### Q6: What's the role of C and gamma?
**A:**
- **C**: Regularization. Large C = strict (narrow margin, few errors), Small C = lenient (wide margin, more errors)
- **gamma**: Kernel coefficient (RBF/poly). Large γ = complex boundary (overfitting), Small γ = simple boundary (underfitting)

### Q7: Why is feature scaling critical for SVM?
**A:** SVM finds the maximum margin using distances. Features with larger scales dominate the distance computation, making other features irrelevant. Scaling ensures all features contribute equally.

### Q8: When to use SVM vs Logistic Regression?
**A:**
- **SVM**: Non-linear boundaries, small-medium data, high-D, no probabilities needed
- **Logistic Regression**: Linear boundaries, large data, need probabilities, interpretability

---

## Summary Cheatsheet

```
SVM Quick Reference
═══════════════════════════════════════════════

Purpose: Classification with maximum margin separation

Core Idea:
- Find hyperplane that maximizes margin
- Support vectors determine boundary
- Kernel trick for non-linear boundaries

Key Hyperparameters:
├─ C: Regularization (0.1, 1, 10, 100, 1000)
│  • Large C: Strict, narrow margin
│  • Small C: Lenient, wide margin
├─ kernel: 'linear', 'rbf', 'poly', 'sigmoid'
│  • linear: Fast, high-D data
│  • rbf: Default, non-linear
│  • poly: Moderate non-linearity
└─ gamma: Kernel coefficient (0.001, 0.01, 0.1, 1)
   • Large γ: Complex boundary (overfit risk)
   • Small γ: Simple boundary (underfit risk)

Must Do:
✓ Scale features (StandardScaler) - CRITICAL!
✓ Handle missing values
✓ Tune C and gamma via cross-validation
✓ Use class_weight for imbalanced data

Kernel Selection:
1. Try linear first (fast)
2. If fails, try RBF (default non-linear)
3. Tune C and gamma
4. Consider polynomial for specific domains

Strengths:
+ Effective in high dimensions
+ Memory efficient (only stores support vectors)
+ Versatile (different kernels)
+ Robust to overfitting (max margin)
+ Works well with clear margin

Weaknesses:
- Slow on large datasets (O(n²) to O(n³))
- Sensitive to feature scaling
- No probability estimates (need Platt scaling)
- Hard to interpret (especially with kernels)
- Many hyperparameters to tune

Best For:
• Small to medium datasets (< 10K)
• High-dimensional data (text, images)
• Clear margin of separation
• Non-linear boundaries
• Binary classification

Avoid When:
✗ Very large datasets (use LinearSVC or SGD)
✗ Many classes (slower)
✗ Need probabilities (use LR or trees)
✗ Need interpretability
✗ Real-time predictions with RBF

Complexity:
• Training: O(n²) to O(n³)
• Prediction: O(n_sv × d) where n_sv = support vectors
• Memory: O(n_sv × d)

Common Issues:
⚠ Not scaled → Poor performance
⚠ Large dataset → Too slow (use LinearSVC)
⚠ Default params → Suboptimal (tune C, γ)
⚠ Imbalanced data → Use class_weight='balanced'

Quick Start:
```python
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train SVM
svm = SVC(kernel='rbf', C=1.0, gamma='scale')
svm.fit(X_train_scaled, y_train)

# Tune hyperparameters
from sklearn.model_selection import GridSearchCV
param_grid = {
    'C': [0.1, 1, 10, 100],
    'gamma': ['scale', 0.001, 0.01, 0.1, 1]
}
grid = GridSearchCV(SVC(kernel='rbf'), param_grid, cv=5)
grid.fit(X_train_scaled, y_train)
```
