# Feature Scaling and Outliers - Interview Questions

## Introduction

Prepare for your data science interviews with these comprehensive questions and answers on feature scaling and outlier handling. Each answer includes clear explanations, code examples, and practical insights that interviewers look for.

## Q1: When should you use RobustScaler instead of StandardScaler?

**Answer:**

Use **RobustScaler** when data contains outliers.

**StandardScaler:**
- Uses mean and standard deviation
- Outliers heavily affect mean and std
- Example: [10, 12, 15, 1000] → mean = 259 (heavily skewed)

**RobustScaler:**
- Uses median and IQR (Interquartile Range)
- Robust to outliers
- Example: [10, 12, 15, 1000] → median = 13.5 (not affected)

```python
# When data has outliers
data = [10, 12, 15, 18, 20, 1000]

StandardScaler: Normal values compressed
RobustScaler: Normal values preserved

Use RobustScaler for:
- Sensor data (occasional failures)
- Financial data (extreme values)
- Real-world data (often has outliers)
```

**Key Insight:** RobustScaler uses percentiles (median, Q1, Q3) which aren't influenced by extreme values, while StandardScaler uses mean and std which are heavily affected by outliers.

## Q2: What's the difference between Normalizer and other scalers?

**Answer:**

**Normalizer** works row-wise (per sample), others work column-wise (per feature).

```python
# Normalizer: Scales each ROW to unit norm
data = [[3, 4]]
Normalized: [[0.6, 0.8]]  # √(0.6² + 0.8²) = 1

# StandardScaler: Scales each COLUMN
data = [[3], [4], [5]]
Scaled: [[-1.22], [0], [1.22]]  # mean=0, std=1 for column

Use Normalizer for:
- Text classification (TF-IDF)
- Cosine similarity
- When direction matters, not magnitude

Use StandardScaler/MinMaxScaler for:
- ML algorithms (KNN, SVM)
- When features need same scale
```

**Key Insight:** Normalizer is unique—it makes each sample a unit vector, perfect for similarity calculations where direction matters more than magnitude.

## Q3: How do you handle outliers? When to remove vs transform?

**Answer:**

**4 Strategies:**

1. **Remove** (delete rows)
   - When: Outliers are errors, large dataset
   - Pros: Clean data
   - Cons: Lose information

2. **Cap** (Winsorization)
   - When: Outliers valid but extreme, small dataset
   - Pros: Keep all rows
   - Cons: Distorts values

3. **Transform** (log, sqrt)
   - When: Right-skewed data
   - Pros: Natural handling
   - Cons: Changes interpretation

4. **Separate** (treat differently)
   - When: Outliers are meaningful (VIP, fraud)
   - Pros: Preserves information
   - Cons: Complex modeling

**Decision:**
```
Are outliers errors? → Remove
Small dataset? → Cap
Skewed data? → Transform
Meaningful outliers? → Separate treatment
```

**Key Insight:** Don't blindly remove outliers. In fraud detection, outliers ARE the target. In customer segmentation, outliers might be VIP customers worth special treatment.

## Q4: What is data leakage in feature scaling?

**Answer:**

**Data leakage** occurs when test data information influences training.

**Wrong:**
```python
# Fit scaler on ALL data
scaler.fit(X)  # Includes test data!
X_train, X_test = split(X)
```

**Correct:**
```python
# Split first
X_train, X_test = split(X)
# Fit on train only
scaler.fit(X_train)
X_train_scaled = scaler.transform(X_train)
X_test_scaled = scaler.transform(X_test)  # Use train stats
```

**Why it matters:**
- Test set statistics (mean, min, max) leak into training
- Overly optimistic performance estimates
- Model won't generalize to new data

**Example:**
```python
# With leakage
Test max = 100
Train fitted on [0-100] range
Appears to work well on test

# Without leakage (production)
New data max = 150
Train fitted on [0-100] range
Model breaks on new data!
```

