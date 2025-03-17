interface VPCIPv6 {
  range?: string[];
}

interface CreateVPCIPV6 extends VPCIPv6 {
  // Omitted from VPC response, only permitted in requests
  allocation_class?: string[]
}

export interface VPC {
  id: number;
  label: string;
  description: string;
  region: string;
  subnets: Subnet[];
  created: string;
  updated: string;
  ipv6?: VPCIPv6[];
}

export interface CreateVPCPayload {
  label: string;
  description?: string;
  region: string;
  ipv6?: CreateVPCIPV6[];
  subnets?: CreateSubnetPayload[];
}

export interface UpdateVPCPayload {
  label?: string;
  description?: string;
}

export interface CreateSubnetPayload {
  label: string;
  ipv4?: string;
  ipv6?: string;
}

export interface Subnet extends CreateSubnetPayload {
  id: number;
  linodes: SubnetAssignedLinodeData[];
  created: string;
  updated: string;
}

export interface ModifySubnetPayload {
  label: string;
}

export interface SubnetLinodeInterfaceData {
  id: number;
  active: boolean;
  config_id: number | null;
}

export interface SubnetAssignedLinodeData {
  id: number;
  interfaces: SubnetLinodeInterfaceData[];
}

export interface VPCIP {
  active: boolean;
  address: string | null;
  address_range: string | null;
  config_id: number | null;
  gateway: string | null;
  interface_id: number;
  linode_id: number;
  nat_1_1: string;
  prefix: number | null;
  region: string;
  subnet_id: number;
  subnet_mask: string;
  vpc_id: number;
}
