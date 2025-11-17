# FastAPI: Dependency Injection Mastery

## What You'll Learn

Discover how dependency injection transforms messy, repetitive code into elegant, reusable patterns. Learn to share database connections, enforce authentication, extract common parameters, and build a clean architecture that scales from simple APIs to complex enterprise systems.

## What is Dependency Injection?

Dependency injection is a pattern where you declare what your endpoint needs, and FastAPI automatically provides it. Instead of creating database connections, parsing tokens, or validating permissions in every endpoint, you declare dependencies once and reuse them everywhere.

Think of it as ordering at a restaurant: you don't go into the kitchen to make your ingredients - you just tell the waiter what you want, and everything appears on your table.

### Without Dependency Injection

```python
@app.get("/users/me")
def get_current_user(token: str):
    # Repeated in every endpoint!
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    return user

@app.get("/posts/")
def get_posts(token: str):
    # Same authentication logic repeated!
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    # ... rest of the endpoint
```

### With Dependency Injection

```python
from fastapi import Depends

def get_current_user(token: str):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    return user

# Now just reuse everywhere!
@app.get("/users/me")
def read_user(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/posts/")
def get_posts(current_user: User = Depends(get_current_user)):
    # Authentication handled automatically!
    return get_user_posts(current_user.id)
```

## Basic Dependencies

### Simple Function Dependencies

```python
from fastapi import Depends, HTTPException

def verify_token(token: str = ""):
    if not token:
        raise HTTPException(status_code=400, detail="Token required")
    return token

def verify_key(api_key: str = ""):
    if api_key != "secret-key":
        raise HTTPException(status_code=403, detail="Invalid API key")
    return api_key

@app.get("/items/")
def read_items(token: str = Depends(verify_token)):
    return {"token": token}

@app.get("/protected/")
def protected_route(
    token: str = Depends(verify_token),
    api_key: str = Depends(verify_key)
):
    # Both dependencies automatically executed
    return {"message": "Access granted"}
```

### Dependency with Parameters

```python
def pagination(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

@app.get("/items/")
def read_items(commons: dict = Depends(pagination)):
    # commons = {"skip": 0, "limit": 10}
    return {"pagination": commons}

# Multiple endpoints can reuse
@app.get("/users/")
def read_users(commons: dict = Depends(pagination)):
    return {"pagination": commons, "users": [...]}
```

## Class-Based Dependencies

Classes as dependencies provide cleaner, more organized code:

```python
from typing import Optional

class CommonQueryParams:
    def __init__(
        self,
        q: Optional[str] = None,
        skip: int = 0,
        limit: int = 10
    ):
        self.q = q
        self.skip = skip
        self.limit = limit

@app.get("/items/")
def read_items(commons: CommonQueryParams = Depends()):
    # Depends() without arguments uses the type itself
    return {
        "q": commons.q,
        "skip": commons.skip,
        "limit": commons.limit
    }
```

## Database Connection Dependency

One of the most common uses: managing database connections.

### SQLAlchemy Example

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi import Depends

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db  # Endpoint uses this
    finally:
        db.close()  # Always closes, even if error

# Use in endpoints
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

@app.get("/users/{user_id}")
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

The `yield` pattern ensures the database connection is always closed, even if the endpoint raises an exception.

## Authentication Dependencies

### Bearer Token Authentication

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    """Dependency that validates token and returns user"""
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

@app.get("/posts/")
def read_posts(current_user: User = Depends(get_current_user)):
    return get_user_posts(current_user.id)
```

### Nested Dependencies

Dependencies can depend on other dependencies:

```python
def get_token(token: str = ""):
    if not token:
        raise HTTPException(status_code=401, detail="Token required")
    return token

def get_current_user(token: str = Depends(get_token)):
    # Uses get_token dependency
    user = verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

def get_admin_user(current_user: User = Depends(get_current_user)):
    # Uses get_current_user dependency (which uses get_token)
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

# Admin-only endpoint
@app.delete("/users/{user_id}")
def delete_user(user_id: int, admin: User = Depends(get_admin_user)):
    # Automatically checks: token → user → admin
    return {"deleted": user_id}
```

## Advanced Patterns

### Configurable Dependencies

```python
from typing import Optional

class RateLimiter:
    def __init__(self, calls: int, period: int):
        self.calls = calls
        self.period = period

    def __call__(self, request: Request):
        # Check rate limit
        client_ip = request.client.host
        # ... rate limiting logic ...
        return True

