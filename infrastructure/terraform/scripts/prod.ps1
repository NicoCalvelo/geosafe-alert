param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("init","plan","apply","destroy")]
    [string]$Action
)

$Environment = "prod"
$TerraformPath = "../stack"
$BackendFile = "../environments/prod/backend-prod.hcl"
$VarsFile = "../environments/prod/terraform.tfvars"

Write-Host "================================="
Write-Host " GeoSafe Terraform PROD"
Write-Host " Action : $Action"
Write-Host "================================="

Set-Location $TerraformPath

switch ($Action) {
    "init" {
        terraform init `
            -backend-config="$BackendFile" `
            -reconfigure
        cd ../scripts
    }

    "plan" {
        terraform plan `
            -var-file="$VarsFile"
        cd ../scripts
    }

    "apply" {
        terraform apply `
            -var-file="$VarsFile"
        cd ../scripts
    }

    "destroy" {
        terraform destroy `
            -var-file="$VarsFile"
        cd ../scripts
    }
}