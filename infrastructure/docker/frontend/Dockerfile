# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app

COPY apps/frontend/package*.json ./
RUN npm ci

COPY apps/frontend ./
RUN npm run build -- --configuration production

# ---- Production Stage ----
FROM nginx:alpine

COPY --from=builder /app/dist/geosafe-front/browser /usr/share/nginx/html
COPY infrastructure/docker/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]