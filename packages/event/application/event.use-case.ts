import { CommonParamsPaginate, ErrorMessage, Paginate } from "packages/shared";
import { IEventRepository } from "../domain/interfaces/event.interfaces";
import { Event, CreateEvent } from "../domain/event";

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
  ): Promise<{ content: Event[]; meta: Paginate }> {
    return await this.badgeRepository.listEvent(params);
  }

  public async updateEvent(
    id: string,
    badge: Partial<CreateEvent>
  ): Promise<Event | ErrorMessage> {
    return await this.badgeRepository.updateEvent(id, badge);
  }

  public async detailEvent(id: string): Promise<Event | null> {
    return await this.badgeRepository.detailEvent(id);
  }

  public async deleteEvent(id: string): Promise<Event | null> {
    return await this.badgeRepository.deleteEvent(id);
  }

  public async importEvents(): Promise<{
    eventCount: number;
  }> {
    return await this.badgeRepository.importEvents();
  }
}
