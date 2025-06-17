import { GroupCategory, CreateGroupCategory } from "../domain/groupCategory";
import { IGroupCategoryRepository } from "../domain/interfaces/groupCategory.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import {
  CommonParamsPaginate,
  Paginate,
  ErrorMessage,
  handleShowDeleteData,
} from "packages/shared";

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
    const { size, page: pageParam } = params;

    const shouldPaginate = pageParam && Number(pageParam) > 0;

    if (shouldPaginate) {
      const currentPage = Number(pageParam);
      const effectiveSize = size && Number(size) > 0 ? Number(size) : 10;

      const [content, metaFromPrisma] = await prisma.groupCategory
        .paginate()
        .withPages({
          limit: effectiveSize,
          page: currentPage,
        });

      return {
        content,
        meta: metaFromPrisma,
      };
    } else {
      const content = await prisma.groupCategory.findMany();

      const totalCount = content.length;
      const meta: Paginate = {
        isFirstPage: totalCount > 0,
        isLastPage: totalCount > 0,
        currentPage: totalCount > 0 ? 1 : 0,
        previousPage: null,
        nextPage: null,
        pageCount: totalCount > 0 ? 1 : 0,
        totalCount: totalCount,
      };

      return {
        content,
        meta,
      };
    }
  }

  public async updateGroupCategory(
    id: string,
    data: Partial<CreateGroupCategory>
  ): Promise<GroupCategory | ErrorMessage> {
    try {
      const updatedGroupCategory = await prisma.groupCategory.update({
        where: {
          id,
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
    return await prisma.groupCategory.delete({
      where: { id },
    });
  }
}
