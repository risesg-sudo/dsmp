# K-Nearest Neighbors (KNN)

## Overview
KNN is a **non-parametric, instance-based, lazy learning** algorithm used for both classification and regression tasks. It makes predictions based on the k closest training examples in the feature space.

---

## Mathematical Formulation

### Distance Metrics

1. **Euclidean Distance** (Most Common)
   ```
   d(x, y) = √(Σ(xi - yi)²)
   ```

2. **Manhattan Distance**
   ```
   d(x, y) = Σ|xi - yi|
   ```

3. **Minkowski Distance** (Generalization)
   ```
   d(x, y) = (Σ|xi - yi|^p)^(1/p)
   ```
   - p=1: Manhattan
   - p=2: Euclidean
   - p=∞: Chebyshev

4. **Cosine Similarity** (for text/sparse data)
   ```
   similarity = (x·y) / (||x|| ||y||)
   ```

### Classification
- **Majority Voting**: Predict the most common class among k neighbors
- **Weighted Voting**: Closer neighbors have more influence
  ```
  weight = 1 / distance²
  ```

### Regression
- **Mean**: Average of k nearest neighbors' values
- **Weighted Mean**: Distance-weighted average
  ```
  prediction = Σ(wi × yi) / Σwi
  where wi = 1/di²
  ```

---

## Algorithm Workflow

```
1. Load training data
2. Choose k (number of neighbors)
3. For each test point:
   a. Calculate distance to all training points
   b. Sort distances and select k nearest neighbors
   c. Classification: Majority vote
      Regression: Average of k neighbors
   d. Return prediction
```

---

## Decision Boundary Visualization

### Binary Classification (k=3)

```
        Class A (●)    Class B (○)

    ●     ●     ○     ○
      ●       ○     ○
    ●   ●   ○   ○     ○
      ●       ○     ○
    ●     ●     ○     ○

    ═══════════════════════
         Decision
         Boundary
         (Irregular)

Test Point (X):
- Count neighbors: 2A, 1B
- Prediction: Class A
```

### Effect of k Value

```
k=1 (Overfitting)          k=5 (Balanced)           k=15 (Underfitting)
─────────────────          ───────────────          ────────────────────
●|○|●                      ●●|○○                    ●●●|○○○
●|○○                       ●●|○○○                   ●●●|○○○
●●|○                       ●●●|○○                   ●●●●|○○○

Jagged boundary           Smooth boundary          Too smooth
High variance             Good balance             High bias
```

---

## Intuition

**The Restaurant Analogy:**
- Want to know if a restaurant is good?
- Ask k nearest people (neighbors) about their experience
- More recommendations = more confidence
- Closer people's opinions matter more (weighted KNN)

**Key Insights:**
1. **No training phase**: Just stores data
2. **Decision boundary**: Non-linear, flexible
3. **Local decisions**: Uses nearby points only
4. **Computationally expensive**: At prediction time

---

## When to Use KNN

### ✅ Good For:
- **Small to medium datasets** (< 100K samples)
- **Low dimensional data** (< 20 features)
- **Non-linear decision boundaries**
- **Multi-class classification**
- **Anomaly detection** (outliers have distant neighbors)
- **Recommendation systems** (finding similar items)

### ❌ Avoid When:
- **Large datasets** (slow predictions)
- **High-dimensional data** (curse of dimensionality)
- **Imbalanced datasets** (majority class dominates)
- **Need interpretability** (black box)
- **Features have different scales** (must normalize)

---

## Curse of Dimensionality

### Problem
As dimensions increase, distances become meaningless:

```
Dimensions: 1D → 2D → 3D → 10D → 100D
            │    │    │    │      │
Distance    │    │    │    │      │
Variation   ████ ███  ██   █      ▌
            High ──────────→ Low
```

**Why?**
- In high dimensions, all points are approximately equidistant
- Volume of hypersphere becomes negligible
- Most data lies on the edges, not center

### Mathematical Insight
```
For d dimensions:
Volume ratio = (r/R)^d

Example (d=100, r=0.99R):
Ratio = 0.99^100 ≈ 0.000027
→ 99.997% of volume is in outer shell!
```

