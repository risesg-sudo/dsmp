# Singular Value Decomposition (SVD) - Fundamentals

## What You'll Learn
SVD is the most important matrix decomposition in machine learning. Unlike eigendecomposition which requires square matrices, SVD works for any matrix - tall, wide, or square. You'll discover how SVD decomposes any transformation into rotations and scaling, and why this is fundamental to PCA, recommender systems, and image compression.

---

## What is SVD?

SVD decomposes any m×n matrix into three matrices with special properties.

### The Decomposition

```
A = UΣVᵀ

Where:
- U: m×m orthogonal matrix (left singular vectors)
- Σ: m×n diagonal matrix (singular values)
- V: n×n orthogonal matrix (right singular vectors)

Works for ANY matrix (not just square or symmetric)!
```

### Why SVD is Universal

```
Eigendecomposition:
- Requires square matrix
- May not exist (non-diagonalizable)
- May have complex values

SVD:
- Works for ANY m×n matrix
- Always exists
- Always real (for real matrices)
- Numerically stable

SVD is the "Swiss Army knife" of matrix decompositions!
```

---

## Geometric Intuition

SVD reveals that any linear transformation can be decomposed into simple geometric operations.

### The Three-Step Interpretation

```
Av = U Σ Vᵀ v

Step 1: Vᵀ = rotate in input space (n-dim → n-dim)
Step 2: Σ = scale along principal axes (n-dim → m-dim)
Step 3: U = rotate in output space (m-dim → m-dim)

Any linear transformation = Rotate + Scale + Rotate
```

**Visual (2D → 2D)**:

```
Circle  →  Vᵀ  →  Circle  →  Σ  →  Ellipse  →  U  →  Ellipse
           (rotate)        (stretch)         (rotate)

Σ = ⎡ σ₁  0  ⎤  where σ₁ ≥ σ₂ ≥ 0
    ⎣ 0   σ₂ ⎦

σ₁, σ₂ = singular values (lengths of ellipse axes)
```

---

## Properties of SVD

### Singular Values

```
σ₁ ≥ σ₂ ≥ ... ≥ σᵣ > 0

Where r = rank(A)

Ordered from largest to smallest
Non-negative by definition
Number of non-zero singular values = rank
```

### Orthogonality

```
UᵀU = I  (columns of U are orthonormal)
VᵀV = I  (columns of V are orthonormal)

This makes SVD numerically stable!
No matrix inversion needed!
```

### Relationship to Eigenvalues

```
Singular values of A = √(eigenvalues of AᵀA)
                     = √(eigenvalues of AAᵀ)

Right singular vectors = eigenvectors of AᵀA
Left singular vectors = eigenvectors of AAᵀ
```

### Matrix Norms

```
||A||₂ = σ₁  (largest singular value = operator norm)

||A||_F = √(σ₁² + σ₂² + ... + σᵣ²)  (Frobenius norm)

Largest singular value = maximum stretching factor
```

---

## Computing SVD

Two equivalent approaches based on eigendecomposition.

### Method 1: From AᵀA (More Common)

```
Steps:
1. Compute AᵀA (n×n, symmetric, positive semi-definite)
2. Eigendecompose: AᵀA = VΛVᵀ
3. Singular values: σᵢ = √λᵢ
4. Right singular vectors: columns of V
5. Left singular vectors: U = AVΣ⁻¹
```

### Method 2: From AAᵀ

```
Steps:
1. Compute AAᵀ (m×m, symmetric)
2. Eigendecompose: AAᵀ = UΛUᵀ
3. Singular values: σᵢ = √λᵢ
4. Left singular vectors: columns of U
5. Right singular vectors: V = AᵀUΣ⁻¹
```

### Why These Work

```
If A = UΣVᵀ, then:

AᵀA = (UΣVᵀ)ᵀ(UΣVᵀ)
    = VΣᵀUᵀUΣVᵀ
    = VΣᵀΣVᵀ    (since UᵀU = I)
    = V(Σ²)Vᵀ

So V = eigenvectors of AᵀA
And Σ² = eigenvalues of AᵀA
```

---

## Complete SVD Example

Let's work through a small example by hand.

### Problem

Find SVD of:
```
A = ⎡ 3  2  2 ⎤
    ⎣ 2  3 -2 ⎦  (2×3 matrix)
```

### Step 1: Compute AᵀA

```
AᵀA = ⎡ 3  2 ⎤ ⎡ 3  2  2 ⎤   ⎡ 13   12   2  ⎤
      ⎢ 2  3 ⎥ ⎣ 2  3 -2 ⎦ = ⎢ 12   13  -2  ⎥  (3×3)
      ⎣ 2 -2 ⎦                ⎣  2   -2   8  ⎦
```

### Step 2: Eigenvalues of AᵀA

```
Solving det(AᵀA - λI) = 0:

λ₁ = 25, λ₂ = 9, λ₃ = 0

Singular values:
σ₁ = √25 = 5
σ₂ = √9 = 3
σ₃ = 0  (rank deficient! rank = 2)
```

### Step 3: Eigenvectors of AᵀA → V

