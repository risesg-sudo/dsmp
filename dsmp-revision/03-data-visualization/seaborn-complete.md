# Seaborn Complete Guide - Revision Notes

## Table of Contents
1. [Introduction](#introduction)
2. [Distribution Plots](#distribution-plots)
3. [Relationship Plots](#relationship-plots)
4. [Categorical Plots](#categorical-plots)
5. [Matrix Plots](#matrix-plots)
6. [Regression Plots](#regression-plots)
7. [Multi-Plot Grids](#multi-plot-grids)
8. [Styling and Themes](#styling-and-themes)

---

## Introduction

**Seaborn** is a high-level statistical visualization library built on top of Matplotlib. It provides:
- Beautiful default styles
- Statistical plot types
- Easy integration with pandas DataFrames
- Automatic color palettes

### Basic Setup

```python
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

# Set style
sns.set_theme(style='darkgrid')

# Create sample data
tips = sns.load_dataset('tips')
iris = sns.load_dataset('iris')
titanic = sns.load_dataset('titanic')
```

### Seaborn vs Matplotlib

**Use Seaborn when:**
- Working with DataFrames
- Creating statistical plots
- Need beautiful defaults
- Want quick exploratory analysis

**Use Matplotlib when:**
- Need fine-grained control
- Creating custom visualizations
- Working with non-tabular data

---

## Distribution Plots

### 1. Histogram (histplot)

**ASCII Representation:**
```
  count
    |   █
    |   █  █
    |   █  █  █
    |___█__█__█___ value
```

**When to Use:**
- Single variable distribution
- Understanding data spread
- Identifying modes and skewness

```python
# Basic histogram
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# Simple histogram
sns.histplot(data=tips, x='total_bill', ax=axes[0, 0])
axes[0, 0].set_title('Basic Histogram', fontsize=12, fontweight='bold')

# With KDE overlay
sns.histplot(data=tips, x='total_bill', kde=True, ax=axes[0, 1])
axes[0, 1].set_title('Histogram with KDE', fontsize=12, fontweight='bold')

# Multiple distributions
sns.histplot(data=tips, x='total_bill', hue='sex',
             multiple='stack', ax=axes[1, 0])
axes[1, 0].set_title('Stacked Histogram', fontsize=12, fontweight='bold')

# With bins and colors
sns.histplot(data=tips, x='total_bill', bins=30,
             color='skyblue', edgecolor='black', ax=axes[1, 1])
axes[1, 1].set_title('Customized Histogram', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.show()
```

**Key Parameters:**
```python
sns.histplot(
    data=df,
    x='column',          # variable to plot
    hue='category',      # grouping variable
    bins=30,             # number of bins
    kde=True,            # overlay KDE
    stat='count',        # 'count', 'frequency', 'density', 'probability'
    multiple='layer',    # 'layer', 'dodge', 'stack', 'fill'
    element='bars',      # 'bars', 'step', 'poly'
    color='blue',        # bar color
    edgecolor='black'    # edge color
)
```

**Real-World Use Cases:**
- Customer age distribution
- Product price ranges
- Transaction amounts
- Test score distributions

### 2. KDE Plot (kdeplot)

**ASCII Representation:**
```
  density
    |    ╱‾╲
    |   ╱   ╲
    |  ╱     ╲___
    |_____________value
```

**When to Use:**
- Smooth distribution visualization
- Comparing multiple distributions
- Probability density estimation

```python
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# Basic KDE
sns.kdeplot(data=tips, x='total_bill', ax=axes[0, 0])
axes[0, 0].set_title('Basic KDE Plot', fontsize=12, fontweight='bold')

# Multiple distributions
sns.kdeplot(data=tips, x='total_bill', hue='time',
            fill=True, alpha=0.5, ax=axes[0, 1])
axes[0, 1].set_title('Multiple KDE Plots', fontsize=12, fontweight='bold')

# Bivariate KDE
sns.kdeplot(data=tips, x='total_bill', y='tip',
            cmap='Blues', fill=True, ax=axes[1, 0])
axes[1, 0].set_title('Bivariate KDE Plot', fontsize=12, fontweight='bold')

# KDE with contours
sns.kdeplot(data=tips, x='total_bill', y='tip',
            levels=10, color='red', ax=axes[1, 1])
axes[1, 1].set_title('KDE Contour Plot', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.show()
```

**Real-World Use Cases:**
- Continuous probability distributions
- Comparing distributions between groups
- Density estimation for anomaly detection
- Bivariate relationship visualization

### 3. Distribution Plot (displot)

**Figure-level function that combines histogram, KDE, and ECDF:**

```python
# Histogram with rug plot
sns.displot(data=tips, x='total_bill', kind='hist',
            kde=True, rug=True, height=6, aspect=1.5)
plt.title('Distribution Plot with Rug', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()

# Multiple panels
sns.displot(data=tips, x='total_bill', col='time',
            row='sex', kde=True, height=4)
plt.tight_layout()
plt.show()

# ECDF (Empirical Cumulative Distribution Function)
sns.displot(data=tips, x='total_bill', kind='ecdf',
            hue='day', height=6, aspect=1.5)
plt.title('ECDF Plot', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()
```

### 4. Rug Plot

**ASCII Representation:**
```
    |  | ||  |  |  ||     | rug marks
    ━━━━━━━━━━━━━━━━━━━━━ axis
```

**When to Use:**
- Show individual data points
- Complement histograms/KDE plots
- Identify clustering

```python
fig, ax = plt.subplots(figsize=(12, 6))

# Histogram + KDE + Rug
sns.histplot(data=tips, x='total_bill', kde=True, ax=ax)
sns.rugplot(data=tips, x='total_bill', color='red',
            height=0.05, ax=ax)

ax.set_title('Histogram + KDE + Rug Plot', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()
```

---

## Relationship Plots

### 1. Scatter Plot (scatterplot)

**ASCII Representation:**
```
  y
  |  •  •
  |    •  •
  | •   •
  |_________ x
```

**When to Use:**
- Correlation between two variables
- Pattern identification
- Outlier detection

```python
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# Basic scatter
sns.scatterplot(data=tips, x='total_bill', y='tip', ax=axes[0, 0])
axes[0, 0].set_title('Basic Scatter Plot', fontsize=12, fontweight='bold')

# With hue (color by category)
sns.scatterplot(data=tips, x='total_bill', y='tip',
                hue='time', ax=axes[0, 1])
axes[0, 1].set_title('Scatter with Hue', fontsize=12, fontweight='bold')

# With size mapping
sns.scatterplot(data=tips, x='total_bill', y='tip',
                size='size', sizes=(20, 200), ax=axes[1, 0])
axes[1, 0].set_title('Scatter with Size Mapping', fontsize=12, fontweight='bold')

# With style and hue
sns.scatterplot(data=tips, x='total_bill', y='tip',
                hue='time', style='sex', s=100, ax=axes[1, 1])
axes[1, 1].set_title('Scatter with Hue and Style', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.show()
```

**Real-World Use Cases:**
- Sales vs Advertising spend
- Height vs Weight
- Temperature vs Ice cream sales
- Study hours vs Exam scores

### 2. Line Plot (lineplot)

**When to Use:**
- Time series data
- Trends over continuous variables
- Confidence intervals

```python
# Create time series data
flights = sns.load_dataset('flights')

fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Basic line plot with confidence interval
sns.lineplot(data=flights, x='year', y='passengers', ax=axes[0])
axes[0].set_title('Line Plot with CI', fontsize=12, fontweight='bold')

# Multiple lines
sns.lineplot(data=flights, x='year', y='passengers',
             hue='month', ax=axes[1])
axes[1].set_title('Multiple Line Plot', fontsize=12, fontweight='bold')
axes[1].legend(bbox_to_anchor=(1.05, 1), loc='upper left')

plt.tight_layout()
plt.show()
```

**Key Parameters:**
```python
sns.lineplot(
    data=df,
    x='x_var',
    y='y_var',
    hue='category',      # color by category
    style='category',    # line style by category
    size='category',     # line width by category
    markers=True,        # add markers
    dashes=False,        # solid lines
    ci=95,              # confidence interval (None to disable)
    estimator='mean'    # 'mean', 'median', etc.
)
```

### 3. Relationship Plot (relplot)

**Figure-level function for scatter and line plots:**

```python
# Scatter plot grid
sns.relplot(data=tips, x='total_bill', y='tip',
            col='time', hue='sex', style='smoker',
            height=5, aspect=1.2)
plt.tight_layout()
plt.show()

# Line plot with facets
sns.relplot(data=flights, x='year', y='passengers',
            hue='month', kind='line',
            height=6, aspect=2)
plt.title('Flight Passengers Over Years', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()
```

---

## Categorical Plots

### 1. Bar Plot (barplot)

**ASCII Representation:**
```
  mean
    |  █     █
    |  █  █  █
    |__█__█__█___ category
      A  B  C
```

**When to Use:**
- Comparing means/medians across categories
- Show point estimates with error bars
- Categorical comparisons

```python
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# Basic bar plot (shows mean by default)
sns.barplot(data=tips, x='day', y='total_bill', ax=axes[0, 0])
axes[0, 0].set_title('Bar Plot - Mean with CI', fontsize=12, fontweight='bold')

# With hue
sns.barplot(data=tips, x='day', y='total_bill', hue='sex', ax=axes[0, 1])
axes[0, 1].set_title('Grouped Bar Plot', fontsize=12, fontweight='bold')

# Horizontal bar plot
sns.barplot(data=tips, y='day', x='total_bill', ax=axes[1, 0])
axes[1, 0].set_title('Horizontal Bar Plot', fontsize=12, fontweight='bold')

# With custom estimator (median)
sns.barplot(data=tips, x='day', y='total_bill',
            estimator=np.median, ax=axes[1, 1])
axes[1, 1].set_title('Bar Plot - Median', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.show()
```

**Real-World Use Cases:**
- Average sales by region
- Mean scores by group
- Revenue by product category
- Survey responses by demographic

### 2. Count Plot (countplot)

**When to Use:**
- Frequency of categorical values
- Distribution of categories

```python
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Basic count plot
sns.countplot(data=tips, x='day', ax=axes[0])
axes[0].set_title('Count Plot', fontsize=12, fontweight='bold')

# With hue
sns.countplot(data=tips, x='day', hue='sex', ax=axes[1])
axes[1].set_title('Grouped Count Plot', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.show()
```

**Real-World Use Cases:**
- Customer distribution by category
- Product sales count by type
- Survey response counts
- Event frequency by type

### 3. Box Plot (boxplot)

**ASCII Representation:**
```
      │
      ├──┬──┤     Whiskers
      │  │  │
    ┌─┼──┼──┼─┐   IQR (box)
    └─┼──●──┼─┘   Median (●)
      │  │  │
      ├──┴──┤
      │
```

**When to Use:**
- Compare distributions
- Identify outliers
- Show quartiles and median

```python
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# Basic box plot
sns.boxplot(data=tips, x='day', y='total_bill', ax=axes[0, 0])
axes[0, 0].set_title('Box Plot', fontsize=12, fontweight='bold')

# With hue
sns.boxplot(data=tips, x='day', y='total_bill', hue='sex', ax=axes[0, 1])
axes[0, 1].set_title('Grouped Box Plot', fontsize=12, fontweight='bold')

# Horizontal
sns.boxplot(data=tips, y='day', x='total_bill', ax=axes[1, 0])
axes[1, 0].set_title('Horizontal Box Plot', fontsize=12, fontweight='bold')

# With notch
sns.boxplot(data=tips, x='day', y='total_bill',
            notch=True, ax=axes[1, 1])
axes[1, 1].set_title('Notched Box Plot', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.show()
```

**Real-World Use Cases:**
- Salary distributions by department
- Test scores across classes
- Response times by server
- Product prices by brand

### 4. Violin Plot (violinplot)

**ASCII Representation:**
```
      ╱╲
     ╱  ╲
    ╱ ●  ╲   Distribution shape
   │  │   │   + median
    ╲    ╱
     ╲  ╱
      ╲╱
```

**When to Use:**
- Show full distribution shape
- Compare distributions
- Better than box plots for bimodal data

```python
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# Basic violin plot
sns.violinplot(data=tips, x='day', y='total_bill', ax=axes[0, 0])
axes[0, 0].set_title('Violin Plot', fontsize=12, fontweight='bold')

# With hue (split)
sns.violinplot(data=tips, x='day', y='total_bill',
               hue='sex', split=True, ax=axes[0, 1])
axes[0, 1].set_title('Split Violin Plot', fontsize=12, fontweight='bold')

# With inner quartiles
sns.violinplot(data=tips, x='day', y='total_bill',
               inner='quartile', ax=axes[1, 0])
axes[1, 0].set_title('Violin with Quartiles', fontsize=12, fontweight='bold')

# Combined with scatter
sns.violinplot(data=tips, x='day', y='total_bill', ax=axes[1, 1])
sns.swarmplot(data=tips, x='day', y='total_bill',
              color='black', alpha=0.3, size=3, ax=axes[1, 1])
axes[1, 1].set_title('Violin + Swarm Plot', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.show()
```

### 5. Strip Plot (stripplot)

**When to Use:**
- Show all individual points
- Small to medium datasets
- Complement box/violin plots

```python
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Basic strip plot
sns.stripplot(data=tips, x='day', y='total_bill', ax=axes[0])
axes[0].set_title('Strip Plot', fontsize=12, fontweight='bold')

# With jitter and hue
sns.stripplot(data=tips, x='day', y='total_bill',
              hue='sex', dodge=True, alpha=0.6, ax=axes[1])
axes[1].set_title('Strip Plot with Jitter', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.show()
```

### 6. Swarm Plot (swarmplot)

**ASCII Representation:**
```
    ● ●
   ● ● ●
  ● ● ● ●   Non-overlapping points
   ● ● ●
    ● ●
   ━━━━━
```

**When to Use:**
- Show all points without overlap
- Small to medium datasets
- Distribution visualization

```python
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Basic swarm plot
sns.swarmplot(data=tips, x='day', y='total_bill', ax=axes[0])
axes[0].set_title('Swarm Plot', fontsize=12, fontweight='bold')

# With hue
sns.swarmplot(data=tips, x='day', y='total_bill',
              hue='sex', dodge=True, ax=axes[1])
axes[1].set_title('Grouped Swarm Plot', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.show()
```

**Important:** Swarm plots can be slow with large datasets. Use strip plots instead.

### 7. Point Plot (pointplot)

**When to Use:**
- Show point estimates
- Compare means with CI
- Emphasize differences between categories

```python
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Basic point plot
sns.pointplot(data=tips, x='day', y='total_bill', ax=axes[0])
axes[0].set_title('Point Plot', fontsize=12, fontweight='bold')

# With hue
sns.pointplot(data=tips, x='day', y='total_bill',
              hue='sex', ax=axes[1])
axes[1].set_title('Grouped Point Plot', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.show()
```

### 8. Categorical Plot (catplot)

**Figure-level function for all categorical plots:**

```python
# Box plot with facets
sns.catplot(data=tips, x='day', y='total_bill',
            col='time', kind='box', height=5, aspect=1.2)
plt.tight_layout()
plt.show()

# Violin plot with facets
sns.catplot(data=tips, x='day', y='total_bill',
            hue='sex', col='time', kind='violin',
            split=True, height=5, aspect=1.2)
plt.tight_layout()
plt.show()
```

**Kind options:** 'strip', 'swarm', 'box', 'violin', 'boxen', 'point', 'bar', 'count'

---

## Matrix Plots

### 1. Heatmap

**ASCII Representation:**
```
       A    B    C    D
   ┌─────────────────┐
 1 │ ██  ░░  ░░  ██ │
 2 │ ░░  ██  ██  ░░ │
 3 │ ░░  ░░  ██  ██ │
 4 │ ██  ██  ░░  ░░ │
   └─────────────────┘
```

**When to Use:**
- Correlation matrices
- Confusion matrices
- 2D data grids
- Pivot table visualization

```python
# Correlation matrix
fig, axes = plt.subplots(1, 2, figsize=(16, 6))

# Create correlation matrix
tips_numeric = tips.select_dtypes(include=[np.number])
corr = tips_numeric.corr()

# Basic heatmap
sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm',
            center=0, square=True, linewidths=1, ax=axes[0])
axes[0].set_title('Correlation Heatmap', fontsize=14, fontweight='bold')

# With custom styling
flights_pivot = flights.pivot(index='month', columns='year', values='passengers')
sns.heatmap(flights_pivot, cmap='YlGnBu', annot=True, fmt='d',
            linewidths=0.5, ax=axes[1])
axes[1].set_title('Passenger Heatmap', fontsize=14, fontweight='bold')

plt.tight_layout()
plt.show()
```

**Key Parameters:**
```python
sns.heatmap(
    data,
    annot=True,          # show values
    fmt='.2f',           # format for annotations
    cmap='coolwarm',     # colormap
    center=0,            # center colormap at value
    square=True,         # square cells
    linewidths=1,        # cell border width
    cbar_kws={},         # colorbar options
    vmin=None,           # min value
    vmax=None            # max value
)
```

**Real-World Use Cases:**
- Feature correlations in ML
- Confusion matrix visualization
- Sales by month and year
- Website traffic patterns

### 2. Cluster Map

**When to Use:**
- Hierarchical clustering
- Finding patterns in data
- Grouped correlations

```python
# Create cluster map
iris_subset = iris.drop('species', axis=1)
sns.clustermap(iris_subset.corr(), annot=True, fmt='.2f',
               cmap='viridis', center=0,
               figsize=(10, 10))
plt.tight_layout()
plt.show()

# With row colors
species_colors = iris['species'].map({'setosa': 'red',
                                       'versicolor': 'blue',
                                       'virginica': 'green'})
sns.clustermap(iris_subset, cmap='viridis',
               row_colors=species_colors,
               figsize=(8, 10))
plt.tight_layout()
plt.show()
```

---

## Regression Plots

### 1. Regression Plot (regplot)

**When to Use:**
- Show linear relationship
- With confidence interval
- Scatter + regression line

```python
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# Basic regression plot
sns.regplot(data=tips, x='total_bill', y='tip', ax=axes[0, 0])
axes[0, 0].set_title('Basic Regression Plot', fontsize=12, fontweight='bold')

# Without confidence interval
sns.regplot(data=tips, x='total_bill', y='tip',
            ci=None, ax=axes[0, 1])
axes[0, 1].set_title('Regression without CI', fontsize=12, fontweight='bold')

# Polynomial regression (order 2)
sns.regplot(data=tips, x='total_bill', y='tip',
            order=2, ax=axes[1, 0])
axes[1, 0].set_title('Polynomial Regression', fontsize=12, fontweight='bold')

# With custom scatter options
sns.regplot(data=tips, x='total_bill', y='tip',
            scatter_kws={'alpha': 0.5, 's': 50},
            line_kws={'color': 'red', 'linewidth': 2},
            ax=axes[1, 1])
axes[1, 1].set_title('Customized Regression', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.show()
```

### 2. LM Plot (lmplot)

**Figure-level regression plot with facets:**

```python
# Basic lm plot
sns.lmplot(data=tips, x='total_bill', y='tip',
           height=6, aspect=1.5)
plt.title('LM Plot', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()

# With hue
sns.lmplot(data=tips, x='total_bill', y='tip', hue='sex',
           height=6, aspect=1.5)
plt.title('LM Plot with Hue', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()

# With col facets
sns.lmplot(data=tips, x='total_bill', y='tip',
           col='time', hue='sex',
           height=5, aspect=1.2)
plt.tight_layout()
plt.show()
```

### 3. Residual Plot (residplot)

**When to Use:**
- Check regression assumptions
- Identify patterns in residuals

```python
fig, ax = plt.subplots(figsize=(10, 6))

sns.residplot(data=tips, x='total_bill', y='tip', ax=ax)
ax.set_title('Residual Plot', fontsize=14, fontweight='bold')
ax.axhline(0, color='red', linestyle='--', linewidth=2)
plt.tight_layout()
plt.show()
```

---

## Multi-Plot Grids

### 1. FacetGrid

**When to Use:**
- Multiple subplots based on data
- Compare patterns across categories
- Exploratory data analysis

```python
# Basic FacetGrid
g = sns.FacetGrid(tips, col='time', row='sex', height=4)
g.map(sns.scatterplot, 'total_bill', 'tip')
g.add_legend()
plt.tight_layout()
plt.show()

# With different plot types
g = sns.FacetGrid(tips, col='day', hue='sex', height=4, aspect=1.2)
g.map(sns.histplot, 'total_bill', kde=True, alpha=0.6)
g.add_legend()
plt.tight_layout()
plt.show()

# Custom function
def custom_plot(x, y, **kwargs):
    ax = plt.gca()
    ax.scatter(x, y, **kwargs)
    ax.plot([x.min(), x.max()], [y.min(), y.max()], 'r--', lw=2)

g = sns.FacetGrid(tips, col='time', height=5, aspect=1.2)
g.map(custom_plot, 'total_bill', 'tip', alpha=0.6)
plt.tight_layout()
plt.show()
```

### 2. PairGrid

**When to Use:**
- Pairwise relationships
- Feature exploration in ML
- Correlation analysis

```python
# Basic PairGrid
g = sns.PairGrid(iris, hue='species', height=2.5)
g.map_upper(sns.scatterplot)
g.map_lower(sns.kdeplot)
g.map_diag(sns.histplot, kde=True)
g.add_legend()
plt.tight_layout()
plt.show()

# Custom PairGrid
g = sns.PairGrid(iris, diag_sharey=False, height=2.5)
g.map_upper(sns.scatterplot, alpha=0.6)
g.map_lower(sns.kdeplot, cmap='Blues_d')
g.map_diag(sns.kdeplot, lw=2)
plt.tight_layout()
plt.show()
```

### 3. Pairplot (Quick Version)

**High-level interface for PairGrid:**

```python
# Basic pairplot
sns.pairplot(iris, hue='species', height=2.5)
plt.tight_layout()
plt.show()

# With different plot types
sns.pairplot(iris, hue='species', diag_kind='kde',
             plot_kws={'alpha': 0.6}, height=2.5)
plt.tight_layout()
plt.show()

# Subset of variables
sns.pairplot(iris, vars=['sepal_length', 'sepal_width'],
             hue='species', height=4)
plt.tight_layout()
plt.show()
```

**Real-World Use Cases:**
- Explore feature relationships
- Identify correlations
- Data quality checks
- Initial data exploration

### 4. JointGrid

**When to Use:**
- Bivariate distribution
- Marginal distributions
- Central plot + marginals

```python
# Basic JointGrid
g = sns.JointGrid(data=tips, x='total_bill', y='tip', height=8)
g.plot(sns.scatterplot, sns.histplot)
plt.tight_layout()
plt.show()

# With KDE
g = sns.JointGrid(data=tips, x='total_bill', y='tip', height=8)
g.plot(sns.scatterplot, sns.kdeplot)
plt.tight_layout()
plt.show()
```

### 5. Jointplot (Quick Version)

```python
# Basic jointplot
sns.jointplot(data=tips, x='total_bill', y='tip',
              height=8)
plt.tight_layout()
plt.show()

# With KDE
sns.jointplot(data=tips, x='total_bill', y='tip',
              kind='kde', height=8)
plt.tight_layout()
plt.show()

# With hex
sns.jointplot(data=tips, x='total_bill', y='tip',
              kind='hex', height=8)
plt.tight_layout()
plt.show()

# With regression
sns.jointplot(data=tips, x='total_bill', y='tip',
              kind='reg', height=8)
plt.tight_layout()
plt.show()
```

**Kind options:** 'scatter', 'kde', 'hist', 'hex', 'reg', 'resid'

---

## Styling and Themes

### 1. Themes

```python
# Available themes
themes = ['darkgrid', 'whitegrid', 'dark', 'white', 'ticks']

fig, axes = plt.subplots(2, 3, figsize=(15, 10))
axes = axes.flatten()

for i, theme in enumerate(themes):
    sns.set_theme(style=theme)
    ax = axes[i]
    sns.scatterplot(data=tips, x='total_bill', y='tip', ax=ax)
    ax.set_title(f'Theme: {theme}', fontsize=12, fontweight='bold')

# Hide extra subplot
axes[5].axis('off')

plt.tight_layout()
plt.show()

# Reset to default
sns.set_theme()
```

### 2. Color Palettes

```python
# Categorical palettes
palettes_cat = ['deep', 'muted', 'bright', 'pastel', 'dark', 'colorblind']

fig, axes = plt.subplots(2, 3, figsize=(15, 10))
axes = axes.flatten()

for i, palette in enumerate(palettes_cat):
    sns.set_palette(palette)
    ax = axes[i]
    sns.countplot(data=tips, x='day', ax=ax)
    ax.set_title(f'Palette: {palette}', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.show()

# Sequential palettes (for continuous data)
# 'Blues', 'Greens', 'Oranges', 'Reds', 'Purples', 'Greys'
# 'viridis', 'plasma', 'inferno', 'magma', 'cividis'

# Diverging palettes (for data with meaningful zero)
# 'RdBu', 'coolwarm', 'Spectral', 'seismic'
```

### 3. Custom Palettes

```python
# Create custom palette
custom_palette = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']
sns.set_palette(custom_palette)

# Use with plot
sns.countplot(data=tips, x='day')
plt.title('Custom Color Palette', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()

# Color palette from colormap
cmap = sns.color_palette('coolwarm', as_cmap=True)
sns.scatterplot(data=tips, x='total_bill', y='tip',
                hue='size', palette='coolwarm', size='size')
plt.title('Colormap Palette', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()
```

### 4. Context Settings

```python
# Set context for different use cases
contexts = ['paper', 'notebook', 'talk', 'poster']

fig, axes = plt.subplots(2, 2, figsize=(14, 10))
axes = axes.flatten()

for i, context in enumerate(contexts):
    sns.set_context(context)
    ax = axes[i]
    sns.lineplot(data=flights[flights['month'] == 'Jan'],
                 x='year', y='passengers', ax=ax)
    ax.set_title(f'Context: {context}', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.show()

# Reset
sns.set_context('notebook')
```

### 5. Despine

```python
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Without despine
sns.scatterplot(data=tips, x='total_bill', y='tip', ax=axes[0])
axes[0].set_title('With Spines', fontsize=12, fontweight='bold')

# With despine
sns.scatterplot(data=tips, x='total_bill', y='tip', ax=axes[1])
sns.despine(ax=axes[1], top=True, right=True, left=False, bottom=False)
axes[1].set_title('Despined', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.show()
```

---

## Best Practices

### 1. Choosing the Right Plot

| Data Type | Question | Recommended Plot |
|-----------|----------|------------------|
| Single numeric | Distribution? | histplot, kdeplot |
| Two numeric | Relationship? | scatterplot, regplot |
| Numeric + Categorical | Compare groups? | boxplot, violinplot, barplot |
| Two categorical | Counts? | countplot, heatmap |
| Multiple variables | Relationships? | pairplot, heatmap |
| Time series | Trend? | lineplot |

### 2. Workflow Template

```python
# 1. Import and setup
import seaborn as sns
import matplotlib.pyplot as plt
sns.set_theme(style='whitegrid')
sns.set_palette('colorblind')

# 2. Load data
df = sns.load_dataset('dataset_name')

# 3. Explore with pairplot
sns.pairplot(df, hue='category')
plt.show()

# 4. Create specific plots
fig, ax = plt.subplots(figsize=(10, 6))
sns.boxplot(data=df, x='category', y='value', ax=ax)
ax.set_title('Title', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()

# 5. Save
plt.savefig('output.png', dpi=300, bbox_inches='tight')
```

### 3. Performance Tips

```python
# For large datasets:
# 1. Use appropriate plot types
#    - hexbin instead of scatter
#    - histplot instead of kdeplot
# 2. Limit data points
df_sample = df.sample(n=1000)
# 3. Disable confidence intervals
sns.lineplot(data=df, x='x', y='y', ci=None)
```

### 4. Customization Pattern

```python
# Use matplotlib customization with seaborn
fig, ax = plt.subplots(figsize=(10, 6))

# Create seaborn plot
sns.boxplot(data=tips, x='day', y='total_bill', ax=ax)

# Customize with matplotlib
ax.set_title('Customized Seaborn Plot', fontsize=14, fontweight='bold')
ax.set_xlabel('Day of Week', fontsize=12)
ax.set_ylabel('Total Bill ($)', fontsize=12)
ax.grid(axis='y', alpha=0.3)
sns.despine()

plt.tight_layout()
plt.show()
```

---

## Common Patterns

### Pattern 1: Distribution Analysis

```python
# Comprehensive distribution analysis
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

sns.histplot(data=tips, x='total_bill', kde=True, ax=axes[0, 0])
axes[0, 0].set_title('Histogram + KDE')

sns.boxplot(data=tips, x='day', y='total_bill', ax=axes[0, 1])
axes[0, 1].set_title('Box Plot by Category')

sns.violinplot(data=tips, x='day', y='total_bill', ax=axes[1, 0])
axes[1, 0].set_title('Violin Plot by Category')

sns.swarmplot(data=tips, x='day', y='total_bill', ax=axes[1, 1])
axes[1, 1].set_title('Swarm Plot')

plt.suptitle('Distribution Analysis', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()
```

### Pattern 2: Correlation Analysis

```python
# Feature correlation analysis
# Calculate correlation
corr = tips.select_dtypes(include=[np.number]).corr()

# Plot
fig, ax = plt.subplots(figsize=(10, 8))
sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm',
            center=0, square=True, linewidths=1, ax=ax)
ax.set_title('Correlation Matrix', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()

# Pairwise relationships
sns.pairplot(tips, hue='sex', diag_kind='kde')
plt.tight_layout()
plt.show()
```

### Pattern 3: Group Comparison

```python
# Compare distributions across groups
fig, axes = plt.subplots(1, 3, figsize=(15, 5))

sns.boxplot(data=tips, x='day', y='total_bill', hue='sex', ax=axes[0])
axes[0].set_title('Box Plot Comparison')

sns.violinplot(data=tips, x='day', y='total_bill',
               hue='sex', split=True, ax=axes[1])
axes[1].set_title('Violin Plot Comparison')

sns.barplot(data=tips, x='day', y='total_bill', hue='sex', ax=axes[2])
axes[2].set_title('Bar Plot Comparison')

plt.suptitle('Group Comparison Analysis', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()
```

---

## Summary

Seaborn provides:
1. **High-level interface** for statistical plots
2. **Beautiful defaults** out of the box
3. **Integration** with pandas DataFrames
4. **Statistical functions** built-in
5. **Theming system** for consistent styling

**Key Function Types:**
- **Axes-level**: More control (scatterplot, histplot, boxplot, etc.)
- **Figure-level**: Automatic faceting (relplot, displot, catplot, etc.)

**Remember:**
- Use figure-level functions for quick exploration
- Use axes-level functions for precise control
- Always label axes and add titles
- Choose appropriate plot for your data type
- Use color meaningfully (not decoratively)

**Next**: See plotly-intro.md for interactive visualizations.
