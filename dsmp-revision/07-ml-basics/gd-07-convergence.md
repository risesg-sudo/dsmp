# Convergence: Knowing When to Stop

## What You'll Learn

Convergence is about knowing when gradient descent has found a good enough solution. You'll learn how to detect convergence, set appropriate stopping criteria, and understand the theoretical guarantees that make gradient descent reliable.

## What is Convergence?

Convergence means gradient descent has reached (or gotten very close to) the optimal solution. At convergence:

```
∇J(β) ≈ 0  (gradient is nearly zero)
β* ≈ optimal parameters
Cost stops decreasing
```

The challenge: Determining "close enough" in practice.

## Convergence Criteria

### 1. Maximum Iterations (Simple but Crude)

Stop after a fixed number of iterations:

```python
if iteration >= max_iterations:
    break
```

**Pros:**
- Simple to implement
- Guarantees finite runtime
- Prevents infinite loops

**Cons:**
- May stop too early (before converging)
- May run too long (wasting compute)
- Doesn't adapt to problem

**When to use:** As a safety net combined with other criteria.

### 2. Cost Threshold

Stop when cost drops below a target:

```python
if cost < threshold:
    break
```

**Pros:**
- Clear target
- Intuitive

**Cons:**
- Need to know good threshold in advance
- Problem-dependent
- May never reach threshold

**When to use:** When you know the expected minimum cost.

### 3. Cost Change (Most Common)

Stop when cost stops decreasing significantly:

```python
# Absolute change
if abs(cost - previous_cost) < epsilon:
    break

# Or relative change (better)
if abs(cost - previous_cost) / previous_cost < epsilon:
    break
```

**Pros:**
- Adaptive to problem scale
- Reliable indicator of convergence
- Widely used in practice

**Cons:**
- May stop on plateau (not minimum)
- Sensitive to epsilon choice

**Typical values:** ε = 1e-6 or 1e-8

### 4. Gradient Norm

Stop when gradient becomes very small:

```python
if np.linalg.norm(gradient) < epsilon:
    break
```

**Theory:** At minimum, ∇J(β*) = 0

**Pros:**
- Theoretically sound
- Direct measure of optimality

**Cons:**
- May be slow near minimum
- Gradient can be small on plateaus too

**When to use:** Combination with cost change.

### Implementation Example

```python
def gradient_descent_with_convergence(X, y, learning_rate=0.01,
                                     max_iterations=10000,
                                     epsilon=1e-6,
                                     patience=10):
    """
    Gradient descent with multiple convergence criteria
    """
    n, p = X.shape
    beta = np.zeros(p)
    cost_history = []
    converged = False
    patience_counter = 0

    for iteration in range(max_iterations):
        # Compute predictions
        predictions = X @ beta

        # Compute cost
        cost = (1/(2*n)) * np.sum((predictions - y)**2)
        cost_history.append(cost)

        # Check convergence
        if iteration > 0:
            # Criterion 1: Cost change
            cost_change = abs(cost - cost_history[-2])
            relative_change = cost_change / cost_history[-2]

            if relative_change < epsilon:
                patience_counter += 1
                if patience_counter >= patience:
                    print(f"Converged at iteration {iteration}")
                    print(f"Cost change: {cost_change:.2e}")
                    converged = True
                    break
            else:
                patience_counter = 0

        # Compute gradient
        gradient = (1/n) * X.T @ (predictions - y)

        # Criterion 2: Gradient norm
        grad_norm = np.linalg.norm(gradient)
        if grad_norm < epsilon:
            print(f"Converged (gradient norm) at iteration {iteration}")
            converged = True
            break

        # Update parameters
        beta = beta - learning_rate * gradient

    if not converged:
        print(f"Did not converge after {max_iterations} iterations")
        print(f"Final cost: {cost:.4f}")
        print(f"Final gradient norm: {np.linalg.norm(gradient):.2e}")

    return beta, cost_history, converged
```

