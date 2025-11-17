# Object-Oriented Programming (OOP)

## Table of Contents
1. [OOP Concepts](#oop-concepts)
2. [Classes and Objects](#classes-and-objects)
3. [Encapsulation](#encapsulation)
4. [Inheritance](#inheritance)
5. [Polymorphism](#polymorphism)
6. [Abstraction](#abstraction)
7. [Special Methods](#special-methods)
8. [Property Decorators](#property-decorators)
9. [Common Pitfalls](#common-pitfalls)
10. [Interview Questions](#interview-questions)

---

## OOP Concepts

**Object-Oriented Programming** organizes code around objects and classes.

```
┌────────────────────────────────────────┐
│     Four Pillars of OOP                │
├────────────────────────────────────────┤
│  1. Encapsulation                      │
│     - Bundle data and methods          │
│     - Hide internal details            │
│                                        │
│  2. Inheritance                        │
│     - Reuse code from parent class     │
│     - Create specialized classes       │
│                                        │
│  3. Polymorphism                       │
│     - Same interface, different forms  │
│     - Method overriding                │
│                                        │
│  4. Abstraction                        │
│     - Hide complex implementation      │
│     - Show only essential features     │
└────────────────────────────────────────┘
```

---

## Classes and Objects

### Basic Class Structure

```python
# Define a class
class Dog:
    """A simple Dog class"""

    # Class attribute (shared by all instances)
    species = "Canis familiaris"

    # Constructor (initializer)
    def __init__(self, name, age):
        # Instance attributes (unique to each instance)
        self.name = name
        self.age = age

    # Instance method
    def bark(self):
        return f"{self.name} says Woof!"

    # Instance method with parameters
    def celebrate_birthday(self):
        self.age += 1
        return f"{self.name} is now {self.age} years old!"

# Create objects (instances)
dog1 = Dog("Buddy", 3)
dog2 = Dog("Max", 5)

# Access attributes
print(dog1.name)        # Buddy
print(dog1.species)     # Canis familiaris

# Call methods
print(dog1.bark())      # Buddy says Woof!
dog1.celebrate_birthday()
print(dog1.age)         # 4
```

### Class vs Instance Attributes

```python
class Counter:
    # Class attribute (shared across all instances)
    total_count = 0

    def __init__(self, name):
        # Instance attribute (unique to each instance)
        self.name = name
        self.count = 0
        Counter.total_count += 1

    def increment(self):
        self.count += 1

# Create instances
c1 = Counter("Counter1")
c2 = Counter("Counter2")

c1.increment()
c1.increment()
c2.increment()

print(f"{c1.name}: {c1.count}")        # Counter1: 2
print(f"{c2.name}: {c2.count}")        # Counter2: 1
print(f"Total counters: {Counter.total_count}")  # Total counters: 2
```

### Class Methods and Static Methods

```python
class Pizza:
    def __init__(self, size, toppings):
        self.size = size
        self.toppings = toppings

    # Instance method (has access to self)
    def describe(self):
        return f"{self.size} pizza with {', '.join(self.toppings)}"

    # Class method (has access to cls, not self)
    @classmethod
    def margherita(cls, size):
        """Factory method to create Margherita pizza"""
        return cls(size, ["mozzarella", "tomato", "basil"])

    @classmethod
    def pepperoni(cls, size):
        """Factory method to create Pepperoni pizza"""
        return cls(size, ["mozzarella", "pepperoni"])

    # Static method (no access to cls or self)
    @staticmethod
    def is_valid_size(size):
        """Check if pizza size is valid"""
        return size in ["small", "medium", "large"]

# Using instance method
p1 = Pizza("large", ["cheese", "mushroom"])
print(p1.describe())

# Using class methods (factory pattern)
p2 = Pizza.margherita("medium")
print(p2.describe())  # medium pizza with mozzarella, tomato, basil

# Using static method
print(Pizza.is_valid_size("medium"))  # True
print(Pizza.is_valid_size("extra"))   # False
```

### Real-World Example: Bank Account

```python
class BankAccount:
    """Represents a bank account"""

    # Class attribute
    bank_name = "MyBank"
    interest_rate = 0.03

    def __init__(self, account_number, owner, balance=0):
        self.account_number = account_number
        self.owner = owner
        self.balance = balance
        self.transactions = []

    def deposit(self, amount):
        """Deposit money into account"""
        if amount <= 0:
            return "Invalid amount"
        self.balance += amount
        self.transactions.append(f"Deposited: ₹{amount}")
        return f"Deposited ₹{amount}. New balance: ₹{self.balance}"

    def withdraw(self, amount):
        """Withdraw money from account"""
        if amount <= 0:
            return "Invalid amount"
        if amount > self.balance:
            return "Insufficient funds"
        self.balance -= amount
        self.transactions.append(f"Withdrawn: ₹{amount}")
        return f"Withdrawn ₹{amount}. New balance: ₹{self.balance}"

    def get_balance(self):
        """Get current balance"""
        return f"Current balance: ₹{self.balance}"

    def get_statement(self):
        """Get account statement"""
        statement = f"\n{self.bank_name} - Account Statement"
        statement += f"\nAccount: {self.account_number}"
        statement += f"\nOwner: {self.owner}"
        statement += f"\n{'-' * 40}"
        for transaction in self.transactions:
            statement += f"\n{transaction}"
        statement += f"\n{'-' * 40}"
        statement += f"\nCurrent Balance: ₹{self.balance}"
        return statement

    @classmethod
    def from_dict(cls, data):
        """Create account from dictionary"""
        return cls(
            data['account_number'],
            data['owner'],
            data.get('balance', 0)
        )

# Usage
account = BankAccount("ACC001", "Alice", 1000)
print(account.deposit(500))
print(account.withdraw(200))
print(account.get_statement())
```

---

## Encapsulation

Encapsulation bundles data and methods, restricting direct access to some components.

### Public, Protected, and Private

```python
class Employee:
    def __init__(self, name, salary):
        self.name = name              # Public
        self._department = "IT"       # Protected (convention)
        self.__salary = salary        # Private (name mangling)

    # Public method
    def get_info(self):
        return f"{self.name} - {self._department}"

    # Private method
    def __calculate_bonus(self):
        return self.__salary * 0.1

    # Public method accessing private
    def get_total_compensation(self):
        return self.__salary + self.__calculate_bonus()

# Usage
emp = Employee("Alice", 50000)

# Public - accessible
print(emp.name)           # Alice

# Protected - accessible but shouldn't be used
print(emp._department)    # IT (works, but not recommended)

# Private - not directly accessible
# print(emp.__salary)     # AttributeError!

# Access through public method
print(emp.get_total_compensation())  # 55000.0

# Name mangling allows access (but don't do this!)
print(emp._Employee__salary)  # 50000 (works, but defeats purpose)
```

### Getters and Setters

```python
class Temperature:
    def __init__(self, celsius):
        self.__celsius = celsius

    # Getter
    def get_celsius(self):
        return self.__celsius

    # Setter with validation
    def set_celsius(self, value):
        if value < -273.15:
            raise ValueError("Temperature below absolute zero!")
        self.__celsius = value

    # Computed property
    def get_fahrenheit(self):
        return (self.__celsius * 9/5) + 32

    def set_fahrenheit(self, value):
        self.__celsius = (value - 32) * 5/9

# Usage
temp = Temperature(25)
print(temp.get_celsius())      # 25
print(temp.get_fahrenheit())   # 77.0

temp.set_celsius(30)
print(temp.get_celsius())      # 30

# temp.set_celsius(-300)  # ValueError!
```

---

## Inheritance

Inheritance allows a class to inherit attributes and methods from another class.

```
┌─────────────────────┐
│   Parent Class      │
│   (Base/Super)      │
└──────────┬──────────┘
           │
           │ inherits
           │
           ▼
┌─────────────────────┐
│   Child Class       │
│   (Derived/Sub)     │
└─────────────────────┘
```

### Basic Inheritance

```python
# Parent class
class Animal:
    def __init__(self, name, species):
        self.name = name
        self.species = species

    def make_sound(self):
        return "Some generic sound"

    def info(self):
        return f"{self.name} is a {self.species}"

# Child class
class Dog(Animal):
    def __init__(self, name, breed):
        # Call parent constructor
        super().__init__(name, "Dog")
        self.breed = breed

    # Override parent method
    def make_sound(self):
        return "Woof!"

    # Add new method
    def fetch(self):
        return f"{self.name} is fetching!"

# Another child class
class Cat(Animal):
    def __init__(self, name, color):
        super().__init__(name, "Cat")
        self.color = color

    def make_sound(self):
        return "Meow!"

# Usage
dog = Dog("Buddy", "Golden Retriever")
cat = Cat("Whiskers", "Orange")

print(dog.info())         # Buddy is a Dog (inherited)
print(dog.make_sound())   # Woof! (overridden)
print(dog.fetch())        # Buddy is fetching! (new method)

print(cat.info())         # Whiskers is a Cat
print(cat.make_sound())   # Meow!
```

### Multiple Inheritance

```python
class Flyer:
    def fly(self):
        return "Flying in the sky!"

class Swimmer:
    def swim(self):
        return "Swimming in water!"

class Duck(Flyer, Swimmer):
    def quack(self):
        return "Quack quack!"

# Duck inherits from both Flyer and Swimmer
duck = Duck()
print(duck.fly())    # Flying in the sky!
print(duck.swim())   # Swimming in water!
print(duck.quack())  # Quack quack!
```

### Method Resolution Order (MRO)

```python
class A:
    def method(self):
        return "A"

class B(A):
    def method(self):
        return "B"

class C(A):
    def method(self):
        return "C"

class D(B, C):
    pass

# MRO: D → B → C → A → object
print(D.mro())
# [<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>]

d = D()
print(d.method())  # B (first in MRO after D)
```

### Real-World Example: Employee Hierarchy

```python
class Employee:
    """Base Employee class"""

    def __init__(self, name, employee_id, salary):
        self.name = name
        self.employee_id = employee_id
        self.salary = salary

    def get_details(self):
        return f"ID: {self.employee_id}, Name: {self.name}"

    def calculate_salary(self):
        return self.salary

class Developer(Employee):
    """Developer with programming skills"""

    def __init__(self, name, employee_id, salary, programming_languages):
        super().__init__(name, employee_id, salary)
        self.programming_languages = programming_languages

    def get_details(self):
        base = super().get_details()
        langs = ", ".join(self.programming_languages)
        return f"{base}, Languages: {langs}"

    def calculate_salary(self):
        # Developers get 10% bonus
        return self.salary * 1.1

class Manager(Employee):
    """Manager with team"""

    def __init__(self, name, employee_id, salary, team_size):
        super().__init__(name, employee_id, salary)
        self.team_size = team_size

    def get_details(self):
        base = super().get_details()
        return f"{base}, Team Size: {self.team_size}"

    def calculate_salary(self):
        # Managers get 20% bonus
        return self.salary * 1.2

# Usage
dev = Developer("Alice", "E001", 50000, ["Python", "JavaScript"])
mgr = Manager("Bob", "M001", 70000, 5)

print(dev.get_details())
print(f"Salary: ₹{dev.calculate_salary():,.2f}")

print(mgr.get_details())
print(f"Salary: ₹{mgr.calculate_salary():,.2f}")
```

---

## Polymorphism

Polymorphism allows objects of different classes to be treated through the same interface.

### Method Overriding

```python
class Shape:
    def area(self):
        pass

    def perimeter(self):
        pass

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return 3.14159 * self.radius ** 2

    def perimeter(self):
        return 2 * 3.14159 * self.radius

# Polymorphism in action
shapes = [
    Rectangle(5, 10),
    Circle(7),
    Rectangle(3, 4)
]

for shape in shapes:
    print(f"Area: {shape.area():.2f}, Perimeter: {shape.perimeter():.2f}")
```

### Duck Typing

```python
# If it walks like a duck and quacks like a duck, it's a duck

class Duck:
    def swim(self):
        return "Duck swimming"

    def fly(self):
        return "Duck flying"

class Airplane:
    def fly(self):
        return "Airplane flying"

class Whale:
    def swim(self):
        return "Whale swimming"

# Function that works with any object that can fly
def make_it_fly(thing):
    return thing.fly()

# Function that works with any object that can swim
def make_it_swim(thing):
    return thing.swim()

duck = Duck()
plane = Airplane()
whale = Whale()

print(make_it_fly(duck))    # Duck flying
print(make_it_fly(plane))   # Airplane flying
print(make_it_swim(duck))   # Duck swimming
print(make_it_swim(whale))  # Whale swimming
# print(make_it_fly(whale)) # AttributeError!
```

### Operator Overloading

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        """Overload + operator"""
        return Vector(self.x + other.x, self.y + other.y)

    def __sub__(self, other):
        """Overload - operator"""
        return Vector(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar):
        """Overload * operator for scalar multiplication"""
        return Vector(self.x * scalar, self.y * scalar)

    def __str__(self):
        """String representation"""
        return f"Vector({self.x}, {self.y})"

    def __eq__(self, other):
        """Overload == operator"""
        return self.x == other.x and self.y == other.y

# Usage
v1 = Vector(2, 3)
v2 = Vector(5, 7)

print(v1 + v2)    # Vector(7, 10)
print(v2 - v1)    # Vector(3, 4)
print(v1 * 3)     # Vector(6, 9)
print(v1 == v2)   # False
```

---

## Abstraction

Abstraction hides complex implementation details and shows only essential features.

### Abstract Base Classes

```python
from abc import ABC, abstractmethod

class Vehicle(ABC):
    """Abstract base class for vehicles"""

    def __init__(self, brand, model):
        self.brand = brand
        self.model = model

    @abstractmethod
    def start_engine(self):
        """Must be implemented by subclass"""
        pass

    @abstractmethod
    def stop_engine(self):
        """Must be implemented by subclass"""
        pass

    def get_info(self):
        """Concrete method (can be used as-is)"""
        return f"{self.brand} {self.model}"

class Car(Vehicle):
    def start_engine(self):
        return "Car engine started with key"

    def stop_engine(self):
        return "Car engine stopped"

class Motorcycle(Vehicle):
    def start_engine(self):
        return "Motorcycle engine started with button"

    def stop_engine(self):
        return "Motorcycle engine stopped"

# Cannot instantiate abstract class
# vehicle = Vehicle("Generic", "Model")  # TypeError!

# Can instantiate concrete classes
car = Car("Toyota", "Camry")
bike = Motorcycle("Harley", "Davidson")

print(car.get_info())         # Toyota Camry
print(car.start_engine())     # Car engine started with key
print(bike.start_engine())    # Motorcycle engine started with button
```

### Interface Pattern

```python
from abc import ABC, abstractmethod

class PaymentProcessor(ABC):
    """Payment processor interface"""

    @abstractmethod
    def process_payment(self, amount):
        pass

    @abstractmethod
    def refund(self, transaction_id):
        pass

class StripeProcessor(PaymentProcessor):
    def process_payment(self, amount):
        return f"Processing ₹{amount} via Stripe"

    def refund(self, transaction_id):
        return f"Refunding transaction {transaction_id} via Stripe"

class PayPalProcessor(PaymentProcessor):
    def process_payment(self, amount):
        return f"Processing ₹{amount} via PayPal"

    def refund(self, transaction_id):
        return f"Refunding transaction {transaction_id} via PayPal"

# Payment gateway that works with any processor
class PaymentGateway:
    def __init__(self, processor: PaymentProcessor):
        self.processor = processor

    def make_payment(self, amount):
        return self.processor.process_payment(amount)

    def make_refund(self, transaction_id):
        return self.processor.refund(transaction_id)

# Usage
stripe_gateway = PaymentGateway(StripeProcessor())
paypal_gateway = PaymentGateway(PayPalProcessor())

print(stripe_gateway.make_payment(100))
print(paypal_gateway.make_payment(200))
```

---

## Special Methods

Special methods (magic methods) allow classes to interact with Python's built-in functions.

```python
class Book:
    def __init__(self, title, author, pages):
        self.title = title
        self.author = author
        self.pages = pages

    def __str__(self):
        """String representation for users"""
        return f"'{self.title}' by {self.author}"

    def __repr__(self):
        """String representation for developers"""
        return f"Book('{self.title}', '{self.author}', {self.pages})"

    def __len__(self):
        """Return length (number of pages)"""
        return self.pages

    def __eq__(self, other):
        """Check equality"""
        return (self.title == other.title and
                self.author == other.author)

    def __lt__(self, other):
        """Less than comparison (by pages)"""
        return self.pages < other.pages

    def __add__(self, other):
        """Add pages together"""
        return self.pages + other.pages

    def __getitem__(self, key):
        """Make object subscriptable"""
        if key == 'title':
            return self.title
        elif key == 'author':
            return self.author
        elif key == 'pages':
            return self.pages
        raise KeyError(key)

# Usage
book1 = Book("Python Basics", "John Doe", 300)
book2 = Book("Advanced Python", "Jane Smith", 450)

print(book1)              # 'Python Basics' by John Doe (__str__)
print(repr(book1))        # Book('Python Basics', 'John Doe', 300) (__repr__)
print(len(book1))         # 300 (__len__)
print(book1 == book2)     # False (__eq__)
print(book1 < book2)      # True (__lt__)
print(book1 + book2)      # 750 (__add__)
print(book1['title'])     # Python Basics (__getitem__)
```

### Common Special Methods

```python
# Initialization and Representation
__init__(self, ...)      # Constructor
__str__(self)            # str(obj) - user-friendly
__repr__(self)           # repr(obj) - developer-friendly

# Comparison Operators
__eq__(self, other)      # ==
__ne__(self, other)      # !=
__lt__(self, other)      # <
__le__(self, other)      # <=
__gt__(self, other)      # >
__ge__(self, other)      # >=

# Arithmetic Operators
__add__(self, other)     # +
__sub__(self, other)     # -
__mul__(self, other)     # *
__truediv__(self, other) # /
__floordiv__(self, other)# //
__mod__(self, other)     # %
__pow__(self, other)     # **

# Container Methods
__len__(self)            # len(obj)
__getitem__(self, key)   # obj[key]
__setitem__(self, key, value)  # obj[key] = value
__delitem__(self, key)   # del obj[key]
__contains__(self, item) # item in obj

# Context Managers
__enter__(self)          # with obj:
__exit__(self, ...)      # Cleanup

# Callable Objects
__call__(self, ...)      # obj()
```

---

## Property Decorators

Properties provide a way to customize attribute access.

```python
class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius

    @property
    def celsius(self):
        """Get temperature in Celsius"""
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        """Set temperature in Celsius with validation"""
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

    @property
    def kelvin(self):
        """Get temperature in Kelvin"""
        return self._celsius + 273.15

# Usage (looks like attributes, but uses methods)
temp = Temperature(25)

print(temp.celsius)      # 25 (calls getter)
print(temp.fahrenheit)   # 77.0 (calculated)
print(temp.kelvin)       # 298.15 (calculated)

temp.celsius = 30        # Calls setter with validation
print(temp.celsius)      # 30

temp.fahrenheit = 86     # Sets via Fahrenheit
print(temp.celsius)      # 30.0

# temp.celsius = -300    # ValueError!
```

### Read-Only Properties

```python
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        """Radius (read-only)"""
        return self._radius

    @property
    def diameter(self):
        """Diameter (calculated, read-only)"""
        return self._radius * 2

    @property
    def area(self):
        """Area (calculated, read-only)"""
        return 3.14159 * self._radius ** 2

# Usage
circle = Circle(5)
print(circle.radius)     # 5
print(circle.diameter)   # 10
print(circle.area)       # 78.53975

# circle.area = 100      # AttributeError! (no setter)
```

---

## Common Pitfalls

### 1. Mutable Class Attributes

```python
# ❌ Wrong
class MyClass:
    items = []  # Shared by all instances!

    def add_item(self, item):
        self.items.append(item)

obj1 = MyClass()
obj2 = MyClass()

obj1.add_item(1)
print(obj2.items)  # [1] - Unexpected!

# ✓ Correct
class MyClass:
    def __init__(self):
        self.items = []  # Unique to each instance
```

### 2. Forgetting self

```python
# ❌ Wrong
class MyClass:
    def method():  # Missing self!
        pass

# ✓ Correct
class MyClass:
    def method(self):
        pass
```

### 3. Direct Attribute Access in Properties

```python
# ❌ Wrong (infinite recursion!)
class MyClass:
    @property
    def value(self):
        return self.value  # Calls itself!

# ✓ Correct
class MyClass:
    @property
    def value(self):
        return self._value  # Use different name
```

---

## Interview Questions

### Q1: What's the difference between __str__ and __repr__?

**Answer:**
- `__str__`: User-friendly representation (for end users)
- `__repr__`: Developer-friendly representation (for debugging)

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return f"({self.x}, {self.y})"

    def __repr__(self):
        return f"Point({self.x}, {self.y})"

p = Point(3, 4)
print(str(p))   # (3, 4)
print(repr(p))  # Point(3, 4)
```

### Q2: What is Method Resolution Order (MRO)?

**Answer:** MRO determines the order in which base classes are searched when executing a method. Python uses C3 linearization algorithm.

```python
class A: pass
class B(A): pass
class C(A): pass
class D(B, C): pass

print(D.mro())  # [D, B, C, A, object]
```

### Q3: Implement a singleton class

```python
class Singleton:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

s1 = Singleton()
s2 = Singleton()
print(s1 is s2)  # True (same instance)
```

### Q4: What's the difference between class method and static method?

**Answer:**
- **Class method**: Takes `cls` as first parameter, can access class state
- **Static method**: Takes no special first parameter, can't access class/instance state

```python
class MyClass:
    @classmethod
    def class_method(cls):
        return "Has access to cls"

    @staticmethod
    def static_method():
        return "No access to cls or self"
```

### Q5: Implement operator overloading for complex numbers

```python
class Complex:
    def __init__(self, real, imag):
        self.real = real
        self.imag = imag

    def __add__(self, other):
        return Complex(
            self.real + other.real,
            self.imag + other.imag
        )

    def __str__(self):
        return f"{self.real} + {self.imag}i"

c1 = Complex(1, 2)
c2 = Complex(3, 4)
print(c1 + c2)  # 4 + 6i
```

---

## Practice Problems

1. **Create a class hierarchy** for different types of vehicles (Car, Bike, Truck) with common and specific attributes.

2. **Implement a Stack class** with push, pop, and peek methods using encapsulation.

3. **Design a Shape hierarchy** with abstract base class and concrete implementations.

4. **Create a BankAccount class** with properties for balance validation.

5. **Implement a singleton logger class** that writes to a file.

---

**End of OOP - Happy Learning! 🐍**
