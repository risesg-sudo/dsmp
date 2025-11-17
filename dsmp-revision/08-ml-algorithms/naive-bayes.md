# Naive Bayes

## Overview
Naive Bayes is a **probabilistic classification algorithm** based on Bayes' Theorem with the "naive" assumption of conditional independence between features. Despite this strong assumption, it works surprisingly well in practice.

---

## Mathematical Formulation

### Bayes' Theorem

```
P(Y|X) = P(X|Y) × P(Y) / P(X)

where:
- P(Y|X) = Posterior probability (what we want)
- P(X|Y) = Likelihood (probability of features given class)
- P(Y) = Prior probability (class distribution)
- P(X) = Evidence (marginal probability of features)
```

### Naive Bayes Classification

```
Y_pred = argmax P(Y=y|X₁,X₂,...,Xₙ)
         y∈Y

      = argmax P(X₁,X₂,...,Xₙ|Y=y) × P(Y=y)
         y∈Y

Naive Assumption: Features are conditionally independent

      = argmax P(Y=y) × ∏ P(Xᵢ|Y=y)
         y∈Y           i=1

For each class:
Score(y) = P(Y=y) × P(X₁|Y=y) × P(X₂|Y=y) × ... × P(Xₙ|Y=y)

Predict class with highest score
```

### Log Probabilities (Numerical Stability)

```
log(Score(y)) = log(P(Y=y)) + Σ log(P(Xᵢ|Y=y))
                               i=1

Prevents underflow from multiplying small probabilities
```

---

## Types of Naive Bayes

### 1. Gaussian Naive Bayes

**Use Case**: Continuous features that follow normal distribution

**Likelihood**:
```
P(Xᵢ=x|Y=y) = (1/√(2πσ²ᵧ)) × exp(-(x-μᵧ)²/(2σ²ᵧ))

where:
- μᵧ = mean of feature Xᵢ for class y
- σ²ᵧ = variance of feature Xᵢ for class y
```

**Example**: Height, weight, temperature

```
Distribution of feature "height" by class:

Height    Class A          Class B
(cm)      (μ=170, σ=10)   (μ=160, σ=8)

190 │
180 │     ╱╲
170 │   ╱    ╲              ╱╲
160 │ ╱        ╲          ╱    ╲
150 │╱          ╲        ╱      ╲
    └────────────────────────────
```

### 2. Multinomial Naive Bayes

**Use Case**: Discrete features (counts/frequencies)

**Likelihood**:
```
P(X|Y=y) = (N!)/(∏xᵢ!) × ∏ P(Xᵢ|Y=y)^xᵢ

Simplified (for classification):
P(X|Y=y) ∝ ∏ P(Xᵢ|Y=y)^xᵢ

where:
- xᵢ = count/frequency of feature i
- P(Xᵢ|Y=y) = probability of feature i in class y
```

**Example**: Text classification (word counts)

```
Document: "buy cheap drugs now"

Word counts: {buy: 1, cheap: 1, drugs: 1, now: 1}

P(spam|doc) ∝ P(spam) × P(buy|spam) × P(cheap|spam) ×
              P(drugs|spam) × P(now|spam)
```

### 3. Bernoulli Naive Bayes

**Use Case**: Binary features (presence/absence)

**Likelihood**:
```
P(Xᵢ|Y=y) = P(Xᵢ=1|Y=y)^xᵢ × (1-P(Xᵢ=1|Y=y))^(1-xᵢ)

where xᵢ ∈ {0, 1}
```

**Difference from Multinomial**:
- Explicitly models absence of features
- Binary values only (not counts)

**Example**: Document contains word or not

```
Document: "buy cheap drugs now"

Features: {buy: 1, lottery: 0, cheap: 1, sale: 0, drugs: 1}

P(spam|doc) ∝ P(spam) × P(buy=1|spam) × P(lottery=0|spam) ×
              P(cheap=1|spam) × P(sale=0|spam) × P(drugs=1|spam)
```

---

## Laplace Smoothing (Additive Smoothing)

### Problem: Zero Probability

```
Training data:
- Class "Spam": 100 emails
- Word "lottery" appears: 50 times

New email contains word "bitcoin" (never seen in training)
→ P(bitcoin|spam) = 0
→ P(spam|email) = P(spam) × 0 × ... = 0 ❌
```

### Solution: Add-α Smoothing

