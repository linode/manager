import {
  linodeConfigInterfaceFactory,
  linodeConfigInterfaceFactoryWithVPC,
} from '@linode/utilities';

import { linodeConfigFactory } from 'src/factories/linodeConfigs';
import {
  subnetAssignedLinodeDataFactory,
  subnetFactory,
} from 'src/factories/subnets';

import {
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
    // updated factory for generating linode ids, so unique linodes will be different
    expect(getUniqueLinodesFromSubnets(subnets3)).toBe(8);
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

  it('returns false the given config has an active VPC interface that is the primary interface', () => {
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
