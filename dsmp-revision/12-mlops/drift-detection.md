# Drift Detection

## What You'll Learn

Data drift is one of the most common causes of model degradation in production. This guide explains the different types of drift, how to detect them using statistical tests and model-based approaches, and when to trigger model retraining. Understanding drift detection helps you maintain model performance over time.

## Understanding Drift

Drift occurs when the statistical properties of your data change over time, causing your model's performance to degrade.

```
┌──────────────────────────────────────────────────┐
│              Types of Drift                      │
├──────────────────────────────────────────────────┤
│                                                  │
│  1. Data Drift (Covariate Shift)               │
│     Input distribution changes                   │
│     P(X) changes, but P(Y|X) same              │
│                                                  │
│     Example: Age distribution shifts            │
│     Training: 25-45 years old                   │
│     Production: 18-25 years old                 │
│                                                  │
│  2. Concept Drift                               │
│     Relationship between X and Y changes        │
│     P(Y|X) changes                              │
│                                                  │
│     Example: Credit scoring                      │
│     Economic crisis → creditworthiness changes  │
│                                                  │
│  3. Label Drift (Prior Shift)                  │
│     Output distribution changes                  │
│     P(Y) changes                                │
│                                                  │
│     Example: Fraud rate increases               │
│     Training: 1% fraud                          │
│     Production: 5% fraud                        │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Types of Drift Explained

### 1. Data Drift (Covariate Shift)

**What it is:** The distribution of input features changes, but the relationship between inputs and outputs stays the same.

**Example:** Your credit model was trained on customers aged 25-45, but suddenly you're getting applications from 18-25 year olds.

**Impact:** Model still works logically, but might not perform well on new distribution.

**Detection:** Compare feature distributions between training and production.

### 2. Concept Drift

**What it is:** The relationship between inputs and outputs changes over time.

**Example:** During COVID-19, what constituted "creditworthy" changed drastically. Income levels that were safe before became risky.

**Impact:** Model's learned patterns no longer apply. Most dangerous type of drift.

**Detection:** Monitor model performance over time, requires ground truth labels.

### 3. Label Drift (Prior Shift)

**What it is:** The distribution of target labels changes, but relationships stay the same.

**Example:** Fraud rate increases from 1% to 5% due to new fraud techniques.

**Impact:** Model's prediction distribution becomes miscalibrated.

**Detection:** Track prediction distributions over time.

## Statistical Drift Detection

### Kolmogorov-Smirnov Test

Tests if two samples come from the same distribution.

```python
# drift_detection.py
import numpy as np
from scipy import stats

class DriftDetector:
    def __init__(self, reference_data):
        """
        Args:
            reference_data: Training data or baseline data (numpy array)
        """
        self.reference_data = reference_data
        self.reference_stats = self._calculate_statistics(reference_data)

    def _calculate_statistics(self, data):
        """Calculate statistics for data"""
        return {
            'mean': np.mean(data, axis=0),
            'std': np.std(data, axis=0),
            'min': np.min(data, axis=0),
            'max': np.max(data, axis=0)
        }

    def kolmogorov_smirnov_test(self, production_data, feature_idx, alpha=0.05):
        """
        KS test for detecting distribution shift

        Args:
            production_data: Recent production data
            feature_idx: Index of feature to test
            alpha: Significance level (default 0.05)

        Returns:
            drift_detected: bool
            p_value: float
        """
        ref_feature = self.reference_data[:, feature_idx]
        prod_feature = production_data[:, feature_idx]

        # Perform KS test
        statistic, p_value = stats.ks_2samp(ref_feature, prod_feature)

        # If p < alpha, distributions are significantly different
        drift_detected = p_value < alpha

        return drift_detected, p_value

    def detect_all_features(self, production_data):
        """Detect drift across all features"""
        num_features = self.reference_data.shape[1]
        results = []

        for i in range(num_features):
            drift, p_value = self.kolmogorov_smirnov_test(production_data, i)
            results.append({
                'feature': i,
                'drift_detected': drift,
                'p_value': p_value
            })

        return results

# Usage
# Training data
X_train = np.random.randn(1000, 4)

# Production data (with drift in feature 0)
X_production = np.random.randn(500, 4)
X_production[:, 0] += 2  # Shift feature 0

