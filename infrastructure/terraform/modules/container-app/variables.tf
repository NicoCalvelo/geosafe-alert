variable "name" {
  type = string
}

variable "image" {
  type = string
}

variable "container_name" {
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

variable "target_port" {
  type = number
}

variable "cpu" {
  type = number
}

variable "memory" {
  type = string
}

variable "min_replicas" {
  type = number
}

variable "max_replicas" {
  type = number
}

variable "tags" {
  type = map(string)
}

variable "env" {

  type = list(object({
    name = string
    value = optional(string)
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

variable "liveness_probe_enabled" {
  type = bool
  default = true
}

variable "readiness_probe_enabled" {
  type = bool
  default = true
}

variable "http_scale_rule_enabled" {
  type = bool
  default = true
}

variable "backend_url" {
  type = string
}

variable "external_enabled" {
  type = bool
}