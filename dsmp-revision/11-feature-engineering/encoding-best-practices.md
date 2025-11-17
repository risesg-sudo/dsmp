# Encoding Best Practices and Interview Guide

## What You'll Learn

Mastering categorical encoding goes beyond knowing the techniques. Learn common mistakes to avoid, best practices to follow, and how to ace encoding-related interview questions.

## Common Mistakes

### Mistake 1: Data Leakage in Target Encoding

The most critical mistake when using target encoding.

```python
# WRONG: Fitting on entire dataset
import pandas as pd
from category_encoders import TargetEncoder

df = pd.DataFrame({
    'city': ['NYC', 'LA', 'NYC', 'LA'] * 25,
    'target': [1, 0, 1, 0] * 25
})

# DON'T DO THIS - Data leakage!
encoder = TargetEncoder()
df['city_encoded'] = encoder.fit_transform(df['city'], df['target'])  # WRONG!

print("Problem: Test information leaked into training!")
print("This will overestimate model performance.")

# CORRECT: Split first, then fit on train only
from sklearn.model_selection import train_test_split

X = df[['city']]
y = df['target']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

encoder = TargetEncoder()
X_train_encoded = encoder.fit_transform(X_train, y_train)  # Fit on train
X_test_encoded = encoder.transform(X_test)  # Transform test

print("\nCorrect: Encoder only sees training data!")
```

### Mistake 2: One-Hot Encoding High Cardinality

Creates dimensionality explosion.

```python
# WRONG: One-hot encoding 1000 cities
import pandas as pd

df = pd.DataFrame({
    'city': [f'City_{i}' for i in range(1000)] * 10
})

# This creates 1000 columns! Memory explosion!
df_encoded = pd.get_dummies(df, columns=['city'])  # DON'T DO THIS

print(f"Created {df_encoded.shape[1]} columns!")
print("Problems:")
print("  - Excessive memory usage")
print("  - Slow training")
print("  - Curse of dimensionality")
print("  - Overfitting risk")

# CORRECT: Use target or frequency encoding for high cardinality
from category_encoders import TargetEncoder

print("\nBetter approach: Target encoding creates just 1 column!")
```

### Mistake 3: Not Handling Unknown Categories

Failures in production when new categories appear.

```python
from sklearn.preprocessing import OneHotEncoder
import pandas as pd

train_data = pd.DataFrame({'city': ['NYC', 'LA', 'Chicago']})
test_data = pd.DataFrame({'city': ['NYC', 'Houston']})  # Houston is new!

# WRONG: Default behavior raises error
encoder = OneHotEncoder()
encoder.fit(train_data)

try:
    encoded = encoder.transform(test_data)
except ValueError as e:
    print(f"Error: Found unknown categories ['Houston'] during transform")

# CORRECT: Use handle_unknown parameter
encoder = OneHotEncoder(handle_unknown='ignore')
encoder.fit(train_data)
encoded = encoder.transform(test_data)  # Works! Houston gets all zeros

print("\nCorrect: Unknown categories handled gracefully")
```

### Mistake 4: Treating Ordinal as Nominal

Loses valuable ordering information.

```python
# WRONG: One-hot encoding ordinal variable
import pandas as pd

education = pd.DataFrame({
    'education': ['High School', 'Bachelor', 'Master', 'PhD'] * 5
})

# This loses the ordering information!
education_encoded = pd.get_dummies(education)  # WRONG for ordinal!

print("Wrong: Creates 4 separate columns, loses order")
print(f"Columns: {list(education_encoded.columns)}")

# CORRECT: Use ordinal encoding
from sklearn.preprocessing import OrdinalEncoder

encoder = OrdinalEncoder(
    categories=[['High School', 'Bachelor', 'Master', 'PhD']]
)
education_encoded = encoder.fit_transform(education)  # Preserves order

print("\nCorrect: Single column [0, 1, 2, 3] preserves hierarchy")
```

### Mistake 5: Not Normalizing Frequency Encoding

Creates scale problems.

```python
# WRONG: Using raw counts without normalization
import pandas as pd

df = pd.DataFrame({
    'city': ['NYC'] * 10000 + ['SmallTown'] * 10
})

freq_map = df['city'].value_counts().to_dict()
df['city_encoded'] = df['city'].map(freq_map)

print("Wrong: Raw counts")
print(df.groupby('city')['city_encoded'].first())
print("Problem: NYC=10000, SmallTown=10 → huge scale difference!")

# CORRECT: Normalize frequencies
freq_map_norm = (df['city'].value_counts() / len(df)).to_dict()
df['city_encoded_norm'] = df['city'].map(freq_map_norm)

print("\nCorrect: Normalized (0-1)")
print(df.groupby('city')['city_encoded_norm'].first())
print("Better: Values between 0 and 1")
```

## Best Practices

### Practice 1: Always Use Pipelines

