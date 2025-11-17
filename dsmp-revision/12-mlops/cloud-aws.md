# Cloud Infrastructure - AWS for ML

## 📋 Table of Contents
1. [AWS Fundamentals](#aws-fundamentals)
2. [Core AWS Services for ML](#core-aws-services-for-ml)
3. [AWS SageMaker](#aws-sagemaker)
4. [IAM and Security](#iam-and-security)
5. [Cost Optimization](#cost-optimization)
6. [Best Practices](#best-practices)
7. [Common Pitfalls](#common-pitfalls)
8. [Interview Questions](#interview-questions)

---

## AWS Fundamentals

### AWS Global Infrastructure

```
┌─────────────────────────────────────────────────────┐
│            AWS Global Infrastructure                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Region (e.g., us-east-1)                          │
│  ┌────────────────────────────────────────────┐    │
│  │  Availability Zone 1    AZ 2       AZ 3    │    │
│  │  ┌──────────────┐   ┌────────┐  ┌───────┐ │    │
│  │  │ Data Center  │   │  Data  │  │ Data  │ │    │
│  │  │    Cluster   │   │ Center │  │Center │ │    │
│  │  └──────────────┘   └────────┘  └───────┘ │    │
│  └────────────────────────────────────────────┘    │
│                                                     │
│  • Regions are geographically isolated             │
│  • Each region has multiple AZs                    │
│  • AZs are physically separated                    │
│  • High availability across AZs                    │
└─────────────────────────────────────────────────────┘
```

### Key AWS Concepts

| Concept | Description | Example |
|---------|-------------|---------|
| **Region** | Geographic location | us-east-1 (N. Virginia) |
| **Availability Zone (AZ)** | Isolated data center within region | us-east-1a, us-east-1b |
| **VPC** | Virtual Private Cloud | Isolated network |
| **Subnet** | Range of IP addresses in VPC | Public/Private subnets |
| **Security Group** | Virtual firewall | Allow HTTP, SSH |
| **IAM** | Identity & Access Management | Users, roles, policies |

---

## Core AWS Services for ML

### Service Overview

```
┌──────────────────────────────────────────────────────────┐
│              AWS ML Stack                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Data Storage & Processing                              │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │   S3   │  │  RDS   │  │DynamoDB│  │ Redshift│       │
│  └────────┘  └────────┘  └────────┘  └────────┘       │
│                                                          │
│  Compute                                                 │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │  EC2   │  │Lambda  │  │  ECS   │  │  EKS   │       │
│  └────────┘  └────────┘  └────────┘  └────────┘       │
│                                                          │
│  ML Services                                             │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │SageMaker│ │Rekognition│ │Comprehend│ │Forecast│      │
│  └────────┘  └────────┘  └────────┘  └────────┘       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 1. Amazon S3 (Simple Storage Service)

**Use cases for ML:**
- Store datasets (raw, processed)
- Store model artifacts
- Data lake for ML pipelines
- MLflow artifact storage

**Key features:**
- Virtually unlimited storage
- 99.999999999% (11 9's) durability
- Different storage classes (Standard, IA, Glacier)
- Versioning support

#### S3 with Python (boto3)

```python
import boto3
import pandas as pd
from io import StringIO

# Initialize S3 client
s3 = boto3.client('s3',
    aws_access_key_id='YOUR_KEY',
    aws_secret_access_key='YOUR_SECRET',
    region_name='us-east-1'
)

# Upload file
s3.upload_file('local_data.csv', 'my-ml-bucket', 'data/train.csv')

# Upload from memory
df = pd.DataFrame({'a': [1, 2, 3], 'b': [4, 5, 6]})
csv_buffer = StringIO()
df.to_csv(csv_buffer, index=False)
s3.put_object(Bucket='my-ml-bucket', Key='data/dataframe.csv', Body=csv_buffer.getvalue())

# Download file
s3.download_file('my-ml-bucket', 'data/train.csv', 'local_data.csv')

# Read directly into pandas
obj = s3.get_object(Bucket='my-ml-bucket', Key='data/train.csv')
df = pd.read_csv(obj['Body'])

# List objects
response = s3.list_objects_v2(Bucket='my-ml-bucket', Prefix='models/')
for obj in response.get('Contents', []):
    print(obj['Key'])

# Delete object
s3.delete_object(Bucket='my-ml-bucket', Key='data/old_data.csv')

# Generate presigned URL (temporary access)
url = s3.generate_presigned_url(
    'get_object',
    Params={'Bucket': 'my-ml-bucket', 'Key': 'models/model.pkl'},
    ExpiresIn=3600  # 1 hour
)
```

#### S3 Storage Classes

| Class | Use Case | Cost |
|-------|----------|------|
| **Standard** | Frequently accessed data | $$$ |
| **Intelligent-Tiering** | Unknown/changing access patterns | $$-$$$ |
| **Standard-IA** | Infrequent access | $$ |
| **Glacier** | Long-term archive | $ |
| **Glacier Deep Archive** | Rarely accessed archive | $ |

**Example lifecycle policy:**
```python
# Move old model artifacts to Glacier
lifecycle_config = {
    'Rules': [
        {
            'Id': 'MoveOldModels',
            'Prefix': 'models/archived/',
            'Status': 'Enabled',
            'Transitions': [
                {
                    'Days': 30,
                    'StorageClass': 'GLACIER'
                }
            ]
        }
    ]
}

s3.put_bucket_lifecycle_configuration(
    Bucket='my-ml-bucket',
    LifecycleConfiguration=lifecycle_config
)
```

### 2. Amazon EC2 (Elastic Compute Cloud)

**Use cases for ML:**
- Training models
- Model serving
- Data processing
- GPU instances for deep learning

#### EC2 Instance Types for ML

| Type | Description | Use Case | Example |
|------|-------------|----------|---------|
| **c5** | Compute optimized | Batch inference | c5.2xlarge |
| **m5** | General purpose | API servers | m5.large |
| **r5** | Memory optimized | Large datasets in memory | r5.xlarge |
| **p3/p4** | GPU (NVIDIA V100/A100) | Deep learning training | p3.2xlarge |
| **inf1** | AWS Inferentia chips | Cost-effective inference | inf1.xlarge |
| **g4** | GPU (NVIDIA T4) | ML inference, graphics | g4dn.xlarge |

#### Launch EC2 Instance

```python
import boto3

ec2 = boto3.client('ec2', region_name='us-east-1')

# Launch instance
response = ec2.run_instances(
    ImageId='ami-0c55b159cbfafe1f0',  # Ubuntu 20.04
    InstanceType='p3.2xlarge',         # GPU instance
    KeyName='my-key-pair',
    MinCount=1,
    MaxCount=1,
    SecurityGroupIds=['sg-12345678'],
    SubnetId='subnet-12345678',
    TagSpecifications=[
        {
            'ResourceType': 'instance',
            'Tags': [
                {'Key': 'Name', 'Value': 'ML-Training-Instance'},
                {'Key': 'Project', 'Value': 'MLOps'}
            ]
        }
    ],
    UserData='''#!/bin/bash
    apt-get update
    apt-get install -y python3-pip
    pip3 install torch torchvision
    '''
)

instance_id = response['Instances'][0]['InstanceId']
print(f"Instance ID: {instance_id}")

# Wait for instance to be running
waiter = ec2.get_waiter('instance_running')
waiter.wait(InstanceIds=[instance_id])

# Get instance details
response = ec2.describe_instances(InstanceIds=[instance_id])
public_ip = response['Reservations'][0]['Instances'][0]['PublicIpAddress']
print(f"Public IP: {public_ip}")

# Stop instance
ec2.stop_instances(InstanceIds=[instance_id])

# Terminate instance
ec2.terminate_instances(InstanceIds=[instance_id])
```

#### Connect to EC2

```bash
# SSH to instance
ssh -i my-key-pair.pem ubuntu@<public-ip>

# Transfer files
scp -i my-key-pair.pem local_file.py ubuntu@<public-ip>:/home/ubuntu/

# Run training script
ssh -i my-key-pair.pem ubuntu@<public-ip> 'python3 train.py'
```

#### EC2 User Data Script

```bash
#!/bin/bash
# Runs when instance starts

# Update system
apt-get update && apt-get upgrade -y

# Install Python and pip
apt-get install -y python3-pip python3-dev

# Install NVIDIA drivers and CUDA (for GPU instances)
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/cuda-ubuntu2004.pin
mv cuda-ubuntu2004.pin /etc/apt/preferences.d/cuda-repository-pin-600
apt-key adv --fetch-keys https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/3bf863cc.pub
add-apt-repository "deb https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/ /"
apt-get update
apt-get -y install cuda

# Install ML libraries
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip3 install scikit-learn pandas numpy mlflow

# Download training script from S3
aws s3 cp s3://my-ml-bucket/scripts/train.py /home/ubuntu/train.py

# Run training
cd /home/ubuntu
python3 train.py

# Upload results to S3
aws s3 cp models/ s3://my-ml-bucket/models/ --recursive

# Shutdown instance after training (optional)
shutdown -h now
```

### 3. AWS Lambda

**Use cases for ML:**
- Serverless inference (small models)
- Data preprocessing
- Trigger model retraining
- API endpoints

**Limitations:**
- Max execution time: 15 minutes
- Max memory: 10 GB
- Max package size: 250 MB (unzipped)

#### Lambda Function Example

```python
# lambda_function.py
import json
import boto3
import pickle
import numpy as np

# Load model (from /tmp or S3)
s3 = boto3.client('s3')
s3.download_file('my-ml-bucket', 'models/model.pkl', '/tmp/model.pkl')

with open('/tmp/model.pkl', 'rb') as f:
    model = pickle.load(f)

def lambda_handler(event, context):
    """
    Lambda handler for model predictions

    Event format:
    {
        "features": [1, 2, 3, 4, 5]
    }
    """
    try:
        # Parse input
        features = event['features']
        features = np.array(features).reshape(1, -1)

        # Predict
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0].tolist()

        # Return response
        return {
            'statusCode': 200,
            'body': json.dumps({
                'prediction': int(prediction),
                'probability': probability
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

#### Deploy Lambda with AWS CLI

```bash
# Package code
zip lambda_function.zip lambda_function.py

# Create Lambda function
aws lambda create-function \
    --function-name ml-predictor \
    --runtime python3.9 \
    --role arn:aws:iam::123456789012:role/lambda-execution-role \
    --handler lambda_function.lambda_handler \
    --zip-file fileb://lambda_function.zip \
    --timeout 30 \
    --memory-size 512

# Update function code
aws lambda update-function-code \
    --function-name ml-predictor \
    --zip-file fileb://lambda_function.zip

# Invoke function
aws lambda invoke \
    --function-name ml-predictor \
    --payload '{"features": [1, 2, 3, 4, 5]}' \
    response.json

cat response.json
```

#### Lambda with API Gateway

```yaml
# SAM template (serverless.yaml)
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  MLPredictorFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: ml-predictor
      Runtime: python3.9
      Handler: lambda_function.lambda_handler
      CodeUri: ./
      MemorySize: 1024
      Timeout: 30
      Environment:
        Variables:
          MODEL_BUCKET: my-ml-bucket
          MODEL_KEY: models/model.pkl
      Events:
        PredictAPI:
          Type: Api
          Properties:
            Path: /predict
            Method: post
```

```bash
# Deploy with SAM
sam build
sam deploy --guided
```

### 4. Amazon RDS (Relational Database Service)

**Use cases for ML:**
- Store training metadata
- Store predictions
- MLflow backend store
- Feature store

```python
import psycopg2
import pandas as pd

# Connect to RDS PostgreSQL
conn = psycopg2.connect(
    host='my-db-instance.abc123.us-east-1.rds.amazonaws.com',
    port=5432,
    database='mlops',
    user='admin',
    password='password'
)

# Create table
cursor = conn.cursor()
cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        features JSONB,
        prediction INTEGER,
        probability FLOAT,
        model_version VARCHAR(50)
    )
""")
conn.commit()

# Insert prediction
cursor.execute("""
    INSERT INTO predictions (features, prediction, probability, model_version)
    VALUES (%s, %s, %s, %s)
""", (
    '{"age": 35, "income": 50000}',
    1,
    0.85,
    'v1.2.0'
))
conn.commit()

# Query predictions
df = pd.read_sql("SELECT * FROM predictions WHERE prediction = 1", conn)
print(df)

# Close connection
conn.close()
```

---

## AWS SageMaker

**Amazon SageMaker** is a fully managed ML platform.

```
┌──────────────────────────────────────────────────────┐
│         SageMaker Components                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────┐  ┌──────────────────┐         │
│  │ SageMaker Studio │  │  SageMaker       │         │
│  │ (IDE for ML)     │  │  Notebooks       │         │
│  └──────────────────┘  └──────────────────┘         │
│                                                      │
│  ┌──────────────────┐  ┌──────────────────┐         │
│  │ SageMaker        │  │  SageMaker       │         │
│  │ Training         │  │  Endpoints       │         │
│  └──────────────────┘  └──────────────────┘         │
│                                                      │
│  ┌──────────────────┐  ┌──────────────────┐         │
│  │ SageMaker        │  │  SageMaker       │         │
│  │ Pipelines        │  │  Model Monitor   │         │
│  └──────────────────┘  └──────────────────┘         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### SageMaker Training

```python
import sagemaker
from sagemaker.sklearn import SKLearn

# Initialize SageMaker session
sagemaker_session = sagemaker.Session()
role = 'arn:aws:iam::123456789012:role/SageMakerRole'

# Define estimator
sklearn_estimator = SKLearn(
    entry_point='train.py',
    role=role,
    instance_type='ml.m5.xlarge',
    framework_version='1.0-1',
    hyperparameters={
        'n_estimators': 100,
        'max_depth': 6
    }
)

# Train model
sklearn_estimator.fit({'train': 's3://my-bucket/data/train.csv'})

# Get model artifacts
model_data = sklearn_estimator.model_data
print(f"Model saved to: {model_data}")
```

**Training script (train.py):**
```python
import argparse
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    # Hyperparameters
    parser.add_argument('--n_estimators', type=int, default=100)
    parser.add_argument('--max_depth', type=int, default=6)

    # SageMaker directories
    parser.add_argument('--train', type=str, default='/opt/ml/input/data/train')
    parser.add_argument('--model_dir', type=str, default='/opt/ml/model')

    args = parser.parse_args()

    # Load data
    train_df = pd.read_csv(f"{args.train}/train.csv")
    X_train = train_df.drop('target', axis=1)
    y_train = train_df['target']

    # Train model
    model = RandomForestClassifier(
        n_estimators=args.n_estimators,
        max_depth=args.max_depth
    )
    model.fit(X_train, y_train)

    # Evaluate
    accuracy = model.score(X_train, y_train)
    print(f"Training accuracy: {accuracy}")

    # Save model
    joblib.dump(model, f"{args.model_dir}/model.pkl")
```

### SageMaker Endpoints

```python
# Deploy model
predictor = sklearn_estimator.deploy(
    initial_instance_count=1,
    instance_type='ml.m5.large'
)

# Make prediction
import numpy as np
data = np.array([[1, 2, 3, 4, 5]])
prediction = predictor.predict(data)
print(prediction)

# Delete endpoint (to avoid charges)
predictor.delete_endpoint()
```

### SageMaker Pipelines

```python
from sagemaker.workflow.pipeline import Pipeline
from sagemaker.workflow.steps import TrainingStep, ProcessingStep
from sagemaker.workflow.parameters import ParameterInteger

# Define parameters
n_estimators_param = ParameterInteger(name="NEstimators", default_value=100)

# Define training step
train_step = TrainingStep(
    name="TrainModel",
    estimator=sklearn_estimator,
    inputs={'train': 's3://my-bucket/data/train.csv'}
)

# Create pipeline
pipeline = Pipeline(
    name="MLPipeline",
    parameters=[n_estimators_param],
    steps=[train_step]
)

# Submit pipeline
pipeline.upsert(role_arn=role)
execution = pipeline.start()
```

---

## IAM and Security

### IAM Concepts

```
┌──────────────────────────────────────────────────┐
│            IAM Components                        │
├──────────────────────────────────────────────────┤
│                                                  │
│  User → Person/Application                      │
│    │                                             │
│    ├─ Has credentials (password/access keys)    │
│    └─ Attached policies                         │
│                                                  │
│  Group → Collection of users                    │
│    └─ Attached policies (inherited by users)    │
│                                                  │
│  Role → Assumed by AWS services/users           │
│    └─ Temporary credentials                     │
│                                                  │
│  Policy → JSON document defining permissions    │
│    ├─ Allow/Deny actions                        │
│    └─ On specific resources                     │
│                                                  │
└──────────────────────────────────────────────────┘
```

### IAM Policy Example

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-ml-bucket",
        "arn:aws:s3:::my-ml-bucket/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "sagemaker:CreateTrainingJob",
        "sagemaker:CreateEndpoint",
        "sagemaker:DescribeEndpoint"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Deny",
      "Action": "s3:DeleteBucket",
      "Resource": "*"
    }
  ]
}
```

### Create IAM Role for EC2

```python
import boto3
import json

iam = boto3.client('iam')

# Define trust policy (who can assume the role)
trust_policy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {"Service": "ec2.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }
    ]
}

# Create role
role = iam.create_role(
    RoleName='MLOpsEC2Role',
    AssumeRolePolicyDocument=json.dumps(trust_policy),
    Description='Role for ML training EC2 instances'
)

# Attach policies
iam.attach_role_policy(
    RoleName='MLOpsEC2Role',
    PolicyArn='arn:aws:iam::aws:policy/AmazonS3FullAccess'
)

iam.attach_role_policy(
    RoleName='MLOpsEC2Role',
    PolicyArn='arn:aws:iam::aws:policy/AmazonSageMakerFullAccess'
)
```

### Security Best Practices

1. **Use IAM roles instead of access keys** (for EC2, Lambda, etc.)
2. **Principle of least privilege** (only necessary permissions)
3. **Enable MFA** for root account and IAM users
4. **Rotate credentials regularly**
5. **Use AWS Secrets Manager** for sensitive data
6. **Enable CloudTrail** for audit logging
7. **Encrypt data at rest and in transit**

```python
# Use AWS Secrets Manager
import boto3

secrets = boto3.client('secretsmanager')

# Store secret
secrets.create_secret(
    Name='ml-api-key',
    SecretString='your-secret-key'
)

# Retrieve secret
response = secrets.get_secret_value(SecretId='ml-api-key')
api_key = response['SecretString']
```

---

## Cost Optimization

### Cost Components

```
┌──────────────────────────────────────────────────┐
│            AWS Cost Breakdown (ML)               │
├──────────────────────────────────────────────────┤
│                                                  │
│  1. Compute (EC2, SageMaker)     40-60%         │
│     • Instance hours                             │
│     • GPU instances ($$$)                        │
│                                                  │
│  2. Storage (S3, EBS)            20-30%         │
│     • Data storage                               │
│     • Model artifacts                            │
│                                                  │
│  3. Data Transfer                5-15%          │
│     • Outbound data transfer                     │
│     • Cross-region transfer                      │
│                                                  │
│  4. Other Services               10-20%         │
│     • RDS, Lambda, API Gateway                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Cost Optimization Strategies

#### 1. Use Spot Instances

Save up to 90% on EC2/SageMaker costs.

```python
# SageMaker with Spot instances
sklearn_estimator = SKLearn(
    entry_point='train.py',
    role=role,
    instance_type='ml.p3.2xlarge',
    use_spot_instances=True,
    max_wait=3600,  # Max time to wait for spot
    max_run=3600    # Max training time
)
```

```python
# EC2 Spot instances
ec2.run_instances(
    ImageId='ami-12345678',
    InstanceType='p3.2xlarge',
    InstanceMarketOptions={
        'MarketType': 'spot',
        'SpotOptions': {
            'MaxPrice': '1.00',  # Max price per hour
            'SpotInstanceType': 'one-time'
        }
    }
)
```

#### 2. Auto-Scaling

Scale resources based on demand.

```python
# Auto Scaling for SageMaker Endpoints
import boto3

asg = boto3.client('application-autoscaling')

# Register scalable target
asg.register_scalable_target(
    ServiceNamespace='sagemaker',
    ResourceId='endpoint/ml-model-endpoint/variant/AllTraffic',
    ScalableDimension='sagemaker:variant:DesiredInstanceCount',
    MinCapacity=1,
    MaxCapacity=10
)

# Define scaling policy
asg.put_scaling_policy(
    PolicyName='ml-scaling-policy',
    ServiceNamespace='sagemaker',
    ResourceId='endpoint/ml-model-endpoint/variant/AllTraffic',
    ScalableDimension='sagemaker:variant:DesiredInstanceCount',
    PolicyType='TargetTrackingScaling',
    TargetTrackingScalingPolicyConfiguration={
        'TargetValue': 70.0,
        'PredefinedMetricSpecification': {
            'PredefinedMetricType': 'SageMakerVariantInvocationsPerInstance'
        },
        'ScaleInCooldown': 300,
        'ScaleOutCooldown': 60
    }
)
```

#### 3. S3 Lifecycle Policies

```python
# Move old data to cheaper storage
s3.put_bucket_lifecycle_configuration(
    Bucket='my-ml-bucket',
    LifecycleConfiguration={
        'Rules': [
            {
                'Id': 'Archive old models',
                'Prefix': 'models/',
                'Status': 'Enabled',
                'Transitions': [
                    {'Days': 90, 'StorageClass': 'GLACIER'},
                ],
                'Expiration': {'Days': 365}
            },
            {
                'Id': 'Delete temp files',
                'Prefix': 'temp/',
                'Status': 'Enabled',
                'Expiration': {'Days': 7}
            }
        ]
    }
)
```

#### 4. Reserved Instances

Save up to 75% for long-term workloads.

- **Standard Reserved**: 1 or 3 years
- **Convertible Reserved**: Can change instance type
- **Savings Plans**: Flexible commitment

#### 5. Monitor Costs

```python
# AWS Cost Explorer
import boto3

ce = boto3.client('ce')

# Get cost and usage
response = ce.get_cost_and_usage(
    TimePeriod={
        'Start': '2024-01-01',
        'End': '2024-01-31'
    },
    Granularity='DAILY',
    Metrics=['UnblendedCost'],
    GroupBy=[
        {'Type': 'SERVICE', 'Key': 'SERVICE'}
    ]
)

for result in response['ResultsByTime']:
    print(f"Date: {result['TimePeriod']['Start']}")
    for group in result['Groups']:
        service = group['Keys'][0]
        cost = group['Metrics']['UnblendedCost']['Amount']
        print(f"  {service}: ${float(cost):.2f}")
```

---

## Best Practices

### 1. Infrastructure as Code

Use CloudFormation or Terraform:

```yaml
# cloudformation.yaml
Resources:
  MLBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: my-ml-bucket
      VersioningConfiguration:
        Status: Enabled
      LifecycleConfiguration:
        Rules:
          - Id: ArchiveOldModels
            Status: Enabled
            Transitions:
              - Days: 90
                StorageClass: GLACIER

  MLTrainingInstance:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: p3.2xlarge
      ImageId: ami-12345678
      IamInstanceProfile: !Ref MLInstanceProfile
      Tags:
        - Key: Name
          Value: ML-Training
```

### 2. Use VPC for Security

```python
# Create VPC for ML workloads
ec2 = boto3.client('ec2')

vpc = ec2.create_vpc(CidrBlock='10.0.0.0/16')
vpc_id = vpc['Vpc']['VpcId']

# Create private subnet
subnet = ec2.create_subnet(
    VpcId=vpc_id,
    CidrBlock='10.0.1.0/24'
)

# Security group (only allow specific IPs)
sg = ec2.create_security_group(
    GroupName='ml-sg',
    Description='Security group for ML instances',
    VpcId=vpc_id
)

ec2.authorize_security_group_ingress(
    GroupId=sg['GroupId'],
    IpPermissions=[
        {
            'IpProtocol': 'tcp',
            'FromPort': 22,
            'ToPort': 22,
            'IpRanges': [{'CidrIp': '203.0.113.0/24'}]  # Your IP
        }
    ]
)
```

### 3. Tagging Strategy

```python
# Tag all resources
tags = [
    {'Key': 'Project', 'Value': 'MLOps'},
    {'Key': 'Environment', 'Value': 'Production'},
    {'Key': 'Team', 'Value': 'DataScience'},
    {'Key': 'CostCenter', 'Value': 'ML-01'}
]

# Apply tags
ec2.create_tags(Resources=[instance_id], Tags=tags)
s3.put_bucket_tagging(Bucket='my-ml-bucket', Tagging={'TagSet': tags})
```

---

## Common Pitfalls

### 1. Forgetting to Stop/Terminate Resources

**Problem**: EC2 instances left running → high costs

**Solution**:
```python
# Auto-shutdown script
# Run via cron or Lambda

import boto3
from datetime import datetime, timedelta

ec2 = boto3.client('ec2')

# Find instances running > 8 hours
instances = ec2.describe_instances(
    Filters=[
        {'Name': 'instance-state-name', 'Values': ['running']},
        {'Name': 'tag:AutoShutdown', 'Values': ['true']}
    ]
)

for reservation in instances['Reservations']:
    for instance in reservation['Instances']:
        launch_time = instance['LaunchTime']
        if datetime.now(launch_time.tzinfo) - launch_time > timedelta(hours=8):
            print(f"Stopping {instance['InstanceId']}")
            ec2.stop_instances(InstanceIds=[instance['InstanceId']])
```

### 2. Using Root Account

**Problem**: Security risk

**Solution**: Create IAM users with least privilege

### 3. Hardcoding Credentials

**Problem**: Security vulnerability

```python
# ❌ BAD
s3 = boto3.client('s3',
    aws_access_key_id='AKIAIOSFODNN7EXAMPLE',
    aws_secret_access_key='wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
)

# ✅ GOOD
# Use IAM roles (EC2, Lambda) or AWS CLI configured credentials
s3 = boto3.client('s3')
```

### 4. Not Using Regions Wisely

**Problem**: High latency, data transfer costs

**Solution**: Deploy in region closest to users/data

---

## Interview Questions

### Q1: Explain AWS IAM and its components.

**Answer:**

**IAM (Identity and Access Management)** controls access to AWS resources.

**Components:**

1. **Users**: Individuals/applications with credentials
2. **Groups**: Collections of users
3. **Roles**: Assumed by services/users for temporary access
4. **Policies**: JSON documents defining permissions

**Example scenario:**
```
Scenario: ML engineer needs S3 access for training

Solution:
1. Create IAM user: "ml-engineer"
2. Create policy: Allow S3 read/write on "ml-bucket"
3. Attach policy to user
4. Generate access keys
5. Configure AWS CLI with keys
```

**Policy structure:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::ml-bucket/*"
    }
  ]
}
```

**Best practices:**
- Use roles for EC2/Lambda (not access keys)
- Principle of least privilege
- Enable MFA
- Rotate credentials
- Use IAM groups for easier management

---

### Q2: Compare EC2, Lambda, and SageMaker for ML.

**Answer:**

| Aspect | EC2 | Lambda | SageMaker |
|--------|-----|--------|-----------|
| **Use Case** | Long training, custom setup | Serverless inference | Managed ML platform |
| **Cost** | Hourly (even if idle) | Pay per invocation | Hourly (compute) |
| **Setup** | Manual | No servers | Managed |
| **Scaling** | Manual/Auto Scaling | Automatic | Automatic |
| **GPU Support** | Yes (p3, g4) | No | Yes |
| **Max Runtime** | Unlimited | 15 minutes | Unlimited |
| **When to use** | Complex training, GPU | Small models, event-driven | End-to-end ML |

**Example decision tree:**
```
Need GPU?
├─ Yes → EC2 or SageMaker
└─ No
   └─ Serverless?
      ├─ Yes → Lambda
      └─ No → EC2

Budget?
├─ High → SageMaker (ease of use)
└─ Low → EC2 (more control, cheaper)

Model size?
├─ < 250 MB → Lambda
└─ > 250 MB → EC2/SageMaker
```

---

### Q3: How do you optimize AWS costs for ML workloads?

**Answer:**

**Cost optimization strategies:**

1. **Use Spot Instances** (up to 90% savings)
   ```python
   use_spot_instances=True
   ```

2. **Right-size instances**
   - Start small, scale up if needed
   - Use CloudWatch metrics to monitor utilization

3. **Auto-scaling**
   - Scale down during low traffic
   - Use HPA for SageMaker endpoints

4. **S3 lifecycle policies**
   - Move old data to Glacier
   - Delete temporary files

5. **Reserved Instances/Savings Plans**
   - For predictable workloads
   - Up to 75% savings

6. **Shut down unused resources**
   - Stop development instances overnight
   - Use Lambda to auto-shutdown

7. **Choose right region**
   - Some regions are cheaper
   - Balance cost vs latency

8. **Monitor costs**
   - Set up billing alerts
   - Use AWS Cost Explorer
   - Tag resources for cost allocation

**Example cost calculation:**
```
Scenario: Serve model with varying traffic

Option 1: Fixed EC2 (m5.large, 24/7)
Cost: $0.096/hr × 24 × 30 = $69.12/month

Option 2: Auto-scaling (1-5 instances)
Average: 2 instances during day, 1 at night
Cost: ~$35/month (50% savings)

Option 3: Lambda (for small model)
100K requests/month, 1s each
Cost: $0.20/month (97% savings!)
```

---

### Q4: Explain S3 storage classes and when to use each.

**Answer:**

| Class | Access Pattern | Retrieval | Cost | Use Case |
|-------|----------------|-----------|------|----------|
| **Standard** | Frequent | Immediate | $$$ | Active datasets, model serving |
| **Intelligent-Tiering** | Unknown | Immediate | $$-$$$ | Unpredictable access |
| **Standard-IA** | Infrequent | Immediate | $$ | Backup datasets |
| **Glacier** | Archive | Minutes-hours | $ | Old model versions |
| **Glacier Deep Archive** | Rarely | Hours | $ | Long-term compliance |

**Decision flowchart:**
```
How often accessed?
├─ Daily → Standard
├─ Weekly/Monthly → Standard-IA
├─ Rarely, but fast retrieval → Glacier
└─ Rarely, slow retrieval OK → Glacier Deep Archive

Unknown access pattern? → Intelligent-Tiering
```

**Example lifecycle policy:**
```python
{
    'Rules': [
        {
            'Id': 'ML-Data-Lifecycle',
            'Transitions': [
                {'Days': 30, 'StorageClass': 'STANDARD_IA'},
                {'Days': 90, 'StorageClass': 'GLACIER'},
                {'Days': 365, 'StorageClass': 'DEEP_ARCHIVE'}
            ],
            'Expiration': {'Days': 1825}  # Delete after 5 years
        }
    ]
}
```

**Cost comparison (1 TB data for 1 month):**
- Standard: $23
- Standard-IA: $12.50
- Glacier: $4
- Glacier Deep Archive: $1

---

### Q5: How do you securely deploy ML models on AWS?

**Answer:**

**Security best practices:**

1. **Use IAM Roles (not access keys)**
   ```python
   # EC2 instance has role attached
   s3 = boto3.client('s3')  # Uses instance role
   ```

2. **VPC for network isolation**
   - Private subnets for ML instances
   - Security groups (firewall rules)
   - No public internet access

3. **Encrypt data**
   ```python
   # S3 encryption
   s3.put_object(
       Bucket='ml-bucket',
       Key='model.pkl',
       Body=model_data,
       ServerSideEncryption='AES256'
   )
   ```

4. **Use AWS Secrets Manager**
   ```python
   # Store API keys
   secrets.create_secret(
       Name='ml-api-key',
       SecretString='secret'
   )
   ```

5. **Enable CloudTrail** (audit logs)

6. **API Gateway with authentication**
   - API keys
   - IAM authorization
   - Cognito user pools

7. **Regular security audits**
   - AWS Trusted Advisor
   - Security groups review

**Example secure architecture:**
```
┌─────────────────────────────────────────┐
│ VPC (10.0.0.0/16)                      │
│                                         │
│ Public Subnet                           │
│ ┌──────────────┐                        │
│ │ API Gateway  │                        │
│ └──────┬───────┘                        │
│        │                                │
│ Private Subnet                          │
│ ┌──────▼──────────┐                     │
│ │ SageMaker       │                     │
│ │ Endpoint        │                     │
│ │ (No public IP)  │                     │
│ └─────────────────┘                     │
│                                         │
│ • Security groups restrict access       │
│ • IAM roles for permissions             │
│ • Data encrypted in transit & at rest   │
└─────────────────────────────────────────┘
```

---

**Quick Reference:**

```bash
# AWS CLI essentials
aws s3 cp local.csv s3://bucket/
aws s3 ls s3://bucket/
aws ec2 describe-instances
aws ec2 start-instances --instance-ids i-1234567890
aws ec2 stop-instances --instance-ids i-1234567890
aws sagemaker list-endpoints
```

---

[← Back to Kubernetes](./kubernetes-orchestration.md) | [Next: Model Deployment →](./model-deployment.md)
