# Hierarchical Clustering & DBSCAN

## Part 1: Hierarchical Clustering

### Overview
Hierarchical clustering creates a tree-like structure (dendrogram) of clusters. Unlike K-Means, it doesn't require specifying K upfront and reveals hierarchical relationships in data.

### Types of Hierarchical Clustering

#### 1. Agglomerative (Bottom-Up) - Most Common
```
Start: Each point is its own cluster
Process: Merge closest clusters
End: Single cluster containing all points

Step-by-Step:
──────────────────────────────────────
Start:     •  •  •  •  •  •
           1  2  3  4  5  6

Step 1:    •──•  •  •  •──•
          (1,2) 3  4  (5,6)

Step 2:    •──•──•  •  •──•
          ((1,2),3) 4  (5,6)

Step 3:    •──•──•  •──•──•
          ((1,2),3) (4,(5,6))

Step 4:    •──•──•──•──•──•
          (((1,2),3),(4,(5,6)))
```

#### 2. Divisive (Top-Down) - Less Common
```
Start: All points in one cluster
Process: Split clusters recursively
End: Each point is its own cluster

(Conceptually opposite of agglomerative)
```

### Linkage Methods

Linkage determines how distance between clusters is calculated.

#### 1. Single Linkage (MIN)
```
Distance = Minimum distance between any two points

Cluster A     Cluster B
   •             •
  •  •         •  •
   •             •

d(A,B) = min distance between points
         ↓
    •─────────•  (shortest link)

Pros: Can find elongated clusters
Cons: Sensitive to noise (chaining effect)
```

#### 2. Complete Linkage (MAX)
```
Distance = Maximum distance between any two points

Cluster A     Cluster B
   •             •
  •  •         •  •
   •             •

d(A,B) = max distance between points
         ↓
  •─────────────────•  (longest link)

Pros: Compact, spherical clusters
Cons: Sensitive to outliers
```

#### 3. Average Linkage (UPGMA)
```
Distance = Average of all pairwise distances

Cluster A     Cluster B
   • •           • •

d(A,B) = avg(all distances between A and B)

Pros: Balanced, less sensitive to outliers
Cons: Can merge unequal-sized clusters
```

#### 4. Ward's Linkage (Minimum Variance)
```
Minimize within-cluster variance when merging

Merge clusters that minimize increase in total variance
Similar to K-Means objective

Pros: Tends to produce equal-sized clusters
      Works well in practice
Cons: Biased toward spherical clusters
```

### Linkage Method Comparison

| Linkage | Distance Metric | Cluster Shape | Outlier Sensitivity | Best Use |
|---------|----------------|---------------|---------------------|----------|
| **Single** | Minimum | Elongated, irregular | High (chaining) | Chain-like clusters |
| **Complete** | Maximum | Compact, spherical | High | Well-separated spherical |
| **Average** | Mean | Moderate | Medium | Balanced approach |
| **Ward** | Variance increase | Spherical, equal size | Low | General purpose |

### Dendrograms

A dendrogram is a tree diagram showing hierarchical relationships.

```
Dendrogram Example:

Height
  │
  │           ┌─────────┐
  │           │         │
  5  ─────────┤         │
  │           │    ┌────┤
  4  ─────────┤    │    │
  │         ┌─┤    │  ┌─┤
  3  ───────┤ │    │  │ │
  │       ┌─┤ │  ┌─┤  │ │
  2  ─────┤ │ │  │ │  │ │
  │     ┌─┤ │ │┌─┤ │┌─┤ │
  1  ───┤ │ │ ││ │ ││ │ │
  │     │ │ │ ││ │ ││ │ │
  0  ───┴─┴─┴─┴┴─┴─┴┴─┴─┴
       1 2 3 4 5 6 7 8 9

Interpretation:
- X-axis: Data points
- Y-axis: Distance/dissimilarity
- Height: Merge distance
- Cut line determines number of clusters
```

### Reading a Dendrogram

```
Cut at different heights → different K:

         ┌────────┐
    Cut₁ ┤        │    → K=2
         │   ┌────┤
    Cut₂ ┤   │    │    → K=3
         │ ┌─┤  ┌─┤
    Cut₃ ┤ │ │  │ │    → K=4
         │ │ │  │ │
         ┴─┴─┴──┴─┴
         1 2 3  4 5

Choose cut height based on:
- Large gap between merges
- Domain knowledge
- Silhouette score
- Desired granularity
```

