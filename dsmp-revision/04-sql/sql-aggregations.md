# SQL Aggregations - Grouping, Sorting, and Aggregate Functions

## Table of Contents
1. [Aggregate Functions](#aggregate-functions)
2. [GROUP BY Clause](#group-by-clause)
3. [HAVING Clause](#having-clause)
4. [ORDER BY Clause](#order-by-clause)
5. [Combined Examples](#combined-examples)
6. [Advanced Aggregation](#advanced-aggregation)
7. [Practice Exercises](#practice-exercises)

---

## Aggregate Functions

**Aggregate Functions**: Perform calculations on multiple rows and return a single value

### Common Aggregate Functions

```sql
COUNT()     -- Count rows
SUM()       -- Sum of values
AVG()       -- Average of values
MIN()       -- Minimum value
MAX()       -- Maximum value
```

### Sample Data Setup
```sql
-- Sales Database
CREATE TABLE sales (
    sale_id INT PRIMARY KEY,
    product_name VARCHAR(100),
    category VARCHAR(50),
    region VARCHAR(50),
    sale_date DATE,
    quantity INT,
    unit_price DECIMAL(10, 2),
    salesperson VARCHAR(50)
);

INSERT INTO sales VALUES
(1, 'Laptop', 'Electronics', 'North', '2024-01-15', 5, 999.99, 'John'),
(2, 'Mouse', 'Electronics', 'North', '2024-01-16', 15, 29.99, 'John'),
(3, 'Keyboard', 'Electronics', 'South', '2024-01-17', 10, 79.99, 'Sarah'),
(4, 'Monitor', 'Electronics', 'East', '2024-01-18', 8, 299.99, 'Mike'),
(5, 'Desk', 'Furniture', 'West', '2024-01-19', 3, 399.99, 'Lisa'),
(6, 'Chair', 'Furniture', 'North', '2024-01-20', 12, 199.99, 'John'),
(7, 'Laptop', 'Electronics', 'South', '2024-02-15', 3, 999.99, 'Sarah'),
(8, 'Mouse', 'Electronics', 'East', '2024-02-16', 20, 29.99, 'Mike'),
(9, 'Desk', 'Furniture', 'West', '2024-02-17', 5, 399.99, 'Lisa'),
(10, 'Monitor', 'Electronics', 'North', '2024-02-18', 6, 299.99, 'John');

-- Employees Table
CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    name VARCHAR(50),
    department VARCHAR(50),
    salary DECIMAL(10, 2),
    hire_date DATE,
    city VARCHAR(50)
);

INSERT INTO employees VALUES
(1, 'John Doe', 'IT', 75000, '2020-01-15', 'New York'),
(2, 'Jane Smith', 'IT', 82000, '2019-03-20', 'New York'),
(3, 'Bob Johnson', 'Sales', 65000, '2021-06-10', 'Chicago'),
(4, 'Alice Brown', 'Sales', 70000, '2020-11-25', 'Chicago'),
(5, 'Charlie Wilson', 'HR', 60000, '2022-02-14', 'Boston'),
(6, 'Diana Prince', 'IT', 95000, '2018-09-05', 'New York'),
(7, 'Eve Davis', 'Sales', 68000, '2021-04-18', 'Los Angeles'),
(8, 'Frank Miller', 'HR', 62000, '2020-08-22', 'Boston');
```

---

## COUNT Function

### Basic COUNT
```sql
-- Count all rows
SELECT COUNT(*) AS total_sales
FROM sales;
-- Result: 10

-- Count non-NULL values in a column
SELECT COUNT(salesperson) AS total_salespeople_entries
FROM sales;

-- Count DISTINCT values
SELECT COUNT(DISTINCT salesperson) AS unique_salespeople
FROM sales;
-- Result: 4 (John, Sarah, Mike, Lisa)

SELECT COUNT(DISTINCT category) AS unique_categories
FROM sales;
-- Result: 2 (Electronics, Furniture)
```

### COUNT with Conditions
```sql
-- Count sales in specific region
SELECT COUNT(*) AS north_sales
FROM sales
WHERE region = 'North';
-- Result: 4

-- Count using CASE (conditional count)
SELECT
    COUNT(CASE WHEN category = 'Electronics' THEN 1 END) AS electronics_count,
    COUNT(CASE WHEN category = 'Furniture' THEN 1 END) AS furniture_count,
    COUNT(*) AS total_count
FROM sales;
```

**Result:**
```
┌───────────────────┬─────────────────┬─────────────┐
│ electronics_count │ furniture_count │ total_count │
├───────────────────┼─────────────────┼─────────────┤
│ 7                 │ 3               │ 10          │
└───────────────────┴─────────────────┴─────────────┘
```

---

## SUM Function

### Basic SUM
```sql
-- Total quantity sold
SELECT SUM(quantity) AS total_quantity_sold
FROM sales;
-- Result: 87

-- Total revenue (calculated column)
SELECT SUM(quantity * unit_price) AS total_revenue
FROM sales;
-- Result: 16,349.15

-- SUM with condition
SELECT SUM(quantity * unit_price) AS electronics_revenue
FROM sales
WHERE category = 'Electronics';
```

### SUM with CASE
```sql
-- Revenue by category (pivoted)
SELECT
    SUM(CASE WHEN category = 'Electronics' THEN quantity * unit_price ELSE 0 END) AS electronics_revenue,
    SUM(CASE WHEN category = 'Furniture' THEN quantity * unit_price ELSE 0 END) AS furniture_revenue,
    SUM(quantity * unit_price) AS total_revenue
FROM sales;
```

**Result:**
```
┌─────────────────────┬──────────────────┬───────────────┐
│ electronics_revenue │ furniture_revenue│ total_revenue │
├─────────────────────┼──────────────────┼───────────────┤
│ 12,349.18           │ 3,999.97         │ 16,349.15     │
└─────────────────────┴──────────────────┴───────────────┘
```

---

## AVG Function

### Basic AVG
```sql
-- Average quantity per sale
SELECT AVG(quantity) AS avg_quantity
FROM sales;
-- Result: 8.7

-- Average price
SELECT AVG(unit_price) AS avg_price
FROM sales;
-- Result: 273.99

-- Average salary by department
SELECT
    department,
    AVG(salary) AS avg_salary
FROM employees
GROUP BY department;
```

### AVG with Rounding
```sql
-- Round to 2 decimal places
SELECT
    ROUND(AVG(quantity), 2) AS avg_quantity,
    ROUND(AVG(unit_price), 2) AS avg_price,
    ROUND(AVG(quantity * unit_price), 2) AS avg_revenue_per_sale
FROM sales;
```

**Result:**
```
┌──────────────┬───────────┬──────────────────────┐
│ avg_quantity │ avg_price │ avg_revenue_per_sale │
├──────────────┼───────────┼──────────────────────┤
│ 8.70         │ 273.99    │ 1,634.92             │
└──────────────┴───────────┴──────────────────────┘
```

---

## MIN and MAX Functions

### Basic MIN/MAX
```sql
-- Find minimum and maximum prices
SELECT
    MIN(unit_price) AS cheapest_product,
    MAX(unit_price) AS most_expensive_product
FROM sales;
```

**Result:**
```
┌──────────────────┬───────────────────────┐
│ cheapest_product │ most_expensive_product│
├──────────────────┼───────────────────────┤
│ 29.99            │ 999.99                │
└──────────────────┴───────────────────────┘
```

### MIN/MAX with Details
```sql
-- Find details of cheapest product (using subquery)
SELECT *
FROM sales
WHERE unit_price = (SELECT MIN(unit_price) FROM sales);

-- Find highest and lowest salary employees
SELECT
    (SELECT name FROM employees ORDER BY salary DESC LIMIT 1) AS highest_paid,
    (SELECT salary FROM employees ORDER BY salary DESC LIMIT 1) AS max_salary,
    (SELECT name FROM employees ORDER BY salary ASC LIMIT 1) AS lowest_paid,
    (SELECT salary FROM employees ORDER BY salary ASC LIMIT 1) AS min_salary;
```

### Date MIN/MAX
```sql
-- Find first and last sale dates
SELECT
    MIN(sale_date) AS first_sale,
    MAX(sale_date) AS last_sale,
    DATEDIFF(MAX(sale_date), MIN(sale_date)) AS days_between
FROM sales;
```

---

## GROUP BY Clause

**GROUP BY**: Groups rows with same values into summary rows

### Syntax
```sql
SELECT column1, aggregate_function(column2)
FROM table_name
WHERE condition
GROUP BY column1
ORDER BY column1;
```

### Single Column Grouping

#### Example 1: Sales by Category
```sql
SELECT
    category,
    COUNT(*) AS number_of_sales,
    SUM(quantity) AS total_quantity,
    SUM(quantity * unit_price) AS total_revenue,
    ROUND(AVG(quantity * unit_price), 2) AS avg_sale_amount
FROM sales
GROUP BY category
ORDER BY total_revenue DESC;
```

**Result:**
```
┌─────────────┬─────────────────┬────────────────┬───────────────┬─────────────────┐
│ category    │ number_of_sales │ total_quantity │ total_revenue │ avg_sale_amount │
├─────────────┼─────────────────┼────────────────┼───────────────┼─────────────────┤
│ Electronics │ 7               │ 67             │ 12,349.18     │ 1,764.17        │
│ Furniture   │ 3               │ 20             │ 3,999.97      │ 1,333.32        │
└─────────────┴─────────────────┴────────────────┴───────────────┴─────────────────┘
```

#### Example 2: Sales by Region
```sql
SELECT
    region,
    COUNT(*) AS total_sales,
    SUM(quantity * unit_price) AS revenue
FROM sales
GROUP BY region
ORDER BY revenue DESC;
```

**Result:**
```
┌────────┬─────────────┬───────────┐
│ region │ total_sales │ revenue   │
├────────┼─────────────┼───────────┤
│ North  │ 4           │ 9,199.73  │
│ West   │ 2           │ 3,199.90  │
│ East   │ 2           │ 2,999.64  │
│ South  │ 2           │ 3,799.87  │
└────────┴─────────────┴───────────┘
```

#### Example 3: Employee Count by Department
```sql
SELECT
    department,
    COUNT(*) AS employee_count,
    ROUND(AVG(salary), 2) AS avg_salary,
    MIN(salary) AS min_salary,
    MAX(salary) AS max_salary
FROM employees
GROUP BY department
ORDER BY avg_salary DESC;
```

**Result:**
```
┌────────────┬────────────────┬────────────┬────────────┬────────────┐
│ department │ employee_count │ avg_salary │ min_salary │ max_salary │
├────────────┼────────────────┼────────────┼────────────┼────────────┤
│ IT         │ 3              │ 84,000.00  │ 75,000     │ 95,000     │
│ Sales      │ 3              │ 67,666.67  │ 65,000     │ 70,000     │
│ HR         │ 2              │ 61,000.00  │ 60,000     │ 62,000     │
└────────────┴────────────────┴────────────┴────────────┴────────────┘
```

### Multiple Column Grouping

#### Example 1: Sales by Category and Region
```sql
SELECT
    category,
    region,
    COUNT(*) AS sales_count,
    SUM(quantity * unit_price) AS revenue
FROM sales
GROUP BY category, region
ORDER BY category, revenue DESC;
```

**Result:**
```
┌─────────────┬────────┬─────────────┬──────────┐
│ category    │ region │ sales_count │ revenue  │
├─────────────┼────────┼─────────────┼──────────┤
│ Electronics │ North  │ 3           │ 7,799.76 │
│ Electronics │ South  │ 2           │ 3,799.87 │
│ Electronics │ East   │ 2           │ 2,999.64 │
│ Furniture   │ West   │ 2           │ 3,199.90 │
│ Furniture   │ North  │ 1           │ 2,399.88 │
└─────────────┴────────┴─────────────┴──────────┘
```

#### Example 2: Sales by Salesperson and Month
```sql
SELECT
    salesperson,
    DATE_FORMAT(sale_date, '%Y-%m') AS month,
    COUNT(*) AS sales_count,
    SUM(quantity * unit_price) AS revenue
FROM sales
GROUP BY salesperson, DATE_FORMAT(sale_date, '%Y-%m')
ORDER BY salesperson, month;
```

**Result:**
```
┌──────────────┬─────────┬─────────────┬──────────┐
│ salesperson  │ month   │ sales_count │ revenue  │
├──────────────┼─────────┼─────────────┼──────────┤
│ John         │ 2024-01 │ 2           │ 7,399.73 │
│ John         │ 2024-02 │ 1           │ 1,799.94 │
│ Lisa         │ 2024-01 │ 1           │ 1,199.97 │
│ Lisa         │ 2024-02 │ 1           │ 1,999.95 │
│ Mike         │ 2024-01 │ 1           │ 2,399.92 │
│ Mike         │ 2024-02 │ 1           │ 599.80   │
│ Sarah        │ 2024-01 │ 1           │ 799.90   │
│ Sarah        │ 2024-02 │ 1           │ 2,999.97 │
└──────────────┴─────────┴─────────────┴──────────┘
```

### GROUP BY with JOIN
```sql
-- Create orders table for this example
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    customer_name VARCHAR(50),
    city VARCHAR(50)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    amount DECIMAL(10, 2)
);

INSERT INTO customers VALUES
(1, 'ABC Corp', 'New York'),
(2, 'XYZ Inc', 'Chicago'),
(3, 'Tech Solutions', 'Boston');

INSERT INTO orders VALUES
(101, 1, '2024-01-15', 1500),
(102, 1, '2024-02-20', 2000),
(103, 2, '2024-01-18', 800),
(104, 2, '2024-03-10', 1200),
(105, 3, '2024-02-25', 3000);

-- Customer order summary
SELECT
    c.customer_name,
    c.city,
    COUNT(o.order_id) AS total_orders,
    SUM(o.amount) AS total_amount,
    AVG(o.amount) AS avg_order_value,
    MIN(o.order_date) AS first_order,
    MAX(o.order_date) AS last_order
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.customer_name, c.city
ORDER BY total_amount DESC;
```

**Result:**
```
┌────────────────┬──────────┬──────────────┬──────────────┬─────────────────┬─────────────┬─────────────┐
│ customer_name  │ city     │ total_orders │ total_amount │ avg_order_value │ first_order │ last_order  │
├────────────────┼──────────┼──────────────┼──────────────┼─────────────────┼─────────────┼─────────────┤
│ ABC Corp       │ New York │ 2            │ 3,500        │ 1,750.00        │ 2024-01-15  │ 2024-02-20  │
│ Tech Solutions │ Boston   │ 1            │ 3,000        │ 3,000.00        │ 2024-02-25  │ 2024-02-25  │
│ XYZ Inc        │ Chicago  │ 2            │ 2,000        │ 1,000.00        │ 2024-01-18  │ 2024-03-10  │
└────────────────┴──────────┴──────────────┴──────────────┴─────────────────┴─────────────┴─────────────┘
```

---

## HAVING Clause

**HAVING**: Filters grouped results (WHERE filters before grouping, HAVING filters after)

### HAVING vs WHERE
```
┌──────────┬────────────────────────────────────────────┐
│ Clause   │ Purpose                                    │
├──────────┼────────────────────────────────────────────┤
│ WHERE    │ Filters rows BEFORE grouping               │
│ HAVING   │ Filters groups AFTER aggregation           │
├──────────┼────────────────────────────────────────────┤
│ WHERE    │ Cannot use aggregate functions             │
│ HAVING   │ Can use aggregate functions (COUNT, SUM)   │
├──────────┼────────────────────────────────────────────┤
│ WHERE    │ Works with individual rows                 │
│ HAVING   │ Works with grouped results                 │
└──────────┴────────────────────────────────────────────┘
```

### Example 1: Regions with High Revenue
```sql
-- Find regions with total revenue > 3000
SELECT
    region,
    COUNT(*) AS sales_count,
    SUM(quantity * unit_price) AS total_revenue
FROM sales
GROUP BY region
HAVING SUM(quantity * unit_price) > 3000
ORDER BY total_revenue DESC;
```

**Result:**
```
┌────────┬─────────────┬───────────────┐
│ region │ sales_count │ total_revenue │
├────────┼─────────────┼───────────────┤
│ North  │ 4           │ 9,199.73      │
│ South  │ 2           │ 3,799.87      │
│ West   │ 2           │ 3,199.90      │
└────────┴─────────────┴───────────────┘
```

### Example 2: Categories with Multiple Sales
```sql
-- Categories with at least 5 sales
SELECT
    category,
    COUNT(*) AS number_of_sales,
    SUM(quantity * unit_price) AS revenue
FROM sales
GROUP BY category
HAVING COUNT(*) >= 5
ORDER BY revenue DESC;
```

**Result:**
```
┌─────────────┬─────────────────┬───────────┐
│ category    │ number_of_sales │ revenue   │
├─────────────┼─────────────────┼───────────┤
│ Electronics │ 7               │ 12,349.18 │
└─────────────┴─────────────────┴───────────┘
```

### Example 3: Departments with High Average Salary
```sql
-- Departments where average salary > 65000
SELECT
    department,
    COUNT(*) AS employee_count,
    ROUND(AVG(salary), 2) AS avg_salary,
    SUM(salary) AS total_salary_cost
FROM employees
GROUP BY department
HAVING AVG(salary) > 65000
ORDER BY avg_salary DESC;
```

**Result:**
```
┌────────────┬────────────────┬────────────┬───────────────────┐
│ department │ employee_count │ avg_salary │ total_salary_cost │
├────────────┼────────────────┼────────────┼───────────────────┤
│ IT         │ 3              │ 84,000.00  │ 252,000           │
│ Sales      │ 3              │ 67,666.67  │ 203,000           │
└────────────┴────────────────┴────────────┴───────────────────┘
```

### Example 4: WHERE vs HAVING
```sql
-- INCORRECT: Can't use aggregate in WHERE
SELECT category, COUNT(*) as sales_count
FROM sales
WHERE COUNT(*) > 3  -- ERROR!
GROUP BY category;

-- CORRECT: Use HAVING for aggregates
SELECT category, COUNT(*) as sales_count
FROM sales
GROUP BY category
HAVING COUNT(*) > 3;

-- Combine WHERE and HAVING
SELECT
    region,
    COUNT(*) AS sales_count,
    SUM(quantity * unit_price) AS revenue
FROM sales
WHERE sale_date >= '2024-02-01'  -- Filter before grouping
GROUP BY region
HAVING COUNT(*) >= 2  -- Filter after grouping
ORDER BY revenue DESC;
```

---

## ORDER BY Clause

**ORDER BY**: Sorts result set by one or more columns

### Basic Sorting
```sql
-- Sort ascending (default)
SELECT product_name, unit_price
FROM sales
ORDER BY unit_price;

-- Sort descending
SELECT product_name, unit_price
FROM sales
ORDER BY unit_price DESC;

-- Sort by multiple columns
SELECT category, product_name, unit_price
FROM sales
ORDER BY category ASC, unit_price DESC;
```

### Sort by Calculated Column
```sql
-- Sort by revenue (calculated)
SELECT
    product_name,
    quantity,
    unit_price,
    (quantity * unit_price) AS revenue
FROM sales
ORDER BY revenue DESC;
```

**Result:**
```
┌──────────────┬──────────┬────────────┬──────────┐
│ product_name │ quantity │ unit_price │ revenue  │
├──────────────┼──────────┼────────────┼──────────┤
│ Laptop       │ 5        │ 999.99     │ 4,999.95 │
│ Laptop       │ 3        │ 999.99     │ 2,999.97 │
│ Monitor      │ 8        │ 299.99     │ 2,399.92 │
│ Chair        │ 12       │ 199.99     │ 2,399.88 │
│ Desk         │ 5        │ 399.99     │ 1,999.95 │
└──────────────┴──────────┴────────────┴──────────┘
```

### Sort by Aggregate with GROUP BY
```sql
-- Sort grouped results
SELECT
    category,
    COUNT(*) AS sales_count,
    SUM(quantity * unit_price) AS revenue
FROM sales
GROUP BY category
ORDER BY revenue DESC;
```

### Sort by Column Position
```sql
-- Sort by column number (not recommended, less readable)
SELECT category, COUNT(*), SUM(quantity * unit_price)
FROM sales
GROUP BY category
ORDER BY 3 DESC;  -- Sort by 3rd column (SUM)
```

### NULLS in Sorting
```sql
-- Control NULL ordering
SELECT name, department, salary
FROM employees
ORDER BY department ASC NULLS FIRST;  -- NULLs appear first

SELECT name, department, salary
FROM employees
ORDER BY department ASC NULLS LAST;   -- NULLs appear last
```

---

## Combined Examples

### Example 1: Sales Performance Report
```sql
-- Complete sales analysis by salesperson
SELECT
    salesperson,
    COUNT(*) AS total_sales,
    COUNT(DISTINCT category) AS categories_sold,
    SUM(quantity) AS total_units_sold,
    ROUND(SUM(quantity * unit_price), 2) AS total_revenue,
    ROUND(AVG(quantity * unit_price), 2) AS avg_sale_value,
    MIN(sale_date) AS first_sale_date,
    MAX(sale_date) AS last_sale_date
FROM sales
GROUP BY salesperson
HAVING SUM(quantity * unit_price) > 2000
ORDER BY total_revenue DESC;
```

**Result:**
```
┌──────────────┬─────────────┬────────────────┬──────────────────┬───────────────┬────────────────┬─────────────────┬────────────────┐
│ salesperson  │ total_sales │ categories_sold│ total_units_sold │ total_revenue │ avg_sale_value │ first_sale_date │ last_sale_date │
├──────────────┼─────────────┼────────────────┼──────────────────┼───────────────┼────────────────┼─────────────────┼────────────────┤
│ John         │ 3           │ 2              │ 23               │ 9,199.67      │ 3,066.56       │ 2024-01-15      │ 2024-02-18     │
│ Sarah        │ 2           │ 1              │ 13               │ 3,799.87      │ 1,899.94       │ 2024-01-17      │ 2024-02-15     │
│ Lisa         │ 2           │ 1              │ 8                │ 3,199.92      │ 1,599.96       │ 2024-01-19      │ 2024-02-17     │
│ Mike         │ 2           │ 1              │ 28               │ 2,999.72      │ 1,499.86       │ 2024-01-18      │ 2024-02-16     │
└──────────────┴─────────────┴────────────────┴──────────────────┴───────────────┴────────────────┴─────────────────┴────────────────┘
```

### Example 2: Monthly Sales Trend
```sql
-- Sales trend by month
SELECT
    DATE_FORMAT(sale_date, '%Y-%m') AS month,
    COUNT(*) AS number_of_sales,
    SUM(quantity) AS total_quantity,
    ROUND(SUM(quantity * unit_price), 2) AS revenue,
    ROUND(AVG(quantity * unit_price), 2) AS avg_sale_value
FROM sales
GROUP BY DATE_FORMAT(sale_date, '%Y-%m')
ORDER BY month;
```

**Result:**
```
┌─────────┬─────────────────┬────────────────┬──────────┬────────────────┐
│ month   │ number_of_sales │ total_quantity │ revenue  │ avg_sale_value │
├─────────┼─────────────────┼────────────────┼──────────┼────────────────┤
│ 2024-01 │ 6               │ 53             │ 11,649.61│ 1,941.60       │
│ 2024-02 │ 4               │ 34             │ 7,399.66 │ 1,849.92       │
└─────────┴─────────────────┴────────────────┴──────────┴────────────────┘
```

### Example 3: Top Performing Products
```sql
-- Top 3 products by revenue
SELECT
    product_name,
    COUNT(*) AS times_sold,
    SUM(quantity) AS total_quantity_sold,
    ROUND(SUM(quantity * unit_price), 2) AS total_revenue,
    ROUND(AVG(unit_price), 2) AS avg_price
FROM sales
GROUP BY product_name
ORDER BY total_revenue DESC
LIMIT 3;
```

**Result:**
```
┌──────────────┬────────────┬─────────────────────┬───────────────┬───────────┐
│ product_name │ times_sold │ total_quantity_sold │ total_revenue │ avg_price │
├──────────────┼────────────┼─────────────────────┼───────────────┼───────────┤
│ Laptop       │ 2          │ 8                   │ 7,999.92      │ 999.99    │
│ Monitor      │ 2          │ 14                  │ 4,199.86      │ 299.99    │
│ Chair        │ 1          │ 12                  │ 2,399.88      │ 199.99    │
└──────────────┴────────────┴─────────────────────┴───────────────┴───────────┘
```

### Example 4: Department Analysis
```sql
-- Comprehensive department analysis
SELECT
    department,
    COUNT(*) AS headcount,
    ROUND(AVG(salary), 2) AS avg_salary,
    MIN(salary) AS min_salary,
    MAX(salary) AS max_salary,
    SUM(salary) AS total_salary_cost,
    ROUND(MAX(salary) - MIN(salary), 2) AS salary_range,
    ROUND(STDDEV(salary), 2) AS salary_std_dev
FROM employees
GROUP BY department
HAVING COUNT(*) >= 2
ORDER BY avg_salary DESC;
```

**Result:**
```
┌────────────┬───────────┬────────────┬────────────┬────────────┬───────────────────┬──────────────┬────────────────┐
│ department │ headcount │ avg_salary │ min_salary │ max_salary │ total_salary_cost │ salary_range │ salary_std_dev │
├────────────┼───────────┼────────────┼────────────┼────────────┼───────────────────┼──────────────┼────────────────┤
│ IT         │ 3         │ 84,000.00  │ 75,000     │ 95,000     │ 252,000           │ 20,000       │ 10,000.00      │
│ Sales      │ 3         │ 67,666.67  │ 65,000     │ 70,000     │ 203,000           │ 5,000        │ 2,516.61       │
│ HR         │ 2         │ 61,000.00  │ 60,000     │ 62,000     │ 122,000           │ 2,000        │ 1,414.21       │
└────────────┴───────────┴────────────┴────────────┴────────────┴───────────────────┴──────────────┴────────────────┘
```

---

## Advanced Aggregation

### ROLLUP - Subtotals and Grand Totals
```sql
-- Sales with subtotals by category
SELECT
    COALESCE(category, 'GRAND TOTAL') AS category,
    COALESCE(region, 'All Regions') AS region,
    COUNT(*) AS sales_count,
    SUM(quantity * unit_price) AS revenue
FROM sales
GROUP BY category, region WITH ROLLUP
ORDER BY category, region;
```

### CASE in Aggregation
```sql
-- Segment customers by order value
SELECT
    CASE
        WHEN SUM(amount) < 2000 THEN 'Low Value'
        WHEN SUM(amount) BETWEEN 2000 AND 3000 THEN 'Medium Value'
        ELSE 'High Value'
    END AS customer_segment,
    COUNT(*) AS customer_count,
    ROUND(AVG(amount), 2) AS avg_order_value
FROM (
    SELECT customer_id, SUM(amount) as amount
    FROM orders
    GROUP BY customer_id
) AS customer_totals
GROUP BY customer_segment;
```

### Conditional Aggregation
```sql
-- Sales metrics by month
SELECT
    DATE_FORMAT(sale_date, '%Y-%m') AS month,
    COUNT(*) AS total_sales,
    COUNT(CASE WHEN category = 'Electronics' THEN 1 END) AS electronics_sales,
    COUNT(CASE WHEN category = 'Furniture' THEN 1 END) AS furniture_sales,
    SUM(CASE WHEN region = 'North' THEN quantity * unit_price ELSE 0 END) AS north_revenue,
    SUM(CASE WHEN region = 'South' THEN quantity * unit_price ELSE 0 END) AS south_revenue
FROM sales
GROUP BY DATE_FORMAT(sale_date, '%Y-%m')
ORDER BY month;
```

### STRING_AGG / GROUP_CONCAT
```sql
-- Concatenate values (MySQL)
SELECT
    category,
    GROUP_CONCAT(DISTINCT product_name ORDER BY product_name SEPARATOR ', ') AS products
FROM sales
GROUP BY category;

-- PostgreSQL equivalent
SELECT
    category,
    STRING_AGG(DISTINCT product_name, ', ' ORDER BY product_name) AS products
FROM sales
GROUP BY category;
```

**Result:**
```
┌─────────────┬──────────────────────────────────────┐
│ category    │ products                             │
├─────────────┼──────────────────────────────────────┤
│ Electronics │ Keyboard, Laptop, Monitor, Mouse     │
│ Furniture   │ Chair, Desk                          │
└─────────────┴──────────────────────────────────────┘
```

---

## Interview Questions

### Q1: What's the difference between WHERE and HAVING?
**Answer:**
- **WHERE**: Filters rows before grouping, cannot use aggregate functions
- **HAVING**: Filters groups after aggregation, can use aggregate functions
```sql
-- WHERE: Filter before grouping
SELECT category, COUNT(*)
FROM sales
WHERE unit_price > 100  -- Individual row filter
GROUP BY category;

-- HAVING: Filter after grouping
SELECT category, COUNT(*)
FROM sales
GROUP BY category
HAVING COUNT(*) > 5;  -- Aggregate filter
```

### Q2: Can you use aggregate functions in WHERE clause?
**Answer:** No, aggregate functions cannot be used in WHERE clause. Use HAVING instead.
```sql
-- WRONG
SELECT category FROM sales
WHERE SUM(quantity) > 10  -- ERROR!

-- CORRECT
SELECT category FROM sales
GROUP BY category
HAVING SUM(quantity) > 10;
```

### Q3: What is the order of execution in SQL?
**Answer:**
```
1. FROM       - Get data from tables
2. WHERE      - Filter rows
3. GROUP BY   - Group rows
4. HAVING     - Filter groups
5. SELECT     - Select columns
6. ORDER BY   - Sort results
7. LIMIT      - Limit results
```

### Q4: How do you find duplicates using GROUP BY?
**Answer:**
```sql
-- Find duplicate emails
SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- Get all details of duplicates
SELECT *
FROM users
WHERE email IN (
    SELECT email
    FROM users
    GROUP BY email
    HAVING COUNT(*) > 1
);
```

### Q5: What does COUNT(*) vs COUNT(column) do?
**Answer:**
- **COUNT(*)**: Counts all rows, including NULLs
- **COUNT(column)**: Counts non-NULL values only
- **COUNT(DISTINCT column)**: Counts unique non-NULL values

```sql
-- Example with NULLs
CREATE TABLE test (id INT, value INT);
INSERT INTO test VALUES (1, 10), (2, NULL), (3, 10), (4, NULL);

SELECT
    COUNT(*) AS total_rows,           -- 4
    COUNT(value) AS non_null_values,  -- 2
    COUNT(DISTINCT value) AS unique   -- 1
FROM test;
```

---

## Query Optimization Tips

### 1. Filter Before Grouping
```sql
-- LESS EFFICIENT: Group then filter
SELECT category, SUM(quantity * unit_price) AS revenue
FROM sales
GROUP BY category
HAVING MAX(sale_date) >= '2024-02-01';

-- MORE EFFICIENT: Filter then group
SELECT category, SUM(quantity * unit_price) AS revenue
FROM sales
WHERE sale_date >= '2024-02-01'
GROUP BY category;
```

### 2. Use Covering Indexes
```sql
-- Create index on grouped and aggregated columns
CREATE INDEX idx_sales_category_amount
ON sales(category, quantity, unit_price);
```

### 3. Limit Aggregation Scope
```sql
-- Instead of aggregating entire table
SELECT AVG(salary) FROM employees;

-- Aggregate filtered subset
SELECT AVG(salary) FROM employees
WHERE hire_date >= '2020-01-01';
```

### 4. Avoid SELECT * in GROUP BY
```sql
-- BAD: Selecting unnecessary columns
SELECT *, COUNT(*) FROM sales GROUP BY category;  -- Error in most DBMS

-- GOOD: Select only grouped and aggregated columns
SELECT category, COUNT(*) FROM sales GROUP BY category;
```

---

## Practice Exercises

### Exercise 1: Basic Aggregations
```sql
-- Q1: Total sales and revenue
SELECT
    COUNT(*) AS total_sales,
    SUM(quantity) AS total_units,
    SUM(quantity * unit_price) AS total_revenue
FROM sales;

-- Q2: Average salary by department
SELECT
    department,
    COUNT(*) AS employees,
    AVG(salary) AS avg_salary
FROM employees
GROUP BY department;

-- Q3: Find highest and lowest prices
SELECT
    MAX(unit_price) AS highest_price,
    MIN(unit_price) AS lowest_price,
    AVG(unit_price) AS average_price
FROM sales;
```

### Exercise 2: Grouping
```sql
-- Q1: Sales count by category and region
SELECT
    category,
    region,
    COUNT(*) AS sales_count,
    SUM(quantity * unit_price) AS revenue
FROM sales
GROUP BY category, region
ORDER BY category, revenue DESC;

-- Q2: Monthly sales summary
SELECT
    DATE_FORMAT(sale_date, '%Y-%m') AS month,
    COUNT(DISTINCT salesperson) AS active_salespeople,
    SUM(quantity) AS total_units,
    ROUND(SUM(quantity * unit_price), 2) AS revenue
FROM sales
GROUP BY DATE_FORMAT(sale_date, '%Y-%m')
ORDER BY month;

-- Q3: Employee count by city
SELECT
    city,
    COUNT(*) AS employee_count,
    COUNT(DISTINCT department) AS departments
FROM employees
GROUP BY city
ORDER BY employee_count DESC;
```

### Exercise 3: HAVING Clause
```sql
-- Q1: Categories with revenue > 5000
SELECT
    category,
    SUM(quantity * unit_price) AS revenue
FROM sales
GROUP BY category
HAVING SUM(quantity * unit_price) > 5000;

-- Q2: Salespeople with more than 2 sales
SELECT
    salesperson,
    COUNT(*) AS sales_count,
    SUM(quantity * unit_price) AS total_revenue
FROM sales
GROUP BY salesperson
HAVING COUNT(*) > 2
ORDER BY total_revenue DESC;

-- Q3: Departments with average salary > 70000
SELECT
    department,
    COUNT(*) AS employees,
    AVG(salary) AS avg_salary
FROM employees
GROUP BY department
HAVING AVG(salary) > 70000;
```

### Exercise 4: Complex Queries
```sql
-- Q1: Top 3 regions by revenue with at least 2 sales
SELECT
    region,
    COUNT(*) AS sales_count,
    SUM(quantity * unit_price) AS revenue
FROM sales
GROUP BY region
HAVING COUNT(*) >= 2
ORDER BY revenue DESC
LIMIT 3;

-- Q2: Product performance analysis
SELECT
    product_name,
    COUNT(*) AS times_sold,
    SUM(quantity) AS total_quantity,
    AVG(quantity) AS avg_quantity_per_sale,
    SUM(quantity * unit_price) AS total_revenue,
    AVG(quantity * unit_price) AS avg_revenue_per_sale
FROM sales
GROUP BY product_name
HAVING COUNT(*) > 1
ORDER BY total_revenue DESC;

-- Q3: Customer analysis with multiple metrics
SELECT
    c.customer_name,
    c.city,
    COUNT(o.order_id) AS order_count,
    COALESCE(SUM(o.amount), 0) AS total_spent,
    COALESCE(AVG(o.amount), 0) AS avg_order_value,
    MIN(o.order_date) AS first_order,
    MAX(o.order_date) AS last_order,
    DATEDIFF(MAX(o.order_date), MIN(o.order_date)) AS customer_lifetime_days
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.customer_name, c.city
HAVING COUNT(o.order_id) > 0
ORDER BY total_spent DESC;
```

---

## Quick Reference

### Aggregate Functions
```sql
COUNT(*)              -- Count all rows
COUNT(column)         -- Count non-NULL values
COUNT(DISTINCT col)   -- Count unique values
SUM(column)           -- Sum of values
AVG(column)           -- Average of values
MIN(column)           -- Minimum value
MAX(column)           -- Maximum value
STDDEV(column)        -- Standard deviation
VARIANCE(column)      -- Variance
```

### GROUP BY Syntax
```sql
SELECT column1, aggregate_function(column2)
FROM table
WHERE condition              -- Filter before grouping
GROUP BY column1             -- Group by column
HAVING aggregate_condition   -- Filter after grouping
ORDER BY column1;            -- Sort results
```

### Common Patterns
```sql
-- Group by single column
SELECT category, COUNT(*) FROM sales GROUP BY category;

-- Group by multiple columns
SELECT category, region, COUNT(*) FROM sales GROUP BY category, region;

-- Filter groups
SELECT category, COUNT(*) FROM sales GROUP BY category HAVING COUNT(*) > 5;

-- Top N per group
SELECT * FROM (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) as rn
    FROM products
) WHERE rn <= 3;
```

---

## Key Takeaways

1. **Aggregate functions** summarize data: COUNT, SUM, AVG, MIN, MAX
2. **GROUP BY** groups rows with same values
3. **HAVING** filters grouped results (use WHERE to filter before grouping)
4. **ORDER BY** sorts final results
5. **Query execution order**: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
6. **COUNT(*)** counts all rows; **COUNT(column)** counts non-NULL values
7. **Filter early** with WHERE for better performance
8. **Index grouped columns** for faster queries
