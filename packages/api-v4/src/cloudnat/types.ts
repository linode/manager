interface CloudNATIPAddress {
  address: string;
}

export interface CloudNAT {
  addresses: CloudNATIPAddress[];
  id: number;
  label: string;
  port_prefix_default_len: number;
  region: string;
}

export interface CreateCloudNATPayload {
  addresses?: CloudNATIPAddress[];
  label: string;
  port_prefix_default_len?: ValidPortSize;
  region: string;
}

export interface UpdateCloudNATPayload {
  label?: string;
}

export const VALID_PORT_SIZES = [
  64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384,
] as const;

export type ValidPortSize = (typeof VALID_PORT_SIZES)[number];
