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
        data: {
          name: data.name,
        },
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
    const { size, page: pageParam } = params;

    const shouldPaginate = pageParam && Number(pageParam) > 0;

    if (shouldPaginate) {
      const currentPage = Number(pageParam);
      const effectiveSize = size && Number(size) > 0 ? Number(size) : 10;

      const [content, metaFromPrisma] = await prisma.accountType
        .paginate()
        .withPages({
          limit: effectiveSize,
          page: currentPage,
        });

      return {
        content,
        meta: metaFromPrisma,
      };
    } else {
      const content = await prisma.accountType.findMany();

      const totalCount = content.length;
      const meta: Paginate = {
        isFirstPage: totalCount > 0,
        isLastPage: totalCount > 0,
        currentPage: totalCount > 0 ? 1 : 0,
        previousPage: null,
        nextPage: null,
        pageCount: totalCount > 0 ? 1 : 0,
        totalCount: totalCount,
      };

      return {
        content,
        meta,
      };
    }
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
        data: {
          ...(data.name && { name: data.name }),
        },
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
