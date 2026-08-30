variable "name" {
  type = string
}

variable "location" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "tenant_id" {
  type = string
}

variable "terraform_user_object_id" {
  type = string
}

variable "app_key" {
  type = string
  sensitive = true
}

variable "db_password" {
  type = string
  sensitive = true
}

variable "mapbox_api_key" {
  type = string
  sensitive = true
}

variable "tags" {
  type = map(string)
}

variable "soft_delete_retention_days" {
  type    = number
  default = 7
}

variable "public_network_access_enabled" {
  type    = bool
  default = true
}

variable "secret_expiration_date" {
  description = "Expiration date for Key Vault secrets"
  type        = string
}

variable "allowed_ip_addresses" {
  description = "Liste des adresses IP publiques autorisées à accéder au Key Vault"
  type        = list(string)
  default     = []
}