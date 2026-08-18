variable "name" {
  type = string
}

variable "location" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "address_space" {
  type = list(string)

  default = [
    "10.0.0.0/16"
  ]
}

variable "container_apps_subnet_name" {
  type    = string
  default = "snet-container-apps"
}

variable "container_apps_subnet_address_prefixes" {
  type = list(string)

  default = [
    "10.0.0.0/23"
  ]
}

variable "postgres_subnet_name" {
  type    = string
  default = "snet-postgres"
}

variable "postgres_subnet_address_prefixes" {
  type = list(string)

  default = [
    "10.0.2.0/28"
  ]
}

variable "tags" {
  type = map(string)
}