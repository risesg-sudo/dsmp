# Advanced Optimizers and Challenges

## What You'll Learn

Vanilla gradient descent has limitations that advanced optimizers address. You'll learn about momentum, Adam, RMSprop, and other modern techniques that power deep learning, plus how to handle common challenges in optimization.

## Common Challenges with Vanilla GD

### 1. Slow Convergence in Ravines

**Problem:** Oscillates in steep valleys, slow progress along gentle slope.

```
Cost landscape:
     ___
    |   |  ← Steep walls (large gradient)
    |   |
    | o |  ← Gentle floor (small gradient)
    |___|

Path: Zigzags back and forth, slow forward progress
```

**Solution:** Momentum

### 2. Saddle Points

**Problem:** Gradient near zero but not at minimum.

```
Saddle point:
       _
      / \    ← Minimum in one direction
     /   \
    o_____o  ← Maximum in another

Gradient ≈ 0 but not optimal!
```

**Solution:** Momentum, adaptive methods

### 3. Different Scale Features

**Problem:** Parameters need different learning rates.

**Solution:** Adaptive methods (AdaGrad, RMSprop, Adam)

## Momentum

**Core idea:** Add velocity term that accumulates gradient direction.

### Algorithm

```
v := γv + α∇J(β)
β := β - v

Where:
v = velocity vector
γ = momentum coefficient (typically 0.9)
α = learning rate
```

### Intuition

Think of a ball rolling downhill:
- Gains speed going downhill (accumulates momentum)
- Dampens oscillations (averages direction)
- Pushes through small bumps (overcomes local minima)

### Implementation

```python
def gradient_descent_with_momentum(X, y, learning_rate=0.01,
                                  gamma=0.9, iterations=1000):
    """
    Gradient Descent with Momentum

    Parameters:
    -----------
    gamma : float
        Momentum coefficient (0.9 typical)
    """
    n, p = X.shape
    beta = np.zeros(p)
    velocity = np.zeros(p)  # Initialize velocity
    cost_history = []

    for i in range(iterations):
        # Compute gradient
        predictions = X @ beta
        gradient = (1/n) * X.T @ (predictions - y)

        # Update velocity (accumulate momentum)
        velocity = gamma * velocity + learning_rate * gradient

        # Update parameters with velocity
        beta = beta - velocity

        # Track cost
        cost = (1/(2*n)) * np.sum((predictions - y)**2)
        cost_history.append(cost)

    return beta, cost_history
```

### Visual Comparison

```
Vanilla GD:           With Momentum:
    \|/|\/                \
     \|/                   \___
      X  ← Oscillates          \___  ← Smooth
     /|\                            o
```

### When to Use

**Use momentum when:**
- Cost landscape has ravines
- Vanilla GD is too slow
- You need faster convergence
- Working with neural networks

**Typical value:** γ = 0.9

## Nesterov Accelerated Gradient (NAG)

**Improvement over momentum:** Look ahead before computing gradient.

### Algorithm

```
v := γv + α∇J(β - γv)  ← Gradient at lookahead position
β := β - v
```

**Key difference:** Computes gradient at anticipated future position, not current.

### Why It's Better

```
Standard Momentum:
1. Compute gradient at current position
2. Jump using accumulated velocity
→ May overshoot

Nesterov:
1. Look ahead using current velocity
2. Compute gradient at lookahead position
3. Make smarter correction
→ More accurate
```

### Implementation

```python
def nesterov_momentum(X, y, learning_rate=0.01, gamma=0.9, iterations=1000):
    """
    Nesterov Accelerated Gradient
    """
    n, p = X.shape
    beta = np.zeros(p)
    velocity = np.zeros(p)
    cost_history = []

    for i in range(iterations):
        # Look ahead
        beta_lookahead = beta - gamma * velocity

        # Compute gradient at lookahead position
        predictions = X @ beta_lookahead
        gradient = (1/n) * X.T @ (predictions - y)

        # Update velocity and parameters
        velocity = gamma * velocity + learning_rate * gradient
        beta = beta - velocity

        # Track cost (at current position)
        predictions = X @ beta
        cost = (1/(2*n)) * np.sum((predictions - y)**2)
        cost_history.append(cost)

    return beta, cost_history
```

## AdaGrad (Adaptive Gradient)

**Core idea:** Adapt learning rate for each parameter based on historical gradients.

