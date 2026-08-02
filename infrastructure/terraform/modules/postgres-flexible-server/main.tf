resource "azurerm_postgresql_flexible_server" "this" {
  name = var.name
  resource_group_name = var.resource_group_name
  location            = var.location
  zone                = var.availability_zone
  administrator_login = var.administrator_login
  administrator_password = var.administrator_password
  version = "16"
  sku_name = var.sku_name
  storage_mb = 32768
  backup_retention_days = var.backup_retention_days
  geo_redundant_backup_enabled = var.geo_redundant_backup_enabled
  public_network_access_enabled = var.public_network_access_enabled
  tags = var.tags
}


resource "azurerm_postgresql_flexible_server_database" "this" {
  name = var.database_name
  server_id = azurerm_postgresql_flexible_server.this.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}