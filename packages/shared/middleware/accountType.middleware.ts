import { FastifyReply, FastifyRequest } from "fastify";
import { formatErrorMessageMiddleware } from "../helpers";
import { AccountTypeCreateInput, AccountTypeUpdateInput } from "../validations"; // Asegúrate de que estos esquemas de validación existan

export const validateAccountTypeCreate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await AccountTypeCreateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validateAccountTypeUpdate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await AccountTypeUpdateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};