### Implementation

#### Basic Agglomerative Clustering
```python
from sklearn.cluster import AgglomerativeClustering
import numpy as np

# Sample data
X = np.array([[1, 2], [1.5, 1.8], [5, 8], [8, 8], [1, 0.6], [9, 11]])

# Fit hierarchical clustering
hc = AgglomerativeClustering(
    n_clusters=3,           # Number of clusters
    linkage='ward',         # 'ward', 'complete', 'average', 'single'
    metric='euclidean'      # Distance metric
)

labels = hc.fit_predict(X)
print("Cluster labels:", labels)
```

#### Creating Dendrograms with SciPy
```python
from scipy.cluster.hierarchy import dendrogram, linkage
import matplotlib.pyplot as plt

# Compute linkage matrix
linkage_matrix = linkage(X, method='ward', metric='euclidean')

# Plot dendrogram
plt.figure(figsize=(10, 6))
dendrogram(
    linkage_matrix,
    labels=range(len(X)),
    orientation='top',
    distance_sort='descending',
    show_leaf_counts=True
)
plt.title('Hierarchical Clustering Dendrogram')
plt.xlabel('Sample Index')
plt.ylabel('Distance')
plt.show()

# linkage_matrix structure:
# [cluster1_id, cluster2_id, distance, num_points]
print("Linkage matrix:\n", linkage_matrix)
```

#### Finding Optimal Number of Clusters
```python
from scipy.cluster.hierarchy import fcluster
from sklearn.metrics import silhouette_score

# Try different numbers of clusters
max_k = 10
silhouette_scores = []

for k in range(2, max_k + 1):
    # Cut dendrogram to get k clusters
    clusters = fcluster(linkage_matrix, k, criterion='maxclust')

    # Calculate silhouette score
    score = silhouette_score(X, clusters)
    silhouette_scores.append(score)
    print(f"K={k}: Silhouette={score:.3f}")

# Optimal k
optimal_k = silhouette_scores.index(max(silhouette_scores)) + 2
print(f"\nOptimal K: {optimal_k}")
```

#### Complete Pipeline
```python
from sklearn.cluster import AgglomerativeClustering
from sklearn.preprocessing import StandardScaler
from scipy.cluster.hierarchy import dendrogram, linkage
from sklearn.metrics import silhouette_score, davies_bouldin_score
import matplotlib.pyplot as plt
import numpy as np

# 1. Prepare data
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 2. Compute linkage matrix
linkage_matrix = linkage(X_scaled, method='ward')

# 3. Plot dendrogram
plt.figure(figsize=(12, 6))
dendrogram(linkage_matrix, truncate_mode='lastp', p=30)
plt.title('Dendrogram (Ward Linkage)')
plt.xlabel('Cluster Size')
plt.ylabel('Distance')
plt.show()

# 4. Evaluate different K values
def evaluate_hc(X, linkage_matrix, k_range):
    scores = {'silhouette': [], 'davies_bouldin': []}

    for k in k_range:
        from scipy.cluster.hierarchy import fcluster
        labels = fcluster(linkage_matrix, k, criterion='maxclust')

        scores['silhouette'].append(silhouette_score(X, labels))
        scores['davies_bouldin'].append(davies_bouldin_score(X, labels))

    return scores

k_range = range(2, 11)
scores = evaluate_hc(X_scaled, linkage_matrix, k_range)

# Plot scores
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
ax1.plot(k_range, scores['silhouette'], 'bx-')
ax1.set_title('Silhouette Score')
ax2.plot(k_range, scores['davies_bouldin'], 'rx-')
ax2.set_title('Davies-Bouldin Index')
plt.show()

# 5. Final clustering
optimal_k = 3
hc = AgglomerativeClustering(n_clusters=optimal_k, linkage='ward')
final_labels = hc.fit_predict(X_scaled)
```

