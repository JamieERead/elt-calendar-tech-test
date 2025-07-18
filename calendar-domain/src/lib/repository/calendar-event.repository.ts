import { CalendarEventEntity } from '../entity/calendar-event.entity';
import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CalendarEventRepository extends EntityRepository<CalendarEventEntity> {
  async findForRange(start: Date, end: Date): Promise<CalendarEventEntity[]> {
    // By default, mikro-orm uses Knex query syntax but you can use raw queries like this if it's easier:
    // const rawResult = await this.em.getKnex().raw<CalendarEventEntity[][]>('select * from elt_event where start <= ? AND end >= ?', [end, start])
    // return rawResult[0];
    return this.find({ start: { $lte: end }, end: { $gte: start } });
  }

  async createNewEvent(
    name: string,
    start: Date,
    end: Date,
  ): Promise<CalendarEventEntity> {
    const newEntity = this.create({ name, start, end });
    await this.insert(newEntity);

    return newEntity;
  }

  async deleteById(id: number): Promise<void> {
    await this.nativeDelete({ id });
  }

  async updateEvent(
    id: number,
    name: string,
    start: Date,
    end: Date,
  ): Promise<CalendarEventEntity> {
    const event = await this.findOne({ id });

    if (!event) return null;

    event.name = name;
    event.start = start;
    event.end = end;

    return event;
  }
}
