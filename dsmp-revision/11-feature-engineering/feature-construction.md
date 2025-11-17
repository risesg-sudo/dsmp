# Feature Construction - Complete Guide

## Table of Contents
1. [Introduction to Feature Construction](#introduction-to-feature-construction)
2. [Polynomial Features](#polynomial-features)
3. [Interaction Terms](#interaction-terms)
4. [Domain-Specific Features](#domain-specific-features)
5. [Temporal Features](#temporal-features)
6. [Aggregation Features](#aggregation-features)
7. [Feature Crosses](#feature-crosses)
8. [Comparison and Selection](#comparison-and-selection)
9. [Common Mistakes](#common-mistakes)
10. [Interview Questions](#interview-questions)

---

## Introduction to Feature Construction

### What is Feature Construction?

Creating new features from existing ones to capture complex relationships and improve model performance.

```
Original Features     →     Constructed Features
═══════════════════         ══════════════════════

age: 25                     age_squared: 625
income: 50000               age × income: 1,250,000
                            age_group: "young"
                            income_log: 10.82
                            income_per_age: 2000
```

### Why Construct Features?

```
Benefits:
┌─────────────────────────────────────┐
│ 1. Capture Non-Linear Relationships │
│    Linear model can fit curves!     │
│                                      │
│ 2. Capture Interactions             │
│    Combined effect of features      │
│                                      │
│ 3. Domain Knowledge Integration     │
│    Use business logic               │
│                                      │
│ 4. Improve Model Performance        │
│    Often dramatic improvements      │
│                                      │
│ 5. Reduce Model Complexity          │
│    Simpler models with rich features│
└─────────────────────────────────────┘
```

### Types of Feature Construction

```
1. Mathematical Transformations
   - Polynomial: x², x³
   - Interactions: x₁ × x₂
   - Ratios: x₁ / x₂

2. Domain-Specific
   - BMI = weight / height²
   - Debt-to-income ratio
   - Customer lifetime value

3. Temporal
   - Day of week
   - Hour of day
   - Time since event

4. Aggregations
   - Sum, Mean, Max, Min
   - Count, Percentiles
   - Rolling statistics

5. Categorical Combinations
   - Feature crosses
   - Multi-level groupings
```

---

## Polynomial Features

### Concept

Create polynomial and interaction features from existing features.

```
Degree 2 Polynomial Features:
═════════════════════════════

Original:  [x₁, x₂]

Generated:
  1       → Intercept (if include_bias=True)
  x₁      → Original feature
  x₂      → Original feature
  x₁²     → Squared term
  x₁x₂    → Interaction
  x₂²     → Squared term

Result: [1, x₁, x₂, x₁², x₁x₂, x₂²]
```

### Why Polynomial Features?

```
Linear Model Limitation:
────────────────────────
y = β₀ + β₁x

Can only fit straight line:
    y │
      │      •
      │    •
      │  • ── Linear fit
      │•
      └──────── x

With Polynomial Features:
─────────────────────────
y = β₀ + β₁x + β₂x²

Can fit curves:
    y │     •
      │   •
      │  •  ← Polynomial fit (curve!)
      │ •
      │•
      └──────── x
```

### Implementation

```python
from sklearn.preprocessing import PolynomialFeatures
import numpy as np
import pandas as pd

# Simple example with 2 features
X = np.array([[2, 3]])

print("Original Features:")
print(f"x1 = {X[0, 0]}, x2 = {X[0, 1]}")
print("\n" + "="*60 + "\n")

# Generate degree 2 polynomial features
poly = PolynomialFeatures(degree=2, include_bias=True)
X_poly = poly.fit_transform(X)

# Get feature names
feature_names = poly.get_feature_names_out(['x1', 'x2'])

print("Polynomial Features (degree=2):")
for name, value in zip(feature_names, X_poly[0]):
    if name == '1':
        print(f"  {name:10s} = {value:6.0f}  (bias/intercept)")
    elif '^2' in name:
        print(f"  {name:10s} = {value:6.0f}  (squared)")
    elif ' ' in name:
        print(f"  {name:10s} = {value:6.0f}  (interaction)")
    else:
        print(f"  {name:10s} = {value:6.0f}  (original)")

print("\n" + "="*60 + "\n")
print("Manual Calculation:")
print(f"  1          = 1")
print(f"  x1         = 2")
print(f"  x2         = 3")
print(f"  x1²        = 2² = 4")
print(f"  x1×x2      = 2×3 = 6")
print(f"  x2²        = 3² = 9")
```

### Real-World Example: House Prices

```python
import numpy as np
import pandas as pd
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib.pyplot as plt

# Generate synthetic house price data with non-linear relationship
np.random.seed(42)
n = 200

area = np.random.uniform(500, 3000, n)
# Price has quadratic relationship with area
price = 50000 + 100 * area + 0.02 * area**2 + np.random.normal(0, 50000, n)

df = pd.DataFrame({
    'area': area,
    'price': price
})

print("House Price Data:")
print(df.head(10))
print("\n" + "="*60 + "\n")

# Split data
X = df[['area']]
y = df['price']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Model 1: Linear (degree=1)
model_linear = LinearRegression()
model_linear.fit(X_train, y_train)
y_pred_linear = model_linear.predict(X_test)
rmse_linear = np.sqrt(mean_squared_error(y_test, y_pred_linear))
r2_linear = r2_score(y_test, y_pred_linear)

# Model 2: Polynomial (degree=2)
poly_features = PolynomialFeatures(degree=2, include_bias=False)
X_train_poly = poly_features.fit_transform(X_train)
X_test_poly = poly_features.transform(X_test)

model_poly = LinearRegression()
model_poly.fit(X_train_poly, y_train)
y_pred_poly = model_poly.predict(X_test_poly)
rmse_poly = np.sqrt(mean_squared_error(y_test, y_pred_poly))
r2_poly = r2_score(y_test, y_pred_poly)

# Model 3: Higher degree (degree=3)
poly_features_3 = PolynomialFeatures(degree=3, include_bias=False)
X_train_poly3 = poly_features_3.fit_transform(X_train)
X_test_poly3 = poly_features_3.transform(X_test)

model_poly3 = LinearRegression()
model_poly3.fit(X_train_poly3, y_train)
y_pred_poly3 = model_poly3.predict(X_test_poly3)
rmse_poly3 = np.sqrt(mean_squared_error(y_test, y_pred_poly3))
r2_poly3 = r2_score(y_test, y_pred_poly3)

print("MODEL COMPARISON:")
print("="*60)
print(f"Linear (degree=1):")
print(f"  RMSE: ${rmse_linear:,.2f}")
print(f"  R²:   {r2_linear:.4f}")
print(f"\nPolynomial (degree=2):")
print(f"  RMSE: ${rmse_poly:,.2f}")
print(f"  R²:   {r2_poly:.4f}")
print(f"  Improvement: {((rmse_linear-rmse_poly)/rmse_linear*100):.1f}%")
print(f"\nPolynomial (degree=3):")
print(f"  RMSE: ${rmse_poly3:,.2f}")
print(f"  R²:   {r2_poly3:.4f}")

print("\n" + "="*60 + "\n")
print("Feature Names (degree=2):")
print(poly_features.get_feature_names_out())

print("\n" + "="*60 + "\n")
print("Model Equations:")
print(f"Linear:      price = {model_linear.intercept_:.0f} + {model_linear.coef_[0]:.2f}×area")
print(f"Polynomial:  price = {model_poly.intercept_:.0f} + {model_poly.coef_[0]:.2f}×area + {model_poly.coef_[1]:.2e}×area²")
```

### Multiple Features Example

```python
from sklearn.preprocessing import PolynomialFeatures
import pandas as pd
import numpy as np

# Multiple input features
df = pd.DataFrame({
    'age': [25, 30, 35],
    'income': [50000, 60000, 70000],
    'credit_score': [650, 700, 750]
})

print("Original Features:")
print(df)
print(f"Shape: {df.shape}")
print("\n" + "="*60 + "\n")

# Generate polynomial features
poly = PolynomialFeatures(degree=2, include_bias=False)
features_poly = poly.fit_transform(df)

# Create DataFrame with feature names
df_poly = pd.DataFrame(
    features_poly,
    columns=poly.get_feature_names_out(df.columns)
)

print("After Polynomial Feature Generation (degree=2):")
print(df_poly)
print(f"Shape: {df_poly.shape}")

print("\n" + "="*60 + "\n")
print("Feature Breakdown:")
print("Original features: 3")
print("Squared terms: 3 (age², income², credit_score²)")
print("Interaction terms: 3 (age×income, age×credit, income×credit)")
print("Total: 9 features")

print("\n" + "="*60 + "\n")
print("Number of features by degree:")
for degree in range(1, 5):
    poly_temp = PolynomialFeatures(degree=degree, include_bias=False)
    n_features = poly_temp.fit_transform(df).shape[1]
    print(f"Degree {degree}: {n_features} features")

print("\nWarning: High degrees can lead to many features!")
```

### Curse of Dimensionality

```python
import numpy as np
from sklearn.preprocessing import PolynomialFeatures

# Demonstrate exponential growth
n_input_features = range(1, 11)
degrees = [2, 3, 4, 5]

print("Polynomial Feature Explosion:")
print("="*70)
print(f"{'Input Features':^15} | ", end='')
for d in degrees:
    print(f"{'Degree '+str(d):^12} | ", end='')
print()
print("-"*70)

for n in n_input_features:
    print(f"{n:^15} | ", end='')
    for d in degrees:
        poly = PolynomialFeatures(degree=d, include_bias=False)
        X_dummy = np.zeros((1, n))
        n_output = poly.fit_transform(X_dummy).shape[1]
        print(f"{n_output:^12} | ", end='')
    print()

print("\n" + "="*70 + "\n")
print("Observations:")
print("- 10 features with degree 5 → 2,002 features!")
print("- Exponential growth with degree and input features")
print("- Can cause overfitting and slow training")
print("\nBest Practice: Start with degree 2, only increase if needed")
```

### When to Use

✅ **Use Polynomial Features when:**
- Relationship appears non-linear
- Using linear models (regression, logistic)
- Small number of features (< 10)
- Have enough data to avoid overfitting

❌ **Don't use when:**
- Using tree-based models (they handle non-linearity)
- Too many input features (explosion)
- Limited data (overfitting risk)
- Features already capture non-linearity

---

## Interaction Terms

### Concept

Capture the combined effect of two or more features.

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

### Manual Interaction Creation

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

### Real-World Example: Marketing Campaign

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

# Marketing campaign data
np.random.seed(42)
n = 1000

ad_spend = np.random.uniform(100, 10000, n)
email_frequency = np.random.randint(1, 20, n)
website_visits = np.random.randint(0, 50, n)

# Conversion depends on interactions
# More ad spend + more emails = higher conversion
# More visits + more emails = higher conversion
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

# Model 3: Using PolynomialFeatures (all interactions)
from sklearn.preprocessing import PolynomialFeatures

poly = PolynomialFeatures(degree=2, include_bias=False, interaction_only=True)
X_train_poly = poly.fit_transform(X_train)
X_test_poly = poly.transform(X_test)

model3 = LogisticRegression()
model3.fit(X_train_poly, y_train)
acc3 = accuracy_score(y_test, model3.predict(X_test_poly))

print("\n" + "="*60 + "\n")
print("MODEL COMPARISON:")
print("="*60)
print(f"Without Interactions:       {acc1:.2%}")
print(f"With Manual Interactions:   {acc2:.2%}")
print(f"With All Interactions:      {acc3:.2%}")
print(f"\nImprovement: {(acc3 - acc1):.2%}")

print("\n" + "="*60 + "\n")
print("Feature Importance Analysis:")
print("Features with interactions:", X_train_int.columns.tolist())

# Get coefficients
print("\nModel 2 Coefficients:")
for feature, coef in zip(X_train_int.columns, model2.coef_[0]):
    print(f"  {feature:20s}: {coef:8.4f}")
```

### Interaction-Only Features

```python
from sklearn.preprocessing import PolynomialFeatures
import pandas as pd
import numpy as np

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

---

## Domain-Specific Features

### Financial Domain

```python
import pandas as pd
import numpy as np

# Credit risk data
df = pd.DataFrame({
    'annual_income': [50000, 75000, 60000, 90000, 45000],
    'total_debt': [15000, 30000, 20000, 25000, 35000],
    'monthly_payment': [500, 1000, 700, 800, 1200],
    'credit_limit': [10000, 25000, 15000, 30000, 8000],
    'credit_used': [5000, 15000, 8000, 10000, 7500],
    'months_employed': [24, 60, 36, 84, 12],
    'age': [25, 35, 28, 42, 23]
})

print("Original Financial Data:")
print(df)
print("\n" + "="*60 + "\n")

# Domain-specific feature engineering
print("Constructing Domain-Specific Features...")
print("="*60)

# 1. Debt-to-Income Ratio (classic financial metric)
df['debt_to_income'] = df['total_debt'] / df['annual_income']
print("\n1. Debt-to-Income Ratio:")
print("   Formula: total_debt / annual_income")
print("   Interpretation: < 0.36 is generally good")
print(f"   Example: ${df.iloc[0]['total_debt']} / ${df.iloc[0]['annual_income']} = {df.iloc[0]['debt_to_income']:.2f}")

# 2. Credit Utilization Rate
df['credit_utilization'] = df['credit_used'] / df['credit_limit']
print("\n2. Credit Utilization Rate:")
print("   Formula: credit_used / credit_limit")
print("   Interpretation: < 0.30 is ideal")

# 3. Monthly Payment to Income Ratio
df['payment_to_income'] = (df['monthly_payment'] * 12) / df['annual_income']
print("\n3. Monthly Payment to Income:")
print("   Formula: (monthly_payment × 12) / annual_income")

# 4. Available Credit
df['available_credit'] = df['credit_limit'] - df['credit_used']
print("\n4. Available Credit:")
print("   Formula: credit_limit - credit_used")

# 5. Employment Stability Score
df['employment_stability'] = df['months_employed'] / df['age']
print("\n5. Employment Stability:")
print("   Formula: months_employed / age")
print("   Interpretation: Higher = more stable")

# 6. Income per Year of Age
df['income_per_age'] = df['annual_income'] / df['age']
print("\n6. Income per Age:")
print("   Formula: annual_income / age")

print("\n" + "="*60 + "\n")
print("Enhanced Dataset:")
print(df)

print("\n" + "="*60 + "\n")
print("Summary of Constructed Features:")
summary = pd.DataFrame({
    'Feature': [
        'debt_to_income',
        'credit_utilization',
        'payment_to_income',
        'available_credit',
        'employment_stability',
        'income_per_age'
    ],
    'Type': [
        'Ratio',
        'Ratio',
        'Ratio',
        'Difference',
        'Ratio',
        'Ratio'
    ],
    'Business Value': [
        'Primary credit risk metric',
        'Credit health indicator',
        'Affordability measure',
        'Financial buffer',
        'Job security proxy',
        'Earning potential'
    ]
})
print(summary.to_string(index=False))
```

### E-commerce Domain

```python
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# E-commerce customer data
np.random.seed(42)
n = 5

df = pd.DataFrame({
    'customer_id': range(1, n+1),
    'total_purchases': [5, 15, 3, 25, 8],
    'total_revenue': [500, 3000, 200, 5000, 1200],
    'days_since_first_purchase': [365, 730, 180, 1095, 450],
    'days_since_last_purchase': [7, 30, 90, 5, 15],
    'product_views': [50, 200, 30, 400, 100],
    'cart_additions': [10, 40, 5, 80, 20],
    'email_opens': [8, 25, 2, 40, 15],
    'email_clicks': [3, 15, 1, 30, 8]
})

print("Original E-commerce Data:")
print(df)
print("\n" + "="*60 + "\n")

# E-commerce specific features
print("Constructing E-commerce Features...")
print("="*60)

# 1. Average Order Value (AOV)
df['avg_order_value'] = df['total_revenue'] / df['total_purchases']
print("\n1. Average Order Value:")
print("   Formula: total_revenue / total_purchases")

# 2. Purchase Frequency
df['purchase_frequency'] = df['total_purchases'] / (df['days_since_first_purchase'] / 30)
print("\n2. Purchase Frequency (per month):")
print("   Formula: total_purchases / (days_since_first_purchase / 30)")

# 3. Recency Score (RFM - Recency)
df['recency_score'] = 1 / (1 + df['days_since_last_purchase'])
print("\n3. Recency Score:")
print("   Formula: 1 / (1 + days_since_last_purchase)")
print("   Higher = more recent purchase")

# 4. Conversion Rate
df['conversion_rate'] = df['total_purchases'] / df['product_views']
print("\n4. Conversion Rate:")
print("   Formula: total_purchases / product_views")

# 5. Cart Abandonment Rate
df['cart_abandon_rate'] = (df['cart_additions'] - df['total_purchases']) / df['cart_additions']
print("\n5. Cart Abandonment Rate:")
print("   Formula: (cart_additions - purchases) / cart_additions")

# 6. Email Engagement Rate
df['email_engagement'] = df['email_clicks'] / df['email_opens']
print("\n6. Email Engagement Rate:")
print("   Formula: email_clicks / email_opens")

# 7. Customer Lifetime Value (CLV) estimate
df['estimated_clv'] = df['avg_order_value'] * df['purchase_frequency'] * 12
print("\n7. Estimated Customer Lifetime Value (1 year):")
print("   Formula: avg_order_value × purchase_frequency × 12")

# 8. Customer Segment (based on RFM)
def segment_customer(row):
    if row['recency_score'] > 0.05 and row['total_purchases'] > 15:
        return 'Champion'
    elif row['recency_score'] > 0.05 and row['total_purchases'] > 5:
        return 'Loyal'
    elif row['days_since_last_purchase'] > 60:
        return 'At Risk'
    else:
        return 'Regular'

df['customer_segment'] = df.apply(segment_customer, axis=1)

print("\n" + "="*60 + "\n")
print("Enhanced E-commerce Dataset:")
print(df)
```

### Healthcare Domain

```python
import pandas as pd
import numpy as np

# Patient health data
df = pd.DataFrame({
    'age': [25, 45, 60, 35, 52],
    'weight_kg': [70, 85, 95, 75, 90],
    'height_cm': [170, 175, 165, 168, 172],
    'systolic_bp': [120, 140, 150, 125, 145],
    'diastolic_bp': [80, 90, 95, 82, 92],
    'cholesterol': [180, 220, 250, 190, 240],
    'glucose': [90, 110, 130, 95, 125],
    'heart_rate': [70, 75, 80, 72, 78]
})

print("Original Healthcare Data:")
print(df)
print("\n" + "="*60 + "\n")

# Healthcare-specific features
print("Constructing Healthcare Features...")
print("="*60)

# 1. Body Mass Index (BMI)
df['bmi'] = df['weight_kg'] / ((df['height_cm'] / 100) ** 2)
print("\n1. BMI (Body Mass Index):")
print("   Formula: weight_kg / (height_m)²")
print("   Categories: <18.5 underweight, 18.5-25 normal, >25 overweight")

# 2. BMI Category
def bmi_category(bmi):
    if bmi < 18.5:
        return 'Underweight'
    elif bmi < 25:
        return 'Normal'
    elif bmi < 30:
        return 'Overweight'
    else:
        return 'Obese'

df['bmi_category'] = df['bmi'].apply(bmi_category)

# 3. Mean Arterial Pressure (MAP)
df['map'] = df['diastolic_bp'] + (df['systolic_bp'] - df['diastolic_bp']) / 3
print("\n2. Mean Arterial Pressure:")
print("   Formula: diastolic + (systolic - diastolic) / 3")

# 4. Pulse Pressure
df['pulse_pressure'] = df['systolic_bp'] - df['diastolic_bp']
print("\n3. Pulse Pressure:")
print("   Formula: systolic - diastolic")

# 5. Cardiovascular Risk Score
df['cardio_risk'] = (
    0.1 * df['age'] +
    0.5 * (df['bmi'] - 25).clip(lower=0) +
    0.3 * (df['systolic_bp'] - 120).clip(lower=0) +
    0.2 * (df['cholesterol'] - 200).clip(lower=0)
)
print("\n4. Cardiovascular Risk Score (simplified):")
print("   Combines: age, BMI, BP, cholesterol")

# 6. Metabolic Health Score
df['metabolic_health'] = (
    100 -
    abs(df['glucose'] - 100) * 0.5 -
    abs(df['cholesterol'] - 200) * 0.1 -
    abs(df['bmi'] - 22) * 2
)
print("\n5. Metabolic Health Score:")
print("   Higher = better metabolic health")

print("\n" + "="*60 + "\n")
print("Enhanced Healthcare Dataset:")
print(df[['age', 'bmi', 'bmi_category', 'map', 'cardio_risk', 'metabolic_health']])
```

---

## Temporal Features

### Date/Time Feature Extraction

```python
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Create time series data
np.random.seed(42)
dates = pd.date_range(start='2023-01-01', periods=100, freq='D')
sales = 1000 + np.random.randint(-200, 300, 100)

df = pd.DataFrame({
    'date': dates,
    'sales': sales
})

print("Original Time Series Data:")
print(df.head(10))
print("\n" + "="*60 + "\n")

# Extract temporal features
print("Extracting Temporal Features...")
print("="*60)

# Basic time components
df['year'] = df['date'].dt.year
df['month'] = df['date'].dt.month
df['day'] = df['date'].dt.day
df['day_of_week'] = df['date'].dt.dayofweek  # 0=Monday, 6=Sunday
df['day_of_year'] = df['date'].dt.dayofyear
df['week_of_year'] = df['date'].dt.isocalendar().week
df['quarter'] = df['date'].dt.quarter

# Categorical time features
df['month_name'] = df['date'].dt.month_name()
df['day_name'] = df['date'].dt.day_name()
df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
df['is_month_start'] = df['date'].dt.is_month_start.astype(int)
df['is_month_end'] = df['date'].dt.is_month_end.astype(int)

# Cyclical encoding (for circular features)
df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
df['day_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
df['day_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)

print("\nTemporal Features Created:")
print(df.head(10))

print("\n" + "="*60 + "\n")
print("Feature Explanation:")
print("\n1. Basic Components:")
print("   - year, month, day, day_of_week, etc.")
print("\n2. Boolean Indicators:")
print("   - is_weekend, is_month_start, is_month_end")
print("\n3. Cyclical Encoding:")
print("   - month_sin/cos: Preserves December-January continuity")
print("   - day_sin/cos: Sunday follows Saturday")
print("\nWhy Cyclical Encoding?")
print("   Without: December(12) and January(1) seem far apart")
print("   With: sin/cos maintains circular relationship")
```

### Real-World Example: Retail Sales

```python
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

# Generate retail sales data with temporal patterns
np.random.seed(42)
dates = pd.date_range(start='2022-01-01', periods=365*2, freq='D')

# Base sales with patterns
day_of_week = pd.to_datetime(dates).dayofweek
month = pd.to_datetime(dates).month

sales = (
    5000 +  # Base
    1000 * (day_of_week == 5) +  # Saturday boost
    800 * (day_of_week == 6) +   # Sunday boost
    2000 * (month == 12) +  # December boost
    500 * (month.isin([6, 7, 8])) +  # Summer boost
    np.random.normal(0, 500, len(dates))
)

df = pd.DataFrame({
    'date': dates,
    'sales': sales
})

# Extract temporal features
df['day_of_week'] = df['date'].dt.dayofweek
df['month'] = df['date'].dt.month
df['day_of_month'] = df['date'].dt.day
df['quarter'] = df['date'].dt.quarter
df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
df['is_holiday_season'] = df['month'].isin([11, 12]).astype(int)
df['is_summer'] = df['month'].isin([6, 7, 8]).astype(int)

# Cyclical features
df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
df['day_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
df['day_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)

print("Retail Sales Data:")
print(df.head(10))

# Split data temporally (important for time series!)
split_date = '2023-07-01'
train = df[df['date'] < split_date]
test = df[df['date'] >= split_date]

# Features to use
feature_cols = ['day_of_week', 'month', 'day_of_month', 'quarter',
                'is_weekend', 'is_holiday_season', 'is_summer',
                'month_sin', 'month_cos', 'day_sin', 'day_cos']

X_train = train[feature_cols]
y_train = train['sales']
X_test = test[feature_cols]
y_test = test['sales']

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print("\n" + "="*60 + "\n")
print("Model Performance:")
print(f"RMSE: ${rmse:,.2f}")
print(f"R²:   {r2:.4f}")

print("\n" + "="*60 + "\n")
print("Feature Importance:")
importances = pd.DataFrame({
    'feature': feature_cols,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)
print(importances.to_string(index=False))
```

### Lag and Rolling Features

```python
import pandas as pd
import numpy as np

# Time series data
np.random.seed(42)
dates = pd.date_range(start='2023-01-01', periods=30, freq='D')
sales = 1000 + np.cumsum(np.random.randn(30) * 50)

df = pd.DataFrame({
    'date': dates,
    'sales': sales
})

print("Original Time Series:")
print(df.head(10))
print("\n" + "="*60 + "\n")

# Lag features (previous values)
df['sales_lag1'] = df['sales'].shift(1)  # Yesterday
df['sales_lag7'] = df['sales'].shift(7)  # Last week
df['sales_lag30'] = df['sales'].shift(30)  # Last month

# Rolling statistics
df['sales_roll_mean_7'] = df['sales'].rolling(window=7).mean()
df['sales_roll_std_7'] = df['sales'].rolling(window=7).std()
df['sales_roll_min_7'] = df['sales'].rolling(window=7).min()
df['sales_roll_max_7'] = df['sales'].rolling(window=7).max()

# Percentage change
df['sales_pct_change'] = df['sales'].pct_change()
df['sales_diff'] = df['sales'].diff()

# Expanding features (all history)
df['sales_expanding_mean'] = df['sales'].expanding().mean()
df['sales_expanding_std'] = df['sales'].expanding().std()

print("With Lag and Rolling Features:")
print(df.head(15))

print("\n" + "="*60 + "\n")
print("Feature Explanations:")
print("\nLag Features:")
print("  sales_lag1: Sales from yesterday")
print("  sales_lag7: Sales from 7 days ago")
print("\nRolling Features (7-day window):")
print("  sales_roll_mean_7: Average of last 7 days")
print("  sales_roll_std_7: Volatility in last 7 days")
print("\nChange Features:")
print("  sales_pct_change: Percentage change from previous day")
print("  sales_diff: Absolute change from previous day")
print("\nExpanding Features:")
print("  sales_expanding_mean: Average of all history")
```

---

## Aggregation Features

### Group-Based Aggregations

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

### Real-World Example: Customer Behavior

```python
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

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

---

## Feature Crosses

### Categorical Feature Crosses

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

### Real-World Example: Ad Click Prediction

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

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
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer

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

---

## Comparison and Selection

### Summary Table

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

---

## Common Mistakes

### ❌ Mistake 1: Creating Too Many Features

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

### ❌ Mistake 2: Data Leakage in Aggregations

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

### ❌ Mistake 3: Not Handling Missing Crosses

```python
# When creating crosses, new combinations in test might not exist in train
# WRONG: Direct mapping
train_crosses = train['city'] + '_' + train['age_group']

# CORRECT: Handle unknown combinations
from sklearn.preprocessing import OneHotEncoder
encoder = OneHotEncoder(handle_unknown='ignore')
```

### ❌ Mistake 4: Ignoring Domain Knowledge

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

---

## Best Practices

### ✅ Practice 1: Feature Selection After Construction

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

### ✅ Practice 2: Validate Feature Importance

```python
# Check if constructed features actually help
from sklearn.model_selection import cross_val_score

# Without new features
score_before = cross_val_score(model, X_original, y, cv=5).mean()

# With new features
score_after = cross_val_score(model, X_with_features, y, cv=5).mean()

if score_after > score_before:
    print("✓ Features improved model")
else:
    print("✗ Features didn't help, remove them")
```

### ✅ Practice 3: Document Feature Engineering

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

---

## Interview Questions

### Q1: What are polynomial features and when should you use them?

**Answer:**

**Polynomial features** extend linear models to capture non-linear relationships.

**Example:**
```python
Original: [x]
Degree 2: [x, x²]
Degree 3: [x, x², x³]

Linear model: y = β₀ + β₁x
With polynomial: y = β₀ + β₁x + β₂x²

Now can fit curves, not just lines!
```

**When to use:**
1. **Non-linear relationships exist**
2. **Using linear models** (regression, logistic)
3. **Small number of features** (< 10)
4. **Enough data** to avoid overfitting

**Don't use when:**
- Tree-based models (they handle non-linearity)
- Too many features (combinatorial explosion)
- Limited data (overfitting risk)

### Q2: What are interaction features and why are they important?

**Answer:**

**Interaction features** capture combined effects of multiple features.

**Example:**
```
Study Hours  Sleep Hours  Score
     10          8         95   ← High both
     10          4         75   ← High study, low sleep
      5          8         70   ← Low study, high sleep

Interaction = study_hours × sleep_hours

The effect of studying depends on sleep!
Linear model alone can't capture this.
```

**Why important:**
1. **Combined effects**: Features interact in real world
2. **Model performance**: Often significant improvement
3. **Interpretability**: Reveals synergies

**Examples:**
- Marketing: ad_spend × email_frequency
- Healthcare: bmi × age
- Finance: income × credit_score

### Q3: How do you prevent data leakage when creating aggregate features?

**Answer:**

**Data leakage** occurs when test information influences training.

**Wrong approach:**
```python
# Calculate on ENTIRE dataset
df['customer_avg'] = df.groupby('customer_id')['amount'].transform('mean')
train, test = split(df)  # Leak! Used test data to create features
```

**Correct approach:**
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

**For time series:**
```python
# Use only past data for each prediction
df['rolling_mean'] = df['sales'].shift(1).rolling(7).mean()
# shift(1) ensures we don't use current value
```

### Q4: What are feature crosses and when are they useful?

**Answer:**

**Feature crosses** combine categorical features to capture joint effects.

**Example:**
```python
city = 'NYC'
time = 'Evening'

city_x_time = 'NYC_Evening'

This captures unique behavior:
- NYC in evening (different from NYC morning)
- NYC in evening (different from LA evening)
```

**When useful:**
1. **Categorical interactions matter**
2. **Recommendation systems**
3. **Ad click prediction**
4. **Customer segmentation**

**Real example:**
```python
Ad Campaign:
device × time_of_day = 'Mobile_Evening'

Mobile users in evening behave differently:
- More likely to click ads
- Different from desktop users
- Different from mobile in morning
```

**Trade-off:**
- Pros: Captures specific patterns
- Cons: Creates many categories (sparse data)

### Q5: What's the difference between polynomial features and interaction features?

**Answer:**

**Polynomial features** include:
- Original features
- Squared terms (x²)
- Interaction terms (x₁ × x₂)

**Interaction features** include:
- Only interaction terms (x₁ × x₂)
- No squared terms

**Example:**
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

**When to use each:**
- **Polynomial**: Non-linear individual effects + interactions
- **Interaction only**: Combined effects matter, not non-linearity

---

## Summary

### Quick Reference

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

### Decision Framework

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

**Next:** [Discretization Techniques →](./discretization.md)

**Previous:** [← Transformations](./transformations.md)
