import {
  linodeConfigInterfaceFactory,
  linodeConfigInterfaceFactoryWithVPC,
  linodeInterfaceFactoryVPC,
} from '@linode/utilities';

import { linodeConfigFactory } from 'src/factories/linodeConfigs';
import {
  subnetAssignedLinodeDataFactory,
  subnetFactory,
} from 'src/factories/subnets';

import {
  getLinodeInterfacePrimaryIPv4,
  getLinodeInterfaceRanges,
  getUniqueResourcesFromSubnets,
  getVPCInterfacePayload,
  hasUnrecommendedConfiguration,
  hasUnrecommendedConfigurationLinodeInterface,
  transformLinodeInterfaceErrorsToFormikErrors,
} from './utils';

import type { APIError } from '@linode/api-v4';

const subnetLinodeInfoList1 = subnetAssignedLinodeDataFactory.buildList(4);
const subnetLinodeInfoId1 = subnetAssignedLinodeDataFactory.build({ id: 1 });
const subnetLinodeInfoId3 = subnetAssignedLinodeDataFactory.build({ id: 3 });

describe('getUniqueResourcesFromSubnets', () => {
  it(`returns the number of unique linodes and nodeBalancers within a VPC's subnets`, () => {
    const subnets0 = [subnetFactory.build({ linodes: [], nodebalancers: [] })];
    const subnets1 = [subnetFactory.build({ linodes: subnetLinodeInfoList1 })];
    const subnets2 = [
      subnetFactory.build({
        linodes: [
          subnetLinodeInfoId1,
          subnetLinodeInfoId1,
          subnetLinodeInfoId3,
          subnetLinodeInfoId3,
        ],
      }),
    ];
    const subnets3 = [
      subnetFactory.build({ linodes: subnetLinodeInfoList1 }),
      subnetFactory.build({ linodes: [] }),
      subnetFactory.build({ linodes: [subnetLinodeInfoId3] }),
      subnetFactory.build({
        linodes: [
          subnetAssignedLinodeDataFactory.build({ id: 6 }),
          subnetAssignedLinodeDataFactory.build({ id: 7 }),
          subnetAssignedLinodeDataFactory.build({ id: 8 }),
          subnetAssignedLinodeDataFactory.build({ id: 9 }),
          subnetLinodeInfoId1,
        ],
      }),
    ];

    expect(getUniqueResourcesFromSubnets(subnets0)).toBe(0);
    expect(getUniqueResourcesFromSubnets(subnets1)).toBe(7);
    expect(getUniqueResourcesFromSubnets(subnets2)).toBe(5);
    // updated factory for generating linode ids, so unique linodes will be different
    expect(getUniqueResourcesFromSubnets(subnets3)).toBe(20);
  });
});

describe('hasUnrecommendedConfiguration function', () => {
  it('returns true if the given config has an active VPC interface and a non-VPC primary interface', () => {
    const publicInterface = linodeConfigInterfaceFactory.build({
      id: 10,
      primary: true,
    });

    const vpcInterface = linodeConfigInterfaceFactoryWithVPC.build({
      active: true,
      id: 20,
      subnet_id: 1,
    });

    const config1 = linodeConfigFactory.build({
      interfaces: [publicInterface, vpcInterface],
    });

    const subnet = subnetFactory.build({
      id: 1,
      linodes: [
        subnetAssignedLinodeDataFactory.build({
          id: 5,
          interfaces: [
            {
              active: true,
              id: 20,
            },
            {
              active: true,
              id: 10,
            },
          ],
        }),
      ],
    });

    expect(hasUnrecommendedConfiguration(config1, subnet.id)).toBe(true);
  });

  it('returns false if the given config has an active VPC interface that is the primary interface', () => {
    const publicInterface = linodeConfigInterfaceFactory.build({ id: 10 });
    const vpcInterface = linodeConfigInterfaceFactoryWithVPC.build({
      active: true,
      id: 20,
      primary: true,
      subnet_id: 1,
    });

    const config2 = linodeConfigFactory.build({
      interfaces: [publicInterface, vpcInterface],
    });

    const subnet = subnetFactory.build({
      id: 1,
      linodes: [
        subnetAssignedLinodeDataFactory.build({
          id: 5,
          interfaces: [
            {
              active: true,
              id: 20,
            },
            {
              active: true,
              id: 10,
            },
          ],
        }),
      ],
    });

    expect(hasUnrecommendedConfiguration(config2, subnet.id)).toBe(false);
  });
});

