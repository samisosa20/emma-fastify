import { Heritage, CreateHeritage } from "../domain/heritage";
import { IHeritageRepository } from "../domain/interfaces/heritage.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import {
  CommonParamsPaginate,
  Paginate,
  ErrorMessage,
  handleShowDeleteData,
} from "packages/shared";

export class HeritagePrismaRepository implements IHeritageRepository {
  public async addHeritage(
    data: CreateHeritage
  ): Promise<Heritage | ErrorMessage> {
    try {
      const newHeritage = await prisma.heritage.create({
        data,
      });
      return newHeritage;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async listHeritage(
    params: CommonParamsPaginate
  ): Promise<{ content: Heritage[]; meta: Paginate }> {
    const { deleted, size, page } = params;
    const [content, meta] = await prisma.heritage
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

  public async updateHeritage(
    id: string,
    data: Partial<CreateHeritage>
  ): Promise<Heritage | ErrorMessage> {
    try {
      const updatedHeritage = await prisma.heritage.update({
        where: {
          id,
        },
        data,
      });
      return updatedHeritage;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async detailHeritage(id: string): Promise<Heritage | null> {
    try {
      return await prisma.heritage.findUnique({
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

  public async deleteHeritage(id: string): Promise<Heritage | null> {
    const heritage = await prisma.heritage.findUnique({
      where: { id },
    });
    if (!heritage) {
      return null;
    }
    return await prisma.heritage.delete({
      where: { id },
    });
  }
}
