# Linear Transformations - Advanced Techniques

## What You'll Learn
Beyond basic rotations and scaling, you'll discover transformations that shear space, project onto subspaces, and compose into complex operations. These advanced transformations are essential for computer graphics, data processing, and understanding how linear systems behave.

---

## Shear Transformations

Shear transformations "skew" space - imagine pushing the top of a rectangle while keeping the bottom fixed.

### Horizontal Shear

```
      ⎡ 1  k ⎤
Sₕ =  ⎣ 0  1 ⎦

Point [x, y] → [x + ky, y]

y-coordinate unchanged
x-coordinate shifts proportional to y
```

### Visualizing Horizontal Shear

```
S = ⎡ 1  2 ⎤
    ⎣ 0  1 ⎦

Transform points:
[0, 0] → [0, 0]  (origin stays put)
[1, 0] → [1, 0]  (x-axis unchanged)
[0, 1] → [2, 1]  (shifted right by 2)
[1, 1] → [3, 1]  (shifted right by 2)

Visual:
    +----+           +----+
    |    |    →         /  |
    +----+           +----+
   (square)         (sheared parallelogram)

Notice: Area preserved! det(S) = 1
```

### Complete Example

```python
import numpy as np

# Horizontal shear by factor 2
S = np.array([[1, 2],
              [0, 1]])

# Shear a square
square = np.array([[0, 1, 1, 0],
                   [0, 0, 1, 1]])

sheared = S @ square

print("Original corners:", square.T)
# [[0, 0], [1, 0], [1, 1], [0, 1]]

print("Sheared corners:", sheared.T)
# [[0, 0], [1, 0], [3, 1], [2, 1]]

# Area check
det = np.linalg.det(S)
print(f"det(S) = {det}")  # 1 (area preserved!)
```

### Vertical Shear

```
      ⎡ 1  0 ⎤
Sᵥ =  ⎣ k  1 ⎦

Point [x, y] → [x, y + kx]

x-coordinate unchanged
y-coordinate shifts proportional to x
```

### Properties of Shear

```
1. det(S) = 1 (area/volume preserved)
2. Parallel lines remain parallel
3. Not orthogonal (distorts angles)
4. Useful for image effects and coordinate changes
```

---

## Projection Transformations

Projections collapse higher-dimensional space onto lower-dimensional subspaces.

### Project onto x-axis

```
      ⎡ 1  0 ⎤
Pₓ =  ⎣ 0  0 ⎦

Point [x, y] → [x, 0]

Flattens all points to x-axis

Visual:
    y
  4 |  * (3, 4)
    |  |
  2 |  |
    |  |
    |__|___x
       * (3, 0)  (projected)
```

### Project onto y-axis

```
      ⎡ 0  0 ⎤
Pᵧ =  ⎣ 0  1 ⎦

Point [x, y] → [0, y]

Flattens all points to y-axis
```

### Project onto Arbitrary Line

For a unit vector u = [u₁, u₂], project onto the line through u:

```
      ⎡ u₁²    u₁u₂ ⎤
P_u = ⎣ u₁u₂   u₂²  ⎦ = uuᵀ

This is the outer product of u with itself!
```

### Example: Project onto Diagonal

```python
# Project onto line y = x (diagonal)
# Unit vector: u = [1/√2, 1/√2]

u = np.array([[1/np.sqrt(2)],
              [1/np.sqrt(2)]])

P = u @ u.T
# [[0.5, 0.5],
#  [0.5, 0.5]]

# Project point [4, 2]
point = np.array([4, 2])
projected = P @ point
# [3, 3]  (average of coordinates onto diagonal)

# Visual:
#     y
#   4 |
#   3 |    * [3,3] projected
#   2 |  * [4,2]
#   1 |  /
#     |/____x
#     0  2  4
```

### Properties of Projections

```
1. P² = P (projecting twice = projecting once)
   "Idempotent" property

2. det(P) = 0 (collapses dimension, singular)

3. Not invertible (information lost)

4. Pᵀ = P for orthogonal projections (symmetric)

5. rank(P) = dimension of projection subspace
```

### Why P² = P?

```
If you project once, you're already on the subspace
Projecting again doesn't move you further

Mathematically:
P²v = P(Pv)
    = projection of (projection of v)
    = projection of v  (already on subspace!)
    = Pv
```

---

## Composing Transformations

Order matters when combining transformations!

### Matrix Multiplication Order

```
To apply B first, then A: compute AB (not BA)

If B rotates and A scales:
AB: "rotate then scale"
BA: "scale then rotate" (DIFFERENT result!)
```

### Complete Example: Order Matters

```python
# Rotate 90°
R = np.array([[0, -1],
              [1,  0]])

# Scale x by 2
S = np.array([[2, 0],
              [0, 1]])

# Compose: Rotate then Scale
T1 = S @ R  # Apply R first, then S
print(T1)
# [[0, -2],
#  [1,  0]]

# Compose: Scale then Rotate
T2 = R @ S  # Apply S first, then R
print(T2)
# [[0, -1],
#  [2,  0]]

# Apply to point [1, 0]
point = np.array([1, 0])

result1 = T1 @ point  # [0, 1]
result2 = T2 @ point  # [0, 2]

# Different results!
```

