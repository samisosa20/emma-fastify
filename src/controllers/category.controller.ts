import { FastifyRequest, FastifyReply } from "fastify";

import { formatErrorMessage } from "@lib";

import { CategoryUseCase } from "packages/category/application/category.use-case";
import { CategoryPrismaRepository } from "packages/category/infrastructure/category.repository";
import { CreateCategory } from "packages/category/domain/category";

type CategoryParams = {
  page: number;
  deleted?: "1" | "0";
  size?: number;
  // Agrega aquí otros parámetros de consulta específicos para Category si son necesarios
};

const categoryRepository = new CategoryPrismaRepository();
const categoryUseCase = new CategoryUseCase(categoryRepository);

export class CategoryController {
  getAllCategories = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.query as CategoryParams;
    return await categoryUseCase.listCategories(params);
  };

  addCategory = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataCategory = request.body as CreateCategory;

    try {
      return categoryUseCase.addCategory({
        ...dataCategory,
        userId: request.user.id,
      });
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Category creation failed",
        message: detail,
      });
    }
  };

  updateCategory = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataCategory = request.body as Partial<CreateCategory>;
    const { id } = request.params as { id: string };

    try {
      return categoryUseCase.updateCategory(id, dataCategory);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Category update failed",
        message: detail,
      });
    }
  };

  detailCategory = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    return categoryUseCase.detailCategory(id);
  };

  deleteCategory = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const result = await categoryUseCase.deleteCategory(id);
    if (result === null) {
      return reply.status(404).send({ message: "Category not found" });
    }
    return result;
  };
  importCategories = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.query as { id: string };
    const result = await categoryUseCase.importCategories(id);
    if (result === null) {
      return reply.status(404).send({ message: "Category not found" });
    }
    return result;
  };
}