describe('hasUnrecommendedConfigurationLinodeInterface function', () => {
  it('returns false if the given interface is not active', () => {
    expect(
      hasUnrecommendedConfigurationLinodeInterface(
        linodeInterfaceFactoryVPC.build(),
        false
      )
    ).toBe(false);
  });

  it('returns false if the given interface is active and the default route', () => {
    const vpcInterfaceWithNat = linodeInterfaceFactoryVPC.build({
      vpc: {
        ipv4: {
          addresses: [
            {
              address: '10.0.0.0',
              nat_1_1_address: '172.65.28.10',
              primary: true,
            },
          ],
        },
        subnet_id: 1,
        vpc_id: 1,
      },
    });
    const vpcInterfaceWithoutNat = linodeInterfaceFactoryVPC.build();
    expect(
      hasUnrecommendedConfigurationLinodeInterface(vpcInterfaceWithNat, true)
    ).toBe(false);

    expect(
      hasUnrecommendedConfigurationLinodeInterface(vpcInterfaceWithoutNat, true)
    ).toBe(false);
  });

  it('returns true if the given active VPC interface is not the default route but has a nat_1_1 address', () => {
    const vpcInterfaceWithNat = linodeInterfaceFactoryVPC.build({
      default_route: { ipv4: undefined },
      vpc: {
        ipv4: {
          addresses: [
            {
              address: '10.0.0.0',
              nat_1_1_address: '172.65.28.10',
              primary: true,
            },
          ],
        },
        subnet_id: 1,
        vpc_id: 1,
      },
    });
    expect(
      hasUnrecommendedConfigurationLinodeInterface(vpcInterfaceWithNat, true)
    ).toEqual(true);
  });

  it('returns false if the given active VPC interface is not the default route and has no nat_1_1 address', () => {
    const vpcInterfaceWithoutNat = linodeInterfaceFactoryVPC.build({
      default_route: { ipv4: undefined },
      vpc: {
        ipv4: {
          addresses: [
            {
              address: '10.0.0.0',
              primary: true,
            },
          ],
        },
        subnet_id: 1,
        vpc_id: 1,
      },
    });
    expect(
      hasUnrecommendedConfigurationLinodeInterface(vpcInterfaceWithoutNat, true)
    ).toEqual(false);
  });
});

describe('Linode Interface utility functions', () => {
  it('gets the primary IPv4Address', () => {
    expect(
      getLinodeInterfacePrimaryIPv4(linodeInterfaceFactoryVPC.build())
    ).toEqual('10.0.0.0');
  });

  it('gets the VPC Linode Interface ranges', () => {
    expect(getLinodeInterfaceRanges(linodeInterfaceFactoryVPC.build())).toEqual(
      ['10.0.0.1']
    );
  });

  describe('getVPCInterfacePayload', () => {
    const inputs = {
      autoAssignIPv4: true,
      chosenIP: '10.0.0.3',
      firewallId: 1,
      ipRanges: [],
      subnetId: 1,
      vpcId: 1,
    };
    it('returns a VPC legacy interface payload', () => {
      const iface = getVPCInterfacePayload({
        ...inputs,
        isLinodeInterface: false,
      });
      expect('purpose' in iface).toBe(true);
    });

    it('returns a VPC Linode Interface payload', () => {
      const iface = getVPCInterfacePayload({
        ...inputs,
        isLinodeInterface: true,
      });
      expect('purpose' in iface).toBe(false);
    });
  });
});

describe('transformLinodeInterfaceErrorsToFormikErrors', () => {
  it('handles vpc range errors', () => {
    const error: APIError[] = [
      { field: 'vpc.ipv4.ranges[3].range', reason: 'Range is invalid.' },
    ];

    expect(transformLinodeInterfaceErrorsToFormikErrors(error)).toStrictEqual([
      {
        field: 'ip_ranges[3]',
        reason: 'Range is invalid.',
      },
    ]);

    const generalRangeError: APIError[] = [
      { field: 'vpc.ipv4.ranges', reason: 'Range is invalid.' },
    ];

    expect(
      transformLinodeInterfaceErrorsToFormikErrors(generalRangeError)
    ).toStrictEqual([
      {
        field: 'ip_ranges',
        reason: 'Range is invalid.',
      },
    ]);
  });

  it('handles vpc address errors', () => {
    const error: APIError[] = [
      { field: 'vpc.ipv4.addresses[0]', reason: 'address is invalid.' },
    ];

    expect(transformLinodeInterfaceErrorsToFormikErrors(error)).toStrictEqual([
      {
        field: 'ipv4.vpc',
        reason: 'address is invalid.',
      },
    ]);

    const error2: APIError[] = [
      { field: 'vpc.ipv4.addresses', reason: 'address 2 is invalid.' },
    ];

    expect(transformLinodeInterfaceErrorsToFormikErrors(error2)).toStrictEqual([
      {
        field: 'ipv4.vpc',
        reason: 'address 2 is invalid.',
      },
    ]);
  });
});
