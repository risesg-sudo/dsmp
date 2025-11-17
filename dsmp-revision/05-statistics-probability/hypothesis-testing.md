# Hypothesis Testing

## Overview
Hypothesis testing is a systematic method for making decisions about population parameters based on sample data. It's one of the most important tools in statistics and data science.

---

## 1. Core Concepts

### What is Hypothesis Testing?

**Purpose:**
Use sample data to decide between two competing claims about a population parameter.

**The Framework:**
```
1. State hypotheses (H₀ and Hₐ)
2. Choose significance level (α)
3. Collect data and calculate test statistic
4. Find p-value
5. Make decision (reject or fail to reject H₀)
6. State conclusion in context
```

**Two Hypotheses:**
```
H₀ (Null Hypothesis):
  - Status quo, no effect, no difference
  - What we assume is true unless proven otherwise
  - Example: "New drug has no effect"

Hₐ (Alternative Hypothesis):
  - What we want to prove
  - Claim of effect, difference, or change
  - Example: "New drug reduces blood pressure"
```

**Analogy: Criminal Trial**
```
H₀: Defendant is innocent
Hₐ: Defendant is guilty

Default position: Innocent (H₀)
Burden of proof: Prosecutor must show guilt (Hₐ)
Standard: Beyond reasonable doubt (α = 0.05)
Verdict:
  - Reject H₀ (Guilty) if strong evidence
  - Fail to reject H₀ (Not guilty) if insufficient evidence
  Note: "Not guilty" ≠ "Innocent" (just lack of proof)
```

---

### P-value

**Definition:**
Probability of observing data as extreme as (or more extreme than) what we got, **assuming H₀ is true**.

```
Small p-value → Data unlikely under H₀ → Reject H₀
Large p-value → Data plausible under H₀ → Fail to reject H₀
```

**Visual Representation:**
```
If H₀ is true:

           Sample distribution
               ___
             /     \
            /       \
           /         \
          /           \
         /             \▓▓   ← p-value (shaded area)
        /               ▓▓      Observed value here
───────────────────────────▓────→
       H₀ value         Observed

p-value = probability of getting value
          this extreme or more (shaded area)
```

**Interpretation:**
```
p = 0.001: "Only 0.1% chance of this data if H₀ true"
           → Very strong evidence against H₀

p = 0.045: "4.5% chance of this data if H₀ true"
           → Moderate evidence against H₀ (< 0.05)

p = 0.23:  "23% chance of this data if H₀ true"
           → Weak evidence, don't reject H₀
```

**Common Misconceptions:**
```
❌ "p-value is probability H₀ is true"
✓ "p-value is probability of data given H₀ is true"

❌ "p=0.04 means 4% chance we're wrong"
✓ "p=0.04 means 4% chance of this extreme data if H₀ true"

❌ "p<0.05 proves Hₐ is true"
✓ "p<0.05 means data inconsistent with H₀"
```

---

### Significance Level (α)

**Definition:**
Threshold for rejecting H₀. Probability of Type I error (false positive).

**Common Values:**
```
α = 0.05 (5%)  → Standard in most research
α = 0.01 (1%)  → More stringent (medical, safety)
α = 0.10 (10%) → More lenient (exploratory research)
```

**Decision Rule:**
```
If p-value ≤ α:  Reject H₀ (statistically significant)
If p-value > α:  Fail to reject H₀ (not significant)
```

**Visualization:**
```
Standard Normal Distribution (α = 0.05, two-tailed)

         2.5%                        2.5%
          ↓                            ↓
        ╱▓╲         ___              ╱▓╲
       ╱▓▓▓╲      /     \           ╱▓▓▓╲
      ╱▓▓▓▓▓╲    /       \         ╱▓▓▓▓▓╲
─────▓▓▓▓▓▓▓▓───────────────────▓▓▓▓▓▓▓▓─────
   -1.96                        +1.96
     ↑         Fail to reject      ↑
   Reject H₀      H₀ region      Reject H₀

Total rejection region: 5% (2.5% each tail)
```

---

### Type I and Type II Errors

