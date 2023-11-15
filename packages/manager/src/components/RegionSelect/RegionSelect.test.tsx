import { getRegionOptions, getSelectedRegionById } from './RegionSelect.utils'; // Import your functions here

import { accountAvailabilityFactory, regionFactory } from 'src/factories';

import type { RegionSelectOption } from './RegionSelect.types';
import type { Region } from '@linode/api-v4';

const accountAvailabilityData = accountAvailabilityFactory.buildList(2);

const regions: Region[] = [
  regionFactory.build({
    country: 'us',
    id: 'us-1',
    label: 'US Location',
  }),
  regionFactory.build({
    country: 'ca',
    id: 'ca-1',
    label: 'CA Location',
  }),
  regionFactory.build({
    country: 'jp',
    id: 'jp-1',
    label: 'JP Location',
  }),
];

describe('getRegionOptions', () => {
  it('should return an empty array if no regions are provided', () => {
    const regions: Region[] = [];
    const result = getRegionOptions({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      regions,
    });

    expect(result).toEqual([]);
  });

  it('should return a sorted array of OptionType objects with North America first', () => {
    const result: RegionSelectOption[] = getRegionOptions({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      regions,
    });

    type _RegionSelectOption = Omit<RegionSelectOption, 'data'> & {
      data: Omit<RegionSelectOption['data'], 'disabledMessage'>;
    };

    // Expected result
    const expected: _RegionSelectOption[] = [
      {
        data: { country: 'ca', region: 'North America' },
        label: 'CA Location (ca-1)',
        unavailable: false,
        value: 'ca-1',
      },
      {
        data: {
          country: 'us',
          region: 'North America',
        },
        label: 'US Location (us-1)',
        unavailable: false,
        value: 'us-1',
      },

      {
        data: { country: 'jp', region: 'Asia' },
        label: 'JP Location (jp-1)',
        unavailable: false,
        value: 'jp-1',
      },
    ];

    expect(result).toEqual(expected);
  });
});

describe('getSelectedRegionById', () => {
  it('should return the correct OptionType for a selected region', () => {
    const selectedRegionId = 'us-1';

    const result = getSelectedRegionById({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      regions,
      selectedRegionId,
    });

    // Expected result
    const expected = {
      data: {
        country: 'us',
        region: 'North America',
      },
      label: 'US Location (us-1)',
      unavailable: false,
      value: 'us-1',
    };

    expect(result).toEqual(expected);
  });

  it('should return undefined for an unknown region', () => {
    const selectedRegionId = 'unknown';

    const result = getSelectedRegionById({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      regions,
      selectedRegionId,
    });

    expect(result).toBeUndefined();
  });
});