```
P(Xᵢ=k|Y=y) = (count(Xᵢ=k, Y=y) + α) / (count(Y=y) + α×d)

where:
- α = smoothing parameter (usually 1 for Laplace)
- d = number of unique values for feature Xᵢ

Common values:
- α = 1: Laplace smoothing
- α = 0.5: Jeffreys smoothing
- α = 0.1: Small smoothing
- α = 0: No smoothing (risk zero probabilities)
```

### Example

```
Word "bitcoin" in spam emails:
- Occurrences: 0
- Total spam emails: 100
- Vocabulary size: 1000

Without smoothing:
P(bitcoin|spam) = 0/100 = 0 ❌

With Laplace (α=1):
P(bitcoin|spam) = (0+1)/(100+1×1000) = 1/1100 ≈ 0.0009 ✓

Effect:
- Never assigns zero probability
- Minimal impact on frequently seen features
- Small probability for rare/unseen features
```

---

## Intuition

### The Weather Prediction Analogy

```
Question: Will I play tennis today?
Features: Outlook, Temperature, Humidity, Wind

Training data:
Day  Outlook  Temp    Humidity  Wind    Play
1    Sunny    Hot     High      Weak    No
2    Sunny    Hot     High      Strong  No
3    Overcast Hot     High      Weak    Yes
4    Rain     Mild    High      Weak    Yes
...

New day: Outlook=Sunny, Temp=Cool, Humidity=High, Wind=Strong

Calculate:
P(Play=Yes) × P(Sunny|Yes) × P(Cool|Yes) × P(High|Yes) × P(Strong|Yes)
vs
P(Play=No) × P(Sunny|No) × P(Cool|No) × P(High|No) × P(Strong|No)

Choose class with higher score
```

### Key Insights

1. **"Naive" doesn't mean stupid**: Works well despite independence assumption
2. **Probabilistic**: Outputs probabilities, not just labels
3. **Fast**: Training and prediction are O(nd)
4. **Handles missing data**: Can estimate probabilities with incomplete features
5. **Works with small data**: Good with limited training samples

---

## Decision Boundary Visualization

### Binary Classification

```
Feature Space (X₁, X₂):

    X₂
    ↑
  4 │  ○ ○ ○ ○ ○
    │ ○ ○ ○ ○ ○ ○
  3 │○ ○ ○ ○ ○ ○ ○
    │  ○ ○ ○ ○ ○ ○
  2 │╱ ╱ ╱ ╱ ╱ ╱ ╱ ← Decision boundary
    │● ● ● ● ● ●     (curved for Gaussian)
  1 │ ● ● ● ● ●
    │● ● ● ● ●
  0 └─────────────→ X₁
    0 1 2 3 4 5 6

Class ●: P(●) × P(X₁|●) × P(X₂|●) > P(○) × P(X₁|○) × P(X₂|○)
Class ○: Otherwise
```

### Effect of Naive Assumption

```
True boundary (features correlated):
    │    ╱╲
    │   ╱  ╲
    │  ╱    ╲
    │ ╱  ●●  ╲
    │╱  ●●●●  ╲
    ╱   ○○○○   ╲

Naive Bayes boundary (assumes independence):
    │      │
    │  ●●  │
    │  ●●  │
    │  ●●  │ ← Axis-aligned
    │  ○○  │    (ignores correlation)
    │  ○○  │
    │      │

Still often works! Boundaries roughly separate classes.
```

---

## When to Use Naive Bayes

### ✅ Good For:

1. **Text Classification**
   - Spam detection
   - Sentiment analysis
   - Document categorization
   - News classification

2. **Multi-class Problems**
   - Naturally handles many classes
   - No need for one-vs-rest

3. **Real-time Predictions**
   - Very fast training and prediction
   - Low memory footprint

4. **Small Training Data**
   - Works well with limited samples
   - Less prone to overfitting

5. **High-Dimensional Data**
   - Scales well with many features
   - Common in text (thousands of words)

6. **Baseline Model**
   - Quick to implement and test
   - Good starting point

### ❌ Avoid When:

1. **Features are Correlated**
   - Violates independence assumption
   - May still work, but suboptimal

2. **Need Precise Probabilities**
   - Probability estimates can be poor
   - Rankings are usually correct

3. **Continuous Features Not Gaussian**
   - Gaussian NB assumes normal distribution
   - Use discretization or other variants

