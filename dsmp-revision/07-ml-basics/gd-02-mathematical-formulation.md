# Gradient Descent: Mathematical Formulation

## What You'll Learn

This guide demystifies the mathematics behind gradient descent. You'll learn how to derive gradients, understand the update rules, and see the elegant vector formulation that makes gradient descent work efficiently. The mathematics here isn't just theory - it's the foundation for implementing gradient descent from scratch.

## The General Update Rule

At its core, gradient descent follows this simple principle:

```
β := β - α∇J(β)

Where:
β = parameter vector [β₀, β₁, β₂, ..., βₚ]
α = learning rate (step size)
∇J(β) = gradient vector [∂J/∂β₀, ∂J/∂β₁, ..., ∂J/∂βₚ]
```

This formula says: "Move parameters in the opposite direction of the gradient, proportional to the learning rate."

## Computing the Gradient

For linear regression, our cost function is:

```
J(β) = (1/2n) Σ(yᵢ - ŷᵢ)²
     = (1/2n) Σ(yᵢ - (β₀ + β₁x₁ᵢ + ... + βₚxₚᵢ))²
```

The gradient is a vector of partial derivatives:

```
∇J(β) = [∂J/∂β₀, ∂J/∂β₁, ∂J/∂β₂, ..., ∂J/∂βₚ]
```

### Partial Derivative with Respect to βⱼ

Taking the partial derivative with respect to any coefficient βⱼ:

```
∂J/∂βⱼ = ∂/∂βⱼ [(1/2n) Σ(yᵢ - ŷᵢ)²]

Using chain rule:
= (1/2n) Σ 2(yᵢ - ŷᵢ) · ∂/∂βⱼ(yᵢ - ŷᵢ)
= (1/2n) Σ 2(yᵢ - ŷᵢ) · (-xⱼᵢ)
= -(1/n) Σ(yᵢ - ŷᵢ)xⱼᵢ
```

Or equivalently:

```
∂J/∂βⱼ = (1/n) Σ(ŷᵢ - yᵢ)xⱼᵢ
```

### Matrix Form (The Elegant Way)

In matrix notation, the gradient becomes beautifully simple:

```
∇J(β) = (1/n) Xᵀ(Xβ - y)

Where:
X = design matrix (n × p)
y = target vector (n × 1)
β = coefficient vector (p × 1)
```

This single line captures all partial derivatives at once - a testament to the power of linear algebra.

## The Complete Update Rule for Linear Regression

### Component-wise Form

For each parameter βⱼ:

```
βⱼ := βⱼ - α(1/n) Σ(ŷᵢ - yᵢ)xⱼᵢ

Where j = 0, 1, 2, ..., p
```

### Vector Form (Preferred)

```
β := β - (α/n) Xᵀ(Xβ - y)
```

The vector form is:
- More compact and elegant
- Faster to compute (vectorized operations)
- Less prone to implementation bugs
- What you'll use in practice

## Step-by-Step Algorithm

Here's the complete gradient descent algorithm:

```
1. Initialize parameters:
   β = zeros(p) or random values

2. Repeat until convergence:

   a. Compute predictions for all samples:
      ŷ = Xβ

   b. Compute gradient:
      ∇J = (1/n)Xᵀ(ŷ - y)

   c. Update parameters:
      β := β - α∇J

   d. Check convergence:
      If |J(β_new) - J(β_old)| < ε, stop

3. Return β
```

## Detailed Derivation: Simple Linear Regression

Let's derive the gradient for the simplest case: y = β₀ + β₁x

**Cost function:**
```
J(β₀, β₁) = (1/2n) Σ(yᵢ - β₀ - β₁xᵢ)²
```

**Partial derivative w.r.t. β₀ (intercept):**
```
∂J/∂β₀ = ∂/∂β₀ [(1/2n) Σ(yᵢ - β₀ - β₁xᵢ)²]
       = (1/2n) Σ 2(yᵢ - β₀ - β₁xᵢ) · (-1)
       = -(1/n) Σ(yᵢ - β₀ - β₁xᵢ)
       = (1/n) Σ(ŷᵢ - yᵢ)
```

**Partial derivative w.r.t. β₁ (slope):**
```
∂J/∂β₁ = ∂/∂β₁ [(1/2n) Σ(yᵢ - β₀ - β₁xᵢ)²]
       = (1/2n) Σ 2(yᵢ - β₀ - β₁xᵢ) · (-xᵢ)
       = -(1/n) Σ(yᵢ - β₀ - β₁xᵢ)xᵢ
       = (1/n) Σ(ŷᵢ - yᵢ)xᵢ
```

**Update rules:**
```
β₀ := β₀ - α(1/n)Σ(ŷᵢ - yᵢ)
β₁ := β₁ - α(1/n)Σ(ŷᵢ - yᵢ)xᵢ
```

## Numerical Example

Let's walk through one iteration with concrete numbers.

