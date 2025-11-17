# NumPy Fundamentals

## Table of Contents
1. [NumPy Arrays Basics](#numpy-arrays-basics)
2. [Array Attributes](#array-attributes)
3. [Array Creation Methods](#array-creation-methods)
4. [Basic Array Operations](#basic-array-operations)
5. [Indexing and Slicing](#indexing-and-slicing)
6. [Common Operations Cheat Sheet](#common-operations-cheat-sheet)
7. [Common Mistakes](#common-mistakes)
8. [Performance Tips](#performance-tips)

---

## NumPy Arrays Basics

### What is NumPy?
NumPy (Numerical Python) is the fundamental package for scientific computing in Python. It provides support for large, multi-dimensional arrays and matrices, along with mathematical functions.

### Why NumPy over Python Lists?
```
Performance Comparison:
┌─────────────────────┬──────────────┬──────────────┐
│ Operation           │ Python List  │ NumPy Array  │
├─────────────────────┼──────────────┼──────────────┤
│ Sum 1M numbers      │ 100ms        │ 5ms          │
│ Element-wise ops    │ Loop needed  │ Vectorized   │
│ Memory efficiency   │ 28 bytes/int │ 4 bytes/int  │
│ Mathematical ops    │ Manual       │ Built-in     │
└─────────────────────┴──────────────┴──────────────┘
```

### Creating NumPy Arrays

```python
import numpy as np

# From Python list
arr = np.array([1, 2, 3, 4, 5])
print(arr)  # [1 2 3 4 5]

# 2D array (matrix)
matrix = np.array([[1, 2, 3],
                   [4, 5, 6],
                   [7, 8, 9]])
print(matrix)
# [[1 2 3]
#  [4 5 6]
#  [7 8 9]]

# 3D array
arr_3d = np.array([[[1, 2], [3, 4]],
                   [[5, 6], [7, 8]]])
```

---

## Array Attributes

### Essential Attributes

```python
import numpy as np

# Sample array
sales_data = np.array([[100, 150, 200],
                       [120, 180, 210],
                       [90, 160, 190],
                       [110, 170, 205]])

# Shape: dimensions of array
print(sales_data.shape)  # (4, 3) - 4 rows, 3 columns

# ndim: number of dimensions
print(sales_data.ndim)  # 2

# size: total number of elements
print(sales_data.size)  # 12

# dtype: data type of elements
print(sales_data.dtype)  # int64

# itemsize: size in bytes of each element
print(sales_data.itemsize)  # 8 bytes

# nbytes: total bytes consumed
print(sales_data.nbytes)  # 96 bytes (12 * 8)
```

### Array Attributes Summary Table
```
┌────────────────┬─────────────────────────────────────────┐
│ Attribute      │ Description                             │
├────────────────┼─────────────────────────────────────────┤
│ .shape         │ Tuple of array dimensions               │
│ .ndim          │ Number of array dimensions              │
│ .size          │ Total number of elements                │
│ .dtype         │ Data type of elements                   │
│ .itemsize      │ Size (bytes) of each element            │
│ .nbytes        │ Total bytes consumed by array           │
│ .T             │ Transposed array                        │
└────────────────┴─────────────────────────────────────────┘
```

---

## Array Creation Methods

### 1. Using Built-in Functions

```python
import numpy as np

# Zeros array
zeros = np.zeros((3, 4))
# [[0. 0. 0. 0.]
#  [0. 0. 0. 0.]
#  [0. 0. 0. 0.]]

# Ones array
ones = np.ones((2, 3))
# [[1. 1. 1.]
#  [1. 1. 1.]]

# Empty array (uninitialized - faster)
empty = np.empty((2, 2))

# Full array (custom value)
full = np.full((3, 3), 7)
# [[7 7 7]
#  [7 7 7]
#  [7 7 7]]

# Identity matrix
identity = np.eye(4)
# [[1. 0. 0. 0.]
#  [0. 1. 0. 0.]
#  [0. 0. 1. 0.]
#  [0. 0. 0. 1.]]
```

### 2. Using Ranges

```python
# arange: similar to Python range()
arr = np.arange(0, 10, 2)
# [0 2 4 6 8]

# linspace: evenly spaced values
arr = np.linspace(0, 1, 5)
# [0.   0.25 0.5  0.75 1.  ]

# logspace: logarithmically spaced
arr = np.logspace(0, 2, 5)
# [  1.           3.16227766  10.          31.6227766  100.        ]
```

### 3. Random Arrays

```python
# Set seed for reproducibility
np.random.seed(42)

# Random floats [0, 1)
rand = np.random.random((3, 3))

# Random integers
randint = np.random.randint(1, 100, size=(3, 4))

# Normal distribution (mean=0, std=1)
normal = np.random.randn(1000)

# Normal distribution (custom mean, std)
custom_normal = np.random.normal(100, 15, size=1000)

# Random choice from array
choices = np.random.choice([10, 20, 30, 40], size=10)
```

### Real-World Example: Sales Data Generation

```python
# Generate synthetic sales data for 30 days, 5 products
np.random.seed(123)

products = ['Laptop', 'Phone', 'Tablet', 'Headphones', 'Mouse']
days = 30

# Sales quantities (0-50 units per day)
sales_quantities = np.random.randint(0, 51, size=(days, len(products)))

# Prices in dollars
prices = np.array([1000, 800, 500, 150, 25])

# Revenue calculation (broadcasting)
daily_revenue = sales_quantities * prices

print("Sales quantities (first 5 days):")
print(sales_quantities[:5])
# [[47 38 37 12 25]
#  [36 21 15 28  7]
#  [33 40 41 29 38]
#  [27 48 26 40 20]
#  [41 30 10  5 38]]
```

---

## Basic Array Operations

### Element-wise Operations

```python
import numpy as np

prices = np.array([100, 200, 150, 300])
quantities = np.array([5, 3, 8, 2])

# Element-wise multiplication
revenue = prices * quantities
# [500 600 1200 600]

# Element-wise addition
new_prices = prices + 50
# [150 250 200 350]

# Element-wise division
price_per_unit = revenue / quantities
# [100. 200. 150. 300.]

# Power
squared = prices ** 2
# [10000 40000 22500 90000]
```

### Mathematical Functions

```python
data = np.array([1, 4, 9, 16, 25])

# Square root
sqrt_data = np.sqrt(data)
# [1. 2. 3. 4. 5.]

# Exponential
exp_data = np.exp(data)

# Logarithm
log_data = np.log(data)

# Trigonometric
angles = np.array([0, 30, 45, 60, 90])
radians = np.radians(angles)
sin_values = np.sin(radians)
```

### Aggregation Functions

```python
sales = np.array([120, 150, 180, 200, 165, 140, 190])

# Sum
total = np.sum(sales)  # 1145

# Mean
average = np.mean(sales)  # 163.57

# Median
median = np.median(sales)  # 165.0

# Standard deviation
std = np.std(sales)  # 26.98

# Min and Max
min_sale = np.min(sales)  # 120
max_sale = np.max(sales)  # 200

# Argmin and Argmax (indices)
min_idx = np.argmin(sales)  # 0
max_idx = np.argmax(sales)  # 3
```

### Multi-dimensional Aggregations

```python
# Sales data: 4 weeks x 7 days
weekly_sales = np.array([
    [100, 120, 110, 150, 160, 200, 180],  # Week 1
    [105, 125, 115, 155, 165, 205, 185],  # Week 2
    [110, 130, 120, 160, 170, 210, 190],  # Week 3
    [115, 135, 125, 165, 175, 215, 195]   # Week 4
])

# Total sales across all weeks
total = np.sum(weekly_sales)  # 5880

# Total sales per week (sum along axis=1, columns)
weekly_totals = np.sum(weekly_sales, axis=1)
# [1020 1055 1090 1125]

# Total sales per day of week (sum along axis=0, rows)
daily_totals = np.sum(weekly_sales, axis=0)
# [430 510 470 630 670 830 750]

# Average sales per day
avg_per_day = np.mean(weekly_sales, axis=0)
# [107.5 127.5 117.5 157.5 167.5 207.5 187.5]
```

### Axis Visualization
```
For 2D array (4x7):
┌─────────────────────────────────┐
│  axis=1 →                       │
│  ┌─────┬─────┬─────┬─────┐     │
│  │ 100 │ 120 │ 110 │ ... │     │
│  ├─────┼─────┼─────┼─────┤     │
│  │ 105 │ 125 │ 115 │ ... │     │
│  ├─────┼─────┼─────┼─────┤     │
│  │ 110 │ 130 │ 120 │ ... │     │
│  ├─────┼─────┼─────┼─────┤     │
│  │ 115 │ 135 │ 125 │ ... │     │
│  └─────┴─────┴─────┴─────┘     │
│    ↓                             │
│  axis=0                         │
└─────────────────────────────────┘

axis=0: Operations down rows (column-wise)
axis=1: Operations across columns (row-wise)
```

---

## Indexing and Slicing

### 1D Array Indexing

```python
prices = np.array([100, 200, 150, 300, 250, 180])

# Single element
print(prices[0])    # 100 (first)
print(prices[-1])   # 180 (last)
print(prices[2])    # 150 (third)

# Slicing [start:stop:step]
print(prices[1:4])  # [200 150 300]
print(prices[:3])   # [100 200 150] (first 3)
print(prices[3:])   # [300 250 180] (from 4th onward)
print(prices[::2])  # [100 150 250] (every 2nd element)
print(prices[::-1]) # [180 250 300 150 200 100] (reversed)
```

### 2D Array Indexing

```python
# Product sales: 3 products x 4 quarters
sales = np.array([
    [100, 120, 140, 160],  # Product A
    [200, 220, 240, 260],  # Product B
    [150, 170, 190, 210]   # Product C
])

# Single element [row, column]
print(sales[0, 0])      # 100 (Product A, Q1)
print(sales[1, 2])      # 240 (Product B, Q3)
print(sales[-1, -1])    # 210 (Product C, Q4)

# Entire row
print(sales[0])         # [100 120 140 160] (Product A all quarters)
print(sales[1, :])      # [200 220 240 260] (Product B all quarters)

# Entire column
print(sales[:, 0])      # [100 200 150] (All products Q1)
print(sales[:, -1])     # [160 260 210] (All products Q4)

# Subarray
print(sales[0:2, 1:3])  # Products A&B, Q2&Q3
# [[120 140]
#  [220 240]]

# Multiple rows/columns
print(sales[[0, 2], :]) # Products A&C, all quarters
# [[100 120 140 160]
#  [150 170 190 210]]
```

### Boolean Indexing

```python
prices = np.array([100, 200, 150, 300, 250, 180, 90])

# Boolean mask
mask = prices > 150
print(mask)
# [False  True False  True  True  True False]

# Filter using mask
high_prices = prices[mask]
print(high_prices)  # [200 300 250 180]

# One-liner
expensive = prices[prices > 200]
print(expensive)  # [300 250]

# Complex conditions
moderate = prices[(prices >= 150) & (prices <= 250)]
print(moderate)  # [200 150 250 180]
```

### Real-World Example: Sales Analysis

```python
# Daily sales data
sales_data = np.array([
    [120, 150, 180, 200, 165, 140, 190],  # Week 1
    [110, 145, 175, 195, 160, 135, 185],  # Week 2
    [125, 155, 185, 205, 170, 145, 195],  # Week 3
])

# Find all days with sales > 170
high_sales_days = sales_data[sales_data > 170]
print(f"High sales days: {high_sales_days}")
# [180 200 190 175 195 185 205 170 185 195]

# Replace sales < 140 with 140 (minimum threshold)
sales_adjusted = sales_data.copy()
sales_adjusted[sales_adjusted < 140] = 140
print(sales_adjusted)
# [[140 150 180 200 165 140 190]
#  [140 145 175 195 160 140 185]
#  [140 155 185 205 170 145 195]]

# Find positions where sales > 180
positions = np.where(sales_data > 180)
print(f"Rows: {positions[0]}, Cols: {positions[1]}")
# Rows: [0 0 1 2 2 2], Cols: [3 6 3 3 4 6]
```

---

## Common Operations Cheat Sheet

```
┌──────────────────────────┬─────────────────────────────────────┐
│ Operation                │ Code                                │
├──────────────────────────┼─────────────────────────────────────┤
│ Create array             │ np.array([1, 2, 3])                 │
│ Create zeros             │ np.zeros((3, 4))                    │
│ Create ones              │ np.ones((2, 3))                     │
│ Create range             │ np.arange(0, 10, 2)                 │
│ Create evenly spaced     │ np.linspace(0, 1, 5)                │
│ Random array             │ np.random.random((3, 3))            │
│ Random integers          │ np.random.randint(1, 100, (3, 4))   │
│ Identity matrix          │ np.eye(4)                           │
├──────────────────────────┼─────────────────────────────────────┤
│ Shape                    │ arr.shape                           │
│ Dimensions               │ arr.ndim                            │
│ Size                     │ arr.size                            │
│ Data type                │ arr.dtype                           │
│ Reshape                  │ arr.reshape((3, 4))                 │
│ Flatten                  │ arr.flatten() or arr.ravel()        │
│ Transpose                │ arr.T                               │
├──────────────────────────┼─────────────────────────────────────┤
│ Sum                      │ np.sum(arr) or arr.sum()            │
│ Mean                     │ np.mean(arr) or arr.mean()          │
│ Median                   │ np.median(arr)                      │
│ Std deviation            │ np.std(arr) or arr.std()            │
│ Min/Max                  │ np.min(arr), np.max(arr)            │
│ Argmin/Argmax            │ np.argmin(arr), np.argmax(arr)      │
│ Cumulative sum           │ np.cumsum(arr)                      │
│ Cumulative product       │ np.cumprod(arr)                     │
├──────────────────────────┼─────────────────────────────────────┤
│ Concatenate arrays       │ np.concatenate([a1, a2], axis=0)    │
│ Stack vertically         │ np.vstack([a1, a2])                 │
│ Stack horizontally       │ np.hstack([a1, a2])                 │
│ Split array              │ np.split(arr, 3)                    │
├──────────────────────────┼─────────────────────────────────────┤
│ Element-wise add         │ arr1 + arr2                         │
│ Element-wise multiply    │ arr1 * arr2                         │
│ Matrix multiply          │ arr1 @ arr2 or np.dot(arr1, arr2)   │
│ Square root              │ np.sqrt(arr)                        │
│ Exponential              │ np.exp(arr)                         │
│ Logarithm                │ np.log(arr)                         │
└──────────────────────────┴─────────────────────────────────────┘
```

---

## Common Mistakes

### 1. Assignment vs Copy

```python
# MISTAKE: Using assignment (creates reference)
arr1 = np.array([1, 2, 3, 4, 5])
arr2 = arr1  # Not a copy!
arr2[0] = 999
print(arr1)  # [999 2 3 4 5] - Original changed!

# CORRECT: Use .copy()
arr1 = np.array([1, 2, 3, 4, 5])
arr2 = arr1.copy()
arr2[0] = 999
print(arr1)  # [1 2 3 4 5] - Original unchanged
```

### 2. Integer Division

```python
# MISTAKE: Integer division
arr = np.array([1, 2, 3, 4, 5])
result = arr / 2
print(result.dtype)  # float64 (OK in Python 3)

# Be careful with data types
arr_int = np.array([1, 2, 3, 4, 5], dtype=int)
result = arr_int / 2
print(result)  # [0.5 1.  1.5 2.  2.5] - Auto converts to float

# Force integer division
result = arr_int // 2
print(result)  # [0 1 1 2 2]
```

### 3. Array vs Matrix Multiplication

```python
# Element-wise multiplication (Hadamard product)
a = np.array([[1, 2], [3, 4]])
b = np.array([[5, 6], [7, 8]])
print(a * b)
# [[ 5 12]
#  [21 32]]

# Matrix multiplication (dot product)
print(a @ b)  # or np.dot(a, b)
# [[19 22]
#  [43 50]]
```

### 4. Mutating vs Non-Mutating Operations

```python
arr = np.array([3, 1, 4, 1, 5, 9, 2, 6])

# Non-mutating (returns new array)
sorted_arr = np.sort(arr)
print(arr)  # [3 1 4 1 5 9 2 6] - unchanged

# Mutating (changes original)
arr.sort()
print(arr)  # [1 1 2 3 4 5 6 9] - changed!
```

### 5. Boolean Indexing with 'and'/'or'

```python
arr = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

# MISTAKE: Using 'and'/'or'
# result = arr[(arr > 3) and (arr < 8)]  # ERROR!

# CORRECT: Using '&'/'|' with parentheses
result = arr[(arr > 3) & (arr < 8)]
print(result)  # [4 5 6 7]
```

### 6. Reshaping Incompatible Sizes

```python
arr = np.array([1, 2, 3, 4, 5])

# MISTAKE: Incompatible reshape
# reshaped = arr.reshape((2, 3))  # ERROR! 5 elements ≠ 2*3

# CORRECT: Use -1 for auto-calculation
reshaped = arr.reshape((5, 1))  # OK
reshaped = np.append(arr, 0).reshape((2, 3))  # Add element first
```

---

## Performance Tips

### 1. Vectorization Over Loops

```python
import time

arr = np.random.randint(1, 100, size=1000000)

# SLOW: Python loop
start = time.time()
result = []
for i in arr:
    result.append(i * 2)
loop_time = time.time() - start

# FAST: Vectorized operation
start = time.time()
result = arr * 2
vectorized_time = time.time() - start

print(f"Loop: {loop_time:.4f}s, Vectorized: {vectorized_time:.4f}s")
# Loop: 0.3500s, Vectorized: 0.0015s (233x faster!)
```

### 2. Use In-Place Operations

```python
# Creates new array (slower)
arr = np.random.random(1000000)
arr = arr * 2

# In-place operation (faster, less memory)
arr = np.random.random(1000000)
arr *= 2
```

### 3. Use Built-in Functions

```python
arr = np.random.randint(1, 100, size=10000)

# SLOW: Manual calculation
mean = sum(arr) / len(arr)

# FAST: NumPy built-in
mean = np.mean(arr)  # Optimized C implementation
```

### 4. Avoid Array Growing

```python
# SLOW: Growing array in loop
arr = np.array([])
for i in range(10000):
    arr = np.append(arr, i)  # Reallocates every time!

# FAST: Pre-allocate
arr = np.zeros(10000)
for i in range(10000):
    arr[i] = i

# BEST: Use arange or list comprehension
arr = np.arange(10000)
```

### 5. Use Appropriate Data Types

```python
# Uses 64-bit integers (8 bytes each)
arr_large = np.array([1, 2, 3, 4, 5], dtype=np.int64)
print(arr_large.nbytes)  # 40 bytes

# Uses 8-bit integers (1 byte each)
arr_small = np.array([1, 2, 3, 4, 5], dtype=np.int8)
print(arr_small.nbytes)  # 5 bytes (8x smaller!)
```

### 6. Memory Layout: C vs Fortran Order

```python
# C-order (row-major, default)
arr_c = np.zeros((1000, 1000), order='C')

# Fortran-order (column-major)
arr_f = np.zeros((1000, 1000), order='F')

# Use C-order for row-wise operations
# Use F-order for column-wise operations
```

### Performance Comparison Table
```
┌──────────────────────────┬──────────────┬──────────────┐
│ Operation                │ Slow Method  │ Fast Method  │
├──────────────────────────┼──────────────┼──────────────┤
│ Element-wise multiply    │ Python loop  │ arr * 2      │
│ Sum elements             │ sum(arr)     │ np.sum(arr)  │
│ Find max                 │ max(arr)     │ np.max(arr)  │
│ Array creation           │ Growing arr  │ Pre-allocate │
│ Conditional filtering    │ Loop + if    │ Boolean mask │
│ Matrix operations        │ Nested loops │ np.dot()     │
└──────────────────────────┴──────────────┴──────────────┘
```

---

## Summary

### Key Takeaways

1. **NumPy arrays are faster and more memory-efficient** than Python lists
2. **Use vectorized operations** instead of loops whenever possible
3. **Understand axis parameter** for multi-dimensional operations
4. **Be careful with views vs copies** to avoid unexpected behavior
5. **Choose appropriate data types** to save memory
6. **Pre-allocate arrays** instead of growing them dynamically
7. **Use boolean indexing** for filtering data efficiently

### Next Steps
- Move to `numpy-advanced.md` for broadcasting, advanced indexing, and mathematical operations
- Practice with real datasets to solidify understanding
- Explore NumPy's extensive mathematical and statistical functions

---

**Remember**: NumPy is the foundation of data science in Python. Master it, and you'll excel with Pandas, Scikit-learn, and other libraries!
