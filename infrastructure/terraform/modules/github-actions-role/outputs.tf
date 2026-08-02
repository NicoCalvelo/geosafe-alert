output "github_principal_id" {
  value = data.azuread_service_principal.github.object_id
}