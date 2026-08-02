resource "azurerm_user_assigned_identity" "this" {
  name = var.name
  location = var.location
  resource_group_name = var.resource_group_name
  tags = var.tags
}


resource "azurerm_role_assignment" "acr_pull" {
  count = var.acr_id != null ? 1 : 0
  scope = var.acr_id
  role_definition_name = "AcrPull"
  principal_id = azurerm_user_assigned_identity.this.principal_id
}



resource "azurerm_role_assignment" "keyvault" {
  count = var.keyvault_id != null ? 1 : 0
  scope = var.keyvault_id
  role_definition_name = "Key Vault Secrets User"
  principal_id = azurerm_user_assigned_identity.this.principal_id
}