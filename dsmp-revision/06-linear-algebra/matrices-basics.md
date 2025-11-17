# Matrices Basics - Linear Algebra

## Table of Contents
1. [What is a Matrix?](#what-is-a-matrix)
2. [Types of Matrices](#types-of-matrices)
3. [Matrix Operations](#matrix-operations)
4. [Matrix Transpose](#matrix-transpose)
5. [ML Applications](#ml-applications)
6. [Interview Questions](#interview-questions)

---

## What is a Matrix?

### Geometric Intuition
A matrix is:
- **Algebraically**: A rectangular array of numbers
- **Geometrically**: A linear transformation (rotation, scaling, shearing)
- **In ML**: A collection of vectors (data samples or features)

```
Matrix Visualization:

    ⎡ a₁₁  a₁₂  a₁₃ ⎤
A = ⎢ a₂₁  a₂₂  a₂₃ ⎥  ← 3 rows
    ⎣ a₃₁  a₃₂  a₃₃ ⎦
      ↑    ↑    ↑
    3 columns

Shape: 3×3 (rows × columns)
Element: aᵢⱼ (i-th row, j-th column)
```

### Matrix Dimensions
```
Notation: m×n matrix
- m rows (horizontal)
- n columns (vertical)

    ⎡ 1  2  3 ⎤
A = ⎢ 4  5  6 ⎥  → 2×3 matrix (2 rows, 3 columns)
    ⎣         ⎦
```

### Why Matrices Matter in ML
```
1. Data Matrix: Each row = sample, each column = feature
   ⎡ 1200  3  2 ⎤  ← House 1: [sqft, beds, baths]
   ⎢ 1500  4  2 ⎥  ← House 2
   ⎢  900  2  1 ⎥  ← House 3
   ⎣             ⎦
   Shape: 3 samples × 3 features

2. Weight Matrix: Neural network layer
   ⎡ w₁₁  w₁₂  w₁₃ ⎤
   ⎢ w₂₁  w₂₂  w₂₃ ⎥  Each row = weights for one neuron
   ⎣             ⎦

3. Transformation: Image processing, PCA, etc.
```

---

## Types of Matrices

### 1. Square Matrix
**Definition**: m = n (same number of rows and columns)

```
    ⎡ 1  2  3 ⎤
A = ⎢ 4  5  6 ⎥  → 3×3 square matrix
    ⎣ 7  8  9 ⎦

Properties:
- Has a main diagonal (top-left to bottom-right)
- Can have determinant and eigenvalues
- Can be inverted (if non-singular)
```

**ML Example**: Covariance matrix
```python
import numpy as np

# Feature covariance (3 features)
cov_matrix = np.array([
    [1.0,  0.5,  0.2],  # Variance of feature 1
    [0.5,  1.0,  0.3],  # Covariance
    [0.2,  0.3,  1.0]   # Symmetric
])
# Shape: 3×3 (always square)
```

---

### 2. Diagonal Matrix
**Definition**: All non-diagonal elements are zero

```
    ⎡ d₁  0   0  ⎤
D = ⎢ 0   d₂  0  ⎥  diag([d₁, d₂, d₃])
    ⎣ 0   0   d₃ ⎦

Example:
    ⎡ 5  0  0 ⎤
D = ⎢ 0  3  0 ⎥
    ⎣ 0  0  7 ⎦
```

**Properties**:
- Easy to invert: D⁻¹ = diag([1/d₁, 1/d₂, 1/d₃])
- Easy to multiply
- Eigenvalues = diagonal elements

**ML Example**: Scaling features
```python
# Scale each feature independently
scaling_matrix = np.diag([0.01, 1.0, 0.001])
# Feature 1: scale by 0.01 (sqft)
# Feature 2: scale by 1.0 (bedrooms)
# Feature 3: scale by 0.001 (price)

scaled_data = data @ scaling_matrix
```

**Geometric Intuition**:
```
2D Diagonal Matrix:

    ⎡ 2  0 ⎤
D = ⎣ 0  3 ⎦

Effect: Stretch x-axis by 2, y-axis by 3

    y             y
    |             |
    |             |
    |             |
    |___ x   →    |_______ x

   Circle      Becomes Ellipse
```

---

### 3. Identity Matrix
**Definition**: Diagonal matrix with all 1's

```
    ⎡ 1  0  0 ⎤
I = ⎢ 0  1  0 ⎥  or I₃ (3×3 identity)
    ⎣ 0  0  1 ⎦

Property: AI = IA = A (multiplicative identity)
```

**ML Example**: No transformation
```python
I = np.eye(3)  # 3×3 identity
# [[1, 0, 0],
#  [0, 1, 0],
#  [0, 0, 1]]

# Multiplying by I doesn't change the matrix
A @ I == A  # True
```

---

### 4. Zero Matrix
**Definition**: All elements are zero

```
    ⎡ 0  0  0 ⎤
O = ⎢ 0  0  0 ⎥
    ⎣ 0  0  0 ⎦

Property: A + O = A (additive identity)
```

---

### 5. Symmetric Matrix
**Definition**: A = Aᵀ (equals its transpose)

```
    ⎡ 1  2  3 ⎤
A = ⎢ 2  5  6 ⎥  Symmetric around diagonal
    ⎣ 3  6  9 ⎦

aᵢⱼ = aⱼᵢ for all i, j
```

**Properties**:
- Always square
- Real eigenvalues
- Orthogonal eigenvectors

**ML Examples**:
1. **Covariance Matrix** (always symmetric)
2. **Kernel Matrix** in SVM
3. **Adjacency Matrix** in undirected graphs

```python
# Covariance is symmetric
X = np.random.randn(100, 3)
cov = np.cov(X.T)
print(np.allclose(cov, cov.T))  # True
```

---

### 6. Upper Triangular Matrix
**Definition**: All elements below diagonal are zero

```
    ⎡ 1  2  3 ⎤
U = ⎢ 0  4  5 ⎥
    ⎣ 0  0  6 ⎦

uᵢⱼ = 0 for i > j
```

**Use**: QR decomposition, solving linear systems

---

### 7. Lower Triangular Matrix
**Definition**: All elements above diagonal are zero

```
    ⎡ 1  0  0 ⎤
L = ⎢ 2  3  0 ⎥
    ⎣ 4  5  6 ⎦

lᵢⱼ = 0 for i < j
```

**Use**: Cholesky decomposition, forward substitution

---

### 8. Orthogonal Matrix
**Definition**: QᵀQ = QQᵀ = I (columns are orthonormal)

```
    ⎡  cos(θ)  sin(θ) ⎤
Q = ⎣ -sin(θ)  cos(θ) ⎦  Rotation matrix

Properties:
- Q⁻¹ = Qᵀ (inverse = transpose)
- Preserves length: ||Qx|| = ||x||
- Preserves angles
```

**ML Example**: PCA transformation matrix
```python
# PCA rotation matrix (orthogonal)
# Each column is a principal component (unit vector)
# Columns are orthogonal to each other
```

---

## Matrix Operations

### 1. Matrix Addition

**Rule**: Same dimensions required

```
    ⎡ a₁₁  a₁₂ ⎤     ⎡ b₁₁  b₁₂ ⎤     ⎡ a₁₁+b₁₁  a₁₂+b₁₂ ⎤
A + B = ⎣ a₂₁  a₂₂ ⎦  +  ⎣ b₂₁  b₂₂ ⎦  =  ⎣ a₂₁+b₂₁  a₂₂+b₂₂ ⎦
```

**Step-by-step Example**:
```python
    ⎡ 1  2 ⎤     ⎡ 5  6 ⎤
A = ⎣ 3  4 ⎦  B = ⎣ 7  8 ⎦

# Element-wise addition
A + B = ⎡ 1+5  2+6 ⎤ = ⎡ 6   8  ⎤
        ⎣ 3+7  4+8 ⎦   ⎣ 10  12 ⎦
```

**Properties**:
- Commutative: A + B = B + A
- Associative: (A + B) + C = A + (B + C)
- Identity: A + O = A

**ML Application**: Combining gradients from different batches
```python
# Gradient accumulation
grad_batch1 = np.array([[0.1, 0.2], [0.3, 0.4]])
grad_batch2 = np.array([[0.05, 0.15], [0.25, 0.35]])

total_grad = grad_batch1 + grad_batch2
# [[0.15, 0.35],
#  [0.55, 0.75]]
```

---

### 2. Scalar Multiplication

**Rule**: Multiply each element by scalar

```
    ⎡ a₁₁  a₁₂ ⎤     ⎡ c·a₁₁  c·a₁₂ ⎤
c·A = c⎣ a₂₁  a₂₂ ⎦  =  ⎣ c·a₂₁  c·a₂₂ ⎦
```

**Step-by-step Example**:
```python
    ⎡ 1  2 ⎤
A = ⎣ 3  4 ⎦

c = 3

3·A = ⎡ 3×1  3×2 ⎤ = ⎡ 3   6  ⎤
      ⎣ 3×3  3×4 ⎦   ⎣ 9   12 ⎦
```

**ML Application**: Learning rate scaling
```python
learning_rate = 0.01
weights = np.array([[1.0, 0.5], [0.3, 0.8]])
gradient = np.array([[2.0, 1.5], [0.5, 1.0]])

# Update weights
delta = learning_rate * gradient
weights_new = weights - delta
```

---

### 3. Matrix Multiplication

**Rule**: (m×n) × (n×p) = (m×p)
- Number of columns in A must equal number of rows in B

```
Matrix Multiplication (NOT element-wise):

A(m×n) × B(n×p) = C(m×p)

cᵢⱼ = Σ(aᵢₖ × bₖⱼ) for k=1 to n
    = (row i of A) · (column j of B)
```

**Visual Process**:
```
    ⎡ a₁₁  a₁₂ ⎤     ⎡ b₁₁  b₁₂ ⎤
A = ⎣ a₂₁  a₂₂ ⎦  B = ⎣ b₂₁  b₂₂ ⎦

C = A × B

c₁₁ = row1(A) · col1(B) = a₁₁b₁₁ + a₁₂b₂₁
c₁₂ = row1(A) · col2(B) = a₁₁b₁₂ + a₁₂b₂₂
c₂₁ = row2(A) · col1(B) = a₂₁b₁₁ + a₂₂b₂₁
c₂₂ = row2(A) · col2(B) = a₂₁b₁₂ + a₂₂b₂₂
```

**Complete Step-by-step Example**:
```python
    ⎡ 1  2  3 ⎤         ⎡ 7   8  ⎤
A = ⎣ 4  5  6 ⎦     B = ⎢ 9   10 ⎥
    (2×3)               ⎣ 11  12 ⎦
                        (3×2)

C = A × B  (will be 2×2)

# Calculate each element:

c₁₁ = [1,2,3] · [7,9,11]ᵀ
    = 1×7 + 2×9 + 3×11
    = 7 + 18 + 33
    = 58

c₁₂ = [1,2,3] · [8,10,12]ᵀ
    = 1×8 + 2×10 + 3×12
    = 8 + 20 + 36
    = 64

c₂₁ = [4,5,6] · [7,9,11]ᵀ
    = 4×7 + 5×9 + 6×11
    = 28 + 45 + 66
    = 139

c₂₂ = [4,5,6] · [8,10,12]ᵀ
    = 4×8 + 5×10 + 6×12
    = 32 + 50 + 72
    = 154

Result:
    ⎡ 58   64  ⎤
C = ⎣ 139  154 ⎦
```

**Properties**:
- **NOT commutative**: AB ≠ BA (usually)
- **Associative**: (AB)C = A(BC)
- **Distributive**: A(B+C) = AB + AC

**Important**: AB ≠ BA
```python
    ⎡ 1  2 ⎤     ⎡ 0  1 ⎤
A = ⎣ 3  4 ⎦  B = ⎣ 1  0 ⎦

AB = ⎡ 2  1 ⎤
     ⎣ 4  3 ⎦

BA = ⎡ 3  4 ⎤
     ⎣ 1  2 ⎦

AB ≠ BA!
```

---

**Geometric Intuition**:
```
Matrix multiplication = composition of transformations

If A rotates 45° and B scales by 2:
AB = "first scale, then rotate"
BA = "first rotate, then scale"
→ Different results!
```

---

### 4. Element-wise Multiplication (Hadamard Product)

**Symbol**: A ⊙ B (not standard matrix multiplication)

```
    ⎡ a₁₁  a₁₂ ⎤     ⎡ b₁₁  b₁₂ ⎤     ⎡ a₁₁b₁₁  a₁₂b₁₂ ⎤
A ⊙ B = ⎣ a₂₁  a₂₂ ⎦  ⊙  ⎣ b₂₁  b₂₂ ⎦  =  ⎣ a₂₁b₂₁  a₂₂b₂₂ ⎦
```

**Example**:
```python
    ⎡ 1  2 ⎤     ⎡ 5  6 ⎤     ⎡ 5   12 ⎤
A = ⎣ 3  4 ⎦  B = ⎣ 7  8 ⎦  A⊙B = ⎣ 21  32 ⎦

# In NumPy
A * B  # Element-wise (Hadamard)
A @ B  # Matrix multiplication
```

**ML Application**: Attention mechanism, dropout masks
```python
# Dropout mask (element-wise)
activations = np.array([[0.5, 0.8], [0.3, 0.9]])
dropout_mask = np.array([[1, 0], [1, 1]])  # 0 = drop

result = activations * dropout_mask  # Element-wise
# [[0.5, 0.0],
#  [0.3, 0.9]]
```

---

## Matrix Transpose

### Definition
Transpose: Flip matrix over its diagonal (swap rows and columns)

```
Notation: Aᵀ or A'

    ⎡ a₁₁  a₁₂  a₁₃ ⎤              ⎡ a₁₁  a₂₁ ⎤
A = ⎣ a₂₁  a₂₂  a₂₃ ⎦  →  Aᵀ =     ⎢ a₁₂  a₂₂ ⎥
    (2×3)                          ⎣ a₁₃  a₂₃ ⎦
                                   (3×2)

Rule: (Aᵀ)ᵢⱼ = Aⱼᵢ
```

### Step-by-step Example
```python
    ⎡ 1  2  3 ⎤
A = ⎣ 4  5  6 ⎦  (2×3)

# Row 1 of A becomes Column 1 of Aᵀ
# Row 2 of A becomes Column 2 of Aᵀ

Aᵀ = ⎡ 1  4 ⎤
     ⎢ 2  5 ⎥  (3×2)
     ⎣ 3  6 ⎦
```

### Visual Understanding
```
Original Matrix:

    Col1  Col2  Col3
Row1  1    2    3
Row2  4    5    6

Transposed:

    Col1  Col2
Row1  1    4     ← Was Column 1
Row2  2    5     ← Was Column 2
Row3  3    6     ← Was Column 3
```

### Properties of Transpose

**1. Double transpose returns original**:
```
(Aᵀ)ᵀ = A
```

**2. Transpose of sum**:
```
(A + B)ᵀ = Aᵀ + Bᵀ
```

**3. Transpose of product (reverse order!)**:
```
(AB)ᵀ = BᵀAᵀ  (order reverses!)

Not (AB)ᵀ = AᵀBᵀ ✗
```

**Proof of (AB)ᵀ = BᵀAᵀ**:
```python
A = ⎡ 1  2 ⎤     B = ⎡ 5  6 ⎤
    ⎣ 3  4 ⎦         ⎣ 7  8 ⎦

# Method 1: Compute AB, then transpose
AB = ⎡ 19  22 ⎤
     ⎣ 43  50 ⎦

(AB)ᵀ = ⎡ 19  43 ⎤
        ⎣ 22  50 ⎦

# Method 2: Transpose first, then multiply in reverse
Aᵀ = ⎡ 1  3 ⎤     Bᵀ = ⎡ 5  7 ⎤
     ⎣ 2  4 ⎦          ⎣ 6  8 ⎦

BᵀAᵀ = ⎡ 19  43 ⎤
       ⎣ 22  50 ⎦

(AB)ᵀ = BᵀAᵀ ✓
```

**4. Scalar multiplication**:
```
(cA)ᵀ = c(Aᵀ)
```

**5. For symmetric matrix**:
```
A = Aᵀ
```

---

### ML Applications of Transpose

**1. Data Matrix Orientation**
```python
# Samples × Features (usual format)
X = np.array([
    [1, 2, 3],  # Sample 1
    [4, 5, 6],  # Sample 2
    [7, 8, 9]   # Sample 3
])  # Shape: (3 samples, 3 features)

# Sometimes need Features × Samples
Xᵀ = X.T  # Shape: (3 features, 3 samples)

# Useful for computing feature statistics
feature_means = np.mean(X.T, axis=1)  # Mean per feature
```

**2. Computing Covariance Matrix**
```python
# Center the data
X_centered = X - np.mean(X, axis=0)

# Covariance: (1/n) × XᵀX
cov_matrix = (X_centered.T @ X_centered) / (n - 1)

# Always produces square symmetric matrix
```

**3. Linear Regression Normal Equation**
```
Normal Equation: θ = (XᵀX)⁻¹Xᵀy

Where:
- X: (m×n) design matrix
- Xᵀ: (n×m) transpose
- XᵀX: (n×n) square matrix
- y: (m×1) target vector
- θ: (n×1) parameters
```

**Complete Example**:
```python
# Data: 3 samples, 2 features
X = np.array([
    [1, 1],
    [1, 2],
    [1, 3]
])  # Added column of 1's for bias

y = np.array([[2], [4], [6]])

# Step 1: Compute XᵀX
XtX = X.T @ X
# = [[3, 6],
#    [6, 14]]

# Step 2: Compute Xᵀy
Xty = X.T @ y
# = [[12],
#    [28]]

# Step 3: Solve (XᵀX)θ = Xᵀy
# θ = (XᵀX)⁻¹Xᵀy
theta = np.linalg.inv(XtX) @ Xty
# θ ≈ [[0], [2]]
# Model: y = 0 + 2x (perfect fit!)
```

**4. Neural Network Backpropagation**
```python
# Forward pass
# a = σ(Wx + b)

# Backward pass (gradient of loss w.r.t. weights)
# ∂L/∂W = ∂L/∂a × xᵀ  (uses transpose!)

X = np.array([[1, 2, 3]])  # Input (1×3)
grad_output = np.array([[0.5, 0.2]])  # Gradient (1×2)

# Gradient for weight matrix (2×3)
grad_W = grad_output.T @ X
# = [[0.5],    @ [[1, 2, 3]]
#    [0.2]]
# = [[0.5, 1.0, 1.5],
#    [0.2, 0.4, 0.6]]
```

**5. Gram Matrix (Style Transfer)**
```python
# Gram matrix captures feature correlations
# G = FFᵀ where F is feature map

F = np.array([
    [1, 2],
    [3, 4],
    [5, 6]
])  # 3 features × 2 spatial locations

Gram = F @ F.T
# = [[5,  11, 17],
#    [11, 25, 39],
#    [17, 39, 61]]

# Captures which features activate together
```

---

## ML Applications

### 1. Batch Matrix Operations

**Vectorized Operations (Fast!)**:
```python
# Instead of loops, use matrix operations

# Slow: Loop over samples
predictions = []
for x in X:
    y_pred = weights @ x + bias
    predictions.append(y_pred)

# Fast: Single matrix multiplication
predictions = X @ weights + bias

# Example:
X = np.array([[1, 2], [3, 4], [5, 6]])  # 3 samples
weights = np.array([0.5, 0.3])
bias = 1.0

y = X @ weights + bias
# = [[1.1], [3.3], [5.5]]  (all at once!)
```

---

### 2. One-Hot Encoding as Matrix

```python
# Convert categorical to one-hot using matrix

categories = np.array([0, 2, 1, 0])  # 4 samples, 3 classes

# Create identity matrix
I = np.eye(3)

# One-hot encoding
one_hot = I[categories]
# = [[1, 0, 0],  # Class 0
#    [0, 0, 1],  # Class 2
#    [0, 1, 0],  # Class 1
#    [1, 0, 0]]  # Class 0
```

---

### 3. Confusion Matrix

```
Confusion Matrix (Classification):

             Predicted
             0    1
Actual  0  [[TN  FP]
        1   [FN  TP]]

Symmetric if balanced, diagonal = correct predictions
```

**Example**:
```python
from sklearn.metrics import confusion_matrix

y_true = [0, 1, 0, 1, 0, 1]
y_pred = [0, 1, 0, 0, 0, 1]

cm = confusion_matrix(y_true, y_pred)
# = [[3, 0],  # Class 0: 3 correct, 0 wrong
#    [1, 2]]  # Class 1: 1 wrong, 2 correct
```

---

### 4. Adjacency Matrix (Graph Neural Networks)

```
Graph represented as matrix:

Nodes: A, B, C, D
Edges: A-B, B-C, C-D, D-A

Adjacency Matrix:
      A  B  C  D
   A [0  1  0  1]
   B [1  0  1  0]
   C [0  1  0  1]
   D [1  0  1  0]

Symmetric (undirected graph)
```

**Use in GNN**:
```python
# Message passing
A = adjacency_matrix  # n×n
H = node_features      # n×d

# Aggregate neighbor features
H_new = A @ H  # Each row = sum of neighbor features
```

---

### 5. Attention Matrix

```
Attention in Transformers:

Q = Query matrix   (seq_len × d_k)
K = Key matrix     (seq_len × d_k)
V = Value matrix   (seq_len × d_v)

Attention weights:
A = softmax(QKᵀ / √d_k)  # (seq_len × seq_len)

Output:
O = AV  # (seq_len × d_v)
```

**Example**:
```python
# Simplified attention
Q = np.array([[1, 0], [0, 1]])
K = np.array([[1, 0], [0, 1]])
V = np.array([[2, 3], [4, 5]])

# Attention scores
scores = Q @ K.T  # (2×2)
# = [[1, 0],
#    [0, 1]]

# Softmax
import scipy.special
A = scipy.special.softmax(scores, axis=1)

# Output
output = A @ V
```

---

## Interview Questions

### Conceptual Questions

**Q1: Why is matrix multiplication not commutative?**
```
AB ≠ BA because:

1. Geometric: Different order of transformations
   - AB: Apply B first, then A
   - BA: Apply A first, then B

2. Dimensions may not match
   - A is 2×3, B is 3×4
   - AB is valid (2×4)
   - BA is invalid (can't multiply 3×4 by 2×3)

3. Even when square, operations differ
   Example: Rotation then scaling ≠ Scaling then rotation

Counterexample:
A = [[1, 2],    B = [[0, 1],
     [0, 1]]         [1, 0]]

AB = [[2, 1],   BA = [[0, 1],
      [1, 0]]        [1, 2]]

AB ≠ BA
```

**Q2: What's the difference between A*B and A@B in NumPy?**
```
A * B: Element-wise (Hadamard product)
- Requires same shape
- cᵢⱼ = aᵢⱼ × bᵢⱼ
- Used in: dropout, masking, element-wise operations

A @ B: Matrix multiplication
- Requires inner dimensions match
- cᵢⱼ = Σ(aᵢₖ × bₖⱼ)
- Used in: linear layers, transformations

Example:
A = [[1, 2],    B = [[5, 6],
     [3, 4]]         [7, 8]]

A * B = [[5,  12],   # Element-wise
         [21, 32]]

A @ B = [[19, 22],   # Matrix mult
         [43, 50]]
```

**Q3: When is a matrix its own transpose?**
```
A = Aᵀ when matrix is symmetric

Properties:
- Must be square
- aᵢⱼ = aⱼᵢ for all i, j
- Symmetric around main diagonal

Examples:
1. Covariance matrix (always symmetric)
2. Correlation matrix
3. Adjacency matrix (undirected graph)

Why it matters:
- Symmetric matrices have special properties
- Real eigenvalues
- Orthogonal eigenvectors
- Easier to decompose
```

---

### Coding Questions

**Q4: Implement matrix multiplication from scratch**
```python
def matrix_multiply(A, B):
    """
    Multiply two matrices A and B.

    Args:
        A: m×n matrix
        B: n×p matrix

    Returns:
        C: m×p matrix (AB)
    """
    # Get dimensions
    m, n = len(A), len(A[0])
    n2, p = len(B), len(B[0])

    # Check if multiplication is valid
    if n != n2:
        raise ValueError(f"Cannot multiply {m}×{n} and {n2}×{p}")

    # Initialize result matrix
    C = [[0 for _ in range(p)] for _ in range(m)]

    # Compute each element
    for i in range(m):
        for j in range(p):
            # Dot product of row i of A and column j of B
            for k in range(n):
                C[i][j] += A[i][k] * B[k][j]

    return C

# Test
A = [[1, 2, 3],
     [4, 5, 6]]

B = [[7, 8],
     [9, 10],
     [11, 12]]

C = matrix_multiply(A, B)
print(C)
# [[58, 64],
#  [139, 154]]
```

**Q5: Transpose a matrix without NumPy**
```python
def transpose(A):
    """
    Transpose matrix A.

    Args:
        A: m×n matrix

    Returns:
        Aᵀ: n×m matrix
    """
    m = len(A)
    n = len(A[0])

    # Create n×m matrix
    At = [[0 for _ in range(m)] for _ in range(n)]

    # Swap rows and columns
    for i in range(m):
        for j in range(n):
            At[j][i] = A[i][j]

    return At

# Test
A = [[1, 2, 3],
     [4, 5, 6]]

At = transpose(A)
print(At)
# [[1, 4],
#  [2, 5],
#  [3, 6]]
```

**Q6: Check if matrix is symmetric**
```python
def is_symmetric(A):
    """
    Check if matrix is symmetric.

    Args:
        A: n×n matrix

    Returns:
        bool: True if A = Aᵀ
    """
    import numpy as np

    A = np.array(A)

    # Check if square
    if A.shape[0] != A.shape[1]:
        return False

    # Check if A = Aᵀ
    return np.allclose(A, A.T)

# Test
A = [[1, 2, 3],
     [2, 4, 5],
     [3, 5, 6]]

print(is_symmetric(A))  # True

B = [[1, 2],
     [3, 4]]

print(is_symmetric(B))  # False
```

**Q7: Compute covariance matrix**
```python
def covariance_matrix(X):
    """
    Compute covariance matrix of data X.

    Args:
        X: (n_samples, n_features) array

    Returns:
        Cov: (n_features, n_features) covariance matrix
    """
    import numpy as np

    # Center the data
    X_centered = X - np.mean(X, axis=0)

    # Compute covariance: (1/(n-1)) × XᵀX
    n = X.shape[0]
    cov = (X_centered.T @ X_centered) / (n - 1)

    return cov

# Test
X = np.array([
    [1, 2],
    [2, 4],
    [3, 6]
])

cov = covariance_matrix(X)
print(cov)
# [[1.  2. ],
#  [2.  4. ]]  (symmetric!)

# Verify with NumPy
print(np.cov(X.T))  # Same result
```

---

### Mathematical Questions

**Q8: Prove (AB)ᵀ = BᵀAᵀ**
```
Proof by element inspection:

Let C = AB
cᵢⱼ = Σₖ aᵢₖbₖⱼ

For transpose Cᵀ:
(Cᵀ)ᵢⱼ = cⱼᵢ
       = Σₖ aⱼₖbₖᵢ

For BᵀAᵀ:
Let D = BᵀAᵀ
dᵢⱼ = Σₖ (Bᵀ)ᵢₖ(Aᵀ)ₖⱼ
    = Σₖ bₖᵢaⱼₖ
    = Σₖ aⱼₖbₖᵢ  (commutative)

Therefore (Cᵀ)ᵢⱼ = dᵢⱼ
So (AB)ᵀ = BᵀAᵀ ✓
```

**Q9: Why is XᵀX always symmetric?**
```
Claim: For any matrix X, XᵀX is symmetric

Proof:
(XᵀX)ᵀ = Xᵀ(Xᵀ)ᵀ    (by (AB)ᵀ = BᵀAᵀ)
       = XᵀX          (by (Xᵀ)ᵀ = X)

Since (XᵀX)ᵀ = XᵀX, it's symmetric ✓

This is why:
- Covariance matrices are symmetric
- Gram matrices are symmetric
- Normal equation produces symmetric XᵀX
```

---

## Quick Reference

### NumPy Matrix Operations
```python
import numpy as np

# Create matrices
A = np.array([[1, 2], [3, 4]])
I = np.eye(3)  # 3×3 identity
D = np.diag([1, 2, 3])  # Diagonal
Z = np.zeros((2, 3))  # Zero matrix

# Basic operations
C = A + B  # Addition
C = A - B  # Subtraction
C = c * A  # Scalar multiplication

# Matrix multiplication
C = A @ B  # or np.dot(A, B)
C = A * B  # Element-wise (Hadamard)

# Transpose
At = A.T

# Shape and size
shape = A.shape  # (rows, cols)
size = A.size    # total elements

# Matrix properties
is_square = (A.shape[0] == A.shape[1])
is_symmetric = np.allclose(A, A.T)

# Diagonal operations
diag_elements = np.diag(A)  # Extract diagonal
trace = np.trace(A)  # Sum of diagonal
```

### Matrix Types Summary
```
Square:      m = n
Diagonal:    aᵢⱼ = 0 for i ≠ j
Identity:    I, aᵢᵢ = 1, aᵢⱼ = 0 for i ≠ j
Symmetric:   A = Aᵀ
Orthogonal:  QᵀQ = I
Triangular:  Upper (aᵢⱼ = 0 for i > j)
             Lower (aᵢⱼ = 0 for i < j)
```

---

**Next**: [Matrices Advanced](./matrices-advanced.md)
