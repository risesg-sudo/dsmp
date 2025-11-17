# Probability Basics

## Overview
Probability is the measure of the likelihood that an event will occur. It's the foundation for statistical inference, machine learning, and data-driven decision making.

---

## 1. Fundamental Concepts

### What is Probability?
**Definition:** A number between 0 and 1 that quantifies uncertainty.

```
P(Event) = Number of favorable outcomes / Total number of possible outcomes

where:
  0 ≤ P(Event) ≤ 1
  P = 0  → Impossible event
  P = 1  → Certain event
  P = 0.5 → 50-50 chance
```

**Intuition:**
If you repeated an experiment infinitely many times, probability is the proportion of times the event would occur.

**Example - Coin Flip:**
```
Fair coin:
  P(Heads) = 1/2 = 0.5
  P(Tails) = 1/2 = 0.5

In 1000 flips, expect ~500 heads (Law of Large Numbers)
```

---

## 2. Basic Probability Rules

### Rule 1: Complement Rule
**What it is:** The probability that an event does NOT occur.

```
P(not A) = 1 - P(A)
or
P(A') = 1 - P(A)
```

**Example - Email Spam:**
```
P(Email is Spam) = 0.30
P(Email is NOT Spam) = 1 - 0.30 = 0.70

Quick check: 0.30 + 0.70 = 1.0 ✓
```

**Real-world Use:**
Sometimes easier to calculate probability of NOT happening:
```
P(at least one defect) = 1 - P(no defects)
```

---

### Rule 2: Addition Rule (OR)

**For Mutually Exclusive Events:**
Events that cannot happen simultaneously (rolling a 3 OR a 5 on one die)

```
P(A or B) = P(A) + P(B)
```

**Example - Die Roll:**
```
P(roll 3 or 5) = P(3) + P(5) = 1/6 + 1/6 = 2/6 = 1/3
```

**For Non-Mutually Exclusive Events:**
Events that CAN happen together (drawing a King OR a Heart)

```
P(A or B) = P(A) + P(B) - P(A and B)
```

**Why subtract P(A and B)?**
Because we counted the overlap twice!

**Example - Card Drawing:**
```
P(King or Heart) = P(King) + P(Heart) - P(King of Hearts)
                 = 4/52 + 13/52 - 1/52
                 = 16/52 = 4/13

Visualization:
Kings:  K♠ K♥ K♦ K♣
Hearts: A♥ 2♥ 3♥ ... K♥ (13 cards)
Overlap: K♥ (counted in both, subtract once)
```

---

### Rule 3: Multiplication Rule (AND)

**For Independent Events:**
Events where one doesn't affect the other (two coin flips)

```
P(A and B) = P(A) × P(B)
```

**Example - Two Coin Flips:**
```
P(Heads and Heads) = P(Heads) × P(Heads)
                   = 0.5 × 0.5
                   = 0.25

All possibilities:
HH: 0.25
HT: 0.25
TH: 0.25
TT: 0.25
Total: 1.00 ✓
```

**For Dependent Events:**
Events where one affects the other (drawing cards without replacement)

```
P(A and B) = P(A) × P(B|A)
where P(B|A) = "probability of B given A happened"
```

**Example - Drawing Cards:**
```
P(Two Aces without replacement) = P(1st Ace) × P(2nd Ace | 1st was Ace)
                                = 4/52 × 3/51
                                = 12/2652 ≈ 0.0045

Note: After drawing first ace, only 3 aces left in 51 cards
```

---

## 3. Conditional Probability

### Definition
**What it is:** Probability of event A, given that event B has occurred.

```
P(A|B) = P(A and B) / P(B)

Read as: "Probability of A given B"
```

**Intuition:**
When we know B happened, we're working with a smaller sample space (only outcomes where B is true).

