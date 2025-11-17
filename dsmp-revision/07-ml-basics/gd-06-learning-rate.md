# Learning Rate: The Most Critical Hyperparameter

## What You'll Learn

The learning rate controls how big a step gradient descent takes at each iteration. Getting it right is the difference between rapid convergence and complete failure. You'll learn how to choose, tune, and adapt learning rates for optimal training.

## Understanding Learning Rate

The learning rate (α) determines the step size in the parameter update:

```
β := β - α∇J(β)
        ↑
    Learning rate
```

Think of it as the "aggressiveness" of learning:
- **Large α:** Bold, large steps
- **Small α:** Cautious, tiny steps

## The Goldilocks Problem

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

### Too Small (α = 0.0001)

```
Iterations needed: 10,000+

Path:
    \___
        \___
            \___  ← Painfully slow
                \___
```

**Problems:**
- Takes forever to converge
- May give up before reaching minimum
- Wastes computational resources
- Trapped in plateaus

### Too Large (α = 1.0)

```
Cost over time:

    \     /
     \ ↗ /
      X    ← Overshoots minimum
     / ↘ \
    /     \  ← Diverges!
```

**Problems:**
- Jumps over the minimum
- Cost increases instead of decreases
- Complete failure to learn
- Unstable training

### Just Right (α = 0.01)

```
Path:
    \
     \__
       \__  ← Converges nicely
          o
```

**Characteristics:**
- Steady decrease in cost
- Reaches minimum efficiently
- Stable convergence
- Good use of compute

## Finding the Right Learning Rate

### Method 1: Grid Search

Try a range of learning rates and pick the best:

```python
import numpy as np
import matplotlib.pyplot as plt

def grid_search_learning_rate(X, y, learning_rates, iterations=100):
    """
    Test multiple learning rates and return the best
    """
    results = {}

    for lr in learning_rates:
        beta, cost_history = batch_gradient_descent(
            X, y,
            learning_rate=lr,
            iterations=iterations
        )

        results[lr] = {
            'final_cost': cost_history[-1],
            'cost_history': cost_history,
            'beta': beta
        }

    return results

# Test range of learning rates
learning_rates = [0.001, 0.01, 0.1, 1.0]
results = grid_search_learning_rate(X_scaled, y, learning_rates)

# Plot results
plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
for lr, data in results.items():
    plt.plot(data['cost_history'], label=f'α={lr}')
plt.xlabel('Iteration')
plt.ylabel('Cost')
plt.title('Convergence for Different Learning Rates')
plt.legend()
plt.grid(True)

plt.subplot(1, 2, 2)
final_costs = [data['final_cost'] for data in results.values()]
plt.bar(range(len(learning_rates)), final_costs)
plt.xticks(range(len(learning_rates)), [f'{lr}' for lr in learning_rates])
plt.xlabel('Learning Rate')
plt.ylabel('Final Cost')
plt.title('Final Cost vs Learning Rate')
plt.grid(True)

plt.tight_layout()
plt.show()

# Select best
best_lr = min(results, key=lambda lr: results[lr]['final_cost'])
print(f"Best learning rate: {best_lr}")
```

### Method 2: Learning Rate Finder

Systematically increase learning rate and plot cost:

```python
def learning_rate_finder(X, y, lr_min=1e-5, lr_max=10, num_iter=100):
    """
    Learning rate range test
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

        # Stop if diverging
        if cost > 1e10 or np.isnan(cost):
            break

    # Plot
    plt.figure(figsize=(10, 6))
    plt.plot(learning_rates[:len(costs)], costs)
    plt.xscale('log')
    plt.yscale('log')
    plt.xlabel('Learning Rate')
    plt.ylabel('Cost')
    plt.title('Learning Rate Finder')
    plt.grid(True)

    # Find and mark optimal
    optimal_idx = np.argmin(costs)
    optimal_lr = learning_rates[optimal_idx]
    plt.axvline(optimal_lr, color='r', linestyle='--',
                label=f'Optimal: {optimal_lr:.6f}')
    plt.legend()
    plt.show()

    return optimal_lr

# Find optimal learning rate
optimal_lr = learning_rate_finder(X_scaled, y)
print(f"Suggested learning rate: {optimal_lr}")
```

