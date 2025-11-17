# Probability Distributions

## Overview
Probability distributions describe how probabilities are spread across different possible values. Understanding distributions is crucial for modeling real-world phenomena, making predictions, and conducting statistical tests.

---

## 1. Types of Distributions

### Discrete vs Continuous

**Discrete Distributions:**
- Countable outcomes (0, 1, 2, 3...)
- Use PMF (Probability Mass Function)
- Examples: Number of customers, defects, clicks

**Continuous Distributions:**
- Infinite possible values (any real number in range)
- Use PDF (Probability Density Function)
- Examples: Height, time, temperature

---

## 2. Bernoulli Distribution

### Definition
Models a **single trial** with two outcomes: Success (1) or Failure (0)

**Parameters:**
- p = probability of success
- (1-p) = probability of failure

**PMF:**
```
P(X = 1) = p
P(X = 0) = 1 - p

or mathematically:
P(X = k) = p^k × (1-p)^(1-k)  where k ∈ {0, 1}
```

**Properties:**
```
Mean (μ):       E(X) = p
Variance (σ²):  Var(X) = p(1-p)
Std Dev (σ):    σ = √[p(1-p)]
```

**ASCII Visualization:**
```
p = 0.7 (70% success rate)

Probability
    |
0.7 |     ███
    |     ███
    |     ███
0.3 |            ███
    |            ███
0.0 |____________███________
         0           1
       Fail      Success

P(X=0) = 0.3
P(X=1) = 0.7
```

---

### Real-World Examples

**Example 1: Click/No-Click on Ad**
```python
# Single user sees ad
p = 0.05  # 5% click-through rate

P(Click) = 0.05
P(No Click) = 0.95

Expected value = 0.05 (average "clicks" per view)
Variance = 0.05 × 0.95 = 0.0475
```

**Example 2: Coin Flip**
```
Fair coin: p = 0.5
P(Heads) = 0.5
P(Tails) = 0.5

Mean = 0.5
Variance = 0.5 × 0.5 = 0.25
```

**When to use:**
- Single trial experiments
- Binary outcomes (yes/no, pass/fail, 0/1)
- Building block for Binomial distribution

---

## 3. Binomial Distribution

### Definition
Models **n independent Bernoulli trials** - counts number of successes

**Parameters:**
- n = number of trials
- p = probability of success in each trial

**PMF:**
```
P(X = k) = C(n,k) × p^k × (1-p)^(n-k)

where:
  C(n,k) = n! / (k!(n-k)!)  [combinations]
  k = number of successes (0 to n)
```

**Properties:**
```
Mean:     μ = n × p
Variance: σ² = n × p × (1-p)
Std Dev:  σ = √[n × p × (1-p)]
```

**Requirements (must all be true):**
1. Fixed number of trials (n)
2. Each trial independent
3. Only two outcomes per trial
4. Probability (p) constant across trials

**ASCII Visualization:**
```
n = 10 flips, p = 0.5 (fair coin)

Probability
     |              ___
0.25 |           __|   |__
     |        __|           |__
0.20 |     __|                 |__
     |  __|                       |__
0.15 | |                             |
     ||                               |
0.10 ||                               |
     ||                               |
0.05 ||                               |
     ||_______________________________|
0.00 |_________________________________
      0  1  2  3  4  5  6  7  8  9  10
         Number of Heads

Most likely: 5 heads (but any value 0-10 possible)
```

---

### Step-by-Step Calculation

**Example: 5 coin flips, find P(exactly 3 heads)**
```
Given: n = 5, p = 0.5, k = 3

Step 1: Calculate combinations
  C(5,3) = 5! / (3! × 2!)
         = (5 × 4 × 3 × 2 × 1) / ((3 × 2 × 1) × (2 × 1))
         = 120 / (6 × 2)
         = 10

Step 2: Calculate probability
  P(X = 3) = C(5,3) × (0.5)³ × (0.5)²
           = 10 × 0.125 × 0.25
           = 10 × 0.03125
           = 0.3125 = 31.25%

Interpretation: In 5 flips, 31.25% chance of exactly 3 heads
```

**All Outcomes for 5 Flips:**
```
k  | Combinations | Probability | Percentage
---|--------------|-------------|------------
0  | 1            | 0.0313      | 3.13%
1  | 5            | 0.1563      | 15.63%
2  | 10           | 0.3125      | 31.25%
3  | 10           | 0.3125      | 31.25%
4  | 5            | 0.1563      | 15.63%
5  | 1            | 0.0313      | 3.13%
                  Total = 1.00   100%
```

---

### Real-World Applications

