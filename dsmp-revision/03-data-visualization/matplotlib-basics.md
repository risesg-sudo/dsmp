# Matplotlib Basics - Revision Notes

## Table of Contents
1. [Introduction](#introduction)
2. [Basic Plot Types](#basic-plot-types)
3. [Customization Basics](#customization-basics)
4. [Figure and Axes](#figure-and-axes)
5. [Best Practices](#best-practices)

---

## Introduction

**Matplotlib** is the foundational plotting library in Python. It provides fine-grained control over every aspect of a plot.

### Two Interfaces
1. **Pyplot (MATLAB-style)**: Simple, state-based interface
2. **Object-Oriented**: More control, better for complex plots

```python
import matplotlib.pyplot as plt
import numpy as np

# Pyplot style
plt.plot([1, 2, 3], [1, 4, 9])
plt.show()

# OO style
fig, ax = plt.subplots()
ax.plot([1, 2, 3], [1, 4, 9])
plt.show()
```

**Recommendation**: Use OO interface for production code.

---

## Basic Plot Types

### 1. Line Plot

**ASCII Representation:**
```
  y
  |     ╱
  |   ╱
  | ╱
  |_________ x
```

**When to Use:**
- Time series data
- Continuous trends
- Function visualization
- Multiple series comparison

**Code Example:**
```python
import matplotlib.pyplot as plt
import numpy as np

# Create data
x = np.linspace(0, 10, 100)
y1 = np.sin(x)
y2 = np.cos(x)

# Create plot
fig, ax = plt.subplots(figsize=(10, 6))
ax.plot(x, y1, label='sin(x)', linewidth=2, color='blue')
ax.plot(x, y2, label='cos(x)', linewidth=2, color='red', linestyle='--')

# Customize
ax.set_xlabel('X axis', fontsize=12)
ax.set_ylabel('Y axis', fontsize=12)
ax.set_title('Trigonometric Functions', fontsize=14, fontweight='bold')
ax.legend(loc='upper right')
ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

**Real-World Use Cases:**
- Stock price trends over time
- Temperature variations throughout the day
- Website traffic over months
- Sales performance tracking

**Customization Options:**
```python
ax.plot(x, y,
        color='red',           # or '#FF0000', (1, 0, 0)
        linewidth=2,           # or lw
        linestyle='--',        # or ls: '-', '--', '-.', ':'
        marker='o',            # 'o', 's', '^', 'v', '*', '+'
        markersize=5,          # or ms
        markerfacecolor='red', # or mfc
        markeredgecolor='black', # or mec
        alpha=0.7,             # transparency (0-1)
        label='Data series')   # for legend
```

---

### 2. Scatter Plot

**ASCII Representation:**
```
  y
  |  •  •
  |    •  •
  | •   •
  |_________ x
```

**When to Use:**
- Relationship between two variables
- Identifying correlations
- Outlier detection
- Clustering patterns

**Code Example:**
```python
# Generate sample data
np.random.seed(42)
x = np.random.randn(100)
y = 2 * x + np.random.randn(100) * 0.5
colors = np.random.rand(100)
sizes = 1000 * np.random.rand(100)

# Create scatter plot
fig, ax = plt.subplots(figsize=(10, 6))
scatter = ax.scatter(x, y,
                     c=colors,           # color values
                     s=sizes,            # sizes
                     alpha=0.6,
                     cmap='viridis',     # colormap
                     edgecolors='black',
                     linewidth=0.5)

# Add colorbar
cbar = plt.colorbar(scatter, ax=ax)
cbar.set_label('Color Value', fontsize=10)

ax.set_xlabel('X Variable', fontsize=12)
ax.set_ylabel('Y Variable', fontsize=12)
ax.set_title('Scatter Plot with Color and Size Mapping', fontsize=14)
ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

**Real-World Use Cases:**
- Height vs Weight correlation
- Advertising spend vs Sales
- Test scores comparison
- Customer age vs Purchase amount

**Advanced Scatter Features:**
```python
# With categorical colors
categories = np.random.choice(['A', 'B', 'C'], 100)
for category in ['A', 'B', 'C']:
    mask = categories == category
    ax.scatter(x[mask], y[mask], label=category, alpha=0.6)

ax.legend()
```

---

### 3. Bar Chart

**ASCII Representation:**
```
  y
  |  █     █
  |  █  █  █
  |  █  █  █
  |___█__█__█_ x
    A  B  C
```

**When to Use:**
- Comparing categories
- Discrete data comparison
- Survey results
- Frequency counts

**Code Example:**
```python
# Data
categories = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
values = [23, 45, 56, 78, 32]
colors_list = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']

# Vertical bar chart
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

# Vertical bars
bars1 = ax1.bar(categories, values,
                color=colors_list,
                edgecolor='black',
                linewidth=1.5,
                alpha=0.8)

# Add value labels on top of bars
for bar in bars1:
    height = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2., height,
             f'{int(height)}',
             ha='center', va='bottom', fontsize=10, fontweight='bold')

ax1.set_xlabel('Products', fontsize=12)
ax1.set_ylabel('Sales (units)', fontsize=12)
ax1.set_title('Product Sales - Vertical', fontsize=14, fontweight='bold')
ax1.grid(axis='y', alpha=0.3)

# Horizontal bars
bars2 = ax2.barh(categories, values,
                 color=colors_list,
                 edgecolor='black',
                 linewidth=1.5,
                 alpha=0.8)

ax2.set_xlabel('Sales (units)', fontsize=12)
ax2.set_ylabel('Products', fontsize=12)
ax2.set_title('Product Sales - Horizontal', fontsize=14, fontweight='bold')
ax2.grid(axis='x', alpha=0.3)

plt.tight_layout()
plt.show()
```

**Real-World Use Cases:**
- Sales by region
- Survey responses by category
- Population by country
- Budget allocation by department

**Grouped and Stacked Bars:**
```python
# Grouped bar chart
x = np.arange(len(categories))
width = 0.35

fig, ax = plt.subplots(figsize=(12, 6))
bars1 = ax.bar(x - width/2, values, width, label='2023', color='skyblue')
bars2 = ax.bar(x + width/2, [v * 1.2 for v in values], width,
               label='2024', color='lightcoral')

ax.set_xlabel('Products')
ax.set_ylabel('Sales')
ax.set_title('Sales Comparison: 2023 vs 2024')
ax.set_xticks(x)
ax.set_xticklabels(categories)
ax.legend()
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()
```

---

### 4. Histogram

**ASCII Representation:**
```
  f
  |  █
  |  █  █  █
  |  █  █  █  █
  |__█__█__█__█_ x
    bins
```

**When to Use:**
- Distribution of continuous data
- Frequency analysis
- Understanding data spread
- Identifying skewness

**Code Example:**
```python
# Generate sample data
np.random.seed(42)
data = np.random.normal(100, 15, 1000)  # mean=100, std=15

# Create histogram
fig, ax = plt.subplots(figsize=(10, 6))
n, bins, patches = ax.hist(data,
                           bins=30,
                           color='skyblue',
                           edgecolor='black',
                           alpha=0.7,
                           density=False)

# Color bars based on height
cm = plt.cm.viridis
norm = plt.Normalize(vmin=n.min(), vmax=n.max())
for i, patch in enumerate(patches):
    patch.set_facecolor(cm(norm(n[i])))

# Add mean line
mean_val = np.mean(data)
ax.axvline(mean_val, color='red', linestyle='--',
           linewidth=2, label=f'Mean: {mean_val:.2f}')

# Add median line
median_val = np.median(data)
ax.axvline(median_val, color='green', linestyle='--',
           linewidth=2, label=f'Median: {median_val:.2f}')

ax.set_xlabel('Value', fontsize=12)
ax.set_ylabel('Frequency', fontsize=12)
ax.set_title('Distribution of Data', fontsize=14, fontweight='bold')
ax.legend()
ax.grid(axis='y', alpha=0.3)

plt.tight_layout()
plt.show()
```

**Real-World Use Cases:**
- Age distribution of customers
- Exam score distribution
- Income distribution in a population
- Response time analysis

**Histogram Variations:**
```python
# Multiple histograms
fig, ax = plt.subplots(figsize=(10, 6))
data1 = np.random.normal(100, 15, 1000)
data2 = np.random.normal(110, 20, 1000)

ax.hist(data1, bins=30, alpha=0.5, label='Group A', color='blue')
ax.hist(data2, bins=30, alpha=0.5, label='Group B', color='red')
ax.legend()
ax.set_xlabel('Value')
ax.set_ylabel('Frequency')
ax.set_title('Comparing Distributions')
plt.show()
```

---

### 5. Pie Chart

**ASCII Representation:**
```
      ╱‾‾╲
    ╱  B  ╲
   |  ╱‾‾‾  |
   | | A  | |
   | |    | |
    ╲|___╱╱
      ╲C╱
```

**When to Use:**
- Parts of a whole (percentages)
- Simple proportion visualization
- Limited categories (max 5-7)

**Code Example:**
```python
# Data
sizes = [30, 25, 20, 15, 10]
labels = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
explode = (0.1, 0, 0, 0, 0)  # explode first slice

fig, ax = plt.subplots(figsize=(10, 8))
wedges, texts, autotexts = ax.pie(sizes,
                                    explode=explode,
                                    labels=labels,
                                    colors=colors,
                                    autopct='%1.1f%%',
                                    shadow=True,
                                    startangle=90,
                                    textprops={'fontsize': 12})

# Enhance percentages
for autotext in autotexts:
    autotext.set_color('white')
    autotext.set_fontweight('bold')
    autotext.set_fontsize(10)

ax.set_title('Market Share Distribution', fontsize=14, fontweight='bold')
ax.axis('equal')  # Equal aspect ratio ensures circular pie

plt.tight_layout()
plt.show()
```

**Real-World Use Cases:**
- Market share by company
- Budget allocation
- Demographics breakdown
- Survey response proportions

**Important Note:** Avoid pie charts when:
- You have many categories (use bar chart)
- Precise comparisons needed (use bar chart)
- Values are similar (hard to distinguish)

---

## Customization Basics

### Colors

```python
# Different color specifications
ax.plot(x, y, color='red')              # Named colors
ax.plot(x, y, color='r')                # Single letter codes
ax.plot(x, y, color='#FF0000')          # Hex codes
ax.plot(x, y, color=(1.0, 0.0, 0.0))   # RGB tuples
ax.plot(x, y, color=(1, 0, 0, 0.5))    # RGBA tuples (with alpha)

# Colormaps
scatter = ax.scatter(x, y, c=values, cmap='viridis')
# Popular colormaps: viridis, plasma, inferno, magma,
#                   coolwarm, RdYlBu, rainbow, jet
```

### Markers and Line Styles

```python
# Markers
markers = ['o', 's', '^', 'v', '<', '>', 'D', 'p', '*', 'h', '+', 'x']
# o: circle, s: square, ^: triangle up, D: diamond, *: star

# Line styles
linestyles = ['-', '--', '-.', ':']
# -: solid, --: dashed, -.: dash-dot, :: dotted

# Combined
ax.plot(x, y, marker='o', linestyle='--', markersize=8)
```

### Labels and Titles

```python
# Basic labels
ax.set_xlabel('X-axis Label', fontsize=12, fontweight='bold')
ax.set_ylabel('Y-axis Label', fontsize=12, fontweight='bold')
ax.set_title('Plot Title', fontsize=14, fontweight='bold', loc='center')

# With math expressions (LaTeX)
ax.set_xlabel(r'$\alpha$ (alpha)', fontsize=12)
ax.set_title(r'$y = x^2 + 2x + 1$', fontsize=14)

# Positioning
ax.set_title('Title', loc='left')   # 'left', 'center', 'right'
ax.set_title('Title', pad=20)       # padding from plot
```

### Legends

```python
# Basic legend
ax.plot(x, y1, label='Series 1')
ax.plot(x, y2, label='Series 2')
ax.legend()

# Customized legend
ax.legend(loc='upper right',           # location
          fontsize=10,
          frameon=True,                # border
          shadow=True,
          fancybox=True,               # rounded corners
          ncol=2,                      # number of columns
          title='Legend Title')

# Legend locations: 'upper right', 'upper left', 'lower left',
#                   'lower right', 'right', 'center left',
#                   'center right', 'lower center', 'upper center',
#                   'center', 'best'

# Manual legend placement
ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
```

### Grid

```python
# Basic grid
ax.grid(True)

# Customized grid
ax.grid(True,
        alpha=0.3,           # transparency
        linestyle='--',      # line style
        linewidth=0.5,       # line width
        color='gray')        # color

# Grid for specific axis
ax.grid(axis='y')  # 'x', 'y', or 'both'

# Minor grid
ax.minorticks_on()
ax.grid(which='major', linestyle='-', alpha=0.5)
ax.grid(which='minor', linestyle=':', alpha=0.3)
```

### Axis Limits and Scales

```python
# Set limits
ax.set_xlim(0, 10)
ax.set_ylim(-5, 5)

# Auto-scale with margin
ax.margins(0.1)  # 10% margin

# Log scale
ax.set_xscale('log')
ax.set_yscale('log')
# Options: 'linear', 'log', 'symlog', 'logit'

# Invert axis
ax.invert_xaxis()
ax.invert_yaxis()
```

### Ticks

```python
# Set tick locations
ax.set_xticks([0, 2, 4, 6, 8, 10])
ax.set_yticks(np.arange(-5, 6, 1))

# Set tick labels
ax.set_xticklabels(['A', 'B', 'C', 'D', 'E', 'F'])

# Rotate labels
plt.xticks(rotation=45, ha='right')

# Tick parameters
ax.tick_params(axis='both',          # 'x', 'y', or 'both'
               which='major',        # 'major', 'minor', or 'both'
               direction='out',      # 'in', 'out', or 'inout'
               length=6,             # tick length
               width=2,              # tick width
               labelsize=10,         # label font size
               colors='black')       # tick color
```

---

## Figure and Axes

### Creating Figures

```python
# Simple figure
fig, ax = plt.subplots(figsize=(10, 6))

# Specify DPI for quality
fig, ax = plt.subplots(figsize=(10, 6), dpi=100)

# Tight layout (prevents label cutoff)
plt.tight_layout()

# Adjust spacing manually
plt.subplots_adjust(left=0.1, right=0.9, top=0.9, bottom=0.1,
                   hspace=0.3, wspace=0.3)
```

### Figure Size and DPI

```python
# Default figure
fig, ax = plt.subplots()  # Default: (6.4, 4.8) inches, 100 DPI

# Custom size
fig, ax = plt.subplots(figsize=(12, 8))  # Width x Height in inches

# High resolution for publication
fig, ax = plt.subplots(figsize=(10, 6), dpi=300)

# Change size of existing figure
fig.set_size_inches(12, 8)
```

### Spines (Plot Borders)

```python
# Hide spines
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)

# Change spine position
ax.spines['left'].set_position(('data', 0))
ax.spines['bottom'].set_position(('data', 0))

# Change spine color and width
ax.spines['left'].set_color('red')
ax.spines['bottom'].set_linewidth(2)
```

### Annotations and Text

```python
# Add text
ax.text(5, 5, 'Important Point',
        fontsize=12,
        ha='center',      # horizontal alignment
        va='center',      # vertical alignment
        color='red',
        fontweight='bold',
        bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

# Annotate with arrow
ax.annotate('Peak',
            xy=(5, 10),                    # point to annotate
            xytext=(7, 12),                # text location
            arrowprops=dict(arrowstyle='->',
                          connectionstyle='arc3,rad=0.3',
                          color='red',
                          lw=2),
            fontsize=12,
            bbox=dict(boxstyle='round', facecolor='yellow', alpha=0.7))

# Arrow styles: '->', '-[', ']-', '-|>', '<->', 'fancy', 'simple', 'wedge'
```

### Adding Lines and Shapes

```python
# Horizontal and vertical lines
ax.axhline(y=5, color='r', linestyle='--', label='Threshold')
ax.axvline(x=3, color='g', linestyle='--')

# Horizontal and vertical spans
ax.axhspan(2, 4, alpha=0.3, color='yellow')  # horizontal span
ax.axvspan(1, 3, alpha=0.3, color='blue')    # vertical span

# Add rectangle
from matplotlib.patches import Rectangle
rect = Rectangle((2, 2), 3, 2,
                 linewidth=2,
                 edgecolor='red',
                 facecolor='none')
ax.add_patch(rect)

# Add circle
from matplotlib.patches import Circle
circle = Circle((5, 5), 1.5,
                edgecolor='blue',
                facecolor='lightblue',
                alpha=0.5)
ax.add_patch(circle)
```

---

## Best Practices

### 1. Choosing the Right Plot

| Data Type | Recommended Plot | Alternative |
|-----------|------------------|-------------|
| Time series | Line plot | Area plot |
| Correlation | Scatter plot | Hexbin plot |
| Distribution | Histogram | KDE plot, Box plot |
| Categories | Bar chart | Dot plot |
| Proportions | Bar chart | Pie chart (limited) |
| Comparison | Bar chart | Line plot |

### 2. Design Principles

```python
# GOOD: Clean and readable
fig, ax = plt.subplots(figsize=(10, 6))
ax.plot(x, y, linewidth=2, color='#2E86AB')
ax.set_xlabel('Time (hours)', fontsize=12)
ax.set_ylabel('Temperature (°C)', fontsize=12)
ax.set_title('Temperature Over Time', fontsize=14, fontweight='bold')
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.grid(True, alpha=0.3)
plt.tight_layout()

# BAD: Cluttered and hard to read
# - Too many colors
# - No labels
# - Overlapping text
# - Default sizing
```

### 3. Color Best Practices

- Use colorblind-friendly palettes
- Limit colors to 5-7 in a single plot
- Use sequential colormaps for ordered data
- Use diverging colormaps for data with meaningful zero
- Use qualitative colormaps for categories

```python
# Colorblind-friendly colors
colors = ['#0173B2', '#DE8F05', '#029E73', '#CC78BC',
          '#CA9161', '#949494', '#ECE133']

# For continuous data
# Sequential: 'viridis', 'plasma', 'Blues', 'YlOrRd'
# Diverging: 'RdBu', 'coolwarm', 'seismic'
```

### 4. Consistency

- Keep consistent colors for same categories across plots
- Use same font sizes and styles
- Maintain consistent axis ranges for comparisons
- Use same figure sizes for presentations

### 5. Accessibility

```python
# Add patterns for colorblind accessibility
bars = ax.bar(categories, values, color=colors)
patterns = ['/', '\\', '|', '-', '+', 'x', 'o', 'O', '.', '*']
for bar, pattern in zip(bars, patterns):
    bar.set_hatch(pattern)

# High contrast colors
# Add text labels to supplement colors
# Increase line widths (minimum 2)
# Use different line styles along with colors
```

### 6. Saving Figures

```python
# Save as PNG (web, presentations)
plt.savefig('plot.png', dpi=300, bbox_inches='tight')

# Save as PDF (publications, vector graphics)
plt.savefig('plot.pdf', bbox_inches='tight')

# Save as SVG (web, scalable)
plt.savefig('plot.svg', bbox_inches='tight')

# With transparent background
plt.savefig('plot.png', transparent=True, bbox_inches='tight')

# Multiple formats at once
for fmt in ['png', 'pdf', 'svg']:
    plt.savefig(f'plot.{fmt}', dpi=300, bbox_inches='tight')
```

---

## Common Patterns

### 1. Quick Plot Template

```python
import matplotlib.pyplot as plt
import numpy as np

# Data
x = np.linspace(0, 10, 100)
y = np.sin(x)

# Plot
fig, ax = plt.subplots(figsize=(10, 6))
ax.plot(x, y, linewidth=2, color='#2E86AB', label='sin(x)')

# Customize
ax.set_xlabel('X-axis', fontsize=12)
ax.set_ylabel('Y-axis', fontsize=12)
ax.set_title('Title', fontsize=14, fontweight='bold')
ax.legend(loc='best')
ax.grid(True, alpha=0.3)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)

plt.tight_layout()
plt.show()
```

### 2. Style Context

```python
# Use predefined styles
plt.style.use('seaborn-v0_8-darkgrid')
# Available: 'default', 'classic', 'seaborn', 'ggplot', 'fivethirtyeight'

# Temporary style
with plt.style.context('seaborn-v0_8-whitegrid'):
    fig, ax = plt.subplots()
    ax.plot(x, y)
    plt.show()

# View available styles
print(plt.style.available)
```

### 3. Error Handling

```python
# Check if data is valid
if len(x) != len(y):
    raise ValueError("x and y must have the same length")

# Handle empty data
if len(x) == 0:
    print("No data to plot")
else:
    ax.plot(x, y)
```

---

## Quick Reference

### Most Used Functions

```python
# Figure and axes
fig, ax = plt.subplots(nrows=1, ncols=1, figsize=(10, 6))

# Plotting
ax.plot(x, y)           # Line plot
ax.scatter(x, y)        # Scatter plot
ax.bar(x, y)            # Bar chart
ax.hist(data)           # Histogram
ax.pie(sizes)           # Pie chart

# Customization
ax.set_xlabel(label)
ax.set_ylabel(label)
ax.set_title(title)
ax.legend()
ax.grid(True)

# Display
plt.tight_layout()
plt.show()
plt.savefig('filename.png')
```

### Key Parameters

- `figsize`: Figure size in inches (width, height)
- `linewidth` or `lw`: Line width
- `linestyle` or `ls`: Line style
- `color` or `c`: Color
- `marker`: Marker style
- `alpha`: Transparency (0-1)
- `label`: Label for legend

---

## Summary

Matplotlib is powerful but requires explicit control. Remember:
1. Use OO interface (`fig, ax = plt.subplots()`)
2. Always label axes and add titles
3. Choose appropriate plot types
4. Keep it simple and clean
5. Use `tight_layout()` before showing
6. Save in appropriate format for use case

**Next**: See matplotlib-advanced.md for subplots and advanced features.
