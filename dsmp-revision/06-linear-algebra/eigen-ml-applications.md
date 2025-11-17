# Eigenvalues, SVD, and PCA in Machine Learning

## What You'll Learn
This is where eigendecomposition, SVD, and PCA transform from abstract mathematics into powerful ML tools. You'll discover how these techniques power dimensionality reduction, visualization, image compression, recommender systems, anomaly detection, and more. Each application shows why linear algebra is the backbone of modern machine learning.

---

## 1. Dimensionality Reduction

PCA is the go-to method for reducing feature dimensions while preserving information.

### The Problem

```
High-dimensional data:
- 1000+ features
- Curse of dimensionality
- Overfitting risk
- Slow training
- Hard to visualize

Solution: PCA reduces to 50-100 features keeping 95%+ variance
```

### MNIST Digits Example

```python
from sklearn.decomposition import PCA
from sklearn.datasets import load_digits
from sklearn.svm import SVC
import time

# Load data: 64 pixels per digit
digits = load_digits()
X = digits.data  # (1797, 64)
y = digits.target

# Original: Train on all 64 features
clf_full = SVC()
start = time.time()
clf_full.fit(X, y)
time_full = time.time() - start
score_full = clf_full.score(X, y)

print(f"Full features (64): {score_full:.3f} accuracy in {time_full:.2f}s")

# PCA: Reduce to 20 components
pca = PCA(n_components=20)
X_reduced = pca.fit_transform(X)  # (1797, 20)

print(f"Variance explained: {pca.explained_variance_ratio_.sum():.1%}")

# Train on reduced features
clf_pca = SVC()
start = time.time()
clf_pca.fit(X_reduced, y)
time_pca = time.time() - start
score_pca = clf_pca.score(X_reduced, y)

print(f"PCA features (20): {score_pca:.3f} accuracy in {time_pca:.2f}s")
print(f"Speedup: {time_full/time_pca:.1f}x faster")

# Results:
# - Similar accuracy
# - 3-5x faster training
# - Less overfitting on test set
# - Much easier to work with
```

---

## 2. Data Visualization

PCA enables visualization of high-dimensional data in 2D/3D.

### Visualize High-Dimensional Data

```python
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sklearn.datasets import load_iris

# Load iris: 4 features
iris = load_iris()
X = iris.data
y = iris.target

# Reduce to 2D for visualization
pca = PCA(n_components=2)
X_2d = pca.fit_transform(X)

# Plot
plt.figure(figsize=(10, 6))
colors = ['red', 'green', 'blue']
for i in range(3):
    plt.scatter(X_2d[y == i, 0], X_2d[y == i, 1],
                c=colors[i], label=iris.target_names[i])

plt.xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.1%} variance)')
plt.ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.1%} variance)')
plt.title('Iris Dataset - PCA Projection')
plt.legend()
plt.grid(True)
plt.show()

# Can see cluster structure in 2D!
```

### t-SNE Preprocessing

```python
from sklearn.manifold import TSNE

# High-dimensional data (10,000 features)
# t-SNE is VERY slow on high dimensions

# Step 1: PCA to ~50 dimensions
pca = PCA(n_components=50)
X_pca = pca.fit_transform(X)

# Step 2: t-SNE on reduced data (much faster!)
tsne = TSNE(n_components=2)
X_2d = tsne.fit_transform(X_pca)

# Speedup: 10-100x faster than direct t-SNE
```

---

## 3. Image Compression

SVD provides optimal low-rank approximation for compression.

### Compress Grayscale Image

