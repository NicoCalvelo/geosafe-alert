param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("init","plan","apply","destroy")]
    [string]$Action
)


Write-Host "================================="
Write-Host " GeoSafe Terraform"
Write-Host " Action      : $Action"
Write-Host "================================="



$TerraformPath = "C:\Users\cabro\Desktop\projet\infrastructure\terraform\bootstrap\terraform-state"

if (!(Test-Path $TerraformPath)) {
    Write-Error "L'environnement control n'existe pas : $TerraformPath"
    exit 1
}

Set-Location $TerraformPath

switch ($Action) {
    "init" {
        terraform init
    }


    "plan" {
        terraform plan -var-file="terraform.tfvars"
    }


    "apply" {
        terraform apply `
            -var-file="terraform.tfvars" `
            -auto-approve
    }


    "destroy" {
        terraform destroy `
            -var-file="terraform.tfvars" `
            -auto-approve
    }
}


Set-Location $ScriptPath