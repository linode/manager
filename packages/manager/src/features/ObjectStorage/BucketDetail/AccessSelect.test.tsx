import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AccessSelect } from './AccessSelect';

import type { Props } from './AccessSelect';

vi.mock('src/components/EnhancedSelect/Select');

const mockGetAccess = vi.fn();
const mockUpdateAccess = vi.fn();

const props: Props = {
  endpointType: 'E1',
  getAccess: mockGetAccess.mockResolvedValue({
    acl: 'private',
    cors_enabled: true,
  }),
  name: 'my-object-name',
  updateAccess: mockUpdateAccess.mockResolvedValue({}),
  variant: 'bucket',
};

describe('AccessSelect', () => {
  it('shows the access and CORS toggle for bucket variant', async () => {
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

    expect(screen.getByLabelText('CORS Enabled')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'CORS Enabled' })
    ).toBeChecked();
  });

  it('updates the access and CORS settings and submits the appropriate values', async () => {
    renderWithTheme(<AccessSelect {...props} />);

    const aclSelect = screen.getByRole('combobox');
    const saveButton = screen.getByText('Save').closest('button')!;

    await waitFor(() => {
      expect(aclSelect).toBeEnabled();
      expect(aclSelect).toHaveValue('Private');
    });

    const corsToggle = screen.getByRole('checkbox', { name: 'CORS Enabled' });

    // Verify initial state
    expect(corsToggle).toBeChecked();

    act(() => {
      fireEvent.click(aclSelect);
      fireEvent.change(aclSelect, { target: { value: 'Authenticated Read' } });
    });

    userEvent.click(screen.getByText('Authenticated Read'));
    userEvent.click(corsToggle);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveValue('Authenticated Read');
      expect(corsToggle).not.toBeChecked();
      expect(saveButton).toBeEnabled();
    });

    fireEvent.click(saveButton);
    expect(mockUpdateAccess).toHaveBeenCalledWith('authenticated-read', false);

    // Test toggling CORS back on
    userEvent.click(corsToggle);

    await waitFor(() => {
      expect(corsToggle).toBeChecked();
    });

    fireEvent.click(saveButton);
    expect(mockUpdateAccess).toHaveBeenCalledWith('authenticated-read', true);
  });

  it('does not show CORS toggle for E2 and E3 endpoint types', async () => {
    renderWithTheme(<AccessSelect {...props} endpointType="E2" />);
    await waitFor(() => {
      expect(screen.queryByLabelText('CORS Enabled')).not.toBeInTheDocument();
    });

    renderWithTheme(<AccessSelect {...props} endpointType="E3" />);
    await waitFor(() => {
      expect(screen.queryByLabelText('CORS Enabled')).not.toBeInTheDocument();
    });
  });
});
