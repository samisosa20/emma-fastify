import { Event, CreateEvent, EventWithBalances } from "../domain/event";
import { IEventRepository } from "../domain/interfaces/event.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import { CommonParamsPaginate, Paginate, ErrorMessage } from "packages/shared";
import { APIResponse } from "packages/badge/infrastructure/badge.repository";
import { Decimal } from "@prisma/client/runtime/library";

type APIEventResponse = {
  name: string;
  end_event: string;
  created_at: string;
  updated_at: string;
};

export class EventPrismaRepository implements IEventRepository {
  public async addEvent(data: CreateEvent): Promise<Event | ErrorMessage> {
    const { userId, ...rest } = data;
    try {
      const newEvent = await prisma.event.create({
        data: {
          ...rest,
          userId,
          endEvent: new Date(data.endEvent),
        },
      });
      return newEvent;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async listEvent(
    params: CommonParamsPaginate
  ): Promise<{ content: EventWithBalances[]; meta: Paginate }> {
    const { size, page: pageParam, userId } = params;

    if (!userId) {
      throw Object.assign(new Error("User ID is required"), {
        statusCode: 400,
        error: "Bad Request",
        message: "User ID is required to list events",
      });
    }

    const shouldPaginate = pageParam && Number(pageParam) > 0;

    let rawContent: Event[];
    let metaResult: Paginate;

    const where = {
      ...(userId && { userId }),
    };

    if (shouldPaginate) {
      const currentPage = Number(pageParam);
      const effectiveSize = size && Number(size) > 0 ? Number(size) : 10;

      // ⚡ Bolt: Initial fetch of paginated events without movements to avoid O(N*M) data bloat.
      const [content, metaFromPrisma] = await prisma.event
        .paginate({
          where,
          orderBy: {
            endEvent: "desc",
          },
        })
        .withPages({
          limit: effectiveSize,
          page: currentPage,
        });

      rawContent = content as Event[];
      metaResult = metaFromPrisma;
    } else {
      rawContent = (await prisma.event.findMany({
        where,
        orderBy: {
          endEvent: "desc",
        },
      })) as Event[];

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

    if (rawContent.length === 0) {
      return { content: [], meta: metaResult };
    }

    const eventIds = rawContent.map((event) => event.id);

    // ⚡ Bolt: Offload balance calculations to the database using groupBy.
    // We fetch aggregated sums grouped by event and account (to get currency info) in parallel with account lookups.
    const [movementSums, userAccounts] = await Promise.all([
      prisma.movement.groupBy({
        by: ["eventId", "accountId"],
        where: {
          eventId: { in: eventIds },
          userId,
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.account.findMany({
        where: { userId },
        select: {
          id: true,
          badge: {
            select: {
              code: true,
              flag: true,
              symbol: true,
            },
          },
        },
      }),
    ]);

    // ⚡ Bolt: Use a Map for O(1) account -> badge info lookup.
    const accountBadgeMap = new Map(
      userAccounts.map((acc) => [
        acc.id,
        {
          code: acc.badge.code,
          flag: String(acc.badge.flag),
          symbol: String(acc.badge.symbol),
        },
      ])
    );

    // ⚡ Bolt: Group movement sums by eventId using a nested Map.
    // eventId -> badgeCode -> balance data
    const eventBalancesMap = new Map<
      string,
      Map<string, { code: string; symbol: string; flag: string; balance: Decimal }>
    >();

    for (const sum of movementSums) {
      if (!sum.eventId) continue;

      const badgeInfo = accountBadgeMap.get(sum.accountId);
      if (!badgeInfo) continue;

      if (!eventBalancesMap.has(sum.eventId)) {
        eventBalancesMap.set(sum.eventId, new Map());
      }

      const badgeBalances = eventBalancesMap.get(sum.eventId)!;
      const currentBalance = badgeBalances.get(badgeInfo.code) || {
        ...badgeInfo,
        balance: new Decimal(0),
      };

      currentBalance.balance = currentBalance.balance.add(
        sum._sum.amount || new Decimal(0)
      );
      badgeBalances.set(badgeInfo.code, currentBalance);
    }

    // Map the rawContent to include calculated balances
    const contentWithBalances: EventWithBalances[] = rawContent.map((event) => {
      const badgeBalancesMap = eventBalancesMap.get(event.id);
      const balances = badgeBalancesMap
        ? Array.from(badgeBalancesMap.values()).map((b) => ({
            code: b.code,
            symbol: b.symbol,
            flag: b.flag,
            balance: parseFloat(b.balance.toFixed(2)),
          }))
        : [];

      return { ...event, balances };
    });

    return {
      content: contentWithBalances,
      meta: metaResult,
    };
  }

  public async updateEvent(
    id: string,
    userId: string,
    data: Partial<CreateEvent>
  ): Promise<Event | ErrorMessage> {
    const { userId: _, ...rest } = data;
    try {
      const event = await prisma.event.findFirst({
        where: { id, userId },
      });

      if (!event) {
        throw Object.assign(new Error("Event not found"), {
          statusCode: 404,
          error: "Not Found",
          message: "Event not found or you don't have permission to update it",
        });
      }

      const updatedEvent = await prisma.event.update({
        where: {
          id,
        },
        data: {
          ...rest,
          ...(data.endEvent && { endEvent: new Date(data.endEvent) }),
        },
      });
      return updatedEvent;
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async detailEvent(id: string, userId: string): Promise<any | null> {
    try {
      const event = await prisma.event.findFirst({
        where: { id, userId },
        include: {
          movements: {
            select: {
              amount: true,
              description: true,
              datePurchase: true,
              account: {
                select: {
                  name: true,
                  badge: {
                    select: {
                      code: true,
                      flag: true,
                      symbol: true,
                    },
                  },
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                  icon: true,
                },
              },
            },
          },
        },
      });

      if (!event) {
        return null;
      }

      const { movements, ...restOfEvent } = event;

      if (!movements || movements.length === 0) {
        return { ...restOfEvent, categories: [], movements: [] };
      }
      const groupedByBadge = new Map<
        string,
        {
          symbol: string;
          flag: string;
          total_amount: Decimal;
          categories: Map<
            string,
            {
              id: string;
              name: string;
              color: string | null;
              icon: string | null;
              amount: Decimal;
            }
          >;
        }
      >();

      for (const movement of movements) {
        const badgeCode = movement.account?.badge?.code;
        const categoryName = movement.category?.name;
        const amount = movement.amount;

        if (badgeCode && categoryName) {
          if (!groupedByBadge.has(badgeCode)) {
            groupedByBadge.set(badgeCode, {
              symbol: String(movement.account?.badge?.symbol),
              flag: String(movement.account?.badge?.flag),
              total_amount: new Decimal(0),
              categories: new Map<
                string,
                {
                  id: string;
                  name: string;
                  color: string | null;
                  icon: string | null;
                  amount: Decimal;
                }
              >(),
            });
          }

          const badgeGroup = groupedByBadge.get(badgeCode)!;

          // Sumar al total de la moneda
          badgeGroup.total_amount = badgeGroup.total_amount.add(amount);

          // Sumar a la categoría específica dentro de la moneda
          const categoryId = movement.category?.id;
          if (categoryId) {
            const existing = badgeGroup.categories.get(categoryId) || {
              id: categoryId,
              name: movement.category.name,
              color: movement.category.color,
              icon: movement.category.icon,
              amount: new Decimal(0),
            };
            existing.amount = existing.amount.add(amount);
            badgeGroup.categories.set(categoryId, existing);
          }
        }
      }

      const categories = Array.from(groupedByBadge.entries()).map(
        ([badgeCode, data]) => {
          const categoriesList = Array.from(data.categories.values()).map(
            (cat) => ({
              id: cat.id,
              name: cat.name,
              color: cat.color,
              icon: cat.icon,
              amount: cat.amount.toNumber(),
              percentage: data.total_amount.isZero()
                ? 0
                : cat.amount
                    .div(data.total_amount)
                    .mul(100)
                    .toDecimalPlaces(2)
                    .toNumber(),
            })
          );

          return {
            code: badgeCode,
            flag: data.flag,
            symbol: data.symbol,
            categories: categoriesList,
          };
        }
      );

      return { ...restOfEvent, categories, movements };
    } catch (error: any) {
      throw Object.assign(new Error("Validation Error"), {
        statusCode: 400,
        error: "Bad Request",
        message: `${error?.code} ${error?.meta?.field_name}`,
      });
    }
  }

  public async deleteEvent(id: string, userId: string): Promise<Event | null> {
    const event = await prisma.event.findFirst({
      where: { id, userId },
    });
    if (!event) {
      return null;
    }
    return await prisma.event.delete({
      where: { id },
    });
  }

  public async importEvents(userId: string): Promise<{
    eventCount: number;
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

      // 2. Obtener los eventos de la API externa
      const eventsResponse = await fetch(`${apiProd}/events`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!eventsResponse.ok) {
        const errorText = await eventsResponse.text();
        throw Object.assign(
          new Error(`API events fetch failed: ${eventsResponse.statusText}`),
          {
            statusCode: eventsResponse.status,
            error: "API Error",
            message: `Failed to fetch events from API: ${
              eventsResponse.status
            } ${eventsResponse.statusText}. ${errorText || ""}`.trim(),
          }
        );
      }

      const rawApiResponse: APIEventResponse[] = await eventsResponse.json();
      const oldEvents = rawApiResponse;

      const eventsToCreate = oldEvents.map((event) => {
        return {
          name: event.name,
          type: null,
          endEvent: new Date(event.end_event),
          userId: userId,
          createdAt: new Date(event.created_at),
          updatedAt: new Date(event.updated_at),
        } as CreateEvent;
      });

      // 4. Insertar los eventos en la base de datos
      const result = await prisma.event.createMany({
        data: eventsToCreate,
        skipDuplicates: true,
      });

      return {
        eventCount: result.count,
      };
    } catch (error: unknown) {
      console.error("Error importing events:", error);
      throw error; // Re-lanzar el error para que sea manejado por el controlador
    }
  }
}