# Different rate limits for different endpoints
strict_limiter = RateLimiter(calls=10, period=60)
relaxed_limiter = RateLimiter(calls=100, period=60)

@app.get("/strict/", dependencies=[Depends(strict_limiter)])
def strict_endpoint():
    return {"message": "Limited to 10 calls/minute"}

@app.get("/relaxed/", dependencies=[Depends(relaxed_limiter)])
def relaxed_endpoint():
    return {"message": "Limited to 100 calls/minute"}
```

### Dependencies with State

```python
class ConnectionPool:
    def __init__(self):
        self.connections = []

    async def get_connection(self):
        # Return connection from pool
        pass

# Create once at startup
pool = ConnectionPool()

async def get_connection():
    connection = await pool.get_connection()
    try:
        yield connection
    finally:
        await connection.close()

@app.get("/data/")
async def get_data(conn = Depends(get_connection)):
    return await conn.fetch_all("SELECT * FROM data")
```

### Global Dependencies

Apply dependencies to all routes:

```python
app = FastAPI(dependencies=[Depends(verify_api_key)])

# Now ALL routes require valid API key
@app.get("/users/")
def read_users():
    pass

@app.get("/posts/")
def read_posts():
    pass
```

Or to a router:

```python
from fastapi import APIRouter

router = APIRouter(
    prefix="/admin",
    dependencies=[Depends(get_admin_user)]
)

# All routes in this router require admin
@router.get("/users/")
def admin_list_users():
    pass

@router.delete("/users/{user_id}")
def admin_delete_user(user_id: int):
    pass

app.include_router(router)
```

## Real-World Example: Complete Auth System

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# Configuration
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency: Get DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency: Get current user from token
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception

    return user

# Dependency: Get active user
def get_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Dependency: Get admin user
def get_admin_user(current_user: User = Depends(get_active_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

# Login endpoint
@app.post("/token")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect credentials")

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# Protected endpoints
@app.get("/users/me")
def read_users_me(current_user: User = Depends(get_active_user)):
    return current_user

@app.get("/admin/users/")
def admin_users(admin: User = Depends(get_admin_user)):
    return {"message": "Admin access granted"}
```

## Best Practices

**1. Keep Dependencies Pure**
Dependencies should have minimal side effects and be easy to test:

```python
# Good - Pure, testable
def get_current_user(token: str = Depends(oauth2_scheme)):
    return verify_token(token)

# Avoid - Side effects
def get_current_user(token: str = Depends(oauth2_scheme)):
    user = verify_token(token)
    log_access(user)  # Side effect!
    send_notification(user)  # Side effect!
    return user
```

**2. Use Type Hints**
Always provide type hints for better editor support and documentation:

```python
# Good
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**3. Use yield for Cleanup**
Always use `yield` when resources need cleanup:

```python
def get_resource():
    resource = acquire_resource()
    try:
        yield resource
    finally:
        resource.cleanup()
```

## Common Pitfalls

**1. Circular Dependencies**
```python
# Bad - Circular dependency!
def dep_a(b = Depends(dep_b)):
    pass

def dep_b(a = Depends(dep_a)):
    pass
```

**2. Forgetting Depends()**
```python
# Bad - Function is called immediately!
@app.get("/items/")
def read_items(commons = CommonQueryParams()):
    pass

# Good - Function is used as dependency
@app.get("/items/")
def read_items(commons = Depends(CommonQueryParams)):
    pass
```

## Quick Reference

```python
from fastapi import Depends

# Basic dependency
def common_params(q: str = None):
    return {"q": q}

@app.get("/items/")
def read_items(commons: dict = Depends(common_params)):
    return commons

# Class dependency
class CommonQueryParams:
    def __init__(self, q: str = None):
        self.q = q

@app.get("/items/")
def read_items(commons = Depends(CommonQueryParams)):
    return commons

# Nested dependencies
def get_user(token: str = Depends(oauth2_scheme)):
    return verify_token(token)

def get_admin(user = Depends(get_user)):
    if not user.is_admin:
        raise HTTPException(403)
    return user

@app.delete("/users/{user_id}")
def delete_user(user_id: int, admin = Depends(get_admin)):
    return {"deleted": user_id}
```

---

**Navigation:** [← Async Endpoints](./fastapi-async.md) | [Back to Index](./README.md) | [Next: Error Handling →](./fastapi-error-handling.md)
