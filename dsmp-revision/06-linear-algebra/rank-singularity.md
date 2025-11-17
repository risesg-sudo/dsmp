# Matrix Rank and Singularity

## What You'll Learn
Rank reveals the fundamental truth about a matrix: how many truly independent directions it contains. Understanding rank transforms your ability to diagnose linear systems, detect redundant features in data, and understand when solutions exist. This is where linear algebra meets practical problem-solving.

---

## Matrix Rank

### What is Rank?

Rank is the maximum number of linearly independent rows or columns in a matrix.

```
Rank = dimension of output space
     = number of independent directions
     = maximum number of independent vectors
```

**Geometric Intuition**:
```
3D space (3 vectors):

Full rank (rank = 3):
- All 3 vectors independent
- Span entire 3D space
- No vector is combination of others

Rank 2:
- Only 2 independent vectors
- Vectors lie in a plane
- Span only 2D subspace

Rank 1:
- Only 1 independent direction
- All vectors on same line
- Span only 1D subspace
```

### Simple Example

```python
    ⎡ 1  2  3 ⎤
A = ⎣ 2  4  6 ⎦

Row 2 = 2 × Row 1 (linearly dependent)
Column 2 = 2 × Column 1
Column 3 = 3 × Column 1

Rank(A) = 1 (only one independent direction)

Geometric: All points map to a single line
```

---

## Full Rank vs Rank Deficient

### Full Rank

```
m×n matrix with rank = min(m, n)

Examples:
- 3×3 matrix: Full rank = 3
- 2×3 matrix: Full rank = 2
- 5×2 matrix: Full rank = 2

Full rank means:
- Maximum possible independence
- If square: invertible
- Maximum flexibility
```

### Rank Deficient

```
Rank < min(m, n)

Indicates:
- Linearly dependent rows/columns
- Redundant information
- Collapses dimension
- Not invertible (if square)
- System may have no solution or infinitely many
```

### Visual Comparison

```
Full Rank (2×2):
A = [[1, 2],
     [3, 4]]
rank = 2
det ≠ 0
invertible ✓

Columns point in different directions:
    y
    |  * col2
    |
    |* col1
    |_____x

Rank Deficient (2×2):
B = [[2, 4],
     [1, 2]]
rank = 1
det = 0
not invertible ✗

Columns point in same direction:
    y
    |
    | ** (both columns on same line)
    |
    |_____x
```

---

## Examples of Different Ranks

### Example 1: Full Rank 2×2

```python
import numpy as np

A = np.array([[1, 2],
              [3, 4]])

rank = np.linalg.matrix_rank(A)
print(f"Rank: {rank}")  # 2

det = np.linalg.det(A)
print(f"Det: {det}")  # -2 ≠ 0

# Full rank: invertible
A_inv = np.linalg.inv(A)  # Works!
```

### Example 2: Rank Deficient 2×2

```python
B = np.array([[2, 4],
              [1, 2]])

rank = np.linalg.matrix_rank(B)
print(f"Rank: {rank}")  # 1

det = np.linalg.det(B)
print(f"Det: {det}")  # 0

# Rank deficient: not invertible
# B_inv = np.linalg.inv(B)  # Error!

# Why rank = 1?
# Column 2 = 2 × Column 1
# Only one independent direction
```

### Example 3: Rank Deficient 3×3

```python
C = np.array([[1, 2, 3],
              [2, 4, 6],
              [3, 6, 9]])

rank = np.linalg.matrix_rank(C)
print(f"Rank: {rank}")  # 1

# All rows are multiples of [1, 2, 3]
# All columns are multiples of [1, 2, 3]ᵀ
# Only ONE independent direction
```

---

## Null Space (Kernel)

The null space reveals which vectors get mapped to zero.

### Definition

```
Null(A) = {x : Ax = 0}

Set of all vectors that A maps to zero
Also called "kernel" of A
```

### Rank-Nullity Theorem

```
rank(A) + nullity(A) = n  (number of columns)

Where nullity = dimension of null space

This beautiful equation connects:
- rank: independent output dimensions
- nullity: independent "invisible" dimensions
- n: total input dimensions
```

### Example: Finding Null Space

```python
    ⎡ 1  2 ⎤
A = ⎣ 2  4 ⎦

Find x such that Ax = 0:

⎡ 1  2 ⎤ ⎡ x₁ ⎤ = ⎡ 0 ⎤
⎣ 2  4 ⎦ ⎣ x₂ ⎦   ⎣ 0 ⎦

Equations:
x₁ + 2x₂ = 0  →  x₁ = -2x₂
2x₁ + 4x₂ = 0  (same equation!)

Solution: x₁ = -2x₂

Null space: {[-2t, t] : t ∈ ℝ}
All vectors of form t·[-2, 1]

Example vectors in null space:
[-2, 1], [-4, 2], [2, -1], [0, 0]

All map to zero!
```

### Verify Null Space

```python
import numpy as np

A = np.array([[1, 2],
              [2, 4]])

# Vector in null space
v = np.array([-2, 1])

# Should give zero
result = A @ v
print(result)  # [0, 0] ✓

# rank + nullity = n
rank = np.linalg.matrix_rank(A)  # 1
nullity = 1  # null space is 1D line
n = A.shape[1]  # 2 columns

print(f"{rank} + {nullity} = {n}")  # 1 + 1 = 2 ✓
```

