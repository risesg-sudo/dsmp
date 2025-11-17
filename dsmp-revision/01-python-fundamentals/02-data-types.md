# Data Types - Lists, Tuples, Sets, Dictionaries

## Table of Contents
1. [Lists](#lists)
2. [Tuples](#tuples)
3. [Sets](#sets)
4. [Dictionaries](#dictionaries)
5. [Comparison Table](#comparison-table)
6. [Common Pitfalls](#common-pitfalls)
7. [Interview Questions](#interview-questions)

---

## Lists

Lists are **ordered, mutable, and allow duplicate** elements.

```
┌─────────────────────────────────┐
│  List: [1, 2, 3, 4, 5]         │
│                                 │
│  Index:   0  1  2  3  4         │
│  Value:   1  2  3  4  5         │
│  Neg:    -5 -4 -3 -2 -1         │
└─────────────────────────────────┘
```

### Creating Lists

```python
# Empty list
empty = []
empty = list()

# With elements
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True, [1, 2]]  # Can contain different types

# List comprehension
squares = [x**2 for x in range(5)]  # [0, 1, 4, 9, 16]
evens = [x for x in range(10) if x % 2 == 0]  # [0, 2, 4, 6, 8]

# Using list()
chars = list("Python")  # ['P', 'y', 't', 'h', 'o', 'n']
```

### Accessing Elements

```python
fruits = ['apple', 'banana', 'cherry', 'date']

# Indexing
print(fruits[0])      # 'apple'
print(fruits[-1])     # 'date' (last element)
print(fruits[-2])     # 'cherry' (second last)

# Slicing
print(fruits[1:3])    # ['banana', 'cherry']
print(fruits[:2])     # ['apple', 'banana']
print(fruits[2:])     # ['cherry', 'date']
print(fruits[::2])    # ['apple', 'cherry'] (every 2nd element)
print(fruits[::-1])   # ['date', 'cherry', 'banana', 'apple'] (reverse)
```

### List Methods

```python
numbers = [1, 2, 3]

# Adding elements
numbers.append(4)           # [1, 2, 3, 4] - Add at end
numbers.insert(1, 1.5)      # [1, 1.5, 2, 3, 4] - Insert at index
numbers.extend([5, 6])      # [1, 1.5, 2, 3, 4, 5, 6] - Add multiple

# Removing elements
numbers.remove(1.5)         # [1, 2, 3, 4, 5, 6] - Remove first occurrence
popped = numbers.pop()      # Returns 6, list is [1, 2, 3, 4, 5]
popped = numbers.pop(0)     # Returns 1, list is [2, 3, 4, 5]
numbers.clear()             # [] - Remove all elements

# Other methods
numbers = [3, 1, 4, 1, 5, 9, 2]
numbers.sort()              # [1, 1, 2, 3, 4, 5, 9] - Sort in place
numbers.reverse()           # [9, 5, 4, 3, 2, 1, 1] - Reverse in place
count = numbers.count(1)    # 2 - Count occurrences
index = numbers.index(5)    # 1 - Find index of element

# Non-modifying methods
sorted_nums = sorted(numbers)        # Returns new sorted list
reversed_nums = list(reversed(numbers))  # Returns new reversed list
```

### List Operations

```python
# Concatenation
list1 = [1, 2, 3]
list2 = [4, 5, 6]
combined = list1 + list2    # [1, 2, 3, 4, 5, 6]

# Repetition
repeated = [0] * 5          # [0, 0, 0, 0, 0]
pattern = [1, 2] * 3        # [1, 2, 1, 2, 1, 2]

# Membership
print(2 in [1, 2, 3])       # True
print(5 not in [1, 2, 3])   # True

# Length
print(len([1, 2, 3]))       # 3

# Min, Max, Sum (for numeric lists)
numbers = [3, 1, 4, 1, 5]
print(min(numbers))         # 1
print(max(numbers))         # 5
print(sum(numbers))         # 14
```

### List Comprehensions (Advanced)

```python
# Basic
squares = [x**2 for x in range(5)]
# [0, 1, 4, 9, 16]

# With condition
evens = [x for x in range(10) if x % 2 == 0]
# [0, 2, 4, 6, 8]

# With if-else
labels = ['even' if x % 2 == 0 else 'odd' for x in range(5)]
# ['even', 'odd', 'even', 'odd', 'even']

# Nested loops
pairs = [(x, y) for x in range(3) for y in range(3)]
# [(0,0), (0,1), (0,2), (1,0), (1,1), (1,2), (2,0), (2,1), (2,2)]

# Nested list comprehension (2D matrix)
matrix = [[i*j for j in range(3)] for i in range(3)]
# [[0, 0, 0], [0, 1, 2], [0, 2, 4]]

# Filtering nested lists
nested = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [num for sublist in nested for num in sublist]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

### Real-World Example: Shopping Cart

```python
class ShoppingCart:
    def __init__(self):
        self.items = []

    def add_item(self, name, price, quantity=1):
        self.items.append({
            'name': name,
            'price': price,
            'quantity': quantity
        })

    def remove_item(self, name):
        self.items = [item for item in self.items if item['name'] != name]

    def get_total(self):
        return sum(item['price'] * item['quantity'] for item in self.items)

    def display_cart(self):
        for item in self.items:
            print(f"{item['name']}: ₹{item['price']} x {item['quantity']}")
        print(f"Total: ₹{self.get_total()}")

# Usage
cart = ShoppingCart()
cart.add_item("Apple", 100, 3)
cart.add_item("Banana", 50, 6)
cart.display_cart()
# Apple: ₹100 x 3
# Banana: ₹50 x 6
# Total: ₹600
```

### 🎯 Try This!

```python
# What will this print?
list1 = [1, 2, 3]
list2 = list1
list2.append(4)
print(list1)  # ?
print(list2)  # ?

# How to create a true copy?
list3 = list1.copy()  # or list1[:]
list3.append(5)
print(list1)  # ?
print(list3)  # ?
```

<details>
<summary>Answer</summary>

```python
print(list1)  # [1, 2, 3, 4] - Both reference same list
print(list2)  # [1, 2, 3, 4]

print(list1)  # [1, 2, 3, 4] - Unchanged
print(list3)  # [1, 2, 3, 4, 5] - New list
```
</details>

---

## Tuples

Tuples are **ordered, immutable, and allow duplicate** elements.

```python
# Why use tuples?
# 1. Immutability (data protection)
# 2. Faster than lists
# 3. Can be used as dictionary keys
# 4. Unpacking
```

### Creating Tuples

```python
# Empty tuple
empty = ()
empty = tuple()

# Single element tuple (note the comma!)
single = (1,)          # Tuple
not_tuple = (1)        # This is just an integer!

# Multiple elements
numbers = (1, 2, 3, 4, 5)
mixed = (1, "hello", 3.14, True)

# Without parentheses (tuple packing)
coords = 10, 20, 30    # (10, 20, 30)

# Using tuple()
letters = tuple("Python")  # ('P', 'y', 't', 'h', 'o', 'n')
```

### Accessing Elements

```python
point = (10, 20, 30)

# Indexing
print(point[0])       # 10
print(point[-1])      # 30

# Slicing
print(point[1:])      # (20, 30)
print(point[:2])      # (10, 20)
```

### Tuple Operations

```python
# Concatenation
tuple1 = (1, 2, 3)
tuple2 = (4, 5, 6)
combined = tuple1 + tuple2    # (1, 2, 3, 4, 5, 6)

# Repetition
repeated = (0,) * 5           # (0, 0, 0, 0, 0)

# Membership
print(2 in (1, 2, 3))         # True

# Length
print(len((1, 2, 3)))         # 3

# Methods (only 2!)
numbers = (1, 2, 2, 3, 2)
print(numbers.count(2))       # 3
print(numbers.index(3))       # 3
```

### Tuple Unpacking

```python
# Basic unpacking
point = (10, 20, 30)
x, y, z = point
print(x, y, z)  # 10 20 30

# Swapping variables
a, b = 5, 10
a, b = b, a     # a=10, b=5

# Extended unpacking
numbers = (1, 2, 3, 4, 5)
first, *middle, last = numbers
print(first)    # 1
print(middle)   # [2, 3, 4]
print(last)     # 5

# Ignoring values
data = ("Alice", 25, "Engineer", "New York")
name, _, job, _ = data
print(name, job)  # Alice Engineer

# Function return multiple values
def get_user_info():
    return "Alice", 25, "Engineer"  # Returns tuple

name, age, job = get_user_info()
```

### Named Tuples

```python
from collections import namedtuple

# Define named tuple
Point = namedtuple('Point', ['x', 'y'])
person = namedtuple('Person', 'name age job')

# Create instances
p = Point(10, 20)
alice = person("Alice", 25, "Engineer")

# Access
print(p.x, p.y)              # 10 20
print(alice.name, alice.age) # Alice 25
print(p[0], p[1])            # 10 20 (still works)

# Immutable
# alice.age = 26  # AttributeError!
```

### Real-World Example: Database Records

```python
def get_employee_records():
    """Return employee records as tuples (immutable)"""
    return [
        (1, "Alice", "Engineering", 75000),
        (2, "Bob", "Marketing", 65000),
        (3, "Charlie", "Engineering", 80000)
    ]

# Process records
employees = get_employee_records()

for emp_id, name, dept, salary in employees:
    if dept == "Engineering":
        print(f"{name}: ₹{salary:,}")

# Alice: ₹75,000
# Charlie: ₹80,000

# Calculate average salary
avg_salary = sum(emp[3] for emp in employees) / len(employees)
print(f"Average: ₹{avg_salary:,.2f}")
# Average: ₹73,333.33
```

---

## Sets

Sets are **unordered, mutable, and do not allow duplicates**.

```python
# Why use sets?
# 1. Remove duplicates
# 2. Fast membership testing (O(1))
# 3. Mathematical operations (union, intersection, etc.)
```

### Creating Sets

```python
# Empty set (NOT {}, that's a dictionary!)
empty = set()

# With elements
numbers = {1, 2, 3, 4, 5}
mixed = {1, "hello", 3.14, True}  # Can't contain mutable types

# From list (removes duplicates)
unique = set([1, 2, 2, 3, 3, 4])  # {1, 2, 3, 4}

# From string
chars = set("hello")  # {'h', 'e', 'l', 'o'} - no duplicate 'l'

# Set comprehension
squares = {x**2 for x in range(5)}  # {0, 1, 4, 9, 16}
```

### Set Methods

```python
numbers = {1, 2, 3}

# Adding elements
numbers.add(4)              # {1, 2, 3, 4}
numbers.update([5, 6, 7])   # {1, 2, 3, 4, 5, 6, 7}

# Removing elements
numbers.remove(3)           # {1, 2, 4, 5, 6, 7} (raises KeyError if not found)
numbers.discard(10)         # No error if not found
popped = numbers.pop()      # Remove and return arbitrary element
numbers.clear()             # Empty set

# Copy
numbers = {1, 2, 3}
copy_set = numbers.copy()
```

### Set Operations

```python
a = {1, 2, 3, 4, 5}
b = {4, 5, 6, 7, 8}

# Union (all elements from both sets)
print(a | b)                # {1, 2, 3, 4, 5, 6, 7, 8}
print(a.union(b))

# Intersection (common elements)
print(a & b)                # {4, 5}
print(a.intersection(b))

# Difference (in a but not in b)
print(a - b)                # {1, 2, 3}
print(a.difference(b))

# Symmetric Difference (in a or b, but not both)
print(a ^ b)                # {1, 2, 3, 6, 7, 8}
print(a.symmetric_difference(b))

# Subset and Superset
print({1, 2}.issubset({1, 2, 3}))        # True
print({1, 2, 3}.issuperset({1, 2}))      # True
print({1, 2}.isdisjoint({3, 4}))         # True (no common elements)
```

### Visual Representation

```
Set Operations:
               ┌─────────────┐
    A          │      A ∩ B  │         B
  ┌────────────┼─────────────┼────────────┐
  │            │             │            │
  │    A - B   │   (4, 5)    │   B - A    │
  │  (1,2,3)   │             │  (6,7,8)   │
  │            │             │            │
  └────────────┴─────────────┴────────────┘

A ∪ B (Union): {1, 2, 3, 4, 5, 6, 7, 8}
A ∩ B (Intersection): {4, 5}
A - B (Difference): {1, 2, 3}
A △ B (Symmetric Difference): {1, 2, 3, 6, 7, 8}
```

### Real-World Example: Tag Management

```python
def find_common_tags(user1_posts, user2_posts):
    """Find common tags between two users' posts"""

    user1_tags = set()
    user2_tags = set()

    for post in user1_posts:
        user1_tags.update(post['tags'])

    for post in user2_posts:
        user2_tags.update(post['tags'])

    common = user1_tags & user2_tags
    unique_to_user1 = user1_tags - user2_tags
    unique_to_user2 = user2_tags - user1_tags

    return {
        'common': common,
        'unique_user1': unique_to_user1,
        'unique_user2': unique_to_user2
    }

# Sample data
user1_posts = [
    {'title': 'Post 1', 'tags': ['python', 'data-science', 'ml']},
    {'title': 'Post 2', 'tags': ['python', 'web-dev']}
]

user2_posts = [
    {'title': 'Post A', 'tags': ['python', 'ml', 'ai']},
    {'title': 'Post B', 'tags': ['javascript', 'web-dev']}
]

result = find_common_tags(user1_posts, user2_posts)
print(result)
# {
#     'common': {'python', 'web-dev', 'ml'},
#     'unique_user1': {'data-science'},
#     'unique_user2': {'ai', 'javascript'}
# }
```

### Frozen Sets (Immutable Sets)

```python
# Frozen sets are immutable sets
fs = frozenset([1, 2, 3])

# Can be used as dictionary keys or set elements
data = {
    frozenset([1, 2]): "A",
    frozenset([3, 4]): "B"
}

# Cannot modify
# fs.add(4)  # AttributeError!
```

---

## Dictionaries

Dictionaries are **unordered (ordered from Python 3.7+), mutable, key-value pairs**.

```python
# Why use dictionaries?
# 1. Fast lookup by key (O(1))
# 2. Store related data together
# 3. Represent structured data
```

### Creating Dictionaries

```python
# Empty dictionary
empty = {}
empty = dict()

# With key-value pairs
student = {
    'name': 'Alice',
    'age': 20,
    'major': 'Computer Science'
}

# Using dict()
student = dict(name='Alice', age=20, major='CS')

# From list of tuples
pairs = [('name', 'Alice'), ('age', 20)]
student = dict(pairs)

# Dictionary comprehension
squares = {x: x**2 for x in range(5)}  # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# Nested dictionary
students = {
    'S001': {'name': 'Alice', 'age': 20},
    'S002': {'name': 'Bob', 'age': 22}
}
```

### Accessing Elements

```python
student = {'name': 'Alice', 'age': 20, 'major': 'CS'}

# Direct access
print(student['name'])      # 'Alice'
# print(student['grade'])   # KeyError!

# Using get() (safer)
print(student.get('name'))          # 'Alice'
print(student.get('grade'))         # None
print(student.get('grade', 'N/A'))  # 'N/A' (default value)

# Check if key exists
print('name' in student)            # True
print('grade' not in student)       # True
```

### Dictionary Methods

```python
student = {'name': 'Alice', 'age': 20}

# Adding/Updating
student['major'] = 'CS'             # Add new key
student['age'] = 21                 # Update existing key
student.update({'gpa': 3.8, 'year': 3})  # Update multiple

# Removing
value = student.pop('gpa')          # Remove and return value
value = student.pop('grade', None)  # No error if key doesn't exist
key, value = student.popitem()      # Remove and return last item
del student['age']                  # Remove key
student.clear()                     # Remove all items

# Views
student = {'name': 'Alice', 'age': 20, 'major': 'CS'}
keys = student.keys()               # dict_keys(['name', 'age', 'major'])
values = student.values()           # dict_values(['Alice', 20, 'CS'])
items = student.items()             # dict_items([('name', 'Alice'), ...])

# Copy
copy_dict = student.copy()
```

### Iterating Over Dictionaries

```python
student = {'name': 'Alice', 'age': 20, 'major': 'CS'}

# Iterate over keys
for key in student:
    print(key)

for key in student.keys():
    print(key)

# Iterate over values
for value in student.values():
    print(value)

# Iterate over key-value pairs
for key, value in student.items():
    print(f"{key}: {value}")

# name: Alice
# age: 20
# major: CS
```

### Dictionary Comprehensions

```python
# Basic
squares = {x: x**2 for x in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# With condition
even_squares = {x: x**2 for x in range(10) if x % 2 == 0}
# {0: 0, 2: 4, 4: 16, 6: 36, 8: 64}

# Swap keys and values
original = {'a': 1, 'b': 2, 'c': 3}
swapped = {v: k for k, v in original.items()}
# {1: 'a', 2: 'b', 3: 'c'}

# From two lists
keys = ['name', 'age', 'major']
values = ['Alice', 20, 'CS']
student = {k: v for k, v in zip(keys, values)}
# {'name': 'Alice', 'age': 20, 'major': 'CS'}
```

### defaultdict

```python
from collections import defaultdict

# Regular dict
word_count = {}
for word in ['apple', 'banana', 'apple']:
    if word not in word_count:
        word_count[word] = 0
    word_count[word] += 1

# With defaultdict (cleaner)
word_count = defaultdict(int)  # Default value: 0
for word in ['apple', 'banana', 'apple']:
    word_count[word] += 1

print(dict(word_count))  # {'apple': 2, 'banana': 1}

# Other default factories
from collections import defaultdict

# Default: empty list
groups = defaultdict(list)
groups['fruits'].append('apple')
groups['fruits'].append('banana')
# {'fruits': ['apple', 'banana']}

# Default: empty set
tags = defaultdict(set)
tags['post1'].add('python')
tags['post1'].add('python')  # Duplicates ignored
# {'post1': {'python'}}
```

### Counter

```python
from collections import Counter

# Count occurrences
words = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple']
count = Counter(words)
print(count)  # Counter({'apple': 3, 'banana': 2, 'cherry': 1})

# Most common
print(count.most_common(2))  # [('apple', 3), ('banana', 2)]

# Arithmetic operations
c1 = Counter(['a', 'b', 'c', 'a'])
c2 = Counter(['a', 'b', 'd'])
print(c1 + c2)  # Counter({'a': 3, 'b': 2, 'c': 1, 'd': 1})
print(c1 - c2)  # Counter({'a': 1, 'c': 1})
```

### Real-World Example: Student Management System

```python
class StudentDatabase:
    def __init__(self):
        self.students = {}

    def add_student(self, student_id, name, grades):
        self.students[student_id] = {
            'name': name,
            'grades': grades
        }

    def get_average(self, student_id):
        if student_id not in self.students:
            return None
        grades = self.students[student_id]['grades']
        return sum(grades) / len(grades) if grades else 0

    def get_top_students(self, n=3):
        """Get top n students by average grade"""
        averages = {
            sid: self.get_average(sid)
            for sid in self.students
        }
        sorted_students = sorted(
            averages.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return sorted_students[:n]

    def get_subject_stats(self):
        """Get statistics for each subject"""
        from collections import defaultdict
        subject_grades = defaultdict(list)

        for student in self.students.values():
            for subject, grade in student['grades'].items():
                subject_grades[subject].append(grade)

        stats = {}
        for subject, grades in subject_grades.items():
            stats[subject] = {
                'average': sum(grades) / len(grades),
                'max': max(grades),
                'min': min(grades)
            }
        return stats

# Usage
db = StudentDatabase()
db.add_student('S001', 'Alice', {'Math': 85, 'Science': 90, 'English': 88})
db.add_student('S002', 'Bob', {'Math': 78, 'Science': 82, 'English': 85})
db.add_student('S003', 'Charlie', {'Math': 92, 'Science': 88, 'English': 90})

print(f"Alice's average: {db.get_average('S001'):.2f}")
print(f"Top students: {db.get_top_students(2)}")
print(f"Subject stats: {db.get_subject_stats()}")
```

---

## Comparison Table

| Feature | List | Tuple | Set | Dictionary |
|---------|------|-------|-----|------------|
| **Syntax** | `[1, 2, 3]` | `(1, 2, 3)` | `{1, 2, 3}` | `{'a': 1}` |
| **Ordered** | ✓ | ✓ | ✗ | ✓ (3.7+) |
| **Mutable** | ✓ | ✗ | ✓ | ✓ |
| **Duplicates** | ✓ | ✓ | ✗ | Keys: ✗, Values: ✓ |
| **Indexing** | ✓ | ✓ | ✗ | By key |
| **Use Case** | Collections | Immutable data | Unique items | Key-value pairs |
| **Speed (lookup)** | O(n) | O(n) | O(1) | O(1) |

### When to Use What?

```python
# List: When you need ordered, modifiable collection
shopping_list = ['milk', 'bread', 'eggs']

# Tuple: When you need immutable data (protection)
coordinates = (10.5, 20.3)
rgb_color = (255, 128, 0)

# Set: When you need unique items or set operations
unique_visitors = {'user1', 'user2', 'user3'}
tags = {'python', 'programming', 'tutorial'}

# Dictionary: When you need key-value associations
user = {'name': 'Alice', 'email': 'alice@example.com'}
```

---

## Common Pitfalls

### 1. Mutable Default Arguments (Lists)

```python
# ❌ Wrong
def add_student(name, courses=[]):
    courses.append(name)
    return courses

print(add_student('Alice'))  # ['Alice']
print(add_student('Bob'))    # ['Alice', 'Bob'] - Unexpected!

# ✓ Correct
def add_student(name, courses=None):
    if courses is None:
        courses = []
    courses.append(name)
    return courses
```

### 2. Dictionary Key Requirements

```python
# Keys must be immutable
valid = {
    'string': 1,
    42: 2,
    (1, 2): 3,  # Tuple is immutable
    frozenset([1, 2]): 4
}

# ❌ Invalid keys
# invalid = {
#     [1, 2]: 1,      # List is mutable
#     {1, 2}: 2,      # Set is mutable
#     {'a': 1}: 3     # Dict is mutable
# }
```

### 3. Copying Collections

```python
# Shallow copy
original = [1, 2, [3, 4]]
copy = original.copy()  # or original[:]
copy[2].append(5)
print(original)  # [1, 2, [3, 4, 5]] - Nested list modified!

# Deep copy
import copy
original = [1, 2, [3, 4]]
deep = copy.deepcopy(original)
deep[2].append(5)
print(original)  # [1, 2, [3, 4]] - Unchanged!
```

### 4. Modifying List While Iterating

```python
# ❌ Wrong
numbers = [1, 2, 3, 4, 5]
for num in numbers:
    if num % 2 == 0:
        numbers.remove(num)  # Modifying while iterating!

# ✓ Correct: Use list comprehension
numbers = [1, 2, 3, 4, 5]
numbers = [num for num in numbers if num % 2 != 0]
```

### 5. Set Order

```python
# Sets are unordered (before Python 3.7)
s = {3, 1, 4, 1, 5, 9, 2}
print(s)  # {1, 2, 3, 4, 5, 9} - Order not guaranteed!

# Don't rely on set order for critical operations
```

---

## Interview Questions

### Q1: How to remove duplicates from a list while preserving order?

```python
# Method 1: Using dict (Python 3.7+)
items = [1, 2, 2, 3, 4, 3, 5]
unique = list(dict.fromkeys(items))
# [1, 2, 3, 4, 5]

# Method 2: Using set (doesn't preserve order)
unique = list(set(items))

# Method 3: Manual
unique = []
for item in items:
    if item not in unique:
        unique.append(item)
```

### Q2: What is the output?

```python
d = {'a': 1, 'b': 2}
d['c'] = d.pop('a')
print(d)
```

**Answer:** `{'b': 2, 'c': 1}` - Removes 'a', adds 'c' with value 1.

### Q3: Flatten a nested list

```python
nested = [[1, 2], [3, 4], [5, 6]]

# Method 1: List comprehension
flat = [item for sublist in nested for item in sublist]

# Method 2: itertools
from itertools import chain
flat = list(chain.from_iterable(nested))

# Method 3: sum
flat = sum(nested, [])
```

### Q4: Merge two dictionaries

```python
dict1 = {'a': 1, 'b': 2}
dict2 = {'b': 3, 'c': 4}

# Method 1: Python 3.9+
merged = dict1 | dict2  # {'a': 1, 'b': 3, 'c': 4}

# Method 2: Unpacking
merged = {**dict1, **dict2}

# Method 3: update()
merged = dict1.copy()
merged.update(dict2)
```

### Q5: Find common elements in multiple lists

```python
list1 = [1, 2, 3, 4, 5]
list2 = [4, 5, 6, 7, 8]
list3 = [5, 6, 7, 8, 9]

common = set(list1) & set(list2) & set(list3)
print(common)  # {5}
```

---

## Practice Problems

1. **Two Sum**: Given a list and a target, find two numbers that add up to the target.

2. **Group Anagrams**: Group words that are anagrams of each other.

3. **Top K Frequent Elements**: Find k most frequent elements in a list.

4. **Intersection of Three Lists**: Find common elements in three sorted lists.

5. **Dictionary Sorting**: Sort a dictionary by values in descending order.

---

**End of Data Types - Happy Learning! 🐍**
