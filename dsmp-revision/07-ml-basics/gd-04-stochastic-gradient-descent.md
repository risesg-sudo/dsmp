# Stochastic Gradient Descent (SGD)

## What You'll Learn

Stochastic Gradient Descent revolutionized machine learning by making it possible to train models on massive datasets. Instead of using all data at once, SGD updates parameters after each single example. You'll learn why this "noisy" approach actually works better for many problems and when to use it.

## Core Concept

Stochastic Gradient Descent uses **only ONE randomly selected training example** to compute the gradient and update parameters.

**The key difference:** One sample = one gradient computation = one parameter update.

## Algorithm

```
Initialize: β = zeros or random

For each epoch:
  1. Shuffle training data randomly

  2. For each sample i in {1, 2, ..., n}:

     a. Pick one sample (xᵢ, yᵢ)

     b. Compute prediction for this sample:
        ŷᵢ = xᵢᵀβ

     c. Compute gradient using only this sample:
        ∇J = xᵢ(ŷᵢ - yᵢ)

     d. Update parameters immediately:
        β := β - α∇J

  3. Check convergence (after full epoch)
```

**Key insight:** The gradient from one sample is a **noisy estimate** of the true gradient, but on average it points in the right direction.

## How It Works: Step by Step

Let's trace SGD through one epoch with a small dataset.

**Given:**
- Dataset: 4 samples
- Learning rate: α = 0.01
- Current parameters: β

**Iteration 1:** Use sample 3
```python
x = X[2]  # Single sample (1D array)
y_true = y[2]  # Single target value

prediction = x @ beta  # Scalar
error = prediction - y_true
gradient = x * error  # Element-wise

beta = beta - learning_rate * gradient
# Parameters updated after just ONE sample!
```

**Iteration 2:** Use sample 1
```python
x = X[0]
y_true = y[0]
# ... repeat process
# Another parameter update
```

**Iterations 3-4:** Process remaining samples

After one epoch (4 updates), we've done the equivalent of 4 batch GD iterations in terms of parameter updates, but with much less computation per update.

## Implementation

```python
import numpy as np

def stochastic_gradient_descent(X, y, learning_rate=0.01, epochs=50):
    """
    Stochastic Gradient Descent for Linear Regression

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
        # Shuffle data each epoch (important!)
        indices = np.random.permutation(n)

        for i in indices:
            # Use only ONE sample
            xi = X[i:i+1]  # Keep 2D shape for matrix mult
            yi = y[i:i+1]

            # Predict for this sample
            prediction = xi @ beta

            # Gradient from this ONE sample
            gradient = xi.T @ (prediction - yi)

            # Update parameters
            beta = beta - learning_rate * gradient.flatten()

        # Track cost on full dataset (for monitoring)
        predictions = X @ beta
        cost = (1/(2*n)) * np.sum((predictions - y)**2)
        cost_history.append(cost)

    return beta, cost_history
```

## Convergence Path

SGD follows a noisy, zigzagging path to the minimum:

```
Cost vs Updates

Batch GD:               Stochastic GD:
    ‾\                      \|/|\/
      \___                   \/|/\
          \___                 X|
              ↓                 \/↓
            Smooth            Noisy/Zigzag
```

**Characteristics:**
- **Noisy updates:** Cost may increase on individual updates
- **Zigzag path:** Oscillates around minimum
- **Never truly converges:** Keeps bouncing around optimal solution
- **Stochastic:** Different path each run

## Advantages

**1. Extremely Fast Updates**
- Updates parameters n times per epoch (vs once for batch GD)
- Each update uses just one sample (very fast)
- Can start learning immediately

**2. Scales to Large Datasets**
- Works with millions or billions of samples
- Memory efficient (only one sample at a time)
- Doesn't need entire dataset in RAM

**3. Can Escape Local Minima**
- Noise helps jump out of poor local solutions
- Beneficial for non-convex optimization
- Exploration vs exploitation balance

**4. Enables Online Learning**
- Can update model as new data arrives
- Streaming data support
- Adaptive to changing distributions

**5. Often Faster Convergence**
- More frequent updates can find solution faster
- Especially true for redundant datasets
- Good enough solution reached quickly

## Disadvantages

**1. Noisy Gradient Estimates**
- Single sample may not represent overall trend
- High variance in gradient estimates
- Erratic convergence path

**2. Never Truly Converges**
- Oscillates around minimum instead of settling
- Need to decay learning rate for convergence
- Or use average of last k parameters

**3. Requires Careful Tuning**
- Learning rate is critical
- Too high: diverges
- Too low: painfully slow

**4. Loses Vectorization Benefits**
- Processing one sample at a time
- Can't leverage matrix optimizations as well
- May be slower on modern hardware

**5. Harder to Parallelize**
- Sequential updates
- Difficult to distribute across GPUs
- Less efficient on modern hardware

