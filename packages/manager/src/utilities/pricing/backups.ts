import type { ExtendedType } from '../extendType';
import type { Linode, LinodeType, PriceObject } from '@linode/api-v4';

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

  return type.addons.backups.price;
};

interface BackupsPriceOptions {
  region: string | undefined;
  type: ExtendedType | LinodeType | undefined;
}

/**
 * @returns The monthly backup price for a single linode without backups enabled;
 * if price cannot be calculated, returns undefined.
 */
export const getMonthlyBackupsPrice = ({
  region,
  type,
}: BackupsPriceOptions): PriceObject['monthly'] | undefined => {
  if (!region || !type) {
    return undefined;
  }

  return getLinodeBackupPrice(type, region)?.monthly;
};

export interface TotalBackupsPriceOptions {
  /**
   * List of linodes without backups enabled
   */
  linodes: Linode[];
  /**
   * List of types for the linodes without backups
   */
  types: LinodeType[];
}

/**
 * @returns The summed monthly backups prices for all linodes without backups enabled;
 * if price cannot be calculated, returns undefined.
 */
export const getTotalBackupsPrice = ({
  linodes,
  types,
}: TotalBackupsPriceOptions) => {
  return linodes.reduce((prevValue: number | undefined, linode: Linode) => {
    const type = types.find((type) => type.id === linode.type);

    if (!type) {
      return undefined;
    }

    const backupsMonthlyPrice: PriceObject['monthly'] | undefined =
      getMonthlyBackupsPrice({
        region: linode.region,
        type,
      });

    if (backupsMonthlyPrice === null || backupsMonthlyPrice === undefined) {
      return undefined;
    }

    return prevValue !== undefined
      ? prevValue + backupsMonthlyPrice
      : undefined;
  }, 0);
};
