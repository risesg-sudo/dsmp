# Feature Crosses

## What You'll Learn

Discover how combining categorical features creates powerful new dimensions for your models. You'll master feature crosses that capture unique combinations and segment-specific patterns, dramatically improving performance on categorical data.

## Understanding Feature Crosses

Feature crosses combine categorical features to capture joint effects that individual features cannot express.

```python
import pandas as pd
import numpy as np

# Customer data with categorical features
df = pd.DataFrame({
    'city': ['NYC', 'LA', 'NYC', 'Chicago', 'LA'],
    'age_group': ['Young', 'Middle', 'Senior', 'Young', 'Middle'],
    'product': ['Phone', 'Laptop', 'Tablet', 'Phone', 'Phone'],
    'purchased': [1, 1, 0, 1, 0]
})

print("Original Data:")
print(df)
print("\n" + "="*60 + "\n")

# Create feature crosses
df['city_x_age'] = df['city'] + '_' + df['age_group']
df['city_x_product'] = df['city'] + '_' + df['product']
df['age_x_product'] = df['age_group'] + '_' + df['product']
df['city_x_age_x_product'] = df['city'] + '_' + df['age_group'] + '_' + df['product']

print("With Feature Crosses:")
print(df)

print("\n" + "="*60 + "\n")
print("Interpretation:")
print("city_x_age: 'NYC_Young' captures young people in NYC")
print("  Different from 'NYC_Senior' or 'LA_Young'")
print("  Captures location-age interaction")
print("\nThree-way cross:")
print("  'NYC_Young_Phone' is very specific")
print("  Captures combined effect of all three")
```

## Real-World Example: Ad Click Prediction

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer

# Ad campaign data
np.random.seed(42)
n = 1000

df = pd.DataFrame({
    'device': np.random.choice(['Mobile', 'Desktop', 'Tablet'], n),
    'time_of_day': np.random.choice(['Morning', 'Afternoon', 'Evening', 'Night'], n),
    'ad_position': np.random.choice(['Top', 'Side', 'Bottom'], n),
    'user_type': np.random.choice(['New', 'Returning'], n)
})

# Click probability depends on feature combinations
def click_probability(row):
    base = 0.1

    # Mobile users click more in evening
    if row['device'] == 'Mobile' and row['time_of_day'] == 'Evening':
        base += 0.3

    # Top position + returning users
    if row['ad_position'] == 'Top' and row['user_type'] == 'Returning':
        base += 0.25

    # Desktop users in morning
    if row['device'] == 'Desktop' and row['time_of_day'] == 'Morning':
        base += 0.2

    return min(base, 0.9)

df['click'] = df.apply(lambda row: np.random.binomial(1, click_probability(row)), axis=1)

print("Ad Campaign Data:")
print(df.head(10))
print(f"\nClick Rate: {df['click'].mean():.2%}")

# Model 1: Without feature crosses
categorical_features = ['device', 'time_of_day', 'ad_position', 'user_type']

preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(drop='first'), categorical_features)
    ])

X = df[categorical_features]
y = df['click']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

X_train_encoded = preprocessor.fit_transform(X_train)
X_test_encoded = preprocessor.transform(X_test)

model1 = RandomForestClassifier(n_estimators=100, random_state=42)
model1.fit(X_train_encoded, y_train)
acc1 = accuracy_score(y_test, model1.predict(X_test_encoded))

# Model 2: With feature crosses
X_with_crosses = X.copy()
X_with_crosses['device_x_time'] = X_with_crosses['device'] + '_' + X_with_crosses['time_of_day']
X_with_crosses['position_x_user'] = X_with_crosses['ad_position'] + '_' + X_with_crosses['user_type']
X_with_crosses['device_x_position'] = X_with_crosses['device'] + '_' + X_with_crosses['ad_position']

X_train2, X_test2, y_train2, y_test2 = train_test_split(X_with_crosses, y, test_size=0.2, random_state=42)

categorical_features2 = X_with_crosses.columns.tolist()
preprocessor2 = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(drop='first'), categorical_features2)
    ])

X_train_encoded2 = preprocessor2.fit_transform(X_train2)
X_test_encoded2 = preprocessor2.transform(X_test2)

model2 = RandomForestClassifier(n_estimators=100, random_state=42)
model2.fit(X_train_encoded2, y_train2)
acc2 = accuracy_score(y_test2, model2.predict(X_test_encoded2))

print("\n" + "="*60 + "\n")
print("MODEL COMPARISON:")
print(f"Without Feature Crosses: {acc1:.2%}")
print(f"With Feature Crosses:    {acc2:.2%}")
print(f"Improvement:             {(acc2-acc1):.2%}")

print("\n" + "="*60 + "\n")
print("Feature Crosses Created:")
print("1. device_x_time: Captures device usage patterns")
print("2. position_x_user: Ad position effectiveness by user type")
print("3. device_x_position: Device-specific ad placement")
```

## Why Feature Crosses Work

Feature crosses create new categorical variables that represent specific combinations. These combinations often have unique behaviors that cannot be captured by individual features alone.

```
Example: E-commerce
Individual features:
  Location: NYC
  Time: Evening

Combined behavior:
  NYC_Evening: Different shopping patterns
  - More mobile traffic
  - Higher conversion rates
  - Different product preferences

This combination effect is captured by the cross!
```

## When to Use Feature Crosses

Use feature crosses when:
- Working with categorical data
- Combinations matter more than individual features
- Building recommendation systems
- Ad click prediction
- Customer segmentation

Be cautious with:
- High cardinality features (creates too many combinations)
- Limited data (sparse feature space)
- Three-way or higher crosses (usually not worth the complexity)

## Quick Reference

```
Create feature cross:
  df['city_x_age'] = df['city'] + '_' + df['age_group']

Multiple crosses:
  df['A_x_B'] = df['A'] + '_' + df['B']
  df['A_x_C'] = df['A'] + '_' + df['C']
  df['B_x_C'] = df['B'] + '_' + df['C']

After creating crosses, use one-hot encoding:
  encoder = OneHotEncoder(handle_unknown='ignore')
  encoded = encoder.fit_transform(df[cross_features])

Trade-off:
  Pros: Captures specific patterns
  Cons: Can create many features (sparsity)
```

---

**Related Topics:**
- [Interaction Features](./interaction-features.md) - Numerical feature interactions
- [Best Practices](./feature-construction-best-practices.md) - Managing feature explosion

**Navigate:** [Feature Engineering Home](./README.md)