### Solutions:
1. **Dimensionality reduction** (PCA, t-SNE)
2. **Feature selection** (remove irrelevant features)
3. **Use distance metrics robust to high dimensions**
4. **Try other algorithms** (tree-based methods)

---

## Hyperparameter Tuning

### 1. Number of Neighbors (k)

| k Value | Effect | When to Use |
|---------|--------|-------------|
| k=1 | High variance, overfitting | Never in production |
| k=3-5 | Good starting point | Small datasets |
| k=√n | Rule of thumb | General use |
| k=odd | Avoids ties | Binary classification |
| k=large | High bias, underfitting | Noisy data |

**Finding Optimal k:**
```python
# Grid search with cross-validation
k_range = range(1, 31, 2)  # Odd numbers
k_scores = []

for k in k_range:
    knn = KNeighborsClassifier(n_neighbors=k)
    scores = cross_val_score(knn, X_train, y_train, cv=5)
    k_scores.append(scores.mean())

optimal_k = k_range[np.argmax(k_scores)]
```

### 2. Distance Metric

| Metric | Use Case | Sensitive to Scale |
|--------|----------|-------------------|
| Euclidean | Continuous features | Yes |
| Manhattan | Continuous, robust to outliers | Yes |
| Minkowski | Flexible, tune p | Yes |
| Hamming | Categorical features | No |
| Cosine | Text, sparse data, angles matter | No |

### 3. Weighting Scheme

| Weight | Formula | Effect |
|--------|---------|--------|
| Uniform | All equal | Simple, faster |
| Distance | 1/distance | Closer neighbors more important |
| Custom | User-defined | Domain-specific |

### 4. Algorithm Choice

| Algorithm | When to Use | Time Complexity |
|-----------|-------------|-----------------|
| Brute Force | Small datasets | O(nd) per query |
| KD Tree | d < 20, not sparse | O(log n) average |
| Ball Tree | d < 20-50 | O(log n) average |
| Approximation | Very large n | O(1) with trade-off |

---

## Preprocessing Requirements

### 1. Feature Scaling (CRITICAL!)

```python
# KNN is VERY sensitive to feature scales
from sklearn.preprocessing import StandardScaler

# Bad: Age [20-80], Income [20K-200K] → Income dominates!
# Good: Both scaled to [0, 1] or mean=0, std=1

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
```

### 2. Handling Missing Values

```python
from sklearn.impute import SimpleImputer

# KNN can't handle NaN
imputer = SimpleImputer(strategy='mean')  # or 'median', 'most_frequent'
X_imputed = imputer.fit_transform(X)
```

### 3. Encoding Categorical Variables

```python
# Option 1: One-hot encoding
from sklearn.preprocessing import OneHotEncoder

# Option 2: Use Hamming distance for categorical features
```

---

## Real-World Applications

### 1. **Recommendation Systems**
- Netflix: "Users who liked this also liked..."
- Amazon: Product recommendations
- Spotify: Similar songs/playlists

### 2. **Medical Diagnosis**
- Classify patients based on symptoms
- Similar patient case retrieval
- Drug discovery (molecular similarity)

### 3. **Image Recognition**
- Handwritten digit recognition (MNIST)
- Face recognition (find similar faces)
- Image classification

### 4. **Credit Scoring**
- Classify loan applicants
- Fraud detection

### 5. **Text Classification**
- Document categorization
- Sentiment analysis
- Spam detection

---

## sklearn Implementation

### Classification Example

```python
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

# 1. Load and prepare data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 2. Scale features (CRITICAL!)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 3. Train model
knn = KNeighborsClassifier(
    n_neighbors=5,           # Number of neighbors
    weights='distance',      # Weight by distance
    metric='euclidean',      # Distance metric
    algorithm='auto',        # Auto-select best algorithm
    n_jobs=-1               # Use all CPU cores
)

knn.fit(X_train_scaled, y_train)

# 4. Predict
y_pred = knn.predict(X_test_scaled)
y_pred_proba = knn.predict_proba(X_test_scaled)  # Probability scores

# 5. Evaluate
print(classification_report(y_test, y_pred))
print(confusion_matrix(y_test, y_pred))

# 6. Get neighbors for a point
distances, indices = knn.kneighbors(X_test_scaled[:1], n_neighbors=5)
print(f"Nearest neighbors: {indices}")
print(f"Distances: {distances}")
```

