import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import {
  Heritage,
  CreateHeritage,
  HeritageReport,
  ParamsHeritage,
} from "../heritage";
import { ReportBalance } from "packages/report/domain/report";

export interface IHeritageRepository {
  addHeritage(data: CreateHeritage): Promise<Heritage | ErrorMessage>;
  listHeritage(
    params: CommonParamsPaginate & ParamsHeritage
  ): Promise<{ balances: ReportBalance; content: Heritage[]; meta: Paginate }>;
  updateHeritage(
    id: string,
    account: Partial<CreateHeritage>
  ): Promise<Heritage | ErrorMessage>;
  detailHeritage(id: string): Promise<Heritage | null>;
  deleteHeritage(id: string): Promise<Heritage | null>;
  importHeritages(): Promise<{
    heritageCount: number;
  }>;
  yearHeritage(params: ParamsHeritage): Promise<HeritageReport[] | null>;
}
