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
        data,
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
    const { deleted, size, page } = params;
    const [content, meta] = await prisma.event
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
                    },
                  },
                },
              },
            },
          },
        },
      })
      .withPages({
        limit: size ? Number(size) : 10,
        page: page && page > 0 ? Number(page) : 1,
      });

    const contentWithBalances = content.map((event) => {
      const balancesMap = new Map<string, number>();

      event.movements.forEach((movement) => {
        const amount = movement.amount
          ? movement.amount.toNumber()
          : Number(movement.amount || 0);

        const badgeName = movement.account?.badge?.code;

        if (badgeName) {
          const currentBalance = balancesMap.get(badgeName) || 0;
          balancesMap.set(badgeName, currentBalance + amount);
        }
      });

      const balances: { badge: string; balance: number }[] = Array.from(
        balancesMap,
        ([badge, decimalBalance]) => ({
          badge,
          balance: parseFloat(decimalBalance.toFixed(2)),
        })
      );

      const { movements, ...restOfEvent } = event;

      return { ...restOfEvent, balances };
    });

    return {
      content: contentWithBalances,
      meta,
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
        data,
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
                    },
                  },
                },
              },
              category: {
                select: {
                  name: true,
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
        { total_amount: Decimal; categories: Map<string, Decimal> }
      >();

      for (const movement of movements) {
        const badgeCode = movement.account?.badge?.code;
        const categoryName = movement.category?.name;
        const amount = movement.amount;

        if (badgeCode && categoryName) {
          if (!groupedByBadge.has(badgeCode)) {
            groupedByBadge.set(badgeCode, {
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
            badge: badgeCode,
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
