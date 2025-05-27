import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { IUserRepository } from "../domain/interfaces/user.interfaces";
import { User, CreateUser } from "../domain/user";

export class UserUseCase {
  private userRepository: IUserRepository;

  constructor(_authAdapter: IUserRepository) {
    this.userRepository = _authAdapter;
  }

  public async addUser(
    data: CreateUser
  ): Promise<Omit<User, "password"> | ErrorMessage> {
    return await this.userRepository.addUser(data);
  }

  public async listUser(
    params: CommonParamsPaginate
  ): Promise<{ content: Omit<User, "password">[]; meta: Paginate }> {
    return await this.userRepository.listUser(params);
  }

  public async updateUser(
    id: string,
    user: Omit<CreateUser, "password" | "email"> | Pick<User, "password">
  ): Promise<Omit<User, "password"> | ErrorMessage> {
    return await this.userRepository.updateUser(id, user);
  }
  public async detailUser(id: string): Promise<Omit<User, "password"> | null> {
    return await this.userRepository.detailUser(id);
  }
  public async deleteUser(id: string): Promise<Omit<User, "password"> | null> {
    return await this.userRepository.deleteUser(id);
  }
}
