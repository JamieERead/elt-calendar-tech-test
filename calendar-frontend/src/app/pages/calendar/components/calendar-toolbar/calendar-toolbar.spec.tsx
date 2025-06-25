import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CalendarToolbar } from './calendar-toolbar';
import { EltEvent } from '../../../../common/types';
import { Dispatch } from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event'; // ✅ Import userEvent properly

describe('CalendarToolbarComponent', () => {
  let addEvent: (event: Omit<EltEvent, 'id'>) => Promise<void>;
  let setShowIds: Dispatch<boolean>;
  let updateEvent: jest.Mock;
  const mockEvent: EltEvent = {
    id: 100,
    title: 'Mock event',
    start: new Date(),
    end: new Date(),
  };

  beforeEach(() => {
    updateEvent = jest.fn();
    addEvent = jest.fn();
    setShowIds = jest.fn();
  });

  it('renders correctly', () => {
    const { container } = render(
      <CalendarToolbar
        addEvent={addEvent}
        updateEvent={updateEvent}
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
          updateEvent={updateEvent}
          showIds={false}
          setShowIds={setShowIds}
        />,
      );

      const addBtn = screen.getByTestId('add-event-btn');
      await fireEvent.click(addBtn);

      expect(screen.getByText('Create New Event')).toBeInTheDocument();
      expect(screen.getByLabelText(/Event Title:/)).toBeInTheDocument();
    });

    it('should call addEvent when submitting new event', async () => {
      render(
        <CalendarToolbar
          addEvent={addEvent}
          updateEvent={updateEvent}
          showIds={false}
          setShowIds={setShowIds}
        />,
      );

      fireEvent.click(screen.getByTestId('add-event-btn'));

      // Fill in form
      fireEvent.change(screen.getByLabelText(/Event Title:/i), {
        target: { value: 'My Test Event' },
      });

      fireEvent.change(screen.getByLabelText(/Start:/i), {
        target: { value: '2025-01-01T10:00' },
      });

      fireEvent.change(screen.getByLabelText(/End:/i), {
        target: { value: '2025-01-01T11:00' },
      });

      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      expect(addEvent).toHaveBeenCalledTimes(1);
      expect(addEvent).toHaveBeenCalledWith({
        title: 'My Test Event',
        start: new Date('2025-01-01T10:00'),
        end: new Date('2025-01-01T11:00'),
      });
    });

    it('should show validation error if addEvent fails with 400', async () => {
      addEvent = jest.fn().mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 400,
          data: { message: 'Conflict with existing event' },
        },
      });

      render(
        <CalendarToolbar
          addEvent={addEvent}
          updateEvent={updateEvent}
          showIds={false}
          setShowIds={setShowIds}
        />,
      );

      fireEvent.click(screen.getByTestId('add-event-btn'));

      fireEvent.change(screen.getByLabelText(/Event Title:/i), {
        target: { value: 'Conflicting Event' },
      });
      fireEvent.change(screen.getByLabelText(/Start:/i), {
        target: { value: '2025-01-01T10:00' },
      });
      fireEvent.change(screen.getByLabelText(/End:/i), {
        target: { value: '2025-01-01T11:00' },
      });

      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() =>
        expect(
          screen.getByText('Conflict with existing event'),
        ).toBeInTheDocument(),
      );
    });
  });

  describe('Edit event button', () => {
    it('should only be disabled if there is no selected event', async () => {
      render(
        <CalendarToolbar
          addEvent={addEvent}
          updateEvent={updateEvent}
          showIds={false}
          setShowIds={setShowIds}
        />,
      );

      const btn = screen.getByTestId('edit-event-btn');
      expect(btn).toBeDisabled();
    });

    it('should call updateEvent when submitting edited event', async () => {
      render(
        <CalendarToolbar
          addEvent={addEvent}
          updateEvent={updateEvent}
          showIds={false}
          setShowIds={setShowIds}
          selectedEvent={mockEvent}
        />,
      );

      fireEvent.click(screen.getByTestId('edit-event-btn'));

      // Change title
      fireEvent.change(screen.getByLabelText(/Event Title:/i), {
        target: { value: 'Updated Event' },
      });

      fireEvent.change(screen.getByLabelText(/Start:/i), {
        target: { value: '2025-01-01T10:30' },
      });

      fireEvent.change(screen.getByLabelText(/End:/i), {
        target: { value: '2025-01-01T11:30' },
      });

      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      expect(updateEvent).toHaveBeenCalledTimes(1);
      expect(updateEvent).toHaveBeenCalledWith({
        ...mockEvent,
        title: 'Updated Event',
        start: new Date('2025-01-01T10:30'),
        end: new Date('2025-01-01T11:30'),
      });
    });

    it('should only be disabled if there is a selected event', async () => {
      render(
        <CalendarToolbar
          addEvent={addEvent}
          updateEvent={updateEvent}
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
    it('should toggle ids being shown', async () => {
      render(
        <CalendarToolbar
          addEvent={addEvent}
          updateEvent={updateEvent}
          showIds={false}
          setShowIds={setShowIds}
        />,
      );

      const checkbox = screen.getByLabelText(/Show ids/i);
      expect(checkbox).not.toBeChecked();

      await userEvent.click(checkbox);
      expect(setShowIds).toHaveBeenCalledWith(true);

      await userEvent.click(checkbox);
      expect(setShowIds).toHaveBeenCalledWith(false);
    });
  });
});
