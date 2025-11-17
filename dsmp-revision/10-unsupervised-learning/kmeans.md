# K-Means Clustering

## Overview
K-Means is a **partitioning-based clustering algorithm** that divides data into K distinct, non-overlapping clusters. Each data point belongs to the cluster with the nearest centroid.

## Algorithm

### How K-Means Works
```
1. Initialize: Randomly select K points as initial centroids
2. Assignment Step: Assign each point to nearest centroid (minimize distance)
3. Update Step: Recalculate centroids as mean of assigned points
4. Repeat steps 2-3 until convergence (centroids don't change)
```

### ASCII Visualization
```
Initial Random Centroids:
    *1        *2        *3

Iteration 1 - Assignment:
    C1  C1    C2  C2    C3  C3
    •   •     •   •     •   •
    •   •     •   •     •   •
       *1        *2        *3

Iteration 2 - Update Centroids:
      C1        C2        C3
    •   •     •   •     •   •
    •   •     •   •     •   •
      *1'       *2'       *3'

Convergence - Final Clusters:
    Cluster 1   Cluster 2   Cluster 3
    ┌─────┐    ┌─────┐    ┌─────┐
    │ • • │    │ • • │    │ • • │
    │ • • │    │ • • │    │ • • │
    │  *  │    │  *  │    │  *  │
    └─────┘    └─────┘    └─────┘
```

## Mathematical Formulation

### Objective Function
Minimize within-cluster sum of squares (WCSS):

```
J = Σ(k=1 to K) Σ(x∈Ck) ||x - μk||²

Where:
- K = number of clusters
- Ck = set of points in cluster k
- μk = centroid of cluster k
- ||x - μk||² = squared Euclidean distance
```

### Distance Metrics
```python
# Euclidean Distance (default)
d(x, y) = √(Σ(xi - yi)²)

# Manhattan Distance
d(x, y) = Σ|xi - yi|

# Cosine Distance
d(x, y) = 1 - (x·y)/(||x|| ||y||)
```

## K-Means++ Initialization

### Problem with Random Initialization
- Standard K-Means can get stuck in local minima
- Results depend heavily on initial centroid positions
- May require multiple runs

### K-Means++ Solution
```
1. Choose first centroid randomly from data points
2. For each remaining centroid:
   - Calculate distance D(x) from each point to nearest chosen centroid
   - Choose next centroid with probability ∝ D(x)²
3. Proceed with standard K-Means
```

### Benefits
- Better initial centroids (spread out)
- Faster convergence
- More consistent results
- O(log K) competitive with optimal clustering

## Determining Optimal K

### 1. Elbow Method

```
WCSS vs K Plot:

WCSS│
  ^ │
  | │ *
  | │   *
  | │     *
  | │       *___
  | │           *___*___*___
  | │
  | └────────────────────────> K
      1  2  3  4  5  6  7  8
            ↑
         Elbow Point (optimal K)

Logic: Choose K where adding more clusters
       doesn't significantly reduce WCSS
```

**Implementation:**
```python
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

wcss = []
K_range = range(1, 11)

for k in K_range:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    kmeans.fit(X)
    wcss.append(kmeans.inertia_)  # WCSS

plt.plot(K_range, wcss, 'bx-')
plt.xlabel('Number of Clusters (K)')
plt.ylabel('WCSS')
plt.title('Elbow Method')
plt.show()
```

### 2. Silhouette Score

**Concept:** Measures how similar a point is to its own cluster compared to other clusters.

```
Silhouette Score for point i:

s(i) = (b(i) - a(i)) / max(a(i), b(i))

Where:
- a(i) = avg distance to points in same cluster (cohesion)
- b(i) = avg distance to points in nearest cluster (separation)

Range: [-1, 1]
- +1: Perfect clustering (far from other clusters)
-  0: Point is on cluster boundary
- -1: Point assigned to wrong cluster
```

**Interpretation:**
```
Silhouette Score   Quality
─────────────────────────────
0.71 - 1.00       Strong structure
0.51 - 0.70       Reasonable structure
0.26 - 0.50       Weak structure
< 0.25            No substantial structure
```

**Implementation:**
```python
from sklearn.metrics import silhouette_score, silhouette_samples
import numpy as np

# Overall silhouette score
silhouette_avg = silhouette_score(X, cluster_labels)
print(f"Average Silhouette Score: {silhouette_avg:.3f}")

# Per-sample silhouette scores
sample_silhouette_values = silhouette_samples(X, cluster_labels)

# Find optimal K
silhouette_scores = []
K_range = range(2, 11)

for k in K_range:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X)
    score = silhouette_score(X, labels)
    silhouette_scores.append(score)

optimal_k = K_range[np.argmax(silhouette_scores)]
print(f"Optimal K: {optimal_k}")
```

