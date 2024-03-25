import { fireEvent, screen, waitFor } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AccessSelect, Props } from './AccessSelect';

vi.mock('src/components/EnhancedSelect/Select');

const mockGetAccess = vi.fn();
const mockUpdateAccess = vi.fn();

const props: Props = {
  getAccess: mockGetAccess.mockResolvedValue({
    acl: 'public-read',
    cors_enabled: true,
  }),
  name: 'my-object-name',
  updateAccess: mockUpdateAccess,
  variant: 'object',
};

describe('AccessSelect', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetAccess.mockResolvedValue({ acl: 'public-read', cors_enabled: true });
    mockUpdateAccess.mockResolvedValue({});
  });

  it('shows the access', async () => {
    renderWithTheme(<AccessSelect {...props} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveValue('Public Read');
    });
  });

  it('updates the access and submits the appropriate value', async () => {
    renderWithTheme(<AccessSelect {...props} />);

    await waitFor(() => {
      const aclSelect = screen.getByRole('combobox');
      fireEvent.change(aclSelect, {
        target: { value: 'private' },
      });

      expect(screen.getByRole('combobox')).toHaveValue('Public Read');
    });
  });
});
