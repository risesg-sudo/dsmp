# Plotly Statistical and 3D Charts

## What You'll Learn

Master statistical visualizations (box plots, violin plots, heatmaps) and 3D charts (scatter, surface) in Plotly for advanced data analysis and scientific visualization.

## Box Plots

### When to Use

**Perfect for**:
- Comparing distributions across groups
- Identifying outliers
- Statistical summary (quartiles, median)
- Quick distribution assessment

```python
import plotly.express as px

df = px.data.tips()

# Basic box plot
fig = px.box(df,
             x='day',
             y='total_bill',
             color='sex',
             title='Total Bill Distribution by Day',
             points='all')  # 'all', 'outliers', False

fig.update_layout(
    xaxis_title='Day of Week',
    yaxis_title='Total Bill ($)'
)

fig.show()
```

### Box Plot Features

```python
# Horizontal with notches
fig = px.box(df,
             y='day',
             x='total_bill',
             color='sex',
             orientation='h',
             notched=True,  # Confidence interval notches
             title='Horizontal Box Plot with Notches')

fig.show()
```

## Violin Plots

### When to Use

**Perfect for**:
- Show full distribution shape
- Better than box plots for bimodal data
- Compare distribution shapes

```python
# Violin plot with box inside
fig = px.violin(df,
                x='day',
                y='total_bill',
                color='sex',
                box=True,       # Show box plot inside
                points='all',   # Show all points
                title='Violin Plot with Box and Points')

fig.update_layout(
    xaxis_title='Day of Week',
    yaxis_title='Total Bill ($)'
)

fig.show()
```

## Heatmaps

### When to Use

**Perfect for**:
- Correlation matrices
- Confusion matrices
- Time-based patterns
- 2D data density

### Correlation Matrix

```python
import plotly.express as px
import plotly.graph_objects as go

# Correlation heatmap
df = px.data.tips()
corr_matrix = df[['total_bill', 'tip', 'size']].corr()

fig = px.imshow(
    corr_matrix,
    text_auto=True,
    aspect='auto',
    color_continuous_scale='RdBu_r',
    color_continuous_midpoint=0,
    title='Correlation Matrix Heatmap'
)

fig.update_layout(width=700, height=600)
fig.show()
```

### Custom Heatmap

```python
import numpy as np

z_data = np.random.randn(10, 10)

fig = go.Figure(data=go.Heatmap(
    z=z_data,
    x=[f'Col {i}' for i in range(10)],
    y=[f'Row {i}' for i in range(10)],
    colorscale='Viridis',
    hovertemplate='X: %{x}<br>Y: %{y}<br>Value: %{z:.2f}<extra></extra>'
))

fig.update_layout(
    title='Custom Heatmap',
    width=800,
    height=700
)

fig.show()
```

## Scatter Matrix

### When to Use

**Perfect for**:
- Exploring relationships between multiple variables
- Finding correlations
- Initial data exploration

```python
df = px.data.iris()

fig = px.scatter_matrix(
    df,
    dimensions=['sepal_width', 'sepal_length', 'petal_width', 'petal_length'],
    color='species',
    title='Iris Dataset - Scatter Matrix',
    height=800,
    width=800
)

fig.update_traces(diagonal_visible=False)
fig.show()
```

## 3D Scatter Plots

### When to Use

**Perfect for**:
- Three-dimensional relationships
- Clustering visualization
- Spatial data
- Scientific data visualization

```python
df = px.data.iris()

fig = px.scatter_3d(
    df,
    x='sepal_length',
    y='sepal_width',
    z='petal_length',
    color='species',
    size='petal_width',
    symbol='species',
    title='3D Scatter Plot - Iris Dataset'
)

fig.update_layout(
    scene=dict(
        xaxis_title='Sepal Length',
        yaxis_title='Sepal Width',
        zaxis_title='Petal Length'
    ),
    width=900,
    height=700
)

fig.show()
```

**Interactive 3D Controls**:
- Click and drag to rotate
- Scroll to zoom
- Right-click drag to pan
- Hover for details

