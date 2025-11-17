# Confidence Intervals

## Overview
A confidence interval provides a range of plausible values for an unknown population parameter. Instead of a single point estimate, we express our uncertainty about the true value.

---

## 1. Core Concepts

### What is a Confidence Interval?

**Definition:**
A range of values that likely contains the true population parameter with a specified level of confidence.

```
Confidence Interval = Estimate ± Margin of Error

CI = x̄ ± (critical value) × (standard error)
```

**Intuition:**
- Point estimate (x̄): Our best guess
- Interval: Acknowledges uncertainty
- Confidence level: How sure we are

**Example:**
```
Sample mean height: 175 cm
95% CI: [172, 178] cm

Interpretation:
"We are 95% confident the true average height
is between 172 and 178 cm"
```

---

### Common Misconceptions

**❌ WRONG Interpretations:**
```
"95% probability the true mean is in this interval"
"95% of the data falls in this interval"
"There's a 95% chance this interval contains the mean"
```

**✓ CORRECT Interpretation:**
```
"If we repeated this sampling procedure 100 times,
approximately 95 of the resulting intervals would
contain the true population parameter"
```

**Visual Understanding:**
```
Imagine 20 samples, each producing a 95% CI:

True μ = 50
  |
Sample 1:  |----●----|          ✓ Contains μ
Sample 2:  |---●-----|          ✓ Contains μ
Sample 3:     |---●-----|       ✓ Contains μ
Sample 4:  |----●----|          ✓ Contains μ
Sample 5:  |---●-----|          ✓ Contains μ
Sample 6:       |---●-----|     ✓ Contains μ
Sample 7:  |----●----|          ✓ Contains μ
Sample 8:    |---●-----|        ✓ Contains μ
Sample 9:         |----●----|   ✗ Misses μ (rare!)
Sample 10: |---●-----|          ✓ Contains μ
...
Sample 20: |----●----|          ✓ Contains μ
           45   50   55

About 19 out of 20 (95%) capture the true mean
```

---

## 2. Confidence Levels

### Common Confidence Levels

```
Confidence Level | Critical Value (z) | α (alpha)
─────────────────|────────────────────|──────────
90%              | 1.645              | 0.10
95%              | 1.960              | 0.05
99%              | 2.576              | 0.01

α = 1 - confidence level
α/2 in each tail
```

**ASCII Visualization:**
```
95% Confidence Interval (z = 1.96)

        95% (captured)
    |←─────────────────→|
         ___
       /     \
      /       \      2.5%
     /    |    \      ↓
    /     |     \    ╱╲
   /      |      \  ╱  ╲
──────────┼──────────────
  -1.96   μ   +1.96

2.5% in left tail, 2.5% in right tail
Total: 5% outside interval (α = 0.05)
```

---

### Choosing Confidence Level

**Trade-off:**
```
Higher Confidence → Wider Interval
Lower Confidence → Narrower Interval

Example: μ = 100, σ = 15, n = 36, SE = 2.5

90% CI: 100 ± 1.645(2.5) = [95.9, 104.1]   Width: 8.2
95% CI: 100 ± 1.960(2.5) = [95.1, 104.9]   Width: 9.8
99% CI: 100 ± 2.576(2.5) = [93.6, 106.4]   Width: 12.8
```

**When to use which:**
- **90%:** Exploratory analysis, less critical decisions
- **95%:** Standard in most research (conventional)
- **99%:** High-stakes decisions (medical, safety)

---

## 3. CI for Population Mean (σ Known)

### Formula
```
CI = x̄ ± z(α/2) × σ/√n

where:
  x̄ = sample mean
  z(α/2) = critical z-value
  σ = population standard deviation (known)
  n = sample size
```

### Step-by-Step Example

**Scenario:**
Battery manufacturer claims mean lifetime = 500 hours.
You test 49 batteries:
- Sample mean: x̄ = 485 hours
- Population SD: σ = 42 hours (from historical data)
- Find 95% CI

**Solution:**
```
Step 1: Identify values
  x̄ = 485
  σ = 42
  n = 49
  Confidence level = 95% → z = 1.96

Step 2: Calculate SE
  SE = σ/√n = 42/√49 = 42/7 = 6

Step 3: Calculate margin of error
  ME = z × SE = 1.96 × 6 = 11.76

Step 4: Calculate CI
  Lower bound: 485 - 11.76 = 473.24
  Upper bound: 485 + 11.76 = 496.76

  95% CI: [473.24, 496.76] hours

Interpretation:
We are 95% confident the true mean battery life
is between 473.24 and 496.76 hours.

Note: Claimed 500 hours is outside this interval!
Evidence suggests actual lifetime is less.
```

