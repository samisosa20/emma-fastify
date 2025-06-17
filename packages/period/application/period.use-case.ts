import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { IPeriodRepository } from "../domain/interfaces/period.interfaces";
import { Period, CreatePeriod } from "../domain/period";

export class PeriodUseCase {
  private badgeRepository: IPeriodRepository;

  constructor(_badgeAdapter: IPeriodRepository) {
    this.badgeRepository = _badgeAdapter;
  }

  public async addPeriod(data: CreatePeriod): Promise<Period | ErrorMessage> {
    return await this.badgeRepository.addPeriod(data);
  }

  public async listPeriod(
    params: CommonParamsPaginate
  ): Promise<{ content: Period[]; meta: Paginate }> {
    return await this.badgeRepository.listPeriod(params);
  }

  public async updatePeriod(
    id: string,
    badge: Partial<CreatePeriod>
  ): Promise<Period | ErrorMessage> {
    return await this.badgeRepository.updatePeriod(id, badge);
  }

  public async detailPeriod(id: string): Promise<Period | null> {
    return await this.badgeRepository.detailPeriod(id);
  }

  public async deletePeriod(id: string): Promise<Period | null> {
    return await this.badgeRepository.deletePeriod(id);
  }
}
