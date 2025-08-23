import { Decimal } from "@prisma/client/runtime/library";

import {
  Investment,
  CreateInvestment,
  CreateInvestmentAppreciation,
  ExtraInfoInvestment,
} from "../domain/investment";
import { IInvestmentRepository } from "../domain/interfaces/investment.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import {
  CommonParamsPaginate,
  Paginate,
  ErrorMessage,
  handleShowDeleteData,
} from "packages/shared";
import { APIResponse } from "packages/badge/infrastructure/badge.repository"; // Asumiendo APIResponse para el token

type APIInvesmentResponse = {
  investments: APIInvestmentItem[];
};

// Define el tipo para un solo objeto de inversión de la API externa
type APIInvestmentItem = {
  name: string;
  init_amount: number;
  end_amount: number;
  date_investment: string;
  currency: {
    code: string;
  };
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

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

export class InvestmentPrismaRepository implements IInvestmentRepository {
  public async addInvestment(
    data: CreateInvestment
  ): Promise<Investment | ErrorMessage> {
    try {
      const newInvestment = await prisma.investment.create({
        data: {
          name: data.name,
          initAmount: data.initAmount,
          endAmount: data.endAmount,
          dateInvestment: data.dateInvestment,
          badge: {
            connect: {
              id: data.badgeId,
            },
          },
          user: {
            connect: {
              id: data.userId,
            },
          },
        },
        include: {
          movements: {
            select: {
              amount: true,
              addWithdrawal: true,
            },
          },
          badge: {
            select: {
              id: true,
              code: true,
              flag: true,
              symbol: true,
            },
          },
          appreciations: {
            select: {
              amount: true,
            },
            orderBy: {
              dateAppreciation: "desc",
            },
          },
        },
      });
      return this.getMoreDetailInvestment(newInvestment);
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async listInvestment(
    params: CommonParamsPaginate
  ): Promise<{ content: Investment[]; meta: Paginate }> {
    const { deleted, size, page } = params;
    const [content, meta] = await prisma.investment
      .paginate({
        where: {
          OR: handleShowDeleteData(deleted === "1"),
        },
        include: {
          movements: {
            select: {
              amount: true,
              addWithdrawal: true,
            },
          },
          badge: {
            select: {
              id: true,
              code: true,
              flag: true,
              symbol: true,
            },
          },
          appreciations: {
            select: {
              amount: true,
            },
            orderBy: {
              dateAppreciation: "desc",
            },
          },
        },
      })
      .withPages({
        limit: size ? Number(size) : 10,
        page: page && page > 0 ? Number(page) : 1,
      });

    const indicatorsInvestment = content.map((investment) => {
      const movements = investment.movements || [];
      const appreciations = investment.appreciations || [];

      const totalReturns = movements
        .filter((m) => !m.addWithdrawal)
        .reduce(
          (acc, movement) => acc.plus(new Decimal(movement.amount || 0)),
          new Decimal(0)
        )
        .toNumber();

      const initialAmountDecimal = new Decimal(investment.initAmount || 0);
      const movementsWithdrawalSum = movements
        .filter((m) => m.addWithdrawal)
        .reduce(
          (acc, movement) =>
            acc.plus(new Decimal(movement.amount || 0).times(-1)),
          new Decimal(0)
        );

      // totalWithdrawal como número (pero calculado con Decimal.js para precisión)
      const totalWithdrawal = initialAmountDecimal
        .plus(movementsWithdrawalSum)
        .toNumber();

      const lastAppreciation =
        appreciations.length > 0 ? appreciations[0] : null;
      const endAmountDecimal = new Decimal(
        lastAppreciation?.amount ?? investment.initAmount ?? 0
      );
      const endAmount = endAmountDecimal.toNumber();

      // --- Cálculos de Porcentajes con Dos Decimales ---

      // Aquí, convertimos totalWithdrawal a Decimal para los cálculos,
      // si es que 'totalWithdrawal' es un número
      const totalWithdrawalForCalculations = new Decimal(totalWithdrawal);
      const totalReturnsForCalculations = new Decimal(totalReturns);

      let valorization = "0.00%";
      if (totalWithdrawalForCalculations.isZero()) {
        valorization = "0.00%";
      } else {
        const rawValorization = endAmountDecimal
          .minus(totalWithdrawalForCalculations)
          .dividedBy(totalWithdrawalForCalculations)
          .times(100);
        valorization = `${rawValorization.toFixed(2)}%`;
      }

      let totalRate = "0.00%";
      if (totalWithdrawalForCalculations.isZero()) {
        totalRate = "0.00%";
      } else {
        const rawTotalRate = endAmountDecimal
          .plus(totalReturnsForCalculations)
          .minus(totalWithdrawalForCalculations)
          .dividedBy(totalWithdrawalForCalculations)
          .times(100);
        totalRate = `${rawTotalRate.toFixed(2)}%`;
      }

      return {
        ...investment,
        totalReturns,
        totalWithdrawal,
        valorization,
        totalRate,
        endAmount,
      };
    });

    return {
      content: indicatorsInvestment,
      meta,
    };
  }

  public async updateInvestment(
    id: string,
    data: Partial<CreateInvestment>
  ): Promise<Investment | ErrorMessage> {
    try {
      const updatedInvestment = await prisma.investment.update({
        where: {
          id,
          deletedAt: null,
        },
        data,
        include: {
          movements: {
            select: {
              amount: true,
              addWithdrawal: true,
            },
          },
          badge: {
            select: {
              id: true,
              code: true,
              flag: true,
              symbol: true,
            },
          },
          appreciations: {
            select: {
              id: true,
              amount: true,
              dateAppreciation: true,
            },
            orderBy: {
              dateAppreciation: "asc",
            },
          },
        },
      });
      return await this.getMoreDetailInvestment(updatedInvestment);
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async detailInvestment(
    id: string
  ): Promise<(Investment & ExtraInfoInvestment) | null> {
    try {
      const investment = await prisma.investment.findUnique({
        where: { id },
        include: {
          movements: {
            select: {
              amount: true,
              addWithdrawal: true,
              datePurchase: true,
              description: true,
              id: true,
              account: {
                include: {
                  badge: true,
                },
              },
              event: true,
              category: true,
            },
          },
          badge: {
            select: {
              id: true,
              code: true,
              flag: true,
              symbol: true,
            },
          },
          appreciations: {
            select: {
              id: true,
              amount: true,
              dateAppreciation: true,
            },
            orderBy: {
              dateAppreciation: "asc",
            },
          },
        },
      });

      if (!investment) {
        return null;
      }

      return await this.getMoreDetailInvestment(investment);
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async deleteInvestment(id: string): Promise<Investment | null> {
    const investment = await prisma.investment.findUnique({
      where: { id },
      include: {
        movements: {
          select: {
            amount: true,
            addWithdrawal: true,
          },
        },
        badge: {
          select: {
            id: true,
            code: true,
            flag: true,
            symbol: true,
          },
        },
        appreciations: {
          select: {
            amount: true,
          },
          orderBy: {
            dateAppreciation: "desc",
          },
        },
      },
    });
    if (!investment) {
      return null;
    }

    await prisma.investment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return this.getMoreDetailInvestment(investment);
  }

  private async getMoreDetailInvestment(
    investment: Investment & { movements: any[]; appreciations: any[] }
  ): Promise<Investment & ExtraInfoInvestment> {
    const movements = investment.movements || [];
    const appreciations = investment.appreciations || [];

    const totalReturns = movements
      .filter((m) => !m.addWithdrawal)
      .reduce(
        (acc, movement) => acc.plus(new Decimal(movement.amount || 0)),
        new Decimal(0)
      )
      .toNumber();

    const initialAmountDecimal = new Decimal(investment.initAmount || 0);
    const movementsWithdrawalSum = movements
      .filter((m) => m.addWithdrawal)
      .reduce(
        (acc, movement) =>
          acc.plus(new Decimal(movement.amount || 0).times(-1)),
        new Decimal(0)
      );

    // totalWithdrawal como número (pero calculado con Decimal.js para precisión)
    const totalWithdrawal = initialAmountDecimal
      .plus(movementsWithdrawalSum)
      .toNumber();

    const lastAppreciation =
      appreciations.length > 0 ? appreciations[appreciations.length - 1] : null;
    const endAmountDecimal = new Decimal(
      lastAppreciation?.amount ?? investment.initAmount ?? 0
    );
    const endAmount = endAmountDecimal.toNumber();

    // --- Cálculos de Porcentajes con Dos Decimales ---

    // Aquí, convertimos totalWithdrawal a Decimal para los cálculos,
    // si es que 'totalWithdrawal' es un número
    const totalWithdrawalForCalculations = new Decimal(totalWithdrawal);
    const totalReturnsForCalculations = new Decimal(totalReturns);

    let valorization = "0.00%";
    if (totalWithdrawalForCalculations.isZero()) {
      valorization = "0.00%";
    } else {
      const rawValorization = endAmountDecimal
        .minus(totalWithdrawalForCalculations)
        .dividedBy(totalWithdrawalForCalculations)
        .times(100);
      valorization = `${rawValorization.toFixed(2)}%`;
    }

    let totalRate = "0.00%";
    if (totalWithdrawalForCalculations.isZero()) {
      totalRate = "0.00%";
    } else {
      const rawTotalRate = endAmountDecimal
        .plus(totalReturnsForCalculations)
        .minus(totalWithdrawalForCalculations)
        .dividedBy(totalWithdrawalForCalculations)
        .times(100);
      totalRate = `${rawTotalRate.toFixed(2)}%`;
    }

    return {
      ...investment,
      totalReturns,
      totalWithdrawal,
      valorization,
      totalRate,
      endAmount,
    };
  }

  public async importInvestments(): Promise<{
    investmentCount: number;
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
        console.error(
          `API login failed: ${loginResponse.status} ${loginResponse.statusText}`,
          errorText
        );
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

      // 2. Obtener las inversiones de la API externa
      const investmentsResponse = await fetch(`${apiProd}/investments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!investmentsResponse.ok) {
        const errorText = await investmentsResponse.text();
        console.error(
          `API investments fetch failed: ${investmentsResponse.status} ${investmentsResponse.statusText}`,
          errorText
        );
        throw Object.assign(
          new Error(
            `API investments fetch failed: ${investmentsResponse.statusText}`
          ),
          {
            statusCode: investmentsResponse.status,
            error: "API Error",
            message: `Failed to fetch investments from API: ${
              investmentsResponse.status
            } ${investmentsResponse.statusText}. ${errorText || ""}`.trim(),
          }
        );
      }

      const rawApiResponse: APIInvesmentResponse =
        await investmentsResponse.json();
      const oldInvestments: APIInvestmentItem[] = rawApiResponse.investments;

      // 3. Procesar las inversiones y prepararlas para la inserción masiva
      const investmentsToCreatePromises = oldInvestments.map(
        async (investment) => {
          const badge = await prisma.badge.findFirst({
            where: { code: investment.currency.code },
          });

          if (!badge) {
            console.warn(
              `Badge with code '${investment.currency.code}' not found for investment '${investment.name}'. Skipping this investment.`
            );
            return null; // Omitir esta inversión si no se encuentra la insignia
          }

          return {
            name: investment.name,
            initAmount: investment.init_amount,
            endAmount: investment.end_amount,
            dateInvestment: new Date(investment.date_investment),
            badgeId: badge.id,
            userId: userId,
            createdAt: new Date(investment.created_at),
            updatedAt: new Date(investment.updated_at),
            deletedAt: investment.deleted_at
              ? new Date(investment.deleted_at)
              : null,
          } as CreateInvestment;
        }
      );

      const investmentsToCreate = (
        await Promise.all(investmentsToCreatePromises)
      ).filter((inv): inv is CreateInvestment => inv !== null);

      // 4. Insertar las inversiones en la base de datos local
      const result = await prisma.investment.createMany({
        data: investmentsToCreate,
        skipDuplicates: true, // Para evitar errores si se intenta importar la misma inversión varias veces
      });

      return {
        investmentCount: result.count,
      };
    } catch (error: unknown) {
      console.error("Error importing investments:", error);
      // Re-lanzar si ya es un error estructurado por este método o un error conocido de Prisma
      if (
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        "error" in error
      ) {
        throw error;
      }

      // Para otros errores inesperados
      throw Object.assign(
        new Error(
          (error as Error)?.message || "Investment import process failed"
        ),
        {
          statusCode: (error as any)?.statusCode || 500,
          error: (error as any)?.error || "Internal Server Error",
          message:
            (error as Error)?.message ||
            "An unexpected error occurred during investment import.",
        }
      );
    }
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

      // 3. Procesar las apreciaciones y prepararlas para la inserción masiva
      const appreciationsToCreatePromises = oldAppreciations.map(
        async (appreciation) => {
          const investment = await prisma.investment.findFirst({
            where: { name: appreciation.investment.name },
          });

          if (!investment) {
            console.warn(
              `Investment '${appreciation.investment.name}' not found for appreciation. Skipping.`
            );
            return null;
          }

          return {
            amount: appreciation.amount,
            dateAppreciation: new Date(appreciation.date_appreciation),
            investmentId: investment.id,
            userId: userId,
            createdAt: new Date(appreciation.created_at),
            updatedAt: new Date(appreciation.updated_at),
          } as CreateInvestmentAppreciation;
        }
      );

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
