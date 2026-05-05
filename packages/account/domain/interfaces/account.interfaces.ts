import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { Account, CreateAccount } from "../account";

export interface IAccountRepository {
  addAccount(data: CreateAccount): Promise<Account | ErrorMessage>;
  listAccount(
    params: CommonParamsPaginate,
    userId: string
  ): Promise<{ content: Account[]; meta: Paginate }>;
  updateAccount(
    id: string,
    account: Partial<CreateAccount>,
    userId: string
  ): Promise<Account | ErrorMessage>;
  detailAccount(id: string, userId: string): Promise<Account | null>;
  deleteAccount(id: string, userId: string): Promise<Account | null>;
  desactivateAccount(id: string, userId: string): Promise<Account | null>;
  restoreAccount(id: string, userId: string): Promise<Account | null>;
  importAccounts(userId: string): Promise<{
    accountCount: number;
  }>;
}
