import { FastifyRequest, FastifyReply } from "fastify";

import { formatErrorMessage } from "@lib";

import { AppreciationUseCase } from "packages/investment/application/appreciation.use-cas";
import { AppreciationPrismaRepository } from "packages/investment/infrastructure/appreciation.repositor";
import { CreateAppreciation } from "packages/investment/domain/appreciation";

type AppreciationParams = {
  page: number;
  deleted?: "1" | "0";
  size?: number;
  // Agrega aquí otros parámetros de consulta específicos para Appreciation si son necesarios
};

const appreciationRepository = new AppreciationPrismaRepository();
const appreciationUseCase = new AppreciationUseCase(appreciationRepository);

export class AppreciationController {
  getAllAppreciations = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const params = request.query as AppreciationParams;
    return await appreciationUseCase.listAppreciation(params);
  };

  addAppreciation = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataAppreciation = request.body as CreateAppreciation;
    const { id } = request.params as { id: string };

    try {
      return appreciationUseCase.addAppreciation({
        ...dataAppreciation,
        investmentId: id,
        userId: request.user.id,
      });
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Appreciation creation failed",
        message: detail,
      });
    }
  };

  updateAppreciation = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataAppreciation = request.body as Partial<CreateAppreciation>;
    const { id, appreciationId } = request.params as {
      id: string;
      appreciationId: string;
    };

    try {
      return appreciationUseCase.updateAppreciation(
        id,
        appreciationId,
        dataAppreciation
      );
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Appreciation update failed",
        message: detail,
      });
    }
  };

  detailAppreciation = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id, appreciationId } = request.params as {
      id: string;
      appreciationId: string;
    };
    return appreciationUseCase.detailAppreciation(appreciationId);
  };

  deleteAppreciation = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id, appreciationId } = request.params as {
      id: string;
      appreciationId: string;
    };
    const result = await appreciationUseCase.deleteAppreciation(
      id,
      appreciationId
    );
    if (result === null) {
      return reply.status(404).send({ message: "Appreciation not found" });
    }
    return result;
  };

  importAppreciations = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const result = await appreciationUseCase.importAppreciations();
    if (result === null) {
      return reply.status(404).send({ message: "Appreciation not found" });
    }
    return result;
  };
}
