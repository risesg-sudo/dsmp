# Matrix Concepts - Interview Questions (Coding)

## What You'll Learn
These coding questions test your ability to implement matrix concepts from scratch. They reveal your understanding of algorithms, edge cases, and numerical considerations. Perfect preparation for technical interviews where you need to code matrix operations.

---

## Question 1: Implement 2×2 Determinant and Inverse

**Q: Implement functions to compute 2×2 determinant and inverse without NumPy.**

### Solution

```python
def det_2x2(A):
    """
    Calculate determinant of 2×2 matrix.

    Args:
        A: 2×2 matrix as [[a, b], [c, d]]

    Returns:
        Determinant (ad - bc)
    """
    if len(A) != 2 or len(A[0]) != 2:
        raise ValueError("Matrix must be 2×2")

    return A[0][0] * A[1][1] - A[0][1] * A[1][0]


def inv_2x2(A):
    """
    Calculate inverse of 2×2 matrix.

    Args:
        A: 2×2 matrix as [[a, b], [c, d]]

    Returns:
        Inverse matrix A⁻¹

    Raises:
        ValueError: If matrix is singular (det ≈ 0)
    """
    det = det_2x2(A)

    if abs(det) < 1e-10:
        raise ValueError("Matrix is singular (det ≈ 0)")

    # Swap diagonal, negate off-diagonal, divide by det
    return [
        [ A[1][1]/det, -A[0][1]/det],
        [-A[1][0]/det,  A[0][0]/det]
    ]


# Test cases
def test_det_and_inv():
    # Test 1: Regular matrix
    A = [[4, 3],
         [2, 1]]

    det = det_2x2(A)
    assert abs(det - (-2)) < 1e-10, "Det should be -2"

    A_inv = inv_2x2(A)
    expected = [[-0.5, 1.5], [1.0, -2.0]]

    for i in range(2):
        for j in range(2):
            assert abs(A_inv[i][j] - expected[i][j]) < 1e-10

    print("✓ Test 1 passed: Regular matrix")

    # Test 2: Identity matrix
    I = [[1, 0],
         [0, 1]]

    det_I = det_2x2(I)
    assert abs(det_I - 1) < 1e-10

    I_inv = inv_2x2(I)
    assert I_inv == [[1, 0], [0, 1]]

    print("✓ Test 2 passed: Identity matrix")

    # Test 3: Singular matrix
    B = [[2, 4],
         [1, 2]]

    det_B = det_2x2(B)
    assert abs(det_B) < 1e-10, "Should be singular"

    try:
        inv_2x2(B)
        assert False, "Should raise ValueError"
    except ValueError:
        print("✓ Test 3 passed: Singular matrix detected")

    print("\nAll tests passed!")


# Run tests
test_det_and_inv()
```

### Key Points

```python
# Edge cases to handle:
1. Singular matrix (det = 0)
2. Near-singular (det ≈ 0)
3. Identity matrix
4. Negative determinant

# Formula recap:
#     ⎡ a  b ⎤
# A = ⎣ c  d ⎦
#
# det(A) = ad - bc
#
#        1    ⎡  d  -b ⎤
# A⁻¹ = ───   ⎣ -c   a ⎦
#       det

# Verification:
# AA⁻¹ should equal I
```

---

## Question 2: Check if Matrix is Invertible

**Q: Write a function to check if a matrix is invertible and explain why.**

### Solution

```python
def is_invertible(A, detailed=False):
    """
    Check if matrix is invertible.

    A matrix is invertible if:
    1. It's square (n×n)
    2. det(A) ≠ 0
    3. Rank equals size

    Args:
        A: Input matrix (list of lists)
        detailed: If True, return reason

    Returns:
        (bool, str) if detailed=True
        bool if detailed=False
    """
    import numpy as np

    A = np.array(A)
    m, n = A.shape

    # Check 1: Must be square
    if m != n:
        return (False, "Not square") if detailed else False

    # Check 2: Determinant must be non-zero
    det = np.linalg.det(A)
    if abs(det) < 1e-10:
        return (False, f"Singular (det = {det:.2e})") if detailed else False

    # Check 3: Must have full rank
    rank = np.linalg.matrix_rank(A)
    if rank < n:
        return (False, f"Rank deficient ({rank} < {n})") if detailed else False

    # Additional: Check condition number
    cond = np.linalg.cond(A)
    if cond > 1e10:
        warning = f"Warning: Ill-conditioned (cond = {cond:.2e})"
        return (True, warning) if detailed else True

    message = f"Invertible (det = {det:.4f}, cond = {cond:.2e})"
    return (True, message) if detailed else True


# Test cases
def test_is_invertible():
    # Test 1: Invertible matrix
    A = [[1, 2],
         [3, 4]]
    result, msg = is_invertible(A, detailed=True)
    print(f"Test 1: {msg}")
    assert result == True

    # Test 2: Singular matrix (zero det)
    B = [[2, 4],
         [1, 2]]
    result, msg = is_invertible(B, detailed=True)
    print(f"Test 2: {msg}")
    assert result == False

    # Test 3: Non-square matrix
    C = [[1, 2, 3],
         [4, 5, 6]]
    result, msg = is_invertible(C, detailed=True)
    print(f"Test 3: {msg}")
    assert result == False

    # Test 4: Rank deficient (3×3)
    D = [[1, 2, 3],
         [2, 4, 6],
         [3, 6, 9]]
    result, msg = is_invertible(D, detailed=True)
    print(f"Test 4: {msg}")
    assert result == False

    # Test 5: Ill-conditioned (invertible but unstable)
    E = [[1.0,    1.0   ],
         [1.0, 1.000001]]
    result, msg = is_invertible(E, detailed=True)
    print(f"Test 5: {msg}")
    # Still technically invertible, but with warning

    print("\n✓ All tests passed!")


test_is_invertible()
```

