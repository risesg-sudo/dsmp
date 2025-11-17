# Matrix Inverse - Fundamentals

## What You'll Learn
The matrix inverse is one of the most powerful concepts in linear algebra. Think of it as the "undo" button for matrix transformations. This guide will help you understand what inverses mean geometrically, when they exist, and how to compute them efficiently for 2×2 matrices.

---

## What is a Matrix Inverse?

The inverse of a matrix A, denoted A⁻¹, is the matrix that "undoes" what A does.

### Mathematical Definition

```
AA⁻¹ = A⁻¹A = I

Where I is the identity matrix

A transforms, A⁻¹ reverses the transformation
```

### Geometric Intuition

Think of transformations and their inverses:

```
If A rotates 90° clockwise,
Then A⁻¹ rotates 90° counter-clockwise

If A scales by 2,
Then A⁻¹ scales by 1/2

If A reflects across x-axis,
Then A⁻¹ also reflects across x-axis (same operation!)

    v  →  Av  →  A⁻¹(Av) = v
         (A)      (A⁻¹)
   original → transform → undo = original
```

### Why Inverses Matter

**1. Solving Linear Systems**
Instead of solving Ax = b directly, use x = A⁻¹b (when A is small)

**2. Reversing Transformations**
In computer graphics, undo rotations, scales, and other transformations

