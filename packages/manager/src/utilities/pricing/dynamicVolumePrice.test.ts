import { volumeTypeFactory } from 'src/factories/types';

import { getDynamicVolumePrice } from './dynamicVolumePrice';

const mockVolumeType = volumeTypeFactory.build();

describe('getDCSpecificPricingDisplay', () => {
  it('calculates dynamic pricing for a volumes based on size', () => {
    expect(
      getDynamicVolumePrice({
        regionId: 'id-cgk',
        size: 20,
        type: mockVolumeType,
      })
    ).toBe('2.40');
  });
});
