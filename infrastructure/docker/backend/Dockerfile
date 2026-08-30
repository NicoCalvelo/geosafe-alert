FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache postgresql-client

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./

COPY apps/backend ./apps/backend/

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/backend

RUN pnpm build

EXPOSE 3333

USER node

CMD ["node", "build/bin/server.js"]