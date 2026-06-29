import { getMonthlyBackupsPrice } from '@akamai/compute-ui-core/api';

import type { Linode, LinodeType, PriceObject } from '@linode/api-v4';

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
