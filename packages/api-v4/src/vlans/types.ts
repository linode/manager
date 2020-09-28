export interface VLAN {
  id: number;
  description: string;
  region: string;
  linodes: number[];
  cidr_block: string;
}

export interface CreateVLANPayload {
  description?: string;
  region: string;
  linodes?: number[];
  cidr_block?: string;
}
