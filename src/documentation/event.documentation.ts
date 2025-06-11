import { FastifySchema } from "fastify/types/schema";
import {
  defaultSuccesResponse,
  SchemaDefault,
  paginationDocumentation,
  paginationParamsDocumentation,
} from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getBody } from "./components/realtions";

const eventObjectSchema: SchemaDefault[] = [
  { name: "id", type: "string", body: false, private: false },
  { name: "name", type: "string", body: ["create", "update"], private: false },
  {
    name: "description",
    type: "string",
    body: ["create", "update"],
    private: false,
  },
  { name: "date", type: "string", body: ["create", "update"], private: false },
  {
    name: "location",
    type: "string",
    body: ["create", "update"],
    private: false,
  },
  { name: "userId", type: "string", body: ["create"], private: false },
  { name: "createdAt", type: "string", body: false, private: false },
  { name: "updatedAt", type: "string", body: false, private: false },
];

// Esquema para la respuesta de un solo evento
const eventResponseSchema = defaultSuccesResponse(eventObjectSchema);

export const createEventDocumentation: FastifySchema = {
  description: "Crear un nuevo evento",
  tags: ["Event"],
  body: getBody(eventObjectSchema, "create"),
  response: {
    201: eventResponseSchema,
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
    200: paginationDocumentation(eventObjectSchema),
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
    200: eventResponseSchema,
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
