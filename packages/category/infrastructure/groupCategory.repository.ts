import { GroupCategory, CreateGroupCategory } from '../domain/groupCategory';
import { IGroupCategoryRepository } from '../domain/interfaces/groupCategory.interfaces';

import prisma from "packages/shared/settings/prisma.client";
import { CommonParamsPaginate, Paginate, ErrorMessage, handleShowDeleteData } from 'packages/shared';

export class GroupCategoryPrismaRepository implements IGroupCategoryRepository {
  public async addGroupCategory(
    data: CreateGroupCategory
  ): Promise<GroupCategory | ErrorMessage> {
    try {
      const newGroupCategory = await prisma.groupCategory.create({
        data,
      });
      return newGroupCategory;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async listGroupCategory(
    params: CommonParamsPaginate
  ): Promise<{ content: GroupCategory[]; meta: Paginate }> {
    const { deleted, size, page } = params;
    const [content, meta] = await prisma.groupCategory
      .paginate({
        where: {
          OR: handleShowDeleteData(deleted === "1"),
        },
      })
      .withPages({
        limit: size ? Number(size) : 10,
        page: page && page > 0 ? Number(page) : 1,
      });

    return {
      content,
      meta,
    };
  }

  public async updateGroupCategory(
    id: string,
    data: Partial<CreateGroupCategory>
  ): Promise<GroupCategory | ErrorMessage> {
    try {
      const updatedGroupCategory = await prisma.groupCategory.update({
        where: {
          id,
          deletedAt: null,
        },
        data,
      });
      return updatedGroupCategory;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async detailGroupCategory(id: string): Promise<GroupCategory | null> {
    try {
      return await prisma.groupCategory.findUnique({
        where: { id },
      });
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async deleteGroupCategory(id: string): Promise<GroupCategory | null> {
    const groupCategory = await prisma.groupCategory.findUnique({
      where: { id },
    });
    if (!groupCategory) {
      return null;
    }
    return await prisma.groupCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}