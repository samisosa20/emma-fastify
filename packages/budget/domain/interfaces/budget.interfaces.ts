import { CommonParamsPaginate, ErrorMessage } from "packages/shared";
import {
  Budget,
  BudgetCompare,
  BudgetSummaryByBadge,
  CreateBudget,
  ParamsBudget,
} from "../budget";

export interface IBudgetRepository {
  addBudget(data: CreateBudget): Promise<Budget | ErrorMessage>;
  listBudget(params: ParamsBudget): Promise<BudgetCompare[]>;
  updateBudget(
    id: string,
    account: Partial<CreateBudget>
  ): Promise<Budget | ErrorMessage>;
  detailBudget(id: string): Promise<Budget | null>;
  deleteBudget(id: string): Promise<Budget | null>;
  importBudgets(): Promise<{
    budgetCount: number;
  }>;
  listBudgetByYear(
    params: CommonParamsPaginate & ParamsBudget
  ): Promise<BudgetSummaryByBadge[]>;
}
