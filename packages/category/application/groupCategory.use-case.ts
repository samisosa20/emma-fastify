import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { IGroupCategoryRepository } from "../domain/interfaces/groupCategory.interfaces";
import { GroupCategory, CreateGroupCategory } from "../domain/groupCategory";

export class GroupCategoryUseCase {
  private groupCategoryRepository: IGroupCategoryRepository;

  constructor(_groupCategoryAdapter: IGroupCategoryRepository) {
    this.groupCategoryRepository = _groupCategoryAdapter;
  }

  public async addGroupCategory(
    data: CreateGroupCategory
  ): Promise<GroupCategory | ErrorMessage> {
    return await this.groupCategoryRepository.addGroupCategory(data);
  }

  public async listGroupCategory(
    params: CommonParamsPaginate
  ): Promise<{ content: GroupCategory[]; meta: Paginate }> {
    return await this.groupCategoryRepository.listGroupCategory(params);
  }

  public async updateGroupCategory(
    id: string,
    groupCategory: CreateGroupCategory
  ): Promise<GroupCategory | ErrorMessage> {
    return await this.groupCategoryRepository.updateGroupCategory(id, groupCategory);
  }
  public async detailGroupCategory(id: string): Promise<GroupCategory | null> {
    return await this.groupCategoryRepository.detailGroupCategory(id);
  }
  public async deleteGroupCategory(id: string): Promise<GroupCategory | null> {
    return await this.groupCategoryRepository.deleteGroupCategory(id);
  }
}