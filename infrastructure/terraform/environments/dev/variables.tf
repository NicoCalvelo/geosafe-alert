variable "project_name" {
  description = "Nom du projet"
  type        = string
}


variable "environment" {
  description = "Environnement Terraform (dev/prod)"
  type        = string
}

variable "frontend_image_tag" {
  type    = string
  default = "develop"
}


variable "backend_image_tag" {
  type    = string
  default = "develop"
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "terraform_user_object_id" {
  type = string
}

variable "tenant_id" {
  type = string
}

variable "app_key" {
  type      = string
  sensitive = true
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "mapbox_api_key" {
  type      = string
  sensitive = true
}

variable "db_port" {
  type = string
}

variable "session_driver" {
  type = string
}

variable "postgres_admin_user" {
  type = string
}

variable "postgres_password" {
  type      = string
  sensitive = true
}

variable "github_sp_name" {
  type = string
}

variable "availability_zone" {
  type    = string
  default = "2"
}

variable "postgres_sku" {
  type = string
}

variable "postgres_backup_days" {
  type = number
}

variable "postgres_public_access" {
  type = bool
}

variable "keyvault_purge_protection" {
  type = bool
}

variable "keyvault_public_access" {
  type = bool
}