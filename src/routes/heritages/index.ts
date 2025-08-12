import { HeritageController } from "@controllers";
import {
  createHeritageDocumentation,
  deleteHeritageDocumentation,
  getHeritageDocumentation,
  updateHeritageDocumentation,
  listHeritagesDocumentation,
  yearHeritageDocumentation,
} from "src/documentation";
import { FastifyPluginAsync } from "fastify";

import {
  validateHeritageCreate,
  validateHeritageUpdate,
} from "packages/shared";

const heritagesRoutes: FastifyPluginAsync = async (fastify) => {
  const heritageController = new HeritageController();

  fastify.get(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: listHeritagesDocumentation,
    },
    heritageController.getAllHeritages
  );

  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate, validateHeritageCreate],
      schema: createHeritageDocumentation,
    },
    heritageController.addHeritage
  );

  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: getHeritageDocumentation,
    },
    heritageController.detailHeritage
  );

  fastify.put(
    "/:id",
    {
      preHandler: [fastify.authenticate, validateHeritageUpdate],
      schema: updateHeritageDocumentation,
    },
    heritageController.updateHeritage
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: deleteHeritageDocumentation,
    },
    heritageController.deleteHeritage
  );

  fastify.post(
    "/import-heritages",
    {
      preHandler: [fastify.authenticate],
    },
    heritageController.importHeritages
  );

  fastify.get(
    "/year",
    {
      preHandler: [fastify.authenticate],
      schema: yearHeritageDocumentation,
    },
    heritageController.yearHeritage
  );
};

export default heritagesRoutes;
