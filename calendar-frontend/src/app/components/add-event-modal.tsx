import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';
import moment from 'moment';
import { EventFormData } from '../common/types';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: EventFormData) => void;
  initialEvent?: EventFormData;
}

export const AddEventModal = ({
  isOpen,
  onClose,
  onSave,
  initialEvent,
}: AddEventModalProps) => {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState(moment().format('YYYY-MM-DDTHH:mm'));
  const [end, setEnd] = useState(
    moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
  );

  // Sync props to state when initialEvent changes or modal opens
  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setStart(moment(initialEvent.start).format('YYYY-MM-DDTHH:mm'));
      setEnd(moment(initialEvent.end).format('YYYY-MM-DDTHH:mm'));
    } else {
      setTitle('');
      setStart(moment().format('YYYY-MM-DDTHH:mm'));
      setEnd(moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm'));
    }
  }, [initialEvent, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      start: new Date(start),
      end: new Date(end),
    });
    onClose();
  };

  return (
    <StyledModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Add Event"
      ariaHideApp={false}
    >
      <Title>Create New Event</Title>
      <Form onSubmit={handleSubmit}>
        <Label>
          Event Title:
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Label>
        <Label>
          Start:
          <Input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
        </Label>
        <Label>
          End:
          <Input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
          />
        </Label>
        <ButtonGroup>
          <Button type="submit">Save</Button>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
        </ButtonGroup>
      </Form>
    </StyledModal>
  );
};

const StyledModal = styled(Modal)`
  max-width: 400px;
  margin: auto;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  outline: none;
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  font-size: 0.95rem;
`;

const Input = styled.input`
  margin-top: 0.25rem;
  padding: 0.5rem;
  font-size: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: #ccc;
  color: #000;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #bbb;
  }
`;
