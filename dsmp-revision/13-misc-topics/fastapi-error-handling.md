# FastAPI: Error Handling and Exception Management

## What You'll Learn

Master the art of graceful failure. Learn how to turn cryptic error messages into helpful guidance, build custom exception handlers that make debugging effortless, and create APIs that communicate problems clearly to both developers and end users.

## Why Error Handling Matters

Bad error handling turns simple problems into debugging nightmares. Good error handling guides users to solutions and makes your API feel professional and reliable.

```python
# Bad - Unclear what went wrong
@app.get("/users/{user_id}")
def get_user(user_id: int):
    user = db.get(user_id)
    return user.name  # Crashes if user is None!

# Good - Clear, actionable error
@app.get("/users/{user_id}")
def get_user(user_id: int):
    user = db.get(user_id)
    if user is None:
        raise HTTPException(
            status_code=404,
            detail=f"User with ID {user_id} not found"
        )
    return {"name": user.name}
```

## HTTPException: Your Main Tool

FastAPI's `HTTPException` is your primary way to signal errors:

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()

@app.get("/items/{item_id}")
def read_item(item_id: int):
    items = {1: "Laptop", 2: "Mouse"}

    if item_id not in items:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
            headers={"X-Error": "This is a custom header"}
        )

    return {"item": items[item_id]}
```

### Common Error Patterns

```python
from fastapi import HTTPException, status

# 400 Bad Request - Invalid input
if not validate_email(email):
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid email format"
    )

# 401 Unauthorized - Not authenticated
if not token:
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required",
        headers={"WWW-Authenticate": "Bearer"}
    )

# 403 Forbidden - Not authorized
if not user.is_admin:
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin privileges required"
    )

# 404 Not Found - Resource doesn't exist
if item_id not in database:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Item {item_id} not found"
    )

# 409 Conflict - Resource already exists
if username in users:
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=f"Username '{username}' already exists"
    )

# 422 Unprocessable Entity - Validation error (automatic in FastAPI)
# FastAPI handles this automatically with Pydantic
```

## Custom Exception Classes

Create reusable exception types for your domain:

```python
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse

# Custom exception classes
class ItemNotFoundException(Exception):
    def __init__(self, item_id: int):
        self.item_id = item_id

class InsufficientPermissionsException(Exception):
    def __init__(self, required_role: str):
        self.required_role = required_role

class DatabaseConnectionException(Exception):
    def __init__(self, message: str):
        self.message = message

app = FastAPI()

# Custom exception handlers
@app.exception_handler(ItemNotFoundException)
async def item_not_found_handler(request: Request, exc: ItemNotFoundException):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Item not found",
            "item_id": exc.item_id,
            "message": f"Item with ID {exc.item_id} does not exist",
            "path": str(request.url)
        }
    )

@app.exception_handler(InsufficientPermissionsException)
async def permissions_handler(request: Request, exc: InsufficientPermissionsException):
    return JSONResponse(
        status_code=403,
        content={
            "error": "Insufficient permissions",
            "required_role": exc.required_role,
            "message": f"This action requires {exc.required_role} role"
        }
    )

# Use in endpoints
@app.get("/items/{item_id}")
def read_item(item_id: int):
    if item_id not in items:
        raise ItemNotFoundException(item_id)
    return items[item_id]

@app.delete("/items/{item_id}")
def delete_item(item_id: int, user: User):
    if not user.is_admin:
        raise InsufficientPermissionsException("admin")
    # Delete item...
```

## Handling Validation Errors

FastAPI automatically handles Pydantic validation errors, but you can customize the response:

```python
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):
    errors = []
    for error in exc.errors():
        errors.append({
            "field": " -> ".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })

    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation failed",
            "details": errors,
            "request_body": exc.body
        }
    )
```

Now validation errors look like:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "body -> price",
      "message": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ],
  "request_body": {"name": "Item", "price": -10}
}
```

## Global Exception Handler

Catch all unhandled exceptions:

```python
from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the error
    logger.error(f"Unhandled exception: {exc}", exc_info=True)

    # Return generic error (don't expose internals!)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again later.",
            "request_id": request.state.request_id  # If you track request IDs
        }
    )
```

## Error Response Models

Use Pydantic models for consistent error responses:

```python
from pydantic import BaseModel
from typing import Optional, List

class ErrorDetail(BaseModel):
    field: str
    message: str
    type: str

class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[List[ErrorDetail]] = None
    request_id: Optional[str] = None

# Use in exception handlers
@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    error_details = [
        ErrorDetail(
            field=" -> ".join(str(loc) for loc in err["loc"]),
            message=err["msg"],
            type=err["type"]
        )
        for err in exc.errors()
    ]

    error_response = ErrorResponse(
        error="Validation Error",
        message="The request contains invalid data",
        details=error_details
    )

    return JSONResponse(
        status_code=422,
        content=error_response.dict()
    )
```

## Context-Aware Error Messages

Provide helpful, context-aware errors:

