# Target Encoding - Complete Guide

## What You'll Learn

Target encoding is a powerful technique for high-cardinality categorical variables. It replaces each category with the mean of the target variable, capturing the relationship between the feature and what you're predicting. However, it requires careful implementation to avoid data leakage.

## The Concept

Target encoding (also called Mean Target Encoding) replaces each category with the average target value for that category. This directly captures how each category relates to the outcome you're predicting.

### Visual Example

```
Original Data:                    Target Statistics:
┌────────┬────────┐              ┌────────┬──────────┬─────────┐
│ City   │ Churn  │              │ City   │ Count    │ Mean    │
├────────┼────────┤              ├────────┼──────────┼─────────┤
│ NYC    │   1    │              │ NYC    │    3     │  0.67   │
│ LA     │   0    │              │ LA     │    2     │  0.00   │
│ NYC    │   0    │              │ Chicago│    1     │  1.00   │
│ NYC    │   1    │              └────────┴──────────┴─────────┘
│ Chicago│   1    │
│ LA     │   0    │
└────────┴────────┘

After Target Encoding:
┌────────┬────────┬──────────────┐
│ City   │ Churn  │ City_Encoded │
├────────┼────────┼──────────────┤
│ NYC    │   1    │    0.67      │
│ LA     │   0    │    0.00      │
│ NYC    │   0    │    0.67      │
│ NYC    │   1    │    0.67      │
│ Chicago│   1    │    1.00      │
│ LA     │   0    │    0.00      │
└────────┴────────┴──────────────┘
```

## Python Implementation

### Method 1: Manual Implementation

```python
import pandas as pd
import numpy as np

# Sample data
df = pd.DataFrame({
    'city': ['NYC', 'LA', 'NYC', 'Chicago', 'LA', 'NYC', 'Chicago'],
    'age': [25, 30, 35, 28, 45, 32, 38],
    'churned': [1, 0, 0, 1, 0, 1, 1]
})

print("Original Data:")
print(df)
print("\n" + "="*60 + "\n")

# Calculate mean target for each category
target_mean = df.groupby('city')['churned'].mean()
print("Target Mean by City:")
print(target_mean)
print("\n" + "="*60 + "\n")

# Map to original dataframe
df['city_encoded'] = df['city'].map(target_mean)

print("After Target Encoding:")
print(df)

# Compare with global mean
global_mean = df['churned'].mean()
print(f"\nGlobal churn rate: {global_mean:.2f}")
print("\nCity-specific churn rates show:")
print("- NYC customers churn at 0.67 (above average)")
print("- LA customers churn at 0.00 (below average)")
print("- Chicago customers churn at 1.00 (above average)")
```

### Method 2: Using category_encoders

```python
from category_encoders import TargetEncoder
import pandas as pd
from sklearn.model_selection import train_test_split

# Sample data
df = pd.DataFrame({
    'product': ['A', 'B', 'A', 'C', 'B', 'A', 'C', 'B'] * 10,
    'region': ['North', 'South', 'North', 'East', 'South', 'West', 'East', 'North'] * 10,
    'sales': [100, 200, 150, 300, 180, 120, 280, 210] * 10
})

print("Original Data Sample:")
print(df.head())
print(f"\nDataset shape: {df.shape}")
print("\n" + "="*60 + "\n")

# Split data
X = df[['product', 'region']]
y = df['sales']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

# Create target encoder
encoder = TargetEncoder(cols=['product', 'region'])

# Fit on training data only
X_train_encoded = encoder.fit_transform(X_train, y_train)
X_test_encoded = encoder.transform(X_test)

print("Training Data - Encoded:")
print(X_train_encoded.head())
print("\nTest Data - Encoded:")
print(X_test_encoded.head())
```

## Preventing Overfitting: Cross-Validation Approach

The most critical aspect of target encoding is preventing data leakage.

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import KFold

