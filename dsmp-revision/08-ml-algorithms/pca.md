# Principal Component Analysis (PCA)

## Overview
PCA is an **unsupervised dimensionality reduction** technique that transforms data into a new coordinate system where the greatest variances lie on the first coordinates (principal components). It's used for data compression, visualization, and noise reduction.

---

## Mathematical Formulation

### Core Concepts

1. **Covariance Matrix**
   ```
   Σ = (1/n) X^T X

   where X is mean-centered data (X - μ)
   ```

2. **Eigenvalue Decomposition**
   ```
   Σv = λv

   where:
   - v = eigenvector (principal component direction)
   - λ = eigenvalue (variance along that direction)
   ```

3. **Principal Components**
   ```
   PC_i = X · v_i

   where v_i is the i-th eigenvector
   ```

4. **Reconstruction**
   ```
   X_reconstructed = X_reduced · V_k^T + μ

   where V_k contains k principal components
   ```

### Mathematical Steps

```
1. Center data: X_centered = X - mean(X)
2. Compute covariance: Σ = (1/n) X_centered^T · X_centered
3. Compute eigenvectors & eigenvalues: Σv = λv
4. Sort by eigenvalues (descending)
5. Select top k eigenvectors → V_k
6. Transform data: X_reduced = X_centered · V_k
```

---

## Intuition

### The Shadow Analogy
```
Imagine a 3D object and a flashlight:
- Shine light from different angles
- Each angle creates a 2D shadow (projection)
- Best angle = shadow captures most details
- That's the first principal component!

3D Object         →      2D Shadow (PC1-PC2 plane)
   ╱╲                         ____
  ╱  ╲                       /    \
 ╱____╲                      \____/
```

### The Photo Compression Analogy
- Original photo: 1000 x 1000 pixels (1M dimensions)
- PCA finds patterns: "mostly blue sky, some green grass"
- Compress: Store just the essential patterns
- Reconstruct: Good approximation with 100 dimensions

### Key Insights

1. **Variance = Information**: High variance features contain more info
2. **Orthogonal Components**: Each PC is perpendicular (uncorrelated)
3. **Ordered by Importance**: PC1 > PC2 > PC3 > ...
4. **Linear Transformation**: Can't capture non-linear patterns
5. **Reversible**: Can reconstruct original data (with some loss)

---

## Visualization

### 2D Data to 1D

```
Original 2D Data:              After PCA (1D):

     ●    ●                    ●●●●●●●●●●
   ●  ●  ●                     (on PC1 axis)
  ●    ●    ●
 ●      ●      ●               Variance captured: 95%
●        ●        ●            Dimensions reduced: 50%

   │<──PC1──>│                 Lost: perpendicular spread
   └──PC2                      Kept: main direction
   (largest variance)
```

### 3D to 2D Projection

```
3D Data Cloud:                2D Projection (PC1-PC2):

    ╱ ●  ●  ●                      ● ● ●
   ╱ ●  ●  ●                      ● ● ●
  ╱  ●  ●  ●                     ● ● ●
 ╱___●__●__●
PC3 PC2  PC1                  PC2 ↑
(3%)  (22%) (75%)                 └──→ PC1

                              Explained variance: 97%
```

### Eigenvalue Spectrum

```
Eigenvalues (Variance):

λ1 ████████████████ (45%)
λ2 ██████████ (25%)
λ3 ████ (10%)
λ4 ███ (8%)
λ5 ██ (5%)
λ6 █ (3%)
λ7 █ (2%)
λ8 ▌(1%)
λ9 ▌(1%)

Cumulative: [45%, 70%, 80%, 88%, 93%, 96%, 98%, 99%, 100%]

Keep PC1-PC3 → Retain 80% variance
```

---

## When to Use PCA

### ✅ Good For:

1. **Dimensionality Reduction**
   - Too many features (curse of dimensionality)
   - Reduce computational cost
   - Avoid overfitting

2. **Data Visualization**
   - Project high-D data to 2D/3D
   - Explore data structure
   - Identify clusters

3. **Noise Reduction**
   - Remove low-variance components (often noise)
   - Image denoising
   - Signal processing

4. **Feature Extraction**
   - Create uncorrelated features
   - Preprocessing for ML models
   - Remove multicollinearity

