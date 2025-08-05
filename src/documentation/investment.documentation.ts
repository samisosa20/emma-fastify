import { FastifySchema } from "fastify/types/schema";
import {
  defaultSuccesResponse,
  SchemaDefault,
  paginationDocumentation,
  paginationParamsDocumentation,
} from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getBody, getProperties } from "./components/realtions";
import { badgeObjectSchema } from "./badge.documentation";

const extraInvestmentObjectSchema: SchemaDefault[] = [
  {
    name: "movements",
    type: "array",
    body: false,
    private: false,
    items: {
      type: "object",
      properties: {
        amount: { type: "number" },
      },
    },
  },
  {
    name: "appreciations",
    type: "array",
    body: false,
    private: false,
    items: {
      type: "object",
      properties: {
        amount: { type: "number" },
      },
    },
  },
];

const investmentObjectSchema: SchemaDefault[] = [
  { name: "id", type: "string", body: false, private: false },
  { name: "name", type: "string", body: ["create", "update"], private: false },
  {
    name: "initAmount",
    type: "number",
    body: ["create", "update"],
    private: false,
  },
  {
    name: "endAmount",
    type: "number",
    body: ["create", "update"],
    private: false,
  },
  {
    name: "badge",
    type: "object",
    body: false,
    private: false,
    properties: getProperties(badgeObjectSchema),
  },
  { name: "totalReturns", type: "number", body: false, private: false },
  { name: "totalWithdrawal", type: "number", body: false, private: false },
  { name: "valorization", type: "string", body: false, private: false },
  { name: "totalRate", type: "string", body: false, private: false },
  { name: "badgeId", type: "string", body: ["create"], private: true },
  { name: "userId", type: "string", body: ["create"], private: true },
  { name: "createdAt", type: "string", body: false, private: false },
  { name: "updatedAt", type: "string", body: false, private: false },
];

const investmentResponseSchema = defaultSuccesResponse(investmentObjectSchema);

export const createInvestmentDocumentation: FastifySchema = {
  description: "Crear una nueva inversión",
  tags: ["Investment"],
  body: getBody(investmentObjectSchema, "create"),
  response: {
    200: investmentResponseSchema,
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
    200: defaultSuccesResponse([
      ...investmentObjectSchema,
      ...extraInvestmentObjectSchema,
    ]),
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
