# SQL Revision Notes - Weeks 13-16

Comprehensive revision materials for SQL covering database fundamentals, queries, joins, aggregations, window functions, and advanced topics.

## 📚 Contents

### 1. [SQL Basics](sql-basics.md) - 20KB
**Database Fundamentals & Core Commands**

Topics covered:
- Database fundamentals (tables, keys, schema)
- DDL commands (CREATE, ALTER, DROP, TRUNCATE)
- DML commands (INSERT, SELECT, UPDATE, DELETE)
- Data types (numeric, string, date/time, boolean)
- Constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK, DEFAULT)
- Query optimization tips
- Practice exercises with solutions

**Key Skills:**
- Creating and modifying database structures
- Data manipulation operations
- Constraint management
- Basic query writing

---

### 2. [SQL Joins](sql-joins.md) - 35KB
**Combining Data from Multiple Tables**

Topics covered:
- INNER JOIN (matching rows only)
- LEFT JOIN (all from left + matching from right)
- RIGHT JOIN (all from right + matching from left)
- FULL OUTER JOIN (all rows from both tables)
- CROSS JOIN (Cartesian product)
- SELF JOIN (table joined with itself)
- Multiple joins
- Join performance optimization

**Key Features:**
- ASCII table diagrams showing join results
- Employee hierarchy examples
- E-commerce database scenarios
- Real-world business use cases
- Performance comparison of join types

---

### 3. [SQL Aggregations](sql-aggregations.md) - 41KB
**Grouping, Sorting, and Aggregate Functions**

Topics covered:
- Aggregate functions (COUNT, SUM, AVG, MIN, MAX)
- GROUP BY clause (single and multiple columns)
- HAVING clause (filtering grouped results)
- ORDER BY clause (sorting results)
- Combined examples with multiple functions
- Advanced aggregation techniques
- WHERE vs HAVING comparison

**Key Features:**
- Sales performance analysis examples
- Department statistics queries
- Monthly trend analysis
- Conditional aggregation
- Query execution order explanation

---

### 4. [SQL Window Functions](sql-window-functions.md) - 37KB
**Advanced Analytics**

Topics covered:
- Ranking functions (ROW_NUMBER, RANK, DENSE_RANK, NTILE)
- Analytic functions (LAG, LEAD, FIRST_VALUE, LAST_VALUE)
- Aggregate window functions (running totals, moving averages)
- PARTITION BY clause
- Frame specification (ROWS, RANGE)
- Real-world business scenarios

**Key Features:**
- Running totals and cumulative sums
- Period-over-period comparisons
- Top N per category queries
- Moving averages
- Percentile calculations
- Year-over-year growth analysis

---

### 5. [SQL Advanced](sql-advanced.md) - 33KB
**Views, Stored Procedures, Transactions**

Topics covered:
- Views (creating, modifying, updatable views)
- Stored procedures (parameters, control flow, error handling)
- Transactions (ACID properties, COMMIT, ROLLBACK, savepoints)
- Indexes (types, creation, optimization)
- Triggers (BEFORE/AFTER INSERT/UPDATE/DELETE)
- Common Table Expressions (CTEs, recursive CTEs)
- Advanced query techniques
- Query optimization strategies

**Key Features:**
- Materialized views
- Dynamic SQL
- Transaction isolation levels
- Recursive CTEs for hierarchical data
- EXPLAIN query analysis
- Performance tuning tips

---

## 🎯 Learning Path

### Beginner Level
1. Start with **SQL Basics** - Understand fundamental concepts
2. Practice DDL and DML commands
3. Master data types and constraints

### Intermediate Level
4. Move to **SQL Joins** - Learn to combine tables
5. Study **SQL Aggregations** - Group and summarize data
6. Practice complex SELECT queries

### Advanced Level
7. Explore **SQL Window Functions** - Advanced analytics
8. Master **SQL Advanced** - Stored procedures, transactions
9. Focus on query optimization

---

## 💡 Key Concepts Summary

### Essential SQL Commands
```sql
-- DDL (Data Definition Language)
CREATE, ALTER, DROP, TRUNCATE

-- DML (Data Manipulation Language)
INSERT, SELECT, UPDATE, DELETE

-- DCL (Data Control Language)
GRANT, REVOKE

-- TCL (Transaction Control Language)
COMMIT, ROLLBACK, SAVEPOINT
```

### Query Execution Order
```
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
```

### Join Types Visual Guide
```
INNER JOIN:     ╔═════╗        (Only matching rows)
                ║  ∩  ║
                ╚═════╝

LEFT JOIN:      ╔═════╗        (All from left + matching)
                ║█████║═══╗
                ╚═════╝   ║

RIGHT JOIN:     ╔═════╗        (All from right + matching)
           ╔════║█████║
           ║    ╚═════╝

FULL OUTER:     ╔═════╗        (All rows from both)
                ║█████║███║
                ║████████║
                ╚════════╝
```

---

## 📊 Database Scenarios Used

### E-Commerce System
- Customers, Orders, Products, Order_Details tables
- Sales analysis and reporting
- Inventory management queries
- Customer analytics

### Employee Management
- Employees, Departments, Salaries tables
- Organizational hierarchy (self-joins)
- Salary analysis and comparisons
- Performance metrics

### Sales Tracking
- Sales, Salespeople, Regions tables
- Performance dashboards
- Trend analysis
- Territory management

---

## 🔍 Interview Question Topics

Each file includes targeted interview questions covering:

