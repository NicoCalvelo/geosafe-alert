#######################################
# Projet
#######################################

variable "project_name" {
  description = "Nom du projet utilisé pour générer les ressources Azure."
  type        = string
  default     = "geosafe"
}

variable "environment" {
  description = "Environnement Terraform (dev, prod...)."
  type        = string
}

variable "location" {
  description = "Région Azure."
  type        = string
}

#######################################
# Images Docker
#######################################

variable "frontend_image_tag" {
  description = "Tag de l'image Docker du frontend."
  type        = string
  default     = "develop"
}

variable "backend_image_tag" {
  description = "Tag de l'image Docker du backend."
  type        = string
  default     = "develop"
}

#######################################
# Azure Active Directory
#######################################

variable "tenant_id" {
  description = "Tenant Azure."
  type        = string
}

variable "terraform_user_object_id" {
  description = "Object ID du compte Terraform."
  type        = string
}

variable "github_sp_name" {
  description = "Nom du Service Principal utilisé par GitHub Actions."
  type        = string
}

#######################################
# Base de données PostgreSQL
#######################################

variable "postgres" {
  description = "Configuration de la base de données PostgreSQL."

  type = object({
    admin_user        = string
    database_name     = string
    port              = string
    availability_zone = string
    sku               = string
    backup_days       = number
    public_access     = bool
  })
  sensitive = true

  default = {
    admin_user        = "geosafeadmin"
    database_name     = "geosafe"
    port              = "5432"
    availability_zone = "2"
    sku               = "B_Standard_B1ms"
    backup_days       = 7
    public_access     = true
  }
}

#######################################
# Key Vault
#######################################

variable "keyvault" {
  description = "Configuration du Key Vault."

  type = object({
    app_key                 = string
    db_password             = string
    mapbox_api_key          = string
    soft_delete_days        = number
    public_access           = bool
    secret_expiration_date  = string
    allowed_ip_addresses    = list(string)
  })
  sensitive = true

  default = {
    app_key                 = ""
    db_password             = ""
    mapbox_api_key          = ""
    public_access           = true
    soft_delete_days        = 7
    secret_expiration_date  = "2027-01-01T00:00:00Z"
    allowed_ip_addresses    = []
  }
}


#######################################
# Backend
#######################################

variable "backend" {
  description = "Configuration du backend."

  type = object({
    container_name = string
    target_port    = number
    cpu            = number
    memory         = string
    min_replicas   = number
    max_replicas   = number
  })

  default = {
    container_name = "backend"
    target_port    = 3333
    cpu            = 1.5
    memory         = "3Gi"
    min_replicas   = 1
    max_replicas   = 3
  }
}

#######################################
# Frontend
#######################################

variable "frontend" {
  description = "Configuration du frontend."

  type = object({
    container_name = string
    target_port    = number
    cpu            = number
    memory         = string
    min_replicas   = number
    max_replicas   = number
  })

  default = {
    container_name = "frontend"
    target_port    = 80
    cpu            = 0.5
    memory         = "1Gi"
    min_replicas   = 1
    max_replicas   = 2
  }
}

#######################################
# Configuration du backend
#######################################

variable "config_backend" {
  description = "Configuration du backend."

  type = object({
    node_env       = string
    port           = string
    host           = string
    db_port        = string
    session_driver = string
    log_level      = string
  })
  sensitive = true

  default = {
    node_env       = "production"
    port           = "3333"
    host           = "0.0.0.0"
    db_port        = "5432"
    session_driver = "cookie"
    log_level      = "debug"
  }
}


#######################################
# Container Apps
#######################################

variable "liveness_probe_enabled" {
  description = "Active la sonde de vie."
  type        = bool
  default     = true
}

variable "readiness_probe_enabled" {
  description = "Active la sonde de disponibilité."
  type        = bool
  default     = true
}

variable "http_scale_rule_enabled" {
  description = "Active la règle de scaling HTTP."
  type        = bool
  default     = true
}