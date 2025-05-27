import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { IBadgeRepository } from "../domain/interfaces/badge.interfaces";
import { Badge, CreateBadge } from "../domain/badge";

export class BadgeUseCase {
  private badgeRepository: IBadgeRepository;

  constructor(_badgeAdapter: IBadgeRepository) {
    this.badgeRepository = _badgeAdapter;
  }

  public async addBadge(
    data: CreateBadge
  ): Promise<Badge | ErrorMessage> {
    return await this.badgeRepository.addBadge(data);
  }

  public async listBadge(
    params: CommonParamsPaginate
  ): Promise<{ content: Badge[]; meta: Paginate }> {
    return await this.badgeRepository.listBadge(params);
  }

  public async updateBadge(
    id: string,
    badge: Partial<CreateBadge>
  ): Promise<Badge | ErrorMessage> {
    return await this.badgeRepository.updateBadge(id, badge);
  }

  public async detailBadge(id: string): Promise<Badge | null> {
    return await this.badgeRepository.detailBadge(id);
  }

  public async deleteBadge(id: string): Promise<Badge | null> {
    return await this.badgeRepository.deleteBadge(id);
  }
}