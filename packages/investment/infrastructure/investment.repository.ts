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
    const { deleted, size, page, userId } = params;

    // ⚡ Bolt: Initial fetch of paginated investments without movements/appreciations to avoid N+1 issues.
    // Offloading calculations to the database significantly reduces memory pressure and latency.
    const [content, meta] = await prisma.investment
      .paginate({
        where: {
          userId,
          OR: handleShowDeleteData(deleted === "1"),
        },
        include: {
          badge: {
            select: {
              id: true,
              code: true,
              flag: true,
              symbol: true,
            },
          },
        },
      })
      .withPages({
        limit: size ? Number(size) : 10,
        page: page && page > 0 ? Number(page) : 1,
      });

    if (content.length === 0) {
      return { content: [], meta };
    }

    const investmentIds = content.map((inv) => inv.id);

    // ⚡ Bolt: Fetch aggregated data in parallel to significantly reduce total latency.
    const [movementSums, maxAppreciationDates] = await Promise.all([
      // Aggregates sums for withdrawals and returns grouped by investment and type
      prisma.movement.groupBy({
        by: ["investmentId", "addWithdrawal"],
        where: { investmentId: { in: investmentIds } },
        _sum: { amount: true },
      }),
      // Finds the latest appreciation date for each investment
      prisma.investmentAppreciation.groupBy({
        by: ["investmentId"],
        where: { investmentId: { in: investmentIds } },
        _max: { dateAppreciation: true },
      }),
    ]);

    // Fetch the actual amounts for the latest appreciation dates
    const latestAppreciations =
      maxAppreciationDates.length > 0
        ? await prisma.investmentAppreciation.findMany({
            where: {
              OR: maxAppreciationDates.map((d) => ({
                investmentId: d.investmentId,
                dateAppreciation: d._max.dateAppreciation!,
              })),
            },
            select: { investmentId: true, amount: true },
          })
        : [];

    // ⚡ Bolt: Use Maps for O(1) in-memory lookups instead of nested loops.
    const returnsMap = new Map<string, Decimal>();
    const withdrawalsMap = new Map<string, Decimal>();
    for (const sum of movementSums) {
      if (sum.investmentId) {
        const targetMap = sum.addWithdrawal ? withdrawalsMap : returnsMap;
        targetMap.set(sum.investmentId, sum._sum.amount || new Decimal(0));
      }
    }

    const appreciationMap = new Map(
      latestAppreciations.map((a) => [a.investmentId, a.amount])
    );

    const indicatorsInvestment = content.map((investment) => {
      const totalReturnsDecimal = returnsMap.get(investment.id) || new Decimal(0);

      // ⚡ Bolt: Handle potential null/undefined for initAmount safely before converting to String/Decimal.
      const initialAmountDecimal = new Decimal((investment.initAmount ?? 0).toString());
      const movementsWithdrawalSum = withdrawalsMap.get(investment.id) || new Decimal(0);

      // totalWithdrawal calculated with Decimal precision.
      // Withdrawals decrease the total net invested capital.
      const totalWithdrawalDecimal = initialAmountDecimal.minus(movementsWithdrawalSum);

      const lastAppreciationAmount = appreciationMap.get(investment.id);
      const endAmountDecimal = new Decimal(
        (lastAppreciationAmount ?? investment.initAmount ?? 0).toString()
      );

      let valorization = "0.00%";
      if (!totalWithdrawalDecimal.isZero()) {
        const rawValorization = endAmountDecimal
          .minus(totalWithdrawalDecimal)
          .dividedBy(totalWithdrawalDecimal)
          .times(100);
        valorization = `${rawValorization.toFixed(2)}%`;
      }

      let totalRate = "0.00%";
      if (!totalWithdrawalDecimal.isZero()) {
        const rawTotalRate = endAmountDecimal
          .plus(totalReturnsDecimal)
          .minus(totalWithdrawalDecimal)
          .dividedBy(totalWithdrawalDecimal)
          .times(100);
        totalRate = `${rawTotalRate.toFixed(2)}%`;
      }

      return {
        ...investment,
        totalReturns: totalReturnsDecimal.toNumber(),
        totalWithdrawal: totalWithdrawalDecimal.toNumber(),
        valorization,
        totalRate,
        endAmount: endAmountDecimal.toNumber(),
      };
    });

    return {
      content: indicatorsInvestment as Investment[],
      meta,
    };
  }

  public async updateInvestment(
    id: string,
    data: Partial<CreateInvestment>,
    userId: string
  ): Promise<Investment | ErrorMessage> {
    try {
      const investment = await prisma.investment.findFirst({
        where: { id, userId, deletedAt: null },
      });

      if (!investment) {
        throw Object.assign(new Error("Investment not found"), {
          statusCode: 404,
          error: "Not Found",
          message: "Investment not found or you don't have permission",
        });
      }

      const updatedInvestment = await prisma.investment.update({
        where: {
          id,
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
    id: string,
    userId: string
  ): Promise<(Investment & ExtraInfoInvestment) | null> {
    try {
      const investment = await prisma.investment.findFirst({
        where: { id, userId },
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

  public async deleteInvestment(
    id: string,
    userId: string
  ): Promise<Investment | null> {
    const investment = await prisma.investment.findFirst({
      where: { id, userId },
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

  public async importInvestments(userId: string): Promise<{
    investmentCount: number;
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

      // ⚡ Bolt: Bulk fetch all badges to eliminate N database queries (N*1) inside the loop.
      const allBadges = await prisma.badge.findMany();

      // ⚡ Bolt: Use a Hash Map for O(1) in-memory lookups instead of sequential database calls.
      const badgesMap = new Map(allBadges.map((b) => [b.code, b]));

      // 3. Procesar las inversiones y prepararlas para la inserción masiva
      const investmentsToCreate = oldInvestments
        .map((investment) => {
          const badge = badgesMap.get(investment.currency.code);

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
        })
        .filter((inv): inv is CreateInvestment => inv !== null);

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

}
