export interface IPAddress {
  address: string;
  gateway: null | string;
  interface_id: null | number;
  linode_id: number;
  prefix: number;
  public: boolean;
  rdns: null | string;
  region: string;
  subnet_mask: string;
  type: string;
  vpc_nat_1_1?: null | {
    address: string;
    subnet_id: number;
    vpc_id: number;
  };
}

export interface IPRangeBaseData {
  prefix: number;
  range: string;
  region: string;
}

export interface IPRange extends IPRangeBaseData {
  route_target: null | string;
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
  assignments: IPAssignment[];
  region: string;
}

export type IPv6Prefix = 56 | 64;

export interface CreateIPv6RangePayload {
  linode_id?: number;
  prefix_length: IPv6Prefix;
  route_target?: string;
}
