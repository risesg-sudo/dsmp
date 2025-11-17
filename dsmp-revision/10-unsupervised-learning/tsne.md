# t-SNE (t-Distributed Stochastic Neighbor Embedding)

## Overview
t-SNE is a **dimensionality reduction technique** primarily used for **visualization**. It transforms high-dimensional data into 2D or 3D space while preserving local structure (nearby points stay nearby).

### Key Concept
```
High-Dimensional Space → t-SNE → 2D/3D Visualization

Before (784D - MNIST):        After (2D):
[0.1, 0.2, ..., 0.8]    →      (2.3, 4.1)
(can't visualize)              (can plot!)

Preserves:  Local structure (neighborhoods)
Doesn't preserve: Global structure (distances)
```

## Why t-SNE?

### Problem with Linear Methods (PCA)
```
PCA (Linear):              t-SNE (Non-linear):

   ●                         ●●●
  ●●●                       ●   ●
   ●                         ●●●
     ■■■                        ■■■
    ■   ■                      ■   ■
     ■■■                        ■■■

Projects to line:          Preserves clusters:
●●●■■■                      ●●●    ■■■

Loses structure!           Maintains separation!
```

### Comparison with Other Methods

```
Dimensionality Reduction Landscape:
──────────────────────────────────────────────

Linear Methods:
- PCA: Maximize variance
- LDA: Maximize class separation
  → Fast, global structure
  → May not capture non-linear patterns

Non-linear Methods:
- t-SNE: Preserve local neighborhoods
- UMAP: Similar to t-SNE but faster
- Autoencoders: Neural network approach
  → Better for complex patterns
  → Computationally expensive
```

## How t-SNE Works

### Algorithm Overview

```
Step 1: Compute Pairwise Similarities (High-D)
──────────────────────────────────────────────
For each point i, compute probability that j is neighbor:

         exp(-||xi - xj||² / 2σi²)
pij = ────────────────────────────────
      Σ(k≠i) exp(-||xi - xk||² / 2σi²)

Make symmetric: pij = (pij + pji) / 2N


Step 2: Initialize Low-D Embedding
──────────────────────────────────────────────
Randomly place points in 2D/3D space


Step 3: Compute Similarities (Low-D)
──────────────────────────────────────────────
Use t-distribution (heavy tails):

              (1 + ||yi - yj||²)⁻¹
qij = ─────────────────────────────────
      Σ(k≠l) (1 + ||yk - yl||²)⁻¹


Step 4: Optimize
──────────────────────────────────────────────
Minimize KL divergence between P and Q:

KL(P||Q) = Σ pij · log(pij/qij)

Using gradient descent:
Move points to match high-D similarities
```

### Visual Explanation

```
High-Dimensional Space:
     A
    /|\
   B C D    Points A,B close
             Points A,D far

Similarity Matrix P:
    A    B    C    D
A   -   0.4  0.3  0.1
B  0.4   -   0.2  0.1
C  0.3  0.2   -   0.2
D  0.1  0.1  0.2   -

Initial Random 2D:
  C       D
      A
  B

Optimize to Match P:
   C
 A   B
     D

Final: A,B,C close; D separate
(matches high-D relationships)
```

### Why t-Distribution?

```
Gaussian (Normal):       t-Distribution:

     ╱╲                     ╱───╲
    ╱  ╲                   ╱     ╲
   ╱    ╲                 ╱       ╲
  ╱──────╲               ╱         ╲
                        ╱───────────╲

Light tails            Heavy tails

Problem with Gaussian:
- Moderate distances get crowded
- Hard to separate clusters

t-Distribution Solution:
- Heavy tails allow distant points
- Better cluster separation in 2D
- "Crowding problem" solved
```

## Key Parameters

### 1. Perplexity

**Definition:** Smooth measure of effective number of neighbors

