# Gradient Descent: Interview Guide

## What You'll Learn

This comprehensive interview guide prepares you for gradient descent questions at any level - from basic concepts to advanced derivations. Each question includes detailed answers and follow-up topics interviewers commonly explore.

## Basic Level Questions

### Q1: What is gradient descent and why do we use it?

**Answer:**

Gradient descent is an iterative optimization algorithm that finds the minimum of a function by repeatedly moving in the direction of steepest descent (opposite to the gradient).

**Update rule:** β := β - α∇J(β)

**Why use it:**
- Direct solutions (like normal equation) are O(n³) - too slow for large datasets
- Gradient descent is O(kn) - scales well
- Works with streaming/online data
- Always works (no matrix inversion issues)
- Essential for neural networks

**Follow-up:** "When would you use normal equation instead?"
- Small datasets (n < 10,000)
- When exact solution needed
- Sufficient memory available

---

### Q2: Explain the three types of gradient descent.

**Answer:**

| Type | Samples per Update | Characteristics |
|------|-------------------|-----------------|
| **Batch** | All (n) | Stable, slow for large data |
| **Stochastic** | 1 | Fast, noisy, enables online learning |
| **Mini-Batch** | m (32-256) | Best of both worlds |

**Batch GD:**
- Uses entire dataset for one update
- Smooth convergence
- Best for small datasets

**Stochastic GD:**
- One random sample per update
- Very fast, noisy path
- Best for huge datasets

**Mini-Batch GD:**
- Small subset per update
- Balanced performance
- **Standard in deep learning**

**Follow-up:** "Which would you use and why?"
- Mini-batch for most cases (GPU-efficient, good convergence)
- Batch for small data (< 10K samples)
- Stochastic for streaming data

---

### Q3: What is the learning rate and why is it important?

**Answer:**

Learning rate (α) controls the step size in parameter updates:

```
β := β - α∇J(β)
        ↑
    Learning rate
```

**Why critical:**

**Too small (α = 0.0001):**
- Painfully slow convergence
- May get stuck on plateaus
- Wastes computational resources

**Too large (α = 1.0):**
- Overshoots minimum
- Cost increases (diverges)
- Training fails completely

**Just right (α = 0.01):**
- Fast, stable convergence
- Reaches minimum efficiently

**How to find:**
1. Start with 0.01 (for scaled features)
2. Use learning rate finder
3. Monitor cost curve
4. If cost increases → reduce α
5. If too slow → increase α

**Follow-up:** "How do you know if learning rate is too large?"
- Cost increases over iterations
- Training diverges
- NaN/Inf values appear

---

### Q4: What is the difference between an epoch and an iteration?

**Answer:**

**Iteration:** One parameter update

**Epoch:** One complete pass through the entire dataset

**Relationship depends on method:**

```
Batch GD:
1 epoch = 1 iteration
(All data used in one update)

Stochastic GD:
1 epoch = n iterations
(n separate updates, one per sample)

Mini-Batch GD:
1 epoch = n/m iterations
(n/m updates with batch size m)
```

**Example:**
- Dataset: 1000 samples
- Batch size: 100

One epoch = 1000/100 = 10 iterations

---

### Q5: How do you know gradient descent is working?

**Answer:**

**Primary method:** Plot cost vs iterations

**Good convergence:**
```
Cost
  ↑
  |‾\
  |  \___
  |______\_____ ← Flattens out
  |____________→ Iterations
```

**Warning signs:**

**Cost increasing:**
```
Learning rate too large → reduce by factor of 10
```

**Cost oscillating:**
```
Features not scaled or α too large
→ Scale features, reduce α
```

**Very slow decrease:**
```
Learning rate too small → increase α
Or: Need more iterations
```

**Convergence criteria:**
```python
if abs(cost - prev_cost) / prev_cost < 1e-6:
    converged = True
```

---

## Intermediate Level Questions

### Q6: Derive the gradient for linear regression.

**Answer:**

**Cost function:**
```
J(β) = (1/2n) Σ(yᵢ - Xᵢβ)²
```

