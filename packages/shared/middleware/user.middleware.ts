import { FastifyReply, FastifyRequest } from "fastify";
import { formatErrorMessageMiddleware } from "../helpers";
import { UserCreateInput, UserLoginInput } from "../validations";

export const validateUserRegister = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await UserCreateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    return reply.status(400).send(formatErrorMessageMiddleware(error));
  }
};

export const validateUserLogin = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await UserLoginInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    return reply.status(400).send(formatErrorMessageMiddleware(error));
  }
};
