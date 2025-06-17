import { FastifyReply, FastifyRequest } from "fastify";
import { formatErrorMessageMiddleware } from "../helpers";
import { PeriodCreateInput, PeriodUpdateInput } from "../validations"; // Asegúrate de que estos esquemas de validación existan

export const validatePeriodCreate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await PeriodCreateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validatePeriodUpdate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await PeriodUpdateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};
