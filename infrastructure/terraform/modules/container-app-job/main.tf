resource "azurerm_container_app_job" "this" {
  name                         = var.name
  location                     = var.location
  resource_group_name          = var.resource_group_name
  container_app_environment_id = var.container_app_environment_id

  replica_timeout_in_seconds = var.replica_timeout_in_seconds
  replica_retry_limit        = var.replica_retry_limit

  identity {
    type = "UserAssigned"

    identity_ids = [
      var.identity_id
    ]
  }

  manual_trigger_config {
    parallelism              = 1
    replica_completion_count = 1
  }

  registry {
    server   = var.acr_login_server
    identity = var.identity_id
  }

  template {
    container {
      name   = var.container_name
      image  = var.image
      cpu    = var.cpu
      memory = var.memory

      command = var.command

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
  }

  dynamic "secret" {
    for_each = var.keyvault_secrets

    content {
      name               = secret.key
      identity           = var.identity_id
      key_vault_secret_id = secret.value.key_vault_secret_id
    }
  }

  tags = var.tags
}