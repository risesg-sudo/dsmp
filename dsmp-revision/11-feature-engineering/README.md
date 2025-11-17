# Feature Engineering - Comprehensive Revision Notes

## Overview
Feature engineering is the process of transforming raw data into meaningful features that improve machine learning model performance. It's often considered the most important step in the ML pipeline.

```
Raw Data → Feature Engineering → Better Features → Better Models
```

## Navigation Guide

### 1. [Encoding Techniques](./encoding-techniques.md)
Master all categorical encoding methods:
- One-Hot Encoding
- Ordinal Encoding
- Target Encoding
- Binary Encoding
- Frequency Encoding
- Mean Encoding

**When to use**: Working with categorical variables (colors, cities, categories)

---

### 2. [Missing Values Handling](./missing-values.md)
Complete guide to imputation strategies:
- Understanding MCAR, MAR, MNAR
- SimpleImputer (mean, median, mode)
- KNN Imputer
- Iterative Imputer
- Advanced techniques

**When to use**: Datasets with incomplete data (common in real-world scenarios)

---

### 3. [Scaling and Outlier Handling](./scaling-outliers.md)
Essential preprocessing techniques:
- StandardScaler, MinMaxScaler, RobustScaler
- Normalizer
- IQR method, Z-score
- Percentile capping

**When to use**: Before model training, especially for distance-based algorithms

---

### 4. [Feature Transformations](./transformations.md)
Advanced transformation techniques:
- Log transformation
- Square Root transformation
- Box-Cox transformation
- Yeo-Johnson transformation
- Power Transformer

**When to use**: Handling skewed distributions, making data more normal

---

### 5. [Feature Construction](./feature-construction.md)
Creating new features from existing ones:
- Polynomial features
- Interaction terms
- Domain-specific features
- Feature crosses

**When to use**: Capturing complex relationships between features

---

### 6. [Discretization Techniques](./discretization.md)
Converting continuous to categorical:
- Equal-width binning
- Quantile-based binning
- Custom binning
- K-means binning

**When to use**: Simplifying continuous variables, handling non-linear relationships

---

## Quick Reference: When to Use What?

```
┌─────────────────────────────────────────────────────────────┐
│                   FEATURE ENGINEERING                       │
│                      DECISION TREE                          │
└─────────────────────────────────────────────────────────────┘

Data Type?
│
├─ Categorical
│  ├─ Ordinal (order matters) → Ordinal Encoding
│  ├─ Nominal (no order)
│  │  ├─ Low cardinality (<10) → One-Hot Encoding
│  │  ├─ High cardinality (>10)
│  │  │  ├─ Tree-based model → Target/Mean Encoding
│  │  │  └─ Linear model → Frequency/Binary Encoding
│  │
│
├─ Numerical
│  ├─ Missing values? → See Missing Values Guide
│  ├─ Outliers? → See Outlier Handling
│  ├─ Skewed distribution? → Log/Box-Cox Transform
│  ├─ Different scales? → StandardScaler/MinMaxScaler
│  │
│
├─ Want to create new features?
│  ├─ Polynomial relationships → PolynomialFeatures
│  ├─ Interaction effects → Feature crosses
│  └─ Domain knowledge → Custom features
```

## The Feature Engineering Pipeline

```
Step 1: Understand Data
   ↓
Step 2: Handle Missing Values
   ↓
Step 3: Encode Categorical Variables
   ↓
Step 4: Handle Outliers (optional)
   ↓
Step 5: Transform Distributions (if needed)
   ↓
Step 6: Scale Features
   ↓
Step 7: Create New Features (optional)
   ↓
Step 8: Final Feature Selection
```

## Common Real-World Scenarios

### Scenario 1: Customer Churn Prediction
```python
Features to engineer:
- Age → Bin into age groups
- Income → Log transform (right-skewed)
- City → Target encoding (high cardinality)
- Usage_Hours → Polynomial features
- Last_Purchase_Days → Interaction with Total_Purchases
```

### Scenario 2: House Price Prediction
```python
Features to engineer:
- Area → Square root transform
- Location → One-hot encoding
- Age_of_House → Bin into categories
- Area × Bedrooms → Interaction feature
- Missing garage → Indicator variable
```

### Scenario 3: Credit Risk Assessment
```python
Features to engineer:
- Salary → Robust scaling (outliers present)
- Employment_Type → Ordinal encoding
- Credit_History → Multiple imputation
- Debt_to_Income → Custom feature (Debt/Income)
- Late_Payments → Frequency encoding
```

## Key Metrics to Remember

### Impact of Feature Engineering