**Prevention:**
- Always split before scaling
- Use Pipelines
- Cross-validation handles this automatically

**Key Insight:** The model should only know about training data. Test data represents future unseen data—any information from it leaking to training invalidates your evaluation.

## Q5: Which ML algorithms require feature scaling and why?

**Answer:**

**Require Scaling:**

1. **Distance-based** (KNN, K-Means, SVM)
   - Why: Use distance calculations
   - Example: Age (0-100) vs Income (0-100000) → Income dominates

2. **Gradient Descent** (Neural Networks, Logistic Regression)
   - Why: Faster convergence, better performance
   - Example: Large values cause large gradients

3. **PCA**
   - Why: Variance-based, larger scale = higher variance

**Don't Require:**

1. **Tree-based** (Decision Trees, Random Forest, XGBoost)
   - Why: Split on thresholds, scale doesn't matter
   - Example: "Age > 30" works regardless of scale

2. **Naive Bayes**
   - Why: Probability-based

```python
# Example
data = {'age': [25], 'income': [50000]}

KNN: distance = √((25)² + (50000)²) ≈ 50000
     Income completely dominates!
     → NEEDS SCALING

Decision Tree: if age > 30: ... if income > 40000: ...
               Scale doesn't matter
               → NO SCALING NEEDED
```

**Key Insight:** Algorithms that use distance or gradient descent need scaling. Tree-based algorithms split on thresholds, so scale is irrelevant.

## Q6: Explain the Z-Score method for outlier detection

**Answer:**

**Z-Score** measures how many standard deviations a point is from the mean.

**Formula:**
```
z = (x - mean) / std_dev
```

**Detection Rule:**
- |z| > 3: Outlier (99.7% of data within 3 standard deviations)
- |z| > 2: Potential outlier (95% within 2 standard deviations)

**Example:**
```python
data = [10, 12, 14, 16, 18, 100]

mean = 28.33
std = 35.14

For x = 100:
z = (100 - 28.33) / 35.14 = 2.04

For x = 18:
z = (18 - 28.33) / 35.14 = -0.29
```

**Limitations:**
1. Assumes normal distribution
2. Sensitive to extreme outliers (they affect mean and std)
3. Not good for skewed data

**When to use:**
- Data is approximately normal
- Quick, simple detection
- Small to medium datasets

**Key Insight:** Z-Score works well for normal distributions but has a catch-22: extreme outliers affect the mean and std, making them harder to detect!

## Q7: What's the difference between MinMaxScaler and StandardScaler?

**Answer:**

**MinMaxScaler:**
- Formula: `(x - min) / (max - min)`
- Range: [0, 1] or custom
- Preserves zero
- Very sensitive to outliers

**StandardScaler:**
- Formula: `(x - mean) / std`
- Range: Unbounded (typically -3 to 3)
- Centers at zero (mean = 0)
- Less sensitive to outliers than MinMaxScaler

**Example:**
```python
data = [10, 20, 30, 40, 50, 1000]

MinMaxScaler: [0.00, 0.01, 0.02, 0.03, 0.04, 1.00]
              → Normal values compressed near 0!

StandardScaler: [-0.48, -0.47, -0.46, -0.45, -0.44, 2.30]
                → Less compression
```

**When to use MinMaxScaler:**
- Need bounded range (neural network activation)
- Features are not normally distributed
- No outliers

**When to use StandardScaler:**
- Features are normally distributed
- Using distance-based algorithms
- Some outliers present (but use RobustScaler if many)

**Key Insight:** MinMaxScaler is great when you need bounded output but terrible with outliers. StandardScaler is more versatile but doesn't guarantee a specific range.

## Q8: How does IQR method for outlier detection work?

**Answer:**

**IQR (Interquartile Range)** uses percentiles instead of mean/std.

**Method:**
```
1. Calculate Q1 (25th percentile) and Q3 (75th percentile)
2. IQR = Q3 - Q1
3. Lower bound = Q1 - 1.5 × IQR
4. Upper bound = Q3 + 1.5 × IQR
5. Outliers: values < lower or > upper
```

