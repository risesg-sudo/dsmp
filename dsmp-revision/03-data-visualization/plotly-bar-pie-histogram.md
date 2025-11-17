# Plotly Bar Charts, Pie Charts, and Histograms

## What You'll Learn

Master bar charts for categorical comparisons, pie charts for proportions, and histograms for distributions. Learn when each is appropriate and how to make them interactive and insightful.

## Bar Charts

### When to Use Bar Charts

**Perfect for**:
- Comparing categories
- Showing rankings
- Grouped comparisons
- Time-based categorical data

### Basic Bar Chart

```python
import plotly.express as px

df_tips = px.data.tips()

# Simple bar chart
fig = px.bar(df_tips,
             x='day',
             y='total_bill',
             title='Total Bill by Day')

fig.update_layout(
    xaxis_title='Day of Week',
    yaxis_title='Total Bill ($)'
)

fig.show()
```

### Grouped Bar Charts

```python
# Grouped by gender
fig = px.bar(df_tips,
             x='day',
             y='total_bill',
             color='sex',
             barmode='group',  # 'group', 'stack', 'relative'
             title='Total Bill by Day and Gender')

fig.update_layout(width=900, height=600)
fig.show()
```

### Stacked Bar Charts

```python
# Stacked bars
fig = px.bar(df_tips,
             x='day',
             y='total_bill',
             color='sex',
             barmode='stack',
             title='Stacked Bar Chart')
fig.show()
```

### Horizontal Bar Charts

```python
# Horizontal orientation
fig = px.bar(df_tips,
             y='day',  # y for horizontal
             x='total_bill',
             color='sex',
             orientation='h',
             title='Horizontal Bar Chart')
fig.show()
```

### Custom Bar Charts with Patterns

```python
import plotly.graph_objects as go

# Add patterns for accessibility
fig = go.Figure()

fig.add_trace(go.Bar(
    x=['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    y=[20, 14, 23, 25, 22],
    name='Product A',
    marker_pattern_shape='/',  # Diagonal lines
    marker_color='lightblue'
))

fig.add_trace(go.Bar(
    x=['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    y=[12, 18, 19, 14, 16],
    name='Product B',
    marker_pattern_shape='\\',  # Opposite diagonal
    marker_color='lightgreen'
))

fig.update_layout(
    barmode='group',
    title='Bar Chart with Patterns',
    xaxis_title='Day',
    yaxis_title='Sales'
)

fig.show()
```

## Pie Charts

### When to Use Pie Charts

**Perfect for**:
- Showing proportions of a whole
- Simple part-to-whole relationships
- Limited categories (max 5-7)
- Percentage visualization

**Avoid when**:
- Comparing many categories
- Showing trends over time
- Precise value comparison needed

### Basic Pie Chart

```python
df = px.data.tips()
day_counts = df['day'].value_counts()

# Simple pie chart
fig = px.pie(
    values=day_counts.values,
    names=day_counts.index,
    title='Distribution of Tips by Day'
)

fig.show()
```

### Enhanced Pie Chart

```python
# With custom colors and hover
fig = px.pie(
    values=day_counts.values,
    names=day_counts.index,
    title='Distribution of Tips by Day',
    hole=0,  # 0 for pie, >0 for donut
    color_discrete_sequence=px.colors.qualitative.Set3
)

fig.update_traces(
    textposition='inside',
    textinfo='percent+label',
    hovertemplate='<b>%{label}</b><br>' +
                  'Count: %{value}<br>' +
                  'Percent: %{percent}<br>' +
                  '<extra></extra>'
)

fig.show()
```

### Donut Chart

```python
# Donut chart (pie with hole)
fig = px.pie(
    values=day_counts.values,
    names=day_counts.index,
    title='Donut Chart',
    hole=0.4  # Creates donut effect
)

fig.update_traces(
    textposition='inside',
    textfont_size=14
)

fig.show()
```

### Pulled-out Slices

```python
import plotly.graph_objects as go

# Pull out specific slices
fig = go.Figure(data=[go.Pie(
    labels=['A', 'B', 'C', 'D'],
    values=[40, 30, 20, 10],
    pull=[0, 0.1, 0, 0],  # Pull out 'B'
    hole=0.3
)])

fig.update_layout(title='Pie with Pulled Slice')
fig.show()
```

## Histograms

