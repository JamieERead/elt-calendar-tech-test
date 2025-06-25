import { BadRequestException, Injectable } from '@nestjs/common';
import { CalendarEventRepository } from '@fs-tech-test/calendar-domain';
import { EntityManager } from '@mikro-orm/knex';

@Injectable()
export class CalendarService {
  constructor(
    private readonly calendarEventRepository: CalendarEventRepository,
    private readonly em: EntityManager,
  ) {}

  private async validateEventConflict(
    start: Date,
    end: Date,
    excludeId?: number,
  ) {
    const qb = this.em.createQueryBuilder('CalendarEventEntity', 'e');

    qb.where('e.start < ?', [end]).andWhere('e.end > ?', [start]);

    if (excludeId) {
      qb.andWhere('e.id != ?', [excludeId]);
    }

    const conflict = await qb.getSingleResult();

    if (conflict) {
      throw new BadRequestException('Event conflicts with an existing one.');
    }
  }

  async getEvents(start: string, end: string) {
    if (!start || !end) throw new BadRequestException('No start/end specified');

    return this.calendarEventRepository.findForRange(
      new Date(start),
      new Date(end),
    );
  }

  async addEvent(payload: EventPayload) {
    const start = new Date(payload.start);
    const end = new Date(payload.end);

    await this.validateEventConflict(start, end);

    const newEntity = await this.calendarEventRepository.createNewEvent(
      payload.name,
      start,
      end,
    );

    return newEntity.id;
  }

  async updateEvent(id: number, payload: EventPayload) {
    const start = new Date(payload.start);
    const end = new Date(payload.end);

    const updated = await this.calendarEventRepository.updateEvent(
      id,
      payload.name,
      start,
      end,
    );

    await this.validateEventConflict(start, end, id);

    if (!updated) {
      throw new BadRequestException(`Event with ID ${id} not found`);
    }

    await this.em.flush();
  }

  async deleteEvent(id: number) {
    await this.calendarEventRepository.deleteById(id);
  }
}
