# FastAPI Basics

## 📖 Table of Contents
- [Introduction](#introduction)
- [Why FastAPI](#why-fastapi)
- [Installation & Setup](#installation--setup)
- [Basic Concepts](#basic-concepts)
- [Request & Response Models](#request--response-models)
- [Path Parameters & Query Parameters](#path-parameters--query-parameters)
- [Async Endpoints](#async-endpoints)
- [Dependency Injection](#dependency-injection)
- [Error Handling](#error-handling)
- [ML Model Deployment](#ml-model-deployment)
- [Practical Examples](#practical-examples)
- [Interview Questions](#interview-questions)

---

## Introduction

**FastAPI:** Modern, fast (high-performance) web framework for building APIs with Python 3.7+

**Key Features:**
- **Fast:** Very high performance, on par with NodeJS and Go
- **Easy:** Designed to be easy to use and learn
- **Automatic Documentation:** Interactive API docs (Swagger UI)
- **Type Hints:** Based on Python type hints
- **Async Support:** Built-in async/await support
- **Validation:** Automatic request validation with Pydantic

### FastAPI vs Flask vs Django

```
┌──────────────────────────────────────────────────────────┐
│              Framework Comparison                        │
└──────────────────────────────────────────────────────────┘

FastAPI:
  Speed:         ⚡⚡⚡⚡⚡ (Fastest)
  Learning:      ⭐⭐⭐⭐⭐ (Easy)
  Async:         ✅ Native support
  Documentation: ✅ Automatic
  Use Case:      APIs, microservices, ML deployment

Flask:
  Speed:         ⚡⚡⚡ (Medium)
  Learning:      ⭐⭐⭐⭐⭐ (Easy)
  Async:         ⚠️ Extension needed
  Documentation: ❌ Manual
  Use Case:      Simple APIs, prototyping

Django:
  Speed:         ⚡⚡ (Slower)
  Learning:      ⭐⭐⭐ (Steeper)
  Async:         ⚠️ Partial support
  Documentation: ⚠️ Built-in but not automatic
  Use Case:      Full web applications, admin panels
```

---

## Why FastAPI

### Performance

**Benchmark Comparison:**
```
Requests/Second (Higher is better)

FastAPI:  60,000  ██████████████████████████████
Starlette: 58,000 █████████████████████████████
Flask:     10,000 █████
Django:     5,000 ██
```

### Automatic Documentation

```
Write Code:
@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id}

Get Free Documentation:
  - Swagger UI:  http://localhost:8000/docs
  - ReDoc:       http://localhost:8000/redoc
  - OpenAPI:     http://localhost:8000/openapi.json
```

### Type Safety

```python
# Type hints provide:
# 1. Editor support (autocomplete)
# 2. Automatic validation
# 3. Clear documentation

def greet(name: str) -> str:  # ← Type hints
    return f"Hello, {name}"

# FastAPI uses this for validation!
@app.get("/greet/{name}")
def greet_user(name: str) -> dict:
    return {"message": f"Hello, {name}"}
```

---

## Installation & Setup

### Installation

```bash
# Install FastAPI and UVICORN (ASGI server)
pip install fastapi uvicorn

# For development (with auto-reload)
pip install "fastapi[all]"

# Optional: For production
pip install gunicorn
```

### Basic Application

```python
# main.py
from fastapi import FastAPI

# Create FastAPI instance
app = FastAPI()

# Define route
@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}
```

### Running the Application

```bash
# Development (with auto-reload)
uvicorn main:app --reload

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# With Gunicorn (production)
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

**Access:**
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Basic Concepts

### HTTP Methods

```python
from fastapi import FastAPI

app = FastAPI()

# GET - Retrieve data
@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id}

# POST - Create data
@app.post("/items/")
def create_item(item: dict):
    return {"created": item}

# PUT - Update data (full update)
@app.put("/items/{item_id}")
def update_item(item_id: int, item: dict):
    return {"item_id": item_id, "updated": item}

# PATCH - Partial update
@app.patch("/items/{item_id}")
def patch_item(item_id: int, item: dict):
    return {"item_id": item_id, "patched": item}

# DELETE - Delete data
@app.delete("/items/{item_id}")
def delete_item(item_id: int):
    return {"deleted": item_id}
```

### Status Codes

```python
from fastapi import FastAPI, status

app = FastAPI()

@app.post("/items/", status_code=status.HTTP_201_CREATED)
def create_item(item: dict):
    return item

@app.get("/items/{item_id}", status_code=status.HTTP_200_OK)
def read_item(item_id: int):
    if item_id == 0:
        # Can override status code
        return {"error": "Not found"}, status.HTTP_404_NOT_FOUND
    return {"item_id": item_id}
```

**Common Status Codes:**
```
2xx Success:
  200 OK              - Successful GET
  201 Created         - Successful POST (created)
  204 No Content      - Successful DELETE

4xx Client Errors:
  400 Bad Request     - Invalid input
  401 Unauthorized    - Authentication required
  403 Forbidden       - Authenticated but no permission
  404 Not Found       - Resource not found
  422 Unprocessable   - Validation error

5xx Server Errors:
  500 Internal Error  - Server error
  503 Unavailable     - Service down
```

---

## Request & Response Models

### Pydantic Models

**Pydantic:** Data validation using Python type annotations

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

app = FastAPI()

# Define data model
class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0, description="Price must be greater than 0")
    tax: Optional[float] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.now)

    class Config:
        schema_extra = {
            "example": {
                "name": "Laptop",
                "description": "A powerful laptop",
                "price": 999.99,
                "tax": 99.99,
                "tags": ["electronics", "computers"]
            }
        }

# Use model in endpoint
@app.post("/items/")
def create_item(item: Item):
    # Automatic validation!
    # If validation fails → 422 error with details
    return item

# Response model
@app.get("/items/{item_id}", response_model=Item)
def read_item(item_id: int):
    # Response will be validated against Item model
    return {
        "name": f"Item {item_id}",
        "price": 99.99,
        "tags": ["example"]
    }
```

### Validation Example

```python
from pydantic import BaseModel, validator, EmailStr
from typing import List

class User(BaseModel):
    username: str
    email: EmailStr  # Validates email format
    age: int
    tags: List[str] = []

    # Custom validator
    @validator('username')
    def username_alphanumeric(cls, v):
        assert v.isalnum(), 'must be alphanumeric'
        return v

    @validator('age')
    def age_must_be_positive(cls, v):
        if v < 0:
            raise ValueError('must be positive')
        if v > 150:
            raise ValueError('must be realistic')
        return v

# Test
user = User(
    username="john123",
    email="john@example.com",
    age=30
)

# This will fail validation:
# User(username="john@123", email="invalid", age=-5)
# → ValidationError with details
```

### Nested Models

```python
from pydantic import BaseModel
from typing import List, Optional

class Image(BaseModel):
    url: str
    name: str

class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    images: List[Image] = []

class Order(BaseModel):
    order_id: int
    items: List[Item]
    total: float

@app.post("/orders/")
def create_order(order: Order):
    return order

# Request body:
# {
#   "order_id": 1,
#   "items": [
#     {
#       "name": "Laptop",
#       "price": 999.99,
#       "images": [
#         {"url": "http://...", "name": "front"},
#         {"url": "http://...", "name": "back"}
#       ]
#     }
#   ],
#   "total": 999.99
# }
```

---

## Path Parameters & Query Parameters

### Path Parameters

```python
from fastapi import FastAPI
from enum import Enum

app = FastAPI()

# Simple path parameter
@app.get("/users/{user_id}")
def read_user(user_id: int):
    return {"user_id": user_id}

# Multiple path parameters
@app.get("/users/{user_id}/items/{item_id}")
def read_user_item(user_id: int, item_id: str):
    return {"user_id": user_id, "item_id": item_id}

# Enum path parameter
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
    return {"model": model_name, "message": "Have some residuals"}

# Path with file path
@app.get("/files/{file_path:path}")
def read_file(file_path: str):
    return {"file_path": file_path}
    # Matches: /files/home/user/myfile.txt
```

### Query Parameters

```python
# Query parameters (after ?)
@app.get("/items/")
def read_items(skip: int = 0, limit: int = 10):
    # GET /items/?skip=20&limit=10
    return {"skip": skip, "limit": limit}

# Optional query parameters
@app.get("/items/{item_id}")
def read_item(item_id: int, q: Optional[str] = None, short: bool = False):
    # GET /items/5?q=search&short=true
    item = {"item_id": item_id}
    if q:
        item.update({"q": q})
    if not short:
        item.update({"description": "Long description"})
    return item

# Required query parameters
@app.get("/items/{item_id}")
def read_item(item_id: int, needy: str):
    # needy is required (no default)
    # GET /items/5?needy=value
    return {"item_id": item_id, "needy": needy}

# List query parameters
@app.get("/items/")
def read_items(q: List[str] = Query(None)):
    # GET /items/?q=foo&q=bar
    return {"q": q}  # ["foo", "bar"]
```

### Request Body + Path + Query

```python
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

@app.put("/items/{item_id}")
def update_item(
    item_id: int,           # Path parameter
    item: Item,             # Request body
    q: Optional[str] = None # Query parameter
):
    result = {"item_id": item_id, **item.dict()}
    if q:
        result.update({"q": q})
    return result

# PUT /items/5?q=search
# Body: {"name": "Laptop", "price": 999.99}
```

---

## Async Endpoints

### Why Async?

```
Synchronous (Blocking):
  Request 1 → [Wait for DB] → Response 1
  Request 2 →                  [Wait for DB] → Response 2
                               ↑ Idle time!

Asynchronous (Non-blocking):
  Request 1 → [DB call] → ... → Response 1
  Request 2 → [DB call] → ... → Response 2
              ↑ Both happening concurrently!
```

### Async Endpoints

```python
from fastapi import FastAPI
import asyncio
import httpx

app = FastAPI()

# Sync endpoint
@app.get("/sync")
def sync_endpoint():
    # Blocks the thread
    import time
    time.sleep(1)
    return {"message": "Sync response"}

# Async endpoint
@app.get("/async")
async def async_endpoint():
    # Doesn't block the thread
    await asyncio.sleep(1)
    return {"message": "Async response"}

# Async with external API
@app.get("/fetch-data")
async def fetch_data():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com/data")
        return response.json()

# Async with database
from databases import Database

database = Database("postgresql://user:pass@localhost/db")

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    query = "SELECT * FROM users WHERE id = :user_id"
    result = await database.fetch_one(query=query, values={"user_id": user_id})
    return result
```

### When to Use Async

```
Use Async:
  ✅ I/O-bound operations (database, API calls, file I/O)
  ✅ Concurrent requests
  ✅ Long-running operations
  ✅ Microservices communication

Use Sync:
  ✅ CPU-bound operations
  ✅ Simple, fast computations
  ✅ No external dependencies
```

---

## Dependency Injection

### Basic Dependencies

```python
from fastapi import FastAPI, Depends, HTTPException

app = FastAPI()

# Dependency function
def get_query_token(token: str = ""):
    if not token:
        raise HTTPException(status_code=400, detail="Token required")
    return token

# Use dependency
@app.get("/items/")
def read_items(token: str = Depends(get_query_token)):
    return {"token": token}

# Dependency with parameters
def pagination(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

@app.get("/items/")
def read_items(commons: dict = Depends(pagination)):
    return commons

# Class-based dependency
class CommonQueryParams:
    def __init__(self, q: Optional[str] = None, skip: int = 0, limit: int = 10):
        self.q = q
        self.skip = skip
        self.limit = limit

@app.get("/items/")
def read_items(commons: CommonQueryParams = Depends()):
    # Depends() automatically uses CommonQueryParams
    return {
        "q": commons.q,
        "skip": commons.skip,
        "limit": commons.limit
    }
```

### Database Connection Dependency

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Use in endpoint
@app.get("/users/")
def read_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@app.post("/users/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
```

### Authentication Dependency

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    # Validate token and get user
    user = verify_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# Protected endpoint
@app.get("/users/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Admin-only endpoint
def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

@app.delete("/users/{user_id}")
def delete_user(user_id: int, admin: User = Depends(get_admin_user)):
    # Only admins can delete users
    return {"deleted": user_id}
```

---

## Error Handling

### HTTPException

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()

items = {"foo": "The Foo Wrestlers"}

@app.get("/items/{item_id}")
def read_item(item_id: str):
    if item_id not in items:
        raise HTTPException(
            status_code=404,
            detail="Item not found",
            headers={"X-Error": "Item not found"},
        )
    return {"item": items[item_id]}
```

### Custom Exception Handlers

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

class ItemNotFoundError(Exception):
    def __init__(self, item_id: str):
        self.item_id = item_id

app = FastAPI()

@app.exception_handler(ItemNotFoundError)
async def item_not_found_handler(request: Request, exc: ItemNotFoundError):
    return JSONResponse(
        status_code=404,
        content={
            "message": f"Item {exc.item_id} not found",
            "item_id": exc.item_id
        },
    )

@app.get("/items/{item_id}")
def read_item(item_id: str):
    if item_id not in items:
        raise ItemNotFoundError(item_id=item_id)
    return {"item": items[item_id]}
```

### Validation Error Override

```python
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "message": "Validation error",
            "errors": exc.errors(),
            "body": exc.body,
        },
    )
```

---

## ML Model Deployment

### Simple Model Serving

```python
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI(title="ML Model API")

# Load model at startup
model = None

@app.on_event("startup")
async def load_model():
    global model
    model = joblib.load("model.pkl")

# Request/Response models
class PredictionRequest(BaseModel):
    features: list[float]

    class Config:
        schema_extra = {
            "example": {
                "features": [5.1, 3.5, 1.4, 0.2]
            }
        }

class PredictionResponse(BaseModel):
    prediction: int
    probability: list[float]

# Prediction endpoint
@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    # Convert to numpy array
    features = np.array(request.features).reshape(1, -1)

    # Predict
    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0].tolist()

    return {
        "prediction": int(prediction),
        "probability": probability
    }

# Health check
@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model is not None}
```

### Complete ML API Example

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import numpy as np
from typing import List
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Iris Classification API",
    description="Predict iris species from measurements",
    version="1.0.0"
)

# Global model variable
model = None
scaler = None

# Models
class IrisFeatures(BaseModel):
    sepal_length: float = Field(..., ge=0, le=10, description="Sepal length in cm")
    sepal_width: float = Field(..., ge=0, le=10, description="Sepal width in cm")
    petal_length: float = Field(..., ge=0, le=10, description="Petal length in cm")
    petal_width: float = Field(..., ge=0, le=10, description="Petal width in cm")

    class Config:
        schema_extra = {
            "example": {
                "sepal_length": 5.1,
                "sepal_width": 3.5,
                "petal_length": 1.4,
                "petal_width": 0.2
            }
        }

class PredictionResponse(BaseModel):
    species: str
    confidence: float
    probabilities: dict

class BatchPredictionRequest(BaseModel):
    samples: List[IrisFeatures]

# Startup event
@app.on_event("startup")
async def load_models():
    global model, scaler
    try:
        model = joblib.load("iris_model.pkl")
        scaler = joblib.load("iris_scaler.pkl")
        logger.info("Models loaded successfully")
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        raise

# Single prediction
@app.post("/predict", response_model=PredictionResponse)
async def predict(features: IrisFeatures):
    try:
        # Convert to numpy array
        X = np.array([[
            features.sepal_length,
            features.sepal_width,
            features.petal_length,
            features.petal_width
        ]])

        # Scale features
        X_scaled = scaler.transform(X)

        # Predict
        prediction = model.predict(X_scaled)[0]
        probabilities = model.predict_proba(X_scaled)[0]

        # Class names
        species_map = {0: "setosa", 1: "versicolor", 2: "virginica"}
        species = species_map[prediction]

        # Confidence
        confidence = float(max(probabilities))

        # Probabilities dict
        prob_dict = {
            species_map[i]: float(prob)
            for i, prob in enumerate(probabilities)
        }

        logger.info(f"Prediction: {species}, Confidence: {confidence:.2f}")

        return {
            "species": species,
            "confidence": confidence,
            "probabilities": prob_dict
        }

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Batch prediction
@app.post("/predict/batch")
async def predict_batch(request: BatchPredictionRequest):
    try:
        # Convert to numpy array
        X = np.array([[
            sample.sepal_length,
            sample.sepal_width,
            sample.petal_length,
            sample.petal_width
        ] for sample in request.samples])

        # Scale and predict
        X_scaled = scaler.transform(X)
        predictions = model.predict(X_scaled)
        probabilities = model.predict_proba(X_scaled)

        # Format results
        species_map = {0: "setosa", 1: "versicolor", 2: "virginica"}
        results = []

        for pred, probs in zip(predictions, probabilities):
            results.append({
                "species": species_map[pred],
                "confidence": float(max(probs)),
                "probabilities": {
                    species_map[i]: float(prob)
                    for i, prob in enumerate(probs)
                }
            })

        return {"predictions": results}

    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Model info
@app.get("/model/info")
async def model_info():
    return {
        "model_type": str(type(model).__name__),
        "features": ["sepal_length", "sepal_width", "petal_length", "petal_width"],
        "classes": ["setosa", "versicolor", "virginica"],
        "n_features": 4,
        "n_classes": 3
    }

# Health check
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None
    }
```

---

## Practical Examples

### Example 1: CRUD API

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# In-memory database
users_db = {}
next_id = 1

# Models
class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        orm_mode = True

# CREATE
@app.post("/users/", response_model=User, status_code=201)
def create_user(user: UserCreate):
    global next_id
    user_id = next_id
    next_id += 1

    user_dict = user.dict()
    user_dict.pop('password')  # Don't store password (simplified)
    user_dict['id'] = user_id

    users_db[user_id] = user_dict
    return user_dict

# READ (all)
@app.get("/users/", response_model=List[User])
def read_users(skip: int = 0, limit: int = 10):
    users = list(users_db.values())
    return users[skip: skip + limit]

# READ (one)
@app.get("/users/{user_id}", response_model=User)
def read_user(user_id: int):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    return users_db[user_id]

# UPDATE
@app.put("/users/{user_id}", response_model=User)
def update_user(user_id: int, user: UserBase):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")

    user_dict = user.dict()
    user_dict['id'] = user_id
    users_db[user_id] = user_dict
    return user_dict

# DELETE
@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")

    del users_db[user_id]
    return {"message": "User deleted successfully"}
```

### Example 2: File Upload

```python
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
import shutil
from pathlib import Path

app = FastAPI()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = UPLOAD_DIR / file.filename

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "size": file_path.stat().st_size
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload/multiple/")
async def upload_multiple_files(files: List[UploadFile] = File(...)):
    uploaded_files = []

    for file in files:
        file_path = UPLOAD_DIR / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        uploaded_files.append({
            "filename": file.filename,
            "size": file_path.stat().st_size
        })

    return {"uploaded_files": uploaded_files}

@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = UPLOAD_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type='application/octet-stream'
    )
```

### Example 3: Background Tasks

```python
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel, EmailStr
import asyncio

app = FastAPI()

class EmailSchema(BaseModel):
    email: EmailStr
    subject: str
    body: str

# Background task function
async def send_email(email: str, subject: str, body: str):
    # Simulate email sending
    await asyncio.sleep(5)
    print(f"Email sent to {email}: {subject}")

@app.post("/send-email/")
async def send_email_endpoint(
    email_data: EmailSchema,
    background_tasks: BackgroundTasks
):
    # Add task to background
    background_tasks.add_task(
        send_email,
        email_data.email,
        email_data.subject,
        email_data.body
    )

    return {"message": "Email will be sent in background"}

# Multiple background tasks
def write_log(message: str):
    with open("log.txt", "a") as f:
        f.write(message + "\n")

@app.post("/process/")
async def process_data(data: dict, background_tasks: BackgroundTasks):
    # Add multiple tasks
    background_tasks.add_task(write_log, f"Processing: {data}")
    background_tasks.add_task(send_email, "admin@example.com", "Processing", "Data processed")

    # Return immediately
    return {"status": "processing started"}
```

---

## Interview Questions

### Q1: What is FastAPI and why would you use it over Flask?

**Answer:**

**FastAPI:** Modern, high-performance web framework for building APIs with Python 3.7+

**Key Advantages over Flask:**

| Feature | FastAPI | Flask |
|---------|---------|-------|
| **Performance** | Very fast (Node.js/Go level) | Medium speed |
| **Async Support** | Native async/await | Needs extensions |
| **Documentation** | Automatic (Swagger/OpenAPI) | Manual |
| **Validation** | Automatic with Pydantic | Manual or extensions |
| **Type Hints** | Built-in, required | Optional |
| **Editor Support** | Excellent (autocomplete) | Basic |

**When to Use FastAPI:**
- ✅ Building REST APIs
- ✅ ML model deployment
- ✅ Microservices
- ✅ High-performance requirements
- ✅ Need automatic documentation

**When to Use Flask:**
- ✅ Simple applications
- ✅ Full web applications (with templates)
- ✅ Team already familiar with Flask
- ✅ Legacy codebase

**Example:**
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

# Flask - Manual validation
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/items/", methods=["POST"])
def create_item():
    data = request.get_json()
    # Manual validation needed
    if 'name' not in data or 'price' not in data:
        return jsonify({"error": "Invalid data"}), 400
    return jsonify(data)
```

---

### Q2: Explain Pydantic models and their role in FastAPI.

**Answer:**

**Pydantic:** Data validation library using Python type annotations

**Role in FastAPI:**
1. **Request Validation:** Automatically validate incoming data
2. **Response Validation:** Ensure responses match schema
3. **Documentation:** Generate API docs from models
4. **Type Safety:** Editor support and type checking

**Example:**

```python
from pydantic import BaseModel, Field, validator
from typing import Optional

class User(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str
    age: int = Field(..., ge=0, le=150)
    is_active: bool = True

    @validator('email')
    def email_must_be_valid(cls, v):
        if '@' not in v:
            raise ValueError('Invalid email')
        return v

# Automatic validation
@app.post("/users/")
def create_user(user: User):
    # If validation fails → 422 error with details
    return user
```

**Benefits:**
- ✅ Automatic validation
- ✅ Clear error messages
- ✅ Type safety
- ✅ Schema generation
- ✅ Nested models support

**Validation Example:**
```python
# Valid request
{
    "username": "john",
    "email": "john@example.com",
    "age": 30
}
→ Success

# Invalid request
{
    "username": "ab",  # Too short
    "email": "invalid",  # No @
    "age": -5  # Negative
}
→ 422 Error with details:
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

### Q3: How do you deploy an ML model using FastAPI?

**Answer:**

**Steps:**

**1. Train and Save Model:**
```python
import joblib
from sklearn.ensemble import RandomForestClassifier

# Train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Save model
joblib.dump(model, 'model.pkl')
joblib.dump(scaler, 'scaler.pkl')
```

**2. Create FastAPI Application:**
```python
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()

# Load model at startup
model = None

@app.on_event("startup")
async def load_model():
    global model
    model = joblib.load("model.pkl")

class PredictionRequest(BaseModel):
    features: list[float]

@app.post("/predict")
def predict(request: PredictionRequest):
    X = np.array(request.features).reshape(1, -1)
    prediction = model.predict(X)[0]
    probability = model.predict_proba(X)[0].tolist()

    return {
        "prediction": int(prediction),
        "probability": probability
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
```

**3. Create Dockerfile:**
```dockerfile
FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**4. Deploy:**
```bash
# Build Docker image
docker build -t ml-api .

# Run container
docker run -p 8000:8000 ml-api

# Or deploy to cloud (AWS, GCP, Azure, Heroku)
```

**Best Practices:**
- ✅ Load model at startup, not per request
- ✅ Add health check endpoint
- ✅ Include model versioning
- ✅ Add request logging
- ✅ Handle errors gracefully
- ✅ Add authentication if needed
- ✅ Monitor performance

---

### Q4: What is dependency injection in FastAPI?

**Answer:**

**Dependency Injection:** Declare dependencies that FastAPI will automatically provide to endpoints

**Use Cases:**
- Database connections
- Authentication
- Common parameters
- Configuration
- Logging

**Example:**

```python
from fastapi import Depends

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
    # db is automatically provided
    return db.query(User).all()

# Common parameters
def pagination(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

@app.get("/items/")
def read_items(commons: dict = Depends(pagination)):
    # commons = {"skip": 0, "limit": 10}
    return commons
```

**Benefits:**
- ✅ Code reuse
- ✅ Separation of concerns
- ✅ Easy testing (can inject mocks)
- ✅ Automatic documentation

**Nested Dependencies:**
```python
def get_token(token: str):
    return token

def get_user(token: str = Depends(get_token)):
    # Uses get_token dependency
    return verify_token(token)

@app.get("/me")
def read_user(user: User = Depends(get_user)):
    # Automatically calls get_token → get_user
    return user
```

---

### Q5: How do you handle errors in FastAPI?

**Answer:**

**1. HTTPException (Built-in):**
```python
from fastapi import HTTPException

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

class CustomException(Exception):
    def __init__(self, name: str):
        self.name = name

@app.exception_handler(CustomException)
async def custom_handler(request: Request, exc: CustomException):
    return JSONResponse(
        status_code=418,
        content={"message": f"Error: {exc.name}"}
    )

@app.get("/items/{name}")
def read_item(name: str):
    if name == "error":
        raise CustomException(name=name)
    return {"name": name}
```

**3. Validation Errors:**
```python
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_handler(request, exc):
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
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error"}
    )
```

**Best Practices:**
- ✅ Use appropriate status codes
- ✅ Provide meaningful error messages
- ✅ Log errors
- ✅ Don't expose sensitive information
- ✅ Include error codes for client handling

---

## Key Takeaways

1. **FastAPI Advantages:**
   - High performance
   - Automatic documentation
   - Type safety with Pydantic
   - Async support
   - Easy to learn

2. **Core Concepts:**
   - HTTP methods (GET, POST, PUT, DELETE)
   - Path & query parameters
   - Request/Response models
   - Status codes

3. **Pydantic Models:**
   - Automatic validation
   - Type hints
   - Custom validators
   - Nested models

4. **Async Support:**
   - Use for I/O-bound operations
   - Non-blocking requests
   - Better concurrency

5. **Dependency Injection:**
   - Database connections
   - Authentication
   - Common parameters
   - Code reuse

6. **Error Handling:**
   - HTTPException
   - Custom handlers
   - Validation errors
   - Global handlers

7. **ML Deployment:**
   - Load model at startup
   - Pydantic for request validation
   - Health checks
   - Docker deployment

8. **Best Practices:**
   - Use type hints
   - Validate all inputs
   - Handle errors gracefully
   - Add health checks
   - Monitor performance
   - Use async for I/O operations

---

**Navigation:** [← Model Explainability](./model-explainability.md) | [Back to Index](./README.md) | [Next: AWS SageMaker →](./aws-sagemaker.md)
