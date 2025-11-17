# Missing Value Methods - Comparison and Decision Framework

## What You'll Learn

With multiple imputation methods available, choosing the right one is crucial. This guide provides a comprehensive comparison and decision framework to help you select the optimal strategy.

## Quick Comparison Table

```
┌─────────────────┬─────────────┬───────────┬────────────┬─────────────┬──────────────┐
│ Method          │ Speed       │ Accuracy  │ Best For   │ Complexity  │ Data Size    │
├─────────────────┼─────────────┼───────────┼────────────┼─────────────┼──────────────┤
│ Drop Rows       │ Instant     │ N/A       │ MCAR (<5%) │ Low         │ Any          │
│ SimpleImputer   │ Fast        │ Low       │ MCAR       │ Low         │ Any          │
│ KNN Imputer     │ Slow        │ Medium    │ MAR        │ Medium      │ Small-Medium │
│ Iterative       │ Very Slow   │ High      │ MAR/MNAR   │ High        │ Medium       │
│ Indicator       │ Fast        │ Low       │ MNAR       │ Low         │ Any          │
│ Multiple        │ Very Slow   │ Highest   │ MAR/MNAR   │ High        │ Medium       │
└─────────────────┴─────────────┴───────────┴────────────┴─────────────┴──────────────┘
```

## Decision Framework

### Step-by-Step Decision Tree

```
START: How much data is missing?
│
├─ < 5% → DROP rows with missing values
│          (minimal information loss)
│
├─ 5-20% → Continue to Step 2
│
├─ 20-50% → INVESTIGATE why so much missing
│           Then proceed based on findings
│
└─ > 50% → Consider DROPPING the column
           (too much missing data)

Step 2: What type of missingness?
│
├─ MCAR → SimpleImputer is sufficient
│         (mean/median)
│
├─ MAR → Use KNN or Iterative Imputer
│        (captures relationships)
│
└─ MNAR → Use Indicator Variable + Imputation
          (preserve missingness information)

Step 3: Consider dataset size
│
├─ Small (< 1000 rows) → Any method works
│
├─ Medium (1000-10000) → KNN or Iterative
│
└─ Large (> 10000) → SimpleImputer (for speed)

Step 4: Check feature relationships
│
├─ Strong correlations → KNN or Iterative
│
└─ Weak correlations → SimpleImputer

Step 5: Model type
│
├─ Tree-based → Less sensitive, SimpleImputer OK
│
└─ Linear/Neural → Use advanced methods
```

## Detailed Comparison

```python
import pandas as pd

comparison = pd.DataFrame({
    'Method': ['Drop Rows', 'SimpleImputer (Mean)', 'SimpleImputer (Median)',
               'KNNImputer', 'IterativeImputer', 'Indicator Variable',
               'Multiple Imputation'],
    'Speed': ['Instant', 'Fast', 'Fast', 'Slow', 'Very Slow', 'Fast', 'Very Slow'],
    'Accuracy': ['N/A', 'Low', 'Medium', 'Medium', 'High', 'Low', 'Highest'],
    'Best_For': ['MCAR <5%', 'MCAR normal', 'MCAR skewed',
                 'MAR correlated', 'MAR complex', 'MNAR', 'High stakes'],
    'Complexity': ['Low', 'Low', 'Low', 'Medium', 'High', 'Low', 'High'],
    'Memory': ['Low', 'Low', 'Low', 'Medium', 'High', 'Low', 'High']
})

print("="*100)
print("MISSING VALUE METHODS COMPARISON")
print("="*100)
print(comparison.to_string(index=False))
```

## Performance Benchmark

```python
import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer, KNNImputer
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
import time

# Create large dataset
np.random.seed(42)
n = 10000
df = pd.DataFrame({
    f'feature_{i}': np.random.randn(n) for i in range(10)
})

# Add missing values
for col in df.columns:
    missing_idx = np.random.choice(df.index, int(n * 0.15), replace=False)
    df.loc[missing_idx, col] = np.nan

print(f"Dataset: {df.shape}")
print(f"Total missing: {df.isnull().sum().sum():,}")
print("\n" + "="*70 + "\n")

# Benchmark methods
methods = {
    'Simple (Mean)': SimpleImputer(strategy='mean'),
    'Simple (Median)': SimpleImputer(strategy='median'),
    'KNN (k=3)': KNNImputer(n_neighbors=3),
    'KNN (k=5)': KNNImputer(n_neighbors=5),
    'Iterative': IterativeImputer(max_iter=5, random_state=42)
}

results = []

for name, imputer in methods.items():
    start_time = time.time()
    imputed = imputer.fit_transform(df)
    elapsed = time.time() - start_time

    results.append({
        'Method': name,
        'Time (seconds)': round(elapsed, 3),
        'Memory (MB)': round(imputed.nbytes / 1024**2, 2)
    })

    print(f"{name:20s}: {elapsed:6.3f}s")

print("\n" + "="*70 + "\n")
results_df = pd.DataFrame(results)
print(results_df.to_string(index=False))
```

## Real-World Scenario Recommendations

### Scenario 1: Customer Survey Data

