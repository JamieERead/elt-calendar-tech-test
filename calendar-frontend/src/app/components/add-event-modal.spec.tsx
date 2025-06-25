import { render, screen, fireEvent } from '@testing-library/react';
import { AddEventModal } from './add-event-modal';
import '@testing-library/jest-dom';
import moment from 'moment';

describe('AddEventModal', () => {
  const now = moment().format('YYYY-MM-DDTHH:mm');
  const oneHourLater = moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm');

  const setup = () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    render(<AddEventModal isOpen={true} onClose={onClose} onSave={onSave} />);

    return { onSave, onClose };
  };

  it('renders modal with form fields', () => {
    setup();
    expect(screen.getByText('Create New Event')).toBeInTheDocument();
    expect(screen.getByLabelText('Event Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Start:')).toHaveValue(now);
    expect(screen.getByLabelText('End:')).toHaveValue(oneHourLater);
  });

  it('calls onSave and onClose with correct data on submit', () => {
    const { onSave, onClose } = setup();

    fireEvent.change(screen.getByLabelText('Event Name:'), {
      target: { value: 'My Test Event' },
    });

    fireEvent.change(screen.getByLabelText('Start:'), {
      target: { value: '2025-01-01T10:00' },
    });

    fireEvent.change(screen.getByLabelText('End:'), {
      target: { value: '2025-01-01T11:00' },
    });

    fireEvent.click(screen.getByText('Save'));

    expect(onSave).toHaveBeenCalledWith({
      name: 'My Test Event',
      start: new Date('2025-01-01T10:00'),
      end: new Date('2025-01-01T11:00'),
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Cancel is clicked', () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
