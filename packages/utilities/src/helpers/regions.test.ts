import { describe, expect, it } from 'vitest';

import { getRegionsByRegionId } from './regions';

import type { Region } from '@linode/api-v4/lib/regions';

describe('getRegionsByRegionId', () => {
  it('converts an array of regions to a lookup object', () => {
    const mockRegions: Region[] = [
      {
        capabilities: ['Object Storage'],
        country: 'us',
        id: 'us-east',
        label: 'Newark, NJ',
        placement_group_limits: {
          maximum_linodes_per_pg: 10,
          maximum_pgs_per_customer: 5,
        },
        resolvers: { ipv4: '', ipv6: '' },
        site_type: 'core',
        status: 'ok',
      },
      {
        capabilities: ['Object Storage'],
        country: 'us',
        id: 'us-southeast',
        label: 'Atlanta, GA',
        placement_group_limits: {
          maximum_linodes_per_pg: 10,
          maximum_pgs_per_customer: 5,
        },
        resolvers: { ipv4: '', ipv6: '' },
        site_type: 'core',
        status: 'ok',
      },
    ];

    const expectedOutput = {
      'us-east': {
        capabilities: ['Object Storage'],
        country: 'us',
        id: 'us-east',
        label: 'Newark, NJ',
        placement_group_limits: {
          maximum_linodes_per_pg: 10,
          maximum_pgs_per_customer: 5,
        },
        resolvers: { ipv4: '', ipv6: '' },
        site_type: 'core',
        status: 'ok',
      },
      'us-southeast': {
        capabilities: ['Object Storage'],
        country: 'us',
        id: 'us-southeast',
        label: 'Atlanta, GA',
        placement_group_limits: {
          maximum_linodes_per_pg: 10,
          maximum_pgs_per_customer: 5,
        },
        resolvers: { ipv4: '', ipv6: '' },
        site_type: 'core',
        status: 'ok',
      },
    };

    expect(getRegionsByRegionId(mockRegions)).toEqual(expectedOutput);
  });

  it('returns an empty object for an empty array', () => {
    const mockRegions: Region[] = [];
    const expectedOutput = {};

    expect(getRegionsByRegionId(mockRegions)).toEqual(expectedOutput);
  });

  it('returns an empty object for undefined input', () => {
    const mockRegions = undefined;
    const expectedOutput = {};
    expect(getRegionsByRegionId(mockRegions)).toEqual(expectedOutput);
  });
});
