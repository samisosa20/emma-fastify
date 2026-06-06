import { FastifyRequest, FastifyReply } from "fastify";

import { ReportUseCase } from "packages/report/application/report.use-case";
import { ReportParams } from "packages/report/domain/report";
import { ReportPrismaRepository } from "packages/report/infrastructure/report.repository";

const reportRepository = new ReportPrismaRepository();
const reportUseCase = new ReportUseCase(reportRepository);

// ⚡ Bolt: Hoist mapping object to avoid re-allocating it on every request.
const REPORT_USE_CASE_MAP: Record<string, Record<string, string>> = {
  expensive: {
    weekly: "weeklyExpensive",
    monthly: "monthlyExpensive",
    yearly: "yearlyExpensive",
    daily: "dailyExpensive",
  },
  income: {
    weekly: "weeklyIncome",
    monthly: "monthlyIncome",
    yearly: "yearlyIncome",
    daily: "dailyIncome",
  },
};

export class ReportController {
  reportMovements = async (request: FastifyRequest, reply: FastifyReply) => {
    type ReportType = "expensive" | "income";
    type ReportPeriod = "daily" | "weekly" | "monthly" | "yearly";
    const { type, period } = request.params as {
      type: ReportType;
      period: ReportPeriod;
    };
    const query = request.query as ReportParams;
    const user = request.user;

    if (!(type in REPORT_USE_CASE_MAP)) {
      return reply.status(400).send({ error: "Invalid report type" });
    }
    if (!(period in REPORT_USE_CASE_MAP[type])) {
      return reply.status(400).send({ error: "Invalid report period" });
    }
    const selectedHandler = REPORT_USE_CASE_MAP[type]?.[period];

    if (!selectedHandler) {
      return reply.status(400).send({
        error: "Invalid type or period",
        message: `Expected type: income | expensive and period: daily | weekly | monthly | yearly`,
      });
    }

    try {
      // @ts-ignore
      const result = await reportUseCase[selectedHandler]({
        ...(query.weekNumber && { weekNumber: Number(query.weekNumber) }),
        ...(query.year && { year: Number(query.year) }),
        ...(query.month && { month: Number(query.month) }),
        ...(query.date && { date: new Date(query.date) }),
        badgeId: query.badgeId ?? user.badgeId,
        userId: user.id,
      });

      return reply.send(result);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: "Error generating report" });
    }
  };
  reportBalance = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user;
      const result = await reportUseCase.reportBalance({
        userId: user.id,
      });

      return reply.send(result);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: "Error generating report" });
    }
  };
  reportAccountBalance = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params as { id: string };
      const user = request.user;
      const result = await reportUseCase.reportAccountBalance({
        userId: user.id,
        accountId: id,
      });

      return reply.send(result);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: "Error generating report" });
    }
  };
  reportCategoryStats = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params as { id: string };
      const user = request.user;
      const result = await reportUseCase.reportCategoryStats({
        userId: user.id,
        categoryId: id,
      });

      return reply.send(result);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: "Error generating report" });
    }
  };
  reportBalanceHistory = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const query = request.query as {
        badgeId: string;
        startDate: string;
        endDate: string;
      };
      const user = request.user;
      const result = await reportUseCase.reportBalanceHistory({
        userId: user.id,
        ...query,
        badgeId: query.badgeId ?? user.badgeId,
      });

      return reply.send(result);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: "Error generating report" });
    }
  };
}
