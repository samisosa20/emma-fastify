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
  validateInvestmentId,
  validateAppreciationId,
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
      preHandler: [fastify.authenticate, validateInvestmentId],
      schema: getInvestmentDocumentation,
    },
    investmentController.detailInvestment
  );

  fastify.put(
    "/:id",
    {
      preHandler: [
        fastify.authenticate,
        validateInvestmentId,
        validateInvestmentUpdate,
      ],
      schema: updateInvestmentDocumentation,
    },
    investmentController.updateInvestment
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate, validateInvestmentId],
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
      preHandler: [
        fastify.authenticate,
        validateInvestmentId,
        validateAppreciationCreate,
      ],
      schema: createAppreciationDocumentation,
    },
    appreciationController.addAppreciation
  );

  fastify.put(
    "/:id/appreciation/:appreciationId",
    {
      preHandler: [
        fastify.authenticate,
        validateAppreciationId,
        validateAppreciationUpdate,
      ],
      schema: updateAppreciationDocumentation,
    },
    appreciationController.updateAppreciation
  );

  fastify.delete(
    "/:id/appreciation/:appreciationId",
    {
      preHandler: [fastify.authenticate, validateAppreciationId],
      schema: deleteAppreciationDocumentation,
    },
    appreciationController.deleteAppreciation
  );
};

export default investmentsRoutes;
