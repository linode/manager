import { accountTransferFactory } from 'src/factories/account';
import {
  regionFactory,
  regionWithDynamicPricingFactory,
} from 'src/factories/regions';

import {
  calculatePoolUsagePct,
  formatPoolUsagePct,
  formatRegionList,
  getDaysRemaining,
  getRegionTransferPools,
} from './utils';

import type { TransferDataOptions } from './utils';

const mockTransferData = accountTransferFactory.build();
const mockRegions = [
  ...regionFactory.buildList(5),
  regionWithDynamicPricingFactory.build(),
];

vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
  useRegionsQuery: vi.fn(() => mockRegions),
}));

describe('getDaysRemaining', () => {
  it('should return the number of days remaining in the current month', () => {
    const daysRemaining = getDaysRemaining();
    expect(daysRemaining).toBeGreaterThanOrEqual(0);
    expect(daysRemaining).toBeLessThanOrEqual(31);
  });
});

describe('calculatePoolUsagePct', () => {
  it('should calculate the percentage of network transfer used correctly', () => {
    const usagePct = calculatePoolUsagePct(mockTransferData);
    expect(usagePct).toBe(36);
  });

  it('should return 0 when data is undefined or quota/used is missing', () => {
    const testData: TransferDataOptions = undefined;
    const usagePct = calculatePoolUsagePct(testData);

    expect(usagePct).toBe(0);
  });
});

describe('getRegionTransferPools', () => {
  it('should return an array of RegionTransferPool objects', () => {
    const transferPools = getRegionTransferPools(mockTransferData, mockRegions);

    expect(transferPools).toHaveLength(2);
    expect(transferPools?.[0]).toEqual({
      pct: 85,
      quota: 10000,
      regionID: 'id-cgk',
      regionName: 'Jakarta, ID',
      used: 8500,
    });
  });

  it('should return an empty array when data is undefined', () => {
    const transferPools = getRegionTransferPools(undefined, undefined);

    expect(transferPools).toHaveLength(0);
  });
});

describe('formatPoolUsagePct', () => {
  it('should format the percentage correctly', () => {
    const formattedPct = formatPoolUsagePct(85);
    expect(formattedPct).toBe('85%');
  });
});

describe('formatRegionList', () => {
  it('should format the list of regions correctly', () => {
    const listOfNoRegions = [''];
    const formattedListNoRegions = formatRegionList(listOfNoRegions);
    expect(formattedListNoRegions).toBe('');

    const listOfOneRegion = ['Newark, NJ'];
    const formattedListOneRegion = formatRegionList(listOfOneRegion);
    expect(formattedListOneRegion).toBe('Newark, NJ');

    const listOfRegions = ['Newark, NJ', 'Dallas, TX', 'Fremont, CA'];
    const formattedList = formatRegionList(listOfRegions);
    expect(formattedList).toBe('Newark, NJ, Dallas, TX and Fremont, CA');
  });
});
