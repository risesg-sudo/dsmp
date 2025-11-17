# Domain-Specific Features

## What You'll Learn

Transform raw data into meaningful business metrics using domain expertise. You'll discover how to create powerful features that encode industry knowledge, turning simple measurements into actionable insights across finance, e-commerce, and healthcare domains.

## The Power of Domain Knowledge

Domain-specific features leverage business logic and industry standards to create features that models can easily interpret and act upon. These features often outperform automated feature engineering because they capture decades of human expertise.

## Financial Domain Features

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
```

## E-commerce Domain Features

```python
import pandas as pd
import numpy as np

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

print("\n" + "="*60 + "\n")
print("Enhanced E-commerce Dataset:")
print(df)
```

## Healthcare Domain Features

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

## When to Create Domain-Specific Features

Create domain-specific features when:
- Industry standards exist (BMI, debt-to-income)
- Business rules are well-established
- Domain experts can validate features
- Features will be interpretable to stakeholders

These features often provide the highest ROI because they combine data with human expertise.

## Quick Reference

```
Financial:
  debt_to_income = debt / income
  credit_utilization = used / limit

E-commerce:
  avg_order_value = revenue / purchases
  cart_abandon_rate = (added - purchased) / added

Healthcare:
  bmi = weight / height²
  map = diastolic + (systolic - diastolic) / 3

Always validate with domain experts!
```

---

**Related Topics:**
- [Temporal Features](./temporal-features.md) - Time-based domain features
- [Aggregation Features](./aggregation-features.md) - Customer behavior metrics

**Navigate:** [Feature Engineering Home](./README.md)
