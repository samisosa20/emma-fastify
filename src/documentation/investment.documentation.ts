import { FastifySchema } from "fastify/types/schema";
import {
  defaultSuccesResponse,
  SchemaDefault,
  paginationDocumentation,
  paginationParamsDocumentation,
} from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getBody } from "./components/realtions";

const investmentObjectSchema: SchemaDefault[] = [
  { name: "id", type: "string", body: false, private: false },
  { name: "name", type: "string", body: ["create", "update"], private: false },
  {
    name: "amount",
    type: "number",
    body: ["create", "update"],
    private: false,
  },
  { name: "type", type: "string", body: ["create", "update"], private: false },
  {
    name: "investmentDate",
    type: "string",
    body: ["create", "update"],
    private: false,
  },
  { name: "userId", type: "string", body: ["create"], private: false },
  { name: "createdAt", type: "string", body: false, private: false },
  { name: "updatedAt", type: "string", body: false, private: false },
];

const investmentResponseSchema = defaultSuccesResponse(investmentObjectSchema);

export const createInvestmentDocumentation: FastifySchema = {
  description: "Crear una nueva inversión",
  tags: ["Investment"],
  body: getBody(investmentObjectSchema, "create"),
  response: {
    201: investmentResponseSchema,
    ...errorDocumentation,
  },
};

export const listInvestmentsDocumentation: FastifySchema = {
  description: "Listar todas las inversiones con paginación",
  tags: ["Investment"],
  params: {
    type: "object",
    properties: {
      ...paginationParamsDocumentation(),
    },
  },
  response: {
    200: paginationDocumentation(investmentObjectSchema),
    ...errorDocumentation,
  },
};

export const getInvestmentDocumentation: FastifySchema = {
  description: "Obtener detalles de una inversión por ID",
  tags: ["Investment"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID de la Inversión" },
    },
  },
  response: {
    200: investmentResponseSchema,
    ...errorDocumentation,
  },
};

export const updateInvestmentDocumentation: FastifySchema = {
  description: "Actualizar una inversión existente por ID",
  tags: ["Investment"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID de la Inversión" },
    },
  },
  body: getBody(investmentObjectSchema, "update"),
  response: {
    200: investmentResponseSchema,
    ...errorDocumentation,
  },
};

export const deleteInvestmentDocumentation: FastifySchema = {
  description: "Eliminar una inversión por ID",
  tags: ["Investment"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID de la Inversión" },
    },
  },
  response: {
    200: investmentResponseSchema,
    ...errorDocumentation,
  },
};
