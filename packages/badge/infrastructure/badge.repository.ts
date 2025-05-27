import { Badge, CreateBadge } from '../domain/badge';
import { IBadgeRepository } from '../domain/interfaces/badge.interfaces';

import prisma from "packages/shared/settings/prisma.client";
import { CommonParamsPaginate, Paginate, ErrorMessage, handleShowDeleteData } from 'packages/shared';

export class BadgePrismaRepository implements IBadgeRepository {
  public async addBadge(
    data: CreateBadge
  ): Promise<Badge | ErrorMessage> {
    try {
      const newBadge = await prisma.account.create({
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
    const [content, meta] = await prisma.account
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
      const updatedBadge = await prisma.account.update({
        where: {
          id,
          deletedAt: null,
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
      return await prisma.account.findUnique({
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
    const account = await prisma.account.findUnique({
      where: { id },
    });
    if (!account) {
 return null;
    }
    return await prisma.account.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}