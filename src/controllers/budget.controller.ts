import { FastifyRequest, FastifyReply } from "fastify";

import { formatErrorMessage } from "@lib";

import { BudgetUseCase } from "packages/budget/application/budget.use-case";
import { BudgetPrismaRepository } from "packages/budget/infrastructure/budget.repository";
import { CreateBudget } from "packages/budget/domain/budget";

type BudgetParams = {
  page: number;
  deleted?: "1" | "0";
  size?: number;
  // Agrega aquí otros parámetros de consulta específicos para Budget si son necesarios
};

const budgetRepository = new BudgetPrismaRepository();
const budgetUseCase = new BudgetUseCase(budgetRepository);

export class BudgetController {
  getAllBudgets = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.query as BudgetParams;
    return await budgetUseCase.listBudget(params);
  };

  addBudget = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataBudget = request.body as CreateBudget;

    try {
      return budgetUseCase.addBudget(dataBudget);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Budget creation failed",
        message: detail,
      });
    }
  };

  updateBudget = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataBudget = request.body as Partial<CreateBudget>;
    const { id } = request.params as { id: string };

    try {
      return budgetUseCase.updateBudget(id, dataBudget);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Budget update failed",
        message: detail,
      });
    }
  };

  detailBudget = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    return budgetUseCase.detailBudget(id);
  };

  deleteBudget = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const result = await budgetUseCase.deleteBudget(id);
    if (result === null) {
      return reply.status(404).send({ message: "Budget not found" });
    }
    return result;
  };
}