```
Typical range: 5-50
Default: 30

Small perplexity (5):        Large perplexity (50):
  ●●  ●●                       ●●●●●●
  ●●  ●●  ●●                  ●●●  ●●●
      ●●  ●●                   ●●●●●●

  Focus on local             Focus on global
  Many small clusters        Fewer larger clusters

Rule of thumb: perplexity < N/3
```

**How perplexity affects results:**
```
Perplexity = 5:           Perplexity = 30:         Perplexity = 100:
    ●                         ● ●                      ●●●●●
  ● ● ●                      ●   ●                    ●     ●
    ●                         ● ●                      ●●●●●

  ■   ■                       ■■■                        ■■■■
   ■ ■                        ■■■                       ■■■■■

Over-fragmented           Balanced                 Over-merged
```

### 2. Learning Rate

```
Typical range: 10-1000
Default: 200

Too low (10):            Good (200):              Too high (1000):
  Random-looking           Clear clusters          Ball/single cluster

  ●  ●    ●               ●●●    ■■■              ●●●■■■▲▲▲
    ●   ●                 ●●●    ■■■               (collapsed)
  ●    ●                   ▲▲▲

Guideline: learning_rate = N / 12 (if N < 10000)
```

### 3. Number of Iterations

```
Minimum: 250
Recommended: 1000+
For final results: 3000-5000

Progress:
Iteration 100:     Iteration 500:     Iteration 1000:
  Random mess       Forming clusters   Well-separated
     ●●●             ●●●    ■■■         ●●●     ■■■
    ● ■■●            ●●    ■■            ●      ■
     ●■              ▲▲    ▲▲▲           ▲▲▲    ▲▲▲
```

### 4. Early Exaggeration

```
Default: 12
Range: 4-24

Purpose: In early iterations, make clusters more separated

Early iterations (exaggerated):
  ●●●         ■■■         ▲▲▲
  (clusters pulled apart)

Later iterations (normal):
  ●●●    ■■■    ▲▲▲
  (refined positions)
```

## Implementation

### Basic t-SNE
```python
from sklearn.manifold import TSNE
import numpy as np
import matplotlib.pyplot as plt

# High-dimensional data
X = np.random.randn(300, 50)  # 300 samples, 50 dimensions

# Fit t-SNE
tsne = TSNE(
    n_components=2,        # Target dimensions (2 or 3)
    perplexity=30,         # Number of neighbors
    learning_rate=200,     # Step size
    n_iter=1000,          # Number of iterations
    random_state=42,       # Reproducibility
    init='random',         # 'random' or 'pca'
    metric='euclidean'     # Distance metric
)

X_embedded = tsne.fit_transform(X)

# Plot
plt.figure(figsize=(10, 8))
plt.scatter(X_embedded[:, 0], X_embedded[:, 1], alpha=0.6)
plt.title('t-SNE Visualization')
plt.xlabel('t-SNE 1')
plt.ylabel('t-SNE 2')
plt.show()

print(f"KL divergence: {tsne.kl_divergence_:.3f}")
print(f"Iterations: {tsne.n_iter_}")
```

### t-SNE with Labels (Classification)
```python
from sklearn.manifold import TSNE
from sklearn.datasets import load_digits
import matplotlib.pyplot as plt
import numpy as np

# Load digits dataset
digits = load_digits()
X = digits.data  # 64 features (8x8 images)
y = digits.target  # Labels 0-9

# Apply t-SNE
tsne = TSNE(n_components=2, perplexity=30, n_iter=1000, random_state=42)
X_embedded = tsne.fit_transform(X)

# Plot with colors
plt.figure(figsize=(12, 10))
scatter = plt.scatter(
    X_embedded[:, 0],
    X_embedded[:, 1],
    c=y,
    cmap='tab10',
    alpha=0.7,
    s=50
)
plt.colorbar(scatter, label='Digit')
plt.title('t-SNE: MNIST Digits')
plt.xlabel('t-SNE 1')
plt.ylabel('t-SNE 2')
plt.show()
```

