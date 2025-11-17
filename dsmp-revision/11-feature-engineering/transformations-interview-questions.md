# Feature Transformations - Interview Questions

## Introduction

Master these transformation interview questions to demonstrate deep understanding of data preprocessing. Each answer includes clear explanations, practical examples, and insights that interviewers value.

## Q1: When would you use log transformation?

**Answer:**

Use log transformation when:

1. **Data is right-skewed** (long tail on right)
2. **Exponential relationships** exist
3. **Data spans orders of magnitude** (1 to 1000000)
4. **Multiplicative effects** are present

**Example:**
```python
Income: [30K, 40K, 50K, ..., 1M, 5M]
Skewed! Log makes it more normal.

log(30K) ≈ 10.3
log(1M)  ≈ 13.8

Range compressed from 5000K to ~3.5
```

**Benefits:**
- Makes distribution more normal
- Reduces impact of outliers
- Converts multiplicative to additive relationships
- Improves model performance

**Don't use when:**
- Data has zeros (use log1p instead)
- Data has negatives (use Yeo-Johnson)
- Data is already normal
- Interpretability is critical

**Key Insight:** Log transformation is powerful because it compresses large values more than small values, making it ideal for data spanning multiple orders of magnitude.

## Q2: What's the difference between Box-Cox and Yeo-Johnson?

**Answer:**

**Box-Cox:**
- Formula: `(x^λ - 1) / λ` if λ ≠ 0, else `log(x)`
- Requires: **x > 0** (strictly positive)
- Finds optimal λ for maximum normality
- Simpler, well-established

**Yeo-Johnson:**
- Similar to Box-Cox but more complex formula
- Works with: **any data** (positive, zero, negative)
- Also finds optimal λ
- More flexible

**Comparison:**
```python
Data: [1, 2, 5, 10, 100]
Both work! Results similar.

Data: [0, 1, 2, 5, 10]
Box-Cox: FAILS (has zero)
Yeo-Johnson: WORKS

Data: [-5, -1, 0, 1, 5]
Box-Cox: FAILS (has negatives)
Yeo-Johnson: WORKS
```

**When to use:**
- All positive data → Box-Cox (simpler)
- Has zeros/negatives → Yeo-Johnson (required)

**Key Insight:** Yeo-Johnson extends Box-Cox to handle any data, making it the safer default choice.

## Q3: How do you choose between log and square root transformation?

**Answer:**

**Decision based on skewness:**

```
High Skewness (> 1):
→ Log transformation (more aggressive)

Moderate Skewness (0.5-1):
→ Square root transformation

Low Skewness (< 0.5):
→ No transformation needed
```

**Example:**
```python
# Highly skewed (exponential growth)
income = [20K, 30K, 50K, 100K, 500K, 2M]
skewness = 2.5 → Use LOG

# Moderately skewed (count data)
page_views = [10, 15, 20, 25, 50, 100]
skewness = 0.8 → Use SQRT

# Already normal
height = [160, 165, 170, 175, 180]
skewness = 0.1 → NO TRANSFORM
```

**Properties:**
- Log is more aggressive (compresses more)
- Sqrt is gentler
- Log: multiplicative → additive
- Sqrt: works well with count data (Poisson)

**Key Insight:** Match transformation aggressiveness to skewness level. Don't use a hammer when you need a screwdriver!

## Q4: What are common mistakes in feature transformation?

**Answer:**

**1. Not inverse transforming predictions:**
```python
# WRONG
y_train_log = np.log(y_train)
model.fit(X_train, y_train_log)
predictions = model.predict(X_test)  # Still in log scale!

# CORRECT
predictions_log = model.predict(X_test)
predictions = np.exp(predictions_log)  # Inverse transform
```

**2. Transforming before train-test split:**
```python
# WRONG (data leakage for Box-Cox/Yeo-Johnson)
data_transformed = transformer.fit_transform(data)
train, test = split(data_transformed)

# CORRECT
train, test = split(data)
train_transformed = transformer.fit_transform(train)
test_transformed = transformer.transform(test)
```

**3. Using log on zeros:**
```python
# WRONG
np.log([0, 1, 10])  # Error!

# CORRECT
np.log1p([0, 1, 10])  # log(1+x), handles zeros
```

**4. Transforming normal data:**
```python
# Check skewness first!
if abs(skewness) < 0.5:
    print("Don't transform, already normal!")
```

