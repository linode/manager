import { parse as parseIP, parseCIDR } from 'ipaddr.js';

/**
 * Removes the prefix length from the end of an IPv6 address.
 *
 * @param ip The IPv6 address to remove the prefix length from.
 */
export const removePrefixLength = (ip: string) => ip.replace(/\/\d+/, '');

/**
 * Regex for determining if a string is a private IP Addresses
 */
export const privateIPRegex = /^10\.|^172\.1[6-9]\.|^172\.2[0-9]\.|^172\.3[0-1]\.|^192\.168\.|^fd/;

export interface ExtendedIP {
  address: string;
  error?: string;
}

export const stringToExtendedIP = (ip: string): ExtendedIP => ({ address: ip });
export const extendedIPToString = (ip: ExtendedIP): string => ip.address;
export const ipFieldPlaceholder = '192.0.2.1/32';

export const IP_ERROR_MESSAGE = 'Must be a valid IPv4 or IPv6 range.';

// Adds an `error` message to each invalid IP in the list.
export const validateIPs = (
  ips: ExtendedIP[],
  options?: {
    allowEmptyAddress?: boolean;
    errorMessage?: string;
  }
): ExtendedIP[] => {
  return ips.map(({ address }) => {
    if (!options?.allowEmptyAddress && !address) {
      return { address, error: 'Please enter an IP address.' };
    }
    // We accept plain IPs as well as ranges (i.e. CIDR notation). Ipaddr.js has separate parsing
    // methods for each, so we check for a netmask to decide the method to use.
    const [, mask] = address.split('/');
    try {
      if (mask) {
        parseCIDR(address);
      } else {
        parseIP(address);
      }
    } catch (err) {
      if (address) {
        return { address, error: options?.errorMessage ?? IP_ERROR_MESSAGE };
      }
    }
    return { address };
  });
};
