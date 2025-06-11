import { FastifySchema } from "fastify/types/schema";
import {
  defaultSuccesResponse,
  SchemaDefault,
  paginationDocumentation,
  paginationParamsDocumentation,
} from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getBody } from "./components/realtions";

const accountObjectSchema: SchemaDefault[] = [
  { name: "id", type: "string", body: false, private: false },
  { name: "name", type: "string", body: ["create", "update"], private: false },
  { name: "type", type: "string", body: ["create", "update"], private: false },
  {
    name: "balance",
    type: "number",
    body: ["create", "update"],
    private: false,
  },
  { name: "userId", type: "string", body: ["create"], private: false },
  { name: "createdAt", type: "string", body: false, private: false },
  { name: "updatedAt", type: "string", body: false, private: false },
];

const accountResponseSchema = defaultSuccesResponse(accountObjectSchema);

export const createAccountDocumentation: FastifySchema = {
  description: "Crear una nueva cuenta",
  tags: ["Account"],
  body: getBody(accountObjectSchema, "create"),
  response: {
    201: accountResponseSchema,
    ...errorDocumentation,
  },
};

export const listAccountsDocumentation: FastifySchema = {
  description: "Listar todas las cuentas con paginación",
  tags: ["Account"],
  params: {
    type: "object",
    properties: {
      ...paginationParamsDocumentation(),
    },
  },
  response: {
    200: paginationDocumentation(accountObjectSchema),
    ...errorDocumentation,
  },
};

export const getAccountDocumentation: FastifySchema = {
  description: "Obtener detalles de una cuenta por ID",
  tags: ["Account"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID de la Cuenta" },
    },
  },
  response: {
    200: accountResponseSchema,
    ...errorDocumentation,
  },
};

export const updateAccountDocumentation: FastifySchema = {
  description: "Actualizar una cuenta existente por ID",
  tags: ["Account"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID de la Cuenta" },
    },
  },
  body: getBody(accountObjectSchema, "update"),
  response: {
    200: accountResponseSchema,
    ...errorDocumentation,
  },
};

export const deleteAccountDocumentation: FastifySchema = {
  description: "Eliminar una cuenta por ID",
  tags: ["Account"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID de la Cuenta" },
    },
  },
  response: {
    200: accountResponseSchema,
    ...errorDocumentation,
  },
};
