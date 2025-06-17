import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { Badge, CreateBadge } from "../badge";

export interface IBadgeRepository {
  addBadge(data: CreateBadge): Promise<Badge | ErrorMessage>;
  listBadge(
    params: CommonParamsPaginate
  ): Promise<{ content: Badge[]; meta: Paginate }>;
  updateBadge(
    id: string,
    account: Partial<CreateBadge>
  ): Promise<Badge | ErrorMessage>;
  detailBadge(id: string): Promise<Badge | null>;
  deleteBadge(id: string): Promise<Badge | null>;
  importCurrenciesAsBadges(): Promise<{
    badgeCount: number;
    accountTypeCount: number;
    periodCount: number;
    groupCategoryCount: number;
    message?: string;
  }>;
}
