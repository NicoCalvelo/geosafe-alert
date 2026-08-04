output "resource_group_name" {
  value = module.resource_group.name
}

output "resource_group_location" {
  value = module.resource_group.location
}

output "terraform_storage_account" {
  value = module.storage_account.storage_account_name
}

output "terraform_state_container" {
  value = module.storage_account.container_name
}

output "log_analytics_workspace_id" {
  value = module.log_analytics.workspace_id
}

output "acr_login_server" {
  value = module.container_registry.login_server
}

output "frontend_url" {
  value = module.container_app_frontend.fqdn
}