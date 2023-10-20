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
  linodes: SubnetLinodeInformation[];
  created: string;
  updated: string;
}

export interface ModifySubnetPayload {
  label: string;
}

export type SubnetInterfaceInformation = Pick<Interface, 'active' | 'id'>;

export interface SubnetLinodeInformation {
  id: number;
  interfaces: SubnetInterfaceInformation[];
}