**Application 1: Quality Control**
```
Production line: 2% defect rate
Inspect 100 items
Question: Probability of finding ≤ 3 defects?

Parameters: n = 100, p = 0.02

Expected defects: μ = 100 × 0.02 = 2
Std Dev: σ = √(100 × 0.02 × 0.98) = 1.4

P(X ≤ 3) = P(X=0) + P(X=1) + P(X=2) + P(X=3)
         ≈ 0.858 = 85.8%

Interpretation: 85.8% chance of 3 or fewer defects
```

**Application 2: A/B Testing**
```
Website test: 100 visitors to new page
Historical conversion: 5%
Question: How many conversions to expect?

Parameters: n = 100, p = 0.05

Mean conversions: μ = 100 × 0.05 = 5
Std Dev: σ = √(100 × 0.05 × 0.95) = 2.18

Likely range (95% confidence): 5 ± (2 × 2.18) = 1 to 9 conversions

If see 12+ conversions → new page might be better!
```

**Application 3: Marketing Campaign**
```
Email blast to 1000 customers
Expected open rate: 20%

Mean opens: 1000 × 0.20 = 200
Std Dev: √(1000 × 0.20 × 0.80) = 12.65

Expected range: 200 ± 25 (roughly 175-225 opens)
```

---

## 4. Uniform Distribution

### Discrete Uniform

**Definition:** All outcomes equally likely

**PMF:**
```
P(X = k) = 1/n  for k = 1, 2, ..., n
```

**Example: Fair Die**
```
X = {1, 2, 3, 4, 5, 6}
P(X = k) = 1/6 for any k

Visualization:
Probability
     |
1/6  | ███  ███  ███  ███  ███  ███
     |
0    |_________________________________
       1    2    3    4    5    6
           Outcome

Mean: (1+2+3+4+5+6)/6 = 3.5
```

---

### Continuous Uniform

**Definition:** All values in interval [a, b] equally likely

**PDF:**
```
f(x) = 1/(b-a)  for a ≤ x ≤ b
f(x) = 0        otherwise

Probability of interval:
P(x₁ ≤ X ≤ x₂) = (x₂ - x₁)/(b - a)
```

**Properties:**
```
Mean:     μ = (a + b)/2
Variance: σ² = (b - a)²/12
```

**ASCII Visualization:**
```
Uniform[0, 10]

Density
     |
0.10 |████████████████████████████
     |████████████████████████████
     |████████████████████████████
0.05 |████████████████████████████
     |████████████████████████████
0.00 |____________________________
      0    2    4    6    8    10
               Value

Height = 1/(10-0) = 0.1 everywhere
```

---

### Real-World Examples

**Example 1: Random Number Generator**
```python
# Random number between 0 and 1
a = 0, b = 1

P(0.25 ≤ X ≤ 0.75) = (0.75 - 0.25)/(1 - 0)
                    = 0.50 = 50%

Mean = (0 + 1)/2 = 0.5
```

**Example 2: Waiting Time**
```
Bus arrives randomly within 30-minute window
X ~ Uniform[0, 30] minutes

P(wait ≤ 10 min) = 10/30 = 33.3%
P(wait between 10-20 min) = 10/30 = 33.3%

Expected wait time = 15 minutes
```

**When to use:**
- Random sampling
- Default prior in Bayesian analysis (no information)
- Simulations and random number generation

---

## 5. Normal (Gaussian) Distribution

### Definition
The famous **bell curve** - most important continuous distribution

**PDF:**
```
f(x) = (1/(σ√(2π))) × e^(-(x-μ)²/(2σ²))

where:
  μ = mean (center of distribution)
  σ = standard deviation (spread)
  σ² = variance
```

**Parameters:**
- μ (mu): mean, median, mode (all equal for normal)
- σ (sigma): standard deviation

**Notation:** X ~ N(μ, σ²)

**ASCII Visualization:**
```
Standard Normal: N(0, 1)

Density
     |         ___
0.4  |       /     \
     |      /       \
0.3  |     /         \
     |    /           \
0.2  |   /             \
     |  /               \
0.1  | /                 \
     |/___________________\____
0.0  |________________________
      -3  -2  -1   0   1   2   3
                  x

Symmetric around mean (0)
68% within ±1σ
95% within ±2σ
99.7% within ±3σ
```

---

### The 68-95-99.7 Rule (Empirical Rule)

**Most important property of normal distribution:**

```
         68.2% of data
    |←─────────────────→|
         95.4% of data
  |←─────────────────────→|
        99.7% of data
|←──────────────────────────→|
────────────────────────────────
-3σ  -2σ  -1σ   μ  +1σ  +2σ  +3σ


Specifically:
- 68.2% within μ ± 1σ
- 95.4% within μ ± 2σ
- 99.7% within μ ± 3σ
```

