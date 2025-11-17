# Pandas DataFrame - Data Manipulation

## Table of Contents
1. [Introduction to DataFrame](#introduction-to-dataframe)
2. [Creating DataFrames](#creating-dataframes)
3. [DataFrame Attributes](#dataframe-attributes)
4. [Indexing and Selection](#indexing-and-selection)
5. [Data Manipulation](#data-manipulation)
6. [Filtering Data](#filtering-data)
7. [Sorting Data](#sorting-data)
8. [Adding/Removing Columns](#addingremoving-columns)
9. [Common Operations Cheat Sheet](#common-operations-cheat-sheet)
10. [Common Mistakes](#common-mistakes)
11. [Performance Tips](#performance-tips)

---

## Introduction to DataFrame

### What is a DataFrame?
A DataFrame is a 2-dimensional labeled data structure with columns that can hold different types of data. Think of it as:
- A spreadsheet (Excel-like)
- A SQL table
- A dictionary of Series

### DataFrame Structure

```
DataFrame = Row Index + Column Names + Data

Example:
┌───────┬────────┬─────────┬───────┬────────┐
│ Index │ Name   │ Age     │ City  │ Salary │
├───────┼────────┼─────────┼───────┼────────┤
│ 0     │ Alice  │ 25      │ NY    │ 70000  │
│ 1     │ Bob    │ 30      │ LA    │ 80000  │
│ 2     │ Charlie│ 35      │ SF    │ 90000  │
│ 3     │ Diana  │ 28      │ NY    │ 75000  │
└───────┴────────┴─────────┴───────┴────────┘
```

### Why DataFrame?
```
┌─────────────────────────┬──────────────────────────────┐
│ Feature                 │ Benefit                      │
├─────────────────────────┼──────────────────────────────┤
│ Labeled axes            │ Self-documenting code        │
│ Multiple data types     │ Real-world data handling     │
│ Automatic alignment     │ No manual index matching     │
│ Missing data handling   │ Built-in NaN support         │
│ SQL-like operations     │ Filter, group, join easily   │
│ Time series support     │ Date/time indexing           │
└─────────────────────────┴──────────────────────────────┘
```

---

## Creating DataFrames

### From Dictionary

```python
import pandas as pd
import numpy as np

# Dictionary of lists
data = {
    'Name': ['Alice', 'Bob', 'Charlie', 'Diana'],
    'Age': [25, 30, 35, 28],
    'City': ['NY', 'LA', 'SF', 'NY'],
    'Salary': [70000, 80000, 90000, 75000]
}

df = pd.DataFrame(data)
print(df)
#       Name  Age City  Salary
# 0    Alice   25   NY   70000
# 1      Bob   30   LA   80000
# 2  Charlie   35   SF   90000
# 3    Diana   28   NY   75000

# With custom index
df = pd.DataFrame(data, index=['E1', 'E2', 'E3', 'E4'])
print(df)
#         Name  Age City  Salary
# E1     Alice   25   NY   70000
# E2       Bob   30   LA   80000
# E3   Charlie   35   SF   90000
# E4     Diana   28   NY   75000
```

### From List of Dictionaries

```python
# Each dict is a row
data = [
    {'Name': 'Alice', 'Age': 25, 'City': 'NY'},
    {'Name': 'Bob', 'Age': 30, 'City': 'LA'},
    {'Name': 'Charlie', 'Age': 35, 'City': 'SF'}
]

df = pd.DataFrame(data)
print(df)
#       Name  Age City
# 0    Alice   25   NY
# 1      Bob   30   LA
# 2  Charlie   35   SF
```

### From NumPy Array

```python
# Random data
np.random.seed(42)
data = np.random.randint(50, 100, size=(5, 3))

df = pd.DataFrame(
    data,
    columns=['Math', 'Physics', 'Chemistry'],
    index=['Student_' + str(i+1) for i in range(5)]
)
print(df)
#            Math  Physics  Chemistry
# Student_1    51       92         14
# Student_2    71       60         20
# Student_3    82       86         74
# Student_4    74       87         99
# Student_5    23       ...        ...
```

### From CSV File

```python
# Reading CSV
df = pd.read_csv('sales_data.csv')

# With custom options
df = pd.read_csv(
    'sales_data.csv',
    sep=',',                    # Delimiter
    header=0,                   # Row number for column names
    index_col=0,                # Column to use as index
    usecols=['Date', 'Sales'],  # Columns to read
    parse_dates=['Date'],       # Parse as datetime
    na_values=['NA', 'missing'] # Additional NA values
)
```

### Real-World Example: Sales Data

```python
# E-commerce sales data
sales_data = {
    'OrderID': ['ORD001', 'ORD002', 'ORD003', 'ORD004', 'ORD005'],
    'Date': pd.to_datetime(['2024-01-15', '2024-01-16', '2024-01-16',
                            '2024-01-17', '2024-01-17']),
    'Product': ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Laptop'],
    'Category': ['Electronics', 'Accessories', 'Accessories',
                 'Electronics', 'Electronics'],
    'Quantity': [2, 5, 3, 1, 1],
    'Price': [1000, 25, 75, 300, 1000],
    'Customer': ['Alice', 'Bob', 'Alice', 'Charlie', 'Bob']
}

df = pd.DataFrame(sales_data)
print(df)
#   OrderID       Date    Product     Category  Quantity  Price Customer
# 0  ORD001 2024-01-15     Laptop  Electronics         2   1000    Alice
# 1  ORD002 2024-01-16      Mouse  Accessories         5     25      Bob
# 2  ORD003 2024-01-16   Keyboard  Accessories         3     75    Alice
# 3  ORD004 2024-01-17    Monitor  Electronics         1    300  Charlie
# 4  ORD005 2024-01-17     Laptop  Electronics         1   1000      Bob
```

---

## DataFrame Attributes

### Essential Attributes

```python
# Using sales_data from above
print(f"Shape: {df.shape}")           # (5, 7) - 5 rows, 7 columns
print(f"Size: {df.size}")             # 35 - total elements
print(f"Dimensions: {df.ndim}")       # 2
print(f"Columns: {df.columns.tolist()}")
print(f"Index: {df.index.tolist()}")
print(f"Dtypes:\n{df.dtypes}")

# Column data types
# OrderID               object
# Date          datetime64[ns]
# Product               object
# Category              object
# Quantity               int64
# Price                  int64
# Customer              object
```

### Info and Description

```python
# Concise summary
print(df.info())
# <class 'pandas.core.frame.DataFrame'>
# RangeIndex: 5 entries, 0 to 4
# Data columns (total 7 columns):
#  #   Column    Non-Null Count  Dtype
# ---  ------    --------------  -----
#  0   OrderID   5 non-null      object
#  1   Date      5 non-null      datetime64[ns]
#  ...

# Statistical summary
print(df.describe())
#        Quantity       Price
# count       5.0         5.0
# mean        2.4       480.0
# std         1.67      464.76
# min         1.0        25.0
# 25%         1.0        75.0
# 50%         2.0       300.0
# 75%         3.0      1000.0
# max         5.0      1000.0

# Include all columns (object types too)
print(df.describe(include='all'))
```

### Quick Data Inspection

```python
# First n rows
print(df.head(3))

# Last n rows
print(df.tail(2))

# Random sample
print(df.sample(3))

# Value counts for a column
print(df['Product'].value_counts())
# Laptop      2
# Mouse       1
# Keyboard    1
# Monitor     1
```

---

## Indexing and Selection

### Selecting Columns

```python
# Single column (returns Series)
names = df['Product']
print(type(names))  # <class 'pandas.core.series.Series'>

# Multiple columns (returns DataFrame)
subset = df[['Product', 'Price', 'Quantity']]
print(type(subset))  # <class 'pandas.core.frame.DataFrame'>

# Column as attribute (if name is valid Python identifier)
products = df.Product  # Same as df['Product']
```

### Selecting Rows - iloc (Position-based)

```python
# Single row by position
first_row = df.iloc[0]
print(first_row)
# OrderID                    ORD001
# Date         2024-01-15 00:00:00
# Product                    Laptop
# ...

# Multiple rows
first_three = df.iloc[0:3]  # Exclusive of 3
print(first_three)

# Specific rows
selected = df.iloc[[0, 2, 4]]

# Rows and columns
subset = df.iloc[0:3, 1:4]  # First 3 rows, columns 1-3
print(subset)
#         Date    Product     Category
# 0 2024-01-15     Laptop  Electronics
# 1 2024-01-16      Mouse  Accessories
# 2 2024-01-16   Keyboard  Accessories

# Every other row
alternate = df.iloc[::2]
```

### Selecting Rows - loc (Label-based)

```python
# Create DataFrame with custom index
df_indexed = df.set_index('OrderID')

# Single row by label
order = df_indexed.loc['ORD001']

# Multiple rows
orders = df_indexed.loc[['ORD001', 'ORD003', 'ORD005']]

# Slice by label (INCLUSIVE of both ends)
orders = df_indexed.loc['ORD001':'ORD003']

# Rows and specific columns
subset = df_indexed.loc['ORD001':'ORD003', ['Product', 'Price']]
print(subset)
#         Product  Price
# OrderID
# ORD001   Laptop   1000
# ORD002    Mouse     25
# ORD003 Keyboard     75

# All rows, specific columns
products_prices = df_indexed.loc[:, ['Product', 'Price']]
```

### Boolean Indexing

```python
# Single condition
expensive = df[df['Price'] > 500]
print(expensive)
#   OrderID       Date Product     Category  Quantity  Price Customer
# 0  ORD001 2024-01-15  Laptop  Electronics         2   1000    Alice
# 4  ORD005 2024-01-17  Laptop  Electronics         1   1000      Bob

# Multiple conditions (AND)
electronics_expensive = df[
    (df['Category'] == 'Electronics') &
    (df['Price'] > 500)
]

# Multiple conditions (OR)
alice_or_expensive = df[
    (df['Customer'] == 'Alice') |
    (df['Price'] > 500)
]

# Using isin()
specific_products = df[df['Product'].isin(['Laptop', 'Monitor'])]

# String methods
starts_with_l = df[df['Product'].str.startswith('L')]

# NOT condition
not_alice = df[df['Customer'] != 'Alice']
# Or using ~
not_alice = df[~(df['Customer'] == 'Alice')]
```

### Real-World Example: Customer Order Analysis

```python
# Complex filtering
high_value_orders = df[
    (df['Price'] * df['Quantity'] > 1000) &
    (df['Category'] == 'Electronics')
]

print("High-value electronics orders:")
print(high_value_orders[['OrderID', 'Product', 'Price', 'Quantity']])
#   OrderID Product  Price  Quantity
# 0  ORD001  Laptop   1000         2
```

---

## Data Manipulation

### Adding Calculated Columns

```python
# Calculate total amount
df['Total'] = df['Price'] * df['Quantity']
print(df[['Product', 'Price', 'Quantity', 'Total']])
#     Product  Price  Quantity  Total
# 0    Laptop   1000         2   2000
# 1     Mouse     25         5    125
# 2  Keyboard     75         3    225
# 3   Monitor    300         1    300
# 4    Laptop   1000         1   1000

# Conditional column
df['PriceCategory'] = df['Price'].apply(
    lambda x: 'High' if x > 500 else 'Medium' if x > 100 else 'Low'
)

# Or using np.where
df['PriceCategory'] = np.where(
    df['Price'] > 500, 'High',
    np.where(df['Price'] > 100, 'Medium', 'Low')
)

# Or using pd.cut for binning
df['PriceRange'] = pd.cut(
    df['Price'],
    bins=[0, 100, 500, 2000],
    labels=['Low', 'Medium', 'High']
)
```

### Modifying Values

```python
# Modify specific cell
df.loc[0, 'Quantity'] = 3

# Modify entire column
df['Price'] = df['Price'] * 1.1  # 10% price increase

# Modify based on condition
df.loc[df['Category'] == 'Accessories', 'Price'] *= 0.9  # 10% discount

# Replace values
df['Category'] = df['Category'].replace({
    'Electronics': 'Tech',
    'Accessories': 'Accessory'
})

# Update multiple values
df.loc[df['Customer'] == 'Alice', ['Quantity', 'Price']] = [10, 900]
```

### Renaming Columns and Index

```python
# Rename columns
df = df.rename(columns={
    'OrderID': 'Order_ID',
    'Date': 'OrderDate'
})

# Rename with function
df.columns = df.columns.str.lower()  # All lowercase
df.columns = df.columns.str.replace('_', '')  # Remove underscores

# Rename index
df = df.rename(index={0: 'First', 1: 'Second'})

# Reset index (turn index into column)
df = df.reset_index()

# Set index from column
df = df.set_index('OrderID')
```

### Dropping Data

```python
# Drop columns
df_dropped = df.drop(['PriceCategory', 'PriceRange'], axis=1)
# Or
df_dropped = df.drop(columns=['PriceCategory', 'PriceRange'])

# Drop rows by index
df_dropped = df.drop([0, 2], axis=0)
# Or
df_dropped = df.drop(index=[0, 2])

# Drop duplicates
df_unique = df.drop_duplicates()

# Drop duplicates based on specific columns
df_unique = df.drop_duplicates(subset=['Product', 'Customer'])

# Drop rows with missing values
df_clean = df.dropna()

# Drop columns with any missing values
df_clean = df.dropna(axis=1)

# Drop rows where all values are missing
df_clean = df.dropna(how='all')
```

---

## Filtering Data

### Query Method

```python
# SQL-like syntax
result = df.query('Price > 500 and Category == "Electronics"')

# Using variables
min_price = 100
result = df.query('Price > @min_price')

# Multiple conditions
result = df.query('Price > 100 and (Customer == "Alice" or Customer == "Bob")')

# String methods in query
result = df.query('Product.str.contains("top")', engine='python')
```

### Filter Method

```python
# Filter columns containing 'Price'
price_cols = df.filter(like='Price')

# Filter columns matching regex
date_cols = df.filter(regex='^Date|Time$')

# Filter specific items
subset = df.filter(items=['Product', 'Price', 'Quantity'])
```

### Real-World Example: Sales Filtering

```python
# Create comprehensive sales DataFrame
sales = pd.DataFrame({
    'Date': pd.date_range('2024-01-01', periods=100, freq='D'),
    'Product': np.random.choice(['Laptop', 'Mouse', 'Keyboard', 'Monitor'], 100),
    'Region': np.random.choice(['North', 'South', 'East', 'West'], 100),
    'Sales': np.random.randint(100, 1000, 100),
    'Units': np.random.randint(1, 10, 100)
})

# Filter: January sales > 500 in North region
filtered = sales[
    (sales['Date'].dt.month == 1) &
    (sales['Sales'] > 500) &
    (sales['Region'] == 'North')
]

# Using query (cleaner)
filtered = sales.query('Sales > 500 and Region == "North"')

# Top 10 sales
top10 = sales.nlargest(10, 'Sales')

# Bottom 5 sales
bottom5 = sales.nsmallest(5, 'Sales')
```

---

## Sorting Data

### Sort by Values

```python
# Single column ascending
df_sorted = df.sort_values('Price')

# Single column descending
df_sorted = df.sort_values('Price', ascending=False)

# Multiple columns
df_sorted = df.sort_values(['Category', 'Price'], ascending=[True, False])
print(df_sorted)
# Category first (A-Z), then Price (high to low) within each category

# In-place sorting
df.sort_values('Price', inplace=True)
```

### Sort by Index

```python
# Sort by index
df_sorted = df.sort_index()

# Sort columns alphabetically
df_sorted = df.sort_index(axis=1)

# Descending
df_sorted = df.sort_index(ascending=False)
```

### Real-World Example: Leaderboard

```python
# Student scores
students = pd.DataFrame({
    'Name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
    'Math': [85, 92, 78, 95, 88],
    'Physics': [90, 85, 92, 88, 95],
    'Chemistry': [88, 90, 85, 92, 87]
})

# Calculate total score
students['Total'] = students[['Math', 'Physics', 'Chemistry']].sum(axis=1)

# Sort by total (descending) to create leaderboard
leaderboard = students.sort_values('Total', ascending=False)
leaderboard['Rank'] = range(1, len(leaderboard) + 1)

print(leaderboard[['Rank', 'Name', 'Total']])
#    Rank     Name  Total
# 3     1    Diana    275
# 4     2      Eve    270
# 1     3      Bob    267
# 0     4    Alice    263
# 2     5  Charlie    255
```

---

## Adding/Removing Columns

### Adding Columns

```python
# From scalar
df['Discount'] = 0.1

# From list
df['Status'] = ['Shipped', 'Pending', 'Delivered', 'Shipped', 'Pending']

# From calculation
df['Total'] = df['Price'] * df['Quantity']

# From another DataFrame column
df['PriceUSD'] = df['Price'] / 83  # Convert to USD (if Price is in INR)

# Using assign (returns new DataFrame)
df_new = df.assign(
    Total=df['Price'] * df['Quantity'],
    DiscountedPrice=df['Price'] * 0.9
)

# Insert at specific position
df.insert(2, 'NewColumn', [1, 2, 3, 4, 5])
```

### Removing Columns

```python
# Drop single column
df = df.drop('NewColumn', axis=1)

# Drop multiple columns
df = df.drop(['Discount', 'Status'], axis=1)

# Using del (in-place)
del df['NewColumn']

# Using pop (returns column)
status_col = df.pop('Status')
```

### Column Operations

```python
# Reorder columns
df = df[['OrderID', 'Date', 'Product', 'Quantity', 'Price', 'Total']]

# Select all except specific columns
cols_to_drop = ['OrderID', 'Date']
df_subset = df[[col for col in df.columns if col not in cols_to_drop]]

# Or using drop
df_subset = df.drop(columns=cols_to_drop)
```

---

## Common Operations Cheat Sheet

```
┌──────────────────────────────┬─────────────────────────────────┐
│ Operation                    │ Code                            │
├──────────────────────────────┼─────────────────────────────────┤
│ CREATION                     │                                 │
│ From dict                    │ pd.DataFrame(dict)              │
│ From list of dicts           │ pd.DataFrame([{}, {}])          │
│ From NumPy array             │ pd.DataFrame(arr, columns=[...])│
│ Read CSV                     │ pd.read_csv('file.csv')         │
│ Read Excel                   │ pd.read_excel('file.xlsx')      │
├──────────────────────────────┼─────────────────────────────────┤
│ INSPECTION                   │                                 │
│ First n rows                 │ df.head(n)                      │
│ Last n rows                  │ df.tail(n)                      │
│ Random sample                │ df.sample(n)                    │
│ Info                         │ df.info()                       │
│ Statistics                   │ df.describe()                   │
│ Shape                        │ df.shape                        │
│ Columns                      │ df.columns                      │
│ Data types                   │ df.dtypes                       │
├──────────────────────────────┼─────────────────────────────────┤
│ SELECTION                    │                                 │
│ Single column                │ df['col'] or df.col             │
│ Multiple columns             │ df[['col1', 'col2']]            │
│ Row by position              │ df.iloc[0]                      │
│ Row by label                 │ df.loc['label']                 │
│ Rows & columns (position)    │ df.iloc[0:3, 1:4]               │
│ Rows & columns (label)       │ df.loc[:, ['col1', 'col2']]     │
│ Boolean indexing             │ df[df['col'] > 5]               │
├──────────────────────────────┼─────────────────────────────────┤
│ FILTERING                    │                                 │
│ Query                        │ df.query('col > 10')            │
│ Multiple conditions          │ df[(df.A > 5) & (df.B < 10)]    │
│ isin                         │ df[df['col'].isin([1, 2, 3])]   │
│ String contains              │ df[df['col'].str.contains('x')] │
│ Largest n values             │ df.nlargest(n, 'col')           │
│ Smallest n values            │ df.nsmallest(n, 'col')          │
├──────────────────────────────┼─────────────────────────────────┤
│ SORTING                      │                                 │
│ Sort by values               │ df.sort_values('col')           │
│ Sort by multiple cols        │ df.sort_values(['col1', 'col2'])│
│ Sort descending              │ df.sort_values('col', asc=False)│
│ Sort by index                │ df.sort_index()                 │
├──────────────────────────────┼─────────────────────────────────┤
│ MODIFICATION                 │                                 │
│ Add column                   │ df['new'] = values              │
│ Drop column                  │ df.drop('col', axis=1)          │
│ Drop row                     │ df.drop(index)                  │
│ Rename columns               │ df.rename(columns={'old':'new'})│
│ Replace values               │ df.replace(old, new)            │
│ Set index                    │ df.set_index('col')             │
│ Reset index                  │ df.reset_index()                │
│ Drop duplicates              │ df.drop_duplicates()            │
│ Drop NaN                     │ df.dropna()                     │
│ Fill NaN                     │ df.fillna(value)                │
└──────────────────────────────┴─────────────────────────────────┘
```

---

## Common Mistakes

### 1. Chained Assignment

```python
# MISTAKE: SettingWithCopyWarning
df[df['Price'] > 500]['Discount'] = 0.2  # Warning!

# CORRECT: Use loc
df.loc[df['Price'] > 500, 'Discount'] = 0.2
```

### 2. Forgetting inplace

```python
# MISTAKE: Expecting modification
df.sort_values('Price')  # Returns new DataFrame, doesn't modify df!
print(df)  # Still unsorted

# CORRECT: Either assign or use inplace
df = df.sort_values('Price')
# Or
df.sort_values('Price', inplace=True)
```

### 3. Boolean Operators

```python
# MISTAKE: Using 'and'/'or' instead of '&'/'|'
# df[(df['Price'] > 500) and (df['Quantity'] > 2)]  # ERROR!

# CORRECT: Use '&' and '|' with parentheses
df[(df['Price'] > 500) & (df['Quantity'] > 2)]
```

### 4. Index Alignment Issues

```python
# Be careful when setting columns from another DataFrame
df1 = pd.DataFrame({'A': [1, 2, 3]}, index=[0, 1, 2])
df2 = pd.DataFrame({'B': [4, 5, 6]}, index=[1, 2, 3])

# MISTAKE: Direct assignment (index alignment!)
df1['B'] = df2['B']
print(df1)
#    A    B
# 0  1  NaN  # No match at index 0!
# 1  2  4.0
# 2  3  5.0

# CORRECT: Use values to ignore index
df1['B'] = df2['B'].values  # Or reset_index()
```

### 5. Modifying Copy vs View

```python
# MISTAKE: Unclear if working with copy or view
subset = df[df['Price'] > 500]  # Could be copy or view
subset['Discount'] = 0.1  # May show SettingWithCopyWarning

# CORRECT: Be explicit
subset = df[df['Price'] > 500].copy()
subset['Discount'] = 0.1  # Safe
```

### 6. apply() When Not Needed

```python
# SLOW: Using apply unnecessarily
df['Total'] = df.apply(lambda row: row['Price'] * row['Quantity'], axis=1)

# FAST: Vectorized operation
df['Total'] = df['Price'] * df['Quantity']
```

---

## Performance Tips

### 1. Vectorization Over Iteration

```python
import time

# SLOW: Iterating
start = time.time()
for idx in df.index:
    df.loc[idx, 'Total'] = df.loc[idx, 'Price'] * df.loc[idx, 'Quantity']
loop_time = time.time() - start

# FAST: Vectorized
start = time.time()
df['Total'] = df['Price'] * df['Quantity']
vec_time = time.time() - start

print(f"Loop: {loop_time:.4f}s, Vectorized: {vec_time:.4f}s")
# Vectorized is 100x+ faster!
```

### 2. Use query() for Complex Filters

```python
# Readable and often faster for complex conditions
result = df.query('Price > 500 and Quantity > 2 and Category == "Electronics"')

# vs
result = df[(df['Price'] > 500) & (df['Quantity'] > 2) & (df['Category'] == 'Electronics')]
```

### 3. Use Category dtype for Repeated Strings

```python
# Convert to category if column has repeated values
df['Category'] = df['Category'].astype('category')
df['Product'] = df['Product'].astype('category')

# Saves memory and speeds up operations
print(df.memory_usage(deep=True))
```

### 4. Read Large CSV in Chunks

```python
# For very large files
chunk_size = 10000
chunks = []

for chunk in pd.read_csv('large_file.csv', chunksize=chunk_size):
    # Process chunk
    filtered = chunk[chunk['Price'] > 500]
    chunks.append(filtered)

df = pd.concat(chunks, ignore_index=True)
```

### 5. Use eval() for Complex Calculations

```python
# For complex expressions on large DataFrames
df['Result'] = df.eval('Price * Quantity * (1 - Discount)')

# vs
df['Result'] = df['Price'] * df['Quantity'] * (1 - df['Discount'])
```

### 6. Select Specific Columns When Reading

```python
# Don't load columns you don't need
df = pd.read_csv('large_file.csv', usecols=['Date', 'Product', 'Sales'])
```

---

## Summary

### Key Takeaways

1. **DataFrames are 2D labeled arrays** with heterogeneous data types
2. **Use .loc for labels, .iloc for positions** - be consistent
3. **Boolean indexing is powerful** for filtering data
4. **Avoid chained assignment** - use .loc for modifications
5. **Vectorized operations** are much faster than loops
6. **Be aware of copies vs views** - use .copy() when needed
7. **Category dtype saves memory** for columns with repeated values
8. **Query method** provides SQL-like syntax for filtering

### Selection Summary
```
┌─────────────┬──────────────┬──────────────────────┐
│ Accessor    │ Selection By │ Example              │
├─────────────┼──────────────┼──────────────────────┤
│ []          │ Column/Bool  │ df['col']            │
│ .loc[]      │ Label        │ df.loc[0, 'col']     │
│ .iloc[]     │ Position     │ df.iloc[0, 1]        │
│ .at[]       │ Label (fast) │ df.at[0, 'col']      │
│ .iat[]      │ Position(fast)│ df.iat[0, 1]        │
└─────────────┴──────────────┴──────────────────────┘
```

### Next Steps
- Move to `pandas-groupby.md` for aggregation and grouping
- Practice with real datasets (Kaggle, UCI ML Repository)
- Explore `pandas-advanced.md` for MultiIndex, DateTime, Pivot Tables

---

**Master DataFrame operations, and you'll handle any tabular data with confidence!**
