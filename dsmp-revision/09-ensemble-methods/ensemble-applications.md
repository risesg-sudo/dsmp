# Ensemble Methods - Real-World Applications and Best Practices

## What You'll Learn

Explore real-world applications of ensemble methods across different domains, learn industry best practices, and discover how to combine multiple boosting algorithms for maximum performance.

## E-commerce Recommendation System

### Scenario: Product Purchase Prediction

**Problem**: Predict whether a user will purchase a recommended product.

**Why CatBoost**: Many categorical features (user IDs, product categories, brands).

```python
import pandas as pd
from catboost import CatBoostClassifier, Pool
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

# Example feature structure
"""
Features:
- user_id (categorical, high-cardinality: 100K+ users)
- product_id (categorical, high-cardinality: 50K+ products)
- category (categorical: 500 categories)
- brand (categorical: 5000 brands)
- price (numerical)
- discount_pct (numerical)
- day_of_week (categorical)
- hour_of_day (numerical)
- user_age (numerical)
- previous_purchases (numerical)

Target: purchased (0/1)
"""

# Define categorical features
cat_features = [
    'user_id',
    'product_id',
    'category',
    'brand',
    'day_of_week'
]

# CatBoost handles high-cardinality categoricals automatically
model = CatBoostClassifier(
    iterations=1000,
    learning_rate=0.05,
    depth=6,
    cat_features=cat_features,
    eval_metric='AUC',
    early_stopping_rounds=50,
    random_seed=42,
    verbose=100
)

# Train
# model.fit(X_train, y_train, eval_set=(X_val, y_val))

# Feature importance reveals user behavior patterns
# importance = model.get_feature_importance(prettified=True)
```

## Click-Through Rate (CTR) Prediction

### Scenario: Ad Click Prediction at Scale

**Problem**: Predict ad clicks with billions of impressions.

**Why LightGBM**: Massive data volume, need extreme speed.

```python
import lightgbm as lgb

# Example feature structure
"""
Dataset: 1 billion impressions, 100 features
Features:
- ad_id, campaign_id, advertiser_id (high cardinality)
- user_demographics (age, gender, location)
- context (device, browser, time, page_category)
- historical_features (CTR, conversion_rate)

Target: clicked (0/1)

Challenges:
- Extreme class imbalance (CTR ~ 0.1%)
- Very large dataset
- Need fast training for daily updates
"""

# LightGBM with GOSS for speed
params = {
    'objective': 'binary',
    'metric': 'auc',
    'boosting_type': 'goss',     # Gradient-based sampling
    'num_leaves': 255,            # Complex model for patterns
    'learning_rate': 0.05,
    'feature_fraction': 0.8,
    'bagging_fraction': 0.8,
    'bagging_freq': 5,
    'max_bin': 255,
    'min_data_in_leaf': 100,      # Prevent overfitting
    'verbose': -1,
    'is_unbalance': True          # Handle class imbalance
}

# Can train from file to save memory
# train_data = lgb.Dataset('train.txt')
# model = lgb.train(params, train_data, num_boost_round=1000)

# Production deployment: fast inference critical
# Use optimized C++ evaluator
```

## Financial Risk Modeling

### Scenario: Credit Default Prediction

**Problem**: Predict loan default risk for lending decisions.

**Why XGBoost**: Regulatory requirements, need interpretability, proven reliability.

```python
import xgboost as xgb
import shap

# Example feature structure
"""
Features:
- credit_score (numerical)
- income (numerical)
- debt_to_income_ratio (numerical)
- employment_years (numerical)
- existing_debt (numerical)
- loan_amount (numerical)
- loan_purpose (categorical)
- home_ownership (categorical)

Target: default (0/1)

Requirements:
- High interpretability
- Monotonic constraints (logical relationships)
- Model explanation for each prediction
"""

# Define monotonic constraints
# 1 = increasing relationship, -1 = decreasing
monotone_constraints = {
    'credit_score': -1,           # Higher score → lower default risk
    'income': -1,                 # Higher income → lower risk
    'debt_to_income_ratio': 1,    # Higher ratio → higher risk
    'employment_years': -1        # More years → lower risk
}

model = xgb.XGBClassifier(
    n_estimators=500,
    max_depth=3,                  # Shallow for interpretability
    learning_rate=0.05,
    subsample=0.8,
    monotone_constraints=monotone_constraints,
    random_state=42
)

# model.fit(X_train, y_train, eval_set=[(X_val, y_val)])

# Explain predictions with SHAP
# explainer = shap.TreeExplainer(model)
# shap_values = explainer.shap_values(X_test)
# shap.force_plot(explainer.expected_value, shap_values[0], X_test.iloc[0])
```

## Fraud Detection

### Scenario: Real-time Transaction Fraud Detection

