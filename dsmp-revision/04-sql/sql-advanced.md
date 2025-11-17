# SQL Advanced Topics - Views, Stored Procedures, Transactions

## Table of Contents
1. [Views](#views)
2. [Stored Procedures](#stored-procedures)
3. [Transactions](#transactions)
4. [Indexes](#indexes)
5. [Triggers](#triggers)
6. [Common Table Expressions (CTEs)](#common-table-expressions-ctes)
7. [Advanced Query Techniques](#advanced-query-techniques)
8. [Query Optimization](#query-optimization)
9. [Practice Exercises](#practice-exercises)

---

## Views

**View**: Virtual table based on a SQL query result set

### Why Use Views?

```
┌────────────────────────┬──────────────────────────────────────┐
│ Benefit                │ Description                          │
├────────────────────────┼──────────────────────────────────────┤
│ Simplicity             │ Hide complex queries behind name     │
│ Security               │ Restrict access to specific columns  │
│ Reusability            │ Use same query in multiple places    │
│ Data abstraction       │ Logical view independent of tables   │
│ Backward compatibility │ Maintain old schema interface        │
└────────────────────────┴──────────────────────────────────────┘
```

### Sample Data Setup
```sql
-- Tables for examples
CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    name VARCHAR(50),
    department VARCHAR(50),
    salary DECIMAL(10, 2),
    hire_date DATE,
    manager_id INT
);

CREATE TABLE departments (
    department_id INT PRIMARY KEY,
    department_name VARCHAR(50),
    budget DECIMAL(12, 2),
    location VARCHAR(100)
);

CREATE TABLE projects (
    project_id INT PRIMARY KEY,
    project_name VARCHAR(100),
    employee_id INT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20)
);

INSERT INTO employees VALUES
(1, 'John Doe', 'IT', 75000, '2020-01-15', NULL),
(2, 'Jane Smith', 'IT', 82000, '2019-03-20', 1),
(3, 'Bob Johnson', 'Sales', 65000, '2021-06-10', NULL),
(4, 'Alice Brown', 'Sales', 70000, '2020-11-25', 3),
(5, 'Charlie Wilson', 'HR', 60000, '2022-02-14', NULL);

INSERT INTO departments VALUES
(1, 'IT', 500000, 'New York'),
(2, 'Sales', 300000, 'Chicago'),
(3, 'HR', 200000, 'Boston');

INSERT INTO projects VALUES
(1, 'Website Redesign', 2, '2024-01-01', '2024-06-30', 'In Progress'),
(2, 'CRM Implementation', 4, '2024-02-01', '2024-08-31', 'In Progress'),
(3, 'Data Migration', 1, '2023-10-01', '2024-03-31', 'Completed');
```

### Creating Views

#### Basic View
```sql
-- Create a simple view
CREATE VIEW employee_summary AS
SELECT
    employee_id,
    name,
    department,
    salary
FROM employees;

-- Use the view
SELECT * FROM employee_summary;
```

#### View with JOIN
```sql
-- Create view with multiple tables
CREATE VIEW employee_department_info AS
SELECT
    e.employee_id,
    e.name,
    e.department,
    e.salary,
    d.department_name,
    d.location,
    d.budget
FROM employees e
LEFT JOIN departments d ON e.department = d.department_name;

-- Query the view
SELECT * FROM employee_department_info
WHERE location = 'New York';
```

#### View with Aggregation
```sql
-- Department statistics view
CREATE VIEW department_stats AS
SELECT
    department,
    COUNT(*) AS employee_count,
    AVG(salary) AS avg_salary,
    MIN(salary) AS min_salary,
    MAX(salary) AS max_salary,
    SUM(salary) AS total_salary_cost
FROM employees
GROUP BY department;

-- Use it
SELECT * FROM department_stats
WHERE avg_salary > 65000;
```

#### View with Calculated Columns
```sql
-- Employee compensation view
CREATE VIEW employee_compensation AS
SELECT
    employee_id,
    name,
    department,
    salary,
    salary * 0.15 AS annual_bonus,
    salary * 1.15 AS total_compensation,
    CASE
        WHEN salary < 65000 THEN 'Junior'
        WHEN salary BETWEEN 65000 AND 80000 THEN 'Mid-Level'
        ELSE 'Senior'
    END AS salary_grade
FROM employees;

-- Query it
SELECT * FROM employee_compensation
WHERE salary_grade = 'Senior';
```

### Modifying Views

#### ALTER VIEW (if supported)
```sql
-- Modify existing view
CREATE OR REPLACE VIEW employee_summary AS
SELECT
    employee_id,
    name,
    department,
    salary,
    hire_date
FROM employees
WHERE salary > 60000;
```

#### DROP VIEW
```sql
-- Remove a view
DROP VIEW employee_summary;

-- Drop if exists (prevents error)
DROP VIEW IF EXISTS employee_summary;
```

### Updatable Views

Some views can be updated (INSERT, UPDATE, DELETE)

#### Requirements for Updatable Views
- Based on single table
- No DISTINCT, GROUP BY, HAVING, UNION
- No aggregate functions
- All NOT NULL columns included (for INSERT)

```sql
-- Create updatable view
CREATE VIEW it_employees AS
SELECT employee_id, name, salary
FROM employees
WHERE department = 'IT';

-- Update through view
UPDATE it_employees
SET salary = salary * 1.10
WHERE employee_id = 1;

-- Insert through view
INSERT INTO it_employees (employee_id, name, salary)
VALUES (6, 'New Employee', 70000);
```

### WITH CHECK OPTION
```sql
-- Prevent updates that violate view's WHERE clause
CREATE VIEW high_earners AS
SELECT employee_id, name, salary
FROM employees
WHERE salary > 70000
WITH CHECK OPTION;

-- This will fail (salary doesn't meet view condition)
UPDATE high_earners
SET salary = 65000
WHERE employee_id = 1;  -- ERROR!
```

### Materialized Views

**Materialized View**: Physical copy of query result (cached)

```sql
-- Create materialized view (PostgreSQL)
CREATE MATERIALIZED VIEW department_summary AS
SELECT
    department,
    COUNT(*) AS employee_count,
    AVG(salary) AS avg_salary
FROM employees
GROUP BY department;

-- Refresh materialized view
REFRESH MATERIALIZED VIEW department_summary;

-- MySQL alternative: Create table from query
CREATE TABLE department_summary_cached AS
SELECT
    department,
    COUNT(*) AS employee_count,
    AVG(salary) AS avg_salary
FROM employees
GROUP BY department;
```

---

## Stored Procedures

**Stored Procedure**: Saved SQL code that can be executed repeatedly

### Why Use Stored Procedures?

```
✓ Code reusability
✓ Reduce network traffic
✓ Centralize business logic
✓ Improve performance (compiled once)
✓ Enhanced security (grant execute permission)
✓ Transaction management
```

### Creating Stored Procedures

#### Basic Procedure (MySQL)
```sql
DELIMITER //

CREATE PROCEDURE GetAllEmployees()
BEGIN
    SELECT * FROM employees;
END //

DELIMITER ;

-- Call the procedure
CALL GetAllEmployees();
```

#### Procedure with Parameters
```sql
DELIMITER //

-- IN parameter
CREATE PROCEDURE GetEmployeesByDepartment(
    IN dept_name VARCHAR(50)
)
BEGIN
    SELECT employee_id, name, salary
    FROM employees
    WHERE department = dept_name
    ORDER BY salary DESC;
END //

DELIMITER ;

-- Call with parameter
CALL GetEmployeesByDepartment('IT');
```

#### Procedure with OUT Parameter
```sql
DELIMITER //

CREATE PROCEDURE GetDepartmentStats(
    IN dept_name VARCHAR(50),
    OUT emp_count INT,
    OUT avg_sal DECIMAL(10, 2)
)
BEGIN
    SELECT COUNT(*), AVG(salary)
    INTO emp_count, avg_sal
    FROM employees
    WHERE department = dept_name;
END //

DELIMITER ;

-- Call and get output
CALL GetDepartmentStats('IT', @count, @avg);
SELECT @count AS employee_count, @avg AS average_salary;
```

#### Procedure with INOUT Parameter
```sql
DELIMITER //

CREATE PROCEDURE AdjustSalary(
    INOUT salary DECIMAL(10, 2),
    IN increase_percent DECIMAL(5, 2)
)
BEGIN
    SET salary = salary * (1 + increase_percent / 100);
END //

DELIMITER ;

-- Use it
SET @current_salary = 50000;
CALL AdjustSalary(@current_salary, 10);
SELECT @current_salary;  -- Result: 55000
```

### Control Flow in Procedures

#### IF-THEN-ELSE
```sql
DELIMITER //

CREATE PROCEDURE GiveBonusBasedOnPerformance(
    IN emp_id INT,
    IN performance_rating INT
)
BEGIN
    DECLARE bonus_percent DECIMAL(5, 2);

    IF performance_rating >= 9 THEN
        SET bonus_percent = 20;
    ELSEIF performance_rating >= 7 THEN
        SET bonus_percent = 15;
    ELSEIF performance_rating >= 5 THEN
        SET bonus_percent = 10;
    ELSE
        SET bonus_percent = 5;
    END IF;

    UPDATE employees
    SET salary = salary * (1 + bonus_percent / 100)
    WHERE employee_id = emp_id;

    SELECT CONCAT('Bonus applied: ', bonus_percent, '%') AS message;
END //

DELIMITER ;
```

#### CASE Statement
```sql
DELIMITER //

CREATE PROCEDURE ClassifyEmployee(
    IN emp_id INT,
    OUT classification VARCHAR(20)
)
BEGIN
    DECLARE emp_salary DECIMAL(10, 2);

    SELECT salary INTO emp_salary
    FROM employees
    WHERE employee_id = emp_id;

    CASE
        WHEN emp_salary < 60000 THEN
            SET classification = 'Entry Level';
        WHEN emp_salary BETWEEN 60000 AND 80000 THEN
            SET classification = 'Mid Level';
        WHEN emp_salary > 80000 THEN
            SET classification = 'Senior Level';
        ELSE
            SET classification = 'Unknown';
    END CASE;
END //

DELIMITER ;
```

#### LOOP
```sql
DELIMITER //

CREATE PROCEDURE CalculateFactorial(
    IN n INT,
    OUT result BIGINT
)
BEGIN
    DECLARE counter INT DEFAULT 1;
    SET result = 1;

    WHILE counter <= n DO
        SET result = result * counter;
        SET counter = counter + 1;
    END WHILE;
END //

DELIMITER ;
```

### Error Handling
```sql
DELIMITER //

CREATE PROCEDURE SafeUpdateSalary(
    IN emp_id INT,
    IN new_salary DECIMAL(10, 2)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'Error occurred, transaction rolled back' AS message;
    END;

    START TRANSACTION;

    -- Validate salary
    IF new_salary < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Salary cannot be negative';
    END IF;

    UPDATE employees
    SET salary = new_salary
    WHERE employee_id = emp_id;

    COMMIT;
    SELECT 'Salary updated successfully' AS message;
END //

DELIMITER ;
```

### Managing Procedures
```sql
-- List all procedures
SHOW PROCEDURE STATUS WHERE Db = 'your_database';

-- Show procedure definition
SHOW CREATE PROCEDURE GetAllEmployees;

-- Drop procedure
DROP PROCEDURE IF EXISTS GetAllEmployees;
```

---

## Transactions

**Transaction**: Group of SQL statements executed as a single unit (all or nothing)

### ACID Properties

```
┌──────────────┬───────────────────────────────────────────────┐
│ Property     │ Description                                   │
├──────────────┼───────────────────────────────────────────────┤
│ Atomicity    │ All operations succeed or all fail            │
│ Consistency  │ Database remains in valid state               │
│ Isolation    │ Concurrent transactions don't interfere       │
│ Durability   │ Committed changes are permanent               │
└──────────────┴───────────────────────────────────────────────┘
```

### Basic Transaction Commands

```sql
START TRANSACTION;  -- Begin transaction (or BEGIN)
COMMIT;            -- Save changes
ROLLBACK;          -- Undo changes
SAVEPOINT name;    -- Create savepoint
ROLLBACK TO name;  -- Rollback to savepoint
```

### Example 1: Bank Transfer
```sql
-- Transfer money between accounts
START TRANSACTION;

-- Deduct from sender
UPDATE accounts
SET balance = balance - 1000
WHERE account_id = 101;

-- Add to receiver
UPDATE accounts
SET balance = balance + 1000
WHERE account_id = 102;

-- Check if both succeeded
IF @@ERROR = 0 THEN
    COMMIT;
    SELECT 'Transfer successful' AS message;
ELSE
    ROLLBACK;
    SELECT 'Transfer failed' AS message;
END IF;
```

### Example 2: Order Processing
```sql
START TRANSACTION;

-- Create order
INSERT INTO orders (customer_id, order_date, total_amount)
VALUES (1, CURDATE(), 1500.00);

SET @order_id = LAST_INSERT_ID();

-- Add order items
INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES
    (@order_id, 101, 2, 500.00),
    (@order_id, 102, 5, 100.00);

-- Update inventory
UPDATE products
SET stock_quantity = stock_quantity - 2
WHERE product_id = 101;

UPDATE products
SET stock_quantity = stock_quantity - 5
WHERE product_id = 102;

-- Check if any product is out of stock
IF (SELECT MIN(stock_quantity) FROM products WHERE product_id IN (101, 102)) < 0 THEN
    ROLLBACK;
    SELECT 'Insufficient stock, order cancelled' AS message;
ELSE
    COMMIT;
    SELECT 'Order placed successfully' AS message;
END IF;
```

### Savepoints
```sql
START TRANSACTION;

-- Operation 1
INSERT INTO employees (name, department, salary)
VALUES ('New Employee', 'IT', 70000);

SAVEPOINT after_insert;

-- Operation 2
UPDATE employees SET salary = salary * 1.10
WHERE department = 'IT';

SAVEPOINT after_update;

-- Operation 3
DELETE FROM employees WHERE salary < 50000;

-- Oops, rollback to after update
ROLLBACK TO after_update;

-- Commit the insert and update only
COMMIT;
```

### Transaction Isolation Levels

```sql
-- Set isolation level
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

#### Isolation Level Comparison
```
┌───────────────────┬─────────────┬──────────────┬──────────────────┐
│ Isolation Level   │ Dirty Read  │ Non-Repeat   │ Phantom Read     │
├───────────────────┼─────────────┼──────────────┼──────────────────┤
│ READ UNCOMMITTED  │ Possible    │ Possible     │ Possible         │
│ READ COMMITTED    │ Not Possible│ Possible     │ Possible         │
│ REPEATABLE READ   │ Not Possible│ Not Possible │ Possible         │
│ SERIALIZABLE      │ Not Possible│ Not Possible │ Not Possible     │
└───────────────────┴─────────────┴──────────────┴──────────────────┘
```

### Auto-commit Mode
```sql
-- Check auto-commit status
SELECT @@autocommit;

-- Disable auto-commit
SET autocommit = 0;

-- Enable auto-commit
SET autocommit = 1;
```

---

## Indexes

**Index**: Data structure that improves query performance

### Types of Indexes

```
┌──────────────────┬────────────────────────────────────────┐
│ Index Type       │ Description                            │
├──────────────────┼────────────────────────────────────────┤
│ Primary Key      │ Unique, non-null, one per table        │
│ Unique Index     │ No duplicate values allowed            │
│ Regular Index    │ Speeds up queries on column            │
│ Composite Index  │ Index on multiple columns              │
│ Fulltext Index   │ Text searching                         │
│ Spatial Index    │ Geographic data                        │
└──────────────────┴────────────────────────────────────────┘
```

### Creating Indexes

#### Single Column Index
```sql
-- Create index
CREATE INDEX idx_employee_name ON employees(name);

-- Create unique index
CREATE UNIQUE INDEX idx_employee_email ON employees(email);
```

#### Composite Index
```sql
-- Index on multiple columns
CREATE INDEX idx_dept_salary ON employees(department, salary);

-- Order matters!
-- Good for: WHERE department = 'IT' AND salary > 70000
-- Good for: WHERE department = 'IT'
-- NOT optimized for: WHERE salary > 70000 (only)
```

#### Fulltext Index
```sql
-- For text searching
CREATE FULLTEXT INDEX idx_product_description
ON products(product_name, description);

-- Use it
SELECT * FROM products
WHERE MATCH(product_name, description)
AGAINST ('laptop wireless');
```

### Dropping Indexes
```sql
-- Drop index
DROP INDEX idx_employee_name ON employees;

-- Or
ALTER TABLE employees DROP INDEX idx_employee_name;
```

### Viewing Indexes
```sql
-- Show indexes on table
SHOW INDEXES FROM employees;

-- Or
SHOW INDEX FROM employees;

-- Get index information
SELECT * FROM information_schema.statistics
WHERE table_schema = 'your_database'
  AND table_name = 'employees';
```

### When to Use Indexes

#### ✓ Use Indexes For:
```sql
-- Columns in WHERE clause
SELECT * FROM employees WHERE department = 'IT';

-- Columns in JOIN conditions
SELECT * FROM orders o
JOIN customers c ON o.customer_id = c.customer_id;

-- Columns in ORDER BY
SELECT * FROM employees ORDER BY hire_date;

-- Columns in GROUP BY
SELECT department, COUNT(*)
FROM employees
GROUP BY department;
```

#### ✗ Avoid Indexes On:
- Small tables (< 1000 rows)
- Columns with low cardinality (few unique values)
- Frequently updated columns
- Columns not used in queries

### Index Performance Tips
```sql
-- BAD: Function on indexed column (index not used)
SELECT * FROM employees
WHERE YEAR(hire_date) = 2020;

-- GOOD: Rewrite to use index
SELECT * FROM employees
WHERE hire_date >= '2020-01-01'
  AND hire_date < '2021-01-01';

-- BAD: Leading wildcard (index not used)
SELECT * FROM employees
WHERE name LIKE '%son';

-- GOOD: Prefix matching (uses index)
SELECT * FROM employees
WHERE name LIKE 'John%';
```

---

## Triggers

**Trigger**: Automatic action executed in response to specific events

### Trigger Events
- **BEFORE INSERT**: Before new row inserted
- **AFTER INSERT**: After new row inserted
- **BEFORE UPDATE**: Before row updated
- **AFTER UPDATE**: After row updated
- **BEFORE DELETE**: Before row deleted
- **AFTER DELETE**: After row deleted

### Creating Triggers

#### BEFORE INSERT Trigger
```sql
-- Validate data before insertion
DELIMITER //

CREATE TRIGGER validate_salary_before_insert
BEFORE INSERT ON employees
FOR EACH ROW
BEGIN
    -- Ensure salary is positive
    IF NEW.salary < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Salary cannot be negative';
    END IF;

    -- Set hire date to today if null
    IF NEW.hire_date IS NULL THEN
        SET NEW.hire_date = CURDATE();
    END IF;
END //

DELIMITER ;
```

#### AFTER INSERT Trigger
```sql
-- Log new employee
DELIMITER //

CREATE TRIGGER log_new_employee
AFTER INSERT ON employees
FOR EACH ROW
BEGIN
    INSERT INTO employee_audit_log (
        employee_id,
        action,
        action_date,
        details
    )
    VALUES (
        NEW.employee_id,
        'INSERT',
        NOW(),
        CONCAT('New employee: ', NEW.name, ' in ', NEW.department)
    );
END //

DELIMITER ;
```

#### BEFORE UPDATE Trigger
```sql
-- Track salary changes
DELIMITER //

CREATE TRIGGER track_salary_change
BEFORE UPDATE ON employees
FOR EACH ROW
BEGIN
    IF NEW.salary != OLD.salary THEN
        INSERT INTO salary_history (
            employee_id,
            old_salary,
            new_salary,
            change_date
        )
        VALUES (
            OLD.employee_id,
            OLD.salary,
            NEW.salary,
            NOW()
        );
    END IF;
END //

DELIMITER ;
```

#### BEFORE DELETE Trigger
```sql
-- Prevent deletion of managers
DELIMITER //

CREATE TRIGGER prevent_manager_deletion
BEFORE DELETE ON employees
FOR EACH ROW
BEGIN
    DECLARE subordinate_count INT;

    SELECT COUNT(*) INTO subordinate_count
    FROM employees
    WHERE manager_id = OLD.employee_id;

    IF subordinate_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot delete employee with subordinates';
    END IF;
END //

DELIMITER ;
```

### Managing Triggers
```sql
-- Show all triggers
SHOW TRIGGERS;

-- Show specific trigger
SHOW CREATE TRIGGER trigger_name;

-- Drop trigger
DROP TRIGGER IF EXISTS trigger_name;
```

---

## Common Table Expressions (CTEs)

**CTE**: Temporary named result set that exists within a query

### Basic CTE
```sql
-- Simple CTE
WITH high_earners AS (
    SELECT employee_id, name, salary
    FROM employees
    WHERE salary > 70000
)
SELECT * FROM high_earners
ORDER BY salary DESC;
```

### Multiple CTEs
```sql
-- Multiple CTEs in one query
WITH
dept_stats AS (
    SELECT
        department,
        AVG(salary) AS avg_salary,
        COUNT(*) AS emp_count
    FROM employees
    GROUP BY department
),
high_salary_depts AS (
    SELECT department
    FROM dept_stats
    WHERE avg_salary > 65000
)
SELECT e.*
FROM employees e
JOIN high_salary_depts hsd ON e.department = hsd.department
ORDER BY e.salary DESC;
```

### Recursive CTE

#### Employee Hierarchy
```sql
-- Show organizational chart
WITH RECURSIVE org_chart AS (
    -- Anchor: Top-level managers
    SELECT
        employee_id,
        name,
        manager_id,
        1 AS level,
        CAST(name AS CHAR(200)) AS hierarchy
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive: Add subordinates
    SELECT
        e.employee_id,
        e.name,
        e.manager_id,
        oc.level + 1,
        CONCAT(oc.hierarchy, ' > ', e.name)
    FROM employees e
    JOIN org_chart oc ON e.manager_id = oc.employee_id
)
SELECT
    level,
    employee_id,
    name,
    hierarchy
FROM org_chart
ORDER BY hierarchy;
```

**Result:**
```
┌───────┬─────────────┬──────────────┬──────────────────────────┐
│ level │ employee_id │ name         │ hierarchy                │
├───────┼─────────────┼──────────────┼──────────────────────────┤
│ 1     │ 1           │ John Doe     │ John Doe                 │
│ 2     │ 2           │ Jane Smith   │ John Doe > Jane Smith    │
│ 1     │ 3           │ Bob Johnson  │ Bob Johnson              │
│ 2     │ 4           │ Alice Brown  │ Bob Johnson > Alice Brown│
└───────┴─────────────┴──────────────┴──────────────────────────┘
```

#### Number Series
```sql
-- Generate numbers 1 to 10
WITH RECURSIVE numbers AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1
    FROM numbers
    WHERE n < 10
)
SELECT * FROM numbers;
```

---

## Advanced Query Techniques

### Pivot Table (MySQL)
```sql
-- Convert rows to columns
SELECT
    department,
    SUM(CASE WHEN YEAR(hire_date) = 2019 THEN 1 ELSE 0 END) AS hired_2019,
    SUM(CASE WHEN YEAR(hire_date) = 2020 THEN 1 ELSE 0 END) AS hired_2020,
    SUM(CASE WHEN YEAR(hire_date) = 2021 THEN 1 ELSE 0 END) AS hired_2021,
    SUM(CASE WHEN YEAR(hire_date) = 2022 THEN 1 ELSE 0 END) AS hired_2022
FROM employees
GROUP BY department;
```

### Unpivot (Convert columns to rows)
```sql
-- Using UNION
SELECT department, 2019 AS year, hired_2019 AS count
FROM department_stats
UNION ALL
SELECT department, 2020, hired_2020
FROM department_stats
UNION ALL
SELECT department, 2021, hired_2021
FROM department_stats;
```

### Dynamic SQL
```sql
DELIMITER //

CREATE PROCEDURE GetEmployeesByColumn(
    IN column_name VARCHAR(50),
    IN column_value VARCHAR(100)
)
BEGIN
    SET @sql = CONCAT('SELECT * FROM employees WHERE ', column_name, ' = ?');
    PREPARE stmt FROM @sql;
    SET @val = column_value;
    EXECUTE stmt USING @val;
    DEALLOCATE PREPARE stmt;
END //

DELIMITER ;

-- Call it
CALL GetEmployeesByColumn('department', 'IT');
```

### Conditional Aggregation
```sql
-- Count employees by multiple criteria
SELECT
    department,
    COUNT(*) AS total_employees,
    COUNT(CASE WHEN salary > 70000 THEN 1 END) AS high_earners,
    COUNT(CASE WHEN YEAR(hire_date) >= 2020 THEN 1 END) AS recent_hires,
    ROUND(AVG(CASE WHEN salary > 70000 THEN salary END), 2) AS avg_high_salary
FROM employees
GROUP BY department;
```

---

## Query Optimization

### 1. Use EXPLAIN
```sql
-- Analyze query execution plan
EXPLAIN SELECT * FROM employees WHERE department = 'IT';

-- More details
EXPLAIN EXTENDED SELECT * FROM employees WHERE department = 'IT';

-- Visual execution plan (MySQL Workbench)
EXPLAIN FORMAT=JSON SELECT ...;
```

### 2. Optimize JOINs
```sql
-- BAD: Cartesian product then filter
SELECT * FROM employees, departments
WHERE employees.department = departments.department_name;

-- GOOD: Explicit JOIN
SELECT * FROM employees e
INNER JOIN departments d ON e.department = d.department_name;

-- Index join columns
CREATE INDEX idx_dept ON employees(department);
```

### 3. Limit Result Sets
```sql
-- Use LIMIT
SELECT * FROM employees
ORDER BY salary DESC
LIMIT 10;

-- Pagination
SELECT * FROM employees
ORDER BY employee_id
LIMIT 20 OFFSET 40;  -- Page 3 (20 per page)
```

### 4. Avoid SELECT *
```sql
-- BAD: Retrieves all columns
SELECT * FROM employees;

-- GOOD: Select only needed columns
SELECT employee_id, name, salary FROM employees;
```

### 5. Use EXISTS Instead of IN for Large Sets
```sql
-- LESS EFFICIENT: IN with subquery
SELECT * FROM employees e
WHERE e.department IN (
    SELECT department_name
    FROM departments
    WHERE budget > 200000
);

-- MORE EFFICIENT: EXISTS
SELECT * FROM employees e
WHERE EXISTS (
    SELECT 1
    FROM departments d
    WHERE d.department_name = e.department
      AND d.budget > 200000
);
```

### 6. Avoid Functions on Indexed Columns
```sql
-- BAD: Index not used
SELECT * FROM employees
WHERE UPPER(name) = 'JOHN DOE';

-- GOOD: Store uppercase or use functional index
SELECT * FROM employees
WHERE name = 'John Doe';
```

### 7. Use UNION ALL Instead of UNION
```sql
-- SLOWER: UNION removes duplicates
SELECT name FROM employees
UNION
SELECT name FROM contractors;

-- FASTER: UNION ALL keeps duplicates
SELECT name FROM employees
UNION ALL
SELECT name FROM contractors;
```

---

## Interview Questions

### Q1: What's the difference between a view and a table?
**Answer:**
| Feature | Table | View |
|---------|-------|------|
| Storage | Physical data | Virtual (query result) |
| Space | Uses disk space | Minimal space |
| Performance | Faster for reads | Slower (executes query) |
| Updates | Always updatable | Limited updatability |

### Q2: What's the difference between COMMIT and ROLLBACK?
**Answer:**
- **COMMIT**: Permanently saves changes made in transaction
- **ROLLBACK**: Undoes all changes made since transaction began

### Q3: When should you use an index?
**Answer:**
Use indexes when:
- Column frequently used in WHERE, JOIN, ORDER BY, GROUP BY
- Table has many rows (> 1000)
- Column has high cardinality (many unique values)
- Table is read-heavy (more SELECTs than UPDATEs)

### Q4: What's the difference between stored procedures and functions?
**Answer:**
| Stored Procedure | Function |
|-----------------|----------|
| Can return 0 or more values | Must return exactly one value |
| Can use OUT parameters | Returns via RETURN statement |
| Can call functions | Cannot call procedures |
| Cannot use in SELECT | Can use in SELECT |

### Q5: What's a recursive CTE?
**Answer:**
CTE that references itself to process hierarchical/tree-structured data. Contains:
1. Anchor member (base case)
2. Recursive member (references CTE)
3. Termination condition

---

## Practice Exercises

### Exercise 1: Views
```sql
-- Q1: Create view for active projects
CREATE VIEW active_projects AS
SELECT
    p.project_name,
    e.name AS assigned_to,
    p.start_date,
    p.end_date,
    DATEDIFF(p.end_date, CURDATE()) AS days_remaining
FROM projects p
JOIN employees e ON p.employee_id = e.employee_id
WHERE p.status = 'In Progress';

-- Q2: Create view for department summary
CREATE VIEW department_overview AS
SELECT
    d.department_name,
    d.location,
    d.budget,
    COUNT(e.employee_id) AS employee_count,
    AVG(e.salary) AS avg_salary,
    d.budget / COUNT(e.employee_id) AS budget_per_employee
FROM departments d
LEFT JOIN employees e ON d.department_name = e.department
GROUP BY d.department_id, d.department_name, d.location, d.budget;
```

### Exercise 2: Stored Procedures
```sql
-- Q1: Procedure to give raise to department
DELIMITER //
CREATE PROCEDURE GiveDepartmentRaise(
    IN dept_name VARCHAR(50),
    IN raise_percent DECIMAL(5, 2),
    OUT affected_count INT
)
BEGIN
    UPDATE employees
    SET salary = salary * (1 + raise_percent / 100)
    WHERE department = dept_name;

    SET affected_count = ROW_COUNT();
END //
DELIMITER ;

-- Q2: Procedure to get employee report
DELIMITER //
CREATE PROCEDURE GetEmployeeReport(IN emp_id INT)
BEGIN
    SELECT
        e.name,
        e.department,
        e.salary,
        e.hire_date,
        DATEDIFF(CURDATE(), e.hire_date) / 365 AS years_employed,
        COUNT(p.project_id) AS project_count
    FROM employees e
    LEFT JOIN projects p ON e.employee_id = p.employee_id
    WHERE e.employee_id = emp_id
    GROUP BY e.employee_id;
END //
DELIMITER ;
```

### Exercise 3: Transactions
```sql
-- Q1: Safe employee transfer between departments
START TRANSACTION;

-- Remove from old department
UPDATE employees
SET department = 'IT'
WHERE employee_id = 3;

-- Log the transfer
INSERT INTO employee_transfers (employee_id, from_dept, to_dept, transfer_date)
VALUES (3, 'Sales', 'IT', CURDATE());

COMMIT;

-- Q2: Batch salary update with validation
START TRANSACTION;

SAVEPOINT before_update;

UPDATE employees
SET salary = salary * 1.10
WHERE department = 'IT';

-- Check if any salary exceeds budget
IF (SELECT SUM(salary) FROM employees WHERE department = 'IT') >
   (SELECT budget FROM departments WHERE department_name = 'IT') THEN
    ROLLBACK TO before_update;
    SELECT 'Update would exceed budget' AS message;
ELSE
    COMMIT;
    SELECT 'Salaries updated successfully' AS message;
END IF;
```

### Exercise 4: CTEs
```sql
-- Q1: Find employees earning above department average
WITH dept_averages AS (
    SELECT department, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department
)
SELECT
    e.name,
    e.department,
    e.salary,
    da.avg_salary,
    e.salary - da.avg_salary AS above_average
FROM employees e
JOIN dept_averages da ON e.department = da.department
WHERE e.salary > da.avg_salary;

-- Q2: Recursive CTE for date series
WITH RECURSIVE date_series AS (
    SELECT CURDATE() AS date
    UNION ALL
    SELECT DATE_ADD(date, INTERVAL 1 DAY)
    FROM date_series
    WHERE date < DATE_ADD(CURDATE(), INTERVAL 30 DAY)
)
SELECT * FROM date_series;
```

---

## Quick Reference

### Views
```sql
CREATE VIEW view_name AS SELECT ...;
CREATE OR REPLACE VIEW view_name AS SELECT ...;
DROP VIEW view_name;
```

### Stored Procedures
```sql
CREATE PROCEDURE proc_name(params) BEGIN ... END;
CALL proc_name(args);
DROP PROCEDURE proc_name;
```

### Transactions
```sql
START TRANSACTION;
COMMIT;
ROLLBACK;
SAVEPOINT name;
ROLLBACK TO name;
```

### Indexes
```sql
CREATE INDEX idx_name ON table(column);
CREATE UNIQUE INDEX idx_name ON table(column);
DROP INDEX idx_name ON table;
SHOW INDEXES FROM table;
```

### CTEs
```sql
WITH cte_name AS (SELECT ...)
SELECT * FROM cte_name;

WITH RECURSIVE cte AS (base UNION ALL recursive)
SELECT * FROM cte;
```

---

## Key Takeaways

1. **Views** simplify complex queries and enhance security
2. **Stored procedures** centralize business logic and improve performance
3. **Transactions** ensure ACID properties (Atomicity, Consistency, Isolation, Durability)
4. **Indexes** dramatically improve query performance but slow down writes
5. **Triggers** automate actions but can impact performance
6. **CTEs** improve query readability and enable recursive queries
7. **Always test** stored procedures and triggers thoroughly
8. **Use EXPLAIN** to analyze and optimize queries
9. **Transaction isolation levels** balance consistency vs performance
10. **Backup before** creating triggers or complex procedures
