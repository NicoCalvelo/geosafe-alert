resource "azurerm_container_app" "this" {

  name = "ca-geosafe-backend-${var.environment}"

  container_app_environment_id = var.container_app_environment_id

  resource_group_name = var.resource_group_name


  revision_mode = "Single"


  template {

    container {

      name = "backend"

      image = var.image

      cpu    = 0.5
      memory = "1Gi"


      env {
        name  = "NODE_ENV"
        value = var.environment
      }

    }


    min_replicas = 1
    max_replicas = 3

  }


  ingress {

    external_enabled = true

    target_port = 3333

    transport = "auto"


    traffic_weight {

      percentage = 100
      latest_revision = true

    }

  }


  tags = {
    Project     = "GeoSafe"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}