### Method 3: Rule of Thumb

Simple heuristics for starting values:

```
For normalized features (mean=0, std=1):
Start with α = 0.01

Then adjust:
- Cost increasing    → α too large, divide by 10
- Cost decreasing slowly → α too small, multiply by 10
- Cost decreasing rapidly → α is good!
```

**Quick diagnostic:**

```python
def diagnose_learning_rate(cost_history):
    """
    Diagnose if learning rate is appropriate
    """
    if len(cost_history) < 2:
        return "Need more iterations"

    # Check if cost is increasing
    if cost_history[-1] > cost_history[0]:
        return "TOO LARGE: Cost increasing, divide by 10"

    # Check rate of decrease
    recent_change = abs(cost_history[-1] - cost_history[-10]) if len(cost_history) > 10 else 0

    if recent_change < 1e-6:
        return "Possibly converged or TOO SMALL"
    elif recent_change > cost_history[0] * 0.01:
        return "GOOD: Cost decreasing steadily"
    else:
        return "TOO SMALL: Very slow progress"

# Usage
diagnosis = diagnose_learning_rate(cost_history)
print(diagnosis)
```

## Learning Rate Schedules

Instead of fixed learning rate, adapt it during training:

### 1. Step Decay

Drop learning rate by factor at regular intervals:

```python
def step_decay(initial_lr, epoch, drop=0.5, epochs_drop=10):
    """
    Reduce learning rate by 'drop' every 'epochs_drop' epochs
    """
    return initial_lr * (drop ** (epoch // epochs_drop))

# Example usage
initial_lr = 0.1
for epoch in range(50):
    lr = step_decay(initial_lr, epoch, drop=0.5, epochs_drop=10)
    # Use lr for this epoch

# Schedule:
# Epoch 0-9:   lr = 0.1
# Epoch 10-19: lr = 0.05
# Epoch 20-29: lr = 0.025
# Epoch 30-39: lr = 0.0125
# Epoch 40-49: lr = 0.00625
```

### 2. Exponential Decay

Smoothly decrease learning rate:

```python
def exponential_decay(initial_lr, epoch, decay_rate=0.95):
    """
    Exponentially decay learning rate
    """
    return initial_lr * (decay_rate ** epoch)

# Example
initial_lr = 0.1
decay_rate = 0.95

for epoch in range(50):
    lr = exponential_decay(initial_lr, epoch, decay_rate)
    # Epoch 0:  lr = 0.100
    # Epoch 10: lr = 0.060
    # Epoch 20: lr = 0.036
    # Epoch 30: lr = 0.021
```

### 3. 1/t Decay

Inverse time decay:

```python
def inverse_time_decay(initial_lr, epoch, decay_rate=1.0):
    """
    Decay inversely with time
    """
    return initial_lr / (1 + decay_rate * epoch)

# Smooth, gradual decay
```

### 4. Cosine Annealing with Warm Restarts

Cyclically vary learning rate:

```python
def cosine_annealing(initial_lr, epoch, T_max=50):
    """
    Cosine annealing schedule
    """
    return initial_lr * (1 + np.cos(np.pi * epoch / T_max)) / 2

# Creates periodic restarts that help escape local minima
```

**Visualization:**

```python
epochs = range(100)
initial_lr = 0.1

schedules = {
    'Constant': [initial_lr] * 100,
    'Step': [step_decay(initial_lr, e, 0.5, 20) for e in epochs],
    'Exponential': [exponential_decay(initial_lr, e, 0.96) for e in epochs],
    'Inverse': [inverse_time_decay(initial_lr, e, 0.05) for e in epochs],
    'Cosine': [cosine_annealing(initial_lr, e, 50) for e in epochs]
}

plt.figure(figsize=(12, 6))
for name, schedule in schedules.items():
    plt.plot(epochs, schedule, label=name)

plt.xlabel('Epoch')
plt.ylabel('Learning Rate')
plt.title('Learning Rate Schedules')
plt.legend()
plt.grid(True)
plt.show()
```

## Feature Scaling Impact

Feature scaling dramatically affects optimal learning rate:

### Without Scaling