---

## Question 3: Apply Transformation to Points

**Q: Implement a function to apply a linear transformation to multiple points.**

### Solution

```python
import numpy as np


def transform_points(points, transformation):
    """
    Apply linear transformation to multiple points.

    Args:
        points: (n, d) array of d-dimensional points
        transformation: (d, d) transformation matrix

    Returns:
        (n, d) array of transformed points

    Examples:
        >>> points = [[1, 0], [0, 1], [1, 1]]
        >>> rotate_90 = [[0, -1], [1, 0]]
        >>> transform_points(points, rotate_90)
        [[0, 1], [-1, 0], [-1, 1]]
    """
    points = np.array(points)
    T = np.array(transformation)

    # Validate dimensions
    if points.shape[1] != T.shape[0]:
        raise ValueError(
            f"Dimension mismatch: points have {points.shape[1]} "
            f"dimensions but transform is {T.shape[0]}×{T.shape[1]}"
        )

    if T.shape[0] != T.shape[1]:
        raise ValueError("Transformation must be square")

    # Apply transformation: (n, d) @ (d, d)ᵀ = (n, d)
    # Each row is a point, so we use points @ T.T
    transformed = points @ T.T

    return transformed


def create_rotation(angle_degrees):
    """Create 2D rotation matrix."""
    theta = np.radians(angle_degrees)
    return np.array([[np.cos(theta), -np.sin(theta)],
                     [np.sin(theta),  np.cos(theta)]])


def create_scale(sx, sy):
    """Create 2D scaling matrix."""
    return np.array([[sx, 0],
                     [0, sy]])


# Test and examples
def test_transform_points():
    # Test 1: Rotate square 90° counter-clockwise
    square = np.array([
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1]
    ])

    rotation_90 = create_rotation(90)
    rotated = transform_points(square, rotation_90)

    expected = np.array([
        [ 0,  0],
        [ 0,  1],
        [-1,  1],
        [-1,  0]
    ])

    assert np.allclose(rotated, expected, atol=1e-10)
    print("✓ Test 1 passed: 90° rotation")

    # Test 2: Scale rectangle
    rect = np.array([
        [0, 0],
        [2, 0],
        [2, 1],
        [0, 1]
    ])

    scale = create_scale(0.5, 2)  # Shrink x, stretch y
    scaled = transform_points(rect, scale)

    expected = np.array([
        [0, 0],
        [1, 0],
        [1, 2],
        [0, 2]
    ])

    assert np.allclose(scaled, expected)
    print("✓ Test 2 passed: Scaling")

    # Test 3: Compose transformations
    # Scale then rotate
    points = np.array([[1, 0]])

    S = create_scale(2, 2)
    R = create_rotation(45)

    # Method 1: Apply separately
    step1 = transform_points(points, S)
    result1 = transform_points(step1, R)

    # Method 2: Compose then apply
    T_composed = R @ S
    result2 = transform_points(points, T_composed)

    assert np.allclose(result1, result2)
    print("✓ Test 3 passed: Composition")

    print("\nAll tests passed!")


test_transform_points()
```

---

## Question 4: Detect Multicollinearity

**Q: Implement a function to detect multicollinearity in a feature matrix.**

### Solution

