import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { IAccountRepository } from "../domain/interfaces/account.interfaces";
import { Account, CreateAccount } from "../domain/account";

export class AccountUseCase {
  private accountRepository: IAccountRepository;

  constructor(_accountAdapter: IAccountRepository) {
    this.accountRepository = _accountAdapter;
  }

  public async addAccount(
    data: CreateAccount
  ): Promise<Account | ErrorMessage> {
    return await this.accountRepository.addAccount(data);
  }

  public async listAccount(
    params: CommonParamsPaginate,
    userId: string
  ): Promise<{ content: Account[]; meta: Paginate }> {
    return await this.accountRepository.listAccount(params, userId);
  }

  public async updateAccount(
    id: string,
    account: Partial<CreateAccount>,
    userId: string
  ): Promise<Account | ErrorMessage> {
    return await this.accountRepository.updateAccount(id, account, userId);
  }
  public async detailAccount(
    id: string,
    userId: string
  ): Promise<Account | null> {
    return await this.accountRepository.detailAccount(id, userId);
  }
  public async deleteAccount(
    id: string,
    userId: string
  ): Promise<Account | null> {
    return await this.accountRepository.deleteAccount(id, userId);
  }
  public async desactivateAccount(
    id: string,
    userId: string
  ): Promise<Account | null> {
    return await this.accountRepository.desactivateAccount(id, userId);
  }
  public async restoreAccount(
    id: string,
    userId: string
  ): Promise<Account | null> {
    return await this.accountRepository.restoreAccount(id, userId);
  }
  public async importAccounts(userId: string): Promise<{
    accountCount: number;
  }> {
    return await this.accountRepository.importAccounts(userId);
  }
}
