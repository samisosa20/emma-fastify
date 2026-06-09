import {
  Movement,
  CreateMovement,
  MovementsParams,
  TranferMovement,
} from "../domain/movement";
import { IMovementRepository } from "../domain/interfaces/movement.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import {
  CommonParamsPaginate,
  Paginate,
  ErrorMessage,
  handleShowDeleteData,
} from "packages/shared";
import { APIResponse } from "packages/badge/infrastructure/badge.repository"; // Asumiendo APIResponse para el token
import { randomUUID } from "node:crypto";

// Define el tipo para un solo objeto de movimiento de la API externa
interface APIMovementsResponse {
  id: number; // API's internal ID, might not match local Prisma ID
  name: string;
  description: string | null;
  amount: number;
  trm: number;
  date_purchase: string; // This will map to 'date' in CreateMovement
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  add_withdrawal: boolean;
  account: {
    id: number; // API's internal ID
    name: string;
  };
  category: {
    id: number; // API's internal ID
    name: string;
  };
  event: {
    id: number; // API's internal ID
    name: string;
  } | null;
  investment: {
    id: number; // API's internal ID
    name: string;
  } | null;
  transfer_out: any | null; // Not mapping this for now, assuming it's not a FK to local Movement
  transfer_in: {
    // This is a nested movement, needs to be looked up
    id: number; // API's internal ID of the related movement
    description: string | null;
    amount: number;
    trm: number;
    date_purchase: string;
    created_at: string;
    updated_at: string;
    add_withdrawal: boolean;
    account: { id: number; name: string };
    category: { id: number; name: string }; // Assuming it also has category
    event: { id: number; name: string } | null; // Assuming it also has event
  } | null;
}

