import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { Appreciation, CreateAppreciation } from "../appreciation";

export interface IAppreciationRepository {
  addAppreciation(
    data: CreateAppreciation
  ): Promise<Appreciation | ErrorMessage>;
  listAppreciation(
    params: CommonParamsPaginate
  ): Promise<{ content: Appreciation[]; meta: Paginate }>;
  updateAppreciation(
    id: string,
    account: Partial<CreateAppreciation>
  ): Promise<Appreciation | ErrorMessage>;
  detailAppreciation(id: string): Promise<Appreciation | null>;
  deleteAppreciation(id: string): Promise<Appreciation | null>;
  importAppreciations(): Promise<{
    appreciationCount: number;
  }>;
}
