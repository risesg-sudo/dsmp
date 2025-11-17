# LDA & Apriori Algorithm

## Part 1: Linear Discriminant Analysis (LDA)

### Overview
LDA is a **supervised dimensionality reduction** technique that finds the directions (linear discriminants) that maximize class separation. Unlike PCA which maximizes variance, LDA maximizes the ratio of between-class to within-class variance.

### Key Concept
```
Goal: Project data to maximize class separation

PCA (Unsupervised):          LDA (Supervised):
Maximize variance            Maximize separation

    ●●                           ●●
   ●●●                          ●●●
  ●●●●                         ●●●●
   ▲▲                            │  ▲▲▲
  ▲▲▲                            │  ▲▲▲
 ▲▲▲▲                            │ ▲▲▲▲

Project vertically           Project to separate
(max variance)              classes best

  ●▲●▲                         ●●●●  ▲▲▲▲
  ●▲●▲                         ●●●●  ▲▲▲▲
(classes mixed)              (classes separated!)
```

### PCA vs LDA

```
Comparison:
──────────────────────────────────────────────
Aspect          PCA                 LDA
──────────────────────────────────────────────
Type            Unsupervised        Supervised
Objective       Max variance        Max separation
Needs labels    No                  Yes
Max components  min(n_features, n_samples) min(n_classes-1, n_features)
Use case        Compression         Classification

Visual Example (2 classes):
───────────────────────────────────────────────

Original 2D:          PCA:              LDA:
   ●●●                ●●●▲▲▲            ●●●
  ●●●●               ●●●▲▲▲             │  ▲▲▲
  ●●●                ●●●▲▲▲             │  ▲▲▲
    ▲▲▲              ●●●▲▲▲             │  ▲▲▲
   ▲▲▲              (overlapping)     (separated)
  ▲▲▲

Project to 1D:
PCA: ●▲●●▲▲●▲        LDA: ●●●●  ▲▲▲▲
     (mixed)              (clean separation!)
```

## Mathematical Foundation

### Objective Function

LDA maximizes the Fisher criterion:

```
         between-class variance
J(w) = ─────────────────────────
         within-class variance

Mathematically:
           w^T S_B w
J(w) = ───────────────
           w^T S_W w

Where:
- w = projection direction (discriminant)
- S_B = between-class scatter matrix
- S_W = within-class scatter matrix
```

### Scatter Matrices

```
Within-Class Scatter (S_W):
────────────────────────────────────────
How spread out each class is internally

S_W = Σ(c=1 to C) Σ(x∈class c) (x - μ_c)(x - μ_c)^T

  Class 1:          Class 2:
   ●●●               ▲▲▲
  ●● ●              ▲ ▲▲
   ●●●               ▲▲▲

  Compact → Low S_W


Between-Class Scatter (S_B):
────────────────────────────────────────
How far apart class means are

S_B = Σ(c=1 to C) N_c (μ_c - μ)(μ_c - μ)^T

Where:
- μ_c = mean of class c
- μ = overall mean
- N_c = number of samples in class c

  ●●●         ▲▲▲
   ●           ▲
  ●●●         ▲▲▲

  Far apart → High S_B
```

### Algorithm

```
LDA Steps:
──────────────────────────────────────────────

1. Compute class means μ_c for each class

2. Compute overall mean μ

3. Compute within-class scatter S_W
   S_W = Σ_c Σ_(x in c) (x - μ_c)(x - μ_c)^T

4. Compute between-class scatter S_B
   S_B = Σ_c N_c (μ_c - μ)(μ_c - μ)^T

5. Solve eigenvalue problem:
   S_W^(-1) S_B w = λw

6. Sort eigenvectors by eigenvalues (descending)

7. Select top k eigenvectors as projection matrix

8. Project data: X_new = X · W
```

## Implementation

