import { useFlags } from 'src/hooks/useFlags';

import type { DataCenterPricingByTypeOptions } from '@akamai/compute-ui-core/api';
import type { IPAddress } from '@linode/api-v4';
import type { RegionPrice } from 'src/utilities/pricing/dynamicPricing';
/**
 *
 * @returns an object that contains boolean property to check whether Reserved IP is enabled or not
 */
export const useIsReserveIpEnabled = () => {
  const flags = useFlags();

  // @TODO ReservedIps: check for customer tag/account capability when it exists

  return { isReserveIpEnabled: flags.reserveIp ?? false };
};

/**
 *
 * @returns an object that contains boolean property to check whether Reserved IP New Badge is enabled or not
 */
export const useIsReserveIpNewBadgeEnabled = () => {
  const flags = useFlags();

  return { isReserveIpNewBadgeEnabled: flags.reserveIpNewBadge ?? false };
};

/**
 * Generates a description for a Reserved IP based on its assigned entity.
 *
 * @param reservedIp - The Reserved IP address object
 * @returns A descriptive string indicating the assignment status
 */
export const getReservedIPDescription = (reservedIp: IPAddress): string => {
  if (!reservedIp.assigned_entity?.type) {
    return 'Unassigned';
  }

  const { label, type } = reservedIp.assigned_entity;

  if ((type === 'linode' || type === 'nodebalancer') && label) {
    return `Assigned to ${label}`;
  }

  return `Assigned to ${label || type}`;
};

/**
 * Returns the exact hourly price for a Reserved IP in a given region,
 * as provided by the API without any rounding or formatting.
 *
 * @returns The raw hourly price as a string (e.g. "0.007"), or `undefined`
 *          if the price cannot be determined.
 *
 * @example
 * getReservedIPHourlyPrice({ regionId: 'us-east', type: reservedIPTypes[0] })
 * // => "0.007"
 */
export const getReservedIPHourlyPrice = ({
  regionId,
  type,
}: DataCenterPricingByTypeOptions): number | undefined => {
  if (!regionId || !type) {
    return undefined;
  }

  const price =
    type.region_prices.find(
      (region_price: RegionPrice) => region_price.id === regionId
    )?.hourly ?? type.price?.hourly;

  return price != null ? price : undefined;
};
