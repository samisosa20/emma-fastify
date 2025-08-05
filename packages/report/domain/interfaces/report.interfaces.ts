import { ErrorMessage } from "packages/shared";
import { Report, ReportParams } from "../report";

export interface IReportRepository {
  weeklyExpensive(params: ReportParams): Promise<Report | ErrorMessage>;
  weeklyIncome(params: ReportParams): Promise<Report | ErrorMessage>;
  monthlyExpensive(params: ReportParams): Promise<Report | ErrorMessage>;
  monthlyIncome(params: ReportParams): Promise<Report | ErrorMessage>;
  yearlyExpensive(params: ReportParams): Promise<Report | ErrorMessage>;
  yearlyIncome(params: ReportParams): Promise<Report | ErrorMessage>;
  dailyExpensive(params: ReportParams): Promise<Report | ErrorMessage>;
  dailyIncome(params: ReportParams): Promise<Report | ErrorMessage>;
}