### 3. Other Methods

**Gap Statistic:**
```python
# Compares WCSS to expected WCSS under null reference distribution
# Choose K where gap is largest

def gap_statistic(X, K_range, n_refs=10):
    gaps = []
    for k in K_range:
        # Cluster original data
        kmeans = KMeans(n_clusters=k, random_state=42)
        kmeans.fit(X)
        wcss_actual = kmeans.inertia_

        # Generate reference datasets and cluster
        wcss_refs = []
        for _ in range(n_refs):
            X_ref = np.random.uniform(X.min(), X.max(), size=X.shape)
            kmeans_ref = KMeans(n_clusters=k, random_state=42)
            kmeans_ref.fit(X_ref)
            wcss_refs.append(kmeans_ref.inertia_)

        gap = np.log(np.mean(wcss_refs)) - np.log(wcss_actual)
        gaps.append(gap)

    return gaps
```

**Davies-Bouldin Index:**
```python
from sklearn.metrics import davies_bouldin_score

# Lower is better (measures cluster separation)
db_score = davies_bouldin_score(X, labels)
```

**Calinski-Harabasz Index (Variance Ratio Criterion):**
```python
from sklearn.metrics import calinski_harabasz_score

# Higher is better (ratio of between-cluster to within-cluster dispersion)
ch_score = calinski_harabasz_score(X, labels)
```

## Implementation

### Basic K-Means
```python
from sklearn.cluster import KMeans
import numpy as np

# Sample data
X = np.array([[1, 2], [1.5, 1.8], [5, 8], [8, 8], [1, 0.6], [9, 11]])

# Fit K-Means
kmeans = KMeans(
    n_clusters=3,           # Number of clusters
    init='k-means++',       # Initialization method
    n_init=10,              # Number of times to run with different seeds
    max_iter=300,           # Max iterations per run
    random_state=42,        # Reproducibility
    algorithm='lloyd'       # 'lloyd' or 'elkan'
)

# Fit and predict
labels = kmeans.fit_predict(X)

# Results
print("Cluster Centers:\n", kmeans.cluster_centers_)
print("Labels:", labels)
print("Inertia (WCSS):", kmeans.inertia_)
print("Iterations:", kmeans.n_iter_)
```

### Complete Pipeline with Evaluation
```python
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score, davies_bouldin_score
import numpy as np
import matplotlib.pyplot as plt

# 1. Prepare data
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 2. Find optimal K
def evaluate_clustering(X, K_range):
    metrics = {
        'wcss': [],
        'silhouette': [],
        'davies_bouldin': [],
        'calinski': []
    }

    for k in K_range:
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X)

        metrics['wcss'].append(kmeans.inertia_)

        if k > 1:
            metrics['silhouette'].append(silhouette_score(X, labels))
            metrics['davies_bouldin'].append(davies_bouldin_score(X, labels))
            from sklearn.metrics import calinski_harabasz_score
            metrics['calinski'].append(calinski_harabasz_score(X, labels))

    return metrics

K_range = range(2, 11)
metrics = evaluate_clustering(X_scaled, K_range)

# 3. Visualize metrics
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# WCSS
axes[0, 0].plot(K_range, metrics['wcss'], 'bx-')
axes[0, 0].set_xlabel('K')
axes[0, 0].set_ylabel('WCSS')
axes[0, 0].set_title('Elbow Method')

# Silhouette
axes[0, 1].plot(K_range, metrics['silhouette'], 'rx-')
axes[0, 1].set_xlabel('K')
axes[0, 1].set_ylabel('Silhouette Score')
axes[0, 1].set_title('Silhouette Analysis')

# Davies-Bouldin
axes[1, 0].plot(K_range, metrics['davies_bouldin'], 'gx-')
axes[1, 0].set_xlabel('K')
axes[1, 0].set_ylabel('Davies-Bouldin Index')
axes[1, 0].set_title('Davies-Bouldin (Lower is Better)')

# Calinski-Harabasz
axes[1, 1].plot(K_range, metrics['calinski'], 'mx-')
axes[1, 1].set_xlabel('K')
axes[1, 1].set_ylabel('Calinski-Harabasz Score')
axes[1, 1].set_title('Calinski-Harabasz (Higher is Better)')

plt.tight_layout()
plt.show()

# 4. Final model with optimal K
optimal_k = 3  # Based on metrics
final_model = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
final_labels = final_model.fit_predict(X_scaled)

# 5. Analyze results
for i in range(optimal_k):
    cluster_points = X[final_labels == i]
    print(f"\nCluster {i}:")
    print(f"  Size: {len(cluster_points)}")
    print(f"  Center: {final_model.cluster_centers_[i]}")
    print(f"  Avg Silhouette: {np.mean(silhouette_samples(X_scaled, final_labels)[final_labels == i]):.3f}")
```

