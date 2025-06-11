import { FastifySchema } from "fastify/types/schema";
import {
  defaultSuccesResponse,
  SchemaDefault,
  paginationDocumentation,
  paginationParamsDocumentation,
} from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getBody } from "./components/realtions";

const movementObjectSchema: SchemaDefault[] = [
  { name: "id", type: "string", body: false, private: false },
  {
    name: "description",
    type: "string",
    body: ["create", "update"],
    private: false,
  },
  {
    name: "amount",
    type: "number",
    body: ["create", "update"],
    private: false,
  },
  { name: "type", type: "string", body: ["create", "update"], private: false },
  { name: "date", type: "string", body: ["create", "update"], private: false },
  {
    name: "categoryId",
    type: "string",
    body: ["create", "update"],
    private: false,
  },
  {
    name: "accountId",
    type: "string",
    body: ["create", "update"],
    private: false,
  },
  { name: "userId", type: "string", body: ["create"], private: false },
  { name: "createdAt", type: "string", body: false, private: false },
  { name: "updatedAt", type: "string", body: false, private: false },
];

const movementResponseSchema = defaultSuccesResponse(movementObjectSchema);

export const createMovementDocumentation: FastifySchema = {
  description: "Crear un nuevo movimiento (transacción)",
  tags: ["Movement"],
  body: getBody(movementObjectSchema, "create"),
  response: {
    201: movementResponseSchema,
    ...errorDocumentation,
  },
};

export const listMovementsDocumentation: FastifySchema = {
  description: "Listar todos los movimientos con paginación",
  tags: ["Movement"],
  params: {
    type: "object",
    properties: {
      ...paginationParamsDocumentation(),
    },
  },
  response: {
    200: paginationDocumentation(movementObjectSchema),
    ...errorDocumentation,
  },
};

export const getMovementDocumentation: FastifySchema = {
  description: "Obtener detalles de un movimiento por ID",
  tags: ["Movement"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Movimiento" },
    },
  },
  response: {
    200: movementResponseSchema,
    ...errorDocumentation,
  },
};

export const updateMovementDocumentation: FastifySchema = {
  description: "Actualizar un movimiento existente por ID",
  tags: ["Movement"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Movimiento" },
    },
  },
  body: getBody(movementObjectSchema, "update"),
  response: {
    200: movementResponseSchema,
    ...errorDocumentation,
  },
};

export const deleteMovementDocumentation: FastifySchema = {
  description: "Eliminar un movimiento por ID",
  tags: ["Movement"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Movimiento" },
    },
  },
  response: {
    200: movementResponseSchema,
    ...errorDocumentation,
  },
};
