import { Appreciation, CreateAppreciation } from "../domain/appreciation";
import { IAppreciationRepository } from "../domain/interfaces/appreciation.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import {
  CommonParamsPaginate,
  Paginate,
  ErrorMessage,
  handleShowDeleteData,
} from "packages/shared";
import { APIResponse } from "packages/badge/infrastructure/badge.repository"; // Asumiendo APIResponse para el token

// Define el tipo para un solo objeto de inversión de la API externa
type APIAppreciationItem = {
  amount: number;
  date_appreciation: string;
  investment: {
    name: string;
  };
  created_at: string;
  updated_at: string;
};

// El tipo de respuesta para el endpoint /appreciations
type APIAppreciationResponse = APIAppreciationItem[];

export class AppreciationPrismaRepository implements IAppreciationRepository {
  public async addAppreciation(
    data: CreateAppreciation
  ): Promise<Appreciation | ErrorMessage> {
    try {
      const newAppreciation = await prisma.investmentAppreciation.create({
        data: {
          amount: data.amount,
          dateAppreciation: data.dateAppreciation,
          investment: {
            connect: {
              id: data.investmentId,
            },
          },
          user: {
            connect: {
              id: data.userId,
            },
          },
        },
      });
      return newAppreciation;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async listAppreciation(
    params: CommonParamsPaginate
  ): Promise<{ content: Appreciation[]; meta: Paginate }> {
    const { deleted, size, page } = params;
    const [content, meta] = await prisma.investmentAppreciation
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

  public async updateAppreciation(
    id: string,
    appreciationId: string,
    data: Partial<CreateAppreciation>
  ): Promise<Appreciation | ErrorMessage> {
    try {
      const updatedAppreciation = await prisma.investmentAppreciation.update({
        where: {
          id: appreciationId,
          investmentId: id,
        },
        data,
      });
      return updatedAppreciation;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async detailAppreciation(id: string): Promise<Appreciation | null> {
    try {
      return await prisma.investmentAppreciation.findUnique({
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

  public async deleteAppreciation(
    id: string,
    appreciationId: string
  ): Promise<Appreciation | null> {
    const appreciation = await prisma.investmentAppreciation.findUnique({
      where: { id: appreciationId, investmentId: id },
    });
    if (!appreciation) {
      return null;
    }
    return await prisma.investmentAppreciation.delete({
      where: { id: appreciationId, investmentId: id },
    });
  }

  public async importAppreciations(): Promise<{
    appreciationCount: number;
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

      // 2. Obtener las apreciaciones de la API externa
      const appreciationsResponse = await fetch(`${apiProd}/appretiations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!appreciationsResponse.ok) {
        const errorText = await appreciationsResponse.text();
        throw Object.assign(
          new Error(
            `API appreciations fetch failed: ${appreciationsResponse.statusText}`
          ),
          {
            statusCode: appreciationsResponse.status,
            error: "API Error",
            message: `Failed to fetch appreciations from API: ${
              appreciationsResponse.status
            } ${appreciationsResponse.statusText}. ${errorText || ""}`.trim(),
          }
        );
      }

      const oldAppreciations: APIAppreciationResponse =
        await appreciationsResponse.json();

      // 3. Procesar las apreciaciones y prepararlas para la inserción masiva
      const appreciationsToCreatePromises = oldAppreciations
        .filter((appreciation) => appreciation.investment)
        .map(async (appreciation) => {
          const investmentAppreciation = await prisma.investment.findFirst({
            where: { name: appreciation.investment.name },
          });

          if (!investmentAppreciation) {
            console.warn(
              `Appreciation '${appreciation.investment.name}' not found for appreciation. Skipping.`
            );
            return null;
          }

          return {
            amount: appreciation.amount,
            dateAppreciation: new Date(appreciation.date_appreciation),
            investmentId: investmentAppreciation.id,
            userId: userId,
            createdAt: new Date(appreciation.created_at),
            updatedAt: new Date(appreciation.updated_at),
          } as CreateAppreciation;
        });

      const appreciationsToCreate = (
        await Promise.all(appreciationsToCreatePromises)
      ).filter((app) => app !== null);

      // 4. Insertar las apreciaciones en la base de datos local
      const result = await prisma.investmentAppreciation.createMany({
        data: appreciationsToCreate,
        skipDuplicates: true,
      });

      return {
        appreciationCount: result.count,
      };
    } catch (error: unknown) {
      console.error("Error importing appreciations:", error);
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
          (error as Error)?.message || "Appreciation import process failed"
        ),
        {
          statusCode: (error as any)?.statusCode || 500,
          error: (error as any)?.error || "Internal Server Error",
          message:
            (error as Error)?.message ||
            "An unexpected error occurred during appreciation import.",
        }
      );
    }
  }
}
