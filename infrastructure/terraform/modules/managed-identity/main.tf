resource "azurerm_user_assigned_identity" "this" {
  name = "id-geosafe-${var.environment}"

  location = var.location

  resource_group_name = var.resource_group_name

  tags = {
    Project     = "GeoSafe"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}