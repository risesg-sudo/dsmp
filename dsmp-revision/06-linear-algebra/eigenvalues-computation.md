# Computing Eigenvalues and Eigenvectors

## What You'll Learn
Computing eigenvalues isn't just plugging numbers into formulas - it's a systematic process that reveals deep connections between algebra and geometry. You'll master the characteristic equation method, work through complete examples for 2×2 and 3×3 matrices, and learn shortcuts for special cases.

---

## The Characteristic Equation

The fundamental method for finding eigenvalues uses the characteristic equation.

### Derivation

Starting from the eigenvalue equation:
```
Av = λv
Av - λv = 0
(A - λI)v = 0

For non-zero v, this requires:
det(A - λI) = 0  ← The Characteristic Equation
```

**Why**: If det(A - λI) ≠ 0, then (A - λI) is invertible, which means only v = 0 satisfies the equation. But we want non-zero eigenvectors!

### The Algorithm

```
Step 1: Form (A - λI)
Step 2: Calculate det(A - λI)
Step 3: Solve det(A - λI) = 0 for λ
Step 4: For each λ, solve (A - λI)v = 0 for v
```

---

## Complete 2×2 Example

Let's work through every detail.

### Problem

Find eigenvalues and eigenvectors of:
```
A = ⎡ 4  2 ⎤
    ⎣ 1  3 ⎦
```

### Step 1: Form A - λI

```
A - λI = ⎡ 4  2 ⎤ - λ⎡ 1  0 ⎤
         ⎣ 1  3 ⎦    ⎣ 0  1 ⎦

       = ⎡ 4-λ   2  ⎤
         ⎣  1   3-λ ⎦
```

### Step 2: Calculate Determinant

```
det(A - λI) = (4-λ)(3-λ) - (2)(1)
            = 12 - 4λ - 3λ + λ² - 2
            = λ² - 7λ + 10
```

### Step 3: Solve Characteristic Equation

```
λ² - 7λ + 10 = 0

Factor: (λ - 5)(λ - 2) = 0

Eigenvalues: λ₁ = 5, λ₂ = 2
```

### Step 4a: Find Eigenvector for λ₁ = 5

```
(A - 5I)v = 0

⎡ -1   2 ⎤ ⎡ v₁ ⎤ = ⎡ 0 ⎤
⎣  1  -2 ⎦ ⎣ v₂ ⎦   ⎣ 0 ⎦

Equations:
-v₁ + 2v₂ = 0  →  v₁ = 2v₂
 v₁ - 2v₂ = 0  (same equation - always happens!)

Choose v₂ = 1, then v₁ = 2

Eigenvector: v₁ = ⎡ 2 ⎤
                  ⎣ 1 ⎦

Normalized: v₁ = ⎡ 2/√5 ⎤
                 ⎣ 1/√5 ⎦
```

### Step 4b: Find Eigenvector for λ₂ = 2

```
(A - 2I)v = 0

⎡  2   2 ⎤ ⎡ v₁ ⎤ = ⎡ 0 ⎤
⎣  1   1 ⎦ ⎣ v₂ ⎦   ⎣ 0 ⎦

Equations:
2v₁ + 2v₂ = 0  →  v₁ = -v₂
 v₁ +  v₂ = 0  (same equation)

Choose v₂ = -1, then v₁ = 1

Eigenvector: v₂ = ⎡  1 ⎤
                  ⎣ -1 ⎦

Normalized: v₂ = ⎡  1/√2 ⎤
                 ⎣ -1/√2 ⎦
```

### Verification

Always verify your answer!

```python
import numpy as np

A = np.array([[4, 2],
              [1, 3]])

# Eigenvalue λ₁ = 5, eigenvector v₁ = [2, 1]
v1 = np.array([2, 1])
Av1 = A @ v1
lambda1_v1 = 5 * v1

print(f"Av₁ = {Av1}")        # [10, 5]
print(f"5v₁ = {lambda1_v1}")  # [10, 5]
print(f"Equal: {np.allclose(Av1, lambda1_v1)}")  # True ✓

# Eigenvalue λ₂ = 2, eigenvector v₂ = [1, -1]
v2 = np.array([1, -1])
Av2 = A @ v2
lambda2_v2 = 2 * v2

print(f"Av₂ = {Av2}")        # [2, -2]
print(f"2v₂ = {lambda2_v2}")  # [2, -2]
print(f"Equal: {np.allclose(Av2, lambda2_v2)}")  # True ✓
```

---

## Complete 3×3 Example

Now for a larger matrix.

### Problem

Find eigenvalues of:
```
A = ⎡ 2  0  0 ⎤
    ⎢ 0  3  4 ⎥
    ⎣ 0  4  9 ⎦
```

### Step 1: Form A - λI

```
A - λI = ⎡ 2-λ   0     0  ⎤
         ⎢  0   3-λ    4  ⎥
         ⎣  0    4   9-λ  ⎦
```

### Step 2: Calculate Determinant

Use block structure (first row/column has zeros):

```
det(A - λI) = (2-λ) × det⎡ 3-λ    4  ⎤
                         ⎣  4   9-λ  ⎦

            = (2-λ) × [(3-λ)(9-λ) - 16]
            = (2-λ) × [27 - 9λ - 3λ + λ² - 16]
            = (2-λ) × [λ² - 12λ + 11]
            = (2-λ)(λ - 11)(λ - 1)
```

