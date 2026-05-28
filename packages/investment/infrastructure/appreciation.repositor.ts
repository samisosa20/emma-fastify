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
    data: CreateAppreciation,
    userId: string
  ): Promise<Appreciation | ErrorMessage> {
    try {
      const investmentExists = await prisma.investment.findFirst({
        where: {
          id: data.investmentId,
          userId,
        },
      });

      if (!investmentExists) {
        throw new Error("Investment not found");
      }

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
              id: userId,
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
    params: CommonParamsPaginate,
    userId: string
  ): Promise<{ content: Appreciation[]; meta: Paginate }> {
    const { deleted, size, page } = params;
    const [content, meta] = await prisma.investmentAppreciation
      .paginate({
        where: {
          userId,
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
    data: Partial<CreateAppreciation>,
    userId: string
  ): Promise<Appreciation | ErrorMessage> {
    try {
      const appreciationExists = await prisma.investmentAppreciation.findFirst({
        where: {
          id: appreciationId,
          investmentId: id,
          userId,
        },
      });

      if (!appreciationExists) {
        throw new Error("Appreciation not found");
      }

      const { userId: _, ...dataToUpdate } = data;
      const updatedAppreciation = await prisma.investmentAppreciation.update({
        where: {
          id: appreciationId,
        },
        data: dataToUpdate,
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

  public async detailAppreciation(
    id: string,
    userId: string
  ): Promise<Appreciation | null> {
    try {
      return await prisma.investmentAppreciation.findFirst({
        where: { id, userId },
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
    appreciationId: string,
    userId: string
  ): Promise<Appreciation | null> {
    const appreciation = await prisma.investmentAppreciation.findFirst({
      where: { id: appreciationId, investmentId: id, userId },
    });
    if (!appreciation) {
      return null;
    }
    return await prisma.investmentAppreciation.delete({
      where: { id: appreciationId },
    });
  }

  public async importAppreciations(userId: string): Promise<{
    appreciationCount: number;
  }> {
    try {
      // Validar que las variables de entorno esenciales estén definidas
      const apiProd = process.env.API_PROD;
      const apiEmail = process.env.API_EMAIL;
      const apiPassword = process.env.API_PASSWORD;

      if (!apiProd || !apiEmail || !apiPassword || !userId) {
        throw Object.assign(new Error("Missing API environment variables"), {
          statusCode: 500,
          error: "Configuration Error",
          message:
            "API_PROD, API_EMAIL, API_PASSWORD, or authenticated userId are not set.",
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
      const appreciationsResponse = await fetch(`${apiProd}/appreciations`, {
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

      // ⚡ Bolt: Bulk fetch all user investments to eliminate N database queries (N*1) inside the loop.
      const userInvestments = await prisma.investment.findMany({
        where: { userId },
      });

      // ⚡ Bolt: Use a Hash Map for O(1) in-memory lookups instead of sequential database calls.
      const investmentsMap = new Map(userInvestments.map((i) => [i.name, i]));

      // 3. Procesar las apreciaciones y prepararlas para la inserción masiva
      const appreciationsToCreate = oldAppreciations
        .filter((appreciation) => appreciation.investment)
        .map((appreciation) => {
          const investmentAppreciation = investmentsMap.get(
            appreciation.investment.name
          );

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
        })
        .filter((app): app is CreateAppreciation => app !== null);

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
