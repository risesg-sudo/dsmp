# Eigenvalues, Eigenvectors & SVD - Matrix Decomposition

## Table of Contents
1. [Eigenvalues and Eigenvectors](#eigenvalues-and-eigenvectors)
2. [Computing Eigenvalues/Eigenvectors](#computing-eigenvalueseigenvectors)
3. [Eigendecomposition](#eigendecomposition)
4. [Singular Value Decomposition (SVD)](#singular-value-decomposition-svd)
5. [PCA (Principal Component Analysis)](#pca-principal-component-analysis)
6. [ML Applications](#ml-applications)
7. [Interview Questions](#interview-questions)

---

## Eigenvalues and Eigenvectors

### What are Eigenvectors?

**Definition**: Special vectors that don't change direction when transformed
```
Av = λv

Where:
- v: eigenvector (direction unchanged)
- λ: eigenvalue (scaling factor)
- A: matrix (transformation)
```

**Geometric Intuition**:
```
Most vectors change direction when transformed:
    v  →  Av (different direction)

But eigenvectors only get scaled:
    v  →  λv (same direction, different length)
```

**Visual Example**:
```
A = ⎡ 2  0 ⎤  (diagonal matrix, scales axes)
    ⎣ 0  3 ⎦

Eigenvector v₁ = [1, 0]:
    Av₁ = ⎡ 2  0 ⎤ ⎡ 1 ⎤ = ⎡ 2 ⎤ = 2⎡ 1 ⎤ = 2v₁
          ⎣ 0  3 ⎦ ⎣ 0 ⎦   ⎣ 0 ⎦    ⎣ 0 ⎦

    λ₁ = 2, v₁ = [1, 0]

Eigenvector v₂ = [0, 1]:
    Av₂ = ⎡ 2  0 ⎤ ⎡ 0 ⎤ = ⎡ 0 ⎤ = 3⎡ 0 ⎤ = 3v₂
          ⎣ 0  3 ⎦ ⎣ 1 ⎦   ⎣ 3 ⎦    ⎣ 1 ⎦

    λ₂ = 3, v₂ = [0, 1]

Visual:
    y              y
    |              |
    |* v₂          |
    |              |    * Av₂ = 3v₂
    |              |    (3x longer, same direction)
    |_____x        |________x
      * v₁           ** Av₁ = 2v₁
```

---

### Why Eigenvectors Matter

**1. Reveal Intrinsic Directions**:
```
Eigenvectors = natural axes of transformation
- Stretch/compress along these directions
- Independent of coordinate system
```

**2. Simplify Matrix Powers**:
```
If Av = λv, then:
A²v = A(Av) = A(λv) = λ(Av) = λ²v
A³v = λ³v
Aⁿv = λⁿv

Computing A¹⁰⁰ directly: expensive
Using eigenvalues: just compute λ¹⁰⁰ (easy!)
```

**3. Understand Long-term Behavior**:
```
Dominant eigenvalue determines long-term dynamics:
- |λ| > 1: Exponential growth
- |λ| < 1: Decay to zero
- |λ| = 1: Stable oscillation

Applications:
- PageRank (dominant eigenvector)
- Markov chains (steady state)
- Stability analysis
```

---

### Properties of Eigenvalues/Eigenvectors

**1. Number of Eigenvalues**:
```
n×n matrix has n eigenvalues (counting multiplicity)
May be:
- Real or complex
- Distinct or repeated
```

**2. Eigenvectors are not unique**:
```
If v is eigenvector, so is cv (any scalar multiple)

Usually normalized: ||v|| = 1
```

**3. Trace and Determinant**:
```
trace(A) = sum of diagonal elements
         = sum of eigenvalues

det(A) = product of eigenvalues

Example:
A = ⎡ 2  1 ⎤  eigenvalues: λ₁=3, λ₂=1
    ⎣ 1  2 ⎦

trace(A) = 2 + 2 = 4 = 3 + 1 ✓
det(A) = 4 - 1 = 3 = 3 × 1 ✓
```

**4. Symmetric Matrices**:
```
For symmetric A = Aᵀ:
- All eigenvalues are REAL
- Eigenvectors are ORTHOGONAL
- Always diagonalizable

This is why covariance matrices are so nice!
```

---

## Computing Eigenvalues/Eigenvectors

### Characteristic Equation

**Method**: Solve det(A - λI) = 0

**Steps**:
```
1. Form (A - λI)
2. Calculate det(A - λI)
3. Solve polynomial = 0 for λ
4. For each λ, solve (A - λI)v = 0 for v
```

---

### Complete 2×2 Example

**Problem**: Find eigenvalues and eigenvectors of
```
A = ⎡ 4  2 ⎤
    ⎣ 1  3 ⎦
```

**Step 1: Form A - λI**
```
A - λI = ⎡ 4  2 ⎤ - λ⎡ 1  0 ⎤
         ⎣ 1  3 ⎦    ⎣ 0  1 ⎦

       = ⎡ 4-λ   2  ⎤
         ⎣  1   3-λ ⎦
```

**Step 2: Calculate determinant**
```
det(A - λI) = (4-λ)(3-λ) - (2)(1)
            = 12 - 4λ - 3λ + λ² - 2
            = λ² - 7λ + 10
```

**Step 3: Solve characteristic equation**
```
λ² - 7λ + 10 = 0

Factor: (λ - 5)(λ - 2) = 0

Eigenvalues: λ₁ = 5, λ₂ = 2
```

**Step 4a: Find eigenvector for λ₁ = 5**
```
(A - 5I)v = 0

⎡ -1   2 ⎤ ⎡ v₁ ⎤ = ⎡ 0 ⎤
⎣  1  -2 ⎦ ⎣ v₂ ⎦   ⎣ 0 ⎦

Equations:
-v₁ + 2v₂ = 0  →  v₁ = 2v₂
 v₁ - 2v₂ = 0  (same equation)

Solution: v₁ = [2, 1]ᵀ (or any multiple)

Normalized: v₁ = [2, 1]ᵀ / √5 = [2/√5, 1/√5]ᵀ
```

**Step 4b: Find eigenvector for λ₂ = 2**
```
(A - 2I)v = 0

⎡  2   2 ⎤ ⎡ v₁ ⎤ = ⎡ 0 ⎤
⎣  1   1 ⎦ ⎣ v₂ ⎦   ⎣ 0 ⎦

Equations:
2v₁ + 2v₂ = 0  →  v₁ = -v₂
 v₁ +  v₂ = 0  (same equation)

Solution: v₂ = [1, -1]ᵀ (or any multiple)

Normalized: v₂ = [1, -1]ᵀ / √2 = [1/√2, -1/√2]ᵀ
```

**Final Answer**:
```
Eigenvalue λ₁ = 5,  Eigenvector v₁ = [2, 1]ᵀ
Eigenvalue λ₂ = 2,  Eigenvector v₂ = [1, -1]ᵀ

Verification:
Av₁ = ⎡ 4  2 ⎤ ⎡ 2 ⎤ = ⎡ 10 ⎤ = 5⎡ 2 ⎤ = 5v₁ ✓
      ⎣ 1  3 ⎦ ⎣ 1 ⎦   ⎣  5 ⎦    ⎣ 1 ⎦

Av₂ = ⎡ 4  2 ⎤ ⎡  1 ⎤ = ⎡  2 ⎤ = 2⎡  1 ⎤ = 2v₂ ✓
      ⎣ 1  3 ⎦ ⎣ -1 ⎦   ⎣ -2 ⎦    ⎣ -1 ⎦
```

---

### Complete 3×3 Example

**Problem**: Find eigenvalues of
```
A = ⎡ 2  0  0 ⎤
    ⎢ 0  3  4 ⎥
    ⎣ 0  4  9 ⎦
```

**Step 1: Form A - λI**
```
A - λI = ⎡ 2-λ   0     0  ⎤
         ⎢  0   3-λ    4  ⎥
         ⎣  0    4   9-λ  ⎦
```

**Step 2: Calculate determinant (block form)**
```
det(A - λI) = (2-λ) × det⎡ 3-λ    4  ⎤
                         ⎣  4   9-λ  ⎦

            = (2-λ) × [(3-λ)(9-λ) - 16]
            = (2-λ) × [27 - 9λ - 3λ + λ² - 16]
            = (2-λ) × [λ² - 12λ + 11]
            = (2-λ)(λ - 11)(λ - 1)
```

**Step 3: Eigenvalues**
```
λ₁ = 2, λ₂ = 11, λ₃ = 1

Verify:
trace(A) = 2 + 3 + 9 = 14 = 2 + 11 + 1 ✓
det(A) = 2(27-16) = 22 = 2 × 11 × 1 ✓
```

---

### Special Cases

**Diagonal Matrix**:
```
A = ⎡ d₁  0   0  ⎤
    ⎢ 0   d₂  0  ⎥
    ⎣ 0   0   d₃ ⎦

Eigenvalues = diagonal elements: λᵢ = dᵢ
Eigenvectors = standard basis: [1,0,0], [0,1,0], [0,0,1]

Super easy!
```

**Triangular Matrix**:
```
A = ⎡ a  b  c ⎤
    ⎢ 0  d  e ⎥
    ⎣ 0  0  f ⎦

Eigenvalues = diagonal elements: λ = a, d, f

For any triangular matrix!
```

**Symmetric Matrix**:
```
If A = Aᵀ:
- Eigenvalues are REAL
- Eigenvectors are ORTHOGONAL
- Can be diagonalized: A = QΛQᵀ where Q is orthogonal
```

---

## Eigendecomposition

### What is Eigendecomposition?

**Decompose matrix into eigenvalues and eigenvectors**:
```
A = QΛQ⁻¹

Where:
- Q: matrix of eigenvectors (columns)
- Λ: diagonal matrix of eigenvalues
- Q⁻¹: inverse of eigenvector matrix

For symmetric A:
A = QΛQᵀ  (Q⁻¹ = Qᵀ, orthogonal!)
```

**Geometric Interpretation**:
```
A = QΛQ⁻¹

Av = Q Λ Q⁻¹ v

Step 1: Q⁻¹v = rotate to eigenbasis
Step 2: Λ = scale along eigendirections
Step 3: Q = rotate back to original basis
```

---

### Complete Example

**Problem**: Decompose
```
A = ⎡ 4  2 ⎤
    ⎣ 2  4 ⎦
```

**Step 1: Find eigenvalues**
```
det(A - λI) = (4-λ)² - 4 = λ² - 8λ + 12 = (λ-6)(λ-2)

λ₁ = 6, λ₂ = 2
```

**Step 2: Find eigenvectors**
```
For λ₁ = 6:
⎡ -2   2 ⎤ ⎡ v₁ ⎤ = 0  →  v₁ = [1, 1]ᵀ (normalized: [1/√2, 1/√2]ᵀ)
⎣  2  -2 ⎦ ⎣ v₂ ⎦

For λ₂ = 2:
⎡  2   2 ⎤ ⎡ v₁ ⎤ = 0  →  v₂ = [1, -1]ᵀ (normalized: [1/√2, -1/√2]ᵀ)
⎣  2   2 ⎦ ⎣ v₂ ⎦
```

**Step 3: Form Q and Λ**
```
    ⎡ 1/√2   1/√2 ⎤
Q = ⎣ 1/√2  -1/√2 ⎦  (columns are eigenvectors)

    ⎡ 6  0 ⎤
Λ = ⎣ 0  2 ⎦  (diagonal = eigenvalues)
```

**Step 4: Verify decomposition**
```
QΛQᵀ = ⎡ 1/√2   1/√2 ⎤ ⎡ 6  0 ⎤ ⎡ 1/√2   1/√2 ⎤
       ⎣ 1/√2  -1/√2 ⎦ ⎣ 0  2 ⎦ ⎣ 1/√2  -1/√2 ⎦

First multiply QΛ:
QΛ = ⎡ 6/√2   2/√2 ⎤
     ⎣ 6/√2  -2/√2 ⎦

Then (QΛ)Qᵀ:
= ⎡ 6/√2·1/√2 + 2/√2·1/√2    6/√2·1/√2 - 2/√2·1/√2 ⎤
  ⎣ 6/√2·1/√2 - 2/√2·1/√2    6/√2·1/√2 + 2/√2·1/√2 ⎦

= ⎡ 6/2 + 2/2    6/2 - 2/2 ⎤ = ⎡ 4  2 ⎤ = A ✓
  ⎣ 6/2 - 2/2    6/2 + 2/2 ⎦   ⎣ 2  4 ⎦
```

---

### Applications of Eigendecomposition

**1. Matrix Powers**:
```
A² = (QΛQ⁻¹)(QΛQ⁻¹) = QΛ²Q⁻¹
A³ = QΛ³Q⁻¹
Aⁿ = QΛⁿQ⁻¹

Where Λⁿ = diag(λ₁ⁿ, λ₂ⁿ, ..., λₙⁿ) (easy to compute!)

Example: Compute A¹⁰⁰
Λ¹⁰⁰ = ⎡ 6¹⁰⁰   0   ⎤
       ⎣  0    2¹⁰⁰ ⎦

A¹⁰⁰ = QΛ¹⁰⁰Q⁻¹
```

**2. Matrix Exponential**:
```
eᴬ = I + A + A²/2! + A³/3! + ...
   = Q(eᴧ)Q⁻¹

Where eᴧ = diag(eλ¹, eλ², ..., eλⁿ)
```

**3. Differential Equations**:
```
dy/dt = Ay

Solution: y(t) = eᴬᵗy₀
```

---

## Singular Value Decomposition (SVD)

### What is SVD?

**Most important matrix decomposition in ML!**

```
Any m×n matrix A can be decomposed:

A = UΣVᵀ

Where:
- U: m×m orthogonal matrix (left singular vectors)
- Σ: m×n diagonal matrix (singular values)
- V: n×n orthogonal matrix (right singular vectors)

Works for ANY matrix (not just square or symmetric)!
```

**Geometric Intuition**:
```
SVD decomposes transformation into:

Av = U Σ Vᵀ v

Step 1: Vᵀ = rotate in input space
Step 2: Σ = scale along principal axes
Step 3: U = rotate in output space

Any linear transformation = rotate + scale + rotate
```

**Visual (2D → 2D)**:
```
    Circle  →  Vᵀ  →  Circle  →  Σ  →  Ellipse  →  U  →  Ellipse
               (rotate)        (stretch)         (rotate)

Σ = ⎡ σ₁  0  ⎤  where σ₁ ≥ σ₂ ≥ 0
    ⎣ 0   σ₂ ⎦

σ₁, σ₂ = singular values (lengths of ellipse axes)
```

---

### Computing SVD

**Method 1: From eigendecomposition**
```
1. Compute AᵀA (n×n, symmetric)
2. Eigendecompose: AᵀA = VΛVᵀ
3. Singular values: σᵢ = √λᵢ
4. Right singular vectors: columns of V
5. Left singular vectors: U = AVΣ⁻¹
```

**Method 2: From AAᵀ**
```
1. Compute AAᵀ (m×m, symmetric)
2. Eigendecompose: AAᵀ = UΛUᵀ
3. Singular values: σᵢ = √λᵢ
4. Left singular vectors: columns of U
5. Right singular vectors: V = AᵀUΣ⁻¹
```

---

### Complete SVD Example

**Problem**: Find SVD of
```
A = ⎡ 3  2  2 ⎤
    ⎣ 2  3 -2 ⎦  (2×3 matrix)
```

**Step 1: Compute AᵀA**
```
AᵀA = ⎡ 3  2 ⎤ ⎡ 3  2  2 ⎤
      ⎢ 2  3 ⎥ ⎣ 2  3 -2 ⎦
      ⎣ 2 -2 ⎦

    = ⎡ 13   12   2  ⎤
      ⎢ 12   13  -2  ⎥
      ⎣  2   -2   8  ⎦  (3×3)
```

**Step 2: Eigenvalues of AᵀA**
```
Solving det(AᵀA - λI) = 0:
λ₁ = 25, λ₂ = 9, λ₃ = 0

Singular values:
σ₁ = √25 = 5
σ₂ = √9 = 3
σ₃ = 0  (rank deficient!)
```

**Step 3: Eigenvectors of AᵀA → V**
```
For λ₁ = 25: v₁ = [3/5, 4/5, 0]ᵀ
For λ₂ = 9:  v₂ = [4/5, -3/5, 0]ᵀ
For λ₃ = 0:  v₃ = [0, 0, 1]ᵀ

V = ⎡ 3/5   4/5  0 ⎤
    ⎢ 4/5  -3/5  0 ⎥
    ⎣  0     0   1 ⎦
```

**Step 4: Compute U = AVΣ⁻¹**
```
Σ = ⎡ 5  0  0 ⎤
    ⎣ 0  3  0 ⎦  (2×3)

For first two columns (σ₃ = 0):
u₁ = Av₁/σ₁ = ... = [1, 0]ᵀ
u₂ = Av₂/σ₂ = ... = [0, 1]ᵀ

U = ⎡ 1  0 ⎤
    ⎣ 0  1 ⎦  (2×2, happens to be I!)
```

**Final SVD**:
```
A = UΣVᵀ

  = ⎡ 1  0 ⎤ ⎡ 5  0  0 ⎤ ⎡ 3/5   4/5  0 ⎤
    ⎣ 0  1 ⎦ ⎣ 0  3  0 ⎦ ⎢ 4/5  -3/5  0 ⎥
                           ⎣  0     0   1 ⎦
```

---

### Properties of SVD

**1. Singular values**:
```
σ₁ ≥ σ₂ ≥ ... ≥ σᵣ > 0

r = rank(A)
```

**2. Relationship to eigenvalues**:
```
Singular values of A = √(eigenvalues of AᵀA)
                     = √(eigenvalues of AAᵀ)
```

**3. Orthogonality**:
```
UᵀU = I
VᵀV = I

Columns of U are orthonormal
Columns of V are orthonormal
```

**4. Matrix norms**:
```
||A||₂ = σ₁  (largest singular value)
||A||_F = √(σ₁² + σ₂² + ... + σᵣ²)  (Frobenius norm)
```

**5. Rank**:
```
rank(A) = number of non-zero singular values
```

---

### Low-Rank Approximation

**Truncate to keep top k singular values**:
```
A ≈ Aₖ = Uₖ Σₖ Vₖᵀ

Where:
- Uₖ: first k columns of U
- Σₖ: top k×k block of Σ
- Vₖ: first k columns of V

This is the BEST rank-k approximation (Eckart-Young theorem)
Minimizes ||A - Aₖ||
```

**Example**:
```
Full SVD:
A = σ₁u₁v₁ᵀ + σ₂u₂v₂ᵀ + σ₃u₃v₃ᵀ

Rank-1 approximation (keep largest):
A₁ = σ₁u₁v₁ᵀ

Rank-2 approximation:
A₂ = σ₁u₁v₁ᵀ + σ₂u₂v₂ᵀ

Error (Frobenius norm):
||A - A₂|| = √(σ₃² + σ₄² + ...)
```

---

## PCA (Principal Component Analysis)

### What is PCA?

**Goal**: Find directions of maximum variance in data

```
PCA = dimensionality reduction using SVD/eigendecomposition

Steps:
1. Center data (subtract mean)
2. Compute covariance matrix (or use SVD directly)
3. Find eigenvectors (principal components)
4. Project data onto top-k components
```

**Intuition**:
```
Original data (2D):

    y
    |  *  *  *
    | *  *  *
    |*  *  *
    |________x

Points spread more along diagonal

PC1 (1st principal component): Direction of max variance
PC2 (2nd principal component): Direction of 2nd max variance
                               (orthogonal to PC1)

    PC2
     ↑
     |  *  *  *
     | *  *  *
     |*  *  *
     |________→ PC1

After projection to PC1 (1D):
    |  |  |
    *  *  *  (keeps most variance)
```

---

### PCA Algorithm (Covariance Method)

**Complete Step-by-step Example**:
```python
import numpy as np

# Step 0: Data (samples × features)
X = np.array([
    [2.5, 2.4],
    [0.5, 0.7],
    [2.2, 2.9],
    [1.9, 2.2],
    [3.1, 3.0],
    [2.3, 2.7],
    [2.0, 1.6],
    [1.0, 1.1],
    [1.5, 1.6],
    [1.1, 0.9]
])  # 10 samples, 2 features

# Step 1: Center data (subtract mean)
mean = np.mean(X, axis=0)
# mean = [1.81, 1.91]

X_centered = X - mean
# First row: [2.5-1.81, 2.4-1.91] = [0.69, 0.49]

# Step 2: Compute covariance matrix
n = X_centered.shape[0]
cov = (X_centered.T @ X_centered) / (n - 1)
# cov = [[0.616, 0.615],
#        [0.615, 0.717]]

# Step 3: Eigendecompose covariance
eigenvalues, eigenvectors = np.linalg.eig(cov)
# eigenvalues  = [1.284, 0.049]  (PC1 has 96% variance!)
# eigenvectors = [[-0.677, -0.735],  (columns are PCs)
#                 [-0.735,  0.677]]

# Step 4: Sort by eigenvalue (descending)
idx = eigenvalues.argsort()[::-1]
eigenvalues = eigenvalues[idx]
eigenvectors = eigenvectors[:, idx]

# PC1 = [-0.677, -0.735] (direction of max variance)
# PC2 = [-0.735,  0.677] (perpendicular)

# Step 5: Project data onto principal components
X_pca = X_centered @ eigenvectors

# To keep only k components:
k = 1
X_reduced = X_centered @ eigenvectors[:, :k]
# Shape: (10, 1) - reduced from 2D to 1D!

# Step 6: Explained variance
explained_var = eigenvalues / eigenvalues.sum()
# PC1: 96.3%, PC2: 3.7%

print(f"PC1 explains {explained_var[0]*100:.1f}% of variance")
```

---

### PCA via SVD (Direct Method)

**More numerically stable and efficient**:
```python
# Step 1: Center data
X_centered = X - np.mean(X, axis=0)

# Step 2: SVD (no need to form covariance matrix!)
U, S, Vt = np.linalg.svd(X_centered, full_matrices=False)

# Principal components = rows of Vt (or columns of V)
V = Vt.T  # V = eigenvectors of covariance

# Eigenvalues of covariance = (singular values)² / (n-1)
eigenvalues = (S ** 2) / (n - 1)

# Projected data
X_pca = U @ np.diag(S)
# Or equivalently: X_pca = X_centered @ V

# To reduce to k dimensions:
k = 1
X_reduced = X_centered @ V[:, :k]
```

**Why SVD is better**:
```
1. No need to form XᵀX (avoids numerical issues)
2. More stable for ill-conditioned matrices
3. Directly gives projections (U @ Σ)
4. Standard in scikit-learn
```

---

### PCA Example: Image Compression

```python
from sklearn.decomposition import PCA
import numpy as np

# Image as matrix (e.g., 100×100 grayscale)
image = np.random.randn(100, 100)  # Grayscale image

# Treat each row as a sample
# 100 samples (rows) × 100 features (columns)

# Apply PCA
pca = PCA(n_components=20)  # Keep 20 components
compressed = pca.fit_transform(image)
# Shape: (100, 20) - reduced from 100 to 20 dimensions!

# Reconstruct
reconstructed = pca.inverse_transform(compressed)
# Shape: (100, 100)

# Compression ratio
original_size = 100 * 100  # 10,000 values
compressed_size = 100 * 20  # 2,000 values
ratio = compressed_size / original_size
print(f"Compression: {ratio*100:.0f}% of original")

# Explained variance
print(f"Variance retained: {pca.explained_variance_ratio_.sum()*100:.1f}%")
```

---

### Choosing Number of Components

**Method 1: Explained Variance Threshold**
```python
# Keep components that explain 95% of variance
pca = PCA(n_components=0.95)  # Automatically chooses k
X_reduced = pca.fit_transform(X)

print(f"Kept {pca.n_components_} components")
```

**Method 2: Scree Plot**
```python
# Plot eigenvalues
import matplotlib.pyplot as plt

pca = PCA()
pca.fit(X)

plt.plot(range(1, len(pca.explained_variance_) + 1),
         pca.explained_variance_)
plt.xlabel('Principal Component')
plt.ylabel('Eigenvalue')
plt.title('Scree Plot')

# Look for "elbow" - where eigenvalues drop off
```

**Method 3: Cumulative Variance**
```python
cumsum = np.cumsum(pca.explained_variance_ratio_)
k = np.argmax(cumsum >= 0.95) + 1  # First k that exceeds 95%

print(f"Need {k} components for 95% variance")
```

---

## ML Applications

### 1. Dimensionality Reduction

**Problem**: High-dimensional data (curse of dimensionality)
```
Original: 1000 features
After PCA: 50 features (keeping 95% variance)

Benefits:
- Faster training
- Less overfitting
- Visualization (reduce to 2D/3D)
- Noise reduction
```

**Example**: MNIST digits (784 pixels → 50 PCs)
```python
from sklearn.decomposition import PCA
from sklearn.datasets import load_digits

# Load data
digits = load_digits()
X = digits.data  # (1797, 64) - 64 pixels

# PCA
pca = PCA(n_components=20)
X_reduced = pca.fit_transform(X)
# (1797, 20) - reduced to 20 dimensions

# Train classifier on reduced data (much faster!)
from sklearn.svm import SVC
clf = SVC()
clf.fit(X_reduced, digits.target)
```

---

### 2. Feature Extraction

**Create new features that capture most variance**:
```python
# Original features: [height, weight, age, ...]
# PCA features: [PC1, PC2, PC3, ...]

# PCs are linear combinations of original features
# PC1 might be "overall size"
# PC2 might be "age vs fitness"

# Interpretable in some domains:
# - PC1 in faces: average face
# - PC2 in faces: gender
# - PC3 in faces: expression
```

---

### 3. Noise Reduction (Denoising)

**Remove noise by keeping only top components**:
```python
# Noisy data
X_noisy = X_clean + noise

# PCA
pca = PCA(n_components=k)  # k < original dimensions
X_reduced = pca.fit_transform(X_noisy)
X_denoised = pca.inverse_transform(X_reduced)

# Noise is captured by small eigenvalues (discarded)
# Signal is captured by large eigenvalues (kept)
```

---

### 4. Anomaly Detection

**Points far from principal subspace are anomalies**:
```python
# Reconstruction error
pca = PCA(n_components=k)
pca.fit(X_normal)

# For new point
X_reduced = pca.transform(X_test)
X_reconstructed = pca.inverse_transform(X_reduced)

error = np.linalg.norm(X_test - X_reconstructed)

if error > threshold:
    print("Anomaly detected!")
```

---

### 5. Visualization (t-SNE preprocessing)

**Reduce to ~50 dimensions before t-SNE**:
```python
# High-dimensional data (e.g., 10,000 features)
# t-SNE is slow on high dimensions

# Step 1: PCA to ~50 dimensions
pca = PCA(n_components=50)
X_pca = pca.fit_transform(X)

# Step 2: t-SNE on reduced data (much faster!)
from sklearn.manifold import TSNE
tsne = TSNE(n_components=2)
X_2d = tsne.fit_transform(X_pca)

# Plot in 2D
plt.scatter(X_2d[:, 0], X_2d[:, 1], c=labels)
```

---

### 6. Eigenfaces (Face Recognition)

**Represent faces as linear combination of eigenfaces**:
```python
# Face images as vectors
# Each face: 100×100 = 10,000 dimensions

# PCA on faces
pca = PCA(n_components=100)
pca.fit(face_images)

# Eigenfaces = principal components
eigenfaces = pca.components_

# Each face ≈ mean_face + Σ(weight_i × eigenface_i)

# New face → compute weights → compare weights for recognition
```

---

### 7. Collaborative Filtering (Recommender Systems)

**Matrix factorization via SVD**:
```python
# User-Item matrix
# Rows: users, Columns: items, Values: ratings

R = np.array([
    [5, 3, 0, 1],  # User 1
    [4, 0, 0, 1],  # User 2
    [1, 1, 0, 5],  # User 3
    [1, 0, 0, 4],  # User 4
])

# SVD
U, S, Vt = np.linalg.svd(R, full_matrices=False)

# Low-rank approximation (k=2)
k = 2
R_approx = U[:, :k] @ np.diag(S[:k]) @ Vt[:k, :]

# Fill in missing ratings!
print(R_approx[0, 2])  # Predicted rating for User 1, Item 3
```

---

### 8. Feature Scaling (Whitening)

**Decorrelate and normalize features**:
```python
# PCA whitening
pca = PCA(whiten=True)
X_whitened = pca.fit_transform(X)

# Result:
# - Zero mean
# - Unit variance
# - Uncorrelated features (diagonal covariance)

# Covariance of whitened data = Identity matrix
print(np.allclose(np.cov(X_whitened.T), np.eye(n_features)))
# True
```

---

## Interview Questions

### Conceptual Questions

**Q1: What's the difference between eigenvectors and singular vectors?**
```
Eigenvectors:
- Only for square matrices
- Av = λv (same space input/output)
- May be complex
- Basis for eigendecomposition

Singular Vectors:
- For ANY matrix (m×n)
- Right singular vectors: v from AᵀA
- Left singular vectors: u from AAᵀ
- Always real (for real matrices)
- Always orthogonal
- Basis for SVD

Relationship:
- Right singular vectors of A = eigenvectors of AᵀA
- Left singular vectors of A = eigenvectors of AAᵀ
- Singular values = √eigenvalues of AᵀA (or AAᵀ)

For symmetric matrix A:
- Eigenvectors = singular vectors
- |Eigenvalues| = singular values
```

**Q2: Why does PCA use covariance matrix eigendecomposition?**
```
Goal: Find direction of maximum variance

Problem: max var(Xw) subject to ||w|| = 1

Solution:
var(Xw) = wᵀ(XᵀX)w / (n-1)
        = wᵀ(Cov)w

To maximize wᵀCw with ||w||=1:
→ w must be eigenvector of C with largest eigenvalue!

Eigenvalues of covariance = variance along principal components

First PC (largest eigenvalue) = direction of max variance
Second PC (2nd largest) = direction of max variance (orthogonal to first)
...

This is why PCA = eigendecomposition of covariance!
```

**Q3: When would you use SVD instead of eigendecomposition?**
```
Use SVD when:
1. Matrix is not square (eigendecomposition requires square)
2. Numerical stability matters (SVD more stable)
3. Working with data matrices directly (avoid forming XᵀX)
4. Need orthogonal factors (SVD always gives orthogonal U, V)
5. Low-rank approximation (truncated SVD)
6. Matrix completion/imputation

Use Eigendecomposition when:
1. Matrix is symmetric (eigen = SVD, more efficient)
2. Need spectral analysis
3. Solving differential equations
4. Theoretical analysis

In practice for PCA:
- Both give same result
- SVD is preferred (more stable)
- scikit-learn uses SVD
```

**Q4: What does it mean if eigenvalue is negative?**
```
Geometric meaning:
- Negative eigenvalue → reflection along that eigenvector
- Av = -|λ|v (flips direction)

For covariance matrices:
- Always positive semi-definite
- Eigenvalues ≥ 0 (variance can't be negative!)
- If eigenvalue = 0: no variance in that direction

For general matrices:
- Negative eigenvalues are fine
- Indicates flip/reflection in transformation

Example:
A = [[1,  0],     Eigenvalues: 1, -2
     [0, -2]]

- Along [1,0]: stretch by 1
- Along [0,1]: stretch by 2 AND flip

Complex eigenvalues:
- Come in conjugate pairs (for real matrices)
- Indicate rotation component
- |λ| = magnitude of scaling
- arg(λ) = rotation angle
```

---

### Coding Questions

**Q5: Implement PCA from scratch**
```python
def pca_scratch(X, n_components):
    """
    PCA implementation from scratch.

    Args:
        X: (n_samples, n_features) data matrix
        n_components: number of components to keep

    Returns:
        X_reduced: (n_samples, n_components) projected data
        components: (n_components, n_features) principal components
        explained_var: explained variance ratio
    """
    import numpy as np

    # Step 1: Center data
    mean = np.mean(X, axis=0)
    X_centered = X - mean

    # Step 2: Compute covariance matrix
    n_samples = X_centered.shape[0]
    cov = (X_centered.T @ X_centered) / (n_samples - 1)

    # Step 3: Eigendecomposition
    eigenvalues, eigenvectors = np.linalg.eig(cov)

    # Step 4: Sort by eigenvalue (descending)
    idx = eigenvalues.argsort()[::-1]
    eigenvalues = eigenvalues[idx]
    eigenvectors = eigenvectors[:, idx]

    # Step 5: Keep top k components
    components = eigenvectors[:, :n_components].T

    # Step 6: Project data
    X_reduced = X_centered @ components.T

    # Step 7: Explained variance
    explained_var = eigenvalues[:n_components] / eigenvalues.sum()

    return X_reduced, components, explained_var

# Test
X = np.random.randn(100, 5)
X_reduced, components, explained_var = pca_scratch(X, n_components=2)

print(f"Original shape: {X.shape}")
print(f"Reduced shape: {X_reduced.shape}")
print(f"Explained variance: {explained_var}")
```

**Q6: Implement SVD-based low-rank approximation**
```python
def low_rank_approx(A, k):
    """
    Compute best rank-k approximation of matrix A.

    Args:
        A: (m, n) matrix
        k: target rank

    Returns:
        A_k: best rank-k approximation
        error: Frobenius norm of error
    """
    import numpy as np

    # SVD
    U, S, Vt = np.linalg.svd(A, full_matrices=False)

    # Truncate to rank k
    U_k = U[:, :k]
    S_k = S[:k]
    Vt_k = Vt[:k, :]

    # Reconstruct
    A_k = U_k @ np.diag(S_k) @ Vt_k

    # Error (Frobenius norm)
    error = np.linalg.norm(A - A_k, 'fro')

    # Theoretical error = sqrt(sum of squared singular values > k)
    theoretical_error = np.sqrt(np.sum(S[k:]**2))

    return A_k, error, theoretical_error

# Test
A = np.random.randn(10, 8)
A_k, error, theoretical = low_rank_approx(A, k=3)

print(f"Original rank: {np.linalg.matrix_rank(A)}")
print(f"Approximation rank: {np.linalg.matrix_rank(A_k)}")
print(f"Error: {error:.4f}")
print(f"Theoretical: {theoretical:.4f}")
```

**Q7: Reconstruct data from PCA**
```python
def pca_reconstruct(X, n_components):
    """
    Reduce dimensionality and reconstruct.

    Shows information loss from dimensionality reduction.
    """
    from sklearn.decomposition import PCA
    import numpy as np

    # Fit PCA
    pca = PCA(n_components=n_components)

    # Transform (reduce)
    X_reduced = pca.fit_transform(X)

    # Inverse transform (reconstruct)
    X_reconstructed = pca.inverse_transform(X_reduced)

    # Reconstruction error
    error = np.linalg.norm(X - X_reconstructed, 'fro')
    relative_error = error / np.linalg.norm(X, 'fro')

    return X_reconstructed, error, relative_error

# Test
X = np.random.randn(100, 20)
X_recon, error, rel_error = pca_reconstruct(X, n_components=5)

print(f"Original shape: {X.shape}")
print(f"Components kept: 5")
print(f"Relative error: {rel_error*100:.2f}%")
```

**Q8: Find dominant eigenvector (Power Method)**
```python
def power_method(A, num_iterations=100):
    """
    Find dominant eigenvector using power method.

    Iteratively: v_{k+1} = Av_k / ||Av_k||
    Converges to eigenvector with largest |λ|.
    """
    import numpy as np

    # Random initial vector
    v = np.random.randn(A.shape[0])
    v = v / np.linalg.norm(v)

    for i in range(num_iterations):
        # Multiply by A
        v_new = A @ v

        # Normalize
        v_new = v_new / np.linalg.norm(v_new)

        # Check convergence
        if np.allclose(v, v_new) or np.allclose(v, -v_new):
            break

        v = v_new

    # Eigenvalue (Rayleigh quotient)
    lambda_max = v.T @ A @ v

    return lambda_max, v

# Test
A = np.array([[4, 2],
              [2, 4]])

lambda_max, v = power_method(A)
print(f"Dominant eigenvalue: {lambda_max:.4f}")
print(f"Dominant eigenvector: {v}")

# Verify
print(f"True: {np.linalg.eig(A)}")
```

---

## Quick Reference

### NumPy Functions
```python
import numpy as np

# Eigendecomposition (square matrix)
eigenvalues, eigenvectors = np.linalg.eig(A)

# SVD
U, S, Vt = np.linalg.svd(A, full_matrices=False)

# PCA (scikit-learn)
from sklearn.decomposition import PCA
pca = PCA(n_components=k)
X_reduced = pca.fit_transform(X)

# Attributes
pca.components_          # Principal components
pca.explained_variance_  # Eigenvalues
pca.explained_variance_ratio_  # % variance
pca.mean_               # Mean of training data

# Methods
pca.inverse_transform(X_reduced)  # Reconstruct
```

### Key Formulas
```
Eigenvectors:
Av = λv

Eigendecomposition (square):
A = QΛQ⁻¹

Eigendecomposition (symmetric):
A = QΛQᵀ  (Q orthogonal)

SVD:
A = UΣVᵀ

PCA:
1. Center: X_c = X - mean(X)
2. Cov = XᵀX / (n-1)
3. Eigen: Cov = QΛQᵀ
4. Project: X_pca = X_c @ Q

SVD-based PCA:
1. Center: X_c = X - mean(X)
2. SVD: X_c = UΣVᵀ
3. Project: X_pca = UΣ (or X_c @ V)

Properties:
trace(A) = Σλᵢ
det(A) = Πλᵢ
rank(A) = # non-zero singular values
```

---

## Summary

### Eigenvalues/Eigenvectors
- **What**: Special vectors that only scale under transformation
- **Why**: Reveal intrinsic structure, simplify computations
- **When**: Square matrices, especially symmetric (covariance)

### SVD
- **What**: Decompose any matrix into rotations + scaling
- **Why**: Most general decomposition, numerically stable
- **When**: Any matrix, especially for low-rank approximation

### PCA
- **What**: Find directions of maximum variance
- **Why**: Reduce dimensions while keeping information
- **When**: High-dimensional data, visualization, noise reduction

### Key Insight
All three are related:
- SVD generalizes eigendecomposition to non-square matrices
- PCA uses eigendecomposition (or SVD) of covariance matrix
- Singular values = √eigenvalues of AᵀA

---

**Complete!** You now have comprehensive notes on:
1. [Vectors](./vectors.md)
2. [Matrices Basics](./matrices-basics.md)
3. [Matrices Advanced](./matrices-advanced.md)
4. [Eigen/SVD](./eigen-svd.md) ← You are here