**Error Types:**
```
                Reality
              H₀ True  |  H₀ False
            ─────────────────────────
Decision  | Fail to  |  Correct  |  Type II Error (β)
          | Reject   |           |  False Negative
          |──────────|───────────|──────────────────
          | Reject   | Type I    |  Correct
          | H₀       | Error (α) |
            ──────────────────────────
```

**Examples:**

**Medical Testing:**
```
H₀: Patient is healthy
Hₐ: Patient has disease

Type I Error (α): Diagnose healthy person as sick
  → False positive, unnecessary treatment

Type II Error (β): Miss disease in sick patient
  → False negative, potentially fatal

Which is worse? Depends on disease!
```

**Quality Control:**
```
H₀: Product meets specifications
Hₐ: Product is defective

Type I Error: Reject good product
  → Waste, unnecessary rework

Type II Error: Accept defective product
  → Customer complaints, safety issues
```

**Trade-off:**
```
Lower α (stricter) → Higher β (miss real effects)
Higher α (lenient) → Lower β (catch more effects)

       α ↓    β ↑
       α ↑    β ↓

Can't minimize both simultaneously!
Increase sample size to reduce both.
```

---

## 2. One-Sample Z-Test

### When to Use
- Testing population mean
- **Population σ known**
- Large sample (n ≥ 30) OR population normal
- One sample vs. known value

### Hypotheses
```
Two-tailed:          One-tailed (right):    One-tailed (left):
H₀: μ = μ₀           H₀: μ ≤ μ₀             H₀: μ ≥ μ₀
Hₐ: μ ≠ μ₀           Hₐ: μ > μ₀             Hₐ: μ < μ₀
```

### Test Statistic
```
z = (x̄ - μ₀) / (σ/√n)

where:
  x̄ = sample mean
  μ₀ = hypothesized population mean
  σ = population standard deviation
  n = sample size
```

### Step-by-Step Example

**Scenario:**
Battery manufacturer claims mean life = 500 hours (σ = 40 hours).
Sample of 64 batteries: x̄ = 485 hours.
Test at α = 0.05.

**Solution:**
```
Step 1: State hypotheses
  H₀: μ = 500 (claim is true)
  Hₐ: μ ≠ 500 (claim is false)
  Two-tailed test

Step 2: Set significance level
  α = 0.05

Step 3: Calculate test statistic
  z = (485 - 500) / (40/√64)
    = -15 / 5
    = -3.0

Step 4: Find p-value
  P(Z ≤ -3.0) = 0.0013
  Two-tailed: p = 2 × 0.0013 = 0.0026

Step 5: Decision
  p = 0.0026 < 0.05 → Reject H₀

Step 6: Conclusion
  "Significant evidence that true mean battery life
   is not 500 hours (p = 0.0026). Sample suggests
   it's actually less than claimed."
```

**Visualization:**
```
       H₀: μ = 500

         ___
       /     \
      /       \
     /    500  \
    /      ↓    \
  ▓/              \▓  ← Total 0.26% (p-value)
 ▓/                \▓
──────────────────────
450  485  500  515
     ↑
  Observed (z=-3.0)

Result falls in rejection region!
```

---

## 3. One-Sample T-Test

### When to Use
- Testing population mean
- **Population σ unknown** (use sample s)
- Small to moderate sample size
- Population approximately normal (especially if n < 30)

### Test Statistic
```
t = (x̄ - μ₀) / (s/√n)

with df = n - 1 degrees of freedom
```

### Step-by-Step Example

**Scenario:**
Coffee shop claims average wait time ≤ 5 minutes.
Sample: n = 25 customers
x̄ = 5.8 minutes, s = 1.5 minutes
Test at α = 0.05 (one-tailed, checking if > 5)

**Solution:**
```
Step 1: Hypotheses
  H₀: μ ≤ 5
  Hₐ: μ > 5 (claim is violated)
  One-tailed (right-tail) test

Step 2: Significance level
  α = 0.05

Step 3: Calculate test statistic
  t = (5.8 - 5) / (1.5/√25)
    = 0.8 / 0.3
    = 2.667
  df = 24

Step 4: Find critical value and p-value
  t-critical(0.05, 24) = 1.711
  Our t = 2.667 > 1.711
  p-value ≈ 0.007

Step 5: Decision
  t > t-critical AND p < α → Reject H₀

Step 6: Conclusion
  "Significant evidence that average wait time
   exceeds 5 minutes (t=2.667, p=0.007).
   The claim is not supported."
```

