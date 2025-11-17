# Eigendecomposition

## What You'll Learn
Eigendecomposition unlocks the ability to understand matrices in their "natural coordinate system" - the eigenbasis. This decomposition simplifies matrix powers, solves differential equations, and reveals the fundamental structure of transformations. You'll learn when this decomposition exists and how to use it powerfully.

---

## What is Eigendecomposition?

Eigendecomposition expresses a matrix as a product involving its eigenvalues and eigenvectors.

### The Decomposition

```
A = QΛQ⁻¹

Where:
- Q: matrix of eigenvectors (columns are eigenvectors)
- Λ: diagonal matrix of eigenvalues
- Q⁻¹: inverse of eigenvector matrix

For symmetric matrices:
A = QΛQᵀ  (Q⁻¹ = Qᵀ, since Q is orthogonal!)
```

### Why This is Beautiful

```
Original matrix A: Can be complex, hard to understand
Eigendecomposition: A = QΛQ⁻¹

In eigenbasis (coordinate system of eigenvectors):
- Transformation is just diagonal scaling!
- Λ is diagonal - each direction scales independently
- Q changes basis to eigenvectors
- Q⁻¹ changes basis back
```

---

## Geometric Interpretation

The decomposition has a profound geometric meaning:

```
Av = Q Λ Q⁻¹ v

Think of this as three steps:
Step 1: Q⁻¹v = rotate to eigenbasis
Step 2: Λ = scale along eigendirections
Step 3: Q = rotate back to original basis

Example:
v → Q⁻¹ → coordinates in eigenbasis
  → Λ   → scale each coordinate
  → Q   → back to standard coordinates
```

---

## Complete Example

Let's decompose a matrix step by step.

### Problem

Decompose:
```
A = ⎡ 4  2 ⎤
    ⎣ 2  4 ⎦
```

### Step 1: Find Eigenvalues

```
det(A - λI) = (4-λ)² - 4 = λ² - 8λ + 12 = (λ-6)(λ-2)

Eigenvalues: λ₁ = 6, λ₂ = 2
```

### Step 2: Find Eigenvectors

```
For λ₁ = 6:
⎡ -2   2 ⎤ ⎡ v₁ ⎤ = 0  →  v₁ = ⎡ 1 ⎤  (normalized: ⎡ 1/√2 ⎤)
⎣  2  -2 ⎦ ⎣ v₂ ⎦            ⎣ 1 ⎦               ⎣ 1/√2 ⎦

For λ₂ = 2:
⎡  2   2 ⎤ ⎡ v₁ ⎤ = 0  →  v₂ = ⎡  1 ⎤  (normalized: ⎡  1/√2 ⎤)
⎣  2   2 ⎦ ⎣ v₂ ⎦            ⎣ -1 ⎦               ⎣ -1/√2 ⎦
```

### Step 3: Form Q and Λ

```
Q = ⎡ 1/√2   1/√2 ⎤  (columns are eigenvectors)
    ⎣ 1/√2  -1/√2 ⎦

Λ = ⎡ 6  0 ⎤  (diagonal are eigenvalues)
    ⎣ 0  2 ⎦
```

### Step 4: Verify Decomposition

```
QΛQᵀ = ⎡ 1/√2   1/√2 ⎤ ⎡ 6  0 ⎤ ⎡ 1/√2   1/√2 ⎤
       ⎣ 1/√2  -1/√2 ⎦ ⎣ 0  2 ⎦ ⎣ 1/√2  -1/√2 ⎦

QΛ = ⎡ 6/√2   2/√2 ⎤
     ⎣ 6/√2  -2/√2 ⎦

(QΛ)Qᵀ = ⎡ 6/2 + 2/2    6/2 - 2/2 ⎤ = ⎡ 4  2 ⎤ = A ✓
         ⎣ 6/2 - 2/2    6/2 + 2/2 ⎦   ⎣ 2  4 ⎦
```

---

## Applications of Eigendecomposition

### 1. Matrix Powers

Computing matrix powers becomes trivial:

```
A² = (QΛQ⁻¹)(QΛQ⁻¹) = QΛ²Q⁻¹
A³ = QΛ³Q⁻¹
Aⁿ = QΛⁿQ⁻¹

Where Λⁿ = diag(λ₁ⁿ, λ₂ⁿ, ..., λₙⁿ)

Computing Λⁿ is trivial - just raise each eigenvalue to n!
```

**Example**:

```python
import numpy as np

A = np.array([[4, 2],
              [2, 4]])

# Direct computation (expensive for large n)
A_100_direct = np.linalg.matrix_power(A, 100)

# Using eigendecomposition (much easier!)
eigenvalues, Q = np.linalg.eig(A)
# λ₁ = 6, λ₂ = 2

Lambda_100 = np.diag(eigenvalues ** 100)
# [[6^100, 0], [0, 2^100]]

A_100_eigen = Q @ Lambda_100 @ Q.T

print(np.allclose(A_100_direct, A_100_eigen))  # True ✓
```

