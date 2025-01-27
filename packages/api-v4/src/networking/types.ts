export interface IPAddress {
  address: string;
  gateway: string | null;
  subnet_mask: string;
  prefix: number;
  type: string;
  public: boolean;
  rdns: string | null;
  linode_id: number;
  interface_id: number | null;
  region: string;
  vpc_nat_1_1?: {
    address: string;
    subnet_id: number;
    vpc_id: number;
  } | null;
}

export interface IPRangeBaseData {
  range: string;
  region: string;
  prefix: number;
}

export interface IPRange extends IPRangeBaseData {
  route_target: string | null;
}
export interface IPRangeInformation extends IPRangeBaseData {
  is_bgp: boolean;
  linodes: number[];
}

export interface IPSharingPayload {
  ips: string[];
  linode_id: number;
}

export interface IPAssignment {
  address: string;
  linode_id: number;
}
export interface IPAssignmentPayload {
  region: string;
  assignments: IPAssignment[];
}

export type IPv6Prefix = 56 | 64;

export interface CreateIPv6RangePayload {
  linode_id?: number;
  route_target?: string;
  prefix_length: IPv6Prefix;
}