---

## 4. Two-Sample T-Test

### When to Use
- Comparing means of **two independent groups**
- σ unknown for both groups
- Testing if two populations have different means

### Types
```
Independent samples: Different subjects in each group
  (e.g., treatment vs. control with different people)

Paired samples: Same subjects measured twice
  (e.g., before vs. after treatment on same people)
```

---

### Independent Two-Sample T-Test

**Hypotheses:**
```
H₀: μ₁ = μ₂  (or μ₁ - μ₂ = 0)
Hₐ: μ₁ ≠ μ₂  (two-tailed)
```

**Test Statistic:**
```
t = (x̄₁ - x̄₂) / SE

where SE depends on whether variances are equal:

Equal variances (pooled):
  SE = sp × √(1/n₁ + 1/n₂)
  sp² = [(n₁-1)s₁² + (n₂-1)s₂²] / (n₁+n₂-2)
  df = n₁ + n₂ - 2

Unequal variances (Welch's):
  SE = √(s₁²/n₁ + s₂²/n₂)
  df = complicated formula (use software)
```

**Step-by-Step Example:**

**Scenario:**
Compare effectiveness of two teaching methods:
```
Method A: n₁ = 30, x̄₁ = 78, s₁ = 8
Method B: n₂ = 35, x̄₂ = 82, s₂ = 7
α = 0.05
```

**Solution:**
```
Step 1: Hypotheses
  H₀: μ₁ = μ₂ (no difference in methods)
  Hₐ: μ₁ ≠ μ₂ (methods differ)

Step 2: Assume equal variances (s₁ ≈ s₂)
  Calculate pooled SD:
  sp² = [(29)(64) + (34)(49)] / 63
      = [1856 + 1666] / 63
      = 55.9
  sp = 7.48

Step 3: Calculate SE:
  SE = 7.48 × √(1/30 + 1/35)
     = 7.48 × √0.0619
     = 7.48 × 0.249
     = 1.86

Step 4: Calculate t:
  t = (78 - 82) / 1.86
    = -4 / 1.86
    = -2.15
  df = 63

Step 5: Find p-value
  Two-tailed: p ≈ 0.035

Step 6: Decision
  p = 0.035 < 0.05 → Reject H₀

Step 7: Conclusion
  "Method B produces significantly higher scores
   than Method A (t=-2.15, p=0.035).
   Average difference: 4 points."
```

---

### Paired T-Test

**When to Use:**
- Same subjects measured twice (before/after)
- Matched pairs
- Reduces variability from individual differences

**Test Statistic:**
```
t = d̄ / (sd/√n)

where:
  d̄ = mean of differences
  sd = standard deviation of differences
  n = number of pairs
  df = n - 1
```

**Example: Weight Loss Program**
```
10 participants, measured before and after:

ID | Before | After | Difference (d)
───|───────|───────|───────────────
1  | 180   | 175   | -5
2  | 165   | 162   | -3
3  | 195   | 188   | -7
... (continue for all 10)

Calculate: d̄ = -4.2 kg, sd = 2.5 kg

H₀: μd = 0 (no weight loss)
Hₐ: μd < 0 (weight loss)

t = -4.2 / (2.5/√10)
  = -4.2 / 0.79
  = -5.32
df = 9

p-value < 0.001 → Reject H₀
Strong evidence of weight loss!
```

---

## 5. Chi-Square Test

### Chi-Square Goodness of Fit

**When to Use:**
- Testing if observed categorical data fits expected distribution
- One categorical variable with multiple categories

**Test Statistic:**
```
χ² = Σ [(Observed - Expected)² / Expected]

df = k - 1 - p
where:
  k = number of categories
  p = number of estimated parameters
```

**Example: Die Fairness**
```
Roll die 60 times:
Face | Observed | Expected | (O-E)²/E
─────|───────---|──────────|──────────
1    | 8        | 10       | 0.4
2    | 11       | 10       | 0.1
3    | 9        | 10       | 0.1
4    | 12       | 10       | 0.4
5    | 7        | 10       | 0.9
6    | 13       | 10       | 0.9
─────|───────---|──────────|──────────
Total| 60       | 60       | χ² = 2.8

H₀: Die is fair
Hₐ: Die is not fair
df = 6 - 1 = 5
α = 0.05

Critical value: χ²(0.05, 5) = 11.07
Our χ² = 2.8 < 11.07

Fail to reject H₀
No evidence die is unfair
```