### Mini-Batch K-Means (for Large Datasets)
```python
from sklearn.cluster import MiniBatchKMeans

# Much faster for large datasets
mbk = MiniBatchKMeans(
    n_clusters=3,
    batch_size=100,        # Size of mini-batches
    max_iter=300,
    random_state=42
)

labels = mbk.fit_predict(X)

# Trade-off: Speed vs. Quality
# - 3-10x faster than regular K-Means
# - Slightly lower quality clustering
```

## Advantages & Limitations

### Advantages
```
✓ Simple and intuitive
✓ Fast and scalable: O(n·K·I·d) where I = iterations, d = dimensions
✓ Works well with spherical clusters
✓ Easy to implement and interpret
✓ Guaranteed convergence (to local minimum)
✓ Performs well on large datasets
```

### Limitations
```
✗ Must specify K in advance
✗ Sensitive to initial centroid placement
✗ Assumes spherical clusters of similar size
✗ Sensitive to outliers
✗ Only finds linear cluster boundaries
✗ Struggles with non-convex shapes
✗ Requires feature scaling
```

### When Clusters are Non-Spherical
```
Good for K-Means:          Bad for K-Means:

  ○  ○  ○                    ○ ○ ○ ○
 ○  *  ○                    ○       ○
  ○  ○  ○                    ○     ○
                             ○ ○ ○
  △  △  △                   (ring shape)
 △  *  △
  △  △  △                      ◇
                              ◇ ◇
  □  □  □                    ◇   ◇
 □  *  □                      ◇ ◇
  □  □  □                       ◇
                          (crescent shape)
(spherical)
```

## When to Use K-Means

### Use K-Means When:
- You know (or can estimate) the number of clusters
- Clusters are roughly spherical and similar in size
- You have numerical features
- Speed and scalability are important
- Data has relatively few outliers
- Features are on similar scales (or you can standardize)

### Don't Use K-Means When:
- Clusters have complex, non-convex shapes
- Clusters have very different sizes or densities
- You have many outliers
- You don't know K and data doesn't suggest clear K
- You need hierarchical relationships between clusters

## Real-World Applications

### 1. Customer Segmentation
```python
"""
Segment customers based on purchasing behavior
"""
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import pandas as pd

# Customer features
features = ['total_spend', 'visit_frequency', 'avg_basket_size',
            'days_since_last_purchase', 'discount_usage']

# Load data
df = pd.read_csv('customers.csv')
X = df[features]

# Standardize
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Cluster
kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
df['segment'] = kmeans.fit_predict(X_scaled)

# Analyze segments
segment_profile = df.groupby('segment')[features].mean()
print(segment_profile)

# Segment interpretation
segments = {
    0: "High Value - Frequent Shoppers",
    1: "Occasional Shoppers",
    2: "Bargain Hunters",
    3: "At-Risk Customers"
}
```

### 2. Image Compression
```python
"""
Reduce colors in image using K-Means
"""
from sklearn.cluster import MiniBatchKMeans
import numpy as np
from PIL import Image

# Load image
img = Image.open('photo.jpg')
img_array = np.array(img)
h, w, d = img_array.shape

# Reshape to (pixels, RGB)
pixels = img_array.reshape(h * w, d)

# Cluster colors
n_colors = 16
kmeans = MiniBatchKMeans(n_clusters=n_colors, random_state=42)
labels = kmeans.fit_predict(pixels)

# Replace pixels with cluster centers
compressed_pixels = kmeans.cluster_centers_[labels]
compressed_img = compressed_pixels.reshape(h, w, d).astype(np.uint8)

# Save
Image.fromarray(compressed_img).save('compressed.jpg')

print(f"Original colors: {len(np.unique(pixels, axis=0))}")
print(f"Compressed to: {n_colors} colors")
print(f"Compression ratio: {len(np.unique(pixels, axis=0)) / n_colors:.1f}x")
```

### 3. Document Clustering
```python
"""
Group similar documents together
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans

documents = [
    "Machine learning is a subset of AI",
    "Deep learning uses neural networks",
    "Python is great for data science",
    # ... more documents
]

# Vectorize
vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
X = vectorizer.fit_transform(documents)

# Cluster
kmeans = KMeans(n_clusters=5, random_state=42)
labels = kmeans.fit_predict(X)

# Top terms per cluster
order_centroids = kmeans.cluster_centers_.argsort()[:, ::-1]
terms = vectorizer.get_feature_names_out()

for i in range(5):
    print(f"\nCluster {i} top terms:")
    print([terms[ind] for ind in order_centroids[i, :10]])
```