**Practical Implications:**
- Values beyond ±2σ are unusual (only 5%)
- Values beyond ±3σ are very rare (only 0.3%)
- Used for outlier detection

---

### Standard Normal Distribution (Z-scores)

**Definition:** Normal with μ=0, σ=1

**Z-score Transformation:**
```
z = (x - μ)/σ

Converts any normal distribution to standard normal
```

**Purpose:**
- Compare values from different distributions
- Look up probabilities in Z-table
- Standardize features for ML

**Example - Test Scores:**
```
Math test:  μ = 70, σ = 10, your score = 85
English test: μ = 75, σ = 5, your score = 82

Which score is better?

Math z-score:    z = (85 - 70)/10 = 1.5
English z-score: z = (82 - 75)/5  = 1.4

Math score is better (1.5 SD above mean vs 1.4 SD)
```

---

### Real-World Applications

**Application 1: Heights**
```
Adult male heights: μ = 175 cm, σ = 7 cm

Questions:
1) What % of men taller than 182 cm?
   z = (182 - 175)/7 = 1.0
   P(Z > 1.0) ≈ 15.9%

2) Height range for middle 95%?
   μ ± 2σ = 175 ± 14 = [161, 189] cm

3) Is 195 cm unusually tall?
   z = (195 - 175)/7 = 2.86
   Yes! Beyond 2.5 SD (very rare)
```

**Application 2: Manufacturing Tolerances**
```
Bolt diameter: μ = 10.0 mm, σ = 0.1 mm
Spec: 10.0 ± 0.2 mm

What % defective?
  Lower spec: z = (9.8 - 10.0)/0.1 = -2.0
  Upper spec: z = (10.2 - 10.0)/0.1 = +2.0

  P(within spec) = P(-2 < Z < 2) ≈ 95.4%
  P(defective) ≈ 4.6%

Process capability good (only 4.6% defects)
```

**Application 3: Financial Returns**
```
Stock returns: μ = 8% annually, σ = 15%

Question: Probability of loss (return < 0%)?

z = (0 - 8)/15 = -0.53
P(Z < -0.53) ≈ 29.8%

About 30% chance of loss in any given year
```

---

### Properties of Normal Distribution

**Key Properties:**
1. **Symmetric** around mean
2. **Bell-shaped** curve
3. **Mean = Median = Mode**
4. **Asymptotic** (tails never touch x-axis)
5. **Total area = 1**
6. **Uniquely determined by μ and σ**

**Why so important?**
- Many natural phenomena are normal (or approximately)
- Central Limit Theorem (sample means → normal)
- Foundation for inference (t-tests, confidence intervals)
- Easy to work with mathematically

---

## 6. Log-Normal Distribution

### Definition
If ln(X) ~ Normal, then X ~ Log-Normal

**When X is log-normal:**
- X is always positive (X > 0)
- ln(X) is normally distributed
- Distribution is right-skewed (long right tail)

**PDF:**
```
f(x) = (1/(xσ√(2π))) × e^(-(ln(x)-μ)²/(2σ²))  for x > 0

where μ and σ are parameters of the underlying normal distribution
```

**ASCII Visualization:**
```
Log-Normal Distribution

Density
     |
     |█
     |██
0.3  |███
     |████
0.2  |█████
     |██████___
0.1  |█████████____
     |██████████████_____
0.0  |████████████████████________
      0   1   2   3   4   5   6   7
                  x

Positive values only
Right-skewed
Mode < Median < Mean
```

**Properties:**
```
Mean:     E(X) = e^(μ + σ²/2)
Median:   e^μ
Mode:     e^(μ - σ²)
Variance: (e^(σ²) - 1) × e^(2μ + σ²)
```

---

### Real-World Applications

**Application 1: Income Distribution**
```
Reason: Can't be negative, few high earners skew distribution

Example city:
  Median income: $50,000
  Mean income:   $65,000  (pulled up by high earners)
  Mode:          $45,000  (most common)

Log-normal fits better than normal for:
- Salaries
- Wealth
- House prices
```

**Application 2: Stock Prices**
```
Stock prices can't go negative
Returns are often normally distributed
Therefore prices are log-normally distributed

Example:
  Stock at $100
  Daily return ~ N(0.05%, 2%)
  Future price ~ Log-Normal

After 1 year, price distribution:
  Median: ~$105
  Mean:   ~$108 (slightly higher due to skew)
  Can't go below $0
```

**Application 3: File Sizes**
```
Most files are small
Few files are very large
Always positive

Typical distribution:
  Mode:   10 KB
  Median: 50 KB
  Mean:   200 KB (skewed by large files)
```

**Application 4: Reliability/Survival Times**
```
Time until component failure
Particle sizes
Chemical concentrations
Biological measurements

Example - Light bulb lifetime:
  Most fail around median (1000 hours)
  Some fail early
  Some last much longer (right tail)
  Can't fail before time 0
```

