# Eigenvalues and Eigenvectors - Introduction

## What You'll Learn
Eigenvalues and eigenvectors reveal the "DNA" of a matrix - the fundamental directions along which transformations act simply by scaling. This concept unlocks understanding of everything from Google's PageRank to principal component analysis. You'll learn to see matrices not as arrays of numbers, but as geometric transformations with inherent structure.

---

## What are Eigenvectors?

Eigenvectors are special directions that don't change when transformed - they only get scaled.

### The Fundamental Equation

```
Av = λv

Where:
- v: eigenvector (direction unchanged)
- λ: eigenvalue (scaling factor)
- A: matrix (transformation)
```

**In Words**: When you multiply eigenvector v by matrix A, you get the same vector back, just scaled by λ.

### Geometric Intuition

```
Most vectors change BOTH direction and magnitude:
    v  →  Av (different direction, different length)

But eigenvectors only change magnitude:
    v  →  λv (same direction, scaled length)
```

**Visual Example**:

```
A = ⎡ 2  0 ⎤  (diagonal matrix, scales axes)
    ⎣ 0  3 ⎦

Eigenvector v₁ = [1, 0]:
    Av₁ = ⎡ 2  0 ⎤ ⎡ 1 ⎤ = ⎡ 2 ⎤ = 2⎡ 1 ⎤ = 2v₁
          ⎣ 0  3 ⎦ ⎣ 0 ⎦   ⎣ 0 ⎦    ⎣ 0 ⎦

    λ₁ = 2, v₁ = [1, 0]
    Direction: x-axis → stays on x-axis
    Scaling: multiplied by 2

Eigenvector v₂ = [0, 1]:
    Av₂ = ⎡ 2  0 ⎤ ⎡ 0 ⎤ = ⎡ 0 ⎤ = 3⎡ 0 ⎤ = 3v₂
          ⎣ 0  3 ⎦ ⎣ 1 ⎦   ⎣ 3 ⎦    ⎣ 1 ⎦

    λ₂ = 3, v₂ = [0, 1]
    Direction: y-axis → stays on y-axis
    Scaling: multiplied by 3

Visual:
    y              y
    |              |
    |* v₂          |    * Av₂ = 3v₂
    |              |    (3x longer, same direction)
    |              |
    |_____x        |________x
      * v₁           ** Av₁ = 2v₁
                     (2x longer, same direction)
```

---

## Why Eigenvectors Matter

Eigenvectors aren't just mathematical curiosities - they're fundamental to understanding transformations.

### 1. Reveal Intrinsic Directions

```
Eigenvectors = natural axes of transformation

They're independent of the coordinate system you choose
They reveal the "true" structure of the transformation

Example: Stretching
Matrix might look complicated in one basis
But in eigenbasis, it's just a diagonal matrix!
```

### 2. Simplify Matrix Powers

```
If Av = λv, then:

A²v = A(Av) = A(λv) = λ(Av) = λ²v
A³v = λ³v
Aⁿv = λⁿv

Computing A¹⁰⁰ directly: very expensive O(n³) per multiplication
Using eigenvalues: just compute λ¹⁰⁰ (trivial!)
```

**Example**:

```python
import numpy as np

A = np.array([[2, 0],
              [0, 0.5]])

# Method 1: Compute A^10 directly (expensive)
A_10 = np.linalg.matrix_power(A, 10)

# Method 2: Use eigenvalues (efficient!)
eigenvalues, eigenvectors = np.linalg.eig(A)
# λ₁ = 2, λ₂ = 0.5

# A^10 has eigenvalues λ₁^10, λ₂^10
# λ₁^10 = 2^10 = 1024
# λ₂^10 = 0.5^10 ≈ 0.001

# Same result, much easier to compute!
```

### 3. Understand Long-term Behavior

The dominant eigenvalue determines what happens as you repeatedly apply a transformation:

```
|λ| > 1: Exponential growth
|λ| < 1: Decay to zero
|λ| = 1: Stable oscillation

Applications:
- PageRank: Dominant eigenvector = importance scores
- Markov chains: Eigenvector for λ=1 = steady state
- Stability analysis: |λ_max| < 1 → system is stable
```

**Example: Population Growth**:

```python
# Population model: P(t+1) = A·P(t)
A = np.array([[1.1, 0.2],   # Growth rates
              [0.1, 0.9]])

# What happens long-term?
eigenvalues, eigenvectors = np.linalg.eig(A)
# λ₁ ≈ 1.2 (dominant)
# λ₂ ≈ 0.8

# Since λ₁ > 1: population grows exponentially!
# Growth rate = λ₁ = 1.2 (20% per generation)
```

---

## Properties of Eigenvalues/Eigenvectors

### 1. Number of Eigenvalues

```
An n×n matrix has n eigenvalues (counting multiplicity)

These may be:
- Real or complex
- Distinct or repeated
- Positive, negative, or zero
```

### 2. Eigenvectors are Not Unique

```
If v is an eigenvector, so is cv for any scalar c ≠ 0

Av = λv
A(cv) = c(Av) = c(λv) = λ(cv) ✓

Convention: Normalize eigenvectors to unit length
||v|| = 1
```