**Given:**
- Data: {(1, 2), (2, 4), (3, 5)}
- Current: β₀ = 0, β₁ = 1
- Learning rate: α = 0.1

**Step 1: Compute predictions**
```
ŷ₁ = 0 + 1(1) = 1
ŷ₂ = 0 + 1(2) = 2
ŷ₃ = 0 + 1(3) = 3
```

**Step 2: Compute errors**
```
e₁ = ŷ₁ - y₁ = 1 - 2 = -1
e₂ = ŷ₂ - y₂ = 2 - 4 = -2
e₃ = ŷ₃ - y₃ = 3 - 5 = -2
```

**Step 3: Compute gradients**
```
∂J/∂β₀ = (1/3)(e₁ + e₂ + e₃)
       = (1/3)(-1 - 2 - 2)
       = -5/3

∂J/∂β₁ = (1/3)(e₁x₁ + e₂x₂ + e₃x₃)
       = (1/3)(-1·1 + -2·2 + -2·3)
       = (1/3)(-11)
       = -11/3
```

**Step 4: Update parameters**
```
β₀ := 0 - 0.1(-5/3) = 0.167
β₁ := 1 - 0.1(-11/3) = 1.367
```

After just one iteration, our line improved from y = x to y = 0.167 + 1.367x, which fits the data better.

## Understanding the Math Intuitively

**Why does the gradient formula work?**

The gradient ∂J/∂βⱼ tells us:
- **Direction:** Positive gradient means increasing βⱼ increases cost (so decrease βⱼ)
- **Magnitude:** Large gradient means cost is very sensitive to βⱼ (take bigger steps)
- **Weighted by features:** Multiplying by xⱼᵢ means features with larger values have more influence

**The (1/n) normalization:**
- Makes gradient independent of dataset size
- Allows same learning rate across different datasets
- Creates average gradient per sample

## Common Pitfalls

**Pitfall 1: Forgetting the negative sign**
```
Wrong: β := β + α∇J  (moves uphill!)
Right: β := β - α∇J  (moves downhill)
```

**Pitfall 2: Using ŷ - y vs y - ŷ**
Both work if you're consistent:
```
Option 1: ∇J = (1/n)Xᵀ(Xβ - y), update: β := β - α∇J
Option 2: ∇J = (1/n)Xᵀ(y - Xβ), update: β := β + α∇J
```

**Pitfall 3: Simultaneous vs sequential updates**
Always update all parameters simultaneously:
```
Right:
temp₀ = β₀ - α∇J₀
temp₁ = β₁ - α∇J₁
β₀ = temp₀
β₁ = temp₁

Wrong:
β₀ = β₀ - α∇J₀  (changes β₀ before computing ∇J₁)
β₁ = β₁ - α∇J₁  (uses updated β₀)
```

## Best Practices

**1. Always vectorize**
```python
# Slow (loop)
for i in range(n):
    gradient += (predictions[i] - y[i]) * X[i]

# Fast (vectorized)
gradient = X.T @ (predictions - y) / n
```

**2. Check gradient numerically**
```python
# Numerical gradient (for debugging)
def numerical_gradient(X, y, beta, epsilon=1e-7):
    grad = np.zeros_like(beta)
    for i in range(len(beta)):
        beta_plus = beta.copy()
        beta_plus[i] += epsilon
        beta_minus = beta.copy()
        beta_minus[i] -= epsilon
        grad[i] = (cost(X, y, beta_plus) - cost(X, y, beta_minus)) / (2 * epsilon)
    return grad
```

**3. Monitor cost decrease**
The cost should decrease monotonically (for batch gradient descent). If it increases, your learning rate is too high or there's a bug.

## Quick Reference

**Gradient for linear regression:**
```
Component form: ∂J/∂βⱼ = (1/n) Σ(ŷᵢ - yᵢ)xⱼᵢ
Matrix form:    ∇J(β) = (1/n) Xᵀ(Xβ - y)
```

**Update rule:**
```
Component form: βⱼ := βⱼ - α(1/n) Σ(ŷᵢ - yᵢ)xⱼᵢ
Matrix form:    β := β - (α/n) Xᵀ(Xβ - y)
```

---

## Navigation

**Previous:** [Introduction and Intuition](gd-01-introduction-intuition.md)

**Next:** [Batch Gradient Descent](gd-03-batch-gradient-descent.md)

**Series:**
- [Introduction and Intuition](gd-01-introduction-intuition.md)
- Mathematical Formulation (this file)
- [Batch Gradient Descent](gd-03-batch-gradient-descent.md)
- [Stochastic Gradient Descent](gd-04-stochastic-gradient-descent.md)
- [Mini-Batch & Comparison](gd-05-minibatch-comparison.md)
- [Learning Rate](gd-06-learning-rate.md)
- [Convergence](gd-07-convergence.md)
- [Implementation](gd-08-implementation.md)
- [Advanced Optimizers](gd-09-advanced-optimizers.md)
- [Interview Guide](gd-10-interview-guide.md)
