# Mini-Batch Gradient Descent and Comparison

## What You'll Learn

Mini-batch gradient descent combines the best aspects of batch and stochastic methods. It's the workhorse of modern deep learning and the default choice for most applications. You'll learn how it works, why it's superior in practice, and how to choose the right batch size.

## Core Concept

Mini-Batch Gradient Descent uses a **small subset (batch) of training data** to compute the gradient and update parameters.

**The sweet spot:** Neither one sample nor all samples, but a carefully chosen middle ground (typically 32-256 samples).

## Algorithm

```
Initialize: β = zeros or random
Set: batch_size (typically 32, 64, 128, or 256)

For each epoch:
  1. Shuffle training data randomly

  2. Divide data into mini-batches of size batch_size

  3. For each mini-batch:

     a. Get batch samples: X_batch, y_batch

     b. Compute predictions for batch:
        ŷ_batch = X_batch @ β

     c. Compute gradient using batch:
        ∇J = (1/m) X_batchᵀ(ŷ_batch - y_batch)
        where m = batch_size

     d. Update parameters:
        β := β - α∇J

  4. Check convergence (after full epoch)
```

**Key insight:** The gradient is averaged over m samples (not 1, not n, but m).

## Implementation

```python
import numpy as np

def mini_batch_gradient_descent(X, y, learning_rate=0.01,
                                epochs=50, batch_size=32):
    """
    Mini-Batch Gradient Descent for Linear Regression

    Parameters:
    -----------
    X : array-like, shape (n_samples, n_features)
        Training data
    y : array-like, shape (n_samples,)
        Target values
    learning_rate : float
        Step size for gradient descent
    epochs : int
        Number of passes through the data
    batch_size : int
        Number of samples per mini-batch

    Returns:
    --------
    beta : array, shape (n_features,)
        Learned parameters
    cost_history : list
        Cost after each epoch
    """
    n, p = X.shape
    beta = np.zeros(p)
    cost_history = []

    for epoch in range(epochs):
        # Shuffle data
        indices = np.random.permutation(n)

        for i in range(0, n, batch_size):
            # Get mini-batch indices
            batch_indices = indices[i:i+batch_size]

            # Get mini-batch data
            X_batch = X[batch_indices]
            y_batch = y[batch_indices]

            # Predict for batch
            predictions = X_batch @ beta

            # Gradient from batch (average over batch)
            m = len(batch_indices)
            gradient = (1/m) * X_batch.T @ (predictions - y_batch)

            # Update parameters
            beta = beta - learning_rate * gradient

        # Track cost on full dataset
        predictions = X @ beta
        cost = (1/(2*n)) * np.sum((predictions - y)**2)
        cost_history.append(cost)

    return beta, cost_history
```

## Why Mini-Batch is Best

Mini-batch gradient descent hits the sweet spot between batch and stochastic:

**1. Reduced Variance (vs SGD)**
- Averaging over m samples smooths out noise
- More stable gradient estimates
- Less erratic convergence

**2. Computational Efficiency**
- Vectorized operations on batches
- GPU optimization (batches fit in GPU memory)
- Better hardware utilization

**3. Scalability (vs Batch)**
- Doesn't need entire dataset in memory
- Works with large datasets
- Frequent parameter updates

**4. Generalization**
- Some noise helps escape sharp minima
- Better generalization than pure batch GD
- Regularization effect from noise

## Convergence Behavior

```
Cost vs Updates

Batch GD:          Stochastic GD:      Mini-Batch GD:
    ‾\                 \|/|\/              ‾\_
      \___              \/|/\                \_/‾\__
          \___            X|                      \__
              ↓            \/↓                       ↓
           Smooth         Noisy              Balanced!
```

Mini-batch combines smooth overall trend with mild fluctuations that aid exploration.

## Choosing Batch Size

**Common choices:** 32, 64, 128, 256

### Trade-offs

**Smaller batches (16-32):**
- More noise (regularization effect)
- Better generalization
- More frequent updates
- Fits in memory easily
- Slower per epoch

**Larger batches (128-256):**
- Less noise (smoother convergence)
- More stable training
- Better GPU utilization
- Faster per epoch
- May generalize worse

### Practical Guidelines

**Start with 32**, then:
- Increase if you have large GPU memory
- Decrease if running out of memory
- Use powers of 2 for GPU efficiency (32, 64, 128, 256)

```python
# Rule of thumb based on dataset size
if n < 1000:
    batch_size = 32
elif n < 10000:
    batch_size = 64
elif n < 100000:
    batch_size = 128
else:
    batch_size = 256
```

## Comprehensive Comparison

### Feature Comparison Table

| Feature | Batch GD | Stochastic GD | Mini-Batch GD |
|---------|----------|---------------|---------------|
| **Samples per update** | All (n) | 1 | m (32-256) |
| **Updates per epoch** | 1 | n | n/m |
| **Speed per update** | Slow | Fast | Medium |
| **Convergence** | Smooth | Noisy | Moderate |
| **Memory usage** | High | Low | Medium |
| **Final accuracy** | Best | Oscillates | Good |
| **GPU efficiency** | Poor (too large) | Poor (too small) | Excellent |
| **Generalization** | Good | Very good | Very good |
| **Typical use** | Small data | Rare | **Most common** |
| **Deep learning** | No | Rare | **Standard** |

