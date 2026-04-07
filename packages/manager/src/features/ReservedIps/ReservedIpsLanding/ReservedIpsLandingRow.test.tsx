import * as React from 'react';

import { reservedIPsFactory } from 'src/factories/networking';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ReservedIpsLandingRow } from './ReservedIpsLandingRow';

import type { ReservedIpsActionHandlers } from './ReservedIpsActionMenu';

vi.mock('@mui/material', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mui/material')>();
  return {
    ...actual,
    useMediaQuery: vi.fn().mockReturnValue(true),
  };
});

const mockHandlers: ReservedIpsActionHandlers = {
  onEdit: vi.fn(),
  onUnreserve: vi.fn(),
};

describe('ReservedIpsLandingRow', () => {
  it('renders the IP address', () => {
    const ip = reservedIPsFactory.build({ address: '203.0.113.10' });

    const { getByText } = renderWithTheme(
      <ReservedIpsLandingRow
        handlers={mockHandlers}
        ip={ip}
        regionLabel="PL, Krakow"
      />
    );

    expect(getByText('203.0.113.10')).toBeVisible();
  });

  it('renders the assigned entity label as a link for a linode', () => {
    const ip = reservedIPsFactory.build({
      assigned_entity: {
        id: 123,
        label: 'my-linode',
        type: 'linode',
        url: '/v4/linode/instances/123',
      },
    });

    const { getByRole } = renderWithTheme(
      <ReservedIpsLandingRow
        handlers={mockHandlers}
        ip={ip}
        regionLabel="PL, Krakow"
      />
    );

    const link = getByRole('link', { name: /my-linode/i });
    expect(link).toBeVisible();
    expect(link).toHaveAttribute('href', '/linodes/123');
  });

  it('renders the assigned entity label as a link for a nodebalancer', () => {
    const ip = reservedIPsFactory.build({
      assigned_entity: {
        id: 456,
        label: 'my-nodebalancer',
        type: 'nodebalancer',
        url: '/v4/nodebalancers/456',
      },
    });

    const { getByRole } = renderWithTheme(
      <ReservedIpsLandingRow
        handlers={mockHandlers}
        ip={ip}
        regionLabel="PL, Krakow"
      />
    );

    const link = getByRole('link', { name: /my-nodebalancer/i });
    expect(link).toBeVisible();
    expect(link).toHaveAttribute('href', '/nodebalancers/456');
  });

  it('renders "Unassigned" when there is no assigned entity', () => {
    const ip = reservedIPsFactory.build({ assigned_entity: null });

    const { getByText } = renderWithTheme(
      <ReservedIpsLandingRow
        handlers={mockHandlers}
        ip={ip}
        regionLabel="PL, Krakow"
      />
    );

    expect(getByText('Unassigned')).toBeVisible();
  });

  it('renders the region label', () => {
    const ip = reservedIPsFactory.build();

    const { getByText } = renderWithTheme(
      <ReservedIpsLandingRow
        handlers={mockHandlers}
        ip={ip}
        regionLabel="PL, Krakow"
      />
    );

    expect(getByText('PL, Krakow')).toBeVisible();
  });

  it('renders visible tags as chips', () => {
    const ip = reservedIPsFactory.build({
      tags: ['web', 'production'],
    });

    const { getByText } = renderWithTheme(
      <ReservedIpsLandingRow
        handlers={mockHandlers}
        ip={ip}
        regionLabel="PL, Krakow"
      />
    );

    expect(getByText('web')).toBeInTheDocument();
    expect(getByText('production')).toBeInTheDocument();
  });

  it('renders a ShowMore chip when there are more than 2 tags', () => {
    const ip = reservedIPsFactory.build({
      tags: ['web', 'production', 'staging', 'db', 'internal'],
    });

    const { getByText } = renderWithTheme(
      <ReservedIpsLandingRow
        handlers={mockHandlers}
        ip={ip}
        regionLabel="PL, Krakow"
      />
    );

    expect(getByText('web')).toBeVisible();
    expect(getByText('production')).toBeVisible();
    expect(getByText('+3')).toBeVisible();
  });

  it('renders no tags when the tags array is empty', () => {
    const ip = reservedIPsFactory.build({ tags: [] });

    const { queryByTestId } = renderWithTheme(
      <ReservedIpsLandingRow
        handlers={mockHandlers}
        ip={ip}
        regionLabel="PL, Krakow"
      />
    );

    expect(queryByTestId('show-more')).not.toBeInTheDocument();
  });

  it('renders the action menu', () => {
    const ip = reservedIPsFactory.build();

    const { getByLabelText } = renderWithTheme(
      <ReservedIpsLandingRow
        handlers={mockHandlers}
        ip={ip}
        regionLabel="PL, Krakow"
      />
    );

    expect(
      getByLabelText(`Action menu for Reserved IP ${ip.address}`)
    ).toBeVisible();
  });
});
