import { PlannedPayment, CreatePlannedPayment } from "../domain/plannedPayment";
import { IPlannedPaymentRepository } from "../domain/interfaces/plannedPayment.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import {
  CommonParamsPaginate,
  Paginate,
  ErrorMessage,
  handleShowDeleteData,
} from "packages/shared";
import { APIResponse } from "packages/badge/infrastructure/badge.repository";

type APIPaymentItem = {
  description: string | null;
  amount: number;
  start_date: string;
  specific_day: number;
  end_date: string | null;
  account: {
    name: string;
  };
  category: {
    name: string;
  };
  created_at: string;
  updated_at: string;
};

type APIPaymentResponse = APIPaymentItem[];

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
    const { size, page } = params;
    const [content, meta] = await prisma.plannedPayment
      .paginate({
        include: {
          account: {
            select: {
              name: true,
              id: true,
            },
          },
          category: {
            select: {
              name: true,
              id: true,
            },
          },
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
        include: {
          account: {
            select: {
              name: true,
              id: true,
            },
          },
          category: {
            select: {
              name: true,
              id: true,
            },
          },
        },
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

  public async importPlannedPayments(): Promise<{
    plannedPaymentCount: number;
  }> {
    try {
      // Validar que las variables de entorno esenciales estén definidas
      const apiProd = process.env.API_PROD;
      const apiEmail = process.env.API_EMAIL;
      const apiPassword = process.env.API_PASSWORD;
      const userId = process.env.USER_ID;

      if (!apiProd || !apiEmail || !apiPassword || !userId) {
        throw Object.assign(new Error("Missing API environment variables"), {
          statusCode: 500,
          error: "Configuration Error",
          message: "API_PROD, API_EMAIL, API_PASSWORD, or USER_ID are not set.",
        });
      }

      // 1. Iniciar sesión para obtener el token
      const loginResponse = await fetch(`${apiProd}/login`, {
        method: "POST",
        body: JSON.stringify({
          email: apiEmail,
          password: apiPassword,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        throw Object.assign(
          new Error(`API login failed: ${loginResponse.statusText}`),
          {
            statusCode: loginResponse.status,
            error: "API Error",
            message: `Failed to login to API: ${loginResponse.status} ${
              loginResponse.statusText
            }. ${errorText || ""}`.trim(),
          }
        );
      }

      const apiResponse: APIResponse = await loginResponse.json();
      const token = apiResponse.token;

      // 2. Obtener los pagos planificados de la API externa
      const paymentsResponse = await fetch(`${apiProd}/payments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!paymentsResponse.ok) {
        const errorText = await paymentsResponse.text();
        throw Object.assign(
          new Error(
            `API payments fetch failed: ${paymentsResponse.statusText}`
          ),
          {
            statusCode: paymentsResponse.status,
            error: "API Error",
            message: `Failed to fetch payments from API: ${
              paymentsResponse.status
            } ${paymentsResponse.statusText}. ${errorText || ""}`.trim(),
          }
        );
      }

      const oldPayments: APIPaymentResponse = await paymentsResponse.json();

      // 3. Procesar los pagos y prepararlos para la inserción masiva
      const paymentsToCreatePromises = oldPayments.map(async (payment) => {
        const account = await prisma.account.findFirst({
          where: { name: payment.account.name },
        });
        const category = await prisma.category.findFirst({
          where: { name: payment.category.name },
        });

        if (!account || !category) {
          console.warn(
            `Skipping planned payment "${payment.description}" due to missing Account or Category.`
          );
          return null;
        }

        return {
          description: payment.description,
          amount: payment.amount,
          startDate: new Date(payment.start_date),
          endDate: payment.end_date ? new Date(payment.end_date) : null,
          specificDay: payment.specific_day,
          categoryId: category.id,
          accountId: account.id,
          userId: userId,
          createdAt: new Date(payment.created_at),
          updatedAt: new Date(payment.updated_at),
        } as CreatePlannedPayment;
      });

      const paymentsToCreate = (
        await Promise.all(paymentsToCreatePromises)
      ).filter((p): p is CreatePlannedPayment => p !== null);

      // 4. Insertar los pagos planificados en la base de datos local
      const result = await prisma.plannedPayment.createMany({
        data: paymentsToCreate,
        skipDuplicates: true,
      });

      return {
        plannedPaymentCount: result.count,
      };
    } catch (error: unknown) {
      console.error("Error importing planned payments:", error);
      if (
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        "error" in error
      ) {
        throw error;
      }
      throw Object.assign(
        new Error(
          (error as Error)?.message || "Planned payment import process failed"
        ),
        {
          statusCode: (error as any)?.statusCode || 500,
          error: (error as any)?.error || "Internal Server Error",
          message:
            (error as Error)?.message ||
            "An unexpected error occurred during planned payment import.",
        }
      );
    }
  }
}
