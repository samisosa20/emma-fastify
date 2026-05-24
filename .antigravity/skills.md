# Antigravity Developer Agent Skills - Emma Fastify (Backend API)

## Contexto de Negocio & Arquitectura de Dominio

**Emma Fastify** es el motor de API REST asíncrono para el ecosistema de finanzas personales Fiona. Gestiona flujos financieros transaccionales, auditoría de patrimonio, telemetría de inversiones y automatizaciones en segundo plano, sirviendo de manera segura al frontend.

---

## Patrón de Arquitectura y Estructura del Proyecto

El backend implementa una arquitectura modular desacoplada por dominios en `packages/` junto con el ecosistema de carga de Fastify:

- `packages/`: Contiene módulos aislados por contexto financiero (`movement`, `investment`, `heritage` para inmovilizados, `budget`, `plannedPayment`). Aloja la lógica de negocio, tipos y consultas de dominio.
- `prisma/`: Capa de persistencia. Define el modelo relacional de datos (`schema.prisma`) orientado a MySQL y controla el histórico de migraciones.
- `src/controllers/` & `src/routes/`: Capa de transporte y endpoints que exponen las rutas de la API, registradas automáticamente mediante `@fastify/autoload`.
- `src/jobs/`: Tareas programadas en segundo plano controladas por `node-cron` (ej. procesamiento de pagos periódicos, actualizaciones de valorizaciones).

---

## Stack Técnico Core & Dependencias

### Core API & Servidor

- **Framework Principal:** Fastify `^5.8.5` (Optimizado para alto rendimiento y baja sobrecarga asíncrona).
- **Lenguaje & Compilación:** TypeScript `^6.0.3` con soporte de alias (`tsconfig-paths` y `tsc-alias`) ejecutado bajo Node.js `>=24.0.0`.
- **Autenticación & Seguridad:** Better Auth `^1.6.11`, `@fastify/jwt` (`10.1.0`) para resguardar los endpoints financieros, y `@fastify/rate-limit` para mitigación de abusos.

### ORM & Persistencia

- **ORM:** Prisma `^6.19.3` interactuando con el driver `mysql2`.
- **Extensiones:** `prisma-extension-pagination` para estandarizar la paginación nativa de transacciones, históricos de movimientos y Kardex financiero.
- **Validación de Capa de Entrada:** Zod `4.4.3` para validar y tipar estrictamente los payloads (`body`, `query`, `params`) antes de que impacten al ORM o la lógica interna.

### Documentación & Utilidades

- **OpenAPI / Swagger:** `@fastify/swagger` y `@fastify/swagger-ui` estructurados de forma que alimenten el contrato OpenAPI consumido por Orval en el frontend.

---

## Reglas de Arquitectura y Desarrollo para el Agente

1. **Evolución Defensiva del Esquema (Prisma):** Cada vez que alteres `prisma/schema.prisma`, asegúrate de correr o planificar `npm run prisma:migrate:dev`. No dejes modelos sin tipos correspondientes en Zod para la validación de los controladores.
2. **Modularidad en Packages:** Si vas a programar lógica transaccional o de cálculo de rendimientos, desarróllala dentro del dominio correspondiente en la carpeta `packages/` (ej. `packages/investment` para valorizaciones) manteniendo la API limpia de lógica pesada de negocio en los controladores globales.
3. **Contrato OpenAPI Limpio:** Al crear rutas en `src/routes/`, siempre debes definir el esquema de Fastify (`schema` con `body`, `querystring`, `response`) usando Zod o JSON Schema para que la documentación de Swagger se autogenere limpia. Esto es vital para que no se rompa la autogeneración de Orval en el cliente.
4. **Despliegues con PM2:** La API corre en producción monitorizada por PM2 a través de `npm run deploy:prod`, aplicando migraciones automáticas (`prisma migrate deploy`) antes de reiniciar el daemon en caliente con resolución de paths de TypeScript.

## Interconexión con el Ecosistema Frontend (Fiona Front)

El agente debe entender que esta API sirve exclusivamente a un cliente de alta interactividad (`fiona-front`) desarrollado en Next.js 16 (React 19) y PWA.

### Reglas de Integración de Extremo a Extremo:

1. **Contrato Estricto con Orval:** Cada vez que se cree, modifique o elimine una ruta en Fastify, los esquemas de validación de entrada/salida (Zod/Swagger) deben quedar perfectamente declarados. El frontend utiliza **Orval** para leer el Swagger de esta API y generar automáticamente sus hooks de TanStack Query. Un tipado laxo o incorrecto en Fastify romperá la compilación del frontend.
2. **Estrategia PWA & Offline:** Al diseñar endpoints de mutación (creación/edición de movimientos), ten en cuenta que el frontend puede almacenar transacciones en local mediante Workbox durante el modo offline y sincronizarlas masivamente al recuperar conexión. Las rutas de la API deben ser capaces de procesar estos flujos de forma eficiente.
3. **Estructura de Datos para Gráficos:** Los endpoints que calculen históricos de patrimonio, balances o rendimientos de inversiones deben estructurar los arrays de respuesta optimizados para el consumo directo de **Recharts** (fechas estandarizadas en ISO o formatos compatibles con `date-fns`).
4. **Respuestas de Validación Legibles:** Los errores de validación arrojados por Zod en los controladores de Fastify deben devolver un mapa de campos claro (ej. `{ fields: { amount: "El monto debe ser mayor a 0" } }`) para que `react-hook-form` en el frontend pueda asociar el error al input correspondiente de manera nativa.
