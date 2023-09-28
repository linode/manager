import type { ExtendedType } from '../extendType';
import type { Linode, LinodeType, PriceObject } from '@linode/api-v4';
import type { FlagSet } from 'src/featureFlags';

/**
 * Gets the backup price of a Linode type for a specific region.
 *
 * @param type The Linode Type
 * @param regionId The region to get the price for
 * @returns backup pricing information for this specific linode type in a region
 */
export const getLinodeBackupPrice = (
  type: LinodeType,
  regionId: string
): PriceObject | undefined => {
  if (!type || !regionId) {
    return undefined;
  }
  const regionSpecificBackupPrice = type.addons.backups.region_prices?.find(
    (regionPrice) => regionPrice.id === regionId
  );

  if (regionSpecificBackupPrice) {
    return {
      hourly: regionSpecificBackupPrice.hourly,
      monthly: regionSpecificBackupPrice.monthly,
    };
  }

  // TODO: M3-7063 (defaults)
  return type.addons.backups.price;
};

interface BackupsPriceOptions {
  flags: FlagSet;
  region: string | undefined;
  type: ExtendedType | LinodeType | undefined;
}

/**
 *
 */
export const getMonthlyBackupsPrice = ({
  flags,
  region,
  type,
}: BackupsPriceOptions): PriceObject['monthly'] | undefined => {
  if (!region || !type) {
    return undefined;
  }

  return flags.dcSpecificPricing
    ? getLinodeBackupPrice(type, region)?.monthly
    : type?.addons.backups.price.monthly;
};

export interface TotalBackupsPriceOptions {
  /**
   * Our feature flags so we can determined whether or not to add price increase.
   * @example { dcSpecificPricing: true }
   */
  flags: FlagSet;
  /**
   * List of linodes without backups enabled
   */
  linodes: Linode[];
  /**
   * List of types for the linodes without backups
   */
  types: LinodeType[];
}

export const getTotalBackupsPrice = ({
  flags,
  linodes,
  types,
}: TotalBackupsPriceOptions) => {
  return linodes.reduce((prevValue: number, linode: Linode) => {
    const type = types.find((type) => type.id === linode.type);

    if (!type) {
      return undefined;
    }

    // TODO: M3-7063 (defaults)
    const backupsMonthlyPrice: PriceObject['monthly'] | undefined =
      getMonthlyBackupsPrice({
        flags,
        region: linode.region,
        type,
      }) || undefined;

    return prevValue + (backupsMonthlyPrice ? backupsMonthlyPrice : 0);
  }, 0);
};
