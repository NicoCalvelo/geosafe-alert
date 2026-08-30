variable "resource_group_name" {
  description = "Name of the Resource Group hosting the Terraform state."
  type        = string
}

variable "storage_account_name" {
  description = "Name of the Storage Account hosting the Terraform state."
  type        = string
}

variable "container_name" {
  description = "Name of the Blob Container hosting Terraform state files."
  type        = string
}

variable "location" {
  description = "Azure region where the Terraform state resources are deployed."
  type        = string
}