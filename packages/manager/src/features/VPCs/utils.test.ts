import {
  LinodeConfigInterfaceFactory,
  LinodeConfigInterfaceFactoryWithVPC,
} from 'src/factories/linodeConfigInterfaceFactory';
import { linodeConfigFactory } from 'src/factories/linodeConfigs';
import {
  subnetAssignedLinodeDataFactory,
  subnetFactory,
} from 'src/factories/subnets';

import {
  getSubnetInterfaceFromConfigs,
  getUniqueLinodesFromSubnets,
  hasUnrecommendedConfiguration,
} from './utils';

const subnetLinodeInfoList1 = subnetAssignedLinodeDataFactory.buildList(4);
const subnetLinodeInfoId1 = subnetAssignedLinodeDataFactory.build({ id: 1 });
const subnetLinodeInfoId3 = subnetAssignedLinodeDataFactory.build({ id: 3 });

describe('getUniqueLinodesFromSubnets', () => {
  it(`returns the number of unique linodes within a VPC's subnets`, () => {
    const subnets0 = [subnetFactory.build({ linodes: [] })];
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

    expect(getUniqueLinodesFromSubnets(subnets0)).toBe(0);
    expect(getUniqueLinodesFromSubnets(subnets1)).toBe(4);
    expect(getUniqueLinodesFromSubnets(subnets2)).toBe(2);
    expect(getUniqueLinodesFromSubnets(subnets3)).toBe(7);
  });
});

describe('getSubnetInterfaceFromConfigs', () => {
  it('returns the interface associated with the given subnet id', () => {
    const interfaces = LinodeConfigInterfaceFactoryWithVPC.buildList(5);
    const singleConfig = linodeConfigFactory.build({ interfaces });
    const configs = [linodeConfigFactory.build(), singleConfig];

    const subnetInterface1 = getSubnetInterfaceFromConfigs(configs, 1);
    expect(subnetInterface1).toEqual(interfaces[0]);
    const subnetInterface2 = getSubnetInterfaceFromConfigs(configs, 2);
    expect(subnetInterface2).toEqual(interfaces[1]);
    const subnetInterface3 = getSubnetInterfaceFromConfigs(configs, 3);
    expect(subnetInterface3).toEqual(interfaces[2]);
    const subnetInterface4 = getSubnetInterfaceFromConfigs(configs, 4);
    expect(subnetInterface4).toEqual(interfaces[3]);
    const subnetInterface5 = getSubnetInterfaceFromConfigs(configs, 5);
    expect(subnetInterface5).toEqual(interfaces[4]);
  });

  it('should return undefined if an interface with the given subnet ID is not found', () => {
    const configs = linodeConfigFactory.buildList(4);

    const subnetInterfaceUndefined = getSubnetInterfaceFromConfigs(configs, 5);
    expect(subnetInterfaceUndefined).toBeUndefined();
  });
});

describe('hasUnrecommendedConfiguration function', () => {
  it('returns true when a config has an active VPC interface and a non-VPC primary interface', () => {
    const publicInterface = LinodeConfigInterfaceFactory.build({
      primary: true,
    });

    const vpcInterface = LinodeConfigInterfaceFactoryWithVPC.build({
      active: true,
    });

    const config1 = linodeConfigFactory.build({
      interfaces: [publicInterface, vpcInterface],
    });

    const config2 = linodeConfigFactory.build();

    expect(hasUnrecommendedConfiguration([config1, config2])).toBe(true);
  });

  it('returns false when a config has an VPC interface that is the primary interface', () => {
    const publicInterface = LinodeConfigInterfaceFactory.build();
    const vpcInterface = LinodeConfigInterfaceFactoryWithVPC.build({
      active: true,
      primary: true,
    });

    const config1 = linodeConfigFactory.build({
      interfaces: [publicInterface],
    });

    const config2 = linodeConfigFactory.build({
      interfaces: [publicInterface, vpcInterface],
    });

    expect(hasUnrecommendedConfiguration([config1, config2])).toBe(false);
  });
});
