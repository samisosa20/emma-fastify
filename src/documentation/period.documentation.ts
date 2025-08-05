import { FastifySchema } from "fastify/types/schema";
import {
  defaultSuccesResponse,
  SchemaDefault,
  paginationDocumentation,
  paginationParamsDocumentation,
} from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getBody } from "./components/realtions";

export const periodObjectSchema: SchemaDefault[] = [
  { name: "id", type: "string", body: false, private: false },
  { name: "name", type: "string", body: ["create", "update"], private: false },
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
    name: "createdAt",
    type: "string",
    body: false,
    private: false,
  },
  {
    name: "updatedAt",
    type: "string",
    body: false,
    private: false,
  },
];

const periodResponseSchema = defaultSuccesResponse(periodObjectSchema);

export const createPeriodDocumentation: FastifySchema = {
  description: "Crear un nuevo período",
  tags: ["Period"],
  body: getBody(periodObjectSchema, "create"),
  response: {
    200: periodResponseSchema,
    ...errorDocumentation,
  },
};

export const listPeriodsDocumentation: FastifySchema = {
  description: "Listar todos los períodos con paginación",
  tags: ["Period"],
  params: {
    type: "object",
    properties: {
      ...paginationParamsDocumentation(),
    },
  },
  response: {
    200: paginationDocumentation(periodObjectSchema),
    ...errorDocumentation,
  },
};

export const getPeriodDocumentation: FastifySchema = {
  description: "Obtener detalles de un período por ID",
  tags: ["Period"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Período" },
    },
  },
  response: {
    200: periodResponseSchema,
    ...errorDocumentation,
  },
};

export const updatePeriodDocumentation: FastifySchema = {
  description: "Actualizar un período existente por ID",
  tags: ["Period"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Período" },
    },
  },
  body: getBody(periodObjectSchema, "update"),
  response: {
    200: periodResponseSchema,
    ...errorDocumentation,
  },
};

export const deletePeriodDocumentation: FastifySchema = {
  description: "Eliminar un período por ID",
  tags: ["Period"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Período" },
    },
  },
  response: {
    200: periodResponseSchema,
    ...errorDocumentation,
  },
};
