import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { IAppreciationRepository } from "../domain/interfaces/appreciation.interfaces";
import { Appreciation, CreateAppreciation } from "../domain/appreciation";

export class AppreciationUseCase {
  private badgeRepository: IAppreciationRepository;

  constructor(_badgeAdapter: IAppreciationRepository) {
    this.badgeRepository = _badgeAdapter;
  }

  public async addAppreciation(
    data: CreateAppreciation
  ): Promise<Appreciation | ErrorMessage> {
    return await this.badgeRepository.addAppreciation(data);
  }

  public async listAppreciation(
    params: CommonParamsPaginate
  ): Promise<{ content: Appreciation[]; meta: Paginate }> {
    return await this.badgeRepository.listAppreciation(params);
  }

  public async updateAppreciation(
    id: string,
    badge: Partial<CreateAppreciation>
  ): Promise<Appreciation | ErrorMessage> {
    return await this.badgeRepository.updateAppreciation(id, badge);
  }

  public async detailAppreciation(id: string): Promise<Appreciation | null> {
    return await this.badgeRepository.detailAppreciation(id);
  }

  public async deleteAppreciation(id: string): Promise<Appreciation | null> {
    return await this.badgeRepository.deleteAppreciation(id);
  }

  public async importAppreciations(): Promise<{
    appreciationCount: number;
  }> {
    return await this.badgeRepository.importAppreciations();
  }
}
