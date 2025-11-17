# Interaction Features

## What You'll Learn

Uncover how features combine to create effects greater than the sum of their parts. You'll master creating interaction terms that capture the synergistic relationships between variables, transforming your model's ability to understand complex patterns.

## Understanding Interactions

Capture the combined effect of two or more features when their impact depends on each other.

```
Interaction Example:
══════════════════════

Study Hours  Test Score
     5    →     70
    10    →     85

Study Hours  Sleep Hours  Test Score
     5          4    →       60
     5          8    →       80  ← Interaction!
    10          4    →       75
    10          8    →       95

The effect of study hours depends on sleep hours!
This is an INTERACTION effect.

Feature: study_hours × sleep_hours
```

## Manual Interaction Creation

```python
import pandas as pd
import numpy as np

# Student performance data
df = pd.DataFrame({
    'study_hours': [5, 5, 10, 10, 8, 8],
    'sleep_hours': [4, 8, 4, 8, 6, 7],
    'previous_score': [70, 75, 72, 78, 74, 76]
})

print("Original Features:")
print(df)
print("\n" + "="*60 + "\n")

# Create interaction terms
df['study_x_sleep'] = df['study_hours'] * df['sleep_hours']
df['study_x_previous'] = df['study_hours'] * df['previous_score']
df['sleep_x_previous'] = df['sleep_hours'] * df['previous_score']

# Three-way interaction
df['study_x_sleep_x_previous'] = df['study_hours'] * df['sleep_hours'] * df['previous_score']

print("With Interaction Features:")
print(df)

print("\n" + "="*60 + "\n")
print("Interpretation:")
print("study_x_sleep: Combined effect of studying and sleep")
print("  High value = lots of study AND lots of sleep")
print("  Low value = either is low")
```

## Real-World Example: Marketing Campaign

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

# Marketing campaign data
np.random.seed(42)
n = 1000

ad_spend = np.random.uniform(100, 10000, n)
email_frequency = np.random.randint(1, 20, n)
website_visits = np.random.randint(0, 50, n)

# Conversion depends on interactions
conversion_prob = 1 / (1 + np.exp(-(
    -3 +
    0.0002 * ad_spend +
    0.05 * email_frequency +
    0.03 * website_visits +
    0.000005 * ad_spend * email_frequency +  # Interaction!
    0.002 * email_frequency * website_visits  # Interaction!
)))

converted = (np.random.random(n) < conversion_prob).astype(int)

df = pd.DataFrame({
    'ad_spend': ad_spend,
    'email_frequency': email_frequency,
    'website_visits': website_visits,
    'converted': converted
})

print("Marketing Campaign Data:")
print(df.head(10))
print(f"\nConversion Rate: {converted.mean():.2%}")

# Prepare data
X = df.drop('converted', axis=1)
y = df['converted']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Model 1: Without interactions
model1 = LogisticRegression()
model1.fit(X_train, y_train)
acc1 = accuracy_score(y_test, model1.predict(X_test))

# Model 2: With manual interactions
X_train_int = X_train.copy()
X_test_int = X_test.copy()

X_train_int['ad_x_email'] = X_train_int['ad_spend'] * X_train_int['email_frequency']
X_train_int['email_x_visits'] = X_train_int['email_frequency'] * X_train_int['website_visits']

X_test_int['ad_x_email'] = X_test_int['ad_spend'] * X_test_int['email_frequency']
X_test_int['email_x_visits'] = X_test_int['email_frequency'] * X_test_int['website_visits']

model2 = LogisticRegression()
model2.fit(X_train_int, y_train)
acc2 = accuracy_score(y_test, model2.predict(X_test_int))

print("\n" + "="*60 + "\n")
print("MODEL COMPARISON:")
print("="*60)
print(f"Without Interactions:       {acc1:.2%}")
print(f"With Manual Interactions:   {acc2:.2%}")
print(f"\nImprovement: {(acc2 - acc1):.2%}")
```

## Interaction-Only Features

Sometimes you want interactions without squared terms.

```python
from sklearn.preprocessing import PolynomialFeatures
import pandas as pd

# Sample data
df = pd.DataFrame({
    'x1': [1, 2, 3],
    'x2': [4, 5, 6],
    'x3': [7, 8, 9]
})

print("Original Features:")
print(df)
print("\n" + "="*60 + "\n")

# Regular polynomial features (includes squares)
poly_full = PolynomialFeatures(degree=2, include_bias=False)
full_features = poly_full.fit_transform(df)

print("Full Polynomial Features (degree=2):")
print("Features:", poly_full.get_feature_names_out())
print("Shape:", full_features.shape)

print("\n" + "="*60 + "\n")

# Interaction-only (no squares)
poly_interaction = PolynomialFeatures(degree=2, include_bias=False, interaction_only=True)
interaction_features = poly_interaction.fit_transform(df)

print("Interaction-Only Features:")
print("Features:", poly_interaction.get_feature_names_out())
print("Shape:", interaction_features.shape)

print("\n" + "="*60 + "\n")
print("Comparison:")
print(f"Full polynomial: {full_features.shape[1]} features")
print("  Includes: x1, x2, x3, x1², x2², x3², x1x2, x1x3, x2x3")
print(f"\nInteraction-only: {interaction_features.shape[1]} features")
print("  Includes: x1, x2, x3, x1x2, x1x3, x2x3")
print("  Excludes: x1², x2², x3² (squared terms)")
```

## When to Use Interaction Features

Interaction features shine when the effect of one variable depends on another. Look for these situations:
- Combined marketing efforts (ad spend and email frequency)
- Medical interactions (medication and age)
- Environmental factors (temperature and humidity)
- Business metrics (price and competitor actions)

## Quick Reference

```
Manual creation:
  df['feature_A_x_B'] = df['feature_A'] * df['feature_B']

Using PolynomialFeatures:
  poly = PolynomialFeatures(degree=2, interaction_only=True)
  X_interactions = poly.fit_transform(X)

Best practice:
  Start with domain knowledge
  Identify likely interactions
  Test with cross-validation
```

---

**Related Topics:**
- [Polynomial Features](./polynomial-features.md) - Includes both polynomials and interactions
- [Feature Crosses](./feature-crosses.md) - Interactions for categorical features

**Navigate:** [Feature Engineering Home](./README.md)
