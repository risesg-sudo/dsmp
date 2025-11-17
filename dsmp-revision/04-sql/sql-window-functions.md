# SQL Window Functions - Advanced Analytics

## Table of Contents
1. [Introduction to Window Functions](#introduction-to-window-functions)
2. [Ranking Functions](#ranking-functions)
3. [Analytic Functions](#analytic-functions)
4. [Aggregate Window Functions](#aggregate-window-functions)
5. [PARTITION BY Clause](#partition-by-clause)
6. [Frame Specification](#frame-specification)
7. [Real-World Business Scenarios](#real-world-business-scenarios)
8. [Practice Exercises](#practice-exercises)

---

## Introduction to Window Functions

**Window Functions**: Perform calculations across a set of rows related to the current row, WITHOUT collapsing rows like GROUP BY

### Key Differences: Window Functions vs GROUP BY

```
┌─────────────────┬──────────────────────┬─────────────────────────┐
│ Feature         │ GROUP BY             │ Window Functions        │
├─────────────────┼──────────────────────┼─────────────────────────┤
│ Rows returned   │ One row per group    │ All original rows       │
│ Aggregation     │ Collapses rows       │ Keeps all rows          │
│ Use case        │ Summary reports      │ Detailed analytics      │
│ Ranking         │ Not possible         │ ROW_NUMBER, RANK, etc.  │
└─────────────────┴──────────────────────┴─────────────────────────┘
```

### Basic Syntax
```sql
window_function() OVER (
    [PARTITION BY partition_expression]
    [ORDER BY sort_expression]
    [ROWS/RANGE frame_specification]
)
```

### Sample Data Setup
```sql
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
(8, 'Frank Miller', 'HR', 62000, '2020-08-22', 'Boston'),
(9, 'Grace Lee', 'IT', 78000, '2021-01-10', 'San Francisco'),
(10, 'Henry Ford', 'Sales', 72000, '2019-12-01', 'Chicago');

-- Sales Table
CREATE TABLE sales (
    sale_id INT PRIMARY KEY,
    employee_id INT,
    sale_date DATE,
    amount DECIMAL(10, 2),
    product_category VARCHAR(50),
    region VARCHAR(50)
);

INSERT INTO sales VALUES
(1, 3, '2024-01-05', 1500, 'Electronics', 'North'),
(2, 3, '2024-01-12', 2000, 'Electronics', 'North'),
(3, 4, '2024-01-08', 1800, 'Furniture', 'South'),
(4, 7, '2024-01-15', 2200, 'Electronics', 'West'),
(5, 10, '2024-01-20', 1600, 'Furniture', 'North'),
(6, 3, '2024-02-03', 2500, 'Electronics', 'North'),
(7, 4, '2024-02-10', 1900, 'Furniture', 'South'),
(8, 7, '2024-02-14', 3000, 'Electronics', 'West'),
(9, 10, '2024-02-18', 1700, 'Electronics', 'North'),
(10, 3, '2024-03-05', 2800, 'Electronics', 'North');
```

---

## Ranking Functions

### 1. ROW_NUMBER()

**Assigns unique sequential number to each row within partition**

```sql
-- Assign unique row number to all employees
SELECT
    employee_id,
    name,
    department,
    salary,
    ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num
FROM employees;
```

**Result:**
```
┌─────────────┬────────────────┬────────────┬────────┬─────────┐
│ employee_id │ name           │ department │ salary │ row_num │
├─────────────┼────────────────┼────────────┼────────┼─────────┤
│ 6           │ Diana Prince   │ IT         │ 95000  │ 1       │
│ 2           │ Jane Smith     │ IT         │ 82000  │ 2       │
│ 9           │ Grace Lee      │ IT         │ 78000  │ 3       │
│ 1           │ John Doe       │ IT         │ 75000  │ 4       │
│ 10          │ Henry Ford     │ Sales      │ 72000  │ 5       │
│ 4           │ Alice Brown    │ Sales      │ 70000  │ 6       │
│ 7           │ Eve Davis      │ Sales      │ 68000  │ 7       │
│ 3           │ Bob Johnson    │ Sales      │ 65000  │ 8       │
│ 8           │ Frank Miller   │ HR         │ 62000  │ 9       │
│ 5           │ Charlie Wilson │ HR         │ 60000  │ 10      │
└─────────────┴────────────────┴────────────┴────────┴─────────┘
```

#### ROW_NUMBER with PARTITION BY
```sql
-- Rank employees within each department
SELECT
    employee_id,
    name,
    department,
    salary,
    ROW_NUMBER() OVER (
        PARTITION BY department
        ORDER BY salary DESC
    ) AS dept_rank
FROM employees
ORDER BY department, dept_rank;
```

**Result:**
```
┌─────────────┬────────────────┬────────────┬────────┬───────────┐
│ employee_id │ name           │ department │ salary │ dept_rank │
├─────────────┼────────────────┼────────────┼────────┼───────────┤
│ 8           │ Frank Miller   │ HR         │ 62000  │ 1         │
│ 5           │ Charlie Wilson │ HR         │ 60000  │ 2         │
│ 6           │ Diana Prince   │ IT         │ 95000  │ 1         │
│ 2           │ Jane Smith     │ IT         │ 82000  │ 2         │
│ 9           │ Grace Lee      │ IT         │ 78000  │ 3         │
│ 1           │ John Doe       │ IT         │ 75000  │ 4         │
│ 10          │ Henry Ford     │ Sales      │ 72000  │ 1         │
│ 4           │ Alice Brown    │ Sales      │ 70000  │ 2         │
│ 7           │ Eve Davis      │ Sales      │ 68000  │ 3         │
│ 3           │ Bob Johnson    │ Sales      │ 65000  │ 4         │
└─────────────┴────────────────┴────────────┴────────┴───────────┘
```

**Use Case:** Pagination, unique numbering, selecting top N per group

### 2. RANK()

**Assigns rank with gaps for ties**

```sql
-- Rank employees by salary (with ties)
SELECT
    name,
    department,
    salary,
    RANK() OVER (ORDER BY salary DESC) AS rank_with_gaps
FROM employees;
```

**Visual Example with Ties:**
```
┌───────────────┬────────────┬────────┬────────────────┐
│ name          │ department │ salary │ rank_with_gaps │
├───────────────┼────────────┼────────┼────────────────┤
│ Diana Prince  │ IT         │ 95000  │ 1              │
│ Jane Smith    │ IT         │ 82000  │ 2              │
│ Grace Lee     │ IT         │ 78000  │ 3              │
│ John Doe      │ IT         │ 75000  │ 4              │
│ Henry Ford    │ Sales      │ 72000  │ 5              │
│ Alice Brown   │ Sales      │ 70000  │ 6              │  ← If these two
│ Alice Clone   │ Sales      │ 70000  │ 6              │  ← had same salary
│ Eve Davis     │ Sales      │ 68000  │ 8              │  ← Next rank is 8 (gap!)
└───────────────┴────────────┴────────┴────────────────┘
```

**Use Case:** Competition ranking (Olympic medals), leaderboards with ties

### 3. DENSE_RANK()

**Assigns rank without gaps for ties**

```sql
-- Rank employees by salary (no gaps)
SELECT
    name,
    department,
    salary,
    DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rank
FROM employees;
```

**Comparison: RANK vs DENSE_RANK**
```
┌───────────────┬────────┬──────┬────────────┐
│ name          │ salary │ RANK │ DENSE_RANK │
├───────────────┼────────┼──────┼────────────┤
│ Diana Prince  │ 95000  │ 1    │ 1          │
│ Jane Smith    │ 82000  │ 2    │ 2          │
│ Grace Lee     │ 78000  │ 3    │ 3          │
│ John Doe      │ 75000  │ 4    │ 4          │
│ Henry Ford    │ 72000  │ 5    │ 5          │
│ Alice Brown   │ 70000  │ 6    │ 6          │
│ Alice Clone   │ 70000  │ 6    │ 6          │  ← Same rank
│ Eve Davis     │ 68000  │ 8    │ 7          │  ← No gap!
│ Bob Johnson   │ 65000  │ 9    │ 8          │
└───────────────┴────────┴──────┴────────────┘
```

**Use Case:** Dense rankings, filtering top N without gaps

### 4. NTILE()

**Divides rows into specified number of groups**

```sql
-- Divide employees into 4 salary quartiles
SELECT
    name,
    department,
    salary,
    NTILE(4) OVER (ORDER BY salary DESC) AS salary_quartile
FROM employees;
```

**Result:**
```
┌────────────────┬────────────┬────────┬──────────────────┐
│ name           │ department │ salary │ salary_quartile  │
├────────────────┼────────────┼────────┼──────────────────┤
│ Diana Prince   │ IT         │ 95000  │ 1  ← Top 25%     │
│ Jane Smith     │ IT         │ 82000  │ 1                │
│ Grace Lee      │ IT         │ 78000  │ 1                │
│ John Doe       │ IT         │ 75000  │ 2  ← 25-50%      │
│ Henry Ford     │ Sales      │ 72000  │ 2                │
│ Alice Brown    │ Sales      │ 70000  │ 3  ← 50-75%      │
│ Eve Davis      │ Sales      │ 68000  │ 3                │
│ Bob Johnson    │ Sales      │ 65000  │ 3                │
│ Frank Miller   │ HR         │ 62000  │ 4  ← Bottom 25%  │
│ Charlie Wilson │ HR         │ 60000  │ 4                │
└────────────────┴────────────┴────────┴──────────────────┘
```

**Use Case:** Percentiles, quartiles, dividing into equal groups

### Ranking Functions Comparison
```sql
-- Compare all ranking functions
SELECT
    name,
    department,
    salary,
    ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num,
    RANK() OVER (ORDER BY salary DESC) AS rank,
    DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rank,
    NTILE(3) OVER (ORDER BY salary DESC) AS tertile
FROM employees;
```

---

## Analytic Functions

### 1. LAG()

**Access value from previous row**

```sql
-- Compare each employee's salary with previous employee
SELECT
    name,
    department,
    salary,
    LAG(salary) OVER (ORDER BY salary DESC) AS previous_salary,
    salary - LAG(salary) OVER (ORDER BY salary DESC) AS salary_diff
FROM employees;
```

**Result:**
```
┌────────────────┬────────────┬────────┬─────────────────┬─────────────┐
│ name           │ department │ salary │ previous_salary │ salary_diff │
├────────────────┼────────────┼────────┼─────────────────┼─────────────┤
│ Diana Prince   │ IT         │ 95000  │ NULL            │ NULL        │
│ Jane Smith     │ IT         │ 82000  │ 95000           │ -13000      │
│ Grace Lee      │ IT         │ 78000  │ 82000           │ -4000       │
│ John Doe       │ IT         │ 75000  │ 78000           │ -3000       │
│ Henry Ford     │ Sales      │ 72000  │ 75000           │ -3000       │
│ Alice Brown    │ Sales      │ 70000  │ 72000           │ -2000       │
└────────────────┴────────────┴────────┴─────────────────┴─────────────┘
```

#### LAG with Offset and Default
```sql
-- Get salary from 2 positions back, default to 0 if not exists
SELECT
    name,
    salary,
    LAG(salary, 1, 0) OVER (ORDER BY salary DESC) AS prev_1,
    LAG(salary, 2, 0) OVER (ORDER BY salary DESC) AS prev_2
FROM employees;
```

#### LAG within Department
```sql
-- Compare salary with previous employee in same department
SELECT
    name,
    department,
    salary,
    LAG(salary) OVER (
        PARTITION BY department
        ORDER BY salary DESC
    ) AS prev_salary_in_dept,
    salary - LAG(salary) OVER (
        PARTITION BY department
        ORDER BY salary DESC
    ) AS diff_from_prev
FROM employees
ORDER BY department, salary DESC;
```

**Use Case:** Period-over-period comparison, change detection, trend analysis

### 2. LEAD()

**Access value from next row**

```sql
-- Look ahead to next employee's salary
SELECT
    name,
    department,
    salary,
    LEAD(salary) OVER (ORDER BY salary DESC) AS next_salary,
    salary - LEAD(salary) OVER (ORDER BY salary DESC) AS salary_gap
FROM employees;
```

**Result:**
```
┌────────────────┬────────────┬────────┬─────────────┬────────────┐
│ name           │ department │ salary │ next_salary │ salary_gap │
├────────────────┼────────────┼────────┼─────────────┼────────────┤
│ Diana Prince   │ IT         │ 95000  │ 82000       │ 13000      │
│ Jane Smith     │ IT         │ 82000  │ 78000       │ 4000       │
│ Grace Lee      │ IT         │ 78000  │ 75000       │ 3000       │
│ John Doe       │ IT         │ 75000  │ 72000       │ 3000       │
│ Henry Ford     │ Sales      │ 72000  │ 70000       │ 2000       │
│ Alice Brown    │ Sales      │ 70000  │ 68000       │ 2000       │
│ Eve Davis      │ Sales      │ 68000  │ 65000       │ 3000       │
│ Bob Johnson    │ Sales      │ 65000  │ 62000       │ 3000       │
│ Frank Miller   │ HR         │ 62000  │ 60000       │ 2000       │
│ Charlie Wilson │ HR         │ 60000  │ NULL        │ NULL       │
└────────────────┴────────────┴────────┴─────────────┴────────────┘
```

**Use Case:** Forward-looking analysis, next period prediction

### 3. FIRST_VALUE()

**Get first value in window**

```sql
-- Compare each salary with highest in department
SELECT
    name,
    department,
    salary,
    FIRST_VALUE(salary) OVER (
        PARTITION BY department
        ORDER BY salary DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS highest_in_dept,
    FIRST_VALUE(name) OVER (
        PARTITION BY department
        ORDER BY salary DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS top_earner
FROM employees
ORDER BY department, salary DESC;
```

**Result:**
```
┌──────────────┬────────────┬────────┬─────────────────┬──────────────┐
│ name         │ department │ salary │ highest_in_dept │ top_earner   │
├──────────────┼────────────┼────────┼─────────────────┼──────────────┤
│ Frank Miller │ HR         │ 62000  │ 62000           │ Frank Miller │
│ Charlie W.   │ HR         │ 60000  │ 62000           │ Frank Miller │
│ Diana Prince │ IT         │ 95000  │ 95000           │ Diana Prince │
│ Jane Smith   │ IT         │ 82000  │ 95000           │ Diana Prince │
│ Grace Lee    │ IT         │ 78000  │ 95000           │ Diana Prince │
│ John Doe     │ IT         │ 75000  │ 95000           │ Diana Prince │
└──────────────┴────────────┴────────┴─────────────────┴──────────────┘
```

### 4. LAST_VALUE()

**Get last value in window**

```sql
-- Compare with lowest salary in department
SELECT
    name,
    department,
    salary,
    LAST_VALUE(salary) OVER (
        PARTITION BY department
        ORDER BY salary DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS lowest_in_dept
FROM employees
ORDER BY department, salary DESC;
```

**Use Case:** Comparing with min/max values, benchmarking

---

## Aggregate Window Functions

### Running Totals
```sql
-- Calculate running total of sales by employee
SELECT
    s.sale_id,
    e.name,
    s.sale_date,
    s.amount,
    SUM(s.amount) OVER (
        PARTITION BY s.employee_id
        ORDER BY s.sale_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total
FROM sales s
JOIN employees e ON s.employee_id = e.employee_id
ORDER BY e.name, s.sale_date;
```

**Result:**
```
┌─────────┬──────────────┬────────────┬────────┬───────────────┐
│ sale_id │ name         │ sale_date  │ amount │ running_total │
├─────────┼──────────────┼────────────┼────────┼───────────────┤
│ 3       │ Alice Brown  │ 2024-01-08 │ 1800   │ 1800          │
│ 7       │ Alice Brown  │ 2024-02-10 │ 1900   │ 3700          │
│ 1       │ Bob Johnson  │ 2024-01-05 │ 1500   │ 1500          │
│ 2       │ Bob Johnson  │ 2024-01-12 │ 2000   │ 3500          │
│ 6       │ Bob Johnson  │ 2024-02-03 │ 2500   │ 6000          │
│ 10      │ Bob Johnson  │ 2024-03-05 │ 2800   │ 8800          │
│ 4       │ Eve Davis    │ 2024-01-15 │ 2200   │ 2200          │
│ 8       │ Eve Davis    │ 2024-02-14 │ 3000   │ 5200          │
└─────────┴──────────────┴────────────┴────────┴───────────────┘
```

### Moving Average
```sql
-- Calculate 3-sale moving average
SELECT
    s.sale_id,
    e.name,
    s.sale_date,
    s.amount,
    ROUND(AVG(s.amount) OVER (
        PARTITION BY s.employee_id
        ORDER BY s.sale_date
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ), 2) AS moving_avg_3
FROM sales s
JOIN employees e ON s.employee_id = e.employee_id
ORDER BY e.name, s.sale_date;
```

**Result:**
```
┌─────────┬─────────────┬────────────┬────────┬──────────────┐
│ sale_id │ name        │ sale_date  │ amount │ moving_avg_3 │
├─────────┼─────────────┼────────────┼────────┼──────────────┤
│ 1       │ Bob Johnson │ 2024-01-05 │ 1500   │ 1500.00      │  ← Only 1 row
│ 2       │ Bob Johnson │ 2024-01-12 │ 2000   │ 1750.00      │  ← Average of 2
│ 6       │ Bob Johnson │ 2024-02-03 │ 2500   │ 2000.00      │  ← Average of 3
│ 10      │ Bob Johnson │ 2024-03-05 │ 2800   │ 2433.33      │  ← Average of 3
└─────────┴─────────────┴────────────┴────────┴──────────────┘
```

### Cumulative Distribution
```sql
-- Calculate what percentage of employees earn less than current salary
SELECT
    name,
    department,
    salary,
    ROUND(CUME_DIST() OVER (ORDER BY salary) * 100, 2) AS percentile
FROM employees
ORDER BY salary DESC;
```

**Result:**
```
┌────────────────┬────────────┬────────┬────────────┐
│ name           │ department │ salary │ percentile │
├────────────────┼────────────┼────────┼────────────┤
│ Diana Prince   │ IT         │ 95000  │ 100.00     │  ← Top 100%
│ Jane Smith     │ IT         │ 82000  │ 90.00      │
│ Grace Lee      │ IT         │ 78000  │ 80.00      │
│ John Doe       │ IT         │ 75000  │ 70.00      │
│ Henry Ford     │ Sales      │ 72000  │ 60.00      │
│ Alice Brown    │ Sales      │ 70000  │ 50.00      │  ← Median
│ Eve Davis      │ Sales      │ 68000  │ 40.00      │
│ Bob Johnson    │ Sales      │ 65000  │ 30.00      │
│ Frank Miller   │ HR         │ 62000  │ 20.00      │
│ Charlie Wilson │ HR         │ 60000  │ 10.00      │  ← Bottom 10%
└────────────────┴────────────┴────────┴────────────┘
```

### PERCENT_RANK
```sql
-- Calculate percentile rank (0 to 1)
SELECT
    name,
    department,
    salary,
    ROUND(PERCENT_RANK() OVER (ORDER BY salary), 2) AS percent_rank,
    ROUND(PERCENT_RANK() OVER (
        PARTITION BY department
        ORDER BY salary
    ), 2) AS dept_percent_rank
FROM employees
ORDER BY salary DESC;
```

---

## PARTITION BY Clause

**PARTITION BY**: Divides result set into partitions (like GROUP BY but keeps all rows)

### Without PARTITION BY
```sql
-- Overall ranking
SELECT
    name,
    department,
    salary,
    RANK() OVER (ORDER BY salary DESC) AS overall_rank
FROM employees;
```

### With PARTITION BY
```sql
-- Ranking within each department
SELECT
    name,
    department,
    salary,
    RANK() OVER (
        PARTITION BY department
        ORDER BY salary DESC
    ) AS dept_rank
FROM employees
ORDER BY department, dept_rank;
```

### Multiple Partitions
```sql
-- Partition by department and city
SELECT
    name,
    department,
    city,
    salary,
    AVG(salary) OVER (PARTITION BY department) AS dept_avg,
    AVG(salary) OVER (PARTITION BY city) AS city_avg,
    AVG(salary) OVER (PARTITION BY department, city) AS dept_city_avg
FROM employees
ORDER BY department, city, salary DESC;
```

---

## Frame Specification

**Frame**: Defines which rows to include in window calculation

### Frame Types

```
ROWS    - Physical rows
RANGE   - Logical range based on values

UNBOUNDED PRECEDING - From start of partition
CURRENT ROW        - Current row
UNBOUNDED FOLLOWING - To end of partition
N PRECEDING        - N rows before current
N FOLLOWING        - N rows after current
```

### Examples

#### 1. Running Total (from start to current)
```sql
SELECT
    sale_date,
    amount,
    SUM(amount) OVER (
        ORDER BY sale_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total
FROM sales;
```

#### 2. Moving Average (3 rows window)
```sql
SELECT
    sale_date,
    amount,
    AVG(amount) OVER (
        ORDER BY sale_date
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS moving_avg_3
FROM sales;
```

#### 3. Centered Moving Average
```sql
SELECT
    sale_date,
    amount,
    AVG(amount) OVER (
        ORDER BY sale_date
        ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING
    ) AS centered_avg
FROM sales;
```

#### 4. Entire Partition
```sql
SELECT
    name,
    department,
    salary,
    AVG(salary) OVER (
        PARTITION BY department
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS dept_avg
FROM employees;
```

---

## Real-World Business Scenarios

### Scenario 1: Sales Performance Dashboard
```sql
-- Comprehensive sales performance metrics
SELECT
    e.name AS salesperson,
    s.sale_date,
    s.amount,
    -- Rank this sale among all sales
    RANK() OVER (ORDER BY s.amount DESC) AS sale_rank,
    -- Rank within this salesperson's sales
    RANK() OVER (
        PARTITION BY s.employee_id
        ORDER BY s.amount DESC
    ) AS personal_best_rank,
    -- Running total for this salesperson
    SUM(s.amount) OVER (
        PARTITION BY s.employee_id
        ORDER BY s.sale_date
        ROWS UNBOUNDED PRECEDING
    ) AS cumulative_sales,
    -- Month-to-date total
    SUM(s.amount) OVER (
        PARTITION BY s.employee_id, DATE_FORMAT(s.sale_date, '%Y-%m')
        ORDER BY s.sale_date
    ) AS mtd_sales,
    -- Previous sale amount
    LAG(s.amount) OVER (
        PARTITION BY s.employee_id
        ORDER BY s.sale_date
    ) AS previous_sale,
    -- Growth from previous sale
    ROUND((s.amount - LAG(s.amount) OVER (
        PARTITION BY s.employee_id
        ORDER BY s.sale_date
    )) / LAG(s.amount) OVER (
        PARTITION BY s.employee_id
        ORDER BY s.sale_date
    ) * 100, 2) AS growth_percent
FROM sales s
JOIN employees e ON s.employee_id = e.employee_id
ORDER BY e.name, s.sale_date;
```

### Scenario 2: Top N Per Category
```sql
-- Get top 3 salespeople by total sales in each region
WITH regional_sales AS (
    SELECT
        e.name,
        s.region,
        SUM(s.amount) AS total_sales,
        RANK() OVER (
            PARTITION BY s.region
            ORDER BY SUM(s.amount) DESC
        ) AS region_rank
    FROM sales s
    JOIN employees e ON s.employee_id = e.employee_id
    GROUP BY e.name, s.region
)
SELECT
    region,
    name AS salesperson,
    total_sales,
    region_rank
FROM regional_sales
WHERE region_rank <= 3
ORDER BY region, region_rank;
```

### Scenario 3: Year-over-Year Comparison
```sql
-- Compare sales with same month last year
SELECT
    DATE_FORMAT(sale_date, '%Y-%m') AS month,
    SUM(amount) AS monthly_sales,
    LAG(SUM(amount), 12) OVER (ORDER BY DATE_FORMAT(sale_date, '%Y-%m')) AS same_month_last_year,
    ROUND(
        (SUM(amount) - LAG(SUM(amount), 12) OVER (ORDER BY DATE_FORMAT(sale_date, '%Y-%m')))
        / LAG(SUM(amount), 12) OVER (ORDER BY DATE_FORMAT(sale_date, '%Y-%m')) * 100,
        2
    ) AS yoy_growth_percent
FROM sales
GROUP BY DATE_FORMAT(sale_date, '%Y-%m')
ORDER BY month;
```

### Scenario 4: Identifying Trends
```sql
-- Find employees with consistently growing sales
WITH sales_trends AS (
    SELECT
        e.name,
        s.sale_date,
        s.amount,
        LAG(s.amount) OVER (
            PARTITION BY s.employee_id
            ORDER BY s.sale_date
        ) AS prev_sale,
        CASE
            WHEN s.amount > LAG(s.amount) OVER (
                PARTITION BY s.employee_id
                ORDER BY s.sale_date
            ) THEN 1
            ELSE 0
        END AS is_growing
    FROM sales s
    JOIN employees e ON s.employee_id = e.employee_id
)
SELECT
    name,
    COUNT(*) AS total_sales,
    SUM(is_growing) AS times_grew,
    ROUND(SUM(is_growing) * 100.0 / COUNT(*), 2) AS growth_percentage
FROM sales_trends
WHERE prev_sale IS NOT NULL
GROUP BY name
HAVING SUM(is_growing) * 100.0 / COUNT(*) >= 50
ORDER BY growth_percentage DESC;
```

### Scenario 5: Salary Gap Analysis
```sql
-- Analyze salary gaps within departments
SELECT
    name,
    department,
    salary,
    AVG(salary) OVER (PARTITION BY department) AS dept_avg,
    salary - AVG(salary) OVER (PARTITION BY department) AS diff_from_avg,
    FIRST_VALUE(salary) OVER (
        PARTITION BY department
        ORDER BY salary DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS dept_max,
    salary - FIRST_VALUE(salary) OVER (
        PARTITION BY department
        ORDER BY salary DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS gap_from_top,
    PERCENT_RANK() OVER (
        PARTITION BY department
        ORDER BY salary
    ) AS dept_percentile
FROM employees
ORDER BY department, salary DESC;
```

---

## Interview Questions

### Q1: What's the difference between RANK() and DENSE_RANK()?
**Answer:**
- **RANK()**: Leaves gaps in ranking when there are ties
- **DENSE_RANK()**: No gaps in ranking sequence

Example with tie at position 2:
```
RANK(): 1, 2, 2, 4, 5  (gap at 3)
DENSE_RANK(): 1, 2, 2, 3, 4  (no gap)
```

### Q2: What's the difference between window functions and GROUP BY?
**Answer:**
| Feature | GROUP BY | Window Functions |
|---------|----------|------------------|
| Rows returned | One per group | All original rows |
| Aggregation | Collapses rows | Keeps all rows |
| Additional columns | Limited | Can include any column |
| Ranking | Not possible | ROW_NUMBER, RANK, etc. |

### Q3: How do you get the top N rows per group?
**Answer:**
```sql
-- Method 1: Using ROW_NUMBER
SELECT * FROM (
    SELECT
        *,
        ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS rn
    FROM products
) WHERE rn <= 3;

-- Method 2: Using RANK (includes ties)
SELECT * FROM (
    SELECT
        *,
        RANK() OVER (PARTITION BY category ORDER BY price DESC) AS rank
    FROM products
) WHERE rank <= 3;
```

### Q4: What's the difference between ROWS and RANGE in frame specification?
**Answer:**
- **ROWS**: Physical rows (counts actual rows)
- **RANGE**: Logical range (based on value comparison)

```sql
-- ROWS: Looks at 2 physical rows before
AVG(amount) OVER (ORDER BY date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)

-- RANGE: Looks at all rows with dates within range
AVG(amount) OVER (ORDER BY date RANGE BETWEEN INTERVAL 2 DAY PRECEDING AND CURRENT ROW)
```

### Q5: How do you calculate running total?
**Answer:**
```sql
SELECT
    date,
    amount,
    SUM(amount) OVER (
        ORDER BY date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total
FROM sales;

-- Simpler (default frame)
SELECT
    date,
    amount,
    SUM(amount) OVER (ORDER BY date) AS running_total
FROM sales;
```

### Q6: How do you find the percentage of total?
**Answer:**
```sql
SELECT
    product,
    amount,
    ROUND(amount * 100.0 / SUM(amount) OVER (), 2) AS percent_of_total
FROM sales;
```

---

## Practice Exercises

### Exercise 1: Basic Window Functions
```sql
-- Q1: Rank employees by salary within each department
SELECT
    name,
    department,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank
FROM employees;

-- Q2: Get running total of sales by date
SELECT
    sale_date,
    amount,
    SUM(amount) OVER (ORDER BY sale_date) AS running_total
FROM sales;

-- Q3: Find previous and next sale for each record
SELECT
    sale_id,
    sale_date,
    amount,
    LAG(amount) OVER (ORDER BY sale_date) AS previous_sale,
    LEAD(amount) OVER (ORDER BY sale_date) AS next_sale
FROM sales;
```

### Exercise 2: Analytical Queries
```sql
-- Q1: Calculate 3-month moving average of sales
SELECT
    DATE_FORMAT(sale_date, '%Y-%m') AS month,
    SUM(amount) AS monthly_sales,
    AVG(SUM(amount)) OVER (
        ORDER BY DATE_FORMAT(sale_date, '%Y-%m')
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS moving_avg_3months
FROM sales
GROUP BY DATE_FORMAT(sale_date, '%Y-%m');

-- Q2: Find employees in top 25% of salary in their department
SELECT *
FROM (
    SELECT
        name,
        department,
        salary,
        NTILE(4) OVER (PARTITION BY department ORDER BY salary DESC) AS quartile
    FROM employees
) WHERE quartile = 1;

-- Q3: Calculate percent rank of each employee's salary
SELECT
    name,
    department,
    salary,
    ROUND(PERCENT_RANK() OVER (ORDER BY salary) * 100, 2) AS percentile,
    ROUND(PERCENT_RANK() OVER (
        PARTITION BY department ORDER BY salary
    ) * 100, 2) AS dept_percentile
FROM employees;
```

### Exercise 3: Complex Scenarios
```sql
-- Q1: Find employees whose salary is above department average
SELECT
    name,
    department,
    salary,
    ROUND(AVG(salary) OVER (PARTITION BY department), 2) AS dept_avg,
    ROUND(salary - AVG(salary) OVER (PARTITION BY department), 2) AS diff
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees e2 WHERE e2.department = employees.department);

-- Q2: Get top 2 sales per employee
SELECT *
FROM (
    SELECT
        e.name,
        s.sale_date,
        s.amount,
        RANK() OVER (PARTITION BY s.employee_id ORDER BY s.amount DESC) AS sale_rank
    FROM sales s
    JOIN employees e ON s.employee_id = e.employee_id
) WHERE sale_rank <= 2;

-- Q3: Calculate growth rate compared to first sale
SELECT
    employee_id,
    sale_date,
    amount,
    FIRST_VALUE(amount) OVER (
        PARTITION BY employee_id
        ORDER BY sale_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS first_sale,
    ROUND(
        (amount - FIRST_VALUE(amount) OVER (
            PARTITION BY employee_id
            ORDER BY sale_date
            ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
        )) * 100.0 / FIRST_VALUE(amount) OVER (
            PARTITION BY employee_id
            ORDER BY sale_date
            ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
        ),
        2
    ) AS growth_from_first
FROM sales;
```

---

## Quick Reference

### Window Function Syntax
```sql
function_name() OVER (
    [PARTITION BY partition_expression]
    [ORDER BY sort_expression]
    [frame_specification]
)
```

### Common Window Functions
```sql
-- Ranking
ROW_NUMBER()    -- Unique sequential number
RANK()          -- Rank with gaps
DENSE_RANK()    -- Rank without gaps
NTILE(n)        -- Divide into n groups

-- Analytical
LAG(col, n)     -- Previous row value
LEAD(col, n)    -- Next row value
FIRST_VALUE()   -- First value in window
LAST_VALUE()    -- Last value in window

-- Aggregate
SUM() OVER()    -- Running/windowed sum
AVG() OVER()    -- Running/windowed average
COUNT() OVER()  -- Running/windowed count
MIN() OVER()    -- Running/windowed min
MAX() OVER()    -- Running/windowed max

-- Distribution
PERCENT_RANK()  -- Percentile rank (0 to 1)
CUME_DIST()     -- Cumulative distribution
```

### Frame Specifications
```sql
ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW  -- Start to current
ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING   -- Current to end
ROWS BETWEEN 2 PRECEDING AND CURRENT ROW           -- Last 3 rows
ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING           -- Window of 3
ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING  -- Entire partition
```

---

## Key Takeaways

1. **Window functions keep all rows** (unlike GROUP BY)
2. **PARTITION BY divides data** into groups for separate calculations
3. **ORDER BY within OVER** determines calculation order
4. **Frame specification** controls which rows to include
5. **ROW_NUMBER** always unique, **RANK** has gaps, **DENSE_RANK** has no gaps
6. **LAG/LEAD** access previous/next rows for comparisons
7. **Running totals** use `SUM() OVER (ORDER BY ... ROWS UNBOUNDED PRECEDING)`
8. **Moving averages** use frame specification with PRECEDING/FOLLOWING
9. Window functions **execute after WHERE** but **before ORDER BY**
10. **Combine window functions** for powerful analytics
