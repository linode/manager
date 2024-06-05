import { accountAvailabilityFactory, regionFactory } from 'src/factories';

import {
  getRegionOptions,
  isRegionOptionUnavailable,
} from './RegionSelect.utils';

import type { Region } from '@linode/api-v4';

const accountAvailabilityData = [
  accountAvailabilityFactory.build({
    region: 'ap-south',
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

const distributedRegions = [
  ...regions,
  regionFactory.build({
    capabilities: ['Linodes'],
    country: 'us',
    id: 'us-den-10',
    label: 'Gecko Distributed Region Test',
    site_type: 'distributed',
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    country: 'us',
    id: 'us-den-11',
    label: 'Gecko Distributed Region Test 2',
    site_type: 'distributed',
  }),
];

const expectedRegions: Region[] = [
  regionFactory.build({
    label: 'US Location (us-1)',
    site_type: 'core',
    id: 'us-1',
  }),
  regionFactory.build({
    label: 'CA Location (ca-1)',
    site_type: 'core',
    id: 'ca-1',
  }),
  regionFactory.build({
    label: 'JP Location (jp-1)',
    site_type: 'core',
    id: 'jp-1',
  }),
];

const expectedDistributedRegions = [
  {
    data: { country: 'us', region: 'North America' },
    disabledProps: {
      disabled: false,
    },
    label: 'Gecko Distributed Region Test (us-den-10)',
    site_type: 'distributed',
    value: 'us-den-10',
  },
  {
    data: { country: 'us', region: 'North America' },
    disabledProps: {
      disabled: false,
    },
    label: 'Gecko Distributed Region Test 2 (us-den-11)',
    site_type: 'distributed',
    value: 'us-den-11',
  },
];

describe('getRegionOptions', () => {
  it('should return an empty array if no regions are provided', () => {
    const regions: Region[] = [];
    const result = getRegionOptions({
      currentCapability: 'Linodes',
      regions,
    });

    expect(result).toEqual([]);
  });

  it('should return a sorted array of OptionType objects with North America first', () => {
    const result = getRegionOptions({
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

    const result = getRegionOptions({
      currentCapability: 'Linodes',
      regions: regionsToFilter,
    });

    expect(result).toEqual(expectedRegions);
  });

  it('should filter out distributed regions if regionFilter is core', () => {
    const result = getRegionOptions({
      currentCapability: 'Linodes',
      regionFilter: 'core',
      regions: distributedRegions,
    });

    expect(result).toEqual(expectedRegions);
  });

  it('should filter out core regions if regionFilter is "distributed"', () => {
    const result = getRegionOptions({
      currentCapability: 'Linodes',
      regionFilter: 'distributed',
      regions: distributedRegions,
    });

    expect(result).toEqual(expectedDistributedRegions);
  });

  it('should not filter out any regions if regionFilter is undefined', () => {
    const regions = [...expectedDistributedRegions, ...expectedRegions];

    const result = getRegionOptions({
      currentCapability: 'Linodes',
      regionFilter: undefined,
      regions: distributedRegions,
    });

    expect(result).toEqual(regions);
  });
});

describe('getRegionOptionAvailability', () => {
  it('should return true if the region is not available', () => {
    const result = isRegionOptionUnavailable({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      region: regionFactory.build({
        id: 'ap-south',
      }),
    });

    expect(result).toBe(true);
  });

  it('should return false if the region is available', () => {
    const result = isRegionOptionUnavailable({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      region: regionFactory.build({
        id: 'us-east',
      }),
    });

    expect(result).toBe(false);
  });
});

