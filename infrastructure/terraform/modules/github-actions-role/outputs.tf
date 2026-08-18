output "github_principal_id" {
  description = "Object ID du Service Principal GitHub Actions."
  value       = data.azuread_service_principal.github.object_id
}