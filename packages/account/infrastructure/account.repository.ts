import { Account, CreateAccount } from '../domain/account';
import { IAccountRepository } from '../domain/interfaces/account.interfaces';

import prisma from "packages/shared/settings/prisma.client";
import { CommonParamsPaginate, Paginate, ErrorMessage, handleShowDeleteData } from 'packages/shared';

export class AccountPrismaRepository implements IAccountRepository {
  public async addAccount(
    data: CreateAccount
  ): Promise<Account | ErrorMessage> {
    try {
      const newAccount = await prisma.account.create({
        data,
      });
      return newAccount;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async listAccount(
    params: CommonParamsPaginate
  ): Promise<{ content: Account[]; meta: Paginate }> {
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

  public async updateAccount(
    id: string,
    data: Partial<CreateAccount>
  ): Promise<Account | ErrorMessage> {
    try {
      const updatedAccount = await prisma.account.update({
        where: {
          id,
          deletedAt: null,
        },
        data,
      });
      return updatedAccount;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async detailAccount(id: string): Promise<Account | null> {
    try {
      return await prisma.account.findUnique({
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

  public async deleteAccount(id: string): Promise<Account | null> {
    const account = await prisma.account.findUnique({
      where: { id },
    });
    if (!account) {
 return null;
    }
    return await prisma.account.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}