5. **Data Compression**
   - Image compression
   - Reduce storage requirements
   - Speed up algorithms

### ❌ Avoid When:

1. **Non-linear Relationships**
   - PCA is linear; use t-SNE, UMAP, or kernel PCA

2. **Interpretability is Critical**
   - Principal components are linear combinations
   - Hard to interpret in original feature space

3. **Small Datasets**
   - May not have enough samples for reliable covariance
   - Rule of thumb: n > 10 × features

4. **Features Already Uncorrelated**
   - PCA won't help much
   - Check correlation matrix first

5. **Categorical/Binary Data**
   - PCA assumes continuous data
   - Use MCA (Multiple Correspondence Analysis) instead

---

## Explained Variance

### Variance Explained Ratio

```
Variance Explained by PC_i = λ_i / Σλ_j

Example:
Eigenvalues: [50, 30, 15, 3, 2]
Total variance: 100

PC1: 50/100 = 50%
PC2: 30/100 = 30%
PC3: 15/100 = 15%
PC4: 3/100 = 3%
PC5: 2/100 = 2%

Cumulative: [50%, 80%, 95%, 98%, 100%]
```

### Choosing Number of Components

**Method 1: Variance Threshold**
```
Keep components until cumulative variance ≥ threshold

Common thresholds:
- 80%: Aggressive reduction
- 90%: Balanced
- 95%: Conservative
- 99%: Minimal loss
```

**Method 2: Elbow Method**
```
Scree Plot (Eigenvalues vs Component Number):

   50│●
     │  ●
   40│
     │      ●
   30│
     │          ●
   20│            ●──●──●──●
     │
   10│
     └────────────────────────
      1  2  3  4  5  6  7  8
           ↑
        Elbow (keep 1-4)
```

**Method 3: Kaiser Criterion**
```
Keep components with eigenvalue > 1

Intuition: PC with λ < 1 captures less variance than a single original feature
```

**Method 4: Cross-Validation**
```
Test different k values on downstream task
Choose k that maximizes performance
```

---

## Eigenvalues and Eigenvectors

### Geometric Interpretation

```
Eigenvector (v): Direction of maximum variance
Eigenvalue (λ): Amount of variance in that direction

Original axes:        Principal axes:
    y                      PC2 ↗
    ↑                         /
    |  ●●●                   /  ●●●
    | ●●●●               PC1 ╱ ●●●●
    |●●●●●                  ╱●●●●●
    └─────→ x              ╱

λ1 = 45 (horizontal spread)
λ2 = 5  (vertical spread)
```

### Computing Eigenvalues

```python
# For 2x2 covariance matrix:
Σ = [a  b]
    [b  c]

# Eigenvalues from characteristic equation:
det(Σ - λI) = 0
λ² - (a+c)λ + (ac-b²) = 0

# Solve quadratic equation
λ1, λ2 = solutions

# Eigenvectors: (Σ - λI)v = 0
```

---

## Hyperparameter Tuning

### 1. Number of Components (n_components)

| Value | Effect | When to Use |
|-------|--------|-------------|
| Integer (k) | Keep k components | When you know desired dimensions |
| Float (0-1) | Keep enough to explain % variance | Most common (0.95 = 95%) |
| 'mle' | Automatic selection via MLE | Small datasets, continuous data |
| None | Keep all components | Analysis only |

### 2. SVD Solver

| Solver | Speed | Use Case |
|--------|-------|----------|
| 'auto' | Varies | Default, chooses best |
| 'full' | O(min(n,p)³) | Small datasets, exact solution |
| 'arpack' | Fast | Sparse data, few components |
| 'randomized' | Very fast | Large datasets, approximate |

### 3. Whitening

```python
# whiten=True: Scale components to unit variance
# Useful for: Neural networks, some ML algorithms
# Effect: X_pca has identity covariance matrix
```

---

## Preprocessing Requirements

### 1. Feature Scaling (CRITICAL!)

```python
# PCA is sensitive to feature scales!
# Feature with large scale will dominate PC1

from sklearn.preprocessing import StandardScaler

# Bad: Age [20-80], Income [20K-200K]
# → PC1 will mostly capture Income variance

# Good: Standardize first
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

### 2. Handling Missing Values

```python
from sklearn.impute import SimpleImputer