**SQL Basics:**
- DELETE vs TRUNCATE
- CHAR vs VARCHAR
- Normalization
- PRIMARY KEY vs UNIQUE
- ACID properties

**SQL Joins:**
- INNER vs LEFT JOIN
- When to use SELF JOIN
- Finding records not in another table
- WHERE vs ON in joins
- Join optimization

**SQL Aggregations:**
- WHERE vs HAVING
- Aggregate functions in WHERE clause
- Query execution order
- Finding duplicates
- COUNT(*) vs COUNT(column)

**SQL Window Functions:**
- RANK vs DENSE_RANK
- Window functions vs GROUP BY
- Top N per group
- ROWS vs RANGE
- Running totals

**SQL Advanced:**
- Views vs tables
- COMMIT vs ROLLBACK
- When to use indexes
- Stored procedures vs functions
- Recursive CTEs

---

## 🛠️ Practice Exercises

Each file contains multiple practice exercises with:
- ✓ Sample data setup
- ✓ Progressive difficulty levels
- ✓ Complete solutions
- ✓ Explanation of concepts
- ✓ Real-world scenarios

**Exercise Categories:**
1. Basic operations (DDL, DML)
2. Join queries
3. Aggregation and grouping
4. Window function analytics
5. Transaction management
6. Stored procedures
7. Performance optimization

---

## 🚀 Quick Reference

### Most Used Functions
```sql
-- Aggregate Functions
COUNT(*), SUM(), AVG(), MIN(), MAX()

-- String Functions
CONCAT(), SUBSTRING(), UPPER(), LOWER(), TRIM()

-- Date Functions
CURDATE(), NOW(), DATE_FORMAT(), DATEDIFF(), DATE_ADD()

-- Window Functions
ROW_NUMBER(), RANK(), DENSE_RANK(), LAG(), LEAD()

-- Conditional
CASE WHEN ... THEN ... ELSE ... END
COALESCE(), NULLIF(), IF()
```

### Performance Tips
```sql
-- ✓ DO
- Use indexes on frequently queried columns
- Select only needed columns
- Filter with WHERE before GROUP BY
- Use EXISTS instead of IN for large sets
- Use LIMIT for large result sets

-- ✗ DON'T
- Use SELECT *
- Use functions on indexed columns in WHERE
- Use leading wildcards (LIKE '%text')
- Over-index (slows down writes)
- Forget to analyze queries with EXPLAIN
```

---

## 📖 How to Use These Notes

### For Quick Revision
1. Read the key takeaways section in each file
2. Review the quick reference tables
3. Practice interview questions

### For Deep Learning
1. Read through each topic sequentially
2. Type out and execute all examples
3. Solve all practice exercises
4. Create your own test scenarios

### For Interview Preparation
1. Focus on interview questions sections
2. Practice writing queries without looking at solutions
3. Understand the "why" behind each concept
4. Be able to explain trade-offs (e.g., RANK vs DENSE_RANK)

---

## 🎓 Additional Resources

### Sample Databases
All examples use consistent sample databases:
- **E-commerce**: Customers, Orders, Products, Order_Details
- **HR**: Employees, Departments, Salaries, Projects
- **Sales**: Sales, Salespeople, Regions, Targets

### Tools Mentioned
- MySQL Workbench
- PostgreSQL
- SQL Server Management Studio
- DBeaver
- DataGrip

---

## ✅ Study Checklist

### Week 13-14: Fundamentals
- [ ] Database concepts and terminology
- [ ] DDL commands (CREATE, ALTER, DROP)
- [ ] DML commands (INSERT, SELECT, UPDATE, DELETE)
- [ ] Data types and constraints
- [ ] Basic queries and filtering

### Week 15: Intermediate
- [ ] All join types (INNER, LEFT, RIGHT, FULL OUTER, SELF)
- [ ] Aggregate functions
- [ ] GROUP BY and HAVING
- [ ] ORDER BY and sorting
- [ ] Subqueries

### Week 16: Advanced
- [ ] Window functions (RANK, ROW_NUMBER, LAG, LEAD)
- [ ] Views and materialized views
- [ ] Stored procedures
- [ ] Transactions (COMMIT, ROLLBACK)
- [ ] Indexes and optimization

### Mastery Level
- [ ] Complex multi-table joins
- [ ] Recursive CTEs
- [ ] Query optimization with EXPLAIN
- [ ] Triggers and automation
- [ ] Advanced analytics with window functions

---

## 📝 Notes

- All SQL examples are tested and working
- Syntax is primarily MySQL with notes for PostgreSQL/SQL Server differences
- ASCII diagrams help visualize join results
- Each file is self-contained but builds on previous concepts
- Total content: ~166KB of comprehensive SQL coverage

---

## 🎯 Learning Outcomes

After completing these notes, you will be able to:

1. **Design** normalized database schemas
2. **Write** complex SQL queries with multiple joins
3. **Analyze** data using aggregation and window functions
4. **Optimize** queries for better performance
5. **Implement** stored procedures and transactions
6. **Understand** when to use views, indexes, and triggers
7. **Debug** and explain query execution plans
8. **Solve** real-world business problems with SQL

---

**Total Study Time Estimate:** 20-25 hours for comprehensive coverage

**Best for:** Data Science, Analytics, Backend Development, Database Administration

**Prerequisites:** Basic understanding of relational databases

**Difficulty Progression:** Beginner → Intermediate → Advanced

---

*Last Updated: November 2024*
*DSMP Weeks 13-16: SQL Module*
