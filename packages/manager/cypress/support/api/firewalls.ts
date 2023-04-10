import { isTestLabel } from './common';
import { pageSize } from 'support/constants/api';
import { depaginate } from 'support/util/paginate';
import { Firewall, getFirewalls, deleteFirewall } from '@linode/api-v4';

/**
 * Deletes all Firewalls whose labels are prefixed "cy-test-".
 *
 * @returns Promise that resolves when Firewalls have been deleted.
 */
export const deleteAllTestFirewalls = async (): Promise<void> => {
  const firewalls = await depaginate<Firewall>((page: number) =>
    getFirewalls({ page_size: pageSize, page })
  );

  const deletionPromises = firewalls
    .filter((firewall: Firewall) => isTestLabel(firewall.label))
    .map((firewall: Firewall) => deleteFirewall(firewall.id));

  await Promise.all(deletionPromises);
};