# PCA can't handle NaN
imputer = SimpleImputer(strategy='mean')
X_imputed = imputer.fit_transform(X)
```

### 3. Centering (Automatic in sklearn)

```python
# PCA requires mean-centered data
# sklearn does this automatically
X_centered = X - X.mean(axis=0)
```

---

## Real-World Applications

### 1. **Image Compression**
- Compress images while retaining visual quality
- Face recognition (Eigenfaces)
- Example: 1000x1000 image → 100 components

### 2. **Genomics & Bioinformatics**
- Gene expression analysis
- Population genetics
- Identify patterns in DNA data

### 3. **Finance**
- Portfolio optimization
- Risk management
- Factor models

### 4. **Recommender Systems**
- Netflix, Amazon product recommendations
- Latent factor analysis
- Collaborative filtering

### 5. **Natural Language Processing**
- Latent Semantic Analysis (LSA)
- Document clustering
- Topic modeling

### 6. **Computer Vision**
- Feature extraction
- Object recognition
- Eigenfaces for face detection

### 7. **Anomaly Detection**
- Reconstruct data with fewer PCs
- High reconstruction error → anomaly
- Network intrusion detection

---

## sklearn Implementation

### Basic Usage

```python
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import numpy as np
import matplotlib.pyplot as plt

# 1. Prepare data
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 2. Initialize PCA
pca = PCA(n_components=2)  # Keep 2 components

# 3. Fit and transform
X_pca = pca.fit_transform(X_scaled)

# 4. Get explained variance
print(f"Explained variance ratio: {pca.explained_variance_ratio_}")
print(f"Cumulative variance: {pca.explained_variance_ratio_.cumsum()}")

# 5. Get components (eigenvectors)
print(f"Components shape: {pca.components_.shape}")
print(f"Components:\n{pca.components_}")

# 6. Inverse transform (reconstruct)
X_reconstructed = pca.inverse_transform(X_pca)
X_original_scale = scaler.inverse_transform(X_reconstructed)
```

### Choosing Number of Components

```python
# Method 1: Variance threshold (e.g., 95%)
pca = PCA(n_components=0.95)
X_pca = pca.fit_transform(X_scaled)
print(f"Selected {pca.n_components_} components")

# Method 2: Scree plot
pca_full = PCA()
pca_full.fit(X_scaled)

plt.figure(figsize=(10, 6))
plt.plot(range(1, len(pca_full.explained_variance_)+1),
         pca_full.explained_variance_, 'bo-')
plt.xlabel('Principal Component')
plt.ylabel('Eigenvalue')
plt.title('Scree Plot')
plt.grid(True)
plt.show()

# Method 3: Cumulative variance plot
plt.figure(figsize=(10, 6))
plt.plot(range(1, len(pca_full.explained_variance_ratio_)+1),
         pca_full.explained_variance_ratio_.cumsum(), 'ro-')
plt.axhline(y=0.95, color='k', linestyle='--', label='95% threshold')
plt.xlabel('Number of Components')
plt.ylabel('Cumulative Explained Variance')
plt.title('Cumulative Variance Explained')
plt.legend()
plt.grid(True)
plt.show()
```

### Visualization in 2D/3D

```python
# 2D Visualization
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)

plt.figure(figsize=(10, 8))
scatter = plt.scatter(X_pca[:, 0], X_pca[:, 1], c=y, cmap='viridis', alpha=0.6)
plt.xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.2%} variance)')
plt.ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.2%} variance)')
plt.title('PCA Visualization')
plt.colorbar(scatter)
plt.grid(True)
plt.show()

# 3D Visualization
from mpl_toolkits.mplot3d import Axes3D

pca = PCA(n_components=3)
X_pca = pca.fit_transform(X_scaled)

fig = plt.figure(figsize=(12, 8))
ax = fig.add_subplot(111, projection='3d')
scatter = ax.scatter(X_pca[:, 0], X_pca[:, 1], X_pca[:, 2],
                     c=y, cmap='viridis', alpha=0.6)
ax.set_xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.2%})')
ax.set_ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.2%})')
ax.set_zlabel(f'PC3 ({pca.explained_variance_ratio_[2]:.2%})')
plt.colorbar(scatter)
plt.show()
```

### Component Analysis

```python
# Analyze contribution of original features to PCs
pca = PCA(n_components=3)
pca.fit(X_scaled)

# Create loadings dataframe
import pandas as pd

