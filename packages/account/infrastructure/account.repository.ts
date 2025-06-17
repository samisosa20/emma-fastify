import { Account, CreateAccount } from "../domain/account";
import { IAccountRepository } from "../domain/interfaces/account.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import {
  CommonParamsPaginate,
  Paginate,
  ErrorMessage,
  handleShowDeleteData,
} from "packages/shared";
import { Movement } from "packages/movement/domain/movement";

// Definimos un tipo que extiende Account para incluir la suma de los movimientos
export type AccountWithTotalMovements = Account & {
  balance: number;
};

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
  ): Promise<{ content: AccountWithTotalMovements[]; meta: Paginate }> {
    const { size, page: pageParam, deleted } = params;

    const shouldPaginate = pageParam && Number(pageParam) > 0;

    let rawContent: (Account & { movements: Movement[] })[]; // Tipo para el contenido antes de procesar
    let metaResult: Paginate;

    if (shouldPaginate) {
      const currentPage = Number(pageParam);
      const effectiveSize = size && Number(size) > 0 ? Number(size) : 10;

      const [content, metaFromPrisma] = await prisma.account
        .paginate({
          where: {
            OR: handleShowDeleteData(deleted === "1"),
          },
          include: {
            badge: true,
            type: true,
            movements: true,
          },
        })
        .withPages({
          limit: effectiveSize,
          page: currentPage,
        });

      rawContent = content as (Account & { movements: Movement[] })[];
      metaResult = metaFromPrisma;
    } else {
      rawContent = (await prisma.account.findMany({
        include: {
          badge: true,
          type: true,
          movements: true,
        },
      })) as (Account & { movements: Movement[] })[];

      const totalCount = rawContent.length;
      const meta: Paginate = {
        isFirstPage: totalCount > 0,
        isLastPage: totalCount > 0,
        currentPage: totalCount > 0 ? 1 : 0,
        previousPage: null,
        nextPage: null,
        pageCount: totalCount > 0 ? 1 : 0,
        totalCount: totalCount,
      };

      metaResult = meta;
    }

    // Calcular la sumatoria de los movements para cada account
    const processedContent: AccountWithTotalMovements[] = rawContent.map(
      (account) => {
        const balance = account.movements.reduce(
          (sum, movement) => sum + Number(movement.amount || 0),
          Number(account.initAmount || 0)
        );
        return { ...account, balance };
      }
    );

    return { content: processedContent, meta: metaResult };
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

  public async detailAccount(
    id: string
  ): Promise<AccountWithTotalMovements | null> {
    try {
      const accountData = await prisma.account.findFirst({
        where: { id },
        include: {
          badge: true,
          type: true,
          movements: true,
        },
      });

      if (!accountData) {
        return null;
      }

      const accountWithBalance: AccountWithTotalMovements = {
        ...accountData,
        balance: (accountData.movements || []).reduce(
          (sum, movement) => sum + Number(movement.amount || 0),
          Number(accountData.initAmount || 0)
        ),
      };

      return accountWithBalance;
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