Prevents data leakage and ensures reproducibility.

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier

# Define transformations
categorical_features = ['city', 'product']
numerical_features = ['age', 'income']

preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
        ('num', StandardScaler(), numerical_features)
    ])

# Create pipeline
pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier())
])

# Fit pipeline (no data leakage!)
pipeline.fit(X_train, y_train)
predictions = pipeline.predict(X_test)

print("Pipeline ensures:")
print("  ✓ No data leakage")
print("  ✓ Reproducible preprocessing")
print("  ✓ Easy deployment")
```

### Practice 2: Cross-Validation for Target Encoding

Prevents overfitting.

```python
from sklearn.model_selection import cross_val_score
from category_encoders import TargetEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline

# Use cross-validation with pipeline
pipeline = Pipeline([
    ('encoder', TargetEncoder(cols=['city'])),
    ('classifier', RandomForestClassifier())
])

# This prevents overfitting
scores = cross_val_score(
    pipeline,
    X_train,
    y_train,
    cv=5
)

print(f"Mean CV Score: {scores.mean():.4f}")
print(f"Std CV Score: {scores.std():.4f}")
print("Cross-validation ensures robust encoding")
```

### Practice 3: Save and Reuse Encoders

Essential for production deployment.

```python
import pickle
from sklearn.preprocessing import OneHotEncoder

# Train and save encoder
encoder = OneHotEncoder(handle_unknown='ignore')
encoder.fit(X_train[['city']])

# Save encoder
with open('city_encoder.pkl', 'wb') as f:
    pickle.dump(encoder, f)

print("Encoder saved for production use")

# Later, load and use
with open('city_encoder.pkl', 'rb') as f:
    loaded_encoder = pickle.load(f)

X_new_encoded = loaded_encoder.transform(X_new[['city']])
print("Encoder loaded and applied to new data")
```

### Practice 4: Monitor Encoding Impact

Track changes before and after encoding.

```python
import pandas as pd

# Before encoding
print("Before Encoding:")
print(f"  Shape: {X_train.shape}")
print(f"  Memory: {X_train.memory_usage().sum() / 1024**2:.2f} MB")
print(f"  Columns: {list(X_train.columns)}")

# After encoding
X_train_encoded = encoder.fit_transform(X_train)

print("\nAfter Encoding:")
print(f"  Shape: {X_train_encoded.shape}")
if hasattr(X_train_encoded, 'memory_usage'):
    print(f"  Memory: {X_train_encoded.memory_usage().sum() / 1024**2:.2f} MB")
print(f"  Columns added: {X_train_encoded.shape[1] - X_train.shape[1]}")
```

### Practice 5: Document Encoding Decisions

Keep a record of why you chose each method.

```python
import pandas as pd

# Create documentation
encoding_log = {
    'gender': {
        'method': 'One-Hot',
        'reason': 'Binary nominal variable',
        'cardinality': 2,
        'columns_created': 2
    },
    'city': {
        'method': 'Target Encoding',
        'reason': 'High cardinality (100+ cities)',
        'cardinality': 125,
        'columns_created': 1
    },
    'education': {
        'method': 'Ordinal',
        'reason': 'Clear hierarchical order',
        'cardinality': 4,
        'columns_created': 1
    }
}

log_df = pd.DataFrame(encoding_log).T
print("ENCODING DOCUMENTATION")
print("="*70)
print(log_df)

# Save documentation
# log_df.to_csv('encoding_decisions.csv')
```

## Interview Questions

### Q1: What is the difference between One-Hot and Ordinal Encoding?

**Answer:**

**One-Hot Encoding:**
- Creates binary columns for each category
- Used for nominal (unordered) categories
- Example: Colors (Red, Blue, Green) → 3 binary columns
- No ordinal relationship implied
- Can cause dimensionality issues with high cardinality

**Ordinal Encoding:**
- Assigns integer values based on order
- Used for ordinal (ordered) categories
- Example: Education (HS, Bachelor, Master, PhD) → 0, 1, 2, 3
- Preserves natural ordering
- Single column output

**When to use each:**
- Use One-Hot for nominal variables like color, city, product type
- Use Ordinal for ordered variables like education, ratings, sizes

### Q2: How do you prevent data leakage in Target Encoding?

**Answer:**

Data leakage occurs when information from the test set influences training.

**Prevention Methods:**

**1. Split data first, encode after:**
```python
# Split first
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Fit encoder only on training data
encoder = TargetEncoder()
X_train_encoded = encoder.fit_transform(X_train, y_train)
X_test_encoded = encoder.transform(X_test)  # Use training statistics
```

**2. Use cross-validation:**
```python
# Smoothing prevents overfitting on small categories
encoder = TargetEncoder(smoothing=1.0, min_samples_leaf=10)
```

**3. Apply smoothing:**
```python
# Blend category mean with global mean
# encoded = alpha * category_mean + (1-alpha) * global_mean
```

### Q3: When would you use Binary Encoding over One-Hot Encoding?

**Answer:**

Use **Binary Encoding** when:

**1. Moderate to High Cardinality** (10-100 categories)
**2. Memory constraints exist**
**3. Need to avoid curse of dimensionality**

**Comparison Example:**
```
50 categories:
- One-Hot: 50 columns
- Binary: 6 columns (log2(50) ≈ 6)
- Space saved: 88%

