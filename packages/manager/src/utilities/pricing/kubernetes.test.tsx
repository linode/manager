import { UNKNOWN_PRICE } from '@akamai/compute-ui-core/api';
import { linodeTypeFactory } from '@linode/utilities';

import { nodePoolFactory } from 'src/factories';
import { extendType } from 'src/utilities/extendType';

import { HOURS_IN_MONTH } from './constants';
import {
  getEstimatedMonthlyCostFromHourly,
  getKubernetesMonthlyPrice,
  getNodePriceDisplay,
  getPoolPriceDisplay,
  getTotalClusterPrice,
} from './kubernetes';

const mockNodePool = nodePoolFactory.build({
  count: 2,
  type: 'g1-fake-1',
});

const types = linodeTypeFactory
  .buildList(2, {
    id: 'g1-fake-1',
    price: {
      monthly: 5,
    },
  })
  .map(extendType);

describe('helper functions', () => {
  const badPool = nodePoolFactory.build({
    type: 'not-a-real-type',
  });
  const region = 'us_east';
  const LKE_HA_PRICE = 60;

  describe('getMonthlyPrice', () => {
    it('should multiply node price by node count', () => {
      const expectedPrice = (types[0].price.monthly ?? 0) * mockNodePool.count;
      expect(
        getKubernetesMonthlyPrice({
          billing: 'monthly',
          count: mockNodePool.count,
          type: mockNodePool.type,
          region,
          types,
        })
      ).toBe(expectedPrice);
    });

    it('should return zero for bad input', () => {
      expect(
        getKubernetesMonthlyPrice({
          billing: 'monthly',
          count: badPool.count,
          type: badPool.type,
          region,
          types,
        })
      ).toBe(undefined);
    });

    it('should estimate monthly cost from hourly rate for hourly-only plans', () => {
      const hourlyRate = 0.015;
      const hourlyOnlyTypes = linodeTypeFactory
        .buildList(1, {
          id: 'g8-hourly-1',
          price: { hourly: hourlyRate, monthly: null },
        })
        .map(extendType);
      const hourlyPool = nodePoolFactory.build({
        count: 3,
        type: 'g8-hourly-1',
      });

      expect(
        getKubernetesMonthlyPrice({
          billing: 'hourly',
          count: hourlyPool.count,
          type: hourlyPool.type,
          types: hourlyOnlyTypes,
          region,
        })
      ).toBe(hourlyRate * hourlyPool.count * HOURS_IN_MONTH);
    });
  });

  describe('getTotalClusterPrice', () => {
    it('should calculate the total cluster price', () => {
      expect(
        getTotalClusterPrice({
          pools: [mockNodePool, mockNodePool],
          region,
          types,
        })
      ).toBe(20);
    });

    it('should calculate the total cluster DC-specific price for a region with a price increase', () => {
      expect(
        getTotalClusterPrice({
          pools: [mockNodePool, mockNodePool],
          region: 'id-cgk',
          types,
        })
      ).toBe(48);
    });

    it('should calculate the total cluster price with HA enabled', () => {
      expect(
        getTotalClusterPrice({
          highAvailabilityPrice: LKE_HA_PRICE,
          pools: [mockNodePool, mockNodePool],
          region,
          types,
        })
      ).toBe(20 + LKE_HA_PRICE);
    });

    it('should use billing resolver when provided', () => {
      const getBillingForPlanType = vi.fn().mockReturnValue('hourly');

      const hourlyTypes = linodeTypeFactory
        .buildList(1, {
          id: 'g8-hourly-1',
          price: { hourly: 0.01, monthly: null },
        })
        .map(extendType);

      const pool = nodePoolFactory.build({
        count: 2,
        type: 'g8-hourly-1',
      });

      const expected = getEstimatedMonthlyCostFromHourly(0.01 * 2) * 1;

      expect(
        getTotalClusterPrice({
          pools: [pool],
          region,
          types: hourlyTypes,
          getBillingForPlanType,
        })
      ).toBe(expected);

      expect(getBillingForPlanType).toHaveBeenCalledWith(pool.type);
    });

    it('should handle mixed billing pools using resolver', () => {
      const getBillingForPlanType = vi.fn((type: string) =>
        type === 'g8-hourly-1' ? 'hourly' : 'monthly'
      );

      const types = [
        linodeTypeFactory.build({
          id: 'g8-hourly-1', // hourly scoped
          price: { hourly: 0.01, monthly: null },
        }),
        linodeTypeFactory.build({
          id: 'g7-monthly-1', // Non-hourly scoped
          price: { hourly: 0.02, monthly: 12 },
        }),
      ];

      const hourlyPool = nodePoolFactory.build({
        count: 2,
        type: 'g8-hourly-1',
      });

      const monthlyPool = nodePoolFactory.build({
        count: 2,
        type: 'g7-monthly-1',
      });

      const expectedEstimatedMonthlyFromHourly =
        getEstimatedMonthlyCostFromHourly(0.01 * hourlyPool.count);

      const expectedMonthly = 12 * monthlyPool.count;

      const expectedTotal =
        expectedEstimatedMonthlyFromHourly + expectedMonthly;

      expect(
        getTotalClusterPrice({
          pools: [hourlyPool, monthlyPool],
          region,
          types,
          getBillingForPlanType,
        })
      ).toBe(expectedTotal);
    });
  });

  describe('getEstimatedMonthlyCostFromHourly', () => {
    it('should estimate monthly cost from hourly cost', () => {
      expect(getEstimatedMonthlyCostFromHourly(0.045)).toBe(
        0.045 * HOURS_IN_MONTH
      );
    });
  });

  describe('getPoolPriceDisplay', () => {
    it('should format monthly pool price', () => {
      expect(
        getPoolPriceDisplay({ monthly: 10, hourly: 0.015 }, 3, 'monthly')
      ).toBe('$30/mo');
    });

    it('should format hourly pool price with monthly estimate', () => {
      // Display pool price is 0.015 * 3 = 0.045/hr, estimated monthly is 0.045 * HOURS_IN_MONTH = ~33.48/mo
      expect(
        getPoolPriceDisplay({ monthly: null, hourly: 0.015 }, 3, 'hourly')
      ).toBe('$0.045/hr (Est. ~$33.48/mo)');
    });

    it('should return unknown price when pricing is unavailable', () => {
      expect(getPoolPriceDisplay(undefined, 3, 'monthly')).toContain(
        UNKNOWN_PRICE
      );
    });
  });

  describe('getNodePriceDisplay', () => {
    it('should format monthly node price', () => {
      expect(
        getNodePriceDisplay({ monthly: 10, hourly: 0.015 }, 'monthly')
      ).toBe('$10/mo');
    });

    it('should format hourly node price', () => {
      expect(
        getNodePriceDisplay({ monthly: 10, hourly: 0.015 }, 'hourly')
      ).toBe('$0.015/hr');
    });

    it('should return unknown price when pricing is unavailable', () => {
      expect(getNodePriceDisplay(undefined, 'monthly')).toContain(
        UNKNOWN_PRICE
      );
    });
  });
});