#### Distance Metrics
```python
# Different metrics for different linkages
metrics = {
    'euclidean': "√Σ(xi-yi)²",
    'manhattan': "Σ|xi-yi|",
    'cosine': "1 - (x·y)/(||x||||y||)",
    'correlation': "1 - Pearson correlation"
}

# Ward linkage requires euclidean
hc_ward = AgglomerativeClustering(n_clusters=3, linkage='ward')

# Other linkages support multiple metrics
hc_complete = AgglomerativeClustering(
    n_clusters=3,
    linkage='complete',
    metric='cosine'  # Can use non-euclidean
)
```

### Advantages & Limitations

#### Advantages
```
✓ No need to specify K upfront
✓ Dendrogram provides interpretable visualization
✓ Reveals hierarchical structure
✓ Deterministic (same input → same output)
✓ Works with any distance metric
✓ Can recover from suboptimal early merges (divisive)
```

#### Limitations
```
✗ Computationally expensive: O(n² log n) to O(n³)
✗ Not scalable to large datasets (> 10K points)
✗ Sensitive to noise and outliers
✗ Greedy (can't undo merges in agglomerative)
✗ Memory intensive (stores distance matrix)
✗ Difficult to handle missing values
```

---

## Part 2: DBSCAN (Density-Based Spatial Clustering)

### Overview
DBSCAN groups together points that are closely packed (high density) and marks points in low-density regions as outliers. It doesn't require specifying the number of clusters.

### Key Concepts

#### Core, Border, and Noise Points

```
Visual Representation:

    ┌─────eps radius──────┐
    │         •           │
    │     •   C   •       │    C = Core point (≥ minPts in radius)
    │         •           │    B = Border point (< minPts but reachable)
    │                     │    N = Noise/Outlier
    └─────────────────────┘

         • •
      •  • C •  •          Core point (≥ 4 neighbors)
         • •  B            Border point

    N                      Noise (isolated point)


Cluster Formation:
──────────────────────────────────────────
  • • •      • •          •     •
 • • C •    • C •        C •   • C
  • • •      • •          •     •
    ↓          ↓           ↓     ↓
  Cluster 1  Cluster 2   Noise Points

Definitions:
- Core Point: Has ≥ minPts within eps radius
- Border Point: Within eps of core point, but has < minPts
- Noise Point: Not core, not border (outlier)
```

#### Parameters

**1. eps (epsilon)** - Maximum distance between two points to be neighbors
```
Small eps:           Large eps:
  • • •               ○─────────○
  • • •    →         ○─────────○
  • • •              ○─────────○
  • • •              ○─────────○
Many small           Few large
clusters             clusters
```

**2. minPts** - Minimum points to form dense region (core point)
```
minPts = 3:         minPts = 5:
  • • •              • • •
  • C •    →         • • •    (not core)
  • • •              • • •

Lower minPts:       Higher minPts:
More cores,         Fewer cores,
fewer noise         more noise
```

### Algorithm

```
DBSCAN Algorithm:
─────────────────────────────────────────
1. For each unvisited point P:
   a. Mark P as visited
   b. Find all neighbors N within eps
   c. If |N| < minPts:
      - Mark P as noise (for now)
   d. Else (P is core point):
      - Create new cluster C
      - Add P to C
      - For each point P' in N:
        * If P' is unvisited:
          - Mark visited
          - Find neighbors N' of P'
          - If |N'| ≥ minPts:
            + Add N' to N (expand cluster)
        * If P' not in any cluster:
          - Add P' to C

2. Noise points near clusters become border points
3. Remaining noise points are outliers
```

### Visual Example

```
Step-by-Step Clustering:

Initial Points:
  1 2 3     7 8
  4 5 6     9 10
            11
    13 14   12

Step 1: Start with point 1
  [1]2 3     7 8      (1 has neighbors 2,4 → core)
   4 5 6     9 10
             11
     13 14   12

Step 2: Expand from 1
  [1 2]3     7 8      (2 has neighbors 1,3,5 → core)
   4 5 6     9 10
             11
     13 14   12

Step 3: Continue expanding
  [1 2 3]    7 8      (form Cluster 1)
  [4 5 6]    9 10
             11
     13 14   12

Step 4: Start new cluster
   1 2 3    [7 8]     (7 is core → Cluster 2)
   4 5 6    [9 10]
            [11]
     13 14   12

Final Result:
  Cluster 1  Cluster 2
  ┌─────┐    ┌─────┐
  │1 2 3│    │7 8  │
  │4 5 6│    │9 10 │
  └─────┘    │11   │
             └─────┘

   Noise: 12, 13, 14
```

