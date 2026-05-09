import { Decimal } from "@prisma/client/runtime/library";
import {
  Heritage,
  CreateHeritage,
  HeritageReport,
  ParamsHeritage,
} from "../domain/heritage";
import { IHeritageRepository } from "../domain/interfaces/heritage.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import {
  CommonParamsPaginate,
  Paginate,
  ErrorMessage,
  handleShowDeleteData,
} from "packages/shared";
import { APIResponse } from "packages/badge/infrastructure/badge.repository";
import { ReportPrismaRepository } from "packages/report/infrastructure/report.repository";
import { ReportUseCase } from "packages/report/application/report.use-case";
import { ReportBalance } from "packages/report/domain/report";

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

const reportRepository = new ReportPrismaRepository();
const reportUseCase = new ReportUseCase(reportRepository);
export class HeritagePrismaRepository implements IHeritageRepository {
  public async addHeritage(
    data: CreateHeritage
  ): Promise<Heritage | ErrorMessage> {
    try {
      const newHeritage = await prisma.heritage.create({
        data,
        include: {
          badge: true,
        },
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
    params: CommonParamsPaginate & ParamsHeritage
  ): Promise<{
    balances: ReportBalance;
    investments: ReportBalance;
    content: Heritage[];
    meta: Paginate;
  }> {
    const { size, page, year, userId } = params;

    const limitDate = new Date(`${year}-12-31T23:59:59.999Z`);
    const yearStart = new Date(`${year}-01-01T00:00:00.000Z`);

    // ⚡ Bolt: Parallelize independent database queries to significantly reduce latency.
    // We concurrently fetch heritage items, aggregate account balances, income, expenses, and max investment dates.
    // We also fetch all badges to avoid multiple sequential lookups later.
    const [
      heritageResult,
      initAccount,
      reportIncome,
      reportExport,
      lastDates,
      allBadges,
    ] = await Promise.all([
      prisma.heritage
        .paginate({
          where: {
            year,
            userId, // Security: Ensure multi-tenancy by filtering by userId
          },
          include: {
            badge: true,
          },
        })
        .withPages({
          limit: size ? Number(size) : 10,
          page: page && page > 0 ? Number(page) : 1,
        }),
      prisma.account.groupBy({
        by: ["badgeId"],
        where: {
          userId,
          createdAt: {
            lte: limitDate,
          },
        },
        _sum: {
          initAmount: true,
        },
        orderBy: {
          badgeId: "asc",
        },
      }),
      prisma.vw_yearlyincome.groupBy({
        by: ["badgeId"],
        where: {
          userId,
          year: {
            lte: year,
          },
        },
        _sum: {
          amount: true,
        },
        orderBy: {
          badgeId: "asc",
        },
      }),
      prisma.vw_yearlyexpensive.groupBy({
        by: ["badgeId"],
        where: {
          userId,
          year: {
            lte: year,
          },
        },
        _sum: {
          amount: true,
        },
        orderBy: {
          badgeId: "asc",
        },
      }),
      prisma.investmentAppreciation.groupBy({
        by: ["investmentId"],
        where: {
          userId,
          dateAppreciation: {
            gte: yearStart,
            lte: limitDate,
          },
        },
        _max: { dateAppreciation: true },
      }),
      prisma.badge.findMany(),
    ]);

    const [content, meta] = heritageResult;

    const cleaned = lastDates.filter((d) => d._max.dateAppreciation !== null);

    const investments =
      cleaned.length > 0
        ? await prisma.investmentAppreciation.findMany({
            where: {
              OR: cleaned.map((d) => ({
                investmentId: d.investmentId,
                dateAppreciation: d._max.dateAppreciation!,
              })),
            },
            include: {
              investment: {
                select: { badgeId: true },
              },
            },
          })
        : [];

    // ⚡ Bolt: Create a lookup map for faster badge data access (O(1) instead of O(N)).
    const badgesMap = new Map(allBadges.map((badge) => [badge.id, badge]));

    // ⚡ Bolt: Map data using the O(1) badge lookup map.
    const incomeBalances = reportIncome.map((item) => {
      const badge = badgesMap.get(item.badgeId);
      return {
        amount: Number(item._sum.amount),
        code: String(badge?.code),
        flag: String(badge?.flag),
        symbol: String(badge?.symbol),
      };
    });

    const expenseBalances = reportExport.map((item) => {
      const badge = badgesMap.get(item.badgeId);
      return {
        amount: Number(item._sum.amount),
        code: String(badge?.code),
        flag: String(badge?.flag),
        symbol: String(badge?.symbol),
      };
    });

    const initAccountBalances = initAccount.map((item) => {
      const badge = badgesMap.get(item.badgeId);
      return {
        amount: Number(item._sum.initAmount),
        code: String(badge?.code),
        flag: String(badge?.flag),
        symbol: String(badge?.symbol),
      };
    });

    const investmentBalances = investments.map((item) => {
      const badge = badgesMap.get(item.investment.badgeId);
      return {
        amount: Number(item.amount),
        code: String(badge?.code),
        flag: String(badge?.flag),
        symbol: String(badge?.symbol),
      };
    });

    // Combine all balances into a single array
    const generalBalances = [
      ...incomeBalances,
      ...expenseBalances,
      ...initAccountBalances,
    ];

    const aggregatedBalancesMap = new Map();
    const investmentMap = new Map();

    for (const balance of generalBalances) {
      const { code, amount, flag, symbol } = balance;

      if (code) {
        const existingBalance = aggregatedBalancesMap.get(code) || {
          code,
          flag,
          symbol,
          amount: 0,
        };

        existingBalance.amount += amount;
        aggregatedBalancesMap.set(code, existingBalance);
      }
    }

    for (const row of investmentBalances) {
      const { code, amount, flag, symbol } = row;

      if (code) {
        const existingBalance = investmentMap.get(code) || {
          code,
          flag,
          symbol,
          amount: 0,
        };

        existingBalance.amount += amount;
        investmentMap.set(code, existingBalance);
      }
    }

    // Resultado final
    const finalInvestments = Array.from(investmentMap.values());

    // 4. Convertir el Map a un arreglo final
    const finalBalances = Array.from(aggregatedBalancesMap.values());

    return {
      balances: finalBalances,
      investments: finalInvestments,
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
        include: {
          badge: true,
        },
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
        include: {
          badge: true,
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

  public async deleteHeritage(id: string): Promise<Heritage | null> {
    const heritage = await prisma.heritage.findUnique({
      where: { id },
    });
    if (!heritage) {
      return null;
    }
    return await prisma.heritage.delete({
      where: { id },
      include: {
        badge: true,
      },
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

  public async yearHeritage(
    params: ParamsHeritage
  ): Promise<HeritageReport[] | null> {
    const { year, userId } = params;
    const yearNum = year ? Number(year) : new Date().getFullYear();
    const limitDate = new Date(`${yearNum}-12-31T23:59:59.999Z`);

    // 1. Fetch data in parallel
    const [accounts, movements, heritages, appreciations, badges] = await Promise.all([
      prisma.account.findMany({
        where: { userId, createdAt: { lte: limitDate } },
        select: { id: true, badgeId: true, initAmount: true }
      }),
      prisma.movement.groupBy({
        by: ['accountId'],
        where: { userId, datePurchase: { lte: limitDate } },
        _sum: { amount: true }
      }),
      prisma.heritage.findMany({
        where: { userId, year: yearNum },
        select: { badgeId: true, comercialAmount: true }
      }),
      prisma.investmentAppreciation.groupBy({
        by: ['investmentId'],
        where: { userId, dateAppreciation: { lte: limitDate } },
        _max: { dateAppreciation: true }
      }),
      prisma.badge.findMany()
    ]);

    const badgesMap = new Map(badges.map(b => [b.id, b]));

    // 2. Calculate Balances (Account Init + Movements)
    const movementMap = new Map(movements.map(m => [m.accountId, m._sum.amount || new Decimal(0)]));
    const totalsByBadge = new Map<string, Decimal>();

    accounts.forEach(acc => {
      const movementSum = movementMap.get(acc.id) || new Decimal(0);
      const total = new Decimal(acc.initAmount.toString()).plus(movementSum);
      const current = totalsByBadge.get(acc.badgeId) || new Decimal(0);
      totalsByBadge.set(acc.badgeId, current.plus(total));
    });

    // 3. Add Commercial Values from Heritages
    heritages.forEach(h => {
      const current = totalsByBadge.get(h.badgeId) || new Decimal(0);
      totalsByBadge.set(h.badgeId, current.plus(new Decimal(h.comercialAmount.toString())));
    });

    // 4. Add Latest Investment Valuations
    const cleanedAppreciations = appreciations.filter(a => a._max.dateAppreciation !== null);
    if (cleanedAppreciations.length > 0) {
      const latestAppreciations = await prisma.investmentAppreciation.findMany({
        where: {
          OR: cleanedAppreciations.map(a => ({
            investmentId: a.investmentId,
            dateAppreciation: a._max.dateAppreciation!
          }))
        },
        include: { investment: { select: { badgeId: true } } }
      });

      latestAppreciations.forEach(la => {
        const current = totalsByBadge.get(la.investment.badgeId) || new Decimal(0);
        totalsByBadge.set(la.investment.badgeId, current.plus(new Decimal(la.amount.toString())));
      });
    }

    // 5. Format result
    const balancesArray = Array.from(totalsByBadge.entries()).map(([badgeId, amount]) => {
      const badge = badgesMap.get(badgeId);
      return {
        code: badge?.code || null,
        flag: badge?.flag || null,
        symbol: badge?.symbol || null,
        amount: amount.toNumber()
      };
    });

    return [{
      year: yearNum,
      userId: userId || '',
      balances: balancesArray
    }];
  }
}
