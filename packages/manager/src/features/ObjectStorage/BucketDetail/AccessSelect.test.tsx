import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AccessSelect } from './AccessSelect';

import type { Props } from './AccessSelect';
import type { ObjectStorageEndpointTypes } from '@linode/api-v4';

const CORS_ENABLED_TEXT = 'CORS Enabled';
const AUTHENTICATED_READ_TEXT = 'Authenticated Read';

vi.mock('src/components/EnhancedSelect/Select');

const mockGetAccess = vi.fn().mockResolvedValue({
  acl: 'private',
  cors_enabled: true,
});
const mockUpdateAccess = vi.fn().mockResolvedValue({});

const defaultProps: Props = {
  endpointType: 'E1',
  getAccess: mockGetAccess,
  name: 'my-object-name',
  updateAccess: mockUpdateAccess,
  variant: 'bucket',
};

describe('AccessSelect', () => {
  const renderComponent = (props: Partial<Props> = {}) =>
    renderWithTheme(<AccessSelect {...defaultProps} {...props} />);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['bucket', 'E0', true],
    ['bucket', 'E1', true],
    ['bucket', 'E2', false],
    ['bucket', 'E3', false],
    ['object', 'E0', true],
    ['object', 'E1', true],
    ['object', 'E2', false],
    ['object', 'E3', false],
  ])(
    'shows correct UI for %s variant and %s endpoint type',
    async (variant, endpointType, shouldShowCORS) => {
      renderComponent({
        endpointType: endpointType as ObjectStorageEndpointTypes,
        variant: variant as 'bucket' | 'object',
      });

      const aclSelect = screen.getByRole('combobox');

      await waitFor(() => {
        expect(aclSelect).toBeEnabled();
        expect(aclSelect).toHaveValue('Private');
      });

      act(() => {
        fireEvent.click(aclSelect);
        fireEvent.change(aclSelect, { target: { value: 'P' } });
      });

      expect(screen.getByText('Private').closest('li')).toHaveAttribute(
        'aria-selected',
        'true'
      );

      if (shouldShowCORS) {
        await waitFor(() => {
          expect(screen.getByLabelText(CORS_ENABLED_TEXT)).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(
            screen.getByRole('checkbox', { name: CORS_ENABLED_TEXT })
          ).toBeChecked();
        });
      } else {
        await waitFor(() => {
          expect(
            screen.queryByLabelText(CORS_ENABLED_TEXT)
          ).not.toBeInTheDocument();
        });
      }
    }
  );

  it('updates the access and CORS settings and submits the appropriate values', async () => {
    renderComponent();

    const aclSelect = screen.getByRole('combobox');
    const saveButton = screen.getByText('Save').closest('button')!;

    await waitFor(() => {
      expect(aclSelect).toBeEnabled();
      expect(aclSelect).toHaveValue('Private');
    });

    // Wait for CORS toggle to appear and be checked
    const corsToggle = await screen.findByRole('checkbox', {
      name: CORS_ENABLED_TEXT,
    });
    expect(corsToggle).toBeChecked();

    act(() => {
      // Open the dropdown
      fireEvent.click(aclSelect);

      // Type to filter options
      fireEvent.change(aclSelect, {
        target: { value: AUTHENTICATED_READ_TEXT },
      });
    });

    // Wait for and select the "Authenticated Read" option
    const authenticatedReadOption = await screen.findByText(
      AUTHENTICATED_READ_TEXT
    );
    await userEvent.click(authenticatedReadOption);

    await userEvent.click(corsToggle);

    await waitFor(() => {
      expect(aclSelect).toHaveValue(AUTHENTICATED_READ_TEXT);
      expect(corsToggle).not.toBeChecked();
      expect(saveButton).toBeEnabled();
    });

    await userEvent.click(saveButton);
    expect(mockUpdateAccess).toHaveBeenCalledWith('authenticated-read', false);

    await userEvent.click(corsToggle);
    await waitFor(() => expect(corsToggle).toBeChecked());

    await userEvent.click(saveButton);
    expect(mockUpdateAccess).toHaveBeenCalledWith('authenticated-read', true);
  });
});