loadings = pd.DataFrame(
    pca.components_.T,
    columns=[f'PC{i+1}' for i in range(3)],
    index=feature_names
)

print("Feature Loadings:")
print(loadings)

# Visualize loadings
import seaborn as sns

plt.figure(figsize=(12, 8))
sns.heatmap(loadings, annot=True, cmap='coolwarm', center=0)
plt.title('PCA Component Loadings')
plt.show()

# Feature importance for PC1
pc1_importance = np.abs(loadings['PC1']).sort_values(ascending=False)
print("\nMost important features for PC1:")
print(pc1_importance.head(10))
```

### Reconstruction Error

```python
# Measure information loss
def reconstruction_error(X_original, n_components):
    pca = PCA(n_components=n_components)
    X_pca = pca.fit_transform(X_original)
    X_reconstructed = pca.inverse_transform(X_pca)

    mse = np.mean((X_original - X_reconstructed)**2)
    return mse

# Test different numbers of components
components_range = range(1, X_scaled.shape[1] + 1)
errors = [reconstruction_error(X_scaled, k) for k in components_range]

plt.figure(figsize=(10, 6))
plt.plot(components_range, errors, 'bo-')
plt.xlabel('Number of Components')
plt.ylabel('Reconstruction Error (MSE)')
plt.title('Reconstruction Error vs Number of Components')
plt.grid(True)
plt.show()
```

### Using PCA in ML Pipeline

```python
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV

# Create pipeline
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('pca', PCA()),
    ('classifier', LogisticRegression(max_iter=1000))
])

# Hyperparameter grid
param_grid = {
    'pca__n_components': [2, 5, 10, 20, 30, 50],
    'classifier__C': [0.1, 1, 10]
}

# Grid search
grid_search = GridSearchCV(
    pipeline,
    param_grid,
    cv=5,
    scoring='accuracy',
    n_jobs=-1
)

grid_search.fit(X_train, y_train)

print(f"Best parameters: {grid_search.best_params_}")
print(f"Best score: {grid_search.best_score_:.4f}")

# Evaluate
y_pred = grid_search.predict(X_test)
```

### Incremental PCA (for Large Datasets)

```python
from sklearn.decomposition import IncrementalPCA

# For data that doesn't fit in memory
n_components = 50
batch_size = 1000

ipca = IncrementalPCA(n_components=n_components, batch_size=batch_size)

# Fit in batches
for X_batch in batches:  # Generator yielding batches
    X_batch_scaled = scaler.partial_fit(X_batch).transform(X_batch)
    ipca.partial_fit(X_batch_scaled)

# Transform
X_pca = ipca.transform(X_scaled)
```

### Kernel PCA (Non-linear)

```python
from sklearn.decomposition import KernelPCA

# For non-linear dimensionality reduction
kpca = KernelPCA(
    n_components=2,
    kernel='rbf',      # or 'poly', 'sigmoid', 'cosine'
    gamma=0.1,
    fit_inverse_transform=True
)

X_kpca = kpca.fit_transform(X_scaled)

# Note: Kernel PCA is slower but can capture non-linear patterns
```

---

## Common Pitfalls

### 1. **Not Scaling Features** ⚠️

```python
# WRONG: Features have different scales
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X)  # Income dominates Age!

# CORRECT
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_pca = pca.fit_transform(X_scaled)
```

### 2. **Fitting PCA on Test Data**

```python
# WRONG: Data leakage!
pca = PCA(n_components=10)
X_train_pca = pca.fit_transform(X_train)
X_test_pca = pca.fit_transform(X_test)  # BUG!

# CORRECT
X_train_pca = pca.fit_transform(X_train)
X_test_pca = pca.transform(X_test)  # Use training PCs
```

### 3. **Interpreting Components Incorrectly**

```python
# PCA components are LINEAR COMBINATIONS
# PC1 = 0.5*age + 0.3*income - 0.2*score
# Hard to interpret in real-world terms

# For interpretability, consider:
# - Feature selection instead
# - Factor analysis
# - Domain-specific transformations
```

### 4. **Assuming PCA Removes Noise**

```python
# PCA removes LOW variance, not necessarily noise
# Noise can have high variance!

