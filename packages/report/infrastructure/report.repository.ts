import { Report, ReportParams } from "../domain/report";
import { IReportRepository } from "../domain/interfaces/report.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import { ErrorMessage } from "packages/shared";

export class ReportPrismaRepository implements IReportRepository {
  public async weeklyExpensive(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    const report = await prisma.weeklyExpensiveView.findMany({
      where: params,
      select: {
        category: true,
        amount: true,
      },
    });

    return report;
  }
  public async weeklyIncome(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    const report = await prisma.weeklyExpensiveView.findMany({
      where: params,
      select: {
        category: true,
        amount: true,
      },
    });

    return report;
  }
  public async monthlyExpensive(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    const report = await prisma.weeklyExpensiveView.findMany({
      where: params,
      select: {
        category: true,
        amount: true,
      },
    });

    return report;
  }
  public async monthlyIncome(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    const report = await prisma.weeklyExpensiveView.findMany({
      where: params,
      select: {
        category: true,
        amount: true,
      },
    });

    return report;
  }
  public async yearlyExpensive(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    const report = await prisma.weeklyExpensiveView.findMany({
      where: params,
      select: {
        category: true,
        amount: true,
      },
    });

    return report;
  }
  public async yearlyIncome(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    const report = await prisma.weeklyExpensiveView.findMany({
      where: params,
      select: {
        category: true,
        amount: true,
      },
    });

    return report;
  }
  public async dailyExpensive(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    const report = await prisma.weeklyExpensiveView.findMany({
      where: params,
      select: {
        category: true,
        amount: true,
      },
    });

    return report;
  }
  public async dailyIncome(
    params: ReportParams
  ): Promise<Report | ErrorMessage> {
    const report = await prisma.weeklyExpensiveView.findMany({
      where: params,
      select: {
        category: true,
        amount: true,
      },
    });

    return report;
  }
}
