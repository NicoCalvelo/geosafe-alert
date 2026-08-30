output "resource_group_name" {
  description = "Resource Group containing the Terraform state."
  value       = azurerm_resource_group.terraform_state.name
}

output "storage_account_name" {
  description = "Storage Account containing the Terraform state."
  value       = azurerm_storage_account.terraform_state.name
}

output "container_name" {
  description = "Blob Container containing Terraform state files."
  value       = azurerm_storage_container.terraform_state.name
}