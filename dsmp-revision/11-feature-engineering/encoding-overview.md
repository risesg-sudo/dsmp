# Encoding Categorical Features - Overview

## What You'll Learn

Understanding why and how to convert categorical data into numerical format is fundamental to machine learning. This guide introduces you to the fascinating world of encoding techniques, explaining why they're necessary and how to identify different types of categorical variables.

## Why Encode Categorical Features?

Machine learning algorithms work with numbers, not text or categories. Encoding converts categorical data into numerical format that algorithms can process.

```
Raw Data          Encoded Data
─────────────  →  ─────────────
"Red"             [1, 0, 0]
"Green"           [0, 1, 0]
"Blue"            [0, 0, 1]
```

### The Challenge

Consider a simple dataset with a "Color" column containing Red, Green, and Blue. Your algorithm needs numbers, but how do you convert these text values? Should Red=1, Green=2, Blue=3? This creates an artificial ordering that doesn't exist in reality. The solution lies in choosing the right encoding technique.

## Types of Categorical Variables

Understanding variable types is crucial for selecting the appropriate encoding method.

```
Categorical Variables
│
├─── Nominal (No Order)
│    ├─ Colors: Red, Blue, Green
│    ├─ Cities: NYC, LA, Chicago
│    └─ Products: Phone, Laptop, Tablet
│
└─── Ordinal (Has Order)
     ├─ Education: High School < Bachelor < Master < PhD
     ├─ Size: Small < Medium < Large
     └─ Rating: Poor < Fair < Good < Excellent
```

### Nominal Variables

Nominal variables have no inherent order or ranking. The categories are simply different from each other without any logical sequence.

**Examples:**
- **Colors**: Is Red "greater than" Blue? No meaningful order exists
- **Cities**: NYC, LA, Chicago have no natural ranking
- **Product Types**: Phone, Laptop, Tablet are different categories
- **Payment Methods**: Credit Card, Cash, UPI

**Key Insight**: For nominal variables, never use simple numeric encoding (1, 2, 3) as it implies an order that doesn't exist.

### Ordinal Variables

Ordinal variables have a clear, meaningful order or hierarchy between categories.

**Examples:**
- **Education Level**: High School < Bachelor < Master < PhD
- **T-Shirt Size**: XS < S < M < L < XL < XXL
- **Customer Rating**: Poor < Fair < Good < Excellent
- **Priority Level**: Low < Medium < High
- **Income Bracket**: 0-25k < 25-50k < 50-100k < 100k+

**Key Insight**: For ordinal variables, the order matters and should be preserved in encoding.

## Identifying Variable Types in Practice

```python
import pandas as pd

# Sample dataset
df = pd.DataFrame({
    'gender': ['M', 'F', 'M', 'F'],           # Nominal
    'city': ['NYC', 'LA', 'NYC', 'Chicago'],  # Nominal
    'education': ['Bachelor', 'Master', 'PhD', 'Bachelor'],  # Ordinal
    'satisfaction': ['Good', 'Poor', 'Excellent', 'Fair'],    # Ordinal
    'product': ['Phone', 'Laptop', 'Tablet', 'Phone']         # Nominal
})

# Quick identification checklist
print("Variable Type Analysis:")
print("="*60)

print("\nNominal Variables (No Order):")
print("- gender: No order between M/F")
print("- city: No ranking between cities")
print("- product: No hierarchy in product types")

print("\nOrdinal Variables (Has Order):")
print("- education: Clear progression HS → Bachelor → Master → PhD")
print("- satisfaction: Poor < Fair < Good < Excellent")
```

## Cardinality: A Critical Factor

**Cardinality** refers to the number of unique categories in a variable. It heavily influences which encoding method you should choose.

```
┌─────────────────────┬─────────────────┬─────────────────────┐
│ Cardinality         │ Example         │ Recommended Method  │
├─────────────────────┼─────────────────┼─────────────────────┤
│ Low (2-10)          │ Gender, Color   │ One-Hot Encoding    │
│ Medium (10-50)      │ State, Product  │ Binary/Target       │
│ High (50+)          │ City, ZIP Code  │ Target/Frequency    │
│ Very High (1000+)   │ User ID, SKU    │ Target/Embedding    │
└─────────────────────┴─────────────────┴─────────────────────┘
```

### Why Cardinality Matters

