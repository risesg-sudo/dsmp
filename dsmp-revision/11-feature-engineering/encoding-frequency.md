# Frequency Encoding - Complete Guide

## What You'll Learn

Frequency encoding is one of the simplest yet effective encoding techniques. It replaces each category with how often it appears in the dataset. Discover when category frequency itself contains valuable information for your model.

## The Concept

Frequency encoding replaces each category with its count or percentage frequency. This captures the popularity or commonality of each category.

### Visual Example

```
Original Data:
┌────┬─────────┐
│ ID │  City   │
├────┼─────────┤
│ 1  │  NYC    │
│ 2  │  LA     │
│ 3  │  NYC    │
│ 4  │  NYC    │
│ 5  │  Chicago│
│ 6  │  LA     │
└────┴─────────┘

Frequency Count:
┌─────────┬───────┬────────────┐
│  City   │ Count │ Percentage │
├─────────┼───────┼────────────┤
│  NYC    │   3   │   50.0%    │
│  LA     │   2   │   33.3%    │
│  Chicago│   1   │   16.7%    │
└─────────┴───────┴────────────┘

After Frequency Encoding:
┌────┬─────────┬─────────────┬──────────────────┐
│ ID │  City   │ City_Count  │ City_Percentage  │
├────┼─────────┼─────────────┼──────────────────┤
│ 1  │  NYC    │      3      │      0.500       │
│ 2  │  LA     │      2      │      0.333       │
│ 3  │  NYC    │      3      │      0.500       │
│ 4  │  NYC    │      3      │      0.500       │
│ 5  │  Chicago│      1      │      0.167       │
│ 6  │  LA     │      2      │      0.333       │
└────┴─────────┴─────────────┴──────────────────┘
```

## Python Implementation

### Method 1: Count Frequency

```python
import pandas as pd
import numpy as np

# Sample data
df = pd.DataFrame({
    'customer_id': range(1, 11),
    'city': ['NYC', 'LA', 'NYC', 'Chicago', 'NYC',
             'LA', 'Houston', 'NYC', 'LA', 'Chicago']
})

print("Original Data:")
print(df)
print("\n" + "="*60 + "\n")

# Method 1: Count frequency
frequency_map = df['city'].value_counts().to_dict()
df['city_frequency'] = df['city'].map(frequency_map)

print("Frequency Map:")
print(frequency_map)
print("\n" + "="*60 + "\n")

# Method 2: Percentage frequency
percentage_map = (df['city'].value_counts(normalize=True) * 100).to_dict()
df['city_percentage'] = df['city'].map(percentage_map)

print("After Frequency Encoding:")
print(df)

# Sort by frequency to see pattern
print("\n" + "="*60 + "\n")
print("Sorted by Frequency:")
print(df.sort_values('city_frequency', ascending=False))
```

### Method 2: Normalized Frequency

Always normalize to prevent scale issues.

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    'category': ['A'] * 100 + ['B'] * 50 + ['C'] * 10 + ['D'] * 5
})

print("Category Distribution:")
print(df['category'].value_counts())
print("\n" + "="*60 + "\n")

# Raw counts (problematic for models)
df['freq_raw'] = df['category'].map(df['category'].value_counts())

# Normalized (0-1 range, better for models)
df['freq_normalized'] = df['category'].map(
    df['category'].value_counts(normalize=True)
)

# Max-normalized
freq_counts = df['category'].value_counts()
df['freq_max_norm'] = df['category'].map(freq_counts / freq_counts.max())

print("Different Normalization Methods:")
print(df.groupby('category')[['freq_raw', 'freq_normalized', 'freq_max_norm']].first())
```

## Real-World Example: Customer Behavior Analysis

```python
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Generate customer data with realistic city distribution
np.random.seed(42)

