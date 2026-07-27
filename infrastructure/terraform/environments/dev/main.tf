module "resource_group" {
  source = "../../modules/resource-group"

  environment = var.environment
  location    = var.location
}


module "storage_account" {
  source = "../../modules/storage-account"

  environment = var.environment
  location    = var.location

  resource_group_name = module.resource_group.name
}


module "log_analytics" {
  source = "../../modules/log-analytics"

  environment = var.environment
  location    = var.location

  resource_group_name = module.resource_group.name
}


module "container_registry" {
  source = "../../modules/container-registry"

  environment = var.environment
  location    = var.location

  resource_group_name = module.resource_group.name
}


module "container_app_environment" {
  source = "../../modules/container-app-environment"

  environment = var.environment
  location    = var.location

  resource_group_name        = module.resource_group.name
  log_analytics_workspace_id = module.log_analytics.workspace_id
}


module "key_vault" {
  source = "../../modules/key-vault"

  environment              = var.environment
  location                 = var.location
  resource_group_name      = module.resource_group.name
  tenant_id                = var.tenant_id
  terraform_user_object_id = var.terraform_user_object_id

  app_key        = var.app_key
  db_password    = var.db_password
  mapbox_api_key = var.mapbox_api_key
}

module "managed_identity" {
  source      = "../../modules/managed-identity"
  environment = var.environment

  location            = var.location
  resource_group_name = module.resource_group.name
}

resource "azurerm_role_assignment" "keyvault_access" {
  scope                = module.key_vault.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = module.managed_identity.principal_id
}

module "acr_pull_role" {
  source = "../../modules/acr-role"

  acr_id       = module.container_registry.id
  principal_id = module.managed_identity.principal_id
}

module "postgres" {
  source = "../../modules/postgres-flexible-server"
  environment = var.environment
  location = var.location
  resource_group_name = module.resource_group.name
  administrator_login = var.postgres_admin_user
  administrator_password = var.postgres_password
  database_name = "geosafe"
}

module "container_app_backend" {
  source = "../../modules/container-app-backend"

  environment                  = var.environment
  resource_group_name          = module.resource_group.name
  container_app_environment_id = module.container_app_environment.id

  acr_login_server = module.container_registry.login_server
  acr_id           = module.container_registry.id

  image = "${module.container_registry.login_server}/geosafe-backend:develop"

  key_vault_id = module.key_vault.id
  identity_id  = module.managed_identity.id

  app_key_secret_id        = module.key_vault.app_key_id
  db_password_secret_id    = module.key_vault.db_password_id
  mapbox_api_key_secret_id = module.key_vault.mapbox_api_key_id

  db_host        = var.db_host
  db_port        = var.db_port
  db_user        = var.db_user
  db_database    = var.db_database
  session_driver = var.session_driver
}