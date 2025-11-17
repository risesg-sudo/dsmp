# Iterators and Generators

## Table of Contents
1. [Iteration Basics](#iteration-basics)
2. [Iterators](#iterators)
3. [Custom Iterators](#custom-iterators)
4. [Generators](#generators)
5. [Generator Expressions](#generator-expressions)
6. [Advanced Generator Patterns](#advanced-generator-patterns)
7. [itertools Module](#itertools-module)
8. [Common Pitfalls](#common-pitfalls)
9. [Interview Questions](#interview-questions)

---

## Iteration Basics

Iteration is the process of accessing elements in a sequence one by one.

```
┌─────────────────────────────────────┐
│     Iteration Concepts              │
├─────────────────────────────────────┤
│  Iterable                           │
│  - Object that can be iterated      │
│  - Has __iter__() method            │
│  - Examples: list, tuple, string    │
│                                     │
│  Iterator                           │
│  - Object that produces values      │
│  - Has __iter__() and __next__()    │
│  - Remembers position               │
│                                     │
│  Generator                          │
│  - Special iterator created with    │
│    yield statement                  │
│  - Lazy evaluation                  │
└─────────────────────────────────────┘
```

### Iterable vs Iterator

```python
# List is an iterable
numbers = [1, 2, 3, 4, 5]

# Get iterator from iterable
iterator = iter(numbers)

# Manually iterate
print(next(iterator))  # 1
print(next(iterator))  # 2
print(next(iterator))  # 3

# for loop does this automatically
for num in numbers:
    print(num)

# When exhausted
try:
    print(next(iterator))  # After all elements consumed
except StopIteration:
    print("No more elements!")
```

### How for Loop Works

```python
# What for loop does internally:
numbers = [1, 2, 3]

# This for loop:
for num in numbers:
    print(num)

# Is equivalent to:
iterator = iter(numbers)
while True:
    try:
        num = next(iterator)
        print(num)
    except StopIteration:
        break
```

---

## Iterators

### Iterator Protocol

An iterator must implement:
1. `__iter__()`: Return the iterator object itself
2. `__next__()`: Return the next value

```python
# Using built-in iterator
numbers = [1, 2, 3]
iterator = iter(numbers)

print(iterator.__next__())  # 1
print(next(iterator))       # 2 (same as above)
print(next(iterator))       # 3

# StopIteration when exhausted
try:
    next(iterator)
except StopIteration:
    print("Iterator exhausted!")
```

### Multiple Iterators

```python
# Each iterator maintains its own state
numbers = [1, 2, 3, 4, 5]

iter1 = iter(numbers)
iter2 = iter(numbers)

print(next(iter1))  # 1
print(next(iter1))  # 2
print(next(iter2))  # 1 (independent state)
print(next(iter1))  # 3
```

---

## Custom Iterators

### Creating Custom Iterator Class

```python
class Counter:
    """Iterator that counts from start to end"""

    def __init__(self, start, end):
        self.current = start
        self.end = end

    def __iter__(self):
        """Return iterator object (self)"""
        return self

    def __next__(self):
        """Return next value"""
        if self.current > self.end:
            raise StopIteration

        value = self.current
        self.current += 1
        return value

# Usage
counter = Counter(1, 5)
for num in counter:
    print(num)  # 1, 2, 3, 4, 5

# Manual iteration
counter = Counter(1, 3)
print(next(counter))  # 1
print(next(counter))  # 2
print(next(counter))  # 3
# print(next(counter))  # StopIteration!
```

### Real-World Example: File Reader

```python
class FileReader:
    """Iterator to read file line by line"""

    def __init__(self, filename):
        self.filename = filename
        self.file = None

    def __iter__(self):
        """Open file and return iterator"""
        self.file = open(self.filename, 'r')
        return self

    def __next__(self):
        """Return next line"""
        line = self.file.readline()
        if not line:
            self.file.close()
            raise StopIteration
        return line.strip()

# Usage (with a file)
# reader = FileReader('data.txt')
# for line in reader:
#     print(line)
```

### Infinite Iterator

```python
class InfiniteCounter:
    """Iterator that counts infinitely"""

    def __init__(self, start=0):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        value = self.current
        self.current += 1
        return value

# Usage - must break manually
counter = InfiniteCounter(1)
for num in counter:
    if num > 5:
        break
    print(num)  # 1, 2, 3, 4, 5
```

### Fibonacci Iterator

```python
class Fibonacci:
    """Iterator for Fibonacci sequence"""

    def __init__(self, max_count=None):
        self.max_count = max_count
        self.count = 0
        self.a, self.b = 0, 1

    def __iter__(self):
        return self

    def __next__(self):
        if self.max_count is not None and self.count >= self.max_count:
            raise StopIteration

        value = self.a
        self.a, self.b = self.b, self.a + self.b
        self.count += 1
        return value

# First 10 Fibonacci numbers
fib = Fibonacci(10)
for num in fib:
    print(num, end=' ')
# 0 1 1 2 3 5 8 13 21 34

# Convert to list
fib = Fibonacci(8)
print(list(fib))  # [0, 1, 1, 2, 3, 5, 8, 13]
```

---

## Generators

Generators are functions that use `yield` to produce values lazily.

### Basic Generator Function

```python
def simple_generator():
    """Generator that yields three values"""
    print("First yield")
    yield 1
    print("Second yield")
    yield 2
    print("Third yield")
    yield 3
    print("Generator exhausted")

# Create generator object
gen = simple_generator()
print(type(gen))  # <class 'generator'>

# Get values one by one
print(next(gen))  # First yield, then 1
print(next(gen))  # Second yield, then 2
print(next(gen))  # Third yield, then 3
# print(next(gen))  # Generator exhausted, then StopIteration

# Using in for loop
gen = simple_generator()
for value in gen:
    print(value)
```

### Generator vs Regular Function

```python
# Regular function - returns all at once
def get_numbers():
    """Return list of numbers"""
    result = []
    for i in range(1, 6):
        result.append(i)
    return result

numbers = get_numbers()
print(numbers)  # [1, 2, 3, 4, 5]

# Generator - yields one at a time
def generate_numbers():
    """Generate numbers one by one"""
    for i in range(1, 6):
        yield i

numbers = generate_numbers()
for num in numbers:
    print(num)  # 1, 2, 3, 4, 5
```

### Why Use Generators?

```python
"""
Advantages:
1. Memory Efficient - values generated on-demand
2. Lazy Evaluation - compute only when needed
3. Infinite Sequences - can represent infinite data
4. Pipeline Processing - chain generators
"""

# Example: Memory Efficiency

# Bad - loads entire list in memory
def get_large_list(n):
    return [i**2 for i in range(n)]

# large_list = get_large_list(10_000_000)  # Uses lots of memory!

# Good - generates values on-demand
def generate_squares(n):
    for i in range(n):
        yield i**2

squares = generate_squares(10_000_000)  # Uses minimal memory!
for square in squares:
    if square > 100:
        break
    print(square)
```

### Real-World Example: Reading Large Files

```python
def read_large_file(filename):
    """Generator to read large file line by line"""
    with open(filename, 'r') as file:
        for line in file:
            yield line.strip()

# Memory efficient - doesn't load entire file
# for line in read_large_file('huge_file.txt'):
#     process(line)

def read_file_in_chunks(filename, chunk_size=1024):
    """Read file in chunks"""
    with open(filename, 'r') as file:
        while True:
            chunk = file.read(chunk_size)
            if not chunk:
                break
            yield chunk

# Usage
# for chunk in read_file_in_chunks('large_file.txt'):
#     process(chunk)
```

### Generator with Parameters

```python
def countdown(start):
    """Countdown from start to 0"""
    while start >= 0:
        yield start
        start -= 1

# Usage
for num in countdown(5):
    print(num)  # 5, 4, 3, 2, 1, 0

def range_with_step(start, end, step=1):
    """Custom range generator"""
    current = start
    while current < end:
        yield current
        current += step

# Usage
for num in range_with_step(0, 10, 2):
    print(num)  # 0, 2, 4, 6, 8
```

---

## Generator Expressions

Generator expressions are like list comprehensions but with parentheses.

```python
# List comprehension - creates entire list
squares_list = [x**2 for x in range(10)]
print(type(squares_list))  # <class 'list'>

# Generator expression - creates generator
squares_gen = (x**2 for x in range(10))
print(type(squares_gen))   # <class 'generator'>

# Use generator
for square in squares_gen:
    print(square)

# Convert to list if needed
squares = list((x**2 for x in range(10)))
```

### Memory Comparison

```python
import sys

# List comprehension
list_comp = [x for x in range(10000)]
print(f"List size: {sys.getsizeof(list_comp)} bytes")
# List size: 87624 bytes

# Generator expression
gen_exp = (x for x in range(10000))
print(f"Generator size: {sys.getsizeof(gen_exp)} bytes")
# Generator size: 128 bytes

# Generator is much smaller!
```

### Chaining Generators

```python
# Filter and transform data
numbers = range(1, 11)

# Chain generator expressions
evens = (x for x in numbers if x % 2 == 0)
squares = (x**2 for x in evens)
result = (x + 1 for x in squares)

print(list(result))  # [5, 17, 37, 65, 101]

# Equivalent to:
# [x**2 + 1 for x in range(1, 11) if x % 2 == 0]
```

### Real-World Example: Data Pipeline

```python
def read_logs(filename):
    """Read log file"""
    with open(filename, 'r') as file:
        for line in file:
            yield line.strip()

def filter_errors(lines):
    """Filter lines containing ERROR"""
    for line in lines:
        if 'ERROR' in line:
            yield line

def extract_message(lines):
    """Extract error message"""
    for line in lines:
        # Assuming format: [timestamp] ERROR: message
        parts = line.split('ERROR:')
        if len(parts) > 1:
            yield parts[1].strip()

# Create pipeline
# logs = read_logs('server.log')
# errors = filter_errors(logs)
# messages = extract_message(errors)
#
# for message in messages:
#     print(message)

# Memory efficient - processes one line at a time!
```

---

## Advanced Generator Patterns

### Generator send() Method

```python
def echo_generator():
    """Generator that can receive values"""
    while True:
        value = yield
        print(f"Received: {value}")

gen = echo_generator()
next(gen)  # Prime the generator
gen.send("Hello")   # Received: Hello
gen.send("World")   # Received: World
```

### Coroutines (Two-way Communication)

```python
def averager():
    """Calculate running average"""
    total = 0
    count = 0
    average = None

    while True:
        value = yield average
        total += value
        count += 1
        average = total / count

# Usage
avg = averager()
next(avg)  # Prime the generator

print(avg.send(10))   # 10.0
print(avg.send(20))   # 15.0
print(avg.send(30))   # 20.0
print(avg.send(40))   # 25.0
```

### Generator throw() Method

```python
def resilient_generator():
    """Generator that handles exceptions"""
    while True:
        try:
            value = yield
            print(f"Processing: {value}")
        except ValueError as e:
            print(f"Caught ValueError: {e}")
        except Exception as e:
            print(f"Caught Exception: {e}")
            break

gen = resilient_generator()
next(gen)  # Prime

gen.send(10)                      # Processing: 10
gen.throw(ValueError, "Invalid")   # Caught ValueError: Invalid
gen.send(20)                      # Processing: 20
gen.throw(RuntimeError, "Error")  # Caught Exception: Error
```

### yield from (Delegating Generator)

```python
def sub_generator():
    """Sub-generator"""
    yield 1
    yield 2
    yield 3

def main_generator():
    """Main generator delegates to sub-generator"""
    yield 0
    yield from sub_generator()  # Delegate
    yield 4

# Usage
for value in main_generator():
    print(value)  # 0, 1, 2, 3, 4

# Flattening nested lists
def flatten(nested_list):
    """Flatten nested list using yield from"""
    for item in nested_list:
        if isinstance(item, list):
            yield from flatten(item)  # Recursive
        else:
            yield item

nested = [1, [2, 3, [4, 5]], 6, [7, [8, 9]]]
print(list(flatten(nested)))  # [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

---

## itertools Module

Efficient iterators for various tasks.

### Infinite Iterators

```python
import itertools

# count() - infinite counter
for i in itertools.count(10, 2):
    if i > 20:
        break
    print(i)  # 10, 12, 14, 16, 18, 20

# cycle() - cycle through iterable infinitely
counter = 0
for color in itertools.cycle(['red', 'green', 'blue']):
    if counter >= 7:
        break
    print(color)
    counter += 1
# red, green, blue, red, green, blue, red

# repeat() - repeat value
for num in itertools.repeat(5, 3):
    print(num)  # 5, 5, 5
```

### Combinatoric Iterators

```python
import itertools

# product() - Cartesian product
colors = ['red', 'blue']
sizes = ['S', 'M', 'L']
for color, size in itertools.product(colors, sizes):
    print(f"{color}-{size}")
# red-S, red-M, red-L, blue-S, blue-M, blue-L

# permutations() - all orderings
for perm in itertools.permutations([1, 2, 3], 2):
    print(perm)
# (1, 2), (1, 3), (2, 1), (2, 3), (3, 1), (3, 2)

# combinations() - all combinations (order doesn't matter)
for comb in itertools.combinations([1, 2, 3, 4], 2):
    print(comb)
# (1, 2), (1, 3), (1, 4), (2, 3), (2, 4), (3, 4)

# combinations_with_replacement()
for comb in itertools.combinations_with_replacement([1, 2], 2):
    print(comb)
# (1, 1), (1, 2), (2, 2)
```

### Terminating Iterators

```python
import itertools

# chain() - chain multiple iterables
list1 = [1, 2, 3]
list2 = [4, 5, 6]
for num in itertools.chain(list1, list2):
    print(num)  # 1, 2, 3, 4, 5, 6

# compress() - filter by boolean mask
data = ['A', 'B', 'C', 'D']
selectors = [True, False, True, False]
result = list(itertools.compress(data, selectors))
print(result)  # ['A', 'C']

# dropwhile() - drop while condition is true
numbers = [1, 3, 5, 2, 4, 6]
result = list(itertools.dropwhile(lambda x: x < 4, numbers))
print(result)  # [5, 2, 4, 6]

# takewhile() - take while condition is true
result = list(itertools.takewhile(lambda x: x < 4, numbers))
print(result)  # [1, 3]

# groupby() - group consecutive elements
data = [1, 1, 2, 2, 2, 3, 1, 1]
for key, group in itertools.groupby(data):
    print(f"{key}: {list(group)}")
# 1: [1, 1]
# 2: [2, 2, 2]
# 3: [3]
# 1: [1, 1]

# islice() - slice iterator
numbers = range(100)
result = list(itertools.islice(numbers, 5, 10))
print(result)  # [5, 6, 7, 8, 9]
```

### Real-World Example: Batch Processing

```python
import itertools

def batched(iterable, batch_size):
    """Batch iterable into chunks of batch_size"""
    iterator = iter(iterable)
    while True:
        batch = list(itertools.islice(iterator, batch_size))
        if not batch:
            break
        yield batch

# Process data in batches
data = range(1, 16)
for batch in batched(data, 5):
    print(batch)
# [1, 2, 3, 4, 5]
# [6, 7, 8, 9, 10]
# [11, 12, 13, 14, 15]

# Database query batching
def process_users_in_batches(user_ids, batch_size=100):
    """Process users in batches"""
    for batch in batched(user_ids, batch_size):
        # Query database with batch
        # users = db.query(user_ids=batch)
        # process(users)
        print(f"Processing batch: {batch}")

# process_users_in_batches(range(1, 1001), batch_size=100)
```

---

## Common Pitfalls

### 1. Exhausted Generator

```python
# ❌ Generator can only be iterated once
gen = (x for x in range(5))
print(list(gen))  # [0, 1, 2, 3, 4]
print(list(gen))  # [] - exhausted!

# ✓ Create new generator if needed
def get_generator():
    return (x for x in range(5))

gen1 = get_generator()
gen2 = get_generator()
print(list(gen1))  # [0, 1, 2, 3, 4]
print(list(gen2))  # [0, 1, 2, 3, 4]
```

### 2. Storing Generators vs Results

```python
# Generator stores computation, not results
gen = (x**2 for x in range(10))
print(gen)  # <generator object>

# Need to consume to get results
result = list(gen)
print(result)  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
```

### 3. Generator Expression in Function Call

```python
# ❌ Wrong - double parentheses
result = sum((x**2 for x in range(10)))

# ✓ Correct - single parentheses
result = sum(x**2 for x in range(10))
```

### 4. Modifying List While Iterating

```python
# ❌ Wrong - modifying list during iteration
numbers = [1, 2, 3, 4, 5]
for num in numbers:
    if num % 2 == 0:
        numbers.remove(num)  # Dangerous!

# ✓ Correct - use list comprehension
numbers = [1, 2, 3, 4, 5]
numbers = [num for num in numbers if num % 2 != 0]
```

---

## Interview Questions

### Q1: What's the difference between iterator and iterable?

**Answer:**
- **Iterable**: Object that can return an iterator (has `__iter__()`)
- **Iterator**: Object that produces values (has `__iter__()` and `__next__()`)

```python
# List is iterable
numbers = [1, 2, 3]
print(hasattr(numbers, '__iter__'))  # True
print(hasattr(numbers, '__next__'))  # False

# Iterator from list
iterator = iter(numbers)
print(hasattr(iterator, '__iter__'))  # True
print(hasattr(iterator, '__next__'))  # True
```

### Q2: When to use generator vs list comprehension?

**Answer:**
- **List comprehension**: When you need the entire result multiple times
- **Generator**: When you need values one at a time or dealing with large data

```python
# List - if you need to iterate multiple times
numbers = [x**2 for x in range(10)]
print(sum(numbers))
print(max(numbers))  # Can reuse

# Generator - if you only need to iterate once
numbers = (x**2 for x in range(10))
print(sum(numbers))
# print(max(numbers))  # Error! Generator exhausted
```

### Q3: Explain yield vs return

**Answer:**
- **return**: Exits function, returns value, function state is lost
- **yield**: Pauses function, returns value, preserves state for next call

```python
def with_return():
    return 1
    return 2  # Never executed

def with_yield():
    yield 1
    yield 2   # Executed on second next()

print(with_return())  # 1
gen = with_yield()
print(next(gen))  # 1
print(next(gen))  # 2
```

### Q4: Create a generator for prime numbers

```python
def prime_generator(n):
    """Generate prime numbers up to n"""
    def is_prime(num):
        if num < 2:
            return False
        for i in range(2, int(num**0.5) + 1):
            if num % i == 0:
                return False
        return True

    for num in range(2, n + 1):
        if is_prime(num):
            yield num

# First 10 primes under 30
for prime in prime_generator(30):
    print(prime, end=' ')
# 2 3 5 7 11 13 17 19 23 29
```

### Q5: Implement your own range() as generator

```python
def my_range(start, stop=None, step=1):
    """Custom range implementation"""
    if stop is None:
        start, stop = 0, start

    current = start
    if step > 0:
        while current < stop:
            yield current
            current += step
    else:
        while current > stop:
            yield current
            current += step

# Usage
print(list(my_range(5)))          # [0, 1, 2, 3, 4]
print(list(my_range(2, 8)))       # [2, 3, 4, 5, 6, 7]
print(list(my_range(0, 10, 2)))   # [0, 2, 4, 6, 8]
```

---

## Practice Problems

1. **Fibonacci Generator**: Create a generator for Fibonacci sequence up to n terms.

2. **File Filter Generator**: Create a generator that filters lines from a file based on a pattern.

3. **Infinite Sequence**: Create a generator for an infinite arithmetic sequence.

4. **Tree Traversal**: Implement a generator for tree traversal (in-order, pre-order, post-order).

5. **Moving Average**: Create a generator that yields moving average of a stream.

---

## Quick Reference

```python
# Iterator Protocol
class MyIterator:
    def __iter__(self):
        return self
    def __next__(self):
        # return next value or raise StopIteration
        pass

# Generator Function
def my_generator():
    yield value1
    yield value2

# Generator Expression
gen = (x**2 for x in range(10))

# itertools
import itertools
itertools.count(start, step)
itertools.cycle(iterable)
itertools.chain(iter1, iter2)
itertools.islice(iterable, start, stop)
itertools.groupby(iterable, key)

# yield from
def delegate():
    yield from sub_generator()
```

---

**End of Iterators and Generators - Happy Learning! 🐍**