def target_encode_cv(df, categorical_col, target_col, n_folds=5):
    """
    Target encoding with cross-validation to prevent overfitting
    """
    kf = KFold(n_splits=n_folds, shuffle=True, random_state=42)
    encoded_values = np.zeros(len(df))

    for train_idx, val_idx in kf.split(df):
        # Calculate mean on training fold
        target_mean = df.iloc[train_idx].groupby(categorical_col)[target_col].mean()

        # Apply to validation fold
        encoded_values[val_idx] = df.iloc[val_idx][categorical_col].map(target_mean)

        # Handle unseen categories with global mean
        global_mean = df.iloc[train_idx][target_col].mean()
        encoded_values[val_idx] = np.where(
            pd.isna(encoded_values[val_idx]),
            global_mean,
            encoded_values[val_idx]
        )

    return encoded_values

# Example usage
df = pd.DataFrame({
    'city': ['NYC', 'LA', 'Chicago', 'NYC', 'LA', 'Chicago'] * 20,
    'churned': [1, 0, 1, 0, 0, 1] * 20
})

df['city_encoded_cv'] = target_encode_cv(df, 'city', 'churned', n_folds=5)

print("Target Encoding with Cross-Validation:")
print(df.head(10))
print("\nThis prevents using the same row's target value in encoding")
```

## Real-World Example: High-Cardinality Encoding

Perfect for features with hundreds or thousands of categories.

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Simulate customer data with high-cardinality city column
np.random.seed(42)
cities = [f'City_{i}' for i in range(100)]  # 100 different cities

df = pd.DataFrame({
    'city': np.random.choice(cities, 1000),
    'age': np.random.randint(18, 70, 1000),
    'income': np.random.randint(20000, 150000, 1000)
})

# Create target: higher churn in certain cities
city_churn_prob = {city: np.random.uniform(0.1, 0.9) for city in cities}
df['churned'] = df['city'].map(city_churn_prob).apply(lambda x: np.random.binomial(1, x))

print(f"Dataset shape: {df.shape}")
print(f"Number of unique cities: {df['city'].nunique()}")
print(f"Churn rate: {df['churned'].mean():.2%}")
print("\n" + "="*60 + "\n")

# Split data
X = df.drop('churned', axis=1)
y = df['churned']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Target encoding
city_target_mean = X_train.join(y_train).groupby('city')['churned'].mean()
global_mean = y_train.mean()

X_train_encoded = X_train.copy()
X_test_encoded = X_test.copy()

X_train_encoded['city_encoded'] = X_train_encoded['city'].map(city_target_mean)
X_test_encoded['city_encoded'] = X_test_encoded['city'].map(city_target_mean).fillna(global_mean)

# Drop original city column
X_train_encoded = X_train_encoded.drop('city', axis=1)
X_test_encoded = X_test_encoded.drop('city', axis=1)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train_encoded, y_train)

# Evaluate
predictions = model.predict(X_test_encoded)
accuracy = accuracy_score(y_test, predictions)

print(f"Model Accuracy: {accuracy:.2%}")
print(f"\nFeatures used: {list(X_train_encoded.columns)}")
print(f"Feature shape: {X_train_encoded.shape}")

print("\nCompare with One-Hot Encoding:")
print(f"One-Hot would create {df['city'].nunique()} columns!")
print(f"Target Encoding uses only 1 column")
```

## Smoothing Technique

Smoothing helps with rare categories by blending category mean with global mean.

```python
import pandas as pd
import numpy as np

def target_encode_with_smoothing(df, cat_col, target_col, alpha=10):
    """
    Target encoding with smoothing
    alpha: higher values = more smoothing (more conservative)
    """
    # Calculate statistics
    global_mean = df[target_col].mean()
    category_stats = df.groupby(cat_col)[target_col].agg(['mean', 'count'])

    # Apply smoothing formula
    # smoothed_mean = (count * category_mean + alpha * global_mean) / (count + alpha)
    category_stats['smoothed_mean'] = (
        (category_stats['count'] * category_stats['mean'] + alpha * global_mean) /
        (category_stats['count'] + alpha)
    )

    # Map smoothed values
    encoding_map = category_stats['smoothed_mean'].to_dict()

    return df[cat_col].map(encoding_map)

# Example
df = pd.DataFrame({
    'city': ['NYC'] * 100 + ['SmallTown'] * 2 + ['LA'] * 50,
    'churned': [1, 0] * 50 + [1, 1] + [0] * 50
})

df['city_smoothed'] = target_encode_with_smoothing(df, 'city', 'churned', alpha=10)

print("Effect of Smoothing on Rare Categories:")
print(df.groupby('city').agg({
    'churned': ['mean', 'count'],
    'city_smoothed': 'first'
}))
```