| Metric | Before FE | After FE | Improvement |
|--------|-----------|----------|-------------|
| Accuracy | 75% | 87% | +12% |
| Training Time | 45s | 30s | -33% |
| Model Complexity | High | Medium | Reduced |

## Must-Know Concepts

### 1. **Feature Scaling**
- Required: KNN, SVM, Neural Networks, PCA, K-means
- Not required: Tree-based models (Decision Trees, Random Forest, XGBoost)

### 2. **Encoding Choice**
- One-Hot: Low cardinality (< 10 categories)
- Target: High cardinality + tree models
- Ordinal: When order exists

### 3. **Missing Value Strategy**
- MCAR: Any imputation method
- MAR: Advanced methods (KNN, Iterative)
- MNAR: Domain knowledge required

### 4. **Transformation Choice**
- Positive data only: Log, Box-Cox
- Any data: Yeo-Johnson, Square Root
- Normal distribution: None needed

## Interview Preparation

### Top 10 Questions
1. Difference between StandardScaler and MinMaxScaler?
2. When to use Target Encoding vs One-Hot Encoding?
3. How to handle missing values in time series?
4. What is Box-Cox transformation and when to use it?
5. How to detect and handle outliers?
6. Explain the curse of dimensionality in One-Hot Encoding
7. What is feature interaction and why is it important?
8. How to prevent data leakage during feature engineering?
9. Difference between binning and discretization?
10. How to handle categorical variables with high cardinality?

*Detailed answers in respective topic files*

## Best Practices

### ✅ DO
- Always split data before feature engineering
- Use cross-validation for target encoding
- Document all transformations
- Create reproducible pipelines (sklearn Pipeline)
- Check feature distributions before/after
- Test features incrementally

### ❌ DON'T
- Scale before train-test split (data leakage!)
- Use mean of entire dataset for imputation
- One-hot encode high cardinality variables
- Remove outliers without understanding domain
- Apply transformations blindly
- Forget to save fitted transformers

## Code Template: Complete Pipeline

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split

# Define feature types
numeric_features = ['age', 'income', 'credit_score']
categorical_features = ['city', 'employment_type']

# Create transformers
numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('encoder', OneHotEncoder(handle_unknown='ignore'))
])

# Combine transformers
preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, categorical_features)
    ])

# Create full pipeline
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier())
])

# Fit and predict (no data leakage!)
pipeline.fit(X_train, y_train)
predictions = pipeline.predict(X_test)
```

## Performance Comparison

### Impact of Different Techniques

```
Model Performance (Accuracy %)
────────────────────────────────────────────
No Feature Engineering        : ████████████░░░░░░░░ 60%
+ Missing Value Handling      : ██████████████░░░░░░ 70%
+ Proper Encoding             : ████████████████░░░░ 78%
+ Scaling                     : ██████████████████░░ 82%
+ Outlier Handling            : ███████████████████░ 85%
+ Feature Transformation      : ████████████████████ 87%
+ Feature Construction        : █████████████████████ 92%
────────────────────────────────────────────
```

## Tools and Libraries

### Essential Libraries
```python
import pandas as pd                    # Data manipulation
import numpy as np                     # Numerical operations
from sklearn.preprocessing import *    # Scalers, encoders
from sklearn.impute import *          # Imputers
from category_encoders import *       # Advanced encodings
import feature_engine                 # Feature engineering
```

### Useful Resources
- Scikit-learn documentation
- Feature-engine library
- Category-encoders library
- Kaggle feature engineering tutorials

## Summary Statistics

### Time Spent in ML Projects
```
Data Collection          : 25%
Feature Engineering      : 40% ← Most Important!
Model Selection          : 15%
Hyperparameter Tuning    : 15%
Deployment               : 5%
```

## Quick Formulas

### Standard Scaler
```
z = (x - μ) / σ
```

### Min-Max Scaler
```
x_scaled = (x - x_min) / (x_max - x_min)
```

### Robust Scaler
```
x_scaled = (x - median) / IQR
```

### Z-Score for Outliers
```
z = |x - μ| / σ
Outlier if |z| > 3
```

### IQR Method
```
Q1 = 25th percentile
Q3 = 75th percentile
IQR = Q3 - Q1
Lower bound = Q1 - 1.5 × IQR
Upper bound = Q3 + 1.5 × IQR
```

## Next Steps

1. Start with [Encoding Techniques](./encoding-techniques.md) if you're new
2. Jump to specific topics based on your needs
3. Practice with real datasets
4. Review interview questions
5. Build end-to-end pipelines

---

**Remember**: Good features beat fancy algorithms. Spend time understanding your data and engineering meaningful features!

*Happy Learning! 🚀*