### Basic LDA
```python
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
import numpy as np
from sklearn.datasets import load_iris

# Load data
iris = load_iris()
X = iris.data  # 4 features
y = iris.target  # 3 classes

# Fit LDA
lda = LinearDiscriminantAnalysis(n_components=2)  # Max 2 for 3 classes
X_lda = lda.fit_transform(X, y)

print("Original shape:", X.shape)  # (150, 4)
print("LDA shape:", X_lda.shape)   # (150, 2)
print("Explained variance ratio:", lda.explained_variance_ratio_)
print("Means:\n", lda.means_)

# Visualize
import matplotlib.pyplot as plt
plt.figure(figsize=(10, 6))
for i, target_name in enumerate(iris.target_names):
    plt.scatter(
        X_lda[y == i, 0],
        X_lda[y == i, 1],
        label=target_name,
        alpha=0.6,
        s=50
    )
plt.xlabel('LD1')
plt.ylabel('LD2')
plt.title('LDA: Iris Dataset')
plt.legend()
plt.show()
```

### LDA for Classification
```python
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

# LDA as classifier
lda = LinearDiscriminantAnalysis()
lda.fit(X_train, y_train)

# Predict
y_pred = lda.predict(X_test)
y_proba = lda.predict_proba(X_test)

# Evaluate
print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Decision function
decision = lda.decision_function(X_test)
print("Decision function shape:", decision.shape)  # (n_samples, n_classes)
```

### Complete Pipeline
```python
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score
from sklearn.metrics import confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# 1. Preprocess
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 2. Fit LDA for visualization
lda_viz = LinearDiscriminantAnalysis(n_components=2)
X_lda = lda_viz.fit_transform(X_scaled, y)

# 3. Visualize
plt.figure(figsize=(12, 5))

# Plot 1: LDA projection
plt.subplot(121)
for i in range(len(np.unique(y))):
    plt.scatter(
        X_lda[y == i, 0],
        X_lda[y == i, 1],
        label=f'Class {i}',
        alpha=0.6
    )
plt.xlabel(f'LD1 ({lda_viz.explained_variance_ratio_[0]:.1%})')
plt.ylabel(f'LD2 ({lda_viz.explained_variance_ratio_[1]:.1%})')
plt.title('LDA Projection')
plt.legend()

# Plot 2: Explained variance
plt.subplot(122)
plt.bar(
    range(1, len(lda_viz.explained_variance_ratio_) + 1),
    lda_viz.explained_variance_ratio_
)
plt.xlabel('Linear Discriminant')
plt.ylabel('Explained Variance Ratio')
plt.title('Explained Variance by Component')
plt.show()

# 4. Cross-validation
lda_clf = LinearDiscriminantAnalysis()
scores = cross_val_score(lda_clf, X_scaled, y, cv=5)
print(f"Cross-validation scores: {scores}")
print(f"Mean accuracy: {scores.mean():.3f} (+/- {scores.std():.3f})")

# 5. Train final model
lda_clf.fit(X_scaled, y)

# 6. Confusion matrix
y_pred = lda_clf.predict(X_scaled)
cm = confusion_matrix(y, y_pred)

plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title('Confusion Matrix')
plt.show()
```

### LDA Variants
```python
# Quadratic Discriminant Analysis (QDA)
# Allows different covariance matrices per class
from sklearn.discriminant_analysis import QuadraticDiscriminantAnalysis

qda = QuadraticDiscriminantAnalysis()
qda.fit(X_train, y_train)
qda_pred = qda.predict(X_test)

print("QDA Accuracy:", accuracy_score(y_test, qda_pred))

# When to use:
# LDA: Assumes same covariance for all classes (linear boundaries)
# QDA: Different covariance per class (quadratic boundaries)

# Compare
from sklearn.model_selection import cross_val_score

lda_scores = cross_val_score(
    LinearDiscriminantAnalysis(), X, y, cv=5
)
qda_scores = cross_val_score(
    QuadraticDiscriminantAnalysis(), X, y, cv=5
)

print(f"LDA: {lda_scores.mean():.3f} (+/- {lda_scores.std():.3f})")
print(f"QDA: {qda_scores.mean():.3f} (+/- {qda_scores.std():.3f})")
```

