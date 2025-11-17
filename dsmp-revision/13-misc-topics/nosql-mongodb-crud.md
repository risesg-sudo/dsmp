# MongoDB CRUD Operations

## What You'll Learn

Master the essential operations that power every MongoDB application: Create, Read, Update, and Delete. This guide walks you through inserting documents, querying your data, updating records with powerful operators, and removing unwanted data. You'll learn not just the syntax, but when to use each operation, how to make them efficient, and common patterns that will make your MongoDB code clean and effective.

---

## Create Operations

### Insert One Document

```javascript
// Basic insert
db.users.insertOne({
  username: "alice",
  email: "alice@example.com",
  age: 25,
  created_at: new Date()
})

// Response
{
  acknowledged: true,
  insertedId: ObjectId("507f1f77bcf86cd799439011")
}
```

### Insert Multiple Documents

```javascript
// Insert many documents at once
db.users.insertMany([
  {
    username: "bob",
    email: "bob@example.com",
    age: 30,
    interests: ["coding", "reading"]
  },
  {
    username: "charlie",
    email: "charlie@example.com",
    age: 35,
    interests: ["music", "travel"]
  },
  {
    username: "diana",
    email: "diana@example.com",
    age: 28,
    interests: ["sports", "cooking"]
  }
])

// Response
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId("507f1f77bcf86cd799439012"),
    '1': ObjectId("507f1f77bcf86cd799439013"),
    '2': ObjectId("507f1f77bcf86cd799439014")
  }
}
```

### Insert with Options

```javascript
// Ordered insert (default: true)
// Stops on first error
db.users.insertMany([...], {ordered: true})

// Unordered insert
// Continues even if some fail
db.users.insertMany([...], {ordered: false})

// Write concern
db.users.insertOne({...}, {writeConcern: {w: "majority"}})
```

---

## Read Operations

### Find All Documents

```javascript
// Find all
db.users.find()

// Pretty print
db.users.find().pretty()

// Count documents
db.users.countDocuments()
```

### Find with Filter

```javascript
// Find by exact match
db.users.find({age: 25})

// Find by multiple conditions (implicit AND)
db.users.find({
  age: 25,
  username: "alice"
})

// Find with comparison
db.users.find({age: {$gte: 25}})  // age >= 25
db.users.find({age: {$lt: 30}})   // age < 30
db.users.find({age: {$ne: 25}})   // age != 25
```

### Find One Document

```javascript
// Find first matching document
db.users.findOne({username: "alice"})

// Returns null if not found
db.users.findOne({username: "nonexistent"})  // null
```

### Projection (Select Specific Fields)

```javascript
// Include specific fields
db.users.find(
  {age: {$gte: 25}},
  {username: 1, email: 1}  // 1 = include
)
// Returns: {_id: ..., username: "alice", email: "alice@example.com"}

// Exclude _id
db.users.find(
  {age: {$gte: 25}},
  {username: 1, email: 1, _id: 0}  // 0 = exclude
)
// Returns: {username: "alice", email: "alice@example.com"}

// Exclude specific fields
db.users.find(
  {age: {$gte: 25}},
  {password: 0, ssn: 0}  // Hide sensitive fields
)
```

### Sorting, Limiting, and Skipping

```javascript
// Sort ascending
db.users.find().sort({age: 1})

// Sort descending
db.users.find().sort({age: -1})

// Multiple sort fields
db.users.find().sort({age: -1, username: 1})

// Limit results
db.users.find().limit(10)

// Skip results (pagination)
db.users.find().skip(20).limit(10)  // Page 3 (skip 20, get 10)

// Combine all
db.users.find({age: {$gte: 25}})
  .sort({created_at: -1})
  .limit(10)
  .skip(0)
```

### Counting

```javascript
// Count all documents
db.users.countDocuments()

// Count with filter
db.users.countDocuments({age: {$gte: 25}})

// Estimate count (faster but approximate)
db.users.estimatedDocumentCount()
```

---

## Update Operations

### Update One Document

```javascript
// Update first matching document
db.users.updateOne(
  {username: "alice"},              // Filter
  {$set: {age: 26}}                // Update
)

// Response
{
  acknowledged: true,
  matchedCount: 1,
  modifiedCount: 1
}
```

### Update Many Documents

