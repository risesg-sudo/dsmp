# Feature Engineering - Comprehensive Revision Notes

## Overview

Feature engineering transforms raw data into meaningful features that improve machine learning model performance. This module covers all essential techniques with practical examples and best practices.

## Module Structure

### Categorical Encoding (8 files)

Understanding how to convert categorical variables into numerical format is crucial for machine learning.

1. **[encoding-overview.md](./encoding-overview.md)** - Start here for foundational concepts
   - Types of categorical variables
   - Decision framework overview
   - When to use which encoding

2. **[encoding-onehot.md](./encoding-onehot.md)** - Binary columns for each category
   - Best for low cardinality (<10 categories)
   - Works with all model types
   - Handles nominal variables

3. **[encoding-ordinal.md](./encoding-ordinal.md)** - Integer values based on order
   - For ordinal variables with natural order
   - Memory efficient (single column)
   - Examples: education levels, ratings

4. **[encoding-target.md](./encoding-target.md)** - Mean of target per category
   - Handles high cardinality effectively
   - Requires careful cross-validation
   - Powerful but risk of overfitting

5. **[encoding-binary.md](./encoding-binary.md)** - Binary digit encoding
   - More compact than one-hot
   - Good for moderate cardinality (10-100)
   - Space-efficient alternative

6. **[encoding-frequency.md](./encoding-frequency.md)** - Encode by popularity
   - Simple and fast
   - When frequency is informative
   - Single column output

7. **[encoding-comparison.md](./encoding-comparison.md)** - Compare all techniques
   - Performance benchmarks
   - Decision trees and tables
   - Model-specific recommendations

8. **[encoding-best-practices.md](./encoding-best-practices.md)** - Production-ready code
   - Common mistakes to avoid
   - Pipeline patterns
   - Interview questions with answers

### Missing Values (8 files)

Learn how to handle incomplete data properly without introducing bias or data leakage.

1. **[missing-overview.md](./missing-overview.md)** - Understanding missing data
   - Impact on model performance
   - Diagnostic techniques
   - Decision framework

2. **[missing-types.md](./missing-types.md)** - Types of missingness
   - MCAR (Missing Completely At Random)
   - MAR (Missing At Random)
   - MNAR (Missing Not At Random)

3. **[missing-simple-imputer.md](./missing-simple-imputer.md)** - Basic imputation
   - Mean, median, mode strategies
   - Constant value imputation
   - When to use each

4. **[missing-knn-imputer.md](./missing-knn-imputer.md)** - Neighbor-based imputation
   - How KNN imputation works
   - Choosing K value
   - Healthcare data example

5. **[missing-iterative-imputer.md](./missing-iterative-imputer.md)** - MICE method
   - Multivariate imputation
   - Iterative approach
   - Advanced configurations

6. **[missing-advanced-techniques.md](./missing-advanced-techniques.md)** - Specialized methods
   - Indicator variables
   - Time series methods
   - Domain-specific approaches

7. **[missing-comparison.md](./missing-comparison.md)** - Technique comparison
   - Performance analysis
   - When to use what
   - Real-world scenarios

8. **[missing-best-practices.md](./missing-best-practices.md)** - Production patterns
   - Common pitfalls
   - Pipeline integration
   - Interview preparation

### Feature Scaling & Outliers (9 files)

Essential preprocessing for distance-based algorithms and handling extreme values.

1. **[scaling-why-important.md](./scaling-why-important.md)** - Why scale features
   - Algorithms that need scaling
   - Visual demonstrations
   - Impact on convergence

2. **[scaling-standardscaler.md](./scaling-standardscaler.md)** - Z-score normalization
   - Mean 0, standard deviation 1
   - Most commonly used
   - Customer segmentation example

3. **[scaling-minmaxscaler.md](./scaling-minmaxscaler.md)** - Range normalization
   - Scale to [0, 1] range
   - Outlier sensitive
   - Image processing applications

4. **[scaling-robustscaler.md](./scaling-robustscaler.md)** - Outlier-resistant scaling
   - Uses median and IQR
   - Sensor data example
   - When outliers are present

5. **[scaling-normalizer.md](./scaling-normalizer.md)** - Row-wise scaling
   - Scales individual samples
   - Text document similarity
   - L1, L2, Max norms

6. **[outliers-detection-methods.md](./outliers-detection-methods.md)** - Finding outliers
   - Z-score method
   - IQR method
   - Isolation Forest

7. **[outliers-handling-strategies.md](./outliers-handling-strategies.md)** - Treating outliers
   - Removal
   - Capping (Winsorization)
   - Transformation

8. **[scaling-comparison-guide.md](./scaling-comparison-guide.md)** - Compare all scalers
   - Decision framework
   - Common mistakes
   - Best practices

9. **[scaling-interview-questions.md](./scaling-interview-questions.md)** - Interview prep
   - 10 comprehensive Q&A
   - Real examples with code
   - When to use which scaler

### Transformations (8 files)

Transform skewed distributions to improve model performance.

1. **[transformations-why-needed.md](./transformations-why-needed.md)** - Understanding skewness
   - When to transform
   - Measuring skewness
   - Impact on models

2. **[transformations-log.md](./transformations-log.md)** - Log transformation
   - For right-skewed data
   - House prices example
   - Handling zeros and negatives

3. **[transformations-square-root.md](./transformations-square-root.md)** - Moderate compression
   - Less aggressive than log
   - Website analytics example
   - When to prefer over log

4. **[transformations-box-cox.md](./transformations-box-cox.md)** - Optimal transformation
   - Automatic lambda selection
   - Only for positive data
   - Sales forecasting example

