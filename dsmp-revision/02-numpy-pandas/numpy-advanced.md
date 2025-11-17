# NumPy Advanced Topics

## Table of Contents
1. [Broadcasting](#broadcasting)
2. [Advanced Indexing](#advanced-indexing)
3. [Mathematical Operations](#mathematical-operations)
4. [Linear Algebra](#linear-algebra)
5. [Array Manipulation](#array-manipulation)
6. [Common Operations Cheat Sheet](#common-operations-cheat-sheet)
7. [Common Mistakes](#common-mistakes)
8. [Performance Tips](#performance-tips)

---

## Broadcasting

### What is Broadcasting?
Broadcasting allows NumPy to perform operations on arrays of different shapes. It automatically expands smaller arrays to match the shape of larger ones without copying data.

### Broadcasting Rules

```
Two dimensions are compatible when:
1. They are equal, OR
2. One of them is 1

Broadcasting happens from the rightmost dimension.
```

### Visual Example
```
Array Shapes:
┌─────────────────┬─────────────────┬───────────────┐
│ Array A         │ Array B         │ Result        │
├─────────────────┼─────────────────┼───────────────┤
│ (4, 3)          │ (3,)            │ (4, 3) ✓      │
│ (4, 3)          │ (4, 1)          │ (4, 3) ✓      │
│ (4, 3)          │ (1, 3)          │ (4, 3) ✓      │
│ (4, 3)          │ (4, 3)          │ (4, 3) ✓      │
│ (4, 3)          │ (3, 4)          │ Error ✗       │
│ (4, 3)          │ (4,)            │ Error ✗       │
└─────────────────┴─────────────────┴───────────────┘
```

### Basic Broadcasting Examples

```python
import numpy as np

# Example 1: Scalar with array
arr = np.array([1, 2, 3, 4, 5])
result = arr + 10
print(result)  # [11 12 13 14 15]

# Example 2: 1D array with 2D array
matrix = np.array([[1, 2, 3],
                   [4, 5, 6],
                   [7, 8, 9]])

row_vector = np.array([10, 20, 30])
result = matrix + row_vector
print(result)
# [[11 22 33]
#  [14 25 36]
#  [17 28 39]]

# Example 3: Column vector with 2D array
col_vector = np.array([[100],
                       [200],
                       [300]])
result = matrix + col_vector
print(result)
# [[101 102 103]
#  [204 205 206]
#  [307 308 309]]
```

### Broadcasting Visualization

```
1D + 2D Broadcasting:
─────────────────────────────────────
Original Arrays:
    Matrix (3x3)          Vector (3,)
    ┌─────────┐          ┌─────────┐
    │ 1  2  3 │          │ 10 20 30│
    │ 4  5  6 │          └─────────┘
    │ 7  8  9 │
    └─────────┘

After Broadcasting (conceptual):
    Matrix (3x3)        Broadcasted (3x3)
    ┌─────────┐          ┌─────────┐
    │ 1  2  3 │    +     │10 20 30 │
    │ 4  5  6 │          │10 20 30 │
    │ 7  8  9 │          │10 20 30 │
    └─────────┘          └─────────┘

Result:
    ┌──────────┐
    │11 22 33  │
    │14 25 36  │
    │17 28 39  │
    └──────────┘
```

### Real-World Example: Sales Analysis

```python
# Monthly sales for 4 products across 3 stores
# Shape: (3 stores, 4 products)
sales = np.array([
    [100, 200, 150, 300],  # Store 1
    [120, 180, 160, 280],  # Store 2
    [110, 190, 155, 290]   # Store 3
])

# Apply 10% discount to all products
discounted = sales * 0.9
print("After 10% discount:")
print(discounted)

# Different discount rates per product (broadcasting)
discount_rates = np.array([0.9, 0.85, 0.95, 0.8])  # Shape: (4,)
discounted_per_product = sales * discount_rates
print("\nProduct-specific discounts:")
print(discounted_per_product)
# [[ 90. 170. 142.5 240. ]
#  [108. 153. 152.  224. ]
#  [ 99. 161.5 147.25 232. ]]

# Store-specific bonus (column vector)
store_bonus = np.array([[50],   # Store 1
                        [30],   # Store 2
                        [40]])  # Store 3  Shape: (3, 1)
sales_with_bonus = sales + store_bonus
print("\nWith store bonuses:")
print(sales_with_bonus)
# [[150 250 200 350]
#  [150 210 190 310]
#  [150 230 195 330]]
```

### Complex Broadcasting Example

```python
# Temperature data: 7 days, 24 hours
np.random.seed(42)
temps = np.random.randint(15, 35, size=(7, 24))

# Calculate temperature anomaly from daily mean
daily_mean = temps.mean(axis=1, keepdims=True)  # Shape: (7, 1)
anomaly = temps - daily_mean  # Broadcasting!

print(f"Temperature shape: {temps.shape}")
print(f"Daily mean shape: {daily_mean.shape}")
print(f"Anomaly shape: {anomaly.shape}")
# Temperature shape: (7, 24)
# Daily mean shape: (7, 1)
# Anomaly shape: (7, 24)

# Normalize to Z-scores
std = temps.std(axis=1, keepdims=True)
z_scores = (temps - daily_mean) / std
```

---

## Advanced Indexing

### Fancy Indexing (Integer Array Indexing)

```python
import numpy as np

arr = np.array([10, 20, 30, 40, 50, 60, 70, 80, 90])

# Select specific indices
indices = [0, 2, 5, 8]
selected = arr[indices]
print(selected)  # [10 30 60 90]

# 2D fancy indexing
matrix = np.array([
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12]
])

# Select specific rows
rows = [0, 2]
selected_rows = matrix[rows]
print(selected_rows)
# [[ 1  2  3  4]
#  [ 9 10 11 12]]

# Select specific elements (row, col pairs)
rows = [0, 1, 2, 2]
cols = [0, 1, 2, 3]
elements = matrix[rows, cols]
print(elements)  # [1 6 11 12]
```

### Boolean Indexing Advanced

```python
# Sales data with product info
sales = np.array([120, 85, 200, 150, 90, 180, 110, 95])
products = np.array(['A', 'B', 'A', 'C', 'B', 'A', 'C', 'B'])

# Multiple conditions
high_sales_A = sales[(sales > 100) & (products == 'A')]
print(high_sales_A)  # [120 200 180]

# Using np.where for conditional selection
result = np.where(sales > 150, 'High', 'Low')
print(result)
# ['Low' 'Low' 'High' 'Low' 'Low' 'High' 'Low' 'Low']

# Get indices where condition is True
high_indices = np.where(sales > 150)
print(high_indices)  # (array([2, 5]),)
```

### ix_ for Grid Indexing

```python
# Product sales: 5 products x 12 months
np.random.seed(100)
monthly_sales = np.random.randint(50, 200, size=(5, 12))

# Select products 0, 2, 4 and months 0, 5, 11 (Q1, Q2 end, Q4 end)
products_idx = [0, 2, 4]
months_idx = [0, 5, 11]

# Using ix_ for grid indexing
result = monthly_sales[np.ix_(products_idx, months_idx)]
print(result.shape)  # (3, 3)
print(result)
# [[144  58 173]
#  [145 124 156]
#  [113 127 144]]
```

### Real-World Example: Student Grade Analysis

```python
# Student scores: 10 students x 5 subjects
np.random.seed(42)
scores = np.random.randint(40, 100, size=(10, 5))
student_names = np.array([f'Student_{i+1}' for i in range(10)])
subjects = ['Math', 'Physics', 'Chemistry', 'Biology', 'English']

# Find students who scored > 80 in Math (subject 0)
math_toppers_mask = scores[:, 0] > 80
math_toppers = student_names[math_toppers_mask]
print(f"Math toppers: {math_toppers}")

# Find all scores > 90 and their positions
high_scores_pos = np.where(scores > 90)
print(f"\nHigh scores (>90) positions:")
for student_idx, subject_idx in zip(*high_scores_pos):
    print(f"{student_names[student_idx]} - {subjects[subject_idx]}: {scores[student_idx, subject_idx]}")

# Select top 3 students (by average) and their Math & Physics scores
avg_scores = scores.mean(axis=1)
top3_indices = np.argsort(avg_scores)[-3:][::-1]  # Top 3 descending
subject_indices = [0, 1]  # Math, Physics

top_students_scores = scores[np.ix_(top3_indices, subject_indices)]
print(f"\nTop 3 students' Math & Physics scores:")
print(top_students_scores)
```

### Advanced Slicing with Step

```python
arr = np.arange(20)

# Every 3rd element
print(arr[::3])  # [ 0  3  6  9 12 15 18]

# Reverse every 2nd element
print(arr[::-2])  # [19 17 15 13 11  9  7  5  3  1]

# 2D slicing
matrix = np.arange(24).reshape(4, 6)
print(matrix)
# [[ 0  1  2  3  4  5]
#  [ 6  7  8  9 10 11]
#  [12 13 14 15 16 17]
#  [18 19 20 21 22 23]]

# Every other row, every other column
print(matrix[::2, ::2])
# [[ 0  2  4]
#  [12 14 16]]
```

---

## Mathematical Operations

### Universal Functions (ufuncs)

```python
import numpy as np

arr = np.array([1, 4, 9, 16, 25])

# Square root
sqrt_arr = np.sqrt(arr)
print(sqrt_arr)  # [1. 2. 3. 4. 5.]

# Power
power_arr = np.power(arr, 3)
print(power_arr)  # [1 64 729 4096 15625]

# Exponential and logarithm
exp_arr = np.exp([1, 2, 3])
print(exp_arr)  # [ 2.71828183  7.3890561  20.08553692]

log_arr = np.log([1, 10, 100])
print(log_arr)  # [0.         2.30258509 4.60517019]

# Trigonometric
angles = np.array([0, 30, 45, 60, 90])
radians = np.deg2rad(angles)
sin_vals = np.sin(radians)
print(sin_vals)
# [0.         0.5        0.70710678 0.8660254  1.        ]
```

### Statistical Functions

```python
# Sales data for analysis
sales_data = np.array([
    [120, 150, 180, 200, 165, 140, 190],  # Week 1
    [110, 145, 175, 195, 160, 135, 185],  # Week 2
    [125, 155, 185, 205, 170, 145, 195],  # Week 3
    [115, 150, 180, 200, 165, 140, 188]   # Week 4
])

# Descriptive statistics
print(f"Mean: {np.mean(sales_data):.2f}")
print(f"Median: {np.median(sales_data):.2f}")
print(f"Std Dev: {np.std(sales_data):.2f}")
print(f"Variance: {np.var(sales_data):.2f}")

# Percentiles
p25 = np.percentile(sales_data, 25)
p75 = np.percentile(sales_data, 75)
print(f"25th percentile: {p25}")
print(f"75th percentile: {p75}")
print(f"IQR: {p75 - p25}")

# Along specific axis
weekly_means = np.mean(sales_data, axis=1)
daily_means = np.mean(sales_data, axis=0)
print(f"Weekly averages: {weekly_means}")
print(f"Daily averages: {daily_means}")
```

### Aggregation Functions

```python
data = np.array([3, 7, 1, 9, 4, 2, 8, 5, 6])

# Basic aggregations
print(f"Sum: {np.sum(data)}")           # 45
print(f"Product: {np.prod(data)}")      # 362880
print(f"Cumsum: {np.cumsum(data)}")     # [ 3 10 11 20 24 26 34 39 45]
print(f"Cumprod: {np.cumprod(data)}")   # Large numbers

# Min/Max with indices
print(f"Min: {np.min(data)} at index {np.argmin(data)}")
print(f"Max: {np.max(data)} at index {np.argmax(data)}")

# Unique values
arr = np.array([1, 2, 2, 3, 3, 3, 4, 4, 4, 4])
unique, counts = np.unique(arr, return_counts=True)
print(f"Unique: {unique}")
print(f"Counts: {counts}")
# Unique: [1 2 3 4]
# Counts: [1 2 3 4]
```

### Correlation and Covariance

```python
# Stock prices (days x stocks)
np.random.seed(42)
stock_A = np.random.randn(100) * 10 + 100
stock_B = stock_A * 0.8 + np.random.randn(100) * 5  # Correlated
stock_C = np.random.randn(100) * 10 + 100  # Uncorrelated

stocks = np.column_stack([stock_A, stock_B, stock_C])

# Correlation matrix
corr_matrix = np.corrcoef(stocks.T)
print("Correlation Matrix:")
print(corr_matrix)
# [[1.         0.94... 0.02...]
#  [0.94...    1.      0.10...]
#  [0.02...    0.10... 1.     ]]

# Covariance matrix
cov_matrix = np.cov(stocks.T)
print("\nCovariance Matrix:")
print(cov_matrix)
```

### Sorting and Searching

```python
arr = np.array([3, 7, 1, 9, 4, 2, 8, 5, 6])

# Sort (returns new array)
sorted_arr = np.sort(arr)
print(sorted_arr)  # [1 2 3 4 5 6 7 8 9]

# Argsort (returns indices)
indices = np.argsort(arr)
print(indices)  # [2 5 0 4 7 8 1 6 3]
print(arr[indices])  # [1 2 3 4 5 6 7 8 9]

# Sort along axis
matrix = np.array([[3, 7, 1],
                   [9, 4, 2],
                   [8, 5, 6]])

# Sort each row
sorted_rows = np.sort(matrix, axis=1)
print(sorted_rows)
# [[1 3 7]
#  [2 4 9]
#  [5 6 8]]

# Partition (k smallest elements)
arr = np.array([3, 7, 1, 9, 4, 2, 8, 5, 6])
k = 3
partitioned = np.partition(arr, k)
print(f"3 smallest: {partitioned[:k]}")  # [1 2 3] (not sorted)

# Searchsorted (find insertion index)
sorted_arr = np.array([1, 3, 5, 7, 9])
idx = np.searchsorted(sorted_arr, [2, 6, 10])
print(idx)  # [1 3 5]
```

---

## Linear Algebra

### Matrix Operations

```python
import numpy as np

# Matrix creation
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# Matrix multiplication
C = np.dot(A, B)
# or
C = A @ B
print(C)
# [[19 22]
#  [43 50]]

# Element-wise multiplication (Hadamard product)
D = A * B
print(D)
# [[ 5 12]
#  [21 32]]

# Transpose
print(A.T)
# [[1 3]
#  [2 4]]

# Trace (sum of diagonal)
trace = np.trace(A)
print(trace)  # 5

# Determinant
det = np.linalg.det(A)
print(det)  # -2.0

# Inverse
inv_A = np.linalg.inv(A)
print(inv_A)
# [[-2.   1. ]
#  [ 1.5 -0.5]]

# Verify inverse
print(A @ inv_A)  # Identity matrix (with floating point errors)
# [[1. 0.]
#  [0. 1.]]
```

### Eigenvalues and Eigenvectors

```python
A = np.array([[4, 2], [1, 3]])

# Eigenvalues and eigenvectors
eigenvalues, eigenvectors = np.linalg.eig(A)
print(f"Eigenvalues: {eigenvalues}")
print(f"Eigenvectors:\n{eigenvectors}")

# Verify: A @ v = λ @ v
for i in range(len(eigenvalues)):
    lambda_i = eigenvalues[i]
    v_i = eigenvectors[:, i]
    print(f"A @ v{i} = {A @ v_i}")
    print(f"λ{i} * v{i} = {lambda_i * v_i}")
```

### Solving Linear Systems

```python
# System of equations:
# 2x + 3y = 8
# 5x + 4y = 13

A = np.array([[2, 3], [5, 4]])
b = np.array([8, 13])

# Solve Ax = b
x = np.linalg.solve(A, b)
print(f"Solution: x = {x}")  # [1. 2.]

# Verify
print(f"Verification: A @ x = {A @ x}")  # [8. 13.]
```

### Matrix Decomposition

```python
# SVD (Singular Value Decomposition)
A = np.array([[1, 2, 3],
              [4, 5, 6],
              [7, 8, 9]])

U, s, Vt = np.linalg.svd(A)
print(f"U shape: {U.shape}")
print(f"Singular values: {s}")
print(f"Vt shape: {Vt.shape}")

# QR decomposition
Q, R = np.linalg.qr(A)
print(f"Q (orthogonal):\n{Q}")
print(f"R (upper triangular):\n{R}")
```

### Real-World Example: Portfolio Optimization

```python
# Returns for 3 stocks over 5 periods
returns = np.array([
    [0.05, 0.03, 0.07],  # Period 1
    [0.02, -0.01, 0.04], # Period 2
    [0.06, 0.05, 0.08],  # Period 3
    [-0.02, 0.01, 0.03], # Period 4
    [0.04, 0.02, 0.06]   # Period 5
])

# Calculate covariance matrix
cov_matrix = np.cov(returns.T)
print("Covariance Matrix:")
print(cov_matrix)

# Mean returns
mean_returns = np.mean(returns, axis=0)
print(f"\nMean Returns: {mean_returns}")

# Portfolio weights (must sum to 1)
weights = np.array([0.4, 0.3, 0.3])

# Portfolio return
portfolio_return = np.dot(weights, mean_returns)
print(f"Portfolio Return: {portfolio_return:.4f}")

# Portfolio variance
portfolio_variance = weights @ cov_matrix @ weights
print(f"Portfolio Variance: {portfolio_variance:.6f}")
print(f"Portfolio Std Dev: {np.sqrt(portfolio_variance):.6f}")
```

---

## Array Manipulation

### Reshaping

```python
arr = np.arange(12)
print(arr)  # [ 0  1  2  3  4  5  6  7  8  9 10 11]

# Reshape to 2D
reshaped = arr.reshape(3, 4)
print(reshaped)
# [[ 0  1  2  3]
#  [ 4  5  6  7]
#  [ 8  9 10 11]]

# Reshape to 3D
reshaped_3d = arr.reshape(2, 3, 2)
print(reshaped_3d)
# [[[ 0  1]
#   [ 2  3]
#   [ 4  5]]
#  [[ 6  7]
#   [ 8  9]
#   [10 11]]]

# Auto-calculate dimension with -1
reshaped = arr.reshape(3, -1)  # -1 means "figure it out"
print(reshaped.shape)  # (3, 4)

# Flatten
flattened = reshaped.flatten()
print(flattened)  # [ 0  1  2  3  4  5  6  7  8  9 10 11]

# Ravel (returns view when possible)
raveled = reshaped.ravel()
```

### Stacking and Splitting

```python
a = np.array([[1, 2], [3, 4]])
b = np.array([[5, 6], [7, 8]])

# Vertical stacking (row-wise)
v_stack = np.vstack([a, b])
print(v_stack)
# [[1 2]
#  [3 4]
#  [5 6]
#  [7 8]]

# Horizontal stacking (column-wise)
h_stack = np.hstack([a, b])
print(h_stack)
# [[1 2 5 6]
#  [3 4 7 8]]

# Depth stacking
d_stack = np.dstack([a, b])
print(d_stack.shape)  # (2, 2, 2)

# Concatenate (more general)
concat_rows = np.concatenate([a, b], axis=0)  # Same as vstack
concat_cols = np.concatenate([a, b], axis=1)  # Same as hstack

# Splitting
arr = np.arange(12).reshape(3, 4)
print(arr)
# [[ 0  1  2  3]
#  [ 4  5  6  7]
#  [ 8  9 10 11]]

# Split into 3 parts along axis 0
parts = np.split(arr, 3, axis=0)
for i, part in enumerate(parts):
    print(f"Part {i}:\n{part}")

# Split columns
col_parts = np.split(arr, 2, axis=1)  # Split into 2 parts
```

### Adding/Removing Dimensions

```python
arr = np.array([1, 2, 3, 4, 5])
print(arr.shape)  # (5,)

# Add dimension using newaxis
arr_2d = arr[np.newaxis, :]  # Row vector
print(arr_2d.shape)  # (1, 5)

arr_2d = arr[:, np.newaxis]  # Column vector
print(arr_2d.shape)  # (5, 1)

# Using reshape
arr_2d = arr.reshape(1, -1)  # Row vector
arr_2d = arr.reshape(-1, 1)  # Column vector

# Squeeze (remove single-dimensional entries)
arr_squeezed = np.squeeze(arr_2d)
print(arr_squeezed.shape)  # (5,)
```

### Repeating and Tiling

```python
arr = np.array([1, 2, 3])

# Repeat each element
repeated = np.repeat(arr, 3)
print(repeated)  # [1 1 1 2 2 2 3 3 3]

# Tile entire array
tiled = np.tile(arr, 3)
print(tiled)  # [1 2 3 1 2 3 1 2 3]

# 2D tiling
tiled_2d = np.tile(arr, (2, 3))
print(tiled_2d)
# [[1 2 3 1 2 3 1 2 3]
#  [1 2 3 1 2 3 1 2 3]]
```

---

## Common Operations Cheat Sheet

```
┌──────────────────────────────┬─────────────────────────────────┐
│ Operation                    │ Code                            │
├──────────────────────────────┼─────────────────────────────────┤
│ BROADCASTING                 │                                 │
│ Scalar operation             │ arr + 10                        │
│ Row-wise operation           │ matrix + row_vector             │
│ Column-wise operation        │ matrix + col_vector             │
│ keepdims for broadcasting    │ arr.mean(axis=1, keepdims=True) │
├──────────────────────────────┼─────────────────────────────────┤
│ ADVANCED INDEXING            │                                 │
│ Fancy indexing               │ arr[[0, 2, 5]]                  │
│ Boolean indexing             │ arr[arr > 10]                   │
│ Where condition              │ np.where(arr > 10, 'High', 'Low')│
│ Grid indexing                │ arr[np.ix_([0,2], [1,3])]       │
├──────────────────────────────┼─────────────────────────────────┤
│ MATHEMATICAL                 │                                 │
│ Square root                  │ np.sqrt(arr)                    │
│ Power                        │ np.power(arr, 3)                │
│ Exponential                  │ np.exp(arr)                     │
│ Logarithm                    │ np.log(arr)                     │
│ Trigonometric                │ np.sin/cos/tan(arr)             │
│ Degrees/Radians              │ np.deg2rad/rad2deg(arr)         │
├──────────────────────────────┼─────────────────────────────────┤
│ STATISTICAL                  │                                 │
│ Percentile                   │ np.percentile(arr, 75)          │
│ Correlation                  │ np.corrcoef(arr)                │
│ Covariance                   │ np.cov(arr)                     │
│ Unique values                │ np.unique(arr, return_counts=True)│
├──────────────────────────────┼─────────────────────────────────┤
│ SORTING                      │                                 │
│ Sort array                   │ np.sort(arr)                    │
│ Sort indices                 │ np.argsort(arr)                 │
│ Partition                    │ np.partition(arr, k)            │
│ Search sorted                │ np.searchsorted(arr, value)     │
├──────────────────────────────┼─────────────────────────────────┤
│ LINEAR ALGEBRA               │                                 │
│ Matrix multiply              │ A @ B or np.dot(A, B)           │
│ Transpose                    │ A.T                             │
│ Inverse                      │ np.linalg.inv(A)                │
│ Determinant                  │ np.linalg.det(A)                │
│ Eigenvalues                  │ np.linalg.eig(A)                │
│ Solve Ax=b                   │ np.linalg.solve(A, b)           │
│ SVD                          │ np.linalg.svd(A)                │
├──────────────────────────────┼─────────────────────────────────┤
│ ARRAY MANIPULATION           │                                 │
│ Reshape                      │ arr.reshape(3, 4)               │
│ Flatten                      │ arr.flatten()                   │
│ Ravel                        │ arr.ravel()                     │
│ Transpose                    │ arr.T                           │
│ Stack vertically             │ np.vstack([a, b])               │
│ Stack horizontally           │ np.hstack([a, b])               │
│ Concatenate                  │ np.concatenate([a, b], axis=0)  │
│ Split                        │ np.split(arr, n)                │
│ Repeat                       │ np.repeat(arr, 3)               │
│ Tile                         │ np.tile(arr, 3)                 │
│ Add dimension                │ arr[np.newaxis, :]              │
│ Remove dimension             │ np.squeeze(arr)                 │
└──────────────────────────────┴─────────────────────────────────┘
```

---

## Common Mistakes

### 1. Broadcasting Shape Mismatch

```python
# MISTAKE: Incompatible shapes
a = np.array([[1, 2, 3],
              [4, 5, 6]])  # (2, 3)
b = np.array([1, 2])       # (2,)

# This will ERROR!
# result = a + b  # ValueError: operands could not be broadcast together

# CORRECT: Reshape b to match
b_reshaped = b[:, np.newaxis]  # (2, 1)
result = a + b_reshaped
print(result)
# [[2 3 4]
#  [6 7 8]]
```

### 2. Integer Division Precision Loss

```python
# MISTAKE: Integer array division
arr = np.array([1, 2, 3, 4, 5])
result = arr / 2
# Result is float, but be careful with integer arrays

# Be explicit about data types
arr_float = arr.astype(float)
result = arr_float / 2
```

### 3. Incorrect Axis Parameter

```python
data = np.array([[1, 2, 3],
                 [4, 5, 6]])

# MISTAKE: Wrong axis for desired operation
row_sums = np.sum(data, axis=0)  # Sums columns!
print(row_sums)  # [5 7 9]

# CORRECT: axis=1 for row sums
row_sums = np.sum(data, axis=1)
print(row_sums)  # [ 6 15]
```

### 4. Forgetting keepdims for Broadcasting

```python
data = np.array([[1, 2, 3],
                 [4, 5, 6],
                 [7, 8, 9]])

# MISTAKE: Shape incompatible for broadcasting
row_means = np.mean(data, axis=1)
print(row_means.shape)  # (3,)
# normalized = data - row_means  # ERROR!

# CORRECT: Use keepdims
row_means = np.mean(data, axis=1, keepdims=True)
print(row_means.shape)  # (3, 1)
normalized = data - row_means  # Works!
```

### 5. Matrix vs Element-wise Multiplication

```python
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# Element-wise (Hadamard)
elem_mult = A * B
print(elem_mult)
# [[ 5 12]
#  [21 32]]

# Matrix multiplication
matrix_mult = A @ B
print(matrix_mult)
# [[19 22]
#  [43 50]]

# Don't confuse them!
```

### 6. Modifying Views vs Copies

```python
arr = np.array([1, 2, 3, 4, 5])

# Slicing creates a view
view = arr[1:4]
view[0] = 999
print(arr)  # [1 999 3 4 5] - Original changed!

# Fancy indexing creates a copy
copy = arr[[1, 2, 3]]
copy[0] = 888
print(arr)  # [1 999 3 4 5] - Original unchanged
```

---

## Performance Tips

### 1. Use Broadcasting Instead of Loops

```python
import time

# SLOW: Loop
matrix = np.random.random((1000, 1000))
vector = np.random.random(1000)

start = time.time()
result = np.zeros_like(matrix)
for i in range(matrix.shape[0]):
    result[i] = matrix[i] * vector
loop_time = time.time() - start

# FAST: Broadcasting
start = time.time()
result = matrix * vector
broadcast_time = time.time() - start

print(f"Loop: {loop_time:.4f}s, Broadcasting: {broadcast_time:.4f}s")
# Loop: 0.0500s, Broadcasting: 0.0010s (50x faster!)
```

### 2. Use einsum for Complex Operations

```python
A = np.random.random((100, 100))
B = np.random.random((100, 100))

# Matrix multiplication
result1 = A @ B
result2 = np.einsum('ij,jk->ik', A, B)  # Often faster

# Batch matrix operations
batch_A = np.random.random((100, 50, 50))
batch_B = np.random.random((100, 50, 50))

# Batch matrix multiply (element-wise for each of 100 matrices)
result = np.einsum('bij,bjk->bik', batch_A, batch_B)
```

### 3. Avoid Unnecessary Copies

```python
# SLOW: Creates copies
arr = np.arange(1000000)
arr_copy = arr.copy()
result = arr_copy * 2

# FAST: In-place when possible
arr = np.arange(1000000)
arr *= 2  # Modifies in-place
```

### 4. Use Appropriate dtypes

```python
# Large array of small integers
# BAD: Uses int64 (8 bytes per element)
arr_large = np.arange(1000000, dtype=np.int64)
print(f"Memory: {arr_large.nbytes / 1e6:.2f} MB")

# GOOD: Uses int16 (2 bytes per element)
arr_small = np.arange(1000000, dtype=np.int16)
print(f"Memory: {arr_small.nbytes / 1e6:.2f} MB")
# Memory reduced by 75%!
```

### 5. Vectorize Custom Functions

```python
# SLOW: Python loop
def custom_func(x):
    return x ** 2 + 2 * x + 1

arr = np.arange(1000000)
result = np.array([custom_func(x) for x in arr])

# FAST: Vectorized version
def custom_func_vectorized(x):
    return x ** 2 + 2 * x + 1

result = custom_func_vectorized(arr)  # Works on entire array!

# For truly complex functions, use np.vectorize
@np.vectorize
def complex_func(x):
    if x > 100:
        return x ** 2
    else:
        return x + 10

result = complex_func(arr)
```

### 6. Use numexpr for Complex Expressions

```python
import numpy as np
# import numexpr as ne  # Install: pip install numexpr

a = np.random.random(1000000)
b = np.random.random(1000000)
c = np.random.random(1000000)

# NumPy (creates temporary arrays)
result = a * b + c * a - b ** 2

# numexpr (faster for complex expressions)
# result = ne.evaluate('a * b + c * a - b ** 2')
# Can be 2-3x faster for large arrays!
```

---

## Summary

### Key Takeaways

1. **Broadcasting** eliminates the need for loops and temporary arrays
2. **Advanced indexing** provides powerful ways to select and modify data
3. **Mathematical operations** are vectorized and highly optimized
4. **Linear algebra** operations are essential for machine learning
5. **Array manipulation** functions provide flexibility in data reshaping
6. **Always consider memory** and computational efficiency
7. **Use appropriate data types** to save memory
8. **Vectorize operations** whenever possible

### Performance Hierarchy
```
Fastest to Slowest:
1. Vectorized NumPy operations
2. Broadcasting
3. Built-in NumPy functions
4. np.vectorize
5. Python loops with NumPy
6. Pure Python loops
```

### Next Steps
- Move to `pandas-series.md` to learn Pandas Series
- Practice complex broadcasting scenarios
- Explore specialized NumPy functions for your domain (financial, scientific, etc.)

---

**Master these advanced NumPy concepts, and you'll handle any numerical computing task with ease!**
