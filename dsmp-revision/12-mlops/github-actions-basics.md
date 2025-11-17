# GitHub Actions Basics for ML

## What You'll Learn

GitHub Actions transforms your repository into an automation powerhouse. This guide shows you how to set up basic workflows for machine learning projects, from simple code quality checks to coordinated multi-step pipelines. You'll learn to automate the tedious tasks that consume valuable development time.

## Understanding GitHub Actions

GitHub Actions is a CI/CD platform built into GitHub. Every push, pull request, or schedule can trigger automated workflows that test, build, and deploy your ML models.

### Basic Workflow Structure

A workflow consists of:
- **Triggers**: Events that start the workflow (push, pull request, schedule)
- **Jobs**: Sets of steps that run on the same runner
- **Steps**: Individual tasks within a job
- **Actions**: Reusable units of code

## Your First ML Workflow

Let's start with a simple workflow that runs tests on every push:

```yaml
# .github/workflows/ci.yml
name: ML CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'

    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt

    - name: Run tests
      run: |
        pytest tests/
```

This workflow:
1. Triggers on pushes to main/develop and pull requests to main
2. Runs on Ubuntu Linux
3. Checks out your code
4. Sets up Python 3.9
5. Installs dependencies
6. Runs pytest

## Code Quality Workflow

Code quality checks catch issues before they reach production:

```yaml
# .github/workflows/code-quality.yml
name: Code Quality

on: [push, pull_request]

jobs:
  code-quality:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'

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
```

### Key Features Explained

**Caching Dependencies**
The cache action speeds up builds by reusing pip packages:
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
```

**Multiple Steps**
Each step runs sequentially. If one fails, the workflow stops.

**Code Coverage**
Upload coverage reports to track test completeness over time.

## Data Validation Workflow

ML projects need data quality checks:

```yaml
# .github/workflows/data-validation.yml
name: Data Validation

on:
  push:
    branches: [ main ]
    paths:
      - 'data/**'
      - 'tests/data_validation/**'

jobs:
  validate-data:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'

    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install great-expectations pandas-profiling

    - name: Download data
      run: |
        # Use DVC or download from S3
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
```

### Path Filters

The `paths` filter runs the workflow only when specific files change:
```yaml
on:
  push:
    paths:
      - 'data/**'
      - 'tests/data_validation/**'
```

This saves resources by not running data validation when only code changes.

## Using Secrets

Never hardcode credentials! GitHub Actions provides secure secret storage:

**Adding secrets:**
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, etc.

**Using secrets in workflows:**
```yaml
env:
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## Job Dependencies

Run jobs in sequence using `needs`:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Run tests
        run: pytest tests/

  train:
    needs: test  # Waits for test job to complete
    runs-on: ubuntu-latest
    steps:
      - name: Train model
        run: python train.py

  deploy:
    needs: [test, train]  # Waits for both
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        run: ./deploy.sh
```

## When to Use GitHub Actions

**Perfect for:**
- Unit tests and linting
- Small model training (< 10 minutes)
- Building Docker images
- Data validation
- Deployment automation

**Not suitable for:**
- Long model training (> 2 hours)
- Large GPU requirements
- Very large datasets
- Complex infrastructure management

## Best Practices

**1. Keep Workflows Fast**
- Cache dependencies
- Use matrix builds for parallel testing
- Run expensive operations only on main branch

**2. Use Matrix Builds**
Test across multiple Python versions:
```yaml
strategy:
  matrix:
    python-version: ['3.8', '3.9', '3.10']
```

**3. Add Status Badges**
Show build status in your README:
```markdown
![CI](https://github.com/username/repo/workflows/CI/badge.svg)
```

**4. Use Environments**
Separate staging and production deployments:
```yaml
environment:
  name: production
  url: https://api.example.com
```

## Common Pitfalls

**Hardcoding Values**
Use environment variables and secrets instead.

**No Error Handling**
Add `continue-on-error: true` for non-critical steps:
```yaml
- name: Optional step
  run: some-command
  continue-on-error: true
```

**Forgetting Dependencies**
Always install required packages before using them.

**Long-Running Jobs**
GitHub Actions has a 6-hour timeout per job. Split long operations.

## Quick Reference

```bash
# Workflow file location
.github/workflows/your-workflow.yml

# Common triggers
on: push                    # Any push
on: pull_request           # Any PR
on: [push, pull_request]   # Both
on:
  schedule:
    - cron: '0 0 * * *'    # Daily at midnight

# Common actions
actions/checkout@v3         # Clone repository
actions/setup-python@v4     # Install Python
actions/cache@v3           # Cache dependencies
actions/upload-artifact@v3  # Save artifacts
```

---

**Navigation:**
[← Previous: CI/CD Concepts](./cicd-concepts.md) | [Next: GitHub Actions ML Pipeline →](./github-actions-ml-pipeline.md)

**Related Topics:**
- [Data and Model Testing](./data-model-testing.md)
- [Docker Best Practices](./docker-best-practices.md)
