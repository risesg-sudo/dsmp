# SQL Basics - Database Fundamentals & Core Commands

## Table of Contents
1. [Database Fundamentals](#database-fundamentals)
2. [DDL Commands](#ddl-commands)
3. [DML Commands](#dml-commands)
4. [Data Types](#data-types)
5. [Constraints](#constraints)
6. [Practice Exercises](#practice-exercises)

---

## Database Fundamentals

### What is a Database?
- **Database**: Organized collection of structured data stored electronically
- **DBMS (Database Management System)**: Software to manage databases (MySQL, PostgreSQL, Oracle, SQL Server)
- **RDBMS**: Relational Database Management System - organizes data in tables with relationships

### Key Database Concepts

#### Tables (Relations)
- Structured data storage with rows and columns
- **Row (Tuple/Record)**: Single entry in a table
- **Column (Attribute/Field)**: Property/characteristic of data

#### Primary Key
- Unique identifier for each record
- Cannot be NULL
- Each table should have one primary key

#### Foreign Key
- Column that references primary key of another table
- Establishes relationships between tables
- Maintains referential integrity

#### Schema
- Blueprint/structure of database
- Defines tables, columns, data types, relationships

---

## DDL Commands

**DDL (Data Definition Language)** - Commands to define database structure

### CREATE Command

#### Create Database
```sql
-- Create a new database
CREATE DATABASE ecommerce_db;

-- Use the database
USE ecommerce_db;
```

#### Create Table - E-Commerce Example
```sql
-- Customers table
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    registration_date DATE DEFAULT CURRENT_DATE,
    city VARCHAR(50),
    country VARCHAR(50)
);

-- Products table
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    supplier_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    order_date DATE NOT NULL,
    total_amount DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'Pending',
    shipping_address TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Order Details table (many-to-many relationship)
CREATE TABLE order_details (
    order_detail_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
```

#### Create Table - Employee Management Example
```sql
-- Departments table
CREATE TABLE departments (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    budget DECIMAL(12, 2)
);

-- Employees table
CREATE TABLE employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    hire_date DATE NOT NULL,
    job_title VARCHAR(50),
    salary DECIMAL(10, 2),
    department_id INT,
    manager_id INT,  -- Self-referencing for organizational hierarchy
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
);

-- Salaries history table
CREATE TABLE salary_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    old_salary DECIMAL(10, 2),
    new_salary DECIMAL(10, 2),
    change_date DATE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);
```

### ALTER Command

#### Add Column
```sql
-- Add new column to customers table
ALTER TABLE customers
ADD COLUMN loyalty_points INT DEFAULT 0;

-- Add multiple columns
ALTER TABLE products
ADD COLUMN brand VARCHAR(50),
ADD COLUMN warranty_months INT;
```

#### Modify Column
```sql
-- Change data type
ALTER TABLE products
MODIFY COLUMN product_name VARCHAR(200);

-- Change column with constraints
ALTER TABLE employees
MODIFY COLUMN salary DECIMAL(12, 2) NOT NULL;
```

#### Drop Column
```sql
-- Remove a column
ALTER TABLE customers
DROP COLUMN phone;
```

#### Rename Column
```sql
-- Rename column (MySQL)
ALTER TABLE products
CHANGE COLUMN category product_category VARCHAR(50);

-- Rename column (PostgreSQL, Oracle)
ALTER TABLE products
RENAME COLUMN category TO product_category;
```

#### Add Constraints
```sql
-- Add primary key
ALTER TABLE products
ADD PRIMARY KEY (product_id);

-- Add foreign key
ALTER TABLE orders
ADD CONSTRAINT fk_customer
FOREIGN KEY (customer_id) REFERENCES customers(customer_id);

-- Add unique constraint
ALTER TABLE employees
ADD CONSTRAINT unique_email UNIQUE (email);

-- Add check constraint
ALTER TABLE products
ADD CONSTRAINT chk_price CHECK (price >= 0);
```

### DROP Command

```sql
-- Drop table (permanently deletes table and data)
DROP TABLE order_details;

-- Drop table if exists (prevents error)
DROP TABLE IF EXISTS temp_table;

-- Drop database
DROP DATABASE test_db;
```

### TRUNCATE Command

```sql
-- Remove all records but keep table structure
TRUNCATE TABLE order_details;

-- Difference: DELETE vs TRUNCATE
-- DELETE: Removes rows one by one, can use WHERE, slower, can rollback
-- TRUNCATE: Removes all rows at once, faster, cannot rollback, resets auto-increment
```

---

## DML Commands

**DML (Data Manipulation Language)** - Commands to manipulate data

### INSERT Command

#### Insert Single Record
```sql
-- Insert into customers
INSERT INTO customers (first_name, last_name, email, city, country)
VALUES ('John', 'Doe', 'john.doe@email.com', 'New York', 'USA');

-- Insert with all columns (including auto-increment)
INSERT INTO customers
VALUES (NULL, 'Jane', 'Smith', 'jane@email.com', '123-456-7890',
        '2024-01-15', 'Los Angeles', 'USA', 0);
```

#### Insert Multiple Records
```sql
-- Bulk insert
INSERT INTO products (product_name, category, price, stock_quantity)
VALUES
    ('iPhone 15', 'Electronics', 999.99, 50),
    ('Samsung Galaxy S24', 'Electronics', 899.99, 45),
    ('MacBook Pro', 'Electronics', 2499.99, 20),
    ('AirPods Pro', 'Electronics', 249.99, 100),
    ('iPad Air', 'Electronics', 599.99, 30);
```

#### Insert from Another Table
```sql
-- Create backup table
CREATE TABLE customers_backup AS
SELECT * FROM customers WHERE 1=0;  -- Creates structure only

-- Insert data from another table
INSERT INTO customers_backup
SELECT * FROM customers
WHERE country = 'USA';
```

### SELECT Command

#### Basic SELECT
```sql
-- Select all columns
SELECT * FROM customers;

-- Select specific columns
SELECT first_name, last_name, email FROM customers;

-- Select with alias
SELECT
    first_name AS 'First Name',
    last_name AS 'Last Name',
    email AS 'Email Address'
FROM customers;
```

#### WHERE Clause - Filtering
```sql
-- Comparison operators: =, !=, <, >, <=, >=
SELECT * FROM products
WHERE price > 500;

-- Logical operators: AND, OR, NOT
SELECT * FROM products
WHERE category = 'Electronics' AND price < 1000;

SELECT * FROM customers
WHERE country = 'USA' OR country = 'Canada';

-- BETWEEN operator
SELECT * FROM products
WHERE price BETWEEN 100 AND 500;

-- IN operator
SELECT * FROM customers
WHERE country IN ('USA', 'UK', 'Canada');

-- LIKE operator (pattern matching)
-- % = zero or more characters
-- _ = exactly one character
SELECT * FROM customers
WHERE email LIKE '%@gmail.com';

SELECT * FROM products
WHERE product_name LIKE 'iPhone%';

-- IS NULL / IS NOT NULL
SELECT * FROM customers
WHERE phone IS NULL;
```

#### DISTINCT - Remove Duplicates
```sql
-- Get unique countries
SELECT DISTINCT country FROM customers;

-- Count unique countries
SELECT COUNT(DISTINCT country) AS unique_countries
FROM customers;
```

#### LIMIT - Restrict Results
```sql
-- Get top 5 most expensive products
SELECT * FROM products
ORDER BY price DESC
LIMIT 5;

-- Pagination: Get records 11-20
SELECT * FROM customers
LIMIT 10 OFFSET 10;  -- Skip first 10, get next 10
```

### UPDATE Command

```sql
-- Update single record
UPDATE customers
SET loyalty_points = 100
WHERE customer_id = 1;

-- Update multiple columns
UPDATE products
SET price = 899.99,
    stock_quantity = stock_quantity + 10
WHERE product_id = 2;

-- Update with condition
UPDATE employees
SET salary = salary * 1.10
WHERE department_id = 3 AND hire_date < '2020-01-01';

-- Update all records (BE CAREFUL!)
UPDATE products
SET category = 'General'
WHERE category IS NULL;
```

#### Common UPDATE Mistakes to Avoid
```sql
-- MISTAKE: Forgetting WHERE clause
-- This updates ALL records!
UPDATE employees SET salary = 50000;  -- DANGEROUS!

-- CORRECT: Always use WHERE
UPDATE employees SET salary = 50000 WHERE employee_id = 5;
```

### DELETE Command

```sql
-- Delete specific record
DELETE FROM customers
WHERE customer_id = 10;

-- Delete with condition
DELETE FROM orders
WHERE order_date < '2020-01-01';

-- Delete all records (use with caution!)
DELETE FROM temp_table;  -- Removes all rows

-- NEVER forget WHERE clause unless intentional!
```

---

## Data Types

### Numeric Types
```sql
-- Integer types
TINYINT     -- 1 byte: -128 to 127
SMALLINT    -- 2 bytes: -32,768 to 32,767
INT         -- 4 bytes: -2 billion to 2 billion
BIGINT      -- 8 bytes: very large numbers

-- Decimal types (exact)
DECIMAL(10, 2)  -- Total 10 digits, 2 after decimal (for money)
NUMERIC(8, 3)   -- Same as DECIMAL

-- Floating point (approximate)
FLOAT       -- 4 bytes, approximate
DOUBLE      -- 8 bytes, approximate
```

### String Types
```sql
CHAR(50)        -- Fixed length (pads with spaces)
VARCHAR(100)    -- Variable length (up to specified max)
TEXT            -- Large text (up to 65,535 characters)
MEDIUMTEXT      -- Up to 16 MB
LONGTEXT        -- Up to 4 GB
```

### Date and Time Types
```sql
DATE            -- 'YYYY-MM-DD'
TIME            -- 'HH:MM:SS'
DATETIME        -- 'YYYY-MM-DD HH:MM:SS'
TIMESTAMP       -- Auto-updates, timezone aware
YEAR            -- 'YYYY'
```

### Boolean
```sql
BOOLEAN         -- Stores TRUE/FALSE (0 or 1)
-- Example
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    is_active BOOLEAN DEFAULT TRUE
);
```

---

## Constraints

### PRIMARY KEY
```sql
-- Single column
CREATE TABLE students (
    student_id INT PRIMARY KEY,
    name VARCHAR(50)
);

-- Composite primary key (multiple columns)
CREATE TABLE enrollments (
    student_id INT,
    course_id INT,
    enrollment_date DATE,
    PRIMARY KEY (student_id, course_id)
);
```

### FOREIGN KEY
```sql
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
        ON DELETE CASCADE      -- Delete orders when customer is deleted
        ON UPDATE CASCADE      -- Update orders when customer_id changes
);

-- Other options:
-- ON DELETE SET NULL    -- Set foreign key to NULL
-- ON DELETE RESTRICT    -- Prevent deletion if referenced
-- ON DELETE NO ACTION   -- Same as RESTRICT
```

### UNIQUE
```sql
-- Ensures no duplicate values
CREATE TABLE users (
    user_id INT PRIMARY KEY,
    email VARCHAR(100) UNIQUE,
    username VARCHAR(50) UNIQUE
);
```

### NOT NULL
```sql
-- Column cannot contain NULL values
CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL
);
```

### CHECK
```sql
-- Validates data before insertion
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    price DECIMAL(10, 2) CHECK (price >= 0),
    stock_quantity INT CHECK (stock_quantity >= 0),
    rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5)
);
```

### DEFAULT
```sql
-- Sets default value if no value provided
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    order_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Pending',
    is_paid BOOLEAN DEFAULT FALSE
);
```

---

## Interview Questions

### Q1: What is the difference between DELETE and TRUNCATE?
**Answer:**
| Aspect | DELETE | TRUNCATE |
|--------|--------|----------|
| DML/DDL | DML | DDL |
| WHERE clause | Supported | Not supported |
| Speed | Slower (row by row) | Faster (all at once) |
| Rollback | Can rollback | Cannot rollback (DDL) |
| Triggers | Fires triggers | Does not fire triggers |
| Auto-increment | Doesn't reset | Resets to initial value |

### Q2: What is the difference between CHAR and VARCHAR?
**Answer:**
- **CHAR(n)**: Fixed length, pads with spaces, faster for fixed-size data
- **VARCHAR(n)**: Variable length, uses only space needed, better for variable data
- Example: CHAR(10) storing "Hello" uses 10 bytes; VARCHAR(10) uses 5 bytes

### Q3: What is normalization?
**Answer:**
Process of organizing data to reduce redundancy:
- **1NF**: Atomic values, no repeating groups
- **2NF**: 1NF + no partial dependencies
- **3NF**: 2NF + no transitive dependencies
- **BCNF**: 3NF + every determinant is a candidate key

### Q4: What is the difference between PRIMARY KEY and UNIQUE?
**Answer:**
| PRIMARY KEY | UNIQUE |
|-------------|--------|
| Only one per table | Multiple allowed |
| Cannot be NULL | Can have NULL (only one in most DBMS) |
| Creates clustered index | Creates non-clustered index |
| Identifies record uniquely | Ensures uniqueness |

### Q5: Explain ACID properties
**Answer:**
- **Atomicity**: Transaction is all-or-nothing
- **Consistency**: Data remains valid before/after transaction
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed changes are permanent

---

## Query Optimization Tips

### 1. Use Proper Indexing
```sql
-- Create index on frequently queried columns
CREATE INDEX idx_customer_email ON customers(email);
CREATE INDEX idx_product_category ON products(category);

-- Composite index for multiple columns
CREATE INDEX idx_order_customer_date ON orders(customer_id, order_date);
```

### 2. Select Only Required Columns
```sql
-- BAD: Retrieves unnecessary data
SELECT * FROM customers;

-- GOOD: Select only what you need
SELECT customer_id, first_name, email FROM customers;
```

### 3. Use WHERE Instead of HAVING When Possible
```sql
-- LESS EFFICIENT: Filters after grouping
SELECT category, COUNT(*)
FROM products
GROUP BY category
HAVING category = 'Electronics';

-- MORE EFFICIENT: Filters before grouping
SELECT category, COUNT(*)
FROM products
WHERE category = 'Electronics'
GROUP BY category;
```

### 4. Avoid Functions on Indexed Columns
```sql
-- BAD: Index not used
SELECT * FROM orders
WHERE YEAR(order_date) = 2024;

-- GOOD: Index used
SELECT * FROM orders
WHERE order_date >= '2024-01-01'
  AND order_date < '2025-01-01';
```

### 5. Use LIMIT for Large Datasets
```sql
-- Restrict results for better performance
SELECT * FROM customers
ORDER BY registration_date DESC
LIMIT 100;
```

---

## Practice Exercises

### Exercise 1: Create E-Commerce Database
```sql
-- Create the database and tables for an online bookstore
-- Tables needed: books, authors, customers, orders, order_items

-- Solution:
CREATE DATABASE bookstore_db;
USE bookstore_db;

CREATE TABLE authors (
    author_id INT PRIMARY KEY AUTO_INCREMENT,
    author_name VARCHAR(100) NOT NULL,
    country VARCHAR(50),
    birth_year INT
);

CREATE TABLE books (
    book_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    author_id INT,
    isbn VARCHAR(13) UNIQUE,
    price DECIMAL(8, 2) NOT NULL,
    publication_year INT,
    stock INT DEFAULT 0,
    FOREIGN KEY (author_id) REFERENCES authors(author_id)
);

CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    address TEXT
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    order_date DATE NOT NULL,
    total_amount DECIMAL(10, 2),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    book_id INT,
    quantity INT NOT NULL,
    price DECIMAL(8, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id)
);
```

### Exercise 2: Data Manipulation
```sql
-- Insert sample data into the bookstore database

-- Insert authors
INSERT INTO authors (author_name, country, birth_year) VALUES
('J.K. Rowling', 'UK', 1965),
('George Orwell', 'UK', 1903),
('Harper Lee', 'USA', 1926);

-- Insert books
INSERT INTO books (title, author_id, isbn, price, publication_year, stock) VALUES
('Harry Potter and the Philosopher''s Stone', 1, '9780747532699', 19.99, 1997, 50),
('1984', 2, '9780451524935', 14.99, 1949, 30),
('To Kill a Mockingbird', 3, '9780061120084', 12.99, 1960, 25);

-- Insert customers
INSERT INTO customers (name, email, phone, address) VALUES
('Alice Johnson', 'alice@email.com', '555-1001', '123 Main St, NYC'),
('Bob Smith', 'bob@email.com', '555-1002', '456 Oak Ave, LA');

-- Insert orders
INSERT INTO orders (customer_id, order_date, total_amount) VALUES
(1, '2024-01-15', 34.98),
(2, '2024-01-16', 14.99);

-- Insert order items
INSERT INTO order_items (order_id, book_id, quantity, price) VALUES
(1, 1, 1, 19.99),
(1, 3, 1, 14.99),
(2, 2, 1, 14.99);
```

### Exercise 3: Queries
```sql
-- Q1: Get all books with price greater than $15
SELECT * FROM books WHERE price > 15;

-- Q2: Find all UK authors
SELECT * FROM authors WHERE country = 'UK';

-- Q3: Update stock for a specific book
UPDATE books SET stock = stock + 20 WHERE book_id = 1;

-- Q4: Get customers who placed orders
SELECT DISTINCT c.name, c.email
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id;

-- Q5: Delete books with 0 stock
DELETE FROM books WHERE stock = 0;

-- Q6: Find books published after 1950
SELECT title, publication_year
FROM books
WHERE publication_year > 1950
ORDER BY publication_year;

-- Q7: Get all books by a specific author
SELECT b.title, b.price, a.author_name
FROM books b
JOIN authors a ON b.author_id = a.author_id
WHERE a.author_name = 'J.K. Rowling';
```

### Exercise 4: Constraints Practice
```sql
-- Add constraint to ensure price is positive
ALTER TABLE books
ADD CONSTRAINT chk_positive_price CHECK (price > 0);

-- Add constraint for stock quantity
ALTER TABLE books
ADD CONSTRAINT chk_stock CHECK (stock >= 0);

-- Add constraint for publication year
ALTER TABLE books
ADD CONSTRAINT chk_year CHECK (publication_year >= 1000 AND publication_year <= YEAR(CURDATE()));

-- Add unique constraint on ISBN
ALTER TABLE books
ADD CONSTRAINT unique_isbn UNIQUE (isbn);
```

---

## Key Takeaways

1. **DDL vs DML**: DDL defines structure (CREATE, ALTER, DROP), DML manipulates data (INSERT, SELECT, UPDATE, DELETE)

2. **Always use WHERE clause** with UPDATE and DELETE to avoid modifying all records

3. **Choose appropriate data types** to optimize storage and performance

4. **Use constraints** to maintain data integrity (PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK)

5. **Index wisely** on frequently queried columns, but avoid over-indexing

6. **Normalization** reduces redundancy but may require joins; denormalization improves read performance

7. **Test queries** on small datasets before running on production data

8. **Backup data** before running DELETE, UPDATE, or DROP commands

---

## Quick Reference

### Common SQL Commands
```sql
-- Database operations
CREATE DATABASE db_name;
DROP DATABASE db_name;
USE db_name;

-- Table operations
CREATE TABLE table_name (...);
ALTER TABLE table_name ADD COLUMN ...;
DROP TABLE table_name;
TRUNCATE TABLE table_name;

-- Data operations
INSERT INTO table_name VALUES (...);
SELECT * FROM table_name;
UPDATE table_name SET ... WHERE ...;
DELETE FROM table_name WHERE ...;

-- View structure
DESCRIBE table_name;  -- MySQL
\d table_name;        -- PostgreSQL
```

### Data Type Cheat Sheet
- **Numbers**: INT, BIGINT, DECIMAL(10,2), FLOAT
- **Strings**: VARCHAR(n), TEXT, CHAR(n)
- **Dates**: DATE, DATETIME, TIMESTAMP
- **Boolean**: BOOLEAN (TRUE/FALSE)
