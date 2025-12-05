import type { IPDisplay } from './LinodeIPAddresses';
import type { IPTypes } from './types';
import type {
  Interface,
  IPAddress,
  LinodeInterface,
  LinodeIPsResponse,
  VPCIP,
} from '@linode/api-v4';

export const ipTableId = 'ips';

export type IPKey =
  | 'Link Local'
  | 'Private'
  | 'Public'
  | 'Reserved'
  | 'Shared'
  | 'SLAAC';

// Takes an IP Response object and returns high-level IP display rows.
export const ipResponseToDisplayRows = (inputs: {
  interfaceWithVPC?: Interface | LinodeInterface;
  ipResponse?: LinodeIPsResponse;
  isLinodeInterface: boolean;
}): IPDisplay[] => {
  const { ipResponse, isLinodeInterface, interfaceWithVPC } = inputs;
  if (!ipResponse) {
    return [];
  }

  const { ipv4, ipv6 } = ipResponse;

  const vpcIPWithNat = ipv4.vpc.find((ip) => ip.nat_1_1);
  const ipDisplay = [
    ...createPublicIPv4Display({
      publicIPv4s: ipv4.public,
      isLinodeInterface,
      interfaceWithVPC,
      vpcIPWithNat,
    }),
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

  ipDisplay.push(...createVPCIPv4Display(ipv4.vpc));

  if (ipv6?.vpc) {
    ipDisplay.push(...createVPCIPv6Display(ipv6.vpc));
  }

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

const createPublicIPv4Display = (inputs: {
  interfaceWithVPC: Interface | LinodeInterface | undefined;
  isLinodeInterface: boolean;
  publicIPv4s: IPAddress[];
  vpcIPWithNat: undefined | VPCIP;
}) => {
  const { publicIPv4s, isLinodeInterface, vpcIPWithNat, interfaceWithVPC } =
    inputs;
  let ipsToDisplay = [...publicIPv4s];

  if (vpcIPWithNat) {
    if (isLinodeInterface) {
      // for Linode Interfaces, the IPv4 nat_1_1 address is returned in both the ipv4.public and ipv4.vpc objects
      // We filter it out from ipv4.public so that it is not displayed twice
      ipsToDisplay = ipsToDisplay.filter(
        (ip) => ip.address !== vpcIPWithNat.nat_1_1
      );
    }

    if (
      !isLinodeInterface ||
      (interfaceWithVPC &&
        'default_route' in interfaceWithVPC &&
        interfaceWithVPC.default_route.ipv4)
    )
      // For legacy config profile interfaces, or cases where the vpcInterface is the default IPv4 route,
      // we hide the public IP if there is a VPC IP with 1:1 NAT (implies VPC interface with 1:1 NAT)
      ipsToDisplay.shift();
  }

  return mapIPv4Display(ipsToDisplay, 'Public');
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

const ipAdressForVPC = (
  ip: VPCIP,
  ipAdress: string,
  ipType: string
): IPAddress => {
  return {
    address: ipAdress,
    gateway: ip.gateway,
    interface_id: ip.interface_id,
    linode_id: ip.linode_id!,
    prefix: ip.prefix!,
    public: false,
    rdns: null,
    region: ip.region,
    subnet_mask: ip.subnet_mask,
    type: ipType,
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
        _ip: ipAdressForVPC(ip, ip.nat_1_1, 'VPC NAT – IPv4'),
        address: ip.nat_1_1,
        type: 'VPC NAT – IPv4',
        ...emptyProps,
      });
    }
  }
  return vpcIPDisplay;
};

export const createVPCIPv6Display = (ips: VPCIP[]): IPDisplay[] => {
  const emptyProps = {
    gateway: '',
    rdns: '',
    subnetMask: '',
  };

  const vpcIPDisplay: IPDisplay[] = [];
  for (const ip of ips) {
    if (ip.ipv6_range) {
      vpcIPDisplay.push({
        address: ip.ipv6_range,
        type: 'VPC – Range – IPv6',
        ...emptyProps,
      });
    }
    if (ip.ipv6_addresses.length > 0) {
      vpcIPDisplay.push({
        address: ip.ipv6_addresses[0].slaac_address,
        type: 'VPC – IPv6',
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
