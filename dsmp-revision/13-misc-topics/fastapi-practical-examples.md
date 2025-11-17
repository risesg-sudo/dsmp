# FastAPI: Practical Real-World Examples

## What You'll Learn

Move beyond hello-world examples into real-world patterns. Build complete CRUD APIs, handle file uploads, process background tasks, and see how all FastAPI concepts come together in production-ready code you can adapt for your own projects.

## Example 1: Complete CRUD API

A full create, read, update, delete API with in-memory storage:

```python
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

app = FastAPI(title="User Management API")

# In-memory database
users_db = {}
next_id = 1

# Pydantic models
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# CREATE
@app.post("/users/", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate):
    """Create a new user"""
    global next_id

    # Check if username exists
    for existing_user in users_db.values():
        if existing_user["username"] == user.username:
            raise HTTPException(
                status_code=400,
                detail="Username already exists"
            )
        if existing_user["email"] == user.email:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

    # Create user
    user_id = next_id
    next_id += 1

    user_dict = user.dict()
    user_dict.pop('password')  # Don't store password (simplified)
    user_dict['id'] = user_id
    user_dict['created_at'] = datetime.now()

    users_db[user_id] = user_dict
    return user_dict

# READ ALL
@app.get("/users/", response_model=List[User])
def read_users(skip: int = 0, limit: int = 10, is_active: Optional[bool] = None):
    """Get list of users with pagination"""
    users = list(users_db.values())

    # Filter by is_active if specified
    if is_active is not None:
        users = [u for u in users if u["is_active"] == is_active]

    return users[skip: skip + limit]

# READ ONE
@app.get("/users/{user_id}", response_model=User)
def read_user(user_id: int):
    """Get a specific user by ID"""
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    return users_db[user_id]

# UPDATE
@app.put("/users/{user_id}", response_model=User)
def update_user(user_id: int, user: UserUpdate):
    """Update a user (partial update supported)"""
    if user_id not in users_db:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Update only provided fields
    existing_user = users_db[user_id]
    update_data = user.dict(exclude_unset=True)

    # Check username uniqueness
    if "username" in update_data:
        for uid, u in users_db.items():
            if uid != user_id and u["username"] == update_data["username"]:
                raise HTTPException(
                    status_code=400,
                    detail="Username already exists"
                )

    # Update user
    for field, value in update_data.items():
        existing_user[field] = value

    return existing_user

# DELETE
@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int):
    """Delete a user"""
    if user_id not in users_db:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    del users_db[user_id]
    return None

# SEARCH
@app.get("/users/search/", response_model=List[User])
def search_users(q: str, limit: int = 10):
    """Search users by username or email"""
    results = []
    for user in users_db.values():
        if (q.lower() in user["username"].lower() or
            q.lower() in user["email"].lower()):
            results.append(user)

    return results[:limit]
```

## Example 2: File Upload and Download

Handle file uploads with validation:

```python
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
import shutil
from pathlib import Path
from typing import List
import aiofiles

app = FastAPI()

# Upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed file types
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf", ".txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_file(file: UploadFile):
    """Validate file extension and size"""
    # Check extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_ext} not allowed. Allowed: {ALLOWED_EXTENSIONS}"
        )

# Single file upload
@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    """Upload a single file"""
    validate_file(file)

    try:
        file_path = UPLOAD_DIR / file.filename

        # Save file
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()

            # Check file size
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024}MB"
                )

            await out_file.write(content)

        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(content),
            "location": str(file_path)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Multiple files upload
@app.post("/upload/multiple/")
async def upload_multiple_files(files: List[UploadFile] = File(...)):
    """Upload multiple files"""
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed")

    uploaded_files = []

    for file in files:
        validate_file(file)
        file_path = UPLOAD_DIR / file.filename

        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)

        uploaded_files.append({
            "filename": file.filename,
            "size": len(content)
        })

    return {
        "uploaded_files": uploaded_files,
        "total_files": len(uploaded_files)
    }

# List files
@app.get("/files/")
def list_files():
    """List all uploaded files"""
    files = []
    for file_path in UPLOAD_DIR.iterdir():
        if file_path.is_file():
            files.append({
                "filename": file_path.name,
                "size": file_path.stat().st_size,
                "modified": file_path.stat().st_mtime
            })
    return {"files": files}

# Download file
@app.get("/download/{filename}")
async def download_file(filename: str):
    """Download a file"""
    file_path = UPLOAD_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type='application/octet-stream'
    )

# Delete file
@app.delete("/files/{filename}")
def delete_file(filename: str):
    """Delete a file"""
    file_path = UPLOAD_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    file_path.unlink()
    return {"message": f"File {filename} deleted successfully"}
```

