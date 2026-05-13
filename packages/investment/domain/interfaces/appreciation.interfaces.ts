import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { Appreciation, CreateAppreciation } from "../appreciation";

export interface IAppreciationRepository {
  addAppreciation(
    data: CreateAppreciation,
    userId: string
  ): Promise<Appreciation | ErrorMessage>;
  listAppreciation(
    params: CommonParamsPaginate,
    userId: string
  ): Promise<{ content: Appreciation[]; meta: Paginate }>;
  updateAppreciation(
    id: string,
    appreciationId: string,
    account: Partial<CreateAppreciation>,
    userId: string
  ): Promise<Appreciation | ErrorMessage>;
  detailAppreciation(id: string, userId: string): Promise<Appreciation | null>;
  deleteAppreciation(
    id: string,
    appreciationId: string,
    userId: string
  ): Promise<Appreciation | null>;
  importAppreciations(userId: string): Promise<{
    appreciationCount: number;
  }>;
}
