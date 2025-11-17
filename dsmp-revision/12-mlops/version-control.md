# Version Control & Experiment Tracking

## 📋 Table of Contents
1. [Git for ML Projects](#git-for-ml-projects)
2. [Data Version Control (DVC)](#data-version-control-dvc)
3. [Experiment Tracking with MLflow](#experiment-tracking-with-mlflow)
4. [Best Practices](#best-practices)
5. [Common Pitfalls](#common-pitfalls)
6. [Interview Questions](#interview-questions)

---

## Git for ML Projects

### Why Version Control for ML?

```
┌──────────────────────────────────────────────────────────┐
│          ML Project Components to Version                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📁 Code (Python, configs)      → Git                   │
│  📊 Data (datasets, features)   → DVC                   │
│  🤖 Models (weights, artifacts) → DVC + Model Registry  │
│  📈 Experiments (metrics, logs) → MLflow                │
│  🐳 Environment (Docker, deps)  → Git                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Git Workflows for ML

#### 1. Feature Branch Workflow

```
main (production model)
  │
  ├─── feature/improve-accuracy
  │      │
  │      ├── experiment-1
  │      ├── experiment-2
  │      └── experiment-3 (best)
  │
  └─── feature/new-features
         │
         └── add-text-embeddings
```

**Typical ML Git Workflow:**

```bash
# 1. Clone repository
git clone https://github.com/your-org/ml-project.git
cd ml-project

# 2. Create feature branch for experiment
git checkout -b experiment/improve-model-accuracy

# 3. Make changes, train models
# ... edit code, train models ...

# 4. Stage and commit changes
git add src/model.py config/hyperparams.yaml
git commit -m "feat: improve model accuracy with XGBoost

- Changed algorithm from RF to XGBoost
- Tuned hyperparameters (max_depth=6, n_estimators=100)
- Improved validation accuracy from 0.85 to 0.89

Experiment ID: mlflow-run-12345
"

# 5. Push to remote
git push origin experiment/improve-model-accuracy

# 6. Create Pull Request
# ... review, discuss, merge ...

# 7. Merge to main
git checkout main
git pull origin main
```

#### 2. Git Branching Strategy for ML

```
main (stable, production models)
  │
  ├─── develop (integration branch)
  │      │
  │      ├─── feature/data-pipeline-v2
  │      ├─── feature/new-model-architecture
  │      └─── experiment/hyperparameter-tuning
  │
  └─── hotfix/fix-prediction-bug
```

### Essential Git Commands for ML

```bash
# Clone with large file support
git lfs install
git clone https://github.com/your-org/ml-project.git

# Check status
git status

# View changes
git diff
git diff --staged

# Stash changes (save work in progress)
git stash save "WIP: training model"
git stash list
git stash pop

# View commit history
git log --oneline --graph --all
git log --author="your-name" --since="2 weeks ago"

# Tag model versions
git tag -a v1.0.0 -m "Production model v1.0.0 - Accuracy 0.92"
git push origin v1.0.0

# Revert changes (careful in ML!)
git revert <commit-hash>
git reset --hard HEAD~1  # Dangerous! Loses uncommitted work
```

### .gitignore for ML Projects

```bash
# .gitignore example for ML projects

# Data files (use DVC instead)
*.csv
*.parquet
*.feather
data/
datasets/

# Model files (use DVC instead)
*.pkl
*.joblib
*.h5
*.pth
*.ckpt
models/
checkpoints/

# Experiment outputs
logs/
mlruns/
outputs/
wandb/

# Python
__pycache__/
*.py[cod]
*$py.class
.env
venv/
.venv/

# Jupyter
.ipynb_checkpoints/
*.ipynb  # Optional: some teams version notebooks

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Keep structure but ignore contents
!data/.gitkeep
!models/.gitkeep
```

---

## Data Version Control (DVC)

### Why DVC?

Git is not designed for large files (datasets, models). DVC extends Git to handle:
- Large datasets (GB/TB)
- Model files
- Reproducibility
- Experiment tracking

### DVC Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   DVC Architecture                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Local Machine              Remote Storage             │
│  ┌─────────────┐           ┌─────────────┐            │
│  │   .dvc/     │           │  S3 / GCS   │            │
│  │   cache/    │◀────────▶│  / Azure    │            │
│  └─────────────┘           └─────────────┘            │
│        │                                               │
│        ▼                                               │
│  ┌─────────────┐           ┌─────────────┐            │
│  │ data.csv    │           │ Git Remote  │            │
│  │ data.csv.dvc│──────────▶│ (GitHub)    │            │
│  └─────────────┘           └─────────────┘            │
│                                                         │
│  .dvc files are small metadata files versioned in Git  │
│  Actual data is stored in remote storage (S3, etc.)   │
└─────────────────────────────────────────────────────────┘
```

### DVC Setup and Basic Commands

```bash
# Install DVC
pip install dvc dvc-s3  # or dvc-gs, dvc-azure

# Initialize DVC in Git repo
git init
dvc init

# Add remote storage
dvc remote add -d myremote s3://my-bucket/dvc-storage
# or
dvc remote add -d myremote gs://my-bucket/dvc-storage

# Configure credentials (AWS example)
dvc remote modify myremote access_key_id YOUR_KEY
dvc remote modify myremote secret_access_key YOUR_SECRET

# Track data file
dvc add data/train.csv

# This creates:
# - data/train.csv.dvc (metadata file - track in Git)
# - Adds data/train.csv to .gitignore

# Commit DVC file to Git
git add data/train.csv.dvc data/.gitignore
git commit -m "Add training data"

# Push data to remote storage
dvc push

# Push metadata to Git
git push
```

### DVC Workflow: Collaborative Data Science

```
Scenario: Team working on ML project

Developer A:
┌──────────────────────────────────┐
│ 1. Add new dataset               │
│    dvc add data/new_features.csv │
│                                  │
│ 2. Push to DVC remote            │
│    dvc push                      │
│                                  │
│ 3. Commit DVC file to Git        │
│    git add data/new_features.csv.dvc│
│    git commit -m "Add new features" │
│    git push                      │
└──────────────────────────────────┘

Developer B:
┌──────────────────────────────────┐
│ 1. Pull Git changes              │
│    git pull                      │
│                                  │
│ 2. Pull data from DVC            │
│    dvc pull                      │
│    # Now has new_features.csv!   │
└──────────────────────────────────┘
```

### DVC Pipelines

DVC can track entire ML pipelines with dependencies:

```yaml
# dvc.yaml
stages:
  prepare_data:
    cmd: python src/prepare_data.py
    deps:
      - src/prepare_data.py
      - data/raw/dataset.csv
    outs:
      - data/processed/train.csv
      - data/processed/test.csv

  train_model:
    cmd: python src/train.py
    deps:
      - src/train.py
      - data/processed/train.csv
      - config/params.yaml
    params:
      - train.learning_rate
      - train.n_estimators
    outs:
      - models/model.pkl
    metrics:
      - metrics/train_metrics.json:
          cache: false

  evaluate:
    cmd: python src/evaluate.py
    deps:
      - src/evaluate.py
      - models/model.pkl
      - data/processed/test.csv
    metrics:
      - metrics/eval_metrics.json:
          cache: false
```

```bash
# Run entire pipeline
dvc repro

# Run specific stage
dvc repro train_model

# Visualize pipeline
dvc dag
```

**Pipeline DAG:**
```
┌─────────────────┐
│ prepare_data    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  train_model    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   evaluate      │
└─────────────────┘
```

### DVC Parameters and Metrics

```yaml
# params.yaml
prepare:
  train_split: 0.8
  random_seed: 42

train:
  learning_rate: 0.01
  n_estimators: 100
  max_depth: 6
```

```python
# src/train.py
import yaml
import json
from sklearn.ensemble import RandomForestClassifier

# Load parameters
with open('config/params.yaml') as f:
    params = yaml.safe_load(f)

# Train model
model = RandomForestClassifier(
    n_estimators=params['train']['n_estimators'],
    max_depth=params['train']['max_depth'],
    random_state=params['prepare']['random_seed']
)
model.fit(X_train, y_train)

# Save metrics
metrics = {
    'accuracy': accuracy,
    'f1_score': f1,
    'precision': precision
}

with open('metrics/train_metrics.json', 'w') as f:
    json.dump(metrics, f, indent=2)
```

```bash
# Compare experiments
dvc params diff

# Show metrics
dvc metrics show

# Compare metrics across experiments
dvc metrics diff
```

### DVC Experiments

```bash
# Run experiment with different parameters
dvc exp run --set-param train.learning_rate=0.05

# Run multiple experiments
dvc exp run --set-param train.n_estimators=50
dvc exp run --set-param train.n_estimators=100
dvc exp run --set-param train.n_estimators=200

# Show all experiments
dvc exp show

# Compare experiments
dvc exp diff

# Apply best experiment
dvc exp apply <experiment-name>
git add .
git commit -m "Apply best experiment"
```

**DVC Experiments Table:**
```
┌────────────────────────────────────────────────────────┐
│ Experiment │ learning_rate │ n_estimators │ accuracy  │
├────────────────────────────────────────────────────────┤
│ baseline   │ 0.01          │ 100          │ 0.850     │
│ exp-1      │ 0.05          │ 100          │ 0.862     │
│ exp-2      │ 0.01          │ 200          │ 0.871     │
│ exp-3      │ 0.1           │ 50           │ 0.845     │
└────────────────────────────────────────────────────────┘
```

---

## Experiment Tracking with MLflow

### MLflow Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  MLflow Components                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │   MLflow        │  │   MLflow        │              │
│  │   Tracking      │  │   Projects      │              │
│  │                 │  │                 │              │
│  │ • Log params    │  │ • Reproducible  │              │
│  │ • Log metrics   │  │   runs          │              │
│  │ • Log artifacts │  │ • Packaging     │              │
│  └─────────────────┘  └─────────────────┘              │
│                                                          │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │   MLflow        │  │   MLflow        │              │
│  │   Models        │  │   Registry      │              │
│  │                 │  │                 │              │
│  │ • Standard      │  │ • Model         │              │
│  │   format        │  │   versioning    │              │
│  │ • Deployment    │  │ • Stage         │              │
│  └─────────────────┘  └─────────────────┘              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### MLflow Tracking - Basic Example

```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score

# Set experiment
mlflow.set_experiment("customer-churn-prediction")

# Start run
with mlflow.start_run(run_name="random-forest-baseline"):

    # Log parameters
    params = {
        'n_estimators': 100,
        'max_depth': 6,
        'min_samples_split': 2,
        'random_state': 42
    }
    mlflow.log_params(params)

    # Train model
    model = RandomForestClassifier(**params)
    model.fit(X_train, y_train)

    # Predict and evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average='weighted')

    # Log metrics
    mlflow.log_metric("accuracy", accuracy)
    mlflow.log_metric("f1_score", f1)

    # Log model
    mlflow.sklearn.log_model(
        model,
        "model",
        registered_model_name="ChurnPredictor"
    )

    # Log artifacts (plots, files)
    import matplotlib.pyplot as plt
    from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay

    cm = confusion_matrix(y_test, y_pred)
    disp = ConfusionMatrixDisplay(cm)
    disp.plot()
    plt.savefig("confusion_matrix.png")
    mlflow.log_artifact("confusion_matrix.png")

    # Log additional info
    mlflow.set_tag("model_type", "RandomForest")
    mlflow.set_tag("dataset_version", "v2.0")

print(f"Run ID: {mlflow.active_run().info.run_id}")
```

### MLflow UI

```bash
# Start MLflow UI
mlflow ui

# Or specify port
mlflow ui --port 5001

# Or with backend store
mlflow ui --backend-store-uri sqlite:///mlflow.db
```

Access at: http://localhost:5000

### Advanced MLflow: Hyperparameter Tuning

```python
import mlflow
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import RandomForestClassifier

mlflow.set_experiment("hyperparameter-tuning")

# Define parameter grid
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [3, 6, 9],
    'min_samples_split': [2, 5, 10]
}

# Track each combination
for n_est in param_grid['n_estimators']:
    for max_d in param_grid['max_depth']:
        for min_split in param_grid['min_samples_split']:

            with mlflow.start_run(run_name=f"rf_n{n_est}_d{max_d}_s{min_split}"):

                params = {
                    'n_estimators': n_est,
                    'max_depth': max_d,
                    'min_samples_split': min_split,
                    'random_state': 42
                }

                mlflow.log_params(params)

                model = RandomForestClassifier(**params)
                model.fit(X_train, y_train)

                accuracy = model.score(X_test, y_test)
                mlflow.log_metric("accuracy", accuracy)

                # Log model only if accuracy > threshold
                if accuracy > 0.85:
                    mlflow.sklearn.log_model(model, "model")
```

### MLflow with Deep Learning (PyTorch Example)

```python
import mlflow
import mlflow.pytorch
import torch
import torch.nn as nn

mlflow.set_experiment("image-classification")

class CNN(nn.Module):
    def __init__(self, num_classes=10):
        super(CNN, self).__init__()
        self.conv1 = nn.Conv2d(3, 32, 3)
        self.pool = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(32, 64, 3)
        self.fc1 = nn.Linear(64 * 6 * 6, 128)
        self.fc2 = nn.Linear(128, num_classes)

    def forward(self, x):
        x = self.pool(torch.relu(self.conv1(x)))
        x = self.pool(torch.relu(self.conv2(x)))
        x = x.view(-1, 64 * 6 * 6)
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)
        return x

with mlflow.start_run():

    # Log hyperparameters
    params = {
        'epochs': 10,
        'batch_size': 64,
        'learning_rate': 0.001,
        'optimizer': 'Adam'
    }
    mlflow.log_params(params)

    # Create model
    model = CNN()
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=params['learning_rate'])

    # Training loop
    for epoch in range(params['epochs']):
        running_loss = 0.0
        for i, (inputs, labels) in enumerate(trainloader):
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()

        # Log metrics per epoch
        epoch_loss = running_loss / len(trainloader)
        mlflow.log_metric("train_loss", epoch_loss, step=epoch)

    # Evaluate
    model.eval()
    correct = 0
    total = 0
    with torch.no_grad():
        for inputs, labels in testloader:
            outputs = model(inputs)
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    accuracy = correct / total
    mlflow.log_metric("test_accuracy", accuracy)

    # Log model
    mlflow.pytorch.log_model(model, "model")
```

### MLflow Model Registry

```python
import mlflow
from mlflow.tracking import MlflowClient

client = MlflowClient()

# Register model
model_uri = "runs:/<run-id>/model"
mlflow.register_model(model_uri, "ChurnPredictor")

# Transition model to staging
client.transition_model_version_stage(
    name="ChurnPredictor",
    version=1,
    stage="Staging"
)

# Transition to production
client.transition_model_version_stage(
    name="ChurnPredictor",
    version=1,
    stage="Production"
)

# Load model from registry
model_name = "ChurnPredictor"
stage = "Production"

model = mlflow.pyfunc.load_model(f"models:/{model_name}/{stage}")
predictions = model.predict(X_new)
```

**Model Lifecycle:**
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  None    │────▶│ Staging  │────▶│Production│────▶│ Archived │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

---

## Best Practices

### 1. Git Best Practices for ML

```
✅ DO:
- Commit often with descriptive messages
- Use branches for experiments
- Tag model versions
- Include experiment ID in commit messages
- Use .gitignore for large files
- Document model changes in commit messages

❌ DON'T:
- Commit large data/model files to Git
- Push directly to main
- Use vague commit messages ("fixed bug")
- Commit secrets/credentials
- Force push to shared branches
```

### 2. DVC Best Practices

```
✅ DO:
- Track data, models, and large files with DVC
- Use DVC pipelines for reproducibility
- Keep remote storage configured
- Document data versions
- Use meaningful file names

❌ DON'T:
- Track small config files with DVC (use Git)
- Forget to dvc push after dvc add
- Hardcode paths (use relative paths)
- Mix Git and DVC for same file
```

### 3. MLflow Best Practices

```
✅ DO:
- Log all hyperparameters
- Log metrics at each epoch/iteration
- Save model artifacts
- Use descriptive run names
- Tag runs with metadata
- Log training/validation/test metrics separately
- Save plots and visualizations

❌ DON'T:
- Log too many metrics (performance overhead)
- Forget to end runs (mlflow.end_run())
- Use default experiment names
- Log large files as artifacts (use external storage)
```

### 4. Combined Workflow

```
Recommended ML Project Structure:

project/
├── .git/                 # Git repository
├── .dvc/                 # DVC configuration
├── data/
│   ├── raw/             # Original data (DVC tracked)
│   ├── processed/       # Processed data (DVC tracked)
│   └── .gitignore
├── models/              # Trained models (DVC tracked)
├── notebooks/           # Jupyter notebooks (Git tracked)
├── src/                 # Source code (Git tracked)
│   ├── data/
│   ├── features/
│   ├── models/
│   └── visualization/
├── tests/               # Unit tests (Git tracked)
├── mlruns/              # MLflow tracking (Git ignored)
├── dvc.yaml             # DVC pipeline (Git tracked)
├── params.yaml          # Hyperparameters (Git tracked)
├── requirements.txt     # Dependencies (Git tracked)
├── .gitignore
└── README.md
```

---

## Common Pitfalls

### 1. Git Issues

**Problem**: Accidentally committed large file to Git
```bash
# Solution: Remove from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch data/large_file.csv" \
  --prune-empty --tag-name-filter cat -- --all

# Or use BFG Repo Cleaner (easier)
bfg --delete-files large_file.csv
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**Problem**: Merge conflicts in DVC files
```bash
# Solution: Accept theirs and re-pull data
git checkout --theirs data/train.csv.dvc
git add data/train.csv.dvc
dvc checkout data/train.csv.dvc
```

### 2. DVC Issues

**Problem**: DVC push fails
```bash
# Check remote configuration
dvc remote list
dvc remote modify myremote --local access_key_id YOUR_KEY

# Force push
dvc push --force
```

**Problem**: "File not in cache"
```bash
# Fetch from remote
dvc fetch
dvc checkout
```

### 3. MLflow Issues

**Problem**: Cannot find run/experiment
```python
# Specify backend store explicitly
mlflow.set_tracking_uri("file:///path/to/mlruns")
# or
mlflow.set_tracking_uri("http://localhost:5000")
```

**Problem**: Model artifacts too large
```python
# Solution: Log model to external storage
import mlflow.pyfunc

class ModelWrapper(mlflow.pyfunc.PythonModel):
    def load_context(self, context):
        # Load from S3/external storage
        import boto3
        s3 = boto3.client('s3')
        s3.download_file('bucket', 'model.pkl', '/tmp/model.pkl')
        self.model = joblib.load('/tmp/model.pkl')

    def predict(self, context, model_input):
        return self.model.predict(model_input)

mlflow.pyfunc.log_model("model", python_model=ModelWrapper())
```

---

## Interview Questions

### Q1: How do you version control large datasets in ML projects?

**Answer:**

For large datasets, we use **DVC (Data Version Control)** instead of Git because:

1. **Git limitations**: Git is not designed for large files (>100MB). It slows down operations and bloats repository size.

2. **DVC approach**:
   - Stores metadata (small `.dvc` files) in Git
   - Stores actual data in remote storage (S3, GCS, Azure)
   - Provides Git-like commands (add, push, pull)

**Example workflow:**
```bash
# Track dataset
dvc add data/train.csv

# Push to remote storage
dvc push

# Commit metadata to Git
git add data/train.csv.dvc
git commit -m "Add training data v2.0"
git push
```

**Alternative approaches:**
- **Git LFS**: Limited by repository size and slower
- **Cloud storage with versioning**: Manual tracking, no integration with Git
- **Database**: Not suitable for large files

**DVC advantages:**
- Seamless Git integration
- Supports multiple storage backends
- Pipeline tracking
- Experiment management

---

### Q2: Explain MLflow tracking and its components.

**Answer:**

MLflow Tracking is a system for logging experiments, including:

**Components:**

1. **Parameters**: Input values (hyperparameters)
   ```python
   mlflow.log_param("learning_rate", 0.01)
   mlflow.log_params({"n_estimators": 100, "max_depth": 6})
   ```

2. **Metrics**: Output values (accuracy, loss)
   ```python
   mlflow.log_metric("accuracy", 0.92)
   mlflow.log_metric("loss", 0.15, step=epoch)  # Track over time
   ```

3. **Artifacts**: Files (models, plots, data)
   ```python
   mlflow.log_artifact("confusion_matrix.png")
   mlflow.sklearn.log_model(model, "model")
   ```

4. **Tags**: Metadata
   ```python
   mlflow.set_tag("model_type", "RandomForest")
   ```

**Architecture:**
```
MLflow Tracking
├── Backend Store (SQLite/PostgreSQL) - stores runs, params, metrics
└── Artifact Store (S3/local) - stores models, files
```

**Use cases:**
- Compare experiments
- Reproduce results
- Share experiments with team
- Deploy best model

---

### Q3: What's the difference between DVC and MLflow?

**Answer:**

| Aspect | DVC | MLflow |
|--------|-----|--------|
| **Primary Purpose** | Data/model versioning & pipelines | Experiment tracking & model management |
| **What it tracks** | Large files (data, models) | Parameters, metrics, artifacts |
| **Storage** | Remote storage (S3, GCS) | Local or database + artifact store |
| **Git Integration** | Deep (creates .dvc files) | Separate (runs tracked independently) |
| **Pipelines** | Yes (dvc.yaml) | No (but has Projects) |
| **UI** | Limited | Rich web UI |
| **Best for** | Data/model versioning, reproducibility | Comparing experiments, hyperparameter tuning |

**When to use both:**
```
DVC: Version datasets and models
  ↓
MLflow: Track experiments on different data versions
  ↓
Git: Version code and metadata
```

**Example workflow:**
```bash
# DVC: Version data
dvc add data/dataset_v2.csv
git add data/dataset_v2.csv.dvc
git commit -m "Update dataset to v2"

# MLflow: Track experiments on new data
python train.py  # Uses MLflow inside to track runs

# Both work together!
```

---

### Q4: How do you handle model versioning in production?

**Answer:**

**Multi-layered approach:**

1. **Code versioning (Git)**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Model artifact versioning (DVC)**:
   ```bash
   dvc add models/model.pkl
   git add models/model.pkl.dvc
   git commit -m "Model v1.0.0 - accuracy 0.92"
   ```

3. **Model registry (MLflow)**:
   ```python
   # Register model
   mlflow.register_model(
       model_uri="runs:/<run-id>/model",
       name="CustomerChurnPredictor"
   )

   # Transition to production
   client.transition_model_version_stage(
       name="CustomerChurnPredictor",
       version=2,
       stage="Production"
   )
   ```

**Production deployment workflow:**
```
┌──────────────────────────────────────────────────────┐
│ 1. Train model → MLflow tracks run                  │
│ 2. Register in MLflow Registry                      │
│ 3. Version → "Staging"                              │
│ 4. Test in staging environment                      │
│ 5. Version → "Production" (version 2)              │
│ 6. Deploy (load from registry)                      │
│ 7. Monitor performance                              │
│ 8. If issues → Rollback to version 1               │
└──────────────────────────────────────────────────────┘
```

**Loading model in production:**
```python
import mlflow

# Load latest production model
model = mlflow.pyfunc.load_model(
    "models:/CustomerChurnPredictor/Production"
)

predictions = model.predict(data)
```

**Benefits:**
- Easy rollback
- A/B testing (serve multiple versions)
- Reproducibility
- Audit trail

---

### Q5: How do you ensure reproducibility in ML experiments?

**Answer:**

**Reproducibility requires versioning:**

1. **Code** (Git)
2. **Data** (DVC)
3. **Environment** (Docker/conda)
4. **Random seeds** (code)
5. **Hyperparameters** (MLflow/DVC params)

**Complete reproducibility setup:**

```python
# 1. Set random seeds
import random
import numpy as np
import torch

def set_seeds(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)

set_seeds(42)

# 2. Log everything with MLflow
import mlflow

with mlflow.start_run():
    # Log parameters
    mlflow.log_params({
        'seed': 42,
        'train_data_version': 'v2.0',
        'model_architecture': 'ResNet50',
        'learning_rate': 0.001
    })

    # Log data hash
    import hashlib
    data_hash = hashlib.md5(open('data/train.csv','rb').read()).hexdigest()
    mlflow.log_param('data_hash', data_hash)

    # Train model...

    # Log model
    mlflow.pytorch.log_model(model, "model")

    # Log environment
    mlflow.log_artifact("requirements.txt")
```

**DVC for data reproducibility:**
```yaml
# dvc.yaml
stages:
  train:
    cmd: python train.py
    deps:
      - data/train.csv  # DVC tracks exact version
      - src/train.py
    params:
      - train.learning_rate
      - train.epochs
    outs:
      - models/model.pkl
```

**Docker for environment reproducibility:**
```dockerfile
FROM python:3.9
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . /app
WORKDIR /app
CMD ["python", "train.py"]
```

**To reproduce experiment:**
```bash
# 1. Clone code
git checkout <commit-hash>

# 2. Pull data
dvc pull

# 3. Restore environment
docker build -t ml-experiment .
docker run ml-experiment

# 4. Or use MLflow
mlflow run . --version <version>
```

---

**Quick Reference:**

```bash
# Git
git add <file>
git commit -m "message"
git push
git tag v1.0.0

# DVC
dvc add <file>
dvc push
dvc pull
dvc repro

# MLflow
mlflow ui
mlflow.log_param()
mlflow.log_metric()
mlflow.log_model()
```

---

[← Back to Main](./README.md) | [Next: CI/CD & Docker →](./cicd-docker.md)
