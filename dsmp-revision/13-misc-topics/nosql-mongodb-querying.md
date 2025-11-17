# MongoDB Advanced Querying

## What You'll Learn

Unlock the full power of MongoDB's query language with advanced operators and techniques. This guide teaches you how to build complex queries using comparison, logical, array, and element operators. You'll master querying nested documents, searching arrays, using regular expressions, and combining multiple conditions to find exactly the data you need with precision and efficiency.

---

## Query Operators Overview

MongoDB provides rich query operators to filter documents precisely.

### Comparison Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `$eq` | Equal to | `{age: {$eq: 25}}` |
| `$ne` | Not equal | `{age: {$ne: 25}}` |
| `$gt` | Greater than | `{age: {$gt: 25}}` |
| `$gte` | Greater than or equal | `{age: {$gte: 25}}` |
| `$lt` | Less than | `{age: {$lt: 25}}` |
| `$lte` | Less than or equal | `{age: {$lte: 25}}` |
| `$in` | In array | `{age: {$in: [25, 30, 35]}}` |
| `$nin` | Not in array | `{age: {$nin: [25, 30]}}` |

**Examples:**

```javascript
// Age equals 25
db.users.find({age: 25})
// or explicitly
db.users.find({age: {$eq: 25}})

// Age not equal to 25
db.users.find({age: {$ne: 25}})

// Age greater than 25
db.users.find({age: {$gt: 25}})

// Age between 25 and 40 (inclusive)
db.users.find({age: {$gte: 25, $lte: 40}})

// Age is 25, 30, or 35
db.users.find({age: {$in: [25, 30, 35]}})

// Status is not "deleted" or "banned"
db.users.find({status: {$nin: ["deleted", "banned"]}})
```

---

## Logical Operators

### $and (Implicit)

```javascript
// Multiple conditions are implicitly AND
db.users.find({
  age: {$gte: 25},
  status: "active"
})
// Finds: age >= 25 AND status = "active"
```

### $and (Explicit)

```javascript
// Explicit AND when same field has multiple conditions
db.users.find({
  $and: [
    {age: {$gte: 25}},
    {age: {$lte: 40}},
    {status: "active"}
  ]
})
```

### $or

```javascript
// Find users who are minors OR seniors
db.users.find({
  $or: [
    {age: {$lt: 18}},
    {age: {$gt: 65}}
  ]
})

// Find users with Gmail OR Yahoo email
db.users.find({
  $or: [
    {email: {$regex: /@gmail\.com$/}},
    {email: {$regex: /@yahoo\.com$/}}
  ]
})
```

### $not

```javascript
// Find users NOT adults (age not >= 18)
db.users.find({
  age: {$not: {$gte: 18}}
})

// Same as: age < 18
db.users.find({age: {$lt: 18}})
```

### $nor

```javascript
// Find users who are neither deleted NOR banned
db.users.find({
  $nor: [
    {status: "deleted"},
    {banned: true}
  ]
})
```

### Complex Logical Queries

```javascript
// Combine AND, OR
db.products.find({
  $and: [
    {
      $or: [
        {category: "Electronics"},
        {category: "Computers"}
      ]
    },
    {price: {$gte: 100, $lte: 1000}},
    {in_stock: true}
  ]
})

// Find: (Electronics OR Computers) AND (price 100-1000) AND in_stock
```

---

## Element Operators

### $exists

```javascript
// Find users who have phone number
db.users.find({phone: {$exists: true}})

// Find users without phone number
db.users.find({phone: {$exists: false}})

// Find users with email (not null and exists)
db.users.find({
  email: {$exists: true, $ne: null}
})
```

### $type

```javascript
// Find where age is a number
db.users.find({age: {$type: "number"}})

// Find where age is a string
db.users.find({age: {$type: "string"}})

// Multiple types
db.users.find({
  age: {$type: ["number", "string"]}
})

// Common BSON types:
// "double", "string", "object", "array", "bool", "date",
// "null", "int", "long", "decimal"
```

---

## Array Operators

### $all

```javascript
// Find users with ALL specified interests
db.users.find({
  interests: {$all: ["reading", "coding"]}
})
// Must have both "reading" AND "coding"
```

### $elemMatch

```javascript
// Find products where a review matches all conditions
db.products.find({
  reviews: {
    $elemMatch: {
      rating: {$gte: 4},
      verified: true
    }
  }
})
// At least one review with rating >= 4 AND verified = true

// Nested arrays
db.students.find({
  scores: {
    $elemMatch: {
      subject: "math",
      score: {$gte: 90}
    }
  }
})
```

### $size

```javascript
// Find users with exactly 3 interests
db.users.find({interests: {$size: 3}})

// Note: $size doesn't support ranges
// For ranges, add a count field:
db.users.find({interest_count: {$gte: 3}})
```

### Querying Array Elements

```javascript
// Find if array contains value
db.users.find({interests: "coding"})

// Find if array contains any of values
db.users.find({interests: {$in: ["coding", "reading"]}})

// Query array by index
db.users.find({"scores.0": {$gt: 80}})  // First score > 80

// Query array element field
db.orders.find({"items.quantity": {$gt: 5}})
```

---

## String Operators

### $regex

