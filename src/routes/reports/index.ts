import { ReportController } from "@controllers";
import {
  accountReportBalanceDocumentation,
  categoryReportDocumentation,
  generalReportBalanceDocumentation,
  historyReportDocumentation,
  movementReportDocumentation,
} from "src/documentation";
import { FastifyPluginAsync } from "fastify";
import {
  validateReportMovements,
  validateReportAccountBalance,
  validateReportCategoryStats,
  validateReportBalanceHistory,
} from "packages/shared";

const reportsRoutes: FastifyPluginAsync = async (fastify) => {
  const reportController = new ReportController();

  fastify.get(
    "/:type/:period",
    {
      preHandler: [fastify.authenticate, validateReportMovements],
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
      preHandler: [fastify.authenticate, validateReportAccountBalance],
      schema: accountReportBalanceDocumentation,
    },
    reportController.reportAccountBalance
  );
  fastify.get(
    "/category/:id/stats",
    {
      preHandler: [fastify.authenticate, validateReportCategoryStats],
      schema: categoryReportDocumentation,
    },
    reportController.reportCategoryStats
  );
  fastify.get(
    "/history",
    {
      preHandler: [fastify.authenticate, validateReportBalanceHistory],
      schema: historyReportDocumentation,
    },
    reportController.reportBalanceHistory
  );
};

export default reportsRoutes;
