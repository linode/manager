import type { IPDisplay } from './LinodeIPAddresses';
import type { IPTypes } from './types';
import type { IPAddress, LinodeIPsResponse, VPCIP } from '@linode/api-v4';

export const ipTableId = 'ips';

export type IPKey =
  | 'Link Local'
  | 'Private'
  | 'Public'
  | 'Reserved'
  | 'Shared'
  | 'SLAAC';

// Takes an IP Response object and returns high-level IP display rows.
export const ipResponseToDisplayRows = (
  ipResponse?: LinodeIPsResponse
): IPDisplay[] => {
  if (!ipResponse) {
    return [];
  }

  console.log(ipResponse);

  const { ipv4, ipv6 } = ipResponse;

  const ipDisplay = [
    ...mapIPv4Display(ipv4.public, 'Public'),
    ...mapIPv4Display(ipv4.private, 'Private'),
    ...mapIPv4Display(ipv4.reserved, 'Reserved'),
    ...mapIPv4Display(ipv4.shared, 'Shared'),
  ];

  if (ipv6?.slaac) {
    ipDisplay.push(ipToDisplay(ipv6.slaac, 'SLAAC'));
  }

  if (ipv6?.link_local) {
    ipDisplay.push(ipToDisplay(ipv6?.link_local, 'Link Local'));
  }

  // If there is a VPC interface with 1:1 NAT, hide the Public IPv4 IP address row
  if (ipv4.vpc.find((vpcIp) => vpcIp.nat_1_1)) {
    ipDisplay.shift();
  }
  ipDisplay.push(...createVPCIPv4Display(ipv4.vpc));

  // IPv6 ranges and pools to display in the networking table
  ipDisplay.push(
    ...[...(ipv6 ? ipv6.global : [])].map((thisIP) => {
      /* If you want to surface rdns info in the future you have two options:
        1. Use the info we already have:
          We get info on our routed ranges from /networking/ipv6/ranges and /networking/ipv6/ranges/<id>, because the API
          only surfaces is_bgp in /networking/ipv6/ranges/<id> we need to use both, this should change in the API
          Similarly, the API only surfaces rdns info in /networking/ips/<ip>. To correlate a range and
          it's rdns info, you'll need to make an extra request to /netowrking/ips/<ip> or loop through the
          result of the request to /networking/ips and find the range info you want

        - OR -

        2. API change
          API could include RDNS info in /networking/ipv6/ranges and /networking/ipv6/ranges/<id> and
          while you're at it please ask them to add in is_bgp to /networking/ipv6/ranges as it would save a bunch of
          extra requests on Linodes with many ranges
      */
      return {
        _range: thisIP,
        address: `${thisIP.range}/${thisIP.prefix}`,
        gateway: '',
        rdns: '',
        subnetMask: '',
        type: 'Range – IPv6' as IPDisplay['type'],
      };
    })
  );

  return ipDisplay;
};

export const mapIPv4Display = (ips: IPAddress[], key: IPKey): IPDisplay[] => {
  return ips.map((ip) => ipToDisplay(ip, key));
};

export const ipToDisplay = (ip: IPAddress, key: IPKey): IPDisplay => {
  return {
    _ip: ip,
    address: ip.address,
    gateway: ip.gateway ?? '',
    rdns: ip.rdns ?? '',
    subnetMask: ip.subnet_mask ?? '',
    type: createType(ip, key) as IPTypes,
  };
};

export const createVPCIPv4Display = (ips: VPCIP[]): IPDisplay[] => {
  const emptyProps = {
    gateway: '',
    rdns: '',
    subnetMask: '',
  };

  const vpcIPDisplay: IPDisplay[] = [];
  for (const ip of ips) {
    if (ip.address_range) {
      vpcIPDisplay.push({
        address: ip.address_range,
        type: 'VPC – Range – IPv4',
        ...emptyProps,
      });
    }
    if (ip.address) {
      vpcIPDisplay.push({
        address: ip.address,
        type: 'VPC – IPv4',
        ...emptyProps,
      });
    }
    if (ip.nat_1_1) {
      vpcIPDisplay.push({
        address: ip.nat_1_1,
        type: 'VPC NAT – IPv4',
        ...emptyProps,
      });
    }
  }
  return vpcIPDisplay;
};

export const createType = (ip: IPAddress, key: IPKey) => {
  if (key === 'Reserved' && ip.type === 'ipv4') {
    return ip.public ? 'Reserved IPv4 (public)' : 'Reserved IPv4 (private)';
  }

  if (key === 'SLAAC') {
    return 'Public – IPv6 – SLAAC';
  }

  return `${key} – ${ip.type === 'ipv4' ? 'IPv4' : 'IPv6'}`;
};
