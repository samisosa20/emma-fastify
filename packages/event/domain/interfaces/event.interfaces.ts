import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { Event, CreateEvent, EventWithBalances } from "../event";

export interface IEventRepository {
  addEvent(data: CreateEvent): Promise<Event | ErrorMessage>;
  listEvent(
    params: CommonParamsPaginate
  ): Promise<{ content: EventWithBalances[]; meta: Paginate }>;
  updateEvent(
    id: string,
    userId: string,
    data: Partial<CreateEvent>
  ): Promise<Event | ErrorMessage>;
  detailEvent(id: string, userId: string): Promise<Event | null>;
  deleteEvent(id: string, userId: string): Promise<Event | null>;
  importEvents(userId: string): Promise<{
    eventCount: number;
  }>;
}
