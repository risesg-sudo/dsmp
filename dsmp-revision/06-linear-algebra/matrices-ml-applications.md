# Matrices in Machine Learning Applications

## What You'll Learn
This is where linear algebra comes alive in machine learning. You'll discover how matrices power linear regression, transform images, detect multicollinearity, and optimize neural networks. Understanding these applications transforms abstract math into practical problem-solving tools.

---

## Solving Linear Systems - Normal Equation

The normal equation is the closed-form solution to linear regression. It's beautiful, but comes with important caveats.

### The Problem

Find weights θ that minimize error in linear regression:

```
Given: X (features), y (targets)
Want: θ such that Xθ ≈ y

Minimize: ||Xθ - y||²
```

### The Normal Equation

```
θ = (XᵀX)⁻¹Xᵀy

Requirements:
- XᵀX must be invertible
- rank(X) = n (full column rank)
- No multicollinearity
```

### Complete Example

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

# Normal equation: θ = (XᵀX)⁻¹Xᵀy
XtX = X.T @ X
print("XᵀX =")
print(XtX)
# [[4, 10],
#  [10, 30]]

Xty = X.T @ y
print("Xᵀy =")
print(Xty)
# [[24],
#  [70]]

# Check if invertible
det_XtX = np.linalg.det(XtX)
print(f"det(XᵀX) = {det_XtX}")  # 20 ≠ 0, invertible ✓

# Solve
theta = np.linalg.inv(XtX) @ Xty
print(f"θ = {theta.flatten()}")  # [1, 2]

print(f"Fitted line: y = {theta[1][0]}x + {theta[0][0]}")
# y = 2x + 1 ✓
```

### When Normal Equation Fails

```python
# Multicollinear features (column 3 = 2 × column 2)
X = np.array([
    [1, 2, 4],   # bias, feature1, feature2
    [1, 3, 6],
    [1, 4, 8]
])

XtX = X.T @ X
det_XtX = np.linalg.det(XtX)
print(f"det(XᵀX) = {det_XtX}")  # ≈ 0 (numerically singular!)

# Cannot invert! What to do?

# Solution 1: Ridge regression (add λI)
lambda_reg = 0.1
theta_ridge = np.linalg.inv(XtX + lambda_reg * np.eye(3)) @ Xty

# Solution 2: Remove redundant features
X_reduced = X[:, [0, 1]]  # Keep only bias and feature1

# Solution 3: Use gradient descent instead
# Doesn't require matrix inverse!
```

### Normal Equation vs Gradient Descent

```python
# Normal Equation
# Pros: Exact solution, one step
# Cons: O(n³) for inverse, fails with multicollinearity

# Gradient Descent
# Pros: Works with large n, handles singularity
# Cons: Requires tuning, iterative, approximate

# Use normal equation when:
# - n < 10,000 features
# - No multicollinearity
# - Need exact solution

# Use gradient descent when:
# - n > 10,000 features
# - Near-singular XᵀX
# - Online learning
```

---

## Image Transformations

Matrices transform images through rotations, scaling, and shearing.

### Rotation

```python
from scipy import ndimage
import numpy as np
import matplotlib.pyplot as plt

# Load image (grayscale)
image = np.random.randn(100, 100)  # Placeholder

# Rotation matrix (45 degrees)
angle = 45
theta = np.radians(angle)
rotation_matrix = np.array([
    [np.cos(theta), -np.sin(theta)],
    [np.sin(theta),  np.cos(theta)]
])

# Apply rotation
rotated_image = ndimage.rotate(image, angle, reshape=False)

# For manual application to coordinates
def rotate_coordinates(coords, angle):
    """Rotate list of [x, y] coordinates."""
    theta = np.radians(angle)
    R = np.array([[np.cos(theta), -np.sin(theta)],
                  [np.sin(theta),  np.cos(theta)]])

    return (R @ coords.T).T

# Example
corners = np.array([[0, 0], [100, 0], [100, 100], [0, 100]])
rotated_corners = rotate_coordinates(corners, 45)
```

### Scaling (Zoom)

```python
# Scaling matrix
scale_factor = 2
scale_matrix = np.array([
    [scale_factor, 0],
    [0, scale_factor]
])

# Apply to image (2x zoom)
from scipy.ndimage import zoom
zoomed = zoom(image, scale_factor)

# Non-uniform scaling
scale_x, scale_y = 2, 0.5
scaled = zoom(image, (scale_y, scale_x))
```

### Data Augmentation for Deep Learning

```python
def random_transform_image(image):
    """
    Apply random transformations for data augmentation.
    """
    # Random rotation (-15 to +15 degrees)
    angle = np.random.uniform(-15, 15)

    # Random scaling (0.9 to 1.1)
    scale = np.random.uniform(0.9, 1.1)

    # Random shear
    shear = np.random.uniform(-0.2, 0.2)

    # Compose transformations
    # Note: Using affine transformation matrices

    # Rotation
    theta = np.radians(angle)
    R = np.array([[np.cos(theta), -np.sin(theta)],
                  [np.sin(theta),  np.cos(theta)]])

    # Scaling
    S = np.array([[scale, 0],
                  [0, scale]])

    # Shear
    Sh = np.array([[1, shear],
                   [0, 1]])

    # Combined: R @ S @ Sh
    transform = R @ S @ Sh

    # Apply to image
    transformed = ndimage.affine_transform(
        image,
        transform,
        output_shape=image.shape
    )

    return transformed

# Augment training data
augmented_images = []
for img in training_images:
    for _ in range(5):  # 5 variants each
        aug_img = random_transform_image(img)
        augmented_images.append(aug_img)
