import { FastifyRequest, FastifyReply } from "fastify";

import { formatErrorMessage } from "@lib";

import { GroupCategoryUseCase } from "packages/category/application/groupCategory.use-case";
import { GroupCategoryPrismaRepository } from "packages/category/infrastructure/groupCategory.repository";
import { CreateGroupCategory } from "packages/category/domain/groupCategory";

type GroupCategoryParams = {
  page: number;
  deleted?: "1" | "0";
  size?: number;
  // Agrega aquí otros parámetros de consulta específicos para GroupCategory si son necesarios
};

const groupCategoryRepository = new GroupCategoryPrismaRepository();
const groupCategoryUseCase = new GroupCategoryUseCase(groupCategoryRepository);

export class GroupCategoryController {
  getAllGroupCategories = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const params = request.query as GroupCategoryParams;
    return await groupCategoryUseCase.listGroupCategory(params);
  };

  addGroupCategory = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataGroupCategory = request.body as CreateGroupCategory;

    try {
      return groupCategoryUseCase.addGroupCategory(dataGroupCategory);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "GroupCategory creation failed",
        message: detail,
      });
    }
  };

  updateGroupCategory = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const dataGroupCategory = request.body as Partial<CreateGroupCategory>;
    const { id } = request.params as { id: string };

    try {
      return groupCategoryUseCase.updateGroupCategory(id, dataGroupCategory);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "GroupCategory update failed",
        message: detail,
      });
    }
  };

  detailGroupCategory = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { id } = request.params as { id: string };
    return groupCategoryUseCase.detailGroupCategory(id);
  };

  deleteGroupCategory = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { id } = request.params as { id: string };
    const result = await groupCategoryUseCase.deleteGroupCategory(id);
    if (result === null) {
      return reply.status(404).send({ message: "GroupCategory not found" });
    }
    return result;
  };
}
