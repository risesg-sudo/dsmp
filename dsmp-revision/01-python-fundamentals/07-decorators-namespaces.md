# Decorators and Namespaces

## Table of Contents
1. [Decorators Basics](#decorators-basics)
2. [Function Decorators](#function-decorators)
3. [Decorators with Arguments](#decorators-with-arguments)
4. [Class Decorators](#class-decorators)
5. [Built-in Decorators](#built-in-decorators)
6. [Decorator Chaining](#decorator-chaining)
7. [Namespaces and Scope](#namespaces-and-scope)
8. [Common Pitfalls](#common-pitfalls)
9. [Interview Questions](#interview-questions)

---

## Decorators Basics

Decorators are functions that modify the behavior of other functions or classes.

```
┌─────────────────────────────────────┐
│     Decorator Pattern               │
├─────────────────────────────────────┤
│  Original Function                  │
│         │                           │
│         ▼                           │
│    Decorator                        │
│    (Wraps function)                 │
│         │                           │
│         ▼                           │
│  Enhanced Function                  │
│  (With added behavior)              │
└─────────────────────────────────────┘
```

### Simple Decorator Example

```python
# Function that returns a function
def my_decorator(func):
    """Decorator that adds behavior before and after function"""
    def wrapper():
        print("Before function call")
        func()
        print("After function call")
    return wrapper

# Manual decoration
def say_hello():
    print("Hello!")

say_hello = my_decorator(say_hello)
say_hello()
# Before function call
# Hello!
# After function call

# Using @ syntax (syntactic sugar)
@my_decorator
def say_goodbye():
    print("Goodbye!")

say_goodbye()
# Before function call
# Goodbye!
# After function call
```

### Why Use Decorators?

```python
"""
Common use cases:
1. Logging
2. Timing/Performance measurement
3. Access control/Authentication
4. Caching/Memoization
5. Input validation
6. Retry logic
7. Rate limiting
"""
```

---

## Function Decorators

### Decorator with Arguments

```python
def decorator_with_args(func):
    """Decorator that handles function arguments"""
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__} with args={args}, kwargs={kwargs}")
        result = func(*args, **kwargs)
        print(f"Result: {result}")
        return result
    return wrapper

@decorator_with_args
def add(a, b):
    return a + b

@decorator_with_args
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

add(5, 3)
# Calling add with args=(5, 3), kwargs={}
# Result: 8

greet("Alice", greeting="Hi")
# Calling greet with args=('Alice',), kwargs={'greeting': 'Hi'}
# Result: Hi, Alice!
```

### Preserving Function Metadata

```python
from functools import wraps

# ❌ Without @wraps
def bad_decorator(func):
    def wrapper(*args, **kwargs):
        """Wrapper docstring"""
        return func(*args, **kwargs)
    return wrapper

@bad_decorator
def greet(name):
    """Greet a person"""
    return f"Hello, {name}!"

print(greet.__name__)  # wrapper (wrong!)
print(greet.__doc__)   # Wrapper docstring (wrong!)

# ✓ With @wraps
def good_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        """Wrapper docstring"""
        return func(*args, **kwargs)
    return wrapper

@good_decorator
def greet2(name):
    """Greet a person"""
    return f"Hello, {name}!"

print(greet2.__name__)  # greet2 (correct!)
print(greet2.__doc__)   # Greet a person (correct!)
```

### Real-World Example: Timing Decorator

```python
import time
from functools import wraps

def timer(func):
    """Decorator to measure execution time"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        execution_time = end_time - start_time
        print(f"{func.__name__} took {execution_time:.4f} seconds")
        return result
    return wrapper

@timer
def slow_function():
    """Simulate slow function"""
    time.sleep(1)
    return "Done"

@timer
def calculate_sum(n):
    """Calculate sum of first n numbers"""
    return sum(range(n))

slow_function()
# slow_function took 1.0012 seconds

calculate_sum(1000000)
# calculate_sum took 0.0234 seconds
```

### Logging Decorator

```python
from functools import wraps
from datetime import datetime

def log_calls(func):
    """Decorator to log function calls"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        args_str = ', '.join(repr(a) for a in args)
        kwargs_str = ', '.join(f"{k}={v!r}" for k, v in kwargs.items())
        all_args = ', '.join(filter(None, [args_str, kwargs_str]))

        print(f"[{timestamp}] Calling {func.__name__}({all_args})")

        try:
            result = func(*args, **kwargs)
            print(f"[{timestamp}] {func.__name__} returned {result!r}")
            return result
        except Exception as e:
            print(f"[{timestamp}] {func.__name__} raised {type(e).__name__}: {e}")
            raise

    return wrapper

@log_calls
def divide(a, b):
    return a / b

divide(10, 2)
# [2024-01-01 12:00:00] Calling divide(10, 2)
# [2024-01-01 12:00:00] divide returned 5.0

try:
    divide(10, 0)
except ZeroDivisionError:
    pass
# [2024-01-01 12:00:00] Calling divide(10, 0)
# [2024-01-01 12:00:00] divide raised ZeroDivisionError: division by zero
```

---

## Decorators with Arguments

### Parametrized Decorators

```python
from functools import wraps

def repeat(times):
    """Decorator factory that repeats function execution"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(times=3)
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")
# Hello, Alice!
# Hello, Alice!
# Hello, Alice!

# Equivalent to:
# greet = repeat(times=3)(greet)
```

### Cache Decorator with Size Limit

```python
from functools import wraps

def cache(max_size=100):
    """Decorator with caching and size limit"""
    def decorator(func):
        cache_dict = {}

        @wraps(func)
        def wrapper(*args):
            if args in cache_dict:
                print(f"Cache hit for {args}")
                return cache_dict[args]

            print(f"Cache miss for {args}")
            result = func(*args)

            # Limit cache size
            if len(cache_dict) >= max_size:
                # Remove oldest entry (first item)
                cache_dict.pop(next(iter(cache_dict)))

            cache_dict[args] = result
            return result

        return wrapper
    return decorator

@cache(max_size=3)
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(5))
print(fibonacci(5))  # Uses cache
```

### Authentication Decorator

```python
from functools import wraps

def require_auth(role=None):
    """Decorator to check user authentication and role"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Simulate getting current user
            current_user = kwargs.get('user', {})

            if not current_user:
                raise PermissionError("Authentication required")

            if role and current_user.get('role') != role:
                raise PermissionError(f"Role '{role}' required")

            return func(*args, **kwargs)
        return wrapper
    return decorator

@require_auth()
def view_profile(user=None):
    return f"Profile for {user['name']}"

@require_auth(role='admin')
def delete_user(user_id, user=None):
    return f"User {user_id} deleted"

# Usage
try:
    # Works
    print(view_profile(user={'name': 'Alice', 'role': 'user'}))

    # Fails - not admin
    print(delete_user(123, user={'name': 'Alice', 'role': 'user'}))
except PermissionError as e:
    print(f"Error: {e}")
```

---

## Class Decorators

### Decorating Classes

```python
def singleton(cls):
    """Decorator to make class a singleton"""
    instances = {}

    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]

    return get_instance

@singleton
class Database:
    def __init__(self, host):
        self.host = host
        print(f"Database connection created to {host}")

# Both return same instance
db1 = Database("localhost")
db2 = Database("localhost")
print(db1 is db2)  # True
```

### Method Decorators in Classes

```python
from functools import wraps

def validate_positive(func):
    """Decorator to validate method argument is positive"""
    @wraps(func)
    def wrapper(self, value):
        if value <= 0:
            raise ValueError("Value must be positive")
        return func(self, value)
    return wrapper

class BankAccount:
    def __init__(self, balance=0):
        self.balance = balance

    @validate_positive
    def deposit(self, amount):
        """Deposit money into account"""
        self.balance += amount
        return self.balance

    @validate_positive
    def withdraw(self, amount):
        """Withdraw money from account"""
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.balance -= amount
        return self.balance

account = BankAccount(1000)
account.deposit(500)    # Works
# account.deposit(-100)  # ValueError: Value must be positive
```

### Property Decorators

```python
class Temperature:
    def __init__(self, celsius=0):
        self._celsius = celsius

    @property
    def celsius(self):
        """Get temperature in Celsius"""
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        """Set temperature in Celsius"""
        if value < -273.15:
            raise ValueError("Temperature below absolute zero!")
        self._celsius = value

    @property
    def fahrenheit(self):
        """Get temperature in Fahrenheit"""
        return (self._celsius * 9/5) + 32

    @fahrenheit.setter
    def fahrenheit(self, value):
        """Set temperature using Fahrenheit"""
        self._celsius = (value - 32) * 5/9

# Usage
temp = Temperature(25)
print(temp.celsius)      # 25 (uses getter)
temp.celsius = 30        # Uses setter
print(temp.fahrenheit)   # 86.0
```

---

## Built-in Decorators

### @staticmethod

```python
class MathOperations:
    @staticmethod
    def add(a, b):
        """Static method - no access to self or cls"""
        return a + b

    @staticmethod
    def multiply(a, b):
        return a * b

# Can call without instance
print(MathOperations.add(5, 3))      # 8
print(MathOperations.multiply(4, 2)) # 8

# Can also call with instance
math = MathOperations()
print(math.add(10, 20))  # 30
```

### @classmethod

```python
class Person:
    population = 0

    def __init__(self, name, age):
        self.name = name
        self.age = age
        Person.population += 1

    @classmethod
    def from_birth_year(cls, name, birth_year):
        """Alternative constructor"""
        age = 2024 - birth_year
        return cls(name, age)

    @classmethod
    def get_population(cls):
        """Class method to access class variable"""
        return cls.population

# Regular instantiation
person1 = Person("Alice", 25)

# Using class method as factory
person2 = Person.from_birth_year("Bob", 1990)

print(person2.name, person2.age)     # Bob 34
print(Person.get_population())       # 2
```

### @property, @abstractmethod

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        """Must be implemented by subclass"""
        pass

    @abstractmethod
    def perimeter(self):
        """Must be implemented by subclass"""
        pass

class Rectangle(Shape):
    def __init__(self, width, height):
        self._width = width
        self._height = height

    @property
    def area(self):
        """Calculate area"""
        return self._width * self._height

    @property
    def perimeter(self):
        """Calculate perimeter"""
        return 2 * (self._width + self._height)

rect = Rectangle(5, 10)
print(rect.area)       # 50
print(rect.perimeter)  # 30
```

---

## Decorator Chaining

Multiple decorators can be stacked on a single function.

```python
from functools import wraps

def bold(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return f"<b>{func(*args, **kwargs)}</b>"
    return wrapper

def italic(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return f"<i>{func(*args, **kwargs)}</i>"
    return wrapper

def uppercase(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs).upper()
    return wrapper

# Order matters! Applied bottom-to-top
@bold
@italic
@uppercase
def greet(name):
    return f"hello, {name}"

print(greet("Alice"))
# <b><i>HELLO, ALICE</i></b>

# Equivalent to:
# greet = bold(italic(uppercase(greet)))
```

### Order Demonstration

```python
def decorator_a(func):
    def wrapper():
        print("A before")
        result = func()
        print("A after")
        return result
    return wrapper

def decorator_b(func):
    def wrapper():
        print("B before")
        result = func()
        print("B after")
        return result
    return wrapper

@decorator_a
@decorator_b
def my_function():
    print("Function executing")

my_function()
# A before
# B before
# Function executing
# B after
# A after

# Execution flow:
# decorator_a(decorator_b(my_function))
```

---

## Namespaces and Scope

### LEGB Rule

**L**ocal → **E**nclosing → **G**lobal → **B**uilt-in

```python
# Built-in namespace
len([1, 2, 3])  # Built-in function

# Global namespace
x = "global"

def outer():
    # Enclosing namespace
    x = "enclosing"

    def inner():
        # Local namespace
        x = "local"
        print(f"Local: {x}")

    inner()
    print(f"Enclosing: {x}")

outer()
print(f"Global: {x}")

# Output:
# Local: local
# Enclosing: enclosing
# Global: global
```

### global Keyword

```python
count = 0  # Global variable

def increment():
    global count  # Declare using global variable
    count += 1
    print(f"Count: {count}")

increment()  # Count: 1
increment()  # Count: 2
print(count) # 2

# Without global
def increment_wrong():
    count = 0  # Creates new local variable
    count += 1

increment_wrong()
print(count)  # Still 2 (global unchanged)
```

### nonlocal Keyword

```python
def outer():
    count = 0  # Enclosing variable

    def inner():
        nonlocal count  # Modify enclosing variable
        count += 1
        print(f"Inner count: {count}")

    inner()  # Inner count: 1
    inner()  # Inner count: 2
    print(f"Outer count: {count}")  # Outer count: 2

outer()
```

### Namespace Visualization

```python
"""
┌─────────────────────────────────────────┐
│         Built-in Namespace              │
│  (len, print, int, str, etc.)           │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Global Namespace                │
│  (module-level variables, functions)    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│       Enclosing Namespace               │
│  (variables in outer functions)         │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Local Namespace                 │
│  (variables in current function)        │
└─────────────────────────────────────────┘
"""
```

### Viewing Namespaces

```python
x = 10
y = 20

def my_function():
    z = 30
    print("Local namespace:", locals())
    print("Global namespace:", globals().keys())

my_function()

# Built-in namespace
import builtins
print("Built-in namespace:", dir(builtins))
```

---

## Common Pitfalls

### 1. Forgetting @wraps

```python
from functools import wraps

# ❌ Without @wraps
def bad_decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

# ✓ With @wraps
def good_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
```

### 2. Decorator Arguments Confusion

```python
# ❌ Wrong - forgetting to return decorator
def repeat(times):
    def wrapper(*args, **kwargs):
        pass
    return wrapper  # Returns wrapper, not decorator!

# ✓ Correct - three levels of nesting
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator
```

### 3. Mutable Default Arguments in Decorators

```python
# ❌ Wrong
def cache(func, cache_dict={}):  # Mutable default!
    def wrapper(*args):
        if args not in cache_dict:
            cache_dict[args] = func(*args)
        return cache_dict[args]
    return wrapper

# ✓ Correct
def cache(func):
    cache_dict = {}  # Create inside decorator
    def wrapper(*args):
        if args not in cache_dict:
            cache_dict[args] = func(*args)
        return cache_dict[args]
    return wrapper
```

---

## Interview Questions

### Q1: What is a closure in the context of decorators?

**Answer:** A closure is a function that remembers variables from its enclosing scope, even after the outer function has finished executing.

```python
def make_multiplier(n):
    def multiplier(x):
        return x * n  # Remembers 'n'
    return multiplier

double = make_multiplier(2)
triple = make_multiplier(3)

print(double(5))  # 10
print(triple(5))  # 15
```

### Q2: How do decorators with arguments work?

**Answer:** They use three levels of nested functions:

```python
def decorator_with_args(arg):
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Use 'arg' here
            return func(*args, **kwargs)
        return wrapper
    return decorator

@decorator_with_args(10)
def my_func():
    pass

# Equivalent to:
# my_func = decorator_with_args(10)(my_func)
```

### Q3: What's the difference between @staticmethod and @classmethod?

**Answer:**
- `@staticmethod`: No access to instance (self) or class (cls)
- `@classmethod`: Has access to class (cls) but not instance (self)

```python
class MyClass:
    @staticmethod
    def static_method():
        return "No access to self or cls"

    @classmethod
    def class_method(cls):
        return f"Has access to {cls.__name__}"
```

### Q4: Create a decorator to measure function calls

```python
from functools import wraps

def count_calls(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        print(f"{func.__name__} called {wrapper.calls} times")
        return func(*args, **kwargs)
    wrapper.calls = 0
    return wrapper

@count_calls
def say_hello():
    print("Hello!")

say_hello()  # say_hello called 1 times
say_hello()  # say_hello called 2 times
```

### Q5: What's the output?

```python
x = "global"

def outer():
    x = "enclosing"

    def inner():
        print(x)

    return inner

func = outer()
func()
```

**Answer:** `"enclosing"` - The inner function closes over the enclosing scope.

---

## Practice Problems

1. **Rate Limiter Decorator**: Create a decorator that limits function calls per second.

2. **Memoization Decorator**: Implement a memoization decorator with LRU cache.

3. **Retry Decorator**: Create a decorator that retries failed function calls.

4. **Deprecation Decorator**: Create a decorator to mark functions as deprecated.

5. **Type Checking Decorator**: Create a decorator that validates function argument types.

---

## Quick Reference

```python
# Simple decorator
def decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Before
        result = func(*args, **kwargs)
        # After
        return result
    return wrapper

# Decorator with arguments
def decorator_with_args(arg):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Use 'arg'
            return func(*args, **kwargs)
        return wrapper
    return decorator

# Class decorator
@staticmethod
def static_method():
    pass

@classmethod
def class_method(cls):
    pass

@property
def prop(self):
    return self._value

# Namespaces
global var  # Modify global variable
nonlocal var  # Modify enclosing variable
```

---

**End of Decorators and Namespaces - Happy Learning! 🐍**