### Algorithm

```
G := G + (∇J)²  (element-wise)
β := β - (α / √(G + ε)) ⊙ ∇J

Where:
G = sum of squared gradients
ε = small constant (1e-8)
⊙ = element-wise multiplication
```

### Effect

Parameters with:
- **Large accumulated gradients** → smaller effective learning rate
- **Small accumulated gradients** → larger effective learning rate

### Implementation

```python
def adagrad(X, y, learning_rate=0.01, epsilon=1e-8, iterations=1000):
    """
    AdaGrad optimizer
    """
    n, p = X.shape
    beta = np.zeros(p)
    G = np.zeros(p)  # Accumulated squared gradients
    cost_history = []

    for i in range(iterations):
        # Compute gradient
        predictions = X @ beta
        gradient = (1/n) * X.T @ (predictions - y)

        # Accumulate squared gradient
        G = G + gradient ** 2

        # Adaptive learning rate
        adjusted_lr = learning_rate / (np.sqrt(G + epsilon))

        # Update parameters
        beta = beta - adjusted_lr * gradient

        # Track cost
        cost = (1/(2*n)) * np.sum((predictions - y)**2)
        cost_history.append(cost)

    return beta, cost_history
```

### Pros and Cons

**Advantages:**
- No manual learning rate tuning per parameter
- Works well for sparse data
- Natural annealing

**Disadvantages:**
- Learning rate keeps decreasing
- May stop learning too early
- Not ideal for deep learning

## RMSprop (Root Mean Square Propagation)

**Core idea:** Fix AdaGrad by using exponential moving average.

### Algorithm

```
G := ρG + (1-ρ)(∇J)²
β := β - (α / √(G + ε)) ⊙ ∇J

Where:
ρ = decay rate (typically 0.9)
```

### Key Difference from AdaGrad

```
AdaGrad:  G = sum of ALL past gradients²  → always increasing
RMSprop:  G = exponential average          → can decrease
```

### Implementation

```python
def rmsprop(X, y, learning_rate=0.001, rho=0.9, epsilon=1e-8, iterations=1000):
    """
    RMSprop optimizer
    """
    n, p = X.shape
    beta = np.zeros(p)
    G = np.zeros(p)
    cost_history = []

    for i in range(iterations):
        # Compute gradient
        predictions = X @ beta
        gradient = (1/n) * X.T @ (predictions - y)

        # Exponential moving average of squared gradient
        G = rho * G + (1 - rho) * (gradient ** 2)

        # Adaptive learning rate
        adjusted_lr = learning_rate / (np.sqrt(G + epsilon))

        # Update parameters
        beta = beta - adjusted_lr * gradient

        # Track cost
        cost = (1/(2*n)) * np.sum((predictions - y)**2)
        cost_history.append(cost)

    return beta, cost_history
```

## Adam (Adaptive Moment Estimation)

**The gold standard:** Combines momentum + RMSprop.

### Algorithm

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

### Implementation

```python
def adam(X, y, learning_rate=0.001, beta1=0.9, beta2=0.999,
         epsilon=1e-8, iterations=1000):
    """
    Adam optimizer - most popular for deep learning
    """
    n, p = X.shape
    beta = np.zeros(p)
    m = np.zeros(p)  # First moment (momentum)
    v = np.zeros(p)  # Second moment (RMSprop)
    cost_history = []

    for t in range(1, iterations + 1):
        # Compute gradient
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

        # Track cost
        predictions = X @ beta
        cost = (1/(2*n)) * np.sum((predictions - y)**2)
        cost_history.append(cost)

    return beta, cost_history
```

### Why Adam is Popular

1. **Combines best of both worlds**
   - Momentum: smooths gradients
   - RMSprop: adapts per-parameter learning rates

2. **Works out of the box**
   - Default parameters work well
   - Less tuning needed

3. **Fast convergence**
   - Faster than SGD initially
   - Good for quick experiments

4. **Handles sparse gradients**
   - Works with sparse data
   - Suitable for NLP, recommendation systems

## Comprehensive Comparison

### Performance Table

| Optimizer | Speed | Stability | Tuning | Best For |
|-----------|-------|-----------|--------|----------|
| **SGD** | Slow | High | Hard | Simple problems |
| **Momentum** | Fast | Medium | Medium | Ravines |
| **AdaGrad** | Fast | Medium | Easy | Sparse data |
| **RMSprop** | Fast | High | Easy | RNNs |
| **Adam** | Very Fast | High | Easy | **Default choice** |

