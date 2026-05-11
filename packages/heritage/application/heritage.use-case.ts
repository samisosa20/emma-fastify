import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { IHeritageRepository } from "../domain/interfaces/heritage.interfaces";
import {
  Heritage,
  CreateHeritage,
  ParamsHeritage,
  HeritageReport,
} from "../domain/heritage";
import { ReportBalance } from "packages/report/domain/report";

export class HeritageUseCase {
  private heritageRepository: IHeritageRepository;

  constructor(_heritageAdapter: IHeritageRepository) {
    this.heritageRepository = _heritageAdapter;
  }

  public async addHeritage(
    data: CreateHeritage
  ): Promise<Heritage | ErrorMessage> {
    return await this.heritageRepository.addHeritage(data);
  }

  public async listHeritage(
    params: CommonParamsPaginate & ParamsHeritage
  ): Promise<{
    balances: ReportBalance;
    investments: ReportBalance;
    content: Heritage[];
    meta: Paginate;
  }> {
    return await this.heritageRepository.listHeritage(params);
  }

  public async updateHeritage(
    id: string,
    userId: string,
    heritage: Partial<CreateHeritage>
  ): Promise<Heritage | ErrorMessage> {
    return await this.heritageRepository.updateHeritage(id, userId, heritage);
  }

  public async detailHeritage(
    id: string,
    userId: string
  ): Promise<Heritage | null> {
    return await this.heritageRepository.detailHeritage(id, userId);
  }

  public async deleteHeritage(
    id: string,
    userId: string
  ): Promise<Heritage | null> {
    return await this.heritageRepository.deleteHeritage(id, userId);
  }

  public async importHeritages(userId: string): Promise<{
    heritageCount: number;
  }> {
    return await this.heritageRepository.importHeritages(userId);
  }

  public async yearHeritage(
    params: ParamsHeritage
  ): Promise<HeritageReport[] | null> {
    return await this.heritageRepository.yearHeritage(params);
  }
}
