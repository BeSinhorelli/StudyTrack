# ─────────────────────────────────────────────
# STAGE 1 — Build
# ─────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─────────────────────────────────────────────
# STAGE 2 — Runtime (nginx)
# ─────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Config customizada (proxy /api → backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Estáticos buildados
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]