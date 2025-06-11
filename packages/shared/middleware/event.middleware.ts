import { FastifyReply, FastifyRequest } from "fastify";
import { formatErrorMessageMiddleware } from "../helpers";
import { EventCreateInput, EventUpdateInput } from "../validations";

export const validateEventCreate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await EventCreateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validateEventUpdate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await EventUpdateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};
