import { ErrorMessage } from "packages/shared";
import { IReportRepository } from "../domain/interfaces/report.interfaces";
import {
  Report,
  ReportAccountBalance,
  ReportBalance,
  ReportBalanceHistory,
  ReportCategoryStats,
  ReportParams,
} from "../domain/report";

export class ReportUseCase {
  private reportRepository: IReportRepository;

  constructor(_adapter: IReportRepository) {
    this.reportRepository = _adapter;
  }
  async weeklyExpensive(params: ReportParams): Promise<Report | ErrorMessage> {
    return this.reportRepository.weeklyExpensive(params);
  }

  async weeklyIncome(params: ReportParams): Promise<Report | ErrorMessage> {
    return this.reportRepository.weeklyIncome(params);
  }

  async monthlyExpensive(params: ReportParams): Promise<Report | ErrorMessage> {
    return this.reportRepository.monthlyExpensive(params);
  }

  async monthlyIncome(params: ReportParams): Promise<Report | ErrorMessage> {
    return this.reportRepository.monthlyIncome(params);
  }

  async yearlyExpensive(params: ReportParams): Promise<Report | ErrorMessage> {
    return this.reportRepository.yearlyExpensive(params);
  }

  async yearlyIncome(params: ReportParams): Promise<Report | ErrorMessage> {
    return this.reportRepository.yearlyIncome(params);
  }

  async dailyExpensive(params: ReportParams): Promise<Report | ErrorMessage> {
    return this.reportRepository.dailyExpensive(params);
  }

  async dailyIncome(params: ReportParams): Promise<Report | ErrorMessage> {
    return this.reportRepository.dailyIncome(params);
  }

  async reportBalance(
    params: ReportParams
  ): Promise<ReportBalance | ErrorMessage> {
    return this.reportRepository.reportBalance(params);
  }

  async reportAccountBalance(
    params: ReportParams
  ): Promise<ReportAccountBalance | ErrorMessage> {
    return this.reportRepository.reportAccountBalance(params);
  }

  async reportCategoryStats(
    params: ReportParams
  ): Promise<ReportCategoryStats | ErrorMessage> {
    return this.reportRepository.reportCategoryStats(params);
  }
  async reportBalanceHistory(
    params: ReportParams
  ): Promise<ReportBalanceHistory | ErrorMessage> {
    return this.reportRepository.reportBalanceHistory(params);
  }
}
