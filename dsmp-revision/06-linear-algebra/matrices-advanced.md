# Matrices Advanced - Determinant, Inverse, Transformations

## Table of Contents
1. [Matrix Determinant](#matrix-determinant)
2. [Matrix Inverse](#matrix-inverse)
3. [Linear Transformations](#linear-transformations)
4. [Rank and Singularity](#rank-and-singularity)
5. [ML Applications](#ml-applications)
6. [Interview Questions](#interview-questions)

---

## Matrix Determinant

### What is a Determinant?

**Geometric Intuition**:
The determinant measures the "scaling factor" of a linear transformation.

```
2D Determinant (Area Scaling):

Unit Square:           After transformation A:
  1×1 = 1 unit²        Area = |det(A)| unit²

    (0,1)  (1,1)           ?
      +-----+
      |     |         A     ?
      |     |        →
      +-----+               ?
    (0,0)  (1,0)

If det(A) = 3: Area becomes 3 unit²
If det(A) = -3: Area becomes 3 unit², orientation flipped
If det(A) = 0: Collapses to line (no area)
```

**Key Properties**:
- Measures volume scaling in n-dimensional space
- **Sign indicates orientation** (positive/negative)
- **Zero determinant** = transformation collapses dimension (singular matrix)

---

### 2×2 Determinant

**Formula**:
```
    ⎡ a  b ⎤
A = ⎣ c  d ⎦

det(A) = |A| = ad - bc
```

**Geometric Meaning**: Area of parallelogram formed by column vectors

```
Column vectors: v₁ = [a, c], v₂ = [b, d]

        v₂ = [b,d]
        ↗
       /|
      / |
     /  |
    /___|___→ v₁ = [a,c]

Area = |det(A)| = |ad - bc|
```

**Step-by-step Example**:
```python
    ⎡ 3  1 ⎤
A = ⎣ 2  4 ⎦

det(A) = (3)(4) - (1)(2)
       = 12 - 2
       = 10

Interpretation: Transformation scales area by factor of 10
```

**Special Cases**:
```
1. det(A) > 0: Preserves orientation
   A = [[2, 0],     det = 6 > 0
        [0, 3]]     (stretches, no flip)

2. det(A) < 0: Reverses orientation
   A = [[2, 0],     det = -6 < 0
        [0, -3]]    (flips one axis)

3. det(A) = 0: Collapses dimension
   A = [[2, 4],     det = 0
        [1, 2]]     (parallel columns, maps to line)
```

---

### 3×3 Determinant

**Method 1: Cofactor Expansion (First Row)**

```
    ⎡ a  b  c ⎤
A = ⎢ d  e  f ⎥
    ⎣ g  h  i ⎦

det(A) = a·|e f| - b·|d f| + c·|d e|
           |h i|    |g i|    |g h|

       = a(ei - fh) - b(di - fg) + c(dh - eg)
```

**Complete Step-by-step Example**:
```python
    ⎡ 1  2  3 ⎤
A = ⎢ 0  4  5 ⎥
    ⎣ 1  0  6 ⎦

# Expand along first row
det(A) = 1·|4 5| - 2·|0 5| + 3·|0 4|
           |0 6|    |1 6|    |1 0|

# Calculate each 2×2 determinant
= 1·(4×6 - 5×0) - 2·(0×6 - 5×1) + 3·(0×0 - 4×1)
= 1·(24 - 0) - 2·(0 - 5) + 3·(0 - 4)
= 1·24 - 2·(-5) + 3·(-4)
= 24 + 10 - 12
= 22

Interpretation: Transformation scales volume by factor of 22
```

**Method 2: Rule of Sarrus (3×3 only)**

```
    ⎡ a  b  c ⎤
A = ⎢ d  e  f ⎥
    ⎣ g  h  i ⎦

Repeat first two columns:
a  b  c | a  b
d  e  f | d  e
g  h  i | g  h

Positive diagonals (↘):
+ aei + bfg + cdh

Negative diagonals (↗):
- ceg - afh - bdi

det(A) = aei + bfg + cdh - ceg - afh - bdi
```

**Example**:
```python
    ⎡ 2  1  3 ⎤
A = ⎢ 0  4  1 ⎥
    ⎣ 2  0  5 ⎦

Positive: (2·4·5) + (1·1·2) + (3·0·0) = 40 + 2 + 0 = 42
Negative: (3·4·2) + (2·1·0) + (1·0·5) = 24 + 0 + 0 = 24

det(A) = 42 - 24 = 18
```

---

### Properties of Determinants

**1. Determinant of Identity**:
```
det(I) = 1

For any size:
det(Iₙ) = 1
```

**2. Determinant of Transpose**:
```
det(Aᵀ) = det(A)

Example:
A = [[1, 2],     det(A) = 3
     [0, 3]]

Aᵀ = [[1, 0],   det(Aᵀ) = 3
      [2, 3]]
```

**3. Determinant of Product**:
```
det(AB) = det(A) · det(B)

Example:
A = [[2, 0],     det(A) = 6
     [0, 3]]

B = [[1, 2],     det(B) = -3
     [1, -1]]

det(AB) = 6 × (-3) = -18

Verify:
AB = [[2, 4],    det(AB) = -6 - 12 = -18 ✓
      [3, -3]]
```

**4. Determinant of Inverse**:
```
det(A⁻¹) = 1/det(A)

If det(A) = 5, then det(A⁻¹) = 1/5 = 0.2
```

**5. Determinant of Scalar Multiple**:
```
det(cA) = cⁿ det(A)  where n = size of matrix

For 2×2: det(cA) = c² det(A)
For 3×3: det(cA) = c³ det(A)

Example (2×2):
A = [[1, 2],     det(A) = -1
     [3, 1]]

2A = [[2, 4],    det(2A) = 6 - 12 = -6 - 4
      [6, 2]]             = 4·(-1) = -4 ✓
```

**6. Row Operations**:
```
- Swap rows: det changes sign
- Multiply row by c: det multiplied by c
- Add multiple of one row to another: det unchanged
```

---

### Determinant and Matrix Invertibility

**Key Rule**:
```
Matrix is invertible ⟺ det(A) ≠ 0

det(A) = 0  →  Singular (not invertible)
det(A) ≠ 0  →  Non-singular (invertible)
```

**Why?**
```
Geometric:
- det = 0: Transformation collapses dimension
  → Information is lost
  → Cannot reverse/invert

- det ≠ 0: Transformation preserves dimension
  → No information lost
  → Can reverse/invert
```

---

## Matrix Inverse

### What is an Inverse?

**Definition**: A⁻¹ is the matrix such that:
```
AA⁻¹ = A⁻¹A = I

A "undoes" what A does
```

**Geometric Intuition**:
```
If A rotates 90° clockwise,
Then A⁻¹ rotates 90° counter-clockwise

If A scales by 2,
Then A⁻¹ scales by 1/2

    v  →  Av  →  A⁻¹(Av) = v
         (A)      (A⁻¹)
```

---

### Computing 2×2 Inverse

**Formula**:
```
    ⎡ a  b ⎤
A = ⎣ c  d ⎦

       1    ⎡  d  -b ⎤
A⁻¹ = ─────  ⎣ -c   a ⎦
      ad-bc

Steps:
1. Check det(A) = ad - bc ≠ 0
2. Swap a and d
3. Negate b and c
4. Divide by determinant
```

**Complete Step-by-step Example**:
```python
    ⎡ 4  3 ⎤
A = ⎣ 2  1 ⎦

# Step 1: Calculate determinant
det(A) = (4)(1) - (3)(2)
       = 4 - 6
       = -2

Since det(A) ≠ 0, inverse exists ✓

# Step 2: Swap diagonal elements
⎡ 1  ? ⎤
⎣ ?  4 ⎦

# Step 3: Negate off-diagonal
⎡ 1  -3 ⎤
⎣ -2  4 ⎦

# Step 4: Divide by determinant
       1   ⎡  1  -3 ⎤
A⁻¹ = ───  ⎣ -2   4 ⎦
      -2

    ⎡ -1/2   3/2 ⎤
  = ⎣  1    -2   ⎦

# Verify: AA⁻¹ = I
AA⁻¹ = ⎡ 4  3 ⎤ ⎡ -1/2   3/2 ⎤
       ⎣ 2  1 ⎦ ⎣  1    -2   ⎦

     = ⎡ -2+3     6-6   ⎤ = ⎡ 1  0 ⎤ = I ✓
       ⎣ -1+1     3-2   ⎦   ⎣ 0  1 ⎦
```

---

### Computing n×n Inverse

**Methods**:
1. **Gauss-Jordan Elimination** (most practical)
2. **Adjugate method**: A⁻¹ = (1/det(A)) × adj(A)
3. **LU Decomposition**

**Gauss-Jordan Method**:
```
[A | I] → [I | A⁻¹]

Transform augmented matrix [A | I] to [I | A⁻¹]
using row operations
```

**Complete Example (3×3)**:
```python
    ⎡ 2  1  1 ⎤
A = ⎢ 1  2  1 ⎥
    ⎣ 1  1  2 ⎦

# Step 1: Form augmented matrix [A | I]
⎡ 2  1  1 | 1  0  0 ⎤
⎢ 1  2  1 | 0  1  0 ⎥
⎣ 1  1  2 | 0  0  1 ⎦

# Step 2: Row reduce to [I | A⁻¹]
# R1 ÷ 2
⎡ 1  1/2  1/2 | 1/2  0  0 ⎤
⎢ 1   2    1  |  0   1  0 ⎥
⎣ 1   1    2  |  0   0  1 ⎦

# R2 - R1, R3 - R1
⎡ 1  1/2  1/2 | 1/2   0   0 ⎤
⎢ 0  3/2  1/2 | -1/2  1   0 ⎥
⎣ 0  1/2  3/2 | -1/2  0   1 ⎦

# R2 × (2/3)
⎡ 1  1/2  1/2 | 1/2   0    0  ⎤
⎢ 0   1   1/3 | -1/3  2/3  0  ⎥
⎣ 0  1/2  3/2 | -1/2  0    1  ⎦

# R1 - (1/2)R2, R3 - (1/2)R2
⎡ 1  0  1/3  | 2/3  -1/3   0  ⎤
⎢ 0  1  1/3  | -1/3  2/3   0  ⎥
⎣ 0  0  4/3  | -1/3 -1/3   1  ⎦

# R3 × (3/4)
⎡ 1  0  1/3 | 2/3  -1/3   0  ⎤
⎢ 0  1  1/3 | -1/3  2/3   0  ⎥
⎣ 0  0   1  | -1/4 -1/4  3/4 ⎦

# R1 - (1/3)R3, R2 - (1/3)R3
⎡ 1  0  0 |  3/4  -1/4  -1/4 ⎤
⎢ 0  1  0 | -1/4   3/4  -1/4 ⎥
⎣ 0  0  1 | -1/4  -1/4   3/4 ⎦

# Result:
       ⎡  3/4  -1/4  -1/4 ⎤
A⁻¹ =  ⎢ -1/4   3/4  -1/4 ⎥
       ⎣ -1/4  -1/4   3/4 ⎦
```

---

### Properties of Inverse

**1. Uniqueness**:
```
If inverse exists, it's unique
```

**2. Inverse of Inverse**:
```
(A⁻¹)⁻¹ = A
```

**3. Inverse of Product (reverse order!)**:
```
(AB)⁻¹ = B⁻¹A⁻¹  (order reverses!)

Similar to transpose: (AB)ᵀ = BᵀAᵀ
```

**Proof**:
```python
(AB)(B⁻¹A⁻¹) = A(BB⁻¹)A⁻¹
              = A(I)A⁻¹
              = AA⁻¹
              = I ✓
```

**4. Inverse of Transpose**:
```
(Aᵀ)⁻¹ = (A⁻¹)ᵀ
```

**5. Inverse of Scalar Multiple**:
```
(cA)⁻¹ = (1/c)A⁻¹
```

**6. Determinant of Inverse**:
```
det(A⁻¹) = 1/det(A)
```

---

### Special Matrix Inverses

**1. Diagonal Matrix**:
```
    ⎡ d₁  0   0  ⎤           ⎡ 1/d₁   0     0   ⎤
D = ⎢ 0   d₂  0  ⎥    D⁻¹ =  ⎢  0    1/d₂   0   ⎥
    ⎣ 0   0   d₃ ⎦           ⎣  0     0    1/d₃ ⎦

Simply invert each diagonal element!
```

**2. Orthogonal Matrix**:
```
For orthogonal Q: QᵀQ = I

Therefore: Q⁻¹ = Qᵀ

Inverse = Transpose (very efficient!)
```

**3. Identity Matrix**:
```
I⁻¹ = I
```

---

### When Inverse Doesn't Exist

**Singular Matrix** (det = 0):
```
Not invertible because:
1. Columns are linearly dependent
2. Maps multiple inputs to same output
3. Loses information (dimension collapse)

Examples:
    ⎡ 2  4 ⎤
A = ⎣ 1  2 ⎦    det = 0 (rows are multiples)

    ⎡ 1  2  3 ⎤
B = ⎢ 2  4  6 ⎥  det = 0 (rows are multiples)
    ⎣ 3  6  9 ⎦
```

**Numerical Issues**:
```
det(A) very small (near 0):
- Technically invertible
- But inverse is numerically unstable
- Small errors get amplified

Example:
A = [[1,    1   ],     det = 0.0001
     [1, 1.0001]]

A⁻¹ = [[10001, -10000],   # Huge values!
       [-10000,  10000]]  # Amplifies errors
```

---

## Linear Transformations

### What is a Linear Transformation?

**Definition**: Function T that preserves vector addition and scalar multiplication:
```
T(u + v) = T(u) + T(v)
T(cu) = cT(u)
```

**Matrix Representation**:
Every linear transformation can be represented as matrix multiplication:
```
T(x) = Ax
```

---

### Types of Transformations

### 1. Scaling

**Stretch or shrink along axes**:
```
    ⎡ sₓ  0  ⎤
S = ⎣ 0   sᵧ ⎦

Effect: x-component scaled by sₓ, y-component by sᵧ
```

**Example**:
```
S = ⎡ 2  0 ⎤  (double x, triple y)
    ⎣ 0  3 ⎦

Point [1, 1] → S·[1,1] = [2, 3]

Visual:
    y              y
    |              |
    |* (1,1)       |
    |              |    * (2,3)
    |____x         |________x
                  (stretched)

det(S) = 6 (area scaled by 6)
```

**Uniform Scaling**:
```
S = cI = ⎡ c  0 ⎤
         ⎣ 0  c ⎦

Scales all directions equally
```

---

### 2. Rotation

**Rotate by angle θ counter-clockwise**:
```
      ⎡  cos(θ)  -sin(θ) ⎤
R_θ = ⎣  sin(θ)   cos(θ) ⎦

Properties:
- det(R) = 1 (preserves area)
- R⁻¹ = Rᵀ (orthogonal)
- R⁻¹ = R₋θ (rotate backward)
```

**Example: Rotate 90° counter-clockwise**:
```
θ = 90° = π/2

R₉₀ = ⎡ cos(90°)  -sin(90°) ⎤ = ⎡ 0  -1 ⎤
      ⎣ sin(90°)   cos(90°) ⎦   ⎣ 1   0 ⎦

Point [1, 0] → R·[1,0] = [0, 1]

Visual:
    y              y
    |              |
    |              |*  (rotated up)
    |              |
    |___*_ x       |____x
```

**Derivation**:
```
Unit vector at angle α: [cos(α), sin(α)]

After rotating by θ: [cos(α+θ), sin(α+θ)]

Using angle addition:
cos(α+θ) = cos(α)cos(θ) - sin(α)sin(θ)
sin(α+θ) = sin(α)cos(θ) + cos(α)sin(θ)

In matrix form:
⎡ cos(α+θ) ⎤ = ⎡ cos(θ)  -sin(θ) ⎤ ⎡ cos(α) ⎤
⎣ sin(α+θ) ⎦   ⎣ sin(θ)   cos(θ) ⎦ ⎣ sin(α) ⎦
```

---

### 3. Reflection

**Reflect across x-axis**:
```
      ⎡ 1   0 ⎤
Rₓ =  ⎣ 0  -1 ⎦

Point [x, y] → [x, -y]

Visual:
    y
    |  * (2, 3)
    |
    |____x
    |
    |  * (2, -3)  (reflected)
```

**Reflect across y-axis**:
```
      ⎡ -1  0 ⎤
Rᵧ =  ⎣  0  1 ⎦

Point [x, y] → [-x, y]
```

**Reflect across line y = x**:
```
      ⎡ 0  1 ⎤
R_diag = ⎣ 1  0 ⎦

Point [x, y] → [y, x]  (swap coordinates)
```

**Properties**:
- det(R) = -1 (flips orientation)
- R² = I (applying twice returns original)
- R⁻¹ = R (reflection is its own inverse)

---

### 4. Shear

**Horizontal shear**:
```
      ⎡ 1  k ⎤
Sₕ =  ⎣ 0  1 ⎦

Point [x, y] → [x + ky, y]

y-coordinate unchanged
x-coordinate shifts proportional to y
```

**Example**:
```
S = ⎡ 1  2 ⎤
    ⎣ 0  1 ⎦

[1, 1] → [1+2·1, 1] = [3, 1]
[0, 1] → [0+2·1, 1] = [2, 1]

Visual:
    +----+           +----+
    |    |    →         /  |
    +----+           +----+
   (square)         (sheared)

det(S) = 1 (preserves area!)
```

**Vertical shear**:
```
      ⎡ 1  0 ⎤
Sᵥ =  ⎣ k  1 ⎦

Point [x, y] → [x, y + kx]
```

---

### 5. Projection

**Project onto x-axis**:
```
      ⎡ 1  0 ⎤
Pₓ =  ⎣ 0  0 ⎦

Point [x, y] → [x, 0]

Visual:
    y
    |  * (3, 4)
    |  |
    |__|___x
       * (3, 0)  (projected)
```

**Project onto y-axis**:
```
      ⎡ 0  0 ⎤
Pᵧ =  ⎣ 0  1 ⎦

Point [x, y] → [0, y]
```

**Project onto line through origin**:
```
For unit vector u = [u₁, u₂]:

      ⎡ u₁²    u₁u₂ ⎤
P_u = ⎣ u₁u₂   u₂²  ⎦ = uuᵀ

Properties:
- P² = P (projecting twice = projecting once)
- det(P) = 0 (collapses dimension)
- Not invertible
```

---

### Composing Transformations

**Order Matters!**
```
Apply B first, then A: AB (not BA)

If B rotates and A scales:
AB: "rotate then scale"
BA: "scale then rotate" (different result!)
```

**Example**:
```
Rotate 90° then scale x by 2:

R = ⎡ 0  -1 ⎤     S = ⎡ 2  0 ⎤
    ⎣ 1   0 ⎦         ⎣ 0  1 ⎦

SR = ⎡ 2  0 ⎤ ⎡ 0  -1 ⎤ = ⎡ 0  -2 ⎤
     ⎣ 0  1 ⎦ ⎣ 1   0 ⎦   ⎣ 1   0 ⎦

Point [1, 0]:
→ R·[1,0] = [0, 1]  (rotate)
→ S·[0,1] = [0, 1]  (scale)

Versus scale then rotate:

RS = ⎡ 0  -1 ⎤ ⎡ 2  0 ⎤ = ⎡ 0  -1 ⎤
     ⎣ 1   0 ⎦ ⎣ 0  1 ⎦   ⎣ 2   0 ⎦

Point [1, 0]:
→ S·[1,0] = [2, 0]  (scale)
→ R·[2,0] = [0, 2]  (rotate)

Different results!
```

---

## Rank and Singularity

### Matrix Rank

**Definition**: Maximum number of linearly independent rows or columns

```
Rank = dimension of output space

    ⎡ 1  2  3 ⎤
A = ⎣ 2  4  6 ⎦

Row 2 = 2 × Row 1 (linearly dependent)
Rank(A) = 1

Geometric: All points map to a line (1D)
```

---

### Full Rank vs Rank Deficient

**Full Rank**:
```
m×n matrix with rank = min(m, n)

3×3 matrix: Full rank = 3
2×3 matrix: Full rank = 2
```

**Rank Deficient**:
```
Rank < min(m, n)

Indicates:
- Linearly dependent rows/columns
- Collapses dimension
- Not invertible (if square)
```

**Examples**:
```python
# Full rank (rank = 2)
A = [[1, 2],
     [3, 4]]
rank = 2, det ≠ 0, invertible ✓

# Rank deficient (rank = 1)
B = [[2, 4],
     [1, 2]]
rank = 1, det = 0, not invertible ✗

# Rank deficient (rank = 2, need 3)
C = [[1, 2, 3],
     [2, 4, 6],
     [3, 6, 9]]
rank = 2 < 3, det = 0, not invertible ✗
```

---

### Null Space (Kernel)

**Definition**: Set of vectors that map to zero
```
Null(A) = {x : Ax = 0}
```

**Relationship**:
```
Rank-Nullity Theorem:
rank(A) + nullity(A) = n  (number of columns)

If A is n×n:
- Full rank (rank = n) → nullity = 0 → only 0 maps to 0
- Rank deficient → nullity > 0 → infinitely many solutions
```

**Example**:
```python
    ⎡ 1  2 ⎤
A = ⎣ 2  4 ⎦

Find x such that Ax = 0:

⎡ 1  2 ⎤ ⎡ x₁ ⎤ = ⎡ 0 ⎤
⎣ 2  4 ⎦ ⎣ x₂ ⎦   ⎣ 0 ⎦

x₁ + 2x₂ = 0
2x₁ + 4x₂ = 0  (same as first equation)

Solution: x₁ = -2x₂

Null space: {[-2t, t] : t ∈ ℝ}
All vectors of form [-2, 1] scaled

Example: [-2, 1], [-4, 2], [2, -1] all map to [0, 0]
```

---

## ML Applications

### 1. Solving Linear Systems (Normal Equation)

**Linear Regression**: Find weights that minimize error

```
Problem: Xθ = y

Normal Equation:
θ = (XᵀX)⁻¹Xᵀy

Requires:
- XᵀX is invertible
- rank(X) = n (full column rank)
```

**Complete Example**:
```python
import numpy as np

# Data: y = 2x + 1 + noise
X = np.array([
    [1, 1],   # [bias, x]
    [1, 2],
    [1, 3],
    [1, 4]
])

y = np.array([[3], [5], [7], [9]])

# Normal equation
XtX = X.T @ X
# = [[4, 10],
#    [10, 30]]

Xty = X.T @ y
# = [[24],
#    [70]]

# Check if invertible
det_XtX = np.linalg.det(XtX)
print(f"det(XᵀX) = {det_XtX}")  # 20 ≠ 0, invertible ✓

# Solve
theta = np.linalg.inv(XtX) @ Xty
# θ = [1, 2]  (intercept=1, slope=2)

print(f"Fitted: y = {theta[1][0]}x + {theta[0][0]}")
```

**When Normal Equation Fails**:
```python
# Multicollinear features
X = np.array([
    [1, 2, 4],   # feature2 = 2 × feature1
    [1, 3, 6],
    [1, 4, 8]
])

XtX = X.T @ X
det_XtX = np.linalg.det(XtX)
# ≈ 0 (numerically singular)

# Cannot invert! Use:
# 1. Ridge regression (add λI)
# 2. Remove redundant features
# 3. Use gradient descent instead
```

---

### 2. Image Transformations

**Rotate, Scale, Shear Images**:

```python
from scipy import ndimage
import numpy as np

# Rotation matrix
angle = 45  # degrees
theta = np.radians(angle)
rotation_matrix = np.array([
    [np.cos(theta), -np.sin(theta)],
    [np.sin(theta),  np.cos(theta)]
])

# Apply to image (affine transformation)
rotated_image = ndimage.rotate(image, angle)

# Scaling (zoom)
scale_matrix = np.array([
    [2, 0],  # 2x in x-direction
    [0, 2]   # 2x in y-direction
])
```

**Data Augmentation**:
```python
# Random transformations for training
def random_transform():
    # Random rotation (-15 to +15 degrees)
    angle = np.random.uniform(-15, 15)

    # Random scaling (0.9 to 1.1)
    scale = np.random.uniform(0.9, 1.1)

    # Random shear
    shear = np.random.uniform(-0.2, 0.2)

    # Compose transformation matrix
    T = rotation(angle) @ scaling(scale) @ shearing(shear)

    return T
```

---

### 3. Determinant for Volume/Area

**Confidence Ellipsoids**:
```python
# Covariance matrix
cov = np.array([
    [2.0, 0.5],
    [0.5, 1.0]
])

# Volume of confidence ellipse ∝ √det(cov)
volume_scale = np.sqrt(np.linalg.det(cov))

# Larger determinant = more spread out distribution
```

---

### 4. Checking Multicollinearity

**VIF (Variance Inflation Factor)**:
```python
def check_multicollinearity(X):
    """
    Check if features are linearly dependent.
    """
    # Compute correlation matrix
    corr = np.corrcoef(X.T)

    # Check determinant
    det_corr = np.linalg.det(corr)

    if det_corr < 1e-10:
        print("Warning: Features are nearly collinear!")
        print(f"det(correlation) = {det_corr}")
        return True
    else:
        print("Features are independent")
        return False

# Example
X = np.array([
    [1, 2, 3],
    [2, 4, 5],
    [3, 6, 7]
])

check_multicollinearity(X)
```

---

### 5. Matrix Inversion in Optimization

**Newton's Method**:
```
Update: x_new = x_old - H⁻¹∇f(x)

Where:
- H: Hessian matrix (2nd derivatives)
- ∇f: Gradient vector

Requires H to be invertible!
```

**Example**:
```python
def newtons_method(f, grad_f, hess_f, x0, tol=1e-6):
    """
    Newton's method for optimization.
    """
    x = x0
    for i in range(100):
        g = grad_f(x)
        H = hess_f(x)

        # Check if Hessian is invertible
        if np.linalg.det(H) == 0:
            print("Singular Hessian!")
            break

        # Newton update
        x_new = x - np.linalg.inv(H) @ g

        if np.linalg.norm(x_new - x) < tol:
            break
        x = x_new

    return x
```

---

## Interview Questions

### Conceptual Questions

**Q1: What does it mean geometrically if det(A) = 0?**
```
Geometric Interpretation:
- 2D: Transformation collapses area to 0 (maps to line)
- 3D: Transformation collapses volume to 0 (maps to plane/line)
- nD: Loses at least one dimension

Consequences:
1. Matrix is singular (not invertible)
2. Linear system Ax = b may have:
   - No solution (inconsistent)
   - Infinitely many solutions (underdetermined)
3. Columns/rows are linearly dependent
4. Rank deficient

ML Implications:
- Multicollinearity in features
- Cannot use normal equation directly
- Need regularization or feature selection

Example:
A = [[2, 4],     det = 0
     [1, 2]]

Column 2 = 2 × Column 1 (redundant)
Maps all points to line y = 0.5x
```

**Q2: Why is (AB)⁻¹ = B⁻¹A⁻¹ (reversed order)?**
```
Think about putting on socks and shoes:

"Put on socks (B), then shoes (A)" = AB

To undo: Must reverse order!
"Remove shoes (A⁻¹), then socks (B⁻¹)" = B⁻¹A⁻¹

Proof:
(AB)(B⁻¹A⁻¹) = A(BB⁻¹)A⁻¹
              = AIA⁻¹
              = AA⁻¹
              = I ✓

Therefore (AB)⁻¹ = B⁻¹A⁻¹

Same principle as transpose: (AB)ᵀ = BᵀAᵀ
```

**Q3: What's the difference between rank and determinant?**
```
Rank:
- Defined for any m×n matrix
- Counts independent dimensions
- rank ∈ {0, 1, 2, ..., min(m,n)}
- Geometric: Output dimension

Determinant:
- Only for square n×n matrices
- Measures volume scaling
- det ∈ ℝ (can be any real number)
- Geometric: Volume scaling factor

Relationship:
- For square matrix: rank < n ⟺ det = 0
- But different information:

  A = [[2, 0],    rank = 2 (full)
       [0, 3]]    det = 6 (scales area by 6)

  B = [[6, 0],    rank = 2 (same rank)
       [0, 1]]    det = 6 (same det)

  But different scaling in each direction!
```

**Q4: When would you use matrix inverse vs solving Ax=b directly?**
```
Use Inverse (A⁻¹):
- Need to solve Ax = b for MANY different b
- Matrix size is small
- Want explicit transformation

Don't Use Inverse:
- Solving Ax = b once (use LU decomposition)
- Large matrices (expensive to compute)
- Numerical stability concerns
- A is sparse (inverse is dense)

Example:

# Bad (if solving once)
A_inv = np.linalg.inv(A)
x = A_inv @ b  # Two operations

# Good
x = np.linalg.solve(A, b)  # More efficient and stable

# But if solving for many b:
for b in multiple_b_vectors:
    x = A_inv @ b  # Reuse inverse (good!)
```

---

### Coding Questions

**Q5: Implement 2×2 determinant and inverse**
```python
def det_2x2(A):
    """
    Calculate determinant of 2×2 matrix.
    """
    return A[0][0] * A[1][1] - A[0][1] * A[1][0]

def inv_2x2(A):
    """
    Calculate inverse of 2×2 matrix.
    """
    det = det_2x2(A)

    if abs(det) < 1e-10:
        raise ValueError("Matrix is singular (det ≈ 0)")

    # Swap diagonal, negate off-diagonal, divide by det
    return [
        [ A[1][1]/det, -A[0][1]/det],
        [-A[1][0]/det,  A[0][0]/det]
    ]

# Test
A = [[4, 3],
     [2, 1]]

det = det_2x2(A)
print(f"det = {det}")  # -2

A_inv = inv_2x2(A)
print(f"A⁻¹ = {A_inv}")
# [[-0.5, 1.5], [1.0, -2.0]]

# Verify
import numpy as np
I = np.array(A) @ np.array(A_inv)
print(f"AA⁻¹ = {I}")  # Should be close to [[1, 0], [0, 1]]
```

**Q6: Check if matrix is invertible**
```python
def is_invertible(A):
    """
    Check if matrix is invertible.

    A matrix is invertible if:
    1. It's square
    2. det(A) ≠ 0
    3. Rank is full
    """
    import numpy as np

    A = np.array(A)

    # Check if square
    if A.shape[0] != A.shape[1]:
        return False, "Not square"

    # Check determinant
    det = np.linalg.det(A)
    if abs(det) < 1e-10:
        return False, f"Singular (det = {det:.2e})"

    # Check rank
    rank = np.linalg.matrix_rank(A)
    n = A.shape[0]
    if rank < n:
        return False, f"Rank deficient ({rank} < {n})"

    return True, f"Invertible (det = {det:.4f})"

# Test
A = [[1, 2], [3, 4]]
print(is_invertible(A))  # (True, 'Invertible (det = -2.0000)')

B = [[2, 4], [1, 2]]
print(is_invertible(B))  # (False, 'Singular (det = 0.00e+00)')
```

**Q7: Apply transformation to points**
```python
def transform_points(points, transformation):
    """
    Apply linear transformation to multiple points.

    Args:
        points: (n, 2) array of 2D points
        transformation: (2, 2) transformation matrix

    Returns:
        Transformed points
    """
    import numpy as np

    points = np.array(points)
    T = np.array(transformation)

    # Each row is a point, apply T to each
    # points @ T.T  or  (T @ points.T).T
    transformed = points @ T.T

    return transformed

# Example: Rotate square 90° counter-clockwise
square = np.array([
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1]
])

rotation_90 = np.array([
    [0, -1],
    [1,  0]
])

rotated_square = transform_points(square, rotation_90)
print(rotated_square)
# [[ 0,  0],
#  [ 0,  1],
#  [-1,  1],
#  [-1,  0]]
```

**Q8: Detect multicollinearity**
```python
def detect_multicollinearity(X, threshold=0.1):
    """
    Detect multicollinearity in feature matrix.

    Returns features that are nearly linearly dependent.
    """
    import numpy as np

    # Standardize features
    X = (X - np.mean(X, axis=0)) / np.std(X, axis=0)

    # Compute correlation matrix
    corr = np.corrcoef(X.T)

    # Check determinant
    det_corr = np.linalg.det(corr)

    results = {
        'determinant': det_corr,
        'is_multicollinear': det_corr < threshold,
        'high_correlations': []
    }

    # Find highly correlated pairs
    n = corr.shape[0]
    for i in range(n):
        for j in range(i+1, n):
            if abs(corr[i,j]) > 0.9:  # High correlation
                results['high_correlations'].append({
                    'feature1': i,
                    'feature2': j,
                    'correlation': corr[i,j]
                })

    return results

# Test with multicollinear data
X = np.array([
    [1, 2, 2.1],   # col2 ≈ col1
    [2, 4, 4.2],
    [3, 6, 5.9]
])

result = detect_multicollinearity(X)
print(f"Multicollinear: {result['is_multicollinear']}")
print(f"Determinant: {result['determinant']:.6f}")
print(f"High correlations: {result['high_correlations']}")
```

---

## Quick Reference

### NumPy Functions
```python
import numpy as np

# Determinant
det = np.linalg.det(A)

# Inverse
A_inv = np.linalg.inv(A)

# Rank
rank = np.linalg.matrix_rank(A)

# Solve Ax = b
x = np.linalg.solve(A, b)

# Condition number (measures numerical stability)
cond = np.linalg.cond(A)  # Large value = ill-conditioned

# Check if close to identity
is_identity = np.allclose(A @ A_inv, np.eye(n))
```

### Key Formulas
```
2×2 Determinant:
det([[a,b],[c,d]]) = ad - bc

2×2 Inverse:
A⁻¹ = (1/det) × [[d,-b],[-c,a]]

Properties:
det(AB) = det(A)det(B)
det(Aᵀ) = det(A)
det(A⁻¹) = 1/det(A)
det(cA) = cⁿdet(A)  (n = size)

(AB)⁻¹ = B⁻¹A⁻¹
(Aᵀ)⁻¹ = (A⁻¹)ᵀ

Common Transformations (2D):
Rotation: [[cos θ, -sin θ], [sin θ, cos θ]]
Scale: [[sₓ, 0], [0, sᵧ]]
Reflect x: [[1, 0], [0, -1]]
Reflect y: [[-1, 0], [0, 1]]
Shear: [[1, k], [0, 1]]
```

---

**Next**: [Eigenvalues, Eigenvectors & SVD](./eigen-svd.md)
