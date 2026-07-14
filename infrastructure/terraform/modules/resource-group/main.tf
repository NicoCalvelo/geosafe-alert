resource "azurerm_resource_group" "this" {
  name     = "rg-geosafe-${var.environment}"
  location = var.location
}