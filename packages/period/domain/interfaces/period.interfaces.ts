import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { Period, CreatePeriod } from "../period";

export interface IPeriodRepository {
  addPeriod(data: CreatePeriod): Promise<Period | ErrorMessage>;
  listPeriod(
    params: CommonParamsPaginate
  ): Promise<{ content: Period[]; meta: Paginate }>;
  updatePeriod(
    id: string,
    account: Partial<CreatePeriod>
  ): Promise<Period | ErrorMessage>;
  detailPeriod(id: string): Promise<Period | null>;
  deletePeriod(id: string): Promise<Period | null>;
}