### Implementation

#### Basic DBSCAN
```python
from sklearn.cluster import DBSCAN
import numpy as np

# Sample data
X = np.array([[1, 2], [2, 2], [2, 3], [8, 7], [8, 8], [25, 80]])

# Fit DBSCAN
dbscan = DBSCAN(
    eps=3,              # Maximum distance between neighbors
    min_samples=2,      # Minimum points to form core
    metric='euclidean', # Distance metric
    algorithm='auto'    # 'auto', 'ball_tree', 'kd_tree', 'brute'
)

labels = dbscan.fit_predict(X)

# Results
print("Cluster labels:", labels)  # -1 indicates noise
print("Core samples:", dbscan.core_sample_indices_)
print("Number of clusters:", len(set(labels)) - (1 if -1 in labels else 0))
print("Number of noise points:", list(labels).count(-1))

# Identify point types
n_samples = len(X)
core_samples_mask = np.zeros(n_samples, dtype=bool)
core_samples_mask[dbscan.core_sample_indices_] = True

for i in range(n_samples):
    if core_samples_mask[i]:
        print(f"Point {i}: Core point (cluster {labels[i]})")
    elif labels[i] != -1:
        print(f"Point {i}: Border point (cluster {labels[i]})")
    else:
        print(f"Point {i}: Noise point")
```

#### Finding Optimal Parameters

**1. K-Distance Plot for eps**
```python
from sklearn.neighbors import NearestNeighbors
import matplotlib.pyplot as plt
import numpy as np

# K-distance graph to find eps
k = 4  # minPts - 1
nbrs = NearestNeighbors(n_neighbors=k).fit(X)
distances, indices = nbrs.kneighbors(X)

# Sort distances
distances = np.sort(distances[:, k-1], axis=0)

# Plot
plt.figure(figsize=(10, 6))
plt.plot(distances)
plt.ylabel(f'{k}-NN Distance')
plt.xlabel('Data Points sorted by distance')
plt.title('K-distance Graph')
plt.grid(True)
plt.show()

# Look for "elbow" point - this is your eps
# Sharp increase indicates good eps value
```

**2. Grid Search for Parameters**
```python
from sklearn.metrics import silhouette_score
from itertools import product

# Define parameter grid
eps_values = np.arange(0.5, 5.0, 0.5)
min_samples_values = range(2, 10)

best_score = -1
best_params = {}
results = []

for eps, min_samples in product(eps_values, min_samples_values):
    dbscan = DBSCAN(eps=eps, min_samples=min_samples)
    labels = dbscan.fit_predict(X)

    # Skip if all noise or single cluster
    n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
    if n_clusters < 2:
        continue

    # Calculate score (excluding noise points)
    mask = labels != -1
    if mask.sum() > 0:
        score = silhouette_score(X[mask], labels[mask])
        results.append({
            'eps': eps,
            'min_samples': min_samples,
            'n_clusters': n_clusters,
            'n_noise': (labels == -1).sum(),
            'silhouette': score
        })

        if score > best_score:
            best_score = score
            best_params = {'eps': eps, 'min_samples': min_samples}

# Display results
import pandas as pd
df_results = pd.DataFrame(results)
print(df_results.sort_values('silhouette', ascending=False).head(10))
print(f"\nBest parameters: {best_params}")
print(f"Best silhouette score: {best_score:.3f}")
```

**3. OPTICS Alternative**
```python
# OPTICS is like DBSCAN but doesn't require eps
from sklearn.cluster import OPTICS

optics = OPTICS(
    min_samples=5,
    max_eps=np.inf,     # No eps limit
    metric='euclidean',
    cluster_method='xi'  # or 'dbscan'
)

labels = optics.fit_predict(X)

# OPTICS produces reachability plot
plt.figure(figsize=(10, 6))
space = np.arange(len(X))
reachability = optics.reachability_[optics.ordering_]
plt.plot(space, reachability, 'b-', alpha=0.8)
plt.ylabel('Reachability Distance')
plt.title('OPTICS Reachability Plot')
plt.show()
```