**5. Not checking if transformation helped:**
```python
# Always compare before/after
print(f"Before: {skew_before}")
print(f"After: {skew_after}")
if abs(skew_after) >= abs(skew_before):
    print("Transformation didn't help!")
```

**Key Insight:** Transformation is a tool, not a requirement. Always validate that it actually improved your data.

## Q5: How do transformations affect model interpretation?

**Answer:**

**1. Log transformation:**
```python
Original model: y = β₀ + β₁x
Interpretation: 1 unit increase in x → β₁ increase in y

Log model: log(y) = β₀ + β₁x
Interpretation: 1 unit increase in x → β₁% change in y
(multiplicative effect)
```

**2. Square root:**
```python
Original: y = β₀ + β₁x
Sqrt: √y = β₀ + β₁x

Less intuitive, need to square to interpret
```

**3. Box-Cox/Yeo-Johnson:**
```python
y^λ = β₀ + β₁x

Very hard to interpret!
λ = 0.5 → somewhat like sqrt
λ = 0.0 → like log
λ = 1.0 → no transformation
```

**Trade-off:**
- Original scale: Easy to interpret
- Transformed: Better model performance but harder to interpret

**Best practice:**
- Use transformation for modeling
- Convert back to original scale for presentation
- Document the transformation clearly
- Provide examples in original scale

**Key Insight:** Always consider the interpretation trade-off. In business contexts, an interpretable model might be more valuable than a slightly more accurate one.

## Q6: Why does log transformation help with outliers?

**Answer:**

Log transformation compresses large values more than small values.

**Mathematical reason:**
```python
# Linear scale
Values: [1, 10, 100, 1000]
Differences: [9, 90, 900]  # Increasing gaps

# Log scale
Log values: [0, 2.3, 4.6, 6.9]
Differences: [2.3, 2.3, 2.3]  # Equal gaps!
```

**Effect on outliers:**
```python
Data: [10, 12, 15, 18, 20, 1000]  # 1000 is outlier

Without log:
- Mean dominated by outlier
- Large distance calculations
- Model focuses on outlier

With log:
log(1000) = 6.9
log(20) = 3.0
Difference: 3.9 (not 980!)
- Outlier has less impact
- More balanced distribution
```

**Why it works:**
1. Compresses large values logarithmically
2. Expands small value differences
3. Makes multiplicative relationships additive
4. Stabilizes variance

**Key Insight:** Log doesn't remove outliers—it reduces their disproportionate impact by putting all values on a more comparable scale.

## Q7: When should you NOT transform data?

**Answer:**

**Don't transform when:**

1. **Data is already normal**
```python
skewness = 0.2  # Close to 0
print("Already good! Don't transform.")
```

2. **Using tree-based models**
```python
# Decision Trees, Random Forest, XGBoost
# These models split on thresholds
# Transformation doesn't help (might hurt interpretability)
```

3. **Interpretability is critical**
```python
# Business stakeholders need to understand
# "10% increase in price → 5% decrease in sales"
# Is better than
# "0.1 log-unit increase → -0.05 sqrt-units decrease"
```

4. **Data has specific meaning**
```python
# Age in years: 0-100 makes sense
# Log(age): What does 3.5 mean? 33 years?
# Less intuitive
```

5. **Testing/validation phase**
```python
# Try without transformation first
# Establish baseline
# Then try with transformation
# Compare results
```

**Decision process:**
```python
1. Check skewness
2. If |skewness| < 0.5: Don't transform
3. If tree model: Don't transform
4. If need interpretation: Consider not transforming
5. Otherwise: Try transformation and compare
```

**Key Insight:** Transformation is not always necessary or beneficial. Start simple, transform only when needed.

## Q8: What is the purpose of PowerTransformer's standardize parameter?

**Answer:**

The `standardize` parameter controls whether to scale after transformation.

**With standardize=False:**
```python
transformer = PowerTransformer(standardize=False)
# Only applies transformation (Box-Cox or Yeo-Johnson)
# Result: Transformed but not standardized
```

**With standardize=True (default):**
```python
transformer = PowerTransformer(standardize=True)
# 1. Applies transformation
# 2. Then standardizes to mean=0, std=1
# Result: Transformed AND standardized
```

**Example:**
```python
data = [1, 10, 100, 1000]

# Without standardize
transformed = [0, 2.3, 4.6, 6.9]  # Just log
mean ≈ 3.45, std ≈ 2.8

# With standardize
transformed = [-1.2, -0.4, 0.4, 1.2]  # Log + standardize
mean = 0, std = 1
```

