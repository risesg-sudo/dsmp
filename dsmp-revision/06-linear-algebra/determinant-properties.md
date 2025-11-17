# Determinant Properties and 3×3 Computation

## What You'll Learn
Moving beyond 2×2 matrices, you'll master computing determinants for larger matrices and discover the elegant properties that make determinants so powerful. These properties aren't just mathematical curiosities - they're computational shortcuts and theoretical insights that reveal deep connections between matrix operations.

---

## 3×3 Determinant

Computing larger determinants requires systematic methods. Let's explore two powerful techniques.

### Method 1: Cofactor Expansion

This method breaks down a 3×3 determinant into three 2×2 determinants.

**Formula (Expanding Along First Row)**

```
    ⎡ a  b  c ⎤
A = ⎢ d  e  f ⎥
    ⎣ g  h  i ⎦

det(A) = a·|e f| - b·|d f| + c·|d e|
           |h i|    |g i|    |g h|

       = a(ei - fh) - b(di - fg) + c(dh - eg)
```

The pattern: +a, -b, +c (alternating signs).

### Complete Example

Let's work through every step:

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

Interpretation: This transformation scales volume by factor of 22
```

### Method 2: Rule of Sarrus

This diagonal method works only for 3×3 matrices but is faster when you memorize the pattern.

**The Pattern**

```
    ⎡ a  b  c ⎤
A = ⎢ d  e  f ⎥
    ⎣ g  h  i ⎦

Repeat first two columns to the right:
a  b  c | a  b
d  e  f | d  e
g  h  i | g  h

Positive diagonals (↘):
+ aei + bfg + cdh

Negative diagonals (↗):
- ceg - afh - bdi

det(A) = aei + bfg + cdh - ceg - afh - bdi
```

### Sarrus Example

```python
    ⎡ 2  1  3 ⎤
A = ⎢ 0  4  1 ⎥
    ⎣ 2  0  5 ⎦

Visualize:
2  1  3 | 2  1
0  4  1 | 0  4
2  0  5 | 2  0

Positive diagonals:
(2·4·5) + (1·1·2) + (3·0·0) = 40 + 2 + 0 = 42

Negative diagonals:
(3·4·2) + (2·1·0) + (1·0·5) = 24 + 0 + 0 = 24

det(A) = 42 - 24 = 18
```

---

## Properties of Determinants

These properties are computational gold - they simplify calculations and reveal deep mathematical truths.

### Property 1: Identity Matrix

The identity transformation doesn't change anything, so it doesn't scale volume:

```
det(I) = 1

For any size:
det(I₂) = 1
det(I₃) = 1
det(Iₙ) = 1
```

### Property 2: Determinant of Transpose

Flipping rows and columns doesn't change the determinant:

```
det(Aᵀ) = det(A)

Example:
A = [[1, 2],     det(A) = 3
     [0, 3]]

Aᵀ = [[1, 0],   det(Aᵀ) = 3
      [2, 3]]
```

This beautiful symmetry means row operations and column operations have identical effects!

### Property 3: Determinant of Product

This is where determinants shine - they behave perfectly under multiplication:

```
det(AB) = det(A) · det(B)

The scaling factors multiply!
```

**Complete Example**

```python
A = [[2, 0],     det(A) = 6
     [0, 3]]

B = [[1, 2],     det(B) = -3
     [1, -1]]

det(AB) = 6 × (-3) = -18

Verify by computing AB:
AB = [[2, 4],    det(AB) = -6 - 12 = -18 ✓
      [3, -3]]
```

**Intuition**: If A scales volume by 6 and B scales by 3, then AB scales by 6×3 = 18.

### Property 4: Determinant of Inverse

If a transformation scales by λ, its inverse scales by 1/λ:

```
det(A⁻¹) = 1/det(A)

