# Pandas Advanced Topics

## Table of Contents
1. [MultiIndex (Hierarchical Indexing)](#multiindex-hierarchical-indexing)
2. [String Operations](#string-operations)
3. [DateTime Operations](#datetime-operations)
4. [Pivot Tables](#pivot-tables)
5. [Reshaping Data](#reshaping-data)
6. [Common Operations Cheat Sheet](#common-operations-cheat-sheet)
7. [Common Mistakes](#common-mistakes)
8. [Performance Tips](#performance-tips)

---

## MultiIndex (Hierarchical Indexing)

### What is MultiIndex?
MultiIndex allows you to have multiple levels of indexing on an axis. Think of it as having multiple dimensions without moving to higher-dimensional arrays.

### Creating MultiIndex

```python
import pandas as pd
import numpy as np

# Method 1: From tuples
index = pd.MultiIndex.from_tuples([
    ('US', 'NY', 'Manhattan'),
    ('US', 'NY', 'Brooklyn'),
    ('US', 'CA', 'SF'),
    ('UK', 'England', 'London'),
    ('UK', 'Scotland', 'Edinburgh')
], names=['Country', 'State', 'City'])

population = pd.Series([1600000, 2600000, 875000, 9000000, 500000], index=index)
print(population)
# Country  State     City
# US       NY        Manhattan      1600000
#                    Brooklyn       2600000
#          CA        SF              875000
# UK       England   London         9000000
#          Scotland  Edinburgh       500000

# Method 2: From arrays
arrays = [
    ['A', 'A', 'B', 'B'],
    ['x', 'y', 'x', 'y']
]
index = pd.MultiIndex.from_arrays(arrays, names=['Letter', 'Coord'])

# Method 3: From product (Cartesian product)
index = pd.MultiIndex.from_product(
    [['2024', '2025'], ['Q1', 'Q2', 'Q3', 'Q4']],
    names=['Year', 'Quarter']
)
print(index)
# MultiIndex([('2024', 'Q1'),
#             ('2024', 'Q2'),
#             ('2024', 'Q3'),
#             ('2024', 'Q4'),
#             ('2025', 'Q1'),
#             ('2025', 'Q2'),
#             ('2025', 'Q3'),
#             ('2025', 'Q4')],
#            names=['Year', 'Quarter'])
```

### Creating MultiIndex DataFrame

```python
# Sales data with hierarchical index
index = pd.MultiIndex.from_product(
    [['North', 'South', 'East', 'West'],
     ['Q1', 'Q2', 'Q3', 'Q4']],
    names=['Region', 'Quarter']
)

np.random.seed(42)
sales_df = pd.DataFrame({
    'Sales': np.random.randint(10000, 50000, 16),
    'Profit': np.random.randint(1000, 10000, 16),
    'Units': np.random.randint(100, 500, 16)
}, index=index)

print(sales_df.head(8))
#                 Sales  Profit  Units
# Region Quarter
# North  Q1       24693    5492    451
#        Q2       16530    2030    271
#        Q3       48360    8220    482
#        Q4       25133    6987    374
# South  Q1       45423    8574    423
#        Q2       43380    3187    460
#        Q3       37693    4187    460
#        Q4       44030    7987    423
```

### Indexing with MultiIndex

```python
# Select outer level
print(sales_df.loc['North'])
#          Sales  Profit  Units
# Quarter
# Q1       24693    5492    451
# Q2       16530    2030    271
# Q3       48360    8220    482
# Q4       25133    6987    374

# Select specific combination
print(sales_df.loc[('North', 'Q1')])
# Sales     24693
# Profit     5492
# Units       451

# Slice outer level
print(sales_df.loc['North':'South'])

# Using idx (IndexSlice)
idx = pd.IndexSlice
print(sales_df.loc[idx[:, 'Q1'], :])  # All regions, Q1 only
#                 Sales  Profit  Units
# Region Quarter
# North  Q1       24693    5492    451
# South  Q1       45423    8574    423
# East   Q1       20023    3230    223
# West   Q1       30230    4987    330

# Cross section (xs)
print(sales_df.xs('Q1', level='Quarter'))
#         Sales  Profit  Units
# Region
# North   24693    5492    451
# South   45423    8574    423
# East    20023    3230    223
# West    30230    4987    330
```

### Operations on MultiIndex

```python
# Sum by outer level
print(sales_df.sum(level='Region'))
#          Sales  Profit   Units
# Region
# North   114716   22729    1578
# South   170526   23935    1766
# East    143216   18944    1502
# West    149542   21161    1554

# Sum by inner level
print(sales_df.sum(level='Quarter'))
#          Sales  Profit  Units
# Quarter
# Q1       120369   22283   1427
# Q2       118140   16374   1445
# Q3       165259   23531   1624
# Q4       156232   25751   1504

# Unstack (pivot inner level to columns)
print(sales_df['Sales'].unstack())
# Quarter     Q1     Q2     Q3     Q4
# Region
# North    24693  16530  48360  25133
# South    45423  43380  37693  44030
# East     20023  28230  45000  49963
# West     30230  30000  34206  55106

# Stack (opposite of unstack)
unstacked = sales_df['Sales'].unstack()
stacked = unstacked.stack()
print(stacked)
# Same as original sales_df['Sales']
```

### Swapping and Reordering Levels

```python
# Swap levels
swapped = sales_df.swaplevel('Region', 'Quarter')
print(swapped.head())
#                 Sales  Profit  Units
# Quarter Region
# Q1      North   24693    5492    451
# Q2      North   16530    2030    271
# Q3      North   48360    8220    482
# Q4      North   25133    6987    374
# Q1      South   45423    8574    423

# Sort by index (important for performance)
sorted_df = sales_df.sort_index()

# Reorder levels
reordered = sales_df.reorder_levels(['Quarter', 'Region'])
```

### Real-World Example: Stock Prices

```python
# Multi-level stock data
stocks = ['AAPL', 'GOOGL', 'MSFT']
dates = pd.date_range('2024-01-01', periods=5, freq='D')

index = pd.MultiIndex.from_product([stocks, dates], names=['Stock', 'Date'])

stock_data = pd.DataFrame({
    'Open': np.random.uniform(100, 200, 15),
    'High': np.random.uniform(100, 200, 15),
    'Low': np.random.uniform(100, 200, 15),
    'Close': np.random.uniform(100, 200, 15),
    'Volume': np.random.randint(1000000, 10000000, 15)
}, index=index)

# Get all data for AAPL
aapl_data = stock_data.loc['AAPL']
print(aapl_data.head())

# Get specific date for all stocks
jan_1_data = stock_data.xs('2024-01-01', level='Date')
print(jan_1_data)

# Calculate daily returns for each stock
stock_data['Return'] = stock_data.groupby('Stock')['Close'].pct_change()
```

---

## String Operations

### String Methods via .str Accessor

```python
# Sample data
products = pd.Series([
    'apple iphone 14 pro',
    'Samsung Galaxy S23',
    'GOOGLE Pixel 8',
    'Apple MacBook Pro',
    'samsung tablet',
    None,  # Missing value
    'Sony WH-1000XM5'
])

# Case conversion
print(products.str.upper())
# 0    APPLE IPHONE 14 PRO
# 1    SAMSUNG GALAXY S23
# 2      GOOGLE PIXEL 8
# 3    APPLE MACBOOK PRO
# 4      SAMSUNG TABLET
# 5                  NaN
# 6      SONY WH-1000XM5

print(products.str.lower())
print(products.str.title())
print(products.str.capitalize())

# String contains
print(products.str.contains('apple', case=False, na=False))
# 0     True
# 1    False
# 2    False
# 3     True
# 4    False
# 5    False  # na=False treats NaN as False
# 6    False

# Startswith/Endswith
print(products.str.startswith('Apple'))
print(products.str.endswith('Pro'))

# Replace
print(products.str.replace('Samsung', 'SAMSUNG', case=False))

# Strip whitespace
messy = pd.Series(['  text  ', 'more text  ', '  spaces'])
print(messy.str.strip())
# 0        text
# 1    more text
# 2      spaces

# Length
print(products.str.len())
# 0    19.0
# 1    18.0
# ...
# 5     NaN
```

### Splitting and Extracting

```python
# Split strings
full_names = pd.Series(['John Doe', 'Jane Smith', 'Bob Johnson'])

# Split into list
print(full_names.str.split())
# 0      [John, Doe]
# 1    [Jane, Smith]
# 2  [Bob, Johnson]

# Expand into columns
print(full_names.str.split(expand=True))
#        0         1
# 0   John       Doe
# 1   Jane     Smith
# 2    Bob   Johnson

# Get specific part
first_names = full_names.str.split().str[0]
last_names = full_names.str.split().str[1]

# Extract with regex
emails = pd.Series([
    'john.doe@example.com',
    'jane_smith@company.org',
    'bob@test.net'
])

# Extract username (before @)
usernames = emails.str.extract(r'([^@]+)@')
print(usernames)
#            0
# 0    john.doe
# 1  jane_smith
# 2         bob

# Extract all matches
text = pd.Series(['Phone: 123-456-7890, Work: 098-765-4321'])
phones = text.str.findall(r'\d{3}-\d{3}-\d{4}')
print(phones)
# 0    [123-456-7890, 098-765-4321]

# Extract groups
products = pd.Series([
    'iPhone 14 Pro',
    'Galaxy S23 Ultra',
    'Pixel 8 Pro'
])

# Extract model and variant
extracted = products.str.extract(r'([A-Za-z]+\s*\d+)\s*(.*)')
print(extracted)
#             0      1
# 0   iPhone 14    Pro
# 1    Galaxy S23  Ultra
# 2     Pixel 8    Pro
```

### String Matching and Filtering

```python
# Match pattern (returns boolean)
pattern = r'^[A-Z][a-z]+'  # Starts with capital letter
print(products.str.match(pattern))

# Filter DataFrame by string condition
df = pd.DataFrame({
    'Product': ['Laptop', 'Mouse', 'Keyboard', 'Monitor'],
    'Brand': ['Dell', 'Logitech', 'Microsoft', 'LG'],
    'Price': [1000, 25, 75, 300]
})

# Products containing 'o'
filtered = df[df['Product'].str.contains('o', case=False)]
print(filtered)
#    Product     Brand  Price
# 1    Mouse  Logitech     25
# 2 Keyboard  Microsoft     75
# 3  Monitor        LG    300

# Brands starting with 'L'
l_brands = df[df['Brand'].str.startswith('L')]
print(l_brands)
```

### Real-World Example: Text Cleaning

```python
# Messy customer data
customers = pd.DataFrame({
    'Name': ['  John Doe  ', 'JANE SMITH', 'bob johnson', 'Alice_Williams'],
    'Email': ['john.doe@EXAMPLE.com', 'jane@Company.ORG', 'BOB@test.net', 'alice@demo.COM'],
    'Phone': ['(123) 456-7890', '123-456-7890', '1234567890', '+1-123-456-7890']
})

# Clean names
customers['Name_Clean'] = (
    customers['Name']
    .str.strip()
    .str.title()
    .str.replace('_', ' ')
)

# Standardize emails
customers['Email_Clean'] = (
    customers['Email']
    .str.lower()
    .str.strip()
)

# Extract area code from phone
customers['Area_Code'] = (
    customers['Phone']
    .str.replace(r'[^\d]', '', regex=True)  # Remove non-digits
    .str[:3]  # First 3 digits
)

print(customers[['Name_Clean', 'Email_Clean', 'Area_Code']])
#       Name_Clean         Email_Clean Area_Code
# 0       John Doe    john.doe@example.com       123
# 1     Jane Smith      jane@company.org       123
# 2    Bob Johnson         bob@test.net       123
# 3  Alice Williams       alice@demo.com       112
```

---

## DateTime Operations

### Creating DateTime

```python
# From strings
dates = pd.to_datetime([
    '2024-01-01',
    '01/15/2024',
    'March 3, 2024',
    '2024-04-01 14:30:00'
])
print(dates)
# DatetimeIndex(['2024-01-01 00:00:00', '2024-01-15 00:00:00',
#                '2024-03-03 00:00:00', '2024-04-01 14:30:00'],
#               dtype='datetime64[ns]', freq=None)

# From DataFrame column
df = pd.DataFrame({
    'Date': ['2024-01-01', '2024-01-02', '2024-01-03'],
    'Sales': [100, 150, 120]
})
df['Date'] = pd.to_datetime(df['Date'])

# From components
df2 = pd.DataFrame({
    'Year': [2024, 2024, 2024],
    'Month': [1, 2, 3],
    'Day': [15, 20, 25]
})
df2['Date'] = pd.to_datetime(df2[['Year', 'Month', 'Day']])

# Date ranges
date_range = pd.date_range('2024-01-01', periods=10, freq='D')
print(date_range)
# DatetimeIndex(['2024-01-01', '2024-01-02', ..., '2024-01-10'],
#               dtype='datetime64[ns]', freq='D')

# Business days only
business_days = pd.bdate_range('2024-01-01', periods=10)

# Custom frequency
weekly = pd.date_range('2024-01-01', periods=10, freq='W')
monthly = pd.date_range('2024-01-01', periods=12, freq='MS')  # Month start
```

### DateTime Attributes

```python
# Sample datetime series
dates = pd.date_range('2024-01-01', periods=100, freq='D')
df = pd.DataFrame({
    'Date': dates,
    'Sales': np.random.randint(100, 1000, 100)
})

# Extract components
df['Year'] = df['Date'].dt.year
df['Month'] = df['Date'].dt.month
df['Day'] = df['Date'].dt.day
df['DayOfWeek'] = df['Date'].dt.dayofweek  # Monday=0
df['DayName'] = df['Date'].dt.day_name()
df['Quarter'] = df['Date'].dt.quarter
df['WeekOfYear'] = df['Date'].dt.isocalendar().week
df['IsWeekend'] = df['Date'].dt.dayofweek.isin([5, 6])

print(df.head())
#         Date  Sales  Year  Month  Day  DayOfWeek  DayName  Quarter  WeekOfYear  IsWeekend
# 0 2024-01-01    451  2024      1    1          0   Monday        1           1      False
# 1 2024-01-02    271  2024      1    2          1  Tuesday        1           1      False
# 2 2024-01-03    482  2024      1    3          2 Wednesday       1           1      False
```

### DateTime Filtering

```python
# Filter by date
jan_sales = df[df['Date'].dt.month == 1]

# Filter by date range
q1_sales = df[(df['Date'] >= '2024-01-01') & (df['Date'] < '2024-04-01')]

# Filter weekdays only
weekday_sales = df[~df['IsWeekend']]

# Filter specific days of week
monday_sales = df[df['DayOfWeek'] == 0]

# Between dates
march_sales = df[df['Date'].between('2024-03-01', '2024-03-31')]
```

### DateTime Arithmetic

```python
# Add/subtract time
df['Tomorrow'] = df['Date'] + pd.Timedelta(days=1)
df['LastWeek'] = df['Date'] - pd.Timedelta(weeks=1)
df['NextMonth'] = df['Date'] + pd.DateOffset(months=1)

# Time difference
df['DaysSinceStart'] = (df['Date'] - df['Date'].min()).dt.days

# Create periods
start_date = pd.Timestamp('2024-01-01')
end_date = pd.Timestamp('2024-12-31')
days_between = (end_date - start_date).days
print(f"Days in 2024: {days_between}")
```

### Resampling (Time-based GroupBy)

```python
# Create time series data
dates = pd.date_range('2024-01-01', periods=365, freq='D')
sales_ts = pd.DataFrame({
    'Date': dates,
    'Sales': np.random.randint(100, 1000, 365)
})
sales_ts.set_index('Date', inplace=True)

# Resample to monthly
monthly_sales = sales_ts.resample('M').sum()
print(monthly_sales.head())
#             Sales
# Date
# 2024-01-31  15234
# 2024-02-29  14789
# 2024-03-31  16012
# ...

# Different aggregations
weekly_stats = sales_ts.resample('W').agg({
    'Sales': ['sum', 'mean', 'min', 'max']
})

# Resample and forward fill
daily_to_weekly = sales_ts.resample('W').ffill()

# Downsample (higher to lower frequency)
hourly_data = pd.DataFrame({
    'Value': np.random.randn(24*7)
}, index=pd.date_range('2024-01-01', periods=24*7, freq='h'))

daily_avg = hourly_data.resample('D').mean()

# Upsample (lower to higher frequency)
monthly_data = pd.DataFrame({
    'Value': [100, 150, 200]
}, index=pd.date_range('2024-01-01', periods=3, freq='MS'))

daily_interpolated = monthly_data.resample('D').interpolate()
```

### Real-World Example: Sales Analytics

```python
# E-commerce sales data
np.random.seed(42)
dates = pd.date_range('2023-01-01', '2024-12-31', freq='H')
sales_data = pd.DataFrame({
    'Timestamp': dates,
    'Sales': np.random.randint(50, 500, len(dates)),
    'Orders': np.random.randint(1, 20, len(dates))
})

sales_data['Timestamp'] = pd.to_datetime(sales_data['Timestamp'])
sales_data.set_index('Timestamp', inplace=True)

# Daily total sales
daily_sales = sales_data.resample('D').agg({
    'Sales': 'sum',
    'Orders': 'sum'
})

# Add day of week analysis
daily_sales['DayOfWeek'] = daily_sales.index.day_name()
daily_sales['IsWeekend'] = daily_sales.index.dayofweek.isin([5, 6])

# Average sales by day of week
dow_avg = daily_sales.groupby('DayOfWeek')['Sales'].mean().sort_values(ascending=False)
print("Average Sales by Day:")
print(dow_avg)

# Month-over-month growth
monthly_sales = sales_data.resample('M')['Sales'].sum()
monthly_sales_growth = monthly_sales.pct_change() * 100

print("\nMonthly Sales Growth %:")
print(monthly_sales_growth.tail())

# Year-over-year comparison
sales_data['Year'] = sales_data.index.year
sales_data['Month'] = sales_data.index.month

yoy_comparison = sales_data.groupby(['Year', 'Month'])['Sales'].sum().unstack(level=0)
print("\nYear-over-Year Sales:")
print(yoy_comparison)
```

---

## Pivot Tables

### Basic Pivot Table

```python
# Sample sales data
sales = pd.DataFrame({
    'Date': pd.date_range('2024-01-01', periods=20, freq='D'),
    'Region': ['North', 'South', 'East', 'West'] * 5,
    'Product': ['A', 'B'] * 10,
    'Sales': np.random.randint(100, 1000, 20),
    'Quantity': np.random.randint(1, 50, 20)
})

# Create pivot table
pivot = pd.pivot_table(
    sales,
    values='Sales',
    index='Region',
    columns='Product',
    aggfunc='sum'
)

print(pivot)
# Product     A     B
# Region
# East     1234  2345
# North    3456  1234
# South    2345  3456
# West     1234  2345
```

### Pivot Table with Multiple Values

```python
# Multiple aggregation columns
pivot_multi = pd.pivot_table(
    sales,
    values=['Sales', 'Quantity'],
    index='Region',
    columns='Product',
    aggfunc='sum'
)

print(pivot_multi)
#         Sales        Quantity
# Product     A     B        A   B
# Region
# East     1234  2345       45  67
# North    3456  1234       89  34
# ...
```

### Pivot Table with Multiple Aggregations

```python
# Different aggregation functions
pivot_agg = pd.pivot_table(
    sales,
    values='Sales',
    index='Region',
    columns='Product',
    aggfunc=['sum', 'mean', 'count']
)

print(pivot_agg)
#            sum        mean       count
# Product      A     B    A     B     A  B
# Region
# East      1234  2345  617 1172.5     2  2
# North     3456  1234 1728   617     2  2
# ...
```

### Pivot Table with Margins (Totals)

```python
# Add row and column totals
pivot_margins = pd.pivot_table(
    sales,
    values='Sales',
    index='Region',
    columns='Product',
    aggfunc='sum',
    margins=True,
    margins_name='Total'
)

print(pivot_margins)
# Product     A     B   Total
# Region
# East     1234  2345    3579
# North    3456  1234    4690
# South    2345  3456    5801
# West     1234  2345    3579
# Total    8269  9380   17649
```

### MultiIndex Pivot Tables

```python
# Pivot with multiple row indices
pivot_multi_idx = pd.pivot_table(
    sales,
    values='Sales',
    index=['Region', 'Product'],
    aggfunc=['sum', 'mean', 'count']
)

print(pivot_multi_idx)
#                  sum       mean  count
# Region Product
# East   A        1234  617.000000      2
#        B        2345 1172.500000      2
# North  A        3456 1728.000000      2
#        B        1234  617.000000      2
# ...
```

### Fill Missing Values in Pivot

```python
# Fill NaN values
pivot_filled = pd.pivot_table(
    sales,
    values='Sales',
    index='Region',
    columns='Product',
    aggfunc='sum',
    fill_value=0
)
```

### Real-World Example: Retail Analysis

```python
# Comprehensive retail data
np.random.seed(42)
retail = pd.DataFrame({
    'Date': pd.date_range('2024-01-01', periods=1000, freq='D'),
    'Store': np.random.choice(['Store_A', 'Store_B', 'Store_C'], 1000),
    'Category': np.random.choice(['Electronics', 'Clothing', 'Food'], 1000),
    'Product': np.random.choice(['TV', 'Laptop', 'Shirt', 'Jeans', 'Apple', 'Bread'], 1000),
    'Sales': np.random.randint(10, 1000, 1000),
    'Quantity': np.random.randint(1, 20, 1000),
    'Profit': np.random.randint(5, 200, 1000)
})

retail['Month'] = retail['Date'].dt.to_period('M')

# Sales by Store and Category
pivot1 = pd.pivot_table(
    retail,
    values='Sales',
    index='Store',
    columns='Category',
    aggfunc='sum',
    margins=True
)

print("Sales by Store and Category:")
print(pivot1)

# Monthly performance by Store
pivot2 = pd.pivot_table(
    retail,
    values=['Sales', 'Profit'],
    index='Month',
    columns='Store',
    aggfunc='sum'
)

print("\nMonthly Performance by Store:")
print(pivot2.head())

# Product performance with multiple metrics
pivot3 = pd.pivot_table(
    retail,
    values=['Sales', 'Quantity', 'Profit'],
    index='Product',
    aggfunc={
        'Sales': 'sum',
        'Quantity': 'sum',
        'Profit': ['sum', 'mean']
    }
)

print("\nProduct Performance:")
print(pivot3)

# Top performing categories per store
pivot4 = pd.pivot_table(
    retail,
    values='Sales',
    index='Category',
    columns='Store',
    aggfunc='sum'
)

print("\nTop Category per Store:")
for store in pivot4.columns:
    top_cat = pivot4[store].idxmax()
    top_sales = pivot4[store].max()
    print(f"{store}: {top_cat} (${top_sales:,.0f})")
```

---

## Reshaping Data

### Melt (Unpivot)

```python
# Wide format
wide_df = pd.DataFrame({
    'Product': ['A', 'B', 'C'],
    'Q1': [100, 150, 120],
    'Q2': [110, 160, 125],
    'Q3': [120, 170, 130],
    'Q4': [130, 180, 135]
})

print("Wide format:")
print(wide_df)
#   Product  Q1  Q2  Q3  Q4
# 0       A 100 110 120 130
# 1       B 150 160 170 180
# 2       C 120 125 130 135

# Melt to long format
long_df = pd.melt(
    wide_df,
    id_vars=['Product'],
    var_name='Quarter',
    value_name='Sales'
)

print("\nLong format:")
print(long_df)
#    Product Quarter  Sales
# 0        A      Q1    100
# 1        B      Q1    150
# 2        C      Q1    120
# 3        A      Q2    110
# ...
```

### Pivot (opposite of Melt)

```python
# Pivot back to wide format
wide_again = long_df.pivot(
    index='Product',
    columns='Quarter',
    values='Sales'
)

print(wide_again)
# Quarter   Q1  Q2  Q3  Q4
# Product
# A        100 110 120 130
# B        150 160 170 180
# C        120 125 130 135
```

### Stack and Unstack

```python
# Create multi-column DataFrame
df = pd.DataFrame({
    'A': [1, 2, 3],
    'B': [4, 5, 6],
    'C': [7, 8, 9]
}, index=['X', 'Y', 'Z'])

print("Original:")
print(df)
#    A  B  C
# X  1  4  7
# Y  2  5  8
# Z  3  6  9

# Stack (columns to rows)
stacked = df.stack()
print("\nStacked:")
print(stacked)
#     A
# X   1
# Y   2
# Z   3
# Name: A, dtype: int64

# Unstack (rows to columns)
unstacked = stacked.unstack()
print("\nUnstacked:")
print(unstacked)
# Same as original
```

---

## Common Operations Cheat Sheet

```
┌──────────────────────────────┬─────────────────────────────────────────┐
│ Operation                    │ Code                                    │
├──────────────────────────────┼─────────────────────────────────────────┤
│ MULTIINDEX                   │                                         │
│ Create from tuples           │ pd.MultiIndex.from_tuples(tuples)       │
│ Create from arrays           │ pd.MultiIndex.from_arrays(arrays)       │
│ Create from product          │ pd.MultiIndex.from_product([a, b])      │
│ Select level                 │ df.loc['level_value']                   │
│ Cross section                │ df.xs('value', level='name')            │
│ Sum by level                 │ df.sum(level='name')                    │
│ Unstack level                │ df.unstack()                            │
│ Stack columns                │ df.stack()                              │
│ Swap levels                  │ df.swaplevel()                          │
├──────────────────────────────┼─────────────────────────────────────────┤
│ STRING OPERATIONS            │                                         │
│ Lowercase                    │ s.str.lower()                           │
│ Uppercase                    │ s.str.upper()                           │
│ Title case                   │ s.str.title()                           │
│ Contains                     │ s.str.contains('pattern')               │
│ Starts with                  │ s.str.startswith('prefix')              │
│ Ends with                    │ s.str.endswith('suffix')                │
│ Replace                      │ s.str.replace('old', 'new')             │
│ Split                        │ s.str.split()                           │
│ Extract with regex           │ s.str.extract(r'(pattern)')             │
│ Strip whitespace             │ s.str.strip()                           │
│ Length                       │ s.str.len()                             │
├──────────────────────────────┼─────────────────────────────────────────┤
│ DATETIME OPERATIONS          │                                         │
│ Convert to datetime          │ pd.to_datetime(s)                       │
│ Date range                   │ pd.date_range(start, periods, freq)     │
│ Extract year                 │ df['date'].dt.year                      │
│ Extract month                │ df['date'].dt.month                     │
│ Extract day                  │ df['date'].dt.day                       │
│ Day of week                  │ df['date'].dt.dayofweek                 │
│ Day name                     │ df['date'].dt.day_name()                │
│ Quarter                      │ df['date'].dt.quarter                   │
│ Resample                     │ df.resample('M').sum()                  │
│ Add time                     │ df['date'] + pd.Timedelta(days=1)       │
│ Subtract time                │ df['date'] - pd.DateOffset(months=1)    │
├──────────────────────────────┼─────────────────────────────────────────┤
│ PIVOT TABLES                 │                                         │
│ Basic pivot                  │ pd.pivot_table(df, values, index, cols) │
│ Multiple aggregations        │ aggfunc=['sum', 'mean']                 │
│ With margins (totals)        │ margins=True                            │
│ Fill missing values          │ fill_value=0                            │
│ Multiple indices             │ index=['col1', 'col2']                  │
├──────────────────────────────┼─────────────────────────────────────────┤
│ RESHAPING                    │                                         │
│ Melt (wide to long)          │ pd.melt(df, id_vars, var_name, value)   │
│ Pivot (long to wide)         │ df.pivot(index, columns, values)        │
│ Stack                        │ df.stack()                              │
│ Unstack                      │ df.unstack()                            │
└──────────────────────────────┴─────────────────────────────────────────┘
```

---

## Common Mistakes

### 1. Not Sorting MultiIndex

```python
# MISTAKE: Unsorted MultiIndex (slow performance)
mi_df = pd.DataFrame(
    np.random.randn(100, 3),
    index=pd.MultiIndex.from_product([range(10), range(10)])
)
# Slicing will show PerformanceWarning

# CORRECT: Sort index first
mi_df = mi_df.sort_index()
# Now slicing is fast
result = mi_df.loc[(2, 5):(7, 8)]
```

### 2. DateTime as Object Type

```python
# MISTAKE: Date column as string
df['Date'] = ['2024-01-01', '2024-01-02']
print(df['Date'].dtype)  # object

# Can't use datetime methods!
# df['Date'].dt.month  # AttributeError!

# CORRECT: Convert to datetime
df['Date'] = pd.to_datetime(df['Date'])
print(df['Date'].dtype)  # datetime64[ns]
df['Date'].dt.month  # Works!
```

### 3. Incorrect Pivot Index/Columns

```python
# MISTAKE: Using values as index
pivot = pd.pivot_table(
    sales,
    values='Region',  # Wrong! Region should be index
    index='Sales',
    columns='Product'
)

# CORRECT: Use categorical columns for index/columns
pivot = pd.pivot_table(
    sales,
    values='Sales',
    index='Region',
    columns='Product',
    aggfunc='sum'
)
```

### 4. String Operations on Non-String Columns

```python
# MISTAKE: Applying str methods to numeric column
df['Price'] = [100, 200, 300]
# df['Price'].str.replace('0', '5')  # AttributeError!

# CORRECT: Convert to string first
df['Price'].astype(str).str.replace('0', '5')
```

### 5. Forgetting to Handle Timezones

```python
# MISTAKE: Mixing timezone-aware and naive datetimes
dt_naive = pd.to_datetime('2024-01-01')
dt_aware = pd.to_datetime('2024-01-01', utc=True)
# dt_naive + dt_aware  # TypeError!

# CORRECT: Make both timezone-aware or both naive
dt_naive_utc = dt_naive.tz_localize('UTC')
result = dt_naive_utc + pd.Timedelta(days=1)
```

---

## Performance Tips

### 1. Use Category dtype for Strings

```python
# SLOW: Object dtype
df['Category'] = df['Category']  # object

# FAST: Category dtype
df['Category'] = df['Category'].astype('category')
# Saves memory and speeds up operations
```

### 2. Sort MultiIndex for Fast Slicing

```python
# Always sort MultiIndex DataFrames
mi_df = mi_df.sort_index()
# Slicing is now O(log n) instead of O(n)
```

### 3. Use .dt Accessor Efficiently

```python
# SLOW: Multiple .dt calls
df['Year'] = df['Date'].dt.year
df['Month'] = df['Date'].dt.month
df['Day'] = df['Date'].dt.day

# FAST: Extract once, then access components
date_parts = df['Date'].dt
df['Year'] = date_parts.year
df['Month'] = date_parts.month
df['Day'] = date_parts.day
```

### 4. Use Resample Instead of GroupBy for Time Series

```python
# SLOW: GroupBy on datetime
df.set_index('Date').groupby(pd.Grouper(freq='M')).sum()

# FAST: Resample
df.set_index('Date').resample('M').sum()
```

### 5. Vectorize String Operations

```python
# SLOW: Apply with custom function
df['Clean'] = df['Text'].apply(lambda x: x.strip().lower())

# FAST: Chained string methods
df['Clean'] = df['Text'].str.strip().str.lower()
```

---

## Summary

### Key Takeaways

1. **MultiIndex enables hierarchical data** without higher dimensions
2. **String methods via .str** are powerful for text processing
3. **DateTime operations via .dt** handle temporal data efficiently
4. **Pivot tables summarize data** like Excel but programmatically
5. **Melt/Pivot reshape data** between wide and long formats
6. **Category dtype saves memory** for repeated strings
7. **Sort MultiIndex** for optimal performance
8. **Resample is specialized** GroupBy for time series

### Frequency Codes for DateTime
```
┌─────────┬──────────────────────────────┐
│ Code    │ Description                  │
├─────────┼──────────────────────────────┤
│ D       │ Calendar day                 │
│ B       │ Business day                 │
│ W       │ Weekly                       │
│ M       │ Month end                    │
│ MS      │ Month start                  │
│ Q       │ Quarter end                  │
│ QS      │ Quarter start                │
│ Y       │ Year end                     │
│ YS      │ Year start                   │
│ H       │ Hourly                       │
│ T/min   │ Minutely                     │
│ S       │ Secondly                     │
└─────────┴──────────────────────────────┘
```

### When to Use What
```
┌─────────────────┬────────────────────────────┐
│ Use Case        │ Tool                       │
├─────────────────┼────────────────────────────┤
│ Hierarchical    │ MultiIndex                 │
│ Text cleaning   │ .str methods               │
│ Time series     │ .dt methods + resample     │
│ Summarization   │ Pivot tables               │
│ Wide ↔ Long     │ Melt/Pivot                 │
└─────────────────┴────────────────────────────┘
```

---

**Congratulations! You've completed the comprehensive NumPy & Pandas revision guide!**

### What You've Learned

**NumPy:**
- Array fundamentals and attributes
- Broadcasting and advanced indexing
- Mathematical and linear algebra operations

**Pandas:**
- Series and DataFrame operations
- Data manipulation, filtering, sorting
- GroupBy aggregations
- Merging, joining, concatenating
- MultiIndex for hierarchical data
- String and DateTime operations
- Pivot tables and reshaping

### Practice Resources
1. **Kaggle Datasets**: Practice with real data
2. **LeetCode Pandas**: SQL-to-Pandas problems
3. **Project Euler**: Mathematical problems with NumPy
4. **Time Series Analysis**: Stock prices, weather data

### Next Steps in DSMP
- Data Visualization (Matplotlib, Seaborn)
- SQL for data querying
- Statistics and Probability
- Machine Learning with Scikit-learn

**Keep practicing, and you'll become a data manipulation expert!**
