output "id" {
  value = azurerm_key_vault.this.id
}


output "app_key_id" {

  value = azurerm_key_vault_secret.app_key.id

}


output "db_password_id" {

  value = azurerm_key_vault_secret.db_password.id

}


output "mapbox_api_key_id" {

  value = azurerm_key_vault_secret.mapbox_api_key.id

}