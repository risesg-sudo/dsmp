# FastAPI: HTTP Methods and Status Codes

## What You'll Learn

Master the foundational building blocks of REST APIs - HTTP methods and status codes. Learn when to use GET versus POST, how to properly signal success or errors, and why these choices matter for building intuitive, well-designed APIs that other developers will love to use.

## HTTP Methods: The Verbs of Your API

Think of HTTP methods as verbs in a sentence - they tell your API what action to perform on a resource. Using the right method isn't just convention; it's about creating predictable, maintainable APIs.

### The Essential Methods

```python
from fastapi import FastAPI

app = FastAPI()

# GET - Retrieve data (safe, idempotent)
@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id}

# POST - Create new data
@app.post("/items/")
def create_item(item: dict):
    return {"created": item}

# PUT - Update data (full replacement)
@app.put("/items/{item_id}")
def update_item(item_id: int, item: dict):
    return {"item_id": item_id, "updated": item}

# PATCH - Partial update (modify specific fields)
@app.patch("/items/{item_id}")
def patch_item(item_id: int, item: dict):
    return {"item_id": item_id, "patched": item}

# DELETE - Remove data
@app.delete("/items/{item_id}")
def delete_item(item_id: int):
    return {"deleted": item_id}
```

### When to Use Each Method

**GET - Reading Data**
- Safe: Never modifies server state
- Idempotent: Multiple identical requests have same effect
- Cacheable: Browsers and proxies can cache responses
- Use for: Fetching user profiles, listing products, getting reports

```python
# Good: Retrieving user information
@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"id": user_id, "name": "John Doe"}
```

**POST - Creating Resources**
- Not idempotent: Multiple requests create multiple resources
- Use for: Creating new users, placing orders, uploading files

```python
# Good: Creating a new order
@app.post("/orders/")
def create_order(order: dict):
    order_id = generate_order_id()
    return {"order_id": order_id, "status": "created"}
```

**PUT - Full Replacement**
- Idempotent: Same request multiple times has same effect
- Replaces entire resource
- Use for: Updating complete user profiles, replacing configurations

```python
# Good: Replacing entire user profile
@app.put("/users/{user_id}")
def update_user(user_id: int, user: dict):
    # This replaces ALL user fields
    return {"id": user_id, "updated": user}
```

**PATCH - Partial Updates**
- Modifies only specified fields
- More efficient than PUT for small changes
- Use for: Updating email only, changing single settings

```python
# Good: Updating just the email
@app.patch("/users/{user_id}")
def update_email(user_id: int, updates: dict):
    # Only updates provided fields
    return {"id": user_id, "updated_fields": updates}
```

**DELETE - Removing Resources**
- Idempotent: Deleting twice has same effect as once
- Use for: Removing users, canceling subscriptions, deleting posts

```python
# Good: Deleting a user account
@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    return {"message": "User deleted", "id": user_id}
```

## Status Codes: Speaking the Right Language

Status codes are how your API communicates what happened. Using the right code helps clients handle responses correctly without parsing response bodies.

### Setting Status Codes

```python
from fastapi import FastAPI, status

app = FastAPI()

# Method 1: Using status module (recommended)
@app.post("/items/", status_code=status.HTTP_201_CREATED)
def create_item(item: dict):
    return item

# Method 2: Using integer directly
@app.get("/items/{item_id}", status_code=200)
def read_item(item_id: int):
    return {"item_id": item_id}
```

### The Essential Status Codes

**2xx - Success Family**

```
200 OK              - Standard success for GET, PUT, PATCH
201 Created         - Resource successfully created (POST)
204 No Content      - Success but no data to return (DELETE)
```

```python
# 200 OK - Default for successful GET
@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id}

# 201 Created - New resource created
@app.post("/items/", status_code=status.HTTP_201_CREATED)
def create_item(item: dict):
    return {"id": 123, **item}

# 204 No Content - Successful deletion
@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int):
    # Returns no body
    return None
```

