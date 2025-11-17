# Plotly Basic Charts - Scatter and Line Plots

## What You'll Learn

Master scatter and line plots in Plotly, the foundational chart types for correlation analysis and time series visualization. Learn when to use each, how to enhance them with color and size encoding, and best practices for interactive exploration.

## Scatter Plots

### When to Use Scatter Plots

**Perfect for**:
- Correlation analysis between two variables
- Pattern identification in data
- Outlier detection
- Comparing multiple categories
- Interactive data exploration

**Examples**:
- Sales vs marketing spend
- Height vs weight relationships
- Customer age vs purchase amount
- Quality metrics comparison

### Basic Scatter Plot

```python
import plotly.express as px

# Load sample data
df = px.data.iris()

# Simple scatter plot
fig = px.scatter(df,
                 x='sepal_width',
                 y='sepal_length',
                 title='Iris Sepal Dimensions')
fig.show()
```

**Interactive Features**:
- Hover to see exact (x, y) values
- Box select to zoom into regions
- Double-click to reset view
- Click-drag to pan

### Enhanced Scatter with Color and Size

```python
# Multi-dimensional scatter plot
fig = px.scatter(df,
                 x='sepal_width',
                 y='sepal_length',
                 color='species',           # Color encode by category
                 size='petal_length',       # Size encode by value
                 hover_data=['petal_width'], # Show in hover
                 title='Interactive Iris Dataset',
                 labels={
                     'sepal_width': 'Sepal Width (cm)',
                     'sepal_length': 'Sepal Length (cm)'
                 })

# Customize appearance
fig.update_layout(
    font=dict(size=12),
    width=900,
    height=600,
    hovermode='closest'  # or 'x', 'y', 'x unified'
)

fig.show()
```

### Scatter with Custom Styling

```python
import plotly.graph_objects as go

# Full control with Graph Objects
fig = go.Figure()

fig.add_trace(go.Scatter(
    x=[1, 2, 3, 4, 5],
    y=[1, 4, 9, 16, 25],
    mode='markers',
    name='Data Points',
    marker=dict(
        size=15,
        color='blue',
        opacity=0.7,
        line=dict(width=2, color='darkblue')
    ),
    hovertemplate='<b>X</b>: %{x}<br>' +
                  '<b>Y</b>: %{y}<br>' +
                  '<extra></extra>'  # Remove trace name from hover
))

fig.update_layout(
    title='Customized Scatter Plot',
    xaxis_title='X Variable',
    yaxis_title='Y Variable',
    template='plotly_white'
)

fig.show()
```

## Line Charts

### When to Use Line Charts

**Perfect for**:
- Time series data
- Trends over continuous variables
- Comparing multiple series
- Sequential data
- Tracking changes

**Examples**:
- Stock prices over time
- Website traffic trends
- Temperature monitoring
- Sales performance tracking

### Basic Line Chart

```python
# Load stock data
df_stocks = px.data.stocks()

# Simple line plot
fig = px.line(df_stocks,
              x='date',
              y='GOOG',
              title='Google Stock Price')
fig.show()
```

### Multiple Line Series

```python
# Compare multiple stocks
fig = px.line(df_stocks,
              x='date',
              y=['GOOG', 'AAPL', 'AMZN', 'MSFT'],
              title='Stock Prices Over Time')

fig.update_layout(
    xaxis_title='Date',
    yaxis_title='Stock Price ($)',
    hovermode='x unified',  # Unified hover across all lines
    width=1000,
    height=600,
    legend=dict(
        orientation='h',
        yanchor='bottom',
        y=1.02,
        xanchor='right',
        x=1
    )
)

fig.show()
```

### Line Chart with Range Slider

```python
# Add range slider for time navigation
fig = px.line(df_stocks,
              x='date',
              y='GOOG',
              title='Stock Price with Range Slider')

fig.update_xaxes(rangeslider_visible=True)
fig.show()
```

### Custom Line Styles with Graph Objects

```python
import plotly.graph_objects as go

fig = go.Figure()

# Add first line
fig.add_trace(go.Scatter(
    x=df_stocks['date'],
    y=df_stocks['GOOG'],
    mode='lines',
    name='Google',
    line=dict(color='blue', width=2),
    hovertemplate='<b>Date</b>: %{x}<br>' +
                  '<b>Price</b>: $%{y:.2f}<br>' +
                  '<extra></extra>'
))

# Add second line with different style
fig.add_trace(go.Scatter(
    x=df_stocks['date'],
    y=df_stocks['AAPL'],
    mode='lines',
    name='Apple',
    line=dict(color='red', width=2, dash='dash')
))

fig.update_layout(
    title='Stock Prices - Custom Styling',
    xaxis_title='Date',
    yaxis_title='Price ($)',
    hovermode='x unified',
    template='plotly_white'
)

fig.show()
```

