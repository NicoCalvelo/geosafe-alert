variable "environment" {
  type = string
}

variable "terraform_user_object_id" {
  type = string
}

variable "location" {
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