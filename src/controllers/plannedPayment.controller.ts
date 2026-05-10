import { FastifyRequest, FastifyReply } from "fastify";

import { formatErrorMessage } from "@lib";

import { PlannedPaymentUseCase } from "packages/plannedPayment/application/plannedPayment.use-case";
import { PlannedPaymentPrismaRepository } from "packages/plannedPayment/infrastructure/plannedPayment.repository";
import { CreatePlannedPayment } from "packages/plannedPayment/domain/plannedPayment";

type PlannedPaymentParams = {
  page: number;
  deleted?: "1" | "0";
  size?: number;
  // Agrega aquí otros parámetros de consulta específicos para PlannedPayment si son necesarios
};

const plannedPaymentRepository = new PlannedPaymentPrismaRepository();
const plannedPaymentUseCase = new PlannedPaymentUseCase(
  plannedPaymentRepository
);

export class PlannedPaymentController {
  getAllPlannedPayments = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const params = request.query as PlannedPaymentParams;
    return await plannedPaymentUseCase.listPlannedPayment({
      ...params,
      userId: request.user.id,
    });
  };

  addPlannedPayment = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataPlannedPayment = request.body as CreatePlannedPayment;

    try {
      return await plannedPaymentUseCase.addPlannedPayment({
        ...dataPlannedPayment,
        userId: request.user.id,
      });
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(error.statusCode || 400).send({
        statusCode: error.statusCode || 400,
        error: error.error || "PlannedPayment creation failed",
        message: detail,
      });
    }
  };

  updatePlannedPayment = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const dataPlannedPayment = request.body as Partial<CreatePlannedPayment>;
    const { id } = request.params as { id: string };

    try {
      return await plannedPaymentUseCase.updatePlannedPayment(
        id,
        request.user.id,
        dataPlannedPayment
      );
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(error.statusCode || 400).send({
        statusCode: error.statusCode || 400,
        error: error.error || "PlannedPayment update failed",
        message: detail,
      });
    }
  };

  detailPlannedPayment = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { id } = request.params as { id: string };
    const result = await plannedPaymentUseCase.detailPlannedPayment(
      id,
      request.user.id
    );
    if (!result) {
      return reply.status(404).send({ message: "PlannedPayment not found" });
    }
    return result;
  };

  deletePlannedPayment = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { id } = request.params as { id: string };
    const result = await plannedPaymentUseCase.deletePlannedPayment(
      id,
      request.user.id
    );
    if (result === null) {
      return reply.status(404).send({ message: "PlannedPayment not found" });
    }
    return result;
  };

  importPlannedPayments = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      return await plannedPaymentUseCase.importPlannedPayments(request.user.id);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(error.statusCode || 500).send({
        statusCode: error.statusCode || 500,
        error: error.error || "PlannedPayment import failed",
        message: detail,
      });
    }
  };
}
