import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { IPlannedPaymentRepository } from "../domain/interfaces/plannedPayment.interfaces";
import { PlannedPayment, CreatePlannedPayment } from "../domain/plannedPayment";

export class PlannedPaymentUseCase {
  private plannedPaymentRepository: IPlannedPaymentRepository;

  constructor(_plannedPaymentAdapter: IPlannedPaymentRepository) {
    this.plannedPaymentRepository = _plannedPaymentAdapter;
  }

  public async addPlannedPayment(
    data: CreatePlannedPayment
  ): Promise<PlannedPayment | ErrorMessage> {
    return await this.plannedPaymentRepository.addPlannedPayment(data);
  }

  public async listPlannedPayment(
    params: CommonParamsPaginate
  ): Promise<{ content: PlannedPayment[]; meta: Paginate }> {
    return await this.plannedPaymentRepository.listPlannedPayment(params);
  }

  public async updatePlannedPayment(
    id: string,
    userId: string,
    plannedPayment: Partial<CreatePlannedPayment>
  ): Promise<PlannedPayment | ErrorMessage> {
    return await this.plannedPaymentRepository.updatePlannedPayment(
      id,
      userId,
      plannedPayment
    );
  }

  public async detailPlannedPayment(
    id: string,
    userId: string
  ): Promise<PlannedPayment | null> {
    return await this.plannedPaymentRepository.detailPlannedPayment(id, userId);
  }

  public async deletePlannedPayment(
    id: string,
    userId: string
  ): Promise<PlannedPayment | null> {
    return await this.plannedPaymentRepository.deletePlannedPayment(id, userId);
  }

  public async importPlannedPayments(userId: string): Promise<{
    plannedPaymentCount: number;
  }> {
    return await this.plannedPaymentRepository.importPlannedPayments(userId);
  }
}
