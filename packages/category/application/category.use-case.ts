import { ICategoryRepository } from "../domain/interfaces/category.interfaces";
import { Category, CreateCategory } from "../domain/category";
import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";

export class CategoryUseCase {
  private categoryRepository: ICategoryRepository;

  constructor(_categoryRepository: ICategoryRepository) {
    this.categoryRepository = _categoryRepository;
  }

  public async addCategory(
    data: CreateCategory
  ): Promise<Category | ErrorMessage> {
    return await this.categoryRepository.addCategory(data);
  }

  public async listCategories(
    params: CommonParamsPaginate
  ): Promise<{ content: Category[]; meta: Paginate }> {
    return await this.categoryRepository.listCategories(params);
  }

  public async updateCategory(
    id: string,
    category: Partial<Category>
  ): Promise<Category | ErrorMessage> {
    return await this.categoryRepository.updateCategory(id, category);
  }

  public async detailCategory(id: string): Promise<Category | null> {
    return await this.categoryRepository.detailCategory(id);
  }

  public async deleteCategory(id: string): Promise<Category | null> {
    return await this.categoryRepository.deleteCategory(id);
  }
}