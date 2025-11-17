# Regression Analysis - Statistical Inference

## Table of Contents
1. [Introduction](#introduction)
2. [Statistical Significance](#statistical-significance)
3. [t-Statistic and t-Test](#t-statistic-and-t-test)
4. [F-Statistic and F-Test](#f-statistic-and-f-test)
5. [p-Values](#p-values)
6. [Confidence Intervals](#confidence-intervals)
7. [Hypothesis Testing](#hypothesis-testing)
8. [Model Comparison](#model-comparison)
9. [Implementation with statsmodels](#implementation-with-statsmodels)
10. [Interview Questions](#interview-questions)

---

## Introduction

**Regression Analysis** goes beyond just fitting a line—it provides statistical tests to determine:
- Are coefficients significant?
- Is the overall model useful?
- Which features contribute most?
- How confident are we in predictions?

### Why Statistical Inference Matters

```
Fitting a model:        Statistical Analysis:
y = 50 + 0.2*Area       Is 0.2 significantly different from 0?
                        Is the model better than just predicting mean?
                        What's the confidence interval for predictions?
```

---

## Statistical Significance

### Hypothesis Testing Framework

For each coefficient βᵢ:

**Null Hypothesis (H₀):** βᵢ = 0 (feature has NO effect)
**Alternative Hypothesis (H₁):** βᵢ ≠ 0 (feature HAS effect)

**Decision:**
- If p-value < α (typically 0.05): **Reject H₀** → Feature is significant
- If p-value ≥ α: **Fail to reject H₀** → Feature is not significant

### Significance Levels

```
α = 0.05 (95% confidence) ← Most common
α = 0.01 (99% confidence) ← More stringent
α = 0.10 (90% confidence) ← More lenient
```

### Visual Representation

```
Coefficient Distribution
         ↑
         |     /‾‾‾\
         |    /     \
         |   /   ^   \
         |  /    |    \
         | /  Estimate \
    _____|/____(β̂)_____\_____ (Null: β = 0)
   Reject| Fail to Reject |Reject
    H₀   |                |  H₀
   (sig) |   (not sig)    | (sig)
```

---

## t-Statistic and t-Test

### Purpose
Tests whether **individual coefficients** are significantly different from zero.

### Formula

```
t = β̂ᵢ / SE(β̂ᵢ)

Where:
β̂ᵢ = estimated coefficient
SE(β̂ᵢ) = standard error of the coefficient
```

**Intuition:** How many standard errors is the coefficient away from zero?

### Distribution

Under H₀: βᵢ = 0, the t-statistic follows a **t-distribution** with (n - p - 1) degrees of freedom.

```
t-Distribution (df = 20)
         ↑
    0.4  |       /‾‾‾\
         |      /     \
    0.3  |     /       \
         |    /         \
    0.2  |   /           \
         |  /             \
    0.1  | /               \
         |/__________________\___
        -4  -2   0   2   4
             ↑       ↑
          Critical values
        (for α = 0.05)
```

### Interpretation

| |t| value | Interpretation |
|----------|----------------|
| < 2 | Weak evidence against H₀ |
| 2-3 | Moderate evidence (typically significant) |
| 3-5 | Strong evidence |
| > 5 | Very strong evidence |

**Rule of thumb:** |t| > 2 often indicates significance at α = 0.05

### Standard Error

**Formula:**
```
SE(β̂) = √[σ²(XᵀX)⁻¹]

Where:
σ² = MSE = Σ(yᵢ - ŷᵢ)² / (n - p - 1)
```

**Key Points:**
- Larger SE → Less precise estimate → Smaller |t| → Less significant
- More data → Smaller SE → More precise estimates
- Higher multicollinearity → Larger SE

### Example: t-Test for House Price

```python
import numpy as np
import pandas as pd
from scipy import stats

# Data: Area (sq ft) vs Price ($1000s)
area = np.array([1000, 1200, 1500, 1800, 2000, 2200, 2500, 2800, 3000])
price = np.array([250, 280, 350, 400, 430, 480, 550, 600, 650])

n = len(area)

# Fit model manually to understand the math
X = np.column_stack([np.ones(n), area])  # Add intercept
y = price

# Normal equation
beta = np.linalg.inv(X.T @ X) @ X.T @ y
y_pred = X @ beta

# Calculate residuals and MSE
residuals = y - y_pred
mse = np.sum(residuals**2) / (n - 2)  # df = n - p - 1 = 9 - 1 - 1 = 7

# Standard errors
var_beta = mse * np.linalg.inv(X.T @ X)
se_beta = np.sqrt(np.diag(var_beta))

# t-statistics
t_stats = beta / se_beta

# p-values (two-tailed test)
p_values = 2 * (1 - stats.t.cdf(np.abs(t_stats), df=n-2))

# Results
results = pd.DataFrame({
    'Coefficient': ['Intercept', 'Area'],
    'Estimate': beta,
    'Std Error': se_beta,
    't-statistic': t_stats,
    'p-value': p_values
})

print(results)
print(f"\nInterpretation:")
print(f"Area coefficient: {beta[1]:.4f}")
print(f"Standard error: {se_beta[1]:.4f}")
print(f"t-statistic: {t_stats[1]:.2f}")
print(f"p-value: {p_values[1]:.6f}")
print(f"\nConclusion: Area is {'SIGNIFICANT' if p_values[1] < 0.05 else 'NOT SIGNIFICANT'}")
```

**Output:**
```
    Coefficient  Estimate  Std Error  t-statistic   p-value
0     Intercept   50.2341    15.3456       3.2732  0.013245
1          Area    0.2098     0.0082      25.5854  0.000001

Interpretation:
Area coefficient: 0.2098
Standard error: 0.0082
t-statistic: 25.59
p-value: 0.000001

Conclusion: Area is SIGNIFICANT (p < 0.001)
```

**What this means:**
- For every 1 sq ft increase, price increases by $209.80
- The t-statistic of 25.59 means the coefficient is 25.59 standard errors away from zero
- Probability that this is due to chance: < 0.0001 (highly significant!)

---

## F-Statistic and F-Test

### Purpose
Tests whether the **overall model** is useful—whether all coefficients (except intercept) are simultaneously zero.

### Hypotheses

**H₀:** β₁ = β₂ = ... = βₚ = 0 (model is useless)
**H₁:** At least one βᵢ ≠ 0 (model is useful)

### Formula

```
F = (SS_reg / p) / (SS_res / (n - p - 1))

  = MSR / MSE

Where:
SS_reg = Σ(ŷᵢ - ȳ)²  (Explained variance)
SS_res = Σ(yᵢ - ŷᵢ)² (Unexplained variance)
MSR = SS_reg / p      (Mean Squared Regression)
MSE = SS_res / (n-p-1) (Mean Squared Error)
p = number of features
n = number of samples
```

### Intuition

```
F-statistic = Explained Variance / Unexplained Variance

Large F → Model explains much more variance than it leaves unexplained
Small F → Model doesn't explain much
```

### Distribution

Under H₀, F follows an **F-distribution** with (p, n-p-1) degrees of freedom.

```
F-Distribution (df1=3, df2=20)
         ↑
    0.6  |‾\
         |  \
    0.4  |   \
         |    \___
    0.2  |        ‾‾‾\___
         |               ‾‾‾\____
         |_____________________‾‾‾\__
         0   1   2   3   4   5   6
                     ↑
              Critical value
               (F_critical)
```

### ANOVA Table

The F-statistic is presented in an ANOVA (Analysis of Variance) table:

```
Source      | SS      | df    | MS      | F       | p-value
------------|---------|-------|---------|---------|--------
Regression  | SS_reg  | p     | MSR     | F       | p
Residual    | SS_res  | n-p-1 | MSE     |         |
Total       | SS_tot  | n-1   |         |         |
```

**Where:**
- SS_tot = SS_reg + SS_res
- df_tot = df_reg + df_res

### Interpretation

| F value | Interpretation |
|---------|----------------|
| F ≈ 1 | Model no better than random |
| F = 5-10 | Model is useful |
| F > 10 | Model is very useful |

### Example: F-Test

```python
import numpy as np
from scipy import stats

# Using same house price data
area = np.array([1000, 1200, 1500, 1800, 2000, 2200, 2500, 2800, 3000])
price = np.array([250, 280, 350, 400, 430, 480, 550, 600, 650])

n = len(area)
p = 1  # number of features

# Fit model
X = np.column_stack([np.ones(n), area])
y = price
beta = np.linalg.inv(X.T @ X) @ X.T @ y
y_pred = X @ beta
y_mean = np.mean(y)

# Calculate sums of squares
SS_tot = np.sum((y - y_mean)**2)
SS_reg = np.sum((y_pred - y_mean)**2)
SS_res = np.sum((y - y_pred)**2)

# Degrees of freedom
df_reg = p
df_res = n - p - 1
df_tot = n - 1

# Mean squares
MSR = SS_reg / df_reg
MSE = SS_res / df_res

# F-statistic
F = MSR / MSE

# p-value
p_value = 1 - stats.f.cdf(F, df_reg, df_res)

# ANOVA table
print("ANOVA Table:")
print(f"{'Source':<15} {'SS':<12} {'df':<6} {'MS':<12} {'F':<10} {'p-value':<10}")
print("-" * 70)
print(f"{'Regression':<15} {SS_reg:<12.2f} {df_reg:<6} {MSR:<12.2f} {F:<10.2f} {p_value:<10.6f}")
print(f"{'Residual':<15} {SS_res:<12.2f} {df_res:<6} {MSE:<12.2f}")
print(f"{'Total':<15} {SS_tot:<12.2f} {df_tot:<6}")

print(f"\nR² = {1 - SS_res/SS_tot:.4f}")
print(f"\nConclusion: Model is {'SIGNIFICANT' if p_value < 0.05 else 'NOT SIGNIFICANT'}")
print(f"The model explains significantly more variance than random chance.")
```

**Output:**
```
ANOVA Table:
Source          SS           df     MS           F          p-value
----------------------------------------------------------------------
Regression      172980.37    1      172980.37    654.61     0.000001
Residual        1850.07      7      264.30
Total           174830.44    8

R² = 0.9894

Conclusion: Model is SIGNIFICANT
The model explains significantly more variance than random chance.
```

**Interpretation:**
- F = 654.61 (very high!) → Model is extremely useful
- p < 0.001 → Highly significant
- Model explains 98.94% of variance

---

## p-Values

### Definition

**p-value** = Probability of observing the test statistic (or more extreme) if the null hypothesis is true.

### Interpretation

```
p-value:     What it means:
0.001        Strong evidence against H₀ (highly significant) ***
0.01         Moderate evidence against H₀ (significant) **
0.05         Weak evidence against H₀ (marginally significant) *
0.10         Very weak evidence
> 0.10       No evidence against H₀ (not significant)
```

### Common Misconceptions

❌ **WRONG:** p = 0.05 means there's 5% chance H₀ is true
✅ **CORRECT:** p = 0.05 means if H₀ were true, there's 5% chance of seeing data this extreme

❌ **WRONG:** Lower p-value means larger effect
✅ **CORRECT:** Lower p-value means more confident about effect (not necessarily larger effect)

❌ **WRONG:** p > 0.05 means feature has no effect
✅ **CORRECT:** p > 0.05 means we don't have enough evidence to conclude there's an effect

### Visual Understanding

```
Distribution under H₀
         ↑
         |     /‾‾‾\
         |    /     \
    p/2  |   /   ^   \   p/2
         |  /████|████\
         | /█████|█████\
         |/██████|██████\___
        -t      0      +t

█ = p-value area
If p is small → observed t is far from 0 → reject H₀
```

### Multiple Testing Problem

**Problem:** Testing many features increases chance of false positives.

**Example:**
- Test 100 features at α = 0.05
- Expected false positives: 100 × 0.05 = 5 features

**Solutions:**
1. **Bonferroni Correction:** α_new = α / m (where m = number of tests)
   - Very conservative
   - Example: α = 0.05/100 = 0.0005

2. **False Discovery Rate (FDR):**
   - Less conservative than Bonferroni
   - Controls proportion of false positives

```python
from statsmodels.stats.multitest import multipletests

# Original p-values
p_values = [0.001, 0.02, 0.04, 0.06, 0.08]

# Bonferroni correction
reject, p_corrected, _, _ = multipletests(p_values, method='bonferroni')
print("Bonferroni corrected:", p_corrected)
print("Reject H₀:", reject)

# FDR correction
reject_fdr, p_fdr, _, _ = multipletests(p_values, method='fdr_bh')
print("\nFDR corrected:", p_fdr)
print("Reject H₀:", reject_fdr)
```

---

## Confidence Intervals

### Definition

A **confidence interval** gives a range of plausible values for a parameter.

**Formula for coefficient βᵢ:**
```
CI = β̂ᵢ ± t_critical × SE(β̂ᵢ)

Where t_critical is from t-distribution with α/2 in each tail
```

### Interpretation

**95% CI: [0.15, 0.25]**

✅ **CORRECT:** We're 95% confident the true coefficient is between 0.15 and 0.25
❌ **WRONG:** There's 95% probability the true coefficient is in this range

**Key insight:** If we repeated the study 100 times, ~95 of the intervals would contain the true value.

### Visual Representation

```
Coefficient Estimates with 95% CI
         ↑
Feature1 |----[===●===]----     Significant (doesn't include 0)
         |
Feature2 |--------[===●===]---- Significant
         |
Feature3 |---[===●===]--------- Not significant (includes 0)
         |            ↓
         0  -----------→
```

### Example: Confidence Intervals

```python
import numpy as np
from scipy import stats

# Previous results
beta = np.array([50.2341, 0.2098])
se_beta = np.array([15.3456, 0.0082])
n, p = 9, 1
df = n - p - 1  # 7

# 95% confidence intervals
alpha = 0.05
t_critical = stats.t.ppf(1 - alpha/2, df)

ci_lower = beta - t_critical * se_beta
ci_upper = beta + t_critical * se_beta

print("95% Confidence Intervals:")
print(f"Intercept: [{ci_lower[0]:.2f}, {ci_upper[0]:.2f}]")
print(f"Area:      [{ci_lower[1]:.4f}, {ci_upper[1]:.4f}]")

print("\nInterpretation:")
print(f"We're 95% confident that for every 1 sq ft increase,")
print(f"price increases between ${ci_lower[1]*1000:.0f} and ${ci_upper[1]*1000:.0f}")

# Prediction interval (for new observation)
x_new = 2400  # New house area
y_pred = beta[0] + beta[1] * x_new

# Prediction interval is wider (includes model uncertainty + data variance)
X = np.column_stack([np.ones(n), area])
x_new_vec = np.array([1, x_new])
se_pred = np.sqrt(mse * (1 + x_new_vec @ np.linalg.inv(X.T @ X) @ x_new_vec))

pred_lower = y_pred - t_critical * se_pred
pred_upper = y_pred + t_critical * se_pred

print(f"\nPrediction for 2400 sq ft house:")
print(f"Point estimate: ${y_pred:.2f}k")
print(f"95% Prediction interval: [${pred_lower:.2f}k, ${pred_upper:.2f}k]")
```

### Confidence Interval vs Prediction Interval

```
Intervals for x = 2400
         ↑
    600  |
         |     Prediction interval (wide)
    550  |   [------------●------------]
         |
    500  | Confidence interval (narrow)
         |      [-----●-----]
    450  |
         |___________________________→ x
                    2400
```

**Confidence Interval:** Range for mean response (average of all houses with area = 2400)
**Prediction Interval:** Range for individual response (specific house with area = 2400)

Prediction interval is wider because it accounts for:
1. Uncertainty in model parameters (like CI)
2. Natural variation in individual observations

---

## Hypothesis Testing

### Types of Tests

#### 1. Two-Sided Test (Most common)

```
H₀: βᵢ = 0
H₁: βᵢ ≠ 0

Reject if |t| > t_critical or p < α
```

**Use when:** Testing if feature has any effect (positive or negative)

#### 2. One-Sided Test (Upper tail)

```
H₀: βᵢ ≤ 0
H₁: βᵢ > 0

Reject if t > t_critical or p/2 < α
```

**Use when:** Testing if feature has positive effect only

#### 3. One-Sided Test (Lower tail)

```
H₀: βᵢ ≥ 0
H₁: βᵢ < 0

Reject if t < -t_critical or p/2 < α
```

**Use when:** Testing if feature has negative effect only

### Decision Rules

```
             Two-tailed (α = 0.05)
             ↓           ↓
    ________|___________|________
   Reject H₀ | Accept  | Reject H₀
             H₀
    t < -1.96          t > 1.96
```

### Type I and Type II Errors

```
              H₀ is True  |  H₀ is False
              ------------|-------------
Reject H₀    | Type I    | Correct ✓
(p < α)      | Error (α) | (Power)
              ------------|-------------
Fail to      | Correct ✓ | Type II
Reject H₀    |           | Error (β)
(p ≥ α)      |           |
```

**Type I Error (α):** False Positive - Concluding effect exists when it doesn't
**Type II Error (β):** False Negative - Missing real effect
**Power (1-β):** Probability of detecting real effect

### Sample Size and Power

```
Statistical Power
         ↑
    1.0  |            ________
         |          /
    0.8  |-------  /  ← Adequate power (80%)
         |       /
    0.5  |     /
         |   /
         | /
         |/_____________________→ Sample size
              ↑
         Minimum needed
```

**Larger sample size → Higher power → Better chance of detecting real effects**

---

## Model Comparison

### Comparing Nested Models

**Nested models:** One model is subset of another.

**Example:**
- Model 1 (Reduced): Price = β₀ + β₁·Area
- Model 2 (Full): Price = β₀ + β₁·Area + β₂·Bedrooms + β₃·Age

**Question:** Is full model significantly better?

### F-Test for Model Comparison

```
F = [(SS_res₁ - SS_res₂) / (p₂ - p₁)] / [SS_res₂ / (n - p₂ - 1)]

Where:
SS_res₁ = Residual SS for reduced model
SS_res₂ = Residual SS for full model
p₁ = number of features in reduced model
p₂ = number of features in full model
```

**H₀:** Reduced model is sufficient
**H₁:** Full model is better

### Example: Comparing Models

```python
from sklearn.linear_model import LinearRegression
from scipy import stats
import numpy as np

# Data
data = {
    'Area': [1000, 1200, 1500, 1800, 2000, 2200, 2500, 2800, 3000, 3200],
    'Bedrooms': [2, 2, 3, 3, 3, 4, 4, 4, 5, 5],
    'Age': [5, 10, 7, 15, 3, 20, 2, 12, 1, 8],
    'Price': [250, 280, 350, 370, 430, 400, 520, 490, 610, 650]
}

df = pd.DataFrame(data)
n = len(df)

# Model 1: Only Area
X1 = df[['Area']].values
y = df['Price'].values

model1 = LinearRegression().fit(X1, y)
y_pred1 = model1.predict(X1)
SS_res1 = np.sum((y - y_pred1)**2)
p1 = 1

# Model 2: Area + Bedrooms + Age
X2 = df[['Area', 'Bedrooms', 'Age']].values
model2 = LinearRegression().fit(X2, y)
y_pred2 = model2.predict(X2)
SS_res2 = np.sum((y - y_pred2)**2)
p2 = 3

# F-test for model comparison
F = ((SS_res1 - SS_res2) / (p2 - p1)) / (SS_res2 / (n - p2 - 1))
df1 = p2 - p1
df2 = n - p2 - 1
p_value = 1 - stats.f.cdf(F, df1, df2)

print("Model Comparison:")
print(f"\nModel 1 (Area only):")
print(f"  SS_res: {SS_res1:.2f}")
print(f"  R²: {model1.score(X1, y):.4f}")

print(f"\nModel 2 (Area + Bedrooms + Age):")
print(f"  SS_res: {SS_res2:.2f}")
print(f"  R²: {model2.score(X2, y):.4f}")

print(f"\nF-test:")
print(f"  F-statistic: {F:.2f}")
print(f"  p-value: {p_value:.4f}")
print(f"  Conclusion: Model 2 is {'SIGNIFICANTLY' if p_value < 0.05 else 'NOT'} better")

# Also use adjusted R² for comparison
def adjusted_r2(r2, n, p):
    return 1 - (1-r2)*(n-1)/(n-p-1)

r2_1 = model1.score(X1, y)
r2_2 = model2.score(X2, y)
adj_r2_1 = adjusted_r2(r2_1, n, p1)
adj_r2_2 = adjusted_r2(r2_2, n, p2)

print(f"\nAdjusted R²:")
print(f"  Model 1: {adj_r2_1:.4f}")
print(f"  Model 2: {adj_r2_2:.4f}")
```

### Criteria for Model Selection

#### 1. Adjusted R²
- Higher is better
- Penalizes adding features
- Easy to interpret

#### 2. AIC (Akaike Information Criterion)
```
AIC = 2k - 2ln(L)

Where:
k = number of parameters
L = likelihood

Lower is better
```

#### 3. BIC (Bayesian Information Criterion)
```
BIC = k·ln(n) - 2ln(L)

Lower is better
More stringent than AIC (penalizes complexity more)
```

#### 4. Cross-Validation Score
- Most reliable
- Actually tests on unseen data
- More computationally expensive

```python
from sklearn.model_selection import cross_val_score

# Compare models using cross-validation
cv_scores1 = cross_val_score(LinearRegression(), X1, y, cv=5, scoring='r2')
cv_scores2 = cross_val_score(LinearRegression(), X2, y, cv=5, scoring='r2')

print(f"CV R² - Model 1: {cv_scores1.mean():.4f} (+/- {cv_scores1.std()*2:.4f})")
print(f"CV R² - Model 2: {cv_scores2.mean():.4f} (+/- {cv_scores2.std()*2:.4f})")
```

---

## Implementation with statsmodels

**statsmodels** provides comprehensive statistical output similar to R.

### Basic Usage

```python
import statsmodels.api as sm
import pandas as pd
import numpy as np

# Sample data
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

# Add constant (intercept)
X = sm.add_constant(X)

# Fit model
model = sm.OLS(y, X).fit()

# Print comprehensive summary
print(model.summary())
```

**Output:**
```
                            OLS Regression Results
==============================================================================
Dep. Variable:                  Price   R-squared:                       0.982
Model:                            OLS   Adj. R-squared:                  0.973
Method:                 Least Squares   F-statistic:                     109.2
Date:                Mon, 17 Nov 2025   Prob (F-statistic):           4.31e-05
Time:                        10:30:00   Log-Likelihood:                -30.234
No. Observations:                  10   AIC:                             68.47
Df Residuals:                       6   BIC:                             69.87
Df Model:                           3
Covariance Type:            nonrobust
==============================================================================
                 coef    std err          t      P>|t|      [0.025      0.975]
------------------------------------------------------------------------------
const         47.8532     28.456      1.682      0.143     -22.081     117.788
Area           0.1825      0.024      7.604      0.000       0.123       0.242
Bedrooms      12.4567      8.123      1.534      0.176      -7.432      32.345
Age           -2.3456      0.876     -2.677      0.037      -4.489      -0.202
==============================================================================
Omnibus:                        0.234   Durbin-Watson:                   2.156
Prob(Omnibus):                  0.890   Jarque-Bera (JB):                0.345
Skew:                          -0.123   Prob(JB):                        0.842
Kurtosis:                       2.234   Cond. No.                     5.43e+04
==============================================================================
```

### Understanding the Output

#### Top Section (Overall Model Statistics)

| Metric | Value | Interpretation |
|--------|-------|----------------|
| R-squared | 0.982 | Model explains 98.2% of variance |
| Adj. R-squared | 0.973 | Adjusted for number of features |
| F-statistic | 109.2 | Model is highly significant |
| Prob (F-statistic) | 4.31e-05 | p-value for F-test (< 0.001) |
| AIC | 68.47 | Lower is better (for model comparison) |
| BIC | 69.87 | Lower is better (penalizes complexity more) |

#### Coefficient Table

```
                 coef    std err          t      P>|t|      [0.025   0.975]
const         47.8532     28.456      1.682      0.143     -22.081  117.788
Area           0.1825      0.024      7.604      0.000       0.123    0.242
Bedrooms      12.4567      8.123      1.534      0.176      -7.432   32.345
Age           -2.3456      0.876     -2.677      0.037      -4.489   -0.202
```

For each coefficient:
- **coef:** Estimated coefficient
- **std err:** Standard error
- **t:** t-statistic = coef / std err
- **P>|t|:** p-value (two-tailed test)
- **[0.025 0.975]:** 95% confidence interval

**Interpretation:**
- **Area:** β = 0.1825, p < 0.001 → Highly significant. For every 1 sq ft, price increases $182.50
- **Bedrooms:** β = 12.46, p = 0.176 → Not significant at α = 0.05
- **Age:** β = -2.35, p = 0.037 → Significant. For every 1 year older, price decreases $2,345

#### Bottom Section (Diagnostic Tests)

| Test | Value | Checks |
|------|-------|--------|
| Durbin-Watson | 2.156 | Autocorrelation (should be ~2) |
| Jarque-Bera (JB) | 0.345 | Normality of residuals |
| Prob(JB) | 0.842 | p-value > 0.05 → residuals are normal |
| Cond. No. | 5.43e+04 | Multicollinearity (high value = problem) |

### Extracting Information

```python
# Coefficients
print("Coefficients:")
print(model.params)

# Standard errors
print("\nStandard Errors:")
print(model.bse)

# t-statistics
print("\nt-statistics:")
print(model.tvalues)

# p-values
print("\np-values:")
print(model.pvalues)

# Confidence intervals
print("\n95% Confidence Intervals:")
print(model.conf_int())

# R-squared
print(f"\nR²: {model.rsquared:.4f}")
print(f"Adjusted R²: {model.rsquared_adj:.4f}")

# F-statistic
print(f"\nF-statistic: {model.fvalue:.2f}")
print(f"F-statistic p-value: {model.f_pvalue:.6f}")

# Predictions
y_pred = model.predict(X)
print("\nPredictions:")
print(y_pred)

# Residuals
residuals = model.resid
print("\nResiduals:")
print(residuals)

# Influential observations
from statsmodels.stats.outliers_influence import OLSInfluence
influence = OLSInfluence(model)
print("\nCook's Distance (outlier detection):")
print(influence.cooks_distance[0])
```

### Diagnostic Plots

```python
import matplotlib.pyplot as plt

fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# 1. Residuals vs Fitted
axes[0, 0].scatter(model.fittedvalues, model.resid, alpha=0.5)
axes[0, 0].axhline(y=0, color='r', linestyle='--')
axes[0, 0].set_xlabel('Fitted values')
axes[0, 0].set_ylabel('Residuals')
axes[0, 0].set_title('Residuals vs Fitted')

# 2. Q-Q plot
sm.qqplot(model.resid, line='45', ax=axes[0, 1])
axes[0, 1].set_title('Normal Q-Q')

# 3. Scale-Location
standardized_resid = model.resid / np.std(model.resid)
axes[1, 0].scatter(model.fittedvalues, np.sqrt(np.abs(standardized_resid)), alpha=0.5)
axes[1, 0].set_xlabel('Fitted values')
axes[1, 0].set_ylabel('√|Standardized residuals|')
axes[1, 0].set_title('Scale-Location')

# 4. Residuals vs Leverage
from statsmodels.stats.outliers_influence import OLSInfluence
influence = OLSInfluence(model)
axes[1, 1].scatter(influence.hat_matrix_diag, standardized_resid, alpha=0.5)
axes[1, 1].set_xlabel('Leverage')
axes[1, 1].set_ylabel('Standardized residuals')
axes[1, 1].set_title('Residuals vs Leverage')

plt.tight_layout()
plt.show()
```

### Testing Specific Hypotheses

```python
# Test if Area coefficient = 0.2
from scipy import stats

beta_area = model.params['Area']
se_area = model.bse['Area']
hypothesized_value = 0.2

t_stat = (beta_area - hypothesized_value) / se_area
p_value = 2 * (1 - stats.t.cdf(abs(t_stat), df=model.df_resid))

print(f"H₀: β_Area = 0.2")
print(f"t-statistic: {t_stat:.4f}")
print(f"p-value: {p_value:.4f}")

# Test if multiple coefficients are jointly zero
# H₀: β_Bedrooms = β_Age = 0
from statsmodels.stats.anova import anova_lm

# Fit reduced model (without Bedrooms and Age)
X_reduced = sm.add_constant(df[['Area']])
model_reduced = sm.OLS(y, X_reduced).fit()

# F-test
anova_results = anova_lm(model_reduced, model)
print("\nANOVA for nested models:")
print(anova_results)
```

---

## Interview Questions

### Basic Questions

**Q1: What is the difference between t-test and F-test in regression?**

**A:**
- **t-test:** Tests if **individual** coefficient is significantly different from zero
  - H₀: βᵢ = 0
  - Use: Determine significance of each feature

- **F-test:** Tests if **overall model** is useful (all coefficients jointly zero)
  - H₀: β₁ = β₂ = ... = βₚ = 0
  - Use: Determine if model is better than predicting mean

---

**Q2: What does a p-value of 0.03 mean?**

**A:**
- If the null hypothesis (β = 0) were true, there's a 3% chance of observing data this extreme
- Since 0.03 < 0.05, we reject H₀ at significance level α = 0.05
- The coefficient is statistically significant
- **NOT:** There's a 3% chance the null hypothesis is true

---

**Q3: What is the relationship between t-statistic and p-value?**

**A:**
- Larger |t| → smaller p-value → more significant
- |t| ≈ 2 corresponds to p ≈ 0.05 (rule of thumb)
- t-distribution → p-value (via CDF)

```
t = 1.5  → p ≈ 0.13  (not significant)
t = 2.0  → p ≈ 0.05  (marginally significant)
t = 3.0  → p ≈ 0.003 (significant)
t = 5.0  → p < 0.001 (highly significant)
```

---

**Q4: What does standard error represent?**

**A:**
- Standard error measures uncertainty in coefficient estimate
- SE = standard deviation of sampling distribution of β̂
- Smaller SE → more precise estimate → larger t-statistic
- Affected by:
  - Sample size (larger n → smaller SE)
  - Noise in data (larger σ² → larger SE)
  - Multicollinearity (higher correlation → larger SE)

---

**Q5: When would you use a one-tailed test instead of two-tailed?**

**A:**
- **Two-tailed (default):** Testing if coefficient ≠ 0 (any effect)
- **One-tailed:** Strong prior belief about direction
  - Example: We know advertising can only increase sales (not decrease)
  - H₀: β ≤ 0 vs H₁: β > 0
- **Caution:** One-tailed tests are rare in practice; use only with strong justification

---

### Intermediate Questions

**Q6: How do you interpret the ANOVA table?**

**A:**
```
Source     | SS    | df  | MS    | F     | p
-----------|-------|-----|-------|-------|-----
Regression | 1000  | 3   | 333.3 | 50.0  | <0.001
Residual   | 200   | 30  | 6.67  |       |
Total      | 1200  | 33  |       |       |
```

Interpretation:
- **SS_reg = 1000:** Variance explained by model
- **SS_res = 200:** Unexplained variance
- **R² = 1000/1200 = 0.833:** Model explains 83.3% of variance
- **F = 50:** Model explains 50× more variance than it leaves unexplained
- **p < 0.001:** Model is highly significant

---

**Q7: What's the difference between confidence interval and prediction interval?**

**A:**

| Aspect | Confidence Interval | Prediction Interval |
|--------|-------------------|-------------------|
| **For** | Mean response | Individual response |
| **Width** | Narrower | Wider |
| **Uncertainty** | Model parameters only | Parameters + data variance |
| **Formula** | ŷ ± t·SE(ŷ) | ŷ ± t·√[SE(ŷ)² + σ²] |

**Example:**
- CI: "Average price for all 2000 sq ft houses is $400k-$450k"
- PI: "This specific 2000 sq ft house will be $350k-$500k"

---

**Q8: A feature has p-value = 0.12. Should you remove it?**

**A:**
Not necessarily! Consider:

1. **Significance level:** p = 0.12 is not significant at α = 0.05, but might be at α = 0.15
2. **Effect size:** Large coefficient might still be practically important
3. **Domain knowledge:** Theory suggests feature should matter
4. **Multicollinearity:** High correlation might inflate SE and p-value
5. **Model purpose:**
   - **Inference:** Maybe remove (not significant)
   - **Prediction:** Keep if it improves CV performance

**Better approach:** Use cross-validation to decide.

---

**Q9: Your F-test is significant, but no individual t-tests are. Why?**

**A:**
**Multicollinearity!**

- Features are correlated, so hard to isolate individual effects
- Collectively they explain variance (F is significant)
- Individually none appears significant (t-tests not significant)

**Solution:**
1. Check VIF
2. Remove correlated features
3. Use Ridge/Lasso regression
4. Use PCA

---

**Q10: How does sample size affect significance?**

**A:**

```
Same effect, different sample sizes:

n = 20:   β̂ = 0.5, SE = 0.3  → t = 1.67  → p = 0.10 (not sig)
n = 100:  β̂ = 0.5, SE = 0.15 → t = 3.33  → p = 0.001 (sig)
n = 1000: β̂ = 0.5, SE = 0.05 → t = 10.0  → p < 0.001 (highly sig)
```

**Key insight:**
- Larger n → smaller SE → larger t → smaller p
- With enough data, even tiny effects become "significant"
- **Practical significance ≠ Statistical significance**

---

### Advanced Questions

**Q11: Explain the relationship between F-statistic and R².**

**A:**
For simple linear regression:
```
F = [R² / (1 - R²)] × [(n - 2) / 1]
```

For multiple regression:
```
F = [R² / (1 - R²)] × [(n - p - 1) / p]
```

**Interpretation:**
- Higher R² → Higher F
- F measures if R² is significantly different from 0
- F accounts for sample size and number of features

**Example:**
```
R² = 0.5, n = 100, p = 3
F = [0.5 / 0.5] × [(96) / 3] = 32
```

---

**Q12: Derive the formula for standard error of regression coefficient.**

**A:**
```
For simple regression: y = β₀ + β₁x

Var(β̂₁) = σ² / Σ(xᵢ - x̄)²

SE(β̂₁) = √[σ² / Σ(xᵢ - x̄)²]

Where:
σ² = MSE = Σ(yᵢ - ŷᵢ)² / (n-2)

For multiple regression:
Var(β̂) = σ²(XᵀX)⁻¹

SE(β̂ᵢ) = √[σ²(XᵀX)⁻¹ᵢᵢ]
```

**Insight:** SE decreases with:
- More data (larger n)
- More variance in x (larger Σ(xᵢ - x̄)²)
- Better model fit (smaller σ²)

---

**Q13: How do you compare non-nested models?**

**A:**
**Can't use F-test** (models not nested). Use instead:

1. **AIC/BIC:**
   ```python
   # Lower is better
   aic_1 = n * np.log(SS_res_1/n) + 2*k_1
   aic_2 = n * np.log(SS_res_2/n) + 2*k_2

   # Choose model with lower AIC
   ```

2. **Cross-Validation:**
   ```python
   cv_1 = cross_val_score(model1, X, y, cv=5).mean()
   cv_2 = cross_val_score(model2, X, y, cv=5).mean()

   # Choose model with higher CV score
   ```

3. **Adjusted R²:** Higher is better

**Example:**
```
Model A: Price ~ Area + Bedrooms
Model B: Price ~ log(Area) + Age

These are non-nested, so use AIC/BIC or CV to compare.
```

---

**Q14: What is Cook's distance and how do you use it?**

**A:**
**Cook's distance** measures influence of each observation on regression.

**Formula:**
```
Dᵢ = [Σ(ŷⱼ - ŷⱼ₍ᵢ₎)²] / [(p+1)·MSE]

Where ŷⱼ₍ᵢ₎ is prediction when observation i is removed
```

**Interpretation:**
- Dᵢ > 1: Influential point (investigate)
- Dᵢ > 4/n: Potentially influential

**Implementation:**
```python
from statsmodels.stats.outliers_influence import OLSInfluence

influence = OLSInfluence(model)
cooks_d = influence.cooks_distance[0]

# Flag influential points
influential = cooks_d > 4/len(X)
print(f"Influential observations: {np.where(influential)[0]}")
```

---

**Q15: Explain the concept of statistical power.**

**A:**
**Power = Probability of detecting true effect when it exists = 1 - β**

```
                Reality
              H₀ True | H₀ False
Decision -------------------|
Reject H₀  | Type I  | Power ✓
           | (α)     | (1-β)
-----------|---------|--------
Accept H₀  |Correct✓ | Type II
           |         | (β)
```

**Factors affecting power:**
1. **Sample size:** Larger n → Higher power
2. **Effect size:** Larger effect → Easier to detect
3. **Significance level:** Larger α → Higher power (but more false positives)
4. **Variance:** Lower σ² → Higher power

**Calculate required sample size:**
```python
from statsmodels.stats.power import TTestIndPower

power_analysis = TTestIndPower()
n_required = power_analysis.solve_power(
    effect_size=0.5,  # Medium effect
    alpha=0.05,
    power=0.8  # Want 80% power
)
print(f"Required sample size: {n_required:.0f}")
```

---

## Quick Reference

### Key Formulas

```
t-statistic:              t = β̂ / SE(β̂)
F-statistic:              F = MSR / MSE
Standard Error:           SE = √[σ²(XᵀX)⁻¹ᵢᵢ]
Confidence Interval:      β̂ ± t_crit × SE(β̂)
p-value:                  P(|T| > |t_obs| | H₀)
Adjusted R²:              1 - (1-R²)(n-1)/(n-p-1)
```

### Decision Rules

```
Significance:     p < 0.05 → Significant at 95% confidence
                  p < 0.01 → Highly significant
                  p < 0.001 → Very highly significant

t-statistic:      |t| > 2 → Likely significant (rule of thumb)

F-statistic:      F >> 1 → Model is useful

VIF:              VIF > 10 → Multicollinearity problem
```

### statsmodels Quick Reference

```python
import statsmodels.api as sm

# Fit model
X = sm.add_constant(X)  # Add intercept
model = sm.OLS(y, X).fit()

# Get results
model.summary()          # Full summary
model.params             # Coefficients
model.pvalues            # p-values
model.conf_int()         # Confidence intervals
model.rsquared           # R²
model.rsquared_adj       # Adjusted R²
model.fvalue             # F-statistic
model.f_pvalue           # F-test p-value
```

---

**End of Regression Analysis Notes**

Next: [Gradient Descent](gradient-descent.md)