```python
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt

# Load grayscale image
img = np.array(Image.open('image.jpg').convert('L'))
print(f"Original shape: {img.shape}")  # e.g., (512, 512)

# SVD
U, S, Vt = np.linalg.svd(img, full_matrices=False)

# Compress: keep top k singular values
k = 50
img_compressed = U[:, :k] @ np.diag(S[:k]) @ Vt[:k, :]

# Compute compression ratio
original_size = img.shape[0] * img.shape[1]
compressed_size = k * (img.shape[0] + img.shape[1] + 1)
ratio = compressed_size / original_size

print(f"Compression ratio: {ratio:.1%} of original")
print(f"Variance preserved: {(S[:k]**2).sum() / (S**2).sum():.1%}")

# Visualize
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
axes[0].imshow(img, cmap='gray')
axes[0].set_title('Original')

axes[1].imshow(img_compressed, cmap='gray')
axes[1].set_title(f'Compressed (k={k})')

# Difference
axes[2].imshow(np.abs(img - img_compressed), cmap='hot')
axes[2].set_title('Difference')

plt.show()

# Try different k values
for k in [10, 25, 50, 100]:
    img_k = U[:, :k] @ np.diag(S[:k]) @ Vt[:k, :]
    error = np.linalg.norm(img - img_k, 'fro') / np.linalg.norm(img, 'fro')
    print(f"k={k:3d}: {error:.1%} error")
```

---

## 4. Collaborative Filtering (Recommender Systems)

SVD powers matrix factorization for recommendations.

### Movie Recommendations

```python
# User-Item rating matrix
# Rows: users, Columns: items, Values: ratings (0 = not rated)
R = np.array([
    [5, 3, 0, 1],  # User 1
    [4, 0, 0, 1],  # User 2
    [1, 1, 0, 5],  # User 3
    [1, 0, 0, 4],  # User 4
])

# SVD
U, S, Vt = np.linalg.svd(R, full_matrices=False)

# Low-rank approximation (latent factors)
k = 2
R_approx = U[:, :k] @ np.diag(S[:k]) @ Vt[:k, :]

print("Original ratings:")
print(R)

print(f"\nPredicted ratings (k={k}):")
print(R_approx)

# Fill in missing ratings!
print(f"\nUser 1, Item 3 (was 0): {R_approx[0, 2]:.2f}")
print(f"User 2, Item 2 (was 0): {R_approx[1, 1]:.2f}")

# Interpretation:
# - U: User features (user preferences)
# - Vt: Item features (item characteristics)
# - Low rank captures latent factors (genres, etc.)
```

---

## 5. Anomaly Detection

PCA reconstruction error identifies outliers.

### Detect Anomalies

```python
from sklearn.decomposition import PCA

# Normal data
X_normal = np.random.randn(1000, 10)

# Train PCA on normal data
pca = PCA(n_components=5)  # Keep 5 components
pca.fit(X_normal)

# Function to detect anomalies
def is_anomaly(x, pca, threshold=3.0):
    """
    Detect if x is anomaly based on reconstruction error.
    """
    x = x.reshape(1, -1)

    # Project and reconstruct
    x_reduced = pca.transform(x)
    x_reconstructed = pca.inverse_transform(x_reduced)

    # Reconstruction error
    error = np.linalg.norm(x - x_reconstructed)

    return error > threshold, error

# Test on normal points
normal_point = np.random.randn(10)
is_anom, error = is_anomaly(normal_point, pca)
print(f"Normal point: anomaly={is_anom}, error={error:.2f}")

# Test on anomalous point
anomalous_point = np.random.randn(10) * 5  # Larger scale
is_anom, error = is_anomaly(anomalous_point, pca)
print(f"Anomalous point: anomaly={is_anom}, error={error:.2f}")

# Anomalies have high reconstruction error
# (They don't fit the normal pattern)
```

---

## 6. Feature Extraction (Eigenfaces)

PCA creates features that capture maximum variance.

### Eigenfaces for Face Recognition

