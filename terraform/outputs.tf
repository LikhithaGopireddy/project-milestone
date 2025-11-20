output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "EKS cluster endpoint (API server)"
  value       = module.eks.cluster_endpoint
}

output "cluster_certificate_authority_data" {
  description = "Base64-encoded CA data for the EKS cluster"
  value       = module.eks.cluster_certificate_authority_data
}

output "kubeconfig_command" {
  description = "Command to configure kubectl for this cluster"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

output "node_group_role_arn" {
  description = "IAM role ARN for the managed node group"
  value       = module.eks.eks_managed_node_groups["default"].iam_role_arn
}

output "vpc_id" {
  description = "VPC ID created by the VPC module"
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs created by the VPC module"
  value       = module.vpc.private_subnets
}

output "public_subnet_ids" {
  description = "Public subnet IDs created by the VPC module"
  value       = module.vpc.public_subnets
}

output "oidc_provider_arn" {
  description = "OIDC provider ARN (useful for IRSA)"
  value       = try(module.eks.oidc_provider_arn, "")
}
