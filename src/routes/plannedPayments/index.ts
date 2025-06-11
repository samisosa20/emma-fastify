import { PlannedPaymentController } from "@controllers";
import {
  createPlannedPaymentDocumentation,
  deletePlannedPaymentDocumentation,
  getPlannedPaymentDocumentation,
  updatePlannedPaymentDocumentation,
  listPlannedPaymentsDocumentation,
} from "src/documentation";
import { FastifyPluginAsync } from "fastify";

import {
  validatePlannedPaymentCreate,
  validatePlannedPaymentUpdate,
} from "packages/shared";

const plannedPaymentsRoutes: FastifyPluginAsync = async (fastify) => {
  const plannedPaymentController = new PlannedPaymentController();

  fastify.get(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: listPlannedPaymentsDocumentation,
    },
    plannedPaymentController.getAllPlannedPayments
  );

  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate, validatePlannedPaymentCreate],
      schema: createPlannedPaymentDocumentation,
    },
    plannedPaymentController.addPlannedPayment
  );

  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: getPlannedPaymentDocumentation,
    },
    plannedPaymentController.detailPlannedPayment
  );

  fastify.put(
    "/:id",
    {
      preHandler: [fastify.authenticate, validatePlannedPaymentUpdate],
      schema: updatePlannedPaymentDocumentation,
    },
    plannedPaymentController.updatePlannedPayment
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: deletePlannedPaymentDocumentation,
    },
    plannedPaymentController.deletePlannedPayment
  );
};

export default plannedPaymentsRoutes;
