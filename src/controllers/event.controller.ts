import { FastifyRequest, FastifyReply } from "fastify";

import { formatErrorMessage } from "@lib";

import { EventUseCase } from "packages/event/application/event.use-case";
import { EventPrismaRepository } from "packages/event/infrastructure/event.repository";
import { CreateEvent } from "packages/event/domain/event";

type EventParams = {
  page: number;
  deleted?: "1" | "0";
  size?: number;
  // Agrega aquí otros parámetros de consulta específicos para Event si son necesarios
};

const eventRepository = new EventPrismaRepository();
const eventUseCase = new EventUseCase(eventRepository);

export class EventController {
  getAllEvents = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.query as EventParams;
    return await eventUseCase.listEvent(params);
  };

  addEvent = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataEvent = request.body as CreateEvent;

    try {
      return eventUseCase.addEvent({ ...dataEvent, userId: request.user.id });
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Event creation failed",
        message: detail,
      });
    }
  };

  updateEvent = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataEvent = request.body as Partial<CreateEvent>;
    const { id } = request.params as { id: string };

    try {
      return eventUseCase.updateEvent(id, dataEvent);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Event update failed",
        message: detail,
      });
    }
  };

  detailEvent = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    return eventUseCase.detailEvent(id);
  };

  deleteEvent = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const result = await eventUseCase.deleteEvent(id);
    if (result === null) {
      return reply.status(404).send({ message: "Event not found" });
    }
    return result;
  };
  importEvents = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await eventUseCase.importEvents();
    if (result === null) {
      return reply.status(404).send({ message: "Event not found" });
    }
    return result;
  };
}
