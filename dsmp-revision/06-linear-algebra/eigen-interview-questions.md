# Eigenvalues, SVD, and PCA - Interview Questions

## What You'll Learn
Master the most important interview questions on eigenvalues, SVD, and PCA. These questions test conceptual understanding, implementation skills, and ability to connect theory to practice. Perfect preparation for technical interviews at top ML companies.

---

## Conceptual Questions

### Q1: Eigenvectors vs Singular Vectors

**Q: What's the difference between eigenvectors and singular vectors?**

**Answer**:

**Eigenvectors**:
```
- Only for square matrices
- Satisfy Av = λv
- Input and output in same space
- May be complex (even for real matrices)
- Matrix may not have full set

Examples where eigenvectors work:
- Symmetric matrices (always real, orthogonal)
- Covariance matrices
- Transition matrices
```

**Singular Vectors**:
```
- Work for ANY matrix (m×n)
- Right singular vectors: from AᵀA
- Left singular vectors: from AAᵀ
- Always real (for real matrices)
- Always exist and orthogonal

Examples where only SVD works:
- Document-term matrices (m ≠ n)
- User-item rating matrices
- Any rectangular data matrix
```

**Relationship**:
```
For A = UΣVᵀ:

Right singular vectors of A = eigenvectors of AᵀA
Left singular vectors of A = eigenvectors of AAᵀ
Singular values σᵢ = √λᵢ where λᵢ are eigenvalues of AᵀA

For symmetric matrix A:
Eigenvectors = singular vectors
|Eigenvalues| = singular values
```

**Example**:
```python
import numpy as np

# Symmetric matrix
A = np.array([[4, 2],
              [2, 4]])

# Eigendecomposition
eigenvalues, eigenvectors = np.linalg.eig(A)
print(f"Eigenvalues: {eigenvalues}")  # [6, 2]

# SVD
U, S, Vt = np.linalg.svd(A)
print(f"Singular values: {S}")  # [6, 2]

# For symmetric matrix: they match!
print(np.allclose(abs(eigenvalues), S))  # True
```

---

### Q2: Why PCA Uses Covariance Eigendecomposition

**Q: Why does PCA eigendecompose the covariance matrix?**

**Answer**:

**The Goal**: Find direction of maximum variance

**Mathematical Derivation**:
```
Want to maximize: var(Xw) subject to ||w|| = 1

Where:
- X: centered data matrix
- w: direction vector (unit length)

Variance in direction w:
var(Xw) = wᵀ(XᵀX)w / (n-1)
        = wᵀCw

Where C = XᵀX/(n-1) is covariance matrix

To maximize wᵀCw with ||w||=1:
→ w must be eigenvector of C with largest eigenvalue!

Lagrange multiplier proof:
L = wᵀCw - λ(wᵀw - 1)
∇L = 2Cw - 2λw = 0
→ Cw = λw (eigenvalue equation!)

Therefore:
- First PC = eigenvector with largest eigenvalue
- Eigenvalue = variance along that direction
- Second PC = eigenvector with 2nd largest eigenvalue
- Orthogonal to first (eigenvectors of symmetric matrix)
```

**Why This is Beautiful**:
```
Covariance eigenvalues = variance along principal components

Largest eigenvalue → direction of max variance
Smallest eigenvalue → direction of min variance

PCA finds these directions automatically!
```

---

### Q3: When to Use SVD vs Eigendecomposition

**Q: When would you use SVD instead of eigendecomposition?**

**Answer**:

**Use SVD When**:

```
1. Matrix is not square
   - Data matrices (samples × features)
   - Document-term matrices
   - Any m×n with m ≠ n

2. Numerical stability matters
   - SVD is more numerically stable
   - Avoids forming XᵀX (condition number squares!)
   - Better for ill-conditioned matrices

3. Working with data matrices directly
   - PCA via SVD avoids computing covariance
   - Faster for n >> p (tall matrices)
   - Less memory usage

4. Need orthogonal factors
   - SVD guarantees UᵀU = I, VᵀV = I
   - Perfect for orthonormal bases

5. Low-rank approximation
   - Truncated SVD is optimal (Eckart-Young)
   - Best rank-k approximation
   - Image compression, recommenders

6. Matrix completion/imputation
   - Fill in missing values
   - Collaborative filtering
```

**Use Eigendecomposition When**:

```
1. Matrix is symmetric
   - Covariance matrices
   - Then eigen = SVD but more efficient
   - Real eigenvalues, orthogonal eigenvectors

2. Spectral analysis
   - Graph Laplacians
   - Transition matrices
   - Network analysis

3. Differential equations
   - System dynamics: dx/dt = Ax
   - Solution involves eᴬᵗ
   - Stability analysis

4. Theoretical analysis
   - Simpler mathematical properties
   - Direct connection to matrix powers
```

