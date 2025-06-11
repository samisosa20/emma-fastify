import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { type User } from "@prisma/client";

import { formatErrorMessage } from "@lib";
import { UserRepositoryPrismaPostgres } from "packages/user/infrastructure/user.repository";
import { UserUseCase } from "packages/user/application/user.use-case";

type UserBody = Omit<
  User,
  "createdAt" | "updatedAt" | "deletedAt" | "deletedAt" | "role" | "id"
>;

const userRepository = new UserRepositoryPrismaPostgres();
const userUseCase = new UserUseCase(userRepository);

export class AuthController {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  registerReguralUser = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const body = request.body as UserBody;

    try {
      /* const parseResult = strongPasswordSchema.safeParse(password);

      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: "User creation failed",
          message: parseResult.error.errors[0].message,
        });
      } */

      const newUser = await userUseCase.addUser(body);

      if ("statusCode" in newUser) {
        return newUser;
      }

      // Generate JWT token
      const token = this.fastify.jwt.sign(newUser, {
        expiresIn: `${process.env.JWT_EXPIRES_IN}`,
      });

      const { id, ...userWithOutId } = newUser;

      reply.send({ ...userWithOutId, token });
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      reply.status(400).send({
        statusCode: 400,
        message: "User creation failed",
        error: detail,
      });
    }
  };

  // User login
  loginUser = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };

    const login = await userUseCase.login(email, password);

    if ("statusCode" in login) {
      return reply.status(Number(login.statusCode)).send(login);
    }
    const token = this.fastify.jwt.sign(login, {
      expiresIn: `${process.env.JWT_EXPIRES_IN}`,
    });
    const { id, ...userWithOutId } = login;

    reply.send({ ...userWithOutId, token });
  };

  emailConfirmation = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { token, email } = request.query as {
        token: string;
        email: string;
      };

      const confirmation = await userUseCase.emailConfirmation(email, token);

      if ("statusCode" in confirmation) {
        return reply.status(Number(confirmation.statusCode)).send(confirmation);
      }

      const tokenJwt = this.fastify.jwt.sign(confirmation, {
        expiresIn: `${process.env.JWT_EXPIRES_IN}`,
      });
      const { id, ...userWithOutId } = confirmation;

      reply.send({ ...userWithOutId, token: tokenJwt });

      return confirmation;
    } catch (error: any) {
      reply.status(400).send({
        statusCode: 400,
        message: "User confirmation failed",
        error,
      });
    }
  };

  sendEmailConfirmation = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { email } = request.body as { email: string };

    try {
      const confirmation = await userUseCase.sendEmailConfirmation(email);

      if ("statusCode" in confirmation) {
        return reply.status(Number(confirmation.statusCode)).send(confirmation);
      }
    } catch (error) {
      reply.status(400).send({
        statusCode: 400,
        message: "Bad request",
        error,
      });
    }
  };

  recoveryPassword = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email } = request.body as { email: string };

    try {
      const confirmation = await userUseCase.recoveryPassword(email);

      if ("statusCode" in confirmation) {
        return reply.status(Number(confirmation.statusCode)).send(confirmation);
      }
    } catch (error) {
      reply.status(400).send({
        statusCode: 400,
        message: "Bad request",
        error,
      });
    }
  };
}
