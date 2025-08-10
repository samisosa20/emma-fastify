import { ErrorMessage } from "packages/shared";
import {
  Report,
  ReportAccountBalance,
  ReportBalance,
  ReportCategoryStats,
  ReportParams,
} from "../report";

export interface IReportRepository {
  weeklyExpensive(params: ReportParams): Promise<Report | ErrorMessage>;
  weeklyIncome(params: ReportParams): Promise<Report | ErrorMessage>;
  monthlyExpensive(params: ReportParams): Promise<Report | ErrorMessage>;
  monthlyIncome(params: ReportParams): Promise<Report | ErrorMessage>;
  yearlyExpensive(params: ReportParams): Promise<Report | ErrorMessage>;
  yearlyIncome(params: ReportParams): Promise<Report | ErrorMessage>;
  dailyExpensive(params: ReportParams): Promise<Report | ErrorMessage>;
  dailyIncome(params: ReportParams): Promise<Report | ErrorMessage>;
  reportBalance(params: ReportParams): Promise<ReportBalance | ErrorMessage>;
  reportAccountBalance(
    params: ReportParams
  ): Promise<ReportAccountBalance | ErrorMessage>;
  reportCategoryStats(
    params: ReportParams
  ): Promise<ReportCategoryStats | ErrorMessage>;
}
