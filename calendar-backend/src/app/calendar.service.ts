import { BadRequestException, Injectable } from '@nestjs/common';
import { CalendarEventRepository } from '@fs-tech-test/calendar-domain';
import { EntityManager } from '@mikro-orm/knex';

@Injectable()
export class CalendarService {
  constructor(
    private readonly calendarEventRepository: CalendarEventRepository,
    private readonly em: EntityManager,
  ) {}

  async getEvents(start: string, end: string) {
    if (!start || !end) throw new BadRequestException('No start/end specified');

    return this.calendarEventRepository.findForRange(
      new Date(start),
      new Date(end),
    );
  }

  async addEvent(payload: EventPayload) {
    const newEntity = await this.calendarEventRepository.createNewEvent(
      payload.name,
      new Date(payload.start),
      new Date(payload.end),
    );

    return newEntity.id;
  }

  async deleteEvent(id: number) {
    await this.calendarEventRepository.deleteById(id);
  }

  async updateEvent(id: number, payload: EventPayload) {
    const updated = await this.calendarEventRepository.updateEvent(
      id,
      payload.name,
      new Date(payload.start),
      new Date(payload.end),
    );

    if (!updated) {
      throw new BadRequestException(`Event with ID ${id} not found`);
    }

    await this.em.flush();
  }
}
