import { FastifyReply, FastifyRequest } from "fastify";
import { formatErrorMessageMiddleware } from "../helpers";
import {
  GroupCategoryCreateInput,
  GroupCategoryUpdateInput,
} from "../validations"; // Asegúrate de que estos esquemas de validación existan

export const validateGroupCategoryCreate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await GroupCategoryCreateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validateGroupCategoryUpdate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await GroupCategoryUpdateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};
