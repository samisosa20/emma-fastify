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
import { includes } from "zod";

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
      let categoryId = data.categoryId;
      let trm = 1;
      if (data.type === "transfer") {
        const transfer = await prisma.category.findFirst({
          where: {
            GroupCategory: {
              name: "Transferencia",
            },
          },
          include: {
            GroupCategory: true,
          },
        });

        if (transfer) {
          categoryId = transfer.id;
        }
        trm = Math.abs(Number(data.amount) / Number(data.amountEnd));
      }

      const newMovement = await prisma.movement.create({
        data: {
          amount: data.amount,
          datePurchase: data.datePurchase,
          description: data.description,
          user: {
            connect: {
              id: data.userId,
            },
          },
          account: {
            connect: {
              id: data.accountId,
            },
          },
          category: {
            connect: {
              id: categoryId,
            },
          },
          ...(data.eventId && {
            event: {
              connect: {
                id: data.eventId,
              },
            },
          }),
          ...(data.investmentId && {
            investment: {
              connect: {
                id: data.investmentId,
              },
            },
          }),
          ...(data.type === "transfer" && {
            trm,
          }),
        },
        include: {
          account: true,
          category: true,
          event: true,
          investment: true,
        },
      });

      if (newMovement && data.type === "transfer") {
        await prisma.movement.create({
          data: {
            amount: Number(data.amountEnd),
            datePurchase: data.datePurchase,
            description: data.description,
            user: {
              connect: {
                id: data.userId,
              },
            },
            account: {
              connect: {
                id: data.accountEndId,
              },
            },
            category: {
              connect: {
                id: categoryId,
              },
            },
            originalOrPairedMovement: {
              connect: { id: newMovement.id },
            },
            trm: Math.abs(Number(data.amountEnd) / Number(data.amount)),
          },
          include: {
            account: true,
            category: true,
          },
        });
      }

      return newMovement;
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
    const { deleted, size, page, category, ...restParams } = params;
    const [content, meta] = await prisma.movement
      .paginate({
        where: {
          ...restParams,
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
    data: Partial<CreateMovement>
  ): Promise<Movement | ErrorMessage> {
    try {
      let categoryId = data.categoryId;
      let trm = 1;

      const movement = await prisma.movement.findFirst({
        where: { id },
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

      const isTransferOut = movement.transferId === null;

      if (data.type === "transfer") {
        const transfer = await prisma.category.findFirst({
          where: {
            GroupCategory: {
              name: "Transferencia",
            },
          },
          include: {
            GroupCategory: true,
          },
        });

        if (transfer) {
          categoryId = transfer.id;
        }
        trm = isTransferOut
          ? Math.abs(Number(data.amount) / Number(data.amountEnd))
          : Math.abs(Number(data.amountEnd) / Number(data.amount));
      }

      const updatedMovement = await prisma.movement.update({
        where: {
          id,
        },
        data: {
          amount: isTransferOut ? data.amount : data.amountEnd,
          datePurchase: data.datePurchase,
          description: data.description,
          account: {
            connect: {
              id: isTransferOut ? data.accountId : data.accountEndId,
            },
          },
          category: {
            connect: {
              id: categoryId,
            },
          },
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
          ...(data.addWithdrawal && {
            addWithdrawal: data.addWithdrawal,
          }),
        },
        include: {
          account: true,
          category: true,
          event: true,
          investment: true,
        },
      });

      if (updatedMovement && data.type === "transfer") {
        let whereClause = undefined;
        if (!isTransferOut && movement.originalOrPairedMovement) {
          whereClause = { id: String(movement.originalOrPairedMovement.id) };
        } else {
          whereClause = { id: String(movement.relatedTransferMovements[0].id) };
        }
        await prisma.movement.update({
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
        });
      }
      return updatedMovement;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async detailMovement(
    id: string
  ): Promise<(Movement & TranferMovement) | null> {
    try {
      let movementAdjust: (Movement & TranferMovement) | null = null;
      const movement = await prisma.movement.findFirst({
        where: { id },
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

  public async deleteMovement(id: string): Promise<Movement | null> {
    const movement = await prisma.movement.findUnique({
      where: { id },
      include: {
        account: true,
        category: true,
        event: true,
        investment: true,
        originalOrPairedMovement: true,
        relatedTransferMovements: true,
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
      where: { OR: [whereClause, { id }] },
    });

    return movement;
  }

  public async importMovements(): Promise<{
    movementCount: number;
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

      // 3. Procesar los movimientos y prepararlos para la inserción masiva
      for (const movement of oldMovements) {
        // Lookup Account by name (assuming API ID is not directly usable as Prisma ID)
        const account = await prisma.account.findFirst({
          where: { name: movement.account.name },
        });
        if (!account) {
          console.warn(
            `Account '${movement.account.name}' not found for movement '${movement.description}'. Skipping this movement.`
          );
          continue;
        }

        // Lookup Category by name
        const category = await prisma.category.findFirst({
          where: { name: movement.category.name },
        });
        if (!category) {
          console.warn(
            `Category '${movement.category.name}' not found for movement '${movement.description}'. Skipping this movement.`
          );
          continue;
        }

        // Lookup Event (optional) by name
        let eventId: string | null = null;
        if (movement.event) {
          const event = await prisma.event.findFirst({
            where: { name: movement.event.name },
          });
          if (event) {
            eventId = event.id;
          } else {
            console.warn(
              `Event '${movement.event.name}' not found for movement '${movement.description}'. Skipping event association.`
            );
            continue;
          }
        }

        // Lookup Event (optional) by name
        let investmentId: string | null = null;
        if (movement.investment) {
          const investment = await prisma.investment.findFirst({
            where: { name: movement.investment.name },
          });
          if (investment) {
            investmentId = investment.id;
          } else {
            console.warn(
              `Event '${movement.investment.name}' not found for movement '${movement.description}'. Skipping investment association.`
            );
            continue;
          }
        }

        // Lookup TransferIn (optional, and complex due to ID mismatch and potential uniqueness issues)
        // This assumes that the transfer_in movement has already been imported
        // and can be uniquely identified by its description and date_purchase.
        // For a more robust solution, consider adding an 'externalId: Int? @unique' field
        // to your Prisma Movement model to store the API's 'id'.
        let transferInId: string | null = null;
        if (movement.transfer_out) {
          const accountTransfer = await prisma.account.findFirst({
            where: { name: movement.transfer_out.account.name },
          });
          if (!accountTransfer) {
            console.warn(
              `Account '${movement.account.name}' not found for movement '${movement.description}'. Skipping this movement.`
            );
            continue;
          }
          const transferInMovement = await prisma.movement.findFirst({
            where: {
              datePurchase: new Date(movement.transfer_out.date_purchase),
              accountId: accountTransfer.id,
              categoryId: category.id,
              amount: movement.transfer_out.amount,
            },
          });
          if (transferInMovement) {
            transferInId = transferInMovement.id;
          } else {
            console.warn(
              `TransferIn movement '${movement.id}' on '${movement.transfer_out.date_purchase}' not found. Skipping transferIn association.`
            );
            //continue;
          }
        }

        const data = {
          description: movement.description,
          amount: movement.amount,
          datePurchase: new Date(movement.date_purchase),
          trm: movement.trm,
          addWithdrawal: movement.add_withdrawal,
          accountId: account.id,
          categoryId: category.id,
          eventId: eventId,
          transferId: transferInId,
          userId: userId,
          investmentId: investmentId,
          createdAt: new Date(movement.created_at),
          updatedAt: new Date(movement.updated_at),
        } as Omit<CreateMovement, "type">;

        const move = await prisma.movement.create({
          data,
        });
        if (move) {
          count++;
        }
      }
      return {
        movementCount: count,
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
