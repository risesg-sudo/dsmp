# Principal Component Analysis (PCA) - Fundamentals

## What You'll Learn
PCA is one of the most powerful and widely-used techniques in machine learning. It finds the directions of maximum variance in your data, allowing you to reduce dimensions while preserving the most important information. You'll master both the covariance and SVD approaches to PCA, understanding when and how to use each.

---

## What is PCA?

PCA finds the directions along which your data varies most, then projects data onto these directions.

### The Goal

```
Given: High-dimensional data
Want: Lower-dimensional representation that preserves maximum variance

PCA finds orthogonal directions (principal components) ranked by how much variance they explain.

PC1: Direction of maximum variance
PC2: Direction of maximum variance orthogonal to PC1
PC3: Direction of maximum variance orthogonal to PC1 and PC2
...
```

### Visual Intuition

```
Original 2D data (scattered points):

    y
    |  *  *  *
    | *  *  *
    |*  *  *
    |________x

Points spread more along diagonal direction

After PCA rotation:
    PC2
     ↑
     |  *  *  *
     | *  *  *
     |*  *  *
     |________→ PC1

PC1 captures most variance
PC2 captures remaining variance

Project onto PC1 only (1D):
    |  |  |
    *  *  *  (preserves most information)
```

---

## PCA Algorithm (Covariance Method)

The classical approach using eigendecomposition.

### Steps

```
1. Center the data: X_centered = X - mean(X)
2. Compute covariance matrix: Cov = XᵀX / (n-1)
3. Eigendecompose: Cov = QΛQᵀ
4. Sort eigenvectors by eigenvalues (descending)
5. Project data: X_pca = X_centered @ Q
6. Keep top k components for dimensionality reduction
```

### Complete Example

```python
import numpy as np

# Step 0: Create data (10 samples, 2 features)
X = np.array([
    [2.5, 2.4],
    [0.5, 0.7],
    [2.2, 2.9],
    [1.9, 2.2],
    [3.1, 3.0],
    [2.3, 2.7],
    [2.0, 1.6],
    [1.0, 1.1],
    [1.5, 1.6],
    [1.1, 0.9]
])

# Step 1: Center data
mean = np.mean(X, axis=0)
print(f"Mean: {mean}")  # [1.81, 1.91]

X_centered = X - mean

# Step 2: Compute covariance matrix
n = X_centered.shape[0]
cov = (X_centered.T @ X_centered) / (n - 1)
print(f"Covariance:\n{cov}")
# [[0.616, 0.615],
#  [0.615, 0.717]]

# Step 3: Eigendecompose
eigenvalues, eigenvectors = np.linalg.eig(cov)
print(f"Eigenvalues: {eigenvalues}")   # [1.284, 0.049]
print(f"Eigenvectors:\n{eigenvectors}")

# Step 4: Sort by eigenvalue (descending)
idx = eigenvalues.argsort()[::-1]
eigenvalues = eigenvalues[idx]
eigenvectors = eigenvectors[:, idx]

# PC1 explains how much variance?
explained_variance_ratio = eigenvalues / eigenvalues.sum()
print(f"PC1 explains {explained_variance_ratio[0]*100:.1f}% of variance")
# 96.3%!

# Step 5: Project data onto principal components
X_pca = X_centered @ eigenvectors
print(f"Projected data shape: {X_pca.shape}")  # (10, 2)

# Step 6: Reduce dimensionality (keep only PC1)
k = 1
X_reduced = X_centered @ eigenvectors[:, :k]
print(f"Reduced data shape: {X_reduced.shape}")  # (10, 1)
```

---

## PCA via SVD (Preferred Method)

Modern implementations use SVD - it's more numerically stable and efficient.

### Why SVD is Better

```
Advantages:
1. No need to form covariance matrix XᵀX
   - Avoids numerical precision issues
   - More stable for ill-conditioned data

2. Directly gives projections
   - X_pca = U @ diag(S)
   - No separate projection step

3. More efficient for n >> p
   - SVD of X is cheaper than eigendecomp of XᵀX

4. Standard in scikit-learn and industry
```

### SVD-based PCA Algorithm

```
Steps:
1. Center data: X_centered = X - mean(X)
2. SVD: X_centered = UΣVᵀ
3. Principal components = columns of V (or rows of Vᵀ)
4. Eigenvalues = (singular values)² / (n-1)
5. Projected data = UΣ (or equivalently X_centered @ V)
6. Keep top k components
```

### Implementation

```python
def pca_svd(X, n_components=None):
    """
    PCA using SVD (more stable).

    Args:
        X: Data matrix (n_samples, n_features)
        n_components: Number of components to keep

    Returns:
        X_reduced: Projected data
        components: Principal components
        explained_var: Explained variance ratios
    """
    # Step 1: Center
    mean = np.mean(X, axis=0)
    X_centered = X - mean

    # Step 2: SVD
    U, S, Vt = np.linalg.svd(X_centered, full_matrices=False)

    # Step 3: Components are rows of Vt (or columns of V)
    V = Vt.T  # V.shape = (n_features, n_features)

    # Step 4: Eigenvalues from singular values
    n_samples = X_centered.shape[0]
    eigenvalues = (S ** 2) / (n_samples - 1)

    # Step 5: Explained variance
    explained_var = eigenvalues / eigenvalues.sum()

    # Step 6: Project data
    if n_components is None:
        n_components = len(S)

    X_reduced = U[:, :n_components] @ np.diag(S[:n_components])
    # Equivalently: X_reduced = X_centered @ V[:, :n_components]

    components = V[:, :n_components].T  # (n_components, n_features)

    return X_reduced, components, explained_var[:n_components]


# Test
X = np.random.randn(100, 10)
X_reduced, components, explained_var = pca_svd(X, n_components=3)

print(f"Original shape: {X.shape}")       # (100, 10)
print(f"Reduced shape: {X_reduced.shape}") # (100, 3)
print(f"Explained variance: {explained_var}")
print(f"Total variance explained: {explained_var.sum():.2%}")
```

