import { Heritage, CreateHeritage } from "../domain/heritage";
import { IHeritageRepository } from "../domain/interfaces/heritage.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import {
  CommonParamsPaginate,
  Paginate,
  ErrorMessage,
  handleShowDeleteData,
} from "packages/shared";
import { APIResponse } from "packages/badge/infrastructure/badge.repository";

// Define el tipo para un solo objeto de patrimonio de la API externa
type APIHeritageItem = {
  name: string;
  comercial_amount: number;
  legal_amount: number;
  year: number;
  currency: {
    code: string;
  };
  created_at: string;
  updated_at: string;
};

// El tipo de respuesta para el endpoint /heritages
type APIHeritageResponse = {
  heritages: APIHeritageItem[];
};

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

  public async importHeritages(): Promise<{
    heritageCount: number;
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

      // 2. Obtener los patrimonios de la API externa
      const heritagesResponse = await fetch(`${apiProd}/heritages`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!heritagesResponse.ok) {
        const errorText = await heritagesResponse.text();
        throw Object.assign(
          new Error(
            `API heritages fetch failed: ${heritagesResponse.statusText}`
          ),
          {
            statusCode: heritagesResponse.status,
            error: "API Error",
            message: `Failed to fetch heritages from API: ${
              heritagesResponse.status
            } ${heritagesResponse.statusText}. ${errorText || ""}`.trim(),
          }
        );
      }

      const rawApiResponse: APIHeritageResponse =
        await heritagesResponse.json();
      const oldHeritages: APIHeritageItem[] = rawApiResponse.heritages;

      // 3. Procesar los patrimonios y prepararlos para la inserción masiva
      const heritagesToCreatePromises = oldHeritages.map(async (heritage) => {
        const badge = await prisma.badge.findFirst({
          where: { code: heritage.currency.code },
        });

        if (!badge) {
          console.warn(
            `Badge with code '${heritage.currency.code}' not found for heritage '${heritage.name}'. Skipping.`
          );
          return null;
        }

        return {
          name: heritage.name,
          comercialAmount: heritage.comercial_amount,
          legalAmount: heritage.legal_amount,
          year: heritage.year,
          badgeId: badge.id,
          userId: userId,
          createdAt: new Date(heritage.created_at),
          updatedAt: new Date(heritage.updated_at),
        } as CreateHeritage;
      });

      const heritagesToCreate = (
        await Promise.all(heritagesToCreatePromises)
      ).filter((h): h is CreateHeritage => h !== null);

      // 4. Insertar los patrimonios en la base de datos local
      const result = await prisma.heritage.createMany({
        data: heritagesToCreate,
        skipDuplicates: true,
      });

      return {
        heritageCount: result.count,
      };
    } catch (error: unknown) {
      console.error("Error importing heritages:", error);
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
          (error as Error)?.message || "Heritage import process failed"
        ),
        {
          statusCode: (error as any)?.statusCode || 500,
          error: (error as any)?.error || "Internal Server Error",
          message:
            (error as Error)?.message ||
            "An unexpected error occurred during heritage import.",
        }
      );
    }
  }
}
