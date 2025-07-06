import { FastifyRequest, FastifyReply } from "fastify";

import { formatErrorMessage } from "@lib";

import { MovementUseCase } from "packages/movement/application/movement.use-case";
import { MovementPrismaRepository } from "packages/movement/infrastructure/movement.repository";
import { CreateMovement } from "packages/movement/domain/movement";

type MovementParams = {
  page: number;
  deleted?: "1" | "0";
  size?: number;
  // Agrega aquí otros parámetros de consulta específicos para Movement si son necesarios
};

const movementRepository = new MovementPrismaRepository();
const movementUseCase = new MovementUseCase(movementRepository);

export class MovementController {
  getAllMovements = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.query as MovementParams;
    return await movementUseCase.listMovement(params);
  };

  addMovement = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataMovement = request.body as CreateMovement;

    try {
      return movementUseCase.addMovement(dataMovement);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Movement creation failed",
        message: detail,
      });
    }
  };

  updateMovement = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataMovement = request.body as Partial<CreateMovement>;
    const { id } = request.params as { id: string };

    try {
      return movementUseCase.updateMovement(id, dataMovement);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Movement update failed",
        message: detail,
      });
    }
  };

  detailMovement = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    return movementUseCase.detailMovement(id);
  };

  deleteMovement = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const result = await movementUseCase.deleteMovement(id);
    if (result === null) {
      return reply.status(404).send({ message: "Movement not found" });
    }
    return result;
  };

  importMovements = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await movementUseCase.importMovements();
    if (result === null) {
      return reply.status(404).send({ message: "Movement not found" });
    }
    return result;
  };
}
