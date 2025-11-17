# Types of Missing Data - MCAR, MAR, MNAR

## What You'll Learn

Not all missing data is created equal. Understanding the three types of missing data mechanisms (MCAR, MAR, MNAR) is crucial for choosing the right imputation strategy and avoiding biased results.

## The Three Types

```
Categorical Missing Data Types
│
├─── MCAR (Missing Completely At Random)
│    └─ Missingness is truly random
│       No relationship to any variable
│       Least problematic
│
├─── MAR (Missing At Random)
│    └─ Missingness depends on observed data
│       Can be predicted from other variables
│       Requires advanced imputation
│
└─── MNAR (Missing Not At Random)
     └─ Missingness depends on unobserved values
        Cannot be predicted from available data
        Most problematic
```

## 1. MCAR - Missing Completely At Random

### Definition

Missingness is completely random and independent of any data, observed or unobserved.

```
Example: Survey responses lost due to technical glitch

┌─────────────────────────────────────┐
│  Missing Age values are random,     │
│  not related to Age itself or       │
│  any other variable                 │
└─────────────────────────────────────┘

Visual:
Age: [25, NaN, 35, NaN, 45, 28, NaN]
     ↑        ↑        ↑
     Random pattern - no bias
```

### Characteristics

- No systematic pattern
- Missing values don't depend on observed or unobserved data
- Least problematic type
- Can be handled with simple imputation
- Dropping data doesn't introduce bias

### Real-World Examples

```python
mcar_examples = {
    'Lab Equipment Failure': 'Random sensor malfunction loses readings',
    'Server Downtime': 'System crash causes random data loss',
    'Accidental Deletion': 'File corruption loses random entries',
    'Random Survey Skip': 'Questions skipped by accident, not by choice'
}

print("MCAR Examples in Real World:")
print("="*60)
for scenario, description in mcar_examples.items():
    print(f"\n{scenario}:")
    print(f"  {description}")
```

### Testing for MCAR

```python
import pandas as pd
import numpy as np
from scipy import stats

def test_mcar(df, col_with_missing, other_col):
    """
    Test if missing values in one column are related to another column
    """
    # Create binary indicator for missingness
    df = df.copy()
    df['is_missing'] = df[col_with_missing].isnull().astype(int)

    # Compare distribution of other_col for missing vs non-missing
    missing_group = df[df['is_missing'] == 1][other_col].dropna()
    present_group = df[df['is_missing'] == 0][other_col].dropna()

    # T-test to check if means are different
    if len(missing_group) > 0 and len(present_group) > 0:
        t_stat, p_value = stats.ttest_ind(missing_group, present_group)

        print(f"Testing MCAR for '{col_with_missing}' against '{other_col}'")
        print(f"Missing group mean: {missing_group.mean():.2f}")
        print(f"Present group mean: {present_group.mean():.2f}")
        print(f"P-value: {p_value:.4f}")

        if p_value > 0.05:
            print("✓ Likely MCAR (no significant difference)")
        else:
            print("✗ Not MCAR (significant difference detected)")

        return p_value
    else:
        print("Insufficient data for test")
        return None

# Example: True MCAR
np.random.seed(42)
df = pd.DataFrame({
    'age': [25, np.nan, 35, 40, np.nan, 28, 45, 50] * 10,
    'income': [50000, 60000, 55000, 70000, 65000, 58000, 72000, 68000] * 10
})

# Randomly add more missing values
missing_idx = np.random.choice(df[df['age'].notna()].index, 10)
df.loc[missing_idx, 'age'] = np.nan

test_mcar(df, 'age', 'income')
```

## 2. MAR - Missing At Random

### Definition

Missingness depends on observed data but not on the missing values themselves.

```
Example: Young people less likely to report income

┌─────────────────────────────────────┐
│  Income missing for people under 30 │
│  (related to Age, which we observe) │
└─────────────────────────────────────┘

Visual:
Age:    [25, 28, 35, 40, 45]
Income: [NaN, NaN, 55k, 70k, 65k]
        ↑    ↑
        Missing depends on Age!
```

### Characteristics

- Missingness can be explained by other variables
- Can be predicted from observed data
- Requires advanced imputation (KNN, Iterative)
- More common than MCAR in practice

### Real-World Examples