cities = np.random.choice(
    ['NYC', 'LA', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
     'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
    size=1000,
    p=[0.25, 0.20, 0.15, 0.10, 0.08, 0.07, 0.06, 0.04, 0.03, 0.02]
)

df = pd.DataFrame({
    'city': cities,
    'age': np.random.randint(18, 70, 1000),
    'income': np.random.randint(30000, 150000, 1000)
})

# Target: People in popular cities are more likely to buy
city_freq = df['city'].value_counts(normalize=True)
df['purchased'] = df['city'].map(city_freq).apply(
    lambda x: np.random.binomial(1, min(x * 2, 0.8))
)

print("Dataset Info:")
print(f"Shape: {df.shape}")
print(f"\nCity Distribution:")
print(df['city'].value_counts())
print(f"\nPurchase Rate: {df['purchased'].mean():.2%}")
print("\n" + "="*60 + "\n")

# Apply frequency encoding
city_frequency = df['city'].value_counts().to_dict()
df['city_frequency'] = df['city'].map(city_frequency)

# Normalize frequency to 0-1 range
df['city_frequency_norm'] = df['city_frequency'] / df['city_frequency'].max()

print("After Frequency Encoding:")
print(df.head(10))
print("\n" + "="*60 + "\n")

# Train model
X = df[['age', 'income', 'city_frequency_norm']]
y = df['purchased']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

predictions = model.predict(X_test)

print("Classification Report:")
print(classification_report(y_test, predictions))

print("\nFeature Importance:")
feature_importance = pd.DataFrame({
    'feature': X.columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)
print(feature_importance)
```

## When Frequency is Informative

Frequency encoding works best when the frequency itself carries meaning.

```python
examples = {
    'E-commerce Product Views': {
        'hypothesis': 'Popular products sell more',
        'why_frequency_works': 'View count indicates popularity',
        'example': 'iPhone viewed 10,000x, Unknown Brand viewed 10x'
    },
    'Website Error Codes': {
        'hypothesis': 'Common errors are less severe',
        'why_frequency_works': 'Frequency indicates error criticality',
        'example': '404 (common, low impact), 500 (rare, high impact)'
    },
    'City Population': {
        'hypothesis': 'Larger markets have different behaviors',
        'why_frequency_works': 'Frequency correlates with market size',
        'example': 'NYC (many customers), Small Town (few customers)'
    },
    'User Activity': {
        'hypothesis': 'Frequent actions indicate engagement',
        'why_frequency_works': 'Action frequency shows user patterns',
        'example': 'Daily Login (engaged), Rare Login (at-risk)'
    }
}

print("WHEN FREQUENCY ENCODING WORKS")
print("="*70)
for use_case, details in examples.items():
    print(f"\n{use_case}:")
    print(f"  Hypothesis: {details['hypothesis']}")
    print(f"  Why it works: {details['why_frequency_works']}")
    print(f"  Example: {details['example']}")
```

## Handling Collisions

Different categories can have the same frequency.

```python
import pandas as pd

# Example with collision
df = pd.DataFrame({
    'product': ['A', 'A', 'B', 'B', 'C', 'D']
})

frequency_map = df['product'].value_counts().to_dict()
df['product_freq'] = df['product'].map(frequency_map)

print("Frequency Encoding with Collisions:")
print(df)
print("\nNote: Products B, C, D all have frequency=1")
print("Solution: Combine with other features or use different encoding")
```

## Combining with Other Encodings

```python
import pandas as pd
import numpy as np

# Sample data
df = pd.DataFrame({
    'city': ['NYC', 'LA', 'NYC', 'Chicago', 'LA', 'NYC', 'Houston'] * 10
})

# Frequency encoding
freq_map = df['city'].value_counts(normalize=True).to_dict()
df['city_frequency'] = df['city'].map(freq_map)

# One-hot encoding
df_onehot = pd.get_dummies(df['city'], prefix='city')

# Combine
df_combined = pd.concat([df[['city_frequency']], df_onehot], axis=1)

print("Combined Encoding:")
print(df_combined.head())
print(f"\nShape: {df_combined.shape}")
print("Benefit: Captures both category identity AND popularity")
```

## When to Use Frequency Encoding

### Perfect For

- **Frequency is informative** (popularity matters)
- **Any cardinality**
- **Quick baseline**
- **Unsupervised learning** (no target needed)
- **Complement to other encodings**

### Examples

```python
good_use_cases = [
    'Product popularity in e-commerce',
    'Common vs rare error codes',
    'City/region market size',
    'Frequent vs infrequent user actions',
    'Popular vs niche categories',
    'High-volume vs low-volume items'
]

print("GOOD USE CASES FOR FREQUENCY ENCODING:")
print("="*60)
for i, use_case in enumerate(good_use_cases, 1):
    print(f"{i}. {use_case}")
```

## Advantages

```
✅ Simple and fast to compute
✅ Captures category popularity
✅ Single column output
✅ Works with any cardinality
✅ No target variable needed
✅ Intuitive interpretation
✅ Useful for unsupervised learning
```

## Disadvantages

```
❌ Different categories can have same frequency (collisions)
❌ Doesn't capture category-target relationship
❌ Information loss for rare categories
❌ May not be informative if frequency is random
❌ Sensitive to dataset size
❌ Doesn't handle new categories well
```

## Best Practices

### Always Normalize

```python
import pandas as pd

df = pd.DataFrame({
    'category': ['A'] * 1000 + ['B'] * 10
})

# Bad: Raw counts
df['freq_raw'] = df['category'].map(df['category'].value_counts())
print("Raw counts:")
print(df.groupby('category')['freq_raw'].first())
print("Problem: A=1000, B=10 → huge scale difference!")

# Good: Normalized
df['freq_norm'] = df['category'].map(
    df['category'].value_counts(normalize=True)
)
print("\nNormalized (0-1):")
print(df.groupby('category')['freq_norm'].first())
print("Better: A=0.99, B=0.01 → reasonable scale")
```

### Handle New Categories

```python
import pandas as pd

# Training data
train = pd.DataFrame({
    'city': ['NYC', 'LA', 'Chicago'] * 10
})

# Test data with new city
test = pd.DataFrame({
    'city': ['NYC', 'LA', 'Houston']
})

# Create frequency map from training
freq_map = train['city'].value_counts(normalize=True).to_dict()

# Handle new categories with global mean or minimum frequency
global_freq = 1 / len(train['city'].unique())  # Minimum possible

test['city_freq'] = test['city'].map(freq_map).fillna(global_freq)

print("Test data encoding:")
print(test)
print(f"\nHouston (new) gets default frequency: {global_freq:.4f}")
```

## Summary

Frequency encoding is simple yet powerful when category popularity matters. It's perfect as a quick baseline or combined with other encoding methods.

**Key Takeaways:**
- Use when frequency is informative
- Always normalize to 0-1 range
- Works with any cardinality
- No target variable needed
- Fast to compute
- Handle new categories with default value
- Consider combining with other encodings

---

**Navigation:**
- **Previous:** [← Binary Encoding](./encoding-binary.md)
- **Next:** [Encoding Comparison →](./encoding-comparison.md)
- **Related:** [Target Encoding](./encoding-target.md)
