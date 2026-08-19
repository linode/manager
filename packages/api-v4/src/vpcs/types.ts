export interface VPCIPv6 {
  range?: string;
}

export interface VPCIPv4Range {
  range?: string;
}

interface CreateVPCIPv6 extends VPCIPv6 {
  allocation_class?: string;
}

export type VPCType = 'rdma' | 'regular';

export interface VPC {
  created: string;
  description: string;
  id: number;
  ipv4?: VPCIPv4Range[];
  ipv6?: VPCIPv6[];
  label: string;
  region: string;
  subnets: Subnet[];
  updated: string;
  vpc_type: VPCType;
}

export interface CreateVPCPayload {
  description?: string;
  ipv4?: VPCIPv4Range[];
  ipv6?: CreateVPCIPv6[];
  label: string;
  region: string;
  subnets?: CreateSubnetPayload[];
  vpc_type?: VPCType;
}

export interface UpdateVPCPayload {
  description?: string;
  ipv4?: VPCIPv4Range[];
  label?: string;
}

interface VPCIPv6Subnet {
  range: string;
}

export interface CreateSubnetPayload {
  ipv4?: string;
  ipv6?: VPCIPv6Subnet[];
  label: string;
}

export interface Subnet extends CreateSubnetPayload {
  created: string;
  databases: SubnetAssignedDatabaseData[];
  id: number;
  linodes: SubnetAssignedLinodeData[];
  nodebalancers: SubnetAssignedNodeBalancerData[];
  updated: string;
}

export interface ModifySubnetPayload {
  label: string;
}

export interface SubnetLinodeInterfaceData {
  active: boolean;
  config_id: null | number;
  id: number;
}

export interface SubnetAssignedLinodeData {
  id: number;
  interfaces: SubnetLinodeInterfaceData[];
}

export interface SubnetAssignedNodeBalancerData {
  id: number;
  ipv4_range: string;
}

export interface SubnetAssignedDatabaseData {
  id: number;
  ipv4_range: string;
  ipv6_ranges: null | { range: string }[];
}

export interface VPCIP {
  active: boolean;
  address: null | string;
  address_range: null | string;
  config_id: null | number;
  gateway: null | string;
  interface_id: number;
  ipv6_addresses: {
    slaac_address: string;
  }[];
  ipv6_is_public: boolean | null;
  ipv6_range: null | string;
  linode_id: null | number;
  nat_1_1: string;
  nodebalancer_id: null | number;
  prefix: null | number;
  region: string;
  subnet_id: number;
  subnet_mask: string;
  vpc_id: number;
}
