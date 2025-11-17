# FastAPI: Path and Query Parameters

## What You'll Learn

Explore how to extract data from URLs using path and query parameters, understand when to use each type, and master the art of building flexible, user-friendly APIs. Learn the patterns that make your endpoints intuitive and your code maintainable.

## Understanding URL Parameters

URLs carry data in two main ways:
- **Path parameters:** Part of the URL path (`/users/123`)
- **Query parameters:** After the `?` (`/search?q=python&limit=10`)

Choosing the right type makes your API feel natural to use.

## Path Parameters

Path parameters identify specific resources. They're part of the URL structure itself.

### Basic Path Parameters

```python
from fastapi import FastAPI

app = FastAPI()

# Simple path parameter
@app.get("/users/{user_id}")
def read_user(user_id: int):
    return {"user_id": user_id}

# Multiple path parameters
@app.get("/users/{user_id}/posts/{post_id}")
def read_user_post(user_id: int, post_id: int):
    return {
        "user_id": user_id,
        "post_id": post_id,
        "post": f"Post {post_id} by user {user_id}"
    }
```

FastAPI automatically:
- Extracts values from URL
- Converts types (string to int)
- Validates the conversion
- Returns 422 if conversion fails

### Path Parameters with Enum

When a parameter has a fixed set of valid values, use Enum:

```python
from enum import Enum

class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"

@app.get("/models/{model_name}")
def get_model(model_name: ModelName):
    if model_name == ModelName.alexnet:
        return {"model": "AlexNet", "message": "Deep Learning FTW!"}
    elif model_name == ModelName.lenet:
        return {"model": "LeNet", "message": "LeCNN all the images"}
    return {"model": model_name.value, "message": "Have some residuals"}

# Valid URLs:
# GET /models/alexnet  ✓
# GET /models/resnet   ✓
# GET /models/invalid  ✗ Returns validation error
```

This pattern provides:
- Autocomplete in documentation
- Validation of allowed values
- Type safety in code

### File Path Parameters

For paths that might contain slashes:

```python
@app.get("/files/{file_path:path}")
def read_file(file_path: str):
    return {"file_path": file_path}

# Matches: /files/home/user/documents/file.txt
# file_path = "home/user/documents/file.txt"
```

## Query Parameters

Query parameters are optional filters, pagination, or search criteria. They appear after `?` in the URL.

### Basic Query Parameters

```python
from typing import Optional

# Optional query parameters
@app.get("/items/")
def read_items(skip: int = 0, limit: int = 10):
    # GET /items/?skip=20&limit=5
    return {
        "skip": skip,
        "limit": limit,
        "items": f"Items from {skip} to {skip + limit}"
    }

# Mixed optional and required
@app.get("/search/")
def search_items(q: str, skip: int = 0, limit: int = 10):
    # q is required (no default)
    # skip and limit are optional (have defaults)
    return {"q": q, "skip": skip, "limit": limit}
```

### Query Parameters with Type Conversion

```python
@app.get("/items/{item_id}")
def read_item(
    item_id: int,
    q: Optional[str] = None,
    short: bool = False,
    count: int = 1
):
    # GET /items/5?q=test&short=true&count=3
    # short is automatically converted from "true" to True
    # count is converted from "3" to 3

    item = {"item_id": item_id}
    if q:
        item["q"] = q
    if not short:
        item["description"] = "This is a long description"
    item["count"] = count
    return item
```

Boolean query parameters recognize:
- `true`, `True`, `1`, `yes`, `on` → `True`
- `false`, `False`, `0`, `no`, `off` → `False`

### Multiple Values for Same Parameter

```python
from typing import List
from fastapi import Query

@app.get("/items/")
def read_items(tags: List[str] = Query(default=[])):
    # GET /items/?tags=electronics&tags=computers&tags=laptops
    return {"tags": tags}
    # Returns: {"tags": ["electronics", "computers", "laptops"]}
```

### Query Parameter Validation

Use `Query` for advanced validation:

```python
from fastapi import Query

@app.get("/items/")
def read_items(
    q: Optional[str] = Query(
        None,
        min_length=3,
        max_length=50,
        regex="^[a-zA-Z0-9 ]+$",
        description="Search query"
    ),
    limit: int = Query(
        default=10,
        gt=0,
        le=100,
        description="Maximum number of results"
    )
):
    return {"q": q, "limit": limit}
```

**Query validation options:**
- `min_length`, `max_length` - String length
- `regex` - Pattern matching
- `gt`, `ge`, `lt`, `le` - Numeric constraints
- `alias` - Different parameter name in URL
- `deprecated` - Mark as deprecated in docs

### Required Query Parameters