## When to Use SGD

**Use SGD when:**

1. **Massive datasets** (n > 1,000,000)
   - Batch GD too slow
   - Can't fit all data in memory

2. **Online/streaming learning**
   - Data arrives continuously
   - Need to update model in real-time
   - Adaptive systems

3. **Non-convex optimization**
   - Deep learning
   - Need noise to escape local minima
   - Want exploration capability

4. **Quick prototyping**
   - Need fast initial results
   - "Good enough" solution acceptable
   - Time-constrained experiments

5. **Sparse data**
   - Most features are zero
   - Single samples very efficient
   - Text processing, recommendation systems

**Don't use SGD when:**

1. **Small datasets** (n < 1,000)
   - Overhead not worth it
   - Batch GD is fine

2. **Need stable convergence**
   - Research requiring reproducibility
   - Precise optimization needed

3. **Very noisy data**
   - Already high variance
   - SGD adds more noise

## Practical Techniques

### 1. Learning Rate Decay

Since SGD oscillates, decay learning rate over time:

```python
def sgd_with_decay(X, y, initial_lr=0.1, epochs=50, decay_rate=0.95):
    n, p = X.shape
    beta = np.zeros(p)
    learning_rate = initial_lr

    for epoch in range(epochs):
        # Decay learning rate
        learning_rate *= decay_rate

        indices = np.random.permutation(n)
        for i in indices:
            xi = X[i:i+1]
            yi = y[i:i+1]
            prediction = xi @ beta
            gradient = xi.T @ (prediction - yi)
            beta = beta - learning_rate * gradient.flatten()

    return beta
```

### 2. Shuffling

Always shuffle data each epoch:

```python
# Good: Random order each epoch
indices = np.random.permutation(n)

# Bad: Same order every epoch
# Can get stuck in cycles
```

### 3. Averaging for Stability

Average last k parameter vectors:

```python
# Save last 10 parameter vectors
recent_betas = []

# In training loop:
recent_betas.append(beta.copy())
if len(recent_betas) > 10:
    recent_betas.pop(0)

# Final model: average
beta_final = np.mean(recent_betas, axis=0)
```

## Comparison Example

```python
import time

# Large dataset
X, y = make_regression(n_samples=100000, n_features=20, noise=10)
X_scaled = StandardScaler().fit_transform(X)

# Batch GD
start = time.time()
beta_batch, _ = batch_gradient_descent(X_scaled, y, iterations=100)
batch_time = time.time() - start

# Stochastic GD
start = time.time()
beta_sgd, _ = stochastic_gradient_descent(X_scaled, y, epochs=10)
sgd_time = time.time() - start

print(f"Batch GD: {batch_time:.2f}s")
print(f"Stochastic GD: {sgd_time:.2f}s")
# SGD typically 10-100x faster!
```

## Common Pitfalls

**Pitfall 1: Not shuffling data**
```
Samples in order → learns pattern in sequence → poor generalization
Solution: Always shuffle at start of each epoch
```

**Pitfall 2: Learning rate too high**
```
Oscillations grow → divergence
Solution: Start with 0.01, decay over time
```

**Pitfall 3: Judging convergence by single updates**
```
Individual updates are noisy → can't judge convergence
Solution: Evaluate on full dataset periodically
```

**Pitfall 4: Not decaying learning rate**
```
Constant LR → keeps oscillating, never settles
Solution: Use learning rate schedule
```

## Quick Reference

**Key characteristics:**
- Uses ONE sample per update
- Noisy but fast convergence
- Best for large datasets
- Enables online learning

**Typical hyperparameters:**
```
Initial learning rate: 0.01 to 0.1
Decay rate:           0.95 to 0.99
Epochs:               10 to 100
```

**Complexity per epoch:**
- Time: O(np) (same as batch, but n updates vs 1)
- Space: O(p) (constant, very memory efficient)

**Key trick:** Learning rate decay is essential for convergence!

---

## Navigation

**Previous:** [Batch Gradient Descent](gd-03-batch-gradient-descent.md)

**Next:** [Mini-Batch & Comparison](gd-05-minibatch-comparison.md)

**Series:**
- [Introduction and Intuition](gd-01-introduction-intuition.md)
- [Mathematical Formulation](gd-02-mathematical-formulation.md)
- [Batch Gradient Descent](gd-03-batch-gradient-descent.md)
- Stochastic Gradient Descent (this file)
- [Mini-Batch & Comparison](gd-05-minibatch-comparison.md)
- [Learning Rate](gd-06-learning-rate.md)
- [Convergence](gd-07-convergence.md)
- [Implementation](gd-08-implementation.md)
- [Advanced Optimizers](gd-09-advanced-optimizers.md)
- [Interview Guide](gd-10-interview-guide.md)
