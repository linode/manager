import { capitalize } from '@linode/utilities';
import { render } from '@testing-library/react';
import * as React from 'react';

import { firewalls } from 'src/__data__/firewalls';
import { accountFactory } from 'src/factories';
import {
  firewallDeviceFactory,
  firewallFactory,
} from 'src/factories/firewalls';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import {
  FirewallRow,
  getCountOfRules,
  getDeviceLinks,
  getRuleString,
} from './FirewallRow';

import type { FirewallDeviceEntityType } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useAccount: vi.fn().mockReturnValue({}),
  useFirewallSettingsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccount: queryMocks.useAccount,
    useFirewallSettingsQuery: queryMocks.useFirewallSettingsQuery,
  };
});

beforeAll(() => mockMatchMedia());

describe('FirewallRow', () => {
  describe('Utility functions', () => {
    it('should return correct number of inbound and outbound rules', () => {
      expect(getCountOfRules(firewalls[0].rules)).toEqual([1, 1]);
      expect(getCountOfRules(firewalls[1].rules)).toEqual([0, 2]);
    });

    it('should return the correct string given an array of numbers', () => {
      expect(getRuleString([1, 2])).toBe('1 Inbound / 2 Outbound');
      expect(getRuleString([1, 0])).toBe('1 Inbound');
      expect(getRuleString([0, 1])).toBe('1 Outbound');
    });

    it('should return "No rules" when there are no rules', () => {
      expect(getRuleString([0, 0])).toMatch(/no rules/gi);
    });
  });

  describe('FirewallRow component', () => {
    const firewall = firewallFactory.build();

    const mockTriggerDeleteFirewall = vi.fn();
    const mockTriggerDisableFirewall = vi.fn();
    const mockTriggerEnableFirewall = vi.fn();

    const baseProps = {
      ...firewall,
      triggerDeleteFirewall: mockTriggerDeleteFirewall,
      triggerDisableFirewall: mockTriggerDisableFirewall,
      triggerEnableFirewall: mockTriggerEnableFirewall,
    };

    it('renders a TableRow with the default firewall chip, status, rules, and Linodes', () => {
      queryMocks.useFirewallSettingsQuery.mockReturnValue({
        data: {
          default_firewall_ids: {
            linode: null,
            nodebalancer: null,
            public_interface: 1,
            vpc_interface: null,
          },
        },
      });
      queryMocks.useAccount.mockReturnValue({
        data: accountFactory.build({ capabilities: ['Linode Interfaces'] }),
      });

      const { getByTestId, getByText } = render(
        wrapWithTableBody(<FirewallRow {...baseProps} />, {
          flags: { linodeInterfaces: { enabled: true } },
        })
      );
      getByTestId('firewall-row-1');
      getByText(firewall.label);
      getByText('DEFAULT');
    });

    it('renders a TableRow with label, status, rules, and Linodes', () => {
      const { getByTestId, getByText } = render(
        wrapWithTableBody(<FirewallRow {...baseProps} />)
      );
      getByTestId('firewall-row-1');
      getByText(firewall.label);
      getByText(capitalize(firewall.status));
      getByText(getRuleString(getCountOfRules(firewall.rules)));
    });
  });

  describe('getDeviceLinks', () => {
    it('should return a single Link if one Device is attached', () => {
      const device = firewallDeviceFactory.build();
      const links = getDeviceLinks({
        entities: [device.entity],
      });
      const { getByText } = renderWithTheme(links);
      expect(getByText(device.entity.label ?? ''));
    });

    it('should show the Linode label for a link for an interface device', () => {
      const device = firewallDeviceFactory.build({
        entity: {
          id: 10,
          label: null,
          type: 'linode_interface' as FirewallDeviceEntityType,
          url: '/linodes/11/interfaces/10',
          parent_entity: {
            id: 11,
            label: 'test-linode-label',
            type: 'linode' as FirewallDeviceEntityType,
            url: '/linodes/11',
            parent_entity: null,
          },
        },
      });

      const links = getDeviceLinks({
        entities: [device.entity],
      });
      const { getByText } = renderWithTheme(links);
      expect(getByText('test-linode-label')).toBeVisible();
    });

    it('should render up to three comma-separated links', () => {
      const devices = firewallDeviceFactory.buildList(3);
      const links = getDeviceLinks({
        entities: devices.map((device) => device.entity),
      });
      const { queryAllByTestId } = renderWithTheme(links);
      expect(queryAllByTestId('firewall-row-link')).toHaveLength(3);
    });

    it('should render "plus N more" text for any devices over three', () => {
      const devices = firewallDeviceFactory.buildList(13);
      const links = getDeviceLinks({
        entities: devices.map((device) => device.entity),
      });
      const { getByText, queryAllByTestId } = renderWithTheme(links);
      expect(queryAllByTestId('firewall-row-link')).toHaveLength(3);
      expect(getByText(/10 more/));
    });
  });
});
