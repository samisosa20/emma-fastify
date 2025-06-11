import { AccountType, CreateAccountType } from "../domain/accountType";
import { IAccountTypeRepository } from "../domain/interfaces/accountType.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import {
  CommonParamsPaginate,
  Paginate,
  ErrorMessage,
  handleShowDeleteData,
} from "packages/shared";

export class AccountTypePrismaRepository implements IAccountTypeRepository {
  public async addAccountType(
    data: CreateAccountType
  ): Promise<AccountType | ErrorMessage> {
    try {
      const newAccountType = await prisma.accountType.create({
        data,
      });
      return newAccountType;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async listAccountType(
    params: CommonParamsPaginate
  ): Promise<{ content: AccountType[]; meta: Paginate }> {
    const { deleted, size, page } = params;
    const [content, meta] = await prisma.account
      .paginate({
        where: {
          OR: handleShowDeleteData(deleted === "1"),
        },
      })
      .withPages({
        limit: size ? Number(size) : 10,
        page: page && page > 0 ? Number(page) : 1,
      });

    return {
      content,
      meta,
    };
  }

  public async updateAccountType(
    id: string,
    data: Partial<CreateAccountType>
  ): Promise<AccountType | ErrorMessage> {
    try {
      const updatedAccountType = await prisma.accountType.update({
        where: {
          id,
        },
        data,
      });
      return updatedAccountType;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async detailAccountType(id: string): Promise<AccountType | null> {
    try {
      return await prisma.accountType.findUnique({
        where: { id },
      });
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async deleteAccountType(id: string): Promise<AccountType | null> {
    const account = await prisma.accountType.findUnique({
      where: { id },
    });
    if (!account) {
      return null;
    }
    return await prisma.accountType.delete({
      where: { id },
    });
  }
}
