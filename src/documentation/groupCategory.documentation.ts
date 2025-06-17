import { FastifySchema } from "fastify/types/schema";
import {
  defaultSuccesResponse,
  SchemaDefault,
  paginationDocumentation,
  paginationParamsDocumentation,
} from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getBody } from "./components/realtions";

export const groupCategoryObjectSchema: SchemaDefault[] = [
  { name: "id", type: "string", body: false, private: false },
  { name: "name", type: "string", body: ["create", "update"], private: false },
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

const groupCategoryResponseSchema = defaultSuccesResponse(
  groupCategoryObjectSchema
);

export const createGroupCategoryDocumentation: FastifySchema = {
  description: "Crear un nuevo grupo de categorías",
  tags: ["GroupCategory"],
  body: getBody(groupCategoryObjectSchema, "create"),
  response: {
    201: groupCategoryResponseSchema,
    ...errorDocumentation,
  },
};

export const listGroupCategoriesDocumentation: FastifySchema = {
  description: "Listar todos los grupos de categorías con paginación",
  tags: ["GroupCategory"],
  params: {
    type: "object",
    properties: {
      ...paginationParamsDocumentation(),
    },
  },
  response: {
    200: paginationDocumentation(groupCategoryObjectSchema),
    ...errorDocumentation,
  },
};

export const getGroupCategoryDocumentation: FastifySchema = {
  description: "Obtener detalles de un grupo de categorías por ID",
  tags: ["GroupCategory"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Grupo de Categorías" },
    },
  },
  response: {
    200: groupCategoryResponseSchema,
    ...errorDocumentation,
  },
};

export const updateGroupCategoryDocumentation: FastifySchema = {
  description: "Actualizar un grupo de categorías existente por ID",
  tags: ["GroupCategory"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Grupo de Categorías" },
    },
  },
  body: getBody(groupCategoryObjectSchema, "update"),
  response: {
    200: groupCategoryResponseSchema,
    ...errorDocumentation,
  },
};

export const deleteGroupCategoryDocumentation: FastifySchema = {
  description: "Eliminar un grupo de categorías por ID",
  tags: ["GroupCategory"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Grupo de Categorías" },
    },
  },
  response: {
    200: groupCategoryResponseSchema,
    ...errorDocumentation,
  },
};