4. **Complex Decision Boundaries**
   - Limited to simple boundaries
   - Tree-based or neural nets may be better

---

## Comparison of Variants

| Feature | Gaussian | Multinomial | Bernoulli |
|---------|----------|-------------|-----------|
| **Data Type** | Continuous | Discrete counts | Binary |
| **Distribution** | Normal | Multinomial | Bernoulli |
| **Example** | Height, weight | Word counts | Word presence |
| **Use Case** | General numeric | Text (TF), images | Text (binary), boolean features |
| **Zero counts** | N/A | Needs smoothing | Models explicitly |
| **Scaling** | Recommended | Not needed | Not needed |

---

## Hyperparameter Tuning

### 1. Smoothing Parameter (α)

| α Value | Effect | When to Use |
|---------|--------|-------------|
| 0 | No smoothing | Large dataset, no zeros |
| 0.01-0.1 | Light smoothing | Medium dataset |
| 1 | Laplace smoothing | Standard choice |
| 2-10 | Heavy smoothing | Small dataset, many zeros |

```python
# Find optimal α
alphas = [0.001, 0.01, 0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
scores = []

for alpha in alphas:
    nb = MultinomialNB(alpha=alpha)
    score = cross_val_score(nb, X_train, y_train, cv=5).mean()
    scores.append(score)

best_alpha = alphas[np.argmax(scores)]
```

### 2. Priors (Class Probabilities)

```python
# Option 1: Use data priors (default)
nb = GaussianNB()

# Option 2: Specify custom priors
nb = GaussianNB(priors=[0.3, 0.7])  # For imbalanced data

# Option 3: Uniform priors
nb = GaussianNB(priors=[0.5, 0.5])
```

### 3. Variance Smoothing (Gaussian NB only)

```python
# Adds to variance for numerical stability
nb = GaussianNB(var_smoothing=1e-9)  # Default

# Increase if features have very small variance
nb = GaussianNB(var_smoothing=1e-5)
```

---

## Preprocessing Requirements

### For Gaussian Naive Bayes

```python
# 1. Handle missing values
from sklearn.impute import SimpleImputer
imputer = SimpleImputer(strategy='mean')
X_imputed = imputer.fit_transform(X)

# 2. Scaling (optional but recommended)
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_imputed)

# 3. Check for normal distribution
import matplotlib.pyplot as plt
plt.hist(X[:, 0], bins=30)
plt.show()

# If not normal, consider:
# - Log transform
# - Box-Cox transform
# - Use Multinomial/Bernoulli NB instead
```

### For Multinomial Naive Bayes

```python
# 1. Ensure non-negative values
# Multinomial NB requires counts ≥ 0

# 2. Common for text: TF or TF-IDF
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer

# Count vectorization
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(documents)

# OR TF-IDF (often better)
tfidf = TfidfVectorizer()
X = tfidf.fit_transform(documents)
```

### For Bernoulli Naive Bayes

```python
# 1. Binarize features
from sklearn.preprocessing import Binarizer

binarizer = Binarizer(threshold=0.5)
X_binary = binarizer.fit_transform(X)

# 2. For text: Binary vectorization
from sklearn.feature_extraction.text import CountVectorizer

vectorizer = CountVectorizer(binary=True)
X = vectorizer.fit_transform(documents)
```

---

## Real-World Applications

### 1. **Spam Detection**
- Email classification (spam vs. ham)
- SMS spam filtering
- Comment moderation

### 2. **Sentiment Analysis**
- Product reviews (positive/negative)
- Social media monitoring
- Customer feedback analysis

### 3. **Document Classification**
- News categorization (sports, politics, tech)
- Academic paper classification
- Legal document sorting

### 4. **Medical Diagnosis**
- Disease prediction based on symptoms
- Patient risk assessment
- Drug interaction prediction

### 5. **Recommendation Systems**
- Content-based filtering
- User preference prediction
- Product categorization

### 6. **Weather Prediction**
- Binary forecasts (rain/no rain)
- Based on temperature, pressure, humidity

### 7. **Credit Scoring**
- Loan approval (approve/reject)
- Default risk assessment

---

## sklearn Implementation

### Gaussian Naive Bayes