## When to Use Target Encoding

### Perfect For

- **High cardinality** (> 10 unique values)
- **Tree-based models** (Random Forest, XGBoost, LightGBM)
- **Large datasets**
- **Supervised learning** problems

### Examples

```python
high_cardinality_examples = {
    'ZIP Codes': '40,000+ unique values',
    'City Names': 'Thousands of cities',
    'Product SKUs': 'Tens of thousands of products',
    'User IDs': 'Millions of users',
    'IP Addresses': 'Billions of addresses'
}

print("Target Encoding is Perfect For:")
print("="*60)
for feature, description in high_cardinality_examples.items():
    print(f"{feature:20s}: {description}")
    print(f"  → One-hot would be impossible")
    print(f"  → Target encoding creates 1 column\n")
```

## Advantages

```
✅ Handles high cardinality effectively
✅ Captures relationship with target
✅ Single column output (memory efficient)
✅ Often significantly improves model performance
✅ Works with any number of categories
✅ Reduces dimensionality
```

## Disadvantages

```
❌ High risk of overfitting (data leakage)
❌ Requires target variable (supervised only)
❌ Needs careful cross-validation
❌ Cannot directly handle unseen categories
❌ Can be unstable for rare categories
❌ More complex to implement correctly
```

## Common Pitfalls

### Pitfall 1: Data Leakage

```python
# WRONG: Fitting on entire dataset
from category_encoders import TargetEncoder

# Don't do this!
encoder = TargetEncoder()
df['city_encoded'] = encoder.fit_transform(df['city'], df['target'])  # LEAKAGE!

# CORRECT: Split first, then encode
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

encoder = TargetEncoder()
X_train_encoded = encoder.fit_transform(X_train, y_train)  # Fit on train
X_test_encoded = encoder.transform(X_test)  # Transform test
```

### Pitfall 2: Not Handling Rare Categories

```python
# Categories with few samples can have unreliable means
# Use smoothing to address this

from category_encoders import TargetEncoder

# With smoothing
encoder = TargetEncoder(
    smoothing=1.0,      # Blend with global mean
    min_samples_leaf=10  # Minimum samples for category
)
```

## Best Practices

### Use Cross-Validation

```python
from sklearn.model_selection import cross_val_score
from category_encoders import TargetEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline

# Pipeline ensures proper encoding in CV
pipeline = Pipeline([
    ('encoder', TargetEncoder(cols=['city'])),
    ('classifier', RandomForestClassifier())
])

scores = cross_val_score(pipeline, X_train, y_train, cv=5)
print(f"Mean CV Score: {scores.mean():.4f}")
```

### Handle Unknown Categories

```python
# For new categories in test set, use global mean
global_mean = y_train.mean()

X_test_encoded['city_encoded'] = (
    X_test['city']
    .map(city_target_mean)
    .fillna(global_mean)  # Fill unknowns with global mean
)
```

## Summary

Target encoding is incredibly powerful for high-cardinality features but requires careful implementation to avoid overfitting. It's the go-to technique when one-hot encoding creates too many columns.

**Key Takeaways:**
- Perfect for high cardinality features
- Always split data before encoding
- Use cross-validation to prevent leakage
- Apply smoothing for rare categories
- Handle unknown categories with global mean
- Works best with tree-based models

---

**Navigation:**
- **Previous:** [← Ordinal Encoding](./encoding-ordinal.md)
- **Next:** [Binary Encoding →](./encoding-binary.md)
- **Related:** [Encoding Comparison](./encoding-comparison.md)
