# SQL Joins - Combining Data from Multiple Tables

## Table of Contents
1. [Introduction to Joins](#introduction-to-joins)
2. [INNER JOIN](#inner-join)
3. [LEFT JOIN (LEFT OUTER JOIN)](#left-join)
4. [RIGHT JOIN (RIGHT OUTER JOIN)](#right-join)
5. [FULL OUTER JOIN](#full-outer-join)
6. [CROSS JOIN](#cross-join)
7. [SELF JOIN](#self-join)
8. [Multiple Joins](#multiple-joins)
9. [Join Performance Tips](#join-performance-tips)
10. [Practice Exercises](#practice-exercises)

---

## Introduction to Joins

**JOIN**: Combines rows from two or more tables based on a related column

### Why Use Joins?
- Retrieve data from multiple related tables
- Avoid data redundancy (normalization)
- Create comprehensive reports
- Analyze relationships between entities

### Join Types Overview
```
┌─────────────────┬──────────────────────────────────────────┐
│ Join Type       │ Description                              │
├─────────────────┼──────────────────────────────────────────┤
│ INNER JOIN      │ Returns matching rows from both tables   │
│ LEFT JOIN       │ All from left + matching from right      │
│ RIGHT JOIN      │ All from right + matching from left      │
│ FULL OUTER JOIN │ All rows from both tables                │
│ CROSS JOIN      │ Cartesian product (all combinations)     │
│ SELF JOIN       │ Table joined with itself                 │
└─────────────────┴──────────────────────────────────────────┘
```

---

## Sample Data Setup

### E-Commerce Database
```sql
-- Customers Table
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    name VARCHAR(50),
    city VARCHAR(50),
    country VARCHAR(50)
);

INSERT INTO customers VALUES
(1, 'John Doe', 'New York', 'USA'),
(2, 'Jane Smith', 'London', 'UK'),
(3, 'Bob Johnson', 'Toronto', 'Canada'),
(4, 'Alice Brown', 'Sydney', 'Australia'),
(5, 'Charlie Wilson', 'Paris', 'France');

-- Orders Table
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    total_amount DECIMAL(10, 2)
);

INSERT INTO orders VALUES
(101, 1, '2024-01-15', 150.00),
(102, 1, '2024-02-20', 200.00),
(103, 2, '2024-01-18', 75.00),
(104, 3, '2024-03-10', 300.00),
(105, NULL, '2024-03-15', 50.00);  -- Order without customer

-- Products Table
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(10, 2)
);

INSERT INTO products VALUES
(1, 'Laptop', 'Electronics', 999.99),
(2, 'Mouse', 'Electronics', 29.99),
(3, 'Keyboard', 'Electronics', 79.99),
(4, 'Monitor', 'Electronics', 299.99),
(5, 'Desk Chair', 'Furniture', 199.99);

-- Order Details Table
CREATE TABLE order_details (
    order_detail_id INT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    unit_price DECIMAL(10, 2)
);

INSERT INTO order_details VALUES
(1, 101, 1, 1, 999.99),
(2, 101, 2, 2, 29.99),
(3, 102, 3, 1, 79.99),
(4, 103, 4, 1, 299.99),
(5, 104, 5, 2, 199.99);
```

---

## INNER JOIN

**Returns only matching rows from both tables**

### Syntax
```sql
SELECT columns
FROM table1
INNER JOIN table2
ON table1.column = table2.column;

-- Alternative syntax (implicit join)
SELECT columns
FROM table1, table2
WHERE table1.column = table2.column;
```

### Visual Representation
```
Table A          Table B          Result (INNER JOIN)
┌────┬─────┐    ┌────┬─────┐    ┌────┬─────┬─────┐
│ ID │ Val │    │ ID │ Val │    │ ID │ A   │ B   │
├────┼─────┤    ├────┼─────┤    ├────┼─────┼─────┤
│ 1  │ A1  │    │ 1  │ B1  │    │ 1  │ A1  │ B1  │
│ 2  │ A2  │────│ 2  │ B2  │───→│ 2  │ A2  │ B2  │
│ 3  │ A3  │    │ 4  │ B4  │    │ 3  │ A3  │ B3  │
│ 5  │ A5  │    │ 3  │ B3  │    └────┴─────┴─────┘
└────┴─────┘    └────┴─────┘    Only matching records
```

### Example 1: Customers and Their Orders
```sql
-- Get customers who have placed orders
SELECT
    c.customer_id,
    c.name,
    c.city,
    o.order_id,
    o.order_date,
    o.total_amount
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id;
```

**Result:**
```
┌─────────────┬───────────────┬──────────┬──────────┬────────────┬──────────────┐
│ customer_id │ name          │ city     │ order_id │ order_date │ total_amount │
├─────────────┼───────────────┼──────────┼──────────┼────────────┼──────────────┤
│ 1           │ John Doe      │ New York │ 101      │ 2024-01-15 │ 150.00       │
│ 1           │ John Doe      │ New York │ 102      │ 2024-02-20 │ 200.00       │
│ 2           │ Jane Smith    │ London   │ 103      │ 2024-01-18 │ 75.00        │
│ 3           │ Bob Johnson   │ Toronto  │ 104      │ 2024-03-10 │ 300.00       │
└─────────────┴───────────────┴──────────┴──────────┴────────────┴──────────────┘

Note: Alice Brown (ID 4) and Charlie Wilson (ID 5) are excluded (no orders)
      Order 105 is excluded (no customer)
```

### Example 2: Orders with Product Details
```sql
-- Get complete order information with product names
SELECT
    o.order_id,
    o.order_date,
    p.product_name,
    od.quantity,
    od.unit_price,
    (od.quantity * od.unit_price) AS line_total
FROM orders o
INNER JOIN order_details od ON o.order_id = od.order_id
INNER JOIN products p ON od.product_id = p.product_id
ORDER BY o.order_id;
```

**Result:**
```
┌──────────┬────────────┬──────────────┬──────────┬────────────┬────────────┐
│ order_id │ order_date │ product_name │ quantity │ unit_price │ line_total │
├──────────┼────────────┼──────────────┼──────────┼────────────┼────────────┤
│ 101      │ 2024-01-15 │ Laptop       │ 1        │ 999.99     │ 999.99     │
│ 101      │ 2024-01-15 │ Mouse        │ 2        │ 29.99      │ 59.98      │
│ 102      │ 2024-02-20 │ Keyboard     │ 1        │ 79.99      │ 79.99      │
│ 103      │ 2024-01-18 │ Monitor      │ 1        │ 299.99     │ 299.99     │
│ 104      │ 2024-03-10 │ Desk Chair   │ 2        │ 199.99     │ 399.98     │
└──────────┴────────────┴──────────────┴──────────┴────────────┴────────────┘
```

---

## LEFT JOIN

**Returns all rows from left table + matching rows from right table**

### Syntax
```sql
SELECT columns
FROM table1
LEFT JOIN table2
ON table1.column = table2.column;
```

### Visual Representation
```
Table A          Table B          Result (LEFT JOIN)
┌────┬─────┐    ┌────┬─────┐    ┌────┬─────┬──────┐
│ ID │ Val │    │ ID │ Val │    │ ID │ A   │ B    │
├────┼─────┤    ├────┼─────┤    ├────┼─────┼──────┤
│ 1  │ A1  │────│ 1  │ B1  │───→│ 1  │ A1  │ B1   │
│ 2  │ A2  │────│ 2  │ B2  │───→│ 2  │ A2  │ B2   │
│ 3  │ A3  │    │ 4  │ B4  │    │ 3  │ A3  │ B3   │
│ 5  │ A5  │ ╳                   │ 5  │ A5  │ NULL │
└────┴─────┘                     └────┴─────┴──────┘
           All from left + matching from right
```

### Example 1: All Customers and Their Orders (if any)
```sql
-- Get all customers, including those without orders
SELECT
    c.customer_id,
    c.name,
    c.city,
    o.order_id,
    o.order_date,
    o.total_amount
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
ORDER BY c.customer_id;
```

**Result:**
```
┌─────────────┬────────────────┬──────────┬──────────┬────────────┬──────────────┐
│ customer_id │ name           │ city     │ order_id │ order_date │ total_amount │
├─────────────┼────────────────┼──────────┼──────────┼────────────┼──────────────┤
│ 1           │ John Doe       │ New York │ 101      │ 2024-01-15 │ 150.00       │
│ 1           │ John Doe       │ New York │ 102      │ 2024-02-20 │ 200.00       │
│ 2           │ Jane Smith     │ London   │ 103      │ 2024-01-18 │ 75.00        │
│ 3           │ Bob Johnson    │ Toronto  │ 104      │ 2024-03-10 │ 300.00       │
│ 4           │ Alice Brown    │ Sydney   │ NULL     │ NULL       │ NULL         │
│ 5           │ Charlie Wilson │ Paris    │ NULL     │ NULL       │ NULL         │
└─────────────┴────────────────┴──────────┴──────────┴────────────┴──────────────┘

Note: Alice and Charlie appear with NULL values (no orders)
```

### Example 2: Find Customers Without Orders
```sql
-- Customers who haven't placed any orders
SELECT
    c.customer_id,
    c.name,
    c.city
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;
```

**Result:**
```
┌─────────────┬────────────────┬─────────┐
│ customer_id │ name           │ city    │
├─────────────┼────────────────┼─────────┤
│ 4           │ Alice Brown    │ Sydney  │
│ 5           │ Charlie Wilson │ Paris   │
└─────────────┴────────────────┴─────────┘
```

### Example 3: Products Never Ordered
```sql
-- Find products that have never been ordered
SELECT
    p.product_id,
    p.product_name,
    p.category,
    p.price
FROM products p
LEFT JOIN order_details od ON p.product_id = od.product_id
WHERE od.order_detail_id IS NULL;
```

---

## RIGHT JOIN

**Returns all rows from right table + matching rows from left table**

### Syntax
```sql
SELECT columns
FROM table1
RIGHT JOIN table2
ON table1.column = table2.column;
```

### Visual Representation
```
Table A          Table B          Result (RIGHT JOIN)
┌────┬─────┐    ┌────┬─────┐    ┌────┬──────┬─────┐
│ ID │ Val │    │ ID │ Val │    │ ID │ A    │ B   │
├────┼─────┤    ├────┼─────┤    ├────┼──────┼─────┤
│ 1  │ A1  │────│ 1  │ B1  │───→│ 1  │ A1   │ B1  │
│ 2  │ A2  │────│ 2  │ B2  │───→│ 2  │ A2   │ B2  │
│ 3  │ A3  │    │ 4  │ B4  │╳   │ 3  │ A3   │ B3  │
│ 5  │ A5  │    │ 3  │ B3  │    │ 4  │ NULL │ B4  │
└────┴─────┘    └────┴─────┘    └────┴──────┴─────┘
           Matching from left + all from right
```

### Example 1: All Orders and Customer Details (if available)
```sql
-- Get all orders, including those without customer info
SELECT
    o.order_id,
    o.order_date,
    o.total_amount,
    c.customer_id,
    c.name,
    c.city
FROM customers c
RIGHT JOIN orders o ON c.customer_id = o.customer_id
ORDER BY o.order_id;
```

**Result:**
```
┌──────────┬────────────┬──────────────┬─────────────┬──────────────┬──────────┐
│ order_id │ order_date │ total_amount │ customer_id │ name         │ city     │
├──────────┼────────────┼──────────────┼─────────────┼──────────────┼──────────┤
│ 101      │ 2024-01-15 │ 150.00       │ 1           │ John Doe     │ New York │
│ 102      │ 2024-02-20 │ 200.00       │ 1           │ John Doe     │ New York │
│ 103      │ 2024-01-18 │ 75.00        │ 2           │ Jane Smith   │ London   │
│ 104      │ 2024-03-10 │ 300.00       │ 3           │ Bob Johnson  │ Toronto  │
│ 105      │ 2024-03-15 │ 50.00        │ NULL        │ NULL         │ NULL     │
└──────────┴────────────┴──────────────┴─────────────┴──────────────┴──────────┘

Note: Order 105 appears with NULL customer details
```

### Note on RIGHT JOIN
**Most databases prefer LEFT JOIN** because:
- More intuitive (read left to right)
- Can be rewritten as LEFT JOIN by swapping tables
- RIGHT JOIN is less commonly used in practice

```sql
-- These two queries are equivalent:
-- Query 1 (RIGHT JOIN)
SELECT * FROM customers c
RIGHT JOIN orders o ON c.customer_id = o.customer_id;

-- Query 2 (LEFT JOIN - preferred)
SELECT * FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id;
```

---

## FULL OUTER JOIN

**Returns all rows from both tables, with NULLs where no match**

### Syntax
```sql
SELECT columns
FROM table1
FULL OUTER JOIN table2
ON table1.column = table2.column;

-- MySQL doesn't support FULL OUTER JOIN directly
-- Use UNION of LEFT and RIGHT JOINs:
SELECT columns FROM table1 LEFT JOIN table2 ON condition
UNION
SELECT columns FROM table1 RIGHT JOIN table2 ON condition;
```

### Visual Representation
```
Table A          Table B          Result (FULL OUTER JOIN)
┌────┬─────┐    ┌────┬─────┐    ┌────┬──────┬──────┐
│ ID │ Val │    │ ID │ Val │    │ ID │ A    │ B    │
├────┼─────┤    ├────┼─────┤    ├────┼──────┼──────┤
│ 1  │ A1  │────│ 1  │ B1  │───→│ 1  │ A1   │ B1   │
│ 2  │ A2  │────│ 2  │ B2  │───→│ 2  │ A2   │ B2   │
│ 3  │ A3  │    │ 4  │ B4  │╳   │ 3  │ A3   │ B3   │
│ 5  │ A5  │ ╳  │ 3  │ B3  │    │ 4  │ NULL │ B4   │
└────┴─────┘    └────┴─────┘    │ 5  │ A5   │ NULL │
                                 └────┴──────┴──────┘
                    All rows from both tables
```

### Example: All Customers and All Orders
```sql
-- PostgreSQL/Oracle/SQL Server
SELECT
    c.customer_id,
    c.name,
    o.order_id,
    o.order_date,
    o.total_amount
FROM customers c
FULL OUTER JOIN orders o ON c.customer_id = o.customer_id;

-- MySQL (workaround using UNION)
SELECT
    c.customer_id,
    c.name,
    o.order_id,
    o.order_date,
    o.total_amount
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
UNION
SELECT
    c.customer_id,
    c.name,
    o.order_id,
    o.order_date,
    o.total_amount
FROM customers c
RIGHT JOIN orders o ON c.customer_id = o.customer_id;
```

**Result:**
```
┌─────────────┬────────────────┬──────────┬────────────┬──────────────┐
│ customer_id │ name           │ order_id │ order_date │ total_amount │
├─────────────┼────────────────┼──────────┼────────────┼──────────────┤
│ 1           │ John Doe       │ 101      │ 2024-01-15 │ 150.00       │
│ 1           │ John Doe       │ 102      │ 2024-02-20 │ 200.00       │
│ 2           │ Jane Smith     │ 103      │ 2024-01-18 │ 75.00        │
│ 3           │ Bob Johnson    │ 104      │ 2024-03-10 │ 300.00       │
│ 4           │ Alice Brown    │ NULL     │ NULL       │ NULL         │
│ 5           │ Charlie Wilson │ NULL     │ NULL       │ NULL         │
│ NULL        │ NULL           │ 105      │ 2024-03-15 │ 50.00        │
└─────────────┴────────────────┴──────────┴────────────┴──────────────┘

Shows: Customers without orders AND orders without customers
```

---

## CROSS JOIN

**Cartesian Product - Every row from table1 with every row from table2**

### Syntax
```sql
SELECT columns
FROM table1
CROSS JOIN table2;

-- Alternative
SELECT columns
FROM table1, table2;
```

### Visual Representation
```
Table A          Table B          Result (CROSS JOIN)
┌────┬─────┐    ┌────┬─────┐    ┌────┬──────┬────┬──────┐
│ ID │ Val │    │ ID │ Val │    │ A  │ ValA │ B  │ ValB │
├────┼─────┤    ├────┼─────┤    ├────┼──────┼────┼──────┤
│ 1  │ A1  │ ×  │ X  │ BX  │───→│ 1  │ A1   │ X  │ BX   │
│ 2  │ A2  │ ×  │ Y  │ BY  │───→│ 1  │ A1   │ Y  │ BY   │
└────┴─────┘    └────┴─────┘    │ 2  │ A2   │ X  │ BX   │
                                 │ 2  │ A2   │ Y  │ BY   │
    2 rows  ×  2 rows  =  4 rows
```

### Example 1: All Product and Category Combinations
```sql
-- Create a size table
CREATE TABLE sizes (
    size_id INT PRIMARY KEY,
    size_name VARCHAR(10)
);

INSERT INTO sizes VALUES
(1, 'Small'),
(2, 'Medium'),
(3, 'Large');

-- Get all product-size combinations
SELECT
    p.product_name,
    s.size_name
FROM products p
CROSS JOIN sizes s
WHERE p.category = 'Electronics'
LIMIT 10;
```

**Result:**
```
┌──────────────┬───────────┐
│ product_name │ size_name │
├──────────────┼───────────┤
│ Laptop       │ Small     │
│ Laptop       │ Medium    │
│ Laptop       │ Large     │
│ Mouse        │ Small     │
│ Mouse        │ Medium    │
│ Mouse        │ Large     │
│ Keyboard     │ Small     │
│ Keyboard     │ Medium    │
│ Keyboard     │ Large     │
│ Monitor      │ Small     │
└──────────────┴───────────┘
```

### Example 2: Date Range Table
```sql
-- Useful for generating date ranges or calendars
SELECT
    c.name AS customer_name,
    d.date_val AS visit_date
FROM customers c
CROSS JOIN (
    SELECT '2024-01-01' AS date_val
    UNION ALL SELECT '2024-01-02'
    UNION ALL SELECT '2024-01-03'
) d
WHERE c.customer_id <= 2;
```

**Warning:** CROSS JOIN can produce very large result sets!
- Table A (100 rows) × Table B (1000 rows) = 100,000 rows
- Use WHERE clause to limit results

---

## SELF JOIN

**Table joined with itself - useful for hierarchical or comparative data**

### Employee Hierarchy Example
```sql
-- Employees table with manager relationship
CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    name VARCHAR(50),
    job_title VARCHAR(50),
    salary DECIMAL(10, 2),
    manager_id INT
);

INSERT INTO employees VALUES
(1, 'Sarah Johnson', 'CEO', 150000, NULL),
(2, 'Michael Brown', 'CTO', 120000, 1),
(3, 'Emily Davis', 'CFO', 120000, 1),
(4, 'David Wilson', 'Senior Developer', 90000, 2),
(5, 'Lisa Anderson', 'Developer', 75000, 2),
(6, 'John Martinez', 'Accountant', 70000, 3),
(7, 'Anna Taylor', 'Junior Developer', 60000, 4);
```

### Example 1: Employee-Manager Relationships
```sql
-- Show each employee with their manager's name
SELECT
    e.employee_id,
    e.name AS employee_name,
    e.job_title AS employee_title,
    m.name AS manager_name,
    m.job_title AS manager_title
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.employee_id
ORDER BY e.employee_id;
```

**Result:**
```
┌─────────────┬─────────────────┬────────────────────┬────────────────┬───────────────┐
│ employee_id │ employee_name   │ employee_title     │ manager_name   │ manager_title │
├─────────────┼─────────────────┼────────────────────┼────────────────┼───────────────┤
│ 1           │ Sarah Johnson   │ CEO                │ NULL           │ NULL          │
│ 2           │ Michael Brown   │ CTO                │ Sarah Johnson  │ CEO           │
│ 3           │ Emily Davis     │ CFO                │ Sarah Johnson  │ CEO           │
│ 4           │ David Wilson    │ Senior Developer   │ Michael Brown  │ CTO           │
│ 5           │ Lisa Anderson   │ Developer          │ Michael Brown  │ CTO           │
│ 6           │ John Martinez   │ Accountant         │ Emily Davis    │ CFO           │
│ 7           │ Anna Taylor     │ Junior Developer   │ David Wilson   │ Senior Dev    │
└─────────────┴─────────────────┴────────────────────┴────────────────┴───────────────┘
```

### Example 2: Find Employees Earning More Than Their Managers
```sql
-- Compare employee salaries with manager salaries
SELECT
    e.name AS employee_name,
    e.salary AS employee_salary,
    m.name AS manager_name,
    m.salary AS manager_salary,
    (e.salary - m.salary) AS salary_difference
FROM employees e
INNER JOIN employees m ON e.manager_id = m.employee_id
WHERE e.salary > m.salary;
```

### Example 3: Find Employees in Same Department
```sql
-- Find pairs of employees who can work together
SELECT
    e1.name AS employee1,
    e2.name AS employee2,
    e1.job_title
FROM employees e1
INNER JOIN employees e2
    ON e1.job_title = e2.job_title
    AND e1.employee_id < e2.employee_id  -- Avoid duplicates
WHERE e1.job_title LIKE '%Developer%';
```

---

## Multiple Joins

### Example 1: Complete Order Information
```sql
-- Join 4 tables to get complete order details
SELECT
    c.name AS customer_name,
    c.city,
    o.order_id,
    o.order_date,
    p.product_name,
    p.category,
    od.quantity,
    od.unit_price,
    (od.quantity * od.unit_price) AS line_total
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
INNER JOIN order_details od ON o.order_id = od.order_id
INNER JOIN products p ON od.product_id = p.product_id
ORDER BY o.order_id, od.order_detail_id;
```

**Result:**
```
┌───────────────┬──────────┬──────────┬────────────┬──────────────┬─────────────┬──────────┬────────────┬────────────┐
│ customer_name │ city     │ order_id │ order_date │ product_name │ category    │ quantity │ unit_price │ line_total │
├───────────────┼──────────┼──────────┼────────────┼──────────────┼─────────────┼──────────┼────────────┼────────────┤
│ John Doe      │ New York │ 101      │ 2024-01-15 │ Laptop       │ Electronics │ 1        │ 999.99     │ 999.99     │
│ John Doe      │ New York │ 101      │ 2024-01-15 │ Mouse        │ Electronics │ 2        │ 29.99      │ 59.98      │
│ John Doe      │ New York │ 102      │ 2024-02-20 │ Keyboard     │ Electronics │ 1        │ 79.99      │ 79.99      │
│ Jane Smith    │ London   │ 103      │ 2024-01-18 │ Monitor      │ Electronics │ 1        │ 299.99     │ 299.99     │
│ Bob Johnson   │ Toronto  │ 104      │ 2024-03-10 │ Desk Chair   │ Furniture   │ 2        │ 199.99     │ 399.98     │
└───────────────┴──────────┴──────────┴────────────┴──────────────┴─────────────┴──────────┴────────────┴────────────┘
```

### Example 2: Mix of JOIN Types
```sql
-- All customers, their orders (if any), and order details (if any)
SELECT
    c.customer_id,
    c.name,
    o.order_id,
    o.order_date,
    od.product_id,
    od.quantity
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
LEFT JOIN order_details od ON o.order_id = od.order_id
ORDER BY c.customer_id, o.order_id;
```

---

## Join Performance Tips

### 1. Use Indexes on Join Columns
```sql
-- Create indexes on foreign key columns
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_order_details_order ON order_details(order_id);
CREATE INDEX idx_order_details_product ON order_details(product_id);
```

### 2. Filter Early with WHERE
```sql
-- LESS EFFICIENT: Join then filter
SELECT * FROM orders o
INNER JOIN order_details od ON o.order_id = od.order_id
WHERE o.order_date >= '2024-01-01';

-- MORE EFFICIENT: Filter first with subquery
SELECT * FROM
    (SELECT * FROM orders WHERE order_date >= '2024-01-01') o
INNER JOIN order_details od ON o.order_id = od.order_id;
```

### 3. Select Only Required Columns
```sql
-- BAD: Select everything
SELECT * FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id;

-- GOOD: Select only what you need
SELECT c.name, o.order_id, o.total_amount
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id;
```

### 4. Use INNER JOIN Instead of WHERE (Implicit Join)
```sql
-- OLD STYLE (Implicit join) - Less readable
SELECT c.name, o.order_id
FROM customers c, orders o
WHERE c.customer_id = o.customer_id;

-- MODERN STYLE (Explicit join) - Preferred
SELECT c.name, o.order_id
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id;
```

### 5. Avoid CROSS JOIN Unless Necessary
```sql
-- CROSS JOIN creates Cartesian product
-- 1000 customers × 10000 products = 10,000,000 rows!
-- Only use when you actually need all combinations
```

### 6. Join Order Matters (for some databases)
```sql
-- Start with the smallest table or most filtered table
-- Better: Filter first, then join
SELECT *
FROM (SELECT * FROM orders WHERE order_date >= '2024-01-01') o
INNER JOIN order_details od ON o.order_id = od.order_id;
```

---

## Interview Questions

### Q1: What's the difference between INNER JOIN and LEFT JOIN?
**Answer:**
- **INNER JOIN**: Returns only matching rows from both tables
- **LEFT JOIN**: Returns all rows from left table + matching from right (NULL for non-matches)

### Q2: When would you use a SELF JOIN?
**Answer:**
- Hierarchical data (employee-manager relationships)
- Comparing rows within same table
- Finding duplicates
- Pairing records (e.g., finding customers from same city)

### Q3: How do you find records in Table A not in Table B?
**Answer:**
```sql
-- Method 1: LEFT JOIN with NULL check
SELECT a.*
FROM table_a a
LEFT JOIN table_b b ON a.id = b.id
WHERE b.id IS NULL;

-- Method 2: NOT EXISTS (often faster)
SELECT a.*
FROM table_a a
WHERE NOT EXISTS (
    SELECT 1 FROM table_b b WHERE b.id = a.id
);

-- Method 3: NOT IN (be careful with NULLs)
SELECT a.*
FROM table_a a
WHERE a.id NOT IN (SELECT id FROM table_b WHERE id IS NOT NULL);
```

### Q4: What's the difference between WHERE and ON in joins?
**Answer:**
- **ON**: Specifies join condition (which rows to match)
- **WHERE**: Filters results after join is performed
- For INNER JOIN, they're often interchangeable
- For OUTER JOIN, they produce different results

```sql
-- Different results for LEFT JOIN:
-- ON filters during join (keeps non-matching rows from left)
SELECT * FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id AND o.total_amount > 100;

-- WHERE filters after join (removes non-matching rows)
SELECT * FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.total_amount > 100;  -- Converts to INNER JOIN behavior!
```

### Q5: How do you optimize slow joins?
**Answer:**
1. Create indexes on join columns
2. Use EXPLAIN/EXPLAIN ANALYZE to understand query plan
3. Filter data before joining (WHERE in subquery)
4. Select only required columns
5. Ensure statistics are up-to-date
6. Consider denormalization for frequently joined tables

---

## Practice Exercises

### Exercise 1: Basic Joins
```sql
-- Q1: List all customers with their total order amounts
SELECT
    c.customer_id,
    c.name,
    COUNT(o.order_id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name
ORDER BY total_spent DESC;

-- Q2: Find customers who have never placed an order
SELECT c.customer_id, c.name, c.city
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;

-- Q3: List products that have been ordered at least once
SELECT DISTINCT p.product_id, p.product_name, p.category
FROM products p
INNER JOIN order_details od ON p.product_id = od.product_id;
```

### Exercise 2: Self Join
```sql
-- Q1: Find all employees who earn more than their manager
SELECT
    e.name AS employee,
    e.salary AS emp_salary,
    m.name AS manager,
    m.salary AS mgr_salary
FROM employees e
INNER JOIN employees m ON e.manager_id = m.employee_id
WHERE e.salary > m.salary;

-- Q2: Show organizational hierarchy (up to 2 levels)
SELECT
    ceo.name AS ceo,
    mgr.name AS manager,
    emp.name AS employee
FROM employees ceo
LEFT JOIN employees mgr ON ceo.employee_id = mgr.manager_id
LEFT JOIN employees emp ON mgr.employee_id = emp.manager_id
WHERE ceo.manager_id IS NULL;
```

### Exercise 3: Multiple Joins
```sql
-- Q1: Customer order summary with product details
SELECT
    c.name AS customer_name,
    o.order_id,
    o.order_date,
    COUNT(od.order_detail_id) AS items_count,
    SUM(od.quantity * od.unit_price) AS order_total
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
INNER JOIN order_details od ON o.order_id = od.order_id
GROUP BY c.name, o.order_id, o.order_date
ORDER BY o.order_date DESC;

-- Q2: Find customers who bought specific product category
SELECT DISTINCT
    c.customer_id,
    c.name,
    c.city
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
INNER JOIN order_details od ON o.order_id = od.order_id
INNER JOIN products p ON od.product_id = p.product_id
WHERE p.category = 'Electronics';
```

### Exercise 4: Complex Scenarios
```sql
-- Q1: Find customers who placed orders but haven't received them yet
-- (assuming we have an order_status column)
SELECT
    c.name,
    o.order_id,
    o.order_date,
    o.status
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
WHERE o.status IN ('Pending', 'Processing');

-- Q2: Products ordered together (frequently bought together)
SELECT
    p1.product_name AS product1,
    p2.product_name AS product2,
    COUNT(*) AS times_ordered_together
FROM order_details od1
INNER JOIN order_details od2
    ON od1.order_id = od2.order_id
    AND od1.product_id < od2.product_id
INNER JOIN products p1 ON od1.product_id = p1.product_id
INNER JOIN products p2 ON od2.product_id = p2.product_id
GROUP BY p1.product_name, p2.product_name
ORDER BY times_ordered_together DESC;
```

---

## Quick Reference

### Join Types Summary
```sql
-- INNER JOIN: Only matching rows
SELECT * FROM A INNER JOIN B ON A.id = B.id;

-- LEFT JOIN: All from A + matching from B
SELECT * FROM A LEFT JOIN B ON A.id = B.id;

-- RIGHT JOIN: All from B + matching from A
SELECT * FROM A RIGHT JOIN B ON A.id = B.id;

-- FULL OUTER JOIN: All from both (MySQL workaround)
SELECT * FROM A LEFT JOIN B ON A.id = B.id
UNION
SELECT * FROM A RIGHT JOIN B ON A.id = B.id;

-- CROSS JOIN: Cartesian product
SELECT * FROM A CROSS JOIN B;

-- SELF JOIN: Table with itself
SELECT * FROM A a1 JOIN A a2 ON a1.id = a2.parent_id;
```

### Common Patterns
```sql
-- Find records in A not in B
SELECT a.* FROM A a LEFT JOIN B b ON a.id = b.id WHERE b.id IS NULL;

-- Find common records
SELECT a.* FROM A a INNER JOIN B b ON a.id = b.id;

-- Find all records from both tables
SELECT * FROM A a FULL OUTER JOIN B b ON a.id = b.id;
```

---

## Key Takeaways

1. **INNER JOIN** for matching data only
2. **LEFT JOIN** when you need all records from main table
3. **Index join columns** for better performance
4. **SELF JOIN** for hierarchical data
5. **Filter early** with WHERE or subqueries
6. **Be careful** with CROSS JOIN (Cartesian product)
7. **Use explicit JOIN syntax** (not implicit with comma)
8. **Understand NULL behavior** in outer joins
