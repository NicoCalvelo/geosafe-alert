# GeoSafe Alert

Application de supervision et d'alerte géographique composée d'un frontend, d'un backend et d'une infrastructure cloud déployée avec Terraform.

## Architecture

Le projet est organisé en plusieurs parties :

```
.
├── apps/
│   ├── frontend
│   └── backend
│
├── infrastructure/
│   ├── docker/
│   │   ├── frontend
│   │   ├── backend
│   │   ├── db
│   │   └── nginx
│   │
│   └── terraform/
│       ├── environments/
│       │   ├── dev
│       │   └── prod
│       │
│       └── modules/
│           ├── resource-group
│           ├── storage-account
│           ├── log-analytics
│           ├── container-registry
│           └── container-app-environment
```

## Développement local avec Docker

Pour lancer l'environnement de développement :

```bash
docker compose -p geosafe-dev -f infrastructure/docker/docker-compose.dev.yml up --build -d
```

Pour arrêter les services :

```bash
docker compose -p geosafe-dev -f infrastructure/docker/docker-compose.dev.yml down
```

## Services locaux

Une fois les conteneurs démarrés :

| Service         | URL                         |
| --------------- | --------------------------- |
| Frontend        | http://localhost:4200/login |
| Backend         | http://localhost:3333       |
| Base de données | http://localhost:8080       |

## Infrastructure Azure

L'infrastructure cloud est provisionnée avec Terraform.

Les environnements sont séparés :

```
terraform/
└── environments/
    ├── dev
    ├── prod
    └── control
```

Chaque environnement possède ses propres variables et son propre state Terraform.

Le state Terraform est stocké dans Azure Storage :

* Storage Account : `stgeosafedev`
* Container : `terraform-state`
* State DEV : `dev.tfstate`

## Ressources Azure déployées

L'environnement DEV utilise :

* Azure Resource Group
* Azure Storage Account
* Azure Log Analytics Workspace
* Azure Container Registry
* Azure Container Apps Environment

Les images Docker sont stockées dans Azure Container Registry.

## Terraform

Initialisation :

```bash
cd infrastructure/terraform/environments/dev

terraform init
```

Vérification du plan :

```bash
terraform plan
```

Déploiement :

```bash
terraform apply
```

Suppression de l'environnement :

```bash
terraform destroy
```

## Container Registry

Les images applicatives sont publiées dans Azure Container Registry :

```
acrgeosafedev.azurecr.io
```

Exemples :

```
acrgeosafedev.azurecr.io/geosafe-frontend:develop

acrgeosafedev.azurecr.io/geosafe-backend:develop
```

## CI/CD GitHub Actions

Le pipeline DEV est déclenché sur la branche :

```
develop
```

Le pipeline :

1. Récupère le code source
2. Construit les images Docker frontend/backend
3. Publie les images dans Azure Container Registry
4. Déploie les nouvelles versions dans Azure Container Apps

L'authentification Azure utilise GitHub OIDC avec une fédération d'identité Azure AD.

## Environnements

| Environnement | Branche | Infrastructure |
| ------------- | ------- | -------------- |
| DEV           | develop | Azure DEV      |
| PROD          | main    | Azure PROD     |

## Prérequis

Installer :

* Docker
* Node.js
* pnpm
* Terraform >= 1.10
* Azure CLI

Connexion Azure :

```bash
az login
```

Vérification :

```bash
az account show
```
