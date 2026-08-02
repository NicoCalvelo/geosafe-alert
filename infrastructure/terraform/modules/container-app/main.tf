resource "azurerm_container_app" "this" {
  name                         = var.name
  resource_group_name          = var.resource_group_name
  container_app_environment_id = var.container_app_environment_id
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
      name  = var.container_name
      image = var.image
      cpu    = var.cpu
      memory = var.memory

      dynamic "liveness_probe" {
        for_each = var.liveness_probe_enabled ? [1] : []
        content {
          transport = "HTTP"
          port = var.target_port
          path = "/health"
          initial_delay = 30
          interval_seconds = 10
        }
      }

      dynamic "readiness_probe" {
        for_each = var.readiness_probe_enabled ? [1] : []
        content {
          transport = "HTTP"
          port = var.target_port
          path = "/"
          interval_seconds = 10
        }
      }

      dynamic "env" {
        for_each = var.env

        content {
          name = env.value.name
          value = try(
            env.value.value,
            null
          )
          secret_name = try(
            env.value.secret_name,
            null
          )
        }
      }
    }
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    dynamic "http_scale_rule" {

      for_each = var.http_scale_rule_enabled ? [1] : []
      content {
        name = "http-rule"
        concurrent_requests = 50
      }
    }
  }

  dynamic "secret" {
    for_each = var.keyvault_secrets
    content {
      name = secret.key
      identity = var.identity_id
      key_vault_secret_id = secret.value.key_vault_secret_id
    }
  }

  ingress {
    external_enabled = true
    target_port = var.target_port

    traffic_weight {
      percentage = 100
      latest_revision = true
    }
  }

  tags = var.tags
}
