# Complete Implementation Guide

## What You'll Learn

This guide provides production-ready implementations of gradient descent from scratch. You'll see how all the concepts come together into clean, reusable code that you can adapt for your own projects.

## Full-Featured Linear Regression Class

```python
import numpy as np
import matplotlib.pyplot as plt

class LinearRegressionGD:
    """
    Linear Regression using Gradient Descent

    Supports batch, stochastic, and mini-batch gradient descent
    with convergence monitoring and visualization.
    """

    def __init__(self, learning_rate=0.01, method='mini-batch',
                 batch_size=32, max_iterations=1000,
                 epsilon=1e-6, patience=10, verbose=False):
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
            Maximum number of iterations/epochs
        epsilon : float
            Convergence threshold
        patience : int
            Number of iterations to wait before stopping
        verbose : bool
            Print progress during training
        """
        self.learning_rate = learning_rate
        self.method = method
        self.batch_size = batch_size
        self.max_iterations = max_iterations
        self.epsilon = epsilon
        self.patience = patience
        self.verbose = verbose

        self.beta = None
        self.cost_history = []
        self.converged = False

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

    def _add_intercept(self, X):
        """Add column of ones for intercept"""
        return np.column_stack([np.ones(len(X)), X])

    def fit(self, X, y):
        """
        Fit linear regression model

        Parameters:
        -----------
        X : array-like, shape (n_samples, n_features)
        y : array-like, shape (n_samples,)
        """
        # Add intercept column
        X = self._add_intercept(X)
        n, p = X.shape

        # Initialize parameters
        self.beta = np.zeros(p)
        self.cost_history = []
        self.converged = False

        # Choose method
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
        patience_counter = 0

        for iteration in range(self.max_iterations):
            # Compute cost
            cost = self._compute_cost(X, y, self.beta)
            self.cost_history.append(cost)

            # Check convergence
            if iteration > 0:
                cost_change = abs(cost - self.cost_history[-2])
                relative_change = cost_change / self.cost_history[-2]

                if relative_change < self.epsilon:
                    patience_counter += 1
                    if patience_counter >= self.patience:
                        if self.verbose:
                            print(f"Converged at iteration {iteration}")
                        self.converged = True
                        break
                else:
                    patience_counter = 0

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
        patience_counter = 0

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

            # Check convergence
            if epoch > 0:
                cost_change = abs(cost - self.cost_history[-2])
                relative_change = cost_change / self.cost_history[-2]

                if relative_change < self.epsilon:
                    patience_counter += 1
                    if patience_counter >= self.patience:
                        if self.verbose:
                            print(f"Converged at epoch {epoch}")
                        self.converged = True
                        break
                else:
                    patience_counter = 0

            if self.verbose and epoch % 10 == 0:
                print(f"Epoch {epoch}, Cost: {cost:.4f}")

    def predict(self, X):
        """Make predictions"""
        X = self._add_intercept(X)
        return X @ self.beta

    def score(self, X, y):
        """R² score"""
        y_pred = self.predict(X)
        ss_res = np.sum((y - y_pred)**2)
        ss_tot = np.sum((y - y.mean())**2)
        return 1 - ss_res/ss_tot

    def plot_cost_history(self):
        """Plot cost vs iterations"""
        plt.figure(figsize=(10, 6))
        plt.plot(self.cost_history)
        plt.xlabel('Iteration/Epoch')
        plt.ylabel('Cost')
        plt.title(f'Cost History ({self.method.capitalize()} GD)')
        plt.grid(True)

        if self.converged:
            plt.axvline(len(self.cost_history)-1, color='r',
                       linestyle='--', label='Converged')
            plt.legend()

        plt.show()

    def get_coefficients(self):
        """Return intercept and coefficients separately"""
        return {
            'intercept': self.beta[0],
            'coefficients': self.beta[1:]
        }
```

## Usage Examples

### Example 1: Basic Usage

```python
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Generate data
X, y = make_regression(n_samples=1000, n_features=10, noise=20, random_state=42)

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale features (important!)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train model
model = LinearRegressionGD(
    learning_rate=0.01,
    method='mini-batch',
    batch_size=32,
    max_iterations=100,
    verbose=True
)

model.fit(X_train_scaled, y_train)

# Evaluate
train_score = model.score(X_train_scaled, y_train)
test_score = model.score(X_test_scaled, y_test)

print(f"\nTrain R²: {train_score:.4f}")
print(f"Test R²: {test_score:.4f}")

# Visualize
model.plot_cost_history()

# Get coefficients
coef = model.get_coefficients()
print(f"\nIntercept: {coef['intercept']:.4f}")
print(f"Coefficients: {coef['coefficients']}")
```

