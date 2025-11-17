# Batch Gradient Descent

## What You'll Learn

Batch Gradient Descent is the classical form of gradient descent that uses all training data in each iteration. You'll learn how it works, when to use it, and understand its strengths and limitations. This foundational variant sets the stage for understanding more advanced techniques.

## Core Concept

Batch Gradient Descent computes the gradient using **every single training example** before making one parameter update. It's called "batch" because it processes the entire batch of data at once.

**The defining characteristic:** One full pass through all n samples = one gradient computation = one parameter update.

## Algorithm

```
Initialize: β = zeros or random

For each iteration:
  1. Compute predictions for ALL n samples:
     ŷ = Xβ

  2. Compute gradient using ALL samples:
     ∇J = (1/n) Σᵢ₌₁ⁿ ∇Jᵢ
        = (1/n) Xᵀ(ŷ - y)

  3. Update parameters:
     β := β - α∇J

  4. Check convergence
```

**Key insight:** The gradient is the **average** of gradients from all training examples.

## How It Works: Step by Step

Let's trace through one iteration with a small dataset.

**Given:**
- Dataset: 4 samples
- Features: X (4 × 3 matrix)
- Target: y (4 × 1 vector)
- Current parameters: β
- Learning rate: α = 0.01

**Step 1: Compute predictions (vectorized)**
```python
predictions = X @ beta  # All 4 predictions at once
# Shape: (4, 3) @ (3, 1) = (4, 1)
```

**Step 2: Compute errors**
```python
errors = predictions - y  # All 4 errors at once
# Shape: (4, 1)
```

**Step 3: Compute gradient**
```python
gradient = (1/n) * X.T @ errors
# Shape: (3, 4) @ (4, 1) = (3, 1)
# This averages gradients from all 4 samples
```

**Step 4: Update parameters**
```python
beta = beta - learning_rate * gradient
# Shape: (3, 1)
# Single update using information from all samples
```

## Implementation

```python
import numpy as np

def batch_gradient_descent(X, y, learning_rate=0.01, iterations=1000):
    """
    Batch Gradient Descent for Linear Regression

    Parameters:
    -----------
    X : array-like, shape (n_samples, n_features)
        Training data
    y : array-like, shape (n_samples,)
        Target values
    learning_rate : float
        Step size for gradient descent
    iterations : int
        Number of iterations to run

    Returns:
    --------
    beta : array, shape (n_features,)
        Learned parameters
    cost_history : list
        Cost at each iteration
    """
    n, p = X.shape
    beta = np.zeros(p)
    cost_history = []

    for i in range(iterations):
        # Predict for ALL samples
        predictions = X @ beta

        # Compute cost
        cost = (1/(2*n)) * np.sum((predictions - y)**2)
        cost_history.append(cost)

        # Compute gradient using ALL samples
        gradient = (1/n) * X.T @ (predictions - y)

        # Update parameters
        beta = beta - learning_rate * gradient

    return beta, cost_history
```

## Convergence Path

Batch gradient descent follows a smooth, deterministic path to the minimum:

```
Cost vs Iterations

J(β)
  ↑
  |‾\
  |  \___
  |      \____
  |          \____
  |______________\______→ iterations
        Smooth decrease
```

**Characteristics:**
- **Monotonic decrease:** Cost decreases at every iteration (if α is small enough)
- **Smooth convergence:** No noise or oscillations
- **Deterministic:** Same path every time with same initialization
- **Predictable:** Easy to monitor and debug

## Advantages

**1. Stable and Accurate Gradient**
- Uses all data points, so gradient is exact (not an estimate)
- Less noise compared to stochastic methods
- Reliable direction toward minimum

**2. Smooth Convergence**
- Monotonic decrease in cost
- Predictable convergence behavior
- Easy to set convergence criteria

**3. Guaranteed Convergence**
- For convex functions (like linear regression), guaranteed to find global minimum
- With appropriate learning rate, will converge

**4. Vectorization Efficient**
- Matrix operations are highly optimized
- Can leverage GPU/CPU vectorization
- All samples processed in parallel

**5. Deterministic**
- Same initial conditions → same result
- Reproducible results
- Easier debugging

## Disadvantages

**1. Slow for Large Datasets**
- Must process all n samples before one update
- Memory intensive (all data must fit in RAM)
- One iteration with n=1M takes much longer than with n=1000

