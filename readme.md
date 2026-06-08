# geosafe-alert

## Docker Setup

Pour générer votre docker, utilisez cette commande:

```bash
docker compose -p geosafe-dev -f infrastructure/docker/docker-compose.dev.yml up --build -d
```

## Test Sites

Une fois le conteneur démarré, vous pouvez accéder aux différents services:

- **Frontend**: http://localhost:4200/login
- **Backend**: http://localhost:3333/
- **BDD**: http://localhost:8080/login?next=/
