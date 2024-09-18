import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AvatarColorPickerDialog } from './AvatarColorPickerDialog';

import type { AvatarColorPickerDialogProps } from './AvatarColorPickerDialog';

const mockProps: AvatarColorPickerDialogProps = {
  handleClose: vi.fn(),
  open: true,
};

describe('AvatarColorPicker', () => {
  it('should render a dialog with a title, color picker, and avatar components', () => {
    const { getByLabelText, getByTestId, getByTitle } = renderWithTheme(
      <AvatarColorPickerDialog {...mockProps} />
    );

    expect(getByTitle('Change Avatar Color')).toBeVisible();
    expect(getByLabelText('Avatar color picker')).toBeVisible();
    expect(getByTestId('avatar')).toBeVisible();
  });

  it('calls onClose when Close/X buttons are clicked', async () => {
    const { getAllByRole } = renderWithTheme(
      <AvatarColorPickerDialog {...mockProps} />
    );

    const closeButtons = getAllByRole('button', { name: 'Close' });
    closeButtons.forEach(async (button) => {
      await userEvent.click(button);
      expect(mockProps.handleClose).toHaveBeenCalled();
    });
  });

  it('confirms when Save button is enabled and the dialog closes when Save is clicked', async () => {
    const { getByLabelText, getByRole } = renderWithTheme(
      <AvatarColorPickerDialog {...mockProps} />
    );

    const saveButton = getByRole('button', { name: 'Save' });

    expect(saveButton).toBeDisabled();

    fireEvent.input(getByLabelText('Avatar color picker'), {
      target: { value: '#333333' },
    });

    // Verify save button becomes enabled after changing the color
    expect(saveButton).toBeEnabled();

    await userEvent.click(saveButton);

    // Verify dialog closes after saving
    expect(mockProps.handleClose).toHaveBeenCalled();
  });
});
