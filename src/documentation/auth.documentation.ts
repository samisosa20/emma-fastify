import { FastifySchema } from "fastify/types/schema";
import { defaultSuccesResponse, SchemaDefault } from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getBody } from "./components/realtions";

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
    name: "password",
    type: "string",
    body: ["login", "register"],
    private: true,
  },
  { name: "token", type: "string", body: false, private: false },
];

export const loginDocumentation: FastifySchema = {
  description: "Login user",
  tags: ["Auth"],
  body: getBody(authSchema, "login"),
  response: {
    200: defaultSuccesResponse(authSchema),
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
