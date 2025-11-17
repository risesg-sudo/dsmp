# Gaussian Mixture Models (GMM)

## Overview
Gaussian Mixture Models represent data as a mixture of multiple Gaussian (normal) distributions. Unlike K-Means (hard clustering), GMM performs **soft clustering** - each point has a probability of belonging to each cluster.

### Key Concept
```
Probabilistic Clustering:
─────────────────────────────────────
K-Means:                GMM:
Point X → Cluster 2     Point X → 70% Cluster 2
                                  20% Cluster 1
                                  10% Cluster 3

Hard assignment         Soft assignment (probabilities)
```

## Mathematical Foundation

### Gaussian (Normal) Distribution

#### Univariate Gaussian
```
           1
p(x) = ─────────── exp(-(x-μ)²/2σ²)
       √(2πσ²)

Where:
- μ = mean (center)
- σ² = variance (spread)
- σ = standard deviation

Visual:
        μ
        ↓
        *
       ***
      *****      ← 68% within ±1σ
     *******     ← 95% within ±2σ
    *********
   ***********
  *************
────────────────────> x
```

#### Multivariate Gaussian
```
                    1
p(x) = ──────────────────── exp(-½(x-μ)ᵀΣ⁻¹(x-μ))
       (2π)^(d/2)|Σ|^(1/2)

Where:
- μ = mean vector (d-dimensional)
- Σ = covariance matrix (d×d)
- d = number of dimensions

2D Example:
      ╱──╲
     ╱    ╲       Elliptical shape
    │  μ   │      μ = center
     ╲    ╱       Σ determines shape
      ╲──╱
```

### Mixture Model

A GMM is a weighted sum of K Gaussian distributions:

```
p(x) = Σ(k=1 to K) πk · N(x | μk, Σk)

Where:
- K = number of components (clusters)
- πk = mixing coefficient (weight) for component k
- Σ πk = 1 (weights sum to 1)
- N(x | μk, Σk) = Gaussian with mean μk, covariance Σk
```

### Visual Representation

```
Single Gaussian:          Mixture of 3 Gaussians:

      ╱╲                    ╱╲    ╱╲
     ╱  ╲                  ╱  ╲  ╱  ╲   ╱╲
    ╱    ╲                ╱    ╲╱    ╲ ╱  ╲
   ╱      ╲              ╱            ╲    ╲
  ╱        ╲            ╱──────────────╲────╲
─────────────         ─────────────────────────
                       ↑     ↑     ↑
                      μ₁    μ₂    μ₃

Covariance Matrix Types:
────────────────────────────────────────────
Spherical:    Diagonal:     Full:
   ○○○         ───           ╱╲
   ○○○          │           ╱──╲
   ○○○         ───         │    │

Same variance  Different     Any elliptical
in all dims    per dim       shape
```

## Expectation-Maximization (EM) Algorithm

GMM is trained using the EM algorithm, which iteratively estimates parameters.

### Algorithm Steps

```
Initialize: Random μk, Σk, πk for k=1..K

Repeat until convergence:

  E-Step (Expectation):
  ─────────────────────────────────────────
  For each point xn and component k:
    Calculate responsibility γ(znk):

           πk · N(xn | μk, Σk)
  γ(znk) = ──────────────────────
           Σ(j=1 to K) πj · N(xn | μj, Σj)

  (Probability that xn belongs to component k)


  M-Step (Maximization):
  ─────────────────────────────────────────
  Update parameters using responsibilities:

  Nk = Σ(n=1 to N) γ(znk)

  μk = (1/Nk) Σ(n=1 to N) γ(znk) · xn

  Σk = (1/Nk) Σ(n=1 to N) γ(znk) · (xn - μk)(xn - μk)ᵀ

  πk = Nk / N


Convergence: When log-likelihood change < threshold
```

### Visual EM Process

