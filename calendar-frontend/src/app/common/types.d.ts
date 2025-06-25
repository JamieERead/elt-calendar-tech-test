import { Event } from 'react-big-calendar';

export interface EltEvent extends Event {
  title: string;
  id: number;
}

export type CalendarEventUpdatePayload = {
  event: EltEvent;
  start: string | Date;
  end: string | Date;
};
