import { BudgetController } from "@controllers";
import {
  createBudgetDocumentation,
  deleteBudgetDocumentation,
  getBudgetDocumentation,
  updateBudgetDocumentation,
  listBudgetsDocumentation,
} from "src/documentation";
import { FastifyPluginAsync } from "fastify";

import { validateBudgetCreate, validateBudgetUpdate } from "packages/shared";

const budgetsRoutes: FastifyPluginAsync = async (fastify) => {
  const budgetController = new BudgetController();

  fastify.get(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: listBudgetsDocumentation,
    },
    budgetController.getAllBudgets
  );

  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate, validateBudgetCreate],
      schema: createBudgetDocumentation,
    },
    budgetController.addBudget
  );

  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: getBudgetDocumentation,
    },
    budgetController.detailBudget
  );

  fastify.put(
    "/:id",
    {
      preHandler: [fastify.authenticate, validateBudgetUpdate],
      schema: updateBudgetDocumentation,
    },
    budgetController.updateBudget
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: deleteBudgetDocumentation,
    },
    budgetController.deleteBudget
  );
};

export default budgetsRoutes;
