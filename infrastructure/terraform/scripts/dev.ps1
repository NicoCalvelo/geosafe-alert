param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("init","plan","apply","destroy","rollback")]
    [string]$Action
)

$Environment = "dev"
$TerraformPath = "../stack"
$BackendFile = "../environments/dev/backend-dev.hcl"
$VarsFile = "../environments/dev/terraform.tfvars"

$ContainerAppName = "ca-backend-geosafe-dev"
$ResourceGroupName = "rg-geosafe-dev"

Write-Host "================================="
Write-Host " GeoSafe Terraform DEV"
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

    "validate" {
        terraform validate
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