# Example: Outliers have high variance but are noise
# Solution: Remove outliers before PCA
```

### 5. **Using PCA for Feature Selection**

```python
# PCA ≠ Feature Selection
# PCA creates new features (combinations)
# Original features are all still used

# For feature selection, use:
from sklearn.feature_selection import SelectKBest, RFE
```

### 6. **Expecting PCA to Improve All Models**

```python
# PCA may hurt performance if:
# - Important info is in low-variance components
# - Model can handle high dimensions (tree-based)
# - Features are already uncorrelated

# Always compare: model with/without PCA
```

### 7. **Using PCA with Categorical Data**

```python
# PCA assumes continuous, normally distributed data

# For categorical data, use:
# - Multiple Correspondence Analysis (MCA)
# - One-hot encoding + PCA (suboptimal)
# - t-SNE or UMAP
```

### 8. **Not Checking Assumptions**

```python
# Check before PCA:
# 1. Linear relationships
# 2. Sufficient sample size (n > 10p)
# 3. No severe outliers
# 4. Features are correlated (if not, PCA won't help)

# Check correlation
correlation_matrix = np.corrcoef(X.T)
plt.imshow(correlation_matrix, cmap='coolwarm')
# If mostly white (low correlation), PCA may not help
```

---

## PCA vs Other Dimensionality Reduction

| Method | Linear | Supervised | Best For | Speed |
|--------|--------|------------|----------|-------|
| **PCA** | Yes | No | General purpose, interpretable variance | Fast |
| **t-SNE** | No | No | Visualization, non-linear structure | Slow |
| **UMAP** | No | No | Visualization, preserves global structure | Medium |
| **LDA** | Yes | Yes | Classification, maximize class separation | Fast |
| **Autoencoder** | No | No | Complex non-linear patterns | Slow |
| **ICA** | Yes | No | Independent sources (signal processing) | Medium |
| **NMF** | Yes | No | Non-negative data (images, text) | Medium |
| **Factor Analysis** | Yes | No | Latent variables, interpretability | Medium |

---

## Advanced Techniques

### 1. Sparse PCA

```python
from sklearn.decomposition import SparsePCA

# Components with many zeros (easier to interpret)
spca = SparsePCA(
    n_components=5,
    alpha=1.0,  # Sparsity parameter
    random_state=42
)
X_spca = spca.fit_transform(X_scaled)
```

### 2. Probabilistic PCA

```python
# PCA with probabilistic framework
# Handles missing data better
# Provides uncertainty estimates

from sklearn.decomposition import PCA
pca = PCA(n_components=5, svd_solver='full')
```

### 3. Robust PCA

```python
# Robust to outliers
# Separates low-rank structure from sparse noise

from sklearn.decomposition import PCA
# Use Robust Scaler before PCA
from sklearn.preprocessing import RobustScaler

robust_scaler = RobustScaler()
X_robust = robust_scaler.fit_transform(X)
pca = PCA(n_components=5)
X_pca = pca.fit_transform(X_robust)
```

---

## Interview Questions

### Q1: What's the difference between PCA and LDA?
**A:**
- **PCA**: Unsupervised, maximizes variance, no labels needed
- **LDA**: Supervised, maximizes class separation, needs labels
- **Use PCA**: General dimensionality reduction
- **Use LDA**: Classification tasks

### Q2: How does PCA handle the curse of dimensionality?
**A:** PCA reduces dimensions by projecting data onto directions of maximum variance. By keeping only top k components that explain most variance (e.g., 95%), we reduce from p→k dimensions while retaining most information. This reduces overfitting, speeds up models, and improves generalization.

### Q3: Can PCA be used for non-linear data?
**A:** Standard PCA is linear. For non-linear patterns, use:
- **Kernel PCA**: Applies kernel trick (like RBF) to capture non-linear relationships
- **Autoencoder**: Neural network-based non-linear dimensionality reduction
- **t-SNE/UMAP**: Non-linear manifold learning

### Q4: Why is feature scaling important for PCA?
**A:** PCA finds directions of maximum variance. Without scaling, features with larger scales (e.g., income vs. age) dominate the variance, and PCA will primarily capture their variation, ignoring smaller-scale but potentially important features.

### Q5: How do you choose the number of principal components?
**A:**
1. **Variance threshold**: Keep enough to explain 90-95% variance
2. **Elbow method**: Plot eigenvalues, look for "elbow"
3. **Kaiser criterion**: Keep eigenvalues > 1
4. **Cross-validation**: Test on downstream task
5. **Domain knowledge**: Based on application needs

### Q6: What's the computational complexity of PCA?
**A:**
- **SVD (sklearn)**: O(min(n²p, np²))
- **Memory**: O(np) for data, O(p²) for covariance
- **n >> p**: Use standard PCA
- **n << p**: Use dual PCA
- **Very large**: Use IncrementalPCA or randomized SVD

---

## Summary Cheatsheet

```
PCA Quick Reference
═══════════════════════════════════════════════