**Visual Representation:**
```
All Outcomes
┌─────────────────────────────┐
│                             │
│    ┌──────────┐             │
│    │    A∩B   │             │
│    │  ↑       │      A      │
│    │  │       │             │
│    └──┼───────┘             │
│       │                     │
│       │         B           │
│       └─────────────────┐   │
│                         │   │
│                         │   │
└─────────────────────────┘   │
                              │
P(A|B) = Focus only on B region,
         what fraction is also A?
```

**Example - Email Classification:**
```
P(Contains "Free" | Spam) = 0.80  (80% of spam has "Free")
P(Contains "Free" | Ham)  = 0.10  (10% of ham has "Free")

If email contains "Free", more likely spam (but not certain!)
```

---

## 4. Independence

### Definition
Two events are **independent** if knowing one doesn't change probability of the other.

```
Mathematically:
  P(A|B) = P(A)    or equivalently
  P(B|A) = P(B)    or equivalently
  P(A and B) = P(A) × P(B)
```

**Testing Independence:**
```
Question: Are "Rainy Day" and "High Sales" independent?

P(High Sales) = 0.30
P(High Sales | Rainy) = 0.45

Since 0.45 ≠ 0.30, they are DEPENDENT (not independent)
Rain affects sales probability!
```

**Examples:**

**Independent Events:**
- Coin flip results
- Die rolls
- Drawing with replacement
- Separate customer purchases

**Dependent Events:**
- Drawing cards without replacement
- Student's test scores (correlated with study time)
- Weather today and tomorrow
- Stock price changes

---

## 5. Bayes' Theorem

### The Formula
```
P(A|B) = [P(B|A) × P(A)] / P(B)

where:
  P(A|B) = Posterior probability (what we want)
  P(B|A) = Likelihood (probability of evidence given hypothesis)
  P(A)   = Prior probability (initial belief)
  P(B)   = Marginal probability (total probability of evidence)
```

**Extended form:**
```
P(A|B) = [P(B|A) × P(A)] / [P(B|A) × P(A) + P(B|not A) × P(not A)]
```

**Intuition:**
Update your belief about A after observing evidence B.

---

### Real-World Example: Medical Testing

**Scenario:**
- Disease affects 1% of population: P(Disease) = 0.01
- Test is 95% accurate for sick: P(Positive|Disease) = 0.95
- Test has 10% false positive: P(Positive|No Disease) = 0.10
- You test positive. What's probability you have disease?

**Step-by-step Solution:**

```
Want: P(Disease | Positive)

Given:
  P(Disease) = 0.01
  P(No Disease) = 0.99
  P(Positive | Disease) = 0.95
  P(Positive | No Disease) = 0.10

Step 1: Calculate P(Positive) using law of total probability
  P(Positive) = P(Positive|Disease) × P(Disease)
              + P(Positive|No Disease) × P(No Disease)
              = 0.95 × 0.01 + 0.10 × 0.99
              = 0.0095 + 0.099
              = 0.1085

Step 2: Apply Bayes' Theorem
  P(Disease|Positive) = [P(Positive|Disease) × P(Disease)] / P(Positive)
                      = (0.95 × 0.01) / 0.1085
                      = 0.0095 / 0.1085
                      = 0.0876 ≈ 8.76%
```

**Surprising Result:**
Even with positive test, only 8.76% chance of having disease!

**Why so low?**
- Disease is rare (1%)
- Many false positives from the 99% healthy population
- 10% of 99% healthy people = 9.9% false positives
- 0.95% true positives vs 9.9% false positives

**Visualization:**
```
Out of 1000 people:
┌─────────────────────────────────────────┐
│ 10 have disease                         │
│   ├─ 9.5 test positive ✓                │
│   └─ 0.5 test negative (false neg)      │
│                                         │
│ 990 don't have disease                  │
│   ├─ 99 test positive (FALSE POSITIVE) │
│   └─ 891 test negative ✓                │
└─────────────────────────────────────────┘

Total positive tests: 9.5 + 99 = 108.5
Actually have disease: 9.5
P(Disease|Positive) = 9.5/108.5 ≈ 8.76%
```

