import { linodeInterfaceFactoryPublic } from '@linode/utilities';

import { firewallSettingsFactory } from 'src/factories';

import {
  getDefaultFirewallForInterfacePurpose,
  getLinodeInterfacePayload,
  transformLegacyInterfaceErrorsToLinodeInterfaceErrors,
} from './utilities';

import type { APIError } from '@linode/api-v4';

describe('getLinodeInterfacesPayload', () => {
  it('only retains the field of the given interface type', () => {
    const networkInterface = {
      ...linodeInterfaceFactoryPublic.build({
        public: {
          ipv4: {
            addresses: [
              {
                address: '10.0.0.0',
                primary: true,
              },
            ],
          },
          ipv6: {
            ranges: [],
          },
        },
        vlan: {
          ipam_address: '192.168.0.1',
          vlan_label: 'vlan-interface',
        },
        vpc: {
          ipv4: {
            addresses: [
              {
                address: '10.0.0.0',
                primary: true,
              },
            ],
            ranges: [],
          },
          subnet_id: 1,
          vpc_id: 1,
        },
      }),
      purpose: 'public' as const,
    };

    expect(getLinodeInterfacePayload(networkInterface)).toEqual({
      ...networkInterface,
      vlan: null,
      vpc: null,
    });
  });
});

describe('getLinodeInterfaceErrorsFromLegacyInterfaceErrors', () => {
  it('transforms a legacy error into a linodeInterface error', () => {
    const error: APIError[] = [
      { field: 'interfaces[1].subnet_id', reason: 'Fake message' },
    ];

    expect(
      transformLegacyInterfaceErrorsToLinodeInterfaceErrors(error)
    ).toStrictEqual([
      { field: 'linodeInterfaces[1].vpc.subnet_id', reason: 'Fake message' },
    ]);
  });

  it('handles a complex VPC IP range error', () => {
    const error: APIError[] = [
      { field: 'interfaces[1].ip_ranges[3]', reason: 'Range is invalid.' },
    ];

    expect(
      transformLegacyInterfaceErrorsToLinodeInterfaceErrors(error)
    ).toStrictEqual([
      {
        field: 'linodeInterfaces[1].vpc.ipv4.ranges.3.range',
        reason: 'Range is invalid.',
      },
    ]);
  });
});

describe('getDefaultFirewallForInterfacePurpose', () => {
  it('returns the public_interface setting when the purpose is public', () => {
    const settings = firewallSettingsFactory.build({
      default_firewall_ids: {
        linode: 1,
        nodebalancer: 2,
        public_interface: 3,
        vpc_interface: 4,
      },
    });

    expect(getDefaultFirewallForInterfacePurpose('public', settings)).toBe(3);
  });

  it('returns the vpc_interface setting when the purpose is vpc', () => {
    const settings = firewallSettingsFactory.build({
      default_firewall_ids: {
        linode: 1,
        nodebalancer: 2,
        public_interface: 3,
        vpc_interface: 4,
      },
    });

    expect(getDefaultFirewallForInterfacePurpose('vpc', settings)).toBe(4);
  });

  it('returns null setting when the purpose is vlan', () => {
    // VLAN does not support Firewalls

    const settings = firewallSettingsFactory.build({
      default_firewall_ids: {
        linode: 1,
        nodebalancer: 2,
        public_interface: 3,
        vpc_interface: 4,
      },
    });

    expect(getDefaultFirewallForInterfacePurpose('vlan', settings)).toBeNull();
  });

  it('returns null if firewall settings are null', () => {
    expect(getDefaultFirewallForInterfacePurpose('public', null)).toBeNull();
  });
});
