# MongoDB Indexing and Aggregation Pipeline

## What You'll Learn

Master two critical MongoDB features that transform performance and analytics capabilities. Learn how indexes dramatically speed up queries by creating efficient lookup structures, and discover the aggregation pipeline that processes and transforms data through multiple stages. This guide teaches you when to create indexes, how to design them optimally, and how to build powerful data processing pipelines that rival SQL's complex queries.

---

## Part 1: Indexing

### Why Indexing Matters

**Without Index:**
```
Collection Scan: O(n) - Check every document
1 million documents → 1 million checks
Time: Slow and gets worse as data grows
```

**With Index:**
```
Index Scan: O(log n) - Use B-tree structure
1 million documents → ~20 checks
Time: Fast even for billions of documents
```

### Creating Indexes

**Single Field Index:**
```javascript
// Ascending index
db.users.createIndex({email: 1})  // 1 = ascending

// Descending index
db.users.createIndex({created_at: -1})  // -1 = descending
```

**Compound Index:**
```javascript
// Index on multiple fields
db.users.createIndex({age: 1, city: 1})

// Order matters!
// Good for: {age: X, city: Y}
// Good for: {age: X}
// Bad for: {city: Y} (won't use index efficiently)
```

**Unique Index:**
```javascript
// Enforce uniqueness
db.users.createIndex({email: 1}, {unique: true})

// Composite unique
db.users.createIndex({username: 1, tenant_id: 1}, {unique: true})
```

**Text Index:**
```javascript
// For text search
db.products.createIndex({name: "text", description: "text"})

// Use it
db.products.find({$text: {$search: "smartphone camera"}})

// Only one text index per collection
```

**TTL Index:**
```javascript
// Auto-delete documents after time
db.sessions.createIndex(
  {created_at: 1},
  {expireAfterSeconds: 3600}  // Delete after 1 hour
)

// Documents deleted automatically
```

**Partial Index:**
```javascript
// Index subset of documents
db.users.createIndex(
  {age: 1},
  {partialFilterExpression: {status: "active"}}
)

// Only indexes active users
// Saves space and improves performance
```

**Sparse Index:**
```javascript
// Index only documents with field
db.users.createIndex(
  {phone: 1},
  {sparse: true}
)

// Doesn't index documents without phone field
```

### Index Management

```javascript
// List all indexes
db.users.getIndexes()

// Drop index
db.users.dropIndex("email_1")

// Drop all indexes (except _id)
db.users.dropIndexes()

// Get index stats
db.users.stats().indexSizes
```

### Analyzing Query Performance

```javascript
// Explain query execution
db.users.find({email: "john@example.com"}).explain("executionStats")

// Key metrics:
// - executionTimeMillis: Query time
// - totalDocsExamined: Documents scanned
// - totalKeysExamined: Index entries scanned
// - nReturned: Documents returned

// Good: totalDocsExamined ≈ nReturned (index used efficiently)
// Bad: totalDocsExamined >> nReturned (scanning many unwanted docs)
```

### Index Best Practices

**1. Index Frequently Queried Fields:**
```javascript
// Frequently used in queries
db.users.createIndex({email: 1})
db.products.createIndex({category: 1})
```

**2. Compound Index Order (ESR Rule):**
```
E = Equality (exact match)
S = Sort
R = Range

Example query:
db.users.find({status: "active", age: {$gt: 25}}).sort({created_at: -1})

Optimal index:
db.users.createIndex({
  status: 1,      // Equality
  created_at: -1, // Sort
  age: 1          // Range
})
```

**3. Don't Over-Index:**
```javascript
// Bad: Index every field
db.users.createIndex({field1: 1})
db.users.createIndex({field2: 1})
// ... 20 indexes

// Problem:
// - Slower writes (must update all indexes)
// - More storage
// - Longer maintenance

// Good: Index only frequently queried fields
```

**4. Use Covered Queries:**
```javascript
// Create index with all needed fields
db.users.createIndex({email: 1, name: 1, age: 1})

// Query that uses only indexed fields
db.users.find(
  {email: "john@example.com"},
  {email: 1, name: 1, age: 1, _id: 0}
)

// MongoDB can return result from index alone
// No need to access documents → Super fast!
```

**5. Monitor Index Usage:**
```javascript
// Check which indexes are used
db.users.aggregate([
  {$indexStats: {}}
])

// Remove unused indexes
```

---

## Part 2: Aggregation Pipeline

### What is Aggregation Pipeline?

Process documents through multiple stages to transform and analyze data.

```
Documents → Stage 1 → Stage 2 → Stage 3 → ... → Results

Example:
Collection → [$match] → [$group] → [$sort] → [$limit] → Final Results
```

### Common Pipeline Stages

| Stage | Purpose | Example |
|-------|---------|---------|
| `$match` | Filter documents | `{$match: {age: {$gte: 25}}}` |
| `$group` | Group and aggregate | `{$group: {_id: "$city", count: {$sum: 1}}}` |
| `$project` | Select/transform fields | `{$project: {name: 1, age: 1}}` |
| `$sort` | Sort results | `{$sort: {age: -1}}` |
| `$limit` | Limit results | `{$limit: 10}` |
| `$skip` | Skip documents | `{$skip: 5}` |
| `$lookup` | Join collections | `{$lookup: {from: "orders", ...}}` |
| `$unwind` | Deconstruct arrays | `{$unwind: "$items"}` |
| `$addFields` | Add new fields | `{$addFields: {total: {$add: ["$a", "$b"]}}}` |

### Basic Aggregation Examples

**Count by Category:**
```javascript
db.products.aggregate([
  {
    $group: {
      _id: "$category",
      count: {$sum: 1}
    }
  }
])

// Result:
// {_id: "Electronics", count: 150}
// {_id: "Books", count: 200}
```

