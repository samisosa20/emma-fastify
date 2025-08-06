import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { Movement, CreateMovement, MovementsParams } from "../movement";

export interface IMovementRepository {
  addMovement(data: CreateMovement): Promise<Movement | ErrorMessage>;
  listMovement(
    params: CommonParamsPaginate & MovementsParams
  ): Promise<{ content: Movement[]; meta: Paginate }>;
  updateMovement(
    id: string,
    account: Partial<CreateMovement>
  ): Promise<Movement | ErrorMessage>;
  detailMovement(id: string): Promise<Movement | null>;
  deleteMovement(id: string): Promise<Movement | null>;
  importMovements(): Promise<{ movementCount: number }>;
}
