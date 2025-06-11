import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { IPlannedPaymentRepository } from "../domain/interfaces/plannedPayment.interfaces";
import { PlannedPayment, CreatePlannedPayment } from "../domain/plannedPayment";

export class PlannedPaymentUseCase {
  private badgeRepository: IPlannedPaymentRepository;

  constructor(_badgeAdapter: IPlannedPaymentRepository) {
    this.badgeRepository = _badgeAdapter;
  }

  public async addPlannedPayment(
    data: CreatePlannedPayment
  ): Promise<PlannedPayment | ErrorMessage> {
    return await this.badgeRepository.addPlannedPayment(data);
  }

  public async listPlannedPayment(
    params: CommonParamsPaginate
  ): Promise<{ content: PlannedPayment[]; meta: Paginate }> {
    return await this.badgeRepository.listPlannedPayment(params);
  }

  public async updatePlannedPayment(
    id: string,
    badge: Partial<CreatePlannedPayment>
  ): Promise<PlannedPayment | ErrorMessage> {
    return await this.badgeRepository.updatePlannedPayment(id, badge);
  }

  public async detailPlannedPayment(
    id: string
  ): Promise<PlannedPayment | null> {
    return await this.badgeRepository.detailPlannedPayment(id);
  }

  public async deletePlannedPayment(
    id: string
  ): Promise<PlannedPayment | null> {
    return await this.badgeRepository.deletePlannedPayment(id);
  }
}
