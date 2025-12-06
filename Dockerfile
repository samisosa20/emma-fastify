# --- Etapa 1: Dependencias y Build ---
FROM node:23-alpine AS builder
WORKDIR /app

# Copiamos archivos de dependencias
COPY package.json package-lock.json* ./
# Copiamos el esquema de Prisma (necesario para generar el cliente)
COPY prisma ./prisma/

# Instalamos TODAS las deps (incluyendo devDependencies para compilar TS)
RUN npm ci

# Generamos el cliente de Prisma
RUN npx prisma generate

# Copiamos el código fuente
COPY tsconfig.json ./
COPY packages ./packages
COPY src ./src
# Si tienes otros archivos necesarios para el build, agrégalos aquí

# Compilamos TypeScript a JS (genera carpeta /dist)
RUN npm run npm

# --- Etapa 2: Limpieza de Dependencias ---
FROM node:23-alpine AS deps-prod
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalamos SOLO dependencias de producción (ahorra mucho espacio)
RUN npm ci --omit=dev && npx prisma generate

# --- Etapa 3: Runner Final (Ligera) ---
FROM node:23-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8010

# Copiamos node_modules limpios
COPY --from=deps-prod /app/node_modules ./node_modules
# Copiamos el código compilado
COPY --from=builder /app/dist ./dist
# Copiamos package.json por si algún script lo requiere
COPY package.json ./

# Exponemos puerto
EXPOSE 8010

# Comando de inicio directo (Sin ts-node ni tsconfig-paths, ya es JS puro)
CMD ["node", "dist/src/index.js"]
