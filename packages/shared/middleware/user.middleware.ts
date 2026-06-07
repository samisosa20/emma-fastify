import { FastifyReply, FastifyRequest } from "fastify";
import { formatErrorMessageMiddleware } from "../helpers";
import {
  UserCreateInput,
  UserLoginInput,
  UserConfirmEmailInput,
  UserResendEmailInput,
  UserRecoveryPasswordInput,
} from "../validations";

export const validateUserRegister = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await UserCreateInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
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
    formatErrorMessageMiddleware(error);
  }
};

export const validateUserConfirmEmail = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const query = await UserConfirmEmailInput.parseAsync(request.query);
    request.query = query;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validateUserResendEmail = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await UserResendEmailInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};

export const validateUserRecoveryPassword = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = await UserRecoveryPasswordInput.parseAsync(request.body);
    request.body = body;
  } catch (error) {
    formatErrorMessageMiddleware(error);
  }
};
