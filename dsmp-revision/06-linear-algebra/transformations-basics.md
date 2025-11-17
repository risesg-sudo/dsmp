# Linear Transformations - Fundamentals

## What You'll Learn
Every matrix represents a geometric transformation of space. Understanding this connection transforms linear algebra from abstract symbol manipulation into intuitive visual reasoning. You'll learn to "see" what matrices do - how they stretch, rotate, and reshape space.

---

## What is a Linear Transformation?

A linear transformation is a function that moves points in space while preserving two fundamental properties.

### Mathematical Definition

A function T is linear if it preserves:
```
1. Vector addition: T(u + v) = T(u) + T(v)
2. Scalar multiplication: T(cu) = cT(u)
```

These properties mean:
- Straight lines remain straight
- Grid lines remain parallel
- Origin stays fixed
- Ratios along lines are preserved

### Matrix Representation

Every linear transformation can be represented as matrix multiplication:
```
T(x) = Ax

Where A is the transformation matrix
```

**The Beautiful Truth**: Matrices and linear transformations are the same thing, just viewed from different angles.

---

## Scaling Transformations

Scaling stretches or shrinks space along the coordinate axes.

### Horizontal and Vertical Scaling

```
    ⎡ sₓ  0  ⎤
S = ⎣ 0   sᵧ ⎦

Effect:
- x-coordinates multiplied by sₓ
- y-coordinates multiplied by sᵧ
```

### Complete Example

```
S = ⎡ 2  0 ⎤  (double x, triple y)
    ⎣ 0  3 ⎦

Point [1, 1] → S·[1,1] = [2, 3]
Point [2, 1] → S·[2,1] = [4, 3]

Visual:
    y              y
  3 |              |
  2 |              |    * (2,3)
  1 |* (1,1)       |
    |____x         |________x
    0  1  2        0  2  4
   (original)     (scaled)

det(S) = 6 (area scaled by 6 = 2 × 3)
```

### Uniform Scaling

When all directions scale equally:

```
S = cI = ⎡ c  0 ⎤
         ⎣ 0  c ⎦

Scales everything by c
Like zooming in/out

Example: S = 2I doubles all distances
```

### Properties

```
- Diagonal matrix → scales axes independently
- det(S) = sₓ · sᵧ (product of scale factors)
- S⁻¹ scales by 1/sₓ and 1/sᵧ (undo scaling)
- Always invertible if sₓ, sᵧ ≠ 0
```

---

## Rotation Transformations

Rotation spins space around the origin without changing distances.

### The Rotation Matrix

Rotate by angle θ counter-clockwise:
```
      ⎡  cos(θ)  -sin(θ) ⎤
R_θ = ⎣  sin(θ)   cos(θ) ⎦

Properties:
- det(R) = 1 (preserves area)
- R⁻¹ = Rᵀ (orthogonal matrix)
- R⁻¹ = R₋θ (rotate backward)
```

### Common Rotation Angles

**90° Counter-Clockwise**
```
θ = 90° = π/2

R₉₀ = ⎡ cos(90°)  -sin(90°) ⎤ = ⎡ 0  -1 ⎤
      ⎣ sin(90°)   cos(90°) ⎦   ⎣ 1   0 ⎦

Point [1, 0] → [0, 1]  (x-axis → y-axis)
Point [0, 1] → [-1, 0] (y-axis → negative x-axis)

Visual:
    y              y
    |              |*  [0,1]
    |              |
    |              |
    |___*_ x       |____x
    [1,0]
```

**180° Rotation**
```
R₁₈₀ = ⎡ -1   0 ⎤
       ⎣  0  -1 ⎦

Flips through origin
Point [x, y] → [-x, -y]
```

**45° Rotation**
```
R₄₅ = ⎡  √2/2  -√2/2 ⎤
      ⎣  √2/2   √2/2 ⎦

Point [1, 0] → [√2/2, √2/2]
```

### Why This Formula Works

Here's the geometric derivation:

```
Unit vector at angle α: [cos(α), sin(α)]

After rotating by θ: [cos(α+θ), sin(α+θ)]

Using angle addition formulas:
cos(α+θ) = cos(α)cos(θ) - sin(α)sin(θ)
sin(α+θ) = sin(α)cos(θ) + cos(α)sin(θ)

In matrix form:
⎡ cos(α+θ) ⎤   ⎡ cos(θ)  -sin(θ) ⎤ ⎡ cos(α) ⎤
⎣ sin(α+θ) ⎦ = ⎣ sin(θ)   cos(θ) ⎦ ⎣ sin(α) ⎦

This holds for any vector, not just unit vectors!
```

### Example: Rotate Point

