import { Report, ReportParams } from "../domain/report";
import { IReportRepository } from "../domain/interfaces/report.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import { ErrorMessage } from "packages/shared";
import { Decimal } from "@prisma/client/runtime/library";

export class ReportPrismaRepository implements IReportRepository {
  public async weeklyExpensive(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    const report = await prisma.weeklyExpensiveView.findMany({
      where: {
        weekNumber: params.weekNumber,
        year: params.year,
        badgeId: params.badgeId,
        userId: params.userId,
      },
      select: {
        category: true,
        amount: true,
        icon: true,
        color: true,
      },
      orderBy: {
        year: "desc",
        weekNumber: "desc",
      },
    });

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus(item.amount.abs()), // <-- Usamos .abs() para sumar el valor absoluto
      new Decimal(0)
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = item.amount.abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? new Decimal(0)
        : itemAmountAbsoluto.div(totalAbsoluto).times(100);

      return {
        ...item,
        amount: item.amount.abs(),
        // Asegúrate de que `participation` sea un tipo `Decimal` o conviértelo a `string`
        participation: participation.toFixed(1),
      };
    });

    return reportWithPercentage;
  }
  public async weeklyIncome(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    const report = await prisma.weeklyIncomeView.findMany({
      where: {
        weekNumber: params.weekNumber,
        year: params.year,
        badgeId: params.badgeId,
        userId: params.userId,
      },
      select: {
        category: true,
        amount: true,
        icon: true,
        color: true,
      },
      orderBy: {
        year: "desc",
        weekNumber: "desc",
      },
    });

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus(item.amount.abs()), // <-- Usamos .abs() para sumar el valor absoluto
      new Decimal(0)
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = item.amount.abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? new Decimal(0)
        : itemAmountAbsoluto.div(totalAbsoluto).times(100);

      return {
        ...item,
        amount: item.amount.abs(),
        // Asegúrate de que `participation` sea un tipo `Decimal` o conviértelo a `string`
        participation: participation.toFixed(1),
      };
    });

    return reportWithPercentage;
  }
  public async monthlyExpensive(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    const report = await prisma.monthlyExpensiveView.findMany({
      where: {
        month: params.month,
        year: params.year,
        badgeId: params.badgeId,
        userId: params.userId,
      },
      select: {
        category: true,
        amount: true,
        icon: true,
        color: true,
      },
      orderBy: {
        year: "desc",
        month: "desc",
      },
    });

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus(item.amount.abs()), // <-- Usamos .abs() para sumar el valor absoluto
      new Decimal(0)
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = item.amount.abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? new Decimal(0)
        : itemAmountAbsoluto.div(totalAbsoluto).times(100);

      return {
        ...item,
        amount: item.amount.abs(),
        // Asegúrate de que `participation` sea un tipo `Decimal` o conviértelo a `string`
        participation: participation.toFixed(1),
      };
    });

    return reportWithPercentage;
  }
  public async monthlyIncome(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    const report = await prisma.monthlyIncomeView.findMany({
      where: {
        month: params.month,
        year: params.year,
        badgeId: params.badgeId,
        userId: params.userId,
      },
      select: {
        category: true,
        amount: true,
        icon: true,
        color: true,
      },
      orderBy: {
        year: "desc",
        month: "desc",
      },
    });

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus(item.amount.abs()), // <-- Usamos .abs() para sumar el valor absoluto
      new Decimal(0)
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = item.amount.abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? new Decimal(0)
        : itemAmountAbsoluto.div(totalAbsoluto).times(100);

      return {
        ...item,
        amount: item.amount.abs(),
        // Asegúrate de que `participation` sea un tipo `Decimal` o conviértelo a `string`
        participation: participation.toFixed(1),
      };
    });

    return reportWithPercentage;
  }
  public async yearlyExpensive(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    const report = await prisma.yearlyExpensiveView.findMany({
      where: {
        year: params.year,
        badgeId: params.badgeId,
        userId: params.userId,
      },
      select: {
        category: true,
        amount: true,
        icon: true,
        color: true,
      },
      orderBy: {
        year: "desc",
      },
    });

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus(item.amount.abs()), // <-- Usamos .abs() para sumar el valor absoluto
      new Decimal(0)
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = item.amount.abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? new Decimal(0)
        : itemAmountAbsoluto.div(totalAbsoluto).times(100);

      return {
        ...item,
        amount: item.amount.abs(),
        // Asegúrate de que `participation` sea un tipo `Decimal` o conviértelo a `string`
        participation: participation.toFixed(1),
      };
    });

    return reportWithPercentage;
  }
  public async yearlyIncome(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    const report = await prisma.yearlyIncomeView.findMany({
      where: {
        year: params.year,
        badgeId: params.badgeId,
        userId: params.userId,
      },
      select: {
        category: true,
        amount: true,
        icon: true,
        color: true,
      },
      orderBy: {
        year: "desc",
      },
    });

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus(item.amount.abs()), // <-- Usamos .abs() para sumar el valor absoluto
      new Decimal(0)
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = item.amount.abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? new Decimal(0)
        : itemAmountAbsoluto.div(totalAbsoluto).times(100);

      return {
        ...item,
        amount: item.amount.abs(),
        // Asegúrate de que `participation` sea un tipo `Decimal` o conviértelo a `string`
        participation: participation.toFixed(1),
      };
    });

    return reportWithPercentage;
  }
  public async dailyExpensive(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    const report = await prisma.dailyExpensyView.findMany({
      where: {
        datePurchase: params.date,
        badgeId: params.badgeId,
        userId: params.userId,
      },
      select: {
        category: true,
        amount: true,
        icon: true,
        color: true,
      },
    });

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus(item.amount.abs()), // <-- Usamos .abs() para sumar el valor absoluto
      new Decimal(0)
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = item.amount.abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? new Decimal(0)
        : itemAmountAbsoluto.div(totalAbsoluto).times(100);

      return {
        ...item,
        amount: item.amount.abs(),
        // Asegúrate de que `participation` sea un tipo `Decimal` o conviértelo a `string`
        participation: participation.toFixed(1),
      };
    });

    return reportWithPercentage;
  }
  public async dailyIncome(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    const report = await prisma.dailyIncomeView.findMany({
      where: {
        datePurchase: params.date,
        badgeId: params.badgeId,
        userId: params.userId,
      },
      select: {
        category: true,
        amount: true,
        icon: true,
        color: true,
      },
    });

    // 1. Total de gastos (usando el valor absoluto para la participación)
    // Se inicializa con un objeto Decimal para mantener la precisión
    const totalAbsoluto = report.reduce(
      (sum, item) => sum.plus(item.amount.abs()), // <-- Usamos .abs() para sumar el valor absoluto
      new Decimal(0)
    );

    // 2. Agregar % de participación
    const reportWithPercentage = report.map((item) => {
      // Asegúrate de que los cálculos se hacen con Decimal
      const itemAmountAbsoluto = item.amount.abs();

      // Calcula la participación.
      // Evitamos la división por cero y usamos el total absoluto.
      const participation = totalAbsoluto.isZero()
        ? new Decimal(0)
        : itemAmountAbsoluto.div(totalAbsoluto).times(100);

      return {
        ...item,
        amount: item.amount.abs(),
        // Asegúrate de que `participation` sea un tipo `Decimal` o conviértelo a `string`
        participation: participation.toFixed(1),
      };
    });

    return reportWithPercentage;
  }
}
