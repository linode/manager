import { accountAvailabilityFactory, regionFactory } from '@linode/utilities';

import {
  getRegionOptions,
  isRegionOptionUnavailable,
} from './RegionSelect.utils';

import type { Region } from '@linode/api-v4';

describe('getRegionOptions', () => {
  it('should return an empty array if no regions are provided', () => {
    const result = getRegionOptions({
      currentCapability: 'Linodes',
      regions: [],
    });

    expect(result).toEqual([]);
  });

  it('should return a sorted array of regions with North America first', () => {
    const regions = [
      regionFactory.build({
        capabilities: ['Linodes'],
        country: 'jp',
        id: 'jp-1',
        label: 'JP Location',
      }),
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
    ];

    const result = getRegionOptions({
      currentCapability: 'Linodes',
      regions,
    });

    expect(result).toEqual([
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
    ]);
  });

  it('should filter out regions that do not have the currentCapability if currentCapability is provided', () => {
    const distributedRegions = [
      regionFactory.build({
        capabilities: ['Linodes'],
        country: 'us',
        id: 'us-den-10',
        label: 'Gecko Distributed Region Test',
        site_type: 'distributed',
      }),
      regionFactory.build({
        capabilities: [],
        country: 'us',
        id: 'us-den-11',
        label: 'Gecko Distributed Region Test 2',
        site_type: 'distributed',
      }),
    ];

    const result = getRegionOptions({
      currentCapability: 'Linodes',
      regions: distributedRegions,
    });

    expect(result).toEqual([
      regionFactory.build({
        capabilities: ['Linodes'],
        country: 'us',
        id: 'us-den-10',
        label: 'Gecko Distributed Region Test',
        site_type: 'distributed',
      }),
    ]);
  });

  it('should filter out distributed regions if regionFilter is core', () => {
    const regions = [
      regionFactory.build({
        id: 'us-1',
        label: 'US Site 1',
        site_type: 'distributed',
      }),
      regionFactory.build({
        id: 'us-2',
        label: 'US Site 2',
        site_type: 'core',
      }),
    ];

    const result = getRegionOptions({
      currentCapability: undefined,
      regionFilter: 'core',
      regions,
    });

    expect(result).toEqual([
      regionFactory.build({
        id: 'us-2',
        label: 'US Site 2',
        site_type: 'core',
      }),
    ]);
  });

  it('should filter out core regions if regionFilter is "distributed"', () => {
    const regions = [
      regionFactory.build({
        id: 'us-1',
        label: 'US Site 1',
        site_type: 'distributed',
      }),
      regionFactory.build({
        id: 'us-2',
        label: 'US Site 2',
        site_type: 'core',
      }),
    ];

    const result = getRegionOptions({
      currentCapability: undefined,
      regionFilter: 'distributed',
      regions,
    });

    expect(result).toEqual([
      regionFactory.build({
        id: 'us-1',
        label: 'US Site 1',
        site_type: 'distributed',
      }),
    ]);
  });

  it('should not filter out any regions if regionFilter is undefined', () => {
    const regions = [
      regionFactory.build({
        id: 'us-1',
        label: 'US Site 1',
        site_type: 'distributed',
      }),
      regionFactory.build({
        id: 'us-2',
        label: 'US Site 2',
        site_type: 'core',
      }),
    ];
    const result = getRegionOptions({
      currentCapability: undefined,
      regionFilter: undefined,
      regions,
    });

    expect(result).toEqual(regions);
  });

  it('should filter out distributed regions by continent if the regionFilter includes continent', () => {
    const regions2 = [
      regionFactory.build({
        id: 'us-1',
        label: 'US Site 1',
        site_type: 'distributed',
      }),
      regionFactory.build({
        id: 'us-1',
        label: 'US Site 2',
        site_type: 'core',
      }),
      regionFactory.build({
        country: 'de',
        id: 'eu-2',
        label: 'EU Site 2',
        site_type: 'distributed',
      }),
    ];

    const resultNA = getRegionOptions({
      currentCapability: undefined,
      regionFilter: 'distributed-NA',
      regions: regions2,
    });
    const resultEU = getRegionOptions({
      currentCapability: undefined,
      regionFilter: 'distributed-EU',
      regions: regions2,
    });

    expect(resultNA).toEqual([
      regionFactory.build({
        id: 'us-1',
        label: 'US Site 1',
        site_type: 'distributed',
      }),
    ]);
    expect(resultEU).toEqual([
      regionFactory.build({
        country: 'de',
        id: 'eu-2',
        label: 'EU Site 2',
        site_type: 'distributed',
      }),
    ]);
  });

  it('should not filter out distributed regions by continent if the regionFilter includes all', () => {
    const regions: Region[] = [
      regionFactory.build({
        id: 'us-1',
        label: 'US Site 1',
        site_type: 'core',
      }),
      regionFactory.build({
        country: 'de',
        id: 'eu-2',
        label: 'EU Site 2',
        site_type: 'distributed',
      }),
      regionFactory.build({
        country: 'us',
        id: 'us-2',
        label: 'US Site 2',
        site_type: 'distributed',
      }),
    ];

    const resultAll = getRegionOptions({
      currentCapability: undefined,
      regionFilter: 'distributed-ALL',
      regions,
    });

    expect(resultAll).toEqual([
      regionFactory.build({
        country: 'us',
        id: 'us-2',
        label: 'US Site 2',
        site_type: 'distributed',
      }),
      regionFactory.build({
        country: 'de',
        id: 'eu-2',
        label: 'EU Site 2',
        site_type: 'distributed',
      }),
    ]);
  });
});

const accountAvailabilityData = [
  accountAvailabilityFactory.build({
    region: 'ap-south',
    unavailable: ['Linodes'],
  }),
];

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
