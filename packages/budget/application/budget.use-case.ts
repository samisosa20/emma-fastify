import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { IBudgetRepository } from "../domain/interfaces/budget.interfaces";
import { Budget, CreateBudget } from "../domain/budget";

export class BudgetUseCase {
  private badgeRepository: IBudgetRepository;

  constructor(_badgeAdapter: IBudgetRepository) {
    this.badgeRepository = _badgeAdapter;
  }

  public async addBudget(data: CreateBudget): Promise<Budget | ErrorMessage> {
    return await this.badgeRepository.addBudget(data);
  }

  public async listBudget(
    params: CommonParamsPaginate
  ): Promise<{ content: Budget[]; meta: Paginate }> {
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
}