```
Initial State (Random):
  Component 1  Component 2  Component 3
      *            *            *
    •   •        •   •        •   •
  (random means and covariances)

E-Step (Assign Probabilities):
  Point A:  40% C1, 30% C2, 30% C3
  Point B:  10% C1, 80% C2, 10% C3
  Point C:  20% C1, 20% C2, 60% C3
  ...

M-Step (Update Parameters):
  Adjust μ₁, Σ₁, π₁ based on weighted assignments
  Adjust μ₂, Σ₂, π₂ based on weighted assignments
  Adjust μ₃, Σ₃, π₃ based on weighted assignments

After Convergence:
  Component 1      Component 2      Component 3
  ┌─────────┐     ┌─────────┐     ┌─────────┐
  │  • • •  │     │  • • •  │     │  • • •  │
  │ • • • • │     │ • • • • │     │ • • • • │
  │  • • •  │     │  • • •  │     │  • • •  │
  └─────────┘     └─────────┘     └─────────┘
```

### Log-Likelihood

The objective function being maximized:

```
log p(X|μ,Σ,π) = Σ(n=1 to N) log[Σ(k=1 to K) πk · N(xn|μk,Σk)]

EM guarantees:
- Likelihood increases at each iteration
- Converges to local maximum
- No guarantee of global optimum
```

## Covariance Types

GMM supports different covariance structures:

```
1. Full (Default):
   ─────────────────────────────────
   Each component has full covariance matrix
   Can model any elliptical shape

   Σk = [σ₁₁  σ₁₂]    ╱─────╲
        [σ₂₁  σ₂₂]   │       │
                      ╲─────╱

   Parameters: K × d × (d+1)/2
   Most flexible, most parameters


2. Tied:
   ─────────────────────────────────
   All components share same covariance shape

   Σ₁ = Σ₂ = ... = ΣK

    ╱─╲  ╱─╲  ╱─╲
   │   ││   ││   │
    ╲─╱  ╲─╱  ╲─╱

   Parameters: d × (d+1)/2
   Same shape, different locations


3. Diagonal:
   ─────────────────────────────────
   No correlation between dimensions

   Σk = [σ₁²   0 ]    ───
        [ 0   σ₂²]     │
                       ───

   Parameters: K × d
   Axis-aligned ellipses


4. Spherical:
   ─────────────────────────────────
   Same variance in all dimensions

   Σk = σ² · I        ○○○
                      ○○○
                      ○○○

   Parameters: K
   Circular clusters (like K-Means)
```

## Model Selection: BIC & AIC

Since we must choose K, we use information criteria to balance fit and complexity.

### Bayesian Information Criterion (BIC)

```
BIC = -2 · log-likelihood + p · log(N)

Where:
- p = number of parameters
- N = number of samples

Lower BIC is better

Penalizes model complexity more heavily than AIC
Preferred when N is large
```

### Akaike Information Criterion (AIC)

```
AIC = -2 · log-likelihood + 2p

Lower AIC is better

Less penalty for complexity than BIC
Can overfit with small N
```

### Comparison

```
              Complexity Penalty
AIC:          ████
BIC:          ████████

BIC vs AIC:
───────────────────────────────────────
Small N:     Prefer BIC (avoid overfitting)
Large N:     BIC and AIC often agree
Many params: BIC penalizes more

Visual:
BIC│        ╱╲
   │       ╱  ╲        Choose K at minimum
   │      ╱    ╲
   │     ╱      ╲___
   │    ╱           ╲___
   └────────────────────────> K
        2  3  4  5  6  7
           ↑
      Optimal K
```

## Implementation

### Basic GMM
```python
from sklearn.mixture import GaussianMixture
import numpy as np

# Sample data
X = np.array([[1, 2], [1.5, 1.8], [5, 8], [8, 8], [1, 0.6], [9, 11]])

# Fit GMM
gmm = GaussianMixture(
    n_components=3,         # Number of components (K)
    covariance_type='full', # 'full', 'tied', 'diag', 'spherical'
    max_iter=100,           # Maximum EM iterations
    n_init=1,               # Number of initializations
    random_state=42,        # Reproducibility
    init_params='kmeans'    # 'kmeans', 'random', 'k-means++', 'random_from_data'
)

gmm.fit(X)

# Predictions
hard_labels = gmm.predict(X)              # Hard clustering
soft_labels = gmm.predict_proba(X)        # Soft clustering (probabilities)

print("Hard labels:", hard_labels)
print("\nSoft labels (responsibilities):\n", soft_labels)
print("\nMeans:\n", gmm.means_)
print("\nCovariances:\n", gmm.covariances_)
print("\nWeights:", gmm.weights_)
print("\nConverged:", gmm.converged_)
print("Iterations:", gmm.n_iter_)
```