### Example 2: Comparing Methods

```python
methods = ['batch', 'stochastic', 'mini-batch']
results = {}

for method in methods:
    print(f"\n{'='*50}")
    print(f"Training with {method.upper()} GD")
    print('='*50)

    model = LinearRegressionGD(
        learning_rate=0.01,
        method=method,
        batch_size=32,
        max_iterations=100,
        verbose=False
    )

    model.fit(X_train_scaled, y_train)
    results[method] = model

    print(f"Converged: {model.converged}")
    print(f"Iterations: {len(model.cost_history)}")
    print(f"Final cost: {model.cost_history[-1]:.4f}")
    print(f"Test R²: {model.score(X_test_scaled, y_test):.4f}")

# Plot all three
plt.figure(figsize=(15, 5))
for i, (method, model) in enumerate(results.items(), 1):
    plt.subplot(1, 3, i)
    plt.plot(model.cost_history)
    plt.xlabel('Iteration/Epoch')
    plt.ylabel('Cost')
    plt.title(f'{method.capitalize()} GD')
    plt.grid(True)
plt.tight_layout()
plt.show()
```

### Example 3: Learning Rate Comparison

```python
learning_rates = [0.001, 0.01, 0.1, 1.0]

plt.figure(figsize=(12, 8))

for lr in learning_rates:
    model = LinearRegressionGD(
        learning_rate=lr,
        method='mini-batch',
        max_iterations=100,
        verbose=False
    )

    model.fit(X_train_scaled, y_train)

    plt.plot(model.cost_history, label=f'α={lr}')

plt.xlabel('Epoch')
plt.ylabel('Cost')
plt.title('Effect of Learning Rate')
plt.legend()
plt.grid(True)
plt.yscale('log')  # Log scale to see all curves
plt.show()
```

### Example 4: With Learning Rate Decay

```python
class LinearRegressionGD_WithDecay(LinearRegressionGD):
    """Extended version with learning rate decay"""

    def __init__(self, *args, decay_rate=0.95, **kwargs):
        super().__init__(*args, **kwargs)
        self.decay_rate = decay_rate
        self.initial_lr = self.learning_rate

    def _mini_batch_gd(self, X, y):
        """Mini-batch GD with learning rate decay"""
        n = len(y)

        for epoch in range(self.max_iterations):
            # Decay learning rate
            self.learning_rate = self.initial_lr * (self.decay_rate ** epoch)

            # Shuffle and update
            indices = np.random.permutation(n)

            for i in range(0, n, self.batch_size):
                batch_indices = indices[i:i+self.batch_size]
                X_batch = X[batch_indices]
                y_batch = y[batch_indices]

                gradient = self._compute_gradient(X_batch, y_batch, self.beta)
                self.beta = self.beta - self.learning_rate * gradient

            # Track cost
            cost = self._compute_cost(X, y, self.beta)
            self.cost_history.append(cost)

            if self.verbose and epoch % 10 == 0:
                print(f"Epoch {epoch}, LR: {self.learning_rate:.6f}, Cost: {cost:.4f}")

# Usage
model_decay = LinearRegressionGD_WithDecay(
    learning_rate=0.1,
    decay_rate=0.95,
    method='mini-batch',
    max_iterations=100,
    verbose=True
)

model_decay.fit(X_train_scaled, y_train)
```

## Utility Functions

### Learning Rate Finder

```python
def find_optimal_learning_rate(X, y, lr_min=1e-5, lr_max=10, num_iter=100):
    """
    Find optimal learning rate using range test
    """
    from sklearn.preprocessing import StandardScaler

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    n, p = X_scaled.shape
    X_scaled = np.column_stack([np.ones(n), X_scaled])
    beta = np.zeros(p+1)

    learning_rates = np.logspace(np.log10(lr_min), np.log10(lr_max), num_iter)
    costs = []

    for lr in learning_rates:
        predictions = X_scaled @ beta
        gradient = (1/n) * X_scaled.T @ (predictions - y)
        beta = beta - lr * gradient

        predictions = X_scaled @ beta
        cost = (1/(2*n)) * np.sum((predictions - y)**2)
        costs.append(cost)

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

    optimal_idx = np.argmin(costs)
    optimal_lr = learning_rates[optimal_idx]
    plt.axvline(optimal_lr, color='r', linestyle='--',
                label=f'Optimal: {optimal_lr:.6f}')
    plt.legend()
    plt.show()

    return optimal_lr
```