**Practical Example**:
```python
import numpy as np

# For PCA: Both work, but SVD preferred

# Method 1: Eigendecomposition of covariance
X_centered = X - X.mean(axis=0)
cov = X_centered.T @ X_centered / (n - 1)
eigenvalues, eigenvectors = np.linalg.eig(cov)  # Can be unstable!

# Method 2: SVD (better!)
U, S, Vt = np.linalg.svd(X_centered, full_matrices=False)
eigenvalues = (S**2) / (n - 1)
eigenvectors = Vt.T  # More stable!

# scikit-learn uses SVD:
from sklearn.decomposition import PCA
pca = PCA()  # Uses randomized SVD for large matrices
```

---

### Q4: Meaning of Negative Eigenvalues

**Q: What does a negative eigenvalue mean?**

**Answer**:

**Geometric Meaning**:
```
Negative eigenvalue: λ < 0

Av = λv where λ < 0
→ Av = -|λ|v
→ Vector flips direction and scales by |λ|

Transformation reflects along that eigendirection
```

**For General Matrices**:
```
Negative eigenvalues are fine and common

Example:
A = [[1,  0],     Eigenvalues: 1, -2
     [0, -2]]

- Along [1,0]: stretch by 1 (no change)
- Along [0,1]: stretch by 2 AND flip

Visual:
Points above x-axis → below x-axis (reflection)
```

**For Covariance Matrices**:
```
Covariance matrices are positive semi-definite:
- All eigenvalues ≥ 0
- Variance cannot be negative!
- λᵢ = variance along PCᵢ

If you get negative eigenvalues:
→ Matrix is NOT a valid covariance matrix
→ Numerical error
→ Check your computation
```

**Complex Eigenvalues**:
```
For real matrices, complex eigenvalues come in conjugate pairs:
λ = a + bi, λ* = a - bi

Geometric meaning:
- Real part (a): scaling
- Imaginary part (b): rotation
- |λ| = √(a² + b²): magnitude of scaling
- arg(λ): rotation angle

Example: Rotation matrix
R = [[0, -1],    Eigenvalues: i, -i
     [1,  0]]    (purely imaginary)

Pure rotation: |λ| = 1, arg(λ) = 90°
```

---

## Coding Questions

### Q5: Implement PCA from Scratch

```python
def pca_from_scratch(X, n_components):
    """
    PCA implementation from scratch using eigendecomposition.

    Args:
        X: Data matrix (n_samples, n_features)
        n_components: Number of components to keep

    Returns:
        X_reduced: Projected data (n_samples, n_components)
        components: Principal components (n_components, n_features)
        explained_var: Explained variance ratios
    """
    import numpy as np

    # Step 1: Center data
    mean = np.mean(X, axis=0)
    X_centered = X - mean

    # Step 2: Compute covariance matrix
    n_samples = X_centered.shape[0]
    cov = (X_centered.T @ X_centered) / (n_samples - 1)

    # Step 3: Eigendecomposition
    eigenvalues, eigenvectors = np.linalg.eig(cov)

    # Step 4: Sort by eigenvalue (descending)
    idx = eigenvalues.argsort()[::-1]
    eigenvalues = eigenvalues[idx]
    eigenvectors = eigenvectors[:, idx]

    # Step 5: Keep top n_components
    components = eigenvectors[:, :n_components].T

    # Step 6: Project data
    X_reduced = X_centered @ components.T

    # Step 7: Explained variance ratio
    explained_var = eigenvalues[:n_components] / eigenvalues.sum()

    return X_reduced, components, explained_var


# Test
X = np.random.randn(100, 10)
X_reduced, components, explained_var = pca_from_scratch(X, n_components=3)

print(f"Original: {X.shape}")
print(f"Reduced: {X_reduced.shape}")
print(f"Explained variance: {explained_var}")
print(f"Total: {explained_var.sum():.1%}")
```

---

### Q6: SVD-based Low-Rank Approximation

```python
def low_rank_approximation(A, k):
    """
    Compute best rank-k approximation using SVD.

    Args:
        A: Input matrix (m, n)
        k: Target rank

    Returns:
        A_k: Best rank-k approximation
        error: Frobenius norm error
        compression_ratio: Storage savings
    """
    import numpy as np

    m, n = A.shape

    # SVD
    U, S, Vt = np.linalg.svd(A, full_matrices=False)

    # Truncate to rank k
    U_k = U[:, :k]
    S_k = S[:k]
    Vt_k = Vt[:k, :]

    # Reconstruct
    A_k = U_k @ np.diag(S_k) @ Vt_k

    # Approximation error (Frobenius norm)
    error = np.linalg.norm(A - A_k, 'fro')

    # Theoretical error (from remaining singular values)
    theoretical_error = np.sqrt(np.sum(S[k:]**2)) if k < len(S) else 0

    # Storage: original vs compressed
    original_storage = m * n
    compressed_storage = k * (m + n + 1)  # U_k, S_k, Vt_k
    compression_ratio = compressed_storage / original_storage

    results = {
        'approximation': A_k,
        'error': error,
        'theoretical_error': theoretical_error,
        'compression_ratio': compression_ratio,
        'rank': np.linalg.matrix_rank(A_k)
    }

    return results


# Test on image
img = np.random.randn(100, 100)  # Placeholder for real image

for k in [5, 10, 20, 50]:
    results = low_rank_approximation(img, k)
    print(f"k={k}:")
    print(f"  Compression: {results['compression_ratio']:.1%}")
    print(f"  Error: {results['error']:.2f}")
    print(f"  Rank: {results['rank']}")
```