## Combining Markers and Lines

### Lines with Markers

```python
fig = go.Figure()

fig.add_trace(go.Scatter(
    x=[1, 2, 3, 4, 5],
    y=[1, 4, 9, 16, 25],
    mode='lines+markers',  # Both lines and markers
    name='Data',
    line=dict(color='blue', width=2),
    marker=dict(size=10, color='red')
))

fig.update_layout(
    title='Lines and Markers',
    template='plotly_white'
)

fig.show()
```

## Advanced Scatter Plot Features

### Bubble Chart (Size-Encoded Scatter)

```python
# Create bubble chart
df = px.data.gapminder().query("year==2007")

fig = px.scatter(df,
                 x='gdpPercap',
                 y='lifeExp',
                 size='pop',           # Bubble size
                 color='continent',    # Color by continent
                 hover_name='country', # Show country on hover
                 log_x=True,           # Log scale for GDP
                 size_max=60,          # Max bubble size
                 title='Life Expectancy vs GDP per Capita (2007)')

fig.update_layout(
    xaxis_title='GDP per Capita (log scale)',
    yaxis_title='Life Expectancy (years)',
    width=1000,
    height=600
)

fig.show()
```

### Scatter with Marginal Distributions

```python
df = px.data.iris()

# Add marginal histograms
fig = px.scatter(df,
                 x='sepal_length',
                 y='sepal_width',
                 color='species',
                 marginal_x='histogram',  # or 'box', 'violin', 'rug'
                 marginal_y='histogram',
                 title='Scatter with Marginal Distributions')

fig.show()
```

### Scatter with Trend Line

```python
# Add trendline
fig = px.scatter(df,
                 x='sepal_length',
                 y='sepal_width',
                 color='species',
                 trendline='ols',  # Ordinary Least Squares
                 title='Scatter with Regression Lines')

fig.show()
```

## Best Practices

### For Scatter Plots

**Do**:
- Use color for categorical grouping
- Use size for numerical encoding
- Add hover data for context
- Consider log scales for wide ranges
- Use transparency for overlapping points

**Don't**:
- Overload with too many variables
- Use tiny markers for large datasets
- Forget to label axes clearly
- Use size for categorical data

### For Line Charts

**Do**:
- Use time on x-axis for time series
- Add range slider for long series
- Use unified hover for comparison
- Consider log scale for exponential growth
- Limit to 5-7 lines for readability

**Don't**:
- Connect unrelated points
- Use lines for categorical x-axis
- Clutter with too many series
- Forget to sort time data

## Common Patterns

### Comparing Groups Over Time

```python
# Sales by region over time
fig = px.line(df_sales,
              x='date',
              y='sales',
              color='region',
              title='Sales by Region')

fig.update_layout(hovermode='x unified')
fig.show()
```

### Highlighting Specific Points

```python
# Highlight outliers
fig = go.Figure()

# Main data
fig.add_trace(go.Scatter(
    x=df['x'],
    y=df['y'],
    mode='markers',
    name='Data',
    marker=dict(size=8, color='blue', opacity=0.5)
))

# Outliers
outliers = df[df['is_outlier']]
fig.add_trace(go.Scatter(
    x=outliers['x'],
    y=outliers['y'],
    mode='markers',
    name='Outliers',
    marker=dict(size=12, color='red', symbol='x')
))

fig.show()
```

## Summary

Scatter and line plots are foundational for data analysis:

**Scatter Plots**:
- Perfect for correlation analysis
- Enhanced with color and size encoding
- Interactive exploration of patterns
- Bubble charts for multi-dimensional data

**Line Charts**:
- Essential for time series
- Compare multiple trends
- Range sliders for navigation
- Unified hover for comparison

Both benefit from Plotly's interactivity, turning static analysis into dynamic exploration.

---

**Navigation:**
- **Previous**: [Plotly Introduction](./plotly-introduction.md)
- **Next**: [Plotly Basic Charts - Part 2](./plotly-basic-charts-bar-pie.md)
- **Related**: [Statistical Charts](./plotly-statistical-charts.md)
