import { FastifyReply, FastifyRequest } from "fastify";
import { formatErrorMessageMiddleware } from "../helpers";
import { HeritageCreateInput, HeritageUpdateInput } from "../validations";

export const validateHeritageCreate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await HeritageCreateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error); // Esto lanza el error formateado
  }
};

export const validateHeritageUpdate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await HeritageUpdateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error); // Esto lanza el error formateado
  }
};