---

## 4. CI for Population Mean (σ Unknown)

### When to Use t-Distribution

**Reality:** Usually don't know σ, must estimate from sample

**Use t-distribution when:**
- Population σ unknown
- Use sample SD (s) instead
- Accounts for additional uncertainty

**t-distribution vs Normal:**
```
         Normal (z)          t-distribution
            ___                   __
          /     \              /      \
         /       \            /        \
        /         \          /          \
       /           \        /            \
──────────────────────────────────────────
      Same center (0)

t-distribution:
- Heavier tails (more area in extremes)
- Accounts for uncertainty in estimating σ
- Depends on degrees of freedom (df = n-1)
- Approaches normal as n increases
```

### Formula
```
CI = x̄ ± t(α/2, df) × s/√n

where:
  x̄ = sample mean
  t(α/2, df) = critical t-value
  s = sample standard deviation
  n = sample size
  df = n - 1 (degrees of freedom)
```

### Step-by-Step Example

**Scenario:**
Quality check on widget weights:
- Sample: n = 16 widgets
- Sample mean: x̄ = 50.3 grams
- Sample SD: s = 2.4 grams
- Find 95% CI

**Solution:**
```
Step 1: Identify values
  x̄ = 50.3
  s = 2.4
  n = 16
  df = n - 1 = 15
  Confidence level = 95%

Step 2: Find critical t-value
  t(0.025, 15) = 2.131  [from t-table]

Step 3: Calculate SE
  SE = s/√n = 2.4/√16 = 2.4/4 = 0.6

Step 4: Calculate margin of error
  ME = t × SE = 2.131 × 0.6 = 1.279

Step 5: Calculate CI
  Lower: 50.3 - 1.279 = 49.02
  Upper: 50.3 + 1.279 = 51.58

  95% CI: [49.02, 51.58] grams

Interpretation:
We are 95% confident the true mean widget weight
is between 49.02 and 51.58 grams.

Note: Used t instead of z because σ unknown
```

---

## 5. CI for Population Proportion

### Formula
```
CI = p̂ ± z(α/2) × √(p̂(1-p̂)/n)

where:
  p̂ = sample proportion (x/n)
  z(α/2) = critical z-value
  n = sample size
```

**Requirements:**
- np̂ ≥ 10
- n(1-p̂) ≥ 10
(Ensures normal approximation valid)

### Step-by-Step Example

**Scenario:**
Survey on product satisfaction:
- Sample: n = 400 customers
- Satisfied: 320 customers
- Find 95% CI for proportion satisfied

**Solution:**
```
Step 1: Calculate sample proportion
  p̂ = 320/400 = 0.80

Step 2: Check conditions
  np̂ = 400(0.80) = 320 ≥ 10 ✓
  n(1-p̂) = 400(0.20) = 80 ≥ 10 ✓

Step 3: Find critical value
  95% CI → z = 1.96

Step 4: Calculate SE
  SE = √(p̂(1-p̂)/n)
     = √(0.80 × 0.20 / 400)
     = √(0.16/400)
     = √0.0004
     = 0.02

Step 5: Calculate margin of error
  ME = 1.96 × 0.02 = 0.0392

Step 6: Calculate CI
  Lower: 0.80 - 0.0392 = 0.7608
  Upper: 0.80 + 0.0392 = 0.8392

  95% CI: [0.7608, 0.8392] or [76.1%, 83.9%]

Interpretation:
We are 95% confident that between 76.1% and 83.9%
of all customers are satisfied.
```

---

## 6. Sample Size Determination

### How Many Samples Do I Need?

**For Population Mean:**
```
n = (z × σ / E)²

where:
  z = critical value for desired confidence level
  σ = population standard deviation
  E = desired margin of error
```

**Example: Election Poll**
```
Want margin of error = ±2% (0.02)
Confidence level = 95% → z = 1.96
Conservative estimate: p = 0.5 (maximum variance)

n = (1.96² × 0.5 × 0.5) / 0.02²
  = (3.84 × 0.25) / 0.0004
  = 0.96 / 0.0004
  = 2400

Need 2400 people for ±2% margin of error

For ±3%: n = 1067
For ±1%: n = 9604

Note: Margin of error ∝ 1/√n
To halve margin of error, need 4× sample size!
```