### Visualizing the Difference

```
Point [1, 0]:

Rotate then Scale (T1):
[1, 0] → R → [0, 1] → S → [0, 1]
(no scaling of y)

Scale then Rotate (T2):
[1, 0] → S → [2, 0] → R → [0, 2]
(scaling affects rotated result)
```

### Practical Composition

```python
def compose_transformations(*transforms):
    """
    Compose multiple transformations.
    Applied in order: transforms[0] first, transforms[-1] last.
    """
    # Multiply in reverse order
    result = transforms[-1]
    for T in reversed(transforms[:-1]):
        result = T @ result
    return result

# Example: Scale, then rotate, then translate (2D homogeneous)
scale = np.array([[2, 0], [0, 2]])
rotate = np.array([[0, -1], [1, 0]])

combined = compose_transformations(scale, rotate)
# Applies scale first, then rotate
```

---

## Complex Transformation Examples

### Example 1: Create Custom Transformation

```python
def create_shear_rotate(shear_k, angle):
    """
    Shear horizontally, then rotate.
    """
    shear = np.array([[1, shear_k],
                      [0, 1]])

    rotate = np.array([[np.cos(angle), -np.sin(angle)],
                       [np.sin(angle),  np.cos(angle)]])

    return rotate @ shear

# Shear by 0.5, then rotate 30°
T = create_shear_rotate(0.5, np.pi/6)
```

### Example 2: Decompose Transformation

```python
def is_rotation(A, tol=1e-10):
    """Check if A is a rotation matrix."""
    # Orthogonal: AᵀA = I
    is_orthogonal = np.allclose(A.T @ A, np.eye(len(A)), atol=tol)
    # Proper rotation: det = 1 (not reflection)
    det_is_one = np.isclose(np.linalg.det(A), 1, atol=tol)
    return is_orthogonal and det_is_one

def is_shear(A, tol=1e-10):
    """Check if A is a shear matrix."""
    # det = 1 (area preserving)
    det_is_one = np.isclose(np.linalg.det(A), 1, atol=tol)
    # Not orthogonal (AᵀA ≠ I)
    not_orthogonal = not np.allclose(A.T @ A, np.eye(len(A)), atol=tol)
    return det_is_one and not_orthogonal

# Test
shear = np.array([[1, 2], [0, 1]])
print(f"Is rotation: {is_rotation(shear)}")  # False
print(f"Is shear: {is_shear(shear)}")  # True
```

---

## Applications in Graphics and ML

### Image Transformations

```python
from scipy import ndimage

# Rotate image 45 degrees
rotated = ndimage.rotate(image, 45)

# Shear image
shear_matrix = np.array([[1, 0.5], [0, 1]])
sheared = ndimage.affine_transform(image, shear_matrix)

# Composition: multiple transformations
transform = create_scale(2) @ create_rotate(30) @ create_shear(0.5)
```

### Data Augmentation

```python
def random_augmentation():
    """
    Generate random transformation for data augmentation.
    """
    # Random rotation (-15° to +15°)
    angle = np.random.uniform(-15, 15) * np.pi/180
    R = np.array([[np.cos(angle), -np.sin(angle)],
                  [np.sin(angle),  np.cos(angle)]])

    # Random scaling (0.9 to 1.1)
    scale = np.random.uniform(0.9, 1.1)
    S = np.array([[scale, 0],
                  [0, scale]])

    # Random shear
    shear = np.random.uniform(-0.2, 0.2)
    Sh = np.array([[1, shear],
                   [0, 1]])

    # Compose: shear, then scale, then rotate
    return R @ S @ Sh

# Apply to dataset
for image in training_images:
    T = random_augmentation()
    augmented = apply_transform(image, T)
    augmented_images.append(augmented)
```

---

## Summary

**Shear Transformations**
- Horizontal: S = [[1, k], [0, 1]]
- Vertical: S = [[1, 0], [k, 1]]
- Preserves area (det = 1)
- Skews without rotating

**Projection Transformations**
- P = uuᵀ for unit vector u
- P² = P (idempotent)
- det(P) = 0 (singular)
- Loses information (not invertible)

**Composition**
- Order matters: AB ≠ BA
- Apply rightmost first
- Powerful for complex transformations

**Key Insights**
- Every transformation has geometric meaning
- Determinant reveals area/volume scaling
- Composition builds complex from simple
- Inverse reverses the transformation

---

**Related Topics:**
- [Basic Transformations](./transformations-basics.md) - Scaling, rotation, reflection
- [Matrix Inverse](./matrix-inverse-basics.md) - Reversing transformations
- [Eigenvalues](./eigenvalues-intro.md) - Understanding transformation directions
