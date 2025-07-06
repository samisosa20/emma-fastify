import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { Event, CreateEvent } from "../event";

export interface IEventRepository {
  addEvent(data: CreateEvent): Promise<Event | ErrorMessage>;
  listEvent(
    params: CommonParamsPaginate
  ): Promise<{ content: Event[]; meta: Paginate }>;
  updateEvent(
    id: string,
    account: Partial<CreateEvent>
  ): Promise<Event | ErrorMessage>;
  detailEvent(id: string): Promise<Event | null>;
  deleteEvent(id: string): Promise<Event | null>;
  importEvents(): Promise<{
    eventCount: number;
  }>;
}
