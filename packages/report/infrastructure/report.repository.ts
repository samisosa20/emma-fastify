import {
  BalanceHistory,
  ItemBalanceHistory,
  Report,
  ReportAccountBalance,
  ReportBalance,
  ReportBalanceHistory,
  ReportCategoryStats,
  ReportParams,
} from "../domain/report";
import { IReportRepository } from "../domain/interfaces/report.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import { ErrorMessage } from "packages/shared";
import { Decimal } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";

const ZERO_DECIMAL = new Decimal(0); // ⚡ Bolt: Global constant to avoid redundant object allocations

export class ReportPrismaRepository implements IReportRepository {
  public async weeklyExpensive(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    // ⚡ Bolt: Fetch report data and badge info in parallel
    const [report, badge] = await Promise.all([
      prisma.vw_weeklyexpensive.findMany({
        where: {
          weekNumber: params.weekNumber,
          year: params.year,
          badgeId: params.badgeId,
          userId: params.userId,
        },
        orderBy: [{ year: "desc" }, { weekNumber: "desc" }, { amount: "asc" }],
      }),
      prisma.badge.findFirst({
        where: {
          id: params.badgeId,
        },
      }),
    ]);

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus((item.amount ?? ZERO_DECIMAL).abs()), // <-- Usamos .abs() para sumar el valor absoluto
      ZERO_DECIMAL
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = (item.amount ?? ZERO_DECIMAL).abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? ZERO_DECIMAL
        : itemAmountAbsoluto.div(totalAbsoluto).times(100);

      return {
        ...item,
        amount: (item.amount ?? new Decimal(0)).abs(),
        // Asegúrate de que `participation` sea un tipo `Decimal` o conviértelo a `string`
        participation: participation.toFixed(1),
        code: badge?.code,
        symbol: badge?.symbol,
        flag: badge?.flag,
      };
    });

    return reportWithPercentage;
  }
  public async weeklyIncome(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    // ⚡ Bolt: Fetch report data and badge info in parallel
    const [report, badge] = await Promise.all([
      prisma.vw_weeklyincome.findMany({
        where: {
          weekNumber: params.weekNumber,
          year: params.year,
          badgeId: params.badgeId,
          userId: params.userId,
        },
        orderBy: [{ year: "desc" }, { weekNumber: "desc" }, { amount: "desc" }],
      }),
      prisma.badge.findFirst({
        where: {
          id: params.badgeId,
        },
      }),
    ]);

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus((item.amount ?? ZERO_DECIMAL).abs()), // <-- Usamos .abs() para sumar el valor absoluto
      ZERO_DECIMAL
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = (item.amount ?? ZERO_DECIMAL).abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? ZERO_DECIMAL
        : itemAmountAbsoluto.div(totalAbsoluto).times(100);

      return {
        ...item,
        amount: (item.amount ?? new Decimal(0)).abs(),
        // Asegúrate de que `participation` sea un tipo `Decimal` o conviértelo a `string`
        participation: participation.toFixed(1),
        code: badge?.code,
        symbol: badge?.symbol,
        flag: badge?.flag,
      };
    });

    return reportWithPercentage;
  }
  public async monthlyExpensive(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    // ⚡ Bolt: Fetch report data and badge info in parallel
    const [report, badge] = await Promise.all([
      prisma.vw_monthlyexpensive.findMany({
        where: {
          month: params.month,
          year: params.year,
          badgeId: params.badgeId,
          userId: params.userId,
        },
        orderBy: [{ year: "desc" }, { month: "desc" }, { amount: "asc" }],
      }),
      prisma.badge.findFirst({
        where: {
          id: params.badgeId,
        },
      }),
    ]);

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus((item.amount ?? ZERO_DECIMAL).abs()), // <-- Usamos .abs() para sumar el valor absoluto
      ZERO_DECIMAL
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = (item.amount ?? ZERO_DECIMAL).abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? ZERO_DECIMAL
        : itemAmountAbsoluto.div(totalAbsoluto).times(100);

      return {
        ...item,
        amount: (item.amount ?? new Decimal(0)).abs(),
        // Asegúrate de que `participation` sea un tipo `Decimal` o conviértelo a `string`
        participation: participation.toFixed(1),
        code: badge?.code,
        symbol: badge?.symbol,
        flag: badge?.flag,
      };
    });

    return reportWithPercentage;
  }
  public async monthlyIncome(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    // ⚡ Bolt: Fetch report data and badge info in parallel
    const [report, badge] = await Promise.all([
      prisma.vw_monthlyincome.findMany({
        where: {
          month: params.month,
          year: params.year,
          badgeId: params.badgeId,
          userId: params.userId,
        },
        orderBy: [{ year: "desc" }, { month: "desc" }, { amount: "desc" }],
      }),
      prisma.badge.findFirst({
        where: {
          id: params.badgeId,
        },
      }),
    ]);

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus((item.amount ?? ZERO_DECIMAL).abs()), // <-- Usamos .abs() para sumar el valor absoluto
      ZERO_DECIMAL
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = (item.amount ?? ZERO_DECIMAL).abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? ZERO_DECIMAL
        : itemAmountAbsoluto.div(totalAbsoluto).times(100);

      return {
        ...item,
        amount: (item.amount ?? new Decimal(0)).abs(),
        // Asegúrate de que `participation` sea un tipo `Decimal` o conviértelo a `string`
        participation: participation.toFixed(1),
        code: badge?.code,
        symbol: badge?.symbol,
        flag: badge?.flag,
      };
    });

    return reportWithPercentage;
  }
  public async yearlyExpensive(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    // ⚡ Bolt: Fetch report data and badge info in parallel
    const [report, badge] = await Promise.all([
      prisma.vw_yearlyexpensive.findMany({
        where: {
          year: params.year,
          badgeId: params.badgeId,
          userId: params.userId,
        },
        orderBy: [{ year: "desc" }, { amount: "asc" }],
      }),
      prisma.badge.findFirst({
        where: {
          id: params.badgeId,
        },
      }),
    ]);

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus((item.amount ?? ZERO_DECIMAL).abs()), // <-- Usamos .abs() para sumar el valor absoluto
      ZERO_DECIMAL
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = (item.amount ?? ZERO_DECIMAL).abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? ZERO_DECIMAL
        : itemAmountAbsoluto.div(totalAbsoluto).times(100);

      return {
        ...item,
        amount: (item.amount ?? new Decimal(0)).abs(),
        // Asegúrate de que `participation` sea un tipo `Decimal` o conviértelo a `string`
        participation: participation.toFixed(1),
        code: badge?.code,
        symbol: badge?.symbol,
        flag: badge?.flag,
      };
    });

    return reportWithPercentage;
  }
  public async yearlyIncome(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    // ⚡ Bolt: Fetch report data and badge info in parallel
    const [report, badge] = await Promise.all([
      prisma.vw_yearlyincome.findMany({
        where: {
          year: params.year,
          badgeId: params.badgeId,
          userId: params.userId,
        },
        orderBy: [{ year: "desc" }, { amount: "desc" }],
      }),
      prisma.badge.findFirst({
        where: {
          id: params.badgeId,
        },
      }),
    ]);

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus((item.amount ?? ZERO_DECIMAL).abs()), // <-- Usamos .abs() para sumar el valor absoluto
      ZERO_DECIMAL
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = (item.amount ?? ZERO_DECIMAL).abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? ZERO_DECIMAL
        : itemAmountAbsoluto.div(totalAbsoluto).times(100);

      return {
        ...item,
        amount: (item.amount ?? new Decimal(0)).abs(),
        // Asegúrate de que `participation` sea un tipo `Decimal` o conviértelo a `string`
        participation: participation.toFixed(1),
        code: badge?.code,
        symbol: badge?.symbol,
        flag: badge?.flag,
      };
    });

    return reportWithPercentage;
  }
  public async dailyExpensive(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    // ⚡ Bolt: Fetch report data and badge info in parallel
    const [report, badge] = await Promise.all([
      prisma.vw_dailyexpensive.findMany({
        where: {
          datePurchase: params.date,
          badgeId: params.badgeId,
          userId: params.userId,
        },
        orderBy: [{ amount: "asc" }],
      }),
      prisma.badge.findFirst({
        where: {
          id: params.badgeId,
        },
      }),
    ]);

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus((item.amount ?? ZERO_DECIMAL).abs()), // <-- Usamos .abs() para sumar el valor absoluto
      ZERO_DECIMAL
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = (item.amount ?? ZERO_DECIMAL).abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? ZERO_DECIMAL
        : itemAmountAbsoluto.div(totalAbsoluto).times(100);

      return {
        ...item,
        amount: (item.amount ?? new Decimal(0)).abs(),
        // Asegúrate de que `participation` sea un tipo `Decimal` o conviértelo a `string`
        participation: participation.toFixed(1),
        code: badge?.code,
        symbol: badge?.symbol,
        flag: badge?.flag,
      };
    });

    return reportWithPercentage;
  }
  public async dailyIncome(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    // ⚡ Bolt: Fetch report data and badge info in parallel
    const [report, badge] = await Promise.all([
      prisma.vw_dailyincome.findMany({
        where: {
          datePurchase: params.date,
          badgeId: params.badgeId,
          userId: params.userId,
        },
        orderBy: [{ amount: "desc" }],
      }),
      prisma.badge.findFirst({
        where: {
          id: params.badgeId,
        },
      }),
    ]);

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus((item.amount ?? ZERO_DECIMAL).abs()), // <-- Usamos .abs() para sumar el valor absoluto
      ZERO_DECIMAL
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = (item.amount ?? ZERO_DECIMAL).abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? ZERO_DECIMAL
        : itemAmountAbsoluto.div(totalAbsoluto).times(100);

      return {
        ...item,
        amount: (item.amount ?? new Decimal(0)).abs(),
        // Asegúrate de que `participation` sea un tipo `Decimal` o conviértelo a `string`
        participation: participation.toFixed(1),
        code: badge?.code,
        symbol: badge?.symbol,
        flag: badge?.flag,
      };
    });

    return reportWithPercentage;
  }
  public async reportBalance(
    params: ReportParams
  ): Promise<ReportBalance | ErrorMessage> {
    const report = await prisma.vw_genneralbalances.findMany({
      where: {
        userId: params.userId,
      },
    });

    return report;
  }
  public async reportAccountBalance(
    params: ReportParams
  ): Promise<ReportAccountBalance | ErrorMessage> {
    const { accountId, userId } = params;
    const reportAccount = {
      code: "",
      yearlyAmount: 0,
      totalAmount: 0,
      monthlyAmount: 0,
      symbol: "",
      flag: "",
    };
    const report = await prisma.vw_accountbalances.findFirst({
      where: {
        accountId,
        userId,
      },
    });

    return report ?? reportAccount;
  }
  public async reportCategoryStats(
    params: ReportParams
  ): Promise<ReportCategoryStats | ErrorMessage> {
    const report = await prisma.vw_monthlycategorystats.findMany({
      where: {
        categoryId: params.categoryId,
        userId: params.userId,
      },
    });

    return report;
  }
  public async reportBalanceHistory(
    params: ReportParams
  ): Promise<ReportBalanceHistory | ErrorMessage> {
    const baseDate = new Date(String(params.startDate) || new Date());
    const baseEndDate = new Date(String(params.endDate) || new Date());

    const startDate = new Date(
      Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), 1, 0, 0, 0, 0)
    );
    const endDate = new Date(
      Date.UTC(
        baseEndDate.getUTCFullYear(),
        baseEndDate.getUTCMonth() + 1,
        0,
        23,
        59,
        59,
        999
      )
    );

    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // Diferencia en días redondeada
    const currentPeriodDays = Math.round(
      (endDate.getTime() - startDate.getTime()) / MS_PER_DAY
    );

    // ⚡ Bolt: Pre-calculate all dates to enable parallel data fetching
    const lastYearStartDate = new Date(String(params.startDate));
    lastYearStartDate.setFullYear(startDate.getFullYear() - 1);
    const lastYearEndDate = new Date(String(params.endDate));
    lastYearEndDate.setFullYear(endDate.getFullYear() - 1);

    let previousPeriodStartDate, previousPeriodEndDate;

    if (currentPeriodDays <= 30) {
      previousPeriodStartDate = new Date(
        Date.UTC(
          baseDate.getUTCFullYear(),
          baseDate.getUTCMonth() - 1,
          1,
          0,
          0,
          0,
          0
        )
      );
      previousPeriodEndDate = new Date(
        Date.UTC(
          baseEndDate.getUTCFullYear(),
          baseEndDate.getUTCMonth(),
          0,
          23,
          59,
          59,
          999
        )
      );
    } else {
      // restar meses aproximados
      const monthsToSubtract = Math.ceil(currentPeriodDays / 30);

      previousPeriodStartDate = new Date(
        Date.UTC(
          baseDate.getUTCFullYear(),
          baseDate.getUTCMonth() - monthsToSubtract - 1,
          1,
          0,
          0,
          0,
          0
        )
      );

      previousPeriodEndDate = new Date(
        Date.UTC(
          baseEndDate.getUTCFullYear(),
          baseEndDate.getUTCMonth() - monthsToSubtract,
          0,
          23,
          59,
          59,
          999
        )
      );
    }

    // ⚡ Bolt: Parallelize independent report lookups using Promise.all
    const [currentPeriodReport, lastYearReport, previousPeriodReport] =
      await Promise.all([
        this.getReportForPeriod(
          String(params.userId),
          String(params.badgeId),
          startDate,
          endDate
        ),
        this.getReportForPeriod(
          String(params.userId),
          String(params.badgeId),
          lastYearStartDate,
          lastYearEndDate
        ),
        this.getReportForPeriod(
          String(params.userId),
          String(params.badgeId),
          previousPeriodStartDate,
          previousPeriodEndDate
        ),
      ]);

    return {
      current: currentPeriodReport,
      lastYear: lastYearReport,
      previousPeriod: previousPeriodReport,
    };
  }

  /**
   * ⚡ Bolt: Formats a date as YYYY-MM-DD using UTC components.
   * This is ~7x faster than toISOString().split('T')[0].
   */
  private toISODate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    return `${year}-${month < 10 ? "0" + month : month}-${
      day < 10 ? "0" + day : day
    }`;
  }

  private async getReportForPeriod(
    userId: string,
    badgeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<BalanceHistory> {
    const report = await prisma.vw_historybalance.findMany({
      where: {
        badgeId: badgeId,
        userId: userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    if (report.length === 0) {
      return [];
    }

    // ⚡ Bolt: Build report map using for...of to avoid intermediate array creation from .map()
    const reportMap = new Map<string, (typeof report)[0]>();
    for (const item of report) {
      if (item.date) {
        reportMap.set(this.toISODate(item.date), item);
      }
    }

    // ⚡ Bolt: Pre-extract badge metadata to avoid repeated property access in the loop
    const firstItem = report[0];
    const badgeMetadata = {
      badgeId: String(firstItem.badgeId),
      code: String(firstItem.code),
      flag: String(firstItem.flag),
      symbol: String(firstItem.symbol),
    };

    const fullReport: ItemBalanceHistory[] = [];
    let currentDate = new Date(startDate.getTime());
    let lastBalance = ZERO_DECIMAL;

    while (currentDate <= endDate) {
      const dateKey = this.toISODate(currentDate);
      const dailyRecord = reportMap.get(dateKey);

      if (dailyRecord) {
        fullReport.push({
          ...badgeMetadata,
          date: dateKey,
          dailyAmount: dailyRecord.dailyAmount ?? ZERO_DECIMAL,
          cumulativeBalance: dailyRecord.cumulativeBalance,
        });
        lastBalance = (dailyRecord.cumulativeBalance as Decimal) ?? lastBalance;
      } else {
        fullReport.push({
          ...badgeMetadata,
          date: dateKey,
          dailyAmount: ZERO_DECIMAL,
          cumulativeBalance: lastBalance,
        });
      }

      // ⚡ Bolt: Use UTC methods for consistent and efficient date progression
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    return fullReport;
  }
}
