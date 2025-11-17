# MongoDB Basics and Document Structure

## What You'll Learn

Dive into the heart of MongoDB by understanding its fundamental building blocks: documents and collections. This guide reveals how MongoDB stores data in BSON (Binary JSON) format, what data types are available, and how to structure documents effectively. You'll discover the power of embedded documents, arrays, and flexible schemas that make MongoDB perfect for modern application development where data structures evolve rapidly.

---

## MongoDB Core Concepts

### Hierarchy Overview

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
    │           └── Documents...
    │
    └── Database (e.g., "analytics")
          └── Collections...
```

### Terminology Mapping

| SQL Concept | MongoDB Equivalent | Description |
|-------------|-------------------|-------------|
| Database | Database | Container for collections |
| Table | Collection | Container for documents |
| Row | Document | Individual record |
| Column | Field | Key-value pair |
| Index | Index | Performance optimization |
| JOIN | $lookup or Embedding | Combining data |
| Primary Key | _id field | Auto-generated unique identifier |

---

## Document Structure

### BSON - Binary JSON

MongoDB stores data in **BSON (Binary JSON)** format:
- Binary encoding of JSON-like documents
- Supports more data types than JSON
- Efficient storage and traversal
- Preserves type information

### Complete Data Type Reference

```javascript
{
    // Unique identifier (auto-generated if not provided)
    "_id": ObjectId("507f1f77bcf86cd799439011"),

    // String
    "string": "text",
    "name": "John Doe",

    // Numbers
    "integer": 42,                                    // 32-bit integer
    "long": NumberLong(9223372036854775807),         // 64-bit integer
    "double": 3.14159,                                // Floating point
    "decimal": NumberDecimal("999.99"),               // High precision

    // Boolean
    "boolean": true,
    "isActive": false,

    // Date
    "date": ISODate("2024-01-15T10:30:00Z"),
    "createdAt": new Date(),

    // Null
    "null": null,
    "optionalField": null,

    // Array (can contain mixed types)
    "array": [1, 2, 3, "mixed", true],
    "tags": ["mongodb", "nosql", "database"],

    // Embedded document (nested object)
    "embedded": {
        "city": "New York",
        "country": "USA",
        "coordinates": {
            "lat": 40.7128,
            "lng": -74.0060
        }
    },

    // Array of embedded documents
    "addresses": [
        {
            "type": "home",
            "street": "123 Main St",
            "city": "New York"
        },
        {
            "type": "work",
            "street": "456 Office Blvd",
            "city": "San Francisco"
        }
    ],

    // Binary data
    "binary": BinData(0, "base64encodeddata"),
    "profilePicture": BinData(0, "..."),

    // Regular expression
    "regex": /pattern/i,
    "emailPattern": /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

    // ObjectId (reference to another document)
    "objectId": ObjectId("507f1f77bcf86cd799439012"),
    "userId": ObjectId("507f1f77bcf86cd799439013")
}
```

### The _id Field

**Auto-Generation:**
```javascript
// MongoDB automatically adds _id if not provided
db.users.insertOne({name: "John"})
// Result: {_id: ObjectId("..."), name: "John"}
```

**ObjectId Structure:**
```
ObjectId("507f1f77bcf86cd799439011")
         │    │   │   │
         │    │   │   └─ Counter (3 bytes)
         │    │   └───── Process ID (2 bytes)
         │    └───────── Machine ID (3 bytes)
         └────────────── Timestamp (4 bytes)

Benefits:
- Globally unique
- Ordered (sortable by creation time)
- Includes timestamp (no need for separate createdAt)
```

**Custom _id:**
```javascript
// You can provide your own _id
db.users.insertOne({
    _id: "user123",  // Custom string ID
    name: "John"
})

db.products.insertOne({
    _id: 12345,      // Custom numeric ID
    name: "iPhone"
})
```

---

## Document Examples

### User Document

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "john_doe",
  "email": "john@example.com",
  "age": 30,
  "created_at": ISODate("2024-01-15T10:30:00Z"),
  "last_login": ISODate("2024-01-20T08:15:00Z"),

  "profile": {
    "first_name": "John",
    "last_name": "Doe",
    "bio": "Software Developer passionate about databases",
    "avatar_url": "https://example.com/avatars/john.jpg",
    "social": {
      "twitter": "@johndoe",
      "linkedin": "in/johndoe"
    }
  },

  "interests": ["programming", "reading", "hiking", "photography"],

  "settings": {
    "notifications": true,
    "theme": "dark",
    "language": "en",
    "privacy": {
      "profile_public": true,
      "show_email": false
    }
  },

  "stats": {
    "posts": 42,
    "followers": 156,
    "following": 89
  }
}
```

