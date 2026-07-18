module "container_app_backend" {
  source                       = "../../modules/container-app-backend"
  environment                  = var.environment
  resource_group_name          = module.resource_group.name
  container_app_environment_id = module.container_app_environment.id
  acr_login_server             = module.container_registry.login_server
  acr_id                       = module.container_registry.id
  image                        = "${module.container_registry.login_server}/geosafe-backend:develop"
  app_key                      = var.app_key
  db_password                  = var.db_password
  mapbox_api_key               = var.mapbox_api_key
  db_host                      = var.db_host
  db_port                      = var.db_port
  db_user                      = var.db_user
  db_database                  = var.db_database
  session_driver               = var.session_driver
}