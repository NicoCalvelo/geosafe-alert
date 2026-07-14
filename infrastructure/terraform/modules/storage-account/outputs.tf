output "storage_account_name" {
  value = azurerm_storage_account.this.name
}


output "container_name" {
  value = azurerm_storage_container.terraform_state.name
}