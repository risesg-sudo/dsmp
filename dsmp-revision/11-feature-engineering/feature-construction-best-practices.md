# Feature Construction: Best Practices and Interview Guide

## What You'll Learn

Master the strategic decisions behind feature construction. You'll learn how to choose the right technique, avoid common pitfalls, and answer challenging interview questions with confidence.

## Technique Comparison

```python
import pandas as pd

comparison = pd.DataFrame({
    'Technique': [
        'Polynomial Features',
        'Interactions',
        'Domain-Specific',
        'Temporal Features',
        'Aggregations',
        'Feature Crosses'
    ],
    'Complexity': [
        'Medium',
        'Low',
        'High',
        'Medium',
        'Medium',
        'Low'
    ],
    'Data Requirement': [
        'Medium',
        'Medium',
        'Domain Knowledge',
        'Time Series',
        'Grouped Data',
        'Categorical'
    ],
    'Interpretability': [
        'Low',
        'Medium',
        'High',
        'High',
        'High',
        'Medium'
    ],
    'When to Use': [
        'Non-linear relationships',
        'Combined effects',
        'Business logic',
        'Time-dependent data',
        'Customer/group analysis',
        'Categorical combinations'
    ]
})

print("="*100)
print("FEATURE CONSTRUCTION TECHNIQUES COMPARISON")
print("="*100)
print(comparison.to_string(index=False))
```

## Common Mistakes

### Mistake 1: Creating Too Many Features

```python
# WRONG: Creating every possible polynomial/interaction
from sklearn.preprocessing import PolynomialFeatures

# 10 features with degree 5 creates 2,002 features!
poly = PolynomialFeatures(degree=5)
# This leads to:
# - Overfitting
# - Slow training
# - Curse of dimensionality

# CORRECT: Start with degree 2
poly = PolynomialFeatures(degree=2)
# Only add higher degrees if beneficial
```

### Mistake 2: Data Leakage in Aggregations

```python
# WRONG: Creating features using entire dataset
df['customer_avg_purchase'] = df.groupby('customer_id')['amount'].transform('mean')
train, test = split(df)
# Test set information leaked into training!

# CORRECT: Create features on training data only
train, test = split(df)
customer_avg = train.groupby('customer_id')['amount'].mean()
train['customer_avg_purchase'] = train['customer_id'].map(customer_avg)
test['customer_avg_purchase'] = test['customer_id'].map(customer_avg)
```

### Mistake 3: Not Handling Missing Crosses

```python
# When creating crosses, new combinations in test might not exist in train
# WRONG: Direct mapping
train_crosses = train['city'] + '_' + train['age_group']

# CORRECT: Handle unknown combinations
from sklearn.preprocessing import OneHotEncoder
encoder = OneHotEncoder(handle_unknown='ignore')
```

### Mistake 4: Ignoring Domain Knowledge

```python
# WRONG: Using only automated feature generation
poly = PolynomialFeatures(degree=2)
features = poly.fit_transform(data)
# Misses meaningful business metrics

# CORRECT: Combine automated + domain-specific
# Automated
poly_features = poly.fit_transform(data)

# Domain-specific
data['debt_to_income'] = data['debt'] / data['income']
data['bmi'] = data['weight'] / (data['height'] ** 2)
```

## Best Practices

### Practice 1: Feature Selection After Construction

```python
from sklearn.feature_selection import SelectKBest, f_classif

# After creating many features, select best ones
selector = SelectKBest(f_classif, k=10)
X_selected = selector.fit_transform(X, y)

# Or use model-based selection
from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier()
model.fit(X, y)

# Keep top features
importances = model.feature_importances_
top_features = X.columns[importances.argsort()[-10:]]
```

### Practice 2: Validate Feature Importance

```python
# Check if constructed features actually help
from sklearn.model_selection import cross_val_score

# Without new features
score_before = cross_val_score(model, X_original, y, cv=5).mean()

# With new features
score_after = cross_val_score(model, X_with_features, y, cv=5).mean()

if score_after > score_before:
    print("Features improved model")
else:
    print("Features didn't help, remove them")
```

### Practice 3: Document Feature Engineering

```python
feature_engineering_log = {
    'polynomial_features': {
        'created': ['age²', 'age×income', 'income²'],
        'reason': 'Capture non-linear age-income relationship',
        'improvement': '+5% accuracy'
    },
    'domain_specific': {
        'created': ['debt_to_income', 'credit_utilization'],
        'reason': 'Standard financial risk metrics',
        'improvement': '+8% accuracy'
    }
}
```

## Interview Questions

### Q1: What are polynomial features and when should you use them?

**Answer:**

Polynomial features extend linear models to capture non-linear relationships.

Example:
```python
Original: [x]
Degree 2: [x, x²]
Degree 3: [x, x², x³]

Linear model: y = β₀ + β₁x
With polynomial: y = β₀ + β₁x + β₂x²

Now can fit curves, not just lines!
```

