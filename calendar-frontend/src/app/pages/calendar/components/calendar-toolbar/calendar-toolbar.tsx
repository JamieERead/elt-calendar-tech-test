import { EltEvent, EventFormData } from '../../../../common/types';
import { Dispatch, useState } from 'react';
import { ToolbarStyle } from './styles/calendar-toolbar-style';
import { AddEventModal } from '../../../../components/add-event-modal';

interface ICalendarToolbarProps {
  addEvent: (event: Omit<EltEvent, 'id'>) => Promise<void>;
  updateEvent: (event: EltEvent) => void;
  showIds: boolean;
  setShowIds: Dispatch<boolean>;
  selectedEvent?: EltEvent;
}

export const CalendarToolbar = ({
  addEvent,
  updateEvent,
  showIds,
  setShowIds,
  selectedEvent,
}: ICalendarToolbarProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const onSave = ({ title, start, end }: EventFormData) => {
    if (isEditing && selectedEvent) {
      updateEvent({ ...selectedEvent, title, start, end });
    } else {
      addEvent({ title, start, end });
    }
    setModalOpen(false);
  };

  return (
    <div css={ToolbarStyle}>
      <AddEventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onSave}
        initialEvent={
          isEditing && selectedEvent?.start && selectedEvent?.end
            ? {
                title: selectedEvent.title,
                start: selectedEvent.start,
                end: selectedEvent.end,
              }
            : undefined
        }
      />
      <button
        data-testid="add-event-btn"
        onClick={() => {
          setIsEditing(false);
          setModalOpen(true);
        }}
      >
        Add event
      </button>
      <button
        data-testid="edit-event-btn"
        onClick={() => {
          setIsEditing(true);
          setModalOpen(true);
        }}
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
