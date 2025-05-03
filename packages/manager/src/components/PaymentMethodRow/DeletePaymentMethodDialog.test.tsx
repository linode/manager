import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DeletePaymentMethodDialog } from './DeletePaymentMethodDialog';

const props = {
  error: undefined,
  loading: false,
  onClose: vi.fn(),
  onDelete: vi.fn(),
  open: true,
  paymentMethod: undefined,
};

describe('Delete Payment Method Dialog', () => {
  it('renders the delete payment method dialog', () => {
    const screen = renderWithTheme(<DeletePaymentMethodDialog {...props} />);

    const headerText = screen.getByText('Delete Payment Method');
    expect(headerText).toBeVisible();

    const deleteText = screen.getByText(
      'Are you sure you want to delete this payment method?'
    );
    expect(deleteText).toBeVisible();

    const buttons = screen.getAllByRole('button');
    expect(buttons?.length).toBe(3);
  });

  it('calls the corresponding functions when buttons are clicked', () => {
    const screen = renderWithTheme(<DeletePaymentMethodDialog {...props} />);

    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toBeVisible();
    fireEvent.click(deleteButton);
    expect(props.onDelete).toHaveBeenCalled();

    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeVisible();
    fireEvent.click(cancelButton);
    expect(props.onClose).toHaveBeenCalled();
  });
});
