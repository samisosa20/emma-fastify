import { Category, CreateCategory } from "../domain/category";
import { ICategoryRepository } from "../domain/interfaces/category.interfaces";
import { CommonParamsPaginate, Paginate, ErrorMessage } from "packages/shared";

import prisma from "packages/shared/settings/prisma.client";
import { handleShowDeleteData } from "packages/shared";

export class CategoryPrismaRepository implements ICategoryRepository {
  async addCategory(
    category: CreateCategory
  ): Promise<Category | ErrorMessage> {
    const newCategory = await prisma.category.create({
      data: {
        ...category,
      },
    });
    return newCategory;
  }

  async listCategories(
    params: CommonParamsPaginate
  ): Promise<{ content: Category[]; meta: Paginate }> {
    const { deleted, size, page } = params;
    const [content, meta] = await prisma.category
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

  async updateCategory(
    id: string,
    category: Partial<CreateCategory>
  ): Promise<Category | ErrorMessage> {
    try {
      const updatedCategory = await prisma.category.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          ...category,
        },
      });
      return updatedCategory;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  async detailCategory(id: string): Promise<Category | null> {
    try {
      return await prisma.category.findUnique({
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

  async deleteCategory(id: string): Promise<Category | null> {
    try {
      return await prisma.category.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }
}