---

### For Population Proportion:**
```
n = (z/E)² × p̂(1-p̂)

If no estimate of p̂, use p̂ = 0.5 (most conservative)
```

**Example: Customer Satisfaction**
```
Current satisfaction rate ≈ 80%
Want margin of error = ±3% at 95% confidence

n = (1.96/0.03)² × 0.80 × 0.20
  = 42.68² × 0.16
  = 1821.98 × 0.16
  = 291.5

Need at least 292 customers in sample
```

---

## 7. Real-World Applications

### Application 1: A/B Testing

**Scenario:**
Testing new website button color:
```
Control (Blue):
  n = 1000, conversions = 80
  p̂ₐ = 0.08
  SE = √(0.08×0.92/1000) = 0.0086
  95% CI: 0.08 ± 1.96(0.0086) = [0.063, 0.097]

Test (Red):
  n = 1000, conversions = 95
  p̂ᵦ = 0.095
  SE = √(0.095×0.905/1000) = 0.0093
  95% CI: 0.095 ± 1.96(0.0093) = [0.077, 0.113]

Visualization:
    0.06  0.07  0.08  0.09  0.10  0.11  0.12
      |     |     |     |     |     |     |
Blue  |-----●-----|                         [6.3%, 9.7%]
Red          |--------●-----|              [7.7%, 11.3%]

Intervals overlap! Can't conclude Red is better.
Need more data or accept uncertainty.
```

---

### Application 2: Quality Control

**Scenario:**
Manufacturing bolts with target diameter 10mm ± 0.5mm
```
Sample: n = 25 bolts
Mean: 10.15mm
SD: 0.3mm

95% CI:
  t(24) = 2.064
  SE = 0.3/√25 = 0.06
  CI: 10.15 ± 2.064(0.06) = [10.03, 10.27]

Check against specs:
  Lower spec: 9.5mm  → CI well above ✓
  Upper spec: 10.5mm → CI well below ✓

Process within specifications!

If CI was [9.8, 10.6], would have problem:
  Some production likely exceeds 10.5mm upper limit
```

---

### Application 3: Medical Study

**Scenario:**
New drug reduces blood pressure:
```
Placebo group:
  n = 50, mean reduction = 5 mmHg, s = 8
  95% CI: 5 ± 2.009(8/√50) = [2.7, 7.3] mmHg

Drug group:
  n = 50, mean reduction = 12 mmHg, s = 7
  95% CI: 12 ± 2.009(7/√50) = [10.0, 14.0] mmHg

Visualization:
    0   2   4   6   8  10  12  14  16
    |   |   |   |   |   |   |   |   |
Placebo |---●---|                       [2.7, 7.3]
Drug             |-------●-------|      [10.0, 14.0]

No overlap! Strong evidence drug is effective.
```

---

## 8. Factors Affecting CI Width

### Four Main Factors

**1. Sample Size (n)**
```
Larger n → Narrower CI (more precise)

n=25:  CI = [47.2, 52.8]  Width: 5.6
n=100: CI = [48.1, 51.9]  Width: 3.8
n=400: CI = [49.0, 51.0]  Width: 2.0

Width ∝ 1/√n
```

**2. Confidence Level**
```
Higher confidence → Wider CI (more uncertain)

90% CI: [48.4, 51.6]  Width: 3.2
95% CI: [47.9, 52.1]  Width: 4.2
99% CI: [47.0, 53.0]  Width: 6.0
```

**3. Population Variability (σ or s)**
```
More variation → Wider CI

σ=5:  CI = [48.0, 52.0]  Width: 4.0
σ=10: CI = [46.1, 53.9]  Width: 7.8
σ=15: CI = [44.1, 55.9]  Width: 11.8

Can't control σ (inherent to population)
```

**4. Distribution Shape**
```
Heavily skewed → May need larger n
Non-normal → Consider transformations
```

### The Trade-off Triangle
```
        Precision
         (Narrow CI)
            △
           ╱ ╲
          ╱   ╲
         ╱     ╲
        ╱       ╲
       ╱_________╲
  Confidence    Cost
  (High %)    (Large n)

Can't optimize all three simultaneously!
Pick two, compromise on third.
```

