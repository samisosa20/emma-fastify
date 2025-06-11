import { FastifyReply, FastifyRequest } from "fastify";
import { formatErrorMessageMiddleware } from "../helpers";
import { BudgetCreateInput, BudgetUpdateInput } from "../validations";

export const validateBudgetCreate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await BudgetCreateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validateBudgetUpdate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await BudgetUpdateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};