Purpose: Dimensionality reduction, visualization, noise reduction

Key Concepts:
├─ Eigenvectors: Directions of maximum variance
├─ Eigenvalues: Amount of variance in each direction
├─ Principal Components: Uncorrelated features
└─ Explained Variance: Information retained

Key Hyperparameters:
├─ n_components: Number/percentage to keep
├─ svd_solver: 'auto', 'full', 'arpack', 'randomized'
└─ whiten: Scale components to unit variance

Must Do Before PCA:
✓ Scale features (StandardScaler)
✓ Handle missing values
✓ Remove outliers (optional)
✓ Check for correlations

Choosing n_components:
• 0.95 → keep 95% variance (common)
• Integer k → keep k components
• 'mle' → automatic selection
• Scree plot → look for elbow

Strengths:
+ Reduces dimensions while preserving variance
+ Removes multicollinearity
+ Fast and simple
+ Reversible (can reconstruct)
+ Interpretable variance explained

Weaknesses:
- Only captures linear relationships
- Components hard to interpret
- Assumes high variance = important
- Sensitive to outliers
- Requires scaling

Common Applications:
• Data visualization (2D/3D)
• Preprocessing for ML
• Image compression
• Noise reduction
• Exploratory data analysis

When to Use:
✓ Too many features (overfitting risk)
✓ Need visualization of high-D data
✓ Features are correlated
✓ Computational efficiency needed
✗ Non-linear patterns (use Kernel PCA)
✗ Need interpretable features (use selection)
```

---

## Practical Workflow

```python
# Complete PCA Workflow
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import numpy as np
import matplotlib.pyplot as plt

# 1. Load and examine data
print(f"Original shape: {X.shape}")
print(f"Features: {X.columns.tolist()}")

# 2. Check for missing values
print(f"Missing values: {X.isnull().sum().sum()}")

# 3. Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 4. Explore all components
pca_full = PCA()
pca_full.fit(X_scaled)

# 5. Plot explained variance
plt.figure(figsize=(14, 5))

plt.subplot(1, 2, 1)
plt.plot(range(1, len(pca_full.explained_variance_)+1),
         pca_full.explained_variance_, 'bo-')
plt.xlabel('Component')
plt.ylabel('Eigenvalue')
plt.title('Scree Plot')
plt.grid(True)

plt.subplot(1, 2, 2)
plt.plot(range(1, len(pca_full.explained_variance_ratio_)+1),
         pca_full.explained_variance_ratio_.cumsum(), 'ro-')
plt.axhline(y=0.95, color='k', linestyle='--')
plt.xlabel('Number of Components')
plt.ylabel('Cumulative Variance')
plt.title('Cumulative Explained Variance')
plt.grid(True)
plt.tight_layout()
plt.show()

# 6. Choose n_components
pca = PCA(n_components=0.95)
X_pca = pca.fit_transform(X_scaled)

print(f"\nReduced shape: {X_pca.shape}")
print(f"Variance explained: {pca.explained_variance_ratio_.sum():.2%}")
print(f"Number of components: {pca.n_components_}")

# 7. Analyze components
loadings = pd.DataFrame(
    pca.components_.T,
    columns=[f'PC{i+1}' for i in range(pca.n_components_)],
    index=X.columns
)

print("\nTop features for PC1:")
print(loadings['PC1'].abs().sort_values(ascending=False).head())

# 8. Visualize (if reduced to 2-3 components)
if pca.n_components_ >= 2:
    plt.figure(figsize=(10, 6))
    plt.scatter(X_pca[:, 0], X_pca[:, 1], alpha=0.5)
    plt.xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.1%})')
    plt.ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.1%})')
    plt.title('PCA Projection')
    plt.show()
```

This completes the comprehensive PCA revision notes!
