# One-Hot Encoding - Complete Guide

## What You'll Learn

One-hot encoding is the most intuitive and widely-used technique for converting nominal categorical variables into numerical format. Discover how it creates binary columns for each category, when to use it, and how to avoid common pitfalls.

## The Concept

One-hot encoding creates separate binary columns for each unique category. Each observation gets a 1 in its category column and 0 in all others.

### Visual Example

```
Original Data:
┌──────┬────────┐
│ ID   │ Color  │
├──────┼────────┤
│ 1    │ Red    │
│ 2    │ Blue   │
│ 3    │ Green  │
│ 4    │ Red    │
└──────┴────────┘

After One-Hot Encoding:
┌──────┬──────────┬───────────┬────────────┐
│ ID   │ Color_Red│ Color_Blue│ Color_Green│
├──────┼──────────┼───────────┼────────────┤
│ 1    │    1     │     0     │      0     │
│ 2    │    0     │     1     │      0     │
│ 3    │    0     │     0     │      1     │
│ 4    │    1     │     0     │      0     │
└──────┴──────────┴───────────┴────────────┘
```

## Python Implementation

### Method 1: Pandas get_dummies

The simplest and most commonly used method for one-hot encoding.

```python
import pandas as pd
import numpy as np

# Sample data
df = pd.DataFrame({
    'customer_id': [1, 2, 3, 4, 5],
    'city': ['NYC', 'LA', 'Chicago', 'NYC', 'LA'],
    'product': ['Phone', 'Laptop', 'Tablet', 'Phone', 'Laptop']
})

print("Original Data:")
print(df)
print("\n" + "="*50 + "\n")

# One-Hot Encoding
df_encoded = pd.get_dummies(df, columns=['city', 'product'], prefix=['city', 'prod'])

print("After One-Hot Encoding:")
print(df_encoded)
print(f"\nOriginal columns: {df.shape[1]}")
print(f"Encoded columns: {df_encoded.shape[1]}")
```

**Output:**
```
Original Data:
   customer_id     city  product
0            1      NYC    Phone
1            2       LA   Laptop
2            3  Chicago   Tablet
3            4      NYC    Phone
4            5       LA   Laptop

==================================================

After One-Hot Encoding:
   customer_id  city_Chicago  city_LA  city_NYC  prod_Laptop  prod_Phone  prod_Tablet
0            1             0        0         1            0           1            0
1            2             0        1         0            1           0            0
2            3             1        0         0            0           0            1
3            4             0        0         1            0           1            0
4            5             0        1         0            1           0            0

Original columns: 3
Encoded columns: 7
```

### Method 2: Scikit-learn OneHotEncoder

More powerful for production pipelines with better handling of unknown categories.

```python
from sklearn.preprocessing import OneHotEncoder
import pandas as pd

# Sample data
data = pd.DataFrame({
    'city': ['NYC', 'LA', 'Chicago', 'NYC', 'LA']
})

# Create encoder
encoder = OneHotEncoder(sparse_output=False, drop=None)

# Fit and transform
encoded = encoder.fit_transform(data[['city']])

# Create DataFrame with proper column names
encoded_df = pd.DataFrame(
    encoded,
    columns=encoder.get_feature_names_out(['city'])
)

print("Encoded Data:")
print(encoded_df)
print(f"\nCategories found: {encoder.categories_}")
```

**Output:**
```
Encoded Data:
   city_Chicago  city_LA  city_NYC
0           0.0      0.0       1.0
1           0.0      1.0       0.0
2           1.0      0.0       0.0
3           0.0      0.0       1.0
4           0.0      1.0       0.0

Categories found: [array(['Chicago', 'LA', 'NYC'], dtype=object)]
```

## Real-World Example: Customer Segmentation

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier

# Customer data
df = pd.DataFrame({
    'age': [25, 35, 45, 28, 52],
    'city': ['NYC', 'LA', 'Chicago', 'NYC', 'Houston'],
    'product_type': ['Electronics', 'Clothing', 'Electronics', 'Food', 'Clothing'],
    'churned': [0, 1, 0, 0, 1]
})

# Separate features and target
X = df.drop('churned', axis=1)
y = df['churned']

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Create transformer for categorical columns
categorical_features = ['city', 'product_type']
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ],
    remainder='passthrough'  # Keep other columns as is
)

# Fit on training data
X_train_encoded = preprocessor.fit_transform(X_train)
X_test_encoded = preprocessor.transform(X_test)

print("Training data shape after encoding:", X_train_encoded.shape)
print("Test data shape after encoding:", X_test_encoded.shape)
```

## Handling Unknown Categories

A critical consideration in production environments.

```python
from sklearn.preprocessing import OneHotEncoder
import pandas as pd

# Training data
train_data = pd.DataFrame({
    'city': ['NYC', 'LA', 'Chicago']
})

# Test data with unseen category
test_data = pd.DataFrame({
    'city': ['NYC', 'Houston']  # Houston is new!
})