#### Complete Pipeline
```python
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
import matplotlib.pyplot as plt
import numpy as np

# 1. Prepare data
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 2. Find optimal eps using k-distance plot
k = 4
nbrs = NearestNeighbors(n_neighbors=k).fit(X_scaled)
distances, indices = nbrs.kneighbors(X_scaled)
distances = np.sort(distances[:, k-1], axis=0)

plt.figure(figsize=(10, 6))
plt.plot(distances)
plt.ylabel('4-NN Distance')
plt.xlabel('Points')
plt.title('K-distance Graph')
plt.axhline(y=0.5, color='r', linestyle='--', label='Suggested eps')
plt.legend()
plt.show()

# 3. Fit DBSCAN
eps = 0.5  # From k-distance plot
min_samples = 4

dbscan = DBSCAN(eps=eps, min_samples=min_samples)
labels = dbscan.fit_predict(X_scaled)

# 4. Analyze results
n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
n_noise = list(labels).count(-1)

print(f"Clusters found: {n_clusters}")
print(f"Noise points: {n_noise}")
print(f"Core points: {len(dbscan.core_sample_indices_)}")

# 5. Visualize (2D data)
if X.shape[1] == 2:
    unique_labels = set(labels)
    colors = plt.cm.Spectral(np.linspace(0, 1, len(unique_labels)))

    plt.figure(figsize=(10, 6))
    for k, col in zip(unique_labels, colors):
        if k == -1:
            col = [0, 0, 0, 1]  # Black for noise

        class_member_mask = (labels == k)
        xy = X[class_member_mask & core_samples_mask]
        plt.plot(xy[:, 0], xy[:, 1], 'o', markerfacecolor=tuple(col),
                markeredgecolor='k', markersize=14, label=f'Cluster {k}')

        xy = X[class_member_mask & ~core_samples_mask]
        plt.plot(xy[:, 0], xy[:, 1], 'o', markerfacecolor=tuple(col),
                markeredgecolor='k', markersize=6)

    plt.title(f'DBSCAN (eps={eps}, min_samples={min_samples})')
    plt.legend()
    plt.show()
```

### Advantages & Limitations

#### Advantages
```
✓ No need to specify number of clusters
✓ Can find arbitrarily shaped clusters
✓ Robust to outliers (marks them as noise)
✓ Only two parameters (eps, minPts)
✓ Can identify noise points
✓ Works well for spatial data
✓ Relatively fast: O(n log n) with spatial index
```

#### Limitations
```
✗ Struggles with varying density clusters
✗ Sensitive to eps and minPts parameters
✗ Not suitable for high-dimensional data (curse of dimensionality)
✗ Border points can be assigned inconsistently
✗ Difficult with clusters of different densities
✗ Performance degrades in high dimensions
```

### When to Use DBSCAN

#### Use DBSCAN When:
- You don't know the number of clusters
- Clusters have arbitrary shapes
- You expect noise/outliers in data
- Clusters have similar density
- You have spatial/geographical data
- Outlier detection is important

#### Don't Use DBSCAN When:
- Clusters have varying densities
- High-dimensional data (> 10-20 features)
- You need every point assigned to a cluster
- Data is uniformly distributed
- You need hierarchical relationships

## Real-World Applications

### 1. Anomaly Detection in Network Traffic
```python
"""
Detect unusual network behavior
"""
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import pandas as pd

# Network traffic features
features = ['bytes_sent', 'bytes_received', 'duration',
            'packets_sent', 'packets_received']

df = pd.read_csv('network_traffic.csv')
X = df[features]

# Scale
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# DBSCAN
dbscan = DBSCAN(eps=0.5, min_samples=5)
df['cluster'] = dbscan.fit_predict(X_scaled)

# Anomalies are noise points
anomalies = df[df['cluster'] == -1]
print(f"Anomalies detected: {len(anomalies)}")
print(anomalies[['timestamp', 'source_ip', 'dest_ip']])
```

