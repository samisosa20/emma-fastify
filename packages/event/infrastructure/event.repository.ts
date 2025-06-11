import { Event, CreateEvent } from "../domain/event";
import { IEventRepository } from "../domain/interfaces/event.interfaces";

import prisma from "packages/shared/settings/prisma.client";
import {
  CommonParamsPaginate,
  Paginate,
  ErrorMessage,
  handleShowDeleteData,
} from "packages/shared";

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

  public async detailEvent(id: string): Promise<Event | null> {
    try {
      return await prisma.event.findUnique({
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
}
