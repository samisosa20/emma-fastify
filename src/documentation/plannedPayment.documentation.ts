import { FastifySchema } from "fastify/types/schema";
import {
  defaultSuccesResponse,
  SchemaDefault,
  paginationDocumentation,
  paginationParamsDocumentation,
} from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getBody } from "./components/realtions";

const plannedPaymentObjectSchema: SchemaDefault[] = [
  { name: "id", type: "string", body: false, private: false },
  { name: "name", type: "string", body: ["create", "update"], private: false },
  {
    name: "amount",
    type: "number",
    body: ["create", "update"],
    private: false,
  },
  {
    name: "paymentDate",
    type: "string",
    body: ["create", "update"],
    private: false,
  },
  {
    name: "frequency",
    type: "string",
    body: ["create", "update"],
    private: false,
  },
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

const plannedPaymentResponseSchema = defaultSuccesResponse(
  plannedPaymentObjectSchema
);

export const createPlannedPaymentDocumentation: FastifySchema = {
  description: "Crear un nuevo pago planificado",
  tags: ["PlannedPayment"],
  body: getBody(plannedPaymentObjectSchema, "create"),
  response: {
    201: plannedPaymentResponseSchema,
    ...errorDocumentation,
  },
};

export const listPlannedPaymentsDocumentation: FastifySchema = {
  description: "Listar todos los pagos planificados con paginación",
  tags: ["PlannedPayment"],
  params: {
    type: "object",
    properties: {
      ...paginationParamsDocumentation(),
    },
  },
  response: {
    200: paginationDocumentation(plannedPaymentObjectSchema),
    ...errorDocumentation,
  },
};

export const getPlannedPaymentDocumentation: FastifySchema = {
  description: "Obtener detalles de un pago planificado por ID",
  tags: ["PlannedPayment"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Pago Planificado" },
    },
  },
  response: {
    200: plannedPaymentResponseSchema,
    ...errorDocumentation,
  },
};

export const updatePlannedPaymentDocumentation: FastifySchema = {
  description: "Actualizar un pago planificado existente por ID",
  tags: ["PlannedPayment"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Pago Planificado" },
    },
  },
  body: getBody(plannedPaymentObjectSchema, "update"),
  response: {
    200: plannedPaymentResponseSchema,
    ...errorDocumentation,
  },
};

export const deletePlannedPaymentDocumentation: FastifySchema = {
  description: "Eliminar un pago planificado por ID",
  tags: ["PlannedPayment"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Pago Planificado" },
    },
  },
  response: {
    200: plannedPaymentResponseSchema,
    ...errorDocumentation,
  },
};