```javascript
// Case-sensitive search
db.users.find({email: {$regex: /gmail\.com$/}})

// Case-insensitive search
db.users.find({email: {$regex: /gmail\.com$/i}})

// Using string syntax
db.users.find({
  email: {$regex: "@gmail\\.com$", $options: "i"}
})

// Starts with
db.users.find({username: {$regex: /^john/i}})

// Contains
db.users.find({bio: {$regex: /developer/i}})

// Multiple patterns
db.products.find({
  $or: [
    {name: {$regex: /iphone/i}},
    {description: {$regex: /iphone/i}}
  ]
})
```

---

## Querying Nested Documents

### Dot Notation

```javascript
// Query nested field
db.users.find({"profile.city": "New York"})

// Query deep nesting
db.users.find({"profile.address.city": "New York"})

// Multiple nested fields
db.users.find({
  "profile.city": "New York",
  "settings.notifications": true
})
```

### Exact Match on Embedded Document

```javascript
// Must match exactly (order and fields)
db.users.find({
  profile: {
    city: "New York",
    country: "USA"
  }
})

// This won't match if document has additional fields
```

---

## Practical Query Examples

### Find Active Users in Specific City

```javascript
db.users.find({
  status: "active",
  "profile.city": "New York",
  age: {$gte: 18}
})
```

### Find Products in Price Range with Stock

```javascript
db.products.find({
  price: {$gte: 100, $lte: 500},
  "inventory.in_stock": true,
  "inventory.quantity": {$gt: 0}
})
```

### Find Users with Gmail Address

```javascript
db.users.find({
  email: {$regex: /@gmail\.com$/, $options: "i"}
})
```

### Find Products with Specific Tags

```javascript
// Has any of these tags
db.products.find({
  tags: {$in: ["electronics", "computers"]}
})

// Has all of these tags
db.products.find({
  tags: {$all: ["smartphone", "5g"]}
})
```

### Find Orders with High-Value Items

```javascript
db.orders.find({
  items: {
    $elemMatch: {
      price: {$gt: 1000},
      quantity: {$gte: 1}
    }
  }
})
```

### Find Users Who Recently Logged In

```javascript
// Last 7 days
const sevenDaysAgo = new Date()
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

db.users.find({
  last_login: {$gte: sevenDaysAgo}
})
```

### Complex Business Query

```javascript
// Find premium active users in NYC who made purchase in last 30 days
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

db.users.find({
  status: "active",
  premium: true,
  "profile.city": "New York",
  last_purchase: {$gte: thirtyDaysAgo},
  total_purchases: {$gte: 5}
})
```

---

## Query Performance Tips

### Use Indexes

```javascript
// Create index on frequently queried fields
db.users.createIndex({email: 1})
db.users.createIndex({"profile.city": 1, status: 1})

// Queries on indexed fields are much faster
db.users.find({email: "john@example.com"})
```

### Use Projection

```javascript
// Only retrieve needed fields
db.users.find(
  {status: "active"},
  {username: 1, email: 1, _id: 0}
)
// Faster than retrieving entire document
```

### Limit Results

```javascript
// Limit when you don't need all results
db.users.find({status: "active"}).limit(100)
```

### Use explain()

```javascript
// Analyze query performance
db.users.find({email: "john@example.com"}).explain("executionStats")

// Check:
// - executionTimeMillis
// - totalDocsExamined
// - nReturned
```

---

## Common Query Patterns

### Pagination

```javascript
const pageSize = 20
const pageNumber = 2  // Page 2

db.users.find()
  .sort({created_at: -1})
  .skip(pageSize * (pageNumber - 1))
  .limit(pageSize)
```

### Search

```javascript
// Text search (requires text index)
db.products.createIndex({name: "text", description: "text"})

db.products.find({
  $text: {$search: "smartphone camera"}
})

// Score by relevance
db.products.find(
  {$text: {$search: "smartphone"}},
  {score: {$meta: "textScore"}}
).sort({score: {$meta: "textScore"}})
```

### Range Queries

```javascript
// Date range
db.orders.find({
  order_date: {
    $gte: ISODate("2024-01-01"),
    $lt: ISODate("2024-02-01")
  }
})

// Numeric range
db.products.find({
  price: {$gte: 50, $lte: 200}
})
```

---

## Quick Reference

### Query Operator Categories

**Comparison:** `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`

**Logical:** `$and`, `$or`, `$not`, `$nor`

**Element:** `$exists`, `$type`

**Array:** `$all`, `$elemMatch`, `$size`

**String:** `$regex`

### Common Patterns

```javascript
// Exact match
{field: value}

// Comparison
{field: {$gt: value}}

// Multiple conditions (AND)
{field1: value1, field2: value2}

// OR conditions
{$or: [{field1: value1}, {field2: value2}]}

// Nested field
{"parent.child": value}

// Array contains
{array_field: value}

// Array element matches
{array_field: {$elemMatch: {condition}}}

// Regex search
{field: {$regex: /pattern/i}}

// Exists
{field: {$exists: true}}
```

---

## Navigation

[← Previous: CRUD Operations](./nosql-mongodb-crud.md) | [Back to Index](./README.md) | [Next: Indexing →](./nosql-mongodb-indexing.md)