### Model Selection with BIC/AIC
```python
from sklearn.mixture import GaussianMixture
import matplotlib.pyplot as plt
import numpy as np

def select_gmm_components(X, k_range, covariance_type='full'):
    """Find optimal number of components using BIC and AIC"""

    bic_scores = []
    aic_scores = []
    models = []

    for k in k_range:
        gmm = GaussianMixture(
            n_components=k,
            covariance_type=covariance_type,
            random_state=42,
            n_init=10
        )
        gmm.fit(X)

        bic_scores.append(gmm.bic(X))
        aic_scores.append(gmm.aic(X))
        models.append(gmm)

    # Plot
    plt.figure(figsize=(10, 5))
    plt.plot(k_range, bic_scores, 'bx-', label='BIC')
    plt.plot(k_range, aic_scores, 'rx-', label='AIC')
    plt.xlabel('Number of Components')
    plt.ylabel('Information Criterion')
    plt.title('Model Selection')
    plt.legend()
    plt.grid(True)
    plt.show()

    # Optimal K
    optimal_k_bic = k_range[np.argmin(bic_scores)]
    optimal_k_aic = k_range[np.argmin(aic_scores)]

    print(f"Optimal K (BIC): {optimal_k_bic}")
    print(f"Optimal K (AIC): {optimal_k_aic}")

    return models[np.argmin(bic_scores)]

# Usage
k_range = range(1, 11)
best_model = select_gmm_components(X_scaled, k_range)
```

### Complete Pipeline
```python
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt
import numpy as np

# 1. Prepare data
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 2. Compare covariance types
def compare_covariance_types(X, n_components, cov_types):
    """Compare different covariance types"""

    results = {}

    for cov_type in cov_types:
        gmm = GaussianMixture(
            n_components=n_components,
            covariance_type=cov_type,
            random_state=42,
            n_init=10
        )
        gmm.fit(X)

        results[cov_type] = {
            'bic': gmm.bic(X),
            'aic': gmm.aic(X),
            'log_likelihood': gmm.score(X) * len(X),
            'n_params': gmm._n_parameters()
        }

    return results

cov_types = ['full', 'tied', 'diag', 'spherical']
results = compare_covariance_types(X_scaled, 3, cov_types)

# Display comparison
import pandas as pd
df_results = pd.DataFrame(results).T
print(df_results)

# 3. Find optimal K
k_range = range(1, 11)
bic_scores = []
aic_scores = []
silhouette_scores = []

for k in k_range:
    gmm = GaussianMixture(
        n_components=k,
        covariance_type='full',
        random_state=42,
        n_init=10
    )
    gmm.fit(X_scaled)

    bic_scores.append(gmm.bic(X_scaled))
    aic_scores.append(gmm.aic(X_scaled))

    if k > 1:
        labels = gmm.predict(X_scaled)
        silhouette_scores.append(silhouette_score(X_scaled, labels))
    else:
        silhouette_scores.append(0)

# 4. Visualize
fig, axes = plt.subplots(1, 3, figsize=(15, 4))

axes[0].plot(k_range, bic_scores, 'bx-')
axes[0].set_title('BIC')
axes[0].set_xlabel('K')

axes[1].plot(k_range, aic_scores, 'rx-')
axes[1].set_title('AIC')
axes[1].set_xlabel('K')

axes[2].plot(k_range, silhouette_scores, 'gx-')
axes[2].set_title('Silhouette')
axes[2].set_xlabel('K')

plt.tight_layout()
plt.show()

# 5. Fit final model
optimal_k = k_range[np.argmin(bic_scores)]
final_gmm = GaussianMixture(
    n_components=optimal_k,
    covariance_type='full',
    random_state=42,
    n_init=10
)
final_gmm.fit(X_scaled)

# 6. Analyze results
hard_labels = final_gmm.predict(X_scaled)
soft_labels = final_gmm.predict_proba(X_scaled)

print(f"\nOptimal K: {optimal_k}")
print(f"Converged: {final_gmm.converged_}")
print(f"Iterations: {final_gmm.n_iter_}")
print(f"\nComponent weights: {final_gmm.weights_}")

# Component analysis
for i in range(optimal_k):
    print(f"\nComponent {i}:")
    print(f"  Weight: {final_gmm.weights_[i]:.3f}")
    print(f"  Mean: {final_gmm.means_[i]}")
    print(f"  Members: {(hard_labels == i).sum()}")
    print(f"  Avg probability: {soft_labels[hard_labels == i, i].mean():.3f}")
```