### Step 3: Eigenvalues

```
λ₁ = 2, λ₂ = 11, λ₃ = 1

Verify:
trace(A) = 2 + 3 + 9 = 14 = 2 + 11 + 1 ✓
det(A) = 2(27-16) = 22 = 2 × 11 × 1 ✓
```

---

## Special Cases and Shortcuts

### Diagonal Matrices

The easiest case - eigenvalues jump right out!

```
A = ⎡ d₁  0   0  ⎤
    ⎢ 0   d₂  0  ⎥
    ⎣ 0   0   d₃ ⎦

Eigenvalues = diagonal elements: λᵢ = dᵢ
Eigenvectors = standard basis: e₁ = [1,0,0], e₂ = [0,1,0], e₃ = [0,0,1]

No computation needed!
```

### Triangular Matrices

Upper or lower triangular matrices have a beautiful property:

```
Upper Triangular:
A = ⎡ a  b  c ⎤
    ⎢ 0  d  e ⎥
    ⎣ 0  0  f ⎦

Lower Triangular:
B = ⎡ a  0  0 ⎤
    ⎢ b  d  0 ⎥
    ⎣ c  e  f ⎦

Eigenvalues = diagonal elements: λ = a, d, f

This works for ANY triangular matrix!
```

**Why**: det(A - λI) for triangular matrix is product of diagonal elements.

### Symmetric Matrices

For symmetric A = Aᵀ:

```
Properties (why they're special):
1. All eigenvalues are REAL
2. Eigenvectors are ORTHOGONAL
3. Always diagonalizable: A = QΛQᵀ
   where Q is orthogonal (Qᵀ = Q⁻¹)

Example:
A = ⎡ 2  1 ⎤  (symmetric)
    ⎣ 1  2 ⎦

Eigenvalues: λ₁ = 3, λ₂ = 1 (real ✓)

Eigenvectors:
v₁ = [1/√2,  1/√2]
v₂ = [1/√2, -1/√2]

Check orthogonality:
v₁ · v₂ = (1/√2)(1/√2) + (1/√2)(-1/√2)
        = 1/2 - 1/2 = 0 ✓
```

---

## Using NumPy

In practice, use numerical methods for matrices larger than 3×3:

```python
import numpy as np

# Compute eigenvalues and eigenvectors
A = np.array([[4, 2],
              [1, 3]])

# Method 1: Both eigenvalues and eigenvectors
eigenvalues, eigenvectors = np.linalg.eig(A)
print(f"Eigenvalues: {eigenvalues}")
print(f"Eigenvectors:\n{eigenvectors}")

# Method 2: Only eigenvalues (faster)
eigenvalues = np.linalg.eigvals(A)

# Eigenvectors are columns
v1 = eigenvectors[:, 0]  # First eigenvector
v2 = eigenvectors[:, 1]  # Second eigenvector

# Verify: Av₁ = λ₁v₁
Av1 = A @ v1
lambda1_v1 = eigenvalues[0] * v1
print(f"Verification: {np.allclose(Av1, lambda1_v1)}")
```

---

## Repeated Eigenvalues

When eigenvalues repeat, finding eigenvectors can be trickier.

### Example: Repeated Eigenvalue

```python
# Matrix with repeated eigenvalue
A = ⎡ 3  1 ⎤
    ⎣ 0  3 ⎦

# Characteristic equation:
det(A - λI) = (3-λ)² = 0

# Eigenvalue: λ = 3 (multiplicity 2)

# Find eigenvectors:
(A - 3I)v = ⎡ 0  1 ⎤ ⎡ v₁ ⎤ = ⎡ 0 ⎤
            ⎣ 0  0 ⎦ ⎣ v₂ ⎦   ⎣ 0 ⎦

# Only constraint: v₂ = 0
# Eigenvector: v = [1, 0] (only one independent eigenvector!)

# This matrix is NOT diagonalizable
# (But almost all matrices are - this is rare)
```

---

## Summary

**Characteristic Equation Method**
```
1. Form A - λI
2. Compute det(A - λI)
3. Solve det(A - λI) = 0
4. For each λ, solve (A - λI)v = 0
```

**Key Formulas**
```
2×2 Characteristic Equation:
det([[a-λ, b], [c, d-λ]]) = (a-λ)(d-λ) - bc = 0

Quadratic formula:
λ = (trace ± √(trace² - 4·det)) / 2
```

**Shortcuts**
- Diagonal/Triangular: λ = diagonal elements
- Symmetric: Real eigenvalues, orthogonal eigenvectors
- 2×2: Use quadratic formula

**Verification**
Always check: Av = λv

**Practical Implementation**
- Hand calculations: Up to 3×3
- NumPy: Anything larger
- `np.linalg.eig(A)` for full decomposition
- `np.linalg.eigvals(A)` for just eigenvalues

---

**Related Topics:**
- [Eigenvalues Introduction](./eigenvalues-intro.md) - What eigenvalues mean
- [Eigendecomposition](./eigendecomposition.md) - Using eigenvalues to decompose matrices
- [SVD](./svd-basics.md) - Related decomposition for any matrix