## Advantages & Limitations

### Advantages
```
✓ Supervised (uses class labels)
✓ Maximizes class separation
✓ Reduces dimensions while preserving discriminability
✓ Can be used as classifier
✓ Interpretable (linear combinations)
✓ Fast and efficient
✓ Works well with small datasets
✓ Provides probability estimates
```

### Limitations
```
✗ Assumes normally distributed classes
✗ Assumes equal covariance matrices (LDA)
✗ Linear decision boundaries only
✗ Maximum n_classes - 1 components
✗ Sensitive to outliers
✗ Requires labels (supervised)
✗ Can overfit with many features, few samples
✗ Struggles with highly non-linear data
```

### When to Use LDA

```
Use LDA When:
─────────────────────────────────────
✓ You need dimensionality reduction for classification
✓ Classes are roughly normally distributed
✓ You want interpretable features
✓ You have labeled data
✓ Linear boundaries are sufficient
✓ Preprocessing before classification

Don't Use LDA When:
─────────────────────────────────────
✗ Classes have very different covariances (use QDA)
✗ Highly non-linear boundaries (use kernel methods)
✗ No labels available (use PCA, t-SNE)
✗ Many more features than samples
✗ Classes are not Gaussian
```

---

## Part 2: Apriori Algorithm (Association Rules)

### Overview
Apriori is an algorithm for **association rule mining** - discovering interesting relationships (patterns) in large datasets. Most famous for market basket analysis.

### Key Concepts

```
Market Basket Example:
──────────────────────────────────────────────
Transaction 1: {Milk, Bread, Butter}
Transaction 2: {Milk, Bread, Eggs}
Transaction 3: {Bread, Butter}
Transaction 4: {Milk, Bread, Butter, Eggs}
Transaction 5: {Bread, Eggs}

Association Rules:
{Bread, Milk} → {Butter}   "People who buy bread and milk also buy butter"
{Bread} → {Milk}           "People who buy bread also buy milk"
```

### Terminology

```
Itemset: Set of items
─────────────────────────────────────
{Bread}              → 1-itemset
{Bread, Milk}        → 2-itemset
{Bread, Milk, Eggs}  → 3-itemset


Frequent Itemset: Appears often
─────────────────────────────────────
If {Bread, Milk} appears in 60% of transactions
→ Frequent itemset (if min_support = 50%)


Association Rule: X → Y
─────────────────────────────────────
If X then Y
{Bread} → {Milk}
Antecedent → Consequent
```

## Metrics

### 1. Support

**Definition:** How often itemset appears

```
              count(X)
Support(X) = ──────────
            total_transactions

Example:
Transactions: 100
{Bread} appears in: 60

Support({Bread}) = 60/100 = 0.6 = 60%

Visual:
100 Transactions:
████████████████████████████████████████ 40 without Bread
████████████████████████████████████████████████████████ 60 with Bread

Support({Bread}) = 60%
```

### 2. Confidence

**Definition:** How often rule is true

```
               Support(X ∪ Y)
Confidence = ──────────────────
               Support(X)

Example:
{Bread} appears in: 60 transactions
{Bread, Milk} appears in: 40 transactions

Confidence({Bread} → {Milk}) = 40/60 = 0.67 = 67%

Interpretation: 67% of people who buy Bread also buy Milk

Visual:
60 Bread purchases:
████████████████████████████████████████ 40 with Milk (67%)
████████████████████ 20 without Milk
```

### 3. Lift

**Definition:** How much more likely Y is when X is purchased

```
                  Support(X ∪ Y)
Lift(X → Y) = ─────────────────────────
              Support(X) × Support(Y)

Example:
Support({Bread, Milk}) = 0.4
Support({Bread}) = 0.6
Support({Milk}) = 0.5

Lift({Bread} → {Milk}) = 0.4 / (0.6 × 0.5) = 1.33

Interpretation:
─────────────────────────────────────
Lift = 1.0   →   No relationship
Lift > 1.0   →   Positive correlation (X increases Y)
Lift < 1.0   →   Negative correlation (X decreases Y)

Lift = 1.33  →   33% more likely to buy Milk when buying Bread
```

