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

export class ReportPrismaRepository implements IReportRepository {
  public async weeklyExpensive(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    const report = await prisma.vw_weeklyexpensive.findMany({
      where: {
        weekNumber: params.weekNumber,
        year: params.year,
        badgeId: params.badgeId,
        userId: params.userId,
      },
      orderBy: [{ year: "desc" }, { weekNumber: "desc" }, { amount: "asc" }],
    });

    const badge = await prisma.badge.findFirst({
      where: {
        id: params.badgeId,
      },
    });

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus((item.amount ?? new Decimal(0)).abs()), // <-- Usamos .abs() para sumar el valor absoluto
      new Decimal(0)
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = (item.amount ?? new Decimal(0)).abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? new Decimal(0)
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
    const report = await prisma.vw_weeklyincome.findMany({
      where: {
        weekNumber: params.weekNumber,
        year: params.year,
        badgeId: params.badgeId,
        userId: params.userId,
      },
      orderBy: [{ year: "desc" }, { weekNumber: "desc" }, { amount: "desc" }],
    });

    const badge = await prisma.badge.findFirst({
      where: {
        id: params.badgeId,
      },
    });

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus((item.amount ?? new Decimal(0)).abs()), // <-- Usamos .abs() para sumar el valor absoluto
      new Decimal(0)
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = (item.amount ?? new Decimal(0)).abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? new Decimal(0)
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
    const report = await prisma.vw_monthlyexpensive.findMany({
      where: {
        month: params.month,
        year: params.year,
        badgeId: params.badgeId,
        userId: params.userId,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }, { amount: "asc" }],
    });

