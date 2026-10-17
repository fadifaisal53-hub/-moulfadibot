FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml tsconfig.base.json ./

COPY packages/core/package.json ./packages/core/
COPY packages/persistence/package.json ./packages/persistence/
COPY packages/llm/package.json ./packages/llm/
COPY packages/gamification/package.json ./packages/gamification/
COPY packages/assessment/package.json ./packages/assessment/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --no-frozen-lockfile

COPY packages ./packages
COPY apps/api ./apps/api

EXPOSE 3001

CMD ["pnpm", "--filter", "@moulinex/api", "start"]
