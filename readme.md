# GeoSafe Alert

Application web de supervision et d'alerte géographique permettant de créer, gérer et visualiser des alertes géolocalisées.

Le projet est composé d'un frontend Angular, d'un backend AdonisJS, d'une base de données PostgreSQL/PostGIS et d'une infrastructure cloud Azure provisionnée avec Terraform.

---

## Architecture

L'architecture globale repose sur une séparation claire entre le frontend, le backend, la base de données et l'infrastructure.

```text
                        Utilisateur
                            │
                            │ HTTPS
                            ▼
                 ┌─────────────────────┐
                 │      Frontend       │
                 │      Angular SPA    │
                 │      CesiumJS       │
                 │      Mapbox         │
                 └──────────┬──────────┘
                            │
                       HTTPS / REST
                            │
                            ▼
                 ┌─────────────────────┐
                 │       Backend       │
                 │      AdonisJS       │
                 │     Node.js 22      │
                 │                     │
                 │ Controllers         │
                 │ Services            │
                 │ Models / Lucid ORM  │
                 └──────────┬──────────┘
                            │
                         SQL / ORM
                            │
                            ▼
                 ┌─────────────────────┐
                 │      PostgreSQL     │
                 │       + PostGIS     │
                 │                     │
                 │ Données métier      │
                 │ Données spatiales   │
                 └─────────────────────┘
```

Le backend est **stateless**, ce qui permet notamment d'envisager une montée en charge horizontale.

---

## Structure du projet

Le projet est organisé sous la forme d'un monorepo :

```text
.
├── apps/
│   ├── frontend/
│   └── backend/
│
├── infrastructure/
│   ├── docker/
│   │   ├── frontend/
│   │   ├── backend/
│   │   ├── db/
│   │   └── nginx/
│   │
│   └── terraform/
│       ├── bootstrap/
│       │   └── terraform-state/
│       │
│       ├── environments/
│       │   ├── dev/
│       │   ├── prod/
│       │   └── control/
│       │
│       └── modules/
│           ├── resource-group/
│           ├── storage-account/
│           ├── log-analytics/
│           ├── container-registry/
│           ├── container-app-environment/
│           ├── container-app/
│           ├── key-vault/
│           ├── managed-identity/
│           └── postgres-flexible-server/
│
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Stack technique

### Frontend

* Angular 21
* TypeScript
* CesiumJS
* Resium
* Mapbox
* Angular SPA

Le frontend communique avec le backend via une API REST en HTTPS.

### Backend

* Node.js 22
* AdonisJS
* Lucid ORM
* API REST
* Architecture en couches
* Backend stateless

Le backend contient notamment :

* les controllers ;
* les services métier ;
* les models ;
* la validation des données ;
* la gestion de l'authentification ;
* les accès à la base de données.

### Base de données

* PostgreSQL
* PostGIS

PostGIS permet notamment de gérer les données géographiques et les requêtes spatiales utilisées par GeoSafe Alert.

---

## Développement local avec Docker

L'environnement de développement peut être lancé avec Docker Compose.

### Démarrer l'environnement

```bash
docker compose -p geosafe-dev -f infrastructure/docker/docker-compose.dev.yml up --build -d
```

### Arrêter l'environnement

```bash
docker compose -p geosafe-dev -f infrastructure/docker/docker-compose.dev.yml down
```

### Voir les conteneurs

```bash
docker compose -p geosafe-dev -f infrastructure/docker/docker-compose.dev.yml ps
```

### Consulter les logs

```bash
docker compose -p geosafe-dev -f infrastructure/docker/docker-compose.dev.yml logs -f
```

---

## Services locaux

Une fois les conteneurs démarrés :

| Service                        | URL                         |
| ------------------------------ | --------------------------- |
| Frontend                       | http://localhost:4200       |
| Frontend - Login               | http://localhost:4200/login |
| Backend                        | http://localhost:3333       |
| Interface BDD / administration | http://localhost:8080       |

Le frontend communique avec le backend via le proxy configuré dans l'environnement Docker.

---

# Infrastructure Azure

L'infrastructure cloud est provisionnée avec **Terraform**.

Les environnements sont séparés afin d'éviter les interactions involontaires entre les ressources DEV et PROD.

```text
infrastructure/
└── terraform/
    ├── bootstrap/
    │   └── terraform-state/
    │
    ├── environments/
    │   ├── dev/
    │   ├── prod/
    │   └── control/
    │
    └── modules/