### Cross-Validation

```python
from sklearn.model_selection import KFold

def cross_validate_gd(X, y, learning_rates, cv=5):
    """
    Cross-validate different learning rates
    """
    from sklearn.preprocessing import StandardScaler

    kfold = KFold(n_splits=cv, shuffle=True, random_state=42)
    results = {lr: [] for lr in learning_rates}

    for train_idx, val_idx in kfold.split(X):
        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]

        # Scale
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_val_scaled = scaler.transform(X_val)

        for lr in learning_rates:
            model = LinearRegressionGD(
                learning_rate=lr,
                max_iterations=100,
                verbose=False
            )
            model.fit(X_train_scaled, y_train)
            score = model.score(X_val_scaled, y_val)
            results[lr].append(score)

    # Average scores
    avg_scores = {lr: np.mean(scores) for lr, scores in results.items()}

    # Plot
    plt.figure(figsize=(10, 6))
    plt.bar(range(len(avg_scores)), list(avg_scores.values()))
    plt.xticks(range(len(learning_rates)),
               [f'{lr}' for lr in learning_rates])
    plt.xlabel('Learning Rate')
    plt.ylabel('Average R² Score')
    plt.title(f'{cv}-Fold Cross-Validation')
    plt.grid(True)
    plt.show()

    best_lr = max(avg_scores, key=avg_scores.get)
    print(f"Best learning rate: {best_lr}")
    print(f"Best score: {avg_scores[best_lr]:.4f}")

    return best_lr, avg_scores
```

## Testing and Validation

```python
def test_gradient_implementation():
    """
    Test gradient descent implementation
    """
    # Create simple dataset where we know the answer
    np.random.seed(42)
    X = np.random.randn(100, 1)
    true_beta = np.array([2.0, 3.0])  # [intercept, slope]
    y = 2.0 + 3.0 * X.flatten() + np.random.randn(100) * 0.1

    # Fit model
    model = LinearRegressionGD(
        learning_rate=0.01,
        max_iterations=1000,
        verbose=False
    )
    model.fit(X, y)

    # Check coefficients
    learned_beta = model.beta
    print(f"True coefficients:    {true_beta}")
    print(f"Learned coefficients: {learned_beta}")
    print(f"Error: {np.linalg.norm(true_beta - learned_beta):.6f}")

    # Should be very close
    assert np.allclose(true_beta, learned_beta, atol=0.1), "Implementation error!"
    print("✓ Test passed!")

# Run test
test_gradient_implementation()
```

## Quick Reference

**Basic usage:**
```python
model = LinearRegressionGD(
    learning_rate=0.01,
    method='mini-batch',
    batch_size=32
)
model.fit(X_train_scaled, y_train)
predictions = model.predict(X_test_scaled)
```

**Key reminders:**
- Always scale features before training
- Start with learning_rate=0.01
- Use mini-batch method for best results
- Monitor cost_history for convergence
- Use StandardScaler from sklearn

---

## Navigation

**Previous:** [Convergence](gd-07-convergence.md)

**Next:** [Advanced Optimizers](gd-09-advanced-optimizers.md)

**Series:**
- [Introduction and Intuition](gd-01-introduction-intuition.md)
- [Mathematical Formulation](gd-02-mathematical-formulation.md)
- [Batch Gradient Descent](gd-03-batch-gradient-descent.md)
- [Stochastic Gradient Descent](gd-04-stochastic-gradient-descent.md)
- [Mini-Batch & Comparison](gd-05-minibatch-comparison.md)
- [Learning Rate](gd-06-learning-rate.md)
- [Convergence](gd-07-convergence.md)
- Implementation (this file)
- [Advanced Optimizers](gd-09-advanced-optimizers.md)
- [Interview Guide](gd-10-interview-guide.md)
