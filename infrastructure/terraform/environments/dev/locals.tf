locals {
  project = "geosafe"

  common_tags = {
    Project     = local.project
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  names = {
    resource_group            = "rg-${local.project}-${var.environment}"
    storage_account           = "st${local.project}${var.environment}"
    container_registry        = "acr${local.project}${var.environment}"
    log_analytics             = "law-${local.project}-${var.environment}"
    container_app_environment = "cae-${local.project}-${var.environment}"
    key_vault                 = "kv-${local.project}-${var.environment}"
    postgres                  = "psql-${local.project}-${var.environment}"
    managed_identity          = "id-${local.project}-${var.environment}"

    frontend_identity = "id-${local.project}-frontend-${var.environment}"
    backend_identity  = "id-${local.project}-backend-${var.environment}"

    frontend_app = "ca-frontend-${local.project}-${var.environment}"
    backend_app  = "ca-backend-${local.project}-${var.environment}"
  }
}