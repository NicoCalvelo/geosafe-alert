data "azuread_service_principal" "github" {
  display_name = var.github_sp_name
}

resource "azurerm_role_assignment" "containerapp" {
  scope                = var.resource_group_id
  role_definition_name = "Contributor"
  principal_id         = data.azuread_service_principal.github.object_id
}