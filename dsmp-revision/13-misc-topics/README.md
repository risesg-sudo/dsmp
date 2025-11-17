# Miscellaneous Topics - DSMP 2.0 Revision Notes

## 📚 Overview

This module covers essential miscellaneous topics that are crucial for real-world data science applications. These topics complement the core ML curriculum and address practical challenges in production environments.

## 📂 Table of Contents

### 1. [Handling Imbalanced Data](./imbalanced-data.md)
Learn techniques to handle imbalanced datasets commonly found in fraud detection, medical diagnosis, and anomaly detection.

**Key Topics:**
- SMOTE (Synthetic Minority Over-sampling Technique)
- ADASYN (Adaptive Synthetic Sampling)
- Undersampling techniques
- Oversampling techniques
- Class weights
- Stratified sampling
- Evaluation metrics for imbalanced data

**Use Cases:** Credit card fraud detection, disease prediction, churn prediction

---

### 2. [Regular Expressions](./regex.md)
Master pattern matching and text processing using regular expressions for data cleaning and feature extraction.

**Key Topics:**
- Metacharacters and special sequences
- Groups and capturing
- Lookahead and lookbehind
- Common patterns (email, phone, URLs)
- Text extraction and validation
- Python re module

**Use Cases:** Log parsing, data validation, text preprocessing, web scraping

---

### 3. [NoSQL Databases - MongoDB](./nosql-mongodb.md)
Understand document-based NoSQL databases and when to use them over traditional SQL databases.

**Key Topics:**
- Document structure and collections
- CRUD operations
- Indexing and performance
- Aggregation pipeline
- NoSQL vs SQL comparison
- Data modeling in MongoDB
- PyMongo basics

**Use Cases:** User profiles, product catalogs, real-time analytics, IoT data

---

### 4. [Model Explainability](./model-explainability.md)
Learn techniques to interpret and explain machine learning model predictions for stakeholders and regulatory compliance.

**Key Topics:**
- LIME (Local Interpretable Model-agnostic Explanations)
- SHAP (SHapley Additive exPlanations)
- Feature importance
- Partial Dependence Plots (PDP)
- Permutation importance
- Global vs Local interpretability

**Use Cases:** Credit scoring, medical diagnosis, loan approval, hiring decisions

---

### 5. [FastAPI Basics](./fastapi.md)
Build high-performance REST APIs for ML model deployment and data services.

**Key Topics:**
- Creating API endpoints
- Request/Response models with Pydantic
- Async endpoints
- Automatic documentation (Swagger/OpenAPI)
- Dependency injection
- Error handling
- Model serving

**Use Cases:** ML model deployment, microservices, data pipelines, real-time predictions

---

### 6. [AWS SageMaker](./aws-sagemaker.md)
Deploy and manage machine learning models at scale using AWS SageMaker.

**Key Topics:**
- Training jobs
- Hyperparameter tuning
- Model deployment and endpoints
- Built-in algorithms
- Batch transform
- Monitoring and logging
- Cost optimization

**Use Cases:** Production ML systems, batch predictions, A/B testing, model versioning

---

## 🎯 Learning Path

```
┌─────────────────────────────────────────────────────────────┐
│                    Miscellaneous Topics                     │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  Data Prep   │  │   ML Ops     │  │  Dev Tools   │
    └──────────────┘  └──────────────┘  └──────────────┘
            │                 │                 │
    ┌───────┴────────┐  ┌─────┴─────┐  ┌───────┴────────┐
    │                │  │           │  │                │
    ▼                ▼  ▼           ▼  ▼                ▼
Imbalanced      NoSQL  Model    SageMaker  FastAPI   RegEx
  Data         MongoDB Explain
```

## 🔥 Most Important Topics

### For Interviews:
1. **Handling Imbalanced Data** - Very frequently asked
2. **Model Explainability** - Increasingly important
3. **Regular Expressions** - Common coding questions

### For Production:
1. **FastAPI** - API development and model serving
2. **AWS SageMaker** - Cloud deployment
3. **NoSQL Databases** - Scalable data storage

## 💡 Quick Reference

### When to Use What?

| Scenario | Technique | File |
|----------|-----------|------|
| Fraud detection (imbalanced) | SMOTE + Class weights | imbalanced-data.md |
| Extract emails from text | Regular expressions | regex.md |
| Store user profiles | MongoDB | nosql-mongodb.md |
| Explain model predictions | SHAP/LIME | model-explainability.md |
| Deploy ML model | FastAPI + SageMaker | fastapi.md, aws-sagemaker.md |
| Parse log files | Regular expressions | regex.md |
| Real-time predictions | FastAPI | fastapi.md |
| Batch predictions | SageMaker Batch Transform | aws-sagemaker.md |

## 📊 Topic Difficulty & Time Investment

```
Topic                    Difficulty    Time to Master    Industry Relevance
─────────────────────────────────────────────────────────────────────────────
Imbalanced Data          ⭐⭐⭐         2-3 days          ⭐⭐⭐⭐⭐
Regular Expressions      ⭐⭐⭐⭐        3-4 days          ⭐⭐⭐⭐
NoSQL/MongoDB            ⭐⭐⭐         2-3 days          ⭐⭐⭐⭐
Model Explainability     ⭐⭐⭐⭐        4-5 days          ⭐⭐⭐⭐⭐
FastAPI                  ⭐⭐⭐         2-3 days          ⭐⭐⭐⭐⭐
AWS SageMaker            ⭐⭐⭐⭐⭐      5-7 days          ⭐⭐⭐⭐⭐
```

## 🎓 Interview Preparation

### High Priority Topics:
1. SMOTE and handling imbalanced data
2. SHAP values and model explainability
3. Regular expressions for data cleaning
4. FastAPI for model deployment

### Common Interview Questions:
- How do you handle imbalanced datasets?
- Explain SMOTE. What are its limitations?
- What is SHAP? How does it differ from LIME?
- How would you deploy an ML model in production?
- When would you use NoSQL over SQL?
- Write a regex to validate email addresses

## 🔗 Cross-References

These topics connect with:
- **Feature Engineering** - Text processing with regex
- **MLOps** - Model deployment with FastAPI and SageMaker
- **ML Algorithms** - Handling imbalanced data affects model training
- **Statistics** - Understanding SHAP values and permutation importance
- **SQL** - Comparison with NoSQL databases

## 📝 Practice Projects

1. **Fraud Detection System**
   - Use imbalanced data techniques
   - Deploy with FastAPI
   - Add SHAP explainability

2. **Log Analysis Tool**
   - Parse logs with regex
   - Store in MongoDB
   - Create dashboard

3. **ML Model Deployment**
   - Train model locally
   - Deploy to SageMaker
   - Create FastAPI wrapper
   - Add monitoring

## 🚀 Quick Start

Each file is self-contained with:
- ✅ Complete code examples
- ✅ Real-world use cases
- ✅ Interview Q&A
- ✅ Best practices
- ✅ Common pitfalls
- ✅ Comparison tables

**Start with topics most relevant to your goals:**
- **Preparing for interviews?** → Start with Imbalanced Data & Model Explainability
- **Building production systems?** → Start with FastAPI & AWS SageMaker
- **Data engineering focus?** → Start with NoSQL & Regular Expressions

---

## 📚 Additional Resources

- Official documentation links in each file
- Practice problems and solutions
- Real-world case studies
- Code repositories and templates

---

**Navigation:** [← Back to Main Index](../README.md) | [Imbalanced Data →](./imbalanced-data.md)
