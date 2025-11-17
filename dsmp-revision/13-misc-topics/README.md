# Miscellaneous Topics - Essential Data Science Skills

## Overview

This module covers critical topics that complement core machine learning skills. These practical techniques address real-world challenges in data preprocessing, model deployment, and production systems.

## Module Structure

### Model Explainability (6 files)

Understanding and explaining model predictions is crucial for trust, debugging, and regulatory compliance.

1. **[model-explainability-intro.md](./model-explainability-intro.md)** - Why explainability matters
   - Global vs local interpretability
   - Regulatory requirements
   - Business value

2. **[model-explainability-feature-importance.md](./model-explainability-feature-importance.md)** - Feature importance techniques
   - Tree-based importance
   - Permutation importance
   - When to use each

3. **[model-explainability-pdp.md](./model-explainability-pdp.md)** - Partial Dependence Plots
   - How PDPs work
   - ICE plots for individual observations
   - Interpretation guidelines

4. **[model-explainability-shap.md](./model-explainability-shap.md)** - SHAP values
   - Game theory foundation
   - Different SHAP explainers
   - Visualization techniques

5. **[model-explainability-lime.md](./model-explainability-lime.md)** - LIME explanations
   - Local surrogate models
   - Tabular, text, and image data
   - LIME vs SHAP comparison

6. **[model-explainability-interview.md](./model-explainability-interview.md)** - Interview preparation
   - Common questions and answers
   - Production deployment
   - Best practices

### NoSQL Databases - MongoDB (6 files)

Learn document-based NoSQL databases for flexible, scalable data storage.

1. **[nosql-mongodb-intro.md](./nosql-mongodb-intro.md)** - NoSQL fundamentals
   - NoSQL vs SQL comparison
   - When to use MongoDB
   - Document model

2. **[nosql-mongodb-basics.md](./nosql-mongodb-basics.md)** - Document structure
   - BSON data types
   - Schema design patterns
   - The _id field

3. **[nosql-mongodb-crud.md](./nosql-mongodb-crud.md)** - CRUD operations
   - Insert, find, update, delete
   - Update operators
   - Bulk operations

4. **[nosql-mongodb-querying.md](./nosql-mongodb-querying.md)** - Advanced queries
   - Query operators
   - Nested documents
   - Text search

5. **[nosql-mongodb-indexing-aggregation.md](./nosql-mongodb-indexing-aggregation.md)** - Performance
   - Index types
   - Aggregation pipeline
   - Query optimization

6. **[nosql-mongodb-pymongo-interview.md](./nosql-mongodb-pymongo-interview.md)** - Python & interviews
   - PyMongo basics
   - Connection management
   - Interview questions

### FastAPI Development (10 files)

Build high-performance REST APIs for machine learning model deployment.

1. **[fastapi-introduction.md](./fastapi-introduction.md)** - Getting started
   - Why FastAPI
   - Installation and setup
   - First API

2. **[fastapi-basics.md](./fastapi-basics.md)** - HTTP methods
   - GET, POST, PUT, DELETE
   - Status codes
   - Basic CRUD

3. **[fastapi-pydantic-models.md](./fastapi-pydantic-models.md)** - Data validation
   - Pydantic models
   - Field validation
   - Nested models

4. **[fastapi-parameters.md](./fastapi-parameters.md)** - Request parameters
   - Path parameters
   - Query parameters
   - Validation rules

5. **[fastapi-async.md](./fastapi-async.md)** - Asynchronous endpoints
   - Async/await concepts
   - Database operations
   - Performance benefits

6. **[fastapi-dependency-injection.md](./fastapi-dependency-injection.md)** - Dependencies
   - Dependency injection pattern
   - Database dependencies
   - Authentication

7. **[fastapi-error-handling.md](./fastapi-error-handling.md)** - Error management
   - HTTPException
   - Custom handlers
   - Validation errors

8. **[fastapi-ml-deployment.md](./fastapi-ml-deployment.md)** - Deploy ML models
   - Model loading
   - Prediction endpoints
   - Batch predictions

9. **[fastapi-practical-examples.md](./fastapi-practical-examples.md)** - Complete examples
   - Full CRUD API
   - File handling
   - Background tasks

10. **[fastapi-interview-questions.md](./fastapi-interview-questions.md)** - Interview prep
    - Comprehensive Q&A
    - FastAPI vs Flask
    - Production considerations

### AWS SageMaker (2 files)

Deploy and manage ML models at scale using AWS SageMaker.

1. **[sagemaker-introduction.md](./sagemaker-introduction.md)** - SageMaker overview
   - Core components
   - When to use SageMaker
   - Getting started

2. **[sagemaker-training-complete.md](./sagemaker-training-complete.md)** - Complete guide
   - Training jobs
   - Hyperparameter tuning
   - Model deployment
   - Batch transform
   - Cost optimization

### Additional Topics (2 files)

1. **[imbalanced-data.md](./imbalanced-data.md)** - Handling imbalanced datasets
   - SMOTE, ADASYN
   - Class weights
   - Evaluation metrics
   - Complete guide with examples

2. **[regex.md](./regex.md)** - Regular expressions
   - Pattern matching
   - Text extraction
   - Data validation
   - Practical examples

## Learning Path

### For Beginners
Start here:
1. fastapi-introduction.md
2. model-explainability-intro.md
3. nosql-mongodb-intro.md