### When to Use Each

**Batch Gradient Descent:**
```
Use when:
- n < 10,000 (small datasets)
- Need deterministic results
- Research/debugging
- Convex optimization

Avoid when:
- Large datasets
- Limited memory
- Need online learning
```

**Stochastic Gradient Descent:**
```
Use when:
- n > 1,000,000 (massive datasets)
- Online/streaming data
- Memory extremely limited
- Need maximum speed

Avoid when:
- Small datasets
- Need stable convergence
- Vectorization important
```

**Mini-Batch Gradient Descent:**
```
Use when:
- Any medium to large dataset
- Deep learning
- GPU available
- Default choice!

Avoid when:
- Extremely small datasets (n < 100)
- Very limited memory (use SGD)
```

### Visual Comparison: Convergence Paths

```
Starting from same point, one epoch of training:

Batch GD (1 update):
    *
     \
      \
       \
        *  ← After 1 update

SGD (n updates):
    *
     \/\/\
      \/\/
       \/
        *  ← After n updates (zigzag path)

Mini-Batch (n/m updates):
    *
     \  /
      \/
       \
        *  ← After n/m updates (balanced)
```

### Practical Example: All Three Methods

```python
from sklearn.datasets import make_regression
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

# Generate data
X, y = make_regression(n_samples=1000, n_features=10, noise=20, random_state=42)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Compare all three methods
methods = {
    'Batch GD': batch_gradient_descent(X_scaled, y, learning_rate=0.01, iterations=100),
    'Stochastic GD': stochastic_gradient_descent(X_scaled, y, learning_rate=0.01, epochs=10),
    'Mini-Batch GD': mini_batch_gradient_descent(X_scaled, y, learning_rate=0.01, epochs=10, batch_size=32)
}

# Plot convergence
plt.figure(figsize=(15, 5))

for i, (name, (beta, cost_history)) in enumerate(methods.items(), 1):
    plt.subplot(1, 3, i)
    plt.plot(cost_history)
    plt.xlabel('Epoch/Iteration')
    plt.ylabel('Cost')
    plt.title(f'{name}')
    plt.grid(True)

plt.tight_layout()
plt.show()

# Compare final performance
for name, (beta, _) in methods.items():
    y_pred = X_scaled @ beta
    mse = np.mean((y - y_pred)**2)
    print(f"{name:20s} MSE: {mse:.2f}")
```

## Best Practices for Mini-Batch GD

**1. Always shuffle data**
```python
# Each epoch
indices = np.random.permutation(n)
X = X[indices]
y = y[indices]
```

**2. Handle last batch**
```python
# Last batch may be smaller than batch_size
# This is OK and handled automatically by slicing
for i in range(0, n, batch_size):
    batch_indices = indices[i:i+batch_size]  # Works even if fewer than batch_size
```

**3. Use appropriate batch size**
```python
# Powers of 2 for GPU efficiency
batch_sizes = [32, 64, 128, 256]  # Common choices
```

**4. Monitor training**
```python
# Compute cost periodically (not every batch)
if epoch % 10 == 0:
    cost = compute_cost(X, y, beta)
    print(f"Epoch {epoch}, Cost: {cost:.4f}")
```

## Common Pitfalls

**Pitfall 1: Batch size too large**
```
Batch size = n → becomes batch GD → slow, may overfit
Solution: Use batch_size << n
```

**Pitfall 2: Batch size = 1**
```
Batch size = 1 → becomes SGD → too noisy
Solution: Use at least 16-32
```

**Pitfall 3: Not shuffling**
```
Same batches every epoch → poor generalization
Solution: Shuffle at start of each epoch
```

**Pitfall 4: Batch size not power of 2**
```
GPU less efficient with odd batch sizes
Solution: Use 32, 64, 128, 256
```

## Quick Reference

**Mini-Batch GD is the default choice:**
- Balanced between batch and stochastic
- Works for most datasets
- GPU-efficient
- Used in all modern deep learning

**Recommended settings:**
```
Batch size:     32 (small data) to 256 (large data)
Learning rate:  0.001 to 0.01
Epochs:         10 to 100
Shuffle:        Every epoch
```

**Decision guide:**
```
Dataset size → Batch size
n < 1,000    → 32
n < 10,000   → 64
n < 100,000  → 128
n ≥ 100,000  → 256
```

---

## Navigation

**Previous:** [Stochastic Gradient Descent](gd-04-stochastic-gradient-descent.md)

**Next:** [Learning Rate](gd-06-learning-rate.md)

**Series:**
- [Introduction and Intuition](gd-01-introduction-intuition.md)
- [Mathematical Formulation](gd-02-mathematical-formulation.md)
- [Batch Gradient Descent](gd-03-batch-gradient-descent.md)
- [Stochastic Gradient Descent](gd-04-stochastic-gradient-descent.md)
- Mini-Batch & Comparison (this file)
- [Learning Rate](gd-06-learning-rate.md)
- [Convergence](gd-07-convergence.md)
- [Implementation](gd-08-implementation.md)
- [Advanced Optimizers](gd-09-advanced-optimizers.md)
- [Interview Guide](gd-10-interview-guide.md)
