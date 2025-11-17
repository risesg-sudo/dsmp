# Ordinal Encoding - Complete Guide

## What You'll Learn

When your categorical variables have a natural order or hierarchy, ordinal encoding preserves this relationship by assigning integer values. Learn how to implement it correctly and avoid misusing it on nominal data.

## The Concept

Ordinal encoding assigns integer values to categories based on their natural order or rank. Unlike one-hot encoding, it creates a single column with numerical values that reflect the hierarchy.

### Visual Example

```
Education Level:
┌─────────────────┬──────────┬──────────┐
│ Original        │ Ordered  │ Encoded  │
├─────────────────┼──────────┼──────────┤
│ High School     │    1st   │    0     │
│ Bachelor        │    2nd   │    1     │
│ Master          │    3rd   │    2     │
│ PhD             │    4th   │    3     │
└─────────────────┴──────────┴──────────┘

Rating Scale:
Poor (0) → Fair (1) → Good (2) → Excellent (3)
```

## Python Implementation

### Method 1: Manual Mapping

The most explicit and controllable approach.

```python
import pandas as pd

# Sample data
df = pd.DataFrame({
    'customer': ['A', 'B', 'C', 'D', 'E'],
    'education': ['Bachelor', 'PhD', 'High School', 'Master', 'Bachelor'],
    'satisfaction': ['Good', 'Excellent', 'Poor', 'Fair', 'Good']
})

print("Original Data:")
print(df)
print("\n" + "="*50 + "\n")

# Define ordinal mappings
education_mapping = {
    'High School': 0,
    'Bachelor': 1,
    'Master': 2,
    'PhD': 3
}

satisfaction_mapping = {
    'Poor': 0,
    'Fair': 1,
    'Good': 2,
    'Excellent': 3
}

# Apply mappings
df['education_encoded'] = df['education'].map(education_mapping)
df['satisfaction_encoded'] = df['satisfaction'].map(satisfaction_mapping)

print("After Ordinal Encoding:")
print(df)
```

### Method 2: Scikit-learn OrdinalEncoder

Better for production pipelines and handling unknown categories.

```python
from sklearn.preprocessing import OrdinalEncoder
import pandas as pd
import numpy as np

# Sample data
df = pd.DataFrame({
    'size': ['Small', 'Large', 'Medium', 'Small', 'Large'],
    'priority': ['Low', 'High', 'Medium', 'Low', 'High']
})

print("Original Data:")
print(df)
print("\n" + "="*50 + "\n")

# Define categories in order
encoder = OrdinalEncoder(
    categories=[
        ['Small', 'Medium', 'Large'],      # size order
        ['Low', 'Medium', 'High']          # priority order
    ]
)

# Fit and transform
df_encoded = df.copy()
df_encoded[['size', 'priority']] = encoder.fit_transform(df[['size', 'priority']])

print("After Ordinal Encoding:")
print(df_encoded)
print("\nMapping:")
print(f"Size: {dict(zip(['Small', 'Medium', 'Large'], [0, 1, 2]))}")
print(f"Priority: {dict(zip(['Low', 'Medium', 'High'], [0, 1, 2]))}")
```

## Real-World Example: Credit Risk Assessment

```python
import pandas as pd
from sklearn.preprocessing import OrdinalEncoder
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split

# Credit application data
df = pd.DataFrame({
    'education': ['High School', 'Bachelor', 'Master', 'Bachelor', 'PhD'] * 20,
    'income_level': ['Low', 'Medium', 'High', 'Medium', 'High'] * 20,
    'credit_rating': ['Poor', 'Fair', 'Good', 'Fair', 'Excellent'] * 20,
    'loan_approved': [0, 1, 1, 1, 1] * 20
})

print("Credit Application Data Sample:")
print(df.head())
print(f"\nDataset shape: {df.shape}")
print("\n" + "="*50 + "\n")

# Define ordinal categories
ordinal_features = {
    'education': ['High School', 'Bachelor', 'Master', 'PhD'],
    'income_level': ['Low', 'Medium', 'High'],
    'credit_rating': ['Poor', 'Fair', 'Good', 'Excellent']
}

# Create encoder
encoder = OrdinalEncoder(
    categories=[ordinal_features[col] for col in ['education', 'income_level', 'credit_rating']]
)

# Encode
X = df[['education', 'income_level', 'credit_rating']]
y = df['loan_approved']

X_encoded = encoder.fit_transform(X)
X_encoded_df = pd.DataFrame(X_encoded, columns=X.columns)

print("Encoded Features:")
print(X_encoded_df.head())
print(f"\nShape: {X_encoded_df.shape}")
```

## Handling Unknown Categories

```python
from sklearn.preprocessing import OrdinalEncoder
import pandas as pd
import numpy as np

# Training data
train_data = pd.DataFrame({
    'size': ['Small', 'Medium', 'Large']
})

# Test data with unknown category
test_data = pd.DataFrame({
    'size': ['Small', 'XL']  # XL is unknown!
})

# Option 1: Encode unknown as NaN
encoder_nan = OrdinalEncoder(
    categories=[['Small', 'Medium', 'Large']],
    handle_unknown='use_encoded_value',
    unknown_value=np.nan
)

encoder_nan.fit(train_data)
result = encoder_nan.transform(test_data)
print("Unknown as NaN:")
print(result)

# Option 2: Encode unknown as specific value
encoder_value = OrdinalEncoder(
    categories=[['Small', 'Medium', 'Large']],
    handle_unknown='use_encoded_value',
    unknown_value=-1  # Use -1 for unknown
)

encoder_value.fit(train_data)
result = encoder_value.transform(test_data)
print("\nUnknown as -1:")
print(result)
```

