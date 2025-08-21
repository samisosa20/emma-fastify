import { FastifySchema } from "fastify/types/schema";
import { defaultSuccesResponse, SchemaDefault } from "./components/pagination";
import { errorDocumentation } from "./components/error";
import { getProperties } from "./components/realtions";

export const reportObjectSchema: SchemaDefault[] = [
  { name: "category", type: "string", body: false, private: false },
  { name: "amount", type: "number", body: false, private: false },
  { name: "participation", type: "number", body: false, private: false },
  { name: "color", type: "string", body: false, private: false },
  { name: "icon", type: "string", body: false, private: false },
  { name: "symbol", type: "string", body: false, private: false },
  { name: "flag", type: "string", body: false, private: false },
];

export const generalReportBalanceObjectSchema: SchemaDefault[] = [
  { name: "code", type: "string", body: false, private: false },
  { name: "symbol", type: "string", body: false, private: false },
  { name: "flag", type: "string", body: false, private: false },
  { name: "amount", type: "number", body: false, private: false },
];

export const accountReportBalanceObjectSchema: SchemaDefault[] = [
  { name: "code", type: "string", body: false, private: false },
  { name: "symbol", type: "string", body: false, private: false },
  { name: "flag", type: "string", body: false, private: false },
  { name: "yearlyAmount", type: "number", body: false, private: false },
  { name: "monthlyAmount", type: "number", body: false, private: false },
  { name: "totalAmount", type: "number", body: false, private: false },
];

export const categoryReportStatsObjectSchema: SchemaDefault[] = [
  { name: "code", type: "string", body: false, private: false },
  { name: "symbol", type: "string", body: false, private: false },
  { name: "flag", type: "string", body: false, private: false },
  { name: "avgMonthlyIncome", type: "number", body: false, private: false },
  { name: "incomeLowerLimit", type: "number", body: false, private: false },
  { name: "incomeUpperLimit", type: "number", body: false, private: false },
  { name: "avgMonthlyExpense", type: "number", body: false, private: false },
  { name: "expenseLowerLimit", type: "number", body: false, private: false },
  { name: "expenseUpperLimit", type: "number", body: false, private: false },
];

export const historyBalanceObjectSchema: SchemaDefault[] = [
  { name: "code", type: "string", body: false, private: false },
  { name: "symbol", type: "string", body: false, private: false },
  { name: "flag", type: "string", body: false, private: false },
  { name: "date", type: "string", body: false, private: false },
  { name: "dailyAmount", type: "number", body: false, private: false },
  { name: "cumulativeBalance", type: "number", body: false, private: false },
];

export const historyReportObjectSchema: SchemaDefault[] = [
  {
    name: "current",
    type: "array",
    body: false,
    private: false,
    items: {
      type: "object",
      properties: getProperties(historyBalanceObjectSchema),
    },
  },
  {
    name: "lastYear",
    type: "array",
    body: false,
    private: false,
    items: {
      type: "object",
      properties: getProperties(historyBalanceObjectSchema),
    },
  },
  {
    name: "previousPeriod",
    type: "array",
    body: false,
    private: false,
    items: {
      type: "object",
      properties: getProperties(historyBalanceObjectSchema),
    },
  },
];

const reportResponseSchema = defaultSuccesResponse(reportObjectSchema);
const accountReportBalanceSchema = defaultSuccesResponse(
  accountReportBalanceObjectSchema
);
const generalReportBalanceSchema = defaultSuccesResponse(
  generalReportBalanceObjectSchema
);
const categoryReportStatsSchema = defaultSuccesResponse(
  categoryReportStatsObjectSchema
);
const historyReportSchema = defaultSuccesResponse(historyReportObjectSchema);

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
export const accountReportBalanceDocumentation: FastifySchema = {
  description: "Balance de una cuenta",
  tags: ["Report"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        description: "Id de la cuenta",
      },
    },
  },
  response: {
    200: accountReportBalanceSchema,
    ...errorDocumentation,
  },
};
export const generalReportBalanceDocumentation: FastifySchema = {
  description: "Balance general del usuario",
  tags: ["Report"],
  response: {
    200: {
      type: "array",
      items: generalReportBalanceSchema,
    },
    ...errorDocumentation,
  },
};
export const categoryReportDocumentation: FastifySchema = {
  description:
    "Reporte para obtener el promedio y los limites de una categoria",
  tags: ["Report"],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        description: "Id de la category",
      },
    },
  },
  response: {
    200: {
      type: "array",
      items: categoryReportStatsSchema,
    },
    ...errorDocumentation,
  },
};
export const historyReportDocumentation: FastifySchema = {
  description: "Balance historico",
  tags: ["Report"],
  querystring: {
    type: "object",
    required: ["startDate", "endDate"],
    properties: {
      badgeId: {
        type: "string",
        description: "moneda",
      },
      startDate: {
        type: "string",
        description: "Fecha inicio",
      },
      endDate: {
        type: "string",
        description: "Fecha final",
      },
    },
  },
  response: {
    200: historyReportSchema,
    ...errorDocumentation,
  },
};
