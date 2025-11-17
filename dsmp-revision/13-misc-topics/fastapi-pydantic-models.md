# FastAPI: Request and Response Models with Pydantic

## What You'll Learn

Discover how Pydantic transforms data validation from a tedious chore into an elegant, automatic process. Learn to create type-safe APIs where invalid data never reaches your business logic, and your documentation writes itself. Master the art of building robust data models that catch errors before they become problems.

## Why Pydantic Changes Everything

Traditional APIs require manual validation for every field, every endpoint. Miss one check, and invalid data corrupts your database. Pydantic eliminates this entire class of bugs by making validation automatic, comprehensive, and declarative.

```python
# Without Pydantic (Flask-style)
@app.post("/users/")
def create_user():
    data = request.get_json()

    # Manual validation - easy to forget or get wrong
    if 'email' not in data or '@' not in data['email']:
        return {"error": "Invalid email"}, 400
    if 'age' not in data or not isinstance(data['age'], int):
        return {"error": "Invalid age"}, 400
    if data['age'] < 0 or data['age'] > 150:
        return {"error": "Age out of range"}, 400
    # ... more validation ...

# With Pydantic (FastAPI)
from pydantic import BaseModel, EmailStr, Field

class User(BaseModel):
    email: EmailStr
    age: int = Field(..., ge=0, le=150)

@app.post("/users/")
def create_user(user: User):
    # All validation happens automatically!
    # Invalid data never reaches this code
    return user
```

## Building Your First Pydantic Model

### Basic Models

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

app = FastAPI()

class Item(BaseModel):
    name: str                      # Required field
    description: Optional[str] = None  # Optional field with default
    price: float                   # Will be converted to float
    tax: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.now)

@app.post("/items/")
def create_item(item: Item):
    # FastAPI automatically:
    # 1. Parses JSON request body
    # 2. Validates all fields
    # 3. Converts types (str to float, str to datetime)
    # 4. Returns 422 error if validation fails
    return item
```

### Field Validation with Constraints

Pydantic's `Field` function lets you add powerful constraints:

```python
from pydantic import BaseModel, Field

