import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { IEventRepository } from "../domain/interfaces/event.interfaces";
import { Event, CreateEvent, EventWithBalances } from "../domain/event";

export class EventUseCase {
  private badgeRepository: IEventRepository;

  constructor(_badgeAdapter: IEventRepository) {
    this.badgeRepository = _badgeAdapter;
  }

  public async addEvent(data: CreateEvent): Promise<Event | ErrorMessage> {
    return await this.badgeRepository.addEvent(data);
  }

  public async listEvent(
    params: CommonParamsPaginate
  ): Promise<{ content: EventWithBalances[]; meta: Paginate }> {
    return await this.badgeRepository.listEvent(params);
  }

  public async updateEvent(
    id: string,
    userId: string,
    data: Partial<CreateEvent>
  ): Promise<Event | ErrorMessage> {
    return await this.badgeRepository.updateEvent(id, userId, data);
  }

  public async detailEvent(id: string, userId: string): Promise<Event | null> {
    return await this.badgeRepository.detailEvent(id, userId);
  }

  public async deleteEvent(id: string, userId: string): Promise<Event | null> {
    return await this.badgeRepository.deleteEvent(id, userId);
  }

  public async importEvents(userId: string): Promise<{
    eventCount: number;
  }> {
    return await this.badgeRepository.importEvents(userId);
  }
}
