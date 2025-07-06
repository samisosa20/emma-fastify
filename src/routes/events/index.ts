import { EventController } from "@controllers";
import {
  createEventDocumentation,
  deleteEventDocumentation,
  getEventDocumentation,
  updateEventDocumentation,
  listEventsDocumentation,
} from "src/documentation";
import { FastifyPluginAsync } from "fastify";

import { validateEventCreate, validateEventUpdate } from "packages/shared";

const eventsRoutes: FastifyPluginAsync = async (fastify) => {
  const eventController = new EventController();

  fastify.get(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: listEventsDocumentation,
    },
    eventController.getAllEvents
  );

  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate, validateEventCreate],
      schema: createEventDocumentation,
    },
    eventController.addEvent
  );

  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: getEventDocumentation,
    },
    eventController.detailEvent
  );

  fastify.put(
    "/:id",
    {
      preHandler: [fastify.authenticate, validateEventUpdate],
      schema: updateEventDocumentation,
    },
    eventController.updateEvent
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: deleteEventDocumentation,
    },
    eventController.deleteEvent
  );

  fastify.post(
    "/import-events",
    {
      preHandler: [fastify.authenticate],
    },
    eventController.importEvents
  );
};

export default eventsRoutes;
