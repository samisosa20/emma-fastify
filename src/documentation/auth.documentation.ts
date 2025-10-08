import { FastifySchema } from "fastify/types/schema";
import { defaultSuccesResponse, SchemaDefault } from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getBody, getProperties } from "./components/realtions";

// Importar los esquemas de objetos para el contenido de las listas paginadas
import { accountTypeObjectSchema } from "./accountType.documentation";
import { periodObjectSchema } from "./period.documentation";
import { badgeObjectSchema } from "./badge.documentation";
import { groupCategoryObjectSchema } from "./groupCategory.documentation";

const authSchema: SchemaDefault[] = [
  {
    name: "email",
    type: "string",
    body: ["login", "register"],
    private: false,
  },
  { name: "name", type: "string", body: ["register"], private: false },
  {
    name: "phone",
    type: ["string", "null"],
    body: ["register"],
    private: false,
  },
  {
    name: "phoneCode",
    type: ["string", "null"],
    body: ["register"],
    private: false,
  },
  {
    name: "confirmedEmailAt",
    type: ["string", "null"],
    body: false,
    private: false,
  },
  {
    name: "transferId",
    type: ["string"],
    body: false,
    private: false,
  },
  {
    name: "badgeId",
    type: ["string"],
    body: false,
    private: false,
  },
  {
    name: "password",
    type: "string",
    body: ["login", "register"],
    private: true,
  },
];

// Define el esquema para la respuesta del login
const loginSchema: SchemaDefault[] = [
  {
    name: "data",
    type: "object",
    body: false,
    private: false,
    properties: getProperties(authSchema),
  },
  { name: "token", type: "string", body: false, private: false },
  {
    name: "accountsType",
    type: "array",
    body: false,
    private: false,
    items: {
      type: "object",
      properties: getProperties(accountTypeObjectSchema),
    },
  },
  {
    name: "periods",
    type: "array",
    body: false,
    private: false,
    items: {
      type: "object",
      properties: getProperties(periodObjectSchema),
    },
  },
  {
    name: "badges",
    type: "array",
    body: false,
    private: false,
    items: {
      type: "object",
      properties: getProperties(badgeObjectSchema),
    },
  },
  {
    name: "groupsCategory",
    type: "array",
    body: false,
    private: false,
    items: {
      type: "object",
      properties: getProperties(groupCategoryObjectSchema),
    },
  },
];

export const loginDocumentation: FastifySchema = {
  description: "Login user",
  tags: ["Auth"],
  body: getBody(authSchema, "login"),
  response: {
    200: defaultSuccesResponse(loginSchema),
    ...errorDocumentation,
  },
};

export const registerDocumentation: FastifySchema = {
  description: "Register user",
  tags: ["Auth"],
  body: getBody(authSchema, "register"),
  response: {
    200: defaultSuccesResponse(authSchema),
    ...errorDocumentation,
  },
};

export const resendEmailDocumentation: FastifySchema = {
  description: "Resend email to confirm email",
  tags: ["Auth"],
  body: {
    type: "object",
    properties: {
      email: {
        type: "string",
      },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
    ...errorDocumentation,
  },
};

export const confirmEmailDocumentation: FastifySchema = {
  description: "Confirm email",
  tags: ["Auth"],
  body: {
    type: "object",
    properties: {
      email: {
        type: "string",
      },
    },
  },
  response: {
    200: defaultSuccesResponse(authSchema),
    ...errorDocumentation,
  },
};

export const recoveryPasswordDocumentation: FastifySchema = {
  description: "Recovery password",
  tags: ["Auth"],
  body: {
    type: "object",
    properties: {
      email: {
        type: "string",
      },
    },
  },
  response: {
    200: defaultSuccesResponse(authSchema),
    ...errorDocumentation,
  },
};

export const getProfileDocumentation: FastifySchema = {
  description: "Obtener detalles del perfil del usuario autenticado",
  tags: ["Auth"],
  response: {
    200: defaultSuccesResponse(
      authSchema.filter((item) => item.name !== "transferId")
    ),
    ...errorDocumentation,
  },
};
