import { FastifyReply, FastifyRequest } from "fastify";
import { formatErrorMessageMiddleware } from "../helpers";
import {
  PlannedPaymentCreateInput,
  PlannedPaymentUpdateInput,
} from "../validations";

export const validatePlannedPaymentCreate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await PlannedPaymentCreateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validatePlannedPaymentUpdate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await PlannedPaymentUpdateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};
