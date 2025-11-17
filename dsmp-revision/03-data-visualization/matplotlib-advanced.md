# Matplotlib Advanced - Revision Notes

## Table of Contents
1. [Subplots](#subplots)
2. [Advanced Plot Types](#advanced-plot-types)
3. [Customization Techniques](#customization-techniques)
4. [Statistical Visualizations](#statistical-visualizations)
5. [3D Plotting](#3d-plotting)
6. [Performance Optimization](#performance-optimization)

---

## Subplots

### 1. Basic Subplots

**ASCII Representation:**
```
┌─────────┬─────────┐
│  Plot1  │  Plot2  │
├─────────┼─────────┤
│  Plot3  │  Plot4  │
└─────────┴─────────┘
```

**Simple Grid Layout:**
```python
import matplotlib.pyplot as plt
import numpy as np

# Create 2x2 grid of subplots
fig, axes = plt.subplots(nrows=2, ncols=2, figsize=(12, 10))

# Generate data
x = np.linspace(0, 10, 100)

# Plot on each subplot
axes[0, 0].plot(x, np.sin(x), 'b-')
axes[0, 0].set_title('Sine Wave')
axes[0, 0].grid(True, alpha=0.3)

axes[0, 1].plot(x, np.cos(x), 'r-')
axes[0, 1].set_title('Cosine Wave')
axes[0, 1].grid(True, alpha=0.3)

axes[1, 0].plot(x, np.tan(x), 'g-')
axes[1, 0].set_title('Tangent Wave')
axes[1, 0].set_ylim(-5, 5)
axes[1, 0].grid(True, alpha=0.3)

axes[1, 1].plot(x, np.exp(-x/5), 'm-')
axes[1, 1].set_title('Exponential Decay')
axes[1, 1].grid(True, alpha=0.3)

# Overall title
fig.suptitle('Trigonometric and Exponential Functions', fontsize=16, fontweight='bold')

plt.tight_layout()
plt.show()
```

**Flatten axes for easier iteration:**
```python
fig, axes = plt.subplots(2, 2, figsize=(12, 10))
axes = axes.flatten()  # Convert 2D array to 1D

for i, ax in enumerate(axes):
    ax.plot(x, x**i)
    ax.set_title(f'y = x^{i}')
    ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

### 2. Shared Axes

**When to Use:**
- Comparing multiple datasets with same scale
- Reducing redundant labels
- Creating cleaner multi-plot figures

```python
# Share x-axis
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8), sharex=True)

x = np.linspace(0, 10, 100)
ax1.plot(x, np.sin(x), 'b-', linewidth=2)
ax1.set_ylabel('sin(x)', fontsize=12)
ax1.grid(True, alpha=0.3)

ax2.plot(x, np.cos(x), 'r-', linewidth=2)
ax2.set_ylabel('cos(x)', fontsize=12)
ax2.set_xlabel('x', fontsize=12)
ax2.grid(True, alpha=0.3)

fig.suptitle('Shared X-Axis Example', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()

# Share both axes
fig, axes = plt.subplots(2, 2, figsize=(12, 10), sharex=True, sharey=True)
```

### 3. Irregular Subplot Layouts

**Using GridSpec:**
```python
import matplotlib.gridspec as gridspec

# Create figure
fig = plt.figure(figsize=(12, 8))
gs = gridspec.GridSpec(3, 3, figure=fig)

# Large plot on left (spans 3 rows, 2 columns)
ax1 = fig.add_subplot(gs[:, :2])
ax1.plot(x, np.sin(x), linewidth=2)
ax1.set_title('Main Plot', fontsize=14)
ax1.grid(True, alpha=0.3)

# Three smaller plots on right
ax2 = fig.add_subplot(gs[0, 2])
ax2.plot(x, np.cos(x))
ax2.set_title('Plot 1')
ax2.grid(True, alpha=0.3)

ax3 = fig.add_subplot(gs[1, 2])
ax3.plot(x, np.tan(x))
ax3.set_title('Plot 2')
ax3.set_ylim(-5, 5)
ax3.grid(True, alpha=0.3)

ax4 = fig.add_subplot(gs[2, 2])
ax4.plot(x, x**2)
ax4.set_title('Plot 3')
ax4.grid(True, alpha=0.3)

fig.suptitle('Complex Layout with GridSpec', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()
```

**ASCII Representation:**
```
┌─────────────┬───┐
│             │ 1 │
│             ├───┤
│    Main     │ 2 │
│             ├───┤
│             │ 3 │
└─────────────┴───┘
```

**Alternative: subplot2grid**
```python
fig = plt.figure(figsize=(12, 8))

# Specify grid size and location
ax1 = plt.subplot2grid((3, 3), (0, 0), colspan=2, rowspan=3)
ax2 = plt.subplot2grid((3, 3), (0, 2))
ax3 = plt.subplot2grid((3, 3), (1, 2))
ax4 = plt.subplot2grid((3, 3), (2, 2))

# Same plotting as above
```

### 4. Nested Subplots

```python
fig = plt.figure(figsize=(14, 10))

# Outer subplot
gs_outer = gridspec.GridSpec(2, 1, figure=fig, hspace=0.3)

# Top section
ax_top = fig.add_subplot(gs_outer[0])
ax_top.plot(x, np.sin(x), linewidth=2)
ax_top.set_title('Top Section')

# Bottom section - subdivided
gs_inner = gridspec.GridSpecFromSubplotSpec(1, 3, subplot_spec=gs_outer[1], wspace=0.3)
ax_bottom1 = fig.add_subplot(gs_inner[0])
ax_bottom2 = fig.add_subplot(gs_inner[1])
ax_bottom3 = fig.add_subplot(gs_inner[2])

ax_bottom1.scatter(x, np.random.randn(100))
ax_bottom1.set_title('Scatter')

ax_bottom2.hist(np.random.randn(1000), bins=30)
ax_bottom2.set_title('Histogram')

ax_bottom3.bar(['A', 'B', 'C'], [3, 5, 2])
ax_bottom3.set_title('Bar Chart')

fig.suptitle('Nested Subplots', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()
```

### 5. Inset Plots (Plot within Plot)

```python
from mpl_toolkits.axes_grid1.inset_locator import inset_axes

fig, ax = plt.subplots(figsize=(10, 6))

# Main plot
x = np.linspace(0, 10, 1000)
y = np.sin(x)
ax.plot(x, y, 'b-', linewidth=2)
ax.set_xlabel('X', fontsize=12)
ax.set_ylabel('Y', fontsize=12)
ax.set_title('Main Plot with Inset', fontsize=14, fontweight='bold')
ax.grid(True, alpha=0.3)

# Create inset
axins = inset_axes(ax, width="40%", height="35%", loc='upper right')
x_zoom = np.linspace(4, 6, 200)
y_zoom = np.sin(x_zoom)
axins.plot(x_zoom, y_zoom, 'r-', linewidth=2)
axins.set_xlim(4, 6)
axins.set_ylim(-1.2, 1.2)
axins.set_title('Zoomed Region', fontsize=10)
axins.grid(True, alpha=0.3)

# Mark the region being zoomed
from matplotlib.patches import Rectangle
rect = Rectangle((4, -1.2), 2, 2.4, linewidth=2,
                 edgecolor='red', facecolor='none', linestyle='--')
ax.add_patch(rect)

plt.tight_layout()
plt.show()
```

---

## Advanced Plot Types

### 1. Box Plot

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
- Compare distributions across categories
- Identify outliers
- Show median and quartiles
- Statistical summary

```python
# Generate sample data
np.random.seed(42)
data = [np.random.normal(100, 10, 200),
        np.random.normal(105, 15, 200),
        np.random.normal(95, 12, 200),
        np.random.normal(110, 8, 200)]

labels = ['Group A', 'Group B', 'Group C', 'Group D']

fig, ax = plt.subplots(figsize=(10, 6))

# Create box plot
bp = ax.boxplot(data,
                labels=labels,
                notch=True,        # notched boxes
                patch_artist=True, # fill boxes with color
                showmeans=True,    # show mean as point
                meanline=False,
                widths=0.6)

# Customize colors
colors = ['lightblue', 'lightgreen', 'lightcoral', 'lightyellow']
for patch, color in zip(bp['boxes'], colors):
    patch.set_facecolor(color)
    patch.set_alpha(0.7)

# Customize medians
for median in bp['medians']:
    median.set_color('red')
    median.set_linewidth(2)

# Customize whiskers and caps
for whisker in bp['whiskers']:
    whisker.set_linestyle('--')
    whisker.set_linewidth(1.5)

ax.set_ylabel('Values', fontsize=12)
ax.set_title('Distribution Comparison Across Groups', fontsize=14, fontweight='bold')
ax.grid(axis='y', alpha=0.3)

plt.tight_layout()
plt.show()
```

**Real-World Use Cases:**
- Exam scores across different classes
- Sales performance across regions
- Response times for different servers
- Patient recovery times for different treatments

**Box Plot Components:**
```python
# Understanding the components:
# - Box: IQR (25th to 75th percentile)
# - Line in box: Median
# - Whiskers: 1.5 * IQR from quartiles
# - Points beyond whiskers: Outliers
# - Diamond/Triangle: Mean (if showmeans=True)
```

### 2. Violin Plot

**ASCII Representation:**
```
      ╱╲
     ╱  ╲
    ╱    ╲
   │  ●   │   Density + Box plot
    ╲    ╱
     ╲  ╱
      ╲╱
```

**When to Use:**
- Show full distribution shape
- Compare distributions
- More informative than box plots

```python
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

# Simple violin plot
parts = ax1.violinplot(data,
                       positions=range(1, 5),
                       showmeans=True,
                       showmedians=True,
                       widths=0.7)

# Customize colors
for i, pc in enumerate(parts['bodies']):
    pc.set_facecolor(colors[i])
    pc.set_alpha(0.7)

ax1.set_xticks(range(1, 5))
ax1.set_xticklabels(labels)
ax1.set_ylabel('Values', fontsize=12)
ax1.set_title('Violin Plot', fontsize=14, fontweight='bold')
ax1.grid(axis='y', alpha=0.3)

# Horizontal violin plot
parts2 = ax2.violinplot(data,
                        positions=range(1, 5),
                        vert=False,
                        showmeans=True,
                        showmedians=True)

for i, pc in enumerate(parts2['bodies']):
    pc.set_facecolor(colors[i])
    pc.set_alpha(0.7)

ax2.set_yticks(range(1, 5))
ax2.set_yticklabels(labels)
ax2.set_xlabel('Values', fontsize=12)
ax2.set_title('Horizontal Violin Plot', fontsize=14, fontweight='bold')
ax2.grid(axis='x', alpha=0.3)

plt.tight_layout()
plt.show()
```

### 3. Heatmap

**ASCII Representation:**
```
    A  B  C  D
  ┌──────────┐
1 │█░░█░░░█░░│
2 │░░█████░░░│
3 │░░░░█████░│
4 │███░░░█░░░│
  └──────────┘
```

**When to Use:**
- Correlation matrices
- Confusion matrices
- 2D data density
- Time series patterns

```python
# Generate correlation matrix
np.random.seed(42)
variables = ['Var1', 'Var2', 'Var3', 'Var4', 'Var5']
data_matrix = np.random.randn(5, 5)
correlation_matrix = np.corrcoef(data_matrix)

fig, ax = plt.subplots(figsize=(10, 8))

# Create heatmap
im = ax.imshow(correlation_matrix,
               cmap='coolwarm',
               aspect='auto',
               vmin=-1,
               vmax=1)

# Set ticks and labels
ax.set_xticks(np.arange(len(variables)))
ax.set_yticks(np.arange(len(variables)))
ax.set_xticklabels(variables)
ax.set_yticklabels(variables)

# Rotate x labels
plt.setp(ax.get_xticklabels(), rotation=45, ha='right', rotation_mode='anchor')

# Add colorbar
cbar = plt.colorbar(im, ax=ax)
cbar.set_label('Correlation', fontsize=12)

# Add text annotations
for i in range(len(variables)):
    for j in range(len(variables)):
        text = ax.text(j, i, f'{correlation_matrix[i, j]:.2f}',
                      ha='center', va='center',
                      color='white' if abs(correlation_matrix[i, j]) > 0.5 else 'black',
                      fontsize=10, fontweight='bold')

ax.set_title('Correlation Matrix Heatmap', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()
```

**Real-World Use Cases:**
- Feature correlation in ML
- Gene expression patterns
- Sales across time and regions
- Website traffic heatmaps

### 4. Contour and Filled Contour Plots

**ASCII Representation:**
```
  ╭─────╮
  │ ╭─╮ │
  │ │ │ │  Elevation lines
  │ ╰─╯ │
  ╰─────╯
```

**When to Use:**
- 3D data on 2D plane
- Topographical data
- Probability distributions
- Function visualization

```python
# Generate 3D surface data
x = np.linspace(-3, 3, 100)
y = np.linspace(-3, 3, 100)
X, Y = np.meshgrid(x, y)
Z = np.sin(np.sqrt(X**2 + Y**2))

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

# Contour plot
contour = ax1.contour(X, Y, Z,
                      levels=15,
                      cmap='viridis',
                      linewidths=2)
ax1.clabel(contour, inline=True, fontsize=8)
ax1.set_xlabel('X', fontsize=12)
ax1.set_ylabel('Y', fontsize=12)
ax1.set_title('Contour Plot', fontsize=14, fontweight='bold')
ax1.set_aspect('equal')

# Filled contour plot
contourf = ax2.contourf(X, Y, Z,
                        levels=20,
                        cmap='viridis')
plt.colorbar(contourf, ax=ax2, label='Z value')
ax2.set_xlabel('X', fontsize=12)
ax2.set_ylabel('Y', fontsize=12)
ax2.set_title('Filled Contour Plot', fontsize=14, fontweight='bold')
ax2.set_aspect('equal')

plt.tight_layout()
plt.show()
```

### 5. Stream Plot

**When to Use:**
- Vector fields
- Fluid dynamics
- Gradient visualization

```python
# Create vector field
x = np.linspace(-3, 3, 20)
y = np.linspace(-3, 3, 20)
X, Y = np.meshgrid(x, y)
U = -Y  # x-component of velocity
V = X   # y-component of velocity

fig, ax = plt.subplots(figsize=(10, 8))

# Create streamplot
strm = ax.streamplot(X, Y, U, V,
                     density=1.5,
                     color=np.sqrt(U**2 + V**2),
                     cmap='autumn',
                     linewidth=2,
                     arrowsize=1.5)

plt.colorbar(strm.lines, ax=ax, label='Velocity magnitude')
ax.set_xlabel('X', fontsize=12)
ax.set_ylabel('Y', fontsize=12)
ax.set_title('Stream Plot - Vector Field Visualization', fontsize=14, fontweight='bold')
ax.set_aspect('equal')

plt.tight_layout()
plt.show()
```

### 6. Hexbin Plot

**When to Use:**
- Large scatter plot datasets
- 2D density visualization
- When points overlap

```python
np.random.seed(42)
n = 100000
x = np.random.standard_normal(n)
y = 2.0 + 3.0 * x + 4.0 * np.random.standard_normal(n)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

# Regular scatter (slow with many points)
ax1.scatter(x[:1000], y[:1000], alpha=0.5, s=1)
ax1.set_title('Scatter Plot (1000 points)', fontsize=14, fontweight='bold')
ax1.set_xlabel('X', fontsize=12)
ax1.set_ylabel('Y', fontsize=12)
ax1.grid(True, alpha=0.3)

# Hexbin plot (efficient for many points)
hb = ax2.hexbin(x, y, gridsize=50, cmap='YlOrRd', mincnt=1)
cb = plt.colorbar(hb, ax=ax2)
cb.set_label('Counts', fontsize=12)
ax2.set_title('Hexbin Plot (100000 points)', fontsize=14, fontweight='bold')
ax2.set_xlabel('X', fontsize=12)
ax2.set_ylabel('Y', fontsize=12)

plt.tight_layout()
plt.show()
```

---

## Customization Techniques

### 1. Custom Colormaps

```python
from matplotlib.colors import LinearSegmentedColormap

# Create custom colormap
colors_list = ['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF']
n_bins = 100
cmap_custom = LinearSegmentedColormap.from_list('custom', colors_list, N=n_bins)

# Use custom colormap
fig, ax = plt.subplots(figsize=(10, 6))
scatter = ax.scatter(x, y, c=np.random.rand(100), cmap=cmap_custom, s=100)
plt.colorbar(scatter, ax=ax)
ax.set_title('Custom Colormap', fontsize=14, fontweight='bold')
plt.show()
```

### 2. Dual Y-Axes

**When to Use:**
- Comparing two variables with different scales
- Showing relationships between different units

```python
fig, ax1 = plt.subplots(figsize=(10, 6))

# First y-axis
x = np.linspace(0, 10, 100)
y1 = np.sin(x)
color1 = 'tab:blue'
ax1.set_xlabel('Time (s)', fontsize=12)
ax1.set_ylabel('Temperature (°C)', color=color1, fontsize=12)
line1 = ax1.plot(x, y1 * 100, color=color1, linewidth=2, label='Temperature')
ax1.tick_params(axis='y', labelcolor=color1)
ax1.grid(True, alpha=0.3)

# Second y-axis
ax2 = ax1.twinx()
y2 = np.exp(-x/5)
color2 = 'tab:red'
ax2.set_ylabel('Pressure (Pa)', color=color2, fontsize=12)
line2 = ax2.plot(x, y2 * 1000, color=color2, linewidth=2,
                 linestyle='--', label='Pressure')
ax2.tick_params(axis='y', labelcolor=color2)

# Combined legend
lines = line1 + line2
labels = [l.get_label() for l in lines]
ax1.legend(lines, labels, loc='upper right')

plt.title('Dual Y-Axis Plot', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()
```

### 3. Logarithmic Scales

```python
fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(14, 10))

x = np.linspace(0.1, 10, 100)
y = x**3

# Linear
ax1.plot(x, y, linewidth=2)
ax1.set_title('Linear Scale', fontsize=12, fontweight='bold')
ax1.grid(True, alpha=0.3)

# Log x-axis
ax2.semilogx(x, y, linewidth=2)
ax2.set_title('Log X Scale', fontsize=12, fontweight='bold')
ax2.grid(True, alpha=0.3, which='both')

# Log y-axis
ax3.semilogy(x, y, linewidth=2)
ax3.set_title('Log Y Scale', fontsize=12, fontweight='bold')
ax3.grid(True, alpha=0.3, which='both')

# Log-log
ax4.loglog(x, y, linewidth=2)
ax4.set_title('Log-Log Scale', fontsize=12, fontweight='bold')
ax4.grid(True, alpha=0.3, which='both')

fig.suptitle('Different Scale Types', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()
```

### 4. Fill Between

**When to Use:**
- Showing confidence intervals
- Highlighting regions
- Area charts

```python
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

x = np.linspace(0, 10, 100)
y = np.sin(x)
y_upper = y + 0.3
y_lower = y - 0.3

# Fill between curves
ax1.plot(x, y, 'b-', linewidth=2, label='Mean')
ax1.fill_between(x, y_lower, y_upper,
                 alpha=0.3,
                 color='blue',
                 label='Confidence Interval')
ax1.set_xlabel('X', fontsize=12)
ax1.set_ylabel('Y', fontsize=12)
ax1.set_title('Fill Between - Confidence Interval', fontsize=14, fontweight='bold')
ax1.legend()
ax1.grid(True, alpha=0.3)

# Fill to baseline
y1 = np.sin(x)
y2 = np.cos(x)
ax2.fill_between(x, 0, y1, alpha=0.5, label='sin(x)', color='blue')
ax2.fill_between(x, 0, y2, alpha=0.5, label='cos(x)', color='red')
ax2.set_xlabel('X', fontsize=12)
ax2.set_ylabel('Y', fontsize=12)
ax2.set_title('Stacked Area Chart', fontsize=14, fontweight='bold')
ax2.legend()
ax2.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

### 5. Error Bars

```python
x = np.arange(0, 10, 1)
y = np.exp(-x/5.0)
yerr = 0.1 + 0.2 * np.random.rand(len(x))
xerr = 0.1 + 0.1 * np.random.rand(len(x))

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

# Vertical error bars
ax1.errorbar(x, y, yerr=yerr,
             fmt='o-',
             linewidth=2,
             markersize=8,
             capsize=5,
             capthick=2,
             ecolor='red',
             label='Data with error')
ax1.set_xlabel('X', fontsize=12)
ax1.set_ylabel('Y', fontsize=12)
ax1.set_title('Vertical Error Bars', fontsize=14, fontweight='bold')
ax1.legend()
ax1.grid(True, alpha=0.3)

# Both x and y error bars
ax2.errorbar(x, y, xerr=xerr, yerr=yerr,
             fmt='s',
             markersize=8,
             capsize=5,
             capthick=2,
             ecolor='blue',
             elinewidth=2,
             label='Data with X and Y errors')
ax2.set_xlabel('X', fontsize=12)
ax2.set_ylabel('Y', fontsize=12)
ax2.set_title('X and Y Error Bars', fontsize=14, fontweight='bold')
ax2.legend()
ax2.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

---

## Statistical Visualizations

### 1. Histogram with KDE

```python
from scipy import stats

data = np.random.normal(100, 15, 1000)

fig, ax = plt.subplots(figsize=(10, 6))

# Histogram
n, bins, patches = ax.hist(data, bins=30, density=True,
                           alpha=0.7, color='skyblue',
                           edgecolor='black', label='Histogram')

# KDE overlay
kde = stats.gaussian_kde(data)
x_range = np.linspace(data.min(), data.max(), 200)
ax.plot(x_range, kde(x_range), 'r-', linewidth=2, label='KDE')

# Normal distribution overlay
mu, sigma = data.mean(), data.std()
normal_fit = stats.norm.pdf(x_range, mu, sigma)
ax.plot(x_range, normal_fit, 'g--', linewidth=2, label='Normal Fit')

ax.set_xlabel('Value', fontsize=12)
ax.set_ylabel('Density', fontsize=12)
ax.set_title('Histogram with KDE and Normal Fit', fontsize=14, fontweight='bold')
ax.legend()
ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

### 2. Q-Q Plot

**When to Use:**
- Testing normality
- Comparing distributions

```python
from scipy import stats

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

# Normal data
normal_data = np.random.normal(0, 1, 1000)
stats.probplot(normal_data, dist="norm", plot=ax1)
ax1.set_title('Q-Q Plot: Normal Data', fontsize=14, fontweight='bold')
ax1.grid(True, alpha=0.3)

# Non-normal data (exponential)
exp_data = np.random.exponential(1, 1000)
stats.probplot(exp_data, dist="norm", plot=ax2)
ax2.set_title('Q-Q Plot: Exponential Data', fontsize=14, fontweight='bold')
ax2.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

### 3. Step Plot

**When to Use:**
- Cumulative distributions
- Discrete changes
- Survival analysis

```python
x = np.arange(1, 11)
y = np.random.randint(1, 10, 10)

fig, ax = plt.subplots(figsize=(10, 6))

ax.step(x, y, where='mid', linewidth=2, label='mid')
ax.step(x, y + 5, where='pre', linewidth=2, label='pre')
ax.step(x, y + 10, where='post', linewidth=2, label='post')

ax.set_xlabel('X', fontsize=12)
ax.set_ylabel('Y', fontsize=12)
ax.set_title('Step Plot Variations', fontsize=14, fontweight='bold')
ax.legend()
ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

---

## 3D Plotting

```python
from mpl_toolkits.mplot3d import Axes3D

# Create 3D data
x = np.linspace(-5, 5, 50)
y = np.linspace(-5, 5, 50)
X, Y = np.meshgrid(x, y)
Z = np.sin(np.sqrt(X**2 + Y**2))

fig = plt.figure(figsize=(16, 6))

# Surface plot
ax1 = fig.add_subplot(131, projection='3d')
surf = ax1.plot_surface(X, Y, Z, cmap='viridis', alpha=0.8)
ax1.set_xlabel('X', fontsize=10)
ax1.set_ylabel('Y', fontsize=10)
ax1.set_zlabel('Z', fontsize=10)
ax1.set_title('Surface Plot', fontsize=12, fontweight='bold')
fig.colorbar(surf, ax=ax1, shrink=0.5)

# Wireframe plot
ax2 = fig.add_subplot(132, projection='3d')
ax2.plot_wireframe(X, Y, Z, color='blue', alpha=0.6)
ax2.set_xlabel('X', fontsize=10)
ax2.set_ylabel('Y', fontsize=10)
ax2.set_zlabel('Z', fontsize=10)
ax2.set_title('Wireframe Plot', fontsize=12, fontweight='bold')

# 3D Scatter
ax3 = fig.add_subplot(133, projection='3d')
x_scatter = np.random.randn(500)
y_scatter = np.random.randn(500)
z_scatter = x_scatter**2 + y_scatter**2
scatter = ax3.scatter(x_scatter, y_scatter, z_scatter,
                      c=z_scatter, cmap='plasma', s=20)
ax3.set_xlabel('X', fontsize=10)
ax3.set_ylabel('Y', fontsize=10)
ax3.set_zlabel('Z', fontsize=10)
ax3.set_title('3D Scatter Plot', fontsize=12, fontweight='bold')
fig.colorbar(scatter, ax=ax3, shrink=0.5)

plt.tight_layout()
plt.show()
```

---

## Performance Optimization

### 1. Blitting for Animation

```python
import matplotlib.animation as animation

fig, ax = plt.subplots(figsize=(10, 6))
x = np.linspace(0, 2*np.pi, 100)
line, = ax.plot(x, np.sin(x))

def animate(frame):
    line.set_ydata(np.sin(x + frame/10))
    return line,

ani = animation.FuncAnimation(fig, animate, frames=100,
                             interval=20, blit=True)
plt.show()
```

### 2. Reduce Plot Complexity

```python
# BAD: Too many points
x = np.linspace(0, 10, 1000000)
y = np.sin(x)
plt.plot(x, y)  # Slow!

# GOOD: Downsample for visualization
x = np.linspace(0, 10, 1000)
y = np.sin(x)
plt.plot(x, y)  # Fast!

# For scatter with many points, use hexbin or 2D histogram
```

### 3. Reuse Figures

```python
# Create figure once
fig, ax = plt.subplots()

# Update data instead of creating new figures
for i in range(10):
    ax.clear()
    ax.plot(x, np.sin(x + i))
    plt.pause(0.1)
```

---

## Best Practices

### 1. Subplot Spacing

```python
# Use tight_layout() for automatic spacing
plt.tight_layout()

# Or manual adjustment
plt.subplots_adjust(left=0.1, right=0.9, top=0.9, bottom=0.1,
                   hspace=0.4, wspace=0.3)
```

### 2. Consistent Figure Sizes

```python
# Define standard sizes
SMALL_SIZE = (8, 6)
MEDIUM_SIZE = (10, 8)
LARGE_SIZE = (14, 10)

# Use consistently
fig, ax = plt.subplots(figsize=MEDIUM_SIZE)
```

### 3. Matplotlib Context Managers

```python
# Temporary RC parameters
with plt.rc_context({'figure.figsize': (10, 6), 'font.size': 12}):
    fig, ax = plt.subplots()
    ax.plot(x, y)
    plt.show()
```

---

## Summary

Advanced Matplotlib features enable:
1. **Complex layouts** with subplots and GridSpec
2. **Statistical visualizations** for data analysis
3. **Customization** for publication-quality plots
4. **3D visualizations** for spatial data
5. **Performance optimization** for large datasets

**Key Takeaways:**
- Use GridSpec for complex layouts
- Choose appropriate plot types for your data
- Optimize performance for large datasets
- Maintain consistency across visualizations
- Always use `tight_layout()` before showing plots

**Next**: See seaborn-complete.md for high-level statistical graphics.