**2. Redundant Computation**
- If data has similar samples, computes similar gradients many times
- Wasteful when dataset has redundancy

**3. Cannot Handle Streaming Data**
- Needs entire dataset at once
- Not suitable for online learning
- Cannot update model as new data arrives

**4. Can Get Stuck in Local Minima**
- For non-convex problems, may settle in local minimum
- No noise to help escape poor local solutions

**5. Memory Requirements**
- Must load entire dataset into memory
- Matrix operations require O(np) space
- Problematic for very large datasets

## When to Use Batch Gradient Descent

**Use Batch GD when:**

1. **Small to medium datasets** (n < 10,000)
   - Fast enough to be practical
   - Stable convergence is beneficial

2. **You need deterministic, reproducible results**
   - Research settings
   - Debugging
   - Baseline comparisons

3. **Memory is not a constraint**
   - You can fit all data in RAM
   - Have sufficient computational resources

4. **You want smooth convergence**
   - Need to understand convergence behavior
   - Monitoring and debugging training

5. **Convex optimization problems**
   - Linear regression
   - Logistic regression
   - Where guaranteed global optimum matters

**Don't use Batch GD when:**

1. **Large datasets** (n > 100,000)
   - Too slow
   - Consider mini-batch or stochastic GD

2. **Online/streaming data**
   - Data arrives continuously
   - Need incremental updates

3. **Limited memory**
   - Cannot load full dataset
   - Use stochastic or mini-batch

4. **Non-convex optimization with local minima**
   - Might benefit from noise in SGD
   - Consider stochastic variants

## Practical Example

```python
from sklearn.datasets import make_regression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

# Generate data
X, y = make_regression(n_samples=1000, n_features=10, noise=20, random_state=42)

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale features (important!)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train with Batch GD
beta, cost_history = batch_gradient_descent(
    X_train_scaled,
    y_train,
    learning_rate=0.01,
    iterations=1000
)

# Evaluate
y_pred = X_test_scaled @ beta
mse = np.mean((y_test - y_pred)**2)
print(f"Test MSE: {mse:.2f}")

# Plot convergence
plt.figure(figsize=(10, 6))
plt.plot(cost_history)
plt.xlabel('Iteration')
plt.ylabel('Cost')
plt.title('Batch Gradient Descent Convergence')
plt.grid(True)
plt.show()
```

## Common Pitfalls

**Pitfall 1: Not scaling features**
```
Unscaled features → elongated cost contours → slow zigzag convergence
Solution: Always use StandardScaler or similar
```

**Pitfall 2: Learning rate too large**
```
Cost increases instead of decreases → divergence
Solution: Reduce learning rate by factor of 10
```

**Pitfall 3: Trying with huge datasets**
```
n=1,000,000 → each iteration takes forever
Solution: Use mini-batch gradient descent instead
```

**Pitfall 4: Not monitoring cost**
```
Can't tell if converging, diverging, or stuck
Solution: Always plot cost vs iterations
```

## Quick Reference

**Key characteristics:**
- Uses ALL n samples per iteration
- Smooth, deterministic convergence
- Best for small-medium datasets
- Standard choice for convex optimization

**Typical hyperparameters:**
```
Learning rate:  0.001 to 0.1 (start with 0.01)
Iterations:     100 to 10,000
Convergence:    ε = 1e-6 or 1e-8
```

**Complexity:**
- Time per iteration: O(np)
- Total time: O(knp) where k = iterations
- Space: O(np)

---

## Navigation

**Previous:** [Mathematical Formulation](gd-02-mathematical-formulation.md)

**Next:** [Stochastic Gradient Descent](gd-04-stochastic-gradient-descent.md)

**Series:**
- [Introduction and Intuition](gd-01-introduction-intuition.md)
- [Mathematical Formulation](gd-02-mathematical-formulation.md)
- Batch Gradient Descent (this file)
- [Stochastic Gradient Descent](gd-04-stochastic-gradient-descent.md)
- [Mini-Batch & Comparison](gd-05-minibatch-comparison.md)
- [Learning Rate](gd-06-learning-rate.md)
- [Convergence](gd-07-convergence.md)
- [Implementation](gd-08-implementation.md)
- [Advanced Optimizers](gd-09-advanced-optimizers.md)
- [Interview Guide](gd-10-interview-guide.md)