### 4. Conviction

**Definition:** How much more often X appears without Y than expected

```
                   1 - Support(Y)
Conviction = ────────────────────────
             1 - Confidence(X → Y)

High conviction → Strong rule
Conviction = ∞ → Perfect rule (never violated)
```

### 5. Leverage

**Definition:** Difference between observed and expected co-occurrence

```
Leverage(X → Y) = Support(X ∪ Y) - Support(X) × Support(Y)

Positive → Positive correlation
Zero → Independence
Negative → Negative correlation
```

## Apriori Algorithm

### How It Works

```
Principle: If an itemset is frequent, all its subsets are also frequent
(and contrapositive: if an itemset is infrequent, all its supersets are infrequent)

Example with min_support = 50%:
────────────────────────────────────────────────

Step 1: Find frequent 1-itemsets
───────────────────────────────────────
{A}: 70%  ✓ Frequent
{B}: 60%  ✓ Frequent
{C}: 40%  ✗ Infrequent (pruned)
{D}: 55%  ✓ Frequent

Frequent 1-itemsets: {A}, {B}, {D}


Step 2: Generate candidate 2-itemsets (from frequent 1-itemsets)
───────────────────────────────────────
{A, B}, {A, D}, {B, D}  (not {A, C} or {C, D} because C was pruned)


Step 3: Count support for 2-itemsets
───────────────────────────────────────
{A, B}: 55%  ✓ Frequent
{A, D}: 45%  ✗ Infrequent (pruned)
{B, D}: 50%  ✓ Frequent

Frequent 2-itemsets: {A, B}, {B, D}


Step 4: Generate candidate 3-itemsets
───────────────────────────────────────
{A, B, D}  (only one possible)


Step 5: Count support
───────────────────────────────────────
{A, B, D}: 40%  ✗ Infrequent

No frequent 3-itemsets → Stop


Final Frequent Itemsets:
───────────────────────────────────────
1-itemsets: {A}, {B}, {D}
2-itemsets: {A, B}, {B, D}
```

### Algorithm Pseudocode

```
Apriori(transactions, min_support):
    k = 1
    L[k] = find_frequent_1_itemsets(transactions, min_support)

    while L[k] is not empty:
        C[k+1] = generate_candidates(L[k])  # Join step
        C[k+1] = prune(C[k+1], L[k])        # Prune step

        for transaction in transactions:
            for candidate in C[k+1]:
                if candidate ⊆ transaction:
                    candidate.count++

        L[k+1] = {c in C[k+1] | c.support >= min_support}
        k++

    return ∪(L[1], L[2], ..., L[k])
```

## Implementation

### Using mlxtend Library
```python
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder
import pandas as pd

# Sample transactions
transactions = [
    ['Milk', 'Bread', 'Butter'],
    ['Milk', 'Bread', 'Eggs'],
    ['Bread', 'Butter'],
    ['Milk', 'Bread', 'Butter', 'Eggs'],
    ['Bread', 'Eggs'],
    ['Milk', 'Eggs'],
    ['Milk', 'Bread', 'Butter'],
    ['Bread', 'Eggs', 'Butter']
]

# 1. Encode transactions
te = TransactionEncoder()
te_ary = te.fit(transactions).transform(transactions)
df = pd.DataFrame(te_ary, columns=te.columns_)

print("Encoded transactions:")
print(df)

# 2. Find frequent itemsets
frequent_itemsets = apriori(df, min_support=0.3, use_colnames=True)
print("\nFrequent itemsets:")
print(frequent_itemsets)

# 3. Generate association rules
rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.5)
print("\nAssociation rules:")
print(rules[['antecedents', 'consequents', 'support', 'confidence', 'lift']])

# 4. Sort by lift
rules_sorted = rules.sort_values('lift', ascending=False)
print("\nTop rules by lift:")
print(rules_sorted[['antecedents', 'consequents', 'confidence', 'lift']].head(10))
```

