import { FastifyReply, FastifyRequest } from "fastify";
import { formatErrorMessageMiddleware } from "../helpers";
import {
  InvestmentCreateInput,
  InvestmentUpdateInput,
  AppreciationCreateInput,
  AppreciationUpdateInput,
  InvestmentIdParams,
  AppreciationIdParams,
} from "../validations";

export const validateInvestmentId = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = await InvestmentIdParams.parseAsync(request.params);
    request.params = params;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validateAppreciationId = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const params = await AppreciationIdParams.parseAsync(request.params);
    request.params = params;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validateInvestmentCreate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await InvestmentCreateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validateInvestmentUpdate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await InvestmentUpdateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validateAppreciationCreate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await AppreciationCreateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validateAppreciationUpdate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await AppreciationUpdateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};
