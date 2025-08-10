import {
  Report,
  ReportAccountBalance,
  ReportBalance,
  ReportCategoryStats,
  ReportParams,
} from "../domain/report";
import { IReportRepository } from "../domain/interfaces/report.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import { ErrorMessage } from "packages/shared";
import { Decimal } from "@prisma/client/runtime/library";

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
}