```javascript
// Update all matching documents
db.users.updateMany(
  {age: {$lt: 18}},
  {$set: {status: "minor"}}
)

// Response
{
  acknowledged: true,
  matchedCount: 5,
  modifiedCount: 5
}
```

### Update Operators

**$set - Set field value:**
```javascript
db.users.updateOne(
  {username: "alice"},
  {$set: {email: "newemail@example.com", verified: true}}
)
```

**$inc - Increment/decrement numeric value:**
```javascript
// Increment
db.users.updateOne(
  {username: "alice"},
  {$inc: {login_count: 1}}  // Increment by 1
)

// Decrement
db.users.updateOne(
  {username: "alice"},
  {$inc: {credits: -10}}  // Decrease by 10
)
```

**$push - Add to array:**
```javascript
// Add single item
db.users.updateOne(
  {username: "alice"},
  {$push: {interests: "cooking"}}
)

// Add multiple items
db.users.updateOne(
  {username: "alice"},
  {$push: {interests: {$each: ["gaming", "yoga"]}}}
)
```

**$pull - Remove from array:**
```javascript
// Remove single value
db.users.updateOne(
  {username: "alice"},
  {$pull: {interests: "cooking"}}
)

// Remove matching condition
db.users.updateOne(
  {username: "alice"},
  {$pull: {scores: {$lt: 50}}}  // Remove scores < 50
)
```

**$addToSet - Add unique to array:**
```javascript
// Only adds if not already present
db.users.updateOne(
  {username: "alice"},
  {$addToSet: {interests: "reading"}}
)
```

**$unset - Remove field:**
```javascript
db.users.updateOne(
  {username: "alice"},
  {$unset: {temp_field: "", old_data: ""}}
)
```

**$rename - Rename field:**
```javascript
db.users.updateOne(
  {username: "alice"},
  {$rename: {old_name: "new_name"}}
)
```

**$currentDate - Set to current date:**
```javascript
db.users.updateOne(
  {username: "alice"},
  {$currentDate: {last_modified: true, lastLogin: {$type: "date"}}}
)
```

### Combining Multiple Operators

```javascript
// Update multiple fields with different operators
db.users.updateOne(
  {username: "alice"},
  {
    $set: {email: "newemail@example.com", status: "active"},
    $inc: {login_count: 1},
    $push: {interests: "photography"},
    $currentDate: {last_login: true}
  }
)
```

### Upsert (Update or Insert)

```javascript
// If document exists, update it
// If not, insert new document
db.users.updateOne(
  {username: "david"},
  {
    $set: {
      email: "david@example.com",
      age: 28
    }
  },
  {upsert: true}  // Create if doesn't exist
)

// Useful for "save or update" patterns
```

### Replace One Document

```javascript
// Replace entire document (except _id)
db.users.replaceOne(
  {username: "alice"},
  {
    username: "alice",
    email: "alice@example.com",
    age: 26,
    status: "active"
  }
)

// Warning: This removes all fields not in new document!
```

---

## Delete Operations

### Delete One Document

```javascript
// Delete first matching document
db.users.deleteOne({username: "alice"})

// Response
{
  acknowledged: true,
  deletedCount: 1
}
```

### Delete Many Documents

```javascript
// Delete all matching documents
db.users.deleteMany({age: {$lt: 18}})

// Response
{
  acknowledged: true,
  deletedCount: 5
}

// Delete all documents in collection
db.users.deleteMany({})
```

---

## Practical Examples

### User Registration

```javascript
// Register new user
const result = db.users.insertOne({
  username: "newuser",
  email: "newuser@example.com",
  password_hash: "hashed_password",
  created_at: new Date(),
  status: "pending",
  email_verified: false,
  profile: {
    first_name: "",
    last_name: "",
    avatar: null
  },
  settings: {
    notifications: true,
    theme: "light"
  }
})

console.log(`User created with ID: ${result.insertedId}`)
```

### User Login

```javascript
// Find user and increment login count
const user = db.users.findOne({email: "user@example.com"})

if (user) {
  db.users.updateOne(
    {_id: user._id},
    {
      $inc: {login_count: 1},
      $currentDate: {last_login: true}
    }
  )
}
```

### Update User Profile

