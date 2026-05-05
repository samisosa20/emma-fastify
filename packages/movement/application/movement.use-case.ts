import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { IMovementRepository } from "../domain/interfaces/movement.interfaces";
import { Movement, CreateMovement, MovementsParams } from "../domain/movement";

export class MovementUseCase {
  private movementRepository: IMovementRepository;

  constructor(_movementAdapter: IMovementRepository) {
    this.movementRepository = _movementAdapter;
  }

  public async addMovement(
    data: CreateMovement
  ): Promise<Movement | ErrorMessage> {
    return await this.movementRepository.addMovement(data);
  }

  public async listMovement(
    params: CommonParamsPaginate & MovementsParams
  ): Promise<{ content: Movement[]; meta: Paginate }> {
    return await this.movementRepository.listMovement(params);
  }

  public async updateMovement(
    id: string,
    userId: string,
    data: Partial<CreateMovement>
  ): Promise<Movement | ErrorMessage> {
    return await this.movementRepository.updateMovement(id, userId, data);
  }

  public async detailMovement(
    id: string,
    userId: string
  ): Promise<Movement | null> {
    return await this.movementRepository.detailMovement(id, userId);
  }

  public async deleteMovement(
    id: string,
    userId: string
  ): Promise<Movement | null> {
    return await this.movementRepository.deleteMovement(id, userId);
  }

  public async importMovements(): Promise<{ movementCount: number }> {
    return await this.movementRepository.importMovements();
  }
}