### 3. Trace and Determinant

Beautiful connections to matrix properties:

```
trace(A) = sum of diagonal elements
         = sum of eigenvalues
         = λ₁ + λ₂ + ... + λₙ

det(A) = product of eigenvalues
       = λ₁ · λ₂ · ... · λₙ
```

**Example**:

```python
A = ⎡ 2  1 ⎤
    ⎣ 1  2 ⎦

# Eigenvalues: λ₁ = 3, λ₂ = 1

trace(A) = 2 + 2 = 4 = 3 + 1 ✓
det(A) = 4 - 1 = 3 = 3 × 1 ✓

# This always works!
```

### 4. Symmetric Matrices (Special Case!)

For symmetric matrices A = Aᵀ:

```
Properties:
1. All eigenvalues are REAL (no complex numbers!)
2. Eigenvectors are ORTHOGONAL
3. Always diagonalizable
4. Very numerically stable

This is why covariance matrices are so nice to work with!
```

**Example**:

```python
# Symmetric matrix
A = np.array([[2, 1],
              [1, 2]])

eigenvalues, eigenvectors = np.linalg.eig(A)

# Eigenvalues: real
print(eigenvalues)  # [3, 1] (real!)

# Eigenvectors: orthogonal
v1 = eigenvectors[:, 0]
v2 = eigenvectors[:, 1]
print(np.dot(v1, v2))  # ≈ 0 (orthogonal!)
```

---

## Simple Examples

### Example 1: Diagonal Matrix

```python
A = ⎡ 5  0  0 ⎤
    ⎢ 0  3  0 ⎥
    ⎣ 0  0  2 ⎦

Eigenvalues: λ₁ = 5, λ₂ = 3, λ₃ = 2
(Just the diagonal elements!)

Eigenvectors: Standard basis vectors
v₁ = [1, 0, 0]
v₂ = [0, 1, 0]
v₃ = [0, 0, 1]

Diagonal matrices make eigenvalues obvious!
```

### Example 2: Identity Matrix

```python
I = ⎡ 1  0 ⎤
    ⎣ 0  1 ⎦

Every vector is an eigenvector!
Iv = 1·v for all v

Eigenvalue: λ = 1 (with multiplicity 2)
Eigenvectors: Any two independent vectors
```

### Example 3: Zero Matrix

```python
O = ⎡ 0  0 ⎤
    ⎣ 0  0 ⎦

All eigenvalues are zero: λ = 0

Every vector is an eigenvector:
Ov = 0·v = 0 for all v
```

---

## Eigenvalues vs Other Concepts

### Eigenvalues vs Determinant

```
Determinant:
- Single number
- Product of eigenvalues
- det(A) = 0 ⟺ at least one eigenvalue is 0
- Tells if matrix is invertible

Eigenvalues:
- Set of n numbers
- Individual scaling factors
- Show behavior along each eigendirection
- More detailed information
```

### Eigenvalues vs Rank

```
Rank:
- Number of independent rows/columns
- Dimension of output space
- rank = number of non-zero eigenvalues (for symmetric)

Zero eigenvalues:
- nullity = number of zero eigenvalues
- rank + nullity = n
```

---

## When Eigenvalues are Complex

For real matrices, complex eigenvalues come in conjugate pairs.

```
If λ = a + bi is an eigenvalue
Then λ* = a - bi is also an eigenvalue

Geometric meaning:
- Rotation component (imaginary part)
- Scaling component (real part)
- |λ| = √(a² + b²) = magnitude of scaling
- arg(λ) = atan2(b, a) = rotation angle
```

**Example**:

```python
# 90° rotation matrix
R = np.array([[0, -1],
              [1,  0]])

eigenvalues = np.linalg.eigvals(R)
print(eigenvalues)  # [0+1j, 0-1j]

# λ = ±i (purely imaginary)
# Meaning: pure rotation, no scaling
# |λ| = 1 (preserves distances)
```

---

## Summary

**What are Eigenvectors?**
- Special directions that only get scaled by transformation
- Satisfy Av = λv
- Reveal intrinsic structure of matrix

**Why They Matter**
1. Simplify matrix powers: Aⁿv = λⁿv
2. Understand long-term behavior
3. Reveal natural coordinate system
4. Foundation for many algorithms (PCA, PageRank, etc.)

**Key Properties**
- n×n matrix has n eigenvalues
- trace(A) = Σλᵢ
- det(A) = Πλᵢ
- Symmetric matrices: real eigenvalues, orthogonal eigenvectors

**Special Cases**
- Diagonal: eigenvalues on diagonal
- Identity: all eigenvalues = 1
- Rotation: complex eigenvalues with |λ| = 1

**Next**: Learn how to actually compute these eigenvalues!

---

**Related Topics:**
- [Computing Eigenvalues](./eigenvalues-computation.md) - How to find eigenvalues/eigenvectors
- [Eigendecomposition](./eigendecomposition.md) - Decomposing matrices
- [SVD Basics](./svd-basics.md) - Singular value decomposition