**3. Computing Formulas**
Many ML algorithms require matrix inverses (like linear regression's normal equation)

**4. Theoretical Analysis**
Understanding when solutions exist and are unique

---

## When Does an Inverse Exist?

Not all matrices have inverses. The key requirement is simple but profound.

### The Invertibility Condition

```
A has an inverse ⟺ det(A) ≠ 0

If det(A) = 0:  Matrix is SINGULAR (no inverse)
If det(A) ≠ 0:  Matrix is NON-SINGULAR (inverse exists)
```

### Why Determinant Matters

The geometric reasoning reveals everything:

```
When det(A) = 0:
- Transformation collapses dimension (2D → 1D)
- Information is lost
- Multiple inputs map to same output
- Cannot uniquely reverse
- NO INVERSE EXISTS

When det(A) ≠ 0:
- Transformation preserves dimension
- One-to-one mapping
- Information preserved
- Can uniquely reverse
- INVERSE EXISTS
```

### Examples

```python
# Invertible matrix
A = [[4, 3],
     [2, 1]]
det(A) = 4 - 6 = -2 ≠ 0  ✓ Inverse exists

# Singular matrix
B = [[2, 4],
     [1, 2]]
det(B) = 4 - 4 = 0  ✗ No inverse
# Why? Column 2 = 2 × Column 1 (redundant)
```

---

## Computing 2×2 Inverse

For 2×2 matrices, there's an elegant formula you can memorize.

### The Formula

```
    ⎡ a  b ⎤
A = ⎣ c  d ⎦

       1    ⎡  d  -b ⎤
A⁻¹ = ─────  ⎣ -c   a ⎦
      ad-bc

Steps:
1. Check det(A) = ad - bc ≠ 0
2. Swap diagonal elements (a ↔ d)
3. Negate off-diagonal elements (b → -b, c → -c)
4. Divide everything by determinant
```

### Complete Step-by-Step Example

Let's work through every detail:

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

# Step 4: Divide by determinant (-2)
       1   ⎡  1  -3 ⎤
A⁻¹ = ───  ⎣ -2   4 ⎦
      -2

    ⎡ -1/2   3/2 ⎤
  = ⎣  1    -2   ⎦

# Verify: AA⁻¹ = I
AA⁻¹ = ⎡ 4  3 ⎤ ⎡ -1/2   3/2 ⎤
       ⎣ 2  1 ⎦ ⎣  1    -2   ⎦

Row 1: [4·(-1/2) + 3·1,  4·(3/2) + 3·(-2)]
     = [-2 + 3,  6 - 6]
     = [1, 0] ✓

Row 2: [2·(-1/2) + 1·1,  2·(3/2) + 1·(-2)]
     = [-1 + 1,  3 - 2]
     = [0, 1] ✓

Result: AA⁻¹ = ⎡ 1  0 ⎤ = I ✓
               ⎣ 0  1 ⎦
```

### Practice Example

Try this yourself:

```python
    ⎡ 5  2 ⎤
B = ⎣ 3  1 ⎦

# Step 1: det(B) = 5·1 - 2·3 = 5 - 6 = -1 ✓

# Step 2-3: Swap diagonal, negate off-diagonal
⎡  1  -2 ⎤
⎣ -3   5 ⎦

# Step 4: Divide by -1
       1   ⎡  1  -2 ⎤   ⎡ -1   2 ⎤
B⁻¹ = ───  ⎣ -3   5 ⎦ = ⎣  3  -5 ⎦
      -1
```

---

## Properties of Inverse

These properties are essential for manipulating matrix equations.

### Property 1: Uniqueness

```
If an inverse exists, it's unique

There's only ONE matrix that undoes A
```

### Property 2: Inverse of Inverse

```
(A⁻¹)⁻¹ = A

Undoing the undo gives you back the original
```

### Property 3: Inverse of Product

**CRITICAL: Order reverses!**

```
(AB)⁻¹ = B⁻¹A⁻¹  (order reverses!)

Think: "socks and shoes"
- Put on socks (B), then shoes (A) = AB
- To undo: Remove shoes (A⁻¹), then socks (B⁻¹) = B⁻¹A⁻¹
```

**Proof**

```python
(AB)(B⁻¹A⁻¹) = A(BB⁻¹)A⁻¹
              = A(I)A⁻¹
              = AA⁻¹
              = I ✓

Therefore (AB)⁻¹ = B⁻¹A⁻¹
```

### Property 4: Inverse of Transpose

```
(Aᵀ)⁻¹ = (A⁻¹)ᵀ

Transpose and inverse commute
```

### Property 5: Determinant of Inverse

```
det(A⁻¹) = 1/det(A)

If transformation scales by λ,
inverse scales by 1/λ
```

---

## When Inverse Doesn't Exist

Understanding failure cases prevents errors and reveals structure.

### Singular Matrices (det = 0)

```
A matrix with det = 0 has no inverse because:

1. Columns are linearly dependent
   → Some column is a combination of others
   → Redundant information

2. Maps multiple inputs to same output
   → Cannot uniquely reverse
   → Which input produced this output?

3. Loses information (dimension collapse)
   → 2D collapses to 1D line
   → Cannot recover lost dimension

Examples:
    ⎡ 2  4 ⎤
A = ⎣ 1  2 ⎦    det = 0 (column 2 = 2 × column 1)

    ⎡ 1  2  3 ⎤
B = ⎢ 2  4  6 ⎥  det = 0 (all rows are multiples)
    ⎣ 3  6  9 ⎦
```

### Numerical Issues

Even when inverse exists mathematically, be careful:

```
Near-Singular Matrices (det very small):
- Technically invertible
- But inverse is numerically unstable
- Small errors get hugely amplified

Example:
A = [[1,    1   ],     det = 0.0001
     [1, 1.0001]]

A⁻¹ = [[10001, -10000],   # Huge values!
       [-10000,  10000]]  # Tiny errors → big problems

Warning signs:
- det(A) very small (< 1e-10)
- Condition number very large (> 1e10)
- Results are unreliable
```

---

## When to Use Matrix Inverse

### Good Use Cases

**1. Solving Multiple Systems with Same Matrix**
```python
# Solve Ax = b₁, Ax = b₂, Ax = b₃, ...
A_inv = inv(A)  # Compute once
x1 = A_inv @ b1
x2 = A_inv @ b2
x3 = A_inv @ b3
```

**2. Small Matrices (2×2, 3×3)**
Direct formula is fast and exact

**3. Theoretical Derivations**
Writing formulas symbolically

### Bad Use Cases

**1. Solving Single System**
```python
# BAD: Two operations
A_inv = np.linalg.inv(A)
x = A_inv @ b

# GOOD: One optimized operation
x = np.linalg.solve(A, b)  # Faster and more stable!
```

**2. Large Matrices**
Computing inverse is expensive O(n³) and often unnecessary

**3. Sparse Matrices**
Inverse of sparse matrix is usually dense (loses sparsity)

---

## Summary

**What is Inverse?**
- Matrix A⁻¹ that undoes transformation A
- AA⁻¹ = A⁻¹A = I
- Reverses the geometric effect of A

**When Does It Exist?**
- If and only if det(A) ≠ 0
- Matrix must be square and non-singular
- Transformation must preserve dimension

**2×2 Formula**
```
A⁻¹ = (1/det) × [[d, -b], [-c, a]]
```
Swap diagonal, negate off-diagonal, divide by determinant

**Key Properties**
- (AB)⁻¹ = B⁻¹A⁻¹ (order reverses!)
- (A⁻¹)⁻¹ = A
- det(A⁻¹) = 1/det(A)

**When to Use**
- Multiple systems with same matrix
- Small matrices
- When you actually need the full inverse
- NOT for single solve (use np.linalg.solve instead!)

---

**Related Topics:**
- [Matrix Inverse Advanced](./matrix-inverse-advanced.md) - Computing larger inverses
- [Determinant Basics](./determinant-basics.md) - Understanding invertibility
- [Linear Transformations](./transformations-basics.md) - Geometric interpretation