### Regression Example

```python
from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_squared_error, r2_score

# Train model
knn_reg = KNeighborsRegressor(
    n_neighbors=10,
    weights='distance',
    metric='euclidean'
)

knn_reg.fit(X_train_scaled, y_train)

# Predict
y_pred = knn_reg.predict(X_test_scaled)

# Evaluate
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"MSE: {mse:.4f}, R²: {r2:.4f}")
```

### Hyperparameter Tuning

```python
# Grid Search
param_grid = {
    'n_neighbors': [3, 5, 7, 9, 11, 15, 21],
    'weights': ['uniform', 'distance'],
    'metric': ['euclidean', 'manhattan', 'minkowski'],
    'p': [1, 2, 3]  # For minkowski
}

grid_search = GridSearchCV(
    KNeighborsClassifier(),
    param_grid,
    cv=5,
    scoring='accuracy',
    n_jobs=-1,
    verbose=1
)

grid_search.fit(X_train_scaled, y_train)

print(f"Best parameters: {grid_search.best_params_}")
print(f"Best score: {grid_search.best_score_:.4f}")

# Use best model
best_knn = grid_search.best_estimator_
```

### Custom Distance Metric

```python
from sklearn.metrics.pairwise import pairwise_distances

def custom_distance(x, y):
    """Example: Weighted Euclidean distance"""
    weights = np.array([2.0, 1.0, 0.5])  # Feature importance
    return np.sqrt(np.sum(weights * (x - y)**2))

# Use custom metric
knn = KNeighborsClassifier(
    n_neighbors=5,
    metric=custom_distance
)
```

### Efficient KNN for Large Datasets

```python
from sklearn.neighbors import NearestNeighbors

# Build index once
nn = NearestNeighbors(
    n_neighbors=10,
    algorithm='ball_tree',  # or 'kd_tree'
    leaf_size=30,
    n_jobs=-1
)
nn.fit(X_train_scaled)

# Fast queries
distances, indices = nn.kneighbors(X_test_scaled)

# Radius-based neighbors
distances, indices = nn.radius_neighbors(
    X_test_scaled,
    radius=0.5,
    return_distance=True
)
```

---

## Common Pitfalls

### 1. **Forgetting to Scale Features** ⚠️
```python
# WRONG: Features have different scales
knn.fit(X_train, y_train)  # Age: 20-80, Income: 20K-200K

# CORRECT: Scale first
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
knn.fit(X_train_scaled, y_train)
```

### 2. **Using KNN on High-Dimensional Data**
```python
# Problem: Curse of dimensionality
# Solution: Reduce dimensions first
from sklearn.decomposition import PCA

pca = PCA(n_components=20)
X_train_pca = pca.fit_transform(X_train_scaled)
knn.fit(X_train_pca, y_train)
```

### 3. **Even k for Binary Classification**
```python
# Can cause ties in binary classification
# Use odd k to avoid ties
knn = KNeighborsClassifier(n_neighbors=5)  # Good
knn = KNeighborsClassifier(n_neighbors=4)  # Risky
```

### 4. **Imbalanced Datasets**
```python
# Problem: Majority class dominates
# Solution 1: Use weighted KNN
knn = KNeighborsClassifier(weights='distance')

# Solution 2: Oversample minority class
from imblearn.over_sampling import SMOTE
smote = SMOTE()
X_resampled, y_resampled = smote.fit_resample(X_train, y_train)

# Solution 3: Use different k for each class
```

### 5. **Not Using the Right Algorithm**
```python
# For large datasets, choose appropriate algorithm
knn = KNeighborsClassifier(
    n_neighbors=5,
    algorithm='ball_tree',  # Better for d < 50
    leaf_size=30           # Tune for speed/memory trade-off
)
```

### 6. **Fitting Scaler on Test Data**
```python
# WRONG: Data leakage!
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.fit_transform(X_test)  # BUG!

# CORRECT
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)  # Use training stats
```