```javascript
// Update profile information
db.users.updateOne(
  {username: "alice"},
  {
    $set: {
      "profile.first_name": "Alice",
      "profile.last_name": "Johnson",
      "profile.bio": "Software developer",
      updated_at: new Date()
    }
  }
)
```

### Add to Shopping Cart

```javascript
// Add item to cart
db.users.updateOne(
  {username: "alice"},
  {
    $push: {
      cart: {
        product_id: ObjectId("..."),
        quantity: 1,
        price: 29.99,
        added_at: new Date()
      }
    }
  }
)
```

### Remove from Shopping Cart

```javascript
// Remove item from cart
db.users.updateOne(
  {username: "alice"},
  {
    $pull: {
      cart: {product_id: ObjectId("...")}
    }
  }
)
```

### Soft Delete

```javascript
// Mark as deleted instead of removing
db.users.updateOne(
  {username: "alice"},
  {
    $set: {
      deleted: true,
      deleted_at: new Date()
    }
  }
)

// Query active users only
db.users.find({deleted: {$ne: true}})
```

### Bulk Operations

```javascript
// Perform multiple operations efficiently
db.users.bulkWrite([
  {
    insertOne: {
      document: {username: "user1", email: "user1@example.com"}
    }
  },
  {
    updateOne: {
      filter: {username: "user2"},
      update: {$set: {status: "active"}}
    }
  },
  {
    deleteOne: {
      filter: {username: "user3"}
    }
  }
])
```

---

## Best Practices

### Always Use Filters

```javascript
// Bad: Updates first document it finds
db.users.updateOne({}, {$set: {status: "active"}})

// Good: Specific filter
db.users.updateOne(
  {username: "alice"},
  {$set: {status: "active"}}
)
```

### Check Operation Results

```javascript
const result = db.users.deleteOne({username: "alice"})

if (result.deletedCount === 0) {
  console.log("User not found")
} else {
  console.log("User deleted successfully")
}
```

### Use Appropriate Update Operators

```javascript
// Bad: Replace entire document accidentally
db.users.updateOne(
  {username: "alice"},
  {age: 26}  // Replaces all fields!
)

// Good: Use $set
db.users.updateOne(
  {username: "alice"},
  {$set: {age: 26}}
)
```

### Timestamps

```javascript
// Add timestamps to track changes
db.users.insertOne({
  username: "alice",
  created_at: new Date(),
  updated_at: new Date()
})

// Update timestamp on modifications
db.users.updateOne(
  {username: "alice"},
  {
    $set: {age: 26},
    $currentDate: {updated_at: true}
  }
)
```

---

## Common Pitfalls

### 1. Forgetting $set

```javascript
// Wrong: This replaces the entire document!
db.users.updateOne({username: "alice"}, {age: 26})

// Correct: Use $set
db.users.updateOne({username: "alice"}, {$set: {age: 26}})
```

### 2. Using find() Instead of findOne()

```javascript
// Returns cursor (need to iterate)
const cursor = db.users.find({username: "alice"})

// Returns single document
const user = db.users.findOne({username: "alice"})
```

### 3. Not Checking for null

```javascript
// May return null
const user = db.users.findOne({username: "nonexistent"})

// Safe: Check before using
if (user) {
  console.log(user.email)
} else {
  console.log("User not found")
}
```

---

## Quick Reference

### CRUD Operations Cheat Sheet

```javascript
// Create
db.collection.insertOne({...})
db.collection.insertMany([{...}, {...}])

// Read
db.collection.find({filter})
db.collection.findOne({filter})
db.collection.countDocuments({filter})

// Update
db.collection.updateOne({filter}, {$set: {...}})
db.collection.updateMany({filter}, {$set: {...}})
db.collection.replaceOne({filter}, {...})

// Delete
db.collection.deleteOne({filter})
db.collection.deleteMany({filter})
```

### Common Update Operators

```javascript
$set          // Set field value
$inc          // Increment/decrement number
$push         // Add to array
$pull         // Remove from array
$addToSet     // Add unique to array
$unset        // Remove field
$rename       // Rename field
$currentDate  // Set current date
```

---

## Navigation

[← Previous: MongoDB Basics](./nosql-mongodb-basics.md) | [Back to Index](./README.md) | [Next: Querying →](./nosql-mongodb-querying.md)