    const badge = await prisma.badge.findFirst({
      where: {
        id: params.badgeId,
      },
    });

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus((item.amount ?? new Decimal(0)).abs()), // <-- Usamos .abs() para sumar el valor absoluto
      new Decimal(0)
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = (item.amount ?? new Decimal(0)).abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? new Decimal(0)
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
    const report = await prisma.vw_monthlyincome.findMany({
      where: {
        month: params.month,
        year: params.year,
        badgeId: params.badgeId,
        userId: params.userId,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }, { amount: "desc" }],
    });

    const badge = await prisma.badge.findFirst({
      where: {
        id: params.badgeId,
      },
    });

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus((item.amount ?? new Decimal(0)).abs()), // <-- Usamos .abs() para sumar el valor absoluto
      new Decimal(0)
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = (item.amount ?? new Decimal(0)).abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? new Decimal(0)
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
    const report = await prisma.vw_yearlyexpensive.findMany({
      where: {
        year: params.year,
        badgeId: params.badgeId,
        userId: params.userId,
      },
      orderBy: [{ year: "desc" }, { amount: "asc" }],
    });

    const badge = await prisma.badge.findFirst({
      where: {
        id: params.badgeId,
      },
    });

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus((item.amount ?? new Decimal(0)).abs()), // <-- Usamos .abs() para sumar el valor absoluto
      new Decimal(0)
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = (item.amount ?? new Decimal(0)).abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? new Decimal(0)
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
    const report = await prisma.vw_yearlyincome.findMany({
      where: {
        year: params.year,
        badgeId: params.badgeId,
        userId: params.userId,
      },
      orderBy: [{ year: "desc" }, { amount: "desc" }],
    });

    const badge = await prisma.badge.findFirst({
      where: {
        id: params.badgeId,
      },
    });

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus((item.amount ?? new Decimal(0)).abs()), // <-- Usamos .abs() para sumar el valor absoluto
      new Decimal(0)
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = (item.amount ?? new Decimal(0)).abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? new Decimal(0)
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
    const report = await prisma.vw_dailyexpensive.findMany({
      where: {
        datePurchase: params.date,
        badgeId: params.badgeId,
        userId: params.userId,
      },
      orderBy: [{ amount: "asc" }],
    });

    const badge = await prisma.badge.findFirst({
      where: {
        id: params.badgeId,
      },
    });

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus((item.amount ?? new Decimal(0)).abs()), // <-- Usamos .abs() para sumar el valor absoluto
      new Decimal(0)
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = (item.amount ?? new Decimal(0)).abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? new Decimal(0)
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
    const report = await prisma.vw_dailyincome.findMany({
      where: {
        datePurchase: params.date,
        badgeId: params.badgeId,
        userId: params.userId,
      },
      orderBy: [{ amount: "desc" }],
    });

    const badge = await prisma.badge.findFirst({
      where: {
        id: params.badgeId,
      },
    });

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus((item.amount ?? new Decimal(0)).abs()), // <-- Usamos .abs() para sumar el valor absoluto
      new Decimal(0)
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = (item.amount ?? new Decimal(0)).abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? new Decimal(0)
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
    const startDate = new Date(String(params.startDate));
    const endDate = new Date(String(params.endDate));
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // Diferencia en días redondeada
    const currentPeriodDays = Math.round(
      (endDate.getTime() - startDate.getTime()) / MS_PER_DAY
    );

    // 1. Obtener el reporte del período actual
    const currentPeriodReport = await this.getReportForPeriod(
      String(params.userId),
      String(params.badgeId),
      startDate,
      endDate
    );

    // 2. Obtener el reporte del año anterior
    const lastYearStartDate = new Date(String(params.startDate));
    lastYearStartDate.setFullYear(startDate.getFullYear() - 1);
    const lastYearEndDate = new Date(String(params.endDate));
    lastYearEndDate.setFullYear(endDate.getFullYear() - 1);
    const lastYearReport = await this.getReportForPeriod(
      String(params.userId),
      String(params.badgeId),
      lastYearStartDate,
      lastYearEndDate
    );

    // Paso 3: Calcular las fechas del período anterior restando los milisegundos
    let previousPeriodStartDate, previousPeriodEndDate;

    if (currentPeriodDays < 30) {
      // restar el mismo número de días
      previousPeriodStartDate = new Date(
        startDate.getTime() - currentPeriodDays * MS_PER_DAY
      );
      previousPeriodEndDate = new Date(
        endDate.getTime() - currentPeriodDays * MS_PER_DAY
      );
    } else {
      // restar meses aproximados
      const monthsToSubtract = Math.ceil(currentPeriodDays / 30);
      previousPeriodStartDate = new Date(String(params.startDate));
      previousPeriodEndDate = new Date(String(params.endDate));

      previousPeriodStartDate.setMonth(
        previousPeriodStartDate.getMonth() - monthsToSubtract
      );
      previousPeriodEndDate.setMonth(
        previousPeriodEndDate.getMonth() - monthsToSubtract
      );
    }
    const previousPeriodReport = await this.getReportForPeriod(
      String(params.userId),
      String(params.badgeId),
      previousPeriodStartDate,
      previousPeriodEndDate
    );

    const allDates = new Set([
      ...currentPeriodReport.map((r) => r.date),
      ...lastYearReport.map((r) => r.date),
      ...previousPeriodReport.map((r) => r.date),
    ]);

    return {
      current: currentPeriodReport,
      lastYear: lastYearReport,
      previousPeriod: previousPeriodReport,
    };
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

    const reportMap = new Map(
      report.map((item) => [item.date?.toISOString().split("T")[0], item])
    );

    const fullReport: ItemBalanceHistory[] = [];
    let currentDate = startDate;
    let lastBalance = new Prisma.Decimal(0);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split("T")[0];
      let dailyRecord: any = reportMap.get(dateKey);

      if (dailyRecord) {
        fullReport.push({
          badgeId: String(dailyRecord.badgeId),
          code: String(dailyRecord.code),
          flag: String(dailyRecord.flag),
          symbol: String(dailyRecord.symbol),
          date: dateKey,
          dailyAmount: dailyRecord.dailyAmount ?? new Decimal(0),
          cumulativeBalance: dailyRecord.cumulativeBalance,
        });
        lastBalance = dailyRecord.cumulativeBalance as Decimal;
      } else {
        const previousDayData = fullReport[fullReport.length - 1];
        if (previousDayData)
          fullReport.push({
            badgeId: previousDayData.badgeId,
            code: previousDayData.code,
            flag: previousDayData.flag,
            symbol: previousDayData.symbol,
            date: dateKey,
            dailyAmount: new Decimal(0),
            cumulativeBalance: lastBalance,
          });
      }

      // Avanza al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return fullReport;
  }
}
