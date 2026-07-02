import { Prisma } from "@prisma/client";
const ZERO_DECIMAL = new Prisma.Decimal(0); // ⚡ Bolt: Global constant to avoid redundant object allocations
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
    const { userId, ...rest } = data;
    try {
      const newHeritage = await prisma.heritage.create({
        data: {
          ...rest,
          userId,
        },
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

    // ⚡ Bolt: Parallelize all independent database queries, including investment appreciations,
    // into a single Promise.all call. This eliminates sequential roundtrips and reduces total latency.
    const [
      heritageResult,
      initAccount,
      reportIncome,
      reportExport,
      allAppreciations,
      allBadges,
    ] = await Promise.all([
      prisma.heritage
        .paginate({
          where: {
            year,
            userId,
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
      }),
      prisma.investmentAppreciation.findMany({
        where: {
          userId,
          dateAppreciation: {
            gte: yearStart,
            lte: limitDate,
          },
        },
        include: {
          investment: {
            select: { badgeId: true },
          },
        },
        orderBy: { dateAppreciation: "desc" },
      }),
      prisma.badge.findMany(),
    ]);

    const [content, meta] = heritageResult;

    // ⚡ Bolt: Build a lookup map for faster badge data access (O(1)) and initialize result maps.
    const badgesMap = new Map();
    for (const badge of allBadges) {
      badgesMap.set(badge.id, badge);
    }

    const aggregatedBalancesMap = new Map<string, any>();
    const investmentMap = new Map<string, any>();

    /**
     * ⚡ Bolt: Helper to aggregate amounts by badge directly into a target Map,
     * avoiding multiple intermediate array mappings and spreads.
     */
    const aggregateByBadge = (
      data: any[],
      targetMap: Map<string, any>,
      amountField: string = "amount",
      isGrouped: boolean = true
    ) => {
      for (const item of data) {
        const badgeId = isGrouped ? item.badgeId : item.investment.badgeId;
        const badge = badgesMap.get(badgeId);
        if (!badge) continue;

        const amount = Number(isGrouped ? item._sum[amountField] : item.amount);
        const existing = targetMap.get(badge.code);

        if (existing) {
          existing.amount += amount;
        } else {
          targetMap.set(badge.code, {
            code: badge.code,
            flag: String(badge.flag),
            symbol: String(badge.symbol),
            amount,
          });
        }
      }
    };

    // ⚡ Bolt: Aggregate all balances in a single pass over each dataset.
    aggregateByBadge(initAccount, aggregatedBalancesMap, "initAmount");
    aggregateByBadge(reportIncome, aggregatedBalancesMap);
    aggregateByBadge(reportExport, aggregatedBalancesMap);

    // ⚡ Bolt: Identify latest investment valuations for the year in-memory using a single pass (O(N)).
    const investmentProcessed = new Set<string>();
    const latestAppreciations = [];
    for (const app of allAppreciations) {
      if (!investmentProcessed.has(app.investmentId)) {
        investmentProcessed.add(app.investmentId);
        latestAppreciations.push(app);
      }
    }
    aggregateByBadge(latestAppreciations, investmentMap, "amount", false);

    // Final result conversion from Maps to arrays.
    const finalInvestments = Array.from(investmentMap.values());
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
    userId: string,
    data: Partial<CreateHeritage>
  ): Promise<Heritage | ErrorMessage> {
    try {
      const heritage = await prisma.heritage.findFirst({
        where: { id, userId },
      });

      if (!heritage) {
        return {
          statusCode: 404,
          error: "Not Found",
          message: "Heritage not found",
        };
      }

      const { userId: _, ...dataToUpdate } = data;

      const updatedHeritage = await prisma.heritage.update({
        where: {
          id,
        },
        data: dataToUpdate,
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

  public async detailHeritage(
    id: string,
    userId: string
  ): Promise<Heritage | null> {
    try {
      return await prisma.heritage.findFirst({
        where: { id, userId },
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

  public async deleteHeritage(
    id: string,
    userId: string
  ): Promise<Heritage | null> {
    const heritage = await prisma.heritage.findFirst({
      where: { id, userId },
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

  public async importHeritages(userId: string): Promise<{
    heritageCount: number;
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
          message: "API_PROD, API_EMAIL, API_PASSWORD, or userId are not set.",
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
        signal: AbortSignal.timeout(5000), // Security: Prevent hanging process
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
        signal: AbortSignal.timeout(5000), // Security: Prevent hanging process
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

      // ⚡ Bolt: Bulk fetch all badges to eliminate N database queries (N*1) inside the loop.
      const allBadges = await prisma.badge.findMany();

      // ⚡ Bolt: Use a Hash Map for O(1) in-memory lookups instead of sequential database calls.
      const badgesMap = new Map(allBadges.map((b) => [b.code, b]));

      // 3. Procesar los patrimonios y prepararlas para la inserción masiva
      const heritagesToCreate = oldHeritages
        .map((heritage) => {
          const badge = badgesMap.get(heritage.currency.code);

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
        })
        .filter((h): h is CreateHeritage => h !== null);

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

    // 1. Determinar los años a procesar
    let targetYears: number[] = [];
    if (year) {
      targetYears.push(Number(year));
    } else {
      const distinctYears = await prisma.heritage.findMany({
        where: { userId },
        select: { year: true },
        distinct: ["year"],
        orderBy: { year: "desc" },
      });
      targetYears = distinctYears.map((h) => h.year);

      // Si no hay patrimonios registrados, usamos el año actual como fallback
      if (targetYears.length === 0) {
        targetYears.push(new Date().getFullYear());
      }
    }

    // 2. ⚡ Bolt: Hoist independent data fetching outside the loop and parallelize retrieval.
    // Fetching all heritages and appreciations once for the user reduces database roundtrips.
    const [accounts, badges, allHeritages, allAppreciations] = await Promise.all([
      prisma.account.findMany({
        where: { userId },
        select: { id: true, badgeId: true, initAmount: true, createdAt: true },
      }),
      prisma.badge.findMany(),
      prisma.heritage.findMany({
        where: { userId, ...(year && { year: Number(year) }) },
        select: { badgeId: true, comercialAmount: true, year: true },
      }),
      prisma.investmentAppreciation.findMany({
        where: { userId },
        include: { investment: { select: { badgeId: true } } },
        orderBy: { dateAppreciation: "desc" }, // Sorting desc allows O(N) latest-find in-memory
      }),
    ]);

    const badgesMap = new Map(badges.map((b) => [b.id, b]));
    const reports: HeritageReport[] = [];

    // 3. ⚡ Bolt: Parallelize movement aggregations across all target years to eliminate sequential loops.
    const movementsByYear = await Promise.all(
      targetYears.map((yearNum) => {
        const limitDate = new Date(`${yearNum}-12-31T23:59:59.999Z`);
        return prisma.movement.groupBy({
          by: ["accountId"],
          where: { userId, datePurchase: { lte: limitDate } },
          _sum: { amount: true },
        });
      })
    );

    // 4. Calcular el reporte para cada año utilizando datos en memoria
    for (let i = 0; i < targetYears.length; i++) {
      const yearNum = targetYears[i];
      const limitDate = new Date(`${yearNum}-12-31T23:59:59.999Z`);
      const movements = movementsByYear[i];

      // ⚡ Bolt: Build movementMap using a for...of loop to avoid intermediate array allocation from movements.map().
      const movementMap = new Map<string, Prisma.Decimal>();
      for (const m of movements) {
        movementMap.set(m.accountId, (m._sum.amount as unknown as Prisma.Decimal) || ZERO_DECIMAL);
      }
      const totalsByBadge = new Map<string, Prisma.Decimal>();

      // A. Balances de cuentas (Init + Movements)
      accounts.forEach((acc) => {
        if (acc.createdAt <= limitDate) {
          const movementSum = movementMap.get(acc.id) || ZERO_DECIMAL;
          const total = (acc.initAmount as unknown as Prisma.Decimal).plus(
            movementSum
          );
          const current = totalsByBadge.get(acc.badgeId) || ZERO_DECIMAL;
          totalsByBadge.set(acc.badgeId, current.plus(total));
        }
      });

      // B. ⚡ Bolt: Use pre-fetched heritages to avoid database calls in the loop (O(N) in-memory filter).
      allHeritages
        .filter((h) => h.year === yearNum)
        .forEach((h) => {
          const current = totalsByBadge.get(h.badgeId) || ZERO_DECIMAL;
          totalsByBadge.set(
            h.badgeId,
            current.plus(h.comercialAmount as unknown as Prisma.Decimal)
          );
        });

      // C. ⚡ Bolt: Find latest investment valuations for the year in-memory (O(N) using sorted list).
      const investmentProcessed = new Set<string>();
      allAppreciations.forEach((app) => {
        if (
          app.dateAppreciation <= limitDate &&
          !investmentProcessed.has(app.investmentId)
        ) {
          investmentProcessed.add(app.investmentId);
          const current =
            totalsByBadge.get(app.investment.badgeId) || ZERO_DECIMAL;
          totalsByBadge.set(
            app.investment.badgeId,
            current.plus(app.amount as unknown as Prisma.Decimal)
          );
        }
      });

      // Formatear resultados para este año
      const balancesArray = Array.from(totalsByBadge.entries()).map(
        ([badgeId, amount]) => {
          const badge = badgesMap.get(badgeId);
          return {
            code: badge?.code || null,
            flag: badge?.flag || null,
            symbol: badge?.symbol || null,
            amount: amount.toNumber(),
          };
        }
      );

      reports.push({
        year: yearNum,
        userId: userId || "",
        balances: balancesArray,
      });
    }

    return reports;
  }
}
