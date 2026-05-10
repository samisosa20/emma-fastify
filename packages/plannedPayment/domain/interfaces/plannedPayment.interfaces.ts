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
    userId: string,
    account: Partial<CreatePlannedPayment>
  ): Promise<PlannedPayment | ErrorMessage>;
  detailPlannedPayment(id: string, userId: string): Promise<PlannedPayment | null>;
  deletePlannedPayment(id: string, userId: string): Promise<PlannedPayment | null>;
  importPlannedPayments(userId: string): Promise<{ plannedPaymentCount: number }>;
}