---

### Q7: Reconstruct Data from PCA

```python
def pca_reconstruct(X, n_components):
    """
    Reduce dimensions then reconstruct to show information loss.

    Args:
        X: Data matrix (n_samples, n_features)
        n_components: Number of components to keep

    Returns:
        X_reconstructed: Reconstructed data
        error: Reconstruction error
        relative_error: Relative error (%)
    """
    from sklearn.decomposition import PCA
    import numpy as np

    # Fit PCA
    pca = PCA(n_components=n_components)

    # Reduce dimensionality
    X_reduced = pca.fit_transform(X)

    # Reconstruct
    X_reconstructed = pca.inverse_transform(X_reduced)

    # Errors
    error = np.linalg.norm(X - X_reconstructed, 'fro')
    relative_error = error / np.linalg.norm(X, 'fro')

    # Component-wise error
    feature_errors = np.mean((X - X_reconstructed)**2, axis=0)

    results = {
        'reconstructed': X_reconstructed,
        'error': error,
        'relative_error': relative_error,
        'variance_retained': pca.explained_variance_ratio_.sum(),
        'feature_errors': feature_errors
    }

    return results


# Test
X = np.random.randn(100, 20)

for k in [2, 5, 10, 15]:
    results = pca_reconstruct(X, k)
    print(f"Components: {k}")
    print(f"  Variance retained: {results['variance_retained']:.1%}")
    print(f"  Relative error: {results['relative_error']:.1%}")
```

---

### Q8: Power Method for Dominant Eigenvector

```python
def power_method(A, num_iterations=100, tol=1e-6):
    """
    Find dominant eigenvector using power iteration.

    Iterates: v_{k+1} = Av_k / ||Av_k||
    Converges to eigenvector with largest |λ|.

    Args:
        A: Square matrix
        num_iterations: Max iterations
        tol: Convergence tolerance

    Returns:
        lambda_max: Dominant eigenvalue
        v: Dominant eigenvector
        iterations: Number of iterations
    """
    import numpy as np

    n = A.shape[0]

    # Random initial vector
    v = np.random.randn(n)
    v = v / np.linalg.norm(v)

    for i in range(num_iterations):
        # Power iteration: v_new = Av / ||Av||
        v_new = A @ v
        v_new = v_new / np.linalg.norm(v_new)

        # Check convergence
        if np.allclose(v, v_new, atol=tol) or np.allclose(v, -v_new, atol=tol):
            print(f"Converged in {i+1} iterations")
            v = v_new
            break

        v = v_new

    # Rayleigh quotient for eigenvalue
    lambda_max = v.T @ A @ v

    return lambda_max, v, i+1


# Test
A = np.array([[4, 2],
              [2, 4]])

lambda_max, v = power_method(A)

print(f"Dominant eigenvalue: {lambda_max:.4f}")
print(f"Dominant eigenvector: {v}")

# Verify
print(f"\nTrue eigenvalues: {np.linalg.eigvals(A)}")
# Should match largest eigenvalue (6.0)
```

---

## Summary

**Key Conceptual Insights**:

1. **Eigenvectors vs Singular Vectors**
   - Eigenvectors: square matrices, Av = λv
   - Singular vectors: any matrix, from AᵀA and AAᵀ
   - SVD more general and stable

2. **PCA and Covariance**
   - Maximizing variance → eigenvalue problem
   - Eigenvalues = variance along PCs
   - Eigenvectors = principal directions

3. **SVD vs Eigendecomposition**
   - SVD: any matrix, numerical stability
   - Eigen: symmetric matrices, simpler theory
   - Modern PCA uses SVD

4. **Negative Eigenvalues**
   - Reflect direction + scale
   - Fine for general matrices
   - Never for covariance matrices!

**Coding Skills Demonstrated**:
- Implement PCA from scratch
- SVD for compression
- Reconstruction and error analysis
- Power method for eigenvalues

**Interview Tips**:
- Start with intuition, then mathematics
- Provide concrete examples
- Mention ML applications
- Compare alternatives (SVD vs eigen)
- Discuss numerical stability

---

**Related Topics:**
- [Eigenvalues Introduction](./eigenvalues-intro.md)
- [SVD Basics](./svd-basics.md)
- [PCA Fundamentals](./pca-fundamentals.md)
- [ML Applications](./eigen-ml-applications.md)