If det(A) = 5, then det(A⁻¹) = 1/5 = 0.2
```

**Why**: Since AA⁻¹ = I, we have det(AA⁻¹) = det(I) = 1
So det(A)·det(A⁻¹) = 1, thus det(A⁻¹) = 1/det(A)

### Property 5: Determinant of Scalar Multiple

Scaling a matrix by c scales each dimension by c:

```
det(cA) = cⁿ det(A)  where n = size of matrix

For 2×2: det(cA) = c² det(A)
For 3×3: det(cA) = c³ det(A)
```

**Example (2×2)**

```python
A = [[1, 2],     det(A) = -5
     [3, 1]]

2A = [[2, 4],    det(2A) = 2 - 12 = -10
      [6, 2]]             = 4·(-5/4) = 2²·det(A) ✓
```

**Why**: Scaling each of n dimensions by c multiplies volume by cⁿ.

### Property 6: Row Operations

These properties make Gaussian elimination work:

```
1. Swap two rows: determinant changes sign
   det(swap(A)) = -det(A)

2. Multiply row by c: determinant multiplied by c
   det(cR₁) = c·det(A)

3. Add multiple of one row to another: determinant unchanged
   det(R₁ + kR₂) = det(A)
```

**Why This Matters**: You can use row operations to simplify determinant calculation!

---

## Special Cases and Shortcuts

### Diagonal Matrices

The easiest case - just multiply the diagonal:

```
    ⎡ d₁  0   0  ⎤
D = ⎢ 0   d₂  0  ⎥
    ⎣ 0   0   d₃ ⎦

det(D) = d₁ · d₂ · d₃

Simply multiply diagonal elements!
```

### Triangular Matrices

Upper and lower triangular matrices have the same property:

```
    ⎡ a  b  c ⎤
A = ⎢ 0  d  e ⎥  (upper triangular)
    ⎣ 0  0  f ⎦

det(A) = a · d · f

Diagonal elements only!
```

This is why row reduction is so powerful - reduce to triangular form, then multiply diagonal.

### Matrices with Zero Row/Column

```
If any row is all zeros: det(A) = 0
If any column is all zeros: det(A) = 0

Why? The transformation collapses that dimension.
```

---

## Computational Strategies

### When to Use Each Method

**Cofactor Expansion**
- Best when matrix has many zeros
- Expand along row/column with most zeros
- Required for larger matrices

**Sarrus Rule**
- Only works for 3×3
- Fast when you know the pattern
- Good for quick hand calculations

**Row Reduction**
- Best for 4×4 and larger
- Reduce to triangular form
- Multiply diagonal elements

---

## Practice Problems

### Problem 1: Compute Determinant

```python
    ⎡ 3  0  0 ⎤
A = ⎢ 2  5  0 ⎥
    ⎣ 1  4  2 ⎦

# Triangular matrix!
det(A) = 3 × 5 × 2 = 30
```

### Problem 2: Use Properties

```python
Given: det(A) = 4, det(B) = -2

Find: det(2AB)

# For 3×3 matrix:
det(2AB) = 2³ · det(AB)
         = 8 · det(A) · det(B)
         = 8 · 4 · (-2)
         = -64
```

---

## Summary

**3×3 Computation Methods**
1. Cofactor expansion: Break into 2×2 determinants
2. Sarrus rule: Diagonal pattern (3×3 only)
3. Row reduction: Convert to triangular form

**Essential Properties**
- det(Aᵀ) = det(A) - Transpose preserves determinant
- det(AB) = det(A)det(B) - Scaling factors multiply
- det(A⁻¹) = 1/det(A) - Inverse flips scaling
- det(cA) = cⁿdet(A) - Scalar multiplication scales by power
- det(I) = 1 - Identity doesn't change volume

**Computational Shortcuts**
- Diagonal/triangular: Just multiply diagonal elements
- Expand along row/column with most zeros
- Use row operations to simplify before computing

---

**Related Topics:**
- [Determinant Basics](./determinant-basics.md)
- [Matrix Inverse Basics](./matrix-inverse-basics.md)
- [Rank and Singularity](./rank-singularity.md)
