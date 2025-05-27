import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { GroupCategory, CreateGroupCategory } from "../groupCategory";

export interface IGroupCategoryRepository {
    addGroupCategory(data: CreateGroupCategory): Promise<GroupCategory | ErrorMessage>;
    listGroupCategory(
        params: CommonParamsPaginate
    ): Promise<{ content: GroupCategory[]; meta: Paginate }>;
    updateGroupCategory(
        id: string,
        groupCategory: Partial<CreateGroupCategory>
    ): Promise<GroupCategory | ErrorMessage>;
    detailGroupCategory(id: string): Promise<GroupCategory | null>;
    deleteGroupCategory(id: string): Promise<GroupCategory | null>;
}