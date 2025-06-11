import { FastifyRequest, FastifyReply } from "fastify";

import { formatErrorMessage } from "@lib";

import { InvestmentUseCase } from "packages/investment/application/investment.use-case";
import { InvestmentPrismaRepository } from "packages/investment/infrastructure/investment.repository";
import { CreateInvestment } from "packages/investment/domain/investment";

type InvestmentParams = {
  page: number;
  deleted?: "1" | "0";
  size?: number;
  // Agrega aquí otros parámetros de consulta específicos para Investment si son necesarios
};

const investmentRepository = new InvestmentPrismaRepository();
const investmentUseCase = new InvestmentUseCase(investmentRepository);

export class InvestmentController {
  getAllInvestments = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.query as InvestmentParams;
    return await investmentUseCase.listInvestment(params);
  };

  addInvestment = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataInvestment = request.body as CreateInvestment;

    try {
      return investmentUseCase.addInvestment(dataInvestment);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Investment creation failed",
        message: detail,
      });
    }
  };

  updateInvestment = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataInvestment = request.body as Partial<CreateInvestment>;
    const { id } = request.params as { id: string };

    try {
      return investmentUseCase.updateInvestment(id, dataInvestment);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Investment update failed",
        message: detail,
      });
    }
  };

  detailInvestment = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    return investmentUseCase.detailInvestment(id);
  };

  deleteInvestment = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const result = await investmentUseCase.deleteInvestment(id);
    if (result === null) {
      return reply.status(404).send({ message: "Investment not found" });
    }
    return result;
  };
}
