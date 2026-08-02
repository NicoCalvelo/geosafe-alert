locals {
  common_tags = {
    Project     = "GeoSafe"
    Environment = "prod"
    ManagedBy   = "Terraform"
  }

  names = {
    resource_group = "rg-geosafe-prod"
    container_registry = "acrgeosafeprod"
    key_vault = "kv-geosafe-prod"
    backend_identity = "id-geosafe-backend-prod"
    frontend_identity = "id-geosafe-frontend-prod"
    backend_app = "ca-backend-geosafe-prod"
    frontend_app = "ca-frontend-geosafe-prod"
    postgres = "psql-geosafe-prod"
  }
}