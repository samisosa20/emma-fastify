# --- Etapa 1: Dependencias y Build ---
FROM node:26-alpine AS builder
WORKDIR /app

# Copiamos archivos de dependencias
COPY package.json package-lock.json* ./
# Copiamos el esquema de Prisma (necesario para generar el cliente)
COPY prisma ./prisma/

# Instalamos TODAS las deps (incluyendo devDependencies para compilar TS)
RUN npm ci

# Generamos el cliente de Prisma v7
RUN npx prisma generate

# Copiamos el código fuente
COPY tsconfig.json ./
COPY packages ./packages
COPY src ./src

# Compilamos TypeScript a JS (genera carpeta /dist)
RUN npm run build


# --- Etapa 2: Limpieza de Dependencias ---
FROM node:26-alpine AS deps-prod
WORKDIR /app
COPY package.json package-lock.json* ./

# Instalamos SOLO dependencias de producción (ahorra mucho espacio)
# Quitamos el npx prisma generate de aquí porque ya lo hicimos en la Etapa 1
RUN npm ci --omit=dev


# --- Etapa 3: Runner Final (Ligera) ---
FROM node:26-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8010

# 1. Copiamos node_modules limpios de producción
COPY --from=deps-prod /app/node_modules ./node_modules

# 2. ¡CRUCIAL PARA PRISMA v7!: Copiamos el cliente generado en la Etapa 1
# Sin esto, el runner de producción no sabrá qué es '@prisma/client'
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copiamos el código compilado
COPY --from=builder /app/dist ./dist
# Copiamos package.json por si algún script lo requiere
COPY package.json ./

# Copiamos la carpeta prisma (necesaria para las migraciones en el arranque)
COPY --from=builder /app/prisma ./prisma

# Exponemos puerto
EXPOSE 8010

# Comando de inicio: Primero migra, luego arranca
# Al ejecutarse en el CMD, 'prisma migrate deploy' ya tendrá acceso a la variable DATABASE_URL de Docker
CMD sh -c "npx prisma migrate deploy && node dist/src/index.js"