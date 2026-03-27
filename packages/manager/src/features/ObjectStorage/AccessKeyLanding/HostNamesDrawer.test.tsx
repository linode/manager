import { regionFactory } from '@linode/utilities';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { objectStorageKeyFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { HostNamesDrawer } from './HostNamesDrawer';

// Mock the onClose function
const mockOnClose = vi.fn();

const mockAccessKey = objectStorageKeyFactory.build({
  regions: [
    {
      id: 'region1',
      s3_endpoint: 'endpoint1',
    },
    {
      id: 'region2',
      s3_endpoint: 'endpoint2',
    },
  ],
});

vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
  useRegionsQuery: vi.fn(() => ({
    data: [
      ...regionFactory.buildList(1, { id: 'region1', label: 'Newark, NJ' }),
      ...regionFactory.buildList(1, { id: 'region2', label: 'Atlanta, GA' }),
    ],
  })),
}));

describe('HostNamesDrawer', () => {
  it('renders the drawer with regions and copyable text', () => {
    renderWithTheme(
      <HostNamesDrawer
        isOpen={true}
        objectStorageKey={mockAccessKey}
        onClose={mockOnClose}
      />
    );

    expect(
      screen.getByRole('dialog', { name: 'Regions / S3 Hostnames' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Regions / S3 Hostnames' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'region1: endpoint1' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Copy Atlanta, GA: endpoint2 to clipboard',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Copy Newark, NJ: endpoint1 to clipboard',
      })
    ).toBeInTheDocument();
  });

  it('calls onClose when the drawer is closed', async () => {
    renderWithTheme(
      <HostNamesDrawer
        isOpen={true}
        objectStorageKey={mockAccessKey}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: 'Close drawer' });
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
