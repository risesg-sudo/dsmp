# Temporal Features

## What You'll Learn

Unlock the time dimension in your data by extracting powerful temporal patterns. You'll master date/time decomposition, cyclical encoding, and lag features that help models understand seasonality, trends, and time-dependent behaviors.

## Date and Time Feature Extraction

```python
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Create time series data
np.random.seed(42)
dates = pd.date_range(start='2023-01-01', periods=100, freq='D')
sales = 1000 + np.random.randint(-200, 300, 100)

df = pd.DataFrame({
    'date': dates,
    'sales': sales
})

print("Original Time Series Data:")
print(df.head(10))
print("\n" + "="*60 + "\n")

# Extract temporal features
print("Extracting Temporal Features...")
print("="*60)

# Basic time components
df['year'] = df['date'].dt.year
df['month'] = df['date'].dt.month
df['day'] = df['date'].dt.day
df['day_of_week'] = df['date'].dt.dayofweek  # 0=Monday, 6=Sunday
df['day_of_year'] = df['date'].dt.dayofyear
df['week_of_year'] = df['date'].dt.isocalendar().week
df['quarter'] = df['date'].dt.quarter

# Categorical time features
df['month_name'] = df['date'].dt.month_name()
df['day_name'] = df['date'].dt.day_name()
df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
df['is_month_start'] = df['date'].dt.is_month_start.astype(int)
df['is_month_end'] = df['date'].dt.is_month_end.astype(int)

# Cyclical encoding (for circular features)
df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
df['day_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
df['day_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)

print("\nTemporal Features Created:")
print(df.head(10))

print("\n" + "="*60 + "\n")
print("Feature Explanation:")
print("\n1. Basic Components:")
print("   - year, month, day, day_of_week, etc.")
print("\n2. Boolean Indicators:")
print("   - is_weekend, is_month_start, is_month_end")
print("\n3. Cyclical Encoding:")
print("   - month_sin/cos: Preserves December-January continuity")
print("   - day_sin/cos: Sunday follows Saturday")
print("\nWhy Cyclical Encoding?")
print("   Without: December(12) and January(1) seem far apart")
print("   With: sin/cos maintains circular relationship")
```

## Real-World Example: Retail Sales

```python
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

# Generate retail sales data with temporal patterns
np.random.seed(42)
dates = pd.date_range(start='2022-01-01', periods=365*2, freq='D')

# Base sales with patterns
day_of_week = pd.to_datetime(dates).dayofweek
month = pd.to_datetime(dates).month

sales = (
    5000 +  # Base
    1000 * (day_of_week == 5) +  # Saturday boost
    800 * (day_of_week == 6) +   # Sunday boost
    2000 * (month == 12) +  # December boost
    500 * (month.isin([6, 7, 8])) +  # Summer boost
    np.random.normal(0, 500, len(dates))
)

df = pd.DataFrame({
    'date': dates,
    'sales': sales
})

# Extract temporal features
df['day_of_week'] = df['date'].dt.dayofweek
df['month'] = df['date'].dt.month
df['day_of_month'] = df['date'].dt.day
df['quarter'] = df['date'].dt.quarter
df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
df['is_holiday_season'] = df['month'].isin([11, 12]).astype(int)
df['is_summer'] = df['month'].isin([6, 7, 8]).astype(int)

# Cyclical features
df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
df['day_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
df['day_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)

print("Retail Sales Data:")
print(df.head(10))

# Split data temporally (important for time series!)
split_date = '2023-07-01'
train = df[df['date'] < split_date]
test = df[df['date'] >= split_date]

# Features to use
feature_cols = ['day_of_week', 'month', 'day_of_month', 'quarter',
                'is_weekend', 'is_holiday_season', 'is_summer',
                'month_sin', 'month_cos', 'day_sin', 'day_cos']

X_train = train[feature_cols]
y_train = train['sales']
X_test = test[feature_cols]
y_test = test['sales']

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print("\n" + "="*60 + "\n")
print("Model Performance:")
print(f"RMSE: ${rmse:,.2f}")
print(f"R²:   {r2:.4f}")

print("\n" + "="*60 + "\n")
print("Feature Importance:")
importances = pd.DataFrame({
    'feature': feature_cols,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)
print(importances.to_string(index=False))
```

## Lag and Rolling Features

```python
import pandas as pd
import numpy as np

# Time series data
np.random.seed(42)
dates = pd.date_range(start='2023-01-01', periods=30, freq='D')
sales = 1000 + np.cumsum(np.random.randn(30) * 50)

df = pd.DataFrame({
    'date': dates,
    'sales': sales
})

print("Original Time Series:")
print(df.head(10))
print("\n" + "="*60 + "\n")

# Lag features (previous values)
df['sales_lag1'] = df['sales'].shift(1)  # Yesterday
df['sales_lag7'] = df['sales'].shift(7)  # Last week
df['sales_lag30'] = df['sales'].shift(30)  # Last month

# Rolling statistics
df['sales_roll_mean_7'] = df['sales'].rolling(window=7).mean()
df['sales_roll_std_7'] = df['sales'].rolling(window=7).std()
df['sales_roll_min_7'] = df['sales'].rolling(window=7).min()
df['sales_roll_max_7'] = df['sales'].rolling(window=7).max()

# Percentage change
df['sales_pct_change'] = df['sales'].pct_change()
df['sales_diff'] = df['sales'].diff()

# Expanding features (all history)
df['sales_expanding_mean'] = df['sales'].expanding().mean()
df['sales_expanding_std'] = df['sales'].expanding().std()

print("With Lag and Rolling Features:")
print(df.head(15))

print("\n" + "="*60 + "\n")
print("Feature Explanations:")
print("\nLag Features:")
print("  sales_lag1: Sales from yesterday")
print("  sales_lag7: Sales from 7 days ago")
print("\nRolling Features (7-day window):")
print("  sales_roll_mean_7: Average of last 7 days")
print("  sales_roll_std_7: Volatility in last 7 days")
print("\nChange Features:")
print("  sales_pct_change: Percentage change from previous day")
print("  sales_diff: Absolute change from previous day")
print("\nExpanding Features:")
print("  sales_expanding_mean: Average of all history")
```

## When to Use Temporal Features

Temporal features are essential for:
- Time series forecasting
- Seasonal pattern detection
- Trend analysis
- Customer behavior over time
- Event-driven predictions

Always split time series data temporally, not randomly.

## Quick Reference

```
Basic extraction:
  df['month'] = df['date'].dt.month
  df['day_of_week'] = df['date'].dt.dayofweek

Cyclical encoding:
  df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
  df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)

Lag features:
  df['lag1'] = df['value'].shift(1)

Rolling features:
  df['roll_mean'] = df['value'].rolling(7).mean()

Remember: Temporal split, not random split!
```

---

**Related Topics:**
- [Aggregation Features](./aggregation-features.md) - Time-based aggregations
- [Domain-Specific Features](./domain-specific-features.md) - Business temporal patterns

**Navigate:** [Feature Engineering Home](./README.md)
