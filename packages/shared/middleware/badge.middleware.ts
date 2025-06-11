import { FastifyReply, FastifyRequest } from "fastify";
import { formatErrorMessageMiddleware } from "../helpers";
import { BadgeCreateInput } from "../validations";

export const validateBadgeCreate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await BadgeCreateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    return reply.status(400).send(formatErrorMessageMiddleware(error));
  }
};

export const validateBadgeUpdate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    return BadgeCreateInput.partial().parse(request.body);
  } catch (error) {
    formatErrorMessageMiddleware(error);
    throw error;
  }
};