### Finding Optimal Perplexity
```python
import numpy as np
from sklearn.manifold import TSNE
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt

def evaluate_perplexity(X, y, perplexity_values):
    """Evaluate different perplexity values"""

    results = []

    for perplexity in perplexity_values:
        print(f"Testing perplexity={perplexity}")

        tsne = TSNE(
            n_components=2,
            perplexity=perplexity,
            n_iter=1000,
            random_state=42
        )
        X_embedded = tsne.fit_transform(X)

        # Evaluate if labels available
        if y is not None:
            silhouette = silhouette_score(X_embedded, y)
        else:
            silhouette = None

        results.append({
            'perplexity': perplexity,
            'kl_divergence': tsne.kl_divergence_,
            'silhouette': silhouette,
            'embedding': X_embedded
        })

    return results

# Test different perplexities
perplexity_values = [5, 10, 20, 30, 50, 100]
results = evaluate_perplexity(X, y, perplexity_values)

# Plot comparison
fig, axes = plt.subplots(2, 3, figsize=(15, 10))
axes = axes.ravel()

for i, result in enumerate(results):
    axes[i].scatter(
        result['embedding'][:, 0],
        result['embedding'][:, 1],
        c=y,
        cmap='tab10',
        alpha=0.6,
        s=20
    )
    title = f"Perplexity={result['perplexity']}"
    if result['silhouette']:
        title += f"\nSilhouette={result['silhouette']:.3f}"
    axes[i].set_title(title)

plt.tight_layout()
plt.show()
```

### Complete Pipeline with Preprocessing
```python
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import numpy as np
import matplotlib.pyplot as plt

# 1. Load and prepare data
X, y = load_data()  # Your high-dimensional data

# 2. Standardize
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 3. Optional: PCA for speed (if very high-dimensional)
# Reduce to 50D first, then apply t-SNE
if X_scaled.shape[1] > 50:
    print("Applying PCA for dimensionality reduction...")
    pca = PCA(n_components=50, random_state=42)
    X_pca = pca.fit_transform(X_scaled)
    print(f"PCA explained variance: {pca.explained_variance_ratio_.sum():.2%}")
else:
    X_pca = X_scaled

# 4. Apply t-SNE
print("Applying t-SNE...")
tsne = TSNE(
    n_components=2,
    perplexity=30,
    learning_rate='auto',   # Automatic learning rate
    n_iter=1000,
    init='pca',            # Initialize with PCA (often better than random)
    random_state=42,
    verbose=1              # Print progress
)

X_tsne = tsne.fit_transform(X_pca)

# 5. Visualize
fig, axes = plt.subplots(1, 2, figsize=(15, 6))

# Without labels
axes[0].scatter(X_tsne[:, 0], X_tsne[:, 1], alpha=0.6)
axes[0].set_title('t-SNE (unlabeled)')
axes[0].set_xlabel('t-SNE 1')
axes[0].set_ylabel('t-SNE 2')

# With labels (if available)
if y is not None:
    scatter = axes[1].scatter(
        X_tsne[:, 0],
        X_tsne[:, 1],
        c=y,
        cmap='tab10',
        alpha=0.6
    )
    axes[1].set_title('t-SNE (labeled)')
    axes[1].set_xlabel('t-SNE 1')
    axes[1].set_ylabel('t-SNE 2')
    plt.colorbar(scatter, ax=axes[1])

plt.tight_layout()
plt.show()

print(f"\nFinal KL divergence: {tsne.kl_divergence_:.3f}")
```

### 3D t-SNE
```python
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# 3D embedding
tsne_3d = TSNE(n_components=3, perplexity=30, n_iter=1000, random_state=42)
X_3d = tsne_3d.fit_transform(X)

# 3D plot
fig = plt.figure(figsize=(12, 10))
ax = fig.add_subplot(111, projection='3d')

scatter = ax.scatter(
    X_3d[:, 0],
    X_3d[:, 1],
    X_3d[:, 2],
    c=y,
    cmap='tab10',
    alpha=0.6,
    s=50
)

ax.set_xlabel('t-SNE 1')
ax.set_ylabel('t-SNE 2')
ax.set_zlabel('t-SNE 3')
ax.set_title('3D t-SNE Visualization')
plt.colorbar(scatter)
plt.show()
```

