import { MovementController } from "@controllers";
import {
  createMovementDocumentation,
  deleteMovementDocumentation,
  getMovementDocumentation,
  updateMovementDocumentation,
  listMovementsDocumentation,
} from "src/documentation";
import { FastifyPluginAsync } from "fastify";

import {
  validateMovementCreate,
  validateMovementUpdate,
} from "packages/shared";

const movementsRoutes: FastifyPluginAsync = async (fastify) => {
  const movementController = new MovementController();

  fastify.get(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: listMovementsDocumentation,
    },
    movementController.getAllMovements
  );

  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate, validateMovementCreate],
      schema: createMovementDocumentation,
    },
    movementController.addMovement
  );

  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: getMovementDocumentation,
    },
    movementController.detailMovement
  );

  fastify.put(
    "/:id",
    {
      preHandler: [fastify.authenticate, validateMovementUpdate],
      schema: updateMovementDocumentation,
    },
    movementController.updateMovement
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: deleteMovementDocumentation,
    },
    movementController.deleteMovement
  );

  fastify.post(
    "/import-movements",
    {
      preHandler: [fastify.authenticate],
    },
    movementController.importMovements
  );
};

export default movementsRoutes;
