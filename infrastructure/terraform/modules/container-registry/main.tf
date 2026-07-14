resource "azurerm_container_registry" "this" {
  name = "acrgeosafedev"

  resource_group_name = var.resource_group_name
  location            = var.location

  sku = "Basic"

  admin_enabled = false

  tags = {
    Project     = "GeoSafe"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}