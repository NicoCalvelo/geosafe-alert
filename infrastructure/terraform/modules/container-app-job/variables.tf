variable "name" {
  type = string
}

variable "location" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "container_app_environment_id" {
  type = string
}

variable "identity_id" {
  type = string
}

variable "acr_login_server" {
  type = string
}

variable "image" {
  type = string
}

variable "container_name" {
  type = string
}

variable "command" {
  type = list(string)
}

variable "cpu" {
  type = number
}

variable "memory" {
  type = string
}

variable "replica_timeout_in_seconds" {
  type    = number
  default = 300
}

variable "replica_retry_limit" {
  type    = number
  default = 0
}

variable "tags" {
  type = map(string)
}

variable "env" {
  type = list(object({
    name        = string
    value       = optional(string)
    secret_name = optional(string)
  }))

  default = []
}

variable "keyvault_secrets" {
  type = map(object({
    key_vault_secret_id = string
  }))

  default = {}
}