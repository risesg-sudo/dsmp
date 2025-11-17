# FastAPI: Interview Questions and Answers

## What You'll Learn

Prepare for technical interviews with comprehensive Q&A covering FastAPI fundamentals, advanced patterns, and real-world scenarios. These questions test both theoretical knowledge and practical experience.

## Q1: What is FastAPI and why would you use it over Flask or Django?

**Answer:**

FastAPI is a modern, high-performance web framework for building APIs with Python 3.7+, based on standard Python type hints.

**Key Advantages over Flask:**

| Feature | FastAPI | Flask |
|---------|---------|-------|
| Performance | Very fast (Node.js/Go level) | Medium speed |
| Async Support | Native async/await | Needs extensions |
| Documentation | Automatic (Swagger/OpenAPI) | Manual |
| Validation | Automatic with Pydantic | Manual or extensions |
| Type Hints | Built-in, required | Optional |

**Advantages over Django:**

| Feature | FastAPI | Django |
|---------|---------|--------|
| Speed | Much faster | Slower |
| Focus | Pure API development | Full web framework |
| Learning Curve | Easier for APIs | Steeper |
| Async | Native support | Partial support |

**When to Use FastAPI:**
- Building REST APIs
- ML model deployment
- Microservices
- High-performance requirements
- Projects requiring automatic documentation

**Example showing FastAPI's advantages:**

```python
# FastAPI - Automatic validation & docs
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items/")
def create_item(item: Item):  # Auto-validated!
    return item
# Bonus: Interactive docs at /docs

# Flask - Manual validation needed
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/items/", methods=["POST"])
def create_item():
    data = request.get_json()
    if 'name' not in data or 'price' not in data:
        return jsonify({"error": "Invalid data"}), 400
    return jsonify(data)
# No automatic docs
```

---

## Q2: Explain Pydantic models and their role in FastAPI

**Answer:**

Pydantic is a data validation library using Python type annotations. It's integral to FastAPI for request/response validation.

**Role in FastAPI:**

1. **Request Validation:** Automatically validate incoming data
2. **Response Validation:** Ensure responses match schema
3. **Documentation:** Generate API docs from models
4. **Type Safety:** Editor support and type checking

**Example:**

```python
from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional

class User(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    age: int = Field(..., ge=0, le=150)
    is_active: bool = True

    @validator('age')
    def age_realistic(cls, v):
        if v > 120:
            raise ValueError('Age seems unrealistic')
        return v

# Automatic validation
@app.post("/users/")
def create_user(user: User):
    # If validation fails → 422 error with details
    return user
```

**Benefits:**
- Automatic validation
- Clear error messages showing exactly what's wrong
- Type safety throughout your code
- Schema generation for documentation
- Support for nested models

**Validation Error Example:**

```python
# Invalid request:
{
    "username": "ab",  # Too short
    "email": "invalid",  # No @
    "age": -5  # Negative
}

# Response (422):
{
    "detail": [
        {
            "loc": ["body", "username"],
            "msg": "ensure this value has at least 3 characters",
            "type": "value_error.any_str.min_length"
        },
        ...
    ]
}
```

---

## Q3: How do you deploy an ML model using FastAPI?

**Answer:**

**Steps for ML Model Deployment:**

**1. Train and Save Model:**
```python
import joblib
from sklearn.ensemble import RandomForestClassifier

# Train
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Save
joblib.dump(model, 'model.pkl')
joblib.dump(scaler, 'scaler.pkl')
```

**2. Create FastAPI Application:**
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()
model = None

# Load model at startup (not per request!)
@app.on_event("startup")
async def load_model():
    global model
    model = joblib.load("model.pkl")

class PredictionRequest(BaseModel):
    features: list[float]

@app.post("/predict")
def predict(request: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    X = np.array(request.features).reshape(1, -1)
    prediction = model.predict(X)[0]
    probability = model.predict_proba(X)[0].tolist()

    return {
        "prediction": int(prediction),
        "probability": probability
    }

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}
```

**3. Dockerfile:**
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**4. Deploy:**
```bash
# Build and run
docker build -t ml-api .
docker run -p 8000:8000 ml-api

# Or deploy to cloud (AWS, GCP, Azure, Heroku)
```

**Best Practices:**
- Load model at startup, not per request
- Add health check endpoint
- Include model versioning
- Add request/response logging
- Handle errors gracefully
- Validate inputs thoroughly
- Monitor performance

---

## Q4: What is dependency injection in FastAPI and when would you use it?

**Answer:**

Dependency injection is a pattern where you declare what your endpoint needs, and FastAPI automatically provides it.

**Use Cases:**
- Database connections
- Authentication
- Common parameters
- Configuration
- Logging

**Basic Example:**

```python
from fastapi import Depends, HTTPException

# Dependency function
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Use in endpoint
@app.get("/users/")
def read_users(db: Session = Depends(get_db)):
    # db is automatically provided and closed
    return db.query(User).all()
```

**Authentication Example:**

```python
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    user = verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

# Protected endpoint
@app.get("/users/me")
def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user
```

**Nested Dependencies:**

```python
def get_token(token: str):
    return token

def get_user(token: str = Depends(get_token)):
    return verify_token(token)

def get_admin(user: User = Depends(get_user)):
    if not user.is_admin:
        raise HTTPException(status_code=403)
    return user

@app.delete("/users/{user_id}")
def delete_user(user_id: int, admin: User = Depends(get_admin)):
    # Automatically checks: token → user → admin
    return {"deleted": user_id}
