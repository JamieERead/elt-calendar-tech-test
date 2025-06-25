import { fireEvent, render, screen } from '@testing-library/react';
import { CalendarToolbar } from './calendar-toolbar';
import { EltEvent } from '../../../../common/types';
import { Dispatch } from 'react';
import '@testing-library/jest-dom';

describe('CalendarToolbarComponent', () => {
  let addEvent: (event: Omit<EltEvent, 'id'>) => Promise<void>;
  let setShowIds: Dispatch<boolean>;
  const mockEvent: EltEvent = {
    id: 100,
    title: 'Mock event',
    start: new Date(),
    end: new Date(),
  };

  beforeEach(() => {
    addEvent = jest.fn();
    setShowIds = jest.fn();
  });

  it('renders correctly', () => {
    const { container } = render(
      <CalendarToolbar
        addEvent={addEvent}
        showIds={false}
        setShowIds={setShowIds}
      />,
    );

    expect(container).toMatchSnapshot();
  });

  describe('Add event button', () => {
    it('should open the AddEventModal when clicking Add event', async () => {
      render(
        <CalendarToolbar
          addEvent={addEvent}
          showIds={false}
          setShowIds={setShowIds}
        />,
      );

      const addBtn = screen.getByTestId('add-event-btn');
      await fireEvent.click(addBtn);

      expect(screen.getByText('Create New Event')).toBeInTheDocument();
      expect(screen.getByLabelText(/Event Name:/)).toBeInTheDocument();
    });
  });

  describe('Edit event button', () => {
    it('should only be disabled if there is no selected event', async () => {
      render(
        <CalendarToolbar
          addEvent={addEvent}
          showIds={false}
          setShowIds={setShowIds}
        />,
      );

      const btn = screen.getByTestId('edit-event-btn');
      expect(btn).toBeDisabled();
    });

    it('should only be disabled if there is a selected event', async () => {
      render(
        <CalendarToolbar
          addEvent={addEvent}
          showIds={false}
          setShowIds={setShowIds}
          selectedEvent={mockEvent}
        />,
      );

      const btn = screen.getByTestId('edit-event-btn');
      expect(btn).toBeEnabled();
    });
  });

  describe('Show ids checkbox', () => {
    it('should toggle ids being shown', () => {
      render(
        <CalendarToolbar
          addEvent={addEvent}
          showIds={false}
          setShowIds={setShowIds}
        />,
      );

      const checkbox = screen.getByLabelText('Show ids');
      expect(checkbox).not.toBeChecked();

      // Check
      userEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      expect(setShowIds).toHaveBeenCalledWith(true);

      // Uncheck
      userEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
      expect(setShowIds).toHaveBeenCalledWith(false);
    });
  });
});
