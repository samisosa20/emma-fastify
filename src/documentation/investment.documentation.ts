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

export const extraInvestmentObjectSchema: SchemaDefault[] = [
  {
    name: "movements",
    type: "array",
    body: false,
    private: false,
    items: {
      type: "object",
      properties: {
        amount: { type: "number" },
        datePurchase: { type: "string" },
        id: { type: "string" },
        description: { type: "string" },
        account: {
          type: "object",
          properties: {
            name: { type: "string" },
            badge: {
              type: "object",
              properties: {
                id: { type: "string" },
                code: { type: "string" },
                flag: { type: "string" },
                symbol: { type: "string" },
              },
            },
          },
        },
        event: {
          type: "object",
          properties: {
            name: { type: "string" },
          },
        },
        category: {
          type: "object",
          properties: {
            name: { type: "string" },
          },
        },
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
        id: { type: "string" },
        amount: { type: "number" },
        dateAppreciation: { type: "string" },
      },
    },
  },
];

export const investmentObjectSchema: SchemaDefault[] = [
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
    name: "dateInvestment",
    type: "string",
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

export const appreciationObjectSchema: SchemaDefault[] = [
  { name: "id", type: "string", body: false, private: false },
  {
    name: "amount",
    type: "number",
    body: ["create", "update"],
    private: false,
  },
  {
    name: "dateAppreciation",
    type: "string",
    body: ["create", "update"],
    private: false,
  },
  { name: "createdAt", type: "string", body: false, private: false },
  { name: "updatedAt", type: "string", body: false, private: false },
];

const investmentResponseSchema = defaultSuccesResponse(investmentObjectSchema);
const appreciationResponseSchema = defaultSuccesResponse(
  appreciationObjectSchema
);

export const createInvestmentDocumentation: FastifySchema = {
  description: "Crear una nueva inversión",
  tags: ["Investment"],
  body: getBody(investmentObjectSchema, "create"),
  response: {
    200: investmentResponseSchema,
    ...errorDocumentation,
  },
};

export const createAppreciationDocumentation: FastifySchema = {
  description: "Crear una nueva apreciación",
  tags: ["Investment"],
  body: getBody(appreciationObjectSchema, "create"),
  response: {
    200: appreciationResponseSchema,
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

export const updateAppreciationDocumentation: FastifySchema = {
  description: "Actualizar una apreciación existente por ID",
  tags: ["Investment"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID de la Inversión" },
      appreciationId: { type: "string", description: "ID de la apreciación" },
    },
  },
  body: getBody(appreciationObjectSchema, "update"),
  response: {
    200: appreciationResponseSchema,
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

export const deleteAppreciationDocumentation: FastifySchema = {
  description: "Eliminar una apreciación existente por ID",
  tags: ["Investment"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID de la Inversión" },
      appreciationId: { type: "string", description: "ID de la apreciación" },
    },
  },
  response: {
    200: appreciationResponseSchema,
    ...errorDocumentation,
  },
};
