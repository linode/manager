import { imageFactory, regionFactory } from 'src/factories';

import { getDisabledRegions } from './Region.utils';

describe('getDisabledRegions', () => {
  it('disables distributed regions if the selected image does not have the distributed capability', () => {
    const distributedRegion = regionFactory.build({ site_type: 'distributed' });
    const coreRegion = regionFactory.build({ site_type: 'core' });

    const image = imageFactory.build({ capabilities: [] });

    const result = getDisabledRegions({
      regions: [distributedRegion, coreRegion],
      selectedImage: image,
    });

    expect(result).toStrictEqual({
      [distributedRegion.id]: {
        reason:
          'The selected image cannot be deployed to a distributed region.',
      },
    });
  });

  it('does not disable any regions if the selected image has the distributed regions capability', () => {
    const distributedRegion = regionFactory.build({ site_type: 'distributed' });
    const coreRegion = regionFactory.build({ site_type: 'core' });

    const image = imageFactory.build({ capabilities: ['distributed-sites'] });

    const result = getDisabledRegions({
      regions: [distributedRegion, coreRegion],
      selectedImage: image,
    });

    expect(result).toStrictEqual({});
  });
});