```
x₁ ∈ [0, 1000]    (area in sq ft)
x₂ ∈ [1, 5]       (bedrooms)

Cost contours:
     β₂
      ↑
      | ⬭ ← Elongated ellipse
      |⬭    (narrow valley)
      |___________→ β₁

Problem: Needs different learning rates for β₁ and β₂
Solution with one α: Slow zigzag convergence
```

### With Scaling

```
Both features ∈ [-1, 1]

Cost contours:
     β₂
      ↑
      | ⃝  ← Circular
      |    (symmetric)
      |___________→ β₁

Result: Direct path to minimum, fast convergence!
```

**Always scale features:**

```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Now you can use larger learning rate (e.g., 0.01 instead of 0.0001)
```

## Practical Example: Complete Training

```python
from sklearn.datasets import make_regression
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

# Generate data
X, y = make_regression(n_samples=1000, n_features=10, noise=20, random_state=42)

# Scale features (critical!)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Find optimal learning rate
optimal_lr = learning_rate_finder(X_scaled, y)

# Train with exponential decay
def train_with_decay(X, y, initial_lr, epochs=50):
    n, p = X.shape
    beta = np.zeros(p)
    cost_history = []

    for epoch in range(epochs):
        # Decay learning rate
        lr = exponential_decay(initial_lr, epoch, decay_rate=0.95)

        # Mini-batch GD with current lr
        indices = np.random.permutation(n)
        for i in range(0, n, 32):
            batch_indices = indices[i:i+32]
            X_batch = X[batch_indices]
            y_batch = y[batch_indices]

            predictions = X_batch @ beta
            gradient = (1/len(batch_indices)) * X_batch.T @ (predictions - y_batch)
            beta = beta - lr * gradient

        # Track progress
        predictions = X @ beta
        cost = (1/(2*n)) * np.sum((predictions - y)**2)
        cost_history.append(cost)

    return beta, cost_history

# Train
beta, cost_history = train_with_decay(X_scaled, y, optimal_lr)

# Plot
plt.plot(cost_history)
plt.xlabel('Epoch')
plt.ylabel('Cost')
plt.title('Training with Optimal LR and Decay')
plt.grid(True)
plt.show()
```

## Common Pitfalls

**Pitfall 1: Same LR for unscaled features**
```
Different feature scales → need different LRs → impossible with one α
Solution: Always scale features first
```

**Pitfall 2: Not adapting LR**
```
Large LR throughout → oscillates around minimum, never settles
Solution: Use learning rate decay
```

**Pitfall 3: Starting too large**
```
Initial LR too high → diverges immediately → no recovery
Solution: Start conservative, increase if needed
```

**Pitfall 4: Giving up too soon**
```
Small LR looks like no progress → stop early
Solution: Monitor for longer, or increase LR
```

## Quick Reference

**Finding learning rate:**
```
1. Start with 0.01 (after scaling features)
2. Use learning rate finder for optimal value
3. Apply decay schedule
```

**Typical values (scaled features):**
```
Linear regression: 0.01
Logistic regression: 0.1
Neural networks (SGD): 0.1
Neural networks (Adam): 0.001
```

**Decay schedules:**
```
Step:        Drop by 0.5 every 10-20 epochs
Exponential: Decay rate 0.95-0.99
Best:        Try cosine annealing for deep learning
```

**Critical rules:**
- Always scale features before choosing LR
- Monitor cost - it should decrease
- Use decay for fine-tuning near convergence
- If cost increases, LR is too large

---

## Navigation

**Previous:** [Mini-Batch & Comparison](gd-05-minibatch-comparison.md)

**Next:** [Convergence](gd-07-convergence.md)

**Series:**
- [Introduction and Intuition](gd-01-introduction-intuition.md)
- [Mathematical Formulation](gd-02-mathematical-formulation.md)
- [Batch Gradient Descent](gd-03-batch-gradient-descent.md)
- [Stochastic Gradient Descent](gd-04-stochastic-gradient-descent.md)
- [Mini-Batch & Comparison](gd-05-minibatch-comparison.md)
- Learning Rate (this file)
- [Convergence](gd-07-convergence.md)
- [Implementation](gd-08-implementation.md)
- [Advanced Optimizers](gd-09-advanced-optimizers.md)
- [Interview Guide](gd-10-interview-guide.md)