```python
from datetime import datetime

@app.post("/orders/")
def create_order(order: Order, user: User):
    # Check inventory
    if not check_inventory(order.items):
        unavailable = get_unavailable_items(order.items)
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Insufficient inventory",
                "message": "Some items are out of stock",
                "unavailable_items": unavailable,
                "suggestion": "Remove these items or reduce quantity"
            }
        )

    # Check user credit
    if order.total > user.credit_limit:
        raise HTTPException(
            status_code=403,
            detail={
                "error": "Credit limit exceeded",
                "order_total": order.total,
                "credit_limit": user.credit_limit,
                "available_credit": user.available_credit,
                "message": f"Order total (${order.total}) exceeds available credit (${user.available_credit})"
            }
        )

    # Create order...
    return {"order_id": 123}
```

## Error Logging

Always log errors for debugging:

```python
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

@app.exception_handler(Exception)
async def global_handler(request: Request, exc: Exception):
    # Detailed logging
    logger.error(
        f"Unhandled exception",
        extra={
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url),
            "method": request.method,
            "client": request.client.host if request.client else None,
            "exception": str(exc),
            "exception_type": type(exc).__name__
        },
        exc_info=True
    )

    # Generic user response
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )
```

## Retry Logic and Timeouts

Handle transient failures gracefully:

```python
import asyncio
from fastapi import HTTPException

async def fetch_with_retry(url: str, max_retries: int = 3):
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=5.0)
                return response.json()
        except (httpx.TimeoutException, httpx.ConnectError) as e:
            if attempt == max_retries - 1:
                raise HTTPException(
                    status_code=503,
                    detail={
                        "error": "Service unavailable",
                        "message": f"Failed to connect after {max_retries} attempts",
                        "service": url
                    }
                )
            await asyncio.sleep(2 ** attempt)  # Exponential backoff

@app.get("/external-data")
async def get_external_data():
    try:
        data = await fetch_with_retry("https://api.example.com/data")
        return data
    except HTTPException:
        raise
```

## Best Practices

**1. Be Specific**
```python
# Good - Clear what went wrong
raise HTTPException(
    status_code=404,
    detail="User with email 'john@example.com' not found"
)

# Bad - Too generic
raise HTTPException(status_code=404, detail="Not found")
```

**2. Don't Expose Sensitive Information**
```python
# Bad - Exposes database structure
raise HTTPException(
    status_code=500,
    detail=f"Database error: {str(db_exception)}"
)

# Good - Generic for users, detailed in logs
logger.error(f"Database error: {db_exception}")
raise HTTPException(
    status_code=500,
    detail="An error occurred while processing your request"
)
```

**3. Use Appropriate Status Codes**
```python
# Authentication errors
401 Unauthorized  # Not logged in
403 Forbidden    # Logged in but no permission

# Client errors
400 Bad Request  # Invalid input format
404 Not Found    # Resource doesn't exist
409 Conflict     # Resource already exists

# Server errors
500 Internal Server Error  # Unexpected error
503 Service Unavailable    # Temporary issue
```

**4. Include Actionable Information**
```python
raise HTTPException(
    status_code=400,
    detail={
        "error": "Invalid password",
        "requirements": {
            "min_length": 8,
            "requires_uppercase": True,
            "requires_digit": True
        },
        "message": "Password must be at least 8 characters and contain uppercase letter and digit"
    }
)
```

## Common Pitfalls

**1. Catching Too Broadly**
```python
# Bad - Masks real problems
try:
    result = complex_operation()
    return result
except Exception:
    return {"error": "Something went wrong"}

# Good - Specific exceptions
try:
    result = complex_operation()
    return result
except ValueError as e:
    raise HTTPException(status_code=400, detail=str(e))
except DatabaseError as e:
    logger.error(f"Database error: {e}")
    raise HTTPException(status_code=500, detail="Database error")
```

**2. Returning Error Data Incorrectly**
```python
# Bad - Returns 200 with error
@app.get("/items/{item_id}")
def read_item(item_id: int):
    if item_id not in items:
        return {"error": "Not found"}  # Still 200!

# Good - Proper status code
@app.get("/items/{item_id}")
def read_item(item_id: int):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Not found")
```

## Quick Reference

```python
from fastapi import HTTPException, status, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

# Basic error
raise HTTPException(
    status_code=404,
    detail="Resource not found"
)

# Custom exception
class CustomError(Exception):
    pass

@app.exception_handler(CustomError)
async def custom_handler(request: Request, exc: CustomError):
    return JSONResponse(
        status_code=400,
        content={"error": str(exc)}
    )

# Validation errors
@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"errors": exc.errors()}
    )

# Global handler
@app.exception_handler(Exception)
async def global_handler(request: Request, exc: Exception):
    logger.error(f"Error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )
```

---

**Navigation:** [← Dependency Injection](./fastapi-dependency-injection.md) | [Back to Index](./README.md) | [Next: ML Model Deployment →](./fastapi-ml-deployment.md)
