import { PeriodController } from "@controllers";
import {
  createPeriodDocumentation,
  deletePeriodDocumentation,
  getPeriodDocumentation,
  updatePeriodDocumentation,
  listPeriodsDocumentation,
} from "src/documentation"; // Asegúrate de que estos objetos de documentación existan
import { FastifyPluginAsync } from "fastify";

import { validatePeriodCreate, validatePeriodUpdate } from "packages/shared"; // Asegúrate de que estas funciones de validación existan

const periodsRoutes: FastifyPluginAsync = async (fastify) => {
  const periodController = new PeriodController();

  fastify.get(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: listPeriodsDocumentation,
    },
    periodController.getAllPeriods
  );

  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate, validatePeriodCreate],
      schema: createPeriodDocumentation,
    },
    periodController.addPeriod
  );

  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: getPeriodDocumentation,
    },
    periodController.detailPeriod
  );

  fastify.put(
    "/:id",
    {
      preHandler: [fastify.authenticate, validatePeriodUpdate],
      schema: updatePeriodDocumentation,
    },
    periodController.updatePeriod
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: deletePeriodDocumentation,
    },
    periodController.deletePeriod
  );
};

export default periodsRoutes;
