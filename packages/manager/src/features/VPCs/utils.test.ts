import { subnetFactory } from 'src/factories/subnets';

import { getUniqueLinodesFromSubnets } from './utils';

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
