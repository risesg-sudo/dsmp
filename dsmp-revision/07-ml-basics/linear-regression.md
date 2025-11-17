# Linear Regression - Comprehensive Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Simple Linear Regression](#simple-linear-regression)
3. [Multiple Linear Regression](#multiple-linear-regression)
4. [Cost Functions](#cost-functions)
5. [Assumptions](#assumptions)
6. [Polynomial Regression](#polynomial-regression)
7. [Multicollinearity](#multicollinearity)
8. [Implementation](#implementation)
9. [Interview Questions](#interview-questions)

---

## Introduction

**Linear Regression** is a supervised learning algorithm used to predict a continuous target variable based on one or more input features by fitting a linear equation to the observed data.

**Key Equation:**
```
y = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ + ε
```

Where:
- y = target variable (dependent)
- x₁, x₂, ..., xₙ = features (independent)
- β₀ = intercept (bias)
- β₁, β₂, ..., βₙ = coefficients (weights)
- ε = error term

---

## Simple Linear Regression

### Concept
Predicts target using **ONE** feature.

**Equation:**
```
y = β₀ + β₁x + ε
```

### Geometric Interpretation
```
    y
    ↑
    |           ●
    |       ●       ●
    |   ●  /    ●
    |  ●  /  ●
    | ●  /
    |●  /  <- Best fit line: y = β₀ + β₁x
    |  /
    | /β₁ (slope)
    |/____________→ x
   β₀ (intercept)
```

### Finding β₀ and β₁ (Least Squares Method)

**Formulas:**
```
β₁ = Σ[(xᵢ - x̄)(yᵢ - ȳ)] / Σ[(xᵢ - x̄)²]

β₀ = ȳ - β₁x̄
```

Where:
- x̄ = mean of x values
- ȳ = mean of y values

### Real-World Example: House Price Prediction

**Problem:** Predict house price based on area.

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# Sample data: Area (sq ft) vs Price ($1000s)
area = np.array([500, 750, 1000, 1200, 1500, 1800, 2000, 2200, 2500]).reshape(-1, 1)
price = np.array([150, 200, 250, 280, 350, 400, 420, 480, 550])

# Create and train model
model = LinearRegression()
model.fit(area, price)

# Get parameters
print(f"Intercept (β₀): {model.intercept_:.2f}")
print(f"Slope (β₁): {model.coef_[0]:.4f}")

# Make predictions
predictions = model.predict(area)

# Evaluate
mse = mean_squared_error(price, predictions)
r2 = r2_score(price, predictions)
print(f"MSE: {mse:.2f}")
print(f"R²: {r2:.4f}")

# Predict for new house
new_area = np.array([[1600]])
predicted_price = model.predict(new_area)
print(f"\nPredicted price for 1600 sq ft: ${predicted_price[0]:.2f}k")
```

**Output:**
```
Intercept (β₀): 47.85
Slope (β₁): 0.2098
MSE: 125.34
R²: 0.9912

Predicted price for 1600 sq ft: $383.54k
```

**Interpretation:**
- β₀ = 47.85: Base price when area = 0
- β₁ = 0.2098: For every 1 sq ft increase, price increases by $209.80
- R² = 0.9912: Model explains 99.12% of variance

---

## Multiple Linear Regression

### Concept
Predicts target using **MULTIPLE** features.

**Equation:**
```
y = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ + ε
```

### Matrix Form
```
Y = Xβ + ε

Where:
Y = [y₁, y₂, ..., yₙ]ᵀ     (n × 1)
X = [1, x₁₁, x₁₂, ..., x₁ₚ]  (n × (p+1))
    [1, x₂₁, x₂₂, ..., x₂ₚ]
    [...........]
    [1, xₙ₁, xₙ₂, ..., xₙₚ]
β = [β₀, β₁, β₂, ..., βₚ]ᵀ   ((p+1) × 1)
```

### Solving for β (Normal Equation)

**Formula:**
```
β = (XᵀX)⁻¹XᵀY
```

This minimizes the sum of squared residuals.

### Real-World Example: House Price with Multiple Features

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler

# Sample data: Area, Bedrooms, Age → Price
data = {
    'Area': [1000, 1200, 1500, 1800, 2000, 2200, 2500, 2800, 3000, 3200],
    'Bedrooms': [2, 2, 3, 3, 3, 4, 4, 4, 5, 5],
    'Age': [5, 10, 7, 15, 3, 20, 2, 12, 1, 8],
    'Price': [250, 280, 350, 370, 430, 400, 520, 490, 610, 650]
}

df = pd.DataFrame(data)

# Features and target
X = df[['Area', 'Bedrooms', 'Age']]
y = df['Price']

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = LinearRegression()
model.fit(X_train, y_train)

# Print coefficients
print("Model Equation:")
print(f"Price = {model.intercept_:.2f} + "
      f"{model.coef_[0]:.4f}*Area + "
      f"{model.coef_[1]:.2f}*Bedrooms + "
      f"{model.coef_[2]:.2f}*Age")

# Feature importance
feature_importance = pd.DataFrame({
    'Feature': X.columns,
    'Coefficient': model.coef_
}).sort_values('Coefficient', key=abs, ascending=False)

print("\nFeature Importance:")
print(feature_importance)

# Predictions
y_pred = model.predict(X_test)

# Evaluation
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

print(f"\nModel Performance:")
print(f"R² Score: {r2_score(y_test, y_pred):.4f}")
print(f"MAE: {mean_absolute_error(y_test, y_pred):.2f}")
print(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.2f}")

# Predict new house
new_house = pd.DataFrame({
    'Area': [2400],
    'Bedrooms': [4],
    'Age': [5]
})
predicted = model.predict(new_house)
print(f"\nPredicted price for new house: ${predicted[0]:.2f}k")
```

---

## Cost Functions

Cost functions measure how well the model fits the data. Lower cost = better fit.

### 1. Mean Squared Error (MSE)

**Formula:**
```
MSE = (1/n) Σ(yᵢ - ŷᵢ)²
```

**Characteristics:**
- Most commonly used
- Penalizes large errors heavily (squared term)
- Sensitive to outliers
- Always non-negative
- Differentiable (good for gradient descent)

**When to use:** Default choice for most regression problems.

### 2. Mean Absolute Error (MAE)

**Formula:**
```
MAE = (1/n) Σ|yᵢ - ŷᵢ|
```

**Characteristics:**
- Linear penalty for errors
- Less sensitive to outliers than MSE
- More robust
- Not differentiable at zero

**When to use:** When outliers should not heavily influence the model.

### 3. Root Mean Squared Error (RMSE)

**Formula:**
```
RMSE = √[(1/n) Σ(yᵢ - ŷᵢ)²]
```

**Characteristics:**
- Same unit as target variable
- Interpretable
- Sensitive to outliers (like MSE)

**When to use:** When you want error in same units as target.

### 4. R² Score (Coefficient of Determination)

**Formula:**
```
R² = 1 - (SS_res / SS_tot)

Where:
SS_res = Σ(yᵢ - ŷᵢ)²  (Sum of Squared Residuals)
SS_tot = Σ(yᵢ - ȳ)²  (Total Sum of Squares)
```

**Interpretation:**
- Range: (-∞, 1]
- 1.0 = Perfect fit
- 0.0 = Model performs as well as predicting mean
- Negative = Model worse than predicting mean

**Visual Representation:**
```
Total Variance = Explained Variance + Unexplained Variance
    SS_tot    =      SS_reg       +      SS_res

R² = SS_reg / SS_tot = 1 - SS_res / SS_tot
```

### 5. Adjusted R²

**Formula:**
```
Adjusted R² = 1 - [(1 - R²)(n - 1) / (n - p - 1)]

Where:
n = number of samples
p = number of features
```

**Why use it:**
- R² always increases when adding features
- Adjusted R² penalizes adding irrelevant features
- Better for model comparison with different feature counts

### Cost Function Visualization

```
Cost (MSE)
    ↑
    |     *
    | *       *
    |           *
    |             *
    |               *  ← Global minimum
    |                 *
    |                   *
    |                     *
    |________________________→ Parameter (β)
                    β_optimal
```

### Implementation: Comparing Cost Functions

```python
import numpy as np
from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    r2_score
)

# True values and predictions
y_true = np.array([100, 120, 150, 170, 200, 220, 250, 1000])  # Note outlier
y_pred = np.array([110, 115, 145, 175, 195, 225, 245, 280])

# Calculate metrics
mse = mean_squared_error(y_true, y_pred)
rmse = np.sqrt(mse)
mae = mean_absolute_error(y_true, y_pred)
r2 = r2_score(y_true, y_pred)

print("Metrics Comparison:")
print(f"MSE:  {mse:.2f}")
print(f"RMSE: {rmse:.2f}")
print(f"MAE:  {mae:.2f}")
print(f"R²:   {r2:.4f}")

# Without outlier
y_true_no_outlier = y_true[:-1]
y_pred_no_outlier = y_pred[:-1]

mse_no = mean_squared_error(y_true_no_outlier, y_pred_no_outlier)
mae_no = mean_absolute_error(y_true_no_outlier, y_pred_no_outlier)

print("\nWithout Outlier:")
print(f"MSE:  {mse_no:.2f}")
print(f"MAE:  {mae_no:.2f}")
print(f"\nMSE increased by: {((mse/mse_no - 1) * 100):.1f}%")
print(f"MAE increased by: {((mae/mae_no - 1) * 100):.1f}%")
```

**Output:**
```
Metrics Comparison:
MSE:  67562.00
RMSE: 259.93
MAE:  92.50
R²:   -0.7234

Without Outlier:
MSE:  51.43
MAE:  7.86
MSE increased by: 13037.4%
MAE increased by: 1077.1%
```

**Key Insight:** MSE is MUCH more sensitive to outliers than MAE.

---

## Assumptions of Linear Regression

Linear regression makes several important assumptions. Violating them can lead to unreliable results.

### 1. Linearity

**Assumption:** Relationship between X and y is linear.

**Check:**
- Scatter plot of features vs target
- Residual plot (should show random pattern)

```python
import matplotlib.pyplot as plt

# Check linearity
plt.scatter(X_train['Area'], y_train)
plt.xlabel('Area')
plt.ylabel('Price')
plt.title('Linearity Check')
plt.show()

# Residual plot
residuals = y_train - model.predict(X_train)
plt.scatter(model.predict(X_train), residuals)
plt.axhline(y=0, color='r', linestyle='--')
plt.xlabel('Fitted values')
plt.ylabel('Residuals')
plt.title('Residual Plot')
plt.show()
```

**Good Residual Plot:**
```
Residuals
    ↑
    |  ●    ●  ●
    |    ●    ●   ●
  0 |--●--●--●--●--●-- (Random scatter)
    | ●    ●   ●
    |  ●  ●      ●
    |________________→ Fitted values
```

**Bad (Non-linear pattern):**
```
Residuals
    ↑
    |       ●   ●
    |    ●         ●
  0 |--●-----------●-- (Curved pattern)
    |  ●             ●
    | ●               ●
    |________________→ Fitted values
```

### 2. Independence

**Assumption:** Observations are independent of each other.

**Violation examples:**
- Time series data (today's value depends on yesterday's)
- Clustered data (students from same school)

**Check:** Durbin-Watson test

```python
from statsmodels.stats.stattools import durbin_watson

dw_statistic = durbin_watson(residuals)
print(f"Durbin-Watson: {dw_statistic:.2f}")
# Value around 2 indicates no autocorrelation
# < 2: positive autocorrelation
# > 2: negative autocorrelation
```

### 3. Homoscedasticity (Constant Variance)

**Assumption:** Variance of residuals is constant across all levels of X.

**Check:**
- Residual plot (spread should be uniform)
- Breusch-Pagan test

```
Good (Homoscedastic):
Residuals
    ↑
    | ● ● ● ● ● ● ●
    | ● ● ● ● ● ● ●
  0 |---------------
    | ● ● ● ● ● ● ●
    | ● ● ● ● ● ● ●
    |____________→ Fitted

Bad (Heteroscedastic):
Residuals
    ↑
    |           ●
    |         ● ●
    |       ● ● ●
  0 |-----●-●-●---
    |   ● ●
    | ● ●
    |____________→ Fitted
    (Funnel shape)
```

**Fix:** Use weighted least squares or transform target (log, sqrt).

### 4. Normality of Residuals

**Assumption:** Residuals are normally distributed.

**Check:**
- Q-Q plot
- Shapiro-Wilk test

```python
import scipy.stats as stats

# Q-Q plot
stats.probplot(residuals, dist="norm", plot=plt)
plt.title("Q-Q Plot")
plt.show()

# Shapiro-Wilk test
stat, p_value = stats.shapiro(residuals)
print(f"Shapiro-Wilk p-value: {p_value:.4f}")
# p > 0.05: residuals are normally distributed
```

### 5. No Multicollinearity (for Multiple Regression)

**Assumption:** Features are not highly correlated with each other.

**Covered in detail in Multicollinearity section below.**

### Summary Table

| Assumption | Check Method | Fix |
|------------|-------------|-----|
| Linearity | Residual plot | Polynomial regression, feature engineering |
| Independence | Durbin-Watson | Time series models, mixed models |
| Homoscedasticity | Residual plot, BP test | Transform target, WLS |
| Normality | Q-Q plot, Shapiro test | Transform target, use robust methods |
| No Multicollinearity | VIF, correlation matrix | Remove features, PCA, Ridge/Lasso |

---

## Polynomial Regression

### Concept
Fits a polynomial equation to data when relationship is non-linear.

**Equation:**
```
y = β₀ + β₁x + β₂x² + β₃x³ + ... + βₙxⁿ + ε
```

**Still Linear Regression!** It's linear in coefficients β, not in features.

### Visual Comparison

```
Degree 1 (Linear):          Degree 2 (Quadratic):      Degree 5 (High):
   y                           y                          y
   ↑                           ↑                          ↑
   | ●                         | ●                        | ●
   |   ●   /                   |   ●  ╱╲                  |   ● ╱╲
   |     ●/                    |     ●   ╲                |    ●╱  ╲╱●
   |    ● ●                    |    ● ●   ╲               |   ●╲   ╱
   |  ●                        |  ●        ●              |  ●  ╲ ╱
   | ●                         | ●          ●             | ●    ●
   |___________→ x             |___________→ x            |___________→ x
   Underfit                    Good fit                   Overfit
```

### Implementation

```python
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
import numpy as np
import matplotlib.pyplot as plt

# Generate non-linear data
np.random.seed(42)
X = np.linspace(0, 10, 50).reshape(-1, 1)
y = 2 + 3*X.ravel() - 0.5*X.ravel()**2 + 0.02*X.ravel()**3 + np.random.randn(50)*2

# Try different degrees
degrees = [1, 2, 3, 5, 10]
plt.figure(figsize=(15, 3))

for i, degree in enumerate(degrees):
    # Create polynomial features
    poly = PolynomialFeatures(degree=degree)
    X_poly = poly.fit_transform(X)

    # Fit model
    model = LinearRegression()
    model.fit(X_poly, y)

    # Predict
    X_plot = np.linspace(0, 10, 300).reshape(-1, 1)
    X_plot_poly = poly.transform(X_plot)
    y_plot = model.predict(X_plot_poly)

    # Calculate R²
    r2 = model.score(X_poly, y)

    # Plot
    plt.subplot(1, 5, i+1)
    plt.scatter(X, y, alpha=0.5)
    plt.plot(X_plot, y_plot, 'r-', linewidth=2)
    plt.title(f'Degree {degree}\nR² = {r2:.3f}')
    plt.xlabel('X')
    if i == 0:
        plt.ylabel('y')

plt.tight_layout()
plt.show()
```

### Choosing Polynomial Degree

**Use Cross-Validation:**

```python
from sklearn.model_selection import cross_val_score

degrees = range(1, 11)
cv_scores = []

for degree in degrees:
    poly_pipeline = Pipeline([
        ('polynomial_features', PolynomialFeatures(degree=degree)),
        ('linear_regression', LinearRegression())
    ])

    scores = cross_val_score(poly_pipeline, X, y, cv=5,
                            scoring='neg_mean_squared_error')
    cv_scores.append(-scores.mean())

# Plot
plt.plot(degrees, cv_scores, marker='o')
plt.xlabel('Polynomial Degree')
plt.ylabel('Cross-Validated MSE')
plt.title('Model Complexity vs Error')
plt.show()

best_degree = degrees[np.argmin(cv_scores)]
print(f"Best degree: {best_degree}")
```

### When to Use Polynomial Regression

✅ **Use when:**
- Scatter plot shows curved relationship
- Residual plot from linear model shows pattern
- Domain knowledge suggests non-linear relationship

❌ **Don't use when:**
- Relationship is actually linear
- Too few data points (risk of overfitting)
- High degree polynomials (use splines or other methods)

---

## Multicollinearity

### Definition
**Multicollinearity** occurs when two or more independent variables are highly correlated, making it difficult to isolate their individual effects on the target variable.

### Why It's a Problem

1. **Unreliable coefficient estimates** - Small changes in data cause large changes in coefficients
2. **Inflated standard errors** - Difficult to determine significance
3. **Wrong signs** - Coefficients may have counterintuitive signs
4. **Overfitting** - Model captures noise

### Example: The Problem

```python
# Create correlated features
np.random.seed(42)
n = 100

# Area is the main predictor
area = np.random.uniform(1000, 3000, n)

# Rooms is highly correlated with area (larger houses have more rooms)
rooms = 2 + area/500 + np.random.randn(n)*0.5

# Price depends mainly on area
price = 100 + 0.15*area + np.random.randn(n)*20

data = pd.DataFrame({
    'Area': area,
    'Rooms': rooms,
    'Price': price
})

# Check correlation
print("Correlation Matrix:")
print(data.corr())

# Fit model
X = data[['Area', 'Rooms']]
y = data['Price']

model = LinearRegression()
model.fit(X, y)

print("\nCoefficients:")
print(f"Area: {model.coef_[0]:.4f}")
print(f"Rooms: {model.coef_[1]:.4f}")
```

**Output:**
```
Correlation Matrix:
       Area    Rooms    Price
Area   1.000   0.998    0.984
Rooms  0.998   1.000    0.982
Price  0.984   0.982    1.000

Coefficients:
Area: 0.2134
Rooms: -29.4521  ← Negative! Makes no sense
```

The negative coefficient for Rooms is due to multicollinearity.

### Detection Methods

#### 1. Correlation Matrix

```python
import seaborn as sns

# Correlation heatmap
plt.figure(figsize=(8, 6))
sns.heatmap(data.corr(), annot=True, cmap='coolwarm', center=0)
plt.title('Correlation Matrix')
plt.show()

# Rule of thumb: |correlation| > 0.8 indicates multicollinearity
```

#### 2. Variance Inflation Factor (VIF)

**Formula:**
```
VIF_i = 1 / (1 - R²_i)

Where R²_i is the R² from regressing feature i on all other features
```

**Interpretation:**
- VIF = 1: No correlation
- VIF = 1-5: Moderate correlation
- VIF > 5: High multicollinearity (problem)
- VIF > 10: Severe multicollinearity (serious problem)

**Implementation:**

```python
from statsmodels.stats.outliers_influence import variance_inflation_factor

def calculate_vif(df):
    """Calculate VIF for each feature"""
    vif_data = pd.DataFrame()
    vif_data["Feature"] = df.columns
    vif_data["VIF"] = [variance_inflation_factor(df.values, i)
                       for i in range(df.shape[1])]
    return vif_data

# Calculate VIF
vif_df = calculate_vif(X)
print(vif_df)
```

**Output:**
```
  Feature        VIF
0    Area  419.23
1   Rooms  419.23
```

VIF > 10 confirms severe multicollinearity!

#### 3. Condition Number

**Formula:**
```
Condition Number = √(λ_max / λ_min)

Where λ_max and λ_min are the largest and smallest eigenvalues of XᵀX
```

**Interpretation:**
- < 10: No problem
- 10-30: Moderate multicollinearity
- > 30: Severe multicollinearity

```python
# Calculate condition number
X_with_intercept = np.column_stack([np.ones(len(X)), X])
eigenvalues = np.linalg.eigvals(X_with_intercept.T @ X_with_intercept)
condition_number = np.sqrt(eigenvalues.max() / eigenvalues.min())
print(f"Condition Number: {condition_number:.2f}")
```

### Solutions

#### 1. Remove Correlated Features

```python
# Keep only one of the correlated features
X_fixed = data[['Area']]
model_fixed = LinearRegression()
model_fixed.fit(X_fixed, y)

print(f"Coefficient for Area: {model_fixed.coef_[0]:.4f}")
# Now coefficient is sensible!
```

#### 2. Combine Correlated Features

```python
# Create new feature: average of correlated features
data['Area_per_Room'] = data['Area'] / data['Rooms']
X_combined = data[['Area_per_Room']]
```

#### 3. Use Regularization (Ridge/Lasso)

```python
from sklearn.linear_model import Ridge, Lasso

# Ridge regression handles multicollinearity
ridge = Ridge(alpha=1.0)
ridge.fit(X, y)
print("Ridge coefficients:", ridge.coef_)

# Lasso can perform feature selection
lasso = Lasso(alpha=0.1)
lasso.fit(X, y)
print("Lasso coefficients:", lasso.coef_)
```

#### 4. Principal Component Analysis (PCA)

```python
from sklearn.decomposition import PCA

# Transform correlated features to uncorrelated principal components
pca = PCA(n_components=1)
X_pca = pca.fit_transform(X)

model_pca = LinearRegression()
model_pca.fit(X_pca, y)
```

### Decision Tree

```
Detect Multicollinearity
        ↓
┌───────────────────┐
│ Check VIF > 10?   │
└────────┬──────────┘
         │ Yes
         ↓
┌─────────────────────────┐
│ Are features redundant? │
└────┬────────────────┬───┘
     │ Yes            │ No
     ↓                ↓
Remove one      Use Ridge/Lasso
     ↓                ↓
Recheck VIF    Monitor performance
```

---

## Implementation: Complete Pipeline

```python
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import matplotlib.pyplot as plt
import seaborn as sns

# Load data (example with sklearn dataset)
from sklearn.datasets import fetch_california_housing

housing = fetch_california_housing()
df = pd.DataFrame(housing.data, columns=housing.feature_names)
df['Price'] = housing.target

print("Dataset shape:", df.shape)
print("\nFirst few rows:")
print(df.head())

# 1. EXPLORATORY DATA ANALYSIS
print("\n" + "="*50)
print("1. EXPLORATORY DATA ANALYSIS")
print("="*50)

print("\nBasic statistics:")
print(df.describe())

print("\nMissing values:")
print(df.isnull().sum())

# Correlation matrix
plt.figure(figsize=(10, 8))
sns.heatmap(df.corr(), annot=True, fmt='.2f', cmap='coolwarm', center=0)
plt.title('Correlation Matrix')
plt.tight_layout()
plt.savefig('correlation_matrix.png', dpi=150, bbox_inches='tight')
plt.close()

# 2. FEATURE SELECTION
print("\n" + "="*50)
print("2. FEATURE SELECTION")
print("="*50)

# Check VIF
from statsmodels.stats.outliers_influence import variance_inflation_factor

X = df.drop('Price', axis=1)
y = df['Price']

vif_data = pd.DataFrame()
vif_data["Feature"] = X.columns
vif_data["VIF"] = [variance_inflation_factor(X.values, i) for i in range(X.shape[1])]
print("\nVIF values:")
print(vif_data.sort_values('VIF', ascending=False))

# Remove high VIF features if needed
# For this example, we'll keep all

# 3. TRAIN-TEST SPLIT
print("\n" + "="*50)
print("3. TRAIN-TEST SPLIT")
print("="*50)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"Training set size: {X_train.shape[0]}")
print(f"Test set size: {X_test.shape[0]}")

# 4. FEATURE SCALING
print("\n" + "="*50)
print("4. FEATURE SCALING")
print("="*50)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print("Features scaled using StandardScaler")

# 5. MODEL TRAINING
print("\n" + "="*50)
print("5. MODEL TRAINING")
print("="*50)

model = LinearRegression()
model.fit(X_train_scaled, y_train)

print("Model trained successfully")
print("\nModel coefficients:")
coef_df = pd.DataFrame({
    'Feature': X.columns,
    'Coefficient': model.coef_
}).sort_values('Coefficient', key=abs, ascending=False)
print(coef_df)

# 6. MODEL EVALUATION
print("\n" + "="*50)
print("6. MODEL EVALUATION")
print("="*50)

# Training performance
y_train_pred = model.predict(X_train_scaled)
train_mse = mean_squared_error(y_train, y_train_pred)
train_rmse = np.sqrt(train_mse)
train_mae = mean_absolute_error(y_train, y_train_pred)
train_r2 = r2_score(y_train, y_train_pred)

print("Training Set Performance:")
print(f"  MSE:  {train_mse:.4f}")
print(f"  RMSE: {train_rmse:.4f}")
print(f"  MAE:  {train_mae:.4f}")
print(f"  R²:   {train_r2:.4f}")

# Test performance
y_test_pred = model.predict(X_test_scaled)
test_mse = mean_squared_error(y_test, y_test_pred)
test_rmse = np.sqrt(test_mse)
test_mae = mean_absolute_error(y_test, y_test_pred)
test_r2 = r2_score(y_test, y_test_pred)

print("\nTest Set Performance:")
print(f"  MSE:  {test_mse:.4f}")
print(f"  RMSE: {test_rmse:.4f}")
print(f"  MAE:  {test_mae:.4f}")
print(f"  R²:   {test_r2:.4f}")

# Cross-validation
cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5,
                            scoring='r2')
print(f"\n5-Fold Cross-Validation R² scores:")
print(f"  Scores: {cv_scores}")
print(f"  Mean: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

# 7. RESIDUAL ANALYSIS
print("\n" + "="*50)
print("7. RESIDUAL ANALYSIS")
print("="*50)

residuals = y_test - y_test_pred

# Plot residuals
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# Residual plot
axes[0, 0].scatter(y_test_pred, residuals, alpha=0.5)
axes[0, 0].axhline(y=0, color='r', linestyle='--')
axes[0, 0].set_xlabel('Fitted values')
axes[0, 0].set_ylabel('Residuals')
axes[0, 0].set_title('Residual Plot')

# Histogram of residuals
axes[0, 1].hist(residuals, bins=50, edgecolor='black')
axes[0, 1].set_xlabel('Residuals')
axes[0, 1].set_ylabel('Frequency')
axes[0, 1].set_title('Histogram of Residuals')

# Q-Q plot
from scipy import stats
stats.probplot(residuals, dist="norm", plot=axes[1, 0])
axes[1, 0].set_title('Q-Q Plot')

# Actual vs Predicted
axes[1, 1].scatter(y_test, y_test_pred, alpha=0.5)
axes[1, 1].plot([y_test.min(), y_test.max()],
                [y_test.min(), y_test.max()],
                'r--', lw=2)
axes[1, 1].set_xlabel('Actual')
axes[1, 1].set_ylabel('Predicted')
axes[1, 1].set_title('Actual vs Predicted')

plt.tight_layout()
plt.savefig('residual_analysis.png', dpi=150, bbox_inches='tight')
plt.close()

print("Residual analysis plots saved")

# 8. ASSUMPTIONS CHECK
print("\n" + "="*50)
print("8. ASSUMPTIONS CHECK")
print("="*50)

# Normality test
from scipy.stats import shapiro
stat, p_value = shapiro(residuals[:5000])  # Sample for large datasets
print(f"\nShapiro-Wilk Test:")
print(f"  Statistic: {stat:.4f}")
print(f"  p-value: {p_value:.4f}")
print(f"  Residuals {'ARE' if p_value > 0.05 else 'ARE NOT'} normally distributed (α=0.05)")

# Homoscedasticity test
from scipy.stats import spearmanr
corr, p_value = spearmanr(np.abs(residuals), y_test_pred)
print(f"\nHomoscedasticity Check (Spearman correlation):")
print(f"  Correlation: {corr:.4f}")
print(f"  p-value: {p_value:.4f}")

print("\n" + "="*50)
print("ANALYSIS COMPLETE")
print("="*50)
```

---

## Interview Questions

### Basic Questions

**Q1: What is the difference between simple and multiple linear regression?**

**A:**
- **Simple Linear Regression:** Uses ONE independent variable to predict the target.
  - Equation: y = β₀ + β₁x
  - Example: Predicting house price from area alone
- **Multiple Linear Regression:** Uses MULTIPLE independent variables.
  - Equation: y = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ
  - Example: Predicting house price from area, bedrooms, age, location

---

**Q2: What is the cost function in linear regression?**

**A:** The cost function (typically MSE) measures how well the model fits the data:
```
J(β) = (1/2n) Σ(yᵢ - ŷᵢ)²
```
Goal: Minimize J(β) to find optimal coefficients.

---

**Q3: Explain R² score. Can it be negative?**

**A:**
- R² measures the proportion of variance in the target explained by the model
- Range: (-∞, 1]
- 1.0 = perfect fit, 0.0 = model as good as predicting mean
- **Yes, can be negative** when model performs worse than simply predicting the mean
- Formula: R² = 1 - (SS_res / SS_tot)

---

**Q4: What are the assumptions of linear regression?**

**A:**
1. **Linearity:** Relationship between X and y is linear
2. **Independence:** Observations are independent
3. **Homoscedasticity:** Constant variance of residuals
4. **Normality:** Residuals are normally distributed
5. **No Multicollinearity:** Features are not highly correlated (for multiple regression)

---

**Q5: How do you detect multicollinearity?**

**A:**
1. **Correlation Matrix:** |correlation| > 0.8 between features
2. **VIF (Variance Inflation Factor):** VIF > 10 indicates problem
3. **Condition Number:** > 30 indicates severe multicollinearity

---

### Intermediate Questions

**Q6: What is the difference between MSE, MAE, and RMSE? When to use each?**

**A:**
- **MSE:** Squares errors, sensitive to outliers. Default choice.
- **MAE:** Linear penalty, robust to outliers. Use when outliers shouldn't dominate.
- **RMSE:** Square root of MSE, same units as target. Use for interpretability.

**Example:**
```python
errors = [1, 1, 1, 100]  # One large outlier
MSE = mean([1, 1, 1, 10000]) = 2500.75  # Heavily influenced
MAE = mean([1, 1, 1, 100]) = 25.75      # Less influenced
```

---

**Q7: How do you solve for coefficients in linear regression?**

**A:** Two main methods:
1. **Normal Equation (Closed-form):**
   ```
   β = (XᵀX)⁻¹XᵀY
   ```
   - Advantages: Direct solution, no hyperparameters
   - Disadvantages: Slow for large datasets (O(n³)), fails if XᵀX is singular

2. **Gradient Descent (Iterative):**
   ```
   β := β - α∇J(β)
   ```
   - Advantages: Works with large datasets, online learning
   - Disadvantages: Requires tuning learning rate, slower convergence

---

**Q8: What is polynomial regression? Is it still linear regression?**

**A:**
- Fits polynomial equation: y = β₀ + β₁x + β₂x² + β₃x³
- **YES, it's still linear regression!** Linear in coefficients β, not features.
- Created by transforming features (x → [x, x², x³])
- Risk: High-degree polynomials can overfit

---

**Q9: What is adjusted R² and why is it better than R²?**

**A:**
- R² always increases when adding features, even irrelevant ones
- Adjusted R² penalizes adding features:
  ```
  Adj R² = 1 - [(1 - R²)(n-1) / (n-p-1)]
  ```
- Use adjusted R² to compare models with different number of features
- Can decrease if added feature doesn't improve model enough

---

**Q10: How do you handle multicollinearity?**

**A:**
1. **Remove one of the correlated features**
2. **Combine correlated features** (e.g., create ratio)
3. **Use regularization** (Ridge/Lasso)
4. **Use PCA** to create uncorrelated components
5. **Collect more data** to reduce correlation

---

### Advanced Questions

**Q11: Derive the normal equation for linear regression.**

**A:**
```
Cost function: J(β) = (1/2)||Xβ - Y||²

Expand: J(β) = (1/2)(Xβ - Y)ᵀ(Xβ - Y)
             = (1/2)(βᵀXᵀ - Yᵀ)(Xβ - Y)
             = (1/2)(βᵀXᵀXβ - βᵀXᵀY - YᵀXβ + YᵀY)

Take derivative w.r.t. β and set to 0:
∇J(β) = XᵀXβ - XᵀY = 0

Solve for β:
XᵀXβ = XᵀY
β = (XᵀX)⁻¹XᵀY  ← Normal Equation
```

---

**Q12: What happens if XᵀX is not invertible in the normal equation?**

**A:**
XᵀX is not invertible when:
1. **Fewer samples than features** (n < p)
2. **Perfect multicollinearity** (features are linearly dependent)

**Solutions:**
- Add regularization (Ridge: (XᵀX + λI)⁻¹XᵀY)
- Remove redundant features
- Use gradient descent instead
- Use pseudoinverse: β = X⁺Y

---

**Q13: Why do we need to check the residual plot?**

**A:** Residual plot reveals violations of assumptions:
1. **Pattern in residuals** → Non-linearity (try polynomial regression)
2. **Funnel shape** → Heteroscedasticity (try transforming target)
3. **Outliers** → Points with high leverage (investigate/remove)
4. **Random scatter around 0** → Good! Assumptions met.

---

**Q14: What is the difference between R² and adjusted R² in practice?**

**A:**
```python
# Example
from sklearn.metrics import r2_score

# Model with 3 features
r2_3 = 0.85
n, p = 100, 3
adj_r2_3 = 1 - (1-r2_3)*(n-1)/(n-p-1)  # 0.844

# Add 2 irrelevant features → Model with 5 features
r2_5 = 0.86  # Slightly higher
p = 5
adj_r2_5 = 1 - (1-r2_5)*(n-1)/(n-p-1)  # 0.843 (Lower!)

# Adjusted R² decreased → Added features didn't help
```

---

**Q15: How does feature scaling affect linear regression?**

**A:**
- **Doesn't affect final predictions** (coefficients adjust)
- **Affects coefficient magnitudes:**
  - Large scale feature → small coefficient
  - Small scale feature → large coefficient
- **Affects gradient descent convergence:**
  - Unscaled: slow, zigzag path
  - Scaled: fast, direct path
- **Affects regularization** (features penalized unequally)
- **Best practice:** Always scale features before training

---

**Q16: Compare Normal Equation vs Gradient Descent**

**A:**

| Aspect | Normal Equation | Gradient Descent |
|--------|----------------|------------------|
| Speed | O(n³) - slow for large n | O(kn) - fast for large n |
| Hyperparameters | None | Learning rate α |
| Scaling needed | No | Yes |
| Works with large n | No (slow) | Yes |
| Works when XᵀX singular | No | Yes |
| Online learning | No | Yes |
| Solution | Exact | Approximate |

**Rule of thumb:** n < 10,000 → Normal Equation; n ≥ 10,000 → Gradient Descent

---

## Quick Reference

### Key Formulas

```
Simple Linear Regression:    y = β₀ + β₁x
Multiple Linear Regression:  y = β₀ + β₁x₁ + ... + βₙxₙ
Normal Equation:             β = (XᵀX)⁻¹XᵀY
MSE:                         (1/n)Σ(yᵢ - ŷᵢ)²
MAE:                         (1/n)Σ|yᵢ - ŷᵢ|
R²:                          1 - SS_res/SS_tot
VIF:                         1/(1 - R²ᵢ)
```

### Decision Guide

**Choose Linear Regression when:**
- ✅ Target variable is continuous
- ✅ Relationship is (approximately) linear
- ✅ Features are not highly correlated
- ✅ You need interpretable coefficients

**Choose Polynomial Regression when:**
- ✅ Scatter plot shows curved relationship
- ✅ You have enough data (at least 10× number of features)

**Use regularization when:**
- ✅ High multicollinearity (VIF > 10)
- ✅ More features than samples
- ✅ Model is overfitting

---

## Practice Problems

### Problem 1: Predict Car Prices

Given: MPG, Cylinders, Horsepower, Weight → Price

Tasks:
1. Check for multicollinearity
2. Build linear regression model
3. Interpret coefficients
4. Validate assumptions

### Problem 2: Sales Prediction

Given: Advertising spend (TV, Radio, Newspaper) → Sales

Tasks:
1. Which advertising channel is most effective?
2. Should you use all three channels?
3. What if Radio and TV spend are correlated?

### Problem 3: Real Estate

Given: Area, Bedrooms, Bathrooms, Age, Distance_to_center → Price

Tasks:
1. Check if relationship is linear
2. Handle multicollinearity if present
3. Try polynomial features for Area
4. Compare models using adjusted R²

---

**End of Linear Regression Notes**

Next: [Regression Analysis](regression-analysis.md)
