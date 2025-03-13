import * as React from 'react';

import { firewallDeviceFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { FirewallDeviceTable } from './FirewallDeviceTable';

import type { FirewallDeviceTableProps } from './FirewallDeviceTable';
import type { FirewallDeviceEntityType } from '@linode/api-v4';

const devices = ['linode', 'nodebalancer'];

const props = (type: FirewallDeviceEntityType): FirewallDeviceTableProps => ({
  deviceType: type,
  disabled: false,
  firewallId: 1,
  handleRemoveDevice: vi.fn(),
  type,
});

const queryMocks = vi.hoisted(() => ({
  useAllFirewallDevicesQuery: vi.fn().mockReturnValue({}),
  useNavigate: vi.fn(() => vi.fn()),
  useSearch: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useSearch: queryMocks.useSearch,
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllFirewallDevicesQuery: queryMocks.useAllFirewallDevicesQuery,
  };
});

devices.forEach((device: FirewallDeviceEntityType) => {
  describe(`Firewall ${device} table`, () => {
    it('should render', () => {
      const { getByRole } = renderWithTheme(
        <FirewallDeviceTable {...props(device)} />
      );
      const table = getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('should contain two rows', () => {
      queryMocks.useAllFirewallDevicesQuery.mockReturnValue({
        data: firewallDeviceFactory.buildList(2, {
          entity: {
            id: 1,
            label: `test-${device}`,
            type: device,
          },
        }),
        error: null,
        isLoading: false,
      });
      const { getAllByRole } = renderWithTheme(
        <FirewallDeviceTable {...props(device)} />
      );
      const rows = getAllByRole('row');
      expect(rows.length - 1).toBe(2);
    });
  });
});