5. **[transformations-yeo-johnson.md](./transformations-yeo-johnson.md)** - Works with any data
   - Handles zero and negative values
   - Financial returns example
   - Comparison with Box-Cox

6. **[transformations-power-custom.md](./transformations-power-custom.md)** - Custom transformations
   - PowerTransformer interface
   - Domain-specific transformations
   - Advanced configurations

7. **[transformations-comparison-guide.md](./transformations-comparison-guide.md)** - Compare all methods
   - Decision framework
   - Common mistakes
   - Best practices

8. **[transformations-interview-questions.md](./transformations-interview-questions.md)** - Interview prep
   - 10 comprehensive Q&A
   - Practical examples
   - When to use each method

### Feature Construction (7 files)

Create new features from existing ones to capture complex relationships.

1. **[polynomial-features.md](./polynomial-features.md)** - Polynomial terms
   - x², x³, etc.
   - House price example
   - Degree selection

2. **[interaction-features.md](./interaction-features.md)** - Feature interactions
   - x₁ × x₂ terms
   - Marketing campaign example
   - When interactions matter

3. **[domain-specific-features.md](./domain-specific-features.md)** - Industry features
   - Financial features (DTI, credit utilization)
   - E-commerce features (AOV, CLV)
   - Healthcare features (BMI, risk scores)

4. **[temporal-features.md](./temporal-features.md)** - Time-based features
   - Date extraction
   - Cyclical encoding
   - Lag and rolling features

5. **[aggregation-features.md](./aggregation-features.md)** - Group-based aggregations
   - Customer-level statistics
   - Churn prediction example
   - Transaction summaries

6. **[feature-crosses.md](./feature-crosses.md)** - Categorical crosses
   - Combining categories
   - Ad click prediction
   - When to use

7. **[feature-construction-best-practices.md](./feature-construction-best-practices.md)** - Best practices
   - Comparison of techniques
   - Common mistakes
   - Interview questions

### Discretization (6 files)

Convert continuous variables into categorical bins for interpretability and non-linear relationships.

1. **[equal-width-binning.md](./equal-width-binning.md)** - Fixed-width bins
   - Simple and interpretable
   - Income segmentation example
   - When to use

2. **[equal-frequency-binning.md](./equal-frequency-binning.md)** - Quantile-based bins
   - Equal samples per bin
   - Customer spending example
   - Handles skewed data

3. **[custom-binning.md](./custom-binning.md)** - Domain-driven bins
   - Age groups
   - Medical thresholds
   - Business rules

4. **[kmeans-binning.md](./kmeans-binning.md)** - Clustering-based bins
   - Data-driven approach
   - Customer segmentation
   - Encoding options

5. **[decision-tree-binning.md](./decision-tree-binning.md)** - Supervised binning
   - Optimal splits using trees
   - House price example
   - Credit risk application

6. **[discretization-best-practices.md](./discretization-best-practices.md)** - Best practices
   - Method comparison
   - Common mistakes
   - Interview questions

## Quick Start Guide

### For Beginners
Start with these files in order:
1. encoding-overview.md
2. missing-overview.md
3. scaling-why-important.md
4. transformations-why-needed.md

### For Interview Preparation
Focus on these best practices and interview files:
- encoding-best-practices.md
- missing-best-practices.md
- scaling-interview-questions.md
- transformations-interview-questions.md
- feature-construction-best-practices.md
- discretization-best-practices.md

### For Production Work
Study these implementation guides:
- All comparison-guide.md files
- All best-practices.md files
- Specific technique files for your use case

## Feature Engineering Pipeline

The typical order of operations:

```
1. Handle Missing Values
   └─ Choose imputation strategy based on missingness type

2. Encode Categorical Variables
   └─ Choose encoding based on cardinality and model type

3. Handle Outliers (if needed)
   └─ Detect, then decide: remove, cap, or transform

4. Transform Distributions (if skewed)
   └─ Log, Box-Cox, or Yeo-Johnson

5. Scale Features
   └─ StandardScaler for most cases, RobustScaler with outliers

6. Create New Features (optional)
   └─ Polynomial, interactions, domain-specific

7. Discretize (if needed)
   └─ Bin continuous variables for interpretability
```

## Decision Framework

### Choosing Encoding Method
- Ordinal variable with clear order? → Ordinal Encoding
- Low cardinality (<10)? → One-Hot Encoding
- High cardinality (>10)? → Target or Frequency Encoding
- Moderate cardinality (10-100)? → Binary Encoding

### Choosing Imputation Method
- MCAR with numerical data? → Mean/Median
- MAR with patterns? → KNN or Iterative Imputer
- MNAR? → Domain knowledge required
- Missing indicator useful? → Add indicator variable

### Choosing Scaler
- Normal distribution, no outliers? → StandardScaler
- Need [0,1] range? → MinMaxScaler
- Outliers present? → RobustScaler
- Row-wise scaling needed? → Normalizer

### Choosing Transformation
- Positive data, right-skewed? → Log transformation
- Positive data, find optimal? → Box-Cox
- Any data including negative? → Yeo-Johnson
- Moderate skew? → Square Root

## Key Takeaways

1. Feature engineering often provides more improvement than algorithm tuning
2. Always split data before engineering to prevent leakage
3. Use sklearn Pipeline for reproducibility
4. Document all transformations
5. Test impact of each feature engineering step
6. Consider computational cost in production

## Resources

Each file contains:
- Clear explanations with intuition
- Complete code examples
- Real-world use cases
- When to use guidance
- Common pitfalls
- Quick reference summaries
- Navigation links

---

**Next Steps**: Start with [encoding-overview.md](./encoding-overview.md) or jump to specific topics based on your needs.

**Previous**: [Back to Main README](../README.md)
