import {
  Budget,
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
      const newBudget = await prisma.budget.create({
        data,
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
    const { year, userId, badgeId } = params;

    const budgets = await prisma.budget.findMany({
      where: {
        ...(year && { year: Number(year) }),
        ...(userId && { userId }),
        ...(badgeId && { badgeId }),
      },
      select: {
        id: true,
        amount: true,
        year: true,
        userId: true,
        badge: true,
        period: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        badgeId: true,
        periodId: true,
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const movements = await prisma.movement.findMany({
      where: {
        datePurchase: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
        categoryId: { in: budgets.map((b) => b.categoryId) },
        account: {
          badgeId: { in: budgets.map((b) => b.badgeId) },
        },
      },
      select: {
        amount: true,
        categoryId: true,
        account: true,
        datePurchase: true,
      },
    });

    const summary = movements.reduce((acc, m) => {
      const categoryId = m.categoryId;
      const badgeId = m.account.badgeId;

      const key = `${categoryId}-${badgeId}`;

      if (!acc[key]) {
        acc[key] = {
          categoryId,
          badgeId,
          totalAmount: new Decimal(0),
        };
      }

      acc[key].totalAmount = acc[key].totalAmount.add(m.amount);

      return acc;
    }, {} as Record<string, { categoryId: string; badgeId: string; totalAmount: Decimal }>);

    // Convertir a array ordenada
    const result = Object.values(summary);

    const adjustedBudgets = budgets.map((b) => {
      const yearlyAmount =
        b.period.name === "Monthly" ? b.amount.mul(12) : b.amount;

      return {
        ...b,
        yearlyAmount,
      };
    });

    // 🔹 Ahora cotejamos con los movimientos (summary)
    const compared = adjustedBudgets.map((b) => {
      // Buscar la suma de movimientos que coincida con categoryId + badgeId
      const match = result.find(
        (m) => m.categoryId === b.categoryId && m.badgeId === b.badgeId
      );

      const executed = match ? match.totalAmount : new Decimal(0);
      const planned = b.yearlyAmount;
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
      const updatedBudget = await prisma.budget.update({
        where: {
          id,
        },
        data,
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
    });
    if (!budget) {
      return null;
    }
    return await prisma.budget.delete({
      where: { id },
    });
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

    const summary = budgets.reduce((acc, budget) => {
      const { year, amount, badge } = budget;
      const badgeCode = badge.code;

      // Buscar o crear el grupo de la badge
      if (!acc[badgeCode]) {
        acc[badgeCode] = {
          badge: badgeCode,
          years: [],
        };
      }

      // Buscar el año dentro de esa badge
      let yearGroup = acc[badgeCode].years.find((y) => y.year === year);
      if (!yearGroup) {
        yearGroup = { year, incomes: 0, expenses: 0, utility: 0, badge };
        acc[badgeCode].years.push(yearGroup);
      }

      // Convertir amount a número si es Decimal
      const numericAmount = Number(amount);

      // Sumar según signo
      if (numericAmount >= 0) {
        yearGroup.incomes += numericAmount;
      } else {
        yearGroup.expenses += numericAmount;
      }

      // Calcular utilidad
      yearGroup.utility = yearGroup.incomes + yearGroup.expenses;

      return acc;
    }, {} as Record<string, BudgetSummaryByBadge>);

    // Convertir el objeto a array y ordenar
    const result = Object.values(summary).map((b) => ({
      ...b,
      years: b.years.sort((a, b) => b.year - a.year),
    }));

    return result;
  }
}
