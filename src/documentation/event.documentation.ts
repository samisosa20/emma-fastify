import { FastifySchema } from "fastify/types/schema";
import {
  defaultSuccesResponse,
  SchemaDefault,
  paginationDocumentation,
  paginationParamsDocumentation,
} from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getBody } from "./components/realtions";

export const eventObjectSchema: SchemaDefault[] = [
  { name: "id", type: "string", body: false, private: false },
  { name: "name", type: "string", body: ["create", "update"], private: false },
  {
    name: "endEvent",
    type: "string",
    body: ["create", "update"],
    private: false,
  },
  { name: "userId", type: "string", body: ["create"], private: true },
  { name: "createdAt", type: "string", body: false, private: false },
  { name: "updatedAt", type: "string", body: false, private: false },
];

const eventBalancesObjectSchema: SchemaDefault[] = [
  {
    name: "balances",
    type: "array",
    body: false,
    private: false,
    items: {
      type: "object",
      properties: {
        code: { type: "string" },
        flag: { type: "string" },
        symbol: { type: "string" },
        balance: { type: "number" },
      },
    },
  },
];

const eventDetailObjectSchema: SchemaDefault[] = [
  {
    name: "movements",
    type: "array",
    body: false,
    private: false,
    items: {
      type: "object",
      properties: {
        amount: { type: "number" },
        description: { type: "string" },
        datePurchase: { type: "string" },
        category: {
          type: "object",
          properties: {
            name: { type: "string" },
            color: { type: "string" },
            icon: { type: "string" },
          },
        },
        account: {
          type: "object",
          properties: {
            name: { type: "string" },
            badge: {
              type: "object",
              properties: {
                code: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
  {
    name: "categories",
    type: "array",
    body: false,
    private: false,
    items: {
      type: "object",
      properties: {
        code: { type: "string" },
        flag: { type: "string" },
        symbol: { type: "string" },
        categories: {
          type: "array",
          items: {
            type: "object",
            properties: {
              amount: { type: "number" },
              name: { type: "string" },
              percentage: { type: "number" },
            },
          },
        },
      },
    },
  },
];

// Esquema para la respuesta de un solo evento
const eventResponseSchema = defaultSuccesResponse(eventObjectSchema);

export const createEventDocumentation: FastifySchema = {
  description: "Crear un nuevo evento",
  tags: ["Event"],
  body: getBody(eventObjectSchema, "create"),
  response: {
    200: eventResponseSchema,
    ...errorDocumentation,
  },
};

export const listEventsDocumentation: FastifySchema = {
  description: "Listar todos los eventos con paginación",
  tags: ["Event"],
  params: {
    type: "object",
    properties: {
      ...paginationParamsDocumentation(),
    },
  },
  response: {
    200: paginationDocumentation([
      ...eventObjectSchema,
      ...eventBalancesObjectSchema,
    ]),
    ...errorDocumentation,
  },
};

export const getEventDocumentation: FastifySchema = {
  description: "Obtener detalles de un evento por ID",
  tags: ["Event"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Evento" },
    },
  },
  response: {
    200: defaultSuccesResponse([
      ...eventDetailObjectSchema,
      ...eventObjectSchema,
    ]),
    ...errorDocumentation,
  },
};

export const updateEventDocumentation: FastifySchema = {
  description: "Actualizar un evento existente por ID",
  tags: ["Event"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Evento" },
    },
  },
  body: getBody(eventObjectSchema, "update"),
  response: {
    200: eventResponseSchema,
    ...errorDocumentation,
  },
};

export const deleteEventDocumentation: FastifySchema = {
  description: "Eliminar un evento por ID",
  tags: ["Event"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del Evento" },
    },
  },
  response: {
    200: eventResponseSchema,
    ...errorDocumentation,
  },
};