---

### Chi-Square Test of Independence

**When to Use:**
- Testing relationship between two categorical variables
- Contingency table analysis

**Example: Education vs. Income**
```
           | Low Income | Medium | High | Total
───────────|───────────|────────|──────|──────
High School| 30        | 40     | 10   | 80
College    | 20        | 50     | 30   | 100
Graduate   | 10        | 30     | 40   | 80
───────────|───────────|────────|──────|──────
Total      | 60        | 120    | 80   | 260

H₀: Education and income are independent
Hₐ: Education and income are related

Calculate expected frequencies:
  E(HS, Low) = (80 × 60)/260 = 18.46
  ... (repeat for all cells)

χ² = Σ(O-E)²/E = 45.7
df = (rows-1)(cols-1) = (3-1)(3-1) = 4

Critical value: χ²(0.05, 4) = 9.49
45.7 > 9.49 → Reject H₀

Strong evidence of relationship between
education level and income!
```

---

## 6. ANOVA (Analysis of Variance)

### When to Use
- Comparing means of **three or more groups**
- Extension of t-test to multiple groups
- One-way ANOVA: one independent variable

**Why not multiple t-tests?**
```
3 groups → 3 comparisons (A vs B, A vs C, B vs C)
Each at α=0.05, overall error rate increases!
P(at least one Type I error) = 1 - (0.95)³ ≈ 14%

ANOVA controls overall error rate at α=0.05
```

### Hypotheses
```
H₀: μ₁ = μ₂ = μ₃ = ... = μk  (all means equal)
Hₐ: At least one mean is different
```

### F-Statistic
```
F = (Between-group variance) / (Within-group variance)
  = MSB / MSW

where:
  MSB = Mean Square Between groups
  MSW = Mean Square Within groups
```

**Intuition:**
```
Large F → Groups differ more than expected by chance
Small F → Groups similar, differences due to randomness

F always ≥ 0 (it's a ratio of variances)
```

---

### Step-by-Step Example

**Scenario:**
Three fertilizer types, measuring plant height:
```
Fertilizer A: [20, 22, 19, 21, 23]  n₁=5, x̄₁=21
Fertilizer B: [24, 26, 25, 27, 23]  n₂=5, x̄₂=25
Fertilizer C: [18, 17, 19, 16, 20]  n₃=5, x̄₃=18

Overall mean: x̄ = 21.33
```

**Solution:**
```
Step 1: Hypotheses
  H₀: μ₁ = μ₂ = μ₃ (fertilizers equally effective)
  Hₐ: At least one mean differs
  α = 0.05

Step 2: Calculate Sum of Squares
  SSB (Between) = Σ nᵢ(x̄ᵢ - x̄)²
    = 5(21-21.33)² + 5(25-21.33)² + 5(18-21.33)²
    = 5(0.11) + 5(13.47) + 5(11.09)
    = 122.85

  SSW (Within) = Σ Σ (xᵢⱼ - x̄ᵢ)²
    = 10 + 10 + 10  [for each group]
    = 30

  SST (Total) = SSB + SSW = 152.85

Step 3: Calculate Mean Squares
  MSB = SSB / (k-1) = 122.85 / 2 = 61.43
  MSW = SSW / (N-k) = 30 / 12 = 2.5

Step 4: Calculate F
  F = MSB / MSW = 61.43 / 2.5 = 24.57

Step 5: Find critical value
  df₁ = k-1 = 2
  df₂ = N-k = 12
  F-critical(0.05, 2, 12) = 3.89

Step 6: Decision
  F = 24.57 > 3.89 → Reject H₀
  p-value < 0.001

Step 7: Conclusion
  "Significant difference between fertilizers
   (F=24.57, p<0.001). Need post-hoc tests
   to determine which pairs differ."
```

---

### ANOVA Table
```
Source    | SS     | df | MS    | F     | p-value
──────────|────────|────|───────|───────|────────
Between   | 122.85 | 2  | 61.43 | 24.57 | <0.001
Within    | 30.00  | 12 | 2.50  |       |
──────────|────────|────|───────|───────|────────
Total     | 152.85 | 14 |       |       |
```

