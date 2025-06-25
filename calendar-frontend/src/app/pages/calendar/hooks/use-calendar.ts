import { useEffect, useState } from 'react';
import moment, { unitOfTime, Moment } from 'moment/moment';
import { View } from 'react-big-calendar';
import { EltEvent } from '../../../common/types';
import { CalendarService } from '../../../service/calendar.service';

export const useCalendar = () => {
  const calendarService = new CalendarService();
  const [events, setEvents] = useState<EltEvent[]>([]);
  const [showIds, setShowIds] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EltEvent | undefined>();

  useEffect(() => {
    const today = moment();
    fetchEvents(today.startOf('week'), today.clone().endOf('week'));
  }, []);

  const fetchEvents = async (start: Moment, end: Moment) => {
    const { data } = await calendarService.getEventsForRange(start, end);
    const processedEvents: EltEvent[] = data.map((e) => ({
      id: e.id,
      title: e.name,
      start: new Date(e.start),
      end: new Date(e.end),
    }));
    setEvents(processedEvents);
  };

  const onNavigate = async (newDate: Date, view: View) => {
    const newMutableDate = moment(newDate);
    const unitOfTime = viewToUnitOfTime(view);
    await fetchEvents(
      newMutableDate.startOf(unitOfTime),
      newMutableDate.clone().endOf(unitOfTime),
    );
  };

  const addEvent = async (event: Omit<EltEvent, 'id'>) => {
    const {
      data: { id },
    } = await calendarService.createEvent(
      event.title,
      moment(event.start),
      moment(event.end),
    );
    setEvents((events) => [...events, { ...event, id }]);
  };

  const updateEvent = async (event: EltEvent) => {
    await calendarService.updateEvent(
      event.id,
      event.title,
      moment(event.start),
      moment(event.end),
    );

    // to plain Date to keep state consistent
    const updated = {
      ...event,
      start: new Date(event.start ?? ''),
      end: new Date(event.end ?? ''),
    };

    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    console.log('Updated events:', updated);
  };

  const viewToUnitOfTime = (view: View): unitOfTime.StartOf => {
    switch (view) {
      case 'day':
      case 'week':
      case 'month':
        return view;
      case 'agenda':
        return 'month';
      default:
        return 'week';
    }
  };

  return {
    events,
    showIds,
    setShowIds,
    onNavigate,
    addEvent,
    updateEvent,
    selectedEvent,
    setSelectedEvent,
  };
};
