# Custom Binning

## What You'll Learn

Harness the power of domain expertise to create meaningful bins. You'll learn how to apply industry standards, medical guidelines, and business rules to discretize data in ways that make sense to stakeholders and improve model interpretability.

## Domain-Based Age Binning

```python
import pandas as pd
import numpy as np

# Age data
ages = np.random.randint(0, 100, 200)
df = pd.DataFrame({'age': ages})

print("Age Data:")
print(df['age'].describe())
print("\n" + "="*60 + "\n")

# Domain-knowledge based age groups
age_bins = [0, 2, 12, 18, 25, 35, 50, 65, 100]
age_labels = ['Infant', 'Child', 'Teen', 'Young Adult',
              'Adult', 'Middle Age', 'Senior', 'Elderly']

df['age_group'] = pd.cut(
    df['age'],
    bins=age_bins,
    labels=age_labels,
    include_lowest=True
)

print("Domain-Based Age Groups:")
print(df.head(20))

print("\n" + "="*60 + "\n")
print("Distribution:")
print(df['age_group'].value_counts().sort_index())

print("\n" + "="*60 + "\n")
print("Bin Edges (based on life stages):")
for i, (edge, label) in enumerate(zip(age_bins[:-1], age_labels)):
    print(f"  {label:15s}: [{age_bins[i]:3d}, {age_bins[i+1]:3d})")
```

## Medical and Clinical Bins

```python
import pandas as pd
import numpy as np

# Medical measurements
np.random.seed(42)
n = 500

df = pd.DataFrame({
    'systolic_bp': np.random.normal(130, 20, n),
    'bmi': np.random.normal(26, 5, n),
    'glucose': np.random.normal(100, 20, n)
})

print("Medical Data:")
print(df.describe())
print("\n" + "="*60 + "\n")

# Blood Pressure Categories (American Heart Association)
bp_bins = [0, 120, 130, 140, 180, 300]
bp_labels = ['Normal', 'Elevated', 'Stage 1 Hypertension',
             'Stage 2 Hypertension', 'Hypertensive Crisis']

df['bp_category'] = pd.cut(
    df['systolic_bp'],
    bins=bp_bins,
    labels=bp_labels
)

# BMI Categories (WHO)
bmi_bins = [0, 18.5, 25, 30, 35, 100]
bmi_labels = ['Underweight', 'Normal', 'Overweight', 'Obese Class I', 'Obese Class II+']

df['bmi_category'] = pd.cut(
    df['bmi'],
    bins=bmi_bins,
    labels=bmi_labels
)

# Glucose Categories (ADA)
glucose_bins = [0, 100, 126, 200, 500]
glucose_labels = ['Normal', 'Prediabetes', 'Diabetes', 'Severe']

df['glucose_category'] = pd.cut(
    df['glucose'],
    bins=glucose_bins,
    labels=glucose_labels
)

print("With Clinical Categories:")
print(df.head(10))

print("\n" + "="*60 + "\n")
print("Blood Pressure Distribution:")
print(df['bp_category'].value_counts().sort_index())

print("\n" + "="*60 + "\n")
print("BMI Distribution:")
print(df['bmi_category'].value_counts().sort_index())

print("\n" + "="*60 + "\n")
print("Glucose Distribution:")
print(df['glucose_category'].value_counts().sort_index())

# Cross-tabulation
print("\n" + "="*60 + "\n")
print("Risk Assessment (BP vs BMI):")
risk_table = pd.crosstab(df['bp_category'], df['bmi_category'])
print(risk_table)
```

## Business Rule-Based Binning

```python
import pandas as pd
import numpy as np

# E-commerce customer data
np.random.seed(42)
n = 1000

df = pd.DataFrame({
    'customer_id': range(1, n+1),
    'total_revenue': np.random.exponential(scale=500, size=n) + 50,
    'days_since_last_purchase': np.random.randint(0, 365, n),
    'total_purchases': np.random.randint(1, 50, n)
})

print("Customer Data:")
print(df.head(10))
print("\n" + "="*60 + "\n")

# RFM Segmentation (Recency, Frequency, Monetary)

# Recency bins (based on business calendar)
recency_bins = [0, 30, 90, 180, 365]
recency_labels = ['Active', 'Regular', 'Lapsed', 'Inactive']
df['recency_segment'] = pd.cut(
    df['days_since_last_purchase'],
    bins=recency_bins,
    labels=recency_labels,
    include_lowest=True
)

# Monetary bins (based on business tiers)
monetary_bins = [0, 100, 500, 1000, 5000, float('inf')]
monetary_labels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
df['monetary_segment'] = pd.cut(
    df['total_revenue'],
    bins=monetary_bins,
    labels=monetary_labels
)

# Frequency bins
frequency_bins = [0, 5, 10, 20, 50]
frequency_labels = ['Occasional', 'Regular', 'Frequent', 'Power User']
df['frequency_segment'] = pd.cut(
    df['total_purchases'],
    bins=frequency_bins,
    labels=frequency_labels,
    include_lowest=True
)

print("With Business Segments:")
print(df.head(10))

print("\n" + "="*60 + "\n")
print("Segmentation Summary:")
print("\nRecency:")
print(df['recency_segment'].value_counts().sort_index())
print("\nMonetary:")
print(df['monetary_segment'].value_counts().sort_index())
print("\nFrequency:")
print(df['frequency_segment'].value_counts().sort_index())

# Create overall customer tier
def assign_tier(row):
    score = 0
    # Recency
    if row['recency_segment'] == 'Active':
        score += 3
    elif row['recency_segment'] == 'Regular':
        score += 2

    # Monetary
    if row['monetary_segment'] in ['Platinum', 'Diamond']:
        score += 3
    elif row['monetary_segment'] == 'Gold':
        score += 2

    # Frequency
    if row['frequency_segment'] in ['Frequent', 'Power User']:
        score += 3
    elif row['frequency_segment'] == 'Regular':
        score += 2

    if score >= 8:
        return 'VIP'
    elif score >= 5:
        return 'Loyal'
    elif score >= 3:
        return 'Regular'
    else:
        return 'At Risk'

df['customer_tier'] = df.apply(assign_tier, axis=1)

print("\n" + "="*60 + "\n")
print("Customer Tier Distribution:")
print(df['customer_tier'].value_counts().sort_index())
```

## When to Use Custom Binning

Use custom binning when:
- Industry standards exist (medical guidelines, financial ratios)
- Business rules are well-established
- Stakeholders need interpretable categories
- Domain expertise is available
- Regulatory requirements exist

This approach provides the most interpretable and actionable results.

## Quick Reference

```
Medical bins (clinical guidelines):
  bp_bins = [0, 120, 130, 140, 180, 300]
  bmi_bins = [0, 18.5, 25, 30, 35, 100]

Business bins (RFM analysis):
  recency_bins = [0, 30, 90, 180, 365]
  monetary_bins = [0, 100, 500, 1000, 5000, inf]

Create bins:
  pd.cut(data, bins=custom_edges, labels=custom_labels)

Always validate with domain experts!

Advantages:
  - Highly interpretable
  - Actionable insights
  - Stakeholder buy-in

Requires:
  - Domain knowledge
  - Business context
  - Expert validation
```

---

**Related Topics:**
- [Equal-Width Binning](./equal-width-binning.md) - Simple approach
- [K-Means Binning](./kmeans-binning.md) - Data-driven approach

**Navigate:** [Feature Engineering Home](./README.md)
