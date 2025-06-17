import { Period, CreatePeriod } from "../domain/period";
import { IPeriodRepository } from "../domain/interfaces/period.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import {
  CommonParamsPaginate,
  Paginate,
  ErrorMessage,
  handleShowDeleteData,
} from "packages/shared";

export class PeriodPrismaRepository implements IPeriodRepository {
  public async addPeriod(data: CreatePeriod): Promise<Period | ErrorMessage> {
    try {
      const newPeriod = await prisma.period.create({
        data,
      });
      return newPeriod;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async listPeriod(
    params: CommonParamsPaginate
  ): Promise<{ content: Period[]; meta: Paginate }> {
    const { size, page: pageParam } = params;

    const shouldPaginate = pageParam && Number(pageParam) > 0;

    if (shouldPaginate) {
      const currentPage = Number(pageParam);
      const effectiveSize = size && Number(size) > 0 ? Number(size) : 10;

      const [content, metaFromPrisma] = await prisma.period
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
      const content = await prisma.period.findMany();

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

  public async updatePeriod(
    id: string,
    data: Partial<CreatePeriod>
  ): Promise<Period | ErrorMessage> {
    try {
      const updatedPeriod = await prisma.period.update({
        where: {
          id,
        },
        data,
      });
      return updatedPeriod;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async detailPeriod(id: string): Promise<Period | null> {
    try {
      return await prisma.period.findUnique({
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

  public async deletePeriod(id: string): Promise<Period | null> {
    const period = await prisma.period.findUnique({
      where: { id },
    });
    if (!period) {
      return null;
    }
    return await prisma.period.delete({
      where: { id },
    });
  }
}
