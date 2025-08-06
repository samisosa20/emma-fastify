import { FastifySchema } from "fastify/types/schema";
import {
  defaultSuccesResponse,
  SchemaDefault,
  paginationDocumentation,
  paginationParamsDocumentation,
} from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getBody } from "./components/realtions";

export const categoryObjectSchema: SchemaDefault[] = [
  { name: "id", type: "string", body: false, private: false },
  { name: "name", type: "string", body: ["create", "update"], private: false },
  { name: "color", type: "string", body: ["create", "update"], private: false },
  {
    type: ["string"],
    name: "icon",
    body: ["create", "update"],
    private: false,
  },
  {
    name: "description",
    type: ["string", "null"],
    body: ["create", "update"],
    private: false,
  },
  {
    name: "groupId",
    type: ["string", "null"],
    body: ["create", "update"],
    private: false,
  },
  { name: "createdAt", type: "string", body: false, private: false },
  { name: "updatedAt", type: "string", body: false, private: false },
  { name: "deletedAt", type: ["string", "null"], body: false, private: false },
];

const categoryResponseSchema = defaultSuccesResponse(categoryObjectSchema);

export const createCategoryDocumentation: FastifySchema = {
  description: "Crear una nueva categoría",
  tags: ["Category"],
  body: getBody(categoryObjectSchema, "create"),
  response: {
    200: categoryResponseSchema,
    ...errorDocumentation,
  },
};

export const listCategoriesDocumentation: FastifySchema = {
  description: "Listar todas las categorías con paginación",
  tags: ["Category"],
  querystring: {
    type: "object",
    properties: {
      ...paginationParamsDocumentation(),
    },
  },
  response: {
    200: paginationDocumentation(categoryObjectSchema),
    ...errorDocumentation,
  },
};

export const getCategoryDocumentation: FastifySchema = {
  description: "Obtener detalles de una categoría por ID",
  tags: ["Category"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID de la Categoría" },
    },
  },
  response: {
    200: categoryResponseSchema,
    ...errorDocumentation,
  },
};

export const updateCategoryDocumentation: FastifySchema = {
  description: "Actualizar una categoría existente por ID",
  tags: ["Category"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID de la Categoría" },
    },
  },
  body: getBody(categoryObjectSchema, "update"),
  response: {
    200: categoryResponseSchema,
    ...errorDocumentation,
  },
};

export const deleteCategoryDocumentation: FastifySchema = {
  description: "Eliminar una categoría por ID",
  tags: ["Category"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID de la Categoría" },
    },
  },
  response: {
    200: categoryResponseSchema,
    ...errorDocumentation,
  },
};
