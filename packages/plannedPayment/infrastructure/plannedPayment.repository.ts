import { PlannedPayment, CreatePlannedPayment } from "../domain/plannedPayment";
import { IPlannedPaymentRepository } from "../domain/interfaces/plannedPayment.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import {
  CommonParamsPaginate,
  Paginate,
  ErrorMessage,
  handleShowDeleteData,
} from "packages/shared";

export class PlannedPaymentPrismaRepository
  implements IPlannedPaymentRepository
{
  public async addPlannedPayment(
    data: CreatePlannedPayment
  ): Promise<PlannedPayment | ErrorMessage> {
    try {
      const newPlannedPayment = await prisma.plannedPayment.create({
        data,
      });
      return newPlannedPayment;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async listPlannedPayment(
    params: CommonParamsPaginate
  ): Promise<{ content: PlannedPayment[]; meta: Paginate }> {
    const { deleted, size, page } = params;
    const [content, meta] = await prisma.plannedPayment
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

  public async updatePlannedPayment(
    id: string,
    data: Partial<CreatePlannedPayment>
  ): Promise<PlannedPayment | ErrorMessage> {
    try {
      const updatedPlannedPayment = await prisma.plannedPayment.update({
        where: {
          id,
        },
        data,
      });
      return updatedPlannedPayment;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async detailPlannedPayment(
    id: string
  ): Promise<PlannedPayment | null> {
    try {
      return await prisma.plannedPayment.findUnique({
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

  public async deletePlannedPayment(
    id: string
  ): Promise<PlannedPayment | null> {
    const plannedPayment = await prisma.plannedPayment.findUnique({
      where: { id },
    });
    if (!plannedPayment) {
      return null;
    }
    return await prisma.plannedPayment.delete({
      where: { id },
    });
  }
}
