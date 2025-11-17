# Plotly Interactivity, Dashboards, and Best Practices

## What You'll Learn

Master advanced interactivity features, learn to create dashboards, export plots effectively, and follow best practices for production-ready Plotly visualizations.

## Interactive Features

### Custom Hover Templates

```python
import plotly.express as px

df = px.data.tips()

fig = px.scatter(
    df,
    x='total_bill',
    y='tip',
    color='day',
    size='size'
)

# Custom hover template
fig.update_traces(
    hovertemplate='<b>Total Bill</b>: $%{x:.2f}<br>' +
                  '<b>Tip</b>: $%{y:.2f}<br>' +
                  '<b>Table Size</b>: %{marker.size}<br>' +
                  '<extra></extra>'  # Removes trace name
)

fig.show()
```

### Range Slider and Selectors

```python
df = px.data.stocks()

fig = px.line(df, x='date', y='GOOG', title='Stock Price with Controls')

# Add range slider and selector buttons
fig.update_xaxes(
    rangeslider_visible=True,
    rangeselector=dict(
        buttons=list([
            dict(count=1, label='1m', step='month', stepmode='backward'),
            dict(count=6, label='6m', step='month', stepmode='backward'),
            dict(count=1, label='YTD', step='year', stepmode='todate'),
            dict(count=1, label='1y', step='year', stepmode='backward'),
            dict(step='all', label='All')
        ])
    )
)

fig.show()
```

### Dropdown Menus

```python
import plotly.graph_objects as go

df = px.data.iris()

fig = go.Figure()

# Add traces for each species
for species in df['species'].unique():
    df_species = df[df['species'] == species]
    fig.add_trace(go.Scatter(
        x=df_species['sepal_width'],
        y=df_species['sepal_length'],
        mode='markers',
        name=species,
        visible=True
    ))

# Add dropdown menu
fig.update_layout(
    updatemenus=[
        dict(
            buttons=list([
                dict(
                    args=[{'visible': [True, True, True]}],
                    label='All Species',
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
            y=1.15
        )
    ],
    title='Interactive Species Filter'
)

fig.show()
```

### Animations

```python
df = px.data.gapminder()

fig = px.scatter(
    df,
    x='gdpPercap',
    y='lifeExp',
    animation_frame='year',      # Animate by year
    animation_group='country',   # Group by country
    size='pop',
    color='continent',
    hover_name='country',
    log_x=True,
    size_max=60,
    range_x=[100, 100000],
    range_y=[25, 90],
    title='Gapminder: GDP vs Life Expectancy Over Time'
)

fig.update_layout(width=1000, height=600)
fig.show()
```

## Subplots

### Basic Subplots

```python
from plotly.subplots import make_subplots
import plotly.graph_objects as go

# Create 2x2 subplots
fig = make_subplots(
    rows=2,
    cols=2,
    subplot_titles=('Scatter', 'Line', 'Bar', 'Histogram')
)

df = px.data.tips()

# Scatter (row 1, col 1)
fig.add_trace(
    go.Scatter(x=df['total_bill'], y=df['tip'], mode='markers'),
    row=1, col=1
)

# Line (row 1, col 2)
fig.add_trace(
    go.Scatter(x=[1, 2, 3, 4], y=[10, 11, 12, 13], mode='lines'),
    row=1, col=2
)

# Bar (row 2, col 1)
fig.add_trace(
    go.Bar(x=['A', 'B', 'C'], y=[10, 15, 13]),
    row=2, col=1
)

# Histogram (row 2, col 2)
fig.add_trace(
    go.Histogram(x=df['total_bill']),
    row=2, col=2
)

fig.update_layout(height=800, showlegend=False, title='Multiple Subplots')
fig.show()
```

### Shared Axes

```python
# Shared x-axis for time series comparison
fig = make_subplots(
    rows=2,
    cols=1,
    shared_xaxes=True,
    vertical_spacing=0.1
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

fig.update_layout(height=600, title='Shared X-Axis')
fig.show()
```

## Dashboard Integration

### Export to HTML

```python
# Create and save plot
fig = px.scatter(df, x='total_bill', y='tip', color='day')

# Save as standalone HTML
fig.write_html('interactive_plot.html')

# With configuration options
config = {
    'toImageButtonOptions': {
        'format': 'png',
        'filename': 'custom_plot',
        'height': 1000,
        'width': 1500,
        'scale': 2
    },
    'displayModeBar': True,
    'displaylogo': False
}

fig.write_html('plot_with_config.html', config=config)
```

### Basic Dash Application

```python
# Install: pip install dash

import dash
from dash import dcc, html
from dash.dependencies import Input, Output

# Create app
app = dash.Dash(__name__)

# Layout
app.layout = html.Div([
    html.H1('Interactive Dashboard'),

    dcc.Dropdown(
        id='chart-type',
        options=[
            {'label': 'Scatter', 'value': 'scatter'},
            {'label': 'Box', 'value': 'box'},
            {'label': 'Violin', 'value': 'violin'}
        ],
        value='scatter'
    ),

    dcc.Graph(id='main-graph')
])

# Callback
@app.callback(
    Output('main-graph', 'figure'),
    Input('chart-type', 'value')
)
def update_graph(chart_type):
    df = px.data.tips()

    if chart_type == 'scatter':
        fig = px.scatter(df, x='total_bill', y='tip', color='day')
    elif chart_type == 'box':
        fig = px.box(df, x='day', y='total_bill', color='sex')
    else:
        fig = px.violin(df, x='day', y='total_bill', color='sex')

    return fig

# Run (in script, not notebook)
# if __name__ == '__main__':
#     app.run_server(debug=True)
```