**Example:**
```python
data = [10, 12, 15, 18, 20, 22, 25, 100]

Q1 = 13.5
Q3 = 21
IQR = 7.5

Lower = 13.5 - 1.5 × 7.5 = 2.25
Upper = 21 + 1.5 × 7.5 = 32.25

Outlier: 100 (> 32.25)
```

**Advantages over Z-Score:**
1. Robust to extreme outliers
2. No distribution assumption
3. Works with skewed data
4. Visual (box plots)

**Disadvantages:**
- May flag too many points
- 1.5 multiplier is arbitrary
- Less effective for small datasets

**Key Insight:** IQR is more robust than Z-Score because it uses percentiles, which aren't affected by extreme values. It's the method behind box plots.

## Q9: When would you use log transformation?

**Answer:**

Use **log transformation** when:

1. **Data is right-skewed** (long tail on right)
2. **Exponential relationships** exist
3. **Data spans orders of magnitude**
4. **Multiplicative effects** present

**Example:**
```python
Income: [30K, 40K, 50K, 100K, 500K, 2M]
Highly skewed!

log(30K)  ≈ 10.3
log(100K) ≈ 11.5
log(2M)   ≈ 14.5

Range compressed from 2M to ~4.2
Distribution more normal
```

**Benefits:**
- Makes distribution more normal
- Reduces impact of outliers
- Converts multiplicative to additive
- Improves model performance

**Implementation:**
```python
# For x > 0
np.log(x)

# For x ≥ 0 (handles zeros)
np.log1p(x)  # log(1 + x)

# For any x (add constant)
np.log(x + constant)
```

**Don't use when:**
- Data has zeros/negatives (without adjustment)
- Already normally distributed
- Interpretability critical

**Key Insight:** Log transformation is powerful for right-skewed data and makes multiplicative relationships additive, but remember to inverse transform (exp) predictions!

## Q10: Explain data leakage in cross-validation with scaling

**Answer:**

**The Problem:**
```python
# WRONG: Scale before cross-validation
X_scaled = scaler.fit_transform(X)
cv_scores = cross_val_score(model, X_scaled, y, cv=5)
# Leakage: Test fold info in training folds!
```

**Why it's wrong:**
1. Scaler sees ALL data (including test folds)
2. Test fold statistics leak into training
3. Performance estimates too optimistic

**Correct Approach:**
```python
# Use Pipeline
from sklearn.pipeline import Pipeline

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('model', SVC())
])

cv_scores = cross_val_score(pipeline, X, y, cv=5)
# No leakage: Scaler fits on training folds only
```

**What Pipeline does:**
```
Fold 1: Train on folds 2-5, test on fold 1
        → Scaler fits on folds 2-5 only
        → Transform fold 1 using those stats

Fold 2: Train on folds 1,3-5, test on fold 2
        → Scaler fits on folds 1,3-5 only
        → Transform fold 2 using those stats
...
```

**Key Insight:** Cross-validation simulates multiple train-test splits. Scaling must happen independently for each split, which Pipeline handles automatically.

## Summary

**Key Takeaways:**
1. Choose scaler based on data characteristics
2. RobustScaler for outliers, StandardScaler for normal data
3. Normalizer is unique—row-wise scaling
4. Always split before scaling to prevent leakage
5. Different outlier strategies for different scenarios
6. Tree-based models don't need scaling
7. Use Pipelines for correct cross-validation

**Interview Tips:**
- Explain WHY, not just WHAT
- Give concrete examples
- Mention trade-offs
- Show awareness of edge cases
- Demonstrate practical experience

---

**Navigation:**
- **Previous:** [← Comparison Guide](./scaling-comparison-guide.md)
- **All Topics:** [Feature Engineering Overview](./README.md)
- **Related:** [Why Scaling Matters](./scaling-why-important.md)
