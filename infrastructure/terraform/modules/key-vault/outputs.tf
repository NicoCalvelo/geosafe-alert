output "id" {
  value = azurerm_key_vault.this.id
}

output "name" {
  value = azurerm_key_vault.this.name
}

output "vault_uri" {
  value = azurerm_key_vault.this.vault_uri
}

output "app_key_id" {
  value = azurerm_key_vault_secret.app_key.versionless_id
}

output "db_password_id" {
  value = azurerm_key_vault_secret.db_password.versionless_id
}

output "mapbox_api_key_id" {
  value = azurerm_key_vault_secret.mapbox_api_key.versionless_id
}