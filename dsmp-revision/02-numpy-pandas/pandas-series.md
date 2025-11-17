# Pandas Series

## Table of Contents
1. [Introduction to Series](#introduction-to-series)
2. [Creating Series](#creating-series)
3. [Series Attributes](#series-attributes)
4. [Indexing and Selection](#indexing-and-selection)
5. [Series Operations](#series-operations)
6. [Handling Missing Data](#handling-missing-data)
7. [Common Operations Cheat Sheet](#common-operations-cheat-sheet)
8. [Common Mistakes](#common-mistakes)
9. [Performance Tips](#performance-tips)

---

## Introduction to Series

### What is a Pandas Series?
A Series is a one-dimensional labeled array capable of holding any data type. It's like a column in a spreadsheet or a single column in a DataFrame.

### Series vs NumPy Array vs Python List

```
┌─────────────────┬──────────────┬──────────────┬──────────────┐
│ Feature         │ Python List  │ NumPy Array  │ Pandas Series│
├─────────────────┼──────────────┼──────────────┼──────────────┤
│ Labeled Index   │ No           │ No           │ Yes          │
│ Homogeneous     │ No           │ Yes          │ No*          │
│ Vectorized ops  │ No           │ Yes          │ Yes          │
│ Missing data    │ Manual       │ np.nan       │ NaN, None    │
│ Alignment       │ No           │ No           │ Automatic    │
│ Size            │ Mutable      │ Immutable    │ Mutable      │
└─────────────────┴──────────────┴──────────────┴──────────────┘

* Series enforces dtype but can hold objects
```

### Structure of a Series

```
Series = Index + Values

Example:
┌───────────┬────────────┐
│ Index     │ Values     │
├───────────┼────────────┤
│ 0         │ 100        │
│ 1         │ 200        │
│ 2         │ 150        │
│ 3         │ 300        │
│ 4         │ 250        │
└───────────┴────────────┘
```

---

## Creating Series

### From Python List

```python
import pandas as pd
import numpy as np

# Basic series from list
prices = pd.Series([100, 200, 150, 300, 250])
print(prices)
# 0    100
# 1    200
# 2    150
# 3    300
# 4    250
# dtype: int64

# Series with custom index
prices = pd.Series(
    [100, 200, 150, 300, 250],
    index=['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
)
print(prices)
# Mon    100
# Tue    200
# Wed    150
# Thu    300
# Fri    250
# dtype: int64
```

### From Dictionary

```python
# Dictionary automatically becomes labeled series
sales_dict = {
    'Jan': 1000,
    'Feb': 1200,
    'Mar': 1100,
    'Apr': 1300,
    'May': 1400
}

sales = pd.Series(sales_dict)
print(sales)
# Jan    1000
# Feb    1200
# Mar    1100
# Apr    1300
# May    1400
# dtype: int64

# Specify index order (missing keys become NaN)
sales = pd.Series(sales_dict, index=['Jan', 'Feb', 'Mar', 'Jun'])
print(sales)
# Jan    1000.0
# Feb    1200.0
# Mar    1100.0
# Jun       NaN
# dtype: float64
```

### From NumPy Array

```python
# From NumPy array
np_array = np.array([10, 20, 30, 40, 50])
series = pd.Series(np_array, index=list('ABCDE'))
print(series)
# A    10
# B    20
# C    30
# D    40
# E    50
# dtype: int64
```

### From Scalar Value

```python
# Repeat scalar value
constant = pd.Series(100, index=['A', 'B', 'C', 'D'])
print(constant)
# A    100
# B    100
# C    100
# D    100
# dtype: int64
```

### Real-World Example: Stock Prices

```python
# Daily closing prices for a week
stock_prices = pd.Series(
    [145.32, 147.56, 146.89, 149.23, 151.67, 150.45, 152.89],
    index=pd.date_range('2024-01-15', periods=7, freq='D'),
    name='AAPL'
)
print(stock_prices)
# 2024-01-15    145.32
# 2024-01-16    147.56
# 2024-01-17    146.89
# 2024-01-18    149.23
# 2024-01-19    151.67
# 2024-01-20    150.45
# 2024-01-21    152.89
# Freq: D, Name: AAPL, dtype: float64
```

---

## Series Attributes

### Essential Attributes

```python
sales = pd.Series(
    [100, 200, 150, 300, 250],
    index=['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    name='Daily_Sales'
)

# Values (as NumPy array)
print(sales.values)
# [100 200 150 300 250]

# Index
print(sales.index)
# Index(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], dtype='object')

# Name
print(sales.name)
# 'Daily_Sales'

# Data type
print(sales.dtype)
# int64

# Shape
print(sales.shape)
# (5,)

# Size (number of elements)
print(sales.size)
# 5

# Number of dimensions
print(sales.ndim)
# 1

# Check for empty
print(sales.empty)
# False
```

### Series Attributes Summary

```
┌─────────────────┬──────────────────────────────────────┐
│ Attribute       │ Description                          │
├─────────────────┼──────────────────────────────────────┤
│ .values         │ NumPy array of values                │
│ .index          │ Index object                         │
│ .name           │ Name of the series                   │
│ .dtype          │ Data type of values                  │
│ .shape          │ Tuple of dimensions (n,)             │
│ .size           │ Number of elements                   │
│ .ndim           │ Number of dimensions (always 1)      │
│ .empty          │ True if series has no elements       │
│ .hasnans        │ True if series contains NaN          │
│ .is_unique      │ True if all values are unique        │
│ .is_monotonic   │ True if values increase/stay same    │
└─────────────────┴──────────────────────────────────────┘
```

---

## Indexing and Selection

### Label-based Indexing (loc)

```python
prices = pd.Series(
    [100, 200, 150, 300, 250],
    index=['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
)

# Single label
print(prices['Mon'])  # 100
print(prices.loc['Mon'])  # 100 (explicit)

# Multiple labels
print(prices[['Mon', 'Wed', 'Fri']])
# Mon    100
# Wed    150
# Fri    250

# Slicing by label (INCLUSIVE of end)
print(prices['Mon':'Wed'])
# Mon    100
# Tue    200
# Wed    150
```

### Position-based Indexing (iloc)

```python
# Single position
print(prices.iloc[0])  # 100
print(prices.iloc[-1])  # 250

# Multiple positions
print(prices.iloc[[0, 2, 4]])
# Mon    100
# Wed    150
# Fri    250

# Slicing by position (EXCLUSIVE of end)
print(prices.iloc[0:3])
# Mon    100
# Tue    200
# Wed    150

# Step slicing
print(prices.iloc[::2])
# Mon    100
# Wed    150
# Fri    250
```

### Boolean Indexing

```python
sales = pd.Series(
    [120, 85, 200, 150, 90, 180, 110, 95],
    index=pd.date_range('2024-01-01', periods=8, freq='D')
)

# Filter values > 150
high_sales = sales[sales > 150]
print(high_sales)
# 2024-01-03    200
# 2024-01-06    180

# Multiple conditions
moderate_sales = sales[(sales >= 100) & (sales <= 150)]
print(moderate_sales)
# 2024-01-01    120
# 2024-01-04    150
# 2024-01-07    110

# Using isin()
weekend_sales = sales[sales.index.dayofweek.isin([5, 6])]
```

### Real-World Example: Temperature Analysis

```python
# Daily temperatures (Celsius)
temps = pd.Series(
    [22, 24, 26, 25, 23, 27, 29, 28, 26, 24],
    index=pd.date_range('2024-07-01', periods=10, freq='D'),
    name='Temperature'
)

# Find hot days (> 26°C)
hot_days = temps[temps > 26]
print("Hot days:")
print(hot_days)
# 2024-07-07    29
# 2024-07-08    28
# 2024-07-09    27

# Get first 5 days
first_week = temps.iloc[:5]

# Get specific dates
july_4th = temps.loc['2024-07-04']

# Temperature range 24-26°C
comfortable = temps[(temps >= 24) & (temps <= 26)]
print(f"\nComfortable days: {len(comfortable)}")
```

---

## Series Operations

### Arithmetic Operations

```python
prices_jan = pd.Series([100, 110, 105, 115], index=['A', 'B', 'C', 'D'])
prices_feb = pd.Series([105, 115, 110, 120], index=['A', 'B', 'C', 'D'])

# Element-wise addition
total = prices_jan + prices_feb
print(total)
# A    205
# B    225
# C    215
# D    235

# Scalar operations
increased = prices_jan * 1.1  # 10% increase
print(increased)
# A    110.0
# B    121.0
# C    115.5
# D    126.5

# Operations with different indices (automatic alignment)
s1 = pd.Series([1, 2, 3], index=['A', 'B', 'C'])
s2 = pd.Series([4, 5, 6], index=['B', 'C', 'D'])
result = s1 + s2
print(result)
# A    NaN  (missing in s2)
# B    6.0  (2 + 4)
# C    8.0  (3 + 5)
# D    NaN  (missing in s1)
```

### Statistical Operations

```python
sales = pd.Series([120, 150, 180, 200, 165, 140, 190])

# Basic statistics
print(f"Mean: {sales.mean():.2f}")        # 163.57
print(f"Median: {sales.median():.2f}")    # 165.00
print(f"Std: {sales.std():.2f}")          # 26.98
print(f"Variance: {sales.var():.2f}")     # 728.24
print(f"Sum: {sales.sum()}")              # 1145
print(f"Min: {sales.min()}")              # 120
print(f"Max: {sales.max()}")              # 200

# Quantiles
print(f"25th percentile: {sales.quantile(0.25)}")  # 147.5
print(f"75th percentile: {sales.quantile(0.75)}")  # 185.0

# Cumulative operations
cumsum = sales.cumsum()
print(cumsum)
# 0     120
# 1     270  (120 + 150)
# 2     450  (120 + 150 + 180)
# ...

# Describe (all statistics at once)
print(sales.describe())
# count      7.000000
# mean     163.571429
# std       26.984466
# min      120.000000
# 25%      147.500000
# 50%      165.000000
# 75%      185.000000
# max      200.000000
```

### String Operations

```python
products = pd.Series(['apple', 'banana', 'Apple Pie', 'BANANA SPLIT', 'Cherry'])

# String methods via .str accessor
print(products.str.upper())
# 0         APPLE
# 1        BANANA
# 2     APPLE PIE
# 3  BANANA SPLIT
# 4        CHERRY

print(products.str.lower())
print(products.str.capitalize())
print(products.str.title())

# Contains
print(products.str.contains('apple', case=False))
# 0     True
# 1    False
# 2     True
# 3    False
# 4    False

# Replace
print(products.str.replace('apple', 'orange', case=False))
# 0         orange
# 1         banana
# 2     orange Pie
# 3  BANANA SPLIT
# 4         Cherry

# Split
full_names = pd.Series(['John Doe', 'Jane Smith', 'Bob Johnson'])
first_names = full_names.str.split().str[0]
print(first_names)
# 0    John
# 1    Jane
# 2     Bob
```

### Sorting

```python
sales = pd.Series(
    [150, 200, 120, 180, 140],
    index=['Wed', 'Thu', 'Mon', 'Tue', 'Fri']
)

# Sort by values
sorted_values = sales.sort_values()
print(sorted_values)
# Mon    120
# Fri    140
# Wed    150
# Tue    180
# Thu    200

# Sort by index
sorted_index = sales.sort_index()
print(sorted_index)
# Fri    140
# Mon    120
# Thu    200
# Tue    180
# Wed    150

# Descending order
sorted_desc = sales.sort_values(ascending=False)
print(sorted_desc)
# Thu    200
# Tue    180
# Wed    150
# Fri    140
# Mon    120
```

### Ranking

```python
scores = pd.Series([85, 92, 78, 92, 88, 95])

# Rank (1 = smallest)
ranks = scores.rank()
print(ranks)
# 0    2.0
# 1    4.5  (tied, gets average rank)
# 2    1.0
# 3    4.5
# 4    3.0
# 5    6.0

# Rank descending (1 = largest)
ranks_desc = scores.rank(ascending=False)
print(ranks_desc)
# 0    5.0
# 1    2.5
# 2    6.0
# 3    2.5
# 4    4.0
# 5    1.0

# Percentile rank
pct_rank = scores.rank(pct=True)
print(pct_rank * 100)  # As percentage
```

### Apply Custom Functions

```python
prices = pd.Series([100, 200, 150, 300, 250])

# Simple function
def categorize_price(price):
    if price < 150:
        return 'Low'
    elif price < 250:
        return 'Medium'
    else:
        return 'High'

categories = prices.apply(categorize_price)
print(categories)
# 0       Low
# 1    Medium
# 2    Medium
# 3      High
# 4      High

# Lambda function
doubled = prices.apply(lambda x: x * 2)
print(doubled)
# 0    200
# 1    400
# 2    300
# 3    600
# 4    500

# Map with dictionary
grade_map = {'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0}
grades = pd.Series(['A', 'B', 'A', 'C', 'B', 'A', 'D'])
gpa = grades.map(grade_map)
print(gpa)
# 0    4.0
# 1    3.0
# 2    4.0
# 3    2.0
# 4    3.0
# 5    4.0
# 6    1.0
```

---

## Handling Missing Data

### Detecting Missing Data

```python
sales = pd.Series([100, np.nan, 150, None, 200, np.nan, 180])

# Check for missing values
print(sales.isna())
# 0    False
# 1     True
# 2    False
# 3     True
# 4    False
# 5     True
# 6    False

# Check for non-missing values
print(sales.notna())
# Opposite of isna()

# Count missing values
print(f"Missing values: {sales.isna().sum()}")  # 3

# Check if any missing
print(f"Has missing: {sales.hasnans}")  # True
```

### Removing Missing Data

```python
# Drop missing values
clean_sales = sales.dropna()
print(clean_sales)
# 0    100.0
# 2    150.0
# 4    200.0
# 6    180.0
```

### Filling Missing Data

```python
# Fill with constant
filled = sales.fillna(0)
print(filled)
# 0    100.0
# 1      0.0  (was NaN)
# 2    150.0
# 3      0.0  (was NaN)
# 4    200.0
# 5      0.0  (was NaN)
# 6    180.0

# Fill with mean
filled = sales.fillna(sales.mean())
print(filled)

# Forward fill (use previous value)
filled = sales.fillna(method='ffill')
print(filled)
# 0    100.0
# 1    100.0  (filled from index 0)
# 2    150.0
# 3    150.0  (filled from index 2)
# 4    200.0
# 5    200.0  (filled from index 4)
# 6    180.0

# Backward fill (use next value)
filled = sales.fillna(method='bfill')
print(filled)
# 0    100.0
# 1    150.0  (filled from index 2)
# 2    150.0
# 3    200.0  (filled from index 4)
# 4    200.0
# 5    180.0  (filled from index 6)
# 6    180.0

# Interpolate (linear interpolation)
filled = sales.interpolate()
print(filled)
# 0    100.0
# 1    125.0  (interpolated)
# 2    150.0
# 3    175.0  (interpolated)
# 4    200.0
# 5    190.0  (interpolated)
# 6    180.0
```

### Real-World Example: Sensor Data Cleaning

```python
# Temperature sensor readings (with some missing values)
temps = pd.Series(
    [22.5, np.nan, 23.1, 23.4, np.nan, np.nan, 24.2, 24.5],
    index=pd.date_range('2024-01-01', periods=8, freq='h'),
    name='Temperature'
)

print("Original data:")
print(temps)
# 2024-01-01 00:00:00    22.5
# 2024-01-01 01:00:00     NaN
# 2024-01-01 02:00:00    23.1
# 2024-01-01 03:00:00    23.4
# 2024-01-01 04:00:00     NaN
# 2024-01-01 05:00:00     NaN
# 2024-01-01 06:00:00    24.2
# 2024-01-01 07:00:00    24.5

# Interpolate missing values (better for time series)
temps_clean = temps.interpolate(method='linear')
print("\nAfter interpolation:")
print(temps_clean)
# 2024-01-01 00:00:00    22.50
# 2024-01-01 01:00:00    22.80  (interpolated)
# 2024-01-01 02:00:00    23.10
# 2024-01-01 03:00:00    23.43
# 2024-01-01 04:00:00    23.70  (interpolated)
# 2024-01-01 05:00:00    23.97  (interpolated)
# 2024-01-01 06:00:00    24.20
# 2024-01-01 07:00:00    24.50
```

---

## Common Operations Cheat Sheet

```
┌──────────────────────────────┬─────────────────────────────────┐
│ Operation                    │ Code                            │
├──────────────────────────────┼─────────────────────────────────┤
│ CREATION                     │                                 │
│ From list                    │ pd.Series([1, 2, 3])            │
│ From dict                    │ pd.Series({'a': 1, 'b': 2})     │
│ From array                   │ pd.Series(np.array([1, 2, 3]))  │
│ With custom index            │ pd.Series([1, 2], index=['a','b'])│
│ Named series                 │ pd.Series([1, 2], name='MySeries')│
├──────────────────────────────┼─────────────────────────────────┤
│ INDEXING                     │                                 │
│ By label                     │ s['label'] or s.loc['label']    │
│ By position                  │ s.iloc[0]                       │
│ Multiple labels              │ s[['a', 'b', 'c']]              │
│ Slicing by label             │ s['a':'c'] (inclusive)          │
│ Slicing by position          │ s.iloc[0:3] (exclusive)         │
│ Boolean indexing             │ s[s > 10]                       │
├──────────────────────────────┼─────────────────────────────────┤
│ STATISTICS                   │                                 │
│ Mean                         │ s.mean()                        │
│ Median                       │ s.median()                      │
│ Std deviation                │ s.std()                         │
│ Min/Max                      │ s.min(), s.max()                │
│ Sum                          │ s.sum()                         │
│ Count non-NA                 │ s.count()                       │
│ Quantile                     │ s.quantile(0.75)                │
│ Describe                     │ s.describe()                    │
│ Value counts                 │ s.value_counts()                │
├──────────────────────────────┼─────────────────────────────────┤
│ SORTING & RANKING            │                                 │
│ Sort by values               │ s.sort_values()                 │
│ Sort by index                │ s.sort_index()                  │
│ Rank                         │ s.rank()                        │
│ Largest n values             │ s.nlargest(n)                   │
│ Smallest n values            │ s.nsmallest(n)                  │
├──────────────────────────────┼─────────────────────────────────┤
│ MISSING DATA                 │                                 │
│ Check missing                │ s.isna() or s.isnull()          │
│ Check not missing            │ s.notna() or s.notnull()        │
│ Drop missing                 │ s.dropna()                      │
│ Fill with value              │ s.fillna(value)                 │
│ Forward fill                 │ s.fillna(method='ffill')        │
│ Backward fill                │ s.fillna(method='bfill')        │
│ Interpolate                  │ s.interpolate()                 │
├──────────────────────────────┼─────────────────────────────────┤
│ TRANSFORMATIONS              │                                 │
│ Apply function               │ s.apply(func)                   │
│ Map values                   │ s.map(dict_or_func)             │
│ Replace values               │ s.replace(old, new)             │
│ Unique values                │ s.unique()                      │
│ Number unique                │ s.nunique()                     │
│ Duplicated                   │ s.duplicated()                  │
│ Drop duplicates              │ s.drop_duplicates()             │
├──────────────────────────────┼─────────────────────────────────┤
│ STRING OPERATIONS            │                                 │
│ Lowercase                    │ s.str.lower()                   │
│ Uppercase                    │ s.str.upper()                   │
│ Contains pattern             │ s.str.contains('pattern')       │
│ Replace string               │ s.str.replace('old', 'new')     │
│ Split string                 │ s.str.split()                   │
│ Strip whitespace             │ s.str.strip()                   │
│ Length                       │ s.str.len()                     │
└──────────────────────────────┴─────────────────────────────────┘
```

---

## Common Mistakes

### 1. Modifying While Iterating

```python
# MISTAKE: Modifying series during iteration
s = pd.Series([1, 2, 3, 4, 5])
for idx in s.index:
    if s[idx] > 2:
        s[idx] = s[idx] * 2  # Works but inefficient!

# CORRECT: Vectorized operation
s = pd.Series([1, 2, 3, 4, 5])
s[s > 2] = s[s > 2] * 2
print(s)  # [1 2 6 8 10]

# Or use where/mask
s = pd.Series([1, 2, 3, 4, 5])
s = s.where(s <= 2, s * 2)
```

### 2. Chained Indexing

```python
# MISTAKE: Chained assignment (may not work as expected)
s = pd.Series([1, 2, 3, 4, 5])
# s[s > 2][0] = 999  # SettingWithCopyWarning!

# CORRECT: Single indexing operation
s = pd.Series([1, 2, 3, 4, 5])
mask = s > 2
s.loc[mask.idxmax()] = 999  # Or use proper boolean indexing
```

### 3. Forgetting Index Alignment

```python
# MISTAKE: Assuming same order
s1 = pd.Series([1, 2, 3], index=['A', 'B', 'C'])
s2 = pd.Series([4, 5, 6], index=['B', 'C', 'D'])
result = s1 + s2
print(result)
# A    NaN  # Missing in s2!
# B    6.0
# C    8.0
# D    NaN  # Missing in s1!

# CORRECT: Use fill_value for missing
result = s1.add(s2, fill_value=0)
print(result)
# A    1.0
# B    6.0
# C    8.0
# D    6.0
```

### 4. Not Using Vectorized Operations

```python
import time

s = pd.Series(range(100000))

# SLOW: Loop
start = time.time()
result = pd.Series([x ** 2 for x in s])
loop_time = time.time() - start

# FAST: Vectorized
start = time.time()
result = s ** 2
vec_time = time.time() - start

print(f"Loop: {loop_time:.4f}s, Vectorized: {vec_time:.4f}s")
# Loop: 0.0500s, Vectorized: 0.0010s
```

### 5. Using Python Types with String Methods

```python
# MISTAKE: Mixing types
s = pd.Series([1, 2, 3, '4', '5'])
# result = s.str.upper()  # AttributeError for integers!

# CORRECT: Convert to string first
result = s.astype(str).str.upper()

# Or handle mixed types
result = s.apply(lambda x: str(x).upper())
```

### 6. Ignoring inplace Parameter

```python
s = pd.Series([3, 1, 4, 1, 5, 9, 2, 6])

# MISTAKE: Expecting modification
s.sort_values()  # Returns new series, doesn't modify s
print(s)  # Still unsorted!

# CORRECT: Either assign or use inplace
s_sorted = s.sort_values()
# Or
s.sort_values(inplace=True)
print(s)  # Now sorted
```

---

## Performance Tips

### 1. Use Vectorized Operations

```python
# SLOW: Loop with apply
s = pd.Series(range(100000))
result = s.apply(lambda x: x * 2 + 10)

# FAST: Vectorized
result = s * 2 + 10  # Much faster!
```

### 2. Use Built-in Methods

```python
s = pd.Series(['apple', 'banana', 'cherry'] * 10000)

# SLOW: Custom function
result = s.apply(lambda x: x.upper())

# FAST: Built-in string method
result = s.str.upper()
```

### 3. Use Category dtype for Repeated Strings

```python
# SLOW: Object dtype (strings)
s_obj = pd.Series(['Male', 'Female'] * 50000)
print(f"Object memory: {s_obj.memory_usage(deep=True) / 1024:.2f} KB")

# FAST: Category dtype
s_cat = pd.Series(['Male', 'Female'] * 50000, dtype='category')
print(f"Category memory: {s_cat.memory_usage(deep=True) / 1024:.2f} KB")
# Uses much less memory and faster operations!
```

### 4. Use Boolean Indexing Instead of Apply

```python
s = pd.Series(range(100000))

# SLOW: Apply with condition
result = s.apply(lambda x: x if x > 50000 else 0)

# FAST: Boolean indexing with where
result = s.where(s > 50000, 0)
```

### 5. Avoid Unnecessary Copies

```python
# Creates copy
s_copy = s.copy()

# Use views when possible (be careful with modifications!)
s_view = s.values  # NumPy array view
```

### 6. Use Appropriate Data Types

```python
# SLOW: Default int64
s_large = pd.Series(range(100), dtype='int64')
print(s_large.memory_usage())  # 928 bytes

# FAST: Smaller int type
s_small = pd.Series(range(100), dtype='int8')
print(s_small.memory_usage())  # 228 bytes (4x smaller!)
```

---

## Summary

### Key Takeaways

1. **Series is a labeled 1D array** with automatic index alignment
2. **Use .loc for label-based** and .iloc for position-based indexing
3. **Vectorized operations** are much faster than loops
4. **Index alignment** happens automatically in operations
5. **Missing data handling** is built-in and flexible
6. **String operations** via .str accessor are powerful
7. **Choose appropriate dtypes** to save memory
8. **Boolean indexing** is cleaner than apply with conditionals

### Series vs DataFrame
```
┌─────────────────┬──────────────────┬──────────────────┐
│ Feature         │ Series           │ DataFrame        │
├─────────────────┼──────────────────┼──────────────────┤
│ Dimensions      │ 1D               │ 2D               │
│ Structure       │ Single column    │ Multiple columns │
│ Index           │ Row index        │ Row + Col index  │
│ Use case        │ Single variable  │ Multiple vars    │
└─────────────────┴──────────────────┴──────────────────┘
```

### Next Steps
- Move to `pandas-dataframe.md` for DataFrame operations
- Practice Series operations with real datasets
- Understand when to use Series vs DataFrame

---

**A Series is the building block of Pandas. Master it, and DataFrames will be easy!**