```

---

## Determinant for Volume and Confidence

### Confidence Ellipsoids

```python
# Covariance matrix determines confidence region shape
cov = np.array([
    [2.0, 0.5],
    [0.5, 1.0]
])

# Volume of confidence ellipse ∝ √det(cov)
volume_scale = np.sqrt(np.linalg.det(cov))
print(f"Volume scale: {volume_scale:.3f}")  # 1.323

# Larger determinant = more spread out distribution
# Smaller determinant = more concentrated distribution

# Eigenvalues give axis lengths
eigenvalues, eigenvectors = np.linalg.eig(cov)
print(f"Axis lengths: {np.sqrt(eigenvalues)}")

# For multivariate normal:
# Volume ∝ det(Σ)^(1/2)
# This is why we care about determinant!
```

---

## Checking Multicollinearity

### Variance Inflation Factor (VIF)

```python
def check_multicollinearity(X, threshold=0.1):
    """
    Detect multicollinearity in feature matrix.

    Args:
        X: Feature matrix (n_samples, n_features)
        threshold: Determinant threshold

    Returns:
        Dictionary with diagnostics
    """
    # Standardize features
    X_std = (X - np.mean(X, axis=0)) / np.std(X, axis=0)

    # Compute correlation matrix
    corr = np.corrcoef(X_std.T)

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
            if abs(corr[i, j]) > 0.9:  # High correlation
                results['high_correlations'].append({
                    'feature1': i,
                    'feature2': j,
                    'correlation': corr[i, j]
                })

    return results

# Test with multicollinear data
X = np.array([
    [1, 2, 2.1],   # feature3 ≈ feature2
    [2, 4, 4.2],
    [3, 6, 5.9]
])

result = check_multicollinearity(X)
print(f"Multicollinear: {result['is_multicollinear']}")
print(f"Determinant: {result['determinant']:.6f}")
print(f"High correlations: {result['high_correlations']}")

# If multicollinear:
# 1. Remove redundant features
# 2. Use PCA to combine features
# 3. Use Ridge/Lasso regression
# 4. Use gradient descent (doesn't require inverse)
```

---

## Matrix Inversion in Optimization

### Newton's Method

Newton's method for optimization uses the Hessian inverse:

```
x_new = x_old - H⁻¹∇f(x)

Where:
- H: Hessian matrix (2nd derivatives)
- ∇f: Gradient vector

Requires H to be invertible!
```

### Implementation

```python
def newtons_method(f, grad_f, hess_f, x0, tol=1e-6, max_iter=100):
    """
    Newton's method for optimization.

    Args:
        f: Objective function
        grad_f: Gradient function
        hess_f: Hessian function
        x0: Initial point
        tol: Convergence tolerance
        max_iter: Maximum iterations

    Returns:
        Optimal point
    """
    x = x0.copy()

    for i in range(max_iter):
        g = grad_f(x)
        H = hess_f(x)

        # Check if Hessian is invertible
        if np.abs(np.linalg.det(H)) < 1e-10:
            print(f"Warning: Singular Hessian at iteration {i}")
            break

        # Newton update: x_new = x - H⁻¹g
        # Better: solve Hδ = g, then x_new = x - δ
        delta = np.linalg.solve(H, g)
        x_new = x - delta

        # Check convergence
        if np.linalg.norm(delta) < tol:
            print(f"Converged in {i+1} iterations")
            break

        x = x_new

    return x

# Example: Minimize f(x) = x₁² + 2x₂²
def f(x):
    return x[0]**2 + 2*x[1]**2

def grad_f(x):
    return np.array([2*x[0], 4*x[1]])

def hess_f(x):
    return np.array([[2, 0],
                     [0, 4]])

x0 = np.array([5.0, 5.0])
x_opt = newtons_method(f, grad_f, hess_f, x0)
print(f"Optimal point: {x_opt}")  # Should be [0, 0]
```

### When Newton's Method Fails

```python
# Singular Hessian example
def bad_hess_f(x):
    # Singular Hessian (det = 0)
    return np.array([[1, 1],
                     [1, 1]])

# This will fail!
# Solutions:
# 1. Add regularization: H + λI
# 2. Use pseudo-inverse
# 3. Switch to gradient descent
# 4. Use L-BFGS (approximates H⁻¹)
```

---

## Summary

**Normal Equation**
- θ = (XᵀX)⁻¹Xᵀy for linear regression
- Requires XᵀX invertible (no multicollinearity)
- Fast for small problems (n < 10,000)
- Use gradient descent for large problems

**Image Transformations**
- Rotation: R_θ matrix
- Scaling: S diagonal matrix
- Composition for data augmentation
- Essential for computer vision

**Determinant Applications**
- Volume of confidence regions
- Multicollinearity detection
- Matrix condition checking

**Optimization**
- Newton's method uses H⁻¹
- Requires invertible Hessian
- Fast convergence when applicable
- Fallback to gradient methods

**Best Practices**
```python
# Always check before inverting
if np.abs(np.linalg.det(A)) < 1e-10:
    # Use regularization or alternative method
    pass

# Prefer solve over inv
x = np.linalg.solve(A, b)  # Good
x = np.linalg.inv(A) @ b   # Wasteful

# Monitor condition number
if np.linalg.cond(A) > 1e6:
    # Matrix is ill-conditioned
    # Consider regularization
    pass
```

---

**Related Topics:**
- [Matrix Inverse](./matrix-inverse-basics.md) - Computing and using inverses
- [Determinants](./determinant-basics.md) - Testing invertibility
- [Transformations](./transformations-basics.md) - Geometric interpretation
- [PCA](./pca-basics.md) - Dimensionality reduction
