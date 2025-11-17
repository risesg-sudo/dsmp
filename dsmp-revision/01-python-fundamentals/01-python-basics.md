# Python Basics - Revision Notes

## Table of Contents
1. [Introduction to Python](#introduction-to-python)
2. [Variables and Data Types](#variables-and-data-types)
3. [Operators](#operators)
4. [Control Flow (if-else)](#control-flow-if-else)
5. [Loops](#loops)
6. [Strings](#strings)
7. [Common Pitfalls](#common-pitfalls)
8. [Interview Questions](#interview-questions)

---

## Introduction to Python

**Python** is a high-level, interpreted, dynamically-typed programming language.

### Key Characteristics:
- **Interpreted**: Code executes line by line
- **Dynamically Typed**: No need to declare variable types
- **Object-Oriented**: Everything is an object
- **Easy to Learn**: Clean, readable syntax

```
┌─────────────────────────────────────┐
│     Python Code (.py file)          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Python Interpreter               │
│  (Compiles to Bytecode)             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Python Virtual Machine (PVM)        │
│     (Executes Bytecode)             │
└─────────────────────────────────────┘
```

---

## Variables and Data Types

### Variables

Variables are containers for storing data values.

```python
# Variable naming rules
age = 25              # ✓ Valid
user_name = "John"    # ✓ Valid (snake_case - Python convention)
_count = 10           # ✓ Valid
MAX_SIZE = 100        # ✓ Valid (constants in CAPS)

# Invalid names
2name = "Invalid"     # ✗ Cannot start with number
user-name = "John"    # ✗ Hyphens not allowed
class = "Test"        # ✗ Reserved keyword
```

### Basic Data Types

```python
# Numeric Types
integer_num = 42                    # int
float_num = 3.14                    # float
complex_num = 2 + 3j                # complex

# Boolean
is_active = True                    # bool
is_admin = False

# String
name = "Alice"                      # str
message = 'Hello World'

# NoneType
result = None                       # NoneType
```

### Type Checking and Conversion

```python
# Check type
x = 10
print(type(x))          # <class 'int'>

# Type conversion
num_str = "100"
num_int = int(num_str)              # "100" → 100
num_float = float(num_str)          # "100" → 100.0

# Be careful with conversions!
invalid = int("Hello")              # ValueError!
valid = int("3.14")                 # ValueError! (use float first)
correct = int(float("3.14"))        # ✓ Works: 3
```

### 🎯 Try This!

```python
# What will this print?
a = "5"
b = "10"
print(a + b)        # ?
print(int(a) + int(b))  # ?
```

<details>
<summary>Answer</summary>

```python
print(a + b)        # "510" (string concatenation)
print(int(a) + int(b))  # 15 (numeric addition)
```
</details>

---

## Operators

### 1. Arithmetic Operators

```python
a, b = 10, 3

print(a + b)    # 13  - Addition
print(a - b)    # 7   - Subtraction
print(a * b)    # 30  - Multiplication
print(a / b)    # 3.333... - Division (always returns float)
print(a // b)   # 3   - Floor Division (integer)
print(a % b)    # 1   - Modulus (remainder)
print(a ** b)   # 1000 - Exponentiation (10³)
```

**Real-World Example:**
```python
# Calculate bill splitting
total_bill = 1250
people = 4
per_person = total_bill // people     # 312 (floor division)
remainder = total_bill % people       # 2

print(f"Each person pays: ₹{per_person}")
print(f"Remaining amount: ₹{remainder}")
```

### 2. Comparison Operators

```python
x, y = 5, 10

print(x == y)   # False - Equal to
print(x != y)   # True  - Not equal to
print(x > y)    # False - Greater than
print(x < y)    # True  - Less than
print(x >= y)   # False - Greater than or equal to
print(x <= y)   # True  - Less than or equal to
```

### 3. Logical Operators

```python
# and, or, not
age = 25
has_license = True

can_drive = age >= 18 and has_license  # True
can_enter = age >= 21 or has_license   # True
is_minor = not (age >= 18)              # False
```

**Truth Table:**
```
┌───────┬───────┬─────────┬────────┐
│   A   │   B   │  A and B│ A or B │
├───────┼───────┼─────────┼────────┤
│ True  │ True  │  True   │  True  │
│ True  │ False │  False  │  True  │
│ False │ True  │  False  │  True  │
│ False │ False │  False  │  False │
└───────┴───────┴─────────┴────────┘
```

### 4. Assignment Operators

```python
x = 10
x += 5      # x = x + 5  → 15
x -= 3      # x = x - 3  → 12
x *= 2      # x = x * 2  → 24
x //= 4     # x = x // 4 → 6
x %= 4      # x = x % 4  → 2
x **= 3     # x = x ** 3 → 8
```

### 5. Identity Operators

```python
# is, is not (check if objects are the same in memory)
a = [1, 2, 3]
b = [1, 2, 3]
c = a

print(a == b)       # True (same values)
print(a is b)       # False (different objects in memory)
print(a is c)       # True (same object)
print(id(a), id(b), id(c))  # Different ids for a and b, same for a and c
```

### 6. Membership Operators

```python
# in, not in
fruits = ["apple", "banana", "cherry"]

print("apple" in fruits)        # True
print("mango" not in fruits)    # True

# Works with strings too
message = "Hello World"
print("World" in message)       # True
```

### 🎯 Try This!

```python
# What's the output?
x = 5
y = 5
print(x is y)       # ?
print(x == y)       # ?

a = [1, 2]
b = [1, 2]
print(a is b)       # ?
print(a == b)       # ?
```

<details>
<summary>Answer</summary>

```python
print(x is y)       # True (integers are cached for -5 to 256)
print(x == y)       # True

print(a is b)       # False (different list objects)
print(a == b)       # True (same values)
```
</details>

---

## Control Flow (if-else)

### Basic if-else Structure

```python
age = 18

if age >= 18:
    print("You can vote!")
else:
    print("You cannot vote yet.")
```

### if-elif-else Ladder

```python
score = 85

if score >= 90:
    grade = 'A'
elif score >= 80:
    grade = 'B'
elif score >= 70:
    grade = 'C'
elif score >= 60:
    grade = 'D'
else:
    grade = 'F'

print(f"Your grade is: {grade}")
```

### Nested if Statements

```python
username = "admin"
password = "secret123"

if username == "admin":
    if password == "secret123":
        print("Access granted!")
    else:
        print("Wrong password!")
else:
    print("User not found!")
```

### Ternary Operator (One-liner if-else)

```python
# Syntax: value_if_true if condition else value_if_false

age = 20
status = "Adult" if age >= 18 else "Minor"
print(status)  # Adult

# Nested ternary (use sparingly!)
score = 75
result = "Excellent" if score >= 90 else "Good" if score >= 70 else "Average"
print(result)  # Good
```

### Short-Circuit Evaluation

```python
# 'and' stops at first False
result = False and print("This won't execute")

# 'or' stops at first True
result = True or print("This won't execute")

# Practical use case
def divide(a, b):
    return b != 0 and a / b  # Returns False if b is 0, otherwise a/b

print(divide(10, 2))  # 5.0
print(divide(10, 0))  # False
```

### Real-World Example: User Authentication

```python
def authenticate_user(username, password, is_2fa_enabled=False, otp=None):
    """Authenticate user with optional 2FA"""

    if not username or not password:
        return "Username and password required!"

    if username != "admin" or password != "pass123":
        return "Invalid credentials!"

    if is_2fa_enabled:
        if otp is None:
            return "OTP required for 2FA!"
        if otp != "123456":
            return "Invalid OTP!"

    return "Login successful!"

# Test cases
print(authenticate_user("admin", "pass123"))              # Login successful!
print(authenticate_user("admin", "pass123", True, "123456"))  # Login successful!
print(authenticate_user("admin", "pass123", True))        # OTP required for 2FA!
```

---

## Loops

### 1. for Loop

```python
# Iterating over a sequence
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# Using range()
for i in range(5):          # 0, 1, 2, 3, 4
    print(i)

for i in range(2, 10, 2):   # start, stop, step
    print(i)                # 2, 4, 6, 8

# Iterating over strings
for char in "Python":
    print(char)
```

### 2. while Loop

```python
# Basic while loop
count = 0
while count < 5:
    print(count)
    count += 1

# User input validation
while True:
    user_input = input("Enter a number (or 'quit'): ")
    if user_input.lower() == 'quit':
        break
    try:
        num = int(user_input)
        print(f"You entered: {num}")
    except ValueError:
        print("Invalid input! Please enter a number.")
```

### 3. break Statement

```python
# Exit loop early
for i in range(10):
    if i == 5:
        break
    print(i)  # Prints 0, 1, 2, 3, 4

# Finding first occurrence
numbers = [1, 3, 5, 7, 8, 9, 11]
for num in numbers:
    if num % 2 == 0:
        print(f"First even number: {num}")
        break
```

### 4. continue Statement

```python
# Skip current iteration
for i in range(5):
    if i == 2:
        continue
    print(i)  # Prints 0, 1, 3, 4

# Print only odd numbers
for i in range(10):
    if i % 2 == 0:
        continue
    print(i)  # Prints 1, 3, 5, 7, 9
```

### 5. else Clause with Loops

```python
# else executes when loop completes normally (not broken)

# Example 1: Search with for-else
numbers = [1, 3, 5, 7, 9]
search = 6

for num in numbers:
    if num == search:
        print(f"Found {search}!")
        break
else:
    print(f"{search} not found in the list.")

# Example 2: Password attempts with while-else
attempts = 0
max_attempts = 3

while attempts < max_attempts:
    password = input("Enter password: ")
    if password == "secret":
        print("Access granted!")
        break
    attempts += 1
    print(f"Wrong password! {max_attempts - attempts} attempts left.")
else:
    print("Account locked! Too many failed attempts.")
```

### Nested Loops

```python
# Multiplication table
for i in range(1, 4):
    for j in range(1, 4):
        print(f"{i} × {j} = {i*j}")
    print()  # Blank line after each table

# Pattern printing
n = 5
for i in range(1, n+1):
    print('* ' * i)

# Output:
# *
# * *
# * * *
# * * * *
# * * * * *
```

### Loop Control Flow Diagram

```
┌──────────────────┐
│  Start Loop      │
└────────┬─────────┘
         │
         ▼
    ┌─────────────┐
    │ Condition?  │
    └──┬──────┬───┘
       │ No   │ Yes
       │      ▼
       │  ┌──────────────┐
       │  │ Execute Body │
       │  └──────┬───────┘
       │         │
       │         ▼
       │    ┌─────────┐
       │    │continue?│──Yes──┐
       │    └────┬────┘       │
       │         │No          │
       │         ▼            │
       │    ┌────────┐        │
       │    │ break? │──Yes───┼──┐
       │    └────┬───┘        │  │
       │         │No          │  │
       │         └────────────┘  │
       │         │               │
       │         └──Loop Back────┘
       │                         │
       ▼                         ▼
   ┌────────┐              ┌─────────┐
   │  else  │              │   End   │
   │ clause │              └─────────┘
   └───┬────┘
       │
       ▼
   ┌────────┐
   │  End   │
   └────────┘
```

### Real-World Example: Finding Prime Numbers

```python
def find_primes(n):
    """Find all prime numbers up to n"""
    primes = []

    for num in range(2, n + 1):
        # Check if num is prime
        for i in range(2, int(num ** 0.5) + 1):
            if num % i == 0:
                break  # Not prime
        else:
            # Loop completed without break (num is prime)
            primes.append(num)

    return primes

print(find_primes(20))  # [2, 3, 5, 7, 11, 13, 17, 19]
```

---

## Strings

Strings are sequences of characters, immutable in Python.

### String Creation

```python
# Different ways to create strings
str1 = 'Single quotes'
str2 = "Double quotes"
str3 = '''Triple quotes
for multiline
strings'''
str4 = """Also works
with double quotes"""

# Raw strings (ignore escape sequences)
path = r"C:\Users\name\Desktop"  # r prefix
print(path)  # C:\Users\name\Desktop
```

### String Indexing and Slicing

```python
text = "Python Programming"

# Indexing (0-based)
print(text[0])      # 'P'
print(text[-1])     # 'g' (last character)
print(text[-2])     # 'n' (second last)

# Slicing: string[start:stop:step]
print(text[0:6])    # 'Python'
print(text[:6])     # 'Python' (start defaults to 0)
print(text[7:])     # 'Programming' (stop defaults to end)
print(text[::2])    # 'Pto rgamn' (every 2nd character)
print(text[::-1])   # 'gnimmargorP nohtyP' (reverse)

# Visual representation
# Index:    0  1  2  3  4  5  6  7  8  9  ...
# String:   P  y  t  h  o  n     P  r  o  ...
# Negative: -18-17-16-15-14-13-12-11-10-9 ...
```

### String Methods

```python
text = "  Hello, World!  "

# Case conversion
print(text.upper())           # '  HELLO, WORLD!  '
print(text.lower())           # '  hello, world!  '
print(text.capitalize())      # '  hello, world!  '
print(text.title())           # '  Hello, World!  '
print(text.swapcase())        # '  hELLO, wORLD!  '

# Whitespace handling
print(text.strip())           # 'Hello, World!'
print(text.lstrip())          # 'Hello, World!  '
print(text.rstrip())          # '  Hello, World!'

# Searching
print(text.find('World'))     # 9 (index of first occurrence)
print(text.find('Python'))    # -1 (not found)
print(text.index('World'))    # 9 (similar to find)
# print(text.index('Python')) # ValueError!

print(text.count('l'))        # 3

# Checking
print(text.startswith('  H')) # True
print(text.endswith('!  '))   # True
print('123'.isdigit())        # True
print('abc'.isalpha())        # True
print('abc123'.isalnum())     # True
print('   '.isspace())        # True

# Splitting and joining
sentence = "Python is awesome"
words = sentence.split()      # ['Python', 'is', 'awesome']
print(' '.join(words))        # 'Python is awesome'
print('-'.join(words))        # 'Python-is-awesome'

csv_data = "John,25,Engineer"
data = csv_data.split(',')    # ['John', '25', 'Engineer']

# Replacing
print(text.replace('World', 'Python'))  # '  Hello, Python!  '
```

### String Formatting

```python
name = "Alice"
age = 30
salary = 75000.50

# 1. Old style (%)
print("Name: %s, Age: %d" % (name, age))

# 2. str.format()
print("Name: {}, Age: {}".format(name, age))
print("Name: {0}, Age: {1}".format(name, age))
print("Name: {n}, Age: {a}".format(n=name, a=age))

# 3. f-strings (Python 3.6+) - RECOMMENDED
print(f"Name: {name}, Age: {age}")
print(f"Salary: ₹{salary:,.2f}")  # ₹75,000.50
print(f"{name.upper()} is {age} years old")

# Advanced f-string formatting
print(f"{10:05d}")        # 00010 (zero-padding)
print(f"{3.14159:.2f}")   # 3.14 (2 decimal places)
print(f"{1234567:,}")     # 1,234,567 (thousands separator)
print(f"{'left':<10}|")   # 'left      |' (left-align)
print(f"{'right':>10}|")  # '     right|' (right-align)
print(f"{'center':^10}|") # '  center  |' (center-align)
```

### String Operations

```python
# Concatenation
first = "Hello"
last = "World"
full = first + " " + last      # "Hello World"

# Repetition
print("Ha" * 3)                # "HaHaHa"
print("-" * 20)                # --------------------

# Membership
print("Python" in "I love Python")  # True
print("Java" not in "I love Python")  # True

# Length
print(len("Python"))           # 6

# Comparison
print("apple" < "banana")      # True (lexicographic)
print("Apple" < "apple")       # True (uppercase comes first)
```

### Escape Sequences

```python
# Common escape sequences
print("Hello\nWorld")          # Newline
print("Hello\tWorld")          # Tab
print("He said, \"Hi!\"")      # Quotes
print("Path: C:\\Users\\name") # Backslash
print("Line 1\rLine 2")        # Carriage return

# Unicode characters
print("\u2764")                # ❤
print("\u03C0")                # π
```

### Real-World Example: Text Processing

```python
def clean_and_analyze_text(text):
    """Clean text and perform basic analysis"""

    # Clean the text
    cleaned = text.strip().lower()

    # Remove punctuation
    import string
    cleaned = cleaned.translate(str.maketrans('', '', string.punctuation))

    # Split into words
    words = cleaned.split()

    # Analysis
    word_count = len(words)
    unique_words = len(set(words))
    avg_word_length = sum(len(word) for word in words) / word_count if word_count > 0 else 0

    return {
        'original': text,
        'cleaned': cleaned,
        'word_count': word_count,
        'unique_words': unique_words,
        'avg_word_length': round(avg_word_length, 2)
    }

sample = "Hello, World! This is Python. Python is awesome!"
result = clean_and_analyze_text(sample)
print(result)
# {
#     'original': 'Hello, World! This is Python. Python is awesome!',
#     'cleaned': 'hello world this is python python is awesome',
#     'word_count': 8,
#     'unique_words': 6,
#     'avg_word_length': 5.5
# }
```

---

## Common Pitfalls

### 1. Mutable Default Arguments

```python
# ❌ Wrong
def add_item(item, items=[]):
    items.append(item)
    return items

print(add_item(1))  # [1]
print(add_item(2))  # [1, 2] - Unexpected!

# ✓ Correct
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

### 2. Integer Division

```python
# Python 2 vs Python 3
print(5 / 2)     # 2.5 (Python 3)
print(5 // 2)    # 2 (floor division)
```

### 3. Variable Scope in Loops

```python
# All i's refer to the same variable
for i in range(3):
    print(i)

print(i)  # 2 (i is still accessible!)
```

### 4. String Immutability

```python
# ❌ Wrong
text = "hello"
# text[0] = 'H'  # TypeError!

# ✓ Correct
text = 'H' + text[1:]  # "Hello"
```

---

## Interview Questions

### Q1: What is the difference between `==` and `is`?

**Answer:**
- `==` checks for **value equality**
- `is` checks for **identity** (same object in memory)

```python
a = [1, 2, 3]
b = [1, 2, 3]
c = a

print(a == b)  # True (same values)
print(a is b)  # False (different objects)
print(a is c)  # True (same object)
```

### Q2: Explain the output of this code

```python
x = [1, 2, 3]
y = x
y.append(4)
print(x)  # ?
```

**Answer:** `[1, 2, 3, 4]` - Both `x` and `y` reference the same list object.

### Q3: What is the output?

```python
for i in range(5):
    if i == 3:
        break
else:
    print("Loop completed")
```

**Answer:** Nothing is printed. The `else` clause only executes if the loop completes normally (no `break`).

### Q4: What is short-circuit evaluation?

**Answer:** Logical operators (`and`, `or`) stop evaluating as soon as the result is determined.

```python
def expensive_function():
    print("Called!")
    return True

result = False and expensive_function()  # expensive_function() is not called
```

### Q5: How to reverse a string?

```python
text = "Python"
reversed_text = text[::-1]  # "nohtyP"
```

---

## Quick Reference

### Common String Methods
```python
s = "hello world"
s.upper()          # HELLO WORLD
s.capitalize()     # Hello world
s.title()          # Hello World
s.strip()          # Remove whitespace
s.split()          # ['hello', 'world']
s.replace('o', 'x') # 'hellx wxrld'
s.find('world')    # 6
s.count('l')       # 3
```

### Loop Patterns
```python
# Iterate with index
for i, item in enumerate(['a', 'b', 'c']):
    print(i, item)

# Iterate over multiple lists
names = ['Alice', 'Bob']
ages = [25, 30]
for name, age in zip(names, ages):
    print(name, age)
```

---

## Practice Problems

1. **FizzBuzz**: Print numbers 1-100. For multiples of 3 print "Fizz", multiples of 5 print "Buzz", multiples of both print "FizzBuzz".

2. **Palindrome Checker**: Write a function to check if a string is a palindrome.

3. **Temperature Converter**: Create a program to convert Celsius to Fahrenheit and vice versa.

4. **Pattern Printing**: Print a right-angled triangle pattern using asterisks.

5. **String Reversal**: Reverse each word in a sentence while maintaining word order.

---

**End of Python Basics - Happy Learning! 🐍**
