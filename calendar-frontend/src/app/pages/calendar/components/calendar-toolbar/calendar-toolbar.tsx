import { EltEvent } from '../../../../common/types';
import { Dispatch, useState } from 'react';
import { ToolbarStyle } from './styles/calendar-toolbar-style';
import { AddEventModal } from '../../../../components/add-event-modal';

interface ICalendarToolbarProps {
  addEvent: (event: Omit<EltEvent, 'id'>) => Promise<void>;
  showIds: boolean;
  setShowIds: Dispatch<boolean>;
  selectedEvent?: EltEvent;
}

export const CalendarToolbar = ({
  addEvent,
  showIds,
  setShowIds,
  selectedEvent,
}: ICalendarToolbarProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const editEvent = (event?: EltEvent) => {
    console.log('todo');
  };

  return (
    <div css={ToolbarStyle}>
      <button data-testid="add-event-btn" onClick={() => setModalOpen(true)}>
        Add event
      </button>
      <AddEventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={({ name, start, end }) => addEvent({ title: name, start, end })}
      />
      <button
        data-testid="edit-event-btn"
        onClick={() => editEvent(selectedEvent)}
        disabled={!selectedEvent}
      >
        Edit event
      </button>
      <label htmlFor="show-ids-checkbox">
        <input
          id="show-ids-checkbox"
          type="checkbox"
          defaultChecked={showIds}
          onClick={(e) => setShowIds(e.currentTarget.checked)}
        ></input>
        Show ids
      </label>
    </div>
  );
};