### Product Document

```json
{
  "_id": ObjectId("60a7f1b2c9d4e8f3a1b2c3d4"),
  "sku": "IPHONE14-256-GRAY",
  "name": "iPhone 14 Pro",
  "category": "Electronics",
  "subcategory": "Smartphones",

  "price": {
    "amount": 999.99,
    "currency": "USD",
    "discounted": 899.99,
    "discount_percent": 10
  },

  "inventory": {
    "in_stock": true,
    "quantity": 50,
    "warehouse": "WH-001",
    "reserved": 5
  },

  "specs": {
    "brand": "Apple",
    "model": "iPhone 14 Pro",
    "storage": "256GB",
    "color": "Space Gray",
    "dimensions": {
      "height": 147.5,
      "width": 71.5,
      "depth": 7.85,
      "unit": "mm"
    },
    "weight": {
      "value": 206,
      "unit": "g"
    }
  },

  "tags": ["smartphone", "apple", "5g", "ios"],

  "images": [
    "https://example.com/products/iphone14-front.jpg",
    "https://example.com/products/iphone14-back.jpg",
    "https://example.com/products/iphone14-side.jpg"
  ],

  "reviews": [
    {
      "user_id": ObjectId("507f1f77bcf86cd799439011"),
      "rating": 5,
      "title": "Excellent phone!",
      "comment": "Best iPhone yet. Camera is amazing.",
      "verified_purchase": true,
      "date": ISODate("2024-01-10T15:20:00Z"),
      "helpful_votes": 12
    },
    {
      "user_id": ObjectId("507f1f77bcf86cd799439012"),
      "rating": 4,
      "title": "Great but expensive",
      "comment": "Love it but wish it was cheaper.",
      "verified_purchase": true,
      "date": ISODate("2024-01-12T09:45:00Z"),
      "helpful_votes": 5
    }
  ],

  "average_rating": 4.5,
  "total_reviews": 2,

  "created_at": ISODate("2024-01-01T00:00:00Z"),
  "updated_at": ISODate("2024-01-15T10:30:00Z")
}
```

### Order Document

```json
{
  "_id": ObjectId("60b8f2c3d0e5f4a2b3c4d5e6"),
  "order_number": "ORD-2024-001234",
  "user_id": ObjectId("507f1f77bcf86cd799439011"),

  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-1234"
  },

  "items": [
    {
      "product_id": ObjectId("60a7f1b2c9d4e8f3a1b2c3d4"),
      "sku": "IPHONE14-256-GRAY",
      "name": "iPhone 14 Pro",
      "quantity": 1,
      "unit_price": 999.99,
      "subtotal": 999.99
    },
    {
      "product_id": ObjectId("60a7f1b2c9d4e8f3a1b2c3d5"),
      "sku": "AIRPODS-PRO-2",
      "name": "AirPods Pro (2nd Gen)",
      "quantity": 1,
      "unit_price": 249.99,
      "subtotal": 249.99
    }
  ],

  "shipping_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  },

  "billing_address": {
    "same_as_shipping": true
  },

  "pricing": {
    "subtotal": 1249.98,
    "tax": 112.50,
    "shipping": 15.00,
    "discount": 50.00,
    "total": 1327.48
  },

  "payment": {
    "method": "credit_card",
    "status": "paid",
    "transaction_id": "txn_abc123",
    "paid_at": ISODate("2024-01-15T14:30:00Z")
  },

  "status": "processing",
  "status_history": [
    {
      "status": "pending",
      "timestamp": ISODate("2024-01-15T14:25:00Z")
    },
    {
      "status": "paid",
      "timestamp": ISODate("2024-01-15T14:30:00Z")
    },
    {
      "status": "processing",
      "timestamp": ISODate("2024-01-15T15:00:00Z")
    }
  ],

  "created_at": ISODate("2024-01-15T14:25:00Z"),
  "updated_at": ISODate("2024-01-15T15:00:00Z")
}
```

---

## Document Design Principles

### 1. Embed vs Reference