```python
import numpy as np


def detect_multicollinearity(X, threshold=0.1, corr_threshold=0.95):
    """
    Detect multicollinearity in feature matrix.

    Args:
        X: Feature matrix (n_samples, n_features)
        threshold: Determinant threshold for correlation matrix
        corr_threshold: Threshold for pairwise correlations

    Returns:
        dict with:
        - is_multicollinear: bool
        - determinant: det of correlation matrix
        - rank: matrix rank
        - high_correlations: list of highly correlated pairs
        - recommendations: list of suggested actions
    """
    n_samples, n_features = X.shape

    # Standardize features (zero mean, unit variance)
    X_std = (X - np.mean(X, axis=0)) / (np.std(X, axis=0) + 1e-10)

    # Compute correlation matrix
    corr = np.corrcoef(X_std.T)

    # Check determinant of correlation matrix
    det_corr = np.linalg.det(corr)

    # Check rank
    rank = np.linalg.matrix_rank(X)

    # Find highly correlated pairs
    high_correlations = []
    for i in range(n_features):
        for j in range(i+1, n_features):
            if abs(corr[i, j]) > corr_threshold:
                high_correlations.append({
                    'feature1': i,
                    'feature2': j,
                    'correlation': corr[i, j]
                })

    # Determine if multicollinear
    is_multicollinear = (
        det_corr < threshold or
        rank < n_features or
        len(high_correlations) > 0
    )

    # Generate recommendations
    recommendations = []
    if det_corr < threshold:
        recommendations.append(
            f"Low determinant ({det_corr:.2e}): Features are nearly dependent"
        )

    if rank < n_features:
        recommendations.append(
            f"Rank deficient: Remove {n_features - rank} redundant features"
        )

    if high_correlations:
        recommendations.append(
            f"Found {len(high_correlations)} highly correlated pairs"
        )
        recommendations.append(
            "Consider: PCA, feature selection, or Ridge regression"
        )

    results = {
        'is_multicollinear': is_multicollinear,
        'determinant': det_corr,
        'rank': rank,
        'condition_number': np.linalg.cond(X),
        'high_correlations': high_correlations,
        'recommendations': recommendations
    }

    return results


def print_multicollinearity_report(results):
    """Pretty print multicollinearity results."""
    print("=" * 60)
    print("MULTICOLLINEARITY ANALYSIS")
    print("=" * 60)

    status = "DETECTED" if results['is_multicollinear'] else "NOT DETECTED"
    print(f"\nStatus: {status}")

    print(f"\nDiagnostics:")
    print(f"  Correlation det: {results['determinant']:.6f}")
    print(f"  Matrix rank: {results['rank']}")
    print(f"  Condition number: {results['condition_number']:.2e}")

    if results['high_correlations']:
        print(f"\nHighly Correlated Pairs:")
        for pair in results['high_correlations']:
            print(f"  Features {pair['feature1']} and {pair['feature2']}: "
                  f"r = {pair['correlation']:.3f}")

    if results['recommendations']:
        print(f"\nRecommendations:")
        for rec in results['recommendations']:
            print(f"  • {rec}")

    print("=" * 60)


# Test cases
def test_multicollinearity():
    # Test 1: No multicollinearity
    print("Test 1: Independent features")
    X = np.random.randn(100, 5)
    results = detect_multicollinearity(X)
    print_multicollinearity_report(results)

    # Test 2: Perfect multicollinearity
    print("\n\nTest 2: Perfect multicollinearity")
    X = np.array([
        [1, 2, 2.0],   # Feature 3 = Feature 2
        [2, 4, 4.0],
        [3, 6, 6.0],
        [4, 8, 8.0]
    ])
    results = detect_multicollinearity(X)
    print_multicollinearity_report(results)

    # Test 3: High correlation
    print("\n\nTest 3: High correlation")
    np.random.seed(42)
    X1 = np.random.randn(50, 1)
    X2 = X1 + np.random.randn(50, 1) * 0.1  # Highly correlated with X1
    X3 = np.random.randn(50, 1)
    X = np.hstack([X1, X2, X3])

    results = detect_multicollinearity(X)
    print_multicollinearity_report(results)


test_multicollinearity()
```

---

## Summary

**Key Implementation Skills**:

1. **2×2 Determinant & Inverse**
   - Simple formula: ad - bc
   - Swap diagonal, negate off-diagonal
   - Always check for singularity

2. **Invertibility Check**
   - Square matrix
   - Non-zero determinant
   - Full rank
   - Consider condition number

3. **Transformation Application**
   - Matrix-vector multiplication
   - Batch processing with @ operator
   - Dimension validation

4. **Multicollinearity Detection**
   - Correlation matrix determinant
   - Pairwise correlations
   - Rank checking
   - Actionable recommendations

**Best Practices**:

```python
# Always validate inputs
assert A.shape[0] == A.shape[1], "Must be square"

# Check for numerical issues
if abs(det) < 1e-10:
    raise ValueError("Singular matrix")

# Use appropriate thresholds
TOL = 1e-10  # For zero comparisons
CORR_THRESHOLD = 0.95  # For high correlation

# Provide helpful error messages
raise ValueError(
    f"Dimension mismatch: got {m}×{n}, expected square"
)
```

---

**Related Topics:**
- [Conceptual Interview Questions](./matrices-interview-conceptual.md)
- [Matrix Inverse](./matrix-inverse-basics.md)
- [Determinants](./determinant-basics.md)
- [Rank and Singularity](./rank-singularity.md)
