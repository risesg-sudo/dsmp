# Aggregation Features

## What You'll Learn

Master the art of summarizing transactional data into powerful customer-level or group-level features. You'll learn how to create aggregations that capture complex behavioral patterns from raw event data, turning millions of transactions into actionable insights.

## Understanding Group-Based Aggregations

Aggregation features summarize multiple observations into single, informative metrics. This technique is invaluable when you have transactional or event-level data but need to make predictions at a higher level.

```python
import pandas as pd
import numpy as np

# Transaction data
np.random.seed(42)
n = 20

df = pd.DataFrame({
    'customer_id': np.random.choice(['C1', 'C2', 'C3', 'C4'], n),
    'product_category': np.random.choice(['Electronics', 'Clothing', 'Food'], n),
    'amount': np.random.uniform(10, 500, n),
    'quantity': np.random.randint(1, 5, n)
})

print("Transaction Data:")
print(df)
print("\n" + "="*60 + "\n")

# Customer-level aggregations
customer_agg = df.groupby('customer_id').agg({
    'amount': ['sum', 'mean', 'std', 'min', 'max', 'count'],
    'quantity': ['sum', 'mean']
}).reset_index()

# Flatten column names
customer_agg.columns = ['_'.join(col).strip('_') for col in customer_agg.columns.values]

print("Customer-Level Aggregations:")
print(customer_agg)

print("\n" + "="*60 + "\n")

# Product category aggregations
category_agg = df.groupby('product_category').agg({
    'amount': ['mean', 'count'],
    'quantity': 'sum'
}).reset_index()

category_agg.columns = ['_'.join(col).strip('_') for col in category_agg.columns.values]

print("Category-Level Aggregations:")
print(category_agg)

print("\n" + "="*60 + "\n")

# Merge aggregations back to original data
df = df.merge(customer_agg, on='customer_id', how='left')

print("Original Data with Customer Aggregations:")
print(df[['customer_id', 'amount', 'amount_mean', 'amount_sum', 'amount_count']])
```

## Real-World Example: Customer Churn Prediction

```python
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Generate customer transaction history
np.random.seed(42)
n_transactions = 2000

transactions = pd.DataFrame({
    'customer_id': np.random.choice(range(1, 201), n_transactions),
    'transaction_date': pd.date_range('2023-01-01', periods=n_transactions, freq='H'),
    'amount': np.random.exponential(scale=50, size=n_transactions) + 10,
    'category': np.random.choice(['Electronics', 'Clothing', 'Food', 'Other'], n_transactions),
    'payment_method': np.random.choice(['Card', 'Cash', 'Digital'], n_transactions)
})

# Customer labels (churned or not)
np.random.seed(42)
customer_labels = pd.DataFrame({
    'customer_id': range(1, 201),
    'churned': np.random.binomial(1, 0.3, 200)
})

print("Sample Transactions:")
print(transactions.head(10))
print(f"\nTotal Transactions: {len(transactions)}")

# Aggregate features per customer
print("\nCreating Aggregation Features...")
print("="*60)

# Basic aggregations
customer_features = transactions.groupby('customer_id').agg({
    'amount': ['sum', 'mean', 'std', 'min', 'max', 'count'],
    'transaction_date': ['min', 'max']
}).reset_index()

customer_features.columns = ['_'.join(col).strip('_') for col in customer_features.columns.values]
customer_features.rename(columns={'customer_id_': 'customer_id'}, inplace=True)

# Derived features
customer_features['transaction_span_days'] = (
    customer_features['transaction_date_max'] - customer_features['transaction_date_min']
).dt.days

customer_features['avg_days_between_transactions'] = (
    customer_features['transaction_span_days'] / customer_features['amount_count']
)

# Category diversity
category_counts = transactions.groupby('customer_id')['category'].nunique().reset_index()
category_counts.columns = ['customer_id', 'category_diversity']
customer_features = customer_features.merge(category_counts, on='customer_id')

# Favorite payment method
payment_mode = transactions.groupby('customer_id')['payment_method'].agg(
    lambda x: x.value_counts().index[0]
).reset_index()
payment_mode.columns = ['customer_id', 'favorite_payment']
customer_features = customer_features.merge(payment_mode, on='customer_id')

# Recency
latest_date = transactions['transaction_date'].max()
customer_features['days_since_last_purchase'] = (
    latest_date - customer_features['transaction_date_max']
).dt.days

print("Sample of Aggregated Features:")
print(customer_features.head(10))

# Merge with labels
customer_data = customer_features.merge(customer_labels, on='customer_id')

# Prepare for modeling
feature_cols = ['amount_sum', 'amount_mean', 'amount_std', 'amount_count',
                'transaction_span_days', 'avg_days_between_transactions',
                'category_diversity', 'days_since_last_purchase']

X = customer_data[feature_cols]
y = customer_data['churned']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("\n" + "="*60 + "\n")
print("Churn Prediction Model:")
print(f"Accuracy: {accuracy:.2%}")

print("\n" + "="*60 + "\n")
print("Feature Importance:")
importances = pd.DataFrame({
    'feature': feature_cols,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)
print(importances.to_string(index=False))
```

## Common Aggregation Types

```
Statistical Aggregations:
  - sum, mean, median
  - std, min, max
  - count, nunique
  - percentiles (25th, 75th)

Time-Based:
  - first, last
  - min_date, max_date
  - recency, frequency

Custom:
  - mode (most frequent)
  - range (max - min)
  - coefficient of variation
```

## When to Use Aggregation Features

Use aggregation features when:
- You have transaction or event-level data
- Need to predict at customer/group level
- Want to capture behavioral patterns
- Summarizing historical interactions

These features are powerful for customer analytics, churn prediction, and recommendation systems.

## Quick Reference

```
Basic aggregation:
  df.groupby('customer_id')['amount'].agg(['sum', 'mean', 'count'])

Multiple columns:
  df.groupby('customer_id').agg({
      'amount': ['sum', 'mean'],
      'quantity': 'count'
  })

Merge back to original:
  df = df.merge(agg_features, on='customer_id')

Avoid data leakage:
  - Aggregate on training data only
  - Apply same aggregations to test
```

---

**Related Topics:**
- [Temporal Features](./temporal-features.md) - Time-based aggregations
- [Best Practices](./feature-construction-best-practices.md) - Avoiding leakage

**Navigate:** [Feature Engineering Home](./README.md)