### Generating Samples from GMM
```python
# Generate new samples from fitted GMM
n_samples = 100
X_new, y_new = gmm.sample(n_samples)

print(f"Generated {n_samples} samples")
print(f"Component labels: {np.bincount(y_new)}")

# Plot original and generated
plt.figure(figsize=(12, 5))

plt.subplot(121)
plt.scatter(X[:, 0], X[:, 1], c='blue', alpha=0.6)
plt.title('Original Data')

plt.subplot(122)
plt.scatter(X_new[:, 0], X_new[:, 1], c=y_new, alpha=0.6, cmap='viridis')
plt.title('Generated Samples')
plt.show()
```

### Anomaly Detection with GMM
```python
# Score samples (log probability density)
log_probs = gmm.score_samples(X_scaled)

# Identify anomalies (low probability)
threshold = np.percentile(log_probs, 5)  # Bottom 5%
anomalies = log_probs < threshold

print(f"Anomalies detected: {anomalies.sum()}")
print(f"Anomaly indices: {np.where(anomalies)[0]}")

# Visualize
plt.figure(figsize=(10, 6))
plt.scatter(X[~anomalies, 0], X[~anomalies, 1],
           c='blue', label='Normal', alpha=0.6)
plt.scatter(X[anomalies, 0], X[anomalies, 1],
           c='red', label='Anomaly', marker='x', s=100)
plt.legend()
plt.title('Anomaly Detection with GMM')
plt.show()
```

### Semi-Supervised Learning with GMM
```python
"""
Use GMM for semi-supervised learning
"""
from sklearn.semi_supervised import LabelPropagation

# Partially labeled data
# -1 indicates unlabeled
y_partial = np.array([0, 0, -1, -1, 1, 1, -1, -1])

# Fit GMM to all data
gmm = GaussianMixture(n_components=2, random_state=42)
gmm.fit(X)

# Get soft labels for all points
soft_labels = gmm.predict_proba(X)

# Use as features for label propagation
label_prop = LabelPropagation()
label_prop.fit(soft_labels, y_partial)

# Predict unlabeled points
y_predicted = label_prop.predict(soft_labels)
print("Predicted labels:", y_predicted)
```

## Advantages & Limitations

### Advantages
```
✓ Soft clustering (probability assignments)
✓ Probabilistic framework (generative model)
✓ Can model elliptical clusters
✓ Flexible covariance structures
✓ Can generate new samples
✓ Uncertainty quantification
✓ Works with EM (guaranteed convergence)
✓ Good for density estimation
```

### Limitations
```
✗ Must specify K in advance
✗ Assumes Gaussian distributions
✗ Sensitive to initialization
✗ Can converge to local optima
✗ Computationally expensive (O(n·K·d²·I))
✗ Struggles with high dimensions (curse of dimensionality)
✗ Sensitive to outliers (full covariance)
✗ May need many samples per component
```

## When to Use GMM

### Use GMM When:
- You need soft/probabilistic clustering
- Clusters are roughly elliptical
- You want to generate new samples
- You need uncertainty estimates
- Density estimation is important
- Clusters may overlap
- You have enough data per cluster

