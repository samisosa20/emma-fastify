import { FastifyReply, FastifyRequest } from "fastify";
import { formatErrorMessageMiddleware } from "../helpers";
import { AccountCreateInput, AccountUpdateInput } from "../validations";

export const validateAccountCreate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await AccountCreateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validateAccountUpdate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await AccountUpdateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};