### 2. Matrix Exponential

Used in differential equations and continuous-time systems:

```
eᴬ = I + A + A²/2! + A³/3! + ...
   = Q(eᴧ)Q⁻¹

Where eᴧ = diag(eλ¹, eλ², ..., eλⁿ)

Much easier to compute than infinite series!
```

### 3. Differential Equations

Solving systems of ODEs:

```
dy/dt = Ay
Solution: y(t) = eᴬᵗy₀

Using eigendecomposition:
eᴬᵗ = Qeᴧᵗ Q⁻¹

Where eᴧᵗ = diag(eλ¹ᵗ, eλ²ᵗ, ..., eλⁿᵗ)
```

### 4. Stability Analysis

Understanding long-term behavior:

```
System: x(t+1) = Ax(t)

Long-term behavior determined by largest |λ|:

|λ_max| < 1: System decays to zero (stable)
|λ_max| = 1: System oscillates (marginally stable)
|λ_max| > 1: System grows exponentially (unstable)
```

---

## When Eigendecomposition Exists

Not all matrices can be eigendecomposed!

### Diagonalizable Matrices

A matrix is diagonalizable if:
```
1. It has n linearly independent eigenvectors
2. All eigenspaces have full dimension

Always diagonalizable:
- Symmetric matrices
- Matrices with n distinct eigenvalues
- Normal matrices (AAᵀ = AᵀA)

Sometimes not diagonalizable:
- Matrices with repeated eigenvalues
- Defective matrices
```

**Example of Non-Diagonalizable**:

```python
A = [[3, 1],
     [0, 3]]

# λ = 3 (repeated)
# Only one eigenvector: [1, 0]
# Cannot form full Q matrix
# Not diagonalizable!

# Use Jordan Normal Form instead
```

### Symmetric Matrices (Always Work!)

```
For symmetric A = Aᵀ:
A = QΛQᵀ

Properties:
1. Always diagonalizable
2. Q is orthogonal (Qᵀ = Q⁻¹)
3. All λ are real
4. Eigenvectors are orthogonal

This is why we love symmetric matrices!
```

---

## Practical Implementation

### NumPy Implementation

```python
import numpy as np

def eigendecompose(A):
    """
    Perform eigendecomposition: A = QΛQ⁻¹

    Returns Q, Lambda, Q_inv
    """
    eigenvalues, Q = np.linalg.eig(A)
    Lambda = np.diag(eigenvalues)
    Q_inv = np.linalg.inv(Q)

    # Verify
    A_reconstructed = Q @ Lambda @ Q_inv
    assert np.allclose(A_reconstructed, A), "Decomposition failed"

    return Q, Lambda, Q_inv

# Test
A = np.array([[4, 2],
              [2, 4]])

Q, Lambda, Q_inv = eigendecompose(A)

print(f"Q (eigenvectors):\n{Q}")
print(f"\nΛ (eigenvalues):\n{Lambda}")
print(f"\nReconstruction: A = QΛQ⁻¹")
print(np.allclose(Q @ Lambda @ Q_inv, A))  # True
```

---

## Summary

**Eigendecomposition Formula**
```
A = QΛQ⁻¹

Q: columns are eigenvectors
Λ: diagonal with eigenvalues
Q⁻¹: inverse of Q

For symmetric: A = QΛQᵀ
```

**Geometric Interpretation**
```
Three-step transformation:
1. Q⁻¹: Change to eigenbasis
2. Λ: Scale along eigendirections
3. Q: Change back to original basis
```

**Applications**
- Matrix powers: Aⁿ = QΛⁿQ⁻¹
- Matrix exponential: eᴬ = QeᴧQ⁻¹
- Differential equations
- Stability analysis

**When It Exists**
- Symmetric matrices: Always!
- n distinct eigenvalues: Yes
- Repeated eigenvalues: Maybe (depends on eigenvectors)

**Best Practices**
```python
# Check if diagonalizable
eigenvalues, Q = np.linalg.eig(A)
if np.linalg.matrix_rank(Q) == A.shape[0]:
    print("Diagonalizable!")
```

---

**Related Topics:**
- [Eigenvalues Introduction](./eigenvalues-intro.md) - Understanding eigenvalues
- [Computing Eigenvalues](./eigenvalues-computation.md) - Finding eigenvalues
- [SVD](./svd-basics.md) - Works for ANY matrix (even non-square!)
- [PCA](./pca-fundamentals.md) - Uses eigendecomposition of covariance
