import { InvestmentController, AppreciationController } from "@controllers";
import {
  createInvestmentDocumentation,
  deleteInvestmentDocumentation,
  getInvestmentDocumentation,
  updateInvestmentDocumentation,
  listInvestmentsDocumentation,
  createAppreciationDocumentation,
  deleteAppreciationDocumentation,
  updateAppreciationDocumentation,
} from "src/documentation";
import { FastifyPluginAsync } from "fastify";

import {
  validateInvestmentCreate,
  validateInvestmentUpdate,
  validateAppreciationCreate,
  validateAppreciationUpdate,
} from "packages/shared";

const investmentsRoutes: FastifyPluginAsync = async (fastify) => {
  const investmentController = new InvestmentController();
  const appreciationController = new AppreciationController();

  fastify.get(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: listInvestmentsDocumentation,
    },
    investmentController.getAllInvestments
  );

  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate, validateInvestmentCreate],
      schema: createInvestmentDocumentation,
    },
    investmentController.addInvestment
  );

  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: getInvestmentDocumentation,
    },
    investmentController.detailInvestment
  );

  fastify.put(
    "/:id",
    {
      preHandler: [fastify.authenticate, validateInvestmentUpdate],
      schema: updateInvestmentDocumentation,
    },
    investmentController.updateInvestment
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: deleteInvestmentDocumentation,
    },
    investmentController.deleteInvestment
  );

  fastify.post(
    "/import-investments",
    {
      preHandler: [fastify.authenticate],
    },
    investmentController.importInvestments
  );

  fastify.post(
    "/import-appreciations",
    {
      preHandler: [fastify.authenticate],
    },
    appreciationController.importAppreciations
  );

  fastify.post(
    "/:id/appreciation",
    {
      preHandler: [fastify.authenticate, validateAppreciationCreate],
      schema: createAppreciationDocumentation,
    },
    appreciationController.addAppreciation
  );

  fastify.put(
    "/:id/appreciation/:appreciationId",
    {
      preHandler: [fastify.authenticate, validateAppreciationUpdate],
      schema: updateAppreciationDocumentation,
    },
    appreciationController.updateAppreciation
  );

  fastify.delete(
    "/:id/appreciation/:appreciationId",
    {
      preHandler: [fastify.authenticate],
      schema: deleteAppreciationDocumentation,
    },
    appreciationController.deleteAppreciation
  );
};

export default investmentsRoutes;