### Market Basket Analysis
```python
import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules

# Load transaction data
# Format: One row per transaction, one column per item (0/1)
df = pd.read_csv('market_basket.csv')

# Or from transaction format:
# transaction_id, item
# 1, Bread
# 1, Milk
# 2, Bread
# ...

# Convert to basket format
basket = df.groupby(['transaction_id', 'item'])['item'].count().unstack().fillna(0)
basket = basket.applymap(lambda x: 1 if x > 0 else 0)

# Find frequent itemsets
frequent_itemsets = apriori(basket, min_support=0.01, use_colnames=True)

# Generate rules
rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1.0)

# Filter and analyze
high_confidence_rules = rules[rules['confidence'] > 0.5]
high_lift_rules = rules[rules['lift'] > 1.5]

print(f"Total rules: {len(rules)}")
print(f"High confidence rules: {len(high_confidence_rules)}")
print(f"High lift rules: {len(high_lift_rules)}")

# Display top rules
print("\nTop 10 rules by lift:")
print(rules.nlargest(10, 'lift')[['antecedents', 'consequents',
                                    'support', 'confidence', 'lift']])
```

### Complete Analysis Pipeline
```python
from mlxtend.frequent_patterns import apriori, association_rules
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# 1. Prepare data
df = load_transaction_data()
basket = prepare_basket_format(df)

# 2. Find frequent itemsets with different support thresholds
support_thresholds = [0.01, 0.02, 0.05, 0.1]
itemset_counts = []

for support in support_thresholds:
    itemsets = apriori(basket, min_support=support, use_colnames=True)
    itemset_counts.append(len(itemsets))

# Plot itemsets vs support
plt.figure(figsize=(10, 6))
plt.plot(support_thresholds, itemset_counts, 'bo-')
plt.xlabel('Minimum Support')
plt.ylabel('Number of Frequent Itemsets')
plt.title('Frequent Itemsets vs Support Threshold')
plt.grid(True)
plt.show()

# 3. Generate rules
frequent_itemsets = apriori(basket, min_support=0.02, use_colnames=True)
rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.3)

# 4. Analyze rules
print(f"Total rules: {len(rules)}")
print(f"\nSupport statistics:")
print(rules['support'].describe())
print(f"\nConfidence statistics:")
print(rules['confidence'].describe())
print(f"\nLift statistics:")
print(rules['lift'].describe())

# 5. Visualize
fig, axes = plt.subplots(2, 2, figsize=(15, 12))

# Support vs Confidence
axes[0, 0].scatter(rules['support'], rules['confidence'], alpha=0.5)
axes[0, 0].set_xlabel('Support')
axes[0, 0].set_ylabel('Confidence')
axes[0, 0].set_title('Support vs Confidence')

# Support vs Lift
axes[0, 1].scatter(rules['support'], rules['lift'], alpha=0.5)
axes[0, 1].set_xlabel('Support')
axes[0, 1].set_ylabel('Lift')
axes[0, 1].set_title('Support vs Lift')

# Confidence vs Lift
axes[1, 0].scatter(rules['confidence'], rules['lift'], alpha=0.5)
axes[1, 0].set_xlabel('Confidence')
axes[1, 0].set_ylabel('Lift')
axes[1, 0].set_title('Confidence vs Lift')

# Lift distribution
axes[1, 1].hist(rules['lift'], bins=50, edgecolor='black')
axes[1, 1].set_xlabel('Lift')
axes[1, 1].set_ylabel('Frequency')
axes[1, 1].set_title('Lift Distribution')
axes[1, 1].axvline(x=1, color='r', linestyle='--', label='Lift=1')
axes[1, 1].legend()

plt.tight_layout()
plt.show()

# 6. Find interesting rules
interesting_rules = rules[
    (rules['lift'] > 1.5) &
    (rules['confidence'] > 0.5) &
    (rules['support'] > 0.01)
]

print(f"\nInteresting rules: {len(interesting_rules)}")
print(interesting_rules[['antecedents', 'consequents',
                         'support', 'confidence', 'lift']])
```

