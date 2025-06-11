import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { IHeritageRepository } from "../domain/interfaces/heritage.interfaces";
import { Heritage, CreateHeritage } from "../domain/heritage";

export class HeritageUseCase {
  private badgeRepository: IHeritageRepository;

  constructor(_badgeAdapter: IHeritageRepository) {
    this.badgeRepository = _badgeAdapter;
  }

  public async addHeritage(
    data: CreateHeritage
  ): Promise<Heritage | ErrorMessage> {
    return await this.badgeRepository.addHeritage(data);
  }

  public async listHeritage(
    params: CommonParamsPaginate
  ): Promise<{ content: Heritage[]; meta: Paginate }> {
    return await this.badgeRepository.listHeritage(params);
  }

  public async updateHeritage(
    id: string,
    badge: Partial<CreateHeritage>
  ): Promise<Heritage | ErrorMessage> {
    return await this.badgeRepository.updateHeritage(id, badge);
  }

  public async detailHeritage(id: string): Promise<Heritage | null> {
    return await this.badgeRepository.detailHeritage(id);
  }

  public async deleteHeritage(id: string): Promise<Heritage | null> {
    return await this.badgeRepository.deleteHeritage(id);
  }
}