---

## Choosing Number of Components

How many components should you keep?

### Method 1: Explained Variance Threshold

```python
# Keep components that explain 95% of variance
from sklearn.decomposition import PCA

pca = PCA(n_components=0.95)  # Keep 95% variance
X_reduced = pca.fit_transform(X)

print(f"Kept {pca.n_components_} components")
print(f"Explained {pca.explained_variance_ratio_.sum():.1%}")
```

### Method 2: Scree Plot

```python
import matplotlib.pyplot as plt

pca = PCA()
pca.fit(X)

# Plot eigenvalues
plt.figure(figsize=(10, 6))
plt.plot(range(1, len(pca.explained_variance_) + 1),
         pca.explained_variance_, 'bo-')
plt.xlabel('Principal Component')
plt.ylabel('Eigenvalue (Variance)')
plt.title('Scree Plot')
plt.grid(True)
plt.show()

# Look for "elbow" - where eigenvalues drop off
```

### Method 3: Cumulative Variance

```python
# Find k where cumulative variance exceeds threshold
cumsum = np.cumsum(pca.explained_variance_ratio_)
k = np.argmax(cumsum >= 0.95) + 1

print(f"Need {k} components for 95% variance")

# Plot cumulative variance
plt.plot(range(1, len(cumsum) + 1), cumsum, 'r-')
plt.axhline(y=0.95, color='g', linestyle='--', label='95% threshold')
plt.xlabel('Number of Components')
plt.ylabel('Cumulative Explained Variance')
plt.title('Cumulative Variance Plot')
plt.legend()
plt.grid(True)
plt.show()
```

---

## Interpreting Principal Components

PCs are linear combinations of original features.

### Understanding Components

```python
# First principal component
pc1 = pca.components_[0]  # shape: (n_features,)

# PC1 is weighted sum of original features:
# PC1 = w₁·feature₁ + w₂·feature₂ + ...

# Features with large |weights| contribute most to PC1
```

### Example: Interpretation

```python
import pandas as pd

# Fit PCA
pca = PCA(n_components=3)
pca.fit(X)

# Create DataFrame of component loadings
loadings = pd.DataFrame(
    pca.components_.T,  # Transpose for readability
    columns=['PC1', 'PC2', 'PC3'],
    index=[f'Feature_{i}' for i in range(X.shape[1])]
)

print(loadings)

# Interpretation:
# If PC1 = [0.7, 0.7, 0.0, ...]:
#   - Features 0 and 1 drive PC1
#   - PC1 is roughly "average of features 0 and 1"
#   - Feature 2 doesn't affect PC1
```

---

## Reconstructing Data

You can reconstruct original data from PCA projection.

### Reconstruction Formula

```python
def reconstruct_from_pca(X_reduced, pca):
    """
    Reconstruct data from PCA projection.

    X_reduced: Projected data (n_samples, k)
    pca: Fitted PCA object

    Returns: Reconstructed X (n_samples, n_features)
    """
    # X_reconstructed = X_reduced @ components + mean
    X_reconstructed = pca.inverse_transform(X_reduced)
    return X_reconstructed


# Example
from sklearn.decomposition import PCA

pca = PCA(n_components=5)
X_reduced = pca.fit_transform(X)  # Reduce to 5D

X_reconstructed = pca.inverse_transform(X_reduced)  # Back to original dims

# Compute reconstruction error
error = np.linalg.norm(X - X_reconstructed, 'fro')
relative_error = error / np.linalg.norm(X, 'fro')

print(f"Reconstruction error: {relative_error:.2%}")
```

### Information Loss

```
Keeping k < n components loses information:

Lost variance = Σ(eigenvalues[k:]) / Σ(all eigenvalues)
              = 1 - explained_variance_ratio[:k].sum()

Example:
- Keep 5 PCs explaining 95% variance
- Lost 5% of variance
- Reconstruction error ≈ 5%
```

---

## Summary

**What is PCA**
- Finds directions of maximum variance
- Projects data onto these directions
- Reduces dimensionality while preserving information

**Two Algorithms**

Covariance Method:
```
1. Center data
2. Compute Cov = XᵀX / (n-1)
3. Eigendecompose Cov = QΛQᵀ
4. Project: X_pca = X_centered @ Q
```

SVD Method (preferred):
```
1. Center data
2. SVD: X_centered = UΣVᵀ
3. Project: X_pca = UΣ
4. Components = columns of V
```

**Choosing k Components**
- Explained variance threshold (e.g., 95%)
- Scree plot (elbow method)
- Cumulative variance plot
- Domain knowledge

**Best Practices**
```python
# Use scikit-learn
from sklearn.decomposition import PCA

pca = PCA(n_components=0.95)  # Keep 95% variance
X_reduced = pca.fit_transform(X)

# Always center data (PCA does this automatically)
# Optionally scale features (StandardScaler)
# Interpret components via loadings
```

---

**Related Topics:**
- [SVD Basics](./svd-basics.md) - Foundation of modern PCA
- [ML Applications](./eigen-ml-applications.md) - Using PCA in practice
- [Eigendecomposition](./eigendecomposition.md) - Classical PCA approach
