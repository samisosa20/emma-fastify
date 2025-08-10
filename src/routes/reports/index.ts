import { ReportController } from "@controllers";
import {
  accountReportBalanceDocumentation,
  categoryReportDocumentation,
  generalReportBalanceDocumentation,
  movementReportDocumentation,
} from "src/documentation";
import { FastifyPluginAsync } from "fastify";

const reportsRoutes: FastifyPluginAsync = async (fastify) => {
  const reportController = new ReportController();

  fastify.get(
    "/:type/:period",
    {
      preHandler: [fastify.authenticate],
      schema: movementReportDocumentation,
    },
    reportController.reportMovements
  );
  fastify.get(
    "/general-balance",
    {
      preHandler: [fastify.authenticate],
      schema: generalReportBalanceDocumentation,
    },
    reportController.reportBalance
  );
  fastify.get(
    "/account/:id/balance",
    {
      preHandler: [fastify.authenticate],
      schema: accountReportBalanceDocumentation,
    },
    reportController.reportAccountBalance
  );
  fastify.get(
    "/category/:id/stats",
    {
      preHandler: [fastify.authenticate],
      schema: categoryReportDocumentation,
    },
    reportController.reportCategoryStats
  );
};

export default reportsRoutes;
