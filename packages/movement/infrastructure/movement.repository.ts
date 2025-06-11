import { Movement, CreateMovement } from "../domain/movement";
import { IMovementRepository } from "../domain/interfaces/movement.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import {
  CommonParamsPaginate,
  Paginate,
  ErrorMessage,
  handleShowDeleteData,
} from "packages/shared";

export class MovementPrismaRepository implements IMovementRepository {
  public async addMovement(
    data: CreateMovement
  ): Promise<Movement | ErrorMessage> {
    try {
      const newMovement = await prisma.movement.create({
        data,
      });
      return newMovement;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async listMovement(
    params: CommonParamsPaginate
  ): Promise<{ content: Movement[]; meta: Paginate }> {
    const { deleted, size, page } = params;
    const [content, meta] = await prisma.movement
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

  public async updateMovement(
    id: string,
    data: Partial<CreateMovement>
  ): Promise<Movement | ErrorMessage> {
    try {
      const updatedMovement = await prisma.movement.update({
        where: {
          id,
        },
        data,
      });
      return updatedMovement;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async detailMovement(id: string): Promise<Movement | null> {
    try {
      return await prisma.movement.findUnique({
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

  public async deleteMovement(id: string): Promise<Movement | null> {
    const movement = await prisma.movement.findUnique({
      where: { id },
    });
    if (!movement) {
      return null;
    }
    return await prisma.movement.delete({
      where: { id },
    });
  }
}
