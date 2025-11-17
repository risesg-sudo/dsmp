# Descriptive Statistics

## Overview
Descriptive statistics help us summarize and describe the main features of a dataset. They provide simple summaries about the sample and measures, forming the basis of virtually every quantitative analysis.

---

## 1. Measures of Central Tendency

### Mean (Average)
**What it is:** The sum of all values divided by the number of values.

**Formula:**
```
Mean (μ or x̄) = Σx / n
where:
  x = individual values
  n = number of values
```

**Intuition:**
If you were to redistribute all values equally among all data points, each would get the mean value.

**When to use:**
- Data is normally distributed (symmetric)
- No extreme outliers
- Want to use all data points in calculation

**Example - E-commerce:**
```python
daily_sales = [120, 145, 130, 125, 135, 128, 132]
mean_sales = sum(daily_sales) / len(daily_sales)
# Result: 130.71 units/day

# Use case: Forecast inventory based on average daily sales
```

**Limitations:**
- Sensitive to outliers
- Can be misleading with skewed data

---

### Median
**What it is:** The middle value when data is sorted. 50% of values are below, 50% above.

**How to calculate:**
1. Sort the data
2. If odd number of values: take the middle one
3. If even number: average the two middle values

**Formula:**
```
For sorted data:
  n odd:  Median = x[(n+1)/2]
  n even: Median = (x[n/2] + x[n/2+1]) / 2
```

**Intuition:**
The "typical" value that divides the dataset in half.

**When to use:**
- Data has outliers
- Skewed distributions (income, house prices)
- Ordinal data (rankings, ratings)

**Example - Salary Data:**
```python
salaries = [45000, 48000, 50000, 52000, 250000]  # One CEO salary
mean_salary = 89000    # Misleading!
median_salary = 50000  # More representative

# Real-world: Median income is better for understanding "typical" salary
```

**ASCII Visualization:**
```
Sorted data: [10, 20, 30, 40, 50]
                      ↑
                   Median (30)
```

---

### Mode
**What it is:** The most frequently occurring value(s) in the dataset.

**Characteristics:**
- Can have no mode (all values unique)
- Can have one mode (unimodal)
- Can have multiple modes (bimodal, multimodal)

**When to use:**
- Categorical data (most popular product)
- Discrete data (shoe sizes, number of children)
- Finding the "most common" value

**Example - Product Sizes:**
```python
sizes_sold = ['S', 'M', 'M', 'L', 'M', 'XL', 'M', 'S']
# Mode = 'M' (appears 4 times)

# Use case: Stock more Medium sizes for next order
```

**Real-world Application - Quality Control:**
```
Defects per batch: [0, 0, 0, 1, 0, 2, 0, 0, 3, 0]
Mode = 0 (most batches have zero defects - good quality!)
Mean = 0.6 (average defects)
```

---

## 2. Measures of Dispersion (Spread)

### Range
**What it is:** Difference between maximum and minimum values.

**Formula:**
```
Range = Maximum - Minimum
```

**Intuition:** How spread out are the extreme values?

**Example:**
```python
test_scores_classA = [85, 87, 88, 89, 90]  # Range = 5
test_scores_classB = [60, 75, 88, 95, 100] # Range = 40

# Class A is more consistent, Class B has more variation
```

**Limitations:**
- Only uses two data points
- Very sensitive to outliers
- Doesn't tell us about middle values

---

### Variance
**What it is:** Average of squared differences from the mean.

**Formula:**
```
Population Variance (σ²):
  σ² = Σ(x - μ)² / N

Sample Variance (s²):
  s² = Σ(x - x̄)² / (n - 1)

where:
  x = individual values
  μ or x̄ = mean
  N or n = number of values
  (n-1) = Bessel's correction for unbiased estimate
```

**Why square the differences?**
1. Negative and positive differences don't cancel out
2. Penalizes outliers more heavily
3. Mathematical properties useful for further analysis

**Intuition:**
How far, on average (squared), are the data points from the mean?

**Step-by-step Calculation:**
```
Data: [4, 8, 6, 5, 7]

Step 1: Calculate mean
  Mean = (4+8+6+5+7)/5 = 6

Step 2: Find differences from mean
  4-6=-2, 8-6=2, 6-6=0, 5-6=-1, 7-6=1

Step 3: Square the differences
  4, 4, 0, 1, 1

Step 4: Average the squared differences
  Variance = (4+4+0+1+1)/5 = 2
```

---

### Standard Deviation (SD)
**What it is:** Square root of variance. Most common measure of spread.

**Formula:**
```
Population SD (σ):
  σ = √(σ²) = √[Σ(x - μ)² / N]

Sample SD (s):
  s = √(s²) = √[Σ(x - x̄)² / (n - 1)]
```

**Intuition:**
Average distance of data points from the mean (in original units).

**Why use SD instead of Variance?**
- Same units as original data (variance is in squared units)
- Easier to interpret
- Compare directly with mean

**Example - Manufacturing:**
```python
# Target widget length: 10.0 cm
machine_A = [9.8, 9.9, 10.0, 10.1, 10.2]  # SD = 0.158 cm
machine_B = [8.5, 9.5, 10.0, 10.5, 11.5]  # SD = 1.118 cm

# Machine A is more precise (lower SD)
# Use Machine A for quality-critical products
```

**Empirical Rule (68-95-99.7) for Normal Distribution:**
```
        |←     68%     →|
    |←      95%      →|
|←        99.7%        →|
─────────────────────────
   -3σ  -2σ  -1σ  μ  +1σ  +2σ  +3σ

- 68% of data within 1 SD of mean
- 95% within 2 SD
- 99.7% within 3 SD
```

