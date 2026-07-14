resource "azurerm_container_app_environment" "this" {
  name = "cae-geosafe-${var.environment}"

  location = var.location

  resource_group_name = var.resource_group_name

  log_analytics_workspace_id = var.log_analytics_workspace_id


  tags = {
    Project     = "GeoSafe"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}