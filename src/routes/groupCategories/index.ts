import { GroupCategoryController } from "@controllers";
import {
  createGroupCategoryDocumentation,
  deleteGroupCategoryDocumentation,
  getGroupCategoryDocumentation,
  updateGroupCategoryDocumentation,
  listGroupCategoriesDocumentation,
} from "src/documentation"; // Asegúrate de que estos objetos de documentación existan
import { FastifyPluginAsync } from "fastify";

import {
  validateGroupCategoryCreate,
  validateGroupCategoryUpdate,
} from "packages/shared"; // Asegúrate de que estas funciones de validación existan

const groupCategoriesRoutes: FastifyPluginAsync = async (fastify) => {
  const groupCategoryController = new GroupCategoryController();

  fastify.get(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: listGroupCategoriesDocumentation,
    },
    groupCategoryController.getAllGroupCategories
  );

  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate, validateGroupCategoryCreate],
      schema: createGroupCategoryDocumentation,
    },
    groupCategoryController.addGroupCategory
  );

  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: getGroupCategoryDocumentation,
    },
    groupCategoryController.detailGroupCategory
  );

  fastify.put(
    "/:id",
    {
      preHandler: [fastify.authenticate, validateGroupCategoryUpdate],
      schema: updateGroupCategoryDocumentation,
    },
    groupCategoryController.updateGroupCategory
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: deleteGroupCategoryDocumentation,
    },
    groupCategoryController.deleteGroupCategory
  );
};

export default groupCategoriesRoutes;
