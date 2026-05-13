import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { IAppreciationRepository } from "../domain/interfaces/appreciation.interfaces";
import { Appreciation, CreateAppreciation } from "../domain/appreciation";

export class AppreciationUseCase {
  private badgeRepository: IAppreciationRepository;

  constructor(_badgeAdapter: IAppreciationRepository) {
    this.badgeRepository = _badgeAdapter;
  }

  public async addAppreciation(
    data: CreateAppreciation,
    userId: string
  ): Promise<Appreciation | ErrorMessage> {
    return await this.badgeRepository.addAppreciation(data, userId);
  }

  public async listAppreciation(
    params: CommonParamsPaginate,
    userId: string
  ): Promise<{ content: Appreciation[]; meta: Paginate }> {
    return await this.badgeRepository.listAppreciation(params, userId);
  }

  public async updateAppreciation(
    id: string,
    appreciationId: string,
    badge: Partial<CreateAppreciation>,
    userId: string
  ): Promise<Appreciation | ErrorMessage> {
    return await this.badgeRepository.updateAppreciation(
      id,
      appreciationId,
      badge,
      userId
    );
  }

  public async detailAppreciation(
    id: string,
    userId: string
  ): Promise<Appreciation | null> {
    return await this.badgeRepository.detailAppreciation(id, userId);
  }

  public async deleteAppreciation(
    id: string,
    appreciationId: string,
    userId: string
  ): Promise<Appreciation | null> {
    return await this.badgeRepository.deleteAppreciation(
      id,
      appreciationId,
      userId
    );
  }

  public async importAppreciations(userId: string): Promise<{
    appreciationCount: number;
  }> {
    return await this.badgeRepository.importAppreciations(userId);
  }
}
