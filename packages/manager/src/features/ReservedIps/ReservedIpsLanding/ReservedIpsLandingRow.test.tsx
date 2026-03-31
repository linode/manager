import * as React from 'react';

import { reservedIPsFactory } from 'src/factories/networking';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ReservedIpsLandingRow } from './ReservedIpsLandingRow';

import type { ReservedIpsActionHandlers } from './ReservedIpsActionMenu';

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
        regionLabel="Newark, NJ"
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
        regionLabel="Newark, NJ"
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
        regionLabel="Newark, NJ"
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
        regionLabel="Newark, NJ"
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
        regionLabel="Krakow, PL"
      />
    );

    expect(getByText('Krakow, PL')).toBeVisible();
  });

  it('renders visible tags as chips', () => {
    const ip = reservedIPsFactory.build({
      tags: ['web', 'production', 'staging'],
    });

    const { getByText } = renderWithTheme(
      <ReservedIpsLandingRow
        handlers={mockHandlers}
        ip={ip}
        regionLabel="Newark, NJ"
      />
    );

    expect(getByText('web')).toBeVisible();
    expect(getByText('production')).toBeVisible();
    expect(getByText('staging')).toBeVisible();
  });

  it('renders a ShowMore chip when there are more than 3 tags', () => {
    const ip = reservedIPsFactory.build({
      tags: ['web', 'production', 'staging', 'db', 'internal'],
    });

    const { getByText } = renderWithTheme(
      <ReservedIpsLandingRow
        handlers={mockHandlers}
        ip={ip}
        regionLabel="Newark, NJ"
      />
    );

    expect(getByText('web')).toBeVisible();
    expect(getByText('production')).toBeVisible();
    expect(getByText('staging')).toBeVisible();
    expect(getByText('+2')).toBeVisible();
  });

  it('renders no tags when the tags array is empty', () => {
    const ip = reservedIPsFactory.build({ tags: [] });

    const { queryByTestId } = renderWithTheme(
      <ReservedIpsLandingRow
        handlers={mockHandlers}
        ip={ip}
        regionLabel="Newark, NJ"
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
        regionLabel="Newark, NJ"
      />
    );

    expect(
      getByLabelText(`Action menu for Reserved IP ${ip.address}`)
    ).toBeVisible();
  });
});
