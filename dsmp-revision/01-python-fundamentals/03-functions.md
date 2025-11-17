# Functions - Complete Guide

## Table of Contents
1. [Function Basics](#function-basics)
2. [Parameters and Arguments](#parameters-and-arguments)
3. [*args and **kwargs](#args-and-kwargs)
4. [Lambda Functions](#lambda-functions)
5. [Higher-Order Functions](#higher-order-functions)
6. [Scope and Closure](#scope-and-closure)
7. [Recursion](#recursion)
8. [Common Pitfalls](#common-pitfalls)
9. [Interview Questions](#interview-questions)

---

## Function Basics

Functions are reusable blocks of code that perform a specific task.

```
┌─────────────────────────────────────┐
│     Function Definition              │
│                                     │
│  def function_name(parameters):     │
│      """docstring"""                │
│      # function body                │
│      return value                   │
└─────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│     Function Call                    │
│                                     │
│  result = function_name(arguments)  │
└─────────────────────────────────────┘
```

### Defining and Calling Functions

```python
# Basic function
def greet():
    """Simple greeting function"""
    print("Hello, World!")

greet()  # Call the function

# Function with parameters
def greet_person(name):
    """Greet a person by name"""
    return f"Hello, {name}!"

message = greet_person("Alice")
print(message)  # Hello, Alice!

# Function with multiple parameters
def add(a, b):
    """Add two numbers"""
    return a + b

result = add(5, 3)
print(result)  # 8
```

### Return Statement

```python
# Single return value
def square(x):
    return x ** 2

# Multiple return values (returns tuple)
def divide_and_remainder(a, b):
    quotient = a // b
    remainder = a % b
    return quotient, remainder

q, r = divide_and_remainder(17, 5)
print(q, r)  # 3 2

# No return statement (returns None)
def print_message(msg):
    print(msg)

result = print_message("Hello")
print(result)  # None

# Early return
def is_even(n):
    if n % 2 == 0:
        return True
    return False
```

### Docstrings

```python
def calculate_area(length, width):
    """
    Calculate the area of a rectangle.

    Parameters:
    -----------
    length : float
        The length of the rectangle
    width : float
        The width of the rectangle

    Returns:
    --------
    float
        The area of the rectangle

    Example:
    --------
    >>> calculate_area(5, 3)
    15
    """
    return length * width

# Access docstring
print(calculate_area.__doc__)
help(calculate_area)
```

---

## Parameters and Arguments

### Types of Arguments

```python
# 1. Positional Arguments
def greet(first_name, last_name):
    return f"Hello, {first_name} {last_name}!"

print(greet("John", "Doe"))  # Order matters

# 2. Keyword Arguments
print(greet(last_name="Doe", first_name="John"))  # Order doesn't matter

# 3. Default Parameters
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Alice"))                  # Hello, Alice!
print(greet("Bob", "Hi"))              # Hi, Bob!
print(greet("Charlie", greeting="Hey")) # Hey, Charlie!

# 4. Mixed Arguments
def register_user(username, email, age=18, country="USA"):
    return {
        'username': username,
        'email': email,
        'age': age,
        'country': country
    }

# All valid calls
register_user("alice", "alice@example.com")
register_user("bob", "bob@example.com", 25)
register_user("charlie", "charlie@example.com", country="UK")
register_user("dave", "dave@example.com", 30, "Canada")
```

### Argument Order Rules

```python
# Correct order: positional → default → *args → keyword-only → **kwargs

def function(pos1, pos2, default1=None, *args, kwonly1, kwonly2=None, **kwargs):
    pass

# ❌ Wrong order
# def function(default1=None, pos1):  # SyntaxError!
#     pass
```

### Keyword-Only Arguments

```python
# Arguments after * are keyword-only
def create_user(name, *, age, email):
    return {'name': name, 'age': age, 'email': email}

# ✓ Valid
create_user("Alice", age=25, email="alice@example.com")

# ❌ Invalid
# create_user("Alice", 25, "alice@example.com")  # TypeError!
```

### Positional-Only Arguments (Python 3.8+)

```python
# Arguments before / are positional-only
def greet(name, /, greeting="Hello"):
    return f"{greeting}, {name}!"

# ✓ Valid
greet("Alice")
greet("Bob", "Hi")

# ❌ Invalid
# greet(name="Charlie")  # TypeError!
```

---

## *args and **kwargs

### *args (Variable Positional Arguments)

```python
# Collect extra positional arguments as tuple
def sum_all(*args):
    """Sum all arguments"""
    print(f"args type: {type(args)}")  # <class 'tuple'>
    return sum(args)

print(sum_all(1, 2, 3))           # 6
print(sum_all(1, 2, 3, 4, 5))     # 15
print(sum_all())                  # 0

# Unpacking with *
def add(a, b, c):
    return a + b + c

numbers = [1, 2, 3]
print(add(*numbers))  # Same as add(1, 2, 3)

# Real-world example: Logger
def log_message(level, *messages):
    """Log multiple messages with a level"""
    timestamp = "2024-01-01 12:00:00"
    formatted_msg = " ".join(str(msg) for msg in messages)
    print(f"[{timestamp}] [{level}] {formatted_msg}")

log_message("INFO", "User", "Alice", "logged in")
# [2024-01-01 12:00:00] [INFO] User Alice logged in
```

### **kwargs (Variable Keyword Arguments)

```python
# Collect extra keyword arguments as dictionary
def print_info(**kwargs):
    """Print all keyword arguments"""
    print(f"kwargs type: {type(kwargs)}")  # <class 'dict'>
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=25, city="New York")
# name: Alice
# age: 25
# city: New York

# Unpacking with **
def create_user(name, age, email):
    return {'name': name, 'age': age, 'email': email}

user_data = {'name': 'Bob', 'age': 30, 'email': 'bob@example.com'}
user = create_user(**user_data)  # Same as create_user(name='Bob', age=30, email='bob@example.com')

# Real-world example: Database Query Builder
def build_query(table, **conditions):
    """Build SQL WHERE clause from conditions"""
    where_clause = " AND ".join(f"{k} = '{v}'" for k, v in conditions.items())
    return f"SELECT * FROM {table} WHERE {where_clause}"

query = build_query("users", age=25, city="New York", status="active")
print(query)
# SELECT * FROM users WHERE age = '25' AND city = 'New York' AND status = 'active'
```

### Combining *args and **kwargs

```python
def flexible_function(*args, **kwargs):
    """Accept any combination of arguments"""
    print(f"Positional args: {args}")
    print(f"Keyword args: {kwargs}")

flexible_function(1, 2, 3, name="Alice", age=25)
# Positional args: (1, 2, 3)
# Keyword args: {'name': 'Alice', 'age': 25}

# Real-world example: API Wrapper
def api_request(endpoint, method="GET", *args, **kwargs):
    """Make API request with flexible parameters"""
    print(f"Endpoint: {endpoint}")
    print(f"Method: {method}")
    print(f"Args: {args}")
    print(f"Headers: {kwargs.get('headers', {})}")
    print(f"Params: {kwargs.get('params', {})}")

api_request(
    "/users",
    "POST",
    "extra_arg1",
    "extra_arg2",
    headers={"Authorization": "Bearer token"},
    params={"limit": 10}
)
```

### 🎯 Try This!

```python
def mystery_function(*args, **kwargs):
    print(args)
    print(kwargs)

mystery_function(1, 2, 3, a=4, b=5)
# What's the output?
```

<details>
<summary>Answer</summary>

```python
# Output:
(1, 2, 3)
{'a': 4, 'b': 5}
```
</details>

---

## Lambda Functions

Lambda functions are anonymous, single-expression functions.

```python
# Syntax: lambda arguments: expression

# Regular function
def square(x):
    return x ** 2

# Lambda equivalent
square = lambda x: x ** 2

print(square(5))  # 25

# Multiple arguments
add = lambda a, b: a + b
print(add(3, 5))  # 8

# No arguments
greet = lambda: "Hello, World!"
print(greet())  # Hello, World!

# With default arguments
multiply = lambda x, y=2: x * y
print(multiply(5))     # 10
print(multiply(5, 3))  # 15
```

### When to Use Lambda

```python
# 1. With sorted()
students = [
    {'name': 'Alice', 'grade': 85},
    {'name': 'Bob', 'grade': 92},
    {'name': 'Charlie', 'grade': 78}
]

# Sort by grade
sorted_students = sorted(students, key=lambda s: s['grade'])
print(sorted_students)
# [{'name': 'Charlie', 'grade': 78}, ...]

# Sort by name
sorted_by_name = sorted(students, key=lambda s: s['name'])

# 2. With map()
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x ** 2, numbers))
print(squared)  # [1, 4, 9, 16, 25]

# 3. With filter()
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)  # [2, 4]

# 4. With reduce()
from functools import reduce
product = reduce(lambda a, b: a * b, numbers)
print(product)  # 120 (1*2*3*4*5)

# 5. As callback functions
def apply_operation(x, y, operation):
    return operation(x, y)

result = apply_operation(5, 3, lambda a, b: a + b)
print(result)  # 8
```

### Lambda Limitations

```python
# ❌ Cannot use statements
# lambda x: if x > 0: return x  # SyntaxError

# ✓ Use ternary operator instead
abs_value = lambda x: x if x >= 0 else -x

# ❌ Cannot have multiple expressions
# lambda x: print(x); return x  # SyntaxError

# ✓ Use regular function for complex logic
def complex_operation(x):
    print(f"Processing {x}")
    result = x ** 2
    return result
```

---

## Higher-Order Functions

Functions that take other functions as arguments or return functions.

### 1. map()

```python
# Apply function to each element
numbers = [1, 2, 3, 4, 5]

# Using lambda
squared = list(map(lambda x: x ** 2, numbers))
print(squared)  # [1, 4, 9, 16, 25]

# Using named function
def cube(x):
    return x ** 3

cubed = list(map(cube, numbers))
print(cubed)  # [1, 8, 27, 64, 125]

# Multiple iterables
list1 = [1, 2, 3]
list2 = [4, 5, 6]
added = list(map(lambda x, y: x + y, list1, list2))
print(added)  # [5, 7, 9]

# Real-world example: Convert temperatures
celsius = [0, 10, 20, 30, 40]
fahrenheit = list(map(lambda c: (c * 9/5) + 32, celsius))
print(fahrenheit)  # [32.0, 50.0, 68.0, 86.0, 104.0]
```

### 2. filter()

```python
# Filter elements based on condition
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# Get even numbers
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)  # [2, 4, 6, 8, 10]

# Get numbers > 5
greater_than_5 = list(filter(lambda x: x > 5, numbers))
print(greater_than_5)  # [6, 7, 8, 9, 10]

# Real-world example: Filter valid emails
emails = [
    'alice@example.com',
    'invalid_email',
    'bob@test.com',
    'bad@',
    'charlie@domain.org'
]

valid_emails = list(filter(lambda e: '@' in e and '.' in e.split('@')[1], emails))
print(valid_emails)
# ['alice@example.com', 'bob@test.com', 'charlie@domain.org']
```

### 3. reduce()

```python
from functools import reduce

# Reduce list to single value
numbers = [1, 2, 3, 4, 5]

# Sum all numbers
total = reduce(lambda a, b: a + b, numbers)
print(total)  # 15

# Find maximum
maximum = reduce(lambda a, b: a if a > b else b, numbers)
print(maximum)  # 5

# With initial value
total_with_initial = reduce(lambda a, b: a + b, numbers, 10)
print(total_with_initial)  # 25 (10 + 1 + 2 + 3 + 4 + 5)

# Real-world example: Flatten nested lists
nested = [[1, 2], [3, 4], [5, 6]]
flattened = reduce(lambda a, b: a + b, nested)
print(flattened)  # [1, 2, 3, 4, 5, 6]
```

### 4. Custom Higher-Order Functions

```python
# Function that returns a function
def multiplier(n):
    """Create a function that multiplies by n"""
    def multiply(x):
        return x * n
    return multiply

double = multiplier(2)
triple = multiplier(3)

print(double(5))  # 10
print(triple(5))  # 15

# Function that takes function as argument
def apply_twice(func, arg):
    """Apply function twice to argument"""
    return func(func(arg))

def add_five(x):
    return x + 5

result = apply_twice(add_five, 10)
print(result)  # 20 (10 + 5 + 5)

# Real-world example: Retry decorator concept
def retry(max_attempts):
    """Create a retry wrapper"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    print(f"Attempt {attempt + 1} failed: {e}")
            return None
        return wrapper
    return decorator

@retry(3)
def unstable_function():
    import random
    if random.random() < 0.7:
        raise ValueError("Random error!")
    return "Success!"
```

### Visual: map, filter, reduce

```
map(): Transform each element
[1, 2, 3, 4, 5]
  ↓  ↓  ↓  ↓  ↓   (square each)
[1, 4, 9, 16, 25]

filter(): Keep elements that match condition
[1, 2, 3, 4, 5, 6]
  ↓     ↓     ↓     (keep even)
[2, 4, 6]

reduce(): Combine all elements to single value
[1, 2, 3, 4, 5]
  ↓ ↓ (sum)
  [3, 3, 4, 5]
    ↓ ↓ (sum)
    [6, 4, 5]
      ↓ ↓ (sum)
      [10, 5]
        ↓ ↓ (sum)
        [15]
```

---

## Scope and Closure

### LEGB Rule

Python looks up variables in this order: **L**ocal → **E**nclosing → **G**lobal → **B**uilt-in

```python
# Built-in scope
print(len([1, 2, 3]))  # len is built-in

# Global scope
x = "global"

def outer():
    # Enclosing scope
    x = "enclosing"

    def inner():
        # Local scope
        x = "local"
        print(x)  # local

    inner()
    print(x)  # enclosing

outer()
print(x)  # global
```

### global Keyword

```python
count = 0  # Global variable

def increment():
    global count  # Declare we're using global variable
    count += 1

increment()
increment()
print(count)  # 2

# Without global
def increment_wrong():
    count += 1  # UnboundLocalError!

# increment_wrong()  # Error!
```

### nonlocal Keyword

```python
def outer():
    count = 0  # Enclosing variable

    def inner():
        nonlocal count  # Declare we're using enclosing variable
        count += 1
        print(count)

    inner()  # 1
    inner()  # 2
    inner()  # 3

outer()
```

### Closures

```python
# Closure: Inner function remembers enclosing scope
def make_counter():
    count = 0

    def counter():
        nonlocal count
        count += 1
        return count

    return counter

# Each counter has its own count
counter1 = make_counter()
counter2 = make_counter()

print(counter1())  # 1
print(counter1())  # 2
print(counter2())  # 1
print(counter1())  # 3

# Real-world example: Create custom validators
def create_validator(min_value, max_value):
    """Create a validator function"""
    def validate(value):
        if not min_value <= value <= max_value:
            raise ValueError(f"Value must be between {min_value} and {max_value}")
        return True
    return validate

age_validator = create_validator(0, 120)
score_validator = create_validator(0, 100)

print(age_validator(25))   # True
print(score_validator(85))  # True
# age_validator(150)  # ValueError!
```

---

## Recursion

A function that calls itself.

```python
# Basic recursion
def countdown(n):
    """Print countdown from n to 1"""
    if n <= 0:  # Base case
        print("Blastoff!")
        return
    print(n)
    countdown(n - 1)  # Recursive call

countdown(5)
# 5
# 4
# 3
# 2
# 1
# Blastoff!

# Factorial
def factorial(n):
    """Calculate n!"""
    if n == 0 or n == 1:  # Base case
        return 1
    return n * factorial(n - 1)  # Recursive case

print(factorial(5))  # 120 (5*4*3*2*1)

# Fibonacci
def fibonacci(n):
    """Calculate nth Fibonacci number"""
    if n <= 1:  # Base cases
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(7))  # 13 (0,1,1,2,3,5,8,13)

# Sum of list
def sum_list(lst):
    """Sum all elements in list recursively"""
    if not lst:  # Base case: empty list
        return 0
    return lst[0] + sum_list(lst[1:])  # Recursive case

print(sum_list([1, 2, 3, 4, 5]))  # 15
```

### Recursion vs Iteration

```python
# Factorial: Recursive
def factorial_recursive(n):
    if n <= 1:
        return 1
    return n * factorial_recursive(n - 1)

# Factorial: Iterative
def factorial_iterative(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

# Both produce same result
print(factorial_recursive(5))  # 120
print(factorial_iterative(5))  # 120

# Recursion is elegant but can be slower and use more memory
```

### Recursion with Memoization

```python
# Inefficient: Recalculates same values
def fib_slow(n):
    if n <= 1:
        return n
    return fib_slow(n - 1) + fib_slow(n - 2)

# Efficient: Cache results
def fib_memo(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

# Using lru_cache decorator
from functools import lru_cache

@lru_cache(maxsize=None)
def fib_cached(n):
    if n <= 1:
        return n
    return fib_cached(n - 1) + fib_cached(n - 2)

# Test performance
import time

start = time.time()
fib_slow(30)
print(f"Slow: {time.time() - start:.4f}s")

start = time.time()
fib_cached(30)
print(f"Cached: {time.time() - start:.6f}s")
```

---

## Common Pitfalls

### 1. Mutable Default Arguments

```python
# ❌ Wrong
def append_to(element, lst=[]):
    lst.append(element)
    return lst

print(append_to(1))  # [1]
print(append_to(2))  # [1, 2] - Unexpected!

# ✓ Correct
def append_to(element, lst=None):
    if lst is None:
        lst = []
    lst.append(element)
    return lst
```

### 2. Late Binding Closures

```python
# ❌ Wrong
functions = []
for i in range(3):
    functions.append(lambda: i)

for f in functions:
    print(f())  # 2, 2, 2 - All reference same i!

# ✓ Correct: Use default argument
functions = []
for i in range(3):
    functions.append(lambda x=i: x)

for f in functions:
    print(f())  # 0, 1, 2
```

### 3. Modifying List While Iterating

```python
# ❌ Wrong
def remove_evens(numbers):
    for num in numbers:
        if num % 2 == 0:
            numbers.remove(num)  # Modifying while iterating!
    return numbers

# ✓ Correct: Create new list
def remove_evens(numbers):
    return [num for num in numbers if num % 2 != 0]
```

### 4. Forgetting Return Statement

```python
# ❌ Wrong
def add(a, b):
    a + b  # No return!

result = add(2, 3)
print(result)  # None

# ✓ Correct
def add(a, b):
    return a + b
```

---

## Interview Questions

### Q1: What's the difference between parameters and arguments?

**Answer:**
- **Parameters**: Variables in function definition
- **Arguments**: Actual values passed when calling function

```python
def greet(name):  # 'name' is parameter
    return f"Hello, {name}!"

greet("Alice")  # "Alice" is argument
```

### Q2: Explain the output

```python
def outer():
    x = 1
    def inner():
        x = 2
        print(f"inner: {x}")
    inner()
    print(f"outer: {x}")

outer()
```

**Answer:**
```
inner: 2
outer: 1
```
Inner function creates its own local `x`, doesn't modify outer's `x`.

### Q3: What does this function return?

```python
def mystery(*args):
    return sum(args) / len(args) if args else 0

print(mystery(1, 2, 3, 4, 5))
```

**Answer:** `3.0` - Calculates average of arguments.

### Q4: Implement a function that returns a function

```python
def power(exponent):
    """Return a function that raises number to exponent"""
    return lambda base: base ** exponent

square = power(2)
cube = power(3)
print(square(5))  # 25
print(cube(3))    # 27
```

### Q5: Find first n Fibonacci numbers

```python
def fibonacci_sequence(n):
    """Return first n Fibonacci numbers"""
    if n <= 0:
        return []
    if n == 1:
        return [0]

    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[-1] + fib[-2])
    return fib

print(fibonacci_sequence(10))
# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

---

## Practice Problems

1. **Calculator Function**: Create a function that takes two numbers and an operator (+, -, *, /) and returns the result.

2. **Prime Checker**: Write a function to check if a number is prime.

3. **List Flattener**: Flatten a nested list of arbitrary depth using recursion.

4. **Custom Map**: Implement your own version of the `map()` function.

5. **Memoized Factorial**: Implement factorial with memoization.

---

## Quick Reference

```python
# Function with all features
def full_function(
    pos_only, /,                    # Positional-only
    standard,                        # Standard
    default="value",                 # Default
    *args,                          # Variable positional
    kwonly,                         # Keyword-only
    kwonly_default="value",         # Keyword-only with default
    **kwargs                        # Variable keyword
):
    """Docstring here"""
    return "result"

# Lambda
lambda x, y: x + y

# Map, filter, reduce
list(map(func, iterable))
list(filter(func, iterable))
reduce(func, iterable, initial)

# Closure
def outer():
    x = 1
    def inner():
        return x
    return inner
```

---

**End of Functions - Happy Learning! 🐍**