## 3D Surface Plots

### When to Use

**Perfect for**:
- Mathematical functions
- Elevation data
- Response surfaces
- Scientific visualization

```python
import numpy as np

# Create surface data
x = np.linspace(-5, 5, 50)
y = np.linspace(-5, 5, 50)
X, Y = np.meshgrid(x, y)
Z = np.sin(np.sqrt(X**2 + Y**2))

fig = go.Figure(data=[go.Surface(
    z=Z,
    x=x,
    y=y,
    colorscale='Viridis'
)])

fig.update_layout(
    title='3D Surface Plot',
    scene=dict(
        xaxis_title='X',
        yaxis_title='Y',
        zaxis_title='Z',
        camera=dict(
            eye=dict(x=1.5, y=1.5, z=1.3)
        )
    ),
    width=900,
    height=700
)

fig.show()
```

## Contour Plots

### When to Use

**Perfect for**:
- 3D data on 2D plane
- Topographical visualization
- Optimization landscapes

```python
x = np.linspace(-3, 3, 100)
y = np.linspace(-3, 3, 100)
X, Y = np.meshgrid(x, y)
Z = np.sin(np.sqrt(X**2 + Y**2))

fig = go.Figure(data=go.Contour(
    z=Z,
    x=x,
    y=y,
    colorscale='Viridis',
    contours=dict(
        showlabels=True,
        labelfont=dict(size=10, color='white')
    )
))

fig.update_layout(
    title='Contour Plot',
    xaxis_title='X',
    yaxis_title='Y',
    width=800,
    height=700
)

fig.show()
```

## Density Heatmap

### For Large Scatter Datasets

```python
# Generate large dataset
n = 10000
x = np.random.randn(n)
y = 2 * x + np.random.randn(n) * 0.5

# Density heatmap
fig = px.density_heatmap(
    x=x,
    y=y,
    nbinsx=40,
    nbinsy=40,
    title='2D Density Heatmap',
    color_continuous_scale='Viridis'
)

fig.update_layout(
    xaxis_title='X Variable',
    yaxis_title='Y Variable'
)

fig.show()
```

### With Marginal Distributions

```python
fig = px.density_heatmap(
    x=x,
    y=y,
    marginal_x='histogram',
    marginal_y='histogram',
    title='Density Heatmap with Marginals'
)

fig.show()
```

## Best Practices

### Box and Violin Plots

**Do**:
- Use box plots for quick comparisons
- Use violin plots to show full distribution
- Show points for small datasets
- Use notches for significance testing

**Don't**:
- Use for very small samples (< 5 points)
- Forget to explain quartiles to audience
- Use too many groups (limit to 10)

### Heatmaps

**Do**:
- Center diverging colormaps at meaningful values
- Show values for small matrices
- Use appropriate color scale
- Add clear axis labels

**Don't**:
- Use rainbow colormap (perception issues)
- Forget to normalize if needed
- Use for sparse data without annotation

### 3D Plots

**Do**:
- Provide rotation instructions
- Use color for 4th dimension
- Set appropriate camera angle
- Consider multiple views

**Don't**:
- Overuse 3D when 2D suffices
- Use for presentations (hard to see)
- Forget that 3D can obscure data
- Use for precise value reading

## Summary

Statistical and 3D charts for advanced analysis:

**Statistical Charts**:
- Box plots: Quick distribution comparison
- Violin plots: Full distribution shape
- Heatmaps: Correlation and patterns
- Scatter matrix: Multi-variable exploration

**3D Visualizations**:
- 3D scatter: Three-dimensional relationships
- Surface plots: Mathematical functions
- Contour plots: Topographical data
- Interactive rotation: Explore all angles

Use these advanced charts when standard 2D plots don't capture data complexity.

---

**Navigation:**
- **Previous**: [Plotly Bar, Pie, Histogram](./plotly-bar-pie-histogram.md)
- **Next**: [Plotly Interactivity and Dashboards](./plotly-interactivity-dashboards.md)
- **Related**: [Plotly Introduction](./plotly-introduction.md)
