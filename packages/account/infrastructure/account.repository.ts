import { Decimal } from "@prisma/client/runtime/library";

import { Account, CreateAccount } from "../domain/account";
import { IAccountRepository } from "../domain/interfaces/account.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import {
  CommonParamsPaginate,
  Paginate,
  ErrorMessage,
  handleShowDeleteData,
} from "packages/shared";
import { APIResponse } from "packages/badge/infrastructure/badge.repository";

// Definimos un tipo que extiende Account para incluir la suma de los movimientos
export type AccountWithTotalMovements = Account & {
  balance: number;
};

type APIAccountResponse = {
  accounts: {
    name: string;
    description: string | null;
    init_amount: number;
    limit: number;
    type: {
      name: string;
    };
    currency: {
      code: string;
    };
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  }[];
};

export class AccountPrismaRepository implements IAccountRepository {
  public async addAccount(
    data: CreateAccount
  ): Promise<Account | ErrorMessage> {
    try {
      const { badgeId, typeId, userId, ...restData } = data;
      const newAccount = await prisma.account.create({
        data: {
          ...restData,
          badge: {
            connect: {
              id: data.badgeId,
            },
          },
          type: {
            connect: {
              id: data.typeId,
            },
          },
          user: {
            connect: {
              id: data.userId,
            },
          },
        },
        include: {
          badge: true,
          type: true,
        },
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

    let rawContent: (Account & { movements: { amount: Decimal | number }[] })[];
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
            movements: {
              select: {
                amount: true,
              },
            },
          },
        })
        .withPages({
          limit: effectiveSize,
          page: currentPage,
        });

      rawContent = content as (Account & {
        movements: { amount: Decimal | number }[];
      })[];

      metaResult = metaFromPrisma;
    } else {
      rawContent = (await prisma.account.findMany({
        include: {
          badge: true,
          type: true,
          movements: {
            select: {
              amount: true,
            },
          },
        },
      })) as (Account & { movements: { amount: Decimal | number }[] })[];

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
      const { badgeId, typeId, userId, ...restData } = data;
      const updatedAccount = await prisma.account.update({
        where: {
          id,
        },
        data: {
          ...restData,
          badge: {
            connect: {
              id: data.badgeId,
            },
          },
          type: {
            connect: {
              id: data.typeId,
            },
          },
        },
        include: {
          badge: true,
          type: true,
        },
      });
      return updatedAccount;
    } catch (error: any) {
      console.log(error);
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
      include: {
        badge: true,
        type: true,
      },
    });
    if (!account) {
      return null;
    }
    await prisma.account.delete({
      where: { id },
    });
    return account;
  }

  public async desactivateAccount(id: string): Promise<Account | null> {
    const account = await prisma.account.findUnique({
      where: { id },
    });
    if (!account) {
      return null;
    }
    return await prisma.account.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: {
        badge: true,
        type: true,
      },
    });
  }

  public async restoreAccount(id: string): Promise<Account | null> {
    const account = await prisma.account.findUnique({
      where: { id },
    });
    if (!account) {
      return null;
    }
    return await prisma.account.update({
      where: { id },
      data: { deletedAt: null },
      include: {
        badge: true,
        type: true,
      },
    });
  }

  public async importAccounts(): Promise<{
    accountCount: number;
  }> {
    try {
      // Validar que las variables de entorno esenciales estén definidas
      const apiProd = process.env.API_PROD;
      const apiEmail = process.env.API_EMAIL;
      const apiPassword = process.env.API_PASSWORD;
      const userId = process.env.USER_ID;

      if (!apiProd || !apiEmail || !apiPassword || !userId) {
        throw Object.assign(new Error("Missing API environment variables"), {
          statusCode: 500,
          error: "Configuration Error",
          message: "API_PROD, API_EMAIL, API_PASSWORD, or USER_ID are not set.",
        });
      }

      const loginResponse = await fetch(`${apiProd}/login`, {
        method: "POST",
        body: JSON.stringify({
          email: apiEmail,
          password: apiPassword,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        console.error(
          `API login failed: ${loginResponse.status} ${loginResponse.statusText}`,
          errorText
        );
        throw Object.assign(
          new Error(`API login failed: ${loginResponse.statusText}`),
          {
            statusCode: loginResponse.status,
            error: "API Error",
            message: `Failed to login to API: ${loginResponse.status} ${
              loginResponse.statusText
            }. ${errorText || ""}`.trim(),
          }
        );
      }

      const apiResponse: APIResponse = await loginResponse.json();
      const token = apiResponse.token;

      const accountsResponse = await fetch(`${apiProd}/accounts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!accountsResponse.ok) {
        const errorText = await accountsResponse.text();
        console.error(
          `API accounts fetch failed: ${accountsResponse.status} ${accountsResponse.statusText}`,
          errorText
        );
        throw Object.assign(
          new Error(
            `API accounts fetch failed: ${accountsResponse.statusText}`
          ),
          {
            statusCode: accountsResponse.status,
            error: "API Error",
            message: `Failed to fetch accounts from API: ${
              accountsResponse.status
            } ${accountsResponse.statusText}. ${errorText || ""}`.trim(),
          }
        );
      }

      // CORRECCIÓN: Usar accountsResponse.json() en lugar de loginResponse.json()
      const apiResponseAccount: APIAccountResponse =
        await accountsResponse.json();
      const oldAccounts = apiResponseAccount.accounts;

      // CORRECCIÓN: Usar Promise.all para manejar las promesas dentro del map
      const accountsToCreatePromises = oldAccounts.map(async (account) => {
        const type = await prisma.accountType.findFirst({
          where: {
            name: account.type.name,
          },
        });

        const badge = await prisma.badge.findFirst({
          where: {
            code: account.currency.code,
          },
        });

        // Manejar casos donde type o badge no se encuentren
        if (!type) {
          console.warn(
            `Account type '${account.type.name}' not found for account '${account.name}'. Skipping.`
          );
          return null; // O lanzar un error, dependiendo del comportamiento deseado
        }
        if (!badge) {
          console.warn(
            `Badge with code '${account.currency.code}' not found for account '${account.name}'. Skipping.`
          );
          return null; // O lanzar un error
        }

        return {
          name: account.name,
          description: account.description,
          badgeId: badge.id,
          initAmount: account.init_amount ?? 0,
          limit: account.limit ?? 0,
          typeId: type.id,
          userId: userId,
          createdAt: new Date(account.created_at),
          deletedAt: account.deleted_at ? new Date(account.deleted_at) : null,
        } as CreateAccount;
      });

      // Filtrar los resultados nulos si se omitieron algunas cuentas
      const accountsToCreate = (
        await Promise.all(accountsToCreatePromises)
      ).filter((account): account is CreateAccount => account !== null);

      const result = await prisma.account.createMany({
        data: accountsToCreate,
        skipDuplicates: true,
      });

      return {
        accountCount: result.count,
      };
    } catch (error: unknown) {
      // Cambiado a 'unknown' para un manejo de errores más seguro
      console.error("Error importing accounts:", error); // Mensaje de error más específico
      // Re-throw if it's already an error structured by this method or a Prisma known error with code
      if (
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        "error" in error
      ) {
        throw error;
      }

      // For other unexpected errors
      throw Object.assign(
        new Error((error as Error)?.message || "Account import process failed"),
        {
          statusCode: (error as any)?.statusCode || 500,
          error: (error as any)?.error || "Internal Server Error",
          message:
            (error as Error)?.message ||
            "An unexpected error occurred during account import.",
        }
      );
    }
  }
}
