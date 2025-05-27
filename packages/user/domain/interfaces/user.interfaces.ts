import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { User, CreateUser } from "../user";

export interface IUserRepository {
  listUser(
    params: CommonParamsPaginate
  ): Promise<{ content: Omit<User, "password">[]; meta: Paginate }>;
  addUser(user: CreateUser): Promise<Omit<User, "password"> | ErrorMessage>;
  updateUser(
    id: string,
    user: Omit<CreateUser, "password" | "email"> | Pick<User, "password">
  ): Promise<Omit<User, "password"> | ErrorMessage>;
  detailUser(id: string): Promise<Omit<User, "password"> | null>;
  deleteUser(id: string): Promise<Omit<User, "password"> | null>;
}
