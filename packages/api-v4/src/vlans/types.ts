export interface VLAN {
  label: string;
  id: number;
  region: string;
  linodes: { id: number; ipv4_address: string; mac_address: string }[];
  cidr_block: string;
  created: string;
}