```python
import numpy as np

# Rotate [1, 1] by 90°
theta = np.pi/2
R = np.array([[np.cos(theta), -np.sin(theta)],
              [np.sin(theta),  np.cos(theta)]])

point = np.array([1, 1])
rotated = R @ point

print(rotated)  # [-1, 1] (approximately)

# Verify: distance preserved
original_dist = np.linalg.norm(point)
rotated_dist = np.linalg.norm(rotated)
print(f"Distances equal: {np.isclose(original_dist, rotated_dist)}")  # True
```

---

## Reflection Transformations

Reflections flip space across a line or plane like a mirror.

### Reflect Across x-axis

```
      ⎡ 1   0 ⎤
Rₓ =  ⎣ 0  -1 ⎦

Point [x, y] → [x, -y]

Visual:
    y
  2 |  * (2, 3)
  1 |
    |____x
 -1 |
 -2 |  * (2, -3)  (reflected)
```

### Reflect Across y-axis

```
      ⎡ -1  0 ⎤
Rᵧ =  ⎣  0  1 ⎦

Point [x, y] → [-x, y]

Visual:
    y
    |
    |  *     *
    |  |     |
    |__|_____|__x
   -2  -1    1  2
```

### Reflect Across Line y = x

```
          ⎡ 0  1 ⎤
R_diag =  ⎣ 1  0 ⎦

Point [x, y] → [y, x]  (swap coordinates)

Visual:
    y
    |  * (1, 3)
  3 |  |
    |  |___
  1 |     * (3, 1)
    |________x
```

### Properties of Reflections

```
1. det(R) = -1 (flips orientation)
2. R² = I (reflecting twice returns original)
3. R⁻¹ = R (reflection is its own inverse)
4. Rᵀ = R (reflection is symmetric)
```

**Why det = -1?**
Reflection flips one dimension, reversing orientation (like flipping inside-out).

**Why R² = I?**
Reflecting twice across same line returns to original position.

---

## Understanding Transformations Geometrically

### The Column Perspective

The columns of a transformation matrix tell you where the basis vectors go:

```
A = ⎡ a  b ⎤
    ⎣ c  d ⎦

First column [a, c]:  Where [1, 0] goes
Second column [b, d]: Where [0, 1] goes

Any point [x, y] = x·[1,0] + y·[0,1]
              → x·[a,c] + y·[b,d]
```

**Example**:
```
R₉₀ = ⎡ 0  -1 ⎤
      ⎣ 1   0 ⎦

Column 1: [1, 0] → [0, 1]  (x-axis rotates to y-axis)
Column 2: [0, 1] → [-1, 0] (y-axis rotates to -x-axis)

This IS a 90° rotation!
```

### Determinant as Signed Area

```
det(A) = signed area of parallelogram formed by columns

det > 0: Same orientation as original
det < 0: Flipped orientation
|det|:   How much area changes
```

---

## Practical Examples

### Example 1: Scale then Rotate

```python
# Scale by 2, then rotate 45°
S = np.array([[2, 0],
              [0, 2]])

R = np.array([[np.cos(np.pi/4), -np.sin(np.pi/4)],
              [np.sin(np.pi/4),  np.cos(np.pi/4)]])

# Combined transformation
T = R @ S  # Apply S first, then R

point = np.array([1, 0])
result = T @ point  # Scale [1,0] to [2,0], then rotate
```

### Example 2: Detect Transformation Type

```python
def analyze_transformation(A):
    """Identify what type of transformation A represents."""
    det = np.linalg.det(A)

    if np.allclose(A, np.diag(np.diag(A))):
        return "Scaling"
    elif np.allclose(A @ A.T, np.eye(len(A))) and det > 0:
        return "Rotation"
    elif np.allclose(A @ A.T, np.eye(len(A))) and det < 0:
        return "Reflection"
    elif np.abs(det) < 1e-10:
        return "Singular (collapses dimension)"
    else:
        return "General transformation"

# Test
R90 = np.array([[0, -1], [1, 0]])
print(analyze_transformation(R90))  # "Rotation"
```

---

## Summary

**Linear Transformations**
- Functions that preserve vector addition and scalar multiplication
- Represented by matrices: T(x) = Ax
- Preserve lines and parallelism

**Scaling**
- Diagonal matrix: stretches/shrinks axes
- S = diag(sₓ, sᵧ)
- det(S) = product of scale factors

**Rotation**
- R_θ = [[cos θ, -sin θ], [sin θ, cos θ]]
- Preserves distances and angles
- det(R) = 1, R⁻¹ = Rᵀ

**Reflection**
- Flips across axis or line
- det(R) = -1 (orientation reverses)
- R² = I (self-inverse)

**Key Insight**
Matrix columns show where basis vectors go. This completely determines the transformation!

---

**Related Topics:**
- [Advanced Transformations](./transformations-advanced.md) - Shear, projection, composition
- [Matrix Inverse](./matrix-inverse-basics.md) - Reversing transformations
- [Determinants](./determinant-basics.md) - Measuring transformation effects
