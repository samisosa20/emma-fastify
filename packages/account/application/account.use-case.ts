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
    params: CommonParamsPaginate
  ): Promise<{ content: Account[]; meta: Paginate }> {
    return await this.accountRepository.listAccount(params);
  }

  public async updateAccount(
    id: string,
    account: Partial<CreateAccount>
  ): Promise<Account | ErrorMessage> {
    return await this.accountRepository.updateAccount(id, account);
  }
  public async detailAccount(id: string): Promise<Account | null> {
    return await this.accountRepository.detailAccount(id);
  }
  public async deleteAccount(id: string): Promise<Account | null> {
    return await this.accountRepository.deleteAccount(id);
  }
  public async importAccounts(): Promise<{
    accountCount: number;
  }> {
    return await this.accountRepository.importAccounts();
  }
}
