import { getVlans } from '@linode/api-v4';
import { pageSize } from 'support/constants/api';
import { depaginate } from 'support/util/paginate';
import { randomLabel } from 'support/util/random';

import { isTestLabel } from './common';

import type { VLAN } from '@linode/api-v4';

/**
 * Returns a VLAN label to use for a test resource, creating it if one does not already exist.
 *
 * @returns Promise that resolves to existing or new VLAN label.
 */
export const findOrCreateDependencyVlan = async (linodeRegion: string) => {
  const vlans = await depaginate<VLAN>((page: number) =>
    getVlans({ page, page_size: pageSize })
  );

  const suitableVlan = vlans.find(({ label, region }: VLAN) => {
    return isTestLabel(label) && region === linodeRegion;
  });

  if (suitableVlan) {
    return suitableVlan.label;
  }

  // No suitable VLANs exist, so we'll return random label and create a new one later.
  return randomLabel();
};
