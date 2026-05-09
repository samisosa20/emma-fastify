import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { IInvestmentRepository } from "../domain/interfaces/investment.interfaces";
import { Investment, CreateInvestment } from "../domain/investment";

export class InvestmentUseCase {
  private badgeRepository: IInvestmentRepository;

  constructor(_badgeAdapter: IInvestmentRepository) {
    this.badgeRepository = _badgeAdapter;
  }

  public async addInvestment(
    data: CreateInvestment
  ): Promise<Investment | ErrorMessage> {
    return await this.badgeRepository.addInvestment(data);
  }

  public async listInvestment(
    params: CommonParamsPaginate
  ): Promise<{ content: Investment[]; meta: Paginate }> {
    return await this.badgeRepository.listInvestment(params);
  }

  public async updateInvestment(
    id: string,
    badge: Partial<CreateInvestment>,
    userId: string
  ): Promise<Investment | ErrorMessage> {
    return await this.badgeRepository.updateInvestment(id, badge, userId);
  }

  public async detailInvestment(
    id: string,
    userId: string
  ): Promise<Investment | null> {
    return await this.badgeRepository.detailInvestment(id, userId);
  }

  public async deleteInvestment(
    id: string,
    userId: string
  ): Promise<Investment | null> {
    return await this.badgeRepository.deleteInvestment(id, userId);
  }

  public async importInvestments(userId: string): Promise<{
    investmentCount: number;
  }> {
    return await this.badgeRepository.importInvestments(userId);
  }
}
