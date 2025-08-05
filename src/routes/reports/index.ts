import { ReportController } from "@controllers";
import { movementReportDocumentation } from "src/documentation";
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
};

export default reportsRoutes;
