import { Badge, CreateBadge } from "../domain/badge";
import { IBadgeRepository } from "../domain/interfaces/badge.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import {
  CommonParamsPaginate,
  Paginate,
  ErrorMessage,
  handleShowDeleteData,
} from "packages/shared";

interface CurrencyAPIResponse {
  name: string;
  id: number;
  code: string;
}

export class BadgePrismaRepository implements IBadgeRepository {
  public async addBadge(data: CreateBadge): Promise<Badge | ErrorMessage> {
    try {
      const newBadge = await prisma.badge.create({
        data,
      });
      return newBadge;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async listBadge(
    params: CommonParamsPaginate
  ): Promise<{ content: Badge[]; meta: Paginate }> {
    const { size, page: pageParam, deleted } = params;

    const shouldPaginate = pageParam && Number(pageParam) > 0;

    if (shouldPaginate) {
      const currentPage = Number(pageParam);
      const effectiveSize = size && Number(size) > 0 ? Number(size) : 10;

      const [content, metaFromPrisma] = await prisma.badge
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
      const content = await prisma.badge.findMany();

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

  public async updateBadge(
    id: string,
    data: Partial<CreateBadge>
  ): Promise<Badge | ErrorMessage> {
    try {
      const updatedBadge = await prisma.badge.update({
        where: {
          id,
        },
        data,
      });
      return updatedBadge;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async detailBadge(id: string): Promise<Badge | null> {
    try {
      return await prisma.badge.findUnique({
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

  public async deleteBadge(id: string): Promise<Badge | null> {
    const badge = await prisma.badge.findUnique({
      where: { id },
    });
    if (!badge) {
      return null;
    }
    return await prisma.badge.delete({
      where: { id },
    });
  }

  public async importCurrenciesAsBadges(): Promise<{
    count: number;
    message?: string;
  }> {
    try {
      const response = await fetch(`${process.env.API_PROD}/currencies`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `API request failed: ${response.status} ${response.statusText}`,
          errorText
        );
        throw Object.assign(
          new Error(`API request failed: ${response.statusText}`),
          {
            statusCode: response.status,
            error: "API Error",
            message: `Failed to fetch currencies from API: ${response.status} ${
              response.statusText
            }. ${errorText || ""}`.trim(),
          }
        );
      }

      const currencies: CurrencyAPIResponse[] = await response.json();

      if (!Array.isArray(currencies)) {
        console.error(
          "Invalid API response format: Expected an array.",
          currencies
        );
        throw Object.assign(new Error("Invalid API response format"), {
          statusCode: 500,
          error: "API Data Error",
          message:
            "Expected an array of currencies from the API but received a different format.",
        });
      }

      const badgesToCreate: CreateBadge[] = currencies
        .filter(
          (currency) => currency.name && typeof currency.name === "string"
        )
        .map((currency) => ({
          name: currency.name,
          code: currency.code,
        }));

      if (badgesToCreate.length === 0) {
        return {
          count: 0,
          message:
            "No new currencies to import, or data was not in the expected format.",
        };
      }

      const result = await prisma.badge.createMany({
        data: badgesToCreate,
        skipDuplicates: true, // Assumes 'name' field has a unique constraint in Badge model
      });

      return { count: result.count };
    } catch (error: any) {
      console.error("Error importing currencies as badges:", error);
      // Re-throw if it's already an error structured by this method or a Prisma known error with code
      if (error.statusCode && error.error) throw error;

      // For other unexpected errors
      throw Object.assign(
        new Error(error.message || "Badge import process failed"),
        {
          statusCode: error.statusCode || 500,
          error: error.error || "Internal Server Error",
          message:
            error.message ||
            "An unexpected error occurred during badge import.",
        }
      );
    }
  }
}
