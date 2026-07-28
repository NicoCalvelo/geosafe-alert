resource "azurerm_postgresql_flexible_server" "this" {
  name = "psql-geosafe-${var.environment}"

  resource_group_name = var.resource_group_name
  location            = var.location
  zone                = "2"

  administrator_login = var.administrator_login
  administrator_password = var.administrator_password

  version = "16"
  sku_name = "B_Standard_B1ms"
  storage_mb = 32768
  backup_retention_days = 7
  geo_redundant_backup_enabled = false
  public_network_access_enabled = true


  tags = {
    Project     = "GeoSafe"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}


resource "azurerm_postgresql_flexible_server_database" "this" {
  name = var.database_name
  server_id = azurerm_postgresql_flexible_server.this.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}