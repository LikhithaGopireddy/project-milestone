variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "pictogram-eks-cluster"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "eks_version" {
  description = "Kubernetes version to use for EKS"
  type        = string
  default     = "1.33"
}

variable "node_desired_size" {
  type    = number
  default = 2
}

variable "node_max_size" {
  type    = number
  default = 3
}

variable "node_min_size" {
  type    = number
  default = 1
}

variable "enable_ssh" {
  type    = bool
  default = false
}

variable "ssh_key_name" {
  type        = string
  description = "Name of existing EC2 KeyPair to allow SSH access"
  default     = "demo-ec2-key"
}

variable "public_subnet_tags" {
  type = map(string)
  default = {
    "kubernetes.io/role/elb" = "1"
  }
}


variable "private_subnet_tags" {
  type = map(string)
  default = {
    "kubernetes.io/role/internal-elb" = "1"
  }
}

variable "environment" {
  type    = string
  default = "prod"
}