---

## Geometric Interpretation

### Full Rank: One-to-One Mapping

```
rank(A) = n (columns)
nullity = 0
Null space = {0}

Only zero vector maps to zero
Every other vector goes somewhere non-zero
Transformation is one-to-one
Can be inverted (if square)
```

### Rank Deficient: Many-to-One Mapping

```
rank(A) < n
nullity > 0
Null space contains non-zero vectors

Many vectors map to zero
Many vectors map to same output
Cannot uniquely invert
Information is lost
```

**Visual**:
```
Full rank (2×2):
2D → 2D
Every point maps to unique point
Can reverse

Rank 1 (2×2):
2D → 1D (line)
Entire lines map to single points
Cannot reverse (which line?)
```

---

## Detecting and Diagnosing Rank

### Method 1: Determinant (Square Only)

```python
def check_rank_det(A):
    """For square matrices."""
    if A.shape[0] != A.shape[1]:
        return "Not square, can't use det"

    det = np.linalg.det(A)
    if abs(det) < 1e-10:
        return "Rank deficient (det ≈ 0)"
    else:
        return "Full rank (det ≠ 0)"
```

### Method 2: Matrix Rank Function

```python
def analyze_rank(A):
    """Analyze rank of any matrix."""
    m, n = A.shape
    rank = np.linalg.matrix_rank(A)
    max_rank = min(m, n)

    print(f"Matrix shape: {m}×{n}")
    print(f"Rank: {rank}")
    print(f"Max possible rank: {max_rank}")

    if rank == max_rank:
        print("✓ Full rank")
    else:
        print(f"✗ Rank deficient (missing {max_rank - rank} dimensions)")

    return rank

# Test
A = np.array([[1, 2, 3],
              [2, 4, 6]])
analyze_rank(A)
# Shape: 2×3
# Rank: 1
# Max: 2
# Rank deficient (missing 1 dimension)
```

### Method 3: Check Linear Dependence

```python
def find_dependent_columns(A, tol=1e-10):
    """Find which columns are linearly dependent."""
    m, n = A.shape
    dependent = []

    for i in range(n):
        # Try to express column i as combination of previous columns
        if i == 0:
            continue

        A_prev = A[:, :i]
        col_i = A[:, i]

        # Solve A_prev @ x = col_i
        try:
            x = np.linalg.lstsq(A_prev, col_i, rcond=None)[0]
            reconstructed = A_prev @ x

            if np.allclose(reconstructed, col_i, atol=tol):
                dependent.append(i)
        except:
            pass

    return dependent

# Test
A = np.array([[1, 2, 3],
              [2, 4, 6],
              [3, 6, 9]])

deps = find_dependent_columns(A)
print(f"Dependent columns: {deps}")  # [1, 2]
# Column 1 and 2 are multiples of column 0
```

---

## Applications in Machine Learning

### 1. Multicollinearity Detection

```python
def check_multicollinearity(X):
    """
    Check if features are linearly dependent.
    Critical for linear regression!
    """
    n_features = X.shape[1]
    rank = np.linalg.matrix_rank(X)

    if rank < n_features:
        print(f"Warning: Multicollinearity detected!")
        print(f"Rank {rank} < {n_features} features")
        print(f"Remove {n_features - rank} redundant features")
        return True

    # Also check correlation matrix
    corr = np.corrcoef(X.T)
    det_corr = np.linalg.det(corr)

    if abs(det_corr) < 1e-5:
        print(f"Warning: Features nearly collinear!")
        print(f"det(correlation) = {det_corr:.2e}")
        return True

    return False

# Example: Redundant features
X = np.array([[1, 2, 2.1],   # Feature 3 ≈ Feature 2
              [2, 4, 4.2],
              [3, 6, 5.9]])

check_multicollinearity(X)
```

### 2. Understanding Linear System Solutions

```
For system Ax = b:

rank(A) = n (full column rank):
- Unique solution (if consistent)
- Normal equation works: x = (AᵀA)⁻¹Aᵀb

rank(A) < n (rank deficient):
- Infinitely many solutions (if consistent)
- Or no solution (if inconsistent)
- Need regularization or pseudo-inverse
```

---

## Summary

**Matrix Rank**
- Maximum number of independent rows/columns
- Dimension of column space (range)
- rank ≤ min(rows, columns)

**Full Rank**
- rank = min(m, n)
- Maximum independence
- If square: det ≠ 0, invertible

**Rank Deficient**
- rank < min(m, n)
- Redundant information
- If square: det = 0, singular

**Null Space**
- Vectors that map to zero
- nullity = n - rank
- rank + nullity = n (columns)

**Practical Tests**
```python
# Check rank
rank = np.linalg.matrix_rank(A)

# For square matrices
det = np.linalg.det(A)
# det = 0 ⟺ rank deficient

# Check null space
# Find vectors v where Av = 0
```

**ML Applications**
- Detect redundant features
- Understand solution uniqueness
- Diagnose system problems
- Guide regularization choices

---

**Related Topics:**
- [Determinants](./determinant-basics.md) - Testing full rank for square matrices
- [Matrix Inverse](./matrix-inverse-basics.md) - Only for full rank square matrices
- [Linear Systems](./matrices-ml-applications.md) - Solving with different ranks
