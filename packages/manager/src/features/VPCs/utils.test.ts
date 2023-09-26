import { LinodeConfigInterfaceFactoryWithVPC } from 'src/factories/linodeConfigInterfaceFactory';
import { linodeConfigFactory } from 'src/factories/linodeConfigs';
import { subnetFactory } from 'src/factories/subnets';

import {
  getSubnetInterfaceFromConfigs,
  getUniqueLinodesFromSubnets,
} from './utils';

describe('getUniqueLinodesFromSubnets', () => {
  it(`returns the number of unique linodes within a VPC's subnets`, () => {
    const subnets0 = [subnetFactory.build({ linodes: [] })];
    const subnets1 = [subnetFactory.build({ linodes: [1, 2, 3] })];
    const subnets2 = [subnetFactory.build({ linodes: [1, 1, 3, 3] })];
    const subnets3 = [
      subnetFactory.build({ linodes: [1, 2, 3] }),
      subnetFactory.build({ linodes: [] }),
      subnetFactory.build({ linodes: [3] }),
      subnetFactory.build({ linodes: [6, 7, 8, 9, 1] }),
    ];

    expect(getUniqueLinodesFromSubnets(subnets0)).toBe(0);
    expect(getUniqueLinodesFromSubnets(subnets1)).toBe(3);
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