## Example 3: Background Tasks

Process tasks asynchronously without blocking the response:

```python
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel, EmailStr
import asyncio
import logging
from datetime import datetime

app = FastAPI()
logger = logging.getLogger(__name__)

# Email model
class EmailSchema(BaseModel):
    email: EmailStr
    subject: str
    body: str

# Simulated task functions
async def send_email(email: str, subject: str, body: str):
    """Simulate sending an email"""
    logger.info(f"Sending email to {email}")
    await asyncio.sleep(3)  # Simulate slow operation
    logger.info(f"Email sent to {email}: {subject}")

async def process_data(data: dict):
    """Simulate data processing"""
    logger.info(f"Processing data: {data}")
    await asyncio.sleep(5)
    logger.info(f"Data processing complete: {data}")

def write_log(message: str):
    """Write to log file"""
    with open("app.log", "a") as f:
        timestamp = datetime.now().isoformat()
        f.write(f"[{timestamp}] {message}\n")

# Send email endpoint
@app.post("/send-email/")
async def send_email_endpoint(
    email_data: EmailSchema,
    background_tasks: BackgroundTasks
):
    """Send email in background"""
    # Add task to background
    background_tasks.add_task(
        send_email,
        email_data.email,
        email_data.subject,
        email_data.body
    )

    # Return immediately
    return {
        "message": "Email will be sent in background",
        "email": email_data.email
    }

# Process with multiple background tasks
@app.post("/process/")
async def process_endpoint(
    data: dict,
    background_tasks: BackgroundTasks
):
    """Process data with multiple background tasks"""

    # Add multiple tasks
    background_tasks.add_task(write_log, f"Processing started: {data}")
    background_tasks.add_task(process_data, data)
    background_tasks.add_task(
        send_email,
        "admin@example.com",
        "Processing Started",
        f"Data processing started for: {data}"
    )

    # Return immediately
    return {
        "status": "processing",
        "message": "Data processing started in background"
    }

# Order processing example
class Order(BaseModel):
    order_id: int
    customer_email: EmailStr
    items: List[dict]
    total: float

async def update_inventory(items: List[dict]):
    """Update inventory"""
    logger.info("Updating inventory")
    await asyncio.sleep(2)
    logger.info("Inventory updated")

async def send_order_confirmation(email: str, order_id: int):
    """Send order confirmation email"""
    await send_email(
        email,
        f"Order Confirmation - {order_id}",
        f"Your order {order_id} has been confirmed"
    )

async def notify_warehouse(order_id: int):
    """Notify warehouse system"""
    logger.info(f"Notifying warehouse for order {order_id}")
    await asyncio.sleep(1)
    logger.info(f"Warehouse notified for order {order_id}")

@app.post("/orders/")
async def create_order(order: Order, background_tasks: BackgroundTasks):
    """Create order with background processing"""

    # Save order (immediate)
    logger.info(f"Order {order.order_id} created")

    # Process in background
    background_tasks.add_task(update_inventory, order.items)
    background_tasks.add_task(send_order_confirmation, order.customer_email, order.order_id)
    background_tasks.add_task(notify_warehouse, order.order_id)
    background_tasks.add_task(write_log, f"Order {order.order_id} created")

    # Return immediately
    return {
        "order_id": order.order_id,
        "status": "confirmed",
        "message": "Order confirmed. Processing in background."
    }
```

