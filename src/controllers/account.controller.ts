import { FastifyRequest, FastifyReply } from "fastify";

import { formatErrorMessage } from "@lib";

import { AccountUseCase } from "packages/account/application/account.use-case";
import { AccountPrismaRepository } from "packages/account/infrastructure/account.repository";
import { CreateAccount } from "packages/account/domain/account";

type AccountParams = {
  page: number;
  deleted?: "1" | "0";
  size?: number;
  // Agrega aquí otros parámetros de consulta específicos para Account si son necesarios
};

const accountRepository = new AccountPrismaRepository();
const accountUseCase = new AccountUseCase(accountRepository);

export class AccountController {
  getAllAccounts = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.query as AccountParams;
    return await accountUseCase.listAccount(params);
  };

  addAccount = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataAccount = request.body as CreateAccount;

    try {
      return accountUseCase.addAccount({
        ...dataAccount,
        userId: request.user.id,
      });
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Account creation failed",
        message: detail,
      });
    }
  };

  updateAccount = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataAccount = request.body as Partial<CreateAccount>;
    const { id } = request.params as { id: string };

    try {
      return accountUseCase.updateAccount(id, dataAccount);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Account update failed",
        message: detail,
      });
    }
  };

  detailAccount = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    return accountUseCase.detailAccount(id);
  };

  deleteAccount = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const result = await accountUseCase.deleteAccount(id);
    if (result === null) {
      return reply.status(404).send({ message: "Account not found" });
    }
    return result;
  };
}
