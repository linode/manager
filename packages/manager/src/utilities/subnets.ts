import { determineIPType, vpcsValidateIP } from '@linode/validation';

// VPC: TODO - added ipv6 related fields here, but they will not be used until VPCs support ipv6
interface SubnetIPState {
  ipv4?: string;
  ipv4Error?: string;
  ipv6?: string;
  ipv6Error?: string;
}

export interface SubnetFieldState {
  label: string;
  labelError?: string;
  ip: SubnetIPState;
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

export const calculateAvailableIPv4s = (
  address: string,
  ipType: SubnetIPType | undefined
): number | undefined => {
  const [, mask] = address.split('/');
  if (ipType !== 'ipv4' || mask === '' || mask === undefined) {
    return undefined;
  }

  return SubnetMaskToAvailIPv4s[mask];
};

const DEFAULT_LABEL_ERROR = 'Label is required';
const DEFAULT_IPV4_ERROR = 'The IPv4 range must be in CIDR format';

export const validateSubnets = (
  subnets: SubnetFieldState[],
  options?: {
    labelError?: string;
    ipv4Error?: string;
    ipv6Error?: string;
  }
): SubnetFieldState[] => {
  return subnets.map((subnet) => {
    if (subnet.label || subnet.ip.ipv4) {
      const errorSubnet: SubnetFieldState = { ...subnet, labelError: '' };
      if (!subnet.label) {
        errorSubnet['labelError'] = options?.labelError ?? DEFAULT_LABEL_ERROR;
      }
      if (
        determineIPType(subnet.ip.ipv4 ?? '') !== 'ipv4' ||
        !vpcsValidateIP(subnet.ip.ipv4, true)
      ) {
        const errorIP = { ...subnet.ip, ipv4Error: '' };
        errorIP['ipv4Error'] = options?.ipv4Error ?? DEFAULT_IPV4_ERROR;
        errorSubnet['ip'] = errorIP;
      }
      return errorSubnet;
    }
    return subnet;
  });
};
