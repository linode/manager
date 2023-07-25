import { Firewall, deleteFirewall, getFirewalls } from '@linode/api-v4';
import { pageSize } from 'support/constants/api';
import { depaginate } from 'support/util/paginate';

import { isTestLabel } from './common';

/**
 * Deletes all Firewalls whose labels are prefixed "cy-test-".
 *
 * @returns Promise that resolves when Firewalls have been deleted.
 */
export const deleteAllTestFirewalls = async (): Promise<void> => {
  const firewalls = await depaginate<Firewall>((page: number) =>
    getFirewalls({ page, page_size: pageSize })
  );

  const deletionPromises = firewalls
    .filter((firewall: Firewall) => isTestLabel(firewall.label))
    .map((firewall: Firewall) => deleteFirewall(firewall.id));

  await Promise.all(deletionPromises);
};