class Product(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    price: float = Field(..., gt=0, description="Price must be positive")
    quantity: int = Field(default=0, ge=0, le=1000)
    discount: float = Field(default=0, ge=0, le=1, description="Discount as decimal (0-1)")

    class Config:
        schema_extra = {
            "example": {
                "name": "Laptop",
                "price": 999.99,
                "quantity": 10,
                "discount": 0.15
            }
        }
```

**Common Field Validators:**
- `min_length`, `max_length` - String length constraints
- `gt`, `ge` - Greater than, greater than or equal (numbers)
- `lt`, `le` - Less than, less than or equal (numbers)
- `regex` - Pattern matching for strings
- `default` - Default value if not provided
- `default_factory` - Function to generate default
- `...` (Ellipsis) - Field is required

## Custom Validation

### Validator Decorators

```python
from pydantic import BaseModel, validator, EmailStr

class User(BaseModel):
    username: str
    email: EmailStr
    age: int
    password: str

    @validator('username')
    def username_alphanumeric(cls, v):
        if not v.isalnum():
            raise ValueError('Username must be alphanumeric')
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters')
        return v.lower()  # Normalize to lowercase

    @validator('age')
    def age_realistic(cls, v):
        if v < 0:
            raise ValueError('Age must be positive')
        if v > 150:
            raise ValueError('Age must be realistic')
        return v

    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain digit')
        return v
```

### Cross-Field Validation

```python
from pydantic import BaseModel, root_validator

class PasswordReset(BaseModel):
    password: str
    password_confirm: str

    @root_validator
    def passwords_match(cls, values):
        password = values.get('password')
        password_confirm = values.get('password_confirm')

        if password != password_confirm:
            raise ValueError('Passwords do not match')
        return values
```

## Nested Models

Real-world APIs often need complex, nested data structures. Pydantic handles this elegantly:

```python
from typing import List
from pydantic import BaseModel

class Image(BaseModel):
    url: str
    caption: str

class Tag(BaseModel):
    name: str
    color: str = "#000000"

class Product(BaseModel):
    name: str
    price: float
    images: List[Image] = []
    tags: List[Tag] = []

class Order(BaseModel):
    order_id: int
    products: List[Product]
    total: float
    customer_email: EmailStr

@app.post("/orders/")
def create_order(order: Order):
    # FastAPI validates entire nested structure
    return order
```

**Example valid request:**
```json
{
  "order_id": 1,
  "customer_email": "user@example.com",
  "products": [
    {
      "name": "Laptop",
      "price": 999.99,
      "images": [
        {"url": "http://example.com/img1.jpg", "caption": "Front view"},
        {"url": "http://example.com/img2.jpg", "caption": "Side view"}
      ],
      "tags": [
        {"name": "Electronics", "color": "#0000FF"}
      ]
    }
  ],
  "total": 999.99
}
```

## Response Models

Response models ensure your API returns consistent, documented data:

```python
from pydantic import BaseModel

class UserIn(BaseModel):
    username: str
    password: str
    email: str

class UserOut(BaseModel):
    username: str
    email: str
    # Notice: no password field!

    class Config:
        orm_mode = True  # Allows creating from ORM objects

@app.post("/users/", response_model=UserOut)
def create_user(user: UserIn):
    # Even if we accidentally include password in return,
    # FastAPI filters it out based on UserOut model
    return user
```

This pattern is crucial for security - sensitive fields never leak into responses.

## Model Configuration

```python
from pydantic import BaseModel

class Product(BaseModel):
    name: str
    price: float

    class Config:
        # Allow creating from ORM models
        orm_mode = True

        # Validate on assignment (not just creation)
        validate_assignment = True

        # Allow population by field name or alias
        allow_population_by_field_name = True

        # Example data for documentation
        schema_extra = {
            "example": {
                "name": "Laptop",
                "price": 999.99
            }
        }
```

## Validation Error Responses

When validation fails, FastAPI returns detailed 422 responses:

```python
# Request with invalid data:
{
    "name": "ab",  # Too short (min 3)
    "price": -10,  # Negative (must be > 0)
    "age": 200     # Too large (must be <= 150)
}

# Response (422 Unprocessable Entity):
{
    "detail": [
        {
            "loc": ["body", "name"],
            "msg": "ensure this value has at least 3 characters",
            "type": "value_error.any_str.min_length",
            "ctx": {"limit_value": 3}
        },
        {
            "loc": ["body", "price"],
            "msg": "ensure this value is greater than 0",
            "type": "value_error.number.not_gt",
            "ctx": {"limit_value": 0}
        },
        {
            "loc": ["body", "age"],
            "msg": "ensure this value is less than or equal to 150",
            "type": "value_error.number.not_le",
            "ctx": {"limit_value": 150}
        }
    ]
}
```

## Best Practices

**1. Use Specific Types**
```python
# Good
from pydantic import EmailStr, HttpUrl, UUID4

class User(BaseModel):
    email: EmailStr          # Validates email format
    website: HttpUrl         # Validates URL format
    id: UUID4                # Validates UUID format

# Avoid
class User(BaseModel):
    email: str  # No validation
```

**2. Separate Input and Output Models**
```python
# Input can have passwords
class UserCreate(BaseModel):
    email: str
    password: str

# Output never has passwords
class UserResponse(BaseModel):
    id: int
    email: str
```

**3. Use Descriptive Field Names and Documentation**
```python
class Payment(BaseModel):
    amount: float = Field(..., description="Amount in USD", example=99.99)
    currency: str = Field(default="USD", regex="^[A-Z]{3}$")
```

## Common Pitfalls

**1. Mutable Default Values**
```python
# Bad - list is shared between all instances!
class Item(BaseModel):
    tags: List[str] = []

# Good - use default_factory
from typing import List
class Item(BaseModel):
    tags: List[str] = Field(default_factory=list)
```

**2. Forgetting Optional**
```python
# Bad - this field is required
class User(BaseModel):
    bio: str = None  # Still required!

# Good - use Optional
from typing import Optional
class User(BaseModel):
    bio: Optional[str] = None  # Truly optional
```

## Quick Reference

```python
from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional, List
from datetime import datetime

class CompleteExample(BaseModel):
    # Basic types
    name: str
    age: int
    active: bool

    # Optional fields
    description: Optional[str] = None

    # Fields with constraints
    price: float = Field(..., gt=0, description="Must be positive")
    quantity: int = Field(default=0, ge=0, le=1000)

    # Special types
    email: EmailStr
    created_at: datetime = Field(default_factory=datetime.now)

    # Lists
    tags: List[str] = Field(default_factory=list)

    # Custom validation
    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v

    class Config:
        schema_extra = {
            "example": {
                "name": "Product",
                "age": 30,
                "active": True,
                "price": 99.99,
                "email": "user@example.com"
            }
        }
```

---

**Navigation:** [← FastAPI Basics](./fastapi-basics.md) | [Back to Index](./README.md) | [Next: Path and Query Parameters →](./fastapi-parameters.md)
