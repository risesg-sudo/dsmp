# NoSQL Databases - MongoDB

## 📖 Table of Contents
- [Introduction](#introduction)
- [NoSQL vs SQL](#nosql-vs-sql)
- [MongoDB Basics](#mongodb-basics)
- [Document Structure](#document-structure)
- [CRUD Operations](#crud-operations)
- [Querying](#querying)
- [Indexing](#indexing)
- [Aggregation Pipeline](#aggregation-pipeline)
- [PyMongo](#pymongo)
- [Practical Examples](#practical-examples)
- [Interview Questions](#interview-questions)

---

## Introduction

NoSQL databases are non-relational databases designed for:
- **Scalability:** Horizontal scaling (add more servers)
- **Flexibility:** Schema-less or flexible schema
- **Performance:** Optimized for specific use cases
- **Big Data:** Handle large volumes of unstructured data

### Types of NoSQL Databases

```
┌─────────────────────────────────────────────────────────┐
│                    NoSQL Database Types                 │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┬──────────────┐
        │                 │                 │              │
        ▼                 ▼                 ▼              ▼
   Document          Key-Value          Column-      Graph
   Stores            Stores             Family       Databases
        │                 │                 │              │
        │                 │                 │              │
   MongoDB           Redis             Cassandra      Neo4j
   CouchDB          DynamoDB           HBase          ArangoDB
   DocumentDB       Memcached          ScyllaDB       OrientDB
```

**MongoDB** is a document-oriented NoSQL database.

---

## NoSQL vs SQL

### Comparison Table

| Aspect | SQL (Relational) | NoSQL (MongoDB) |
|--------|------------------|-----------------|
| **Data Model** | Tables with rows & columns | Documents (JSON-like) |
| **Schema** | Fixed schema (predefined) | Flexible/Dynamic schema |
| **Relationships** | Foreign keys, JOINs | Embedded documents, references |
| **Scalability** | Vertical (better hardware) | Horizontal (more servers) |
| **ACID** | Strong ACID guarantees | Eventual consistency (configurable) |
| **Best For** | Complex queries, transactions | Large scale, flexible data |
| **Examples** | MySQL, PostgreSQL, Oracle | MongoDB, Cassandra, CouchDB |

### Visual Comparison

**SQL Structure:**
```
Users Table:
┌────┬──────────┬─────────┬───────────────────┐
│ id │ username │ email   │ created_at        │
├────┼──────────┼─────────┼───────────────────┤
│ 1  │ john     │ j@e.com │ 2024-01-01        │
│ 2  │ jane     │ ja@e.com│ 2024-01-02        │
└────┴──────────┴─────────┴───────────────────┘

Posts Table:
┌────┬─────────┬─────────────┬────────────┐
│ id │ user_id │ title       │ content    │
├────┼─────────┼─────────────┼────────────┤
│ 1  │ 1       │ First Post  │ Hello...   │
│ 2  │ 1       │ Second Post │ World...   │
└────┴─────────┴─────────────┴────────────┘

Need JOIN to get user with posts
```

**MongoDB Structure:**
```
users Collection:
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "john",
  "email": "j@e.com",
  "created_at": ISODate("2024-01-01"),
  "posts": [                              ← Embedded documents
    {
      "title": "First Post",
      "content": "Hello...",
      "created_at": ISODate("2024-01-01")
    },
    {
      "title": "Second Post",
      "content": "World...",
      "created_at": ISODate("2024-01-02")
    }
  ]
}

Everything in one document - No JOINs needed!
```

### When to Use NoSQL vs SQL

**Use SQL When:**
- ✅ Complex relationships and JOINs
- ✅ ACID transactions critical (banking, finance)
- ✅ Well-defined, stable schema
- ✅ Strong consistency required
- ✅ Complex queries with aggregations

**Use NoSQL (MongoDB) When:**
- ✅ Flexible/evolving schema
- ✅ Horizontal scalability needed
- ✅ Large volumes of unstructured data
- ✅ Fast reads/writes more important than complex queries
- ✅ Hierarchical data (JSON-like)
- ✅ Real-time analytics

**Examples:**

| Use Case | Best Choice | Why |
|----------|-------------|-----|
| Banking transactions | SQL | ACID, consistency |
| User profiles | MongoDB | Flexible schema, nested data |
| E-commerce products | MongoDB | Varied attributes |
| Financial reporting | SQL | Complex queries, JOINs |
| Social media feeds | MongoDB | Scalability, fast reads |
| Inventory management | SQL | Relationships, consistency |
| IoT sensor data | MongoDB | High write volume |
| Customer orders | SQL | Transactions, relationships |

---

## MongoDB Basics

### Key Concepts

```
MongoDB Server
    │
    ├── Database (e.g., "ecommerce")
    │     │
    │     ├── Collection (e.g., "users")
    │     │     │
    │     │     ├── Document (JSON-like object)
    │     │     ├── Document
    │     │     └── Document
    │     │
    │     ├── Collection (e.g., "products")
    │     │     │
    │     │     ├── Document
    │     │     └── Document
    │     │
    │     └── Collection (e.g., "orders")
    │
    └── Database (e.g., "analytics")
```

**Terminology Mapping:**

| SQL | MongoDB |
|-----|---------|
| Database | Database |
| Table | Collection |
| Row | Document |
| Column | Field |
| Index | Index |
| JOIN | Embedded docs or $lookup |
| Primary Key | _id field (automatic) |

---

## Document Structure

### BSON (Binary JSON)

MongoDB stores data in BSON format (Binary JSON).

**Supported Data Types:**

```python
{
    "_id": ObjectId("507f1f77bcf86cd799439011"),  # Unique identifier
    "string": "text",                              # String
    "integer": 42,                                 # 32-bit integer
    "long": NumberLong(9223372036854775807),      # 64-bit integer
    "double": 3.14159,                             # Floating point
    "boolean": true,                               # Boolean
    "date": ISODate("2024-01-15T10:30:00Z"),      # Date/Time
    "null": null,                                  # Null value
    "array": [1, 2, 3, "mixed", true],            # Array
    "embedded": {                                  # Embedded document
        "city": "New York",
        "country": "USA"
    },
    "binary": BinData(0, "base64data"),           # Binary data
    "regex": /pattern/i,                           # Regular expression
    "objectId": ObjectId("..."),                   # ObjectId
}
```

### Example Documents

**User Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "john_doe",
  "email": "john@example.com",
  "age": 30,
  "created_at": ISODate("2024-01-15T10:30:00Z"),
  "profile": {
    "first_name": "John",
    "last_name": "Doe",
    "bio": "Software Developer",
    "avatar_url": "https://example.com/avatar.jpg"
  },
  "interests": ["programming", "reading", "hiking"],
  "settings": {
    "notifications": true,
    "theme": "dark"
  }
}
```

**Product Document:**
```json
{
  "_id": ObjectId("60a7f1b2c9d4e8f3a1b2c3d4"),
  "name": "iPhone 14 Pro",
  "category": "Electronics",
  "price": 999.99,
  "currency": "USD",
  "in_stock": true,
  "quantity": 50,
  "specs": {
    "brand": "Apple",
    "model": "iPhone 14 Pro",
    "storage": "256GB",
    "color": "Space Gray"
  },
  "tags": ["smartphone", "apple", "5g"],
  "reviews": [
    {
      "user_id": ObjectId("507f1f77bcf86cd799439011"),
      "rating": 5,
      "comment": "Excellent phone!",
      "date": ISODate("2024-01-10T15:20:00Z")
    }
  ],
  "created_at": ISODate("2024-01-01T00:00:00Z"),
  "updated_at": ISODate("2024-01-15T10:30:00Z")
}
```

---

## CRUD Operations

### Create (Insert)

```javascript
// Insert one document
db.users.insertOne({
  username: "alice",
  email: "alice@example.com",
  age: 25,
  created_at: new Date()
})

// Insert multiple documents
db.users.insertMany([
  {
    username: "bob",
    email: "bob@example.com",
    age: 30
  },
  {
    username: "charlie",
    email: "charlie@example.com",
    age: 35
  }
])
```

### Read (Find)

```javascript
// Find all documents
db.users.find()

// Find with filter
db.users.find({ age: { $gte: 25 } })

// Find one document
db.users.findOne({ username: "alice" })

// Find with projection (select specific fields)
db.users.find(
  { age: { $gte: 25 } },
  { username: 1, email: 1, _id: 0 }  // 1 = include, 0 = exclude
)

// Find with limit and sort
db.users.find()
  .sort({ age: -1 })    // -1 = descending, 1 = ascending
  .limit(10)
  .skip(5)              // Skip first 5 results
```

### Update

```javascript
// Update one document
db.users.updateOne(
  { username: "alice" },           // Filter
  { $set: { age: 26 } }           // Update operation
)

// Update multiple documents
db.users.updateMany(
  { age: { $lt: 18 } },
  { $set: { status: "minor" } }
)

// Update operators
db.users.updateOne(
  { username: "alice" },
  {
    $set: { email: "newemail@example.com" },  // Set field
    $inc: { login_count: 1 },                 // Increment
    $push: { interests: "cooking" },          // Add to array
    $unset: { temp_field: "" },              // Remove field
    $rename: { old_name: "new_name" }        // Rename field
  }
)

// Upsert (update or insert)
db.users.updateOne(
  { username: "david" },
  { $set: { age: 28, email: "david@example.com" } },
  { upsert: true }  // Create if doesn't exist
)
```

### Delete

```javascript
// Delete one document
db.users.deleteOne({ username: "alice" })

// Delete multiple documents
db.users.deleteMany({ age: { $lt: 18 } })

// Delete all documents in collection
db.users.deleteMany({})
```

---

## Querying

### Query Operators

**Comparison Operators:**

| Operator | Description | Example |
|----------|-------------|---------|
| `$eq` | Equal to | `{ age: { $eq: 25 } }` |
| `$ne` | Not equal | `{ age: { $ne: 25 } }` |
| `$gt` | Greater than | `{ age: { $gt: 25 } }` |
| `$gte` | Greater than or equal | `{ age: { $gte: 25 } }` |
| `$lt` | Less than | `{ age: { $lt: 25 } }` |
| `$lte` | Less than or equal | `{ age: { $lte: 25 } }` |
| `$in` | In array | `{ age: { $in: [25, 30, 35] } }` |
| `$nin` | Not in array | `{ age: { $nin: [25, 30] } }` |

**Logical Operators:**

```javascript
// $and (implicit when multiple conditions)
db.users.find({ age: { $gte: 25 }, status: "active" })

// $and (explicit)
db.users.find({
  $and: [
    { age: { $gte: 25 } },
    { status: "active" }
  ]
})

// $or
db.users.find({
  $or: [
    { age: { $lt: 18 } },
    { age: { $gt: 65 } }
  ]
})

// $not
db.users.find({ age: { $not: { $gte: 18 } } })

// $nor (none of conditions)
db.users.find({
  $nor: [
    { status: "deleted" },
    { banned: true }
  ]
})
```

**Element Operators:**

```javascript
// $exists - Check if field exists
db.users.find({ phone: { $exists: true } })

// $type - Check field type
db.users.find({ age: { $type: "number" } })
```

**Array Operators:**

```javascript
// $all - Array contains all elements
db.users.find({ interests: { $all: ["reading", "coding"] } })

// $elemMatch - Array element matches all conditions
db.products.find({
  reviews: {
    $elemMatch: { rating: { $gte: 4 }, verified: true }
  }
})

// $size - Array has specific length
db.users.find({ interests: { $size: 3 } })
```

**String Operators:**

```javascript
// $regex - Regular expression match
db.users.find({ email: { $regex: /gmail\.com$/ } })

// Case-insensitive search
db.users.find({
  username: { $regex: /john/i }
})
```

### Query Examples

```javascript
// Find users older than 25 with active status
db.users.find({
  age: { $gt: 25 },
  status: "active"
})

// Find products in price range
db.products.find({
  price: { $gte: 100, $lte: 500 }
})

// Find users with Gmail addresses
db.users.find({
  email: { $regex: /@gmail\.com$/ }
})

// Find products with specific tags
db.products.find({
  tags: { $in: ["electronics", "computers"] }
})

// Complex query with nested documents
db.users.find({
  "profile.city": "New York",
  "settings.notifications": true
})

// Query array of embedded documents
db.products.find({
  "reviews.rating": { $gte: 4 }
})
```

---

## Indexing

### Why Indexing?

Without index:
```
Collection Scan: O(n) - Check every document
Time: Slow for large collections
```

With index:
```
Index Scan: O(log n) - Use B-tree
Time: Fast even for millions of documents
```

### Creating Indexes

```javascript
// Single field index
db.users.createIndex({ email: 1 })  // 1 = ascending, -1 = descending

// Compound index (multiple fields)
db.users.createIndex({ age: 1, status: 1 })

// Unique index
db.users.createIndex({ email: 1 }, { unique: true })

// Text index (for text search)
db.products.createIndex({ name: "text", description: "text" })

// TTL index (auto-delete after time)
db.sessions.createIndex(
  { created_at: 1 },
  { expireAfterSeconds: 3600 }  // Delete after 1 hour
)

// Partial index (index subset of documents)
db.users.createIndex(
  { age: 1 },
  { partialFilterExpression: { status: "active" } }
)
```

### Index Management

```javascript
// List all indexes
db.users.getIndexes()

// Drop index
db.users.dropIndex("email_1")

// Explain query (see if index is used)
db.users.find({ email: "john@example.com" }).explain("executionStats")
```

### Index Best Practices

```
┌─────────────────────────────────────────────────────────┐
│              Index Design Guidelines                    │
└─────────────────────────────────────────────────────────┘

1. Index frequently queried fields
   ✅ db.users.find({ email: "..." })  → Index email
   ✅ db.products.find({ category: "..." }) → Index category

2. Compound indexes for multiple conditions
   ✅ Query: { age: 25, city: "NYC" }
   ✅ Index: { age: 1, city: 1 }

3. Index order matters in compound indexes
   Rule: Equality → Sort → Range
   ✅ { status: 1, age: 1, created_at: 1 }
      For: { status: "active" } .sort({ age: 1 }) { created_at: { $gte: ... } }

4. Don't over-index
   ❌ Every field indexed → Slow writes
   ✅ Index only frequently queried fields

5. Use covered queries when possible
   Index contains all queried fields → No document access needed
```

---

## Aggregation Pipeline

The aggregation pipeline processes documents through stages.

### Pipeline Stages

```
Documents → Stage 1 → Stage 2 → Stage 3 → ... → Results

Common Stages:
  $match    - Filter documents
  $group    - Group by field
  $project  - Select/transform fields
  $sort     - Sort results
  $limit    - Limit results
  $skip     - Skip documents
  $lookup   - Join collections
  $unwind   - Deconstruct arrays
```

### Basic Aggregation

```javascript
// Count users by age group
db.users.aggregate([
  {
    $group: {
      _id: {
        $switch: {
          branches: [
            { case: { $lt: ["$age", 18] }, then: "minor" },
            { case: { $lt: ["$age", 65] }, then: "adult" },
          ],
          default: "senior"
        }
      },
      count: { $sum: 1 }
    }
  }
])

// Average price by category
db.products.aggregate([
  {
    $group: {
      _id: "$category",
      avg_price: { $avg: "$price" },
      count: { $sum: 1 }
    }
  },
  {
    $sort: { avg_price: -1 }
  }
])
```

### Advanced Aggregation

```javascript
// Multi-stage pipeline
db.orders.aggregate([
  // Stage 1: Filter recent orders
  {
    $match: {
      order_date: { $gte: ISODate("2024-01-01") }
    }
  },

  // Stage 2: Lookup user information
  {
    $lookup: {
      from: "users",
      localField: "user_id",
      foreignField: "_id",
      as: "user_info"
    }
  },

  // Stage 3: Unwind array
  {
    $unwind: "$user_info"
  },

  // Stage 4: Group by user and calculate totals
  {
    $group: {
      _id: "$user_id",
      username: { $first: "$user_info.username" },
      total_orders: { $sum: 1 },
      total_amount: { $sum: "$total" },
      avg_order: { $avg: "$total" }
    }
  },

  // Stage 5: Sort by total amount
  {
    $sort: { total_amount: -1 }
  },

  // Stage 6: Limit to top 10
  {
    $limit: 10
  },

  // Stage 7: Project final fields
  {
    $project: {
      _id: 0,
      username: 1,
      total_orders: 1,
      total_amount: { $round: ["$total_amount", 2] },
      avg_order: { $round: ["$avg_order", 2] }
    }
  }
])
```

### Aggregation Operators

**Accumulator Operators:**

| Operator | Description | Example |
|----------|-------------|---------|
| `$sum` | Sum values | `{ total: { $sum: "$amount" } }` |
| `$avg` | Average | `{ avg: { $avg: "$price" } }` |
| `$min` | Minimum | `{ min: { $min: "$age" } }` |
| `$max` | Maximum | `{ max: { $max: "$age" } }` |
| `$first` | First value | `{ first: { $first: "$name" } }` |
| `$last` | Last value | `{ last: { $last: "$name" } }` |
| `$push` | Add to array | `{ items: { $push: "$item" } }` |
| `$addToSet` | Add unique to array | `{ tags: { $addToSet: "$tag" } }` |

---

## PyMongo

### Installation & Setup

```python
# Install PyMongo
# pip install pymongo

from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')

# Or with authentication
# client = MongoClient('mongodb://username:password@localhost:27017/')

# Select database
db = client['ecommerce']

# Select collection
users_collection = db['users']
products_collection = db['products']
```

### CRUD Operations in PyMongo

```python
# ========== CREATE ==========

# Insert one document
user = {
    "username": "alice",
    "email": "alice@example.com",
    "age": 25,
    "created_at": datetime.now(),
    "interests": ["reading", "coding"]
}
result = users_collection.insert_one(user)
print(f"Inserted ID: {result.inserted_id}")

# Insert multiple documents
users = [
    {"username": "bob", "email": "bob@example.com", "age": 30},
    {"username": "charlie", "email": "charlie@example.com", "age": 35}
]
result = users_collection.insert_many(users)
print(f"Inserted IDs: {result.inserted_ids}")

# ========== READ ==========

# Find all
for user in users_collection.find():
    print(user)

# Find with filter
for user in users_collection.find({"age": {"$gte": 25}}):
    print(user['username'], user['age'])

# Find one
alice = users_collection.find_one({"username": "alice"})
print(alice)

# Find with projection
users = users_collection.find(
    {"age": {"$gte": 25}},
    {"username": 1, "email": 1, "_id": 0}
)

# Find with sort, limit, skip
users = users_collection.find().sort("age", -1).limit(10).skip(5)

# Count documents
count = users_collection.count_documents({"age": {"$gte": 25}})
print(f"Count: {count}")

# ========== UPDATE ==========

# Update one
users_collection.update_one(
    {"username": "alice"},
    {"$set": {"age": 26, "updated_at": datetime.now()}}
)

# Update many
users_collection.update_many(
    {"age": {"$lt": 18}},
    {"$set": {"status": "minor"}}
)

# Update operators
users_collection.update_one(
    {"username": "alice"},
    {
        "$set": {"email": "newemail@example.com"},
        "$inc": {"login_count": 1},
        "$push": {"interests": "cooking"},
        "$currentDate": {"last_modified": True}
    }
)

# Upsert
users_collection.update_one(
    {"username": "david"},
    {"$set": {"age": 28, "email": "david@example.com"}},
    upsert=True
)

# ========== DELETE ==========

# Delete one
users_collection.delete_one({"username": "alice"})

# Delete many
users_collection.delete_many({"age": {"$lt": 18}})

# Delete all
users_collection.delete_many({})
```

### Querying in PyMongo

```python
# Comparison operators
users = users_collection.find({"age": {"$gte": 25, "$lte": 40}})

# Logical operators
users = users_collection.find({
    "$or": [
        {"age": {"$lt": 18}},
        {"age": {"$gt": 65}}
    ]
})

# Array operators
users = users_collection.find({
    "interests": {"$all": ["reading", "coding"]}
})

# Regular expressions
users = users_collection.find({
    "email": {"$regex": r"gmail\.com$"}
})

# Nested documents
users = users_collection.find({
    "profile.city": "New York"
})
```

### Aggregation in PyMongo

```python
# Simple aggregation
pipeline = [
    {"$match": {"status": "active"}},
    {"$group": {
        "_id": "$age",
        "count": {"$sum": 1}
    }},
    {"$sort": {"count": -1}}
]

results = users_collection.aggregate(pipeline)
for doc in results:
    print(doc)

# Complex aggregation
pipeline = [
    # Filter
    {"$match": {
        "created_at": {"$gte": datetime(2024, 1, 1)}
    }},

    # Group and calculate
    {"$group": {
        "_id": "$category",
        "total_sales": {"$sum": "$amount"},
        "avg_sale": {"$avg": "$amount"},
        "count": {"$sum": 1}
    }},

    # Sort
    {"$sort": {"total_sales": -1}},

    # Limit
    {"$limit": 10}
]

results = products_collection.aggregate(pipeline)
```

### Indexing in PyMongo

```python
# Create index
users_collection.create_index("email", unique=True)

# Compound index
users_collection.create_index([("age", 1), ("status", 1)])

# Text index
products_collection.create_index([("name", "text"), ("description", "text")])

# List indexes
print(users_collection.index_information())

# Drop index
users_collection.drop_index("email_1")
```

---

## Practical Examples

### Example 1: E-commerce Product Catalog

```python
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['ecommerce']

# Collections
products = db['products']
categories = db['categories']
reviews = db['reviews']

# ========== Insert Sample Data ==========

# Categories
category_ids = categories.insert_many([
    {"name": "Electronics", "slug": "electronics"},
    {"name": "Books", "slug": "books"},
    {"name": "Clothing", "slug": "clothing"}
]).inserted_ids

# Products
product_data = [
    {
        "name": "iPhone 14 Pro",
        "category_id": category_ids[0],
        "price": 999.99,
        "stock": 50,
        "specs": {
            "brand": "Apple",
            "storage": "256GB",
            "color": "Space Gray"
        },
        "tags": ["smartphone", "apple", "5g"],
        "created_at": datetime.now()
    },
    {
        "name": "MacBook Pro",
        "category_id": category_ids[0],
        "price": 1999.99,
        "stock": 25,
        "specs": {
            "brand": "Apple",
            "ram": "16GB",
            "storage": "512GB"
        },
        "tags": ["laptop", "apple", "m2"],
        "created_at": datetime.now()
    },
    {
        "name": "Python Programming",
        "category_id": category_ids[1],
        "price": 39.99,
        "stock": 100,
        "specs": {
            "author": "John Doe",
            "pages": 500,
            "isbn": "1234567890"
        },
        "tags": ["programming", "python", "book"],
        "created_at": datetime.now()
    }
]

product_ids = products.insert_many(product_data).inserted_ids

# ========== Queries ==========

# 1. Find products in price range
print("Products $50-$1500:")
for product in products.find({"price": {"$gte": 50, "$lte": 1500}}):
    print(f"  {product['name']}: ${product['price']}")

# 2. Find electronics
electronics_cat = categories.find_one({"slug": "electronics"})
print("\nElectronics:")
for product in products.find({"category_id": electronics_cat['_id']}):
    print(f"  {product['name']}")

# 3. Find products with specific tags
print("\nApple products:")
for product in products.find({"tags": "apple"}):
    print(f"  {product['name']}")

# 4. Update stock
products.update_one(
    {"name": "iPhone 14 Pro"},
    {"$inc": {"stock": -1}}  # Decrease stock by 1
)

# 5. Add review (embedded document)
products.update_one(
    {"name": "iPhone 14 Pro"},
    {
        "$push": {
            "reviews": {
                "user": "alice",
                "rating": 5,
                "comment": "Great phone!",
                "date": datetime.now()
            }
        }
    }
)

# 6. Aggregation: Average price by category
pipeline = [
    {
        "$lookup": {
            "from": "categories",
            "localField": "category_id",
            "foreignField": "_id",
            "as": "category"
        }
    },
    {
        "$unwind": "$category"
    },
    {
        "$group": {
            "_id": "$category.name",
            "avg_price": {"$avg": "$price"},
            "total_stock": {"$sum": "$stock"},
            "count": {"$sum": 1}
        }
    },
    {
        "$sort": {"avg_price": -1}
    }
]

print("\nCategory Statistics:")
for doc in products.aggregate(pipeline):
    print(f"  {doc['_id']}:")
    print(f"    Avg Price: ${doc['avg_price']:.2f}")
    print(f"    Total Stock: {doc['total_stock']}")
    print(f"    Products: {doc['count']}")
```

### Example 2: User Activity Tracking

```python
from pymongo import MongoClient
from datetime import datetime, timedelta
import random

client = MongoClient('mongodb://localhost:27017/')
db = client['analytics']

users = db['users']
events = db['events']

# ========== Insert Sample Users ==========

user_data = [
    {"username": f"user{i}", "email": f"user{i}@example.com", "created_at": datetime.now()}
    for i in range(1, 11)
]
user_ids = users.insert_many(user_data).inserted_ids

# ========== Insert Sample Events ==========

event_types = ["login", "page_view", "purchase", "logout"]
event_data = []

for _ in range(100):
    event_data.append({
        "user_id": random.choice(user_ids),
        "event_type": random.choice(event_types),
        "timestamp": datetime.now() - timedelta(days=random.randint(0, 30)),
        "metadata": {
            "ip": f"192.168.1.{random.randint(1, 255)}",
            "device": random.choice(["mobile", "desktop", "tablet"])
        }
    })

events.insert_many(event_data)

# ========== Analytics Queries ==========

# 1. Events per user
pipeline = [
    {
        "$group": {
            "_id": "$user_id",
            "total_events": {"$sum": 1},
            "event_types": {"$addToSet": "$event_type"}
        }
    },
    {
        "$lookup": {
            "from": "users",
            "localField": "_id",
            "foreignField": "_id",
            "as": "user"
        }
    },
    {
        "$unwind": "$user"
    },
    {
        "$project": {
            "username": "$user.username",
            "total_events": 1,
            "unique_event_types": {"$size": "$event_types"}
        }
    },
    {
        "$sort": {"total_events": -1}
    }
]

print("User Activity:")
for doc in events.aggregate(pipeline):
    print(f"  {doc['username']}: {doc['total_events']} events")

# 2. Events by type
pipeline = [
    {
        "$group": {
            "_id": "$event_type",
            "count": {"$sum": 1}
        }
    },
    {
        "$sort": {"count": -1}
    }
]

print("\nEvent Distribution:")
for doc in events.aggregate(pipeline):
    print(f"  {doc['_id']}: {doc['count']}")

# 3. Daily active users
pipeline = [
    {
        "$match": {
            "timestamp": {"$gte": datetime.now() - timedelta(days=7)}
        }
    },
    {
        "$group": {
            "_id": {
                "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": "$timestamp"
                }
            },
            "unique_users": {"$addToSet": "$user_id"}
        }
    },
    {
        "$project": {
            "date": "$_id",
            "dau": {"$size": "$unique_users"}
        }
    },
    {
        "$sort": {"date": 1}
    }
]

print("\nDaily Active Users (Last 7 Days):")
for doc in events.aggregate(pipeline):
    print(f"  {doc['date']}: {doc['dau']} users")

# 4. Device distribution
pipeline = [
    {
        "$group": {
            "_id": "$metadata.device",
            "count": {"$sum": 1}
        }
    }
]

print("\nDevice Distribution:")
for doc in events.aggregate(pipeline):
    print(f"  {doc['_id']}: {doc['count']}")
```

### Example 3: Data Migration from SQL to MongoDB

```python
import sqlite3
from pymongo import MongoClient
from datetime import datetime

# Connect to SQLite
sqlite_conn = sqlite3.connect('old_database.db')
sqlite_cursor = sqlite_conn.cursor()

# Connect to MongoDB
mongo_client = MongoClient('mongodb://localhost:27017/')
mongo_db = mongo_client['migrated_db']

# ========== Migrate Users ==========

# Fetch from SQL
sqlite_cursor.execute("SELECT * FROM users")
users = sqlite_cursor.fetchall()

# Transform and insert to MongoDB
users_collection = mongo_db['users']

for user in users:
    user_doc = {
        "_id": user[0],  # SQL ID
        "username": user[1],
        "email": user[2],
        "created_at": datetime.fromisoformat(user[3]),
        "migrated_at": datetime.now()
    }
    users_collection.insert_one(user_doc)

print(f"Migrated {len(users)} users")

# ========== Migrate Posts with User Info (Denormalization) ==========

sqlite_cursor.execute("""
    SELECT p.id, p.title, p.content, p.created_at, u.username, u.email
    FROM posts p
    JOIN users u ON p.user_id = u.id
""")
posts = sqlite_cursor.fetchall()

posts_collection = mongo_db['posts']

for post in posts:
    post_doc = {
        "_id": post[0],
        "title": post[1],
        "content": post[2],
        "created_at": datetime.fromisoformat(post[3]),
        "author": {  # Embedded document
            "username": post[4],
            "email": post[5]
        },
        "migrated_at": datetime.now()
    }
    posts_collection.insert_one(post_doc)

print(f"Migrated {len(posts)} posts")

# Close connections
sqlite_conn.close()
mongo_client.close()
```

---

## Interview Questions

### Q1: What is the difference between SQL and NoSQL databases?

**Answer:**

| Aspect | SQL | NoSQL |
|--------|-----|-------|
| **Data Model** | Tables with fixed schema | Flexible (documents, key-value, etc.) |
| **Schema** | Predefined, rigid | Dynamic, schema-less |
| **Scalability** | Vertical (better hardware) | Horizontal (more servers) |
| **Relationships** | Foreign keys, JOINs | Embedded docs or references |
| **ACID** | Strong guarantees | Eventual consistency (varies) |
| **Query Language** | SQL | Varies (MongoDB uses MQL) |
| **Best For** | Complex transactions, relationships | Large scale, flexible data, high velocity |

**When to Use:**
- **SQL:** Banking, inventory, complex queries with JOINs
- **NoSQL:** Social media, IoT, real-time analytics, hierarchical data

---

### Q2: Explain MongoDB document structure and BSON.

**Answer:**

**BSON (Binary JSON):** MongoDB's binary representation of JSON documents.

**Document Structure:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),  // Auto-generated unique ID
  "username": "john_doe",
  "age": 30,
  "created_at": ISODate("2024-01-15T10:30:00Z"),
  "profile": {                     // Embedded document
    "city": "New York",
    "country": "USA"
  },
  "interests": ["reading", "coding"],  // Array
  "settings": {
    "notifications": true
  }
}
```

**Key Features:**
1. **Flexible Schema:** Documents in same collection can have different fields
2. **Nested Documents:** Hierarchical data naturally represented
3. **Arrays:** First-class support for lists
4. **Rich Data Types:** ObjectId, Date, Binary, Regex, etc.
5. **_id Field:** Auto-generated if not provided, ensures uniqueness

**Advantages:**
- ✅ Natural representation of objects (matches application data)
- ✅ No need for multiple tables and JOINs
- ✅ Schema evolution without migrations

---

### Q3: What are the advantages of using MongoDB over traditional SQL databases?

**Answer:**

**Advantages:**

1. **Flexible Schema:**
   ```javascript
   // Different structures in same collection - OK!
   { username: "alice", age: 25 }
   { username: "bob", age: 30, city: "NYC", hobbies: ["reading"] }
   ```

2. **Horizontal Scalability:**
   - Add more servers (sharding)
   - SQL typically requires bigger, more expensive servers

3. **Natural Data Representation:**
   ```javascript
   // One document vs multiple SQL tables
   {
     user: "alice",
     orders: [
       { product: "iPhone", price: 999 },
       { product: "MacBook", price: 1999 }
     ]
   }
   ```

4. **High Performance for Specific Use Cases:**
   - Fast reads/writes for simple queries
   - Optimized for hierarchical data

5. **Developer Friendly:**
   - JSON/BSON matches application objects
   - No ORM overhead
   - Easy prototyping

**Disadvantages:**

1. **Limited Transaction Support:** (improved in recent versions but still weaker than SQL)
2. **No JOINs:** (can use $lookup but not as efficient)
3. **Data Duplication:** Denormalization leads to redundancy
4. **Memory Usage:** BSON overhead

**Best Use Cases:**
- Content management systems
- Real-time analytics
- IoT sensor data
- User profiles
- Product catalogs

---

### Q4: Explain the aggregation pipeline in MongoDB.

**Answer:**

**Aggregation Pipeline:** Process documents through multiple stages to transform and compute data.

**Visual:**
```
Documents → [$match] → [$group] → [$sort] → [$project] → Results
```

**Common Stages:**

| Stage | Purpose | Example |
|-------|---------|---------|
| `$match` | Filter documents | `{ $match: { age: { $gte: 25 } } }` |
| `$group` | Group and aggregate | `{ $group: { _id: "$city", count: { $sum: 1 } } }` |
| `$project` | Select/transform fields | `{ $project: { username: 1, age: 1 } }` |
| `$sort` | Sort results | `{ $sort: { age: -1 } }` |
| `$limit` | Limit results | `{ $limit: 10 }` |
| `$skip` | Skip documents | `{ $skip: 5 }` |
| `$lookup` | Join collections | `{ $lookup: { from: "orders", ... } }` |
| `$unwind` | Deconstruct arrays | `{ $unwind: "$items" }` |

**Example:**
```javascript
// Calculate average order value per customer
db.orders.aggregate([
  // Stage 1: Filter 2024 orders
  {
    $match: {
      year: 2024
    }
  },

  // Stage 2: Group by customer
  {
    $group: {
      _id: "$customer_id",
      total_orders: { $sum: 1 },
      total_spent: { $sum: "$amount" },
      avg_order: { $avg: "$amount" }
    }
  },

  // Stage 3: Sort by total spent
  {
    $sort: { total_spent: -1 }
  },

  // Stage 4: Top 10 customers
  {
    $limit: 10
  }
])
```

**Key Points:**
- Each stage transforms documents
- Output of one stage → input of next stage
- Powerful for analytics and reporting
- Can replace complex SQL queries

---

### Q5: How do you handle relationships in MongoDB?

**Answer:**

MongoDB handles relationships differently than SQL. Two main approaches:

**1. Embedded Documents (Denormalization):**

**When:** One-to-few relationships, data accessed together

```javascript
// User with posts embedded
{
  "_id": ObjectId("..."),
  "username": "alice",
  "posts": [
    {
      "title": "First Post",
      "content": "Hello...",
      "date": ISODate("2024-01-01")
    },
    {
      "title": "Second Post",
      "content": "World...",
      "date": ISODate("2024-01-02")
    }
  ]
}
```

**Pros:**
- ✅ Single query to get all data
- ✅ Atomic updates
- ✅ Better performance

**Cons:**
- ❌ Data duplication
- ❌ Document size limits (16MB)
- ❌ Harder to query nested data

**2. References (Normalization):**

**When:** One-to-many or many-to-many, independent data

```javascript
// Users collection
{ "_id": ObjectId("user1"), "username": "alice" }

// Posts collection
{
  "_id": ObjectId("post1"),
  "user_id": ObjectId("user1"),  // Reference
  "title": "First Post"
}
```

**Join with $lookup:**
```javascript
db.posts.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "user_id",
      foreignField: "_id",
      as: "user"
    }
  }
])
```

**Pros:**
- ✅ No duplication
- ✅ Easier updates
- ✅ Smaller documents

**Cons:**
- ❌ Multiple queries or $lookup
- ❌ Slower performance

**Decision Matrix:**

| Scenario | Approach |
|----------|----------|
| User profile with address | Embedded (one-to-one) |
| Blog post with comments (limited) | Embedded (one-to-few) |
| User with many orders | References (one-to-many) |
| Students and courses | References (many-to-many) |

---

### Q6: How do you index in MongoDB and why is it important?

**Answer:**

**Why Indexing:**

Without index:
```
Collection Scan: Check every document
Time: O(n) - Slow for large collections
```

With index:
```
Index Scan: B-tree lookup
Time: O(log n) - Fast even for millions
```

**Creating Indexes:**

```javascript
// Single field
db.users.createIndex({ email: 1 })  // 1 = ascending, -1 = descending

// Compound index
db.users.createIndex({ age: 1, city: 1 })

// Unique index
db.users.createIndex({ email: 1 }, { unique: true })

// Text index
db.products.createIndex({ name: "text", description: "text" })
```

**Index Types:**

1. **Single Field:** Index one field
2. **Compound:** Index multiple fields
3. **Multikey:** Index array elements
4. **Text:** Full-text search
5. **Geospatial:** Location-based queries
6. **TTL:** Auto-delete after time

**Best Practices:**

1. **Index queried fields:**
   ```javascript
   // Query
   db.users.find({ email: "alice@example.com" })

   // Index needed
   db.users.createIndex({ email: 1 })
   ```

2. **Compound index order matters:**
   ```
   Rule: Equality → Sort → Range

   Query: { status: "active", age: { $gte: 25 } } .sort({ created_at: -1 })
   Index: { status: 1, created_at: -1, age: 1 }
   ```

3. **Don't over-index:**
   - Indexes slow down writes
   - Use memory
   - Index only frequently queried fields

4. **Monitor with explain():**
   ```javascript
   db.users.find({ email: "..." }).explain("executionStats")
   ```

**Example:**
```javascript
// Before: Full collection scan (slow)
db.products.find({ price: { $gte: 100, $lte: 500 } })

// Create index
db.products.createIndex({ price: 1 })

// After: Index scan (fast)
db.products.find({ price: { $gte: 100, $lte: 500 } })
```

---

## Key Takeaways

1. **NoSQL vs SQL:**
   - NoSQL: Flexible schema, horizontal scaling, document-oriented
   - SQL: Fixed schema, ACID, complex queries with JOINs
   - Choose based on use case

2. **MongoDB Fundamentals:**
   - Documents stored in BSON format
   - Collections contain documents
   - Flexible schema allows evolution
   - `_id` field auto-generated

3. **CRUD Operations:**
   - Create: `insertOne()`, `insertMany()`
   - Read: `find()`, `findOne()`
   - Update: `updateOne()`, `updateMany()`
   - Delete: `deleteOne()`, `deleteMany()`

4. **Querying:**
   - Comparison: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`
   - Logical: `$and`, `$or`, `$not`, `$nor`
   - Array: `$all`, `$elemMatch`, `$size`
   - String: `$regex`

5. **Indexing:**
   - Critical for performance
   - Single field and compound indexes
   - Use `explain()` to verify
   - Don't over-index

6. **Aggregation Pipeline:**
   - Multi-stage data processing
   - Common stages: `$match`, `$group`, `$project`, `$sort`, `$lookup`
   - Powerful for analytics

7. **Relationships:**
   - Embedded documents for one-to-few
   - References for one-to-many
   - `$lookup` for joins

8. **PyMongo:**
   - Python driver for MongoDB
   - Similar API to MongoDB shell
   - Easy integration with pandas

---

**Navigation:** [← Regular Expressions](./regex.md) | [Back to Index](./README.md) | [Next: Model Explainability →](./model-explainability.md)