```python
mar_examples = {
    'Income by Age': {
        'description': 'Younger people less likely to report income',
        'observed': 'Age',
        'missing': 'Income',
        'relationship': 'Young → Income missing'
    },
    'Medical Tests by Gender': {
        'description': 'Certain tests only done for specific gender',
        'observed': 'Gender',
        'missing': 'Prostate exam results',
        'relationship': 'Female → Prostate exam missing'
    },
    'Education by Location': {
        'description': 'Rural areas have less education data',
        'observed': 'Location',
        'missing': 'Highest degree',
        'relationship': 'Rural → Education missing'
    }
}

print("MAR Examples:")
print("="*70)
for example, details in mar_examples.items():
    print(f"\n{example}:")
    print(f"  Description: {details['description']}")
    print(f"  Observable: {details['observed']}")
    print(f"  Missing: {details['missing']}")
    print(f"  Pattern: {details['relationship']}")
```

### Creating MAR Data

```python
import pandas as pd
import numpy as np

# MAR example: Income missing for younger people
np.random.seed(42)
n = 1000

df = pd.DataFrame({
    'age': np.random.randint(20, 70, n),
    'income': np.random.randint(30000, 150000, n)
})

# Income more likely to be missing for younger people (MAR)
missing_prob = 1 / (1 + np.exp((df['age'] - 30) / 5))  # Sigmoid function
df.loc[np.random.random(n) < missing_prob, 'income'] = np.nan

print("MAR Pattern Analysis:")
print("="*60)
print(f"Overall missing rate: {df['income'].isnull().mean():.2%}")
print(f"\nMissing rate by age group:")
age_groups = pd.cut(df['age'], bins=[0, 30, 40, 50, 100], labels=['<30', '30-40', '40-50', '50+'])
print(df.groupby(age_groups)['income'].apply(
    lambda x: f"{x.isnull().mean():.1%}"
))

print("\nConclusion: Income missingness depends on Age (MAR)")
```

## 3. MNAR - Missing Not At Random

### Definition

Missingness depends on the unobserved values themselves.

```
Example: High earners refuse to report income

┌─────────────────────────────────────┐
│  Income missing because it's high   │
│  (depends on Income itself)         │
└─────────────────────────────────────┘

Visual:
Income: [50k, NaN, 45k, NaN, 48k, NaN]
                ↑         ↑         ↑
        Missing values are high incomes!
        Can't predict from other variables
```

### Characteristics

- Most problematic type
- Cannot be predicted from observed data
- Requires domain knowledge
- May need to model the missingness itself
- Simple imputation introduces bias

### Real-World Examples

```python
mnar_examples = {
    'High Income Self-Censoring': {
        'description': 'Wealthy people refuse to report income',
        'why_mnar': 'Missingness depends on income value itself',
        'solution': 'Model missingness, use indicator variables'
    },
    'Poor Test Scores': {
        'description': 'Students with low scores don\'t submit',
        'why_mnar': 'Missing because score is low',
        'solution': 'Survey non-respondents, adjust for bias'
    },
    'Medical Symptoms': {
        'description': 'Severe symptoms prevent reporting',
        'why_mnar': 'Too sick to fill out forms',
        'solution': 'Use proxy measures, family reports'
    },
    'Product Defects': {
        'description': 'Failed products can\'t report data',
        'why_mnar': 'Failure causes missing data',
        'solution': 'Survival analysis, censored data methods'
    }
}

print("MNAR Examples:")
print("="*70)
for example, details in mnar_examples.items():
    print(f"\n{example}:")
    print(f"  What: {details['description']}")
    print(f"  Why MNAR: {details['why_mnar']}")
    print(f"  Solution: {details['solution']}")
```

### Creating MNAR Data

```python
import pandas as pd
import numpy as np

# MNAR example: High income people don't report
np.random.seed(42)
n = 1000

df = pd.DataFrame({
    'age': np.random.randint(20, 70, n),
    'income': np.random.randint(30000, 200000, n)
})

# High earners more likely to have missing income (MNAR)
missing_prob = (df['income'] - df['income'].min()) / (df['income'].max() - df['income'].min())
df.loc[np.random.random(n) < missing_prob * 0.5, 'income'] = np.nan

print("MNAR Pattern Analysis:")
print("="*60)
print(f"Overall missing rate: {df['income'].isnull().mean():.2%}")

# We can't directly verify MNAR (data is missing!)
# But we can check if other variables predict missingness
print("\nDoes age predict missingness?")
age_groups = pd.cut(df['age'], bins=5)
print(df.groupby(age_groups)['income'].apply(
    lambda x: f"{x.isnull().mean():.1%}"
))
print("\nSimilar rates across age groups → age doesn't predict it")
print("But we know high income causes it (MNAR)")
```