### Filtering Rules
```python
# Various filtering strategies

# 1. By metrics
strong_rules = rules[
    (rules['support'] >= 0.01) &
    (rules['confidence'] >= 0.5) &
    (rules['lift'] > 1.2)
]

# 2. By itemset size
# Rules with single item antecedent
single_item_rules = rules[rules['antecedents'].apply(lambda x: len(x) == 1)]

# Rules with multiple items
multi_item_rules = rules[rules['antecedents'].apply(lambda x: len(x) > 1)]

# 3. By specific items
# Rules containing 'Milk'
milk_rules = rules[
    rules['antecedents'].apply(lambda x: 'Milk' in x) |
    rules['consequents'].apply(lambda x: 'Milk' in x)
]

# 4. By conviction
high_conviction = rules[rules['conviction'] > 1.5]

# 5. Custom filtering
def filter_rules(rules, min_support=0.01, min_confidence=0.5,
                 min_lift=1.0, max_len=None):
    """Custom rule filtering"""
    filtered = rules[
        (rules['support'] >= min_support) &
        (rules['confidence'] >= min_confidence) &
        (rules['lift'] >= min_lift)
    ]

    if max_len:
        filtered = filtered[
            filtered['antecedents'].apply(lambda x: len(x) <= max_len)
        ]

    return filtered

custom_rules = filter_rules(rules, min_lift=1.5, max_len=2)
```

## Real-World Applications

### 1. Retail Market Basket Analysis
```python
"""
Recommend products based on shopping cart
"""
# Customer adds {Bread, Milk} to cart
cart = {'Bread', 'Milk'}

# Find rules with these items as antecedent
recommendations = rules[
    rules['antecedents'].apply(lambda x: x.issubset(cart))
].sort_values('lift', ascending=False)

# Suggest consequents
print("Customers also bought:")
for idx, row in recommendations.head(5).iterrows():
    items = ', '.join(row['consequents'])
    print(f"  {items} (confidence: {row['confidence']:.1%}, lift: {row['lift']:.2f})")
```

### 2. Cross-Selling Strategy
```python
"""
Identify products to bundle or promote together
"""
# Find high-lift pairs
cross_sell_opportunities = rules[
    (rules['lift'] > 2.0) &
    (rules['confidence'] > 0.6) &
    (rules['antecedents'].apply(len) == 1) &
    (rules['consequents'].apply(len) == 1)
].sort_values('lift', ascending=False)

print("Cross-selling opportunities:")
for idx, row in cross_sell_opportunities.iterrows():
    ante = list(row['antecedents'])[0]
    cons = list(row['consequents'])[0]
    print(f"\nBundle: {ante} + {cons}")
    print(f"  Lift: {row['lift']:.2f}")
    print(f"  Confidence: {row['confidence']:.1%}")
    print(f"  Support: {row['support']:.1%}")
```

### 3. Website Clickstream Analysis
```python
"""
Analyze user navigation patterns
"""
# Pages visited in session
sessions = [
    ['home', 'products', 'cart', 'checkout'],
    ['home', 'blog', 'products'],
    ['home', 'products', 'product_detail', 'cart'],
    # ... more sessions
]

# Encode and analyze
te = TransactionEncoder()
te_ary = te.fit(sessions).transform(sessions)
df = pd.DataFrame(te_ary, columns=te.columns_)

frequent_paths = apriori(df, min_support=0.1, use_colnames=True)
path_rules = association_rules(frequent_paths, metric="confidence", min_threshold=0.3)

# Find common navigation flows
print("Common navigation patterns:")
for idx, row in path_rules.nlargest(10, 'confidence').iterrows():
    path = ' → '.join(list(row['antecedents']) + list(row['consequents']))
    print(f"{path}: {row['confidence']:.1%} confidence")
```

