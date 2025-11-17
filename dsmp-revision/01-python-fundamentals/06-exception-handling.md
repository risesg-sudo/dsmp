# Exception Handling

## Table of Contents
1. [Exception Basics](#exception-basics)
2. [Try-Except Block](#try-except-block)
3. [Multiple Exceptions](#multiple-exceptions)
4. [Else and Finally](#else-and-finally)
5. [Raising Exceptions](#raising-exceptions)
6. [Custom Exceptions](#custom-exceptions)
7. [Exception Hierarchy](#exception-hierarchy)
8. [Best Practices](#best-practices)
9. [Common Pitfalls](#common-pitfalls)
10. [Interview Questions](#interview-questions)

---

## Exception Basics

Exceptions are errors that occur during program execution.

```
┌─────────────────────────────────────┐
│     Exception Handling Flow         │
├─────────────────────────────────────┤
│  try:                               │
│      # Code that might raise error  │
│      risky_operation()              │
│  except ExceptionType:              │
│      # Handle the exception         │
│      handle_error()                 │
│  else:                              │
│      # Run if no exception          │
│      success_actions()              │
│  finally:                           │
│      # Always runs                  │
│      cleanup()                      │
└─────────────────────────────────────┘
```

### Why Handle Exceptions?

```python
# Without exception handling - program crashes
def divide(a, b):
    return a / b

# result = divide(10, 0)  # ZeroDivisionError! Program stops!

# With exception handling - program continues
def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        print("Error: Cannot divide by zero!")
        return None

result = safe_divide(10, 0)  # Error: Cannot divide by zero!
print("Program continues...")  # This line executes
```

---

## Try-Except Block

### Basic Syntax

```python
try:
    # Code that might raise an exception
    number = int(input("Enter a number: "))
    result = 10 / number
    print(f"Result: {result}")
except:
    # Catches all exceptions (not recommended)
    print("An error occurred!")
```

### Catching Specific Exceptions

```python
# Catch specific exception type
try:
    number = int(input("Enter a number: "))
    result = 10 / number
except ValueError:
    print("Invalid input! Please enter a number.")
except ZeroDivisionError:
    print("Cannot divide by zero!")
```

### Accessing Exception Information

```python
try:
    number = int(input("Enter a number: "))
    result = 10 / number
except ValueError as e:
    print(f"ValueError occurred: {e}")
except ZeroDivisionError as e:
    print(f"ZeroDivisionError occurred: {e}")

# Example outputs:
# ValueError occurred: invalid literal for int() with base 10: 'abc'
# ZeroDivisionError occurred: division by zero
```

---

## Multiple Exceptions

### Multiple Exception Types

```python
# Catch multiple exceptions separately
try:
    file = open('data.txt', 'r')
    content = file.read()
    number = int(content)
    result = 100 / number
except FileNotFoundError:
    print("File not found!")
except ValueError:
    print("File content is not a valid number!")
except ZeroDivisionError:
    print("Number in file cannot be zero!")
except Exception as e:
    print(f"Unexpected error: {e}")
```

### Catching Multiple Exceptions Together

```python
# Group exceptions with same handling
try:
    value = int(input("Enter a number: "))
    result = 100 / value
except (ValueError, ZeroDivisionError) as e:
    print(f"Invalid input or zero division: {e}")
```

### Real-World Example: User Input Validation

```python
def get_valid_age():
    """Get valid age from user with proper error handling"""
    while True:
        try:
            age = int(input("Enter your age: "))

            if age < 0:
                print("Age cannot be negative!")
                continue
            if age > 150:
                print("Please enter a realistic age!")
                continue

            return age

        except ValueError:
            print("Invalid input! Please enter a number.")
        except KeyboardInterrupt:
            print("\nOperation cancelled by user.")
            return None

# Usage
# age = get_valid_age()
# if age:
#     print(f"Your age is: {age}")
```

---

## Else and Finally

### else Clause

Executes if **no exception** was raised in try block.

```python
try:
    number = int(input("Enter a number: "))
    result = 10 / number
except ValueError:
    print("Invalid input!")
except ZeroDivisionError:
    print("Cannot divide by zero!")
else:
    # Only runs if no exception occurred
    print(f"Success! Result is {result}")
    print("Calculation completed successfully.")
```

### finally Clause

Always executes, regardless of whether an exception occurred.

```python
# File handling with finally
try:
    file = open('data.txt', 'r')
    content = file.read()
    print(content)
except FileNotFoundError:
    print("File not found!")
finally:
    # Always close the file if it was opened
    try:
        file.close()
        print("File closed.")
    except:
        pass
```

### Complete Example

```python
def divide_numbers(a, b):
    """Divide two numbers with complete error handling"""
    print(f"Attempting to divide {a} by {b}")

    try:
        result = a / b
    except ZeroDivisionError:
        print("Error: Division by zero!")
        return None
    except TypeError:
        print("Error: Invalid data types!")
        return None
    else:
        print("Division successful!")
        return result
    finally:
        print("Division operation completed.")

# Test cases
print(divide_numbers(10, 2))
# Attempting to divide 10 by 2
# Division successful!
# Division operation completed.
# 5.0

print(divide_numbers(10, 0))
# Attempting to divide 10 by 0
# Error: Division by zero!
# Division operation completed.
# None
```

### Visual Flow

```
try:
    operation()
    │
    ├─ No Exception ─────┐
    │                    │
    └─ Exception ────┐   │
                     ▼   ▼
                  except  else
                     │   │
                     └───┼────► finally
                         │
                         ▼
                    Continue program
```

---

## Raising Exceptions

### Raise Built-in Exceptions

```python
def set_age(age):
    """Set age with validation"""
    if not isinstance(age, int):
        raise TypeError("Age must be an integer")
    if age < 0:
        raise ValueError("Age cannot be negative")
    if age > 150:
        raise ValueError("Age must be less than 150")

    print(f"Age set to {age}")

# Usage
try:
    set_age(25)       # Age set to 25
    set_age(-5)       # ValueError: Age cannot be negative
except ValueError as e:
    print(f"Error: {e}")
```

### Re-raising Exceptions

```python
def process_data(data):
    """Process data and re-raise exception with context"""
    try:
        result = 100 / data
        return result
    except ZeroDivisionError:
        print("Logging error...")
        raise  # Re-raise the same exception

try:
    process_data(0)
except ZeroDivisionError:
    print("Caught re-raised exception!")
```

### Raise from Another Exception

```python
def calculate(data):
    try:
        return 10 / int(data)
    except ValueError as e:
        # Raise new exception with context
        raise TypeError("Invalid data type for calculation") from e

try:
    calculate("abc")
except TypeError as e:
    print(f"Error: {e}")
    print(f"Original cause: {e.__cause__}")
```

---

## Custom Exceptions

### Creating Custom Exceptions

```python
# Basic custom exception
class CustomError(Exception):
    """Base class for custom exceptions"""
    pass

class InvalidAgeError(CustomError):
    """Raised when age is invalid"""
    pass

class InvalidEmailError(CustomError):
    """Raised when email is invalid"""
    pass

# Using custom exceptions
def validate_age(age):
    if age < 0:
        raise InvalidAgeError("Age cannot be negative")
    if age > 150:
        raise InvalidAgeError("Age must be less than 150")
    return True

try:
    validate_age(-5)
except InvalidAgeError as e:
    print(f"Validation error: {e}")
```

### Custom Exception with Attributes

```python
class ValidationError(Exception):
    """Custom exception with additional attributes"""

    def __init__(self, message, field, value):
        super().__init__(message)
        self.field = field
        self.value = value

    def __str__(self):
        return f"{self.args[0]} (Field: {self.field}, Value: {self.value})"

# Usage
def validate_user(name, age):
    if not name:
        raise ValidationError(
            "Name cannot be empty",
            field="name",
            value=name
        )
    if age < 0:
        raise ValidationError(
            "Age cannot be negative",
            field="age",
            value=age
        )

try:
    validate_user("", -5)
except ValidationError as e:
    print(f"Error: {e}")
    print(f"Failed field: {e.field}")
    print(f"Invalid value: {e.value}")
```

### Real-World Example: Banking Application

```python
class BankingError(Exception):
    """Base exception for banking operations"""
    pass

class InsufficientFundsError(BankingError):
    """Raised when account has insufficient funds"""
    def __init__(self, balance, amount):
        self.balance = balance
        self.amount = amount
        super().__init__(
            f"Insufficient funds: Balance ₹{balance}, "
            f"Attempted withdrawal ₹{amount}"
        )

class InvalidAmountError(BankingError):
    """Raised when transaction amount is invalid"""
    pass

class AccountNotFoundError(BankingError):
    """Raised when account doesn't exist"""
    pass

class BankAccount:
    def __init__(self, account_number, balance=0):
        self.account_number = account_number
        self.balance = balance

    def withdraw(self, amount):
        """Withdraw money from account"""
        if amount <= 0:
            raise InvalidAmountError("Amount must be positive")

        if amount > self.balance:
            raise InsufficientFundsError(self.balance, amount)

        self.balance -= amount
        return self.balance

    def deposit(self, amount):
        """Deposit money into account"""
        if amount <= 0:
            raise InvalidAmountError("Amount must be positive")

        self.balance += amount
        return self.balance

# Usage
account = BankAccount("ACC001", 1000)

try:
    account.withdraw(500)
    print("Withdrawal successful")

    account.withdraw(700)  # Will raise InsufficientFundsError

except InsufficientFundsError as e:
    print(f"Error: {e}")
    print(f"Available balance: ₹{e.balance}")
    print(f"Requested amount: ₹{e.amount}")

except InvalidAmountError as e:
    print(f"Error: {e}")

except BankingError as e:
    print(f"Banking error: {e}")
```

---

## Exception Hierarchy

### Built-in Exception Hierarchy

```
BaseException
 ├── SystemExit
 ├── KeyboardInterrupt
 ├── GeneratorExit
 └── Exception
      ├── StopIteration
      ├── ArithmeticError
      │    ├── ZeroDivisionError
      │    ├── OverflowError
      │    └── FloatingPointError
      ├── AssertionError
      ├── AttributeError
      ├── EOFError
      ├── ImportError
      ├── LookupError
      │    ├── IndexError
      │    └── KeyError
      ├── MemoryError
      ├── NameError
      ├── OSError
      │    ├── FileNotFoundError
      │    ├── PermissionError
      │    └── TimeoutError
      ├── RuntimeError
      ├── TypeError
      ├── ValueError
      └── Warning
```

### Common Exceptions

```python
# ValueError - Invalid value
int("abc")  # ValueError: invalid literal

# TypeError - Wrong type
"hello" + 5  # TypeError: can only concatenate str

# KeyError - Key not in dictionary
d = {'a': 1}
d['b']  # KeyError: 'b'

# IndexError - Index out of range
lst = [1, 2, 3]
lst[10]  # IndexError: list index out of range

# AttributeError - Attribute doesn't exist
"hello".upper  # <method>
"hello".upper2()  # AttributeError: 'str' object has no attribute 'upper2'

# FileNotFoundError - File doesn't exist
open('nonexistent.txt')  # FileNotFoundError

# ZeroDivisionError - Division by zero
10 / 0  # ZeroDivisionError

# ImportError - Module not found
import nonexistent_module  # ModuleNotFoundError (subclass of ImportError)

# NameError - Variable not defined
print(undefined_variable)  # NameError: name 'undefined_variable' is not defined
```

---

## Best Practices

### 1. Catch Specific Exceptions

```python
# ❌ Bad - catches everything
try:
    risky_operation()
except:
    print("Error occurred")

# ✓ Good - catch specific exceptions
try:
    risky_operation()
except ValueError:
    print("Invalid value")
except TypeError:
    print("Invalid type")
```

### 2. Don't Swallow Exceptions Silently

```python
# ❌ Bad - exception disappears
try:
    risky_operation()
except Exception:
    pass  # Silent failure!

# ✓ Good - at least log the error
try:
    risky_operation()
except Exception as e:
    print(f"Error occurred: {e}")
    # Or use proper logging
    # logging.error(f"Error: {e}")
```

### 3. Use else for Success Logic

```python
# ❌ Bad - success code in try
try:
    data = load_data()
    process_data(data)  # Shouldn't be in try!
    save_results()      # Shouldn't be in try!
except IOError:
    print("Failed to load data")

# ✓ Good - only risky code in try
try:
    data = load_data()
except IOError:
    print("Failed to load data")
else:
    process_data(data)
    save_results()
```

### 4. Use finally for Cleanup

```python
# Resource cleanup
resource = None
try:
    resource = acquire_resource()
    use_resource(resource)
except Exception as e:
    print(f"Error: {e}")
finally:
    if resource:
        release_resource(resource)
```

### 5. Provide Helpful Error Messages

```python
# ❌ Bad - vague message
def divide(a, b):
    if b == 0:
        raise ValueError("Invalid input")

# ✓ Good - specific message
def divide(a, b):
    if b == 0:
        raise ValueError(
            f"Cannot divide {a} by zero. "
            "Denominator must be non-zero."
        )
```

---

## Common Pitfalls

### 1. Bare except

```python
# ❌ Wrong - catches everything including SystemExit
try:
    something()
except:
    pass

# ✓ Correct - catch Exception (not SystemExit, KeyboardInterrupt)
try:
    something()
except Exception:
    pass
```

### 2. Catching Parent Exception First

```python
# ❌ Wrong - specific exception never reached
try:
    something()
except Exception:
    print("Generic error")
except ValueError:  # Never executed!
    print("Value error")

# ✓ Correct - specific exceptions first
try:
    something()
except ValueError:
    print("Value error")
except Exception:
    print("Generic error")
```

### 3. Ignoring Exception Type

```python
# ❌ Wrong - all exceptions handled the same
try:
    number = int(input())
    result = 10 / number
    file = open('data.txt')
except:
    print("Something went wrong")

# ✓ Correct - handle each appropriately
try:
    number = int(input())
    result = 10 / number
    file = open('data.txt')
except ValueError:
    print("Invalid number format")
except ZeroDivisionError:
    print("Cannot divide by zero")
except FileNotFoundError:
    print("File not found")
```

### 4. Modifying Exception in except

```python
# Be careful when modifying exception
try:
    raise ValueError("Original message")
except ValueError as e:
    e.args = ("Modified message",)  # Changes exception
    raise  # Raises modified exception
```

---

## Interview Questions

### Q1: What's the difference between Exception and BaseException?

**Answer:**
- `BaseException`: Root of all exceptions (includes SystemExit, KeyboardInterrupt)
- `Exception`: Should be caught for normal error handling
- **Always catch Exception, not BaseException** (unless you have a specific reason)

```python
# ✓ Good
try:
    something()
except Exception:
    pass

# ❌ Bad - catches SystemExit, KeyboardInterrupt
try:
    something()
except BaseException:
    pass
```

### Q2: When does finally block not execute?

**Answer:** Finally block almost always executes, except in rare cases:
1. `os._exit()` is called
2. Python interpreter crashes
3. Infinite loop in try block
4. System shutdown

```python
import sys

try:
    print("Try block")
    sys.exit()  # Finally still executes
finally:
    print("Finally block")  # This prints!

try:
    print("Try block")
    import os
    os._exit(1)  # Finally does NOT execute
finally:
    print("Finally block")  # This does NOT print!
```

### Q3: Explain exception chaining

```python
# Exception chaining preserves original exception
try:
    result = int("abc")
except ValueError as e:
    raise TypeError("Failed to convert") from e

# Output shows both exceptions:
# TypeError: Failed to convert
# The above exception was the direct cause of...
# ValueError: invalid literal...
```

### Q4: What's the output?

```python
def test():
    try:
        return 1
    finally:
        return 2

print(test())
```

**Answer:** `2` - finally return overrides try return!

### Q5: Create a retry decorator using exceptions

```python
import time

def retry(max_attempts=3, delay=1):
    """Retry decorator for functions that may fail"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            attempts = 0
            while attempts < max_attempts:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    attempts += 1
                    if attempts >= max_attempts:
                        raise
                    print(f"Attempt {attempts} failed: {e}")
                    print(f"Retrying in {delay} seconds...")
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(max_attempts=3, delay=2)
def unstable_function():
    import random
    if random.random() < 0.7:
        raise ValueError("Random error!")
    return "Success!"

# Usage
# result = unstable_function()
```

---

## Practice Problems

1. **Safe Calculator**: Create a calculator that handles all possible errors gracefully.

2. **File Processor**: Read multiple files and handle various file errors.

3. **Input Validator**: Create a validation system with custom exceptions.

4. **API Wrapper**: Create a wrapper that handles network errors and retries.

5. **Data Parser**: Parse structured data with comprehensive error handling.

---

## Quick Reference

```python
# Basic structure
try:
    risky_code()
except SpecificError:
    handle_specific()
except Exception as e:
    handle_generic(e)
else:
    success_code()
finally:
    cleanup()

# Raising exceptions
raise ValueError("Error message")
raise CustomException("Message") from original_exception

# Custom exception
class CustomError(Exception):
    def __init__(self, message, code):
        super().__init__(message)
        self.code = code

# Common exceptions
ValueError, TypeError, KeyError, IndexError
FileNotFoundError, ZeroDivisionError
AttributeError, ImportError, NameError
```

---

**End of Exception Handling - Happy Learning! 🐍**
