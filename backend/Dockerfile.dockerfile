# ─────────────────────────────────────────────
# STAGE 1 — Build
# ─────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Instala dependências (usa cache do Docker se package.json não mudar)
COPY package*.json ./
RUN npm ci

# Copia o resto do código
COPY . .

# Gera o Prisma Client + compila TS
RUN npx prisma generate
RUN npm run build

# ─────────────────────────────────────────────
# STAGE 2 — Runtime
# ─────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Só deps de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Prisma Client (o schema é necessário para o Prisma)
COPY prisma ./prisma
RUN npx prisma generate

# Código compilado
COPY --from=build /app/dist ./dist

# Porta
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]