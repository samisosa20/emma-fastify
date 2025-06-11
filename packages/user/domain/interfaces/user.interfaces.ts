import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { User, CreateUser, UserLogin } from "../user";

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
  login(email: string, password: string): Promise<UserLogin | ErrorMessage>;
  emailConfirmation(
    email: string,
    token: string
  ): Promise<UserLogin | ErrorMessage>;
  sendEmailConfirmation(
    email: string
  ): Promise<{ token: string } | ErrorMessage>;
  recoveryPassword(email: string): Promise<ErrorMessage>;
}
