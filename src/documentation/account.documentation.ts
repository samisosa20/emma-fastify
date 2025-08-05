import { FastifySchema } from "fastify/types/schema";
import {
  defaultSuccesResponse,
  SchemaDefault,
  paginationDocumentation,
  paginationParamsDocumentation,
} from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getBody, getProperties } from "./components/realtions";
import { accountTypeObjectSchema } from "./accountType.documentation";
import { badgeObjectSchema } from "./badge.documentation";

export const accountObjectSchema: SchemaDefault[] = [
  { name: "id", type: "string", body: false, private: false },
  { name: "name", type: "string", body: ["create", "update"], private: false },
  {
    name: "accountTypeId",
    type: "string",
    body: ["create", "update"],
    private: true,
  },
  {
    name: "badgeId",
    type: "string",
    body: ["create", "update"],
    private: true,
  },
  {
    name: "type",
    type: "object",
    body: false,
    private: false,
    properties: getProperties(accountTypeObjectSchema),
  },
  {
    name: "badge",
    type: "object",
    body: false,
    private: false,
    properties: getProperties(badgeObjectSchema),
  },
  {
    name: "balance",
    type: "number",
    body: false,
    private: false,
  },
  {
    name: "initAmount",
    type: "number",
    body: ["create", "update"],
    private: false,
  },
  { name: "userId", type: "string", body: ["create"], private: true },
  { name: "createdAt", type: "string", body: false, private: false },
  { name: "updatedAt", type: "string", body: false, private: false },
  { name: "deletedAt", type: "string", body: false, private: false },
];

const accountResponseSchema = defaultSuccesResponse(accountObjectSchema);

export const createAccountDocumentation: FastifySchema = {
  description: "Crear una nueva cuenta",
  tags: ["Account"],
  body: getBody(accountObjectSchema, "create"),
  response: {
    200: accountResponseSchema,
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
