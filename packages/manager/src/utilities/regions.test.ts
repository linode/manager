import { Region } from '@linode/api-v4/lib/regions';

import { getRegionsByRegionId } from './regions';

describe('getRegionsByRegionId', () => {
  it('converts an array of regions to a lookup object', () => {
    const mockRegions: Region[] = [
      {
        capabilities: ['Object Storage'],
        country: 'us',
        id: 'us-east',
        label: 'Newark, NJ',
        resolvers: { ipv4: '', ipv6: '' },
        status: 'ok',
      },
      {
        capabilities: ['Object Storage'],
        country: 'us',
        id: 'us-southeast',
        label: 'Atlanta, GA',
        resolvers: { ipv4: '', ipv6: '' },
        status: 'ok',
      },
    ];

    const expectedOutput = {
      'us-east': {
        capabilities: ['Object Storage'],
        country: 'us',
        id: 'us-east',
        label: 'Newark, NJ',
        resolvers: { ipv4: '', ipv6: '' },
        status: 'ok',
      },
      'us-southeast': {
        capabilities: ['Object Storage'],
        country: 'us',
        id: 'us-southeast',
        label: 'Atlanta, GA',
        resolvers: { ipv4: '', ipv6: '' },
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