```python
# Method 1: No default value
@app.get("/items/")
def read_items(needy: str):
    # GET /items/ → Error: Missing required parameter
    # GET /items/?needy=value → Success
    return {"needy": needy}

# Method 2: Using Query with ellipsis
from fastapi import Query

@app.get("/items/")
def read_items(needy: str = Query(..., min_length=3)):
    # Required AND must be at least 3 characters
    return {"needy": needy}
```

## Combining Path, Query, and Request Body

FastAPI intelligently determines parameter sources:

```python
from pydantic import BaseModel
from typing import Optional

class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

@app.put("/items/{item_id}")
def update_item(
    item_id: int,              # Path parameter
    item: Item,                # Request body
    q: Optional[str] = None,   # Query parameter
    short: bool = False        # Query parameter
):
    result = {
        "item_id": item_id,    # From path
        **item.dict()          # From body
    }
    if q:
        result["q"] = q        # From query
    if short:
        result["short"] = True
    return result

# PUT /items/5?q=search&short=true
# Body: {"name": "Laptop", "price": 999.99}
```

FastAPI's parameter resolution:
1. If declared in path → path parameter
2. If singular type (int, str, bool) → query parameter
3. If Pydantic model → request body

## Advanced Query Parameters

### Query Parameter Models

Group related query parameters:

```python
from pydantic import BaseModel, Field

class Pagination(BaseModel):
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=10, ge=1, le=100)

class FilterParams(BaseModel):
    category: Optional[str] = None
    min_price: Optional[float] = Field(None, ge=0)
    max_price: Optional[float] = Field(None, ge=0)

@app.get("/products/")
def list_products(
    pagination: Pagination = Depends(),
    filters: FilterParams = Depends()
):
    return {
        "skip": pagination.skip,
        "limit": pagination.limit,
        "filters": filters.dict(exclude_none=True)
    }
```

## When to Use Path vs Query Parameters

**Use Path Parameters for:**
- Resource identification (`/users/{user_id}`)
- Hierarchical relationships (`/users/{user_id}/posts/{post_id}`)
- Required values
- RESTful resource URLs

**Use Query Parameters for:**
- Filtering (`/products?category=electronics`)
- Sorting (`/items?sort=price&order=desc`)
- Pagination (`/items?page=2&limit=20`)
- Search (`/search?q=python`)
- Optional values

## Best Practices

**1. Semantic URLs**
```python
# Good - Clear resource hierarchy
@app.get("/users/{user_id}/orders/{order_id}")

# Avoid - Flat structure with query params
@app.get("/orders?user_id=1&order_id=2")
```

**2. Sensible Defaults**
```python
# Good - Reasonable defaults
@app.get("/items/")
def read_items(limit: int = 10, skip: int = 0):
    pass

# Avoid - No defaults for pagination
@app.get("/items/")
def read_items(limit: int, skip: int):  # Forces users to always provide
    pass
```

**3. Document Your Parameters**
```python
from fastapi import Query

@app.get("/items/")
def read_items(
    q: Optional[str] = Query(
        None,
        title="Search Query",
        description="Search for items by name or description",
        min_length=3,
        example="laptop"
    )
):
    pass
```

## Common Pitfalls

**1. Path Parameter Order Matters**
```python
# Bad - Ambiguous paths
@app.get("/users/me")
def read_current_user():
    pass

@app.get("/users/{user_id}")
def read_user(user_id: str):
    pass
# /users/me matches the second route with user_id="me"!

# Good - Specific routes first
@app.get("/users/me")
def read_current_user():
    pass

@app.get("/users/{user_id}")
def read_user(user_id: int):  # Note: int type prevents matching "me"
    pass
```

**2. Optional vs Required Confusion**
```python
# This is required (no default)
def read_item(item_id: int):
    pass

# This is optional
def read_item(item_id: Optional[int] = None):
    pass

# This is required but type-checked
def read_item(item_id: Optional[int] = Query(...)):
    pass
```

## Quick Reference

```python
from fastapi import FastAPI, Query, Path
from typing import Optional, List
from enum import Enum

app = FastAPI()

# Path parameters
@app.get("/items/{item_id}")
def read_item(
    item_id: int = Path(..., title="Item ID", ge=1)
):
    pass

# Query parameters
@app.get("/search/")
def search(
    q: str = Query(..., min_length=3),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    tags: List[str] = Query([])
):
    pass

# Combined
@app.put("/items/{item_id}")
def update_item(
    item_id: int,                    # Path
    item: Item,                      # Body
    q: Optional[str] = None          # Query
):
    pass
```

---

**Navigation:** [← Pydantic Models](./fastapi-pydantic-models.md) | [Back to Index](./README.md) | [Next: Async Endpoints →](./fastapi-async.md)