### 2. Geographic Clustering
```python
"""
Find crime hotspots from GPS coordinates
"""
from sklearn.cluster import DBSCAN
import numpy as np

# Crime locations (latitude, longitude)
coords = np.array([[40.7128, -74.0060],  # NYC coordinates
                   [40.7130, -74.0062],
                   # ... more points
                   ])

# DBSCAN with haversine metric for geo data
# eps in radians: 0.5 km / 6371 km (Earth radius)
kms_per_radian = 6371.0
epsilon = 0.5 / kms_per_radian

dbscan = DBSCAN(eps=epsilon, min_samples=5, metric='haversine')
clusters = dbscan.fit_predict(np.radians(coords))

# Identify hotspots
n_clusters = len(set(clusters)) - (1 if -1 in clusters else 0)
print(f"Crime hotspots found: {n_clusters}")
```

### 3. Customer Segmentation with Outlier Detection
```python
"""
Segment customers and identify unusual behavior
"""
# Using hierarchical for taxonomy
from sklearn.cluster import AgglomerativeClustering
from scipy.cluster.hierarchy import dendrogram, linkage

# Customer features
features = ['total_spend', 'frequency', 'recency', 'avg_basket']
X = df[features]
X_scaled = scaler.fit_transform(X)

# Hierarchical for interpretable segments
hc = AgglomerativeClustering(n_clusters=4, linkage='ward')
df['segment'] = hc.fit_predict(X_scaled)

# DBSCAN to find outliers within each segment
for segment in range(4):
    segment_data = X_scaled[df['segment'] == segment]
    dbscan = DBSCAN(eps=0.5, min_samples=3)
    outliers = dbscan.fit_predict(segment_data)

    n_outliers = (outliers == -1).sum()
    print(f"Segment {segment}: {n_outliers} unusual customers")
```

### 4. Image Segmentation
```python
"""
Segment image regions using hierarchical clustering
"""
from sklearn.cluster import AgglomerativeClustering
from skimage import io
import numpy as np

# Load image
img = io.imread('image.jpg')
h, w, d = img.shape

# Reshape to pixels
pixels = img.reshape(h * w, d)

# Add spatial information (position matters)
positions = np.array([[i, j] for i in range(h) for j in range(w)])
features = np.hstack([pixels, positions * 0.1])  # Weight position lower

# Hierarchical clustering
hc = AgglomerativeClustering(n_clusters=10, linkage='ward')
labels = hc.fit_predict(features)

# Reshape back to image
segmented = labels.reshape(h, w)
```

## Comparison: Hierarchical vs DBSCAN

| Aspect | Hierarchical | DBSCAN |
|--------|-------------|---------|
| **Cluster Shape** | Any | Arbitrary |
| **Needs K?** | No (cut dendrogram) | No |
| **Outlier Handling** | Poor | Excellent |
| **Scalability** | Poor (O(n²)) | Good (O(n log n)) |
| **Deterministic** | Yes | Yes |
| **Parameters** | Linkage method, K | eps, minPts |
| **Varying Density** | Handles well | Struggles |
| **Interpretability** | Excellent (dendrogram) | Moderate |
| **Best For** | Taxonomy, small datasets | Spatial data, outliers |

## Quick Reference

### Hierarchical Clustering
```python
# Standard workflow
from sklearn.cluster import AgglomerativeClustering
from scipy.cluster.hierarchy import dendrogram, linkage

# Create linkage matrix
linkage_matrix = linkage(X_scaled, method='ward')

# Plot dendrogram
dendrogram(linkage_matrix)

# Cluster
hc = AgglomerativeClustering(n_clusters=3, linkage='ward')
labels = hc.fit_predict(X_scaled)
```

### DBSCAN
```python
# Standard workflow
from sklearn.cluster import DBSCAN
from sklearn.neighbors import NearestNeighbors

# Find eps
nbrs = NearestNeighbors(n_neighbors=4).fit(X_scaled)
distances, _ = nbrs.kneighbors(X_scaled)
distances = np.sort(distances[:, -1])
# Plot distances, find elbow

# Cluster
dbscan = DBSCAN(eps=0.5, min_samples=4)
labels = dbscan.fit_predict(X_scaled)

# Identify noise
noise = labels == -1
print(f"Noise points: {noise.sum()}")
```
