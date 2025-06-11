import { Badge, CreateBadge } from "../domain/badge";
import { IBadgeRepository } from "../domain/interfaces/badge.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import {
  CommonParamsPaginate,
  Paginate,
  ErrorMessage,
  handleShowDeleteData,
} from "packages/shared";

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
    const { deleted, size, page } = params;
    const [content, meta] = await prisma.badge
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
}