export class MovementPrismaRepository implements IMovementRepository {
  public async addMovement(
    data: CreateMovement
  ): Promise<Movement | ErrorMessage> {
    try {
      // ⚡ Bolt: Parallelize all prerequisite lookups (ownership checks and transfer metadata)
      // to reduce database roundtrips and minimize latency during movement creation.
      const [account, category, event, investment, accountEnd, transferCategory] =
        await Promise.all([
          prisma.account.findFirst({
            where: { id: data.accountId, userId: data.userId },
          }),
          prisma.category.findFirst({
            where: { id: data.categoryId, userId: data.userId },
          }),
          data.eventId
            ? prisma.event.findFirst({
                where: { id: data.eventId, userId: data.userId },
              })
            : Promise.resolve(true),
          data.investmentId
            ? prisma.investment.findFirst({
                where: { id: data.investmentId, userId: data.userId },
              })
            : Promise.resolve(true),
          data.type === "transfer" && data.accountEndId
            ? prisma.account.findFirst({
                where: { id: data.accountEndId, userId: data.userId },
              })
            : Promise.resolve(true),
          data.type === "transfer"
            ? prisma.category.findFirst({
                where: {
                  GroupCategory: { name: "Transferencia" },
                  userId: data.userId,
                },
              })
            : Promise.resolve(null),
        ]);

      // Security: Return Forbidden error if any resource ownership check fails to prevent IDOR.
      // We check existance only when the field is provided.
      if (!account || !category || !event || !investment || !accountEnd) {
        return {
          statusCode: 403,
          error: "Forbidden",
          message: "Unauthorized resource access",
        };
      }

      let categoryId = data.categoryId;
      let trm = 1;

      if (data.type === "transfer") {
        // Fail secure: ensure the default 'Transferencia' category exists before proceeding.
        if (!transferCategory) {
          return {
            statusCode: 400,
            error: "Bad Request",
            message:
              "System-default 'Transferencia' category not found for user.",
          };
        }
        categoryId = transferCategory.id;
        trm = Math.abs(Number(data.amount) / Number(data.amountEnd));
      }

      // ⚡ Bolt: Use a transaction to ensure atomicity and reduce database roundtrips.
      // For transfers, we use an interactive transaction to link movements without manual ID generation.
      const result = await prisma.$transaction(async (tx) => {
        const newMovement = await tx.movement.create({
          data: {
            amount: data.amount,
            datePurchase: data.datePurchase,
            description: data.description,
            user: { connect: { id: data.userId } },
            account: { connect: { id: data.accountId } },
            category: { connect: { id: categoryId } },
            ...(data.eventId && { event: { connect: { id: data.eventId } } }),
            ...(data.investmentId && {
              investment: { connect: { id: data.investmentId } },
            }),
            ...(data.type === "transfer" && { trm }),
          },
          include: {
            account: true,
            category: true,
            event: true,
            investment: true,
          },
        });

        if (data.type === "transfer") {
          await tx.movement.create({
            data: {
              amount: Number(data.amountEnd),
              datePurchase: data.datePurchase,
              description: data.description,
              user: { connect: { id: data.userId } },
              account: { connect: { id: data.accountEndId } },
              category: { connect: { id: categoryId } },
              originalOrPairedMovement: { connect: { id: newMovement.id } },
              trm: Math.abs(Number(data.amountEnd) / Number(data.amount)),
            },
          });
        }

        return newMovement;
      });

      return result;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async listMovement(
    params: CommonParamsPaginate & MovementsParams
  ): Promise<{ content: Movement[]; meta: Paginate }> {
    const { deleted, size, page, category, userId, ...restParams } = params;
    const [content, meta] = await prisma.movement
      .paginate({
        where: {
          ...restParams,
          userId,
        },
        include: {
          event: true,
          account: {
            include: {
              badge: true,
            },
          },
          category: true,
          investment: true,
        },
        orderBy: {
          datePurchase: "desc",
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

  public async updateMovement(
    id: string,
    userId: string,
    data: Partial<CreateMovement>
  ): Promise<Movement | ErrorMessage> {
    try {
      let categoryId = data.categoryId;
      let trm = 1;

      const movement = await prisma.movement.findFirst({
        where: { id, userId },
        include: {
          originalOrPairedMovement: true,
          relatedTransferMovements: true,
        },
      });

      if (!movement) {
        throw Object.assign(new Error("Movement not found"), {
          statusCode: 404,
          error: "Not Found",
          message: "Movement not found",
        });
      }

      // ⚡ Bolt: Consolidate all resource ownership checks and transfer-specific metadata lookups
      // into a single Promise.all call to minimize total database roundtrips during updates.
      const [
        accountCheck,
        categoryCheck,
        eventCheck,
        investmentCheck,
        accountEnd,
        transferCategory,
      ] = await Promise.all([
        data.accountId
          ? prisma.account.findFirst({ where: { id: data.accountId, userId } })
          : Promise.resolve(true),
        data.categoryId
          ? prisma.category.findFirst({ where: { id: data.categoryId, userId } })
          : Promise.resolve(true),
        data.eventId
          ? prisma.event.findFirst({ where: { id: data.eventId, userId } })
          : Promise.resolve(true),
        data.investmentId
          ? prisma.investment.findFirst({
              where: { id: data.investmentId, userId },
            })
          : Promise.resolve(true),
        data.type === "transfer" && data.accountEndId
          ? prisma.account.findFirst({
              where: { id: data.accountEndId, userId },
            })
          : Promise.resolve(true),
        data.type === "transfer"
          ? prisma.category.findFirst({
              where: {
                GroupCategory: { name: "Transferencia" },
                userId,
              },
            })
          : Promise.resolve(null),
      ]);

      if (
        !accountCheck ||
        !categoryCheck ||
        !eventCheck ||
        !investmentCheck ||
        !accountEnd
      ) {
        throw Object.assign(new Error("Unauthorized resource access"), {
          statusCode: 403,
          error: "Forbidden",
          message: "Unauthorized resource access",
        });
      }

      const isTransferOut = movement.transferId === null;

      if (data.type === "transfer") {
        if (transferCategory) {
          categoryId = transferCategory.id;
        } else if (data.categoryId) {
          categoryId = data.categoryId;
        } else {
          // Fail secure: if it's a transfer and no transfer category or provided category exists, throw error
          throw Object.assign(new Error("Transfer category not found"), {
            statusCode: 400,
            error: "Bad Request",
            message: "A category is required for transfers.",
          });
        }
        trm = isTransferOut
          ? Math.abs(Number(data.amount) / Number(data.amountEnd))
          : Math.abs(Number(data.amountEnd) / Number(data.amount));
      }

      const primaryUpdate = prisma.movement.update({
        where: { id },
        data: {
          amount: isTransferOut ? data.amount : data.amountEnd,
          datePurchase: data.datePurchase,
          description: data.description,
          account: {
            connect: { id: isTransferOut ? data.accountId : data.accountEndId },
          },
          category: { connect: { id: categoryId } },
          event:
            data.eventId === null
              ? { disconnect: true }
              : data.eventId
              ? { connect: { id: data.eventId } }
              : undefined,
          investment:
            data.investmentId === null
              ? { disconnect: true }
              : data.investmentId
              ? { connect: { id: data.investmentId } }
              : undefined,
          trm,
          ...(data.addWithdrawal && { addWithdrawal: data.addWithdrawal }),
        },
        include: {
          account: true,
          category: true,
          event: true,
          investment: true,
        },
      });

      if (data.type === "transfer") {
        let whereClause = undefined;
        if (!isTransferOut && movement.originalOrPairedMovement) {
          whereClause = { id: String(movement.originalOrPairedMovement.id) };
        } else {
          whereClause = { id: String(movement.relatedTransferMovements[0].id) };
        }

        // ⚡ Bolt: Use a batch transaction to perform both updates in a single roundtrip,
        // ensuring atomicity and reducing overall latency.
        const [updatedMovement] = await prisma.$transaction([
          primaryUpdate,
          prisma.movement.update({
            where: whereClause,
            data: {
              amount: !isTransferOut ? data.amount : data.amountEnd,
              datePurchase: data.datePurchase,
              description: data.description,
              account: {
                connect: {
                  id: !isTransferOut ? data.accountId : data.accountEndId,
                },
              },
              trm: !isTransferOut
                ? Math.abs(Number(data.amountEnd) / Number(data.amount))
                : Math.abs(Number(data.amount) / Number(data.amountEnd)),
            },
          }),
        ]);
        return updatedMovement;
      }

      return await primaryUpdate;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async detailMovement(
    id: string,
    userId: string
  ): Promise<(Movement & TranferMovement) | null> {
    try {
      let movementAdjust: (Movement & TranferMovement) | null = null;
      const movement = await prisma.movement.findFirst({
        where: { id, userId },
        include: {
          account: true,
          category: true,
          event: true,
          investment: true,
          relatedTransferMovements: {
            select: {
              id: true,
              amount: true,
              account: {
                select: {
                  id: true,
                  name: true,
                  badgeId: true,
                },
              },
            },
          },
          originalOrPairedMovement: {
            select: {
              id: true,
              amount: true,
              account: {
                select: {
                  id: true,
                  name: true,
                  badgeId: true,
                },
              },
            },
          },
        },
      });

      if (movement) {
        const { originalOrPairedMovement, relatedTransferMovements, ...res } =
          movement;
        movementAdjust = { ...res, transferIn: {}, transferOut: {} };
        movementAdjust.transferOut = movement?.originalOrPairedMovement ?? {};
        movementAdjust.transferIn = movement?.relatedTransferMovements[0] ?? {};
      }

      return movementAdjust;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async deleteMovement(
    id: string,
    userId: string
  ): Promise<Movement | null> {
    // ⚡ Bolt: Use a targeted select instead of heavy includes to avoid 4 unnecessary joins
    // and reduce database load when deleting a movement.
    const movement = await prisma.movement.findFirst({
      where: { id, userId },
      select: {
        id: true,
        accountId: true,
        categoryId: true,
        description: true,
        amount: true,
        trm: true,
        datePurchase: true,
        transferId: true,
        eventId: true,
        investmentId: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        addWithdrawal: true,
        originalOrPairedMovement: {
          select: { id: true },
        },
        relatedTransferMovements: {
          select: { id: true },
        },
      },
    });
    if (!movement) {
      return null;
    }

    const isTransferOut = movement.transferId === null;
    let whereClause = undefined;
    if (!isTransferOut && movement.originalOrPairedMovement) {
      whereClause = { id: String(movement.originalOrPairedMovement?.id) };
    } else {
      whereClause = { id: String(movement.relatedTransferMovements[0]?.id) };
    }
    await prisma.movement.deleteMany({
      where: {
        userId,
        OR: [whereClause, { id }],
      },
    });

    return movement;
  }

  public async importMovements(userId: string): Promise<{
    movementCount: number;
  }> {
    try {
      // Validar que las variables de entorno esenciales estén definidas
      const apiProd = process.env.API_PROD;
      const apiEmail = process.env.API_EMAIL;
      const apiPassword = process.env.API_PASSWORD;

      if (!apiProd || !apiEmail || !apiPassword || !userId) {
        throw Object.assign(new Error("Missing API environment variables"), {
          statusCode: 500,
          error: "Configuration Error",
          message: "API_PROD, API_EMAIL, API_PASSWORD, or userId are not set.",
        });
      }

      // 1. Iniciar sesión para obtener el token
      const loginResponse = await fetch(`${apiProd}/login`, {
        method: "POST",
        body: JSON.stringify({
          email: apiEmail,
          password: apiPassword,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000), // Security: Prevent hanging process
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

      // 2. Obtener los movimientos de la API externa
      const movementsResponse = await fetch(`${apiProd}/movements`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(5000), // Security: Prevent hanging process
      });

      if (!movementsResponse.ok) {
        const errorText = await movementsResponse.text();
        console.error(
          `API movements fetch failed: ${movementsResponse.status} ${movementsResponse.statusText}`,
          errorText
        );
        throw Object.assign(
          new Error(
            `API movements fetch failed: ${movementsResponse.statusText}`
          ),
          {
            statusCode: movementsResponse.status,
            error: "API Error",
            message: `Failed to fetch movements from API: ${
              movementsResponse.status
            } ${movementsResponse.statusText}. ${errorText || ""}`.trim(),
          }
        );
      }

      const oldMovements: APIMovementsResponse[] =
        await movementsResponse.json();

      let count = 0;

      // ⚡ Bolt: Bulk fetch all metadata for the user in parallel to eliminate N+1 queries in the loop.
      const [userAccounts, userCategories, userEvents, userInvestments] =
        await Promise.all([
          prisma.account.findMany({ where: { userId } }),
          prisma.category.findMany({ where: { userId } }),
          prisma.event.findMany({ where: { userId } }),
          prisma.investment.findMany({ where: { userId } }),
        ]);

      // ⚡ Bolt: Use Hash Maps for O(1) in-memory lookups instead of sequential database calls.
      const accountsMap = new Map(userAccounts.map((a) => [a.name, a]));
      const categoriesMap = new Map(userCategories.map((c) => [c.name, c]));
      const eventsMap = new Map(userEvents.map((e) => [e.name, e]));
      const investmentsMap = new Map(userInvestments.map((i) => [i.name, i]));

      // ⚡ Bolt: Use createMany for bulk insertion. Pre-generate UUIDs to handle transfer pairing in-memory.
      // This reduces database roundtrips from N to 1, significantly improving import performance.
      const movementsToCreate: any[] = [];
      const fingerprintsMap = new Map<string, string>(); // fingerprint -> generated ID

      // ⚡ Bolt: Pass 1: Pre-parse dates and generate fingerprints using pre-calculated timestamps.
      // This eliminates redundant parsing and object allocations in the subsequent loop.
      for (const movement of oldMovements) {
        const account = accountsMap.get(movement.account.name);
        const category = categoriesMap.get(movement.category.name);
        if (!account || !category) continue;

        const datePurchase = new Date(movement.date_purchase);
        const id = randomUUID();
        const fingerprint = `${account.id}-${datePurchase.getTime()}-${
          movement.amount
        }-${category.id}`;
        fingerprintsMap.set(fingerprint, id);

        // Cache parsed dates and pre-generated ID on the object to reuse them in Pass 2.
        const movementAny = movement as any;
        movementAny.generatedId = id;
        movementAny.parsedDatePurchase = datePurchase;
        movementAny.parsedCreatedAt = new Date(movement.created_at);
        movementAny.parsedUpdatedAt = new Date(movement.updated_at);

        if (movement.transfer_out) {
          movementAny.parsedTransferOutDate = new Date(
            movement.transfer_out.date_purchase
          );
        }
      }

      // Pass 2: Build creation objects with paired transfer IDs in-memory.
      for (const movement of oldMovements) {
        const movementAny = movement as any;
        // Lookup Account by name
        const account = accountsMap.get(movement.account.name);
        if (!account) {
          console.warn(
            `Account '${movement.account.name}' not found for movement '${movement.description}'. Skipping.`
          );
          continue;
        }

        // Lookup Category by name
        const category = categoriesMap.get(movement.category.name);
        if (!category) {
          console.warn(
            `Category '${movement.category.name}' not found for movement '${movement.description}'. Skipping.`
          );
          continue;
        }

        // Lookup Event (optional) by name
        let eventId: string | null = null;
        if (movement.event) {
          const event = eventsMap.get(movement.event.name);
          if (event) {
            eventId = event.id;
          } else {
            console.warn(
              `Event '${movement.event.name}' not found for movement '${movement.description}'. Skipping event association.`
            );
          }
        }

        // Lookup Investment (optional) by name
        let investmentId: string | null = null;
        if (movement.investment) {
          const investment = investmentsMap.get(movement.investment.name);
          if (investment) {
            investmentId = investment.id;
          } else {
            console.warn(
              `Investment '${movement.investment.name}' not found for movement '${movement.description}'. Skipping investment association.`
            );
          }
        }

        // Lookup TransferIn (optional)
        let transferId: string | null = null;
        if (movement.transfer_out) {
          const accountTransfer = accountsMap.get(
            movement.transfer_out.account.name
          );
          if (accountTransfer) {
            // ⚡ Bolt: Link paired transfer movements in-memory using pre-generated UUIDs and cached dates.
            const searchKey = `${accountTransfer.id}-${movementAny.parsedTransferOutDate.getTime()}-${
              movement.transfer_out.amount
            }-${category.id}`;
            transferId = fingerprintsMap.get(searchKey) || null;
          }
        }

        movementsToCreate.push({
          id: movementAny.generatedId,
          description: movement.description,
          amount: movement.amount,
          datePurchase: movementAny.parsedDatePurchase,
          trm: movement.trm,
          addWithdrawal: movement.add_withdrawal,
          accountId: account.id,
          categoryId: category.id,
          eventId,
          transferId,
          userId,
          investmentId,
          createdAt: movementAny.parsedCreatedAt,
          updatedAt: movementAny.parsedUpdatedAt,
        });
      }

      const result = await prisma.movement.createMany({
        data: movementsToCreate,
        skipDuplicates: true,
      });

      return {
        movementCount: result.count,
      };
    } catch (error: unknown) {
      console.error("Error importing movements:", error);
      // Re-lanzar si ya es un error estructurado por este método o un error conocido de Prisma
      if (
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        "error" in error
      ) {
        throw error;
      }

      // Para otros errores inesperados
      throw Object.assign(
        new Error(
          (error as Error)?.message || "Movement import process failed"
        ),
        {
          statusCode: (error as any)?.statusCode || 500,
          error: (error as any)?.error || "Internal Server Error",
          message:
            (error as Error)?.message ||
            "An unexpected error occurred during movement import.",
        }
      );
    }
  }
}
