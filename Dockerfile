# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN node ace build

# ---- Production Stage ----
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/build ./
RUN npm install --omit=dev

EXPOSE 3333

CMD ["sh", "-c", "node ace migration:run --force && node bin/server.js"]
