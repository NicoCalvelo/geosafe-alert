resource "azurerm_container_app" "this" {
  name = "ca-frontend-geosafe-${var.environment}"
  container_app_environment_id = var.container_app_environment_id
  resource_group_name = var.resource_group_name
  revision_mode = "Single"

  identity {
    type = "UserAssigned"

    identity_ids = [
      var.identity_id
    ]
  }

  registry {
    server   = var.acr_login_server
    identity = var.identity_id
  }

  template {
    container {
      name = "frontend"
      image = var.image
      cpu = 0.5
      memory = "1Gi"
    }
    min_replicas = 1
    max_replicas = 2
  }

  ingress {
    external_enabled = true
    target_port = 80
    transport = "auto"

    traffic_weight {
      percentage = 100
      latest_revision = true
    }
  }

  tags = {
    Project = "GeoSafe"
    Environment = var.environment
    ManagedBy = "Terraform"
  }
}