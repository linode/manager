import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { HostNamesDrawer } from './HostNamesDrawer';

// Mock the onClose function
const mockOnClose = vi.fn();

// Mock regions data
const mockRegions = [
  {
    id: 'region1',
    s3_endpoint: 'endpoint1',
  },
  {
    id: 'region2',
    s3_endpoint: 'endpoint2',
  },
];

describe('HostNamesDrawer', () => {
  it('renders the drawer with regions and copyable text', () => {
    renderWithTheme(
      <HostNamesDrawer
        onClose={mockOnClose}
        open={true}
        regions={mockRegions}
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
        name: 'Copy s3 Endpoint: region1: endpoint1 to clipboard',
      })
    ).toBeInTheDocument();
  });

  it('calls onClose when the drawer is closed', () => {
    renderWithTheme(
      <HostNamesDrawer
        onClose={mockOnClose}
        open={true}
        regions={mockRegions}
      />
    );

    const closeButton = screen.getByRole('button', { name: 'Close drawer' });
    userEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
