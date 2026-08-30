resource "azurerm_postgresql_flexible_server" "this" {
  name                = var.name
  resource_group_name = var.resource_group_name
  location            = var.location

  zone = var.availability_zone

  administrator_login    = var.administrator_login
  administrator_password = var.administrator_password

  version  = "16"
  sku_name = var.sku_name

  storage_mb           = 32768
  backup_retention_days = var.backup_retention_days

  geo_redundant_backup_enabled = var.geo_redundant_backup_enabled

  public_network_access_enabled = false

  delegated_subnet_id = var.postgres_subnet_id
  private_dns_zone_id = azurerm_private_dns_zone.postgres.id

  tags = var.tags
}

resource "azurerm_private_dns_zone" "postgres" {
  name                = "private.postgres.database.azure.com"
  resource_group_name = var.resource_group_name

  tags = var.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgres" {
  name                  = "${var.name}-dns-link"
  private_dns_zone_name = azurerm_private_dns_zone.postgres.name
  resource_group_name   = var.resource_group_name
  virtual_network_id    = var.virtual_network_id

  tags = var.tags
}

resource "azurerm_postgresql_flexible_server_configuration" "azure_extensions" {
  name      = "azure.extensions"
  server_id = azurerm_postgresql_flexible_server.this.id
  value     = "postgis,uuid-ossp,pgcrypto"
}

resource "azurerm_postgresql_flexible_server_database" "this" {
  name      = var.database_name
  server_id = azurerm_postgresql_flexible_server.this.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}