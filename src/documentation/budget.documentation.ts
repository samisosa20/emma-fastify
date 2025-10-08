import { FastifySchema } from "fastify/types/schema";
import {
  defaultSuccesResponse,
  SchemaDefault,
  paginationDocumentation,
  paginationParamsDocumentation,
} from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getBody, getProperties } from "./components/realtions";

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

const yearsObjectSchema: SchemaDefault[] = [
  { name: "year", type: "number", body: false, private: false },
  { name: "incomes", type: "number", body: false, private: false },
  { name: "expenses", type: "number", body: false, private: false },
  { name: "utility", type: "number", body: false, private: false },
  {
    name: "badge",
    type: "object",
    body: false,
    private: false,
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      code: { type: "string" },
      symbol: { type: "string" },
      flag: { type: "string" },
    },
  },
];

const budgetYearObjectSchema: SchemaDefault[] = [
  {
    name: "years",
    type: "array",
    body: false,
    private: false,
    items: {
      type: "object",
      properties: getProperties(yearsObjectSchema),
    },
  },
  { name: "badge", type: "string", body: false, private: false },
];

const budgetResponseSchema = defaultSuccesResponse(budgetObjectSchema);
const budgetYearResponseSchema = defaultSuccesResponse(budgetYearObjectSchema);

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

export const getBudgetYearDocumentation: FastifySchema = {
  description: "Obtener el listado por años de los presupuestos",
  tags: ["Budget"],
  querystring: {
    type: "object",
    properties: {
      year: {
        type: "number",
        description: "Año del presupuesto (opcional)",
      },
    },
  },
  response: {
    200: {
      type: "array",
      items: budgetYearResponseSchema,
    },
    ...errorDocumentation,
  },
};
