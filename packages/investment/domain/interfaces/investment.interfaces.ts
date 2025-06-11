import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { Investment, CreateInvestment } from "../investment";

export interface IInvestmentRepository {
  addInvestment(data: CreateInvestment): Promise<Investment | ErrorMessage>;
  listInvestment(
    params: CommonParamsPaginate
  ): Promise<{ content: Investment[]; meta: Paginate }>;
  updateInvestment(
    id: string,
    account: Partial<CreateInvestment>
  ): Promise<Investment | ErrorMessage>;
  detailInvestment(id: string): Promise<Investment | null>;
  deleteInvestment(id: string): Promise<Investment | null>;
}
