export interface VLAN {
  id: number;
  description: string;
  region: string;
  linodes: { id: number; ip: string }[];
  cidr_block: string;
  created: string;
}

export interface CreateVLANPayload {
  description?: string;
  region: string;
  linodes?: number[];
  cidr_block?: string;
}
