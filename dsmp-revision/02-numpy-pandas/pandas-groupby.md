# Pandas GroupBy, Merging & Joining

## Table of Contents
1. [GroupBy Operations](#groupby-operations)
2. [Aggregation Functions](#aggregation-functions)
3. [Transformation and Filtering](#transformation-and-filtering)
4. [Merging DataFrames](#merging-dataframes)
5. [Joining DataFrames](#joining-dataframes)
6. [Concatenating DataFrames](#concatenating-dataframes)
7. [Common Operations Cheat Sheet](#common-operations-cheat-sheet)
8. [Common Mistakes](#common-mistakes)
9. [Performance Tips](#performance-tips)

---

## GroupBy Operations

### What is GroupBy?
GroupBy is the pandas equivalent of SQL's GROUP BY. It splits data into groups based on criteria, applies a function to each group, and combines results.

### Split-Apply-Combine Paradigm

```
Original Data          Split              Apply         Combine
┌─────────────┐   ┌──────────────┐   ┌──────────┐   ┌──────────┐
│ Product | $ │   │ Group: Laptop│   │ Sum each │   │ Laptop:  │
│ Laptop  |100│   │ - 100        │   │ group    │   │  300     │
│ Mouse   | 50│   │ - 200        │ → │          │ → │ Mouse:   │
│ Laptop  |200│   │              │   │          │   │  120     │
│ Mouse   | 70│   │ Group: Mouse │   │          │   │          │
│         │   │   │ - 50         │   │          │   │          │
│         │   │   │ - 70         │   │          │   │          │
└─────────────┘   └──────────────┘   └──────────┘   └──────────┘
```

### Basic GroupBy

```python
import pandas as pd
import numpy as np

# Sample sales data
sales = pd.DataFrame({
    'Date': ['2024-01-01', '2024-01-01', '2024-01-02', '2024-01-02', '2024-01-03'],
    'Product': ['Laptop', 'Mouse', 'Laptop', 'Keyboard', 'Mouse'],
    'Category': ['Electronics', 'Accessories', 'Electronics', 'Accessories', 'Accessories'],
    'Sales': [1000, 50, 1200, 75, 45],
    'Quantity': [2, 5, 3, 3, 4]
})

# Group by single column
grouped = sales.groupby('Product')
print(type(grouped))  # <class 'pandas.core.groupby.generic.DataFrameGroupBy'>

# Get group sizes
print(grouped.size())
# Product
# Keyboard    1
# Laptop      2
# Mouse       2

# Iterate through groups
for name, group in grouped:
    print(f"\nProduct: {name}")
    print(group)
```

### GroupBy with Aggregation

```python
# Sum of sales per product
product_sales = sales.groupby('Product')['Sales'].sum()
print(product_sales)
# Product
# Keyboard      75
# Laptop      2200
# Mouse         95

# Multiple aggregations
product_stats = sales.groupby('Product').agg({
    'Sales': ['sum', 'mean', 'count'],
    'Quantity': ['sum', 'mean']
})
print(product_stats)
#          Sales                Quantity
#            sum    mean count      sum  mean
# Product
# Keyboard    75    75.0     1        3   3.0
# Laptop    2200  1100.0     2        5   2.5
# Mouse       95    47.5     2        9   4.5
```

### Multiple Grouping Columns

```python
# Group by Category and Product
category_product = sales.groupby(['Category', 'Product'])['Sales'].sum()
print(category_product)
# Category     Product
# Accessories  Keyboard      75
#              Mouse         95
# Electronics  Laptop      2200

# Unstack for better view
print(category_product.unstack(fill_value=0))
# Product      Keyboard  Laptop  Mouse
# Category
# Accessories        75       0     95
# Electronics         0    2200      0
```

### Real-World Example: Retail Sales Analysis

```python
# Comprehensive sales data
np.random.seed(42)
dates = pd.date_range('2024-01-01', periods=100, freq='D')
retail_sales = pd.DataFrame({
    'Date': np.random.choice(dates, 500),
    'Store': np.random.choice(['Store_A', 'Store_B', 'Store_C'], 500),
    'Category': np.random.choice(['Electronics', 'Clothing', 'Food'], 500),
    'Product': np.random.choice(['TV', 'Laptop', 'Shirt', 'Jeans', 'Apple', 'Bread'], 500),
    'Sales': np.random.randint(10, 1000, 500),
    'Quantity': np.random.randint(1, 20, 500)
})

# Total sales by store
store_sales = retail_sales.groupby('Store')['Sales'].sum()
print("Total Sales by Store:")
print(store_sales)

# Average sales by category and store
avg_sales = retail_sales.groupby(['Store', 'Category'])['Sales'].mean()
print("\nAverage Sales by Store and Category:")
print(avg_sales.unstack())

# Product performance (quantity sold)
product_qty = retail_sales.groupby('Product')['Quantity'].sum().sort_values(ascending=False)
print("\nTop Products by Quantity:")
print(product_qty.head())
```

---

## Aggregation Functions

### Built-in Aggregation Functions

```python
# Common aggregations
grouped = sales.groupby('Category')

print("Sum:", grouped['Sales'].sum())
print("Mean:", grouped['Sales'].mean())
print("Median:", grouped['Sales'].median())
print("Min:", grouped['Sales'].min())
print("Max:", grouped['Sales'].max())
print("Std:", grouped['Sales'].std())
print("Count:", grouped['Sales'].count())
print("First:", grouped['Sales'].first())
print("Last:", grouped['Sales'].last())
```

### Custom Aggregation Functions

```python
# Single custom function
def price_range(x):
    return x.max() - x.min()

range_per_category = sales.groupby('Category')['Sales'].agg(price_range)
print(range_per_category)
# Category
# Accessories    30
# Electronics   200

# Multiple custom functions
def coefficient_variation(x):
    return (x.std() / x.mean()) * 100

category_stats = sales.groupby('Category')['Sales'].agg([
    'mean',
    'std',
    ('range', price_range),
    ('cv', coefficient_variation)
])
print(category_stats)
#               mean         std  range         cv
# Category
# Accessories   56.666667   15.275252   30.0   26.951945
# Electronics  1100.000000  141.421356  200.0   12.856694
```

### Named Aggregations

```python
# Cleaner syntax with named aggregations
result = sales.groupby('Category').agg(
    Total_Sales=('Sales', 'sum'),
    Avg_Sales=('Sales', 'mean'),
    Total_Quantity=('Quantity', 'sum'),
    Num_Transactions=('Sales', 'count'),
    Max_Sale=('Sales', 'max')
)
print(result)
#              Total_Sales  Avg_Sales  Total_Quantity  Num_Transactions  Max_Sale
# Category
# Accessories          170   56.666667              12                 3        75
# Electronics         2200  1100.000000               5                 2      1200
```

### Different Aggregations per Column

```python
# Different functions for different columns
result = sales.groupby('Product').agg({
    'Sales': ['sum', 'mean', 'count'],
    'Quantity': 'sum',
    'Date': 'first'  # First occurrence date
})
print(result)
```

### Real-World Example: Customer Analysis

```python
# Customer transaction data
customers = pd.DataFrame({
    'CustomerID': ['C1', 'C1', 'C2', 'C2', 'C3', 'C1', 'C2'],
    'OrderDate': pd.to_datetime(['2024-01-01', '2024-01-15', '2024-01-05',
                                 '2024-01-20', '2024-01-10', '2024-02-01',
                                 '2024-02-05']),
    'Amount': [100, 150, 200, 180, 90, 120, 220],
    'Category': ['A', 'B', 'A', 'A', 'C', 'A', 'B']
})

# Customer lifetime value analysis
customer_ltv = customers.groupby('CustomerID').agg(
    Total_Spend=('Amount', 'sum'),
    Avg_Order_Value=('Amount', 'mean'),
    Num_Orders=('Amount', 'count'),
    First_Order=('OrderDate', 'min'),
    Last_Order=('OrderDate', 'max'),
    Favorite_Category=('Category', lambda x: x.mode()[0] if not x.mode().empty else None)
)

# Calculate days since last order
customer_ltv['Days_Since_Last_Order'] = (
    pd.Timestamp('2024-02-10') - customer_ltv['Last_Order']
).dt.days

print(customer_ltv)
#             Total_Spend  Avg_Order_Value  Num_Orders First_Order  Last_Order Favorite_Category  Days_Since_Last_Order
# CustomerID
# C1                 370        123.333333           3  2024-01-01  2024-02-01                 A                      9
# C2                 600        200.000000           3  2024-01-05  2024-02-05                 A                      5
# C3                  90         90.000000           1  2024-01-10  2024-01-10                 C                     31
```

---

## Transformation and Filtering

### Transform

Transform returns a Series/DataFrame with the same shape as the input.

```python
# Add group-level statistics to original DataFrame
sales['Category_Avg'] = sales.groupby('Category')['Sales'].transform('mean')
sales['Category_Total'] = sales.groupby('Category')['Sales'].transform('sum')
sales['Sales_Pct_of_Category'] = (sales['Sales'] / sales['Category_Total']) * 100

print(sales[['Product', 'Category', 'Sales', 'Category_Avg', 'Sales_Pct_of_Category']])
#     Product     Category  Sales  Category_Avg  Sales_Pct_of_Category
# 0    Laptop  Electronics   1000    1100.000000              45.454545
# 1     Mouse  Accessories     50      56.666667              29.411765
# 2    Laptop  Electronics   1200    1100.000000              54.545455
# 3  Keyboard  Accessories     75      56.666667              44.117647
# 4     Mouse  Accessories     45      56.666667              26.470588

# Normalize within groups (z-score)
sales['Sales_Normalized'] = sales.groupby('Category')['Sales'].transform(
    lambda x: (x - x.mean()) / x.std()
)
```

### Filter Groups

Filter returns only groups that meet a condition.

```python
# Keep only categories with total sales > 500
high_sales_categories = sales.groupby('Category').filter(
    lambda x: x['Sales'].sum() > 500
)
print(high_sales_categories)
# Only Electronics category remains (total = 2200)

# Keep products sold more than once
popular_products = sales.groupby('Product').filter(
    lambda x: len(x) > 1
)
print(popular_products)
# Laptop and Mouse remain (both appear twice)
```

### Apply Custom Functions

```python
# Apply any custom function to groups
def calculate_stats(group):
    return pd.Series({
        'count': len(group),
        'mean_sales': group['Sales'].mean(),
        'total_sales': group['Sales'].sum(),
        'top_product': group.nlargest(1, 'Sales')['Product'].iloc[0]
    })

category_analysis = sales.groupby('Category').apply(calculate_stats)
print(category_analysis)
#              count  mean_sales  total_sales top_product
# Category
# Accessories    3.0   56.666667        170.0    Keyboard
# Electronics    2.0  1100.000000       2200.0      Laptop
```

### Real-World Example: Outlier Detection

```python
# Detect outliers within each product group
product_data = pd.DataFrame({
    'Product': ['A']*20 + ['B']*20 + ['C']*20,
    'Price': (
        np.random.normal(100, 10, 20).tolist() + [500] +  # A with outlier
        np.random.normal(200, 15, 20).tolist() +
        np.random.normal(150, 12, 19).tolist()
    )
})

# Flag outliers (> 3 std deviations from group mean)
def flag_outliers(group):
    mean = group['Price'].mean()
    std = group['Price'].std()
    group['Is_Outlier'] = (
        (group['Price'] < mean - 3*std) |
        (group['Price'] > mean + 3*std)
    )
    return group

product_data = product_data.groupby('Product').apply(flag_outliers)
print(product_data[product_data['Is_Outlier']])
```

---

## Merging DataFrames

### Inner Join (Default)

```python
# Employee data
employees = pd.DataFrame({
    'EmployeeID': [1, 2, 3, 4],
    'Name': ['Alice', 'Bob', 'Charlie', 'Diana'],
    'DeptID': [10, 20, 10, 30]
})

# Department data
departments = pd.DataFrame({
    'DeptID': [10, 20, 40],
    'DeptName': ['Sales', 'Marketing', 'IT']
})

# Inner join (only matching rows)
inner_merged = pd.merge(employees, departments, on='DeptID', how='inner')
print(inner_merged)
#    EmployeeID     Name  DeptID    DeptName
# 0           1    Alice      10       Sales
# 1           3  Charlie      10       Sales
# 2           2      Bob      20   Marketing
# Note: Diana (DeptID 30) and IT dept (DeptID 40) are excluded
```

### Left Join

```python
# Left join (all rows from left, matching from right)
left_merged = pd.merge(employees, departments, on='DeptID', how='left')
print(left_merged)
#    EmployeeID     Name  DeptID    DeptName
# 0           1    Alice      10       Sales
# 1           2      Bob      20   Marketing
# 2           3  Charlie      10       Sales
# 3           4    Diana      30         NaN  # No matching dept
```

### Right Join

```python
# Right join (all rows from right, matching from left)
right_merged = pd.merge(employees, departments, on='DeptID', how='right')
print(right_merged)
#    EmployeeID     Name  DeptID DeptName
# 0         1.0    Alice      10    Sales
# 1         3.0  Charlie      10    Sales
# 2         2.0      Bob      20 Marketing
# 3         NaN      NaN      40       IT  # No employee in IT
```

### Outer Join

```python
# Outer join (all rows from both)
outer_merged = pd.merge(employees, departments, on='DeptID', how='outer')
print(outer_merged)
#    EmployeeID     Name  DeptID    DeptName
# 0         1.0    Alice      10       Sales
# 1         3.0  Charlie      10       Sales
# 2         2.0      Bob      20   Marketing
# 3         4.0    Diana      30         NaN
# 4         NaN      NaN      40          IT
```

### Merging on Different Column Names

```python
# Different column names in each DataFrame
orders = pd.DataFrame({
    'OrderID': [1, 2, 3],
    'CustomerID': [101, 102, 101],
    'Amount': [250, 150, 300]
})

customers = pd.DataFrame({
    'ID': [101, 102, 103],
    'Name': ['Alice', 'Bob', 'Charlie']
})

# Merge on different column names
merged = pd.merge(
    orders,
    customers,
    left_on='CustomerID',
    right_on='ID',
    how='left'
)
print(merged)
#    OrderID  CustomerID  Amount   ID    Name
# 0        1         101     250  101   Alice
# 1        2         102     150  102     Bob
# 2        3         101     300  101   Alice
```

### Merging on Multiple Columns

```python
# Sales data
sales_data = pd.DataFrame({
    'Date': ['2024-01-01', '2024-01-01', '2024-01-02'],
    'Store': ['A', 'B', 'A'],
    'Sales': [1000, 1500, 1200]
})

# Inventory data
inventory = pd.DataFrame({
    'Date': ['2024-01-01', '2024-01-01', '2024-01-02'],
    'Store': ['A', 'B', 'A'],
    'Stock': [100, 150, 120]
})

# Merge on both Date and Store
merged = pd.merge(sales_data, inventory, on=['Date', 'Store'])
print(merged)
#          Date Store  Sales  Stock
# 0  2024-01-01     A   1000    100
# 1  2024-01-01     B   1500    150
# 2  2024-01-02     A   1200    120
```

### Indicator Column

```python
# Track source of each row
merged = pd.merge(
    employees,
    departments,
    on='DeptID',
    how='outer',
    indicator=True
)
print(merged)
#    EmployeeID     Name  DeptID DeptName      _merge
# 0         1.0    Alice      10    Sales        both
# 1         3.0  Charlie      10    Sales        both
# 2         2.0      Bob      20 Marketing       both
# 3         4.0    Diana      30      NaN   left_only
# 4         NaN      NaN      40       IT  right_only
```

### Real-World Example: Order Fulfillment

```python
# Orders
orders = pd.DataFrame({
    'OrderID': ['O1', 'O2', 'O3', 'O4', 'O5'],
    'CustomerID': ['C1', 'C2', 'C1', 'C3', 'C4'],
    'ProductID': ['P1', 'P2', 'P1', 'P3', 'P2'],
    'Quantity': [2, 1, 3, 1, 2],
    'OrderDate': pd.to_datetime(['2024-01-01', '2024-01-02', '2024-01-03',
                                 '2024-01-03', '2024-01-04'])
})

# Products
products = pd.DataFrame({
    'ProductID': ['P1', 'P2', 'P3'],
    'ProductName': ['Laptop', 'Mouse', 'Keyboard'],
    'Price': [1000, 25, 75]
})

# Customers
customers = pd.DataFrame({
    'CustomerID': ['C1', 'C2', 'C3'],
    'Name': ['Alice', 'Bob', 'Charlie'],
    'City': ['NY', 'LA', 'SF']
})

# Create comprehensive order view
order_details = orders.merge(products, on='ProductID', how='left')
order_details = order_details.merge(customers, on='CustomerID', how='left')
order_details['Total'] = order_details['Price'] * order_details['Quantity']

print(order_details[['OrderID', 'Name', 'ProductName', 'Quantity', 'Price', 'Total']])
#   OrderID     Name ProductName  Quantity  Price  Total
# 0      O1    Alice      Laptop         2   1000   2000
# 1      O2      Bob       Mouse         1     25     25
# 2      O3    Alice      Laptop         3   1000   3000
# 3      O4  Charlie    Keyboard         1     75     75
# 4      O5      NaN       Mouse         2     25     50  # Customer C4 not in customers
```

---

## Joining DataFrames

### Join using Index

```python
# DataFrames with index
employees_indexed = employees.set_index('EmployeeID')
salaries = pd.DataFrame({
    'Salary': [70000, 80000, 75000],
    'Bonus': [5000, 6000, 5500]
}, index=[1, 2, 3])

# Join on index
joined = employees_indexed.join(salaries, how='left')
print(joined)
#                Name  DeptID   Salary   Bonus
# EmployeeID
# 1             Alice      10  70000.0  5000.0
# 2               Bob      20  80000.0  6000.0
# 3           Charlie      10  75000.0  5500.0
# 4             Diana      30      NaN     NaN
```

### Join with Different Index Names

```python
# Join when indices have different names
df1 = pd.DataFrame({'A': [1, 2, 3]}, index=pd.Index([10, 20, 30], name='ID1'))
df2 = pd.DataFrame({'B': [4, 5, 6]}, index=pd.Index([10, 20, 40], name='ID2'))

joined = df1.join(df2, how='outer')
print(joined)
#       A    B
# ID1
# 10   1.0  4.0
# 20   2.0  5.0
# 30   3.0  NaN
# 40   NaN  6.0
```

---

## Concatenating DataFrames

### Vertical Concatenation (Stacking Rows)

```python
# Q1 Sales
q1_sales = pd.DataFrame({
    'Product': ['A', 'B', 'C'],
    'Sales': [100, 150, 120]
})

# Q2 Sales
q2_sales = pd.DataFrame({
    'Product': ['A', 'B', 'C'],
    'Sales': [110, 160, 125]
})

# Concatenate vertically
yearly_sales = pd.concat([q1_sales, q2_sales], ignore_index=True)
print(yearly_sales)
#   Product  Sales
# 0       A    100
# 1       B    150
# 2       C    120
# 3       A    110
# 4       B    160
# 5       C    125

# Keep track of source with keys
yearly_sales = pd.concat(
    [q1_sales, q2_sales],
    keys=['Q1', 'Q2'],
    names=['Quarter', 'Index']
)
print(yearly_sales)
#               Product  Sales
# Quarter Index
# Q1      0           A    100
#         1           B    150
#         2           C    120
# Q2      0           A    110
#         1           B    160
#         2           C    125
```

### Horizontal Concatenation (Adding Columns)

```python
# Product info
products = pd.DataFrame({
    'Product': ['A', 'B', 'C'],
    'Category': ['Electronics', 'Clothing', 'Food']
})

# Price info
prices = pd.DataFrame({
    'Price': [100, 50, 25],
    'Stock': [50, 100, 200]
})

# Concatenate horizontally
combined = pd.concat([products, prices], axis=1)
print(combined)
#   Product     Category  Price  Stock
# 0       A  Electronics    100     50
# 1       B     Clothing     50    100
# 2       C         Food     25    200
```

### Handling Different Columns

```python
df1 = pd.DataFrame({
    'A': [1, 2, 3],
    'B': [4, 5, 6]
})

df2 = pd.DataFrame({
    'B': [7, 8, 9],
    'C': [10, 11, 12]
})

# Inner join on columns (only common columns)
concat_inner = pd.concat([df1, df2], join='inner')
print(concat_inner)
#    B
# 0  4
# 1  5
# 2  6
# 0  7
# 1  8
# 2  9

# Outer join on columns (all columns, fill with NaN)
concat_outer = pd.concat([df1, df2], join='outer')
print(concat_outer)
#      A  B     C
# 0  1.0  4   NaN
# 1  2.0  5   NaN
# 2  3.0  6   NaN
# 0  NaN  7  10.0
# 1  NaN  8  11.0
# 2  NaN  9  12.0
```

### Real-World Example: Combining Regional Data

```python
# Regional sales data
north_sales = pd.DataFrame({
    'Date': pd.date_range('2024-01-01', periods=5, freq='D'),
    'Sales': [1000, 1100, 1050, 1200, 1150],
    'Region': 'North'
})

south_sales = pd.DataFrame({
    'Date': pd.date_range('2024-01-01', periods=5, freq='D'),
    'Sales': [800, 850, 900, 920, 950],
    'Region': 'South'
})

east_sales = pd.DataFrame({
    'Date': pd.date_range('2024-01-01', periods=5, freq='D'),
    'Sales': [1200, 1250, 1300, 1280, 1320],
    'Region': 'East'
})

# Combine all regions
all_regions = pd.concat(
    [north_sales, south_sales, east_sales],
    keys=['North', 'South', 'East'],
    names=['Region', 'Index']
).reset_index(level=0)

print(all_regions.head(10))
#   Region       Date  Sales
# 0  North 2024-01-01   1000
# 1  North 2024-01-02   1100
# 2  North 2024-01-03   1050
# ...

# Pivot for comparison
sales_comparison = all_regions.pivot(index='Date', columns='Region', values='Sales')
print(sales_comparison)
# Region       East  North  South
# Date
# 2024-01-01  1200   1000    800
# 2024-01-02  1250   1100    850
# 2024-01-03  1300   1050    900
# 2024-01-04  1280   1200    920
# 2024-01-05  1320   1150    950
```

---

## Common Operations Cheat Sheet

```
┌──────────────────────────────┬─────────────────────────────────────────┐
│ Operation                    │ Code                                    │
├──────────────────────────────┼─────────────────────────────────────────┤
│ GROUPBY                      │                                         │
│ Group by column              │ df.groupby('col')                       │
│ Group by multiple            │ df.groupby(['col1', 'col2'])            │
│ Aggregate                    │ grouped.agg('sum')                      │
│ Multiple aggregations        │ grouped.agg(['sum', 'mean'])            │
│ Named aggregations           │ grouped.agg(Total=('col', 'sum'))       │
│ Different agg per column     │ grouped.agg({'A':'sum', 'B':'mean'})    │
│ Transform                    │ grouped.transform('mean')               │
│ Filter groups                │ grouped.filter(lambda x: len(x) > 2)    │
│ Apply custom function        │ grouped.apply(custom_func)              │
│ Get group                    │ grouped.get_group('group_name')         │
├──────────────────────────────┼─────────────────────────────────────────┤
│ MERGING                      │                                         │
│ Inner join                   │ pd.merge(df1, df2, on='key')            │
│ Left join                    │ pd.merge(df1, df2, how='left')          │
│ Right join                   │ pd.merge(df1, df2, how='right')         │
│ Outer join                   │ pd.merge(df1, df2, how='outer')         │
│ Different key names          │ pd.merge(df1, df2, left_on='a',         │
│                              │          right_on='b')                  │
│ Multiple keys                │ pd.merge(df1, df2, on=['k1', 'k2'])     │
│ With indicator               │ pd.merge(df1, df2, indicator=True)      │
├──────────────────────────────┼─────────────────────────────────────────┤
│ JOINING                      │                                         │
│ Join on index                │ df1.join(df2)                           │
│ Left join                    │ df1.join(df2, how='left')               │
│ Join on column               │ df1.join(df2, on='key')                 │
├──────────────────────────────┼─────────────────────────────────────────┤
│ CONCATENATING                │                                         │
│ Vertical (rows)              │ pd.concat([df1, df2])                   │
│ Horizontal (columns)         │ pd.concat([df1, df2], axis=1)           │
│ Ignore index                 │ pd.concat([df1, df2], ignore_index=True)│
│ With keys                    │ pd.concat([df1, df2], keys=['A', 'B'])  │
│ Inner join columns           │ pd.concat([df1, df2], join='inner')     │
└──────────────────────────────┴─────────────────────────────────────────┘
```

---

## Common Mistakes

### 1. Not Resetting Index After GroupBy

```python
# MISTAKE: Index becomes the grouping column
grouped = df.groupby('Category')['Sales'].sum()
print(grouped)
# Category
# Accessories     170
# Electronics    2200
# Name: Sales, dtype: int64

# Can't access Category as a column!
# grouped['Category']  # KeyError!

# CORRECT: Reset index
result = df.groupby('Category')['Sales'].sum().reset_index()
print(result)
#       Category  Sales
# 0  Accessories    170
# 1  Electronics   2200
# Now Category is a column again
```

### 2. Forgetting How Parameter in Merge

```python
# MISTAKE: Missing 'how' parameter (defaults to inner)
merged = pd.merge(employees, departments, on='DeptID')
# May lose rows if not all keys match!

# CORRECT: Be explicit
merged = pd.merge(employees, departments, on='DeptID', how='left')
```

### 3. Duplicate Column Names After Merge

```python
df1 = pd.DataFrame({'ID': [1, 2], 'Value': [10, 20]})
df2 = pd.DataFrame({'ID': [1, 2], 'Value': [30, 40]})

# MISTAKE: Pandas adds _x and _y suffixes
merged = pd.merge(df1, df2, on='ID')
print(merged.columns)
# Index(['ID', 'Value_x', 'Value_y'], dtype='object')

# CORRECT: Use suffixes parameter
merged = pd.merge(df1, df2, on='ID', suffixes=('_old', '_new'))
print(merged.columns)
# Index(['ID', 'Value_old', 'Value_new'], dtype='object')
```

### 4. Wrong Axis in Concatenate

```python
# MISTAKE: Using wrong axis
concat_wrong = pd.concat([df1, df2], axis=1)  # Adds columns instead of rows!

# CORRECT: axis=0 for rows (default)
concat_correct = pd.concat([df1, df2], axis=0)
```

### 5. Not Handling Duplicate Indices in Concat

```python
df1 = pd.DataFrame({'A': [1, 2]}, index=[0, 1])
df2 = pd.DataFrame({'A': [3, 4]}, index=[0, 1])

# MISTAKE: Duplicate indices
concat = pd.concat([df1, df2])
print(concat)
#    A
# 0  1  # Duplicate index!
# 1  2
# 0  3  # Duplicate index!
# 1  4

# CORRECT: Use ignore_index
concat = pd.concat([df1, df2], ignore_index=True)
print(concat)
#    A
# 0  1
# 1  2
# 2  3
# 3  4
```

### 6. Using Apply When Agg Would Work

```python
# SLOW: Using apply
result = sales.groupby('Category').apply(lambda x: x['Sales'].sum())

# FAST: Using agg
result = sales.groupby('Category')['Sales'].sum()
# Or
result = sales.groupby('Category').agg({'Sales': 'sum'})
```

---

## Performance Tips

### 1. Use Built-in Aggregations

```python
# SLOW: Custom function
result = df.groupby('Category')['Sales'].apply(lambda x: x.sum())

# FAST: Built-in
result = df.groupby('Category')['Sales'].sum()
```

### 2. Avoid Apply When Possible

```python
# SLOW: Apply with custom function
def calculate_total(group):
    return (group['Price'] * group['Quantity']).sum()

result = df.groupby('Category').apply(calculate_total)

# FAST: Direct aggregation
result = (df['Price'] * df['Quantity']).groupby(df['Category']).sum()
```

### 3. Use Categorical Data for GroupBy

```python
# SLOW: String groupby
df['Category'] = df['Category']  # object dtype

# FAST: Categorical groupby
df['Category'] = df['Category'].astype('category')
# GroupBy operations are faster on categorical data
```

### 4. Merge on Sorted Data

```python
# Faster when both DataFrames are sorted on merge key
df1 = df1.sort_values('key')
df2 = df2.sort_values('key')
merged = pd.merge(df1, df2, on='key')
```

### 5. Use Join Instead of Merge When Appropriate

```python
# SLOW: Merge on index
merged = pd.merge(df1, df2, left_index=True, right_index=True)

# FAST: Join (optimized for index-based joins)
joined = df1.join(df2)
```

### 6. Filter Before Grouping

```python
# SLOW: Group then filter
result = df.groupby('Category')['Sales'].sum()
result = result[result > 1000]

# FAST: Filter then group
result = df[df['Sales'] > 100].groupby('Category')['Sales'].sum()
```

---

## Summary

### Key Takeaways

1. **GroupBy follows split-apply-combine** paradigm
2. **Use agg() for multiple aggregations** on grouped data
3. **Transform maintains original shape**, filter removes groups
4. **Merge is like SQL JOIN** with how parameter controlling join type
5. **Join is optimized for index-based** merging
6. **Concat stacks DataFrames** vertically or horizontally
7. **Always specify 'how'** in merge to be explicit
8. **Use reset_index()** after groupby to make grouping columns accessible

### Join Type Summary
```
┌────────────┬─────────────────────────────────────────┐
│ Join Type  │ Description                             │
├────────────┼─────────────────────────────────────────┤
│ inner      │ Only matching rows from both            │
│ left       │ All from left + matching from right     │
│ right      │ All from right + matching from left     │
│ outer      │ All rows from both (union)              │
│ cross      │ Cartesian product of both               │
└────────────┴─────────────────────────────────────────┘
```

### GroupBy vs Transform vs Apply
```
┌────────────┬─────────────────┬──────────────────────┐
│ Method     │ Output Shape    │ Use Case             │
├────────────┼─────────────────┼──────────────────────┤
│ agg()      │ Reduced         │ Summary statistics   │
│ transform()│ Same as input   │ Add group stats      │
│ filter()   │ Subset of input │ Keep certain groups  │
│ apply()    │ Flexible        │ Custom operations    │
└────────────┴─────────────────┴──────────────────────┘
```

### Next Steps
- Move to `pandas-advanced.md` for MultiIndex, DateTime, Pivot Tables
- Practice with real datasets from Kaggle
- Explore advanced aggregation patterns

---

**Master GroupBy and merging operations, and you'll handle complex data transformations with ease!**