---

### Post-Hoc Tests

**After significant ANOVA, which groups differ?**

**Common methods:**
- **Tukey's HSD:** All pairwise comparisons, controls Type I error
- **Bonferroni:** Conservative, divide α by number of comparisons
- **Scheffé:** Most conservative, for complex comparisons

**Example with our data:**
```
Tukey's HSD shows:
  A vs B: Significant (p=0.003)
  A vs C: Significant (p=0.008)
  B vs C: Significant (p<0.001)

All fertilizers differ from each other!
B > A > C
```

---

## 7. Choosing the Right Test

### Decision Tree
```
                Start: What are you testing?
                          |
        ┌─────────────────┼─────────────────┐
     Mean(s)        Proportion(s)      Association
        |                  |                  |
   How many groups?    How many?         Categorical?
        |                  |                  |
    ┌───┼───┐          ┌──┼──┐           ┌──┴──┐
  One  Two  3+       One   Two       Yes      No
   |    |    |        |     |          |       |
   ↓    ↓    ↓        ↓     ↓          ↓       ↓
  t/z  t-test ANOVA z-test z-test  Chi-Sq  Correlation
```

### Quick Reference Table

| Test | Use When | Example |
|------|----------|---------|
| **Z-test** | 1 mean, σ known | Battery life vs. claim |
| **One-sample t** | 1 mean, σ unknown | Average salary in city |
| **Two-sample t** | 2 means, independent | Treatment vs. control |
| **Paired t** | 2 means, dependent | Before vs. after |
| **Chi-square GOF** | Observed vs. expected | Die fairness |
| **Chi-square ind.** | Association between categories | Education vs. income |
| **ANOVA** | 3+ means | Multiple treatment groups |

---

## 8. Real-World Applications

### Application 1: A/B Testing (Web)

**Scenario:**
```
Control: n=1000, conversions=85 (8.5%)
Variant: n=1000, conversions=102 (10.2%)

Question: Is variant significantly better?

Two-proportion z-test:
  p̂₁ = 0.085, p̂₂ = 0.102
  Pooled: p̂ = 187/2000 = 0.0935

  SE = √[0.0935(0.9065)(1/1000 + 1/1000)]
     = 0.0130

  z = (0.102 - 0.085) / 0.0130
    = 0.017 / 0.0130
    = 1.31

  p-value = 0.19 (two-tailed)

Decision: p > 0.05, fail to reject H₀
"No significant difference (p=0.19).
 The 1.7% increase could be due to chance.
 Consider running test longer."
```

---

### Application 2: Quality Control

**Scenario:**
```
Machine produces bolts, target diameter: 10mm
Sample 25: x̄ = 10.15mm, s = 0.3mm

One-sample t-test:
  H₀: μ = 10
  Hₐ: μ ≠ 10

  t = (10.15 - 10) / (0.3/√25)
    = 0.15 / 0.06
    = 2.5
  df = 24

  p-value = 0.02 (two-tailed)

Decision: Reject H₀
"Machine is significantly off-target (p=0.02).
 Recalibrate machine."
```

---

### Application 3: Drug Trial

**Scenario:**
```
Compare 3 drugs for blood pressure reduction:

Drug A: n=30, reduction = 8 mmHg
Drug B: n=30, reduction = 12 mmHg
Drug C: n=30, reduction = 6 mmHg

One-way ANOVA:
  F = 15.7, p < 0.001

  Post-hoc (Tukey):
    B vs A: p = 0.003 ✓
    B vs C: p < 0.001 ✓
    A vs C: p = 0.12 (NS)

Conclusion:
"Drug B significantly more effective than A and C.
 A and C not significantly different.
 Recommend Drug B."
```

---

## 9. Common Mistakes

### Mistake 1: Confusing Significance with Importance
```
❌ "p=0.001 means huge effect"
✓ With large n, even tiny differences can be significant

Example:
  n=100,000 customers
  Control: 10.00% conversion
  Test:    10.05% conversion (0.05% increase)
  Result:  p=0.03 (significant!)

Statistically significant ≠ Practically important
Always report effect size!
```