**In matrix form:**
```
J(β) = (1/2n)(Xβ - y)ᵀ(Xβ - y)
     = (1/2n)(βᵀXᵀXβ - 2βᵀXᵀy + yᵀy)
```

**Take derivative:**
```
∂J/∂β = (1/2n)(2XᵀXβ - 2Xᵀy)
      = (1/n)(XᵀXβ - Xᵀy)
      = (1/n)Xᵀ(Xβ - y)
```

**Update rule:**
```
β := β - α·(1/n)Xᵀ(Xβ - y)
```

**Follow-up:** "Why the 1/2n factor?"
- Makes derivative cleaner (cancels with 2 from chain rule)
- Normalizes by dataset size
- Doesn't affect minimum location

---

### Q7: Why is feature scaling important for gradient descent?

**Answer:**

**Unscaled features** cause elongated cost contours:

```
x₁ ∈ [0, 1000] (area in sq ft)
x₂ ∈ [1, 5]    (bedrooms)

Cost contours:
     β₂
      ↑
      | ⬭  ← Elongated ellipse
      |⬭
      |___________→ β₁

Result: Slow zigzag convergence
```

**Scaled features** create symmetric contours:

```
Both ∈ [-1, 1]

Cost contours:
     β₂
      ↑
      | ⃝  ← Circular
      |
      |___________→ β₁

Result: Direct path to minimum
```

**Impact:**
- Without scaling: May need 10,000+ iterations
- With scaling: Converges in 100-1000 iterations
- Can use larger learning rate
- More stable training

**Best practice:**
```python
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

**Follow-up:** "What scaling method do you use?"
- StandardScaler (most common): (x - μ)/σ
- MinMaxScaler: scale to [0,1] or [-1,1]
- RobustScaler: for outliers

---

### Q8: Compare batch GD with mini-batch GD.

**Answer:**

| Feature | Batch GD | Mini-Batch GD |
|---------|----------|---------------|
| **Samples/update** | n | m (32-256) |
| **Updates/epoch** | 1 | n/m |
| **Convergence** | Smooth | Slightly noisy |
| **Speed** | Slow | Fast |
| **Memory** | High | Medium |
| **GPU efficiency** | Poor | Excellent |
| **Use case** | Small data | Default choice |

**When to use each:**

**Batch GD:**
- n < 10,000
- Need deterministic results
- Research/debugging

**Mini-Batch GD:**
- Any medium-large dataset
- Deep learning (always)
- GPU available
- **Default choice**

**Why mini-batch wins:**
- Vectorized operations (GPU-efficient)
- Balanced between speed and stability
- More frequent updates than batch
- Less noise than stochastic

---

### Q9: What is momentum and why does it help?

**Answer:**

**Momentum** adds a velocity term that accumulates gradient direction:

```
v := γv + α∇J
β := β - v

γ = momentum coefficient (typically 0.9)
```

**Why it helps:**

**Problem without momentum:**
```
     ___
    |   |  ← Ravine (steep sides, gentle floor)
    |\/\|  ← Oscillates
    | X |  ← Slow progress
    |___|
```

**With momentum:**
```
     ___
    |   |
    | \ |  ← Dampened oscillations
    |  \|  ← Faster progress
    |___o
```

**Benefits:**
1. **Dampens oscillations** in ravines
2. **Accelerates** in consistent direction
3. **Overcomes** small local minima
4. **Faster convergence** overall

**Intuition:** Ball rolling downhill gains speed

**Follow-up:** "What value for gamma?"
- Standard: 0.9
- Can try: 0.95 or 0.99 for more momentum
- Start with 0.9

---

### Q10: What is the convergence guarantee for gradient descent?

**Answer:**

**For convex functions (linear regression):**
- **Guaranteed** to converge to global minimum
- Only one minimum exists
- Will find it with appropriate learning rate

```
Convergence rate: O(1/k)
Cost after k iterations: J(β_k) - J(β*) ≤ C/k
```

**For non-convex functions (neural networks):**
- May converge to local minimum
- No global convergence guarantee
- Multiple minima exist

```
    /\  /\    ← Multiple minima
   /  \/  \
  o    o    ← Could get stuck
