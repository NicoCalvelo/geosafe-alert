module "resource_group" {
  source = "../../modules/resource-group"

  name     = local.names.resource_group
  location = var.location
}

module "storage_account" {
  source = "../../modules/storage-account"

  name                = local.names.storage_account
  resource_group_name = module.resource_group.name
  location            = var.location
  tags                = local.common_tags
}

module "log_analytics" {
  source = "../../modules/log-analytics"

  name                = local.names.log_analytics
  location            = var.location
  resource_group_name = module.resource_group.name
  tags                = local.common_tags
}

module "container_registry" {
  source = "../../modules/container-registry"

  name                = local.names.container_registry
  resource_group_name = module.resource_group.name
  location            = var.location
  tags                = local.common_tags
}

module "container_app_environment" {
  source = "../../modules/container-app-environment"

  name                       = local.names.container_app_environment
  location                   = var.location
  resource_group_name        = module.resource_group.name
  log_analytics_workspace_id = module.log_analytics.workspace_id
  tags                       = local.common_tags
}

module "key_vault" {
  source = "../../modules/key-vault"

  name                          = local.names.key_vault
  location                      = var.location
  resource_group_name           = module.resource_group.name
  tenant_id                     = var.tenant_id
  tags                          = local.common_tags
  terraform_user_object_id      = var.terraform_user_object_id
  app_key                       = var.app_key
  db_password                   = var.db_password
  mapbox_api_key                = var.mapbox_api_key
  purge_protection_enabled      = var.keyvault_purge_protection
  soft_delete_retention_days    = var.postgres_backup_days
  public_network_access_enabled = var.keyvault_public_access
}

module "backend_identity" {
  source = "../../modules/managed-identity"

  name                = local.names.backend_identity
  location            = var.location
  resource_group_name = module.resource_group.name
  acr_id              = module.container_registry.id
  keyvault_id         = module.key_vault.id
  tags                = local.common_tags
}

module "frontend_identity" {
  source = "../../modules/managed-identity"

  name                = local.names.frontend_identity
  location            = var.location
  resource_group_name = module.resource_group.name
  acr_id              = module.container_registry.id
  tags                = local.common_tags
}

module "github_actions_role" {
  source = "../../modules/github-actions-role"

  resource_group_id = module.resource_group.resource_group_id
  github_sp_name    = var.github_sp_name
}

module "postgres" {
  source = "../../modules/postgres-flexible-server"

  name                          = local.names.postgres
  resource_group_name           = module.resource_group.name
  location                      = var.location
  availability_zone             = var.availability_zone
  administrator_login           = var.postgres_admin_user
  administrator_password        = var.postgres_password
  database_name                 = "geosafe"
  backup_retention_days         = var.postgres_backup_days
  sku_name                      = var.postgres_sku
  geo_redundant_backup_enabled  = false
  public_network_access_enabled = var.postgres_public_access
  tags                          = local.common_tags
}

module "container_app_frontend" {
  source = "../../modules/container-app"

  name                         = local.names.frontend_app
  resource_group_name          = module.resource_group.name
  container_app_environment_id = module.container_app_environment.id
  acr_login_server             = module.container_registry.login_server
  image                        = "${module.container_registry.login_server}/geosafe-frontend:${var.frontend_image_tag}"
  identity_id                  = module.frontend_identity.id
  tags                         = local.common_tags

  container_name = "frontend"
  target_port    = 80
  cpu            = 0.5
  memory         = "1Gi"
  min_replicas   = 1
  max_replicas   = 2
  liveness_probe_enabled = true
  readiness_probe_enabled = true
  http_scale_rule_enabled = true

  keyvault_secrets = {}
}


module "container_app_backend" {
  source = "../../modules/container-app"

  name                         = local.names.backend_app
  resource_group_name          = module.resource_group.name
  container_app_environment_id = module.container_app_environment.id
  acr_login_server             = module.container_registry.login_server
  identity_id                  = module.backend_identity.id
  image                        = "${module.container_registry.login_server}/geosafe-backend:${var.backend_image_tag}"
  tags                         = local.common_tags

  container_name = "backend"
  target_port    = 3333
  cpu            = 0.5
  memory         = "1Gi"
  min_replicas   = 1
  max_replicas   = 3
  liveness_probe_enabled = true
  readiness_probe_enabled = true
  http_scale_rule_enabled = true

  env = [
    {
      name  = "NODE_ENV"
      value = "production"
    },
    {
      name  = "PORT"
      value = "3333"
    },
    {
      name  = "HOST"
      value = "0.0.0.0"
    },
    {
      name        = "APP_KEY"
      secret_name = "app-key"
    },
    {
      name        = "DB_PASSWORD"
      secret_name = "db-password"
    },
    {
      name        = "MAPBOX_API_KEY"
      secret_name = "mapbox-api-key"
    },
    {
      name  = "DB_HOST"
      value = module.postgres.host
    },
    {
      name  = "DB_PORT"
      value = var.db_port
    },
    {
      name  = "DB_USER"
      value = module.postgres.administrator_login
    },
    {
      name  = "DB_DATABASE"
      value = module.postgres.database
    },
    {
      name  = "SESSION_DRIVER"
      value = var.session_driver
    },
    {
      name  = "LOG_LEVEL"
      value = "debug"
    }
  ]

  keyvault_secrets = {
    app-key = {
      key_vault_secret_id = module.key_vault.app_key_id
    }
    db-password = {
      key_vault_secret_id = module.key_vault.db_password_id
    }
    mapbox-api-key = {
      key_vault_secret_id = module.key_vault.mapbox_api_key_id
    }
  }
}