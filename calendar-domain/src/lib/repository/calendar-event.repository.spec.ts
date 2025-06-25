import { LoadStrategy, MikroORM, wrap } from '@mikro-orm/core';
import { entities } from '../entities';
import { EntityManager } from '@mikro-orm/mysql';
import { CalendarEventEntity } from '../entity/calendar-event.entity';
import { CalendarEventRepository } from './calendar-event.repository';
import { SqliteDriver } from '@mikro-orm/sqlite';

describe('CalendarEventRepository', () => {
  let orm: MikroORM;
  let em: EntityManager;
  let repository: CalendarEventRepository;
  const now = new Date('2024-10-01T13:33:00Z');

  beforeAll(async () => {
    process.env.MIKRO_ORM_DB_NAME = 'test';
    const orm = await MikroORM.init<SqliteDriver>({
      driver: SqliteDriver,
      dbName: ':memory:',
      entities,
      loadStrategy: LoadStrategy.JOINED,
    });
    await orm.getSchemaGenerator().refreshDatabase();
    em = orm.em.fork();
    repository = new CalendarEventRepository(em, CalendarEventEntity);
    jest.useFakeTimers({ doNotFake: ['nextTick'] }).setSystemTime(now);
  });

  afterAll(async () => {
    await orm?.close(true);
    jest.useRealTimers();
  });

  describe('CalendarEventEntity', () => {
    it('can be persisted, deleted and fetched', async () => {
      // Create
      const eventData = {
        name: 'test event',
        start: new Date('2024-11-14T10:00:00'),
        end: new Date('2024-11-14T11:00:00'),
      };
      const entity = em.create(CalendarEventEntity, eventData);
      await em.persistAndFlush(entity);

      // Fetch
      const result = await em.find(CalendarEventEntity, {});
      expect(result.map((r) => wrap(r).toObject())).toEqual([
        { ...eventData, id: 1, createdAt: now },
      ]);

      // Remove
      em.remove(result[0]);
      await em.flush();
      await expect(em.find(CalendarEventEntity, {})).resolves.toEqual([]);
    });
  });

  describe('Repository methods', () => {
    beforeEach(async () => {
      const entity1 = em.create(CalendarEventEntity, {
        name: 'test event',
        start: new Date('2024-11-14T10:00:00'),
        end: new Date('2024-11-14T11:00:00'),
      });

      const entity2 = em.create(CalendarEventEntity, {
        name: 'other test event',
        start: new Date('2024-11-15T16:00:00'),
        end: new Date('2024-11-15T17:00:00'),
      });
      await em.persistAndFlush([entity1, entity2]);
    });

    describe('findForRange', () => {
      it('should find events for a date range', async () => {
        const result = await repository.findForRange(
          new Date('2024-11-14T00:00:00'),
          new Date('2024-11-16T00:00:00'),
        );

        expect(result.map((e) => wrap(e).toObject())).toEqual([
          {
            id: expect.any(Number),
            createdAt: now,
            name: 'test event',
            start: new Date('2024-11-14T10:00:00'),
            end: new Date('2024-11-14T11:00:00'),
          },
          {
            id: expect.any(Number),
            createdAt: now,
            name: 'other test event',
            start: new Date('2024-11-15T16:00:00'),
            end: new Date('2024-11-15T17:00:00'),
          },
        ]);
      });
    });

    describe('createNewEvent', () => {
      it('should create a new event', async () => {
        await repository.createNewEvent(
          'new event',
          new Date('2025-01-14T10:00:00'),
          new Date('2025-01-14T11:00:00'),
        );

        const result = await em.find(CalendarEventEntity, {
          name: 'new event',
        });

        expect(result.map((e) => wrap(e).toObject())).toEqual([
          {
            id: expect.any(Number),
            createdAt: now,
            updatedAt: null,
            name: 'new event',
            start: new Date('2025-01-14T10:00:00'),
            end: new Date('2025-01-14T11:00:00'),
          },
        ]);
      });
    });

    describe('updateEvent', () => {
      beforeEach(async () => {
        await em.nativeDelete(CalendarEventEntity, {}); // clear all data
      });

      it('should update an event', async () => {
        const entity = em.create(CalendarEventEntity, {
          name: 'original event',
          start: new Date('2025-01-14T09:00:00'),
          end: new Date('2025-01-14T10:00:00'),
        });
        await em.persistAndFlush(entity);

        await repository.updateEvent(
          entity.id,
          'new event',
          new Date('2025-01-14T10:00:00'),
          new Date('2025-01-14T11:00:00'),
        );

        const result = await em.find(CalendarEventEntity, {
          name: 'new event',
        });

        expect(result.map((e) => wrap(e).toObject())).toEqual([
          {
            id: entity.id,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            name: 'new event',
            start: new Date('2025-01-14T10:00:00'),
            end: new Date('2025-01-14T11:00:00'),
          },
        ]);
      });
    });

    describe('deleteById', () => {
      it('should delete by id', async () => {
        const existingEvent = (await repository.find({}))[0];
        expect(existingEvent).toBeDefined();

        await repository.deleteById(existingEvent.id);

        await expect(
          repository.find({ id: existingEvent.id }),
        ).resolves.toEqual([]);
      });
    });
  });
});
