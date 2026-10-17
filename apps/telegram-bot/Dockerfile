FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

# 1. نسخ ملفات الإعداد الأساسية من الجذر
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml tsconfig.base.json ./

# 2. نسخ ملفات package.json الخاصة بكل حزمة (لتسريع الكاش)
COPY packages/core/package.json ./packages/core/
COPY packages/persistence/package.json ./packages/persistence/
COPY packages/llm/package.json ./packages/llm/
COPY packages/gamification/package.json ./packages/gamification/
COPY packages/assessment/package.json ./packages/assessment/
COPY apps/api/package.json ./apps/api/

# 3. تثبيت الحزم من الجذر (هذا ما يحل مشكلة workspace)
RUN pnpm install --no-frozen-lockfile

# 4. نسخ باقي الأكواد
COPY packages ./packages
COPY apps/api ./apps/api

EXPOSE 3001

# 5. تشغيل API
CMD ["pnpm", "--filter", "@moulinex/api", "start"]
