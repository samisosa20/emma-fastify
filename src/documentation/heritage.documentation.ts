import { FastifySchema } from "fastify/types/schema";
import {
  defaultSuccesResponse,
  SchemaDefault,
  paginationDocumentation,
  paginationParamsDocumentation,
} from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getBody } from "./components/realtions";

const heritageObjectSchema: SchemaDefault[] = [
  { name: "id", type: "string", body: false, private: false },
  { name: "name", type: "string", body: ["create", "update"], private: false },
  {
    name: "comercialAmount",
    type: "number",
    body: ["create", "update"],
    private: false,
  },
  {
    name: "legalAmount",
    type: "number",
    body: ["create", "update"],
    private: false,
  },
  {
    name: "badgeId",
    type: "string",
    body: ["create", "update"],
    private: false,
  },
  { name: "year", type: "integer", body: ["create", "update"], private: false },
  {
    name: "userId",
    type: "string",
    body: ["create", "update"],
    private: false,
  },
  { name: "createdAt", type: "string", body: false, private: false },
  { name: "updatedAt", type: "string", body: false, private: false },
];

const heritageResponseSchema = defaultSuccesResponse(heritageObjectSchema);

export const createHeritageDocumentation: FastifySchema = {
  description: "Crear un nuevo activo patrimonial",
  tags: ["Heritage"],
  body: getBody(heritageObjectSchema, "create"),
  response: {
    200: heritageResponseSchema,
    ...errorDocumentation,
  },
};

export const listHeritagesDocumentation: FastifySchema = {
  description: "Listar todos los activos patrimoniales con paginación",
  tags: ["Heritage"],
  params: {
    type: "object",
    properties: {
      ...paginationParamsDocumentation(),
    },
  },
  response: {
    200: paginationDocumentation(heritageObjectSchema),
    ...errorDocumentation,
  },
};

export const getHeritageDocumentation: FastifySchema = {
  description: "Obtener detalles de un activo patrimonial por ID",
  tags: ["Heritage"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Patrimonio" },
    },
  },
  response: {
    200: heritageResponseSchema,
    ...errorDocumentation,
  },
};

export const updateHeritageDocumentation: FastifySchema = {
  description: "Actualizar un activo patrimonial existente por ID",
  tags: ["Heritage"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Patrimonio" },
    },
  },
  body: getBody(heritageObjectSchema, "update"),
  response: {
    200: heritageResponseSchema,
    ...errorDocumentation,
  },
};

export const deleteHeritageDocumentation: FastifySchema = {
  description: "Eliminar un activo patrimonial por ID",
  tags: ["Heritage"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Patrimonio" },
    },
  },
  response: {
    200: heritageResponseSchema,
    ...errorDocumentation,
  },
};
