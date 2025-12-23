# On part de l'image PostGIS officielle (version 16)
FROM postgis/postgis:16-3.4

# Métadonnées
LABEL description="Base de données PostGIS pré-configurée pour le cours GeoSafe"
LABEL maintainer="CALVELO Nicolas"

# On définit les variables d'environnement par défaut
ENV POSTGRES_USER=root
ENV POSTGRES_PASSWORD=123456
ENV POSTGRES_DB=geosafe

# Copier scripts SQL dans le dossier d'initialisation de l'image
COPY ./init/ /docker-entrypoint-initdb.d/