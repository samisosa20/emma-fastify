import { FastifyReply, FastifyRequest } from "fastify";
import { formatErrorMessageMiddleware } from "../helpers";
import {
  ReportMovementsQuery,
  ReportAccountBalanceParams,
  ReportCategoryStatsParams,
  ReportBalanceHistoryQuery,
} from "../validations/report";

export const validateReportMovements = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const query = await ReportMovementsQuery.parseAsync(request.query);
    request.query = query;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validateReportAccountBalance = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = await ReportAccountBalanceParams.parseAsync(request.params);
    request.params = params;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validateReportCategoryStats = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = await ReportCategoryStatsParams.parseAsync(request.params);
    request.params = params;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validateReportBalanceHistory = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const query = await ReportBalanceHistoryQuery.parseAsync(request.query);
    request.query = query;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};
