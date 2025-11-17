# Encoding Categorical Features - Complete Guide

## Table of Contents
1. [Introduction](#introduction)
2. [One-Hot Encoding](#one-hot-encoding)
3. [Ordinal Encoding](#ordinal-encoding)
4. [Target Encoding](#target-encoding)
5. [Binary Encoding](#binary-encoding)
6. [Frequency Encoding](#frequency-encoding)
7. [Mean Encoding](#mean-encoding)
8. [Comparison Table](#comparison-table)
9. [Decision Framework](#decision-framework)
10. [Common Mistakes](#common-mistakes)
11. [Interview Questions](#interview-questions)

---

## Introduction

### Why Encode Categorical Features?

Machine learning algorithms work with numbers, not text or categories. Encoding converts categorical data into numerical format.

```
Raw Data          Encoded Data
─────────────  →  ─────────────
"Red"             [1, 0, 0]
"Green"           [0, 1, 0]
"Blue"            [0, 0, 1]
```

### Types of Categorical Variables

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

---

## One-Hot Encoding

### Concept
Creates binary columns for each category. Each observation gets 1 in its category column and 0 in others.

### Visual Example
```
Original Data:
┌──────┬────────┐
│ ID   │ Color  │
├──────┼────────┤
│ 1    │ Red    │
│ 2    │ Blue   │
│ 3    │ Green  │
│ 4    │ Red    │
└──────┴────────┘

After One-Hot Encoding:
┌──────┬──────────┬───────────┬────────────┐
│ ID   │ Color_Red│ Color_Blue│ Color_Green│
├──────┼──────────┼───────────┼────────────┤
│ 1    │    1     │     0     │      0     │
│ 2    │    0     │     1     │      0     │
│ 3    │    0     │     0     │      1     │
│ 4    │    1     │     0     │      0     │
└──────┴──────────┴───────────┴────────────┘
```

### Python Implementation

#### Method 1: Pandas get_dummies
```python
import pandas as pd
import numpy as np

# Sample data
df = pd.DataFrame({
    'customer_id': [1, 2, 3, 4, 5],
    'city': ['NYC', 'LA', 'Chicago', 'NYC', 'LA'],
    'product': ['Phone', 'Laptop', 'Tablet', 'Phone', 'Laptop']
})

print("Original Data:")
print(df)
print("\n" + "="*50 + "\n")

# One-Hot Encoding
df_encoded = pd.get_dummies(df, columns=['city', 'product'], prefix=['city', 'prod'])

print("After One-Hot Encoding:")
print(df_encoded)
print(f"\nOriginal columns: {df.shape[1]}")
print(f"Encoded columns: {df_encoded.shape[1]}")
```

**Output:**
```
Original Data:
   customer_id     city  product
0            1      NYC    Phone
1            2       LA   Laptop
2            3  Chicago   Tablet
3            4      NYC    Phone
4            5       LA   Laptop

==================================================

After One-Hot Encoding:
   customer_id  city_Chicago  city_LA  city_NYC  prod_Laptop  prod_Phone  prod_Tablet
0            1             0        0         1            0           1            0
1            2             0        1         0            1           0            0
2            3             1        0         0            0           0            1
3            4             0        0         1            0           1            0
4            5             0        1         0            1           0            0

Original columns: 3
Encoded columns: 7
```

#### Method 2: Scikit-learn OneHotEncoder
```python
from sklearn.preprocessing import OneHotEncoder
import pandas as pd

# Sample data
data = pd.DataFrame({
    'city': ['NYC', 'LA', 'Chicago', 'NYC', 'LA']
})

# Create encoder
encoder = OneHotEncoder(sparse_output=False, drop=None)

# Fit and transform
encoded = encoder.fit_transform(data[['city']])

# Create DataFrame with proper column names
encoded_df = pd.DataFrame(
    encoded,
    columns=encoder.get_feature_names_out(['city'])
)

print("Encoded Data:")
print(encoded_df)
print(f"\nCategories found: {encoder.categories_}")
```

**Output:**
```
Encoded Data:
   city_Chicago  city_LA  city_NYC
0           0.0      0.0       1.0
1           0.0      1.0       0.0
2           1.0      0.0       0.0
3           0.0      0.0       1.0
4           0.0      1.0       0.0

Categories found: [array(['Chicago', 'LA', 'NYC'], dtype=object)]
```

### Real-World Example: Customer Segmentation

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier

# Customer data
df = pd.DataFrame({
    'age': [25, 35, 45, 28, 52],
    'city': ['NYC', 'LA', 'Chicago', 'NYC', 'Houston'],
    'product_type': ['Electronics', 'Clothing', 'Electronics', 'Food', 'Clothing'],
    'churned': [0, 1, 0, 0, 1]
})

# Separate features and target
X = df.drop('churned', axis=1)
y = df['churned']

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Create transformer for categorical columns
categorical_features = ['city', 'product_type']
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ],
    remainder='passthrough'  # Keep other columns as is
)

# Fit on training data
X_train_encoded = preprocessor.fit_transform(X_train)
X_test_encoded = preprocessor.transform(X_test)

print("Training data shape after encoding:", X_train_encoded.shape)
print("Test data shape after encoding:", X_test_encoded.shape)
```

### Advantages
✅ No ordinal relationship implied
✅ Works well with linear models
✅ Easy to interpret
✅ Handles nominal categories perfectly

### Disadvantages
❌ Creates many columns (curse of dimensionality)
❌ Not suitable for high cardinality (>10 categories)
❌ Sparse matrices consume memory
❌ Can cause multicollinearity

### When to Use
- **Cardinality**: Low (< 10 unique values)
- **Model Type**: Linear models, Neural Networks
- **Variable Type**: Nominal categories
- **Example Use Cases**:
  - Gender (Male/Female)
  - Payment Method (Card/Cash/UPI)
  - Product Category (3-5 categories)

---

## Ordinal Encoding

### Concept
Assigns integer values to categories based on their order or rank.

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

### Python Implementation

#### Method 1: Manual Mapping
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

**Output:**
```
Original Data:
  customer    education satisfaction
0        A     Bachelor         Good
1        B          PhD    Excellent
2        C  High School         Poor
3        D       Master         Fair
4        E     Bachelor         Good

==================================================

After Ordinal Encoding:
  customer    education satisfaction  education_encoded  satisfaction_encoded
0        A     Bachelor         Good                  1                     2
1        B          PhD    Excellent                  3                     3
2        C  High School         Poor                  0                     0
3        D       Master         Fair                  2                     1
4        E     Bachelor         Good                  1                     2
```

#### Method 2: Scikit-learn OrdinalEncoder
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

**Output:**
```
Original Data:
     size priority
0   Small      Low
1   Large     High
2  Medium   Medium
3   Small      Low
4   Large     High

==================================================

After Ordinal Encoding:
   size  priority
0   0.0       0.0
1   2.0       2.0
2   1.0       1.0
3   0.0       0.0
4   2.0       2.0

Mapping:
Size: {'Small': 0, 'Medium': 1, 'Large': 2}
Priority: {'Low': 0, 'Medium': 1, 'High': 2}
```

### Real-World Example: Credit Risk Assessment

```python
import pandas as pd
from sklearn.preprocessing import OrdinalEncoder
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split

# Credit application data
df = pd.DataFrame({
    'education': ['High School', 'Bachelor', 'Master', 'Bachelor', 'PhD'],
    'income_level': ['Low', 'Medium', 'High', 'Medium', 'High'],
    'credit_rating': ['Poor', 'Fair', 'Good', 'Fair', 'Excellent'],
    'loan_approved': [0, 1, 1, 1, 1]
})

print("Credit Application Data:")
print(df)
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
print(X_encoded_df)

# Now ready for modeling
print("\nReady for model training!")
print(f"Shape: {X_encoded_df.shape}")
```

### Advantages
✅ Preserves ordinal relationship
✅ Compact representation (1 column)
✅ Works well with tree-based models
✅ Memory efficient

### Disadvantages
❌ Assumes equal intervals between categories
❌ Can mislead linear models
❌ Requires domain knowledge for ordering

### When to Use
- **Variable Type**: Ordinal categories with clear order
- **Model Type**: Tree-based models (Random Forest, XGBoost)
- **Example Use Cases**:
  - Education Level
  - T-shirt Size (S, M, L, XL)
  - Customer Satisfaction (Poor to Excellent)
  - Economic Class (Lower, Middle, Upper)

---

## Target Encoding

### Concept
Replaces each category with the mean of the target variable for that category. Also called Mean Target Encoding.

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

### Python Implementation

#### Method 1: Manual Implementation
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
print("\n" + "="*50 + "\n")

# Calculate mean target for each category
target_mean = df.groupby('city')['churned'].mean()
print("Target Mean by City:")
print(target_mean)
print("\n" + "="*50 + "\n")

# Map to original dataframe
df['city_encoded'] = df['city'].map(target_mean)

print("After Target Encoding:")
print(df)

# Compare with global mean
global_mean = df['churned'].mean()
print(f"\nGlobal churn rate: {global_mean:.2f}")
print("\nCity-specific churn rates:")
print(target_mean)
```

**Output:**
```
Original Data:
      city  age  churned
0      NYC   25        1
1       LA   30        0
2      NYC   35        0
3  Chicago   28        1
4       LA   45        0
5      NYC   32        1
6  Chicago   38        1

==================================================

Target Mean by City:
city
Chicago    1.00
LA         0.00
NYC        0.67
Name: churned, dtype: float64

==================================================

After Target Encoding:
      city  age  churned  city_encoded
0      NYC   25        1          0.67
1       LA   30        0          0.00
2      NYC   35        0          0.67
3  Chicago   28        1          1.00
4       LA   45        0          0.00
5      NYC   32        1          0.67
6  Chicago   38        1          1.00

Global churn rate: 0.57

City-specific churn rates:
city
Chicago    1.00
LA         0.00
NYC        0.67
Name: churned, dtype: float64
```

#### Method 2: Using category_encoders
```python
from category_encoders import TargetEncoder
import pandas as pd
from sklearn.model_selection import train_test_split

# Sample data
df = pd.DataFrame({
    'product': ['A', 'B', 'A', 'C', 'B', 'A', 'C', 'B'],
    'region': ['North', 'South', 'North', 'East', 'South', 'West', 'East', 'North'],
    'sales': [100, 200, 150, 300, 180, 120, 280, 210]
})

print("Original Data:")
print(df)
print("\n" + "="*50 + "\n")

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
print(X_train_encoded)
print("\nTest Data - Encoded:")
print(X_test_encoded)
```

### Preventing Overfitting: Cross-Validation Approach

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
    'city': ['NYC', 'LA', 'Chicago', 'NYC', 'LA', 'Chicago', 'NYC', 'LA'] * 3,
    'churned': [1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0]
})

df['city_encoded_cv'] = target_encode_cv(df, 'city', 'churned', n_folds=5)

print("Target Encoding with Cross-Validation:")
print(df.head(10))
```

### Real-World Example: High-Cardinality Encoding

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
print("\n" + "="*50 + "\n")

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

### Advantages
✅ Handles high cardinality effectively
✅ Captures relationship with target
✅ Single column output (memory efficient)
✅ Often improves model performance

### Disadvantages
❌ Risk of overfitting (data leakage)
❌ Requires target variable
❌ Needs careful cross-validation
❌ Can't use for unseen categories directly

### When to Use
- **Cardinality**: High (> 10 unique values)
- **Model Type**: Tree-based models
- **Data Size**: Large datasets
- **Example Use Cases**:
  - ZIP codes (thousands of values)
  - User IDs (millions of values)
  - Product SKUs
  - City names (hundreds of cities)

---

## Binary Encoding

### Concept
Converts categories to binary digits. More compact than one-hot for high cardinality.

### Visual Example
```
Original Categories:
┌────┬──────────┐
│ ID │ Category │
├────┼──────────┤
│ 1  │    A     │
│ 2  │    B     │
│ 3  │    C     │
│ 4  │    D     │
│ 5  │    E     │
└────┴──────────┘

Step 1: Ordinal Encoding:
A→0, B→1, C→2, D→3, E→4

Step 2: Binary Conversion:
0 → 000
1 → 001
2 → 010
3 → 011
4 → 100

Final Binary Encoding:
┌────┬──────────┬──────┬──────┬──────┐
│ ID │ Category │ Bit_0│ Bit_1│ Bit_2│
├────┼──────────┼──────┼──────┼──────┤
│ 1  │    A     │  0   │  0   │  0   │
│ 2  │    B     │  1   │  0   │  0   │
│ 3  │    C     │  0   │  1   │  0   │
│ 4  │    D     │  1   │  1   │  0   │
│ 5  │    E     │  0   │  0   │  1   │
└────┴──────────┴──────┴──────┴──────┘

Comparison:
- 5 categories
- One-Hot: 5 columns
- Binary: 3 columns (log2(5) = 2.32 → 3)
```

### Python Implementation

```python
from category_encoders import BinaryEncoder
import pandas as pd
import numpy as np

# Sample data with moderate cardinality
df = pd.DataFrame({
    'product_id': ['P001', 'P002', 'P003', 'P004', 'P005', 'P006', 'P007', 'P008'],
    'sales': [100, 150, 200, 180, 220, 160, 190, 210]
})

print("Original Data:")
print(df)
print("\n" + "="*50 + "\n")

# Create binary encoder
encoder = BinaryEncoder(cols=['product_id'])

# Fit and transform
df_encoded = encoder.fit_transform(df)

print("After Binary Encoding:")
print(df_encoded)
print(f"\nOriginal: 1 column with {df['product_id'].nunique()} categories")
print(f"Binary: {df_encoded.shape[1] - 1} binary columns")

# Calculate efficiency
n_categories = df['product_id'].nunique()
onehot_cols = n_categories
binary_cols = int(np.ceil(np.log2(n_categories)))

print(f"\nEfficiency Comparison:")
print(f"One-Hot Encoding: {onehot_cols} columns")
print(f"Binary Encoding: {binary_cols} columns")
print(f"Space saved: {((onehot_cols - binary_cols) / onehot_cols * 100):.1f}%")
```

### Real-World Example: Product Catalog

```python
import pandas as pd
import numpy as np
from category_encoders import BinaryEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# Create product catalog with 50 products
np.random.seed(42)
products = [f'SKU_{str(i).zfill(4)}' for i in range(1, 51)]

df = pd.DataFrame({
    'product_sku': np.random.choice(products, 500),
    'price': np.random.uniform(10, 500, 500),
    'discount': np.random.uniform(0, 0.3, 500),
    'rating': np.random.uniform(3, 5, 500),
    'sales_volume': np.random.randint(10, 1000, 500)
})

print(f"Dataset shape: {df.shape}")
print(f"Number of unique products: {df['product_sku'].nunique()}")
print("\n" + "="*50 + "\n")

# Split data
X = df.drop('sales_volume', axis=1)
y = df['sales_volume']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Apply binary encoding
encoder = BinaryEncoder(cols=['product_sku'])
X_train_encoded = encoder.fit_transform(X_train)
X_test_encoded = encoder.transform(X_test)

print("Encoded Training Data:")
print(X_train_encoded.head())
print(f"\nShape: {X_train_encoded.shape}")

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train_encoded, y_train)

predictions = model.predict(X_test_encoded)
rmse = np.sqrt(mean_squared_error(y_test, predictions))

print(f"\nModel RMSE: {rmse:.2f}")
print(f"\nBinary encoding created {len([col for col in X_train_encoded.columns if 'product' in col])} columns")
print(f"One-Hot would have created {df['product_sku'].nunique()} columns!")
```

### Advantages
✅ More compact than one-hot
✅ Handles moderate cardinality well
✅ Less sparse than one-hot
✅ Works with tree and linear models

### Disadvantages
❌ Creates artificial ordinality
❌ Less interpretable than one-hot
❌ Not always better than other methods

### When to Use
- **Cardinality**: Moderate (10-100 unique values)
- **Model Type**: Any
- **Example Use Cases**:
  - Product SKUs (50-100 products)
  - Department codes
  - Store IDs

---

## Frequency Encoding

### Concept
Replaces each category with its frequency (count or percentage) in the dataset.

### Visual Example
```
Original Data:
┌────┬─────────┐
│ ID │  City   │
├────┼─────────┤
│ 1  │  NYC    │
│ 2  │  LA     │
│ 3  │  NYC    │
│ 4  │  NYC    │
│ 5  │  Chicago│
│ 6  │  LA     │
└────┴─────────┘

Frequency Count:
┌─────────┬───────┬────────────┐
│  City   │ Count │ Percentage │
├─────────┼───────┼────────────┤
│  NYC    │   3   │   50.0%    │
│  LA     │   2   │   33.3%    │
│  Chicago│   1   │   16.7%    │
└─────────┴───────┴────────────┘

After Frequency Encoding:
┌────┬─────────┬─────────────┬──────────────────┐
│ ID │  City   │ City_Count  │ City_Percentage  │
├────┼─────────┼─────────────┼──────────────────┤
│ 1  │  NYC    │      3      │      0.500       │
│ 2  │  LA     │      2      │      0.333       │
│ 3  │  NYC    │      3      │      0.500       │
│ 4  │  NYC    │      3      │      0.500       │
│ 5  │  Chicago│      1      │      0.167       │
│ 6  │  LA     │      2      │      0.333       │
└────┴─────────┴─────────────┴──────────────────┘
```

### Python Implementation

```python
import pandas as pd
import numpy as np

# Sample data
df = pd.DataFrame({
    'customer_id': range(1, 11),
    'city': ['NYC', 'LA', 'NYC', 'Chicago', 'NYC',
             'LA', 'Houston', 'NYC', 'LA', 'Chicago']
})

print("Original Data:")
print(df)
print("\n" + "="*50 + "\n")

# Method 1: Count frequency
frequency_map = df['city'].value_counts().to_dict()
df['city_frequency'] = df['city'].map(frequency_map)

print("Frequency Map:")
print(frequency_map)
print("\n" + "="*50 + "\n")

# Method 2: Percentage frequency
percentage_map = (df['city'].value_counts(normalize=True) * 100).to_dict()
df['city_percentage'] = df['city'].map(percentage_map)

print("After Frequency Encoding:")
print(df)

# Sort by frequency to see pattern
print("\n" + "="*50 + "\n")
print("Sorted by Frequency:")
print(df.sort_values('city_frequency', ascending=False))
```

**Output:**
```
Original Data:
   customer_id     city
0            1      NYC
1            2       LA
2            3      NYC
3            4  Chicago
4            5      NYC
5            6       LA
6            7  Houston
7            8      NYC
8            9       LA
9           10  Chicago

==================================================

Frequency Map:
{'NYC': 4, 'LA': 3, 'Chicago': 2, 'Houston': 1}

==================================================

After Frequency Encoding:
   customer_id     city  city_frequency  city_percentage
0            1      NYC               4             40.0
1            2       LA               3             30.0
2            3      NYC               4             40.0
3            4  Chicago               2             20.0
4            5      NYC               4             40.0
5            6       LA               3             30.0
6            7  Houston               1             10.0
7            8      NYC               4             40.0
8            9       LA               3             30.0
9           10  Chicago               2             20.0

==================================================

Sorted by Frequency:
   customer_id     city  city_frequency  city_percentage
0            1      NYC               4             40.0
2            3      NYC               4             40.0
4            5      NYC               4             40.0
7            8      NYC               4             40.0
1            2       LA               3             30.0
5            6       LA               3             30.0
8            9       LA               3             30.0
3            4  Chicago               2             20.0
9           10  Chicago               2             20.0
6            7  Houston               1             10.0
```

### Real-World Example: Customer Behavior Analysis

```python
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Generate customer data
np.random.seed(42)

# Cities with different frequencies (realistic distribution)
cities = np.random.choice(
    ['NYC', 'LA', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
     'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
    size=1000,
    p=[0.25, 0.20, 0.15, 0.10, 0.08, 0.07, 0.06, 0.04, 0.03, 0.02]
)

df = pd.DataFrame({
    'city': cities,
    'age': np.random.randint(18, 70, 1000),
    'income': np.random.randint(30000, 150000, 1000)
})

# Target: People in popular cities are more likely to buy
city_freq = df['city'].value_counts(normalize=True)
df['purchased'] = df['city'].map(city_freq).apply(
    lambda x: np.random.binomial(1, min(x * 2, 0.8))
)

print("Dataset Info:")
print(f"Shape: {df.shape}")
print(f"\nCity Distribution:")
print(df['city'].value_counts())
print(f"\nPurchase Rate: {df['purchased'].mean():.2%}")
print("\n" + "="*50 + "\n")

# Apply frequency encoding
city_frequency = df['city'].value_counts().to_dict()
df['city_frequency'] = df['city'].map(city_frequency)

# Normalize frequency to 0-1 range
df['city_frequency_norm'] = df['city_frequency'] / df['city_frequency'].max()

print("After Frequency Encoding:")
print(df.head(10))
print("\n" + "="*50 + "\n")

# Train model
X = df[['age', 'income', 'city_frequency_norm']]
y = df['purchased']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

predictions = model.predict(X_test)

print("Classification Report:")
print(classification_report(y_test, predictions))

print("\nFeature Importance:")
feature_importance = pd.DataFrame({
    'feature': X.columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)
print(feature_importance)
```

### Advantages
✅ Simple and fast
✅ Captures category popularity
✅ Single column output
✅ Works with any cardinality

### Disadvantages
❌ Different categories can have same frequency
❌ Doesn't capture category-target relationship
❌ Can lose information

### When to Use
- **Cardinality**: Any
- **Use Case**: When frequency itself is informative
- **Example Use Cases**:
  - Popular products (frequency indicates popularity)
  - Common cities (frequency indicates market size)
  - Frequent error codes

---

## Mean Encoding

### Concept
Similar to target encoding but uses mean of any numerical feature (not just target).

### Visual Example
```
Calculate mean income by city:

┌────┬─────────┬────────┐
│ ID │  City   │ Income │
├────┼─────────┼────────┤
│ 1  │  NYC    │ 80000  │
│ 2  │  LA     │ 70000  │
│ 3  │  NYC    │ 90000  │
│ 4  │  Chicago│ 60000  │
│ 5  │  LA     │ 75000  │
└────┴─────────┴────────┘

Mean Income by City:
NYC: 85000
LA: 72500
Chicago: 60000

After Mean Encoding:
┌────┬─────────┬────────┬──────────────────┐
│ ID │  City   │ Income │ City_Mean_Income │
├────┼─────────┼────────┼──────────────────┤
│ 1  │  NYC    │ 80000  │     85000        │
│ 2  │  LA     │ 70000  │     72500        │
│ 3  │  NYC    │ 90000  │     85000        │
│ 4  │  Chicago│ 60000  │     60000        │
│ 5  │  LA     │ 75000  │     72500        │
└────┴─────────┴────────┴──────────────────┘
```

### Python Implementation

```python
import pandas as pd
import numpy as np

# Sample data
df = pd.DataFrame({
    'employee_id': range(1, 11),
    'department': ['Sales', 'IT', 'Sales', 'HR', 'IT',
                   'Sales', 'HR', 'IT', 'Sales', 'HR'],
    'salary': [50000, 80000, 55000, 45000, 85000,
               52000, 48000, 82000, 53000, 47000],
    'years_experience': [2, 5, 3, 2, 6, 3, 2, 5, 3, 2]
})

print("Original Data:")
print(df)
print("\n" + "="*50 + "\n")

# Mean encoding for salary by department
dept_mean_salary = df.groupby('department')['salary'].mean()
df['dept_mean_salary'] = df['department'].map(dept_mean_salary)

# Mean encoding for experience by department
dept_mean_exp = df.groupby('department')['years_experience'].mean()
df['dept_mean_experience'] = df['department'].map(dept_mean_exp)

print("After Mean Encoding:")
print(df)

print("\n" + "="*50 + "\n")
print("Department Statistics:")
stats = df.groupby('department').agg({
    'salary': ['mean', 'min', 'max'],
    'years_experience': ['mean', 'min', 'max']
})
print(stats)
```

---

## Comparison Table

### Technique Comparison

```
┌─────────────────┬─────────────┬───────────────┬────────────┬─────────────┬──────────────┐
│ Technique       │ Cardinality │ Output Cols   │ Model Type │ Complexity  │ Leakage Risk │
├─────────────────┼─────────────┼───────────────┼────────────┼─────────────┼──────────────┤
│ One-Hot         │ Low (<10)   │ n_categories  │ All        │ Low         │ No           │
│ Ordinal         │ Any         │ 1             │ Tree-based │ Low         │ No           │
│ Target          │ High (>10)  │ 1             │ Tree-based │ High        │ Yes          │
│ Binary          │ Medium      │ log2(n)       │ All        │ Medium      │ No           │
│ Frequency       │ Any         │ 1             │ All        │ Low         │ No           │
│ Mean            │ Any         │ 1             │ All        │ Medium      │ Possible     │
└─────────────────┴─────────────┴───────────────┴────────────┴─────────────┴──────────────┘
```

### Performance Comparison

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from category_encoders import TargetEncoder, BinaryEncoder

# Generate sample data
np.random.seed(42)
n_samples = 1000
categories = [f'Cat_{i}' for i in range(20)]

df = pd.DataFrame({
    'category': np.random.choice(categories, n_samples),
    'feature1': np.random.randn(n_samples),
    'feature2': np.random.randn(n_samples)
})

# Create target with some relationship to category
cat_effect = {cat: np.random.uniform(-1, 1) for cat in categories}
df['target'] = (
    df['category'].map(cat_effect) +
    df['feature1'] * 0.5 +
    df['feature2'] * 0.3 +
    np.random.randn(n_samples) * 0.1
) > 0
df['target'] = df['target'].astype(int)

# Test different encodings
results = {}

# 1. One-Hot Encoding
from sklearn.compose import ColumnTransformer

onehot_transformer = ColumnTransformer(
    [('onehot', OneHotEncoder(drop='first'), ['category'])],
    remainder='passthrough'
)
X_onehot = onehot_transformer.fit_transform(df[['category', 'feature1', 'feature2']])
score_onehot = cross_val_score(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X_onehot, df['target'], cv=5
).mean()
results['One-Hot'] = score_onehot

# 2. Target Encoding
target_enc = TargetEncoder()
X_target = df[['category', 'feature1', 'feature2']].copy()
X_target['category'] = target_enc.fit_transform(X_target['category'], df['target'])
score_target = cross_val_score(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X_target, df['target'], cv=5
).mean()
results['Target'] = score_target

# 3. Binary Encoding
binary_enc = BinaryEncoder()
X_binary = binary_enc.fit_transform(df[['category', 'feature1', 'feature2']])
score_binary = cross_val_score(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X_binary, df['target'], cv=5
).mean()
results['Binary'] = score_binary

# 4. Frequency Encoding
freq_map = df['category'].value_counts().to_dict()
X_freq = df[['category', 'feature1', 'feature2']].copy()
X_freq['category'] = X_freq['category'].map(freq_map)
score_freq = cross_val_score(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X_freq, df['target'], cv=5
).mean()
results['Frequency'] = score_freq

# Display results
print("\n" + "="*60)
print("ENCODING PERFORMANCE COMPARISON")
print("="*60 + "\n")

results_df = pd.DataFrame({
    'Encoding': list(results.keys()),
    'CV Score': list(results.values())
}).sort_values('CV Score', ascending=False)

print(results_df.to_string(index=False))
print("\n" + "="*60 + "\n")

# Visualize
max_score = max(results.values())
for encoding, score in sorted(results.items(), key=lambda x: x[1], reverse=True):
    bar_length = int((score / max_score) * 40)
    print(f"{encoding:12s} : {'█' * bar_length} {score:.4f}")
```

---

## Decision Framework

### Choosing the Right Encoding

```
START: What type of categorical variable?
│
├─ ORDINAL (has natural order)
│  │
│  └─► Use ORDINAL ENCODING
│      Example: Education levels, Ratings
│
├─ NOMINAL (no natural order)
│  │
│  ├─ Low Cardinality (<10 categories)
│  │  │
│  │  ├─ Linear Model?
│  │  │  └─► Use ONE-HOT ENCODING
│  │  │
│  │  └─ Tree-based Model?
│  │     └─► Use ONE-HOT or TARGET ENCODING
│  │
│  ├─ Medium Cardinality (10-50 categories)
│  │  │
│  │  ├─ Memory constraints?
│  │  │  └─► Use BINARY ENCODING
│  │  │
│  │  └─ No constraints?
│  │     └─► Use TARGET ENCODING
│  │
│  └─ High Cardinality (>50 categories)
│     │
│     ├─ Supervised learning?
│     │  └─► Use TARGET ENCODING
│     │
│     └─ Unsupervised learning?
│        └─► Use FREQUENCY or HASH ENCODING
```

### Decision Table

```python
import pandas as pd

decision_table = pd.DataFrame({
    'Scenario': [
        'Gender (M/F)',
        'Country (5 countries)',
        'City (100 cities)',
        'User ID (millions)',
        'Size (S/M/L/XL)',
        'Rating (1-5 stars)',
        'Color (10 colors)',
        'ZIP Code (thousands)'
    ],
    'Variable Type': [
        'Nominal',
        'Nominal',
        'Nominal',
        'Nominal',
        'Ordinal',
        'Ordinal',
        'Nominal',
        'Nominal'
    ],
    'Cardinality': [
        'Very Low',
        'Low',
        'High',
        'Very High',
        'Low',
        'Low',
        'Medium',
        'Very High'
    ],
    'Recommended Encoding': [
        'One-Hot',
        'One-Hot',
        'Target/Frequency',
        'Target/Hash',
        'Ordinal',
        'Ordinal',
        'One-Hot/Binary',
        'Target/Hash'
    ],
    'Alternative': [
        'Binary',
        'Binary',
        'Binary/Mean',
        'Embedding',
        'One-Hot',
        'One-Hot',
        'Target',
        'Frequency'
    ]
})

print("="*80)
print("ENCODING DECISION TABLE")
print("="*80)
print(decision_table.to_string(index=False))
```

---

## Common Mistakes

### ❌ Mistake 1: Data Leakage in Target Encoding

```python
# WRONG: Fitting on entire dataset
import pandas as pd
from category_encoders import TargetEncoder

df = pd.DataFrame({
    'city': ['NYC', 'LA', 'NYC', 'LA'],
    'target': [1, 0, 1, 0]
})

# DON'T DO THIS
encoder = TargetEncoder()
df['city_encoded'] = encoder.fit_transform(df['city'], df['target'])  # WRONG!

# CORRECT: Split first, then fit on train only
from sklearn.model_split import train_test_split

X = df[['city']]
y = df['target']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

encoder = TargetEncoder()
X_train_encoded = encoder.fit_transform(X_train, y_train)  # Fit on train
X_test_encoded = encoder.transform(X_test)  # Transform test
```

### ❌ Mistake 2: One-Hot Encoding High Cardinality

```python
# WRONG: One-hot encoding 1000 cities
import pandas as pd

df = pd.DataFrame({
    'city': [f'City_{i}' for i in range(1000)]
})

# This creates 1000 columns! Memory explosion!
df_encoded = pd.get_dummies(df, columns=['city'])  # DON'T DO THIS

print(f"Created {df_encoded.shape[1]} columns!")  # 1000 columns!

# CORRECT: Use target or frequency encoding for high cardinality
# Or use dimensionality reduction techniques
```

### ❌ Mistake 3: Not Handling Unknown Categories

```python
# WRONG: Not handling unseen categories in test
from sklearn.preprocessing import OneHotEncoder

train_data = pd.DataFrame({'city': ['NYC', 'LA', 'Chicago']})
test_data = pd.DataFrame({'city': ['NYC', 'Houston']})  # Houston is new!

encoder = OneHotEncoder()
encoder.fit(train_data)

# This will error!
try:
    encoded = encoder.transform(test_data)
except ValueError as e:
    print(f"Error: {e}")

# CORRECT: Use handle_unknown parameter
encoder = OneHotEncoder(handle_unknown='ignore')
encoder.fit(train_data)
encoded = encoder.transform(test_data)  # Works!
```

### ❌ Mistake 4: Treating Ordinal as Nominal

```python
# WRONG: One-hot encoding ordinal variable
education = pd.DataFrame({
    'education': ['High School', 'Bachelor', 'Master', 'PhD']
})

# This loses the ordering information
education_encoded = pd.get_dummies(education)  # WRONG for ordinal!

# CORRECT: Use ordinal encoding
from sklearn.preprocessing import OrdinalEncoder

encoder = OrdinalEncoder(
    categories=[['High School', 'Bachelor', 'Master', 'PhD']]
)
education_encoded = encoder.fit_transform(education)  # Preserves order
```

### ❌ Mistake 5: Not Normalizing Frequency Encoding

```python
# WRONG: Using raw counts without normalization
df = pd.DataFrame({
    'city': ['NYC'] * 1000 + ['SmallTown'] * 10
})

freq_map = df['city'].value_counts().to_dict()
df['city_encoded'] = df['city'].map(freq_map)

# NYC gets 1000, SmallTown gets 10 - huge scale difference!

# CORRECT: Normalize frequencies
freq_map_norm = (df['city'].value_counts() / len(df)).to_dict()
df['city_encoded_norm'] = df['city'].map(freq_map_norm)
# Now values are between 0 and 1
```

---

## Best Practices

### ✅ Practice 1: Always Use Pipeline

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
```

### ✅ Practice 2: Cross-Validation for Target Encoding

```python
from sklearn.model_selection import cross_val_score
from category_encoders import TargetEncoder

# Use cross-validation
encoder = TargetEncoder(cols=['city'])

# This prevents overfitting
scores = cross_val_score(
    estimator=Pipeline([
        ('encoder', encoder),
        ('classifier', RandomForestClassifier())
    ]),
    X=X_train,
    y=y_train,
    cv=5
)

print(f"Mean CV Score: {scores.mean():.4f}")
```

### ✅ Practice 3: Save and Reuse Encoders

```python
import pickle
from sklearn.preprocessing import OneHotEncoder

# Train and save encoder
encoder = OneHotEncoder(handle_unknown='ignore')
encoder.fit(X_train[['city']])

# Save encoder
with open('city_encoder.pkl', 'wb') as f:
    pickle.dump(encoder, f)

# Later, load and use
with open('city_encoder.pkl', 'rb') as f:
    loaded_encoder = pickle.load(f)

X_new_encoded = loaded_encoder.transform(X_new[['city']])
```

### ✅ Practice 4: Monitor Encoding Impact

```python
# Before encoding
print("Before Encoding:")
print(f"Shape: {X_train.shape}")
print(f"Memory: {X_train.memory_usage().sum() / 1024**2:.2f} MB")

# After encoding
X_train_encoded = encoder.fit_transform(X_train)

print("\nAfter Encoding:")
print(f"Shape: {X_train_encoded.shape}")
print(f"Memory: {X_train_encoded.memory_usage().sum() / 1024**2:.2f} MB")
print(f"Columns added: {X_train_encoded.shape[1] - X_train.shape[1]}")
```

---

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

```python
# Example
import pandas as pd
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder

# Nominal variable
colors = pd.DataFrame({'color': ['Red', 'Blue', 'Green']})

# One-Hot: Creates 3 columns
onehot = OneHotEncoder()
result_onehot = onehot.fit_transform(colors).toarray()
# [[1, 0, 0], [0, 1, 0], [0, 0, 1]]

# Ordinal variable
education = pd.DataFrame({'edu': ['HS', 'Bachelor', 'Master']})

# Ordinal: Creates 1 column
ordinal = OrdinalEncoder(categories=[['HS', 'Bachelor', 'Master']])
result_ordinal = ordinal.fit_transform(education)
# [[0], [1], [2]]
```

---

### Q2: How do you prevent data leakage in Target Encoding?

**Answer:**

Data leakage occurs when information from the test set influences training. For target encoding:

**Prevention Methods:**

1. **Split data first, encode after:**
```python
# Split first
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Fit encoder only on training data
encoder = TargetEncoder()
X_train_encoded = encoder.fit_transform(X_train, y_train)
X_test_encoded = encoder.transform(X_test)  # Use training statistics
```

2. **Use cross-validation:**
```python
from category_encoders import TargetEncoder

# Smoothing prevents overfitting on small categories
encoder = TargetEncoder(smoothing=1.0, min_samples_leaf=10)
```

3. **Add noise (smoothing):**
```python
# Blend category mean with global mean
encoded = alpha * category_mean + (1-alpha) * global_mean
```

---

### Q3: When would you use Binary Encoding over One-Hot Encoding?

**Answer:**

Use **Binary Encoding** when:

1. **Moderate to High Cardinality** (10-100 categories)
2. **Memory constraints**
3. **Need to avoid curse of dimensionality**

**Comparison:**

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

**Example:**
```python
from category_encoders import BinaryEncoder

# 50 product categories
products = [f'Product_{i}' for i in range(50)]

# Binary encoding
encoder = BinaryEncoder()
encoded = encoder.fit_transform(products)

print(f"Original categories: {len(products)}")
print(f"Encoded columns: {encoded.shape[1]}")  # Only 6 columns!
```

---

### Q4: How do you handle high-cardinality categorical features?

**Answer:**

Multiple strategies:

**1. Target Encoding:**
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

---

### Q5: What are the advantages and disadvantages of Target Encoding?

**Answer:**

**Advantages:**
✅ Handles high cardinality efficiently (single column)
✅ Captures relationship between category and target
✅ Often improves model performance
✅ Works well with tree-based models
✅ Memory efficient

**Disadvantages:**
❌ Risk of overfitting (especially with rare categories)
❌ Requires target variable (supervised only)
❌ Prone to data leakage if not done carefully
❌ Doesn't work for unseen categories without fallback
❌ Can be unstable for rare categories

**Mitigation Strategies:**
```python
# 1. Smoothing
from category_encoders import TargetEncoder

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

# 3. Regularization
# encoded = (sum_of_targets + prior*global_mean) / (count + prior)
```

---

## Summary

### Quick Reference Card

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

### Key Takeaways

1. **Choose based on cardinality and model type**
2. **Always split before encoding to prevent leakage**
3. **Use pipelines for reproducibility**
4. **Handle unknown categories gracefully**
5. **Monitor memory and dimensionality**
6. **Cross-validate target encoding**
7. **Document encoding choices**

---

**Next:** [Missing Values Handling →](./missing-values.md)

**Previous:** [← README](./README.md)
