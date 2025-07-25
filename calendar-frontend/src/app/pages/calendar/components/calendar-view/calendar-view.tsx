import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import './styles/calendar.scss';
import { EltEvent, CalendarEventUpdatePayload } from '../../../../common/types';
import { CalendarFormats } from './formats';
import { useCalendarView } from '../../hooks/use-calendar-view';
import { useCallback } from 'react';
import { useCalendar } from '../../hooks/use-calendar';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop<EltEvent>(Calendar);

interface ICalendarViewProps {
  onNavigate: (date: Date, view: View) => void;
  updateEvent: (event: EltEvent) => void;
  events: EltEvent[];
  showIds: boolean;
  setSelectedEvent: (event: EltEvent) => void;
}

export const CalendarView = ({
  onNavigate,
  events,
  updateEvent,
  showIds,
  setSelectedEvent,
}: ICalendarViewProps) => {
  const { components } = useCalendarView(showIds);

  const handleEventUpdate = useCallback(
    async (
      { event, start, end }: CalendarEventUpdatePayload,
      context = 'Update',
    ) => {
      const updatedEvent: EltEvent = {
        ...event,
        start: new Date(start),
        end: new Date(end),
      };
      try {
        await updateEvent(updatedEvent);
      } catch (error) {
        console.error(`${context} failed:`, error);
      }
    },
    [updateEvent],
  );

  const onEventDrop = useCallback(
    (payload: CalendarEventUpdatePayload) =>
      handleEventUpdate(payload, 'Drag update'),
    [handleEventUpdate],
  );

  const onEventResize = useCallback(
    (payload: CalendarEventUpdatePayload) =>
      handleEventUpdate(payload, 'Resize update'),
    [handleEventUpdate],
  );

  return (
    <DnDCalendar
      components={components}
      defaultDate={moment().toDate()}
      events={events}
      onNavigate={onNavigate}
      defaultView={'week'}
      onSelectEvent={setSelectedEvent}
      localizer={localizer}
      formats={CalendarFormats}
      onEventDrop={onEventDrop}
      onEventResize={onEventResize}
      resizable
      style={{ height: '80vh' }}
      popup={true}
      dayLayoutAlgorithm={'no-overlap'}
    />
  );
};