## Visualizing Convergence

### Good Convergence

```
Cost vs Iterations

Cost
  ↑
  |‾\
  |  \___
  |______\______ ← Flattens out (converged)
  |____________→ Iterations

Characteristics:
- Monotonic decrease
- Smooth curve
- Clear plateau
- Converged!
```

### Not Yet Converged

```
Cost
  ↑
  |‾\
  |  \
  |   \   ← Still decreasing
  |    \
  |_____\______→ Iterations

Action: Need more iterations or larger learning rate
```

### Diverging

```
Cost
  ↑    ___---
  |  _-
  | /   ← Cost increasing!
  |/
  |____________→ Iterations

Problem: Learning rate too large!
Action: Reduce learning rate
```

### Oscillating

```
Cost
  ↑ \/\/\/\
  |  \/\/\/  ← Oscillating
  |___\/\______→ Iterations

Problem: Learning rate too large or poor conditioning
Action: Reduce learning rate, scale features
```

## Convergence Rate

### For Convex Functions (Linear Regression)

**Theoretical guarantee:** Gradient descent converges to global minimum!

```
Cost landscape (convex):
     ↑
    /|\    ← Only ONE minimum
   / | \      (bowl shape)
  /  |  \
 /   o   \   ← Guaranteed to find it!
/____|____\
```

**Convergence rate:** O(1/k) for fixed learning rate

```
Cost after k iterations: J(β_k) - J(β*) ≤ C/k

Where:
C = constant depending on problem
k = number of iterations
```

### For Non-Convex Functions (Neural Networks)

**No global guarantee!** May converge to local minimum.

```
Non-convex landscape:
     ↑
 /\  |  /\    ← Multiple minima
/  \_|_/  \
   o | o     ← May get stuck in local minimum
_____|_____

Solution: SGD noise helps escape local minima
```

## Practical Convergence Monitoring

### Plot Cost History

```python
import matplotlib.pyplot as plt

def plot_convergence(cost_history):
    """
    Visualize convergence behavior
    """
    plt.figure(figsize=(12, 5))

    # Plot 1: Full history
    plt.subplot(1, 2, 1)
    plt.plot(cost_history)
    plt.xlabel('Iteration')
    plt.ylabel('Cost')
    plt.title('Full Training History')
    plt.grid(True)

    # Plot 2: Last 20% (zoom to see convergence)
    plt.subplot(1, 2, 2)
    start_idx = int(0.8 * len(cost_history))
    plt.plot(range(start_idx, len(cost_history)),
             cost_history[start_idx:])
    plt.xlabel('Iteration')
    plt.ylabel('Cost')
    plt.title('Final 20% (Convergence Detail)')
    plt.grid(True)

    plt.tight_layout()
    plt.show()

# Usage
beta, cost_history, converged = gradient_descent_with_convergence(X, y)
plot_convergence(cost_history)
```

### Convergence Diagnostics

```python
def diagnose_convergence(cost_history, threshold=1e-6):
    """
    Analyze convergence behavior
    """
    if len(cost_history) < 10:
        return "Insufficient iterations for diagnosis"

    # Check monotonic decrease
    increasing = sum(1 for i in range(1, len(cost_history))
                     if cost_history[i] > cost_history[i-1])

    if increasing > len(cost_history) * 0.1:
        return "PROBLEM: Cost frequently increases (reduce learning rate)"

    # Check final convergence
    recent_costs = cost_history[-10:]
    recent_change = max(recent_costs) - min(recent_costs)

    if recent_change < threshold:
        return "GOOD: Converged successfully"
    elif recent_change < threshold * 100:
        return "ALMOST: Near convergence (few more iterations needed)"
    else:
        return "NOT CONVERGED: Still decreasing significantly"

# Usage
diagnosis = diagnose_convergence(cost_history)
print(diagnosis)
```

## Early Stopping

Prevent overfitting by stopping before full convergence:

```python
def gradient_descent_with_early_stopping(X_train, y_train, X_val, y_val,
                                        learning_rate=0.01, max_epochs=1000,
                                        patience=10):
    """
    Stop when validation error stops decreasing
    """
    n, p = X_train.shape
    beta = np.zeros(p)

    best_val_cost = float('inf')
    best_beta = beta.copy()
    patience_counter = 0

    for epoch in range(max_epochs):
        # Train for one epoch
        beta = mini_batch_gd_epoch(X_train, y_train, beta, learning_rate)

        # Evaluate on validation set
        val_predictions = X_val @ beta
        val_cost = (1/(2*len(y_val))) * np.sum((val_predictions - y_val)**2)

        # Check if validation improved
        if val_cost < best_val_cost:
            best_val_cost = val_cost
            best_beta = beta.copy()
            patience_counter = 0
        else:
            patience_counter += 1

        # Early stopping
        if patience_counter >= patience:
            print(f"Early stopping at epoch {epoch}")
            print(f"Best validation cost: {best_val_cost:.4f}")
            break

    return best_beta

# Usage
beta = gradient_descent_with_early_stopping(
    X_train, y_train, X_val, y_val,
    patience=20
)
```

## Theoretical Convergence Guarantees

### For Strongly Convex Functions

With appropriate learning rate α ≤ 1/L (where L is Lipschitz constant):

```
Convergence rate: Linear (exponential)

||β_k - β*|| ≤ (1 - α/κ)^k ||β_0 - β*||

Where:
κ = condition number of Hessian
k = iteration number

Practical meaning: Exponentially fast convergence!
```

### For General Convex Functions

```
Convergence rate: Sublinear

J(β_k) - J(β*) ≤ O(1/k)

Practical meaning: Slower, but still guaranteed
```

## Common Pitfalls

**Pitfall 1: Stopping too early**
```
Stop after cost stops decreasing for 1-2 iterations
Problem: Might be on plateau, not converged
Solution: Use patience parameter (wait several iterations)
```

**Pitfall 2: Epsilon too large**
```
epsilon = 1e-2 → stops prematurely
Solution: Use 1e-6 or 1e-8 for better convergence
```

**Pitfall 3: No maximum iterations**
```
Can run forever if convergence criteria never met
Solution: Always set max_iterations as safety
```

**Pitfall 4: Not checking divergence**
```
Cost increasing but no check → wasted computation
Solution: Stop if cost increases significantly
```

## Quick Reference

**Recommended convergence criterion:**
```python
# Relative cost change with patience
if abs(cost - prev_cost) / prev_cost < 1e-6:
    patience_counter += 1
    if patience_counter >= 10:
        break  # Converged
```

**Typical settings:**
```
epsilon:         1e-6 to 1e-8
max_iterations:  1,000 to 10,000
patience:        10 to 50
```

**Convergence checklist:**
```
✓ Cost decreasing monotonically?
✓ Cost change < epsilon for several iterations?
✓ Gradient norm small?
✓ Visual inspection of cost curve?
✓ Validation performance stable?
```

**For linear regression:**
- Convex cost function
- Guaranteed global convergence
- Typical iterations: 100-1000

---

## Navigation

**Previous:** [Learning Rate](gd-06-learning-rate.md)

**Next:** [Implementation](gd-08-implementation.md)

**Series:**
- [Introduction and Intuition](gd-01-introduction-intuition.md)
- [Mathematical Formulation](gd-02-mathematical-formulation.md)
- [Batch Gradient Descent](gd-03-batch-gradient-descent.md)
- [Stochastic Gradient Descent](gd-04-stochastic-gradient-descent.md)
- [Mini-Batch & Comparison](gd-05-minibatch-comparison.md)
- [Learning Rate](gd-06-learning-rate.md)
- Convergence (this file)
- [Implementation](gd-08-implementation.md)
- [Advanced Optimizers](gd-09-advanced-optimizers.md)
- [Interview Guide](gd-10-interview-guide.md)
