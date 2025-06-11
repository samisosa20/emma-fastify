import { Investment, CreateInvestment } from "../domain/investment";
import { IInvestmentRepository } from "../domain/interfaces/investment.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import {
  CommonParamsPaginate,
  Paginate,
  ErrorMessage,
  handleShowDeleteData,
} from "packages/shared";

export class InvestmentPrismaRepository implements IInvestmentRepository {
  public async addInvestment(
    data: CreateInvestment
  ): Promise<Investment | ErrorMessage> {
    try {
      const newInvestment = await prisma.investment.create({
        data,
      });
      return newInvestment;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async listInvestment(
    params: CommonParamsPaginate
  ): Promise<{ content: Investment[]; meta: Paginate }> {
    const { deleted, size, page } = params;
    const [content, meta] = await prisma.investment
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

  public async updateInvestment(
    id: string,
    data: Partial<CreateInvestment>
  ): Promise<Investment | ErrorMessage> {
    try {
      const updatedInvestment = await prisma.investment.update({
        where: {
          id,
          deletedAt: null,
        },
        data,
      });
      return updatedInvestment;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async detailInvestment(id: string): Promise<Investment | null> {
    try {
      return await prisma.investment.findUnique({
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

  public async deleteInvestment(id: string): Promise<Investment | null> {
    const investment = await prisma.investment.findUnique({
      where: { id },
    });
    if (!investment) {
      return null;
    }
    return await prisma.investment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