## Common Ordinal Variables

### Education Level

```python
education_levels = [
    'No Formal Education',
    'High School',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'Doctorate'
]

education_mapping = {level: i for i, level in enumerate(education_levels)}
print("Education Mapping:")
for level, code in education_mapping.items():
    print(f"  {code}: {level}")
```

### Customer Satisfaction

```python
satisfaction_levels = [
    'Very Dissatisfied',
    'Dissatisfied',
    'Neutral',
    'Satisfied',
    'Very Satisfied'
]

satisfaction_mapping = {level: i for i, level in enumerate(satisfaction_levels)}
print("\nSatisfaction Mapping:")
for level, code in satisfaction_mapping.items():
    print(f"  {code}: {level}")
```

### Product Quality

```python
quality_levels = ['Defective', 'Poor', 'Fair', 'Good', 'Excellent', 'Premium']

quality_mapping = {level: i for i, level in enumerate(quality_levels)}
print("\nQuality Mapping:")
for level, code in quality_mapping.items():
    print(f"  {code}: {level}")
```

## Advantages

```
✅ Preserves ordinal relationship
✅ Compact representation (single column)
✅ Works excellently with tree-based models
✅ Memory efficient
✅ Intuitive for hierarchical data
✅ No dimensionality explosion
```

## Disadvantages

```
❌ Assumes equal intervals between categories
❌ Can mislead linear models (implies distance)
❌ Requires domain knowledge for correct ordering
❌ Wrong ordering can harm model performance
❌ Not suitable for nominal variables
```

## When to Use

### Perfect For

- **Ordinal variables** with clear hierarchy
- **Tree-based models** (Random Forest, XGBoost, LightGBM)
- **Any cardinality** (works with 2 to 100+ categories)
- **Memory-constrained** environments

### Examples

```python
use_cases = {
    'Education': 'Clear progression from high school to PhD',
    'T-shirt Size': 'XS < S < M < L < XL < XXL',
    'Priority Level': 'Low < Medium < High < Critical',
    'Income Bracket': '0-25k < 25-50k < 50-100k < 100k+',
    'Credit Score Range': 'Poor < Fair < Good < Very Good < Excellent'
}

print("Ordinal Encoding Use Cases:")
print("="*60)
for feature, reason in use_cases.items():
    print(f"\n{feature}:")
    print(f"  {reason}")
```

## Common Pitfalls

### Pitfall 1: Using on Nominal Variables

```python
# WRONG: Using ordinal encoding on nominal data
colors = pd.DataFrame({
    'color': ['Red', 'Blue', 'Green', 'Red']
})

# Don't do this! Creates artificial ordering
# Red=0, Blue=1, Green=2 implies Blue is "between" Red and Green
wrong_encoder = OrdinalEncoder()
wrong_result = wrong_encoder.fit_transform(colors)

print("WRONG: Ordinal on nominal")
print(wrong_result)
print("Problem: Implies Red < Blue < Green (meaningless!)")

# CORRECT: Use one-hot encoding for nominal
correct_result = pd.get_dummies(colors)
print("\nCORRECT: One-hot on nominal")
print(correct_result)
```

### Pitfall 2: Incorrect Ordering

```python
# WRONG: Incorrect order
wrong_order = ['Large', 'Small', 'Medium']  # Wrong sequence!

# CORRECT: Logical order
correct_order = ['Small', 'Medium', 'Large']

print("Always verify your ordering matches reality!")
```

## Best Practices

### Document Your Mappings

```python
import pandas as pd

# Create a mapping documentation
mapping_doc = pd.DataFrame({
    'Variable': ['education', 'education', 'education', 'education'],
    'Category': ['High School', 'Bachelor', 'Master', 'PhD'],
    'Encoded_Value': [0, 1, 2, 3],
    'Rationale': ['Lowest level', 'Undergraduate', 'Graduate', 'Highest level']
})

print("Encoding Documentation:")
print(mapping_doc.to_string(index=False))

# Save for future reference
# mapping_doc.to_csv('ordinal_mappings.csv', index=False)
```

### Use with Tree-Based Models

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

# Ordinal encoding works great with tree-based models
X_encoded = ordinal_encoder.fit_transform(X)

model = RandomForestClassifier(n_estimators=100)
scores = cross_val_score(model, X_encoded, y, cv=5)

print(f"Tree-based model with ordinal encoding:")
print(f"Mean CV Score: {scores.mean():.4f}")
```

## Summary

Ordinal encoding is essential for variables with natural ordering. It's compact, efficient, and works exceptionally well with tree-based algorithms.

**Key Takeaways:**
- Only use for variables with clear order
- Define the correct sequence
- Works best with tree-based models
- Document your mappings
- Handle unknown categories appropriately

---

**Navigation:**
- **Previous:** [← One-Hot Encoding](./encoding-onehot.md)
- **Next:** [Target Encoding →](./encoding-target.md)
- **Related:** [Encoding Overview](./encoding-overview.md)
