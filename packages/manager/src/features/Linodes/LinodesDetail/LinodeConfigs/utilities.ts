import { isEmpty } from '@linode/api-v4';

import type { Interface } from '@linode/api-v4';

/**
 * Gets the index of the primary Linode interface
 *
 * The function does more than just look for `primary: true`. It will also return the index
 * of the implicit primary interface. (The API does not enforce that a Linode config always
 * has an interface that is marked as primary)
 *
 * This is the general logic we follow in this function:
 * - If an interface is primary we know that's the primary
 * - If the API response returns an empty array "interfaces": [], under the hood, a public interface eth0 is implicit. This interface will be primary.
 * - If a config has interfaces, but none of them are marked primary: true, then the first interface in the list that’s not a VLAN will be the primary interface
 *
 * @returns the index of the primary interface or `null` if there is not a primary interface
 */
export const getPrimaryInterfaceIndex = (interfaces: Interface[]) => {
  const indexOfPrimaryInterface = interfaces.findIndex((i) => i.primary);

  // If an interface has `primary: true` we know thats the primary so just return it.
  if (indexOfPrimaryInterface !== -1) {
    return indexOfPrimaryInterface;
  }

  // If the API response returns an empty array "interfaces": [] the Linode will by default have a public interface,
  // and it will be eth0 on the Linode. This interface will be primary.
  // This case isn't really nessesary because this form is built so that the interfaces state will be
  // populated even if the API returns an empty interfaces array, but I'm including it for completeness.
  if (isEmpty(interfaces)) {
    return null;
  }

  // If a config has interfaces but none of them are marked as primary,
  // then the first interface in the list that’s not a VLAN will shown as the primary interface.
  const inherentIndexOfPrimaryInterface = interfaces.findIndex(
    (i) => i.purpose !== 'vlan'
  );

  if (inherentIndexOfPrimaryInterface !== -1) {
    // If we're able to find the inherent primary interface, just return it.
    return inherentIndexOfPrimaryInterface;
  }

  // If we haven't been able to find the primary interface by this point, the Linode doesn't have one.
  // As an example, this is the case when a Linode only has a VLAN interface.
  return null;
};
