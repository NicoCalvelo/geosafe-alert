output "id" {
  value = azurerm_virtual_network.this.id
}

output "name" {
  value = azurerm_virtual_network.this.name
}

output "container_apps_subnet_id" {
  value = azurerm_subnet.container_apps.id
}

output "postgres_subnet_id" {
  value = azurerm_subnet.postgres.id
}