```python
scenario = {
    'Context': 'Customer satisfaction survey',
    'Missing Rate': '15% across multiple questions',
    'Pattern': 'Younger customers skip income questions',
    'Recommendation': 'KNN Imputer',
    'Reasoning': [
        'MAR pattern (depends on age)',
        'Features are correlated',
        'Medium dataset size',
        'Accuracy matters'
    ]
}

print("Scenario: Customer Survey")
print("="*60)
for key, value in scenario.items():
    if isinstance(value, list):
        print(f"{key}:")
        for item in value:
            print(f"  - {item}")
    else:
        print(f"{key}: {value}")
```

### Scenario 2: Medical Records

```python
scenario = {
    'Context': 'Patient vital signs monitoring',
    'Missing Rate': '25% for certain tests',
    'Pattern': 'Tests missing for healthier patients',
    'Recommendation': 'Iterative Imputer + Indicator',
    'Reasoning': [
        'MNAR pattern (health status affects missingness)',
        'Complex relationships between vitals',
        'High stakes (medical decisions)',
        'Need uncertainty quantification'
    ]
}

print("\nScenario: Medical Records")
print("="*60)
for key, value in scenario.items():
    if isinstance(value, list):
        print(f"{key}:")
        for item in value:
            print(f"  - {item}")
    else:
        print(f"{key}: {value}")
```

### Scenario 3: Sensor Data

```python
scenario = {
    'Context': 'IoT temperature sensors',
    'Missing Rate': '10% random failures',
    'Pattern': 'Complete random (equipment malfunction)',
    'Recommendation': 'Forward Fill or SimpleImputer',
    'Reasoning': [
        'MCAR pattern',
        'Time series data',
        'Large dataset',
        'Speed is important',
        'Temporal continuity matters'
    ]
}

print("\nScenario: Sensor Data")
print("="*60)
for key, value in scenario.items():
    if isinstance(value, list):
        print(f"{key}:")
        for item in value:
            print(f"  - {item}")
    else:
        print(f"{key}: {value}")
```

## Model-Specific Recommendations

```python
model_recommendations = {
    'Linear Models': {
        'recommended': ['KNN', 'Iterative'],
        'avoid': ['Simple Mean (biases coefficients)'],
        'reasoning': 'Sensitive to data distribution'
    },
    'Tree-Based Models': {
        'recommended': ['SimpleImputer', 'KNN'],
        'avoid': [],
        'reasoning': 'Robust to imputation method'
    },
    'Neural Networks': {
        'recommended': ['Iterative', 'Multiple Imputation'],
        'avoid': ['Simple Mean'],
        'reasoning': 'Need quality data, sensitive to distributions'
    },
    'Clustering': {
        'recommended': ['KNN', 'Iterative'],
        'avoid': ['Indicator (adds noise)'],
        'reasoning': 'Distance-based, needs accurate values'
    }
}

print("\nMODEL-SPECIFIC RECOMMENDATIONS")
print("="*70)
for model, details in model_recommendations.items():
    print(f"\n{model}:")
    print(f"  Recommended: {', '.join(details['recommended'])}")
    if details['avoid']:
        print(f"  Avoid: {', '.join(details['avoid'])}")
    print(f"  Why: {details['reasoning']}")
```

## Quick Decision Helper

```python
def recommend_imputation(missing_pct, data_type, dataset_size, has_correlations):
    """
    Recommend imputation method based on characteristics
    """
    print("IMPUTATION RECOMMENDATION")
    print("="*60)
    print(f"Missing: {missing_pct}%")
    print(f"Data Type: {data_type}")
    print(f"Dataset Size: {dataset_size}")
    print(f"Correlations: {'Yes' if has_correlations else 'No'}")
    print("\n" + "-"*60 + "\n")

    if missing_pct < 5:
        return "Drop rows (minimal data loss)"
    elif missing_pct > 50:
        return "Consider dropping column (too much missing)"
    elif data_type == 'MCAR':
        if dataset_size == 'large':
            return "SimpleImputer (mean/median) - fast and sufficient"
        else:
            return "SimpleImputer or KNN - both work well"
    elif data_type == 'MAR':
        if has_correlations:
            if dataset_size == 'large':
                return "KNN Imputer (balance of speed and accuracy)"
            else:
                return "Iterative Imputer (best accuracy)"
        else:
            return "SimpleImputer (no correlations to leverage)"
    else:  # MNAR
        return "Indicator Variable + SimpleImputer or Iterative"

# Examples
print(recommend_imputation(12, 'MAR', 'medium', True))
print("\n")
print(recommend_imputation(3, 'MCAR', 'large', False))
print("\n")
print(recommend_imputation(25, 'MNAR', 'small', True))
```

## Summary

Choosing the right imputation method requires considering:

1. **Missing percentage** (< 5%, 5-20%, > 20%)
2. **Missing data type** (MCAR, MAR, MNAR)
3. **Dataset size** (affects speed requirements)
4. **Feature correlations** (affects method choice)
5. **Model type** (sensitivity to imputation)
6. **Stakeholder requirements** (speed vs accuracy)

**Quick Reference:**
```
MCAR → SimpleImputer
MAR + Correlations → KNN or Iterative
MNAR → Indicator + Imputation
Large Dataset → SimpleImputer (speed)
Small Dataset + Accuracy → Iterative
Time Series → Forward Fill / Interpolate
```

---

**Navigation:**
- **Previous:** [← Advanced Techniques](./missing-advanced-techniques.md)
- **Next:** [Best Practices →](./missing-best-practices.md)
- **Related:** [Missing Data Overview](./missing-overview.md)
