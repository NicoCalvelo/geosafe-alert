module "resource_group" {
  source = "../modules/resource-group"

  name     = local.names.resource_group
  location = var.location
}

module "storage_account" {
  source = "../modules/storage-account"

  name                = local.names.storage_account
  resource_group_name = module.resource_group.name
  location            = var.location
  tags                = local.common_tags
}

module "log_analytics" {
  source = "../modules/log-analytics"

  name                = local.names.log_analytics
  location            = var.location
  resource_group_name = module.resource_group.name
  tags                = local.common_tags
}

module "container_registry" {
  source = "../modules/container-registry"

  name                = local.names.container_registry
  resource_group_name = module.resource_group.name
  location            = var.location
  tags                = local.common_tags
}

module "container_app_environment" {
  source = "../modules/container-app-environment"

  name                       = local.names.container_app_environment
  location                   = var.location
  resource_group_name        = module.resource_group.name
  log_analytics_workspace_id = module.log_analytics.workspace_id
  tags                       = local.common_tags
}

module "key_vault" {
  source = "../modules/key-vault"

  name                          = local.names.key_vault
  location                      = var.location
  resource_group_name           = module.resource_group.name
  tenant_id                     = var.tenant_id
  tags                          = local.common_tags
  terraform_user_object_id      = var.terraform_user_object_id
  app_key                       = var.keyvault.app_key
  db_password                   = var.keyvault.db_password
  mapbox_api_key                = var.keyvault.mapbox_api_key
  purge_protection_enabled      = var.keyvault.purge_protection
  soft_delete_retention_days    = var.keyvault.soft_delete_days
  public_network_access_enabled = var.keyvault.public_access
}

module "backend_identity" {
  source = "../modules/managed-identity"

  name                = local.names.backend_identity
  location            = var.location
  resource_group_name = module.resource_group.name
  acr_id              = module.container_registry.id
  keyvault_id         = module.key_vault.id
  tags                = local.common_tags
}

module "frontend_identity" {
  source = "../modules/managed-identity"

  name                = local.names.frontend_identity
  location            = var.location
  resource_group_name = module.resource_group.name
  acr_id              = module.container_registry.id
  tags                = local.common_tags
}

module "github_actions_role" {
  source = "../modules/github-actions-role"

  resource_group_id = module.resource_group.resource_group_id
  github_sp_name    = var.github_sp_name
}

module "postgres" {
  source = "../modules/postgres-flexible-server"

  name                          = local.names.postgres
  resource_group_name           = module.resource_group.name
  location                      = var.location
  availability_zone             = var.postgres.availability_zone
  administrator_login           = var.postgres.admin_user
  administrator_password        = var.postgres.password
  database_name                 = var.postgres.database_name
  backup_retention_days         = var.postgres.backup_days
  sku_name                      = var.postgres.sku
  geo_redundant_backup_enabled  = false
  public_network_access_enabled = var.postgres.public_access
  tags                          = local.common_tags
}

module "container_app_frontend" {
  source = "../modules/container-app"

  name                         = local.names.frontend_app
  resource_group_name          = module.resource_group.name
  container_app_environment_id = module.container_app_environment.id
  acr_login_server             = module.container_registry.login_server
  image                        = "${module.container_registry.login_server}/geosafe-frontend:${var.frontend_image_tag}"
  identity_id                  = module.frontend_identity.id
  tags                         = local.common_tags

  container_name          = var.frontend.container_name
  target_port             = var.frontend.target_port
  cpu                     = var.frontend.cpu
  memory                  = var.frontend.memory
  min_replicas            = var.frontend.min_replicas
  max_replicas            = var.frontend.max_replicas
  liveness_probe_enabled  = var.liveness_probe_enabled
  readiness_probe_enabled = var.readiness_probe_enabled
  http_scale_rule_enabled = var.http_scale_rule_enabled

  keyvault_secrets = {}
}


module "container_app_backend" {
  source = "../modules/container-app"

  name                         = local.names.backend_app
  resource_group_name          = module.resource_group.name
  container_app_environment_id = module.container_app_environment.id
  acr_login_server             = module.container_registry.login_server
  identity_id                  = module.backend_identity.id
  image                        = "${module.container_registry.login_server}/geosafe-backend:${var.backend_image_tag}"
  tags                         = local.common_tags

  container_name          = var.backend.container_name
  target_port             = var.backend.target_port
  cpu                     = var.backend.cpu
  memory                  = var.backend.memory
  min_replicas            = var.backend.min_replicas
  max_replicas            = var.backend.max_replicas
  liveness_probe_enabled  = var.liveness_probe_enabled
  readiness_probe_enabled = var.readiness_probe_enabled
  http_scale_rule_enabled = var.http_scale_rule_enabled

  env = [
    {
      name  = "NODE_ENV"
      value = var.config_backend.node_env
    },
    {
      name  = "PORT"
      value = var.config_backend.port
    },
    {
      name  = "HOST"
      value = var.config_backend.host
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
      value = var.config_backend.db_port
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
      value = var.config_backend.session_driver
    },
    {
      name  = "LOG_LEVEL"
      value = var.config_backend.log_level
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