# Detect drift
detector = DriftDetector(X_train)
results = detector.detect_all_features(X_production)

for result in results:
    status = "DRIFT" if result['drift_detected'] else "OK"
    print(f"Feature {result['feature']}: {status} (p={result['p_value']:.4f})")
```

### Population Stability Index (PSI)

Industry-standard metric for measuring distribution changes.

```python
def population_stability_index(self, production_data, feature_idx, bins=10):
    """
    PSI (Population Stability Index) for drift detection

    PSI Interpretation:
    - PSI < 0.1: No significant drift
    - 0.1 <= PSI < 0.2: Moderate drift
    - PSI >= 0.2: Significant drift

    Returns:
        psi: float
        status: str
    """
    ref_feature = self.reference_data[:, feature_idx]
    prod_feature = production_data[:, feature_idx]

    # Create bins based on reference data
    min_val = min(ref_feature.min(), prod_feature.min())
    max_val = max(ref_feature.max(), prod_feature.max())
    bin_edges = np.linspace(min_val, max_val, bins + 1)

    # Calculate distributions
    ref_hist, _ = np.histogram(ref_feature, bins=bin_edges)
    prod_hist, _ = np.histogram(prod_feature, bins=bin_edges)

    # Normalize to get percentages
    ref_dist = ref_hist / len(ref_feature)
    prod_dist = prod_hist / len(prod_feature)

    # Avoid division by zero
    ref_dist = np.where(ref_dist == 0, 0.0001, ref_dist)
    prod_dist = np.where(prod_dist == 0, 0.0001, prod_dist)

    # Calculate PSI
    psi = np.sum((prod_dist - ref_dist) * np.log(prod_dist / ref_dist))

    # Interpret PSI
    if psi < 0.1:
        status = "No significant drift"
    elif psi < 0.2:
        status = "Moderate drift"
    else:
        status = "Significant drift"

    return psi, status
```

## Model-Based Drift Detection

Train a classifier to distinguish training data from production data. High accuracy indicates drift.

```python
# model_drift_detection.py
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split

class ModelBasedDriftDetector:
    """
    Train classifier to distinguish training data from production data.
    High accuracy indicates drift.
    """

    def __init__(self):
        self.classifier = RandomForestClassifier(
            n_estimators=100,
            random_state=42
        )

    def detect_drift(self, reference_data, production_data):
        """
        Detect drift using classifier approach

        Args:
            reference_data: Training/baseline data
            production_data: Recent production data

        Returns:
            drift_detected: bool
            auc_score: float (higher = more drift)
        """
        # Label data (0 = reference, 1 = production)
        reference_labels = np.zeros(len(reference_data))
        production_labels = np.ones(len(production_data))

        # Combine data
        X = np.vstack([reference_data, production_data])
        y = np.concatenate([reference_labels, production_labels])

        # Split for evaluation
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.3, random_state=42, stratify=y
        )

        # Train classifier
        self.classifier.fit(X_train, y_train)

        # Predict probabilities
        y_pred_proba = self.classifier.predict_proba(X_test)[:, 1]

        # Calculate AUC
        auc = roc_auc_score(y_test, y_pred_proba)

        # Interpret AUC:
        # AUC ~ 0.5: No drift (can't distinguish)
        # AUC > 0.6: Moderate drift
        # AUC > 0.7: Significant drift
        drift_detected = auc > 0.6

        return drift_detected, auc

# Usage
detector = ModelBasedDriftDetector()
drift, auc = detector.detect_drift(X_train, X_production)
print(f"Drift detected: {drift}")
print(f"AUC Score: {auc:.4f} (higher = more drift)")
```

## Prediction Drift Detection

Monitor if prediction distributions change over time.

```python
# prediction_drift.py
class PredictionDriftDetector:
    def __init__(self, baseline_distribution):
        """
        Args:
            baseline_distribution: Dict with prediction class distributions
                Example: {0: 0.8, 1: 0.2}
        """
        self.baseline = baseline_distribution

    def detect_prediction_drift(self, recent_predictions, threshold=0.1):
        """
        Detect if prediction distribution has drifted

        Args:
            recent_predictions: List of recent predictions
            threshold: Maximum allowed difference in distribution

        Returns:
            drift_detected: bool
            drift_info: dict with details
        """
        # Calculate current distribution
        unique, counts = np.unique(recent_predictions, return_counts=True)
        current_dist = dict(zip(
            unique,
            counts / len(recent_predictions)
        ))

        # Calculate drift for each class
        drift_detected = False
        drift_info = {}

        for class_label, baseline_prob in self.baseline.items():
            current_prob = current_dist.get(class_label, 0)
            diff = abs(current_prob - baseline_prob)

            drift_info[class_label] = {
                'baseline': baseline_prob,
                'current': current_prob,
                'difference': diff
            }

            if diff > threshold:
                drift_detected = True

        return drift_detected, drift_info