### Jupyter Integration

```python
# Set default renderer for Jupyter
import plotly.io as pio

# Jupyter notebook
pio.renderers.default = 'notebook'

# Jupyter Lab
pio.renderers.default = 'jupyterlab'

# Google Colab
pio.renderers.default = 'colab'

# Browser
pio.renderers.default = 'browser'
```

## Best Practices

### Layout Best Practices

```python
# Professional layout template
fig.update_layout(
    title={
        'text': 'Professional Plot Title',
        'x': 0.5,
        'xanchor': 'center',
        'font': {'size': 20, 'family': 'Arial'}
    },
    xaxis_title='X-axis Label',
    yaxis_title='Y-axis Label',
    font=dict(size=12, family='Arial'),
    hovermode='closest',
    width=900,
    height=600,
    template='plotly_white',  # Clean theme
    showlegend=True,
    legend=dict(
        orientation='v',
        yanchor='top',
        y=1,
        xanchor='left',
        x=1.01
    )
)

# Remove gridlines for cleaner look
fig.update_xaxes(showgrid=False)
fig.update_yaxes(showgrid=False)

# White background
fig.update_layout(
    plot_bgcolor='white',
    paper_bgcolor='white'
)
```

### Performance Tips

```python
# For large datasets (> 1M points):

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

# 4. Use density heatmap instead of scatter
fig = px.density_heatmap(df, x='x', y='y')
```

### Color Schemes

```python
# Built-in color sequences
import plotly.express as px

# Qualitative (categorical)
px.colors.qualitative.Plotly
px.colors.qualitative.Set1
px.colors.qualitative.Pastel

# Sequential (continuous)
px.colors.sequential.Viridis
px.colors.sequential.Plasma
px.colors.sequential.Blues

# Diverging (meaningful center)
px.colors.diverging.RdBu
px.colors.diverging.Spectral

# Use in plots
fig = px.scatter(df, x='x', y='y', color='category',
                 color_discrete_sequence=px.colors.qualitative.Set1)
```

### Accessibility

```python
# High contrast colors for colorblind users
custom_colors = ['#E69F00', '#56B4E9', '#009E73', '#F0E442']

# Add patterns for additional accessibility
fig = go.Figure()
fig.add_trace(go.Bar(
    x=['A', 'B', 'C'],
    y=[1, 2, 3],
    marker_pattern_shape='/',  # Diagonal pattern
    name='Pattern 1'
))

# Increase line widths
fig.update_traces(line=dict(width=3))

# Large fonts
fig.update_layout(
    font=dict(size=14),
    title_font=dict(size=18)
)
```

## Common Patterns

### Time Series Analysis Pattern

```python
def plot_time_series(df, date_col, value_col):
    """Create interactive time series with range selector"""
    fig = px.line(df, x=date_col, y=value_col)

    fig.update_xaxes(
        rangeslider_visible=True,
        rangeselector=dict(
            buttons=list([
                dict(count=7, label='1w', step='day', stepmode='backward'),
                dict(count=1, label='1m', step='month', stepmode='backward'),
                dict(count=6, label='6m', step='month', stepmode='backward'),
                dict(count=1, label='1y', step='year', stepmode='backward'),
                dict(step='all', label='All')
            ])
        )
    )

    return fig
```

### Exploratory Dashboard Pattern

```python
def explore_data(df, numeric_cols, cat_col):
    """Create EDA dashboard"""
    from plotly.subplots import make_subplots

    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=('Distribution', 'Correlation',
                       'Box Plot', 'Scatter')
    )

    # Add plots...
    # (Implementation details)

    fig.update_layout(height=800, showlegend=False)
    return fig
```

## Summary

Master Plotly for production use:

**Interactivity**:
- Custom hover templates
- Range sliders and selectors
- Dropdown menus
- Animations

**Dashboards**:
- Export to HTML
- Dash applications
- Jupyter integration

**Best Practices**:
- Professional layouts
- Performance optimization
- Accessibility
- Color schemes

**When to Use Plotly**:
- Interactive exploration needed
- Web integration required
- Large datasets with zoom/filter
- Dashboard applications

**When to Use Alternatives**:
- Static publications (Matplotlib)
- Quick terminal plots (Matplotlib)
- Statistical analysis (Seaborn)
- Print materials (Matplotlib)

Plotly excels at turning data into interactive experiences that enable exploration and discovery.

---

**Navigation:**
- **Previous**: [Plotly Statistical and 3D](./plotly-statistical-3d.md)
- **Start**: [Plotly Introduction](./plotly-introduction.md)
- **Related**: [Matplotlib Basics](./matplotlib-basics.md) | [Seaborn Guide](./seaborn-guide.md)
