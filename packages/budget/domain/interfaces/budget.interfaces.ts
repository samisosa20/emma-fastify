import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { Budget, CreateBudget } from "../budget";

export interface IBudgetRepository {
  addBudget(data: CreateBudget): Promise<Budget | ErrorMessage>;
  listBudget(
    params: CommonParamsPaginate
  ): Promise<{ content: Budget[]; meta: Paginate }>;
  updateBudget(
    id: string,
    account: Partial<CreateBudget>
  ): Promise<Budget | ErrorMessage>;
  detailBudget(id: string): Promise<Budget | null>;
  deleteBudget(id: string): Promise<Budget | null>;
  importBudgets(): Promise<{
    budgetCount: number;
  }>;
}
