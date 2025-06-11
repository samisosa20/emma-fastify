import { Budget, CreateBudget } from "../domain/budget";
import { IBudgetRepository } from "../domain/interfaces/budget.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import {
  CommonParamsPaginate,
  Paginate,
  ErrorMessage,
  handleShowDeleteData,
} from "packages/shared";

export class BudgetPrismaRepository implements IBudgetRepository {
  public async addBudget(data: CreateBudget): Promise<Budget | ErrorMessage> {
    try {
      const newBudget = await prisma.budget.create({
        data,
      });
      return newBudget;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async listBudget(
    params: CommonParamsPaginate
  ): Promise<{ content: Budget[]; meta: Paginate }> {
    const { deleted, size, page } = params;
    const [content, meta] = await prisma.budget
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

  public async updateBudget(
    id: string,
    data: Partial<CreateBudget>
  ): Promise<Budget | ErrorMessage> {
    try {
      const updatedBudget = await prisma.budget.update({
        where: {
          id,
        },
        data,
      });
      return updatedBudget;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async detailBudget(id: string): Promise<Budget | null> {
    try {
      return await prisma.budget.findUnique({
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

  public async deleteBudget(id: string): Promise<Budget | null> {
    const budget = await prisma.budget.findUnique({
      where: { id },
    });
    if (!budget) {
      return null;
    }
    return await prisma.budget.delete({
      where: { id },
    });
  }
}