### Interactive Visualization
```python
# Using plotly for interactive plots
import plotly.express as px
import pandas as pd

# Create DataFrame
df = pd.DataFrame({
    'tsne_1': X_tsne[:, 0],
    'tsne_2': X_tsne[:, 1],
    'label': y
})

# Interactive plot
fig = px.scatter(
    df,
    x='tsne_1',
    y='tsne_2',
    color='label',
    title='Interactive t-SNE',
    hover_data=['label'],
    color_continuous_scale='viridis'
)
fig.show()
```

## Advantages & Limitations

### Advantages
```
✓ Excellent for visualization (2D/3D)
✓ Preserves local structure well
✓ Reveals clusters and patterns
✓ Non-linear (captures complex relationships)
✓ Works with any distance metric
✓ Great for exploratory data analysis
✓ Intuitive visual results
```

### Limitations
```
✗ Computationally expensive: O(n²) or O(n log n)
✗ Non-deterministic (different runs → different results)
✗ Cannot transform new data (no .transform())
✗ Doesn't preserve global structure
✗ Distances in low-D not meaningful
✗ Sensitive to hyperparameters
✗ Can create false patterns
✗ Not suitable for downstream tasks
✗ Slow on large datasets (>10K points)
```

### Common Misinterpretations

```
❌ WRONG Interpretations:
─────────────────────────────────────
1. "Cluster sizes are meaningful"
   → NO: t-SNE can expand/contract clusters

2. "Distances between clusters matter"
   → NO: Only local distances preserved

3. "Empty space means no data"
   → NO: Could be compression artifact

4. "Can use for clustering"
   → NO: Use clustering algorithms, then visualize

✓ CORRECT Interpretations:
─────────────────────────────────────
1. Nearby points are similar
2. Well-separated clusters likely distinct
3. Overall structure/patterns
4. Outliers and anomalies
```

## When to Use t-SNE

### Use t-SNE When:
- You need to visualize high-dimensional data
- Exploring data for patterns/clusters
- Presenting results to non-technical audience
- You want to understand data structure
- Sample size < 10,000 points
- Local structure is important

### Don't Use t-SNE When:
- You need to transform new data
- Training machine learning models
- You need to preserve global distances
- You need deterministic results
- Dataset is very large (> 100K points)
- You need interpretable dimensions

### Alternatives

```
Situation                      → Use Instead
──────────────────────────────────────────────
Large datasets (>100K)        → UMAP, PaCMAP
Need .transform()             → UMAP, PCA
Preserve global structure     → PCA, MDS
Speed critical                → PCA, UMAP
Clustering                    → K-Means, DBSCAN then t-SNE
Feature engineering           → PCA, Autoencoders
```

## Real-World Applications

### 1. Visualizing MNIST Digits
```python
"""
Visualize handwritten digits
"""
from sklearn.datasets import fetch_openml
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt

# Load MNIST (70K images, 784 features)
mnist = fetch_openml('mnist_784', version=1, parser='auto')
X = mnist.data[:10000]  # Subset for speed
y = mnist.target[:10000].astype(int)

# t-SNE
tsne = TSNE(n_components=2, perplexity=30, n_iter=1000, random_state=42)
X_tsne = tsne.fit_transform(X)

# Plot
plt.figure(figsize=(12, 10))
scatter = plt.scatter(X_tsne[:, 0], X_tsne[:, 1], c=y, cmap='tab10', alpha=0.6, s=5)
plt.colorbar(scatter, label='Digit')
plt.title('t-SNE: MNIST Handwritten Digits')
plt.show()

# Similar digits cluster together!
```

