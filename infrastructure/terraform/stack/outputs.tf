output "resource_group_name" {
  value = module.resource_group.name
}

output "resource_group_location" {
  value = module.resource_group.location
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