# FastAPI: Async Endpoints for High Performance

## What You'll Learn

Unlock the power of asynchronous programming in FastAPI. Understand when async gives you massive performance gains, when it doesn't matter, and how to write non-blocking endpoints that handle thousands of concurrent requests. Learn the patterns that separate amateur APIs from production-grade systems.

## The Async Revelation

Imagine your API is a restaurant. In a synchronous world, each waiter takes one order, waits in the kitchen until it's ready, then delivers it before taking the next order. In an asynchronous world, waiters take multiple orders, check back periodically, and serve whoever's food is ready first. Same number of waiters, many more customers served.

### The Performance Difference

```
Synchronous (Blocking):
Request 1 → [████ Wait for DB ████] → Response 1
Request 2 →                            [████ Wait for DB ████] → Response 2
Request 3 →                                                        [████ Wait for DB ████]
            ↑ Server idle during waits!

Asynchronous (Non-blocking):
Request 1 → [█ DB call █] → ... → Response 1
Request 2 → [█ DB call █] → ... → Response 2
Request 3 → [█ DB call █] → ... → Response 3
            ↑ All happening concurrently!
```

## When to Use Async

**Perfect for Async (I/O-bound operations):**
- Database queries
- External API calls
- File I/O operations
- Network requests
- Message queue operations
- Any operation that waits for external resources

**Stick with Sync (CPU-bound operations):**
- Heavy computations
- Image processing
- Data transformations
- Machine learning inference (without external calls)
- Cryptographic operations

The rule: If your function spends most of its time waiting (not computing), use async.

## Your First Async Endpoint

### Basic Async vs Sync

```python
from fastapi import FastAPI
import asyncio
import time

app = FastAPI()

# Synchronous endpoint - blocks the thread
@app.get("/sync")
def sync_endpoint():
    time.sleep(1)  # Blocks for 1 second
    return {"message": "Sync response after 1 second"}

# Asynchronous endpoint - doesn't block
@app.get("/async")
async def async_endpoint():
    await asyncio.sleep(1)  # Doesn't block, allows other requests
    return {"message": "Async response after 1 second"}
```

Test the difference:
```bash
# Send 10 concurrent requests to sync endpoint: ~10 seconds
# Send 10 concurrent requests to async endpoint: ~1 second
```

### Async with External APIs

```python
import httpx  # async HTTP client

@app.get("/fetch-data")
async def fetch_data():
    async with httpx.AsyncClient() as client:
        # All these happen concurrently!
        response1 = await client.get("https://api.github.com/users/octocat")
        response2 = await client.get("https://api.github.com/repos/python/cpython")

        return {
            "user": response1.json(),
            "repo": response2.json()
        }

# Even better - truly parallel:
@app.get("/fetch-parallel")
async def fetch_parallel():
    async with httpx.AsyncClient() as client:
        # Gather runs them all at once
        results = await asyncio.gather(
            client.get("https://api.github.com/users/octocat"),
            client.get("https://api.github.com/repos/python/cpython"),
            client.get("https://api.github.com/repos/tiangolo/fastapi")
        )

        return {
            "user": results[0].json(),
            "cpython": results[1].json(),
            "fastapi": results[2].json()
        }
```

## Async Database Operations

### With SQLAlchemy (Async)

```python
from databases import Database
from fastapi import FastAPI

app = FastAPI()

# Async database connection
database = Database("postgresql://user:pass@localhost/db")

@app.on_event("startup")
async def startup():
    await database.connect()
    print("Database connected")

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()
    print("Database disconnected")

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    query = "SELECT * FROM users WHERE id = :user_id"
    result = await database.fetch_one(query=query, values={"user_id": user_id})

    if result is None:
        raise HTTPException(status_code=404, detail="User not found")

    return dict(result)

@app.get("/users/")
async def list_users(skip: int = 0, limit: int = 10):
    query = "SELECT * FROM users LIMIT :limit OFFSET :skip"
    results = await database.fetch_all(
        query=query,
        values={"skip": skip, "limit": limit}
    )

    return [dict(row) for row in results]
```

### With MongoDB (Motor)

```python
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import FastAPI

app = FastAPI()
db = None

@app.on_event("startup")
async def startup_db():
    global db
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.mydatabase

@app.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"_id": product_id})

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    return product

@app.post("/products/")
async def create_product(product: dict):
    result = await db.products.insert_one(product)
    product["_id"] = str(result.inserted_id)
    return product
```

## Advanced Async Patterns

### Concurrent Operations with Gather

```python
import asyncio
from typing import List

async def fetch_user_data(user_id: int):
    await asyncio.sleep(0.1)  # Simulate API call
    return {"id": user_id, "name": f"User {user_id}"}

async def fetch_user_orders(user_id: int):
    await asyncio.sleep(0.1)  # Simulate API call
    return [{"order_id": i, "user_id": user_id} for i in range(3)]

@app.get("/users/{user_id}/complete")
async def get_user_complete(user_id: int):
    # Fetch user and orders concurrently
    user, orders = await asyncio.gather(
        fetch_user_data(user_id),
        fetch_user_orders(user_id)
    )

    return {
        "user": user,
        "orders": orders
    }

@app.get("/users/batch/")
async def get_users_batch(user_ids: List[int]):
    # Fetch multiple users concurrently
    users = await asyncio.gather(
        *[fetch_user_data(uid) for uid in user_ids]
    )
    return {"users": users}
```

