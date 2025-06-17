import { FastifyRequest, FastifyReply } from "fastify";

import { formatErrorMessage } from "@lib";

import { AccountTypeUseCase } from "packages/account/application/accountType.use-case";
import { AccountTypePrismaRepository } from "packages/account/infrastructure/accountType.repository";
import { CreateAccountType } from "packages/account/domain/accountType";

type AccountTypeParams = {
  page: number;
  deleted?: "1" | "0";
  size?: number;
  // Agrega aquí otros parámetros de consulta específicos para AccountType si son necesarios
};

const accountTypeRepository = new AccountTypePrismaRepository();
const accountTypeUseCase = new AccountTypeUseCase(accountTypeRepository);

export class AccountTypeController {
  getAllAccountTypes = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.query as AccountTypeParams;
    return await accountTypeUseCase.listAccountType(params);
  };

  addAccountType = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataAccountType = request.body as CreateAccountType;

    try {
      return accountTypeUseCase.addAccountType(dataAccountType);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "AccountType creation failed",
        message: detail,
      });
    }
  };

  updateAccountType = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataAccountType = request.body as Partial<CreateAccountType>;
    const { id } = request.params as { id: string };

    try {
      return accountTypeUseCase.updateAccountType(id, dataAccountType);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "AccountType update failed",
        message: detail,
      });
    }
  };

  detailAccountType = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    return accountTypeUseCase.detailAccountType(id);
  };

  deleteAccountType = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const result = await accountTypeUseCase.deleteAccountType(id);
    if (result === null) {
      return reply.status(404).send({ message: "AccountType not found" });
    }
    return result;
  };
}
