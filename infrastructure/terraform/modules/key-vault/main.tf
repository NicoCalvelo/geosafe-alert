resource "azurerm_key_vault" "this" {
  name                = var.name
  location            = var.location
  resource_group_name = var.resource_group_name
  tenant_id = var.tenant_id
  sku_name = "standard"
  purge_protection_enabled   = true
  soft_delete_retention_days = var.soft_delete_retention_days
  public_network_access_enabled = var.public_network_access_enabled
  rbac_authorization_enabled = true
  tags = var.tags

  network_acls {
    default_action = "Deny"
    bypass         = "AzureServices"
  }
}

resource "azurerm_role_assignment" "terraform_kv_admin" {
  scope = azurerm_key_vault.this.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id = var.terraform_user_object_id
}

resource "azurerm_key_vault_secret" "app_key" {
  name = "app-key"
  value = var.app_key
  key_vault_id = azurerm_key_vault.this.id
  content_type = "application-secret"
  expiration_date = var.secret_expiration_date
}

resource "azurerm_key_vault_secret" "db_password" {
  name = "db-password"
  value = var.db_password
  key_vault_id = azurerm_key_vault.this.id
  content_type = "application-secret"
  expiration_date = var.secret_expiration_date
}

resource "azurerm_key_vault_secret" "mapbox_api_key" {
  name = "mapbox-api-key"
  value = var.mapbox_api_key
  key_vault_id = azurerm_key_vault.this.id
  content_type = "application-secret"
  expiration_date = var.secret_expiration_date
}