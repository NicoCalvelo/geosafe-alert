resource "azurerm_container_app" "this" {

  name = "ca-backend-geosafe-${var.environment}"

  container_app_environment_id = var.container_app_environment_id

  resource_group_name = var.resource_group_name

  revision_mode = "Single"


  identity {

    type = "SystemAssigned"

  }



  registry {

    server = var.acr_login_server

    identity = "system"

  }



  secret {

    name  = "app-key"

    value = var.app_key

  }



  secret {

    name  = "db-password"

    value = var.db_password

  }



  secret {

    name  = "mapbox-api-key"

    value = var.mapbox_api_key

  }



  template {

    container {

      name = "backend"

      image = var.image


      cpu = 0.5

      memory = "1Gi"



      env {

        name = "NODE_ENV"

        value = "production"

      }



      env {

        name = "PORT"

        value = "3333"

      }



      env {

        name = "HOST"

        value = "0.0.0.0"

      }



      env {

        name = "APP_KEY"

        secret_name = "app-key"

      }



      env {

        name = "DB_PASSWORD"

        secret_name = "db-password"

      }



      env {

        name = "MAPBOX_API_KEY"

        secret_name = "mapbox-api-key"

      }



      env {

        name = "DB_HOST"

        value = var.db_host

      }



      env {

        name = "DB_PORT"

        value = var.db_port

      }



      env {

        name = "DB_USER"

        value = var.db_user

      }



      env {

        name = "DB_DATABASE"

        value = var.db_database

      }



      env {

        name = "SESSION_DRIVER"

        value = var.session_driver

      }



      env {

        name = "LOG_LEVEL"

        value = "debug"

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

    Project = "GeoSafe"

    Environment = var.environment

    ManagedBy = "Terraform"

  }

}




resource "azurerm_role_assignment" "acr_pull" {


  scope = var.acr_id


  role_definition_name = "AcrPull"


  principal_id = azurerm_container_app.this.identity[0].principal_id

}