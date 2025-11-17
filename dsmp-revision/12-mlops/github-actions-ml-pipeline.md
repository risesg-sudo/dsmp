# Complete ML CI/CD Pipeline with GitHub Actions

## What You'll Learn

This guide presents a production-ready CI/CD pipeline that orchestrates the entire machine learning workflow. You'll see how to coordinate code quality checks, data validation, model training, Docker builds, and deployment across multiple environments. This is the blueprint for automating your ML projects from commit to production.

## The Complete Pipeline Architecture

A full ML pipeline coordinates multiple stages:

```
Code Push → Quality Checks → Data Validation → Model Training
                                                    ↓
            Production ← Staging Deploy ← Docker Build
```

Each stage validates the previous work, ensuring only quality models reach production.

## Complete GitHub Actions ML Workflow

```yaml
# .github/workflows/ml-pipeline.yml
name: ML Model CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  PYTHON_VERSION: '3.9'
  MODEL_NAME: customer-churn-predictor

jobs:
  # Job 1: Code Quality & Unit Tests
  code-quality:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ env.PYTHON_VERSION }}

    - name: Cache pip packages
      uses: actions/cache@v3
      with:
        path: ~/.cache/pip
        key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
        restore-keys: |
          ${{ runner.os }}-pip-

    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-cov black flake8

    - name: Code formatting (Black)
      run: black --check src/

    - name: Linting (Flake8)
      run: flake8 src/ --max-line-length=88

    - name: Run unit tests
      run: |
        pytest tests/unit/ --cov=src --cov-report=xml

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml

  # Job 2: Data Validation
  data-validation:
    runs-on: ubuntu-latest
    needs: code-quality
    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ env.PYTHON_VERSION }}

    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install great-expectations pandas-profiling

    - name: Download data
      run: |
        pip install dvc dvc-s3
        dvc pull data/train.csv
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

    - name: Validate data schema
      run: |
        python tests/data_validation/validate_schema.py

    - name: Check data quality
      run: |
        python tests/data_validation/check_quality.py

    - name: Generate data profile report
      run: |
        python tests/data_validation/profile_data.py

  # Job 3: Model Training & Evaluation
  train-model:
    runs-on: ubuntu-latest
    needs: [code-quality, data-validation]
    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ env.PYTHON_VERSION }}

    - name: Install dependencies
      run: pip install -r requirements.txt

    - name: Pull data with DVC
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      run: |
        pip install dvc dvc-s3
        dvc pull

    - name: Train model
      run: |
        python src/train.py

    - name: Evaluate model
      run: |
        python src/evaluate.py

    - name: Check model performance
      run: |
        python tests/model_tests/check_performance.py

    - name: Upload model artifacts
      uses: actions/upload-artifact@v3
      with:
        name: model
        path: models/

  # Job 4: Build Docker Image
  build-docker:
    runs-on: ubuntu-latest
    needs: train-model
    steps:
    - uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to DockerHub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}

    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: |
          ${{ secrets.DOCKERHUB_USERNAME }}/${{ env.MODEL_NAME }}:latest
          ${{ secrets.DOCKERHUB_USERNAME }}/${{ env.MODEL_NAME }}:${{ github.sha }}
        cache-from: type=registry,ref=${{ secrets.DOCKERHUB_USERNAME }}/${{ env.MODEL_NAME }}:buildcache
        cache-to: type=registry,ref=${{ secrets.DOCKERHUB_USERNAME }}/${{ env.MODEL_NAME }}:buildcache,mode=max

  # Job 5: Deploy to Staging
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build-docker
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Deploy to staging
      run: |
        echo "Deploying to staging..."
        # kubectl apply -f k8s/staging/
        # or: aws ecs update-service...

    - name: Run integration tests
      run: |
        pytest tests/integration/

    - name: Load testing
      run: |
        echo "Running load tests..."
        # locust -f tests/load_test.py

  # Job 6: Deploy to Production
  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://api.example.com
    steps:
    - name: Deploy to production
      run: |
        echo "Deploying to production..."
        # kubectl apply -f k8s/production/

    - name: Smoke tests
      run: |
        curl https://api.example.com/health
```

## Understanding Job Dependencies

The `needs` keyword creates a dependency graph:

```
code-quality ────────┬──────────► train-model
                     │                 │
data-validation ─────┘                 │
                                       ▼
                                 build-docker
                                       │
                                       ▼
                                deploy-staging
                                       │
                                       ▼
                               deploy-production
```

Jobs run in parallel when possible, speeding up the pipeline.

## Conditional Execution

Control when jobs run with conditions:

```yaml
# Only on main branch
if: github.ref == 'refs/heads/main'

# Only on pull requests
if: github.event_name == 'pull_request'

# Only if previous job succeeded
if: success()

# Always run (even if previous failed)
if: always()
```

## Using Environments

Environments add protection rules and secrets:

```yaml
deploy-production:
  environment:
    name: production
    url: https://api.example.com
```

In Settings → Environments, configure:
- Required reviewers (manual approval)
- Wait timer (deployment delay)
- Environment-specific secrets

## Artifacts and Caching

**Artifacts**: Share files between jobs
```yaml
# Upload
- uses: actions/upload-artifact@v3
  with:
    name: model
    path: models/

# Download (in another job)
- uses: actions/download-artifact@v3
  with:
    name: model
```

**Caching**: Speed up repeated operations
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
```

## Matrix Strategy for Multi-Configuration Testing

Test across multiple Python versions or configurations:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.8', '3.9', '3.10']
        model-type: ['rf', 'xgboost', 'lightgbm']
    steps:
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}

    - name: Train model
      run: python train.py --model ${{ matrix.model-type }}
```

This creates 9 jobs (3 Python versions × 3 model types).

## Best Practices

**1. Fail Fast**
Place quick checks (linting) before slow ones (training).

**2. Use Appropriate Runners**
- `ubuntu-latest`: Most ML workloads
- `windows-latest`: Windows-specific testing
- Self-hosted: GPU requirements

**3. Set Timeout**
Prevent stuck jobs:
```yaml
jobs:
  train:
    timeout-minutes: 60
```

**4. Add Status Checks**
Require workflows to pass before merging PRs.

**5. Monitor Workflow Costs**
GitHub Actions provides limited free minutes. Use:
- Caching to reduce build time
- Conditional execution
- Self-hosted runners for intensive tasks

## Common Pitfalls

**Sequential Jobs When Parallel Possible**
Don't create unnecessary dependencies. Run independent jobs in parallel.

**Rebuilding Everything**
Use caching and artifacts to avoid redundant work.

**No Rollback Strategy**
Always tag Docker images with commit SHA for easy rollback.

**Ignoring Failed Tests**
Use branch protection rules to enforce passing tests.

## Quick Reference

```yaml
# Essential workflow patterns

# Job dependency
needs: [job1, job2]

# Conditional execution
if: github.ref == 'refs/heads/main'

# Environment variables
env:
  KEY: value

# Secrets
${{ secrets.SECRET_NAME }}

# Artifacts
upload-artifact@v3 / download-artifact@v3

# Caching
actions/cache@v3

# Matrix builds
strategy:
  matrix:
    version: ['3.8', '3.9']
```

---

**Navigation:**
[← Previous: GitHub Actions Basics](./github-actions-basics.md) | [Next: Data and Model Testing →](./data-model-testing.md)

**Related Topics:**
- [Docker Fundamentals](./docker-fundamentals.md)
- [Docker Best Practices](./docker-best-practices.md)