---

## 6. Practical Applications

### Application 1: Spam Filter (Naive Bayes)
```
Email contains: "FREE MONEY!!!"

Prior:
  P(Spam) = 0.30
  P(Ham) = 0.70

Likelihoods:
  P("FREE"|Spam) = 0.80
  P("MONEY"|Spam) = 0.60
  P("FREE"|Ham) = 0.05
  P("MONEY"|Ham) = 0.10

Assuming independence (naive assumption):
  P(Words|Spam) = 0.80 × 0.60 = 0.48
  P(Words|Ham) = 0.05 × 0.10 = 0.005

Posterior:
  P(Spam|Words) ∝ 0.48 × 0.30 = 0.144
  P(Ham|Words) ∝ 0.005 × 0.70 = 0.0035

Normalize:
  P(Spam|Words) = 0.144/(0.144+0.0035) = 0.976 ≈ 97.6%

Classify as SPAM!
```

---

### Application 2: A/B Testing Decision

**Scenario:** E-commerce button color test
```
Variant A (Blue):   1000 visitors, 80 clicked    → 8% CTR
Variant B (Red):    1000 visitors, 95 clicked    → 9.5% CTR

Is B really better, or just luck?

Basic probability check:
  P(at least 95 clicks by chance) = ?

If A and B same, expect similar results.
Difference suggests B might be better.
(Full answer requires hypothesis testing - see later notes!)
```

---

### Application 3: Risk Assessment

**Customer Churn Prediction:**
```
Historical data:
  P(Churn) = 0.20 (20% customers leave)

New indicators:
  P(No recent purchase | Will Churn) = 0.70
  P(No recent purchase | Won't Churn) = 0.15

Customer X: No purchase in 3 months

P(Churn | No purchase) = ?

Using Bayes:
  P(Churn|No Purch) = [0.70 × 0.20] / [0.70×0.20 + 0.15×0.80]
                    = 0.14 / (0.14 + 0.12)
                    = 0.14 / 0.26
                    = 0.538 ≈ 54%

Action: High-risk customer → Send retention offer!
```

---

## 7. Common Probability Distributions Preview

### Discrete Distributions
Events with countable outcomes (0, 1, 2, 3...)

**Bernoulli:** Single trial, success/failure
```
Click or no click on ad
P(X=1) = p
P(X=0) = 1-p
```

**Binomial:** Multiple independent trials
```
Number of heads in 10 coin flips
P(X=k) = C(n,k) × p^k × (1-p)^(n-k)
```

---

### Continuous Distributions
Events with infinite possible values (height, time, temperature)

**Uniform:** All values equally likely
```
Random number between 0 and 1
P(a ≤ X ≤ b) = (b-a)/(max-min)
```

**Normal (Gaussian):** Bell curve
```
Heights, test scores, measurement errors
Defined by mean (μ) and std dev (σ)
```

*(Detailed coverage in distributions.md)*

---

## 8. Probability Tree Diagrams

**Example: Customer Journey**
```
                    Start
                      |
          ┌───────────┴───────────┐
       Visit                   No Visit
       (0.3)                    (0.7)
          |
    ┌─────┴─────┐
  View         Leave
  (0.6)        (0.4)
    |
  ┌─┴─┐
Buy  Leave
(0.3) (0.7)

P(Buy) = P(Visit) × P(View|Visit) × P(Buy|View)
       = 0.3 × 0.6 × 0.3
       = 0.054 = 5.4%

Interpretation: 5.4% of all potential customers make purchase
```

---

## 9. Common Mistakes and Tips

### Mistake 1: Confusing P(A|B) with P(B|A)
```
❌ WRONG:
   "P(Positive Test | Disease) = 95%"
   ≠ "P(Disease | Positive Test) = 95%"

✓ RIGHT:
   These are DIFFERENT probabilities!
   Need Bayes' Theorem to convert between them
```