**Embed (Denormalization):**
```javascript
// One document contains everything
{
  user: "john",
  posts: [
    {title: "Post 1", content: "..."},
    {title: "Post 2", content: "..."}
  ]
}

Benefits:
- Single query retrieves all data
- Atomic updates
- Better performance

Use When:
- One-to-few relationships
- Data accessed together
- Data doesn't change often
```

**Reference (Normalization):**
```javascript
// Separate collections
// users collection
{_id: "user1", name: "john"}

// posts collection
{_id: "post1", user_id: "user1", title: "Post 1"}
{_id: "post2", user_id: "user1", title: "Post 2"}

Benefits:
- No duplication
- Easier updates
- Smaller documents

Use When:
- One-to-many relationships
- Data accessed separately
- Data changes frequently
```

### 2. Schema Design Patterns

**Bucket Pattern:**
```javascript
// Group time-series data
{
  sensor_id: "sensor1",
  date: ISODate("2024-01-15"),
  readings: [
    {time: "00:00", temp: 20.5},
    {time: "01:00", temp: 20.3},
    // ... 24 readings per day
  ]
}
```

**Attribute Pattern:**
```javascript
// Flexible product attributes
{
  name: "iPhone 14",
  attributes: [
    {k: "color", v: "gray"},
    {k: "storage", v: "256GB"},
    {k: "brand", v: "Apple"}
  ]
}

// Allows indexing: db.products.createIndex({"attributes.k": 1, "attributes.v": 1})
```

**Computed Pattern:**
```javascript
// Pre-compute expensive calculations
{
  product_id: "123",
  reviews: [...],
  // Computed fields
  average_rating: 4.5,
  total_reviews: 150,
  rating_distribution: {
    5: 100,
    4: 30,
    3: 15,
    2: 3,
    1: 2
  }
}
```

---

## Best Practices

### Document Size

**Limit:** 16MB maximum document size

**Guidelines:**
```javascript
// Good: Reasonable size
{
  user: "john",
  recent_posts: [...]  // Last 10 posts
}

// Bad: Unbounded growth
{
  user: "john",
  all_posts: [...]  // Could exceed 16MB
}

// Solution: Reference instead
{
  user: "john",
  total_posts: 1000
}
// posts in separate collection
```

### Field Naming

```javascript
// Good: Consistent naming
{
  first_name: "John",
  last_name: "Doe",
  created_at: ISODate("2024-01-15")
}

// Bad: Inconsistent naming
{
  firstName: "John",
  last_name: "Doe",
  CreatedAt: ISODate("2024-01-15")
}
```

### Schema Validation

```javascript
// Define validation rules
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email"],
      properties: {
        username: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "must be a valid email"
        },
        age: {
          bsonType: "int",
          minimum: 0,
          maximum: 150,
          description: "must be an integer between 0 and 150"
        }
      }
    }
  }
})
```

---

## Common Pitfalls

### 1. Over-Embedding

```javascript
// Bad: Embedding everything
{
  order: {...},
  customer: {...},  // Full customer document
  products: [...]   // Full product documents
}
// Problem: Duplication, large documents, update anomalies

// Good: Reference when appropriate
{
  order: {...},
  customer_id: ObjectId("..."),
  product_ids: [ObjectId("..."), ...]
}
```

### 2. Missing Indexes

```javascript
// Slow: No index on frequently queried field
db.users.find({email: "john@example.com"})  // Collection scan

// Fast: Create index
db.users.createIndex({email: 1})
db.users.find({email: "john@example.com"})  // Index scan
```

### 3. Not Using Projection

```javascript
// Bad: Retrieve entire document when you need one field
db.users.find({username: "john"})
// Returns all fields

// Good: Project only needed fields
db.users.find(
  {username: "john"},
  {email: 1, name: 1, _id: 0}
)
// Returns only email and name
```

---

## Quick Reference

### Document Structure Checklist

- Use meaningful field names
- Leverage embedded documents for related data
- Consider 16MB document size limit
- Add timestamps (created_at, updated_at)
- Use appropriate data types
- Validate critical fields
- Index frequently queried fields

### Data Type Quick Reference

```javascript
String:    "text"
Number:    42, 3.14, NumberLong(123)
Boolean:   true, false
Date:      ISODate("2024-01-15")
Array:     [1, 2, 3]
Object:    {nested: "document"}
ObjectId:  ObjectId("...")
Null:      null
```

---

## Navigation

[← Previous: Introduction](./nosql-mongodb-intro.md) | [Back to Index](./README.md) | [Next: CRUD Operations →](./nosql-mongodb-crud.md)
