import { render, screen, within } from '@testing-library/react';
import { CalendarView } from './calendar-view';
import { View } from 'react-big-calendar';
import { EltEvent } from '../../../../common/types';
import '@testing-library/jest-dom';

describe('CalendarView', () => {
  let onNavigate: (date: Date, view: View) => void;
  let setSelectedEvent: (event: EltEvent) => void;
  let updateEvent: jest.Mock;
  const mockEvent: EltEvent = {
    id: 100,
    title: 'Mock event',
    start: new Date('2024-10-11T12:15:00Z'),
    end: new Date('2024-10-11T12:45:00Z'),
  };

  beforeEach(() => {
    onNavigate = jest.fn();
    updateEvent = jest.fn();
    setSelectedEvent = jest.fn();
    jest.useFakeTimers().setSystemTime(new Date('2024-10-11T10:30:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render an empty calendar', () => {
    const { container } = render(
      <CalendarView
        onNavigate={onNavigate}
        updateEvent={updateEvent}
        events={[]}
        showIds={false}
        setSelectedEvent={setSelectedEvent}
      />,
    );

    expect(container).toMatchSnapshot();
  });

  it('should render a calendar with an event', () => {
    const { container } = render(
      <CalendarView
        onNavigate={onNavigate}
        updateEvent={updateEvent}
        events={[mockEvent]}
        showIds={false}
        setSelectedEvent={setSelectedEvent}
      />,
    );

    expect(container).toMatchSnapshot();

    const eventLabel = screen.getByText('Mock event');
    const event = eventLabel.closest('.rbc-event') as HTMLElement;
    const eventTime = event?.querySelector('.rbc-event-label');

    expect(eventTime).toHaveTextContent('12:15 - 12:45');
    expect(within(event).queryByText('id: 100')).not.toBeInTheDocument();
  });

  it('should show event ids if flag is set', () => {
    render(
      <CalendarView
        onNavigate={onNavigate}
        updateEvent={updateEvent}
        events={[mockEvent]}
        showIds={true}
        setSelectedEvent={setSelectedEvent}
      />,
    );

    const eventLabel = screen.getByText('Mock event');
    const event = eventLabel.closest('.rbc-event') as HTMLElement;

    expect(within(event).queryByText('id: 100')).toBeInTheDocument();
  });
});
