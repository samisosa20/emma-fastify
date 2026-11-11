# Fiona Backend API (`fiona-node-api-ts`)

## 1. Contexto de Negocio & Propósito
**Fiona Backend** es el motor asíncrono de API REST para la plataforma de finanzas personales Fiona.
Su responsabilidad principal es procesar y gestionar flujos financieros transaccionales, auditoría y valoración de patrimonio (inmuebles, vehículos, activos fijos), cálculo de rendimientos y telemetría de inversiones, presupuestos mensuales, pagos planificados recurrentes y generación de reportes financieros analíticos consumidos por el cliente frontend (`fiona-front`).

---

## 2. Patrón de Arquitectura: Hexagonal / DDD en `packages/`
El backend implementa una arquitectura desacoplada por dominios de negocio ubicados en la carpeta `packages/`:

```text
packages/
└── <dominio>/                     # Ej: account, investment, movement, heritage, budget, etc.
    ├── domain/                   # Entidades, interfaces puras de datos y contratos de repositorio
    │   └── interfaces/
    ├── application/              # Casos de uso (*.use-case.ts) con la lógica transaccional pura
    └── infrastructure/           # Implementación del repositorio (*.repository.ts) interactuando con Prisma
```

### Dominios del Sistema:
- `account`: Cuentas financieras (bancarias, efectivo, tarjetas) y sus clasificaciones.
- `movement`: Registro de ingresos, gastos, transferencias y kardex financiero.
- `investment`: Portafolios de inversión, cálculo de valorizaciones, rendimientos y aportes.
- `heritage`: Inmovilizados / activos patrimoniales (bienes raíces, vehículos, activos de valor).
- `budget`: Presupuestos asignados por categorías y períodos.
- `plannedPayment`: Automatización y proyección de pagos periódicos / recurrentes.
- `category` & `groupCategory`: Taxonomía jerárquica de categorización de gastos/ingresos.
- `report`: Agregaciones analíticas (flujo de caja, balance general, regla 50/30/20, distribución).
- `period`: Cortes temporales y ciclos contables/financieros.
- `badge`: Sistema de insignias y gamificación financiera.
- `user`: Perfiles y configuración del usuario.
- `shared`: Tipos comunes (`CommonParamsPaginate`, `ErrorMessage`, `Paginate`), clientes compartidos y middleware común.

### Capa de Transporte (`src/`):
- `src/controllers/`: Controladores HTTP livianos. Su única responsabilidad es recibir el request, validar y delegar al caso de uso correspondiente en `packages/`. **No escribir queries directas de base de datos en controladores**.
- `src/routes/`: Definición y registro de endpoints mediante `@fastify/autoload` bajo el prefijo `/api/v2`.
- `src/jobs/`: Tareas en segundo plano con `node-cron` (ej. generación diaria de movimientos planificados).
- `src/middleware/`: Manejo de JWT, autenticación y decoradores de Fastify.
- `src/settings/`: Contratos de OpenAPI / Swagger y configuraciones de arranque.

---

## 3. Stack Técnico Core
- **Runtime:** Node.js `>=26.0.0`
- **Framework Web:** Fastify `^5.12.8` (utilizando `LogController` para gestión de logging de peticiones)
- **Compilador:** TypeScript `7.0.2` (nativo en Go, compilación con `tsc && tsc-alias`)
- **Ejecución en Desarrollo:** `tsx watch src/index.ts`
- **Build de Producción:** `npm run build` (`tsc && tsc-alias` en `dist/`)
- **Persistencia & ORM:** Prisma `^7.10.1` con `@prisma/adapter-mariadb` sobre MySQL/MariaDB (`mysql2` y `mariadb`)
- **Paginación:** `prisma-extension-pagination`
- **Validación:** Zod `4.6.7` para validación estricta de payloads, queries y parámetros
- **Linter de Calidad:** `oxlint` (`.oxlintrc.json`), compatible de forma nativa con TS 7 y reglas estándar de ESLint
- **Autenticación:** Better Auth `^1.7.20` y `@fastify/jwt 10.2.7`
- **Documentación OpenAPI:** `@fastify/swagger` y `@fastify/swagger-ui`

