import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { AccountType, CreateAccountType } from "../accountType";

export interface IAccountTypeRepository {
    addAccountType(data: CreateAccountType): Promise<AccountType | ErrorMessage>;
    listAccountType(
        params: CommonParamsPaginate
    ): Promise<{ content: AccountType[]; meta: Paginate }>;
    updateAccountType(
        id: string,
        account: Partial<CreateAccountType>
    ): Promise<AccountType | ErrorMessage>;
    detailAccountType(id: string): Promise<AccountType | null>;
    deleteAccountType(id: string): Promise<AccountType | null>;
}