```
For λ₁ = 25: v₁ = [3/5, 4/5, 0]ᵀ
For λ₂ = 9:  v₂ = [4/5, -3/5, 0]ᵀ
For λ₃ = 0:  v₃ = [0, 0, 1]ᵀ

V = ⎡ 3/5   4/5  0 ⎤
    ⎢ 4/5  -3/5  0 ⎥
    ⎣  0     0   1 ⎦
```

### Step 4: Compute U = AVΣ⁻¹

```
Σ = ⎡ 5  0  0 ⎤
    ⎣ 0  3  0 ⎦  (2×3)

For first two columns (σ₃ = 0, skip):
u₁ = Av₁/σ₁ = [1, 0]ᵀ
u₂ = Av₂/σ₂ = [0, 1]ᵀ

U = ⎡ 1  0 ⎤
    ⎣ 0  1 ⎦  (2×2, happens to be I!)
```

### Final SVD

```
A = UΣVᵀ

  = ⎡ 1  0 ⎤ ⎡ 5  0  0 ⎤ ⎡ 3/5   4/5  0 ⎤
    ⎣ 0  1 ⎦ ⎣ 0  3  0 ⎦ ⎢ 4/5  -3/5  0 ⎥
                           ⎣  0     0   1 ⎦
```

---

## Low-Rank Approximation

SVD gives the best low-rank approximation of a matrix.

### Truncated SVD

```
Keep only top k singular values:

A ≈ Aₖ = Uₖ Σₖ Vₖᵀ

Where:
- Uₖ: first k columns of U
- Σₖ: top k×k block of Σ
- Vₖ: first k columns of V

Eckart-Young Theorem:
This is the BEST rank-k approximation
Minimizes ||A - Aₖ||_F
```

### Example

```
Full SVD:
A = σ₁u₁v₁ᵀ + σ₂u₂v₂ᵀ + σ₃u₃v₃ᵀ

Rank-1 approximation (keep largest):
A₁ = σ₁u₁v₁ᵀ

Rank-2 approximation:
A₂ = σ₁u₁v₁ᵀ + σ₂u₂v₂ᵀ

Approximation error:
||A - A₂||_F = √(σ₃² + σ₄² + ...)
```

---

## Practical Implementation

### NumPy SVD

```python
import numpy as np

# Full SVD
A = np.random.randn(5, 3)
U, S, Vt = np.linalg.svd(A, full_matrices=True)

print(f"U shape: {U.shape}")   # (5, 5)
print(f"S shape: {S.shape}")   # (3,) - just singular values!
print(f"Vt shape: {Vt.shape}") # (3, 3)

# Reconstruct
Sigma = np.zeros((5, 3))
Sigma[:3, :3] = np.diag(S)
A_reconstructed = U @ Sigma @ Vt

print(np.allclose(A, A_reconstructed))  # True

# Compact SVD (more efficient)
U, S, Vt = np.linalg.svd(A, full_matrices=False)
print(f"U shape: {U.shape}")   # (5, 3) - compact!
print(f"Vt shape: {Vt.shape}") # (3, 3)

# Reconstruct (easier)
A_reconstructed = U @ np.diag(S) @ Vt
```

### Truncated SVD for Low-Rank Approximation

```python
def low_rank_approx(A, k):
    """Best rank-k approximation using SVD."""
    U, S, Vt = np.linalg.svd(A, full_matrices=False)

    # Keep only top k
    U_k = U[:, :k]
    S_k = S[:k]
    Vt_k = Vt[:k, :]

    A_k = U_k @ np.diag(S_k) @ Vt_k

    # Compute error
    error = np.linalg.norm(A - A_k, 'fro')

    return A_k, error

# Test
A = np.random.randn(100, 50)
A_5, error = low_rank_approx(A, k=5)

print(f"Original rank: {np.linalg.matrix_rank(A)}")  # 50
print(f"Approximation rank: {np.linalg.matrix_rank(A_5)}")  # 5
print(f"Relative error: {error / np.linalg.norm(A, 'fro'):.2%}")
```

---

## Summary

**SVD Decomposition**
```
A = UΣVᵀ

U: Left singular vectors (orthogonal)
Σ: Singular values (diagonal, non-negative)
V: Right singular vectors (orthogonal)

Works for ANY matrix!
```

**Key Properties**
- σᵢ ≥ 0, ordered largest to smallest
- rank(A) = number of non-zero singular values
- ||A||₂ = σ₁ (largest singular value)
- UᵀU = I, VᵀV = I (orthogonal)

**Computing SVD**
- Via eigendecomposition of AᵀA or AAᵀ
- NumPy: `np.linalg.svd(A)`
- Numerical algorithms (QR, etc.) for large matrices

**Low-Rank Approximation**
- Truncate to top k singular values
- Best rank-k approximation (Eckart-Young)
- Error = √(σ²_{k+1} + σ²_{k+2} + ...)

**Use Cases**
- PCA (dimensionality reduction)
- Image compression
- Recommender systems
- Noise reduction
- Data imputation

---

**Related Topics:**
- [Eigendecomposition](./eigendecomposition.md) - For square matrices
- [PCA Fundamentals](./pca-fundamentals.md) - Uses SVD
- [ML Applications](./eigen-ml-applications.md) - Practical uses
