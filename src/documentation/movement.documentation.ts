import { FastifySchema } from "fastify/types/schema";
import {
  defaultSuccesResponse,
  SchemaDefault,
  paginationDocumentation,
  paginationParamsDocumentation,
} from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getBody, getProperties } from "./components/realtions";
import { categoryObjectSchema } from "./category.documentation";
import { accountObjectSchema } from "./account.documentation";
import { eventObjectSchema } from "./event.documentation";
import { extraInvestmentObjectSchema } from "./investment.documentation";
import { date } from "zod";

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
  { name: "type", type: "string", body: ["create", "update"], private: true },
  {
    name: "datePurchase",
    type: "string",
    body: ["create", "update"],
    private: false,
  },
  {
    name: "categoryId",
    type: "string",
    body: ["create", "update"],
    private: true,
  },
  {
    name: "category",
    type: "object",
    body: false,
    private: false,
    properties: getProperties(categoryObjectSchema),
  },
  {
    name: "accountId",
    type: "string",
    body: ["create", "update"],
    private: true,
  },
  {
    name: "account",
    type: "object",
    body: false,
    private: false,
    properties: getProperties(accountObjectSchema),
  },
  {
    name: "eventId",
    type: "string",
    body: ["create", "update"],
    private: true,
  },
  {
    name: "event",
    type: "object",
    body: false,
    private: false,
    properties: getProperties(eventObjectSchema),
  },
  {
    name: "investmentId",
    type: "string",
    body: ["create", "update"],
    private: true,
  },
  {
    name: "investment",
    type: "object",
    body: false,
    private: false,
    properties: getProperties(extraInvestmentObjectSchema),
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
    200: movementResponseSchema,
    ...errorDocumentation,
  },
};

export const listMovementsDocumentation: FastifySchema = {
  description: "Listar todos los movimientos con paginación",
  tags: ["Movement"],
  querystring: {
    type: "object",
    properties: {
      ...paginationParamsDocumentation(),
      accountId: { type: "string", description: "ID de la Cuenta" },
      eventId: { type: "string", description: "ID del Evento" },
      investmentId: { type: "string", description: "ID de la Inversión" },
      datePurchase: { type: "string", description: "Fecha de Compra" },
      category: { type: "string", description: "Categoria del movimiento" },
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
