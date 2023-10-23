import { Interface } from 'src/linodes';

export interface VPC {
  id: number;
  label: string;
  description: string;
  region: string;
  subnets: Subnet[];
  created: string;
  updated: string;
}

export interface CreateVPCPayload {
  label: string;
  description?: string;
  region: string;
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

export type SubnetLinodeInterfaceData = Pick<Interface, 'active' | 'id'>;

export interface SubnetAssignedLinodeData {
  id: number;
  interfaces: SubnetLinodeInterfaceData[];
}