### For Interview Preparation
Focus on these files:
- model-explainability-interview.md
- fastapi-interview-questions.md
- nosql-mongodb-pymongo-interview.md
- imbalanced-data.md (techniques section)
- All interview-specific files

### For Production Deployment
Study in this order:
1. All fastapi-*.md files
2. model-explainability-shap.md
3. sagemaker-training-complete.md
4. nosql-mongodb-crud.md through indexing-aggregation.md

## Quick Decision Guide

### When to Use What?

| Problem | Solution | Files to Study |
|---------|----------|---------------|
| Deploy ML model | FastAPI + SageMaker | fastapi-ml-deployment.md, sagemaker-training-complete.md |
| Explain predictions | SHAP or LIME | model-explainability-shap.md, model-explainability-lime.md |
| Store flexible data | MongoDB | nosql-mongodb-intro.md through pymongo-interview.md |
| Handle class imbalance | SMOTE, class weights | imbalanced-data.md |
| Parse/validate text | Regular expressions | regex.md |
| Real-time API | FastAPI | All fastapi-*.md files |
| Batch predictions | SageMaker | sagemaker-training-complete.md |

## Key Technologies

| Category | Technologies Covered |
|----------|---------------------|
| **Model Deployment** | FastAPI, AWS SageMaker |
| **Explainability** | SHAP, LIME, PDP, Feature Importance |
| **Databases** | MongoDB, PyMongo |
| **Data Preprocessing** | SMOTE, ADASYN, class weights |
| **Text Processing** | Regular expressions, pattern matching |

## Common Workflows

### Deploying an Explainable Model

```
1. Train model with imbalanced data handling (imbalanced-data.md)
   ↓
2. Add SHAP explanations (model-explainability-shap.md)
   ↓
3. Create FastAPI endpoint (fastapi-ml-deployment.md)
   ↓
4. Deploy to SageMaker (sagemaker-training-complete.md)
   ↓
5. Store predictions in MongoDB (nosql-mongodb-crud.md)
```

### Building a Complete ML API

```
1. Setup FastAPI project (fastapi-introduction.md)
   ↓
2. Define Pydantic models (fastapi-pydantic-models.md)
   ↓
3. Add ML prediction endpoint (fastapi-ml-deployment.md)
   ↓
4. Implement error handling (fastapi-error-handling.md)
   ↓
5. Add explanation endpoint (model-explainability-shap.md)
```

## Interview Focus Areas

### High Priority Topics
1. **Model Explainability** - SHAP values, feature importance (very common)
2. **Handling Imbalanced Data** - SMOTE, class weights (frequently asked)
3. **FastAPI Basics** - REST API development (practical skill)
4. **MongoDB Queries** - NoSQL operations (data engineering roles)

### Common Interview Questions by Topic

**Model Explainability:**
- What is SHAP and how does it work?
- SHAP vs LIME comparison
- How to explain models in production?

**Imbalanced Data:**
- Techniques to handle class imbalance
- SMOTE algorithm and limitations
- Appropriate evaluation metrics

**FastAPI:**
- FastAPI vs Flask differences
- Async endpoint benefits
- Dependency injection pattern

**MongoDB:**
- SQL vs NoSQL comparison
- When to use document databases
- Aggregation pipeline basics

## Practical Projects

### Project 1: Fraud Detection API
Technologies: Imbalanced data, SHAP, FastAPI
1. Handle imbalanced fraud data
2. Train and explain model
3. Deploy as FastAPI service
4. Add real-time explanations

### Project 2: User Profile System
Technologies: MongoDB, FastAPI
1. Design MongoDB schema
2. Implement CRUD operations
3. Create FastAPI endpoints
4. Add text validation with regex

### Project 3: ML Platform
Technologies: FastAPI, SageMaker, SHAP
1. Train models on SageMaker
2. Deploy with FastAPI
3. Add SHAP explanations
4. Store results in MongoDB

## Time Investment Guide

| Topic | Difficulty | Time to Learn | Priority |
|-------|------------|---------------|----------|
| FastAPI Basics | Medium | 2-3 days | High |
| Model Explainability | Medium-High | 3-4 days | Very High |
| MongoDB | Medium | 2-3 days | Medium |
| Imbalanced Data | Medium | 1-2 days | High |
| AWS SageMaker | High | 4-5 days | Medium-High |
| Regular Expressions | Medium | 1-2 days | Medium |

## Best Practices

### Model Explainability
- Always validate explanations with domain experts
- Use global explanations for debugging
- Use local explanations for individual predictions
- Document explanation methodology

### FastAPI Development
- Use Pydantic for all data validation
- Implement proper error handling
- Add async for I/O operations
- Document APIs with OpenAPI

### MongoDB
- Design schema for read patterns
- Use indexes for performance
- Validate data at application level
- Plan for data growth

### Handling Imbalanced Data
- Try simple techniques first (class weights)
- Use stratified splits
- Choose appropriate metrics (F1, ROC-AUC)
- Consider business costs in evaluation

## Resources

Each file includes:
- Clear concept explanations
- Complete, working code examples
- Real-world use cases
- Production-ready patterns
- Common pitfalls and solutions
- Interview questions and answers
- Best practices and guidelines

---

**Getting Started**: Begin with [fastapi-introduction.md](./fastapi-introduction.md) for deployment skills or [model-explainability-intro.md](./model-explainability-intro.md) for interpretability.

**Previous**: [Back to Main README](../README.md)
