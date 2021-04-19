export type ZoneName =
  | 'newark'
  | 'dallas'
  | 'fremont'
  | 'atlanta'
  | 'london'
  | 'tokyo'
  | 'singapore'
  | 'frankfurt'
  | 'shinagawa1'
  | 'toronto1'
  | 'mumbai1'
  | 'sydney1';

export interface IPAddress {
  address: string;
  gateway: string | null;
  subnet_mask: string;
  prefix: number;
  type: string;
  public: boolean;
  rdns: string | null;
  linode_id: number;
  region: string;
}

export interface IPRange {
  range: string;
  region: string;
  route_target: string | null;
  prefix?: number;
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
