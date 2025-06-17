import { FastifySchema } from "fastify/types/schema";
import {
  defaultSuccesResponse,
  SchemaDefault,
  paginationDocumentation,
  paginationParamsDocumentation,
} from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getBody } from "./components/realtions";

export const accountTypeObjectSchema: SchemaDefault[] = [
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

const accountTypeResponseSchema = defaultSuccesResponse(
  accountTypeObjectSchema
);

export const createAccountTypeDocumentation: FastifySchema = {
  description: "Crear un nuevo tipo de cuenta",
  tags: ["AccountType"],
  body: getBody(accountTypeObjectSchema, "create"),
  response: {
    201: accountTypeResponseSchema,
    ...errorDocumentation,
  },
};

export const listAccountTypesDocumentation: FastifySchema = {
  description: "Listar todos los tipos de cuenta con paginación",
  tags: ["AccountType"],
  params: {
    type: "object",
    properties: {
      ...paginationParamsDocumentation(),
    },
  },
  response: {
    200: paginationDocumentation(accountTypeObjectSchema),
    ...errorDocumentation,
  },
};

export const getAccountTypeDocumentation: FastifySchema = {
  description: "Obtener detalles de un tipo de cuenta por ID",
  tags: ["AccountType"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Tipo de Cuenta" },
    },
  },
  response: {
    200: accountTypeResponseSchema,
    ...errorDocumentation,
  },
};

export const updateAccountTypeDocumentation: FastifySchema = {
  description: "Actualizar un tipo de cuenta existente por ID",
  tags: ["AccountType"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Tipo de Cuenta" },
    },
  },
  body: getBody(accountTypeObjectSchema, "update"),
  response: {
    200: accountTypeResponseSchema,
    ...errorDocumentation,
  },
};

export const deleteAccountTypeDocumentation: FastifySchema = {
  description: "Eliminar un tipo de cuenta por ID",
  tags: ["AccountType"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Tipo de Cuenta" },
    },
  },
  response: {
    200: accountTypeResponseSchema,
    ...errorDocumentation,
  },
};
