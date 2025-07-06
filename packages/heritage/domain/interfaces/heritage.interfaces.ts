import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { Heritage, CreateHeritage } from "../heritage";

export interface IHeritageRepository {
  addHeritage(data: CreateHeritage): Promise<Heritage | ErrorMessage>;
  listHeritage(
    params: CommonParamsPaginate
  ): Promise<{ content: Heritage[]; meta: Paginate }>;
  updateHeritage(
    id: string,
    account: Partial<CreateHeritage>
  ): Promise<Heritage | ErrorMessage>;
  detailHeritage(id: string): Promise<Heritage | null>;
  deleteHeritage(id: string): Promise<Heritage | null>;
  importHeritages(): Promise<{
    heritageCount: number;
  }>;
}