```python
# Face images as vectors
# Each face: 100×100 = 10,000 dimensions!

# Simplified example
n_faces = 400
face_images = np.random.randn(n_faces, 10000)  # Placeholder

# PCA to extract eigenfaces
pca = PCA(n_components=100)
pca.fit(face_images)

# Eigenfaces = principal components
eigenfaces = pca.components_  # (100, 10000)

# Each face ≈ mean_face + Σ(weight_i × eigenface_i)
mean_face = pca.mean_

# Encode new face
new_face = np.random.randn(10000)  # Placeholder
weights = pca.transform(new_face.reshape(1, -1))

# Recognition: Compare weights
# Similar weights → similar faces
```

---

## 7. Noise Reduction (Denoising)

PCA filters noise by keeping high-variance components.

### Denoise Data

```python
# Clean signal + noise
signal = np.sin(np.linspace(0, 10, 100))
noise = np.random.randn(100) * 0.5
X = signal + noise

# Add more features (time lags)
X_features = np.column_stack([
    X,
    np.roll(X, 1),
    np.roll(X, 2)
])  # (100, 3)

# PCA: Keep only top component
pca = PCA(n_components=1)
X_reduced = pca.fit_transform(X_features)
X_denoised_features = pca.inverse_transform(X_reduced)

X_denoised = X_denoised_features[:, 0]

# Plot
import matplotlib.pyplot as plt
plt.plot(signal, 'g-', label='True signal')
plt.plot(X, 'r.', alpha=0.5, label='Noisy data')
plt.plot(X_denoised, 'b-', label='Denoised')
plt.legend()
plt.show()

# PCA separates signal (high variance) from noise (low variance)
```

---

## 8. Whitening (Decorrelation)

PCA whitening creates uncorrelated, unit-variance features.

### Whiten Features

```python
from sklearn.decomposition import PCA

# Correlated features
X = np.random.randn(1000, 5)
X[:, 1] = X[:, 0] + np.random.randn(1000) * 0.1  # Highly correlated

# Check correlation
print("Original correlation:")
print(np.corrcoef(X.T))
# High off-diagonal values

# PCA whitening
pca = PCA(whiten=True)
X_whitened = pca.fit_transform(X)

# Check correlation after whitening
print("\nWhitened correlation:")
print(np.corrcoef(X_whitened.T))
# Nearly identity matrix!

# Properties of whitened data:
# 1. Zero mean
# 2. Unit variance
# 3. Uncorrelated (diagonal covariance)

print(f"\nMean: {np.mean(X_whitened, axis=0)}")  # ≈ [0, 0, 0, 0, 0]
print(f"Variance: {np.var(X_whitened, axis=0)}")  # ≈ [1, 1, 1, 1, 1]
```

---

## Summary

**Key ML Applications**

1. **Dimensionality Reduction**
   - Reduce features while keeping variance
   - Faster training, less overfitting
   - Standard preprocessing step

2. **Visualization**
   - Project high-dim data to 2D/3D
   - Discover clusters and patterns
   - Preprocess for t-SNE

3. **Image Compression**
   - SVD for optimal low-rank approximation
   - Trade compression vs quality
   - JPEG uses similar techniques

4. **Recommender Systems**
   - Matrix factorization
   - Predict missing ratings
   - Collaborative filtering

5. **Anomaly Detection**
   - High reconstruction error = anomaly
   - Learn normal patterns
   - Detect outliers

6. **Feature Extraction**
   - PCA creates new features
   - Eigenfaces for recognition
   - Maximum variance features

7. **Noise Reduction**
   - Filter low-variance components
   - Keep signal, remove noise
   - Data cleaning

8. **Whitening**
   - Decorrelate features
   - Normalize variance
   - Preprocessing for neural networks

**When to Use What**

```
PCA: Standard dimensionality reduction
SVD: Matrix approximation, recommenders
Eigenfaces: Face/image recognition
Whitening: Neural network preprocessing
Anomaly detection: Fraud, intrusion detection
```

---

**Related Topics:**
- [PCA Fundamentals](./pca-fundamentals.md) - PCA theory and implementation
- [SVD Basics](./svd-basics.md) - SVD decomposition
- [Interview Questions](./eigen-interview-questions.md) - Test your knowledge