### When to Use Histograms

**Perfect for**:
- Understanding data distributions
- Finding patterns in continuous data
- Identifying skewness
- Detecting outliers
- Comparing distributions

### Basic Histogram

```python
df = px.data.tips()

# Simple histogram
fig = px.histogram(df,
                   x='total_bill',
                   nbins=30,
                   title='Distribution of Total Bills')

fig.update_layout(
    xaxis_title='Total Bill ($)',
    yaxis_title='Frequency',
    showlegend=False
)

fig.show()
```

### Overlaid Histograms

```python
# Compare distributions
fig = px.histogram(df,
                   x='total_bill',
                   color='sex',
                   nbins=30,
                   barmode='overlay',
                   opacity=0.7,
                   title='Total Bill Distribution by Gender')

fig.update_layout(
    xaxis_title='Total Bill ($)',
    yaxis_title='Count'
)

fig.show()
```

### Histogram with Marginal Plots

```python
# 2D histogram with marginals
fig = px.histogram(df,
                   x='total_bill',
                   y='tip',
                   marginal='box',  # 'box', 'violin', 'rug'
                   color='sex',
                   title='2D Histogram with Marginals')

fig.show()
```

### Cumulative Histogram

```python
# Cumulative distribution
fig = px.histogram(df,
                   x='total_bill',
                   cumulative=True,
                   nbins=50,
                   title='Cumulative Distribution')

fig.update_layout(
    xaxis_title='Total Bill ($)',
    yaxis_title='Cumulative Count'
)

fig.show()
```

### Normalized Histogram

```python
# Probability density
fig = px.histogram(df,
                   x='total_bill',
                   histnorm='probability density',
                   nbins=30,
                   title='Probability Density')

fig.show()
```

## Best Practices

### Bar Charts

**Do**:
- Start y-axis at zero
- Sort bars for rankings
- Use horizontal for long labels
- Limit colors (3-5 categories)
- Add value labels for precision

**Don't**:
- Use 3D bars (misleading)
- Truncate y-axis
- Use too many categories (> 15)
- Forget to label axes

### Pie Charts

**Do**:
- Limit to 5-7 categories
- Order slices by size
- Use contrasting colors
- Show percentages
- Consider donut for readability

**Don't**:
- Use for many categories
- Use 3D pies (distorts perception)
- Compare multiple pies
- Use similar colors

### Histograms

**Do**:
- Experiment with bin count
- Use appropriate bin width
- Consider log scale for skewed data
- Show sample size
- Add reference lines (mean, median)

**Don't**:
- Use too few/many bins
- Ignore outliers
- Forget axis labels
- Compare different sample sizes without normalization

## Common Patterns

### Ranked Bar Chart

```python
# Sort by value
df_sorted = df.groupby('day')['total_bill'].sum().sort_values()

fig = px.bar(df_sorted,
             x=df_sorted.values,
             y=df_sorted.index,
             orientation='h',
             title='Total Bill by Day (Sorted)')

fig.update_layout(
    xaxis_title='Total Bill ($)',
    yaxis_title='Day'
)

fig.show()
```

### Distribution Comparison

```python
# Multiple overlaid histograms
fig = go.Figure()

for category in df['time'].unique():
    data = df[df['time'] == category]['total_bill']
    fig.add_trace(go.Histogram(
        x=data,
        name=category,
        opacity=0.6,
        nbinsx=20
    ))

fig.update_layout(
    barmode='overlay',
    title='Bill Distribution by Time',
    xaxis_title='Total Bill ($)',
    yaxis_title='Count'
)

fig.show()
```

## Summary

Master these three essential chart types:

**Bar Charts**:
- Perfect for categorical comparisons
- Grouped, stacked, or horizontal layouts
- Interactive filtering by clicking legend

**Pie Charts**:
- Show proportions effectively
- Limit to few categories
- Donut variant for modern look

**Histograms**:
- Reveal data distributions
- Adjustable bin count
- Overlay for comparisons
- Marginal plots for extra context

All three benefit from Plotly's interactivity for deeper exploration.

---

**Navigation:**
- **Previous**: [Plotly Scatter and Line](./plotly-basic-charts-scatter-line.md)
- **Next**: [Plotly Statistical Charts](./plotly-statistical-charts.md)
- **Related**: [Plotly Introduction](./plotly-introduction.md)