**4xx - Client Error Family**

```
400 Bad Request     - Invalid request format or data
401 Unauthorized    - Authentication required
403 Forbidden       - Authenticated but no permission
404 Not Found       - Resource doesn't exist
422 Unprocessable   - Validation error (FastAPI default)
```

```python
from fastapi import HTTPException

# 404 Not Found
@app.get("/items/{item_id}")
def read_item(item_id: int):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    return items[item_id]

# 401 Unauthorized
@app.get("/me")
def read_current_user(token: str = None):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"user": "current"}

# 403 Forbidden
@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int, is_admin: bool = False):
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return {"deleted": user_id}
```

**5xx - Server Error Family**

```
500 Internal Error  - Unexpected server error
503 Unavailable     - Service temporarily down
```

These are typically raised automatically when unhandled exceptions occur.

## Practical Examples

### RESTful CRUD Operations

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()

# In-memory database
items = {
    1: {"name": "Laptop", "price": 999.99},
    2: {"name": "Mouse", "price": 29.99}
}

# CREATE - POST with 201
@app.post("/items/", status_code=status.HTTP_201_CREATED)
def create_item(item: dict):
    item_id = max(items.keys()) + 1 if items else 1
    items[item_id] = item
    return {"id": item_id, **item}

# READ - GET with 200 or 404
@app.get("/items/{item_id}")
def read_item(item_id: int):
    if item_id not in items:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item {item_id} not found"
        )
    return items[item_id]

# UPDATE - PUT with 200 or 404
@app.put("/items/{item_id}")
def update_item(item_id: int, item: dict):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    items[item_id] = item
    return items[item_id]

# DELETE - DELETE with 204 or 404
@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    del items[item_id]
    return None
```

## Best Practices

**1. Be Consistent**
If you return 404 for missing users, do it everywhere, not just some endpoints.

**2. Use Descriptive Detail Messages**
```python
# Good
raise HTTPException(status_code=404, detail="User with ID 123 not found")

# Bad
raise HTTPException(status_code=404, detail="Not found")
```

**3. Choose the Right Method**
Don't use POST for updates or GET for creating data. Follow REST conventions.

**4. Return Appropriate Status Codes**
```python
# Good: 201 for creation
@app.post("/users/", status_code=201)

# Bad: 200 for creation (works but misleading)
@app.post("/users/", status_code=200)
```

## Common Pitfalls

**1. Using GET for State-Changing Operations**
```python
# Bad: GET should never modify data
@app.get("/delete-user/{user_id}")  # Wrong!

# Good: Use DELETE
@app.delete("/users/{user_id}")  # Correct!
```

**2. Ignoring Status Codes**
```python
# Bad: Always returning 200 even for errors
@app.get("/items/{item_id}")
def read_item(item_id: int):
    if item_id not in items:
        return {"error": "Not found"}  # Still returns 200!

# Good: Proper status code
@app.get("/items/{item_id}")
def read_item(item_id: int):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Not found")
    return items[item_id]
```

## Quick Reference

```python
# Common patterns
@app.get("/resource")              # List all - 200
@app.get("/resource/{id}")         # Get one - 200 or 404
@app.post("/resource")             # Create - 201
@app.put("/resource/{id}")         # Update all - 200 or 404
@app.patch("/resource/{id}")       # Update partial - 200 or 404
@app.delete("/resource/{id}")      # Delete - 204 or 404

# Status code constants
from fastapi import status
status.HTTP_200_OK
status.HTTP_201_CREATED
status.HTTP_204_NO_CONTENT
status.HTTP_400_BAD_REQUEST
status.HTTP_404_NOT_FOUND
status.HTTP_422_UNPROCESSABLE_ENTITY
status.HTTP_500_INTERNAL_SERVER_ERROR
```

---

**Navigation:** [← FastAPI Introduction](./fastapi-introduction.md) | [Back to Index](./README.md) | [Next: Pydantic Models →](./fastapi-pydantic-models.md)
