import { Event, CreateEvent } from "../domain/event";
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
    try {
      const newEvent = await prisma.event.create({
        data: {
          ...data,
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
  ): Promise<{ content: Event[]; meta: Paginate }> {
    const { size, page: pageParam } = params;

    const shouldPaginate = pageParam && Number(pageParam) > 0;

    let rawContent: (Event & { movements: any[] })[];
    let metaResult: Paginate;

    if (shouldPaginate) {
      const currentPage = Number(pageParam);
      const effectiveSize = size && Number(size) > 0 ? Number(size) : 10;

      const [content, metaFromPrisma] = await prisma.event
        .paginate({
          include: {
            movements: {
              select: {
                amount: true,
                account: {
                  select: {
                    badge: {
                      select: {
                        code: true,
                        flag: true,
                        symbol: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            endEvent: "desc",
          },
        })
        .withPages({
          limit: effectiveSize,
          page: currentPage,
        });

      rawContent = content as (Event & { movements: any[] })[];

      metaResult = metaFromPrisma;
    } else {
      rawContent = (await prisma.event.findMany({
        include: {
          movements: {
            select: {
              amount: true,
              account: {
                select: {
                  badge: {
                    select: {
                      code: true,
                      flag: true,
                      symbol: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          endEvent: "desc",
        },
      })) as (Event & { movements: any[] })[];

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

    const contentWithBalances = rawContent.map((event) => {
      // 💡 Corrección: El valor del Map debe ser un objeto para guardar varias propiedades.
      const balancesMap = new Map();

      event.movements.forEach((movement) => {
        // 💡 Mejora: Simplificación en la obtención del monto.
        const amount = movement.amount?.toNumber() ?? 0;

        const code = movement.account?.badge?.code;
        const symbol = String(movement.account?.badge?.symbol);
        const flag = String(movement.account?.badge?.flag);

        if (code) {
          // 💡 Corrección: Obtener el objeto de balance actual o crear uno nuevo.
          // El valor del Map es un objeto, no un número.
          const currentBalanceData = balancesMap.get(code) || {
            symbol: symbol,
            flag: flag,
            balance: 0,
          };

          // 💡 Corrección: Actualizar la propiedad `balance` del objeto y volver a guardarlo.
          currentBalanceData.balance += amount;
          balancesMap.set(code, currentBalanceData);
        }
      });

      // 💡 Corrección: Iterar sobre el Map. La función de mapeo ahora recibe
      // la clave (code) y el valor (data, que es el objeto).
      const balances = Array.from(balancesMap, ([code, data]) => ({
        code,
        symbol: data.symbol,
        flag: data.flag,
        // Usamos el balance del objeto.
        balance: parseFloat(data.balance.toFixed(2)),
      }));

      const { movements, ...restOfEvent } = event;

      return { ...restOfEvent, balances };
    });

    return {
      content: contentWithBalances,
      meta: metaResult,
    };
  }

  public async updateEvent(
    id: string,
    data: Partial<CreateEvent>
  ): Promise<Event | ErrorMessage> {
    try {
      const updatedEvent = await prisma.event.update({
        where: {
          id,
        },
        data: {
          ...data,
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

  public async detailEvent(id: string): Promise<any | null> {
    try {
      const event = await prisma.event.findUnique({
        where: { id },
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
          categories: Map<string, Decimal>;
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
              categories: new Map<string, Decimal>(),
            });
          }

          const badgeGroup = groupedByBadge.get(badgeCode)!;

          // Sumar al total de la moneda
          badgeGroup.total_amount = badgeGroup.total_amount.add(amount);

          // Sumar a la categoría específica dentro de la moneda
          const currentCategoryTotal =
            badgeGroup.categories.get(categoryName) || new Decimal(0);
          badgeGroup.categories.set(
            categoryName,
            currentCategoryTotal.add(amount)
          );
        }
      }

      const categories = Array.from(groupedByBadge.entries()).map(
        ([badgeCode, data]) => {
          const categoriesList = Array.from(data.categories.entries()).map(
            ([categoryName, categoryTotal]) => ({
              name: categoryName,
              amount: categoryTotal.toNumber(),
              percentage: data.total_amount.isZero()
                ? 0
                : categoryTotal
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

  public async deleteEvent(id: string): Promise<Event | null> {
    const event = await prisma.event.findUnique({
      where: { id },
    });
    if (!event) {
      return null;
    }
    return await prisma.event.delete({
      where: { id },
    });
  }

  public async importEvents(): Promise<{
    eventCount: number;
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