```

Chaque environnement possède ses propres variables et son propre state Terraform.

---

## Ressources Azure

L'infrastructure utilise notamment les services Azure suivants :

* Azure Resource Group
* Azure Storage Account
* Azure Log Analytics Workspace
* Azure Container Registry
* Azure Container Apps Environment
* Azure Container Apps
* Azure Database for PostgreSQL Flexible Server
* Azure Key Vault
* Azure Managed Identity

### Architecture Azure

```text
                         GitHub Actions
                              │
                         OIDC / Azure
                              │
                              ▼
                    ┌──────────────────┐
                    │ Azure Container   │
                    │    Registry       │
                    └────────┬─────────┘
                             │
                  Images Docker
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
     ┌─────────────────┐           ┌─────────────────┐
     │ Container App   │           │ Container App   │
     │    Frontend     │           │     Backend     │
     │    Angular      │           │    AdonisJS     │
     └────────┬────────┘           └────────┬────────┘
              │                             │
              │                             │
              │                       SQL / PostgreSQL
              │                             │
              │                             ▼
              │                   ┌──────────────────┐
              │                   │ PostgreSQL       │
              │                   │ + PostGIS        │
              │                   └──────────────────┘
              │
              └──────── HTTPS ────────► Utilisateur
```

Les logs et métriques des ressources Azure sont centralisés via **Log Analytics**.

Les secrets et informations sensibles peuvent être gérés avec **Azure Key Vault**, avec l'utilisation d'une **Managed Identity** afin d'éviter de stocker directement des identifiants sensibles dans le code ou les pipelines.

---

# Terraform

Terraform est utilisé pour créer et maintenir l'infrastructure Azure sous forme de code (**Infrastructure as Code**).

## Initialisation

Depuis l'environnement concerné :

```bash
cd infrastructure/terraform/environments/dev

terraform init
```

## Validation

```bash
terraform validate
```

## Vérification du format

```bash
terraform fmt -check
```

## Prévisualisation des changements

```bash
terraform plan
```

## Déploiement

```bash
terraform apply
```

## Suppression d'un environnement

```bash
terraform destroy
```

---

## Terraform State

Le state Terraform est stocké dans un **Azure Storage Account** afin de permettre son utilisation de manière centralisée et sécurisée.

Le bootstrap Terraform permet notamment de gérer les ressources nécessaires au stockage du state.

Exemple de structure :

```text
Storage Account
└── terraform-state
    ├── dev.tfstate
    └── prod.tfstate
