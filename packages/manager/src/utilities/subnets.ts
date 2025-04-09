import { determineIPType } from '@linode/validation';

// eslint-disable-next-line sonarjs/no-hardcoded-ip
export const DEFAULT_SUBNET_IPV4_VALUE = '10.0.0.0/24';
export const RESERVED_IP_NUMBER = 4;

export const SUBNET_LINODE_CSV_HEADERS = [
  { key: 'label', label: 'Linode Label' },
  { key: 'id', label: 'Linode ID' },
  { key: 'ipv4', label: 'IPv4' },
  { key: 'interfaceData.ipv4.vpc', label: 'IPv4 VPC' },
  { key: 'interfaceData.ip_ranges', label: 'IPv4 VPC Ranges' },
];

/**
 * Maps subnet mask length to number of theoretically available IPs.
 * - To get usable IPs, subtract 2 from the given number, as the first and last
 * ips are always reserved
 * - To get available IPs for our VPCs, subtract 4 (the number of reserved IPs)
 *  from the given number
 */
export const SubnetMaskToAvailIPv4s: Record<number, number> = {
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

/**
 * Determines if the given IPv4 is an RFC1918 IP address.
 */
const isValidRFC1918IPv4 = (address: string) => {
  const [ip, mask] = address.split('/');
  const ipType = determineIPType(address);
  if (ipType !== 'ipv4' || mask === '' || mask === undefined) {
    return false;
  }

  const [firstOctet, secondOctet] = ip.split('.');
  const parsedMask = parseInt(mask, 10);
  const parsedSecondOctet = parseInt(secondOctet, 10);

  // 10.x.x.x (10/8 prefix)
  // 172.16.x.x-172.31.x.x (172/12 prefix)
  // 192.168.x.x (192.168/16 prefix)
  return (
    // check for valid 10.x IPs
    // check for valid 192.x IPs
    (firstOctet === '10' && parsedMask >= 8) ||
    // check for valid 172.x IPs
    (firstOctet === '172' &&
      parsedSecondOctet >= 16 &&
      parsedSecondOctet <= 31 &&
      parsedMask >= 12) ||
    (firstOctet === '192' && secondOctet === '168' && parsedMask >= 16)
  );
};

export const calculateAvailableIPv4sRFC1918 = (
  address: string
): number | undefined => {
  const [, mask] = address.split('/');

  // if the IP is not in the RFC1918 ranges, hold off on displaying number of available IPs
  return isValidRFC1918IPv4(address)
    ? SubnetMaskToAvailIPv4s[Number(mask)]
    : undefined;
};

/**
 * Calculates the next subnet IPv4 address to recommend when creating a subnet, based off of the last recommended ipv4 and already existing IPv4s,
 * by incrementing the third octet by one.
 *
 * @param lastRecommendedIPv4 the current IPv4 address to base our recommended IPv4 address off of
 * @param otherIPv4s the other IPv4s to check against
 * @returns the next recommended subnet IPv4 address to use
 *
 * Assumption: if @param lastRecommendedIPv4 is a valid RFC1918 IPv4 and in x.x.x.x/x format, then the output is a valid RFC1918 IPv4 in x.x.x.x/x
 * format and not already in @param otherIPv4s (excluding the default IPv4 case -- see comments below). HOWEVER, a recommended IP may still cover
 * the same range as an existing IPv4 (ex 172.16.0.0/16 and 172.16.1.0/16 cover parts of the same range) and therefore not be accepted by the backend.
 */
export const getRecommendedSubnetIPv4 = (
  lastRecommendedIPv4: string,
  otherIPv4s: string[]
): string => {
  const [firstOctet, secondOctet, thirdOctet, fourthOctet] =
    lastRecommendedIPv4.split('.');
  const parsedThirdOctet = parseInt(thirdOctet, 10);
  let ipv4ToReturn = '';

  /**
   * Return DEFAULT_SUBNET_IPV4_VALUE (10.0.0.0/24) if parsedThirdOctet + 1 would result in a nonsense ipv4 (ex. 10.0.256.0/24 is not an IPv4)
   * Realistically this case will rarely be reached and acts mainly as a safety check: a) when creating a VPC, the first recommended address is
   * always 10.0.0.0/24, and b) most people will be allowed a max of 10 subnets in their VPC, so there *should be* plenty of subnets to recommend
   */
  if (
    !isValidRFC1918IPv4(lastRecommendedIPv4) ||
    isNaN(parsedThirdOctet) ||
    parsedThirdOctet + 1 > 255
  ) {
    return DEFAULT_SUBNET_IPV4_VALUE;
  } else {
    ipv4ToReturn = `${firstOctet}.${secondOctet}.${
      parsedThirdOctet + 1
    }.${fourthOctet}`;
  }

  // if the IPv4 we've recommended already exists, we recommend a new IP
  if (
    otherIPv4s.some((ip) => {
      const [_ip] = ip.split('/');
      const [_ipv4ToReturn] = ipv4ToReturn.split('/');
      return _ip === _ipv4ToReturn;
    })
  ) {
    return getRecommendedSubnetIPv4(ipv4ToReturn, otherIPv4s);
  }

  return ipv4ToReturn;
};
