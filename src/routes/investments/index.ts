import { InvestmentController } from "@controllers";
import {
  createInvestmentDocumentation,
  deleteInvestmentDocumentation,
  getInvestmentDocumentation,
  updateInvestmentDocumentation,
  listInvestmentsDocumentation,
} from "src/documentation";
import { FastifyPluginAsync } from "fastify";

import {
  validateInvestmentCreate,
  validateInvestmentUpdate,
} from "packages/shared";

const investmentsRoutes: FastifyPluginAsync = async (fastify) => {
  const investmentController = new InvestmentController();

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
};

export default investmentsRoutes;
