import { CategoryController } from "@controllers";
import {
  createCategoryDocumentation,
  deleteCategoryDocumentation,
  getCategoryDocumentation,
  updateCategoryDocumentation,
  listCategoriesDocumentation,
} from "src/documentation";
import { FastifyPluginAsync } from "fastify";

import {
  validateCategoryCreate,
  validateCategoryUpdate,
} from "packages/shared";

const categoriesRoutes: FastifyPluginAsync = async (fastify) => {
  const categoryController = new CategoryController();

  fastify.get(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: listCategoriesDocumentation,
    },
    categoryController.getAllCategories
  );

  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate, validateCategoryCreate],
      schema: createCategoryDocumentation,
    },
    categoryController.addCategory
  );

  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: getCategoryDocumentation,
    },
    categoryController.detailCategory
  );

  fastify.put(
    "/:id",
    {
      preHandler: [fastify.authenticate, validateCategoryUpdate],
      schema: updateCategoryDocumentation,
    },
    categoryController.updateCategory
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: deleteCategoryDocumentation,
    },
    categoryController.deleteCategory
  );

  fastify.post(
    "/import-categories",
    {
      preHandler: [fastify.authenticate],
    },
    categoryController.importCategories
  );
};

export default categoriesRoutes;
