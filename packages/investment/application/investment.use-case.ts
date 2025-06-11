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
    badge: Partial<CreateInvestment>
  ): Promise<Investment | ErrorMessage> {
    return await this.badgeRepository.updateInvestment(id, badge);
  }

  public async detailInvestment(id: string): Promise<Investment | null> {
    return await this.badgeRepository.detailInvestment(id);
  }

  public async deleteInvestment(id: string): Promise<Investment | null> {
    return await this.badgeRepository.deleteInvestment(id);
  }
}
