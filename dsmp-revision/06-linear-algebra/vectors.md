# Vectors - Linear Algebra Fundamentals

## Table of Contents
1. [What is a Vector?](#what-is-a-vector)
2. [Vector Operations](#vector-operations)
3. [Dot Product](#dot-product)
4. [Angle Between Vectors](#angle-between-vectors)
5. [ML Applications](#ml-applications)
6. [Interview Questions](#interview-questions)

---

## What is a Vector?

### Geometric Intuition
A vector is both:
- **Geometrically**: An arrow with magnitude (length) and direction
- **Algebraically**: An ordered list of numbers

```
2D Vector Visualization:

        y
        |
        |   v = [3, 2]
        |  /
        | /
        |/_________ x
       O

Vector v starts at origin O and points to (3, 2)
- Magnitude: length of arrow
- Direction: angle from x-axis
```

### Mathematical Representation
```
2D Vector: v = [v₁, v₂] = [3, 2]
3D Vector: v = [v₁, v₂, v₃] = [1, 2, 3]
nD Vector: v = [v₁, v₂, ..., vₙ]
```

### Why Vectors Matter in ML
- **Data points** are vectors (features = dimensions)
- **Model weights** are vectors
- **Embeddings** (word2vec, image features) are high-dimensional vectors

**Example**: A house with [1200 sq ft, 3 bedrooms, 2 baths] is a 3D vector

---

## Vector Operations

### 1. Vector Addition

**Geometric Intuition**: Place tail of second vector at head of first

```
Vector Addition:
        v + w

    w = [1, 3]
    |  /
    | /
    |/_____ v = [2, 1]

Result: v + w = [2+1, 1+3] = [3, 4]

Visual:
        y
        |    * (3, 4)
        |   /|
        |  / |
        | /  |
        |/___|_____ x
```

**Algebraic**:
```
v = [v₁, v₂, ..., vₙ]
w = [w₁, w₂, ..., wₙ]
v + w = [v₁+w₁, v₂+w₂, ..., vₙ+wₙ]
```

**Step-by-step Example**:
```python
v = [2, 3, -1]
w = [1, -2, 4]

v + w = [2+1, 3+(-2), -1+4]
      = [3, 1, 3]
```

**ML Application**: Adding gradients during backpropagation
```python
import numpy as np
gradient_batch1 = np.array([0.5, -0.2, 0.3])
gradient_batch2 = np.array([0.3, 0.1, -0.4])
total_gradient = gradient_batch1 + gradient_batch2
# Result: [0.8, -0.1, -0.1]
```

---

### 2. Scalar Multiplication

**Geometric Intuition**: Stretches or shrinks the vector

```
Scalar Multiplication:

Original: v = [2, 1]

2v = [4, 2]  (doubled length, same direction)
        |    /
        |   /
        |  /
        | /____

-0.5v = [-1, -0.5]  (half length, opposite direction)
            \
             \
        ______|
```

**Algebraic**:
```
c · v = c · [v₁, v₂, ..., vₙ]
      = [c·v₁, c·v₂, ..., c·vₙ]
```

**Step-by-step Example**:
```python
v = [3, -2, 1]
c = 2.5

c·v = 2.5 × [3, -2, 1]
    = [2.5×3, 2.5×(-2), 2.5×1]
    = [7.5, -5, 2.5]
```

**ML Application**: Learning rate in gradient descent
```python
weights = np.array([1.0, 0.5, -0.3])
learning_rate = 0.01
gradient = np.array([2.0, -1.5, 0.8])

# Update weights
weights = weights - learning_rate * gradient
# weights = [1.0, 0.5, -0.3] - [0.02, -0.015, 0.008]
# weights = [0.98, 0.515, -0.308]
```

---

### 3. Vector Subtraction

**Geometric Intuition**: Vector from tip of w to tip of v

```
Vector Subtraction: v - w

        v
       /|
      / |  v - w
     /  | /
    w   |/

v - w points from the tip of w to tip of v
```

**Algebraic**:
```
v - w = v + (-w)
      = [v₁-w₁, v₂-w₂, ..., vₙ-wₙ]
```

**ML Application**: Computing prediction error
```python
y_true = np.array([1.0, 0.0, 1.0])  # actual labels
y_pred = np.array([0.8, 0.2, 0.9])  # predicted labels
error = y_true - y_pred
# error = [0.2, -0.2, 0.1]
```

---

### 4. Vector Magnitude (Norm)

**Geometric Intuition**: Length of the vector

```
Magnitude visualization:

        |  / v = [3, 4]
        | /
        |/)θ____
       O

||v|| = √(3² + 4²) = √25 = 5
```

**Formulas**:
```
L2 Norm (Euclidean): ||v|| = √(v₁² + v₂² + ... + vₙ²)
L1 Norm (Manhattan): ||v||₁ = |v₁| + |v₂| + ... + |vₙ|
```

**Step-by-step Example**:
```python
v = [3, -4, 0]

# L2 Norm
||v||₂ = √(3² + (-4)² + 0²)
       = √(9 + 16 + 0)
       = √25
       = 5

# L1 Norm
||v||₁ = |3| + |-4| + |0|
       = 3 + 4 + 0
       = 7
```

**ML Application**: Regularization (L1 and L2)
```python
# L2 Regularization (Ridge)
weights = np.array([0.5, -1.2, 0.8])
l2_penalty = 0.01 * np.sum(weights**2)
# l2_penalty = 0.01 * (0.25 + 1.44 + 0.64) = 0.0233

# L1 Regularization (Lasso)
l1_penalty = 0.01 * np.sum(np.abs(weights))
# l1_penalty = 0.01 * (0.5 + 1.2 + 0.8) = 0.025
```

---

### 5. Unit Vector (Normalization)

**Geometric Intuition**: Vector with length 1 in same direction

```
Normalization:

    v = [3, 4]          v̂ = [0.6, 0.8]
    ||v|| = 5           ||v̂|| = 1

    |  /                 |  /
    | /      →          | /
    |/                  |/

    Same direction, unit length
```

**Formula**:
```
v̂ = v / ||v||
```

**Step-by-step Example**:
```python
v = [3, 4]

# Step 1: Calculate magnitude
||v|| = √(3² + 4²) = 5

# Step 2: Divide by magnitude
v̂ = v / ||v||
  = [3, 4] / 5
  = [3/5, 4/5]
  = [0.6, 0.8]

# Verify: ||v̂|| = √(0.6² + 0.8²) = √(0.36 + 0.64) = 1 ✓
```

**ML Application**: Feature normalization
```python
# Normalize features to unit length
feature_vector = np.array([120, 3, 2000])  # [sqft, bedrooms, price]
norm = np.linalg.norm(feature_vector)
normalized = feature_vector / norm
# Each sample becomes unit length, preserving direction
```

---

## Dot Product

### Geometric Intuition

The dot product measures "how much two vectors go in the same direction"

```
Dot Product Visualization:

Same direction (θ = 0°):
    v →  →  w
    v·w = ||v|| ||w|| cos(0°) = ||v|| ||w|| (maximum)

Perpendicular (θ = 90°):
    v →
        |
        ↓ w
    v·w = ||v|| ||w|| cos(90°) = 0

Opposite direction (θ = 180°):
    v →  ← w
    v·w = ||v|| ||w|| cos(180°) = -||v|| ||w|| (minimum)
```

### Mathematical Definition

**Algebraic Formula**:
```
v · w = v₁w₁ + v₂w₂ + ... + vₙwₙ
```

**Geometric Formula**:
```
v · w = ||v|| ||w|| cos(θ)

where θ is angle between vectors
```

### Step-by-step Calculation

**Example 1: 2D Vectors**
```python
v = [3, 4]
w = [2, -1]

# Algebraic method
v · w = (3)(2) + (4)(-1)
      = 6 + (-4)
      = 2

# Geometric verification
||v|| = √(3² + 4²) = 5
||w|| = √(2² + (-1)²) = √5

v·w = ||v|| ||w|| cos(θ)
2 = 5 × √5 × cos(θ)
cos(θ) = 2 / (5√5) ≈ 0.179
θ ≈ 79.7°
```

**Example 2: 3D Vectors**
```python
v = [1, 2, 3]
w = [4, -5, 6]

v · w = (1)(4) + (2)(-5) + (3)(6)
      = 4 - 10 + 18
      = 12
```

### Properties of Dot Product

1. **Commutative**: v · w = w · v
2. **Distributive**: u · (v + w) = u·v + u·w
3. **Scalar multiplication**: (cv) · w = c(v·w)
4. **Self dot product**: v · v = ||v||²

```python
# Verification
v = [2, 3]

# v · v = ||v||²
v_dot_v = 2² + 3² = 13
norm_squared = (√13)² = 13  ✓
```

---

## Angle Between Vectors

### Formula
```
cos(θ) = (v · w) / (||v|| ||w||)

θ = arccos[(v · w) / (||v|| ||w||)]
```

### Complete Step-by-step Example

**Problem**: Find angle between v = [3, 4] and w = [4, 3]

```python
# Step 1: Calculate dot product
v · w = (3)(4) + (4)(3) = 12 + 12 = 24

# Step 2: Calculate magnitudes
||v|| = √(3² + 4²) = √25 = 5
||w|| = √(4² + 3²) = √25 = 5

# Step 3: Calculate cosine
cos(θ) = 24 / (5 × 5) = 24/25 = 0.96

# Step 4: Calculate angle
θ = arccos(0.96) ≈ 16.26°

# Interpretation: Vectors are nearly aligned (small angle)
```

### Special Cases

```
1. θ = 0° (parallel, same direction)
   cos(0°) = 1
   v · w = ||v|| ||w||

2. θ = 90° (perpendicular/orthogonal)
   cos(90°) = 0
   v · w = 0

3. θ = 180° (parallel, opposite direction)
   cos(180°) = -1
   v · w = -||v|| ||w||
```

**Example - Checking orthogonality**:
```python
v = [3, -2]
w = [2, 3]

v · w = (3)(2) + (-2)(3) = 6 - 6 = 0

Since v·w = 0, vectors are perpendicular ✓
```

---

## ML Applications

### 1. Cosine Similarity (Recommendation Systems)

**Intuition**: Measure similarity between items based on angle, not magnitude

```
Cosine Similarity = cos(θ) = (v · w) / (||v|| ||w||)

Range: [-1, 1]
  1: Identical direction (very similar)
  0: Perpendicular (unrelated)
 -1: Opposite direction (dissimilar)
```

**Complete Example**:
```python
import numpy as np

# User rating vectors (5 movies)
user1 = np.array([5, 4, 0, 0, 1])  # likes action
user2 = np.array([5, 5, 0, 0, 2])  # likes action
user3 = np.array([0, 0, 5, 4, 0])  # likes romance

def cosine_similarity(v, w):
    dot_product = np.dot(v, w)
    norm_v = np.linalg.norm(v)
    norm_w = np.linalg.norm(w)
    return dot_product / (norm_v * norm_w)

# User 1 vs User 2
sim_1_2 = cosine_similarity(user1, user2)
# dot: 25+20+0+0+2=47, ||u1||≈6.48, ||u2||≈7.35
# sim ≈ 0.99 (very similar!)

# User 1 vs User 3
sim_1_3 = cosine_similarity(user1, user3)
# dot: 0+0+0+0+0=0
# sim = 0 (completely different tastes)
```

---

### 2. Text Similarity (NLP)

**Example**: Document comparison using TF-IDF vectors

```python
# Documents represented as word frequency vectors
# Features: [machine, learning, python, java, web]

doc1 = [5, 4, 3, 0, 0]  # ML article
doc2 = [4, 3, 2, 0, 0]  # ML article
doc3 = [0, 0, 1, 5, 4]  # Web dev article

similarity_1_2 = cosine_similarity(doc1, doc2)
# High similarity (both about ML)

similarity_1_3 = cosine_similarity(doc1, doc3)
# Low similarity (different topics)
```

---

### 3. Distance Metrics

**Euclidean Distance** (L2):
```python
# How far apart are two points?
def euclidean_distance(v, w):
    return np.linalg.norm(v - w)

# KNN classification
point1 = np.array([1.0, 2.0])
point2 = np.array([4.0, 6.0])
distance = euclidean_distance(point1, point2)
# √((4-1)² + (6-2)²) = √(9+16) = 5
```

**Manhattan Distance** (L1):
```python
# Sum of absolute differences
def manhattan_distance(v, w):
    return np.sum(np.abs(v - w))

distance = manhattan_distance(point1, point2)
# |4-1| + |6-2| = 3 + 4 = 7
```

---

### 4. Projection (Feature Extraction)

**Intuition**: Project vector onto direction to get component

```
Projection of v onto w:

    v
    |\
    | \
    |  \
    |___\ proj_w(v)
       w

proj_w(v) = [(v · w) / ||w||²] × w
```

**Example**: PCA preprocessing
```python
v = np.array([3, 4])
w = np.array([1, 0])  # x-axis

# Scalar projection
scalar_proj = np.dot(v, w) / np.linalg.norm(w)
# = 3 / 1 = 3

# Vector projection
vector_proj = (np.dot(v, w) / np.dot(w, w)) * w
# = (3 / 1) * [1, 0] = [3, 0]

# This gives the x-component of v
```

---

### 5. Neural Network Forward Pass

**Dot product computes neuron activation**:

```
Input layer:     x = [x₁, x₂, x₃]
Weights:         w = [w₁, w₂, w₃]
Bias:            b

Neuron output = w·x + b = w₁x₁ + w₂x₂ + w₃x₃ + b
```

**Example**:
```python
# Simple neuron
x = np.array([0.5, 0.3, 0.8])  # inputs
w = np.array([0.2, -0.5, 0.7])  # weights
b = 0.1  # bias

z = np.dot(w, x) + b
# z = (0.2)(0.5) + (-0.5)(0.3) + (0.7)(0.8) + 0.1
# z = 0.1 - 0.15 + 0.56 + 0.1 = 0.61

activation = 1 / (1 + np.exp(-z))  # sigmoid
# activation ≈ 0.648
```

---

## Interview Questions

### Conceptual Questions

**Q1: What's the difference between L1 and L2 norms?**
```
L2 (Euclidean): √(x₁² + x₂² + ... + xₙ²)
- Sensitive to outliers (squares large values)
- Smooth gradient everywhere
- Used in Ridge regression

L1 (Manhattan): |x₁| + |x₂| + ... + |xₙ|
- Robust to outliers
- Non-smooth at zero (absolute value)
- Induces sparsity (can make weights exactly 0)
- Used in Lasso regression

Example: v = [3, 4]
L2 = √25 = 5
L1 = 7
```

**Q2: When is dot product zero?**
```
v·w = 0 when vectors are orthogonal (perpendicular)

Geometric meaning: No component of one vector in direction of other

ML significance:
- Orthogonal features are uncorrelated
- Independent components in PCA
- Orthogonal weight vectors in neural networks
```

**Q3: Why use cosine similarity instead of dot product?**
```
Dot Product: v·w = ||v|| ||w|| cos(θ)
- Depends on magnitude
- Longer vectors have larger dot products

Cosine Similarity: cos(θ) = (v·w)/(||v|| ||w||)
- Independent of magnitude
- Only measures angle/direction
- Normalized to [-1, 1]

Use case: Document similarity
- Long documents vs short documents
- Cosine captures topic similarity regardless of length
```

---

### Coding Questions

**Q4: Implement cosine similarity from scratch**
```python
def cosine_similarity(v, w):
    """
    Calculate cosine similarity between two vectors.

    Args:
        v, w: numpy arrays or lists

    Returns:
        float: similarity in range [-1, 1]
    """
    import numpy as np

    # Convert to numpy arrays
    v = np.array(v)
    w = np.array(w)

    # Calculate dot product
    dot_product = np.dot(v, w)

    # Calculate magnitudes
    norm_v = np.sqrt(np.sum(v**2))
    norm_w = np.sqrt(np.sum(w**2))

    # Handle zero vectors
    if norm_v == 0 or norm_w == 0:
        return 0.0

    # Calculate similarity
    similarity = dot_product / (norm_v * norm_w)

    return similarity

# Test
v = [1, 2, 3]
w = [2, 4, 6]  # Same direction
print(cosine_similarity(v, w))  # Should be 1.0
```

**Q5: Find k-nearest neighbors using Euclidean distance**
```python
def k_nearest_neighbors(query, data, k=3):
    """
    Find k nearest neighbors to query point.

    Args:
        query: query point (numpy array)
        data: array of data points
        k: number of neighbors

    Returns:
        indices of k nearest neighbors
    """
    import numpy as np

    # Calculate distances to all points
    distances = []
    for i, point in enumerate(data):
        dist = np.linalg.norm(query - point)
        distances.append((i, dist))

    # Sort by distance
    distances.sort(key=lambda x: x[1])

    # Return k nearest indices
    return [idx for idx, _ in distances[:k]]

# Test
query = np.array([5, 5])
data = np.array([
    [1, 1],
    [2, 2],
    [6, 6],
    [7, 7],
    [1, 8]
])

neighbors = k_nearest_neighbors(query, data, k=2)
print(f"Nearest neighbors: {neighbors}")  # Indices of closest points
```

**Q6: Normalize features to unit length**
```python
def normalize_features(X):
    """
    Normalize each row to unit length (L2 normalization).

    Args:
        X: 2D numpy array (samples × features)

    Returns:
        Normalized array
    """
    import numpy as np

    # Calculate L2 norm for each row
    norms = np.linalg.norm(X, axis=1, keepdims=True)

    # Avoid division by zero
    norms[norms == 0] = 1

    # Normalize
    X_normalized = X / norms

    return X_normalized

# Test
X = np.array([
    [3, 4],
    [1, 0],
    [5, 12]
])

X_norm = normalize_features(X)
print(X_norm)
# Each row should have norm = 1
print(np.linalg.norm(X_norm, axis=1))  # [1., 1., 1.]
```

---

### Mathematical Questions

**Q7: Prove that cos(θ) = (v·w)/(||v|| ||w||)**
```
Law of Cosines approach:

Given triangle formed by vectors v, w, and (v-w):
||v - w||² = ||v||² + ||w||² - 2||v|| ||w|| cos(θ)

Expand left side:
||v - w||² = (v-w)·(v-w)
           = v·v - v·w - w·v + w·w
           = ||v||² - 2(v·w) + ||w||²

Equate:
||v||² - 2(v·w) + ||w||² = ||v||² + ||w||² - 2||v|| ||w|| cos(θ)

Simplify:
-2(v·w) = -2||v|| ||w|| cos(θ)

Therefore:
v·w = ||v|| ||w|| cos(θ)
cos(θ) = (v·w) / (||v|| ||w||)
```

**Q8: When is ||v + w|| = ||v|| + ||w||?**
```
Triangle inequality: ||v + w|| ≤ ||v|| + ||w||

Equality holds when vectors are parallel and in same direction

Proof:
||v + w||² = (v+w)·(v+w)
           = v·v + 2v·w + w·w
           = ||v||² + 2v·w + ||w||²

For equality:
||v + w||² = (||v|| + ||w||)²
||v||² + 2v·w + ||w||² = ||v||² + 2||v|| ||w|| + ||w||²

This requires:
v·w = ||v|| ||w||

Which means cos(θ) = 1, so θ = 0° (parallel, same direction)
```

---

## Quick Reference

### Vector Operations Cheat Sheet
```python
import numpy as np

v = np.array([1, 2, 3])
w = np.array([4, 5, 6])

# Basic operations
addition = v + w
subtraction = v - w
scalar_mult = 2 * v

# Norms
l2_norm = np.linalg.norm(v)  # √(1²+2²+3²)
l1_norm = np.sum(np.abs(v))  # |1|+|2|+|3|

# Normalization
unit_vector = v / np.linalg.norm(v)

# Dot product
dot_product = np.dot(v, w)  # or v @ w

# Angle
cos_theta = np.dot(v, w) / (np.linalg.norm(v) * np.linalg.norm(w))
angle = np.arccos(cos_theta)  # in radians
angle_degrees = np.degrees(angle)

# Distance
euclidean = np.linalg.norm(v - w)
manhattan = np.sum(np.abs(v - w))

# Cosine similarity
cos_sim = np.dot(v, w) / (np.linalg.norm(v) * np.linalg.norm(w))
```

### Key Formulas
```
Magnitude: ||v|| = √(v₁² + v₂² + ... + vₙ²)

Dot Product: v·w = v₁w₁ + v₂w₂ + ... + vₙwₙ
                 = ||v|| ||w|| cos(θ)

Angle: θ = arccos[(v·w) / (||v|| ||w||)]

Unit Vector: v̂ = v / ||v||

Projection: proj_w(v) = [(v·w) / (w·w)] × w

Cosine Similarity: cos(θ) = (v·w) / (||v|| ||w||)
```

---

## Practice Problems

1. **Given v = [2, -3, 1] and w = [1, 0, -2], calculate:**
   - v + w
   - 3v - 2w
   - ||v|| and ||w||
   - v·w
   - Angle between v and w

2. **Check if vectors are orthogonal:**
   - v = [3, -2], w = [4, 6]
   - v = [1, 1, 1], w = [1, -2, 1]

3. **Normalize to unit vectors:**
   - v = [3, 4]
   - v = [1, 2, 2]

4. **Calculate cosine similarity:**
   - user1 = [5, 0, 3, 0, 2], user2 = [4, 0, 5, 0, 1]

5. **Find distance between points:**
   - p1 = [1, 2, 3], p2 = [4, 6, 8]
   - Both Euclidean and Manhattan

---

**Next**: [Matrices Basics](./matrices-basics.md)
