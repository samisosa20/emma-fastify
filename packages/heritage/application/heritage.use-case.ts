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
  ): Promise<{ balances: ReportBalance; content: Heritage[]; meta: Paginate }> {
    return await this.heritageRepository.listHeritage(params);
  }

  public async updateHeritage(
    id: string,
    heritage: Partial<CreateHeritage>
  ): Promise<Heritage | ErrorMessage> {
    return await this.heritageRepository.updateHeritage(id, heritage);
  }

  public async detailHeritage(id: string): Promise<Heritage | null> {
    return await this.heritageRepository.detailHeritage(id);
  }

  public async deleteHeritage(id: string): Promise<Heritage | null> {
    return await this.heritageRepository.deleteHeritage(id);
  }

  public async importHeritages(): Promise<{
    heritageCount: number;
  }> {
    return await this.heritageRepository.importHeritages();
  }

  public async yearHeritage(
    params: ParamsHeritage
  ): Promise<HeritageReport[] | null> {
    return await this.heritageRepository.yearHeritage(params);
  }
}
