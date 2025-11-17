# Unsupervised Learning: Comprehensive Revision Notes

## Overview
This directory contains comprehensive revision notes for Unsupervised Learning, covering clustering algorithms, dimensionality reduction, and association rule mining.

## Files Structure

### 1. **kmeans.md** (19 KB)
**K-Means Clustering**
- Algorithm walkthrough with ASCII diagrams
- K-Means++ initialization
- Elbow method & Silhouette score for optimal K
- Implementation with sklearn
- Evaluation metrics (WCSS, Silhouette, Davies-Bouldin, Calinski-Harabasz)
- Real-world applications:
  - Customer segmentation
  - Image compression
  - Document clustering
  - Anomaly detection
  - Feature engineering
- Mini-Batch K-Means for large datasets
- Comparison with other algorithms

### 2. **hierarchical-dbscan.md** (24 KB)
**Hierarchical Clustering & DBSCAN**

**Part 1: Hierarchical Clustering**
- Agglomerative (bottom-up) vs Divisive (top-down)
- Linkage methods: Single, Complete, Average, Ward
- Dendrograms: creation and interpretation
- Implementation with scipy and sklearn
- Finding optimal clusters from dendrograms

**Part 2: DBSCAN**
- Density-based clustering
- Core, border, and noise points
- Parameters: eps and minPts
- K-distance plot for parameter selection
- OPTICS algorithm
- Applications:
  - Anomaly detection in network traffic
  - Geographic clustering (crime hotspots)
  - Customer outlier detection
  - Image segmentation

### 3. **gmm.md** (24 KB)
**Gaussian Mixture Models**
- Probabilistic clustering (soft clustering)
- Multivariate Gaussian distributions
- EM (Expectation-Maximization) algorithm
- Covariance types: Full, Tied, Diagonal, Spherical
- Model selection: BIC vs AIC
- Implementation with sklearn
- Applications:
  - Image segmentation
  - Speaker recognition
  - Customer lifetime value modeling
  - Anomaly detection in manufacturing
  - Topic modeling
- Comparison with K-Means and other algorithms

### 4. **tsne.md** (23 KB)
**t-SNE (t-Distributed Stochastic Neighbor Embedding)**
- Dimensionality reduction for visualization
- How t-SNE works: preserving local structure
- Why t-distribution (crowding problem solution)
- Key parameters:
  - Perplexity (5-50, default 30)
  - Learning rate (10-1000, default 200)
  - Number of iterations (1000+)
  - Early exaggeration
- Finding optimal perplexity
- PCA preprocessing for speed
- 2D and 3D visualizations
- Applications:
  - MNIST digit visualization
  - Gene expression analysis
  - Document similarity
  - Customer segmentation exploration
  - Deep learning feature visualization
- Common misinterpretations and pitfalls
- Comparison with PCA, UMAP, MDS

### 5. **lda-apriori.md** (29 KB)
**LDA & Apriori Algorithm**

**Part 1: Linear Discriminant Analysis (LDA)**
- Supervised dimensionality reduction
- Maximizing class separation
- Fisher criterion
- Scatter matrices (within-class, between-class)
- LDA vs PCA comparison
- LDA as classifier
- QDA (Quadratic Discriminant Analysis)
- Implementation with sklearn

**Part 2: Apriori Algorithm**
- Association rule mining
- Market basket analysis
- Key concepts: itemsets, frequent itemsets
- Metrics:
  - Support: how often itemset appears
  - Confidence: how often rule is true
  - Lift: strength of association
  - Conviction & Leverage
- Apriori algorithm walkthrough
- Implementation with mlxtend
- Applications:
  - Retail market basket analysis
  - Cross-selling strategy
  - Website clickstream analysis
  - Medical diagnosis patterns
  - Movie recommendations

## Quick Algorithm Selector

### Choose Based on Your Goal:

**Clustering (Partitioning):**
- **K-Means**: Fast, spherical clusters, known K → `kmeans.md`
- **GMM**: Soft clustering, probabilistic, elliptical → `gmm.md`

**Clustering (Density-based):**
- **DBSCAN**: Arbitrary shapes, outliers, unknown K → `hierarchical-dbscan.md`

