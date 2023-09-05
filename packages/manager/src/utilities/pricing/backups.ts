import { LinodeType, PriceObject } from '@linode/api-v4';

import { FlagSet } from 'src/featureFlags';

import { ExtendedType } from '../extendType';
import { getLinodeBackupPrice } from './linodes';

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
}: BackupsPriceOptions): PriceObject['monthly'] => {
  if (!region || !type) {
    return 0;
  }

  return flags.dcSpecificPricing
    ? getLinodeBackupPrice(type, region).monthly
    : type?.addons.backups.price.monthly;
};