```python
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix

# 1. Prepare data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 2. Scale features (optional but recommended)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 3. Train model
gnb = GaussianNB(
    priors=None,              # Use training data priors
    var_smoothing=1e-9        # Variance smoothing
)

gnb.fit(X_train_scaled, y_train)

# 4. Predict
y_pred = gnb.predict(X_test_scaled)
y_pred_proba = gnb.predict_proba(X_test_scaled)

# 5. Evaluate
print(classification_report(y_test, y_pred))
print(confusion_matrix(y_test, y_pred))

# 6. Get learned parameters
print(f"Class priors: {gnb.class_prior_}")
print(f"Means per class: {gnb.theta_}")
print(f"Variance per class: {gnb.var_}")
```

### Multinomial Naive Bayes (Text Classification)

```python
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.pipeline import Pipeline

# Example: Email spam detection
emails = [
    "Get cheap drugs now",
    "Meeting at 3pm tomorrow",
    "Win a free iPhone today",
    # ... more emails
]
labels = [1, 0, 1, ...]  # 1=spam, 0=ham

# Method 1: Manual pipeline
vectorizer = CountVectorizer(
    max_features=5000,     # Keep top 5000 words
    stop_words='english',  # Remove common words
    ngram_range=(1, 2)     # Unigrams and bigrams
)

X_train_counts = vectorizer.fit_transform(emails_train)
X_test_counts = vectorizer.transform(emails_test)

mnb = MultinomialNB(alpha=1.0)  # Laplace smoothing
mnb.fit(X_train_counts, y_train)
y_pred = mnb.predict(X_test_counts)

# Method 2: Using Pipeline
pipeline = Pipeline([
    ('vectorizer', TfidfVectorizer(
        max_features=5000,
        stop_words='english',
        ngram_range=(1, 2),
        min_df=2,              # Ignore rare words
        max_df=0.95            # Ignore very common words
    )),
    ('classifier', MultinomialNB(alpha=1.0))
])

pipeline.fit(emails_train, y_train)
y_pred = pipeline.predict(emails_test)

# 6. Feature importance (most predictive words)
feature_names = vectorizer.get_feature_names_out()
log_probs = mnb.feature_log_prob_

# Top spam words
spam_class_idx = 1
top_spam_indices = np.argsort(log_probs[spam_class_idx])[-20:]
top_spam_words = [feature_names[i] for i in top_spam_indices]
print(f"Top spam indicators: {top_spam_words}")
```

### Bernoulli Naive Bayes

```python
from sklearn.naive_bayes import BernoulliNB
from sklearn.feature_extraction.text import CountVectorizer

# Binary feature extraction
vectorizer = CountVectorizer(
    binary=True,           # Binary features (present/absent)
    max_features=1000
)

X_train_binary = vectorizer.fit_transform(documents_train)
X_test_binary = vectorizer.transform(documents_test)

# Train model
bnb = BernoulliNB(
    alpha=1.0,             # Smoothing
    binarize=None,         # Already binarized
    fit_prior=True         # Learn class priors
)

bnb.fit(X_train_binary, y_train)
y_pred = bnb.predict(X_test_binary)
```

### Hyperparameter Tuning

```python
from sklearn.model_selection import GridSearchCV

# Grid search for Multinomial NB
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('nb', MultinomialNB())
])

param_grid = {
    'tfidf__max_features': [1000, 3000, 5000],
    'tfidf__ngram_range': [(1, 1), (1, 2), (1, 3)],
    'tfidf__use_idf': [True, False],
    'nb__alpha': [0.1, 0.5, 1.0, 2.0, 5.0]
}

grid_search = GridSearchCV(
    pipeline,
    param_grid,
    cv=5,
    scoring='f1',
    n_jobs=-1,
    verbose=1
)

grid_search.fit(X_train, y_train)

print(f"Best parameters: {grid_search.best_params_}")
print(f"Best F1 score: {grid_search.best_score_:.4f}")

# Use best model
best_nb = grid_search.best_estimator_
```

### Handling Imbalanced Data

```python
# Option 1: Adjust class priors
from sklearn.utils.class_weight import compute_class_weight

class_weights = compute_class_weight(
    'balanced',
    classes=np.unique(y_train),
    y=y_train
)
priors = class_weights / class_weights.sum()

nb = GaussianNB(priors=priors)

# Option 2: Resample data
from imblearn.over_sampling import SMOTE

smote = SMOTE(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X_train, y_train)

nb = GaussianNB()
nb.fit(X_resampled, y_resampled)
```

