export interface VLAN {
  label: string;
  id: number;
  description: string;
  region: string;
  linodes: { id: number; ipv4_address: string; mac_address: string }[];
  cidr_block: string;
  created: string;
}

export interface CreateVLANPayload {
  description?: string;
  region: string;
  linodes?: number[];
  cidr_block?: string;
}
