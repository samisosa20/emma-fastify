import { FastifyReply, FastifyRequest } from "fastify";
import { formatErrorMessageMiddleware } from "../helpers";
import { MovementCreateInput, MovementUpdateInput } from "../validations";

export const validateMovementCreate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await MovementCreateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validateMovementUpdate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await MovementUpdateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};
