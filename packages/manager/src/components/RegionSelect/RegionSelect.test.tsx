import { getRegionOptions, getSelectedRegionById } from './RegionSelect.utils'; // Import your functions here

import { regionFactory } from 'src/factories';

import type { RegionSelectOption } from './RegionSelect.types';
import type { Region } from '@linode/api-v4';

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
    const flags = {};
    const path = '';
    const result = getRegionOptions(regions, flags, path);

    expect(result).toEqual([]);
  });

  it('should return a sorted array of OptionType objects with North America first', () => {
    const flags = {};
    const path = '';
    const result: RegionSelectOption[] = getRegionOptions(regions, flags, path);

    // Expected result
    const expected: RegionSelectOption[] = [
      {
        data: { country: 'ca', disabledMessage: null, region: 'North America' },
        label: 'CA Location (ca-1)',
        value: 'ca-1',
      },
      {
        data: {
          country: 'us',
          disabledMessage: null,
          region: 'North America',
        },
        label: 'US Location (us-1)',
        value: 'us-1',
      },

      {
        data: { country: 'jp', disabledMessage: null, region: 'Asia' },
        label: 'JP Location (jp-1)',
        value: 'jp-1',
      },
    ];

    expect(result).toEqual(expected);
  });
});

describe('getSelectedRegionById', () => {
  it('should return the correct OptionType for a selected region', () => {
    const selectedRegionId = 'us-1';

    const result = getSelectedRegionById(regions, selectedRegionId);

    // Expected result
    const expected = {
      data: { country: 'US', region: 'North America' },
      label: 'US Location (us-1)',
      value: 'us-1',
    };

    expect(result).toEqual(expected);
  });

  it('should return undefined for an unknown region', () => {
    const selectedRegionId = 'unknown';

    const result = getSelectedRegionById(regions, selectedRegionId);

    expect(result).toBeUndefined();
  });
});
