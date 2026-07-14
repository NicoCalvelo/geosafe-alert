module "resource_group" {
  source = "../../modules/resource-group"

  environment = var.environment
  location    = var.location
}

module "storage_account" {
  source = "../../modules/storage-account"

  environment = var.environment

  location = var.location

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

  resource_group_name = module.resource_group.name

  log_analytics_workspace_id = module.log_analytics.workspace_id
}

module "backend" {

  source = "../../modules/container-app-backend"


  environment = var.environment


  resource_group_name = module.resource_group.name


  container_app_environment_id =
    module.container_app_environment.id


  image =
    "${module.container_registry.login_server}/geosafe-backend:develop"

}