### 2. Gene Expression Analysis
```python
"""
Visualize cell types from gene expression
"""
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler
import pandas as pd

# Gene expression matrix (cells × genes)
# Rows: cells, Columns: genes
expression_data = pd.read_csv('gene_expression.csv')
X = expression_data.iloc[:, 1:]  # Gene columns
cell_types = expression_data['cell_type']

# Standardize
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# t-SNE
tsne = TSNE(n_components=2, perplexity=30, n_iter=1000, random_state=42)
X_tsne = tsne.fit_transform(X_scaled)

# Plot
plt.figure(figsize=(12, 10))
for cell_type in cell_types.unique():
    mask = cell_types == cell_type
    plt.scatter(
        X_tsne[mask, 0],
        X_tsne[mask, 1],
        label=cell_type,
        alpha=0.6,
        s=30
    )
plt.legend()
plt.title('t-SNE: Cell Types from Gene Expression')
plt.xlabel('t-SNE 1')
plt.ylabel('t-SNE 2')
plt.show()
```

### 3. Document Similarity Visualization
```python
"""
Visualize document embeddings
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt

documents = load_documents()  # Your text data
categories = load_categories()  # Document categories

# TF-IDF vectorization
vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
X_tfidf = vectorizer.fit_transform(documents).toarray()

# t-SNE
tsne = TSNE(n_components=2, perplexity=30, n_iter=1000, random_state=42)
X_tsne = tsne.fit_transform(X_tfidf)

# Plot
plt.figure(figsize=(12, 10))
for category in np.unique(categories):
    mask = categories == category
    plt.scatter(
        X_tsne[mask, 0],
        X_tsne[mask, 1],
        label=category,
        alpha=0.6,
        s=50
    )
plt.legend()
plt.title('t-SNE: Document Similarity')
plt.show()
```

### 4. Customer Segmentation Exploration
```python
"""
Explore customer segments
"""
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler
import pandas as pd

# Customer features
features = ['age', 'income', 'spending_score', 'frequency', 'recency']
df = pd.read_csv('customers.csv')
X = df[features]

# Standardize
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# t-SNE
tsne = TSNE(n_components=2, perplexity=30, n_iter=1000, random_state=42)
X_tsne = tsne.fit_transform(X_scaled)

# Add to DataFrame
df['tsne_1'] = X_tsne[:, 0]
df['tsne_2'] = X_tsne[:, 1]

# Color by spending score
plt.figure(figsize=(12, 10))
scatter = plt.scatter(
    df['tsne_1'],
    df['tsne_2'],
    c=df['spending_score'],
    cmap='viridis',
    alpha=0.6,
    s=50
)
plt.colorbar(scatter, label='Spending Score')
plt.title('Customer Segments (t-SNE)')
plt.xlabel('t-SNE 1')
plt.ylabel('t-SNE 2')
plt.show()

# Identify clusters for further analysis
```

### 5. Deep Learning Feature Visualization
```python
"""
Visualize CNN features
"""
from tensorflow.keras.applications import VGG16
from tensorflow.keras.preprocessing import image
from sklearn.manifold import TSNE
import numpy as np

# Load pre-trained model
model = VGG16(weights='imagenet', include_top=False, pooling='avg')

# Extract features from images
image_paths = load_image_paths()
features = []

for img_path in image_paths:
    img = image.load_img(img_path, target_size=(224, 224))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)
    feat = model.predict(x)
    features.append(feat.flatten())

X_features = np.array(features)

# t-SNE
tsne = TSNE(n_components=2, perplexity=30, n_iter=1000, random_state=42)
X_tsne = tsne.fit_transform(X_features)

# Plot
plt.figure(figsize=(12, 10))
plt.scatter(X_tsne[:, 0], X_tsne[:, 1], alpha=0.6)
plt.title('t-SNE: CNN Image Features')
plt.show()
```

## Comparison: t-SNE vs Other Methods

