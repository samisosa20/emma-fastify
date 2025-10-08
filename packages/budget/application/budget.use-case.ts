import { CommonParamsPaginate, ErrorMessage } from "packages/shared";
import { IBudgetRepository } from "../domain/interfaces/budget.interfaces";
import {
  Budget,
  BudgetCompare,
  BudgetSummaryByBadge,
  CreateBudget,
  ParamsBudget,
} from "../domain/budget";

export class BudgetUseCase {
  private badgeRepository: IBudgetRepository;

  constructor(_badgeAdapter: IBudgetRepository) {
    this.badgeRepository = _badgeAdapter;
  }

  public async addBudget(data: CreateBudget): Promise<Budget | ErrorMessage> {
    return await this.badgeRepository.addBudget(data);
  }

  public async listBudget(params: ParamsBudget): Promise<BudgetCompare[]> {
    return await this.badgeRepository.listBudget(params);
  }

  public async updateBudget(
    id: string,
    badge: Partial<CreateBudget>
  ): Promise<Budget | ErrorMessage> {
    return await this.badgeRepository.updateBudget(id, badge);
  }

  public async detailBudget(id: string): Promise<Budget | null> {
    return await this.badgeRepository.detailBudget(id);
  }

  public async deleteBudget(id: string): Promise<Budget | null> {
    return await this.badgeRepository.deleteBudget(id);
  }

  public async importBudgets(): Promise<{ budgetCount: number }> {
    return await this.badgeRepository.importBudgets();
  }
  public async listBudgetByYear(
    params: CommonParamsPaginate & ParamsBudget
  ): Promise<BudgetSummaryByBadge[]> {
    return await this.badgeRepository.listBudgetByYear(params);
  }
}
