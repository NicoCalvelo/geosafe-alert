variable "environment" {
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