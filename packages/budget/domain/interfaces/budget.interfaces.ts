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
    account: Partial<CreateBudget>,
    userId: string
  ): Promise<Budget | ErrorMessage>;
  detailBudget(id: string, userId: string): Promise<Budget | null>;
  deleteBudget(id: string, userId: string): Promise<Budget | null>;
  importBudgets(userId: string): Promise<{
    budgetCount: number;
  }>;
  listBudgetByYear(
    params: CommonParamsPaginate & ParamsBudget
  ): Promise<BudgetSummaryByBadge[]>;
}
