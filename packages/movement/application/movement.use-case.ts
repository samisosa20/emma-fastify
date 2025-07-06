import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { IMovementRepository } from "../domain/interfaces/movement.interfaces";
import { Movement, CreateMovement } from "../domain/movement";

export class MovementUseCase {
  private badgeRepository: IMovementRepository;

  constructor(_badgeAdapter: IMovementRepository) {
    this.badgeRepository = _badgeAdapter;
  }

  public async addMovement(
    data: CreateMovement
  ): Promise<Movement | ErrorMessage> {
    return await this.badgeRepository.addMovement(data);
  }

  public async listMovement(
    params: CommonParamsPaginate
  ): Promise<{ content: Movement[]; meta: Paginate }> {
    return await this.badgeRepository.listMovement(params);
  }

  public async updateMovement(
    id: string,
    badge: Partial<CreateMovement>
  ): Promise<Movement | ErrorMessage> {
    return await this.badgeRepository.updateMovement(id, badge);
  }

  public async detailMovement(id: string): Promise<Movement | null> {
    return await this.badgeRepository.detailMovement(id);
  }

  public async deleteMovement(id: string): Promise<Movement | null> {
    return await this.badgeRepository.deleteMovement(id);
  }

  public async importMovements(): Promise<{ movementCount: number }> {
    return await this.badgeRepository.importMovements();
  }
}