---

## 4. Estándares de Calidad y Código Limpio (Linter / ESLint Rules)
Para evitar código muerto, imports huérfanos o variables innecesarias:

1. **Variables y argumentos no utilizados (`no-unused-vars`):**
   - No dejar variables, imports o parámetros sin usar. Si un argumento de Fastify (`_request`, `_reply`) o error de catch es requerido por firma pero no se utiliza, debe prefijarse con guion bajo `_` (ej. `_req`, `_reply`, `_err`).
2. **Uso de Tipado Estricto:**
   - Evitar el uso indiscriminado de `any`. Definir interfaces en la carpeta `domain/interfaces/` de cada paquete.
3. **Comando de Verificación de Linter:**
   - Correr `npm run lint` para comprobar que no queden errores ni advertencias en el proyecto.
   - Correr `npm run lint:fix` para corregir automáticamente problemas de formato o variables sin reasignación.

---

## 5. Reglas Críticas de Integración con `fiona-front`

El cliente frontend (`fiona-front`) está construido en **Next.js 16 (React 19)** y depende directamente del contrato de esta API:

1. **Contrato Estricto con Orval**:
   - Cada endpoint en `src/routes/` debe declarar su propiedad `schema` de Fastify con la definición de `body`, `querystring`, `params` y respuestas `response` (códigos 200, 201, 400, etc.).
   - `fiona-front` ejecuta `npx orval` para compilar los tipos y hooks de TanStack Query leyendo la especificación OpenAPI de este backend. **Un endpoint sin schema o con tipos inconsistentes romperá la compilación del frontend**.
2. **Formato de Errores para Formularios**:
   - Las validaciones que fallen en la API deben devolver estructuras predecibles para mapear directamente en `react-hook-form`:
     ```json
     {
       "statusCode": 400,
       "error": "Bad Request",
       "message": "Validation error",
       "fields": {
         "amount": "El monto debe ser superior a 0"
       }
     }
     ```
3. **Estructura para Gráficos (Recharts)**:
   - Los endpoints analíticos (`/api/v2/reports/*`, balances históricos, retornos de inversión) deben devolver arreglos con fechas serializadas en ISO (`YYYY-MM-DD` o ISO 8601) y valores numéricos limpios listos para consumo directo en Recharts sin transformaciones complejas en el cliente.
4. **Soporte PWA / Offline Sync**:
   - Las mutaciones de transacciones pueden ser encoladas localmente en el frontend durante cortes de red y enviadas en ráfaga al reconectar. Los endpoints de inserción deben ser idempotentes o tolerar procesamiento continuo.

---

## 6. Visión de Negocio: TRM y Multidivisa (Planificación Futura)
Aunque la TRM (Tasa Representativa del Mercado) actualmente tiene valores base o por defecto en los movimientos (`trm: 1`), el diseño futuro del sistema contempla:
- **Modelo Multidivisa:** Cuentas e inversiones en monedas extranjeras (ej. USD, EUR) consolidando balances en la moneda principal (COP).
- **Histórico de Tasas de Cambio:** Registro diario de TRM para convertir y valorar patrimonio e inversiones a valor de mercado en la fecha de consulta (`datePurchase` o corte de período).
- **Regla de Desarrollo:** Al tocar tablas de `movement`, `account` o `investment`, asegurar que el campo `trm` y la moneda (`currency`) se preserven en los esquemas y cálculos, evitando asumir que todas las operaciones son siempre en la misma moneda base.

---

## 7. Comandos de Operación Diaria
- **Servidor de Desarrollo (Live Reload):** `npm run dev` (`tsx watch src/index.ts`)
- **Verificación de Linter:** `npm run lint` (o corrección con `npm run lint:fix`)
- **Compilación TypeScript:** `npm run build` (`tsc && tsc-alias`)
- **Migraciones de Base de Datos:** `npm run prisma:migrate:dev`
- **Regenerar Cliente de Prisma:** `npm run prisma:generate`
- **Arranque en Producción:** `npm run start`

