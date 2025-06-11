import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { PlannedPayment, CreatePlannedPayment } from "../plannedPayment";

export interface IPlannedPaymentRepository {
  addPlannedPayment(
    data: CreatePlannedPayment
  ): Promise<PlannedPayment | ErrorMessage>;
  listPlannedPayment(
    params: CommonParamsPaginate
  ): Promise<{ content: PlannedPayment[]; meta: Paginate }>;
  updatePlannedPayment(
    id: string,
    account: Partial<CreatePlannedPayment>
  ): Promise<PlannedPayment | ErrorMessage>;
  detailPlannedPayment(id: string): Promise<PlannedPayment | null>;
  deletePlannedPayment(id: string): Promise<PlannedPayment | null>;
}
