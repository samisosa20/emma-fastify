import { FastifySchema } from "fastify/types/schema";
import {
  defaultSuccesResponse,
  SchemaDefault,
  paginationDocumentation,
  paginationParamsDocumentation,
} from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getBody } from "./components/realtions";

const budgetObjectSchema: SchemaDefault[] = [
  { name: "id", type: "string", body: false, private: false },
  { name: "name", type: "string", body: ["create", "update"], private: false },
  {
    name: "amount",
    type: "number",
    body: ["create", "update"],
    private: false,
  },
  {
    name: "startDate",
    type: "string",
    body: ["create", "update"],
    private: false,
  },
  {
    name: "endDate",
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
  { name: "userId", type: "string", body: ["create"], private: false },
  { name: "createdAt", type: "string", body: false, private: false },
  { name: "updatedAt", type: "string", body: false, private: false },
];

const budgetResponseSchema = defaultSuccesResponse(budgetObjectSchema);

export const createBudgetDocumentation: FastifySchema = {
  description: "Crear un nuevo presupuesto",
  tags: ["Budget"],
  body: getBody(budgetObjectSchema, "create"),
  response: {
    200: budgetResponseSchema,
    ...errorDocumentation,
  },
};

export const listBudgetsDocumentation: FastifySchema = {
  description: "Listar todos los presupuestos con paginación",
  tags: ["Budget"],
  params: {
    type: "object",
    properties: {
      ...paginationParamsDocumentation(),
    },
  },
  response: {
    200: paginationDocumentation(budgetObjectSchema),
    ...errorDocumentation,
  },
};

export const getBudgetDocumentation: FastifySchema = {
  description: "Obtener detalles de un presupuesto por ID",
  tags: ["Budget"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Presupuesto" },
    },
  },
  response: {
    200: budgetResponseSchema,
    ...errorDocumentation,
  },
};

export const updateBudgetDocumentation: FastifySchema = {
  description: "Actualizar un presupuesto existente por ID",
  tags: ["Budget"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Presupuesto" },
    },
  },
  body: getBody(budgetObjectSchema, "update"),
  response: {
    200: budgetResponseSchema,
    ...errorDocumentation,
  },
};

export const deleteBudgetDocumentation: FastifySchema = {
  description: "Eliminar un presupuesto por ID",
  tags: ["Budget"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Presupuesto" },
    },
  },
  response: {
    200: budgetResponseSchema,
    ...errorDocumentation,
  },
};
