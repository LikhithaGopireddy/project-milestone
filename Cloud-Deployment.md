# Cloud Deployment — Jenkins + AWS EKS

This document lists required tools, installation notes, and a minimal Jenkins pipeline example to interact with Amazon EKS.

## Overview
Jenkins agents that deploy to EKS must have the AWS CLI and kubectl available, plus AWS credentials configured in Jenkins. The pipeline uses `aws eks update-kubeconfig` to authenticate kubectl against the target cluster.

## Prerequisites (on the Jenkins agent)
- AWS CLI v2
- kubectl
- AWS credentials stored in Jenkins (Access Key ID & Secret Access Key)
- Network access to the EKS API (VPC, security groups, or public access as applicable)

## Install AWS CLI v2 (example)
On Ubuntu (snap):
```bash
sudo snap install aws-cli --classic
```
Verify:
```bash
aws --version
```

Alternative installers (macOS, Windows, package managers) are available in AWS CLI docs.

## Install kubectl
Download and install the appropriate kubectl for your platform. Example (Linux):
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
kubectl version --client
```

## Jenkins: Configure AWS Credentials
1. Install the "AWS Credentials" plugin (if not already installed).
2. In Jenkins: Credentials → System → Global credentials → Add Credentials.
   - Kind: AWS Credentials
   - ID: choose a short id (e.g., `aws-deploy`)
   - Enter Access Key ID and Secret Access Key
3. In pipelines use `withCredentials` or the AWS credential binding (ID above).

Note: Ensure the IAM user/role has permissions to call `eks:DescribeCluster`, `eks:ListClusters`, and any Kubernetes resources your pipeline manages.

## Example Declarative Pipeline (minimal)
Replace `aws-deploy` with your Jenkins credential ID and set `AWS_REGION` and `EKS_CLUSTER_NAME`.
```groovy
pipeline {
  agent any
  environment {
    AWS_REGION = 'us-east-1'
    EKS_CLUSTER_NAME = 'my-cluster'
  }
  stages {
    stage('Deploy to EKS') {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-deploy']]) {
          sh '''
            aws --version
            aws eks update-kubeconfig --region $AWS_REGION --name $EKS_CLUSTER_NAME
            kubectl apply -f k8s/manifests/
          '''
        }
      }
    }
  }
}
```

## Tips & Troubleshooting
- If `aws eks update-kubeconfig` fails with permissions, verify IAM policies for the Jenkins credentials.
- Confirm kubectl version compatibility with the EKS cluster control plane.
- If running on ephemeral agents, ensure tools are installed in the build image or install at job runtime.
- For added security, use IAM roles for service accounts (IRSA) or assume-role patterns rather than long-lived credentials where possible.

## References
- AWS CLI: https://docs.aws.amazon.com/cli/
- kubectl: https://kubernetes.io/docs/tasks/tools/
- Jenkins AWS Credentials plugin: plugin documentation
