export interface VLAN {
  id: number;
  description: string;
  region: string;
  linodes: number[];
  cidr_block: string;
}
