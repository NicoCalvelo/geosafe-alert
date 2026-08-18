FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY package.json .
COPY turbo.json .

COPY apps/frontend ./apps/frontend/

RUN pnpm install

USER node

EXPOSE 4200