# Method 1: Raise error on unknown (default)
encoder_error = OneHotEncoder(handle_unknown='error')
encoder_error.fit(train_data)

try:
    encoded = encoder_error.transform(test_data)
except ValueError as e:
    print(f"Error method: {e}\n")

# Method 2: Ignore unknown (recommended)
encoder_ignore = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
encoder_ignore.fit(train_data)
encoded_ignore = encoder_ignore.transform(test_data)

print("With handle_unknown='ignore':")
print(pd.DataFrame(encoded_ignore, columns=encoder_ignore.get_feature_names_out()))
print("\nNote: Houston gets all zeros (ignored)")
```

## Dropping the First Category

Prevents multicollinearity in linear models.

```python
from sklearn.preprocessing import OneHotEncoder
import pandas as pd

data = pd.DataFrame({
    'color': ['Red', 'Blue', 'Green', 'Red']
})

# Without dropping
encoder_full = OneHotEncoder(drop=None, sparse_output=False)
result_full = encoder_full.fit_transform(data)

print("Without dropping (3 columns):")
print(pd.DataFrame(result_full, columns=encoder_full.get_feature_names_out()))
print("\n" + "="*50 + "\n")

# Drop first category
encoder_drop = OneHotEncoder(drop='first', sparse_output=False)
result_drop = encoder_drop.fit_transform(data)

print("With drop='first' (2 columns):")
print(pd.DataFrame(result_drop, columns=encoder_drop.get_feature_names_out()))
print("\nNote: Red is dropped (can be inferred: not Blue and not Green = Red)")
```

## When to Use One-Hot Encoding

### Perfect For

- **Low cardinality** (< 10 unique values)
- **Nominal categories** (no natural order)
- **Linear models** (Logistic Regression, Linear SVM)
- **Neural networks**

### Examples

```python
# Good use cases
examples = {
    'Gender': ['Male', 'Female'],                    # 2 categories
    'Payment Method': ['Card', 'Cash', 'UPI'],       # 3 categories
    'Product Category': ['A', 'B', 'C', 'D', 'E'],   # 5 categories
    'Day of Week': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']  # 7 categories
}

for feature, categories in examples.items():
    print(f"{feature}: {len(categories)} categories → {len(categories)} columns (manageable)")
```

## Advantages

```
✅ No ordinal relationship implied
✅ Works perfectly with linear models
✅ Easy to interpret (each column = one category)
✅ Handles nominal categories naturally
✅ No assumptions about relationships
```

## Disadvantages

```
❌ Creates many columns (curse of dimensionality)
❌ Not suitable for high cardinality (>10 categories)
❌ Sparse matrices consume memory
❌ Can cause multicollinearity in linear models
❌ Exponential growth with multiple categorical features
```

## Common Pitfalls

### Pitfall 1: High Cardinality Explosion

```python
import pandas as pd

# BAD: One-hot encoding 100 cities
cities = pd.DataFrame({
    'city': [f'City_{i}' for i in range(100)]
})

encoded = pd.get_dummies(cities)
print(f"Created {encoded.shape[1]} columns!")  # 100 columns!
print("This causes:")
print("  - Memory issues")
print("  - Slow training")
print("  - Overfitting")
print("\nSolution: Use Target or Frequency Encoding instead")
```

### Pitfall 2: Data Leakage in Train/Test Split

```python
from sklearn.preprocessing import OneHotEncoder
import pandas as pd

# WRONG: Encoding before split
df = pd.DataFrame({
    'city': ['NYC', 'LA', 'NYC', 'Chicago', 'LA']
})

# Don't do this!
# df_encoded = pd.get_dummies(df)
# X_train, X_test = train_test_split(df_encoded)

# CORRECT: Split first, then encode
from sklearn.model_selection import train_test_split

X_train, X_test = train_test_split(df, test_size=0.2)

encoder = OneHotEncoder(handle_unknown='ignore')
X_train_encoded = encoder.fit_transform(X_train)
X_test_encoded = encoder.transform(X_test)
```

## Best Practices

### Use Pipelines

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier

# Define features
categorical_features = ['city', 'product']
numerical_features = ['age', 'income']

# Create preprocessing pipeline
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
        ('num', StandardScaler(), numerical_features)
    ])

# Full pipeline
pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier())
])

# Fit and predict (no leakage!)
pipeline.fit(X_train, y_train)
predictions = pipeline.predict(X_test)
```

## Summary

One-hot encoding is your go-to method for nominal categorical variables with low cardinality. It's simple, interpretable, and works well with most algorithms.

**Remember:**
- Use for low cardinality (< 10 categories)
- Perfect for nominal variables
- Always handle unknown categories
- Consider dropping first category for linear models
- Use pipelines to prevent data leakage

---

**Navigation:**
- **Previous:** [← Encoding Overview](./encoding-overview.md)
- **Next:** [Ordinal Encoding →](./encoding-ordinal.md)
- **Related:** [Binary Encoding](./encoding-binary.md) (alternative for medium cardinality)
