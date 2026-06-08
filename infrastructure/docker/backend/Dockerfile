FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=build /app/apps/backend/build ./build
COPY --from=build /app/apps/backend/package.json ./

COPY --from=build /app/apps/backend/config ./config
COPY --from=build /app/apps/backend/start ./start
COPY --from=build /app/apps/backend/.env ./.env

RUN pnpm install --prod --frozen-lockfile

EXPOSE 3333

CMD ["pnpm", "prod"]