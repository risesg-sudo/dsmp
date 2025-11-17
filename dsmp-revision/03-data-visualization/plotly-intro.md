# Plotly Introduction - Revision Notes

## Table of Contents
1. [Introduction](#introduction)
2. [Basic Charts](#basic-charts)
3. [Statistical Charts](#statistical-charts)
4. [Scientific Charts](#scientific-charts)
5. [Subplots and Layout](#subplots-and-layout)
6. [Interactivity Features](#interactivity-features)
7. [Plotly Express](#plotly-express)
8. [Dashboard Integration](#dashboard-integration)

---

## Introduction

**Plotly** is an interactive visualization library that creates web-based, interactive plots. It's perfect for:
- Interactive exploration
- Dashboards and web applications
- Presentations requiring interaction
- Large datasets with zoom/pan capabilities

### Three Ways to Use Plotly

1. **Plotly Express**: High-level, quick plots (recommended for beginners)
2. **Graph Objects**: Low-level, full control (for complex plots)
3. **Plotly + Dash**: Full dashboard applications

```python
# Install plotly
# pip install plotly

# Import
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np
```

### Key Advantages

**Interactive by Default:**
- Zoom and pan
- Hover for details
- Click to filter
- Export to PNG
- Toggle traces

**Web-Based:**
- Works in Jupyter notebooks
- Can be embedded in websites
- Export to HTML

---

## Basic Charts

### 1. Scatter Plot

**When to Use:**
- Correlation analysis
- Pattern identification
- Interactive data exploration

```python
import plotly.express as px

# Load sample data
df = px.data.iris()

# Basic scatter plot
fig = px.scatter(df,
                 x='sepal_width',
                 y='sepal_length',
                 title='Iris Sepal Dimensions')
fig.show()

# With color and size encoding
fig = px.scatter(df,
                 x='sepal_width',
                 y='sepal_length',
                 color='species',           # color by category
                 size='petal_length',       # size by value
                 hover_data=['petal_width'], # additional hover info
                 title='Interactive Iris Dataset',
                 labels={'sepal_width': 'Sepal Width (cm)',
                        'sepal_length': 'Sepal Length (cm)'})

# Customize layout
fig.update_layout(
    font=dict(size=12),
    width=900,
    height=600,
    hovermode='closest'
)

fig.show()
```

**Real-World Use Cases:**
- Customer segmentation analysis
- Sales vs Marketing spend
- Quality control measurements
- Scientific data exploration

**Interactive Features:**
- Hover to see exact values
- Click legend to toggle series
- Zoom into regions
- Pan to explore

### 2. Line Chart

**When to Use:**
- Time series data
- Trends over time
- Multiple series comparison

```python
# Sample time series data
df_stocks = px.data.stocks()

# Basic line plot
fig = px.line(df_stocks,
              x='date',
              y=['GOOG', 'AAPL', 'AMZN', 'MSFT'],
              title='Stock Prices Over Time')

fig.update_layout(
    xaxis_title='Date',
    yaxis_title='Stock Price ($)',
    hovermode='x unified',  # unified hover across all lines
    width=1000,
    height=600
)

fig.show()

# With range slider
fig.update_xaxes(rangeslider_visible=True)
fig.show()
```

**Using Graph Objects:**
```python
import plotly.graph_objects as go

fig = go.Figure()

# Add traces
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

fig.add_trace(go.Scatter(
    x=df_stocks['date'],
    y=df_stocks['AAPL'],
    mode='lines',
    name='Apple',
    line=dict(color='red', width=2)
))

fig.update_layout(
    title='Stock Prices - Custom Hover',
    xaxis_title='Date',
    yaxis_title='Price ($)',
    hovermode='x unified'
)

fig.show()
```

**Real-World Use Cases:**
- Stock market analysis
- Temperature monitoring
- Website traffic trends
- Sales performance over time

### 3. Bar Chart

**When to Use:**
- Categorical comparisons
- Ranking visualization
- Grouped data comparison

```python
df_tips = px.data.tips()

# Basic bar chart
fig = px.bar(df_tips,
             x='day',
             y='total_bill',
             color='sex',
             barmode='group',  # 'group', 'stack', 'relative'
             title='Total Bill by Day and Gender')

fig.update_layout(
    xaxis_title='Day of Week',
    yaxis_title='Total Bill ($)',
    width=900,
    height=600
)

fig.show()

# Horizontal bar chart
fig = px.bar(df_tips,
             y='day',
             x='total_bill',
             color='sex',
             orientation='h',
             title='Horizontal Bar Chart')
fig.show()
```

**Stacked and Grouped Bars:**
```python
# Stacked bar chart
fig = px.bar(df_tips,
             x='day',
             y='total_bill',
             color='sex',
             barmode='stack',
             title='Stacked Bar Chart')
fig.show()

# With pattern fills (for colorblind accessibility)
fig = go.Figure()

fig.add_trace(go.Bar(
    x=['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    y=[20, 14, 23, 25, 22],
    name='Product A',
    marker_pattern_shape='/',
    marker_color='lightblue'
))

fig.add_trace(go.Bar(
    x=['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    y=[12, 18, 19, 14, 16],
    name='Product B',
    marker_pattern_shape='\\',
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

**Real-World Use Cases:**
- Sales by region
- Survey results
- Product comparisons
- Budget allocation

### 4. Pie and Donut Charts

**When to Use:**
- Show proportions
- Parts of a whole
- Limited categories (max 5-7)

```python
df = px.data.tips()
day_counts = df['day'].value_counts()

# Pie chart
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

# Donut chart
fig = px.pie(
    values=day_counts.values,
    names=day_counts.index,
    title='Donut Chart',
    hole=0.4  # Creates donut effect
)
fig.show()
```

**Real-World Use Cases:**
- Market share visualization
- Budget breakdown
- Survey response distribution
- Category proportions

### 5. Histogram

**When to Use:**
- Distribution analysis
- Frequency visualization
- Data spread understanding

```python
df = px.data.tips()

# Basic histogram
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

# Overlaid histograms
fig = px.histogram(df,
                   x='total_bill',
                   color='sex',
                   nbins=30,
                   barmode='overlay',  # 'overlay', 'group', 'stack'
                   opacity=0.7,
                   title='Total Bill Distribution by Gender')
fig.show()

# With marginal plots
fig = px.histogram(df,
                   x='total_bill',
                   y='tip',
                   marginal='box',  # 'box', 'violin', 'rug'
                   color='sex',
                   title='Histogram with Marginals')
fig.show()
```

**Real-World Use Cases:**
- Age distribution analysis
- Exam score distribution
- Response time analysis
- Income distribution

---

## Statistical Charts

### 1. Box Plot

**ASCII Representation:**
```
      │
      ├──┬──┤     Interactive whiskers
      │  │  │
    ┌─┼──┼──┼─┐   Click to see stats
    └─┼──●──┼─┘   Hover for values
      │  │  │
      ├──┴──┤
      │
```

**When to Use:**
- Compare distributions
- Identify outliers
- Statistical summary

```python
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
    yaxis_title='Total Bill ($)',
    width=900,
    height=600
)

fig.show()

# Horizontal box plot
fig = px.box(df,
             y='day',
             x='total_bill',
             color='sex',
             orientation='h',
             notched=True,  # notched boxes
             title='Horizontal Box Plot with Notches')
fig.show()
```

**Real-World Use Cases:**
- Salary comparison by department
- Quality control measurements
- Test scores across classes
- Response times by server

### 2. Violin Plot

**When to Use:**
- Show full distribution shape
- Better than box plot for bimodal data
- Compare distribution shapes

```python
# Violin plot
fig = px.violin(df,
                x='day',
                y='total_bill',
                color='sex',
                box=True,       # show box plot inside
                points='all',   # show all points
                title='Violin Plot with Box and Points')

fig.update_layout(
    xaxis_title='Day of Week',
    yaxis_title='Total Bill ($)',
    width=900,
    height=600
)

fig.show()
```

### 3. Scatter Matrix

**When to Use:**
- Explore multiple variables
- Find correlations
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

fig.update_traces(diagonal_visible=False)  # hide diagonal
fig.show()
```

**Real-World Use Cases:**
- Feature exploration in ML
- Multivariate analysis
- Quality metrics comparison
- Portfolio analysis

### 4. Density Heatmap

**When to Use:**
- Large scatter plot datasets
- 2D density visualization
- Pattern identification

```python
# Generate sample data
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
    yaxis_title='Y Variable',
    width=800,
    height=600
)

fig.show()

# With marginal distributions
fig = px.density_heatmap(
    x=x,
    y=y,
    marginal_x='histogram',
    marginal_y='histogram',
    title='Density Heatmap with Marginals'
)
fig.show()
```

---

## Scientific Charts

### 1. Heatmap

**When to Use:**
- Correlation matrices
- Confusion matrices
- Time-based patterns

```python
# Correlation matrix
df = px.data.tips()
corr_matrix = df[['total_bill', 'tip', 'size']].corr()

fig = px.imshow(
    corr_matrix,
    text_auto=True,  # show values
    aspect='auto',
    color_continuous_scale='RdBu_r',
    color_continuous_midpoint=0,
    title='Correlation Matrix Heatmap'
)

fig.update_layout(
    width=700,
    height=600
)

fig.show()

# Custom heatmap with Graph Objects
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

**Real-World Use Cases:**
- Feature correlations in ML
- Confusion matrix visualization
- Sales patterns over time
- Website traffic heatmaps

### 2. Contour Plot

**When to Use:**
- 3D data on 2D plane
- Topographical visualization
- Function visualization

```python
# Generate 3D surface data
x = np.linspace(-3, 3, 100)
y = np.linspace(-3, 3, 100)
X, Y = np.meshgrid(x, y)
Z = np.sin(np.sqrt(X**2 + Y**2))

# Contour plot
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

# Filled contour
fig = go.Figure(data=go.Contour(
    z=Z,
    x=x,
    y=y,
    colorscale='Jet',
    contours=dict(
        coloring='heatmap',
        showlabels=True
    )
))

fig.update_layout(title='Filled Contour Plot')
fig.show()
```

### 3. 3D Scatter Plot

**When to Use:**
- Three-dimensional relationships
- Clustering visualization
- Spatial data

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
    title='3D Scatter Plot - Iris Dataset',
    labels={'sepal_length': 'Sepal Length (cm)',
            'sepal_width': 'Sepal Width (cm)',
            'petal_length': 'Petal Length (cm)'}
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

**Interactive 3D Features:**
- Rotate by dragging
- Zoom with scroll
- Pan with right-click
- Hover for details

### 4. 3D Surface Plot

**When to Use:**
- Visualize functions
- Elevation data
- Response surfaces

```python
# Create surface data
x = np.linspace(-5, 5, 50)
y = np.linspace(-5, 5, 50)
X, Y = np.meshgrid(x, y)
Z = np.sin(np.sqrt(X**2 + Y**2))

fig = go.Figure(data=[go.Surface(
    z=Z,
    x=x,
    y=y,
    colorscale='Viridis',
    hovertemplate='X: %{x:.2f}<br>Y: %{y:.2f}<br>Z: %{z:.2f}<extra></extra>'
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

**Real-World Use Cases:**
- Terrain visualization
- Mathematical function plotting
- Optimization landscapes
- Response surface methodology

---

## Subplots and Layout

### 1. Basic Subplots

```python
from plotly.subplots import make_subplots

# Create 2x2 subplots
fig = make_subplots(
    rows=2,
    cols=2,
    subplot_titles=('Scatter', 'Line', 'Bar', 'Histogram')
)

# Add traces
df = px.data.tips()

# Scatter
fig.add_trace(
    go.Scatter(x=df['total_bill'], y=df['tip'], mode='markers', name='Scatter'),
    row=1, col=1
)

# Line
fig.add_trace(
    go.Scatter(x=[1, 2, 3, 4], y=[10, 11, 12, 13], mode='lines', name='Line'),
    row=1, col=2
)

# Bar
fig.add_trace(
    go.Bar(x=['A', 'B', 'C'], y=[10, 15, 13], name='Bar'),
    row=2, col=1
)

# Histogram
fig.add_trace(
    go.Histogram(x=df['total_bill'], name='Histogram'),
    row=2, col=2
)

fig.update_layout(
    height=800,
    showlegend=False,
    title_text='Multiple Plot Types in Subplots'
)

fig.show()
```

### 2. Shared Axes

```python
# Shared x-axis
fig = make_subplots(
    rows=2,
    cols=1,
    shared_xaxes=True,
    vertical_spacing=0.1,
    subplot_titles=('Plot 1', 'Plot 2')
)

df = px.data.stocks()

fig.add_trace(
    go.Scatter(x=df['date'], y=df['GOOG'], name='Google'),
    row=1, col=1
)

fig.add_trace(
    go.Scatter(x=df['date'], y=df['AAPL'], name='Apple'),
    row=2, col=1
)

fig.update_layout(
    height=600,
    title_text='Shared X-Axis'
)

fig.show()
```

### 3. Mixed Subplot Types

```python
# Different subplot types
fig = make_subplots(
    rows=2,
    cols=2,
    specs=[
        [{'type': 'scatter'}, {'type': 'bar'}],
        [{'type': 'scatter3d', 'colspan': 2}, None]
    ],
    subplot_titles=('Scatter', 'Bar', '3D Scatter')
)

df = px.data.tips()

# 2D Scatter
fig.add_trace(
    go.Scatter(x=df['total_bill'], y=df['tip'], mode='markers'),
    row=1, col=1
)

# Bar
fig.add_trace(
    go.Bar(x=['Mon', 'Tue', 'Wed'], y=[10, 15, 13]),
    row=1, col=2
)

# 3D Scatter
fig.add_trace(
    go.Scatter3d(
        x=df['total_bill'][:50],
        y=df['tip'][:50],
        z=df['size'][:50],
        mode='markers'
    ),
    row=2, col=1
)

fig.update_layout(height=800, showlegend=False)
fig.show()
```

### 4. Irregular Layouts

```python
# Custom layout with spanning
fig = make_subplots(
    rows=3,
    cols=2,
    specs=[
        [{'rowspan': 2}, {}],
        [None, {}],
        [{'colspan': 2}, None]
    ],
    subplot_titles=('Large Plot', 'Small 1', 'Small 2', 'Wide Plot')
)

# Add traces to each subplot
fig.add_trace(go.Scatter(x=[1, 2, 3], y=[1, 2, 3], name='Large'), row=1, col=1)
fig.add_trace(go.Scatter(x=[1, 2, 3], y=[2, 3, 4], name='Small 1'), row=1, col=2)
fig.add_trace(go.Scatter(x=[1, 2, 3], y=[3, 4, 5], name='Small 2'), row=2, col=2)
fig.add_trace(go.Scatter(x=[1, 2, 3], y=[4, 5, 6], name='Wide'), row=3, col=1)

fig.update_layout(height=900, showlegend=True)
fig.show()
```

---

## Interactivity Features

### 1. Hover Templates

```python
df = px.data.tips()

fig = px.scatter(
    df,
    x='total_bill',
    y='tip',
    color='day',
    size='size',
    hover_data={
        'total_bill': ':.2f',  # format with 2 decimals
        'tip': ':.2f',
        'size': True,
        'day': True
    }
)

# Custom hover template
fig.update_traces(
    hovertemplate='<b>Total Bill</b>: $%{x:.2f}<br>' +
                  '<b>Tip</b>: $%{y:.2f}<br>' +
                  '<b>Day</b>: %{customdata[0]}<br>' +
                  '<extra></extra>',
    customdata=df[['day']]
)

fig.show()
```

### 2. Click Events and Selection

```python
# Click data callback (works in Dash)
fig = px.scatter(
    df,
    x='total_bill',
    y='tip',
    color='day',
    title='Click on points (works in Dash)'
)

# Selection styling
fig.update_traces(
    selected=dict(marker=dict(size=20, color='red')),
    unselected=dict(marker=dict(opacity=0.3))
)

fig.show()
```

### 3. Range Slider and Selector

```python
df = px.data.stocks()

fig = px.line(df, x='date', y='GOOG', title='Stock Price with Range Slider')

# Add range slider
fig.update_xaxes(
    rangeslider_visible=True,
    rangeselector=dict(
        buttons=list([
            dict(count=1, label='1m', step='month', stepmode='backward'),
            dict(count=6, label='6m', step='month', stepmode='backward'),
            dict(count=1, label='YTD', step='year', stepmode='todate'),
            dict(count=1, label='1y', step='year', stepmode='backward'),
            dict(step='all')
        ])
    )
)

fig.show()
```

### 4. Buttons and Dropdowns

```python
# Create figure with buttons
df = px.data.iris()

fig = go.Figure()

# Add traces for each species (initially all visible)
for species in df['species'].unique():
    df_species = df[df['species'] == species]
    fig.add_trace(go.Scatter(
        x=df_species['sepal_width'],
        y=df_species['sepal_length'],
        mode='markers',
        name=species,
        marker=dict(size=10)
    ))

# Add dropdown menu
fig.update_layout(
    updatemenus=[
        dict(
            buttons=list([
                dict(
                    args=[{'visible': [True, True, True]}],
                    label='All',
                    method='update'
                ),
                dict(
                    args=[{'visible': [True, False, False]}],
                    label='Setosa',
                    method='update'
                ),
                dict(
                    args=[{'visible': [False, True, False]}],
                    label='Versicolor',
                    method='update'
                ),
                dict(
                    args=[{'visible': [False, False, True]}],
                    label='Virginica',
                    method='update'
                )
            ]),
            direction='down',
            showactive=True,
            x=0.1,
            xanchor='left',
            y=1.15,
            yanchor='top'
        )
    ],
    title='Interactive Filter Dropdown'
)

fig.show()
```

### 5. Animation

```python
df = px.data.gapminder()

fig = px.scatter(
    df,
    x='gdpPercap',
    y='lifeExp',
    animation_frame='year',      # animate by year
    animation_group='country',   # group by country
    size='pop',
    color='continent',
    hover_name='country',
    log_x=True,
    size_max=60,
    range_x=[100, 100000],
    range_y=[25, 90],
    title='Gapminder: GDP vs Life Expectancy Over Time'
)

fig.update_layout(
    width=1000,
    height=600
)

fig.show()
```

**Animation Features:**
- Play/pause button
- Speed control
- Frame slider
- Smooth transitions

---

## Plotly Express

### Quick Reference

```python
import plotly.express as px

# Scatter and Line
px.scatter(df, x='col1', y='col2', color='cat', size='val')
px.line(df, x='col1', y='col2', color='cat')
px.scatter_matrix(df, dimensions=['col1', 'col2', 'col3'])

# Bar and Histogram
px.bar(df, x='cat', y='val', color='group')
px.histogram(df, x='val', nbins=30, color='cat')

# Statistical
px.box(df, x='cat', y='val', color='group')
px.violin(df, x='cat', y='val', color='group', box=True)
px.density_heatmap(df, x='col1', y='col2')

# Maps
px.scatter_geo(df, lat='lat', lon='lon', color='val')
px.choropleth(df, locations='code', color='val')

# 3D
px.scatter_3d(df, x='col1', y='col2', z='col3', color='cat')
px.line_3d(df, x='col1', y='col2', z='col3')

# Specialized
px.sunburst(df, path=['cat1', 'cat2'], values='val')
px.treemap(df, path=['cat1', 'cat2'], values='val')
px.funnel(df, x='val', y='stage')
```

### Common Parameters

```python
# All px functions support:
- data_frame: DataFrame
- color: color by column
- size: size by column
- hover_data: additional hover info
- facet_row: create row facets
- facet_col: create column facets
- animation_frame: animate by column
- animation_group: group animation
- labels: custom axis labels
- title: plot title
- width, height: figure size
- template: theme template
```

---

## Dashboard Integration

### 1. Export to HTML

```python
# Create plot
fig = px.scatter(df, x='total_bill', y='tip', color='day')

# Save as HTML
fig.write_html('interactive_plot.html')

# With config options
config = {
    'toImageButtonOptions': {
        'format': 'png',
        'filename': 'custom_name',
        'height': 1000,
        'width': 1500,
        'scale': 2
    },
    'displayModeBar': True,
    'displaylogo': False
}

fig.write_html('plot_with_config.html', config=config)
```

### 2. Dash Integration (Basic)

```python
# Install: pip install dash

import dash
from dash import dcc, html
from dash.dependencies import Input, Output

# Create Dash app
app = dash.Dash(__name__)

# Layout
app.layout = html.Div([
    html.H1('Interactive Dashboard'),

    dcc.Dropdown(
        id='dropdown',
        options=[
            {'label': 'Scatter', 'value': 'scatter'},
            {'label': 'Box', 'value': 'box'},
            {'label': 'Violin', 'value': 'violin'}
        ],
        value='scatter'
    ),

    dcc.Graph(id='graph')
])

# Callback
@app.callback(
    Output('graph', 'figure'),
    Input('dropdown', 'value')
)
def update_graph(plot_type):
    df = px.data.tips()

    if plot_type == 'scatter':
        fig = px.scatter(df, x='total_bill', y='tip', color='day')
    elif plot_type == 'box':
        fig = px.box(df, x='day', y='total_bill', color='sex')
    else:
        fig = px.violin(df, x='day', y='total_bill', color='sex')

    return fig

# Run app
if __name__ == '__main__':
    app.run_server(debug=True)
```

### 3. Jupyter Integration

```python
# In Jupyter notebook
import plotly.graph_objects as go

# Default renderer
fig.show()

# Specific renderers
fig.show(renderer='notebook')  # Jupyter classic
fig.show(renderer='colab')     # Google Colab
fig.show(renderer='iframe')    # iframe
fig.show(renderer='browser')   # external browser

# Set default renderer
import plotly.io as pio
pio.renderers.default = 'notebook'
```

---

## Best Practices

### 1. Choosing Plotly vs Others

**Use Plotly when:**
- Need interactivity
- Building dashboards
- Large datasets requiring zoom/pan
- Sharing plots as HTML
- 3D visualizations needed

**Use Matplotlib/Seaborn when:**
- Static plots for papers
- Need fine-grained control
- Publication requirements
- Simple, quick plots

### 2. Performance Tips

```python
# For large datasets:

# 1. Downsample data
df_sample = df.sample(n=10000)
fig = px.scatter(df_sample, x='x', y='y')

# 2. Use WebGL for faster rendering
fig = go.Figure()
fig.add_trace(go.Scattergl(  # Note: Scattergl (WebGL)
    x=large_x,
    y=large_y,
    mode='markers'
))

# 3. Disable hover for very large datasets
fig.update_traces(hoverinfo='skip')

# 4. Use appropriate plot types
# For 1M+ points: use density_heatmap or hexbin
# instead of scatter
```

### 3. Layout Best Practices

```python
# Standard layout template
fig.update_layout(
    title={
        'text': 'Plot Title',
        'x': 0.5,
        'xanchor': 'center',
        'font': {'size': 20, 'family': 'Arial', 'color': '#333'}
    },
    xaxis_title='X-axis Label',
    yaxis_title='Y-axis Label',
    font=dict(size=12, family='Arial'),
    hovermode='closest',  # or 'x', 'y', 'x unified'
    width=900,
    height=600,
    template='plotly_white',  # clean theme
    showlegend=True,
    legend=dict(
        orientation='v',
        yanchor='top',
        y=1,
        xanchor='left',
        x=1.01
    )
)

# Remove gridlines
fig.update_xaxes(showgrid=False)
fig.update_yaxes(showgrid=False)

# Remove background
fig.update_layout(
    plot_bgcolor='white',
    paper_bgcolor='white'
)
```

### 4. Color Schemes

```python
# Built-in color sequences
import plotly.express as px

# Qualitative (categorical data)
px.colors.qualitative.Plotly
px.colors.qualitative.D3
px.colors.qualitative.Set1
px.colors.qualitative.Pastel

# Sequential (continuous data)
px.colors.sequential.Viridis
px.colors.sequential.Plasma
px.colors.sequential.Blues

# Diverging (data with meaningful center)
px.colors.diverging.RdBu
px.colors.diverging.Spectral

# Use in plots
fig = px.scatter(df, x='x', y='y', color='category',
                 color_discrete_sequence=px.colors.qualitative.Set1)

fig = px.scatter(df, x='x', y='y', color='value',
                 color_continuous_scale=px.colors.sequential.Viridis)
```

### 5. Accessibility

```python
# High contrast colors
custom_colors = ['#E69F00', '#56B4E9', '#009E73', '#F0E442']

# Add patterns for colorblind users
fig = go.Figure()
fig.add_trace(go.Bar(
    x=['A', 'B', 'C'],
    y=[1, 2, 3],
    marker_pattern_shape='/',
    name='Pattern 1'
))

# Increase line widths
fig.update_traces(line=dict(width=3))

# Clear labels and large fonts
fig.update_layout(
    font=dict(size=14),
    title_font=dict(size=18)
)
```

---

## Common Patterns

### Pattern 1: Exploratory Data Analysis

```python
def explore_data(df, numeric_cols, cat_col):
    """Create interactive EDA dashboard"""
    from plotly.subplots import make_subplots

    # Create subplots
    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=('Distribution', 'Correlation',
                       'Box Plot', 'Scatter Matrix'),
        specs=[[{'type': 'histogram'}, {'type': 'heatmap'}],
               [{'type': 'box'}, {'type': 'scatter'}]]
    )

    # Histogram
    fig.add_trace(
        go.Histogram(x=df[numeric_cols[0]], name='Distribution'),
        row=1, col=1
    )

    # Correlation heatmap
    corr = df[numeric_cols].corr()
    fig.add_trace(
        go.Heatmap(z=corr.values, x=corr.columns, y=corr.columns),
        row=1, col=2
    )

    # Box plot
    fig.add_trace(
        go.Box(y=df[numeric_cols[0]], x=df[cat_col], name='Box'),
        row=2, col=1
    )

    # Scatter
    fig.add_trace(
        go.Scatter(x=df[numeric_cols[0]], y=df[numeric_cols[1]],
                  mode='markers', name='Scatter'),
        row=2, col=2
    )

    fig.update_layout(height=800, showlegend=False)
    return fig

# Use
df = px.data.tips()
fig = explore_data(df, ['total_bill', 'tip'], 'day')
fig.show()
```

### Pattern 2: Time Series Analysis

```python
def plot_time_series(df, date_col, value_col, title='Time Series'):
    """Interactive time series plot with range selector"""
    fig = px.line(df, x=date_col, y=value_col, title=title)

    fig.update_xaxes(
        rangeslider_visible=True,
        rangeselector=dict(
            buttons=list([
                dict(count=7, label='1w', step='day', stepmode='backward'),
                dict(count=1, label='1m', step='month', stepmode='backward'),
                dict(count=6, label='6m', step='month', stepmode='backward'),
                dict(count=1, label='1y', step='year', stepmode='backward'),
                dict(step='all')
            ])
        )
    )

    return fig

# Use
df = px.data.stocks()
fig = plot_time_series(df, 'date', 'GOOG', 'Google Stock Price')
fig.show()
```

### Pattern 3: Comparison Dashboard

```python
def comparison_dashboard(df, x, y, categories):
    """Create comparison dashboard with multiple views"""
    from plotly.subplots import make_subplots

    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=('Scatter', 'Box', 'Violin', 'Bar'),
        specs=[[{'type': 'scatter'}, {'type': 'box'}],
               [{'type': 'violin'}, {'type': 'bar'}]]
    )

    colors = px.colors.qualitative.Set2

    for i, cat in enumerate(df[categories].unique()):
        df_cat = df[df[categories] == cat]
        color = colors[i % len(colors)]

        # Scatter
        fig.add_trace(
            go.Scatter(x=df_cat[x], y=df_cat[y],
                      mode='markers', name=cat,
                      marker=dict(color=color)),
            row=1, col=1
        )

        # Box
        fig.add_trace(
            go.Box(y=df_cat[y], name=cat,
                   marker=dict(color=color)),
            row=1, col=2
        )

        # Violin
        fig.add_trace(
            go.Violin(y=df_cat[y], name=cat,
                     marker=dict(color=color)),
            row=2, col=1
        )

    # Bar (aggregate)
    agg = df.groupby(categories)[y].mean().reset_index()
    fig.add_trace(
        go.Bar(x=agg[categories], y=agg[y],
               marker=dict(color=colors[:len(agg)])),
        row=2, col=2
    )

    fig.update_layout(height=800, showlegend=True)
    return fig

# Use
df = px.data.tips()
fig = comparison_dashboard(df, 'total_bill', 'tip', 'day')
fig.show()
```

---

## Summary

Plotly provides:
1. **Interactive plots** with hover, zoom, pan
2. **Web-based** visualizations (HTML export)
3. **3D capabilities** for spatial data
4. **Dashboard integration** with Dash
5. **Animation support** for temporal data

**Key Components:**
- **Plotly Express**: High-level, quick plots
- **Graph Objects**: Low-level, full control
- **Subplots**: Complex layouts
- **Dash**: Full dashboard framework

**When to Use:**
- Exploratory data analysis
- Interactive presentations
- Web dashboards
- Large datasets needing zoom/filter
- 3D visualizations

**Remember:**
- Start with Plotly Express for quick plots
- Use Graph Objects for customization
- Export to HTML for sharing
- Use Dash for full applications
- Consider performance with large datasets

**Comparison with Other Libraries:**

| Feature | Matplotlib | Seaborn | Plotly |
|---------|-----------|---------|---------|
| Interactivity | No | No | Yes |
| Ease of use | Medium | High | High |
| Customization | Full | Medium | High |
| Web integration | No | No | Yes |
| 3D plots | Basic | No | Advanced |
| Speed (large data) | Fast | Fast | Medium |
| Best for | Publication | Statistics | Dashboards |

---

## Quick Start Template

```python
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# 1. Load data
df = px.data.tips()  # or your DataFrame

# 2. Quick plot with Plotly Express
fig = px.scatter(df, x='total_bill', y='tip',
                 color='day', size='size',
                 title='Quick Interactive Plot')
fig.show()

# 3. Custom plot with Graph Objects
fig = go.Figure()
fig.add_trace(go.Scatter(
    x=df['total_bill'],
    y=df['tip'],
    mode='markers',
    marker=dict(size=10, color='blue')
))

fig.update_layout(
    title='Custom Interactive Plot',
    xaxis_title='Total Bill ($)',
    yaxis_title='Tip ($)',
    hovermode='closest',
    width=900,
    height=600
)

fig.show()

# 4. Save
fig.write_html('my_plot.html')
```

This completes the Plotly introduction! Use it for interactive, web-based visualizations and dashboards.
