param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("init", "plan", "apply", "destroy", "rollback")]
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

    "rollback" {
        Write-Host ""
        Write-Host "================================="
        Write-Host " GeoSafe - Rollback"
        Write-Host "================================="
        Write-Host ""

        $AcrName = "acrgeosafedev"

        $FrontendRepository = "geosafe-frontend"
        $BackendRepository = "geosafe-backend"

        # ============================================
        # Récupération des images FRONTEND
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

        # ============================================
        # Choix image FRONTEND
        # ============================================

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
        # Récupération des images BACKEND
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

        # ============================================
        # Choix image BACKEND
        # ============================================

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
        # Affichage des choix
        # ============================================

        Write-Host ""
        Write-Host "================================="
        Write-Host " Images sélectionnées"
        Write-Host "================================="
        Write-Host ""

        Write-Host "Frontend :" -ForegroundColor Cyan
        Write-Host "$SelectedFrontendImage"

        Write-Host ""

        Write-Host "Backend :" -ForegroundColor Cyan
        Write-Host "$SelectedBackendImage"

        Write-Host ""

        # ============================================
        # Confirmation
        # ============================================

        $Confirmation = Read-Host "Confirmer le rollback ? (o/n)"

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
        # Déploiement Frontend
        # ============================================

        Write-Host ""
        Write-Host "Déploiement de l'image Frontend..." -ForegroundColor Cyan
        Write-Host ""

        az containerapp update `
            --name "ca-frontend-geosafe-dev" `
            --resource-group "rg-geosafe-dev" `
            --image "$SelectedFrontendImage"

        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "Le rollback Frontend a échoué." -ForegroundColor Red
            cd ../scripts
            exit 1
        }

        Write-Host "Frontend déployé avec succès." -ForegroundColor Green


        # ============================================
        # Déploiement Backend
        # ============================================

        Write-Host ""
        Write-Host "Déploiement de l'image Backend..." -ForegroundColor Cyan
        Write-Host ""

        az containerapp update `
            --name "ca-backend-geosafe-dev" `
            --resource-group "rg-geosafe-dev" `
            --image "$SelectedBackendImage"

        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "Le rollback Backend a échoué." -ForegroundColor Red
            cd ../scripts
            exit 1
        }

        Write-Host "Backend déployé avec succès." -ForegroundColor Green



        # ============================================
        # Fin
        # ============================================

        Write-Host ""
        Write-Host "================================="
        Write-Host " Rollback terminé avec succès"
        Write-Host "================================="
        Write-Host ""

        Write-Host "Frontend :" -ForegroundColor Green
        Write-Host "$SelectedFrontendImage"

        Write-Host ""

        Write-Host "Backend :" -ForegroundColor Green
        Write-Host "$SelectedBackendImage"

        Write-Host ""

        cd ../scripts
    }
}