variable "name" {
  type = string
}

variable "location" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "acr_id" {
  type = string
  default = null
}

variable "keyvault_id" {
  type = string
  default = null
}

variable "tags" {
  type = map(string)
  default = {}
}