### 7. **Using KNN for Real-Time Predictions**
```python
# Problem: Slow at prediction time
# Solutions:
# 1. Use approximate nearest neighbors (Annoy, FAISS)
# 2. Pre-compute neighbors
# 3. Use a faster algorithm (tree-based)
```

### 8. **Not Handling Outliers**
```python
# Outliers can affect distance calculations
# Solution: Remove or use robust scaling
from sklearn.preprocessing import RobustScaler

robust_scaler = RobustScaler()
X_scaled = robust_scaler.fit_transform(X)
```

---

## Comparison with Other Algorithms

| Aspect | KNN | Decision Trees | SVM | Logistic Regression |
|--------|-----|----------------|-----|---------------------|
| Training Time | O(1) | O(n log n) | O(n²) to O(n³) | O(n) |
| Prediction Time | O(n) | O(log n) | O(n_sv) | O(1) |
| Memory | O(n) | O(nodes) | O(n_sv) | O(features) |
| Interpretability | Low | High | Medium | High |
| Non-linear | Yes | Yes | Yes (kernel) | No |
| Feature Scaling | Required | Not required | Required | Recommended |
| High Dimensions | Poor | Good | Good | Medium |

---

## Optimization Tips

### 1. **Reduce Dimensionality**
```python
# Before KNN, reduce dimensions
from sklearn.decomposition import PCA
pca = PCA(n_components=0.95)  # Keep 95% variance
X_reduced = pca.fit_transform(X)
```

### 2. **Use Approximate Nearest Neighbors**
```python
# For very large datasets
from annoy import AnnoyIndex

# Build index
ann = AnnoyIndex(n_features, 'euclidean')
for i, vec in enumerate(X_train):
    ann.add_item(i, vec)
ann.build(10)  # 10 trees

# Query
indices = ann.get_nns_by_vector(X_test[0], k=5)
```

### 3. **Feature Selection**
```python
# Keep only relevant features
from sklearn.feature_selection import SelectKBest, f_classif

selector = SelectKBest(f_classif, k=10)
X_selected = selector.fit_transform(X, y)
```

---

## Interview Questions

### Q1: Why is feature scaling crucial for KNN?
**A:** KNN uses distance metrics. Features with larger scales dominate the distance calculation. Example: Age (20-80) vs Income (20K-200K). Without scaling, Income differences will overshadow Age differences, making Age irrelevant.

### Q2: What is the curse of dimensionality?
**A:** As dimensions increase, data becomes sparse, distances become similar, and the nearest neighbor concept loses meaning. Volume concentrates in corners of high-dimensional space, making all points approximately equidistant.

### Q3: Why is KNN called a lazy learner?
**A:** KNN doesn't learn a model during training. It just memorizes the training data. All computation happens at prediction time when it searches for nearest neighbors.

### Q4: How do you choose k?
**A:** Use cross-validation to find optimal k. Start with k=√n as baseline. Use odd k for binary classification to avoid ties. Small k → overfitting, large k → underfitting.

### Q5: What's the time complexity of KNN?
**A:**
- Training: O(1) - just stores data
- Prediction: O(nd) where n=samples, d=dimensions
- With KD-tree: O(d log n) average case
- Space: O(nd)

---

## Summary Cheatsheet

```
KNN Quick Reference
═══════════════════════════════════════════════

Algorithm Type: Instance-based, Non-parametric

Key Hyperparameters:
├─ k: Number of neighbors (use CV to optimize)
├─ weights: 'uniform' or 'distance'
├─ metric: 'euclidean', 'manhattan', 'minkowski'
└─ algorithm: 'auto', 'ball_tree', 'kd_tree', 'brute'

Must Do:
✓ Scale features (StandardScaler or MinMaxScaler)
✓ Handle missing values
✓ Use odd k for binary classification
✓ Choose appropriate distance metric

Strengths:
+ Simple and intuitive
+ No assumptions about data
+ Handles multi-class naturally
+ Good for non-linear boundaries

Weaknesses:
- Slow predictions on large datasets
- Curse of dimensionality
- Memory intensive
- Sensitive to irrelevant features
- Requires feature scaling

Best For:
• Small to medium datasets
• Low dimensional problems (d < 20)
• Non-linear boundaries
• When you need simple baseline