# Usage
baseline = {0: 0.85, 1: 0.15}
detector = PredictionDriftDetector(baseline)

# Recent predictions (65% class 0, 35% class 1 - drifted!)
recent_preds = [0] * 650 + [1] * 350

drift, info = detector.detect_prediction_drift(recent_preds)
print(f"Drift detected: {drift}")
for class_label, details in info.items():
    print(f"Class {class_label}:")
    print(f"  Baseline: {details['baseline']:.2%}")
    print(f"  Current: {details['current']:.2%}")
    print(f"  Difference: {details['difference']:.2%}")
```

## When to Retrain

Set up triggers for automatic retraining:

```python
class RetrainingTrigger:
    def __init__(self):
        self.thresholds = {
            'accuracy_drop': 0.05,     # 5% accuracy drop
            'psi_threshold': 0.2,       # Significant PSI
            'days_since_training': 30,  # Monthly retraining
            'new_samples': 10000        # New data available
        }

    def should_retrain(self, metrics):
        """
        Decide if retraining is needed

        Args:
            metrics: Dict with current metrics

        Returns:
            should_retrain: bool
            reason: str
        """
        # Check accuracy degradation
        if metrics['accuracy'] < metrics['baseline_accuracy'] - self.thresholds['accuracy_drop']:
            return True, "Performance degradation"

        # Check data drift
        if metrics['max_psi'] > self.thresholds['psi_threshold']:
            return True, "Significant data drift"

        # Check time-based
        if metrics['days_since_training'] > self.thresholds['days_since_training']:
            return True, "Scheduled retraining"

        # Check data volume
        if metrics['new_samples'] > self.thresholds['new_samples']:
            return True, "Sufficient new data"

        return False, "No retraining needed"
```

## Best Practices

1. **Monitor multiple drift types** - Data, concept, and prediction drift
2. **Use multiple detection methods** - Statistical tests + model-based
3. **Set appropriate thresholds** - Based on your business requirements
4. **Automate detection** - Run checks hourly or daily
5. **Keep historical data** - Compare against multiple time windows
6. **Alert on significant drift** - Don't wait for performance degradation

## Common Pitfalls

**Only checking data drift:**
```python
# WRONG - Missing concept drift
if data_drift_detected():
    retrain()

# RIGHT - Check multiple drift types
if data_drift_detected() or performance_degraded():
    retrain()
```

**Not setting thresholds appropriately:**
```python
# WRONG - Too sensitive
if psi > 0.05:  # Too strict
    alert()

# RIGHT - Industry standard
if psi > 0.2:  # Significant drift
    alert()
```

## Quick Reference

```python
# KS test
from scipy import stats
statistic, p_value = stats.ks_2samp(train_data, prod_data)
drift = p_value < 0.05

# PSI calculation
psi = sum((prod_pct - train_pct) * log(prod_pct / train_pct))

# Model-based
auc = train_classifier_to_distinguish(train_data, prod_data)
drift = auc > 0.6
```

## Summary

Drift detection is essential for maintaining model performance. Use statistical tests like KS and PSI to detect data drift. Employ model-based approaches for comprehensive drift analysis. Monitor prediction distributions for label drift. Set up automated retraining triggers based on drift severity. Combine multiple detection methods for robust monitoring that catches problems before they impact your business.

---

**Related Topics:**
- [Model Monitoring Basics](./model-monitoring-basics.md)
- [Monitoring Best Practices](./monitoring-best-practices.md)
- [Airflow for ML](./airflow-ml-basics.md)
