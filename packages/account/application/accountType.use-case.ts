import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { IAccountTypeRepository } from "../domain/interfaces/accountType.interfaces";
import { AccountType, CreateAccountType } from "../domain/accountType";

export class AccountTypeUseCase {
  private accountRepository: IAccountTypeRepository;

  constructor(_accountAdapter: IAccountTypeRepository) {
    this.accountRepository = _accountAdapter;
  }

  public async addAccountType(
    data: CreateAccountType
  ): Promise<AccountType | ErrorMessage> {
    return await this.accountRepository.addAccountType(data);
  }

  public async listAccountType(
    params: CommonParamsPaginate
  ): Promise<{ content: AccountType[]; meta: Paginate }> {
    return await this.accountRepository.listAccountType(params);
  }

  public async updateAccountType(
    id: string,
    account: Partial<CreateAccountType>
  ): Promise<AccountType | ErrorMessage> {
    return await this.accountRepository.updateAccountType(id, account);
  }
  public async detailAccountType(id: string): Promise<AccountType | null> {
    return await this.accountRepository.detailAccountType(id);
  }
  public async deleteAccountType(id: string): Promise<AccountType | null> {
    return await this.accountRepository.deleteAccountType(id);
  }
}
