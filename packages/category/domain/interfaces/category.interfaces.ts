import { Category, CreateCategory } from "../category";
import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";

export interface ICategoryRepository {
  addCategory(
    category: CreateCategory,
    userId: string
  ): Promise<Category | ErrorMessage>;
  listCategories(
    params: CommonParamsPaginate,
    userId: string
  ): Promise<{ content: Category[]; meta: Paginate }>;
  updateCategory(
    id: string,
    category: Partial<CreateCategory>,
    userId: string
  ): Promise<Category | ErrorMessage>;
  detailCategory(id: string, userId: string): Promise<Category | null>;
  deleteCategory(id: string, userId: string): Promise<Category | null>;
  importCategories(
    userId: string,
    id?: string
  ): Promise<{ categoryCount: number }>;
}
