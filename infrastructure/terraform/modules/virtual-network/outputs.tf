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

output "private_endpoints_subnet_id" {
  value = azurerm_subnet.private_endpoints.id
}