## Example 4: Rate Limiting

Implement API rate limiting:

```python
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import time
from collections import defaultdict
from datetime import datetime, timedelta

app = FastAPI()

# Simple in-memory rate limiter
class RateLimiter:
    def __init__(self, calls: int, period: int):
        self.calls = calls  # Number of calls allowed
        self.period = period  # Time period in seconds
        self.clients = defaultdict(list)  # Store timestamps per client

    async def __call__(self, request: Request):
        # Get client IP
        client = request.client.host

        # Get current time
        now = time.time()

        # Clean old timestamps
        self.clients[client] = [
            timestamp for timestamp in self.clients[client]
            if now - timestamp < self.period
        ]

        # Check rate limit
        if len(self.clients[client]) >= self.calls:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Rate limit exceeded",
                    "message": f"Maximum {self.calls} requests per {self.period} seconds",
                    "retry_after": self.period - (now - self.clients[client][0])
                }
            )

        # Add current request
        self.clients[client].append(now)

# Create rate limiters
strict_limiter = RateLimiter(calls=10, period=60)  # 10 requests per minute
relaxed_limiter = RateLimiter(calls=100, period=60)  # 100 requests per minute

# Apply rate limiter to specific routes
from fastapi import Depends

@app.get("/api/strict/", dependencies=[Depends(strict_limiter)])
def strict_endpoint():
    return {"message": "This endpoint is strictly rate-limited"}

@app.get("/api/relaxed/", dependencies=[Depends(relaxed_limiter)])
def relaxed_endpoint():
    return {"message": "This endpoint has relaxed rate-limiting"}

# Global rate limiter
from fastapi.middleware.base import BaseHTTPMiddleware

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, calls=100, period=60):
        super().__init__(app)
        self.rate_limiter = RateLimiter(calls, period)

    async def dispatch(self, request: Request, call_next):
        try:
            await self.rate_limiter(request)
        except HTTPException as exc:
            return JSONResponse(
                status_code=exc.status_code,
                content=exc.detail
            )

        response = await call_next(request)
        return response

# Add global rate limiter
# app.add_middleware(RateLimitMiddleware, calls=1000, period=3600)
```

## Best Practices in Examples

**1. Always Validate Input**
```python
# All examples use Pydantic models for automatic validation
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3)
    email: EmailStr
```

**2. Proper Error Handling**
```python
# Check existence before operations
if user_id not in users_db:
    raise HTTPException(status_code=404, detail="User not found")
```

**3. Use Appropriate Status Codes**
```python
# 201 for creation
@app.post("/users/", status_code=status.HTTP_201_CREATED)

# 204 for deletion
@app.delete("/users/{id}", status_code=status.HTTP_204_NO_CONTENT)
```

**4. Background Tasks for Long Operations**
```python
# Don't block the response
background_tasks.add_task(send_email, ...)
return {"status": "processing"}
```

## Quick Reference

```python
# CRUD operations
@app.post("/items/", status_code=201)  # Create
@app.get("/items/")                     # Read all
@app.get("/items/{id}")                 # Read one
@app.put("/items/{id}")                 # Update
@app.delete("/items/{id}", status_code=204)  # Delete

# File upload
@app.post("/upload/")
async def upload(file: UploadFile = File(...)):
    content = await file.read()
    return {"filename": file.filename}

# Background tasks
@app.post("/task/")
async def task(background_tasks: BackgroundTasks):
    background_tasks.add_task(slow_function)
    return {"status": "processing"}
```

---

**Navigation:** [← ML Model Deployment](./fastapi-ml-deployment.md) | [Back to Index](./README.md) | [Next: Interview Questions Part 1 →](./fastapi-interview-questions-1.md)
