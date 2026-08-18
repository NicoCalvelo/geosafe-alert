variable "name" {
  type = string
}

variable "location" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "administrator_login" {
  type = string
}

variable "administrator_password" {
  type      = string
  sensitive = true
}

variable "database_name" {
  type = string
}

variable "tags" {
  type = map(string)
}

variable "availability_zone" {
 type = string
 default = "2"
}

variable "sku_name" {
  type = string
}

variable "backup_retention_days" {
  type = number
}

variable "geo_redundant_backup_enabled" {
  type = bool
}

variable "postgres_subnet_id" {
  type = string
}

variable "virtual_network_id" {
  type = string
}