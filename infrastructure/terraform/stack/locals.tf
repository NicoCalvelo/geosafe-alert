locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  names = {
    resource_group            = "rg-${var.project_name}-${var.environment}"
    storage_account           = "st-${var.project_name}-${var.environment}"
    container_registry        = "acr${var.project_name}${var.environment}"
    log_analytics             = "law-${var.project_name}-${var.environment}"
    container_app_environment = "cae-${var.project_name}-${var.environment}"
    key_vault                 = "kv-${var.project_name}-${var.environment}"
    postgres                  = "psql-${var.project_name}-${var.environment}"
    managed_identity          = "id-${var.project_name}-${var.environment}"
    virtual_network           = "vnet-${var.project_name}-${var.environment}"

    frontend_identity = "id-${var.project_name}-frontend-${var.environment}"
    backend_identity  = "id-${var.project_name}-backend-${var.environment}"

    frontend_app = "ca-frontend-${var.project_name}-${var.environment}"
    backend_app  = "ca-backend-${var.project_name}-${var.environment}"
  }
}