### 4. Anomaly Detection
```python
"""
Identify outliers based on distance from cluster centers
"""
from sklearn.cluster import KMeans
import numpy as np

# Cluster data
kmeans = KMeans(n_clusters=3, random_state=42)
labels = kmeans.fit_predict(X)

# Calculate distance to cluster center
distances = kmeans.transform(X)
min_distances = distances.min(axis=1)

# Flag anomalies (far from any cluster)
threshold = np.percentile(min_distances, 95)
anomalies = min_distances > threshold

print(f"Anomalies detected: {anomalies.sum()}")
print(f"Anomaly indices: {np.where(anomalies)[0]}")
```

### 5. Feature Engineering
```python
"""
Use cluster membership as a feature
"""
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
import numpy as np

# Original features
X_train, X_test, y_train, y_test = train_test_split(X, y)

# Add cluster features
kmeans = KMeans(n_clusters=10, random_state=42)
train_clusters = kmeans.fit_predict(X_train)
test_clusters = kmeans.predict(X_test)

# Add cluster ID as feature
X_train_enhanced = np.column_stack([X_train, train_clusters])
X_test_enhanced = np.column_stack([X_test, test_clusters])

# Or add distance to each cluster center
train_distances = kmeans.transform(X_train)
test_distances = kmeans.transform(X_test)

X_train_enhanced = np.column_stack([X_train, train_distances])
X_test_enhanced = np.column_stack([X_test, test_distances])

# Train classifier
clf = RandomForestClassifier()
clf.fit(X_train_enhanced, y_train)
```

## Comparison with Other Algorithms

| Aspect | K-Means | Hierarchical | DBSCAN | GMM |
|--------|---------|-------------|---------|-----|
| **Cluster Shape** | Spherical | Any | Arbitrary | Elliptical |
| **Needs K?** | Yes | No (cut dendrogram) | No | Yes |
| **Outlier Handling** | Poor | Poor | Good | Moderate |
| **Scalability** | Excellent | Poor (O(n²)) | Good | Moderate |
| **Deterministic** | No | Yes | Yes | No |
| **Soft Clustering** | No | No | No | Yes |
| **Speed** | Fast | Slow | Fast | Moderate |
| **Best For** | Simple, large data | Hierarchical structure | Arbitrary shapes, noise | Probabilistic, overlapping |

## Tips & Best Practices

### Data Preprocessing
```python
# 1. Always scale features
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 2. Remove or handle outliers
from scipy import stats
z_scores = np.abs(stats.zscore(X))
X_clean = X[(z_scores < 3).all(axis=1)]

# 3. Handle categorical variables
from sklearn.preprocessing import LabelEncoder
# One-hot encode or use Gower distance for mixed data
```

### Initialization Strategies
```python
# 1. Always use k-means++
kmeans = KMeans(init='k-means++')  # Default in sklearn

# 2. Or use custom centroids if domain knowledge available
initial_centers = np.array([[1, 1], [5, 5], [10, 10]])
kmeans = KMeans(n_clusters=3, init=initial_centers, n_init=1)

# 3. Run multiple times and keep best
kmeans = KMeans(n_clusters=3, n_init=10)  # Runs 10 times
```

### Convergence & Performance
```python
# Set appropriate max_iter
kmeans = KMeans(max_iter=300, tol=1e-4)

# For large datasets, use MiniBatchKMeans
from sklearn.cluster import MiniBatchKMeans
mbk = MiniBatchKMeans(n_clusters=5, batch_size=1000)

# For very large datasets, consider approximate methods
# - Sampling
# - Online/incremental learning
```

## Common Pitfalls

1. **Not scaling features**: Features on different scales will dominate distance calculations
2. **Wrong K**: Too few clusters → oversimplification; Too many → overfitting
3. **Bad initialization**: Multiple runs or k-means++ helps
4. **Non-spherical clusters**: Consider DBSCAN or GMM instead
5. **Outliers**: They can pull centroids; consider preprocessing or robust algorithms
6. **Assuming equal cluster sizes**: K-Means biased toward equal-sized clusters

## Quick Reference

```python
# Standard workflow
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

# 1. Scale
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 2. Find optimal K
for k in range(2, 11):
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)
    print(f"K={k}, Silhouette={silhouette_score(X_scaled, labels):.3f}")

# 3. Fit final model
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
labels = kmeans.fit_predict(X_scaled)

# 4. Get results
centers = kmeans.cluster_centers_
inertia = kmeans.inertia_

# 5. Predict new points
new_labels = kmeans.predict(X_new_scaled)
```