**Problem**: Detect fraudulent transactions in real-time.

**Why**: Ensemble of all three for maximum accuracy.

```python
from sklearn.ensemble import VotingClassifier
import xgboost as xgb
import lightgbm as lgb
from catboost import CatBoostClassifier

# Example feature structure
"""
Features:
- transaction_amount (numerical)
- merchant_id (categorical, high-cardinality)
- merchant_category (categorical)
- transaction_type (categorical)
- device_id (categorical)
- location (categorical)
- time_features (hour, day, is_weekend)
- user_behavior (avg_transaction, transaction_frequency)

Target: is_fraud (0/1)

Challenges:
- Extreme imbalance (fraud rate ~0.1%)
- Mix of categorical and numerical features
- Need high precision (false positives costly)
"""

# Create diverse models
xgb_model = xgb.XGBClassifier(
    n_estimators=300,
    max_depth=5,
    learning_rate=0.05,
    scale_pos_weight=1000,  # Handle imbalance
    random_state=42
)

lgb_model = lgb.LGBMClassifier(
    n_estimators=300,
    num_leaves=31,
    learning_rate=0.05,
    is_unbalance=True,
    random_state=42
)

cat_features = ['merchant_id', 'merchant_category', 'transaction_type',
                'device_id', 'location']

cat_model = CatBoostClassifier(
    iterations=300,
    depth=5,
    learning_rate=0.05,
    cat_features=cat_features,
    class_weights=[1, 1000],  # Handle imbalance
    random_seed=42,
    verbose=False
)

# Ensemble with voting
ensemble = VotingClassifier(
    estimators=[
        ('xgb', xgb_model),
        ('lgb', lgb_model),
        ('cat', cat_model)
    ],
    voting='soft',  # Probability averaging
    weights=[1, 1, 1]
)

# ensemble.fit(X_train, y_train)
# Often achieves better precision/recall than individual models
```

## Time Series Forecasting

### Scenario: Sales Forecasting

**Problem**: Predict daily sales for inventory management.

**Why CatBoost**: Good defaults, handles date features well.

```python
# Feature engineering for time series
def create_time_features(df, date_col):
    """Create time-based features"""
    df = df.copy()
    df['year'] = df[date_col].dt.year
    df['month'] = df[date_col].dt.month
    df['day'] = df[date_col].dt.day
    df['dayofweek'] = df[date_col].dt.dayofweek
    df['quarter'] = df[date_col].dt.quarter
    df['is_weekend'] = (df['dayofweek'] >= 5).astype(int)
    df['is_month_start'] = df[date_col].dt.is_month_start.astype(int)
    df['is_month_end'] = df[date_col].dt.is_month_end.astype(int)
    return df

def create_lag_features(df, target_col, lags=[1, 7, 30]):
    """Create lagged features"""
    df = df.copy()
    for lag in lags:
        df[f'{target_col}_lag_{lag}'] = df[target_col].shift(lag)
    return df

# Example
cat_features = ['month', 'dayofweek', 'quarter']

model = CatBoostRegressor(
    iterations=500,
    learning_rate=0.1,
    depth=6,
    cat_features=cat_features,
    loss_function='RMSE',
    random_seed=42,
    verbose=100
)

# model.fit(X_train, y_train, eval_set=(X_val, y_val))
```

## Customer Churn Prediction

### Scenario: Subscription Service Churn

**Problem**: Predict which customers will cancel subscription.

**Why CatBoost**: Mix of categorical user attributes and numerical usage metrics.

```python
# Example feature structure
"""
Features:
- subscription_type (categorical)
- usage_frequency (numerical)
- customer_service_calls (numerical)
- tenure_months (numerical)
- payment_method (categorical)
- contract_type (categorical)
- monthly_charges (numerical)
- total_charges (numerical)

Target: churned (0/1)
"""

cat_features = ['subscription_type', 'payment_method', 'contract_type']

model = CatBoostClassifier(
    iterations=500,
    learning_rate=0.05,
    depth=6,
    cat_features=cat_features,
    eval_metric='AUC',
    class_weights=[1, 3],  # Increase weight of churn class
    random_seed=42,
    verbose=100
)

# model.fit(X_train, y_train, eval_set=(X_val, y_val))

# Identify at-risk customers
# churn_proba = model.predict_proba(X_new)[:, 1]
# at_risk = X_new[churn_proba > 0.7]  # High churn probability
```

## Industry Best Practices

### 1. Feature Engineering

