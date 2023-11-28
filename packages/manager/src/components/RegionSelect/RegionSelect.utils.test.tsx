import { accountAvailabilityFactory, regionFactory } from 'src/factories';

import {
  getRegionOptionAvailability,
  getRegionOptions,
  getSelectedRegionById,
} from './RegionSelect.utils';

import type { RegionSelectOption } from './RegionSelect.types';
import type { Region } from '@linode/api-v4';

const accountAvailabilityData = [
  accountAvailabilityFactory.build({
    id: 'ap-south',
    unavailable: ['Linodes'],
  }),
];

const regions: Region[] = [
  regionFactory.build({
    capabilities: ['Linodes'],
    country: 'us',
    id: 'us-1',
    label: 'US Location',
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    country: 'ca',
    id: 'ca-1',
    label: 'CA Location',
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    country: 'jp',
    id: 'jp-1',
    label: 'JP Location',
  }),
];

const expectedRegions: RegionSelectOption[] = [
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

    expect(result).toEqual(expectedRegions);
  });

  it('should filter out regions that do not have the currentCapability if currentCapability is provided', () => {
    const regionsToFilter: Region[] = [
      ...regions,
      regionFactory.build({
        capabilities: ['Object Storage'],
        country: 'pe',
        id: 'peru-1',
        label: 'Peru Location',
      }),
    ];

    const result: RegionSelectOption[] = getRegionOptions({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      regions: regionsToFilter,
    });

    expect(result).toEqual(expectedRegions);
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

describe('getRegionOptionAvailability', () => {
  it('should return true if the region is not available', () => {
    const result = getRegionOptionAvailability({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      region: regionFactory.build({
        id: 'ap-south',
      }),
    });

    expect(result).toBe(true);
  });

  it('should return false if the region is available', () => {
    const result = getRegionOptionAvailability({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      region: regionFactory.build({
        id: 'us-east',
      }),
    });

    expect(result).toBe(false);
  });
});