### Timeout and Error Handling

```python
import asyncio
from fastapi import HTTPException

@app.get("/fetch-with-timeout")
async def fetch_with_timeout():
    try:
        async with asyncio.timeout(5):  # Python 3.11+
            async with httpx.AsyncClient() as client:
                response = await client.get("https://slow-api.example.com")
                return response.json()
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail="Request timed out after 5 seconds"
        )

# For Python < 3.11:
@app.get("/fetch-with-timeout-compat")
async def fetch_with_timeout_compat():
    try:
        async with httpx.AsyncClient() as client:
            response = await asyncio.wait_for(
                client.get("https://slow-api.example.com"),
                timeout=5.0
            )
            return response.json()
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Timeout")
```

### Background Tasks

```python
from fastapi import BackgroundTasks

async def send_notification(email: str, message: str):
    # Simulate sending email
    await asyncio.sleep(2)
    print(f"Email sent to {email}: {message}")

@app.post("/orders/")
async def create_order(order: dict, background_tasks: BackgroundTasks):
    # Process order immediately
    order_id = save_order(order)

    # Send notification in background (doesn't block response)
    background_tasks.add_task(
        send_notification,
        order["email"],
        f"Order {order_id} confirmed"
    )

    # Return immediately
    return {"order_id": order_id, "status": "created"}
```

## Real-World Example: ML Model with Async

```python
from fastapi import FastAPI
import asyncio
from typing import List
import numpy as np

app = FastAPI()

# Simulate ML model
class AsyncMLModel:
    async def predict(self, features: List[float]):
        # Simulate async prediction (e.g., calling external API)
        await asyncio.sleep(0.1)
        return {"prediction": sum(features) / len(features)}

model = AsyncMLModel()

@app.post("/predict")
async def predict(features: List[float]):
    result = await model.predict(features)
    return result

@app.post("/predict/batch")
async def predict_batch(batch: List[List[float]]):
    # Process all predictions concurrently
    results = await asyncio.gather(
        *[model.predict(features) for features in batch]
    )
    return {"predictions": results}
```

## Common Pitfalls

**1. Mixing Sync and Async**
```python
# Bad - Blocks async function!
async def bad_endpoint():
    time.sleep(1)  # Blocks!
    return {"message": "Bad"}

# Good - Use async sleep
async def good_endpoint():
    await asyncio.sleep(1)  # Doesn't block
    return {"message": "Good"}
```

**2. Using Async Without Await**
```python
# Bad - No actual async benefit
async def bad_endpoint():
    # No await, so why async?
    result = compute_something()
    return result

# Good - Either use await or make it sync
def good_endpoint():  # Just use def
    result = compute_something()
    return result
```

**3. Not Using Async HTTP Clients**
```python
# Bad - Blocks async function!
import requests
async def bad_api_call():
    response = requests.get("https://api.example.com")  # Blocks!
    return response.json()

# Good - Use async client
import httpx
async def good_api_call():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com")
        return response.json()
```

## Best Practices

**1. Use Async for I/O, Sync for CPU**
```python
# Good - I/O operation
@app.get("/data")
async def get_data():
    async with httpx.AsyncClient() as client:
        return await client.get("https://api.example.com")

# Good - CPU-bound operation
@app.post("/process")
def process_data(data: List[int]):
    return {"result": sum(data) ** 2}
```

**2. Always Use Context Managers for Connections**
```python
# Good - Automatic cleanup
async with httpx.AsyncClient() as client:
    response = await client.get(url)

# Bad - Manual cleanup needed
client = httpx.AsyncClient()
response = await client.get(url)
await client.aclose()  # Easy to forget!
```

**3. Handle Timeouts**
```python
async def safe_api_call():
    try:
        async with asyncio.timeout(5):
            # Your async operation
            pass
    except asyncio.TimeoutError:
        # Handle timeout gracefully
        pass
```

## Quick Reference

```python
# Basic async endpoint
@app.get("/async")
async def async_endpoint():
    await asyncio.sleep(1)
    return {"message": "Done"}

# Async with external API
import httpx
@app.get("/fetch")
async def fetch_data():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com")
        return response.json()

# Concurrent operations
@app.get("/parallel")
async def parallel_ops():
    results = await asyncio.gather(
        operation1(),
        operation2(),
        operation3()
    )
    return results

# Background tasks
from fastapi import BackgroundTasks
@app.post("/task")
async def with_background(background_tasks: BackgroundTasks):
    background_tasks.add_task(slow_operation)
    return {"status": "processing"}
```

---

**Navigation:** [← Path and Query Parameters](./fastapi-parameters.md) | [Back to Index](./README.md) | [Next: Dependency Injection →](./fastapi-dependency-injection.md)
