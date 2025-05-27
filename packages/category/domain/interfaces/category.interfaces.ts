import { Category, CreateCategory } from '../category';
import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";


export interface ICategoryRepository {
  addCategory(category: CreateCategory): Promise<Category | ErrorMessage>;
  listCategories(
    params: CommonParamsPaginate
  ): Promise<{ content: Category[]; meta: Paginate }>;
  updateCategory(
    id: string,
    category: Partial<CreateCategory>
  ): Promise<Category | ErrorMessage>;
  detailCategory(id: string): Promise<Category | null>;
  deleteCategory(id: string): Promise<Category | null>;
}