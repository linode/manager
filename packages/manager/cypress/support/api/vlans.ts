import { VLAN, getVlans } from '@linode/api-v4';
import { pageSize } from 'support/constants/api';
import { depaginate } from 'support/util/paginate';

import { isTestLabel } from './common';

/**
 * Returns a VLAN to use for a test resource, creating it if one does not already exist.
 *
 * @returns Promise that resolves to existing or new VLAN.
 */
export const findOrCreateDependencyVlan = async (linodeRegion: string) => {
  const vlans = await depaginate<VLAN>((page: number) =>
    getVlans({ page, page_size: pageSize })
  );

  const suitableVlans = vlans.filter(({ label, region }: VLAN) => {
    return isTestLabel(label) && region === linodeRegion;
  });

  if (suitableVlans.length > 0) {
    return suitableVlans[0];
  }

  // No suitable VLANs exist, so we'll return null value and create a new one later.
  return null;
};