---

### Normal vs Log-Normal

**When to use Normal:**
- Data symmetric around mean
- Values can be negative
- Examples: Heights, test scores, errors

**When to use Log-Normal:**
- Data right-skewed (long right tail)
- Values must be positive
- Multiplicative processes
- Examples: Income, prices, file sizes

**Visual Comparison:**
```
Normal:              Log-Normal:
    ___                  █
   /   \               ███
  /     \            ████████___
 /       \          ██████████████_____
/         \        ████████████████████____
─────┼─────        ─────┼──────────────────
   mean=median          mode<median<mean
   symmetric            right-skewed
```

---

## 7. Choosing the Right Distribution

### Decision Tree
```
                    Start
                      |
            Discrete or Continuous?
              /              \
         Discrete          Continuous
            |                  |
    Two outcomes?         Always positive?
       /     \               /      \
     Yes     No            Yes       No
      |       |             |         |
   Bernoulli  |        Skewed?     Normal
              |         /    \
       Fixed trials?  Yes    No
         /    \        |      |
       Yes    No    LogNorm Uniform
        |      |
    Binomial  ...
```

### Quick Reference Table

| Distribution | Type | Use When | Parameters | Example |
|-------------|------|----------|------------|---------|
| **Bernoulli** | Discrete | Single trial, 2 outcomes | p | Coin flip |
| **Binomial** | Discrete | n trials, count successes | n, p | 10 coin flips |
| **Uniform** | Both | All values equally likely | a, b | Random number |
| **Normal** | Continuous | Symmetric, central tendency | μ, σ | Heights, IQ |
| **Log-Normal** | Continuous | Positive, right-skewed | μ, σ | Income, stock price |

---

## 8. Practice Problems

### Problem 1: Quality Control (Binomial)
```
Manufacturing: 1% defect rate
Sample: 50 items
Find: P(at most 2 defects)

Given: n = 50, p = 0.01

P(X ≤ 2) = P(X=0) + P(X=1) + P(X=2)

P(X=0) = C(50,0) × (0.01)⁰ × (0.99)⁵⁰ = 0.605
P(X=1) = C(50,1) × (0.01)¹ × (0.99)⁴⁹ = 0.306
P(X=2) = C(50,2) × (0.01)² × (0.99)⁴⁸ = 0.076

P(X ≤ 2) = 0.605 + 0.306 + 0.076 = 0.987 = 98.7%

Very likely to have ≤ 2 defects in sample of 50
```

### Problem 2: Height Analysis (Normal)
```
Women's heights: μ = 165 cm, σ = 6 cm

a) What % between 159 and 171 cm?
   z₁ = (159-165)/6 = -1.0
   z₂ = (171-165)/6 = +1.0
   P(-1 < Z < 1) ≈ 68%

b) How tall is 95th percentile?
   z = 1.645 (from Z-table)
   x = μ + z×σ = 165 + 1.645×6 = 174.87 cm

c) Is 180 cm unusually tall?
   z = (180-165)/6 = 2.5
   Yes! Beyond 2 SD (top 1%)
```

### Problem 3: Stock Price (Log-Normal)
```
Stock currently $50
Annual return ~ N(10%, 20%)

After 1 year, what's probability stock > $60?

ln(60/50) = ln(1.2) = 0.182
This needs to happen with return ~ N(0.10, 0.20)

z = (0.182 - 0.10)/0.20 = 0.41
P(Z > 0.41) ≈ 34%

About 34% chance stock exceeds $60
```

---

## 9. Common Mistakes

### Mistake 1: Confusing Parameters
```
❌ Normal(10, 4) - is 4 the variance or SD?
✓ Always clarify: N(μ=10, σ²=4) or N(μ=10, σ=2)
```

### Mistake 2: Using Binomial When Trials Not Independent
```
❌ Drawing cards without replacement
✓ Use hypergeometric distribution instead
```

### Mistake 3: Applying Normal to Bounded Data
```
❌ Test scores (0-100) as purely normal
✓ Normal approximation OK if μ far from bounds
   Otherwise consider truncated normal or beta
```

---

## Key Takeaways

1. **Bernoulli** - Single trial, builds to Binomial
2. **Binomial** - Count successes in n trials (discrete)
3. **Uniform** - All outcomes equally likely (baseline)
4. **Normal** - Bell curve, most important (symmetric)
5. **Log-Normal** - Right-skewed, positive values only
6. **68-95-99.7 rule** - Master this for normal distribution
7. **Z-scores** - Standardize to compare across distributions
8. **Choose wisely** - Match distribution to data characteristics

**Remember:** The distribution you choose should reflect the underlying process generating your data!
