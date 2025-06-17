import { FastifyRequest, FastifyReply } from "fastify";

import { formatErrorMessage } from "@lib";

import { PeriodUseCase } from "packages/period/application/period.use-case";
import { PeriodPrismaRepository } from "packages/period/infrastructure/period.repository";
import { CreatePeriod } from "packages/period/domain/period";

type PeriodParams = {
  page: number;
  deleted?: "1" | "0";
  size?: number;
  // Agrega aquí otros parámetros de consulta específicos para Period si son necesarios
};

const periodRepository = new PeriodPrismaRepository();
const periodUseCase = new PeriodUseCase(periodRepository);

export class PeriodController {
  getAllPeriods = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.query as PeriodParams;
    return await periodUseCase.listPeriod(params);
  };

  addPeriod = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataPeriod = request.body as CreatePeriod;

    try {
      return periodUseCase.addPeriod(dataPeriod);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Period creation failed",
        message: detail,
      });
    }
  };

  updatePeriod = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataPeriod = request.body as Partial<CreatePeriod>;
    const { id } = request.params as { id: string };

    try {
      return periodUseCase.updatePeriod(id, dataPeriod);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Period update failed",
        message: detail,
      });
    }
  };

  detailPeriod = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    return periodUseCase.detailPeriod(id);
  };

  deletePeriod = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const result = await periodUseCase.deletePeriod(id);
    if (result === null) {
      return reply.status(404).send({ message: "Period not found" });
    }
    return result;
  };
}
