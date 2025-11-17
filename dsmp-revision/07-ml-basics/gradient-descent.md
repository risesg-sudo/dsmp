# Gradient Descent - Optimization Algorithm

## Table of Contents
1. [Introduction](#introduction)
2. [Intuition](#intuition)
3. [Mathematical Formulation](#mathematical-formulation)
4. [Types of Gradient Descent](#types-of-gradient-descent)
5. [Learning Rate](#learning-rate)
6. [Convergence](#convergence)
7. [Challenges and Solutions](#challenges-and-solutions)
8. [Implementation](#implementation)
9. [Advanced Optimizers](#advanced-optimizers)
10. [Interview Questions](#interview-questions)

---

## Introduction

**Gradient Descent** is an iterative optimization algorithm used to find the minimum of a function by moving in the direction of steepest descent.

### Why Gradient Descent?

For linear regression, we want to minimize the cost function:
```
J(β) = (1/2n) Σ(yᵢ - ŷᵢ)²
```

**Two approaches:**
1. **Normal Equation:** β = (XᵀX)⁻¹XᵀY
   - Direct solution
   - O(n³) complexity - slow for large datasets
   - Fails if XᵀX is singular

2. **Gradient Descent:** β := β - α∇J(β)
   - Iterative solution
   - O(kn) complexity - works with large datasets
   - Always works (no matrix inversion)

---

## Intuition

### The Hill Analogy

Imagine you're on a foggy mountain and want to reach the valley (minimum):

```
        *  ← You are here (high cost)
       / \
      /   \
     /     \
    /       \
   /         \
  /     o     \  ← Goal: valley (minimum cost)
 /_____________\
```

**Strategy:**
1. Look around (compute gradient)
2. Find steepest downward direction
3. Take a step down (update parameters)
4. Repeat until you reach the valley (minimum)

### Visual Representation

```
Cost J(β)
    ↑
    |     *           * ← Start points
    |    /|\        /
    |   / | \      /
    |  /  |  \    /
    | /   |   \  /
    |/    v    \/
    |___________o______→ β
               ↑
          Global minimum
```

**Key Idea:** Move opposite to gradient (steepest ascent) to go downhill.

### 1D Example

```
J(β) = β²

J(β)
  ↑
  |  \         /
  |   \       /
  |    \     /
  |     \   /
  |      \ /
  |_______o________→ β
          0
  Start at β = 3:
  Step 1: β = 3 - α(2×3) = 3 - 6α
  Step 2: β = (3-6α) - α(2×(3-6α))
  ...
  Converges to β = 0
```

---

## Mathematical Formulation

### General Update Rule

```
β := β - α∇J(β)

Where:
β = parameter vector [β₀, β₁, β₂, ..., βₚ]
α = learning rate (step size)
∇J(β) = gradient vector [∂J/∂β₀, ∂J/∂β₁, ..., ∂J/∂βₚ]
```

### Gradient Calculation

For linear regression cost function:
```
J(β) = (1/2n) Σ(yᵢ - ŷᵢ)²
     = (1/2n) Σ(yᵢ - (β₀ + β₁x₁ᵢ + ... + βₚxₚᵢ))²
```

**Partial derivative w.r.t. βⱼ:**
```
∂J/∂βⱼ = -(1/n) Σ(yᵢ - ŷᵢ)xⱼᵢ
```

**In matrix form:**
```
∇J(β) = -(1/n) Xᵀ(y - Xβ)
```

### Update Rule for Linear Regression

**Component-wise:**
```
βⱼ := βⱼ - α(1/n) Σ(ŷᵢ - yᵢ)xⱼᵢ
```

**Vector form:**
```
β := β - (α/n) Xᵀ(Xβ - y)
```

### Algorithm Steps

```
1. Initialize β randomly (or zeros)
2. Repeat until convergence:
   a. Compute predictions: ŷ = Xβ
   b. Compute gradient: ∇J = (1/n)Xᵀ(ŷ - y)
   c. Update parameters: β := β - α∇J
   d. Check convergence (cost change < threshold)
```

### Derivation Example

For simple linear regression: y = β₀ + β₁x

```
J(β₀, β₁) = (1/2n) Σ(yᵢ - β₀ - β₁xᵢ)²

∂J/∂β₀ = (1/n) Σ(β₀ + β₁xᵢ - yᵢ)
       = (1/n) Σ(ŷᵢ - yᵢ)

∂J/∂β₁ = (1/n) Σ(β₀ + β₁xᵢ - yᵢ)xᵢ
       = (1/n) Σ(ŷᵢ - yᵢ)xᵢ

Update:
β₀ := β₀ - α(1/n)Σ(ŷᵢ - yᵢ)
β₁ := β₁ - α(1/n)Σ(ŷᵢ - yᵢ)xᵢ
```

---

## Types of Gradient Descent

### 1. Batch Gradient Descent (BGD)

**Uses ALL training data** in each iteration.

**Algorithm:**
```
For each iteration:
  1. Compute gradient using ALL samples:
     ∇J = (1/n) Σᵢ₌₁ⁿ ∇Jᵢ
  2. Update: β := β - α∇J
```

**Characteristics:**

✅ **Advantages:**
- Stable convergence
- Accurate gradient
- Smooth path to minimum

❌ **Disadvantages:**
- Slow for large datasets
- Requires all data in memory
- Can get stuck in local minima

**Code:**
```python
def batch_gradient_descent(X, y, learning_rate=0.01, iterations=1000):
    n, p = X.shape
    beta = np.zeros(p)
    cost_history = []

    for i in range(iterations):
        # Predict for ALL samples
        predictions = X @ beta

        # Compute gradient using ALL samples
        gradient = (1/n) * X.T @ (predictions - y)

        # Update parameters
        beta = beta - learning_rate * gradient

        # Track cost
        cost = (1/(2*n)) * np.sum((predictions - y)**2)
        cost_history.append(cost)

    return beta, cost_history
```

**When to use:**
- Small to medium datasets (n < 10,000)
- When you need stable, deterministic convergence
- When memory is not a constraint

---

### 2. Stochastic Gradient Descent (SGD)

**Uses ONE random sample** in each iteration.

**Algorithm:**
```
For each iteration:
  1. Randomly pick one sample (xᵢ, yᵢ)
  2. Compute gradient using only that sample:
     ∇J = ∇Jᵢ
  3. Update: β := β - α∇J
```

**Characteristics:**

✅ **Advantages:**
- Very fast updates
- Works with large datasets
- Can escape local minima (due to noise)
- Enables online learning

❌ **Disadvantages:**
- Noisy updates (zigzag path)
- Doesn't converge to exact minimum (oscillates around it)
- Requires careful learning rate tuning

**Convergence Path Comparison:**
```
Batch GD:                  Stochastic GD:
    *                          *
     \                        /|\  ← Noisy
      \                      / | \ /\
       \                    /  |  X  \
        \                  /   | / \  \
         \                /    |/   \ |
          v              v     v     \|
          o              o     o      o
     Smooth path        Zigzag path
```

**Code:**
```python
def stochastic_gradient_descent(X, y, learning_rate=0.01, epochs=50):
    n, p = X.shape
    beta = np.zeros(p)
    cost_history = []

    for epoch in range(epochs):
        # Shuffle data each epoch
        indices = np.random.permutation(n)

        for i in indices:
            # Use only ONE sample
            xi = X[i:i+1]
            yi = y[i:i+1]

            # Predict for this sample
            prediction = xi @ beta

            # Gradient from this ONE sample
            gradient = xi.T @ (prediction - yi)

            # Update parameters
            beta = beta - learning_rate * gradient

        # Track cost on full dataset
        predictions = X @ beta
        cost = (1/(2*n)) * np.sum((predictions - y)**2)
        cost_history.append(cost)

    return beta, cost_history
```

**When to use:**
- Large datasets (n > 100,000)
- Online learning (streaming data)
- When you need fast updates
- Deep learning

---

### 3. Mini-Batch Gradient Descent (MBGD)

**Uses a SUBSET (batch)** of training data in each iteration.

**Algorithm:**
```
For each iteration:
  1. Randomly sample a batch of m samples (32 ≤ m ≤ 256)
  2. Compute gradient using batch:
     ∇J = (1/m) Σᵢ∈batch ∇Jᵢ
  3. Update: β := β - α∇J
```

**Characteristics:**

✅ **Advantages:**
- Balance between BGD and SGD
- Reduced variance compared to SGD
- Efficient (vectorized operations)
- Works well in practice

❌ **Disadvantages:**
- Still requires hyperparameter tuning (batch size)

**Best of both worlds!**

**Code:**
```python
def mini_batch_gradient_descent(X, y, learning_rate=0.01,
                                epochs=50, batch_size=32):
    n, p = X.shape
    beta = np.zeros(p)
    cost_history = []

    for epoch in range(epochs):
        # Shuffle data
        indices = np.random.permutation(n)

        for i in range(0, n, batch_size):
            # Get mini-batch
            batch_indices = indices[i:i+batch_size]
            X_batch = X[batch_indices]
            y_batch = y[batch_indices]

            # Predict for batch
            predictions = X_batch @ beta

            # Gradient from batch
            gradient = (1/len(batch_indices)) * X_batch.T @ (predictions - y_batch)

            # Update parameters
            beta = beta - learning_rate * gradient

        # Track cost
        predictions = X @ beta
        cost = (1/(2*n)) * np.sum((predictions - y)**2)
        cost_history.append(cost)

    return beta, cost_history
```

**When to use:**
- Default choice for most problems
- Deep learning (standard)
- Large datasets with GPU acceleration

---

### Comparison Table

| Feature | Batch GD | Stochastic GD | Mini-Batch GD |
|---------|----------|---------------|---------------|
| **Samples per update** | All (n) | 1 | m (32-256) |
| **Speed per update** | Slow | Fast | Medium |
| **Convergence** | Smooth | Noisy | Moderate |
| **Memory** | High | Low | Medium |
| **Final accuracy** | Best | Oscillates | Good |
| **Best for** | Small data | Large data, online | Most cases |
| **Typical use** | Traditional ML | Rare | Deep learning |

### Visual Comparison

```
Cost vs Iterations

Batch GD:
J(β) |  \
     |   \___
     |_______\___→ iterations
          Smooth

Stochastic GD:
J(β) | \|\/|
     |  \/|\/\
     |___\|/___→ iterations
        Noisy

Mini-Batch GD:
J(β) | \  \/
     |  \_/\_
     |_____\___→ iterations
       Balanced
```

---

## Learning Rate

The **learning rate (α)** controls step size. Most important hyperparameter!

### Effect of Learning Rate

```
Cost J(β)
    ↑
    |  \         /
    |   \       /     α too large → Overshoots
    |    \  x  /      (diverges)
    |     \ | /
    |      \|/
    |_______o_______→ β
            ↑
       minimum

    α too small → Slow convergence
    α just right → Fast, stable convergence
```

#### 1. Too Small (α = 0.0001)

```
Iterations: 10000+
Path: ___\
          \___
             \___  ← Painfully slow
                \___
```

**Problem:** Takes forever to converge.

#### 2. Too Large (α = 1.0)

```
    \     /
     \ ↗ /
      X    ← Overshoots, diverges
     / ↘ \
    /     \
```

**Problem:** Jumps over minimum, cost increases!

#### 3. Just Right (α = 0.01)

```
    \
     \__
       \__  ← Converges nicely
          o
```

**Sweet spot:** Fast convergence, stable.

### Finding the Right Learning Rate

#### Method 1: Grid Search

```python
learning_rates = [0.001, 0.01, 0.1, 1.0]
best_lr = None
best_cost = float('inf')

for lr in learning_rates:
    beta, cost_history = gradient_descent(X, y, learning_rate=lr)
    final_cost = cost_history[-1]

    if final_cost < best_cost:
        best_cost = final_cost
        best_lr = lr

print(f"Best learning rate: {best_lr}")
```

#### Method 2: Learning Rate Finder

```python
import numpy as np
import matplotlib.pyplot as plt

def learning_rate_finder(X, y, lr_min=1e-5, lr_max=10, num_iter=100):
    """
    Plots cost vs learning rate to find optimal range
    """
    n, p = X.shape
    beta = np.zeros(p)

    learning_rates = np.logspace(np.log10(lr_min), np.log10(lr_max), num_iter)
    costs = []

    for lr in learning_rates:
        # Take one gradient step
        predictions = X @ beta
        gradient = (1/n) * X.T @ (predictions - y)
        beta = beta - lr * gradient

        # Compute cost
        predictions = X @ beta
        cost = (1/(2*n)) * np.sum((predictions - y)**2)
        costs.append(cost)

    # Plot
    plt.figure(figsize=(10, 6))
    plt.plot(learning_rates, costs)
    plt.xscale('log')
    plt.yscale('log')
    plt.xlabel('Learning Rate')
    plt.ylabel('Cost')
    plt.title('Learning Rate Finder')
    plt.grid(True)

    # Find minimum
    optimal_idx = np.argmin(costs)
    optimal_lr = learning_rates[optimal_idx]
    plt.axvline(optimal_lr, color='r', linestyle='--',
                label=f'Optimal: {optimal_lr:.4f}')
    plt.legend()
    plt.show()

    return optimal_lr
```

#### Method 3: Rule of Thumb

```
For normalized features (mean=0, std=1):
Start with α = 0.01

Then:
- If cost increases → α too large, divide by 10
- If cost decreases slowly → α too small, multiply by 10
- If cost decreases rapidly → α is good!
```

### Adaptive Learning Rates

Instead of fixed α, use **learning rate schedules**:

#### 1. Step Decay

```python
def step_decay(initial_lr, epoch, drop=0.5, epochs_drop=10):
    return initial_lr * (drop ** (epoch // epochs_drop))

# Example: Start at 0.1, halve every 10 epochs
# Epoch 0-9:   lr = 0.1
# Epoch 10-19: lr = 0.05
# Epoch 20-29: lr = 0.025
```

#### 2. Exponential Decay

```python
def exponential_decay(initial_lr, epoch, decay_rate=0.95):
    return initial_lr * (decay_rate ** epoch)

# Smooth decay: lr gets smaller each epoch
```

#### 3. 1/t Decay

```python
def inverse_time_decay(initial_lr, epoch, decay_rate=1.0):
    return initial_lr / (1 + decay_rate * epoch)
```

**Visualization:**
```
Learning Rate vs Epoch

  α
  ↑
1.0|___
   |   \___           Step Decay
0.5|       \___
   |           \___
  0|__________________→ Epoch

  α
  ↑
1.0|‾\
   |  \____          Exponential Decay
0.5|      \____
   |          \____
  0|__________________→ Epoch
```

#### 4. Warm Restarts (Cosine Annealing)

```python
def cosine_annealing(initial_lr, epoch, T_max=50):
    return initial_lr * (1 + np.cos(np.pi * epoch / T_max)) / 2

# Gradually decreases, then restarts
```

```
  α
  ↑
1.0|‾\      /‾\      /‾\
   |  \    /   \    /
0.5|   \/     \/
   |
  0|____________________→ Epoch
     Helps escape local minima!
```

### Feature Scaling Impact

**Unscaled features** cause problems:

```
Without scaling:
x₁ ∈ [0, 1000]    (area)
x₂ ∈ [1, 5]       (bedrooms)

Cost contours:
     β₂
      ↑
      | ⬭ ← Elongated ellipse
      |⬭
      |___________→ β₁
     Slow convergence!

With scaling:
Both features ∈ [-1, 1]

Cost contours:
     β₂
      ↑
      | ⃝  ← Circular
      |
      |___________→ β₁
     Fast convergence!
```

**Always scale features before gradient descent!**

```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

---

## Convergence

### Convergence Criteria

When to stop iterating?

#### 1. Maximum Iterations

```python
if iteration >= max_iterations:
    break
```

Simple but may stop too early or too late.

#### 2. Cost Threshold

```python
if cost < threshold:
    break
```

Good when you know target cost.

#### 3. Cost Change (Most Common)

```python
if abs(cost - previous_cost) < epsilon:
    break

# Or relative change:
if abs(cost - previous_cost) / previous_cost < epsilon:
    break
```

**Typical:** ε = 1e-6 or 1e-8

#### 4. Gradient Norm

```python
if np.linalg.norm(gradient) < epsilon:
    break
```

At minimum, gradient ≈ 0.

### Checking Convergence

**Plot cost vs iterations:**

```
Good convergence:
Cost
  ↑
  |‾\
  |  \___
  |______\______ ← Flattens out
  |____________→ Iterations

Not converged:
Cost
  ↑
  |‾\
  |  \
  |   \   ← Still decreasing
  |    \
  |_____\______→ Iterations
       Need more iterations!

Diverging:
Cost
  ↑    ___---
  |  _-
  | /   ← Cost increasing!
  |/
  |____________→ Iterations
     α too large!
```

### Implementation with Convergence

```python
def gradient_descent_with_convergence(X, y, learning_rate=0.01,
                                     max_iterations=10000,
                                     epsilon=1e-6):
    n, p = X.shape
    beta = np.zeros(p)
    cost_history = []
    converged = False

    for iteration in range(max_iterations):
        # Compute predictions
        predictions = X @ beta

        # Compute cost
        cost = (1/(2*n)) * np.sum((predictions - y)**2)
        cost_history.append(cost)

        # Check convergence
        if iteration > 0:
            cost_change = abs(cost - cost_history[-2])
            if cost_change < epsilon:
                print(f"Converged at iteration {iteration}")
                converged = True
                break

        # Compute gradient
        gradient = (1/n) * X.T @ (predictions - y)

        # Update parameters
        beta = beta - learning_rate * gradient

    if not converged:
        print(f"Did not converge after {max_iterations} iterations")

    return beta, cost_history
```

### Convergence Rate

**Linear regression has convex cost function → Guaranteed to converge to global minimum!**

```
Cost landscape:
     ↑
    /|\    ← Only ONE minimum
   / | \      (convex function)
  /  |  \
 /   o   \   ← Guaranteed to find it
/____|____\
```

For other models (e.g., neural networks), cost may have multiple minima:

```
Non-convex:
     ↑
 /\  |  /\    ← Multiple minima
/  \_|_/  \
   o | o     ← May get stuck in local minimum
_____|_____
```

---

## Challenges and Solutions

### 1. Slow Convergence

**Problem:** Takes too long to converge.

**Solutions:**
- Increase learning rate (carefully!)
- Use momentum (see Advanced Optimizers)
- Scale features
- Use better initialization

### 2. Divergence

**Problem:** Cost increases instead of decreases.

**Solutions:**
- Decrease learning rate
- Check gradient implementation (look for bugs)
- Scale features
- Check for NaN/Inf values

### 3. Oscillation

**Problem:** Cost oscillates without decreasing.

**Solutions:**
- Decrease learning rate
- Use adaptive learning rate
- Use momentum

### 4. Local Minima (for non-convex)

**Problem:** Gets stuck in local minimum.

**Solutions:**
- Use SGD (noise helps escape)
- Use momentum
- Try different initializations
- Use simulated annealing

### 5. Saddle Points

**Problem:** Gradient ≈ 0 but not at minimum.

```
Saddle point:
       _
      / \    ← Minimum in one direction
     /   \
    o_____o  ← Maximum in another direction
```

**Solutions:**
- Use momentum
- Use adaptive methods (Adam, RMSprop)

---

## Implementation

### Complete Implementation from Scratch

```python
import numpy as np
import matplotlib.pyplot as plt

class LinearRegressionGD:
    """
    Linear Regression using Gradient Descent
    """

    def __init__(self, learning_rate=0.01, method='batch',
                 batch_size=32, max_iterations=1000,
                 epsilon=1e-6, verbose=False):
        """
        Parameters:
        -----------
        learning_rate : float
            Step size for gradient descent
        method : str
            'batch', 'stochastic', or 'mini-batch'
        batch_size : int
            Size of mini-batches (for mini-batch GD)
        max_iterations : int
            Maximum number of iterations
        epsilon : float
            Convergence threshold
        verbose : bool
            Print progress
        """
        self.learning_rate = learning_rate
        self.method = method
        self.batch_size = batch_size
        self.max_iterations = max_iterations
        self.epsilon = epsilon
        self.verbose = verbose

        self.beta = None
        self.cost_history = []

    def _compute_cost(self, X, y, beta):
        """Compute MSE cost"""
        n = len(y)
        predictions = X @ beta
        cost = (1/(2*n)) * np.sum((predictions - y)**2)
        return cost

    def _compute_gradient(self, X, y, beta):
        """Compute gradient"""
        n = len(y)
        predictions = X @ beta
        gradient = (1/n) * X.T @ (predictions - y)
        return gradient

    def fit(self, X, y):
        """
        Fit linear regression model

        Parameters:
        -----------
        X : array-like, shape (n_samples, n_features)
        y : array-like, shape (n_samples,)
        """
        # Add intercept column
        X = np.column_stack([np.ones(len(X)), X])
        n, p = X.shape

        # Initialize parameters
        self.beta = np.zeros(p)

        # Gradient descent
        if self.method == 'batch':
            self._batch_gd(X, y)
        elif self.method == 'stochastic':
            self._stochastic_gd(X, y)
        elif self.method == 'mini-batch':
            self._mini_batch_gd(X, y)
        else:
            raise ValueError("Method must be 'batch', 'stochastic', or 'mini-batch'")

        return self

    def _batch_gd(self, X, y):
        """Batch Gradient Descent"""
        for iteration in range(self.max_iterations):
            # Compute cost
            cost = self._compute_cost(X, y, self.beta)
            self.cost_history.append(cost)

            # Check convergence
            if iteration > 0:
                if abs(cost - self.cost_history[-2]) < self.epsilon:
                    if self.verbose:
                        print(f"Converged at iteration {iteration}")
                    break

            # Compute gradient and update
            gradient = self._compute_gradient(X, y, self.beta)
            self.beta = self.beta - self.learning_rate * gradient

            if self.verbose and iteration % 100 == 0:
                print(f"Iteration {iteration}, Cost: {cost:.4f}")

    def _stochastic_gd(self, X, y):
        """Stochastic Gradient Descent"""
        n = len(y)

        for epoch in range(self.max_iterations):
            # Shuffle data
            indices = np.random.permutation(n)

            for i in indices:
                # Use one sample
                xi = X[i:i+1]
                yi = y[i:i+1]

                # Update using this sample
                gradient = self._compute_gradient(xi, yi, self.beta)
                self.beta = self.beta - self.learning_rate * gradient

            # Compute cost on full dataset
            cost = self._compute_cost(X, y, self.beta)
            self.cost_history.append(cost)

            if self.verbose and epoch % 10 == 0:
                print(f"Epoch {epoch}, Cost: {cost:.4f}")

    def _mini_batch_gd(self, X, y):
        """Mini-Batch Gradient Descent"""
        n = len(y)

        for epoch in range(self.max_iterations):
            # Shuffle data
            indices = np.random.permutation(n)

            for i in range(0, n, self.batch_size):
                # Get mini-batch
                batch_indices = indices[i:i+self.batch_size]
                X_batch = X[batch_indices]
                y_batch = y[batch_indices]

                # Update using batch
                gradient = self._compute_gradient(X_batch, y_batch, self.beta)
                self.beta = self.beta - self.learning_rate * gradient

            # Compute cost
            cost = self._compute_cost(X, y, self.beta)
            self.cost_history.append(cost)

            if self.verbose and epoch % 10 == 0:
                print(f"Epoch {epoch}, Cost: {cost:.4f}")

    def predict(self, X):
        """Make predictions"""
        X = np.column_stack([np.ones(len(X)), X])
        return X @ self.beta

    def plot_cost_history(self):
        """Plot cost vs iterations"""
        plt.figure(figsize=(10, 6))
        plt.plot(self.cost_history)
        plt.xlabel('Iteration/Epoch')
        plt.ylabel('Cost')
        plt.title(f'Cost vs Iterations ({self.method} GD)')
        plt.grid(True)
        plt.show()
```

### Usage Example

```python
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Generate data
X, y = make_regression(n_samples=1000, n_features=10, noise=20, random_state=42)

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale features (important!)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Compare different methods
methods = ['batch', 'stochastic', 'mini-batch']
models = {}

for method in methods:
    print(f"\n{'='*50}")
    print(f"Training with {method.upper()} Gradient Descent")
    print('='*50)

    model = LinearRegressionGD(
        learning_rate=0.01,
        method=method,
        batch_size=32,
        max_iterations=100,
        verbose=True
    )

    model.fit(X_train_scaled, y_train)
    models[method] = model

    # Evaluate
    y_pred = model.predict(X_test_scaled)
    mse = np.mean((y_test - y_pred)**2)
    print(f"\nTest MSE: {mse:.2f}")

# Plot cost histories
plt.figure(figsize=(15, 5))
for i, method in enumerate(methods, 1):
    plt.subplot(1, 3, i)
    plt.plot(models[method].cost_history)
    plt.xlabel('Iteration/Epoch')
    plt.ylabel('Cost')
    plt.title(f'{method.capitalize()} GD')
    plt.grid(True)
plt.tight_layout()
plt.show()
```

---

## Advanced Optimizers

Modern optimizers improve upon vanilla gradient descent.

### 1. Momentum

**Problem:** Vanilla GD oscillates in ravines.

**Solution:** Add momentum (velocity) term.

```
v := γv + α∇J(β)
β := β - v

Where:
v = velocity vector
γ = momentum coefficient (typically 0.9)
```

**Intuition:** Ball rolling downhill gains momentum.

```
Without Momentum:        With Momentum:
    \|/|\/                  \
     \|/                     \___
      X  ← Oscillates            \___  ← Smooth
     /|\                             o
```

**Code:**
```python
def gradient_descent_momentum(X, y, learning_rate=0.01,
                             gamma=0.9, iterations=1000):
    n, p = X.shape
    beta = np.zeros(p)
    velocity = np.zeros(p)
    cost_history = []

    for i in range(iterations):
        predictions = X @ beta
        gradient = (1/n) * X.T @ (predictions - y)

        # Update velocity and parameters
        velocity = gamma * velocity + learning_rate * gradient
        beta = beta - velocity

        cost = (1/(2*n)) * np.sum((predictions - y)**2)
        cost_history.append(cost)

    return beta, cost_history
```

### 2. Nesterov Accelerated Gradient (NAG)

**Improvement over momentum:** Look ahead before computing gradient.

```
v := γv + α∇J(β - γv)  ← Compute gradient at lookahead position
β := β - v
```

**More accurate than momentum.**

### 3. AdaGrad (Adaptive Gradient)

**Adapts learning rate for each parameter** based on historical gradients.

```
G := G + (∇J)²  (element-wise)
β := β - (α / √(G + ε)) ⊙ ∇J

Where:
G = sum of squared gradients
ε = small constant (1e-8) to avoid division by zero
⊙ = element-wise multiplication
```

**Effect:** Parameters with large gradients get smaller updates.

**Problem:** Learning rate keeps decreasing → may stop learning too early.

### 4. RMSprop (Root Mean Square Propagation)

**Fixes AdaGrad** by using exponential moving average.

```
G := ρG + (1-ρ)(∇J)²
β := β - (α / √(G + ε)) ⊙ ∇J

Where ρ = 0.9 (typically)
```

**Better than AdaGrad** for non-convex optimization.

### 5. Adam (Adaptive Moment Estimation)

**Combines Momentum + RMSprop.** Most popular optimizer!

```
m := β₁m + (1-β₁)∇J     (first moment - momentum)
v := β₂v + (1-β₂)(∇J)²  (second moment - RMSprop)

m̂ := m / (1-β₁ᵗ)        (bias correction)
v̂ := v / (1-β₂ᵗ)

β := β - α(m̂ / (√v̂ + ε))

Where:
β₁ = 0.9   (momentum decay)
β₂ = 0.999 (RMSprop decay)
ε = 1e-8
t = iteration number
```

**Code:**
```python
def adam_optimizer(X, y, learning_rate=0.001, beta1=0.9,
                   beta2=0.999, epsilon=1e-8, iterations=1000):
    n, p = X.shape
    beta = np.zeros(p)
    m = np.zeros(p)  # First moment
    v = np.zeros(p)  # Second moment
    cost_history = []

    for t in range(1, iterations + 1):
        predictions = X @ beta
        gradient = (1/n) * X.T @ (predictions - y)

        # Update biased moments
        m = beta1 * m + (1 - beta1) * gradient
        v = beta2 * v + (1 - beta2) * (gradient ** 2)

        # Bias correction
        m_hat = m / (1 - beta1 ** t)
        v_hat = v / (1 - beta2 ** t)

        # Update parameters
        beta = beta - learning_rate * m_hat / (np.sqrt(v_hat) + epsilon)

        cost = (1/(2*n)) * np.sum((predictions - y)**2)
        cost_history.append(cost)

    return beta, cost_history
```

### Comparison

| Optimizer | Pros | Cons | Best For |
|-----------|------|------|----------|
| **SGD** | Simple, robust | Slow, requires tuning | Small models |
| **Momentum** | Faster than SGD | Overshoots | Ravines |
| **AdaGrad** | Adapts per-parameter | Decays too fast | Sparse data |
| **RMSprop** | Fixes AdaGrad | Requires tuning | RNNs |
| **Adam** | Fast, adaptive | May not converge | Default choice |

**Rule of thumb:**
- Start with **Adam** (α = 0.001)
- If not working, try **SGD with momentum** (α = 0.01, γ = 0.9)
- For fine-tuning, use **SGD with schedule**

---

## Interview Questions

### Basic Questions

**Q1: What is gradient descent?**

**A:** Iterative optimization algorithm that finds minimum of a function by repeatedly moving in the direction opposite to the gradient (steepest descent).

**Update rule:** β := β - α∇J(β)

---

**Q2: Why use gradient descent instead of normal equation?**

**A:**

| Normal Equation | Gradient Descent |
|----------------|------------------|
| β = (XᵀX)⁻¹XᵀY | β := β - α∇J(β) |
| O(n³) - slow for large n | O(kn) - scales well |
| No hyperparameters | Need learning rate α |
| Exact solution | Iterative solution |
| Fails if XᵀX singular | Always works |
| Need all data | Works with streaming |

**Use GD when n > 10,000 or for online learning.**

---

**Q3: What are the three types of gradient descent?**

**A:**
1. **Batch GD:** Uses all data, smooth but slow
2. **Stochastic GD:** Uses one sample, fast but noisy
3. **Mini-Batch GD:** Uses small batches, best trade-off (most common)

---

**Q4: What is the learning rate and why is it important?**

**A:** Learning rate (α) controls step size.

- **Too small:** Slow convergence
- **Too large:** Overshoots, diverges
- **Just right:** Fast, stable convergence

**Most critical hyperparameter!**

---

**Q5: How do you know gradient descent is working?**

**A:** Plot cost vs iterations:
- Cost should **decrease** monotonically (for batch GD)
- If cost **increases**: α too large
- If cost **oscillates**: α too large or need feature scaling
- If cost **decreases slowly**: α too small or need more iterations

---

### Intermediate Questions

**Q6: Derive the gradient for linear regression.**

**A:**
```
J(β) = (1/2n) Σ(yᵢ - Xᵢβ)²

Let L = Xβ - y (prediction error)
J(β) = (1/2n) LᵀL
     = (1/2n)(Xβ - y)ᵀ(Xβ - y)

∂J/∂β = (1/2n) · 2Xᵀ(Xβ - y)
      = (1/n) Xᵀ(Xβ - y)

Update: β := β - (α/n) Xᵀ(Xβ - y)
```

---

**Q7: Why is feature scaling important for gradient descent?**

**A:**
**Unscaled features** cause elongated cost contours:
```
x₁ ∈ [0, 1000], x₂ ∈ [1, 5]

Cost contours are elliptical:
→ GD takes zigzag path
→ Slow convergence
```

**Scaled features** create circular contours:
```
Both ∈ [-1, 1]

→ Direct path to minimum
→ Fast convergence
```

**Always scale before GD!**

---

**Q8: Compare batch GD vs mini-batch GD.**

**A:**

**Batch GD:**
- Uses all n samples
- Accurate gradient
- Smooth convergence
- Slow for large n
- Deterministic

**Mini-Batch GD:**
- Uses m samples (32-256)
- Approximate gradient
- Slightly noisy but stable
- Fast (vectorized)
- Stochastic

**Winner:** Mini-batch GD (used in practice)

---

**Q9: What is the convergence guarantee for gradient descent?**

**A:**
For **convex** functions (like linear regression):
- **Guaranteed** to converge to global minimum
- Convergence rate: O(1/t) for fixed α

For **non-convex** functions:
- May converge to local minimum
- No global convergence guarantee
- SGD can escape local minima due to noise

---

**Q10: How do you choose batch size for mini-batch GD?**

**A:**

**Common choices:** 32, 64, 128, 256

**Trade-offs:**
- **Smaller batch:** More noise, better generalization, slower
- **Larger batch:** Less noise, faster (GPU), may overfit

**Guidelines:**
- Start with 32
- Increase if you have large RAM/GPU
- Decrease if memory limited
- Powers of 2 for GPU efficiency

---

### Advanced Questions

**Q11: Explain momentum in gradient descent.**

**A:**
**Problem:** Vanilla GD oscillates in ravines.

**Solution:** Add velocity term:
```
v := γv + α∇J
β := β - v

γ = 0.9 (typical)
```

**Intuition:** Ball rolling downhill accumulates velocity.

**Benefits:**
- Faster convergence
- Dampens oscillations
- Overcomes small local minima

---

**Q12: How does Adam optimizer work?**

**A:**
**Adam = Momentum + RMSprop**

```
m := β₁m + (1-β₁)∇J        (momentum)
v := β₂v + (1-β₂)(∇J)²     (adaptive lr)
β := β - α·m̂/(√v̂ + ε)

Typical: β₁=0.9, β₂=0.999, α=0.001
```

**Advantages:**
- Adaptive learning rate per parameter
- Works well out-of-the-box
- Fast convergence

**Default choice for deep learning!**

---

**Q13: What is the learning rate schedule and when to use it?**

**A:**
**Learning rate schedule** decreases α over time.

**Common schedules:**
1. **Step decay:** α = α₀ × 0.5^(epoch/10)
2. **Exponential:** α = α₀ × e^(-kt)
3. **Inverse:** α = α₀ / (1 + kt)

**When to use:**
- Long training runs
- When stuck at plateau
- For better final accuracy

**Strategy:**
- Start with large α (fast progress)
- Reduce α (fine-tune solution)

---

**Q14: Compare SGD with momentum vs Adam. When to use each?**

**A:**

**SGD + Momentum:**
- Simpler, more predictable
- Better final accuracy (sometimes)
- Requires careful tuning
- Use for: Final training, when you have time to tune

**Adam:**
- Adaptive, less tuning needed
- Faster initial convergence
- May not converge to best solution
- Use for: Initial experiments, large models, default choice

**Strategy:**
1. Start with Adam for quick experiments
2. If needed, fine-tune with SGD+momentum for best accuracy

---

**Q15: Why doesn't gradient descent work for some functions?**

**A:**
**Problems:**

1. **Non-differentiable:** Gradient undefined
   - Example: |x|, ReLU at 0
   - Solution: Subgradient methods

2. **Flat regions:** Gradient ≈ 0 but not at minimum
   - Example: Sigmoid saturation
   - Solution: Better initialization, adaptive lr

3. **Saddle points:** Gradient = 0 but not minimum
   - Common in high dimensions
   - Solution: Momentum, Adam

4. **Vanishing gradients:** Gradient → 0 in deep networks
   - Solution: Better activation functions, batch norm

---

**Q16: How do you detect if gradient descent is diverging?**

**A:**

**Signs of divergence:**
1. Cost **increasing** over iterations
2. NaN or Inf values in parameters/cost
3. Oscillating cost without decreasing trend

**Causes:**
- Learning rate too large
- Gradient explosion
- Poor feature scaling
- Bug in gradient calculation

**Solutions:**
```python
# Check for divergence
if cost > prev_cost:
    print("Warning: Cost increased!")
    learning_rate *= 0.5  # Reduce lr

if np.isnan(cost) or np.isinf(cost):
    print("ERROR: NaN/Inf detected!")
    break  # Stop training
```

---

## Quick Reference

### Key Formulas

```
Gradient Descent:         β := β - α∇J(β)
Gradient (Linear Reg):    ∇J = (1/n)Xᵀ(Xβ - y)
Momentum:                 v := γv + α∇J; β := β - v
Adam:                     β := β - α·m̂/(√v̂ + ε)
```

### Typical Hyperparameters

```
Learning Rate (α):
  Linear Regression (scaled):  0.01
  Deep Learning (Adam):         0.001
  Deep Learning (SGD):          0.1

Batch Size:                     32, 64, 128
Momentum (γ):                   0.9
Adam (β₁, β₂):                  0.9, 0.999
```

### Decision Guide

```
Choose GD type:
├─ Small data (n < 1000)?          → Batch GD
├─ Large data (n > 100k)?          → Mini-Batch GD
└─ Online learning?                → Stochastic GD

Choose optimizer:
├─ Default / Quick start?          → Adam (α=0.001)
├─ Best final accuracy?            → SGD + Momentum
├─ Sparse data?                    → AdaGrad
└─ RNNs?                           → RMSprop
```

---

**End of Gradient Descent Notes**

Next: [Regularization](regularization.md)
