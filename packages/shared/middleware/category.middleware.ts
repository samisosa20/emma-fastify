import { FastifyReply, FastifyRequest } from "fastify";
import { formatErrorMessageMiddleware } from "../helpers";
import { CategoryCreateInput, CategoryUpdateInput } from "../validations";

export const validateCategoryCreate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await CategoryCreateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validateCategoryUpdate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await CategoryUpdateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};