### Visual Comparison: Convergence Paths

```python
# Compare all optimizers
optimizers = {
    'SGD': batch_gradient_descent,
    'Momentum': gradient_descent_with_momentum,
    'AdaGrad': adagrad,
    'RMSprop': rmsprop,
    'Adam': adam
}

plt.figure(figsize=(15, 5))

for i, (name, optimizer) in enumerate(optimizers.items(), 1):
    beta, cost_history = optimizer(X_scaled, y)

    plt.subplot(1, 5, i)
    plt.plot(cost_history)
    plt.xlabel('Iteration')
    plt.ylabel('Cost')
    plt.title(name)
    plt.grid(True)

plt.tight_layout()
plt.show()
```

## When to Use Each Optimizer

### SGD (with or without momentum)

```
Use when:
- Need best final accuracy
- Have time to tune hyperparameters
- Simple problems
- Want reproducible results

Settings:
learning_rate: 0.01-0.1
momentum: 0.9
```

### Adam

```
Use when:
- Default choice for deep learning
- Quick prototyping
- Don't want to tune much
- Sparse data

Settings:
learning_rate: 0.001
beta1: 0.9
beta2: 0.999
```

### RMSprop

```
Use when:
- Training RNNs
- Adam not working
- Need adaptive learning rates

Settings:
learning_rate: 0.001
rho: 0.9
```

### Momentum/Nesterov

```
Use when:
- SGD too slow
- Cost landscape has ravines
- Want faster than SGD, simpler than Adam

Settings:
learning_rate: 0.01
gamma: 0.9
```

## Practical Recommendations

### Default Strategy

```python
# Start with Adam
model = Adam(learning_rate=0.001)

# If needs fine-tuning
model = SGD_with_momentum(learning_rate=0.01, momentum=0.9)
```

### For Research

```python
# Best reproducibility and final performance
1. Train with Adam (fast initial progress)
2. Fine-tune with SGD + momentum (better final accuracy)
3. Use learning rate decay
```

### For Production

```python
# Reliability and speed
Adam with conservative learning rate (0.0001-0.001)
Early stopping on validation set
```

## Common Pitfalls

**Pitfall 1: Using wrong optimizer for problem**
```
Deep learning with vanilla SGD → too slow
Solution: Use Adam or RMSprop
```

**Pitfall 2: Not tuning Adam's learning rate**
```
Default α=0.001 may be wrong for your problem
Solution: Try [0.0001, 0.001, 0.01]
```

**Pitfall 3: Expecting Adam to always win**
```
Sometimes SGD+momentum finds better solutions
Solution: Try both, compare final performance
```

**Pitfall 4: Forgetting bias correction in Adam**
```
Without correction, early updates are biased
Solution: Always use bias-corrected m̂ and v̂
```

## Quick Reference

**Default choices:**
```
General purpose:     Adam (α=0.001)
Simple problems:     SGD + momentum (α=0.01, γ=0.9)
RNNs:               RMSprop (α=0.001)
Sparse data:        AdaGrad
```

**Hyperparameters:**
```
Adam:      α=0.001, β₁=0.9, β₂=0.999
RMSprop:   α=0.001, ρ=0.9
Momentum:  α=0.01, γ=0.9
```

**Rule of thumb:**
1. Start with Adam
2. If not satisfied, try SGD + momentum with decay
3. Tune learning rate first, other hyperparameters second

---

## Navigation

**Previous:** [Implementation](gd-08-implementation.md)

**Next:** [Interview Guide](gd-10-interview-guide.md)

**Series:**
- [Introduction and Intuition](gd-01-introduction-intuition.md)
- [Mathematical Formulation](gd-02-mathematical-formulation.md)
- [Batch Gradient Descent](gd-03-batch-gradient-descent.md)
- [Stochastic Gradient Descent](gd-04-stochastic-gradient-descent.md)
- [Mini-Batch & Comparison](gd-05-minibatch-comparison.md)
- [Learning Rate](gd-06-learning-rate.md)
- [Convergence](gd-07-convergence.md)
- [Implementation](gd-08-implementation.md)
- Advanced Optimizers (this file)
- [Interview Guide](gd-10-interview-guide.md)
