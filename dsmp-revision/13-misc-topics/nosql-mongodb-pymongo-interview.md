# PyMongo and Interview Questions

## What You'll Learn

Bridge the gap between MongoDB and Python with PyMongo, the official MongoDB driver. This comprehensive guide covers everything from basic CRUD operations in Python to advanced aggregation pipelines and production-ready patterns. You'll also master interview questions covering NoSQL fundamentals, MongoDB specifics, and real-world scenarios that demonstrate your expertise in document databases and when to choose them over traditional SQL.

---

## Part 1: PyMongo - Python MongoDB Driver

### Installation and Setup

```python
# Install PyMongo
# pip install pymongo

from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
import pymongo

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')

# With authentication
client = MongoClient(
    'mongodb://username:password@localhost:27017/',
    authSource='admin'
)

# MongoDB Atlas (cloud)
client = MongoClient(
    'mongodb+srv://username:password@cluster.mongodb.net/',
    retryWrites=True,
    w='majority'
)

# Select database
db = client['ecommerce']

# Select collection
users = db['users']
products = db['products']
orders = db['orders']

# Check connection
try:
    client.admin.command('ping')
    print("Connected successfully!")
except Exception as e:
    print(f"Connection failed: {e}")
```

### CRUD Operations in PyMongo

**Create:**
```python
# Insert one document
user = {
    "username": "alice",
    "email": "alice@example.com",
    "age": 25,
    "created_at": datetime.now(),
    "interests": ["reading", "coding"]
}
result = users.insert_one(user)
print(f"Inserted ID: {result.inserted_id}")

# Insert multiple documents
new_users = [
    {"username": "bob", "email": "bob@example.com", "age": 30},
    {"username": "charlie", "email": "charlie@example.com", "age": 35}
]
result = users.insert_many(new_users)
print(f"Inserted IDs: {result.inserted_ids}")
```

**Read:**
```python
# Find all
for user in users.find():
    print(user)

# Find with filter
for user in users.find({"age": {"$gte": 25}}):
    print(user['username'], user['age'])

# Find one
alice = users.find_one({"username": "alice"})
print(alice)

# Find with projection
cursor = users.find(
    {"age": {"$gte": 25}},
    {"username": 1, "email": 1, "_id": 0}
)
for user in cursor:
    print(user)

# Find with sort, limit, skip
cursor = users.find().sort("age", -1).limit(10).skip(5)

# Count documents
count = users.count_documents({"age": {"$gte": 25}})
print(f"Count: {count}")

# Distinct values
cities = users.distinct("profile.city")
print(cities)
```

**Update:**
```python
# Update one
result = users.update_one(
    {"username": "alice"},
    {"$set": {"age": 26, "updated_at": datetime.now()}}
)
print(f"Modified: {result.modified_count}")

# Update many
result = users.update_many(
    {"age": {"$lt": 18}},
    {"$set": {"status": "minor"}}
)

# Update operators
users.update_one(
    {"username": "alice"},
    {
        "$set": {"email": "newemail@example.com"},
        "$inc": {"login_count": 1},
        "$push": {"interests": "cooking"},
        "$currentDate": {"last_modified": True}
    }
)

# Upsert
users.update_one(
    {"username": "david"},
    {"$set": {"age": 28, "email": "david@example.com"}},
    upsert=True
)

# Replace one
users.replace_one(
    {"username": "alice"},
    {
        "username": "alice",
        "email": "alice@example.com",
        "age": 26
    }
)
```

**Delete:**
```python
# Delete one
result = users.delete_one({"username": "alice"})
print(f"Deleted: {result.deleted_count}")

# Delete many
result = users.delete_many({"age": {"$lt": 18}})
print(f"Deleted: {result.deleted_count}")

# Delete all
result = users.delete_many({})
```

### Advanced PyMongo

**Aggregation:**
```python
# Simple aggregation
pipeline = [
    {"$match": {"status": "active"}},
    {"$group": {
        "_id": "$city",
        "count": {"$sum": 1},
        "avg_age": {"$avg": "$age"}
    }},
    {"$sort": {"count": -1}},
    {"$limit": 10}
]

results = users.aggregate(pipeline)
for doc in results:
    print(doc)

# Complex aggregation
pipeline = [
    {"$match": {"created_at": {"$gte": datetime(2024, 1, 1)}}},
    {"$lookup": {
        "from": "orders",
        "localField": "_id",
        "foreignField": "user_id",
        "as": "orders"
    }},
    {"$unwind": "$orders"},
    {"$group": {
        "_id": "$_id",
        "username": {"$first": "$username"},
        "total_orders": {"$sum": 1},
        "total_spent": {"$sum": "$orders.total"}
    }},
    {"$sort": {"total_spent": -1}},
    {"$limit": 5}
]

top_customers = users.aggregate(pipeline)
for customer in top_customers:
    print(customer)
```

