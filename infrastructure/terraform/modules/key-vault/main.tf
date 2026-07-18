resource "azurerm_key_vault" "this" {

  name                = "kv-geosafe-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name

  tenant_id = var.tenant_id

  sku_name = "standard"

  purge_protection_enabled   = false
  soft_delete_retention_days = 7

  enable_rbac_authorization = true

  tags = {
    Project     = "GeoSafe"
    Environment = var.environment
    ManagedBy   = "Terraform"
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
}


resource "azurerm_key_vault_secret" "db_password" {

  name = "db-password"

  value = var.db_password

  key_vault_id = azurerm_key_vault.this.id
}


resource "azurerm_key_vault_secret" "mapbox_api_key" {

  name = "mapbox-api-key"

  value = var.mapbox_api_key

  key_vault_id = azurerm_key_vault.this.id
}