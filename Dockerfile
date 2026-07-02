# --- Etapa 1: Dependencias y Build ---
FROM node:26-alpine AS builder
WORKDIR /app

# Copiamos archivos de dependencias
COPY package.json package-lock.json* ./
# Copiamos el esquema de Prisma (necesario para generar el cliente)
COPY prisma ./prisma/
COPY prisma.config.js ./

# Instalamos TODAS las deps (incluyendo devDependencies para compilar TS)
RUN npm ci

# Generamos el cliente de Prisma v7
RUN npx prisma generate

# Copiamos el código fuente y la configuración de TS
COPY tsconfig.json ./
COPY packages ./packages
COPY src ./src

# Compilamos TypeScript a JS (genera carpeta /dist)
RUN npm run build


# --- Etapa 2: Limpieza de Dependencias ---
FROM node:26-alpine AS deps-prod
WORKDIR /app
COPY package.json package-lock.json* ./

# Instalamos SOLO dependencias de producción
RUN npm ci --omit=dev


# --- Etapa 3: Runner Final (Ligera) ---
FROM node:26-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8010

# 1. Copiamos node_modules limpios de producción
COPY --from=deps-prod /app/node_modules ./node_modules

# 2. Copiamos el cliente generado de Prisma v7
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# 3. Copiamos el código compilado
COPY --from=builder /app/dist ./dist
COPY package.json ./

# 4. ¡CRUCIAL!: Copiamos el tsconfig.json para que tsconfig-paths no falle en producción
COPY tsconfig.json ./

# Copiamos la carpeta prisma (necesaria para las migraciones en el arranque)
COPY --from=builder /app/prisma ./prisma

# Exponemos el puerto
EXPOSE 8010

# Comando de inicio alineado con tu package.json:
# Primero corre las migraciones con Prisma y luego levanta la app usando tu script oficial "npm start"
CMD sh -c "npx prisma migrate deploy && npm start"