import { isPrivateIP } from 'src/utilities/ipUtils';

import type { Linode } from '@linode/api-v4';

interface PrivateIPOption {
  /**
   * A private IPv4 address
   */
  label: string;
  /**
   * The Linode associated with the private IPv4 address
   */
  linode: Linode;
}

/**
 * Given an array of Linodes, this function returns an array of private
 * IPv4 options intended to be used in a Select component.
 */
export const getPrivateIPOptions = (linodes: Linode[] | undefined) => {
  if (!linodes) {
    return [];
  }

  const options: PrivateIPOption[] = [];

  for (const linode of linodes) {
    for (const ip of linode.ipv4) {
      if (isPrivateIP(ip)) {
        options.push({ label: ip, linode });
      }
    }
  }

  return options;
};