**Indexing:**
```python
# Create index
users.create_index("email", unique=True)

# Compound index
users.create_index([("age", pymongo.ASCENDING), ("city", pymongo.ASCENDING)])

# Text index
products.create_index([("name", "text"), ("description", "text")])

# TTL index
sessions.create_index("created_at", expireAfterSeconds=3600)

# List indexes
for index in users.list_indexes():
    print(index)

# Drop index
users.drop_index("email_1")
```

**Bulk Operations:**
```python
from pymongo import InsertOne, UpdateOne, DeleteOne

operations = [
    InsertOne({"username": "user1", "email": "user1@example.com"}),
    UpdateOne({"username": "user2"}, {"$set": {"status": "active"}}),
    DeleteOne({"username": "user3"})
]

result = users.bulk_write(operations)
print(f"Inserted: {result.inserted_count}")
print(f"Modified: {result.modified_count}")
print(f"Deleted: {result.deleted_count}")
```

**Transactions:**
```python
# Transactions (MongoDB 4.0+, replica set required)
with client.start_session() as session:
    with session.start_transaction():
        try:
            # Deduct from account A
            accounts.update_one(
                {"account_id": "A"},
                {"$inc": {"balance": -100}},
                session=session
            )

            # Add to account B
            accounts.update_one(
                {"account_id": "B"},
                {"$inc": {"balance": 100}},
                session=session
            )

            # Commit if both succeed
            session.commit_transaction()
        except Exception as e:
            # Rollback on error
            session.abort_transaction()
            print(f"Transaction failed: {e}")
```

### PyMongo Best Practices

```python
# 1. Use context managers for connections
from contextlib import contextmanager

@contextmanager
def get_db():
    client = MongoClient('mongodb://localhost:27017/')
    try:
        yield client['ecommerce']
    finally:
        client.close()

with get_db() as db:
    users = db['users'].find()

# 2. Handle connection errors
try:
    client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=5000)
    client.server_info()
except pymongo.errors.ServerSelectionTimeoutError as e:
    print(f"Cannot connect: {e}")

# 3. Use connection pooling
client = MongoClient(
    'mongodb://localhost:27017/',
    maxPoolSize=50,
    minPoolSize=10
)

# 4. Batch inserts for performance
batch = []
for i in range(1000):
    batch.append({"item": i})
    if len(batch) == 100:
        users.insert_many(batch)
        batch = []
if batch:
    users.insert_many(batch)

# 5. Use projection to reduce data transfer
users.find({}, {"_id": 0, "username": 1, "email": 1})
```

---

## Part 2: Interview Questions

### Q1: What is the difference between SQL and NoSQL databases?

**Answer:**

| Aspect | SQL | NoSQL |
|--------|-----|-------|
| **Data Model** | Tables with fixed schema | Flexible (documents, key-value, etc.) |
| **Schema** | Predefined, rigid | Dynamic, schema-less |
| **Scalability** | Vertical (bigger hardware) | Horizontal (more servers) |
| **Relationships** | Foreign keys, JOINs | Embedded docs or references |
| **ACID** | Strong guarantees | Eventual consistency (configurable) |
| **Query Language** | SQL (standardized) | Varies by database |
| **Best For** | Complex transactions, relationships | Large scale, flexible data, high velocity |

**When to Use:**
- **SQL:** Banking, complex queries, stable schema, strong consistency
- **NoSQL:** Social media, IoT, real-time analytics, flexible schema

---

### Q2: Explain MongoDB document structure and BSON

**Answer:**

**BSON (Binary JSON):** MongoDB's binary representation of JSON documents.