```

Les states DEV et PROD sont séparés afin d'isoler les environnements.

---

# Azure Container Registry

Les images Docker applicatives sont stockées dans **Azure Container Registry (ACR)**.

Exemple pour l'environnement DEV :

```text
acrgeosafedev.azurecr.io
```

Images utilisées :

```text
acrgeosafedev.azurecr.io/geosafe-frontend:develop
acrgeosafedev.azurecr.io/geosafe-backend:develop
```

Les images sont construites et publiées automatiquement par le pipeline CI/CD.

---

# CI/CD GitHub Actions

Le projet utilise **GitHub Actions** pour automatiser l'intégration et le déploiement.

## Pipeline CI

Le pipeline CI effectue notamment :

1. Récupération du code source
2. Installation des dépendances
3. Vérification du code
4. Analyse de sécurité avec Semgrep
5. Build du frontend
6. Build du backend
7. Tests backend
8. Tests frontend

---

## Pipeline DEV

Le déploiement DEV est déclenché à partir de la branche :

```text
develop
```

Le pipeline :

1. Récupère le code source
2. Construit les images Docker frontend/backend
3. Se connecte à Azure
4. Publie les images dans Azure Container Registry
5. Déploie les nouvelles images dans Azure Container Apps

L'authentification GitHub → Azure utilise **OIDC** avec une fédération d'identité Azure afin d'éviter l'utilisation de secrets Azure statiques dans GitHub Actions.

---

## Pipeline PROD

La branche de production est :

```text
main
```

Le principe de déploiement est :

```text
feature/*
     │
     ▼
 develop
     │
     ▼
   main
     │
     ▼
   PROD
```

Les environnements DEV et PROD disposent de leurs propres ressources et states Terraform.

---

# Environnements

| Environnement | Branche   | Infrastructure |
| ------------- | --------- | -------------- |
| DEV           | `develop` | Azure DEV      |
| PROD          | `main`    | Azure PROD     |

Les branches `feature/*` sont utilisées pour le développement des fonctionnalités.

---

# Sécurité

Plusieurs mécanismes de sécurité sont intégrés à l'architecture :

* Authentification JWT
* Validation des données entrantes
* CORS
* Communication HTTPS
* Séparation des environnements
* Gestion des secrets via Azure Key Vault
* Managed Identity Azure
* Authentification GitHub Actions via OIDC
* Analyse de sécurité du code avec Semgrep
* Backend stateless

Les ressources Azure sont également séparées entre les environnements DEV et PROD.

---

# Communication entre les composants

## Frontend → Backend

Communication via :

```text
HTTPS
   │
   ▼
API REST
   │
   ▼
JSON
```

## Backend → Base de données

Le backend utilise **Lucid ORM** pour communiquer avec PostgreSQL :

```text
AdonisJS
    │
    ▼
Lucid ORM
    │
    ▼
SQL
    │
    ▼
PostgreSQL + PostGIS
```

---

# Scalabilité

L'architecture permet une évolution progressive de la plateforme.

Le backend étant stateless, plusieurs instances peuvent être déployées afin d'augmenter la capacité de traitement.

```text
              ┌── Container App Backend 1
Frontend ─────┼── Container App Backend 2
              └── Container App Backend 3
                         │
                         ▼
                  PostgreSQL
```

Azure Container Apps permet également d'adapter le nombre d'instances selon les besoins.

---

# Gestion des logs et supervision

Les ressources Azure peuvent envoyer leurs logs et métriques vers **Azure Log Analytics**.

Cela permet notamment de faciliter :

* le diagnostic des erreurs ;
* la surveillance des Container Apps ;
* l'analyse des logs applicatifs ;
* le suivi de l'état des services ;
* le diagnostic des problèmes de déploiement.

---

# Prérequis

Pour travailler sur le projet localement, installer :

* Docker
* Node.js 22
* pnpm
* Terraform >= 1.10
* Azure CLI
* Git

## Vérifier Node.js

```bash
node --version
```

## Vérifier pnpm

```bash
pnpm --version
```

## Vérifier Terraform

```bash
terraform version
```

## Vérifier Azure CLI

```bash
az version
```

---

# Connexion Azure

Se connecter à Azure :

```bash
az login
```

Vérifier le compte actuellement utilisé :

```bash
az account show
```

Lister les abonnements disponibles :

```bash
az account list --output table
```

Sélectionner l'abonnement souhaité :

```bash
az account set --subscription "<SUBSCRIPTION_ID>"
```

---

# Installation du projet

Cloner le repository :

```bash
git clone <repository-url>
cd GeoSafe
```

Installer les dépendances :

```bash
pnpm install
```

Le projet utilise **pnpm** et **Turbo** pour gérer le monorepo.

---

# Développement

Pour lancer l'environnement complet avec Docker :

```bash
docker compose -p geosafe-dev -f infrastructure/docker/docker-compose.dev.yml up --build -d
```

Une fois les services démarrés :

```text
Frontend  → http://localhost:4200
Backend   → http://localhost:3333
```

---

# Workflow Git

Le workflow recommandé est :

```text
feature/ma-fonctionnalite
          │
          ▼
       develop
          │
          ▼
         main
```

### Création d'une branche

```bash
git checkout develop
git pull

git checkout -b feature/ma-fonctionnalite
```

Après développement :

```bash
git add .
git commit -m "feat: ajout de ma fonctionnalité"
git push
```

Une Pull Request peut ensuite être créée vers `develop`.

---

# Déploiement

Le déploiement est automatisé par GitHub Actions.

```text
                Git Push
                   │
                   ▼
             GitHub Actions
                   │
          ┌────────┴────────┐
          ▼                 ▼
       Frontend           Backend
       Docker              Docker
          │                 │
          └────────┬────────┘
                   ▼
          Azure Container
             Registry
                   │
                   ▼
          Azure Container Apps
                   │
                   ▼
              Application
```

---

# Rollback

En cas de problème après un déploiement, le rollback consiste à redéployer une version précédente des images Docker ou à revenir à une version précédente du code/infrastructure.

Les images sont versionnées afin de permettre l'identification des versions déployées.

Exemples de tags :

```text
develop
dev-<run_number>
```

Pour l'infrastructure Terraform, il est recommandé de vérifier le plan avant toute modification :

```bash
terraform plan
```

puis d'appliquer uniquement les changements attendus :

```bash
terraform apply
```

---

# Évolutions possibles

L'architecture actuelle permet d'envisager plusieurs évolutions :

* séparation de certains domaines métier en microservices ;
* ajout d'un système de messaging avec Kafka ou RabbitMQ ;
* amélioration de l'observabilité ;
* amélioration de la stratégie de sauvegarde PostgreSQL ;
* automatisation renforcée des procédures de rollback.

---

# Documentation

La documentation d'architecture décrit notamment :

* l'architecture générale ;
* les composants applicatifs ;
* les flux Frontend / Backend / Base de données ;
* l'infrastructure ;
* la sécurité ;
* les environnements ;
* le déploiement ;
* la stratégie d'évolution.

---

# Licence

Projet réalisé dans le cadre du projet **GeoSafe Alert**.