### 4. Medical Diagnosis Patterns
```python
"""
Find symptom-disease associations
"""
# Patient symptoms and diagnoses
patient_data = [
    ['fever', 'cough', 'headache', 'flu'],
    ['fever', 'rash', 'measles'],
    ['cough', 'shortness_of_breath', 'pneumonia'],
    # ... more cases
]

te = TransactionEncoder()
te_ary = te.fit(patient_data).transform(patient_data)
df = pd.DataFrame(te_ary, columns=te.columns_)

# Find patterns
symptom_patterns = apriori(df, min_support=0.05, use_colnames=True)
diagnosis_rules = association_rules(
    symptom_patterns,
    metric="confidence",
    min_threshold=0.7
)

# Filter rules: symptoms → diagnosis
symptom_cols = ['fever', 'cough', 'headache', 'rash']
diagnosis_cols = ['flu', 'measles', 'pneumonia']

clinical_rules = diagnosis_rules[
    diagnosis_rules['antecedents'].apply(
        lambda x: all(item in symptom_cols for item in x)
    ) &
    diagnosis_rules['consequents'].apply(
        lambda x: all(item in diagnosis_cols for item in x)
    )
]

print("Clinical decision support rules:")
print(clinical_rules[['antecedents', 'consequents', 'confidence', 'lift']])
```

### 5. Movie Recommendation
```python
"""
Recommend movies based on viewing history
"""
# User viewing history
user_movies = [
    ['Inception', 'Interstellar', 'The Matrix'],
    ['Titanic', 'The Notebook', 'La La Land'],
    # ... more users
]

te = TransactionEncoder()
te_ary = te.fit(user_movies).transform(user_movies)
df = pd.DataFrame(te_ary, columns=te.columns_)

movie_patterns = apriori(df, min_support=0.05, use_colnames=True)
movie_rules = association_rules(movie_patterns, metric="lift", min_threshold=1.0)

# Recommend for user who watched ['Inception', 'Interstellar']
watched = {'Inception', 'Interstellar'}
recommendations = movie_rules[
    movie_rules['antecedents'].apply(lambda x: x.issubset(watched))
].sort_values('lift', ascending=False)

print("Recommended movies:")
for idx, row in recommendations.head(5).iterrows():
    movies = ', '.join(row['consequents'])
    print(f"  {movies} (lift: {row['lift']:.2f})")
```

## Advantages & Limitations

### Advantages
```
✓ Finds hidden patterns in data
✓ Unsupervised (no labels needed)
✓ Interpretable results
✓ Scales well with transactions
✓ Easy to understand and explain
✓ Works with categorical data
✓ Actionable insights
```

### Limitations
```
✗ Generates many rules (can be overwhelming)
✗ Sensitive to support threshold
✗ Computationally expensive for low support
✗ Only finds frequent patterns (misses rare but important)
✗ Assumes all items equally important
✗ No temporal information
✗ Struggles with high-dimensional data
```

## Comparison: LDA vs Apriori

| Aspect | LDA | Apriori |
|--------|-----|---------|
| **Type** | Dimensionality Reduction | Association Rule Mining |
| **Supervised** | Yes | No |
| **Data Type** | Numerical | Categorical (transactions) |
| **Output** | Lower-dimensional features | Association rules |
| **Goal** | Maximize class separation | Find frequent patterns |
| **Use Case** | Classification preprocessing | Market basket analysis |
| **Scalability** | Good | Moderate (depends on support) |

## Quick Reference

### LDA
```python
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis

# Dimensionality reduction
lda = LinearDiscriminantAnalysis(n_components=2)
X_lda = lda.fit_transform(X, y)

# Classification
lda = LinearDiscriminantAnalysis()
lda.fit(X_train, y_train)
y_pred = lda.predict(X_test)
```

### Apriori
```python
from mlxtend.frequent_patterns import apriori, association_rules

# Find frequent itemsets
frequent_itemsets = apriori(df, min_support=0.01, use_colnames=True)

# Generate rules
rules = association_rules(
    frequent_itemsets,
    metric="confidence",
    min_threshold=0.5
)

# Filter interesting rules
interesting = rules[
    (rules['lift'] > 1.5) &
    (rules['confidence'] > 0.6)
]
```
