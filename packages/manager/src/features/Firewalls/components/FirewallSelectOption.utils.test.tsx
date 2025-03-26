import { firewallSettingsFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  getDefaultFirewallDescription,
  getEntitiesThatFirewallIsDefaultFor,
} from './FirewallSelectOption.utils';

describe('getEntitiesThatFirewallIsDefaultFor', () => {
  it('returns entities that a firewall is a default for', () => {
    const firewallSettings = firewallSettingsFactory.build({
      default_firewall_ids: {
        linode: 4,
        nodebalancer: 4,
        public_interface: 4,
        vpc_interface: 1,
      },
    });

    expect(getEntitiesThatFirewallIsDefaultFor(4, firewallSettings)).toEqual([
      'linode',
      'nodebalancer',
      'public_interface',
    ]);
  });

  it('returns an empty array if the firewall is not a default for anything', () => {
    const firewallSettings = firewallSettingsFactory.build({
      default_firewall_ids: {
        linode: 4,
        nodebalancer: 4,
        public_interface: 4,
        vpc_interface: 4,
      },
    });

    expect(getEntitiesThatFirewallIsDefaultFor(1, firewallSettings)).toEqual(
      []
    );
  });

  it('returns an empty array if the user has no default firewalls set', () => {
    const firewallSettings = firewallSettingsFactory.build({
      default_firewall_ids: {
        linode: null,
        nodebalancer: null,
        public_interface: null,
        vpc_interface: null,
      },
    });

    expect(getEntitiesThatFirewallIsDefaultFor(1, firewallSettings)).toEqual(
      []
    );
  });
});

describe('getDefaultFirewallDescription', () => {
  it('returns null if a firewall is not a default for anything', () => {
    const firewallSettings = firewallSettingsFactory.build({
      default_firewall_ids: {
        linode: 4,
        nodebalancer: 4,
        public_interface: 4,
        vpc_interface: 1,
      },
    });

    expect(getDefaultFirewallDescription(2, firewallSettings)).toEqual(null);
  });

  it('returns human readable text when the firewall is a default for one type of entity', () => {
    const firewallSettings = firewallSettingsFactory.build({
      default_firewall_ids: {
        linode: 4,
        nodebalancer: 4,
        public_interface: 4,
        vpc_interface: 1,
      },
    });

    const { getByText } = renderWithTheme(
      getDefaultFirewallDescription(1, firewallSettings)
    );

    expect(getByText('VPC (Linode Interfaces)')).toBeVisible();
  });

  it('returns human readable text when the firewall is a default for three types of entities', () => {
    const firewallSettings = firewallSettingsFactory.build({
      default_firewall_ids: {
        linode: 4,
        nodebalancer: 4,
        public_interface: 4,
        vpc_interface: 1,
      },
    });

    const { getByText, queryByText } = renderWithTheme(
      getDefaultFirewallDescription(4, firewallSettings)
    );

    expect(getByText('NodeBalancers')).toBeVisible();
    expect(getByText('Public (Linode Interfaces)')).toBeVisible();
    expect(getByText('Configuration Profile Interfaces')).toBeVisible();
    expect(queryByText('VPC (Linode Interfaces)')).toBeNull();
  });
});