```python
# Create interaction features for boosting models
def create_interactions(df, col1, col2):
    """Create polynomial and interaction features"""
    df[f'{col1}_x_{col2}'] = df[col1] * df[col2]
    df[f'{col1}_div_{col2}'] = df[col1] / (df[col2] + 1e-5)
    df[f'{col1}_plus_{col2}'] = df[col1] + df[col2]
    return df

# Create binned features
def bin_numerical(df, col, n_bins=10):
    """Bin numerical features"""
    df[f'{col}_binned'] = pd.cut(df[col], bins=n_bins, labels=False)
    return df
```

### 2. Cross-Validation Strategy

```python
from sklearn.model_selection import StratifiedKFold

def robust_cv_evaluation(model, X, y, n_splits=5):
    """Perform stratified k-fold CV"""
    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    scores = []

    for fold, (train_idx, val_idx) in enumerate(skf.split(X, y)):
        X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
        y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]

        model.fit(X_train, y_train)
        score = roc_auc_score(y_val, model.predict_proba(X_val)[:, 1])
        scores.append(score)
        print(f"Fold {fold+1}: {score:.4f}")

    print(f"\nMean: {np.mean(scores):.4f} (+/- {np.std(scores):.4f})")
    return scores
```

### 3. Model Monitoring in Production

```python
def monitor_model_drift(model, X_prod, predictions_log):
    """Monitor for data/concept drift"""

    # Feature drift: Compare distributions
    from scipy.stats import ks_2samp

    for col in X_prod.columns:
        statistic, pvalue = ks_2samp(X_train[col], X_prod[col])
        if pvalue < 0.05:
            print(f"Warning: Distribution shift in {col}")

    # Prediction drift: Monitor prediction distribution
    import matplotlib.pyplot as plt

    plt.figure(figsize=(12, 4))
    plt.subplot(1, 2, 1)
    plt.hist(predictions_log['week_1'], bins=50, alpha=0.5, label='Week 1')
    plt.hist(predictions_log['week_current'], bins=50, alpha=0.5, label='Current')
    plt.legend()
    plt.title('Prediction Distribution Drift')

    # Performance drift: Monitor metrics over time
    plt.subplot(1, 2, 2)
    plt.plot(predictions_log['week'], predictions_log['auc'])
    plt.xlabel('Week')
    plt.ylabel('AUC')
    plt.title('Performance Over Time')
    plt.tight_layout()
    plt.show()
```

## Ensemble Strategies

### Stacking Ensemble

```python
from sklearn.ensemble import StackingClassifier
from sklearn.linear_model import LogisticRegression

# Level 0 models
xgb_model = xgb.XGBClassifier(n_estimators=200, random_state=42)
lgb_model = lgb.LGBMClassifier(n_estimators=200, random_state=42)
cat_model = CatBoostClassifier(iterations=200, random_seed=42, verbose=False)

# Level 1 model (meta-learner)
stacking = StackingClassifier(
    estimators=[
        ('xgb', xgb_model),
        ('lgb', lgb_model),
        ('cat', cat_model)
    ],
    final_estimator=LogisticRegression(),
    cv=5
)

# stacking.fit(X_train, y_train)
```

### Blending Ensemble

```python
def blend_predictions(models, X_train, y_train, X_test):
    """Blend predictions from multiple models"""

    # Train models
    for model in models:
        model.fit(X_train, y_train)

    # Get predictions
    train_preds = np.column_stack([
        model.predict_proba(X_train)[:, 1] for model in models
    ])
    test_preds = np.column_stack([
        model.predict_proba(X_test)[:, 1] for model in models
    ])

    # Find optimal weights
    from scipy.optimize import minimize

    def objective(weights):
        blended = train_preds @ weights
        return -roc_auc_score(y_train, blended)

    result = minimize(
        objective,
        x0=np.ones(len(models)) / len(models),
        bounds=[(0, 1)] * len(models),
        constraints={'type': 'eq', 'fun': lambda w: w.sum() - 1}
    )

    # Apply optimal weights
    final_pred = test_preds @ result.x
    return final_pred, result.x
```

## Summary

Real-world applications require:
- **Choose the right tool**: Match library to problem characteristics
- **Feature engineering**: Critical for boosting performance
- **Robust validation**: Use proper CV to prevent overfitting
- **Ensemble when possible**: Combine models for robustness
- **Monitor in production**: Track drift and performance degradation

Each boosting library excels in different scenarios:
- **XGBoost**: Financial, healthcare (interpretability + stability)
- **LightGBM**: AdTech, large-scale recommendations (speed + scale)
- **CatBoost**: E-commerce, CRM (categorical features + ease of use)

Success comes from understanding your data, choosing the right tool, and following best practices.

---

**Navigation:**
- **Previous**: [Ensemble Comparison](./ensemble-comparison.md)
- **Start**: [LightGBM Overview](./lightgbm-overview.md) | [CatBoost Overview](./catboost-overview.md)
- **Related**: [Decision Trees](./decision-trees.md) | [XGBoost](./xgboost.md)
