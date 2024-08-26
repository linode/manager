import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ActionsPanel } from '../ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from './ConfirmationDialog';

import type { ConfirmationDialogProps } from './ConfirmationDialog';

const props: ConfirmationDialogProps = {
  onClose: vi.fn(),
  open: true,
  title: 'This is a title',
};

describe('Confirmation Dialog', () => {
  it('renders the confirmation dialog', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <ConfirmationDialog {...props} />
    );

    expect(getByText('This is a title')).toBeVisible();
    expect(getByTestId('CloseIcon')).toBeVisible();
  });

  it("renders the dialog's children if they are provided", () => {
    const { getByText } = renderWithTheme(
      <ConfirmationDialog {...props}>
        <div>Confirmation dialog children</div>
      </ConfirmationDialog>
    );

    expect(getByText('Confirmation dialog children')).toBeVisible();
  });

  it('renders action items in the footer if they are provided', () => {
    const { getByText } = renderWithTheme(
      <ConfirmationDialog
        {...props}
        actions={
          <ActionsPanel
            primaryButtonProps={{ label: 'Continue' }}
            secondaryButtonProps={{ label: 'Cancel' }}
          />
        }
      />
    );

    expect(getByText('Continue')).toBeVisible();
    expect(getByText('Cancel')).toBeVisible();
  });

  it('renders the error message if it is provided', () => {
    const { getByText } = renderWithTheme(
      <ConfirmationDialog {...props} error={'This is an error'} />
    );

    expect(getByText('This is an error')).toBeVisible();
  });

  it('closes the confirmaton dialog if the X button is clicked', () => {
    const { getByTestId } = renderWithTheme(<ConfirmationDialog {...props} />);

    const closeButton = getByTestId('CloseIcon');
    expect(closeButton).toBeVisible();

    fireEvent.click(closeButton);
    expect(props.onClose).toHaveBeenCalled();
  });
});
