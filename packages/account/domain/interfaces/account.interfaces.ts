import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { Account, CreateAccount } from "../account";

export interface IAccountRepository {
  addAccount(data: CreateAccount): Promise<Account | ErrorMessage>;
  listAccount(
    params: CommonParamsPaginate
  ): Promise<{ content: Account[]; meta: Paginate }>;
  updateAccount(
    id: string,
    account: Partial<CreateAccount>
  ): Promise<Account | ErrorMessage>;
  detailAccount(id: string): Promise<Account | null>;
  deleteAccount(id: string): Promise<Account | null>;
  desactivateAccount(id: string): Promise<Account | null>;
  restoreAccount(id: string): Promise<Account | null>;
  importAccounts(): Promise<{
    accountCount: number;
  }>;
}
