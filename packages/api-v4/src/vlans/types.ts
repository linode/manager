export interface VLAN {
  cidr_block: string;
  created: string;
  id: number;
  label: string;
  linodes: { id: number; ipv4_address: string; mac_address: string }[];
  region: string;
}