### Probability Calibration

```python
# Naive Bayes probabilities can be poorly calibrated
# Use calibration for better probability estimates

from sklearn.calibration import CalibratedClassifierCV

# Train Naive Bayes
nb = MultinomialNB(alpha=1.0)
nb.fit(X_train, y_train)

# Calibrate probabilities
calibrated_nb = CalibratedClassifierCV(
    nb,
    method='sigmoid',  # or 'isotonic'
    cv=5
)
calibrated_nb.fit(X_train, y_train)

# Better probability estimates
y_proba_calibrated = calibrated_nb.predict_proba(X_test)
```

---

## Common Pitfalls

### 1. **Using Multinomial NB with Negative Values**

```python
# WRONG: Multinomial NB requires non-negative features
from sklearn.preprocessing import StandardScaler
X_scaled = StandardScaler().fit_transform(X)  # Can be negative!
mnb = MultinomialNB()
mnb.fit(X_scaled, y)  # ERROR!

# CORRECT: Use Gaussian NB for scaled data
gnb = GaussianNB()
gnb.fit(X_scaled, y)  # OK
```

### 2. **Ignoring Zero Probabilities**

```python
# Always use smoothing for text data
# WRONG
mnb = MultinomialNB(alpha=0)  # Risk of zero probabilities

# CORRECT
mnb = MultinomialNB(alpha=1.0)  # Laplace smoothing
```

### 3. **Using Gaussian NB on Non-Normal Data**

```python
# Check distribution before using Gaussian NB
import matplotlib.pyplot as plt

for i in range(X.shape[1]):
    plt.hist(X[:, i], bins=30)
    plt.title(f'Feature {i}')
    plt.show()

# If not normal:
# - Transform data (log, sqrt, Box-Cox)
# - Use Multinomial/Bernoulli NB
# - Try other classifiers
```

### 4. **Forgetting to Transform Test Data**

```python
# WRONG
vectorizer = CountVectorizer()
X_train = vectorizer.fit_transform(train_docs)
X_test = vectorizer.fit_transform(test_docs)  # BUG!

# CORRECT
X_train = vectorizer.fit_transform(train_docs)
X_test = vectorizer.transform(test_docs)  # Use training vocabulary
```

### 5. **Trusting Raw Probabilities**

```python
# Naive Bayes probabilities can be extreme (0.99 or 0.01)
# They're not well-calibrated

# For better probabilities, use calibration
from sklearn.calibration import CalibratedClassifierCV
calibrated_nb = CalibratedClassifierCV(nb, cv=5)

# Or just use predictions (not probabilities)
y_pred = nb.predict(X_test)  # Usually reliable
```

### 6. **Not Handling Missing Values**

```python
# Naive Bayes can't handle NaN
# WRONG
nb.fit(X_with_nan, y)  # ERROR!

# CORRECT
from sklearn.impute import SimpleImputer
imputer = SimpleImputer(strategy='mean')
X_imputed = imputer.fit_transform(X_with_nan)
nb.fit(X_imputed, y)
```

### 7. **Using Wrong Variant**

```python
# Choose based on data type:

# Continuous features → Gaussian
gnb = GaussianNB()

# Count data (text, images) → Multinomial
mnb = MultinomialNB()

# Binary features → Bernoulli
bnb = BernoulliNB()

# Mixed types → Preprocess or use different algorithm
```

---

## Comparison with Other Algorithms

| Aspect | Naive Bayes | Logistic Regression | SVM | Decision Trees |
|--------|-------------|---------------------|-----|----------------|
| **Speed** | Very Fast | Fast | Medium | Fast |
| **Accuracy** | Good | Very Good | Very Good | Good |
| **Overfitting** | Resistant | Medium | Medium | Prone |
| **Small Data** | Excellent | Good | Poor | Medium |
| **High Dimensions** | Excellent | Good | Poor | Medium |
| **Interpretability** | Medium | High | Low | High |
| **Probabilities** | Yes (uncalibrated) | Yes (calibrated) | Yes (via Platt) | Yes |
| **Multi-class** | Native | One-vs-Rest | One-vs-Rest | Native |

---

## Interview Questions

### Q1: Why is it called "naive"?
**A:** It assumes features are conditionally independent given the class, which is rarely true in practice. Despite this strong (naive) assumption, it often works well because we only need the correct ranking of class probabilities, not exact values.

