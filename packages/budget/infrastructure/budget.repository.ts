import {
  Budget,
  BudgetByYear,
  BudgetCompare,
  BudgetSummaryByBadge,
  CreateBudget,
  ParamsBudget,
} from "../domain/budget";
import { IBudgetRepository } from "../domain/interfaces/budget.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import { CommonParamsPaginate, Paginate, ErrorMessage } from "packages/shared";
import { APIResponse } from "packages/badge/infrastructure/badge.repository";
import { Decimal } from "@prisma/client/runtime/library";

// Define el tipo para un solo objeto de presupuesto de la API externa
type APIBudgetItem = {
  amount: number;
  year: number;
  period: {
    name: string;
  };
  currency: {
    code: string;
  };
  category: {
    name: string;
  };
  created_at: string;
  updated_at: string;
};

// El tipo de respuesta para el endpoint /budgets (siempre un array)
type APIBudgetResponse = APIBudgetItem[];

export class BudgetPrismaRepository implements IBudgetRepository {
  public async addBudget(data: CreateBudget): Promise<Budget | ErrorMessage> {
    try {
      const { periodId, badgeId, categoryId, userId, ...restData } = data;
      const newBudget = await prisma.budget.create({
        data: {
          ...restData,
          period: { connect: { id: periodId } },
          badge: { connect: { id: badgeId } },
          category: { connect: { id: categoryId } },
          user: { connect: { id: userId } },
        },
        include: {
          period: true,
          badge: true,
          category: true,
        },
      });
      return newBudget;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async listBudget(params: ParamsBudget): Promise<BudgetCompare[]> {
    const { year, userId, badgeId: paramBadgeId } = params;

    // Use current year if not provided to avoid "Invalid Date"
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(`${targetYear}-01-01`);
    const endDate = new Date(`${targetYear}-12-31`);

    // ⚡ Bolt: Parallelize independent data fetching to reduce total latency.
    // We fetch budgets, aggregated movement stats, and accounts concurrently.
    const [budgets, movementStats, accounts] = await Promise.all([
      prisma.budget.findMany({
        where: {
          ...(year && { year: Number(year) }),
          ...(userId && { userId }),
          ...(paramBadgeId && { badgeId: paramBadgeId }),
        },
        include: {
          badge: true,
          period: true,
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      // ⚡ Bolt: Use database aggregation (groupBy) to sum movement amounts.
      // This drastically reduces data transfer by not fetching every single movement record.
      prisma.movement.groupBy({
        by: ["categoryId", "accountId"],
        where: {
          userId,
          datePurchase: {
            gte: startDate,
            lte: endDate,
          },
          ...(paramBadgeId && {
            account: {
              badgeId: paramBadgeId,
            },
          }),
        },
        _sum: {
          amount: true,
        },
      }),
      // Fetch user accounts to map accountId to badgeId
      prisma.account.findMany({
        where: { userId },
        select: { id: true, badgeId: true },
      }),
    ]);

    // Create a fast lookup map for account -> badge mapping
    const accountBadgeMap = new Map(accounts.map((a) => [a.id, a.badgeId]));

    // ⚡ Bolt: Aggregate stats by category and badge using a Map for O(N) complexity.
    const executedMap = new Map<string, Decimal>();
    for (const stat of movementStats) {
      const bId = accountBadgeMap.get(stat.accountId);
      if (!bId) continue;

      const key = `${stat.categoryId}-${bId}`;
      const sum = stat._sum.amount || new Decimal(0);

      executedMap.set(key, (executedMap.get(key) || new Decimal(0)).add(sum));
    }

    // ⚡ Bolt: Map budgets to executed amounts using O(1) Map lookups instead of O(N*M) .find().
    const compared = budgets.map((b) => {
      const key = `${b.categoryId}-${b.badgeId}`;
      const executed = executedMap.get(key) || new Decimal(0);

      const amountDecimal = new Decimal(b.amount as any);
      const planned =
        b.period.name === "Monthly" ? amountDecimal.mul(12) : amountDecimal;
      const difference = planned.sub(executed.abs());

      return {
        id: b.id,
        year: b.year,
        badge: b.badge,
        category: b.category,
        planned,
        executed,
        difference,
      };
    });

    return compared;
  }

  public async updateBudget(
    id: string,
    data: Partial<CreateBudget>
  ): Promise<Budget | ErrorMessage> {
    try {
      const { periodId, badgeId, categoryId, userId, ...restData } = data;
      const updatedBudget = await prisma.budget.update({
        where: {
          id,
        },
        data: {
          ...restData,
          period: { connect: { id: periodId } },
          badge: { connect: { id: badgeId } },
          category: { connect: { id: categoryId } },
          user: { connect: { id: userId } },
        },
        include: {
          period: true,
          badge: true,
          category: true,
        },
      });
      return updatedBudget;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async detailBudget(id: string): Promise<Budget | null> {
    try {
      return await prisma.budget.findUnique({
        where: { id },
        include: {
          period: true,
          badge: true,
          category: true,
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

  public async deleteBudget(id: string): Promise<Budget | null> {
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        period: true,
        badge: true,
        category: true,
      },
    });
    if (!budget) {
      return null;
    }
    await prisma.budget.delete({
      where: { id },
    });

    return budget;
  }

  public async importBudgets(): Promise<{
    budgetCount: number;
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

      // 2. Obtener los presupuestos de la API externa
      const budgetsResponse = await fetch(`${apiProd}/budgets`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!budgetsResponse.ok) {
        const errorText = await budgetsResponse.text();
        throw Object.assign(
          new Error(`API budgets fetch failed: ${budgetsResponse.statusText}`),
          {
            statusCode: budgetsResponse.status,
            error: "API Error",
            message: `Failed to fetch budgets from API: ${
              budgetsResponse.status
            } ${budgetsResponse.statusText}. ${errorText || ""}`.trim(),
          }
        );
      }

      const oldBudgets: APIBudgetResponse = await budgetsResponse.json();

      // 3. Procesar los presupuestos y prepararlos para la inserción masiva
      const budgetsToCreatePromises = oldBudgets.map(async (budget) => {
        const period = await prisma.period.findFirst({
          where: { name: budget.period.name },
        });
        const badge = await prisma.badge.findFirst({
          where: { code: budget.currency.code },
        });
        const category = await prisma.category.findFirst({
          where: { name: budget.category.name },
        });

        if (!period || !badge || !category) {
          console.warn(
            `Skipping budget for year ${budget.year} due to missing relation (Period, Badge, or Category).`
          );
          return null;
        }

        return {
          amount: budget.amount,
          year: budget.year,
          periodId: period.id,
          badgeId: badge.id,
          categoryId: category.id,
          userId: userId,
          createdAt: new Date(budget.created_at),
          updatedAt: new Date(budget.updated_at),
        } as CreateBudget;
      });

      const budgetsToCreate = (
        await Promise.all(budgetsToCreatePromises)
      ).filter((b): b is CreateBudget => b !== null);

      // 4. Insertar los presupuestos en la base de datos local
      const result = await prisma.budget.createMany({
        data: budgetsToCreate,
        skipDuplicates: true,
      });

      return {
        budgetCount: result.count,
      };
    } catch (error: unknown) {
      console.error("Error importing budgets:", error);
      // Re-lanzar el error para que sea manejado por el controlador
      if (
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        "error" in error
      ) {
        throw error;
      }
      throw Object.assign(
        new Error((error as Error)?.message || "Budget import process failed"),
        {
          statusCode: (error as any)?.statusCode || 500,
          error: (error as any)?.error || "Internal Server Error",
          message:
            (error as Error)?.message ||
            "An unexpected error occurred during budget import.",
        }
      );
    }
  }

  public async listBudgetByYear(
    params: CommonParamsPaginate & ParamsBudget
  ): Promise<BudgetSummaryByBadge[]> {
    const { userId } = params;
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
      },
      select: {
        year: true,
        amount: true,
        period: true,
        badge: true,
        category: true,
      },
      orderBy: {
        year: "desc",
      },
    });

    // ⚡ Bolt: Use a nested Map for O(N) aggregation complexity, avoiding O(N*M) lookups with .find().
    const summaryMap = new Map<
      string,
      { badge: string; yearsMap: Map<number, BudgetByYear> }
    >();

    for (const budget of budgets) {
      const { year, amount, badge, period } = budget;
      const badgeCode = badge.code;
      const amountDecimal = new Decimal(amount as any);
      const yearlyAmount =
        period.name === "Monthly" ? amountDecimal.mul(12) : amountDecimal;

      if (!summaryMap.has(badgeCode)) {
        summaryMap.set(badgeCode, {
          badge: badgeCode,
          yearsMap: new Map<number, BudgetByYear>(),
        });
      }

      const badgeGroup = summaryMap.get(badgeCode)!;
      let yearGroup = badgeGroup.yearsMap.get(year);

      if (!yearGroup) {
        yearGroup = {
          year,
          incomes: new Decimal(0),
          expenses: new Decimal(0),
          utility: new Decimal(0),
          badge,
        };
        badgeGroup.yearsMap.set(year, yearGroup);
      }

      // Sumar según signo
      if (yearlyAmount.gte(0)) {
        yearGroup.incomes = yearGroup.incomes.add(yearlyAmount);
      } else {
        yearGroup.expenses = yearGroup.expenses.add(yearlyAmount);
      }

      // Calcular utilidad
      yearGroup.utility = yearGroup.incomes.add(yearGroup.expenses);
    }

    // Convert the Map to the desired response format and sort years
    const result: BudgetSummaryByBadge[] = Array.from(summaryMap.values()).map(
      (b) => ({
        badge: b.badge,
        years: Array.from(b.yearsMap.values()).sort((a, b) => b.year - a.year),
      })
    );

    return result;
  }
}