**Average Price by Category:**
```javascript
db.products.aggregate([
  {
    $group: {
      _id: "$category",
      avg_price: {$avg: "$price"},
      count: {$sum: 1}
    }
  },
  {
    $sort: {avg_price: -1}
  }
])
```

**Filter Then Group:**
```javascript
db.orders.aggregate([
  // Stage 1: Filter 2024 orders
  {
    $match: {
      order_date: {$gte: ISODate("2024-01-01")}
    }
  },
  // Stage 2: Group by customer
  {
    $group: {
      _id: "$customer_id",
      total_orders: {$sum: 1},
      total_spent: {$sum: "$total"}
    }
  },
  // Stage 3: Sort by total spent
  {
    $sort: {total_spent: -1}
  },
  // Stage 4: Top 10 customers
  {
    $limit: 10
  }
])
```

### Advanced Aggregation

**Complex Multi-Stage Pipeline:**
```javascript
db.orders.aggregate([
  // Stage 1: Filter recent orders
  {
    $match: {
      order_date: {$gte: ISODate("2024-01-01")}
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

  // Stage 4: Group by user
  {
    $group: {
      _id: "$user_id",
      username: {$first: "$user_info.username"},
      email: {$first: "$user_info.email"},
      total_orders: {$sum: 1},
      total_amount: {$sum: "$total"},
      avg_order: {$avg: "$total"}
    }
  },

  // Stage 5: Sort
  {
    $sort: {total_amount: -1}
  },

  // Stage 6: Limit
  {
    $limit: 10
  },

  // Stage 7: Project final fields
  {
    $project: {
      _id: 0,
      username: 1,
      email: 1,
      total_orders: 1,
      total_amount: {$round: ["$total_amount", 2]},
      avg_order: {$round: ["$avg_order", 2]}
    }
  }
])
```

### Aggregation Operators

**Accumulator Operators:**
```javascript
$sum          // Sum values
$avg          // Average
$min          // Minimum
$max          // Maximum
$first        // First value
$last         // Last value
$push         // Add to array
$addToSet     // Add unique to array
```

**Example:**
```javascript
db.sales.aggregate([
  {
    $group: {
      _id: "$product_id",
      total_sold: {$sum: "$quantity"},
      avg_price: {$avg: "$price"},
      min_price: {$min: "$price"},
      max_price: {$max: "$price"},
      all_dates: {$push: "$date"},
      unique_customers: {$addToSet: "$customer_id"}
    }
  }
])
```

**Array Operators:**
```javascript
// Unwind arrays
db.orders.aggregate([
  {$unwind: "$items"},
  {$group: {
    _id: "$items.product_id",
    total_quantity: {$sum: "$items.quantity"}
  }}
])

// Array size
db.users.aggregate([
  {
    $project: {
      username: 1,
      interest_count: {$size: "$interests"}
    }
  }
])
```

**Date Operators:**
```javascript
// Group by date parts
db.orders.aggregate([
  {
    $group: {
      _id: {
        year: {$year: "$order_date"},
        month: {$month: "$order_date"}
      },
      total: {$sum: "$amount"}
    }
  }
])
```

### Practical Aggregation Examples

**Daily Sales Report:**
```javascript
db.orders.aggregate([
  {
    $match: {
      order_date: {
        $gte: ISODate("2024-01-01"),
        $lt: ISODate("2024-02-01")
      }
    }
  },
  {
    $group: {
      _id: {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$order_date"
        }
      },
      total_orders: {$sum: 1},
      total_revenue: {$sum: "$total"},
      avg_order_value: {$avg: "$total"}
    }
  },
  {
    $sort: {_id: 1}
  }
])
```

**Top Products by Category:**
```javascript
db.products.aggregate([
  {
    $lookup: {
      from: "reviews",
      localField: "_id",
      foreignField: "product_id",
      as: "reviews"
    }
  },
  {
    $addFields: {
      avg_rating: {$avg: "$reviews.rating"},
      review_count: {$size: "$reviews"}
    }
  },
  {
    $match: {
      review_count: {$gte: 5}
    }
  },
  {
    $sort: {
      category: 1,
      avg_rating: -1
    }
  },
  {
    $group: {
      _id: "$category",
      top_products: {
        $push: {
          name: "$name",
          avg_rating: "$avg_rating",
          review_count: "$review_count"
        }
      }
    }
  },
  {
    $project: {
      category: "$_id",
      top_3: {$slice: ["$top_products", 3]}
    }
  }
])
```

---

## Quick Reference

### Index Types

```javascript
// Single field
db.collection.createIndex({field: 1})

// Compound
db.collection.createIndex({field1: 1, field2: -1})

// Unique
db.collection.createIndex({field: 1}, {unique: true})

// Text
db.collection.createIndex({field: "text"})

// TTL
db.collection.createIndex({date: 1}, {expireAfterSeconds: 3600})
```

### Aggregation Stages

```javascript
$match      // Filter
$group      // Group and aggregate
$project    // Select fields
$sort       // Sort
$limit      // Limit results
$skip       // Skip results
$lookup     // Join
$unwind     // Deconstruct array
$addFields  // Add fields
```

### Best Practices

**Indexing:**
1. Index frequently queried fields
2. Use compound indexes (ESR order)
3. Don't over-index
4. Monitor with explain()
5. Remove unused indexes

**Aggregation:**
1. $match early to filter
2. $project to reduce document size
3. Use indexes in $match and $sort
4. Avoid $lookup when possible
5. Test with explain()

---

## Navigation

[← Previous: Querying](./nosql-mongodb-querying.md) | [Back to Index](./README.md) | [Next: PyMongo →](./nosql-mongodb-pymongo.md)
