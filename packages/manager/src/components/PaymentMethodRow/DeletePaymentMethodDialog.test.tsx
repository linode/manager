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

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      delete_payment_method: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('Delete Payment Method Dialog', () => {
  it('renders the delete payment method dialog', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        delete_payment_method: true,
      },
    });

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
    queryMocks.userPermissions.mockReturnValue({
      data: {
        delete_payment_method: true,
      },
    });

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

  it('disables the delete button if the user does not have the delete_payment_method permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        delete_payment_method: false,
      },
    });

    const screen = renderWithTheme(<DeletePaymentMethodDialog {...props} />);

    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toBeDisabled();
  });
});
