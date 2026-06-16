FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY apps/backend/build ./build
COPY apps/backend/package.json ./

RUN pnpm install --prod --frozen-lockfile

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3333

CMD ["node", "build/bin/server.js"]