### Don't Use GMM When:
- Clusters have arbitrary complex shapes
- You have very limited data
- Computational resources are constrained
- You need hard cluster assignments only
- Data is highly non-Gaussian
- You have many outliers

## Real-World Applications

### 1. Image Segmentation
```python
"""
Segment image regions using color distributions
"""
from sklearn.mixture import GaussianMixture
from skimage import io
import numpy as np

# Load image
img = io.imread('image.jpg')
h, w, d = img.shape
pixels = img.reshape(h * w, d)

# Fit GMM to colors
gmm = GaussianMixture(n_components=5, covariance_type='full', random_state=42)
gmm.fit(pixels)

# Segment
labels = gmm.predict(pixels)
segmented = labels.reshape(h, w)

# Replace with mean colors
means = gmm.means_
segmented_img = means[labels].reshape(h, w, d).astype(np.uint8)

io.imsave('segmented.jpg', segmented_img)
```

### 2. Speaker Recognition
```python
"""
Model speaker voice characteristics
"""
from sklearn.mixture import GaussianMixture
import librosa

# Extract MFCC features from audio
audio, sr = librosa.load('speaker1.wav')
mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)

# Transpose to (frames, features)
X = mfcc.T

# Train GMM for speaker
speaker_gmm = GaussianMixture(
    n_components=32,       # Common for speaker modeling
    covariance_type='diag',
    random_state=42
)
speaker_gmm.fit(X)

# Score new audio against model
def verify_speaker(audio_file, gmm_model):
    audio, sr = librosa.load(audio_file)
    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13).T
    score = gmm_model.score(mfcc)
    return score

score = verify_speaker('test.wav', speaker_gmm)
print(f"Speaker likelihood: {score}")
```

### 3. Customer Lifetime Value Modeling
```python
"""
Model customer value with uncertainty
"""
from sklearn.mixture import GaussianMixture
import pandas as pd

# Customer features
features = ['total_spend', 'avg_order_value', 'frequency',
            'tenure_days', 'engagement_score']

df = pd.read_csv('customers.csv')
X = df[features]
X_scaled = scaler.fit_transform(X)

# Fit GMM
gmm = GaussianMixture(n_components=4, random_state=42)
gmm.fit(X_scaled)

# Get probabilities
df['segment_probs'] = list(gmm.predict_proba(X_scaled))
df['primary_segment'] = gmm.predict(X_scaled)

# Analyze mixed membership
mixed_membership = (gmm.predict_proba(X_scaled).max(axis=1) < 0.7)
print(f"Customers with mixed membership: {mixed_membership.sum()}")

# These customers might be transitioning between segments
df_mixed = df[mixed_membership]
print(df_mixed[features + ['segment_probs']])
```

### 4. Anomaly Detection in Manufacturing
```python
"""
Detect defective products based on sensor data
"""
from sklearn.mixture import GaussianMixture
import numpy as np

# Sensor readings (temperature, pressure, vibration, etc.)
sensor_data = load_sensor_data()

# Fit GMM on normal data
gmm = GaussianMixture(n_components=3, random_state=42)
gmm.fit(sensor_data)

# Score new readings
new_readings = get_new_readings()
scores = gmm.score_samples(new_readings)

# Flag anomalies
threshold = np.percentile(gmm.score_samples(sensor_data), 1)
defective = scores < threshold

print(f"Defective products: {defective.sum()}/{len(scores)}")
```

### 5. Topic Modeling (Alternative to LDA)
```python
"""
Discover topics in documents using GMM
"""
from sklearn.mixture import GaussianMixture
from sklearn.feature_extraction.text import TfidfVectorizer

documents = load_documents()

# Vectorize
vectorizer = TfidfVectorizer(max_features=1000)
X = vectorizer.fit_transform(documents).toarray()

# Fit GMM
gmm = GaussianMixture(n_components=10, covariance_type='diag', random_state=42)
gmm.fit(X)

# Get topic assignments with probabilities
topic_probs = gmm.predict_proba(X)

# Documents can belong to multiple topics
multi_topic = (topic_probs > 0.2).sum(axis=1) > 1
print(f"Multi-topic documents: {multi_topic.sum()}")

# Top words per topic
feature_names = vectorizer.get_feature_names_out()
for i in range(10):
    top_indices = gmm.means_[i].argsort()[-10:][::-1]
    top_words = [feature_names[j] for j in top_indices]
    print(f"Topic {i}: {', '.join(top_words)}")
```