**When to use standardize=True:**
- Using distance-based algorithms (KNN, SVM)
- Want features on same scale
- Training neural networks
- Default choice for most cases

**When to use standardize=False:**
- Want to see transformation effect alone
- Will apply different scaling later
- Interpretability matters

**Key Insight:** standardize=True gives you both normalization (via transformation) and standardization (mean=0, std=1) in one step, which is usually what you want.

## Q9: How do you validate transformation improved your data?

**Answer:**

**Multiple validation approaches:**

**1. Skewness comparison:**
```python
from scipy import stats

original_skew = stats.skew(data)
transformed_skew = stats.skew(transformed_data)

print(f"Original: {original_skew:.2f}")
print(f"Transformed: {transformed_skew:.2f}")

if abs(transformed_skew) < abs(original_skew):
    print("✓ Improved")
else:
    print("✗ Didn't help")
```

**2. Normality tests:**
```python
from scipy.stats import shapiro

stat_orig, p_orig = shapiro(data)
stat_trans, p_trans = shapiro(transformed_data)

print(f"Original p-value: {p_orig:.4f}")
print(f"Transformed p-value: {p_trans:.4f}")
# Higher p-value = more normal
```

**3. Visual inspection:**
```python
# Q-Q plots
import matplotlib.pyplot as plt
from scipy import stats

fig, axes = plt.subplots(1, 2)
stats.probplot(data, dist="norm", plot=axes[0])
stats.probplot(transformed_data, dist="norm", plot=axes[1])
# Points closer to line = more normal
```

**4. Model performance:**
```python
# Train model with and without transformation
score_before = model.fit(X, y).score(X_test, y_test)
score_after = model.fit(X, y_transformed).score(X_test, y_test_transformed)

if score_after > score_before:
    print("✓ Transformation helped model")
```

**Best practice: Use multiple methods**
- Skewness: Quick check
- Visual: Intuitive understanding
- Statistical test: Formal validation
- Model performance: Practical impact

**Key Insight:** Don't rely on a single metric. Combine statistical measures, visualizations, and model performance to comprehensively validate improvement.

## Q10: Explain data leakage in transformation

**Answer:**

**Data leakage** occurs when information from test set influences transformation parameters.

**The problem:**
```python
# WRONG: Fit transformer on all data
transformer = PowerTransformer()
transformer.fit(X_all)  # Includes test data!
# λ is computed using test data statistics

X_train, X_test = split(X_all)
X_train_trans = transformer.transform(X_train)
X_test_trans = transformer.transform(X_test)
# Test data influenced its own transformation!
```

**Why it matters:**
```python
# Example: Box-Cox λ
# If test has extreme values:
# λ computed with test → optimized for test data
# Model evaluated on test → overly optimistic

# In production:
# New data has different distribution
# λ doesn't work well → poor performance
```

**Correct approach:**
```python
# Split first
X_train, X_test = split(X)

# Fit on train only
transformer = PowerTransformer()
transformer.fit(X_train)  # Only train data
λ_train = transformer.lambdas_

# Transform both using train parameters
X_train_trans = transformer.transform(X_train)
X_test_trans = transformer.transform(X_test)
```

**Prevention with Pipeline:**
```python
from sklearn.pipeline import Pipeline

pipeline = Pipeline([
    ('transform', PowerTransformer()),
    ('model', LinearRegression())
])

# Pipeline handles splitting correctly
cross_val_score(pipeline, X, y, cv=5)
# Each fold: fits transformer on train, transforms test
```

**Key Insight:** The test set represents future unseen data. It should have zero influence on any preprocessing decisions, including transformation parameters.

## Summary

**Key Takeaways:**
1. Match transformation to skewness level
2. Log for high skew, sqrt for moderate skew
3. Box-Cox auto-optimizes (positive data only)
4. Yeo-Johnson handles any data
5. Always inverse transform predictions
6. Validate transformation helped
7. Consider interpretability trade-offs
8. Use pipelines to prevent leakage

**Interview Tips:**
- Explain the "why" behind choosing transformations
- Discuss trade-offs (accuracy vs. interpretability)
- Give concrete examples
- Show awareness of pitfalls
- Mention validation approaches

---

**Navigation:**
- **Previous:** [← Comparison Guide](./transformations-comparison-guide.md)
- **All Topics:** [Feature Engineering Overview](./README.md)
- **Related:** [Scaling Interview Questions](./scaling-interview-questions.md)