### Q2: When would Naive Bayes fail completely?
**A:**
1. **Highly correlated features**: E.g., using both "height in cm" and "height in inches"
2. **Zero probability problem**: Without smoothing, a single unseen feature makes P=0
3. **Features with complex dependencies**: E.g., XOR relationships

### Q3: Why is Naive Bayes good for text classification?
**A:**
1. High-dimensional (thousands of words), where independence assumption is less harmful
2. Fast training and prediction
3. Works well with small training data
4. Naturally handles sparse features
5. Smoothing handles unseen words

### Q4: What's the difference between Multinomial and Bernoulli NB?
**A:**
- **Multinomial**: Uses word counts (TF), models how many times words appear
- **Bernoulli**: Uses binary (present/absent), also models words NOT in document
- Bernoulli often better for short documents where word presence matters more than frequency

### Q5: How does smoothing work?
**A:** Laplace smoothing (α=1) adds 1 to all counts, preventing zero probabilities:
```
P(word|class) = (count + 1) / (total + vocabulary_size)
```
This gives small probability to unseen words instead of zero.

### Q6: Can Naive Bayes do regression?
**A:** Technically yes, but it's designed for classification. For regression, use linear regression, decision trees, or neural networks instead.

---

## Summary Cheatsheet

```
Naive Bayes Quick Reference
═══════════════════════════════════════════════

Algorithm Type: Probabilistic, Generative

Variants:
├─ Gaussian: Continuous features (normal distribution)
├─ Multinomial: Count data (text, images)
└─ Bernoulli: Binary features (presence/absence)

Key Hyperparameters:
├─ alpha: Smoothing parameter (default=1.0)
├─ priors: Class probabilities (default=from data)
└─ var_smoothing: For numerical stability (Gaussian only)

Must Do:
✓ Choose correct variant for data type
✓ Use smoothing (alpha > 0) for text
✓ Handle missing values
✓ Transform test data with training vocabulary

Strengths:
+ Extremely fast training and prediction
+ Works well with small training data
+ Handles high-dimensional data
+ Naturally multi-class
+ Simple and interpretable
+ Good baseline model

Weaknesses:
- Assumes feature independence (naive!)
- Poor probability calibration
- Can't learn feature interactions
- Sensitive to irrelevant features
- Assumes specific distributions

Best For:
• Text classification (spam, sentiment)
• Document categorization
• Real-time prediction
• High-dimensional data
• Small training datasets
• Quick baseline

Choose Variant:
• Continuous features → Gaussian
• Word/term counts → Multinomial
• Binary features → Bernoulli

Time Complexity:
• Training: O(nd) where n=samples, d=features
• Prediction: O(cd) where c=classes
• Memory: O(cd)
```

---

## Practical Workflow

```python
# Complete Naive Bayes Workflow for Text Classification

from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.pipeline import Pipeline
import numpy as np

# 1. Load data
documents = [...]  # List of text documents
labels = [...]     # Corresponding labels

# 2. Split data
X_train, X_test, y_train, y_test = train_test_split(
    documents, labels, test_size=0.2, stratify=labels, random_state=42
)

# 3. Create pipeline
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        stop_words='english',
        min_df=2,
        max_df=0.95
    )),
    ('nb', MultinomialNB(alpha=1.0))
])

# 4. Cross-validation
cv_scores = cross_val_score(
    pipeline, X_train, y_train, cv=5, scoring='f1_weighted'
)
print(f"CV F1 Score: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

# 5. Train final model
pipeline.fit(X_train, y_train)

# 6. Evaluate
y_pred = pipeline.predict(X_test)
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# 7. Analyze important features
vectorizer = pipeline.named_steps['tfidf']
nb = pipeline.named_steps['nb']
feature_names = vectorizer.get_feature_names_out()

for i, class_label in enumerate(nb.classes_):
    top_indices = np.argsort(nb.feature_log_prob_[i])[-20:]
    top_features = [feature_names[j] for j in top_indices]
    print(f"\nTop features for class '{class_label}':")
    print(top_features)

# 8. Make predictions
new_docs = ["This is a new document", "Another test document"]
predictions = pipeline.predict(new_docs)
probabilities = pipeline.predict_proba(new_docs)

print(f"\nPredictions: {predictions}")
print(f"Probabilities:\n{probabilities}")
```

This completes the comprehensive Naive Bayes revision notes!