### Mistake 2: Assuming Independence
```
❌ WRONG:
   P(Red card AND King) = P(Red) × P(King)
                        = 0.5 × 0.077 = 0.038

✓ RIGHT:
   These are NOT independent (red cards include red kings)
   P(Red AND King) = 2/52 = 0.038 (works by coincidence here!)

   Better: P(Red AND King) = count method = 2/52
```

### Mistake 3: Adding Non-Mutually Exclusive Probabilities
```
❌ WRONG:
   P(King OR Heart) = P(King) + P(Heart)
                    = 4/52 + 13/52 = 17/52

✓ RIGHT:
   P(King OR Heart) = 4/52 + 13/52 - 1/52 = 16/52
   (Subtract the King of Hearts counted twice!)
```

---

## 10. Quick Reference

### Fundamental Rules
```
Complement:        P(A') = 1 - P(A)
Addition:          P(A∪B) = P(A) + P(B) - P(A∩B)
Multiplication:    P(A∩B) = P(A) × P(B|A)
Conditional:       P(A|B) = P(A∩B) / P(B)
Bayes:             P(A|B) = P(B|A) × P(A) / P(B)
```

### Independence Test
```
A and B independent if:
  P(A|B) = P(A)
  OR P(A∩B) = P(A) × P(B)
```

### Decision Tree
```
Question: What probability to calculate?

Single event?
  └─> P(A) = favorable/total

Multiple events (OR)?
  └─> Mutually exclusive?
      ├─ Yes: P(A) + P(B)
      └─ No:  P(A) + P(B) - P(A∩B)

Multiple events (AND)?
  └─> Independent?
      ├─ Yes: P(A) × P(B)
      └─ No:  P(A) × P(B|A)

Given information (conditional)?
  └─> P(A|B) = P(A∩B) / P(B)

Reverse conditional (diagnosis)?
  └─> Use Bayes' Theorem
```

---

## 11. Practice Problems

### Problem 1: Product Quality
```
A factory produces widgets. 95% are good, 5% defective.
Quality test:
- Detects 90% of defective widgets
- False alarm on 3% of good widgets

A widget fails the test. Probability it's actually defective?

Solution:
P(D|Fail) = P(Fail|D) × P(D) / P(Fail)

P(Fail) = P(Fail|D)×P(D) + P(Fail|Good)×P(Good)
        = 0.90×0.05 + 0.03×0.95
        = 0.045 + 0.0285 = 0.0735

P(D|Fail) = (0.90 × 0.05) / 0.0735
          = 0.045 / 0.0735
          = 0.612 ≈ 61.2%

Even after failing test, 38.8% chance it's actually good!
```

### Problem 2: Marketing Campaign
```
Email campaign:
- P(Customer opens email) = 0.25
- P(Clicks link | Opens) = 0.40
- P(Makes purchase | Clicks) = 0.15

What's probability a customer makes purchase?

Solution:
P(Purchase) = P(Opens) × P(Clicks|Opens) × P(Purchase|Clicks)
            = 0.25 × 0.40 × 0.15
            = 0.015 = 1.5%

Out of 10,000 customers, expect 150 purchases
```

---

## Key Takeaways

1. **Probability measures uncertainty** - ranges from 0 (impossible) to 1 (certain)
2. **Addition for OR** - mind the overlap (subtract P(A∩B) if not mutually exclusive)
3. **Multiplication for AND** - use P(B|A) if events are dependent
4. **Conditional probability** - narrows sample space to known information
5. **Independence** - knowing one event doesn't change probability of another
6. **Bayes' Theorem** - updates beliefs with new evidence (crucial for ML)
7. **Always visualize** - trees, Venn diagrams, tables help avoid mistakes

**Next:** Learn about specific probability distributions that model real-world scenarios!