---

## 3. Practical Comparison

### Dataset Analysis Example
```
Website Response Times (milliseconds):
[120, 125, 130, 128, 135, 500, 122, 127]

Mean     = 173.4 ms   (affected by 500ms outlier)
Median   = 127.5 ms   (robust to outlier)
Mode     = None       (no repeating values)
Range    = 380 ms     (shows extreme variation)
Std Dev  = 130.2 ms   (large due to outlier)

Conclusion: Median is best measure here. One slow page load (500ms)
            shouldn't represent "typical" user experience.
```

---

## 4. Choosing the Right Measure

### Decision Tree for Central Tendency:
```
                    Start
                      |
            Numerical or Categorical?
                /           \
          Numerical      Categorical
              |               |
        Any outliers?       MODE
          /      \
        Yes       No
         |        |
      MEDIAN    MEAN
```

### When to use each measure:

| Measure | Best For | Example Use Cases |
|---------|----------|-------------------|
| **Mean** | Symmetric data, no outliers | Test scores, heights, weights |
| **Median** | Skewed data, outliers present | Income, house prices, response times |
| **Mode** | Categorical data, discrete values | Product colors, defect counts |
| **Range** | Quick spread check | Initial data exploration |
| **Std Dev** | Quantifying variability | Quality control, risk assessment |
| **Variance** | Statistical calculations | ANOVA, regression analysis |

---

## 5. Real-World Applications

### A/B Testing - Website Conversion
```
Version A (Control):
  Conversions: [45, 48, 46, 47, 49, 45, 48]
  Mean: 46.86%
  Std Dev: 1.57%

Version B (Test):
  Conversions: [51, 53, 52, 50, 54, 51, 52]
  Mean: 51.86%
  Std Dev: 1.35%

Analysis:
- Version B has 5% higher mean conversion
- Version B also more consistent (lower SD)
- Clear winner: Version B
```

### Quality Control - Manufacturing
```
Acceptable bolt diameter: 10mm ± 0.2mm

Production line measurements:
[10.1, 9.9, 10.0, 10.2, 9.8, 10.1, 10.0]

Mean: 10.01 mm ✓ (close to target)
Std Dev: 0.14 mm ✓ (good precision)
Range: 0.4 mm (within tolerance)

All measurements within spec. Process is in control.
```

### Customer Satisfaction Analysis
```
Rating scores (1-5 scale):
[5, 4, 5, 3, 5, 4, 5, 2, 5, 4]

Mean: 4.2 ★★★★☆
Median: 4.5 (more representative - one 2-star is outlier)
Mode: 5 (most common rating - very satisfied)
Std Dev: 0.92 (moderate variation)

Insight: Most customers very satisfied (mode=5),
         but occasional poor experience (one 2-star)
```

---

## 6. Common Pitfalls and Tips

### Pitfall 1: Using Mean with Skewed Data
```
❌ WRONG: "Average house price is $800,000"
          (when 90% of houses are < $400,000)

✓ RIGHT: "Median house price is $350,000"
         "Mean is $800,000 (affected by luxury homes)"
```

### Pitfall 2: Ignoring Units in Variance
```
If measuring height in cm:
  Mean: 170 cm
  Variance: 100 cm²  (note: squared units!)
  Std Dev: 10 cm     (same units as data)
```

### Pitfall 3: Population vs Sample Formulas
```
Population (entire group):     divide by N
Sample (subset):               divide by (n-1)

Use n-1 for samples to get unbiased variance estimate
(Bessel's correction)
```

---

## 7. Quick Reference - Formulas

```
CENTRAL TENDENCY
────────────────
Mean:     x̄ = Σx / n
Median:   Middle value of sorted data
Mode:     Most frequent value

DISPERSION
──────────
Range:    Max - Min
Variance: s² = Σ(x - x̄)² / (n-1)
Std Dev:  s = √[Σ(x - x̄)² / (n-1)]
```

---

## 8. Practice Problems

### Problem 1: Customer Wait Times
```
Wait times (minutes): [5, 7, 6, 8, 25, 6, 7, 5]

Calculate:
a) Mean
b) Median
c) Standard Deviation
d) Which measure best represents "typical" wait time?

Solution:
a) Mean = 68/8 = 8.5 minutes
b) Median = (6+7)/2 = 6.5 minutes
c) SD = 6.3 minutes
d) Median (6.5 min) - one 25-minute outlier skews mean
```

### Problem 2: Product Quality
```
Defects per 100 units: [2, 1, 3, 1, 2, 1, 2, 1, 15, 2]

Which measure would a quality manager report to show
typical performance? Why?

Solution:
Median = 2 defects (or Mode = 1 defect)
One batch with 15 defects is anomaly (investigate separately)
Mean = 3 would misrepresent typical quality
```

---

## Key Takeaways

1. **Mean** - Use for symmetric data; affected by outliers
2. **Median** - Use for skewed data; robust to outliers
3. **Mode** - Use for categorical data; most common value
4. **Standard Deviation** - Preferred measure of spread; same units as data
5. **Variance** - Used in statistical formulas; squared units
6. **Context matters** - Always consider the data distribution and outliers
7. **Report multiple measures** - Give complete picture of your data

**Remember:** Descriptive statistics are the foundation of all data analysis. Master these concepts, and you'll understand more complex statistics much easier!