## Comparison Table

```
┌──────────┬─────────────────────┬──────────────────────┬─────────────────────┐
│ Type     │ Definition          │ Can Predict?         │ Best Approach       │
├──────────┼─────────────────────┼──────────────────────┼─────────────────────┤
│ MCAR     │ Completely random   │ No need              │ Any imputation      │
│          │                     │                      │ Simple methods OK   │
├──────────┼─────────────────────┼──────────────────────┼─────────────────────┤
│ MAR      │ Depends on observed │ Yes, from other vars │ KNN, Iterative      │
│          │ data                │                      │ Multiple imputation │
├──────────┼─────────────────────┼──────────────────────┼─────────────────────┤
│ MNAR     │ Depends on missing  │ No                   │ Domain knowledge    │
│          │ values themselves   │                      │ Model missingness   │
└──────────┴─────────────────────┴──────────────────────┴─────────────────────┘
```

## Practical Identification

In practice, you rarely know for certain which type you have.

```python
def identify_missing_mechanism(df, col_with_missing):
    """
    Helper function to investigate missing data mechanism
    """
    print(f"Investigating Missing Mechanism for: {col_with_missing}")
    print("="*70)

    # Step 1: Check missing percentage
    missing_pct = df[col_with_missing].isnull().mean() * 100
    print(f"\n1. Missing Percentage: {missing_pct:.1f}%")

    # Step 2: Check relationship with other variables
    print("\n2. Testing relationships with other variables:")

    df_test = df.copy()
    df_test['is_missing'] = df_test[col_with_missing].isnull()

    for col in df.select_dtypes(include=[np.number]).columns:
        if col != col_with_missing:
            missing_mean = df_test[df_test['is_missing'] == True][col].mean()
            present_mean = df_test[df_test['is_missing'] == False][col].mean()

            if pd.notna(missing_mean) and pd.notna(present_mean):
                diff = abs(missing_mean - present_mean)
                diff_pct = (diff / present_mean) * 100 if present_mean != 0 else 0

                print(f"\n  {col}:")
                print(f"    Mean when {col_with_missing} missing: {missing_mean:.2f}")
                print(f"    Mean when {col_with_missing} present: {present_mean:.2f}")
                print(f"    Difference: {diff_pct:.1f}%")

                if diff_pct > 10:
                    print(f"    → Strong relationship detected (suggests MAR)")

    # Step 3: Provide guidance
    print("\n3. Assessment:")
    print("  - If no relationships found: Likely MCAR")
    print("  - If relationships with other variables: Likely MAR")
    print("  - If you suspect missing depends on the value itself: Likely MNAR")
    print("  - Domain knowledge is crucial for final determination")

# Example
np.random.seed(42)
df = pd.DataFrame({
    'age': np.random.randint(20, 70, 100),
    'income': np.random.randint(30000, 150000, 100),
    'score': np.random.randint(50, 100, 100)
})

# Make income MAR (depends on age)
missing_prob = 1 / (1 + np.exp((df['age'] - 35) / 5))
df.loc[np.random.random(100) < missing_prob * 0.3, 'income'] = np.nan

identify_missing_mechanism(df, 'income')
```

## Summary

Understanding missing data types guides your imputation strategy:

**MCAR (Rare):**
- Truly random missingness
- Any imputation method works
- Can safely drop rows

**MAR (Common):**
- Depends on observed variables
- Use advanced imputation (KNN, Iterative)
- Can be modeled and corrected

**MNAR (Problematic):**
- Depends on unobserved values
- Requires domain expertise
- May need to model missingness itself
- Simple imputation introduces bias

**Key Takeaway:** Always investigate WHY data is missing before choosing an imputation method!

---

**Navigation:**
- **Previous:** [← Missing Data Overview](./missing-overview.md)
- **Next:** [SimpleImputer →](./missing-simple-imputer.md)
- **Related:** [Missing Data Comparison](./missing-comparison.md)