| Method | Type | Speed | Global Structure | Local Structure | Transform New Data | Best For |
|--------|------|-------|------------------|-----------------|-------------------|----------|
| **PCA** | Linear | Fast | Yes | No | Yes | Quick viz, preprocessing |
| **t-SNE** | Non-linear | Slow | No | Yes | No | Beautiful visualizations |
| **UMAP** | Non-linear | Fast | Better | Yes | Yes | Large datasets, production |
| **MDS** | Linear/Non-linear | Slow | Yes | Moderate | No | Global distances |
| **LDA** | Linear | Fast | Yes (supervised) | No | Yes | Classification viz |
| **Autoencoders** | Non-linear | Moderate | Moderate | Moderate | Yes | Feature learning |

## Tips & Best Practices

### Preprocessing
```python
# Always standardize features
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# For very high dimensions, use PCA first
from sklearn.decomposition import PCA
if X.shape[1] > 50:
    pca = PCA(n_components=50)
    X_scaled = pca.fit_transform(X_scaled)
```

### Hyperparameter Tuning
```python
# General guidelines:

# Perplexity:
# - Small datasets (< 100): 5-10
# - Medium datasets (100-5000): 20-50
# - Large datasets (> 5000): 30-100
# - Rule: perplexity < n_samples / 3

# Learning rate:
# - Auto (recommended): learning_rate='auto'
# - Manual: 10-1000, typical 100-500
# - If n_samples < 10000: n_samples / 12

# Iterations:
# - Minimum: 250
# - Typical: 1000
# - Publication-quality: 3000-5000
```

### Multiple Runs
```python
# t-SNE is stochastic - run multiple times
fig, axes = plt.subplots(2, 3, figsize=(15, 10))
axes = axes.ravel()

for i in range(6):
    tsne = TSNE(n_components=2, perplexity=30, n_iter=1000, random_state=i)
    X_tsne = tsne.fit_transform(X)

    axes[i].scatter(X_tsne[:, 0], X_tsne[:, 1], c=y, cmap='tab10', alpha=0.6)
    axes[i].set_title(f'Run {i+1} (KL={tsne.kl_divergence_:.2f})')

plt.tight_layout()
plt.show()

# Choose run with lowest KL divergence
```

### Saving Results
```python
# t-SNE cannot transform new data
# Save embeddings for reproducibility

import pickle

# Save embedding
with open('tsne_embedding.pkl', 'wb') as f:
    pickle.dump({
        'embedding': X_tsne,
        'labels': y,
        'kl_divergence': tsne.kl_divergence_,
        'params': {
            'perplexity': 30,
            'learning_rate': 200,
            'n_iter': 1000
        }
    }, f)

# Load later
with open('tsne_embedding.pkl', 'rb') as f:
    data = pickle.load(f)
    X_tsne = data['embedding']
```

## Common Pitfalls

1. **Over-interpreting cluster sizes**: Sizes can be artifacts
2. **Comparing different runs**: Each run produces different layouts
3. **Using for clustering**: Cluster first, then visualize
4. **Ignoring perplexity**: Try multiple values
5. **Too few iterations**: Need at least 1000 for convergence
6. **Not preprocessing**: Always standardize first
7. **Large datasets**: Use UMAP or subsample
8. **Expecting .transform()**: t-SNE doesn't support this

## Quick Reference

```python
# Standard t-SNE workflow
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt

# 1. Preprocess
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 2. Optional PCA (if high-dimensional)
if X_scaled.shape[1] > 50:
    pca = PCA(n_components=50)
    X_scaled = pca.fit_transform(X_scaled)

# 3. Apply t-SNE
tsne = TSNE(
    n_components=2,
    perplexity=30,
    learning_rate='auto',
    n_iter=1000,
    init='pca',
    random_state=42
)
X_tsne = tsne.fit_transform(X_scaled)

# 4. Visualize
plt.figure(figsize=(10, 8))
plt.scatter(X_tsne[:, 0], X_tsne[:, 1], c=y, cmap='tab10', alpha=0.6)
plt.colorbar()
plt.title('t-SNE Visualization')
plt.show()

# 5. Check quality
print(f"KL divergence: {tsne.kl_divergence_:.3f}")
# Lower is better, but absolute value not super meaningful
```