```python
import pandas as pd

# Low cardinality example
gender = pd.Series(['M', 'F', 'M', 'F', 'M'])
print(f"Gender cardinality: {gender.nunique()}")  # 2 unique values
# → One-Hot Encoding creates 2 columns (manageable)

# High cardinality example
cities = pd.Series(['City_' + str(i) for i in range(1000)])
print(f"City cardinality: {cities.nunique()}")  # 1000 unique values
# → One-Hot Encoding creates 1000 columns (problematic!)
# → Use Target Encoding instead (creates 1 column)
```

## Real-World Example: Customer Data

Let's analyze a real customer dataset to identify variable types:

```python
import pandas as pd
import numpy as np

# Sample customer data
df = pd.DataFrame({
    'customer_id': range(1, 6),
    'gender': ['M', 'F', 'M', 'F', 'M'],                    # Nominal, Low
    'city': ['NYC', 'LA', 'Chicago', 'NYC', 'Houston'],     # Nominal, Medium
    'education': ['Bachelor', 'Master', 'PhD', 'Bachelor', 'Master'],  # Ordinal, Low
    'income_bracket': ['Low', 'Medium', 'High', 'Medium', 'Low'],      # Ordinal, Low
    'satisfaction': ['Good', 'Excellent', 'Poor', 'Fair', 'Good'],     # Ordinal, Low
    'product_category': ['Electronics', 'Clothing', 'Food', 'Electronics', 'Clothing']  # Nominal, Low
})

print("Customer Dataset Analysis:")
print("="*70)
print(df)
print("\n" + "="*70 + "\n")

# Analysis function
def analyze_categorical_variable(series, var_name):
    cardinality = series.nunique()

    if cardinality <= 10:
        card_level = "Low"
    elif cardinality <= 50:
        card_level = "Medium"
    else:
        card_level = "High"

    print(f"{var_name}:")
    print(f"  Cardinality: {cardinality} ({card_level})")
    print(f"  Unique values: {list(series.unique())}")
    print()

print("Cardinality Analysis:")
print("-"*70)
for col in df.columns[1:]:  # Skip customer_id
    analyze_categorical_variable(df[col], col)
```

## Decision Tree: Choosing Encoding Method

```
START: Analyze your categorical variable
│
├─ Is there a natural order?
│  │
│  ├─ YES → ORDINAL Variable
│  │         └─ Use: Ordinal Encoding
│  │
│  └─ NO → NOMINAL Variable
│            │
│            ├─ Cardinality < 10?
│            │  └─ YES → Use: One-Hot Encoding
│            │
│            ├─ Cardinality 10-50?
│            │  └─ YES → Use: Binary or Target Encoding
│            │
│            └─ Cardinality > 50?
│               └─ YES → Use: Target or Frequency Encoding
```

## Quick Reference Guide

```python
# Quick decision helper
def recommend_encoding(variable_name, values, has_order=False):
    """
    Recommend encoding method based on variable characteristics
    """
    cardinality = len(set(values))

    if has_order:
        return f"{variable_name}: Use ORDINAL ENCODING (ordered variable)"
    elif cardinality <= 10:
        return f"{variable_name}: Use ONE-HOT ENCODING (low cardinality)"
    elif cardinality <= 50:
        return f"{variable_name}: Use BINARY or TARGET ENCODING (medium cardinality)"
    else:
        return f"{variable_name}: Use TARGET or FREQUENCY ENCODING (high cardinality)"

# Examples
print(recommend_encoding("gender", ['M', 'F'], has_order=False))
print(recommend_encoding("education", ['HS', 'Bachelor', 'Master', 'PhD'], has_order=True))
print(recommend_encoding("city", ['City_' + str(i) for i in range(100)], has_order=False))
```

## Summary

Understanding your categorical variables is the first step to successful encoding:

1. **Identify the type**: Is it nominal (no order) or ordinal (has order)?
2. **Check cardinality**: How many unique categories exist?
3. **Choose method**: Use the decision tree to select the right encoding technique
4. **Validate**: Always verify your encoded data makes sense

## What's Next?

Now that you understand the fundamentals, dive into specific encoding techniques:

- **One-Hot Encoding**: Perfect for low-cardinality nominal variables
- **Ordinal Encoding**: Essential for ordered categorical data
- **Target Encoding**: Powerful for high-cardinality features
- **Binary Encoding**: Space-efficient alternative to one-hot
- **Frequency Encoding**: When category frequency matters

---

**Navigation:**
- **Next:** [One-Hot Encoding →](./encoding-onehot.md)
- **Back to:** [Feature Engineering Index](./README.md)
