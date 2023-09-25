import { determineIPType } from '@linode/validation';

export const DEFAULT_SUBNET_IPV4_VALUE = '10.0.4.0/24';
export const RESERVED_IP_NUMBER = 4;

// @TODO VPC: added ipv6 related fields here, but they will not be used until VPCs support ipv6
interface SubnetIPState {
  availIPv4s?: number;
  ipv4?: string;
  ipv4Error?: string;
  ipv6?: string;
  ipv6Error?: string;
}

export interface SubnetFieldState {
  ip: SubnetIPState;
  label: string;
  labelError?: string;
}

export type SubnetIPType = 'ipv4' | 'ipv6';

/**
 * Maps subnet mask length to number of theoretically available IPs.
 * - To get usable IPs, subtract 2 from the given number, as the first and last
 * ips are always reserved
 * - To get available IPs for our VPCs, subtract 4 (the number of reserved IPs)
 *  from the given number
 */
export const SubnetMaskToAvailIPv4s = {
  0: 4294967296,
  1: 2147483648,
  2: 1073741824,
  3: 536870912,
  4: 268435456,
  5: 134217728,
  6: 67108864,
  7: 33554432,
  8: 16777216,
  9: 8388608,
  10: 4194304,
  11: 2097152,
  12: 1048576,
  13: 524288,
  14: 262144,
  15: 131072,
  16: 65536,
  17: 32768,
  18: 16384,
  19: 8192,
  20: 4096,
  21: 2048,
  22: 1024,
  23: 512,
  24: 256,
  25: 128,
  26: 64,
  27: 32,
  28: 16,
  29: 8,
  30: 4,
  31: 2,
  32: 1,
};

export const calculateAvailableIPv4sRFC1918 = (
  address: string
): number | undefined => {
  const [ip, mask] = address.split('/');
  const ipType = determineIPType(address);
  if (ipType !== 'ipv4' || mask === '' || mask === undefined) {
    return undefined;
  }

  const [firstOctet, secondOctet] = ip.split('.');
  const parsedMask = parseInt(mask, 10);
  const parsedSecondOctet = parseInt(secondOctet, 10);

  // if the IP is not in the RFC1918 ranges, hold off on displaying number of available IPs
  if (
    (firstOctet !== '10' && firstOctet !== '172' && firstOctet !== '192') ||
    (firstOctet === '10' && parsedMask < 8) ||
    (firstOctet === '172' &&
      (parsedSecondOctet < 16 || parsedSecondOctet > 31 || parsedMask < 12)) ||
    (firstOctet === '192' && secondOctet === '168' && parsedMask < 16) ||
    (firstOctet === '192' && secondOctet !== '168')
  ) {
    return undefined;
  }

  return SubnetMaskToAvailIPv4s[mask];
};