100 categories:
- One-Hot: 100 columns
- Binary: 7 columns (log2(100) ≈ 7)
- Space saved: 93%
```

**Trade-offs:**
- Binary is more compact but less interpretable
- Binary creates artificial bit-based relationships
- One-Hot is simpler but creates many columns

### Q4: How do you handle high-cardinality categorical features?

**Answer:**

Multiple strategies exist:

**1. Target Encoding** (for supervised learning):
```python
from category_encoders import TargetEncoder

# For 10,000+ categories (e.g., ZIP codes)
encoder = TargetEncoder(smoothing=1.0)
encoded = encoder.fit_transform(X_train['zip_code'], y_train)
```

**2. Frequency Encoding:**
```python
# Encode by popularity
freq_map = df['zip_code'].value_counts(normalize=True)
df['zip_encoded'] = df['zip_code'].map(freq_map)
```

**3. Grouping Rare Categories:**
```python
# Group infrequent categories
threshold = 0.01
freq = df['category'].value_counts(normalize=True)
rare_categories = freq[freq < threshold].index

df['category_grouped'] = df['category'].apply(
    lambda x: 'Other' if x in rare_categories else x
)
```

**4. Feature Hashing:**
```python
from sklearn.feature_extraction import FeatureHasher

hasher = FeatureHasher(n_features=10, input_type='string')
hashed = hasher.transform(df[['zip_code']])
```

### Q5: What are the advantages and disadvantages of Target Encoding?

**Answer:**

**Advantages:**
- Handles high cardinality efficiently (single column)
- Captures relationship between category and target
- Often improves model performance significantly
- Works well with tree-based models
- Memory efficient

**Disadvantages:**
- High risk of overfitting (especially with rare categories)
- Requires target variable (supervised only)
- Prone to data leakage if not done carefully
- Doesn't work for unseen categories without fallback
- Can be unstable for rare categories

**Mitigation Strategies:**
```python
# 1. Smoothing
encoder = TargetEncoder(
    smoothing=1.0,       # Blend with global mean
    min_samples_leaf=10  # Minimum samples per category
)

# 2. Cross-validation
from sklearn.model_selection import KFold

kfold = KFold(n_splits=5)
for train_idx, val_idx in kfold.split(X):
    encoder.fit(X.iloc[train_idx], y.iloc[train_idx])
    X_val_encoded = encoder.transform(X.iloc[val_idx])
```

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│              ENCODING TECHNIQUES CHEAT SHEET                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ONE-HOT ENCODING                                           │
│  • Use for: Nominal, low cardinality (<10)                  │
│  • Output: n_categories columns                             │
│  • Code: pd.get_dummies() or OneHotEncoder()                │
│                                                             │
│  ORDINAL ENCODING                                           │
│  • Use for: Ordinal variables with natural order            │
│  • Output: 1 column                                         │
│  • Code: OrdinalEncoder(categories=[ordered_list])          │
│                                                             │
│  TARGET ENCODING                                            │
│  • Use for: High cardinality (>10), supervised learning     │
│  • Output: 1 column                                         │
│  • Code: TargetEncoder(smoothing=1.0)                       │
│  • Warning: Risk of data leakage!                           │
│                                                             │
│  BINARY ENCODING                                            │
│  • Use for: Moderate cardinality (10-100)                   │
│  • Output: log2(n_categories) columns                       │
│  • Code: BinaryEncoder()                                    │
│                                                             │
│  FREQUENCY ENCODING                                         │
│  • Use for: When frequency is informative                   │
│  • Output: 1 column                                         │
│  • Code: df[col].map(df[col].value_counts())                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Key Takeaways

**Golden Rules:**
1. Choose based on cardinality and model type
2. Always split before encoding to prevent leakage
3. Use pipelines for reproducibility
4. Handle unknown categories gracefully
5. Monitor memory and dimensionality
6. Cross-validate target encoding
7. Document encoding choices

**Decision Framework:**
- Ordinal variables → Ordinal Encoding
- Nominal + Low cardinality → One-Hot
- Nominal + Medium cardinality → Binary or Target
- Nominal + High cardinality → Target or Frequency

---

**Navigation:**
- **Previous:** [← Encoding Comparison](./encoding-comparison.md)
- **Related:** [Missing Values Handling →](./missing-overview.md)
- **Back to:** [Feature Engineering Index](./README.md)
