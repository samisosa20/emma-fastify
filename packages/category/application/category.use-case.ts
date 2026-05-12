import { ICategoryRepository } from "../domain/interfaces/category.interfaces";
import { Category, CreateCategory } from "../domain/category";
import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";

export class CategoryUseCase {
  private categoryRepository: ICategoryRepository;

  constructor(_categoryRepository: ICategoryRepository) {
    this.categoryRepository = _categoryRepository;
  }

  public async addCategory(
    data: CreateCategory,
    userId: string
  ): Promise<Category | ErrorMessage> {
    return await this.categoryRepository.addCategory(data, userId);
  }

  public async listCategories(
    params: CommonParamsPaginate,
    userId: string
  ): Promise<{ content: Category[]; meta: Paginate }> {
    return await this.categoryRepository.listCategories(params, userId);
  }

  public async updateCategory(
    id: string,
    category: Partial<Category>,
    userId: string
  ): Promise<Category | ErrorMessage> {
    return await this.categoryRepository.updateCategory(id, category, userId);
  }

  public async detailCategory(id: string, userId: string): Promise<Category | null> {
    return await this.categoryRepository.detailCategory(id, userId);
  }

  public async deleteCategory(id: string, userId: string): Promise<Category | null> {
    return await this.categoryRepository.deleteCategory(id, userId);
  }

  public async importCategories(
    userId: string,
    id?: string
  ): Promise<{ categoryCount: number }> {
    return await this.categoryRepository.importCategories(userId, id);
  }
}
