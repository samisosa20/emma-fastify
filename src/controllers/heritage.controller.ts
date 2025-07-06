import { FastifyRequest, FastifyReply } from "fastify";

import { formatErrorMessage } from "@lib";

import { HeritageUseCase } from "packages/heritage/application/heritage.use-case";
import { HeritagePrismaRepository } from "packages/heritage/infrastructure/heritage.repository";
import { CreateHeritage } from "packages/heritage/domain/heritage";

type HeritageParams = {
  page: number;
  deleted?: "1" | "0";
  size?: number;
  // Agrega aquí otros parámetros de consulta específicos para Heritage si son necesarios
};

const heritageRepository = new HeritagePrismaRepository();
const heritageUseCase = new HeritageUseCase(heritageRepository);

export class HeritageController {
  getAllHeritages = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.query as HeritageParams;
    // Asumiendo que el use case tiene un método listHeritage o similar
    return await heritageUseCase.listHeritage(params);
  };

  addHeritage = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataHeritage = request.body as CreateHeritage;

    try {
      return heritageUseCase.addHeritage(dataHeritage);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Heritage creation failed",
        message: detail,
      });
    }
  };

  updateHeritage = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataHeritage = request.body as Partial<CreateHeritage>; // Usar Partial para actualizaciones
    const { id } = request.params as { id: string };

    try {
      return heritageUseCase.updateHeritage(id, dataHeritage);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Heritage update failed",
        message: detail,
      });
    }
  };

  detailHeritage = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    return heritageUseCase.detailHeritage(id);
  };

  deleteHeritage = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    // Asumiendo que el use case tiene un método deleteHeritage o similar
    const result = await heritageUseCase.deleteHeritage(id);
    if (result === null) {
      // Manejar caso donde no se encuentra el patrimonio para eliminar
      return reply.status(404).send({ message: "Heritage not found" });
    }
    return result;
  };

  importHeritages = async (request: FastifyRequest, reply: FastifyReply) => {
    return heritageUseCase.importHeritages();
  };
}