```

**Benefits:**
- Code reuse
- Separation of concerns
- Easy testing (can inject mocks)
- Automatic documentation
- Clean, maintainable code

---

## Q5: How do you handle errors in FastAPI?

**Answer:**

FastAPI provides multiple ways to handle errors:

**1. HTTPException (Built-in):**
```python
from fastapi import HTTPException, status

@app.get("/items/{item_id}")
def read_item(item_id: int):
    if item_id not in items:
        raise HTTPException(
            status_code=404,
            detail="Item not found",
            headers={"X-Error": "Custom header"}
        )
    return items[item_id]
```

**2. Custom Exception Handlers:**
```python
from fastapi import Request
from fastapi.responses import JSONResponse

class ItemNotFoundError(Exception):
    def __init__(self, item_id: int):
        self.item_id = item_id

@app.exception_handler(ItemNotFoundError)
async def item_not_found_handler(request: Request, exc: ItemNotFoundError):
    return JSONResponse(
        status_code=404,
        content={"message": f"Item {exc.item_id} not found"}
    )

@app.get("/items/{item_id}")
def read_item(item_id: int):
    if item_id not in items:
        raise ItemNotFoundError(item_id)
    return items[item_id]
```

**3. Validation Error Override:**
```python
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "message": "Validation error",
            "errors": exc.errors()
        }
    )
```

**4. Global Exception Handler:**
```python
@app.exception_handler(Exception)
async def global_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error"}
    )
```

**Best Practices:**
- Use appropriate status codes
- Provide meaningful error messages
- Log errors server-side
- Don't expose sensitive information
- Include error codes for client handling

---

## Q6: Explain async/await in FastAPI and when to use it

**Answer:**

Async/await allows non-blocking I/O operations, improving concurrency.

**When to Use Async:**

**✓ Use for I/O-bound operations:**
- Database queries
- External API calls
- File I/O
- Network requests

**✗ Use sync for CPU-bound operations:**
- Heavy computations
- Data transformations
- ML inference (without external calls)

**Example:**

```python
import asyncio
import httpx

# Async endpoint
@app.get("/async")
async def async_endpoint():
    await asyncio.sleep(1)  # Doesn't block
    return {"message": "Async response"}

# Async with external API
@app.get("/fetch-data")
async def fetch_data():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com")
        return response.json()

# Concurrent operations
@app.get("/parallel")
async def parallel_ops():
    results = await asyncio.gather(
        fetch_user(),
        fetch_posts(),
        fetch_comments()
    )
    return results
```

**Performance Impact:**

```
Synchronous (10 requests, 1s each): ~10 seconds total
Asynchronous (10 requests, 1s each): ~1 second total
```

**Common Mistakes:**

```python
# Bad - Blocks async function!
async def bad():
    time.sleep(1)  # Blocks!

# Good - Uses async sleep
async def good():
    await asyncio.sleep(1)  # Doesn't block

# Bad - No actual async benefit
async def bad():
    result = compute()  # No await
    return result

# Good - Either use await or make it sync
def good():  # Just use def
    result = compute()
    return result
```

---

## Q7: How would you implement rate limiting in FastAPI?

**Answer:**

Rate limiting prevents API abuse by limiting requests per time period.

**Implementation:**

```python
from fastapi import Request, HTTPException
from collections import defaultdict
import time

class RateLimiter:
    def __init__(self, calls: int, period: int):
        self.calls = calls
        self.period = period
        self.clients = defaultdict(list)

    async def __call__(self, request: Request):
        client = request.client.host
        now = time.time()

        # Clean old timestamps
        self.clients[client] = [
            ts for ts in self.clients[client]
            if now - ts < self.period
        ]

        # Check limit
        if len(self.clients[client]) >= self.calls:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded"
            )

        # Add current request
        self.clients[client].append(now)

# Apply to specific routes
limiter = RateLimiter(calls=10, period=60)

@app.get("/limited/", dependencies=[Depends(limiter)])
def limited_endpoint():
    return {"message": "Rate limited endpoint"}
```

**Production Solutions:**
- Use Redis for distributed rate limiting
- Consider libraries like `slowapi`
- Implement per-user limits
- Add different tiers (free, premium)

---

## Q8: How would you test FastAPI applications?

**Answer:**

FastAPI provides excellent testing support with `TestClient`.

**Basic Testing:**

```python
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World"}

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

def test_create_item():
    response = client.post(
        "/items/",
        json={"name": "Item", "price": 10.0}
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Item"
```

**Testing with Dependencies:**

```python
# Override dependency for testing
def get_db_override():
    return MockDatabase()

app.dependency_overrides[get_db] = get_db_override

def test_with_mock_db():
    response = client.get("/users/")
    assert response.status_code == 200
```

**Testing Authentication:**

```python
def test_protected_route():
    # Without token
    response = client.get("/protected/")
    assert response.status_code == 401

    # With token
    response = client.get(
        "/protected/",
        headers={"Authorization": "Bearer valid_token"}
    )
    assert response.status_code == 200
```

---

## Quick Interview Tips

**1. Know the Basics:**
- HTTP methods and status codes
- Pydantic models
- Dependency injection
- Async vs sync

**2. Understand Performance:**
- When to use async
- How FastAPI achieves speed
- Optimization strategies

**3. Production Knowledge:**
- Deployment (Docker, uvicorn)
- Error handling
- Logging and monitoring
- Security best practices

**4. Practical Experience:**
- Build a complete CRUD API
- Deploy an ML model
- Implement authentication
- Handle file uploads

---

**Navigation:** [← Practical Examples](./fastapi-practical-examples.md) | [Back to Index](./README.md) | [AWS SageMaker Introduction →](./sagemaker-introduction.md)
