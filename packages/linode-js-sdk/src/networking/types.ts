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
  prefix?: number;
}
