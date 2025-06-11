import { FastifyReply, FastifyRequest } from "fastify";
import { formatErrorMessageMiddleware } from "../helpers";
import { InvestmentCreateInput, InvestmentUpdateInput } from "../validations";

export const validateInvestmentCreate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await InvestmentCreateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validateInvestmentUpdate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await InvestmentUpdateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};
