output "host" {
  value = azurerm_postgresql_flexible_server.this.fqdn
}

output "database" {
  value = azurerm_postgresql_flexible_server_database.this.name
}

output "administrator_login" {
  value = azurerm_postgresql_flexible_server.this.administrator_login
}

output "connection_string" {
  value = "postgres://${var.administrator_login}:${var.administrator_password}@${azurerm_postgresql_flexible_server.this.fqdn}:5432/${var.database_name}"
  sensitive = true
}