import { FastifySchema } from "fastify/types/schema";
import {
  defaultSuccesResponse,
  SchemaDefault,
  paginationDocumentation,
  paginationParamsDocumentation,
} from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getBody } from "./components/realtions";

// Define el esquema para las propiedades del modelo Badge
const badgeObjectSchema: SchemaDefault[] = [
  { name: "id", type: "string", body: false, private: false },
  { name: "name", type: "string", body: ["create", "update"], private: false },
  { name: "createdAt", type: "string", body: false, private: false },
  { name: "updatedAt", type: "string", body: false, private: false },
];

// Esquema para la respuesta de un solo badge
const badgeResponseSchema = defaultSuccesResponse(badgeObjectSchema);

export const createBadgeDocumentation: FastifySchema = {
  description: "Crear un nuevo badge",
  tags: ["Badge"],
  body: getBody(badgeObjectSchema, "create"),
  response: {
    201: badgeResponseSchema,
    ...errorDocumentation,
  },
};

export const listBadgesDocumentation: FastifySchema = {
  description: "Listar todos los badges con paginación",
  tags: ["Badge"],
  params: {
    type: "object",
    properties: {
      ...paginationParamsDocumentation(),
    },
  },
  response: {
    200: paginationDocumentation(badgeObjectSchema),
    ...errorDocumentation,
  },
};

export const getBadgeDocumentation: FastifySchema = {
  description: "Obtener detalles de un badge por ID",
  tags: ["Badge"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Badge" },
    },
  },
  response: {
    200: badgeResponseSchema,
    ...errorDocumentation,
  },
};

export const updateBadgeDocumentation: FastifySchema = {
  description: "Actualizar un badge existente por ID",
  tags: ["Badge"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Badge" },
    },
  },
  body: getBody(badgeObjectSchema, "update"),
  response: {
    200: badgeResponseSchema,
    ...errorDocumentation,
  },
};

export const deleteBadgeDocumentation: FastifySchema = {
  description: "Eliminar un badge por ID",
  tags: ["Badge"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Badge" },
    },
  },
  response: {
    200: badgeResponseSchema,
    ...errorDocumentation,
  },
};