**Document Structure:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "john_doe",
  "age": 30,
  "created_at": ISODate("2024-01-15"),
  "profile": {
    "city": "New York",
    "country": "USA"
  },
  "interests": ["reading", "coding"],
  "settings": {
    "notifications": true
  }
}
```

**Key Features:**
1. **Flexible Schema:** Different documents can have different fields
2. **Nested Documents:** Hierarchical data naturally represented
3. **Arrays:** First-class support for lists
4. **Rich Data Types:** ObjectId, Date, Binary, Regex, etc.
5. **_id Field:** Auto-generated unique identifier

**Advantages:**
- Natural representation of objects
- No need for JOINs
- Easy schema evolution

---

### Q3: What are the advantages of MongoDB over SQL databases?

**Answer:**

**Advantages:**

**1. Flexible Schema:**
```javascript
// Different structures in same collection - OK!
{username: "alice", age: 25}
{username: "bob", age: 30, city: "NYC", hobbies: ["reading"]}
```

**2. Horizontal Scalability:**
- Add more servers (sharding)
- SQL requires expensive hardware upgrades

**3. Natural Data Representation:**
```javascript
// One document vs multiple SQL tables
{
  user: "alice",
  orders: [
    {product: "iPhone", price: 999},
    {product: "MacBook", price: 1999}
  ]
}
```

**4. High Performance:**
- Fast reads/writes for simple queries
- Optimized for hierarchical data

**5. Developer Friendly:**
- JSON matches application objects
- No ORM needed
- Easy prototyping

**Disadvantages:**
1. Limited transaction support (weaker than SQL)
2. No native JOINs ($lookup is slower)
3. Data duplication with denormalization
4. Memory overhead with BSON

**Best Use Cases:** Content management, real-time analytics, IoT, user profiles, product catalogs

---

### Q4: Explain the aggregation pipeline in MongoDB

**Answer:**

**Aggregation Pipeline:** Process documents through multiple stages to transform data.

**Visual:**
```
Documents → [$match] → [$group] → [$sort] → [$project] → Results
```

**Common Stages:**

| Stage | Purpose |
|-------|---------|
| `$match` | Filter documents |
| `$group` | Group and aggregate |
| `$project` | Select/transform fields |
| `$sort` | Sort results |
| `$limit` | Limit results |
| `$lookup` | Join collections |
| `$unwind` | Deconstruct arrays |

**Example:**
```javascript
// Calculate average order value per customer
db.orders.aggregate([
  // Stage 1: Filter 2024 orders
  {$match: {year: 2024}},

  // Stage 2: Group by customer
  {$group: {
    _id: "$customer_id",
    total_orders: {$sum: 1},
    total_spent: {$sum: "$amount"},
    avg_order: {$avg: "$amount"}
  }},

  // Stage 3: Sort by total spent
  {$sort: {total_spent: -1}},

  // Stage 4: Top 10
  {$limit: 10}
])
```

**Key Points:**
- Each stage transforms documents
- Output of one stage → input of next
- Powerful for analytics and reporting

---

### Q5: How do you handle relationships in MongoDB?

**Answer:**

Two main approaches:

**1. Embedded Documents (Denormalization):**

**When:** One-to-few, data accessed together
```javascript
{
  "_id": ObjectId("..."),
  "username": "alice",
  "posts": [
    {title: "First Post", content: "...", date: ISODate("2024-01-01")},
    {title: "Second Post", content: "...", date: ISODate("2024-01-02")}
  ]
}
```

**Pros:** Single query, atomic updates, better performance
**Cons:** Data duplication, 16MB limit, harder to query nested

**2. References (Normalization):**

**When:** One-to-many, independent data
```javascript
// Users collection
{_id: ObjectId("user1"), username: "alice"}

// Posts collection
{_id: ObjectId("post1"), user_id: ObjectId("user1"), title: "First Post"}
```

**Join with $lookup:**
```javascript
db.posts.aggregate([{
  $lookup: {
    from: "users",
    localField: "user_id",
    foreignField: "_id",
    as: "user"
  }
}])
```

**Pros:** No duplication, easier updates
**Cons:** Multiple queries, slower performance

**Decision Matrix:**
- User profile + address → Embedded (one-to-one)
- Blog post + comments (limited) → Embedded (one-to-few)
- User + many orders → References (one-to-many)
- Students + courses → References (many-to-many)

---

### Q6: How do you index in MongoDB and why is it important?

**Answer:**

**Why Indexing:**

Without index:
```
Collection Scan: O(n) - Check every document
Slow for large collections
```

With index:
```
Index Scan: O(log n) - B-tree lookup
Fast even for millions of documents
```

**Creating Indexes:**

```javascript
// Single field
db.users.createIndex({email: 1})

// Compound index
db.users.createIndex({age: 1, city: 1})

// Unique index
db.users.createIndex({email: 1}, {unique: true})

// Text index
db.products.createIndex({name: "text", description: "text"})
```

**Best Practices:**

**1. Index frequently queried fields:**
```javascript
db.users.find({email: "alice@example.com"})
// Create: db.users.createIndex({email: 1})
```

**2. Compound index order (ESR):**
```
Equality → Sort → Range

Query: {status: "active", age: {$gte: 25}}.sort({created_at: -1})
Index: {status: 1, created_at: -1, age: 1}
```

**3. Don't over-index:**
- Indexes slow writes
- Use memory
- Index only frequently queried fields

**4. Monitor with explain():**
```javascript
db.users.find({email: "..."}).explain("executionStats")
```

---

## Quick Reference

### PyMongo Essentials

```python
# Connect
client = MongoClient('mongodb://localhost:27017/')
db = client['database_name']
collection = db['collection_name']

# CRUD
collection.insert_one({...})
collection.find({filter})
collection.update_one({filter}, {$set: {...}})
collection.delete_one({filter})

# Aggregation
collection.aggregate([pipeline])

# Indexing
collection.create_index("field")
```

### Interview Topics

1. NoSQL vs SQL differences
2. MongoDB document structure (BSON)
3. Advantages and disadvantages
4. Aggregation pipeline
5. Relationships (embed vs reference)
6. Indexing strategies
7. When to use MongoDB
8. Scaling strategies

---

## Navigation

[← Previous: Indexing and Aggregation](./nosql-mongodb-indexing-aggregation.md) | [Back to Index](./README.md) | [Model Explainability →](./model-explainability-intro.md)