**Clustering (Hierarchical):**
- **Hierarchical**: Taxonomy, small data, dendrograms → `hierarchical-dbscan.md`

**Dimensionality Reduction (Visualization):**
- **t-SNE**: Beautiful 2D/3D plots, exploratory → `tsne.md`
- **LDA**: Classification preprocessing, supervised → `lda-apriori.md`

**Pattern Mining:**
- **Apriori**: Association rules, market basket → `lda-apriori.md`

## Comparison Table

| Algorithm | Type | Needs K? | Outliers | Speed | Best For |
|-----------|------|----------|----------|-------|----------|
| K-Means | Clustering | Yes | Poor | Fast | Simple, large data |
| Hierarchical | Clustering | No | Poor | Slow | Small data, taxonomy |
| DBSCAN | Clustering | No | Excellent | Fast | Spatial, noise |
| GMM | Clustering | Yes | Moderate | Moderate | Probabilistic, soft |
| t-SNE | Dim. Reduction | - | Moderate | Slow | Visualization only |
| LDA | Dim. Reduction | - | Moderate | Fast | Classification prep |
| Apriori | Pattern Mining | - | N/A | Moderate | Transactions |

## Common Evaluation Metrics

### Clustering Quality:
- **Silhouette Score**: [-1, 1], higher is better, measures cluster cohesion and separation
- **Davies-Bouldin Index**: [0, ∞), lower is better, cluster separation
- **Calinski-Harabasz**: [0, ∞), higher is better, variance ratio
- **Within-Cluster Sum of Squares (WCSS)**: Lower is better, compactness

### Model Selection:
- **BIC (Bayesian Information Criterion)**: Lower is better, penalizes complexity
- **AIC (Akaike Information Criterion)**: Lower is better, less penalty than BIC

## Key Takeaways

### Data Preprocessing:
1. **Always standardize** features for distance-based methods (K-Means, Hierarchical, DBSCAN)
2. **Handle outliers** before clustering (or use DBSCAN)
3. **Reduce dimensions** with PCA before t-SNE for speed

### Parameter Selection:
1. **K-Means**: Use Elbow method + Silhouette score
2. **DBSCAN**: Use K-distance plot for eps
3. **GMM**: Use BIC/AIC for number of components
4. **t-SNE**: Try perplexity 5-50, use 1000+ iterations
5. **Hierarchical**: Cut dendrogram at large gap

### Common Pitfalls:
- Not scaling features (affects distance calculations)
- Using wrong algorithm for data shape
- Over-interpreting t-SNE distances
- Ignoring convergence in iterative methods
- Using too low support in Apriori (too many rules)

## Real-World Application Examples

All files include practical, real-world examples:
- Customer segmentation
- Anomaly/fraud detection
- Image processing
- Document analysis
- Recommendation systems
- Medical diagnosis
- Geographic analysis
- And many more!

## Implementation Libraries

### Primary:
- **scikit-learn**: K-Means, Hierarchical, DBSCAN, GMM, t-SNE, LDA
- **scipy**: Hierarchical clustering, dendrograms
- **mlxtend**: Apriori algorithm

### Visualization:
- **matplotlib**: Standard plotting
- **seaborn**: Statistical plots
- **plotly**: Interactive visualizations

## Study Tips

1. **Start with comparisons**: Understand when to use which algorithm
2. **Focus on visuals**: ASCII diagrams help understand concepts
3. **Practice with code**: Run all implementation examples
4. **Understand metrics**: Know how to evaluate your results
5. **Learn from applications**: Real-world examples show practical usage

## Exam/Interview Focus Areas

### Conceptual:
- Difference between supervised/unsupervised learning
- When to use which clustering algorithm
- How EM algorithm works
- Interpretation of evaluation metrics
- Advantages and limitations of each method

### Practical:
- Implementing clustering pipelines
- Finding optimal parameters
- Evaluating cluster quality
- Preprocessing steps
- Handling large datasets

### Mathematical (if needed):
- K-Means objective function
- GMM likelihood
- LDA Fisher criterion
- Support, confidence, lift formulas

---

**Total Content**: ~120 KB of comprehensive notes with code examples, visualizations, and practical applications!

Good luck with your revision! 🚀
