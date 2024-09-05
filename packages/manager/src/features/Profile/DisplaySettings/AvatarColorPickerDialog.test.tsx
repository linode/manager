import { fireEvent } from '@testing-library/react';
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

  it('calls onClose when Close button is clicked', async () => {
    const { getByText } = renderWithTheme(
      <AvatarColorPickerDialog {...mockProps} />
    );

    await fireEvent.click(getByText('Close'));
    expect(mockProps.handleClose).toHaveBeenCalledOnce();
  });

  it.skip('closes when Save button is clicked', async () => {
    const { getByText, queryByTitle } = renderWithTheme(
      <AvatarColorPickerDialog {...mockProps} />
    );

    await fireEvent.click(getByText('Save'));
    expect(queryByTitle('Change Avatar Color')).toBe(null);
  });
});