---

## 9. Common Mistakes

### Mistake 1: Wrong Interpretation
```
❌ "95% chance true mean is in [48, 52]"
✓ "95% of such intervals contain true mean"

The interval is fixed once calculated.
The confidence is about the procedure, not this specific interval.
```

### Mistake 2: Using z when Should Use t
```
❌ n=20, σ unknown, using z=1.96
✓ n=20, σ unknown, using t(19)=2.093

When σ unknown, must use t (wider CI, more conservative)
```

### Mistake 3: Claiming Significance from CI
```
❌ "CIs overlap slightly, so no difference"
❌ "CIs don't overlap, so definitely different"

✓ Overlapping CIs don't rule out differences
  Need formal hypothesis test
  But non-overlapping CIs do suggest difference
```

### Mistake 4: Ignoring Assumptions
```
❌ n=10, heavily skewed data, using normal CI
✓ Check assumptions:
  - Independence of observations
  - Random sampling
  - Adequate sample size for distribution
  - No extreme outliers
```

---

## 10. Practice Problems

### Problem 1: Website Response Time
```
Sample: 64 page loads
Mean: 250 ms
SD: 40 ms
Find 95% CI for true mean response time

Solution:
  n = 64, x̄ = 250, s = 40
  df = 63, t ≈ 2.00 (large df, close to z)

  SE = 40/√64 = 5
  ME = 2.00 × 5 = 10

  CI: [240, 260] ms

95% confident true mean response time
is between 240 and 260 milliseconds.
```

---

### Problem 2: Conversion Rate
```
1200 visitors, 84 conversions
Find 90% CI for true conversion rate

Solution:
  p̂ = 84/1200 = 0.07
  Check: 1200(0.07) = 84 ≥ 10 ✓
         1200(0.93) = 1116 ≥ 10 ✓

  z(90%) = 1.645
  SE = √(0.07×0.93/1200) = 0.0074
  ME = 1.645 × 0.0074 = 0.0122

  CI: [0.0578, 0.0822] or [5.78%, 8.22%]

90% confident true conversion rate
is between 5.78% and 8.22%.
```

---

### Problem 3: Sample Size Planning
```
Want to estimate average salary with:
- Margin of error: ±$2000
- Confidence: 95%
- Estimated SD: $12,000

How many employees to survey?

Solution:
  E = 2000, σ = 12000, z = 1.96

  n = (z×σ/E)²
    = (1.96 × 12000 / 2000)²
    = (11.76)²
    = 138.3

  Need at least 139 employees.
```

---

## 11. Quick Reference

### Formulas Summary
```
Population Mean (σ known):
  CI = x̄ ± z(α/2) × σ/√n

Population Mean (σ unknown):
  CI = x̄ ± t(α/2, n-1) × s/√n

Population Proportion:
  CI = p̂ ± z(α/2) × √(p̂(1-p̂)/n)

Sample Size for Mean:
  n = (z×σ/E)²

Sample Size for Proportion:
  n = (z/E)² × p̂(1-p̂)
```

### Critical Values
```
Confidence | z-value | Common t-values
Level      |         | df=10 | df=20 | df=30
─────────────────────────────────────────────
90%        | 1.645   | 1.812 | 1.725 | 1.697
95%        | 1.960   | 2.228 | 2.086 | 2.042
99%        | 2.576   | 3.169 | 2.845 | 2.750
```

### Decision Tree
```
Need confidence interval?
    |
    ├─ For mean?
    |    ├─ σ known? → z-interval
    |    └─ σ unknown? → t-interval
    |
    └─ For proportion?
         └─ Check np≥10 and n(1-p)≥10 → z-interval
```

---

## Key Takeaways

1. **CI = Estimate ± Margin of Error** - quantifies uncertainty
2. **Interpretation matters** - about the procedure, not this specific interval
3. **Use t when σ unknown** - accounts for extra uncertainty
4. **Width affected by** n, confidence level, variability
5. **Larger n → narrower CI** - but diminishing returns
6. **Non-overlapping CIs** - strong evidence of difference
7. **Sample size planning** - use formulas to determine needed n
8. **Always check assumptions** - independence, randomness, sample size

**Remember:** Confidence intervals are more informative than point estimates. They quantify our uncertainty and are essential for making data-driven decisions with appropriate caution!