---

### Mistake 2: P-hacking / Multiple Testing
```
❌ Test 20 different hypotheses, report the one with p<0.05
✓ By chance, 1 in 20 will be "significant"

Corrections needed:
- Bonferroni: α_adjusted = α / number of tests
- Or: Pre-specify primary hypothesis
```

---

### Mistake 3: Wrong Test Choice
```
❌ Using t-test for 3+ groups (inflates Type I error)
✓ Use ANOVA for 3+ groups

❌ Using z-test with small sample and unknown σ
✓ Use t-test when σ unknown
```

---

### Mistake 4: Ignoring Assumptions
```
Check before testing:
- Independence of observations
- Normality (especially for small samples)
- Equal variances (for pooled t-test)
- Random sampling

If violated → Consider:
- Transformations
- Non-parametric tests
- Robust methods
```

---

## 10. Practice Problems

### Problem 1: One-Sample T-Test
```
Claim: Average commute time ≤ 30 minutes
Sample: n=40, x̄=32, s=5
Test at α=0.05

Solution:
  H₀: μ ≤ 30
  Hₐ: μ > 30 (one-tailed right)

  t = (32-30)/(5/√40) = 2.53
  df = 39
  p ≈ 0.008

  Reject H₀ (p < 0.05)
  "Commute significantly exceeds 30 minutes"
```

---

### Problem 2: Two-Sample T-Test
```
Compare salaries:
  Men:   n=50, x̄=$65k, s=$8k
  Women: n=45, x̄=$62k, s=$7k

Solution:
  H₀: μ₁ = μ₂
  Hₐ: μ₁ ≠ μ₂

  SE ≈ √(64/50 + 49/45) ≈ 1.49
  t = (65-62)/1.49 = 2.01
  df ≈ 93

  p ≈ 0.047

  Reject H₀ (p < 0.05)
  "Significant salary difference (p=0.047)"
```

---

### Problem 3: Chi-Square
```
Survey: Preference vs. Age Group
         | <30  | 30-50 | >50  | Total
─────────|──────|───────|──────|──────
Product A| 40   | 30    | 20   | 90
Product B| 20   | 40    | 50   | 110
─────────|──────|───────|──────|──────
Total    | 60   | 70    | 70   | 200

Test independence at α=0.05

Expected frequencies:
E(A,<30) = 90×60/200 = 27
... (calculate others)

χ² ≈ 18.5, df = 2
Critical value = 5.99
χ² > 5.99 → Reject H₀

"Significant relationship between age and preference"
```

---

## 11. Quick Reference

### Test Statistics
```
One-sample z:    z = (x̄ - μ₀)/(σ/√n)
One-sample t:    t = (x̄ - μ₀)/(s/√n)
Two-sample t:    t = (x̄₁ - x̄₂)/SE
Paired t:        t = d̄/(sd/√n)
Chi-square:      χ² = Σ(O-E)²/E
F (ANOVA):       F = MSB/MSW
```

### P-value Interpretation
```
p < 0.001:  Very strong evidence against H₀
p < 0.01:   Strong evidence against H₀
p < 0.05:   Moderate evidence against H₀
p < 0.10:   Weak evidence against H₀
p ≥ 0.10:   Insufficient evidence against H₀
```

### Critical Values (α=0.05)
```
z (two-tailed):  ±1.96
t (df=20):       ±2.086
t (df=30):       ±2.042
χ² (df=5):       11.07
F (2,12):        3.89
```

---

## Key Takeaways

1. **Hypothesis testing framework:** State hypotheses → Set α → Calculate statistic → Find p-value → Decide
2. **P-value:** Probability of data if H₀ true (not probability H₀ is true!)
3. **Significance ≠ Importance:** Small p-value with large n doesn't mean large effect
4. **Choose correct test:** Match test to data type and research question
5. **Check assumptions:** Independence, normality, equal variances
6. **Type I vs II errors:** Balance false positives and false negatives
7. **Report completely:** Test statistic, df, p-value, effect size, confidence interval
8. **ANOVA for 3+ groups:** Don't do multiple t-tests

**Remember:** Hypothesis testing is about making decisions under uncertainty. Always interpret results in the context of your specific problem and consider both statistical significance and practical importance!