## Comparison with Other Algorithms

| Aspect | GMM | K-Means | DBSCAN | Hierarchical |
|--------|-----|---------|---------|--------------|
| **Clustering Type** | Soft | Hard | Hard | Hard |
| **Cluster Shape** | Elliptical | Spherical | Arbitrary | Any |
| **Needs K?** | Yes | Yes | No | No (cut tree) |
| **Probabilistic** | Yes | No | No | No |
| **Outlier Handling** | Moderate | Poor | Excellent | Poor |
| **Overlapping Clusters** | Yes | No | No | No |
| **Complexity** | O(n·K·d²·I) | O(n·K·I·d) | O(n log n) | O(n²) |
| **Best For** | Overlapping, soft | Simple, fast | Arbitrary shapes | Hierarchies |

## Tips & Best Practices

### Choosing Covariance Type
```python
# General guidelines:

# Full: Most flexible, needs more data
# - Use when: Plenty of data, clusters may be tilted
# - Avoid when: Limited data, high dimensions

# Tied: Same shape for all components
# - Use when: Clusters have similar shapes
# - Saves parameters

# Diagonal: No correlation between features
# - Use when: Features are independent
# - Faster, fewer parameters

# Spherical: Like K-Means
# - Use when: Circular clusters
# - Fastest, fewest parameters

# Rule of thumb:
n_samples_per_component = 5 * n_features  # Minimum
if n_samples < n_samples_per_component:
    use_simpler_covariance_type()
```

### Initialization Strategies
```python
# Multiple initializations
gmm = GaussianMixture(
    n_components=3,
    n_init=10,              # Run 10 times, keep best
    init_params='kmeans'    # Start with k-means
)

# Custom initialization
gmm = GaussianMixture(
    n_components=3,
    means_init=custom_means,
    precisions_init=custom_precisions
)
```

### Regularization
```python
# Add regularization to prevent singular covariances
gmm = GaussianMixture(
    n_components=3,
    reg_covar=1e-6,         # Add to diagonal
    covariance_type='full'
)
```

### Convergence Monitoring
```python
gmm = GaussianMixture(
    n_components=3,
    max_iter=100,
    tol=1e-3,              # Convergence threshold
    verbose=2              # Print progress
)

gmm.fit(X)

print(f"Converged: {gmm.converged_}")
print(f"Iterations: {gmm.n_iter_}")
print(f"Lower bound: {gmm.lower_bound_}")
```

## Common Pitfalls

1. **Too few samples**: Need enough data per component (rule: 5×d minimum)
2. **Wrong covariance type**: Full covariance with little data → overfitting
3. **Not standardizing**: Features on different scales affect results
4. **Ignoring convergence**: Check `gmm.converged_` and `n_iter_`
5. **Local optima**: Use multiple initializations (`n_init > 1`)
6. **Singular covariances**: Add regularization (`reg_covar`)

## Quick Reference

```python
# Standard workflow
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler

# 1. Scale
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 2. Find optimal K using BIC
bic_scores = []
for k in range(1, 11):
    gmm = GaussianMixture(n_components=k, random_state=42, n_init=10)
    gmm.fit(X_scaled)
    bic_scores.append(gmm.bic(X_scaled))

optimal_k = np.argmin(bic_scores) + 1

# 3. Fit final model
gmm = GaussianMixture(
    n_components=optimal_k,
    covariance_type='full',
    random_state=42,
    n_init=10
)
gmm.fit(X_scaled)

# 4. Get results
hard_labels = gmm.predict(X_scaled)          # Hard clustering
soft_labels = gmm.predict_proba(X_scaled)    # Probabilities
scores = gmm.score_samples(X_scaled)         # Log-likelihood

# 5. Generate samples
X_new, y_new = gmm.sample(100)
```
