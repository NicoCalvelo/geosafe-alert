param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("init","plan","apply","destroy","rollback")]
    [string]$Action
)

$Environment = "prod"
$TerraformPath = "../stack"
$BackendFile = "../environments/prod/backend-prod.hcl"
$VarsFile = "../environments/prod/terraform.tfvars"

$AcrName = "acrgeosafeprod"

$FrontendRepository = "geosafe-frontend"
$BackendRepository = "geosafe-backend"

$FrontendContainerAppName = "ca-frontend-geosafe-prod"
$BackendContainerAppName = "ca-backend-geosafe-prod"

$ResourceGroupName = "rg-geosafe-prod"

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

    "rollback" {

        Write-Host ""
        Write-Host "================================="
        Write-Host " GeoSafe - Rollback PROD"
        Write-Host "================================="
        Write-Host ""

        # ============================================
        # FRONTEND - récupération des images
        # ============================================

        Write-Host "Images Frontend disponibles :" -ForegroundColor Cyan
        Write-Host ""

        $FrontendTags = az acr repository show-tags `
            --name $AcrName `
            --repository $FrontendRepository `
            --orderby time_desc `
            --output tsv

        if ($LASTEXITCODE -ne 0 -or -not $FrontendTags) {
            Write-Host "Impossible de récupérer les images Frontend." -ForegroundColor Red
            cd ../scripts
            exit 1
        }

        $FrontendTagList = @($FrontendTags)

        for ($i = 0; $i -lt $FrontendTagList.Count; $i++) {
            Write-Host "[$($i + 1)] $FrontendRepository`:$($FrontendTagList[$i])"
        }

        Write-Host ""

        do {
            $FrontendChoice = Read-Host "Sélectionnez le numéro de l'image Frontend"

            $FrontendChoiceNumber = 0

            $FrontendValid = [int]::TryParse(
                $FrontendChoice,
                [ref]$FrontendChoiceNumber
            )

            if (
                -not $FrontendValid -or
                $FrontendChoiceNumber -lt 1 -or
                $FrontendChoiceNumber -gt $FrontendTagList.Count
            ) {
                Write-Host "Choix invalide." -ForegroundColor Yellow
                $FrontendValid = $false
            }

        } while (-not $FrontendValid)

        $SelectedFrontendTag = $FrontendTagList[$FrontendChoiceNumber - 1]

        $SelectedFrontendImage = `
            "$AcrName.azurecr.io/$FrontendRepository`:$SelectedFrontendTag"


        # ============================================
        # BACKEND - récupération des images
        # ============================================

        Write-Host ""
        Write-Host "Images Backend disponibles :" -ForegroundColor Cyan
        Write-Host ""

        $BackendTags = az acr repository show-tags `
            --name $AcrName `
            --repository $BackendRepository `
            --orderby time_desc `
            --output tsv

        if ($LASTEXITCODE -ne 0 -or -not $BackendTags) {
            Write-Host "Impossible de récupérer les images Backend." -ForegroundColor Red
            cd ../scripts
            exit 1
        }

        $BackendTagList = @($BackendTags)

        for ($i = 0; $i -lt $BackendTagList.Count; $i++) {
            Write-Host "[$($i + 1)] $BackendRepository`:$($BackendTagList[$i])"
        }

        Write-Host ""

        do {
            $BackendChoice = Read-Host "Sélectionnez le numéro de l'image Backend"

            $BackendChoiceNumber = 0

            $BackendValid = [int]::TryParse(
                $BackendChoice,
                [ref]$BackendChoiceNumber
            )

            if (
                -not $BackendValid -or
                $BackendChoiceNumber -lt 1 -or
                $BackendChoiceNumber -gt $BackendTagList.Count
            ) {
                Write-Host "Choix invalide." -ForegroundColor Yellow
                $BackendValid = $false
            }

        } while (-not $BackendValid)

        $SelectedBackendTag = $BackendTagList[$BackendChoiceNumber - 1]

        $SelectedBackendImage = `
            "$AcrName.azurecr.io/$BackendRepository`:$SelectedBackendTag"


        # ============================================
        # Récapitulatif
        # ============================================

        Write-Host ""
        Write-Host "================================="
        Write-Host " Images sélectionnées"
        Write-Host "================================="
        Write-Host ""

        Write-Host "Frontend :" -ForegroundColor Cyan
        Write-Host $SelectedFrontendImage

        Write-Host ""

        Write-Host "Backend :" -ForegroundColor Cyan
        Write-Host $SelectedBackendImage

        Write-Host ""

        # ============================================
        # Confirmation
        # ============================================

        $Confirmation = Read-Host "Confirmer le rollback PROD ? (o/n)"

        if (
            $Confirmation -ne "o" -and
            $Confirmation -ne "O"
        ) {
            Write-Host ""
            Write-Host "Rollback annulé." -ForegroundColor Yellow

            cd ../scripts
            exit 0
        }


        # ============================================
        # Déploiement FRONTEND
        # ============================================

        Write-Host ""
        Write-Host "Déploiement Frontend PROD..." -ForegroundColor Cyan
        Write-Host ""

        az containerapp update `
            --name "ca-frontend-geosafe-prod" `
            --resource-group "rg-geosafe-prod" `
            --image "$SelectedFrontendImage"

        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "Le rollback Frontend PROD a échoué." -ForegroundColor Red

            cd ../scripts
            exit 1
        }

        Write-Host "Frontend PROD déployé avec succès." -ForegroundColor Green


        # ============================================
        # Déploiement BACKEND
        # ============================================

        Write-Host ""
        Write-Host "Déploiement Backend PROD..." -ForegroundColor Cyan
        Write-Host ""

        az containerapp update `
            --name "ca-backend-geosafe-prod" `
            --resource-group "rg-geosafe-prod" `
            --image "$SelectedBackendImage"

        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "Le rollback Backend PROD a échoué." -ForegroundColor Red

            cd ../scripts
            exit 1
        }

        Write-Host "Backend PROD déployé avec succès." -ForegroundColor Green


        # ============================================
        # FIN
        # ============================================

        Write-Host ""
        Write-Host "================================="
        Write-Host " Rollback PROD terminé"
        Write-Host "================================="
        Write-Host ""

        Write-Host "Frontend : $SelectedFrontendImage" -ForegroundColor Green
        Write-Host "Backend  : $SelectedBackendImage" -ForegroundColor Green

        Write-Host ""

        cd ../scripts
    }
}