```

**How to improve for non-convex:**
- Use SGD (noise helps escape local minima)
- Multiple random initializations
- Momentum/Adam
- Learning rate schedules

**Follow-up:** "What if learning rate is too large?"
- May not converge at all
- Cost oscillates or increases
- Diverges to infinity

---

## Advanced Level Questions

### Q11: Explain Adam optimizer and why it's popular.

**Answer:**

**Adam = Momentum + RMSprop**

**Algorithm:**
```
m := β₁m + (1-β₁)∇J        (first moment - momentum)
v := β₂v + (1-β₂)(∇J)²     (second moment - adaptive LR)

m̂ := m/(1-β₁ᵗ)            (bias correction)
v̂ := v/(1-β₂ᵗ)

β := β - α·m̂/(√v̂ + ε)
```

**Default hyperparameters:**
- α = 0.001
- β₁ = 0.9
- β₂ = 0.999
- ε = 1e-8

**Why popular:**

1. **Adaptive learning rates** per parameter
2. **Works out-of-the-box** (minimal tuning)
3. **Fast convergence** (combines momentum + RMSprop)
4. **Handles sparse gradients** well
5. **Bias correction** for early iterations
6. **Default choice** in deep learning

**When Adam might not be best:**
- Sometimes SGD+momentum finds better final solution
- May not converge as precisely
- For final fine-tuning, consider SGD

**Follow-up:** "When would you use SGD instead of Adam?"
- When you need absolute best accuracy
- Have time to carefully tune hyperparameters
- Simple convex optimization
- Want most stable/reproducible results

---

### Q12: How do learning rate schedules work?

**Answer:**

Learning rate schedules decrease α over time for better convergence.

**Common schedules:**

**1. Step Decay:**
```python
α = α₀ × 0.5^(epoch//10)

Epoch 0-9:   α = 0.1
Epoch 10-19: α = 0.05
Epoch 20-29: α = 0.025
```

**2. Exponential Decay:**
```python
α = α₀ × e^(-kt)

Smooth exponential decrease
```

**3. Inverse Time:**
```python
α = α₀ / (1 + kt)

Gradually decreases
```

**4. Cosine Annealing:**
```python
α = α₀ × (1 + cos(πt/T)) / 2

Cyclical with warm restarts
```

**Why use schedules:**
- Start with large α for fast progress
- Reduce α for fine-tuning near minimum
- Helps convergence for SGD
- Essential for good final accuracy

**Practical approach:**
```
1. Train with constant LR
2. When plateau, reduce by 10x
3. Repeat until converged
```

---

### Q13: What causes gradient descent to diverge and how do you fix it?

**Answer:**

**Causes of divergence:**

**1. Learning rate too large**
```
Symptoms: Cost increases, NaN/Inf values
Fix: Reduce α by factor of 10
```

**2. Poor feature scaling**
```
Symptoms: Oscillating cost
Fix: StandardScaler before training
```

**3. Gradient explosion**
```
Symptoms: Parameters blow up in deep networks
Fix: Gradient clipping, better initialization
```

**4. Numerical instability**
```
Symptoms: NaN after some iterations
Fix: Add small epsilon, reduce LR
```

**Diagnostic approach:**
```python
def diagnose_divergence(cost_history):
    if cost_history[-1] > cost_history[0]:
        return "Learning rate too large"
    if np.isnan(cost_history[-1]):
        return "Numerical instability"
    if len(set(cost_history[-10:])) == 1:
        return "Stuck (gradient vanished)"
    return "Training normally"
```

**Prevention:**
1. Start with small learning rate (0.01)
2. Always scale features
3. Monitor cost at every iteration
4. Use gradient clipping for deep networks
5. Check for NaN/Inf regularly

---

### Q14: Explain the bias-variance tradeoff in choosing learning rate.

**Answer:**

**Connection to bias-variance:**

**Small learning rate:**
- Takes tiny steps → explores thoroughly
- Lower bias (finds better minimum)
- Higher variance (sensitive to initialization, noise)
- Slower convergence

**Large learning rate:**
- Takes big steps → may skip over good solutions
- Higher bias (may not find best minimum)
- Lower variance (less sensitive to noise)
- Risk of divergence

**Optimal learning rate:**
```
Minimize: Total Error = Bias² + Variance

Too small → High variance (noisy convergence)
Too large → High bias (poor solution) + divergence
Sweet spot → Balanced
```

**Practical approach:**
```
1. Start conservative (α = 0.01)
2. Increase until cost starts oscillating
3. Back off slightly
4. Use learning rate decay
```

**With momentum/Adam:**
- Can use larger learning rates
- Variance reduced by momentum
- More stable training

---

### Q15: How does gradient descent relate to other optimization algorithms?

**Answer:**

**Gradient descent family:**

```
First-order methods (use gradients):
├─ Gradient Descent
├─ SGD
├─ Momentum
├─ Adam/RMSprop
└─ AdaGrad

Second-order methods (use Hessian):
├─ Newton's method
├─ BFGS
└─ L-BFGS

Derivative-free:
├─ Genetic algorithms
├─ Simulated annealing
└─ Grid search
```

**Comparison:**

**Gradient Descent:**
- First-order (uses ∇J only)
- O(knd) complexity
- Works for large-scale
- Deep learning standard

**Newton's Method:**
- Second-order (uses Hessian H)
- β := β - H⁻¹∇J
- Faster convergence (quadratic)
- O(d³) per iteration → prohibitive for large d

**When to use each:**
- **Gradient methods:** Default, scales well, deep learning
- **Newton's method:** Small d, need fast convergence
- **BFGS/L-BFGS:** Medium d, convex optimization
- **Derivative-free:** Non-differentiable, black-box

**Follow-up:** "Why not always use Newton's method?"
- Computing Hessian is O(d²) space, O(d³) time
- Doesn't scale to millions of parameters
- Gradient descent with good optimizer (Adam) is competitive

---

## Quick Reference for Interviews

**Key formulas to memorize:**
```
Update rule:     β := β - α∇J(β)
Gradient:        ∇J = (1/n)Xᵀ(Xβ - y)
Momentum:        v := γv + α∇J; β := β - v
Adam:            Complex, remember it combines momentum + adaptive LR
```

**Common hyperparameters:**
```
Learning rate:   0.01 (scaled features), 0.001 (Adam)
Batch size:      32, 64, 128, 256
Momentum:        0.9
Adam β₁, β₂:     0.9, 0.999
```

**Decision tree for interviews:**
```
Q: Which gradient descent to use?
├─ Small data (n<10k)? → Batch GD
├─ Huge data (n>100k)? → Mini-batch GD
├─ Online learning? → SGD
└─ Default? → Mini-batch GD

Q: Which optimizer?
├─ Quick start? → Adam
├─ Best accuracy? → SGD + momentum + decay
└─ RNN? → RMSprop
```

**Common mistakes to avoid in answers:**
- Forgetting to mention feature scaling
- Not explaining why learning rate matters
- Confusing iteration with epoch
- Missing the difference between batch/mini-batch
- Not knowing Adam is default for deep learning

---

## Navigation

**Previous:** [Advanced Optimizers](gd-09-advanced-optimizers.md)

**Gradient Descent Series Complete!**

**All Files:**
- [Introduction and Intuition](gd-01-introduction-intuition.md)
- [Mathematical Formulation](gd-02-mathematical-formulation.md)
- [Batch Gradient Descent](gd-03-batch-gradient-descent.md)
- [Stochastic Gradient Descent](gd-04-stochastic-gradient-descent.md)
- [Mini-Batch & Comparison](gd-05-minibatch-comparison.md)
- [Learning Rate](gd-06-learning-rate.md)
- [Convergence](gd-07-convergence.md)
- [Implementation](gd-08-implementation.md)
- [Advanced Optimizers](gd-09-advanced-optimizers.md)
- Interview Guide (this file)

**Related Topics:**
- [Regularization Series](reg-01-introduction-bias-variance.md)
