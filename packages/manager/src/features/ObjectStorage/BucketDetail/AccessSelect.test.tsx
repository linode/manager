import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AccessSelect, Props } from './AccessSelect';

vi.mock('src/components/EnhancedSelect/Select');

const mockGetAccess = vi.fn();
const mockUpdateAccess = vi.fn();

const props: Props = {
  getAccess: mockGetAccess.mockResolvedValue({ acl: 'private' }),
  name: 'my-object-name',
  updateAccess: mockUpdateAccess.mockResolvedValue({}),
  variant: 'object',
};

describe('AccessSelect', () => {
  it('shows the access', async () => {
    renderWithTheme(<AccessSelect {...props} />);
    const aclSelect = screen.getByRole('combobox');

    // Confirm that combobox input field value is 'Private'.
    await waitFor(() => {
      expect(aclSelect).toBeEnabled();
      expect(aclSelect).toHaveValue('Private');
    });

    // Confirm that 'Private' is selected upon opening the Autocomplete drop-down.
    act(() => {
      fireEvent.click(aclSelect);
      fireEvent.change(aclSelect, { target: { value: 'P' } });
    });

    expect(screen.getByText('Private').closest('li')!).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('updates the access and submits the appropriate value', async () => {
    renderWithTheme(<AccessSelect {...props} />);

    const aclSelect = screen.getByRole('combobox');
    const saveButton = screen.getByText('Save').closest('button')!;

    await waitFor(() => {
      expect(aclSelect).toBeEnabled();
      expect(aclSelect).toHaveValue('Private');
    });

    act(() => {
      fireEvent.click(aclSelect);
      fireEvent.change(aclSelect, { target: { value: 'Authenticated Read' } });
    });

    expect(aclSelect).toHaveValue('Authenticated Read');
    userEvent.click(screen.getByText('Authenticated Read'));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveValue('Authenticated Read');
      expect(saveButton).toBeEnabled();
    });

    fireEvent.click(saveButton);
    expect(mockUpdateAccess).toHaveBeenCalledWith('authenticated-read', true);
  });
});