When to use:
1. Non-linear relationships exist
2. Using linear models (regression, logistic)
3. Small number of features (less than 10)
4. Enough data to avoid overfitting

Don't use when:
- Tree-based models (they handle non-linearity)
- Too many features (combinatorial explosion)
- Limited data (overfitting risk)

### Q2: What are interaction features and why are they important?

**Answer:**

Interaction features capture combined effects of multiple features.

Example:
```
Study Hours  Sleep Hours  Score
     10          8         95   ← High both
     10          4         75   ← High study, low sleep
      5          8         70   ← Low study, high sleep

Interaction = study_hours × sleep_hours

The effect of studying depends on sleep!
Linear model alone can't capture this.
```

Why important:
1. Combined effects: Features interact in real world
2. Model performance: Often significant improvement
3. Interpretability: Reveals synergies

Examples:
- Marketing: ad_spend × email_frequency
- Healthcare: bmi × age
- Finance: income × credit_score

### Q3: How do you prevent data leakage when creating aggregate features?

**Answer:**

Data leakage occurs when test information influences training.

Wrong approach:
```python
# Calculate on ENTIRE dataset
df['customer_avg'] = df.groupby('customer_id')['amount'].transform('mean')
train, test = split(df)  # Leak! Used test data to create features
```

Correct approach:
```python
# Split FIRST
train, test = split(df)

# Calculate ONLY on training data
customer_avg = train.groupby('customer_id')['amount'].mean()

# Apply to both
train['customer_avg'] = train['customer_id'].map(customer_avg)
test['customer_avg'] = test['customer_id'].map(customer_avg)
# Test uses only training statistics
```

For time series:
```python
# Use only past data for each prediction
df['rolling_mean'] = df['sales'].shift(1).rolling(7).mean()
# shift(1) ensures we don't use current value
```

### Q4: What are feature crosses and when are they useful?

**Answer:**

Feature crosses combine categorical features to capture joint effects.

Example:
```python
city = 'NYC'
time = 'Evening'

city_x_time = 'NYC_Evening'

This captures unique behavior:
- NYC in evening (different from NYC morning)
- NYC in evening (different from LA evening)
```

When useful:
1. Categorical interactions matter
2. Recommendation systems
3. Ad click prediction
4. Customer segmentation

Real example:
```python
Ad Campaign:
device × time_of_day = 'Mobile_Evening'

Mobile users in evening behave differently:
- More likely to click ads
- Different from desktop users
- Different from mobile in morning
```

Trade-off:
- Pros: Captures specific patterns
- Cons: Creates many categories (sparse data)

### Q5: What's the difference between polynomial features and interaction features?

**Answer:**

Polynomial features include:
- Original features
- Squared terms (x²)
- Interaction terms (x₁ × x₂)

Interaction features include:
- Only interaction terms (x₁ × x₂)
- No squared terms

Example:
```python
from sklearn.preprocessing import PolynomialFeatures

# Polynomial features (degree=2)
poly = PolynomialFeatures(degree=2, include_bias=False)
[x1, x2] → [x1, x2, x1², x1×x2, x2²]
          Includes squares ^^^

# Interaction only
poly = PolynomialFeatures(degree=2, include_bias=False, interaction_only=True)
[x1, x2] → [x1, x2, x1×x2]
          No squares!
```

When to use each:
- Polynomial: Non-linear individual effects + interactions
- Interaction only: Combined effects matter, not non-linearity

## Quick Reference

```
Polynomial Features:
  PolynomialFeatures(degree=2)
  Creates: x, x², x₁x₂
  Use: Non-linear relationships

Interaction Features:
  x₁ × x₂ (manual or interaction_only=True)
  Use: Combined effects

Domain-Specific:
  BMI = weight / height²
  Debt-to-income = debt / income
  Use: Business logic

Temporal Features:
  day_of_week, month, is_weekend
  Use: Time-dependent patterns

Aggregations:
  groupby().agg(['mean', 'sum', 'count'])
  Use: Customer/group analysis

Feature Crosses:
  'NYC' + '_' + 'Evening' = 'NYC_Evening'
  Use: Categorical combinations
```

## Decision Framework

```
What type of relationship?
│
├─ Non-linear → Polynomial Features
├─ Combined effects → Interactions
├─ Business metric → Domain-Specific
├─ Time patterns → Temporal Features
├─ Customer behavior → Aggregations
└─ Category combos → Feature Crosses
```

---

**Related Topics:**
- [Polynomial Features](./polynomial-features.md)
- [Interaction Features](./interaction-features.md)
- [Domain-Specific Features](./domain-specific-features.md)
- [Temporal Features](./temporal-features.md)
- [Aggregation Features](./aggregation-features.md)
- [Feature Crosses](./feature-crosses.md)

**Navigate:** [Feature Engineering Home](./README.md)
