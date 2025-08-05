import { FastifySchema } from "fastify/types/schema";
import { defaultSuccesResponse, SchemaDefault } from "./components/pagination";
import { errorDocumentation } from "./components/error";

export const reportObjectSchema: SchemaDefault[] = [
  { name: "category", type: "string", body: false, private: false },
  { name: "amount", type: "number", body: false, private: false },
];

const reportResponseSchema = defaultSuccesResponse(reportObjectSchema);

export const movementReportDocumentation: FastifySchema = {
  description: "Reporte de movimientos por periodo",
  tags: ["Report"],
  params: {
    type: "object",
    required: ["type", "period"],
    properties: {
      type: {
        type: "string",
        enum: ["income", "expensive"],
        description: "Tipo de reporte (income o expensive)",
      },
      period: {
        type: "string",
        enum: ["daily", "weekly", "monthly", "yearly"],
        description: "Periodo de reporte (daily, weekly, monthly, yearly)",
      },
    },
  },
  querystring: {
    type: "object",
    properties: {
      date: {
        type: "string",
        format: "date",
        description: "Fecha de inicio del período",
      },
      badgeId: {
        type: "string",
        description: "ID del badge para filtrar los movimientos",
      },
      year: {
        type: "integer",
        description: "Año para filtrar los movimientos",
      },
      month: {
        type: "integer",
        description: "Mes para filtrar los movimientos",
      },
      week: {
        type: "integer",
        description: "Semana para filtrar los movimientos",
      },
    },
  },
  response: {
    200: {
      type: "array",
      items: reportResponseSchema,
    },
    ...errorDocumentation,
  },
};
